const BFF_URL = 'http://localhost:8080';

export const guardarToken = (token, rol) => {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('rol', rol);
};

export const obtenerToken = () => {
    return sessionStorage.getItem('token');
};

export const obtenerRol = () => {
    return sessionStorage.getItem('rol');
};

export const cerrarSesion = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('rol');
};

const headers = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${obtenerToken()}`
});

export const login = async (rut, password) => {
    const res = await fetch(`${BFF_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rut, password })
    });
    return res.json();
};

export const getDashboardEstudiante = async (id) => {
    const res = await fetch(`${BFF_URL}/api/bff/dashboard/estudiante/${id}`, {
        headers: headers()
    });
    return res.json();
};

export const getMiPerfil = async () => {
    const res = await fetch(`${BFF_URL}/api/bff/dashboard/miperfil`, {
        headers: headers()
    });
    return res.json();
};

export const getDashboardCurso = async (id) => {
    const res = await fetch(`${BFF_URL}/api/bff/dashboard/curso/${id}`, {
        headers: headers()
    });
    return res.json();
};

export const getAsignaturas = async () => {
    const res = await fetch(`${BFF_URL}/api/bff/dashboard/asignaturas`, {
        headers: headers()
    });
    return res.json();
};

export const getEvaluaciones = async () => {
    const res = await fetch(`${BFF_URL}/api/bff/dashboard/evaluaciones`, {
        headers: headers()
    });
    return res.json();
};

export const registrarAsistencia = async (datos) => {
    const res = await fetch(`${BFF_URL}/api/bff/dashboard/asistencias`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(datos)
    });
    return res.json();
};

export const registrarAnotacion = async (datos) => {
    const res = await fetch(`${BFF_URL}/api/bff/dashboard/anotaciones`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(datos)
    });
    return res.json();
};

export const publicarComunicado = async (datos) => {
    const res = await fetch(`${BFF_URL}/api/bff/dashboard/comunicados`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(datos)
    });
    return res.json();
};

export const crearEvaluacion = async (datos) => {
    const res = await fetch(`${BFF_URL}/api/bff/dashboard/evaluaciones`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(datos)
    });
    return res.json();
};

export const registrarNota = async (datos) => {
    const res = await fetch(`${BFF_URL}/api/bff/dashboard/notas`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(datos)
    });
    return res.json();
};

export const getEstudiantesApoderado = async (apoderadoId) => {
    const res = await fetch(`${BFF_URL}/api/academic/apoderados/${apoderadoId}/estudiantes`, {
        headers: headers()
    });
    return res.json();
};