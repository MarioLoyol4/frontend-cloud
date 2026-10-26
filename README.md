Sistema de Gestión Académica y Comunicaciones
Documentación técnica de la Evaluación Parcial N.º 1 de la asignatura Desarrollo Cloud Native I (DSY1107), Duoc UC.
Proyecto: Plataforma de gestión académica y comunicaciones para el Colegio Bernardo O’Higgins.
Evaluación: Encargo — ponderación informada: 16% (40% de la evaluación técnica).

1. Descripción general
El proyecto propone una solución web desacoplada para consultar información académica y de asistencia, además de gestionar comunicaciones. La arquitectura separa la interfaz de usuario de los servicios del backend y centraliza el acceso a través de un Backend for Frontend (BFF) y AWS API Gateway.

La solución contempla autenticación mediante proveedores de identidad y autorización basada en tokens JWT. La documentación describe el uso de React y Vite en el frontend, y Spring Boot con Java 21 en el backend.
2. Tecnologías principales
Componente	Tecnología o herramienta	Propósito
Frontend	React 18, Vite	Interfaz web de la aplicación
Autenticación frontend	@azure/msal-browser, @azure/msal-react	Integración de inicio de sesión con Microsoft Entra ID
Backend	Spring Boot 3.2.5, Java 21	Implementación de servicios y lógica de negocio
Seguridad backend	Spring Security 6	Validación de tokens y autorización de solicitudes
API de entrada	AWS API Gateway	Punto de entrada y configuración de CORS
Identidad	Microsoft Entra ID, AWS Cognito y Google Identity Provider	Autenticación e integración de identidades
Persistencia prevista	AWS RDS PostgreSQL, Spring Data JPA	Almacenamiento relacional de información


3. Arquitectura
Usuario
  │
  ▼
Frontend (React + Vite + MSAL)
  │  Solicitudes con token JWT
  ▼
AWS API Gateway
  │
  ▼
BFF (Spring Boot + Spring Security)
  ├── Academic Service
  ├── Attendance Service
  └── Communication Service
          │
          ▼
   Servicio de correo / comunicaciones

Servicios de backend ──► Persistencia relacional (AWS RDS PostgreSQL, prevista)
Módulos del backend
colegio-backend/
├── academic-service/       # Calificaciones, asignaturas y registros académicos
├── attendance-service/     # Asistencias e inasistencias
├── communication-service/  # Notificaciones y correo electrónico
└── bff-service/            # Agregación de datos y seguridad de acceso
El backend se organiza como un proyecto multimódulo con un pom.xml raíz. Cada servicio mantiene una responsabilidad específica, lo que facilita separar y mantener las funcionalidades.
4. Autenticación y seguridad
El flujo de autenticación del frontend utiliza OAuth 2.0 con PKCE mediante MSAL:
1. El usuario inicia sesión desde la aplicación.
2. El frontend redirige al proveedor de identidad configurado.
3. Después de autenticar al usuario, el proveedor devuelve un código temporal.
4. MSAL intercambia el código y el verificador PKCE por los tokens correspondientes.
5. El frontend envía el token de acceso en las solicitudes protegidas.
6. Spring Security valida el token y comprueba los permisos necesarios antes de permitir el acceso.
Respuestas de seguridad esperadas
- 200 OK: la solicitud fue aceptada y procesada.
- 401 Unauthorized: falta un token válido, la firma no es válida o el token expiró.
- 403 Forbidden: el usuario está autenticado, pero no cuenta con el permiso requerido.
Importante: los nombres de scopes, emisores, audiencia y proveedores deben coincidir con la configuración real de cada entorno. No publiques secretos, contraseñas, claves privadas ni tokens en el repositorio.

5. Endpoints documentados
Los siguientes endpoints aparecen en la documentación del proyecto. Deben verificarse contra la implementación actual antes de utilizarlos en otro entorno.
Servicio	Método	Endpoint	Función
BFF / Autenticación	GET	/v1/perfil	Obtener información del usuario autenticado
Académico	GET	/api/academic/notas/{alumnoId}	Consultar calificaciones de un alumno
Asistencia	GET	/api/attendance/faltas/{alumnoId}	Consultar inasistencias
Comunicaciones	POST	/api/communication/avisos	Enviar avisos por correo electrónico


Las rutas protegidas requieren un token de acceso en el encabezado:
Authorization: Bearer <TOKEN>
La documentación original asocia User.Read con el perfil y OT.Create con operaciones académicas, de asistencia y comunicaciones. Confirma que esos permisos estén definidos y sean apropiados en la configuración de identidad y del backend.
6. Flujo funcional de ejemplo
Consulta del panel académico
1. El usuario inicia sesión.
2. El frontend solicita los datos al BFF con su token.
3. El BFF consulta el servicio académico y el servicio de asistencia.
4. Los servicios devuelven sus resultados al BFF.
5. El BFF reúne la información y la entrega al frontend en formato JSON.
6. El frontend presenta los datos en pantalla.
Envío de una comunicación
1. El usuario solicita enviar un aviso desde el frontend.
2. La aplicación envía la solicitud autenticada al BFF.
3. El BFF deriva la operación al servicio de comunicaciones.
4. El servicio procesa el envío y devuelve el resultado.
5. La aplicación informa al usuario del resultado recibido.
7. Configuración y ejecución
La configuración exacta de ejecución depende de los archivos del proyecto y de las credenciales disponibles. Antes de iniciar los servicios:
- Instala las versiones de Node.js y Java compatibles con los proyectos.
- Configura las variables y archivos de entorno requeridos por el frontend y cada módulo backend.
- Registra las URI de redirección correctas en el proveedor de identidad.
- Verifica los valores de issuer, audience, scopes y la configuración JWKS usados para validar los tokens.
- Configura la conexión a base de datos si el módulo correspondiente la utiliza.
- Revisa los puertos disponibles y la configuración CORS del entorno.
No incluyas credenciales reales en el README ni en el control de versiones. Usa variables de entorno o un gestor de secretos para los valores sensibles.
Esta sección describe las comprobaciones previas; los comandos concretos de instalación y arranque deben añadirse según los package.json, pom.xml y archivos de configuración presentes en el repositorio.

8. Problemas frecuentes
El puerto 8080 está ocupado
Posible causa: otro proceso está utilizando el puerto requerido por la aplicación.

Qué revisar: identifica el proceso que ocupa el puerto y confirma el valor de server.port en el archivo application.properties. La documentación del proyecto registra el uso de 8081 como alternativa.
MSAL muestra No matching state found in storage
Posible causa: el estado de autenticación no se conserva correctamente durante la redirección.

Qué revisar: la configuración de almacenamiento de MSAL, la URI de redirección y las políticas del navegador. El proyecto documenta el uso de localStorage y storeAuthStateInCookie: true; valida esta configuración según la versión de MSAL y las necesidades de seguridad del entorno.
Error CORS en AWS API Gateway
Posible causa: la respuesta a la solicitud previa OPTIONS no incluye los encabezados CORS requeridos o está exigiendo autenticación indebidamente.

Qué revisar: los orígenes permitidos, métodos y encabezados configurados; la respuesta de OPTIONS; el authorizer aplicado y que los cambios estén desplegados en el stage correspondiente.
El backend responde 401 Unauthorized
Posible causa: no se envió un token válido o no coincide con la configuración del servidor.

Qué revisar: el encabezado Authorization, la expiración del token, la firma, el emisor (issuer), la audiencia (audience) y la configuración JWKS.
9. Estado y alcance de la documentación
Este README reúne la arquitectura, las tecnologías, los flujos de autenticación, los endpoints documentados y los problemas registrados durante el desarrollo. Algunos componentes —como la persistencia en AWS RDS y la integración de proveedores de identidad— deben contrastarse con la configuración efectiva del entorno para confirmar su estado.
10. Información académica
- Institución: Duoc UC
- Asignatura: Desarrollo Cloud Native I (DSY1107)
- Evaluación: Evaluación Parcial N.º 1 — Encargo
- Proyecto: Sistema de Gestión Académica y Comunicaciones
- Caso: Colegio Bernardo O’Higgins / referencia a Pedidos360 en la documentación original
