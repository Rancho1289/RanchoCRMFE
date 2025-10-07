import React, { useState } from 'react';
import { Badge, Card, ListGroup, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
    FaHistory, FaUserCog, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaCreditCard, FaBullhorn, FaUsers, FaBuilding
} from 'react-icons/fa';

const MyPage = ({ user, logout, isReadByCurrentUser, unreadCount = 0 }) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const myPageList = [
        { label: "공지사항", path: "/notifications", icon: <FaBullhorn size={20} className="text-primary" /> },
        { label: "회사등록", path: "/company-register", icon: <FaBuilding size={20} className="text-warning" /> },
        { label: "계정 설정", path: "/AccountSettings", icon: <FaUserCog size={20} className="text-secondary" /> },
        { label: "구성원 관리", path: "/members", icon: <FaUsers size={20} className="text-info" /> },
        { label: "구독 관리", path: "/subscription", icon: <FaCreditCard size={20} className="text-success" /> },
        { label: "활동기록", path: "/activity-log", icon: <FaHistory size={24} style={{ color: '#519ced' }} /> },
    ];

    return (
        <Card className="shadow-sm border-0">
            <Card.Body>
                {/* <ListGroup variant="flush"> */}
                <ListGroup >
                    {myPageList.map((item, index) => (
                        <ListGroup.Item
                            key={index}
                            as={Link}
                            to={item.path}
                            action
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            style={{
                                backgroundColor: hoveredIndex === index ? 'orange' : '#ffffffad',
                                borderRadius: '7px',
                                cursor: 'pointer',
                                transition: 'background-color 0.3s ease',
                                textDecoration: 'none',
                                color: 'inherit'
                            }}
                            className="d-flex align-items-center justify-content-between"
                        >
                            <div className="d-flex align-items-center">
                                <span className="me-2 position-relative">
                                    {item.icon}
                                    {item.label === "공지사항" && unreadCount > 0 && (
                                        <Badge 
                                            bg="danger" 
                                            pill 
                                            className="position-absolute top-0 start-100 translate-middle"
                                            style={{ fontSize: '0.6rem', minWidth: '16px', height: '16px' }}
                                        >
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </Badge>
                                    )}
                                </span>
                                <span>{item.label}</span>
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </Card.Body>
            <Card.Footer className="text-center">
                {user ? (
                    <Button variant="outline-danger" onClick={logout} className="w-100">
                        <FaSignOutAlt className="me-2" />
                        로그아웃
                    </Button>
                ) : (
                    <div className="d-grid gap-2">
                        <Button variant="outline-primary" href="/login" className="d-flex align-items-center justify-content-center">
                            <FaSignInAlt className="me-2" />
                            로그인
                        </Button>
                        <Button variant="outline-success" href="/register" className="d-flex align-items-center justify-content-center">
                            <FaUserPlus className="me-2" />
                            회원 가입
                        </Button>
                    </div>
                )}
            </Card.Footer>
        </Card>
    );
};

export default MyPage;
