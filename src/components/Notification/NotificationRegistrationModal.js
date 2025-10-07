import React, { useState } from 'react';
import { Modal, Button, Spinner, Tabs, Tab } from 'react-bootstrap';
import { FaPlus, FaEdit, FaCode, FaFileAlt } from 'react-icons/fa';
import api from '../../utils/api';
import RichTextEditor from '../RichTextEditor/RichTextEditor';
import MarkdownEditor from '../MarkdownEditor/MarkdownEditor';
import './NotificationRegistrationModal.css';

const NotificationRegistrationModal = ({ 
    show, 
    onHide, 
    onSuccess, 
    editingNotification = null,
    currentUser = null
}) => {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('rich');
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        type: '일반',
        priority: 0,
        isGlobal: true,
        expiresAt: ''
    });


    // 편집 모드일 때 기존 데이터 로드
    React.useEffect(() => {
        if (editingNotification) {
            setFormData({
                title: editingNotification.title || '',
                content: editingNotification.content || '',
                type: editingNotification.type || '일반',
                priority: editingNotification.priority || 0,
                isGlobal: editingNotification.isGlobal !== undefined ? editingNotification.isGlobal : true,
                expiresAt: editingNotification.expiresAt ? 
                    new Date(editingNotification.expiresAt).toISOString().slice(0, 16) : ''
            });
        } else {
            // 새로 작성할 때 폼 초기화
            setFormData({
                title: '',
                content: '',
                type: '일반',
                priority: 0,
                isGlobal: true,
                expiresAt: ''
            });
        }
    }, [editingNotification, show]);

    // 폼 데이터 변경 핸들러
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // 리치 텍스트 에디터 변경 핸들러
    const handleRichTextChange = (value) => {
        setFormData(prev => ({
            ...prev,
            content: value
        }));
    };

    // 마크다운 에디터 변경 핸들러
    const handleMarkdownChange = (value) => {
        setFormData(prev => ({
            ...prev,
            content: value
        }));
    };


    // 공지사항 작성/수정 함수
    const handleSubmit = async () => {
        try {
            setLoading(true);
            
            // 필수 필드 검증
            if (!formData.title.trim()) {
                alert('제목을 입력해주세요.');
                return;
            }
            if (!formData.content.trim()) {
                alert('내용을 입력해주세요.');
                return;
            }

            const payload = {
                title: formData.title.trim(),
                content: formData.content.trim(),
                type: formData.type,
                priority: parseInt(formData.priority),
                isGlobal: formData.isGlobal
            };

            // 만료일이 있으면 추가
            if (formData.expiresAt) {
                payload.expiresAt = new Date(formData.expiresAt).toISOString();
            }

            let response;
            if (editingNotification) {
                // 수정
                response = await api.put(`/notifications/${editingNotification._id}`, payload);
            } else {
                // 생성
                response = await api.post('/notifications', payload);
            }

            if (response.data.success) {
                const message = editingNotification ? 
                    '공지사항이 성공적으로 수정되었습니다.' : 
                    '공지사항이 성공적으로 작성되었습니다.';
                alert(message);
                onSuccess();
                onHide();
            }
        } catch (err) {
            console.error('공지사항 처리 오류:', err);
            if (err.response?.status === 403) {
                alert('권한이 없습니다.');
            } else {
                const message = editingNotification ? 
                    '공지사항 수정에 실패했습니다.' : 
                    '공지사항 작성에 실패했습니다.';
                alert(message);
            }
        } finally {
            setLoading(false);
        }
    };

    // 모달 닫기
    const handleClose = () => {
        if (!loading) {
            onHide();
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="xl" fullscreen="lg-down">
            <Modal.Header closeButton>
                <Modal.Title>
                    {editingNotification ? (
                        <>
                            <FaEdit className="me-2" />
                            공지사항 수정
                        </>
                    ) : (
                        <>
                            <FaPlus className="me-2" />
                            공지사항 작성
                        </>
                    )}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4" style={{ height: 'calc(100vh - 120px)', overflowY: 'auto' }}>
                <div className="row mb-4">
                    <div className="col-md-8">
                        <label className="form-label">제목 *</label>
                        <input 
                            type="text" 
                            name="title"
                            className="form-control" 
                            placeholder="공지사항 제목을 입력하세요"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label">유형</label>
                        <select 
                            name="type"
                            className="form-select"
                            value={formData.type}
                            onChange={handleInputChange}
                            disabled={loading}
                        >
                            <option value="일반">일반</option>
                            <option value="중요">중요</option>
                            <option value="긴급">긴급</option>
                            <option value="시스템">시스템</option>
                        </select>
                    </div>
                </div>
                <div className="mb-3">
                    <label className="form-label">내용 *</label>
                    
                    <Tabs
                        activeKey={activeTab}
                        onSelect={(k) => setActiveTab(k)}
                        className="mb-3"
                    >
                        <Tab eventKey="rich" title={
                            <span>
                                <FaFileAlt className="me-1" />
                                리치 텍스트
                            </span>
                        }>
                            <RichTextEditor
                                value={formData.content}
                                onChange={handleRichTextChange}
                                placeholder="공지사항 내용을 입력하세요..."
                                height="500px"
                                readOnly={loading}
                            />
                        </Tab>
                        
                        <Tab eventKey="markdown" title={
                            <span>
                                <FaCode className="me-1" />
                                마크다운
                            </span>
                        }>
                            <MarkdownEditor
                                value={formData.content}
                                onChange={handleMarkdownChange}
                                placeholder="마크다운으로 공지사항 내용을 작성하세요..."
                                height="500px"
                            />
                        </Tab>
                        
                        <Tab eventKey="plain" title={
                            <span>
                                <FaEdit className="me-1" />
                                일반 텍스트
                            </span>
                        }>
                            <textarea 
                                name="content"
                                className="form-control" 
                                rows="20" 
                                placeholder="공지사항 내용을 입력하세요"
                                value={formData.content}
                                onChange={handleInputChange}
                                required
                                disabled={loading}
                                style={{ minHeight: '500px' }}
                            ></textarea>
                        </Tab>
                    </Tabs>
                </div>
                <div className="row mb-4">
                    <div className="col-md-3">
                        <label className="form-label">우선순위</label>
                        <select 
                            name="priority"
                            className="form-select"
                            value={formData.priority}
                            onChange={handleInputChange}
                            disabled={loading}
                        >
                            <option value="0">일반</option>
                            <option value="1">높음</option>
                            <option value="2">매우 높음</option>
                        </select>
                    </div>
                    <div className="col-md-4">
                        <label className="form-label">만료일 (선택사항)</label>
                        <input 
                            type="datetime-local" 
                            name="expiresAt"
                            className="form-control"
                            value={formData.expiresAt}
                            onChange={handleInputChange}
                            disabled={loading}
                        />
                    </div>
                    <div className="col-md-5">
                        <label className="form-label">&nbsp;</label>
                        <div className="form-check mt-2">
                            <input 
                                className="form-check-input" 
                                type="checkbox" 
                                id="isGlobal"
                                name="isGlobal"
                                checked={formData.isGlobal}
                                onChange={handleInputChange}
                                disabled={loading}
                            />
                            <label className="form-check-label" htmlFor="isGlobal">
                                전체 공지사항 (모든 사용자에게 표시)
                            </label>
                        </div>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button 
                    variant="secondary" 
                    onClick={handleClose}
                    disabled={loading}
                >
                    취소
                </Button>
                <Button 
                    variant="primary" 
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Spinner size="sm" className="me-2" />
                            {editingNotification ? '수정 중...' : '작성 중...'}
                        </>
                    ) : (
                        editingNotification ? '수정하기' : '게시하기'
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default NotificationRegistrationModal;
