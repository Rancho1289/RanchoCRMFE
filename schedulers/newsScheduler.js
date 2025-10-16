const cron = require('node-cron');
const News = require('../models/News.model');
const newsScraperService = require('../services/newsScraperService');

class NewsScheduler {
    constructor() {
        this.isRunning = false;
    }

    // 뉴스 스케줄러 시작
    start() {
        if (this.isRunning) {
            console.log('뉴스 스케줄러가 이미 실행 중입니다.');
            return;
        }

        console.log('뉴스 스케줄러를 시작합니다...');

        // 매일 06:00에 실행
        cron.schedule('0 6 * * *', () => {
            console.log('06:00 뉴스 수집 시작...');
            this.collectNews();
        }, {
            timezone: 'Asia/Seoul'
        });

        // 매일 12:00에 실행
        cron.schedule('0 12 * * *', () => {
            console.log('12:00 뉴스 수집 시작...');
            this.collectNews();
        }, {
            timezone: 'Asia/Seoul'
        });

        // 매일 18:00에 실행
        cron.schedule('0 18 * * *', () => {
            console.log('18:00 뉴스 수집 시작...');
            this.collectNews();
        }, {
            timezone: 'Asia/Seoul'
        });

        // 매일 24:00에 실행 (자정)
        cron.schedule('0 0 * * *', () => {
            console.log('24:00 뉴스 수집 시작...');
            this.collectNews();
        }, {
            timezone: 'Asia/Seoul'
        });

        this.isRunning = true;
        console.log('뉴스 스케줄러가 성공적으로 시작되었습니다.');
    }

    // 뉴스 수집
    async collectNews() {
        try {
            console.log('뉴스 수집 시작...');
            
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
            
            console.log(`${savedNews.length}개 뉴스 수집 및 저장 완료`);

        } catch (error) {
            console.error('뉴스 수집 오류:', error);
        }
    }

    // 수동으로 뉴스 수집
    async collectManualNews() {
        try {
            console.log('수동 뉴스 수집 중...');
            await this.collectNews();
            return { success: true, message: '뉴스 수집이 완료되었습니다.' };
        } catch (error) {
            console.error('수동 뉴스 수집 오류:', error);
            return { success: false, message: error.message };
        }
    }

    // 스케줄러 중지
    stop() {
        if (!this.isRunning) {
            console.log('뉴스 스케줄러가 실행되지 않았습니다.');
            return;
        }

        cron.destroy();
        this.isRunning = false;
        console.log('뉴스 스케줄러가 중지되었습니다.');
    }

    // 스케줄러 상태 확인
    getStatus() {
        return {
            isRunning: this.isRunning,
            nextRuns: [
                { time: '06:00', description: '아침 뉴스 수집' },
                { time: '12:00', description: '점심 뉴스 수집' },
                { time: '18:00', description: '저녁 뉴스 수집' },
                { time: '24:00', description: '밤 뉴스 수집' }
            ]
        };
    }
}

module.exports = new NewsScheduler();
