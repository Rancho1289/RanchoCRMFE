import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Spinner, Row, Col, Badge } from 'react-bootstrap';
import { FaSms, FaClock, FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa';
import api from '../../utils/api';

const SMSModal = ({ show, onHide, customer, onSuccess }) => {
    const [message, setMessage] = useState('');
    const [isScheduled, setIsScheduled] = useState(false);
    const [scheduledAt, setScheduledAt] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [userPhone, setUserPhone] = useState('');

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

        setLoading(true);
        setError('');

        try {
            const response = await api.post('/sms/send', {
                customerId: customer._id,
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
                setError(response.data.message || '문자 전송에 실패했습니다.');
            }
        } catch (error) {
            console.error('SMS 전송 오류:', error);
            setError(error.response?.data?.message || '문자 전송 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
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

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    <FaSms className="me-2" />
                    문자 전송
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
                            <Form.Label>수신자</Form.Label>
                            <Form.Control
                                type="text"
                                value={`${customer?.name} (${customer?.phone})`}
                                disabled
                            />
                        </Form.Group>
                    </Col>
                </Row>

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

                {/* 문자 전송 안내 */}
                <Alert variant="info" className="mb-0">
                    <strong>안내사항:</strong>
                    <ul className="mb-0 mt-2">
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
                    disabled={loading || !userPhone || !message.trim()}
                >
                    {loading ? (
                        <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            전송 중...
                        </>
                    ) : (
                        <>
                            <FaSms className="me-2" />
                            {isScheduled ? '예약 전송' : '문자 전송'}
                        </>
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default SMSModal;
