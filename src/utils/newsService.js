import api from '../utils/api';

// 뉴스 API 서비스
export const newsService = {
  // 뉴스 생성
  createNews: async (newsData) => {
    try {
      const response = await api.post('/news', newsData);
      return response.data;
    } catch (error) {
      console.error('뉴스 생성 오류:', error);
      throw error;
    }
  },

  // 모든 뉴스 조회 (페이지네이션, 검색, 필터링)
  getAllNews: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);

      const response = await api.get(`/news?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('뉴스 조회 오류:', error);
      throw error;
    }
  },

  // 특정 뉴스 조회
  getNewsById: async (id) => {
    try {
      const response = await api.get(`/news/${id}`);
      return response.data;
    } catch (error) {
      console.error('뉴스 조회 오류:', error);
      throw error;
    }
  },

  // 최신 뉴스 조회
  getLatestNews: async (limit = 5) => {
    try {
      const response = await api.get(`/news/latest?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('최신 뉴스 조회 오류:', error);
      throw error;
    }
  },

  // 뉴스 수정
  updateNews: async (id, newsData) => {
    try {
      const response = await api.put(`/news/${id}`, newsData);
      return response.data;
    } catch (error) {
      console.error('뉴스 수정 오류:', error);
      throw error;
    }
  },

  // 뉴스 삭제 (소프트 삭제)
  deleteNews: async (id) => {
    try {
      const response = await api.delete(`/news/${id}`);
      return response.data;
    } catch (error) {
      console.error('뉴스 삭제 오류:', error);
      throw error;
    }
  },

  // 뉴스 완전 삭제
  hardDeleteNews: async (id) => {
    try {
      const response = await api.delete(`/news/${id}/hard`);
      return response.data;
    } catch (error) {
      console.error('뉴스 완전 삭제 오류:', error);
      throw error;
    }
  }
};

export default newsService;
