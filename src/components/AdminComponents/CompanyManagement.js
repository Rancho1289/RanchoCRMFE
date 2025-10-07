import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Badge, Button, Table, 
  Alert, Spinner, Form, Modal, Pagination, ButtonGroup,
  Dropdown, DropdownButton, InputGroup
} from 'react-bootstrap';
import { 
  FaBuilding, FaFilter, FaDownload, FaEye, FaCalendarAlt,
  FaUser, FaMapMarkerAlt, FaPhone, FaEnvelope, FaEdit, FaTrash,
  FaSearch, FaPlus, FaCheck, FaTimes, FaFileAlt
} from 'react-icons/fa';
import api from '../../utils/api';

const CompanyManagement = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  
  // 필터 상태
  const [filters, setFilters] = useState({
    status: '',
    businessType: '',
    searchTerm: '',
    startDate: '',
    endDate: ''
  });
  
  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  
  // 모달 상태
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  
  // 통계 상태
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // 편집 폼 상태
  const [editForm, setEditForm] = useState({
    companyName: '',
    businessNumber: '',
    businessType: '',
    businessAddress: '',
    detailedAddress: '',
    representativeName: '',
    contactNumber: '',
    email: '',
    status: 'active'
  });

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadCompanies();
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

  const loadCompanies = async () => {
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

      const response = await api.get('/company/all', { params });
      
      if (response.status === 200) {
        setCompanies(response.data.data.companies);
        setTotalPages(response.data.data.pagination.totalPages);
        setTotalItems(response.data.data.pagination.totalItems);
      }
    } catch (error) {
      console.error('회사 목록 로드 오류:', error);
      setError('회사 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const params = {};
      
      // 필터가 있으면 통계에도 적용
      if (filters.status) params.status = filters.status;
      if (filters.businessType) params.businessType = filters.businessType;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const response = await api.get('/company/stats', { params });
      
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
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1); // 필터 변경 시 첫 페이지로
  };

  const handleViewDetails = (company) => {
    setSelectedCompany(company);
    setShowDetailModal(true);
  };

  const handleEditCompany = (company) => {
    setSelectedCompany(company);
    setEditForm({
      companyName: company.companyName || '',
      businessNumber: company.businessNumber || '',
      businessType: company.businessType || '',
      businessAddress: company.businessAddress || '',
      detailedAddress: company.detailedAddress || '',
      representativeName: company.representativeName || '',
      contactNumber: company.contactNumber || '',
      email: company.email || '',
      status: company.status || 'active'
    });
    setShowEditModal(true);
  };

  const handleDeleteCompany = (company) => {
    setSelectedCompany(company);
    setShowDeleteModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await api.put(`/company/${selectedCompany._id}`, editForm);
      
      if (response.status === 200) {
        setShowEditModal(false);
        loadCompanies();
        loadStats();
        alert('회사 정보가 성공적으로 수정되었습니다.');
      }
    } catch (error) {
      console.error('회사 수정 오류:', error);
      alert('회사 정보 수정에 실패했습니다.');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await api.delete(`/company/${selectedCompany._id}`);
      
      if (response.status === 200) {
        setShowDeleteModal(false);
        loadCompanies();
        loadStats();
        alert('회사가 성공적으로 삭제되었습니다.');
      }
    } catch (error) {
      console.error('회사 삭제 오류:', error);
      alert('회사 삭제에 실패했습니다.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { variant: 'success', text: '활성' },
      inactive: { variant: 'secondary', text: '비활성' },
      suspended: { variant: 'warning', text: '일시정지' },
      deleted: { variant: 'danger', text: '삭제됨' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const exportToCSV = () => {
    const csvContent = [
      ['회사명', '사업자번호', '업종', '대표자', '연락처', '이메일', '주소', '상세주소', '상태', '등록일'],
      ...companies.map(company => [
        company.companyName,
        company.businessNumber,
        company.businessType,
        company.representativeName,
        company.contactNumber,
        company.email,
        company.businessAddress,
        company.detailedAddress,
        company.status,
        formatDate(company.createdAt)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `companies_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">회사 목록을 불러오는 중...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* 헤더 */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">
                <FaBuilding className="me-2 text-primary" />
                회사 관리
              </h2>
              <p className="text-muted mb-0">등록된 회사 정보를 관리합니다</p>
            </div>
            <div className="d-flex gap-2">
              <Button variant="outline-primary" onClick={exportToCSV}>
                <FaDownload className="me-2" />
                CSV 내보내기
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* 통계 카드 */}
      {stats && (
        <Row className="mb-4">
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h5 className="text-primary">{stats.totalCompanies}</h5>
                <p className="mb-0">전체 회사</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h5 className="text-success">{stats.activeCompanies}</h5>
                <p className="mb-0">활성 회사</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h5 className="text-warning">{stats.inactiveCompanies}</h5>
                <p className="mb-0">비활성 회사</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h5 className="text-info">{stats.newThisMonth}</h5>
                <p className="mb-0">이번 달 신규</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* 필터 */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group>
                <Form.Label>상태</Form.Label>
                <Form.Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">전체</option>
                  <option value="active">활성</option>
                  <option value="inactive">비활성</option>
                  <option value="suspended">일시정지</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>업종</Form.Label>
                <Form.Select
                  value={filters.businessType}
                  onChange={(e) => handleFilterChange('businessType', e.target.value)}
                >
                  <option value="">전체</option>
                  <option value="부동산 중개업">부동산 중개업</option>
                  <option value="건설업">건설업</option>
                  <option value="IT업">IT업</option>
                  <option value="제조업">제조업</option>
                  <option value="기타">기타</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>검색</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="회사명, 사업자번호, 대표자명으로 검색"
                    value={filters.searchTerm}
                    onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  />
                  <Button variant="outline-secondary">
                    <FaSearch />
                  </Button>
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>페이지당 항목</Form.Label>
                <Form.Select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                >
                  <option value={10}>10개</option>
                  <option value={20}>20개</option>
                  <option value={50}>50개</option>
                  <option value={100}>100개</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* 회사 목록 */}
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">회사 목록 ({totalItems}개)</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>회사명</th>
                  <th>사업자번호</th>
                  <th>업종</th>
                  <th>대표자</th>
                  <th>연락처</th>
                  <th>상태</th>
                  <th>등록일</th>
                  <th>액션</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company._id}>
                    <td>
                      <div>
                        <strong>{company.companyName}</strong>
                        {company.isInitialRegistration && (
                          <Badge bg="info" className="ms-2">최초등록</Badge>
                        )}
                      </div>
                    </td>
                    <td>{company.businessNumber}</td>
                    <td>{company.businessType || '-'}</td>
                    <td>{company.representativeName || '-'}</td>
                    <td>
                      <div>
                        {company.contactNumber && (
                          <div><FaPhone className="me-1" />{company.contactNumber}</div>
                        )}
                        {company.email && (
                          <div><FaEnvelope className="me-1" />{company.email}</div>
                        )}
                      </div>
                    </td>
                    <td>{getStatusBadge(company.status)}</td>
                    <td>{formatDate(company.createdAt)}</td>
                    <td>
                      <ButtonGroup size="sm">
                        <Button 
                          variant="outline-primary" 
                          onClick={() => handleViewDetails(company)}
                          title="상세보기"
                        >
                          <FaEye />
                        </Button>
                        <Button 
                          variant="outline-warning" 
                          onClick={() => handleEditCompany(company)}
                          title="수정"
                        >
                          <FaEdit />
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          onClick={() => handleDeleteCompany(company)}
                          title="삭제"
                        >
                          <FaTrash />
                        </Button>
                      </ButtonGroup>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          
          {companies.length === 0 && (
            <div className="text-center py-5">
              <FaBuilding size={48} className="text-muted mb-3" />
              <h5 className="text-muted">등록된 회사가 없습니다</h5>
              <p className="text-muted">필터 조건을 조정해보세요</p>
            </div>
          )}
        </Card.Body>
        
        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <Card.Footer>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                총 {totalItems}개 중 {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)}개 표시
              </div>
              <Pagination>
                <Pagination.Prev 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                />
                {[...Array(totalPages)].map((_, index) => (
                  <Pagination.Item
                    key={index + 1}
                    active={currentPage === index + 1}
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                />
              </Pagination>
            </div>
          </Card.Footer>
        )}
      </Card>

      {/* 상세보기 모달 */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaBuilding className="me-2" />
            회사 상세 정보
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCompany && (
            <Row>
              <Col md={6}>
                <h6><FaBuilding className="me-2" />기본 정보</h6>
                <Table size="sm" borderless>
                  <tbody>
                    <tr>
                      <td><strong>회사명:</strong></td>
                      <td>{selectedCompany.companyName}</td>
                    </tr>
                    <tr>
                      <td><strong>사업자번호:</strong></td>
                      <td>{selectedCompany.businessNumber}</td>
                    </tr>
                    <tr>
                      <td><strong>업종:</strong></td>
                      <td>{selectedCompany.businessType || '-'}</td>
                    </tr>
                    <tr>
                      <td><strong>대표자:</strong></td>
                      <td>{selectedCompany.representativeName || '-'}</td>
                    </tr>
                    <tr>
                      <td><strong>상태:</strong></td>
                      <td>{getStatusBadge(selectedCompany.status)}</td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
              <Col md={6}>
                <h6><FaMapMarkerAlt className="me-2" />연락처 정보</h6>
                <Table size="sm" borderless>
                  <tbody>
                    <tr>
                      <td><strong>연락처:</strong></td>
                      <td>{selectedCompany.contactNumber || '-'}</td>
                    </tr>
                    <tr>
                      <td><strong>이메일:</strong></td>
                      <td>{selectedCompany.email || '-'}</td>
                    </tr>
                    <tr>
                      <td><strong>주소:</strong></td>
                      <td>{selectedCompany.businessAddress || '-'}</td>
                    </tr>
                    <tr>
                      <td><strong>상세주소:</strong></td>
                      <td>{selectedCompany.detailedAddress || '-'}</td>
                    </tr>
                    <tr>
                      <td><strong>등록일:</strong></td>
                      <td>{formatDate(selectedCompany.createdAt)}</td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            닫기
          </Button>
        </Modal.Footer>
      </Modal>

      {/* 수정 모달 */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaEdit className="me-2" />
            회사 정보 수정
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>회사명</Form.Label>
                  <Form.Control
                    type="text"
                    value={editForm.companyName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, companyName: e.target.value }))}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>사업자번호</Form.Label>
                  <Form.Control
                    type="text"
                    value={editForm.businessNumber}
                    onChange={(e) => setEditForm(prev => ({ ...prev, businessNumber: e.target.value }))}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>업종</Form.Label>
                  <Form.Control
                    type="text"
                    value={editForm.businessType}
                    onChange={(e) => setEditForm(prev => ({ ...prev, businessType: e.target.value }))}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>대표자명</Form.Label>
                  <Form.Control
                    type="text"
                    value={editForm.representativeName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, representativeName: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>연락처</Form.Label>
                  <Form.Control
                    type="text"
                    value={editForm.contactNumber}
                    onChange={(e) => setEditForm(prev => ({ ...prev, contactNumber: e.target.value }))}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>이메일</Form.Label>
                  <Form.Control
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>주소</Form.Label>
                  <Form.Control
                    type="text"
                    value={editForm.businessAddress}
                    onChange={(e) => setEditForm(prev => ({ ...prev, businessAddress: e.target.value }))}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>상세주소</Form.Label>
                  <Form.Control
                    type="text"
                    value={editForm.detailedAddress}
                    onChange={(e) => setEditForm(prev => ({ ...prev, detailedAddress: e.target.value }))}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>상태</Form.Label>
                  <Form.Select
                    value={editForm.status}
                    onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="active">활성</option>
                    <option value="inactive">비활성</option>
                    <option value="suspended">일시정지</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              취소
            </Button>
            <Button variant="primary" type="submit">
              <FaCheck className="me-2" />
              저장
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* 삭제 확인 모달 */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaTrash className="me-2 text-danger" />
            회사 삭제 확인
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>정말로 <strong>{selectedCompany?.companyName}</strong> 회사를 삭제하시겠습니까?</p>
          <Alert variant="warning">
            <strong>주의:</strong> 이 작업은 되돌릴 수 없습니다.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            취소
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            <FaTrash className="me-2" />
            삭제
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CompanyManagement;
