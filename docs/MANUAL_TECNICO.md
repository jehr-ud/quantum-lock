# MANUAL TÉCNICO — Quantum Lock

---

## 1. Portada

| Campo | Valor |
|---|---|
| **Nombre del sistema** | Quantum Lock |
| **Documento** | Manual Técnico |
| **Versión** | 1.0 |
| **Fecha** | 10 de septiembre de 2026 |
| **Universidad** | [Nombre de la Universidad] *(identificada por el dominio institucional `udistrital.edu.co` presente en el repositorio)* |
| **Estado del documento** | Versión inicial |
| **Autores** | [Autores] |

> **Nota:** El repositorio no contiene una declaración explícita de la institución. El dominio institucional `@udistrital.edu.co` utilizado por la aplicación sugiere que el sistema se desarrolla en el contexto de la **Universidad Distrital Francisco José de Caldas**. Se debe confirmar el nombre y los autores antes de la entrega final.

---

## 2. Control de versiones

| Versión | Fecha | Descripción |
|---|---|---|
| 1.0 | 10/09/2026 | Versión inicial del manual técnico |

---

## 3. Introducción

**Quantum Lock** es una aplicación web educativa de gamificación utilizada para registrar la participación de los estudiantes a través de sesiones interactivas denominadas *Quantum Lock*.

La aplicación se compone de dos roles principales:

- **Profesor (`TEACHER`)** — controla el ciclo de vida de las sesiones de clase y consulta la participación de los estudiantes.
- **Estudiante (`STUDENT`)** — ingresa a la clase, registra su asistencia, resuelve un reto (Quantum Lock) y obtiene recompensas.

### 3.1 Contexto educativo

La aplicación se enmarca en un contexto universitario. Los estudiantes utilizan el sistema durante el horario de clase de una materia: el profesor inicia una sesión activa con una duración determinada y los estudiantes deben resolver un patrón de agujas giratorias (Quantum Lock) dentro del tiempo disponible.

La participación en la clase (asistencia) queda registrada desde el momento en que el estudiante ingresa a la sesión y existe una sesión activa iniciada por el profesor. La resolución correcta del Quantum Lock es un logro adicional que da acceso a un sobre con una carta de recompensa coleccionable.

> **RQ09 (modificado):** el horario de la materia ya **no** bloquea el inicio del reto («Comenzar»). El horario se usa en el álbum para el botón de asistencia (repuesto), que aparece cuando el estudiante está dentro del horario de la materia y la sesión del maestro ya se cerró.

### 3.2 Problema que aborda

El sistema busca:

1. Digitalizar el control de asistencia a clase mediante un mecanismo interactivo y gamificado.
2. Garantizar que un estudiante solo pueda iniciar el reto mientras exista una sesión activa; la asistencia (repuesto) mediante el álbum aplica la validación del horario de la materia cuando la sesión ya se cerró.
3. Motivar la participación mediante una colección de 50 cartas coleccionables con duplicados válidos.
4. Permitir al profesor descargar reportes de asistencia por curso y al estudiante descargar un reporte PDF de su participación por materia.

### 3.3 Funcionalidad principal

- Autenticación con Firebase Authentication (correo institucional).
- Gestión de roles Profesor / Estudiante.
- Creación de sesiones de clase activas con bloqueos Quantum Lock aleatorios.
- Validación de horario semanal por materia (zona horaria `America/Bogota`).
- Registro de asistencia, intentos y resolución del Quantum Lock.
- Entrega de recompensas (sobre y cartas) tras la resolución correcta.
- Álbum de colección por curso con cartas únicas, duplicados (`xN`) y progreso.
- Reporte de asistencia por curso (Excel) para el profesor.
- Reporte de participación por curso (PDF) para el estudiante.
- Recuperación de contraseña mediante Firebase Authentication.
- Cierre de sesión para ambos roles.

---

## 4. Objetivo

**Objetivo general:** Brindar a los docentes una herramienta gamificada, robusta y escalable para registrar la participación y asistencia de los estudiantes durante las sesiones de clase, al tiempo que promueve la participación estudiantil mediante un reto interactivo (Quantum Lock) y un sistema de recompensas coleccionables.

---

## 5. Alcance

El alcance actual del sistema (basado exclusivamente en el código existente) comprende:

### Funcionalidad del Profesor

- Inicio de sesión con correo institucional.
- Panel principal con la lista de cursos.
- Inicio de una nueva sesión de clase (sesión activa con Quantum Lock aleatorio).
- Visualización del Quantum Lock de la sesión.
- Visualización del tiempo restante de la sesión.
- Visualización del número de estudiantes distintos que registraron asistencia (estudiantes «conectados»).
- Exportación de asistencia del curso en formato Excel (`.xlsx`).
- Cierre de sesión.

> Nota: actualmente **no existe** una vista de consulta de historial de sesiones del profesor ni un botón explícito para finalizar la sesión; la sesión termina por expiración del tiempo establecido en la configuración.

### Funcionalidad del Estudiante

- Registro de cuenta e inicio de sesión con correo institucional.
- Panel principal con la lista de materias.
- Acceso a la sesión mediante el botón **Comenzar**.
- Inicio del reto sin validación de horario; horario aplicado al botón de asistencia (repuesto) del álbum cuando la sesión ya se cerró.
- Registro automático de asistencia al ingresar a la sesión activa.
- Interacción con el Quantum Lock (rotación de agujas).
- Apertura del sobre y obtención de una carta coleccionable.
- Álbum por curso con cartas únicas, duplicados y progreso.
- Descarga de reporte PDF de participación por materia.
- Recuperación de contraseña.
- Cierre de sesión.

### Cursos, sesiones, asistencia, recompensas y reportes

- Cursos sembrados (seeders) con horarios semanales.
- Sesiones de clase creadas por el profesor.
- Asistencia asociada a sesión, curso y estudiante.
- Recompensas: sobre para abrir y cartas de la colección estacional (50 cartas).
- Reporte de asistencia por curso (Excel) y reporte de estudiante por curso (PDF).

### Autenticación

- Firebase Authentication con correo y contraseña.
- Recuperación de contraseña por correo.
- Cierre de sesión mediante `signOut()`.

---

## 6. Stack Tecnológico

Tecnologías identificadas en el repositorio (`package.json`, `angular.json`, archivos fuente):

| Tecnología | Versión | Propósito | Dónde se usa |
|---|---|---|---|
| **Angular** | ^22.1.0 | Framework principal de la aplicación (componentes standalone, señales, router) | Todo el frontend bajo `src/app/` |
| **Angular CLI** | ^22.1.3 | Generación, compilación, pruebas y arranque | `angular.json`, scripts de `package.json` |
| **TypeScript** | ~6.0.2 | Lenguaje de compilación con tipado | Todo el código fuente `.ts` |
| **RxJS** | ~7.8.0 | Programación reactiva (Observables) | `course-list`, `toObservable` en `student/session` |
| **SCSS** | — | Hojas de estilo de los componentes | Archivos `.scss` de cada componente |
| **Angular Material** | ^22.1.1 | Tema visual Material 3 y variables de estilo | `src/styles.scss` (tema `mat.theme`) y dependencia |
| **Angular CDK** | ^22.1.1 | Kit de componentes Angular | Dependencia de Material |
| **Angular SSR** | ^22.1.3 | Renderizado del lado del servidor (Node + Express) | `angular.json` (`outputMode: server`), `src/server.ts`, `src/main.server.ts` |
| **Express** | ^5.1.0 | Servidor Node para SSR | `src/server.ts` |
| **Firebase JS SDK** | ^12.17.1 | Firebase App, Authentication y Cloud Firestore | `src/app/core/firebase/firebase.ts`, servicios |
| **jsPDF** | ^4.2.1 | Generación de PDF del reporte del estudiante | `student/pages/album/album.ts` (carga dinámica) |
| **jspdf-autotable** | ^5.0.8 | Tablas automáticas dentro del PDF | `student/pages/album/album.ts` |
| **SheetJS (xlsx)** | ^0.18.5 | Generación del archivo Excel de asistencia | `teacher/pages/dashboard/dashboard.ts` |
| **Vitest** | ^4.0.8 | Ejecutor de pruebas unitarias | `angular.json` (builder `@angular/build:unit-test`), `domain.spec.ts` |
| **jsdom** | ^28.0.0 | Entorno de navegador para pruebas | DevDependency de Vitest |
| **Prettier** | ^3.8.1 | Formato de código | `.prettierrc` |
| **Tailwind CSS** | ^4.3.3 | *Declarado en dependencias pero no configurado* | No hay configuración `tailwind.config` ni directivas `@tailwind`; el tema visual proviene de Angular Material |

### Configuración relevante

- **`angular.json`**: builder `@angular/build:application`; estilos globales `src/styles.scss`; SSR habilitado con `outputMode: "server"`; presupuestos de compilación (500 kB warning / 1 MB error para el bundle inicial).
- **`tsconfig.json`**: TypeScript en modo estricto (inferido por `strictInputAccessModifiers`, `noImplicitOverride`, etc.), `target: ES2022`, `module: preserve`.
- **`.prettierrc`**: `printWidth: 100`, `singleQuote: true`.

---

## 7. Estructura del Proyecto

Estructura real del repositorio (directorios y archivos relevantes):

```text
quantum-lock/
├── .github/workflows/          # CD de Firebase Hosting (merge + pull request)
├── .agents/skills/             # Habilidades de los agentes de desarrollo
├── docs/                       # Documentación del proyecto (este manual)
├── dist/quantum-lock/          # Artefactos de compilación (browser/ y server/)
├── public/                     # Activos estáticos públicos (favicon.ico)
├── specs/                      # Especificaciones de requisitos (RQ02…RQ09)
├── src/
│   ├── app/
│   │   ├── app.ts              # Componente raíz (standalone)
│   │   ├── app.html            # Solo <router-outlet>
│   │   ├── app.routes.ts       # Definición de rutas
│   │   ├── app.config.ts       # Proveedores de la aplicación
│   │   ├── app.config.server.ts# Configuración SSR
│   │   ├── app.routes.server.ts# Rutas de renderizado del servidor
│   │   ├── core/               # Enums, guards, services, seeds, utils
│   │   ├── features/
│   │   │   ├── auth/pages/     # login, register, recover
│   │   │   ├── dev/pages/dev/  # Consola de desarrollo (seeders)
│   │   │   ├── student/pages/  # dashboard, session, envelope, album
│   │   │   └── teacher/pages/  # dashboard, session
│   │   ├── models/             # Interfaces del dominio
│   │   └── shared/
│   │       ├── components/     # quantum-lock, course-*, reward-card, session-dialog
│   │       └── data/           # reward-cards.ts (50 cartas)
│   ├── environments/           # Configuración de Firebase
│   ├── index.html              # Documento HTML raíz
│   ├── main.ts                 # Bootstrap de la aplicación
│   ├── main.server.ts          # Bootstrap SSR
│   ├── server.ts               # Servidor Express para SSR
│   └── styles.scss             # Tema global Angular Material
├── angular.json                # Configuración del workspace Angular
├── firebase.json               # Configuración de Firebase Hosting
├── .firebaserc                 # Proyecto Firebase por defecto
├── package.json                # Dependencias y scripts
├── tsconfig*.json              # Configuración de TypeScript
└── AGENTS.md                   # Instrucciones para agentes de desarrollo
```

### Responsabilidad de los directorios importantes

| Directorio | Responsabilidad |
|---|---|
| `src/app/core/` | Lógica de negocio y de infraestructura: constantes de colecciones, enums, guards de rutas, servicios (auth, attendance, class-session, course, config), seeders y utilidades de dominio (`domain.ts`). |
| `src/app/features/` | Páginas agrupadas por rol: `auth` (acceso), `teacher`, `student` y `dev` (consola de desarrollo). |
| `src/app/shared/` | Componentes reutilizables (Quantum Lock, tarjeta de curso, lista de cursos, encabezado, carta de recompensa, diálogo de sesión creada) y datos constantes (cartas de recompensa). |
| `src/app/models/` | Interfaces del dominio: `User`, `Course`, `ClassSession`, `Attendance`, `Reward`, `AlbumCard`, `QuantumLock`, `AppConfiguration`. |
| `src/environments/` | Configuración pública de Firebase App. |
| `specs/` | Documentos de requisitos funcionales (RQ02–RQ09) y de negocio. |
| `.github/workflows/` | Despliegue automático a Firebase Hosting (rama `main`) y previews en pull requests. |

---

## 8. Arquitectura Angular

La aplicación usa **Angular 22 con componentes standalone** y **bootstrap mediante `bootstrapApplication`** (sin módulos `NgModule`).

### 8.1 Arranque de la aplicación

- `src/main.ts` invoca `bootstrapApplication(App, appConfig)`.
- `src/app/app.config.ts` registra `provideRouter(routes)`, `provideClientHydration()` y `provideBrowserGlobalErrorListeners()`.
- `src/app/app.ts` es el componente raíz `app-root`, cuyo template únicamente contiene `<router-outlet></router-outlet>`.

### 8.2 SSR (Server-Side Rendering)

- `src/main.server.ts` exporta la función de bootstrap del servidor.
- `src/server.ts` crea un servidor **Express** que sirve los estáticos y delega el resto en `AngularNodeAppEngine`.
- `src/app/app.routes.server.ts` define el modo de renderizado: `/login` y `/register` se prerenderizan (`RenderMode.Prerender`); el resto se renderiza en el cliente (`RenderMode.Client`).

### 8.3 Componentes standalone e inyección de dependencias

Todos los componentes son standalone y declaran explícitamente sus imports. La inyección de dependencias se realiza con `inject()` y los servicios están registrados con `providedIn: 'root'`.

### 8.4 Señales (signals) y Observables

- **Señales:** el estado de la aplicación se gestiona con Angular signals: `AuthService.currentUser`, `CourseService.courses`, `ClassSessionService.session`, y los estados locales de cada página (`loading`, `error`, `session`, `attended`, etc.).
- **Señales computadas (computed):** derivan valores de forma reactiva (`isAuthenticated`, `isTeacher`, `isStudent`, `activeSession`, `interactive`, `colors`, `rotations`, etc.).
- **Observables:** se usan con operadores RxJS en `student/pages/session` (`toObservable` + `filter/map/take`) para resolver el curso cuando la lista aún no está cargada.

### 8.5 Guards de rutas

Dos guards funcionales en `src/app/core/guards/`:

- `authGuard` — exige autenticación; redirige a `/login` si no hay usuario.
- `teacherGuard` — exige autenticación **y** rol `TEACHER`; redirige a `/login` o a `/student/dashboard`.

### 8.6 Servicios

Servicios raíz (`providedIn: 'root'`) en `src/app/core/services/`:

| Servicio | Responsabilidad |
|---|---|
| `AuthService` | Login, registro, recuperación de contraseña, `signOut()` y estado de autenticación. |
| `AttendanceService` | Registro de asistencia, intentos, recompensas, conteo de estudiantes, reportes. |
| `ClassSessionService` | Creación, observación y consulta de sesiones de clase. |
| `CourseService` | Suscripción en tiempo real a la lista de cursos. |
| `ConfigService` | Carga de la configuración de la aplicación (`settings/application`). |
| `SeedService` | Sembrado de cursos y configuración (usado por la consola `/dev`). |

### 8.7 Estado global

No se emplea una librería externa de estado. El estado global se compone de señales de servicios raíz:

- `AuthService.currentUser` / `isAuthenticated` / `isTeacher` / `isStudent`.
- `CourseService.courses`.
- `ClassSessionService.session`.

---

## 9. Enrutamiento

Tabla de rutas definidas en `src/app/app.routes.ts`:

| Ruta | Rol | Guard | Descripción |
|---|---|---|---|
| `` (vacía) | Público | — | Redirige a `/login` |
| `/login` | Público | — | Inicio de sesión |
| `/register` | Público | — | Registro de cuenta |
| `/recover` | Público | — | Recuperación de contraseña |
| `/teacher/dashboard` | Teacher | `teacherGuard` | Panel principal del profesor |
| `/teacher/session/:id` | Teacher | `teacherGuard` | Sesión activa del profesor |
| `/dev` | Teacher (intencionado) | `teacherGuard` **deshabilitado** (comentado) | Consola de desarrollo (seeders) |
| `/student/dashboard` | Student (autenticado) | `authGuard` | Panel principal del estudiante |
| `/student/session/:courseId` | Student (autenticado) | `authGuard` | Sesión / Quantum Lock del estudiante |
| `/student/envelope/:courseId` | Student (autenticado) | `authGuard` | Sobre de recompensa |
| `/student/album/:courseId` | Student (autenticado) | `authGuard` | Álbum de la materia |

### Carga diferida

Todas las rutas usan carga diferida (`loadComponent`) para reducir el bundle inicial.

### Protección y redireccionamientos

- Acceso sin autenticación a rutas protegidas → `/login`.
- Estudiante intenta acceder a una ruta de profesor → `/student/dashboard`.
- Tras inicio de sesión, el rol determina la redirección: profesor → `/teacher/dashboard`, estudiante → `/student/dashboard`.

> **Hallazgo de seguridad:** en `app.routes.ts`, la ruta `/dev` tiene `canActivate: [teacherGuard]` **comentado**, por lo que actualmente es accesible por cualquier usuario autenticado o sin sesión. La especificación (AGENTS.md) exige que `/dev` sea exclusiva del profesor.

---

## 10. Autenticación

La autenticación se implementa con **Firebase Authentication** mediante el SDK Web (`firebase/auth`). El servicio `AuthService` (`src/app/core/services/auth.service.ts`) centraliza toda la lógica.

### 10.1 Inicialización

```ts
// src/app/core/firebase/firebase.ts
const app = initializeApp(environment.firebase);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
```

### 10.2 Inicio de sesión

- `AuthService.login(email, password)` usa `signInWithEmailAndPassword`.
- Al inicio de sesión se actualiza `lastLogin` del documento `users/{uid}` con `serverTimestamp()`.
- Se carga el perfil del usuario desde Firestore (`users/{uid}`) y se establece la señal `currentUser`.
- Se cargan los ajustes de la aplicación (`ConfigService.load()`).

### 10.3 Registro

- `AuthService.register(firstName, lastName, email, password)` usa `createUserWithEmailAndPassword`.
- Crea el documento `users/{uid}` con `role` derivado de la lista `AppConfig.admins` (si el correo aparece en esa lista, el rol es `TEACHER`; si no, `STUDENT`) y `avatar: 1`.

### 10.4 Recuperación de contraseña

- `AuthService.sendPasswordReset(email)` delega en `sendPasswordResetEmail`.
- No se implementa ningún mecanismo propio de restablecimiento.

### 10.5 Cierre de sesión

- `AuthService.signOut()` usa `signOut()` de `firebase/auth`.
- El listener `onAuthStateChanged` actualiza `currentUser` a `null`.
- Los dashboards redirigen a `/login`.

### 10.6 Estado de autenticación

- `onAuthStateChanged(auth, ...)` se registra en el constructor del servicio:
  - Si no hay usuario Firebase → `currentUser = null`.
  - Si hay usuario → se lee el perfil en `users/{uid}` y se publica en `currentUser`.
- Derivadas: `isAuthenticated`, `isTeacher`, `isStudent`.
- `waitForAuthState()` permite a los guards esperar la estabilización del estado (máximo 2 s de espera, con validación cada 100 ms).

### 10.7 Persistencia de sesión

El SDK de Firebase gestiona la persistencia por defecto (local del navegador). No hay configuración explícita adicional en el repositorio.

---

## 11. Autorización y Roles

### 11.1 Roles

| Rol | Valor enum | Acceso |
|---|---|---|
| Profesor | `TEACHER` | `/teacher/dashboard`, `/teacher/session/:id` (y `/dev` por intención) |
| Estudiante | `STUDENT` | `/student/dashboard`, `/student/session/:courseId`, `/student/envelope/:courseId`, `/student/album/:courseId` |

`UserRole` se define en `src/app/core/enums/user-role.ts`.

### 11.2 Cómo se determina el rol

- En el **registro**: `AuthService.getUserRole(email)` compara el correo contra `AppConfig.admins`; si coincide, `TEACHER`, si no, `STUDENT`.
- En el **inicio de sesión**: el rol se lee del documento `users/{uid}` en Firestore.

### 11.3 Cómo se aplica la autorización

- `teacherGuard` valida autenticación **y** rol; rechaza si no es `TEACHER`.
- `authGuard` solo valida autenticación (rutas de estudiante).
- La UI de profesor (`iniciar clase`, `exportar asistencia`) es exclusiva del rol `TEACHER`.

### 11.4 Restricciones funcionales por rol

- El profesor **inicia** y crea sesiones de clase; el estudiante nunca puede crear/modificar una sesión.
- El profesor exporta asistencia de cualquier curso; el estudiante solo consulta/descarga su propia información.
- El estudiante solo participa cuando la sesión está activa (la lógica de negocio en `attendance.service.ts` y `domain.ts` lo garantiza en el cliente).

---

## 12. Arquitectura Firebase

### 12.1 Inicialización

La aplicación se inicializa con la configuración pública del proyecto Firebase **`quantum-lock-22090`** definida en `src/environments/environment.ts` (y `environment.development.ts`). Dicha configuración contiene datos públicos de cliente de Firebase (identificadores) que el SDK requiere; **no constituyen secretos** y no se reproducen aquí por completo.

| Recurso Firebase | Uso |
|---|---|
| Firebase App | `initializeApp(environment.firebase)` |
| Authentication | login, registro, recuperación de contraseña, `signOut()`, estado (`onAuthStateChanged`) |
| Cloud Firestore | persistencia de cursos, sesiones, asistencias, usuarios y configuración |
| Firebase Hosting | despliegue del bundle de producción |

### 12.2 Firestore

- Base de datos: Cloud Firestore del proyecto `quantum-lock-22090`.
- Colecciones usadas: `users`, `courses`, `class-sessions`, `attendances`, `settings` (constantes en `src/app/core/constants/firestore.collections.ts`).

### 12.3 Hosting

`firebase.json` configura Hosting:

```json
{
  "hosting": {
    "public": "dist/quantum-lock/browser",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      { "source": "**", "destination": "/index.html" }
    ]
  }
}
```

- La carpeta pública es `dist/quantum-lock/browser`.
- El rewrite `** → /index.html` habilita el enrutamiento SPA (las rutas profundas de Angular como `/student/dashboard` funcionan al recargar).

### 12.4 Firestore Security Rules

> **No existe un archivo `firestore.rules` en el repositorio.** Las reglas de seguridad de Firestore se administran actualmente en la consola de Firebase y no forman parte del código versionado. Esto impide verificar desde el repositorio los permisos exactos (`read`/`write`) por colección. Se recomienda versionar las reglas para auditar y garantizar que el estudiante no pueda escribir sesiones ni recompensas no válidas.

### 12.5 Índices

No se encontraron archivos de índices compuestos en el repositorio. Las consultas con dos `where` y `orderBy` (por ejemplo `findActiveSession` en `class-session.service.ts`) requieren índices compuestos que deben existir o crearse en la consola de Firebase.

- `findActiveSession(courseId)`: `where courseId == X AND status == ACTIVE ORDER BY createdAt DESC` → requiere índice compuesto `courseId + status` con `createdAt` descendente.

### 12.6 Entorno / Configuración

- `src/environments/environment.ts` — configuración de producción (usada por el build).
- `src/environments/environment.development.ts` — **duplica la configuración de producción** (incluye `production: true`); no existe separación efectiva dev/prod en el repositorio.
- `.firebaserc` — proyecto por defecto: `quantum-lock-22090`.

---

## 13. Modelo de Datos Firestore

Colecciones identificadas en el código (constante `Collections`):

```
USERS         = 'users'
COURSES       = 'courses'
CLASS_SESSIONS= 'class-sessions'
SETTINGS      = 'settings'
ATTENDANCES   = 'attendances'
```

### 13.1 `users`

Documentos cuyo ID es el `uid` de Firebase Authentication.

| Campo | Tipo | Descripción |
|---|---|---|
| `uid` | string | Identificador único (ID del documento) |
| `email` | string | Correo institucional |
| `firstName` | string | Nombre(s) |
| `lastName` | string | Apellido(s) |
| `role` | `TEACHER` / `STUDENT` | Rol del usuario |
| `avatar` | number | Identificador visual del avatar (siempre `1` en el registro) |
| `createdAt` | Timestamp | Fecha de creación |
| `lastLogin` | Timestamp | Último inicio de sesión (actualizado en login) |

- **Quién lee:** `AuthService` (perfil), `AttendanceService` (reportes de asistencia).
- **Quién escribe:** la aplicación al registrarse (`AuthService.register`) y al iniciar sesión (`lastLogin`).
- **Funcionalidad:** autenticación, roles, reportes (nombre, correo).

### 13.2 `courses`

Documentos con ID de curso (ej. `1542-301`).

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | string | ID del curso (ID del documento) |
| `code` | string | Código de la materia |
| `name` | string | Nombre de la materia |
| `schedule` | `CourseScheduleSlot[]` (opcional) | Bloques horarios semanales (`day` 0–6, `start`, `end` en `HH:mm`) |

- **Quién lee:** `CourseService` (lista en tiempo real), álbum del estudiante (botón de asistencia por horario).
- **Quién escribe:** seeder (`SeedService.seedCourses`).
- **Funcionalidad:** listado de materias, horario para el botón de asistencia del álbum (RQ09).

### 13.3 `class-sessions`

Documentos cuyo ID se genera automáticamente (creado por el profesor).

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | string | ID de la sesión (ID del documento) |
| `courseId` | string | Curso al que pertenece |
| `teacherUid` | string | UID del profesor que la creó |
| `quantumLock` | `{ positions: QuantumDirection[] }` | Patrón de 5 direcciones del reto |
| `status` | `ACTIVE` | Estado de la sesión (el enum define más valores no usados) |
| `createdAt` | Timestamp | Fecha de creación (servidor) |
| `expiresAt` | Timestamp | Momento de expiración |
| `durationSeconds` | number | Duración en segundos (30 por defecto) |

- **Quién lee:** profesor (página de sesión), estudiante (`findActiveSession`, `watchSessionStatus`).
- **Quién escribe:** `ClassSessionService.createSession` (el profesor).
- **Funcionalidad:** sesiones de clase, Quantum Lock, validación de disponibilidad (RQ06).

### 13.4 `attendances`

Documentos con ID compuesto `${sessionId}_${studentUid}`.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | string | `${sessionId}_${studentUid}` |
| `sessionId` | string | Sesión a la que pertenece |
| `courseId` | string | Curso de la sesión |
| `studentUid` | string | Estudiante |
| `registeredAt` | Timestamp | Momento del registro (RQ10: fecha de asistencia indicada por el profesor, convertida a Timestamp) |
| `attempts` | number | Número de intentos almacenados |
| `solved` | boolean | Si resolvió el Quantum Lock |
| `rewardClaimed` | boolean | Si abrió/ reclamó el sobre (recompensa contada) |
| `rewardId` | string | ID de la carta (por ejemplo `sp-001`) |
| `teacherUid` | string (opcional) | Profesor que asignó el sobre (solo RQ10) |
| `manual` | boolean (opcional) | `true` si el sobre fue asignado manualmente por el profesor (RQ10) |
| `manualAttendance` | boolean (opcional) | `true` si el estudiante se registró manualmente desde el álbum (RQ09, asistencia repuesto) |

- **Quién lee:** estudiante (sesión, sobre, álbum, reporte), profesor (conteo de conectados, exportación).
- **Quién escribe:** `AttendanceService` (`attend`, `register`, `registerFailedAttempt`, `claimReward`, `assignManualReward`, `registerManualAttendance`).
- **Funcionalidad:** asistencia, intentos, resolución, recompensas, álbum, reportes, estudiantes conectados, asignación manual de sobres.
- **Regla de unicidad:** un estudiante tiene **una sola** asistencia por sesión (ID compuesto); los reintentos no crean registros duplicados.

**RQ10 — Sobres manuales**

El profesor puede asignar un sobre con una carta aleatoria a un estudiante sin que exista una sesión de clase (útil cuando el estudiante no asistió pero realizó la actividad).

- `sessionId` usa un ID sintético `manual_<generated>`; **no** se crea ni modifica ningún documento en `class-sessions`.
- `solved: true` y `rewardClaimed: true` desde el inicio: la carta se cuenta de inmediato sin que el estudiante abra el sobre.
- `manual: true` distingue la asignación manual de una asistencia por sesión.
- En el diálogo **"Asignar sobre"** el profesor indica la **fecha de asistencia** (por defecto hoy, sin fechas futuras) con la que se persiste `registeredAt`; esto repone la asistencia en la fecha en la que el estudiante asistió o realizó la actividad, en lugar de la fecha en que se realiza la asignación.
- La recompensa se cuenta como un sobre más en el álbum, el Excel (`RQ05`) y el reporte PDF del estudiante (`RQ08`, estado `Resolvió`).
- **Seguridad:** solo un usuario con rol `TEACHER` puede crear documentos con `manual == true`; un estudiante nunca puede autoasignarse ni crear sobres manuales.

### 13.5 `settings`

Documento único `settings/application`.

| Campo | Tipo | Descripción |
|---|---|---|
| `sessionDurationSeconds` | number | Duración de sesión en segundos (30) |
| `quantumLockSize` | number | Tamaño del Quantum Lock (5) |
| `maxAttempts` | number | Máximo de intentos definido (3) — **no se aplica actualmente en el flujo del estudiante** |

- **Quién lee:** `ConfigService`.
- **Quién escribe:** seeder (`SeedService.seedConfig`).
- **Funcionalidad:** configuración de sesiones.

> **Nota:** `quantumLockSize` y `maxAttempts` están definidos en la configuración, pero `generateQuantumLock()` usa fijo `length: 5` y en el flujo del estudiante no se valida el máximo de intentos.

---

## 14. Relaciones de Datos

```
Usuario (users) 
   │  1
   ├─(auth)──────────> Firebase Authentication
   │
   ├── 1:N estudiante ───> attendances.studentUid
   │                          │
   │                          ├──> sessions (class-sessions.sessionId)
   │                          └──> courses (attendances.courseId)
   │
   └── 1:N profesor ───> class-sessions.teacherUid

Curso (courses)
   ├── 1:N ──> class-sessions.courseId
   ├── 1:N ──> attendances.courseId
   └── 1:1 ──> schedule[] (horario embebido en el documento del curso)

Sesión (class-sessions)
   ├── N:1 ──> course
   ├── N:1 ──> teacher (teacherUid)
   └── 1:N ──> attendances.sessionId

Asistencia (attendances)
   ├── N:1 ──> student (studentUid)
   ├── N:1 ──> course (courseId)
   ├── N:1 ──> session (sessionId)
   └── 1:1 ──> rewardId → carta (catálogo estático en reward-cards.ts)

Recompensa / Carta (reawards)
   → Catálogo estático de 50 cartas en `shared/data/reward-cards.ts`
   → La «posesión» se modela con `attendances.rewardClaimed + rewardId`
```

### 14.1 Entidades del dominio (nombres reales)

- **`User`** — usuario autenticado con rol.
- **`Course`** — materia con o sin horario.
- **`ClassSession`** — sesión de clase iniciada por el profesor.
- **`Attendance`** — registro de participación por sesión por estudiante.
- **`Reward`** — carta de recompensa (catálogo estático).
- **`AlbumCard`** — carta con `quantity` y `collected` (derivada para el álbum).

No existe una colección independiente de intentos, sobres o cartas: el intento, el sobre y la carta se representan dentro del documento de asistencia (`attempts`, `rewardClaimed`, `rewardId`, `solved`).

---

## 15. Funcionalidad del Profesor

### 15.1 Inicio de sesión

El profesor ingresa su usuario institucional y contraseña en `/login`. Tras autenticarse, `AuthService.login` carga su perfil y la señal `currentUser.role === TEACHER` habilita la redirección a `/teacher/dashboard`.

### 15.2 Panel principal (`/teacher/dashboard`)

- Muestra `CoursesService.courses` (todas las materias).
- Por cada curso, dos acciones:
  - **Iniciar clase** → `startSession(course)`.
  - **Exportar asistencia** → `exportAttendance(course)`.
- Incluye **Cerrar sesión** (`CourseHeader` con `[showLogout]="true"`).

### 15.3 Inicio de sesión de clase

`startSession(course)`:

1. Obtiene el usuario autenticado.
2. `ClassSessionService.createSession(course.id, teacherUid)`:
   - Duración desde `ConfigService.config()?.sessionDurationSeconds` (30 s por defecto).
   - Genera un Quantum Lock aleatorio de 5 posiciones.
   - `status: ACTIVE`, `createdAt: serverTimestamp()`, `expiresAt = ahora + duración`.
3. Muestra el diálogo **Sesión creada** con el ID de la sesión («Comparte este código con tus estudiantes»).
4. Botones: **Cerrar** o **Entrar a la sesión** (`/teacher/session/:id`).

### 15.4 Sesión activa (`/teacher/session/:id`)

Guarda `teacherGuard`. Comportamiento:

- Suscribe en tiempo real al documento de la sesión (`watchSession`).
- Muestra: estado, duración, temporizador de tiempo restante (actualizado cada segundo), ID de la sesión.
- Muestra el Quantum Lock (visualización estática, sin interacción) del patrón a reproducir.
- Muestra **estudiantes conectados**: conteo de estudiantes **distintos** con asistencia registrada para esa sesión (`Attendances where sessionId`, agrupados por `studentUid`). Un estudiante con varios intentos cuenta una sola vez.

> Nota: la sesión termina por **expiración del temporizador**. No existe botón de finalizar/cancelar sesión en la UI actual.

### 15.5 Reportes / descargas

`exportAttendance(course)` (desde el dashboard):

1. `AttendanceService.getCourseAttendance(course.id)`:
   - Consulta `attendances where courseId`.
   - Lee todos los usuarios (`users`) para resolver nombre y correo.
   - `buildExportRows` genera una fila por asistencia: `fecha`, `estudiante`, `correo`, `abrioSobre` (`Sí`/`No` según `rewardClaimed`).
2. Construye un libro Excel con la librería `xlsx` (hoja `Asistencia`), columnas: **Fecha, Estudiante, Correo, Abrió sobre, Asistencia manual**.
3. Descarga el archivo `asistencia-{codigo}.xlsx`.

### 15.6 Cierre de sesión

`logout()` → `AuthService.signOut()` (Firebase `signOut`) → redirección a `/login`. Protección contra doble clic mediante la señal `logouting`.

---

## 16. Funcionalidad del Estudiante

### 16.1 Inicio de sesión / Registro

- Login y registro con dominio institucional `@udistrital.edu.co`.
- Al registrarse se crea la cuenta y el perfil; el rol por defecto es `STUDENT` (o `TEACHER` si el correo está en `AppConfig.admins`).
- Tras iniciar sesión → `/student/dashboard`.

### 16.2 Panel principal (`/student/dashboard`)

- Muestra todos los cursos (`CourseService.courses`).
- Por curso, dos acciones:
  - **Comenzar** → navega a `/student/session/:courseId`.
  - **Álbum** → navega a `/student/album/:courseId`.
- Incluye **Cerrar sesión**.

### 16.3 Selección de materia y horario

El estudiante elige la materia en el dashboard y presiona **Comenzar**. Al cargar `/student/session/:courseId`:

1. `findActiveSession(courseId)` busca la sesión activa más reciente de la materia.
2. Con sesión activa, se registra la asistencia (`attend`) y se habilita el Quantum Lock. **El horario de la materia ya no se valida en esta pantalla** (RQ09): el estudiante puede iniciar el reto en cualquier momento mientras exista una sesión activa.

El horario de cada materia se usa en el **álbum** para mostrar el botón de asistencia (repuesto).

### 16.4 Estados informativos de la sesión

La página de sesión muestra pantallas informativas según la condición:

| Condición | Pantalla |
|---|---|
| Sesión no iniciada (`!session()`) | «La sesión aún no ha comenzado. Espera a que el profesor inicie la sesión.» |
| Sesión ya no disponible | «La sesión ya no está disponible. El tiempo de la sesión terminó o el profesor la cerró.» |
| Error de carga | «No fue posible cargar la sesión» con botón **Reintentar** |

En estos estados **no** se registra asistencia, **no** se inicializa el Quantum Lock interactivo y **no** se muestra ningún error Firebase no controlado.

### 16.5 Comenzar / Registro de asistencia

Cuando hay sesión activa, la página de sesión registra automáticamente la asistencia mediante `AttendanceService.attend(session, uid)` (sin validación de horario):

- Crea el documento `attendances/{sessionId}_{studentUid}` con `solved: false`, `attempts: 0`, `rewardClaimed: false`.
- Si el documento ya existe (reingreso), **no lo recrea** (preserva el existente).

> **Precisión sobre RQ09:** la especificación indica que la asistencia se registra al *presionar* «Comenzar». En la implementación actual, «Comenzar» navega a la página de sesión y la asistencia se registra automáticamente al cargar la página cuando existe sesión activa (sin horario), antes de habilitar el Quantum Lock. El resultado efectivo coincide con la regla de negocio.

### 16.6 Botón de asistencia en el álbum (repuesto, RQ09)

En `/student/album/:courseId` se muestra un botón **Llenar asistencia manualmente** en el encabezado, junto a «Descargar reporte», cuando:

1. La hora actual en Colombia está dentro del horario del curso (`isWithinSchedule`), **y**
2. No existe una sesión activa de la materia (`findActiveSession` → `null`; la sesión ya se cerró).

Al pulsarlo:

- Busca la **última sesión** de la materia (`classSessionService.getLatestSession`).
- Si el curso no tiene ninguna sesión previa, muestra el mensaje claro «No hay una sesión previa para registrar tu asistencia.» (estado normal, sin error Firebase).
- Si existe, llama a `AttendanceService.registerManualAttendance(session, uid)`, que crea `attendances/{latestSessionId}_{uid}` **solo si no existe** (idempotente: nunca crea duplicados) con `solved: true`, `rewardClaimed: false` y `manualAttendance: true`. No otorga ni abre sobre: el reporte muestra «Resolvió» y la exportación «Abrió sobre = No». Usa la misma forma de escritura que el flujo normal del estudiante (no usa el marcador `manual` de RQ10, restringido a TEACHER por reglas), por lo que no requiere reglas Firestore nuevas. En el Excel del profesor estos registros se marcan en la columna **Asistencia manual = Sí**.
- Si el estudiante ya tenía asistencia para esa sesión, muestra «Ya tenías asistencia registrada en esta sesión.» (sin duplicar ni sobrescribir).

La condición de horario es un estado normal de la aplicación: si no se cumple (o la sesión sigue activa), el botón simplemente no aparece.

### 16.7 Sesión / Quantum Lock

- Tras registrar asistencia (`attended = true`), el Quantum Lock queda **interactivo** (`interactive()`).
- Se inicia un temporizador con el tiempo restante de la sesión.
- Se observa en tiempo real el estado de la sesión (`watchSessionStatus`). Si la sesión deja de estar disponible o expira, se detiene la participación y se muestra la pantalla «La sesión ya no está disponible».
- Al resolver el patrón, `solved()` **revalida la sesión** (`refreshActiveSession` → `getSessionById` + `isSessionUsable`) antes de aceptar el resultado. Si la sesión ya no es válida, no se concede recompensa.
- `AttendanceService.register` actualiza la asistencia con `solved: true` y asigna `rewardId` aleatorio.
- Navega a `/student/envelope/:courseId`.

### 16.8 Intento fallido

La UI declara el manejador `failed()` ligado al evento `(failed)` del componente Quantum Lock para registrar el intento fallido (`registerFailedAttempt` → `attempts + 1`).

> **Hallazgo (RQ09 / AGENTS.md):** el componente `QuantumLock` **nunca emite el evento `failed`** (solo emite `solved`). En consecuencia, `registerFailedAttempt` no llega a ejecutarse en el flujo actual: los intentos fallidos **no incrementan el campo `attempts`** ni muestran el mensaje «El patrón no coincide.». Esto es una **desviación parcial** respecto a RQ09 (que exige `attempts + 1` en fallo).

### 16.9 Sobre (`/student/envelope/:courseId`)

1. Busca la última sesión del curso (`getLatestSession`).
2. Busca la asistencia del estudiante para esa sesión.
3. Requiere `attendance.solved === true`; si no, muestra «Debes completar correctamente el Quantum Lock para obtener la recompensa.»
4. Resuelve la carta (`getReward`).
5. Si `rewardClaimed === true` muestra «¡Recompensa obtenida!»; si no, muestra el botón **Abrir sobre**.
6. `open()` → `claimReward` marca `rewardClaimed: true` y muestra la carta obtenida con el componente `RewardCard`.

### 16.10 Álbum (`/student/album/:courseId`)

- `AttendanceService.getStudentRewardCounts(uid, courseId)` consulta `attendances where studentUid AND courseId` y calcula `computeRewardCounts` (solo cuenta asistencias con `rewardClaimed === true` y `rewardId`).
- Muestra las 50 cartas con cantidad `xN`, cartas bloqueadas (`?`), progreso (`X / 50`, porcentaje), total de recompensas obtenidas (con duplicados) y desglose por rareza.
- Botón **Descargar reporte** → PDF del reporte por curso (ver sección Reportes).
- Botón de asistencia (repuesto, RQ09): ver sección 16.6.

### 16.11 Cierre de sesión

Igual que el profesor, mediante `CourseHeader` → `AuthService.signOut()` → `/login`. No modifica datos.

---

## 17. Quantum Lock

### 17.1 Modelo

- `QuantumLockModel` (`src/app/models/quantum-lock.ts`): `{ positions: QuantumDirection[] }`.
- `QuantumDirection` enum: 8 direcciones (N, NE, E, SE, S, SW, W, NW).
- Patrón generado en `ClassSessionService.generateQuantumLock()`: **5 posiciones aleatorias** (una por aguja).

### 17.2 Componente

`src/app/shared/components/quantum/quantum-lock/quantum-lock.ts` (standalone, `selector: app-quantum-lock`).

- Entradas:
  - `lock` (obligatorio) — modelo del patrón.
  - `interactive` (opcional, por defecto `false`) — habilita la interacción.
- Salidas:
  - `solved` — se emite cuando se completa el patrón.
  - `failed` — **declarada pero nunca emitida en el código actual**.

### 17.3 Inicialización

- Un `effect` inicializa `currentPositions` con todas las agujas en dirección `N` (posición neutra).
- Las rotaciones se calculan con un `computed` (`rotations`) que devuelve grados: N=0°, NE=45°, E=90°, SE=135°, S=180°, SW=225°, W=270°, NW=315°.
- Cuando `interactive() === false`, el componente muestra el patrón objetivo (sin permitir cambios).

### 17.4 Controles / Entrada

- **Clic izquierdo** → `rotateClockwise(index)`: rota la aguja +1 paso (horario).
- **Clic derecho** (`contextmenu`, con `preventDefault`) → `rotateCounterClockwise`: rota −1 paso (antihorario).
- Si `interactive()` es `false`, las rotaciones se ignoran.

### 17.5 Condición de éxito

`isSolved()` = todas las posiciones actuales coinciden con `lock().positions`. Un `effect` escucha `interactive()` y cuando eso ocurre emite `solved`.

> **Particularidad:** el éxito se emite de forma reactiva en cuanto el patrón coincide; la *aceptación final* del resultado depende de la revalidación de la sesión en el padre (`refreshActiveSession`), conforme a RQ06.

### 17.6 Comunicación con Firebase

- El componente solo emite eventos; **no escribe en Firestore**.
- El padre (página de sesión del estudiante) revalida la sesión y llama a `AttendanceService.register` o `registerFailedAttempt` (este último actualmente sin invocación efectiva, ver 16.7).

### 17.7 Vista del profesor

En `/teacher/session/:id` el mismo componente se usa **sin** `interactive`, mostrando el patrón objetivo que los estudiantes deben reproducir.

---

## 18. Asistencia

Flujo esperado (RQ09):

```
Estudiante
   ↓
Materia
   ↓
Sesión activa del profesor
   ↓
Comenzar
   ↓
Asistencia registrada (solved: false, attempts: 0, rewardClaimed: false)
   ↓
Quantum Lock
   ├── Éxito → attendances actualizado (solved: true + rewardId) → sobre → recompensa
   └── Fracaso → la asistencia se conserva; attempts + 1; sin sobre

Repuesto (álbum):
   Reto completado (solved) + dentro del horario de la materia
   → botón «Registrar asistencia» → attend(sesión activa, uid) → asistencia registrada
```

### Regla de negocio principal

**La asistencia se registra cuando el estudiante ingresa a la sesión (mediante «Comenzar») con una sesión del profesor activa.** El horario de la materia **ya no** valida el inicio del reto; se usa en el álbum para el botón de asistencia (repuesto). La resolución exitosa del Quantum Lock **no** es la definición de asistencia.

### Cómo lo implementa el código actual (`attendance.service.ts` + `session.ts`)

1. `attend(session, uid)` crea (si no existe) el documento con `solved:false, attempts:0, rewardClaimed:false`. La asistencia queda registrada **antes** de habilitar el Quantum Lock.
2. Si el estudiante resuelve: `register()` actualiza `solved:true` y `rewardId`.
3. Si la sesión no está activa/expiró, `assertSessionAvailable` lanza `SESSION_NOT_ACTIVE`/`SESSION_EXPIRED` y **no** se registra nada.
4. El reingreso preserva la asistencia existente.

### Discrepancias detectadas entre la regla y la implementación

| Aspecto | Especificación (RQ09) | Implementación | Estado |
|---|---|---|---|
| Momento del registro | Al presionar «Comenzar» | Automático al cargar la página de sesión (tras «Comenzar») | Coherente en la práctica |
| Intentos fallidos | `attempts + 1` y mensaje de error | El evento `failed` no se emite: `attempts` no incrementa | **Desviación parcial** |
| Asistencia en fallo | Se conserva | Se conserva (documento creado en `attend`) | Cumple |

---

## 19. Horarios de Curso

### 19.1 Representación del horario

Cada curso puede definir bloques semanales en el campo `schedule` del documento de Firebase:

```ts
interface CourseScheduleSlot {
  day: number;   // 0 = Domingo, 1 = Lunes ... 6 = Sábado
  start: string; // 'HH:mm' hora de Colombia
  end: string;   // 'HH:mm' hora de Colombia
}
```

- Un curso **sin** `schedule` (o con lista vacía) no restringe la participación (`isWithinSchedule` devuelve `true`).
- El estudiante está dentro del horario si **al menos un bloque** cumple `day === díaActual(Colombia)` y `start <= hora < end` (el extremo de inicio se incluye, el de fin se excluye).

### 19.2 Zona horaria

La referencia es la zona horaria de Colombia: `America/Bogota` (UTC−5, sin horario de verano). Implementada en `getColombiaTimeParts()` (`src/app/core/utils/domain.ts`) usando `Intl.DateTimeFormat` con `timeZone: 'America/Bogota'`.

### 19.3 Seeder

Los horarios provienen **únicamente** de los seeders (`seed.data.ts` + `seed.service.ts`). El profesor **no** configura horarios por UI.

### 19.4 Utilidades de dominio

| Función | Ubicación | Descripción |
|---|---|---|
| `getColombiaTimeParts(now)` | `core/utils/domain.ts` | Día (0–6) y minutos del día en Colombia |
| `minutesOfDay(time)` | `core/utils/domain.ts` | `'HH:mm'` → minutos desde medianoche |
| `isWithinSchedule(schedule, now)` | `core/utils/domain.ts` | Verifica si la hora cae en algún bloque |

---

## 20. Recompensas

### 20.1 Asignación

- Cada **sesión resuelta** otorga una carta aleatoria de las 50 del catálogo (`REWARD_CARDS` en `shared/data/reward-cards.ts`).
- La carta se asigna en `AttendanceService.register` (`rewardId`) al resolver el Quantum Lock.
- La carta **cuenta** para el álbum únicamente cuando `rewardClaimed === true` (sobre abierto).

### 20.2 Sobre

- Solo es accesible tras **resolver correctamente** el Quantum Lock (`attendance.solved === true`).
- Abrir el sobre (`claimReward`) marca `rewardClaimed: true`.
- El estado del sobre para reportes se deduce de `rewardClaimed` (si lo abrió: «Sí»).

### 20.3 Cartas de la colección estacional

50 cartas **Spider-Verse** (estáticas):

| Rareza | Cantidad | Rango de IDs |
|---|---|---|
| COMÚN (`COMMON`) | 20 | `sp-001` – `sp-020` |
| RARA (`RARE`) | 15 | `sp-021` – `sp-035` |
| ÉPICA (`EPIC`) | 10 | `sp-036` – `sp-045` |
| LEGENDARIA (`LEGENDARY`) | 5 | `sp-046` – `sp-050` |

### 20.4 Duplicados

- **Los duplicados son válidos.** Recibir la misma carta varias veces no elimina ni sobrescribe las anteriores.
- El álbum muestra la cantidad con `xN` (p. ej. Spider-Man x3).
- El **progreso de la colección** cuenta **cartas únicas** (`colección X / 50`).
- El **total de recompensas obtenidas** incluye duplicados.

### 20.5 Álbum

- Por **curso** (`/student/album/:courseId`).
- Deriva las cantidades de `attendances where studentUid == uid AND courseId == course` (solo `rewardClaimed`).
- Desglose por rareza (colectadas / total).

### 20.6 Diferencia entre conceptos

| Concepto | Cuándo ocurre | Marca en datos |
|---|---|---|
| **Asistencia** | Ingreso a sesión activa («Comenzar») o botón de asistencia del álbum (repuesto) | documento `attendances` creado |
| **Quantum Lock resuelto** | Patrón correcto + sesión revalidada | `solved: true`, `rewardId` asignado |
| **Sobre** | Tras resolver, al abrirlo | `rewardClaimed: true` |
| **Carta / álbum** | La carta cuenta cuando el sobre se abre | `rewardId` con `rewardClaimed: true` |

---

## 21. Recuperación de Contraseña

Flujo implementado (RQ04):

```
Login
   ↓
«¿Olvidaste tu contraseña?» → /recover
   ↓
Ingresar usuario institucional
   ↓
Firebase Authentication sendPasswordResetEmail
   ↓
Correo de restablecimiento enviado
   ↓
Mensaje de confirmación en pantalla
   ↓
Volver al inicio de sesión
```

### Detalles técnicos

- `Recover` (`features/auth/pages/recover`):
  - Construye el correo `username@udistrital.edu.co`.
  - Validaciones: usuario no vacío; dominio institucional.
  - Llama a `AuthService.sendPasswordReset(email)` → `sendPasswordResetEmail(auth, email)`.
  - En éxito muestra mensaje y el correo de destino.
  - Errores mapeados a mensajes amigables: `auth/user-not-found`, `auth/invalid-email`, `auth/network-request-failed` (respuesta genérica para usernot-found por política de privacidad).
- **No** se implementan tokens propios ni almacenamiento de contraseñas.

---

## 22. Cierre de Sesión (Logout, RQ07)

```
Teacher/Student autenticado
   ↓
Dashboard (curso compartido → CourseHeader)
   ↓
«Cerrar sesión»
   ↓
Firebase Authentication signOut()
   ↓
onAuthStateChanged → currentUser = null
   ↓
Redirección a /login
```

### Detalles técnicos

- Acción disponible en **ambos** dashboards mediante el componente compartido `CourseHeader` con la capacidad **opcional** `[showLogout]="true"`.
- `AuthService.signOut()` delega en `signOut()` de `firebase/auth`.
- Protección contra doble clic: señal `logouting` deshabilita el botón mientras se procesa («Cerrando sesión…»).
- Manejo de errores: si `signOut()` falla, se muestra «No fue posible cerrar la sesión. Inténtalo nuevamente.» y **no** se redirige.
- Guards siguen protegiendo las rutas tras el logout (reintentar `/teacher/dashboard` sin sesión → `/login`).
- No se elimina ni modifica ningún dato de Firestore.

---

## 23. Reportes

### 23.1 Reporte de asistencia del curso (Excel) — RQ05

- Fuente: dashboard del profesor, acción **Exportar asistencia** por curso.
- Datos: `AttendanceService.getCourseAttendance(courseId)` → columnas:

| Columna | Origen |
|---|---|
| `Fecha` | `registeredAt` (formato `dd/mm/aaaa hh:mm`) |
| `Estudiante` | `users.firstName + lastName` |
| `Correo` | `users.email` |
| `Abrió sobre` | `rewardClaimed ? 'Sí' : 'No'` |
| `Asistencia manual` | `manualAttendance ? 'Sí' : 'No'` (RQ09: el estudiante se registró manualmente desde el álbum; el marcador `manual` de RQ10 no activa esta columna) |

- Reglas: solo asistencias del curso seleccionado; una fila por registro (una fila por sesión/estudiante, sin duplicar); estudiantes que asistieron y fallaron el Quantum Lock aparecen con «Abrió sobre = No».
- Generación: librería `xlsx` → descarga `asistencia-{codigo}.xlsx`.

### 23.2 Reporte del estudiante por curso (PDF) — RQ08

- Fuente: álbum del estudiante, acción **Descargar reporte**.
- Datos: `AttendanceService.getStudentCourseReport(uid, courseId)` → filas `Fecha | Estado | Cartas`:

| Columna | Origen |
|---|---|
| `Fecha` | `registeredAt` |
| `Estado` | `solved ? 'Resolvió' : 'Falló'` |
| `Cartas` | `rewardClaimed && rewardId ? 1 : 0` |

- Encabezado del PDF: «Reporte de Participación / Quantum Lock / Materia / Estudiante».
- Total de cartas = suma de la columna (incluye duplicados).
- Generación: `jsPDF` + `jspdf-autotable` (import dinámico) → descarga `reporte-{nombre-materia}.pdf`.
- Reglas: solo datos del estudiante autenticado y del curso seleccionado (`getStudentCourseReport`); una fila por sesión; no modifica Firestore.

---

## 24. Seeders

### 24.1 Ubicación

- Datos: `src/app/core/seeds/seed.data.ts` (constante `SEED`).
- Servicio: `src/app/core/seeds/seed.service.ts` (`SeedService`).
- Interfaz de ejecución: consola de desarrollo `/dev` (página `features/dev`).

### 24.2 Operaciones

| Método | Qué hace |
|---|---|
| `seedCourses()` | Para cada curso de `SEED.courses`: si no existe, lo crea; si existe **sin `schedule`**, lo fusiona con `setDoc(..., { merge: true })` sin tocar el resto del documento. |
| `seedConfig()` | Sincroniza `settings/application` con `SEED.config` (merge). |
| `seedEverything()` | Ejecuta `seedCourses()` + `seedConfig()` en orden. |

### 24.3 Contenido del seed

- **Cursos con horarios** (ver sección 25).
- **Configuración:** `sessionDurationSeconds: 30`, `quantumLockSize: 5`, `maxAttempts: 3`.

### 24.4 Ejecución

1. Iniciar sesión (rol TEACHER) y navegar a `/dev` (o usar la URL directamente).
2. Pulsar **🌱 Crear cursos**, **🌱 Crear Configuración** o **🚀 Ejecutar todos los seeds**.
3. El resultado se confirma con `alert()` y los logs en consola.

> No existe comando npm dedicado para sembrar.

### 24.5 Nota sobre usuarios

El seeder **no** crea usuarios. Los usuarios se crean ingresando al registro de la aplicación. El rol TEACHER se asigna a los correos definidos en `AppConfig.admins` (`core/config/app.config.ts`).

---

## 25. Datos de Horarios de los Cursos (seed)

Horarios definidos en `seed.data.ts`. `day`: 0=Dom, 1=Lun, 2=Mar, 3=Mié, 4=Jue, 5=Vie, 6=Sáb. Hora de Colombia (`America/Bogota`).

| ID de curso | Código | Nombre | Bloques de horario |
|---|---|---|---|
| `1542-301` | `1542` | Programación por Componentes | Lunes 07:00–09:00; Miércoles 09:00–11:00 |
| `1542-303` | `1542` | Programación por Componentes | Martes 07:00–09:00; Jueves 09:00–11:00 |
| `1532-302` | `1532` | Inteligencia Artificial | Lunes 08:00–10:00; Viernes 10:00–12:00 |

Observaciones:

- Cada curso tiene una relación inequívoca **id ↔ curso ↔ horario** en el código del seed.
- Los cursos `1542-301` y `1542-303` comparten nombre («Programación por Componentes») pero difieren en ID y horarios.
- No se identifican otros cursos con horario en el repositorio.

---

## 26. Manejo de Errores

| Categoría | Caso | Manejo en la aplicación |
|---|---|---|
| **Autenticación** | Credenciales inválidas | El login captura el error y muestra el mensaje de Firebase (`e.message`). |
| **Autenticación** | Correo no institucional | Validación previa en el formulario («Debes utilizar tu correo institucional.»). |
| **Autenticación** | Recuperación de contraseña fallida | `recover.ts` mapea `${error.code}` a mensajes amigables (usuario no encontrado, correo inválido, red). |
| **Firestore** | Error al cargar sesión | Pantalla de error con botón **Reintentar** (`loadError`); se registra en consola. |
| **Firestore** | Error al contar estudiantes conectados | Se muestra `—` y el mensaje «No fue posible cargar el conteo de estudiantes.» (`connectedError`). |
| **Sesión no disponible (normal)** | Sesión no iniciada / expirada / cerrada | Pantallas informativas «La sesión aún no ha comenzado» / «La sesión ya no está disponible» (`unavailable`/`!session`); **no** se lanza error Firebase no controlado (RQ06). |
| **Fuera de horario (normal)** | `isWithinSchedule === false` | El botón de asistencia del álbum (RQ09) no se muestra; el inicio del reto («Comenzar») **no** valida horario. |
| **Sin sesión activa (repuesto álbum)** | El estudiante está dentro del horario y la sesión ya se cerró (no hay sesión activa) | El botón «Llenar asistencia manualmente» se muestra; al pulsarlo registra la asistencia contra la última sesión del curso (`registerManualAttendance`, con `manualAttendance: true`) y el Excel del profesor la marca en «Asistencia manual = Sí». Si el curso no tiene sesiones previas: «No hay una sesión previa para registrar tu asistencia.» (estado normal, sin error Firebase). |
| **Quantum Lock fallido** | Patrón incorrecto | Intención: `failed()` muestra «El patrón no coincide.» y animación; **no operativo** porque el componente no emite `failed` (ver 16.7). |
| **Configuración** | `settings/application` ausente | `ConfigService.load()` deja `config` en `null`; `createSession` usa 30 s como valor por defecto. |
| **Red** | `auth/network-request-failed`, desincronización | Mensajes genéricos de reintento; `resolveCurrentUser` espera el re-sync de `currentUser`. |
| **Entradas inválidas** | Contraseña corta, contraseñas distintas, usuario vacío | Validaciones en `login.ts`, `register.ts`, `recover.ts`. |

Principio de la solución: los estados «sin sesión», «fuera de horario» y «sin sesión activa para el repuesto del álbum» son **estados normales** de la aplicación y se manejan por separado de los errores inesperados de Firestore (que sí se registran en consola para desarrollo).

---

## 27. Seguridad

### 27.1 Autenticación

- Firebase Authentication es la única fuente de autenticación.
- Las contraseñas nunca se almacenan ni transmiten fuera de Firebase.
- El restablecimiento de contraseña usa `sendPasswordResetEmail`.
- El estado de sesión se observa con `onAuthStateChanged`.

### 27.2 Autorización

- Guards de rutas Angular (`authGuard`, `teacherGuard`).
- El rol proviene del documento `users/{uid}`, establecido en el registro según `AppConfig.admins`.

### 27.3 Firestore Security Rules

- No hay archivo `firestore.rules` en el repositorio; las reglas se gestionan en la consola de Firebase.
- **Recomendación:** versionar las reglas. La especificación exige que los estudiantes **no** puedan modificar sesiones, crear asistencias inválidas ni debilitar permisos. La validación de disponibilidad de sesión se hace del lado del cliente, pero la seguridad final depende de las reglas de Firestore.

### 27.4 Restricciones de acceso / riesgos identificados

| Riesgo | Estado |
|---|---|
| Ruta `/dev` guiada por `teacherGuard` | El guard está **comentado**; `/dev` queda accesible sin restricción. **Corregir antes de entrega.** |
| Firestore rules versionadas | **No presentes** en el repositorio. |
| `maxAttempts` definido pero no aplicado | No limita intentos. |
| Configuración pública de Firebase | Es configuración pública de cliente (no confidencial); no se debe exponer `apiKey` como secreto. |

> No se incluyen en este documento valores sensibles del repositorio (como archivos `.env.local`).

---

## 28. Instalación

### 28.1 Requisitos previos

- Node.js 22 (el proyecto declara `npm@10.9.8` como gestor y usa Node 22 en `start.sh` y en las GitHub Actions).
- npm incluido con Node.
- Cuenta y proyecto de Firebase con Authentication habilitado (Email/Password) y Cloud Firestore.
- (Opcional) CLI de Firebase para despliegue manual.

### 28.2 Instalación del proyecto

```bash
npm install
```

### 28.3 Dependencias

Véase `package.json`. Principales:
- Runtime: Angular 22, RxJS, Firebase 12, Express, jsPDF, jspdf-autotable, xlsx, Angular Material/CDK.
- Desarrollo: Angular CLI, TypeScript, Vitest, jsdom, Prettier.

### 28.4 Configuración de entorno

- La configuración de Firebase App se encuentra en `src/environments/environment.ts`. Si el proyecto Firebase cambia, se debe reemplazar por la configuración del nuevo proyecto.
- La lista de cuentas TEACHER (correos administradores) está en `src/app/core/config/app.config.ts` (`AppConfig.admins`).
- El dominio institucional permitido está en `AppConfig.allowedDomains`.
- Los archivos `.env.local`/`.env.example.local` existen en el repositorio pero **no** son leídos por la aplicación (no hay uso de `process.env`/`import.meta.env` en `src/app`); son meramente informativos.

### 28.5 Base de datos

- Ejecutar los seeders (cursos + configuración) desde `/dev` una vez desplegada la app o creados manualmente los documentos.
- Crear los índices compuestos requeridos por las consultas (ver 12.5).

### 28.6 Ejecutar localmente

```bash
ng serve
```

Se sirve en `http://localhost:4200/` (recarga automática).

---

## 29. Desarrollo

- Servidor de desarrollo: `ng serve` (script npm: `npm start`).
- Build incremental en modo desarrollo: `ng build --watch --configuration development` (script npm: `npm run watch`).
- `start.sh` (opcional): `nvm use 22 && ng serve`.
- Al ejecutarse localmente se conecta al **proyecto Firebase en la nube** (`quantum-lock-22090`); no hay emuladores configurados.

---

## 30. Build

- Comando: `npm run build` → `ng build`.
- Configuración `@angular/build:application`; `outputMode: "server"` (SSR).
- Salida: **`dist/quantum-lock/`** con:
  - `browser/` — bundle del navegador (`index.csr.html`, chunks JS, `styles-*.css`).
  - `server/` — servidor Express compilado (`server.mjs`).
  - `prerendered-routes.json` — rutas prerenderizadas (`/login`, `/register`).
  - `3rdpartylicenses.txt`.
- La compilación de producción optimiza, aplica `outputHashing: all` y valida presupuestos (500 kB warning / 1 MB error inicial).

---

## 31. Despliegue

### 31.1 Configuración de Hosting

`firebase.json` → Hosting del bundle `dist/quantum-lock/browser`, con rewrite `** → /index.html` para el enrutamiento SPA.

### 31.2 Proyecto Firebase

`.firebaserc` → proyecto por defecto: `quantum-lock-22090`.

### 31.3 Despliegue automático (CI/CD)

GitHub Actions en `.github/workflows/`:

- `firebase-hosting-merge.yml` — al hacer `push` a `main`: `npm ci` → `npm run build` → deploy a **Firebase Hosting** (`channelId: live`, proyecto `quantum-lock-22090`).
- `firebase-hosting-pull-request.yml` — en pull requests: build + preview.

### 31.4 Despliegue manual

```bash
npm run build
firebase deploy --only hosting
```

### 31.5 SPA y rewrites

Como la app usa rutas de cliente (p. ej. `/student/dashboard`), el rewrite `** → /index.html` garantiza que cualquier ruta profunda sirva la SPA y que Angular resuelva la ruta correspondiente.

---

## 32. Pruebas

### 32.1 Pruebas unitarias

- Ejecutor: **Vitest** (builder `@angular/build:unit-test`).
- Comando: `ng test` (script npm: `npm test`).
- Archivos `.spec.ts` existentes:
  - `src/app/core/utils/domain.spec.ts` — pruebas más relevantes: horario de Colombia, `isSessionUsable`, `isWithinSchedule`, `minutesOfDay`, `countDistinctStudents`, `computeRewardCounts`, `formatExportDate`, `buildExportRows`, `buildStudentReportRows`. (Importa `describe/it/expect` de `vitest`.)
  - `src/app/core/guards/auth-guard.spec.ts`, `src/app/core/guards/teacher-guard.spec.ts` — pruebas «smoke» de creación de guards.
  - `src/app/app.spec.ts` — creación del componente raíz y presencia de `<router-outlet>`.

### 32.2 Otras verificaciones

- Compilación TypeScript: incluida en `ng build`.
- Linting: **no hay script de lint definido** en `package.json` (solo Prettier como formateador).
- Pruebas e2e: `ng e2e` se menciona en README pero **no** hay framework e2e configurado en el proyecto.

---

## 33. Solución de Problemas (Troubleshooting)

| Problema | Causa probable | Solución |
|---|---|---|
| **Firebase 404 o página en blanco al recargar una ruta profunda** | Falta el rewrite de SPA | Verificar que `firebase.json` conserve `"rewrites": [{"source": "**", "destination": "/index.html"}]` y redesplegar. |
| **«No fue posible cargar la sesión»** | Red, reglas de Firestore o configuración | Revisar la consola del navegador; esperar a que el profesor inicie la sesión; verificar conectividad. |
| **«La sesión aún no ha comenzado»** | No hay sesión activa | Es el comportamiento esperado; esperar a que el profesor inicie la sesión. |
| **«La sesión ya no está disponible»** | Sesión expiró o el profesor la cerró | No se pierde la asistencia ya registrada; esperar la siguiente sesión. |
| **Error de permisos Firestore** | Reglas del proyecto no leen/escriben como la app espera | Verificar las reglas en la consola de Firebase; **no** debilitarlas con `allow read, write: if request.auth != null` universal. |
| **Queries que piden índice** | Faltan índices compuestos en Firestore | Crear los índices solicitados en la consola (p. ej. `class-sessions` `courseId` + `status` + `createdAt desc`). |
| **No aumentan los intentos fallidos** | El componente `QuantumLock` no emite `failed` | Bug conocido (ver 16.7); requiere corregir la emisión del evento o la detección de fallo. |
| **El reporte Excel sale vacío** | El curso no tiene asistencias | Comportamiento esperado: el archivo se genera con solo los encabezados; o el estudiante nunca ingresó. |
| **Errores de build por presupuestos** | Bundle inicial > 1 MB | Revisar imports dinámicos (las librerías pesadas `jspdf`/`xlsx` ya se cargan dinámicamente) o ajustar presupuestos. |
| **Acceso a `/dev` sin ser profesor** | Guard `teacherGuard` comentado en `app.routes.ts` | Corregir activando `canActivate: [teacherGuard]`. |

---

## 34. Estado de Implementación (Especificaciones vs. Código)

Resumen de los requisitos de `specs/` (RQ02–RQ09) y AGENTS.md frente al estado real del código.

| Requisito | Descripción | Estado | Observaciones |
|---|---|---|---|
| **RQ02** — Estudiantes conectados | Contar estudiantes distintos con asistencia en la sesión del profesor | **IMPLEMENTADO** | `countSessionStudents` + `countDistinctStudents`; vista en `teacher/session`. Errores se muestran como `—`. |
| **RQ03** — Cartas repetidas | Álbum con duplicados `xN`, cartas únicas y progreso | **IMPLEMENTADO** | `computeRewardCounts`, 50 cartas, `collectedCount` (únicas) y `totalObtained` (con duplicados). |
| **RQ04** — Recuperación de contraseña | Restablecimiento por correo con Firebase Auth | **IMPLEMENTADO** | `recover` + `sendPasswordResetEmail`; mensajes amigables. |
| **RQ05** — Exportación de asistencia | Excel por curso (Fecha, Estudiante, Correo, Abrió sobre, Asistencia manual) | **IMPLEMENTADO** | `xlsx`; una fila por registro; `abrioSobre` Sí/No según `rewardClaimed`; `asistenciaManual` Sí/No según `manualAttendance` (RQ09). |
| **RQ06** — Condición de carrera de sesión | El estudiante no interactúa con una sesión no disponible | **IMPLEMENTADO** | `isSessionUsable`, `watchSessionStatus`, `refreshActiveSession` previa a resolución. |
| **RQ07** — Logout | Cerrar sesión para Teacher y Student con signOut | **IMPLEMENTADO** | `CourseHeader` opcional en ambos dashboards; signOut + redirección; protección de doble clic y manejo de errores. |
| **RQ08** — Reporte por curso del estudiante (PDF) | PDF con fecha, estado, cartas y total | **IMPLEMENTADO** | `getStudentCourseReport` + jsPDF/autotable desde el álbum. |
| **RQ09** — Horario sembrado y asistencia | Asistencia al «Comenzar» con sesión activa (sin horario) + botón de asistencia (repuesto) en el álbum con horario | **PARCIALMENTE IMPLEMENTADO** | Inicio del reto sin validación de horario; botón de asistencia en el álbum (horario + sesión cerrada) que registra contra la última sesión; **el registro de intentos fallidos (`attempts+1`) no funciona** porque el componente no emite `failed`. |
| **AGENTS.md** — `/dev` solo profesor | Acceso restringido a TEACHER | **PENDIENTE** | El `teacherGuard` de `/dev` está comentado en `app.routes.ts`. |
| **AGENTS.md** — No debilitar reglas | Reglas de Firestore firmes y versionadas | **PARCIAL** | No hay `firestore.rules` en el repositorio; se gestionan en consola. No verificable desde el código. |
| **AGENTS.md** — Los intentos fallidos siguen siendo participación | Un fallo debe contabilizarse | **PARCIAL** | La asistencia se registra al ingresar (ok), pero el intento fallido no se incrementa (ver RQ09). |

### Observaciones adicionales

- El enum `SessionStatus` define `CREATED`, `FINISHED` y `CANCELLED`, pero solo se utiliza `ACTIVE`; las sesiones nacen activas y terminan por expiración.
- `maxAttempts` (configuración, `3`) está definido pero no se aplica como límite.
- La validación de horario se realiza con `Intl.DateTimeFormat` en `America/Bogota`; sus casos están cubiertos por `domain.spec.ts`.

---

## 35. Capturas de Pantalla

No existen capturas de pantalla en el repositorio. Se deben agregar antes de la entrega final:

```
[CAPTURA DE PANTALLA — Inicio de sesión]
[CAPTURA DE PANTALLA — Panel del Profesor]
[CAPTURA DE PANTALLA — Panel del Estudiante]
[CAPTURA DE PANTALLA — Quantum Lock]
[CAPTURA DE PANTALLA — Álbum]
[CAPTURA DE PANTALLA — Reporte de asistencia]
```

---

*Documento generado a partir del análisis del repositorio `quantum-lock` (commit de referencia: `3d477c5`). No se modificó código fuente de la aplicación.*