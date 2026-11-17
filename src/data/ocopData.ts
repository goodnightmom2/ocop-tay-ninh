export type OcopProductKey =
  | 'honey'
  | 'custardapple'
  | 'ricepaper'
  | 'shrimpsalt'
  | 'birdsnest'
  | 'incense';

export type OcopMascotKey =
  | 'bee'
  | 'caterpillar'
  | 'squirrel'
  | 'shrimp'
  | 'swallow'
  | 'dragon';

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explain: string;
  subjectTag?: string;
}

export interface EvidenceRecord {
  id: string;
  title: string;
  type: string;
  source: string;
  desc: string;
}

export interface InvestigationCase {
  id: string;
  caseCode: string;
  title: string;
  shortName: string;
  category: string;
  location: string;
  archiveCode: string;
  artworkKey: 'honey' | 'ricepaper' | 'incense';
  imageSrc: string;
  compareImageSrc: string;
  mission: string;
  inquiryQuestions: string[];
  initialEvidence: EvidenceRecord[];
  mediaSource: {
    title: string;
    claim: string;
    date: string;
  };
  officialSource: {
    title: string;
    record: string;
    authority: string;
  };
  comparisonCriteria: {
    aspect: string;
    detail: string;
  }[];
  methodNote: string;
  recommendedVerdict: 1 | 2 | 3;
  defaultNotes: string;
  contradictionSummary: string;
}

export interface MapProductPin {
  key: OcopProductKey;
  name: string;
  shortLabel: string;
  district: string;
  coordinates: { x: number; y: number };
  patrolWaypoints: { x: number; y: number }[];
  mascotKey: OcopMascotKey;
  mascotName: string;
  mascotBadge: string;
  mascotImage: string;
  icon: string;
  title: string;
  location: string;
  desc: string;
  hasVideo?: boolean;
  videoSrc?: string;
  productImage?: string;
  bottomImage?: string;
  profile: {
    productName: string;
    locality: string;
    producer: string;
    contact?: string;
    category: string;
    ocopRating: string;
    decisionCode: string;
    officialUrl?: string;
  };
  documentarySummary: {
    duration: string;
    highlights: string[];
    productionSteps: string[];
  };
  fieldQuiz: {
    question: string;
    options: { val: string; label: string }[];
    correctVal: string;
    correctExplain: string;
    wrongExplain: string;
  };
}

export interface ProductRepositoryItem {
  key: OcopProductKey;
  name: string;
  header: string;
  icon: string;
  mascotKey: OcopMascotKey;
  mascotName: string;
  mascotImage: string;
  location: string;
  producer: string;
  category: 'Thực phẩm' | 'Thủ công mỹ nghệ & Lưu niệm';
  ocop: string;
  stars: number;
  decisionNumber: string;
  desc: string;
  videoSrc?: string;
  highlights: string[];
  verificationChecklist: string[];
  qrCodeData: {
    batchCode: string;
    mfgDate: string;
    expDate: string;
    standard: string;
  };
}

/**
 * 4 câu hỏi Kiểm chứng thông tin nhanh tại Trang chủ (index.html)
 */
export const HOME_VERIFICATION_QUIZ: QuizQuestion[] = [
  {
    id: 1,
    question: 'Thông tin nào dưới đây cần được kiểm chứng trước?',
    options: [
      'Tên sản phẩm',
      'Sản phẩm được quảng cáo là tốt cho sức khỏe',
      'Địa điểm bán',
      'Màu sắc bao bì'
    ],
    correctIndex: 1,
    explain: 'Các tuyên bố về công dụng sức khỏe hoặc "100% nguyên chất" trên bài đăng bán hàng luôn cần được kiểm chứng độc lập qua hồ sơ công bố.'
  },
  {
    id: 2,
    question: 'Muốn kiểm tra sản phẩm có thật sự đạt OCOP, em nên làm gì?',
    options: [
      'Tin vào bài đăng',
      'Xem lượt thích',
      'Kiểm tra nguồn thông tin chính thức',
      'Hỏi bạn bè'
    ],
    correctIndex: 2,
    explain: 'Chỉ có Quyết định công nhận và Cổng thông tin OCOP chính thức của cơ quan nhà nước mới xác thực được hạng sao OCOP.'
  },
  {
    id: 3,
    question: 'Câu “100% nguyên chất” nên được xem là gì?',
    options: [
      'Sự thật chắc chắn',
      'Thông tin cần kiểm chứng',
      'Bằng chứng khoa học',
      'Thông tin chính thức'
    ],
    correctIndex: 1,
    explain: 'Khẩu hiệu quảng cáo của người bán là thông tin một chiều, cần được đối chiếu với kết quả kiểm nghiệm và nhãn pháp lý.'
  },
  {
    id: 4,
    question: 'Nguồn nào đáng tin cậy hơn khi kiểm chứng thông tin?',
    options: [
      'Bài đăng không rõ nguồn',
      'Bình luận trên mạng',
      'Nguồn chính thức có thể xác minh',
      'Tin truyền miệng'
    ],
    correctIndex: 2,
    explain: 'Nguồn chính thức từ Sở Nông nghiệp và Môi trường, UBND tỉnh Tây Ninh (Phường Tân Ninh) hoặc hồ sơ truy xuất nguồn gốc của Hợp tác xã có giá trị pháp lý rõ ràng.'
  }
];

/**
 * 10 câu hỏi Thử thách cuối hành trình (thu-thach.html)
 */
export const FINAL_CHALLENGE_10_QUIZ: QuizQuestion[] = [
  {
    id: 1,
    question: '1. Thông tin nào cần chú ý khi tìm hiểu một sản phẩm?',
    options: [
      'Màu sắc và hình dáng bắt mắt của bao bì',
      'Tên sản phẩm, chủ thể sản xuất, hạn sử dụng và nguồn gốc nhãn mác',
      'Số lượng người nhấn thích bài viết',
      'Sản phẩm có bao bì đắt tiền hay không'
    ],
    correctIndex: 1,
    explain: 'Tên sản phẩm, chủ thể, hạn dùng và nguồn gốc địa phương mới là các dữ kiện then chốt để xác minh.'
  },
  {
    id: 2,
    question: '2. Muốn biết chủ thể sản xuất cần tìm thông tin nào?',
    options: [
      'Khẩu hiệu quảng cáo',
      'Hình ảnh đại diện trên nhãn',
      'Tên chủ thể / cơ sở sản xuất và địa chỉ pháp lý mới (Phường/Xã, tỉnh Tây Ninh)',
      'Màu sắc hộp đóng gói'
    ],
    correctIndex: 2,
    explain: 'Tên chủ thể và địa chỉ sản xuất giúp em xác định rõ ai chịu trách nhiệm về sản phẩm.'
  },
  {
    id: 3,
    question: '3. Nguồn nào nên ưu tiên khi kiểm chứng thông tin sản phẩm?',
    options: [
      'Bình luận khen ngợi của người mua trên mạng',
      'Video ngắn có nhiều lượt chia sẻ',
      'Nguồn thông tin chính thức có thể kiểm chứng từ cơ quan quản lý',
      'Bài đăng quảng cáo của người bán hàng'
    ],
    correctIndex: 2,
    explain: 'Luôn ưu tiên cổng thông tin chính thức của các cơ quan có thẩm quyền tại tỉnh Tây Ninh.'
  },
  {
    id: 4,
    question: '4. OCOP có phải căn cứ duy nhất để kết luận thực phẩm an toàn không?',
    options: [
      'Có, vì sản phẩm đã được gắn sao OCOP',
      'Không, OCOP không phải căn cứ duy nhất để kết luận thực phẩm an toàn',
      'Có, nếu có tem 4 sao trở lên',
      'Không, vì OCOP hoàn toàn không có giá trị tham khảo'
    ],
    correctIndex: 1,
    explain: 'OCOP là thông tin quan trọng nhưng không nên lấy riêng OCOP làm căn cứ duy nhất để kết luận an toàn (cần xem thêm hạn dùng, điều kiện bảo quản, chứng nhận ATTP).'
  },
  {
    id: 5,
    question: '5. Bản đồ OCOP giúp em làm gì?',
    options: [
      'Biết giá bán rẻ nhất',
      'Định vị vùng nguyên liệu, cơ sở sản xuất và hành trình kết nối giữa 6 đặc sản tại các Phường/Xã mới',
      'Đặt hàng giao nhanh trong ngày',
      'Tìm kiếm các bài đánh giá trên mạng xã hội'
    ],
    correctIndex: 1,
    explain: 'Bản đồ số kết nối vị trí địa lý với từng làng nghề và đơn vị sản xuất cụ thể (như Phường Tân Ninh, Phường Bình Minh, Phường Long Hoa, Phường Trảng Bàng, Xã Tân Châu, Xã Tân Biên).'
  },
  {
    id: 6,
    question: '6. Sản phẩm nào sau đây thuộc nhóm thực phẩm OCOP?',
    options: [
      'Nhang Vạn Linh Hương (Phường Long Hoa)',
      'Mật ong Bảo An & Yến sào Yến Loan (Phường Tân Ninh), Bánh tráng (Phường Trảng Bàng), Muối tôm Thắng Lợi (Xã Châu Thành)',
      'Sản phẩm đồ gốm thủ công',
      'Khăn rằn truyền thống'
    ],
    correctIndex: 1,
    explain: 'Mật ong, bánh tráng, mãng cầu, muối tôm và yến sào thuộc nhóm ngành hàng Thực phẩm OCOP Tây Ninh.'
  },
  {
    id: 7,
    question: '7. Nhang có phải là sản phẩm OCOP không?',
    options: [
      'Không, OCOP chỉ dành cho thực phẩm ăn uống',
      'Có, nhang thuộc nhóm sản phẩm lưu niệm, thủ công truyền thống OCOP',
      'Chỉ đúng nếu làm từ gỗ quý hiếm',
      'Chưa từng có cơ sở nhang nào đạt chuẩn'
    ],
    correctIndex: 1,
    explain: 'OCOP Tây Ninh không chỉ có thực phẩm mà còn có làng nghề nhang truyền thống tại Phường Long Hoa thuộc nhóm thủ công mỹ nghệ.'
  },
  {
    id: 8,
    question: '8. Khi hai nguồn thông tin nói khác nhau, em nên làm gì?',
    options: [
      'Chọn tin nguồn có nhiều lượt tương tác hơn',
      'Bỏ qua không cần kiểm chứng',
      'Đối chiếu lại với hồ sơ và cổng thông tin chính thức của cơ quan nhà nước',
      'Hỏi ý kiến bạn bè trên mạng'
    ],
    correctIndex: 2,
    explain: 'Khi có mâu thuẫn thông tin, đối chiếu cổng chính thức là giải pháp khoa học nhất.'
  },
  {
    id: 9,
    question: '9. Thông tin quảng cáo có nên được xem là căn cứ duy nhất không?',
    options: [
      'Có, vì người bán luôn cung cấp đúng sự thật',
      'Không, quảng cáo chỉ để tham khảo, cần kiểm chứng độc lập',
      'Có, nếu quảng cáo có người nổi tiếng tham gia',
      'Có, nếu có nhiều bình luận tích cực'
    ],
    correctIndex: 1,
    explain: 'Quảng cáo chỉ mang tính tham khảo, không được dùng làm căn cứ duy nhất.'
  },
  {
    id: 10,
    question: '10. Nếu muốn tìm hiểu một sản phẩm địa phương, bước đầu tiên nên làm gì?',
    options: [
      'Đọc kỹ thông tin nhãn mác, xác định chủ thể và tra cứu nguồn chính thức',
      'Mua ngay để thử nghiệm chất lượng',
      'Đoán chất lượng dựa trên giá tiền',
      'Tìm kiếm người bán có nhiều người theo dõi nhất'
    ],
    correctIndex: 0,
    explain: 'Đọc nhãn mác và tra cứu nguồn gốc chính thức là bước đầu tiên của người tiêu dùng thông thái.'
  }
];

/**
 * Ngân hàng câu hỏi Trò chơi Xây Tháp Tri Thức OCOP Tây Ninh (Knowledge Tower)
 * Phân cấp từ Dễ (Nền móng) -> Trung bình (Thân tháp) -> Khó & Chuyên sâu (Đỉnh tháp)
 */
export interface TowerQuestion extends QuizQuestion {
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
}

export const KNOWLEDGE_TOWER_QUESTIONS: TowerQuestion[] = [
  // ===== CẤP 1: DỄ - NỀN MÓNG THÁP (TẦNG 1 - 4) =====
  {
    id: 101,
    difficulty: 'easy',
    topic: 'Bánh tráng Tây Ninh',
    subjectTag: '🟢 NỀN MÓNG (DỄ): Bánh tráng Tây Ninh',
    question: 'Tỉnh Tây Ninh nổi tiếng với loại bánh tráng đặc sản nào được làm từ bột gạo, phơi qua hai sương một nắng?',
    options: [
      'Bánh tráng phơi sương Trảng Bàng',
      'Bánh phồng tôm Sa Đéc',
      'Bánh đa cua Hải Phòng',
      'Bánh pía Sóc Trăng'
    ],
    correctIndex: 0,
    explain: 'Bánh tráng phơi sương Trảng Bàng là đặc sản OCOP tiêu biểu của Tây Ninh, nổi tiếng với sự dẻo dai thơm mùi bột gạo phơi qua sương sớm.'
  },
  {
    id: 102,
    difficulty: 'easy',
    topic: 'Mật ong Tây Ninh',
    subjectTag: '🟢 NỀN MÓNG (DỄ): Mật ong Bảo An Tây Ninh',
    question: 'Linh vật đại diện cho sản phẩm Mật ong Bảo An Tây Ninh là con vật nào?',
    options: [
      'Con Bướm hoa',
      'Con Ong vàng chăm chỉ',
      'Con Chuồn chuồn ớt',
      'Con Bọ cánh cứng'
    ],
    correctIndex: 1,
    explain: 'Con Ong vàng là linh vật của Mật ong Bảo An Tây Ninh, tượng trưng cho tính chăm chỉ và sản phẩm mật ong thiên nhiên đạt chuẩn OCOP địa phương.'
  },
  {
    id: 103,
    difficulty: 'easy',
    topic: 'Muối tôm Tây Ninh',
    subjectTag: '🟢 NỀN MÓNG (DỄ): Muối tôm Tây Ninh',
    question: 'Muối tôm Tây Ninh là thức chấm gia vị nổi tiếng có màu sắc và hương vị đặc trưng nào?',
    options: [
      'Màu xanh rêu, vị đắng chát',
      'Màu đỏ cam cánh gián, vị mặn cay thơm nồng',
      'Màu đen tuyền, vị ngọt béo',
      'Màu trắng đục, vị chua gắt'
    ],
    correctIndex: 1,
    explain: 'Muối tôm Tây Ninh có hạt muối đỏ cam bắt mắt, hòa quyện giữa tôm khô sạch, ớt cay, tỏi và muối tinh khiết.'
  },
  {
    id: 104,
    difficulty: 'easy',
    topic: 'Mãng cầu Bà Đen',
    subjectTag: '🟢 NỀN MÓNG (DỄ): Mãng cầu Bà Đen',
    question: 'Loại trái cây OCOP 4 sao nức tiếng được trồng bạt ngàn quanh chân Núi Bà Đen linh thiêng là gì?',
    options: [
      'Sầu riêng Ri6',
      'Mãng cầu dai (trái na)',
      'Thanh long ruột đỏ',
      'Bưởi da xanh'
    ],
    correctIndex: 1,
    explain: 'Mãng cầu Bà Đen (trái na) đạt chứng nhận OCOP 4 sao và được cấp Chỉ dẫn địa lý nhờ vị ngọt thanh, dai thơm vượt trội.'
  },
  {
    id: 105,
    difficulty: 'easy',
    topic: 'Nhang Vạn Linh Hương',
    subjectTag: '🟢 NỀN MÓNG (DỄ): Nhang Tây Ninh',
    question: 'Sản phẩm OCOP Nhang Vạn Linh Hương thuộc nhóm ngành hàng nào?',
    options: [
      'Nhóm Thực phẩm tươi sống',
      'Nhóm Thủ công mỹ nghệ & Quà lưu niệm',
      'Nhóm Đồ uống giải khát',
      'Nhóm Thức ăn chăn nuôi'
    ],
    correctIndex: 1,
    explain: 'Nhang Vạn Linh Hương thuộc nhóm Thủ công mỹ nghệ, gìn giữ nét đẹp văn hóa tâm linh của vùng đất Tây Ninh.'
  },
  {
    id: 106,
    difficulty: 'easy',
    topic: 'Yến sào Tây Ninh',
    subjectTag: '🟢 NỀN MÓNG (DỄ): Yến sào Tây Ninh',
    question: 'Linh vật đại diện cho sản phẩm Yến sào Tây Ninh trong cẩm nang số OCOP là con vật nào?',
    options: [
      'Chim Yến tinh anh',
      'Chim Bồ câu trắng',
      'Con Đại bàng núi',
      'Con Cò đồng'
    ],
    correctIndex: 0,
    explain: 'Chim Yến là biểu tượng của Yến sào Tây Ninh, tượng trưng cho sức sống dẻo dai và giá trị dinh dưỡng cao cấp.'
  },
  {
    id: 107,
    difficulty: 'easy',
    topic: 'Địa danh Tây Ninh',
    subjectTag: '🟢 NỀN MÓNG (DỄ): Danh thắng Tây Ninh',
    question: 'Địa danh tâm linh và du lịch nổi tiếng được mệnh danh là "Nóc nhà Nam Bộ" tại Tây Ninh là ngọn núi nào?',
    options: [
      'Núi Chứa Chan',
      'Núi Cấm An Giang',
      'Núi Bà Đen',
      'Núi Dinh'
    ],
    correctIndex: 2,
    explain: 'Núi Bà Đen cao 986m, là nóc nhà Nam Bộ, biểu tượng tâm linh và là vùng đất màu mỡ cho trái mãng cầu đặc sản sinh trưởng.'
  },
  {
    id: 108,
    difficulty: 'easy',
    topic: 'Bánh tráng Tân Nhiên',
    subjectTag: '🟢 NỀN MÓNG (DỄ): Bánh tráng tiện lợi',
    question: 'Điểm độc đáo và tiện lợi nhất của sản phẩm OCOP Bánh tráng siêu mỏng Tân Nhiên là gì?',
    options: [
      'Bánh tráng có sẵn nhân thịt',
      'Ăn được ngay mà không cần nhúng nước, dẻo dai tự nhiên',
      'Bắt buộc phải luộc chín trước khi dùng',
      'Chỉ dùng để trang trí món ăn'
    ],
    correctIndex: 1,
    explain: 'Bánh tráng Tân Nhiên nổi tiếng bởi công nghệ tráng mỏng hiện đại, mềm dẻo tự nhiên khi cuốn rau thịt mà không cần nhúng nước.'
  },

  // ===== CẤP 2: TRUNG BÌNH - THÂN THÁP (TẦNG 5 - 8) =====
  {
    id: 201,
    difficulty: 'medium',
    topic: 'Vùng nuôi ong',
    subjectTag: '🟡 THÂN THÁP (TRUNG BÌNH): Địa bàn OCOP',
    question: 'Vùng đất nào ở Tây Ninh được mệnh danh là "thủ phủ" nuôi ong lấy mật hoa cao su và mật rừng trứ danh?',
    options: [
      'Xã Tân Biên và Xã Tân Châu',
      'Phường Long Hoa (TX Hòa Thành)',
      'Phường Trảng Bàng',
      'Huyện Bến Cầu'
    ],
    correctIndex: 0,
    explain: 'Khu vực Xã Tân Biên và Xã Tân Châu sở hữu rừng tự nhiên Lò Gò - Xa Mát và rừng cao su bạt ngàn, tạo điều kiện lý tưởng cho nghề nuôi ong.'
  },
  {
    id: 202,
    difficulty: 'medium',
    topic: 'Di sản Bánh tráng',
    subjectTag: '🟡 THÂN THÁP (TRUNG BÌNH): Di sản văn hóa',
    question: 'Nghề làm Bánh tráng phơi sương Trảng Bàng đã được Bộ Văn hóa, Thể thao và Du lịch vinh danh là gì?',
    options: [
      'Kỷ lục Guinness thế giới',
      'Di sản văn hóa phi vật thể quốc gia',
      'Di sản thiên nhiên thế giới',
      'Di tích lịch sử cấp tỉnh'
    ],
    correctIndex: 1,
    explain: 'Nghề làm bánh tráng phơi sương Trảng Bàng được công nhận là Di sản văn hóa phi vật thể quốc gia nhờ bề dày lịch sử và bí quyết thủ công độc đáo.'
  },
  {
    id: 203,
    difficulty: 'medium',
    topic: 'Bí quyết phơi sương',
    subjectTag: '🟡 THÂN THÁP (TRUNG BÌNH): Kỹ thuật làng nghề',
    question: 'Tại sao người nghệ nhân Trảng Bàng phải canh khoảng 3 - 5 giờ sáng sớm để phơi bánh tráng?',
    options: [
      'Để bánh ngấm hơi sương đêm thanh khiết tạo độ mềm dẻo đặc trưng',
      'Để tránh ánh nắng làm bánh đổi màu xanh',
      'Vì lúc sáng sớm không có gió',
      'Để bánh nhanh khô giòn hơn'
    ],
    correctIndex: 0,
    explain: 'Khoảng 3-5 giờ sáng là lúc sương đọng nhiều nhất, bánh tráng ngấm sương sẽ đạt độ dẻo xốp mịn màng mà không một loại máy móc nào thay thế được.'
  },
  {
    id: 204,
    difficulty: 'medium',
    topic: 'Nghề muối tôm',
    subjectTag: '🟡 THÂN THÁP (TRUNG BÌNH): Nghệ thuật ẩm thực',
    question: 'Điểm độc đáo nhất của nghề làm Muối tôm Tây Ninh - dù Tây Ninh là tỉnh hoàn toàn không giáp biển là gì?',
    options: [
      'Nhập khẩu muối mỏ nhân tạo từ nước ngoài',
      'Nhập tôm và muối biển sạch, phối trộn công phu cùng ớt hiểm, tỏi trồng trên đất Tây Ninh theo công thức gia truyền',
      'Chỉ dùng tôm nuôi trong hồ nhân tạo',
      'Chỉ sấy khô mà không qua quá trình rang lửa'
    ],
    correctIndex: 1,
    explain: 'Sự sáng tạo tài tình của người Tây Ninh khi kết hợp tinh hoa biển (tôm, muối) với sản vật đất đai (ớt cay nồng, tỏi thơm) đã tạo nên loại gia vị trứ danh.'
  },
  {
    id: 205,
    difficulty: 'medium',
    topic: 'Tiêu chuẩn 5 sao OCOP',
    subjectTag: '🟡 THÂN THÁP (TRUNG BÌNH): Tiêu chuẩn OCOP',
    question: 'Sản phẩm đạt chuẩn OCOP 5 sao khác biệt lớn nhất so với 3 sao và 4 sao ở tiêu chí nào?',
    options: [
      'Phải có giá thành đắt đỏ nhất',
      'Đạt chất lượng cấp quốc gia và có tiềm năng vươn ra thị trường xuất khẩu quốc tế',
      'Bắt buộc bao bì phải làm bằng kim loại quý',
      'Do nhà nước trực tiếp điều hành sản xuất'
    ],
    correctIndex: 1,
    explain: 'OCOP 5 sao là thứ hạng cao nhất, chứng nhận sản phẩm đạt chuẩn quốc gia với quy trình kiểm soát nghiêm ngặt và đủ năng lực xuất khẩu toàn cầu.'
  },
  {
    id: 206,
    difficulty: 'medium',
    topic: 'Thổ nhưỡng Núi Bà Đen',
    subjectTag: '🟡 THÂN THÁP (TRUNG BÌNH): Địa lý tự nhiên',
    question: 'Yếu tố tự nhiên nào quanh chân Núi Bà Đen giúp quả mãng cầu tích tụ lượng đường tự nhiên cao và thơm dai?',
    options: [
      'Đất cát pha ngập mặn',
      'Đất xám trên phù sa cổ sườn núi thoát nước tốt kết hợp biên độ nhiệt ngày đêm lớn',
      'Mưa liên tục quanh năm',
      'Đất bùn lầy trũng thấp'
    ],
    correctIndex: 1,
    explain: 'Đất xám sườn núi thoát nước nhanh cùng sự chênh lệch nhiệt độ ngày và đêm lớn quanh Núi Bà Đen giúp cây na tổng hợp đường tự nhiên đậm đà.'
  },
  {
    id: 207,
    difficulty: 'medium',
    topic: 'Làng nghề nhang',
    subjectTag: '🟡 THÂN THÁP (TRUNG BÌNH): Làng nghề truyền thống',
    question: 'Làng nghề làm Nhang Vạn Linh Hương truyền thống phát triển sầm uất và lâu đời nhất tại địa phương nào của Tây Ninh?',
    options: [
      'Phường Long Hoa (Thị xã Hòa Thành)',
      'Huyện Tân Biên',
      'Xã Tân Lập',
      'Huyện Bến Cầu'
    ],
    correctIndex: 0,
    explain: 'Làng nghề nhang Phường Long Hoa (TX Hòa Thành) gắn liền với đời sống tâm linh gần Tòa Thánh Tây Ninh, cung cấp Nhang Vạn Linh Hương khắp cả nước.'
  },
  {
    id: 208,
    difficulty: 'medium',
    topic: 'Bảo hộ chỉ dẫn địa lý',
    subjectTag: '🟡 THÂN THÁP (TRUNG BÌNH): Sở hữu trí tuệ',
    question: 'Mãng cầu Bà Đen Tây Ninh đã được Cục Sở hữu trí tuệ cấp chứng nhận bảo hộ pháp lý quan trọng nào?',
    options: [
      'Bằng độc quyền giải pháp hữu ích',
      'Giấy chứng nhận đăng ký Chỉ dẫn địa lý (GI)',
      'Huy chương vàng thể thao địa phương',
      'Bằng khen công trình xây dựng'
    ],
    correctIndex: 1,
    explain: 'Chỉ dẫn địa lý (GI) khẳng định danh tiếng và chất lượng đặc thù gắn liền với vùng địa lý Núi Bà Đen của quả mãng cầu.'
  },

  // ===== CẤP 3: KHÓ & CHUYÊN SÂU - ĐỈNH THÁP (TẦNG 9 TRỞ LÊN) =====
  {
    id: 301,
    difficulty: 'hard',
    topic: 'Hóa học mật ong',
    subjectTag: '🔴 ĐỈNH THÁP (KHÓ - HÓA HỌC): Kết tinh tự nhiên',
    question: 'Khi để mật ong nguyên chất trong ngăn mát tủ lạnh (14-20°C) thấy lớp hạt mịn lắng ở đáy. Dưới góc độ Hóa học, đây là hiện tượng gì?',
    options: [
      'Mật ong bị người bán trộn đường cát giả',
      'Hiện tượng bão hòa và kết tinh tự nhiên của đường đơn Glucose',
      'Mật ong đã bị lên men chua và phân hủy',
      'Mật bị biến tính hóa học độc hại'
    ],
    correctIndex: 1,
    explain: 'Mật ong thật chứa hàm lượng Glucose tự nhiên cao. Ở nhiệt độ mát, Glucose tự tách bão hòa tạo thành tinh thể hạt mịn – chứng minh mật thật tự nhiên.'
  },
  {
    id: 302,
    difficulty: 'hard',
    topic: 'Sinh học kháng khuẩn',
    subjectTag: '🔴 ĐỈNH THÁP (KHÓ - SINH HỌC): Bảo quản mật tự nhiên',
    question: 'Đàn ong mật bảo quản mật nguyên chất hàng ngàn năm không bị vi khuẩn phân hủy nhờ cơ chế sinh học tinh vi nào?',
    options: [
      'Ong bổ sung chất bảo quản hóa học',
      'Quạt cánh hạ độ ẩm xuống dưới 20% và enzym Glucose Oxidase tạo môi trường pH axit nhẹ (~3.9)',
      'Đun nóng mật lên 100°C trong tổ',
      'Bọc kín mật bằng nhiều lớp sáp kim loại'
    ],
    correctIndex: 1,
    explain: 'Độ ẩm cực thấp ngăn vi khuẩn hút nước, cộng với pH axit nhẹ do ong tạo ra tạo môi trường bất lợi khiến vi sinh vật hoàn toàn bị ức chế.'
  },
  {
    id: 303,
    difficulty: 'hard',
    topic: 'Dinh dưỡng Yến sào',
    subjectTag: '🔴 ĐỈNH THÁP (KHÓ - SINH HÓA): Vi chất yến sào',
    question: 'Hợp chất sinh học quý giá trong Yến sào Tây Ninh có tác dụng thúc đẩy tái tạo tế bào và tăng cường miễn dịch là gì?',
    options: [
      'Axit Sialic (N-acetylneuraminic acid) và 18 loại axit amin thiết yếu',
      'Axit Citric trong chanh',
      'Tinh bột tinh chế',
      'Chất béo bão hòa động vật'
    ],
    correctIndex: 0,
    explain: 'Axit Sialic chiếm tỷ lệ cao trong tổ yến, là vi chất sinh học đặc biệt giúp dẫn truyền thần kinh, tăng sức đề kháng và phục hồi sức khỏe.'
  },
  {
    id: 304,
    difficulty: 'hard',
    topic: 'Hóa sinh Muối tôm',
    subjectTag: '🔴 ĐỈNH THÁP (KHÓ - HÓA THỰC PHẨM): Phản ứng rang muối',
    question: 'Khi rang muối ớt tôm trên chảo lửa nhỏ, phản ứng hóa học nào diễn ra giữa protein tôm và đường tự nhiên tạo mùi thơm nồng và màu đỏ cam?',
    options: [
      'Phản ứng quang hợp diệp lục',
      'Phản ứng Maillard (tạo màu và hương vị nâu thơm đặc trưng)',
      'Phản ứng lên men rượu',
      'Phản ứng phân hạch hạt nhân'
    ],
    correctIndex: 1,
    explain: 'Phản ứng Maillard giữa axit amin trong thịt tôm và đường tự nhiên dưới nhiệt độ rang vừa phải tạo ra hàng chục hợp chất hương thơm đặc trưng của muối tôm.'
  },
  {
    id: 305,
    difficulty: 'hard',
    topic: 'Chất kết dính tự nhiên',
    subjectTag: '🔴 ĐỈNH THÁP (KHÓ - DƯỢC LIỆU): Nhang Vạn Linh Hương',
    question: 'Chất kết dính tự nhiên truyền thống dùng làm nhang Vạn Linh Hương mà không cần hóa chất công nghiệp là gì?',
    options: [
      'Keo dán tổng hợp PVA',
      'Bột vỏ cây bời lời tự nhiên xay mịn',
      'Nhựa cao su sống',
      'Bột xi măng trắng'
    ],
    correctIndex: 1,
    explain: 'Vỏ cây bời lời chứa lượng chất nhầy tự nhiên cao, khi gặp nước tạo độ dẻo kết dính tuyệt hảo cho bột Nhang Vạn Linh Hương, hoàn toàn an toàn cho sức khỏe.'
  },
  {
    id: 306,
    difficulty: 'hard',
    topic: 'Quang hợp và độ Brix',
    subjectTag: '🔴 ĐỈNH THÁP (KHÓ - NÔNG HỌC): Độ ngọt trái cây',
    question: 'Địa hình sườn dốc hướng Đông - Đông Nam của Núi Bà Đen đem lại ưu thế vượt trội gì cho quá trình quang hợp của cây mãng cầu?',
    options: [
      'Hứng trọn ánh nắng mặt trời buổi sớm dồi dào, tối ưu hóa quá trình quang hợp tạo đường tự nhiên (độ Brix cao)',
      'Che khuất hoàn toàn ánh nắng để cây ngủ đông',
      'Tạo gió lốc giúp cây rụng bớt lá',
      'Giữ độ ẩm đầm lầy quanh rễ cây'
    ],
    correctIndex: 0,
    explain: 'Sườn đón nắng Đông - Đông Nam đón nguồn ánh sáng sớm chất lượng cao, giúp lá na quang hợp tối đa, chuyển hóa tinh bột thành đường fructose và glucose dai ngọt.'
  },
  {
    id: 307,
    difficulty: 'hard',
    topic: 'Di sản Muối ớt',
    subjectTag: '🔴 ĐỈNH THÁP (KHÓ - VĂN HÓA): Di sản phi vật thể',
    question: 'Nghề làm Muối ớt Tây Ninh đã được Bộ Văn hóa, Thể thao và Du lịch đưa vào Danh mục Di sản văn hóa phi vật thể quốc gia vào năm nào?',
    options: [
      'Năm 1995',
      'Năm 2005',
      'Năm 2023',
      'Năm 2010'
    ],
    correctIndex: 2,
    explain: 'Vào tháng 2/2023, Nghề làm muối ớt Tây Ninh chính thức được công nhận là Di sản văn hóa phi vật thể quốc gia, khẳng định giá trị ẩm thực độc đáo của địa phương.'
  },
  {
    id: 308,
    difficulty: 'hard',
    topic: 'Kỹ năng số OCOP',
    subjectTag: '🔴 ĐỈNH THÁP (KHÓ - TRUY XUẤT): Kiểm chứng OCOP',
    question: 'Khi muốn xác thực một sản phẩm có đạt chuẩn OCOP chính thống hay không, phương pháp kiểm chứng số khoa học nhất của học sinh là gì?',
    options: [
      'Chỉ nghe theo lời quảng cáo trên mạng xã hội',
      'Quét mã QR truy xuất nguồn gốc và đối chiếu số quyết định phê duyệt trên Cổng thông tin OCOP tỉnh Tây Ninh',
      'Chỉ cần bao bì in chữ "Sản phẩm OCOP cao cấp"',
      'Xem giá bán có cao hơn các sản phẩm khác không'
    ],
    correctIndex: 1,
    explain: 'Sản phẩm OCOP chân chính luôn có mã QR truy xuất và số quyết định của UBND tỉnh phê duyệt, giúp người tiêu dùng kiểm chứng nguồn gốc một cách minh bạch.'
  }
];

export const STEM_ADVENTURE_QUESTIONS: QuizQuestion[] = KNOWLEDGE_TOWER_QUESTIONS;

/**
 * Danh sách 6 nhân vật linh vật đồng hành trong Mini-Game STEM
 * Ứng với đúng 6 con vật trên Bản đồ và Kho sản phẩm OCOP Tây Ninh:
 * 1. Con Ong (Mật ong)
 * 2. Con Sâu (Mãng cầu Bà Đen)
 * 3. Con Sóc (Bánh tráng)
 * 4. Con Tôm (Muối tôm)
 * 5. Con Yến (Yến sào)
 * 6. Con Rồng (Nhang Vạn Linh Hương)
 */
export interface StemCharacter {
  key: OcopMascotKey;
  name: string;
  role: string;
  badge: string;
  desc: string;
}

export const STEM_CHARACTERS: StemCharacter[] = [
  {
    key: 'bee',
    name: 'Ong Vàng Chăm Chỉ',
    badge: 'Mật ong – Con Ong',
    role: 'Linh vật Mật ong Bảo An',
    desc: 'Chăm chỉ, nhanh nhẹn, khám phá và bảo vệ nguồn mật ong rừng Lò Gò – Xa Mát và hoa sao dầu đạt chuẩn OCOP 4 sao Tây Ninh.'
  },
  {
    key: 'caterpillar',
    name: 'Sâu Xanh Kiên Cường',
    badge: 'Mãng cầu – Con Sâu',
    role: 'Linh vật Mãng cầu Bà Đen',
    desc: 'Kiên định, am hiểu thổ nhưỡng đất xám phù sa sườn Núi Bà Đen (Phường Bình Minh & Xã Tân Phú).'
  },
  {
    key: 'squirrel',
    name: 'Sóc Nâu Thông Thái',
    badge: 'Bánh tráng – Con Sóc',
    role: 'Linh vật Bánh tráng Tân Nhiên',
    desc: 'Khéo léo, am hiểu nghệ thuật tráng bánh siêu mỏng OCOP 5 sao Quốc gia và các dòng bánh tráng trộn OCOP 3 sao.'
  },
  {
    key: 'shrimp',
    name: 'Tôm Đỏ Năng Động',
    badge: 'Muối tôm – Con Tôm',
    role: 'Linh vật Muối tôm Thắng Lợi',
    desc: 'Năng động, đậm đà, bậc thầy sáng tạo nên thức chấm muối tôm ớt cay thơm chuẩn OCOP 3 sao xứ Tây Ninh.'
  },
  {
    key: 'swallow',
    name: 'Chim Yến Tinh Anh',
    badge: 'Yến sào – Con Yến',
    role: 'Linh vật Yến sào Yến Loan',
    desc: 'Nhanh nhẹn, bay lượn trên cao, bảo hộ tổ yến sơ chế sạch đạt chuẩn OCOP 4 sao duy trì giai đoạn 2026 – 2029.'
  },
  {
    key: 'dragon',
    name: 'Rồng Nhỏ Cát Tường',
    badge: 'Nhang – Con Rồng',
    role: 'Linh vật Nhang Vạn Linh Hương',
    desc: 'Trang nghiêm, lưu giữ nét đẹp văn hóa tâm linh và làng nghề nhang cổ truyền đạt chuẩn OCOP 3 sao tại Phường Long Hoa.'
  }
];

/**
 * Dữ liệu 6 Sản phẩm & 6 Con vật trên Bản đồ OCOP Tây Ninh (Trạm 2)
 * Ứng với đúng 6 hình minh họa trong ảnh:
 * 1. Mật ong - Con Ong
 * 2. Mãng cầu - Con Sâu
 * 3. Bánh tráng - Con Sóc
 * 4. Muối tôm - Con Tôm
 * 5. Yến sào - Con Yến
 * 6. Nhang - Con Rồng
 */
export const MAP_PRODUCT_PINS: MapProductPin[] = [
  {
    key: 'honey',
    name: 'Mật ong Bảo An',
    shortLabel: 'Mật ong – Con Ong',
    district: 'Phường Tân Ninh',
    coordinates: { x: 20, y: 32 },
    patrolWaypoints: [
      { x: 20, y: 32 },
      { x: 27, y: 26 },
      { x: 32, y: 34 },
      { x: 24, y: 40 },
      { x: 20, y: 32 }
    ],
    mascotKey: 'bee',
    mascotName: 'Con Ong',
    mascotBadge: 'Mật ong - Con Ong',
    mascotImage: '/image/mascot-mat-ong.png',
    icon: '🐝',
    title: 'Mật Ong Bảo An Tây Ninh (OCOP 4 Sao) – Linh vật Con Ong Chăm Chỉ',
    location: '📍 Địa chỉ: Số 47, hẻm 48, đường Cách Mạng Tháng Tám, Phường Tân Ninh, Tỉnh Tây Ninh',
    desc: 'Mật ong Bảo An (Công ty TNHH MTV Ong Mật Bảo An Tây Ninh) hiện có 2 sản phẩm chủ lực đạt chuẩn OCOP 4 sao tỉnh Tây Ninh: Mật ong rừng VQG Lò Gò – Xa Mát (công nhận đợt 2/2024) và Mật ong hoa sao, dầu Bảo An; cùng dòng Mật ong hoa nhãn đạt chuẩn OCOP 3 sao. Sản phẩm khai thác từ nguồn hoa tự nhiên Tây Ninh, giữ trọn enzym quý giá, vị ngọt thanh dịu và giá trị dinh dưỡng cao.',
    hasVideo: false,
    productImage: '/image/map-matong.jpg',
    profile: {
      productName: 'Mật Ong Bảo An – Đạt Chuẩn OCOP 4 Sao Tây Ninh',
      locality: 'Số 47, hẻm 48, đường Cách Mạng Tháng Tám, Phường Tân Ninh, Tỉnh Tây Ninh',
      producer: 'Công ty TNHH MTV Ong Mật Bảo An Tây Ninh (Đại diện: Nguyễn Đình Vinh)',
      contact: 'Điện thoại: 0909 215 615 / 0918 858 099 / 0916 088 405',
      category: 'Thực phẩm (Sản phẩm OCOP 4 Sao & 3 Sao)',
      ocopRating: 'Đạt chuẩn OCOP 4 sao tỉnh Tây Ninh',
      decisionCode: 'Chứng nhận đạt chuẩn OCOP 4 sao tỉnh Tây Ninh (Đợt 2/2024)'
    },
    documentarySummary: {
      duration: '02:15',
      highlights: [
        'Công ty TNHH MTV Ong Mật Bảo An Tây Ninh (Đại diện: ông Nguyễn Đình Vinh) có 2 sản phẩm chủ lực đạt chuẩn OCOP 4 sao: Mật ong rừng VQG Lò Gò – Xa Mát (đợt 2/2024) và Mật ong hoa sao, dầu.',
        'Dòng Mật ong hoa nhãn đạt OCOP 3 sao; quy trình tách ẩm hạ thủy phần khép kín giữ trọn enzym tự nhiên và khoáng chất quý.'
      ],
      productionSteps: [
        '01. Khai thác mật ong chín tự nhiên từ rừng VQG Lò Gò – Xa Mát và hoa sao, dầu Tây Ninh',
        '02. Lọc tinh khiết và hạ thủy phần bằng công nghệ chuẩn hóa an toàn thực phẩm OCOP 4 sao',
        '03. Đóng chai, dán tem nhãn OCOP 4 sao Công ty TNHH MTV Ong Mật Bảo An (Phường Tân Ninh)'
      ]
    },
    fieldQuiz: {
      question: 'Thông tin chính xác về các dòng sản phẩm đạt chuẩn OCOP của Mật ong Bảo An Tây Ninh là gì?',
      options: [
        { val: '1', label: 'A. Có 2 dòng chủ lực đạt OCOP 4 sao (Mật ong rừng VQG Lò Gò – Xa Mát đợt 2/2024 & Mật ong hoa sao, dầu) và Mật ong hoa nhãn đạt OCOP 3 sao' },
        { val: '2', label: 'B. Nhập khẩu toàn bộ từ nước ngoài về bán không có chứng nhận OCOP' },
        { val: '3', label: 'C. Chỉ sản xuất mật nhân tạo chưa được kiểm định' }
      ],
      correctVal: '1',
      correctExplain: 'Chính xác! Mật ong Bảo An (Phường Tân Ninh) có 2 dòng chủ lực đạt OCOP 4 sao (Mật ong rừng Lò Gò – Xa Mát đợt 2/2024 & Mật ong hoa sao, dầu) cùng dòng Mật ong hoa nhãn OCOP 3 sao.',
      wrongExplain: 'Chưa đúng! Hãy xem lại hồ sơ OCOP 4 sao của Mật ong Bảo An Tây Ninh ở phía trên nhé.'
    }
  },
  {
    key: 'custardapple',
    name: 'Mãng cầu',
    shortLabel: 'Mãng cầu – Con Sâu',
    district: 'Phường Bình Minh – Xã Tân Phú',
    coordinates: { x: 50, y: 30 },
    patrolWaypoints: [
      { x: 50, y: 30 },
      { x: 56, y: 24 },
      { x: 60, y: 32 },
      { x: 53, y: 38 },
      { x: 50, y: 30 }
    ],
    mascotKey: 'caterpillar',
    mascotName: 'Con Sâu',
    mascotBadge: 'Mãng cầu - Con Sâu',
    mascotImage: '/image/mascot-mang-cau.png',
    icon: '🐛',
    title: 'Mãng Cầu Bà Đen Tây Ninh – Linh vật Con Sâu Xanh',
    location: '📍 Địa chỉ mới: Số 1 Phạm Công Khiêm, Xã Tân Châu & Xã Tân Phú (vùng trồng Phường Bình Minh – Phường Tân Ninh), tỉnh Tây Ninh',
    desc: 'Đặc sản Mãng cầu Bà Đen (như thương hiệu Mãng cầu Minh Trung thuộc HTX Dịch vụ nông nghiệp Minh Trung) phát triển mạnh quanh chân Núi Bà Đen (Phường Bình Minh, Phường Tân Ninh) và Xã Tân Phú – Xã Tân Châu. Canh tác theo chuẩn VietGAP nên trái to, gai nở phẳng, thịt dai trắng ngà và thơm ngọt tự nhiên.',
    hasVideo: true,
    videoSrc: '/image/mang-cau.mov',
    bottomImage: '/image/map-mangcau.jpg',
    profile: {
      productName: 'Mãng Cầu Bà Đen – Minh Trung Tây Ninh',
      locality: 'Phường Bình Minh, Phường Tân Ninh & Xã Tân Phú, Xã Tân Châu, tỉnh Tây Ninh',
      producer: 'Hợp tác xã Dịch vụ nông nghiệp Minh Trung',
      contact: 'Hotline: 0918 268 242',
      category: 'Nông sản / Thực phẩm tươi (OCOP 4 Sao)',
      ocopRating: 'Sản phẩm OCOP 4 sao đặc sản Tây Ninh',
      decisionCode: 'Chứng nhận VietGAP & OCOP 4 sao tỉnh Tây Ninh'
    },
    documentarySummary: {
      duration: '02:40',
      highlights: [
        'Vùng trồng đất xám phù sa cổ quanh chân Núi Bà Đen (Phường Bình Minh) có biên độ nhiệt ngày đêm lớn giúp trái tích đường.',
        'Mỗi hộp mãng cầu đều có tem QR truy xuất lô vườn trồng VietGAP.'
      ],
      productionSteps: [
        '01. Chăm sóc hữu cơ theo tiêu chuẩn VietGAP tại Phường Bình Minh & Xã Tân Phú',
        '02. Thu hoạch khi gai nở phẳng, da xanh kem sáng',
        '03. Phân loại kích cỡ và dán tem truy xuất nguồn gốc HTX Minh Trung'
      ]
    },
    fieldQuiz: {
      question: 'Thông tin nào giúp em xác minh đúng nguồn gốc Mãng cầu Bà Đen đạt chuẩn OCOP 4 sao?',
      options: [
        { val: '1', label: 'A. Số lượt thích trên mạng xã hội' },
        { val: '2', label: 'B. Tên HTX Dịch vụ nông nghiệp Minh Trung, chứng nhận VietGAP và địa chỉ tại Phường Bình Minh / Xã Tân Phú, Tây Ninh' },
        { val: '3', label: 'C. Chỉ nhìn màu sắc bên ngoài vỏ quả' }
      ],
      correctVal: '2',
      correctExplain: 'Chính xác! Con Sâu Xanh nhắc bạn luôn kiểm tra tên HTX, chứng nhận VietGAP và địa chỉ mới tại Phường Bình Minh – Xã Tân Phú.',
      wrongExplain: 'Chưa đúng! Hãy kiểm tra tên chủ thể HTX và địa chỉ vùng trồng trên tem truy xuất nhé.'
    }
  },
  {
    key: 'ricepaper',
    name: 'Bánh tráng',
    shortLabel: 'Bánh tráng – Con Sóc',
    district: 'Phường Long Hoa – Phường Trảng Bàng',
    coordinates: { x: 80, y: 33 },
    patrolWaypoints: [
      { x: 80, y: 33 },
      { x: 85, y: 26 },
      { x: 74, y: 27 },
      { x: 75, y: 39 },
      { x: 80, y: 33 }
    ],
    mascotKey: 'squirrel',
    mascotName: 'Con Sóc',
    mascotBadge: 'Bánh tráng - Con Sóc',
    mascotImage: '/image/mascot-banh-trang.png',
    icon: '🐿️',
    title: 'Bánh Tráng Tân Nhiên Tây Ninh – Linh vật Con Sóc Khéo Léo',
    location: '• Địa chỉ cơ sở sản xuất: Số 6 (hoặc số 1), hẻm 34, đường Nguyễn Lương Bằng, phường Long Hoa, thị xã Hòa Thành, tỉnh Tây Ninh.\n• Cửa hàng trưng bày/phân phối tại Tây Ninh: Số 02, Đặng Ngọc Chinh, Khu phố 1, Phường Tân Ninh, Tây Ninh',
    desc: 'Công ty TNHH Tân Nhiên sở hữu Bánh tráng siêu mỏng Tân Nhiên (không nhúng nước) là sản phẩm chủ lực đầu tiên của tỉnh Tây Ninh được Bộ Nông nghiệp và Phát triển nông thôn công nhận đạt OCOP 5 sao Quốc gia (tháng 1/2025). Đồng thời, 4 dòng bánh tráng trộn ăn liền của công ty (phô mai, sa tế tỏi, sa tế tôm hành, ớt bay muối nhuyễn siêu cay) được tỉnh Tây Ninh công nhận đạt chuẩn OCOP 3 sao cấp Tỉnh.',
    hasVideo: false,
    productImage: '/image/map-banhtrang.jpg',
    profile: {
      productName: 'Bánh Tráng Siêu Mỏng Tân Nhiên (OCOP 5 Sao) & Bánh Tráng Trộn (OCOP 3 Sao)',
      locality: '• Địa chỉ cơ sở sản xuất: Số 6 (hoặc số 1), hẻm 34, đường Nguyễn Lương Bằng, phường Long Hoa, thị xã Hòa Thành, tỉnh Tây Ninh.\n• Cửa hàng trưng bày/phân phối tại Tây Ninh: Số 02, Đặng Ngọc Chinh, Khu phố 1, Phường Tân Ninh, Tây Ninh',
      producer: 'Công ty TNHH Tân Nhiên',
      contact: 'Cơ sở: Hẻm 34 Nguyễn Lương Bằng, P. Long Hoa | Showroom: Số 02 Đặng Ngọc Chinh, P. Tân Ninh',
      category: 'Thực phẩm chế biến & Xuất khẩu',
      ocopRating: 'OCOP 5 Sao Cấp Quốc Gia & OCOP 3 Sao Cấp Tỉnh',
      decisionCode: 'QĐ công nhận OCOP 5 Sao Quốc Gia (Bộ NN&PTNT 1/2025) & OCOP 3 Sao Tỉnh'
    },
    documentarySummary: {
      duration: '02:30',
      highlights: [
        'Hạng OCOP 5 sao (Cấp Quốc gia): Bánh tráng siêu mỏng Tân Nhiên (không nhúng nước) – công nhận 1/2025 (quy cách 120g, 250g, 300g, 400g, 450g).',
        'Hạng OCOP 3 sao (Cấp Tỉnh): 4 dòng bánh tráng trộn ăn liền (phô mai, sa tế tỏi, sa tế tôm hành, ớt bay muối nhuyễn siêu cay).',
        'Cơ sở sản xuất: Số 6 (hoặc số 1), hẻm 34 Nguyễn Lương Bằng, P. Long Hoa, TX Hòa Thành | Cửa hàng trưng bày: Số 02 Đặng Ngọc Chinh, P. Tân Ninh.'
      ],
      productionSteps: [
        '01. Tuyển chọn tinh bột khoai mì thuần khiết và nước sạch tinh lọc hiện đại',
        '02. Dây chuyền tráng siêu mỏng tự động khép kín tiệt trùng UV và sấy phòng nhiệt FSSC 22000',
        '03. Đóng gói quy cách 120g - 450g dán tem OCOP 5 sao Quốc gia và bao bì bánh tráng trộn OCOP 3 sao'
      ]
    },
    fieldQuiz: {
      question: 'Bánh tráng Tân Nhiên sở hữu những hạng sao OCOP và địa chỉ cơ sở như thế nào?',
      options: [
        { val: '1', label: 'A. Bánh tráng siêu mỏng đạt OCOP 5 sao Quốc gia (1/2025), 4 dòng bánh tráng trộn đạt OCOP 3 sao; Cơ sở tại đường Nguyễn Lương Bằng (TX Hòa Thành) & Showroom tại đường Đặng Ngọc Chinh (TP Tây Ninh)' },
        { val: '2', label: 'B. Chỉ đạt OCOP 1 sao và không có cơ sở ở Tây Ninh' },
        { val: '3', label: 'C. Bánh tráng bắt buộc phải nhúng nước mới dùng được' }
      ],
      correctVal: '1',
      correctExplain: 'Chính xác! Bánh tráng siêu mỏng Tân Nhiên đạt chuẩn OCOP 5 sao Quốc gia và 4 dòng bánh tráng trộn đạt OCOP 3 sao, với cơ sở sản xuất tại P. Long Hoa và cửa hàng trưng bày tại P. Tân Ninh.',
      wrongExplain: 'Chưa đúng! Hãy kiểm tra thông tin OCOP 5 sao Quốc gia và 2 địa chỉ cụ thể của Bánh tráng Tân Nhiên nhé.'
    }
  },
  {
    key: 'shrimpsalt',
    name: 'Muối tôm Thắng Lợi',
    shortLabel: 'Muối tôm – Con Tôm',
    district: 'Xã Châu Thành',
    coordinates: { x: 21, y: 71 },
    patrolWaypoints: [
      { x: 21, y: 71 },
      { x: 28, y: 65 },
      { x: 29, y: 76 },
      { x: 16, y: 77 },
      { x: 21, y: 71 }
    ],
    mascotKey: 'shrimp',
    mascotName: 'Con Tôm',
    mascotBadge: 'Muối tôm - Con Tôm',
    mascotImage: '/image/mascot-muoi-tom.png',
    icon: '🦐',
    title: 'Muối Tôm Thắng Lợi (OCOP 3 Sao) – Linh vật Con Tôm',
    location: '📍 Địa chỉ: 2426, ấp Bình Hòa, Xã Châu Thành, Tỉnh Tây Ninh, Việt Nam',
    desc: 'Muối tôm Thắng Lợi đạt chuẩn OCOP 3 sao do Cơ sở sản xuất Muối Thắng Lợi tại ấp Bình Hòa, Xã Châu Thành, Tây Ninh chế biến. Sản phẩm tuyển chọn ớt tươi mọng, tôm khô loại 1 và muối hạt tinh khiết, phối trộn theo tỉ lệ vàng gia truyền và sử dụng công nghệ sấy khô hiện đại giúp muối giữ trọn màu sắc tự nhiên, mùi thơm đặc trưng và độ giòn tan.',
    hasVideo: false,
    productImage: '/image/map-muoitom.jpg',
    profile: {
      productName: 'Muối Tôm Thắng Lợi Tây Ninh (OCOP 3 Sao)',
      locality: '2426, ấp Bình Hòa, Xã Châu Thành, Tỉnh Tây Ninh, Việt Nam',
      producer: 'Cơ sở sản xuất Muối Thắng Lợi',
      contact: 'ĐT: 0913 161 525 · Email: muoithangloi@gmail.com · Web: muoithangloi.com',
      category: 'Thực phẩm / Gia vị truyền thống (OCOP 3 Sao)',
      ocopRating: 'Chứng nhận OCOP 3 sao tỉnh Tây Ninh',
      decisionCode: 'Di sản văn hóa phi vật thể quốc gia & Chứng nhận OCOP 3 sao',
      officialUrl: 'https://muoithangloi.com'
    },
    documentarySummary: {
      duration: '02:05',
      highlights: [
        'Quy trình 3 bước khép kín tại Cơ sở sản xuất Muối Thắng Lợi (2426, ấp Bình Hòa, Xã Châu Thành, Tây Ninh).',
        'Công nghệ sấy khô hiện đại giúp giữ trọn màu sắc tự nhiên, mùi thơm đặc trưng và độ giòn tan.'
      ],
      productionSteps: [
        '01. Tuyển chọn nguyên liệu tươi sạch: ớt tươi mọng, tôm khô loại 1 và muối hạt tinh khiết nhất',
        '02. Sơ chế & chế biến theo tỉ lệ vàng: xay nhuyễn và phối trộn theo công thức gia truyền Thắng Lợi',
        '03. Công nghệ sấy khô hiện đại: sấy nhiệt độ tiêu chuẩn giữ trọn màu sắc tự nhiên và độ giòn tan'
      ]
    },
    fieldQuiz: {
      question: 'Quy trình 3 bước sản xuất Muối tôm Thắng Lợi (OCOP 3 sao) tại Xã Châu Thành gồm những công đoạn nào?',
      options: [
        { val: '1', label: 'A. Tuyển chọn nguyên liệu tươi sạch -> Sơ chế & chế biến theo tỉ lệ vàng gia truyền -> Công nghệ sấy khô hiện đại' },
        { val: '2', label: 'B. Dùng phẩm màu công nghiệp để tạo màu đỏ cho muối' },
        { val: '3', label: 'C. Chỉ dùng muối trắng không phối trộn tôm khô và ớt tươi' }
      ],
      correctVal: '1',
      correctExplain: 'Chính xác! Cơ sở Muối Thắng Lợi (ấp Bình Hòa, Xã Châu Thành) áp dụng quy trình 3 bước chuẩn mực giúp muối giòn tan, thơm ngon chuẩn OCOP 3 sao.',
      wrongExplain: 'Chưa đúng! Hãy xem lại quy trình 3 bước (Tuyển chọn -> Tỉ lệ vàng -> Sấy khô hiện đại) của Muối tôm Thắng Lợi nhé.'
    }
  },
  {
    key: 'birdsnest',
    name: 'Yến sào Yến Loan',
    shortLabel: 'Yến sào – Con Yến',
    district: 'Phường Tân Ninh',
    coordinates: { x: 51, y: 69 },
    patrolWaypoints: [
      { x: 51, y: 69 },
      { x: 58, y: 62 },
      { x: 59, y: 74 },
      { x: 45, y: 74 },
      { x: 51, y: 69 }
    ],
    mascotKey: 'swallow',
    mascotName: 'Con Yến',
    mascotBadge: 'Yến sào - Con Yến',
    mascotImage: '/image/mascot-yen-sao.png',
    icon: '🐦',
    title: 'Yến Sào Yến Loan (OCOP 4 Sao Giai Đoạn 2026–2029) – Linh vật Chim Yến',
    location: '📍 Địa chỉ: 116B Nguyễn Chí Thanh, Khu phố 2, Phường 3 (Phường Tân Ninh), Thành phố Tây Ninh, Tỉnh Tây Ninh',
    desc: 'Yến Sào Yến Loan (Công ty TNHH Loan Phát Huy) hiện có 1 sản phẩm đạt chứng nhận OCOP 4 sao: Yến sào sơ chế - thương hiệu Yến sào Yến Loan (dòng tổ yến sạch làm sạch lông thủ công). Sản phẩm được công nhận đạt chuẩn OCOP 4 sao lần đầu vào năm 2022, sau đó tiếp tục được đánh giá gia hạn và duy trì hạng 4 sao cho giai đoạn 2026 – 2029.',
    hasVideo: false,
    productImage: '/image/map-yensao.jpg',
    bottomImage: '/image/map-yensao1.jpg',
    profile: {
      productName: 'Yến sào sơ chế – thương hiệu Yến sào Yến Loan (dòng tổ yến sạch làm sạch lông thủ công)',
      locality: '116B Nguyễn Chí Thanh, Khu phố 2, Phường 3 (Phường Tân Ninh), TP. Tây Ninh',
      producer: 'Công ty TNHH Loan Phát Huy (Hoạt động từ năm 2016)',
      contact: 'ĐT: 0939 431 486 - 0919 398 768 · Hotline: 0793 392 959 / 0919 392 959 · Email: yensaoyenloan@gmail.com',
      category: 'Thực phẩm bổ dưỡng cao cấp (OCOP 4 Sao)',
      ocopRating: 'Đạt chuẩn OCOP 4 sao (Duy trì giai đoạn 2026 – 2029)',
      decisionCode: 'QĐ 460/QĐ-UBND (OCOP 4 sao 2026–2029) & HACCP'
    },
    documentarySummary: {
      duration: '02:20',
      highlights: [
        'Tên sản phẩm đạt chuẩn: Yến sào sơ chế - thương hiệu Yến sào Yến Loan (dòng tổ yến sạch làm sạch lông thủ công).',
        'Thời hạn công nhận: Sản phẩm được công nhận đạt chuẩn OCOP 4 sao lần đầu năm 2022, tiếp tục được đánh giá gia hạn và duy trì hạng 4 sao cho giai đoạn 2026 – 2029.',
        '100% tổ yến nguyên chất, quy trình sơ chế nhặt lông thủ công khép kín đạt chuẩn ATVSTP, chứng nhận quốc tế HACCP, cam kết đền bù gấp 10 lần nếu phát hiện hàng giả.'
      ],
      productionSteps: [
        '01. Thu hoạch tổ yến nguyên chất từ hệ thống nhà yến sinh thái tiêu chuẩn tại Tây Ninh',
        '02. Sơ chế làm sạch lông hoàn toàn thủ công bằng nước tinh khiết tiệt trùng, bảo toàn 18 axit amin và axit sialic',
        '03. Định hình tổ, sấy khô tiệt trùng tia cực tím UV và đóng hộp tem OCOP 4 sao (giai đoạn 2026–2029)'
      ]
    },
    fieldQuiz: {
      question: 'Thông tin nào chính xác về hồ sơ chứng nhận OCOP của Yến Sào Yến Loan (Công ty TNHH Loan Phát Huy)?',
      options: [
        { val: '1', label: 'A. Sản phẩm đạt chuẩn: Yến sào sơ chế (làm sạch lông thủ công), công nhận OCOP 4 sao năm 2022 và tiếp tục được đánh giá gia hạn duy trì giai đoạn 2026 – 2029' },
        { val: '2', label: 'B. Sản phẩm chưa từng được cấp chứng nhận an toàn thực phẩm' },
        { val: '3', label: 'C. Đã hết hạn công nhận OCOP và không được gia hạn' }
      ],
      correctVal: '1',
      correctExplain: 'Chính xác! Yến sào Yến Loan đạt chuẩn OCOP 4 sao lần đầu năm 2022 và tiếp tục được đánh giá gia hạn duy trì hạng 4 sao giai đoạn 2026 – 2029.',
      wrongExplain: 'Chưa đúng! Hãy kiểm tra hồ sơ sản phẩm Yến sào sơ chế đạt OCOP 4 sao duy trì giai đoạn 2026 – 2029 nhé.'
    }
  },
  {
    key: 'incense',
    name: 'Nhang',
    shortLabel: 'Nhang – Con Rồng',
    district: 'Phường Long Hoa',
    coordinates: { x: 81, y: 71 },
    patrolWaypoints: [
      { x: 81, y: 71 },
      { x: 86, y: 64 },
      { x: 74, y: 64 },
      { x: 75, y: 76 },
      { x: 81, y: 71 }
    ],
    mascotKey: 'dragon',
    mascotName: 'Con Rồng',
    mascotBadge: 'Nhang - Con Rồng',
    mascotImage: '/image/mascot-nhang.png',
    icon: '🐉',
    title: 'Nhang Vạn Linh Hương (OCOP 3 Sao) – Linh vật Rồng Nhỏ Cát Tường',
    location: '📍 Địa chỉ mới: Số 68, đường số 34 Trần Phú, khu phố Long Hải, Phường Long Hoa, thị xã Hòa Thành, tỉnh Tây Ninh',
    desc: 'Cơ sở Vạn Linh Hương tại Phường Long Hoa có 3 dòng sản phẩm chủ lực được tỉnh Tây Ninh công nhận đạt chuẩn OCOP 3 sao: Nhang Vạn Linh Hương Phật Bà Tây Bổ Đà Sơn (bột đinh hương / lá tràm trà tự nhiên Đảo Nhím hồ Dầu Tiếng), Nhang Vạn Linh Hương hương quế thượng hạng (bột vỏ quế tự nhiên) và Nhang Vạn Linh Hương gỗ tùng trầm (gỗ tùng và trầm hương tự nhiên). Đóng gói hộp lục giác trung, lục giác đại với kích thước 3 tấc hoặc 4 tấc.',
    hasVideo: true,
    videoSrc: '/image/nhang.mov',
    bottomImage: '/image/map-nhang.jpg',
    profile: {
      productName: 'Nhang Vạn Linh Hương (3 Dòng Sản Phẩm Đạt Chuẩn OCOP 3 Sao)',
      locality: 'Số 68, đường số 34 Trần Phú, khu phố Long Hải, Phường Long Hoa, thị xã Hòa Thành, tỉnh Tây Ninh',
      producer: 'Cơ sở nhang Vạn Linh Hương',
      contact: 'facebook.com/nhangthiennhienVanLinhHuong',
      category: 'Thủ công mỹ nghệ / Quà lưu niệm văn hóa (OCOP 3 Sao)',
      ocopRating: 'Đạt chuẩn OCOP 3 sao tỉnh Tây Ninh',
      decisionCode: 'QĐ công nhận sản phẩm OCOP 3 sao tỉnh Tây Ninh',
      officialUrl: 'https://www.facebook.com/nhangthiennhienVanLinhHuong'
    },
    documentarySummary: {
      duration: '01:55',
      highlights: [
        'Cơ sở có 3 dòng sản phẩm chủ lực được tỉnh Tây Ninh công nhận đạt chuẩn OCOP 3 sao: Nhang Phật Bà Tây Bổ Đà Sơn, Nhang hương quế thượng hạng và Nhang gỗ tùng trầm.',
        'Quy cách đóng gói hộp lục giác trung, lục giác đại với kích thước 3 tấc hoặc 4 tấc; 100% nguyên liệu tự nhiên (vỏ quế, tùng trầm, tràm trà Đảo Nhím, bột keo bời lời), không hóa chất độc hại.'
      ],
      productionSteps: [
        '01. Tuyển chọn nguyên liệu thảo mộc: vỏ quế, gỗ tùng trầm, lá tràm trà Đảo Nhím và bột keo bời lời',
        '02. Phóng nhang định hình trên tăm tre mộc và phơi khô tự nhiên dưới nắng trời Tây Ninh',
        '03. Đóng hộp lục giác trung, lục giác đại (3 tấc, 4 tấc) dán tem OCOP 3 sao Cơ sở Vạn Linh Hương'
      ]
    },
    fieldQuiz: {
      question: 'Sản phẩm Nhang Vạn Linh Hương tại Phường Long Hoa đạt chuẩn OCOP mấy sao với những dòng sản phẩm nào?',
      options: [
        { val: '1', label: 'A. Đạt chuẩn OCOP 3 sao với 3 dòng sản phẩm chủ lực: Nhang Phật Bà Tây Bổ Đà Sơn, Nhang hương quế thượng hạng và Nhang gỗ tùng trầm' },
        { val: '2', label: 'B. Chỉ làm từ hóa chất tạo tàn cong chưa từng đạt OCOP' },
        { val: '3', label: 'C. OCOP chỉ cấp cho thực phẩm ăn uống, không cấp cho nhang' }
      ],
      correctVal: '1',
      correctExplain: 'Chính xác! Nhang Vạn Linh Hương đạt chuẩn OCOP 3 sao tỉnh Tây Ninh với 3 dòng sản phẩm thảo mộc tự nhiên đóng hộp lục giác 3 tấc, 4 tấc.',
      wrongExplain: 'Chưa đúng! Hãy đọc lại hồ sơ OCOP 3 sao và 3 dòng sản phẩm chủ lực của Cơ sở nhang Vạn Linh Hương nhé.'
    }
  }
];

/**
 * Dữ liệu 6 Sản Phẩm trong Kho Sản Phẩm OCOP (Trạm 3 - kho-san-pham.html)
 * Đầy đủ 6 sản phẩm và 6 con vật như ảnh
 */
export const REPOSITORY_PRODUCTS: ProductRepositoryItem[] = [
  {
    key: 'honey',
    name: 'MẬT ONG BẢO AN',
    header: '🐝 HỒ SƠ: MẬT ONG BẢO AN TÂY NINH (OCOP 4 SAO)',
    icon: '🐝',
    mascotKey: 'bee',
    mascotName: 'Mật ong – Con Ong',
    mascotImage: '/image/mascot-mat-ong.png',
    location: 'Số 47, hẻm 48, đường Cách Mạng Tháng Tám, Phường Tân Ninh, Tỉnh Tây Ninh',
    producer: 'Công ty TNHH MTV Ong Mật Bảo An Tây Ninh (Đại diện: Nguyễn Đình Vinh)',
    category: 'Thực phẩm',
    ocop: 'Đạt chuẩn OCOP 4 sao tỉnh Tây Ninh (Đợt 2/2024)',
    stars: 4,
    decisionNumber: 'Chứng nhận đạt chuẩn OCOP 4 sao tỉnh Tây Ninh (Đợt 2/2024)',
    desc: 'Mật ong Bảo An (Công ty TNHH MTV Ong Mật Bảo An Tây Ninh) sở hữu 2 dòng sản phẩm chủ lực được UBND tỉnh Tây Ninh công nhận đạt chuẩn OCOP 4 sao: Mật ong rừng VQG Lò Gò – Xa Mát (đợt 2/2024) và Mật ong hoa sao, dầu Bảo An; cùng dòng Mật ong hoa nhãn đạt chuẩn OCOP 3 sao. Sản phẩm khai thác từ nguồn hoa tự nhiên Tây Ninh, giữ trọn enzym quý giá, vị ngọt thanh đậm đà và giá trị dinh dưỡng cao.',
    highlights: [
      'Mật ong rừng Bảo An (OCOP 4 sao): Khai thác từ khu vực Vườn quốc gia Lò Gò – Xa Mát với nguồn mật từ các loài hoa rừng tự nhiên, hương vị đậm đà, được công nhận đạt chuẩn OCOP 4 sao vào đợt 2 năm 2024',
      'Mật ong hoa sao, dầu Bảo An (OCOP 4 sao): Dòng mật ong đặc trưng thu hoạch vào mùa hoa Sao, hoa Dầu nở rộ tại vùng rừng Tây Ninh, được công nhận đạt chuẩn OCOP 4 sao',
      'Mật ong hoa nhãn Bảo An (OCOP 3 sao): Khai thác mật từ các vườn nhãn tại Hòa Thành, đã đạt chứng nhận OCOP 3 sao',
      'Chủ thể: Công ty TNHH MTV Ong Mật Bảo An Tây Ninh (Đại diện: Nguyễn Đình Vinh) · Trụ sở: Số 47, hẻm 48, đường Cách Mạng Tháng Tám, Phường Tân Ninh · ĐT: 0909 215 615 / 0918 858 099'
    ],
    verificationChecklist: [
      'Kiểm tra tem chứng nhận OCOP 4 sao trên Mật ong rừng Lò Gò – Xa Mát hoặc Mật ong hoa sao, dầu Bảo An',
      'Xác minh thông tin chủ thể: Công ty TNHH MTV Ong Mật Bảo An Tây Ninh tại Phường Tân Ninh, Tỉnh Tây Ninh',
      'Đối chiếu danh sách sản phẩm OCOP 4 sao trên Cổng dữ liệu / Hệ thống quản lý OCOP tỉnh Tây Ninh'
    ],
    qrCodeData: {
      batchCode: 'LOT-BA-2026-08',
      mfgDate: '15/08/2026',
      expDate: '15/08/2028',
      standard: 'TCVN 12605:2019 / OCOP 4 Sao Tây Ninh'
    }
  },
  {
    key: 'custardapple',
    name: 'MÃNG CẦU BÀ ĐEN',
    header: '🐛 HỒ SƠ: MÃNG CẦU BÀ ĐEN - MINH TRUNG (LINH VẬT CON SÂU)',
    icon: '🐛',
    mascotKey: 'caterpillar',
    mascotName: 'Mãng cầu – Con Sâu',
    mascotImage: '/image/mascot-mang-cau.png',
    location: 'Số 1 Phạm Công Khiêm, Xã Tân Châu & Xã Tân Phú (vùng trồng Phường Bình Minh – Phường Tân Ninh), tỉnh Tây Ninh',
    producer: 'Hợp tác xã Dịch vụ nông nghiệp Minh Trung',
    category: 'Thực phẩm',
    ocop: 'OCOP 4 sao (Chứng nhận VietGAP & Chỉ dẫn địa lý)',
    stars: 4,
    decisionNumber: 'QĐ công nhận OCOP 4 sao tỉnh Tây Ninh',
    desc: 'Đặc sản nông sản trứ danh vùng chân Núi Bà Đen (Phường Bình Minh, Phường Tân Ninh) và Xã Tân Phú – Xã Tân Châu. Trái mãng cầu dai, múi trắng ngà, vị ngọt thanh xen lẫn hương thơm đặc trưng nhờ thổ nhưỡng đất xám phù sa cổ và nắng gió Tây Ninh.',
    videoSrc: '/image/mang-cau.mov',
    highlights: [
      'Canh tác theo quy trình VietGAP, nhật ký đồng ruộng điện tử minh bạch',
      'Liên kết chuỗi giá trị nông hộ tại Xã Tân Phú, Xã Tân Châu và vùng phụ cận Núi Bà Đen (Phường Bình Minh)',
      'Có tem truy xuất nguồn gốc ghi rõ mã vườn, hotline HTX Minh Trung (0918268242)'
    ],
    verificationChecklist: [
      'Kiểm tra tem dán trên quả hoặc thùng có tên HTX Dịch vụ nông nghiệp Minh Trung',
      'Xác minh địa chỉ mới tại Phường Bình Minh, Xã Tân Châu & Xã Tân Phú, tỉnh Tây Ninh',
      'Phân biệt dựa trên hồ sơ chủ thể thay vì chỉ nhìn màu sắc vỏ quả'
    ],
    qrCodeData: {
      batchCode: 'LOT-MC-2026-11',
      mfgDate: '05/11/2026',
      expDate: '18/11/2026 (Trái tươi bảo quản mát)',
      standard: 'VietGAP / OCOP 4 Sao Tây Ninh'
    }
  },
  {
    key: 'ricepaper',
    name: 'BÁNH TRÁNG TÂN NHIÊN',
    header: '🐿️ HỒ SƠ: BÁNH TRÁNG TÂN NHIÊN (OCOP 5 SAO QUỐC GIA & OCOP 3 SAO TỈNH)',
    icon: '🐿️',
    mascotKey: 'squirrel',
    mascotName: 'Bánh tráng – Con Sóc',
    mascotImage: '/image/mascot-banh-trang.png',
    location: '• Cơ sở sản xuất: Số 6 (hoặc số 1), hẻm 34, đường Nguyễn Lương Bằng, phường Long Hoa, thị xã Hòa Thành, tỉnh Tây Ninh.\n• Cửa hàng trưng bày/phân phối tại Tây Ninh: Số 02, Đặng Ngọc Chinh, Khu phố 1, Phường Tân Ninh, Tây Ninh',
    producer: 'Công ty TNHH Tân Nhiên',
    category: 'Thực phẩm',
    ocop: 'OCOP 5 Sao Cấp Quốc Gia & OCOP 3 Sao Cấp Tỉnh',
    stars: 5,
    decisionNumber: 'QĐ công nhận OCOP 5 Sao Quốc Gia (Bộ NN&PTNT 1/2025) & OCOP 3 Sao Tỉnh',
    desc: 'Bánh tráng siêu mỏng Tân Nhiên (không nhúng nước) là sản phẩm chủ lực đầu tiên của tỉnh Tây Ninh được Bộ Nông nghiệp và Phát triển nông thôn công nhận đạt OCOP 5 sao Quốc gia (tháng 1/2025). Bên cạnh đó, các dòng bánh tráng trộn ăn liền của công ty đã được tỉnh Tây Ninh đánh giá và công nhận đạt chuẩn OCOP 3 sao bao gồm 4 hương vị cụ thể.',
    highlights: [
      '1. Hạng OCOP 5 sao (Cấp Quốc gia): Bánh tráng siêu mỏng Tân Nhiên (không nhúng nước) – sản phẩm chủ lực đầu tiên của Tây Ninh được Bộ NN&PTNT công nhận đạt OCOP 5 sao tháng 1/2025 (quy cách 120g, 250g, 300g, 400g, 450g)',
      '2. Hạng OCOP 3 sao (Cấp Tỉnh): 4 dòng bánh tráng trộn ăn liền: Bánh tráng trộn phô mai, Bánh tráng trộn sa tế tỏi, Bánh tráng trộn sa tế tôm hành, Bánh tráng ớt bay muối nhuyễn siêu cay',
      '• Địa chỉ cơ sở sản xuất: Số 6 (hoặc số 1), hẻm 34, đường Nguyễn Lương Bằng, phường Long Hoa, thị xã Hòa Thành, tỉnh Tây Ninh',
      '• Cửa hàng trưng bày/phân phối tại Tây Ninh: Số 02, Đặng Ngọc Chinh, Khu phố 1, Phường Tân Ninh, Tây Ninh'
    ],
    verificationChecklist: [
      'Nhận diện logo OCOP 5 sao Quốc gia in sắc nét trên bao bì Bánh tráng siêu mỏng Tân Nhiên (120g - 450g)',
      'Kiểm tra tem chứng nhận OCOP 3 sao trên 4 dòng bánh tráng trộn ăn liền (phô mai, sa tế tỏi, sa tế tôm hành, ớt bay muối nhuyễn)',
      'Xác minh địa chỉ cơ sở sản xuất tại P. Long Hoa (TX. Hòa Thành) và cửa hàng phân phối tại Số 02 Đặng Ngọc Chinh, P. Tân Ninh'
    ],
    qrCodeData: {
      batchCode: 'LOT-BT-2026-10',
      mfgDate: '01/10/2026',
      expDate: '01/10/2027',
      standard: 'FSSC 22000 / OCOP 5 Sao Quốc Gia'
    }
  },
  {
    key: 'shrimpsalt',
    name: 'MUỐI TÔM THẮNG LỢI',
    header: '🦐 HỒ SƠ: MUỐI TÔM THẮNG LỢI – OCOP 3 SAO (LINH VẬT CON TÔM)',
    icon: '🦐',
    mascotKey: 'shrimp',
    mascotName: 'Muối tôm – Con Tôm',
    mascotImage: '/image/mascot-muoi-tom.png',
    location: '2426, ấp Bình Hòa, Xã Châu Thành, Tỉnh Tây Ninh, Việt Nam',
    producer: 'Cơ sở sản xuất Muối Thắng Lợi',
    category: 'Thực phẩm',
    ocop: 'OCOP 3 sao (Chứng nhận chất lượng tỉnh Tây Ninh)',
    stars: 3,
    decisionNumber: 'Chứng nhận OCOP 3 sao tỉnh Tây Ninh',
    desc: 'Muối tôm Thắng Lợi đạt chuẩn OCOP 3 sao do Cơ sở sản xuất Muối Thắng Lợi tại Xã Châu Thành, tỉnh Tây Ninh chế biến. Sản phẩm áp dụng quy trình 3 bước chuẩn mực: Tuyển chọn nguyên liệu tươi sạch (ớt tươi mọng, tôm khô loại 1, muối hạt tinh khiết), sơ chế chế biến theo tỉ lệ vàng gia truyền và sử dụng công nghệ sấy khô hiện đại giúp muối giữ trọn màu tự nhiên và độ giòn tan.',
    highlights: [
      'Bước 1: Tuyển chọn những trái ớt tươi mọng, tôm khô loại 1 và muối hạt tinh khiết nhất',
      'Bước 2: Làm sạch kỹ lưỡng, xay nhuyễn và phối trộn theo công thức gia truyền tỉ lệ vàng của Thắng Lợi',
      'Bước 3: Công nghệ sấy khô hiện đại giữ trọn màu tự nhiên, mùi thơm đặc trưng và độ giòn tan'
    ],
    verificationChecklist: [
      'Kiểm tra tem chứng nhận OCOP 3 sao và tên Cơ sở sản xuất Muối Thắng Lợi',
      'Xác minh địa chỉ 2426, ấp Bình Hòa, Xã Châu Thành, Tỉnh Tây Ninh & ĐT: 0913 161 525',
      'Đối chiếu qua Website muoithangloi.com hoặc Email muoithangloi@gmail.com'
    ],
    qrCodeData: {
      batchCode: 'LOT-MTTL-2026-10',
      mfgDate: '12/10/2026',
      expDate: '12/10/2027',
      standard: 'OCOP 3 Sao / Cơ sở Muối Thắng Lợi'
    }
  },
  {
    key: 'birdsnest',
    name: 'YẾN SÀO YẾN LOAN',
    header: '🐦 HỒ SƠ: YẾN SÀO YẾN LOAN – OCOP 4 SAO (GIAI ĐOẠN 2026 – 2029)',
    icon: '🐦',
    mascotKey: 'swallow',
    mascotName: 'Yến sào – Con Yến',
    mascotImage: '/image/mascot-yen-sao.png',
    location: '116B Nguyễn Chí Thanh, Khu phố 2, Phường 3 (Phường Tân Ninh), Thành phố Tây Ninh, Tỉnh Tây Ninh',
    producer: 'Công ty TNHH Loan Phát Huy (Hoạt động từ năm 2016)',
    category: 'Thực phẩm',
    ocop: 'OCOP 4 sao (Duy trì gia hạn giai đoạn 2026 – 2029)',
    stars: 4,
    decisionNumber: 'Chứng nhận OCOP 4 sao tỉnh Tây Ninh (Gia hạn duy trì 2026–2029) & HACCP',
    desc: 'Yến Sào Yến Loan (Công ty TNHH Loan Phát Huy) hiện có 1 sản phẩm đạt chứng nhận OCOP 4 sao: Yến sào sơ chế - thương hiệu Yến sào Yến Loan (dòng tổ yến sạch làm sạch lông thủ công). Sản phẩm được công nhận đạt chuẩn OCOP 4 sao lần đầu vào năm 2022, sau đó tiếp tục được đánh giá gia hạn và duy trì hạng 4 sao cho giai đoạn 2026 – 2029.',
    highlights: [
      'Tên sản phẩm đạt chuẩn: Yến sào sơ chế - thương hiệu Yến sào Yến Loan (dòng tổ yến sạch làm sạch lông thủ công)',
      'Thời hạn công nhận: Sản phẩm được công nhận đạt chuẩn OCOP 4 sao lần đầu vào năm 2022, sau đó tiếp tục được đánh giá gia hạn và duy trì hạng 4 sao cho giai đoạn 2026 – 2029',
      'Tiêu chuẩn & cam kết: 100% tổ yến nguyên chất, quy trình sơ chế nhặt lông thủ công đạt chuẩn ATVSTP, HACCP quốc tế, đền bù gấp 10 lần nếu phát hiện hàng giả',
      'Trụ sở / Showroom chính hãng: 116B Nguyễn Chí Thanh, Khu phố 2, Phường 3 (Phường Tân Ninh), TP. Tây Ninh · Hotline: 0793 392 959 / 0919 392 959'
    ],
    verificationChecklist: [
      'Xác nhận tem OCOP 4 sao và chứng nhận giai đoạn 2026 – 2029 trên bao bì Yến sào sơ chế Yến Loan',
      'Kiểm tra tên chủ thể Công ty TNHH Loan Phát Huy và địa chỉ 116B Nguyễn Chí Thanh, Phường Tân Ninh, TP Tây Ninh',
      'Đối chiếu chứng nhận ATVSTP, tiêu chuẩn quốc tế HACCP và cam kết bảo hành chất lượng 10 lần'
    ],
    qrCodeData: {
      batchCode: 'LOT-YSYL-2026-09',
      mfgDate: '20/09/2026',
      expDate: '20/09/2028',
      standard: 'HACCP / ATVSTP / OCOP 4 Sao (2026–2029)'
    }
  },
  {
    key: 'incense',
    name: 'NHANG VẠN LINH HƯƠNG',
    header: '🐉 HỒ SƠ: NHANG VẠN LINH HƯƠNG – OCOP 3 SAO (LINH VẬT CON RỒNG)',
    icon: '🐉',
    mascotKey: 'dragon',
    mascotName: 'Nhang – Con Rồng',
    mascotImage: '/image/mascot-nhang.png',
    location: 'Số 68, đường số 34 Trần Phú, khu phố Long Hải, Phường Long Hoa, thị xã Hòa Thành, tỉnh Tây Ninh',
    producer: 'Cơ sở nhang Vạn Linh Hương',
    category: 'Thủ công mỹ nghệ & Lưu niệm',
    ocop: 'Đạt chuẩn OCOP 3 sao tỉnh Tây Ninh',
    stars: 3,
    decisionNumber: 'QĐ công nhận sản phẩm OCOP 3 sao tỉnh Tây Ninh',
    desc: 'Cơ sở Vạn Linh Hương tại Phường Long Hoa hiện có 3 nhóm sản phẩm chủ lực được tỉnh Tây Ninh công nhận đạt hạng OCOP 3 sao (bao gồm nhiều quy cách đóng gói hộp lục giác trung, lục giác đại với kích thước 3 tấc hoặc 4 tấc), bảo đảm 100% thảo mộc tự nhiên, an toàn cho sức khỏe và môi trường sống.',
    videoSrc: '/image/nhang.mov',
    highlights: [
      'Nhang Vạn Linh Hương Phật Bà Tây Bổ Đà Sơn: Làm từ bột đinh hương hoặc lá tràm trà tự nhiên khai thác tại vùng Đảo Nhím (hồ Dầu Tiếng), mang hương thơm dịu nhẹ, thanh lọc không khí',
      'Nhang Vạn Linh Hương hương quế thượng hạng: Sử dụng bột vỏ quế tự nhiên cho mùi thơm ấm áp, dễ chịu, phù hợp không gian thờ cúng',
      'Nhang Vạn Linh Hương gỗ tùng trầm: Kết hợp giữa gỗ tùng và trầm hương tự nhiên, tạo mùi hương trầm ấm, thư thái',
      'Quy cách bao bì: Đóng gói hộp lục giác trung, lục giác đại với kích thước 3 tấc hoặc 4 tấc · Địa chỉ: Số 68, đường 34 Trần Phú, KP Long Hải, Phường Long Hoa'
    ],
    verificationChecklist: [
      'Xác nhận tem OCOP 3 sao trên các hộp lục giác Nhang Vạn Linh Hương',
      'Kiểm tra địa chỉ cơ sở sản xuất tại Số 68, đường số 34 Trần Phú, Phường Long Hoa, TX Hòa Thành, Tây Ninh',
      'Đối chiếu 3 dòng sản phẩm OCOP: Phật Bà Tây Bổ Đà Sơn, Hương quế thượng hạng và Gỗ tùng trầm'
    ],
    qrCodeData: {
      batchCode: 'LOT-VLH-2026-09',
      mfgDate: '10/09/2026',
      expDate: '10/09/2029',
      standard: 'TCCS 01:2025/VLH / OCOP 3 Sao Tây Ninh'
    }
  }
];
