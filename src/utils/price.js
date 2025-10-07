import { formatCurrency } from './format';

export const parsePriceInput = (input) => {
    if (!input || input === '') return '';
    const str = input.toString().trim();
    if (/^\d+$/.test(str)) {
        return parseInt(str);
    }
    if (str.includes('억')) {
        const value = parseFloat(str.replace('억', ''));
        return Math.floor(value * 100000000);
    }
    if (str.includes('천만')) {
        const value = parseFloat(str.replace('천만', ''));
        return Math.floor(value * 10000000);
    }
    if (str.includes('만')) {
        const value = parseFloat(str.replace('만', ''));
        return Math.floor(value * 10000);
    }
    if (/^[\d,]+$/.test(str)) {
        return parseInt(str.replace(/,/g, ''));
    }
    return '';
};

export const formatPriceForDisplay = (value) => {
    if (!value || value === '') return '';
    const num = parseInt(value);
    if (isNaN(num)) return '';
    if (num >= 100000000) {
        const eok = Math.floor(num / 100000000);
        const remainder = num % 100000000;
        if (remainder === 0) {
            return `${eok}억`;
        } else if (remainder >= 10000000) {
            const cheonman = Math.floor(remainder / 10000000);
            return `${eok}억${cheonman}천만`;
        } else {
            return `${eok}억${remainder.toLocaleString()}`;
        }
    } else if (num >= 10000000) {
        const cheonman = Math.floor(num / 10000000);
        const remainder = num % 10000000;
        if (remainder === 0) {
            return `${cheonman}천만`;
        } else {
            return `${cheonman}천만${remainder.toLocaleString()}`;
        }
    } else if (num >= 10000) {
        const man = Math.floor(num / 10000);
        const remainder = num % 10000;
        if (remainder === 0) {
            return `${man}만`;
        } else {
            return `${man}만${remainder.toLocaleString()}`;
        }
    } else {
        return num.toLocaleString();
    }
};

export const formatAppliedPrice = (value) => {
    if (!value || value === '') return '';
    const num = parseInt(value);
    if (isNaN(num)) return '';
    return num.toLocaleString();
};

export const getBuyPriceRangesDisplay = (customer) => {
    if (!customer.buyPriceRanges) return '가격 정보 없음';
    const ranges = [];
    if (customer.buyPriceRanges.매매) {
        const { min, max } = customer.buyPriceRanges.매매;
        ranges.push(`매매: ${formatCurrency(min)} ~ ${formatCurrency(max)}`);
    }
    if (customer.buyPriceRanges.월세) {
        const { monthlyRent, deposit } = customer.buyPriceRanges.월세;
        if (monthlyRent && deposit) {
            ranges.push(`월세: ${formatCurrency(deposit.min)}/${formatCurrency(monthlyRent.min)} ~ ${formatCurrency(deposit.max)}/${formatCurrency(monthlyRent.max)}`);
        }
    }
    if (customer.buyPriceRanges.전세) {
        const { min, max } = customer.buyPriceRanges.전세;
        ranges.push(`전세: ${formatCurrency(min)} ~ ${formatCurrency(max)}`);
    }
    return ranges.length > 0 ? ranges : '가격 정보 없음';
};


