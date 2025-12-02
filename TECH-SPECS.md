# SonGon (JobMongol) 기술 스펙 요약서

## 플랫폼 개요
**SonGon (JobMongol)**은 몽골 1위 완전 반응형 구인구직 SaaS 플랫폼입니다. 구독 기반 수익모델을 통해 AI 추천, 실시간 채팅, 자동 고용/퇴사 연동 등 혁신적인 기능을 제공합니다.

## 핵심 기술 스택

### Frontend Stack
| 구분 | 기술 | 버전 | 목적 |
|------|------|------|------|
| **Framework** | React | 18.3.1 | UI 라이브러리 |
| **Language** | TypeScript | 5.6.3 | 타입 안정성 |
| **Build Tool** | Vite | 5.4.14 | 고속 번들링 |
| **Router** | Wouter | 3.3.5 | 경량 라우팅 |
| **State** | React Query | 5.60.5 | 서버 상태 관리 |
| **Styling** | TailwindCSS | 3.4.17 | 유틸리티 CSS |
| **UI Kit** | Radix UI + shadcn/ui | Latest | 접근성 컴포넌트 |
| **Icons** | Lucide React | 0.453.0 | 아이콘 라이브러리 |
| **Animation** | Framer Motion | 11.13.1 | 애니메이션 |
| **Forms** | React Hook Form | 7.55.0 | 폼 관리 |
| **Validation** | Zod | 3.24.2 | 스키마 검증 |

### Backend Stack
| 구분 | 기술 | 버전 | 목적 |
|------|------|------|------|
| **Runtime** | Node.js | Latest | 서버 런타임 |
| **Framework** | Express.js | 4.21.2 | 웹 프레임워크 |
| **Language** | TypeScript | 5.6.3 | 타입 안정성 |
| **Database** | PostgreSQL | Latest | 관계형 데이터베이스 |
| **ORM** | Drizzle ORM | 0.39.1 | 타입세이프 ORM |
| **Authentication** | JWT + bcrypt | Latest | 인증/보안 |
| **WebSocket** | ws | 8.18.0 | 실시간 통신 |
| **Validation** | Zod | 3.24.2 | 입력 검증 |

### Development & Build Tools
| 구분 | 기술 | 버전 | 목적 |
|------|------|------|------|
| **Build** | esbuild | 0.25.0 | 서버 번들링 |
| **Migration** | Drizzle Kit | 0.30.4 | DB 마이그레이션 |
| **Process** | concurrently | 9.1.2 | 동시 프로세스 실행 |
| **Environment** | dotenv | 16.5.0 | 환경변수 관리 |

## 데이터베이스 구조

### 연결 정보
```
Host: 192.168.0.171 (Primary) / 203.23.49.100 (Fallback)
Port: 5432
Database: jobmongolia
User: jobmongolia_user
Password: JobMongolia2025R5
```

### 주요 테이블 구조

#### Users (사용자)
```sql
id, username, password, email, full_name
ovog, ner, mongolian_id, citizenship_type
user_type (candidate/employer/admin)
profile_picture, location, phone, bio, skills
```

#### Companies (기업)
```sql
id, name, logo, size, status, description
industry, location, culture, benefits
website, founded, employee_count
```

#### Jobs (채용공고)
```sql
id, company_id, title, description, requirements
location, employment_type, experience_level
salary_min, salary_max, skills, benefits
is_featured, is_active, views, status
```

#### Applications (지원)
```sql
id, user_id, job_id, resume_id
status (pending/reviewed/interview/accepted/rejected)
cover_letter, applied_at
```

## 아키텍처 설계

### 폴더 구조
```
┌─ client/          # React Frontend
├─ server/          # Express Backend  
├─ shared/          # 공유 타입/스키마
├─ migrations/      # DB 마이그레이션
└─ scripts/         # 개발 스크립트
```

### API 설계
- **RESTful API**: `/api/*` 엔드포인트
- **WebSocket**: 실시간 채팅
- **인증**: JWT Bearer 토큰
- **에러 핸들링**: 통일된 에러 응답

### 보안 구조
- **CORS**: 도메인 화이트리스트
- **Rate Limiting**: API 호출 제한
- **Data Validation**: Zod 스키마 검증
- **SQL Injection**: ORM 통한 방지

## 개발 환경

### 필수 요구사항
- **Node.js**: 18.x 이상
- **PostgreSQL**: 13.x 이상
- **NPM**: 8.x 이상

### 포트 구성
- **Backend API**: 5000 (고정)
- **Frontend Dev**: 5173/5174
- **Database**: 5432

### 환경 변수
```env
NODE_ENV=development|production
DB_HOST=192.168.0.171
DB_PORT=5432
DB_NAME=jobmongolia
DB_USER=jobmongolia_user
DB_PASSWORD=JobMongolia2025R5
JWT_SECRET=your-secret-key
SESSION_SECRET=your-session-secret
```

## 배포 명세

### 빌드 프로세스
```bash
npm run build  # 프론트엔드 + 백엔드 빌드
npm run start  # 프로덕션 서버 실행
```

### 프로덕션 최적화
- **코드 분할**: Vendor/Utils 청크 분리
- **번들 최적화**: Tree-shaking + Minification
- **보안 강화**: 소스맵 제거, console.log 제거
- **캐싱**: 정적 자원 캐싱

## 국제화 (i18n)

### 지원 언어
- **한국어** (ko) - 기본
- **영어** (en)
- **몽골어** (mn/mn_clean)

### 구현 방식
- Context API 기반 언어 상태 관리
- JSON 번역 파일 (`/client/src/i18n/locales/`)
- 동적 언어 로딩

## 반응형 디자인

### 브레이크포인트
```css
sm: 640px   /* 모바일 */
md: 768px   /* 태블릿 */
lg: 1024px  /* 데스크톱 */
xl: 1280px  /* 대형 화면 */
```

### 모바일 우선 설계
- Progressive Web App (PWA) 지원
- 터치 제스처 최적화
- 모바일 전용 네비게이션

## 상태 관리 패턴

### 클라이언트 상태
- **Local State**: useState/useReducer
- **Global State**: Context API
- **Server State**: React Query

### 서버 상태 캐싱
- **쿼리 캐싱**: React Query 자동 캐싱
- **무효화**: Mutation 후 자동 갱신
- **백그라운드 갱신**: Stale-while-revalidate

## 성능 최적화

### 프론트엔드
- **Code Splitting**: Route 기반 분할
- **Lazy Loading**: 컴포넌트 지연 로딩
- **Image Optimization**: WebP 포맷 사용
- **Bundle Analysis**: webpack-bundle-analyzer

### 백엔드
- **Connection Pooling**: PostgreSQL 연결 풀
- **Response Caching**: node-cache 활용
- **Compression**: gzip 압축
- **Rate Limiting**: API 호출 제한

## 보안 설정

### 인증 보안
- **JWT**: 7일 만료 + 리프레시 토큰
- **Password**: bcrypt 해싱 (12 rounds)
- **Session**: PostgreSQL 저장

### 애플리케이션 보안
- **HTTPS**: 프로덕션 필수
- **CSRF**: SameSite 쿠키
- **XSS**: 입력 검증 + 출력 인코딩
- **SQL Injection**: ORM 사용

---

## 📈 확장성 고려사항

### 수평적 확장
- **Load Balancer**: Nginx 권장
- **Database**: Read Replica 구성 가능
- **CDN**: 정적 자원 배포

### 모니터링
- **Logging**: Winston 로거
- **Metrics**: 사용자 행동 추적
- **Error Tracking**: 에러 로깅

---

**기술 문서 버전**: 1.0.0  
**최종 업데이트**: 2025-06-18 