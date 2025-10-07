import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GoogleCallbackPage = () => {
  const location = useLocation();

  useEffect(() => {
    // URL에서 authorization code 추출
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      // 에러가 있는 경우
      window.opener?.postMessage({
        type: 'GOOGLE_LOGIN_ERROR',
        error: error
      }, window.location.origin);
      window.close();
      return;
    }

    if (code) {
      // 성공적으로 코드를 받은 경우
      window.opener?.postMessage({
        type: 'GOOGLE_LOGIN_SUCCESS',
        code: code
      }, window.location.origin);
      window.close();
    } else {
      // 코드가 없는 경우
      window.opener?.postMessage({
        type: 'GOOGLE_LOGIN_ERROR',
        error: 'No authorization code received'
      }, window.location.origin);
      window.close();
    }
  }, [location]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h2>Google 로그인 처리 중...</h2>
        <p>잠시만 기다려주세요.</p>
      </div>
    </div>
  );
};

export default GoogleCallbackPage;
