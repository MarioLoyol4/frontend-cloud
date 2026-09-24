import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DashboardDocente from './DashboardDocente';
import { getDashboardCurso, getAsignaturas, getEvaluaciones, registrarAsistencia, registrarAnotacion, publicarComunicado, registrarNota, crearEvaluacion } from '../services/api';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../services/api', () => ({
    getDashboardCurso: vi.fn(),
    getAsignaturas: vi.fn(),
    getEvaluaciones: vi.fn(),
    obtenerRol: vi.fn(),
    registrarAsistencia: vi.fn(),
    registrarAnotacion: vi.fn(),
    publicarComunicado: vi.fn(),
    crearEvaluacion: vi.fn(),
    registrarNota: vi.fn(),
}));

describe('DashboardDocente Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        getAsignaturas.mockResolvedValue([]);
        getEvaluaciones.mockResolvedValue([]);
    });

    it('debe mostrar estado de carga inicial', () => {
        getDashboardCurso.mockReturnValue(new Promise(() => {})); // Que se quede cargando
        render(<BrowserRouter><DashboardDocente /></BrowserRouter>);
        expect(screen.getByText(/Cargando información del curso.../i)).toBeInTheDocument();
    });

    it('debe mostrar error de la API', async () => {
        getDashboardCurso.mockResolvedValueOnce({ error: 'Error al buscar' });
        render(<BrowserRouter><DashboardDocente /></BrowserRouter>);
        
        await waitFor(() => {
            expect(screen.getByText('Error al buscar')).toBeInTheDocument();
        });
    });

    it('debe cargar y mostrar los estudiantes del curso e interactuar con la búsqueda', async () => {
        getDashboardCurso.mockResolvedValueOnce({
            estudiantes: [{ id: 1, nombre: 'Juan', apellido: 'Perez', rut: '111', email: 'j@j.cl' }],
            comunicados: []
        });
        getAsignaturas.mockResolvedValueOnce([{ id: 1, nombre: 'Matemáticas' }]);
        getEvaluaciones.mockResolvedValueOnce([{ id: 1, nombre: 'Prueba de Álgebra', fecha: '2026-05-01' }]);
        
        render(<BrowserRouter><DashboardDocente /></BrowserRouter>);

        // Comprobamos la carga inicial
        await screen.findByLabelText(/Asistencia de Juan Perez/i);
        expect(screen.getByRole('heading', { name: 'Pasar la lista' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Crear evaluación' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Registrar nota' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Registrar anotación' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Enviar comunicado' })).toBeInTheDocument();

        // Busqueda de otro curso
        getDashboardCurso.mockResolvedValueOnce({
            estudiantes: [{ nombre: 'Maria', apellido: 'Gomez', rut: '222', email: 'm@m.cl' }]
        });

        fireEvent.change(screen.getByLabelText(/Curso ID:/i), { target: { value: '2' } });
        fireEvent.click(screen.getByRole('button', { name: /Buscar/i }));

        await waitFor(() => {
            expect(getDashboardCurso).toHaveBeenCalledWith("2");
            expect(screen.getByText('Maria')).toBeInTheDocument();
        });
    });

    it('debe registrar una asistencia desde la tabla del curso', async () => {
        getDashboardCurso.mockResolvedValueOnce({
            estudiantes: [{ id: 1, nombre: 'Juan', apellido: 'Perez', rut: '111', email: 'j@j.cl' }],
            comunicados: []
        });
        registrarAsistencia.mockResolvedValueOnce({ id: 10 });

        render(<BrowserRouter><DashboardDocente /></BrowserRouter>);

        await screen.findByLabelText(/Asistencia de Juan Perez/i);

        fireEvent.change(screen.getByLabelText(/Asistencia de Juan Perez/i), { target: { value: 'AUSENTE' } });
        fireEvent.click(screen.getByRole('button', { name: /Guardar asistencia/i }));

        await waitFor(() => {
            expect(registrarAsistencia).toHaveBeenCalledWith({
                estudianteId: 1,
                fecha: expect.any(String),
                estado: 'AUSENTE'
            });
            expect(screen.getByText(/Asistencia registrada para Juan Perez/i)).toBeInTheDocument();
        });
    });

    it('debe registrar una anotación y publicar un comunicado', async () => {
        getDashboardCurso.mockResolvedValueOnce({
            estudiantes: [{ id: 1, nombre: 'Juan', apellido: 'Perez', rut: '111', email: 'j@j.cl' }],
            comunicados: []
        });
        getAsignaturas.mockResolvedValueOnce([{ id: 2, nombre: 'Historia y Geografía' }]);
        getEvaluaciones.mockResolvedValueOnce([{ id: 2, nombre: 'Control de Geometría', fecha: '2026-05-15' }]);
        crearEvaluacion.mockResolvedValueOnce({ id: 3 });
        registrarNota.mockResolvedValueOnce({ id: 4 });
        registrarAnotacion.mockResolvedValueOnce({ id: 5 });
        publicarComunicado.mockResolvedValueOnce({ id: 8 });
        getDashboardCurso.mockResolvedValueOnce({
            estudiantes: [{ id: 1, nombre: 'Juan', apellido: 'Perez', rut: '111', email: 'j@j.cl' }],
            comunicados: [{ titulo: 'Nuevo comunicado', contenido: 'Contenido', fechaPublicacion: '2026-07-14T10:00:00' }]
        });

        render(<BrowserRouter><DashboardDocente /></BrowserRouter>);

        await screen.findByLabelText(/Asistencia de Juan Perez/i);

        fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { value: 'Prueba de Historia' } });
        fireEvent.change(screen.getByLabelText(/Fecha de evaluación/i), { target: { value: '2026-07-20' } });
        fireEvent.change(screen.getByLabelText(/Asignatura/i), { target: { value: '2' } });
        fireEvent.click(screen.getByRole('button', { name: /Crear evaluación/i }));

        await waitFor(() => {
            expect(crearEvaluacion).toHaveBeenCalledWith({
                nombre: 'Prueba de Historia',
                fecha: '2026-07-20',
                asignatura: { id: 2 }
            });
            expect(screen.getByText(/Evaluación creada correctamente/i)).toBeInTheDocument();
        });

        fireEvent.change(screen.getByLabelText(/^Evaluación$/i), { target: { value: '2' } });
        fireEvent.change(screen.getByLabelText(/Valor/i), { target: { value: '6.5' } });
        fireEvent.click(screen.getByRole('button', { name: /Guardar nota/i }));

        await waitFor(() => {
            expect(registrarNota).toHaveBeenCalledWith({
                valor: 6.5,
                estudiante: { id: 1 },
                evaluacion: { id: 2 }
            });
            expect(screen.getByText(/Nota registrada correctamente/i)).toBeInTheDocument();
        });

        fireEvent.change(screen.getByLabelText(/Descripción/i), { target: { value: 'Buen trabajo en clase' } });
        fireEvent.click(screen.getByRole('button', { name: /Guardar anotación/i }));

        await waitFor(() => {
            expect(registrarAnotacion).toHaveBeenCalledWith({
                estudianteId: 1,
                tipo: 'POSITIVA',
                descripcion: 'Buen trabajo en clase',
                fecha: expect.any(String)
            });
        });

        fireEvent.change(screen.getByLabelText(/Título/i), { target: { value: 'Reunión' } });
        fireEvent.change(screen.getByLabelText(/Contenido/i), { target: { value: 'Se cita a reunión mañana' } });
        fireEvent.change(screen.getByLabelText(/Destinatario/i), { target: { value: 'GENERAL' } });
        fireEvent.click(screen.getByRole('button', { name: /Enviar comunicado/i }));

        await waitFor(() => {
            expect(publicarComunicado).toHaveBeenCalledWith({
                titulo: 'Reunión',
                contenido: 'Se cita a reunión mañana',
                autorId: 'DOCENTE',
                destinatario: 'GENERAL'
            });
            expect(screen.getByText('Nuevo comunicado')).toBeInTheDocument();
        });
    });
});