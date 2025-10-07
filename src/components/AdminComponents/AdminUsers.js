import React, { useEffect, useState, useMemo } from 'react';
import { Container, Form, Button, Modal, Pagination, Table, Badge, Row, Col } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import api from '../../utils/api';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [editLevelUserId, setEditLevelUserId] = useState(null);
    const [newLevel, setNewLevel] = useState(1);
    const [editPremiumUserId, setEditPremiumUserId] = useState(null);
    const [isPremium, setIsPremium] = useState(false);
    const [editSubscriptionUserId, setEditSubscriptionUserId] = useState(null);
    const [subscriptionStatus, setSubscriptionStatus] = useState('inactive');
    const [currentPage, setCurrentPage] = useState(1);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const postsPerPage = 10;
    const pageGroupSize = 5;

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError('');
                // 현재 사용자 정보 조회
                const currentUserResponse = await api.get('/user/me');
                
                if (currentUserResponse.status === 200) {
                    const currentUser = currentUserResponse.data.user;
                    setCurrentUser(currentUser);
                    
                    // hyin9414@gmail.com 또는 level 99 이상인 사용자는 모든 사용자 조회 가능
                    if (currentUser.email === 'hyin9414@gmail.com' || currentUser.level >= 99) {
                        // 전체 플랫폼의 모든 사용자 조회
                        const usersResponse = await api.get('/user/all');
                        if (usersResponse.status === 200) {
                            const userData = usersResponse.data.data || [];
                            setUsers(userData);
                        }
                    } else {
                        // 일반 사용자는 같은 사업자 번호만 조회
                        const usersResponse = await api.get('/user');
                        if (usersResponse.status === 200) {
                            const userData = usersResponse.data.data || [];
                            setUsers(userData);
                        }
                    }
                } else {
                    console.error('사용자 정보 조회 실패:', currentUserResponse.status);
                    setError('사용자 정보를 가져올 수 없습니다.');
                }
            } catch (error) {
                console.error('AdminUsers 데이터 로딩 실패:', error);
                console.error('에러 상세:', error.response?.data || error.message);
                setError('데이터를 불러오는 중 오류가 발생했습니다: ' + (error.response?.data?.message || error.message));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleDelete = async () => {
        try {
            const response = await api.delete(`/user/deleteUserByAdmin/${deleteId}`);
            if (response.status === 200) {
                setUsers(users.filter(user => user._id !== deleteId));
                alert('사용자가 성공적으로 삭제되었습니다.');
            } else {
                console.error('사용자 삭제 실패:', response.data.message);
                alert('사용자 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('Failed to delete user', error);
            alert('사용자 삭제 중 오류가 발생했습니다.');
        } finally {
            setShowDeleteModal(false);
        }
    };

    // level 수정 함수
    const handleEditLevel = async (userId) => {
        try {
            const response = await api.put(`/user/level`, { userId, level: newLevel });
            if (response.status === 200) {
                setUsers(users.map(user =>
                    user._id === userId ? { ...user, level: newLevel } : user
                ));
                
                // 특별 관리자 권한 여부에 따른 메시지
                if (response.data.isSpecialAdmin) {
                    alert(`✅ 레벨이 성공적으로 업데이트되었습니다!\n\n특별 관리자 권한으로 처리되었습니다.`);
                } else {
                    alert(`✅ 레벨이 성공적으로 업데이트되었습니다!`);
                }
            } else {
                alert('레벨 업데이트 실패');
            }
        } catch (error) {
            console.error('레벨 업데이트 중 오류 발생:', error);
            
            // 에러 메시지 개선
            let errorMessage = '레벨 업데이트 중 오류가 발생했습니다.';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            alert(`❌ 레벨 업데이트 실패\n\n${errorMessage}`);
        } finally {
            setEditLevelUserId(null);
            setNewLevel(1);
        }
    };

    // 유료 회원 상태 수정 함수
    const handleEditPremium = async (userId) => {
        try {
            const response = await api.put(`/user/premium`, { userId, isPremium });
            if (response.status === 200) {
                setUsers(users.map(user =>
                    user._id === userId ? { ...user, isPremium } : user
                ));
                alert('유료 회원 상태가 성공적으로 업데이트되었습니다.');
            } else {
                alert('유료 회원 상태 업데이트 실패');
            }
        } catch (error) {
            console.error('유료 회원 상태 업데이트 중 오류 발생:', error);
            alert('유료 회원 상태 업데이트 중 오류가 발생했습니다.');
        } finally {
            setEditPremiumUserId(null);
            setIsPremium(false);
        }
    };

    // 구독 상태 수정 함수
    const handleEditSubscriptionStatus = async (userId) => {
        try {
            const response = await api.put(`/user/subscription-status`, { userId, subscriptionStatus });
            if (response.status === 200) {
                setUsers(users.map(user =>
                    user._id === userId ? { ...user, subscriptionStatus } : user
                ));
                alert('구독 상태가 성공적으로 업데이트되었습니다.');
            } else {
                alert('구독 상태 업데이트 실패');
            }
        } catch (error) {
            console.error('구독 상태 업데이트 중 오류 발생:', error);
            alert('구독 상태 업데이트 중 오류가 발생했습니다.');
        } finally {
            setEditSubscriptionUserId(null);
            setSubscriptionStatus('inactive');
        }
    };

    const exportToExcel = (data, fileName) => {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        XLSX.writeFile(workbook, fileName);
    };

    const filterData = (data) => {
        if (!searchTerm) return data;
        return data.filter(item =>
            Object.values(item).some(val =>
                String(val).toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    };

    const filteredUsers = useMemo(() => filterData(users), [users, searchTerm, filterData]);

    // 페이지네이션 계산
    const totalPageCount = Math.ceil(filteredUsers.length / postsPerPage);
    const currentGroup = Math.ceil(currentPage / pageGroupSize);
    const startPage = (currentGroup - 1) * pageGroupSize + 1;
    const endPage = Math.min(startPage + pageGroupSize - 1, totalPageCount);
    const currentUsers = filteredUsers.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

    const handleExport = () => {
        const exportData = filteredUsers.map(user => ({
            '이름': user.name,
            '닉네임': user.nickname,
            '이메일': user.email,
            '회사명': user.companyName || '-',
            '사업자번호': user.businessNumber || '-',
            '사업장주소': user.businessAddress || '-',
            '레벨': user.level || 1,
            '유료회원': user.isPremium ? '예' : '아니오'
        }));
        exportToExcel(exportData, 'Users.xlsx');
    };

    const getPremiumBadge = (isPremium) => {
        return isPremium ? 
            <Badge bg="success">유료회원</Badge> : 
            <Badge bg="secondary">무료회원</Badge>;
    };

    const getSubscriptionStatusBadge = (status) => {
        const statusConfig = {
            'active': { variant: 'success', text: '활성' },
            'inactive': { variant: 'secondary', text: '비활성' },
            'suspended': { variant: 'warning', text: '일시정지' },
            'cancelled': { variant: 'danger', text: '취소됨' },
            'expired': { variant: 'dark', text: '만료됨' }
        };
        
        const config = statusConfig[status] || { variant: 'secondary', text: status || '비활성' };
        return <Badge bg={config.variant}>{config.text}</Badge>;
    };

    // 로딩 상태 표시
    if (loading) {
        return (
            <Container fluid>
                <div className="text-center p-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">로딩 중...</span>
                    </div>
                    <p className="mt-3 text-muted">사용자 데이터를 불러오는 중입니다...</p>
                </div>
            </Container>
        );
    }

    // 에러 상태 표시
    if (error) {
        return (
            <Container fluid>
                <div className="alert alert-danger" role="alert">
                    <h4 className="alert-heading">오류가 발생했습니다!</h4>
                    <p>{error}</p>
                    <hr />
                    <p className="mb-0">
                        <Button 
                            variant="outline-danger" 
                            onClick={() => window.location.reload()}
                        >
                            페이지 새로고침
                        </Button>
                    </p>
                </div>
            </Container>
        );
    }

    return (
        <Container fluid>
            {/* 플랫폼 운영자 정보 */}
            {currentUser && (
                <div className="mb-4">
                    <h2>사용자 관리</h2>
                    {currentUser.email === 'hyin9414@gmail.com' || currentUser.level >= 99 ? (
                        <div className="alert alert-info">
                            <strong>🌐 전체 플랫폼 관리 모드</strong> - 모든 사업자번호의 사용자를 관리할 수 있습니다.
                            {currentUser.email === 'hyin9414@gmail.com' && (
                                <div className="mt-2">
                                    <i className="fas fa-star text-warning"></i> <strong>특별 관리자 권한</strong> (hyin9414@gmail.com)
                                    <br />
                                    <small className="text-muted">• 모든 사용자의 레벨을 자유롭게 변경할 수 있습니다</small>
                                    <br />
                                    <small className="text-muted">• 레벨 제한 없이 관리할 수 있습니다</small>
                                </div>
                            )}
                            {currentUser.email === 'hyin9414@gmail.com' || currentUser.level >= 99 ? (
                                <div className="mt-2">
                                    <i className="fas fa-crown text-warning"></i> 플랫폼 운영자 권한 (Level {currentUser.level})
                                </div>
                            ) : null}
                        </div>
                    ) : (
                        <div className="alert alert-warning">
                            <strong>🏢 회사 관리 모드</strong> - 같은 사업자 번호의 사용자만 관리할 수 있습니다.
                        </div>
                    )}
                </div>
            )}

            {/* 검색 및 내보내기 */}
            {users.length > 0 && (
                <Row className="mb-3">
                    <Col md={8}>
                        <Form.Control
                            type="text"
                            placeholder="이름, 이메일, 회사명으로 검색..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </Col>
                    <Col md={4}>
                        <Button onClick={handleExport} variant="success" className="w-100">
                            엑셀 내보내기
                        </Button>
                    </Col>
                </Row>
            )}

            {/* 반응형 테이블 */}
            <div className="table-responsive">
                {users.length === 0 ? (
                    <div className="text-center p-5">
                        <div className="alert alert-info">
                            <h5>사용자 데이터가 없습니다</h5>
                            <p className="mb-0">
                                {currentUser && (currentUser.email === 'hyin9414@gmail.com' || currentUser.level >= 99) 
                                    ? '전체 플랫폼에서 사용자를 찾을 수 없습니다.' 
                                    : '같은 사업자번호의 사용자를 찾을 수 없습니다.'
                                }
                            </p>
                        </div>
                    </div>
                ) : (
                    <Table striped bordered hover>
                        <thead className="table-dark">
                            <tr>
                                <th>#</th>
                                <th>이름</th>
                                <th>이메일</th>
                                <th>회사명</th>
                                <th>사업자번호</th>
                                <th>레벨</th>
                                <th>유료회원</th>
                                <th>구독상태</th>
                                <th>관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentUsers.map((user, index) => (
                                <tr key={user._id}>
                                    <td>{(currentPage - 1) * postsPerPage + index + 1}</td>
                                    <td>
                                        <strong>{user.name}</strong>
                                        <br />
                                        <small className="text-muted">({user.nickname})</small>
                                    </td>
                                    <td>{user.email}</td>
                                    <td>{user.companyName || '-'}</td>
                                    <td>{user.businessNumber || '-'}</td>
                                    <td>
                                        {currentUser.email === 'hyin9414@gmail.com' || currentUser.level >= 99 ? (
                                            <Button
                                                variant="outline-info"
                                                size="sm"
                                                onClick={() => {
                                                    setEditLevelUserId(user._id);
                                                    setNewLevel(user.level || 1);
                                                }}
                                            >
                                                {user.level || 1}
                                            </Button>
                                        ) : (
                                            <span className="badge bg-secondary">{user.level || 1}</span>
                                        )}
                                    </td>
                                    <td>
                                        <Button
                                            variant="outline-warning"
                                            size="sm"
                                            onClick={() => {
                                                setEditPremiumUserId(user._id);
                                                setIsPremium(user.isPremium || false);
                                            }}
                                        >
                                            {getPremiumBadge(user.isPremium)}
                                        </Button>
                                    </td>
                                    <td>
                                        {currentUser.email === 'hyin9414@gmail.com' || currentUser.level >= 99 ? (
                                            <Button
                                                variant="outline-info"
                                                size="sm"
                                                onClick={() => {
                                                    setEditSubscriptionUserId(user._id);
                                                    setSubscriptionStatus(user.subscriptionStatus || 'inactive');
                                                }}
                                            >
                                                {getSubscriptionStatusBadge(user.subscriptionStatus)}
                                            </Button>
                                        ) : (
                                            <span>{getSubscriptionStatusBadge(user.subscriptionStatus)}</span>
                                        )}
                                    </td>
                                    <td>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => {
                                                setDeleteId(user._id);
                                                setShowDeleteModal(true);
                                            }}
                                        >
                                            삭제
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </div>

            {/* 페이지네이션 */}
            {users.length > 0 && totalPageCount > 1 && (
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
                            {[...Array(endPage - startPage + 1)].map((_, i) => (
                                <Pagination.Item 
                                    key={i + startPage} 
                                    active={i + startPage === currentPage} 
                                    onClick={() => handlePageChange(i + startPage)}
                                >
                                    {i + startPage}
                                </Pagination.Item>
                            ))}
                            <Pagination.Next 
                                onClick={() => handlePageChange(Math.min(totalPageCount, currentPage + 1))} 
                                disabled={currentPage === totalPageCount} 
                            />
                            <Pagination.Last 
                                onClick={() => handlePageChange(totalPageCount)} 
                                disabled={currentPage === totalPageCount} 
                            />
                        </Pagination>
                    </Col>
                </Row>
            )}

            {/* 통계 정보 */}
            {users.length > 0 && (
                <Row className="mt-3">
                    <Col md={4}>
                        <div className="text-center p-3 bg-light rounded">
                            <h5>총 사용자</h5>
                            <h3 className="text-primary">{filteredUsers.length}명</h3>
                        </div>
                    </Col>
                    <Col md={4}>
                        <div className="text-center p-3 bg-light rounded">
                            <h5>유료회원</h5>
                            <h3 className="text-success">{filteredUsers.filter(u => u.isPremium).length}명</h3>
                        </div>
                    </Col>
                    <Col md={4}>
                        <div className="text-center p-3 bg-light rounded">
                            <h5>무료회원</h5>
                            <h3 className="text-secondary">{filteredUsers.filter(u => !u.isPremium).length}명</h3>
                        </div>
                    </Col>
                </Row>
            )}

            {/* 삭제 확인 모달 */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>사용자 삭제 확인</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    정말로 이 사용자를 삭제하시겠습니까?
                    <br />
                    <strong>이 작업은 되돌릴 수 없습니다.</strong>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        취소
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        삭제
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* 레벨 수정 모달 */}
            <Modal show={editLevelUserId !== null} onHide={() => setEditLevelUserId(null)}>
                <Modal.Header closeButton>
                    <Modal.Title>사용자 레벨 수정</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="formEditLevel">
                        <Form.Label>새로운 레벨</Form.Label>
                        <Form.Control
                            type="number"
                            value={newLevel}
                            onChange={(e) => setNewLevel(parseInt(e.target.value, 10))}
                            onWheel={(e) => {
                                e.preventDefault();
                                const delta = e.deltaY > 0 ? -1 : 1;
                                const newValue = newLevel + delta;
                                if (newValue >= 0 && newValue <= 99) {
                                    setNewLevel(newValue);
                                }
                            }}
                            placeholder="레벨을 입력하세요"
                            min="0"
                            max="99"
                        />
                        <Form.Text className="text-muted">
                            0-99 사이의 숫자를 입력하세요 (마우스 휠로 스크롤하여 조정 가능)
                            {currentUser && (currentUser.email === 'hyin9414@gmail.com' || currentUser.level >= 99) && (
                                <div className="text-info mt-1">
                                    {currentUser.email === 'hyin9414@gmail.com' ? (
                                        <div>
                                            <strong>🌟 특별 관리자 권한</strong>
                                            <br />
                                            • 모든 사용자의 레벨을 자유롭게 변경할 수 있습니다
                                            <br />
                                            • 레벨 제한 없이 관리할 수 있습니다
                                            <br />
                                            • 전체 플랫폼의 모든 사용자를 관리할 수 있습니다
                                        </div>
                                    ) : (
                                        '플랫폼 운영자 권한으로 모든 사용자의 레벨을 변경할 수 있습니다.'
                                    )}
                                </div>
                            )}
                        </Form.Text>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setEditLevelUserId(null)}>
                        취소
                    </Button>
                    <Button variant="primary" onClick={() => handleEditLevel(editLevelUserId)}>
                        확인
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* 유료회원 상태 수정 모달 */}
            <Modal show={editPremiumUserId !== null} onHide={() => setEditPremiumUserId(null)}>
                <Modal.Header closeButton>
                    <Modal.Title>유료회원 상태 수정</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="formEditPremium">
                        <Form.Label>유료회원 여부</Form.Label>
                        <Form.Check
                            type="switch"
                            id="premium-switch"
                            label={isPremium ? "유료회원" : "무료회원"}
                            checked={isPremium}
                            onChange={(e) => setIsPremium(e.target.checked)}
                        />
                        <Form.Text className="text-muted">
                            스위치를 토글하여 유료회원 상태를 변경하세요
                        </Form.Text>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setEditPremiumUserId(null)}>
                        취소
                    </Button>
                    <Button variant="primary" onClick={() => handleEditPremium(editPremiumUserId)}>
                        확인
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* 구독 상태 수정 모달 */}
            <Modal show={editSubscriptionUserId !== null} onHide={() => setEditSubscriptionUserId(null)}>
                <Modal.Header closeButton>
                    <Modal.Title>구독 상태 수정</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="formEditSubscriptionStatus">
                        <Form.Label>구독 상태</Form.Label>
                        <Form.Select
                            value={subscriptionStatus}
                            onChange={(e) => setSubscriptionStatus(e.target.value)}
                        >
                            <option value="inactive">비활성</option>
                            <option value="active">활성</option>
                            <option value="suspended">일시정지</option>
                            <option value="cancelled">취소됨</option>
                            <option value="expired">만료됨</option>
                        </Form.Select>
                        <Form.Text className="text-muted">
                            드롭다운에서 구독 상태를 선택하세요
                        </Form.Text>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setEditSubscriptionUserId(null)}>
                        취소
                    </Button>
                    <Button variant="primary" onClick={() => handleEditSubscriptionStatus(editSubscriptionUserId)}>
                        확인
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default AdminUsers;

