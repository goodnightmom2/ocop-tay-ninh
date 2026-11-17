import React, { useState } from 'react';
import {
  LearningProgress,
  setManualStudentCode
} from '../utils/tracker';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentCode: string;
  progress: LearningProgress;
}

export function StudentModal({
  isOpen,
  onClose,
  studentCode,
  progress
}: StudentModalProps) {
  const [customInput, setCustomInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  function handleSaveManualCode(e: React.FormEvent) {
    e.preventDefault();
    setNotice(null);
    const result = setManualStudentCode(customInput);
    if (result.success && result.code) {
      setNotice({
        type: 'success',
        text: `Đã đổi sang mã học sinh: ${result.code}`
      });
      setCustomInput('');
      setShowManualInput(false);
    } else {
      setNotice({
        type: 'error',
        text: result.error || 'Mã học sinh không hợp lệ.'
      });
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="student-modal-title"
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl space-y-5 sm:space-y-6">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="text-xs font-mono-code font-bold text-emerald-800">
              CẨM NANG SỐ KHÁM PHÁ OCOP TÂY NINH
            </div>
            <h2 id="student-modal-title" className="text-xl font-extrabold text-slate-900 mt-0.5">
              Hồ Sơ & Mã Định Danh Học Sinh
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ hồ sơ"
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Thông báo kết quả khi đổi mã thủ công (nếu có) */}
        {notice && (
          <div
            className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
              notice.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                : 'bg-rose-50 text-rose-900 border border-rose-200'
            }`}
          >
            <span>{notice.type === 'success' ? '✅' : '⚠️'}</span>
            <span>{notice.text}</span>
          </div>
        )}

        {/* Thẻ hiển thị Mã Học Sinh được cấp tự động cho máy */}
        <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
                Mã Học Sinh Của Thiết Bị Này:
              </div>
              <p className="text-[12px] text-slate-600 max-w-sm leading-relaxed">
                Hệ thống tự động cấp một mã riêng biệt tăng dần (<strong className="text-emerald-800 font-mono-code">HS11-001</strong>, <strong className="text-emerald-800 font-mono-code">HS11-002</strong>, <strong className="text-emerald-800 font-mono-code">HS11-003</strong>...) cho mỗi thiết bị khi mở ứng dụng.
              </p>
            </div>
            <div
              data-testid="auto-student-code-badge"
              className="px-6 py-3 bg-emerald-800 text-white font-mono-code font-extrabold text-2xl rounded-2xl text-center shrink-0 shadow-sm"
            >
              {studentCode}
            </div>
          </div>

          <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px] text-emerald-800">
            <span>✓ Mã số này được lưu cố định cho thiết bị của bạn</span>
            <button
              type="button"
              onClick={() => setShowManualInput(!showManualInput)}
              className="text-emerald-900 font-semibold underline hover:text-emerald-700 cursor-pointer"
            >
              {showManualInput ? 'Ẩn ô nhập thủ công' : 'Đổi mã theo chỉ định của giáo viên'}
            </button>
          </div>
        </div>

        {/* Khu vực tự nhập mã học sinh theo phân công của giáo viên (mặc định ẩn, chỉ hiện khi cần) */}
        {showManualInput && (
          <form onSubmit={handleSaveManualCode} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="text-xs font-bold text-slate-800">
              Nhập mã học sinh do giáo viên chỉ định:
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="VD: HS11-015 hoặc 11A1-02"
                className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 font-mono-code uppercase"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0"
              >
                Lưu mã
              </button>
            </div>
          </form>
        )}

        {/* Bảng tổng hợp tiến độ các trạm */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-700">
            Tiến độ hoàn thành các trạm học tập:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-slate-500">Quiz Khởi động</div>
              <div className="text-base font-extrabold text-slate-900 font-mono-code">
                {progress.homeQuizBestScore !== null ? `${progress.homeQuizBestScore}/4` : 'Chưa làm'}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-slate-500">Trạm 1: Nhận diện</div>
              <div className="text-base font-extrabold text-emerald-800">
                {progress.investigationCompleted ? 'Đã hoàn thành' : 'Đang thực hiện'}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-slate-500">Trạm 2: Bản đồ</div>
              <div className="text-base font-extrabold text-slate-900 font-mono-code">
                {progress.mapPinsVisited.length}/6 điểm ghim
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-slate-500">Trạm 3: Kho sản phẩm</div>
              <div className="text-base font-extrabold text-slate-900 font-mono-code">
                {progress.repoProductsViewed.length}/6 hồ sơ
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-slate-500">Trạm 4: Thử thách</div>
              <div className="text-base font-extrabold text-slate-900 font-mono-code">
                {progress.finalChallengeBestScore !== null
                  ? `${progress.finalChallengeBestScore}/10`
                  : 'Chưa làm'}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-slate-500">Tháp Tri Thức</div>
              <div className="text-base font-extrabold text-amber-700 font-mono-code">
                {progress.stemGameBestHP !== null
                  ? `Tầng ${progress.stemGameBestHP} (${progress.stemGameBestHP * 3}m)`
                  : 'Chưa xây tháp'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
