import { msalInstance } from '../msalInstance';
import { loginRequest } from '../authConfig';

const BFF_URL = 'https://w6mqdm34tb.execute-api.us-east-1.amazonaws.com/v1';
const RABBIT_URL = `${BFF_URL}/api/bff/dashboard/rabbit`;

export const obtenerRol = () => sessionStorage.getItem('rol');
export const obtenerReferenciaId = () => sessionStorage.getItem('referenciaId');
export const obtenerEstudiantesACargo = () => {
    const guardado = sessionStorage.getItem('estudiantesACargo');
    return guardado ? JSON.parse(guardado) : [];
};

export const obtenerAccessToken = async () => {
    const account = msalInstance.getActiveAccount();

    if (!account) {
        throw new Error('No hay una sesión activa de Microsoft Entra ID');
    }

    try {
        const respuesta = await msalInstance.acquireTokenSilent({ ...loginRequest, account });
        return respuesta.accessToken;
    } catch (error) {
        await msalInstance.acquireTokenRedirect({ ...loginRequest, account });
        return null;
    }
};

const headers = async () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${await obtenerAccessToken()}`,
});

export const cerrarSesion = async () => {
    sessionStorage.removeItem('rol');
    sessionStorage.removeItem('referenciaId');
    sessionStorage.removeItem('estudiantesACargo');

    const account = msalInstance.getActiveAccount();
    await msalInstance.logoutRedirect({ account });
};

export const sincronizarPerfil = async () => {
    const res = await fetch(`${BFF_URL}/perfil`, {
        headers: await headers(),
    });

    const data = await res.json();

    if (data.rol) {
        sessionStorage.setItem('rol', data.rol);
        sessionStorage.setItem('referenciaId', data.referenciaId ?? '');
        sessionStorage.setItem('estudiantesACargo', JSON.stringify(data.estudiantesACargo ?? []));
    }

    return data;
};

export const getDashboardEstudiante = async (id) => {
    const res = await fetch(`${BFF_URL}/estudiante/${id}`, {
        headers: await headers(),
    });

    return res.json();
};

export const getMiPerfil = async () => {
    const res = await fetch(`${BFF_URL}/miperfil`, {
        headers: await headers(),
    });

    return res.json();
};

export const getDashboardCurso = async (id) => {
    const res = await fetch(`${BFF_URL}/curso/${id}`, {
        headers: await headers(),
    });

    return res.json();
};

export const getAsignaturas = async () => {
    const res = await fetch(`${BFF_URL}/asignaturas`, {
        headers: await headers(),
    });

    return res.json();
};

export const getEvaluaciones = async () => {
    const res = await fetch(`${BFF_URL}/evaluaciones`, {
        headers: await headers(),
    });

    return res.json();
};

export const registrarAsistencia = async (datos) => {
    const res = await fetch(`${BFF_URL}/asistencias`, {
        method: 'POST',
        headers: await headers(),
        body: JSON.stringify(datos),
    });

    return res.json();
};

export const registrarAnotacion = async (datos) => {
    const res = await fetch(`${BFF_URL}/anotaciones`, {
        method: 'POST',
        headers: await headers(),
        body: JSON.stringify(datos),
    });

    return res.json();
};

export const publicarComunicado = async (datos) => {
    const res = await fetch(`${BFF_URL}/comunicados`, {
        method: 'POST',
        headers: await headers(),
        body: JSON.stringify(datos),
    });

    return res.json();
};

export const crearEvaluacion = async (datos) => {
    const res = await fetch(`${BFF_URL}/evaluaciones`, {
        method: 'POST',
        headers: await headers(),
        body: JSON.stringify(datos),
    });

    return res.json();
};

export const registrarNota = async (datos) => {
    const res = await fetch(`${BFF_URL}/notas`, {
        method: 'POST',
        headers: await headers(),
        body: JSON.stringify(datos),
    });

    return res.json();
};

export const getEstudiantesApoderado = async (apoderadoId) => {
    const res = await fetch(`${BFF_URL}/apoderados/${apoderadoId}/estudiantes`, {
        headers: await headers(),
    });

    return res.json();
};

// Convierte la respuesta en datos o en un Error con los detalles de
const leerRespuesta = async (res) => {
    const texto = await res.text();
    const data = texto ? JSON.parse(texto) : {};

    if (!res.ok) {
        const error = new Error(data.error || `Error ${res.status}`);
        error.detalles = data.detalles || [];
        throw error;
    }

    return data;
};

const rabbit = async (metodo, ruta, cuerpo) =>
    leerRespuesta(
        await fetch(`${RABBIT_URL}${ruta}`, {
            method: metodo,
            headers: await headers(),
            body: cuerpo ? JSON.stringify(cuerpo) : undefined,
        })
    );

export const getColasSistema = () => rabbit('GET', '/queues');
export const crearCola = (datos) => rabbit('POST', '/queues', datos);
export const eliminarCola = (nombre) => rabbit('DELETE', `/queues/${encodeURIComponent(nombre)}`);
export const purgarCola = (nombre) => rabbit('POST', `/queues/${encodeURIComponent(nombre)}/purge`);
export const crearExchange = (datos) => rabbit('POST', '/exchanges', datos);
export const eliminarExchange = (nombre) => rabbit('DELETE', `/exchanges/${encodeURIComponent(nombre)}`);
export const crearBinding = (datos) => rabbit('POST', '/bindings', datos);
export const eliminarBinding = ({ queue, exchange, routingKey }) =>
    rabbit(
        'DELETE',
        `/bindings?queue=${encodeURIComponent(queue)}&exchange=${encodeURIComponent(exchange)}&routingKey=${encodeURIComponent(routingKey ?? '')}`
    );

export const solicitarBoletin = async (estudianteId) =>
    leerRespuesta(
        await fetch(`${BFF_URL}/api/bff/dashboard/boletines/${estudianteId}`, {
            method: 'POST',
            headers: await headers(),
        })
    );