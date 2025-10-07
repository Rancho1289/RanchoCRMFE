// ForgotPasswordPage.js
import React, { useState } from 'react';
import { Form, Button, Container, Spinner } from 'react-bootstrap'; // Spinner 추가
import api from '../utils/api';
import ResetPasswordPage from './ResetPasswordPage';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [message, setMessage] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가

  // 인증 코드 전송
  const handleSendCode = async (event) => {
    event.preventDefault();
    setIsLoading(true); // 로딩 시작
    try {
      const response = await api.post('/nodemailer/send-verification-code', { email });
      if (response.status === 200) {
        setMessage('인증 코드를 이메일로 전송했습니다.');
        setIsCodeSent(true);
      }
    } catch (error) {
      setMessage('이메일 전송에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setIsLoading(false); // 로딩 종료
    }
  };

  // 인증 코드 확인
  const handleVerifyCode = async () => {
    try {
      const response = await api.post('/nodemailer/verify-code', { email, code: verificationCode });
      if (response.status === 200) {
        setMessage('인증이 완료되었습니다. 새로운 비밀번호를 설정할 수 있습니다.');
        setIsVerified(true);
      } else {
        setMessage('인증 코드가 올바르지 않습니다.');
      }
    } catch (error) {
      setMessage('인증 코드 확인에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  if (isVerified) {
    // 인증 완료 후 비밀번호 재설정 페이지로 이동
    return <ResetPasswordPage email={email} />;
  }

  return (
    <Container>
      <h1>비밀번호 찾기</h1>
      <Form onSubmit={handleSendCode}>
        <Form.Group controlId="formEmail">
          <Form.Label>이메일 주소</Form.Label>
          <Form.Control
            type="email"
            placeholder="이메일을 입력하세요"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ marginTop: '10px' }}
          />
        </Form.Group>
        <Button type="submit" disabled={isCodeSent || isLoading} style={{ marginTop: '15px' }}>
          인증 코드 전송
        </Button>
      </Form>

      {isLoading && (
        <div className="d-flex justify-content-center mt-3">
          <Spinner animation="border" role="status" style={{ width: '100px', height: '100px' }} variant="info">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}

      {isCodeSent && !isLoading && (
        <Form className="mt-3">
          <Form.Group controlId="formVerificationCode">
            <Form.Label>인증 코드</Form.Label>
            <Form.Control
              type="text"
              placeholder="이메일로 받은 인증 코드를 입력하세요"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
            />
          </Form.Group>
          <Button onClick={handleVerifyCode} style={{ marginTop: '15px' }} > 인증 코드 확인</Button>
        </Form>
      )
      }

      {message && <p style={{ marginTop: '15px' }} >{message}</p>}
    </Container >
  );
};

export default ForgotPasswordPage;
