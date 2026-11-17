import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatStudentCodeFromSequence,
  isAutoStudentCode,
  normalizeStudentCode,
  validateStudentCodeInput,
  validateEvidenceInput,
  calculateNextHP,
  getHPStatusLevel,
  evaluateHoneyMapChecklist,
  getFinalChallengeFeedback,
  calculateOcopStarRating,
  computeMapRoute,
  interpolateBezierPoint,
  validateProductImageFile,
  upsertProductPhotoCollection,
  removeProductPhotoFromCollection,
  getCollectionProgressSummary,
  recognizeOcopProductFromSignals,
  calculateTowerFloorPoints,
  getTowerTitle
} from './rules';

test('formatStudentCodeFromSequence and isAutoStudentCode generate and validate HS11-xxx codes', () => {
  assert.equal(formatStudentCodeFromSequence(1), 'HS11-001');
  assert.equal(formatStudentCodeFromSequence(2), 'HS11-002');
  assert.equal(formatStudentCodeFromSequence(45), 'HS11-045');
  assert.equal(formatStudentCodeFromSequence(120), 'HS11-120');
  assert.equal(isAutoStudentCode('HS11-001'), true);
  assert.equal(isAutoStudentCode('11A1-001'), false);
});

test('normalizeStudentCode trims and uppercases student code', () => {
  assert.equal(normalizeStudentCode('  hs11-001 '), 'HS11-001');
  assert.equal(normalizeStudentCode(''), '');
});

test('validateStudentCodeInput rejects empty or 1-char codes and accepts valid codes', () => {
  assert.equal(validateStudentCodeInput('   ').valid, false);
  assert.equal(validateStudentCodeInput('A').valid, false);
  assert.equal(validateStudentCodeInput('HS11-001').valid, true);
});

test('validateEvidenceInput checks required fields for digital investigation', () => {
  assert.equal(
    validateEvidenceInput({ title: '', type: 'Web', source: 'tayninh.gov.vn', desc: 'Chứng nhận' }).valid,
    false
  );
  assert.equal(
    validateEvidenceInput({ title: 'Quyết định OCOP', type: 'Web', source: '', desc: 'Chứng nhận' }).valid,
    false
  );
  assert.equal(
    validateEvidenceInput({ title: 'Quyết định OCOP', type: 'Web', source: 'tayninh.gov.vn', desc: '' }).valid,
    false
  );
  assert.equal(
    validateEvidenceInput({
      title: 'Quyết định OCOP 4 sao',
      type: 'Cổng thông tin chính thức',
      source: 'snnptnt.tayninh.gov.vn',
      desc: 'Xác thực cơ sở đạt chuẩn 4 sao'
    }).valid,
    true
  );
});

test('calculateNextHP and getHPStatusLevel manage STEM adventure HP accurately', () => {
  assert.equal(calculateNextHP(100, true), 100);
  assert.equal(calculateNextHP(100, false, 25), 75);
  assert.equal(calculateNextHP(25, false, 25), 0);
  assert.equal(calculateNextHP(0, false, 25), 0);

  assert.equal(getHPStatusLevel(100), 'nominal');
  assert.equal(getHPStatusLevel(75), 'nominal');
  assert.equal(getHPStatusLevel(50), 'warning');
  assert.equal(getHPStatusLevel(25), 'danger');
});

test('evaluateHoneyMapChecklist requires items 1, 2, 3 and excludes 4', () => {
  assert.equal(evaluateHoneyMapChecklist([1, 2, 3]), true);
  assert.equal(evaluateHoneyMapChecklist([1, 2, 3, 4]), false);
  assert.equal(evaluateHoneyMapChecklist([1, 2]), false);
});

test('getFinalChallengeFeedback categorizes scores into 3 learning tiers', () => {
  assert.equal(getFinalChallengeFeedback(9).tier, 'excellent');
  assert.equal(getFinalChallengeFeedback(6).tier, 'good');
  assert.equal(getFinalChallengeFeedback(3).tier, 'needs_review');
});

test('calculateOcopStarRating evaluates 100-point criteria into 1-5 OCOP stars accurately', () => {
  const star5 = calculateOcopStarRating(38, 23, 33); // 94 pts
  assert.equal(star5.totalScore, 94);
  assert.equal(star5.stars, 5);

  const star4 = calculateOcopStarRating(32, 20, 26); // 78 pts
  assert.equal(star4.totalScore, 78);
  assert.equal(star4.stars, 4);

  const star3 = calculateOcopStarRating(25, 15, 18); // 58 pts
  assert.equal(star3.totalScore, 58);
  assert.equal(star3.stars, 3);

  const star2 = calculateOcopStarRating(15, 10, 10); // 35 pts
  assert.equal(star2.totalScore, 35);
  assert.equal(star2.stars, 2);

  const star1 = calculateOcopStarRating(10, 5, 5); // 20 pts
  assert.equal(star1.totalScore, 20);
  assert.equal(star1.stars, 1);
});

test('computeMapRoute and interpolateBezierPoint generate valid curved map path and endpoints', () => {
  const from = { x: 20, y: 24 };
  const to = { x: 76, y: 66 };
  const route = computeMapRoute(from, to);

  assert.equal(route.svgPath.startsWith('M 20 24 Q '), true);
  assert.equal(route.svgPath.endsWith(' 76 66'), true);
  assert.equal(route.distanceKm > 0, true);

  const startPt = interpolateBezierPoint(route.from, route.controlPoint, route.to, 0);
  const endPt = interpolateBezierPoint(route.from, route.controlPoint, route.to, 1);
  assert.deepEqual(startPt, from);
  assert.deepEqual(endPt, to);
});

test('validateProductImageFile and photo collection helpers validate and manage product photos', () => {
  assert.equal(validateProductImageFile(null).valid, false);
  assert.equal(validateProductImageFile({ name: 'tai-lieu.pdf', type: 'application/pdf', size: 1024 }).valid, false);
  assert.equal(validateProductImageFile({ name: 'mat-ong.jpg', type: 'image/jpeg', size: 512000 }).valid, true);
  assert.equal(validateProductImageFile({ name: 'IMG_1024.HEIC', type: '', size: 1024000 }).valid, true);

  let collection = {};
  collection = upsertProductPhotoCollection(collection, {
    productKey: 'honey',
    dataUrl: 'data:image/jpeg;base64,abc',
    fileName: 'mat-ong.jpg',
    capturedAt: '10:30 11/11/2026',
    source: 'upload'
  });

  const summary1 = getCollectionProgressSummary(collection, 6);
  assert.equal(summary1.collectedCount, 1);
  assert.equal(summary1.percentage, 17);
  assert.equal(summary1.isComplete, false);

  collection = removeProductPhotoFromCollection(collection, 'honey');
  const summary0 = getCollectionProgressSummary(collection, 6);
  assert.equal(summary0.collectedCount, 0);
});

test('recognizeOcopProductFromSignals identifies OCOP product and category from filename and visual color signals', () => {
  const ricePaper = recognizeOcopProductFromSignals('mascot-banh-trang.png');
  assert.equal(ricePaper.productKey, 'ricepaper');
  assert.equal(ricePaper.productName, 'BÁNH TRÁNG TÂY NINH');
  assert.equal(ricePaper.category, 'Thực phẩm');

  const incense = recognizeOcopProductFromSignals('nhang-van-linh-huong.jpg');
  assert.equal(incense.productKey, 'incense');
  assert.equal(incense.category, 'Thủ công mỹ nghệ & Lưu niệm');

  // Test phone camera generic filename with green color signals -> Mãng cầu Bà Đen
  const greenPhoto = recognizeOcopProductFromSignals('IMG_8821.JPG', { avgR: 110, avgG: 168, avgB: 95 });
  assert.equal(greenPhoto.productKey, 'custardapple');
  assert.equal(greenPhoto.productName, 'MÃNG CẦU BÀ ĐEN');

  // Test phone camera generic filename with orange-red color signals -> Muối tôm Thắng Lợi
  const orangeRedPhoto = recognizeOcopProductFromSignals('IMG_8822.JPG', { avgR: 210, avgG: 95, avgB: 60 });
  assert.equal(orangeRedPhoto.productKey, 'shrimpsalt');
  assert.equal(orangeRedPhoto.productName, 'MUỐI TÔM THẮNG LỢI');
});

test('calculateTowerFloorPoints and getTowerTitle evaluate tower heights and titles accurately', () => {
  assert.equal(calculateTowerFloorPoints(2, 1), 100);
  assert.equal(calculateTowerFloorPoints(6, 1), 200);
  assert.equal(calculateTowerFloorPoints(6, 3), 400); // Speed build x2
  assert.equal(calculateTowerFloorPoints(10, 1), 350);
  assert.equal(calculateTowerFloorPoints(16, 1), 500);

  assert.equal(getTowerTitle(3).title, 'Thợ Tập Sự Xây Tháp OCOP');
  assert.equal(getTowerTitle(7).title, 'Kiến Trúc Sư Tri Thức Tây Ninh');
  assert.equal(getTowerTitle(12).title, 'Bậc Thầy Xây Tháp OCOP');
  assert.equal(getTowerTitle(16).title, 'Huyền Thoại Tháp Tri Thức Tây Ninh');
});




