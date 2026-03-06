import { describe, expect, it } from 'vitest';
import { render } from './entry-server';

describe('demo-showcase SSR entry', () => {
  it('renders the web showcase shell', async () => {
    const html = await render();

    expect(html).toContain('VueLynx Web Preview + SSR');
    expect(html).toContain('Options API Snapshot');
    expect(html).toContain('JSX Workstream');
    expect(html).toContain('<!--teleport start-->');
  });
});
