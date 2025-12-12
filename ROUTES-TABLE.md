# Wouter 라우트 설정 - 등록된 경로 목록

## 📍 라우트 설정 파일 위치
**파일**: `client/src/App.tsx`  
**라우터**: Wouter (Switch, Route)

---

## 📊 등록된 경로 목록

### 1. 공개 라우트 (Public Routes) - 모든 사용자 접근 가능

| 경로 | 컴포넌트 | 설명 | 권한 |
|------|---------|------|------|
| `/` | `Home` | 홈페이지 | 모든 사용자 |
| `/login` | `Login` | 로그인 페이지 | 모든 사용자 |
| `/register` | `Register` | 회원가입 페이지 | 모든 사용자 |
| `/pricing` | `Pricing` | 가격표 페이지 | 모든 사용자 |

---

### 2. 사용자 라우트 (User Routes) - 모든 사용자 접근 가능

| 경로 | 컴포넌트 | 설명 | 권한 |
|------|---------|------|------|
| `/user` | Redirect → `/user/home` | 사용자 홈 리다이렉트 | 모든 사용자 |
| `/user/home` | `UserHome` | 구직자 홈 대시보드 | 구직자만 (candidate) |
| `/user/jobs` | `Jobs` | 채용공고 목록 | 모든 사용자 |
| `/user/jobs/:id` | `JobDetail` | 채용공고 상세 | 모든 사용자 |
| `/user/companies` | `Companies` | 기업 목록 | 모든 사용자 |
| `/user/companies/:id` | `CompanyDetail` | 기업 상세 | 모든 사용자 |
| `/user/career` | `Career` | 커리어 가이드 | 모든 사용자 |
| `/user/feed` | `Feed` | 커뮤니티 피드 | 모든 사용자 |

---

### 3. 보호된 사용자 라우트 (Protected User Routes) - 인증 필요

| 경로 | 컴포넌트 | 설명 | 권한 |
|------|---------|------|------|
| `/user/chat` | `UserChat` | 사용자 채팅 | 모든 인증 사용자 |
| `/user/profile` | `UserProfile` | 사용자 프로필 | 모든 인증 사용자 |
| `/user/settings` | `UserSettings` | 사용자 설정 | 모든 인증 사용자 |
| `/user/resumes` | `UserResumes` | 이력서 관리 | 구직자만 (candidate) |
| `/user/applications` | `UserApplications` | 지원 현황 | 구직자만 (candidate) |
| `/user/saved-jobs` | `SavedJobs` | 저장된 채용공고 | 구직자만 (candidate) |
| `/user/notifications` | `UserNotifications` | 알림 | 모든 인증 사용자 |

---

### 4. 기업 라우트 (Company Routes) - 기업 사용자만 접근

| 경로 | 컴포넌트 | 설명 | 권한 |
|------|---------|------|------|
| `/company` | Redirect → `/company/dashboard` | 기업 대시보드 리다이렉트 | 기업 (employer) |
| `/company/dashboard` | `CompanyDashboard` | 기업 대시보드 | 기업 (employer) |
| `/company/jobs` | `CompanyJobs` | 채용공고 관리 | 기업 (employer) |
| `/company/applications` | `CompanyApplications` | 지원자 관리 | 기업 (employer) |
| `/company/pipeline` | `CompanyPipeline` | 채용 파이프라인 | 기업 (employer) |
| `/company/interviews` | `CompanyInterviews` | 면접 관리 | 기업 (employer) |
| `/company/recommendations` | `CompanyRecommendations` | 인재 추천 | 기업 (employer) |
| `/company/analytics` | `CompanyAnalytics` | 분석 | 기업 (employer) |
| `/company/employees` | `CompanyEmployees` | 직원 관리 | 기업 (employer) |
| `/company/talents` | `CompanyTalents` | 인재 검색 | 기업 (employer) |
| `/company/chat` | `CompanyChat` | 기업 채팅 | 기업 (employer) |
| `/company/branding` | `CompanyBranding` | 브랜딩 | 기업 (employer) |
| `/company/settings` | `CompanySettings` | 기업 설정 | 기업 (employer) |
| `/company/profile` | Redirect → `/company/info` | 프로필 리다이렉트 | 기업 (employer) |
| `/company/info` | `CompanyInfo` | 회사 정보 | 기업 (employer) |
| `/company/notifications` | `CompanyNotifications` | 기업 알림 | 기업 (employer) |

---

### 5. 관리자 라우트 (Admin Routes) - 관리자만 접근

| 경로 | 컴포넌트 | 설명 | 권한 |
|------|---------|------|------|
| `/admin` | Redirect → `/admin/dashboard` | 관리자 대시보드 리다이렉트 | 관리자 (admin) |
| `/admin/dashboard` | `AdminDashboard` | 관리자 대시보드 | 관리자 (admin) |
| `/admin/users` | `AdminUsers` | 사용자 계정 관리 | 관리자 (admin) |
| `/admin/companies` | `AdminCompanies` | 기업 계정 관리 | 관리자 (admin) |
| `/admin/companies/:id` | `AdminCompanyDetail` | 기업 상세 관리 | 관리자 (admin) |
| `/admin/jobs` | `AdminJobs` | 채용공고 관리 | 관리자 (admin) |
| `/admin/roles` | `AdminRoles` | 역할 관리 | 관리자 (admin) |
| `/admin/monitoring` | `AdminMonitoring` | 시스템 모니터링 | 관리자 (admin) |
| `/admin/settlements` | `AdminSettlements` | 정산 관리 | 관리자 (admin) |
| `/admin/analytics` | `AdminAnalytics` | 통계 분석 | 관리자 (admin) |
| `/admin/settings` | `AdminSettings` | 시스템 설정 | 관리자 (admin) |
| `/admin/banners` | `AdminBanners` | 배너 관리 | 관리자 (admin) |
| `/admin/job-options` | `AdminJobOptions` | 채용공고 옵션 관리 | 관리자 (admin) |
| `/admin/preferred-industries` | `AdminPreferredIndustries` | 희망 근무 분야 관리 | 관리자 (admin) |
| `/admin/career` | `AdminCareer` | 커리어 가이드 관리 | 관리자 (admin) |
| `/admin/skills` | `AdminSkills` | 스킬 마스터 관리 | 관리자 (admin) |
| `/admin/chat` | `AdminChat` | 채팅 모니터링 | 관리자 (admin) |
| `/admin/community` | `AdminCommunity` | 커뮤니티 관리 | 관리자 (admin) |

---

### 6. 레거시 리다이렉트 (Legacy Redirects) - 하위 호환성

| 경로 | 리다이렉트 대상 | 설명 |
|------|----------------|------|
| `/jobs` | `/user/jobs` | 채용공고 목록 (구버전) |
| `/jobs/:id` | `JobDetail` | 채용공고 상세 (구버전) |
| `/companies` | `/user/companies` | 기업 목록 (구버전) |
| `/companies/:id` | `CompanyDetail` | 기업 상세 (구버전) |
| `/talent` | `/company/talents` | 인재 검색 (구버전) |
| `/career` | `/user/career` | 커리어 가이드 (구버전) |
| `/feed` | `/user/feed` | 피드 (구버전) |
| `/chat` | `/user/chat` | 채팅 (구버전) |
| `/employment` | `/company/employees` | 직원 관리 (구버전) |

---

### 7. 404 페이지

| 경로 | 컴포넌트 | 설명 |
|------|---------|------|
| `*` (기본) | `NotFound` | 404 페이지 (위의 모든 경로와 일치하지 않을 때) |

---

## 📈 통계

- **총 라우트 수**: 60개
- **공개 라우트**: 4개
- **사용자 라우트**: 8개
- **보호된 사용자 라우트**: 7개
- **기업 라우트**: 16개
- **관리자 라우트**: 18개
- **레거시 리다이렉트**: 9개
- **404 페이지**: 1개

---

## 🔐 권한 체계

### RoleGuard 사용
- `RoleGuard` 컴포넌트를 통해 사용자 유형별 접근 제어
- `allowedUserTypes`: 허용된 사용자 유형 배열
  - `['candidate']`: 구직자만
  - `['employer']`: 기업만
  - `['admin']`: 관리자만
  - `['candidate', 'employer', 'admin']`: 모든 인증 사용자

### ProtectedPage 사용
- `ProtectedPage` 컴포넌트로 인증 필요 페이지 보호
- 로그인하지 않은 사용자는 자동으로 로그인 페이지로 리다이렉트

---

## 📝 참고사항

1. **동적 라우트**: `:id` 파라미터를 사용하는 동적 라우트가 있습니다.
   - `/user/jobs/:id`
   - `/user/companies/:id`
   - `/admin/companies/:id`

2. **리다이렉트**: 일부 경로는 다른 경로로 자동 리다이렉트됩니다.
   - `/user` → `/user/home`
   - `/company` → `/company/dashboard`
   - `/admin` → `/admin/dashboard`
   - `/company/profile` → `/company/info`

3. **레거시 지원**: 구버전 경로를 신버전 경로로 리다이렉트하여 하위 호환성 유지

4. **404 처리**: 위의 모든 경로와 일치하지 않는 요청은 `NotFound` 컴포넌트로 처리됩니다.

---

**작성일**: 2025년  
**파일 위치**: `client/src/App.tsx`  
**라우터 라이브러리**: Wouter

