import React, { useEffect, useRef, useState } from 'react';
import { REPOSITORY_PRODUCTS, ProductRepositoryItem, OcopProductKey } from '../data/ocopData';
import {
  ImageColorSignals,
  OcopRecognitionResult,
  ProductPhotoRecord,
  RecognizedOcopKey,
  getCollectionProgressSummary,
  getRecognitionMetadataByKey,
  recognizeOcopProductFromSignals,
  upsertProductPhotoCollection,
  validateProductImageFile
} from '../utils/rules';
import { logEvent, updateLearningProgress } from '../utils/tracker';
import { ProductIllustration } from './Artwork';
import { StationTab } from './TopNav';

const PHOTO_COLLECTION_STORAGE_KEY = 'ocop_product_photo_collection_v1';

interface RepositoryViewProps {
  onNavigateStation: (tab: StationTab, stationLogName: string) => void;
}

function loadPhotoCollection(): Record<string, ProductPhotoRecord> {
  try {
    const raw = localStorage.getItem(PHOTO_COLLECTION_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, ProductPhotoRecord>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function savePhotoCollection(collection: Record<string, ProductPhotoRecord>): void {
  try {
    localStorage.setItem(PHOTO_COLLECTION_STORAGE_KEY, JSON.stringify(collection));
  } catch {
    // ignore storage quota errors
  }
}

/**
 * Nén ảnh chụp từ điện thoại và trích xuất tín hiệu màu sắc trung bình (RGB) phục vụ nhận diện
 */
function processImageFileWithColorSignals(
  file: File
): Promise<{ dataUrl: string; colorSignals: ImageColorSignals }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Không thể đọc file ảnh.'));
    reader.onload = () => {
      const rawDataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (!rawDataUrl) {
        reject(new Error('Dữ liệu ảnh trống.'));
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          const maxDim = 960;
          let width = img.width || 640;
          let height = img.height || 480;
          if (width > maxDim || height > maxDim) {
            if (width >= height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve({
              dataUrl: rawDataUrl,
              colorSignals: { avgR: 180, avgG: 145, avgB: 90 }
            });
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Tính trung bình màu vùng trung tâm bức ảnh để nhận diện đặc trưng sản phẩm
          let rSum = 0;
          let gSum = 0;
          let bSum = 0;
          let count = 0;
          try {
            const sampleX = Math.floor(width * 0.15);
            const sampleY = Math.floor(height * 0.15);
            const sampleW = Math.max(1, Math.floor(width * 0.7));
            const sampleH = Math.max(1, Math.floor(height * 0.7));
            const imgData = ctx.getImageData(sampleX, sampleY, sampleW, sampleH).data;
            const step = 16; // lấy mẫu mỗi 4 pixel
            for (let i = 0; i < imgData.length; i += step) {
              rSum += imgData[i];
              gSum += imgData[i + 1];
              bSum += imgData[i + 2];
              count++;
            }
          } catch {
            // ignore cross-origin or canvas read errors
          }

          const colorSignals: ImageColorSignals =
            count > 0
              ? {
                  avgR: Math.round(rSum / count),
                  avgG: Math.round(gSum / count),
                  avgB: Math.round(bSum / count)
                }
              : { avgR: 180, avgG: 145, avgB: 90 };

          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          resolve({
            dataUrl: compressed || rawDataUrl,
            colorSignals
          });
        } catch {
          resolve({
            dataUrl: rawDataUrl,
            colorSignals: { avgR: 180, avgG: 145, avgB: 90 }
          });
        }
      };
      img.onerror = () => {
        resolve({
          dataUrl: rawDataUrl,
          colorSignals: { avgR: 180, avgG: 145, avgB: 90 }
        });
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  });
}

export function RepositoryView({ onNavigateStation }: RepositoryViewProps) {
  const [selectedKey, setSelectedKey] = useState<OcopProductKey>('honey');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'Thực phẩm' | 'Thủ công mỹ nghệ & Lưu niệm'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [qrScanned, setQrScanned] = useState(false);

  // Bộ sưu tập ảnh sản phẩm đã nhận diện
  const [photoCollection, setPhotoCollection] = useState<Record<string, ProductPhotoRecord>>(() =>
    loadPhotoCollection()
  );

  // Trạng thái nhận diện tự động từ ảnh vừa chụp / chọn file
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [lastScannedPhoto, setLastScannedPhoto] = useState<{
    dataUrl: string;
    fileName: string;
    capturedAt: string;
    recognition: OcopRecognitionResult;
  } | null>(null);

  // Trạng thái mở Camera trực tiếp ngay trên trình duyệt
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Input chọn file ảnh vừa chụp (chung cho toàn bộ Kho sản phẩm)
  const filePickerInputRef = useRef<HTMLInputElement | null>(null);
  // Input chụp ảnh trực tiếp bằng điện thoại (capture="environment")
  const mobileCameraInputRef = useRef<HTMLInputElement | null>(null);
  // Ref tới mục chứa thông tin chi tiết của sản phẩm để tự động đưa người dùng tới đó sau khi nhận diện
  const productDetailSectionRef = useRef<HTMLElement | null>(null);

  const filteredProducts = REPOSITORY_PRODUCTS.filter((item) => {
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.mascotName.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q) ||
      item.producer.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  const activeProduct: ProductRepositoryItem =
    REPOSITORY_PRODUCTS.find((p) => p.key === selectedKey) || REPOSITORY_PRODUCTS[0];

  const activePhotoRecord: ProductPhotoRecord | undefined = photoCollection[activeProduct.key];
  const collectionSummary = getCollectionProgressSummary(photoCollection, REPOSITORY_PRODUCTS.length);

  function stopCameraStream() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  function markProductViewed(key: OcopProductKey, actionName: string, detailText: string) {
    logEvent(actionName, detailText);
    updateLearningProgress((prev) => ({
      ...prev,
      repoProductsViewed: prev.repoProductsViewed.includes(key)
        ? prev.repoProductsViewed
        : [...prev.repoProductsViewed, key]
    }));
  }

  function scrollToProductDetailSection() {
    setTimeout(() => {
      productDetailSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 120);
  }

  function handleOpenProfile(key: OcopProductKey) {
    setSelectedKey(key);
    setQrScanned(false);
    markProductViewed(key, 'XEM_KHO_SAN_PHAM', 'Sản phẩm: ' + key);
    scrollToProductDetailSection();
  }

  async function runAutoRecognitionAndNavigate(
    dataUrl: string,
    fileName: string,
    colorSignals: ImageColorSignals,
    sourceType: 'camera' | 'upload'
  ) {
    setIsRecognizing(true);
    setUploadError(null);

    let recognition: OcopRecognitionResult = recognizeOcopProductFromSignals(
      fileName,
      colorSignals
    );

    try {
      const response = await fetch('/api/recognize-ocop-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageDataUrl: dataUrl,
          fileName,
          colorSignals
        })
      });
      if (response.ok) {
        const data = (await response.json()) as { recognition?: OcopRecognitionResult };
        if (data.recognition && data.recognition.productKey) {
          recognition = data.recognition;
        }
      }
    } catch {
      // Sử dụng kết quả nhận diện cục bộ nếu mạng ngoại tuyến
    }

    const nowStr = new Date().toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const recognizedKey = recognition.productKey as OcopProductKey;

    const record: ProductPhotoRecord = {
      productKey: recognizedKey,
      dataUrl,
      fileName,
      capturedAt: nowStr,
      source: sourceType
    };

    setPhotoCollection((prev) => {
      const next = upsertProductPhotoCollection(prev, record);
      savePhotoCollection(next);
      return next;
    });

    setLastScannedPhoto({
      dataUrl,
      fileName,
      capturedAt: nowStr,
      recognition
    });

    // Tự động chuyển bộ lọc về 'all' (nếu đang lọc khác nhóm) và chọn đúng sản phẩm vừa nhận diện
    setCategoryFilter('all');
    setSearchQuery('');
    setSelectedKey(recognizedKey);
    setQrScanned(false);
    setIsRecognizing(false);

    markProductViewed(
      recognizedKey,
      'NHAN_DIEN_ANH_SAN_PHAM_OCOP',
      `Tự động nhận diện: ${recognition.productName} (${recognition.category}) từ file ${fileName}`
    );

    // Tự động đưa người dùng đến mục chứa thông tin chi tiết của sản phẩm đó
    scrollToProductDetailSection();
  }

  async function handleUnifiedFileSelected(
    event: React.ChangeEvent<HTMLInputElement>,
    sourceType: 'camera' | 'upload'
  ) {
    const file = event.target.files?.[0];
    event.target.value = '';

    const validation = validateProductImageFile(
      file ? { name: file.name, type: file.type, size: file.size } : null
    );
    if (!validation.valid || !file) {
      setUploadError(validation.error || 'Vui lòng chọn một file ảnh hợp lệ.');
      return;
    }

    setUploadError(null);
    setIsRecognizing(true);

    try {
      const { dataUrl, colorSignals } = await processImageFileWithColorSignals(file);
      await runAutoRecognitionAndNavigate(dataUrl, file.name, colorSignals, sourceType);
    } catch {
      setIsRecognizing(false);
      setUploadError('Không thể đọc file ảnh vừa chọn. Vui lòng thử lại với một ảnh khác.');
    }
  }

  function handleManualReclassifyScannedPhoto(newKey: RecognizedOcopKey) {
    if (!lastScannedPhoto) return;
    const updatedRecognition = getRecognitionMetadataByKey(
      newKey,
      `Đã đối chiếu sang sản phẩm ${getRecognitionMetadataByKey(newKey).productName}.`,
      100,
      'smart-visual'
    );

    const record: ProductPhotoRecord = {
      productKey: newKey,
      dataUrl: lastScannedPhoto.dataUrl,
      fileName: lastScannedPhoto.fileName,
      capturedAt: lastScannedPhoto.capturedAt,
      source: 'upload'
    };

    setPhotoCollection((prev) => {
      const next = upsertProductPhotoCollection(prev, record);
      savePhotoCollection(next);
      return next;
    });

    setLastScannedPhoto({
      ...lastScannedPhoto,
      recognition: updatedRecognition
    });

    setSelectedKey(newKey);
    setQrScanned(false);
    markProductViewed(newKey, 'DOI_CHIEU_SAN_PHAM_ANH_CHUP', `Chuyển sang: ${newKey}`);
    scrollToProductDetailSection();
  }

  async function handleOpenLiveCameraModal() {
    setCameraError(null);
    setCameraModalOpen(true);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        'Trình duyệt hiện tại không hỗ trợ mở luồng video trực tiếp. Bạn hãy bấm nút "Chụp ảnh sản phẩm" hoặc "Chọn file ảnh vừa chụp" nhé!'
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch {
      setCameraError(
        'Không thể truy cập trực tiếp ống kính máy ảnh (do chưa cấp quyền hoặc thiết bị không có webcam). Bạn có thể bấm "Chọn file ảnh vừa chụp" để lấy ảnh từ điện thoại.'
      );
    }
  }

  function handleCloseLiveCameraModal() {
    stopCameraStream();
    setCameraModalOpen(false);
    setCameraError(null);
  }

  async function handleCaptureFromLiveVideo() {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoEl.videoWidth || 640;
    canvas.height = videoEl.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    let rSum = 0;
    let gSum = 0;
    let bSum = 0;
    let count = 0;
    try {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      for (let i = 0; i < imgData.length; i += 32) {
        rSum += imgData[i];
        gSum += imgData[i + 1];
        bSum += imgData[i + 2];
        count++;
      }
    } catch {
      // ignore
    }

    const colorSignals: ImageColorSignals =
      count > 0
        ? {
            avgR: Math.round(rSum / count),
            avgG: Math.round(gSum / count),
            avgB: Math.round(bSum / count)
          }
        : { avgR: 180, avgG: 145, avgB: 90 };

    handleCloseLiveCameraModal();
    await runAutoRecognitionAndNavigate(
      dataUrl,
      'anh-camera-truc-tiep.jpg',
      colorSignals,
      'camera'
    );
  }

  function handleSimulateQrScan() {
    setQrScanned(true);
    logEvent('QUET_QR_TRUY_XUAT', `Mã lô: ${activeProduct.qrCodeData.batchCode}`);
  }

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* TIÊU ĐỀ TRẠM 3 */}
      <header className="text-center space-y-3">
        <div className="text-xs font-semibold text-emerald-800 tracking-wide">
          📦 TRẠM 3 · NHẬN DIỆN TỰ ĐỘNG QUA ẢNH CHỤP & BỘ SƯU TẬP 6 SẢN PHẨM OCOP
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 font-serif-display italic">
          Kho Sản Phẩm OCOP Tây Ninh
        </h1>
        <p className="text-xs sm:text-base text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Khi em chụp ảnh sản phẩm bằng điện thoại hoặc chọn file ảnh vừa chụp, hệ thống sẽ <strong>tự động nhận diện đó là sản phẩm OCOP gì, thuộc loại/nhóm ngành hàng nào</strong> và đưa thẳng đến mục chứa thông tin chi tiết của sản phẩm đó.
        </p>
      </header>

      {/* TRẠM CHỤP ẢNH / CHỌN FILE ẢNH VỪA CHỤP ĐỂ TỰ ĐỘNG NHẬN DIỆN SẢN PHẨM */}
      <section
        data-testid="auto-photo-scanner-section"
        className="bg-white border-2 border-emerald-700/30 rounded-2xl sm:rounded-3xl p-4 sm:p-8 space-y-5 sm:space-y-6 shadow-sm"
      >
        {/* 2 Input ẩn dùng chung cho toàn bộ Kho sản phẩm */}
        <input
          ref={filePickerInputRef}
          id="unified-photo-upload-input"
          data-testid="unified-photo-upload-input"
          type="file"
          accept="image/*"
          onChange={(e) => handleUnifiedFileSelected(e, 'upload')}
          className="sr-only"
        />
        <input
          ref={mobileCameraInputRef}
          id="unified-photo-camera-input"
          data-testid="unified-photo-camera-input"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => handleUnifiedFileSelected(e, 'camera')}
          className="sr-only"
        />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 sm:p-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-800">
              <span>🔍</span>
              <span>NHẬN DIỆN SẢN PHẨM TỰ ĐỘNG BẰNG HÌNH ẢNH</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Chụp ảnh hoặc Chọn file ảnh vừa chụp để tra cứu tự động
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Em không cần chọn trước tên sản phẩm. Hãy bấm <strong>“Chọn file ảnh vừa chụp”</strong> hoặc <strong>“Chụp ảnh sản phẩm”</strong> — hệ thống sẽ tự nhận diện sản phẩm (Mật ong, Mãng cầu, Bánh tráng, Muối tôm, Yến sào hay Nhang), phân loại nhóm ngành hàng và đưa đến đúng hồ sơ thông tin bên dưới.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              data-testid="choose-captured-file-btn"
              onClick={() => filePickerInputRef.current?.click()}
              disabled={isRecognizing}
              className="px-5 py-3 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-60 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-colors cursor-pointer flex items-center gap-2"
            >
              <span aria-hidden="true">🖼️</span>
              <span>{isRecognizing ? 'Đang nhận diện ảnh...' : 'Chọn file ảnh vừa chụp'}</span>
            </button>

            <button
              type="button"
              data-testid="take-photo-mobile-btn"
              onClick={() => mobileCameraInputRef.current?.click()}
              disabled={isRecognizing}
              className="px-5 py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-colors cursor-pointer flex items-center gap-2"
            >
              <span aria-hidden="true">📷</span>
              <span>Chụp ảnh sản phẩm</span>
            </button>

            <button
              type="button"
              data-testid="open-live-camera-btn"
              onClick={handleOpenLiveCameraModal}
              disabled={isRecognizing}
              className="px-4 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs sm:text-sm font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span aria-hidden="true">🎥</span>
              <span>Mở Camera trực tiếp</span>
            </button>
          </div>
        </div>

        {uploadError && (
          <div
            role="alert"
            className="bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm font-semibold px-4 py-3 rounded-xl"
          >
            ⚠️ {uploadError}
          </div>
        )}

        {/* HIỂN THỊ KẾT QUẢ HỆ THỐNG TỰ ĐỘNG NHẬN DIỆN SAU KHI CHỌN / CHỤP ẢNH */}
        {lastScannedPhoto && (
          <div
            data-testid="auto-recognition-result-card"
            className="bg-amber-50/70 border-2 border-amber-400 rounded-2xl p-5 sm:p-6 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg" aria-hidden="true">
                  ✅
                </span>
                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-emerald-900">
                  KẾT QUẢ HỆ THỐNG TỰ ĐỘNG NHẬN DIỆN TỪ ẢNH CỦA BẠN
                </span>
              </div>
              <span className="text-xs font-mono-code font-bold text-amber-900 bg-amber-200/70 px-2.5 py-1 rounded-lg">
                Độ khớp nhận diện: {lastScannedPhoto.recognition.confidence}%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              {/* Ảnh vừa chụp / chọn */}
              <div className="md:col-span-4">
                <div className="rounded-2xl overflow-hidden bg-white border-2 border-emerald-500 h-44 flex items-center justify-center p-2 relative">
                  <img
                    data-testid="recognized-photo-preview"
                    src={lastScannedPhoto.dataUrl}
                    alt="Ảnh sản phẩm vừa chụp"
                    className="w-full h-full object-contain block"
                  />
                  <span className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] font-mono-code px-2 py-0.5 rounded">
                    {lastScannedPhoto.fileName}
                  </span>
                </div>
              </div>

              {/* Thông tin sản phẩm gì & loại gì được hệ thống nhận diện */}
              <div className="md:col-span-8 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white border border-amber-200 rounded-xl p-3.5">
                    <div className="text-[11px] font-bold uppercase text-slate-500">
                      🏷️ Sản phẩm nhận diện được:
                    </div>
                    <div
                      data-testid="recognized-product-name"
                      className="text-base sm:text-lg font-extrabold text-emerald-900 mt-0.5"
                    >
                      {lastScannedPhoto.recognition.productName}
                    </div>
                    <div className="text-xs font-bold text-amber-800 mt-0.5">
                      Linh vật: {lastScannedPhoto.recognition.mascotName}
                    </div>
                  </div>

                  <div className="bg-white border border-amber-200 rounded-xl p-3.5">
                    <div className="text-[11px] font-bold uppercase text-slate-500">
                      📦 Loại / Nhóm sản phẩm OCOP:
                    </div>
                    <div
                      data-testid="recognized-product-category"
                      className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5"
                    >
                      {lastScannedPhoto.recognition.category}
                    </div>
                    <div className="text-xs font-semibold text-emerald-800 mt-0.5">
                      {lastScannedPhoto.recognition.productTypeDetail}
                    </div>
                  </div>
                </div>

                <div className="bg-white/90 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-700">
                  <strong>🔍 Phân tích nhận diện:</strong> {lastScannedPhoto.recognition.detectedFeatures}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={scrollToProductDetailSection}
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    ⬇️ Đi tới mục thông tin chi tiết của {lastScannedPhoto.recognition.productName}
                  </button>

                  {/* Cho phép chuyển nhanh nếu học sinh chụp góc khuất muốn đối chiếu sang sản phẩm khác */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600">
                    <span>Đổi nhanh nếu ảnh là:</span>
                    {REPOSITORY_PRODUCTS.map((p) => (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => handleManualReclassifyScannedPhoto(p.key)}
                        className={`px-2 py-1 rounded-lg font-bold border transition-colors cursor-pointer ${
                          lastScannedPhoto.recognition.productKey === p.key
                            ? 'bg-emerald-800 text-white border-emerald-800'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-600'
                        }`}
                      >
                        {p.icon} {p.name.replace(' TÂY NINH', '').replace(' VẠN LINH HƯƠNG', '')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* BANNER 6 SẢN PHẨM & 6 LINH VẬT (/image/ocop-6-animals.png) */}
      <section className="w-full rounded-3xl overflow-hidden shadow-sm border border-amber-200 bg-amber-50/40 p-3 sm:p-4">
        <img
          src="/image/ocop-6-animals.png"
          alt="Kho 6 sản phẩm và 6 con vật OCOP Tây Ninh"
          referrerPolicy="no-referrer"
          className="w-full max-h-[340px] object-contain mx-auto rounded-2xl block"
        />
      </section>

      {/* BỘ SƯU TẬP 6 SẢN PHẨM OCOP */}
      <section className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
              🗂️ BỘ SƯU TẬP 6 SẢN PHẨM OCOP TÂY NINH
            </div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Danh mục sản phẩm trong Kho ({collectionSummary.collectedCount}/{collectionSummary.totalProducts} sản phẩm đã có ảnh chụp thực tế)
            </h2>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl self-start">
            {(['all', 'Thực phẩm', 'Thủ công mỹ nghệ & Lưu niệm'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat === 'all' ? 'Tất cả 6 sản phẩm' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* LƯỚI BỘ SƯU TẬP 6 SẢN PHẨM */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {filteredProducts.map((item) => {
            const isSelected = item.key === activeProduct.key;
            const capturedPhoto = photoCollection[item.key];
            const isCollected = Boolean(capturedPhoto && capturedPhoto.dataUrl);

            return (
              <button
                key={item.key}
                type="button"
                data-testid={`collection-card-${item.key}`}
                onClick={() => handleOpenProfile(item.key)}
                className={`flex flex-col items-center text-center p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-50/90 border-amber-500 shadow-md -translate-y-0.5'
                    : isCollected
                    ? 'bg-emerald-50/40 border-emerald-300 hover:bg-white hover:border-emerald-600'
                    : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-emerald-600'
                }`}
              >
                <div className="w-full flex items-center justify-between gap-1 mb-2">
                  <span className="text-[11px] font-bold text-amber-900 truncate">
                    {item.icon} {item.category}
                  </span>
                  {isCollected && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-700 text-white shrink-0">
                      ✓ Đã chụp ảnh
                    </span>
                  )}
                </div>

                <div className="w-full h-36 rounded-xl overflow-hidden border border-amber-200/80 bg-amber-50/30 p-1.5 mb-2.5">
                  <img
                    src={item.mascotImage}
                    alt={item.mascotName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain block"
                  />
                </div>

                <span className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight">
                  {item.name}
                </span>
                <span className="text-xs font-bold text-amber-800 mt-0.5">
                  {item.mascotName}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5">
                  {'★'.repeat(item.stars)} ({item.stars} sao)
                </span>
                <span className="mt-2 text-xs font-bold text-emerald-800 underline">
                  {isSelected ? '✓ Đang mở thông tin bên dưới' : '[Xem thông tin sản phẩm]'}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* MỤC CHỨA THÔNG TIN CHI TIẾT CỦA SẢN PHẨM (TỰ ĐỘNG ĐƯA TỚI ĐÂY KHI NHẬN DIỆN XONG) */}
      <section
        ref={productDetailSectionRef}
        id="product-detail-section"
        data-testid="product-detail-section"
        className="bg-white border-2 border-emerald-700/40 rounded-2xl sm:rounded-3xl p-4 sm:p-8 space-y-5 sm:space-y-6 shadow-sm scroll-mt-24"
      >
        {lastScannedPhoto && lastScannedPhoto.recognition.productKey === activeProduct.key && (
          <div
            data-testid="recognized-match-banner"
            className="flex flex-wrap items-center justify-between gap-2 bg-emerald-900 text-white px-4 py-3 rounded-2xl"
          >
            <span className="text-xs sm:text-sm font-bold">
              🎯 Hệ thống đã nhận diện ảnh của bạn là <strong>{activeProduct.name}</strong> (Loại: <strong>{activeProduct.category}</strong>) và mở hồ sơ thông tin dưới đây:
            </span>
            <span className="text-xs font-mono-code text-emerald-200">
              {activeProduct.ocop}
            </span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <h2
            data-testid="active-product-header"
            className="text-lg sm:text-xl font-extrabold text-emerald-900"
          >
            {activeProduct.header}
          </h2>
          <span className="text-xs font-mono-code text-slate-500">
            {activeProduct.decisionNumber}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Cột ảnh minh họa Con vật, Ảnh thực tế đã chụp (nếu có) & Quét QR */}
          <div className="md:col-span-5 space-y-4">
            {activePhotoRecord?.dataUrl && (
              <div className="rounded-2xl overflow-hidden border-2 border-emerald-500 bg-emerald-50/30 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-900">
                    📸 ẢNH THỰC TẾ ĐÃ NHẬN DIỆN
                  </span>
                  <span className="text-[11px] font-mono-code text-slate-500">
                    {activePhotoRecord.capturedAt}
                  </span>
                </div>
                <div className="rounded-xl overflow-hidden bg-white border border-emerald-200 h-48 flex items-center justify-center">
                  <img
                    src={activePhotoRecord.dataUrl}
                    alt={`Ảnh chụp sản phẩm ${activeProduct.name}`}
                    className="w-full h-full object-contain block"
                  />
                </div>
              </div>
            )}

            <div className="rounded-2xl overflow-hidden border-2 border-amber-200 bg-amber-50/30">
              <ProductIllustration
                productKey={activeProduct.key}
                className="w-full h-52 object-contain p-2 bg-amber-50/30"
              />
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  📱 KIỂM TRA TEM TRUY XUẤT QR
                </span>
                <button
                  type="button"
                  onClick={handleSimulateQrScan}
                  className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  {qrScanned ? 'Đã quét mã QR ✓' : 'Quét thử tem QR'}
                </button>
              </div>

              {qrScanned ? (
                <div className="bg-white border border-emerald-200 rounded-lg p-3 text-xs space-y-1 font-mono-code text-slate-700">
                  <div className="text-emerald-800 font-bold">
                    ✓ XÁC THỰC LÔ HÀNG CHÍNH HÃNG ({activeProduct.mascotName})
                  </div>
                  <div>Mã lô: {activeProduct.qrCodeData.batchCode}</div>
                  <div>NSX: {activeProduct.qrCodeData.mfgDate}</div>
                  <div>HSD: {activeProduct.qrCodeData.expDate}</div>
                  <div>Tiêu chuẩn: {activeProduct.qrCodeData.standard}</div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Bấm “Quét thử tem QR” để xem các dữ liệu bắt buộc phải xuất hiện khi người tiêu dùng kiểm tra mã truy xuất nguồn gốc.
                </p>
              )}
            </div>
          </div>

          {/* Cột Bảng dữ liệu chuẩn hóa của sản phẩm */}
          <div className="md:col-span-7 space-y-4">
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm border-collapse">
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-600 bg-slate-50 w-36 whitespace-nowrap">
                      🏷️ Tên sản phẩm:
                    </td>
                    <td className="py-3 px-4 text-slate-900 font-extrabold">
                      {activeProduct.name}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-600 bg-slate-50 whitespace-nowrap">
                      📦 Loại sản phẩm:
                    </td>
                    <td className="py-3 px-4 text-emerald-900 font-bold">
                      {activeProduct.category}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-600 bg-slate-50 whitespace-nowrap">
                      🐾 Linh vật đại diện:
                    </td>
                    <td className="py-3 px-4 text-amber-900 font-extrabold">
                      {activeProduct.mascotName}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-600 bg-slate-50 whitespace-nowrap">
                      📍 Địa phương:
                    </td>
                    <td className="py-3 px-4 text-slate-900 font-medium whitespace-pre-line">
                      {activeProduct.location}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-600 bg-slate-50 whitespace-nowrap">
                      🏭 Chủ thể:
                    </td>
                    <td className="py-3 px-4 text-slate-900 font-bold">
                      {activeProduct.producer}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-600 bg-slate-50 whitespace-nowrap">
                      ⭐ Tiêu chuẩn OCOP:
                    </td>
                    <td className="py-3 px-4 text-emerald-800 font-bold">
                      {activeProduct.ocop}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 leading-relaxed">
              {activeProduct.desc}
            </div>

            <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 space-y-2">
              <h3 className="text-xs font-extrabold uppercase text-amber-900">
                ✨ Đặc điểm nổi bật của sản phẩm:
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-slate-700">
                {activeProduct.highlights.map((hl, idx) => (
                  <li key={idx}>{hl}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-extrabold uppercase text-slate-700">
                🔍 Gợi ý đối chiếu thực tế trên bao bì:
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-slate-600">
                {activeProduct.verificationChecklist.map((chk, idx) => (
                  <li key={idx}>{chk}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CỬA SỔ MỞ CAMERA TRỰC TIẾP */}
      {cameraModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Chụp ảnh sản phẩm OCOP để tự động nhận diện"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4"
        >
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="text-xs font-bold uppercase text-emerald-800">
                  MÁY ẢNH NHẬN DIỆN TỰ ĐỘNG
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Chụp ảnh sản phẩm OCOP bất kỳ
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseLiveCameraModal}
                aria-label="Đóng máy ảnh"
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {cameraError ? (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs sm:text-sm text-amber-900 space-y-3">
                <p>{cameraError}</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleCloseLiveCameraModal();
                      filePickerInputRef.current?.click();
                    }}
                    className="px-4 py-2 bg-emerald-800 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    🖼️ Chọn file ảnh vừa chụp từ máy
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden bg-slate-950 aspect-video flex items-center justify-center">
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={handleCloseLiveCameraModal}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleCaptureFromLiveVideo}
                    className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-bold rounded-xl cursor-pointer"
                  >
                    📸 Chụp & Tự động nhận diện sản phẩm
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ĐIỀU HƯỚNG CHUYỂN TRẠM */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => onNavigateStation('ban-do', 'BACK_TO_BAN_DO')}
          className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors"
        >
          &larr; Trạm 2: Bản đồ 6 sản phẩm
        </button>
        <button
          type="button"
          onClick={() => onNavigateStation('thu-thach', 'NEXT_TO_THU_THACH')}
          className="px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors"
        >
          Tiếp tục sang Trạm 4: Thử thách 10 câu &rarr;
        </button>
      </div>
    </div>
  );
}
