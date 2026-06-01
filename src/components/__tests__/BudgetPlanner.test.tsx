import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BudgetPlanner } from '../BudgetPlanner';
import { UserProfile, BudgetPlan } from '../../types';

// Mock react-chartjs-2
vi.mock('react-chartjs-2', () => ({
  Doughnut: () => <div data-testid="mock-doughnut" />,
  Bar: () => <div data-testid="mock-bar" />,
  Line: () => <div data-testid="mock-line" />,
}));

const mockUser: UserProfile = {
  uid: '123',
  name: 'Test User',
  age: '30',
  learningGoal: 'Financial Freedom',
  currency: 'USD',
  joinDate: new Date().toISOString(),
  lastVisit: new Date().toISOString(),
  visitDates: [],
  highScore: 100,
  netWorth: { assets: 100000, liabilities: 20000 }
};

const mockInitialPlan: BudgetPlan = {
  income: 6500,
  expenses: {
    housing: 2000,
    food: 800,
    transport: 400,
    health: 200,
    entertainment: 600,
    education: 100,
    loans: 500,
    other: 400,
  },
  goals: {
    housing: 2200,
    food: 1000,
    transport: 500,
    health: 300,
    entertainment: 800,
    education: 200,
    loans: 600,
    other: 500,
  },
  timestamp: new Date().toISOString()
};

describe('BudgetPlanner Deficit Logic', () => {
  it('triggers 70% variable spending slice when auto-calibration is triggered', async () => {
    const onSave = vi.fn();
    render(<BudgetPlanner user={mockUser} onSave={onSave} initialPlan={mockInitialPlan} />);

    // Trigger Cash Crunch Simulation first to enable the calibrate button
    const simulateButton = screen.getByText(/Simulate Cash Crunch/i);
    fireEvent.click(simulateButton);

    // Now find and click the Auto-Calibrate button
    const calibrateButton = screen.getByText(/Auto-Calibrate Capital Runway/i);
    fireEvent.click(calibrateButton);

    // Verify the state change by checking if the threshold boundaries are calibrated
    expect(screen.getByText(/Threshold Boundaries Calibrated/i)).toBeDefined();

    // Check if entertainment input now has the reduced value (600 * 0.3 = 180)
    const entertainmentInputs = screen.getAllByDisplayValue('180');
    expect(entertainmentInputs.length).toBeGreaterThanOrEqual(1);

    // Check if other input now has the reduced value (400 * 0.4 = 160)
    const otherInputs = screen.getAllByDisplayValue('160');
    expect(otherInputs.length).toBeGreaterThanOrEqual(1);
  });

  it('restructures spending targets flawlessly', () => {
     const onSave = vi.fn();
     render(<BudgetPlanner user={mockUser} onSave={onSave} initialPlan={mockInitialPlan} />);

     fireEvent.click(screen.getByText(/Simulate Cash Crunch/i));
     fireEvent.click(screen.getByText(/Auto-Calibrate Capital Runway/i));

     // Check if goals were updated
     // entertainment goal: 150
     // other goal: 150
     // food goal: 600
     // transport goal: 350

     const goals150 = screen.getAllByDisplayValue('150');
     expect(goals150.length).toBeGreaterThanOrEqual(2);

     const goals600 = screen.getAllByDisplayValue('600');
     expect(goals600.length).toBeGreaterThanOrEqual(2); // One for food expense, one for food goal

     const goals350 = screen.getAllByDisplayValue('350');
     expect(goals350.length).toBeGreaterThanOrEqual(1);
  });
});
