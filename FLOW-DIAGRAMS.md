# Job Mongolia Platform - 플로우 다이어그램 및 상세 설명

이 문서는 Job Mongolia 플랫폼의 주요 사용자 플로우를 다이어그램과 단계별 설명으로 정리합니다.

**작성일**: 2025년  
**관련 문서**: `USER-FLOW.md`, `ROLE-PERMISSIONS.md`

---

## 📋 목차

1. [인증 플로우](#인증-플로우)
2. [채용공고 작성 및 승인 플로우](#채용공고-작성-및-승인-플로우)
3. [지원 프로세스 플로우](#지원-프로세스-플로우)
4. [채팅 플로우](#채팅-플로우)
5. [알림 플로우](#알림-플로우)
6. [기업 승인 플로우](#기업-승인-플로우)

---

## 🔐 인증 플로우

### 1.1 회원가입 플로우

```
[Guest] → [회원가입 페이지] → [계정 유형 선택]
                                    ↓
                    ┌───────────────┴───────────────┐
                    ↓                               ↓
            [구직자 선택]                    [구인자 선택]
                    ↓                               ↓
            [구직자 폼 작성]                [구인자 폼 작성]
                    ↓                               ↓
            [이메일 인증]                    [이메일 인증]
                    ↓                               ↓
            [회원가입 완료]                [회원가입 완료]
                    ↓                               ↓
            [자동 로그인]                    [자동 로그인]
                    ↓                               ↓
            [/user/home]                    [/company/dashboard]
```

**상세 단계:**

1. **계정 유형 선택** (`/register`)
   - 구직자 (Candidate) 선택
   - 구인자 (Employer) 선택

2. **회원가입 폼 작성**
   - **공통 필드**:
     - 이메일
     - 비밀번호 (강도 검증)
     - 이름
     - 위치
     - 시민권 유형 (몽골인/외국인)
     - 몽골 ID (몽골인인 경우, 10자리)
     - 전화번호 (국가 코드 포함)
   - **구인자 추가 필드**:
     - 회사명
     - 산업
     - 회사 규모
     - 직책

3. **이메일 인증**
   - 인증 코드 발송
   - 인증 코드 입력 및 확인

4. **회원가입 완료**
   - 계정 생성
   - 자동 로그인
   - 사용자 유형에 따라 리다이렉트:
     - 구직자 → `/user/home`
     - 구인자 → `/company/dashboard`

### 1.2 로그인 플로우

```
[Guest] → [로그인 페이지] → [이메일/비밀번호 입력]
                                    ↓
                            [인증 확인]
                                    ↓
                    ┌───────────────┴───────────────┐
                    ↓                               ↓
            [인증 실패]                      [인증 성공]
                    ↓                               ↓
            [에러 메시지]                    [사용자 유형 확인]
                    ↓                               ↓
            [재시도]                    ┌───────────┴───────────┐
                                        ↓                       ↓
                                [구직자]                [구인자/관리자]
                                        ↓                       ↓
                                [/user/home]          [/company/dashboard]
                                                      [/admin/dashboard]
```

**상세 단계:**

1. **로그인 페이지 접근** (`/login`)
   - 이메일/비밀번호 입력
   - 데모 계정 사용 가능

2. **인증 처리**
   - `AuthManager.login()` 호출
   - 토큰 및 사용자 정보 반환

3. **세션 저장**
   - `localStorage`에 토큰 저장 (`auth_token`)
   - 사용자 데이터 저장 (`user_data`)
   - React Query 캐시 업데이트

4. **리다이렉트**
   - 구직자 → `/user/home`
   - 구인자 → `/company/dashboard`
   - 관리자 → `/admin/dashboard`

---

## 📝 채용공고 작성 및 승인 플로우

### 2.1 채용공고 작성 플로우

```
[기업 사용자] → [/company/jobs] → [새 채용공고 작성 버튼]
                                        ↓
                                [채용공고 폼 작성]
                                        ↓
                    ┌───────────────────┴───────────────────┐
                    ↓                                       ↓
            [초안 저장]                            [게시하기]
                    ↓                                       ↓
            [status: draft]                    [status: pending]
                    ↓                                       ↓
            [초안 목록에 저장]                    [관리자 승인 대기]
                                                    ↓
                                            [Admin 알림 생성]
```

**상세 단계:**

1. **채용공고 작성 페이지 접근** (`/company/jobs`)
   - "새 채용공고 작성" 버튼 클릭
   - `JobCreateForm` 다이얼로그 열림

2. **채용공고 정보 입력**
   - **필수 필드**:
     - 제목 (`title`)
     - 설명 (`description`)
     - 위치 (`location`)
     - 고용 유형 (`employmentType`)
     - 경력 레벨 (`experienceLevel`)
     - 급여 (`salary`)
     - 필수 기술 (`requiredSkills`)
     - 마감일 (`deadline`)
   - **선택 필드**:
     - 원격근무 여부 (`isRemote`)
     - 복리후생 (`benefits`)

3. **저장 옵션**
   - **초안 저장**: `status: "draft"` → 초안 목록에 저장
   - **게시하기**: `status: "pending"` → 관리자 승인 대기

4. **API 호출**
   - `POST /api/company/jobs`
   - 채용공고 생성
   - 초기 상태: `pending`, `isActive: false`

5. **알림 생성**
   - 관리자에게 "새로운 채용공고 승인 대기" 알림 생성
   - 알림 링크: `/admin/jobs?id={jobId}`

### 2.2 채용공고 승인 플로우

```
[관리자] → [/admin/jobs] → [승인 대기 채용공고 목록]
                                    ↓
                            [채용공고 상세 확인]
                                    ↓
                    ┌───────────────┴───────────────┐
                    ↓                               ↓
            [승인]                           [거부]
                    ↓                               ↓
            [POST /api/admin/jobs/:id/approve]  [POST /api/admin/jobs/:id/reject]
                    ↓                               ↓
            [status: "public"]              [status: "rejected"]
            [isActive: true]                [isActive: false]
            [postedAt: 현재 시간]            [rejectionReason: 사유]
                    ↓                               ↓
            [웹사이트에 공개]                [거부 알림 생성]
                    ↓                               ↓
            [기업에 승인 알림]                [기업에 거부 알림]
```

**상세 단계:**

1. **관리자 승인 페이지** (`/admin/jobs`)
   - 승인 대기 채용공고 목록 확인
   - 채용공고 상세 정보 확인

2. **승인 처리**
   - "승인" 버튼 클릭
   - `POST /api/admin/jobs/:id/approve` 호출
   - 채용공고 상태 변경:
     - `status: "pending"` → `status: "public"`
     - `isActive: false` → `isActive: true`
     - `postedAt: 현재 시간` 설정

3. **거부 처리**
   - "거부" 버튼 클릭
   - 거부 사유 입력
   - `POST /api/admin/jobs/:id/reject` 호출
   - 채용공고 상태 변경:
     - `status: "pending"` → `status: "rejected"`
     - `isActive: false` 유지
     - `rejectionReason: 사유` 저장

4. **알림 생성**
   - **승인 시**: 기업 사용자들에게 "채용공고가 승인되었습니다" 알림
   - **거부 시**: 기업 사용자들에게 "채용공고가 거부되었습니다" 알림 (사유 포함)

5. **데이터 동기화**
   - `/api/jobs` 엔드포인트는 `status: "public"`이고 `isActive: true`인 채용공고만 반환
   - 웹사이트에 자동으로 공개됨

---

## 📨 지원 프로세스 플로우

### 3.1 지원서 작성 플로우

```
[구직자] → [/user/jobs/:id] → [지원하기 버튼 클릭]
                                    ↓
                            [이미 지원했는지 확인]
                                    ↓
                    ┌───────────────┴───────────────┐
                    ↓                               ↓
            [이미 지원함]                    [지원 가능]
                    ↓                               ↓
            [이미 지원함 메시지]            [이력서 선택]
                                                    ↓
                                            [자기소개서 작성]
                                                    ↓
                                            [지원서 제출]
                                                    ↓
                                    [POST /api/applications]
                                                    ↓
                                    [Application 생성]
                                                    ↓
                    ┌───────────────┴───────────────┐
                    ↓                               ↓
            [기업에 알림 생성]                [채팅방 자동 생성]
                    ↓                               ↓
            [기업 사용자들에게 알림]        [지원자-기업 채팅방]
                    ↓                               ↓
            [/company/applications]         [/user/chat]
                                                    ↓
                                            [지원 현황 업데이트]
```

**상세 단계:**

1. **채용공고 상세 페이지** (`/user/jobs/:id`)
   - "지원하기" 버튼 클릭
   - `ApplyDialog` 열림

2. **이미 지원 여부 확인**
   - `GET /api/applications/user/:userId`로 지원 내역 확인
   - 이미 지원한 경우: "이미 지원하신 채용공고입니다" 메시지 표시

3. **이력서 선택**
   - 사용자의 이력서 목록 표시 (`GET /api/resumes`)
   - 기본 이력서 자동 선택
   - 이력서가 없는 경우: "이력서 작성하기" 버튼 표시

4. **자기소개서 작성** (선택사항)
   - 지원 동기 및 자기 어필 내용 작성
   - 최대 1000자

5. **지원서 제출**
   - `POST /api/applications` 호출
   - 데이터:
     ```json
     {
       "userId": 1,
       "jobId": 123,
       "resumeId": 1,
       "coverLetter": "지원 동기...",
       "status": "pending"
     }
     ```

6. **자동 처리**
   - Application 생성
   - Job의 `applicationsCount` 증가
   - 기업 사용자들에게 알림 생성:
     - 타입: `job_application`
     - 메시지: "{지원자명}님이 "{채용공고명}" 포지션에 지원했습니다"
   - 채팅방 자동 생성:
     - 지원자와 기업 간 채팅방 생성
     - 상태: `active`
     - 초기 메시지: "{지원자명}님이 지원했습니다."

7. **리다이렉트**
   - 지원 완료 토스트 메시지 표시
   - 지원 현황 페이지로 이동 가능 (`/user/applications`)

### 3.2 지원서 상태 변경 플로우

```
[기업 사용자] → [/company/applications] → [지원서 목록]
                                                    ↓
                                            [지원서 상세 확인]
                                                    ↓
                                            [상태 변경 버튼]
                                                    ↓
                    ┌───────────────┴───────────────┐
                    ↓                               ↓
            [검토중]                        [면접/합격/불합격]
                    ↓                               ↓
            [PATCH /api/applications/:id]   [PATCH /api/applications/:id]
                    ↓                               ↓
            [status: "reviewed"]            [status: "interview"/"accepted"/"rejected"]
                    ↓                               ↓
            [지원자에게 알림]                [지원자에게 알림]
                    ↓                               ↓
            [/user/applications]            [/user/applications]
```

**상세 단계:**

1. **지원서 관리 페이지** (`/company/applications`)
   - 지원서 목록 확인
   - 필터링: 전체/검토중/면접/합격/불합격

2. **지원서 상세 확인**
   - 지원자 정보 확인
   - 이력서 확인
   - 자기소개서 확인

3. **상태 변경**
   - 상태 선택: `pending` → `reviewed` → `interview` → `accepted`/`rejected`
   - `PATCH /api/applications/:id` 호출
   - 데이터:
     ```json
     {
       "status": "reviewed" | "interview" | "accepted" | "rejected"
     }
     ```

4. **알림 생성**
   - 지원자에게 알림 생성:
     - 타입: `application_status`
     - 메시지: "{채용공고명} 포지션 지원 상태가 '{상태명}'으로 변경되었습니다"
   - 상태 레이블:
     - `reviewed`: "검토중"
     - `interview`: "면접"
     - `accepted`: "합격"
     - `rejected`: "불합격"

5. **데이터 업데이트**
   - Application의 `status` 및 `updatedAt` 업데이트
   - 지원 현황 페이지에 반영

---

## 💬 채팅 플로우

### 4.1 채팅방 생성 플로우

```
[지원서 제출] → [자동 채팅방 생성]
                    ↓
            [기업 사용자 찾기]
                    ↓
            [채팅방 생성]
                    ↓
            [초기 메시지 생성]
                    ↓
            [채팅방 목록에 추가]
```

**상세 단계:**

1. **자동 생성 트리거**
   - 지원서 제출 시 자동으로 채팅방 생성
   - 기업의 Employer 사용자 찾기
   - 지원자와 기업 간 채팅방 생성

2. **채팅방 데이터**
   ```json
   {
     "employerId": 2,
     "candidateId": 1,
     "jobId": 123,
     "status": "active",
     "createdAt": "2025-01-01T00:00:00Z"
   }
   ```

3. **초기 메시지**
   - 메시지: "{지원자명}님이 지원했습니다."
   - 읽지 않음 상태 (`isRead: false`)

### 4.2 메시지 전송 플로우

```
[사용자] → [채팅방 선택] → [메시지 입력]
                                ↓
                        [전송 버튼 클릭]
                                ↓
                    [POST /api/chat/messages]
                                ↓
                    [메시지 저장]
                                ↓
                    [WebSocket으로 전송]
                                ↓
                    [상대방에게 실시간 전달]
                                ↓
                    [읽음 처리]
```

**상세 단계:**

1. **채팅방 접근**
   - 구직자: `/user/chat`
   - 기업: `/company/chat`
   - 채팅방 목록 표시

2. **메시지 입력**
   - 메시지 텍스트 입력
   - 전송 버튼 클릭

3. **메시지 전송**
   - `POST /api/chat/messages` 호출
   - 데이터:
     ```json
     {
       "roomId": 1,
       "content": "안녕하세요",
       "senderId": 1,
       "messageType": "text"
     }
     ```

4. **실시간 전달**
   - WebSocket을 통해 실시간 전달
   - 상대방 채팅방에 즉시 표시

5. **읽음 처리**
   - 메시지 수신 시 자동으로 읽음 처리
   - `POST /api/chat/rooms/:id/read` 호출

---

## 🔔 알림 플로우

### 5.1 알림 생성 시점

```
[이벤트 발생]
        ↓
┌───────┴───────┬───────────────┬───────────────┬───────────────┐
↓               ↓               ↓               ↓               ↓
[채용공고 생성] [채용공고 승인] [지원서 제출] [상태 변경] [채팅 메시지]
        ↓               ↓               ↓               ↓               ↓
[Admin 알림]   [기업 알림]     [기업 알림]     [지원자 알림]   [수신자 알림]
```

**알림 타입별 상세:**

1. **채용공고 생성 알림** (`job_pending`)
   - **트리거**: 기업이 채용공고 작성
   - **수신자**: 관리자
   - **메시지**: "{기업명}에서 "{채용공고명}" 채용공고를 등록했습니다. 승인을 검토해주세요."
   - **링크**: `/admin/jobs?id={jobId}`

2. **채용공고 승인 알림** (`job_approved`)
   - **트리거**: 관리자가 채용공고 승인
   - **수신자**: 기업 사용자들
   - **메시지**: "{채용공고명}" 채용공고가 승인되어 웹사이트에 게시되었습니다."
   - **링크**: `/company/jobs?id={jobId}`

3. **채용공고 거부 알림** (`job_rejected`)
   - **트리거**: 관리자가 채용공고 거부
   - **수신자**: 기업 사용자들
   - **메시지**: "{채용공고명}" 채용공고가 거부되었습니다. 사유: {사유}"
   - **링크**: `/company/jobs?id={jobId}`

4. **지원서 접수 알림** (`job_application`)
   - **트리거**: 구직자가 지원서 제출
   - **수신자**: 기업 사용자들
   - **메시지**: "{지원자명}님이 "{채용공고명}" 포지션에 지원했습니다."
   - **링크**: `/company/applications?jobId={jobId}`

5. **지원 상태 변경 알림** (`application_status`)
   - **트리거**: 기업이 지원 상태 변경
   - **수신자**: 지원자
   - **메시지**: "{채용공고명}" 포지션 지원 상태가 '{상태명}'으로 변경되었습니다."
   - **링크**: `/user/applications`

### 5.2 알림 조회 및 처리 플로우

```
[사용자] → [알림 아이콘 클릭] → [알림 목록 표시]
                                        ↓
                                [알림 읽음 처리]
                                        ↓
                                [알림 링크 클릭]
                                        ↓
                                [해당 페이지로 이동]
```

**상세 단계:**

1. **알림 조회**
   - 구직자: `/user/notifications`
   - 기업: `/company/notifications`
   - 관리자: `/user/notifications`
   - `GET /api/notifications` 호출

2. **알림 읽음 처리**
   - 알림 클릭 시 자동 읽음 처리
   - `PUT /api/notifications/:id/read` 호출
   - 전체 읽음 처리: `PUT /api/notifications/read-all`

3. **알림 삭제**
   - 개별 삭제: `DELETE /api/notifications/:id`
   - 읽지 않은 알림 개수 실시간 업데이트

---

## 🏢 기업 승인 플로우

### 6.1 기업 등록 및 승인 플로우

```
[기업 사용자] → [회원가입] → [기업 정보 입력]
                                    ↓
                            [기업 계정 생성]
                                    ↓
                            [status: "pending"]
                                    ↓
                            [관리자 승인 대기]
                                    ↓
                    ┌───────────────┴───────────────┐
                    ↓                               ↓
            [관리자 승인]                    [관리자 거부]
                    ↓                               ↓
            [status: "approved"]            [status: "rejected"]
                    ↓                               ↓
            [기업 사용 가능]                [기업 사용 불가]
                    ↓                               ↓
            [기업에 승인 알림]              [기업에 거부 알림]
```

**상세 단계:**

1. **기업 등록**
   - 회원가입 시 계정 유형을 "구인자"로 선택
   - 기업 정보 입력:
     - 회사명
     - 산업
     - 회사 규모
     - 직책

2. **기업 계정 생성**
   - `POST /api/auth/register` 호출
   - 기업 계정 생성 (`status: "pending"`)

3. **관리자 승인**
   - 관리자가 `/admin/companies`에서 기업 목록 확인
   - 기업 상세 정보 확인 (`/admin/companies/:id`)
   - "승인" 버튼 클릭
   - `POST /api/admin/companies/:id/approve` 호출
   - 기업 상태 변경: `status: "pending"` → `status: "approved"`

4. **관리자 거부**
   - "거부" 버튼 클릭
   - 거부 사유 입력
   - `POST /api/admin/companies/:id/reject` 호출
   - 기업 상태 변경: `status: "pending"` → `status: "rejected"`

5. **알림 생성**
   - 승인 시: 기업 사용자들에게 "기업 계정이 승인되었습니다" 알림
   - 거부 시: 기업 사용자들에게 "기업 계정이 거부되었습니다" 알림 (사유 포함)

---

## 🔄 데이터 동기화 플로우

### 7.1 React Query 캐시 무효화

```
[데이터 변경 이벤트]
        ↓
[API 호출 성공]
        ↓
[queryClient.invalidateQueries()]
        ↓
┌───────┴───────┬───────────────┬───────────────┐
↓               ↓               ↓               ↓
[관련 쿼리 무효화] [자동 재조회] [UI 업데이트] [실시간 반영]
```

**예시:**

1. **채용공고 생성 시**
   ```typescript
   queryClient.invalidateQueries({ queryKey: ["/api/company/jobs"] });
   queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
   queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
   ```
   - 기업 대시보드, 웹사이트, 관리자 페이지 모두 자동 업데이트

2. **지원서 제출 시**
   ```typescript
   queryClient.invalidateQueries({ queryKey: ["/api/applications/user", userId] });
   queryClient.invalidateQueries({ queryKey: [`/api/jobs/${jobId}`] });
   ```
   - 지원 현황 페이지, 채용공고 상세 페이지 자동 업데이트

---

## 📊 플로우 요약 테이블

| 플로우 | 시작점 | 종료점 | 주요 단계 | 알림 생성 |
|--------|--------|--------|----------|----------|
| 회원가입 | `/register` | `/user/home` 또는 `/company/dashboard` | 계정 유형 선택 → 폼 작성 → 이메일 인증 → 자동 로그인 | ❌ |
| 로그인 | `/login` | 역할별 대시보드 | 이메일/비밀번호 입력 → 인증 → 리다이렉트 | ❌ |
| 채용공고 작성 | `/company/jobs` | `/company/jobs` | 폼 작성 → 저장/게시 → 관리자 승인 대기 | ✅ (관리자) |
| 채용공고 승인 | `/admin/jobs` | `/admin/jobs` | 승인/거부 → 상태 변경 → 웹사이트 공개 | ✅ (기업) |
| 지원서 제출 | `/user/jobs/:id` | `/user/applications` | 이력서 선택 → 자기소개서 작성 → 제출 → 채팅방 생성 | ✅ (기업) |
| 지원 상태 변경 | `/company/applications` | `/company/applications` | 상태 선택 → 변경 → 알림 생성 | ✅ (지원자) |
| 채팅 시작 | 지원서 제출 또는 `/company/talents` | `/user/chat` 또는 `/company/chat` | 채팅방 생성 → 메시지 전송 | ✅ (수신자) |

---

## 🎯 주요 플로우 체크리스트

### 구직자 플로우
- [ ] 회원가입 완료
- [ ] 프로필 작성
- [ ] 이력서 작성
- [ ] 채용공고 탐색
- [ ] 채용공고 지원
- [ ] 지원 현황 확인
- [ ] 채팅 참여
- [ ] 알림 확인

### 기업 플로우
- [ ] 회원가입 완료
- [ ] 기업 정보 작성
- [ ] 기업 승인 대기
- [ ] 채용공고 작성
- [ ] 채용공고 승인 대기
- [ ] 지원자 확인
- [ ] 지원 상태 변경
- [ ] 채팅 시작
- [ ] 면접 일정 관리
- [ ] 고용 완료

### 관리자 플로우
- [ ] 로그인
- [ ] 기업 승인/거부
- [ ] 채용공고 승인/거부
- [ ] 사용자 관리
- [ ] 스킬 마스터 관리
- [ ] 배너 관리
- [ ] 시스템 모니터링

---

**작성일**: 2025년  
**최종 업데이트**: 2025년  
**관련 파일**: 
- `client/src/App.tsx`
- `client/src/lib/mockData.ts`
- `client/src/pages/company/jobs.tsx`
- `client/src/pages/admin/jobs.tsx`
- `client/src/components/jobs/apply-dialog.tsx`


