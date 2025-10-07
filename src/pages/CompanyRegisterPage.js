import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col, InputGroup } from 'react-bootstrap';
import { FaBuilding, FaUser, FaMapMarkerAlt, FaSave, FaArrowLeft } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const CompanyRegisterPage = () => {
    const [formData, setFormData] = useState({
        companyName: '',
        ceoName: '',
        businessNumber: '',
        address: '',
        detailedAddress: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // 에러 메시지 제거
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // 주소 검색 함수
    const openAddressSearch = () => {
        new window.daum.Postcode({
            oncomplete: function (data) {
                setFormData(prev => ({
                    ...prev,
                    address: data.address
                }));
                
                // 에러 메시지 제거
                if (errors.address) {
                    setErrors(prev => ({
                        ...prev,
                        address: ''
                    }));
                }
            }
        }).open();
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.companyName.trim()) {
            newErrors.companyName = '회사명을 입력해주세요.';
        }
        
        if (!formData.ceoName.trim()) {
            newErrors.ceoName = '대표자명을 입력해주세요.';
        }
        
        if (!formData.businessNumber.trim()) {
            newErrors.businessNumber = '사업자등록번호를 입력해주세요.';
        } else {
            // 사업자등록번호 형식 검증 (10자리 숫자)
            const businessNumberRegex = /^\d{3}-\d{2}-\d{5}$/;
            if (!businessNumberRegex.test(formData.businessNumber)) {
                newErrors.businessNumber = '사업자등록번호 형식이 올바르지 않습니다. (예: 123-45-67890)';
            }
        }
        
        if (!formData.address.trim()) {
            newErrors.address = '주소를 입력해주세요.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        
        try {
            // 백엔드 API 호출
            const response = await api.post('/company/register', formData);

            if (response.status === 201) {
                setSubmitSuccess(true);
                setFormData({
                    companyName: '',
                    ceoName: '',
                    businessNumber: '',
                    address: '',
                    detailedAddress: ''
                });
            } else {
                throw new Error('회사등록에 실패했습니다.');
            }
        } catch (error) {
            console.error('회사등록 오류:', error);
            
            // 백엔드에서 전달된 에러 메시지 처리
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else if (error.response?.data?.message) {
                setErrors({ submit: error.response.data.message });
            } else {
                setErrors({ submit: '회사등록 중 오류가 발생했습니다. 다시 시도해주세요.' });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitSuccess) {
        return (
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col md={8} lg={6}>
                        <Card className="shadow-sm border-0">
                            <Card.Body className="text-center py-5">
                                <div className="mb-4">
                                    <FaBuilding size={64} className="text-success" />
                                </div>
                                <h3 className="mb-3 text-success">회사등록 완료!</h3>
                                <p className="text-muted mb-4">
                                    회사 정보가 성공적으로 등록되었습니다.
                                </p>
                                <div className="d-grid gap-2">
                                    <Button 
                                        variant="primary" 
                                        as={Link} 
                                        to="/"
                                        className="d-flex align-items-center justify-content-center"
                                    >
                                        <FaArrowLeft className="me-2" />
                                        홈으로 돌아가기
                                    </Button>
                                    <Button 
                                        variant="outline-secondary" 
                                        onClick={() => setSubmitSuccess(false)}
                                    >
                                        추가 등록하기
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-white border-0 py-4">
                            <div className="d-flex align-items-center">
                                <FaBuilding className="text-primary me-3" size={24} />
                                <h4 className="mb-0">회사등록</h4>
                            </div>
                            <p className="text-muted mt-2 mb-0">
                                회사 정보를 입력하여 시스템에 등록해주세요.
                            </p>
                        </Card.Header>
                        
                        <Card.Body className="py-4">
                            <Form onSubmit={handleSubmit}>
                                {errors.submit && (
                                    <Alert variant="danger" className="mb-4">
                                        {errors.submit}
                                    </Alert>
                                )}

                                <Form.Group className="mb-4">
                                    <Form.Label className="d-flex align-items-center">
                                        <FaBuilding className="me-2 text-primary" />
                                        회사명 <span className="text-danger ms-1">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleInputChange}
                                        placeholder="회사명을 입력해주세요"
                                        isInvalid={!!errors.companyName}
                                        className="py-3"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.companyName}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label className="d-flex align-items-center">
                                        <FaUser className="me-2 text-primary" />
                                        대표자명 <span className="text-danger ms-1">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="ceoName"
                                        value={formData.ceoName}
                                        onChange={handleInputChange}
                                        placeholder="대표자명을 입력해주세요"
                                        isInvalid={!!errors.ceoName}
                                        className="py-3"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.ceoName}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label className="d-flex align-items-center">
                                        <FaBuilding className="me-2 text-primary" />
                                        사업자등록번호 <span className="text-danger ms-1">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="businessNumber"
                                        value={formData.businessNumber}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            // 숫자만 입력된 경우 자동으로 하이픈 추가
                                            if (/^\d{10}$/.test(value)) {
                                                const formatted = value.replace(/(\d{3})(\d{2})(\d{5})/, '$1-$2-$3');
                                                handleInputChange({ target: { name: 'businessNumber', value: formatted } });
                                            } else {
                                                handleInputChange(e);
                                            }
                                        }}
                                        onBlur={(e) => {
                                            // 포커스를 잃을 때 포맷팅 적용
                                            const value = e.target.value;
                                            const numbersOnly = value.replace(/[^0-9]/g, '');
                                            
                                            if (numbersOnly.length === 10) {
                                                const formatted = numbersOnly.replace(/(\d{3})(\d{2})(\d{5})/, '$1-$2-$3');
                                                if (formatted !== value) {
                                                    handleInputChange({ target: { name: 'businessNumber', value: formatted } });
                                                }
                                            }
                                        }}
                                        placeholder="123-45-67890"
                                        maxLength={12}
                                        isInvalid={!!errors.businessNumber}
                                        className="py-3"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.businessNumber}
                                    </Form.Control.Feedback>
                                    <Form.Text className="text-muted">
                                        💡 숫자만 입력하면 자동으로 하이픈이 추가됩니다
                                    </Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label className="d-flex align-items-center">
                                        <FaMapMarkerAlt className="me-2 text-primary" />
                                        주소 <span className="text-danger ms-1">*</span>
                                    </Form.Label>
                                    <InputGroup className="mb-2">
                                        <Form.Control
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            placeholder="주소를 검색해주세요"
                                            isInvalid={!!errors.address}
                                            className="py-3"
                                            readOnly
                                        />
                                        <Button
                                            variant="outline-secondary"
                                            onClick={openAddressSearch}
                                            type="button"
                                        >
                                            <FontAwesomeIcon icon={faSearch} />
                                        </Button>
                                    </InputGroup>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.address}
                                    </Form.Control.Feedback>
                                    <Form.Text className="text-muted">
                                        돋보기 아이콘을 클릭하여 주소를 검색하세요
                                    </Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label className="d-flex align-items-center">
                                        <FaMapMarkerAlt className="me-2 text-primary" />
                                        상세주소
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="detailedAddress"
                                        value={formData.detailedAddress}
                                        onChange={handleInputChange}
                                        placeholder="상세주소를 입력해주세요 (선택사항)"
                                        className="py-3"
                                    />
                                    <Form.Text className="text-muted">
                                        건물명, 동호수 등을 입력해주세요
                                    </Form.Text>
                                </Form.Group>

                                <div className="d-grid gap-2">
                                    <Button 
                                        type="submit" 
                                        variant="primary" 
                                        size="lg"
                                        disabled={isSubmitting}
                                        className="py-3 d-flex align-items-center justify-content-center"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                등록 중...
                                            </>
                                        ) : (
                                            <>
                                                <FaSave className="me-2" />
                                                회사등록
                                            </>
                                        )}
                                    </Button>
                                    
                                    <Button 
                                        variant="outline-secondary" 
                                        as={Link} 
                                        to="/"
                                        className="py-3 d-flex align-items-center justify-content-center"
                                    >
                                        <FaArrowLeft className="me-2" />
                                        취소
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default CompanyRegisterPage;
