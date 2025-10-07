import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Container, Card, Button, Table, Badge, Row, Col, Alert, Form, Modal } from 'react-bootstrap';
import { FaPlus, FaSearch, FaFileAlt, FaCalendarAlt, FaMoneyBillWave, FaUser, FaHome, FaUsers, FaHandshake, FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight, FaTrash, FaEdit } from 'react-icons/fa';
import { UserContext } from '../UserContext';
import api from '../../utils/api';
import ContractRegistrationModal from './ContractRegistrationModal';

const ContractManagement = () => {
    const { user } = useContext(UserContext);
    const [contracts, setContracts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingContract, setEditingContract] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedBuyer, setSelectedBuyer] = useState(null);
    const [selectedSeller, setSelectedSeller] = useState(null);
    const [selectedAgent, setSelectedAgent] = useState(null);
    
    // 삭제 관련 상태
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [contractToDelete, setContractToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // 페이지네이션 상태
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(15);
    const [totalItems, setTotalItems] = useState(0);

    // 금액 포맷팅 함수
    const formatCurrency = (value) => {
        if (!value) return '';
        // 숫자와 콤마만 남기고 모두 제거
        const numbers = value.toString().replace(/[^\d,]/g, '');
        // 콤마 제거 후 숫자만 추출
        const cleanNumbers = numbers.replace(/,/g, '');
        if (cleanNumbers === '') return '';
        // 1000단위 콤마 추가
        return parseInt(cleanNumbers).toLocaleString();
    };



    // 계약 목록 가져오기
    const fetchContracts = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            const params = new URLSearchParams();
            if (filterStatus !== 'all') {
                params.append('status', filterStatus);
            }
            if (searchTerm) {
                params.append('search', searchTerm);
            }

            // 페이지네이션 파라미터 추가
            params.append('page', currentPage.toString());
            params.append('limit', itemsPerPage.toString());

            const response = await api.get(`/contracts?${params.toString()}`);

            if (response.data.success) {
                setContracts(response.data.data);
                setTotalItems(response.data.total || response.data.data.length);
            } else {
                setError('계약 목록을 불러오는데 실패했습니다.');
            }
        } catch (error) {
            console.error('계약 목록 조회 오류:', error);
            
            // 401 오류인 경우 로그인 만료 메시지 표시
            if (error.response?.status === 401) {
                setError('로그인이 만료되었습니다. 다시 로그인해주세요.');
            } else {
                setError('계약 목록을 불러오는 중 오류가 발생했습니다.');
            }
        } finally {
            setLoading(false);
        }
    }, [filterStatus, searchTerm, currentPage, itemsPerPage]);

    // 검색어나 필터 변경 시 페이지 리셋
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus]);

    useEffect(() => {
        fetchContracts();
    }, [fetchContracts]);

    const handleShowModal = (contract = null) => {
        setEditingContract(contract);
        setShowModal(true);

        // 기존 계약 수정 시 선택된 고객 정보 설정
        if (contract) {
            if (contract.buyer) {
                setSelectedBuyer(contract.buyer);
            }

            if (contract.seller) {
                setSelectedSeller(contract.seller);
            }
            if (contract.agent) {
                setSelectedAgent(contract.agent);
            }
        } else {
            setSelectedBuyer(null);
            setSelectedSeller(null);
            setSelectedAgent(null);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingContract(null);
        setSelectedBuyer(null);
        setSelectedSeller(null);
        setSelectedAgent(null);
    };

    // 삭제 확인 모달 열기
    const handleDeleteClick = (contract, e) => {
        e.stopPropagation(); // 행 클릭 이벤트 방지
        
        // 삭제 권한 확인
        if (!canDeleteContract(contract)) {
            setError('계약을 삭제할 권한이 없습니다.');
            return;
        }
        
        setContractToDelete(contract);
        setShowDeleteModal(true);
    };

    // 삭제 확인 모달 닫기
    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
        setContractToDelete(null);
    };

    // 계약 삭제 권한 확인
    const canDeleteContract = (contract) => {
        if (!user || !contract) return false;
        
        // 같은 사업자 번호의 계약인지 확인
        if (contract.byCompanyNumber !== user.businessNumber) {
            return false;
        }
        
        // 레벨이 5 이상인 경우 삭제 가능
        if (user.level >= 5) return true;
        
        // 당사자인 경우 삭제 가능 (매수자 또는 매도자)
        const isBuyer = contract.buyer && contract.buyer._id === user._id;
        const isSeller = contract.seller && contract.seller._id === user._id;
        
        return isBuyer || isSeller;
    };

    // 계약 수정 권한 확인
    const canEditContract = (contract) => {
        if (!user || !contract) return false;
        
        // 같은 사업자 번호의 계약인지 확인
        if (contract.byCompanyNumber !== user.businessNumber) {
            return false;
        }
        
        // 레벨이 5 이상인 경우 수정 가능
        if (user.level >= 5) return true;
        
        // 당사자인 경우 수정 가능 (매수자 또는 매도자)
        const isBuyer = contract.buyer && contract.buyer._id === user._id;
        const isSeller = contract.seller && contract.seller._id === user._id;
        
        return isBuyer || isSeller;
    };

    // 계약 삭제 실행
    const handleDeleteContract = async () => {
        if (!contractToDelete) return;

        // 삭제 권한 재확인
        if (!canDeleteContract(contractToDelete)) {
            setError('계약을 삭제할 권한이 없습니다.');
            setShowDeleteModal(false);
            setContractToDelete(null);
            return;
        }

        try {
            setDeleting(true);
            const response = await api.delete(`/contracts/${contractToDelete._id}`);

            if (response.data.success) {
                // 목록에서 삭제된 계약 제거
                setContracts(prevContracts => 
                    prevContracts.filter(contract => contract._id !== contractToDelete._id)
                );
                setTotalItems(prev => prev - 1);
                setShowDeleteModal(false);
                setContractToDelete(null);
            } else {
                setError(response.data.message || '계약 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('계약 삭제 오류:', error);
            setError('계약 삭제 중 오류가 발생했습니다.');
        } finally {
            setDeleting(false);
        }
    };

    // 페이지네이션 관련 함수들
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleFirstPage = () => {
        setCurrentPage(1);
    };

    const handleLastPage = () => {
        setCurrentPage(totalPages);
    };

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    // 표시할 페이지 번호들 계산 (최대 5개)
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            // 총 페이지가 5개 이하면 모든 페이지 표시
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            // 현재 페이지를 중심으로 5개 페이지 표시
            let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
            let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

            // 끝 페이지가 총 페이지 수에 가까우면 시작 페이지 조정
            if (endPage - startPage + 1 < maxVisiblePages) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }

            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }
        }

        return pageNumbers;
    };



    const filteredContracts = contracts.filter(contract => {
        // 사용자가 로그인하지 않은 경우 모든 계약 숨김
        if (!user || !user.businessNumber) {
            return false;
        }

        // byCompanyNumber 기반 필터링
        if (contract.byCompanyNumber !== user.businessNumber) {
            return false;
        }

        return true;
    });

    const getStatusBadge = (status) => {
        const variants = {
            '진행중': 'primary',
            '완료': 'success',
            '취소': 'danger',
            '보류': 'warning'
        };
        return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
    };



    const getCustomerDisplayInfo = (customer) => {
        if (!customer) {
            return {
                name: '미지정',
                phone: '',
                email: ''
            };
        }
        return {
            name: customer.name || '미지정',
            phone: customer.phone || '',
            email: customer.email || ''
        };
    };

    // user가 로드되지 않은 경우 로딩 표시
    if (!user) {
        return (
            <Container className="mt-4" style={{ paddingBottom: '80px' }}>
                <Card className="shadow-sm">
                    <Card.Body className="text-center py-5">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3 text-muted">사용자 정보를 불러오는 중...</p>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    // level 2 이하인 경우 접근 제한
    if (user.level <= 2) {
        return (
            <Container className="mt-4" style={{ paddingBottom: '80px' }}>
                <Card className="shadow-sm">
                    <Card.Header className="bg-danger text-white">
                        <h4 className="mb-0">
                            <FaFileAlt className="me-2" />
                            접근 제한
                        </h4>
                    </Card.Header>
                    <Card.Body className="text-center py-5">
                        <div className="mb-4">
                            <FaFileAlt size={64} className="text-muted mb-3" />
                            <h5 className="text-muted">권한이 부족합니다</h5>
                            <p className="text-muted">
                                계약 관리 기능을 이용하려면 더 높은 권한이 필요합니다.<br />
                                관리자에게 문의하세요.
                            </p>
                        </div>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    return (
        <Container className="mt-4" style={{ paddingBottom: '80px' }}>
            {/* 알림 메시지 */}
            {error && (
                <Alert variant="danger" onClose={() => setError('')} dismissible>
                    {error}
                </Alert>
            )}

            <Card className="shadow-sm">
                <Card.Header className="bg-primary text-white">
                    <h4 className="mb-0">
                        <FaFileAlt className="me-2" />
                        계약 관리
                    </h4>
                </Card.Header>
                <Card.Body className="pb-4">
                    {/* 사업자 번호 기반 필터링 안내 */}
                    <Alert variant="info" className="mb-3">
                        <FaUsers className="me-2" />
                        <strong>사업자 번호 기반 필터링:</strong> 현재 로그인한 사용자의 사업자 번호와 일치하는 계약만 표시됩니다.
                        {user && user.businessNumber && (
                            <span className="ms-2">
                                (현재: {user.businessNumber})
                            </span>
                        )}
                    </Alert>

                    {/* 검색 및 필터 */}
                    <Row className="mb-3">
                        <Col xs={12} md={6} className="mb-2 mb-md-0">
                            <div className="input-group">
                                <span className="input-group-text">
                                    <FaSearch />
                                </span>
                                <Form.Control
                                    type="text"
                                    placeholder="계약번호, 매물, 고객명으로 검색..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </Col>
                        <Col xs={6} md={3} className="mb-2 mb-md-0">
                            <Form.Select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">전체 상태</option>
                                <option value="진행중">진행중</option>
                                <option value="완료">완료</option>
                                <option value="취소">취소</option>
                                <option value="보류">보류</option>
                            </Form.Select>
                        </Col>
                        <Col xs={6} md={3}>
                            <Button
                                variant="success"
                                onClick={() => handleShowModal()}
                                className="w-100"
                                disabled={loading}
                            >
                                <FaPlus className="me-2" />
                                <span className="d-none d-sm-inline">
                                    {loading ? '처리중...' : '계약 등록'}
                                </span>
                                <span className="d-sm-none">등록</span>
                            </Button>
                        </Col>
                    </Row>

                    {/* 계약 목록 */}
                    {loading ? (
                        <div className="text-center py-4">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <Table responsive hover className="table-sm mb-4">
                            <thead className="table-light">
                                <tr>
                                    <th className="d-none d-md-table-cell">계약번호</th>
                                    <th className="d-none d-md-table-cell">매물</th>
                                    <th className="d-none d-md-table-cell">계약자</th>
                                    <th className="d-none d-md-table-cell">계약금액</th>
                                    <th className="d-none d-md-table-cell">계약일</th>
                                    <th className="d-none d-md-table-cell">완료일</th>
                                    <th className="d-none d-md-table-cell">상태</th>
                                    <th className="d-none d-md-table-cell">담당자</th>
                                    <th className="d-none d-md-table-cell">액션</th>

                                    <th className="d-md-none">계약 정보</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredContracts.map(contract => {
                                    const buyerInfo = getCustomerDisplayInfo(contract.buyer);
                                    const sellerInfo = getCustomerDisplayInfo(contract.seller);

                                    return (
                                        <tr 
                                            key={contract._id} 
                                            className="mb-2" 
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleShowModal(contract)}
                                            onMouseEnter={(e) => e.target.closest('tr').style.backgroundColor = '#f8f9fa'}
                                            onMouseLeave={(e) => e.target.closest('tr').style.backgroundColor = ''}
                                        >
                                            {/* 데스크톱 버전 */}
                                            <td className="d-none d-md-table-cell">
                                                <strong>{contract.contractNumber}</strong>
                                                <div className="text-muted small">
                                                    {contract.contractNumber?.startsWith('MM-') && '매매'}
                                                    {contract.contractNumber?.startsWith('MS-') && '월세'}
                                                    {contract.contractNumber?.startsWith('FS-') && '전세'}
                                                    {contract.contractNumber?.startsWith('CT-') && '계약'}
                                                </div>
                                            </td>
                                            <td className="d-none d-md-table-cell">
                                                <FaHome className="text-muted me-1" />
                                                {contract.property && contract.property.title ? contract.property.title : '매물 정보 없음'}
                                            </td>
                                            <td className="d-none d-md-table-cell">
                                                <div>
                                                    <div><FaUser className="text-primary me-1" />매수: {buyerInfo.name}</div>
                                                    <div><FaUser className="text-warning me-1" />매도: {sellerInfo.name}</div>
                                                </div>
                                            </td>
                                            <td className="d-none d-md-table-cell">
                                                <div>
                                                    <FaMoneyBillWave className="text-success me-1" />
                                                    {contract.price ? `${formatCurrency(contract.price)}원` : '-'}
                                                    {contract.type === '월세' && contract.deposit && (
                                                        <div className="text-muted small">
                                                            <FaHandshake className="me-1" />
                                                            보증금: {formatCurrency(contract.deposit)}원
                                                        </div>
                                                    )}
                                                    {contract.commission && (
                                                        <div className="text-muted small">
                                                            <FaHandshake className="me-1" />
                                                            수수료: {formatCurrency(contract.commission)}원
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="d-none d-md-table-cell">
                                                <FaCalendarAlt className="text-muted me-1" />
                                                {new Date(contract.contractDate).toLocaleDateString('ko-KR')}
                                            </td>
                                            <td className="d-none d-md-table-cell">
                                                {contract.closingDate ? new Date(contract.closingDate).toLocaleDateString('ko-KR') : '-'}
                                            </td>
                                            <td className="d-none d-md-table-cell">
                                                {getStatusBadge(contract.status)}
                                                {contract.status === '완료' && contract.type === '매매' && (
                                                    <div className="small text-success mt-1">
                                                        <FaHandshake className="me-1" />
                                                        매물 소유권 이전 완료
                                                    </div>
                                                )}
                                            </td>
                                            <td className="d-none d-md-table-cell">
                                                {contract.agent ? (
                                                    <div>
                                                        <FaUser className="text-primary me-1" />
                                                        {contract.agent.name}
                                                        <div className="text-muted small">
                                                            {contract.agent.email}
                                                        </div>
                                                    </div>
                                                ) : '-'}
                                            </td>
                                            <td className="d-none d-md-table-cell">
                                                <div className="d-flex gap-1">
                                                    {canEditContract(contract) && (
                                                        <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            onClick={(e) => handleShowModal(contract)}
                                                            title="수정"
                                                        >
                                                            <FaEdit />
                                                        </Button>
                                                    )}
                                                    {canDeleteContract(contract) && (
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={(e) => handleDeleteClick(contract, e)}
                                                            title="삭제"
                                                        >
                                                            <FaTrash />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>


                                            {/* 모바일 버전 */}
                                            <td className="d-md-none">
                                                <div className="d-flex justify-content-between align-items-start py-5">
                                                    <div className="flex-grow-1">
                                                        <div className="fw-bold mb-1">{contract.contractNumber}</div>
                                                        <div className="small text-muted mb-1">
                                                            {contract.contractNumber?.startsWith('MM-') && '매매'}
                                                            {contract.contractNumber?.startsWith('MS-') && '월세'}
                                                            {contract.contractNumber?.startsWith('FS-') && '전세'}
                                                            {contract.contractNumber?.startsWith('CT-') && '계약'}
                                                        </div>
                                                        <div className="small mb-2">
                                                            <FaHome className="text-muted me-1" />
                                                            {contract.property && contract.property.title ? contract.property.title : '매물 정보 없음'}
                                                        </div>
                                                        <div className="small mb-2">
                                                            <FaUser className="text-primary me-1" />
                                                            매수: {buyerInfo.name}
                                                        </div>
                                                        <div className="small mb-2">
                                                            <FaUser className="text-warning me-1" />
                                                            매도: {sellerInfo.name}
                                                        </div>
                                                        <div className="small mb-2">
                                                            <FaMoneyBillWave className="text-success me-1" />
                                                            {contract.price ? `${formatCurrency(contract.price)}원` : '-'}
                                                            {contract.type === '월세' && contract.deposit && (
                                                                <div className="text-muted">
                                                                    보증금: {formatCurrency(contract.deposit)}원
                                                                </div>
                                                            )}
                                                            {contract.commission && (
                                                                <div className="text-muted">
                                                                    수수료: {formatCurrency(contract.commission)}원
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="small text-muted mb-2">
                                                            <FaCalendarAlt className="text-muted me-1" />
                                                            계약일: {new Date(contract.contractDate).toLocaleDateString('ko-KR')}
                                                        </div>
                                                        {contract.closingDate && (
                                                            <div className="small text-muted mb-2">
                                                                완료일: {new Date(contract.closingDate).toLocaleDateString('ko-KR')}
                                                            </div>
                                                        )}
                                                        <div className="small mb-2">
                                                            {getStatusBadge(contract.status)}
                                                        </div>
                                                        {contract.agent && (
                                                            <div className="small text-muted mb-2">
                                                                <FaUser className="text-primary me-1" />
                                                                담당자: {contract.agent.name}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ms-3 d-flex flex-column gap-1">
                                                        {canEditContract(contract) && (
                                                            <Button
                                                                variant="outline-primary"
                                                                size="sm"
                                                                onClick={(e) => handleShowModal(contract)}
                                                                title="수정"
                                                            >
                                                                <FaEdit />
                                                            </Button>
                                                        )}
                                                        {canDeleteContract(contract) && (
                                                            <Button
                                                                variant="outline-danger"
                                                                size="sm"
                                                                onClick={(e) => handleDeleteClick(contract, e)}
                                                                title="삭제"
                                                            >
                                                                <FaTrash />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    )}

                    {!loading && filteredContracts.length === 0 && (
                        <div className="text-center py-4">
                            <FaFileAlt size={48} className="text-muted mb-3" />
                            <p className="text-muted">
                                {contracts.length === 0 ?
                                    '등록된 계약이 없습니다.' :
                                    '현재 사업자 번호와 일치하는 계약이 없습니다.'
                                }
                            </p>
                            {contracts.length > 0 && (
                                <small className="text-muted">
                                    전체 {contracts.length}개의 계약 중 {filteredContracts.length}개가 표시됩니다.
                                </small>
                            )}
                        </div>
                    )}

                    {/* 페이지네이션 */}
                    {!loading && totalPages > 1 && (
                        <div className="d-flex justify-content-center mt-4">
                            <nav aria-label="계약 목록 페이지네이션">
                                <ul className="pagination pagination-sm">
                                    {/* 맨 앞으로 버튼 */}
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={handleFirstPage}
                                            disabled={currentPage === 1}
                                            aria-label="첫 페이지"
                                        >
                                            <FaAngleDoubleLeft />
                                        </button>
                                    </li>

                                    {/* 이전 버튼 */}
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={handlePrevPage}
                                            disabled={currentPage === 1}
                                            aria-label="이전 페이지"
                                        >
                                            <FaChevronLeft />
                                        </button>
                                    </li>

                                    {/* 페이지 번호들 */}
                                    {getPageNumbers().map(number => (
                                        <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => handlePageChange(number)}
                                            >
                                                {number}
                                            </button>
                                        </li>
                                    ))}

                                    {/* 다음 버튼 */}
                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={handleNextPage}
                                            disabled={currentPage === totalPages}
                                            aria-label="다음 페이지"
                                        >
                                            <FaChevronRight />
                                        </button>
                                    </li>

                                    {/* 맨 뒤로 버튼 */}
                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={handleLastPage}
                                            disabled={currentPage === totalPages}
                                            aria-label="마지막 페이지"
                                        >
                                            <FaAngleDoubleRight />
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* 계약 등록/수정 모달 */}
            <ContractRegistrationModal
                show={showModal}
                onHide={handleCloseModal}
                editingContract={editingContract}
                onSuccess={fetchContracts}
                selectedBuyer={selectedBuyer}
                setSelectedBuyer={setSelectedBuyer}
                selectedSeller={selectedSeller}
                setSelectedSeller={setSelectedSeller}
                selectedAgent={selectedAgent}
                setSelectedAgent={setSelectedAgent}
                user={user}
            />

            {/* 삭제 확인 모달 */}
            <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <FaTrash className="text-danger me-2" />
                        계약 삭제 확인
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>다음 계약을 삭제하시겠습니까?</p>
                    {contractToDelete && (
                        <div className="bg-light p-3 rounded">
                            <div><strong>계약번호:</strong> {contractToDelete.contractNumber}</div>
                            <div><strong>계약유형:</strong> {contractToDelete.type}</div>
                            <div><strong>매물:</strong> {contractToDelete.property?.title || 'N/A'}</div>
                            <div><strong>계약일:</strong> {new Date(contractToDelete.contractDate).toLocaleDateString('ko-KR')}</div>
                        </div>
                    )}
                    <div className="alert alert-warning mt-3">
                        <strong>주의:</strong> 이 작업은 되돌릴 수 없습니다. 관련된 일정도 함께 삭제됩니다.
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseDeleteModal}>
                        취소
                    </Button>
                    <Button 
                        variant="danger" 
                        onClick={handleDeleteContract}
                        disabled={deleting}
                    >
                        {deleting ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                삭제 중...
                            </>
                        ) : (
                            <>
                                <FaTrash className="me-2" />
                                삭제
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default ContractManagement; 