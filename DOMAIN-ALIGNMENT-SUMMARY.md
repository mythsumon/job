# Domain Alignment 작업 요약

## 완료된 작업

### 1. Domain Types 생성 ✅
- `client/src/types/domain.ts` 생성
  - User, Company, Job, Application, Resume, Skill, JobOption, Banner, ChatRoom, Message 타입 정의

### 2. Shared Mock Data Modules 생성 ✅
- `client/src/mocks/jobs.ts`
- `client/src/mocks/companies.ts`
- `client/src/mocks/users.ts`
- `client/src/mocks/applications.ts`

### 3. Job Entity 정렬 (부분 완료) ✅
- `client/src/components/jobs/JobCreateForm.tsx` 수정 완료
  - `jobTitle` → `title`
  - `department` 제거 (도메인에 없음)
  - `experience` → `experienceLevel`
  - `salaryRange` → `salary` (문자열)
  - `jobDescription` → `description`
  - `skills` → `requiredSkills`
  - `requirements`, `preferred`, `benefits`, `isRemote` 제거

- `client/src/pages/company/jobs.tsx` 부분 수정 완료
  - `duplicateJobMutation` 수정
  - `renderJobCard` 함수에서 도메인 필드 사용하도록 수정
  - `department`, `isRemote`, `requirements` 필드 제거/주석 처리

## 남은 작업

### Job Entity 정렬 필요
- `client/src/components/jobs/job-card.tsx`
  - `salaryMin/salaryMax` → `salary` 문자열로 변경
  - `isPro` → `isPremium` 변경
  - `company.name` → `companyName` 변경

- `client/src/pages/job-detail.tsx`
  - 동일한 변경사항 적용

- `client/src/pages/admin/jobs.tsx`
  - `salaryMin/salaryMax` → `salary` 변경
  - `isPro` → `isPremium` 변경
  - `isActive` 제거 (도메인에 없음)

- `client/src/pages/jobs.tsx`
  - 동일한 변경사항 적용

### Company Entity 정렬 필요
- `client/src/pages/companies.tsx`
  - `website` → `websiteUrl`
  - `logo` → `logoUrl`

- `client/src/pages/company-detail.tsx`
  - 동일한 변경사항 적용
  - `employeeCount`, `founded`, `culture`, `benefits` 제거/주석 처리

- `client/src/pages/company/info.tsx`
  - 도메인에 없는 필드 제거/주석 처리:
    - `registrationNumber`, `founded`, `email`, `phone`, `address`
    - `linkedin`, `facebook`, `twitter`, `instagram`
    - `mission`, `vision`, `values`
  - `website` → `websiteUrl`
  - `logo` → `logoUrl`

- `client/src/pages/admin/companies.tsx`
  - `website` → `websiteUrl`
  - `status` 필드 제거 (도메인에 없음)

### User Entity 정렬 필요
- `client/src/pages/user/profile.tsx`
  - `fullName` → `name`
  - `bio` → `headline`
  - `experience` → `experienceYears` (숫자)
  - `education`, `major`, `preferredIndustry`, `dreamCompany` 제거/주석 처리

- `client/src/pages/admin/users.tsx`
  - `fullName` → `name`
  - `bio` → `headline`
  - `userType` → `role`

### Application Entity 정렬 필요
- `client/src/pages/user/applications.tsx`
  - `userId` → `candidateId`
  - `resumeId`, `coverLetter` 제거/주석 처리

- `client/src/pages/company/applications.tsx`
  - `candidateUserId` → `candidateId`
  - `resumeId`, `rating`, `notes`, `stage` 제거/주석 처리

### Resume Entity 정렬 필요
- `client/src/pages/user/resumes.tsx`
  - `userId` → `candidateId`
  - `basicInfo`, `skillsAndLanguages`, `portfolio`, `additionalInfo` 제거/주석 처리
  - `workHistory` → `experience`
  - `skillsAndLanguages` → `skills` 배열로 단순화

### Skill/JobOption/Banner Entity 정렬 필요
- `client/src/pages/admin/skills.tsx` - 확인 필요
- `client/src/pages/admin/job-options.tsx` - 확인 필요
- `client/src/pages/admin/banners.tsx` - 확인 필요

### Chat Entity 정렬 필요
- `client/src/pages/user/chat.tsx`
- `client/src/pages/company/chat.tsx`
- `client/src/pages/admin/chat.tsx`

## 변경된 파일 목록

1. ✅ `client/src/types/domain.ts` (생성)
2. ✅ `client/src/mocks/jobs.ts` (생성)
3. ✅ `client/src/mocks/companies.ts` (생성)
4. ✅ `client/src/mocks/users.ts` (생성)
5. ✅ `client/src/mocks/applications.ts` (생성)
6. ✅ `client/src/components/jobs/JobCreateForm.tsx` (수정)
7. ✅ `client/src/pages/company/jobs.tsx` (부분 수정)

## 다음 단계

1. 나머지 Job 관련 파일들 수정
2. Company Entity 정렬 완료
3. User Entity 정렬 완료
4. Application Entity 정렬 완료
5. Resume Entity 정렬 완료
6. Skill/JobOption/Banner Entity 확인 및 정렬
7. Chat Entity 확인 및 정렬
8. Mock Data 통합 (모든 페이지가 공유 mock 사용하도록)
9. 최종 검증 및 테스트

## 주의사항

- 모든 변경사항은 도메인 타입(`client/src/types/domain.ts`)을 기준으로 합니다
- 도메인에 없는 필드는 제거하거나 TODO 주석으로 표시했습니다
- 기존 기능이 깨지지 않도록 호환성을 유지했습니다 (예: `job.experienceLevel || job.experience`)


