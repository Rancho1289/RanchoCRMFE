import React, { useState } from 'react';
import { Modal, Table, Badge, Button, Pagination, Card, Row, Col, Alert } from 'react-bootstrap';
import { 
    FaHistory, 
    FaHome, 
    FaMapMarkerAlt, 
    FaMoneyBillWave, 
    FaUser, 
    FaCalendarAlt,
    FaEdit,
    FaUserPlus,
    FaInfoCircle,
    FaCar,
    FaDog
} from 'react-icons/fa';

const PropertyHistoryModal = ({ showModal, onHide, property }) => {
    // 페이지네이션 상태
    const [modificationHistoryPage, setModificationHistoryPage] = useState(1);
    const [customerHistoryPage, setCustomerHistoryPage] = useState(1);
    const itemsPerPage = 2; // 페이지당 아이템 수 증가

    // 모달이 닫힐 때 페이지네이션 상태 초기화
    const handleClose = () => {
        setModificationHistoryPage(1);
        setCustomerHistoryPage(1);
        onHide();
    };

    // 날짜 포맷팅 함수
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // 페이지네이션 컴포넌트 생성 함수
    const createPagination = (currentPage, totalPages, onPageChange) => {
        const items = [];
        const pagesPerGroup = 5; // 5개씩 묶음
        
        // 현재 그룹 계산
        const currentGroup = Math.ceil(currentPage / pagesPerGroup);
        const totalGroups = Math.ceil(totalPages / pagesPerGroup);
        
        // 그룹의 시작과 끝 페이지 계산
        const groupStartPage = (currentGroup - 1) * pagesPerGroup + 1;
        const groupEndPage = Math.min(currentGroup * pagesPerGroup, totalPages);
        
        // 맨 처음으로 (<<)
        items.push(
            <Pagination.First
                key="first"
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
                className="border-0"
                title="맨 처음"
            >
                ≪
            </Pagination.First>
        );
        
        // 이전 그룹으로 (<)
        items.push(
            <Pagination.Prev
                key="prevGroup"
                onClick={() => onPageChange(Math.max(1, groupStartPage - 1))}
                disabled={currentGroup === 1}
                className="border-0"
                title="이전 그룹"
            >
                &lt;
            </Pagination.Prev>
        );

        // 현재 그룹의 페이지 번호들
        for (let page = groupStartPage; page <= groupEndPage; page++) {
            items.push(
                <Pagination.Item
                    key={page}
                    active={page === currentPage}
                    onClick={() => onPageChange(page)}
                    className="border-0"
                >
                    {page}
                </Pagination.Item>
            );
        }

        // 다음 그룹으로 (>)
        items.push(
            <Pagination.Next
                key="nextGroup"
                onClick={() => onPageChange(Math.min(totalPages, groupEndPage + 1))}
                disabled={currentGroup === totalGroups}
                className="border-0"
                title="다음 그룹"
            >
                &gt;
            </Pagination.Next>
        );
        
        // 맨 마지막으로 (>>)
        items.push(
            <Pagination.Last
                key="last"
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="border-0"
                title="맨 마지막"
            >
                ≫
            </Pagination.Last>
        );

        return items;
    };

    // 현재 페이지의 데이터 계산 (최신순으로 정렬)
    const getCurrentPageData = (data, currentPage) => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        
        // 최신순으로 정렬 (날짜 기준 내림차순)
        const sortedData = [...data].sort((a, b) => {
            // customerHistory는 changeDate 필드 사용
            // modificationHistory는 modifiedAt 필드 사용
            const dateA = new Date(a.changeDate || a.modifiedAt || a.createdAt);
            const dateB = new Date(b.changeDate || b.modifiedAt || b.createdAt);
            return dateB - dateA; // 최신이 먼저 오도록 내림차순
        });
        
        return sortedData.slice(startIndex, endIndex);
    };

    // customerHistory 전용 정렬 함수 (최신순)
    const getCustomerHistoryData = (data, currentPage) => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        
        // changeDate 기준으로 최신순 정렬 (같은 초 단위 시간이면 소유자 변경 우선, 그 다음 _id)
        const sortedData = [...data].sort((a, b) => {
            const dateA = new Date(a.changeDate);
            const dateB = new Date(b.changeDate);
            
            // 초 단위로 비교 (밀리초 무시)
            const timeA = Math.floor(dateA.getTime() / 1000);
            const timeB = Math.floor(dateB.getTime() / 1000);
            
            // 같은 초 단위 시간이면 소유자 변경을 우선으로 정렬
            if (timeA === timeB) {
                // 소유자 변경이 소유자 해제보다 우선
                if (a.changeType === '소유자 변경' && b.changeType === '소유자 해제') {
                    return -1; // a가 먼저
                }
                if (a.changeType === '소유자 해제' && b.changeType === '소유자 변경') {
                    return 1; // b가 먼저
                }
                // 같은 타입이면 _id로 정렬 (최신 _id가 먼저)
                return b._id.localeCompare(a._id);
            }
            
            return dateB - dateA; // 최신이 먼저 오도록 내림차순
        });
        
        
        return sortedData.slice(startIndex, endIndex);
    };

    // 총 페이지 수 계산
    const getTotalPages = (data) => {
        return Math.ceil(data.length / itemsPerPage);
    };

    // 배지 색상 결정 함수
    const getModificationBadgeColor = (type) => {
        switch (type) {
            case '계약등록': return 'primary';
            case '계약수정': return 'info';
            case '상태변경': return 'warning';
            case '정보수정': return 'secondary';
            case '소유자변경': return 'success';
            default: return 'light';
        }
    };

    // 매물 타입 표시 함수
    const getPropertyTypeDisplay = (type) => {
        if (Array.isArray(type)) {
            return type.map(t => (
                <Badge key={t} bg="outline-primary" className="me-1">
                    {t}
                </Badge>
            ));
        }
        return <Badge bg="outline-primary">{type}</Badge>;
    };

    return (
        <Modal show={showModal} onHide={handleClose} size="xl" centered>
            <Modal.Header closeButton className="bg-primary text-white">
                <Modal.Title className="d-flex align-items-center fw-bold fs-4 text-white" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
                    <FaHistory className="me-2" />
                    매물 히스토리
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-0">
                {property ? (
                    <div>
                        {/* 매물 기본 정보 카드 */}
                        <Card className="border-0 shadow-sm mb-4">
                            <Card.Header className="bg-light">
                                <h5 className="mb-0 d-flex align-items-center">
                                    <FaHome className="me-2 text-primary" />
                                    매물 정보
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col md={6}>
                                        <div className="mb-3">
                                            <h6 className="text-muted mb-1">매물명</h6>
                                            <p className="mb-0 fw-bold">{property.title}</p>
                                        </div>
                                        <div className="mb-3">
                                            <h6 className="text-muted mb-1">유형</h6>
                                            <div>{getPropertyTypeDisplay(property.type)}</div>
                                        </div>
                                        <div className="mb-3">
                                            <h6 className="text-muted mb-1">가격</h6>
                                            <p className="mb-0 text-success fw-bold">
                                                <FaMoneyBillWave className="me-1" />
                                                {property.price?.toLocaleString() || '0'}원
                                            </p>
                                        </div>
                                        <div className="mb-3">
                                            <h6 className="text-muted mb-1">면적</h6>
                                            <p className="mb-0">{property.area}㎡</p>
                                        </div>
                                    </Col>
                                    <Col md={6}>
                                        <div className="mb-3">
                                            <h6 className="text-muted mb-1">방/욕실</h6>
                                            <p className="mb-0">{property.rooms} / {property.bathrooms}</p>
                                        </div>
                                        <div className="mb-3">
                                            <h6 className="text-muted mb-1">주소</h6>
                                            <p className="mb-0">
                                                <FaMapMarkerAlt className="me-1 text-danger" />
                                                {property.address}
                                            </p>
                                        </div>
                                        <div className="mb-3">
                                            <h6 className="text-muted mb-1">등록일</h6>
                                            <p className="mb-0">
                                                <FaCalendarAlt className="me-1 text-info" />
                                                {formatDate(property.createdAt)}
                                            </p>
                                        </div>
                                        <div className="mb-3">
                                            <h6 className="text-muted mb-1">게시자</h6>
                                            <p className="mb-0">
                                                <FaUser className="me-1 text-primary" />
                                                {property.publisher?.name || property.publisher?.nickname || '알 수 없음'}
                                            </p>
                                        </div>
                                    </Col>
                                </Row>
                                
                                {/* 편의시설 */}
                                <div className="mt-3">
                                    <h6 className="text-muted mb-2">편의시설</h6>
                                    <Row>
                                        <Col md={4}>
                                            <div className="d-flex align-items-center mb-2">
                                                <FaCar className="me-2 text-muted" />
                                                <span>주차: {property.parking || '별도문의'}</span>
                                            </div>
                                        </Col>
                                        <Col md={4}>
                                            <div className="d-flex align-items-center mb-2">
                                                <FaDog className="me-2 text-muted" />
                                                <span>애완동물: {property.pets || '별도문의'}</span>
                                            </div>
                                        </Col>
                                        <Col md={4}>
                                            <div className="d-flex align-items-center mb-2">
                                                <span className="me-2 text-muted">🛗</span>
                                                <span>엘리베이터: {property.elevator || '별도문의'}</span>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>

                                {property.specialNotes && (
                                    <div className="mt-3">
                                        <h6 className="text-muted mb-2">특이사항</h6>
                                        <Alert variant="info" className="mb-0">
                                            <FaInfoCircle className="me-2" />
                                            {property.specialNotes}
                                        </Alert>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>

                        {/* 매물 수정 히스토리 */}
                        <Card className="border-0 shadow-sm mb-4">
                            <Card.Header className="bg-light">
                                <h5 className="mb-0 d-flex align-items-center">
                                    <FaEdit className="me-2 text-warning" />
                                    매물 수정 히스토리
                                    {property.modificationHistory && (
                                        <Badge bg="secondary" className="ms-2">
                                            {property.modificationHistory.length}건
                                        </Badge>
                                    )}
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                {property.modificationHistory && property.modificationHistory.length > 0 ? (
                                    <>
                                        <div className="table-responsive">
                                            <Table hover className="mb-0">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>변경일시</th>
                                                        <th>수정유형</th>
                                                        <th>수정자</th>
                                                        <th>상세정보</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {getCurrentPageData(property.modificationHistory, modificationHistoryPage).map((history, index) => (
                                                        <tr key={index}>
                                                            <td>
                                                                <small className="text-muted">
                                                                    {formatDate(history.modifiedAt || history.changeDate)}
                                                                </small>
                                                            </td>
                                                            <td>
                                                                <Badge bg={getModificationBadgeColor(history.modificationType)}>
                                                                    {history.modificationType || history.field || '수정'}
                                                                </Badge>
                                                            </td>
                                                            <td>
                                                                <div className="d-flex align-items-center">
                                                                    <FaUser className="me-1 text-muted" />
                                                                    <small>
                                                                        {history.modifiedBy?.name || history.changedBy?.name || 
                                                                         history.modifiedBy?.nickname || history.changedBy?.nickname || '알 수 없음'}
                                                                    </small>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                {history.description ? (
                                                                    <div>
                                                                        <small className="text-muted">{history.description}</small>
                                                                        {history.contractDetails && (
                                                                            <div className="mt-2 p-2 bg-light rounded">
                                                                                <small>
                                                                                    <strong>계약정보:</strong><br />
                                                                                    {history.contractDetails.contractNumber && (
                                                                                        <span className="badge bg-outline-primary me-1">
                                                                                            {history.contractDetails.contractNumber}
                                                                                        </span>
                                                                                    )}
                                                                                    {history.contractDetails.contractType && (
                                                                                        <span className="badge bg-outline-info me-1">
                                                                                            {history.contractDetails.contractType}
                                                                                        </span>
                                                                                    )}
                                                                                    <br />
                                                                                    {history.contractDetails.price && (
                                                                                        <span className="text-success">
                                                                                            가격: {history.contractDetails.price.toLocaleString()}원
                                                                                        </span>
                                                                                    )}
                                                                                    {history.contractDetails.deposit && (
                                                                                        <span className="text-info ms-2">
                                                                                            보증금: {history.contractDetails.deposit.toLocaleString()}원
                                                                                        </span>
                                                                                    )}
                                                                                    {history.contractDetails.commission && (
                                                                                        <span className="text-warning ms-2">
                                                                                            수수료: {history.contractDetails.commission.toLocaleString()}원
                                                                                        </span>
                                                                                    )}
                                                                                </small>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <small className="text-muted">상세정보 없음</small>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </div>
                                        
                                        {/* 매물 수정 히스토리 페이지네이션 */}
                                        {getTotalPages(property.modificationHistory) > 1 && (
                                            <div className="d-flex justify-content-center mt-3">
                                                <Pagination className="mb-0">
                                                    {createPagination(
                                                        modificationHistoryPage,
                                                        getTotalPages(property.modificationHistory),
                                                        setModificationHistoryPage
                                                    )}
                                                </Pagination>
                                            </div>
                                        )}
                                        
                                        <div className="text-center text-muted small mt-2">
                                            총 {property.modificationHistory.length}개 중 {((modificationHistoryPage - 1) * itemsPerPage) + 1}~{Math.min(modificationHistoryPage * itemsPerPage, property.modificationHistory.length)}개 표시
                                        </div>
                                    </>
                                ) : (
                                    <Alert variant="light" className="text-center mb-0">
                                        <FaInfoCircle className="me-2" />
                                        매물 수정 히스토리가 없습니다.
                                    </Alert>
                                )}
                            </Card.Body>
                        </Card>

                        {/* 고객 변경 히스토리 */}
                        <Card className="border-0 shadow-sm">
                            <Card.Header className="bg-light">
                                <h5 className="mb-0 d-flex align-items-center">
                                    <FaUserPlus className="me-2 text-success" />
                                    고객 변경 히스토리
                                    {property.customerHistory && (
                                        <Badge bg="secondary" className="ms-2">
                                            {property.customerHistory.length}건
                                        </Badge>
                                    )}
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                {property.customerHistory && property.customerHistory.length > 0 ? (
                                    <>
                                        <div className="table-responsive">
                                            <Table hover className="mb-0">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>변경일시</th>
                                                        <th>고객명</th>
                                                        <th>연락처</th>
                                                        <th>변경유형</th>
                                                        <th>변경자</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {getCustomerHistoryData(property.customerHistory, customerHistoryPage).map((history, index) => (
                                                        <tr key={index}>
                                                            <td>
                                                                <small className="text-muted">
                                                                    {formatDate(history.changeDate)}
                                                                </small>
                                                            </td>
                                                            <td>
                                                                <div className="d-flex align-items-center">
                                                                    <FaUser className="me-1 text-primary" />
                                                                    <span>{history.customerName}</span>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <small className="text-muted">{history.customerPhone}</small>
                                                            </td>
                                                            <td>
                                                                <Badge bg={history.changeType === '연결' ? 'success' : 'warning'}>
                                                                    {history.changeType}
                                                                </Badge>
                                                            </td>
                                                            <td>
                                                                <small>
                                                                    {history.changedBy?.name || history.changedBy?.nickname || '알 수 없음'}
                                                                </small>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </div>
                                        
                                        {/* 고객 변경 히스토리 페이지네이션 */}
                                        {getTotalPages(property.customerHistory) > 1 && (
                                            <div className="d-flex justify-content-center mt-3">
                                                <Pagination className="mb-0">
                                                    {createPagination(
                                                        customerHistoryPage,
                                                        getTotalPages(property.customerHistory),
                                                        setCustomerHistoryPage
                                                    )}
                                                </Pagination>
                                            </div>
                                        )}
                                        
                                        <div className="text-center text-muted small mt-2">
                                            총 {property.customerHistory.length}개 중 {((customerHistoryPage - 1) * itemsPerPage) + 1}~{Math.min(customerHistoryPage * itemsPerPage, property.customerHistory.length)}개 표시
                                        </div>
                                    </>
                                ) : (
                                    <Alert variant="light" className="text-center mb-0">
                                        <FaInfoCircle className="me-2" />
                                        고객 변경 히스토리가 없습니다.
                                    </Alert>
                                )}
                            </Card.Body>
                        </Card>
                    </div>
                ) : (
                    <Alert variant="danger" className="text-center">
                        <FaInfoCircle className="me-2" />
                        매물 정보를 불러오는데 실패했습니다.
                    </Alert>
                )}
            </Modal.Body>
            <Modal.Footer className="bg-light">
                <Button variant="secondary" onClick={handleClose} className="px-4">
                    닫기
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default PropertyHistoryModal;