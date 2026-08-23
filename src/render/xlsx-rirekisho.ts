import ExcelJS from "exceljs";
import { buildTimeline, formatBirthDate, formatToday, getLabels, splitYm, type TimelineRow } from "../labels.js";
import { LICENSE_ROWS, splitTimeline, TIMELINE_LEFT, TIMELINE_RIGHT } from "../templates/rirekisho.js";
import type { Lang, LocalizedResume } from "../types.js";

const TEMPLATE = new URL("../../templates/rirekisho.xlsx", import.meta.url);

// レバテックの履歴書 Excel フォーマット（シート「原本」）にデータを流し込む
export async function renderRirekishoXlsx(r: LocalizedResume, lang: Lang, outPath: string): Promise<void> {
  const L = getLabels(lang);
  const p = r.profile;
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(TEMPLATE.pathname);
  const ws = wb.worksheets[0];

  const set = (addr: string, value: string | number | undefined, horizontal?: "left" | "center" | "right") => {
    const cell = ws.getCell(addr);
    cell.value = value ?? "";
    if (horizontal) cell.alignment = { ...cell.alignment, horizontal };
  };

  // 英語版は見出しセルも差し替える
  if (lang === "en") {
    set("C2", L.rirekishoTitle);
    set("C4", L.kana);
    set("C5", L.fullName);
    set("C7", L.birthDate);
    set("C8", L.kana);
    set("C9", L.address);
    set("C12", L.phone);
    set("F12", L.mobile);
    set("C13", L.email);
    set("C14", L.spouse);
    set("F14", L.dependents);
    for (const a of ["C15", "K4", "K14"]) set(a, L.year);
    for (const a of ["D15", "L4", "L14"]) set(a, L.month);
    for (const a of ["E15", "M4"]) set(a, L.eduAndWork);
    set("M14", L.licenses);
    set("K22", L.remarks);
  }

  set("E3", `${formatToday(lang)}　`);
  set("D4", p.kana);
  set("D5", p.name);
  set("G4", p.gender);
  set("D7", p.birthDate ? formatBirthDate(p.birthDate, lang) : "");
  set("D8", p.addressKana);
  set("D9", p.postalCode ? `（〒${p.postalCode}）` : "");
  set("C10", p.address);
  set("D12", p.phone);
  set("G12", p.mobile);
  set("D13", p.email);
  set("D14", p.spouse === undefined ? "" : p.spouse ? L.spouseYes : L.spouseNo);
  set("G14", p.dependents !== undefined ? `${p.dependents}${lang === "ja" ? "人" : ""}` : "");

  const { left, right } = splitTimeline(buildTimeline(r, lang));
  const writeRow = (row: TimelineRow | undefined, y: string, m: string, t: string) => {
    if (!row) return;
    set(y, row.year);
    set(m, row.month);
    set(t, row.text, row.kind === "heading" ? "center" : row.kind === "end" ? "right" : "left");
  };
  for (let i = 0; i < TIMELINE_LEFT; i++) writeRow(left[i], `C${16 + i}`, `D${16 + i}`, `E${16 + i}`);
  for (let i = 0; i < TIMELINE_RIGHT; i++) writeRow(right[i], `K${5 + i}`, `L${5 + i}`, `M${5 + i}`);

  for (let i = 0; i < LICENSE_ROWS; i++) {
    const c = r.certifications?.[i];
    if (!c) continue;
    const { y, m } = splitYm(c.date);
    set(`K${15 + i}`, y);
    set(`L${15 + i}`, m);
    set(`M${15 + i}`, c.name);
  }

  set("K23", r.remarks);
  ws.getCell("K23").alignment = { ...ws.getCell("K23").alignment, wrapText: true, vertical: "top" };

  await wb.xlsx.writeFile(outPath);
}
