const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    generateWeeklyBriefing,
    generateDailyBriefing,
    generateMeetingMessage,
    generateScheduleAnalysis,
    generateCustomerConsultationGuide,
    generatePropertyRecommendationStrategy
} = require('../controllers/ScheduleBriefing.controller');

// 모든 라우트에 인증 미들웨어 적용
router.use(auth);

// 금주 업무리스트 브리핑 생성
router.get('/weekly-briefing', generateWeeklyBriefing);

// 오늘의 일정 브리핑 생성
router.get('/daily-briefing', generateDailyBriefing);

// 특정 일정에 대한 만남 메시지 추천
router.get('/meeting-message/:scheduleId', generateMeetingMessage);

// 일정 분석 및 조언 생성
router.get('/analysis', generateScheduleAnalysis);

// 고객별 맞춤형 상담 가이드 생성
router.get('/customer-guide/:customerId', generateCustomerConsultationGuide);

// 매물별 추천 전략 생성
router.get('/property-strategy/:propertyId', generatePropertyRecommendationStrategy);

module.exports = router;
