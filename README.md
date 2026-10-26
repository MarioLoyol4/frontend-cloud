# Sistema de Gestión Académica y Comunicaciones - EP3

Documentación técnica correspondiente a la **Evaluación Parcial N.º 3** de la asignatura **Desarrollo Cloud Native I (DSY1107)**, Duoc UC.

*   **Proyecto:** Plataforma de gestión académica y comunicaciones asíncronas para el Colegio Bernardo O’Higgins.
*   **Evaluación:** Encargo EP3 - Incorporación de RabbitMQ.
*   **Ponderación:** 12%.

---

## 1. Descripción General

El proyecto consiste en una solución web desacoplada para consultar información académica y de asistencia, además de gestionar comunicaciones. Para esta tercera etapa, se ha incorporado **RabbitMQ** como broker de mensajería. 

El objetivo principal es gestionar tareas asíncronas (como notificaciones de notas o inasistencias) sin bloquear el flujo principal del usuario. La arquitectura separa la interfaz de usuario (React) de los servicios del backend (Spring Boot), centraliza el acceso mediante un **Backend for Frontend (BFF)** y añade un **microservicio administrador** dedicado exclusivamente a la gestión de RabbitMQ.

## 2. Tecnologías Principales

*   **Frontend:** React 18, Vite, React Router.
*   **Autenticación Frontend:** MSAL (Microsoft Entra ID).
*   **Backend:** Java 21, Spring Boot 3.x, Spring Security 6.
*   **Mensajería:** Spring AMQP, RabbitMQ 4.x.
*   **Base de Datos:** H2 (desarrollo) / PostgreSQL (nube).
*   **Infraestructura:** AWS API Gateway, Docker.

## 3. Arquitectura de Microservicios

El backend se organiza como un proyecto multimódulo compuesto por los siguientes servicios:

*   **academic-service:** Gestiona calificaciones y asignaturas. Actúa como **Productor** de eventos.
*   **attendance-service:** Gestiona asistencias e inasistencias. Actúa como **Productor** de eventos.
*   **communication-service:** Centraliza las notificaciones. Actúa como **Consumidor** asíncrono de los eventos generados por los otros servicios.
*   **admin-service:** Microservicio encargado de la administración programática del broker (crear/eliminar colas, exchanges y bindings).
*   **bff-service:** Backend For Frontend. Orquesta las llamadas y valida los tokens JWT.

## 4. Implementación de RabbitMQ

Para dar cumplimiento a los indicadores de la evaluación, se implementó la siguiente lógica de mensajería:

### 4.1. Configuración Centralizada
Todos los nombres de colas, exchanges y routing keys están centralizados en el archivo `application.yml` de cada microservicio bajo el prefijo `app.messaging`. No hay nombres de colas escritos directamente en el código Java. La clase `MessagingProperties` mapea estos valores para inyectarlos donde se necesiten.

### 4.2. Topología de Exchanges y Colas
La topología definida en el broker es la siguiente:
*   **`colegio.eventos` (Topic Exchange):** Recibe eventos de dominio como `nota.registrada` y `asistencia.ausente`.
*   **`colegio.documentos` (Direct Exchange):** Recibe solicitudes de generación de documentos (ej. `boletin.solicitado`).
*   **`colegio.dlx` (Direct Exchange):** Dead Letter Exchange. Es el destino final de los mensajes que fallan.
*   **Colas Principales:** Cada caso de uso tiene su cola principal (ej. `notificaciones.nota.queue`).
*   **Colas de Reintento y Cuarentena (DLQ):** Cada cola principal tiene asociada una cola `.retry` (para esperar antes de reintentar) y una cola `.dlq` (cuarentena de mensajes fallidos).

### 4.3. Consumidores y ACK Manual (Resiliencia)
El microservicio `communication-service` es el encargado de consumir los mensajes. Para garantizar la resiliencia:
*   Se utiliza `acknowledge-mode: manual` en la configuración.
*   Los consumidores agrupan la lógica por dominio (`consumer.notification` y `consumer.documento`).
*   Se utiliza la clase `MessageAckHandler` para confirmar (`basicAck`) los mensajes procesados con éxito.
*   Si ocurre un error de negocio, el consumidor captura la excepción y utiliza `basicNack` (con `requeue=false`) para enviar el mensaje a la DLQ, evitando bucles infinitos y registrando el error en los logs del sistema.

### 4.4. Microservicio Administrador
El `admin-service` encapsula la lógica de administración de RabbitMQ en la clase `RabbitAdminService` y expone endpoints RESTful (usando validación de datos con `@Valid` y manejo de excepciones globales) para:
*   Crear y eliminar Colas.
*   Crear y eliminar Exchanges.
*   Crear y eliminar Bindings.

## 5. Flujo Funcional (Ejemplo: Registrar una Nota)

1.  El usuario (profesor) registra una nota a través de la interfaz de React.
2.  El frontend envía la petición al `academic-service` (a través del BFF).
3.  El `academic-service` guarda la nota en la base de datos y, de forma asíncrona, publica un mensaje en el exchange `colegio.eventos`.
4.  El usuario recibe una respuesta HTTP 201 (Created) inmediatamente, sin esperar al procesamiento de la notificación.
5.  El `communication-service`, que está suscrito a la cola correspondiente, recibe el mensaje.
6.  El consumidor procesa el mensaje, guarda la notificación en su base de datos y ejecuta el ACK manual.
7.  Posteriormente, cuando el apoderado ingresa al sistema, el BFF consulta al servicio de comunicaciones y muestra la notificación en pantalla.

## 6. Configuración y Ejecución Local

### Requisitos Previos
*   Docker y Docker Compose instalados.
*   Java 21 y Maven.
*   Node.js (v18+) y npm.

### Paso 1: Levantar RabbitMQ
En la raíz del proyecto backend, ejecutar:
```bash
docker compose -f docker-compose.rabbit.yml up -d
