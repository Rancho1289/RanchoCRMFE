import React from 'react';
import { Button } from 'react-bootstrap';

const ScheduleViewControls = ({ viewMode, onViewModeChange }) => {
    return (
        <div className="btn-group" role="group">
            <Button
                variant={viewMode === 'month' ? 'light' : 'outline-light'}
                size="sm"
                onClick={() => onViewModeChange('month')}
            >
                월간
            </Button>
            <Button
                variant={viewMode === 'week' ? 'light' : 'outline-light'}
                size="sm"
                onClick={() => onViewModeChange('week')}
            >
                주간
            </Button>
            <Button
                variant={viewMode === 'day' ? 'light' : 'outline-light'}
                size="sm"
                onClick={() => onViewModeChange('day')}
            >
                일간
            </Button>
        </div>
    );
};

export default ScheduleViewControls;

