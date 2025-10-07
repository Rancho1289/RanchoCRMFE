import React, { useState } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import api from '../utils/api';

const ResetPasswordPage = ({ email }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [message, setMessage] = useState('');

  // 비밀번호 강도 검증 함수
  const validatePasswordStrength = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
  };

  const handleNewPasswordChange = (e) => {
    const password = e.target.value;
    setNewPassword(password);

    if (!validatePasswordStrength(password)) {
      setPasswordError('비밀번호는 최소 8자, 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.');
    } else {
      setPasswordError('');
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();

    if (!validatePasswordStrength(newPassword)) {
      setMessage('비밀번호가 강도 기준을 충족하지 않습니다.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const response = await api.post('/user/reset-password', { email, newPassword });
      alert(response.data.message || '비밀번호가 성공적으로 변경되었습니다.');
      window.location.href = '/login'; // 로그인 페이지로 이동
    } catch (error) {
      alert('비밀번호 변경에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  return (
    <Container>
      <h1>비밀번호 재설정</h1>
      <Form onSubmit={handleResetPassword}>
        <Form.Group controlId="formNewPassword">
          <Form.Label>새 비밀번호</Form.Label>
          <Form.Control
            type="password"
            placeholder="새 비밀번호를 입력하세요"
            value={newPassword}
            onChange={handleNewPasswordChange}
            required
          />
          {passwordError && <div style={{ color: 'red', marginTop: '5px' }}>{passwordError}</div>}
          <small className="text-muted">
            비밀번호는 최소 8자, 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.
          </small>
        </Form.Group>

        <Form.Group controlId="formConfirmPassword" className="mt-3">
          <Form.Label>비밀번호 확인</Form.Label>
          <Form.Control
            type="password"
            placeholder="비밀번호를 다시 입력하세요"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </Form.Group>

        <Button type="submit" className="mt-3" disabled={!!passwordError}>
          비밀번호 재설정
        </Button>
      </Form>
      {message && <p style={{ marginTop: '10px', color: message.includes('실패') ? 'red' : 'green' }}>{message}</p>}
    </Container>
  );
};

export default ResetPasswordPage;
