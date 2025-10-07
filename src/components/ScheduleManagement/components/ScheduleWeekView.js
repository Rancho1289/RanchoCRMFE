import React from 'react';
import { Card, Row, Col, Badge } from 'react-bootstrap';
import { FaCalendarAlt } from 'react-icons/fa';
import { getWeekSchedules, getDateRange } from '../utils/scheduleUtils';

const ScheduleWeekView = ({ selectedDate, allSchedules, onDateSelect }) => {
    // selectedDate가 없으면 현재 날짜 사용
    const safeSelectedDate = selectedDate || new Date();
    
    const weekSchedules = getWeekSchedules(safeSelectedDate, allSchedules || []);
    
    // 주간 제목을 위한 시작 날짜 계산
    const { start } = getDateRange(safeSelectedDate, 'week');
    const weekTitle = `${start.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} - ${new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}`;

    return (
        <div className="week-view">
            <h5 className="mb-3">
                <FaCalendarAlt className="me-2" />
                {weekTitle}
            </h5>
            <Row>
                {weekSchedules.map((dayData, index) => {
                    if (!dayData || !dayData.date) return null;
                    
                    return (
                        <Col md={12} lg={6} xl={4} key={index} className="mb-3">
                            <Card 
                                className={`h-100 ${dayData.date.toDateString() === safeSelectedDate.toDateString() ? 'selected-day' : ''}`}
                                onClick={() => onDateSelect(dayData.date)}
                                style={{ cursor: 'pointer' }}
                            >
                                <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                                    <h6 className="mb-0">
                                        {dayData.date.toLocaleDateString('ko-KR', { 
                                            month: 'short', 
                                            day: 'numeric',
                                            weekday: 'short'
                                        })}
                                    </h6>
                                    {dayData.schedules && dayData.schedules.length > 0 && (
                                        <Badge bg="primary" className="schedule-count">
                                            {dayData.schedules.length}
                                        </Badge>
                                    )}
                                </Card.Header>
                                <Card.Body className="p-3 text-center">
                                    {!dayData.schedules || dayData.schedules.length === 0 ? (
                                        <small className="text-muted">일정 없음</small>
                                    ) : (
                                        <div className="text-muted">
                                            <small>{dayData.schedules.length}개의 일정</small>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    );
                })}
            </Row>
        </div>
    );
};

export default ScheduleWeekView;
