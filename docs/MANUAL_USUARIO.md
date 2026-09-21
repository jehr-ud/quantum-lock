# MANUAL DE USUARIO — Quantum Lock

**Plataforma inteligente para el control de asistencia mediante la gamificación.**

---

## 1. Introducción

**Quantum Lock** es una aplicación web que se usa durante las clases para registrar la asistencia de los estudiantes de una forma diferente y divertida.

El profesor inicia una «sesión de clase» en la plataforma. Los estudiantes ingresan a la materia, presionan **Comenzar** dentro del horario de clase y quedan registrados como presentes. Después, deben resolver un reto llamado **Quantum Lock**: un conjunto de agujas giratorias que deben orientarse para repetir el patrón que muestra el profesor.

Si el estudiante lo resuelve dentro del tiempo establecido, desbloquea un **sobre** con una **carta coleccionable** que se guarda en su **álbum**.

La aplicación tiene dos perfiles:

- **Profesor**: inicia la sesión y revisa la asistencia de la clase.
- **Estudiante**: participa en la sesión, resuelve el Quantum Lock y colecciona cartas.

---

## 2. Acceso al sistema

1. Abra el navegador web (Chrome, Edge, Firefox o Safari).
2. Ingrese a la dirección (URL) que le entregue su profesor o la institución.
3. Verá la pantalla de inicio de sesión de **Quantum Lock**.

---

## 3. Inicio de sesión

1. En la pantalla de inicio, escriba su **usuario institucional** en el campo «Correo institucional» (sin escribir el dominio; la aplicación lo agrega automáticamente, por ejemplo `@udistrital.edu.co`).
2. Escriba su **contraseña**.
3. Pulse el botón **Entrar**.

La aplicación lo llevará automáticamente al panel correspondiente:

- Si está registrado como **profesor**, verá el panel del profesor («Mis cursos»).
- Si está registrado como **estudiante**, verá el panel del estudiante («Mis cursos»).

> El inicio de sesión solo funciona con el **correo institucional** (`@udistrital.edu.co`).

---

## 4. Registro de cuenta

Si es la primera vez que usa la plataforma:

1. En la pantalla de inicio de sesión, pulse **«Crear una cuenta»**.
2. Complete los campos:
   - **Nombres**
   - **Apellidos**
   - **Usuario institucional** (por ejemplo, `jhernandez`)
   - **Contraseña** (mínimo 6 caracteres)
   - **Confirmar contraseña**
3. Pulse **Crear cuenta**.

La aplicación creará su cuenta y lo llevará directamente a su panel. Si alguna vez olvida la contraseña, vea la sección [Recuperar contraseña](#5-recuperar-contraseña).

---

## 5. Recuperar contraseña

1. En la pantalla de inicio de sesión, pulse **«¿Olvidaste tu contraseña?»**.
2. Escriba su **usuario institucional**.
3. Pulse **Enviar correo de recuperación**.
4. La aplicación enviará un correo con las instrucciones para restablecer la contraseña.
5. Revise su correo institucional y siga las instrucciones.

> Si el usuario no está registrado, el sistema muestra un mensaje general para proteger la privacidad; si usted cree que está registrado, revise la bandeja de correo o contacte a su institución.

---

## 6. Cerrar sesión

**Profesor y estudiante:**

1. En el panel principal («Mis cursos»), pulse el botón **Cerrar sesión** (arriba, en la cabecera).
2. El botón mostrará «Cerrando sesión…» y lo devolverá a la pantalla de inicio de sesión.

Al cerrar la sesión, sus datos y su colección **no se borran**. Solo debe volver a autenticarse la próxima vez.

---

## 7. Guía del Profesor

### 7.1 Inicio de sesión

Ingrese con su usuario institucional. Si su correo está habilitado como docente, verá el **panel del profesor**.

### 7.2 Panel principal

La pantalla «Mis cursos» muestra las materias disponibles. Cada materia tiene dos botones:

- **Iniciar clase**
- **Exportar asistencia**

### 7.3 Consulta de materias

La lista de materias se muestra automáticamente al ingresar. Cada tarjeta indica el nombre de la materia y su código.

### 7.4 Inicio de una sesión de clase

1. En la materia deseada, pulse **Iniciar clase**.
2. Aparecerá la ventana **«Sesión creada»** con el **ID de la sesión**.
3. Comparta ese ID con sus estudiantes.
4. Pulse **Entrar a la sesión** para ver la sesión activa.

> La sesión se crea activa automáticamente y **expira al cabo del tiempo configurado (30 segundos por defecto)**. No existe un botón de «finalizar»; la sesión se cierra sola al terminar el tiempo.

### 7.5 Control de sesión

En la pantalla de sesión usted puede ver:

- El **estado** de la sesión.
- La **duración** de la sesión.
- El **tiempo restante** (temporizador que desciende en vivo).
- El ID de la sesión.
- El patrón del **Quantum Lock** que los estudiantes deben reproducir.

### 7.6 Visualización de estudiantes

En la misma pantalla verá la cantidad de **«Estudiantes conectados»**: el número de estudiantes distintos que ya registraron su asistencia en la sesión. Un estudiante cuenta **una sola vez**, aunque haya hecho varios intentos.

### 7.7 Consulta de asistencia

Desde el panel principal, pulse **Exportar asistencia** en la materia que desee. El sistema descargará un archivo de Excel (`.xlsx`) con la asistencia de **esa** materia únicamente.

### 7.8 Descarga de reportes

El archivo Excel contiene las columnas:

| Columna | Qué significa |
|---|---|
| **Fecha** | Fecha y hora del registro de asistencia |
| **Estudiante** | Nombre completo del estudiante |
| **Correo** | Correo institucional del estudiante |
| **Abrió sobre** | `Sí` si el estudiante abrió su sobre de recompensa; `No` si no lo abrió |

Aparecen también los estudiantes que asistieron pero no resolvieron el Quantum Lock (con «Abrió sobre» = `No`).

### 7.9 Cierre de sesión

Use el botón **Cerrar sesión** de la cabecera para salir de la plataforma.

---

## 8. Guía del Estudiante

### 8.1 Inicio de sesión

Ingrese con su usuario institucional (ver sección [Inicio de sesión](#3-inicio-de-sesión)).

### 8.2 Panel principal

La pantalla «Mis cursos» muestra todas las materias. Cada materia tiene dos botones:

- **Comenzar**
- **Álbum**

### 8.3 Selección de materia

Pulse **Comenzar** en la materia en la que está en clase.

### 8.4 Consulta de horario

El sistema revisa automáticamente el **horario** de la materia y la hora actual en Colombia. Si usted está **fuer del horario** o la sesión no ha comenzado, verá mensajes como:

- «La sesión aún no ha comenzado. Espera a que el profesor inicie la sesión.»
- «No te encuentras dentro del horario de clase.»

En ese caso, solo tiene que esperar y volver a intentarlo cuando la clase inicie dentro del horario.

### 8.5 Acceso a la sesión

Cuando el profesor haya iniciado la sesión y usted esté dentro del horario, al presionar **Comenzar** el sistema **registra su asistencia** y habilita el reto.

### 8.6 Registro de asistencia

Su asistencia queda registrada automáticamente al ingresar a la sesión (mientras exista una sesión activa y esté dentro del horario). En la parte inferior de la pantalla verá el mensaje:

> ✔ Tu asistencia quedó registrada al ingresar. Completa el patrón para obtener tu recompensa.

### 8.7 Quantum Lock

Debe repetir el **patrón** de agujas mostrado por el profesor:

- **Clic izquierdo** sobre una aguja → gira en **sentido horario**.
- **Clic derecho** sobre una aguja → gira en **sentido antihorario**.
- Debe dejar cada aguja en la dirección correcta **antes de que termine el tiempo**.

El temporizador de la sesión se muestra en la pantalla:

- Color normal: queda tiempo.
- Amarillo (≤ 15 s): apresúrese.
- Rojo (≤ 5 s): ¡el tiempo casi se agota!

### 8.8 Intento fallido

Si el patrón no coincide, deberá seguir intentándolo mientras quede tiempo. La asistencia ya registrada **no se pierde**.

### 8.9 Intento exitoso

Cuando complete el patrón, el sistema lo llevará automáticamente a la pantalla del **sobre**.

### 8.10 Apertura del sobre

En la pantalla «Sobre desbloqueado»:

1. Pulse **Abrir sobre**.
2. Verá su **carta** de recompensa. Pulse la carta para girarla y verla.

### 8.11 Recompensa

Cada vez que resuelve el Quantum Lock obtiene **una carta** de la colección Spider-Verse. La carta puede repetirse en diferentes sesiones; las cartas repetidas también se guardan.

### 8.12 Álbum

En el panel principal, pulse **Álbum** en una materia para ver sus cartas de **esa** materia:

- Las cartas obtenidas se muestran con su emoji y su cantidad (por ejemplo **Spider-Man x3**).
- Las cartas que faltan aparecen bloqueadas (con un «?»).
- El encabezado muestra el **progreso de la colección** (por ejemplo `12 / 50`), el **porcentaje**, el **total de recompensas obtenidas** y el desglose por rareza (Comunes, Raras, Épicas, Legendarias).

### 8.13 Cartas repetidas

Si obtiene la misma carta varias veces, el álbum no la borra ni la reemplaza: muestra la cantidad con `xN`. Por ejemplo:

- **Spider-Man x3** significa que ha obtenido la carta de Spider-Man **3 veces**.

El progreso de la colección cuenta **cartas únicas** (Spider-Man cuenta una sola vez), pero el **total de recompensas obtenidas** sí suma todas las cartas, incluidos los duplicados.

### 8.14 Descarga del reporte PDF

En la página del álbum, pulse **📄 Descargar reporte**. El sistema descargará un archivo **PDF** con:

- Su nombre completo.
- La materia.
- Las fechas en las que participó.
- El estado por fecha (Resolvió / Falló).
- Las cartas obtenidas por fecha.
- El **total de cartas** en esa materia.

### 8.15 Cierre de sesión

Use el botón **Cerrar sesión** de la cabecera para salir de la plataforma (ver sección [Cerrar sesión](#6-cerrar-sesión)).

---

## 9. Concepto importante: asistencia, Quantum Lock y sobre

Es importante entender que son **tres cosas diferentes**:

1. **Asistencia**: se registra cuando usted presiona **Comenzar** estando dentro del horario válido de la materia y con la sesión iniciada por el profesor.
2. **Quantum Lock**: es el reto. Resolverlo correctamente es un logro adicional.
3. **Sobre / recompensa**: solo se desbloquea si resuelve el Quantum Lock.

Ejemplo:

> Si el estudiante presiona **«Comenzar»** dentro del horario válido de la materia y la sesión ha sido iniciada por el profesor, su **asistencia queda registrada**. Si posteriormente no logra desbloquear el Quantum Lock, la **asistencia se conserva, pero no obtiene el sobre**.

---

## 10. Álbum y cartas

- **Cartas**: hay 50 cartas de la colección **Spider-Verse**, divididas en:
  - Comunes (20)
  - Raras (15)
  - Épicas (10)
  - Legendarias (5)
- **Colección**: una carta «coleccionada» es una carta distinta que ha obtenido al menos una vez.
- **Duplicados**: si obtiene la misma carta varias veces se muestran como **Spider-Man x3**, **Venom x2**, etc. La `x3` significa que obtuvo esa carta **3 veces**.
- **Progreso**: la colección cuenta las cartas únicas (por ejemplo `3 / 50`), mientras que el **total de recompensas obtenidas** cuenta todas las cartas (por ejemplo `6` si tiene Spider-Man x3, Venom x2 y Green Goblin x1).

---

## 11. Errores y cómo resolverlos

| Situación | Mensaje / Comportamiento | Qué debe hacer el usuario |
|---|---|---|
| **Sesión no iniciada** | «La sesión aún no ha comenzado. Espera a que el profesor inicie la sesión.» | Esperar a que el profesor inicie la sesión y volver a intentar. |
| **Fuera del horario de clase** | «La sesión aún no ha comenzado… No te encuentras dentro del horario de clase.» | Ingresar durante el horario de la materia. |
| **La sesión terminó** | «La sesión ya no está disponible. El tiempo de la sesión terminó o el profesor la cerró.» | Esperar la siguiente sesión. Su asistencia (si ya se registró) se conserva. |
| **Error de conexión / carga** | «No fue posible cargar la sesión» / «No fue posible cargar tu álbum» | Comprobar la conexión a internet y pulsar **Reintentar**. |
| **Contraseña incorrecta** | Mensaje de error en el inicio de sesión | Verificar los datos o usar **¿Olvidaste tu contraseña?**. |
| **Correo no institucional** | «Debes utilizar tu correo institucional.» | Usar el usuario institucional (`@udistrital.edu.co`). |
| **No resolvió el Quantum Lock** | No obtiene el sobre, pero conserva la asistencia | No pierde nada; puede intentarlo en la próxima sesión. |
| **Quiere ver su avance** | El álbum muestra su colección | Entrar al **Álbum** de la materia desde el panel principal. |

---

## 12. Preguntas frecuentes (FAQ)

**¿Cómo inicio sesión?**
En la pantalla de inicio, escriba su usuario institucional y su contraseña, y pulse **Entrar**.

**¿Cómo recupero mi contraseña?**
Pulse **«¿Olvidaste tu contraseña?»** en la pantalla de inicio, ingrese su usuario institucional y siga las instrucciones del correo que recibirá.

**¿Cómo sé si estoy dentro del horario?**
La aplicación lo valida automáticamente. Si está fuera del horario, verá el mensaje «No te encuentras dentro del horario de clase».

**¿Qué pasa si llego tarde?**
Si la sesión ya terminó, verá «La sesión ya no está disponible». Deberá esperar la siguiente sesión.

**¿Qué pasa si no logro abrir el Quantum Lock?**
Su asistencia **se conserva**, pero **no obtiene el sobre ni la carta** de esa sesión.

**¿Pierdo la asistencia si fallo el Quantum Lock?**
**No.** La asistencia se registra al ingresar (con **Comenzar**), no al resolver el reto.

**¿Qué significa una carta con `x3`?**
Significa que obtuvo esa carta **3 veces**. El álbum guarda y muestra las cartas repetidas.

**¿El progreso del álbum cuenta los duplicados?**
No. El progreso (`X / 50`) cuenta cartas **únicas**. El **total de recompensas obtenidas** sí incluye los duplicados.

**¿Puedo descargar un reporte de mi participación?**
Sí. Entrando al **Álbum** de una materia y pulsando **📄 Descargar reporte** obtendrá un PDF con las fechas, el estado y las cartas de **esa** materia.

**¿Cómo cierro sesión?**
Pulse **Cerrar sesión** en el panel principal. Después deberá volver a iniciar sesión para entrar.

**¿Se borran mis datos al cerrar la sesión?**
No. Cerrar la sesión solo termina su acceso; sus datos y su colección se conservan.

**¿Dónde encuentro mis cartas?**
En el panel principal, pulse **Álbum** en la materia correspondiente.

**¿Cuántas cartas hay en total?**
La colección tiene **50 cartas**: 20 comunes, 15 raras, 10 épicas y 5 legendarias.

---

*Documento elaborado para usuarios finales de la plataforma Quantum Lock.*