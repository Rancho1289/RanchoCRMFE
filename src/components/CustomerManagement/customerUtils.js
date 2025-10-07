// 금액 포맷팅 함수
export const formatCurrency = (value) => {
    if (!value) return '';
    // 숫자와 콤마만 남기고 모두 제거
    const numbers = value.toString().replace(/[^\d,]/g, '');
    // 콤마 제거 후 숫자만 추출
    const cleanNumbers = numbers.replace(/,/g, '');
    if (cleanNumbers === '') return '';
    // 1000단위 콤마 추가
    return parseInt(cleanNumbers).toLocaleString();
};

// 금액 입력 처리 함수
export const handleCurrencyInput = (e) => {
    const formatted = formatCurrency(e.target.value);
    e.target.value = formatted;
};

// 고객 분류 변경 처리
export const handleCategoryChange = (category, categories, setCategories) => {
    if (categories.includes(category)) {
        setCategories(categories.filter(c => c !== category));
    } else {
        setCategories([...categories, category]);
    }
};

// 매수 유형 변경 처리
export const handleBuyTypeChange = (buyType, buyTypes, setBuyTypes) => {
    if (buyTypes.includes(buyType)) {
        setBuyTypes(buyTypes.filter(t => t !== buyType));
    } else {
        setBuyTypes([...buyTypes, buyType]);
    }
};

// 매수 가격대 입력 처리 함수
export const handleBuyPriceRangeChange = (type, field, value, buyPriceRanges, setBuyPriceRanges) => {
    setBuyPriceRanges(prev => {
        const newRanges = { ...prev };
        if (type === '월세') {
            if (field === 'monthlyRent') {
                newRanges.월세.monthlyRent = value;
            } else if (field === 'deposit') {
                newRanges.월세.deposit = value;
            }
        } else {
            newRanges[type][field] = value;
        }
        return newRanges;
    });
};

// 초기 매수 가격대 상태
export const getInitialBuyPriceRanges = (editingCustomer) => {
    return {
        매매: editingCustomer?.buyPriceRanges?.매매 || { min: '', max: '' },
        월세: editingCustomer?.buyPriceRanges?.월세 || { monthlyRent: { min: '', max: '' }, deposit: { min: '', max: '' } },
        전세: editingCustomer?.buyPriceRanges?.전세 || { min: '', max: '' }
    };
};

// 매물 타입별 배지 색상
export const getPropertyTypeBadgeColor = (propertyType) => {
    switch (propertyType) {
        case '매매': return 'primary';
        case '월세': return 'success';
        case '전세': return 'warning';
        default: return 'secondary';
    }
}; 