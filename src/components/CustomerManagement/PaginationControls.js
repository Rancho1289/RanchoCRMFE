import React from 'react';
import { FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';

const PaginationControls = ({
    currentPage,
    totalPages,
    onFirst,
    onPrev,
    onPage,
    onNext,
    onLast
}) => {
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5;
        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
        } else {
            let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
            let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
            if (endPage - startPage + 1 < maxVisiblePages) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }
            for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
        }
        return pageNumbers;
    };

    if (totalPages <= 1) return null;

    return (
        <div className="d-flex justify-content-center mt-4">
            <nav aria-label="고객 목록 페이지네이션">
                <ul className="pagination pagination-sm">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" style={{ pointerEvents: 'auto', zIndex: 10 }} onClick={onFirst} disabled={currentPage === 1} aria-label="첫 페이지">
                            <FaAngleDoubleLeft />
                        </button>
                    </li>
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" style={{ pointerEvents: 'auto', zIndex: 10 }} onClick={onPrev} disabled={currentPage === 1} aria-label="이전 페이지">
                            <FaChevronLeft />
                        </button>
                    </li>
                    {getPageNumbers().map(pageNumber => (
                        <li key={pageNumber} className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}>
                            <button className="page-link" style={{ pointerEvents: 'auto', zIndex: 10 }} onClick={() => onPage(pageNumber)}>
                                {pageNumber}
                            </button>
                        </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button className="page-link" style={{ pointerEvents: 'auto', zIndex: 10 }} onClick={onNext} disabled={currentPage === totalPages} aria-label="다음 페이지">
                            <FaChevronRight />
                        </button>
                    </li>
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button className="page-link" style={{ pointerEvents: 'auto', zIndex: 10 }} onClick={onLast} disabled={currentPage === totalPages} aria-label="마지막 페이지">
                            <FaAngleDoubleRight />
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default PaginationControls;


