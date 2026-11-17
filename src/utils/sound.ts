// Hệ thống âm thanh tổng hợp: Nhạc nền MP3 từ thư mục /image/game-bgm.mp3 + Hiệu ứng Web Audio API
const BGM_URL = '/image/game-bgm.mp3';

let bgmAudio: HTMLAudioElement | null = null;
let soundEnabled = true;

function getBgmInstance(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  if (!bgmAudio) {
    bgmAudio = new Audio(BGM_URL);
    bgmAudio.loop = true;
    bgmAudio.volume = 0.35;
  }
  return bgmAudio;
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

export function toggleSoundEnabled(): boolean {
  soundEnabled = !soundEnabled;
  const audio = getBgmInstance();
  if (audio) {
    if (!soundEnabled) {
      audio.pause();
    }
  }
  return soundEnabled;
}

export function playBGM(): void {
  if (!soundEnabled) return;
  const audio = getBgmInstance();
  if (audio) {
    audio.currentTime = 0;
    audio.play().catch(() => {
      // Autoplay restriction handled gracefully
    });
  }
}

export function stopBGM(): void {
  const audio = getBgmInstance();
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
}

export function playSfxCorrect(): void {
  if (!soundEnabled || typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioCtx = new AudioCtx();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
    osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
    osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
    gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.45);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.45);
  } catch {
    // ignore audio errors
  }
}

export function playSfxWrong(): void {
  if (!soundEnabled || typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioCtx = new AudioCtx();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, audioCtx.currentTime);
    osc.frequency.setValueAtTime(140, audioCtx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.4);
  } catch {
    // ignore audio errors
  }
}

export function playSfxVictory(): void {
  if (!soundEnabled || typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioCtx = new AudioCtx();
    const now = audioCtx.currentTime;
    const notes = [
      { f: 523.25, t: 0.0, d: 0.15 }, // C5
      { f: 659.25, t: 0.15, d: 0.15 }, // E5
      { f: 783.99, t: 0.3, d: 0.15 }, // G5
      { f: 1046.5, t: 0.45, d: 0.6 } // C6
    ];

    notes.forEach((n) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, now + n.t);
      gain.gain.setValueAtTime(0.22, now + n.t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now + n.t);
      osc.stop(now + n.t + n.d);
    });
  } catch {
    // ignore audio errors
  }
}

// -------------------------------------------------------------
// BỘ PHÁT ÂM THANH GIỌNG ĐỌC TIẾNG VIỆT CHUẨN CHO SỨ GIẢ ONG VÀNG
// Sử dụng file âm thanh MP3 Tiếng Việt chuẩn 100% (/image/ong-vang-1..4.mp3)
// Tuyệt đối không để phát âm tiếng Anh từ giọng mặc định của máy tính
// -------------------------------------------------------------
let currentOngVangAudio: HTMLAudioElement | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;

export function stopSpeech(): void {
  stopOngVangAudio();
}

export function stopOngVangAudio(): void {
  if (currentOngVangAudio) {
    try {
      currentOngVangAudio.pause();
      currentOngVangAudio.currentTime = 0;
    } catch {
      // ignore
    }
    currentOngVangAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
    currentUtterance = null;
  }
}

export function isSpeechSpeaking(): boolean {
  if (currentOngVangAudio && !currentOngVangAudio.paused) {
    return true;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return window.speechSynthesis.speaking;
  }
  return false;
}

export function playOngVangChapterAudio(
  chapterId: number,
  callbacks?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: () => void;
  }
): void {
  if (typeof window === 'undefined') return;

  // Dừng mọi âm thanh đọc trước đó
  stopOngVangAudio();

  // 1. ƯU TIÊN SỐ 1: Phát trực tiếp file âm thanh tiếng Việt chuẩn trong /image/ong-vang-{id}.mp3
  const audioSrc = `/image/ong-vang-${chapterId}.mp3`;
  const audio = new Audio(audioSrc);
  currentOngVangAudio = audio;

  audio.onplay = () => {
    callbacks?.onStart?.();
  };

  audio.onended = () => {
    currentOngVangAudio = null;
    callbacks?.onEnd?.();
  };

  audio.onerror = () => {
    currentOngVangAudio = null;
    // Nếu không nạp được file MP3, chỉ dùng SpeechSynthesis khi CHẮC CHẮN có giọng Tiếng Việt
    // Tuyệt đối KHÔNG gọi nếu chỉ có giọng tiếng Anh
    if ('speechSynthesis' in window) {
      const voices = window.speechSynthesis.getVoices();
      const viVoice = voices.find((v) => {
        const l = v.lang.toLowerCase();
        return l.startsWith('vi') || l.includes('vi-vn') || l.includes('vietnam');
      });

      if (viVoice) {
        // Chỉ chạy khi trình duyệt có cài gói giọng Tiếng Việt
        callbacks?.onError?.();
      } else {
        callbacks?.onError?.();
      }
    } else {
      callbacks?.onError?.();
    }
  };

  audio.play().catch(() => {
    // Trường hợp trình duyệt chặn Autoplay khi chưa tương tác
    callbacks?.onError?.();
  });
}

export function speakVietnamese(
  text: string,
  callbacks?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: () => void;
  }
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  try {
    stopOngVangAudio();

    // KIỂM TRA CHẶT CHẼ: Chỉ đọc nếu có giọng tiếng Việt thực sự
    const voices = window.speechSynthesis.getVoices();
    const viVoice =
      voices.find((v) => {
        const l = v.lang.toLowerCase();
        return l.startsWith('vi') || l.includes('vi-vn') || l.includes('vietnam');
      }) ||
      voices.find((v) => v.lang.toLowerCase().includes('vi'));

    // Nếu KHÔNG có giọng tiếng Việt (máy chỉ có tiếng Anh David/Zira), KHÔNG đọc để tránh tiếng Anh rác
    if (!viVoice) {
      callbacks?.onError?.();
      return false;
    }

    const cleanText = text
      .replace(/[*#_~`]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return false;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.voice = viVoice;
    utterance.lang = 'vi-VN';
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    utterance.onstart = () => {
      callbacks?.onStart?.();
    };

    utterance.onend = () => {
      currentUtterance = null;
      callbacks?.onEnd?.();
    };

    utterance.onerror = () => {
      currentUtterance = null;
      callbacks?.onError?.();
    };

    currentUtterance = utterance;

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    callbacks?.onError?.();
    return false;
  }
}

