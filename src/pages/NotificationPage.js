import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import NotificationList from '../components/Notification/Notification.js';

const NotificationPage = ({ user }) => {
    return (
        <Container  className="py-4">
            <Row>
                <Col>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="mb-0">공지사항</h2>
                    </div>
                    <NotificationList user={user} />
                </Col>
            </Row>
        </Container>
    );
};

export default NotificationPage;

