import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PersonaSwitcher } from '@/components/PersonaSwitcher';
import { DemoBanner } from '@/components/DemoBanner';
import { KpiCards } from '@/components/KpiCards';

describe('A11y basics', () => {
  it('renders PersonaSwitcher with label', () => {
    render(<PersonaSwitcher />);
    expect(screen.getByLabelText(/persona/i)).toBeInTheDocument();
  });

  it('renders banner with demo text', () => {
    render(<DemoBanner />);
    expect(screen.getByText(/Sessão de demonstração/i)).toBeInTheDocument();
  });

  it('renders KPI cards container', () => {
    render(<KpiCards />);
    expect(screen.getByText(/Contratos vigentes/i)).toBeInTheDocument();
  });
});
