import React, { useState, useEffect } from 'react';
import { calculateOcopStarRating } from '../utils/rules';
import { logEvent, updateLearningProgress } from '../utils/tracker';
import { playSfxCorrect, playSfxVictory } from '../utils/sound';
import { fireConfetti } from '../utils/confetti';
import { StationTab } from './TopNav';

interface InvestigationViewProps {
  studentCode: string;
  onNavigateStation: (tab: StationTab, stationLogName: string) => void;
}

interface WelcomeBubble {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  colorClass: string;
  icon?: string;
}

const BUBBLE_STYLES = [
  'bg-gradient-to-tr from-amber-300/75 via-yellow-200/80 to-white/90 border border-amber-400/60 shadow-md',
  'bg-gradient-to-tr from-emerald-300/70 via-teal-100/80 to-white/90 border border-emerald-400/60 shadow-md',
  'bg-gradient-to-tr from-sky-300/70 via-cyan-100/80 to-white/90 border border-sky-400/60 shadow-md',
  'bg-gradient-to-tr from-orange-300/70 via-amber-100/85 to-white/90 border border-orange-400/60 shadow-md'
];

const BUBBLE_ICONS = ['🐝', '⭐', '🍯', '🌿', '✨', '', '', ''];

function createBubbleWave(batchSeed: number): WelcomeBubble[] {
  return Array.from({ length: 44 }, (_, idx) => {
    const left = (idx * 2.25 + ((idx * 7) % 9)) % 96;
    const size = 30 + ((idx * 13) % 48);
    const duration = 3.8 + ((idx * 5) % 26) / 10;
    // Negative delay on half of the bubbles so they immediately fill the top, middle, and bottom of the screen on click
    const delay = idx % 2 === 0 ? -(((idx * 3) % 28) / 10) : ((idx * 2) % 16) / 10;
    const colorClass = BUBBLE_STYLES[idx % BUBBLE_STYLES.length];
    const icon = BUBBLE_ICONS[idx % BUBBLE_ICONS.length];
    return {
      id: batchSeed * 100 + idx,
      left,
      size,
      duration,
      delay,
      colorClass,
      icon
    };
  });
}

interface BeeSpeechChapter {
  id: number;
  badge: string;
  title: string;
  greetingLine: string;
  speechBody: string;
  keyTakeaway: string;
}

const BEE_SPEECH_CHAPTERS: BeeSpeechChapter[] = [
  {
    id: 1,
    badge: 'Lời chào từ Ong Vàng',
    title: 'Xin chào! Mình là Ong Vàng Tây Ninh',
    greetingLine:
      'Vo ve... Xin chào bạn nhỏ! Chào mừng bạn đã đến với Trạm 1: Nhận Diện OCOP!',
    speechBody:
      'Mình là Ong Vàng đến từ những cánh rừng hoa tràm và vườn cây trái trù phú tại Xã Tân Biên, Xã Tân Châu, Phường Bình Minh và Phường Tân Ninh, tỉnh Tây Ninh! Hôm nay mình sẽ bật mí cho bạn hiểu rõ: OCOP là gì, ý nghĩa của từng chữ cái trên logo OCOP và làm thế nào để một sản phẩm quê hương được chấm điểm gắn từ 3 sao đến 5 sao nhé!',
    keyTakeaway:
      'Hãy bấm vào từng chủ đề bên dưới để nghe mình kể chuyện, hoặc cuộn xuống khám phá bảng phân hạng Sao OCOP!'
  },
  {
    id: 2,
    badge: 'Khái niệm cốt lõi',
    title: 'OCOP là gì? Giải mã 4 chữ cái O - C - O - P',
    greetingLine:
      'Bạn có biết cụm từ OCOP xuất hiện trên bao bì đặc sản viết tắt của từ tiếng Anh nào không?',
    speechBody:
      'OCOP là viết tắt của cụm từ tiếng Anh "One Commune One Product" — dịch sang tiếng Việt nghĩa là "Mỗi xã (hoặc phường) một sản phẩm". Đây là Chương trình mục tiêu quốc gia phát triển kinh tế nông thôn do Thủ tướng Chính phủ ban hành từ năm 2018, lấy cảm hứng từ phong trào OVOP (One Village One Product) nổi tiếng của Nhật Bản.',
    keyTakeaway:
      'Mục tiêu của OCOP là giúp mỗi địa phương (như Phường Tân Ninh, Phường Long Hoa, Phường Trảng Bàng, Xã Tân Biên...) phát huy tài nguyên bản địa và bàn tay khéo léo của người dân để tạo ra sản phẩm chất lượng cao!'
  },
  {
    id: 3,
    badge: '6 Nhóm ngành & Logo',
    title: 'Sản phẩm OCOP gồm những nhóm nào & Cách nhìn Tem OCOP?',
    greetingLine:
      'Không chỉ có đồ ăn đâu nhé! Chương trình OCOP Việt Nam phân thành 6 nhóm ngành sản phẩm chính thức:',
    speechBody:
      '(1) Thực phẩm (như Mật ong Xã Tân Biên, Bánh tráng Phường Trảng Bàng, Mãng cầu Phường Bình Minh); (2) Đồ uống; (3) Dược liệu & sản phẩm từ dược liệu; (4) Hàng thủ công mỹ nghệ (như Nhang Vạn Linh Hương tại Phường Long Hoa); (5) Sinh vật cảnh; và (6) Dịch vụ du lịch cộng đồng, du lịch sinh thái và điểm du lịch.',
    keyTakeaway:
      'Trên tem OCOP chính hãng luôn có chữ OCOP cách điệu (Trái đất, Bông lúa vàng), số lượng Ngôi sao (3, 4 hoặc 5 sao) và mã QR truy xuất nguồn gốc!'
  },
  {
    id: 4,
    badge: 'Cách cấp Sao OCOP',
    title: 'Làm sao để sản phẩm được cấp từ 3 Sao đến 5 Sao OCOP?',
    greetingLine:
      'Để được gắn Sao OCOP, sản phẩm phải vượt qua Hội đồng thẩm định khắt khe trên thang điểm 100 đấy!',
    speechBody:
      'Bộ tiêu chí đánh giá OCOP gồm 3 phần: Phần A – Sản phẩm & Sức mạnh cộng đồng (40 điểm); Phần B – Khả năng tiếp thị & Câu chuyện sản phẩm (25 điểm); Phần C – Chất lượng sản phẩm & Tiêu chuẩn an toàn (35 điểm). Sản phẩm đạt 50–69 điểm được UBND Tỉnh cấp 3 Sao; đạt 70–89 điểm được UBND Tỉnh cấp 4 Sao; và đạt 90–100 điểm sẽ được trình Trung ương công nhận 5 Sao Quốc gia!',
    keyTakeaway:
      'Lưu ý quan trọng: Giấy chứng nhận sao OCOP có thời hạn hiệu lực là 36 tháng (3 năm). Sau 3 năm, chủ thể phải thi đánh giá lại để giữ vững hoặc nâng hạng sao!'
  }
];

const OCOP_ACRONYM_CARDS = [
  {
    letter: 'O',
    english: 'One',
    vietnamese: 'Mỗi / Một',
    meaning: 'Tập trung nguồn lực để xây dựng sản phẩm tiêu biểu nhất, tránh dàn trải.'
  },
  {
    letter: 'C',
    english: 'Commune',
    vietnamese: 'Xã / Phường / Cộng đồng',
    meaning: 'Gắn liền với địa bàn xã, phường (VD: Phường Tân Ninh, Phường Long Hoa, Xã Tân Biên).'
  },
  {
    letter: 'O',
    english: 'One',
    vietnamese: 'Một',
    meaning: 'Mỗi cộng đồng hợp tác xã, doanh nghiệp địa phương cùng chung sức chuẩn hóa.'
  },
  {
    letter: 'P',
    english: 'Product',
    vietnamese: 'Sản phẩm / Dịch vụ đặc trưng',
    meaning: 'Sản phẩm hàng hóa hoặc dịch vụ du lịch mang bản sắc văn hóa và nguồn gốc bản địa.'
  }
];

const SIX_OCOP_CATEGORIES = [
  {
    code: '01',
    name: 'Thực phẩm (Food)',
    detail: 'Nông sản tươi sống, nông sản chế biến, gia vị, mật ong, bánh tráng...',
    tayNinh: 'Bánh tráng phơi sương (Phường Trảng Bàng), Mật ong Bảo An & Yến sào Yến Loan (Phường Tân Ninh), Muối tôm Thắng Lợi (Xã Châu Thành), Mãng cầu (Phường Bình Minh).'
  },
  {
    code: '02',
    name: 'Đồ uống (Beverages)',
    detail: 'Trà thảo mộc, nước trái cây lên men, nước giải khát tự nhiên, rượu truyền thống...',
    tayNinh: 'Trà mãng cầu, trà hoàn ngọc và thức uống thảo mộc tại Phường Tân Ninh, Phường Hòa Thành.'
  },
  {
    code: '03',
    name: 'Thảo dược & Dược liệu',
    detail: 'Sản phẩm chiết xuất từ cây thuốc bản địa, tinh dầu, thực phẩm bảo vệ sức khỏe...',
    tayNinh: 'Các chế phẩm thảo dược vùng ven núi tại Phường Bình Minh và Xã Tân Châu.'
  },
  {
    code: '04',
    name: 'Thủ công mỹ nghệ',
    detail: 'Sản phẩm làng nghề truyền thống, mây tre đan, nhang truyền thống, gốm, mộc...',
    tayNinh: 'Nhang Vạn Linh Hương (Số 68, đường 34 Trần Phú, KP Long Hải, Phường Long Hoa).'
  },
  {
    code: '05',
    name: 'Sinh vật cảnh',
    detail: 'Hoa, cây cảnh nghệ thuật, bonsai phục vụ đời sống văn hóa và trang trí...',
    tayNinh: 'Làng hoa kiểng và bonsai tại Phường Tân Ninh, Phường Bình Minh.'
  },
  {
    code: '06',
    name: 'Du lịch cộng đồng & Điểm du lịch',
    detail: 'Dịch vụ du lịch sinh thái nông nghiệp, trải nghiệm làng nghề và văn hóa bản địa...',
    tayNinh: 'Tuyến trải nghiệm sinh thái vườn mãng cầu và danh thắng tại Phường Bình Minh.'
  }
];

const STAR_TIERS = [
  {
    stars: 5,
    starIcons: '⭐⭐⭐⭐⭐',
    scoreRange: '90 – 100 điểm',
    title: 'Hạng 5 Sao (Chuẩn Quốc Gia & Quốc Tế)',
    authority: 'Cấp Trung ương (Bộ Nông nghiệp và Môi trường) đánh giá & công nhận',
    criteria:
      'Sản phẩm đặc sắc của quốc gia, hàm lượng khoa học và giá trị gia tăng cao, áp dụng hệ thống quản lý chất lượng tiên tiến (ISO 22000, HACCP, GlobalGAP), đủ điều kiện xuất khẩu toàn cầu.',
    tayNinhExample: 'Bánh tráng siêu mỏng Tân Nhiên (Bộ NN&PTNT công nhận OCOP 5 sao Quốc gia 1/2025; cơ sở P. Long Hoa & Showroom P. Tân Ninh).',
    badgeColor: 'bg-amber-50 border-amber-400 text-amber-950'
  },
  {
    stars: 4,
    starIcons: '⭐⭐⭐⭐',
    scoreRange: '70 – 89 điểm',
    title: 'Hạng 4 Sao (Chuẩn Cấp Tỉnh Nâng Cao)',
    authority: 'UBND Tỉnh Tây Ninh đánh giá & ra Quyết định công nhận',
    criteria:
      'Sản phẩm đặc trưng, chất lượng cao của tỉnh, có vùng nguyên liệu ổn định, mã số mã vạch/QR truy xuất nguồn gốc, câu chuyện sản phẩm hấp dẫn và có tiềm năng nâng cấp lên 5 sao.',
    tayNinhExample: 'Mật ong Bảo An (Mật ong rừng & Hoa sao, dầu OCOP 4 sao); Yến sào Yến Loan (OCOP 4 sao duy trì giai đoạn 2026–2029); Mãng cầu Bà Đen VietGAP.',
    badgeColor: 'bg-emerald-50 border-emerald-300 text-emerald-950'
  },
  {
    stars: 3,
    starIcons: '⭐⭐⭐',
    scoreRange: '50 – 69 điểm',
    title: 'Hạng 3 Sao (Chuẩn Cấp Tỉnh Tiêu Chuẩn)',
    authority: 'UBND Tỉnh Tây Ninh công nhận (mức khởi điểm được cấp Giấy chứng nhận OCOP)',
    criteria:
      'Sản phẩm đặc thù địa phương, đảm bảo an toàn vệ sinh thực phẩm, có bao bì nhãn mác đúng quy định pháp luật và bước đầu tham gia chuỗi thương mại hiện đại.',
    tayNinhExample: 'Nhang Vạn Linh Hương (3 dòng sản phẩm OCOP 3 sao), Muối tôm Thắng Lợi (Xã Châu Thành), Mật ong hoa nhãn Bảo An, 4 dòng Bánh tráng trộn Tân Nhiên.',
    badgeColor: 'bg-sky-50 border-sky-300 text-sky-950'
  },
  {
    stars: 2,
    starIcons: '⭐⭐',
    scoreRange: '30 – 49 điểm',
    title: 'Hạng 2 Sao (Sản phẩm Tiềm năng đang hoàn thiện)',
    authority: 'Cấp cơ sở ghi nhận để hướng dẫn nâng cấp (Chưa được cấp tem OCOP chính thức)',
    criteria:
      'Sản phẩm đã hình thành nhưng quy mô nhỏ, bao bì hoặc hồ sơ công bố chất lượng chưa đầy đủ; cần hoàn thiện thêm để đạt mốc tối thiểu 50 điểm (3 sao).',
    tayNinhExample: 'Các hộ sản xuất nhỏ lẻ đang được địa phương hỗ trợ chuẩn hóa tem nhãn.',
    badgeColor: 'bg-slate-50 border-slate-200 text-slate-800'
  },
  {
    stars: 1,
    starIcons: '⭐',
    scoreRange: '0 – 29 điểm',
    title: 'Hạng 1 Sao (Sản phẩm Khởi đầu)',
    authority: 'Cấp xã/phường hướng dẫn ươm tạo ban đầu',
    criteria:
      'Sản phẩm thô sơ, sản xuất tự phát hộ gia đình, chưa có đăng ký kinh doanh hoặc kiểm nghiệm chất lượng.',
    tayNinhExample: 'Nông sản tự tiêu thụ tại chợ truyền thống chưa qua đăng ký.',
    badgeColor: 'bg-slate-50 border-slate-200 text-slate-700'
  }
];

const SIMULATOR_PRESETS = [
  {
    name: 'Bánh tráng siêu mỏng Tân Nhiên OCOP 5 sao',
    partA: 38,
    partB: 24,
    partC: 33
  },
  {
    name: 'Mật ong rừng Bảo An OCOP 4 sao',
    partA: 34,
    partB: 22,
    partC: 28
  },
  {
    name: 'Yến sào Yến Loan OCOP 4 sao (2026–2029)',
    partA: 33,
    partB: 20,
    partC: 27
  },
  {
    name: 'Mãng cầu Bà Đen VietGAP OCOP 4 sao',
    partA: 32,
    partB: 21,
    partC: 26
  },
  {
    name: 'Nhang Vạn Linh Hương OCOP 3 sao',
    partA: 26,
    partB: 18,
    partC: 20
  },
  {
    name: 'Muối tôm Thắng Lợi OCOP 3 sao (Xã Châu Thành)',
    partA: 25,
    partB: 16,
    partC: 20
  }
];

function BeeMascotSvg() {
  return (
    <svg
      viewBox="0 0 240 240"
      className="w-40 h-40 sm:w-48 sm:h-48 mx-auto drop-shadow-md select-none"
      role="img"
      aria-label="Nhân vật Ong Vàng Tây Ninh chào mừng"
    >
      <defs>
        <radialGradient id="beeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#FEF08A" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="beeBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
        <linearGradient id="wingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#BAE6FD" stopOpacity="0.65" />
        </linearGradient>
      </defs>

      {/* Hào quang ấm áp phía sau Ong Vàng */}
      <circle cx="120" cy="125" r="95" fill="url(#beeGlow)" />

      {/* Đôi cánh trong suốt lấp lánh */}
      <ellipse
        cx="72"
        cy="95"
        rx="38"
        ry="24"
        transform="rotate(-28 72 95)"
        fill="url(#wingGrad)"
        stroke="#38BDF8"
        strokeWidth="2.5"
      />
      <ellipse
        cx="168"
        cy="95"
        rx="38"
        ry="24"
        transform="rotate(28 168 95)"
        fill="url(#wingGrad)"
        stroke="#38BDF8"
        strokeWidth="2.5"
      />

      {/* Ngòi ong nhỏ */}
      <polygon points="113,195 127,195 120,212" fill="#1E293B" />

      {/* Thân Ong Vàng */}
      <ellipse
        cx="120"
        cy="142"
        rx="50"
        ry="56"
        fill="url(#beeBodyGrad)"
        stroke="#1E293B"
        strokeWidth="4"
      />

      {/* Các sọc nâu đen đặc trưng của Ong */}
      <path
        d="M73 128 Q120 142 167 128"
        fill="none"
        stroke="#1E293B"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <path
        d="M72 152 Q120 166 168 152"
        fill="none"
        stroke="#1E293B"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <path
        d="M82 175 Q120 186 158 175"
        fill="none"
        stroke="#1E293B"
        strokeWidth="10"
        strokeLinecap="round"
      />

      {/* Đầu Ong Vàng */}
      <circle
        cx="120"
        cy="86"
        r="38"
        fill="#FDE047"
        stroke="#1E293B"
        strokeWidth="4"
      />

      {/* Râu Ong */}
      <path
        d="M104 52 Q92 30 78 36"
        fill="none"
        stroke="#1E293B"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="76" cy="36" r="6" fill="#F59E0B" stroke="#1E293B" strokeWidth="2.5" />

      <path
        d="M136 52 Q148 30 162 36"
        fill="none"
        stroke="#1E293B"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="164" cy="36" r="6" fill="#F59E0B" stroke="#1E293B" strokeWidth="2.5" />

      {/* Mũ Cẩm Nang OCOP đội đầu */}
      <polygon
        points="120,26 82,44 120,58 158,44"
        fill="#065F46"
        stroke="#1E293B"
        strokeWidth="3"
      />
      <line x1="152" y1="46" x2="158" y2="64" stroke="#FBBF24" strokeWidth="3" />
      <circle cx="158" cy="65" r="4" fill="#FBBF24" />

      {/* Đôi mắt to tròn thân thiện */}
      <circle cx="104" cy="84" r="7.5" fill="#0F172A" />
      <circle cx="101.5" cy="81.5" r="2.5" fill="#FFFFFF" />
      <circle cx="136" cy="84" r="7.5" fill="#0F172A" />
      <circle cx="133.5" cy="81.5" r="2.5" fill="#FFFFFF" />

      {/* Má hồng */}
      <ellipse cx="90" cy="95" rx="6.5" ry="4" fill="#FB7185" opacity="0.75" />
      <ellipse cx="150" cy="95" rx="6.5" ry="4" fill="#FB7185" opacity="0.75" />

      {/* Nụ cười tươi chào đón */}
      <path
        d="M106 96 Q120 110 134 96"
        fill="none"
        stroke="#0F172A"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Tay trái vẫy chào */}
      <path
        d="M74 124 Q42 104 38 82"
        fill="none"
        stroke="#1E293B"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle cx="38" cy="80" r="8" fill="#FDE047" stroke="#1E293B" strokeWidth="3" />

      {/* Tay phải cầm Ngôi sao OCOP vàng lấp lánh */}
      <path
        d="M166 124 Q194 114 200 94"
        fill="none"
        stroke="#1E293B"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <polygon
        points="202,66 208,79 222,81 211,91 214,105 202,98 190,105 193,91 182,81 196,79"
        fill="#FACC15"
        stroke="#B45309"
        strokeWidth="2.5"
      />

      {/* Huy hiệu OCOP nhỏ trước ngực */}
      <rect
        x="96"
        y="126"
        width="48"
        height="20"
        rx="10"
        fill="#065F46"
        stroke="#FFFFFF"
        strokeWidth="2"
      />
      <text
        x="120"
        y="140"
        textAnchor="middle"
        fill="#FEF08A"
        fontSize="10"
        fontWeight="bold"
        fontFamily="sans-serif"
      >
        OCOP ⭐
      </text>
    </svg>
  );
}

export function InvestigationView({
  studentCode,
  onNavigateStation
}: InvestigationViewProps) {
  const [bubbles, setBubbles] = useState<WelcomeBubble[]>(() => createBubbleWave(1));
  const [bubbleWaveCount, setBubbleWaveCount] = useState<number>(1);
  const [activeChapterId, setActiveChapterId] = useState<number>(1);

  // Simulator state for 100-point OCOP Star Evaluation
  const [partAScore, setPartAScore] = useState<number>(34); // max 40
  const [partBScore, setPartBScore] = useState<number>(21); // max 25
  const [partCScore, setPartCScore] = useState<number>(28); // max 35
  const [completedAck, setCompletedAck] = useState<boolean>(false);

  useEffect(() => {
    logEvent(
      'CHAO_MUNG_TRAM_1_ONG_VANG',
      'Hiệu ứng bong bóng chào mừng và Nhân vật Ong Vàng giới thiệu OCOP'
    );
  }, []);

  const currentChapter =
    BEE_SPEECH_CHAPTERS.find((c) => c.id === activeChapterId) || BEE_SPEECH_CHAPTERS[0];

  const evaluation = calculateOcopStarRating(partAScore, partBScore, partCScore);

  function handleTriggerBubbleCelebration() {
    const nextWave = bubbleWaveCount + 1;
    setBubbleWaveCount(nextWave);
    setBubbles(createBubbleWave(nextWave));
    playSfxCorrect();
    logEvent('THA_BONG_BONG_CHAO_MUNG', `Thả đợt bong bóng chào mừng #${nextWave}`);
  }

  function handleSelectChapter(id: number) {
    setActiveChapterId(id);
    playSfxCorrect();
    const found = BEE_SPEECH_CHAPTERS.find((c) => c.id === id);
    if (found) {
      logEvent('XEM_CHU_DE_ONG_VANG', `Chủ đề ${id}: ${found.title}`);
    }
  }

  function handleApplyPreset(preset: { name: string; partA: number; partB: number; partC: number }) {
    setPartAScore(preset.partA);
    setPartBScore(preset.partB);
    setPartCScore(preset.partC);
    playSfxCorrect();
    logEvent('MO_PHONG_CAP_SAO_OCOP', `Thử nghiệm mẫu: ${preset.name}`);
  }

  function handleCompleteStation1() {
    setCompletedAck(true);
    playSfxVictory();
    fireConfetti(60);
    handleTriggerBubbleCelebration();
    logEvent(
      'HOAN_THANH_TRAM_1_NHAN_DIEN',
      `Học sinh ${studentCode} đã nắm vững khái niệm OCOP & quy trình cấp sao cùng Ong Vàng`
    );
    updateLearningProgress((prev) => ({
      ...prev,
      investigationCompleted: true,
      investigationVerdict: evaluation.stars
    }));
  }

  return (
    <div className="relative max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-10 overflow-hidden">
      {/* LỚP HIỆU ỨNG BONG BÓNG CHÀO MỪNG TRÀN KHẮP MÀN HÌNH (FULL-SCREEN BUBBLE SHOWER) */}
      <div
        className="fixed inset-0 pointer-events-none z-40 overflow-hidden"
        aria-hidden="true"
        data-testid="welcome-bubbles-overlay"
      >
        {bubbles.map((b) => (
          <div
            key={b.id}
            className={`welcome-bubble flex items-center justify-center ${b.colorClass}`}
            style={{
              left: `${b.left}%`,
              width: `${b.size}px`,
              height: `${b.size}px`,
              animationDuration: `${b.duration}s`,
              animationDelay: `${b.delay}s`
            }}
          >
            {/* Đốm sáng phản quang bên trong bong bóng */}
            <span className="absolute top-1.5 left-2 w-2.5 h-2.5 rounded-full bg-white/80" />
            {b.icon && <span className="text-sm sm:text-base select-none">{b.icon}</span>}
          </div>
        ))}
      </div>

      {/* SÂN KHẤU CHÀO MỪNG CỦA NHÂN VẬT ONG VÀNG TÂY NINH */}
      <section
        aria-label="Màn hình chào mừng của Ong Vàng Tây Ninh"
        className="relative bg-gradient-to-br from-amber-50/95 via-white/95 to-emerald-50/95 border-2 border-amber-300 rounded-2xl sm:rounded-3xl p-4 sm:p-10 shadow-sm overflow-hidden"
      >
        {/* Thanh trạng thái chào mừng & Nút thả lại bong bóng */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200/80 pb-4 mb-6">
          <div className="text-xs font-mono-code font-bold text-amber-900 tracking-wide">
            🐝 TRẠM 1 · NHẬN DIỆN OCOP CÙNG SỨ GIẢ ONG VÀNG TÂY NINH
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTriggerBubbleCelebration}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer whitespace-nowrap shrink-0"
            >
              🫧 Thả Bong Bóng Chào Mừng
            </button>
          </div>
        </div>

        {/* Khung Nhân vật Ong Vàng + Bong bóng Lời chào trực tiếp */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Cột Trái: Nhân vật Ong Vàng hiện ra vẫy tay chào */}
          <div className="lg:col-span-4 flex flex-col items-center text-center space-y-3">
            <div className="relative bg-white/90 border-2 border-amber-300 rounded-3xl p-4 shadow-sm w-full max-w-[240px]">
              <BeeMascotSvg />
              <div className="mt-1 text-sm font-extrabold text-amber-950">
                Ong Vàng Tây Ninh
              </div>
              <div className="text-xs text-emerald-800 font-semibold">
                Hướng dẫn viên Nhận diện OCOP
              </div>
            </div>

            <div className="text-xs text-slate-600">
              Đang trò chuyện cùng mã HS: <strong className="font-mono-code text-slate-900">{studentCode}</strong>
            </div>
          </div>

          {/* Cột Phải: Bong bóng Lời Chào & Lời Giảng của Ong Vàng */}
          <div className="lg:col-span-8 space-y-5">
            {/* Hộp thoại Lời chào của Ong Vàng */}
            <div className="relative bg-white border-2 border-amber-400 rounded-3xl p-6 sm:p-7 shadow-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800">
                  💬 {currentChapter.badge} ({currentChapter.id}/{BEE_SPEECH_CHAPTERS.length})
                </span>
                <span className="text-xs text-emerald-800 font-semibold">
                  Phường Tân Ninh · Tỉnh Tây Ninh
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif-display italic">
                {currentChapter.title}
              </h1>

              {/* Câu chào nổi bật của Ong Vàng */}
              <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-950 text-sm sm:text-base font-bold leading-relaxed">
                “{currentChapter.greetingLine}”
              </div>

              {/* Nội dung giải thích chi tiết của Ong Vàng */}
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                {currentChapter.speechBody}
              </p>

              {/* Ghi nhớ nhanh từ Ong Vàng */}
              <div className="p-3.5 rounded-xl bg-emerald-50/90 border border-emerald-200 text-xs sm:text-sm text-emerald-950 font-medium">
                💡 <strong>Lời nhắn của Ong Vàng:</strong> {currentChapter.keyTakeaway}
              </div>
            </div>

            {/* Các nút chọn chủ đề để nghe Ong Vàng nói tiếp */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700">
                👇 Bấm chọn chủ đề khám phá cùng Ong Vàng:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {BEE_SPEECH_CHAPTERS.map((chap) => {
                  const isSelected = chap.id === activeChapterId;
                  return (
                    <button
                      key={chap.id}
                      type="button"
                      onClick={() => handleSelectChapter(chap.id)}
                      className={`text-left px-4 py-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all flex items-center justify-between gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-800 border-emerald-900 text-white shadow-xs'
                          : 'bg-white border-slate-200 text-slate-800 hover:bg-amber-50 hover:border-amber-300'
                      }`}
                    >
                      <span className="truncate">
                        {chap.id}. {chap.badge}
                      </span>
                      <span className="shrink-0 text-xs font-semibold">
                        {isSelected ? '✓ Đang xem' : 'Khám phá →'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PHẦN 01: KHÁI NIỆM OCOP LÀ GÌ? & GIẢI MÃ 4 CHỮ CÁI O - C - O - P */}
      <section
        aria-labelledby="what-is-ocop-heading"
        className="bg-white/95 border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-9 space-y-6 sm:space-y-7 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="text-xs font-mono-code font-bold text-emerald-800">
              CHỦ ĐỀ 01 · KHÁI NIỆM & NGUỒN GỐC CHƯƠNG TRÌNH OCOP
            </div>
            <h2 id="what-is-ocop-heading" className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              01. Khái Niệm OCOP Là Gì?
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            One Commune One Product · Mỗi xã một sản phẩm
          </span>
        </div>

        {/* Khối định nghĩa tổng quan */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6">
          <div className="md:col-span-5 rounded-2xl overflow-hidden border border-slate-200 bg-white p-1 aspect-[16/10] flex items-center justify-center shadow-xs">
            <img
              src="/image/nhan-dien-banner.jpg"
              alt="Nhận diện chương trình OCOP Tây Ninh"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain block"
            />
          </div>
          <div className="md:col-span-7 space-y-3">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              Chương trình “Mỗi xã một sản phẩm” (OCOP)
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              <strong>OCOP</strong> (viết tắt từ tiếng Anh: <em>One Commune One Product</em>) là chương trình phát triển kinh tế khu vực nông thôn và địa phương theo hướng phát huy nội lực (trí tuệ sáng tạo, lao động, nguyên liệu bản địa, văn hóa truyền thống) và gia tăng giá trị sản phẩm.
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">
              Tại Việt Nam, chương trình OCOP được Thủ tướng Chính phủ chính thức triển khai trên phạm vi cả nước từ <strong>năm 2018</strong>. Tại <strong>tỉnh Tây Ninh</strong>, chương trình đã giúp hàng trăm đặc sản tại <strong>Phường Tân Ninh, Phường Bình Minh, Phường Long Hoa, Phường Hòa Thành, Phường Trảng Bàng, Xã Tân Biên, Xã Tân Châu, Xã Tân Phú</strong> vươn tầm siêu thị và xuất khẩu quốc tế.
            </p>
          </div>
        </div>

        {/* 4 Ô Giải Mã Chữ O - C - O - P */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-slate-900">
            🐝 Ong Vàng giải mã từng chữ cái trong từ O - C - O - P:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {OCOP_ACRONYM_CARDS.map((item, idx) => (
              <div
                key={idx}
                className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-xl bg-amber-500 text-white font-mono-code font-black text-xl flex items-center justify-center shadow-xs">
                    {item.letter}
                  </span>
                  <span className="text-xs font-mono-code font-bold text-amber-900">
                    {item.english}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900">{item.vietnamese}</div>
                <p className="text-xs text-slate-600 leading-relaxed">{item.meaning}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 6 Nhóm ngành hàng sản phẩm OCOP */}
        <div className="space-y-3 pt-2">
          <h3 className="text-base font-bold text-slate-900">
            📦 6 Nhóm ngành sản phẩm OCOP theo quy định Quốc gia:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SIX_OCOP_CATEGORIES.map((cat) => (
              <div
                key={cat.code}
                className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 hover:border-emerald-600 transition-colors"
              >
                <div className="text-xs font-mono-code font-bold text-emerald-800">
                  NHÓM {cat.code}
                </div>
                <h4 className="text-sm font-bold text-slate-900">{cat.name}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{cat.detail}</p>
                <div className="pt-1 border-t border-slate-100 text-xs text-emerald-900 font-medium">
                  <strong>Tại Tây Ninh:</strong> {cat.tayNinh}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PHẦN 02: CÁCH ĐỂ CẤP SAO CHO CÁC SẢN PHẨM OCOP (THANG ĐIỂM 100 & HỆ THỐNG 1-5 SAO) */}
      <section
        aria-labelledby="how-to-star-heading"
        className="bg-white/95 border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-9 space-y-6 sm:space-y-8 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="text-xs font-mono-code font-bold text-amber-800">
              CHỦ ĐỀ 02 · QUY TRÌNH ĐÁNH GIÁ & PHÂN HẠNG SAO OCOP
            </div>
            <h2 id="how-to-star-heading" className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              02. Cách Để Cấp Sao Cho Các Sản Phẩm OCOP
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono-code">
            Thang điểm 100 · Phân hạng từ 1 Sao đến 5 Sao
          </span>
        </div>

        {/* Giải thích 3 trụ cột chấm điểm trên Thang 100 điểm */}
        <div className="space-y-4">
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 text-sm text-amber-950 leading-relaxed">
            🐝 <strong>Ong Vàng giải thích:</strong> Không phải cơ sở nào tự in ngôi sao lên hộp cũng là sản phẩm OCOP đâu nhé! Để được cấp Sao OCOP chính thức, sản phẩm phải trải qua <strong>Hội đồng đánh giá và phân hạng</strong> chấm điểm nghiêm ngặt trên <strong>Thang điểm 100</strong> chia làm 3 phần:
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono-code font-bold text-emerald-800">
                  PHẦN A · CỘNG ĐỒNG
                </span>
                <span className="text-sm font-mono-code font-extrabold text-slate-900">
                  Tối đa 40 điểm
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Sản phẩm & Sức mạnh cộng đồng
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Đánh giá tỷ lệ sử dụng nguyên liệu địa phương, sử dụng lao động bản địa, hình thức tổ chức liên kết sản xuất (Hợp tác xã, tổ hợp tác, doanh nghiệp) và chỉ tiêu bảo vệ môi trường trong sản xuất.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono-code font-bold text-amber-800">
                  PHẦN B · TIẾP THỊ
                </span>
                <span className="text-sm font-mono-code font-extrabold text-slate-900">
                  Tối đa 25 điểm
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Khả năng tiếp thị & Câu chuyện
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Đánh giá <strong>Câu chuyện sản phẩm (Product Story)</strong> gắn với lịch sử – văn hóa Tây Ninh, quy cách đóng gói bao bì, tem nhãn truy xuất nguồn gốc mã QR và quy mô kênh phân phối tiêu thụ.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono-code font-bold text-sky-800">
                  PHẦN C · CHẤT LƯỢNG
                </span>
                <span className="text-sm font-mono-code font-extrabold text-slate-900">
                  Tối đa 35 điểm
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Chất lượng & Tiêu chuẩn an toàn
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Đánh giá chỉ tiêu cảm quan (hương vị, màu sắc), giá trị dinh dưỡng, tính độc đáo riêng có và các giấy chứng nhận quản lý chất lượng tiên tiến như <strong>VietGAP, GlobalGAP, HACCP, ISO 22000</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Bảng Phân Hạng Chi Tiết 5 Cấp Độ Sao OCOP */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900">
            ⭐ Bảng phân hạng 5 mức Sao OCOP & Cơ quan có thẩm quyền cấp chứng nhận:
          </h3>

          <div className="space-y-3">
            {STAR_TIERS.map((tier) => (
              <div
                key={tier.stars}
                className={`border rounded-2xl p-5 transition-all ${tier.badgeColor}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-black/10">
                  <div className="flex items-center gap-3">
                    <span className="text-lg tracking-tight" aria-hidden="true">
                      {tier.starIcons}
                    </span>
                    <h4 className="text-base font-extrabold">{tier.title}</h4>
                  </div>
                  <span className="text-xs font-mono-code font-bold px-2.5 py-1 rounded-lg bg-white/80 text-slate-900 self-start sm:self-auto">
                    Điểm chuẩn: {tier.scoreRange}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-12 gap-4 text-xs sm:text-sm">
                  <div className="md:col-span-8 space-y-1.5">
                    <p>
                      <strong>🏛️ Thẩm quyền cấp sao:</strong> {tier.authority}
                    </p>
                    <p className="leading-relaxed">
                      <strong>📋 Yêu cầu tiêu chuẩn:</strong> {tier.criteria}
                    </p>
                  </div>
                  <div className="md:col-span-4 bg-white/75 rounded-xl p-3 border border-black/5">
                    <div className="text-xs font-bold text-slate-700 mb-1">
                      📍 Ví dụ thực tế tại Tây Ninh:
                    </div>
                    <p className="text-xs text-slate-800 leading-relaxed">{tier.tayNinhExample}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quy trình 4 Bước Xét Duyệt Cấp Sao từ Xã/Phường lên Tỉnh & Trung Ương */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900">
            🔄 Quy trình 4 bước từ lúc đăng ký đến khi sản phẩm được gắn Sao OCOP:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1.5">
              <div className="font-mono-code font-bold text-emerald-800">BƯỚC 01 · ĐĂNG KÝ HỒ SƠ</div>
              <div className="font-bold text-slate-900 text-sm">Chủ thể lập hồ sơ sản phẩm</div>
              <p className="text-slate-600 leading-relaxed">
                Doanh nghiệp, Hợp tác xã hoặc Hộ kinh doanh tại địa phương (VD: Phường Tân Ninh, Phường Long Hoa, Xã Tân Biên) chuẩn bị mẫu sản phẩm, câu chuyện sản phẩm và hồ sơ kiểm nghiệm an toàn.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1.5">
              <div className="font-mono-code font-bold text-emerald-800">BƯỚC 02 · KIỂM TRA CƠ SỞ</div>
              <div className="font-bold text-slate-900 text-sm">Đánh giá tại Xã / Phường</div>
              <p className="text-slate-600 leading-relaxed">
                Địa phương xác minh thực tế vùng nguyên liệu, quy trình sản xuất sạch, bảo vệ môi trường và chuyển hồ sơ đủ điều kiện lên Hội đồng đánh giá cấp Tỉnh.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1.5">
              <div className="font-mono-code font-bold text-emerald-800">BƯỚC 03 · CẤP TỈNH (3⭐ & 4⭐)</div>
              <div className="font-bold text-slate-900 text-sm">UBND Tỉnh chấm điểm & công nhận</div>
              <p className="text-slate-600 leading-relaxed">
                Hội đồng OCOP cấp Tỉnh chấm điểm trên thang 100. Sản phẩm đạt <strong>50–69 điểm</strong> được cấp <strong>3 Sao</strong>; đạt <strong>70–89 điểm</strong> được cấp <strong>4 Sao</strong>; từ 90 điểm trở lên được đề nghị lên Trung ương.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1.5">
              <div className="font-mono-code font-bold text-emerald-800">BƯỚC 04 · QUỐC GIA (5⭐)</div>
              <div className="font-bold text-slate-900 text-sm">Trung ương công nhận & Giám sát 36 tháng</div>
              <p className="text-slate-600 leading-relaxed">
                Hội đồng OCOP Trung ương thẩm định và trao danh hiệu <strong>OCOP 5 Sao Quốc gia (90–100 điểm)</strong>. Chứng nhận có giá trị <strong>36 tháng (3 năm)</strong> kể từ ngày ký.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PHẦN 03: BÀN CÂN MÔ PHỎNG CHẤM ĐIỂM & CẤP SAO OCOP CÙNG ONG VÀNG */}
      <section
        aria-labelledby="star-simulator-heading"
        className="bg-white/95 border-2 border-emerald-700/30 rounded-2xl sm:rounded-3xl p-4 sm:p-9 space-y-6 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="text-xs font-mono-code font-bold text-emerald-800">
              THỰC HÀNH TƯƠNG TÁC · MÔ PHỎNG HỘI ĐỒNG CHẤM ĐIỂM OCOP
            </div>
            <h2 id="star-simulator-heading" className="text-2xl font-bold text-slate-900 mt-1">
              03. Thử Làm Giám Khảo Chấm Điểm & Cấp Sao OCOP Cùng Ong Vàng
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Kéo thanh trượt hoặc chọn mẫu sản phẩm để xem kết quả phân hạng sao
          </span>
        </div>

        {/* Các nút chọn mẫu sản phẩm Tây Ninh nhanh */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-700">
            Chọn nhanh hồ sơ mẫu đặc sản Tây Ninh để xem điểm số:
          </div>
          <div className="flex flex-wrap gap-2">
            {SIMULATOR_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-400 text-xs font-semibold text-slate-800 transition-colors cursor-pointer"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Cột Trái: 3 Thanh Trượt Chấm Điểm (Phần A, B, C) */}
          <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5 flex flex-col justify-between">
            <div className="space-y-5">
              {/* Slider Phần A */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-900">
                  <label htmlFor="slider-part-a">
                    Phần A: Sức mạnh cộng đồng & Nguyên liệu bản địa (Tối đa 40đ)
                  </label>
                  <span className="font-mono-code text-emerald-800">{partAScore} / 40 điểm</span>
                </div>
                <input
                  id="slider-part-a"
                  type="range"
                  min={0}
                  max={40}
                  value={partAScore}
                  onChange={(e) => setPartAScore(Number(e.target.value))}
                  className="w-full accent-emerald-700 cursor-pointer"
                />
              </div>

              {/* Slider Phần B */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-900">
                  <label htmlFor="slider-part-b">
                    Phần B: Khả năng tiếp thị, Bao bì & Câu chuyện sản phẩm (Tối đa 25đ)
                  </label>
                  <span className="font-mono-code text-amber-800">{partBScore} / 25 điểm</span>
                </div>
                <input
                  id="slider-part-b"
                  type="range"
                  min={0}
                  max={25}
                  value={partBScore}
                  onChange={(e) => setPartBScore(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>

              {/* Slider Phần C */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-900">
                  <label htmlFor="slider-part-c">
                    Phần C: Chất lượng cảm quan & Chứng nhận VietGAP/ISO/HACCP (Tối đa 35đ)
                  </label>
                  <span className="font-mono-code text-sky-800">{partCScore} / 35 điểm</span>
                </div>
                <input
                  id="slider-part-c"
                  type="range"
                  min={0}
                  max={35}
                  value={partCScore}
                  onChange={(e) => setPartCScore(Number(e.target.value))}
                  className="w-full accent-sky-700 cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span>Công thức: Tổng điểm = Phần A + Phần B + Phần C</span>
              <span className="font-mono-code font-bold text-slate-900">
                {partAScore} + {partBScore} + {partCScore} = {evaluation.totalScore}/100 điểm
              </span>
            </div>
          </div>

          {/* Cột Phải: Kết Quả Phân Hạng Sao Của Ong Vàng */}
          <div className="lg:col-span-5 bg-amber-50/90 border-2 border-amber-400 rounded-2xl p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3 text-center">
              <div className="text-xs font-mono-code font-bold text-amber-900 uppercase">
                KẾT QUẢ PHÂN HẠNG TỪ HỘI ĐỒNG OCOP
              </div>

              <div className="text-4xl font-black text-slate-900 font-mono-code">
                {evaluation.totalScore}
                <span className="text-lg font-normal text-slate-600">/100 điểm</span>
              </div>

              <div className="text-2xl tracking-widest" aria-label={`${evaluation.stars} sao`}>
                {'⭐'.repeat(evaluation.stars)}
              </div>

              <div className="text-lg font-extrabold text-emerald-900">
                {evaluation.rankName}
              </div>
            </div>

            <div className="bg-white/90 border border-amber-200 rounded-xl p-4 space-y-2 text-xs text-slate-700">
              <p>
                <strong>🏛️ Thẩm quyền:</strong> {evaluation.authority}
              </p>
              <p>
                <strong>🐝 Ong Vàng nhận xét:</strong> {evaluation.description}
              </p>
              <p>
                <strong>📍 Sản phẩm tiêu biểu:</strong> {evaluation.tayNinhExample}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PHẦN 04: GÓC QUAN SÁT THỰC TẾ TEM NHÃN SẢN PHẨM OCOP TÂY NINH & CHUYỂN TRẠM */}
      <section className="bg-white/95 border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-9 space-y-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white p-1 aspect-[16/10] flex items-center justify-center shadow-xs">
            <img
              src="/image/sp-so-sanh.jpg"
              alt="Quan sát tem nhãn chứng nhận OCOP trên bao bì sản phẩm"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain block"
            />
          </div>

          <div className="space-y-3">
            <div className="text-xs font-mono-code font-bold text-emerald-800">
              BÍ QUYẾT CỦA ONG VÀNG KHI MUA SẮM
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              3 Dấu hiệu nhận diện sản phẩm OCOP thật ngoài đời thực
            </h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>
                <strong>1. Kiểm tra Logo OCOP có gắn Sao:</strong> Trên bao bì phải có logo OCOP chính thức kèm số lượng ngôi sao (3 sao, 4 sao hoặc 5 sao) trùng khớp với quyết định công nhận.
              </li>
              <li>
                <strong>2. Kiểm tra Chủ thể & Địa chỉ mới rõ ràng:</strong> Ghi rõ tên Hợp tác xã/Công ty và địa chỉ hành chính (VD: <em>Phường Tân Ninh, Phường Bình Minh, Phường Long Hoa, Phường Trảng Bàng, Xã Tân Biên, Xã Tân Châu</em>).
              </li>
              <li>
                <strong>3. Quét mã QR & Kiểm tra thời hạn 36 tháng:</strong> Đối chiếu số Quyết định công nhận của UBND Tỉnh Tây Ninh hoặc Bộ NN&MT còn trong thời hạn 3 năm.
              </li>
            </ul>
          </div>
        </div>

        {/* Nút xác nhận đã học xong cùng Ong Vàng & Chuyển sang Trạm 2 */}
        <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            {completedAck ? (
              <div className="text-sm font-bold text-emerald-800">
                ✅ Tuyệt vời! Ong Vàng đã ghi nhận bạn hoàn thành Trạm 1: Nhận diện OCOP!
              </div>
            ) : (
              <div className="text-xs sm:text-sm text-slate-600">
                Bạn đã hiểu rõ khái niệm OCOP và cách chấm điểm cấp sao cùng Ong Vàng chưa?
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleCompleteStation1}
              className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              🐝 Đã Hiểu Rõ Cùng Ong Vàng!
            </button>

            <button
              type="button"
              onClick={() => onNavigateStation('ban-do', 'BAN_DO_FROM_BEE_GUIDE')}
              className="px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Khám phá tiếp Trạm 2: Bản đồ OCOP &rarr;
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
