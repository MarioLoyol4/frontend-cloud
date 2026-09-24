import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProtectedRoute from './ProtectedRoute';
import { obtenerToken, obtenerRol } from '../services/api';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// 1. Mock de los servicios
vi.mock('../services/api', () => ({
    obtenerToken: vi.fn(),
    obtenerRol: vi.fn(),
}));

describe('ProtectedRoute Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Pequeño componente falso para inyectar como "children" en modo exitoso
    const MockDashboard = () => <div>Dashboard Seguro</div>;
    const MockLogin = () => <div>Página de Login</div>;

    const renderConRutas = (rolesPermitidos) => {
        return render(
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<MockLogin />} />
                    <Route 
                        path="/dashboard" 
                        element={
                            <ProtectedRoute roles={rolesPermitidos}>
                                <MockDashboard />
                            </ProtectedRoute>
                        } 
                    />
                </Routes>
            </BrowserRouter>
        );
    };

    it('debe redirigir al login si NO hay token', () => {
        // Simulamos que obtenerToken devuelve null (no logueado)
        obtenerToken.mockReturnValue(null);

        // Simulamos navegar directamente a /dashboard desde la memoria y renderizamos
        window.history.pushState({}, '', '/dashboard');
        renderConRutas(['ADMIN']);

        // Al intentar ir al dashboard sin token, debe redirigir a Login y mostrar su componente
        expect(screen.getByText('Página de Login')).toBeInTheDocument();
        expect(screen.queryByText('Dashboard Seguro')).not.toBeInTheDocument();
    });

    it('debe redirigir al login si el rol no está permitido en la lista', () => {
        obtenerToken.mockReturnValue('un-token-valido');
        // El usuario está logueado pero es DOCENTE
        obtenerRol.mockReturnValue('DOCENTE');

        window.history.pushState({}, '', '/dashboard');
        // Accedemos a una ruta que requiere rol ADMIN
        renderConRutas(['ADMIN']);

        // Como el rol es distinto, debería echarnos hacia el Login nuevamente
        expect(screen.getByText('Página de Login')).toBeInTheDocument();
        expect(screen.queryByText('Dashboard Seguro')).not.toBeInTheDocument();
    });

    it('debe renderizar el contenido hijo si el token existe y el rol coincide', () => {
        obtenerToken.mockReturnValue('un-token-valido');
        // El usuario logueado es ADMIN
        obtenerRol.mockReturnValue('ADMIN');

        window.history.pushState({}, '', '/dashboard');
        renderConRutas(['ADMIN']);

        // Verificamos que esta vez sí podemos ver el contenido del Dashboard
        expect(screen.getByText('Dashboard Seguro')).toBeInTheDocument();
        expect(screen.queryByText('Página de Login')).not.toBeInTheDocument();
    });
});
