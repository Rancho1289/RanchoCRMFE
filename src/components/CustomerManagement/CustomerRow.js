// CustomerRow v2.0 - Enhanced null safety - Updated: 2025-01-04
import React from 'react';
import { Form, Button, Badge } from 'react-bootstrap';
import { FaPhone, FaEdit } from 'react-icons/fa';
import { formatPhoneNumber, formatCurrency } from '../../utils/format';
import { getBuyPriceRangesDisplay } from '../../utils/price';

const CustomerRow = ({
    customer,
    index,
    user,
    loading,
    selectedCustomers,
    onSelectCustomer,
    onShowModal,
    onSendSMS,
    onViewScheduleHistory,
    getTypeBadge
}) => {
    // 모든 필수 props와 customer 데이터 검증 - 더 강력한 체크
    if (!customer || 
        typeof customer !== 'object' ||
        !customer._id || 
        !user || 
        !selectedCustomers || 
        typeof onSelectCustomer !== 'function' ||
        typeof onShowModal !== 'function' ||
        typeof onViewScheduleHistory !== 'function' ||
        typeof getTypeBadge !== 'function') {
        console.warn('CustomerRow: 필수 props가 누락되었습니다', { 
            customer: customer ? 'exists' : 'null/undefined',
            customerId: customer?._id || 'no_id',
            user: user ? 'exists' : 'null/undefined',
            selectedCustomers: selectedCustomers ? 'exists' : 'null/undefined'
        });
        return null;
    }

    // 추가 안전 체크
    try {
        const isSelected = selectedCustomers.has(customer._id);
        
        return (
            <tr
                key={customer._id}
                onClick={() => onViewScheduleHistory(customer)}
                style={{ cursor: 'pointer' }}
                className="hover-row"
                title="클릭하여 지원 이력 보기"
            >
                {/* 데스크톱 버전 */}
                <td className="d-none d-md-table-cell">
                    <Form.Check
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => { }} // 빈 함수로 설정
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelectCustomer(customer._id, index, e);
                        }}
                    />
                </td>
                <td className="d-none d-md-table-cell">
                    <strong>{customer.name || '이름 없음'}</strong>
                </td>
                <td className="d-none d-md-table-cell">
                    {getTypeBadge(customer.buyTypes, customer.categories)}
                </td>
                <td className="d-none d-md-table-cell">
                    <div>
                        <FaPhone className="text-muted me-1" />
                        {formatPhoneNumber(customer.phone)}
                    </div>
                </td>
                <td className="d-none d-md-table-cell">
                    {customer.categories && customer.categories.includes('매수') ? (
                        <div>
                            {/* 예산 정보 */}
                            {customer.budget && (
                                <div className="mb-1">
                                    <small className="text-primary fw-bold">
                                        예산: {formatCurrency(customer.budget)}
                                    </small>
                                </div>
                            )}

                            {/* 가격 범위 정보 */}
                            {getBuyPriceRangesDisplay(customer) !== '가격 정보 없음' && (
                                <div>
                                    {Array.isArray(getBuyPriceRangesDisplay(customer)) ?
                                        getBuyPriceRangesDisplay(customer).map((range, index) => (
                                            <div key={index} className="mb-1">
                                                <small className="text-muted">{range}</small>
                                            </div>
                                        )) :
                                        <div className="mb-1">
                                            <small className="text-muted">{getBuyPriceRangesDisplay(customer)}</small>
                                        </div>
                                    }
                                </div>
                            )}
                        </div>
                    ) : (
                        customer.properties && customer.properties.length > 0 ? (
                            <div>
                                {customer.properties.slice(0, 2).map((prop, index) => (
                                    <div key={index} className="mb-1">
                                        <small>
                                            {prop.property?.type === '매매' && prop.property?.price ? formatCurrency(prop.property.price) :
                                                prop.property?.type === '월세' && prop.property?.price ? formatCurrency(prop.property.price) :
                                                    prop.property?.type === '전세' && prop.property?.price ? formatCurrency(prop.property.price) :
                                                        '가격 정보 없음'}
                                        </small>
                                    </div>
                                ))}
                                {customer.properties.length > 2 && (
                                    <small className="text-muted">
                                        +{customer.properties.length - 2}개 더
                                    </small>
                                )}
                            </div>
                        ) : '가격 정보 없음'
                    )}
                </td>
                <td className="d-none d-md-table-cell">
                    {customer.categories && customer.categories.includes('매수') ? customer.preferredArea : (
                        customer.properties && customer.properties.length > 0 ? (
                            <div>
                                {customer.properties.slice(0, 2).map((prop, index) => (
                                    <div key={index} className="mb-1">
                                        <small>{prop.property?.title || '매물명 없음'}</small>
                                    </div>
                                ))}
                                {customer.properties.length > 2 && (
                                    <small className="text-muted">
                                        +{customer.properties.length - 2}개 더
                                    </small>
                                )}
                            </div>
                        ) : '매물 없음'
                    )}
                </td>
                <td className="d-none d-md-table-cell">
                    <small className="text-muted">
                        {customer.publisher?.name || '알 수 없음'}
                        {customer.publisher?._id === user._id ? <Badge bg="white">🔹</Badge> : ''}
                    </small>
                </td>
                <td className="d-none d-md-table-cell">
                    {(user.level >= 11 || (customer.publisher?.businessNumber === user.businessNumber && user.level >= 5)) && (
                        <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-1"
                            onClick={(e) => {
                                e.stopPropagation();
                                onShowModal(customer);
                            }}
                            disabled={loading || (customer.status === '비활성' && user.level < 11)}
                            title={customer.status === '비활성' && user.level < 11 ? '비활성화된 고객은 수정할 수 없습니다' : ''}
                        >
                            <FaEdit />
                        </Button>
                    )}
                </td>

                {/* 모바일 버전 */}
                <td className="d-md-none">
                    <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                            <div className="d-flex align-items-center mb-1">
                                <Form.Check
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => { }} // 빈 함수로 설정
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSelectCustomer(customer._id, index, e);
                                    }}
                                    className="me-2"
                                />
                                <div className="fw-bold">{customer.name || '이름 없음'}</div>
                            </div>
                            <div className="small mb-1">
                                {getTypeBadge(customer.buyTypes, customer.categories)}
                            </div>
                            <div className="small mb-1">
                                <FaPhone className="text-muted me-1" />
                                {formatPhoneNumber(customer.phone)}
                            </div>
                            <div className="small text-muted mb-1">
                                {customer.address || '주소 없음'}
                            </div>
                            <div className="small">
                                {customer.categories && customer.categories.includes('매수') ? (
                                    <div>
                                        {/* 예산 정보 */}
                                        {customer.budget && (
                                            <div className="mb-1">
                                                <span className="text-primary fw-bold">
                                                    예산: {formatCurrency(customer.budget)}
                                                </span>
                                            </div>
                                        )}

                                        {/* 가격 범위 정보 */}
                                        {getBuyPriceRangesDisplay(customer) !== '가격 정보 없음' && (
                                            <div>
                                                {Array.isArray(getBuyPriceRangesDisplay(customer)) ?
                                                    getBuyPriceRangesDisplay(customer).map((range, index) => (
                                                        <div key={index} className="mb-1">
                                                            <span className="text-muted">{range}</span>
                                                        </div>
                                                    )) :
                                                    <div className="mb-1">
                                                        <span className="text-muted">{getBuyPriceRangesDisplay(customer)}</span>
                                                    </div>
                                                }
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    customer.properties && customer.properties.length > 0 ?
                                        `매물: ${customer.properties.length}개` :
                                        '매물 없음'
                                )}
                            </div>
                        </div>
                        <div className="ms-2">
                            {(user.level >= 11 || (customer.publisher?.businessNumber === user.businessNumber && user.level >= 5)) && (
                                <div className="d-flex flex-column gap-1">
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => onShowModal(customer)}
                                        disabled={loading || (customer.status === '비활성' && user.level < 11)}
                                        title={customer.status === '비활성' && user.level < 11 ? '비활성화된 고객은 수정할 수 없습니다' : ''}
                                    >
                                        <FaEdit />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </td>
            </tr>
        );
    } catch (error) {
        console.error('CustomerRow 렌더링 중 에러 발생:', error, { customer });
        return null;
    }
};

export default CustomerRow;