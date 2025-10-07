import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Table, Alert, Spinner } from 'react-bootstrap';
import SubscriptionPayment from './SubscriptionPayment';
import api from '../../utils/api';

const SubscriptionManagement = () => {
  const [customerInfo, setCustomerInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const setLoading = setIsLoading; // 별칭 생성


  // 단일 구독 플랜 (8만원)
  const subscriptionPlan = {
    id: 'premium',
    name: '프리미엄 구독',
    price: 80000,
    description: '모든 기능을 무제한으로 이용할 수 있는 프리미엄 구독 서비스',
    features: [
      '무제한 고객 관리',
      '무제한 매물 관리',
      '무제한 계약 관리',
      '고급 분석 도구',
      '우선 고객 지원',
      '모바일 앱 접근'
    ]
  };

  useEffect(() => {
    // 고객 정보 로드
    loadCustomerInfo();
  }, []);



  const loadCustomerInfo = async () => {
    try {
      setIsLoading(true);
      
      // 실제 로그인된 사용자 정보 가져오기
      const response = await api.get('/user/me');
      if (response.status === 200) {
        const user = response.data.user;
        setCustomerInfo({
          id: user._id,
          name: user.name,
          email: user.email,
          company: user.companyName || '회사명 없음',
          isPremium: user.isPremium || false,
          subscriptionStatus: user.subscriptionStatus || 'inactive',
          subscriptionStartDate: user.subscriptionStartDate,
          subscriptionEndDate: user.subscriptionEndDate,
          nextBillingDate: user.nextPaymentDate,
          lastPaymentDate: user.lastPaymentDate,
          billingCycle: user.billingCycle || 'monthly' // 추가
        });
      }
    } catch (err) {
      console.error('고객 정보 로드 오류:', err);
      setError('고객 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentComplete = () => {
    // 결제 완료 후 처리
    setShowPayment(false);
    // 구독 상태 새로고침
    loadCustomerInfo();
  };

  // 구독 관리 함수들
  const handleChangePaymentMethod = async () => {
    try {
      setIsLoading(true);
      

      
      // customerId가 있는지 확인
      if (!customerInfo?.id) {
        console.error('❌ customerId가 없습니다:', customerInfo);
        alert('사용자 정보를 찾을 수 없습니다. 페이지를 새로고침해주세요.');
        return;
      }
      
      const requestData = {
        customerId: customerInfo.id,
        customerEmail: customerInfo.email,
        customerName: customerInfo.name
      };
      
      // 결제 수단 변경을 위한 빌링키 재발급 요청
      const response = await api.post('/subscription/request-new-billing-key', requestData);

      if (response.data.success) {
        
        // 사용자에게 확인 메시지 표시
        const userConfirmed = window.confirm(
          '새로운 결제 수단 등록 페이지로 이동합니다.\n\n' +
          '콘솔 로그를 확인하려면 "취소"를 클릭하고,\n' +
          '페이지 이동을 원하면 "확인"을 클릭하세요.'
        );
        
        if (userConfirmed) {
          // 1초 후 페이지 이동 (로그 확인 시간 확보)
          setTimeout(() => {
            if (response.data.redirectUrl) {
              window.location.href = response.data.redirectUrl;
            } else {
              // redirectUrl이 없으면 기본 구독 결제 페이지로 이동
              window.location.href = '/subscription/billing';
            }
          }, 1000);
        }
      } else {
        console.error('❌ API 응답에서 success가 false:', response.data);
        alert('결제 수단 변경 요청에 실패했습니다: ' + response.data.message);
      }
    } catch (error) {
      console.error('❌ 결제 수단 변경 오류:', error);
      console.error('❌ 에러 응답:', error.response);
      console.error('❌ 에러 메시지:', error.message);
      
      let errorMessage = '결제 수단 변경에 실패했습니다.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 구독 일시정지 기능 비활성화
  /*
  const handleSuspendSubscription = async () => {
    if (!window.confirm('정말로 구독을 일시정지하시겠습니까?\n일시정지된 구독은 프리미엄 기능을 사용할 수 없습니다.')) {
      return;
    }

    try {
      setIsLoading(true);
      

      
      // customerId가 있는지 확인
      if (!customerInfo?.id) {
        alert('사용자 정보를 찾을 수 없습니다. 페이지를 새로고침해주세요.');
        return;
      }
      
      const response = await api.post('/subscription/suspend', {
        customerId: customerInfo.id
      });

      if (response.data.success) {
        alert('구독이 일시정지되었습니다.');
        
        // 2초 후 페이지 새로고침
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error('구독 일시정지 오류:', error);
      const errorMessage = error.response?.data?.message || '구독 일시정지에 실패했습니다.';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  */

  const handleCancelSubscription = async () => {
    if (!window.confirm('정말로 구독을 취소하시겠습니까?\n\n구독 취소 시 마지막 결제일로부터 1개월간은 유료회원 권한을 유지합니다.\n유예 기간이 끝나면 프리미엄 기능을 사용할 수 없습니다.')) {
      return;
    }

    try {
      setIsLoading(true);
      

      
      // customerId가 있는지 확인
      if (!customerInfo?.id) {
        alert('사용자 정보를 찾을 수 없습니다. 페이지를 새로고침해주세요.');
        return;
      }
      
      const response = await api.post('/subscription/cancel', {
        customerId: customerInfo.id
      });

      if (response.data.success) {
        alert('구독이 취소되었습니다.');
        
        // 2초 후 페이지 새로고침
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error('구독 취소 오류:', error);
      const errorMessage = error.response?.data?.message || '구독 취소에 실패했습니다.';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 구독 취소철회 함수
  const handleReactivateSubscription = async () => {
    if (!window.confirm('구독 취소를 철회하시겠습니까?\n\n취소철회 시 즉시 구독이 활성화되며, 다음 결제일부터 정기결제가 재개됩니다.')) {
      return;
    }

    try {
      setIsLoading(true);
      
      // customerId가 있는지 확인
      if (!customerInfo?.id) {
        alert('사용자 정보를 찾을 수 없습니다. 페이지를 새로고침해주세요.');
        return;
      }
      
      const response = await api.post('/subscription/reactivate', {
        customerId: customerInfo.id
      });

      if (response.data.success) {
        alert('구독 취소가 철회되었습니다. 구독이 다시 활성화되었습니다.');
        
        // 2초 후 페이지 새로고침
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error('구독 취소철회 오류:', error);
      const errorMessage = error.response?.data?.message || '구독 취소철회에 실패했습니다.';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 구독 재개 기능 비활성화
  /*
  const handleResumeSubscription = async () => {
    try {
      setIsLoading(true);
      

      
      // customerId가 있는지 확인
      if (!customerInfo?.id) {
        alert('사용자 정보를 찾을 수 없습니다. 페이지를 새로고침해주세요.');
        return;
      }
      
      const response = await api.post('/subscription/resume', {
        customerId: customerInfo.id
      });

      if (response.data.success) {
        alert('구독이 재개되었습니다.');
        
        // 2초 후 페이지 새로고침
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error('구독 재개 오류:', error);
      const errorMessage = error.response?.data?.message || '구독 재개에 실패했습니다.';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  */

  if (isLoading) {
    return (
      <Container className="mt-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3">구독 정보를 불러오는 중...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <Alert.Heading>오류 발생</Alert.Heading>
          <p>{error}</p>
          <hr />
          <Button variant="outline-danger" onClick={loadCustomerInfo}>
            다시 시도
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container  className="py-4">
      {/* 헤더 섹션 */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h2 mb-1">구독 관리</h1>
              <p className="text-muted mb-0">
                {customerInfo?.company} • {customerInfo?.email}
              </p>
            </div>
            <div className="text-end">
              <div className="current-plan-badge">
                <Badge bg={customerInfo?.isPremium ? "success" : "secondary"} className="fs-6">
                  {customerInfo?.isPremium ? "프리미엄 회원" : "무료 회원"}
                </Badge>
              </div>
              {customerInfo?.nextBillingDate && (
                <div className="next-billing mt-1">
                  <small className="text-muted">
                    다음 결제일: {new Date(customerInfo.nextBillingDate).toLocaleDateString()}
                  </small>
                </div>
              )}
            </div>
          </div>
        </Col>
      </Row>

      {/* 현재 구독 상태 */}
      <Row className="mb-5">
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">현재 구독 상태</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <div className="text-center">
                    <div className="subscription-status-icon mb-2">
                      <i className="fas fa-check-circle text-success" style={{ fontSize: '2rem' }}></i>
                    </div>
                    <h6>구독 상태</h6>
                    <Badge bg={
                      customerInfo?.subscriptionStatus === 'active' ? 'success' : 
                      customerInfo?.subscriptionStatus === 'grace_period' ? 'warning' :
                      customerInfo?.subscriptionStatus === 'cancelled' ? 'warning' : 'secondary'
                    }>
                      {customerInfo?.subscriptionStatus === 'active' ? '활성' : 
                       customerInfo?.subscriptionStatus === 'grace_period' ? '유예기간' :
                       customerInfo?.subscriptionStatus === 'cancelled' ? '취소됨' : '비활성'}
                    </Badge>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <div className="subscription-plan-icon mb-2">
                      <i className="fas fa-crown text-warning" style={{ fontSize: '2rem' }}></i>
                    </div>
                    <h6>구독 플랜</h6>
                    <Badge bg={customerInfo?.isPremium ? "success" : "secondary"}>
                      {customerInfo?.isPremium ? "프리미엄" : "무료"}
                    </Badge>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <div className="billing-cycle-icon mb-2">
                      <i className="fas fa-sync-alt text-primary" style={{ fontSize: '2rem' }}></i>
                    </div>
                    <h6>결제 주기</h6>
                    <Badge bg="info">
                      {customerInfo?.billingCycle === 'test_minute' ? '1분간 (테스트)' :
                       customerInfo?.billingCycle === 'daily' ? '일간' :
                       customerInfo?.billingCycle === 'monthly' ? '월간' :
                       customerInfo?.billingCycle === 'quarterly' ? '분기별' :
                       customerInfo?.billingCycle === 'yearly' ? '연간' : '월간'}
                    </Badge>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <div className="billing-date-icon mb-2">
                      <i className="fas fa-calendar-alt text-info" style={{ fontSize: '2rem' }}></i>
                    </div>
                    <h6>구독 시작일</h6>
                    <p className="mb-0">
                      {customerInfo?.subscriptionStartDate 
                        ? new Date(customerInfo.subscriptionStartDate).toLocaleDateString()
                        : '-'
                      }
                    </p>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <div className="customer-info-icon mb-2">
                      <i className="fas fa-user text-secondary" style={{ fontSize: '2rem' }}></i>
                    </div>
                    <h6>고객명</h6>
                    <p className="mb-0">{customerInfo?.name}</p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>



      {/* 구독 플랜 및 결제 */}
      {!customerInfo?.isPremium ? (
        <Row className="mb-5">
          <Col>
            <Card className="border-primary">
              <Card.Header className="bg-primary border-gradient text-white">
                <h5 className="mb-0">
                  <i className="fas fa-crown me-2"></i>
                  첫 구독자 특별 혜택 🌟
                </h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={8}>
                    <div className="mb-3">
                      <h4 className="text-primary mb-2">
                        <span className="text-success fs-3">첫 구독자 할인!</span>
                      </h4>
                      <div className="d-flex align-items-center mb-2">
                        <span className="text-decoration-line-through text-muted me-2">₩80,000</span>
                        <span className="fs-4 fw-bold text-danger">첫 달 무료!</span>
                      </div>
                      <small className="text-muted">두 번째 달부터 ₩80,000/월</small>
                    </div>
                    <p className="text-muted mb-4">{subscriptionPlan.description}</p>
                    <div className="row">
                      {subscriptionPlan.features.map((feature, index) => (
                        <Col md={6} key={index} className="mb-2">
                          <div className="d-flex align-items-center">
                            <i className="fas fa-check text-success me-2"></i>
                            <span>{feature}</span>
                          </div>
                        </Col>
                      ))}
                    </div>
                  </Col>
                  <Col md={4} className="d-flex align-items-center justify-content-center">
                    <div className="text-center">
                      {!showPayment ? (
                        <Button 
                          variant="success" 
                          size="lg" 
                          onClick={() => {
                            setShowPayment(true);
                          }}
                          className="px-5"
                        >
                          <i className="fas fa-gift me-2"></i>
                          첫 달 무료 체험으로 구독 시작
                        </Button>
                      ) : (
                        <Button 
                          variant="outline-secondary" 
                          onClick={() => {
                            setShowPayment(false);
                          }}
                        >
                          취소
                        </Button>
                      )}
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : (
        <Row className="mb-5">
          <Col>
            {customerInfo?.subscriptionStatus === 'active' ? (
              // 활성 구독인 경우
              <Card className="border-success">
                <Card.Header className="bg-success text-white">
                  <h5 className="mb-0">
                    <i className="fas fa-check-circle me-2"></i>
                    프리미엄 구독 활성화됨
                  </h5>
                </Card.Header>
                <Card.Body>
                  <div className="text-center">
                    <i className="fas fa-crown text-warning" style={{ fontSize: '3rem' }}></i>
                    <h4 className="mt-3 text-success">프리미엄 구독이 활성화되어 있습니다!</h4>
                    <p className="text-muted">
                      모든 기능을 무제한으로 이용할 수 있습니다.
                    </p>
                    {customerInfo?.nextPaymentDate && (
                      <p className="text-info">
                        다음 결제 예정일: {new Date(customerInfo.nextPaymentDate).toLocaleDateString()}
                      </p>
                    )}
                    
                    {/* 구독 상태 정보 추가 */}
                    <div className="mt-3">
                      <h6>구독 상태</h6>
                      <div className="d-flex flex-wrap gap-2">
                        <Badge bg="success" className="me-2">
                          활성
                        </Badge>
                        {customerInfo?.lastPaymentDate && (
                          <small className="text-muted">
                            마지막 결제: {new Date(customerInfo.lastPaymentDate).toLocaleDateString()}
                          </small>
                        )}
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ) : (
              // 취소된 구독인 경우
              <Card className="border-warning">
                <Card.Header className="bg-warning text-dark">
                  <h5 className="mb-0">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    구독이 취소되었습니다
                  </h5>
                </Card.Header>
                <Card.Body>
                  <div className="text-center">
                    <i className="fas fa-times-circle text-warning" style={{ fontSize: '3rem' }}></i>
                    <h4 className="mt-3 text-warning">구독이 취소되었습니다</h4>
                    <p className="text-muted">
                      프리미엄 기능을 사용하려면 새로운 구독을 시작하세요.
                    </p>
                    
                    {/* 구독 상태 정보 */}
                    <div className="mt-3">
                      <h6>구독 상태</h6>
                      <div className="d-flex flex-wrap gap-2">
                        <Badge bg="warning" className="me-2">
                          취소됨
                        </Badge>
                        {customerInfo?.lastPaymentDate && (
                          <small className="text-muted">
                            마지막 결제: {new Date(customerInfo.lastPaymentDate).toLocaleDateString()}
                          </small>
                        )}
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      )}

      {/* 결제 컴포넌트 */}
      {showPayment && (
        <Row className="mb-5">
          <Col>
            <Card>
              <Card.Header>
                <h5 className="mb-0">결제 진행</h5>
              </Card.Header>
              <Card.Body>
                <SubscriptionPayment
                  customerId={customerInfo?.id}
                  customerEmail={customerInfo?.email}
                  customerName={customerInfo?.name}
                  subscriptionPlan={subscriptionPlan}
                  onPaymentComplete={handlePaymentComplete}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* 구독 관리 도구 */}
      {customerInfo?.isPremium && (
        <Row className="mb-5">
          <Col>
            <Card>
              <Card.Header>
                <h5 className="mb-0">구독 관리 도구</h5>
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col md={3}>
                    <div className="d-grid">
                      <Button 
                        variant="outline-primary" 
                        onClick={handleChangePaymentMethod}
                        disabled={isLoading}
                      >
                        <i className="fas fa-credit-card me-2"></i>
                        {isLoading ? '처리중...' : '결제 수단 변경'}
                      </Button>
                    </div>
                  </Col>
                  
                  {customerInfo?.subscriptionStatus === 'active' ? (
                    <>
                      <Col md={3}>
                        <div className="d-grid">
                          <Button 
                            variant="outline-danger" 
                            onClick={handleCancelSubscription}
                            disabled={isLoading}
                          >
                            <i className="fas fa-times me-2"></i>
                            {isLoading ? '처리중...' : '구독 취소'}
                          </Button>
                        </div>
                      </Col>
                    </>
                  ) : customerInfo?.subscriptionStatus === 'cancelled' ? (
                    <>
                      {/* 취소철회 가능한 경우 */}
                      {!(customerInfo?.nextBillingDate && new Date(customerInfo.nextBillingDate) <= new Date()) ? (
                        <Col md={3}>
                          <div className="d-grid">
                            <Button 
                              variant="outline-success" 
                              onClick={handleReactivateSubscription}
                              disabled={isLoading}
                            >
                              <i className="fas fa-undo me-2"></i>
                              {isLoading ? '처리중...' : '취소철회'}
                            </Button>
                          </div>
                        </Col>
                      ) : (
                        /* 취소철회 불가능한 경우 - 새 구독 시작 버튼 */
                        <Col md={3}>
                          <div className="d-grid">
                            <Button 
                              variant="success" 
                              onClick={() => setShowPayment(true)}
                              disabled={isLoading}
                            >
                              <i className="fas fa-plus me-2"></i>
                              {isLoading ? '처리중...' : '새 구독 시작'}
                            </Button>
                          </div>
                        </Col>
                      )}
                    </>
                  ) : customerInfo?.subscriptionStatus === 'suspended' ? (
                    <>
                      <Col md={6}>
                        <div className="d-grid">
                          <Button 
                            variant="outline-danger" 
                            onClick={handleCancelSubscription}
                            disabled={isLoading}
                          >
                            <i className="fas fa-times me-2"></i>
                            {isLoading ? '처리중...' : '구독 취소'}
                          </Button>
                        </div>
                      </Col>
                    </>
                  ) : (
                    <Col md={8}>
                      <div className="d-grid">
                        <Button variant="outline-secondary" disabled>
                          <i className="fas fa-info-circle me-2"></i>
                          구독이 비활성 상태입니다
                        </Button>
                      </div>
                    </Col>
                  )}
                </Row>
                
                {/* 구독 상태 안내 */}
                {customerInfo?.subscriptionStatus === 'grace_period' && (
                  <Alert variant="warning" className="mt-3">
                    <i className="fas fa-clock me-2"></i>
                    <strong>구독이 취소되었지만 유예 기간 중입니다.</strong> 
                    {customerInfo?.gracePeriodEndDate && (
                      <span> 유예 기간은 {new Date(customerInfo.gracePeriodEndDate).toLocaleDateString('ko-KR')}까지입니다.</span>
                    )}
                    유예 기간 동안은 프리미엄 기능을 계속 사용할 수 있습니다.
                  </Alert>
                )}
                
                {customerInfo?.subscriptionStatus === 'cancelled' && (
                  <Alert variant="warning" className="mt-3">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    <strong>구독이 취소되었습니다.</strong> 
                    {customerInfo?.nextBillingDate && new Date(customerInfo.nextBillingDate) > new Date() ? (
                      <span> 다음 결제일({new Date(customerInfo.nextBillingDate).toLocaleDateString('ko-KR')}) 이전까지 취소철회가 가능합니다.</span>
                    ) : (
                      <span> 다음 결제일이 지나서 취소철회가 불가능합니다. 프리미엄 기능을 사용하려면 새로운 구독을 시작하세요.</span>
                    )}
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* 구독 내역 */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">구독 내역</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>날짜</th>
                    <th>플랜</th>
                    <th>금액</th>
                    <th>상태</th>
                    <th>결제 방법</th>
                  </tr>
                </thead>
                <tbody>
                  {customerInfo?.isPremium ? (
                    <tr>
                      <td>
                        {customerInfo?.subscriptionStartDate 
                          ? new Date(customerInfo.subscriptionStartDate).toLocaleDateString()
                          : '-'
                        }
                      </td>
                      <td>
                        <Badge bg="success">프리미엄</Badge>
                      </td>
                      <td>₩80,000</td>
                      <td>
                        <Badge bg="success">완료</Badge>
                      </td>
                      <td>정기구독</td>
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center text-muted">
                        구독 내역이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SubscriptionManagement; 