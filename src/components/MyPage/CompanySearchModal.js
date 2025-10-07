import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col, Modal } from 'react-bootstrap';
import { FaSearch, FaBuilding, FaUser, FaMapMarkerAlt, FaTimes } from 'react-icons/fa';
import api from '../../utils/api';

const CompanySearchModal = ({ show, onHide, onSelectCompany }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState('companyName');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [error, setError] = useState('');

    const searchCompanies = async () => {
        if (!searchQuery.trim() || searchQuery.trim().length < 2) {
            setError('검색어는 2글자 이상 입력해주세요.');
            return;
        }

        try {
            setSearchLoading(true);
            setError('');
            const response = await api.get(`/company/search?q=${encodeURIComponent(searchQuery)}&type=${searchType}`);
            if (response.data.success) {
                setSearchResults(response.data.data || []);
            }
        } catch (error) {
            console.error('회사 검색 실패:', error);
            setError('회사 검색에 실패했습니다.');
            setSearchResults([]);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSelectCompany = (company) => {
        onSelectCompany(company);
        onHide();
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            searchCompanies();
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    <FaSearch className="me-2" />
                    회사 찾기
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="mb-4">
                    <Form.Group className="mb-3">
                        <Form.Label>검색 유형</Form.Label>
                        <Form.Select
                            value={searchType}
                            onChange={(e) => setSearchType(e.target.value)}
                        >
                            <option value="companyName">회사명</option>
                            <option value="ceoName">대표자명</option>
                            <option value="businessNumber">사업자번호</option>
                            <option value="address">주소</option>
                            <option value="all">전체</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>검색어</Form.Label>
                        <div className="d-flex gap-2">
                            <Form.Control
                                type="text"
                                placeholder="검색어를 입력하세요"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={handleKeyPress}
                            />
                            <Button 
                                variant="primary" 
                                onClick={searchCompanies}
                                disabled={searchLoading}
                            >
                                {searchLoading ? '검색 중...' : '검색'}
                            </Button>
                        </div>
                    </Form.Group>

                    {error && (
                        <Alert variant="danger" className="mb-3">
                            {error}
                        </Alert>
                    )}
                </div>

                <div>
                    <h6 className="mb-3">검색 결과</h6>
                    {searchLoading ? (
                        <div className="text-center py-4">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">검색 중...</span>
                            </div>
                            <div className="mt-2">검색 중...</div>
                        </div>
                    ) : searchResults.length > 0 ? (
                        <div className="row g-3">
                            {searchResults.map((company, index) => (
                                <div key={company._id || index} className="col-12">
                                    <Card className="h-100">
                                        <Card.Body>
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div className="flex-grow-1">
                                                    <h6 className="card-title mb-2">
                                                        <FaBuilding className="me-2 text-primary" />
                                                        {company.companyName}
                                                    </h6>
                                                    <div className="mb-1">
                                                        <FaUser className="me-2 text-secondary" />
                                                        <small className="text-muted">대표: {company.representativeName}</small>
                                                    </div>
                                                    <div className="mb-1">
                                                        <small className="text-muted">사업자번호: {company.businessNumber}</small>
                                                    </div>
                                                    <div className="mb-0">
                                                        <FaMapMarkerAlt className="me-2 text-secondary" />
                                                        <small className="text-muted">
                                                            {company.businessAddress} {company.detailedAddress}
                                                        </small>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    onClick={() => handleSelectCompany(company)}
                                                >
                                                    선택
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    ) : searchQuery ? (
                        <div className="text-center py-4 text-muted">
                            검색 결과가 없습니다.
                        </div>
                    ) : (
                        <div className="text-center py-4 text-muted">
                            검색어를 입력하고 검색 버튼을 클릭하세요.
                        </div>
                    )}
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default CompanySearchModal;
