import { describe, expect, it } from 'vitest';
import { useShowcaseState } from './useShowcaseState';

describe('useShowcaseState', () => {
  it('computes aggregate stats from the seeded tasks', () => {
    const state = useShowcaseState();

    expect(state.stats.value).toEqual({
      total: 4,
      active: 2,
      done: 1,
      points: 18,
    });
  });

  it('filters by query and active-state toggle', () => {
    const state = useShowcaseState();

    state.query.value = 'bootstrap';
    expect(state.filteredTasks.value.map((task) => task.title)).toEqual([
      'Align native runtime bootstrap',
    ]);

    state.query.value = '';
    state.toggleOnlyActive();
    expect(state.filteredTasks.value.every((task) => task.status === 'active')).toBe(true);
    expect(state.filteredTasks.value).toHaveLength(2);
  });
});
