import { msalInstance } from "../msalInstance";
import { loginRequest } from "../authConfig";

const BFF_URL = 'https://w6mqdm34tb.execute-api.us-east-1.amazonaws.com/v1';

export const obtenerRol = () => sessionStorage.getItem('rol');
export const obtenerReferenciaId = () => sessionStorage.getItem('referenciaId');
export const obtenerEstudiantesACargo = () => {
    const guardado = sessionStorage.getItem('estudiantesACargo');
    return guardado ? JSON.parse(guardado) : [];
};

export const obtenerAccessToken = async () => {
    const account = msalInstance.getActiveAccount();
    if (!account) {
        throw new Error("No hay una sesión activa de Microsoft Entra ID");
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
    'Authorization': `Bearer ${await obtenerAccessToken()}`
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
        headers: await headers()
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
        headers: await headers()
    });
    return res.json();
};

export const getMiPerfil = async () => {
    const res = await fetch(`${BFF_URL}/miperfil`, {
        headers: await headers()
    });
    return res.json();
};

export const getDashboardCurso = async (id) => {
    const res = await fetch(`${BFF_URL}/curso/${id}`, {
        headers: await headers()
    });
    return res.json();
};

export const getAsignaturas = async () => {
    const res = await fetch(`${BFF_URL}/asignaturas`, {
        headers: await headers()
    });
    return res.json();
};

export const getEvaluaciones = async () => {
    const res = await fetch(`${BFF_URL}/evaluaciones`, {
        headers: await headers()
    });
    return res.json();
};

export const registrarAsistencia = async (datos) => {
    const res = await fetch(`${BFF_URL}/asistencias`, {
        method: 'POST',
        headers: await headers(),
        body: JSON.stringify(datos)
    });
    return res.json();
};

export const registrarAnotacion = async (datos) => {
    const res = await fetch(`${BFF_URL}/anotaciones`, {
        method: 'POST',
        headers: await headers(),
        body: JSON.stringify(datos)
    });
    return res.json();
};

export const publicarComunicado = async (datos) => {
    const res = await fetch(`${BFF_URL}/comunicados`, {
        method: 'POST',
        headers: await headers(),
        body: JSON.stringify(datos)
    });
    return res.json();
};

export const crearEvaluacion = async (datos) => {
    const res = await fetch(`${BFF_URL}/evaluaciones`, {
        method: 'POST',
        headers: await headers(),
        body: JSON.stringify(datos)
    });
    return res.json();
};

export const registrarNota = async (datos) => {
    const res = await fetch(`${BFF_URL}/notas`, {
        method: 'POST',
        headers: await headers(),
        body: JSON.stringify(datos)
    });
    return res.json();
};

export const getEstudiantesApoderado = async (apoderadoId) => {
    const res = await fetch(`${BFF_URL}/apoderados/${apoderadoId}/estudiantes`, {
        headers: await headers()
    });
    return res.json();
};