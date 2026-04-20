# Releasing `@soundrussian/interop`

This package is built in CI and at publish time. `dist/` should not be committed to git.

## First-time GitHub setup

1. Create the GitHub repository and push the project to `main`.
2. In npm, ensure the package scope and package name are correct.
3. On npmjs.com, open the package settings for `@soundrussian/interop`.
4. In the `Trusted Publisher` section, add a GitHub Actions trusted publisher for this repository.
5. Enter the exact release workflow filename: `release.yml`.

This release flow uses npm Trusted Publishing with GitHub Actions OIDC. No long-lived `NPM_TOKEN` secret is required.

## Normal release flow

1. Make changes locally.
2. Run `npm test`.
3. Bump the version with one of:

```bash
npm version patch
npm version minor
npm version major
```

4. Push the commit and tag:

```bash
git push origin main --follow-tags
```

## What happens in CI

- Pull requests and pushes to `main` run tests and `npm pack --dry-run`.
- Pushing a tag like `v1.0.1` triggers the release workflow.
- The release workflow installs dependencies, verifies the tag matches `package.json`, runs tests, builds via `prepack`, and publishes to npm using Trusted Publishing.

## Trusted Publishing notes

- Trusted Publishing requires the npm package settings to point at this GitHub repository and workflow filename.
- The release workflow must run on a GitHub-hosted runner with `id-token: write`.
- If the npm Trusted Publisher settings do not match this repository or workflow filename exactly, publish will fail.
