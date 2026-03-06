import { computed, ref } from 'vue';

export interface ShowcaseTask {
  id: number;
  title: string;
  status: 'planned' | 'active' | 'done';
  owner: string;
  points: number;
}

const seedTasks: ShowcaseTask[] = [
  { id: 1, title: 'Align native runtime bootstrap', status: 'active', owner: 'Ada', points: 8 },
  { id: 2, title: 'Ship web preview parity layer', status: 'planned', owner: 'Rin', points: 5 },
  { id: 3, title: 'Wire SSR hydration smoke tests', status: 'done', owner: 'Noa', points: 3 },
  { id: 4, title: 'Document Explorer + DevTool flow', status: 'active', owner: 'Max', points: 2 },
];

export function useShowcaseState() {
  const query = ref('');
  const showOverlay = ref(false);
  const onlyActive = ref(false);
  const tasks = ref(seedTasks);

  const filteredTasks = computed(() => {
    const lowered = query.value.trim().toLowerCase();
    return tasks.value.filter((task) => {
      const matchesQuery = !lowered || task.title.toLowerCase().includes(lowered) || task.owner.toLowerCase().includes(lowered);
      const matchesStatus = !onlyActive.value || task.status === 'active';
      return matchesQuery && matchesStatus;
    });
  });

  const stats = computed(() => ({
    total: tasks.value.length,
    active: tasks.value.filter((task) => task.status === 'active').length,
    done: tasks.value.filter((task) => task.status === 'done').length,
    points: tasks.value.reduce((total, task) => total + task.points, 0),
  }));

  function toggleOverlay() {
    showOverlay.value = !showOverlay.value;
  }

  function toggleOnlyActive() {
    onlyActive.value = !onlyActive.value;
  }

  return {
    query,
    onlyActive,
    showOverlay,
    tasks,
    filteredTasks,
    stats,
    toggleOverlay,
    toggleOnlyActive,
  };
}
