import React, { useState, useEffect } from 'react';
import { TopNav, StationTab } from './components/TopNav';
import { HomeView } from './components/HomeView';
import { InvestigationView } from './components/InvestigationView';
import { MapView } from './components/MapView';
import { RepositoryView } from './components/RepositoryView';
import { ChallengeView } from './components/ChallengeView';
import { StemGameModal } from './components/StemGameModal';
import { StudentModal } from './components/StudentModal';
import {
  getStudentCode,
  ensureAutoStudentCode,
  getLearningProgress,
  logEvent,
  LearningProgress
} from './utils/tracker';

export default function App() {
  const [activeTab, setActiveTab] = useState<StationTab>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const station = params.get('station') as StationTab | null;
      if (
        station &&
        ['home', 'nhan-dien', 'ban-do', 'kho-san-pham', 'thu-thach'].includes(station)
      ) {
        return station;
      }
    }
    return 'home';
  });

  const [studentCode, setStudentCodeState] = useState<string>(() => getStudentCode());
  const [progress, setProgress] = useState<LearningProgress>(() => getLearningProgress());

  const [isGameOpen, setIsGameOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);

  useEffect(() => {
    // Tự động cấp mã Học sinh tăng dần (HS11-001, HS11-002, ...) cho mỗi máy mở vào
    ensureAutoStudentCode().then((code) => {
      setStudentCodeState(code);
    });

    function syncTrackerState() {
      setStudentCodeState(getStudentCode());
      setProgress(getLearningProgress());
    }
    window.addEventListener('ocop-tracker-updated', syncTrackerState);
    return () => window.removeEventListener('ocop-tracker-updated', syncTrackerState);
  }, []);

  function handleSelectTab(tab: StationTab, customLogAction?: string) {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const actionLabel = customLogAction || `CHUYEN_TRAM_${tab.toUpperCase().replace(/-/g, '_')}`;
    logEvent(actionLabel, `Mở phân hệ: ${tab}`);
  }

  function handleOpenStemGame() {
    logEvent('MO_GAME_PHIEU_LUU', 'Mở modal chọn nhân vật game OCOP');
    setIsGameOpen(true);
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 text-slate-900 relative">
      {/* Ảnh nền mờ toàn phần mềm từ file /image/bg.jpg */}
      <div className="bg-overlay" aria-hidden="true" />

      {/* Thanh điều hướng chính (3-zone Top Bar Contract) */}
      <TopNav
        activeTab={activeTab}
        onSelectTab={(tab) => handleSelectTab(tab)}
        studentCode={studentCode}
        onOpenStudentModal={() => setIsStudentModalOpen(true)}
      />

      {/* Nút tròn nổi Mini-Game STEM Liên Môn (chỉ hiển thị ở Trang chủ) */}
      {activeTab === 'home' && (
        <button
          type="button"
          onClick={handleOpenStemGame}
          aria-label="Mở Trò Chơi Xây Tháp Tri Thức OCOP"
          title="Chơi Game Xây Tháp Tri Thức OCOP!"
          className="fixed left-4 bottom-6 sm:top-1/3 sm:bottom-auto z-30 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-amber-500 via-orange-500 to-rose-700 text-white border-2 border-white shadow-lg flex flex-col items-center justify-center cursor-pointer hover:-translate-y-1 transition-transform duration-150 no-print"
        >
          <span className="text-xl sm:text-2xl leading-none" aria-hidden="true">
            🏛️
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-wider mt-0.5">
            XÂY THÁP
          </span>
        </button>
      )}

      {/* Nội dung chính của từng Trạm học tập */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeView
            onNavigateStation={(tab, logName) => handleSelectTab(tab, `XEM_MUC_${logName}`)}
            onOpenStemGame={handleOpenStemGame}
            progress={progress}
          />
        )}

        {activeTab === 'nhan-dien' && (
          <InvestigationView
            studentCode={studentCode}
            onNavigateStation={(tab, logName) => handleSelectTab(tab, logName)}
          />
        )}

        {activeTab === 'ban-do' && (
          <MapView
            onNavigateStation={(tab, logName) => handleSelectTab(tab, logName)}
          />
        )}

        {activeTab === 'kho-san-pham' && (
          <RepositoryView
            onNavigateStation={(tab, logName) => handleSelectTab(tab, logName)}
          />
        )}

        {activeTab === 'thu-thach' && (
          <ChallengeView
            onNavigateStation={(tab, logName) => handleSelectTab(tab, logName)}
          />
        )}
      </main>

      {/* Chân trang tối giản & học thuật (không có nút mở Tracker) */}
      <footer className="bg-white border-t border-slate-200 py-6 px-6 text-xs text-slate-500 no-print">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            Cẩm Nang Số Tương Tác Khám Phá OCOP Tây Ninh · Phường Tân Ninh, Tỉnh Tây Ninh
          </div>
          <div className="font-mono-code text-slate-600">
            Mã học sinh: <strong className="text-emerald-800">{studentCode}</strong>
          </div>
        </div>
      </footer>

      {/* Modal Mini-Game STEM Vượt Chướng Ngại Vật */}
      <StemGameModal isOpen={isGameOpen} onClose={() => setIsGameOpen(false)} />

      {/* Modal Xem Mã Học Sinh Tự Động & Tiến Độ Học Tập */}
      <StudentModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        studentCode={studentCode}
        progress={progress}
      />
    </div>
  );
}
