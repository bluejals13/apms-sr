# [Conventions] 프론트엔드 개발 표준 및 코딩 규칙 (Frontend Conventions)

- **Version:** 1.0.0
- **Last Updated:** 2026-08-30
- **Status:** Active
- **Applied Tech Stack:** React 18, TypeScript, Vite, TanStack Query (React Query) v5, Zustand, CSS Modules

---

## 1. 개요 및 적용 범위 (Scope)

본 문서는 `APMS.SR` 프론트엔드(`frontend/`)의 React 및 TypeScript 구현 표준, 레이어 분리 규칙, 그리고 복합 기능 구성 패턴을 정의합니다.

### 단일 진실 공급원 (Single Source of Truth) 원칙
* **보안 및 RBAC 정책:** 백엔드 Spring Security 필터, 토큰 수명 주기, 인가 정책 및 권한 매트릭스는 본 문서에서 재정의하지 않으며, [docs/reference/security.md](reference/security.md)를 단일 진실 공급원으로 참조합니다.
* **백엔드 개발 규칙:** Java/Spring Boot 아키텍처 및 DTO 규약은 [docs/03_Backend_Conventions.md](03_Backend_Conventions.md)를 참조합니다.
* **성능 검증 절차:** k6 기반 부하 테스트 및 모니터링 절차는 [verification/performance/k6/k6-load-test.md](../verification/performance/k6/k6-load-test.md) 및 [verification/performance/k6/](../verification/performance/k6/)의 Runbook을 따릅니다.

---

## 2. 전역 레이어 규칙 (Global Layer Conventions)

프론트엔드 소스코드는 관심사의 분리(Separation of Concerns)를 위해 8개의 전역 레이어로 구분되어 구성됩니다.

```text
frontend/src/
 ├── api/           # HTTP 통신 래퍼 및 도메인 엔드포인트 함수
 ├── queries/       # React Query useQuery 기반 서버 상태 조회 훅
 ├── mutations/     # React Query useMutation 기반 서버 상태 변경 & Invalidation 훅
 ├── types/         # 도메인 모델 및 DTO TypeScript 타입 정의
 ├── pages/         # 라우트 단위 화면(Page) 및 관계 편집 오버레이(Panel)
 ├── store/         # Zustand 클라이언트 전역 상태 (Access Token 등)
 ├── components/    # FullPageSpinner 등 공통 UI 컴포넌트
 └── auth/          # 인증/인가 코어, 라우트 가드, 폼 스키마
```

---

### 1) API Layer (`frontend/src/api/`)

#### 규칙
1. **공통 HTTP 통신 래퍼 (`http.ts`)**:
   * 컴포넌트에서 `fetch` 또는 `axios`를 직접 호출하지 않고 반드시 `http` 객체(`http.get`, `http.post`, `http.patch`, `http.put`, `http.delete`)를 사용합니다.
   * `http.ts`는 Zustand 스토어(`useAuthStore`)로부터 Access Token을 조회하여 `Authorization: Bearer <Token>` 헤더를 자동 주입합니다.
   * **Single-Flight 401 토큰 자동 갱신**: 401 Unauthorized 발생 시 `refreshPromise` 락을 통해 1회의 `POST /api/auth/refresh`를 수행하고 원래 요청을 1회 재시도(`retry=false`)합니다.
   * **계정 정지 감지**: 403 응답과 함께 `ACCOUNT_SUSPENDED` 코드가 반환되면 즉시 `logout()`을 호출하고 `AccountSuspendedError`를 발생시킵니다.
   * 백엔드 공통 응답 구조(`ApiResponse<T>`)에서 `.data` 필드를 언래핑하여 반환합니다.
2. **도메인 API 분리 (`*.api.ts`)**:
   * 도메인별로 파일을 분리(`role.api.ts`, `permission.api.ts`, `userRole.api.ts`, `user.api.ts`, `menu.api.ts`)하며, 순수 엔드포인트 URL 호출 및 파라미터 매핑만 수행합니다.

#### 실제 구현 예시
```typescript
// frontend/src/api/role.api.ts
import { http } from "./http";
import type { Role, CreateRoleRequest } from "../types/role";

const base = "/api/admin/roles";

export const fetchRoles = async (): Promise<Role[]> => {
  return await http.get<Role[]>(base);
};

export const createRole = async (data: CreateRoleRequest): Promise<Role> => {
  return await http.post<Role>(base, data);
};

export const assignPermissions = async (
  roleId: number,
  permissionIds: number[]
): Promise<void> => {
  return await http.post(`${base}/${roleId}/permissions`, { permissionIds });
};
```

---

### 2) Query Layer (`frontend/src/queries/`)

#### 규칙
1. 서버 데이터 조회는 React Query의 `useQuery`를 래핑한 커스텀 훅(`use*.ts`)으로 분리합니다.
2. **Query Key 관리**: 단순 조회는 배열 리터럴(`["roles"]`)을 사용하며, 파라미터화된 조회는 `as const` 기반의 쿼리 키 팩토리 객체(`permissionKeys.all`, `permissionKeys.detail(id)`)를 선언하여 관리합니다.
3. 뷰 컴포넌트에는 `{ data, isLoading, isError }` 상태를 일관되게 반환합니다.

#### 실제 구현 예시
```typescript
// frontend/src/queries/usePermissions.ts
import { useQuery } from "@tanstack/react-query";
import { getPermissions, getPermission } from "../api/permission.api";

export const permissionKeys = {
  all: ["permissions"] as const,
  detail: (id: number) => ["permission", id] as const,
};

export const usePermissions = (enabled = true) => {
  return useQuery({
    queryKey: permissionKeys.all,
    queryFn: getPermissions,
    enabled,
  });
};
```

---

### 3) Mutation Layer (`frontend/src/mutations/`)

#### 규칙
1. 데이터 생성, 수정, 삭제, 관계 할당 등 서버 상태를 변경하는 작업은 `useMutation`을 래핑한 커스텀 훅(`use*.ts`)으로 캡슐화합니다.
2. **자동 캐시 무효화 (Query Invalidation)**: Mutation 성공(`onSuccess`) 시 `queryClient.invalidateQueries`를 호출하여 관련된 Query Key를 즉시 무효화하고 서버 상태와 동기화합니다.
3. 여러 도메인 데이터가 연쇄적으로 영향을 받는 경우 `Promise.all`을 통해 다중 쿼리 키를 동시에 무효화합니다.

#### 실제 구현 예시
```typescript
// frontend/src/mutations/useRoleManage.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRole, updateRole, deleteRole, assignPermissions as assignPermissionsApi } from "../api/role.api";
import { userKeys } from "../queries/useUsers";

export const useRoleManagement = () => {
  const queryClient = useQueryClient();

  const invalidateRoles = async () => {
    await queryClient.invalidateQueries({ queryKey: ["roles"] });
  };

  const invalidateUsers = async () => {
    await queryClient.invalidateQueries({ queryKey: userKeys.all });
  };

  const assignPermissions = useMutation({
    mutationFn: ({ roleId, permissionIds }: { roleId: number; permissionIds: number[] }) =>
      assignPermissionsApi(roleId, permissionIds),
    onSuccess: async () => {
      // Role-Permission 관계 변경 시 Role 목록 및 영향받는 User 목록 동시 갱신
      await Promise.all([invalidateRoles(), invalidateUsers()]);
    },
  });

  return { assignPermissions, /* ... */ };
};
```

---

### 4) Type Layer (`frontend/src/types/` & `auth/auth.types.ts`)

#### 규칙
1. 백엔드 DTO(Java Record)와 1:1로 대응되는 TypeScript 인터페이스 및 유니온 타입을 정의합니다.
2. API 요청(`*Request`), 엔티티 응답 모델, UI 내부 상태 타입이 해당 계층의 인터페이스를 일관되게 공유합니다.

#### 실제 구현 예시
```typescript
// frontend/src/types/role.ts
export type RolePermission = {
  id: number;
  name: string;
};

export type Role = {
  id: number;
  name: string;
  description: string;
  permissions: RolePermission[];
};

export type CreateRoleRequest = {
  name: string;
  description: string;
};
```

---

### 5) Page Layer (`frontend/src/pages/`)

#### 규칙
1. 각 라우트의 엔트리포인트 컴포넌트로 기능하며, 전체 레이아웃 구성, 목록 조회 쿼리 호출, 기본 인라인 CRUD 폼, 서브패널 오픈 상태(`selectedId`)를 제어합니다.
2. 비즈니스 로직과 통신은 커스텀 훅(Query/Mutation)에 위임하고 렌더링에 집중합니다.

---

### 6) Panel Layer (`frontend/src/pages/**/Panel.tsx`)

#### 규칙
1. 1:N 또는 M:N 관계 할당(예: Role에 Permission 할당, User에 Role 할당)과 같은 복합 작업은 `Page`와 분리하여 독립된 `Panel` 컴포넌트로 분리합니다.
2. 오버레이(Modal/Drawer) 레이아웃을 가지며, 패널 내부 검색 필터링, 체크박스 선택/해제 로컬 상태를 관리하고 최종 저장 시 Mutation을 트리거합니다.

---

### 7) Styling Layer (`*.module.css`)

#### 규칙
1. 모든 페이지 및 컴포넌트는 전역 CSS 오염을 방지하기 위해 CSS Modules(`[ComponentName].module.css`)를 1:1로 생성하여 적용합니다.
2. 클래스명은 `styles.header`, `styles.roleCard`, `styles.permissionList` 등 카멜케이스(camelCase)를 사용합니다.

---

### 8) Loading & UI State Layer

#### 규칙
1. **페이지 단위 로딩**: 쿼리 조회 중(`isLoading`)에는 공통 컴포넌트인 `FullPageSpinner`(`components/loading/FullPageSpinner.tsx`)를 반환합니다.
2. **동작 중 버튼 상태**: Mutation 실행 중(`isPending`)에는 버튼을 비활성화(`disabled`)하고 진행 상태 텍스트("생성 중...", "저장 중...", "삭제 중...")를 표시하여 중복 요청을 방지합니다.

---

## 3. RBAC Feature Composition Convention (복합 기능 구성 패턴)

RBAC와 같이 다대다(M:N) 관계와 상태 의존성이 높은 기능은 다음과 같은 표준 조합 패턴을 따릅니다.

### 1) 구조적 흐름도
```text
[Page: RolePage.tsx] 
  ├── useRoles() ──► Role 목록 렌더링 & 기본 CRUD
  └── selectedRoleId 상태 관리 ──► "권한 관리" 클릭 시 Panel 오픈
        │
        ▼
[Panel: RolePermissionPanel.tsx] (Overlay Modal)
  ├── usePermissions() ──► 전체 Permission 목록 로드
  ├── useState(selectedPermissionIds) ──► 체크박스 토글 & 전체 선택/해제 관리
  ├── useMemo(filteredPermissions) ──► 키워드 검색 필터링
  └── "권한 저장" 클릭 ──► useRoleManagement().assignPermissions.mutate()
        │
        ▼
[Cache Invalidation]
  └── Promise.all([invalidateRoles(), invalidateUsers()]) ──► Page 자동 갱신 및 Panel Close
```

### 2) 핵심 설계 원칙
1. **책임 분리**: 목록 조회 및 단순 속성 편집은 `RolePage`에서 처리하고, 복합 관계 매핑은 `RolePermissionPanel`에 위임합니다.
2. **로컬 상태 격리**: 패널 내의 다중 선택(`selectedPermissionIds`) 및 검색 키워드(`permissionSearch`)는 컴포넌트 로컬 상태(`useState`)로 유지하다가 사용자가 "저장"을 눌렀을 때만 서버로 전송합니다.
3. **연관 캐시 동시 무효화**: 권한 관계가 변경되면 해당 Role 정보뿐 아니라, 해당 Role을 부여받은 User 정보도 함께 변경되므로 `roles` 쿼리와 `users` 쿼리를 동시에 무효화합니다.

---

## 4. 단순 CRUD 페이지와 복합 기능 페이지의 적용 기준

| 구분 | 단순 기능 (예: MenuPage, UserAdminPage) | 복합 기능 (예: RolePage, UserRolePage) |
| :--- | :--- | :--- |
| **Page 구성** | 단일 `Page.tsx` 내에서 테이블 및 인라인 폼 구성 | `Page.tsx` + `Panel.tsx` 조합 |
| **상태 관리** | 단순 입력 state (`useState`) | M:N 다중 선택 및 검색 필터링 state |
| **캐시 갱신** | 단일 쿼리 Invalidation (`invalidateMenus()`) | 다중 쿼리 Invalidation (`roles` + `users`) |
| **CSS Module** | `menu.module.css` 단일 파일 | `RolePage.module.css`, `RolePermissionPanel.module.css` 분리 |
