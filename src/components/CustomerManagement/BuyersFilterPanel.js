import React from 'react';
import { Accordion, Row, Col, Button, Form } from 'react-bootstrap';
import { formatPriceForDisplay, formatAppliedPrice } from '../../utils/price';

const BuyersFilterPanel = ({
    selectedBuyTypes,
    onToggleBuyType,
    onToggleAllBuyTypes,
    tempPriceFilters,
    sliderValues,
    onSliderChange,
    onTempPriceChange,
    onApply,
    onClear,
    filteredCount,
    appliedPriceFilters
}) => {
    return (
        <Accordion defaultActiveKey="1" className="mb-3">
            <Accordion.Item eventKey="0">
                <Accordion.Header>
                    <h6 className="mb-0">고객 필터</h6>
                </Accordion.Header>
                <Accordion.Body>
                    <Row className="mb-3">
                        <Col xs={12}>
                            <h6 className="mb-2">고객 유형</h6>
                            <div className="d-flex flex-wrap gap-2 mb-2">
                                {['월세', '전세', '매매'].map(type => (
                                    <div key={type} className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id={`buyType-${type}`}
                                            checked={selectedBuyTypes.has(type)}
                                            onChange={() => onToggleBuyType(type)}
                                        />
                                        <label className="form-check-label" htmlFor={`buyType-${type}`}>
                                            {type}
                                        </label>
                                    </div>
                                ))}
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={onToggleAllBuyTypes}
                                    className="ms-2"
                                >
                                    {selectedBuyTypes.size === 3 ? '전체 해제' : '전체 선택'}
                                </Button>
                            </div>
                        </Col>
                    </Row>

                    <Row>
                        <Col xs={12}>
                            <h6 className="mb-3">가격 범위 필터</h6>
                            <small className="text-muted mb-3 d-block">
                                💡 사용법: 숫자 입력 시 '억', '천만', '만' 단위 사용 가능 (예: 1억, 5000만) | 슬라이더로도 조정 가능 | '적용' 버튼을 눌러야 필터가 적용됩니다
                            </small>

                            <Row>
                                {selectedBuyTypes.has('매매') && (
                                    <Col xs={12} lg={12} className="mb-3">
                                        <div className="border rounded p-3">
                                            <h6 className="mb-3 text-primary">매매</h6>
                                            <Row>
                                                <Col xs={12} md={6} className="mb-3">
                                                    <Form.Label className="small fw-bold">최소가격</Form.Label>
                                                    <Form.Range
                                                        min="0"
                                                        max="10000000000"
                                                        step="10000000"
                                                        value={sliderValues.매매.min}
                                                        onChange={(e) => onSliderChange('매매', 'min', e.target.value)}
                                                        className="mb-2"
                                                    />
                                                    <div className="d-flex gap-2">
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="예: 100000000"
                                                            value={tempPriceFilters.매매.min ? formatAppliedPrice(tempPriceFilters.매매.min) : ''}
                                                            onChange={(e) => onTempPriceChange('매매', 'min', e.target.value)}
                                                            size="sm"
                                                        />
                                                        <small className="text-primary align-self-center fw-bold">
                                                            {tempPriceFilters.매매.min ? formatPriceForDisplay(tempPriceFilters.매매.min) : '0원'}
                                                        </small>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} className="mb-3">
                                                    <Form.Label className="small fw-bold">최대가격</Form.Label>
                                                    <Form.Range
                                                        min="0"
                                                        max="10000000000"
                                                        step="10000000"
                                                        value={sliderValues.매매.max}
                                                        onChange={(e) => onSliderChange('매매', 'max', e.target.value)}
                                                        className="mb-2"
                                                    />
                                                    <div className="d-flex gap-2">
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="예: 1000000000"
                                                            value={tempPriceFilters.매매.max ? formatAppliedPrice(tempPriceFilters.매매.max) : ''}
                                                            onChange={(e) => onTempPriceChange('매매', 'max', e.target.value)}
                                                            size="sm"
                                                        />
                                                        <small className="text-primary align-self-center fw-bold">
                                                            {tempPriceFilters.매매.max ? formatPriceForDisplay(tempPriceFilters.매매.max) : '0원'}
                                                        </small>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </div>
                                    </Col>
                                )}

                                {selectedBuyTypes.has('월세') && (
                                    <Col xs={12} lg={12} className="mb-3">
                                        <div className="border rounded p-3">
                                            <h6 className="mb-3 text-success">월세</h6>
                                            <Row>
                                                <Col xs={12} md={6} className="mb-3">
                                                    <Form.Label className="small fw-bold">보증금 최소</Form.Label>
                                                    <Form.Range
                                                        min="0"
                                                        max="1000000000"
                                                        step="1000000"
                                                        value={sliderValues.월세.depositMin}
                                                        onChange={(e) => onSliderChange('월세', 'depositMin', e.target.value)}
                                                        className="mb-2"
                                                    />
                                                    <div className="d-flex gap-2">
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="예: 10000000"
                                                            value={tempPriceFilters.월세.depositMin ? formatAppliedPrice(tempPriceFilters.월세.depositMin) : ''}
                                                            onChange={(e) => onTempPriceChange('월세', 'depositMin', e.target.value)}
                                                            size="sm"
                                                        />
                                                        <small className="text-success align-self-center fw-bold">
                                                            {tempPriceFilters.월세.depositMin ? formatPriceForDisplay(tempPriceFilters.월세.depositMin) : '0원'}
                                                        </small>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} className="mb-3">
                                                    <Form.Label className="small fw-bold">보증금 최대</Form.Label>
                                                    <Form.Range
                                                        min="0"
                                                        max="1000000000"
                                                        step="1000000"
                                                        value={sliderValues.월세.depositMax}
                                                        onChange={(e) => onSliderChange('월세', 'depositMax', e.target.value)}
                                                        className="mb-2"
                                                    />
                                                    <div className="d-flex gap-2">
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="예: 100000000"
                                                            value={tempPriceFilters.월세.depositMax ? formatAppliedPrice(tempPriceFilters.월세.depositMax) : ''}
                                                            onChange={(e) => onTempPriceChange('월세', 'depositMax', e.target.value)}
                                                            size="sm"
                                                        />
                                                        <small className="text-success align-self-center fw-bold">
                                                            {tempPriceFilters.월세.depositMax ? formatPriceForDisplay(tempPriceFilters.월세.depositMax) : '0원'}
                                                        </small>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} className="mb-3">
                                                    <Form.Label className="small fw-bold">월세 최소</Form.Label>
                                                    <Form.Range
                                                        min="0"
                                                        max="10000000"
                                                        step="10000"
                                                        value={sliderValues.월세.rentMin}
                                                        onChange={(e) => onSliderChange('월세', 'rentMin', e.target.value)}
                                                        className="mb-2"
                                                    />
                                                    <div className="d-flex gap-2">
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="예: 500000"
                                                            value={tempPriceFilters.월세.rentMin ? formatAppliedPrice(tempPriceFilters.월세.rentMin) : ''}
                                                            onChange={(e) => onTempPriceChange('월세', 'rentMin', e.target.value)}
                                                            size="sm"
                                                        />
                                                        <small className="text-success align-self-center fw-bold">
                                                            {tempPriceFilters.월세.rentMin ? formatPriceForDisplay(tempPriceFilters.월세.rentMin) : '0원'}
                                                        </small>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} className="mb-3">
                                                    <Form.Label className="small fw-bold">월세 최대</Form.Label>
                                                    <Form.Range
                                                        min="0"
                                                        max="10000000"
                                                        step="10000"
                                                        value={sliderValues.월세.rentMax}
                                                        onChange={(e) => onSliderChange('월세', 'rentMax', e.target.value)}
                                                        className="mb-2"
                                                    />
                                                    <div className="d-flex gap-2">
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="예: 2000000"
                                                            value={tempPriceFilters.월세.rentMax ? formatAppliedPrice(tempPriceFilters.월세.rentMax) : ''}
                                                            onChange={(e) => onTempPriceChange('월세', 'rentMax', e.target.value)}
                                                            size="sm"
                                                        />
                                                        <small className="text-success align-self-center fw-bold">
                                                            {tempPriceFilters.월세.rentMax ? formatPriceForDisplay(tempPriceFilters.월세.rentMax) : '0원'}
                                                        </small>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </div>
                                    </Col>
                                )}

                                {selectedBuyTypes.has('전세') && (
                                    <Col xs={12} lg={12} className="mb-3">
                                        <div className="border rounded p-3">
                                            <h6 className="mb-3 text-warning">전세</h6>
                                            <Row>
                                                <Col xs={12} md={6} className="mb-3">
                                                    <Form.Label className="small fw-bold">최소가격</Form.Label>
                                                    <Form.Range
                                                        min="0"
                                                        max="10000000000"
                                                        step="10000000"
                                                        value={sliderValues.전세.min}
                                                        onChange={(e) => onSliderChange('전세', 'min', e.target.value)}
                                                        className="mb-2"
                                                    />
                                                    <div className="d-flex gap-2">
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="예: 100000000"
                                                            value={tempPriceFilters.전세.min ? formatAppliedPrice(tempPriceFilters.전세.min) : ''}
                                                            onChange={(e) => onTempPriceChange('전세', 'min', e.target.value)}
                                                            size="sm"
                                                        />
                                                        <small className="text-warning align-self-center fw-bold">
                                                            {tempPriceFilters.전세.min ? formatPriceForDisplay(tempPriceFilters.전세.min) : '0원'}
                                                        </small>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} className="mb-3">
                                                    <Form.Label className="small fw-bold">최대가격</Form.Label>
                                                    <Form.Range
                                                        min="0"
                                                        max="10000000000"
                                                        step="10000000"
                                                        value={sliderValues.전세.max}
                                                        onChange={(e) => onSliderChange('전세', 'max', e.target.value)}
                                                        className="mb-2"
                                                    />
                                                    <div className="d-flex gap-2">
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="예: 500000000"
                                                            value={tempPriceFilters.전세.max ? formatAppliedPrice(tempPriceFilters.전세.max) : ''}
                                                            onChange={(e) => onTempPriceChange('전세', 'max', e.target.value)}
                                                            size="sm"
                                                        />
                                                        <small className="text-warning align-self-center fw-bold">
                                                            {tempPriceFilters.전세.max ? formatPriceForDisplay(tempPriceFilters.전세.max) : '0원'}
                                                        </small>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </div>
                                    </Col>
                                )}
                            </Row>
                        </Col>
                    </Row>

                    <Row className="mt-3">
                        <Col xs={12}>
                            <div className="d-flex gap-2">
                                <Button variant="primary" onClick={onApply} className="flex-grow-1">
                                    필터 적용
                                </Button>
                                <Button variant="outline-secondary" onClick={onClear} className="flex-grow-1">
                                    필터 초기화
                                </Button>
                            </div>
                        </Col>
                    </Row>

                    <Row className="mt-3">
                        <Col xs={12}>
                            <div className="bg-light p-2 rounded">
                                <small className="text-muted">
                                    <strong>필터 결과:</strong> {filteredCount}개의 고객이 표시됩니다
                                    {selectedBuyTypes.size > 0 && (
                                        <span className="ms-2">(선택된 유형: {Array.from(selectedBuyTypes).join(', ')})</span>
                                    )}
                                    {Object.values(appliedPriceFilters).some(filter => Object.values(filter).some(value => value !== '')) && (
                                        <span className="ms-2">| 가격 범위 필터 적용됨</span>
                                    )}
                                </small>
                            </div>
                        </Col>
                    </Row>
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
    );
};

export default BuyersFilterPanel;


