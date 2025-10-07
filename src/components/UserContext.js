import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const UserContext = createContext();

const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const getUser = async () => {
        setIsLoading(true);
        try {
            const storedToken = sessionStorage.getItem('token');
            
            if (storedToken) {
                api.defaults.headers['Authorization'] = `Bearer ${storedToken}`;
                
                const response = await api.get("/user/me");
                
                if (response.status === 200 && response.data.user) {
                    setUser(response.data.user);
                } else {
                    setUser(null);
                    sessionStorage.removeItem('token');
                }
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('❌ 사용자 정보 조회 오류:', error);
            setUser(null);
            
            // 토큰이 유효하지 않은 경우 제거
            if (error.response?.status === 401) {
                sessionStorage.removeItem('token');
                api.defaults.headers['Authorization'] = '';
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getUser();
    }, []);

    const logout = async () => {
        try {
            // 서버에 로그아웃 요청
            await api.post('/user/logout');
        } catch (error) {
            console.error('로그아웃 요청 오류:', error);
        } finally {
            // 클라이언트 측 정리
            sessionStorage.removeItem('token');
            setUser(null);
            api.defaults.headers['Authorization'] = '';
        }
    };

    const updateUser = (userData) => {
        setUser(userData);
    };

    return (
        <UserContext.Provider value={{ 
            user, 
            setUser: updateUser, 
            isLoading, 
            logout, 
            getUser 
        }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserProvider;