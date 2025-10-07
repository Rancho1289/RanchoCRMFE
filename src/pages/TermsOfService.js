import React from 'react';
import { Container } from 'react-bootstrap';

const TermsOfService = () => {
    const styles = {
        container: {
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        },
        wrapper: {
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '20px'
        },
        header: {
            textAlign: 'center',
            marginBottom: '40px',
            color: 'white'
        },
        title: {
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '10px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        },
        subtitle: {
            fontSize: '1.2rem',
            opacity: '0.9',
            fontWeight: '300'
        },
        contentCard: {
            background: 'white',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.2)'
        },
        content: {
            padding: '40px',
            lineHeight: '1.8',
            fontSize: '1rem'
        },
        section: {
            marginBottom: '30px'
        },
        sectionTitle: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#374151',
            marginBottom: '15px',
            borderBottom: '2px solid #e5e7eb',
            paddingBottom: '10px'
        },
        sectionContent: {
            color: '#4b5563',
            marginBottom: '15px'
        },
        list: {
            marginLeft: '20px',
            marginBottom: '15px'
        },
        listItem: {
            marginBottom: '8px'
        },
        highlight: {
            backgroundColor: '#fef3c7',
            padding: '15px',
            borderRadius: '8px',
            border: '1px solid #f59e0b',
            marginBottom: '20px'
        },
        date: {
            textAlign: 'center',
            color: '#6b7280',
            fontSize: '0.9rem',
            marginTop: '30px',
            paddingTop: '20px',
            borderTop: '1px solid #e5e7eb'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.wrapper}>
                {/* Header */}
                <div style={styles.header}>
                    <h1 style={styles.title}>이용약관</h1>
                    <p style={styles.subtitle}>
                        부동산 CRM 시스템 이용약관
                    </p>
                </div>

                {/* Content */}
                <div style={styles.contentCard}>
                    <div style={styles.content}>
                        <div style={styles.section}>
                            <h2 style={styles.sectionTitle}>제1조 (목적)</h2>
                            <div style={styles.sectionContent}>
                                본 약관은 부동산 CRM 시스템(이하 "서비스")의 이용과 관련하여 서비스 제공자와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
                            </div>
                        </div>

                        <div style={styles.section}>
                            <h2 style={styles.sectionTitle}>제2조 (정의)</h2>
                            <div style={styles.sectionContent}>
                                <div style={styles.list}>
                                    <div style={styles.listItem}>1. "서비스"라 함은 부동산 중개업무를 위한 고객 관리, 계약 관리, 일정 관리 등을 제공하는 시스템을 의미합니다.</div>
                                    <div style={styles.listItem}>2. "이용자"라 함은 본 서비스에 접속하여 이 약관에 따라 서비스를 이용하는 회원을 의미합니다.</div>
                                    <div style={styles.listItem}>3. "회원"이라 함은 서비스에 개인정보를 제공하여 회원등록을 한 자로서, 서비스의 정보를 지속적으로 제공받으며, 서비스를 계속적으로 이용할 수 있는 자를 의미합니다.</div>
                                </div>
                            </div>
                        </div>

                        <div style={styles.section}>
                            <h2 style={styles.sectionTitle}>제3조 (약관의 효력 및 변경)</h2>
                            <div style={styles.sectionContent}>
                                <div style={styles.list}>
                                    <div style={styles.listItem}>1. 본 약관은 서비스 이용 시 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력이 발생합니다.</div>
                                    <div style={styles.listItem}>2. 서비스 제공자는 필요한 경우 관련법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있습니다.</div>
                                    <div style={styles.listItem}>3. 약관이 변경되는 경우, 변경사항의 시행일자 30일 전부터 공지합니다.</div>
                                </div>
                            </div>
                        </div>

                        <div style={styles.section}>
                            <h2 style={styles.sectionTitle}>제4조 (서비스의 제공)</h2>
                            <div style={styles.sectionContent}>
                                <div style={styles.list}>
                                    <div style={styles.listItem}>1. 고객 정보 관리 및 데이터베이스 구축</div>
                                    <div style={styles.listItem}>2. 계약 및 거래 정보 관리</div>
                                    <div style={styles.listItem}>3. 일정 및 스케줄 관리</div>
                                    <div style={styles.listItem}>4. 매물 정보 관리 및 검색</div>
                                    <div style={styles.listItem}>5. 기타 부동산 중개업무에 필요한 서비스</div>
                                </div>
                            </div>
                        </div>

                        <div style={styles.section}>
                            <h2 style={styles.sectionTitle}>제5조 (회원가입)</h2>
                            <div style={styles.sectionContent}>
                                <div style={styles.list}>
                                    <div style={styles.listItem}>1. 서비스를 이용하고자 하는 자는 본 약관에 동의하고 회원가입을 신청합니다.</div>
                                    <div style={styles.listItem}>2. 회원가입은 실명으로 하여야 하며, 허위 정보 기재 시 서비스 이용이 제한될 수 있습니다.</div>
                                    <div style={styles.listItem}>3. Google OAuth를 통한 회원가입도 가능하며, 이 경우 추가 정보 입력이 필요할 수 있습니다.</div>
                                </div>
                            </div>
                        </div>

                        <div style={styles.section}>
                            <h2 style={styles.sectionTitle}>제6조 (개인정보보호)</h2>
                            <div style={styles.sectionContent}>
                                <div style={styles.list}>
                                    <div style={styles.listItem}>1. 서비스 제공자는 관련법령이 정하는 바에 따라 회원의 개인정보를 보호합니다.</div>
                                    <div style={styles.listItem}>2. 개인정보의 수집, 이용, 제공에 관한 동의는 회원가입 시 이루어집니다.</div>
                                    <div style={styles.listItem}>3. 회원은 언제든지 개인정보 열람, 정정, 삭제를 요구할 수 있습니다.</div>
                                </div>
                            </div>
                        </div>

                        <div style={styles.section}>
                            <h2 style={styles.sectionTitle}>개인정보처리방침</h2>
                            <div style={styles.sectionContent}>
                                <p>○○○(이하 "회사"라 합니다)는 「개인정보 보호법」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등 관련 법령을 준수하며, 이용자의 개인정보를 안전하게 관리하기 위해 다음과 같이 개인정보처리방침을 수립·공개합니다.</p>

                                <h3 style={{...styles.sectionTitle, fontSize: '1.3rem', marginTop: '20px'}}>제1조 (개인정보의 수집 항목 및 방법)</h3>
                                <h4 style={{fontSize: '1.1rem', fontWeight: 'bold', marginTop: '15px', marginBottom: '10px'}}>수집 항목</h4>
                                <div style={styles.list}>
                                    <div style={styles.listItem}><strong>회원 가입 시:</strong> 성명, 사업자등록번호, 공인중개사 자격번호, 연락처(휴대전화, 이메일), 로그인 ID, 비밀번호</div>
                                    <div style={styles.listItem}><strong>서비스 이용 시:</strong> 매도·매수 고객의 성명, 연락처, 거래 희망 정보, 기념일 정보</div>
                                    <div style={styles.listItem}><strong>결제 시:</strong> 신용카드번호, 계좌번호, 결제 기록</div>
                                    <div style={styles.listItem}><strong>자동 수집 항목:</strong> IP 주소, 쿠키, 접속 로그, 서비스 이용 기록</div>
                                </div>

                                <h4 style={{fontSize: '1.1rem', fontWeight: 'bold', marginTop: '15px', marginBottom: '10px'}}>수집 방법</h4>
                                <div style={styles.list}>
                                    <div style={styles.listItem}>홈페이지(회원가입, 서비스 이용 과정)</div>
                                    <div style={styles.listItem}>고객센터 상담</div>
                                    <div style={styles.listItem}>제휴사로부터의 제공 (회원 동의 시)</div>
                                </div>

                                <h3 style={{...styles.sectionTitle, fontSize: '1.3rem', marginTop: '20px'}}>제2조 (개인정보의 수집 및 이용 목적)</h3>
                                <p>회사는 수집한 개인정보를 다음의 목적을 위해 이용합니다.</p>
                                <div style={styles.list}>
                                    <div style={styles.listItem}><strong>서비스 제공:</strong> 고객 DB 관리, 단체문자 발송, 거래이력 저장, 자료 백업 등</div>
                                    <div style={styles.listItem}><strong>회원 관리:</strong> 본인 확인, 회원 식별, 부정이용 방지</div>
                                    <div style={styles.listItem}><strong>요금 정산:</strong> 서비스 이용료 결제, 청구서 발송, 환불 처리</div>
                                    <div style={styles.listItem}><strong>마케팅 및 광고:</strong> 신규 서비스 안내, 이벤트 정보 제공 (사전 동의 시)</div>
                                    <div style={styles.listItem}><strong>법적 의무 준수:</strong> 세무 신고, 관계기관 요청 대응</div>
                                </div>

                                <h3 style={{...styles.sectionTitle, fontSize: '1.3rem', marginTop: '20px'}}>제3조 (개인정보의 보유 및 이용 기간)</h3>
                                <p>회사는 개인정보 수집·이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.</p>
                                <p>단, 다음의 경우에는 명시한 기간 동안 보관합니다.</p>
                                <div style={styles.list}>
                                    <div style={styles.listItem}>거래 기록, 결제 기록: 5년 (전자상거래법)</div>
                                    <div style={styles.listItem}>계약 또는 청약철회 기록: 5년 (전자상거래법)</div>
                                    <div style={styles.listItem}>소비자 불만·분쟁 처리 기록: 3년 (전자상거래법)</div>
                                    <div style={styles.listItem}>로그 기록, 접속지 IP 정보: 3개월 (통신비밀보호법)</div>
                                </div>

                                <h3 style={{...styles.sectionTitle, fontSize: '1.3rem', marginTop: '20px'}}>제4조 (개인정보의 제3자 제공)</h3>
                                <p>회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다.</p>
                                <p>다만, 다음의 경우에는 예외로 합니다.</p>
                                <div style={styles.list}>
                                    <div style={styles.listItem}>이용자가 사전에 동의한 경우</div>
                                    <div style={styles.listItem}>법령에 의거하거나 수사기관의 요청이 있는 경우</div>
                                </div>

                                <h3 style={{...styles.sectionTitle, fontSize: '1.3rem', marginTop: '20px'}}>제5조 (개인정보의 처리 위탁)</h3>
                                <p>회사는 원활한 서비스 제공을 위해 다음과 같이 개인정보 처리를 위탁할 수 있습니다.</p>
                                <div style={{...styles.highlight, marginTop: '15px'}}>
                                    <table style={{width: '100%', borderCollapse: 'collapse'}}>
                                        <thead>
                                            <tr style={{borderBottom: '2px solid #e5e7eb'}}>
                                                <th style={{padding: '10px', textAlign: 'left', borderBottom: '1px solid #e5e7eb'}}>수탁자</th>
                                                <th style={{padding: '10px', textAlign: 'left', borderBottom: '1px solid #e5e7eb'}}>위탁 업무</th>
                                                <th style={{padding: '10px', textAlign: 'left', borderBottom: '1px solid #e5e7eb'}}>보유·이용 기간</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td style={{padding: '10px', borderBottom: '1px solid #e5e7eb'}}>○○ 결제대행사</td>
                                                <td style={{padding: '10px', borderBottom: '1px solid #e5e7eb'}}>결제 처리</td>
                                                <td style={{padding: '10px', borderBottom: '1px solid #e5e7eb'}}>위탁 계약 종료 시까지</td>
                                            </tr>
                                            <tr>
                                                <td style={{padding: '10px', borderBottom: '1px solid #e5e7eb'}}>○○ 문자발송사</td>
                                                <td style={{padding: '10px', borderBottom: '1px solid #e5e7eb'}}>단체문자 발송</td>
                                                <td style={{padding: '10px', borderBottom: '1px solid #e5e7eb'}}>위탁 계약 종료 시까지</td>
                                            </tr>
                                            <tr>
                                                <td style={{padding: '10px', borderBottom: '1px solid #e5e7eb'}}>○○ 클라우드사</td>
                                                <td style={{padding: '10px', borderBottom: '1px solid #e5e7eb'}}>데이터 저장 및 백업</td>
                                                <td style={{padding: '10px', borderBottom: '1px solid #e5e7eb'}}>위탁 계약 종료 시까지</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <p style={{fontStyle: 'italic', marginTop: '10px'}}>※ 회사는 위탁 계약 체결 시 「개인정보 보호법」 제26조에 따라 개인정보의 안전한 관리를 위해 필요한 사항을 규정합니다.</p>

                                <h3 style={{...styles.sectionTitle, fontSize: '1.3rem', marginTop: '20px'}}>제6조 (정보주체의 권리·의무 및 행사 방법)</h3>
                                <div style={styles.list}>
                                    <div style={styles.listItem}>회원은 언제든지 자신의 개인정보를 열람·정정·삭제·처리정지를 요청할 수 있습니다.</div>
                                    <div style={styles.listItem}>권리 행사는 이메일, 고객센터 등을 통해 가능합니다.</div>
                                    <div style={styles.listItem}>법정대리인을 통한 권리 행사도 가능합니다.</div>
                                </div>

                                <h3 style={{...styles.sectionTitle, fontSize: '1.3rem', marginTop: '20px'}}>제7조 (개인정보의 파기 절차 및 방법)</h3>
                                <div style={styles.list}>
                                    <div style={styles.listItem}><strong>파기 절차:</strong> 보유 기간이 경과하거나 처리 목적이 달성된 개인정보는 내부 방침에 따라 파기합니다.</div>
                                    <div style={styles.listItem}><strong>파기 방법:</strong> 전자적 파일은 복구 불가능한 방법으로 삭제, 종이 문서는 분쇄 또는 소각</div>
                                </div>

                                <h3 style={{...styles.sectionTitle, fontSize: '1.3rem', marginTop: '20px'}}>제8조 (개인정보의 안전성 확보 조치)</h3>
                                <p>회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취합니다.</p>
                                <div style={styles.list}>
                                    <div style={styles.listItem}><strong>관리적 조치:</strong> 내부관리계획 수립·시행, 정기 교육</div>
                                    <div style={styles.listItem}><strong>기술적 조치:</strong> 접근권한 제한, 암호화, 보안프로그램 설치</div>
                                    <div style={styles.listItem}><strong>물리적 조치:</strong> 전산실, 자료보관실 접근 통제</div>
                                </div>

                                <h3 style={{...styles.sectionTitle, fontSize: '1.3rem', marginTop: '20px'}}>제9조 (쿠키의 설치·운영 및 거부)</h3>
                                <div style={styles.list}>
                                    <div style={styles.listItem}>회사는 이용자 맞춤형 서비스를 제공하기 위해 쿠키를 사용할 수 있습니다.</div>
                                    <div style={styles.listItem}>이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있습니다.</div>
                                </div>

                                <h3 style={{...styles.sectionTitle, fontSize: '1.3rem', marginTop: '20px'}}>제10조 (개인정보 보호책임자)</h3>
                                <div style={styles.list}>
                                    <div style={styles.listItem}><strong>성명:</strong> [담당자 성명]</div>
                                    <div style={styles.listItem}><strong>직책:</strong> 개인정보 보호책임자</div>
                                    <div style={styles.listItem}><strong>연락처:</strong> [전화번호 / 이메일]</div>
                                </div>

                                <h3 style={{...styles.sectionTitle, fontSize: '1.3rem', marginTop: '20px'}}>제11조 (개인정보처리방침 변경)</h3>
                                <div style={styles.list}>
                                    <div style={styles.listItem}>본 방침은 시행일로부터 적용됩니다.</div>
                                    <div style={styles.listItem}>변경 시 최소 7일 전에 공지하며, 중대한 변경의 경우 최소 30일 전에 공지합니다.</div>
                                </div>
                            </div>
                        </div>

                        <div style={styles.section}>
                            <h2 style={styles.sectionTitle}>제7조 (회원의 의무)</h2>
                            <div style={styles.sectionContent}>
                                <div style={styles.list}>
                                    <div style={styles.listItem}>1. 회원은 관련법령, 본 약관의 규정, 이용안내 및 서비스상에 공지한 주의사항을 준수하여야 합니다.</div>
                                    <div style={styles.listItem}>2. 회원은 서비스 이용 시 다른 회원의 권리나 명예, 신용 등을 침해하는 행위를 하여서는 안 됩니다.</div>
                                    <div style={styles.listItem}>3. 회원은 서비스를 통해 얻은 정보를 서비스 제공자의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안 됩니다.</div>
                                </div>
                            </div>
                        </div>

                        <div style={styles.section}>
                            <h2 style={styles.sectionTitle}>제8조 (서비스 제공자의 의무)</h2>
                            <div style={styles.sectionContent}>
                                <div style={styles.list}>
                                    <div style={styles.listItem}>1. 서비스 제공자는 안정적이고 지속적인 서비스 제공을 위해 노력합니다.</div>
                                    <div style={styles.listItem}>2. 서비스 제공자는 회원의 개인정보를 보호하기 위해 보안 시스템을 구축하고 개인정보처리방침을 공시하고 준수합니다.</div>
                                    <div style={styles.listItem}>3. 서비스 제공자는 서비스 이용과 관련하여 회원으로부터 제기된 의견이나 불만이 정당하다고 객관적으로 인정될 경우에는 적절한 절차를 거쳐 즉시 처리하여야 합니다.</div>
                                </div>
                            </div>
                        </div>

                        <div style={styles.section}>
                            <h2 style={styles.sectionTitle}>제9조 (서비스 이용제한)</h2>
                            <div style={styles.sectionContent}>
                                <div style={styles.list}>
                                    <div style={styles.listItem}>1. 회원이 본 약관의 의무를 위반하거나 서비스의 정상적인 운영을 방해한 경우, 서비스 제공자는 경고, 일시정지, 영구이용정지 등으로 서비스 이용을 단계적으로 제한할 수 있습니다.</div>
                                    <div style={styles.listItem}>2. 서비스 제공자는 전항에도 불구하고, "주민등록법"을 위반한 명의도용 및 결제도용, "저작권법" 및 "컴퓨터프로그램보호법"을 위반한 불법프로그램의 제공 및 운영방해, "정보통신망법"을 위반한 불법통신 및 해킹, 악성프로그램의 배포, 접속권한 초과행위 등과 같이 관련법령을 위반한 경우에는 즉시 영구이용정지를 할 수 있습니다.</div>
                                </div>
                            </div>
                        </div>

                        <div style={styles.section}>
                            <h2 style={styles.sectionTitle}>제10조 (회원탈퇴 및 자격 상실)</h2>
                            <div style={styles.sectionContent}>
                                <div style={styles.list}>
                                    <div style={styles.listItem}>1. 회원은 서비스 제공자에 언제든지 탈퇴를 요청할 수 있으며 서비스 제공자는 즉시 회원탈퇴를 처리합니다.</div>
                                    <div style={styles.listItem}>2. 회원이 다음 각호의 사유에 해당하는 경우, 서비스 제공자는 회원자격을 제한 및 정지시킬 수 있습니다.</div>
                                    <div style={styles.listItem}>3. Google OAuth 사용자의 경우 비밀번호 확인 없이 회원탈퇴가 가능합니다.</div>
                                </div>
                            </div>
                        </div>

                        <div style={styles.section}>
                            <h2 style={styles.sectionTitle}>제11조 (면책조항)</h2>
                            <div style={styles.sectionContent}>
                                <div style={styles.list}>
                                    <div style={styles.listItem}>1. 서비스 제공자는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.</div>
                                    <div style={styles.listItem}>2. 서비스 제공자는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.</div>
                                    <div style={styles.listItem}>3. 서비스 제공자는 회원이 서비스를 이용하여 기대하는 수익을 상실한 것에 대하여 책임을 지지 않으며, 그 밖의 서비스를 통하여 얻은 자료로 인한 손해에 관하여 책임을 지지 않습니다.</div>
                                </div>
                            </div>
                        </div>

                        <div style={styles.section}>
                            <h2 style={styles.sectionTitle}>제12조 (분쟁해결)</h2>
                            <div style={styles.sectionContent}>
                                <div style={styles.list}>
                                    <div style={styles.listItem}>1. 서비스 제공자는 이용자가 제기하는 정당한 의견이나 불만을 반영하고 그 피해를 보상처리하기 위하여 피해보상처리기구를 설치·운영합니다.</div>
                                    <div style={styles.listItem}>2. 서비스 제공자와 이용자 간에 발생한 전자상거래 분쟁에 관하여는 소비자분쟁조정위원회의 조정에 따를 수 있습니다.</div>
                                </div>
                            </div>
                        </div>

                        <div style={styles.section}>
                            <h2 style={styles.sectionTitle}>제13조 (재판권 및 준거법)</h2>
                            <div style={styles.sectionContent}>
                                <div style={styles.list}>
                                    <div style={styles.listItem}>1. 서비스 제공자와 이용자 간에 발생한 분쟁에 관하여는 대한민국법원을 관할법원으로 합니다.</div>
                                    <div style={styles.listItem}>2. 서비스 제공자와 이용자 간에 제기된 소송에는 대한민국법을 적용합니다.</div>
                                </div>
                            </div>
                        </div>

                        <div style={styles.highlight}>
                            <strong>📋 중요 안내사항</strong>
                            <br />
                            본 약관은 2024년 1월 1일부터 시행됩니다. 
                            서비스 이용 전 반드시 전체 내용을 숙지하시기 바랍니다.
                        </div>

                        <div style={styles.date}>
                            시행일: 2024년 1월 1일
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService; 