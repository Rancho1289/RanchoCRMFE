import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const PrivacyPolicy = ({ showModal, onHide, onAgree, title = "개인정보처리방침" }) => {
    return (
        <Modal show={showModal} onHide={onHide} size="lg" scrollable>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <div className="terms-content">
                    <h5>개인정보처리방침 (초안)</h5>
                    <p>○○○(이하 "회사"라 합니다)는 「개인정보 보호법」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등 관련 법령을 준수하며, 이용자의 개인정보를 안전하게 관리하기 위해 다음과 같이 개인정보처리방침을 수립·공개합니다.</p>

                    <h6>제1조 (개인정보의 수집 항목 및 방법)</h6>
                    <h6>수집 항목</h6>
                    <ul>
                        <li><strong>회원 가입 시:</strong> 성명, 사업자등록번호, 공인중개사 자격번호, 연락처(휴대전화, 이메일), 로그인 ID, 비밀번호</li>
                        <li><strong>서비스 이용 시:</strong> 매도·매수 고객의 성명, 연락처, 거래 희망 정보, 기념일 정보</li>
                        <li><strong>결제 시:</strong> 신용카드번호, 계좌번호, 결제 기록</li>
                        <li><strong>자동 수집 항목:</strong> IP 주소, 쿠키, 접속 로그, 서비스 이용 기록</li>
                    </ul>

                    <h6>수집 방법</h6>
                    <ul>
                        <li>홈페이지(회원가입, 서비스 이용 과정)</li>
                        <li>고객센터 상담</li>
                        <li>제휴사로부터의 제공 (회원 동의 시)</li>
                    </ul>

                    <h6>제2조 (개인정보의 수집 및 이용 목적)</h6>
                    <p>회사는 수집한 개인정보를 다음의 목적을 위해 이용합니다.</p>
                    <ul>
                        <li><strong>서비스 제공:</strong> 고객 DB 관리, 단체문자 발송, 거래이력 저장, 자료 백업 등</li>
                        <li><strong>회원 관리:</strong> 본인 확인, 회원 식별, 부정이용 방지</li>
                        <li><strong>요금 정산:</strong> 서비스 이용료 결제, 청구서 발송, 환불 처리</li>
                        <li><strong>마케팅 및 광고:</strong> 신규 서비스 안내, 이벤트 정보 제공 (사전 동의 시)</li>
                        <li><strong>법적 의무 준수:</strong> 세무 신고, 관계기관 요청 대응</li>
                    </ul>

                    <h6>제3조 (개인정보의 보유 및 이용 기간)</h6>
                    <p>회사는 개인정보 수집·이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.</p>
                    <p>단, 다음의 경우에는 명시한 기간 동안 보관합니다.</p>
                    <ul>
                        <li>거래 기록, 결제 기록: 5년 (전자상거래법)</li>
                        <li>계약 또는 청약철회 기록: 5년 (전자상거래법)</li>
                        <li>소비자 불만·분쟁 처리 기록: 3년 (전자상거래법)</li>
                        <li>로그 기록, 접속지 IP 정보: 3개월 (통신비밀보호법)</li>
                    </ul>

                    <h6>제4조 (개인정보의 제3자 제공)</h6>
                    <p>회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다.</p>
                    <p>다만, 다음의 경우에는 예외로 합니다.</p>
                    <ul>
                        <li>이용자가 사전에 동의한 경우</li>
                        <li>법령에 의거하거나 수사기관의 요청이 있는 경우</li>
                    </ul>

                    <h6>제5조 (개인정보의 처리 위탁)</h6>
                    <p>회사는 원활한 서비스 제공을 위해 다음과 같이 개인정보 처리를 위탁할 수 있습니다.</p>
                    <div className="table-responsive">
                        <table className="table table-bordered table-sm">
                            <thead>
                                <tr>
                                    <th>수탁자</th>
                                    <th>위탁 업무</th>
                                    <th>보유·이용 기간</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>○○ 결제대행사</td>
                                    <td>결제 처리</td>
                                    <td>위탁 계약 종료 시까지</td>
                                </tr>
                                <tr>
                                    <td>○○ 문자발송사</td>
                                    <td>단체문자 발송</td>
                                    <td>위탁 계약 종료 시까지</td>
                                </tr>
                                <tr>
                                    <td>○○ 클라우드사</td>
                                    <td>데이터 저장 및 백업</td>
                                    <td>위탁 계약 종료 시까지</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p><em>※ 회사는 위탁 계약 체결 시 「개인정보 보호법」 제26조에 따라 개인정보의 안전한 관리를 위해 필요한 사항을 규정합니다.</em></p>

                    <h6>제6조 (정보주체의 권리·의무 및 행사 방법)</h6>
                    <ul>
                        <li>회원은 언제든지 자신의 개인정보를 열람·정정·삭제·처리정지를 요청할 수 있습니다.</li>
                        <li>권리 행사는 이메일, 고객센터 등을 통해 가능합니다.</li>
                        <li>법정대리인을 통한 권리 행사도 가능합니다.</li>
                    </ul>

                    <h6>제7조 (개인정보의 파기 절차 및 방법)</h6>
                    <ul>
                        <li><strong>파기 절차:</strong> 보유 기간이 경과하거나 처리 목적이 달성된 개인정보는 내부 방침에 따라 파기합니다.</li>
                        <li><strong>파기 방법:</strong> 전자적 파일은 복구 불가능한 방법으로 삭제, 종이 문서는 분쇄 또는 소각</li>
                    </ul>

                    <h6>제8조 (개인정보의 안전성 확보 조치)</h6>
                    <p>회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취합니다.</p>
                    <ul>
                        <li><strong>관리적 조치:</strong> 내부관리계획 수립·시행, 정기 교육</li>
                        <li><strong>기술적 조치:</strong> 접근권한 제한, 암호화, 보안프로그램 설치</li>
                        <li><strong>물리적 조치:</strong> 전산실, 자료보관실 접근 통제</li>
                    </ul>

                    <h6>제9조 (쿠키의 설치·운영 및 거부)</h6>
                    <ul>
                        <li>회사는 이용자 맞춤형 서비스를 제공하기 위해 쿠키를 사용할 수 있습니다.</li>
                        <li>이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있습니다.</li>
                    </ul>

                    <h6>제10조 (개인정보 보호책임자)</h6>
                    <ul>
                        <li><strong>성명:</strong> [담당자 성명]</li>
                        <li><strong>직책:</strong> 개인정보 보호책임자</li>
                        <li><strong>연락처:</strong> [전화번호 / 이메일]</li>
                    </ul>

                    <h6>제11조 (개인정보처리방침 변경)</h6>
                    <ul>
                        <li>본 방침은 시행일로부터 적용됩니다.</li>
                        <li>변경 시 최소 7일 전에 공지하며, 중대한 변경의 경우 최소 30일 전에 공지합니다.</li>
                    </ul>
                </div>
            </Modal.Body>
            <Modal.Footer>
                {onAgree && (
                    <Button variant="primary" onClick={onAgree}>
                        동의합니다
                    </Button>
                )}
                <Button variant="secondary" onClick={onHide}>
                    닫기
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default PrivacyPolicy; 