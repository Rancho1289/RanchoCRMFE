import React from 'react';
import { Badge, Button } from 'react-bootstrap';
import { FaSms } from 'react-icons/fa';

const BulkSelectionBar = ({
    selectedCount,
    loading,
    onBulkSMS,
    onBulkDelete,
    onClear
}) => {
    if (selectedCount === 0) return null;

    return (
        <div className="d-flex align-items-center justify-content-between p-2 bg-light rounded">
            <div className="d-flex align-items-center">
                <Badge bg="primary" className="me-2">
                    {selectedCount}개 선택됨
                </Badge>
                <span className="text-muted">선택된 고객에 대한 작업을 수행할 수 있습니다.</span>
            </div>
            <div className="d-flex gap-2">
                <Button variant="outline-success" size="sm" onClick={onBulkSMS} disabled={loading}>
                    <FaSms className="me-1" />
                    일괄 문자 전송
                </Button>
                <Button variant="outline-danger" size="sm" onClick={onBulkDelete} disabled={loading}>
                    일괄 삭제
                </Button>
                <Button variant="outline-secondary" size="sm" onClick={onClear}>
                    선택 해제
                </Button>
            </div>
        </div>
    );
};

export default BulkSelectionBar;


