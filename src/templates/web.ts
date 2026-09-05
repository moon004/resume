import { esc, escMultiline } from "../html.js";

// エスケープした上で、テキスト中の https URL をアンカーに変換する
function linkify(s: string): string {
  return esc(s).replace(/(https?:\/\/[^\s]+)/g, '<a href="$1">$1</a>');
}
import { formatPeriod, getLabels, sortByPeriodDesc } from "../labels.js";
import type { Lang, LocalizedCompany, LocalizedResume } from "../types.js";

// 閲覧・配布用の A4 レジュメ（最大 2 ページ想定）。
// 構成は Summary / Expertise / Experience のみ。個人開発・資格・学歴・自己PR は出力しない。
// レイアウトは単一カラムの定番（Jake's Resume / Harvard 形式）をベースに、控えめなアクセントカラーで整える。

const FONT = '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, "Hiragino Sans", "Noto Sans JP", Arial, sans-serif';

export function renderWeb(r: LocalizedResume, lang: Lang): string {
  const L = getLabels(lang);
  const p = r.profile;
  const other: Lang = lang === "ja" ? "en" : "ja";

  const link = (url: string, label: string) => `<a href="${esc(url)}">${esc(label)}</a>`;
  const contacts = [
    p.address ? esc(p.address) : "",
    p.mobile || p.phone ? esc(p.mobile || p.phone) : "",
    p.email ? link(`mailto:${p.email}`, p.email) : "",
  ].filter(Boolean);
  // URL は途中で折り返さないよう 2 行目にまとめる
  const links = [
    p.linkedin ? link(p.linkedin, p.linkedin.replace(/\/$/, "")) : "",
    p.github ? link(p.github, p.github.replace(/\/$/, "")) : "",
    p.blog ? link(p.blog, p.blog.replace(/\/$/, "")) : "",
  ].filter(Boolean);

  // 太字 = 現職スタック / 薄字 = 経験浅め（凡例は見出し下に表示）
  const skillName = (it: { name: string; emphasis?: "bold" | "light" }) =>
    it.emphasis === "bold"
      ? `<span class="sk-b">${esc(it.name)}</span>`
      : it.emphasis === "light"
        ? `<span class="sk-l">${esc(it.name)}</span>`
        : esc(it.name);
  const expertise =
    `<div class="sk-note">${L.skillsNote}</div>` +
    r.skills
      .map(
        (cat) => `
      <div class="row">
        <div class="row-label">${esc(cat.category)}</div>
        <div class="row-body">${cat.items.map(skillName).join(", ")}</div>
      </div>`,
      )
      .join("");

  // 新しい会社が上に来るよう逆順で出力
  const experience = [...r.workHistory].reverse().map((c) => renderCompany(c, lang)).join("");

  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(p.name)}${p.title ? ` — ${esc(p.title)}` : ""}</title>
<style>
  @page { size: A4 portrait; margin: 10.5mm 15mm 11mm; }
  :root { --fg: #1a1a1a; --muted: #5f6368; --line: #d9d9d6; --accent: #1f5f8b; }
  * { box-sizing: border-box; }
  html, body { margin: 0; }
  body { background: #ececea; color: var(--fg); font-family: ${FONT}; font-size: 9.3pt; line-height: 1.43; }
  a { color: inherit; text-decoration: none; }
  .top { width: 210mm; margin: 18px auto -6px; display: flex; justify-content: flex-end; font-size: 12px; }
  .top a { color: var(--accent); }
  .sheet { width: 210mm; min-height: 297mm; margin: 12px auto 32px; padding: 10.5mm 15mm 11mm; background: #fff; box-shadow: 0 2px 14px rgba(0,0,0,.12); }

  header { text-align: center; padding-bottom: 8px; }
  h1 { font-size: 19pt; font-weight: 700; letter-spacing: .02em; margin: 0; line-height: 1.15; }
  .title { color: var(--accent); font-size: 10.5pt; font-weight: 500; margin-top: 3px; }
  .contacts { color: var(--muted); font-size: 8.8pt; margin-top: 3px; }
  .contacts span + span::before { content: "  ·  "; white-space: pre; }
  .contacts a { color: var(--accent); white-space: nowrap; }

  section { margin-top: 9px; }
  h2 {
    font-size: 9.3pt; font-weight: 700; text-transform: uppercase; letter-spacing: .12em;
    margin: 0 0 6px; padding-bottom: 3px; border-bottom: 1.2px solid var(--fg);
  }
  html[lang="ja"] h2 { letter-spacing: .25em; }
  p { margin: 0; }
  .summary { font-size: 9.4pt; }

  .row { display: grid; grid-template-columns: 42mm 1fr; gap: 0 8px; padding: 2px 0; }
  .row-label { font-weight: 600; }
  .row-body { color: var(--fg); }
  .sk-b { font-weight: 650; }
  .sk-l { color: var(--muted); }
  .sk-note { color: var(--muted); font-size: 8pt; margin-bottom: 4px; }

  .company { margin-top: 9px; }
  .company:first-of-type { margin-top: 0; }
  .line { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
  .company-name { font-size: 10.2pt; font-weight: 700; }
  .period { color: var(--muted); font-size: 9pt; white-space: nowrap; font-variant-numeric: tabular-nums; }
  .role { font-style: italic; font-weight: 500; flex-shrink: 0; }
  .business { color: var(--muted); font-size: 8.8pt; text-align: right; }
  .project { margin-top: 3.5px; break-inside: avoid-page; }
  .project-title { font-weight: 600; font-size: 9.6pt; }
  .overview { color: var(--muted); font-size: 9.2pt; margin: 1px 0 2px; }
  ul { margin: 2px 0 0; padding-left: 14px; }
  li { margin: 1px 0; padding-left: 2px; }
  li::marker { color: var(--muted); }
  .tech { color: var(--muted); font-size: 8.4pt; margin-top: 4px; }
  ul.soft { margin: 0; }
  ul.soft a { color: var(--accent); }
  .tech b { font-weight: 600; color: var(--fg); }

  @media print {
    body { background: #fff; }
    .top { display: none; }
    .sheet { width: auto; min-height: 0; margin: 0; padding: 0; box-shadow: none; }
    a { color: inherit; }
    .contacts a, ul.soft a { color: var(--accent); }
  }
  @media screen and (max-width: 820px) {
    .sheet, .top { width: auto; margin-left: 0; margin-right: 0; }
    .sheet { padding: 20px 16px; }
    .line { flex-wrap: wrap; }
    .business { text-align: left; }
  }
</style>
</head>
<body>
<div class="top"><a href="web-${other}.html">${other === "ja" ? "日本語" : "English"}</a></div>
<div class="sheet">
  <header>
    <h1>${esc(p.name)}</h1>
    ${p.title ? `<div class="title">${esc(p.title)}</div>` : ""}
    ${contacts.length ? `<div class="contacts">${contacts.map((c) => `<span>${c}</span>`).join("")}</div>` : ""}
    ${links.length ? `<div class="contacts">${links.map((c) => `<span>${c}</span>`).join("")}</div>` : ""}
  </header>

  ${r.summary ? `<section><h2>${L.summary}</h2><p class="summary">${escMultiline(r.summary.trim())}</p></section>` : ""}

  <section><h2>${L.experience}</h2>${experience}</section>

  <section><h2>${L.expertise}</h2>${expertise}</section>

  ${r.softSkills?.length ? `<section><h2>${L.softSkillsHeading}</h2><ul class="soft">${r.softSkills.map((x) => `<li>${linkify(x)}</li>`).join("")}</ul></section>` : ""}
</div>
</body>
</html>`;
}

// A4 2 ページに収めるため、過去の会社は 3、現職は 5 バレットまでを表示する（並び順 = 優先度）
const MAX_BULLETS_PAST = 3;
const MAX_BULLETS_CURRENT = 5;

export interface ProjectView {
  title: string;
  periodText?: string;
  overview?: string;
  bullets: string[];
}

export interface CompanyView {
  name: string;
  periodText: string;
  roles: string;
  business?: string;
  tech: string[];
  multi: boolean;
  projects: ProjectView[];
}

// HTML / Markdown 共通のビュー。バレット数の上限などの取捨選択はここで行う
export function companyView(c: LocalizedCompany, lang: Lang): CompanyView {
  const maxBullets = c.period.to ? MAX_BULLETS_PAST : MAX_BULLETS_CURRENT;
  const projects = sortByPeriodDesc(c.projects);
  const tech = [
    ...new Set(
      projects.flatMap((p) => {
        const e = p.environment ?? {};
        return [...(e.languages ?? []), ...(e.frameworks ?? []), ...(e.db ?? []), ...(e.other ?? []), ...(e.os ?? [])];
      }),
    ),
  ];
  return {
    name: c.name,
    periodText: formatPeriod(c.period, lang),
    roles: [...new Set(projects.map((p) => p.role).filter(Boolean))].join(" / "),
    business: c.business,
    tech,
    multi: projects.length > 1,
    projects: projects.map((p) => ({
      title: p.title,
      periodText: p.period ? formatPeriod(p.period, lang) : undefined,
      overview: p.overview,
      bullets: [...(p.tasks ?? []), ...(p.achievements ?? [])].slice(0, maxBullets),
    })),
  };
}

function renderCompany(c: LocalizedCompany, lang: Lang): string {
  const L = getLabels(lang);
  const v = companyView(c, lang);

  const projects = v.projects
    .map(
      (p) => `
      <div class="project">
        ${v.multi ? `<div class="line"><div class="project-title">${esc(p.title)}</div>${p.periodText ? `<div class="period">${p.periodText}</div>` : ""}</div>` : ""}
        ${p.overview ? `<div class="overview">${esc(p.overview)}</div>` : ""}
        ${p.bullets.length ? `<ul>${p.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>` : ""}
      </div>`,
    )
    .join("");

  return `
    <div class="company">
      <div class="line">
        <div class="company-name">${esc(v.name)}</div>
        <div class="period">${v.periodText}</div>
      </div>
      <div class="line">
        <div class="role">${esc(v.roles)}</div>
        ${v.business ? `<div class="business">${esc(v.business)}</div>` : ""}
      </div>
      ${projects}
      ${v.tech.length ? `<div class="tech"><b>${L.tech}:</b> ${esc(v.tech.join(", "))}</div>` : ""}
    </div>`;
}
