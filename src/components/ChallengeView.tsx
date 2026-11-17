import React, { useState } from 'react';
import { FINAL_CHALLENGE_10_QUIZ } from '../data/ocopData';
import { getFinalChallengeFeedback } from '../utils/rules';
import { logEvent, updateLearningProgress } from '../utils/tracker';
import { playSfxCorrect, playSfxWrong, playSfxVictory } from '../utils/sound';
import { fireConfetti, fireBigCelebration } from '../utils/confetti';
import { StationTab } from './TopNav';

interface ChallengeViewProps {
  onNavigateStation: (tab: StationTab, stationLogName: string) => void;
}

export function ChallengeView({ onNavigateStation }: ChallengeViewProps) {
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [cardEffect, setCardEffect] = useState<'none' | 'shake' | 'glow'>('none');
  const [isFinished, setIsFinished] = useState(false);

  const q = FINAL_CHALLENGE_10_QUIZ[currentQ];
  const progressPct = ((currentQ + 1) / FINAL_CHALLENGE_10_QUIZ.length) * 100;
  const prefix = ['A', 'B', 'C', 'D'];

  function handleChooseAnswer(idx: number) {
    if (selectedIdx !== null) return;
    setSelectedIdx(idx);

    const isCorrect = idx === q.correctIndex;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      setCardEffect('glow');
      playSfxCorrect();
      fireConfetti(45);
    } else {
      setCardEffect('shake');
      playSfxWrong();
    }
  }

  function handleNextQuestion() {
    if (currentQ < FINAL_CHALLENGE_10_QUIZ.length - 1) {
      setCurrentQ((prev) => prev + 1);
      setSelectedIdx(null);
      setCardEffect('none');
    } else {
      setIsFinished(true);
      logEvent('HOAN_THANH_QUIZ_10_CAU', `Điểm: ${score}/10`);
      updateLearningProgress((prev) => ({
        ...prev,
        finalChallengeBestScore:
          prev.finalChallengeBestScore === null
            ? score
            : Math.max(prev.finalChallengeBestScore, score)
      }));
      if (score >= 8) {
        playSfxVictory();
        fireBigCelebration();
      }
    }
  }

  function handleRestartQuiz() {
    setCurrentQ(0);
    setScore(0);
    setSelectedIdx(null);
    setCardEffect('none');
    setIsFinished(false);
    logEvent('LAM_LAI_QUIZ_10_CAU', 'Bắt đầu làm lại bài test 10 câu');
  }

  const feedbackSummary = getFinalChallengeFeedback(score, FINAL_CHALLENGE_10_QUIZ.length);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* TIÊU ĐỀ TRẠM 4 */}
      <header className="text-center space-y-3">
        <div className="text-xs font-semibold text-emerald-800 tracking-wide">
          🏆 TRẠM 4 · ĐÁNH GIÁ TỔNG KẾT HÀNH TRÌNH
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 font-serif-display italic">
          Thử Thách 10 Câu Hỏi Cuối Hành Trình
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
          Thử thách 10 câu hỏi cuối hành trình giúp củng cố toàn bộ kỹ năng nhận diện và kiểm chứng sản phẩm OCOP Tây Ninh.
        </p>
      </header>

      {/* BANNER THỬ THÁCH (/image/card4.jpg) */}
      <section className="w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-slate-200 bg-amber-50/30 flex items-center justify-center p-1 sm:p-2 max-h-72 aspect-[16/10] sm:aspect-[21/9]">
        <img
          src="/image/card4.jpg"
          alt="Thử thách OCOP"
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain block"
        />
      </section>

      {/* KHUNG LÀM 10 CÂU QUIZ */}
      {!isFinished ? (
        <section
          className={`bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm transition-all ${
            cardEffect === 'shake' ? 'animate-shake border-red-400' : ''
          } ${cardEffect === 'glow' ? 'animate-glow border-emerald-500' : ''}`}
        >
          {/* Thanh tiến độ */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono-code font-bold">
              <span className="text-emerald-800">
                CÂU {currentQ + 1}/{FINAL_CHALLENGE_10_QUIZ.length}
              </span>
              <span className="text-slate-500">Điểm hiện tại: {score}</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-700 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
            {q.question}
          </h2>

          {/* Danh sách 4 phương án */}
          <div className="space-y-3">
            {q.options.map((optText, idx) => {
              const isChosen = selectedIdx === idx;
              const isCorrectOpt = idx === q.correctIndex;
              let btnClass =
                'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-400';

              if (selectedIdx !== null) {
                if (isChosen && isCorrectOpt) {
                  btnClass = 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold animate-pop';
                } else if (isChosen && !isCorrectOpt) {
                  btnClass = 'bg-red-50 border-red-500 text-red-900 font-semibold';
                } else if (isCorrectOpt) {
                  btnClass = 'bg-emerald-50/70 border-emerald-500 text-emerald-900 font-bold';
                } else {
                  btnClass = 'bg-slate-50 border-slate-200 text-slate-400';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={selectedIdx !== null}
                  onClick={() => handleChooseAnswer(idx)}
                  className={`w-full text-left px-4 py-3.5 rounded-2xl border-2 text-sm transition-all flex items-center justify-between gap-3 ${btnClass}`}
                >
                  <span>
                    <strong>{prefix[idx]}.</strong> {optText}
                  </span>
                  {selectedIdx !== null && isChosen && isCorrectOpt && <span>✅</span>}
                  {selectedIdx !== null && isChosen && !isCorrectOpt && <span>❌</span>}
                  {selectedIdx !== null && !isChosen && isCorrectOpt && <span>✅</span>}
                </button>
              );
            })}
          </div>

          {/* Hộp phản hồi giải thích */}
          {selectedIdx !== null && (
            <div
              className={`p-4 rounded-xl text-sm font-medium leading-relaxed ${
                selectedIdx === q.correctIndex
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                  : 'bg-red-50 text-red-900 border border-red-200'
              }`}
            >
              {selectedIdx === q.correctIndex ? (
                <p>
                  🎉 <strong>Chính xác!</strong> {q.explain}
                </p>
              ) : (
                <p>
                  ❌ <strong>Chưa chính xác!</strong> {q.explain}
                </p>
              )}
            </div>
          )}

          {selectedIdx !== null && (
            <button
              type="button"
              onClick={handleNextQuestion}
              className="w-full py-3.5 bg-emerald-900 hover:bg-emerald-950 text-white text-sm font-bold rounded-xl transition-colors uppercase tracking-wide"
            >
              {currentQ === FINAL_CHALLENGE_10_QUIZ.length - 1
                ? 'XEM KẾT QUẢ CUỐI CÙNG'
                : 'CÂU TIẾP THEO →'}
            </button>
          )}
        </section>
      ) : (
        /* MÀN HÌNH KẾT QUẢ PHẢN HỒI HỌC TẬP (RESULT FEEDBACK CARD) */
        <section className="bg-white border-2 border-emerald-400 rounded-3xl p-6 sm:p-9 space-y-6 shadow-md">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold text-emerald-900">
              🎯 KẾT QUẢ CỦA BẠN
            </h2>
            <div className="text-5xl font-black text-emerald-700 font-mono-code py-1">
              {score}/{FINAL_CHALLENGE_10_QUIZ.length}
            </div>
            <p className="text-sm font-semibold text-slate-600">
              {feedbackSummary.headline}
            </p>
          </div>

          {/* Điểm mạnh */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2.5">
            <div className="text-sm font-extrabold text-emerald-800 flex items-center gap-2">
              <span>✓</span>
              <span>Bạn đã làm khá tốt ở:</span>
            </div>
            <ul className="space-y-1.5 text-sm text-slate-700">
              {feedbackSummary.goodPoints.map((pt, i) => (
                <li key={i}>✓ {pt}</li>
              ))}
            </ul>
          </div>

          {/* Gợi ý xem lại */}
          <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-5 space-y-2.5">
            <div className="text-sm font-extrabold text-amber-900 flex items-center gap-2">
              <span>🔎</span>
              <span>Bạn có thể xem lại để nắm chắc hơn:</span>
            </div>
            <ul className="space-y-2 text-sm text-slate-700">
              {feedbackSummary.reviewPoints.map((rev, i) => (
                <li key={i}>
                  <strong>{rev.station}:</strong> {rev.detail}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigateStation('nhan-dien', 'REVIEW_TRAM_1_FROM_QUIZ')}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors"
            >
              [ XEM LẠI TRẠM 1: ĐIỀU TRA SỐ ]
            </button>
            <button
              type="button"
              onClick={() => onNavigateStation('ban-do', 'REVIEW_TRAM_2_FROM_QUIZ')}
              className="px-5 py-3 bg-sky-700 hover:bg-sky-800 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors"
            >
              [ XEM LẠI TRẠM 2: BẢN ĐỒ ]
            </button>
            <button
              type="button"
              onClick={handleRestartQuiz}
              className="px-5 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs sm:text-sm font-bold rounded-xl transition-colors"
            >
              LÀM LẠI BÀI TEST
            </button>
          </div>
        </section>
      )}

      {/* ĐIỀU HƯỚNG CHÂN TRANG */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => onNavigateStation('kho-san-pham', 'BACK_TO_KHO_SAN_PHAM')}
          className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors"
        >
          &larr; Kho sản phẩm
        </button>
        <button
          type="button"
          onClick={() => onNavigateStation('home', 'BACK_TO_HOME')}
          className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors"
        >
          Trang chủ &rarr;
        </button>
      </div>
    </div>
  );
}
