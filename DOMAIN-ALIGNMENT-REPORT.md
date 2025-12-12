# Domain Alignment Report

## 작업 완료 사항

### 1. Domain Types 생성
- ✅ `client/src/types/domain.ts` 생성
  - User, Company, Job, Application, Resume, Skill, JobOption, Banner, ChatRoom, Message 타입 정의
  - 도메인 스펙에 맞게 단순화된 인터페이스

### 2. Shared Mock Data Modules 생성
- ✅ `client/src/mocks/jobs.ts` - Job mock data
- ✅ `client/src/mocks/companies.ts` - Company mock data  
- ✅ `client/src/mocks/users.ts` - User mock data
- ✅ `client/src/mocks/applications.ts` - Application mock data

## 작업 필요 사항

### Job Entity 정렬 필요

#### 현재 상태 분석

**1. `/user/jobs` (client/src/pages/jobs.tsx)**
- 사용 필드: `title`, `company.name`, `location`, `employmentType`, `experienceLevel`, `salaryMin/salaryMax`, `skills`, `isFeatured`, `isPro`
- 문제점:
  - `salaryMin/salaryMax` 사용 (도메인은 `salary` 문자열)
  - `isPro` 사용 (도메인은 `isPremium`)
  - `company.name` 사용 (도메인은 `companyName`)

**2. `/user/jobs/:id` (client/src/pages/job-detail.tsx)**
- 사용 필드: `title`, `company.name`, `location`, `employmentType`, `experienceLevel`, `salaryMin/salaryMax`, `skills`, `description`, `isFeatured`, `isPro`
- 문제점: 위와 동일

**3. `/company/jobs` (client/src/pages/company/jobs.tsx)**
- 사용 필드: `title`, `location`, `status`, `deadline`, `salary`, `description`, `department` (도메인에 없음)
- 문제점:
  - `department` 필드 사용 (도메인 타입에 없음)
  - `type` 필드 사용 (도메인은 `employmentType`)
  - `experience` 필드 사용 (도메인은 `experienceLevel`)

**4. `/company/jobs` Create/Edit Form (client/src/components/jobs/JobCreateForm.tsx)**
- 사용 필드: `jobTitle`, `department`, `employmentType`, `experience`, `location`, `salaryRange`, `deadline`, `jobDescription`, `skills`, `requirements`, `preferred`, `benefits`, `isRemote`
- 문제점:
  - `jobTitle` (도메인은 `title`)
  - `department` (도메인에 없음)
  - `experience` (도메인은 `experienceLevel`)
  - `salaryRange` (도메인은 `salary`)
  - `jobDescription` (도메인은 `description`)
  - `requirements`, `preferred`, `benefits` (도메인에 없음)
  - `isRemote` (도메인에 없음)

**5. `/admin/jobs` (client/src/pages/admin/jobs.tsx)**
- 사용 필드: `title`, `company.name`, `location`, `employmentType`, `experienceLevel`, `salaryMin/salaryMax`, `status`, `isFeatured`, `isPro`, `isActive`
- 문제점:
  - `salaryMin/salaryMax` 사용
  - `isPro` 사용 (도메인은 `isPremium`)
  - `isActive` 사용 (도메인에 없음)

#### 정렬 계획

**표준 필드 및 라벨:**
- 제목 (title)
- 회사명 (companyName)
- 근무지역 (location)
- 고용형태 (employmentType)
- 경력 (experienceLevel)
- 급여 (salary) - 문자열 형식 (예: "2000-3000만원")
- 요구 기술 (requiredSkills)
- 마감일 (deadline)
- 공고 설명 (description)
- 상태 (status)
- 프리미엄 여부 (isPremium)

**제거/주석 처리 필요 필드:**
- `department` - 도메인에 없음
- `requirements` - 도메인에 없음
- `preferred` - 도메인에 없음
- `benefits` - 도메인에 없음
- `isRemote` - 도메인에 없음
- `isActive` - 도메인에 없음
- `salaryMin/salaryMax` - `salary` 문자열로 통일
- `isPro` - `isPremium`으로 변경

### Company Entity 정렬 필요

#### 현재 상태 분석

**1. `/user/companies` (client/src/pages/companies.tsx)**
- 사용 필드: `name`, `industry`, `size`, `location`, `description`, `website`
- 문제점:
  - `website` 사용 (도메인은 `websiteUrl`)
  - `logo` 사용 (도메인은 `logoUrl`)

**2. `/user/companies/:id` (client/src/pages/company-detail.tsx)**
- 사용 필드: `name`, `industry`, `size`, `location`, `description`, `website`, `logo`
- 문제점: 위와 동일

**3. `/company/info` (client/src/pages/company/info.tsx)**
- 사용 필드: `name`, `registrationNumber`, `industry`, `location`, `website`, `description`, `size`, `founded`, `email`, `phone`, `address`, `logo`, `linkedin`, `facebook`, `twitter`, `instagram`, `mission`, `vision`, `values`
- 문제점:
  - 많은 추가 필드 (도메인 타입에 없음)
  - `website` (도메인은 `websiteUrl`)
  - `logo` (도메인은 `logoUrl`)

**4. `/admin/companies` (client/src/pages/admin/companies.tsx)**
- 사용 필드: `name`, `industry`, `size`, `location`, `description`, `status`, `website`
- 문제점:
  - `website` (도메인은 `websiteUrl`)
  - `status` (도메인에 없음 - 승인/거부는 별도 관리)

#### 정렬 계획

**표준 필드 및 라벨:**
- 회사명 (name)
- 업종 (industry)
- 기업규모 (size)
- 지역 (location)
- 회사 소개 (description)
- 웹사이트 (websiteUrl)
- 로고 (logoUrl)

**제거/주석 처리 필요 필드:**
- `registrationNumber` - 도메인에 없음
- `founded` - 도메인에 없음
- `email` - 도메인에 없음
- `phone` - 도메인에 없음
- `address` - 도메인에 없음
- `linkedin` - 도메인에 없음
- `facebook` - 도메인에 없음
- `twitter` - 도메인에 없음
- `instagram` - 도메인에 없음
- `mission` - 도메인에 없음
- `vision` - 도메인에 없음
- `values` - 도메인에 없음
- `status` - 도메인에 없음 (승인/거부는 별도 관리)

### User Entity 정렬 필요

#### 현재 상태 분석

**1. `/user/profile` (client/src/pages/user/profile.tsx)**
- 사용 필드: `fullName`, `email`, `phone`, `location`, `bio`, `profilePicture`, `skills`, `experience`, `education`, `major`, `preferredIndustry`, `dreamCompany`
- 문제점:
  - `fullName` 사용 (도메인은 `name`)
  - `bio` 사용 (도메인은 `headline`)
  - `experience` 사용 (도메인은 `experienceYears` 숫자)
  - `education` 사용 (도메인에 없음)
  - `major`, `preferredIndustry`, `dreamCompany` (도메인에 없음)

**2. `/admin/users` (client/src/pages/admin/users.tsx)**
- 사용 필드: `fullName`, `email`, `phone`, `location`, `bio`, `isActive`, `userType`
- 문제점:
  - `fullName` (도메인은 `name`)
  - `bio` (도메인은 `headline`)
  - `userType` (도메인은 `role`)

#### 정렬 계획

**표준 필드 및 라벨:**
- 이름 (name)
- 이메일 (email)
- 역할 (role) - candidate/employer/admin
- 헤드라인 (headline) - candidate용
- 기술 (skills) - candidate용
- 경력 연수 (experienceYears) - candidate용
- 위치 (location)
- 전화번호 (phone)
- 프로필 사진 (profilePicture)
- 활성 상태 (isActive)

**제거/주석 처리 필요 필드:**
- `fullName` - `name`으로 변경
- `bio` - `headline`으로 변경
- `experience` - `experienceYears`로 변경
- `education` - 도메인에 없음
- `major` - 도메인에 없음
- `preferredIndustry` - 도메인에 없음
- `dreamCompany` - 도메인에 없음
- `userType` - `role`로 변경

### Application Entity 정렬 필요

#### 현재 상태 분석

**1. `/user/applications` (client/src/pages/user/applications.tsx)**
- 사용 필드: `userId`, `jobId`, `resumeId`, `status`, `coverLetter`, `appliedAt`, `job`
- 문제점:
  - `userId` 사용 (도메인은 `candidateId`)
  - `resumeId` 사용 (도메인에 없음)
  - `coverLetter` 사용 (도메인에 없음)

**2. `/company/applications` (client/src/pages/company/applications.tsx)**
- 사용 필드: `candidateUserId`, `resumeId`, `status`, `appliedAt`, `candidate`, `job`, `rating`, `notes`, `stage`
- 문제점:
  - `candidateUserId` (도메인은 `candidateId`)
  - `resumeId` (도메인에 없음)
  - `rating` (도메인에 없음)
  - `notes` (도메인에 없음)
  - `stage` (도메인에 없음)

#### 정렬 계획

**표준 필드 및 라벨:**
- 지원 ID (id)
- 채용공고 ID (jobId)
- 지원자 ID (candidateId)
- 상태 (status) - pending/reviewed/interview/accepted/rejected
- 지원일 (appliedAt)
- 업데이트일 (updatedAt)

**제거/주석 처리 필요 필드:**
- `userId` - `candidateId`로 변경
- `resumeId` - 도메인에 없음
- `coverLetter` - 도메인에 없음
- `rating` - 도메인에 없음
- `notes` - 도메인에 없음
- `stage` - 도메인에 없음

### Resume Entity 정렬 필요

#### 현재 상태 분석

**1. `/user/resumes` (client/src/pages/user/resumes.tsx)**
- 사용 필드: `userId`, `title`, `summary`, `basicInfo`, `skillsAndLanguages`, `portfolio`, `education`, `workHistory`, `additionalInfo`, `isDefault`
- 문제점:
  - `userId` 사용 (도메인은 `candidateId`)
  - `basicInfo` 사용 (도메인에 없음)
  - `skillsAndLanguages` 사용 (도메인은 `skills` 배열)
  - `portfolio` 사용 (도메인에 없음)
  - `workHistory` 사용 (도메인은 `experience`)
  - `additionalInfo` 사용 (도메인에 없음)

#### 정렬 계획

**표준 필드 및 라벨:**
- 이력서 ID (id)
- 지원자 ID (candidateId)
- 제목 (title)
- 요약 (summary)
- 기술 (skills)
- 경력 (experience)
- 학력 (education)
- 기본 이력서 여부 (isDefault)

**제거/주석 처리 필요 필드:**
- `userId` - `candidateId`로 변경
- `basicInfo` - 도메인에 없음
- `skillsAndLanguages` - `skills`로 단순화
- `portfolio` - 도메인에 없음
- `additionalInfo` - 도메인에 없음
- `workHistory` - `experience`로 변경

## 구현 우선순위

1. **Job Entity 정렬** (최우선)
   - 모든 Job 관련 페이지에서 동일한 필드와 라벨 사용
   - JobCreateForm에서 도메인에 없는 필드 제거/주석 처리

2. **Company Entity 정렬**
   - 모든 Company 관련 페이지에서 동일한 필드와 라벨 사용
   - Company Info 페이지에서 추가 필드 제거/주석 처리

3. **User Entity 정렬**
   - User Profile과 Admin Users 페이지에서 동일한 필드 사용
   - 필드명 통일 (fullName → name, bio → headline)

4. **Application Entity 정렬**
   - User Applications와 Company Applications에서 동일한 필드 사용
   - 상태 라벨 통일

5. **Resume Entity 정렬**
   - Resume 페이지에서 도메인 타입에 맞게 필드 정리

## 다음 단계

1. Job Entity 정렬 구현
2. Company Entity 정렬 구현
3. User Entity 정렬 구현
4. Application Entity 정렬 구현
5. Resume Entity 정렬 구현
6. Shared Mock Data 통합
7. 최종 검증 및 테스트

