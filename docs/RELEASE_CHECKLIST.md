# v1.0.0 GitHub release checklist

## Before committing

- [ ] Copy `.env.example` to `.env` only on the local machine; never commit `.env`.
- [ ] Confirm `GEMINI_MODEL=gemini-3.5-flash-lite` for reproducibility with the recorded final evaluation.
- [ ] Run the backend checks:

```powershell
.\venv\Scripts\python.exe -m compileall -q backend
.\venv\Scripts\python.exe -m unittest discover -s backend -p "test_*.py"
.\venv\Scripts\python.exe -m backend.evaluate --dry-run
```

- [ ] Run the frontend checks:

```powershell
cd frontend
npm.cmd ci
npm.cmd test
npm.cmd run check
npm.cmd run build
cd ..
```

- [ ] Open the application and manually verify New Audit, JSON/PDF import, report generation, saved reports, review history, language controls, Judge Block Demo, and export.
- [ ] Confirm that README, Changelog, Release Notes, and `reports/v1.0/` show the same metrics and version.
- [ ] Confirm that Gold status remains `development_reviewed` until qualified sign-off occurs.

## Check excluded and sensitive files

```powershell
git status
git check-ignore .env venv .venv frontend/node_modules frontend/dist reports/evaluation
git ls-files | Select-String '\.env$|venv|\.venv|node_modules|__pycache__|\.sqlite|\.db'
```

The last command should not list secrets, virtual environments, dependencies, caches, or local databases. `.env.example` is expected and must contain placeholders only.

## Commit and tag

```powershell
git add .
git diff --cached --stat
git commit -m "Release Iteration 3 Demo Day v1.0.0"
git push origin main
git tag -a v1.0.0 -m "Iteration 3 Demo Day"
git push origin v1.0.0
```

If the repository already has a published `v1.0.0` tag, do not move or delete it. Use a new patch version such as `v1.0.1` and keep the product-version references consistent.

## Publish the GitHub Release

1. Open **Releases → Draft a new release**.
2. Select tag `v1.0.0`.
3. Use the title **ISO Audit Report Generator v1.0.0 — Demo Day**.
4. Copy the content of `docs/RELEASE_NOTES_v1.0.0.md` into the release description.
5. Publish the release. A short demo video is not required under the instructor's final direction.
