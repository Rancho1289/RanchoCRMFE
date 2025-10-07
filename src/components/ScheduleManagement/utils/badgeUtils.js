import { Badge } from 'react-bootstrap';

// 일정 유형 배지 생성 함수
export const getTypeBadge = (type) => {
    const variants = {
        '시세조사': 'primary',
        '고객상담': 'success',
        '계약관리': 'warning',
        '기타': 'secondary'
    };
    return <Badge bg={variants[type] || 'secondary'}>{type}</Badge>;
};

// 일정 상태 배지 생성 함수
export const getStatusBadge = (status) => {
    const statusConfig = {
        '예정': { variant: 'primary', text: '예정' },
        '진행중': { variant: 'warning', text: '진행중' },
        '완료': { variant: 'success', text: '완료' },
        '취소': { variant: 'danger', text: '취소' }
    };

    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
};

// 일정 우선순위 배지 생성 함수
export const getPriorityBadge = (priority) => {
    const variants = {
        '높음': 'danger',    // 빨간색
        '보통': 'primary',   // 파란색
        '낮음': 'warning'    // 주황색
    };
    return <Badge bg={variants[priority] || 'secondary'}>{priority}</Badge>;
};

