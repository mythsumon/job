# JobMongol 개발자 가이드

## 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [시스템 아키텍처](#시스템-아키텍처)
3. [핵심 기능 플로우](#핵심-기능-플로우)
4. [기술 스택](#기술-스택)
5. [개발 환경 설정](#개발-환경-설정)
6. [데이터베이스 구조](#데이터베이스-구조)
7. [API 설계](#api-설계)
8. [프론트엔드 구조](#프론트엔드-구조)
9. [백엔드 구조](#백엔드-구조)
10. [배포 가이드](#배포-가이드)
11. [보안 고려사항](#보안-고려사항)
12. [성능 최적화](#성능-최적화)
13. [개발 워크플로우](#개발-워크플로우)

---

## 프로젝트 개요

### 플랫폼 소개
JobMongol은 몽골 시장을 타겟으로 하는 차세대 구인구직 플랫폼입니다. 단순한 채용공고 게시판을 넘어서, AI 기반 매칭, 실시간 채팅, 고용 연동 시스템 등 혁신적인 기능을 제공하여 몽골 1위 채용 플랫폼을 목표로 합니다.

### 핵심 가치 제안
- **AI 기반 스마트 매칭**: 구직자와 기업을 최적으로 연결
- **실시간 커뮤니케이션**: WebSocket 기반 즉시 채팅 시스템
- **완전 반응형 디자인**: 모바일-퍼스트 접근 방식
- **다국어 지원**: 한국어, 영어, 몽골어 지원
- **구독 기반 SaaS 모델**: 지속 가능한 수익 구조

### 사용자 유형
1. **구직자 (Job Seeker)**: 일자리를 찾는 개인 사용자
2. **기업 (Employer)**: 인재를 채용하려는 회사
3. **관리자 (Admin)**: 플랫폼을 관리하는 운영진

---

## 시스템 아키텍처

### 전체 아키텍처
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (Express)     │◄──►│   (PostgreSQL)  │
│   Port: 5173    │    │   Port: 5000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────►│  External APIs  │◄─────────────┘
                        │  (Stripe, AI)   │
                        └─────────────────┘
```

### 기술 계층 구조
- **프레젠테이션 계층**: React 18 + TypeScript
- **비즈니스 로직 계층**: Express.js + Node.js
- **데이터 접근 계층**: Drizzle ORM
- **데이터 저장 계층**: PostgreSQL
- **캐싱 계층**: Node-cache (향후 Redis 도입 예정)

---

## 핵심 기능 플로우

### 핵심 비즈니스 규칙
1. **몽골ID 검증**: 모든 사용자는 몽골 시민등록번호 또는 외국인 등록번호로 신원 확인
2. **기업 승인 프로세스**: 기업 등록 후 관리자 승인 필요
3. **채팅 규칙**: 기업이 먼저 채팅을 시작해야 하며, 구직자는 단독으로 채팅 시작 불가
4. **고용 연동**: citizen_id 기반으로 고용/퇴사 정보 자동 연동

### 주요 기능
1. **채용공고 관리**: 기업의 채용공고 등록, 수정, 삭제
2. **지원자 관리**: 지원서 접수, 평가, 면접 일정 관리
3. **실시간 채팅**: 기업과 구직자 간 실시간 커뮤니케이션
4. **AI 매칭**: 구직자와 채용공고 간 스마트 매칭
5. **이력서 관리**: 구직자의 상세 이력서 작성 및 관리
6. **구독 관리**: 사용자별 구독 플랜 및 결제 관리

---

## 기술 스택

### Frontend 기술
| 기술 | 버전 | 용도 | 선택 이유 |
|------|------|------|----------|
| React | 18.3.1 | UI 라이브러리 | 컴포넌트 기반 개발, 풍부한 생태계 |
| TypeScript | 5.6.3 | 타입 시스템 | 개발 시 타입 안정성, 코드 품질 향상 |
| Vite | 5.4.14 | 빌드 도구 | 빠른 개발 서버, 효율적인 번들링 |
| TailwindCSS | 3.4.17 | CSS 프레임워크 | 유틸리티 클래스, 일관된 디자인 |
| React Query | 5.60.5 | 서버 상태 관리 | 캐싱, 동기화, 에러 처리 자동화 |
| Wouter | 3.3.5 | 라우팅 | 가벼운 라우터, SPA 내비게이션 |
| Radix UI | Latest | UI 컴포넌트 | 접근성 지원, 커스터마이징 용이 |
| Framer Motion | 11.13.1 | 애니메이션 | 부드러운 UI 트랜지션 |

### Backend 기술
| 기술 | 버전 | 용도 | 선택 이유 |
|------|------|------|----------|
| Node.js | 24.2.0 | 서버 런타임 | JavaScript 생태계, 비동기 처리 |
| Express.js | 4.21.2 | 웹 프레임워크 | 간단한 API 구축, 미들웨어 지원 |
| PostgreSQL | Latest | 데이터베이스 | 관계형 데이터, ACID 속성, 확장성 |
| Drizzle ORM | 0.39.1 | ORM | TypeScript 네이티브, 타입 안전성 |
| WebSocket | 8.18.0 | 실시간 통신 | 즉시 채팅, 알림 시스템 |
| JWT | Latest | 인증 | 무상태 토큰 인증 |
| bcryptjs | Latest | 패스워드 암호화 | 안전한 패스워드 저장 |

---

## 개발 환경 설정

### 시스템 요구사항
- **Node.js**: 18.x 이상
- **npm**: 8.x 이상
- **PostgreSQL**: 13.x 이상
- **Git**: 최신 버전

### 설치 과정

#### 1. 저장소 클론
```bash
git clone https://github.com/your-repo/jobmongol.git
cd jobmongol
```

#### 2. Node.js 설치 (Windows)
```bash
# winget 사용 (Windows 10/11)
winget install OpenJS.NodeJS

# 설치 후 새 PowerShell 창에서 확인
node --version
npm --version
```

#### 3. 의존성 설치
```bash
npm install
```

#### 4. 데이터베이스 설정
현재 프로젝트는 다음 데이터베이스 서버를 사용합니다:
- **Primary**: 192.168.0.171:5432
- **Fallback**: 203.23.49.100:5432
- **Database**: jobmongolia
- **User**: jobmongolia_user
- **Password**: JobMongolia2025R5

#### 5. 개발 서버 실행
```bash
npm run dev
```

이 명령어는 다음을 동시에 실행합니다:
- Frontend (Vite): http://localhost:5173
- Backend (Express): http://localhost:5000

### 개발 환경 검증
1. 브라우저에서 http://localhost:5173 접속
2. 데이터베이스 연결 상태 확인 (콘솔 로그)
3. API 엔드포인트 테스트: http://localhost:5000/api/health

---

## 데이터베이스 구조

### 핵심 테이블 설계

#### Users (사용자)
```sql
- id: 기본 키
- email: 이메일 (고유)
- mongolian_id: 몽골 시민등록번호 (2글자+8숫자)
- user_type: 'candidate' | 'employer' | 'admin'
- citizenship_type: 'mongolian' | 'foreign'
- profile_picture: 프로필 이미지 경로
- skills: JSON 배열 (기술 스택)
- created_at: 계정 생성일
```

#### Companies (기업)
```sql
- id: 기본 키
- name: 회사명
- registration_number: 사업자등록번호
- status: 'pending' | 'approved' | 'rejected'
- industry: 업종
- employee_count: 직원 수
- mission, vision, values: 기업 문화
```

#### Jobs (채용공고)
```sql
- id: 기본 키
- company_id: 회사 참조
- title: 직책명
- description: 직무 설명
- employment_type: 고용 형태
- salary_min/max: 연봉 범위
- skills: 요구 기술 (JSON)
- is_active: 활성 상태
```

#### Applications (지원서)
```sql
- user_id: 지원자
- job_id: 채용공고
- status: 'pending' | 'reviewed' | 'interview' | 'accepted' | 'rejected'
- cover_letter: 자기소개서
- applied_at: 지원일
```

---

## API 설계

### RESTful API 구조
모든 API는 `/api` 접두사를 사용하며, HTTP 메서드와 상태 코드를 RESTful 방식으로 설계합니다.

#### 주요 API 엔드포인트
```
# 인증
POST /api/auth/register     - 회원가입
POST /api/auth/login        - 로그인
GET  /api/auth/me           - 현재 사용자 정보

# 채용공고
GET    /api/jobs            - 채용공고 목록
GET    /api/jobs/:id        - 채용공고 상세
POST   /api/jobs            - 채용공고 등록
POST   /api/jobs/:id/apply  - 채용공고 지원

# 기업
GET    /api/companies       - 기업 목록
POST   /api/companies       - 기업 등록
GET    /api/companies/:id   - 기업 상세

# 지원서
GET    /api/applications    - 지원서 목록
PUT    /api/applications/:id - 지원서 상태 변경
```

---

## 프론트엔드 구조

### 폴더 구조
```
client/src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── ui/             # 기본 UI 컴포넌트 (shadcn/ui)
│   ├── auth/           # 인증 관련 컴포넌트
│   ├── jobs/           # 채용공고 관련 컴포넌트
│   ├── companies/      # 기업 관련 컴포넌트
│   ├── chat/           # 채팅 컴포넌트
│   └── layout/         # 레이아웃 컴포넌트
├── pages/              # 페이지 컴포넌트
├── contexts/           # React Context
├── hooks/              # 커스텀 훅
├── i18n/               # 다국어 지원
└── utils/              # 유틸리티 함수
```

### 핵심 설계 원칙
1. **컴포넌트 기반**: 재사용 가능한 작은 컴포넌트들로 구성
2. **타입 안전성**: TypeScript로 모든 Props와 상태에 타입 정의
3. **반응형 디자인**: 모바일-퍼스트 접근 방식
4. **접근성**: ARIA 속성과 키보드 내비게이션 지원

---

## 백엔드 구조

### 폴더 구조
```
server/
├── index.ts           # 서버 진입점
├── routes.ts          # API 라우트 정의
├── auth.ts            # 인증 시스템
├── db.ts              # 데이터베이스 설정
├── storage.ts         # 데이터 액세스 레이어
└── middleware/        # 미들웨어
```

### 핵심 구성 요소
1. **Express 서버**: RESTful API 제공
2. **Drizzle ORM**: 타입 안전한 데이터베이스 액세스
3. **JWT 인증**: 무상태 토큰 기반 인증
4. **WebSocket**: 실시간 채팅 지원
5. **미들웨어**: 인증, 검증, 에러 처리

---

## 보안 고려사항

### 주요 보안 기능
1. **JWT 토큰 인증**: 15분 만료 시간
2. **패스워드 암호화**: bcrypt 해싱
3. **입력 검증**: Zod 스키마 검증
4. **SQL 인젝션 방지**: ORM 사용
5. **Rate Limiting**: API 호출 제한

---

## 성능 최적화

### 프론트엔드 최적화
1. **코드 분할**: React.lazy()로 지연 로딩
2. **이미지 최적화**: WebP 포맷, 지연 로딩
3. **캐싱**: React Query로 API 응답 캐싱

### 백엔드 최적화
1. **데이터베이스 인덱스**: 자주 조회되는 컬럼에 인덱스
2. **연결 풀링**: PostgreSQL 연결 풀 사용
3. **응답 압축**: gzip 압축 적용

---

## 개발 워크플로우

### Git 브랜치 전략
```
main          - 프로덕션 배포 브랜치
develop       - 개발 통합 브랜치
feature/*     - 기능 개발 브랜치
hotfix/*      - 긴급 수정 브랜치
```

### 커밋 메시지 규칙
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 변경
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 코드
chore: 빌드 관련 변경
```

### 배포 프로세스
1. 기능 개발 완료
2. Pull Request 생성
3. 코드 리뷰 진행
4. 테스트 통과 확인
5. develop 브랜치 병합
6. 프로덕션 배포

---

## 문의 및 지원

### 개발 문의
- **기술적 문의**: GitHub Issues 활용
- **긴급 문의**: 개발팀 직접 연락
- **문서 업데이트**: 변경사항 발생 시 즉시 업데이트

### 기여 가이드
1. 이슈 생성 또는 할당받기
2. 기능 브랜치 생성
3. 개발 진행
4. Pull Request 생성
5. 코드 리뷰 참여
6. 병합 후 브랜치 정리

---

*이 문서는 JobMongol 프로젝트의 포괄적인 개발 가이드입니다. 새로운 개발자가 프로젝트에 쉽게 참여할 수 있도록 지속적으로 업데이트하고 개선해 나가겠습니다.* 