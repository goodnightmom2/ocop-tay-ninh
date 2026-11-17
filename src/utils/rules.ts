export interface EvidenceInput {
  title: string;
  type: string;
  source: string;
  desc: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Tạo Mã học sinh tự động tăng dần theo định dạng "HS11-xxx" (VD: 1 -> "HS11-001", 12 -> "HS11-012")
 */
export function formatStudentCodeFromSequence(seq: number): string {
  const safeSeq = Math.max(1, Math.floor(Number.isFinite(seq) ? seq : 1));
  return `HS11-${String(safeSeq).padStart(3, '0')}`;
}

/**
 * Kiểm tra xem chuỗi mã có đúng định dạng tự động "HS11-xxx" hay không
 */
export function isAutoStudentCode(raw: string): boolean {
  return /^HS11-\d{3,}$/i.test((raw || '').trim());
}

/**
 * Chuẩn hóa mã học sinh / mã nhóm (VD: " hs11-001 " -> "HS11-001")
 */
export function normalizeStudentCode(raw: string): string {
  const trimmed = (raw || '').trim().toUpperCase();
  return trimmed;
}

/**
 * Kiểm tra tính hợp lệ của Mã học sinh
 */
export function validateStudentCodeInput(raw: string): ValidationResult {
  const normalized = normalizeStudentCode(raw);
  if (!normalized) {
    return {
      valid: false,
      error: 'Vui lòng nhập Mã học sinh (Ví dụ: HS11-001).'
    };
  }
  if (normalized.length < 2) {
    return {
      valid: false,
      error: 'Mã định danh phải có ít nhất 2 ký tự.'
    };
  }
  return { valid: true };
}

/**
 * Kiểm tra tính hợp lệ khi học sinh thêm Bằng chứng mới ở Trạm 1 (Giai đoạn 2)
 */
export function validateEvidenceInput(input: EvidenceInput): ValidationResult {
  const title = (input.title || '').trim();
  const desc = (input.desc || '').trim();
  const source = (input.source || '').trim();

  if (!title) {
    return {
      valid: false,
      error: 'Vui lòng nhập tên bằng chứng hoặc tài liệu kiểm chứng.'
    };
  }
  if (!source) {
    return {
      valid: false,
      error: 'Vui lòng nhập đường dẫn nguồn hoặc trích dẫn tài liệu.'
    };
  }
  if (!desc) {
    return {
      valid: false,
      error: 'Vui lòng mô tả nội dung bằng chứng này chứng minh điều gì.'
    };
  }
  return { valid: true };
}

/**
 * Tính toán lượng máu (HP) còn lại trong Mini-Game STEM Vượt Chướng Ngại Vật
 */
export function calculateNextHP(currentHP: number, isCorrect: boolean, penalty = 25): number {
  if (isCorrect) {
    return Math.min(100, Math.max(0, currentHP));
  }
  return Math.max(0, currentHP - penalty);
}

/**
 * Phân loại trạng thái thanh máu (HP) trong Mini-Game STEM
 */
export function getHPStatusLevel(hp: number): 'nominal' | 'warning' | 'danger' {
  if (hp <= 25) return 'danger';
  if (hp <= 50) return 'warning';
  return 'nominal';
}

/**
 * Tính điểm cho tầng tháp mới xây được dựa trên độ cao và chuỗi Combo
 */
export function calculateTowerFloorPoints(floor: number, combo: number): number {
  let base = 100;
  if (floor >= 15) base = 500;
  else if (floor >= 9) base = 350;
  else if (floor >= 5) base = 200;

  const multiplier = combo >= 3 ? 2 : combo === 2 ? 1.5 : 1;
  return Math.round(base * multiplier);
}

/**
 * Đánh giá danh hiệu đạt được dựa trên độ cao của Tháp Tri Thức
 */
export function getTowerTitle(floors: number): { title: string; badge: string; color: string } {
  if (floors >= 15) {
    return {
      title: 'Huyền Thoại Tháp Tri Thức Tây Ninh',
      badge: '👑 KỶ LỤC HOÀN HẢO',
      color: 'text-purple-700 bg-purple-50 border-purple-200'
    };
  }
  if (floors >= 9) {
    return {
      title: 'Bậc Thầy Xây Tháp OCOP',
      badge: '🏆 XUẤT SẮC',
      color: 'text-amber-700 bg-amber-50 border-amber-200'
    };
  }
  if (floors >= 5) {
    return {
      title: 'Kiến Trúc Sư Tri Thức Tây Ninh',
      badge: '🏗️ THÀNH THẠO',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200'
    };
  }
  return {
    title: 'Thợ Tập Sự Xây Tháp OCOP',
    badge: '🌱 KHỞI ĐẦU',
    color: 'text-slate-700 bg-slate-50 border-slate-200'
  };
}

/**
 * Đánh giá kết quả bài kiểm tra 3 thông tin cốt lõi của Hồ sơ Mật Ong trên Bản đồ OCOP
 * Đáp án đúng: Chọn đủ 1 (Chủ thể sản xuất), 2 (Nguồn gốc), 3 (Thông tin sản phẩm) và KHÔNG chọn 4 (Màu sắc yêu thích)
 */
export function evaluateHoneyMapChecklist(selectedIds: number[]): boolean {
  const has1 = selectedIds.includes(1);
  const has2 = selectedIds.includes(2);
  const has3 = selectedIds.includes(3);
  const has4 = selectedIds.includes(4);
  return has1 && has2 && has3 && !has4 && selectedIds.length === 3;
}

/**
 * Phân loại phản hồi học tập cho Thử thách 10 câu hỏi (thu-thach.html)
 */
export function getFinalChallengeFeedback(score: number, total = 10): {
  tier: 'excellent' | 'good' | 'needs_review';
  headline: string;
  goodPoints: string[];
  reviewPoints: { station: string; detail: string; targetTab: 'nhan-dien' | 'ban-do' | 'kho-san-pham' }[];
} {
  if (score >= 8) {
    return {
      tier: 'excellent',
      headline: 'Xuất sắc! Bạn nắm vững kỹ năng kiểm chứng thông tin OCOP.',
      goodPoints: [
        'Nhận diện thông tin sản phẩm và nhãn mác rất chuẩn xác.',
        'Kỹ năng tìm và đối chiếu nguồn chính thức vững vàng.',
        'Hiểu rõ giá trị văn hóa và sự đa dạng của OCOP Tây Ninh.'
      ],
      reviewPoints: [
        {
          station: 'Trạm 1 – Không gian điều tra số',
          detail: 'Tiếp tục thực hành lập báo cáo kiểm chứng với các hồ sơ sản phẩm mới.',
          targetTab: 'nhan-dien'
        },
        {
          station: 'Trạm 2 – Bản đồ số OCOP',
          detail: 'Khám phá thêm mối liên hệ giữa thổ nhưỡng địa phương và chất lượng nông sản.',
          targetTab: 'ban-do'
        }
      ]
    };
  }

  if (score >= 5) {
    return {
      tier: 'good',
      headline: 'Khá tốt! Bạn đã nắm được nền tảng kiểm chứng cơ bản.',
      goodPoints: [
        'Biết cách đọc các thông số cơ bản trên nhãn mác.',
        'Phân biệt được nhóm thực phẩm và nhóm phi thực phẩm.'
      ],
      reviewPoints: [
        {
          station: 'Trạm 1 – Tình huống đối chiếu đa nguồn',
          detail: 'Hiểu đúng về giá trị OCOP (OCOP không phải căn cứ duy nhất để kết luận an toàn thực phẩm).',
          targetTab: 'nhan-dien'
        },
        {
          station: 'Trạm 2 – Bản đồ OCOP Tây Ninh',
          detail: 'Cách tra cứu nguồn gốc sản phẩm và chủ thể pháp lý trên bản đồ số địa phương.',
          targetTab: 'ban-do'
        }
      ]
    };
  }

  return {
    tier: 'needs_review',
    headline: 'Hoàn thành thử thách! Hãy ôn lại các trạm để củng cố kỹ năng.',
    goodPoints: [
      `Đã hoàn thành toàn bộ ${total} câu hỏi thử thách cuối hành trình.`
    ],
    reviewPoints: [
      {
        station: 'Trạm 1 – Quy trình 5 bước điều tra số',
        detail: 'Ôn lại cách phân biệt thông tin quảng cáo phóng đại và dữ liệu công bố chính thức.',
        targetTab: 'nhan-dien'
      },
      {
        station: 'Trạm 2 & Trạm 3 – Bản đồ & Kho sản phẩm',
        detail: 'Tra cứu lại hồ sơ chuẩn hóa của Mật ong, Bánh tráng, Mãng cầu và Nhang Vạn Linh Hương.',
        targetTab: 'ban-do'
      }
    ]
  };
}

export interface OcopStarEvaluation {
  totalScore: number;
  stars: 1 | 2 | 3 | 4 | 5;
  rankName: string;
  authority: string;
  description: string;
  tayNinhExample: string;
}

/**
 * Tính điểm và phân hạng Sao OCOP theo bộ tiêu chí Quốc gia (Thang điểm 100):
 * - Phần A: Sản phẩm & Sức mạnh cộng đồng (tối đa 40 điểm)
 * - Phần B: Khả năng tiếp thị & Câu chuyện sản phẩm (tối đa 25 điểm)
 * - Phần C: Chất lượng sản phẩm & Tiêu chuẩn (tối đa 35 điểm)
 */
export function calculateOcopStarRating(
  partA: number,
  partB: number,
  partC: number
): OcopStarEvaluation {
  const safeA = Math.min(40, Math.max(0, Math.round(partA)));
  const safeB = Math.min(25, Math.max(0, Math.round(partB)));
  const safeC = Math.min(35, Math.max(0, Math.round(partC)));
  const totalScore = safeA + safeB + safeC;

  if (totalScore >= 90) {
    return {
      totalScore,
      stars: 5,
      rankName: 'OCOP 5 Sao (Cấp Quốc Gia)',
      authority: 'Bộ Nông nghiệp và Môi trường / Hội đồng OCOP Trung ương cấp chứng nhận',
      description:
        'Sản phẩm đặc sắc, chất lượng cao, đáp ứng tiêu chuẩn quốc tế (ISO 22000, HACCP), sẵn sàng xuất khẩu toàn cầu.',
      tayNinhExample:
        'Bánh tráng siêu mỏng Tân Nhiên (Phường Long Hoa – Phường Trảng Bàng, tỉnh Tây Ninh).'
    };
  }

  if (totalScore >= 70) {
    return {
      totalScore,
      stars: 4,
      rankName: 'OCOP 4 Sao (Cấp Tỉnh nâng cao)',
      authority: 'UBND Tỉnh Tây Ninh cấp Quyết định công nhận (hiệu lực 36 tháng)',
      description:
        'Sản phẩm tiêu biểu của tỉnh, chất lượng ổn định, bao bì truy xuất nguồn gốc rõ ràng, có tiềm năng nâng cấp lên 5 sao.',
      tayNinhExample:
        'Mật ong rừng & hoa cao su (Xã Tân Biên – Xã Tân Châu), Mãng cầu Bà Đen VietGAP (Phường Bình Minh – Xã Tân Phú).'
    };
  }

  if (totalScore >= 50) {
    return {
      totalScore,
      stars: 3,
      rankName: 'OCOP 3 Sao (Cấp Tỉnh tiêu chuẩn)',
      authority: 'UBND Tỉnh Tây Ninh cấp Quyết định công nhận (hiệu lực 36 tháng)',
      description:
        'Sản phẩm đặc thù địa phương đạt chuẩn an toàn, có hồ sơ công bố chất lượng và bao bì nhãn mác đúng quy định.',
      tayNinhExample:
        'Muối ớt tôm truyền thống và các sản phẩm làng nghề tại Phường Tân Ninh, Phường Hòa Thành.'
    };
  }

  if (totalScore >= 30) {
    return {
      totalScore,
      stars: 2,
      rankName: 'OCOP 2 Sao (Tiềm năng hoàn thiện)',
      authority: 'Hội đồng đánh giá cơ sở ghi nhận, chưa đủ điểm cấp chứng nhận OCOP cấp tỉnh (tối thiểu 3 sao)',
      description:
        'Sản phẩm mới hình thành, cần hoàn thiện thêm hồ sơ an toàn thực phẩm, tem truy xuất mã QR và câu chuyện sản phẩm.',
      tayNinhExample:
        'Cơ sở nhỏ lẻ đang trong quá trình chuẩn hóa bao bì tại địa phương.'
    };
  }

  return {
    totalScore,
    stars: 1,
    rankName: 'OCOP 1 Sao (Khởi đầu)',
    authority: 'Hội đồng cơ sở hướng dẫn ươm tạo sản phẩm',
    description:
      'Sản phẩm thô sơ, sản xuất nhỏ lẻ hộ gia đình, cần được hỗ trợ đăng ký kinh doanh và kiểm nghiệm chất lượng.',
    tayNinhExample:
      'Sản phẩm nông hộ tự tiêu chưa qua đăng ký tiêu chuẩn.'
  };
}

export interface MapCoordinate {
  x: number;
  y: number;
}

export interface MapRouteGeometry {
  from: MapCoordinate;
  to: MapCoordinate;
  controlPoint: MapCoordinate;
  midPoint: MapCoordinate;
  svgPath: string;
  distanceKm: number;
}

/**
 * Tính toán điểm nội suy trên đường cong Bézier bậc 2 tại tham số t in [0, 1]
 */
export function interpolateBezierPoint(
  from: MapCoordinate,
  controlPoint: MapCoordinate,
  to: MapCoordinate,
  t: number
): MapCoordinate {
  const clampedT = Math.min(1, Math.max(0, t));
  const inv = 1 - clampedT;
  const x = inv * inv * from.x + 2 * inv * clampedT * controlPoint.x + clampedT * clampedT * to.x;
  const y = inv * inv * from.y + 2 * inv * clampedT * controlPoint.y + clampedT * clampedT * to.y;
  return {
    x: Number(x.toFixed(2)),
    y: Number(y.toFixed(2))
  };
}

/**
 * Tạo đường đi cong mượt (SVG Quadratic Bézier) nối từ sản phẩm hiện tại đến sản phẩm tiếp theo trên Bản đồ OCOP
 */
export function computeMapRoute(from: MapCoordinate, to: MapCoordinate): MapRouteGeometry {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const rawDist = Math.hypot(dx, dy);

  // Tạo độ võng tự nhiên cho đường đi trên bản đồ
  const offsetY = rawDist > 1 ? -Math.min(14, Math.max(6, rawDist * 0.22)) : 0;
  const offsetX = dy > 0 ? 4 : -4;

  const controlPoint: MapCoordinate = {
    x: Number(((from.x + to.x) / 2 + (rawDist > 1 ? offsetX : 0)).toFixed(2)),
    y: Number((Math.max(8, (from.y + to.y) / 2 + offsetY)).toFixed(2))
  };

  const midPoint = interpolateBezierPoint(from, controlPoint, to, 0.5);
  const svgPath = `M ${from.x} ${from.y} Q ${controlPoint.x} ${controlPoint.y} ${to.x} ${to.y}`;
  const distanceKm = rawDist < 0.5 ? 0 : Math.max(4, Math.round(rawDist * 0.85));

  return {
    from,
    to,
    controlPoint,
    midPoint,
    svgPath,
    distanceKm
  };
}

export interface ProductPhotoRecord {
  productKey: string;
  dataUrl: string;
  fileName: string;
  capturedAt: string;
  source: 'camera' | 'upload';
}

export interface FileLikeMetadata {
  name: string;
  type: string;
  size: number;
}

const VALID_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.svg', '.heic', '.heif', '.avif'];

/**
 * Kiểm tra file ảnh người dùng chọn hoặc vừa chụp bằng điện thoại trong Kho sản phẩm
 */
export function validateProductImageFile(file: FileLikeMetadata | null | undefined): ValidationResult {
  if (!file || !file.name) {
    return {
      valid: false,
      error: 'Vui lòng chọn một file ảnh sản phẩm hoặc chụp ảnh mới.'
    };
  }

  const lowerName = file.name.toLowerCase().trim();
  const isImageMime = typeof file.type === 'string' && file.type.toLowerCase().startsWith('image/');
  const hasImageExt = VALID_IMAGE_EXTENSIONS.some((ext) => lowerName.endsWith(ext));

  if (!isImageMime && !hasImageExt) {
    return {
      valid: false,
      error: 'File đã chọn không phải định dạng hình ảnh hợp lệ (hỗ trợ JPG, PNG, WEBP, HEIC...).'
    };
  }

  const maxBytes = 25 * 1024 * 1024; // 25MB
  if (typeof file.size === 'number' && file.size > maxBytes) {
    return {
      valid: false,
      error: 'Dung lượng ảnh quá lớn (tối đa 25MB). Vui lòng chọn ảnh khác.'
    };
  }

  return { valid: true };
}

/**
 * Cập nhật ảnh chụp sản phẩm vào Bộ sưu tập sản phẩm trong Kho sản phẩm
 */
export function upsertProductPhotoCollection(
  collection: Record<string, ProductPhotoRecord>,
  record: ProductPhotoRecord
): Record<string, ProductPhotoRecord> {
  if (!record || !record.productKey || !record.dataUrl) {
    return { ...collection };
  }
  return {
    ...collection,
    [record.productKey]: { ...record }
  };
}

/**
 * Xóa một ảnh sản phẩm khỏi Bộ sưu tập sản phẩm
 */
export function removeProductPhotoFromCollection(
  collection: Record<string, ProductPhotoRecord>,
  productKey: string
): Record<string, ProductPhotoRecord> {
  const next = { ...collection };
  delete next[productKey];
  return next;
}

/**
 * Tính tiến độ sưu tầm ảnh thực tế của Bộ sưu tập 6 sản phẩm OCOP
 */
export function getCollectionProgressSummary(
  collection: Record<string, ProductPhotoRecord>,
  totalProducts = 6
): {
  collectedCount: number;
  totalProducts: number;
  percentage: number;
  isComplete: boolean;
} {
  const safeTotal = Math.max(1, totalProducts);
  const collectedCount = Object.keys(collection || {}).filter(
    (k) => Boolean(collection[k] && collection[k].dataUrl)
  ).length;
  const clampedCount = Math.min(safeTotal, collectedCount);
  const percentage = Math.round((clampedCount / safeTotal) * 100);

  return {
    collectedCount: clampedCount,
    totalProducts: safeTotal,
    percentage,
    isComplete: clampedCount >= safeTotal
  };
}

export interface ImageColorSignals {
  avgR: number;
  avgG: number;
  avgB: number;
}

export type RecognizedOcopKey =
  | 'honey'
  | 'custardapple'
  | 'ricepaper'
  | 'shrimpsalt'
  | 'birdsnest'
  | 'incense';

export interface OcopRecognitionResult {
  productKey: RecognizedOcopKey;
  productName: string;
  category: 'Thực phẩm' | 'Thủ công mỹ nghệ & Lưu niệm';
  productTypeDetail: string;
  mascotName: string;
  ocopRating: string;
  detectedFeatures: string;
  confidence: number;
  method: 'ai-vision' | 'smart-visual';
}

const PRODUCT_RECOGNITION_METADATA: Record<
  RecognizedOcopKey,
  Omit<OcopRecognitionResult, 'detectedFeatures' | 'confidence' | 'method'>
> = {
  honey: {
    productKey: 'honey',
    productName: 'MẬT ONG BẢO AN',
    category: 'Thực phẩm',
    productTypeDetail: 'Thực phẩm thiên nhiên · Mật ong rừng & Hoa sao dầu OCOP 4 sao',
    mascotName: 'Mật ong – Con Ong',
    ocopRating: 'OCOP 4 Sao (Đợt 2/2024)'
  },
  custardapple: {
    productKey: 'custardapple',
    productName: 'MÃNG CẦU BÀ ĐEN',
    category: 'Thực phẩm',
    productTypeDetail: 'Thực phẩm tươi / Nông sản đặc sản VietGAP',
    mascotName: 'Mãng cầu – Con Sâu',
    ocopRating: 'OCOP 4 Sao (Phường Bình Minh – Xã Tân Phú)'
  },
  ricepaper: {
    productKey: 'ricepaper',
    productName: 'BÁNH TRÁNG TÂN NHIÊN',
    category: 'Thực phẩm',
    productTypeDetail: 'Bánh tráng siêu mỏng (OCOP 5 Sao Quốc gia) & Bánh tráng trộn (OCOP 3 Sao)',
    mascotName: 'Bánh tráng – Con Sóc',
    ocopRating: 'OCOP 5 Sao Quốc Gia & OCOP 3 Sao Tỉnh'
  },
  shrimpsalt: {
    productKey: 'shrimpsalt',
    productName: 'MUỐI TÔM THẮNG LỢI',
    category: 'Thực phẩm',
    productTypeDetail: 'Thực phẩm / Gia vị · Cơ sở sản xuất Muối Thắng Lợi',
    mascotName: 'Muối tôm – Con Tôm',
    ocopRating: 'OCOP 3 Sao (Ấp Bình Hòa, Xã Châu Thành, Tây Ninh)'
  },
  birdsnest: {
    productKey: 'birdsnest',
    productName: 'YẾN SÀO YẾN LOAN',
    category: 'Thực phẩm',
    productTypeDetail: 'Yến sào sơ chế thủ công · Công ty TNHH Loan Phát Huy',
    mascotName: 'Yến sào – Con Yến',
    ocopRating: 'OCOP 4 Sao (Duy trì giai đoạn 2026 – 2029)'
  },
  incense: {
    productKey: 'incense',
    productName: 'NHANG VẠN LINH HƯƠNG',
    category: 'Thủ công mỹ nghệ & Lưu niệm',
    productTypeDetail: '3 dòng sản phẩm Nhang thảo mộc tự nhiên · Cơ sở Vạn Linh Hương',
    mascotName: 'Nhang – Con Rồng',
    ocopRating: 'OCOP 3 Sao (Phường Long Hoa)'
  }
};

export function getRecognitionMetadataByKey(
  key: RecognizedOcopKey,
  detectedFeatures?: string,
  confidence = 95,
  method: 'ai-vision' | 'smart-visual' = 'smart-visual'
): OcopRecognitionResult {
  const base = PRODUCT_RECOGNITION_METADATA[key] || PRODUCT_RECOGNITION_METADATA.honey;
  return {
    ...base,
    detectedFeatures:
      detectedFeatures ||
      `Hệ thống nhận diện hình ảnh thuộc sản phẩm ${base.productName} (${base.productTypeDetail}).`,
    confidence,
    method
  };
}

function stripVietnameseAccents(str: string): string {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

/**
 * Tự động nhận diện sản phẩm OCOP và phân loại ngành hàng từ tên file / tín hiệu màu sắc hình ảnh
 */
export function recognizeOcopProductFromSignals(
  fileName: string,
  colorSignals?: ImageColorSignals
): OcopRecognitionResult {
  const normalizedName = stripVietnameseAccents(fileName || '');

  // 1. Nhận diện qua từ khóa đặc trưng nếu có trong tên file hoặc nhãn ảnh
  if (
    normalizedName.includes('banh-trang') ||
    normalizedName.includes('banhtrang') ||
    normalizedName.includes('banh trang') ||
    normalizedName.includes('rice') ||
    normalizedName.includes('tan-nhien') ||
    normalizedName.includes('phoi-suong') ||
    normalizedName.includes('squirrel') ||
    normalizedName.includes('soc') ||
    normalizedName.includes('card3') ||
    normalizedName.includes('sp2')
  ) {
    return getRecognitionMetadataByKey(
      'ricepaper',
      'Nhận diện đặc trưng bao bì & xấp Bánh tráng Tây Ninh (Nhóm Thực phẩm chế biến – OCOP 5 Sao Quốc Gia).',
      97,
      'smart-visual'
    );
  }

  if (
    normalizedName.includes('mang-cau') ||
    normalizedName.includes('mangcau') ||
    normalizedName.includes('mang cau') ||
    normalizedName.includes('custard') ||
    normalizedName.includes('ba-den') ||
    normalizedName.includes('minh-trung') ||
    normalizedName.includes('sau') ||
    normalizedName.includes('card2') ||
    normalizedName.includes('sp3')
  ) {
    return getRecognitionMetadataByKey(
      'custardapple',
      'Nhận diện hình thái quả Mãng cầu Bà Đen vỏ xanh gai nở phẳng (Nhóm Thực phẩm tươi / Nông sản VietGAP – OCOP 4 Sao).',
      96,
      'smart-visual'
    );
  }

  if (
    normalizedName.includes('muoi-tom') ||
    normalizedName.includes('muoitom') ||
    normalizedName.includes('muoi tom') ||
    normalizedName.includes('muoi-ot') ||
    normalizedName.includes('thang-loi') ||
    normalizedName.includes('thangloi') ||
    normalizedName.includes('shrimp') ||
    normalizedName.includes('tom') ||
    normalizedName.includes('sp5')
  ) {
    return getRecognitionMetadataByKey(
      'shrimpsalt',
      'Nhận diện hạt muối sắc đỏ cam giòn tan của Muối tôm Thắng Lợi Tây Ninh (Cơ sở Muối Thắng Lợi – OCOP 3 Sao).',
      96,
      'smart-visual'
    );
  }

  if (
    normalizedName.includes('yen-sao') ||
    normalizedName.includes('yensao') ||
    normalizedName.includes('yen sao') ||
    normalizedName.includes('yen-loan') ||
    normalizedName.includes('yenloan') ||
    normalizedName.includes('to-yen') ||
    normalizedName.includes('bird') ||
    normalizedName.includes('nest') ||
    normalizedName.includes('swallow') ||
    normalizedName.includes('yen')
  ) {
    return getRecognitionMetadataByKey(
      'birdsnest',
      'Nhận diện sợi tổ yến trắng ngà / hộp Yến sào Yến Loan Tây Ninh (Công ty TNHH Loan Phát Huy – OCOP 4 Sao duy trì giai đoạn 2026–2029).',
      95,
      'smart-visual'
    );
  }

  if (
    normalizedName.includes('nhang') ||
    normalizedName.includes('van-linh') ||
    normalizedName.includes('vanlinh') ||
    normalizedName.includes('incense') ||
    normalizedName.includes('thao-moc') ||
    normalizedName.includes('dragon') ||
    normalizedName.includes('rong') ||
    normalizedName.includes('card4') ||
    normalizedName.includes('sp4')
  ) {
    return getRecognitionMetadataByKey(
      'incense',
      'Nhận diện bó Nhang Vạn Linh Hương tự nhiên (Nhóm Thủ công mỹ nghệ – 3 dòng sản phẩm OCOP 3 Sao).',
      96,
      'smart-visual'
    );
  }

  if (
    normalizedName.includes('mat-ong') ||
    normalizedName.includes('matong') ||
    normalizedName.includes('mat ong') ||
    normalizedName.includes('bao-an') ||
    normalizedName.includes('baoan') ||
    normalizedName.includes('honey') ||
    normalizedName.includes('bee') ||
    normalizedName.includes('ong') ||
    normalizedName.includes('card1') ||
    normalizedName.includes('sp1')
  ) {
    return getRecognitionMetadataByKey(
      'honey',
      'Nhận diện sắc vàng óng của Mật ong Bảo An Tây Ninh (Công ty TNHH MTV Ong Mật Bảo An Tây Ninh – OCOP 4 Sao).',
      97,
      'smart-visual'
    );
  }

  // 2. Nếu tên file là ảnh chụp điện thoại ngẫu nhiên (VD: IMG_2026.jpg), phân tích phổ màu sắc (RGB) của ảnh
  if (colorSignals) {
    const { avgR, avgG, avgB } = colorSignals;

    // Sắc xanh lá chủ đạo -> Mãng cầu Bà Đen
    if (avgG > avgR + 6 && avgG > avgB + 10) {
      return getRecognitionMetadataByKey(
        'custardapple',
        'Phân tích thị giác: Sắc xanh tự nhiên đặc trưng của nông sản Mãng cầu Bà Đen (Loại: Thực phẩm tươi / Nông sản OCOP 4 Sao).',
        91,
        'smart-visual'
      );
    }

    // Sắc đỏ cam đậm -> Muối tôm Thắng Lợi Tây Ninh
    if (avgR > 160 && avgR - avgG > 32 && avgR - avgB > 55) {
      return getRecognitionMetadataByKey(
        'shrimpsalt',
        'Phân tích thị giác: Sắc cam đỏ gạch đặc trưng của hạt Muối tôm Thắng Lợi Tây Ninh (Loại: Thực phẩm / Gia vị truyền thống OCOP 3 Sao).',
        92,
        'smart-visual'
      );
    }

    // Sắc trắng sáng / trắng ngà rất cao -> Bánh tráng Tây Ninh
    if (avgR > 205 && avgG > 200 && avgB > 188) {
      return getRecognitionMetadataByKey(
        'ricepaper',
        'Phân tích thị giác: Bề mặt mỏng trong đặc trưng của Bánh tráng siêu mỏng Tân Nhiên (OCOP 5 Sao Quốc Gia & Bánh tráng trộn OCOP 3 Sao).',
        90,
        'smart-visual'
      );
    }

    // Sắc vàng hổ phách ấm -> Mật ong Bảo An Tây Ninh
    if (avgR > 155 && avgG > 115 && avgR >= avgG && avgG - avgB > 30) {
      return getRecognitionMetadataByKey(
        'honey',
        'Phân tích thị giác: Sắc vàng mật hổ phách đặc trưng của Mật ong Bảo An Tây Ninh (Loại: Thực phẩm thiên nhiên OCOP 4 Sao).',
        92,
        'smart-visual'
      );
    }

    // Sắc kem ngà dịu -> Yến sào Yến Loan Tây Ninh
    if (avgR > 175 && avgG > 165 && avgB > 140) {
      return getRecognitionMetadataByKey(
        'birdsnest',
        'Phân tích thị giác: Sắc trắng ngà sợi yến của Yến sào Yến Loan Tây Ninh (Loại: Thực phẩm bổ dưỡng cao cấp OCOP 4 Sao giai đoạn 2026–2029).',
        89,
        'smart-visual'
      );
    }

    // Tông nâu trầm -> Nhang Vạn Linh Hương
    return getRecognitionMetadataByKey(
      'incense',
      'Phân tích thị giác: Tông màu gỗ trầm của Nhang Vạn Linh Hương (Loại: Thủ công mỹ nghệ & Lưu niệm OCOP 3 Sao).',
      89,
      'smart-visual'
    );
  }

  return getRecognitionMetadataByKey(
    'honey',
    'Nhận diện sản phẩm tiêu biểu thuộc nhóm Thực phẩm OCOP Tây Ninh.',
    90,
    'smart-visual'
  );
}




