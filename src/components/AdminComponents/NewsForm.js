import React, { useState, useEffect } from 'react';
import { X, Save, ExternalLink } from 'lucide-react';

const NewsForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = null, 
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    publishDate: '',
    linkUrl: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        subtitle: initialData.subtitle || '',
        publishDate: initialData.publishDate ? 
          new Date(initialData.publishDate).toISOString().slice(0, 16) : '',
        linkUrl: initialData.linkUrl || ''
      });
    } else {
      setFormData({
        title: '',
        subtitle: '',
        publishDate: new Date().toISOString().slice(0, 16),
        linkUrl: ''
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 에러 제거
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = '제목은 필수 입력 항목입니다.';
    }

    if (!formData.publishDate) {
      newErrors.publishDate = '작성날짜는 필수 입력 항목입니다.';
    }

    if (!formData.linkUrl.trim()) {
      newErrors.linkUrl = '링크주소는 필수 입력 항목입니다.';
    } else {
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlPattern.test(formData.linkUrl)) {
        newErrors.linkUrl = '올바른 URL 형식이 아닙니다.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const submitData = {
        ...formData,
        publishDate: new Date(formData.publishDate).toISOString()
      };
      onSubmit(submitData);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      subtitle: '',
      publishDate: '',
      linkUrl: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {initialData ? '뉴스 수정' : '뉴스 등록'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X size={24} />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 제목 */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="뉴스 제목을 입력하세요"
              disabled={isLoading}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* 부제목 */}
          <div>
            <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-2">
              부제목
            </label>
            <input
              type="text"
              id="subtitle"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="뉴스 부제목을 입력하세요 (선택사항)"
              disabled={isLoading}
            />
          </div>

          {/* 작성날짜 */}
          <div>
            <label htmlFor="publishDate" className="block text-sm font-medium text-gray-700 mb-2">
              작성날짜 <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              id="publishDate"
              name="publishDate"
              value={formData.publishDate}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.publishDate ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {errors.publishDate && (
              <p className="mt-1 text-sm text-red-600">{errors.publishDate}</p>
            )}
          </div>

          {/* 링크주소 */}
          <div>
            <label htmlFor="linkUrl" className="block text-sm font-medium text-gray-700 mb-2">
              링크주소 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="url"
                id="linkUrl"
                name="linkUrl"
                value={formData.linkUrl}
                onChange={handleChange}
                className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.linkUrl ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="https://example.com/news"
                disabled={isLoading}
              />
              {formData.linkUrl && (
                <a
                  href={formData.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-700"
                >
                  <ExternalLink size={16} />
                </a>
              )}
            </div>
            {errors.linkUrl && (
              <p className="mt-1 text-sm text-red-600">{errors.linkUrl}</p>
            )}
          </div>

          {/* 버튼 */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              disabled={isLoading}
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>처리중...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{initialData ? '수정' : '등록'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewsForm;
