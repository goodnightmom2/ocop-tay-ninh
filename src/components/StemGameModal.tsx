import React, { useState, useEffect, useRef } from 'react';
import {
  KNOWLEDGE_TOWER_QUESTIONS,
  STEM_CHARACTERS,
  OcopMascotKey,
  TowerQuestion
} from '../data/ocopData';
import {
  calculateTowerFloorPoints,
  getTowerTitle
} from '../utils/rules';
import { logEvent, updateLearningProgress } from '../utils/tracker';
import {
  isSoundEnabled,
  toggleSoundEnabled,
  playBGM,
  stopBGM,
  playSfxCorrect,
  playSfxWrong,
  playSfxVictory
} from '../utils/sound';
import { fireConfetti, fireBigCelebration } from '../utils/confetti';
import { MascotAvatar } from './Artwork';

interface StemGameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MAX_LIVES = 3;

/**
 * Chọn câu hỏi phù hợp với độ cao hiện tại của tháp (Dễ -> Trung bình -> Khó)
 */
function pickNextQuestion(floor: number, usedIds: number[]): TowerQuestion {
  let targetDifficulty: 'easy' | 'medium' | 'hard' = 'easy';
  if (floor >= 8) {
    targetDifficulty = 'hard';
  } else if (floor >= 4) {
    targetDifficulty = 'medium';
  }

  // 1. Lọc theo độ khó chưa dùng
  let candidates = KNOWLEDGE_TOWER_QUESTIONS.filter(
    (q) => q.difficulty === targetDifficulty && !usedIds.includes(q.id)
  );

  // 2. Nếu đã hết câu hỏi ở độ khó này, lấy bất kỳ câu nào chưa dùng
  if (candidates.length === 0) {
    candidates = KNOWLEDGE_TOWER_QUESTIONS.filter((q) => !usedIds.includes(q.id));
  }

  // 3. Nếu đã làm hết toàn bộ 24 câu, lấy ngẫu nhiên trong toàn bộ ngân hàng
  if (candidates.length === 0) {
    candidates = KNOWLEDGE_TOWER_QUESTIONS;
  }

  const randomIdx = Math.floor(Math.random() * candidates.length);
  return candidates[randomIdx];
}

export function StemGameModal({ isOpen, onClose }: StemGameModalProps) {
  const [phase, setPhase] = useState<'select' | 'playing' | 'gameover' | 'victory'>('select');
  const [selectedChar, setSelectedChar] = useState<OcopMascotKey>('bee');

  // Trạng thái chơi game Xây Tháp
  const [floors, setFloors] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);

  // Câu hỏi & tương tác
  const [currentQ, setCurrentQ] = useState<TowerQuestion>(() => KNOWLEDGE_TOWER_QUESTIONS[0]);
  const [usedIds, setUsedIds] = useState<number[]>([]);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);

  // Thẻ quyền năng (Power-ups)
  const [fiftyFiftyCount, setFiftyFiftyCount] = useState(1);
  const [shieldCount, setShieldCount] = useState(1);
  const [skipCount, setSkipCount] = useState(1);
  const [shieldActive, setShieldActive] = useState(false);

  // Âm thanh & Hiệu ứng
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [cardAnim, setCardAnim] = useState<'none' | 'shake' | 'glow' | 'speed'>('none');
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  const towerScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      stopBGM();
    }
  }, [isOpen]);

  // Tự động cuộn tháp lên đỉnh mỗi khi xây thêm tầng
  useEffect(() => {
    if (towerScrollRef.current) {
      towerScrollRef.current.scrollTop = 0;
    }
  }, [floors]);

  if (!isOpen) return null;

  const activeChar =
    STEM_CHARACTERS.find((c) => c.key === selectedChar) || STEM_CHARACTERS[0];
  const isSpeedBuild = combo >= 2;
  const prefix = ['A', 'B', 'C', 'D'];
  const titleInfo = getTowerTitle(floors);

  function handleToggleSound() {
    const next = toggleSoundEnabled();
    setSoundOn(next);
  }

  function handleStartGame() {
    playBGM();
    setFloors(0);
    setLives(MAX_LIVES);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setFiftyFiftyCount(1);
    setShieldCount(1);
    setSkipCount(1);
    setShieldActive(false);
    setHiddenOptions([]);
    setSelectedOpt(null);
    setCardAnim('none');
    setStatusBanner(null);

    const firstQ = pickNextQuestion(0, []);
    setCurrentQ(firstQ);
    setUsedIds([firstQ.id]);
    setPhase('playing');
    logEvent('BAT_DAU_XAY_THAP_TRI_THUC', `Linh vật: ${activeChar.name}`);
  }

  function handleSelectAnswer(idx: number) {
    if (selectedOpt !== null || hiddenOptions.includes(idx)) return;
    setSelectedOpt(idx);

    const isCorrect = idx === currentQ.correctIndex;

    if (isCorrect) {
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      if (nextCombo > maxCombo) setMaxCombo(nextCombo);

      // Nếu combo >= 2 (câu đúng thứ 3 trở đi): Kích hoạt Xây Thần Tốc (+2 tầng tháp)
      const floorsToAdd = nextCombo >= 3 ? 2 : 1;
      const nextFloor = floors + floorsToAdd;
      const ptsEarned = calculateTowerFloorPoints(nextFloor, nextCombo) * floorsToAdd;

      setFloors(nextFloor);
      setScore((prev) => prev + ptsEarned);

      if (nextCombo >= 3) {
        setCardAnim('speed');
        setStatusBanner(`⚡ XÂY THẦN TỐC x2! Thêm +${floorsToAdd} tầng và +${ptsEarned} điểm!`);
        fireBigCelebration();
      } else {
        setCardAnim('glow');
        setStatusBanner(`🎉 CHÍNH XÁC! Thêm +1 tầng tháp và +${ptsEarned} điểm!`);
        fireConfetti(35);
      }

      playSfxCorrect();

      // Thưởng quyền năng ở các mốc tháp đặc biệt
      if (nextFloor === 5 && shieldCount === 0) {
        setShieldCount((prev) => prev + 1);
        setStatusBanner('🛡️ Thưởng đạt Tầng 5: Nhận thêm 1 Khiên Bảo Vệ!');
      } else if (nextFloor === 10 && fiftyFiftyCount === 0) {
        setFiftyFiftyCount((prev) => prev + 1);
        setStatusBanner('🎯 Thưởng đạt Tầng 10: Nhận thêm 1 Trợ giúp 50:50!');
      }

      logEvent('XAY_THAP_DAP_AN', `Tầng ${nextFloor}: Đúng (+${ptsEarned} điểm, Combo ${nextCombo})`);
    } else {
      // Trả lời sai
      playSfxWrong();
      setCombo(0);
      setCardAnim('shake');

      if (shieldActive) {
        // Khiên bảo vệ đỡ đòn
        setShieldActive(false);
        setStatusBanner('🛡️ KHIÊN BẢO VỆ ĐÃ ĐỠ ĐÒN! Tháp không bị sập và không mất tim!');
        logEvent('XAY_THAP_DAP_AN', `Sai câu hỏi: Khiên bảo vệ đã cứu nguy!`);
      } else {
        // Mất 1 mạng & sập 1 tầng tháp
        const nextLives = lives - 1;
        setLives(nextLives);
        const nextFloor = Math.max(0, floors - 1);
        setFloors(nextFloor);
        setStatusBanner('💔 SAI RỒI! Mất 1 mạng và sập 1 tầng tháp!');

        logEvent('XAY_THAP_DAP_AN', `Sai câu hỏi: Còn ${nextLives} mạng, Tháp còn ${nextFloor} tầng`);

        if (nextLives <= 0) {
          setTimeout(() => {
            stopBGM();
            handleEndGame('gameover', nextFloor);
          }, 1500);
        }
      }
    }
  }

  function handleNextFloor() {
    if (lives <= 0) {
      stopBGM();
      handleEndGame('gameover', floors);
      return;
    }

    // Chọn câu hỏi tiếp theo theo độ cao tháp
    const nextQ = pickNextQuestion(floors, usedIds);
    setCurrentQ(nextQ);
    setUsedIds((prev) => [...prev, nextQ.id]);
    setSelectedOpt(null);
    setHiddenOptions([]);
    setCardAnim('none');
    setStatusBanner(null);
  }

  // Sử dụng quyền năng 50:50
  function handleUseFiftyFifty() {
    if (fiftyFiftyCount <= 0 || hiddenOptions.length > 0 || selectedOpt !== null) return;
    const wrongIndices = currentQ.options
      .map((_, i) => i)
      .filter((i) => i !== currentQ.correctIndex);

    // Xáo trộn để lấy ngẫu nhiên 2 đáp án sai
    const shuffledWrong = wrongIndices.sort(() => 0.5 - Math.random());
    const toHide = shuffledWrong.slice(0, 2);

    setHiddenOptions(toHide);
    setFiftyFiftyCount((prev) => prev - 1);
    setStatusBanner('🎯 50:50: Đã loại bỏ 2 phương án sai!');
    playSfxCorrect();
  }

  // Sử dụng quyền năng Khiên Bảo Vệ
  function handleUseShield() {
    if (shieldCount <= 0 || shieldActive || selectedOpt !== null) return;
    setShieldActive(true);
    setShieldCount((prev) => prev - 1);
    setStatusBanner('🛡️ Khiên Bảo Vệ kích hoạt: Miễn nhiễm sập tầng và mất tim ở câu này!');
    playSfxCorrect();
  }

  // Sử dụng quyền năng Đổi Câu Hỏi
  function handleUseSkip() {
    if (skipCount <= 0 || selectedOpt !== null) return;
    setSkipCount((prev) => prev - 1);
    setStatusBanner('❄️ Đã bỏ qua thử thách! Nhận câu hỏi mới...');
    playSfxCorrect();

    const nextQ = pickNextQuestion(floors, usedIds);
    setCurrentQ(nextQ);
    setUsedIds((prev) => [...prev, nextQ.id]);
    setHiddenOptions([]);
  }

  function handleEndGame(finishPhase: 'gameover' | 'victory', finalFloors = floors) {
    setPhase(finishPhase);
    if (finalFloors >= 10) {
      playSfxVictory();
      fireBigCelebration();
    }
    updateLearningProgress((prev) => ({
      ...prev,
      stemGameVictories: prev.stemGameVictories + (finalFloors >= 5 ? 1 : 0),
      stemGameBestHP:
        prev.stemGameBestHP === null ? finalFloors : Math.max(prev.stemGameBestHP, finalFloors)
    }));
    logEvent('KET_THUC_XAY_THAP_TRI_THUC', {
      linhVat: activeChar.name,
      tangDatDuoc: finalFloors,
      diemSo: score,
      danhHieu: getTowerTitle(finalFloors).title
    });
  }

  function handleCloseModal() {
    stopBGM();
    onClose();
  }

  // Sinh danh sách các tầng tháp trực quan
  const towerBlocks = Array.from({ length: floors }, (_, i) => i + 1).reverse();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tower-game-modal-title"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div
        className={`relative w-full max-w-4xl bg-white border-2 border-slate-200 rounded-3xl p-4 sm:p-7 shadow-2xl transition-all max-h-[94vh] overflow-y-auto ${
          cardAnim === 'shake' ? 'animate-shake border-red-500' : ''
        } ${cardAnim === 'glow' ? 'border-emerald-500' : ''} ${
          cardAnim === 'speed' ? 'border-amber-500 ring-4 ring-amber-400/40' : ''
        }`}
      >
        {/* Thanh nút Âm thanh & Đóng ở góc trên */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
          <button
            type="button"
            onClick={handleToggleSound}
            aria-label={soundOn ? 'Tắt âm thanh' : 'Bật âm thanh'}
            title="Bật/Tắt âm thanh"
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-sm cursor-pointer shadow-sm transition-colors"
          >
            {soundOn ? '🔊' : '🔇'}
          </button>
          <button
            type="button"
            onClick={handleCloseModal}
            aria-label="Đóng trò chơi"
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 cursor-pointer shadow-sm transition-colors"
          >
            ✕
          </button>
        </div>

        {/* ========================================================= */}
        {/* MÀN HÌNH 1: CHỌN 1 TRONG 6 LINH VẬT ĐỒNG HÀNH XÂY THÁP    */}
        {/* ========================================================= */}
        {phase === 'select' && (
          <div className="text-center space-y-4 pt-1">
            <div className="space-y-1.5">
              <div className="text-xs font-mono-code font-bold text-amber-700 uppercase tracking-widest flex items-center justify-center gap-1.5">
                <span>🏛️</span>
                <span>MINI-GAME TRÍ TUỆ OCOP TÂY NINH</span>
              </div>
              <h2 id="tower-game-modal-title" className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Xây Tháp Tri Thức
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
                Chọn 1 trong <strong>6 linh vật OCOP Tây Ninh</strong> đồng hành để bắt đầu hành trình xây tháp! Trả lời đúng các câu hỏi để đưa tháp vươn cao lên bầu trời mây trắng Tây Ninh.
              </p>
            </div>

            {/* Thẻ tóm tắt 3 quy tắc cốt lõi */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-2xl mx-auto text-left text-xs bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3">
              <div className="flex items-start gap-2">
                <span className="text-base">🏗️</span>
                <div>
                  <strong className="text-slate-900 block font-bold">Trả lời đúng = +1 Tầng</strong>
                  <span className="text-slate-600 text-[11px]">Tháp càng cao, điểm thưởng cho mỗi tầng càng lớn.</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-base">⚡</span>
                <div>
                  <strong className="text-slate-900 block font-bold">Xây thần tốc (Combo x3)</strong>
                  <span className="text-slate-600 text-[11px]">Đúng liên tiếp 3 câu kích hoạt xây +2 tầng một lúc!</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-base">🛡️</span>
                <div>
                  <strong className="text-slate-900 block font-bold">3 Mạng & Thẻ quyền năng</strong>
                  <span className="text-slate-600 text-[11px]">Dùng trợ giúp 50:50, Khiên bảo vệ để chống sập tầng.</span>
                </div>
              </div>
            </div>

            {/* Danh sách 6 Linh vật OCOP */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 text-left pt-1">
              {STEM_CHARACTERS.map((char) => {
                const isSelected = char.key === selectedChar;
                return (
                  <button
                    key={char.key}
                    type="button"
                    onClick={() => setSelectedChar(char.key)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 text-center transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-amber-50/90 border-amber-600 shadow-md ring-2 ring-amber-400/40'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/70'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-2 right-2 w-5 h-5 bg-amber-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow">
                        ✓
                      </span>
                    )}
                    <MascotAvatar mascot={char.key} className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 shadow-sm" />
                    <div className="space-y-0.5 w-full mt-1">
                      <div className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
                        {char.name}
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-slate-500 leading-snug line-clamp-2 mt-0.5">
                        {char.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleStartGame}
                className="w-full sm:w-auto px-10 py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-extrabold rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5"
              >
                BẮT ĐẦU XÂY THÁP TRI THỨC &rarr;
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MÀN HÌNH 2: TRÒ CHƠI ĐANG DIỄN RA (TÒA THÁP + CÂU HỎI)    */}
        {/* ========================================================= */}
        {phase === 'playing' && (
          <div className="space-y-4 pt-1">
            {/* Thanh trạng thái đỉnh cao: Linh vật, Mạng, Điểm, Chiều cao */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 text-white rounded-2xl p-3 sm:p-4 mr-14 sm:mr-16 shadow-inner">
              {/* Linh vật đồng hành */}
              <div className="flex items-center gap-2.5">
                <MascotAvatar mascot={activeChar.key} className="w-10 h-10 shrink-0 border border-amber-400/40 rounded-xl" />
                <div>
                  <div className="text-xs font-bold text-amber-300 leading-tight">{activeChar.name}</div>
                  <div className="text-[11px] text-slate-300">Đang chỉ huy công trình</div>
                </div>
              </div>

              {/* 3 Mạng sống Trái Tim */}
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                <span className="text-[11px] font-bold text-slate-300 mr-1">Mạng:</span>
                {Array.from({ length: MAX_LIVES }).map((_, i) => (
                  <span
                    key={i}
                    className={`text-base transition-all transform ${
                      i < lives ? 'scale-110 drop-shadow-[0_0_6px_rgba(239,68,68,0.7)]' : 'opacity-25 grayscale'
                    }`}
                  >
                    ❤️
                  </span>
                ))}
              </div>

              {/* Độ cao tháp & Điểm số */}
              <div className="flex items-center gap-3 font-mono-code">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase">Độ cao</div>
                  <div className="text-base font-extrabold text-amber-400">
                    Tầng {floors} <span className="text-xs font-normal text-slate-300">({floors * 3}m)</span>
                  </div>
                </div>
                <div className="text-right border-l border-slate-700 pl-3">
                  <div className="text-[10px] text-slate-400 uppercase">Điểm số</div>
                  <div className="text-base font-extrabold text-emerald-400">{score.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Thanh Combo & Thẻ Quyền Năng */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-50 border border-slate-200 rounded-2xl p-2.5 sm:p-3">
              {/* Trạng thái Combo */}
              <div className="flex items-center gap-2">
                <div
                  className={`px-3 py-1 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                    isSpeedBuild
                      ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white animate-pulse shadow-md'
                      : combo > 0
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  <span>🔥</span>
                  <span>
                    {isSpeedBuild ? `XÂY THẦN TỐC x2! (Combo ${combo})` : `Combo: x${combo}`}
                  </span>
                </div>
                {isSpeedBuild && (
                  <span className="text-[11px] font-bold text-amber-700 hidden sm:inline">
                    ⚡ 1 câu đúng = +2 tầng tháp!
                  </span>
                )}
              </div>

              {/* 3 Thẻ quyền năng (Power-ups) */}
              <div className="flex items-center gap-2">
                {/* 50:50 */}
                <button
                  type="button"
                  disabled={fiftyFiftyCount <= 0 || hiddenOptions.length > 0 || selectedOpt !== null}
                  onClick={handleUseFiftyFifty}
                  title="Loại bỏ 2 phương án sai"
                  className="px-2.5 py-1.5 bg-white border border-slate-300 hover:border-sky-500 disabled:opacity-40 rounded-xl text-xs font-bold text-slate-700 hover:text-sky-700 flex items-center gap-1 cursor-pointer transition-all disabled:cursor-not-allowed shadow-sm"
                >
                  <span>🎯 50:50</span>
                  <span className="w-4 h-4 rounded-full bg-sky-100 text-sky-800 text-[10px] flex items-center justify-center font-bold">
                    {fiftyFiftyCount}
                  </span>
                </button>

                {/* Khiên bảo vệ */}
                <button
                  type="button"
                  disabled={shieldCount <= 0 || shieldActive || selectedOpt !== null}
                  onClick={handleUseShield}
                  title="Chống sập tầng và mất mạng khi trả lời sai"
                  className={`px-2.5 py-1.5 border rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all disabled:cursor-not-allowed shadow-sm ${
                    shieldActive
                      ? 'bg-amber-500 border-amber-600 text-white animate-pulse ring-2 ring-amber-300'
                      : 'bg-white border-slate-300 hover:border-amber-500 text-slate-700 hover:text-amber-700 disabled:opacity-40'
                  }`}
                >
                  <span>🛡️ Khiên</span>
                  <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 text-[10px] flex items-center justify-center font-bold">
                    {shieldCount}
                  </span>
                </button>

                {/* Đổi câu hỏi */}
                <button
                  type="button"
                  disabled={skipCount <= 0 || selectedOpt !== null}
                  onClick={handleUseSkip}
                  title="Bỏ qua câu này để đổi câu hỏi mới"
                  className="px-2.5 py-1.5 bg-white border border-slate-300 hover:border-emerald-500 disabled:opacity-40 rounded-xl text-xs font-bold text-slate-700 hover:text-emerald-700 flex items-center gap-1 cursor-pointer transition-all disabled:cursor-not-allowed shadow-sm"
                >
                  <span>❄️ Đổi câu</span>
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] flex items-center justify-center font-bold">
                    {skipCount}
                  </span>
                </button>
              </div>
            </div>

            {/* Thông báo biểu ngữ sự kiện (Banner) */}
            {statusBanner && (
              <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-50 via-emerald-50 to-sky-50 border border-amber-200 text-xs font-bold text-slate-800 text-center animate-pop">
                {statusBanner}
              </div>
            )}

            {/* BỐ CỤC 2 PHẦN: CỘT THÁP TRỰC QUAN (TRÁI) & BẢNG CÂU HỎI (PHẢI) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
              {/* CỘT TRÁI (4 cols): TÒA THÁP TRI THỨC TRỰC QUAN */}
              <div className="md:col-span-4 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 rounded-2xl p-3 border-2 border-slate-800 text-white flex flex-col justify-between relative overflow-hidden shadow-lg min-h-[340px] md:min-h-[420px]">
                {/* Bầu trời sao & Đám mây mờ ảo */}
                <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>

                {/* Đỉnh tháp & Linh vật leo tháp */}
                <div className="relative z-10 text-center space-y-1 pb-2 border-b border-slate-800/80">
                  <div className="text-[10px] font-mono-code uppercase tracking-wider text-amber-300">
                    🏛️ Tháp Tri Thức OCOP
                  </div>
                  <div className="text-lg font-extrabold text-white font-mono-code">
                    {floors > 0 ? `TẦNG ${floors}` : 'CHƯA ĐẶT NỀN'}
                  </div>
                </div>

                {/* Khu vực cuộn hiển thị các tầng tháp */}
                <div
                  ref={towerScrollRef}
                  className="flex-1 flex flex-col items-center justify-start overflow-y-auto space-y-1.5 py-3 max-h-[220px] md:max-h-[300px] scrollbar-thin"
                >
                  {/* Linh vật đứng trên đỉnh tầng cao nhất */}
                  <div className="flex flex-col items-center transition-all duration-300 animate-bounce">
                    <div className="relative">
                      <MascotAvatar mascot={activeChar.key} className="w-12 h-12 shadow-xl ring-2 ring-amber-400 rounded-2xl" />
                      {shieldActive && (
                        <div className="absolute -inset-1 rounded-2xl border-2 border-amber-400 animate-ping pointer-events-none"></div>
                      )}
                    </div>
                    <div className="px-2 py-0.5 mt-1 bg-amber-500 text-slate-950 text-[10px] font-extrabold rounded-md shadow">
                      Đỉnh tháp ({floors * 3}m)
                    </div>
                  </div>

                  {/* Danh sách các khối tầng tháp đã xây */}
                  {towerBlocks.map((floorNum) => {
                    let blockColor = 'from-amber-600 to-yellow-500 border-amber-300 text-slate-950';
                    let tierName = 'Nền Móng';
                    if (floorNum >= 13) {
                      blockColor = 'from-indigo-600 to-purple-600 border-purple-300 text-white';
                      tierName = 'Vũ Trụ OCOP';
                    } else if (floorNum >= 9) {
                      blockColor = 'from-orange-500 to-rose-600 border-rose-300 text-white';
                      tierName = 'Hoàng Hôn';
                    } else if (floorNum >= 5) {
                      blockColor = 'from-emerald-600 to-teal-500 border-emerald-300 text-white';
                      tierName = 'Sườn Núi';
                    }

                    return (
                      <div
                        key={floorNum}
                        className={`w-36 sm:w-40 py-1.5 px-3 rounded-xl bg-gradient-to-r ${blockColor} border shadow-md flex items-center justify-between text-xs font-mono-code font-bold transition-all duration-300 animate-pop shrink-0 ${
                          isSpeedBuild ? 'ring-2 ring-amber-300' : ''
                        }`}
                      >
                        <span className="text-[11px] font-extrabold">🧱 TẦNG {floorNum}</span>
                        <span className="text-[9px] opacity-80 uppercase tracking-tighter">{tierName}</span>
                      </div>
                    );
                  })}

                  {/* Móng đất vững chãi ở đáy */}
                  <div className="w-44 py-2 bg-gradient-to-r from-emerald-900 to-slate-800 border-t-2 border-emerald-500 text-center rounded-b-xl text-[10px] text-emerald-200 font-bold uppercase tracking-wider shrink-0 shadow-inner">
                    🌱 Nền Móng Tây Ninh
                  </div>
                </div>

                {/* Footer chân tháp */}
                <div className="relative z-10 pt-2 border-t border-slate-800 text-[11px] text-slate-400 text-center font-mono-code">
                  Danh hiệu: <strong className="text-amber-300">{titleInfo.title}</strong>
                </div>
              </div>

              {/* CỘT PHẢI (8 cols): KHUNG CÂU HỎI TRẮC NGHIỆM */}
              <div className="md:col-span-8 space-y-3.5 flex flex-col justify-between">
                {/* Chủ đề & Nội dung câu hỏi */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-lg border ${
                        currentQ.difficulty === 'hard'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : currentQ.difficulty === 'medium'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {currentQ.subjectTag}
                    </span>
                    <span className="text-xs text-slate-500 font-mono-code">
                      +{calculateTowerFloorPoints(floors + 1, combo)} điểm nếu đúng
                    </span>
                  </div>

                  <h3 id="tower-game-modal-title" className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {currentQ.question}
                  </h3>
                </div>

                {/* 4 Nút đáp án A, B, C, D */}
                <div className="space-y-2">
                  {currentQ.options.map((optText, idx) => {
                    const isHidden = hiddenOptions.includes(idx);
                    const isChosen = selectedOpt === idx;
                    const isCorrectOpt = idx === currentQ.correctIndex;

                    let btnStyle =
                      'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300';

                    if (isHidden) {
                      btnStyle = 'opacity-25 pointer-events-none line-through bg-slate-100 border-slate-200 text-slate-400';
                    } else if (selectedOpt !== null) {
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
                        disabled={selectedOpt !== null || isHidden}
                        onClick={() => handleSelectAnswer(idx)}
                        className={`w-full text-left px-3.5 py-2.5 sm:py-3 rounded-xl border-2 text-xs sm:text-sm transition-all flex items-center justify-between gap-3 cursor-pointer ${btnStyle}`}
                      >
                        <span className="leading-snug">
                          <strong className="font-mono-code text-slate-900 mr-1.5">{prefix[idx]}.</strong>
                          {optText}
                        </span>
                        {selectedOpt !== null && isChosen && isCorrectOpt && <span>✅</span>}
                        {selectedOpt !== null && isChosen && !isCorrectOpt && <span>❌</span>}
                        {selectedOpt !== null && !isChosen && isCorrectOpt && <span>✅</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Khung giải thích chi tiết */}
                {selectedOpt !== null && (
                  <div
                    className={`p-3 rounded-xl text-xs sm:text-sm leading-relaxed animate-pop ${
                      selectedOpt === currentQ.correctIndex
                        ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
                        : 'bg-red-50 border border-red-200 text-red-900'
                    }`}
                  >
                    {selectedOpt === currentQ.correctIndex ? (
                      <p>
                        🎉 <strong>Tuyệt vời!</strong> {currentQ.explain}
                      </p>
                    ) : (
                      <p>
                        💡 <strong>Kiến thức ghi nhớ:</strong> {currentQ.explain}
                      </p>
                    )}
                  </div>
                )}

                {/* Nút bấm xây tầng tiếp theo */}
                {selectedOpt !== null && lives > 0 && (
                  <button
                    type="button"
                    onClick={handleNextFloor}
                    className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-extrabold rounded-xl transition-all shadow-md cursor-pointer transform hover:-translate-y-0.5"
                  >
                    XÂY TẦNG TIẾP THEO &rarr;
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MÀN HÌNH 3: KẾT THÚC TRÒ CHƠI / TỔNG KẾT THÁP             */}
        {/* ========================================================= */}
        {(phase === 'gameover' || phase === 'victory') && (
          <div className="text-center space-y-4 py-3">
            <MascotAvatar mascot={activeChar.key} className="w-20 h-20 sm:w-24 sm:h-24 mx-auto shadow-lg rounded-2xl" />

            <div className="space-y-1">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${titleInfo.color}`}>
                {titleInfo.badge}
              </span>
              <h2 id="tower-game-modal-title" className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {titleInfo.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Đồng hành cùng <strong>{activeChar.name}</strong>, bạn đã xây dựng thành công công trình tri thức OCOP Tây Ninh đầy ấn tượng!
              </p>
            </div>

            {/* Bảng thông số kết quả */}
            <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto text-center font-mono-code">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="text-xs text-slate-500 uppercase">Chiều cao tháp</div>
                <div className="text-xl sm:text-2xl font-extrabold text-amber-600 mt-1">
                  Tầng {floors}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">({floors * 3} mét)</div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="text-xs text-slate-500 uppercase">Tổng điểm</div>
                <div className="text-xl sm:text-2xl font-extrabold text-emerald-700 mt-1">
                  {score.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">điểm tích lũy</div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="text-xs text-slate-500 uppercase">Chuỗi Combo</div>
                <div className="text-xl sm:text-2xl font-extrabold text-rose-600 mt-1">
                  x{maxCombo}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">câu đúng liên tiếp</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleStartGame}
                className="px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-extrabold rounded-xl transition-all shadow-md cursor-pointer"
              >
                🔄 XÂY LẠI THÁP MỚI
              </button>
              <button
                type="button"
                onClick={() => setPhase('select')}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer"
              >
                🐾 ĐỔI LINH VẬT ĐỒNG HÀNH
              </button>
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
