import React, { useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { Button, Row, Col, Card } from 'react-bootstrap';
import { FaEye, FaEdit, FaCode } from 'react-icons/fa';
import './MarkdownEditor.css';

const MarkdownEditor = ({ 
    value, 
    onChange, 
    placeholder = "마크다운으로 내용을 작성하세요...",
    height = "400px"
}) => {
    const [viewMode, setViewMode] = useState('edit'); // 'edit', 'preview', 'split'

    const handleChange = (val) => {
        onChange(val || '');
    };

    const toggleViewMode = () => {
        switch (viewMode) {
            case 'edit':
                setViewMode('preview');
                break;
            case 'preview':
                setViewMode('split');
                break;
            case 'split':
                setViewMode('edit');
                break;
            default:
                setViewMode('edit');
        }
    };

    const getViewModeIcon = () => {
        switch (viewMode) {
            case 'edit':
                return <FaEdit />;
            case 'preview':
                return <FaEye />;
            case 'split':
                return <FaCode />;
            default:
                return <FaEdit />;
        }
    };

    const getViewModeText = () => {
        switch (viewMode) {
            case 'edit':
                return '편집 모드';
            case 'preview':
                return '미리보기 모드';
            case 'split':
                return '분할 모드';
            default:
                return '편집 모드';
        }
    };

    return (
        <div className="markdown-editor">
            <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0">마크다운 에디터</h6>
                <Button 
                    size="sm" 
                    variant="outline-primary" 
                    onClick={toggleViewMode}
                >
                    {getViewModeIcon()} {getViewModeText()}
                </Button>
            </div>
            
            <Card>
                <Card.Body className="p-0">
                    <div style={{ height: height }}>
                        {viewMode === 'edit' && (
                            <MDEditor
                                value={value}
                                onChange={handleChange}
                                height={height}
                                data-color-mode="light"
                                placeholder={placeholder}
                            />
                        )}
                        {viewMode === 'preview' && (
                            <div className="p-3">
                                <MDEditor.Markdown 
                                    source={value} 
                                    style={{ 
                                        whiteSpace: 'pre-wrap',
                                        height: '100%',
                                        overflow: 'auto'
                                    }}
                                />
                            </div>
                        )}
                        {viewMode === 'split' && (
                            <Row className="h-100 m-0">
                                <Col md={6} className="p-0 border-end">
                                    <div className="p-2 bg-light border-bottom">
                                        <small className="text-muted">편집</small>
                                    </div>
                                    <MDEditor
                                        value={value}
                                        onChange={handleChange}
                                        height={`calc(${height} - 40px)`}
                                        data-color-mode="light"
                                        placeholder={placeholder}
                                        hideToolbar={false}
                                    />
                                </Col>
                                <Col md={6} className="p-0">
                                    <div className="p-2 bg-light border-bottom">
                                        <small className="text-muted">미리보기</small>
                                    </div>
                                    <div className="p-3" style={{ 
                                        height: `calc(${height} - 40px)`,
                                        overflow: 'auto'
                                    }}>
                                        <MDEditor.Markdown 
                                            source={value} 
                                            style={{ whiteSpace: 'pre-wrap' }}
                                        />
                                    </div>
                                </Col>
                            </Row>
                        )}
                    </div>
                </Card.Body>
            </Card>
            
            <div className="mt-2">
                <small className="text-muted">
                    <strong>마크다운 문법 도움말:</strong><br/>
                    • **굵은 글씨** • *기울임* • # 제목 • - 목록 • 1. 번호 목록<br/>
                    • [링크](URL) • ![이미지](URL) • `코드` • ```코드 블록```<br/>
                    • | 테이블 | 헤더 | • > 인용문 • --- 구분선
                </small>
            </div>
        </div>
    );
};

export default MarkdownEditor;
