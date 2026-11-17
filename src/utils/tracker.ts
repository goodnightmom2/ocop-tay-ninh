import {
  formatStudentCodeFromSequence,
  isAutoStudentCode,
  normalizeStudentCode
} from './rules';

// URL Google Apps Script chính thức từ file tracker.js (chạy ngầm tự động, người dùng không tương tác)
export const TRACKER_API_URL =
  'https://script.google.com/macros/s/AKfycbyHWg2IYCHEL3iWRrmWiVGbSJ4sLyLSh9s-o7aok82UQr2YApTAhnFjkOi1o2gelW_Q1A/exec';

const STUDENT_ID_KEY = 'ocop_student_id_v4';
const AUTO_ALLOCATED_FLAG_KEY = 'ocop_student_id_allocated_v4';
const LOCAL_SEQ_COUNTER_KEY = 'ocop_local_student_seq_v4';
const PROGRESS_KEY = 'ocop_station_progress';

// API bộ đếm đám mây dùng chung cho tất cả các thiết bị trên Internet
const CLOUD_COUNTER_PRIMARY =
  'https://countapi.mileshilliard.com/api/v1/hit/ocop_tayninh_hocsinh_2026';
const CLOUD_COUNTER_BACKUP =
  'https://abacus.jasoncameron.dev/hit/ocop_tayninh_2026/hocsinh';

export interface LearningProgress {
  homeQuizBestScore: number | null;
  investigationCompleted: boolean;
  investigationVerdict: number | null;
  mapPinsVisited: string[];
  mapQuizzesPassed: string[];
  repoProductsViewed: string[];
  finalChallengeBestScore: number | null;
  stemGameVictories: number;
  stemGameBestHP: number | null;
}

const DEFAULT_PROGRESS: LearningProgress = {
  homeQuizBestScore: null,
  investigationCompleted: false,
  investigationVerdict: null,
  mapPinsVisited: [],
  mapQuizzesPassed: [],
  repoProductsViewed: [],
  finalChallengeBestScore: null,
  stemGameVictories: 0,
  stemGameBestHP: null
};

let allocationPromise: Promise<string> | null = null;

/**
 * Lấy Mã Học Sinh hiện tại của thiết bị mà không ghi đè giá trị
 */
export function getStudentCode(): string {
  try {
    const existing = localStorage.getItem(STUDENT_ID_KEY);
    if (existing && existing.trim().length >= 2) {
      return normalizeStudentCode(existing);
    }
  } catch {
    // ignore
  }
  return 'HS11-001';
}

/**
 * Gọi dịch vụ đám mây để lấy số thứ tự tiếp theo (mỗi thiết bị gọi sẽ nhận 1 số tăng dần: 1, 2, 3...)
 */
async function fetchSequenceFromCloud(): Promise<number | null> {
  // 1. Thử Cloud Counter chính (countapi.mileshilliard.com)
  try {
    const res = await fetch(CLOUD_COUNTER_PRIMARY, { method: 'GET' });
    if (res.ok) {
      const data = (await res.json()) as { value?: number };
      if (typeof data.value === 'number' && data.value > 0) {
        return data.value;
      }
    }
  } catch {
    // thử kênh phụ
  }

  // 2. Thử Cloud Counter phụ (abacus.jasoncameron.dev)
  try {
    const res = await fetch(CLOUD_COUNTER_BACKUP, { method: 'GET' });
    if (res.ok) {
      const data = (await res.json()) as { value?: number };
      if (typeof data.value === 'number' && data.value > 0) {
        return data.value;
      }
    }
  } catch {
    // thử server nội bộ
  }

  // 3. Thử API nội bộ (/api/allocate-student-code)
  try {
    const res = await fetch('/api/allocate-student-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.ok) {
      const data = (await res.json()) as { sequence?: number; value?: number };
      const seq = data.sequence || data.value;
      if (typeof seq === 'number' && seq > 0) {
        return seq;
      }
    }
  } catch {
    // bỏ qua
  }

  return null;
}

/**
 * Tự động đảm bảo thiết bị có Mã Học Sinh khi mở ứng dụng (100% tự động, không cần bấm nút)
 */
export function ensureAutoStudentCode(): Promise<string> {
  // 1. Nếu thiết bị này đã từng được cấp mã trước đó, giữ nguyên mã cố định cho thiết bị
  try {
    const alreadyAllocated = localStorage.getItem(AUTO_ALLOCATED_FLAG_KEY) === '1';
    const existing = localStorage.getItem(STUDENT_ID_KEY);
    if (alreadyAllocated && existing && isAutoStudentCode(existing)) {
      return Promise.resolve(normalizeStudentCode(existing));
    }
  } catch {
    // bỏ qua lỗi storage
  }

  if (allocationPromise) {
    return allocationPromise;
  }

  allocationPromise = (async () => {
    // 2. Thiết bị mới mở vào lần đầu: Tự động kết nối Cloud Counter để lấy số thứ tự tiếp theo
    const cloudSeq = await fetchSequenceFromCloud();
    let allocatedCode = '';

    if (cloudSeq !== null && cloudSeq > 0) {
      allocatedCode = formatStudentCodeFromSequence(cloudSeq);
    } else {
      // Dự phòng cục bộ nếu không có mạng
      try {
        const rawSeq = Number(localStorage.getItem(LOCAL_SEQ_COUNTER_KEY) || '0');
        const next = rawSeq + 1;
        localStorage.setItem(LOCAL_SEQ_COUNTER_KEY, String(next));
        allocatedCode = formatStudentCodeFromSequence(next);
      } catch {
        allocatedCode = 'HS11-001';
      }
    }

    try {
      localStorage.setItem(STUDENT_ID_KEY, allocatedCode);
      localStorage.setItem(AUTO_ALLOCATED_FLAG_KEY, '1');
      window.dispatchEvent(new CustomEvent('ocop-tracker-updated'));
    } catch {
      // ignore
    }

    logEvent('CAP_MA_HS_TU_DONG', `Hệ thống tự động cấp mã cho thiết bị: ${allocatedCode}`);
    return allocatedCode;
  })().finally(() => {
    allocationPromise = null;
  });

  return allocationPromise;
}

/**
 * Cho phép đổi mã học sinh thủ công nếu giáo viên yêu cầu mã riêng
 */
export function setManualStudentCode(rawCode: string): { success: boolean; error?: string; code?: string } {
  const trimmed = (rawCode || '').trim().toUpperCase();
  if (!trimmed) {
    return { success: false, error: 'Vui lòng nhập Mã học sinh (Ví dụ: HS11-005).' };
  }
  if (trimmed.length < 2) {
    return { success: false, error: 'Mã học sinh phải có ít nhất 2 ký tự.' };
  }

  try {
    localStorage.setItem(STUDENT_ID_KEY, trimmed);
    localStorage.setItem(AUTO_ALLOCATED_FLAG_KEY, '1');
    window.dispatchEvent(new CustomEvent('ocop-tracker-updated'));
    logEvent('THIET_LAP_MA_HS_THU_CONG', `Thiết lập mã thủ công: ${trimmed}`);
    return { success: true, code: trimmed };
  } catch {
    return { success: false, error: 'Không thể lưu vào bộ nhớ trình duyệt.' };
  }
}

export function getLearningProgress(): LearningProgress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    return { ...DEFAULT_PROGRESS, ...(JSON.parse(raw) as Partial<LearningProgress>) };
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

export function updateLearningProgress(
  updater: (prev: LearningProgress) => LearningProgress
): LearningProgress {
  const current = getLearningProgress();
  const next = updater(current);
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('ocop-tracker-updated'));
  } catch {
    // ignore
  }
  return next;
}

/**
 * Hàm gửi dữ liệu ngầm về Google Sheets (tương thích 100% với tracker.js gốc, không hiển thị giao diện cho người dùng)
 */
export function logEvent(actionName: string, detailData?: unknown): void {
  const detailStr =
    typeof detailData === 'object' && detailData !== null
      ? JSON.stringify(detailData)
      : String(detailData || '');

  const studentId = getStudentCode();

  const payload = {
    studentId,
    action: actionName,
    detail: detailStr
  };

  try {
    fetch(TRACKER_API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    }).catch(() => {
      // ignore offline or CORS network errors in sandbox
    });
  } catch {
    // ignore fetch error
  }
}
