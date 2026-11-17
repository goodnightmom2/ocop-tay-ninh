import React, { useState } from 'react';
import { HOME_VERIFICATION_QUIZ } from '../data/ocopData';
import { StationTab } from './TopNav';
import { logEvent, updateLearningProgress, LearningProgress } from '../utils/tracker';
import { playSfxCorrect, playSfxWrong, playSfxVictory } from '../utils/sound';
import { fireConfetti, fireBigCelebration } from '../utils/confetti';

interface HomeViewProps {
  onNavigateStation: (tab: StationTab, stationLogName: string) => void;
  onOpenStemGame: () => void;
  progress: LearningProgress;
}

const FANNED_LEFT_IMAGES = [
  {
    src: '/image/branch1.jpg',
    alt: 'Đặc sản Mật ong Tây Ninh',
    className:
      '-rotate-12 -translate-x-2 sm:-translate-x-4 translate-y-2 hover:rotate-0 hover:scale-110 hover:z-20'
  },
  {
    src: '/image/branch3.jpg',
    alt: 'Đặc sản Mãng cầu Bà Đen Tây Ninh',
    className:
      'rotate-8 translate-x-2 sm:translate-x-5 -translate-y-2 hover:rotate-0 hover:scale-110 hover:z-20'
  }
];

const FANNED_RIGHT_IMAGES = [
  {
    src: '/image/branch2.jpg',
    alt: 'Đặc sản Bánh tráng Tây Ninh',
    className:
      'rotate-12 translate-x-2 sm:translate-x-4 translate-y-2 hover:rotate-0 hover:scale-110 hover:z-20'
  },
  {
    src: '/image/branch4.jpg',
    alt: 'Đặc sản Nhang Vạn Linh Hương Tây Ninh',
    className:
      '-rotate-9 -translate-x-2 sm:-translate-x-5 -translate-y-2 hover:rotate-0 hover:scale-110 hover:z-20'
  }
];

const CAROUSEL_SLIDES = [
  { src: '/image/slide1.jpg', alt: 'Sản phẩm 1 - Mật ong Bảo An (Phường Tân Ninh)' },
  { src: '/image/slide2.jpg', alt: 'Sản phẩm 2 - Bánh tráng Phường Trảng Bàng' },
  { src: '/image/slide3.jpg', alt: 'Sản phẩm 3 - Mãng cầu Phường Bình Minh & Xã Tân Phú' },
  { src: '/image/slide4.jpg', alt: 'Sản phẩm 4 - Nhang Vạn Linh Hương (Phường Long Hoa)' },
  { src: '/image/slide5.jpg', alt: 'Sản phẩm 5 - Muối tôm Thắng Lợi (Xã Châu Thành)' },
  { src: '/image/slide6.jpg', alt: 'Sản phẩm 6 - Yến sào Yến Loan (Phường Tân Ninh)' }
];

export function HomeView({
  onNavigateStation,
  onOpenStemGame,
  progress
}: HomeViewProps) {
  const [quizState, setQuizState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [cardAnim, setCardAnim] = useState<'none' | 'shake' | 'glow'>('none');

  const currentQ = HOME_VERIFICATION_QUIZ[currentIdx];
  const prefix = ['A', 'B', 'C', 'D'];

  function handleStartQuiz() {
    setCurrentIdx(0);
    setScore(0);
    setSelectedOpt(null);
    setCardAnim('none');
    setQuizState('playing');
    logEvent('BAT_DAU_QUIZ_TRANG_CHU', 'Bắt đầu làm 4 câu kiểm chứng');
  }

  function handleSelectOption(optIndex: number) {
    if (selectedOpt !== null) return;
    setSelectedOpt(optIndex);

    const isCorrect = optIndex === currentQ.correctIndex;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      setCardAnim('glow');
      playSfxCorrect();
      fireConfetti(40);
    } else {
      setCardAnim('shake');
      playSfxWrong();
    }
  }

  function handleNextQuestion() {
    if (currentIdx < HOME_VERIFICATION_QUIZ.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOpt(null);
      setCardAnim('none');
    } else {
      setQuizState('finished');
      if (score >= 3) {
        playSfxVictory();
        fireBigCelebration();
      }
      logEvent('HOAN_THANH_QUIZ_TRANG_CHU', `Điểm: ${score}/4`);
      updateLearningProgress((prev) => ({
        ...prev,
        homeQuizBestScore:
          prev.homeQuizBestScore === null ? score : Math.max(prev.homeQuizBestScore, score)
      }));
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-8 sm:space-y-14">
      {/* HERO SECTION VỚI 4 ẢNH XÒE 2 BÊN (2 ẢNH XÒE BÊN TRÁI, 2 ẢNH XÒE BÊN PHẢI) */}
      <section className="relative bg-white/90 backdrop-blur-sm border border-slate-200 rounded-3xl px-4 py-8 sm:px-10 sm:py-14 overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          {/* Cột trái: 2 ảnh xòe bên trái */}
          <div className="lg:col-span-3 flex flex-row lg:flex-col items-center justify-center gap-2 sm:gap-6 order-2 lg:order-1">
            {FANNED_LEFT_IMAGES.map((img) => (
              <div
                key={img.src}
                className={`w-28 h-36 sm:w-36 sm:h-44 md:w-40 md:h-48 bg-white p-1.5 sm:p-2 rounded-2xl shadow-md border border-slate-200/90 transition-all duration-300 select-none ${img.className}`}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-xl block pointer-events-none"
                />
              </div>
            ))}
          </div>

          {/* Cột giữa: Tiêu đề trung tâm */}
          <div className="lg:col-span-6 text-center space-y-3 sm:space-y-4 order-1 lg:order-2 z-10">
            <div className="text-xs font-semibold text-emerald-800 tracking-wide">
              Cẩm nang số tương tác · Phường Tân Ninh, Tỉnh Tây Ninh
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 font-serif-display italic leading-snug uppercase">
              Khám Phá
              <br />
              OCOP Tây Ninh
              <br />
              Cẩm Nang Số
              <br />
              Tương Tác
              <br />
              Dành Cho Học Sinh
            </h1>

            <p className="text-base sm:text-xl text-slate-700 leading-relaxed max-w-xl mx-auto font-serif-display italic">
              Bạn có thực sự hiểu sản phẩm mình lựa chọn?
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 pt-2">
              <button
                type="button"
                onClick={() => onNavigateStation('nhan-dien', 'NHAN_DIEN')}
                className="px-5 py-3 bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm text-center"
              >
                🐝 Bắt đầu Trạm 1: Nhận diện OCOP &rarr;
              </button>
              <button
                type="button"
                onClick={onOpenStemGame}
                className="px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm hover:shadow text-center"
              >
                🏛️ Chơi Game: Xây Tháp Tri Thức OCOP
              </button>
            </div>
          </div>

          {/* Cột phải: 2 ảnh xòe bên phải */}
          <div className="lg:col-span-3 flex flex-row lg:flex-col items-center justify-center gap-2 sm:gap-6 order-3">
            {FANNED_RIGHT_IMAGES.map((img) => (
              <div
                key={img.src}
                className={`w-28 h-36 sm:w-36 sm:h-44 md:w-40 md:h-48 bg-white p-1.5 sm:p-2 rounded-2xl shadow-md border border-slate-200/90 transition-all duration-300 select-none ${img.className}`}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-xl block pointer-events-none"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DÃY ẢNH TRƯỢT NGANG (/image/slide1.jpg .. slide6.jpg) */}
      <section aria-label="Dãy ảnh sản phẩm OCOP Tây Ninh" className="overflow-hidden py-2">
        <div className="carousel-track">
          {[...CAROUSEL_SLIDES, ...CAROUSEL_SLIDES].map((slide, idx) => (
            <div
              key={`${slide.src}-${idx}`}
              className="w-44 h-52 rounded-2xl overflow-hidden shrink-0 bg-white shadow-sm border border-slate-200/80"
            >
              <img
                src={slide.src}
                alt={slide.alt}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover block hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      </section>

      {/* BỐ CỤC LƯỚI 2 CỘT CHO 4 TRẠM HỌC TẬP CHÍNH (DÙNG ĐÚNG ẢNH TRONG /image/) */}
      <section aria-labelledby="stations-heading" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <h2 id="stations-heading" className="text-2xl font-bold text-slate-900">
              01. Bốn Trạm Trải Nghiệm & Khám Phá OCOP
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Lựa chọn từng trạm theo thứ tự hoặc bấm trực tiếp vào học phần bạn muốn thực hành.
            </p>
          </div>
          <div className="text-xs text-slate-500 font-mono-code">
            Đã hoàn thành Trạm 1: {progress.investigationCompleted ? '1/1' : '0/1'} · Đã mở bản đồ: {progress.mapPinsVisited.length}/6
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Mục 1: Nhận diện (/image/nhan-dien-banner.jpg) */}
          <article className="bg-white/95 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1 shadow-sm">
            <div>
              <div className="rounded-2xl overflow-hidden mb-4 border border-slate-200/80 aspect-[16/10] bg-slate-50 flex items-center justify-center p-1 shadow-xs">
                <img
                  src="/image/nhan-dien-banner.jpg"
                  alt="Nhận diện OCOP"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain block hover:scale-102 transition-transform duration-300"
                />
              </div>
              <div className="text-xs text-emerald-800 font-semibold mb-1">
                Trạm 1 · Gặp gỡ Ong Vàng & Giải mã OCOP
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">Nhận diện</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
                Hiệu ứng bong bóng chào mừng và đồng hành cùng Ong Vàng Tây Ninh tìm hiểu khái niệm OCOP là gì, 6 nhóm ngành hàng và cách chấm điểm cấp sao (1 đến 5 sao) cho sản phẩm OCOP.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                {progress.investigationCompleted ? '✓ Đã hoàn thành cùng Ong Vàng' : 'Khái niệm & Cấp sao OCOP'}
              </span>
              <button
                type="button"
                onClick={() => onNavigateStation('nhan-dien', 'NHAN_DIEN')}
                className="w-full sm:w-auto text-center px-4 py-2 bg-slate-900 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Mở Trạm 1 &rarr;
              </button>
            </div>
          </article>

          {/* Mục 2: Bản đồ OCOP (/image/ocop-6-animals.png) */}
          <article className="bg-white/95 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1 shadow-sm">
            <div>
              <div className="rounded-2xl overflow-hidden mb-4 border border-slate-200/80 aspect-[16/10] bg-amber-50/30 flex items-center justify-center p-1 shadow-xs">
                <img
                  src="/image/ocop-6-animals.png"
                  alt="Bản đồ OCOP 6 Sản phẩm & 6 Con vật"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain block hover:scale-102 transition-transform duration-300"
                />
              </div>
              <div className="text-xs text-emerald-800 font-semibold mb-1">
                Trạm 2 · Bản đồ lớn 6 sản phẩm & đường đi di chuyển
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">Bản đồ OCOP</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
                Khám phá 6 linh vật & 6 sản phẩm (Mật ong – Con Ong, Mãng cầu – Con Sâu, Bánh tráng – Con Sóc, Muối tôm – Con Tôm, Yến sào – Con Yến, Nhang – Con Rồng) di chuyển và nối đường đi trên bản đồ lớn.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                Đã khám phá {progress.mapPinsVisited.length}/6 điểm ghim
              </span>
              <button
                type="button"
                onClick={() => onNavigateStation('ban-do', 'BAN_DO_OCOP')}
                className="w-full sm:w-auto text-center px-4 py-2 bg-slate-900 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Khám phá bản đồ &rarr;
              </button>
            </div>
          </article>

          {/* Mục 3: Kho sản phẩm (/image/card3.jpg) */}
          <article className="bg-white/95 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1 shadow-sm">
            <div>
              <div className="rounded-2xl overflow-hidden mb-4 border border-slate-200/80 aspect-[16/10] bg-slate-50 flex items-center justify-center p-1 shadow-xs">
                <img
                  src="/image/card3.jpg"
                  alt="Kho sản phẩm"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain block hover:scale-102 transition-transform duration-300"
                />
              </div>
              <div className="text-xs text-emerald-800 font-semibold mb-1">
                Trạm 3 · Thư viện số 6 sản phẩm & 6 linh vật OCOP
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">Kho sản phẩm</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
                Tra cứu đầy đủ 6 hồ sơ chuẩn hóa: Mật ong (Con Ong), Mãng cầu (Con Sâu), Bánh tráng (Con Sóc), Muối tôm (Con Tôm), Yến sào (Con Yến) và Nhang (Con Rồng).
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                Đã xem {progress.repoProductsViewed.length}/6 hồ sơ sản phẩm
              </span>
              <button
                type="button"
                onClick={() => onNavigateStation('kho-san-pham', 'KHO_SAN_PHAM')}
                className="w-full sm:w-auto text-center px-4 py-2 bg-slate-900 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Mở Kho sản phẩm &rarr;
              </button>
            </div>
          </article>

          {/* Mục 4: Thử thách (/image/card4.jpg) */}
          <article className="bg-white/95 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1 shadow-sm">
            <div>
              <div className="rounded-2xl overflow-hidden mb-4 border border-slate-200/80 aspect-[16/10] bg-amber-50/30 flex items-center justify-center p-1 shadow-xs">
                <img
                  src="/image/card4.jpg"
                  alt="Thử thách"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain block hover:scale-102 transition-transform duration-300"
                />
              </div>
              <div className="text-xs text-emerald-800 font-semibold mb-1">
                Trạm 4 · Đánh giá năng lực 10 câu hỏi
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">Thử thách</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
                Trò chơi đố vui và bài kiểm tra 10 câu hỏi tổng kết kiến thức về sản vật địa phương dành riêng cho học sinh.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-500 font-mono-code">
                {progress.finalChallengeBestScore !== null
                  ? `Điểm cao nhất: ${progress.finalChallengeBestScore}/10`
                  : 'Vượt qua thử thách'}
              </span>
              <button
                type="button"
                onClick={() => onNavigateStation('thu-thach', 'THU_THACH')}
                className="w-full sm:w-auto text-center px-4 py-2 bg-slate-900 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Vượt qua thử thách &rarr;
              </button>
            </div>
          </article>
        </div>
      </section>

      {/* KHU VỰC CÂU HỎI KIỂM CHỨNG THÔNG TIN TRANG CHỦ (4 CÂU TỪ INDEX.HTML) */}
      <section aria-labelledby="home-quiz-heading" className="pt-2">
        <div
          className={`bg-emerald-50/85 backdrop-blur-sm border border-emerald-200 rounded-3xl p-6 sm:p-10 transition-all ${
            cardAnim === 'shake' ? 'animate-shake border-red-400' : ''
          } ${cardAnim === 'glow' ? 'animate-glow border-emerald-500' : ''}`}
        >
          {quizState === 'idle' && (
            <div className="text-center max-w-xl mx-auto space-y-4 py-4">
              <div className="text-4xl" aria-hidden="true">
                🔍
              </div>
              <h2 id="home-quiz-heading" className="text-2xl font-extrabold text-emerald-900 tracking-tight">
                KIỂM CHỨNG THÔNG TIN
              </h2>
              <p className="text-base text-slate-700">
                Bạn có dễ bị đánh lừa bởi những thông tin trên mạng không?
              </p>
              {progress.homeQuizBestScore !== null && (
                <p className="text-xs font-semibold text-emerald-800 font-mono-code">
                  Kết quả gần nhất của bạn: {progress.homeQuizBestScore}/4 câu đúng
                </p>
              )}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleStartQuiz}
                  className="px-8 py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-bold rounded-xl transition-colors"
                >
                  BẮT ĐẦU
                </button>
              </div>
            </div>
          )}

          {quizState === 'playing' && (
            <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-sm font-extrabold text-emerald-800 font-mono-code">
                  CÂU {currentIdx + 1}/{HOME_VERIFICATION_QUIZ.length}
                </span>
                <span className="text-xs text-slate-500">Tình huống mạng xã hội</span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
                <div className="text-xs font-bold text-slate-500">
                  📱 BÀI ĐĂNG TRÊN MẠNG · 🌿 SẢN PHẨM ĐỊA PHƯƠNG
                </div>
                <p className="text-sm font-medium text-slate-800 italic">
                  “100% nguyên chất – OCOP 4 sao – hàng nghìn khách hàng tin dùng – tốt cho sức khỏe!”
                </p>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                {currentQ.question}
              </h3>

              <div className="space-y-3">
                {currentQ.options.map((optText, idx) => {
                  const isChosen = selectedOpt === idx;
                  const isCorrectOpt = idx === currentQ.correctIndex;
                  let btnStyle =
                    'bg-white border-slate-200 text-slate-800 hover:border-emerald-600 hover:bg-slate-50';

                  if (selectedOpt !== null) {
                    if (isChosen && isCorrectOpt) {
                      btnStyle = 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold animate-pop';
                    } else if (isChosen && !isCorrectOpt) {
                      btnStyle = 'bg-red-50 border-red-500 text-red-900 font-semibold';
                    } else if (isCorrectOpt) {
                      btnStyle = 'bg-emerald-50/70 border-emerald-500 text-emerald-900 font-bold';
                    } else {
                      btnStyle = 'bg-slate-50 border-slate-200 text-slate-400';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={selectedOpt !== null}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full text-left px-4 py-3.5 rounded-xl border-2 text-sm transition-all flex items-center justify-between gap-3 ${btnStyle}`}
                    >
                      <span>
                        <strong>{prefix[idx]}.</strong> {optText}
                      </span>
                      {selectedOpt !== null && isChosen && isCorrectOpt && <span>✅</span>}
                      {selectedOpt !== null && isChosen && !isCorrectOpt && <span>❌</span>}
                      {selectedOpt !== null && !isChosen && isCorrectOpt && <span>✅</span>}
                    </button>
                  );
                })}
              </div>

              {selectedOpt !== null && (
                <div
                  className={`p-4 rounded-xl text-sm font-medium ${
                    selectedOpt === currentQ.correctIndex
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                      : 'bg-sky-50 text-sky-950 border border-sky-200'
                  }`}
                >
                  {selectedOpt === currentQ.correctIndex ? (
                    <p>
                      <strong>✅ Chính xác!</strong> {currentQ.explain}
                    </p>
                  ) : (
                    <p>
                      <strong>❌ Chưa đúng.</strong> Đáp án đúng là:{' '}
                      <strong className="text-emerald-900">
                        {prefix[currentQ.correctIndex]}. {currentQ.options[currentQ.correctIndex]}
                      </strong>
                      . {currentQ.explain}
                    </p>
                  )}
                </div>
              )}

              {selectedOpt !== null && (
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="w-full py-3.5 bg-slate-900 hover:bg-emerald-900 text-white text-sm font-bold rounded-xl transition-colors"
                >
                  {currentIdx === HOME_VERIFICATION_QUIZ.length - 1
                    ? 'XEM KẾT QUẢ'
                    : 'CÂU TIẾP THEO →'}
                </button>
              )}
            </div>
          )}

          {quizState === 'finished' && (
            <div className="text-center max-w-xl mx-auto space-y-4 py-4">
              <div className="text-4xl" aria-hidden="true">
                🎉
              </div>
              <h2 className="text-2xl font-extrabold text-emerald-900">HOÀN THÀNH!</h2>
              <div className="text-5xl font-black text-emerald-700 font-mono-code">
                {score}/{HOME_VERIFICATION_QUIZ.length}
              </div>
              <p className="text-sm text-slate-700">
                Hãy luôn kiểm tra nguồn thông tin trước khi tin hoặc chia sẻ.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleStartQuiz}
                  className="px-6 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-sm font-semibold rounded-xl transition-colors"
                >
                  LÀM LẠI
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateStation('nhan-dien', 'NHAN_DIEN_FROM_QUIZ')}
                  className="px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  🐝 Mở Trạm 1: Nhận Diện OCOP &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
