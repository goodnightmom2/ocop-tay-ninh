import { GoogleGenAI, Type } from '@google/genai';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  ImageColorSignals,
  RecognizedOcopKey,
  formatStudentCodeFromSequence,
  getRecognitionMetadataByKey,
  recognizeOcopProductFromSignals
} from './src/utils/rules';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const COUNTER_FILE = path.join(__dirname, '.student-seq.json');

const VALID_PRODUCT_KEYS: RecognizedOcopKey[] = [
  'honey',
  'custardapple',
  'ricepaper',
  'shrimpsalt',
  'birdsnest',
  'incense'
];

function getNextStudentSequence(): number {
  let current = 0;
  try {
    if (fs.existsSync(COUNTER_FILE)) {
      const raw = fs.readFileSync(COUNTER_FILE, 'utf-8');
      const parsed = JSON.parse(raw) as { seq?: number };
      if (typeof parsed.seq === 'number' && parsed.seq >= 0) {
        current = parsed.seq;
      }
    }
  } catch {
    current = 0;
  }

  const next = current + 1;
  try {
    fs.writeFileSync(COUNTER_FILE, JSON.stringify({ seq: next }, null, 2), 'utf-8');
  } catch {
    // ignore write errors in read-only environments
  }
  return next;
}

// Quản lý bộ nhớ giới hạn tần suất yêu cầu (In-memory Rate Limiting)
interface RateLimitRecord {
  count: number;
  resetTime: number;
}
const rateLimitMap = new Map<string, RateLimitRecord>();

function rateLimiter(windowMs: number, maxRequests: number, label: string) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.socket.remoteAddress) || '127.0.0.1';
    const key = `${ip}:${label}`;
    const now = Date.now();

    const record = rateLimitMap.get(key);
    if (!record || now > record.resetTime) {
      rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (record.count >= maxRequests) {
      res.status(429).json({
        error: 'Too Many Requests',
        message: 'Bạn đang thao tác quá nhanh, vui lòng đợi trong giây lát rồi thử lại.'
      });
      return;
    }

    record.count += 1;
    next();
  };
}

// Định kỳ dọn dẹp bộ nhớ đệm rate limit
setInterval(() => {
  const now = Date.now();
  for (const [k, rec] of rateLimitMap.entries()) {
    if (now > rec.resetTime) {
      rateLimitMap.delete(k);
    }
  }
}, 120000);

// Làm sạch tên file và chống Prompt Injection
function sanitizeFileName(rawName?: string): string {
  if (!rawName || typeof rawName !== 'string') return '';
  return rawName
    .slice(0, 60)
    .replace(/[^\p{L}\p{N}\s._-]/gu, '')
    .trim();
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // 1. Tắt header tiết lộ công nghệ máy chủ (Information Disclosure)
  app.disable('x-powered-by');

  // 2. Thiết lập các HTTP Security Headers tiêu chuẩn OWASP
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(self), microphone=(), geolocation=()');
    next();
  });

  // 3. Giới hạn dung lượng tải lên tối đa 8MB để ngăn ngừa tấn công DoS/Memory Exhaustion
  app.use(express.json({ limit: '8mb' }));

  // API cấp Mã Học Sinh tự động tăng dần (Giới hạn tối đa 30 lần / phút / IP)
  app.post(
    '/api/allocate-student-code',
    rateLimiter(60000, 30, 'allocate-code'),
    (_req, res) => {
      const seq = getNextStudentSequence();
      const studentCode = formatStudentCodeFromSequence(seq);
      res.json({ sequence: seq, studentCode });
    }
  );

  // API nhận diện tự động sản phẩm OCOP Tây Ninh (Giới hạn tối đa 20 lần / phút / IP để bảo vệ quota AI)
  app.post(
    '/api/recognize-ocop-product',
    rateLimiter(60000, 20, 'recognize-product'),
    async (req, res) => {
      const { imageDataUrl, fileName, colorSignals } = (req.body || {}) as {
        imageDataUrl?: string;
        fileName?: string;
        colorSignals?: ImageColorSignals;
      };

      const safeFileName = sanitizeFileName(fileName);

      const fallbackRecognition = recognizeOcopProductFromSignals(
        safeFileName,
        colorSignals
      );

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || !imageDataUrl || typeof imageDataUrl !== 'string') {
        res.json({ recognition: fallbackRecognition });
        return;
      }

      // Giới hạn độ dài chuỗi base64 tối đa 8MB
      if (imageDataUrl.length > 8 * 1024 * 1024) {
        res.status(413).json({ error: 'Ảnh tải lên vượt quá dung lượng cho phép (tối đa 8MB).' });
        return;
      }

      try {
        // Chỉ chấp nhận các định dạng ảnh an toàn (jpeg, png, webp) - từ chối svg hoặc script
        const match = imageDataUrl.match(/^data:(image\/(?:jpeg|png|webp|jpg));base64,([A-Za-z0-9+/=]+)$/);
        if (!match) {
          res.json({ recognition: fallbackRecognition });
          return;
        }

        const mimeType = match[1];
        const base64Data = match[2];

        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build'
            }
          }
        });

        const promptText = `Bạn là chuyên gia nhận diện sản phẩm OCOP tỉnh Tây Ninh.
Hãy quan sát bức ảnh này (có thể là ảnh chụp sản phẩm thực tế, bao bì, nhãn mác hoặc hình minh họa linh vật) và xác định xem ảnh này thuộc sản phẩm nào trong 6 sản phẩm OCOP tiêu biểu của Tây Ninh dưới đây:
1. "honey": Mật ong Bảo An Tây Ninh (Công ty TNHH MTV Ong Mật Bảo An Tây Ninh, chai/hũ mật vàng, con ong) - Loại: Thực phẩm
2. "custardapple": Mãng cầu Bà Đen Tây Ninh (quả na / mãng cầu xanh, vườn mãng cầu, con sâu xanh) - Loại: Thực phẩm
3. "ricepaper": Bánh tráng Tây Ninh (bánh tráng phơi sương, bánh tráng siêu mỏng Tân Nhiên, xấp bánh tráng trắng, con sóc) - Loại: Thực phẩm
4. "shrimpsalt": Muối tôm Thắng Lợi Tây Ninh (OCOP 3 sao, Cơ sở Muối Thắng Lợi, hũ muối tôm màu đỏ cam, con tôm) - Loại: Thực phẩm
5. "birdsnest": Yến sào Yến Loan Tây Ninh (OCOP 4 sao, Công ty TNHH Loan Phát Huy, tổ yến trắng ngà, hũ yến chưng, chim yến) - Loại: Thực phẩm
6. "incense": Nhang Vạn Linh Hương Tây Ninh (bó nhang thảo mộc, hộp nhang, làng nghề nhang, con rồng) - Loại: Thủ công mỹ nghệ & Lưu niệm

Gợi ý tên tệp: "${safeFileName}". Nếu chi tiết trong ảnh gợi ý rõ sản phẩm nào, hãy chọn chính xác mã productKey của sản phẩm đó và mô tả ngắn gọn (1 câu tiếng Việt) dấu hiệu nhận biết sản phẩm và phân loại của nó.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Data
              }
            },
            {
              text: promptText
            }
          ]
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              productKey: {
                type: Type.STRING,
                description:
                  'One of: honey, custardapple, ricepaper, shrimpsalt, birdsnest, incense'
              },
              detectedFeatures: {
                type: Type.STRING,
                description:
                  'Mô tả ngắn gọn 1 câu bằng tiếng Việt về đặc điểm nhận diện sản phẩm và loại sản phẩm trong ảnh.'
              },
              confidence: {
                type: Type.INTEGER,
                description: 'Độ tin cậy từ 85 đến 99'
              }
            },
            required: ['productKey', 'detectedFeatures', 'confidence']
          }
        }
      });

      const rawJson = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawJson) as {
        productKey?: string;
        detectedFeatures?: string;
        confidence?: number;
      };

      const candidateKey = (parsed.productKey || '').trim() as RecognizedOcopKey;
      if (VALID_PRODUCT_KEYS.includes(candidateKey)) {
        const aiResult = getRecognitionMetadataByKey(
          candidateKey,
          parsed.detectedFeatures,
          typeof parsed.confidence === 'number' ? parsed.confidence : 96,
          'ai-vision'
        );
        res.json({ recognition: aiResult });
        return;
      }

      res.json({ recognition: fallbackRecognition });
    } catch {
      res.json({ recognition: fallbackRecognition });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
