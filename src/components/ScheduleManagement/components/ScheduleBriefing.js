import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Alert, Spinner, Badge, Modal } from 'react-bootstrap';
import { FaRobot, FaCalendarWeek, FaCalendarDay, FaComments, FaChartLine, FaCopy, FaCheck } from 'react-icons/fa';
import api from '../../../utils/api';

const ScheduleBriefing = ({ user }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [briefingData, setBriefingData] = useState(null);
    const [activeTab, setActiveTab] = useState('weekly');
    const [copiedText, setCopiedText] = useState('');

    // 금주 브리핑 생성
    const generateWeeklyBriefing = async () => {
        try {
            setLoading(true);
            setError('');
            
            const response = await api.get('/schedule-briefing/weekly-briefing', {
                timeout: 180000 // 3분 타임아웃
            });
            
            if (response.data.success) {
                setBriefingData({
                    type: 'weekly',
                    data: response.data.data
                });
            } else {
                setError('브리핑 생성에 실패했습니다.');
            }
        } catch (error) {
            console.error('금주 브리핑 생성 오류:', error);
            if (error.code === 'ECONNABORTED') {
                setError('요청 시간이 초과되었습니다. 다시 시도해주세요.');
            } else {
                setError('브리핑 생성 중 오류가 발생했습니다.');
            }
        } finally {
            setLoading(false);
        }
    };

    // 일일 브리핑 생성
    const generateDailyBriefing = async () => {
        try {
            setLoading(true);
            setError('');
            
            const response = await api.get('/schedule-briefing/daily-briefing', {
                timeout: 180000 // 3분 타임아웃
            });
            
            if (response.data.success) {
                setBriefingData({
                    type: 'daily',
                    data: response.data.data
                });
            } else {
                setError('브리핑 생성에 실패했습니다.');
            }
        } catch (error) {
            console.error('일일 브리핑 생성 오류:', error);
            if (error.code === 'ECONNABORTED') {
                setError('요청 시간이 초과되었습니다. 다시 시도해주세요.');
            } else {
                setError('브리핑 생성 중 오류가 발생했습니다.');
            }
        } finally {
            setLoading(false);
        }
    };

    // 일정 분석 생성
    const generateAnalysis = async () => {
        try {
            setLoading(true);
            setError('');
            
            const response = await api.get('/schedule-briefing/analysis', {
                timeout: 180000 // 3분 타임아웃
            });
            
            if (response.data.success) {
                setBriefingData({
                    type: 'analysis',
                    data: response.data.data
                });
            } else {
                setError('분석 생성에 실패했습니다.');
            }
        } catch (error) {
            console.error('일정 분석 생성 오류:', error);
            if (error.code === 'ECONNABORTED') {
                setError('요청 시간이 초과되었습니다. 다시 시도해주세요.');
            } else {
                setError('분석 생성 중 오류가 발생했습니다.');
            }
        } finally {
            setLoading(false);
        }
    };

    // 텍스트 복사 기능
    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedText(text.substring(0, 50) + '...');
            setTimeout(() => setCopiedText(''), 2000);
        } catch (error) {
            console.error('복사 실패:', error);
        }
    };

    // 탭 변경 핸들러
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setBriefingData(null);
        setError('');
    };

    // 브리핑 생성 핸들러
    const handleGenerateBriefing = () => {
        switch (activeTab) {
            case 'weekly':
                generateWeeklyBriefing();
                break;
            case 'daily':
                generateDailyBriefing();
                break;
            case 'analysis':
                generateAnalysis();
                break;
            default:
                break;
        }
    };

    return (
        <Card className="shadow-sm">
            <Card.Header className="bg-gradient text-white" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <Row className="align-items-center">
                    <Col md={6}>
                        <h4 className="mb-0">
                            <FaRobot className="me-2" />
                            AI 스케줄 브리핑
                        </h4>
                    </Col>
                    <Col md={6} className="text-end">
                        <Badge bg="light" text="dark" className="me-2">
                            GEMINI AI
                        </Badge>
                    </Col>
                </Row>
            </Card.Header>
            
            <Card.Body>
                {error && (
                    <Alert variant="danger" onClose={() => setError('')} dismissible>
                        {error}
                    </Alert>
                )}

                {/* 탭 네비게이션 */}
                <div className="mb-4">
                    <div className="nav nav-pills nav-fill" role="tablist">
                        <button
                            className={`nav-link ${activeTab === 'weekly' ? 'active' : ''}`}
                            onClick={() => handleTabChange('weekly')}
                        >
                            <FaCalendarWeek className="me-2" />
                            금주 브리핑
                        </button>
                        <button
                            className={`nav-link ${activeTab === 'daily' ? 'active' : ''}`}
                            onClick={() => handleTabChange('daily')}
                        >
                            <FaCalendarDay className="me-2" />
                            오늘 브리핑
                        </button>
                        <button
                            className={`nav-link ${activeTab === 'analysis' ? 'active' : ''}`}
                            onClick={() => handleTabChange('analysis')}
                        >
                            <FaChartLine className="me-2" />
                            일정 분석
                        </button>
                    </div>
                </div>

                {/* 브리핑 생성 버튼 */}
                <div className="text-center mb-4">
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={handleGenerateBriefing}
                        disabled={loading}
                        className="px-4"
                    >
                        {loading ? (
                            <>
                                <Spinner size="sm" className="me-2" />
                                AI가 분석 중입니다...
                            </>
                        ) : (
                            <>
                                <FaRobot className="me-2" />
                                {activeTab === 'weekly' && '금주 브리핑 생성'}
                                {activeTab === 'daily' && '오늘 브리핑 생성'}
                                {activeTab === 'analysis' && '일정 분석 생성'}
                            </>
                        )}
                    </Button>
                </div>

                {/* 브리핑 결과 */}
                {briefingData && (
                    <Card className="border-0 bg-light">
                        <Card.Header className="bg-white border-bottom">
                            <Row className="align-items-center">
                                <Col>
                                    <h5 className="mb-0">
                                        {briefingData.type === 'weekly' && '📅 금주 업무 브리핑'}
                                        {briefingData.type === 'daily' && '🌅 오늘의 업무 브리핑'}
                                        {briefingData.type === 'analysis' && '📊 일정 분석 보고서'}
                                    </h5>
                                </Col>
                                <Col className="text-end">
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={() => copyToClipboard(briefingData.data.briefing || briefingData.data.analysis)}
                                    >
                                        {copiedText ? (
                                            <>
                                                <FaCheck className="me-1" />
                                                복사됨
                                            </>
                                        ) : (
                                            <>
                                                <FaCopy className="me-1" />
                                                복사
                                            </>
                                        )}
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Header>
                        <Card.Body>
                            <div 
                                className="briefing-content"
                                style={{ 
                                    whiteSpace: 'pre-wrap',
                                    lineHeight: '1.6',
                                    fontSize: '14px'
                                }}
                            >
                                {briefingData.data.briefing || briefingData.data.analysis}
                            </div>
                        </Card.Body>
                    </Card>
                )}

                {/* 일정 목록 (브리핑이 생성된 경우) */}
                {briefingData && briefingData.data.schedules && briefingData.data.schedules.length > 0 && (
                    <Card className="mt-3">
                        <Card.Header>
                            <h6 className="mb-0">
                                📋 관련 일정 ({briefingData.data.schedules.length}개)
                            </h6>
                        </Card.Header>
                        <Card.Body>
                            <div className="row">
                                {briefingData.data.schedules.map((schedule, index) => (
                                    <div key={schedule._id} className="col-md-6 mb-3">
                                        <Card className="h-100">
                                            <Card.Body className="p-3">
                                                <h6 className="card-title text-primary mb-2">
                                                    {schedule.title}
                                                </h6>
                                                <div className="small text-muted mb-2">
                                                    <div><strong>날짜:</strong> {new Date(schedule.date).toLocaleDateString('ko-KR')}</div>
                                                    <div><strong>시간:</strong> {schedule.time}</div>
                                                    <div><strong>장소:</strong> {schedule.location}</div>
                                                    <div><strong>유형:</strong> {schedule.type}</div>
                                                    <div><strong>우선순위:</strong> 
                                                        <Badge 
                                                            bg={schedule.priority === '높음' ? 'danger' : schedule.priority === '보통' ? 'warning' : 'secondary'}
                                                            className="ms-1"
                                                        >
                                                            {schedule.priority}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                {schedule.description && (
                                                    <p className="card-text small">{schedule.description}</p>
                                                )}
                                                {schedule.relatedCustomers && schedule.relatedCustomers.length > 0 && (
                                                    <div className="small">
                                                        <strong>관련 고객:</strong>
                                                        {schedule.relatedCustomers.map((customer, idx) => (
                                                            <span key={idx} className="badge bg-info me-1">
                                                                {customer.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </Card.Body>
                                        </Card>
                                    </div>
                                ))}
                            </div>
                        </Card.Body>
                    </Card>
                )}
            </Card.Body>

            <style>{`
                .nav-pills .nav-link {
                    color: #6c757d;
                    border: 1px solid #dee2e6;
                    margin-right: 5px;
                }
                .nav-pills .nav-link.active {
                    background-color: #667eea;
                    border-color: #667eea;
                    color: white;
                }
                .nav-pills .nav-link:hover {
                    background-color: #f8f9fa;
                }
                .briefing-content {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                .briefing-content h1, .briefing-content h2, .briefing-content h3 {
                    color: #495057;
                    margin-top: 1.5rem;
                    margin-bottom: 1rem;
                }
                .briefing-content ul, .briefing-content ol {
                    padding-left: 1.5rem;
                }
                .briefing-content li {
                    margin-bottom: 0.5rem;
                }
            `}</style>
        </Card>
    );
};

export default ScheduleBriefing;
