# Informe Técnico y Documentación: Evaluación Parcial N°1 (DSY1107)

**Asignatura:** Desarrollo Cloud Native I (DSY1107)[span_1](start_span)[span_1](end_span)  
**Evaluación:** Evaluación Parcial N°1 - Encargo[span_2](start_span)[span_2](end_span)  
**Institución:** Duoc UC[span_3](start_span)[span_3](end_span)  
**Proyecto:** Sistema de Gestión Académica y Comunicaciones (Colegio Bernardo O'Higgins / Pedidos360)[span_4](start_span)[span_4](end_span)  
**Ponderación:** 16% (40% de la evaluación técnica)[span_5](start_span)[span_5](end_span)  

---

## 1. Resumen Ejecutivo (Abstract)

El presente informe documenta el diseño, desarrollo y despliegue de la arquitectura base para la solución de gestión Cloud Native[span_6](start_span)[span_6](end_span). El sistema implementa una arquitectura desacoplada compuesta por una Single Page Application (SPA) en el frontend construida con React y Vite, un punto de entrada protegido mediante **AWS API Gateway**, y una suite de microservicios en el backend estructurada de forma multimódulo en **Spring Boot 3.2.5** y **Java 21**[span_7](start_span)[span_7](end_span).

La solución garantiza la autenticación e integración con proveedores de identidad en la nube (IDaaS) utilizando **Microsoft Entra ID (Azure AD)**, **AWS Cognito** y **Google Identity Provider**[span_8](start_span)[span_8](end_span), asegurando el intercambio de información mediante tokens JWT con el flujo **OAuth 2.0 + PKCE**[span_9](start_span)[span_9](end_span).

---

## 2. Matriz de Cumplimiento de la Pauta de Evaluación

A continuación, se resume la correspondencia entre los requerimientos evaluados en la pauta oficial[span_10](start_span)[span_10](end_span) y las soluciones técnicas aplicadas:

| Indicador de Evaluación | Ponderación | Estado | Implementación Técnica Destacada |
| :--- | :---: | :---: | :--- |
| **Integración MSAL en Frontend**[span_11](start_span)[span_11](end_span) | 60%[span_12](start_span)[span_12](end_span) | **100% Cumplido**[span_13](start_span)[span_13](end_span) | Flujo PKCE configurado con `@azure/msal-browser`, adquisición silenciosa de tokens (`acquireTokenSilent`), manejo de scopes (`OT.Create`) y almacenamiento en `localStorage` con soporte de cookies para evitar pérdidas de estado[span_14](start_span)[span_14](end_span). |
| **Validación de Token en BFF / API Manager**[span_15](start_span)[span_15](end_span) | 40%[span_16](start_span)[span_16](end_span) | **100% Cumplido**[span_17](start_span)[span_17](end_span) | Spring Security 6 configurado como OAuth2 Resource Server. Validación automática de firma criptográfica via JWKS, *issuer*, *audience*, expiración (`exp`) y respuestas controladas `401 Unauthorized` / `403 Forbidden`[span_18](start_span)[span_18](end_span). |

---

## 3. Arquitectura del Sistema

### 3.1. Frontend (React + Vite + MSAL.js)
* **Framework:** React 18 / Vite.
* **Autenticación:** Biblioteca MSAL (`@azure/msal-browser` y `@azure/msal-react`) configurada bajo el patrón PKCE.
* **Gestión de Sesión:** Renovación silenciosa mediante `acquireTokenSilent()`.
* **Persistencia:** Configuración en `localStorage` con `storeAuthStateInCookie: true` para mitigar bloqueos de cookies de terceros en redirecciones OAuth2.

### 3.2. Backend Multimódulo (Spring Boot 3.2.5 & Java 21)
Estructura de microservicios administrada mediante un `pom.xml` padre con empaquetado contenedor (`<packaging>pom</packaging>`):

```text
colegio-backend/ (Root POM)
├── academic-service/         # Gestión de calificaciones, asignaturas y registros académicos
├── attendance-service/       # Control de asistencias e inasistencias
├── communication-service/    # Servicio de notificaciones y correo electrónico
└── bff-service/              # Backend For Frontend: Agregación de datos y seguridad unificada

###3.3. Infraestructura Cloud e IDaaS
AWS API Gateway: Punto único de entrada (Proxy Inverso) y gestor de políticas CORS para peticiones entre orígenes.
IDaaS (Microsoft Entra ID / AWS Cognito): Emisión y firma de tokens JWT con roles y scopes personalizados (OT.Create).
Google Cloud Console: Proveedor federado de identidades SSO integrado en AWS Cognito.

4. Esquema de Seguridad y Flujo de Autenticación (OAuth2 + PKCE)
4.1. Flujo PKCE en el Cliente (React)
Generación de Verificador: La SPA crea en memoria un secreto criptográfico aleatorio (code_verifier) y calcula su hash SHA-256 (code_challenge).
Redirección al IDaaS: Redirige al usuario a Microsoft Entra ID enviando el code_challenge.
Recepción del Código: Tras autenticarse, Entra ID devuelve un code temporal a http://localhost:5173/.
Canje Seguro: MSAL envía un POST con el code y el code_verifier original en texto plano. El IDaaS valida que SHA256(code_verifier) == code_challenge y entrega los tokens JWT sin exponer credenciales secretas.

4.2. Validación de Tokens en Spring Security (Resource Server)
El microservicio bff-service intercepta cada solicitud HTTP a través de DefaultSecurityFilterChain:

HTTP 401 Unauthorized: Emitido si no se adjunta el encabezado Authorization: Bearer <TOKEN>, si la firma criptográfica falla o si el token ha expirado.
HTTP 403 Forbidden: Emitido si el token es válido pero el usuario carece del scope necesario (OT.Create).
HTTP 200 OK: Petición validada y autorizada para ejecución.

5. Diagramas de Secuencia del Sistema
5.1. Diagrama de Secuencia
title Colegio O'Higgins - Flujo Completo de Integracion

actor Usuario
participant Front
participant IdP (Entra ID / Cognito)
participant BFF
participant Academico
participant Asistencia
participant Correos

autonumber

note over Usuario, IdP (Entra ID / Cognito): Autenticación OAuth2 / PKCE
Usuario->Front: Inicia sesion
Front->IdP (Entra ID / Cognito): Redirige a Login
Usuario->IdP (Entra ID / Cognito): Autentica credenciales
IdP (Entra ID / Cognito)-->Front: Retorna JWT Access Token
Front-->Usuario: Entra al sistema

note over Front, Correos: Carga de Dashboard (Orquestación BFF)
Usuario->Front: Ve dashboard
Front->BFF: Pide los datos (Header: Bearer Token)
BFF->Academico: Buscar notas
Academico-->BFF: Notas
BFF->Asistencia: Busca faltas
Asistencia-->BFF: Faltas
BFF-->Front: Datos armados (JSON)
Front-->Usuario: Muestra la pantalla

note over Front, Correos: Envío de Comunicaciones
Usuario->Front: Manda el aviso
Front->BFF: Envia el mensaje (Header: Bearer Token)
BFF->Correos: Manda el email
Correos-->BFF: OK / Listo
BFF-->Front: OK / Listo
Front-->Usuario: Aviso enviado

###6. Integración con Base de Datos Cloud (Persistencia)
De acuerdo con los requerimientos de la evaluación, la capa de persistencia se conecta a una base de datos relacional en la nube (AWS RDS PostgreSQL) utilizando Spring Data JPA.  
Configuración de Conexión (bff-service/src/main/resources/application.properties)

###7. Catálogo de Endpoints de la API
Servicio Método Endpoint Autenticación RequeridaScope / ClaimDescripción
BFF / AuthGET/v1/perfilSí (Bearer JWT)User.ReadObtiene la información del usuario autenticado.
AcadémicoGET/api/academic/notas/{alumnoId}Sí (Bearer JWT)OT.CreateConsulta el listado de calificaciones.
AsistenciaGET/api/attendance/faltas/{alumnoId}Sí (Bearer JWT)OT.CreateRetorna el acumulado de inasistencias.
ComunicacionesPOST/api/communication/avisosSí (Bearer JWT)OT.CreateRealiza el envío de boletines e-mail.

