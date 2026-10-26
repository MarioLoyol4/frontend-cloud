# Sistema de Gestión Académica y Comunicaciones

Documentación técnica de la **Evaluación Parcial N.º 1** de la asignatura **Desarrollo Cloud Native I (DSY1107)**, Duoc UC.

- **Proyecto:** Plataforma de gestión académica y comunicaciones para el Colegio Bernardo O’Higgins.
- **Evaluación:** Encargo.
- **Ponderación:** 16% (40% de la evaluación técnica).

---

## 1. Descripción general

El proyecto propone una solución web desacoplada para consultar información académica y de asistencia, además de gestionar comunicaciones. La arquitectura separa la interfaz de usuario de los servicios del backend y centraliza el acceso mediante un **Backend for Frontend (BFF)** y **AWS API Gateway**.

La solución contempla autenticación mediante proveedores de identidad y autorización basada en tokens JWT. La documentación describe el uso de React y Vite en el frontend, y Spring Boot con Java 21 en el backend.

## 2. Tecnologías principales

| Componente | Tecnología o herramienta | Propósito |
|---|---|---|
| Frontend | React 18, Vite | Interfaz web de la aplicación |
| Autenticación frontend | `@azure/msal-browser`, `@azure/msal-react` | Integración del inicio de sesión con Microsoft Entra ID |
| Backend | Spring Boot 3.2.5, Java 21 | Implementación de servicios y lógica de negocio |
| Seguridad backend | Spring Security 6 | Validación de tokens y autorización de solicitudes |
| API de entrada | AWS API Gateway | Punto de entrada y configuración de CORS |
| Identidad | Microsoft Entra ID, AWS Cognito y Google Identity Provider | Autenticación e integración de identidades |
| Persistencia prevista | AWS RDS PostgreSQL, Spring Data JPA | Almacenamiento relacional de información |

## 3. Arquitectura del sistema

La arquitectura organiza la aplicación en componentes independientes que se comunican para entregar las funcionalidades del sistema.

### Diagrama de arquitectura

```text
                         ┌──────────────────┐
                         │      Usuario     │
                         └────────┬─────────┘
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │  Frontend React + Vite   │
                    │       Autenticación      │
                    └────────────┬─────────────┘
                                 │ Token JWT
                                 ▼
                    ┌──────────────────────────┐
                    │     AWS API Gateway      │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │ BFF: Spring Boot         │
                    │ Spring Security          │
                    └────────────┬─────────────┘
                                 │
               ┌─────────────────┼─────────────────┐
               ▼                 ▼                 ▼
      ┌────────────────┐ ┌────────────────┐ ┌────────────────┐
      │ Academic       │ │ Attendance     │ │ Communication  │
      │ Service        │ │ Service        │ │ Service        │
      └────────────────┘ └────────────────┘ └───────┬────────┘
                                                     │
                                                     ▼
                                          ┌────────────────────┐
                                          │ Servicio de correo │
                                          └────────────────────┘

                  Persistencia relacional prevista:
                         AWS RDS PostgreSQL
```

### Módulos del backend

```text
colegio-backend/
├── academic-service/       # Calificaciones, asignaturas y registros académicos
├── attendance-service/     # Asistencias e inasistencias
├── communication-service/  # Notificaciones y correo electrónico
└── bff-service/            # Agregación de datos y seguridad de acceso
```

El backend se organiza como un proyecto multimódulo con un archivo `pom.xml` raíz. Cada servicio tiene una responsabilidad específica, lo que facilita la separación y el mantenimiento de las funcionalidades.

## 4. Autenticación y seguridad

El flujo de autenticación del frontend utiliza **OAuth 2.0 con PKCE**, mediante la biblioteca MSAL.

### Flujo de autenticación

1. El usuario inicia sesión desde la aplicación.
2. El frontend redirige al proveedor de identidad configurado.
3. Después de autenticar al usuario, el proveedor devuelve un código temporal.
4. MSAL intercambia el código y el verificador PKCE por los tokens correspondientes.
5. El frontend envía el token de acceso en las solicitudes protegidas.
6. Spring Security valida el token y comprueba los permisos necesarios antes de permitir el acceso.

### Respuestas de seguridad

| Código HTTP | Descripción |
|---|---|
| `200 OK` | La solicitud fue aceptada y procesada correctamente. |
| `401 Unauthorized` | Falta un token válido, la firma no es válida o el token expiró. |
| `403 Forbidden` | El usuario está autenticado, pero no cuenta con el permiso requerido. |

> **Importante:** Los scopes, emisores, la audiencia y los proveedores deben coincidir con la configuración real de cada entorno. No publiques contraseñas, claves privadas, tokens ni otros secretos en el repositorio.

## 5. Endpoints documentados

Los siguientes endpoints aparecen en la documentación del proyecto. Deben verificarse contra la implementación actual antes de utilizarlos en otro entorno.

| Servicio | Método | Endpoint | Función |
|---|---|---|---|
| BFF / Autenticación | `GET` | `/v1/perfil` | Obtener la información del usuario autenticado. |
| Académico | `GET` | `/api/academic/notas/{alumnoId}` | Consultar las calificaciones de un alumno. |
| Asistencia | `GET` | `/api/attendance/faltas/{alumnoId}` | Consultar las inasistencias. |
| Comunicaciones | `POST` | `/api/communication/avisos` | Enviar avisos por correo electrónico. |

Las rutas protegidas requieren un token de acceso en el encabezado HTTP:

```http
Authorization: Bearer <TOKEN>
```

La documentación original asocia `User.Read` con el perfil y `OT.Create` con operaciones académicas, de asistencia y comunicaciones. Se debe confirmar que estos permisos estén definidos y sean apropiados en la configuración de identidad y del backend.

## 6. Flujo funcional de ejemplo

### 6.1. Consulta del panel académico

1. El usuario inicia sesión en la aplicación.
2. El frontend solicita los datos al BFF mediante su token de acceso.
3. El BFF consulta el servicio académico y el servicio de asistencia.
4. Ambos servicios devuelven sus resultados al BFF.
5. El BFF reúne la información y la entrega al frontend en formato JSON.
6. El frontend presenta los datos en pantalla.

### 6.2. Envío de una comunicación

1. El usuario solicita enviar un aviso desde el frontend.
2. La aplicación envía la solicitud autenticada al BFF.
3. El BFF deriva la operación al servicio de comunicaciones.
4. El servicio procesa el envío y devuelve el resultado.
5. La aplicación informa al usuario sobre el resultado recibido.

## 7. Configuración y ejecución

La configuración exacta depende de los archivos del proyecto y de las credenciales disponibles.

Antes de iniciar los servicios, se recomienda:

- Instalar versiones de Node.js y Java compatibles con los proyectos.
- Configurar las variables y los archivos de entorno requeridos por el frontend y cada módulo del backend.
- Registrar las URI de redirección correctas en el proveedor de identidad.
- Verificar los valores de `issuer`, `audience`, los scopes y la configuración JWKS utilizados para validar los tokens.
- Configurar la conexión a la base de datos, si el módulo correspondiente la utiliza.
- Revisar los puertos disponibles y la configuración CORS del entorno.

**Seguridad:** No incluyas credenciales reales en el README ni en el control de versiones. Utiliza variables de entorno o un gestor de secretos para almacenar los valores sensibles.

> Los comandos concretos de instalación y arranque deben añadirse según los archivos `package.json`, `pom.xml` y las configuraciones presentes en el repositorio.

## 8. Problemas frecuentes

### 8.1. El puerto 8080 está ocupado

**Posible causa:** Otro proceso está utilizando el puerto requerido por la aplicación.

**Qué revisar:**

- Identificar el proceso que ocupa el puerto.
- Confirmar el valor de `server.port` en `application.properties`.
- Verificar si es necesario utilizar otro puerto.

La documentación del proyecto registra el uso de `8081` como alternativa.

### 8.2. MSAL muestra `No matching state found in storage`

**Posible causa:** El estado de autenticación no se conserva correctamente durante la redirección.

**Qué revisar:**

- La configuración de almacenamiento de MSAL.
- La URI de redirección.
- Las políticas de almacenamiento del navegador.
- La configuración de `localStorage` y `storeAuthStateInCookie: true` documentada en el proyecto.

Esta configuración debe validarse según la versión de MSAL y las necesidades de seguridad del entorno.

### 8.3. Error CORS en AWS API Gateway

**Posible causa:** La respuesta a la solicitud previa `OPTIONS` no incluye los encabezados CORS requeridos o exige autenticación de forma incorrecta.

**Qué revisar:**

- Los orígenes permitidos.
- Los métodos y encabezados configurados.
- La respuesta a las solicitudes `OPTIONS`.
- El authorizer aplicado al método.
- Que los cambios estén desplegados en el stage correspondiente.

### 8.4. El backend responde `401 Unauthorized`

**Posible causa:** No se envió un token válido o el token no coincide con la configuración del servidor.

**Qué revisar:**

- El encabezado `Authorization`.
- La expiración del token.
- La firma criptográfica.
- El emisor (`issuer`).
- La audiencia (`audience`).
- La configuración JWKS.

## 9. Estado y alcance de la documentación

Este README reúne la arquitectura, las tecnologías, los flujos de autenticación, los endpoints documentados y los problemas registrados durante el desarrollo.

Algunos componentes, como la persistencia en AWS RDS y la integración de proveedores de identidad, deben contrastarse con la configuración efectiva del entorno para confirmar su estado de implementación.

## 10. Información académica

- **Institución:** Duoc UC
- **Asignatura:** Desarrollo Cloud Native I (DSY1107)
- **Evaluación:** Evaluación Parcial N.º 1 — Encargo
- **Proyecto:** Sistema de Gestión Académica y Comunicaciones
- **Caso:** Colegio Bernardo O’Higgins / referencia a Pedidos360 en la documentación original
