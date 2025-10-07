import React, { useState } from 'react';
import { Form, Button, Row, Col, Alert, Card } from 'react-bootstrap';
import api from '../../utils/api';

const CustomerDuplicateCheck = ({
    onDuplicateFound,
    onNoDuplicate,
    onCancel
}) => {
    const [searchData, setSearchData] = useState({
        name: '',
        phone: '',
        email: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchResult, setSearchResult] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        
        if (!searchData.name || (!searchData.phone && !searchData.email)) {
            setError('고객명과 연락처(전화번호 또는 이메일) 중 하나는 필수입니다.');
            return;
        }

        try {
            setLoading(true);
            setError('');
            setSearchResult(null);

            const params = new URLSearchParams();
            params.append('name', searchData.name);
            if (searchData.phone) params.append('phone', searchData.phone);
            if (searchData.email) params.append('email', searchData.email);

            const response = await api.get(`/customers/check-duplicate?${params.toString()}`);
            
            if (response.data.success) {
                setSearchResult(response.data);
                
                if (response.data.isDuplicate) {
                    // 중복 고객이 발견된 경우
                    onDuplicateFound(response.data.existingCustomer);
                } else {
                    // 중복이 없는 경우
                    onNoDuplicate(searchData);
                }
            }
        } catch (error) {
            console.error('중복 검색 오류:', error);
            if (error.response && error.response.data) {
                setError(error.response.data.message || '중복 검색 중 오류가 발생했습니다.');
            } else {
                setError('서버에 연결할 수 없습니다.');
            }
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="p-4">
            <h5 className="mb-4">고객 중복 검색</h5>
            
            {error && (
                <Alert variant="danger" onClose={() => setError('')} dismissible>
                    {error}
                </Alert>
            )}

            <Form onSubmit={handleSearch}>
                <Row>
                    <Col md={4}>
                        <Form.Group className="mb-3">
                            <Form.Label>고객명 <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                name="name"
                                value={searchData.name}
                                onChange={handleInputChange}
                                placeholder="고객명을 입력하세요"
                                required
                            />
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group className="mb-3">
                            <Form.Label>전화번호</Form.Label>
                            <Form.Control
                                name="phone"
                                value={searchData.phone}
                                onChange={handleInputChange}
                                placeholder="010-1234-5678"
                            />
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group className="mb-3">
                            <Form.Label>이메일</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={searchData.email}
                                onChange={handleInputChange}
                                placeholder="example@email.com"
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <div className="d-flex gap-2 mb-4">
                    <Button 
                        variant="primary" 
                        type="submit" 
                        disabled={loading}
                    >
                        {loading ? '검색중...' : '중복 검색'}
                    </Button>
                    <Button 
                        variant="secondary" 
                        onClick={onCancel}
                        disabled={loading}
                    >
                        취소
                    </Button>
                </div>
            </Form>

            {searchResult && searchResult.isDuplicate && (
                <Card className="border-warning">
                    <Card.Header className="bg-warning text-dark">
                        <strong>중복 고객 발견</strong>
                    </Card.Header>
                    <Card.Body>
                        <div className="row">
                            <div className="col-md-6">
                                <p><strong>이름:</strong> {searchResult.existingCustomer.name}</p>
                                <p><strong>전화번호:</strong> {searchResult.existingCustomer.phone}</p>
                                <p><strong>이메일:</strong> {searchResult.existingCustomer.email}</p>
                            </div>
                            <div className="col-md-6">
                                <p><strong>고객 분류:</strong> {searchResult.existingCustomer.categories?.join(', ')}</p>
                                <p><strong>상태:</strong> {searchResult.existingCustomer.status}</p>
                                <p><strong>등록일:</strong> {formatDate(searchResult.existingCustomer.updatedAt)}</p>
                            </div>
                        </div>
                        <div className="mt-3">
                            <Button 
                                variant="primary" 
                                onClick={() => onDuplicateFound(searchResult.existingCustomer)}
                            >
                                기존 고객 정보로 수정 모드 열기
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            )}

            {searchResult && !searchResult.isDuplicate && (
                <Alert variant="success">
                    <strong>중복 검색 완료</strong><br />
                    동일한 정보의 고객이 없습니다. 고객 등록을 진행할 수 있습니다.
                </Alert>
            )}
        </div>
    );
};

export default CustomerDuplicateCheck; 