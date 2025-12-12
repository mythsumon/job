# 화면별 기능 문서

## 공개 화면 (Public)

### 홈페이지 (`/`)
- 메인 랜딩 페이지
- 프리미엄 채용, 프로 채용, 최근 채용, 기업 목록 표시
- 검색 기능

### 로그인 (`/login`)
- 사용자 로그인

### 회원가입 (`/register`)
- 신규 사용자 등록

### 가격표 (`/pricing`)
- 구독 플랜 및 가격 정보

---

## 구직자 화면 (User/Candidate)

### 구직자 홈 (`/user/home`)
- 구직자 대시보드
- 추천 채용공고, 저장된 채용공고, 최근 지원 현황

### 채용정보 (`/user/jobs`)
- 전체 채용공고 목록
- 필터링 및 검색 기능
- 프리미엄 채용 표시

### 채용공고 상세 (`/user/jobs/:id`)
- 채용공고 상세 정보
- 지원하기 기능

### 기업 목록 (`/user/companies`)
- 등록된 기업 목록
- 검색 및 필터링

### 기업 상세 (`/user/companies/:id`)
- 기업 정보 및 채용공고

### 커리어 가이드 (`/user/career`)
- 학습 자료, 커리어 팁, 시장 동향, 목표 설정

### 피드 (`/user/feed`)
- 커뮤니티 피드

### 프로필 (`/user/profile`)
- 구직자 프로필 관리
- 개인정보 수정

### 이력서 관리 (`/user/resumes`)
- 이력서 작성, 수정, 삭제
- 기본 이력서 설정

### 지원 현황 (`/user/applications`)
- 지원한 채용공고 목록
- 지원 상태 확인

### 저장된 채용공고 (`/user/saved-jobs`)
- 관심 채용공고 목록

### 채팅 (`/user/chat`)
- 구직자-기업 간 채팅

### 알림 (`/user/notifications`)
- 알림 목록 및 관리

### 설정 (`/user/settings`)
- 계정 설정, 알림 설정, 개인정보 설정

---

## 기업 화면 (Company/Employer)

### 기업 대시보드 (`/company/dashboard`)
- 채용 현황, 지원자 통계, 최근 활동

### 채용공고 관리 (`/company/jobs`)
- 채용공고 작성, 수정, 삭제
- 공고 상태 관리

### 지원자 관리 (`/company/applications`)
- 지원자 목록 및 상태 관리
- 지원서 상세 확인

### 파이프라인 (`/company/pipeline`)
- 인재 풀 관리
- 연락, 편집, 제거 기능

### 면접 관리 (`/company/interviews`)
- 면접 일정 관리
- 면접 취소, 재일정, 피드백 작성

### 추천 인재 (`/company/recommendations`)
- AI 추천 인재 목록

### 인재 검색 (`/company/talents`)
- 인재 검색 및 프로필 확인

### 분석 (`/company/analytics`)
- 채용 통계 및 분석
- 조회수, 지원자 수, 채용 성과

### 브랜딩 (`/company/branding`)
- 기업 브랜딩 페이지 설정
- 로고, 배너, 색상 설정

### 직원 관리 (`/company/employees`)
- 직원 목록 및 관리

### 기업 프로필 (`/company/profile`)
- 기업 프로필 정보 수정

### 기업 정보 (`/company/info`)
- 기업 상세 정보 관리

### 채팅 (`/company/chat`)
- 기업-구직자 간 채팅

### 알림 (`/company/notifications`)
- 기업 알림 목록

### 설정 (`/company/settings`)
- 기업 계정 설정

---

## 관리자 화면 (Admin)

### 관리자 대시보드 (`/admin/dashboard`)
- 전체 통계 및 현황
- 사용자, 기업, 채용공고 통계

### 사용자 관리 (`/admin/users`)
- 사용자 목록 및 관리
- 사용자 상세 정보, 상태 변경

### 기업 관리 (`/admin/companies`)
- 기업 목록 및 관리
- 기업 승인/거부

### 기업 상세 (`/admin/companies/:id`)
- 기업 상세 정보 및 관리

### 역할 관리 (`/admin/roles`)
- 사용자 역할 및 권한 관리

### 모니터링 (`/admin/monitoring`)
- 시스템 모니터링 및 로그 확인

### 정산 관리 (`/admin/settlements`)
- 기업 정산 관리

### 분석 (`/admin/analytics`)
- 플랫폼 전체 통계 및 분석

### 배너 관리 (`/admin/banners`)
- 배너 생성, 수정, 삭제
- 배너 위치 및 상태 관리

### 채용 옵션 (`/admin/job-options`)
- 채용공고 옵션 설정 (고용형태, 경력수준 등)

### 선호 업종 (`/admin/preferred-industries`)
- 업종 카테고리 관리

### 커리어 가이드 관리 (`/admin/career`)
- 커리어 가이드 콘텐츠 관리
- 학습 자료, 팁, 시장 동향, 목표 설정

### 커뮤니티 관리 (`/admin/community`)
- 커뮤니티 게시글 관리
- 게시글 승인/삭제

### 채팅 관리 (`/admin/chat`)
- 전체 채팅 모니터링 및 관리

### 설정 (`/admin/settings`)
- 플랫폼 설정 관리

---

## 기타

### 404 페이지 (`/not-found`)
- 페이지를 찾을 수 없음


