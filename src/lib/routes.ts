// The only place that names the three views. Pages, navigation, the protect step and every guard use this,
// so moving a view is a one-file change.

export const ROUTES = {
  public: '/',
  researcher: '/researcher/',
  supervisor: '/supervisor/',
} as const;

export type Lens = keyof typeof ROUTES;

/** The former home of the public view. Kept as a redirect page so shared links keep working. */
export const LEGACY_PUBLIC = '/public/';

export const LENS_LABEL: Record<Lens, string> = {
  researcher: 'Researcher',
  supervisor: 'Supervisor',
  public: 'Public',
};

/** Views that sit behind the password when protection is on, and are kept out of search engines. */
export const PRIVATE_LENSES: Lens[] = ['researcher', 'supervisor'];

/** Link target for a route under the site base path ("/Research_portal" or ""). */
export function href(route: string, base: string): string {
  return `${base.replace(/\/$/, '')}${route}`;
}

/** File inside dist/ for a route: "/" is index.html, "/researcher/" is researcher/index.html. */
export function distFile(route: string): string {
  return `${route.replace(/^\/|\/$/g, '')}${route === '/' ? '' : '/'}index.html`.replace(/^\//, '');
}
