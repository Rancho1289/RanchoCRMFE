import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Spinner, Row, Col, Badge, ListGroup } from 'react-bootstrap';
import { FaSms, FaUsers, FaClock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import api from '../../utils/api';

const BulkSMSModal = ({ show, onHide, selectedCustomers, onSuccess }) => {
    const [message, setMessage] = useState('');
    const [isScheduled, setIsScheduled] = useState(false);
    const [scheduledAt, setScheduledAt] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [userPhone, setUserPhone] = useState('');
    const [validCustomers, setValidCustomers] = useState([]);

    // 사용자 정보 조회
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await api.get('/user/profile');
                if (response.data.success) {
                    setUserPhone(response.data.data.phone || '');
                }
            } catch (error) {
                console.error('사용자 정보 조회 오류:', error);
            }
        };

        if (show) {
            fetchUserInfo();
        }
    }, [show]);

    // 유효한 고객 필터링
    useEffect(() => {
        if (show && selectedCustomers) {
            const valid = selectedCustomers.filter(customer => customer.phone);
            setValidCustomers(valid);
        }
    }, [show, selectedCustomers]);

    // 모달이 열릴 때 초기화
    useEffect(() => {
        if (show) {
            setMessage('');
            setIsScheduled(false);
            setScheduledAt('');
            setError('');
            setSuccess('');
        }
    }, [show]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!message.trim()) {
            setError('메시지를 입력해주세요.');
            return;
        }

        if (isScheduled && !scheduledAt) {
            setError('예약 시간을 선택해주세요.');
            return;
        }

        if (!userPhone) {
            setError('발신자 연락처가 등록되지 않았습니다. 프로필에서 연락처를 등록해주세요.');
            return;
        }

        if (validCustomers.length === 0) {
            setError('전송 가능한 고객이 없습니다.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await api.post('/sms/send-bulk', {
                customerIds: validCustomers.map(customer => customer._id),
                message: message.trim(),
                isScheduled,
                scheduledAt: isScheduled ? scheduledAt : null
            });

            if (response.data.success) {
                setSuccess(response.data.message);
                setTimeout(() => {
                    onSuccess && onSuccess();
                    onHide();
                }, 2000);
            } else {
                setError(response.data.message || '일괄 문자 전송에 실패했습니다.');
            }
        } catch (error) {
            console.error('일괄 SMS 전송 오류:', error);
            setError(error.response?.data?.message || '일괄 문자 전송 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    <FaSms className="me-2" />
                    일괄 문자 전송
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && (
                    <Alert variant="danger" className="mb-3">
                        {error}
                    </Alert>
                )}
                
                {success && (
                    <Alert variant="success" className="mb-3">
                        {success}
                    </Alert>
                )}

                {/* 발신자 정보 */}
                <Row className="mb-3">
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>발신자</Form.Label>
                            <Form.Control
                                type="text"
                                value={userPhone || '연락처 미등록'}
                                disabled
                                className={!userPhone ? 'text-danger' : ''}
                            />
                            {!userPhone && (
                                <Form.Text className="text-danger">
                                    프로필에서 연락처를 등록해주세요.
                                </Form.Text>
                            )}
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>수신자 수</Form.Label>
                            <Form.Control
                                type="text"
                                value={`${validCustomers.length}명`}
                                disabled
                            />
                        </Form.Group>
                    </Col>
                </Row>

                {/* 수신자 목록 */}
                <Form.Group className="mb-3">
                    <Form.Label>수신자 목록</Form.Label>
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        <ListGroup variant="flush">
                            {validCustomers.map((customer, index) => (
                                <ListGroup.Item key={customer._id} className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong>{customer.name}</strong>
                                        <br />
                                        <small className="text-muted">{customer.phone}</small>
                                    </div>
                                    <Badge bg="success">전송 가능</Badge>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </div>
                </Form.Group>

                {/* 메시지 입력 */}
                <Form.Group className="mb-3">
                    <Form.Label>메시지 내용</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="메시지를 입력하세요..."
                        maxLength={2000}
                        disabled={!userPhone}
                    />
                    <Form.Text className="text-muted">
                        {message.length}/2000자
                    </Form.Text>
                </Form.Group>

                {/* 예약 전송 옵션 */}
                <Form.Group className="mb-3">
                    <Form.Check
                        type="checkbox"
                        id="isScheduled"
                        label="예약 전송"
                        checked={isScheduled}
                        onChange={(e) => setIsScheduled(e.target.checked)}
                        disabled={!userPhone}
                    />
                </Form.Group>

                {isScheduled && (
                    <Form.Group className="mb-3">
                        <Form.Label>예약 시간</Form.Label>
                        <Form.Control
                            type="datetime-local"
                            value={scheduledAt}
                            onChange={(e) => setScheduledAt(e.target.value)}
                            min={new Date().toISOString().slice(0, 16)}
                        />
                    </Form.Group>
                )}

                {/* 일괄 문자 전송 안내 */}
                <Alert variant="info" className="mb-0">
                    <strong>안내사항:</strong>
                    <ul className="mb-0 mt-2">
                        <li>선택된 {validCustomers.length}명의 고객에게 문자를 전송합니다.</li>
                        <li>문자 전송은 발신자 연락처를 기준으로 전송됩니다.</li>
                        <li>문자 전송 비용은 발신자에게 부과됩니다.</li>
                        <li>예약 전송은 지정된 시간에 자동으로 전송됩니다.</li>
                        <li>문자 전송 이력은 SMS 관리에서 확인할 수 있습니다.</li>
                    </ul>
                </Alert>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide} disabled={loading}>
                    취소
                </Button>
                <Button 
                    variant="primary" 
                    onClick={handleSubmit}
                    disabled={loading || !userPhone || !message.trim() || validCustomers.length === 0}
                >
                    {loading ? (
                        <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            전송 중...
                        </>
                    ) : (
                        <>
                            <FaSms className="me-2" />
                            {isScheduled ? '예약 전송' : '일괄 전송'}
                        </>
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default BulkSMSModal;
