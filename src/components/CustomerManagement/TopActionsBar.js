import React from 'react';
import { Row, Col, Button, Form } from 'react-bootstrap';
import { FaPlus, FaFileCsv, FaDownload } from 'react-icons/fa';
// Embedded styles will be injected via <style> tag below

const TopActionsBar = ({
    loading,
    onCreate,
    onDownloadTemplate,
    onOpenTemplateUpload,
    onOpenCSVUpload,
    itemsPerPage,
    onItemsPerPageChange,
    totalItems,
    currentPage
}) => {
    const embeddedStyles = `
        .top-actions-row { row-gap: 0.5rem; }
        .top-actions-btn { 
            transition: all 0.3s ease; 
            border-radius: 12px;
            border: none;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .top-actions-btn:hover { 
            transform: translateY(-2px); 
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        .top-actions-btn:active { 
            transform: translateY(0); 
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .top-actions-stats { 
            border-radius: 12px; 
            background: #ffb3ba; 
            padding: 8px; 
            border: 1px solid #ff9aa2;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: flex-start;
        }
        
        /* 파스텔 톤 버튼 색상 (단색) */
        .btn-custom-primary { 
            background-color: #a8e6cf; 
            border-color: #a8e6cf; 
            color: #2d5a3d;
            font-weight: 500;
        }
        .btn-custom-primary:hover { 
            background-color: #88d8a3; 
            border-color: #88d8a3; 
            color: #1e3a2a;
        }
        .btn-custom-info { 
            background-color: #b8e6ff; 
            border-color: #b8e6ff; 
            color: #1e4a5c;
            font-weight: 500;
        }
        .btn-custom-info:hover { 
            background-color: #87ceeb; 
            border-color: #87ceeb; 
            color: #0f2a3a;
        }
        .btn-custom-warning { 
            background-color: #ffeaa7; 
            border-color: #ffeaa7; 
            color: #6c5a2a;
            font-weight: 500;
        }
        .btn-custom-warning:hover { 
            background-color: #fdcb6e; 
            border-color: #fdcb6e; 
            color: #4a3a1a;
        }
        .btn-custom-secondary { 
            background-color: #d1d8e0; 
            border-color: #d1d8e0; 
            color: #2c3e50;
            font-weight: 500;
        }
        .btn-custom-secondary:hover { 
            background-color: #a4b0be; 
            border-color: #a4b0be; 
            color: #1a252f;
        }
        
        @media (max-width: 576px) { .top-items-select { min-width: 100px; } }
    `;

    return (
        <Row className="mb-3 top-actions-row">
            <style>{embeddedStyles}</style>
            <Col xs={6} md={2} className="mb-2 mb-md-0">
                <div style={{ padding: '10px' }}>
                    <Button
                        variant="primary"
                        onClick={onCreate}
                        className="w-100 top-actions-btn btn-custom-primary"
                        disabled={loading}
                    >
                        <FaPlus className="me-2" />
                        <span className="d-none d-sm-inline">고객 등록</span>
                        <span className="d-sm-none">등록</span>
                    </Button>
                </div>
            </Col>
            <Col xs={6} md={2} className="mb-2 mb-md-0">
                <div style={{ padding: '10px' }}>
                    <Button variant="info" onClick={onDownloadTemplate} className="w-100 top-actions-btn btn-custom-info" disabled={loading}>
                        <FaDownload className="me-2" />
                        <span className="d-none d-sm-inline">양식 다운로드</span>
                        <span className="d-sm-none">양식</span>
                    </Button>
                </div>
            </Col>
            <Col xs={6} md={2} className="mb-2 mb-md-0">
                <div style={{ padding: '10px' }}>
                    <Button variant="warning" onClick={onOpenTemplateUpload} className="w-100 top-actions-btn btn-custom-warning" disabled={loading}>
                        <FaFileCsv className="me-2" />
                        <span>양식 업로드</span>
                    </Button>
                </div>
            </Col>
            <Col xs={6} md={2} className="mb-2 mb-md-0">
                <div style={{ padding: '10px' }}>
                    <Button variant="secondary" onClick={onOpenCSVUpload} className="w-100 top-actions-btn btn-custom-secondary" disabled={loading}>
                        <FaFileCsv className="me-2" />
                        <span>구글 주소록</span>
                    </Button>
                </div>
            </Col>
            <Col xs={12} md={4} className="mb-2 mb-md-0">
                <div style={{ padding: '10px' }}>
                    <div className="d-flex align-items-center gap-3 flex-wrap top-actions-stats">
                        <div className="d-flex align-items-center" style={{ height: '100%' }}>
                            <label className="form-label me-2 mb-0 d-flex align-items-center" style={{ height: '100%', fontSize: '14px', fontWeight: '500' }}>페이지당 항목 수</label>
                            <Form.Select
                                value={itemsPerPage}
                                onChange={(e) => onItemsPerPageChange(e.target.value)}
                                size="sm"
                                style={{ width: 'auto' }}
                                className="top-items-select"
                                disabled={loading}
                            >
                                <option value="10">10개</option>
                                <option value="15">15개</option>
                                <option value="25">25개</option>
                                <option value="50">50개</option>
                                <option value="100">100개</option>
                                <option value="all">전체 보기</option>
                            </Form.Select>
                        </div>

                    </div>
                </div>
            </Col>
        </Row>
    );
};

export default TopActionsBar;


