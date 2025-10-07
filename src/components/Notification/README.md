# NotificationRegistrationModal 개선사항

## 개요
`NotificationRegistrationModal`에 리치 텍스트 에디터, 테이블 생성기, 마크다운 에디터 기능을 추가하여 게시판이나 블로그 게시에 사용할 수 있는 고급 편집 기능을 제공합니다.

## 새로 추가된 기능

### 1. 리치 텍스트 에디터 (React Quill)
- **위치**: 첫 번째 탭
- **기능**:
  - 제목 스타일링 (H1-H6)
  - 텍스트 서식 (굵게, 기울임, 밑줄, 취소선)
  - 색상 및 배경색 설정
  - 목록 (순서 있는/없는)
  - 들여쓰기
  - 정렬
  - 링크, 이미지, 비디오 삽입
  - 인용문, 코드 블록
  - 테이블 생성 및 편집

### 2. 마크다운 에디터 (@uiw/react-md-editor)
- **위치**: 두 번째 탭
- **기능**:
  - 실시간 미리보기
  - 편집/미리보기/분할 모드 전환
  - 마크다운 문법 하이라이팅
  - 테이블, 코드 블록, 인용문 지원
  - 이미지, 링크 삽입

### 3. 테이블 에디터
- **위치**: "테이블 추가" 버튼
- **기능**:
  - 동적 헤더 추가/삭제
  - 동적 행 추가/삭제
  - 셀 편집 (더블클릭)
  - 실시간 미리보기
  - HTML 테이블 생성
  - 반응형 디자인

### 4. 일반 텍스트 에디터
- **위치**: 세 번째 탭
- **기능**:
  - 기존 textarea 방식
  - 간단한 텍스트 입력

## 사용법

### 기본 사용법
```jsx
<NotificationRegistrationModal
    show={showModal}
    onHide={() => setShowModal(false)}
    onSuccess={handleSuccess}
    editingNotification={editingData}
    currentUser={user}
/>
```

### 에디터 전환
사용자는 탭을 클릭하여 원하는 에디터 모드로 전환할 수 있습니다:
- **리치 텍스트**: WYSIWYG 편집
- **마크다운**: 마크다운 문법으로 편집
- **일반 텍스트**: 기본 textarea

### 테이블 추가
1. "테이블 추가" 버튼 클릭
2. 헤더와 데이터 입력
3. "저장" 버튼으로 현재 내용에 테이블 추가

## 설치된 라이브러리

### React Quill
```bash
npm install react-quill quill-table quill-table-ui
```

### React Markdown Editor
```bash
npm install @uiw/react-md-editor
```

### React Table
```bash
npm install @tanstack/react-table
```

## 스타일링

각 컴포넌트는 자체 CSS 파일을 가지고 있어 커스터마이징이 가능합니다:
- `RichTextEditor.css`
- `TableEditor.css`
- `MarkdownEditor.css`

## 반응형 디자인

모든 에디터는 반응형 디자인을 지원하여 모바일 환경에서도 사용할 수 있습니다.

## 브라우저 지원

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 주의사항

1. **성능**: 리치 텍스트 에디터는 큰 문서에서 성능 저하가 있을 수 있습니다.
2. **이미지**: 이미지 업로드는 별도 구현이 필요합니다.
3. **저장**: HTML 형태로 저장되므로 백엔드에서 적절히 처리해야 합니다.

## 향후 개선사항

- 이미지 업로드 기능
- 템플릿 기능
- 자동 저장
- 협업 편집
- 버전 관리
