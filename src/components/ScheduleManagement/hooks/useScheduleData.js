import { useState, useCallback } from 'react';
import api from '../../../utils/api';

// 일정 데이터 관리 훅
export const useScheduleData = (filters) => {
    const [schedules, setSchedules] = useState([]);
    const [allSchedules, setAllSchedules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // 페이지네이션된 일정 목록 가져오기
    const fetchSchedules = useCallback(async (page = 1, limit = 5) => {
        try {
            setLoading(true);
            setError('');

            const params = new URLSearchParams();
            if (filters.type !== 'all') {
                params.append('type', filters.type);
            }
            if (filters.status !== 'all') {
                params.append('status', filters.status);
            }
            if (filters.priority !== 'all') {
                params.append('priority', filters.priority);
            }
            if (filters.search) {
                params.append('search', filters.search);
            }

            params.append('page', page.toString());
            params.append('limit', limit.toString());

            const response = await api.get(`/schedules?${params.toString()}`);

            if (response.data.success) {
                setSchedules(response.data.data);
                return {
                    data: response.data.data,
                    total: response.data.total || response.data.data.length
                };
            } else {
                setError('일정 목록을 불러오는데 실패했습니다.');
                return { data: [], total: 0 };
            }
        } catch (error) {
            console.error('일정 목록 조회 오류:', error);

            // 401 오류인 경우 로그인 만료 메시지 표시
            if (error.response?.status === 401) {
                setError('로그인이 만료되었습니다. 다시 로그인해주세요.');
            } else if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
                setError('백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
            } else {
                setError('일정 목록을 불러오는 중 오류가 발생했습니다.');
            }
            return { data: [], total: 0 };
        } finally {
            setLoading(false);
        }
    }, [filters.type, filters.status, filters.priority, filters.search]);

    // 달력용 전체 일정 가져오기
    const fetchAllSchedules = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (filters.type !== 'all') {
                params.append('type', filters.type);
            }
            if (filters.status !== 'all') {
                params.append('status', filters.status);
            }
            if (filters.priority !== 'all') {
                params.append('priority', filters.priority);
            }
            if (filters.search) {
                params.append('search', filters.search);
            }

            params.append('page', '1');
            params.append('limit', '1000');

            const response = await api.get(`/schedules?${params.toString()}`);

            if (response.data.success) {
                setAllSchedules(response.data.data);
            } else {
                console.error('API 응답 실패:', response.data);
            }
        } catch (error) {
            console.error('전체 일정 조회 오류:', error);
            
            // 401 오류인 경우 로그인 만료 메시지 표시
            if (error.response?.status === 401) {
                setError('로그인이 만료되었습니다. 다시 로그인해주세요.');
            }
        }
    }, [filters.type, filters.status, filters.priority, filters.search]);

    return {
        schedules,
        allSchedules,
        loading,
        error,
        setError,
        fetchSchedules,
        fetchAllSchedules
    };
};
