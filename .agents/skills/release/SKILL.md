---
name: release
description: Verify, merge, tag, and publish current repository changes as a patch, minor, or major GitHub Release. Use when asked to release or publish this repository.
---

<!-- Adapted from fcote/template-web at 2c8aa7d7b4dce812d48a38c814e373fe3c1ec661. -->

Take the working tree from its current state to a published GitHub Release. The
user's requested version bump must be `patch`, `minor`, or `major`.
If it is anything else, ask which one; do not guess.

Read `README.md` and `docs/dependency-upgrade.md` before starting, and follow
any applicable `AGENTS.md` if present. Follow the branch, verification,
commit, pull-request, CI, and squash-merge requirements in
`.agents/skills/merge/SKILL.md`, plus the release requirements below.

## 1. Release preflight

Before changing Git or GitHub, inspect the exact release base:

```bash
git fetch origin dev --tags
git branch --show-current
git rev-list --left-right --count origin/dev...HEAD
git status --short
git tag --sort=-v:refname | head -1
gh pr status
```

Require `HEAD` to equal `origin/dev` before creating a new release branch. Stop
if it is ahead or behind: silently folding old branch work into a release or
building on a stale base changes the work the user approved.

There must be a working-tree change to commit. A clean tree at an already tagged
commit has nothing to release. If an earlier attempt already created the branch,
PR, merge, tag, or GitHub Release, inspect those artifacts and resume at the
first unfinished step instead of creating replacements.

Determine the latest `vX.Y.Z` tag and calculate the target:

| Argument | From `v1.7.4` |
| --- | --- |
| `patch` | `v1.7.5` |
| `minor` | `v1.8.0` |
| `major` | `v2.0.0` |

If no semantic-version tag exists, use `v0.1.0` for the first release unless the
user explicitly selected `major`, in which case use `v1.0.0`.

The conventional commit prefix and version should agree: `feat:` usually means
`minor`; `fix:` or `chore:` usually means `patch`; a breaking change can mean
`major`. If the requested bump and actual change disagree, ask before creating
the branch.

## 2. Merge through a proved pull request

Read and follow `.agents/skills/merge/SKILL.md` through its merge verification
step. Use the same conventional subject for the commit and PR, and retain the
latest tag and calculated target from preflight.

After merging, fetch `dev` and prove the reported merge commit is contained in
`origin/dev`:

```bash
git fetch origin dev --tags
git merge-base --is-ancestor <merge-commit> origin/dev
```

Use the workflow/path mapping in the merge skill to find and watch every
applicable `push` run on `dev` for the exact merge commit before tagging:

```bash
gh run list --workflow <workflow-file> --event push --branch dev --commit <merge-commit> --json databaseId,headSha,status,conclusion,url
gh run watch <dev-run-id> --exit-status
```

If an expected run is missing or any applicable run does not pass, stop without
tagging. Name its missing or failing step and leave the merged PR visible for
diagnosis. For documentation/agent-only changes, report the verified local checks
and why no application workflow applies.

## 3. Protect the version boundary

Fetch tags once more immediately before tagging. Require the latest version tag
to be exactly the one recorded during preflight and require the target tag not
to exist. If either condition changed while the PR was open, stop and report the
collision. Do not move a tag, replace it, create an out-of-order version, or
silently choose another version.

Create an annotated tag on the verified merge commit. The tag message is the
conventional subject without its prefix, with its first letter capitalized.

```bash
git tag -a vX.Y.Z <merge-commit> -m "<tag-message>"
git push origin vX.Y.Z
```

Never tag an open PR or the head of its feature branch.

## 4. Publish and verify the GitHub Release

Create release notes from the repository history and bind the release to the
annotated tag:

```bash
gh release create vX.Y.Z --verify-tag --generate-notes --title "vX.Y.Z"
gh release view vX.Y.Z --json tagName,isDraft,isPrerelease,url
```

Require the release to exist, reference the expected tag, and be neither a draft
nor a prerelease. Publishing a GitHub Release triggers `client.publish.yml`,
`server.publish.yml`, and `scheduler.publish.yml`. These build and push the
`fcote/merlin-client:latest`, `fcote/merlin-server:latest`, and
`fcote/merlin-scheduler:latest` images. Watch all three release-event runs for the
verified merge commit and this release's publication time; do not reuse a run
from an earlier release of the same commit.

```bash
gh run list --workflow <component>.publish.yml --event release --commit <merge-commit> --json databaseId,headSha,status,conclusion,createdAt,url
gh run watch <publish-run-id> --exit-status
```

Require each publishing run to succeed. If publication fails, report the existing
release and the failed image workflow; do not delete or recreate the tag/release
or claim all images were published. Resume the failed publishing step.

Report the branch, PR, merge commit, target tag, passing PR and `dev` CI runs,
container publishing runs, and GitHub Release URL. Do not call the release
complete until every artifact is verified. On failure, name the first incomplete
step and leave existing artifacts intact so the workflow can resume safely.
