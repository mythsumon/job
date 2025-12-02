# Database Schema Update Guide

JobMongolia 프로젝트에서 DB 스키마 변경사항을 적용하는 방법입니다.

## 빠른 업데이트 (권장)

스키마 파일(`shared/schema.ts`)을 수정한 후:

```bash
npm run db:update
```

이 명령어는:
- 자동으로 DB에 연결
- 현재 스키마와 DB 구조 비교
- 차이점만 자동 적용
- 결과 리포트 출력

## 사용 가능한 DB 명령어

### 1. 스키마 즉시 적용 (개발용)
```bash
npm run db:update
# 또는
npm run db:push
```

### 2. Migration 파일 생성 후 적용 (프로덕션용)
```bash
npm run db:migrate
```

### 3. DB 관리 UI 열기
```bash
npm run db:studio
```

## 수동 업데이트 방법

만약 자동 스크립트가 실패하면:

### 1. PostgreSQL 직접 연결
```bash
psql -h 192.168.0.171 -p 5432 -U jobmongolia_user -d jobmongolia
```

### 2. Drizzle Kit 사용
```bash
npx drizzle-kit push --force
```

## 스키마 변경 프로세스

1. **`shared/schema.ts` 파일 수정**
   - 테이블, 컬럼 추가/수정/삭제
   - 관계 설정 변경
   - 제약조건 추가

2. **변경사항 적용**
   ```bash
   npm run db:update
   ```

3. **백엔드 코드 업데이트**
   - `server/postgresql-storage.ts`의 쿼리 수정
   - `server/auth.ts` 등 관련 로직 업데이트

4. **프론트엔드 코드 업데이트**
   - Form 컴포넌트 수정
   - API 호출 부분 업데이트

## 안전 수칙

### 개발 환경
- 자유롭게 `npm run db:update` 사용 가능
- 문제 발생 시 DB 재설정 가능

### 프로덕션 환경
- 반드시 `npm run db:migrate` 사용
- Migration 파일을 통한 버전 관리
- 백업 후 적용

## 문제 해결

### 연결 실패
- 192.168.0.171이 안되면 203.23.49.100 자동 시도
- 네트워크 연결 상태 확인

### 스키마 충돌
```bash
# 기존 스키마 상태 확인
npx drizzle-kit introspect

# 강제 적용
npx drizzle-kit push --force
```

### Migration 충돌
```bash
# Migration 상태 확인
npx drizzle-kit status

# 특정 Migration 적용
npx drizzle-kit migrate --to=0001
```

## 예시: 새로운 컬럼 추가

1. **Schema 수정**
   ```typescript
   // shared/schema.ts
   export const users = pgTable("users", {
     // ... existing columns ...
     newColumn: text("new_column"),
   });
   ```

2. **DB 업데이트**
   ```bash
   npm run db:update
   ```

3. **백엔드 수정**
   ```typescript
   // server/postgresql-storage.ts
   async createUser(user: InsertUser): Promise<User> {
     // newColumn 추가된 INSERT 쿼리 수정
   }
   ```

4. **프론트엔드 수정**
   ```typescript
   // client/src/pages/register.tsx
   const [formData, setFormData] = useState({
     // ... existing fields ...
     newColumn: "",
   });
   ```

## 자주 사용하는 패턴

### 새로운 테이블 추가
```typescript
export const newTable = pgTable("new_table", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  data: text("data").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
```

### 기존 컬럼 수정
```typescript
// 필수 → 선택적
username: text("username"), // .notNull() 제거

// 기본값 추가
status: text("status").default("active"),

// 제약조건 추가
email: text("email").notNull().unique(),
```

이 가이드를 따라서 안전하고 효율적으로 DB 스키마를 관리하세요! 