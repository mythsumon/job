# ChatGPT DB Schema Integration Guide

## 개요
이 문서는 Job Mongolia 플랫폼의 데이터베이스 스키마를 ChatGPT가 이해하고 활용할 수 있도록 작성된 문서입니다.

---

## 데이터베이스 연결 정보

```
Host: 192.168.0.171 (Primary) / 203.23.49.100 (Fallback)
Port: 5432
Database: jobmongolia
Username: jobmongolia_user
Password: JobMongolia2025R5!
```

---

## 주요 테이블 구조 및 설명

### 1. users (사용자 테이블)

**목적**: 플랫폼의 모든 사용자 정보를 저장합니다.

**주요 컬럼**:
- `id` (serial, PK): 사용자 고유 ID
- `email` (text, NOT NULL): 이메일 주소 (로그인용)
- `username` (text): 사용자명 (선택사항)
- `password` (text, NOT NULL): 비밀번호 (해시화 필요)
- `full_name` (text, NOT NULL): 전체 이름
- `user_type` (text, NOT NULL): 사용자 유형 - `"candidate"` | `"employer"` | `"admin"`
- `role` (text): 역할 - `"user"` | `"admin"` | `"super_admin"`

**몽골 특화 필드**:
- `mongolian_id` (text, UNIQUE): 몽골 ID (2자리 몽골어 + 8자리 숫자)
- `ovog` (text): 성 (몽골어)
- `ner` (text): 이름 (몽골어)
- `citizenship_type` (text): 시민권 유형 - `"mongolian"` | `"foreign"`
- `nationality` (text): 국적 (외국인인 경우)
- `foreign_id` (text): 외국인 ID/여권번호

**프로필 필드**:
- `profile_picture` (text): 프로필 사진 URL (base64 또는 URL)
- `profile_picture_format` (text): 이미지 포맷 (webp, jpeg, png)
- `location` (text): 위치
- `phone` (text): 전화번호
- `country_code` (text): 국가 코드
- `bio` (text): 자기소개
- `skills` (json): 기술 스택 배열
- `experience` (text): 경력
- `education` (text): 학력

**AI 매칭을 위한 확장 필드**:
- `major` (text): 전공
- `preferred_industry` (json): 희망 근무 분야 배열
- `dream_company` (text): 꿈의 직장
- `career_level` (text): 경력 수준 - `"entry"` | `"junior"` | `"mid"` | `"senior"` | `"executive"`
- `preferred_work_type` (json): 희망 근무 형태 배열
- `preferred_location` (json): 희망 근무 지역 배열
- `salary_expectation` (text): 희망 연봉
- `language_skills` (json): 언어 능력 배열
- `certifications` (json): 자격증 배열
- `work_availability` (text): 근무 가능 시기
- `portfolio_url` (text): 포트폴리오 URL
- `github_url` (text): GitHub URL
- `linkedin_url` (text): LinkedIn URL

**상태 필드**:
- `is_active` (boolean): 활성 상태
- `last_login` (timestamp): 마지막 로그인 시간
- `created_at` (timestamp): 생성일시
- `updated_at` (timestamp): 수정일시

**관계**:
- `users` → `applications` (1:N)
- `users` → `resumes` (1:N)
- `users` → `chat_rooms` (employer_id, candidate_id)
- `users` → `company_users` (1:N)

---

### 2. companies (기업 테이블)

**목적**: 등록된 기업 정보를 저장합니다.

**주요 컬럼**:
- `id` (serial, PK): 기업 고유 ID
- `name` (text, NOT NULL): 기업명
- `registration_number` (text): 사업자등록번호
- `logo` (text): 로고 URL
- `logo_format` (text): 로고 이미지 포맷
- `logo_size` (integer): 로고 파일 크기 (bytes)
- `size` (text): 기업 규모 - `"startup"` | `"small"` | `"medium"` | `"large"`
- `status` (text, NOT NULL): 승인 상태 - `"pending"` | `"approved"` | `"rejected"`
- `description` (text): 기업 설명
- `industry` (text): 산업 분야
- `location` (text): 위치
- `culture` (text): 기업 문화
- `benefits` (json): 복리후생 배열
- `website` (text): 웹사이트 URL
- `founded` (integer): 설립 연도
- `employee_count` (integer): 직원 수

**연락처 정보**:
- `email` (text): 이메일
- `phone` (text): 전화번호
- `address` (text): 주소

**소셜 미디어**:
- `linkedin` (text): LinkedIn URL
- `facebook` (text): Facebook URL
- `twitter` (text): Twitter URL
- `instagram` (text): Instagram URL

**기업 문화 및 비전**:
- `mission` (text): 미션
- `vision` (text): 비전
- `values` (json): 가치관 배열
- `is_detail_complete` (boolean): 상세정보 입력 완료 여부

**타임스탬프**:
- `created_at` (timestamp): 생성일시
- `updated_at` (timestamp): 수정일시

**관계**:
- `companies` → `jobs` (1:N)
- `companies` → `company_users` (1:N)
- `companies` → `company_reviews` (1:N)
- `companies` → `employment_history` (1:N)

---

### 3. company_users (회사-사용자 연결 테이블)

**목적**: 한 회사에 여러 사용자가 속할 수 있는 다대다 관계를 관리합니다.

**주요 컬럼**:
- `id` (serial, PK): 연결 고유 ID
- `user_id` (integer, FK → users.id): 사용자 ID
- `company_id` (integer, FK → companies.id): 기업 ID
- `role` (text, NOT NULL): 역할 - `"admin"` | `"editor"` | `"viewer"` | `"member"`
- `is_primary` (boolean): 기본 회사 여부
- `is_active` (boolean): 활성 상태
- `created_at` (timestamp): 생성일시
- `joined_at` (timestamp): 가입일시

**용도**:
- 한 사용자가 여러 회사에 속할 수 있음
- 각 회사에서의 역할을 구분
- 기본 회사 설정 가능

---

### 4. jobs (채용공고 테이블)

**목적**: 기업이 게시한 채용공고 정보를 저장합니다.

**주요 컬럼**:
- `id` (serial, PK): 채용공고 고유 ID
- `company_id` (integer, FK → companies.id): 기업 ID
- `title` (text, NOT NULL): 채용공고 제목
- `description` (text, NOT NULL): 채용공고 설명
- `requirements` (text): 요구사항
- `location` (text): 근무지
- `employment_type` (text): 고용 형태 - `"full_time"` | `"part_time"` | `"contract"` | `"internship"`
- `experience_level` (text): 경력 수준 - `"entry"` | `"junior"` | `"mid"` | `"senior"` | `"expert"`
- `salary_min` (integer): 최소 급여
- `salary_max` (integer): 최대 급여
- `skills` (json): 요구 기술 스택 배열
- `benefits` (json): 복리후생 배열
- `is_featured` (boolean): 추천 공고 여부
- `is_pro` (boolean): 프로 공고 여부
- `is_active` (boolean): 활성 상태
- `is_remote` (boolean): 원격근무 가능 여부
- `views` (integer): 조회수
- `status` (text): 상태 - `"active"` | `"inactive"` | `"closed"`
- `posted_at` (timestamp): 게시일시
- `expires_at` (timestamp): 만료일시
- `applications_count` (integer): 지원자 수
- `created_at` (timestamp): 생성일시
- `updated_at` (timestamp): 수정일시

**관계**:
- `jobs` → `applications` (1:N)
- `jobs` → `chat_rooms` (1:N)
- `jobs` → `saved_jobs` (1:N)

---

### 5. resumes (이력서 테이블)

**목적**: 구직자의 이력서 정보를 저장합니다.

**주요 컬럼**:
- `id` (serial, PK): 이력서 고유 ID
- `user_id` (integer, FK → users.id, NOT NULL): 사용자 ID
- `title` (varchar(255), NOT NULL): 이력서 제목
- `summary` (text): 요약

**JSONB 필드**:
- `basic_info` (jsonb): 기본 정보
  ```json
  {
    "fullName": string,
    "email": string,
    "phone": string,
    "address": string,
    "city": string,
    "country": string,
    "postalCode": string,
    "dateOfBirth": string,
    "nationality": string,
    "maritalStatus": string,
    "drivingLicense": boolean,
    "availability": string,
    "expectedSalary": string,
    "website": string?,
    "linkedin": string?,
    "github": string?,
    "portfolio": string?,
    "profilePicture": string?
  }
  ```

- `skills_and_languages` (jsonb): 기술 및 언어 능력
  ```json
  {
    "technicalSkills": Array<{
      "category": string,
      "skills": Array<{
        "name": string,
        "level": "Beginner" | "Intermediate" | "Advanced" | "Expert"
      }>
    }>,
    "softSkills": string[],
    "languages": Array<{
      "name": string,
      "proficiency": "Native" | "Fluent" | "Conversational" | "Basic",
      "certification": string?
    }>,
    "certifications": Array<{
      "name": string,
      "issuer": string,
      "date": string,
      "expiryDate": string?,
      "credentialId": string?
    }>
  }
  ```

- `portfolio` (jsonb): 포트폴리오 프로젝트 배열
  ```json
  Array<{
    "id": string,
    "title": string,
    "description": string,
    "images": string[],
    "category": string,
    "tags": string[],
    "url": string?,
    "completionDate": string,
    "client": string?,
    "role": string
  }>
  ```

- `education` (jsonb): 학력 배열
  ```json
  Array<{
    "institution": string,
    "degree": string,
    "field": string,
    "startDate": string,
    "endDate": string?,
    "current": boolean,
    "gpa": string?,
    "description": string?,
    "achievements": string[]?
  }>
  ```

- `work_history` (jsonb): 근무 이력 배열
  ```json
  Array<{
    "company": string,
    "position": string,
    "startDate": string,
    "endDate": string?,
    "current": boolean,
    "description": string,
    "achievements": string[]
  }>
  ```

- `additional_info` (jsonb): 기타 정보
  ```json
  {
    "hobbies": string[],
    "volunteerWork": Array<{...}>,
    "awards": Array<{...}>,
    "references": Array<{...}>,
    "additionalSkills": string[],
    "personalStatement": string,
    "careerObjective": string
  }
  ```

**설정 필드**:
- `visibility` (varchar(50)): 공개 설정
- `template_style` (varchar(50)): 템플릿 스타일
- `is_default` (boolean): 기본 이력서 여부
- `is_public` (boolean): 공개 여부
- `file_url` (varchar(500)): 파일 URL
- `file_name` (varchar(255)): 파일명
- `file_size` (integer): 파일 크기

**타임스탬프**:
- `created_at` (timestamp): 생성일시
- `updated_at` (timestamp): 수정일시

**관계**:
- `resumes` → `applications` (1:N)

---

### 6. applications (지원서 테이블)

**목적**: 구직자가 채용공고에 지원한 정보를 저장합니다.

**주요 컬럼**:
- `id` (serial, PK): 지원서 고유 ID
- `user_id` (integer, FK → users.id): 지원자 ID
- `job_id` (integer, FK → jobs.id): 채용공고 ID
- `resume_id` (integer, FK → resumes.id): 사용한 이력서 ID
- `status` (text, NOT NULL): 지원 상태 - `"pending"` | `"reviewed"` | `"interview"` | `"accepted"` | `"rejected"`
- `cover_letter` (text): 자기소개서
- `resume` (text): 이력서 텍스트 (레거시)
- `applied_at` (timestamp): 지원일시

**관계**:
- `applications` ← `users` (N:1)
- `applications` ← `jobs` (N:1)
- `applications` ← `resumes` (N:1)

---

### 7. saved_jobs (저장한 채용공고 테이블)

**목적**: 구직자가 관심 있는 채용공고를 저장합니다.

**주요 컬럼**:
- `id` (serial, PK): 저장 고유 ID
- `user_id` (integer, FK → users.id): 사용자 ID
- `job_id` (integer, FK → jobs.id): 채용공고 ID
- `saved_at` (timestamp): 저장일시

**용도**:
- 사용자가 나중에 다시 보고 싶은 채용공고 저장
- 북마크 기능

---

### 8. chat_rooms (채팅방 테이블)

**목적**: 구인자와 구직자 간의 채팅방을 관리합니다.

**주요 컬럼**:
- `id` (serial, PK): 채팅방 고유 ID
- `employer_id` (integer, FK → users.id): 구인자 ID
- `candidate_id` (integer, FK → users.id): 구직자 ID
- `job_id` (integer, FK → jobs.id): 관련 채용공고 ID
- `status` (text, NOT NULL): 채팅방 상태 - `"active"` | `"closed"` | `"pending_reopen"`
- `closed_by` (integer, FK → users.id): 채팅방을 닫은 사용자 ID
- `closed_at` (timestamp): 닫힌 시간
- `reopen_requested_by` (integer, FK → users.id): 재개 요청한 사용자 ID
- `reopen_requested_at` (timestamp): 재개 요청 시간
- `last_message_at` (timestamp): 마지막 메시지 시간
- `created_at` (timestamp): 생성일시

**규칙**:
- 구인자만 채팅을 시작할 수 있음
- 한 채용공고당 한 구직자와 하나의 채팅방만 존재 가능

**관계**:
- `chat_rooms` → `chat_messages` (1:N)
- `chat_rooms` ← `users` (employer_id, candidate_id)
- `chat_rooms` ← `jobs` (N:1)

---

### 9. chat_messages (채팅 메시지 테이블)

**목적**: 채팅방의 메시지를 저장합니다.

**주요 컬럼**:
- `id` (serial, PK): 메시지 고유 ID
- `room_id` (integer, FK → chat_rooms.id): 채팅방 ID
- `sender_id` (integer, FK → users.id): 발신자 ID
- `message` (text, NOT NULL): 메시지 내용
- `message_type` (text): 메시지 유형 - `"text"` | `"file"` | `"image"`
- `is_read` (boolean): 읽음 여부
- `is_deleted` (boolean): 삭제 여부
- `sent_at` (timestamp): 전송일시

**관계**:
- `chat_messages` ← `chat_rooms` (N:1)
- `chat_messages` ← `users` (N:1)

---

### 10. employment_history (근무 이력 테이블)

**목적**: 사용자의 근무 이력을 저장합니다.

**주요 컬럼**:
- `id` (serial, PK): 근무 이력 고유 ID
- `user_id` (integer, FK → users.id): 사용자 ID
- `company_id` (integer, FK → companies.id): 기업 ID
- `position` (text, NOT NULL): 직책
- `department` (text): 부서
- `start_date` (timestamp, NOT NULL): 시작일
- `end_date` (timestamp): 종료일
- `is_current_job` (boolean): 현재 직장 여부
- `employment_type` (text, NOT NULL): 고용 형태
- `salary` (integer): 급여
- `description` (text): 설명
- `skills` (json): 사용한 기술 스택 배열
- `achievements` (json): 성과 배열
- `status` (text, NOT NULL): 상태 - `"pending"` | `"approved"` | `"rejected"` | `"terminated"`
- `approved_by` (integer, FK → users.id): 승인한 사용자 ID
- `approved_at` (timestamp): 승인일시
- `terminated_by` (integer, FK → users.id): 해고한 사용자 ID
- `termination_reason` (text): 해고 사유
- `terminated_at` (timestamp): 해고일시
- `created_at` (timestamp): 생성일시
- `updated_at` (timestamp): 수정일시

**관계**:
- `employment_history` ← `users` (N:1)
- `employment_history` ← `companies` (N:1)
- `employment_history` → `evaluations` (1:N)
- `employment_history` → `company_reviews` (1:N)

---

### 11. evaluations (평가 테이블)

**목적**: 직원과 기업 간의 상호 평가를 저장합니다.

**주요 컬럼**:
- `id` (serial, PK): 평가 고유 ID
- `user_id` (integer, FK → users.id): 평가 받는 사람 ID
- `evaluator_id` (integer, FK → users.id): 평가하는 사람 ID
- `company_id` (integer, FK → companies.id): 기업 ID
- `employment_id` (integer, FK → employment_history.id): 근무 이력 ID
- `evaluation_type` (text, NOT NULL): 평가 유형 - `"performance"` | `"conduct"` | `"skills"`
- `overall_rating` (integer, NOT NULL): 전체 평점 (1-5)
- `skill_rating` (integer): 기술 평점
- `communication_rating` (integer): 소통 평점
- `teamwork_rating` (integer): 팀워크 평점
- `leadership_rating` (integer): 리더십 평점
- `innovation_rating` (integer): 혁신 평점
- `reliability_rating` (integer): 신뢰도 평점
- `comments` (text): 코멘트
- `strengths` (json): 강점 배열
- `improvements` (json): 개선점 배열
- `goals` (json): 목표 배열
- `evaluator_type` (text, NOT NULL): 평가자 유형 - `"supervisor"` | `"peer"` | `"subordinate"` | `"self"`
- `evaluation_period` (text): 평가 기간
- `is_public` (boolean): 공개 여부
- `created_at` (timestamp): 생성일시

**관계**:
- `evaluations` ← `users` (user_id, evaluator_id)
- `evaluations` ← `companies` (N:1)
- `evaluations` ← `employment_history` (N:1)

---

### 12. company_reviews (기업 리뷰 테이블)

**목적**: 전직/현직 직원이 작성한 기업 리뷰를 저장합니다.

**주요 컬럼**:
- `id` (serial, PK): 리뷰 고유 ID
- `user_id` (integer, FK → users.id): 작성자 ID
- `company_id` (integer, FK → companies.id): 기업 ID
- `employment_id` (integer, FK → employment_history.id): 근무 이력 ID
- `title` (text, NOT NULL): 리뷰 제목
- `overall_rating` (integer, NOT NULL): 전체 평점 (1-5)
- `work_life_balance` (integer): 워라밸 평점
- `culture` (integer): 문화 평점
- `management` (integer): 경영 평점
- `career_growth` (integer): 성장 기회 평점
- `compensation` (integer): 보상 평점
- `benefits` (integer): 복리후생 평점
- `position` (text): 직책
- `department` (text): 부서
- `employment_type` (text): 고용 형태
- `work_period` (text): 근무 기간
- `pros` (text): 장점
- `cons` (text): 단점
- `advice` (text): 조언
- `is_anonymous` (boolean): 익명 여부
- `is_public` (boolean): 공개 여부
- `is_verified` (boolean): 검증 여부
- `verified_at` (timestamp): 검증일시
- `created_at` (timestamp): 생성일시

**관계**:
- `company_reviews` ← `users` (N:1)
- `company_reviews` ← `companies` (N:1)
- `company_reviews` ← `employment_history` (N:1)

---

### 13. subscriptions (구독 테이블)

**목적**: 사용자의 구독 정보를 저장합니다.

**주요 컬럼**:
- `id` (serial, PK): 구독 고유 ID
- `user_id` (integer, FK → users.id): 사용자 ID
- `plan_type` (text, NOT NULL): 구독 플랜 - `"basic"` | `"premium"` | `"enterprise"`
- `status` (text, NOT NULL): 상태 - `"active"` | `"cancelled"` | `"expired"`
- `start_date` (timestamp): 시작일
- `end_date` (timestamp): 종료일
- `price` (integer, NOT NULL): 가격
- `features` (json): 포함 기능 배열
- `auto_renew` (boolean): 자동 갱신 여부
- `created_at` (timestamp): 생성일시
- `updated_at` (timestamp): 수정일시

**관계**:
- `subscriptions` ← `users` (N:1)

---

### 14. payment_settlements (정산 테이블)

**목적**: 기업의 결제 및 정산 정보를 저장합니다.

**주요 컬럼**:
- `id` (serial, PK): 정산 고유 ID
- `company_id` (integer, FK → companies.id): 기업 ID
- `job_id` (integer, FK → jobs.id): 채용공고 ID
- `amount` (decimal(15,2), NOT NULL): 금액
- `type` (varchar(50), NOT NULL): 정산 유형
- `status` (varchar(20), NOT NULL): 상태 - `"pending"` | `"completed"` | `"failed"` | `"cancelled"`
- `payment_method` (varchar(50)): 결제 방법
- `transaction_id` (varchar(255)): 거래 ID
- `settlement_date` (date): 정산일
- `created_at` (timestamp): 생성일시
- `updated_at` (timestamp): 수정일시

**관계**:
- `payment_settlements` ← `companies` (N:1)
- `payment_settlements` ← `jobs` (N:1)

---

### 15. platform_analytics (플랫폼 분석 테이블)

**목적**: 플랫폼의 일일 통계를 저장합니다.

**주요 컬럼**:
- `id` (serial, PK): 분석 고유 ID
- `date` (date, NOT NULL, UNIQUE): 날짜
- `total_revenue` (decimal(15,2)): 총 수익
- `job_posting_revenue` (decimal(15,2)): 채용공고 수익
- `subscription_revenue` (decimal(15,2)): 구독 수익
- `total_users` (integer): 총 사용자 수
- `new_users` (integer): 신규 사용자 수
- `total_companies` (integer): 총 기업 수
- `new_companies` (integer): 신규 기업 수
- `total_jobs` (integer): 총 채용공고 수
- `new_jobs` (integer): 신규 채용공고 수
- `total_applications` (integer): 총 지원 수
- `created_at` (timestamp): 생성일시

**용도**:
- 일일 통계 집계
- 대시보드 데이터 제공
- 트렌드 분석

---

### 16. system_settings (시스템 설정 테이블)

**목적**: 플랫폼의 시스템 설정을 저장합니다.

**주요 컬럼**:
- `id` (serial, PK): 설정 고유 ID
- `key` (varchar(255), NOT NULL, UNIQUE): 설정 키
- `value` (text): 설정 값
- `description` (text): 설명
- `category` (varchar(100)): 카테고리
- `type` (varchar(50)): 값 타입 - `"string"` | `"number"` | `"boolean"` | `"json"`
- `created_at` (timestamp): 생성일시
- `updated_at` (timestamp): 수정일시

**용도**:
- 플랫폼 전역 설정 관리
- 동적 설정 변경

---

### 17. admin_activity_logs (관리자 활동 로그 테이블)

**목적**: 관리자의 활동을 기록합니다.

**주요 컬럼**:
- `id` (serial, PK): 로그 고유 ID
- `admin_id` (integer, FK → users.id): 관리자 ID
- `action` (varchar(255), NOT NULL): 수행한 액션
- `target_type` (varchar(100)): 대상 타입
- `target_id` (integer): 대상 ID
- `details` (jsonb): 상세 정보
- `ip_address` (varchar(45)): IP 주소
- `user_agent` (text): User Agent
- `created_at` (timestamp): 생성일시

**용도**:
- 관리자 활동 감사
- 보안 추적
- 문제 해결

---

### 18. pricing_plans (요금제 테이블)

**목적**: 플랫폼의 요금제 정보를 저장합니다.

**주요 컬럼**:
- `id` (serial, PK): 요금제 고유 ID
- `name` (varchar(255), NOT NULL): 요금제명
- `description` (text): 설명
- `price` (decimal(10,2), NOT NULL): 가격
- `currency` (varchar(3)): 통화 (기본값: MNT)
- `duration_days` (integer, NOT NULL): 기간 (일)
- `features` (jsonb): 포함 기능
- `is_active` (boolean): 활성 여부
- `created_at` (timestamp): 생성일시
- `updated_at` (timestamp): 수정일시

**관계**:
- `pricing_plans` → `subscriptions` (간접)

---

### 19. banners (배너 테이블)

**목적**: 플랫폼의 광고 배너를 관리합니다.

**주요 컬럼**:
- `id` (serial, PK): 배너 고유 ID
- `title` (varchar(255), NOT NULL): 배너 제목
- `content` (text): 배너 내용
- `image_url` (text): 이미지 URL
- `link_url` (text): 링크 URL
- `position` (varchar(50), NOT NULL): 배치 위치
- `priority` (integer): 우선순위
- `background_color` (varchar(7)): 배경색
- `text_color` (varchar(7)): 텍스트 색상
- `is_active` (boolean): 활성 여부
- `start_date` (timestamp): 시작일
- `end_date` (timestamp): 종료일
- `click_count` (integer): 클릭 수
- `view_count` (integer): 조회 수
- `created_by` (integer, FK → users.id): 생성자 ID
- `created_at` (timestamp): 생성일시
- `updated_at` (timestamp): 수정일시

**관계**:
- `banners` ← `users` (N:1)

---

## 데이터베이스 관계도 (ERD)

```
users
├── applications (1:N)
├── resumes (1:N)
├── chat_rooms (employer_id, candidate_id)
├── company_users (1:N)
├── subscriptions (1:N)
└── admin_activity_logs (admin_id)

companies
├── jobs (1:N)
├── company_users (1:N)
├── company_reviews (1:N)
├── employment_history (1:N)
└── payment_settlements (1:N)

jobs
├── applications (1:N)
├── chat_rooms (1:N)
├── saved_jobs (1:N)
└── payment_settlements (1:N)

chat_rooms
└── chat_messages (1:N)

employment_history
├── evaluations (1:N)
└── company_reviews (1:N)
```

---

## ChatGPT 통합 가이드

### 1. 데이터 조회 패턴

#### 사용자 정보 조회
```sql
-- 특정 사용자 정보
SELECT * FROM users WHERE id = ?;

-- 사용자 유형별 조회
SELECT * FROM users WHERE user_type = 'candidate';

-- 이메일로 사용자 찾기
SELECT * FROM users WHERE email = ?;
```

#### 채용공고 조회
```sql
-- 활성 채용공고 목록
SELECT j.*, c.name as company_name 
FROM jobs j 
JOIN companies c ON j.company_id = c.id 
WHERE j.is_active = true 
ORDER BY j.created_at DESC;

-- 특정 기업의 채용공고
SELECT * FROM jobs WHERE company_id = ? AND is_active = true;
```

#### 지원자 정보 조회
```sql
-- 특정 채용공고의 지원자 목록
SELECT a.*, u.full_name, u.email, r.title as resume_title
FROM applications a
JOIN users u ON a.user_id = u.id
LEFT JOIN resumes r ON a.resume_id = r.id
WHERE a.job_id = ?;
```

#### 채팅 메시지 조회
```sql
-- 채팅방의 메시지 목록
SELECT cm.*, u.full_name as sender_name
FROM chat_messages cm
JOIN users u ON cm.sender_id = u.id
WHERE cm.room_id = ?
ORDER BY cm.sent_at ASC;
```

### 2. 데이터 생성 패턴

#### 새 사용자 생성
```sql
INSERT INTO users (email, password, full_name, user_type, ...)
VALUES (?, ?, ?, ?, ...);
```

#### 새 채용공고 생성
```sql
INSERT INTO jobs (company_id, title, description, ...)
VALUES (?, ?, ?, ...);
```

#### 지원서 제출
```sql
INSERT INTO applications (user_id, job_id, resume_id, status, cover_letter)
VALUES (?, ?, ?, 'pending', ?);
```

### 3. 데이터 업데이트 패턴

#### 사용자 정보 업데이트
```sql
UPDATE users 
SET full_name = ?, bio = ?, skills = ?, updated_at = NOW()
WHERE id = ?;
```

#### 지원 상태 변경
```sql
UPDATE applications 
SET status = ?, updated_at = NOW()
WHERE id = ?;
```

#### 채팅방 상태 변경
```sql
UPDATE chat_rooms 
SET status = 'closed', closed_by = ?, closed_at = NOW()
WHERE id = ?;
```

### 4. 데이터 삭제 패턴

**주의**: 실제 삭제 대신 소프트 삭제를 사용하는 것이 좋습니다.

```sql
-- 소프트 삭제 예시
UPDATE chat_messages 
SET is_deleted = true 
WHERE id = ?;

-- 사용자 비활성화
UPDATE users 
SET is_active = false 
WHERE id = ?;
```

---

## ChatGPT가 주의해야 할 사항

### 1. 데이터 무결성
- 외래키 제약 조건을 항상 확인
- 필수 필드(NOT NULL)는 반드시 포함
- UNIQUE 제약 조건 위반 방지

### 2. 사용자 유형별 권한
- `candidate`: 채용공고 조회, 지원, 이력서 관리
- `employer`: 채용공고 작성, 지원자 관리, 채팅 시작
- `admin`: 모든 기능 접근

### 3. 채팅 규칙
- 구인자만 채팅을 시작할 수 있음
- 한 채용공고당 한 구직자와 하나의 채팅방만 존재

### 4. 몽골 ID 형식
- 몽골 ID는 2자리 몽골어 + 8자리 숫자
- UNIQUE 제약 조건이 있으므로 중복 확인 필요

### 5. JSON 필드 처리
- `skills`, `benefits`, `features` 등은 JSON 배열
- PostgreSQL의 JSON 연산자 사용: `->`, `->>`, `@>`

### 6. 타임스탬프 관리
- `created_at`, `updated_at` 자동 관리
- `NOW()` 또는 `CURRENT_TIMESTAMP` 사용

### 7. 트랜잭션 처리
- 여러 테이블에 걸친 작업은 트랜잭션 사용
- 롤백 가능하도록 설계

---

## 예제 쿼리 모음

### 사용자 관련
```sql
-- 구직자 프로필 조회 (이력서 포함)
SELECT u.*, r.*
FROM users u
LEFT JOIN resumes r ON u.id = r.user_id AND r.is_default = true
WHERE u.id = ? AND u.user_type = 'candidate';

-- 구인자와 연결된 기업 정보
SELECT u.*, c.*, cu.role as company_role
FROM users u
JOIN company_users cu ON u.id = cu.user_id
JOIN companies c ON cu.company_id = c.id
WHERE u.id = ? AND u.user_type = 'employer';
```

### 채용공고 관련
```sql
-- 추천 채용공고 (구직자 프로필 기반)
SELECT j.*, c.name as company_name
FROM jobs j
JOIN companies c ON j.company_id = c.id
WHERE j.is_active = true
  AND j.skills @> ?::jsonb  -- 사용자 기술 스택과 매칭
ORDER BY j.is_featured DESC, j.created_at DESC;

-- 채용공고 통계
SELECT 
  COUNT(*) as total_applications,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
  COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted
FROM applications
WHERE job_id = ?;
```

### 채팅 관련
```sql
-- 사용자의 채팅방 목록 (최신 메시지 포함)
SELECT 
  cr.*,
  u1.full_name as employer_name,
  u2.full_name as candidate_name,
  j.title as job_title,
  (SELECT message FROM chat_messages 
   WHERE room_id = cr.id 
   ORDER BY sent_at DESC LIMIT 1) as last_message
FROM chat_rooms cr
JOIN users u1 ON cr.employer_id = u1.id
JOIN users u2 ON cr.candidate_id = u2.id
JOIN jobs j ON cr.job_id = j.id
WHERE cr.employer_id = ? OR cr.candidate_id = ?
ORDER BY cr.last_message_at DESC;
```

---

## 보안 고려사항

1. **비밀번호**: 절대 평문 저장 금지, 해시화 필수
2. **SQL Injection**: 파라미터화된 쿼리 사용
3. **권한 검증**: 쿼리 실행 전 사용자 권한 확인
4. **개인정보**: 민감 정보 접근 시 로그 기록
5. **Rate Limiting**: API 호출 제한 적용

---

## 성능 최적화 팁

1. **인덱스 활용**: 자주 조회되는 컬럼에 인덱스 생성
2. **JOIN 최소화**: 필요한 데이터만 조회
3. **페이지네이션**: 대량 데이터는 LIMIT/OFFSET 사용
4. **캐싱**: 자주 조회되는 데이터는 캐시 활용
5. **JSON 필드**: JSONB 타입 사용으로 인덱싱 가능

---

## 마이그레이션 가이드

스키마 변경 시:
1. `shared/schema.ts` 수정
2. Drizzle migration 생성: `npm run db:generate`
3. Migration 실행: `npm run db:migrate`
4. 스키마 문서 업데이트

---

**마지막 업데이트**: 2025년 1월
**문서 버전**: 1.0

