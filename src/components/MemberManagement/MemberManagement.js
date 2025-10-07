import React, { useEffect, useState, useMemo } from 'react';
import { Container, Form, Button, Modal, Pagination, Table, Badge, Row, Col, Alert } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import api from '../../utils/api';

const MemberManagement = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editLevelUserId, setEditLevelUserId] = useState(null);
    const [newLevel, setNewLevel] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // 권한 필터 상태 추가
    const [permissionFilter, setPermissionFilter] = useState('');
    const [levelFilter, setLevelFilter] = useState('');

    // 권한 데이터 정의 (레벨 순서대로 정렬)
    const permissionData = [
        { id: 1, name: '구성원 관리', minLevel: 2, description: '구성원 목록 조회', note: '같은 사업자 번호만', badgeColor: 'info' },
        { id: 2, name: '계약 관리', minLevel: 2, description: '계약 목록 조회, 등록', note: '기본 접근 권한', badgeColor: 'info' },
        { id: 3, name: '고객 관리', minLevel: 2, description: '고객 목록 조회, 등록', note: '기본 접근 권한', badgeColor: 'info' },
        { id: 4, name: '일정 관리', minLevel: 2, description: '일정 목록 조회, 등록', note: '기본 접근 권한', badgeColor: 'info' },
        { id: 5, name: '매물 관리', minLevel: 3, description: '매물 등록, 수정', note: '자신이 등록한 매물만', badgeColor: 'warning' },
        { id: 6, name: '구성원 레벨 변경', minLevel: 5, description: '다른 구성원의 레벨 수정', note: '자기보다 낮은 레벨만', badgeColor: 'success' },
        { id: 7, name: '계약 수정/삭제', minLevel: 5, description: '계약 정보 수정, 삭제', note: '완료된 계약 제외', badgeColor: 'success' },
        { id: 8, name: '고객 수정/삭제', minLevel: 5, description: '고객 정보 수정, 삭제', note: '같은 사업자 번호만', badgeColor: 'success' },
        { id: 9, name: '매물 삭제', minLevel: 5, description: '모든 매물 삭제', note: '전체 매물 관리', badgeColor: 'success' },
        { id: 10, name: '일정 수정/삭제', minLevel: 5, description: '일정 정보 수정, 삭제', note: '같은 사업자 번호만', badgeColor: 'success' },
        { id: 11, name: '고객 비활성화 관리', minLevel: 11, description: '비활성화된 고객 수정', note: '시스템 관리자 권한', badgeColor: 'danger' },
        { id: 12, name: '시스템 관리', minLevel: 11, description: '전체 시스템 관리', note: '최고 관리자 권한', badgeColor: 'danger' }
    ];

    // 필터링된 권한 데이터
    const filteredPermissions = permissionData.filter(permission => {
        const matchesFilter = !permissionFilter || 
            permission.name.toLowerCase().includes(permissionFilter.toLowerCase()) ||
            permission.description.toLowerCase().includes(permissionFilter.toLowerCase()) ||
            permission.note.toLowerCase().includes(permissionFilter.toLowerCase());
        
        const matchesLevel = !levelFilter || permission.minLevel.toString() === levelFilter;
        
        return matchesFilter && matchesLevel;
    });

    // 현재 사용자가 볼 수 있는 권한만 필터링
    const visiblePermissions = filteredPermissions.filter(permission => {
        // 현재 사용자가 없으면 표시하지 않음
        if (!currentUser) return false;
        
        // 현재 사용자의 레벨이 권한의 최소 레벨보다 낮으면 표시하지 않음
        if (currentUser.level < permission.minLevel) return false;
        
        return true;
    });

    // 레벨 배지 생성 함수
    const getLevelBadge = (level) => {
        let bgColor = 'secondary';
        if (level <= 2) bgColor = 'info';
        else if (level <= 4) bgColor = 'warning';
        else if (level <= 7) bgColor = 'success';
        else if (level <= 10) bgColor = 'primary';
        else bgColor = 'danger';
        
        return <Badge bg={bgColor}>Level {level}</Badge>;
    };

    const postsPerPage = 10;
    const pageGroupSize = 5;

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // 현재 사용자 정보 조회
                const currentUserResponse = await api.get('/user/me');
                if (currentUserResponse.status === 200) {
                    // getUser API는 { status: 'success', user } 형태로 응답
                    const currentUserData = currentUserResponse.data.user;
                    setCurrentUser(currentUserData);

                    // level 2 이상만 사용자 목록 조회 가능
                    if (currentUserData.level >= 2) {
                        const usersResponse = await api.get('/user');
                        if (usersResponse.status === 200) {
                            // getUsers API는 { status: 'success', data: [...] } 형태로 응답
                            setUsers(usersResponse.data.data || []);
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to fetch data', error);
                if (error.response?.status === 403) {
                    setError('레벨 2 이상의 사용자만 접근할 수 있습니다.');
                } else {
                    setError('데이터를 불러오는 중 오류가 발생했습니다.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // level 수정 함수
    const handleEditLevel = async (userId) => {
        try {
            const response = await api.put(`/user/level`, { userId, level: newLevel });
            if (response.status === 200) {
                setUsers(users.map(user =>
                    user._id === userId ? { ...user, level: newLevel } : user
                ));
                alert('레벨이 성공적으로 업데이트되었습니다.');
            } else {
                alert('레벨 업데이트 실패');
            }
        } catch (error) {
            console.error('레벨 업데이트 중 오류 발생:', error);
            if (error.response?.data?.message) {
                alert(error.response.data.message);
            } else {
                alert('레벨 업데이트 중 오류가 발생했습니다.');
            }
        } finally {
            setEditLevelUserId(null);
            setNewLevel(1);
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

    const filteredUsers = useMemo(() => filterData(users), [users, searchTerm]);

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
            '연락처': user.contactNumber || '-',
            '회사명': user.companyName || '-',
            '사업자번호': user.businessNumber || '-',
            '레벨': user.level || 1,
            '가입일': new Date(user.createdAt).toLocaleDateString()
        }));
        exportToExcel(exportData, 'Members.xlsx');
    };

    const getLevelDescription = (level) => {
        if (!level) return '알 수 없음';
        if (level === 1) return '기본 사용자';
        if (level >= 2 && level <= 4) return '일반 직원';
        if (level >= 5 && level <= 7) return '중간 관리자';
        if (level >= 8 && level <= 10) return '고급 관리자';
        if (level >= 11) return '시스템 관리자';
        return '알 수 없음';
    };

    // 권한 체크 함수들
    const canViewUsers = currentUser && currentUser.level >= 2;
    const canEditLevel = currentUser && currentUser.level >= 5;

    if (loading) {
        return (
            <Container>
                <div className="text-center p-5">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Alert variant="danger">
                    <Alert.Heading>접근 제한</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            </Container>
        );
    }

    if (!canViewUsers) {
        return (
            <Container>
                <Alert variant="warning">
                    <Alert.Heading>권한 부족</Alert.Heading>
                    <p>레벨 2 이상의 사용자만 다른 사용자 정보를 조회할 수 있습니다.</p>
                </Alert>
            </Container>
        );
    }

    return (
        <Container>
            
                <div className="mb-4">
                    <h2>구성원 관리</h2>
                    <p className="text-muted">
                        같은 사업자 번호의 구성원을 관리합니다.
                        {currentUser && currentUser.level >= 5 ? '레벨 5 이상으로 다른 구성원의 레벨을 변경할 수 있습니다.' : '레벨 5 이상이 되어야 다른 구성원의 레벨을 변경할 수 있습니다.'}
                    </p>
                </div>

                {/* 검색 및 내보내기 */}
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

                {/* 반응형 테이블 */}
                <div className="table-responsive">
                                                        {/* 필터 결과 통계 */}
                                    <div className="mb-2 text-end">
                                        <small className="text-muted">
                                            총 {permissionData.length}개 권한 중 {visiblePermissions.length}개 표시
                                            {currentUser && ` (현재 Level ${currentUser.level})`}
                                            {permissionFilter && ` (검색어: "${permissionFilter}")`}
                                            {levelFilter && ` (레벨: Level ${levelFilter})`}
                                        </small>
                                    </div>
                    
                    <Table striped bordered hover>
                        <thead className="table-dark">
                            <tr>
                                <th>#</th>
                                <th>이름</th>
                                <th>이메일</th>
                                <th>연락처</th>
                                <th>회사명</th>
                                <th>레벨</th>
                                <th>가입일</th>
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
                                    <td>{user.contactNumber || '-'}</td>
                                    <td>{user.companyName || '-'}</td>
                                    <td>
                                        {canEditLevel && user.level < currentUser.level ? (
                                            <Button
                                                variant="outline-info"
                                                size="sm"
                                                onClick={() => {
                                                    setEditLevelUserId(user._id);
                                                    setNewLevel(user.level || 1);
                                                }}
                                            >
                                                {getLevelBadge(user.level || 1)}
                                            </Button>
                                        ) : (
                                            getLevelBadge(user.level || 1)
                                        )}
                                        <br />
                                    </td>
                                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>

                {/* 페이지네이션 */}
                {totalPageCount > 1 && (
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
                <Row className="mt-3">
                    <Col md={4}>
                        <div className="text-center p-3 bg-light rounded">
                            <h5>총 구성원</h5>
                            <h3 className="text-primary">{filteredUsers.length}명</h3>
                        </div>
                    </Col>
                    <Col md={4}>
                        <div className="text-center p-3 bg-light rounded">
                            <h5>레벨 5 이상</h5>
                            <h3 className="text-success">{filteredUsers.filter(u => u.level >= 5).length}명</h3>
                        </div>
                    </Col>
                    <Col md={4}>
                        <div className="text-center p-3 bg-light rounded">
                            <h5>레벨 2-4</h5>
                            <h3 className="text-info">{filteredUsers.filter(u => u.level >= 2 && u.level < 5).length}명</h3>
                        </div>
                    </Col>
                </Row>

                {/* 레벨별 권한 가이드 */}
                <Row className="mt-4">
                    <Col>
                        <div className="card">
                            <div className="card-header bg-primary text-white">
                                <h5 className="mb-0">
                                    <i className="fas fa-info-circle me-2"></i>
                                    레벨별 권한 가이드
                                </h5>
                            </div>
                            <div className="card-body">
                                <p className="text-muted mb-3">
                                    각 관리 기능별로 필요한 최소 레벨을 확인하여 직원별 권한을 체계적으로 관리하세요.
                                </p>
                                
                                {/* 필터 기능 추가 */}
                                <div className="mb-3">
                                    <div className="row align-items-center">
                                        <div className="col-md-6">
                                            <div className="input-group">
                                                <span className="input-group-text">
                                                    <i className="fas fa-search"></i>
                                                </span>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="기능명, 권한 내용으로 검색..."
                                                    value={permissionFilter}
                                                    onChange={(e) => setPermissionFilter(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <select
                                                className="form-select"
                                                value={levelFilter}
                                                onChange={(e) => setLevelFilter(e.target.value)}
                                            >
                                                <option value="">모든 레벨</option>
                                                <option value="1">Level 1</option>
                                                <option value="2">Level 2</option>
                                                <option value="3">Level 3</option>
                                                <option value="5">Level 5</option>
                                                <option value="8">Level 8</option>
                                                <option value="11">Level 11+</option>
                                            </select>
                                        </div>
                                        <div className="col-md-3">
                                            <button
                                                className="btn btn-outline-secondary w-100"
                                                onClick={() => {
                                                    setPermissionFilter('');
                                                    setLevelFilter('');
                                                }}
                                            >
                                                <i className="fas fa-times me-1"></i>
                                                필터 초기화
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="table-responsive">
                                    <Table striped bordered hover>
                                        <thead className="table-dark">
                                            <tr>
                                                <th>레벨</th>
                                                <th>권한</th>
                                                <th>설명</th>
                                                <th>비고</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {visiblePermissions.length > 0 ? (
                                                visiblePermissions.map(permission => (
                                                    <tr key={permission.id}>
                                                        <td>{getLevelBadge(permission.minLevel)}</td>
                                                        <td><strong>{permission.name}</strong></td>
                                                        <td>{permission.description}</td>
                                                        <td>{permission.note}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" className="text-center text-muted">
                                                        <i className="fas fa-search me-2"></i>
                                                        {permissionFilter || levelFilter ? '검색 조건에 맞는 권한이 없습니다.' : '표시할 권한이 없습니다.'}
                                                    </td>
                                                </tr>
                                            )}
                                            
                                            {/* Level 1 사용자에게는 기본 안내만 표시 */}
                                            {currentUser && currentUser.level === 1 && visiblePermissions.length === 0 && (
                                                <tr>
                                                    <td colSpan="4" className="text-center text-muted">
                                                        <i className="fas fa-info-circle me-2"></i>
                                                        Level 1 사용자는 기본 정보 조회만 가능합니다.
                                                    </td>
                                                </tr>
                                            )}
                                            
                                            {/* 권한이 부족한 사용자에게 안내 */}
                                            {currentUser && currentUser.level > 1 && visiblePermissions.length === 0 && (
                                                <tr>
                                                    <td colSpan="4" className="text-center text-muted">
                                                        <i className="fas fa-lock me-2"></i>
                                                        현재 Level {currentUser.level} 사용자입니다. 
                                                        더 높은 레벨의 권한이 필요합니다.
                                                    </td>
                                                </tr>
                                            )}
                                            
                                            {/* 로그인하지 않은 사용자에게 안내 */}
                                            {!currentUser && (
                                                <tr>
                                                    <td colSpan="4" className="text-center text-muted">
                                                        <i className="fas fa-sign-in-alt me-2"></i>
                                                        로그인이 필요합니다.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </div>
                                <div className="mt-3">
                                    <h6 className="text-primary">💡 권한 관리 팁:</h6>
                                    <ul className="text-muted">
                                        {/* Level 1 사용자에게는 기본 안내만 */}
                                        {currentUser && currentUser.level === 1 && (
                                            <li><strong>Level 1:</strong> 기본 사용자 - 정보 조회만 가능</li>
                                        )}
                                        
                                        {/* Level 2-4 사용자에게는 해당 범위 안내 */}
                                        {currentUser && currentUser.level >= 2 && currentUser.level <= 4 && (
                                            <>
                                                <li><strong>Level 1:</strong> 기본 사용자 - 정보 조회만 가능</li>
                                                <li><strong>Level 2-4:</strong> 일반 직원 - 기본적인 조회 및 등록 권한</li>
                                            </>
                                        )}
                                        
                                        {/* Level 5-7 사용자에게는 해당 범위까지 안내 */}
                                        {currentUser && currentUser.level >= 5 && currentUser.level <= 7 && (
                                            <>
                                                <li><strong>Level 1:</strong> 기본 사용자 - 정보 조회만 가능</li>
                                                <li><strong>Level 2-4:</strong> 일반 직원 - 기본적인 조회 및 등록 권한</li>
                                                <li><strong>Level 5-7:</strong> 중간 관리자 - 수정/삭제 권한</li>
                                            </>
                                        )}
                                        
                                        {/* Level 8-10 사용자에게는 해당 범위까지 안내 */}
                                        {currentUser && currentUser.level >= 8 && currentUser.level <= 10 && (
                                            <>
                                                <li><strong>Level 1:</strong> 기본 사용자 - 정보 조회만 가능</li>
                                                <li><strong>Level 2-4:</strong> 일반 직원 - 기본적인 조회 및 등록 권한</li>
                                                <li><strong>Level 5-7:</strong> 중간 관리자 - 수정/삭제 권한</li>
                                                <li><strong>Level 8-10:</strong> 고급 관리자 - 확장된 관리 권한</li>
                                            </>
                                        )}
                                        
                                        {/* Level 11 이상 사용자에게는 전체 안내 */}
                                        {currentUser && currentUser.level >= 11 && (
                                            <>
                                                <li><strong>Level 1:</strong> 기본 사용자 - 정보 조회만 가능</li>
                                                <li><strong>Level 2-4:</strong> 일반 직원 - 기본적인 조회 및 등록 권한</li>
                                                <li><strong>Level 5-7:</strong> 중간 관리자 - 수정/삭제 권한</li>
                                                <li><strong>Level 8-10:</strong> 고급 관리자 - 확장된 관리 권한</li>
                                                <li><strong>Level 11+:</strong> 시스템 관리자 - 전체 권한</li>
                                            </>
                                        )}
                                    </ul>
                                    
                                    {/* 현재 사용자 레벨 안내 */}
                                    {currentUser && (
                                        <div className="alert alert-info mt-3">
                                            <i className="fas fa-user-shield me-2"></i>
                                            <strong>현재 사용자:</strong> Level {currentUser.level} - {getLevelDescription(currentUser.level)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>

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
                                placeholder="레벨을 입력하세요"
                                min="1"
                                max={currentUser ? currentUser.level - 1 : 10}
                            />
                            <Form.Text className="text-muted">
                                1-{currentUser ? currentUser.level - 1 : 10} 사이의 숫자를 입력하세요
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
        </Container>

    );
};

export default MemberManagement;
