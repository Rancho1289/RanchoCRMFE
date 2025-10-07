import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Alert, InputGroup } from 'react-bootstrap';
import { FaHome, FaMapMarkerAlt, FaMoneyBillWave, FaBed, FaBath, FaSearch } from 'react-icons/fa';
import api from '../../utils/api';

const PropertyRegistrationModal = ({ showModal, onHide, editingProperty, onSuccess, loading }) => {
    const [formData, setFormData] = useState({
        title: '',
        type: ['매매'],
        price: '',
        deposit: '',
        area: '',
        rooms: 1,
        bathrooms: 1,
        address: '',
        detailedAddress: '', // 상세주소 필드 추가
        status: '판매중',
        parking: '별도문의',
        pets: '별도문의',
        elevator: '별도문의',
        specialNotes: '',
        // 각 유형별 가격 필드
        매매가격: '',
        월세가격: '',
        월세보증금: '',
        전세가격: '',
        // 계약 기간 필드
        contractPeriod: {
            startDate: '',
            endDate: ''
        }
    });
    const [error, setError] = useState('');
    const [titleDuplicateCheck, setTitleDuplicateCheck] = useState({
        isChecking: false,
        isDuplicate: false,
        message: '',
        existingProperty: null
    });





    // 모달이 닫힐 때 상태 초기화
    const handleClose = () => {
        onHide();
    };

    // 편집 중인 매물이 있으면 폼 데이터 설정
    useEffect(() => {
        if (editingProperty) {
            // 주소 분리 로직 (중복 방지)
            let baseAddress = editingProperty.address || '';
            let detailedAddress = editingProperty.detailedAddress || '';
            
            // detailedAddress가 address에 이미 포함되어 있다면 분리
            if (detailedAddress && baseAddress.includes(detailedAddress)) {
                baseAddress = baseAddress.replace(detailedAddress, '').trim();
            }
            
            setFormData({
                title: editingProperty.title || '',
                type: Array.isArray(editingProperty.type) ? editingProperty.type : [editingProperty.type || '매매'],
                price: editingProperty.price || '',
                deposit: editingProperty.deposit || '',
                area: editingProperty.area || '',
                rooms: editingProperty.rooms || 1,
                bathrooms: editingProperty.bathrooms || 1,
                address: baseAddress,
                detailedAddress: detailedAddress, // 상세주소 설정
                status: editingProperty.status || '판매중',
                parking: editingProperty.parking || '별도문의',
                pets: editingProperty.pets || '별도문의',
                elevator: editingProperty.elevator || '별도문의',
                specialNotes: editingProperty.specialNotes || '',
                // 각 유형별 가격 필드
                매매가격: editingProperty.prices?.매매가격 || editingProperty.price || '',
                월세가격: editingProperty.prices?.월세가격 || editingProperty.price || '',
                월세보증금: editingProperty.prices?.월세보증금 || editingProperty.deposit || '',
                전세가격: editingProperty.prices?.전세가격 || editingProperty.price || '',
                // 계약 기간 필드
                contractPeriod: {
                    startDate: editingProperty.contractPeriod?.startDate ? 
                        editingProperty.contractPeriod.startDate.split('T')[0] : '',
                    endDate: editingProperty.contractPeriod?.endDate ? 
                        editingProperty.contractPeriod.endDate.split('T')[0] : ''
                }
            });
        } else {
            // 새 매물 등록 시 폼 초기화
            setFormData({
                title: '',
                type: ['매매'],
                price: '',
                deposit: '',
                area: '',
                rooms: 1,
                bathrooms: 1,
                address: '',
                detailedAddress: '', // 상세주소 초기화
                status: '판매중',
                parking: '별도문의',
                pets: '별도문의',
                elevator: '별도문의',
                specialNotes: '',
                // 각 유형별 가격 필드
                매매가격: '',
                월세가격: '',
                월세보증금: '',
                전세가격: '',
                // 계약 기간 필드
                contractPeriod: {
                    startDate: '',
                    endDate: ''
                }
            });
        }
        // 에러 메시지 초기화
        setError('');
        
        // 편집 모드일 때 중복 검사 상태 초기화
        if (editingProperty) {
            setTitleDuplicateCheck({
                isChecking: false,
                isDuplicate: false,
                message: '',
                existingProperty: null
            });
        }
    }, [editingProperty]);

    // 주소 검색 함수
    const openAddressSearch = () => {
        new window.daum.Postcode({
            oncomplete: function (data) {
                setFormData(prev => ({
                    ...prev,
                    address: data.address,
                    title: data.address // 주소를 매물명으로 자동 설정
                }));
                
                // 매물명이 변경되었으므로 중복 검사 수행 (편집 중이 아닐 때만)
                if (!editingProperty) {
                    setTimeout(() => {
                        checkTitleDuplicate(data.address);
                    }, 500);
                }
            }
        }).open();
    };

    // 상세주소 변경 시 매물명도 함께 업데이트
    const handleDetailedAddressChange = (e) => {
        const { value } = e.target;
        const newTitle = value ? `${formData.address} ${value}`.trim() : formData.address;
        
        setFormData(prev => ({
            ...prev,
            detailedAddress: value,
            title: newTitle // 주소 + 상세주소를 매물명으로 설정
        }));
        
        // 매물명이 변경되었으므로 중복 검사 수행 (편집 중이 아닐 때만)
        if (!editingProperty) {
            setTimeout(() => {
                checkTitleDuplicate(newTitle);
            }, 500);
        }
    };

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

    // 금액 입력 처리 함수
    const handleCurrencyInput = (e) => {
        const formatted = formatCurrency(e.target.value);
        e.target.value = formatted;
    };

    // 매물명 중복 검사 함수
    const checkTitleDuplicate = async (title) => {
        if (!title || title.trim() === '') {
            setTitleDuplicateCheck({
                isChecking: false,
                isDuplicate: false,
                message: '',
                existingProperty: null
            });
            return;
        }

        setTitleDuplicateCheck(prev => ({ ...prev, isChecking: true }));

        try {
            const apiResponse = await api.get(`/properties/check-title-duplicate?title=${encodeURIComponent(title.trim())}`);

            const data = apiResponse.data;

            if (data.success) {
                setTitleDuplicateCheck({
                    isChecking: false,
                    isDuplicate: data.isDuplicate,
                    message: data.message,
                    existingProperty: data.existingProperty || null
                });
            } else {
                setTitleDuplicateCheck({
                    isChecking: false,
                    isDuplicate: false,
                    message: data.message || '중복 검사에 실패했습니다.',
                    existingProperty: null
                });
            }
        } catch (error) {
            console.error('매물명 중복 검사 오류:', error);
            setTitleDuplicateCheck({
                isChecking: false,
                isDuplicate: false,
                message: '중복 검사 중 오류가 발생했습니다.',
                existingProperty: null
            });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // 중첩된 객체 필드 처리 (예: contractPeriod.startDate)
        if (name.includes('.')) {
            const [parentKey, childKey] = name.split('.');
            
            setFormData(prev => ({
                ...prev,
                [parentKey]: {
                    ...prev[parentKey],
                    [childKey]: value
                }
            }));
            return;
        }
        
        // 매물명이 변경되면 중복 검사 수행 (편집 중이 아닐 때만)
        if (name === 'title') {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
            
            // 매물명 변경 시 중복 검사 수행 (편집 중이 아닐 때만)
            if (!editingProperty) {
                // 입력이 끝난 후 500ms 뒤에 중복 검사 수행 (디바운싱)
                setTimeout(() => {
                    checkTitleDuplicate(value);
                }, 500);
            } else {
                // 편집 모드일 때는 중복 검사 상태 초기화
                setTitleDuplicateCheck({
                    isChecking: false,
                    isDuplicate: false,
                    message: '',
                    existingProperty: null
                });
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // 중복된 매물명이 있으면 제출 차단
        if (titleDuplicateCheck.isDuplicate) {
            setError('중복된 매물명이 있습니다. 다른 매물명을 사용해주세요.');
            return;
        }

        // 가격 정보 검증
        const validationErrors = [];
        
        if (formData.type.includes('매매') && (!formData.매매가격 || String(formData.매매가격).trim() === '')) {
            validationErrors.push('매매를 선택한 경우 매매가격을 입력해주세요.');
        }
        
        if (formData.type.includes('월세') && (!formData.월세가격 || String(formData.월세가격).trim() === '')) {
            validationErrors.push('월세를 선택한 경우 월세가격을 입력해주세요.');
        }
        
        if (formData.type.includes('전세') && (!formData.전세가격 || String(formData.전세가격).trim() === '')) {
            validationErrors.push('전세를 선택한 경우 전세가격을 입력해주세요.');
        }
        
        if (validationErrors.length > 0) {
            setError(validationErrors.join(' '));
            return;
        }
        
        try {

            // 주소와 상세주소를 합쳐서 최종 주소 생성 (중복 방지)
            let fullAddress = formData.address;
            if (formData.detailedAddress) {
                // 상세주소가 기본 주소에 이미 포함되어 있는지 확인
                if (!formData.address.includes(formData.detailedAddress)) {
                    fullAddress = `${formData.address} ${formData.detailedAddress}`.trim();
                }
            }

            const propertyData = {
                title: formData.title,
                type: formData.type,
                // 각 유형별 개별 가격 정보
                prices: {
                    매매가격: formData.매매가격 || null,
                    월세가격: formData.월세가격 || null,
                    월세보증금: formData.월세보증금 || null,
                    전세가격: formData.전세가격 || null
                },
                area: formData.area,
                rooms: parseInt(formData.rooms),
                bathrooms: parseInt(formData.bathrooms),
                address: fullAddress,
                detailedAddress: formData.detailedAddress, // 상세주소도 별도로 저장
                status: formData.status,
                parking: formData.parking,
                pets: formData.pets,
                elevator: formData.elevator,
                specialNotes: formData.specialNotes,
                contractPeriod: (formData.status === '월세중' || formData.status === '전세중') ? formData.contractPeriod : {
                    startDate: null,
                    endDate: null
                }
            };

            if (editingProperty) {
                // 매물 수정
                await onSuccess(propertyData, editingProperty._id);
            } else {
                // 매물 등록
                await onSuccess(propertyData);
            }
            
            // 성공 시 모달 닫기
            onHide();
        } catch (error) {
            console.error('매물 저장 오류:', error);
            
            // 에러 메시지를 state로 설정
            let errorMessage = '매물 저장에 실패했습니다.';
            
            if (error.response?.status === 400) {
                if (error.response?.data?.message?.includes('매물명')) {
                    errorMessage = '매물명이 중복됩니다. 다른 매물명을 사용해주세요.';
                } else {
                    errorMessage = error.response?.data?.message || '매물 등록에 실패했습니다.';
                }
            } else if (error.response?.status === 401) {
                errorMessage = '로그인이 필요하거나 토큰이 만료되었습니다. 다시 로그인해주세요.';
            } else if (error.response?.status === 403) {
                errorMessage = '매물을 수정할 권한이 없습니다.';
            } else if (error.response?.status === 404) {
                errorMessage = '매물을 찾을 수 없습니다.';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            setError(errorMessage);
        }
    };

    return (
        <Modal show={showModal} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    <FaHome className="me-2" />
                    {editingProperty ? '매물 수정' : '매물 등록'}
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && (
                        <Alert variant="danger" onClose={() => setError('')} dismissible>
                            {error}
                        </Alert>
                    )}
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>매물명 (자동 설정)</Form.Label>
                                <Form.Control
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="주소 검색 시 자동으로 설정됩니다"
                                    required
                                    isInvalid={titleDuplicateCheck.isDuplicate}
                                    disabled
                                />
                                <Form.Text className="text-muted">
                                    주소 검색 시 자동으로 매물명이 설정됩니다
                                </Form.Text>
                                {titleDuplicateCheck.isChecking && (
                                    <Form.Text className="text-info">중복 검사 중...</Form.Text>
                                )}
                                {titleDuplicateCheck.isDuplicate && (
                                    <Form.Text className="text-danger">{titleDuplicateCheck.message}</Form.Text>
                                )}
                                {titleDuplicateCheck.message && !titleDuplicateCheck.isDuplicate && (
                                    <Form.Text className="text-success">{titleDuplicateCheck.message}</Form.Text>
                                )}
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>매물 유형 (복수 선택 가능)</Form.Label>
                                <div>
                                    {['매매', '월세', '전세', '실거주'].map((typeOption) => (
                                        <Form.Check
                                            key={typeOption}
                                            type="checkbox"
                                            id={`type-${typeOption}`}
                                            label={typeOption}
                                            checked={formData.type.includes(typeOption)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    // 실거주가 선택된 경우 다른 유형들 제거
                                                    if (typeOption === '실거주') {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            type: ['실거주']
                                                        }));
                                                    } else {
                                                        // 실거주가 이미 선택된 경우 실거주 제거
                                                        const newTypes = formData.type.filter(t => t !== '실거주');
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            type: [...newTypes, typeOption]
                                                        }));
                                                    }
                                                } else {
                                                    // 체크 해제
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        type: prev.type.filter(t => t !== typeOption)
                                                    }));
                                                }
                                            }}
                                            className="mb-2"
                                        />
                                    ))}
                                </div>
                                {formData.type.length === 0 && (
                                    <Form.Text className="text-danger">
                                        최소 하나의 매물 유형을 선택해주세요.
                                    </Form.Text>
                                )}
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* 주소 검색 필드 */}
                    <Row>
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    <FaMapMarkerAlt className="me-1" />
                                    주소 *
                                </Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        type="text"
                                        placeholder="주소를 입력하세요"
                                        value={formData.address}
                                        readOnly
                                        isInvalid={!formData.address}
                                    />
                                    <Button
                                        variant="outline-secondary"
                                        onClick={openAddressSearch}
                                        type="button"
                                    >
                                        <FaSearch />
                                    </Button>
                                </InputGroup>
                                <Form.Control.Feedback type="invalid">
                                    주소를 검색해주세요
                                </Form.Control.Feedback>
                                <Form.Text className="text-muted">
                                    돋보기 아이콘을 클릭하여 주소를 검색하세요
                                </Form.Text>
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* 상세 주소 필드 */}
                    <Row>
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>상세주소</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="detailedAddress"
                                    value={formData.detailedAddress}
                                    onChange={handleDetailedAddressChange}
                                    placeholder="상세주소를 입력하세요"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>면적(㎡)</Form.Label>
                                <Form.Control
                                    name="area"
                                    value={formData.area}
                                    onChange={handleInputChange}
                                    onKeyDown={(e) => {
                                        // 허용된 키들: 숫자, 소수점, 백스페이스, 삭제, 화살표 키
                                        const allowedKeys = [
                                            'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
                                            'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
                                            '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.'
                                        ];
                                        
                                        // Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X 허용
                                        if (e.ctrlKey && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) {
                                            return;
                                        }
                                        
                                        // 허용되지 않은 키는 이벤트 차단
                                        if (!allowedKeys.includes(e.key)) {
                                            e.preventDefault();
                                        }
                                        
                                        // 소수점이 이미 있는 경우 추가 소수점 입력 차단
                                        if (e.key === '.' && formData.area.includes('.')) {
                                            e.preventDefault();
                                        }
                                    }}
                                    placeholder="예: 84.5"
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>상태</Form.Label>
                                <Form.Select 
                                    name="status" 
                                    value={formData.status}
                                    onChange={handleInputChange}
                                >
                                    <option value="판매중">판매중</option>
                                    <option value="판매완료">판매완료</option>
                                    <option value="월세중">월세중</option>
                                    <option value="전세중">전세중</option>

                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* 매물 유형에 따른 가격 입력 필드 */}
                    <Row>
                        <Col md={12}>
                            <h6 className="mb-3 fw-bold text-primary">
                                <FaMoneyBillWave className="me-2" />
                                가격 정보
                            </h6>
                        </Col>
                    </Row>

                    {/* 매매 가격 */}
                    {formData.type.includes('매매') && (
                        <Row>
                            <Col md={12}>
                                <div className="border rounded p-3 mb-3 bg-light">
                                    <h6 className="mb-3 text-primary">매매</h6>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="fw-bold">매매가격 *</Form.Label>
                                                <Form.Control
                                                    name="매매가격"
                                                    value={formData.매매가격}
                                                    onChange={handleInputChange}
                                                    onInput={handleCurrencyInput}
                                                    placeholder="예: 1,500,000,000"
                                                    required
                                                />
                                                <Form.Text className="text-muted">
                                                    매매 시 거래 가격을 입력하세요
                                                </Form.Text>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </div>
                            </Col>
                        </Row>
                    )}

                    {/* 월세 가격 */}
                    {formData.type.includes('월세') && (
                        <Row>
                            <Col md={12}>
                                <div className="border rounded p-3 mb-3 bg-light">
                                    <h6 className="mb-3 text-success">월세</h6>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="fw-bold">월세 *</Form.Label>
                                                <Form.Control
                                                    name="월세가격"
                                                    value={formData.월세가격}
                                                    onChange={handleInputChange}
                                                    onInput={handleCurrencyInput}
                                                    placeholder="예: 500,000"
                                                    required
                                                />
                                                <Form.Text className="text-muted">
                                                    매월 지불하는 임대료를 입력하세요
                                                </Form.Text>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="fw-bold">보증금</Form.Label>
                                                <Form.Control
                                                    name="월세보증금"
                                                    value={formData.월세보증금}
                                                    onChange={handleInputChange}
                                                    onInput={handleCurrencyInput}
                                                    placeholder="예: 10,000,000"
                                                />
                                                <Form.Text className="text-muted">
                                                    계약 시 지불하는 보증금을 입력하세요
                                                </Form.Text>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </div>
                            </Col>
                        </Row>
                    )}

                    {/* 전세 가격 */}
                    {formData.type.includes('전세') && (
                        <Row>
                            <Col md={12}>
                                <div className="border rounded p-3 mb-3 bg-light">
                                    <h6 className="mb-3 text-warning">전세</h6>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="fw-bold">전세금 *</Form.Label>
                                                <Form.Control
                                                    name="전세가격"
                                                    value={formData.전세가격}
                                                    onChange={handleInputChange}
                                                    onInput={handleCurrencyInput}
                                                    placeholder="예: 50,000,000"
                                                    required
                                                />
                                                <Form.Text className="text-muted">
                                                    계약 시 지불하는 전세금을 입력하세요
                                                </Form.Text>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </div>
                            </Col>
                        </Row>
                    )}

                    {/* 실거주 */}
                    {formData.type.includes('실거주') && (
                        <Row>
                            <Col md={12}>
                                <Alert variant="info" className="mb-3">
                                    <strong>실거주 매물</strong><br />
                                    실거주 매물은 가격 정보 없이 등록됩니다. 매물의 기본 정보만 입력해주세요.
                                </Alert>
                            </Col>
                        </Row>
                    )}

                    {/* 선택된 유형이 없는 경우 안내 */}
                    {formData.type.length === 0 && (
                        <Row>
                            <Col md={12}>
                                <Alert variant="warning" className="mb-3">
                                    <strong>매물 유형을 선택해주세요</strong><br />
                                    위에서 매물 유형을 선택하면 해당하는 가격 입력란이 표시됩니다.
                                </Alert>
                            </Col>
                        </Row>
                    )}
                    <Row>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    <FaBed className="me-1" />
                                    방 개수
                                </Form.Label>
                                <Form.Control
                                    type="number"
                                    name="rooms"
                                    value={formData.rooms}
                                    onChange={handleInputChange}
                                    min="1"
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    <FaBath className="me-1" />
                                    욕실 개수
                                </Form.Label>
                                <Form.Control
                                    type="number"
                                    name="bathrooms"
                                    value={formData.bathrooms}
                                    onChange={handleInputChange}
                                    min="1"
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>상태</Form.Label>
                                <Form.Select 
                                    name="status" 
                                    value={formData.status}
                                    onChange={handleInputChange}
                                >
                                    <option value="판매중">판매중</option>
                                    {/* <option value="판매완료">판매완료</option> */}
                                    <option value="월세중">월세중</option>
                                    {/* <option value="월세완료">월세완료</option> */}
                                    <option value="전세중">전세중</option>
                                    {/* <option value="전세완료">전세완료</option> */}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* 계약 기간 입력 (월세중, 전세중일 때만 표시) */}
                    {(formData.status === '월세중' || formData.status === '전세중') && (
                        <Row>
                            <Col md={12}>
                                <Alert variant="info" className="mb-3">
                                    <strong>계약 기간 정보</strong><br />
                                    현재 계약 중인 매물의 기간을 입력해주세요.
                                </Alert>
                            </Col>
                        </Row>
                    )}
                    
                    {(formData.status === '월세중' || formData.status === '전세중') && (
                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>계약 시작일</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="contractPeriod.startDate"
                                        value={formData.contractPeriod.startDate}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>계약 종료일</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="contractPeriod.endDate"
                                        value={formData.contractPeriod.endDate}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    )}

                    {/* 편의시설 필드들 */}
                    <Row>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>주차</Form.Label>
                                <Form.Select 
                                    name="parking" 
                                    value={formData.parking}
                                    onChange={handleInputChange}
                                >
                                    <option value="별도문의">별도문의</option>
                                    <option value="가능">가능</option>
                                    <option value="불가능">불가능</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>애완동물</Form.Label>
                                <Form.Select 
                                    name="pets" 
                                    value={formData.pets}
                                    onChange={handleInputChange}
                                >
                                    <option value="별도문의">별도문의</option>
                                    <option value="가능">가능</option>
                                    <option value="불가능">불가능</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>엘리베이터</Form.Label>
                                <Form.Select 
                                    name="elevator" 
                                    value={formData.elevator}
                                    onChange={handleInputChange}
                                >
                                    <option value="별도문의">별도문의</option>
                                    <option value="있음">있음</option>
                                    <option value="없음">없음</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                    
                    <Form.Group className="mb-3">
                        <Form.Label>특이사항</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="specialNotes"
                            value={formData.specialNotes}
                            onChange={handleInputChange}
                            placeholder="예: 복층, 올수리 완료, 주차 가능, 엘리베이터 있음 등"
                        />
                        <Form.Text className="text-muted">
                            매물의 특별한 사항이나 주의사항을 기록하세요.
                        </Form.Text>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose} disabled={loading}>
                        취소
                    </Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? '처리중...' : (editingProperty ? '수정' : '등록')}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default PropertyRegistrationModal; 