import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DashboardEstudiante from './DashboardEstudiante';
import { getMiPerfil } from '../services/api';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../services/api', () => ({
    getMiPerfil: vi.fn(),
    obtenerRol: vi.fn(),
}));

describe('DashboardEstudiante Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('debe mostrar el mensaje de carga inicial', () => {
        getMiPerfil.mockReturnValue(new Promise(() => {})); // Que se quede cargando
        render(<BrowserRouter><DashboardEstudiante /></BrowserRouter>);
        expect(screen.getByText(/Cargando tu información.../i)).toBeInTheDocument();
    });

    it('debe mostrar error si la carga falla', async () => {
        getMiPerfil.mockResolvedValueOnce({ error: 'Fallo al cargar' });
        render(<BrowserRouter><DashboardEstudiante /></BrowserRouter>);
        
        await waitFor(() => {
            expect(screen.getByText('Fallo al cargar')).toBeInTheDocument();
        });
    });

    it('debe renderizar los datos del estudiante (promedio y asistencia)', async () => {
        const mockData = {
            notas: [
                { valor: 6.0, evaluacion: { nombre: 'Prueba 1', asignatura: { nombre: 'Matemáticas' } } },
                { valor: 7.0, evaluacion: { nombre: 'Prueba 2', asignatura: { nombre: 'Matemáticas' } } },
                { valor: 5.0, evaluacion: { nombre: 'Lectura', asignatura: { nombre: 'Lenguaje y Comunicación' } } }
            ],
            historialAsistencias: [{ estado: 'PRESENTE' }, { estado: 'AUSENTE' }], // 50%
            comunicados: [{ titulo: 'Comunicado 1' }]
        };
        getMiPerfil.mockResolvedValueOnce(mockData);
        
        render(<BrowserRouter><DashboardEstudiante /></BrowserRouter>);

        await waitFor(() => {
            expect(screen.getByText('Promedio general: 6.0')).toBeInTheDocument(); // Promedio general calculado
            expect(screen.getByText('50%')).toBeInTheDocument(); // Asistencia calculada
            expect(screen.getByText('Matemáticas')).toBeInTheDocument();
            expect(screen.getByText('Lenguaje y Comunicación')).toBeInTheDocument();
            expect(screen.getByText('Promedio: 6.5')).toBeInTheDocument();
            expect(screen.getByText('Promedio: 5.0')).toBeInTheDocument();
        });
    });
});