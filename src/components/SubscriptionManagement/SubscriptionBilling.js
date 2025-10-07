import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../utils/api';
import { Container } from 'react-bootstrap';

const SubscriptionBilling = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [responseData, setResponseData] = useState(null);
  const [billingConfirmed, setBillingConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 랜덤 문자열 생성 함수
  const generateRandomString = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  useEffect(() => {
    // 서버로 빌링키 발급을 위해 authKey를 보냅니다
    async function issueBillingKey() {
      const customerKey = searchParams.get("customerKey");
      const authKey = searchParams.get("authKey");
      const mode = searchParams.get("mode");
      const billingCycle = searchParams.get("billingCycle") || 'monthly';

      // 결제 수단 변경 모드인 경우 authKey 검증 건너뛰기
      if (mode === 'change') {
        
        try {
          // 사용자 정보를 먼저 가져오기
          const userResponse = await api.get('/user/me');
          const user = userResponse.data.user;
          
          if (!user || !user.email || !user.name) {
            setError('사용자 정보를 가져올 수 없습니다.');
            return;
          }
          
          // 결제 수단 변경을 위한 빌링키 재발급 요청
          const response = await api.post("/subscription/request-new-billing-key", {
            customerId: customerKey,
            customerEmail: user.email,
            customerName: user.name
          });
          
          if (response.data.success) {
            // SubscriptionPayment.js 페이지로 이동 (빌링키 발급 페이지)
            window.location.href = `/subscription/payment?customerKey=${customerKey}&mode=change`;
          }
        } catch (error) {
          console.error('결제 수단 변경 요청 오류:', error);
          if (error.response?.data?.message) {
            setError(error.response.data.message);
          } else {
            setError('결제 수단 변경 요청에 실패했습니다.');
          }
        }
        return;
      }

      // 기존 빌링키 발급 로직 (authKey가 필요한 경우)
      if (!customerKey || !authKey) {
        setError("필수 파라미터가 누락되었습니다.");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const requestData = {
          customerKey,
          authKey,
          billingCycle,
        };

        const response = await api.post("/subscription/issue-billing-key", requestData);
        const json = response.data;

        if (response.status !== 200) {
          throw { message: json.message, code: json.code };
        }

        setResponseData(json);
      } catch (err) {
        console.error("빌링키 발급 오류:", err);
        setError(err.message || "빌링키 발급에 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    issueBillingKey();
  }, [searchParams]);

  // 정기결제 실행 (테스트용)
  const confirmBilling = async () => {
    const customerKey = searchParams.get("customerKey");
    

    
    if (!customerKey) {
      setError("고객 키가 없습니다.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 실제 사용자 정보를 가져와서 사용
      const userResponse = await api.get('/user/me');
      const user = userResponse.data.user;
      
      const requestData = {
        customerKey,
        amount: 80000, // 8만원으로 수정
        orderId: `${user._id}_premium_${Date.now()}`, // 올바른 orderId 형식
        orderName: "부동산 CRM 프리미엄 정기구독",
        customerEmail: user.email,
        customerName: user.name,
      };
      


      const response = await api.post("/subscription/confirm-billing", requestData);
      const json = response.data;

      if (response.status !== 200) {
        throw { message: json.message, code: json.code };
      }

      setBillingConfirmed(true);
      setResponseData(json);
    } catch (err) {
      console.error("정기결제 실행 오류:", err);
      setError(err.message || "정기결제 실행에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const goToSubscription = () => {
    navigate('/subscription');
  };

  if (error) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="alert alert-danger" role="alert">
              <h4 className="alert-heading">오류 발생</h4>
              <p>{error}</p>
              <hr />
              <button className="btn btn-outline-danger" onClick={goToSubscription}>
                구독 페이지로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Container className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body text-center">
              <img 
                width="100px" 
                src="https://static.toss.im/illusts/check-blue-spot-ending-frame.png" 
                alt="성공"
                className="mb-3"
              />
              
              <h2 className="card-title mb-4">
                {searchParams.get("mode") === 'change' 
                  ? "결제 수단 변경" 
                  : billingConfirmed 
                    ? "빌링키로 정기결제에 성공했어요!" 
                    : "빌링키 발급을 완료했어요!"
                }
              </h2>

              {searchParams.get("mode") === 'change' ? (
                <div className="mb-4">
                  <p className="text-muted">
                    새로운 결제 수단을 등록하여 기존 구독을 계속 이용하세요.
                  </p>
                  <div className="alert alert-info">
                    <strong>결제 수단 변경 모드</strong><br />
                    고객 ID: {searchParams.get("customerKey")}<br />
                    모드: {searchParams.get("mode")}
                  </div>
                </div>
              ) : !billingConfirmed ? (
                <div className="mb-4">
                  <p className="text-muted">
                    정기결제를 테스트해보세요. 실제 운영에서는 배치 작업을 통해 자동으로 실행됩니다.
                  </p>
                  <button 
                    className="btn btn-primary btn-lg"
                    onClick={confirmBilling}
                    disabled={isLoading}
                  >
                    {isLoading ? '처리중...' : '정기결제 테스트 실행'}
                  </button>
                </div>
              ) : null}

              <div className="row mt-4">
                <div className="col-md-6">
                  <button
                    className="btn btn-outline-primary w-100"
                    onClick={() => {
                      window.open("https://docs.tosspayments.com/guides/v2/billing/integration", "_blank");
                    }}
                  >
                    📚 연동 문서
                  </button>
                </div>
                <div className="col-md-6">
                  <button
                    className="btn btn-outline-info w-100"
                    onClick={() => {
                      window.open("https://discord.gg/A4fRFXQhRu", "_blank");
                    }}
                  >
                    💬 실시간 문의
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <button 
                  className="btn btn-success"
                  onClick={goToSubscription}
                >
                  구독 페이지로 돌아가기
                </button>
              </div>

              {/* 응답 데이터 표시 */}
              {responseData && (
                <div className="mt-4">
                  <details>
                    <summary className="btn btn-outline-secondary">
                      응답 데이터 보기
                    </summary>
                    <div className="mt-2">
                      <pre className="bg-light p-3 rounded" style={{ whiteSpace: "pre-wrap", fontSize: "12px" }}>
                        {JSON.stringify(responseData, null, 2)}
                      </pre>
                    </div>
                  </details>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

function generateRandomString() {
  return window.btoa(Math.random().toString()).slice(0, 20);
}

export default SubscriptionBilling; 