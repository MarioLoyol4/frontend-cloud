import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DashboardApoderado from './DashboardApoderado';
import { getDashboardEstudiante, obtenerToken } from '../services/api';
import { BrowserRouter } from 'react-router-dom';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

vi.mock('../services/api', () => ({
    getDashboardEstudiante: vi.fn(),
    obtenerToken: vi.fn(),
    obtenerRol: vi.fn(),
}));

describe('DashboardApoderado Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('debe redirigir a /login si no hay token', () => {
        obtenerToken.mockReturnValue(null);
        render(<BrowserRouter><DashboardApoderado /></BrowserRouter>);
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('debe redirigir a /login si el token es invalido (falla al parsear base64)', () => {
        obtenerToken.mockReturnValue('token.invalido.123');
        render(<BrowserRouter><DashboardApoderado /></BrowserRouter>);
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('debe cargar al primer estudiante a cargo y permitir cambiar entre ellos', async () => {
        // Mock payload: { estudiantesACargo: [10, 20] } en base64
        const payload = btoa(JSON.stringify({ estudiantesACargo: [10, 20] }));
        obtenerToken.mockReturnValue(`header.${payload}.signature`);
        
        getDashboardEstudiante.mockResolvedValueOnce({
            notas: [
                { id: 1, valor: 6.5, evaluacion: { nombre: 'Prueba 1', asignatura: { nombre: 'Matemáticas' } } },
                { id: 2, valor: 5.5, evaluacion: { nombre: 'Prueba 2', asignatura: { nombre: 'Matemáticas' } } },
                { id: 3, valor: 7.0, evaluacion: { nombre: 'Ensayo', asignatura: { nombre: 'Lenguaje y Comunicación' } } }
            ]
        });

        render(<BrowserRouter><DashboardApoderado /></BrowserRouter>);

        // Se deben renderizar los botones por cada estudiante
        expect(screen.getByText('Estudiante 10')).toBeInTheDocument();
        expect(screen.getByText('Estudiante 20')).toBeInTheDocument();
        
        // Verifica que se llame con el primer ID automáticamente
        await waitFor(() => {
            expect(getDashboardEstudiante).toHaveBeenCalledWith(10);
            expect(screen.getByText('Matemáticas')).toBeInTheDocument();
            expect(screen.getByText('Promedio: 6.0')).toBeInTheDocument();
        });

        // Click al segundo estudiante
        getDashboardEstudiante.mockResolvedValueOnce({
               notas: [{ id: 2, valor: 7.0, evaluacion: { nombre: 'Prueba 3', asignatura: { nombre: 'Historia y Geografía' } } }]
        });
        fireEvent.click(screen.getByText('Estudiante 20'));

        await waitFor(() => {
            expect(getDashboardEstudiante).toHaveBeenCalledWith(20);
            expect(screen.getByText('Historia y Geografía')).toBeInTheDocument();
        });
    });
});