import { describe, expect, it } from 'vitest';
import {
  buildTodaySummary,
  completionRate,
  isOverdue,
  priorityScore,
  recommendNextStep,
} from '../../src/lib/domain/personalops';
import type { WorkspaceSnapshot } from '../../src/lib/domain/types';

const snapshot = (overrides: Partial<WorkspaceSnapshot> = {}): WorkspaceSnapshot =>
  ({
    profile: { default_daily_capacity_minutes: 360 },
    areas: [],
    goals: [],
    projects: [],
    priorities: [],
    tasks: [],
    commitments: [],
    routines: [],
    routineOccurrences: [],
    energyCheckins: [],
    dailyPlans: [],
    reviews: [],
    progressEntries: [],
    taskEvents: [],
    ...overrides,
  }) as WorkspaceSnapshot;

describe('regras operacionais', () => {
  it('prioriza impacto e urgência e desconta esforço', () => {
    expect(priorityScore({ impact: 5, urgency: 4, effort: 3 })).toBe(15);
  });

  it('não trata itens concluídos, cancelados ou excluídos como atrasados', () => {
    expect(
      isOverdue({ due_date: '2026-07-01', status: 'planned', deleted_at: null }, '2026-08-01'),
    ).toBe(true);
    expect(
      isOverdue({ due_date: '2026-07-01', status: 'completed', deleted_at: null }, '2026-08-01'),
    ).toBe(false);
    expect(
      isOverdue(
        { due_date: '2026-07-01', status: 'planned', deleted_at: '2026-07-02' },
        '2026-08-01',
      ),
    ).toBe(false);
  });

  it('resume planejado, realizado, atraso, bloqueio e capacidade', () => {
    const state = snapshot({
      tasks: [
        {
          scheduled_date: '2026-08-01',
          status: 'completed',
          estimated_minutes: 30,
          deleted_at: null,
          due_date: '2026-08-01',
        },
        {
          scheduled_date: '2026-08-01',
          status: 'blocked',
          estimated_minutes: 45,
          deleted_at: null,
          due_date: '2026-07-31',
        },
      ],
      dailyPlans: [{ plan_date: '2026-08-01', capacity_minutes: 240 }],
      routineOccurrences: [{ occurrence_date: '2026-08-01', status: 'completed' }],
    } as Partial<WorkspaceSnapshot>);
    expect(buildTodaySummary(state, '2026-08-01')).toMatchObject({
      planned: 2,
      completed: 1,
      overdue: 1,
      blocked: 1,
      routineCompleted: 1,
      routineTotal: 1,
      capacityMinutes: 240,
      plannedMinutes: 75,
    });
  });

  it('pede um registro de energia antes de recomendar trabalho', () => {
    expect(recommendNextStep(snapshot(), '2026-08-01')).toContain('Registre energia');
  });

  it('recomenda destravar antes de adicionar mais trabalho', () => {
    const state = snapshot({
      energyCheckins: [{ recorded_at: '2026-08-01T09:00:00Z', energy_level: 4 }],
      tasks: [
        { title: 'Dependência externa', status: 'blocked', deleted_at: null, due_date: null },
      ],
    } as Partial<WorkspaceSnapshot>);
    expect(recommendNextStep(state, '2026-08-01')).toContain('Destrave');
  });

  it('calcula consistência de rotinas sem inventar base', () => {
    expect(completionRate([])).toBe(0);
    expect(completionRate([{ status: 'completed' }, { status: 'pending' }] as never)).toBe(50);
  });
});
