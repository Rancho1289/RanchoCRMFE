import React, { useState, useEffect, useMemo } from 'react';
import { 
  Container, Row, Col, Card, Badge, Button, Table, 
  Alert, Spinner, Form, Modal, Pagination, ButtonGroup,
  Dropdown, DropdownButton
} from 'react-bootstrap';
import { 
  FaHistory, FaFilter, FaDownload, FaEye, FaCalendarAlt,
  FaUser, FaCreditCard, FaCog, FaShieldAlt, FaChartBar
} from 'react-icons/fa';
import api from '../../utils/api';

const SubscriptionHistory = () => {
  const [histories, setHistories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  
  // 필터 상태
  const [filters, setFilters] = useState({
    action: '',
    status: '',
    actionGroup: '',
    startDate: '',
    endDate: '',
    userId: ''
  });
  
  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  
  // 모달 상태
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null);
  
  // 통계 상태
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadHistories();
      loadStats();
    }
  }, [currentUser, currentPage, itemsPerPage, filters]);

  const loadCurrentUser = async () => {
    try {
      const response = await api.get('/user/me');
      if (response.status === 200) {
        setCurrentUser(response.data.user);
      }
    } catch (error) {
      console.error('사용자 정보 로드 오류:', error);
      setError('사용자 정보를 불러올 수 없습니다.');
    }
  };

  const loadHistories = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...filters
      };
      
      // 빈 값 제거
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await api.get('/subscription-history/all', { params });
      
      if (response.status === 200) {
        setHistories(response.data.data.histories);
        setTotalPages(response.data.data.pagination.totalPages);
        setTotalItems(response.data.data.pagination.totalItems);
      }
    } catch (error) {
      console.error('히스토리 로드 오류:', error);
      setError('히스토리를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const params = {};
      
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const response = await api.get('/subscription-history/stats', { params });
      
      if (response.status === 200) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('통계 로드 오류:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // 필터 변경 시 첫 페이지로
  };

  const clearFilters = () => {
    setFilters({
      action: '',
      status: '',
      actionGroup: '',
      startDate: '',
      endDate: '',
      userId: ''
    });
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleShowDetail = (history) => {
    setSelectedHistory(history);
    setShowDetailModal(true);
  };

  const getActionBadge = (action) => {
    const actionConfig = {
      subscription_created: { bg: 'success', text: '구독 생성' },
      subscription_activated: { bg: 'primary', text: '구독 활성화' },
      subscription_cancelled: { bg: 'danger', text: '구독 취소' },
      subscription_suspended: { bg: 'warning', text: '구독 일시정지' },
      subscription_resumed: { bg: 'info', text: '구독 재개' },
      payment_success: { bg: 'success', text: '결제 성공' },
      payment_failed: { bg: 'danger', text: '결제 실패' },
      payment_cancelled: { bg: 'secondary', text: '결제 취소' },
      billing_key_updated: { bg: 'info', text: '빌링키 업데이트' },
      plan_changed: { bg: 'warning', text: '플랜 변경' },
      auto_renewal_enabled: { bg: 'success', text: '자동갱신 활성화' },
      auto_renewal_disabled: { bg: 'warning', text: '자동갱신 비활성화' },
      refund_processed: { bg: 'info', text: '환불 처리' },
      subscription_expired: { bg: 'secondary', text: '구독 만료' },
      manual_payment: { bg: 'primary', text: '수동 결제' },
      retry_payment: { bg: 'warning', text: '재시도 결제' },
      admin_action: { bg: 'dark', text: '관리자 액션' }
    };

    const config = actionConfig[action] || { bg: 'secondary', text: action };
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      success: { bg: 'success', text: '성공' },
      failed: { bg: 'danger', text: '실패' },
      pending: { bg: 'warning', text: '대기' },
      cancelled: { bg: 'secondary', text: '취소' }
    };

    const config = statusConfig[status] || { bg: 'secondary', text: status };
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('ko-KR');
  };

  const formatAmount = (amount) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  const exportToExcel = () => {
    // Excel 내보내기 로직 (필요시 구현)
    alert('Excel 내보내기 기능은 추후 구현 예정입니다.');
  };

  if (!currentUser || currentUser.level < 99) {
    return (
      <Container fluid>
        <Alert variant="danger">
          <h4>접근 권한이 없습니다</h4>
          <p>구독 히스토리를 조회하려면 관리자 권한이 필요합니다.</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h2><FaHistory className="me-2" />구독 히스토리 관리</h2>
          <p className="text-muted">전체 사용자의 구독 관련 모든 활동을 추적하고 관리합니다.</p>
        </Col>
      </Row>

      {/* 통계 카드 */}
      {stats && (
        <Row className="mb-4">
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <FaChartBar className="text-primary mb-2" size={24} />
                <h5>총 기록</h5>
                <h3 className="text-primary">{totalItems}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <FaCreditCard className="text-success mb-2" size={24} />
                <h5>결제 성공</h5>
                <h3 className="text-success">
                  {stats.actionStats?.find(s => s._id === 'payment_success')?.successCount || 0}
                </h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <FaCog className="text-warning mb-2" size={24} />
                <h5>구독 관리</h5>
                <h3 className="text-warning">
                  {stats.actionStats?.filter(s => 
                    ['subscription_created', 'subscription_cancelled', 'subscription_suspended'].includes(s._id)
                  ).reduce((sum, s) => sum + s.count, 0) || 0}
                </h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <FaShieldAlt className="text-info mb-2" size={24} />
                <h5>설정 변경</h5>
                <h3 className="text-info">
                  {stats.actionStats?.filter(s => 
                    ['billing_key_updated', 'plan_changed', 'auto_renewal_enabled', 'auto_renewal_disabled'].includes(s._id)
                  ).reduce((sum, s) => sum + s.count, 0) || 0}
                </h3>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* 필터 섹션 */}
      <Card className="mb-4">
        <Card.Header>
          <FaFilter className="me-2" />필터 옵션
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={2}>
              <Form.Group>
                <Form.Label>액션 그룹</Form.Label>
                <Form.Select
                  value={filters.actionGroup}
                  onChange={(e) => handleFilterChange('actionGroup', e.target.value)}
                >
                  <option value="">전체</option>
                  <option value="subscription_management">구독 관리</option>
                  <option value="payment">결제</option>
                  <option value="settings">설정</option>
                  <option value="admin">관리자</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>상태</Form.Label>
                <Form.Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">전체</option>
                  <option value="success">성공</option>
                  <option value="failed">실패</option>
                  <option value="pending">대기</option>
                  <option value="cancelled">취소</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>시작일</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>종료일</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>사용자 ID</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="사용자 ID"
                  value={filters.userId}
                  onChange={(e) => handleFilterChange('userId', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={2} className="d-flex align-items-end">
              <ButtonGroup>
                <Button variant="outline-secondary" onClick={clearFilters}>
                  필터 초기화
                </Button>
                <Button variant="primary" onClick={loadHistories}>
                  적용
                </Button>
              </ButtonGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* 히스토리 테이블 */}
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <span>구독 히스토리 목록</span>
          <div>
            <Button variant="outline-success" onClick={exportToExcel} className="me-2">
              <FaDownload className="me-1" />Excel 내보내기
            </Button>
            <Form.Select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
              style={{ width: 'auto', display: 'inline-block' }}
            >
              <option value={20}>20개씩</option>
              <option value={50}>50개씩</option>
              <option value={100}>100개씩</option>
            </Form.Select>
          </div>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center p-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">히스토리를 불러오는 중...</p>
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : histories.length === 0 ? (
            <div className="text-center p-5">
              <FaHistory size={48} className="text-muted mb-3" />
              <h5>히스토리가 없습니다</h5>
              <p className="text-muted">선택한 필터 조건에 맞는 히스토리가 없습니다.</p>
            </div>
          ) : (
            <>
              <Table striped bordered hover responsive>
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>사용자</th>
                    <th>액션</th>
                    <th>설명</th>
                    <th>금액</th>
                    <th>상태</th>
                    <th>날짜</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {histories.map((history, index) => (
                    <tr key={history._id}>
                      <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td>
                        <div>
                          <strong>{history.userId?.name || '알 수 없음'}</strong>
                          <br />
                          <small className="text-muted">
                            {history.userId?.email || '이메일 없음'}
                          </small>
                          {history.userId?.companyName && (
                            <>
                              <br />
                              <small className="text-muted">
                                {history.userId.companyName}
                              </small>
                            </>
                          )}
                        </div>
                      </td>
                      <td>{getActionBadge(history.action)}</td>
                      <td>
                        <div className="text-truncate" style={{ maxWidth: '200px' }} title={history.description}>
                          {history.description}
                        </div>
                      </td>
                      <td>{formatAmount(history.amount)}</td>
                      <td>{getStatusBadge(history.status)}</td>
                      <td>
                        <div>
                          <FaCalendarAlt className="me-1" />
                          {formatDate(history.createdAt)}
                        </div>
                      </td>
                      <td>
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => handleShowDetail(history)}
                        >
                          <FaEye className="me-1" />상세
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <Row className="mt-3">
                  <Col className="d-flex justify-content-center">
                    <Pagination>
                      <Pagination.First 
                        onClick={() => handlePageChange(1)} 
                        disabled={currentPage === 1} 
                      />
                      <Pagination.Prev 
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))} 
                        disabled={currentPage === 1} 
                      />
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                        if (pageNum > totalPages) return null;
                        return (
                          <Pagination.Item 
                            key={pageNum} 
                            active={pageNum === currentPage} 
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </Pagination.Item>
                        );
                      })}
                      <Pagination.Next 
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} 
                        disabled={currentPage === totalPages} 
                      />
                      <Pagination.Last 
                        onClick={() => handlePageChange(totalPages)} 
                        disabled={currentPage === totalPages} 
                      />
                    </Pagination>
                  </Col>
                </Row>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* 상세 정보 모달 */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>히스토리 상세 정보</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedHistory && (
            <div>
              <Row>
                <Col md={6}>
                  <h6>기본 정보</h6>
                  <p><strong>액션:</strong> {getActionBadge(selectedHistory.action)}</p>
                  <p><strong>상태:</strong> {getStatusBadge(selectedHistory.status)}</p>
                  <p><strong>설명:</strong> {selectedHistory.description}</p>
                  <p><strong>생성일:</strong> {formatDate(selectedHistory.createdAt)}</p>
                </Col>
                <Col md={6}>
                  <h6>결제 정보</h6>
                  <p><strong>금액:</strong> {formatAmount(selectedHistory.amount)}</p>
                  <p><strong>통화:</strong> {selectedHistory.currency}</p>
                  {/* <p><strong>주문ID:</strong> {selectedHistory.orderId || '-'}</p> */}
                </Col>
              </Row>
              <hr />
              <Row>
                <Col md={6}>
                  <h6>사용자 정보</h6>
                  <p><strong>이름:</strong> {selectedHistory.userId?.name || '-'}</p>
                  <p><strong>이메일:</strong> {selectedHistory.userId?.email || '-'}</p>
                  <p><strong>회사:</strong> {selectedHistory.userId?.companyName || '-'}</p>
                </Col>
                <Col md={6}>
                  <h6>구독 정보</h6>
                  <p><strong>플랜:</strong> {selectedHistory.subscriptionId?.planName || '-'}</p>
                  <p><strong>상태:</strong> {selectedHistory.subscriptionId?.status || '-'}</p>
                  <p><strong>빌링키:</strong> {selectedHistory.subscriptionId?.billingKey || '-'}</p>
                </Col>
              </Row>
              {selectedHistory.errorMessage && (
                <>
                  <hr />
                  <Row>
                    <Col>
                      <h6>오류 정보</h6>
                      <p className="text-danger">{selectedHistory.errorMessage}</p>
                    </Col>
                  </Row>
                </>
              )}
              {Object.keys(selectedHistory.metadata).length > 0 && (
                <>
                  <hr />
                  <Row>
                    <Col>
                      <h6>추가 정보</h6>
                      <pre className="bg-light p-2 rounded">
                        {JSON.stringify(selectedHistory.metadata, null, 2)}
                      </pre>
                    </Col>
                  </Row>
                </>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            닫기
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SubscriptionHistory; 