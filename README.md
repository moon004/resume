# resume

Single-source resume generator. Edit `data/resume.yml`, run one command, get 履歴書 / 職務経歴書 / a web page — as HTML, PDF and Excel, in Japanese and English.

## Usage

```bash
npm install
npm run build                                   # everything → out/
npm run build -- --doc shokumu --format pdf --lang ja
npm run build -- --doc web --format html
```

| `--doc`     | What                                                         | `html` | `pdf` | `xlsx` |
| ----------- | ------------------------------------------------------------ | ------ | ----- | ------ |
| `shokumu`   | 職務経歴書 — Levtech engineer format (A4 portrait)              | ✓      | ✓     | ✓ (structured sheet) |
| `rirekisho` | 履歴書 — Levtech Excel format (A4 landscape)                   | ✓      | ✓     | ✓ (fills `templates/rirekisho.xlsx`) |
| `web`       | A4 résumé (Summary · Expertise · Experience), single-column  | ✓      | ✓     | –      |

`--lang ja,en` (default both). Output files: `out/<doc>-<lang>.<ext>`.

## Updating your resume

Everything lives in [data/resume.yml](data/resume.yml). Strings can be written once (shared across languages) or per-language:

```yaml
role: { ja: "バックエンドエンジニア", en: "Backend Engineer" }
```

- New skill → add one item under `skills`.
- New project → add under the company's `projects`; new job → append to `workHistory` (omit `period.to` for the current one).
- 履歴書 職歴 rows (入社 / 退社 / 現在に至る) are derived from `workHistory`; 学歴 from `education`.
- Rebuild and every output updates.

## Structure

- `data/resume.yml` — the only file you edit
- `src/templates/shokumu.ts` / `rirekisho.ts` / `web.ts` — HTML templates, `(resume, lang) => string`
- `src/render/pdf.ts` — HTML → PDF via headless Chrome (layout follows each template's `@page`)
- `src/render/xlsx-rirekisho.ts` — writes into the Levtech 履歴書 template; `xlsx-shokumu.ts` — 職務経歴書 sheet
- `src/labels.ts` — ja/en headings, date and period formatting, 学歴・職歴 timeline
- `templates/rirekisho.xlsx` — the Levtech 履歴書 format (original, unmodified)
- `out/` — generated files (gitignored)
