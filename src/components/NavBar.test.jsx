import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import NavBar from './NavBar';
import { cerrarSesion, obtenerRol } from '../services/api';
import { BrowserRouter } from 'react-router-dom';

// 1. Mock de los servicios de la API
vi.mock('../services/api', () => ({
    cerrarSesion: vi.fn(),
    obtenerRol: vi.fn(),
}));

// 2. Mock de react-router-dom para probar navegaciones
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('NavBar Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('debe renderizar la información básica y el rol del usuario', () => {
        // Simulamos que el rol actual es 'DOCENTE'
        obtenerRol.mockReturnValue('DOCENTE');

        render(
            <BrowserRouter>
                <NavBar nombreUsuario="Juan Pérez" />
            </BrowserRouter>
        );

        // Verificamos que se muestre el logo / nombre del colegio
        expect(screen.getByText(/Colegio O'Higgins/i)).toBeInTheDocument();

        // Verificamos que se muestre el nombre del usuario y la etiqueta del rol
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
        expect(screen.getByText('Docente')).toBeInTheDocument(); // Viene de etiquetaRol['DOCENTE']
    });

    it('debe mostrar ? si no hay nombre de usuario', () => {
        obtenerRol.mockReturnValue('ADMIN');

        render(
            <BrowserRouter>
                <NavBar />
            </BrowserRouter>
        );

        // Sin pasar el nombreUsuario, debería mostrar la letra '?' en el avatar y 'Usuario'
        expect(screen.getByText('?')).toBeInTheDocument();
        expect(screen.getByText('Usuario')).toBeInTheDocument();
        expect(screen.getByText('Administrador')).toBeInTheDocument();
    });

    it('debe llamar a cerrarSesion y redireccionar a /login al hacer clic en Cerrar sesión', () => {
        obtenerRol.mockReturnValue('ESTUDIANTE');

        render(
            <BrowserRouter>
                <NavBar nombreUsuario="María" />
            </BrowserRouter>
        );

        const btnCerrarSesion = screen.getByRole('button', { name: /Cerrar sesión/i });
        fireEvent.click(btnCerrarSesion);

        // Verificamos (verify estilo Mockito) que los métodos hayan sido llamados
        expect(cerrarSesion).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
});
