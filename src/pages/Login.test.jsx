import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Login from './Login';
import { login, guardarToken } from '../services/api';
import { BrowserRouter } from 'react-router-dom';

// Imitar (Mockear) el archivo api.js (equivalente al @Mock de Mockito)
vi.mock('../services/api', () => ({
    login: vi.fn(),
    guardarToken: vi.fn(),
}));

// Mockear react-router para capturar la redirección (useNavigate)
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('Login Component', () => {
    beforeEach(() => {
        vi.clearAllMocks(); // Limpiamos los mocks antes de cada test para no cruzar estados
    });

    it('debe renderizar los campos del formulario correctamente', () => {
        render(<BrowserRouter><Login /></BrowserRouter>);
        
        // Verificamos elementos del DOM
        expect(screen.getByRole('heading', { name: /Iniciar Sesión/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/RUT/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Ingresar/i })).toBeInTheDocument();
    });

    it('debe mostrar mensaje de error si el login falla', async () => {
        // Configuramos el comportamiento de "login" simulando Mockito: when(login()).thenReturn(...)
        login.mockResolvedValueOnce({ error: 'Credenciales inválidas' });

        render(<BrowserRouter><Login /></BrowserRouter>);

        // Escribimos en los inputs (Simular escritura)
        fireEvent.change(screen.getByLabelText(/RUT/i), { target: { value: '12345678-9' } });
        fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: 'password123' } });
        
        // Hacemos clic en ingresar
        fireEvent.click(screen.getByRole('button', { name: /Ingresar/i }));

        // Esperamos que el mensaje de error aparezca en pantalla
        await waitFor(() => {
            expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
        });

        // Verificamos interacciones con los métodos (equivalente a verify(api, times(1)))
        expect(login).toHaveBeenCalledWith('12345678-9', 'password123');
        expect(guardarToken).not.toHaveBeenCalled(); // No debe guardar si falla
    });

    it('debe guardar token y redirigir a /admin si el rol es ADMIN', async () => {
        // Mock de un login exitoso
        login.mockResolvedValueOnce({ token: 'fake-token-123', rol: 'ADMIN' });

        render(<BrowserRouter><Login /></BrowserRouter>);

        fireEvent.change(screen.getByLabelText(/RUT/i), { target: { value: 'admin-rut' } });
        fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: 'adminpass' } });
        fireEvent.click(screen.getByRole('button', { name: /Ingresar/i }));

        // Esperar a que se guarden los datos
        await waitFor(() => {
            expect(guardarToken).toHaveBeenCalledWith('fake-token-123', 'ADMIN');
        });

        // En Mockito sería: verify(navigate, times(1)).navigate("/admin")
        expect(mockNavigate).toHaveBeenCalledWith('/admin');
    });
});
