# Admin 계정 생성 및 권한 관리 플로우

이 문서는 Job Mongolia 플랫폼의 Admin 계정 관리 플로우를 상세히 설명합니다.

**작성일**: 2025년  
**관련 문서**: `ROLE-PERMISSIONS.md`, `FLOW-DIAGRAMS.md`

---

## 📋 목차

1. [초기 Admin 생성](#초기-admin-생성)
2. [Admin 계정 생성 플로우](#admin-계정-생성-플로우)
3. [Admin 권한 수정 플로우](#admin-권한-수정-플로우)
4. [Admin 삭제 플로우](#admin-삭제-플로우)
5. [Admin 비활성화 플로우](#admin-비활성화-플로우)
6. [보안 제약사항](#보안-제약사항)

---

## 🚀 초기 Admin 생성

### 1.1 시드 데이터 방식

시스템 초기화 시 기본 Admin 계정이 자동으로 생성됩니다.

**위치**: `client/src/lib/mockData.ts`

```typescript
{
  id: 3,
  email: "admin@admin.admin",
  fullName: "Admin User",
  userType: "admin",
  role: "admin", // 또는 "super_admin"
  profilePicture: null,
  location: "Ulaanbaatar",
  bio: "Platform Administrator",
  isActive: true,
}
```

**기본 로그인 정보**:
- 이메일: `admin@admin.admin`
- 비밀번호: `Admin00!@#$`

### 1.2 특별 엔드포인트 방식 (향후 구현)

초기 시스템 설정 시 특별한 엔드포인트를 통해 첫 Admin을 생성할 수 있습니다.

```
POST /api/admin/bootstrap
{
  "email": "admin@example.com",
  "password": "SecurePassword123!",
  "fullName": "Initial Admin",
  "role": "super_admin"
}
```

**제약사항**:
- 시스템에 활성 Admin이 없을 때만 사용 가능
- 한 번만 실행 가능 (초기 설정 시)

---

## 👥 Admin 계정 생성 플로우

### 2.1 플로우 다이어그램

```
[Admin 사용자] → [/admin/users] → [사용자 추가 버튼]
                                        ↓
                                [사용자 생성 다이얼로그]
                                        ↓
                                [사용자 유형: 관리자 선택]
                                        ↓
                                [권한 레벨 선택]
                    ┌───────────┴───────────┐
                    ↓                       ↓
            [일반 관리자]            [슈퍼 관리자]
                    ↓                       ↓
            [role: "admin"]         [role: "super_admin"]
                    ↓                       ↓
                                [POST /api/admin/users]
                                        ↓
                                [권한 검증]
                    ┌───────────┴───────────┐
                    ↓                       ↓
            [권한 없음]              [권한 있음]
                    ↓                       ↓
            [에러 반환]              [Admin 계정 생성]
                                        ↓
                                [다른 Admin에게 알림]
                                        ↓
                                [생성 완료]
```

### 2.2 상세 단계

1. **Admin 사용자 페이지 접근** (`/admin/users`)
   - "사용자 추가" 버튼 클릭
   - 사용자 생성 다이얼로그 열림

2. **사용자 정보 입력**
   - **필수 필드**:
     - 이메일
     - 비밀번호 (최소 6자)
   - **선택 필드**:
     - 사용자명
     - 이름
     - 전화번호
     - 위치
     - 소개
   - **사용자 유형**: "관리자" 선택

3. **권한 레벨 선택** (Admin 선택 시에만 표시)
   - **일반 관리자** (`role: "admin"`):
     - 일반적인 관리 기능 수행
     - 다른 Admin 생성/삭제 불가
   - **슈퍼 관리자** (`role: "super_admin"`):
     - 모든 관리 기능 수행
     - 다른 Admin 생성/삭제 가능

4. **API 호출**
   - `POST /api/admin/users`
   - 데이터:
     ```json
     {
       "email": "newadmin@example.com",
       "password": "SecurePassword123!",
       "fullName": "New Admin",
       "userType": "admin",
       "role": "admin" // 또는 "super_admin"
     }
     ```

5. **권한 검증** (서버 측)
   - 현재 사용자가 Admin인지 확인
   - Admin 생성 권한이 있는지 확인
   - 슈퍼 관리자만 다른 슈퍼 관리자를 생성할 수 있음

6. **계정 생성**
   - 새 Admin 계정 생성
   - `isActive: true`로 설정
   - 생성 시간 기록

7. **알림 생성**
   - 다른 활성 Admin들에게 알림 전송
   - 알림 타입: `admin_created`
   - 메시지: "{생성자명}님이 "{새 Admin명}" 관리자 계정을 생성했습니다."

### 2.3 코드 예시

```typescript
// client/src/pages/admin/users.tsx
const createUserMutation = useMutation({
  mutationFn: async (data: any) => {
    return apiRequest("POST", "/api/admin/users", data);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    toast({
      title: "성공",
      description: "사용자가 성공적으로 생성되었습니다.",
    });
  },
  onError: (error: any) => {
    toast({
      title: "오류",
      description: error?.message || "사용자 생성에 실패했습니다.",
      variant: "destructive",
    });
  },
});
```

---

## ✏️ Admin 권한 수정 플로우

### 3.1 플로우 다이어그램

```
[Admin 사용자] → [/admin/users] → [사용자 상세보기]
                                        ↓
                                [편집 버튼 클릭]
                                        ↓
                                [권한 레벨 수정]
                    ┌───────────┴───────────┐
                    ↓                       ↓
            [일반 관리자]            [슈퍼 관리자]
                    ↓                       ↓
                                [PUT /api/admin/users/:id]
                                        ↓
                                [권한 검증]
                    ┌───────────┴───────────┐
                    ↓                       ↓
            [권한 없음]              [권한 있음]
                    ↓                       ↓
            [에러 반환]              [권한 수정]
                                        ↓
                                [업데이트 완료]
```

### 3.2 상세 단계

1. **사용자 상세보기**
   - `/admin/users`에서 사용자 클릭
   - 상세 다이얼로그 열림

2. **편집 모드 진입**
   - "편집" 버튼 클릭
   - 편집 모드 활성화

3. **권한 레벨 수정** (Admin인 경우에만)
   - 권한 레벨 드롭다운 표시
   - "일반 관리자" 또는 "슈퍼 관리자" 선택

4. **저장**
   - "저장" 버튼 클릭
   - `PUT /api/admin/users/:id` 호출

5. **권한 검증**
   - 슈퍼 관리자만 다른 사용자의 권한을 수정할 수 있음
   - 자기 자신의 권한은 수정 가능

6. **업데이트 완료**
   - 사용자 정보 업데이트
   - UI 새로고침

### 3.3 코드 예시

```typescript
// client/src/pages/admin/users.tsx
const updateUserMutation = useMutation({
  mutationFn: async ({ userId, data }: { userId: number; data: any }) => {
    return apiRequest("PUT", `/api/admin/users/${userId}`, data);
  },
  onSuccess: async () => {
    queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    toast({
      title: "성공",
      description: "사용자 정보가 성공적으로 업데이트되었습니다.",
    });
  },
  onError: (error: any) => {
    toast({
      title: "오류",
      description: error?.message || "사용자 정보 업데이트에 실패했습니다.",
      variant: "destructive",
    });
  },
});
```

---

## 🗑️ Admin 삭제 플로우

### 4.1 플로우 다이어그램

```
[Admin 사용자] → [/admin/users] → [사용자 상세보기]
                                        ↓
                                [삭제 버튼 클릭]
                                        ↓
                                [삭제 확인 다이얼로그]
                                        ↓
                                [DELETE /api/admin/users/:id]
                                        ↓
                                [권한 검증]
                    ┌───────────┴───────────┐
                    ↓                       ↓
            [권한 없음]              [권한 있음]
                    ↓                       ↓
            [에러 반환]              [삭제 검증]
                    ┌───────────┴───────────┐
                    ↓                       ↓
            [자기 자신]            [마지막 Admin]
                    ↓                       ↓
            [에러 반환]              [에러 반환]
                                        ↓
                                [삭제 가능]
                                        ↓
                                [계정 삭제]
                                        ↓
                                [다른 Admin에게 알림]
                                        ↓
                                [삭제 완료]
```

### 4.2 상세 단계

1. **사용자 상세보기**
   - 삭제할 Admin 사용자 선택
   - 상세 다이얼로그 열림

2. **삭제 확인**
   - "삭제" 버튼 클릭
   - 확인 다이얼로그 표시
   - "정말로 {사용자명} 사용자를 삭제하시겠습니까?"

3. **API 호출**
   - `DELETE /api/admin/users/:id`
   - 삭제 확인 시 호출

4. **권한 검증**
   - 슈퍼 관리자만 다른 Admin을 삭제할 수 있음
   - 자기 자신은 삭제할 수 없음

5. **삭제 검증**
   - 마지막 활성 Admin은 삭제할 수 없음
   - 활성 Admin이 1명만 남은 경우 삭제 불가

6. **계정 삭제**
   - 사용자 계정 삭제
   - 관련 데이터 정리 (선택사항)

7. **알림 생성**
   - 다른 활성 Admin들에게 알림 전송
   - 알림 타입: `admin_deleted`
   - 메시지: "{삭제자명}님이 "{삭제된 Admin명}" 관리자 계정을 삭제했습니다."

### 4.3 코드 예시

```typescript
// client/src/pages/admin/users.tsx
const deleteUserMutation = useMutation({
  mutationFn: async (userId: number) => {
    return apiRequest("DELETE", `/api/admin/users/${userId}`);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    toast({
      title: "성공",
      description: "사용자가 성공적으로 삭제되었습니다.",
    });
  },
  onError: (error: any) => {
    toast({
      title: "오류",
      description: error?.message || "사용자 삭제에 실패했습니다.",
      variant: "destructive",
    });
  },
});
```

---

## 🚫 Admin 비활성화 플로우

### 5.1 플로우 다이어그램

```
[Admin 사용자] → [/admin/users] → [사용자 선택]
                                        ↓
                                [비활성화 버튼 클릭]
                                        ↓
                                [PATCH /api/admin/users/:id]
                                        ↓
                                [권한 검증]
                    ┌───────────┴───────────┐
                    ↓                       ↓
            [자기 자신]            [다른 사용자]
                    ↓                       ↓
            [에러 반환]              [비활성화 검증]
                    ┌───────────┴───────────┐
                    ↓                       ↓
            [마지막 Admin]          [비활성화 가능]
                    ↓                       ↓
            [에러 반환]              [계정 비활성화]
                                        ↓
                                [isActive: false]
                                        ↓
                    ┌───────────┴───────────┐
                    ↓                       ↓
            [현재 로그인 중]        [다른 Admin에게 알림]
                    ↓                       ↓
            [자동 로그아웃]          [알림 전송]
                    ↓                       ↓
            [/login으로 리다이렉트]  [비활성화 완료]
```

### 5.2 상세 단계

1. **사용자 선택**
   - `/admin/users`에서 비활성화할 Admin 선택
   - 비활성화 버튼 클릭 (또는 상세보기에서 비활성화)

2. **API 호출**
   - `PATCH /api/admin/users/:id`
   - 데이터: `{ isActive: false }`

3. **권한 검증**
   - 슈퍼 관리자만 다른 Admin을 비활성화할 수 있음
   - 자기 자신은 비활성화할 수 없음

4. **비활성화 검증**
   - 마지막 활성 Admin은 비활성화할 수 없음
   - 활성 Admin이 1명만 남은 경우 비활성화 불가

5. **계정 비활성화**
   - `isActive: false`로 설정
   - `updatedAt` 업데이트

6. **자동 로그아웃 처리** (현재 로그인 중인 경우)
   - 현재 사용자가 비활성화된 경우:
     - 토스트 메시지 표시: "계정이 비활성화되어 로그아웃됩니다."
     - 2초 후 자동 로그아웃
     - `localStorage`에서 토큰 및 사용자 데이터 제거
     - `/login`으로 리다이렉트

7. **알림 생성**
   - 다른 활성 Admin들에게 알림 전송
   - 알림 타입: `admin_deactivated`
   - 메시지: "{비활성화자명}님이 "{비활성화된 Admin명}" 관리자 계정을 비활성화했습니다."

8. **인증 체크 강화**
   - `/api/auth/user` 엔드포인트에서 비활성화된 사용자 체크
   - 비활성화된 사용자는 `null` 반환하여 자동 로그아웃 유도

### 5.3 코드 예시

```typescript
// client/src/pages/admin/users.tsx
const toggleUserStatusMutation = useMutation({
  mutationFn: async ({ userId, isActive }: { userId: number; isActive: boolean }) => {
    return apiRequest("PATCH", `/api/admin/users/${userId}`, { isActive });
  },
  onSuccess: async (data, variables) => {
    queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    
    // If current user was deactivated, force logout
    const currentUserData = localStorage.getItem('user_data');
    if (currentUserData) {
      const currentUser = JSON.parse(currentUserData);
      if (currentUser.id === variables.userId && variables.isActive === false) {
        toast({
          title: "계정 비활성화",
          description: "계정이 비활성화되어 로그아웃됩니다.",
          variant: "destructive",
        });
        setTimeout(() => {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          queryClient.setQueryData(["/api/auth/user"], null);
          window.location.href = "/login";
        }, 2000);
      }
    }
  },
  onError: (error: any) => {
    toast({
      title: "오류",
      description: error?.message || "사용자 상태 변경에 실패했습니다.",
      variant: "destructive",
    });
  },
});
```

```typescript
// client/src/lib/mockData.ts - /api/auth/user 엔드포인트
if (baseUrl === "/api/auth/user") {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    return null;
  }
  
  const stored = localStorage.getItem('user_data');
  if (stored) {
    const user = JSON.parse(stored);
    
    // Check if user is active
    if (user.isActive === false || user.is_active === false) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      return null;
    }
    
    // Also check in mockUsers array
    const userInDb = mockUsers.find(u => u.id === user.id);
    if (userInDb && userInDb.isActive === false) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      return null;
    }
    
    return user;
  }
  
  return null;
}
```

---

## 🔒 보안 제약사항

### 6.1 Admin 생성 제약사항

| 제약사항 | 설명 | 에러 메시지 |
|---------|------|------------|
| Admin만 생성 가능 | Admin이 아닌 사용자는 Admin을 생성할 수 없음 | "관리자만 다른 관리자를 생성할 수 있습니다." |
| 이메일 중복 | 이미 사용 중인 이메일은 사용할 수 없음 | "이미 사용 중인 이메일입니다." |
| 비밀번호 강도 | 최소 6자 이상 필요 | "비밀번호는 최소 6자 이상이어야 합니다." |

### 6.2 Admin 삭제 제약사항

| 제약사항 | 설명 | 에러 메시지 |
|---------|------|------------|
| 자기 자신 삭제 불가 | 자기 자신의 계정은 삭제할 수 없음 | "자기 자신을 삭제할 수 없습니다." |
| 마지막 Admin 보호 | 마지막 활성 Admin은 삭제할 수 없음 | "마지막 활성 관리자는 삭제할 수 없습니다." |
| 슈퍼 관리자만 가능 | 슈퍼 관리자만 다른 Admin을 삭제할 수 있음 | "슈퍼 관리자만 다른 관리자를 삭제할 수 있습니다." |

### 6.3 Admin 비활성화 제약사항

| 제약사항 | 설명 | 에러 메시지 |
|---------|------|------------|
| 자기 자신 비활성화 불가 | 자기 자신의 계정은 비활성화할 수 없음 | "자기 자신을 비활성화할 수 없습니다." |
| 마지막 Admin 보호 | 마지막 활성 Admin은 비활성화할 수 없음 | "마지막 활성 관리자는 비활성화할 수 없습니다." |
| 슈퍼 관리자만 가능 | 슈퍼 관리자만 다른 Admin을 비활성화할 수 있음 | "슈퍼 관리자만 다른 관리자를 비활성화할 수 있습니다." |

### 6.4 권한 수정 제약사항

| 제약사항 | 설명 | 에러 메시지 |
|---------|------|------------|
| 슈퍼 관리자만 가능 | 슈퍼 관리자만 다른 사용자의 권한을 수정할 수 있음 | "슈퍼 관리자만 사용자의 권한을 변경할 수 있습니다." |
| 자기 자신은 가능 | 자기 자신의 권한은 수정 가능 | - |

---

## 📊 권한 레벨 비교

| 기능 | 일반 관리자 (`admin`) | 슈퍼 관리자 (`super_admin`) |
|------|---------------------|---------------------------|
| 채용공고 승인/거부 | ✅ | ✅ |
| 기업 승인/거부 | ✅ | ✅ |
| 사용자 관리 | ✅ | ✅ |
| 배너 관리 | ✅ | ✅ |
| 스킬 마스터 관리 | ✅ | ✅ |
| **다른 Admin 생성** | ❌ | ✅ |
| **다른 Admin 삭제** | ❌ | ✅ |
| **다른 Admin 비활성화** | ❌ | ✅ |
| **다른 Admin 권한 수정** | ❌ | ✅ |

---

## 🔔 알림 타입

### Admin 관련 알림

| 알림 타입 | 트리거 | 수신자 | 메시지 예시 |
|---------|--------|--------|------------|
| `admin_created` | Admin 계정 생성 | 다른 활성 Admin들 | "{생성자명}님이 "{새 Admin명}" 관리자 계정을 생성했습니다." |
| `admin_deleted` | Admin 계정 삭제 | 다른 활성 Admin들 | "{삭제자명}님이 "{삭제된 Admin명}" 관리자 계정을 삭제했습니다." |
| `admin_deactivated` | Admin 계정 비활성화 | 다른 활성 Admin들 | "{비활성화자명}님이 "{비활성화된 Admin명}" 관리자 계정을 비활성화했습니다." |

---

## 🎯 주요 API 엔드포인트

### Admin Users Management

| 엔드포인트 | 메서드 | 설명 | 권한 |
|-----------|--------|------|------|
| `/api/admin/users` | GET | 사용자 목록 조회 (필터링, 페이지네이션) | Admin |
| `/api/admin/users` | POST | 새 사용자 생성 (Admin 포함) | Admin (Admin 생성은 슈퍼 관리자만) |
| `/api/admin/users/:id` | GET | 사용자 상세 정보 | Admin |
| `/api/admin/users/:id` | PUT | 사용자 정보 수정 (권한 포함) | Admin (권한 수정은 슈퍼 관리자만) |
| `/api/admin/users/:id` | PATCH | 사용자 상태 변경 (활성/비활성) | Admin (비활성화는 슈퍼 관리자만) |
| `/api/admin/users/:id` | DELETE | 사용자 삭제 | Admin (삭제는 슈퍼 관리자만) |
| `/api/admin/users/:id/reset-password` | POST | 비밀번호 재설정 | Admin |
| `/api/admin/users/stats` | GET | 사용자 통계 | Admin |

---

## 📝 체크리스트

### Admin 생성 시
- [ ] 현재 사용자가 Admin인지 확인
- [ ] Admin 생성 권한이 있는지 확인 (슈퍼 관리자만)
- [ ] 이메일 중복 확인
- [ ] 비밀번호 강도 검증
- [ ] 계정 생성
- [ ] 다른 Admin에게 알림 전송

### Admin 삭제 시
- [ ] 현재 사용자가 슈퍼 관리자인지 확인
- [ ] 자기 자신이 아닌지 확인
- [ ] 마지막 활성 Admin이 아닌지 확인
- [ ] 계정 삭제
- [ ] 다른 Admin에게 알림 전송

### Admin 비활성화 시
- [ ] 현재 사용자가 슈퍼 관리자인지 확인
- [ ] 자기 자신이 아닌지 확인
- [ ] 마지막 활성 Admin이 아닌지 확인
- [ ] 계정 비활성화
- [ ] 현재 로그인 중이면 자동 로그아웃 처리
- [ ] 다른 Admin에게 알림 전송
- [ ] `/api/auth/user`에서 비활성화 체크 강화

---

**작성일**: 2025년  
**최종 업데이트**: 2025년  
**관련 파일**: 
- `client/src/pages/admin/users.tsx`
- `client/src/lib/mockData.ts`
- `client/src/hooks/useAuth.ts`


