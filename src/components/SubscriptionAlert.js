import React from 'react';
import { Alert, Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaExclamationTriangle, FaCrown } from 'react-icons/fa';

const SubscriptionAlert = ({ user, onClose }) => {
    const navigate = useNavigate();

    const handleGoToSubscription = () => {
        navigate('/subscription');
        if (onClose) onClose();
    };

    return (
        <Container className="mt-4">
            <Alert variant="warning" className="border-0 shadow-sm">
                <div className="d-flex align-items-start">
                    <FaExclamationTriangle className="me-3 mt-1" style={{ color: '#f0ad4e', fontSize: '1.5rem' }} />
                    <div className="flex-grow-1">
                        <Alert.Heading className="mb-3">
                            <FaCrown className="me-2" style={{ color: '#f0ad4e' }} />
                            프리미엄 기능 접근 제한
                        </Alert.Heading>
                        
                        <div>
                            <p className="mb-3">
                                죄송합니다. 프리미엄 기능에 접근하실 수 없습니다.
                            </p>
                            <p className="mb-3 text-muted">
                                이 기능을 사용하려면 프리미엄 구독이 필요합니다.
                            </p>
                            <div className="d-flex gap-2">
                                <Button 
                                    variant="primary" 
                                    onClick={handleGoToSubscription}
                                    className="me-2"
                                >
                                    프리미엄 구독하기
                                </Button>
                                <Button 
                                    variant="outline-secondary" 
                                    onClick={onClose}
                                >
                                    닫기
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Alert>
        </Container>
    );
};

export default SubscriptionAlert;

