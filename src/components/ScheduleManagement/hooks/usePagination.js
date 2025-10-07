import { useState, useEffect, useMemo } from 'react';

// 페이지네이션 관리 훅
export const usePagination = (initialPage = 1, itemsPerPage = 5) => {
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [totalItems, setTotalItems] = useState(0);

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const resetPage = () => {
        setCurrentPage(1);
    };

    const updateTotalItems = (total) => {
        setTotalItems(total);
    };

    return {
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage,
        handlePageChange,
        resetPage,
        updateTotalItems
    };
};

// 뷰 모드 관리 훅
export const useViewMode = () => {
    const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'day'
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const handleViewModeChange = (mode) => {
        setViewMode(mode);
        const today = new Date();
        setSelectedDate(today);
        setCurrentMonth(today);
    };

    const navigateDate = (direction) => {
        const newDate = new Date(selectedDate);
        
        if (viewMode === 'day') {
            newDate.setDate(newDate.getDate() + direction);
        } else if (viewMode === 'week') {
            newDate.setDate(newDate.getDate() + (direction * 7));
        }
        
        setSelectedDate(newDate);
    };

    const navigateMonth = (direction) => {
        const newMonth = new Date(currentMonth);
        newMonth.setMonth(newMonth.getMonth() + direction);
        setCurrentMonth(newMonth);
    };

    return {
        viewMode,
        selectedDate,
        currentMonth,
        setSelectedDate,
        setCurrentMonth,
        handleViewModeChange,
        navigateDate,
        navigateMonth
    };
};

// 필터 관리 훅
export const useFilters = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');

    // filters 객체를 useMemo로 메모이제이션하여 불필요한 재생성 방지
    const filters = useMemo(() => ({
        search: searchTerm,
        type: filterType,
        status: filterStatus,
        priority: filterPriority
    }), [searchTerm, filterType, filterStatus, filterPriority]);

    const resetFilters = () => {
        setSearchTerm('');
        setFilterType('all');
        setFilterStatus('all');
        setFilterPriority('all');
    };

    return {
        searchTerm,
        filterType,
        filterStatus,
        filterPriority,
        filters,
        setSearchTerm,
        setFilterType,
        setFilterStatus,
        setFilterPriority,
        resetFilters
    };
};
