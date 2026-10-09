// Where the content lives on GitHub. One place to change if the repo or default branch is renamed.

export const REPO_URL = 'https://github.com/Jackokai/Research_portal';
export const EDIT_BRANCH = 'main';

/** New-issue form for a board card (the template lives in .github/ISSUE_TEMPLATE/card.yml). */
export function newCardUrl(): string {
  return `${REPO_URL}/issues/new?template=card.yml`;
}

/** GitHub web-editor URL for a repo-relative file path such as "content/feedback/x.yaml". */
export function editUrl(filePath: string): string {
  const clean = filePath.replace(/^(\.\/|\/)+/, '');
  if (clean === '' || clean.split('/').some((s) => s === '..' || s === '')) {
    throw new Error(`Not a repo-relative file path: ${filePath}`);
  }
  return `${REPO_URL}/edit/${EDIT_BRANCH}/${clean.split('/').map(encodeURIComponent).join('/')}`;
}
