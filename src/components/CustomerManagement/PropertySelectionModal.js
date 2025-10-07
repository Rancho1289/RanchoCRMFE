import React from 'react';
import { Modal, Form, Button, Row, Col, Table } from 'react-bootstrap';
import { formatCurrency, getPropertyTypeBadgeColor } from './customerUtils';

const PropertySelectionModal = ({
    showModal,
    onHide,
    properties,
    propertySearchTerm,
    setPropertySearchTerm,
    propertyFilterType,
    setPropertyFilterType,
    propertyLoading,
    fetchProperties,
    handlePropertySelection,
    handlePropertyEdit,
    selectedProperties
}) => {
    return (
        <Modal show={showModal} onHide={onHide} size="xl">
            <Modal.Header closeButton>
                <Modal.Title>매물 선택 (고객 등록 시 소유자 변경됨)</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row className="mb-3">
                    <Col md={6}>
                        <Form.Control
                            type="text"
                            placeholder="매물명 또는 주소로 검색"
                            value={propertySearchTerm}
                            onChange={(e) => setPropertySearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && fetchProperties()}
                        />
                    </Col>
                    <Col md={3}>
                        <Form.Select
                            value={propertyFilterType}
                            onChange={(e) => setPropertyFilterType(e.target.value)}
                        >
                            <option value="all">전체</option>
                            <option value="매매">매매</option>
                            <option value="월세">월세</option>
                            <option value="전세">전세</option>
                        </Form.Select>
                    </Col>
                    <Col md={3}>
                        <Button 
                            variant="primary" 
                            onClick={fetchProperties}
                            disabled={propertyLoading}
                        >
                            {propertyLoading ? '검색중...' : '검색'}
                        </Button>
                    </Col>
                </Row>

                {propertyLoading ? (
                    <div className="text-center py-4">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>매물명</th>
                                <th>주소</th>
                                <th>유형</th>
                                <th>가격</th>
                                <th>등록자</th>
                                <th>등록일</th>
                                <th>선택</th>
                            </tr>
                        </thead>
                        <tbody>
                            {properties.map((property) => (
                                <tr key={property._id}>
                                    <td>{property.title}</td>
                                    <td>{property.address}</td>
                                    <td>
                                        <span className={`badge bg-${getPropertyTypeBadgeColor(property.type)}`}>
                                            {property.type}
                                        </span>
                                    </td>
                                    <td>
                                        {property.type === '매매' && property.price && (
                                            <span>{formatCurrency(property.price)}원</span>
                                        )}
                                        {property.type === '월세' && (
                                            <div>
                                                <div>월세: {formatCurrency(property.price)}원</div>
                                                {property.deposit && (
                                                    <div>보증금: {formatCurrency(property.deposit)}원</div>
                                                )}
                                            </div>
                                        )}
                                        {property.type === '전세' && property.price && (
                                            <span>{formatCurrency(property.price)}원</span>
                                        )}
                                    </td>
                                    <td>{property.publisher?.nickname || property.publisher?.name || '알 수 없음'}</td>
                                    <td>
                                        {new Date(property.createdAt).toLocaleDateString('ko-KR')}
                                    </td>
                                    <td>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={() => handlePropertySelection(property)}
                                            disabled={selectedProperties.some(prop => prop.propertyId === property._id)}
                                        >
                                            {selectedProperties.some(prop => prop.propertyId === property._id) ? '선택됨' : '매물 선택'}
                                        </Button>
                                        <Button
                                            variant="outline-warning"
                                            size="sm"
                                            onClick={() => handlePropertyEdit(property)}
                                            className="ms-1"
                                        >
                                            수정
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}

                {!propertyLoading && properties.length === 0 && (
                    <div className="text-center py-4">
                        <p className="text-muted">검색 조건에 맞는 매물이 없습니다.</p>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    취소
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default PropertySelectionModal; 