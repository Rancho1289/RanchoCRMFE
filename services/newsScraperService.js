const geminiService = require('./geminiService');

class NewsScraperService {
    constructor() {
        // 스크랩 관련 설정 제거, GEMINI AI만 사용
    }

    // 전체 뉴스 수집 및 변환 프로세스
    async collectAndTransformNews() {
        try {
            console.log('GEMINI AI를 사용한 뉴스 생성 시작...');
            
            // GEMINI AI를 사용하여 뉴스 생성
            const generatedNews = await this.generateNewsWithAI();
            
            console.log(`${generatedNews.length}개 뉴스 생성 완료`);
            return generatedNews;

        } catch (error) {
            console.error('뉴스 생성 프로세스 오류:', error);
            throw error;
        }
    }

    // GEMINI AI를 사용하여 뉴스 생성
    async generateNewsWithAI() {
        try {
            console.log('GEMINI AI 뉴스 생성 시작...');
            
            const prompt = `
당신은 부동산 전문가이자 뉴스 기자입니다. 오늘 날짜의 부동산, 금리, 한국경제 관련 뉴스를 각각 6개씩 총 18개 생성해주세요.

다음 형식으로 JSON 응답해주세요:

{
  "news": [
    {
      "title": "뉴스 제목",
      "summary": "뉴스 요약 내용 (100-150자)",
      "mainTopic": "부동산|금리|한국경제",
      "subTopic": "구체적인 부주제",
      "link": "실제 기사 페이지로 이동할 수 있는 구체적인 URL",
      "source": "네이버 부동산|한국경제 부동산|매일경제",
      "originalTitle": "원본 제목"
    }
  ]
}

요구사항:
1. 부동산 관련 뉴스 6개 (전세가, 매매가, 정책, 투자, 지역별 동향 등)
2. 금리 관련 뉴스 6개 (기준금리, 대출금리, 투자 영향, 정책 등)
3. 한국경제 관련 뉴스 6개 (한국은행 정책, 경제 전망, 금융안정 등)
4. 각 뉴스마다 실제 기사 사이트로 들어갈 수 있는 구체적인 링크 생성
   - 네이버 부동산: https://land.naver.com/news/read.naver?articleId=실제기사번호
   - 한국경제 부동산: https://land.hankyung.com/news/view/실제기사번호
   - 매일경제: https://www.mk.co.kr/news/realestate/view/실제기사번호
5. 링크는 실제로 해당 사이트의 기사 페이지로 이동할 수 있어야 함
6. 실제 뉴스처럼 현실적이고 구체적인 내용으로 작성
7. 저작권에 걸리지 않도록 창작된 내용으로 작성
8. 각 링크마다 고유한 기사 번호를 사용하여 중복되지 않게 함

JSON 형식으로만 응답하고, 다른 설명은 포함하지 마세요.
`;

            const response = await geminiService.generateText(prompt, {
                temperature: 0.8,
                maxOutputTokens: 4000
            });

            // JSON 파싱 시도
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                const news = parsed.news || [];
                
                // 각 뉴스에 추가 정보 추가
                const processedNews = news.map((item, index) => ({
                    ...item,
                    publishedAt: new Date(),
                    keywords: [item.mainTopic, item.subTopic],
                    impact: '보통'
                }));
                
                console.log(`GEMINI AI로 ${processedNews.length}개 뉴스 생성 완료`);
                return processedNews;
            } else {
                throw new Error('JSON 파싱 실패');
            }

        } catch (error) {
            console.error('GEMINI AI 뉴스 생성 오류:', error);
            
            // AI 생성 실패 시 기본 샘플 데이터 사용
            console.log('AI 생성 실패, 기본 샘플 데이터 사용');
            return this.getDefaultSampleNews();
        }
    }

    // 기본 샘플 뉴스 데이터
    getDefaultSampleNews() {
        return [
            // 부동산 관련 뉴스 6개
            {
                title: "부동산 시장 안정화 조짐, 전세가 하락세 둔화",
                summary: "최근 부동산 시장에서 전세가 하락세가 둔화되고 있는 것으로 나타났습니다. 주요 도시의 전세가 상승률이 전월 대비 감소했으며, 이는 시장 안정화의 신호로 해석됩니다.",
                mainTopic: "부동산",
                subTopic: "전세가 동향",
                link: "https://land.naver.com/news/read.naver?articleId=20250116001",
                source: "네이버 부동산",
                publishedAt: new Date(),
                originalTitle: "부동산 시장 안정화 조짐, 전세가 하락세 둔화",
                keywords: ["부동산", "전세가 동향"],
                impact: "보통"
            },
            {
                title: "정부, 부동산 규제 완화 검토 중",
                summary: "정부가 부동산 시장 활성화를 위한 규제 완화 방안을 검토하고 있습니다. 특히 청년층의 주거 안정을 위한 정책이 주목받고 있습니다.",
                mainTopic: "부동산",
                subTopic: "정책 변화",
                link: "https://land.hankyung.com/news/view/20250116002",
                source: "한국경제 부동산",
                publishedAt: new Date(),
                originalTitle: "정부, 부동산 규제 완화 검토 중",
                keywords: ["부동산", "정책 변화"],
                impact: "보통"
            },
            {
                title: "신축 아파트 분양가 상한제 효과 분석",
                summary: "신축 아파트 분양가 상한제 도입 이후 시장 변화를 분석한 결과, 일부 지역에서 분양가 상승세가 둔화된 것으로 나타났습니다.",
                mainTopic: "부동산",
                subTopic: "분양가 정책",
                link: "https://www.mk.co.kr/news/realestate/view/20250116003",
                source: "매일경제",
                publishedAt: new Date(),
                originalTitle: "신축 아파트 분양가 상한제 효과 분석",
                keywords: ["부동산", "분양가 정책"],
                impact: "보통"
            },
            {
                title: "전국 아파트 매매가격 지수 소폭 상승",
                summary: "전국 아파트 매매가격 지수가 전주 대비 소폭 상승했습니다. 수도권과 지방의 상승률 차이가 나타나고 있습니다.",
                mainTopic: "부동산",
                subTopic: "매매가 동향",
                link: "https://land.naver.com/news/read.naver?articleId=20250116004",
                source: "네이버 부동산",
                publishedAt: new Date(),
                originalTitle: "전국 아파트 매매가격 지수 소폭 상승",
                keywords: ["부동산", "매매가 동향"],
                impact: "보통"
            },
            {
                title: "부동산 투자 수요 증가세",
                summary: "부동산 투자 수요가 증가세를 보이고 있습니다. 특히 상업용 부동산에 대한 관심이 높아지고 있습니다.",
                mainTopic: "부동산",
                subTopic: "투자 동향",
                link: "https://land.hankyung.com/news/view/20250116005",
                source: "한국경제 부동산",
                publishedAt: new Date(),
                originalTitle: "부동산 투자 수요 증가세",
                keywords: ["부동산", "투자 동향"],
                impact: "보통"
            },
            {
                title: "서울 강남 아파트 가격 상승세 지속",
                summary: "서울 강남권 아파트 가격이 상승세를 지속하고 있습니다. 고급 아파트에 대한 수요가 증가하고 있어 가격 상승 요인으로 작용하고 있습니다.",
                mainTopic: "부동산",
                subTopic: "지역별 동향",
                link: "https://www.mk.co.kr/news/realestate/view/20250116006",
                source: "매일경제",
                publishedAt: new Date(),
                originalTitle: "서울 강남 아파트 가격 상승세 지속",
                keywords: ["부동산", "지역별 동향"],
                impact: "보통"
            },
            
            // 금리 관련 뉴스 6개
            {
                title: "금리 상승에 따른 부동산 시장 영향 분석",
                summary: "금리 상승이 부동산 시장에 미치는 영향을 분석한 결과, 일부 지역에서 매매가 하락세가 나타나고 있습니다.",
                mainTopic: "금리",
                subTopic: "부동산 영향",
                link: "https://land.naver.com/news/read.naver?articleId=20250116007",
                source: "네이버 부동산",
                publishedAt: new Date(),
                originalTitle: "금리 상승에 따른 부동산 시장 영향 분석",
                keywords: ["금리", "부동산 영향"],
                impact: "보통"
            },
            {
                title: "금리 변동성 확대 전망",
                summary: "전문가들은 향후 금리 변동성이 확대될 것으로 전망하고 있습니다. 글로벌 경제 상황이 주요 변수로 작용할 것으로 예상됩니다.",
                mainTopic: "금리",
                subTopic: "시장 전망",
                link: "https://land.hankyung.com/news/view/20250116008",
                source: "한국경제 부동산",
                publishedAt: new Date(),
                originalTitle: "금리 변동성 확대 전망",
                keywords: ["금리", "시장 전망"],
                impact: "보통"
            },
            {
                title: "주택담보대출 금리 상승세 지속",
                summary: "주택담보대출 금리가 상승세를 지속하고 있습니다. 기준금리 상승에 따라 대출 금리도 함께 오르고 있어 주택 구매 부담이 증가하고 있습니다.",
                mainTopic: "금리",
                subTopic: "주택대출",
                link: "https://www.mk.co.kr/news/realestate/view/20250116009",
                source: "매일경제",
                publishedAt: new Date(),
                originalTitle: "주택담보대출 금리 상승세 지속",
                keywords: ["금리", "주택대출"],
                impact: "보통"
            },
            {
                title: "전세자금대출 금리 인상 영향",
                summary: "전세자금대출 금리 인상으로 전세 수요가 감소하고 있습니다. 월세 전환 수요가 증가하는 추세를 보이고 있습니다.",
                mainTopic: "금리",
                subTopic: "전세대출",
                link: "https://land.naver.com/news/read.naver?articleId=20250116010",
                source: "네이버 부동산",
                publishedAt: new Date(),
                originalTitle: "전세자금대출 금리 인상 영향",
                keywords: ["금리", "전세대출"],
                impact: "보통"
            },
            {
                title: "금리 상승에 따른 투자 패턴 변화",
                summary: "금리 상승으로 부동산 투자 패턴이 변화하고 있습니다. 단기 투자보다 장기 투자에 대한 관심이 높아지고 있습니다.",
                mainTopic: "금리",
                subTopic: "투자 패턴",
                link: "https://land.hankyung.com/news/view/20250116011",
                source: "한국경제 부동산",
                publishedAt: new Date(),
                originalTitle: "금리 상승에 따른 투자 패턴 변화",
                keywords: ["금리", "투자 패턴"],
                impact: "보통"
            },
            {
                title: "금리 정책 변화에 따른 시장 반응",
                summary: "금리 정책 변화에 따른 부동산 시장의 반응을 분석한 결과, 투자 수요 감소와 거주 수요 증가가 동시에 나타나고 있습니다.",
                mainTopic: "금리",
                subTopic: "정책 영향",
                link: "https://www.mk.co.kr/news/realestate/view/20250116012",
                source: "매일경제",
                publishedAt: new Date(),
                originalTitle: "금리 정책 변화에 따른 시장 반응",
                keywords: ["금리", "정책 영향"],
                impact: "보통"
            },
            
            // 한국경제 관련 뉴스 6개
            {
                title: "한국은행 기준금리 동결 결정",
                summary: "한국은행이 기준금리를 현재 수준으로 동결하기로 결정했습니다. 인플레이션 압력과 경제 성장률을 고려한 결정으로 평가됩니다.",
                mainTopic: "한국경제",
                subTopic: "금리 정책",
                link: "https://land.naver.com/news/read.naver?articleId=20250116013",
                source: "네이버 부동산",
                publishedAt: new Date(),
                originalTitle: "한국은행 기준금리 동결 결정",
                keywords: ["한국경제", "금리 정책"],
                impact: "보통"
            },
            {
                title: "한국은행 통화정책 방향성 발표",
                summary: "한국은행이 향후 통화정책의 방향성을 발표했습니다. 경제 상황에 따른 유연한 정책 운용을 강조했습니다.",
                mainTopic: "한국경제",
                subTopic: "통화정책",
                link: "https://land.hankyung.com/news/view/20250116014",
                source: "한국경제 부동산",
                publishedAt: new Date(),
                originalTitle: "한국은행 통화정책 방향성 발표",
                keywords: ["한국경제", "통화정책"],
                impact: "보통"
            },
            {
                title: "한국은행 디지털화폐 연구 진행",
                summary: "한국은행이 디지털화폐 발행을 위한 연구를 진행하고 있습니다. 중앙은행 디지털화폐(CBDC) 도입 가능성을 검토하고 있습니다.",
                mainTopic: "한국경제",
                subTopic: "디지털화폐",
                link: "https://www.mk.co.kr/news/realestate/view/20250116015",
                source: "매일경제",
                publishedAt: new Date(),
                originalTitle: "한국은행 디지털화폐 연구 진행",
                keywords: ["한국경제", "디지털화폐"],
                impact: "보통"
            },
            {
                title: "한국 경제 성장률 전망",
                summary: "한국 경제 성장률에 대한 전망이 발표되었습니다. 내수 회복과 수출 증가가 주요 성장 동력으로 분석되고 있습니다.",
                mainTopic: "한국경제",
                subTopic: "성장률",
                link: "https://land.naver.com/news/read.naver?articleId=20250116016",
                source: "네이버 부동산",
                publishedAt: new Date(),
                originalTitle: "한국 경제 성장률 전망",
                keywords: ["한국경제", "성장률"],
                impact: "보통"
            },
            {
                title: "한국은행 금융안정 보고서 발표",
                summary: "한국은행이 금융안정 보고서를 발표했습니다. 가계부채 증가와 부동산 시장 안정성에 대한 우려가 제기되었습니다.",
                mainTopic: "한국경제",
                subTopic: "금융안정",
                link: "https://land.hankyung.com/news/view/20250116017",
                source: "한국경제 부동산",
                publishedAt: new Date(),
                originalTitle: "한국은행 금융안정 보고서 발표",
                keywords: ["한국경제", "금융안정"],
                impact: "보통"
            },
            {
                title: "한국 경제 정책 방향성 논의",
                summary: "한국 경제 정책의 방향성에 대한 논의가 진행되고 있습니다. 성장과 안정의 균형을 맞추는 정책이 필요하다는 의견이 제시되었습니다.",
                mainTopic: "한국경제",
                subTopic: "정책 방향",
                link: "https://www.mk.co.kr/news/realestate/view/20250116018",
                source: "매일경제",
                publishedAt: new Date(),
                originalTitle: "한국 경제 정책 방향성 논의",
                keywords: ["한국경제", "정책 방향"],
                impact: "보통"
            }
        ];
    }
}

module.exports = new NewsScraperService();