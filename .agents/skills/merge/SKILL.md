---
name: merge
description: Verify and merge current repository changes through a conventional branch, commit, Why/What pull request, passing CI, and exact-head squash merge. Use when asked to merge work without creating a release or tag.
---

<!-- Adapted from fcote/template-web at 2c8aa7d7b4dce812d48a38c814e373fe3c1ec661. -->

Take the current work to a merged pull request: verify it, put it on a
`feat/<name>`, `fix/<name>`, or `chore/<name>` branch, commit and push it, open a
pull request with a useful Why/What description, require CI to pass, and
squash-merge it to `dev`. Do not create a version tag or GitHub Release.

Read `README.md` and `docs/dependency-upgrade.md` before starting, and follow
any applicable `AGENTS.md` if present.

## 1. Inspect the work and its base

Start with read-only checks:

```bash
git fetch origin dev
git branch --show-current
git rev-list --left-right --count origin/dev...HEAD
git status --short
git diff
git diff --cached
gh pr status
```

For new uncommitted work, require `HEAD` to equal `origin/dev`. The current
branch may be `dev` or a temporary worktree branch; switch away from it before
committing. Stop if it is behind `origin/dev`, or if commits ahead of
`origin/dev` are unrelated to the requested work.

Resume an earlier merge attempt when the current conventional branch or its PR
contains the same intended change. Do not create a duplicate branch, commit, or
PR merely because an earlier run stopped while CI or GitHub was still working.

Inspect every changed and staged path. `.env` is gitignored and must stay that
way. Stop rather than commit a credential or unrelated user change.

## 2. Describe and verify the change

Derive these from the diff without asking the user for routine wording:

- A conventional subject using `feat:`, `fix:`, or `chore:` followed by a
  lowercase phrase describing the user-visible result. Do not end it with a
  period or say merely "update X".
- A **Why** paragraph explaining what was wrong or missing and how that appeared
  outside the code.
- A **What** paragraph explaining what now happens and why the implementation
  fits the repository.

Run checks for the affected components using the repository's Node and Go
versions. From the repository root:

```bash
npm ci --prefix client
npm run lint --prefix client
npm run build --prefix client
npm ci --prefix server
npm run lint --prefix server
npm run build --prefix server
(cd scheduler && go test ./... && go vet ./... && golangci-lint run && go build .)
```

For client/server behavior changes, run `npm test --prefix server` against a
disposable PostgreSQL database and `npm run test:e2e --prefix client` against
the built API as documented in `docs/dependency-upgrade.md`. Do not use a live
database. Run the relevant Docker builds when changing image definitions or
runtime dependencies. Documentation and agent-configuration changes need
whitespace, Markdown/YAML syntax, and reference checks, not application builds.

## 3. Create a conventional branch and commit

Turn the subject into a short lowercase kebab-case name without its prefix. Use
three to six meaningful words and remove punctuation rather than escaping it:

| Subject | Branch |
| --- | --- |
| `feat: add account settings page` | `feat/add-account-settings` |
| `fix: preserve filters during reload` | `fix/preserve-reload-filters` |
| `chore: share agent merge guidance` | `chore/share-merge-guidance` |

Do not ask the user to name the branch. If the name already belongs to unrelated
local or remote work, add a short meaningful qualifier instead of overwriting
or reusing it.

When `HEAD` equals `origin/dev`, create the branch from `origin/dev` and carry
the working-tree changes across:

```bash
git switch -c <type>/<name> origin/dev
git add <intentional-paths>
git commit --file <commit-message-file>
```

If the intended work is already committed on a temporary branch, create the
conventional branch at that exact `HEAD`; do not manufacture an empty commit.
Keep message files in temporary thread storage so they cannot enter the commit.

The commit message starts with the subject, followed by prose based on Why and
What, wrapped at 76 columns. Preserve user-provided trailers. Do not add an
agent-specific co-author trailer unless requested.

## 4. Push and create the pull request

```bash
git push --set-upstream origin <type>/<name>
gh pr create --base dev --head <type>/<name> --title "<subject>" --body-file <pr-body-file>
```

The PR body has this minimum structure:

```markdown
## Why

<the externally visible problem or need>

## What

<the behavior and implementation that address it>
```

If a PR already exists, verify its base, title, and body and update it when
necessary. Never open a duplicate.

## 5. Prove and merge the pull request

Record the PR head, base, and potential merge OIDs. Inspect `.github/workflows/`
and their path filters to determine which checks the change must trigger:

| Changed paths | Workflow files |
| --- | --- |
| `client/**` | `client.build.yml`, `integration.yml` |
| `server/**` | `server.build.yml`, `integration.yml` |
| `scheduler/**` | `scheduler.build.yml` |
| `.github/workflows/**` | `integration.yml` |

Watch every applicable workflow for the exact branch and head OID, and honor
all required PR checks. A missing expected run is not a passing run. Changes
limited to documentation or agent configuration currently trigger no application
workflow; verify their local checks and report that CI was not triggered. Do not
wait for a nonexistent `ci.yml` or bypass branch protection.

```bash
gh pr view <number> --json headRefOid,baseRefOid,potentialMergeCommit
gh run list --workflow <workflow-file> --event pull_request --branch <type>/<name> --commit <checked-head-oid> --json databaseId,headSha,status,conclusion,url
gh run watch <pr-run-id> --exit-status
gh pr view <number> --json headRefOid,baseRefOid,potentialMergeCommit
```

If any OID changed while checks ran, repeat them against the new candidate.
Once every applicable check passes and the recorded OIDs remain current:

```bash
gh pr merge <number> --squash --match-head-commit <checked-head-oid>
gh pr view <number> --json state,mergeCommit,url
```

Require the PR to report `MERGED` and provide a merge commit OID. Fetch `dev`
and prove that exact commit is present:

```bash
git fetch origin dev
git merge-base --is-ancestor <merge-commit> origin/dev
```

Leave branch cleanup out of this workflow; deleting a checked-out branch from a
linked worktree can fail after a successful merge and obscure the result.

Report the branch, commit, PR URL, passing CI runs (or why no workflows apply),
and merge commit. On failure, name the first incomplete step and preserve the
branch and PR so the workflow can resume safely.
