import React, { useState } from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import { FaEdit, FaCheck, FaTimes } from 'react-icons/fa';
import { handleCategoryChange } from './customerUtils';

const CustomerBasicInfo = ({
    editingCustomer,
    categories,
    setCategories,
    user,
    searchData,
    isDuplicateMode = false
}) => {
    const [editingFields, setEditingFields] = useState({
        name: false,
        phone: false,
        email: false
    });

    const isDisabled = editingCustomer?.status === '비활성' && user.level < 11;
    // 고객 정보 수정 시 고객명과 전화번호는 변경 불가
    const isNameDisabled = editingCustomer && !isDuplicateMode;
    const isPhoneDisabled = editingCustomer && !isDuplicateMode;
    const isDuplicateDisabled = isDuplicateMode && !editingFields.name;
    const isPhoneDuplicateDisabled = isDuplicateMode && !editingFields.phone;
    const isEmailDuplicateDisabled = isDuplicateMode && !editingFields.email;

    const handleEditField = (fieldName) => {
        setEditingFields(prev => ({
            ...prev,
            [fieldName]: true
        }));
    };

    const handleSaveField = (fieldName) => {
        setEditingFields(prev => ({
            ...prev,
            [fieldName]: false
        }));

        // 폼 필드 값이 실제로 업데이트되도록 강제 리렌더링
        const form = document.querySelector('form');
        if (form) {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (field) {
                field.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
    };

    const handleCancelEdit = (fieldName) => {
        setEditingFields(prev => ({
            ...prev,
            [fieldName]: false
        }));
    };

    return (
        <>
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>
                            고객명
                            {isNameDisabled && (
                                <small className="text-muted ms-2">(수정 불가)</small>
                            )}
                        </Form.Label>
                        <div className="d-flex align-items-center">
                            <Form.Control
                                name="name"
                                defaultValue={editingCustomer?.name || searchData?.name}
                                required
                                disabled={isDisabled || isDuplicateDisabled || isNameDisabled}
                                className="me-2"
                            />
                            {isDuplicateMode && (
                                <div className="d-flex">
                                    {!editingFields.name ? (
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={() => handleEditField('name')}
                                            disabled={isDisabled}
                                        >
                                            <FaEdit />
                                        </Button>
                                    ) : (
                                        <>
                                            <Button
                                                variant="outline-success"
                                                size="sm"
                                                onClick={() => handleSaveField('name')}
                                                className="me-1"
                                            >
                                                <FaCheck />
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => handleCancelEdit('name')}
                                            >
                                                <FaTimes />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>고객 분류 (복수 선택 가능)</Form.Label>
                        <div>
                            {['실거주', '매도', '매수'].map((category) => (
                                <Form.Check
                                    key={category}
                                    type="checkbox"
                                    id={`category-${category}`}
                                    label={category}
                                    checked={categories.includes(category)}
                                    onChange={() => handleCategoryChange(category, categories, setCategories)}
                                    disabled={isDisabled}
                                    className="mb-2"
                                />
                            ))}
                        </div>
                        {categories.length === 0 && (
                            <Form.Text className="text-danger">
                                최소 하나의 고객 분류를 선택해주세요.
                            </Form.Text>
                        )}
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                                                <Form.Group className="mb-3">
                                <Form.Label>
                                    전화번호
                                    {isPhoneDisabled && (
                                        <small className="text-muted ms-2">(수정 불가)</small>
                                    )}
                                </Form.Label>
                                <div className="d-flex align-items-center">
                            <Form.Control
                                name="phone"
                                defaultValue={editingCustomer?.phone || searchData?.phone}
                                placeholder="010-1234-5678"
                                required
                                disabled={isDisabled || isPhoneDuplicateDisabled || isPhoneDisabled}
                                className="me-2"
                            />
                            {isDuplicateMode && (
                                <div className="d-flex">
                                    {!editingFields.phone ? (
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={() => handleEditField('phone')}
                                            disabled={isDisabled}
                                        >
                                            <FaEdit />
                                        </Button>
                                    ) : (
                                        <>
                                            <Button
                                                variant="outline-success"
                                                size="sm"
                                                onClick={() => handleSaveField('phone')}
                                                className="me-1"
                                            >
                                                <FaCheck />
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => handleCancelEdit('phone')}
                                            >
                                                <FaTimes />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>이메일</Form.Label>
                        <div className="d-flex align-items-center">
                            <Form.Control
                                type="email"
                                name="email"
                                defaultValue={editingCustomer?.email || searchData?.email}
                                disabled={isDisabled || isEmailDuplicateDisabled}
                                className="me-2"
                            />
                            {isDuplicateMode && (
                                <div className="d-flex">
                                    {!editingFields.email ? (
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={() => handleEditField('email')}
                                            disabled={isDisabled}
                                        >
                                            <FaEdit />
                                        </Button>
                                    ) : (
                                        <>
                                            <Button
                                                variant="outline-success"
                                                size="sm"
                                                onClick={() => handleSaveField('email')}
                                                className="me-1"
                                            >
                                                <FaCheck />
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => handleCancelEdit('email')}
                                            >
                                                <FaTimes />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </Form.Group>
                </Col>
            </Row>

            <Form.Group className="mb-3">
                <Form.Label>주소</Form.Label>
                <Form.Control
                    name="address"
                    defaultValue={editingCustomer?.address}
                    disabled={isDisabled}
                />
            </Form.Group>
        </>
    );
};

export default CustomerBasicInfo; 