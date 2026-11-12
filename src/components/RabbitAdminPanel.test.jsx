import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import RabbitAdminPanel from './RabbitAdminPanel';
import * as api from '../../services/api';

vi.mock('../../services/api', () => ({
    getColasSistema: vi.fn().mockResolvedValue([
        { name: 'notificaciones.nota.queue', exists: true, messages: 0, consumers: 1 },
        { name: 'notificaciones.nota.queue.dlq', exists: true, messages: 2, consumers: 0 },
    ]),
    crearCola: vi.fn(), eliminarCola: vi.fn(), purgarCola: vi.fn().mockResolvedValue({}),
    crearExchange: vi.fn(), eliminarExchange: vi.fn(), crearBinding: vi.fn(), eliminarBinding: vi.fn(),
}));

describe('RabbitAdminPanel', () => {
    it('resalta la DLQ que tiene mensajes', async () => {
        render(<RabbitAdminPanel />);
        const celda = await screen.findByText('notificaciones.nota.queue.dlq');
        expect(celda.closest('tr')).toHaveClass('alerta');
    });

    it('vacía una cola desde la tabla', async () => {
        render(<RabbitAdminPanel />);
        await screen.findByText('notificaciones.nota.queue');
        fireEvent.click(screen.getAllByText('Vaciar')[0]);
        await waitFor(() => expect(api.purgarCola).toHaveBeenCalledWith('notificaciones.nota.queue'));
    });
});