import { esc, escMultiline, FONT_STACK } from "../html.js";
import { buildTimeline, formatBirthDate, formatToday, getLabels, splitYm, type TimelineRow } from "../labels.js";
import type { Lang, LocalizedResume } from "../types.js";

// 履歴書（レバテック Excel フォーマット準拠、A4 横）
// 左: 個人情報 + 学歴・職歴 14 行 / 右: 学歴・職歴 続き 9 行 + 免許・資格 7 行 + 備考

export const TIMELINE_LEFT = 14;
export const TIMELINE_RIGHT = 9;
export const LICENSE_ROWS = 7;

// 左右の枠に収まるよう行を分割する。溢れた分は警告して切り捨てる
export function splitTimeline(rows: TimelineRow[]): { left: TimelineRow[]; right: TimelineRow[] } {
  const max = TIMELINE_LEFT + TIMELINE_RIGHT;
  if (rows.length > max) {
    console.warn(`[rirekisho] 学歴・職歴が ${rows.length} 行あり、${max} 行を超えた分は出力されません`);
  }
  return { left: rows.slice(0, TIMELINE_LEFT), right: rows.slice(TIMELINE_LEFT, max) };
}

export function renderRirekisho(r: LocalizedResume, lang: Lang): string {
  const L = getLabels(lang);
  const p = r.profile;
  const { left, right } = splitTimeline(buildTimeline(r, lang));

  const tlRow = (row: TimelineRow | undefined) => {
    if (!row) return `<tr><td></td><td></td><td colspan="4"></td></tr>`;
    const y = row.year ?? "";
    const m = row.month ?? "";
    const cls = row.kind === "heading" ? ' class="center"' : row.kind === "end" ? ' class="right"' : "";
    return `<tr><td class="center">${y}</td><td class="center">${m}</td><td colspan="4"${cls}>${esc(row.text)}</td></tr>`;
  };
  const tlRowR = (row: TimelineRow | undefined) => {
    if (!row) return `<tr><td></td><td></td><td></td></tr>`;
    const cls = row.kind === "heading" ? ' class="center"' : row.kind === "end" ? ' class="right"' : "";
    return `<tr><td class="center">${row.year ?? ""}</td><td class="center">${row.month ?? ""}</td><td${cls}>${esc(row.text)}</td></tr>`;
  };

  const licenses = Array.from({ length: LICENSE_ROWS }, (_, i) => {
    const c = r.certifications?.[i];
    if (!c) return `<tr><td></td><td></td><td></td></tr>`;
    const { y, m } = splitYm(c.date);
    return `<tr><td class="center">${y}</td><td class="center">${m ?? ""}</td><td>${esc(c.name)}</td></tr>`;
  }).join("");
  if ((r.certifications?.length ?? 0) > LICENSE_ROWS) {
    console.warn(`[rirekisho] 免許・資格が ${LICENSE_ROWS} 行を超えた分は出力されません`);
  }

  const spouse = p.spouse === undefined ? "" : p.spouse ? L.spouseYes : L.spouseNo;

  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<title>${L.rirekishoTitle.replaceAll("　", "")} - ${esc(p.name)}</title>
<style>
  @page { size: A4 landscape; margin: 9mm 10mm; }
  * { box-sizing: border-box; }
  body { font-family: ${FONT_STACK}; font-size: 9pt; color: #000; margin: 0; }
  .sheet { display: grid; grid-template-columns: 1fr 1fr; gap: 7mm; }
  table { border-collapse: collapse; width: 100%; table-layout: fixed; }
  td, th { border: 1px solid #000; padding: 0 4px; vertical-align: middle; font-weight: normal; text-align: left; }
  tr { height: 6.3mm; }
  tr.tall { height: 12.6mm; }
  th { text-align: center; font-size: 8.5pt; }
  .label { font-size: 8pt; text-align: center; }
  .center { text-align: center; }
  .right { text-align: right; }
  .title { font-size: 15pt; font-weight: 600; border: none; white-space: nowrap; }
  .date { border: none; text-align: right; font-size: 8.5pt; }
  .noborder { border: none; }
  .photo { text-align: center; font-size: 7.5pt; color: #666; line-height: 1.3; }
  .small { font-size: 8pt; }
  .remarks { vertical-align: top; padding: 4px 6px; white-space: pre-wrap; height: ${6.3 * 7}mm; }
</style>
</head>
<body>
<div class="sheet">

  <table class="left">
    <colgroup><col style="width:13.8%"><col style="width:8%"><col style="width:29.6%"><col style="width:13.8%"><col style="width:12.4%"><col style="width:22.4%"></colgroup>
    <tr class="tall">
      <td class="title" colspan="3">${L.rirekishoTitle}</td>
      <td class="date" colspan="2">${formatToday(lang)}</td>
      <td class="noborder"></td>
    </tr>
    <tr>
      <td class="label">${L.kana}</td>
      <td colspan="3" class="small">${esc(p.kana)}</td>
      <td class="center" rowspan="2">${esc(p.gender)}</td>
      <td class="photo" rowspan="3">写真<br>(40×30mm)</td>
    </tr>
    <tr class="tall">
      <td class="label">${L.fullName}</td>
      <td colspan="3" style="font-size:13pt">${esc(p.name)}</td>
    </tr>
    <tr>
      <td class="label">${L.birthDate}</td>
      <td colspan="4">${p.birthDate ? formatBirthDate(p.birthDate, lang) : ""}</td>
    </tr>
    <tr>
      <td class="label">${L.kana}</td>
      <td colspan="5" class="small">${esc(p.addressKana)}</td>
    </tr>
    <tr>
      <td class="label" rowspan="2">${L.address}</td>
      <td colspan="5">${p.postalCode ? `（〒${esc(p.postalCode)}）` : ""}</td>
    </tr>
    <tr class="tall">
      <td colspan="5" style="vertical-align:middle">${escMultiline(p.address)}</td>
    </tr>
    <tr>
      <td class="label">${L.phone}</td>
      <td colspan="2">${esc(p.phone)}</td>
      <td class="label">${L.mobile}</td>
      <td colspan="2">${esc(p.mobile)}</td>
    </tr>
    <tr>
      <td class="label">${L.email}</td>
      <td colspan="5">${esc(p.email)}</td>
    </tr>
    <tr>
      <td class="label">${L.spouse}</td>
      <td colspan="2" class="center">${spouse}</td>
      <td class="label">${L.dependents}</td>
      <td colspan="2" class="center">${p.dependents !== undefined ? `${p.dependents}${lang === "ja" ? "人" : ""}` : ""}</td>
    </tr>
    <tr>
      <th>${L.year}</th><th>${L.month}</th><th colspan="4">${L.eduAndWork}</th>
    </tr>
    ${Array.from({ length: TIMELINE_LEFT }, (_, i) => tlRow(left[i])).join("")}
  </table>

  <table class="right">
    <colgroup><col style="width:14.2%"><col style="width:8.3%"><col style="width:77.5%"></colgroup>
    <tr class="tall"><td class="noborder" colspan="3"></td></tr>
    <tr><th>${L.year}</th><th>${L.month}</th><th>${L.eduAndWork}</th></tr>
    ${Array.from({ length: TIMELINE_RIGHT }, (_, i) => tlRowR(right[i])).join("")}
    <tr><th>${L.year}</th><th>${L.month}</th><th>${L.licenses}</th></tr>
    ${licenses}
    <tr><th colspan="3">${L.remarks}</th></tr>
    <tr><td colspan="3" class="remarks">${esc(r.remarks)}</td></tr>
  </table>

</div>
</body>
</html>`;
}
