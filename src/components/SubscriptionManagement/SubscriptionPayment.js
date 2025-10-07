import React, { useEffect, useState } from 'react';
import { loadTossPayments } from '@tosspayments/tosspayments-sdk';
import { useSearchParams } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import api from '../../utils/api'; // api 호출을 위한 임포트

// 토스페이먼츠 클라이언트 키 (환경변수에서 가져오기)
const clientKey = process.env.REACT_APP_TOSS_CLIENT_KEY;

const SubscriptionPayment = ({ customerId, customerEmail, customerName, subscriptionPlan }) => {
  const [searchParams] = useSearchParams();
  const [payment, setPayment] = useState(null);
  const [selectedBillingCycle] = useState('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // URL 파라미터에서 mode와 customerKey 확인
  const mode = searchParams.get('mode');
  const urlCustomerKey = searchParams.get('customerKey');

  // 결제 수단 변경 모드인 경우 URL의 customerKey 사용
  const finalCustomerKey = mode === 'change' ? urlCustomerKey : (customerId || generateRandomString());



  // 사용자 정보 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await api.get('/user/me');
        setUser(response.data.user);
      } catch (error) {
        console.error('사용자 정보 조회 오류:', error);
      }
    };

    fetchUserInfo();
  }, []);

  // 최종 사용자 정보 결정 (props 우선, 없으면 user state 사용)
  const finalCustomerEmail = customerEmail || user?.email || '';
  const finalCustomerName = customerName || user?.name || '';

  // 기본 구독 플랜 정보 (props가 없을 때)
  const defaultSubscriptionPlan = {
    id: 'enterprise',
    name: '프리미엄 구독',
    description: '부동산 CRM 프리미엄 서비스',
    price: 80000
  };

  const finalSubscriptionPlan = subscriptionPlan || defaultSubscriptionPlan;


  useEffect(() => {
    async function initializePayment() {
      try {
        const tossPayments = await loadTossPayments(clientKey);

        // 회원 결제 객체 생성
        const paymentObj = tossPayments.payment({
          customerKey: finalCustomerKey,
        });

        setPayment(paymentObj);
      } catch (error) {
        console.error("토스페이먼츠 초기화 오류:", error);
        setError("결제 시스템 초기화에 실패했습니다.");
      }
    }

    initializePayment();
  }, [finalCustomerKey]);


  const requestBillingAuth = async () => {

    if (!payment) {
      setError("결제 시스템이 초기화되지 않았습니다.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 빌링 인증 성공 시 billingCycle을 URL 파라미터로 전달
      const successUrl = `${window.location.origin}/subscription/billing?customerKey=${finalCustomerKey}&billingCycle=${selectedBillingCycle}`;
      
      await payment.requestBillingAuth({
        method: "CARD",
        successUrl: successUrl,
        failUrl: `${window.location.origin}/subscription/fail`,
        customerEmail: finalCustomerEmail,
        customerName: finalCustomerName,
      });
    } catch (error) {
      console.error("❌ 빌링 인증 오류:", error);
      setError("빌링 인증 요청에 실패했습니다: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };


  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  return (
    <Container>

      <div className="subscription-payment">
        <div className="card">
          <div className="card-header">
            <h4 className="mb-0">
              {mode === 'change' ? '결제 수단 변경' : '정기구독 결제'}
            </h4>
          </div>
          <div className="card-body">
            {/* 결제 수단 변경 모드일 때 정보 표시 */}
            {/* {mode === 'change' && (
              <div className="alert alert-info mb-4">
                <strong>결제 수단 변경 모드</strong><br />
                고객 ID: {urlCustomerKey}<br />
                모드: {mode}
              </div>
            )} */}

            {/* 구독 플랜 정보 */}
            {finalSubscriptionPlan && (
              <div className="subscription-plan-info mb-4">
                <h5>{finalSubscriptionPlan.name}</h5>
                <p className="text-muted">{finalSubscriptionPlan.description}</p>
                <div className="price-info">
                  <span className="h4 text-primary">
                    ₩{finalSubscriptionPlan.price?.toLocaleString()}
                  </span>
                  <span className="text-muted">/월</span>
                </div>
              </div>
            )}

            {/* 월간 결제 안내 */}
            <div className="billing-cycle-info mb-4">
              <div className="alert alert-info">
                <h6 className="mb-2">
                  <i className="fas fa-info-circle me-2"></i>
                  월간 결제 안내
                </h6>
                <p className="mb-0">
                  프리미엄 구독은 매월 자동 결제되는 월간 정기 구독 서비스입니다.
                  구독 시작 시 첫 번째 달은 무료로 제공되어 80,000원이 무료입니다.
                </p>
              </div>
            </div>

            {/* 정기결제 설정 */}
            <div className="mt-4">
              <h6>
                {mode === 'change' ? '새로운 결제 수단 등록' : '정기결제 설정'}
              </h6>
              <p className="text-muted small">
                {mode === 'change'
                  ? '새로운 카드 정보를 등록하여 기존 구독을 계속 이용할 수 있습니다.'
                  : '정기결제를 위해 카드 정보를 등록하고 자동 결제를 설정할 수 있습니다.'
                }
              </p>
              <button
                className="btn btn-outline-secondary"
                onClick={requestBillingAuth}
                disabled={isLoading || !payment}
              >
                💳 {mode === 'change' ? '새로운 빌링키 발급하기' : '빌링키 발급하기'}
              </button>
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

export default SubscriptionPayment; 