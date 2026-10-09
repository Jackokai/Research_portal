import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EDIT_BRANCH, REPO_URL, editUrl, newCardUrl } from './repo.ts';

test('builds the edit URL for a content file', () => {
  assert.equal(editUrl('content/feedback/sample-open.yaml'), `${REPO_URL}/edit/${EDIT_BRANCH}/content/feedback/sample-open.yaml`);
});

test('strips a leading ./ or /', () => {
  assert.equal(editUrl('./content/goals/2026-q4.yaml'), editUrl('content/goals/2026-q4.yaml'));
  assert.equal(editUrl('/content/goals/2026-q4.yaml'), editUrl('content/goals/2026-q4.yaml'));
});

test('encodes spaces and special characters but keeps slashes', () => {
  assert.ok(editUrl('content/archive/my note #1.md').endsWith('/content/archive/my%20note%20%231.md'));
});

test('rejects traversal and empty paths', () => {
  assert.throws(() => editUrl('../secrets.txt'));
  assert.throws(() => editUrl('content/../x.md'));
  assert.throws(() => editUrl(''));
  assert.throws(() => editUrl('content//x.md'));
});

test('the branch is main', () => {
  assert.equal(EDIT_BRANCH, 'main');
});

test('newCardUrl opens the card template on the repo issue form', () => {
  assert.equal(newCardUrl(), `${REPO_URL}/issues/new?template=card.yml`);
});
