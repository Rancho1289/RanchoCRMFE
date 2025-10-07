import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const useAuthRedirect = (user, allowGuest = false) => {
    const navigate = useNavigate();

    useEffect(() => {
        // 로그인하지 않았고, 게스트 접근이 허용되지 않은 경우 로그인 페이지로 이동
        if (!user && !allowGuest) {
            navigate('/login');
        }
    }, [user, navigate, allowGuest]);

    // 로그인했거나 게스트 접근이 허용된 경우 true 반환
    return !!user || allowGuest;
};

export default useAuthRedirect;
