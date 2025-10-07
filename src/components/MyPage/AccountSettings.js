import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../UserContext';
import api from '../../utils/api';
import CompanySearchModal from './CompanySearchModal';

const AccountSettings = () => {
    const { user, getUser, isLoading } = useContext(UserContext);
    const isAuthenticated = user;

    // OAuth 사용자 여부 확인
    const isOAuthUser = (user && user.isSocialAccount) ||
        (user && user.googleId) ||
        (user && user.socialProvider === 'google');

    // OAuth 설정 모드인지 확인 (URL 파라미터)
    const isOAuthSetup = new URLSearchParams(window.location.search).get('setup') === 'oauth';

    // OAuth 사용자의 추가 정보 입력 필요 여부 확인
    const needsAdditionalInfo = isOAuthUser && (
        !user.companyName ||
        !user.businessNumber ||
        !user.businessAddress ||
        !user.contactNumber ||
        !user.gender
    );

    const [formData, setFormData] = useState({
        name: (user && user.name) || '',
        email: (user && user.email) || '',
        password: '',
        secPassword: '',
        companyName: (user && user.companyName) || '',
        businessNumber: (user && user.businessNumber) || '',
        businessAddress: (user && user.businessAddress) || '',
        detailedAddress: (user && user.detailedAddress) || '',
        birthDate: (user && user.birthDate) || '',
        gender: (user && user.gender) || '',
        position: (user && user.position) || ''
    });

    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const [deleteMessage, setDeleteMessage] = useState('');
    const [deletePassword, setDeletePassword] = useState('');

    // 회사 관리 관련 상태 (현재 사용하지 않음 - 모달에서 처리)
    // const [companies, setCompanies] = useState([]);
    // const [loadingCompanies, setLoadingCompanies] = useState(false);
    // const [selectedCompanyId, setSelectedCompanyId] = useState('');
    // const [showCompanyList, setShowCompanyList] = useState(false);

    // 회사 찾기 모달 관련 상태
    const [showCompanySearchModal, setShowCompanySearchModal] = useState(false);

    // 정보 업데이트 확인 모달 상태
    const [showUpdateConfirmModal, setShowUpdateConfirmModal] = useState(false);
    const [updateConfirmData, setUpdateConfirmData] = useState(null);

    // 모달에서 회사 선택 시 호출되는 함수
    const handleCompanySelect = async (company) => {
        try {
            const updateData = {
                companyName: company.companyName,
                businessNumber: company.businessNumber,
                businessAddress: company.address,
                detailedAddress: company.detailedAddress
            };

            await api.put('/user/update', updateData);
            
            // 선택된 회사 정보를 formData에 즉시 반영
            setFormData(prev => ({
                ...prev,
                companyName: company.companyName,
                businessNumber: company.businessNumber,
                businessAddress: company.address,
                detailedAddress: company.detailedAddress || ''
            }));
            
            setMessage('소속 회사가 선택되었습니다.');
 
            // 사용자 정보 새로고침
            getUser();
        } catch (error) {
            console.error('회사 선택 실패:', error);
            setError('회사 선택에 실패했습니다.');
        }
    };

    // 회사 검색 함수 (현재 사용하지 않음 - 모달에서 처리)
    // const searchCompanies = async (query, type) => {
    //     try {
    //         setSearchLoading(true);
    //         const response = await api.get(`/company/search?q=${encodeURIComponent(query)}&type=${type}`);
    //         if (response.data.success) {
    //             setSearchResults(response.data.data || []);
    //         }
    //     } catch (error) {
    //         console.error('회사 검색 실패:', error);
    //         setSearchResults([]);
    //     } finally {
    //         setSearchLoading(false);
    //     }
    // };

    // 스타일 객체들
    const styles = {
        container: {
            minHeight: '100vh',
            background: '#f8fafc',
            padding: '20px',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        },
        wrapper: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '20px'
        },
        header: {
            textAlign: 'center',
            marginBottom: '40px',
            color: '#1e293b'
        },
        title: {
            fontSize: '2.5rem',
            fontWeight: '800',
            marginBottom: '12px',
            background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
        },
        subtitle: {
            fontSize: '1.1rem',
            color: '#64748b',
            fontWeight: '400'
        },
        formCard: {
            background: 'white',
            borderRadius: '24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            overflow: 'hidden',
            border: '1px solid #e2e8f0'
        },
        form: {
            padding: '48px'
        },
        formGrid: {
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            marginBottom: '40px',
            maxWidth: '600px',
            margin: '0 auto'
        },
        formColumn: {
            display: 'flex',
            flexDirection: 'column',
            gap: '28px'
        },
        formGroup: {
            display: 'flex',
            flexDirection: 'column'
        },
        label: {
            fontSize: '0.9rem',
            fontWeight: '600',
            color: '#334155',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            letterSpacing: '0.025em'
        },
        requiredMark: {
            color: '#ef4444',
            marginLeft: '6px',
            fontSize: '0.8rem',
            fontWeight: '500'
        },
        input: {
            padding: '16px',
            border: '2px solid #e2e8f0',
            borderRadius: '16px',
            fontSize: '1rem',
            transition: 'all 0.2s ease',
            outline: 'none',
            backgroundColor: 'white',
            color: '#1e293b',
            fontWeight: '500'
        },
        inputDisabled: {
            backgroundColor: '#f8fafc',
            color: '#64748b',
            cursor: 'not-allowed',
            borderColor: '#cbd5e1'
        },
        addressInputGroup: {
            display: 'flex',
            gap: '12px',
            alignItems: 'stretch'
        },
        addressInput: {
            flex: '1'
        },
        addressSearchBtn: {
            padding: '16px 24px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            whiteSpace: 'nowrap',
            fontSize: '0.95rem'
        },
        searchIcon: {
            width: '20px',
            height: '20px'
        },
        formActions: {
            display: 'flex',
            gap: '24px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginTop: '20px'
        },
        btn: {
            padding: '16px 32px',
            border: 'none',
            borderRadius: '16px',
            fontWeight: '600',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textDecoration: 'none',
            justifyContent: 'center',
            minWidth: '180px',
            letterSpacing: '0.025em'
        },
        btnPrimary: {
            backgroundColor: '#3b82f6',
            color: 'white',
            boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.25)'
        },
        btnDanger: {
            backgroundColor: '#ef4444',
            color: 'white',
            boxShadow: '0 4px 14px 0 rgba(239, 68, 68, 0.25)'
        },
        btnSecondary: {
            backgroundColor: '#64748b',
            color: 'white'
        },
        btnIcon: {
            width: '20px',
            height: '20px'
        },
        message: {
            padding: '16px 20px',
            borderRadius: '16px',
            marginTop: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            fontSize: '0.95rem',
            fontWeight: '500'
        },
        messageError: {
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626'
        },
        messageSuccess: {
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#16a34a'
        },
        messageIcon: {
            width: '20px',
            height: '20px',
            flexShrink: '0'
        },
        messageText: {
            flex: '1'
        },
        modalOverlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 1000,
            backdropFilter: 'blur(8px)'
        },
        modalContent: {
            background: 'white',
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            border: '1px solid #e2e8f0'
        },
        modalHeader: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '28px 32px 24px',
            borderBottom: '1px solid #e2e8f0'
        },
        modalTitle: {
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#1e293b',
            margin: 0
        },
        modalCloseBtn: {
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#94a3b8',
            padding: '8px',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
        },
        closeIcon: {
            width: '24px',
            height: '24px'
        },
        modalBody: {
            padding: '24px 32px'
        },
        warningBox: {
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
        },
        warningIcon: {
            width: '20px',
            height: '20px',
            color: '#ef4444',
            flexShrink: '0'
        },
        warningText: {
            color: '#dc2626',
            fontSize: '0.9rem',
            fontWeight: '500'
        },
        modalFooter: {
            display: 'flex',
            gap: '16px',
            padding: '24px 32px 28px',
            borderTop: '1px solid #e2e8f0'
        }
    };

    // 호버 효과를 위한 상태
    const [hoveredBtn, setHoveredBtn] = useState(null);

    // 사업자 번호 포맷팅 함수
    const formatBusinessNumber = (businessNumber) => {
        if (!businessNumber) return '';

        // 하이픈 제거 후 숫자만 추출
        const numbersOnly = businessNumber.replace(/[^0-9]/g, '');

        // 10자리인 경우에만 포맷팅
        if (numbersOnly.length === 10) {
            return numbersOnly.slice(0, 3) + '-' + numbersOnly.slice(3, 5) + '-' + numbersOnly.slice(5);
        }

        return businessNumber; // 원본 반환
    };

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                password: '',
                secPassword: '',
                companyName: user.companyName || '',
                businessNumber: formatBusinessNumber(user.businessNumber) || '',
                businessAddress: user.businessAddress || '',
                detailedAddress: user.detailedAddress || '',
                birthDate: user.birthDate || '',
                gender: user.gender || '',
                position: user.position || ''
            });

            // 회사 목록은 모달에서 처리하므로 여기서는 가져오지 않음
        }
    }, [user, isLoading]);

    // 회사 목록이 변경될 때 선택된 회사 설정 (현재 사용하지 않음 - 모달에서 처리)
    // useEffect(() => {
    //     if (companies.length > 0 && user && user.companyName && user.businessNumber) {
    //         const matchingCompany = companies.find(c => 
    //             c.companyName === user.companyName && 
    //             c.businessNumber === user.businessNumber
    //         );
    //         if (matchingCompany) {
    //             setSelectedCompanyId(matchingCompany._id);
    //         }
    //     }
    // }, [companies, user]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // 사업자 번호 특별 처리
        if (name === 'businessNumber') {
            // 하이픈을 포함한 입력 허용 (편집을 위해)
            setFormData({
                ...formData,
                [name]: value
            });
        } else {
            // 다른 필드는 기존 방식대로 처리
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const openAddressSearch = () => {
        new window.daum.Postcode({
            oncomplete: function (data) {
                setFormData({
                    ...formData,
                    businessAddress: data.address
                });
            }
        }).open();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // OAuth 사용자가 아닌 경우에만 비밀번호 검증
        if (!isOAuthUser && formData.password && formData.password !== formData.secPassword) {
            setError("Passwords do not match. Please try again.");
            return;
        }

        const { password, secPassword, ...updateData } = formData;

        // 사업자 번호는 하이픈 포함해서 그대로 전송
        // 백엔드에서 하이픈을 제거하지 않도록 수정됨

        // 생년월일 형식 변환 (Date 객체를 ISO 문자열로)
        if (updateData.birthDate && updateData.birthDate instanceof Date) {
            updateData.birthDate = updateData.birthDate.toISOString().split('T')[0];
        }

        // 사업자 번호 변경 여부 확인 (하이픈 제거 후 비교)
        const isBusinessNumberChanged = user && user.businessNumber &&
            user.businessNumber.replace(/[^0-9]/g, '') !== updateData.businessNumber.replace(/[^0-9]/g, '');

        // 업데이트 확인 모달 표시
        setUpdateConfirmData({
            ...updateData,
            isBusinessNumberChanged
        });
        setShowUpdateConfirmModal(true);
    };

    const handleDeleteAccount = async () => {
        try {
            // OAuth 사용자가 아닌 경우에만 비밀번호 확인
            if (!isOAuthUser && !deletePassword) {
                setDeleteError('비밀번호를 입력해주세요.');
                return;
            }

            const requestData = {};

            // OAuth 사용자가 아닌 경우에만 비밀번호 추가
            if (!isOAuthUser) {
                requestData.password = deletePassword;
            }

            const response = await api.post(`/user/delete`, requestData);

            if (response.status === 200) {
                setDeleteMessage('회원 탈퇴가 완료되었습니다.');

                sessionStorage.removeItem("token");
                api.defaults.headers["Authorization"] = null;

                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            } else {
                throw new Error('회원 탈퇴 중 문제가 발생했습니다.');
            }
        } catch (error) {
            console.error(error);
            if (isOAuthUser) {
                setDeleteError('회원 탈퇴 중 문제가 발생했습니다. 다시 시도해주세요.');
            } else {
                setDeleteError('비밀번호가 올바르지 않습니다. 다시 시도해주세요.');
            }
        } finally {
            setShowDeleteModal(false);
        }
    };

    const openDeleteModal = () => setShowDeleteModal(true);
    const closeDeleteModal = () => setShowDeleteModal(false);

    // 실제 업데이트 처리 함수
    const confirmUpdate = async () => {
        try {
            const response = await api.put('/user/update', updateConfirmData);

            if (response.status === 200) {
                // 사업자 번호 변경 여부 확인
                if (response.data.businessNumberChanged) {
                    setMessage(`사업자 번호가 변경되어 레벨이 1로 초기화되었습니다. ${response.data.message}`);
                } else {
                    setMessage('Profile updated successfully.');
                }
                getUser();

                // OAuth 설정 모드에서 모든 필수 정보가 입력된 경우 홈으로 리다이렉트
                if (isOAuthSetup && needsAdditionalInfo) {
                    // 업데이트된 사용자 정보로 다시 확인
                    const updatedUser = await api.get('/user/me');
                    const stillNeedsInfo = updatedUser.data.user.isSocialAccount && (
                        !updatedUser.data.user.companyName ||
                        !updatedUser.data.user.businessNumber ||
                        !updatedUser.data.user.businessAddress ||
                        !updatedUser.data.user.contactNumber ||
                        !updatedUser.data.user.gender
                    );

                    if (!stillNeedsInfo) {
                        setTimeout(() => {
                            window.location.href = '/';
                        }, 2000);
                    }
                }
            } else {
                throw new Error((response.data && response.data.message) || "회원가입 실패. 다시 시도해주세요.");
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setShowUpdateConfirmModal(false);
            setUpdateConfirmData(null);
        }
    };

    const closeUpdateConfirmModal = () => {
        setShowUpdateConfirmModal(false);
        setUpdateConfirmData(null);
    };



    // 로딩 중이거나 사용자 정보가 없으면 로딩 표시
    if (isLoading || !isAuthenticated) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                fontSize: '1.2rem',
                color: '#666'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div>{isLoading ? '사용자 정보를 불러오는 중...' : '사용자 정보를 찾을 수 없습니다.'}</div>
                    <div style={{ marginTop: '20px', fontSize: '0.9rem', color: '#999' }}>
                        디버깅 정보: isLoading={String(isLoading)}, user={user ? '있음' : '없음'}, token={sessionStorage.getItem('token') ? '있음' : '없음'}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.wrapper}>
                {/* Header */}
                <div style={styles.header}>
                    <h1 style={styles.title}>계정 설정</h1>
                    <p style={styles.subtitle}>
                        개인 정보와 계정 설정을 관리하세요
                    </p>

                    {/* OAuth 설정 모드 안내 */}
                    {isOAuthSetup && needsAdditionalInfo && (
                        <div style={{
                            backgroundColor: '#f0f9ff',
                            border: '2px solid #0ea5e9',
                            borderRadius: '20px',
                            padding: '24px',
                            marginTop: '24px',
                            textAlign: 'center',
                            color: '#0369a1',
                            boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.1)'
                        }}>
                            <h3 style={{ margin: '0 0 12px 0', color: '#0369a1', fontSize: '1.25rem', fontWeight: '600' }}>
                                🎯 추가 정보 입력이 필요합니다
                            </h3>
                            <p style={{ margin: '0', fontSize: '1rem', lineHeight: '1.6' }}>
                                Google 계정으로 첫 로그인하셨습니다.
                                <br />
                                CRM 시스템을 이용하기 위해 아래 정보를 입력해주세요.
                            </p>
                        </div>
                    )}
                </div>

                {/* Main Form */}
                <div style={styles.formCard}>
                    <form onSubmit={handleSubmit} style={styles.form}>
                        <div style={styles.formGrid}>
                            {/* Email Field */}
                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    아이디 (Email ID) <span style={styles.requiredMark}>*변경불가</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    readOnly
                                    style={{
                                        ...styles.input,
                                        ...styles.inputDisabled
                                    }}
                                />
                            </div>

                            {/* Name Field */}
                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    이름 (Name)
                                </label>
                                <input
                                    type="text"
                                    placeholder="이름을 입력하세요"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    style={styles.input}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#3b82f6';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e2e8f0';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>

                            {/* Company Name */}
                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    회사명 (Company Name)
                                    <button
                                        type="button"
                                        onClick={() => setShowCompanySearchModal(true)}
                                        style={{
                                            backgroundColor: '#3b82f6',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            marginLeft:"10px",
                                            padding: '10px',
                                            fontSize: '0.9rem',
                                            fontWeight: '500',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <svg style={styles.searchIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </button>
                                </label>
                                <input
                                    type="text"
                                    placeholder="회사명을 입력하세요"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    style={styles.input}
                                    onClick={() => {
                                        if (!formData.companyName) {
                                            setShowCompanySearchModal(true);
                                        }
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#3b82f6';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e2e8f0';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>


                            {/* Business Number */}
                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    사업자 번호 (Business Number)
                                </label>
                                <input
                                    type="text"
                                    placeholder="사업자 번호를 입력하세요 (숫자만)"
                                    name="businessNumber"
                                    value={formData.businessNumber}
                                    onChange={handleChange}
                                    onClick={() => {
                                        if (!formData.businessNumber) {
                                            setShowCompanySearchModal(true);
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        // 모든 키 허용 (백스페이스, 삭제 등이 정상 작동하도록)
                                        // 숫자만 입력하도록 제한하는 것은 onChange에서 처리
                                    }}
                                    maxLength={12} // 114-86-92399 (최대 12자)
                                    style={styles.input}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#3b82f6';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e2e8f0';
                                        e.target.style.boxShadow = 'none';

                                        // 사업자 번호 포맷팅 (포커스를 잃을 때)
                                        const value = e.target.value;
                                        const numbersOnly = value.replace(/[^0-9]/g, '');

                                        if (numbersOnly.length <= 10 && numbersOnly.length > 0) {
                                            let formattedValue = numbersOnly;
                                            if (numbersOnly.length >= 3) {
                                                formattedValue = numbersOnly.slice(0, 3) + '-' + numbersOnly.slice(3);
                                            }
                                            if (numbersOnly.length >= 5) {
                                                formattedValue = formattedValue.slice(0, 6) + '-' + formattedValue.slice(6);
                                            }

                                            // 포맷팅된 값이 현재 값과 다를 때만 업데이트
                                            if (formattedValue !== value) {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    [e.target.name]: formattedValue
                                                }));
                                            }
                                        }
                                    }}
                                />
                                <small style={{
                                    color: '#64748b',
                                    fontSize: '0.875rem',
                                    marginTop: '4px',
                                    display: 'block'
                                }}>
                                    💡 숫자만 입력하면 자동으로 하이픈이 추가됩니다
                                </small>
                            </div>

                            {/* Address */}
                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    회사 주소 (Address)
                                </label>
                                <div style={styles.addressInputGroup}>
                                    <input
                                        type="text"
                                        placeholder="주소를 검색하세요"
                                        name="businessAddress"
                                        value={formData.businessAddress}
                                        readOnly
                                        onClick={() => {
                                            if (!formData.businessAddress) {
                                                setShowCompanySearchModal(true);
                                            }
                                        }}
                                        style={{
                                            ...styles.input,
                                            ...styles.inputDisabled,
                                            ...styles.addressInput
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={openAddressSearch}
                                        style={styles.addressSearchBtn}
                                        onMouseEnter={(e) => {
                                            e.target.style.backgroundColor = '#2563eb';
                                            e.target.style.transform = 'translateY(-1px)';
                                            e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.3)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.backgroundColor = '#3b82f6';
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = '0 4px 14px 0 rgba(59, 130, 246, 0.25)';
                                        }}
                                    >
                                        <svg style={styles.searchIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        검색
                                    </button>
                                </div>
                            </div>

                            {/* Detailed Address */}
                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    상세 주소 (Detailed Address)
                                </label>
                                <input
                                    type="text"
                                    placeholder="상세 주소를 입력하세요"
                                    name="detailedAddress"
                                    value={formData.detailedAddress}
                                    onChange={handleChange}
                                    onClick={() => {
                                        if (!formData.detailedAddress) {
                                            setShowCompanySearchModal(true);
                                        }
                                    }}
                                    style={styles.input}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#3b82f6';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e2e8f0';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>

                            {/* Birth Date */}
                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    생년월일 (Birth Date)
                                </label>
                                <input
                                    type="text"
                                    name="birthDate"
                                    placeholder="1991-07-10"
                                    value={formData.birthDate ? (formData.birthDate instanceof Date ? formData.birthDate.toISOString().split('T')[0] : formData.birthDate.split('T')[0]) : ''}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        // 숫자만 입력된 경우 자동으로 하이픈 추가
                                        if (/^\d{8}$/.test(value)) {
                                            const formatted = value.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
                                            setFormData(prev => ({ ...prev, birthDate: formatted }));
                                        } else {
                                            handleChange(e);
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        // 모든 키 허용 (백스페이스, 삭제 등이 정상 작동하도록)
                                        // 숫자만 입력하도록 제한하는 것은 onChange에서 처리
                                    }}
                                    onBlur={(e) => {
                                        // 포커스를 잃을 때 포맷팅 적용
                                        const value = e.target.value;
                                        const numbersOnly = value.replace(/[^0-9]/g, '');

                                        if (numbersOnly.length === 8) {
                                            const formatted = numbersOnly.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
                                            if (formatted !== value) {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    [e.target.name]: formatted
                                                }));
                                            }
                                        }

                                        // 스타일 변경
                                        e.target.style.borderColor = '#e2e8f0';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    maxLength={10} // YYYY-MM-DD (최대 10자)
                                    style={styles.input}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#3b82f6';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                    }}
                                />
                                <small style={{
                                    color: '#64748b',
                                    fontSize: '0.875rem',
                                    marginTop: '4px',
                                    display: 'block'
                                }}>
                                    💡 숫자만 입력하면 자동으로 하이픈이 추가됩니다 (예: 19910710 → 1991-07-10)
                                </small>
                            </div>

                            {/* Gender */}
                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    성별 (Gender)
                                </label>
                                <div style={{ display: 'flex', gap: '20px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="male"
                                            checked={formData.gender === 'male'}
                                            onChange={handleChange}
                                            style={{ width: '18px', height: '18px' }}
                                        />
                                        <span>남성 (Male)</span>
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="female"
                                            checked={formData.gender === 'female'}
                                            onChange={handleChange}
                                            style={{ width: '18px', height: '18px' }}
                                        />
                                        <span>여성 (Female)</span>
                                    </label>
                                </div>
                            </div>

                            {/* Position */}
                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    직급 (Position)
                                </label>
                                <select
                                    name="position"
                                    value={formData.position}
                                    onChange={handleChange}
                                    style={styles.input}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#3b82f6';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e2e8f0';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                >
                                    <option value="">직급을 선택하세요</option>
                                    <option value="사원">사원</option>
                                    <option value="대리">대리</option>
                                    <option value="과장">과장</option>
                                    <option value="차장">차장</option>
                                    <option value="부장">부장</option>
                                    <option value="이사">이사</option>
                                    <option value="상무">상무</option>
                                    <option value="전무">전무</option>
                                    <option value="부사장">부사장</option>
                                    <option value="사장">사장</option>
                                    <option value="기타">기타</option>
                                </select>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div style={styles.formActions}>
                            <button
                                type="submit"
                                style={{
                                    ...styles.btn,
                                    ...styles.btnPrimary,
                                    transform: hoveredBtn === 'primary' ? 'translateY(-2px)' : 'translateY(0)',
                                    boxShadow: hoveredBtn === 'primary' ? '0 8px 25px rgba(59, 130, 246, 0.3)' : '0 4px 14px 0 rgba(59, 130, 246, 0.25)'
                                }}
                                onMouseEnter={() => setHoveredBtn('primary')}
                                onMouseLeave={() => setHoveredBtn(null)}
                            >
                                <svg style={styles.btnIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                정보 업데이트
                            </button>

                            <button
                                type="button"
                                onClick={openDeleteModal}
                                style={{
                                    ...styles.btn,
                                    ...styles.btnDanger,
                                    transform: hoveredBtn === 'danger' ? 'translateY(-2px)' : 'translateY(0)',
                                    boxShadow: hoveredBtn === 'danger' ? '0 8px 25px rgba(239, 68, 68, 0.3)' : '0 4px 14px 0 rgba(239, 68, 68, 0.25)'
                                }}
                                onMouseEnter={() => setHoveredBtn('danger')}
                                onMouseLeave={() => setHoveredBtn(null)}
                            >
                                <svg style={styles.btnIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                회원 탈퇴
                            </button>
                        </div>

                        {/* Messages */}
                        {error && (
                            <div style={{ ...styles.message, ...styles.messageError }}>
                                <svg style={styles.messageIcon} fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span style={styles.messageText}>{error}</span>
                            </div>
                        )}

                        {message && (
                            <div style={{ ...styles.message, ...styles.messageSuccess }}>
                                <svg style={styles.messageIcon} fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span style={styles.messageText}>{message}</span>
                            </div>
                        )}

                        {deleteError && (
                            <div style={{ ...styles.message, ...styles.messageError }}>
                                <svg style={styles.messageIcon} fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span style={styles.messageText}>{deleteError}</span>
                            </div>
                        )}

                        {deleteMessage && (
                            <div style={{ ...styles.message, ...styles.messageSuccess }}>
                                <svg style={styles.messageIcon} fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span style={styles.messageText}>{deleteMessage}</span>
                            </div>
                        )}
                    </form>
                </div>

                {/* Update Confirm Modal */}
                {showUpdateConfirmModal && updateConfirmData && (
                    <div style={styles.modalOverlay} onClick={closeUpdateConfirmModal}>
                        <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            <div style={styles.modalHeader}>
                                <h3 style={styles.modalTitle}>정보 업데이트 확인</h3>
                                <button
                                    onClick={closeUpdateConfirmModal}
                                    style={styles.modalCloseBtn}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = '#f3f4f6';
                                        e.target.style.color = '#6b7280';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                        e.target.style.color = '#9ca3af';
                                    }}
                                >
                                    <svg style={styles.closeIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div style={styles.modalBody}>
                                <div style={{
                                    backgroundColor: '#f0f9ff',
                                    border: '1px solid #0ea5e9',
                                    borderRadius: '12px',
                                    padding: '15px',
                                    marginBottom: '20px'
                                }}>
                                    <h4 style={{ margin: '0 0 10px 0', color: '#0369a1' }}>
                                        📝 업데이트할 정보를 확인해주세요
                                    </h4>
                                    <div style={{ fontSize: '0.9rem', color: '#0369a1' }}>
                                        <div><strong>이름:</strong> {updateConfirmData.name}</div>
                                        <div><strong>회사명:</strong> {updateConfirmData.companyName}</div>
                                        <div><strong>사업자 번호:</strong> {updateConfirmData.businessNumber}</div>
                                        <div><strong>주소:</strong> {updateConfirmData.businessAddress}</div>
                                        <div><strong>상세주소:</strong> {updateConfirmData.detailedAddress}</div>
                                        <div><strong>생년월일:</strong> {updateConfirmData.birthDate || '미입력'}</div>
                                        <div><strong>성별:</strong> {updateConfirmData.gender === 'male' ? '남성' : updateConfirmData.gender === 'female' ? '여성' : '미입력'}</div>
                                        <div><strong>직급:</strong> {updateConfirmData.position || '미입력'}</div>
                                    </div>
                                </div>

                                {/* 사업자 번호 변경 시 경고 */}
                                {updateConfirmData.isBusinessNumberChanged && (
                                    <div style={{
                                        backgroundColor: '#fef2f2',
                                        border: '2px solid #f59e0b',
                                        borderRadius: '12px',
                                        padding: '15px',
                                        marginBottom: '20px'
                                    }}>
                                        <h4 style={{ margin: '0 0 10px 0', color: '#dc2626' }}>
                                            ⚠️ 사업자 번호 변경 주의사항
                                        </h4>
                                        <div style={{ fontSize: '0.9rem', color: '#dc2626' }}>
                                            <p style={{ margin: '0 0 8px 0' }}>
                                                <strong>사업자 번호가 변경되면 다음 권한들이 모두 초기화됩니다:</strong>
                                            </p>
                                            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                                                <li>자동 등록 방식 권한</li>
                                                <li>열람에서의 모든 권한</li>
                                                <li>사용자 레벨 (1로 초기화)</li>
                                                <li>기존 매물 및 고객 정보 접근 권한</li>
                                            </ul>
                                            <p style={{ margin: '8px 0 0 0', fontWeight: 'bold' }}>
                                                정말로 사업자 번호를 변경하시겠습니까?
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div style={styles.modalFooter}>
                                <button
                                    onClick={closeUpdateConfirmModal}
                                    style={{
                                        ...styles.btn,
                                        ...styles.btnSecondary,
                                        flex: '1'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = '#4b5563';
                                        e.target.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = '#6b7280';
                                        e.target.style.transform = 'translateY(0)';
                                    }}
                                >
                                    취소
                                </button>
                                <button
                                    onClick={confirmUpdate}
                                    style={{
                                        ...styles.btn,
                                        ...styles.btnPrimary,
                                        flex: '1'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = '#5a67d8';
                                        e.target.style.transform = 'translateY(-2px)';
                                        e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = '#667eea';
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                                    }}
                                >
                                    확인 및 업데이트
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Account Modal */}
                {showDeleteModal && (
                    <div style={styles.modalOverlay} onClick={closeDeleteModal}>
                        <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            <div style={styles.modalHeader}>
                                <h3 style={styles.modalTitle}>회원 탈퇴</h3>
                                <button
                                    onClick={closeDeleteModal}
                                    style={styles.modalCloseBtn}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = '#f3f4f6';
                                        e.target.style.color = '#6b7280';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                        e.target.style.color = '#9ca3af';
                                    }}
                                >
                                    <svg style={styles.closeIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div style={styles.modalBody}>
                                <div style={styles.warningBox}>
                                    <svg style={styles.warningIcon} fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <span style={styles.warningText}>
                                        이 작업은 되돌릴 수 없습니다
                                    </span>
                                </div>

                                {isOAuthUser ? (
                                    <div style={{
                                        backgroundColor: '#f0f9ff',
                                        border: '1px solid #0ea5e9',
                                        borderRadius: '8px',
                                        padding: '15px',
                                        marginBottom: '20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}>
                                        <svg style={{ width: '20px', height: '20px', color: '#0ea5e9' }} fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span style={{ color: '#0369a1', fontSize: '0.9rem' }}>
                                            Google 계정 사용자는 비밀번호 확인 없이 탈퇴할 수 있습니다.
                                        </span>
                                    </div>
                                ) : (
                                    <div>
                                        <label style={styles.label}>
                                            비밀번호를 입력하세요 (Password)
                                        </label>
                                        <input
                                            type="password"
                                            placeholder="비밀번호를 입력하세요"
                                            value={deletePassword}
                                            onChange={(e) => setDeletePassword(e.target.value)}
                                            style={styles.input}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = '#ef4444';
                                                e.target.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = '#e2e8f0';
                                                e.target.style.boxShadow = 'none';
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            <div style={styles.modalFooter}>
                                <button
                                    onClick={closeDeleteModal}
                                    style={{
                                        ...styles.btn,
                                        ...styles.btnSecondary,
                                        flex: '1'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = '#4b5563';
                                        e.target.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = '#6b7280';
                                        e.target.style.transform = 'translateY(0)';
                                    }}
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    style={{
                                        ...styles.btn,
                                        ...styles.btnDanger,
                                        flex: '1'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = '#dc2626';
                                        e.target.style.transform = 'translateY(-2px)';
                                        e.target.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.4)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = '#ef4444';
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.4)';
                                    }}
                                >
                                    탈퇴
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 회사 찾기 모달 */}
            <CompanySearchModal
                show={showCompanySearchModal}
                onHide={() => setShowCompanySearchModal(false)}
                onSelectCompany={handleCompanySelect}
            />
        </div>
    );
};

export default AccountSettings;
