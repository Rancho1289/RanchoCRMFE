import React from 'react';
import { Card, Row, Col, Badge, Button } from 'react-bootstrap';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { getDaysInMonth, getSchedulesForDate, formatDate } from '../utils/scheduleUtils';
import { getTypeBadge, getStatusBadge, getPriorityBadge } from '../utils/badgeUtils';

const ScheduleCalendar = ({ 
    currentMonth, 
    onMonthChange, 
    selectedDate, 
    onDateSelect, 
    allSchedules 
}) => {
    const days = getDaysInMonth(currentMonth);

    return (
        <div className="month-view">
            <Row className="mb-3">
                <Col md={6}>
                    <div className="d-flex align-items-center">
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => onMonthChange(-1)}
                            className="me-2"
                        >
                            <FaChevronLeft />
                        </Button>
                        <h5 className="mb-0 me-3">{formatDate(currentMonth)}</h5>
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => onMonthChange(1)}
                        >
                            <FaChevronRight />
                        </Button>
                    </div>
                </Col>
            </Row>

            <div className="calendar-grid">
                <div className="calendar-header">
                    {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                        <div key={day} className="calendar-day-header">{day}</div>
                    ))}
                </div>
                <div className="calendar-body">
                    {days.map((day, index) => (
                        <div 
                            key={index} 
                            className={`calendar-day ${day ? 'has-date' : ''} ${
                                day && day.toDateString() === selectedDate.toDateString() ? 'selected' : ''
                            }`}
                            onClick={() => day && onDateSelect(day)}
                        >
                            {day && (
                                <>
                                    <span className="date-number">{day.getDate()}</span>
                                    {getSchedulesForDate(day, allSchedules).length > 0 && (
                                        <div className="schedule-indicator">
                                            <Badge bg="primary" className="schedule-count">
                                                {getSchedulesForDate(day, allSchedules).length}
                                            </Badge>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ScheduleCalendar;

