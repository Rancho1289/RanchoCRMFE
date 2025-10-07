// 일정 관련 유틸리티 함수들

// 날짜 범위 계산 함수
export const getDateRange = (date, mode) => {
    if (!date) {
        const today = new Date();
        return getDateRange(today, mode);
    }
    
    const start = new Date(date);
    const end = new Date(date);
    
    switch (mode) {
        case 'day':
            // 일간: 선택된 날짜만
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            break;
        case 'week':
            // 주간: 선택된 날짜가 포함된 주의 월요일부터 일요일까지
            const dayOfWeek = start.getDay();
            const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 일요일이면 -6, 아니면 1-dayOfWeek
            start.setDate(start.getDate() + mondayOffset);
            start.setHours(0, 0, 0, 0);
            end.setDate(start.getDate() + 6);
            end.setHours(23, 59, 59, 999);
            break;
        case 'month':
        default:
            // 월간: 선택된 날짜가 포함된 월의 1일부터 마지막 날까지
            start.setDate(1);
            start.setHours(0, 0, 0, 0);
            end.setMonth(end.getMonth() + 1, 0); // 다음 달의 0일 = 이번 달 마지막 날
            end.setHours(23, 59, 59, 999);
            break;
    }
    
    return { start, end };
};

// 월의 날짜들 계산 함수
export const getDaysInMonth = (date) => {
    if (!date || !(date instanceof Date)) {
        return [];
    }
    
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDay; i++) {
        days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(year, month, i));
    }
    return days;
};

// 특정 날짜의 일정 필터링 함수
export const getSchedulesForDate = (date, allSchedules) => {
    if (!date) return [];
    
    // 로컬 날짜 사용 (시간대 문제 해결)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const filteredSchedules = allSchedules.filter(schedule => {
        const scheduleDate = new Date(schedule.date);
        const scheduleYear = scheduleDate.getFullYear();
        const scheduleMonth = String(scheduleDate.getMonth() + 1).padStart(2, '0');
        const scheduleDay = String(scheduleDate.getDate()).padStart(2, '0');
        const scheduleDateStr = `${scheduleYear}-${scheduleMonth}-${scheduleDay}`;
        return scheduleDateStr === dateStr;
    });
    
    return filteredSchedules;
};

// 주간 일정 그룹화 함수
export const getWeekSchedules = (selectedDate, allSchedules) => {
    if (!selectedDate) {
        return [];
    }
    
    const { start } = getDateRange(selectedDate, 'week');
    const weekSchedules = [];
    
    for (let i = 0; i < 7; i++) {
        const day = new Date(start);
        day.setDate(start.getDate() + i);
        
        const daySchedules = (allSchedules || []).filter(schedule => {
            if (!schedule || !schedule.date) return false;
            const scheduleDate = new Date(schedule.date);
            return scheduleDate.toDateString() === day.toDateString();
        });
        
        weekSchedules.push({
            date: new Date(day),
            schedules: daySchedules
        });
    }
    
    return weekSchedules;
};

// 날짜 포맷팅 함수
export const formatDate = (date) => {
    return date.toLocaleDateString('ko-KR', { 
        year: 'numeric', 
        month: 'long' 
    });
};

// 전화번호 포맷팅 함수
export const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    // 숫자만 추출
    const numbers = phone.replace(/\D/g, '');

    // 11자리인 경우 (01012345678 -> 010-1234-5678)
    if (numbers.length === 11) {
        return numbers.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    }
    // 10자리인 경우 (0101234567 -> 010-123-4567)
    else if (numbers.length === 10) {
        return numbers.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    }
    // 그 외의 경우는 원본 반환
    return phone;
};

// 페이지네이션 생성 함수
export const createSchedulePagination = (currentPage, totalPages, onPageChange, keyPrefix) => {
    if (totalPages <= 1) {
        return [];
    }

    const items = [];
    const pagesPerGroup = 5; // 5개씩 묶음

    // 현재 그룹 계산
    const currentGroup = Math.ceil(currentPage / pagesPerGroup);
    const totalGroups = Math.ceil(totalPages / pagesPerGroup);

    // 그룹의 시작과 끝 페이지 계산
    const groupStartPage = (currentGroup - 1) * pagesPerGroup + 1;
    const groupEndPage = Math.min(currentGroup * pagesPerGroup, totalPages);

    // 맨 처음으로 (≪)
    items.push({
        type: 'first',
        key: `${keyPrefix}-first`,
        onClick: () => onPageChange(1),
        disabled: currentPage === 1,
        title: '맨 처음',
        content: '≪'
    });

    // 이전 그룹으로 (<)
    items.push({
        type: 'prev',
        key: `${keyPrefix}-prevGroup`,
        onClick: () => onPageChange(Math.max(1, groupStartPage - 1)),
        disabled: currentGroup === 1,
        title: '이전 그룹',
        content: '&lt;'
    });

    // 현재 그룹의 페이지 번호들 (1, 2, 3, 4, 5)
    for (let page = groupStartPage; page <= groupEndPage; page++) {
        items.push({
            type: 'item',
            key: `${keyPrefix}-page-${page}`,
            active: page === currentPage,
            onClick: () => onPageChange(page),
            content: page
        });
    }

    // 다음 그룹으로 (>)
    items.push({
        type: 'next',
        key: `${keyPrefix}-nextGroup`,
        onClick: () => onPageChange(Math.min(totalPages, groupEndPage + 1)),
        disabled: currentGroup === totalGroups,
        title: '다음 그룹',
        content: '&gt;'
    });

    // 맨 마지막으로 (≫)
    items.push({
        type: 'last',
        key: `${keyPrefix}-last`,
        onClick: () => onPageChange(totalPages),
        disabled: currentPage === totalPages,
        title: '맨 마지막',
        content: '≫'
    });

    return items;
};

// 페이지 번호들 계산 함수
export const getPageNumbers = (currentPage, totalPages, maxVisiblePages = 5) => {
    const pageNumbers = [];

    if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i);
        }
    } else {
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }
    }

    return pageNumbers;
};
