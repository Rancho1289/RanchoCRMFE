// 공통 포맷 유틸

export const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    const numbers = phone.replace(/\D/g, '');
    if (numbers.length === 11) {
        return numbers.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    } else if (numbers.length === 10) {
        return numbers.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    }
    return phone;
};

export const formatCurrency = (value) => {
    if (!value) return '';
    return Number(value).toLocaleString();
};


