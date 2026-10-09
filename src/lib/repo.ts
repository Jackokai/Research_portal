// Where the content lives on GitHub. One place to change if the repo or default branch is renamed.

export const REPO_URL = 'https://github.com/Jackokai/Research_portal';
export const EDIT_BRANCH = 'main';

/** GitHub web-editor URL for a repo-relative file path such as "content/feedback/x.yaml". */
export function editUrl(filePath: string): string {
  const clean = filePath.replace(/^(\.\/|\/)+/, '');
  if (clean === '' || clean.split('/').some((s) => s === '..' || s === '')) {
    throw new Error(`Not a repo-relative file path: ${filePath}`);
  }
  return `${REPO_URL}/edit/${EDIT_BRANCH}/${clean.split('/').map(encodeURIComponent).join('/')}`;
}
