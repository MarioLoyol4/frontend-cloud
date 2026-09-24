import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    guardarToken,
    obtenerToken,
    obtenerRol,
    cerrarSesion,
    login,
    getDashboardEstudiante,
    getMiPerfil,
    getDashboardCurso,
    getAsignaturas,
    getEvaluaciones,
    getEstudiantesApoderado,
    registrarAsistencia,
    registrarAnotacion,
    publicarComunicado,
    crearEvaluacion,
    registrarNota
} from './api';

const BFF_URL = 'http://localhost:8080';

// Mock estricto y transparente de SessionStorage
const mockSessionStorage = (() => {
    let store = {};
    return {
        getItem: vi.fn(key => store[key] || null),
        setItem: vi.fn((key, value) => { store[key] = value ? value.toString() : ''; }),
        removeItem: vi.fn(key => { delete store[key]; }),
        clear: vi.fn(() => { store = {}; })
    };
})();

// Reemplazamos la variable global de window por nuestro mock
Object.defineProperty(window, 'sessionStorage', {
    value: mockSessionStorage
});

// Mock de la función global de fetch
global.fetch = vi.fn();

describe('API Services (api.js)', () => {

    beforeEach(() => {
        // Limpiar storage y llamadas de los mock antes de cada prueba
        mockSessionStorage.clear();
        vi.clearAllMocks();
    });

    describe('Autenticación y Sesión (SessionStorage)', () => {
        
        it('debe guardar el token y el rol correctamente', () => {
            guardarToken('mi-super-token', 'DOCENTE');
            
            expect(mockSessionStorage.setItem).toHaveBeenCalledWith('token', 'mi-super-token');
            expect(mockSessionStorage.setItem).toHaveBeenCalledWith('rol', 'DOCENTE');
        });

        it('debe obtener el token almacenado', () => {
            mockSessionStorage.setItem('token', 'token-para-leer');
            
            const tokenLeido = obtenerToken();
            expect(tokenLeido).toBe('token-para-leer');
            expect(mockSessionStorage.getItem).toHaveBeenCalledWith('token');
        });

        it('debe obtener el rol almacenado', () => {
            mockSessionStorage.setItem('rol', 'ADMIN');
            
            const rolLeido = obtenerRol();
            expect(rolLeido).toBe('ADMIN');
            expect(mockSessionStorage.getItem).toHaveBeenCalledWith('rol');
        });

        it('debe eliminar token y rol al cerrar sesión', () => {
            cerrarSesion();
            
            expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('token');
            expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('rol');
        });
    });

    describe('Peticiones HTTP (Fetch) al BFF', () => {

        beforeEach(() => {
            // Simulamos que el endpoint siempre devuelve { success: true }
            fetch.mockResolvedValue({
                json: vi.fn().mockResolvedValue({ success: true })
            });
            
            // Simulamos que hay un token de sesión presente para los tests con header
            mockSessionStorage.getItem.mockImplementation((key) => {
                if(key === 'token') return 'mock-jwt-token';
                return null;
            });
        });

        it('login realiza correctamente una petición POST con los datos correctos', async () => {
            const respuesta = await login('12345678-9', 'mypass');

            expect(fetch).toHaveBeenCalledWith(`${BFF_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rut: '12345678-9', password: 'mypass' })
            });
            expect(respuesta.success).toBe(true);
        });

        it('getDashboardEstudiante solicita información de un id incluyendo el Auth Header', async () => {
            await getDashboardEstudiante(15);

            expect(fetch).toHaveBeenCalledWith(`${BFF_URL}/api/bff/dashboard/estudiante/15`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer mock-jwt-token'
                }
            });
        });

        it('getMiPerfil solicita la información del perfil propio', async () => {
            await getMiPerfil();

            expect(fetch).toHaveBeenCalledWith(`${BFF_URL}/api/bff/dashboard/miperfil`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer mock-jwt-token'
                }
            });
        });

        it('getDashboardCurso solicita la información de un curso', async () => {
            await getDashboardCurso(3);

            expect(fetch).toHaveBeenCalledWith(`${BFF_URL}/api/bff/dashboard/curso/3`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer mock-jwt-token'
                }
            });
        });

        it('getAsignaturas solicita el catálogo de asignaturas', async () => {
            await getAsignaturas();

            expect(fetch).toHaveBeenCalledWith(`${BFF_URL}/api/bff/dashboard/asignaturas`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer mock-jwt-token'
                }
            });
        });

        it('getEvaluaciones solicita el catálogo de evaluaciones', async () => {
            await getEvaluaciones();

            expect(fetch).toHaveBeenCalledWith(`${BFF_URL}/api/bff/dashboard/evaluaciones`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer mock-jwt-token'
                }
            });
        });

        it('getEstudiantesApoderado llama a la ruta correcta', async () => {
            await getEstudiantesApoderado(9);

            expect(fetch).toHaveBeenCalledWith(`${BFF_URL}/api/academic/apoderados/9/estudiantes`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer mock-jwt-token'
                }
            });
        });

        it('registrarAsistencia realiza una petición POST al BFF', async () => {
            await registrarAsistencia({ estudianteId: 1, fecha: '2026-07-14', estado: 'PRESENTE' });

            expect(fetch).toHaveBeenCalledWith(`${BFF_URL}/api/bff/dashboard/asistencias`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer mock-jwt-token'
                },
                body: JSON.stringify({ estudianteId: 1, fecha: '2026-07-14', estado: 'PRESENTE' })
            });
        });

        it('registrarAnotacion realiza una petición POST al BFF', async () => {
            await registrarAnotacion({ estudianteId: 1, tipo: 'POSITIVA', descripcion: 'Buen trabajo', fecha: '2026-07-14' });

            expect(fetch).toHaveBeenCalledWith(`${BFF_URL}/api/bff/dashboard/anotaciones`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer mock-jwt-token'
                },
                body: JSON.stringify({ estudianteId: 1, tipo: 'POSITIVA', descripcion: 'Buen trabajo', fecha: '2026-07-14' })
            });
        });

        it('publicarComunicado realiza una petición POST al BFF', async () => {
            await publicarComunicado({ titulo: 'Aviso', contenido: 'Prueba', autorId: 'DOCENTE', destinatario: 'GENERAL' });

            expect(fetch).toHaveBeenCalledWith(`${BFF_URL}/api/bff/dashboard/comunicados`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer mock-jwt-token'
                },
                body: JSON.stringify({ titulo: 'Aviso', contenido: 'Prueba', autorId: 'DOCENTE', destinatario: 'GENERAL' })
            });
        });

        it('crearEvaluacion realiza una petición POST al BFF', async () => {
            await crearEvaluacion({ nombre: 'Prueba de Historia', fecha: '2026-07-20', asignatura: { id: 2 } });

            expect(fetch).toHaveBeenCalledWith(`${BFF_URL}/api/bff/dashboard/evaluaciones`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer mock-jwt-token'
                },
                body: JSON.stringify({ nombre: 'Prueba de Historia', fecha: '2026-07-20', asignatura: { id: 2 } })
            });
        });

        it('registrarNota realiza una petición POST al BFF', async () => {
            await registrarNota({ valor: 6.5, estudiante: { id: 1 }, evaluacion: { id: 2 } });

            expect(fetch).toHaveBeenCalledWith(`${BFF_URL}/api/bff/dashboard/notas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer mock-jwt-token'
                },
                body: JSON.stringify({ valor: 6.5, estudiante: { id: 1 }, evaluacion: { id: 2 } })
            });
        });
    });
});