import React from 'react';

export type StationTab = 'home' | 'nhan-dien' | 'ban-do' | 'kho-san-pham' | 'thu-thach';

interface TopNavProps {
  activeTab: StationTab;
  onSelectTab: (tab: StationTab) => void;
  studentCode: string;
  onOpenStudentModal: () => void;
}

const NAV_ITEMS: { id: StationTab; label: string }[] = [
  { id: 'home', label: 'Trang chủ' },
  { id: 'nhan-dien', label: 'Nhận diện' },
  { id: 'ban-do', label: 'Bản đồ OCOP' },
  { id: 'kho-san-pham', label: 'Kho sản phẩm' },
  { id: 'thu-thach', label: 'Thử thách' }
];

export function TopNav({
  activeTab,
  onSelectTab,
  studentCode,
  onOpenStudentModal
}: TopNavProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 no-print">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 px-3.5 sm:px-6 py-2.5 sm:py-3.5">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#trang-chu"
          onClick={(e) => {
            e.preventDefault();
            onSelectTab('home');
          }}
          className="text-base sm:text-lg font-bold tracking-tight text-slate-900 font-serif-display italic whitespace-nowrap shrink-0"
        >
          OCOP Tây Ninh
        </a>

        {/* Zone 2: 5 clean single-line text navigation links */}
        <nav aria-label="Điều hướng trạm học tập" className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                  isActive
                    ? 'text-emerald-800 font-semibold border-emerald-700'
                    : 'text-slate-600 hover:text-slate-900 border-transparent hover:border-slate-300'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenStudentModal}
            title="Xem hồ sơ và tiến độ học sinh"
            className="px-2.5 sm:px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
            <span>Mã HS: {studentCode}</span>
          </button>
        </div>
      </div>

      {/* Mobile horizontal navigation bar */}
      <nav
        aria-label="Điều hướng di động"
        className="flex md:hidden items-center gap-1.5 px-3 py-2 overflow-x-auto no-scrollbar border-t border-slate-100 bg-slate-50/90 text-xs font-medium"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-all cursor-pointer font-medium ${
                isActive
                  ? 'bg-emerald-800 text-white font-bold shadow-xs'
                  : 'text-slate-700 bg-white border border-slate-200/80 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
