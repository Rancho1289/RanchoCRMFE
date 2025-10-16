const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    getTodayNewsBriefing,
    getNewsByTimeSlot,
    getNewsByCategory,
    createNews,
    updateNews,
    deleteNews,
    generateNewsBriefing,
    createSampleNews,
    collectAndSaveNews
} = require('../controllers/News.controller');

// 모든 라우트에 인증 미들웨어 적용
router.use(auth);

// 오늘의 뉴스 브리핑 조회
router.get('/today', getTodayNewsBriefing);

// 특정 시간대 뉴스 조회
router.get('/time/:timeSlot', getNewsByTimeSlot);

// 카테고리별 뉴스 조회
router.get('/category/:category', getNewsByCategory);

// AI 뉴스 브리핑 생성
router.get('/briefing/:timeSlot', generateNewsBriefing);

// 테스트용 샘플 뉴스 생성
router.post('/sample', createSampleNews);

// 뉴스 수집 및 저장 (자동화용)
router.post('/collect', collectAndSaveNews);

// 관리자용 라우트 (레벨 5 이상만 접근 가능)
router.post('/', (req, res, next) => {
    if (req.user.level < 5) {
        return res.status(403).json({
            success: false,
            message: '관리자 권한이 필요합니다.'
        });
    }
    next();
}, createNews);

router.put('/:id', (req, res, next) => {
    if (req.user.level < 5) {
        return res.status(403).json({
            success: false,
            message: '관리자 권한이 필요합니다.'
        });
    }
    next();
}, updateNews);

router.delete('/:id', (req, res, next) => {
    if (req.user.level < 5) {
        return res.status(403).json({
            success: false,
            message: '관리자 권한이 필요합니다.'
        });
    }
    next();
}, deleteNews);

module.exports = router;
