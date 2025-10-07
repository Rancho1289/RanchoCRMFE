import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Container, Card, Button, Table, Badge, Row, Col, Alert, Pagination, Form, Accordion } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaHome, FaMapMarkerAlt, FaMoneyBillWave, FaFileCsv, FaDownload, FaCar, FaDog } from 'react-icons/fa';
import { FaElevator } from 'react-icons/fa6';
import { useSearchParams } from 'react-router-dom';
import { UserContext } from '../UserContext';
import api from '../../utils/api';
import PropertyRegistrationModal from './PropertyRegistrationModal';
import PropertyCSVUploadModal from './PropertyCSVUploadModal';
import PropertyHistoryModal from './PropertyHistoryModal';


const PropertyManagement = ({ isModal = false, customerFilter = null, user: propUser = null, onClose = null, onPropertyChange = null }) => {
    const { user: contextUser } = useContext(UserContext);
    const [searchParams, setSearchParams] = useSearchParams();
    const [properties, setProperties] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingProperty, setEditingProperty] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // 모달에서 사용할 때는 propUser를, 일반 페이지에서는 contextUser를 사용
    const user = propUser || contextUser;

    // 모달에서 사용할 로컬 상태
    const [localSearchTerm, setLocalSearchTerm] = useState('');
    const [localFilterType, setLocalFilterType] = useState('all');

    // URL 파라미터에서 검색 조건 가져오기 (모달에서는 사용하지 않음)
    const searchTerm = isModal ? localSearchTerm : (searchParams.get('search') || '');
    // IME 안전 입력 버퍼 및 조합 상태
    const [pendingSearchTerm, setPendingSearchTerm] = useState(searchTerm);
    const [isComposing, setIsComposing] = useState(false);
    const filterType = isModal ? localFilterType : (searchParams.get('filter') || 'all');

    // 히스토리 모달 관련 상태
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState(null);

    // CSV 업로드 관련 상태
    const [showCSVModal, setShowCSVModal] = useState(false);

    // 페이지네이션 상태
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // 페이지당 아이템 수

    // 매물 유형 필터 상태 (중복 선택 가능)
    const [selectedPropertyTypes, setSelectedPropertyTypes] = useState(new Set(['월세', '전세', '매매']));

    // 가격 범위 필터 상태 (적용된 필터)
    const [appliedPriceFilters, setAppliedPriceFilters] = useState({
        매매: { min: '', max: '' },
        월세: { depositMin: '', depositMax: '', rentMin: '', rentMax: '' },
        전세: { min: '', max: '' }
    });

    // 면적/방/욕실 필터 (적용값)
    const [appliedAttrFilters, setAppliedAttrFilters] = useState({
        areaMin: '', areaMax: '',
        roomsMin: '', roomsMax: '',
        bathroomsMin: '', bathroomsMax: ''
    });

    // 가격 범위 필터 상태 (임시 입력값)
    const [tempPriceFilters, setTempPriceFilters] = useState({
        매매: { min: '', max: '' },
        월세: { depositMin: '', depositMax: '', rentMin: '', rentMax: '' },
        전세: { min: '', max: '' }
    });

    // 면적/방/욕실 필터 (임시 입력값)
    const [tempAttrFilters, setTempAttrFilters] = useState({
        areaMin: '', areaMax: '',
        roomsMin: '', roomsMax: '',
        bathroomsMin: '', bathroomsMax: ''
    });

    // 슬라이더 상태
    const [sliderValues, setSliderValues] = useState({
        매매: { min: 0, max: 10000000000 }, // 0원 ~ 100억
        월세: { depositMin: 0, depositMax: 1000000000, rentMin: 0, rentMax: 10000000 }, // 보증금 0~10억, 월세 0~1000만
        전세: { min: 0, max: 10000000000 } // 0원 ~ 100억
    });



    // 페이지네이션 헬퍼 함수들
    const getCurrentPageData = (data, currentPage) => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return data.slice(startIndex, endIndex);
    };

    const getTotalPages = (data) => {
        return Math.ceil(data.length / itemsPerPage);
    };

    // PropertyManagement.js 전용 페이지네이션 생성 함수 (5개씩 묶음)
    const createPropertyPagination = (currentPage, totalPages, onPageChange, keyPrefix) => {
        if (totalPages <= 1) {
            return [];
        }

        const items = [];
        const pagesPerGroup = 5; // 5개씩 묶음

        // 현재 그룹 계산
        const currentGroup = Math.ceil(currentPage / pagesPerGroup);
        const totalGroups = Math.ceil(totalPages / pagesPerGroup);

        // 그룹의 시작과 끝 페이지 계산
        const groupStartPage = (currentGroup - 1) * pagesPerGroup + 1;
        const groupEndPage = Math.min(currentGroup * pagesPerGroup, totalPages);

        // 맨 처음으로 (≪)
        items.push(
            <Pagination.First
                key={`${keyPrefix}-first`}
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
                className="border-0"
                title="맨 처음"
            >
                ≪
            </Pagination.First>
        );

        // 이전 그룹으로 (<)
        items.push(
            <Pagination.Prev
                key={`${keyPrefix}-prevGroup`}
                onClick={() => onPageChange(Math.max(1, groupStartPage - 1))}
                disabled={currentGroup === 1}
                className="border-0"
                title="이전 그룹"
            >
                &lt;
            </Pagination.Prev>
        );

        // 현재 그룹의 페이지 번호들 (1, 2, 3, 4, 5)
        for (let page = groupStartPage; page <= groupEndPage; page++) {
            items.push(
                <Pagination.Item
                    key={`${keyPrefix}-page-${page}`}
                    active={page === currentPage}
                    onClick={() => onPageChange(page)}
                    className="border-0"
                >
                    {page}
                </Pagination.Item>
            );
        }

        // 다음 그룹으로 (>)
        items.push(
            <Pagination.Next
                key={`${keyPrefix}-nextGroup`}
                onClick={() => onPageChange(Math.min(totalPages, groupEndPage + 1))}
                disabled={currentGroup === totalGroups}
                className="border-0"
                title="다음 그룹"
            >
                &gt;
            </Pagination.Next>
        );

        // 맨 마지막으로 (≫)
        items.push(
            <Pagination.Last
                key={`${keyPrefix}-last`}
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="border-0"
                title="맨 마지막"
            >
                ≫
            </Pagination.Last>
        );

        return items;
    };

    // 검색어 변경 핸들러
    const handleSearchChange = (value) => {
        setCurrentPage(1); // 검색 시 첫 페이지로 리셋
        if (isModal) {
            // 모달에서는 로컬 상태로 관리
            setLocalSearchTerm(value);
        } else {
            // 일반 페이지에서는 URL 파라미터로 관리
            const newSearchParams = new URLSearchParams(searchParams);
            if (value) {
                newSearchParams.set('search', value);
            } else {
                newSearchParams.delete('search');
            }
            setSearchParams(newSearchParams);
        }
    };

    // 입력 핸들러들 (IME 안전)
    const handleSearchInputChange = (e) => {
        setPendingSearchTerm(e.target.value);
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter' && !isComposing) {
            e.preventDefault();
            handleSearchChange(pendingSearchTerm);
        }
    };

    const handleCompositionStart = () => setIsComposing(true);
    const handleCompositionEnd = (e) => {
        setIsComposing(false);
        // 조합 종료 시 value 동기화만, 실제 검색은 Enter/버튼에서 수행
        setPendingSearchTerm(e.target.value);
    };

    // URL 기반 검색어가 바뀌면 입력 버퍼 동기화
    useEffect(() => {
        setPendingSearchTerm(searchTerm);
    }, [searchTerm]);

    // 필터 변경 핸들러
    const handleFilterChange = (value) => {
        setCurrentPage(1); // 필터 변경 시 첫 페이지로 리셋
        if (isModal) {
            // 모달에서는 로컬 상태로 관리
            setLocalFilterType(value);
        } else {
            // 일반 페이지에서는 URL 파라미터로 관리
            const newSearchParams = new URLSearchParams(searchParams);
            if (value && value !== 'all') {
                newSearchParams.set('filter', value);
            } else {
                newSearchParams.delete('filter');
            }
            setSearchParams(newSearchParams);
        }
    };

    // CSV 양식 다운로드
    const downloadCSVTemplate = () => {
        const headers = [
            '매물유형 (매매/월세/전세/실거주)',
            '매매가격 (숫자만& 매매 선택시 필수)',
            '월세가격 (숫자만& 월세 선택시 필수)',
            '월세보증금 (숫자만& 월세 선택시 선택)',
            '전세가격 (숫자만& 전세 선택시 필수)',
            '면적 (숫자만)',
            '방개수 (숫자만)',
            '욕실개수 (숫자만)',
            '주소 (필수-매물명으로 자동 설정)',
            '상세주소 (선택)',
            '상태 (판매중/월세중/전세중/계약완료)',
            '주차 (가능/불가능/별도문의)',
            '애완동물 (가능/불가능/별도문의)',
            '엘리베이터 (있음/없음/별도문의)',
            '특이사항 (자유입력)'
        ];

        // 예시 데이터 (2행부터)
        const examples = [
            [
                '월세',
                '', // 매매가격
                '500000', // 월세가격
                '10000000', // 월세보증금
                '', // 전세가격
                '25.5',
                '1',
                '1',
                '서울특별시 강남구 역삼동 123-45',
                '101호',
                '월세중',
                '가능',
                '불가능',
                '있음',
                '신축, 역세권, 주차가능'
            ],
            [
                '매매',
                '500000000', // 매매가격
                '', // 월세가격
                '', // 월세보증금
                '', // 전세가격
                '45.2',
                '2',
                '1',
                '서울특별시 마포구 합정동 456-78',
                '301호',
                '판매중',
                '별도문의',
                '별도문의',
                '있음',
                '투룸, 엘리베이터, 주차별도'
            ],
            [
                '전세',
                '', // 매매가격
                '', // 월세가격
                '', // 월세보증금
                '80000000', // 전세가격
                '32.8',
                '1',
                '1',
                '서울특별시 송파구 문정동 789-12',
                '502호',
                '전세중',
                '불가능',
                '별도문의',
                '없음',
                '전세, 1층, 반지하'
            ],
            [
                '실거주',
                '', // 매매가격
                '', // 월세가격
                '', // 월세보증금
                '', // 전세가격
                '28.5',
                '1',
                '1',
                '서울특별시 영등포구 여의도동 321-54',
                '201호',
                '판매중',
                '별도문의',
                '별도문의',
                '별도문의',
                '실거주, 여의도역 근처'
            ],
            [
                '예시: 원하는 값 입력',
                '숫자만 입력',
                '숫자만 입력',
                '숫자만 입력',
                '숫자만 입력',
                '숫자만 입력',
                '주소 입력',
                '상세주소 입력',
                '판매중/월세중/전세중/계약완료',
                '가능/불가능/별도문의',
                '가능/불가능/별도문의',
                '있음/없음/별도문의',
                '특이사항 자유입력',
                '추가정보1 입력',
                '추가정보2 입력'
            ],
            [
                '⚠️ 주의: 6행부터 실제 업로드됩니다!',
                '⚠️ 주의: 6행부터 실제 업로드됩니다!',
                '⚠️ 주의: 6행부터 실제 업로드됩니다!',
                '⚠️ 주의: 6행부터 실제 업로드됩니다!',
                '⚠️ 주의: 6행부터 실제 업로드됩니다!',
                '⚠️ 주의: 6행부터 실제 업로드됩니다!',
                '⚠️ 주의: 6행부터 실제 업로드됩니다!',
                '⚠️ 주의: 6행부터 실제 업로드됩니다!',
                '⚠️ 주의: 6행부터 실제 업로드됩니다!',
                '⚠️ 주의: 6행부터 실제 업로드됩니다!',
                '⚠️ 주의: 6행부터 실제 업로드됩니다!',
                '⚠️ 주의: 6행부터 실제 업로드됩니다!',
                '⚠️ 주의: 6행부터 실제 업로드됩니다!',
                '⚠️ 주의: 6행부터 실제 업로드됩니다!',
                '⚠️ 주의: 6행부터 실제 업로드됩니다!'
            ]
        ];

        // BOM(Byte Order Mark) 추가하여 한글 깨짐 방지
        const BOM = '\uFEFF';

        // 1행: 주의사항
        let csvContent = BOM + '⚠️ 주의: 6행부터 실제 업로드됩니다!\n';

        // 2행: 헤더
        csvContent += headers.join(',') + '\n';

        // 3-5행: 예시 데이터 (3개만)
        examples.slice(0, 3).forEach(example => {
            csvContent += example.join(',') + '\n';
        });

        // UTF-8 BOM이 포함된 Blob 생성
        const blob = new Blob([csvContent], {
            type: 'text/csv;charset=utf-8;'
        });

        const link = document.createElement('a');

        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', '매물_등록_양식_예시.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };

    // 금액 포맷팅 함수
    const formatCurrency = (value) => {
        if (!value) return '';
        return Number(value).toLocaleString();
    };

    // 매물의 가격 정보 표시 함수
    const getPropertyPricesDisplay = (property) => {
        if (!property.prices) return '가격 정보 없음';

        const ranges = [];

        // 매매 가격
        if (property.prices.매매가격) {
            ranges.push(`매매: ${formatCurrency(property.prices.매매가격)}원`);
        }

        // 월세 가격 (월세가격과 월세보증금)
        if (property.prices.월세가격 || property.prices.월세보증금) {
            const monthlyRent = property.prices.월세가격 ? formatCurrency(property.prices.월세가격) : '미정';
            const deposit = property.prices.월세보증금 ? formatCurrency(property.prices.월세보증금) : '미정';
            ranges.push(`월세: ${deposit}/${monthlyRent}`);
        }

        // 전세 가격
        if (property.prices.전세가격) {
            ranges.push(`전세: ${formatCurrency(property.prices.전세가격)}원`);
        }

        return ranges.length > 0 ? ranges : '가격 정보 없음';
    };

    // 매물 유형 필터 핸들러
    const handlePropertyTypeFilterChange = (propertyType) => {
        const newSelectedPropertyTypes = new Set(selectedPropertyTypes);
        if (newSelectedPropertyTypes.has(propertyType)) {
            newSelectedPropertyTypes.delete(propertyType);
        } else {
            newSelectedPropertyTypes.add(propertyType);
        }
        setSelectedPropertyTypes(newSelectedPropertyTypes);
    };

    // 모든 매물 유형 선택/해제
    const handleSelectAllPropertyTypes = () => {
        if (selectedPropertyTypes.size === 3) {
            setSelectedPropertyTypes(new Set());
        } else {
            setSelectedPropertyTypes(new Set(['월세', '전세', '매매']));
        }
    };

    // 가격 입력값을 숫자로 변환하는 함수 (억, 천만, 만 단위 지원)
    const parsePriceInput = (input) => {
        if (!input || input === '') return '';

        const str = input.toString().trim();

        // 이미 숫자만 있는 경우
        if (/^\d+$/.test(str)) {
            return parseInt(str);
        }

        // 억 단위 처리 (예: 1억, 1.5억)
        if (str.includes('억')) {
            const value = parseFloat(str.replace('억', ''));
            return Math.floor(value * 100000000);
        }

        // 천만 단위 처리 (예: 5000천만, 5천만)
        if (str.includes('천만')) {
            const value = parseFloat(str.replace('천만', ''));
            return Math.floor(value * 10000000);
        }

        // 만 단위 처리 (예: 1000만, 100만)
        if (str.includes('만')) {
            const value = parseFloat(str.replace('만', ''));
            return Math.floor(value * 10000);
        }

        // 숫자와 콤마가 있는 경우 (예: 100,000,000)
        if (/^[\d,]+$/.test(str)) {
            return parseInt(str.replace(/,/g, ''));
        }

        return '';
    };

    // 숫자를 억/천만/만 단위로 표시하는 함수 (임시 입력용)
    const formatPriceForDisplay = (value) => {
        if (!value || value === '') return '';

        const num = parseInt(value);
        if (isNaN(num)) return '';

        if (num >= 100000000) {
            const eok = Math.floor(num / 100000000);
            const remainder = num % 100000000;
            if (remainder === 0) {
                return `${eok}억`;
            } else if (remainder >= 10000000) {
                const cheonman = Math.floor(remainder / 10000000);
                return `${eok}억${cheonman}천만`;
            } else {
                return `${eok}억${remainder.toLocaleString()}`;
            }
        } else if (num >= 10000000) {
            const cheonman = Math.floor(num / 10000000);
            const remainder = num % 10000000;
            if (remainder === 0) {
                return `${cheonman}천만`;
            } else {
                return `${cheonman}천만${remainder.toLocaleString()}`;
            }
        } else if (num >= 10000) {
            const man = Math.floor(num / 10000);
            const remainder = num % 10000;
            if (remainder === 0) {
                return `${man}만`;
            } else {
                return `${man}만${remainder.toLocaleString()}`;
            }
        } else {
            return num.toLocaleString();
        }
    };

    // 적용된 필터용 숫자 표시 함수 (1000단위 쉼표만)
    const formatAppliedPrice = (value) => {
        if (!value || value === '') return '';
        const num = parseInt(value);
        if (isNaN(num)) return '';
        return num.toLocaleString();
    };

    // 임시 가격 필터 변경 핸들러
    const handleTempPriceFilterChange = (type, field, value) => {
        const parsedValue = parsePriceInput(value);
        setTempPriceFilters(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [field]: parsedValue
            }
        }));

        // 슬라이더 값도 업데이트
        setSliderValues(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [field]: parsedValue || 0
            }
        }));
    };

    // 슬라이더 변경 핸들러
    const handleSliderChange = (type, field, value) => {
        setSliderValues(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [field]: parseInt(value)
            }
        }));

        // 임시 필터 값도 업데이트
        setTempPriceFilters(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [field]: parseInt(value)
            }
        }));
    };

    // 가격 필터 적용 핸들러
    const handleApplyPriceFilters = () => {
        setAppliedPriceFilters({ ...tempPriceFilters });
        setAppliedAttrFilters({ ...tempAttrFilters });
    };

    // 가격 필터 초기화 핸들러
    const handleClearPriceFilters = () => {
        const emptyFilters = {
            매매: { min: '', max: '' },
            월세: { depositMin: '', depositMax: '', rentMin: '', rentMax: '' },
            전세: { min: '', max: '' }
        };
        setTempPriceFilters(emptyFilters);
        setAppliedPriceFilters(emptyFilters);
        const emptyAttr = { areaMin: '', areaMax: '', roomsMin: '', roomsMax: '', bathroomsMin: '', bathroomsMax: '' };
        setTempAttrFilters(emptyAttr);
        setAppliedAttrFilters(emptyAttr);
        setSliderValues({
            매매: { min: 0, max: 10000000000 },
            월세: { depositMin: 0, depositMax: 1000000000, rentMin: 0, rentMax: 10000000 },
            전세: { min: 0, max: 10000000000 }
        });
    };

    // 면적/방/욕실 임시 입력 핸들러
    const handleTempAttrChange = (field, value) => {
        const sanitized = value.replace(/[^\d]/g, '');
        setTempAttrFilters(prev => ({ ...prev, [field]: sanitized }));
    };

    // 매물 목록 조회
    const fetchProperties = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (filterType !== 'all') params.append('filterType', filterType);

            // 모달에서 고객 필터가 있는 경우 고객 정보로 검색
            if (isModal && customerFilter) {
                const searchTerms = [];
                if (customerFilter.name) searchTerms.push(customerFilter.name);
                if (customerFilter.phone) searchTerms.push(customerFilter.phone);
                if (searchTerms.length > 0) {
                    params.append('search', searchTerms.join(' '));
                }
            }



            const response = await api.get(`/properties?${params.toString()}`);

            if (response.data.success) {
                setProperties(response.data.data);
            } else {
                setError('매물 목록을 불러오는데 실패했습니다.');
            }
        } catch (error) {
            console.error('매물 목록 조회 오류:', error);
            
            // 401 오류인 경우 로그인 만료 메시지 표시
            if (error.response?.status === 401) {
                setError('로그인이 만료되었습니다. 다시 로그인해주세요.');
            } else {
                setError('매물 목록을 불러오는데 실패했습니다.');
            }
        } finally {
            setLoading(false);
        }
    }, [searchTerm, filterType, customerFilter, isModal]);

    useEffect(() => {
        fetchProperties();
    }, [searchTerm, filterType, fetchProperties]);

    const handleShowModal = (property = null) => {
        if (!user) {
            setError('로그인이 필요합니다.');
            return;
        }

        // level 2 이하인 경우 접근 제한
        if (user.level <= 2) {
            setError('매물 등록 권한이 없습니다.');
            return;
        }

        setEditingProperty(property);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingProperty(null);
    };

    const handlePropertySuccess = async (propertyData, propertyId = null) => {
        // 로그인 확인
        if (!user) {
            throw new Error('로그인이 필요합니다.');
        }

        try {
            setLoading(true);

            if (propertyId) {
                // 매물 수정
                const response = await api.put(`/properties/${propertyId}`, propertyData);
                if (response.status === 200) {
                    setSuccess('매물이 성공적으로 수정되었습니다.');
                    fetchProperties(); // 목록 새로고침
                    // 부모 컴포넌트에 변경 알림
                    if (onPropertyChange) {
                        onPropertyChange();
                    }
                }
            } else {
                // 매물 등록
                const response = await api.post('/properties', propertyData);
                if (response.status === 201) {
                    setSuccess('매물이 성공적으로 등록되었습니다.');
                    fetchProperties(); // 목록 새로고침
                    // 부모 컴포넌트에 변경 알림
                    if (onPropertyChange) {
                        onPropertyChange();
                    }
                }
            }
        } catch (error) {
            console.error('매물 저장 오류:', error);
            // 에러를 다시 throw하여 PropertyRegistrationModal에서 처리하도록 함
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            try {
                setLoading(true);
                setError('');
                setSuccess('');

                const response = await api.delete(`/properties/${id}`);
                if (response.status === 200) {
                    setSuccess('매물이 성공적으로 삭제되었습니다.');
                    fetchProperties(); // 목록 새로고침
                    // 부모 컴포넌트에 변경 알림
                    if (onPropertyChange) {
                        onPropertyChange();
                    }
                }
            } catch (error) {
                console.error('매물 삭제 오류:', error);
                setError(error.response?.data?.message || '매물 삭제에 실패했습니다.');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleShowHistoryModal = async (property) => {
        try {
            // 매물 상세 정보 조회 (히스토리 포함)
            const response = await api.get(`/properties/${property._id}`);
            if (response.status === 200) {
                setSelectedProperty(response.data.data);
                setShowHistoryModal(true);
            }
        } catch (error) {
            console.error('매물 상세 조회 오류:', error);
            setError('매물 정보를 불러오는데 실패했습니다.');
        }
    };

    const handleCloseHistoryModal = () => {
        setShowHistoryModal(false);
        setSelectedProperty(null);
    };



    // 가격 범위 필터링 함수
    const matchesPriceFilter = (property) => {
        if (!property.prices) return true;

        // 매매 가격 범위 필터 확인 (매매 유형이 선택된 경우에만)
        if (selectedPropertyTypes.has('매매') && (appliedPriceFilters.매매.min || appliedPriceFilters.매매.max)) {
            const propertyPrice = property.prices.매매가격;
            if (propertyPrice) {
                const minPrice = appliedPriceFilters.매매.min ? parseInt(appliedPriceFilters.매매.min) : 0;
                const maxPrice = appliedPriceFilters.매매.max ? parseInt(appliedPriceFilters.매매.max) : Infinity;

                if (propertyPrice < minPrice || propertyPrice > maxPrice) {
                    return false;
                }
            } else {
                return false;
            }
        }

        // 월세 가격 범위 필터 확인 (월세 유형이 선택된 경우에만)
        if (selectedPropertyTypes.has('월세') && (appliedPriceFilters.월세.depositMin || appliedPriceFilters.월세.depositMax || appliedPriceFilters.월세.rentMin || appliedPriceFilters.월세.rentMax)) {
            const monthlyRent = property.prices.월세가격;
            const deposit = property.prices.월세보증금;

            if (monthlyRent || deposit) {
                const depositMin = appliedPriceFilters.월세.depositMin ? parseInt(appliedPriceFilters.월세.depositMin) : 0;
                const depositMax = appliedPriceFilters.월세.depositMax ? parseInt(appliedPriceFilters.월세.depositMax) : Infinity;
                const rentMin = appliedPriceFilters.월세.rentMin ? parseInt(appliedPriceFilters.월세.rentMin) : 0;
                const rentMax = appliedPriceFilters.월세.rentMax ? parseInt(appliedPriceFilters.월세.rentMax) : Infinity;

                if ((deposit && (deposit < depositMin || deposit > depositMax)) ||
                    (monthlyRent && (monthlyRent < rentMin || monthlyRent > rentMax))) {
                    return false;
                }
            } else {
                return false;
            }
        }

        // 전세 가격 범위 필터 확인 (전세 유형이 선택된 경우에만)
        if (selectedPropertyTypes.has('전세') && (appliedPriceFilters.전세.min || appliedPriceFilters.전세.max)) {
            const propertyPrice = property.prices.전세가격;
            if (propertyPrice) {
                const minPrice = appliedPriceFilters.전세.min ? parseInt(appliedPriceFilters.전세.min) : 0;
                const maxPrice = appliedPriceFilters.전세.max ? parseInt(appliedPriceFilters.전세.max) : Infinity;

                if (propertyPrice < minPrice || propertyPrice > maxPrice) {
                    return false;
                }
            } else {
                return false;
            }
        }

        return true;
    };

    // 면적/방/욕실 필터 확인
    const matchesAttrFilter = (property) => {
        const toNumOr = (v, def) => (v === '' ? def : parseFloat(v));
        const area = parseFloat(property.area || 0);
        const rooms = parseFloat(property.rooms || 0);
        const baths = parseFloat(property.bathrooms || 0);

        const areaMin = toNumOr(appliedAttrFilters.areaMin, -Infinity);
        const areaMax = toNumOr(appliedAttrFilters.areaMax, Infinity);
        const roomsMin = toNumOr(appliedAttrFilters.roomsMin, -Infinity);
        const roomsMax = toNumOr(appliedAttrFilters.roomsMax, Infinity);
        const bathroomsMin = toNumOr(appliedAttrFilters.bathroomsMin, -Infinity);
        const bathroomsMax = toNumOr(appliedAttrFilters.bathroomsMax, Infinity);

        if (!(area >= areaMin && area <= areaMax)) return false;
        if (!(rooms >= roomsMin && rooms <= roomsMax)) return false;
        if (!(baths >= bathroomsMin && baths <= bathroomsMax)) return false;
        return true;
    };

    // 매물 유형 및 가격 범위 필터링 적용
    const filteredProperties = properties.filter(property => {
        // 선택된 매물 유형이 없으면 모든 매물 표시
        if (selectedPropertyTypes.size === 0) {
            return false;
        }

        // 매물의 유형이 선택된 유형 중 하나와 일치하는지 확인
        if (property.type && property.type.length > 0) {
            const matchesType = property.type.some(type => selectedPropertyTypes.has(type));
            if (!matchesType) return false;
        }

        // 가격 범위 + 면적/방/욕실 필터 확인
        return matchesPriceFilter(property) && matchesAttrFilter(property);
    });

    const getStatusBadge = (status) => {
        const variants = {
            '판매중': 'primary',
            '판매완료': 'success',
            '임대중': 'warning',
            '임대완료': 'info'
        };
        return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
    };

    // user가 로드되지 않은 경우 로딩 표시
    if (!user) {
        return (
            <Container className="mt-4" style={{ paddingBottom: '80px' }}>
                <Card className="shadow-sm">
                    <Card.Body className="text-center py-5">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3 text-muted">사용자 정보를 불러오는 중...</p>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    // level 2 이하인 경우 접근 제한
    if (user.level <= 2) {
        return (
            <Container className="mt-4" style={{ paddingBottom: '80px' }}>
                <Card className="shadow-sm">
                    <Card.Header className="bg-danger text-white">
                        <h4 className="mb-0">
                            <FaHome className="me-2" />
                            접근 제한
                        </h4>
                    </Card.Header>
                    <Card.Body className="text-center py-5">
                        <div className="mb-4">
                            <FaHome size={64} className="text-muted mb-3" />
                            <h5 className="text-muted">권한이 부족합니다</h5>
                            <p className="text-muted">
                                매물 관리 기능을 이용하려면 레벨 3 이상이 필요합니다.<br />
                                관리자에게 문의하세요.
                            </p>
                        </div>
                    </Card.Body>
                </Card>
            </Container>
        );
    }


    const content = (
        <>
            {/* 알림 메시지 */}
            {error && (
                <Alert variant="danger" onClose={() => setError('')} dismissible>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert variant="success" onClose={() => setSuccess('')} dismissible>
                    {success}
                </Alert>
            )}

            <Card className="shadow-sm">
                <Card.Header className="bg-primary text-white">
                    <h4 className="mb-0">
                        <FaHome className="me-2" />
                        매물 관리
                    </h4>
                </Card.Header>
                <Card.Body className="pb-4">
                    {/* 검색 및 필터 - 모달에서는 숨김 */}
                    {!isModal && (
                        <Row className="mb-3">
                            <Col xs={12} md={4} className="mb-2 mb-md-0">
                                <div className="input-group">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => handleSearchChange(pendingSearchTerm)}
                                        aria-label="검색"
                                    >
                                        <FaSearch />
                                    </button>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="매물명, 주소, 고객명, 연락처로 검색 (여러 조건은 공백으로 구분)"
                                        value={pendingSearchTerm}
                                        onChange={handleSearchInputChange}
                                        onKeyDown={handleSearchKeyDown}
                                        onCompositionStart={handleCompositionStart}
                                        onCompositionEnd={handleCompositionEnd}
                                    />
                                </div>
                            </Col>
                            <Col xs={6} md={2} className="mb-2 mb-md-0">
                                <select
                                    className="form-select"
                                    value={filterType}
                                    onChange={(e) => handleFilterChange(e.target.value)}
                                >
                                    <option value="all">전체</option>
                                    <option value="매매">매매</option>
                                    <option value="월세">월세</option>
                                    <option value="전세">전세</option>
                                    <option value="실거주">실거주</option>
                                </select>
                            </Col>
                            <Col xs={6} md={2} className="mb-2 mb-md-0">
                                <Button
                                    variant="success"
                                    onClick={() => handleShowModal()}
                                    className="w-100"
                                    disabled={loading || !user}
                                >
                                    <FaPlus className="me-2" />
                                    <span className="d-none d-sm-inline">매물 등록</span>
                                    <span className="d-sm-none">등록</span>
                                </Button>
                            </Col>
                            <Col xs={6} md={2} className="mb-2 mb-md-0">
                                <Button
                                    variant="info"
                                    onClick={downloadCSVTemplate}
                                    className="w-100"
                                    disabled={loading}
                                >
                                    <FaDownload className="me-2" />
                                    <span className="d-none d-sm-inline">양식 다운로드</span>
                                    <span className="d-sm-none">양식</span>
                                </Button>
                            </Col>
                            <Col xs={6} md={2} className="mb-2 mb-md-0">
                                <Button
                                    variant="warning"
                                    onClick={() => setShowCSVModal(true)}
                                    className="w-100"
                                    disabled={loading || !user}
                                >
                                    <FaFileCsv className="me-2" />
                                    <span className="d-none d-sm-inline">CSV 업로드</span>
                                    <span className="d-sm-none">CSV</span>
                                </Button>
                            </Col>
                        </Row>
                    )}

                    {/* 매물 유형 및 가격 범위 필터 - 모달에서는 숨김 */}
                    {!isModal && (
                        <Accordion defaultActiveKey="1" className="mb-4">
                            <Accordion.Item eventKey="0">
                                <Accordion.Header>
                                    <h6 className="mb-0">매물 필터</h6>
                                </Accordion.Header>
                                <Accordion.Body>
                                    {/* 매물 유형 필터 */}
                                    <Row className="mb-3">
                                        <Col xs={12}>
                                            <h6 className="mb-2">매물 유형</h6>
                                            <div className="d-flex flex-wrap gap-2 mb-2">
                                                {['월세', '전세', '매매'].map(type => (
                                                    <div key={type} className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            id={`propertyType-${type}`}
                                                            checked={selectedPropertyTypes.has(type)}
                                                            onChange={() => handlePropertyTypeFilterChange(type)}
                                                        />
                                                        <label className="form-check-label" htmlFor={`propertyType-${type}`}>
                                                            {type}
                                                        </label>
                                                    </div>
                                                ))}
                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    onClick={handleSelectAllPropertyTypes}
                                                    className="ms-2"
                                                >
                                                    {selectedPropertyTypes.size === 3 ? '전체 해제' : '전체 선택'}
                                                </Button>
                                            </div>
                                        </Col>
                                    </Row>

                                    {/* 가격 범위 필터 (간단/고급 토글) */}
                                    <Row>
                                        <Col xs={12}>
                                            <h6 className="mb-3">가격 범위 필터</h6>
                                            <small className="text-muted mb-3 d-block">
                                                💡 숫자 입력 시 '억', '천만', '만' 단위를 사용할 수 있습니다. '적용' 버튼을 눌러야 반영됩니다.
                                            </small>

                                            <Row>
                                                {/* 매매 가격 필터 */}
                                                {selectedPropertyTypes.has('매매') && (
                                                    <Col xs={12} lg={6} className="mb-3">
                                                        <div className="border rounded p-3">
                                                            <h6 className="mb-3 text-primary">매매</h6>
                                                            <Row>
                                                                <Col xs={12} md={6}>
                                                                    <div className="mb-2">
                                                                        <label className="form-label small">최소가격</label>
                                                                        <Form.Range
                                                                            min="0"
                                                                            max="10000000000"
                                                                            step="10000000"
                                                                            value={sliderValues.매매.min}
                                                                            onChange={(e) => handleSliderChange('매매', 'min', e.target.value)}
                                                                            className="mb-2"
                                                                        />
                                                                        <div className="d-flex gap-2">
                                                                            <Form.Control
                                                                                type="text"
                                                                                placeholder="최소가격 (예: 1억)"
                                                                                value={formatAppliedPrice(tempPriceFilters.매매.min)}
                                                                                onChange={(e) => handleTempPriceFilterChange('매매', 'min', e.target.value)}
                                                                                className="flex-grow-1"
                                                                            />
                                                                            <div className="text-muted small d-flex align-items-center">
                                                                                {formatPriceForDisplay(tempPriceFilters.매매.min)}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </Col>
                                                                <Col xs={12} md={6}>
                                                                    <div className="mb-2">
                                                                        <label className="form-label small">최대가격</label>
                                                                        <Form.Range
                                                                            min="0"
                                                                            max="10000000000"
                                                                            step="10000000"
                                                                            value={sliderValues.매매.max}
                                                                            onChange={(e) => handleSliderChange('매매', 'max', e.target.value)}
                                                                            className="mb-2"
                                                                        />
                                                                        <div className="d-flex gap-2">
                                                                            <Form.Control
                                                                                type="text"
                                                                                placeholder="최대가격 (예: 5억)"
                                                                                value={formatAppliedPrice(tempPriceFilters.매매.max)}
                                                                                onChange={(e) => handleTempPriceFilterChange('매매', 'max', e.target.value)}
                                                                                className="flex-grow-1"
                                                                            />
                                                                            <div className="text-muted small d-flex align-items-center">
                                                                                {formatPriceForDisplay(tempPriceFilters.매매.max)}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </Col>
                                                            </Row>
                                                        </div>
                                                    </Col>
                                                )}
                                                {/* 전세 가격 필터 */}
                                                {selectedPropertyTypes.has('전세') && (
                                                    <Col xs={12} lg={6} className="mb-3">
                                                        <div className="border rounded p-3">
                                                            <h6 className="mb-3 text-warning">전세</h6>
                                                            <Row>
                                                                <Col xs={12} md={6}>
                                                                    <div className="mb-2">
                                                                        <label className="form-label small">최소가격</label>
                                                                        <Form.Range
                                                                            min="0"
                                                                            max="10000000000"
                                                                            step="10000000"
                                                                            value={sliderValues.전세.min}
                                                                            onChange={(e) => handleSliderChange('전세', 'min', e.target.value)}
                                                                            className="mb-2"
                                                                        />
                                                                        <div className="d-flex gap-2">
                                                                            <Form.Control
                                                                                type="text"
                                                                                placeholder="최소가격 (예: 1억)"
                                                                                value={formatAppliedPrice(tempPriceFilters.전세.min)}
                                                                                onChange={(e) => handleTempPriceFilterChange('전세', 'min', e.target.value)}
                                                                                className="flex-grow-1"
                                                                            />
                                                                            <div className="text-muted small d-flex align-items-center">
                                                                                {formatPriceForDisplay(tempPriceFilters.전세.min)}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </Col>
                                                                <Col xs={12} md={6}>
                                                                    <div className="mb-2">
                                                                        <label className="form-label small">최대가격</label>
                                                                        <Form.Range
                                                                            min="0"
                                                                            max="10000000000"
                                                                            step="10000000"
                                                                            value={sliderValues.전세.max}
                                                                            onChange={(e) => handleSliderChange('전세', 'max', e.target.value)}
                                                                            className="mb-2"
                                                                        />
                                                                        <div className="d-flex gap-2">
                                                                            <Form.Control
                                                                                type="text"
                                                                                placeholder="최대가격 (예: 5억)"
                                                                                value={formatAppliedPrice(tempPriceFilters.전세.max)}
                                                                                onChange={(e) => handleTempPriceFilterChange('전세', 'max', e.target.value)}
                                                                                className="flex-grow-1"
                                                                            />
                                                                            <div className="text-muted small d-flex align-items-center">
                                                                                {formatPriceForDisplay(tempPriceFilters.전세.max)}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </Col>
                                                            </Row>
                                                        </div>
                                                    </Col>
                                                )}
                                                {/* 월세 가격 필터 */}
                                                {selectedPropertyTypes.has('월세') && (
                                                    <Col xs={12} lg={6} className="mb-3">
                                                        <div className="border rounded p-3">
                                                            <h6 className="mb-3 text-success">월세</h6>
                                                            <Row>
                                                                <Col xs={12} md={6}>
                                                                    <div className="mb-2">
                                                                        <label className="form-label small">보증금 최소</label>
                                                                        <Form.Range
                                                                            min="0"
                                                                            max="1000000000"
                                                                            step="1000000"
                                                                            value={sliderValues.월세.depositMin}
                                                                            onChange={(e) => handleSliderChange('월세', 'depositMin', e.target.value)}
                                                                            className="mb-2"
                                                                        />
                                                                        <div className="d-flex gap-2">
                                                                            <Form.Control
                                                                                type="text"
                                                                                placeholder="보증금 최소 (예: 1000만)"
                                                                                value={formatAppliedPrice(tempPriceFilters.월세.depositMin)}
                                                                                onChange={(e) => handleTempPriceFilterChange('월세', 'depositMin', e.target.value)}
                                                                                className="flex-grow-1"
                                                                            />
                                                                            <div className="text-muted small d-flex align-items-center">
                                                                                {formatPriceForDisplay(tempPriceFilters.월세.depositMin)}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </Col>
                                                                <Col xs={12} md={6}>
                                                                    <div className="mb-2">
                                                                        <label className="form-label small">보증금 최대</label>
                                                                        <Form.Range
                                                                            min="0"
                                                                            max="1000000000"
                                                                            step="1000000"
                                                                            value={sliderValues.월세.depositMax}
                                                                            onChange={(e) => handleSliderChange('월세', 'depositMax', e.target.value)}
                                                                            className="mb-2"
                                                                        />
                                                                        <div className="d-flex gap-2">
                                                                            <Form.Control
                                                                                type="text"
                                                                                placeholder="보증금 최대 (예: 1억)"
                                                                                value={formatAppliedPrice(tempPriceFilters.월세.depositMax)}
                                                                                onChange={(e) => handleTempPriceFilterChange('월세', 'depositMax', e.target.value)}
                                                                                className="flex-grow-1"
                                                                            />
                                                                            <div className="text-muted small d-flex align-items-center">
                                                                                {formatPriceForDisplay(tempPriceFilters.월세.depositMax)}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </Col>
                                                                <Col xs={12} md={6}>
                                                                    <div className="mb-2">
                                                                        <label className="form-label small">월세 최소</label>
                                                                        <Form.Range
                                                                            min="0"
                                                                            max="10000000"
                                                                            step="10000"
                                                                            value={sliderValues.월세.rentMin}
                                                                            onChange={(e) => handleSliderChange('월세', 'rentMin', e.target.value)}
                                                                            className="mb-2"
                                                                        />
                                                                        <div className="d-flex gap-2">
                                                                            <Form.Control
                                                                                type="text"
                                                                                placeholder="월세 최소 (예: 50만)"
                                                                                value={formatAppliedPrice(tempPriceFilters.월세.rentMin)}
                                                                                onChange={(e) => handleTempPriceFilterChange('월세', 'rentMin', e.target.value)}
                                                                                className="flex-grow-1"
                                                                            />
                                                                            <div className="text-muted small d-flex align-items-center">
                                                                                {formatPriceForDisplay(tempPriceFilters.월세.rentMin)}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </Col>
                                                                <Col xs={12} md={6}>
                                                                    <div className="mb-2">
                                                                        <label className="form-label small">월세 최대</label>
                                                                        <Form.Range
                                                                            min="0"
                                                                            max="10000000"
                                                                            step="10000"
                                                                            value={sliderValues.월세.rentMax}
                                                                            onChange={(e) => handleSliderChange('월세', 'rentMax', e.target.value)}
                                                                            className="mb-2"
                                                                        />
                                                                        <div className="d-flex gap-2">
                                                                            <Form.Control
                                                                                type="text"
                                                                                placeholder="월세 최대 (예: 200만)"
                                                                                value={formatAppliedPrice(tempPriceFilters.월세.rentMax)}
                                                                                onChange={(e) => handleTempPriceFilterChange('월세', 'rentMax', e.target.value)}
                                                                                className="flex-grow-1"
                                                                            />
                                                                            <div className="text-muted small d-flex align-items-center">
                                                                                {formatPriceForDisplay(tempPriceFilters.월세.rentMax)}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </Col>
                                                            </Row>
                                                        </div>
                                                    </Col>
                                                )}

                                                {/* 면적 / 방 / 욕실 필터 */}

                                                <Col xs={12} lg={6} className="mb-3">
                                                    <h6 className="mb-3">면적 / 방 / 욕실</h6>
                                                    <Row className="g-3">
                                                        <Col xs={12} md={12}>
                                                            <div className="border rounded p-3 h-100">
                                                                <label className="form-label small">면적 (㎡)</label>
                                                                <div className="d-flex align-items-center gap-2">
                                                                    <Form.Control
                                                                        type="text"
                                                                        inputMode="numeric"
                                                                        placeholder="최소"
                                                                        value={tempAttrFilters.areaMin}
                                                                        onChange={(e) => handleTempAttrChange('areaMin', e.target.value)}
                                                                    />
                                                                    <span className="text-muted">~</span>
                                                                    <Form.Control
                                                                        type="text"
                                                                        inputMode="numeric"
                                                                        placeholder="최대"
                                                                        value={tempAttrFilters.areaMax}
                                                                        onChange={(e) => handleTempAttrChange('areaMax', e.target.value)}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </Col>
                                                        <Col xs={12} md={12}>
                                                            <div className="border rounded p-3 h-100">
                                                                <label className="form-label small">방 개수</label>
                                                                <div className="d-flex align-items-center gap-2">
                                                                    <Form.Control
                                                                        type="text"
                                                                        inputMode="numeric"
                                                                        placeholder="최소"
                                                                        value={tempAttrFilters.roomsMin}
                                                                        onChange={(e) => handleTempAttrChange('roomsMin', e.target.value)}
                                                                    />
                                                                    <span className="text-muted">~</span>
                                                                    <Form.Control
                                                                        type="text"
                                                                        inputMode="numeric"
                                                                        placeholder="최대"
                                                                        value={tempAttrFilters.roomsMax}
                                                                        onChange={(e) => handleTempAttrChange('roomsMax', e.target.value)}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </Col>
                                                        <Col xs={12} md={12}>
                                                            <div className="border rounded p-3 h-100">
                                                                <label className="form-label small">욕실 개수</label>
                                                                <div className="d-flex align-items-center gap-2">
                                                                    <Form.Control
                                                                        type="text"
                                                                        inputMode="numeric"
                                                                        placeholder="최소"
                                                                        value={tempAttrFilters.bathroomsMin}
                                                                        onChange={(e) => handleTempAttrChange('bathroomsMin', e.target.value)}
                                                                    />
                                                                    <span className="text-muted">~</span>
                                                                    <Form.Control
                                                                        type="text"
                                                                        inputMode="numeric"
                                                                        placeholder="최대"
                                                                        value={tempAttrFilters.bathroomsMax}
                                                                        onChange={(e) => handleTempAttrChange('bathroomsMax', e.target.value)}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                </Col>

                                            </Row>

                                            {/* 필터 적용/초기화 버튼 */}
                                            <Row className="mt-3">
                                                <Col xs={12}>
                                                    <div className="d-flex gap-2">
                                                        <Button
                                                            variant="primary"
                                                            onClick={handleApplyPriceFilters}
                                                            className="flex-grow-1"
                                                        >
                                                            필터 적용
                                                        </Button>
                                                        <Button
                                                            variant="outline-secondary"
                                                            onClick={handleClearPriceFilters}
                                                            className="flex-grow-1"
                                                        >
                                                            필터 초기화
                                                        </Button>
                                                    </div>
                                                </Col>
                                            </Row>

                                            {/* 필터 결과 정보 */}
                                            <Row className="mt-3">
                                                <Col xs={12}>
                                                    <div className="bg-light p-2 rounded">
                                                        <small className="text-muted">
                                                            <strong>필터 결과:</strong> {filteredProperties.length}개의 매물이 표시됩니다
                                                            {selectedPropertyTypes.size > 0 && (
                                                                <span className="ms-2">
                                                                    (선택된 유형: {Array.from(selectedPropertyTypes).join(', ')})
                                                                </span>
                                                            )}
                                                            {Object.values(appliedPriceFilters).some(filter =>
                                                                Object.values(filter).some(value => value !== '')
                                                            ) && (
                                                                    <span className="ms-2">
                                                                        | 가격 범위 필터 적용됨
                                                                    </span>
                                                                )}
                                                        </small>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>


                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>
                    )}

                    {/* 매물 목록 */}
                    {loading ? (
                        <div className="text-center py-4">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <Table responsive hover className="table-sm mb-4">
                            <thead className="table-light">
                                <tr>
                                    <th className="d-none d-md-table-cell">매물명</th>
                                    <th className="d-none d-md-table-cell">유형</th>
                                    <th className="d-none d-md-table-cell">가격</th>
                                    <th className="d-none d-md-table-cell">면적</th>
                                    <th className="d-none d-md-table-cell">방/욕실</th>
                                    <th className="d-none d-md-table-cell">등록일</th>
                                    <th className="d-none d-md-table-cell">고객 정보</th>
                                    <th className="d-none d-md-table-cell">편의시설</th>
                                    <th className="d-none d-md-table-cell">게시자</th>
                                    <th className="d-none d-md-table-cell">관리</th>
                                    <th className="d-md-none">매물 정보</th>
                                </tr>
                            </thead>
                            <tbody>
                                {getCurrentPageData(filteredProperties, currentPage).map(property => (
                                    <tr
                                        key={property._id}
                                        className="mb-2"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleShowHistoryModal(property)}
                                        onMouseEnter={(e) => e.target.closest('tr').style.backgroundColor = '#f8f9fa'}
                                        onMouseLeave={(e) => e.target.closest('tr').style.backgroundColor = ''}
                                    >
                                        {/* 데스크톱 버전 */}
                                        <td className="d-none d-md-table-cell">
                                            <strong>{property.title}</strong>
                                            <div>
                                                {property.isDeleted ? (
                                                    <Badge bg="danger">삭제됨</Badge>
                                                ) : (
                                                    getStatusBadge(property.status)
                                                )}
                                            </div>

                                        </td>
                                        <td className="d-none d-md-table-cell">
                                            {Array.isArray(property.type) ? (
                                                <div>
                                                    {property.type.map((type, index) => (
                                                        <Badge
                                                            key={index}
                                                            bg={type === '매매' ? 'primary' : type === '월세' ? 'warning' : type === '전세' ? 'info' : 'secondary'}
                                                            className="me-1"
                                                        >
                                                            {type}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            ) : (
                                                <Badge bg={property.type === '매매' ? 'primary' : 'warning'}>
                                                    {property.type}
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="d-none d-md-table-cell">
                                            {Array.isArray(property.type) && property.type.includes('실거주') ? (
                                                <div className="text-muted">
                                                    <small>실거주</small>
                                                </div>
                                            ) : (
                                                <div>
                                                    {getPropertyPricesDisplay(property) !== '가격 정보 없음' && (
                                                        <div>
                                                            {Array.isArray(getPropertyPricesDisplay(property)) ?
                                                                getPropertyPricesDisplay(property).map((price, index) => (
                                                                    <div key={index} className="mb-1">
                                                                        <span className="text-muted small">{price}</span>
                                                                    </div>
                                                                )) :
                                                                <div className="mb-1">
                                                                    <span className="text-muted small">{getPropertyPricesDisplay(property)}</span>
                                                                </div>
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="d-none d-md-table-cell">{property.area}</td>
                                        <td className="d-none d-md-table-cell">{property.rooms} / {property.bathrooms}</td>
                                        <td className="d-none d-md-table-cell">{new Date(property.createdAt).toLocaleDateString()}</td>
                                        <td className="d-none d-md-table-cell">
                                            {property.customer ? (
                                                <div>
                                                    <small className="text-muted">
                                                        {property.customer.name}
                                                    </small>
                                                    <br />
                                                    <small className="text-muted">
                                                        {property.customer.phone}
                                                    </small>
                                                </div>
                                            ) : (
                                                <small className="text-muted">미등록</small>
                                            )}
                                        </td>
                                        <td className="d-none d-md-table-cell text-center">
                                            <div className="d-flex flex-column gap-1">
                                                <div className="d-flex align-items-center">
                                                    <FaCar size={20} className={`me-1 ${property.parking === '가능' ? 'text-success' : property.parking === '불가능' ? 'text-danger' : 'text-muted'}`} />
                                                </div>
                                                <div className="d-flex align-items-center">
                                                    <FaDog size={20} className={`me-1 ${property.pets === '가능' ? 'text-success' : property.pets === '불가능' ? 'text-danger' : 'text-muted'}`} />
                                                </div>
                                                <div className="d-flex align-items-center">
                                                    <FaElevator size={20} className={`me-1 ${property.elevator === '있음' ? 'text-success' : property.elevator === '없음' ? 'text-danger' : 'text-muted'}`} />
                                                </div>
                                            </div>
                                        </td>

                                        <td className="d-none d-md-table-cell">
                                            <small className="text-muted">
                                                {(() => {


                                                    // 게시자 정보가 있는 경우
                                                    if (property.publisher && property.publisher._id) {
                                                        const displayName = property.publisher.name ||
                                                            property.publisher.nickname ||
                                                            property.publisher.email ||
                                                            '이름 없음';
                                                        return (
                                                            <>
                                                                <div className="fw-bold">{displayName}</div>

                                                                {property.publisher._id === user?._id && (
                                                                    <Badge bg="primary" className="ms-1">본인</Badge>
                                                                )}
                                                                {property.byCompanyNumber === user?.businessNumber && property.publisher._id !== user?._id && (
                                                                    <Badge bg="info" className="ms-1">동료</Badge>
                                                                )}
                                                            </>
                                                        );
                                                    }

                                                    // 게시자 정보가 없는 경우
                                                    return (
                                                        <div className="text-danger">
                                                            <div className="fw-bold">게시자 정보 없음</div>
                                                            <small className="text-muted">
                                                                ID: {property.publisher || 'ObjectId 없음'}
                                                            </small>
                                                            <br />
                                                            <small className="text-warning">
                                                                ※ 데이터베이스에서 해당 사용자를 찾을 수 없습니다
                                                            </small>
                                                        </div>
                                                    );
                                                })()}
                                            </small>
                                        </td>
                                        <td className="d-none d-md-table-cell">
                                            {user && (
                                                <>
                                                    <div className="d-flex justify-content-between">
                                                        {/* 수정 권한: 본인 매물이거나 같은 사업자번호의 매물, 또는 레벨 99 전체 관리자 */}
                                                        {(property.publisher?._id === user._id ||
                                                            (user.level >= 5 && property.byCompanyNumber === user.businessNumber) ||
                                                            user.level >= 99) && (
                                                                <Button
                                                                    variant="outline-primary"
                                                                    size="sm"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleShowModal(property);
                                                                    }}
                                                                >
                                                                    <FaEdit />
                                                                </Button>
                                                            )}
                                                        {/* 삭제 권한: 본인 매물이거나 같은 사업자번호의 매물, 또는 레벨 11 이상 */}
                                                        {(property.publisher?._id === user._id ||
                                                            (user.level >= 5 && property.byCompanyNumber === user.businessNumber) ||
                                                            user.level >= 11) && (
                                                                <Button
                                                                    variant="outline-danger"
                                                                    size="sm"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDelete(property._id);
                                                                    }}
                                                                >
                                                                    <FaTrash />
                                                                </Button>
                                                            )}

                                                    </div>
                                                </>
                                            )}
                                        </td>

                                        {/* 모바일 버전 */}
                                        <td className="d-md-none">
                                            <div className="d-flex justify-content-between align-items-start py-5">
                                                <div className="flex-grow-1">
                                                    <div className="fw-bold mb-1">{property.title}</div>
                                                    <div className="small text-muted mb-1">
                                                        {Array.isArray(property.type) ? (
                                                            <div>
                                                                {property.type.map((type, index) => (
                                                                    <Badge
                                                                        key={index}
                                                                        bg={type === '매매' ? 'primary' : type === '월세' ? 'warning' : type === '전세' ? 'info' : 'secondary'}
                                                                        className="me-1"
                                                                    >
                                                                        {type}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <Badge bg={property.type === '매매' ? 'primary' : 'warning'}>
                                                                {property.type}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div>
                                                        {property.customer ? (
                                                            <div>
                                                                <small className="text-muted">
                                                                    {property.customer.name}
                                                                </small>
                                                                <br />
                                                                <small className="text-muted">
                                                                    {property.customer.phone}
                                                                </small>
                                                            </div>
                                                        ) : (
                                                            <small className="text-muted">미등록</small>
                                                        )}
                                                    </div>
                                                    <div className="small mb-2">
                                                        {Array.isArray(property.type) && property.type.includes('실거주') ? (
                                                            <div className="text-muted">
                                                                <small>실거주</small>
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                <FaMoneyBillWave className="text-success me-1" />
                                                                {getPropertyPricesDisplay(property) !== '가격 정보 없음' && (
                                                                    <div>
                                                                        {Array.isArray(getPropertyPricesDisplay(property)) ?
                                                                            getPropertyPricesDisplay(property).map((price, index) => (
                                                                                <div key={index} className="mb-1">
                                                                                    <span className="text-muted small">{price}</span>
                                                                                </div>
                                                                            )) :
                                                                            <div className="mb-1">
                                                                                <span className="text-muted small">{getPropertyPricesDisplay(property)}</span>
                                                                            </div>
                                                                        }
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="small text-muted mb-2">
                                                        <FaMapMarkerAlt className="text-muted me-1" />
                                                        {property.address}
                                                    </div>
                                                    <div className="small text-muted mb-2">
                                                        {property.rooms} / {property.bathrooms} | {property.area}
                                                    </div>
                                                    <div className="small mt-2">
                                                        <div className="d-flex align-items-center mb-1">
                                                            <FaCar className={`me-1 ${property.parking === '가능' ? 'text-success' : property.parking === '불가능' ? 'text-danger' : 'text-muted'}`} />
                                                            <span className={property.parking === '가능' ? 'text-success' : property.parking === '불가능' ? 'text-danger' : 'text-muted'}>
                                                                {property.parking || '별도문의'}
                                                            </span>
                                                        </div>
                                                        <div className="d-flex align-items-center mb-1">
                                                            <FaDog className={`me-1 ${property.pets === '가능' ? 'text-success' : property.pets === '불가능' ? 'text-danger' : 'text-muted'}`} />
                                                            <span className={property.pets === '가능' ? 'text-success' : property.pets === '불가능' ? 'text-danger' : 'text-muted'}>
                                                                {property.pets || '별도문의'}
                                                            </span>
                                                        </div>
                                                        <div className="d-flex align-items-center">
                                                            <FaElevator className={`me-1 ${property.elevator === '있음' ? 'text-success' : property.elevator === '없음' ? 'text-danger' : 'text-muted'}`} />
                                                            <span className={property.elevator === '있음' ? 'text-success' : property.elevator === '없음' ? 'text-danger' : 'text-muted'}>
                                                                {property.elevator || '별도문의'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {property.specialNotes && (
                                                        <div className="small text-muted mt-2">
                                                            <strong>특이사항:</strong> {property.specialNotes.length > 30
                                                                ? `${property.specialNotes.substring(0, 30)}...`
                                                                : property.specialNotes}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ms-3">
                                                    {user && (
                                                        <div className="d-flex flex-column gap-2">
                                                            {/* 수정 권한: 본인 매물이거나 같은 사업자번호의 매물, 또는 레벨 5 이상 */}
                                                            {(property.publisher?._id === user._id ||
                                                                (user.level >= 5 && property.byCompanyNumber === user.businessNumber) ||
                                                                user.level >= 5) && (
                                                                    <Button
                                                                        variant="outline-primary"
                                                                        size="sm"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleShowModal(property);
                                                                        }}
                                                                    >
                                                                        <FaEdit />
                                                                    </Button>
                                                                )}
                                                            {/* 삭제 권한: 본인 매물이거나 같은 사업자번호의 매물, 또는 레벨 11 이상 */}
                                                            {(property.publisher?._id === user._id ||
                                                                (user.level >= 5 && property.byCompanyNumber === user.businessNumber) ||
                                                                user.level >= 11) && (
                                                                    <Button
                                                                        variant="outline-danger"
                                                                        size="sm"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDelete(property._id);
                                                                        }}
                                                                    >
                                                                        <FaTrash />
                                                                    </Button>
                                                                )}

                                                        </div>
                                                    )}
                                                    <div className="mt-2">
                                                        <small className="text-muted">
                                                            행을 클릭하여 히스토리 보기
                                                        </small>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}

                    {/* 페이지네이션 */}
                    {!loading && (
                        <div className="d-flex justify-content-center mt-3">
                            <Pagination className="mb-0">
                                {createPropertyPagination(
                                    currentPage,
                                    getTotalPages(filteredProperties),
                                    setCurrentPage,
                                    'property-management'
                                )}
                            </Pagination>
                        </div>
                    )}

                    {!loading && filteredProperties.length > 0 && (
                        <div className="text-center text-muted small mt-2">
                            총 {filteredProperties.length}개 중 {((currentPage - 1) * itemsPerPage) + 1}~{Math.min(currentPage * itemsPerPage, filteredProperties.length)}개 표시
                        </div>
                    )}

                    {!loading && filteredProperties.length === 0 && (
                        <div className="text-center py-4">
                            <FaHome size={48} className="text-muted mb-3" />
                            <p className="text-muted">등록된 매물이 없습니다.</p>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* 매물 등록/수정 모달 */}
            <PropertyRegistrationModal
                showModal={showModal}
                onHide={handleCloseModal}
                editingProperty={editingProperty}
                onSuccess={handlePropertySuccess}
                loading={loading}
            />

            {/* 매물 히스토리 모달 */}
            <PropertyHistoryModal
                showModal={showHistoryModal}
                onHide={handleCloseHistoryModal}
                property={selectedProperty}
            />

            {/* CSV 업로드 모달 */}
            <PropertyCSVUploadModal
                showModal={showCSVModal}
                onHide={() => setShowCSVModal(false)}
                onSuccess={fetchProperties}
            />
        </>
    );

    // 모달에서 사용할 때는 Container 없이 반환
    if (isModal) {
        return content;
    }

    // 일반 페이지에서는 Container로 감싸서 반환
    return (
        <Container className="mt-4" style={{ paddingBottom: '80px' }}>
            {content}
        </Container>
    );
};

export default PropertyManagement; 