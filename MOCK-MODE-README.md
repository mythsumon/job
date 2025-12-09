# Mock Mode 활성화 안내

## 개요
백엔드 연결 없이 UI 플로우만 확인할 수 있도록 Mock 모드가 활성화되었습니다.

## 변경 사항

### 1. Mock 데이터 시스템
- **파일**: `client/src/lib/mockData.ts`
- 모든 API 호출이 Mock 데이터를 반환합니다
- 실제 백엔드 서버 연결 없이 UI를 테스트할 수 있습니다

### 2. API 클라이언트 수정
- **파일**: `client/src/lib/queryClient.ts`
- `MOCK_MODE = true`로 설정되어 모든 API 호출이 Mock 데이터를 반환합니다
- 콘솔에 `[MOCK]` 로그가 표시됩니다

### 3. 인증 시스템 수정
- **파일**: `client/src/utils/auth.ts`
- **파일**: `client/src/hooks/useAuth.ts`
- Mock 모드에서 토큰 검증을 건너뜁니다
- 기본 Mock 사용자로 자동 로그인됩니다

## Mock 데이터

### 기본 사용자
- **구직자 (Candidate)**: `candidate@example.com`
- **구인자 (Employer)**: `employer@example.com`

### Mock 데이터 포함
- 채용공고 3개 (Featured, Pro 포함)
- 기업 2개
- 채팅방 및 메시지
- 이력서
- 지원서

## 사용 방법

### 1. 개발 서버 실행
```bash
npm run dev
```

### 2. 브라우저에서 확인
- 모든 페이지가 Mock 데이터로 작동합니다
- 백엔드 서버가 실행되지 않아도 UI를 확인할 수 있습니다
- 콘솔에서 `[MOCK]` 로그를 확인할 수 있습니다

### 3. 로그인/회원가입
- Mock 모드에서는 항상 성공합니다
- 기본 사용자로 자동 로그인됩니다

## Mock 모드 비활성화

백엔드 연결을 다시 활성화하려면:

1. **`client/src/lib/queryClient.ts`**에서 `MOCK_MODE`를 `false`로 변경
2. **`client/src/utils/auth.ts`**에서 `MOCK_MODE`를 `false`로 변경
3. **`client/src/hooks/useAuth.ts`**에서 `MOCK_MODE`를 `false`로 변경

또는 각 파일에서 `MOCK_MODE` 상수를 찾아 `false`로 변경하세요.

## 주의사항

1. **데이터 저장**: Mock 모드에서는 데이터가 실제로 저장되지 않습니다
2. **페이지 새로고침**: 새로고침 시 Mock 데이터로 초기화됩니다
3. **실시간 기능**: WebSocket 연결이 없으므로 실시간 채팅은 작동하지 않습니다
4. **파일 업로드**: 파일 업로드 기능은 Mock 모드에서 작동하지 않습니다

## Mock 데이터 수정

Mock 데이터를 수정하려면 `client/src/lib/mockData.ts` 파일을 편집하세요.

## 문제 해결

### Mock 데이터가 표시되지 않는 경우
1. 브라우저 콘솔에서 `[MOCK]` 로그 확인
2. `localStorage` 확인: `localStorage.getItem('auth_token')`
3. 페이지 새로고침

### 에러가 발생하는 경우
1. 브라우저 콘솔 확인
2. `MOCK_MODE`가 `true`로 설정되어 있는지 확인
3. `mockData.ts`의 `getMockData` 함수에 해당 엔드포인트가 있는지 확인

---

**마지막 업데이트**: 2025년 1월

