import { esc, escMultiline } from "../html.js";
import { formatDuration, formatMonth, formatPeriod, getLabels } from "../labels.js";
import type { Lang, LocalizedProject, LocalizedResume } from "../types.js";

// 閲覧用の 1 ページ HTML（画面向け、印刷にも対応）

export function renderWeb(r: LocalizedResume, lang: Lang): string {
  const L = getLabels(lang);
  const p = r.profile;
  const other: Lang = lang === "ja" ? "en" : "ja";

  const contacts = [
    p.email ? `<a href="mailto:${esc(p.email)}">${esc(p.email)}</a>` : "",
    p.github ? `<a href="${esc(p.github)}">${esc(p.github.replace(/^https?:\/\//, ""))}</a>` : "",
    p.website ? `<a href="${esc(p.website)}">${esc(p.website.replace(/^https?:\/\//, ""))}</a>` : "",
    p.address ? `<span>${esc(p.address)}</span>` : "",
  ].filter(Boolean);

  const skills = r.skills
    .map(
      (cat) => `
      <div class="skill-row">
        <div class="skill-cat">${esc(cat.category)}</div>
        <div class="chips">${cat.items
          .map(
            (it) =>
              `<span class="chip" title="${esc(it.level)}">${esc(it.name)}${it.years !== undefined ? `<b>${it.years}${lang === "ja" ? "年" : "y"}</b>` : ""}</span>`,
          )
          .join("")}</div>
      </div>`,
    )
    .join("");

  const companies = r.workHistory
    .map(
      (c) => `
      <article class="company">
        <header>
          <h3>${esc(c.name)}</h3>
          <div class="muted">${formatPeriod(c.period, lang)} · ${formatDuration(c.period, lang)}${c.business ? ` · ${esc(c.business)}` : ""}</div>
        </header>
        ${c.projects.map((pj) => renderProject(pj, lang)).join("")}
      </article>`,
    )
    .join("");

  const simpleList = (items: { date: string; name: string }[] | undefined, title: string) =>
    items?.length
      ? `<section><h2>${title}</h2><dl class="dates">${items
          .map((i) => `<dt>${formatMonth(i.date, lang)}</dt><dd>${esc(i.name)}</dd>`)
          .join("")}</dl></section>`
      : "";

  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(p.name)}${p.title ? ` — ${esc(p.title)}` : ""}</title>
<style>
  :root {
    --bg: #fbfbf9; --fg: #1d1d1b; --muted: #6b6b66; --line: #e4e4df;
    --accent: #1f5f8b; --chip: #eef2f5; --card: #ffffff;
  }
  @media (prefers-color-scheme: dark) {
    :root { --bg: #141416; --fg: #ececea; --muted: #9a9a94; --line: #2b2b2f; --accent: #7fb4dc; --chip: #1f2227; --card: #1a1a1d; }
  }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    margin: 0; background: var(--bg); color: var(--fg);
    font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans", "Noto Sans JP", "Segoe UI", Roboto, sans-serif;
    font-size: 15px; line-height: 1.7;
  }
  a { color: var(--accent); text-decoration: none; }
  a:hover { text-decoration: underline; }
  .wrap { max-width: 860px; margin: 0 auto; padding: 48px 24px 80px; }
  .top { display: flex; justify-content: flex-end; font-size: 13px; margin-bottom: 8px; }
  header.hero { border-bottom: 1px solid var(--line); padding-bottom: 24px; margin-bottom: 32px; }
  header.hero h1 { font-size: 34px; margin: 0; letter-spacing: 0.01em; line-height: 1.2; }
  header.hero .kana { color: var(--muted); font-size: 14px; margin-top: 2px; }
  header.hero .role { font-size: 17px; color: var(--accent); margin: 8px 0 0; }
  .contacts { display: flex; flex-wrap: wrap; gap: 6px 18px; margin-top: 12px; font-size: 14px; color: var(--muted); }
  section { margin-bottom: 36px; }
  h2 {
    font-size: 13px; text-transform: uppercase; letter-spacing: 0.14em; color: var(--muted);
    margin: 0 0 14px; padding-bottom: 6px; border-bottom: 1px solid var(--line);
  }
  h3 { font-size: 19px; margin: 0; }
  .muted { color: var(--muted); font-size: 13.5px; }
  p { margin: 0 0 10px; }
  ul { margin: 6px 0 0; padding-left: 1.2em; }
  li { margin: 2px 0; }
  .strengths li { margin: 4px 0; }
  .skill-row { display: grid; grid-template-columns: 150px 1fr; gap: 12px; padding: 8px 0; border-bottom: 1px dashed var(--line); align-items: baseline; }
  .skill-row:last-child { border-bottom: none; }
  .skill-cat { font-weight: 600; font-size: 14px; }
  .chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .chip { background: var(--chip); border-radius: 999px; padding: 2px 11px; font-size: 13.5px; white-space: nowrap; }
  .chip b { font-weight: 500; color: var(--muted); margin-left: 5px; font-size: 12px; }
  .company { margin-bottom: 28px; }
  .company > header { margin-bottom: 10px; }
  .project {
    background: var(--card); border: 1px solid var(--line); border-radius: 10px;
    padding: 16px 18px; margin: 10px 0 0;
  }
  .project h4 { margin: 0; font-size: 16px; }
  .project .meta { display: flex; flex-wrap: wrap; gap: 4px 14px; margin: 2px 0 8px; font-size: 13px; color: var(--muted); }
  .project .label { font-weight: 600; font-size: 13px; margin-top: 8px; color: var(--fg); }
  .tech { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 10px; }
  .tech span { font-size: 12px; border: 1px solid var(--line); border-radius: 6px; padding: 1px 7px; color: var(--muted); }
  dl.dates { display: grid; grid-template-columns: max-content 1fr; gap: 4px 18px; margin: 0; }
  dl.dates dt { color: var(--muted); font-variant-numeric: tabular-nums; }
  dl.dates dd { margin: 0; }
  .pr h3 { font-size: 16px; margin: 12px 0 4px; }
  @media (max-width: 600px) { .skill-row { grid-template-columns: 1fr; gap: 4px; } header.hero h1 { font-size: 28px; } }
  @media print {
    body { background: #fff; color: #000; font-size: 11pt; }
    .wrap { max-width: none; padding: 0; }
    .top { display: none; }
    .project { break-inside: avoid; border-color: #bbb; }
    a { color: inherit; }
  }
</style>
</head>
<body>
<div class="wrap">
  <div class="top"><a href="web-${other}.html">${other === "ja" ? "日本語" : "English"}</a></div>

  <header class="hero">
    <h1>${esc(p.name)}</h1>
    ${p.kana && lang === "ja" ? `<div class="kana">${esc(p.kana)}</div>` : ""}
    ${p.title ? `<p class="role">${esc(p.title)}</p>` : ""}
    ${contacts.length ? `<div class="contacts">${contacts.join("")}</div>` : ""}
  </header>

  ${r.summary ? `<section><h2>${L.summary}</h2><p>${escMultiline(r.summary)}</p></section>` : ""}

  ${r.strengths?.length ? `<section><h2>${L.strengths}</h2><ul class="strengths">${r.strengths.map((s) => `<li>${esc(s)}</li>`).join("")}</ul></section>` : ""}

  <section><h2>${L.skills}</h2>${skills}</section>

  <section><h2>${L.workHistory}</h2>${companies}</section>

  ${simpleList(r.certifications, L.certifications)}
  ${simpleList(r.education, L.education)}

  ${
    r.selfPr?.length
      ? `<section class="pr"><h2>${L.selfPr}</h2>${r.selfPr.map((s) => `<h3>${esc(s.title)}</h3><p>${escMultiline(s.body)}</p>`).join("")}</section>`
      : ""
  }
</div>
</body>
</html>`;
}

function renderProject(pj: LocalizedProject, lang: Lang): string {
  const L = getLabels(lang);
  const env = pj.environment ?? {};
  const tech = [...(env.languages ?? []), ...(env.frameworks ?? []), ...(env.db ?? []), ...(env.other ?? []), ...(env.os ?? [])];
  const meta = [
    pj.period ? `${formatPeriod(pj.period, lang)} (${formatDuration(pj.period, lang)})` : "",
    pj.role ? `${L.role}: ${esc(pj.role)}` : "",
    pj.teamSize ? `${L.team}: ${pj.teamSize}${L.people}` : "",
    pj.totalSize ? `${L.total}: ${pj.totalSize}${L.people}` : "",
  ].filter(Boolean);

  return `
        <div class="project">
          <h4>${esc(pj.title)}</h4>
          ${meta.length ? `<div class="meta">${meta.map((m) => `<span>${m}</span>`).join("")}</div>` : ""}
          ${pj.overview ? `<p>${escMultiline(pj.overview)}</p>` : ""}
          ${pj.phases?.length ? `<div class="label">${L.phases}</div><div class="muted">${pj.phases.map(esc).join(" / ")}</div>` : ""}
          ${pj.tasks?.length ? `<div class="label">${L.tasks}</div><ul>${pj.tasks.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
          ${pj.achievements?.length ? `<div class="label">${L.achievements}</div><ul>${pj.achievements.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
          ${tech.length ? `<div class="tech">${tech.map((t) => `<span>${esc(t)}</span>`).join("")}</div>` : ""}
        </div>`;
}
