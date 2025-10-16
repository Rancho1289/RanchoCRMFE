const Schedule = require('../models/Schedule.model');
const Customer = require('../models/Customer.model');
const Property = require('../models/Property.model');
const geminiService = require('../services/geminiService');

// 금주 업무리스트 브리핑 생성
exports.generateWeeklyBriefing = async (req, res) => {
    try {
        const user = req.user;
        
        // 이번 주 시작일과 종료일 계산
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // 일요일
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // 토요일
        endOfWeek.setHours(23, 59, 59, 999);

        console.log('=== 금주 브리핑 생성 ===');
        console.log('사용자:', user.name);
        console.log('조회 기간:', startOfWeek.toISOString(), '~', endOfWeek.toISOString());

        // 이번 주 일정 조회
        let query = {
            date: {
                $gte: startOfWeek,
                $lte: endOfWeek
            }
        };

        // 사용자 권한에 따른 필터링
        if (user.level < 5) {
            query.publisher = user._id;
        } else {
            query.byCompanyNumber = user.businessNumber;
        }

        const schedules = await Schedule.find(query)
            .populate('publisher', 'name email businessNumber level phone')
            .populate('relatedCustomers', 'name phone email')
            .populate('relatedProperties', 'title address')
            .populate('relatedContracts', 'contractNumber type status')
            .sort({ date: 1, time: 1 });

        console.log('조회된 일정 수:', schedules.length);

        if (schedules.length === 0) {
            return res.json({
                success: true,
                data: {
                    briefing: "이번 주에는 등록된 일정이 없습니다. 새로운 일정을 추가하거나 다른 주의 일정을 확인해보세요.",
                    schedules: [],
                    analysis: "일정이 없어 분석할 데이터가 부족합니다."
                }
            });
        }

        // GEMINI API를 사용하여 브리핑 생성
        const briefing = await geminiService.generateWeeklyBriefing(schedules, user.name);
        
        // 일정 분석도 함께 생성
        const analysis = await geminiService.generateScheduleAnalysis(schedules);

        res.json({
            success: true,
            data: {
                briefing,
                analysis,
                schedules,
                weekRange: {
                    start: startOfWeek,
                    end: endOfWeek
                }
            }
        });

    } catch (error) {
        console.error('금주 브리핑 생성 오류:', error);
        res.status(500).json({
            success: false,
            message: '브리핑 생성 중 오류가 발생했습니다.',
            error: error.message
        });
    }
};

// 특정 일정에 대한 만남 메시지 추천
exports.generateMeetingMessage = async (req, res) => {
    try {
        const { scheduleId } = req.params;
        const user = req.user;

        // 일정 조회
        const schedule = await Schedule.findById(scheduleId)
            .populate('publisher', 'name email businessNumber level phone')
            .populate('relatedCustomers', 'name phone email')
            .populate('relatedProperties', 'title address')
            .populate('relatedContracts', 'contractNumber type status');

        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: '일정을 찾을 수 없습니다.'
            });
        }

        // 권한 확인
        if (user.level < 5) {
            if (schedule.publisher._id.toString() !== user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: '이 일정에 접근할 권한이 없습니다.'
                });
            }
        } else {
            if (schedule.byCompanyNumber !== user.businessNumber) {
                return res.status(403).json({
                    success: false,
                    message: '이 일정에 접근할 권한이 없습니다.'
                });
            }
        }

        // 관련 고객이 있는 경우 첫 번째 고객 정보 사용
        const customer = schedule.relatedCustomers && schedule.relatedCustomers.length > 0 
            ? schedule.relatedCustomers[0] 
            : null;

        if (!customer) {
            return res.status(400).json({
                success: false,
                message: '이 일정에는 관련 고객 정보가 없습니다.'
            });
        }

        // GEMINI API를 사용하여 메시지 추천 생성
        const messageRecommendation = await geminiService.generateMeetingMessage(schedule, customer);

        res.json({
            success: true,
            data: {
                schedule,
                customer,
                messageRecommendation
            }
        });

    } catch (error) {
        console.error('만남 메시지 추천 생성 오류:', error);
        res.status(500).json({
            success: false,
            message: '메시지 추천 생성 중 오류가 발생했습니다.',
            error: error.message
        });
    }
};

// 일정 분석 및 조언 생성
exports.generateScheduleAnalysis = async (req, res) => {
    try {
        const user = req.user;
        const { startDate, endDate } = req.query;

        let query = {};

        // 날짜 범위 설정
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        } else {
            // 기본적으로 이번 달 일정 조회
            const today = new Date();
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            
            query.date = {
                $gte: startOfMonth,
                $lte: endOfMonth
            };
        }

        // 사용자 권한에 따른 필터링
        if (user.level < 5) {
            query.publisher = user._id;
        } else {
            query.byCompanyNumber = user.businessNumber;
        }

        const schedules = await Schedule.find(query)
            .populate('publisher', 'name email businessNumber level phone')
            .populate('relatedCustomers', 'name phone email')
            .populate('relatedProperties', 'title address')
            .populate('relatedContracts', 'contractNumber type status')
            .sort({ date: 1, time: 1 });

        if (schedules.length === 0) {
            return res.json({
                success: true,
                data: {
                    analysis: "분석할 일정이 없습니다. 새로운 일정을 추가해보세요.",
                    schedules: []
                }
            });
        }

        // GEMINI API를 사용하여 분석 생성
        const analysis = await geminiService.generateScheduleAnalysis(schedules);

        res.json({
            success: true,
            data: {
                analysis,
                schedules,
                period: {
                    start: query.date.$gte,
                    end: query.date.$lte
                }
            }
        });

    } catch (error) {
        console.error('일정 분석 생성 오류:', error);
        res.status(500).json({
            success: false,
            message: '일정 분석 생성 중 오류가 발생했습니다.',
            error: error.message
        });
    }
};

// 오늘의 일정 브리핑 생성
exports.generateDailyBriefing = async (req, res) => {
    try {
        const user = req.user;
        const { date } = req.query;

        // 날짜 설정 (기본값: 오늘)
        const targetDate = date ? new Date(date) : new Date();
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        console.log('=== 일일 브리핑 생성 ===');
        console.log('사용자:', user.name);
        console.log('조회 날짜:', targetDate.toISOString());

        // 해당 날짜의 일정 조회
        let query = {
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        };

        // 사용자 권한에 따른 필터링
        if (user.level < 5) {
            query.publisher = user._id;
        } else {
            query.byCompanyNumber = user.businessNumber;
        }

        const schedules = await Schedule.find(query)
            .populate('publisher', 'name email businessNumber level phone')
            .populate('relatedCustomers', 'name phone email')
            .populate('relatedProperties', 'title address')
            .populate('relatedContracts', 'contractNumber type status')
            .sort({ time: 1 });

        console.log('조회된 일정 수:', schedules.length);

        if (schedules.length === 0) {
            return res.json({
                success: true,
                data: {
                    briefing: `${targetDate.toLocaleDateString('ko-KR')}에는 등록된 일정이 없습니다.`,
                    schedules: [],
                    date: targetDate
                }
            });
        }

        // 일일 브리핑용 프롬프트 (더 상세하게 수정)
        const prompt = `
당신은 15년 경력의 부동산 전문가입니다. 사용자 "${user.name}"의 ${targetDate.toLocaleDateString('ko-KR')} 일정을 분석하여 실무에 바로 적용할 수 있는 상세한 브리핑을 작성하세요. 개인적인 코멘트도 부탁드리며 3000자 이내로 부탁드립니다.

일정 데이터:
${JSON.stringify(schedules, null, 2)}

다음 내용을 포함하여 상세하고 실용적인 브리핑을 작성해주세요:

## 📅 ${targetDate.toLocaleDateString('ko-KR')} 일일 업무 브리핑

### 🌅 오늘의 핵심 목표
- 가장 중요한 업무와 그 이유
- 각 고객별 핵심 목표와 달성 전략

### ⏰ 시간별 상세 일정 가이드
각 일정에 대해 다음을 포함하여 상세히 분석:
- **시간과 장소**: 정확한 시간과 위치 정보
- **고객 프로파일링**: 고객의 성향, 구매력, 관심사 분석
- **맞춤형 접근법**: 이 고객에게 효과적인 커뮤니케이션 방식
- **추천 멘트**: 상황별로 사용할 구체적인 멘트와 화법
- **객관 준비사항**: 미리 준비해야 할 자료와 정보
- **예상 질문과 답변**: 고객이 물어볼 가능성이 높은 질문들
- **딜 클로징 팁**: 계약으로 이어질 수 있는 구체적인 방법

### 💡 오늘의 성공 노하우
- 고객별 맞춤 전략
- 매물별 어필 포인트
- 경쟁사 대비 우위
- 고객 만족도 향상 방법

### ⚠️ 주의사항
- 특별히 주의해야 할 점들
- 법적 주의사항
- 고객별 특이사항

3000자 이내로 작성하고, 실제 현장에서 바로 사용할 수 있는 구체적인 조언과 멘트를 포함해주세요.
`;

        const briefing = await geminiService.generateText(prompt, {
            temperature: 0.8,
            maxOutputTokens: 4000
        });

        res.json({
            success: true,
            data: {
                briefing,
                schedules,
                date: targetDate
            }
        });

    } catch (error) {
        console.error('일일 브리핑 생성 오류:', error);
        res.status(500).json({
            success: false,
            message: '일일 브리핑 생성 중 오류가 발생했습니다.',
            error: error.message
        });
    }
};

// 고객별 맞춤형 상담 가이드 생성
exports.generateCustomerConsultationGuide = async (req, res) => {
    try {
        const { customerId } = req.params;
        const user = req.user;

        // 고객 정보 조회
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: '고객을 찾을 수 없습니다.'
            });
        }

        // 권한 확인
        if (user.level < 5) {
            if (customer.publisher.toString() !== user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: '이 고객에 접근할 권한이 없습니다.'
                });
            }
        } else {
            if (customer.byCompanyNumber !== user.businessNumber) {
                return res.status(403).json({
                    success: false,
                    message: '이 고객에 접근할 권한이 없습니다.'
                });
            }
        }

        // 고객과 관련된 일정 조회
        const schedules = await Schedule.find({ relatedCustomers: customerId })
            .populate('relatedProperties', 'title address price')
            .populate('relatedContracts', 'contractNumber type status')
            .sort({ date: -1 })
            .limit(10);

        // 고객과 관련된 매물 조회
        const properties = await Property.find({ relatedCustomers: customerId })
            .sort({ createdAt: -1 })
            .limit(5);

        // GEMINI API를 사용하여 맞춤형 상담 가이드 생성
        const consultationGuide = await geminiService.generateCustomerConsultationGuide(customer, schedules, properties);

        res.json({
            success: true,
            data: {
                customer,
                consultationGuide,
                recentSchedules: schedules,
                relatedProperties: properties
            }
        });

    } catch (error) {
        console.error('고객별 상담 가이드 생성 오류:', error);
        res.status(500).json({
            success: false,
            message: '상담 가이드 생성 중 오류가 발생했습니다.',
            error: error.message
        });
    }
};

// 매물별 추천 전략 생성
exports.generatePropertyRecommendationStrategy = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const user = req.user;

        // 매물 정보 조회
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({
                success: false,
                message: '매물을 찾을 수 없습니다.'
            });
        }

        // 권한 확인
        if (user.level < 5) {
            if (property.publisher.toString() !== user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: '이 매물에 접근할 권한이 없습니다.'
                });
            }
        } else {
            if (property.byCompanyNumber !== user.businessNumber) {
                return res.status(403).json({
                    success: false,
                    message: '이 매물에 접근할 권한이 없습니다.'
                });
            }
        }

        // 매물과 관련된 고객 조회
        const customers = await Customer.find({ relatedProperties: propertyId })
            .sort({ createdAt: -1 })
            .limit(10);

        // 매물과 관련된 일정 조회
        const schedules = await Schedule.find({ relatedProperties: propertyId })
            .populate('relatedCustomers', 'name phone email')
            .sort({ date: -1 })
            .limit(10);

        // GEMINI API를 사용하여 매물 추천 전략 생성
        const recommendationStrategy = await geminiService.generatePropertyRecommendationStrategy(property, customers, schedules);

        res.json({
            success: true,
            data: {
                property,
                recommendationStrategy,
                interestedCustomers: customers,
                relatedSchedules: schedules
            }
        });

    } catch (error) {
        console.error('매물 추천 전략 생성 오류:', error);
        res.status(500).json({
            success: false,
            message: '추천 전략 생성 중 오류가 발생했습니다.',
            error: error.message
        });
    }
};
