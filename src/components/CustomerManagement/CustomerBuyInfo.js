import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { formatCurrency, handleCurrencyInput, handleBuyTypeChange, handleBuyPriceRangeChange } from './customerUtils';

const CustomerBuyInfo = ({
    categories,
    buyTypes,
    setBuyTypes,
    buyPriceRanges,
    setBuyPriceRanges,
    editingCustomer,
    user
}) => {
    const isDisabled = editingCustomer?.status === '비활성' && user.level < 11;

    if (!categories.includes('매수')) {
        return null;
    }

    return (
        <div className="border border-success rounded p-3 mb-3" style={{ backgroundColor: '#f8fff8' }}>
            <div className="d-flex align-items-center mb-3">
                <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '24px', height: '24px' }}>
                    <i className="fas fa-shopping-cart" style={{ fontSize: '12px' }}></i>
                </div>
                <h6 className="mb-0 text-success fw-bold">매수 정보</h6>
            </div>
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">예산</Form.Label>
                        <Form.Control
                            name="budget"
                            defaultValue={editingCustomer?.budget ? formatCurrency(editingCustomer.budget) : ''}
                            placeholder="예: 1,000,000,000"
                            onChange={handleCurrencyInput}
                            disabled={isDisabled}
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">선호지역</Form.Label>
                        <Form.Control
                            name="preferredArea"
                            defaultValue={editingCustomer?.preferredArea}
                            placeholder="예: 강남구, 서초구"
                            disabled={isDisabled}
                        />
                    </Form.Group>
                </Col>
            </Row>
            
            <Row>
                <Col md={12}>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">원하는 매물 유형 (복수 선택 가능)</Form.Label>
                        <div>
                            {['매매', '월세', '전세'].map((typeOption) => (
                                <Form.Check
                                    key={typeOption}
                                    type="checkbox"
                                    id={`buyType-${typeOption}`}
                                    label={typeOption}
                                    checked={buyTypes.includes(typeOption)}
                                    onChange={() => handleBuyTypeChange(typeOption, buyTypes, setBuyTypes)}
                                    disabled={isDisabled}
                                    className="mb-2"
                                />
                            ))}
                        </div>
                        {buyTypes.length === 0 && (
                            <Form.Text className="text-danger">
                                최소 하나의 매물 유형을 선택해주세요.
                            </Form.Text>
                        )}
                    </Form.Group>
                </Col>
            </Row>

            {/* 매물 유형별 가격대 입력란 */}
            {buyTypes.length > 0 && (
                <Row>
                    <Col md={12}>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">원하는 가격대</Form.Label>
                            <div className="border rounded p-3" style={{ backgroundColor: '#f0f8f0' }}>
                                {buyTypes.includes('매매') && (
                                    <div className="mb-3">
                                        <h6 className="text-primary mb-2">매매</h6>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-2">
                                                    <Form.Label className="small">최소 가격</Form.Label>
                                                    <Form.Control
                                                        placeholder="예: 500,000,000"
                                                        value={buyPriceRanges.매매.min}
                                                        onChange={(e) => handleBuyPriceRangeChange('매매', 'min', e.target.value, buyPriceRanges, setBuyPriceRanges)}
                                                        onInput={handleCurrencyInput}
                                                        disabled={isDisabled}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-2">
                                                    <Form.Label className="small">최대 가격</Form.Label>
                                                    <Form.Control
                                                        placeholder="예: 1,000,000,000"
                                                        value={buyPriceRanges.매매.max}
                                                        onChange={(e) => handleBuyPriceRangeChange('매매', 'max', e.target.value, buyPriceRanges, setBuyPriceRanges)}
                                                        onInput={handleCurrencyInput}
                                                        disabled={isDisabled}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </div>
                                )}

                                {buyTypes.includes('월세') && (
                                    <div className="mb-3">
                                        <h6 className="text-success mb-2">월세</h6>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-2">
                                                    <Form.Label className="small">월세 최소</Form.Label>
                                                    <Form.Control
                                                        placeholder="예: 500,000"
                                                        value={buyPriceRanges.월세.monthlyRent.min}
                                                        onChange={(e) => handleBuyPriceRangeChange('월세', 'monthlyRent', { ...buyPriceRanges.월세.monthlyRent, min: e.target.value }, buyPriceRanges, setBuyPriceRanges)}
                                                        onInput={handleCurrencyInput}
                                                        disabled={isDisabled}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-2">
                                                    <Form.Label className="small">월세 최대</Form.Label>
                                                    <Form.Control
                                                        placeholder="예: 1,000,000"
                                                        value={buyPriceRanges.월세.monthlyRent.max}
                                                        onChange={(e) => handleBuyPriceRangeChange('월세', 'monthlyRent', { ...buyPriceRanges.월세.monthlyRent, max: e.target.value }, buyPriceRanges, setBuyPriceRanges)}
                                                        onInput={handleCurrencyInput}
                                                        disabled={isDisabled}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-2">
                                                    <Form.Label className="small">보증금 최소</Form.Label>
                                                    <Form.Control
                                                        placeholder="예: 10,000,000"
                                                        value={buyPriceRanges.월세.deposit.min}
                                                        onChange={(e) => handleBuyPriceRangeChange('월세', 'deposit', { ...buyPriceRanges.월세.deposit, min: e.target.value }, buyPriceRanges, setBuyPriceRanges)}
                                                        onInput={handleCurrencyInput}
                                                        disabled={isDisabled}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-2">
                                                    <Form.Label className="small">보증금 최대</Form.Label>
                                                    <Form.Control
                                                        placeholder="예: 50,000,000"
                                                        value={buyPriceRanges.월세.deposit.max}
                                                        onChange={(e) => handleBuyPriceRangeChange('월세', 'deposit', { ...buyPriceRanges.월세.deposit, max: e.target.value }, buyPriceRanges, setBuyPriceRanges)}
                                                        onInput={handleCurrencyInput}
                                                        disabled={isDisabled}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </div>
                                )}

                                {buyTypes.includes('전세') && (
                                    <div className="mb-3">
                                        <h6 className="text-warning mb-2">전세</h6>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-2">
                                                    <Form.Label className="small">전세금 최소</Form.Label>
                                                    <Form.Control
                                                        placeholder="예: 100,000,000"
                                                        value={buyPriceRanges.전세.min}
                                                        onChange={(e) => handleBuyPriceRangeChange('전세', 'min', e.target.value, buyPriceRanges, setBuyPriceRanges)}
                                                        onInput={handleCurrencyInput}
                                                        disabled={isDisabled}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-2">
                                                    <Form.Label className="small">전세금 최대</Form.Label>
                                                    <Form.Control
                                                        placeholder="예: 300,000,000"
                                                        value={buyPriceRanges.전세.max}
                                                        onChange={(e) => handleBuyPriceRangeChange('전세', 'max', e.target.value, buyPriceRanges, setBuyPriceRanges)}
                                                        onInput={handleCurrencyInput}
                                                        disabled={isDisabled}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </div>
                                )}
                            </div>
                        </Form.Group>
                    </Col>
                </Row>
            )}
        </div>
    );
};

export default CustomerBuyInfo; 