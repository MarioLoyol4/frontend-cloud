import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import KafkaAdminPanel from './KafkaAdminPanel';
import * as api from '../services/api';
vi.mock('../services/api');
describe('KafkaAdminPanel', () => {
    it('lista los tópicos y los consumer groups', async () => {
        api.getTopicos.mockResolvedValue([
            {
                name: 'colegio.notas.eventos',
                partitions: 3,
                replicationFactor: 3,
                configs: {
                    'retention.ms': '604800000', 'cleanup.policy':

                        'delete'
                },
            },
        ]);

        api.getGruposConsumidores.mockResolvedValue(['comunicacion-notificaciones']);

        render(<KafkaAdminPanel />);
        await waitFor(() =>

            expect(screen.getAllByText('colegio.notas.eventos').length).toBeGreaterThan(0

            ));
        expect(screen.getByText(/comunicacion-notificaciones/)).toBeTruthy();
    });
});