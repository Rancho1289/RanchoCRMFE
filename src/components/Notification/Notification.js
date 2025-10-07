import React, { useState, useEffect, useCallback } from 'react';
import { Card, ListGroup, Badge, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import { FaBell, FaExclamationTriangle, FaInfoCircle, FaEye, FaPlus, FaList, FaEdit, FaTrash } from 'react-icons/fa';
// import { format } from 'date-fns';
// import { ko } from 'date-fns/locale/ko';
import api from '../../utils/api';
import NotificationRegistrationModal from './NotificationRegistrationModal';
import './Notification.css';

const NotificationList = ({ user }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showRegistrationModal, setShowRegistrationModal] = useState(false);
    const [editingNotification, setEditingNotification] = useState(null);

    const fetchNotifications = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const response = await api.get(`/notifications?page=${page}&limit=10`);

            if (response.data.success) {
                // 모든 공지사항 표시 (필터링 제거)
                setNotifications(response.data.data.docs);
                setTotalPages(response.data.data.totalPages);
                setCurrentPage(page);
            }
        } catch (err) {
            console.error('공지사항 조회 오류:', err);
            setError('공지사항을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const response = await api.get('/notifications/unread/count');

            if (response.data.success) {
                setUnreadCount(response.data.data.unreadCount);
            }
        } catch (err) {
            console.error('읽지 않은 공지사항 수 조회 오류:', err);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await api.patch(`/notifications/${notificationId}/read`);

            // 로컬 상태 업데이트
            setNotifications(prev =>
                prev.map(notification =>
                    notification._id === notificationId
                        ? { ...notification, isRead: true }
                        : notification
                )
            );

            // 읽지 않은 수 업데이트
            fetchUnreadCount();
        } catch (err) {
            console.error('읽음 처리 오류:', err);
        }
    };

    const handleNotificationClick = async (notification) => {
        setSelectedNotification(notification);
        setShowModal(true);

        // 읽지 않은 공지사항이면 읽음 처리
        if (!notification.isRead) {
            await markAsRead(notification._id);
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case '긴급':
                return <FaExclamationTriangle className="text-danger" />;
            case '중요':
                return <FaExclamationTriangle className="text-warning" />;
            case '시스템':
                return <FaInfoCircle className="text-info" />;
            default:
                return <FaBell className="text-primary" />;
        }
    };

    const getTypeBadgeVariant = (type) => {
        switch (type) {
            case '긴급':
                return 'danger';
            case '중요':
                return 'warning';
            case '시스템':
                return 'info';
            default:
                return 'primary';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
    };

    // 공지사항 등록/수정 성공 후 콜백
    const handleRegistrationSuccess = () => {
        fetchNotifications(currentPage);
        fetchUnreadCount();
    };

    // 공지사항 삭제 함수
    const deleteNotification = async (notificationId) => {
        if (!window.confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
            return;
        }

        try {
            const response = await api.delete(`/notifications/${notificationId}`);

            if (response.data.success) {
                alert('공지사항이 성공적으로 삭제되었습니다.');
                // 목록 새로고침
                fetchNotifications(currentPage);
                fetchUnreadCount();
            }
        } catch (err) {
            console.error('공지사항 삭제 오류:', err);
            if (err.response?.status === 403) {
                alert('삭제 권한이 없습니다.');
            } else {
                alert('공지사항 삭제에 실패했습니다.');
            }
        }
    };

    // 수정 모달 열기
    const openEditModal = (notification) => {
        setEditingNotification(notification);
        setShowRegistrationModal(true);
    };


    // 공지사항 등록/수정/삭제 권한 체크
    const hasNotificationPermission = () => {
        if (!user) {
            return false;
        }
        
        // level 90 이상이거나 특정 이메일인 경우 허용
        return user.level >= 90 || user.email === 'hyin9414@gmail.com';
    };

    useEffect(() => {
        fetchNotifications(1);
        fetchUnreadCount();
    }, [fetchNotifications]);


    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">로딩 중...</span>
                </Spinner>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="danger">
                {error}
            </Alert>
        );
    }

    return (

        <div className="notification-list">
            <Card className="shadow-sm">
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                        <FaBell className="me-2" />
                        공지사항
                        {unreadCount > 0 && (
                            <Badge bg="danger" className="ms-2">
                                {unreadCount}
                            </Badge>
                        )}
                    </h5>
                                            <div className="d-flex gap-2">
                            {(() => {
                                const hasToken = localStorage.getItem('token') || sessionStorage.getItem('token');
                                return hasToken && hasNotificationPermission() && (
                                    <Button 
                                        variant="outline-primary" 
                                        size="sm"
                                        onClick={() => {
                                            setEditingNotification(null);
                                            setShowRegistrationModal(true);
                                        }}
                                        className="d-flex align-items-center"
                                    >
                                        <FaPlus className="me-1" />
                                        게시글 등록
                                    </Button>
                                );
                            })()}
                            <Button 
                                variant="outline-secondary" 
                                size="sm"
                                onClick={() => {
                                    fetchNotifications(1);
                                    fetchUnreadCount();
                                }}
                                className="d-flex align-items-center"
                            >
                                <FaList className="me-1" />
                                리스트
                            </Button>
                        </div>
                </Card.Header>
                <Card.Body className="p-0">
                    {notifications.length === 0 ? (
                        <div className="text-center py-4 text-muted">
                            📝 공지사항이 없습니다.
                        </div>
                    ) : (
                        <ListGroup variant="flush">
                            {notifications.map((notification) => (
                                <ListGroup.Item
                                    key={notification._id}
                                    style={{
                                        cursor: 'pointer',
                                        borderLeft: !notification.isRead ? '4px solid #007bff' : '4px solid transparent',
                                        backgroundColor: !notification.isRead ? '#f8f9fa' : 'white',
                                        fontWeight: !notification.isRead ? '600' : 'normal'
                                    }}
                                    onClick={() => handleNotificationClick(notification)}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#e9ecef';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = !notification.isRead ? '#f8f9fa' : 'white';
                                    }}
                                >
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div className="flex-grow-1">
                                            <div className="d-flex align-items-center mb-1">
                                                {getTypeIcon(notification.type)}
                                                <Badge
                                                    bg={getTypeBadgeVariant(notification.type)}
                                                    className="ms-2 me-2"
                                                    size="sm"
                                                >
                                                    {notification.type}
                                                </Badge>
                                                {notification.priority > 0 && (
                                                    <Badge bg="secondary" className="me-2">
                                                        우선순위 {notification.priority}
                                                    </Badge>
                                                )}
                                                {!notification.isRead && (
                                                    <Badge bg="primary" size="sm">
                                                        새 글
                                                    </Badge>
                                                )}
                                            </div>
                                            <h6 className="mb-1 fw-bold">{notification.title}</h6>
                                            <p className="mb-1 text-muted small">
                                                {(() => {
                                                    // HTML 태그 제거
                                                    const textContent = notification.content.replace(/<[^>]*>/g, '');
                                                    return textContent.length > 100
                                                        ? `${textContent.substring(0, 100)}...`
                                                        : textContent;
                                                })()}
                                            </p>
                                            <small className="text-muted">
                                                {formatDate(notification.publishedAt)}
                                                {notification.createdBy && (
                                                    <span className="ms-2">
                                                        from 운영진
                                                    </span>
                                                )}
                                            </small>
                                        </div>
                                        <div className="d-flex align-items-center gap-2">
                                            <FaEye className="text-muted" />
                                            {(localStorage.getItem('token') || sessionStorage.getItem('token')) && hasNotificationPermission() && (
                                                <div className="d-flex gap-1">
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openEditModal(notification);
                                                        }}
                                                        className="p-1"
                                                        title="수정"
                                                    >
                                                        <FaEdit size={12} />
                                                    </Button>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteNotification(notification._id);
                                                        }}
                                                        className="p-1"
                                                        title="삭제"
                                                    >
                                                        <FaTrash size={12} />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    )}
                </Card.Body>
                {totalPages > 1 && (
                    <Card.Footer className="d-flex justify-content-center">
                        <div className="btn-group" role="group">
                            <Button
                                variant="outline-primary"
                                size="sm"
                                disabled={currentPage === 1}
                                onClick={() => fetchNotifications(currentPage - 1)}
                            >
                                이전
                            </Button>
                            <Button variant="outline-primary" size="sm" disabled>
                                {currentPage} / {totalPages}
                            </Button>
                            <Button
                                variant="outline-primary"
                                size="sm"
                                disabled={currentPage === totalPages}
                                onClick={() => fetchNotifications(currentPage + 1)}
                            >
                                다음
                            </Button>
                        </div>
                    </Card.Footer>
                )}
            </Card>

            {/* 공지사항 상세 모달 */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {selectedNotification && (
                            <>
                                {getTypeIcon(selectedNotification.type)}
                                <span className="ms-2">{selectedNotification.title}</span>
                            </>
                        )}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedNotification && (
                        <>
                            <div className="mb-3">
                                <Badge bg={getTypeBadgeVariant(selectedNotification.type)} className="me-2">
                                    {selectedNotification.type}
                                </Badge>
                                {selectedNotification.priority > 0 && (
                                    <Badge bg="secondary" className="me-2">
                                        우선순위 {selectedNotification.priority}
                                    </Badge>
                                )}
                                <small className="text-muted">
                                    {formatDate(selectedNotification.publishedAt)}
                                    {selectedNotification.createdBy && (
                                        <span className="ms-2">
                                            by {selectedNotification.createdBy.name}
                                        </span>
                                    )}
                                </small>
                            </div>
                                                        <div 
                                className="notification-content"
                                dangerouslySetInnerHTML={{ __html: selectedNotification.content }}
                            />
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        닫기
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* 공지사항 등록/수정 모달 */}
            <NotificationRegistrationModal
                show={showRegistrationModal}
                onHide={() => {
                    setShowRegistrationModal(false);
                    setEditingNotification(null);
                }}
                onSuccess={handleRegistrationSuccess}
                editingNotification={editingNotification}
                currentUser={user}
            />

        </div>

    );
};

export default NotificationList;
