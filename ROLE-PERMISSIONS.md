# 역할별 권한 및 접근 제어 문서

이 문서는 Job Mongolia 플랫폼의 각 사용자 역할(Candidate, Employer, Admin)이 어떤 기능에 접근할 수 있고 없는지를 명확히 정의합니다.

**작성일**: 2025년  
**파일 위치**: `client/src/App.tsx`, `client/src/components/common/RoleGuard.tsx`

---

## 📋 목차

1. [사용자 역할 개요](#사용자-역할-개요)
2. [권한 체계](#권한-체계)
3. [역할별 접근 가능 페이지](#역할별-접근-가능-페이지)
4. [기능별 권한 매트릭스](#기능별-권한-매트릭스)
5. [API 엔드포인트 권한](#api-엔드포인트-권한)
6. [보안 가드](#보안-가드)

---

## 👥 사용자 역할 개요

### 1. Guest (비로그인 사용자)
- **설명**: 로그인하지 않은 모든 방문자
- **접근 가능**: 공개 페이지만 접근 가능

### 2. Candidate (구직자)
- **설명**: 채용공고를 보고 지원하는 사용자
- **접근 가능**: `/user/*` 경로의 모든 페이지

### 3. Employer (기업)
- **설명**: 채용공고를 작성하고 지원자를 관리하는 기업 사용자
- **접근 가능**: `/user/*` + `/company/*` 경로의 페이지

### 4. Admin (관리자)
- **설명**: 플랫폼 전체를 관리하는 슈퍼 관리자
- **접근 가능**: `/user/*` + `/admin/*` 경로의 페이지
- **주의**: `/company/*` 경로는 접근 불가 (관리자는 기업 대시보드 사용 불가)

---

## 🔐 권한 체계

### RoleGuard 컴포넌트
- **위치**: `client/src/components/common/RoleGuard.tsx`
- **기능**: 특정 사용자 유형만 접근 가능하도록 제한
- **사용법**: 
  ```tsx
  <RoleGuard allowedUserTypes={['candidate']}>
    <ProtectedPage><Component /></ProtectedPage>
  </RoleGuard>
  ```

### ProtectedPage 컴포넌트
- **위치**: `client/src/components/common/ProtectedPage.tsx`
- **기능**: 로그인하지 않은 사용자를 로그인 페이지로 리다이렉트
- **사용법**: 
  ```tsx
  <ProtectedPage><Component /></ProtectedPage>
  ```

---

## 📄 역할별 접근 가능 페이지

### 🌐 Guest (비로그인 사용자)

| 경로 | 페이지명 | 설명 | 접근 가능 |
|------|---------|------|----------|
| `/` | 홈페이지 | 메인 랜딩 페이지 | ✅ |
| `/login` | 로그인 | 로그인 페이지 | ✅ |
| `/register` | 회원가입 | 회원가입 페이지 | ✅ |
| `/pricing` | 요금제 | 요금제 안내 페이지 | ✅ |
| `/user/jobs` | 채용공고 목록 | 공개 채용공고 목록 | ✅ |
| `/user/jobs/:id` | 채용공고 상세 | 공개 채용공고 상세 | ✅ |
| `/user/companies` | 기업 목록 | 공개 기업 목록 | ✅ |
| `/user/companies/:id` | 기업 상세 | 공개 기업 상세 | ✅ |
| `/user/career` | 커리어 가이드 | 커리어 가이드 페이지 | ✅ |
| `/user/feed` | 피드 | 커뮤니티 피드 | ✅ |

**접근 불가**: 모든 `/user/*` 보호된 페이지, `/company/*`, `/admin/*`

---

### 👤 Candidate (구직자)

| 경로 | 페이지명 | 설명 | 접근 가능 |
|------|---------|------|----------|
| **공개 페이지** (Guest와 동일) | | | ✅ |
| `/user/home` | 구직자 홈 | 맞춤 추천 채용공고 | ✅ |
| `/user/profile` | 프로필 | 개인 프로필 관리 | ✅ |
| `/user/settings` | 설정 | 계정 설정 | ✅ |
| `/user/resumes` | 이력서 관리 | 이력서 작성/수정/삭제 | ✅ |
| `/user/applications` | 지원 현황 | 지원한 채용공고 목록 | ✅ |
| `/user/saved-jobs` | 저장한 채용공고 | 북마크한 채용공고 | ✅ |
| `/user/chat` | 채팅 | 지원자-기업 간 채팅 | ✅ |
| `/user/notifications` | 알림 | 알림 목록 | ✅ |

**접근 불가**: `/company/*`, `/admin/*`

---

### 🏢 Employer (기업)

| 경로 | 페이지명 | 설명 | 접근 가능 |
|------|---------|------|----------|
| **공개 페이지** (Guest와 동일) | | | ✅ |
| **구직자 페이지** (Candidate와 동일) | | | ✅ |
| `/company/dashboard` | 기업 대시보드 | 기업 통계 및 요약 | ✅ |
| `/company/jobs` | 채용공고 관리 | 채용공고 작성/수정/삭제 | ✅ |
| `/company/applications` | 지원자 관리 | 지원서 목록 및 관리 | ✅ |
| `/company/pipeline` | 파이프라인 | 지원자 파이프라인 관리 | ✅ |
| `/company/interviews` | 면접 관리 | 면접 일정 관리 | ✅ |
| `/company/recommendations` | 추천 인재 | 추천 인재 목록 | ✅ |
| `/company/analytics` | 분석 | 채용 분석 및 통계 | ✅ |
| `/company/employees` | 직원 관리 | 직원 목록 및 관리 | ✅ |
| `/company/talents` | 인재 풀 | 저장한 인재 목록 | ✅ |
| `/company/chat` | 기업 채팅 | 지원자와의 채팅 | ✅ |
| `/company/branding` | 브랜딩 | 기업 브랜딩 관리 | ✅ |
| `/company/settings` | 기업 설정 | 기업 계정 설정 | ✅ |
| `/company/info` | 기업 정보 | 기업 정보 관리 | ✅ |
| `/company/notifications` | 기업 알림 | 기업 알림 목록 | ✅ |

**접근 불가**: `/admin/*`

---

### 👨‍💼 Admin (관리자)

| 경로 | 페이지명 | 설명 | 접근 가능 |
|------|---------|------|----------|
| **공개 페이지** (Guest와 동일) | | | ✅ |
| **구직자 페이지** (일부) | | | ✅ |
| `/user/profile` | 프로필 | 개인 프로필 관리 | ✅ |
| `/user/settings` | 설정 | 계정 설정 | ✅ |
| `/user/chat` | 채팅 | 채팅 (모니터링용) | ✅ |
| `/user/notifications` | 알림 | 알림 목록 | ✅ |
| `/admin/dashboard` | 관리자 대시보드 | 플랫폼 전체 통계 | ✅ |
| `/admin/users` | 사용자 관리 | 사용자 계정 관리 | ✅ |
| `/admin/companies` | 기업 관리 | 기업 계정 승인/거부 | ✅ |
| `/admin/companies/:id` | 기업 상세 | 기업 상세 정보 및 사용자 관리 | ✅ |
| `/admin/jobs` | 채용공고 관리 | 채용공고 승인/거부 | ✅ |
| `/admin/roles` | 역할 관리 | 역할 및 권한 관리 | ✅ |
| `/admin/monitoring` | 모니터링 | 시스템 모니터링 | ✅ |
| `/admin/settlements` | 정산 관리 | 정산 관리 | ✅ |
| `/admin/analytics` | 분석 | 플랫폼 분석 | ✅ |
| `/admin/settings` | 시스템 설정 | 플랫폼 설정 | ✅ |
| `/admin/banners` | 배너 관리 | 배너 CRUD | ✅ |
| `/admin/job-options` | 채용 옵션 관리 | 고용 유형, 경력 레벨 등 | ✅ |
| `/admin/preferred-industries` | 선호 산업 관리 | 산업 분류 관리 | ✅ |
| `/admin/career` | 커리어 가이드 관리 | 커리어 가이드 콘텐츠 관리 | ✅ |
| `/admin/skills` | 스킬 마스터 관리 | 스킬 추가/수정/비활성화 | ✅ |
| `/admin/chat` | 채팅 모니터링 | 전체 채팅 모니터링 | ✅ |
| `/admin/community` | 커뮤니티 관리 | 커뮤니티 콘텐츠 관리 | ✅ |

**접근 불가**: `/company/*` (기업 대시보드 사용 불가), `/user/home`, `/user/resumes`, `/user/applications`, `/user/saved-jobs`

---

## 📊 기능별 권한 매트릭스

### 채용공고 관련

| 기능 | Guest | Candidate | Employer | Admin |
|------|-------|-----------|----------|-------|
| 채용공고 조회 | ✅ | ✅ | ✅ | ✅ |
| 채용공고 상세 보기 | ✅ | ✅ | ✅ | ✅ |
| 채용공고 지원 | ❌ | ✅ | ❌ | ❌ |
| 채용공고 작성 | ❌ | ❌ | ✅ | ✅ |
| 채용공고 수정 | ❌ | ❌ | ✅ (본인 회사만) | ✅ |
| 채용공고 삭제 | ❌ | ❌ | ✅ (본인 회사만) | ✅ |
| 채용공고 승인/거부 | ❌ | ❌ | ❌ | ✅ |
| 채용공고 상태 변경 | ❌ | ❌ | ✅ (본인 회사만) | ✅ |

### 지원서 관련

| 기능 | Guest | Candidate | Employer | Admin |
|------|-------|-----------|----------|-------|
| 지원서 작성 | ❌ | ✅ | ❌ | ❌ |
| 지원서 조회 | ❌ | ✅ (본인 지원서만) | ✅ (본인 회사만) | ✅ |
| 지원서 상태 변경 | ❌ | ❌ | ✅ (본인 회사만) | ✅ |
| 지원서 삭제 | ❌ | ✅ (본인 지원서만) | ❌ | ✅ |

### 이력서 관련

| 기능 | Guest | Candidate | Employer | Admin |
|------|-------|-----------|----------|-------|
| 이력서 작성 | ❌ | ✅ | ❌ | ❌ |
| 이력서 수정 | ❌ | ✅ (본인 이력서만) | ❌ | ❌ |
| 이력서 삭제 | ❌ | ✅ (본인 이력서만) | ❌ | ❌ |
| 이력서 조회 | ❌ | ✅ (본인 이력서만) | ✅ (지원자 이력서만) | ✅ |

### 기업 관련

| 기능 | Guest | Candidate | Employer | Admin |
|------|-------|-----------|----------|-------|
| 기업 조회 | ✅ | ✅ | ✅ | ✅ |
| 기업 정보 수정 | ❌ | ❌ | ✅ (본인 회사만) | ✅ |
| 기업 승인/거부 | ❌ | ❌ | ❌ | ✅ |
| 기업 사용자 관리 | ❌ | ❌ | ✅ (본인 회사만) | ✅ |

### 채팅 관련

| 기능 | Guest | Candidate | Employer | Admin |
|------|-------|-----------|----------|-------|
| 채팅 시작 | ❌ | ✅ | ✅ | ✅ |
| 채팅 메시지 보내기 | ❌ | ✅ | ✅ | ✅ |
| 채팅방 조회 | ❌ | ✅ (본인 채팅방만) | ✅ (본인 회사 채팅방만) | ✅ |
| 채팅 모니터링 | ❌ | ❌ | ❌ | ✅ |

### 알림 관련

| 기능 | Guest | Candidate | Employer | Admin |
|------|-------|-----------|----------|-------|
| 알림 조회 | ❌ | ✅ | ✅ | ✅ |
| 알림 읽음 처리 | ❌ | ✅ | ✅ | ✅ |
| 알림 삭제 | ❌ | ✅ | ✅ | ✅ |

### 관리자 기능

| 기능 | Guest | Candidate | Employer | Admin |
|------|-------|-----------|----------|-------|
| 사용자 관리 | ❌ | ❌ | ❌ | ✅ |
| 기업 관리 | ❌ | ❌ | ❌ | ✅ |
| 채용공고 승인 | ❌ | ❌ | ❌ | ✅ |
| 배너 관리 | ❌ | ❌ | ❌ | ✅ |
| 스킬 마스터 관리 | ❌ | ❌ | ❌ | ✅ |
| 시스템 설정 | ❌ | ❌ | ❌ | ✅ |
| 분석 및 통계 | ❌ | ❌ | ✅ (본인 회사만) | ✅ |

---

## 🔌 API 엔드포인트 권한

### 공개 API (인증 불필요)

| 엔드포인트 | 메서드 | 설명 | 접근 가능 |
|-----------|--------|------|----------|
| `/api/jobs` | GET | 공개 채용공고 목록 | ✅ 모든 사용자 |
| `/api/jobs/:id` | GET | 채용공고 상세 | ✅ 모든 사용자 |
| `/api/companies` | GET | 공개 기업 목록 | ✅ 모든 사용자 |
| `/api/companies/:id` | GET | 기업 상세 | ✅ 모든 사용자 |
| `/api/banners` | GET | 배너 목록 | ✅ 모든 사용자 |

### 구직자 API (Candidate만)

| 엔드포인트 | 메서드 | 설명 | 접근 가능 |
|-----------|--------|------|----------|
| `/api/applications` | POST | 지원서 작성 | ✅ Candidate |
| `/api/applications/user/:id` | GET | 지원서 목록 | ✅ Candidate (본인만) |
| `/api/resumes` | GET/POST/PUT/DELETE | 이력서 관리 | ✅ Candidate (본인만) |
| `/api/saved-jobs` | GET/POST/DELETE | 저장한 채용공고 | ✅ Candidate (본인만) |
| `/api/jobs/recommended` | GET | 추천 채용공고 | ✅ Candidate |

### 기업 API (Employer만)

| 엔드포인트 | 메서드 | 설명 | 접근 가능 |
|-----------|--------|------|----------|
| `/api/company/jobs` | GET/POST | 채용공고 관리 | ✅ Employer (본인 회사만) |
| `/api/company/jobs/:id` | PUT/DELETE/PATCH | 채용공고 수정/삭제/상태 변경 | ✅ Employer (본인 회사만) |
| `/api/company/applications` | GET | 지원서 목록 | ✅ Employer (본인 회사만) |
| `/api/applications/:id` | PATCH | 지원서 상태 변경 | ✅ Employer (본인 회사만) |
| `/api/company/employees` | GET/POST/PUT/DELETE | 직원 관리 | ✅ Employer (본인 회사만) |
| `/api/companies/profile` | GET/PUT | 기업 정보 관리 | ✅ Employer (본인 회사만) |

### 관리자 API (Admin만)

| 엔드포인트 | 메서드 | 설명 | 접근 가능 |
|-----------|--------|------|----------|
| `/api/admin/jobs` | GET | 채용공고 목록 (전체) | ✅ Admin |
| `/api/admin/jobs/:id/approve` | POST | 채용공고 승인 | ✅ Admin |
| `/api/admin/jobs/:id/reject` | POST | 채용공고 거부 | ✅ Admin |
| `/api/admin/companies` | GET | 기업 목록 (전체) | ✅ Admin |
| `/api/admin/companies/:id` | GET/PUT/PATCH | 기업 관리 | ✅ Admin |
| `/api/admin/companies/:id/approve` | POST | 기업 승인 | ✅ Admin |
| `/api/admin/companies/:id/reject` | POST | 기업 거부 | ✅ Admin |
| `/api/admin/companies/:id/users` | GET/POST/PUT/DELETE | 기업 사용자 관리 | ✅ Admin |
| `/api/admin/users` | GET/PUT/PATCH/DELETE | 사용자 관리 | ✅ Admin |
| `/api/admin/banners` | GET/POST/PUT/DELETE | 배너 관리 | ✅ Admin |
| `/api/admin/skills` | GET/POST/PUT/DELETE | 스킬 마스터 관리 | ✅ Admin |
| `/api/admin/job-options` | GET/POST/PUT/DELETE | 채용 옵션 관리 | ✅ Admin |

---

## 🛡️ 보안 가드

### 1. ProtectedPage
- **목적**: 로그인하지 않은 사용자 차단
- **동작**: 로그인하지 않은 사용자를 `/login`으로 리다이렉트
- **사용 위치**: 모든 인증이 필요한 페이지

### 2. RoleGuard
- **목적**: 특정 역할만 접근 가능하도록 제한
- **동작**: 허용되지 않은 역할의 사용자를 홈페이지로 리다이렉트
- **사용 위치**: 역할별로 제한된 페이지

### 3. API 레벨 권한 체크
- **목적**: API 요청 시 역할 및 소유권 확인
- **동작**: 
  - 역할 확인: `user.role` 또는 `user.userType` 확인
  - 소유권 확인: `user.id` 또는 `user.companyId` 확인
- **예시**: 
  - 구직자는 본인의 이력서만 수정 가능
  - 기업은 본인 회사의 채용공고만 수정 가능

---

## 📝 권한 체크 로직

### 프론트엔드 권한 체크
```typescript
// RoleGuard에서 역할 확인
if (!allowedUserTypes.includes(user.userType)) {
  // 접근 거부 및 리다이렉트
  setLocation(fallbackPath);
}
```

### 백엔드 권한 체크 (Mock 모드)
```typescript
// API 요청 시 역할 확인
const user = getCurrentUser();
if (user.role !== 'admin' && user.companyId !== data.companyId) {
  throw new Error('Unauthorized');
}
```

---

## ⚠️ 주의사항

1. **Admin은 `/company/*` 접근 불가**
   - 관리자는 기업 대시보드를 사용할 수 없습니다
   - 기업 관리는 `/admin/companies`에서만 가능합니다

2. **소유권 확인**
   - 모든 수정/삭제 작업은 소유권을 확인합니다
   - 구직자는 본인의 데이터만 수정 가능
   - 기업은 본인 회사의 데이터만 수정 가능

3. **채용공고 승인 프로세스**
   - 기업이 작성한 채용공고는 자동으로 `pending` 상태가 됩니다
   - 관리자 승인 후에만 `public` 상태로 변경되어 공개됩니다

4. **지원서 자동 채팅방 생성**
   - 구직자가 지원하면 자동으로 채팅방이 생성됩니다
   - 기업과 구직자 모두 채팅방에 접근 가능합니다

---

## 🔄 권한 변경 이력

- **2025년**: 초기 권한 체계 정의
  - Guest, Candidate, Employer, Admin 역할 정의
  - RoleGuard 및 ProtectedPage 컴포넌트 구현
  - 역할별 페이지 접근 제어 구현

---

**문서 작성자**: AI Assistant  
**최종 업데이트**: 2025년  
**관련 파일**: 
- `client/src/App.tsx`
- `client/src/components/common/RoleGuard.tsx`
- `client/src/components/common/ProtectedPage.tsx`
- `client/src/lib/mockData.ts`


