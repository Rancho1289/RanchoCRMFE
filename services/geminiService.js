const axios = require('axios');
require('dotenv').config();

class GeminiService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY || process.env.Gemini_API_Key;
        // 매뉴얼에 따른 올바른 엔드포인트 사용
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
        this.openAICompatUrl = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
    }

    /**
     * GEMINI API를 호출하여 텍스트 생성 (OpenAI 호환 방식)
     * @param {string} prompt - 생성할 프롬프트
     * @param {object} options - 추가 옵션
     * @returns {Promise<string>} 생성된 텍스트
     */
    async generateText(prompt, options = {}) {
        try {
            console.log('=== GEMINI API 호출 시작 ===');
            console.log('API URL:', this.baseUrl);
            
            // API 키 검증
            if (!this.apiKey) {
                throw new Error('Gemini API 키가 설정되지 않았습니다. 환경변수를 확인하세요.');
            }
            
            console.log('API Key:', this.apiKey.substring(0, 10) + '...');
            
            const requestBody = {
                contents: [{
                    role: "user",
                    parts: [{
                        text: `당신은 부동산 CRM 시스템의 AI 어시스턴트입니다. 한국어로 친근하고 전문적인 톤으로 응답해주세요.\n\n${prompt}`
                    }]
                }],
                generationConfig: {
                    temperature: options.temperature ?? 0.7,
                    topK: options.topK ?? 32,
                    topP: options.topP ?? 0.9,
                    maxOutputTokens: options.maxOutputTokens ?? 3000,
                }
            };

            console.log('요청 본문:', JSON.stringify(requestBody, null, 2));

            // 재시도 로직 (네이티브 엔드포인트)
            const maxRetries = 3;
            let lastError;
            for (let attempt = 0; attempt <= maxRetries; attempt++) {
                try {
                    const response = await axios.post(
                        `${this.baseUrl}?key=${this.apiKey}`,
                        requestBody,
                        {
                            headers: {
                                'Content-Type': 'application/json',
                            }
                        }
                    );

                    console.log('응답 상태:', response.status);
                    console.log('응답 데이터:', JSON.stringify(response.data, null, 2));

                    if (response.data && response.data.candidates && response.data.candidates[0]) {
                        const parts = response.data.candidates[0].content?.parts || [];
                        const result = parts.map(p => p.text || '').join('\n').trim();
                        console.log('생성된 텍스트 길이:', result.length);
                        console.log('생성된 텍스트 전체:', result);
                        return result;
                    } else {
                        console.error('응답 형식 오류:', response.data);
                        throw new Error('GEMINI API 응답 형식이 올바르지 않습니다.');
                    }
                } catch (err) {
                    lastError = err;
                    const isTimeout = err.code === 'ECONNABORTED' || /timeout/i.test(err.message);
                    const status = err.response?.status;
                    console.warn(`네이티브 호출 실패 (시도 ${attempt + 1}/${maxRetries + 1}) - status=${status || 'n/a'} timeout=${isTimeout}`);
                    if (attempt < maxRetries) {
                        const backoffMs = 1000 * Math.pow(2, attempt);
                        await new Promise(r => setTimeout(r, backoffMs));
                        continue;
                    }
                }
            }

            // 폴백: OpenAI 호환 엔드포인트로 재시도
            console.warn('네이티브 엔드포인트 실패. OpenAI 호환 엔드포인트로 폴백합니다.');
            const oaBody = {
                model: 'gemini-2.5-flash',
                messages: [
                    { role: 'system', content: '당신은 부동산 CRM 시스템의 AI 어시스턴트입니다. 한국어로 친근하고 전문적인 톤으로 응답해주세요.' },
                    { role: 'user', content: prompt }
                ],
                temperature: requestBody.generationConfig.temperature,
                top_p: requestBody.generationConfig.topP,
                max_tokens: requestBody.generationConfig.maxOutputTokens
            };
            const oaResp = await axios.post(
                this.openAICompatUrl,
                oaBody,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`
                    }
                }
            );
            const choice = oaResp.data?.choices?.[0]?.message?.content;
            if (!choice) {
                throw lastError || new Error('GEMINI OpenAI 호환 응답 형식 오류');
            }
            return choice;
        } catch (error) {
            console.error('=== GEMINI API 호출 오류 ===');
            console.error('오류 타입:', error.constructor.name);
            console.error('오류 메시지:', error.message);
            
            if (error.response) {
                console.error('응답 상태:', error.response.status);
                console.error('응답 헤더:', error.response.headers);
                console.error('응답 데이터:', error.response.data);
                throw new Error(`GEMINI API 오류 (${error.response.status}): ${JSON.stringify(error.response.data)}`);
            } else if (error.request) {
                console.error('요청 정보:', error.request);
                throw new Error('GEMINI API 서버에 연결할 수 없습니다.');
            } else {
                console.error('기타 오류:', error);
                throw new Error(`GEMINI API 호출 중 오류가 발생했습니다: ${error.message}`);
            }
        }
    }

    /**
     * 금주 업무리스트 브리핑 생성
     * @param {Array} schedules - 일정 목록
     * @param {string} userName - 사용자 이름
     * @returns {Promise<string>} 브리핑 텍스트
     */
    async generateWeeklyBriefing(schedules, userName) {
        // 전체 데이터 전송 (더 상세한 분석을 위해)
        const fullData = schedules.map(s => ({
            _id: s._id,
            title: s.title,
            type: s.type,
            date: s.date,
            time: s.time,
            location: s.location,
            description: s.description,
            priority: s.priority,
            status: s.status,
            relatedCustomers: (s.relatedCustomers || []).map(c => ({ 
                _id: c._id,
                name: c.name, 
                phone: c.phone,
                email: c.email 
            })),
            relatedProperties: (s.relatedProperties || []).map(p => ({
                _id: p._id,
                title: p.title,
                address: p.address
            })),
            relatedContracts: s.relatedContracts || [],
            publisher: s.publisher ? {
                _id: s.publisher._id,
                name: s.publisher.name,
                email: s.publisher.email,
                level: s.publisher.level
            } : null,
            byCompanyNumber: s.byCompanyNumber,
            createdAt: s.createdAt
        }));

        const prompt = `
당신은 15년 경력의 부동산 전문가입니다. 사용자 "${userName}"의 이번 주 일정을 분석하여 실무에 바로 적용할 수 있는 상세한 브리핑을 작성하세요.

일정 데이터:
${JSON.stringify(fullData, null, 2)}

다음 내용을 포함하여 상세하고 실용적인 브리핑을 작성해주세요:

## 📅 이번 주 업무 브리핑

### 📊 일정 개요
- 총 일정 수와 완료/진행/예정 상태 분석
- 이번 주의 핵심 업무와 목표

### 🎯 일정별 상세 분석
각 일정에 대해 다음을 포함하여 상세히 분석:
- **고객 정보**: 고객의 성향, 구매력, 관심사 분석
- **업무 목적**: 각 일정의 구체적인 목적과 중요도
- **준비사항**: 미리 준비해야 할 자료와 정보
- **추천 멘트**: 상황별로 사용할 구체적인 멘트와 화법
- **예상 질문**: 고객이 물어볼 가능성이 높은 질문들
- **딜 클로징**: 계약으로 이어질 수 있는 구체적인 방법

### 💡 성공을 위한 핵심 팁
- 고객별 맞춤형 접근 방법
- 효과적인 커뮤니케이션 전략
- 신뢰 구축 방법
- 경쟁사 대비 우위점

### ⚠️ 주의사항
- 특별히 주의해야 할 점들
- 법적 주의사항
- 고객별 특이사항

3000자 이내로 작성하고, 실제 현장에서 바로 사용할 수 있는 구체적인 조언과 멘트를 포함해주세요.
`;

        return await this.generateText(prompt, {
            temperature: 0.8,
            maxOutputTokens: 4000
        });
    }

    /**
     * 만나는 사람에 대한 메시지 추천 생성
     * @param {Object} schedule - 일정 정보
     * @param {Object} customer - 고객 정보
     * @returns {Promise<string>} 추천 메시지
     */
    async generateMeetingMessage(schedule, customer) {
        const prompt = `
당신은 15년 경력의 부동산 전문가이자 고객 상담 전문가입니다. 고객과의 만남 전에 보낼 매우 상세하고 실용적인 메시지를 추천해주세요.

일정 정보:
- 제목: ${schedule.title}
- 유형: ${schedule.type}
- 날짜: ${schedule.date}
- 시간: ${schedule.time}
- 장소: ${schedule.location}
- 설명: ${schedule.description || '없음'}
- 우선순위: ${schedule.priority}
- 상태: ${schedule.status}

고객 정보:
- 이름: ${customer.name}
- 연락처: ${customer.phone}
- 이메일: ${customer.email || '없음'}

관련 매물 정보:
${schedule.relatedProperties && schedule.relatedProperties.length > 0 
    ? schedule.relatedProperties.map(p => `- ${p.title} (${p.address})`).join('\n')
    : '관련 매물 없음'
}

다음 형식으로 매우 상세하고 실용적인 메시지를 작성해주세요:

## 📱 고객별 맞춤 메시지 추천

### 🎯 고객 프로파일 분석
- **고객 성향**: 연락처와 이메일 정보를 바탕으로 한 고객 성향 분석
- **예상 관심사**: 업무 유형과 매물 정보를 바탕으로 한 관심사 추정
- **접근 전략**: 이 고객에게 가장 효과적인 접근 방법

### 📞 전화 통화용 스크립트 (상황별)
**1단계: 첫 인사 및 확인**
"안녕하세요, ${customer.name}님! [회사명] [담당자명]입니다. 내일 [시간]에 [장소]에서 만나기로 한 약속 확인차 연락드립니다."

**2단계: 세부사항 확인**
"혹시 시간이나 장소에 변경사항이 있으시거나, 미리 준비해주실 자료가 있으시면 말씀해 주세요."

**3단계: 기대감 조성**
"[업무유형] 관련해서 정말 좋은 정보들을 준비해두었습니다. 내일 뵙겠습니다!"

### 💬 문자 메시지용 (상황별)
**기본 확인 메시지:**
"안녕하세요, ${customer.name}님! 내일 [날짜] [시간]에 [장소]에서 [업무유형] 관련 상담 예정입니다. 준비해주신 자료나 궁금한 점이 있으시면 미리 말씀해 주세요. 내일 뵙겠습니다! 😊"

**매물 관련 상담인 경우:**
"안녕하세요, ${customer.name}님! 내일 [시간]에 [장소]에서 [매물명] 관련 상담 예정입니다. 해당 매물의 최신 정보와 주변 시세 분석 자료를 준비해두었습니다. 내일 뵙겠습니다! 🏠"

**계약 관련 상담인 경우:**
"안녕하세요, ${customer.name}님! 내일 [시간]에 [장소]에서 계약 관련 상담 예정입니다. 계약서와 관련 서류들을 미리 준비해두었습니다. 내일 뵙겠습니다! 📋"

### 📧 이메일용 (공식적이고 상세한 안내)
**제목: [날짜] [업무유형] 상담 일정 안내**

"${customer.name}님 안녕하세요.

[회사명] [담당자명]입니다.

내일 [날짜] [시간]에 [장소]에서 [업무유형] 관련 상담을 진행할 예정입니다.

**상담 준비사항:**
- 신분증 사본
- [업무유형별 구체적인 준비사항]
- [매물 관련 상담인 경우] 관련 서류

**상담 내용:**
- [업무유형] 상세 설명
- 관련 매물 정보 제공
- 질문사항 답변

**찾아오시는 길:**
[장소 상세 안내]

문의사항이 있으시면 언제든 연락주세요.
감사합니다.

[담당자명] 드림"

### 🎭 상황별 맞춤 멘트
**첫 만남인 경우:**
- "처음 뵙는 자리에서 더욱 신중하게 상담드리겠습니다"
- "고객님의 요구사항을 정확히 파악하여 최적의 솔루션을 제안드리겠습니다"

**재방문인 경우:**
- "지난번 상담 내용을 바탕으로 더욱 구체적인 정보를 준비했습니다"
- "고객님께서 관심을 보이신 부분에 대해 추가 자료를 준비해두었습니다"

**긴급한 업무인 경우:**
- "빠른 처리를 위해 모든 준비를 완료했습니다"
- "고객님의 시간을 절약할 수 있도록 효율적으로 상담드리겠습니다"

### 💡 추가 팁
- **고객별 맞춤 톤**: 고객의 연령대와 성향에 맞는 말투 조정
- **기대감 조성**: 만남 전에 긍정적인 기대감을 심어주는 방법
- **신뢰 구축**: 전문성과 신뢰성을 보여주는 표현 사용
- **후속 관리**: 만남 후 팔로업을 위한 자연스러운 연결고리 마련

각 메시지는 고객의 상황과 업무 유형에 맞게 조정하되, 실제 현장에서 바로 사용할 수 있는 구체적인 내용으로 작성해주세요.
`;

        return await this.generateText(prompt, {
            temperature: 0.7,
            maxOutputTokens: 4000
        });
    }

    /**
     * 일정 분석 및 조언 생성
     * @param {Array} schedules - 일정 목록
     * @returns {Promise<string>} 분석 및 조언 텍스트
     */
    async generateScheduleAnalysis(schedules) {
        // 전체 데이터 전송 (더 상세한 분석을 위해)
        const fullData = schedules.map(s => ({
            _id: s._id,
            title: s.title,
            type: s.type,
            date: s.date,
            time: s.time,
            location: s.location,
            description: s.description,
            priority: s.priority,
            status: s.status,
            relatedCustomers: (s.relatedCustomers || []).map(c => ({ 
                _id: c._id,
                name: c.name, 
                phone: c.phone,
                email: c.email 
            })),
            relatedProperties: (s.relatedProperties || []).map(p => ({
                _id: p._id,
                title: p.title,
                address: p.address
            })),
            relatedContracts: s.relatedContracts || [],
            publisher: s.publisher ? {
                _id: s.publisher._id,
                name: s.publisher.name,
                level: s.publisher.level
            } : null,
            createdAt: s.createdAt
        }));

        const prompt = `
당신은 15년 경력의 부동산 전문가입니다. 사용자의 일정을 분석하여 효율적인 업무 관리를 위한 상세한 조언을 제공하세요.

일정 데이터:
${JSON.stringify(fullData, null, 2)}

다음 내용을 포함하여 상세하고 실용적인 분석을 작성해주세요:

## 📊 고급 일정 분석 및 성공 전략 보고서

### 📈 업무 패턴 심층 분석
- 업무 유형별 분포 및 특징 분석
- 시간대별 업무 밀도 분석
- 우선순위별 업무 분포
- 고객별 상담 패턴 분석

### ⏰ 시간 관리 최적화 전략
- 효율적인 시간 배치 제안
- 이동 시간 고려사항
- 휴식 시간 권장사항
- 업무 집중도 최적화 방안

### 🎯 고객별 맞춤 전략
각 고객에 대해:
- 고객 프로파일링과 성향 분석
- 구매력 추정과 관심사 파악
- 맞춤형 접근 방법과 커뮤니케이션 전략
- 만남 전 준비사항과 후속 관리 방안

### 💡 실전 성공 노하우
- 고객 신뢰 구축 방법
- 전문성 어필 전략
- 경쟁사 대비 우위점
- 고객 만족도 향상 방안

### 🔄 개선 제안사항
- 일정 최적화 방안
- 업무 효율성 향상 방법
- 고객 관리 시스템 개선
- 스트레스 관리 팁

3000자 이내로 작성하고, 실제 현장에서 바로 적용할 수 있는 구체적인 조언을 포함해주세요.
`;

        return await this.generateText(prompt, {
            temperature: 0.7,
            maxOutputTokens: 4000
        });
    }

    /**
     * 주간 브리핑 생성
     * @param {Array} schedules - 일정 배열
     * @param {string} userName - 사용자 이름
     * @returns {Promise<string>} 생성된 브리핑
     */
    async generateWeeklyBriefing(schedules, userName) {
        const prompt = `
당신은 부동산 CRM 시스템의 AI 어시스턴트입니다.
사용자 "${userName}"의 이번 주 일정을 분석하여 효율적인 업무 관리를 위한 주간 브리핑을 작성해주세요.

일정 데이터:
${JSON.stringify(schedules.map(s => ({
    title: s.title,
    date: s.date,
    time: s.time,
    type: s.type,
    priority: s.priority,
    status: s.status,
    description: s.description,
    publisher: s.publisher?.name,
    customers: s.relatedCustomers?.map(c => c.name),
    properties: s.relatedProperties?.map(p => p.title),
    contracts: s.relatedContracts?.map(c => c.contractNumber)
})), null, 2)}

다음 형식으로 주간 브리핑을 작성해주세요:

## 📅 이번 주 업무 브리핑

### 📊 일정 개요
- 총 일정 수: X건
- 완료된 일정: X건
- 진행 중인 일정: X건
- 예정된 일정: X건

### 🎯 주요 업무 포인트
- 중요도가 높은 일정들
- 긴급도가 높은 일정들
- 고객 만남 일정들

### ⏰ 시간 관리 조언
- 효율적인 시간 배치 제안
- 이동 시간 고려사항
- 휴식 시간 권장사항

### 💼 고객 관리 전략
- 고객별 접근 방법
- 만남 전 준비사항
- 후속 관리 방안

### 🔄 개선 제안사항
- 일정 최적화 방안
- 업무 효율성 향상 방법
- 고객 만족도 향상 방안

한국어로 전문적이고 실용적인 조언을 제공해주세요.
`;

        return await this.generateText(prompt, {
            temperature: 0.6,
            maxOutputTokens: 4000
        });
    }

    /**
     * 고객별 맞춤형 상담 가이드 생성
     * @param {Object} customer - 고객 정보
     * @param {Array} schedules - 관련 일정 목록
     * @param {Array} properties - 관련 매물 목록
     * @returns {Promise<string>} 상담 가이드 텍스트
     */
    async generateCustomerConsultationGuide(customer, schedules, properties) {
        const prompt = `
당신은 15년 경력의 부동산 전문가이자 고객 상담 전문가입니다. 고객 "${customer.name}"에 대한 매우 상세하고 실용적인 맞춤형 상담 가이드를 작성하세요.

고객 정보:
- 이름: ${customer.name}
- 연락처: ${customer.phone}
- 이메일: ${customer.email || '없음'}
- 주소: ${customer.address || '없음'}
- 메모: ${customer.memo || '없음'}

관련 일정 데이터:
${JSON.stringify(schedules, null, 2)}

관련 매물 데이터:
${JSON.stringify(properties, null, 2)}

다음 형식으로 매우 상세하고 실용적인 고객별 상담 가이드를 작성해주세요:

## 👤 ${customer.name}님 맞춤형 상담 가이드

### 🎯 고객 프로파일 분석
- **고객 성향**: 연락처, 이메일, 주소 정보를 바탕으로 한 고객 성향 분석
- **구매력 추정**: 고객 정보를 바탕으로 한 예상 예산대 분석
- **관심사 파악**: 과거 일정과 매물 정보를 통한 관심사 추정
- **구매 패턴**: 과거 상담 이력을 통한 구매 패턴 분석
- **의사결정 스타일**: 신중형/즉결형/비교형 등 의사결정 성향

### 💬 맞춤형 커뮤니케이션 전략
- **접근 방법**: 이 고객에게 가장 효과적인 커뮤니케이션 방식
- **대화 톤**: 고객의 성향에 맞는 대화 톤과 스타일
- **정보 제공 방식**: 고객이 선호하는 정보 제공 방법
- **의사결정 유도**: 구매 결정을 이끌어내는 효과적인 방법
- **신뢰 구축**: 고객과의 신뢰 관계를 돈독히 하는 방법

### 🏠 매물 추천 전략
- **고객 조건 분석**: 고객의 구체적인 요구사항과 조건
- **추천 매물 유형**: 고객에게 적합한 매물 유형과 특징
- **가격대 전략**: 고객의 예산대에 맞는 가격 전략
- **위치 선호도**: 고객이 선호하는 지역과 위치 특성
- **투자 관점**: 투자 목적이 있는 경우의 추천 방향

### 📞 상담 시나리오
**1단계: 첫 인사 및 관계 구축**
- 고객별 맞춤 인사말과 첫인상 관리
- 신뢰 관계 구축을 위한 대화 방법

**2단계: 니즈 파악**
- 고객의 구체적인 요구사항을 파악하는 질문들
- 예산, 위치, 용도 등 핵심 정보 수집 방법

**3단계: 매물 소개**
- 고객 조건에 맞는 매물 소개 방법
- 매물의 장점을 효과적으로 어필하는 방법

**4단계: 가격 협상**
- 가격에 대한 고객 반응 대처법
- 가격 협상 시 사용할 수 있는 전략

**5단계: 의사결정 유도**
- 구매 결정을 이끌어내는 질문과 답변 기법
- 딜 클로징을 위한 구체적인 방법

### 💡 성공을 위한 핵심 팁
- **고객별 특별 고려사항**: 이 고객만의 특별한 요구사항이나 제약사항
- **경쟁사 대비 우위**: 다른 중개업체 대비 우리의 차별화 포인트
- **후속 관리 전략**: 상담 후 효과적인 팔로업 방법
- **재계약 유도**: 장기적인 관계 유지와 재계약 유도 전략
- **추천 고객 확보**: 이 고객을 통한 새로운 고객 확보 방법

### ⚠️ 주의사항
- **법적 주의사항**: 이 고객과의 계약 시 주의해야 할 법적 이슈
- **고객별 특이사항**: 특별히 주의해야 할 점들
- **시장 상황 고려**: 현재 시장 상황을 고려한 조언
- **경쟁사 동향**: 경쟁사 대비 주의해야 할 점

### 📊 상담 성과 측정
- **상담 목표**: 이 고객과의 상담에서 달성해야 할 구체적인 목표
- **성공 지표**: 상담 성공을 측정할 수 있는 지표들
- **기대 효과**: 상담을 통해 기대할 수 있는 결과

한국어로 매우 친근하면서도 전문적인 톤으로 작성하되, 실제 현장에서 바로 사용할 수 있는 구체적인 조언과 멘트를 포함해주세요.
`;

        return await this.generateText(prompt, {
            temperature: 0.8,
            maxOutputTokens: 4000
        });
    }

    /**
     * 매물별 추천 전략 생성
     * @param {Object} property - 매물 정보
     * @param {Array} customers - 관심 고객 목록
     * @param {Array} schedules - 관련 일정 목록
     * @returns {Promise<string>} 추천 전략 텍스트
     */
    async generatePropertyRecommendationStrategy(property, customers, schedules) {
        const prompt = `
당신은 15년 경력의 부동산 전문가이자 매물 마케팅 전문가입니다. 매물 "${property.title}"에 대한 매우 상세하고 실용적인 추천 전략을 작성하세요.

매물 정보:
- 제목: ${property.title}
- 주소: ${property.address}
- 가격: ${property.price || '미정'}
- 타입: ${property.type || '미정'}
- 설명: ${property.description || '없음'}
- 메모: ${property.memo || '없음'}

관심 고객 데이터:
${JSON.stringify(customers, null, 2)}

관련 일정 데이터:
${JSON.stringify(schedules, null, 2)}

다음 형식으로 매우 상세하고 실용적인 매물 추천 전략을 작성해주세요:

## 🏠 ${property.title} 추천 전략

### 🎯 매물 핵심 어필 포인트
- **매물의 강점**: 이 매물만의 독특한 장점과 특징
- **시장 경쟁력**: 주변 매물 대비 경쟁력 있는 요소들
- **투자 가치**: 투자 관점에서의 매물 가치 분석
- **거주 적합성**: 거주 목적 고객에게 어필할 수 있는 요소들
- **미래 가치**: 장기적인 관점에서의 가치 전망

### 👥 타겟 고객 분석
- **주요 타겟**: 이 매물에 가장 적합한 고객 유형
- **고객별 어필 포인트**: 각 고객 유형별로 어필할 수 있는 매물 특징
- **예상 예산대**: 이 매물을 고려할 수 있는 고객의 예상 예산대
- **관심사별 접근**: 고객의 관심사에 따른 매물 소개 방법
- **의사결정 요인**: 고객이 구매 결정을 내릴 때 고려할 주요 요인들

### 💬 매물 소개 시나리오
**1단계: 첫인상 관리**
- 매물에 대한 첫인상을 좋게 만드는 방법
- 고객의 관심을 끌 수 있는 핵심 포인트

**2단계: 매물 특징 소개**
- 매물의 장점을 효과적으로 전달하는 방법
- 고객의 니즈에 맞는 특징 강조 방법

**3단계: 가치 어필**
- 매물의 가치를 구체적으로 설명하는 방법
- 투자 가치와 거주 가치를 균형있게 어필하는 방법

**4단계: 객관 유도**
- 실제 매물을 보러 가도록 유도하는 방법
- 객관 시 주의깊게 봐야 할 포인트 안내

**5단계: 구매 결정 유도**
- 구매 결정을 이끌어내는 구체적인 방법
- 딜 클로징을 위한 전략

### 🎭 고객별 맞춤 어필 방법
각 고객 유형별로:
- **투자 목적 고객**: 투자 수익률과 미래 가치 어필
- **거주 목적 고객**: 생활 편의성과 주거 환경 어필
- **사업 목적 고객**: 사업 적합성과 상업적 가치 어필
- **신혼부부**: 가족 구성에 적합한 요소들 어필
- **은퇴 예정자**: 안정성과 편의성 어필

### 💡 마케팅 전략
- **온라인 마케팅**: 온라인에서 매물을 효과적으로 홍보하는 방법
- **오프라인 마케팅**: 오프라인에서 매물을 어필하는 방법
- **고객 추천**: 기존 고객을 통한 새로운 고객 확보 방법
- **네트워킹**: 부동산 관련 네트워크를 활용한 매물 홍보 방법
- **경쟁사 대비**: 경쟁 매물 대비 우리 매물의 우위점 강조

### 📊 성과 측정 및 개선
- **마케팅 효과 측정**: 매물 홍보의 효과를 측정하는 방법
- **고객 반응 분석**: 고객들의 반응을 분석하여 개선점 도출
- **가격 전략**: 시장 상황에 따른 가격 조정 전략
- **판매 기간 단축**: 매물 판매 기간을 단축하는 방법
- **고객 만족도 향상**: 고객 만족도를 높이는 서비스 제공 방법

### ⚠️ 주의사항 및 리스크 관리
- **법적 주의사항**: 매물 관련 법적 이슈와 주의사항
- **시장 상황 고려**: 현재 시장 상황을 고려한 전략 조정
- **경쟁사 동향**: 경쟁사 대비 주의해야 할 점
- **고객별 특이사항**: 특정 고객과의 계약 시 주의사항
- **예상 문제점**: 발생 가능한 문제점과 사전 대비 방안

### 🎯 성공 지표
- **매물 노출 효과**: 매물 노출의 효과를 측정하는 지표
- **고객 관심도**: 고객들의 관심도를 측정하는 방법
- **객관 전환율**: 관심에서 실제 객관으로 이어지는 비율
- **계약 성사율**: 객관에서 계약으로 이어지는 비율
- **고객 만족도**: 고객 만족도를 측정하는 방법

한국어로 매우 전문적이고 실용적인 조언을 제공하되, 실제 현장에서 바로 적용할 수 있는 구체적인 방법과 멘트를 포함해주세요.
`;

        return await this.generateText(prompt, {
            temperature: 0.8,
            maxOutputTokens: 4000
        });
    }

    /**
     * 뉴스 브리핑 생성
     * @param {string} timeSlot - 시간대 (06:00, 12:00, 18:00, 24:00)
     * @param {Array} existingNews - 기존 뉴스 목록
     * @returns {Promise<string>} 뉴스 브리핑 텍스트
     */
    async generateNewsBriefing(timeSlot, existingNews) {
        const timeLabels = {
            '06:00': '아침',
            '12:00': '점심',
            '18:00': '저녁',
            '24:00': '밤'
        };

        const prompt = `
당신은 부동산 전문가이자 뉴스 분석가입니다. ${timeLabels[timeSlot]} 시간대의 부동산 관련 뉴스를 분석하여 실무진이 바로 활용할 수 있는 브리핑을 작성하세요.

기존 뉴스 데이터:
${JSON.stringify(existingNews, null, 2)}

다음 형식으로 뉴스 브리핑을 작성해주세요:

## 📰 ${timeLabels[timeSlot]} 뉴스 브리핑 (${timeSlot})

### 🌅 주요 뉴스 요약
- 핵심 뉴스 3-5개를 요약하여 제시
- 각 뉴스의 핵심 포인트와 시장 영향도 분석

### 📊 시장 동향 분석
- 뉴스 내용을 바탕으로 한 시장 전망
- 부동산 시장에 미칠 영향 분석
- 투자자와 거주자 관점에서의 시사점

### 💡 실무진을 위한 인사이트
- 고객 상담 시 활용할 수 있는 정보
- 시장 상황에 따른 고객 대응 전략
- 경쟁사 대비 우위점 확보 방안

### ⚠️ 주의사항 및 리스크
- 시장 변화에 따른 주의사항
- 고객에게 전달할 때 주의할 점
- 법적/정책적 변화사항

### 🎯 오늘의 액션 아이템
- 실무진이 오늘 해야 할 구체적인 행동
- 고객과의 대화에서 강조할 포인트
- 시장 변화에 대한 대응 방안

3000자 이내로 작성하고, 저작권에 걸리지 않도록 요약과 분석 위주로 작성해주세요.
`;

        return await this.generateText(prompt, {
            temperature: 0.7,
            maxOutputTokens: 3000
        });
    }
}

module.exports = new GeminiService();
