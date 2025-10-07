import React from 'react';
import { Form, Row, Col, Button, Alert, Badge } from 'react-bootstrap';
import { formatCurrency, handleCurrencyInput, getPropertyTypeBadgeColor } from './customerUtils';

const CustomerSaleInfo = ({
    categories,
    selectedProperties,
    setSelectedProperties,
    handleShowPropertyModal,
    handleShowPropertySelectionModal,
    handleRemoveProperty,
    user,
    editingCustomer
}) => {
    const isDisabled = editingCustomer?.status === '비활성' && user.level < 11;

    if (!categories.includes('매도')) {
        return null;
    }

    return (
        <div className="border border-danger rounded p-3 mb-3" style={{ backgroundColor: '#fff8f8' }}>
            <div className="d-flex align-items-center mb-3">
                <div className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '24px', height: '24px' }}>
                    <i className="fas fa-home" style={{ fontSize: '12px' }}></i>
                </div>
                <h6 className="mb-0 text-danger fw-bold">매도 정보</h6>
            </div>
            <Row>
                <Col md={12}>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">매물 <span className="text-danger">*</span></Form.Label>
                        <div className="d-flex gap-2 mb-2">
                            <Button 
                                variant="outline-primary" 
                                size="sm"
                                onClick={handleShowPropertyModal}
                                disabled={isDisabled}
                            >
                                새 매물 등록
                            </Button>
                            <Button 
                                variant="outline-secondary" 
                                size="sm"
                                onClick={handleShowPropertySelectionModal}
                                disabled={isDisabled}
                            >
                                기존 매물 선택
                            </Button>
                        </div>
                        <small className="text-muted">
                            여러 매물을 선택하거나 새로 등록할 수 있습니다
                        </small>
                    </Form.Group>
                </Col>
            </Row>

            {/* 선택된 매물 목록 */}
            {selectedProperties.length > 0 && (
                <Row>
                    <Col md={12}>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">선택된 매물 목록</Form.Label>
                            <Alert variant="info" className="mb-2">
                                <small>
                                    <strong>안내:</strong> 선택된 매물들은 고객 등록 시 해당 고객의 소유로 변경됩니다.
                                </small>
                            </Alert>
                            <div className="border rounded p-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {selectedProperties.map((prop, index) => (
                                    <div key={prop.propertyId} className="border-bottom pb-2 mb-2">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div className="flex-grow-1">
                                                <h6 className="mb-1">{prop.propertyTitle}</h6>
                                                <Badge bg={getPropertyTypeBadgeColor(prop.propertyType)}>
                                                    {prop.propertyType}
                                                </Badge>
                                                <div className="mt-2">
                                                    {prop.propertyType === '매매' && (
                                                        <Form.Control
                                                            name={`askingPrice_${index}`}
                                                            placeholder="희망가"
                                                            defaultValue={prop.askingPrice ? formatCurrency(prop.askingPrice) : ''}
                                                            onChange={handleCurrencyInput}
                                                            className="mb-1"
                                                            disabled={isDisabled}
                                                        />
                                                    )}
                                                    {prop.propertyType === '월세' && (
                                                        <>
                                                            <Form.Control
                                                                name={`monthlyRent_${index}`}
                                                                placeholder="월세"
                                                                defaultValue={prop.monthlyRent ? formatCurrency(prop.monthlyRent) : ''}
                                                                onChange={handleCurrencyInput}
                                                                className="mb-1"
                                                                disabled={isDisabled}
                                                            />
                                                            <Form.Control
                                                                name={`deposit_${index}`}
                                                                placeholder="보증금"
                                                                defaultValue={prop.deposit ? formatCurrency(prop.deposit) : ''}
                                                                onChange={handleCurrencyInput}
                                                                disabled={isDisabled}
                                                            />
                                                        </>
                                                    )}
                                                    {prop.propertyType === '전세' && (
                                                        <Form.Control
                                                            name={`jeonseDeposit_${index}`}
                                                            placeholder="전세금"
                                                            defaultValue={prop.jeonseDeposit ? formatCurrency(prop.jeonseDeposit) : ''}
                                                            onChange={handleCurrencyInput}
                                                            disabled={isDisabled}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => handleRemoveProperty(prop.propertyId)}
                                                className="ms-2"
                                                disabled={isDisabled}
                                            >
                                                제거
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Form.Group>
                    </Col>
                </Row>
            )}
        </div>
    );
};

export default CustomerSaleInfo; 