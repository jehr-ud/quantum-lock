# ARQUITECTURA — Quantum Lock

Documento de referencia de la arquitectura de **Quantum Lock**, elaborado a partir del código fuente del repositorio.

---

## 1. Visión general del sistema

Quantum Lock es una aplicación web **Angular** (SPA con renderizado del lado del servidor opcional) que consume **Firebase** como backend administrado:

- **Firebase Authentication** — autenticación (correo/contraseña).
- **Cloud Firestore** — persistencia de datos.
- **Firebase Hosting** — despliegue del frontend.

```mermaid
flowchart LR
    subgraph Navegador
        A[Angular SPA / SSR]
    end
    subgraph Firebase
        B[Firebase Authentication]
        C[Cloud Firestore]
        D[Firebase Hosting]
    end
    A -- "login/registro/recovery/signOut" --> B
    A -- "lecturas y escrituras" --> C
    D -- "servir bundle" --> A
```

---

## 2. Arquitectura del frontend

- **Angular 22 con componentes standalone**; bootstrap con `bootstrapApplication`; sin módulos `NgModule`.
- Router con **carga diferida** (`loadComponent`) por ruta.
- Estado reactivo con **signals** de Angular (servicios raíz y estados locales de páginas).
- SSR habilitado (`outputMode: "server"`): `/login` y `/register` prerenderizados; el resto se renderiza en el cliente (Express + `AngularNodeAppEngine`).
- Estilos: SCSS por componente + tema **Angular Material 3**.

```mermaid
flowchart TD
    boot["src/main.ts (bootstrapApplication)"]
    app["App (componente raíz, <router-outlet>)"]
    routes["app.routes.ts (lazy loading)"]
    guards["authGuard / teacherGuard"]
    services["Servicios raíz (auth, attendance, class-session, course, config, seed)"]
    features["Páginas: auth, teacher, student, dev"]
    shared["Shared: QuantumLock, Course*, RewardCard, SessionDialog"]
    firebase["firebase.ts (auth + firestore)"]

    boot --> app --> routes --> guards --> features
    routes --> shared
    features --> services
    services --> firebase
    shared --> firebase
```

### 2.1 Carpetas clave

| Carpeta | Contenido |
|---|---|
| `src/app/core` | Constantes, enums, guards, servicios, seeders, utilidades de dominio |
| `src/app/features` | Páginas por rol (`auth`, `teacher`, `student`, `dev`) |
| `src/app/shared` | Componentes y datos reutilizables |
| `src/app/models` | Interfaces del dominio |

---

## 3. Arquitectura Firebase

- Inicialización única en `src/app/core/firebase/firebase.ts` (`initializeApp` + `getAuth` + `getFirestore`).
- Firestore con las colecciones: `users`, `courses`, `class-sessions`, `attendances`, `settings`.
- Hosting con rewrite SPA (`** → index.html`) y carpeta pública `dist/quantum-lock/browser`.
- CI/CD: GitHub Actions que ejecutan `npm ci` + `npm run build` y despliegan a Firebase Hosting (rama `main` y previews de PRs).
- Las **Firestore Security Rules no están versionadas** en el repositorio (se administran en la consola de Firebase).

---

## 4. Arquitectura de autenticación

```mermaid
flowchart TD
    L[Login /register] --> A[AuthService]
    A --> FA[Firebase Authentication signIn / createUser / sendPasswordReset / signOut]
    A --> U["users/{uid} (perfil: rol, datos)"]
    A --> S["onAuthStateChanged → currentUser (signal)"]
    S --> G[Guards authGuard / teacherGuard]
    G --> R[Redirección por rol]
    R --> TD["/teacher/dashboard"]
    R --> SD["/student/dashboard"]
```

- El rol se determina en el registro desde `AppConfig.admins` y se lee desde Firestore en el login.
- La recuperación de contraseña usa `sendPasswordResetEmail`.
- El logout usa `signOut()` y redirige a `/login` (no toca datos de Firestore).

---

## 5. Modelo de datos (Firestore)

```mermaid
erDiagram
    USERS ||--o{ ATTENDANCES : "studentUid (asistencia)"
    COURSES ||--o{ CLASS_SESSIONS : "courseId"
    COURSES ||--o{ ATTENDANCES : "courseId"
    USERS ||--o{ CLASS_SESSIONS : "teacherUid"
    CLASS_SESSIONS ||--o{ ATTENDANCES : "sessionId+studentUid (ID compuesto)"
    ATTENDANCES }o--o| REWARD_CARDS : "rewardId (catálogo estático)"

    USERS {
        string uid PK
        string email
        string firstName
        string lastName
        string role "TEACHER | STUDENT"
        timestamp createdAt
        timestamp lastLogin
    }
    COURSES {
        string id PK
        string code
        string name
        array schedule "CourseScheduleSlot[] (opcional)"
    }
    CLASS_SESSIONS {
        string id PK
        string courseId FK
        string teacherUid FK
        object quantumLock "positions: QuantumDirection[] (5)"
        string status "ACTIVE"
        timestamp createdAt
        timestamp expiresAt
        number durationSeconds
    }
    ATTENDANCES {
        string id PK "sessionId_studentUid"
        string sessionId FK
        string courseId FK
        string studentUid FK
        timestamp registeredAt
        number attempts
        boolean solved
        boolean rewardClaimed
        string rewardId FK
    }
    REWARD_CARDS {
        string id PK "sp-001 … sp-050"
        string title
        string emoji
        string rarity "COMMON | RARE | EPIC | LEGENDARY"
    }
```

Características clave del modelo:

- **Asistencia** = documento único por par `(sessionId, studentUid)`. Los reintentos no crean duplicados.
- **Recompensa** = la «posesión» de una carta se representa con `rewardId + rewardClaimed` dentro de la asistencia (no hay colección de inventario).
- **Horario** = embebido en el documento del curso (`schedule[]`).
- **Configuración** = documento único `settings/application`.

---

## 6. Flujo del Profesor

```mermaid
flowchart TD
    P["Profesor logueado"] --> D["/teacher/dashboard (Mis cursos)"]
    D --> IC["Iniciar clase (createSession)"]
    IC --> CS["class-sessions: status=ACTIVE, quantumLock aleatorio, expiresAt"]
    CS --> DLG["Diálogo: Sesión creada (ID)"]
    DLG --> TS["/teacher/session/:id"]
    TS --> QL["Quantum Lock (visualización)"]
    TS --> TM["Temporizador + estado"]
    TS --> CC["Estudiantes conectados (asistencia distinta)"]
    D --> EX["Exportar asistencia (Excel por curso)"]
```

- El profesor **crea** la sesión; el estudiante nunca puede crearla ni modificarla.
- La sesión inicia **activa** y termina por **expiración** (`expiresAt`).
- `countSessionStudents` observa `attendances where sessionId` y cuenta `studentUid` distintos.

---

## 7. Flujo del Estudiante

```mermaid
flowchart TD
    S["Estudiante logueado"] --> SD["/student/dashboard (Mis cursos)"]
    SD --> ALB["Álbum /student/album/:courseId"]
    SD --> COM["Comenzar → /student/session/:courseId"]
    COM --> FAS["findActiveSession (sesión ACTIVA + no expirada)"]
    FAS --> HOR{"¿Dentro del horario?<br/>(America/Bogota)"}
    HOR -->|No| OUT["Pantalla: fuera de horario / sin sesión (sin escritura)"]
    HOR -->|Sí| ATT["attend() → asistencia creada (solved:false)"]
    ATT --> INT["Quantum Lock interactivo + temporizador"]
    INT --> SOL["solved() → revalidar sesión (refreshActiveSession)"]
    SOL --> REG["register() → solved:true + rewardId"]
    REG --> ENV["/student/envelope/:courseId (sobre)"]
    ENV --> CL["claimReward() → rewardClaimed:true"]
    CL --> CARD["Carta → Álbum (xN)"]
```

## 8. Flujo del Quantum Lock

```mermaid
flowchart TD
    INI["Inicialización: agujas en N"]
    ROT["Rotar (clic izq +1 / clic der -1)"]
    CHK{"¿patrón coincide?"}
    CHK -->|No| ROT
    CHK -->|"Sí"| SOLV["emit solved"]
    SOLV --> REV["Revalidar sesión en el padre"]
    REV --> DISP{"¿sesión disponible?"}
    DISP -->|Sí| OK["Aceptar resolución: solved:true + reward"]
    DISP -->|No| NOP["Rechazar: sin recompensa (sesión no disponible)"]
```

- El componente `QuantumLock` (shared) es una **vista de solo emisión de eventos**.
- La **decisión final de éxito** depende del padre: `refreshActiveSession` (RQ06).
- El evento `failed` está declarado pero **no se emite** en el código actual (ver observaciones).

---

## 9. Flujo de asistencia

```mermaid
flowchart TD
    E["Estudiante"] --> M["Materia"]
    M --> SA["Sesión activa del profesor"]
    SA --> VH["Validación de horario (America/Bogota)"]
    VH --> COM2["Comenzar"]
    COM2 --> ASIST["Asistencia registrada:<br/>solved:false, attempts:0, rewardClaimed:false"]
    ASIST --> QL2["Quantum Lock"]
    QL2 -->|Fracaso| FAIL["Assistencia se conserva, attempts+1, sin sobre"]
    QL2 -->|Éxito| SUCC["Asistencia actualizada:<br/>solved:true + rewardId"]
    SUCC --> SOBRE["Sobre → rewardClaimed:true → carta"]
```

Regla central: **la asistencia se registra al ingresar con «Comenzar» (sesión activa + horario válido)**; la resolución del Quantum Lock es un evento independiente y el sobre depende de esa resolución.

---

## 10. Flujo de recompensas

```mermaid
flowchart LR
    REG["Resuelve Quantum Lock"] --> REW[rewardId asignado]
    REW --> ENV2["Sobre (rewardClaimed:false)"]
    ENV2 -->|abrir| CL2["rewardClaimed:true"]
    CL2 --> ALBUM2["Álbum: cartas únicas + xN + total con duplicados"]
    CL2 --> REP["Reporte: 'Abrió sobre = Sí' / cartas en PDF"]
```

- Una carta cuenta para el álbum **solo si** `rewardClaimed === true`.
- Los reportes (Excel del profesor y PDF del estudiante) derivan su información del mismo estado de asistencia/recompensa.

---

## 11. Arquitectura de despliegue

```mermaid
flowchart LR
    GH[GitHub Actions] --> |"npm ci + npm run build"| DIST["dist/quantum-lock/"]
    DIST --> HOST["Firebase Hosting<br/>quantum-lock-22090"]
    HOST --> |"rewrite ** → /index.html"| APP["SPA/SSR"]
```

- `firebase.json`: `public: dist/quantum-lock/browser`, rewrite SPA único.
- Proyecto Firebase por defecto: `quantum-lock-22090` (`.firebaserc`).
- Merge a `main` → despliegue en vivo; pull requests → preview.

---

## 12. Observaciones y pendientes

| Tema | Estado |
|---|---|
| `teacherGuard` en `/dev` | Comentado en `app.routes.ts` — accesible sin restricción |
| Evento `failed` del Quantum Lock | No emitido — los intentos fallidos no se registran en `attempts` |
| `maxAttempts` | Configurado pero no aplicado como límite |
| Firestore Security Rules | No versionadas en el repositorio |
| Índices compuestos | No definidos en el repositorio (ej. `findActiveSession`) |
| Separación dev/prod | `environment.development.ts` duplica la configuración de producción |

---

*Documento elaborado a partir del análisis del repositorio Quantum Lock. No se modificó código de la aplicación.*