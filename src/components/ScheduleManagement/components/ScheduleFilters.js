import React from 'react';
import { Button, Form, Row, Col } from 'react-bootstrap';
import { FaSearch, FaPlus } from 'react-icons/fa';

const ScheduleFilters = ({ 
    searchTerm, 
    setSearchTerm, 
    filterType, 
    setFilterType, 
    filterStatus, 
    setFilterStatus, 
    filterPriority, 
    setFilterPriority, 
    onAddSchedule, 
    loading 
}) => {
    return (
        <Row className="mb-3">
            <Col md={4}>
                <div className="input-group">
                    <span className="input-group-text">
                        <FaSearch />
                    </span>
                    <Form.Control
                        type="text"
                        placeholder="일정 제목으로 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </Col>
            <Col md={2}>
                <Form.Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                >
                    <option value="all">전체 유형</option>
                    <option value="시세조사">시세조사</option>
                    <option value="고객상담">고객상담</option>
                    <option value="계약관리">계약관리</option>
                    <option value="기타">기타</option>
                </Form.Select>
            </Col>
            <Col md={2}>
                <Form.Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="all">전체 상태</option>
                    <option value="예정">예정</option>
                    <option value="진행중">진행중</option>
                    <option value="완료">완료</option>
                    <option value="취소">취소</option>
                </Form.Select>
            </Col>
            <Col md={2}>
                <Form.Select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                >
                    <option value="all">전체 우선순위</option>
                    <option value="높음">높음</option>
                    <option value="보통">보통</option>
                    <option value="낮음">낮음</option>
                </Form.Select>
            </Col>
            <Col md={2}>
                <Button 
                    variant="success" 
                    onClick={onAddSchedule}
                    className="w-100"
                    disabled={loading}
                >
                    <FaPlus className="me-2" />
                    일정 등록
                </Button>
            </Col>
        </Row>
    );
};

export default ScheduleFilters;

