import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Spinner, Alert, Row, Col, Form, Pagination } from 'react-bootstrap';
import { FaSms, FaClock, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaTrash, FaFilter } from 'react-icons/fa';
import api from '../../utils/api';

const SMSHistory = () => {
    const [smsHistory, setSmsHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [statusFilter, setStatusFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchSMSHistory = async (page = 1) => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20'
            });

            if (statusFilter) params.append('status', statusFilter);
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const response = await api.get(`/sms/history?${params.toString()}`);

            if (response.data.success) {
                setSmsHistory(response.data.data.smsHistory);
                setTotalPages(response.data.data.pagination.totalPages);
                setTotalItems(response.data.data.pagination.totalItems);
                setCurrentPage(page);
            }
        } catch (err) {
            console.error('SMS 이력 조회 오류:', err);
            setError('SMS 이력을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSMSHistory();
    }, [statusFilter, startDate, endDate]);

    const handlePageChange = (page) => {
        fetchSMSHistory(page);
    };

    const handleCancelSMS = async (smsId) => {
        if (!window.confirm('이 SMS를 취소하시겠습니까?')) {
            return;
        }

        try {
            const response = await api.delete(`/sms/cancel/${smsId}`);
            if (response.data.success) {
                fetchSMSHistory(currentPage);
            } else {
                alert(response.data.message || 'SMS 취소에 실패했습니다.');
            }
        } catch (error) {
            console.error('SMS 취소 오류:', error);
            alert('SMS 취소 중 오류가 발생했습니다.');
        }
    };

    const getStatusIcon = (status) => {
        const icons = {
            '대기': <FaClock className="text-secondary" />,
            '전송중': <Spinner animation="border" size="sm" className="text-warning" />,
            '전송완료': <FaCheckCircle className="text-success" />,
            '전송실패': <FaExclamationTriangle className="text-danger" />,
            '취소': <FaTimesCircle className="text-dark" />
        };
        return icons[status] || <FaClock className="text-secondary" />;
    };

    const getStatusColor = (status) => {
        const colors = {
            '대기': 'secondary',
            '전송중': 'warning',
            '전송완료': 'success',
            '전송실패': 'danger',
            '취소': 'dark'
        };
        return colors[status] || 'secondary';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('ko-KR');
    };

    const formatPhoneNumber = (phone) => {
        if (!phone) return '-';
        const cleaned = phone.replace(/[^0-9]/g, '');
        if (cleaned.length === 11) {
            return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
        } else if (cleaned.length === 10) {
            return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
        }
        return phone;
    };

    return (
        <div>
            <Card className="mb-4">
                <Card.Header>
                    <h5 className="mb-0">
                        <FaSms className="me-2" />
                        SMS 전송 이력
                    </h5>
                </Card.Header>
                <Card.Body>
                    {/* 필터 */}
                    <Row className="mb-3">
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>상태</Form.Label>
                                <Form.Select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="">전체</option>
                                    <option value="대기">대기</option>
                                    <option value="전송중">전송중</option>
                                    <option value="전송완료">전송완료</option>
                                    <option value="전송실패">전송실패</option>
                                    <option value="취소">취소</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>시작일</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>종료일</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={3} className="d-flex align-items-end">
                            <Button
                                variant="outline-secondary"
                                onClick={() => {
                                    setStatusFilter('');
                                    setStartDate('');
                                    setEndDate('');
                                }}
                            >
                                <FaFilter className="me-1" />
                                초기화
                            </Button>
                        </Col>
                    </Row>

                    {error && (
                        <Alert variant="danger">
                            {error}
                        </Alert>
                    )}

                    {loading ? (
                        <div className="text-center py-4">
                            <Spinner animation="border" />
                            <p className="mt-2">SMS 이력을 불러오는 중...</p>
                        </div>
                    ) : smsHistory.length === 0 ? (
                        <div className="text-center py-4">
                            <FaSms size={48} className="text-muted mb-3" />
                            <p className="text-muted">전송된 SMS가 없습니다.</p>
                        </div>
                    ) : (
                        <>
                            <Table responsive hover>
                                <thead className="table-light">
                                    <tr>
                                        <th>상태</th>
                                        <th>수신자</th>
                                        <th>연락처</th>
                                        <th>메시지</th>
                                        <th>전송일시</th>
                                        <th>결과</th>
                                        <th>관리</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {smsHistory.map((sms) => (
                                        <tr key={sms._id}>
                                            <td>
                                                <Badge bg={getStatusColor(sms.status)}>
                                                    {getStatusIcon(sms.status)}
                                                    <span className="ms-1">{sms.status}</span>
                                                </Badge>
                                            </td>
                                            <td>
                                                <strong>{sms.recipientName}</strong>
                                            </td>
                                            <td>
                                                {formatPhoneNumber(sms.recipientPhone)}
                                            </td>
                                            <td>
                                                <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {sms.message}
                                                </div>
                                            </td>
                                            <td>
                                                {formatDate(sms.createdAt)}
                                            </td>
                                            <td>
                                                {sms.result?.messageId && (
                                                    <small className="text-muted">
                                                        ID: {sms.result.messageId}
                                                    </small>
                                                )}
                                                {sms.result?.errorMessage && (
                                                    <small className="text-danger">
                                                        {sms.result.errorMessage}
                                                    </small>
                                                )}
                                            </td>
                                            <td>
                                                {sms.status === '대기' && (
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => handleCancelSMS(sms._id)}
                                                    >
                                                        <FaTrash className="me-1" />
                                                        취소
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>

                            {/* 페이지네이션 */}
                            {totalPages > 1 && (
                                <div className="d-flex justify-content-center">
                                    <Pagination>
                                        <Pagination.First
                                            onClick={() => handlePageChange(1)}
                                            disabled={currentPage === 1}
                                        />
                                        <Pagination.Prev
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        />
                                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                                            .filter(page => 
                                                page === 1 || 
                                                page === totalPages || 
                                                Math.abs(page - currentPage) <= 2
                                            )
                                            .map((page, index, array) => (
                                                <React.Fragment key={page}>
                                                    {index > 0 && array[index - 1] !== page - 1 && (
                                                        <Pagination.Ellipsis />
                                                    )}
                                                    <Pagination.Item
                                                        active={page === currentPage}
                                                        onClick={() => handlePageChange(page)}
                                                    >
                                                        {page}
                                                    </Pagination.Item>
                                                </React.Fragment>
                                            ))}
                                        <Pagination.Next
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                        />
                                        <Pagination.Last
                                            onClick={() => handlePageChange(totalPages)}
                                            disabled={currentPage === totalPages}
                                        />
                                    </Pagination>
                                </div>
                            )}
                        </>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default SMSHistory;
