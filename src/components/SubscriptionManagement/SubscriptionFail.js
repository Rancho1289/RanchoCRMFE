import React from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import './SubscriptionFail.css';

const SubscriptionFail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  

  
  const message = searchParams.get("message") || "알 수 없는 오류가 발생했습니다.";
  const code = searchParams.get("code") || "";

  const goToSubscription = () => {
    navigate('/subscription');
  };

  const goToHome = () => {
    navigate('/');
  };

  const retryPayment = () => {
    navigate('/subscription');
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          {/* 원본 Fail.jsx 스타일과 호환되는 디자인 */}
          <div id="info" className="box_section" style={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}>
            <img 
              width="100px" 
              src="https://static.toss.im/lotties/error-spot-no-loop-space-apng.png" 
              alt="에러 이미지" 
              className="mb-3"
            />
            <h2>결제를 실패했어요</h2>

            <div className="p-grid typography--p" style={{ marginTop: "50px" }}>
              <div className="p-grid-col text--left">
                <b>에러메시지</b>
              </div>
              <div className="p-grid-col text--right" id="message">{message}</div>
            </div>
            <div className="p-grid typography--p" style={{ marginTop: "10px" }}>
              <div className="p-grid-col text--left">
                <b>에러코드</b>
              </div>
              <div className="p-grid-col text--right" id="code">{code}</div>
            </div>

            <div className="p-grid-col mt-4">
              <a href="https://docs.tosspayments.com/guides/v2/payment-widget/integration" target="_blank" rel="noopener noreferrer">
                <button className="button p-grid-col5">연동 문서</button>
              </a>
              <a href="https://discord.gg/A4fRFXQhRu" target="_blank" rel="noopener noreferrer">
                <button className="button p-grid-col5" style={{ backgroundColor: "#e8f3ff", color: "#1b64da" }}>
                  실시간 문의
                </button>
              </a>
            </div>
          </div>

          {/* 추가적인 구독 관련 안내 */}
          <div className="card border-danger mt-4">
            <div className="card-body text-center">
              <h4 className="card-title text-danger mb-4">
                구독 관련 도움이 필요하신가요? 😢
              </h4>

              <div className="error-details mb-4">
                <div className="alert alert-danger">
                  <h6>오류 내용</h6>
                  <p className="mb-1">{message}</p>
                  {code && (
                    <p className="mb-0">
                      <small>오류 코드: {code}</small>
                    </p>
                  )}
                </div>
              </div>

              <div className="common-issues mb-4">
                <h5>일반적인 결제 실패 원인</h5>
                <div className="row text-start">
                  <div className="col-md-6">
                    <ul className="list-unstyled">
                      <li className="mb-2">
                        <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                        카드 잔액 부족
                      </li>
                      <li className="mb-2">
                        <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                        카드 한도 초과
                      </li>
                      <li className="mb-2">
                        <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                        만료된 카드
                      </li>
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <ul className="list-unstyled">
                      <li className="mb-2">
                        <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                        잘못된 카드 정보
                      </li>
                      <li className="mb-2">
                        <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                        보안 인증 실패
                      </li>
                      <li className="mb-2">
                        <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                        일시적인 시스템 오류
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="action-buttons">
                <div className="row">
                  <div className="col-md-4">
                    <button 
                      className="btn btn-danger w-100 mb-2"
                      onClick={retryPayment}
                    >
                      🔄 다시 시도하기
                    </button>
                  </div>
                  <div className="col-md-4">
                    <button 
                      className="btn btn-primary w-100 mb-2"
                      onClick={goToSubscription}
                    >
                      📋 구독 페이지로
                    </button>
                  </div>
                  <div className="col-md-4">
                    <button 
                      className="btn btn-outline-secondary w-100 mb-2"
                      onClick={goToHome}
                    >
                      🏠 홈으로 가기
                    </button>
                  </div>
                </div>
              </div>

              <div className="support-info mt-4">
                <div className="alert alert-info">
                  <h6>💬 도움이 필요하신가요?</h6>
                  <p className="mb-2">
                    결제 관련 문의사항이 있으시면 고객센터로 연락해주세요.
                  </p>
                  <div className="row">
                    <div className="col-md-6">
                      <p className="mb-1">
                        <strong>📞 고객센터:</strong> 1588-0000
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p className="mb-1">
                        <strong>📧 이메일:</strong> support@example.com
                      </p>
                    </div>
                  </div>
                  <p className="mb-0">
                    <strong>⏰ 운영시간:</strong> 평일 09:00 - 18:00 (주말/공휴일 휴무)
                  </p>
                </div>
              </div>

              <div className="troubleshooting-tips mt-4">
                <details>
                  <summary className="btn btn-outline-info">
                    🔧 문제 해결 팁 보기
                  </summary>
                  <div className="mt-2 text-start">
                    <div className="card">
                      <div className="card-body">
                        <h6>결제 전 확인사항:</h6>
                        <ol>
                          <li>카드 잔액과 한도를 확인해주세요</li>
                          <li>카드 유효기간이 만료되지 않았는지 확인해주세요</li>
                          <li>카드 번호, CVC, 유효기간을 정확히 입력했는지 확인해주세요</li>
                          <li>카드사에서 결제를 차단하지 않았는지 확인해주세요</li>
                          <li>인터넷 연결 상태를 확인해주세요</li>
                        </ol>
                        
                        <h6>보안 인증:</h6>
                        <ul>
                          <li>카드사에서 요청하는 보안 인증을 완료해주세요</li>
                          <li>휴대폰 인증번호를 정확히 입력해주세요</li>
                          <li>카드 비밀번호를 정확히 입력해주세요</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionFail; 