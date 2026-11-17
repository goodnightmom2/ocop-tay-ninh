import React, { useState, useEffect } from 'react';
import { MAP_PRODUCT_PINS, MapProductPin, OcopProductKey } from '../data/ocopData';
import {
  computeMapRoute,
  interpolateBezierPoint,
  evaluateHoneyMapChecklist,
  MapCoordinate,
  MapRouteGeometry
} from '../utils/rules';
import { logEvent, updateLearningProgress } from '../utils/tracker';
import { MascotAvatar, ProductIllustration, TayNinhMapBackground } from './Artwork';
import { StationTab } from './TopNav';
import { playSfxCorrect, playSfxWrong } from '../utils/sound';

interface MapViewProps {
  onNavigateStation: (tab: StationTab, stationLogName: string) => void;
}

interface CompletedRouteLeg {
  id: string;
  fromKey: OcopProductKey;
  toKey: OcopProductKey;
  fromName: string;
  toName: string;
  geometry: MapRouteGeometry;
}

export function MapView({ onNavigateStation }: MapViewProps) {
  const [selectedPinKey, setSelectedPinKey] = useState<OcopProductKey>('honey');
  const [previousPinKey, setPreviousPinKey] = useState<OcopProductKey | null>(null);
  const [activeRoute, setActiveRoute] = useState<MapRouteGeometry | null>(null);
  const [routeHistory, setRouteHistory] = useState<CompletedRouteLeg[]>([]);
  const [sourcePortalMessage, setSourcePortalMessage] = useState<string | null>(null);

  // Moving mascot position & state on the big map
  const [travelPos, setTravelPos] = useState<MapCoordinate>(() => MAP_PRODUCT_PINS[0].coordinates);
  const [movementMode, setMovementMode] = useState<'roaming' | 'traveling'>('roaming');
  const [patrolStepIndex, setPatrolStepIndex] = useState<number>(0);

  // Quiz state for Honey Pin (3 core information items)
  const [honeyChecks, setHoneyChecks] = useState<number[]>([]);
  const [honeyQuizResult, setHoneyQuizResult] = useState<'none' | 'correct' | 'wrong'>('none');

  // Radio quiz states for all 6 pins
  const [selectedQuizOption, setSelectedQuizOption] = useState<Record<string, string>>({});
  const [quizResultByPin, setQuizResultByPin] = useState<
    Record<string, 'none' | 'correct' | 'wrong'>
  >({});

  const activePin: MapProductPin =
    MAP_PRODUCT_PINS.find((p) => p.key === selectedPinKey) || MAP_PRODUCT_PINS[0];

  const previousPin: MapProductPin | null = previousPinKey
    ? MAP_PRODUCT_PINS.find((p) => p.key === previousPinKey) || null
    : null;

  // Continuous patrol movement on the big map when in 'roaming' mode
  useEffect(() => {
    if (movementMode !== 'roaming') return;
    const waypoints = activePin.patrolWaypoints;
    if (!waypoints || waypoints.length === 0) return;

    const timer = window.setInterval(() => {
      setPatrolStepIndex((prev) => {
        const nextIdx = (prev + 1) % waypoints.length;
        setTravelPos(waypoints[nextIdx]);
        return nextIdx;
      });
    }, 1100);

    return () => window.clearInterval(timer);
  }, [movementMode, activePin]);

  function handleSelectPin(nextKey: OcopProductKey) {
    const targetPin = MAP_PRODUCT_PINS.find((p) => p.key === nextKey);
    if (!targetPin) return;

    setSourcePortalMessage(null);
    playSfxCorrect();

    if (nextKey !== selectedPinKey) {
      const currentPin =
        MAP_PRODUCT_PINS.find((p) => p.key === selectedPinKey) || MAP_PRODUCT_PINS[0];
      const route = computeMapRoute(currentPin.coordinates, targetPin.coordinates);

      setPreviousPinKey(currentPin.key);
      setSelectedPinKey(nextKey);
      setActiveRoute(route);
      setMovementMode('traveling');

      setRouteHistory((prev) => [
        ...prev.slice(-4),
        {
          id: `${currentPin.key}-${targetPin.key}-${Date.now()}`,
          fromKey: currentPin.key,
          toKey: targetPin.key,
          fromName: `${currentPin.name} (${currentPin.mascotName})`,
          toName: `${targetPin.name} (${targetPin.mascotName})`,
          geometry: route
        }
      ]);

      // Animate mascot traveling step-by-step along the route curve from currentPin to targetPin
      const steps = [0, 0.25, 0.5, 0.75, 1];
      steps.forEach((t, index) => {
        window.setTimeout(() => {
          const pt = interpolateBezierPoint(route.from, route.controlPoint, route.to, t);
          setTravelPos(pt);
          if (t === 1) {
            setMovementMode('roaming');
            setPatrolStepIndex(0);
          }
        }, index * 220);
      });

      logEvent(
        'DI_CHUYEN_BAN_DO_OCOP',
        `Từ ${currentPin.name} (${currentPin.mascotName}) đến ${targetPin.name} (${targetPin.mascotName})`
      );
    } else {
      // Clicking the already active product triggers an immediate patrol movement lap on the big map
      setMovementMode('roaming');
      const waypoints = targetPin.patrolWaypoints;
      const nextIdx = (patrolStepIndex + 1) % waypoints.length;
      setPatrolStepIndex(nextIdx);
      setTravelPos(waypoints[nextIdx]);
      logEvent(
        'DI_CHUYEN_VUNG_NGUYEN_LIEU',
        `${targetPin.mascotName} di chuyển tuần tra vùng ${targetPin.name} tại ${targetPin.district}`
      );
    }

    updateLearningProgress((prev) => ({
      ...prev,
      mapPinsVisited: prev.mapPinsVisited.includes(nextKey)
        ? prev.mapPinsVisited
        : [...prev.mapPinsVisited, nextKey]
    }));
  }

  function handleTriggerPatrolStep() {
    setMovementMode('roaming');
    const waypoints = activePin.patrolWaypoints;
    const nextIdx = (patrolStepIndex + 1) % waypoints.length;
    setPatrolStepIndex(nextIdx);
    setTravelPos(waypoints[nextIdx]);
    playSfxCorrect();
  }

  function toggleHoneyCheck(id: number) {
    setHoneyQuizResult('none');
    setHoneyChecks((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function handleCheckHoneyQuiz() {
    const isCorrect = evaluateHoneyMapChecklist(honeyChecks);
    if (isCorrect) {
      setHoneyQuizResult('correct');
      playSfxCorrect();
      logEvent('LAM_QUIZ_HO_SO_MAT_ONG', 'Đúng');
      updateLearningProgress((prev) => ({
        ...prev,
        mapQuizzesPassed: prev.mapQuizzesPassed.includes('honey')
          ? prev.mapQuizzesPassed
          : [...prev.mapQuizzesPassed, 'honey']
      }));
    } else {
      setHoneyQuizResult('wrong');
      playSfxWrong();
      logEvent('LAM_QUIZ_HO_SO_MAT_ONG', 'Sai');
    }
  }

  function handleCheckFieldQuiz(pin: MapProductPin) {
    const chosen = selectedQuizOption[pin.key] || '';
    if (chosen === pin.fieldQuiz.correctVal) {
      setQuizResultByPin((prev) => ({ ...prev, [pin.key]: 'correct' }));
      playSfxCorrect();
      logEvent(`LAM_QUIZ_MAP_${pin.key.toUpperCase()}`, 'Đúng');
      updateLearningProgress((prev) => ({
        ...prev,
        mapQuizzesPassed: prev.mapQuizzesPassed.includes(pin.key)
          ? prev.mapQuizzesPassed
          : [...prev.mapQuizzesPassed, pin.key]
      }));
    } else {
      setQuizResultByPin((prev) => ({ ...prev, [pin.key]: 'wrong' }));
      playSfxWrong();
      logEvent(`LAM_QUIZ_MAP_${pin.key.toUpperCase()}`, 'Sai');
    }
  }

  // Build SVG polygon points for the active product's patrol loop on the big map
  const patrolPolygonPoints = activePin.patrolWaypoints
    .map((pt) => `${pt.x},${pt.y}`)
    .join(' ');

  return (
    <div className="max-w-6xl mx-auto px-2.5 sm:px-6 py-5 sm:py-8 space-y-6 sm:space-y-8">
      {/* TIÊU ĐỀ TRANG BẢN ĐỒ */}
      <header className="text-center space-y-3">
        <div className="text-xs font-semibold text-emerald-800 tracking-wide">
          🗺️ TRẠM 2 · BẢN ĐỒ SỐ TƯƠNG TÁC 6 SẢN PHẨM & 6 LINH VẬT OCOP TÂY NINH
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 font-serif-display italic">
          Bản Đồ Hành Trình 6 Tinh Hoa OCOP Tây Ninh
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Bấm vào từng sản phẩm hoặc linh vật (<strong>Mật ong – Con Ong</strong>, <strong>Mãng cầu – Con Sâu</strong>, <strong>Bánh tráng – Con Sóc</strong>, <strong>Muối tôm – Con Tôm</strong>, <strong>Yến sào – Con Yến</strong>, <strong>Nhang – Con Rồng</strong>) để xem linh vật di chuyển trên bản đồ lớn và vẽ đường đi kết nối từ sản phẩm hiện tại sang sản phẩm tiếp theo!
        </p>
      </header>

      {/* BẢNG MINH HỌA 6 LINH VẬT & 6 SẢN PHẨM (/image/ocop-6-animals.png) */}
      <section className="bg-white/95 border border-amber-200 rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs sm:text-sm font-extrabold text-amber-900">
            ✨ BỘ 6 LINH VẬT ĐỒNG HÀNH CÙNG 6 ĐẶC SẢN OCOP TÂY NINH (Bấm vào thẻ bất kỳ để di chuyển trên Bản đồ to)
          </div>
          <span className="text-xs text-slate-500">
            Cập nhật địa danh hành chính mới tỉnh Tây Ninh
          </span>
        </div>

        {/* 6 Thẻ Con Vật Tương Tác Trực Tiếp */}
        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
          {MAP_PRODUCT_PINS.map((pin) => {
            const isSelected = pin.key === selectedPinKey;
            return (
              <button
                key={pin.key}
                type="button"
                onClick={() => handleSelectPin(pin.key)}
                className={`group text-left rounded-xl sm:rounded-2xl p-1.5 sm:p-2.5 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-50 border-amber-500 shadow-md -translate-y-0.5'
                    : 'bg-white border-slate-200 hover:border-emerald-600 hover:bg-slate-50'
                }`}
              >
                <div className="rounded-lg sm:rounded-xl overflow-hidden border border-amber-200/70 h-20 sm:h-28 bg-amber-50/40 mb-1.5 p-1">
                  <img
                    src={pin.mascotImage}
                    alt={pin.shortLabel}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain block group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <div>
                  <div className="text-[11px] sm:text-xs font-extrabold text-slate-900 truncate">
                    {pin.name}
                  </div>
                  <div className="text-[9px] sm:text-[11px] font-bold text-amber-800 truncate">
                    – {pin.mascotName} –
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">
                    {pin.district}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* KHUNG BẢN ĐỒ TO TƯƠNG TÁC TÂY NINH VỚI ĐƯỜNG ĐI & DI CHUYỂN LINH VẬT */}
      <section className="bg-amber-50/50 border-2 border-amber-300/80 rounded-2xl sm:rounded-3xl p-2.5 sm:p-7 space-y-3 sm:space-y-5 shadow-sm">
        {/* Thanh trạng thái hành trình di chuyển trên bản đồ to */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 sm:gap-3 bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-3 sm:p-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-extrabold text-emerald-950">
              <span>🧭 HÀNH TRÌNH TRÊN BẢN ĐỒ LỚN:</span>
              {previousPin && activeRoute ? (
                <span className="text-amber-900">
                  Từ <strong>{previousPin.name} ({previousPin.mascotName})</strong> &rarr; Đến{' '}
                  <strong>{activePin.name} ({activePin.mascotName})</strong>
                </span>
              ) : (
                <span className="text-emerald-800">
                  <strong>{activePin.mascotName} ({activePin.name})</strong> đang di chuyển tuần tra vùng nguyên liệu tại{' '}
                  <strong>{activePin.district}</strong>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600">
              {movementMode === 'traveling'
                ? `🚀 Linh vật đang di chuyển dọc theo đường nối tới ${activePin.name} (${activePin.district})...`
                : `🐾 ${activePin.mascotName} đang di chuyển hoạt động quanh vùng ${activePin.name} (${activePin.district}). Bấm vào một sản phẩm khác để vẽ đường đi mới!`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleTriggerPatrolStep}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              🐾 Di chuyển {activePin.mascotName} quanh vùng
            </button>
            {routeHistory.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setRouteHistory([]);
                  setActiveRoute(null);
                  setPreviousPinKey(null);
                }}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap"
              >
                Xóa đường đi ({routeHistory.length})
              </button>
            )}
          </div>
        </div>

        {/* VÙNG BẢN ĐỒ TO (BIG INTERACTIVE MAP CANVAS) */}
        <div
          className="relative w-full h-[470px] sm:h-[580px] rounded-2xl sm:rounded-3xl overflow-hidden border-2 sm:border-4 border-white shadow-lg bg-sky-50"
          data-testid="ocop-big-map-canvas"
        >
          <TayNinhMapBackground />

          {/* LỚP SVG VẼ ĐƯỜNG ĐI KẾT NỐI GIỮA CÁC SẢN PHẨM & VÒNG TUẦN TRA */}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
            aria-label="Lớp đường đi di chuyển giữa các sản phẩm OCOP"
          >
            <defs>
              <linearGradient id="activeRouteGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="50%" stopColor="#EF4444" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
              <marker
                id="route-arrow"
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="3.5"
                markerHeight="3.5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#EA580C" />
              </marker>
            </defs>

            {/* Vòng tuần tra quanh vùng nguyên liệu của sản phẩm đang chọn */}
            <polyline
              points={patrolPolygonPoints}
              fill="rgba(254, 240, 138, 0.22)"
              stroke="#059669"
              strokeWidth="0.45"
              strokeDasharray="1.5 1.2"
            />

            {/* Lịch sử các chặng đường đã đi qua trước đó */}
            {routeHistory.map((leg) => (
              <path
                key={leg.id}
                d={leg.geometry.svgPath}
                fill="none"
                stroke="rgba(15, 23, 42, 0.25)"
                strokeWidth="0.6"
                strokeDasharray="1.8 1.8"
              />
            ))}

            {/* Đường đi chính nối từ Sản phẩm hiện tại sang Sản phẩm mới */}
            {activeRoute && (
              <g data-testid="active-map-route">
                {/* Đường nền phát sáng */}
                <path
                  d={activeRoute.svgPath}
                  fill="none"
                  stroke="#FEF08A"
                  strokeWidth="2.1"
                  strokeLinecap="round"
                  opacity="0.85"
                />
                {/* Đường nét đứt chuyển động có mũi tên chỉ hướng */}
                <path
                  d={activeRoute.svgPath}
                  fill="none"
                  stroke="url(#activeRouteGrad)"
                  strokeWidth="1.15"
                  strokeLinecap="round"
                  markerEnd="url(#route-arrow)"
                  className="route-path-animated"
                />
                {/* Vòng tròn đánh dấu Điểm xuất phát và Điểm đích */}
                <circle
                  cx={activeRoute.from.x}
                  cy={activeRoute.from.y}
                  r="1.6"
                  fill="#F59E0B"
                  stroke="#FFFFFF"
                  strokeWidth="0.5"
                />
                <circle
                  cx={activeRoute.to.x}
                  cy={activeRoute.to.y}
                  r="2.0"
                  fill="#059669"
                  stroke="#FFFFFF"
                  strokeWidth="0.6"
                />
              </g>
            )}
          </svg>

          {/* Nhãn hướng di chuyển ở điểm giữa của Đường đi (không hiển thị số km) */}
          {activeRoute && previousPin && (
            <div
              style={{
                left: `${activeRoute.midPoint.x}%`,
                top: `${activeRoute.midPoint.y}%`
              }}
              className="-translate-x-1/2 -translate-y-1/2 absolute z-20 pointer-events-none bg-amber-950/90 text-amber-100 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-[11px] font-bold shadow-md border border-amber-400 whitespace-nowrap"
            >
              🛣️ {previousPin.name} &rarr; {activePin.name}
            </div>
          )}

          {/* Nhãn góc trên Bản đồ to */}
          <div className="absolute top-2 left-2 sm:top-3.5 sm:left-4 z-20 bg-white/95 backdrop-blur-sm px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-extrabold text-emerald-950 border border-emerald-200 shadow-xs">
            🗺️ Bản đồ OCOP Tây Ninh <span className="hidden sm:inline">(6 trạm đặc sản & linh vật)</span>
          </div>

          {/* 6 TRẠM SẢN PHẨM KÈM HÌNH CON VẬT TRÊN BẢN ĐỒ TO */}
          {MAP_PRODUCT_PINS.map((pin) => {
            const isActive = pin.key === selectedPinKey;
            const isOrigin = previousPinKey === pin.key && pin.key !== selectedPinKey;
            const shortName = pin.shortLabel.split('–')[0].trim();
            return (
              <button
                key={pin.key}
                type="button"
                onClick={() => handleSelectPin(pin.key)}
                style={{
                  left: `${pin.coordinates.x}%`,
                  top: `${pin.coordinates.y}%`
                }}
                aria-label={`Điểm ghim ${pin.name} - ${pin.mascotName} tại ${pin.district}`}
                className={`-translate-x-1/2 -translate-y-1/2 absolute flex flex-col sm:flex-row items-center sm:gap-2.5 p-1 sm:p-2 sm:pr-3.5 rounded-xl sm:rounded-2xl border-2 transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-900 text-white border-amber-300 shadow-xl ring-2 sm:ring-4 ring-amber-400/50 scale-105 z-25'
                    : isOrigin
                    ? 'bg-amber-100/95 text-amber-950 border-amber-500 shadow-md z-20'
                    : 'bg-white/95 text-slate-900 border-emerald-700/40 hover:border-emerald-700 shadow-md z-20'
                }`}
              >
                <div className="relative shrink-0">
                  <MascotAvatar mascot={pin.mascotKey} className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl border border-white/60" />
                  <span className="sm:hidden absolute -bottom-1 -right-1 text-[10px] leading-none">
                    {pin.icon}
                  </span>
                </div>

                {/* Tên hiển thị trên điện thoại (gọn gàng, không bị chồng đè) */}
                <div className="sm:hidden text-center mt-0.5 max-w-[56px]">
                  <div className={`text-[9px] font-black truncate leading-tight ${isActive ? 'text-amber-200' : 'text-slate-900'}`}>
                    {shortName}
                  </div>
                  <div className={`text-[8px] font-bold truncate leading-tight ${isActive ? 'text-emerald-200' : 'text-amber-800'}`}>
                    {pin.mascotName}
                  </div>
                </div>

                {/* Tên hiển thị trên máy tính (đầy đủ chi tiết) */}
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-extrabold flex items-center gap-1 whitespace-nowrap">
                    <span>{pin.icon}</span>
                    <span>{pin.name}</span>
                  </div>
                  <div
                    className={`text-[10px] font-bold whitespace-nowrap ${
                      isActive ? 'text-amber-300' : 'text-amber-800'
                    }`}
                  >
                    {pin.mascotName}
                  </div>
                  <div
                    className={`text-[9px] font-medium whitespace-nowrap ${
                      isActive ? 'text-emerald-100' : 'text-slate-500'
                    }`}
                  >
                    {pin.district}
                  </div>
                </div>
              </button>
            );
          })}

          {/* NHÂN VẬT CON VẬT ĐANG DI CHUYỂN TRỰC TIẾP TRÊN BẢN ĐỒ TO */}
          <div
            data-testid="moving-map-mascot"
            style={{
              left: `${travelPos.x}%`,
              top: `${travelPos.y}%`
            }}
            className="-translate-x-1/2 -translate-y-1/2 absolute z-30 pointer-events-none transition-all duration-300 ease-out"
          >
            <div className="relative flex flex-col items-center">
              <div className="absolute -top-5 sm:-top-6 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 text-[8px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full shadow-md border border-white whitespace-nowrap">
                {movementMode === 'traveling'
                  ? `🚀 Tới ${activePin.name}`
                  : `🐾 ${activePin.mascotName}`}
              </div>
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl overflow-hidden border-2 sm:border-3 border-amber-400 shadow-xl bg-white ring-2 ring-amber-300/60 animate-pulse">
                <img
                  src={activePin.mascotImage}
                  alt={`Linh vật ${activePin.mascotName} đang di chuyển`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain p-0.5 block"
                />
              </div>
            </div>
          </div>

          {/* Hướng dẫn bên dưới Bản đồ to */}
          <div className="absolute bottom-2 sm:bottom-3.5 left-1/2 -translate-x-1/2 z-20 bg-white/95 backdrop-blur-sm px-2.5 py-1 sm:px-4 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold text-slate-800 shadow-sm border border-slate-200 text-center whitespace-nowrap max-w-[95%] sm:max-w-none">
            <span className="sm:hidden">👆 Chạm sản phẩm khác để nối đường đi!</span>
            <span className="hidden sm:inline">👆 Bấm vào sản phẩm khác trên bản đồ để xem đường đi di chuyển từ {activePin.name} ({activePin.mascotName}) đến điểm mới!</span>
          </div>
        </div>

        {/* KHUNG THÔNG TIN CHI TIẾT & VIDEO GIỚI THIỆU KHI BẤM VÀO ĐIỂM GHIM */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-5 space-y-4">
              {activePin.hasVideo && activePin.videoSrc ? (
                <>
                  {/* KHUNG XEM VIDEO NGẮN GIỚI THIỆU SẢN PHẨM (MÃNG CẦU & NHANG) */}
                  <div
                    className="bg-slate-900 text-slate-100 rounded-2xl p-4 space-y-3 border border-slate-800 shadow-sm"
                    data-testid="map-product-video-box"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-xs font-extrabold text-amber-400 flex items-center gap-1.5">
                        <span>🎬</span>
                        <span>VIDEO GIỚI THIỆU: {activePin.name.toUpperCase()} ({activePin.mascotName})</span>
                      </div>
                    </div>

                    <div className="w-full rounded-xl overflow-hidden bg-black border border-slate-700">
                      <video
                        key={activePin.videoSrc}
                        src={activePin.videoSrc}
                        controls
                        playsInline
                        preload="metadata"
                        poster={activePin.mascotImage}
                        className="w-full h-56 object-contain block bg-black"
                        onPlay={() =>
                          logEvent(
                            `XEM_VIDEO_${activePin.key.toUpperCase()}`,
                            `Phát video giới thiệu ${activePin.name} (${activePin.videoSrc})`
                          )
                        }
                      >
                        Trình duyệt của bạn không hỗ trợ thẻ video.
                      </video>
                    </div>

                    {activePin.documentarySummary && (
                      <div className="border-t border-slate-800 pt-2.5 space-y-1">
                        <div className="text-xs font-bold text-slate-200">
                          Tóm tắt nội dung video ({activePin.documentarySummary.duration}):
                        </div>
                        <ul className="space-y-1 text-xs text-slate-300">
                          {activePin.documentarySummary.productionSteps.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* ẢNH THỰC ĐỊA DƯỚI VIDEO (map-mangcau.jpg / map-nhang.jpg) */}
                  <div className="rounded-2xl overflow-hidden border-2 border-amber-200 bg-amber-50/30 flex items-center justify-center p-1">
                    {activePin.bottomImage ? (
                      <img
                        src={activePin.bottomImage}
                        alt={`Hình ảnh thực địa ${activePin.name}`}
                        referrerPolicy="no-referrer"
                        className="w-full max-h-60 sm:max-h-72 object-contain block"
                      />
                    ) : (
                      <ProductIllustration
                        productKey={activePin.key}
                        className="w-full h-44 object-contain p-2 bg-amber-50/40"
                      />
                    )}
                  </div>
                </>
              ) : (
                /* HIỂN THỊ ẢNH SẢN PHẨM: YẾN SÀO, MUỐI TÔM, BÁNH TRÁNG, MẬT ONG */
                <div className="space-y-4">
                  <div
                    data-testid="map-product-image-box"
                    className="rounded-2xl overflow-hidden border-2 border-amber-200 bg-amber-50/30 flex items-center justify-center p-1.5 shadow-sm"
                  >
                    <img
                      src={activePin.productImage || activePin.mascotImage}
                      alt={`Hình ảnh sản phẩm ${activePin.name}`}
                      referrerPolicy="no-referrer"
                      className="w-full max-h-80 sm:max-h-[460px] object-contain block rounded-xl"
                    />
                  </div>

                  {activePin.bottomImage && (
                    <div
                      data-testid="map-product-bottom-image-box"
                      className="rounded-2xl overflow-hidden border-2 border-amber-200 bg-amber-50/30 flex items-center justify-center p-1.5 shadow-sm"
                    >
                      <img
                        src={activePin.bottomImage}
                        alt={`Giấy chứng nhận / Hình ảnh bổ sung ${activePin.name}`}
                        referrerPolicy="no-referrer"
                        className="w-full max-h-80 sm:max-h-[460px] object-contain block rounded-xl"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="md:col-span-7 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-extrabold uppercase text-amber-800">
                    {activePin.icon} LINH VẬT ĐẠI DIỆN: {activePin.mascotBadge.toUpperCase()}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
                    {activePin.title}
                  </h3>
                  <p className="text-xs font-semibold text-emerald-800 mt-1 whitespace-pre-line">
                    {activePin.location}
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">{activePin.desc}</p>

              {/* Thẻ hồ sơ chuẩn OCOP */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-sm">
                <div className="font-bold text-slate-900 border-b border-slate-200 pb-2">
                  {activePin.icon} HỒ SƠ ĐỊNH DANH SẢN PHẨM OCOP
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                  <span className="text-slate-500 font-semibold">Tên sản phẩm:</span>
                  <span className="sm:col-span-2 font-bold text-slate-900">
                    {activePin.profile.productName}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                  <span className="text-slate-500 font-semibold">🐾 Linh vật:</span>
                  <span className="sm:col-span-2 font-bold text-amber-900">
                    {activePin.mascotBadge}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                  <span className="text-slate-500 font-semibold">📍 Địa phương:</span>
                  <span className="sm:col-span-2 text-slate-800 whitespace-pre-line">{activePin.profile.locality}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                  <span className="text-slate-500 font-semibold">🏭 Chủ thể:</span>
                  <span className="sm:col-span-2 font-semibold text-slate-900">
                    {activePin.profile.producer}
                  </span>
                </div>
                {activePin.profile.contact && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                    <span className="text-slate-500 font-semibold">📞 Liên hệ / Nguồn:</span>
                    <span className="sm:col-span-2 text-slate-700 font-mono-code text-xs">
                      {activePin.profile.contact}
                    </span>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                  <span className="text-slate-500 font-semibold">📦 Nhóm ngành:</span>
                  <span className="sm:col-span-2 text-slate-800">{activePin.profile.category}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                  <span className="text-slate-500 font-semibold">⭐ Chứng nhận:</span>
                  <span className="sm:col-span-2 font-bold text-emerald-800">
                    {activePin.profile.ocopRating} ({activePin.profile.decisionCode})
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      logEvent(`XEM_THEM_${activePin.key.toUpperCase()}`, 'Tra cứu cổng thông tin chính thức');
                      setSourcePortalMessage(
                        `Đã xác thực hồ sơ "${activePin.profile.productName}" (${activePin.mascotBadge}) của chủ thể "${activePin.profile.producer}" trên Cổng dữ liệu OCOP tỉnh Tây Ninh (${activePin.profile.decisionCode}).`
                      );
                    }}
                    className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    🔎 ĐỐI CHIẾU NGUỒN CHÍNH THỨC
                  </button>
                </div>

                {sourcePortalMessage && (
                  <div className="mt-2 p-3 rounded-lg bg-sky-50 border border-sky-200 text-xs text-sky-950 font-medium">
                    🏛️ {sourcePortalMessage}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CÂU HỎI THỰC ĐỊA TƯƠNG TÁC TẠI MỖI TRẠM SẢN PHẨM */}
          {activePin.key === 'honey' ? (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-5 space-y-3">
              <p className="text-sm font-bold text-emerald-950">
                📝 Bài tập thực địa cùng Con Ong (Mật Ong Bảo An): Em hãy đánh dấu chọn đúng 3 thông tin cốt lõi cần kiểm chứng trên hồ sơ OCOP:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm">
                {[
                  { id: 1, label: 'Chủ thể sản xuất' },
                  { id: 2, label: 'Nguồn gốc địa phương' },
                  { id: 3, label: 'Thông tin sản phẩm & chứng nhận OCOP' },
                  { id: 4, label: 'Màu sắc yêu thích của người bán' }
                ].map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white border border-slate-200 cursor-pointer hover:border-emerald-600"
                  >
                    <input
                      type="checkbox"
                      checked={honeyChecks.includes(item.id)}
                      onChange={() => toggleHoneyCheck(item.id)}
                      className="w-4 h-4 accent-emerald-800"
                    />
                    <span className="text-slate-800">{item.label}</span>
                  </label>
                ))}
              </div>
              <button
                type="button"
                onClick={handleCheckHoneyQuiz}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Kiểm tra kết quả
              </button>
              {honeyQuizResult === 'correct' && (
                <p className="text-xs font-bold text-emerald-800">
                  ✅ Chính xác! Con Ong khen bạn đã chọn đúng 3 thông tin cốt lõi: Chủ thể sản xuất, Nguồn gốc địa phương và Thông tin sản phẩm.
                </p>
              )}
              {honeyQuizResult === 'wrong' && (
                <p className="text-xs font-bold text-red-700">
                  ❌ Chưa đúng! Hãy chọn đủ 3 thông tin cốt lõi và loại bỏ "Màu sắc yêu thích của người bán".
                </p>
              )}
            </div>
          ) : (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-5 space-y-3">
              <p className="text-sm font-bold text-emerald-950">
                📝 Câu hỏi thực địa cùng {activePin.mascotName} ({activePin.name}): {activePin.fieldQuiz.question}
              </p>
              <div className="space-y-2 text-sm">
                {activePin.fieldQuiz.options.map((opt) => (
                  <label
                    key={opt.val}
                    className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white border border-slate-200 cursor-pointer hover:border-emerald-600"
                  >
                    <input
                      type="radio"
                      name={`quiz_${activePin.key}`}
                      value={opt.val}
                      checked={(selectedQuizOption[activePin.key] || '') === opt.val}
                      onChange={() => {
                        setSelectedQuizOption((prev) => ({ ...prev, [activePin.key]: opt.val }));
                        setQuizResultByPin((prev) => ({ ...prev, [activePin.key]: 'none' }));
                      }}
                      className="w-4 h-4 accent-emerald-800"
                    />
                    <span className="text-slate-800">{opt.label}</span>
                  </label>
                ))}
              </div>
              <button
                type="button"
                onClick={() => handleCheckFieldQuiz(activePin)}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Kiểm tra câu trả lời
              </button>
              {quizResultByPin[activePin.key] === 'correct' && (
                <p className="text-xs font-bold text-emerald-800">
                  ✅ {activePin.fieldQuiz.correctExplain}
                </p>
              )}
              {quizResultByPin[activePin.key] === 'wrong' && (
                <p className="text-xs font-bold text-red-700">
                  ❌ {activePin.fieldQuiz.wrongExplain}
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ĐIỀU HƯỚNG CHUYỂN TRẠM */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => onNavigateStation('nhan-dien', 'BACK_TO_NHAN_DIEN')}
          className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors"
        >
          &larr; Trạm 1: Nhận diện OCOP
        </button>
        <button
          type="button"
          onClick={() => onNavigateStation('kho-san-pham', 'NEXT_TO_KHO_SAN_PHAM')}
          className="px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors"
        >
          Tiếp tục sang Trạm 3: Kho 6 sản phẩm &rarr;
        </button>
      </div>
    </div>
  );
}
