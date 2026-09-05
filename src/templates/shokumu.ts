import { esc, escMultiline, FONT_STACK, ul } from "../html.js";
import {
  companyRows,
  sortByPeriodDesc,
  formatDuration,
  formatMonth,
  formatPeriod,
  formatToday,
  getLabels,
} from "../labels.js";
import type { Lang, LocalizedCompany, LocalizedProject, LocalizedResume } from "../types.js";

// 職務経歴書（レバテック エンジニア向けフォーマット準拠、A4 縦）

export function renderShokumu(r: LocalizedResume, lang: Lang): string {
  const L = getLabels(lang);

  // 職務経歴欄は職歴のみ（学歴は含めない）
  const tlRows = r.workHistory.flatMap((c) => companyRows(c, lang));
  const timeline = [
    ...tlRows.map(
      (row) => `<div class="tl"><span class="tl-date">${formatMonth(row.raw ?? "", lang)}</span>${esc(row.text)}</div>`,
    ),
    r.workHistory.some((c) => !c.period.to) ? `<div class="tl"><span class="tl-date"></span>${L.toPresent}</div>` : "",
  ].join("");

  const skills = r.skills
    .map((cat) =>
      cat.items
        .map(
          (it, i) => `
        <tr>
          ${i === 0 ? `<th rowspan="${cat.items.length}">${esc(cat.category)}</th>` : ""}
          <td>・${esc(it.name)}</td>
          <td class="num">${it.years !== undefined ? `${it.years}${L.years}` : ""}</td>
          <td>${esc(it.level)}</td>
        </tr>`,
        )
        .join(""),
    )
    .join("");

  const companies = r.workHistory.map((c) => renderCompany(c, lang)).join("");

  const sideProjects = r.sideProjects?.length
    ? `<h2>■　${L.sideProjects}</h2>
       <table class="projects">
         <colgroup><col class="period"><col><col class="env"><col class="role"></colgroup>
         <tr><th>${L.period}</th><th>${L.projectAndTasks}</th><th>${L.environment}</th><th>${L.roleScale}</th></tr>
         ${r.sideProjects.map((p) => renderProject(p, lang)).join("")}
       </table>`
    : "";

  const certs = r.certifications?.length
    ? `<h2>■　${L.certifications}</h2>
       <table class="certs">${r.certifications
         .map((c) => `<tr><td class="date">${formatMonth(c.date, lang)}</td><td>${esc(c.name)}</td></tr>`)
         .join("")}</table>`
    : "";

  const selfPr = r.selfPr?.length
    ? `<h2>■　${L.selfPr}</h2>
       ${r.selfPr.map((p) => `<h3>＜${esc(p.title)}＞</h3><p>${escMultiline(p.body)}</p>`).join("")}`
    : "";

  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<title>${L.shokumuTitle.replaceAll("　", "")} - ${esc(r.profile.name)}</title>
<style>
  @page { size: A4 portrait; margin: 15mm 14mm; }
  * { box-sizing: border-box; }
  body { font-family: ${FONT_STACK}; font-size: 9.5pt; line-height: 1.55; color: #000; margin: 0; }
  h1 { font-size: 15pt; text-align: center; margin: 0 0 2px; letter-spacing: 0.1em; }
  .meta { text-align: right; font-size: 9.5pt; margin: 0; }
  .name { text-align: right; margin: 4px 0 14px; }
  h2 { font-size: 11pt; margin: 16px 0 6px; padding-bottom: 1px; border-bottom: 1px solid #000; }
  h3 { font-size: 10pt; margin: 8px 0 2px; }
  p { margin: 2px 0 6px; text-indent: 0; }
  ul { margin: 0; padding-left: 1.1em; }
  ul.plain { list-style: none; padding-left: 0.5em; }
  ul.plain li::before { content: "・"; }
  .tl { display: flex; gap: 1em; }
  .tl-date { min-width: 7.5em; }
  table { border-collapse: collapse; width: 100%; font-size: 9pt; }
  table th, table td { border: 1px solid #000; padding: 3px 5px; vertical-align: top; text-align: left; }
  table th { background: #e8e8e8; font-weight: 600; text-align: center; }
  table.skills th:first-child { width: 18%; text-align: center; vertical-align: middle; }
  table.skills td.num { width: 11%; text-align: center; white-space: nowrap; }
  table.skills th:last-child { width: 38%; }
  table.certs, table.certs td { border: none; }
  table.certs td.date { width: 9em; }
  .company { margin-top: 10px; }
  h2, .company-head, .company-meta { break-after: avoid; }
  caption { text-align: left; caption-side: top; break-after: avoid; }
  .company-head { font-weight: 600; text-decoration: underline; margin: 0 0 1px; }
  .company-meta { margin: 0 0 4px 1em; }
  table.projects col.period { width: 11%; }
  table.projects col.env { width: 20%; }
  table.projects col.role { width: 17%; }
  table.projects tr { break-inside: avoid; }
  table.projects thead { display: table-header-group; break-after: avoid; }
  .pj-period { text-align: center; }
  .pj-title { font-weight: 700; }
  .tag { font-weight: 600; }
  .note { font-size: 8.5pt; margin-top: 2px; }
  .small { font-size: 8.5pt; color: #333; }
  .end { text-align: right; margin-top: 14px; }
  .closing { margin-top: 6px; }
</style>
</head>
<body>
  <h1>${L.shokumuTitle}</h1>
  <p class="meta">${formatToday(lang)}</p>
  <p class="name">${L.name}：${esc(r.profile.name)}</p>

  ${r.summary ? `<h2>■　${L.summary}</h2><p>${escMultiline(r.summary)}</p>` : ""}

  <h2>■　${L.career}</h2>
  ${timeline}

  ${r.strengths?.length ? `<h2>■　${L.strengths}</h2>${ul(r.strengths, "plain")}` : ""}

  <h2>■　${L.skills}</h2>
  <table class="skills">
    <tr><th colspan="2">${L.skillType}</th><th>${L.skillYears}</th><th>${L.skillLevel}</th></tr>
    ${skills}
  </table>

  <h2>■　${L.workHistory}</h2>
  ${companies}
  <p class="note">${L.excerptNote}</p>

  ${sideProjects}
  ${certs}
  ${selfPr}

  ${L.end ? `<p class="end">${L.end}</p>` : ""}
  <p class="closing">${L.closing}</p>
</body>
</html>`;
}

function renderCompany(c: LocalizedCompany, lang: Lang): string {
  const L = getLabels(lang);
  const meta = [
    c.business ? `${L.business}：${esc(c.business)}` : "",
    c.capital ? `${L.capital}：${esc(c.capital)}` : "",
    c.employees ? `${L.employees}：${esc(c.employees)}` : "",
  ].filter(Boolean);

  return `
  <div class="company">
    <table class="projects">
      <caption>
        <p class="company-head">${esc(c.name)}　（${L.employmentPeriod}：${formatPeriod(c.period, lang)}）</p>
        ${meta.length ? `<p class="company-meta">${meta.join("　")}</p>` : ""}
      </caption>
      <colgroup><col class="period"><col><col class="env"><col class="role"></colgroup>
      <thead><tr>
        <th>${L.period}</th><th>${L.projectAndTasks}</th><th>${L.environment}</th><th>${L.roleScale}</th>
      </tr></thead>
      <tbody>${sortByPeriodDesc(c.projects).map((p) => renderProject(p, lang)).join("")}</tbody>
    </table>
  </div>`;
}

function renderProject(p: LocalizedProject, lang: Lang): string {
  const L = getLabels(lang);
  const env = p.environment ?? {};
  const envBlock = (label: string, items?: string[]) =>
    items?.length ? `<div><span class="tag">【${label}】</span><br>${esc(items.join(", "))}</div>` : "";

  const period = p.period
    ? `${formatMonth(p.period.from, lang)}<br>｜<br>${p.period.to ? formatMonth(p.period.to, lang) : L.present}${formatDuration(p.period, lang) ? `<br>（${formatDuration(p.period, lang)}）` : ""}`
    : "";

  return `
      <tr>
        <td class="pj-period">${period}</td>
        <td>
          <div class="pj-title">■${esc(p.title)}</div>
          ${p.url ? `<div class="small">${L.link}: ${esc(p.url)}</div>` : ""}
          ${p.overview ? `<div><span class="tag">【${L.overview}】</span><br>${escMultiline(p.overview)}</div>` : ""}
          ${p.phases?.length ? `<div><span class="tag">【${L.phases}】</span>${ul(p.phases, "plain")}</div>` : ""}
          ${p.tasks?.length ? `<div><span class="tag">【${L.tasks}】</span>${ul(p.tasks, "plain")}</div>` : ""}
          ${p.achievements?.length ? `<div><span class="tag">【${L.achievements}】</span>${ul(p.achievements, "plain")}</div>` : ""}
        </td>
        <td>
          ${envBlock(L.envOs, env.os)}
          ${envBlock(L.envLanguages, env.languages)}
          ${envBlock(L.envFrameworks, env.frameworks)}
          ${envBlock(L.envDb, env.db)}
          ${envBlock(L.envOther, env.other)}
        </td>
        <td>
          ${p.role ? `<div><span class="tag">【${L.role}】</span><br>${esc(p.role)}</div>` : ""}
          ${
            p.teamSize || p.totalSize
              ? `<div><span class="tag">【${L.scale}】</span><br>
                 ${p.teamSize ? `${L.team}：${p.teamSize}${L.people}<br>` : ""}
                 ${p.totalSize ? `${L.total}：${p.totalSize}${L.people}` : ""}</div>`
              : ""
          }
        </td>
      </tr>`;
}
