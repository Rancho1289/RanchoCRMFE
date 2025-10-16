import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Container, Row, Col, Card, Button, Table, 
  Alert, Spinner, Form, Modal, Pagination, ButtonGroup,
  InputGroup
} from 'react-bootstrap';
import { 
  FaNewspaper, FaDownload, FaEdit, FaTrash,
  FaSearch, FaPlus, FaCheck, FaExternalLinkAlt
} from 'react-icons/fa';
import newsService from '../../utils/newsService';

const NewsManagement = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 필터 상태
  const [filters, setFilters] = useState({
    searchTerm: '',
    startDate: '',
    endDate: '',
    sortBy: 'publishDate',
    sortOrder: 'desc'
  });
  
  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  
  // 모달 상태
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  
  // 통계 상태
  const [stats, setStats] = useState(null);

  // 폼 상태
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    publishDate: '',
    linkUrl: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadNews();
    loadStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage, filters]);

  const loadNews = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: filters.searchTerm,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        startDate: filters.startDate,
        endDate: filters.endDate
      };
      
      // 빈 값 제거
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await newsService.getAllNews(params);
      
      if (response.success) {
        setNews(response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalItems(response.pagination?.totalItems || 0);
      }
    } catch (error) {
      console.error('뉴스 목록 로드 오류:', error);
      toast.error('뉴스 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await newsService.getAllNews({ limit: 1000 });
      
      if (response.success) {
        const newsData = response.data || [];
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const thisWeek = newsData.filter(item => new Date(item.publishDate) >= oneWeekAgo).length;
        const thisMonth = newsData.filter(item => new Date(item.publishDate) >= oneMonthAgo).length;

        setStats({
          totalNews: newsData.length,
          thisWeek,
          thisMonth,
          activeNews: newsData.filter(item => item.isActive !== false).length
        });
      }
    } catch (error) {
      console.error('통계 로드 오류:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1); // 필터 변경 시 첫 페이지로
  };

  const handleAddNews = () => {
    setFormData({
      title: '',
      subtitle: '',
      publishDate: new Date().toISOString().slice(0, 16),
      linkUrl: ''
    });
    setSelectedNews(null);
    setShowAddModal(true);
  };

  const handleEditNews = (newsItem) => {
    setSelectedNews(newsItem);
    setFormData({
      title: newsItem.title || '',
      subtitle: newsItem.subtitle || '',
      publishDate: newsItem.publishDate ? 
        new Date(newsItem.publishDate).toISOString().slice(0, 16) : '',
      linkUrl: newsItem.linkUrl || ''
    });
    setShowEditModal(true);
  };

  const handleDeleteNews = (newsItem) => {
    setSelectedNews(newsItem);
    setShowDeleteModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const submitData = {
        ...formData,
        publishDate: new Date(formData.publishDate).toISOString()
      };

      if (selectedNews) {
        // 수정
        await newsService.updateNews(selectedNews._id, submitData);
        toast.success('뉴스가 성공적으로 수정되었습니다.');
        setShowEditModal(false);
      } else {
        // 생성
        await newsService.createNews(submitData);
        toast.success('뉴스가 성공적으로 등록되었습니다.');
        setShowAddModal(false);
      }
      
      setSelectedNews(null);
      loadNews();
      loadStats();
    } catch (error) {
      console.error('뉴스 저장 오류:', error);
      const errorMessage = error.response?.data?.message || '뉴스 저장에 실패했습니다.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await newsService.deleteNews(selectedNews._id);
      toast.success('뉴스가 성공적으로 삭제되었습니다.');
      setShowDeleteModal(false);
      loadNews();
      loadStats();
    } catch (error) {
      console.error('뉴스 삭제 오류:', error);
      const errorMessage = error.response?.data?.message || '뉴스 삭제에 실패했습니다.';
      toast.error(errorMessage);
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

  const exportToCSV = () => {
    const csvContent = [
      ['제목', '부제목', '작성날짜', '링크주소', '등록일'],
      ...news.map(item => [
        item.title,
        item.subtitle,
        formatDate(item.publishDate),
        item.linkUrl,
        formatDate(item.createdAt)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `news_${new Date().toISOString().split('T')[0]}.csv`);
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
          <p className="mt-3">뉴스 목록을 불러오는 중...</p>
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
                <FaNewspaper className="me-2 text-primary" />
                뉴스 관리
              </h2>
              <p className="text-muted mb-0">뉴스 기사를 등록하고 관리합니다</p>
            </div>
            <div className="d-flex gap-2">
              <Button variant="primary" onClick={handleAddNews}>
                <FaPlus className="me-2" />
                뉴스 등록
              </Button>
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
                <h5 className="text-primary">{stats.totalNews}</h5>
                <p className="mb-0">전체 뉴스</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h5 className="text-success">{stats.thisWeek}</h5>
                <p className="mb-0">이번 주</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h5 className="text-warning">{stats.thisMonth}</h5>
                <p className="mb-0">이번 달</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h5 className="text-info">{stats.activeNews}</h5>
                <p className="mb-0">활성 뉴스</p>
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
                <Form.Label>정렬 기준</Form.Label>
                <Form.Select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                >
                  <option value="publishDate">작성날짜</option>
                  <option value="title">제목</option>
                  <option value="createdAt">등록일</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>정렬 순서</Form.Label>
                <Form.Select
                  value={filters.sortOrder}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                >
                  <option value="desc">내림차순</option>
                  <option value="asc">오름차순</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>검색</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="제목, 부제목으로 검색"
                    value={filters.searchTerm}
                    onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  />
                  <Button variant="outline-secondary">
                    <FaSearch />
                  </Button>
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={3}>
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
          <Row className="mt-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>시작 날짜</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>종료 날짜</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* 뉴스 목록 */}
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">뉴스 목록 ({totalItems}개)</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>제목</th>
                  <th>부제목</th>
                  <th>작성날짜</th>
                  <th>링크</th>
                  <th>등록일</th>
                  <th>액션</th>
                </tr>
              </thead>
              <tbody>
                {news.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div>
                        <strong>{item.title}</strong>
                      </div>
                    </td>
                    <td>{item.subtitle || '-'}</td>
                    <td>{formatDate(item.publishDate)}</td>
                    <td>
                      <a
                        href={item.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-decoration-none"
                      >
                        <FaExternalLinkAlt className="me-1" />
                        링크 열기
                      </a>
                    </td>
                    <td>{formatDate(item.createdAt)}</td>
                    <td>
                      <ButtonGroup size="sm">
                        <Button 
                          variant="outline-warning" 
                          onClick={() => handleEditNews(item)}
                          title="수정"
                        >
                          <FaEdit />
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          onClick={() => handleDeleteNews(item)}
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
          
          {news.length === 0 && (
            <div className="text-center py-5">
              <FaNewspaper size={48} className="text-muted mb-3" />
              <h5 className="text-muted">등록된 뉴스가 없습니다</h5>
              <p className="text-muted">새로운 뉴스를 등록해보세요</p>
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

      {/* 뉴스 등록 모달 */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaPlus className="me-2" />
            뉴스 등록
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleFormSubmit}>
          <Modal.Body>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>제목 <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                    placeholder="뉴스 제목을 입력하세요"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>부제목</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="뉴스 부제목을 입력하세요 (선택사항)"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>작성날짜 <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={formData.publishDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, publishDate: e.target.value }))}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>링크주소 <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="url"
                    value={formData.linkUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkUrl: e.target.value }))}
                    required
                    placeholder="https://example.com/news"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              취소
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  등록 중...
                </>
              ) : (
                <>
                  <FaCheck className="me-2" />
                  등록
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* 뉴스 수정 모달 */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaEdit className="me-2" />
            뉴스 수정
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleFormSubmit}>
          <Modal.Body>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>제목 <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                    placeholder="뉴스 제목을 입력하세요"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>부제목</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="뉴스 부제목을 입력하세요 (선택사항)"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>작성날짜 <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={formData.publishDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, publishDate: e.target.value }))}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>링크주소 <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="url"
                    value={formData.linkUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkUrl: e.target.value }))}
                    required
                    placeholder="https://example.com/news"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              취소
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  수정 중...
                </>
              ) : (
                <>
                  <FaCheck className="me-2" />
                  수정
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* 삭제 확인 모달 */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaTrash className="me-2 text-danger" />
            뉴스 삭제 확인
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>정말로 <strong>{selectedNews?.title}</strong> 뉴스를 삭제하시겠습니까?</p>
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

export default NewsManagement;
