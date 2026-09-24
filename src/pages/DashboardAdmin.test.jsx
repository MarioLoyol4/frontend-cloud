import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import DashboardAdmin from './DashboardAdmin';

describe('DashboardAdmin Component', () => {
    it('debe renderizar el título Admin', () => {
        render(<DashboardAdmin />);
        expect(screen.getByRole('heading', { name: /Admin/i })).toBeInTheDocument();
    });
});