const News = require('../models/News.model');
const geminiService = require('../services/geminiService');
const newsScraperService = require('../services/newsScraperService');

// 오늘의 뉴스 브리핑 조회 (통합)
exports.getTodayNewsBriefing = async (req, res) => {
    try {
        const { mainTopic } = req.query;
        
        let query = { isActive: true };
        
        // 주제 필터
        if (mainTopic && ['부동산', '금리', '한국경제'].includes(mainTopic)) {
            query.mainTopic = mainTopic;
        }
        
        // 오늘 날짜 범위 설정
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        query.createdAt = { $gte: today, $lt: tomorrow };
        
        const news = await News.find(query)
            .sort({ publishedAt: -1 })
            .limit(15);
        
        res.json({
            success: true,
            data: {
                news,
                totalCount: news.length,
                lastUpdated: news.length > 0 ? news[0].createdAt : null
            }
        });
        
    } catch (error) {
        console.error('뉴스 브리핑 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '뉴스 브리핑 조회 중 오류가 발생했습니다.',
            error: error.message
        });
    }
};

// 특정 시간대 뉴스 조회
exports.getNewsByTimeSlot = async (req, res) => {
    try {
        const { timeSlot } = req.params;
        
        if (!['06:00', '12:00', '18:00', '24:00'].includes(timeSlot)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 시간대입니다.'
            });
        }
        
        const news = await News.getLatestNewsByTime(timeSlot);
        
        res.json({
            success: true,
            data: {
                news,
                timeSlot,
                count: news.length
            }
        });
        
    } catch (error) {
        console.error('시간대별 뉴스 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '뉴스 조회 중 오류가 발생했습니다.',
            error: error.message
        });
    }
};

// 카테고리별 뉴스 조회
exports.getNewsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        
        const news = await News.getNewsByCategory(category);
        
        res.json({
            success: true,
            data: {
                news,
                category,
                count: news.length
            }
        });
        
    } catch (error) {
        console.error('카테고리별 뉴스 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '뉴스 조회 중 오류가 발생했습니다.',
            error: error.message
        });
    }
};

// 뉴스 생성 (관리자용)
exports.createNews = async (req, res) => {
    try {
        const { title, summary, category, source, publishedAt, briefingTime, keywords, impact } = req.body;
        
        const news = new News({
            title,
            summary,
            category: category || '부동산',
            source,
            publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
            briefingTime: briefingTime || '12:00',
            keywords: keywords || [],
            impact: impact || '보통'
        });
        
        await news.save();
        
        res.status(201).json({
            success: true,
            data: news,
            message: '뉴스가 성공적으로 생성되었습니다.'
        });
        
    } catch (error) {
        console.error('뉴스 생성 오류:', error);
        res.status(500).json({
            success: false,
            message: '뉴스 생성 중 오류가 발생했습니다.',
            error: error.message
        });
    }
};

// 뉴스 업데이트 (관리자용)
exports.updateNews = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const news = await News.findByIdAndUpdate(
            id,
            { ...updateData, updatedAt: new Date() },
            { new: true, runValidators: true }
        );
        
        if (!news) {
            return res.status(404).json({
                success: false,
                message: '뉴스를 찾을 수 없습니다.'
            });
        }
        
        res.json({
            success: true,
            data: news,
            message: '뉴스가 성공적으로 업데이트되었습니다.'
        });
        
    } catch (error) {
        console.error('뉴스 업데이트 오류:', error);
        res.status(500).json({
            success: false,
            message: '뉴스 업데이트 중 오류가 발생했습니다.',
            error: error.message
        });
    }
};

// 뉴스 삭제 (관리자용)
exports.deleteNews = async (req, res) => {
    try {
        const { id } = req.params;
        
        const news = await News.findByIdAndUpdate(
            id,
            { isActive: false, updatedAt: new Date() },
            { new: true }
        );
        
        if (!news) {
            return res.status(404).json({
                success: false,
                message: '뉴스를 찾을 수 없습니다.'
            });
        }
        
        res.json({
            success: true,
            message: '뉴스가 성공적으로 삭제되었습니다.'
        });
        
    } catch (error) {
        console.error('뉴스 삭제 오류:', error);
        res.status(500).json({
            success: false,
            message: '뉴스 삭제 중 오류가 발생했습니다.',
            error: error.message
        });
    }
};

// AI 뉴스 브리핑 생성
exports.generateNewsBriefing = async (req, res) => {
    try {
        const { timeSlot } = req.params;
        
        if (!['06:00', '12:00', '18:00', '24:00'].includes(timeSlot)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 시간대입니다.'
            });
        }
        
        // 해당 시간대의 기존 뉴스 조회
        const existingNews = await News.getLatestNewsByTime(timeSlot);
        
        // AI를 사용하여 뉴스 브리핑 생성
        const briefing = await geminiService.generateNewsBriefing(timeSlot, existingNews);

        // 생성된 브리핑을 뉴스로 저장
        const newsBriefing = new News({
            title: `${timeSlot} 부동산 뉴스 브리핑`,
            summary: briefing,
            category: '부동산',
            source: 'AI 브리핑 시스템',
            publishedAt: new Date(),
            briefingTime: timeSlot,
            keywords: ['브리핑', '시장분석', '부동산'],
            impact: '높음'
        });

        await newsBriefing.save();
        
        res.json({
            success: true,
            data: {
                briefing,
                timeSlot,
                newsCount: existingNews.length,
                generatedAt: new Date(),
                savedNews: newsBriefing
            }
        });
        
    } catch (error) {
        console.error('AI 뉴스 브리핑 생성 오류:', error);
        res.status(500).json({
            success: false,
            message: '뉴스 브리핑 생성 중 오류가 발생했습니다.',
            error: error.message
        });
    }
};

// 테스트용 샘플 뉴스 생성
exports.createSampleNews = async (req, res) => {
    try {
        const sampleNews = [
            {
                title: "부동산 시장 안정화 조짐, 전세가 하락세 둔화",
                summary: "최근 부동산 시장에서 전세가 하락세가 둔화되고 있는 것으로 나타났습니다. 주요 도시의 전세가 상승률이 전월 대비 감소했으며, 이는 시장 안정화의 신호로 해석됩니다.",
                category: "부동산",
                source: "부동산 뉴스",
                briefingTime: "06:00",
                keywords: ["전세가", "시장안정화", "하락세"],
                impact: "높음"
            },
            {
                title: "정부, 부동산 규제 완화 검토 중",
                summary: "정부가 부동산 시장 활성화를 위한 규제 완화 방안을 검토하고 있습니다. 특히 청년층의 주거 안정을 위한 정책이 주목받고 있습니다.",
                category: "정책",
                source: "정부 발표",
                briefingTime: "12:00",
                keywords: ["규제완화", "청년주거", "정책"],
                impact: "높음"
            },
            {
                title: "신축 아파트 분양가 상한제 효과 분석",
                summary: "신축 아파트 분양가 상한제 도입 이후 시장 변화를 분석한 결과, 일부 지역에서 분양가 상승세가 둔화된 것으로 나타났습니다.",
                category: "부동산",
                source: "시장 분석",
                briefingTime: "18:00",
                keywords: ["분양가상한제", "신축아파트", "시장분석"],
                impact: "보통"
            },
            {
                title: "전국 아파트 매매가격 지수 소폭 상승",
                summary: "전국 아파트 매매가격 지수가 전주 대비 소폭 상승했습니다. 수도권과 지방의 상승률 차이가 나타나고 있습니다.",
                category: "시장동향",
                source: "한국부동산원",
                briefingTime: "24:00",
                keywords: ["매매가격", "아파트", "지수"],
                impact: "보통"
            }
        ];

        const createdNews = [];
        for (const newsData of sampleNews) {
            const news = new News(newsData);
            await news.save();
            createdNews.push(news);
        }

        res.json({
            success: true,
            data: createdNews,
            message: '샘플 뉴스가 성공적으로 생성되었습니다.'
        });

    } catch (error) {
        console.error('샘플 뉴스 생성 오류:', error);
        res.status(500).json({
            success: false,
            message: '샘플 뉴스 생성 중 오류가 발생했습니다.',
            error: error.message
        });
    }
};

// 뉴스 수집 및 저장 (자동화용)
exports.collectAndSaveNews = async (req, res) => {
    try {
        console.log('뉴스 수집 및 저장 시작...');
        
        // 1. 뉴스 수집 및 변환
        const transformedNews = await newsScraperService.collectAndTransformNews();
        
        // 2. 기존 뉴스 삭제 (오늘 것만)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        await News.deleteMany({ 
            createdAt: { $gte: today },
            isActive: true 
        });
        
        // 3. 새 뉴스 저장
        const savedNews = [];
        for (const newsData of transformedNews) {
            const news = new News({
                title: newsData.title,
                summary: newsData.summary,
                mainTopic: newsData.mainTopic,
                subTopic: newsData.subTopic,
                link: newsData.link,
                source: newsData.source,
                publishedAt: newsData.publishedAt,
                originalTitle: newsData.originalTitle,
                keywords: newsData.keywords || [],
                impact: '보통'
            });
            
            await news.save();
            savedNews.push(news);
        }
        
        console.log(`${savedNews.length}개 뉴스 저장 완료`);
        
        res.json({
            success: true,
            data: {
                news: savedNews,
                count: savedNews.length,
                collectedAt: new Date()
            },
            message: `${savedNews.length}개 뉴스가 성공적으로 수집 및 저장되었습니다.`
        });
        
    } catch (error) {
        console.error('뉴스 수집 및 저장 오류:', error);
        res.status(500).json({
            success: false,
            message: '뉴스 수집 및 저장 중 오류가 발생했습니다.',
            error: error.message
        });
    }
};