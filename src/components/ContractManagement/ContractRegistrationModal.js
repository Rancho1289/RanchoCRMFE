import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { FaUsers, FaFileAlt, FaPlus, FaInfoCircle } from 'react-icons/fa';
import api from '../../utils/api';
import CustomerRegistrationModal from '../CustomerManagement/CustomerRegistrationModal';

const ContractRegistrationModal = ({
    show,
    onHide,
    editingContract,
    onSuccess,
    selectedBuyer,
    setSelectedBuyer,
    selectedSeller,
    setSelectedSeller,
    selectedAgent,
    setSelectedAgent,
    user
}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [contractType, setContractType] = useState('매매');
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [customerSearchTerm, setCustomerSearchTerm] = useState('');
    const [customerType, setCustomerType] = useState('buyer');
    const [customerLoading, setCustomerLoading] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [users, setUsers] = useState([]);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showCustomerAddModal, setShowCustomerAddModal] = useState(false);
    const [showPropertySelectionModal, setShowPropertySelectionModal] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [searchTimeout, setSearchTimeout] = useState(null); // 검색 디바운싱을 위한 timeout
    const [showCustomerEditModal, setShowCustomerEditModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [propertyModalKey, setPropertyModalKey] = useState(0);
    const [forceRefresh, setForceRefresh] = useState(0);

    // 금액 포맷팅 함수
    const formatCurrency = (value) => {
        if (!value) return '';
        const numbers = value.toString().replace(/[^\d,]/g, '');
        const cleanNumbers = numbers.replace(/,/g, '');
        if (cleanNumbers === '') return '';
        return parseInt(cleanNumbers).toLocaleString();
    };

    // 금액 입력 처리 함수
    const handleCurrencyInput = (e) => {
        const formatted = formatCurrency(e.target.value);
        e.target.value = formatted;
    };

    // 고객 목록 가져오기 (CustomerManagement API 사용)
    const fetchCustomers = async (type = 'all', search = '') => {
        try {
            setCustomerLoading(true);
            const params = new URLSearchParams();

            // 검색어가 있으면 추가
            if (search) {
                params.append('search', search);
            }

            // 전체 고객을 가져오기 위해 일반 탭 사용 (CustomerManagement.js의 general 모드와 동일)
            params.append('tabType', '일반');

            // 활성 상태 필터 추가 (비활성 고객 제외)
            params.append('status', '활성');

            // 페이지네이션 파라미터 (모든 고객을 가져오기 위해 큰 값 설정)
            params.append('page', '1');
            params.append('limit', '300');

            const response = await api.get(`/customers?${params.toString()}`);

            if (response.data.success) {
                // 추가로 비활성화된 고객 필터링 (프론트엔드에서 한번 더 확인)
                const activeCustomers = response.data.data.filter(customer => customer.status === '활성');
                setCustomers(activeCustomers);
            } else {
                console.error('고객 목록 조회 실패:', response.data.message);
            }
        } catch (error) {
            console.error('고객 목록 조회 오류:', error);
        } finally {
            setCustomerLoading(false);
        }
    };

    // 사용자 목록 가져오기
    const fetchUsers = async () => {
        try {
            const response = await api.get('/contracts/users/list');
            if (response.data.success) {
                setUsers(response.data.data);
            }
        } catch (error) {
            console.error('사용자 목록 조회 오류:', error);
        }
    };

    useEffect(() => {
        if (show) {
            fetchUsers();
            if (editingContract) {
                setContractType(editingContract.type || '매매');

                // 기존 계약 정보로 상태 설정
                if (editingContract.property) {
                    // property가 populate된 객체인지 확인
                    if (typeof editingContract.property === 'object' && editingContract.property._id) {
                        setSelectedProperty(editingContract.property);
                    } else {
                        // property가 ID 문자열인 경우, 나중에 fetchProperty로 가져올 수 있음
                    }
                }

                if (editingContract.buyer) {
                    if (typeof editingContract.buyer === 'object' && editingContract.buyer._id) {
                        setSelectedBuyer(editingContract.buyer);
                    }
                }

                if (editingContract.seller) {
                    if (typeof editingContract.seller === 'object' && editingContract.seller._id) {
                        setSelectedSeller(editingContract.seller);
                    }
                }

                if (editingContract.agent) {
                    if (typeof editingContract.agent === 'object' && editingContract.agent._id) {
                        setSelectedAgent(editingContract.agent);
                    }
                }
            }
        }

        // cleanup 함수: 컴포넌트 언마운트 시 timeout 정리
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [show, editingContract, searchTimeout]);

    // 새 계약 생성 시에만 초기화하는 별도 useEffect
    useEffect(() => {
        if (show && !editingContract) {
            setContractType('매매');
            setSelectedProperty(null);
            setSelectedBuyer(null);
            setSelectedSeller(null);
            setSelectedAgent(user);
        }
    }, [show, editingContract, user]);


    // selectedSeller가 변경될 때마다 강제 리렌더링
    useEffect(() => {
        if (selectedSeller) {
            setForceRefresh(prev => prev + 1);
        }
    }, [selectedSeller]);

    const handleCloseModal = () => {
        setError('');
        // 모달을 완전히 닫을 때만 고객 정보 초기화
        setSelectedBuyer(null);
        setSelectedSeller(null);
        setSelectedProperty(null);
        // 모달 닫을 때 담당자를 현재 사용자로 초기화
        setSelectedAgent(user);
        setContractType('매매');
        onHide();
    };

    const handleShowCustomerModal = (type) => {
        setCustomerType(type);
        setCustomerSearchTerm('');
        setCustomers([]);
        setShowCustomerModal(true);
        fetchCustomers('all', ''); // 모든 고객을 가져오도록 수정
    };

    const handleCloseCustomerModal = () => {
        setShowCustomerModal(false);
        setCustomerSearchTerm('');
        setCustomers([]);
    };

    const handleCloseUserModal = () => {
        setShowUserModal(false);
    };

    const handleShowCustomerAddModal = () => {
        setShowCustomerAddModal(true);
    };

    const handleCloseCustomerAddModal = () => {
        setShowCustomerAddModal(false);
    };

    const handlePropertySelect = (property) => {
        setSelectedProperty(property);

        // 매물의 type이 배열이면 첫 번째, 아니면 문자열 그대로
        if (property.type) {
            if (Array.isArray(property.type)) {
                setContractType(property.type[0]);
            } else {
                setContractType(property.type);
            }
        }

        setShowPropertySelectionModal(false);
    };

    const handleClosePropertySelectionModal = () => {
        setShowPropertySelectionModal(false);
        setSelectedProperty(null);
        // setSelectedSeller(null); // 매도자 초기화 제거
    };

    const handleShowCustomerEditModal = () => {
        if (selectedSeller) {
            setEditingCustomer(selectedSeller);
            setShowCustomerEditModal(true);
        }
    };

    const handleCloseCustomerEditModal = () => {
        setShowCustomerEditModal(false);
        setEditingCustomer(null);
    };

    const handleCustomerEditSuccess = async (updatedCustomer) => {
        handleCloseCustomerEditModal();
        
        // updatedCustomer가 undefined인 경우 처리
        if (!updatedCustomer || !updatedCustomer._id) {
            // 현재 selectedSeller를 사용하여 새로고침
            if (selectedSeller && selectedSeller._id) {
                try {
                    const response = await api.get(`/customers/${selectedSeller._id}`);
                    if (response.data.success) {
                        setSelectedSeller(response.data.data);
                        setPropertyModalKey(prev => prev + 1);
                        setForceRefresh(prev => prev + 1);
                    }
                } catch (error) {
                    console.error('현재 고객 정보 새로고침 실패:', error);
                }
            }
            return;
        }
        
        // 고객의 최신 정보를 다시 가져와서 매물 목록을 새로고침
        try {
            const response = await api.get(`/customers/${updatedCustomer._id}`);
            if (response.data.success) {
                // 최신 고객 정보로 selectedSeller 업데이트
                const newSellerData = response.data.data;
                setSelectedSeller(newSellerData);
                
                // 강제 새로고침을 위한 키 업데이트
                setPropertyModalKey(prev => prev + 1);
                setForceRefresh(prev => prev + 1);
                
                // 추가적인 강제 리렌더링을 위한 약간의 지연
                setTimeout(() => {
                    setForceRefresh(prev => prev + 1);
                }, 100);
            }
        } catch (error) {
            console.error('고객 정보 새로고침 실패:', error);
            // API 호출 실패 시에도 기본 정보로 업데이트
            if (updatedCustomer && updatedCustomer._id) {
                setSelectedSeller(updatedCustomer);
                setPropertyModalKey(prev => prev + 1);
                setForceRefresh(prev => prev + 1);
            }
        }
    };

    const handleCustomerAddSuccess = (newCustomer) => {
        // 새로 등록된 고객을 바로 선택
        if (newCustomer && typeof newCustomer === 'object') {
            if (customerType === 'buyer') {
                setSelectedBuyer(newCustomer);
            } else {
                setSelectedSeller(newCustomer);
                // 매물 정보는 React state로 자동 관리됨
            }
        }
        handleCloseCustomerAddModal();
        handleCloseCustomerModal(); // 고객 선택 모달도 함께 닫기
    };

    const handleUserSelect = (user) => {
        setSelectedAgent(user);
        const form = document.querySelector('form');
        if (form) {
            form.querySelector('[name="agent"]').value = user._id;
        }
        handleCloseUserModal();
    };

    const handleContractTypeChange = (e) => {
        setContractType(e.target.value);
    };

    const handleCustomerSearchChange = (e) => {
        const searchValue = e.target.value;
        setCustomerSearchTerm(searchValue);

        // 기존 timeout 클리어
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        // 디바운싱: 300ms 후에 검색 실행
        const newTimeout = setTimeout(() => {
            fetchCustomers('all', searchValue);
        }, 300);

        setSearchTimeout(newTimeout);
    };

    const handleCustomerSelect = (customer) => {
        // user가 로드되지 않은 경우 처리
        if (!user) {
            setError('사용자 정보를 불러올 수 없습니다.');
            return;
        }

        // 비활성화된 고객은 선택할 수 없음
        if (customer.status !== '활성') {
            setError('비활성화된 고객은 선택할 수 없습니다.');
            return;
        }

        // 권한 체크: level 2 이하인 경우 선택 불가
        if (user.level <= 2) {
            setError('고객을 선택할 권한이 없습니다.');
            return;
        }

        // 권한 체크: level 11 미만인 경우 본인이 등록한 고객만 선택 가능
        if (user.level < 11 && customer.publisher?.businessNumber !== user.businessNumber) {
            setError('본인이 등록한 고객만 선택할 수 있습니다.');
            return;
        }

        // 고객 선택 처리
        if (customerType === 'buyer') {
            setSelectedBuyer(customer);
        } else {
            setSelectedSeller(customer);
            // 매도자인 경우 매물 선택 모달도 표시
            setTimeout(() => {
                setShowPropertySelectionModal(true);
            }, 200);
        }

        // 모달 닫기 전에 상태 업데이트 완료 대기
        setTimeout(() => {
            setShowCustomerModal(false);
            setCustomerSearchTerm('');
            setCustomers([]); // 검색 결과 초기화
        }, 100);
    };

    const handleDelete = async () => {
        if (!editingContract) return;

        const confirmed = window.confirm(
            `계약 "${editingContract.contractNumber}"을(를) 정말 삭제하시겠습니까?\n\n` +
            '⚠️ 주의사항:\n' +
            '• 삭제된 계약은 복구할 수 없습니다\n' +
            '• 관련된 모든 데이터가 함께 삭제됩니다\n\n' +
            '정말 계속하시겠습니까?'
        );

        if (!confirmed) return;

        try {
            setLoading(true);
            setError('');

            const response = await api.delete(`/contracts/${editingContract._id}`);

            if (response.data.success) {
                handleCloseModal();
                onSuccess();
            } else {
                setError(response.data.message || '계약 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('계약 삭제 오류:', error);
            if (error.response && error.response.data) {
                setError(error.response.data.message || '계약 삭제 중 오류가 발생했습니다.');
            } else {
                setError('계약 삭제 중 오류가 발생했습니다.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');

            const formData = new FormData(e.target);
            const removeCommas = (value) => {
                if (!value) return '';
                return value.toString().replace(/,/g, '');
            };

            // 계약 상태 확인 - 매매 계약에만 매물 소유권 이전 경고 표시
            const contractStatus = formData.get('status');
            if (contractStatus === '완료' && contractType === '매매') {
                const isNewContract = !editingContract;
                const isStatusChange = editingContract && editingContract.status !== '완료';

                if (isNewContract || isStatusChange) {
                    const confirmed = window.confirm(
                        '매매 계약을 "완료" 상태로 ' + (isNewContract ? '생성' : '변경') + '하시겠습니까?\n\n' +
                        '⚠️ 주의사항:\n' +
                        '• 매물 소유권이 즉시 매수자에게 이전됩니다\n' +
                        '• 매도자의 매물 목록에서 해당 매물이 제거됩니다\n' +
                        '• 매수자의 매물 목록에 해당 매물이 추가됩니다\n\n' +
                        '정말 계속하시겠습니까?'
                    );

                    if (!confirmed) {
                        setLoading(false);
                        return;
                    }
                }
            }

            // 매수자 정보 검증
            if (!selectedBuyer) {
                setError('매수자를 선택해주세요.');
                setLoading(false);
                return;
            }

            // 매도자 정보 검증
            if (!selectedSeller) {
                setError('매도자를 선택해주세요.');
                setLoading(false);
                return;
            }

            const contractData = {
                type: contractType, // FormData.get('type') 대신 contractType 상태 변수 사용
                property: selectedProperty ? selectedProperty._id : null, // selectedProperty가 없으면 null
                buyer: selectedBuyer._id,
                seller: selectedSeller._id,
                price: removeCommas(formData.get('price')) || '',
                commission: removeCommas(formData.get('commission')) || '',
                deposit: removeCommas(formData.get('deposit')) || '',
                contractDate: formData.get('contractDate'),
                closingDate: formData.get('closingDate') || null,
                status: formData.get('status'), // 사용자가 선택한 상태 그대로 사용
                agent: formData.get('agent'),
                notes: formData.get('notes')
            };

            // 매물 선택 검증 추가
            if (!selectedProperty) {
                setError('매물을 선택해주세요.');
                setLoading(false);
                return;
            }



            let response;
            if (editingContract) {
                response = await api.put(`/contracts/${editingContract._id}`, contractData);
            } else {
                response = await api.post('/contracts', contractData);
            }

            if (response.data.success) {
                handleCloseModal();
                onSuccess();
            } else {
                setError(response.data.message || '계약 정보 저장에 실패했습니다.');
            }
        } catch (error) {
            console.error('계약 저장 오류:', error);
            if (error.response && error.response.data) {
                setError(error.response.data.message || '계약 정보 저장 중 오류가 발생했습니다.');
            } else {
                setError('계약 정보 저장 중 오류가 발생했습니다.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* 계약 등록/수정 모달 */}
            <Modal show={show} onHide={handleCloseModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <FaFileAlt className="me-2" />
                        {editingContract ? '계약 수정' : '계약 등록'}
                        {editingContract?.status === '완료' && (
                            <span className="badge bg-success ms-2">완료됨</span>
                        )}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        {error && (
                            <Alert variant="danger" onClose={() => setError('')} dismissible>
                                {error}
                            </Alert>
                        )}
                        {editingContract?.status === '완료' && (
                            <Alert variant="info" className="mb-3">
                                <FaInfoCircle className="me-2" />
                                이 계약은 완료되었습니다. 완료된 계약은 수정할 수 없습니다.
                            </Alert>
                        )}
                        {!editingContract && (
                            <Alert variant="info" className="mb-3">
                                <FaInfoCircle className="me-2" />
                                새 계약은 기본적으로 "진행중" 상태로 시작됩니다.
                                계약이 완료되면 상태를 "완료"로 변경하여 매물 소유권을 이전할 수 있습니다.
                                <br />
                                <strong>주의:</strong> "완료" 상태로 계약을 생성하면 즉시 매물 소유권이 매수자에게 이전됩니다.
                            </Alert>
                        )}

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>계약 유형</Form.Label>
                                    <Form.Select
                                        name="type"
                                        value={contractType}
                                        onChange={handleContractTypeChange}
                                        disabled={editingContract?.status === '완료'}
                                    >
                                        <option value="매매">매매</option>
                                        <option value="월세">월세</option>
                                        <option value="전세">전세</option>
                                    </Form.Select>
                                    {selectedSeller && selectedSeller.saleType && selectedSeller.saleType !== '-' && (
                                        <small className="text-info">
                                            매도자의 판매 방식({selectedSeller.saleType})에 따라 자동 설정되었습니다.
                                        </small>
                                    )}
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>담당자</Form.Label>
                                    <Form.Control
                                        name="agent"
                                        type="hidden"
                                        defaultValue={editingContract?.agent?._id || selectedAgent?._id || ''}
                                        required
                                    />
                                    {selectedAgent && (
                                        <div className="alert alert-info py-2 mb-0">
                                            <small>
                                                <strong>담당자:</strong> {selectedAgent.name}<br />
                                                <strong>연락처:</strong> {selectedAgent.phone} | {selectedAgent.email}
                                            </small>
                                        </div>
                                    )}
                                </Form.Group>
                            </Col>
                        </Row>




                        {/* 매수자 선택 */}
                        <Row className="mb-3">
                            <Col md={12}>
                                <Form.Label>매수자</Form.Label>
                                <Button
                                    type="button"
                                    variant={selectedBuyer ? "success" : "outline-primary"}
                                    size="sm"
                                    onClick={() => handleShowCustomerModal('buyer')}
                                    className="w-100"
                                    disabled={editingContract || editingContract?.status === '완료'}
                                >
                                    <FaUsers className="me-1" />
                                    {selectedBuyer ? '고객 변경' : '고객 선택'}
                                </Button>
                                {selectedBuyer && (
                                    <Row className="mt-2">
                                        <Col md={12}>
                                            <div className="alert alert-info py-2 mb-0">
                                                <small>
                                                    <strong>선택된 고객:</strong> {selectedBuyer.name} ({selectedBuyer.type})<br />
                                                    <strong>연락처:</strong> {selectedBuyer.phone} | {selectedBuyer.email}
                                                </small>
                                            </div>
                                        </Col>
                                    </Row>
                                )}
                                {editingContract && (
                                    <small className="text-muted">
                                        계약 수정 시에는 매수자를 변경할 수 없습니다.
                                    </small>
                                )}
                            </Col>
                        </Row>

                        {/* 매도자 선택 */}
                        <Row className="mb-3">
                            <Col md={12}>
                                <Form.Label>매도자</Form.Label>
                                <Button
                                    type="button"
                                    variant={selectedSeller ? "success" : "outline-warning"}
                                    size="sm"
                                    onClick={() => handleShowCustomerModal('seller')}
                                    className="w-100"
                                    disabled={editingContract || editingContract?.status === '완료'}
                                >
                                    <FaUsers className="me-1" />
                                    {selectedSeller ? '매도자 변경' : '매도자 선택'}
                                </Button>
                                {selectedSeller && (
                                    <Row className="mt-2">
                                        <Col md={12}>
                                            <div className="alert alert-warning py-2 mb-0">
                                                <small>
                                                    <strong>선택된 매도자:</strong> {selectedSeller.name} ({selectedSeller.type})<br />
                                                    <strong>연락처:</strong> {selectedSeller.phone} | {selectedSeller.email}<br />
                                                    <strong>보유 매물:</strong> {selectedSeller.properties?.length || 0}개
                                                </small>
                                            </div>
                                        </Col>
                                    </Row>
                                )}
                                {editingContract && (
                                    <small className="text-muted">
                                        계약 수정 시에는 매도자를 변경할 수 없습니다.
                                    </small>
                                )}
                            </Col>
                        </Row>

                        {/* 매물 정보 */}
                        <Row className="mb-3">
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>매물 정보</Form.Label>
                                    <Form.Control
                                        name="property"
                                        type="text"
                                        value={(() => {
                                            if (selectedProperty) {
                                                return selectedProperty.title || selectedProperty.address || '매물명 없음';
                                            } else if (editingContract?.property) {
                                                return editingContract.property;
                                            }
                                            return '';
                                        })()}
                                        placeholder="매도자를 선택한 후 매물을 선택해주세요"
                                        required
                                        readOnly
                                    />
                                    {selectedProperty ? (
                                        <small className="text-success">
                                            ✓ 선택된 매물: {selectedProperty.title || selectedProperty.address}
                                        </small>
                                    ) : selectedSeller && !editingContract ? (
                                        <small className="text-warning">
                                            매도자를 선택했으니 매물을 선택해주세요.
                                        </small>
                                    ) : !selectedSeller && !editingContract ? (
                                        <small className="text-warning">
                                            매물 정보를 설정하려면 먼저 매도자를 선택해주세요.
                                        </small>
                                    ) : (
                                        <small className="text-info">
                                            기존 계약의 매물 정보입니다.
                                        </small>
                                    )}
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            {contractType === '매매' ? (
                                <>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>매매가격</Form.Label>
                                            <div className="input-group">
                                                <Form.Control
                                                    name="price"
                                                    defaultValue={editingContract?.price ? formatCurrency(editingContract.price) : ''}
                                                    placeholder="예: 1,500,000,000"
                                                    onChange={handleCurrencyInput}
                                                    disabled={editingContract?.status === '완료'}
                                                />
                                                <span className="input-group-text">원</span>
                                            </div>
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>중계수수료</Form.Label>
                                            <div className="input-group">
                                                <Form.Control
                                                    name="commission"
                                                    defaultValue={editingContract?.commission ? formatCurrency(editingContract.commission) : ''}
                                                    placeholder="예: 15,000,000"
                                                    onChange={handleCurrencyInput}
                                                    disabled={editingContract?.status === '완료'}
                                                />
                                                <span className="input-group-text">원</span>
                                            </div>
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>완료일</Form.Label>
                                            <Form.Control
                                                type="date"
                                                name="closingDate"
                                                defaultValue={editingContract?.closingDate ?
                                                    new Date(editingContract.closingDate).toISOString().split('T')[0] : ''}
                                                disabled={editingContract?.status === '완료'}
                                            />
                                        </Form.Group>
                                    </Col>
                                </>
                            ) : contractType === '월세' ? (
                                <>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>월세</Form.Label>
                                            <div className="input-group">
                                                <Form.Control
                                                    name="price"
                                                    defaultValue={editingContract?.price ? formatCurrency(editingContract.price) : ''}
                                                    placeholder="예: 500,000"
                                                    onChange={handleCurrencyInput}
                                                    disabled={editingContract?.status === '완료'}
                                                />
                                                <span className="input-group-text">원</span>
                                            </div>
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>보증금</Form.Label>
                                            <div className="input-group">
                                                <Form.Control
                                                    name="deposit"
                                                    defaultValue={editingContract?.deposit ? formatCurrency(editingContract.deposit) : ''}
                                                    placeholder="예: 10,000,000"
                                                    onChange={handleCurrencyInput}
                                                    disabled={editingContract?.status === '완료'}
                                                />
                                                <span className="input-group-text">원</span>
                                            </div>
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>중계수수료</Form.Label>
                                            <div className="input-group">
                                                <Form.Control
                                                    name="commission"
                                                    defaultValue={editingContract?.commission ? formatCurrency(editingContract.commission) : ''}
                                                    placeholder="예: 500,000"
                                                    onChange={handleCurrencyInput}
                                                    disabled={editingContract?.status === '완료'}
                                                />
                                                <span className="input-group-text">원</span>
                                            </div>
                                        </Form.Group>
                                    </Col>
                                </>
                            ) : (
                                <>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>전세가격</Form.Label>
                                            <div className="input-group">
                                                <Form.Control
                                                    name="price"
                                                    defaultValue={editingContract?.price ? formatCurrency(editingContract.price) : ''}
                                                    placeholder="예: 50,000,000"
                                                    onChange={handleCurrencyInput}
                                                    disabled={editingContract?.status === '완료'}
                                                />
                                                <span className="input-group-text">원</span>
                                            </div>
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>중계수수료</Form.Label>
                                            <div className="input-group">
                                                <Form.Control
                                                    name="commission"
                                                    defaultValue={editingContract?.commission ? formatCurrency(editingContract.commission) : ''}
                                                    placeholder="예: 1,000,000"
                                                    onChange={handleCurrencyInput}
                                                    disabled={editingContract?.status === '완료'}
                                                />
                                                <span className="input-group-text">원</span>
                                            </div>
                                        </Form.Group>
                                    </Col>
                                </>
                            )}
                        </Row>

                        {/* 월세와 전세 계약에 대한 계약 기간 필드 추가 */}
                        {(contractType === '월세' || contractType === '전세') && (
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>계약 시작일</Form.Label>
                                        <Form.Control
                                            type="date"
                                            name="startDate"
                                            defaultValue={editingContract?.startDate ?
                                                new Date(editingContract.startDate).toISOString().split('T')[0] : ''}
                                            placeholder="계약 시작일"
                                            disabled={editingContract?.status === '완료'}
                                        />
                                        <small className="text-muted">
                                            {contractType === '월세' ? '월세 계약이 시작되는 날짜' : '전세 계약이 시작되는 날짜'}
                                        </small>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>계약 만료일</Form.Label>
                                        <Form.Control
                                            type="date"
                                            name="endDate"
                                            defaultValue={editingContract?.endDate ?
                                                new Date(editingContract.endDate).toISOString().split('T')[0] : ''}
                                            placeholder="계약 만료일"
                                            disabled={editingContract?.status === '완료'}
                                        />
                                        <small className="text-muted">
                                            {contractType === '월세' ? '월세 계약이 만료되는 날짜' : '전세 계약이 만료되는 날짜'}
                                        </small>
                                    </Form.Group>
                                </Col>
                            </Row>
                        )}

                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>계약일</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="contractDate"
                                        defaultValue={editingContract?.contractDate ?
                                            new Date(editingContract.contractDate).toISOString().split('T')[0] :
                                            new Date().toISOString().split('T')[0]}
                                        required
                                        disabled={editingContract?.status === '완료'}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>상태</Form.Label>
                                    <Form.Select
                                        name="status"
                                        defaultValue={editingContract?.status || '진행중'}
                                        onChange={(e) => {
                                            if (e.target.value === '완료' && contractType === '매매') {
                                                if (window.confirm('계약을 완료로 설정하면 매물의 기존 고객이 비활성화되고 매수자가 새로운 소유자로 설정됩니다. 계속하시겠습니까?')) {
                                                    // 사용자가 확인한 경우 추가 처리 없음
                                                } else {
                                                    e.target.value = editingContract?.status || '진행중';
                                                }
                                            }
                                        }}
                                        disabled={editingContract?.status === '완료'}
                                    >
                                        <option value="진행중">진행중</option>
                                        <option value="완료">완료</option>
                                        <option value="취소">취소</option>
                                        <option value="보류">보류</option>
                                    </Form.Select>
                                    {contractType === '매매' && (
                                        <small className="text-warning">
                                            ⚠️ 완료로 설정 시에만 매물 소유권이 매수자에게 이전됩니다.
                                            진행중 상태에서는 매물 소유권이 변경되지 않습니다.
                                        </small>
                                    )}
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>메모</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="notes"
                                defaultValue={editingContract?.notes}
                                placeholder="계약 관련 특이사항을 기록하세요"
                                disabled={editingContract?.status === '완료'}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="d-flex justify-content-end w-100">
                            {/* 삭제 버튼 - 레벨 8 이상이거나 당사자일 때만 표시 */}
                            <Button variant="secondary" onClick={handleCloseModal} disabled={loading} className="me-2">
                                취소
                            </Button>
                            {editingContract &&
                                editingContract.status !== '완료' &&
                                (user.level >= 8 ||
                                    (editingContract.publisher && editingContract.publisher._id === user._id) ||
                                    (editingContract.agent && editingContract.agent._id === user._id)) && (
                                    <Button
                                        variant="danger"
                                        onClick={handleDelete}
                                        disabled={loading}
                                        className="me-2"
                                    >
                                        {loading ? '삭제중...' : '삭제'}
                                    </Button>
                                )}

                            <Button variant="primary" type="submit" disabled={loading || editingContract?.status === '완료'}>
                                {loading ? '처리중...' : (editingContract ? '수정' : '등록')}
                            </Button>
                        </div>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* 고객 선택 모달 */}
            <Modal show={showCustomerModal} onHide={handleCloseCustomerModal} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <FaUsers className="me-2" />
                        고객 선택 ({customerType === 'buyer' ? '매수자' : '매도자'}로 설정)
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row className="mb-3">
                        <Col md={8}>
                            <Form.Control
                                type="text"
                                placeholder="고객명, 전화번호, 이메일로 검색..."
                                value={customerSearchTerm}
                                onChange={handleCustomerSearchChange}
                            />
                        </Col>
                        <Col md={4}>
                            <Button
                                variant="success"
                                onClick={handleShowCustomerAddModal}
                                className="w-100"
                            >
                                <FaPlus className="me-1" />
                                고객 추가
                            </Button>
                        </Col>
                    </Row>

                    {customerLoading ? (
                        <div className="text-center py-4">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2">고객을 검색하는 중...</p>
                        </div>
                    ) : customerSearchTerm && customers.filter(customer => customer.status === '활성').length > 0 ? (
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>고객명</th>
                                        <th>유형</th>
                                        <th>연락처</th>
                                        <th>주소</th>
                                        <th>예산/희망가</th>
                                        <th>선택</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customers
                                        .filter(customer => customer.status === '활성') // 비활성 고객 필터링
                                        .map(customer => (
                                            <tr key={customer._id}>
                                                <td>
                                                    <strong>{customer.name}</strong>
                                                </td>
                                                <td>
                                                    <span className={`badge bg-${customer.type === '매수자' ? 'primary' :
                                                        customer.type === '매도자' ? 'warning' :
                                                            customer.type === '실거주' ? 'success' : 'secondary'
                                                        }`}>
                                                        {customer.type}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div>{customer.phone}</div>
                                                    <div>{customer.email}</div>
                                                </td>
                                                <td>{customer.address}</td>
                                                <td>
                                                    {customer.type === '매수자' ? customer.budget : customer.askingPrice}
                                                </td>
                                                <td>
                                                    <Button
                                                        variant="outline-success"
                                                        size="sm"
                                                        onClick={() => handleCustomerSelect(customer)}
                                                    >
                                                        선택
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    ) : customerSearchTerm && customers.filter(customer => customer.status === '활성').length === 0 ? (
                        <div className="text-center py-4">
                            <FaUsers size={48} className="text-muted mb-3" />
                            <p className="text-muted">
                                검색된 고객이 없습니다.
                            </p>
                            <small className="text-muted">
                                다른 검색어를 입력하거나 고객 추가 버튼을 눌러 새 고객을 등록할 수 있습니다.
                            </small>
                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <FaUsers size={48} className="text-muted mb-3" />
                            <p className="text-muted">
                                검색창에 고객명, 전화번호, 이메일을 입력하여 고객을 찾아주세요.
                            </p>
                            <small className="text-muted">
                                검색 결과가 없으면 고객 추가 버튼을 눌러 새 고객을 등록할 수 있습니다.
                            </small>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseCustomerModal}>
                        닫기
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* 담당자 선택 모달 */}
            <Modal show={showUserModal} onHide={handleCloseUserModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>담당자 선택</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {users.length > 0 ? (
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>이름</th>
                                        <th>이메일</th>
                                        <th>전화번호</th>
                                        <th>사업자번호</th>
                                        <th>선택</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user._id}>
                                            <td>{user.name}</td>
                                            <td>{user.email}</td>
                                            <td>{user.phone}</td>
                                            <td>{user.businessNumber}</td>
                                            <td>
                                                <Button
                                                    variant="outline-success"
                                                    size="sm"
                                                    onClick={() => handleUserSelect(user)}
                                                >
                                                    선택
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <FaUsers size={48} className="text-muted mb-3" />
                            <p className="text-muted">등록된 사용자가 없습니다.</p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseUserModal}>
                        닫기
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* 고객 추가 모달 */}
            <CustomerRegistrationModal
                showModal={showCustomerAddModal}
                onHide={handleCloseCustomerAddModal}
                editingCustomer={null}
                onSuccess={handleCustomerAddSuccess}
                user={user}
                fixedCustomerType={customerType === 'buyer' ? '매수자' : '매도자'}
            />

            {/* 고객 수정 모달 */}
            <CustomerRegistrationModal
                showModal={showCustomerEditModal}
                onHide={handleCloseCustomerEditModal}
                editingCustomer={editingCustomer}
                onSuccess={handleCustomerEditSuccess}
                user={user}
            />

            {/* 매물 선택 모달 */}
            <Modal key={`${propertyModalKey}-${forceRefresh}`} show={showPropertySelectionModal} onHide={handleClosePropertySelectionModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <FaUsers className="me-2" />
                        {selectedSeller?.name} 고객의 매물 선택
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {contractType === '매매' && (
                        <Alert variant="warning" className="mb-3">
                            <FaInfoCircle className="me-2" />
                            <strong>주의사항:</strong> 매매 계약의 경우, 계약 상태가 "완료"일 때만 매물 소유권이 변경됩니다.
                            진행중인 계약에서는 매물 소유권이 변경되지 않습니다.
                        </Alert>
                    )}
                    {/* 고객 정보 수정 버튼 - 항상 표시 */}
                    <div className="d-flex justify-content-end mb-3">
                        <Button
                            variant="outline-primary"
                            onClick={handleShowCustomerEditModal}
                            size="sm"
                        >
                            <FaUsers className="me-1" />
                            고객 정보 수정
                        </Button>
                    </div>

                    {selectedSeller && selectedSeller.properties && selectedSeller.properties.length > 0 ? (
                        <div key={`properties-${forceRefresh}-${selectedSeller._id}`} className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>매물명</th>
                                        <th>주소</th>
                                        <th>유형</th>
                                        <th>가격</th>
                                        <th>선택</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedSeller.properties.map((prop, index) => (
                                        <tr key={prop.property._id || prop.property}>
                                            <td>
                                                <strong>{prop.property?.title || '매물명 없음'}</strong>
                                                {prop.property?.area && (
                                                    <div><small className="text-muted">{prop.property.area}㎡</small></div>
                                                )}
                                            </td>
                                            <td>{prop.property?.address || '주소 없음'}</td>
                                            <td>
                                                <span className={`badge bg-${prop.property?.type === '매매' ? 'primary' :
                                                    prop.property?.type === '월세' ? 'success' : 'warning'
                                                    }`}>
                                                    {prop.property?.type || '알 수 없음'}
                                                </span>
                                            </td>
                                            <td>
                                                {prop.property?.type === '매매' && prop.property?.price && (
                                                    <span>{formatCurrency(prop.property.price)}원</span>
                                                )}
                                                {prop.property?.type === '월세' && (
                                                    <div>
                                                        <div>월세: {formatCurrency(prop.property.price)}원</div>
                                                        {prop.property?.deposit && (
                                                            <div>보증금: {formatCurrency(prop.property.deposit)}원</div>
                                                        )}
                                                    </div>
                                                )}
                                                {prop.property?.type === '전세' && prop.property?.price && (
                                                    <span>{formatCurrency(prop.property.price)}원</span>
                                                )}
                                                {!prop.property?.price && (
                                                    <span className="text-muted">가격 정보 없음</span>
                                                )}
                                            </td>
                                            <td>
                                                <Button
                                                    variant="outline-success"
                                                    size="sm"
                                                    onClick={() => handlePropertySelect(prop.property)}
                                                >
                                                    선택
                                                </Button>
                                                {selectedProperty && selectedProperty._id === prop.property._id && (
                                                    <div><small className="text-success">✓ 선택됨</small></div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div key={`no-properties-${forceRefresh}-${selectedSeller?._id}`} className="text-center py-4">
                            <FaUsers size={48} className="text-muted mb-3" />
                            <p className="text-muted">
                                {selectedSeller?.name} 고객이 가진 매물이 없습니다.
                            </p>
                            <small className="text-muted">
                                매물을 먼저 고객 정보에서 등록해주세요.
                            </small>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClosePropertySelectionModal}>
                        취소
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default ContractRegistrationModal; 