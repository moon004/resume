import ExcelJS from "exceljs";
import { companyRows, formatDuration, formatMonth, formatPeriod, formatToday, getLabels } from "../labels.js";
import type { Lang, LocalizedProject, LocalizedResume } from "../types.js";

// 職務経歴書の Excel 出力。Word フォーマットの章立てとテーブル構成をそのままシートに展開する
export async function renderShokumuXlsx(r: LocalizedResume, lang: Lang, outPath: string): Promise<void> {
  const L = getLabels(lang);
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(L.shokumuTitle.replaceAll("　", ""), {
    pageSetup: { paperSize: 9, orientation: "portrait", fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  });
  ws.columns = [{ width: 14 }, { width: 72 }, { width: 30 }, { width: 24 }];

  const thin = { style: "thin" as const };
  const border = { top: thin, left: thin, bottom: thin, right: thin };
  const wrap = (row: ExcelJS.Row) => row.eachCell({ includeEmpty: true }, (c) => (c.alignment = { wrapText: true, vertical: "top" }));

  const blank = () => ws.addRow([]);
  const heading = (text: string) => {
    blank();
    const row = ws.addRow([`■　${text}`]);
    row.font = { bold: true, size: 12 };
    ws.mergeCells(row.number, 1, row.number, 4);
  };
  const para = (text: string) => {
    const row = ws.addRow([text]);
    ws.mergeCells(row.number, 1, row.number, 4);
    wrap(row);
  };
  const tableHeader = (cells: string[]) => {
    const row = ws.addRow(cells);
    row.font = { bold: true };
    row.eachCell((c) => {
      c.border = border;
      c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE8E8E8" } };
      c.alignment = { horizontal: "center", vertical: "middle" };
    });
  };
  const tableRow = (cells: (string | number)[]) => {
    const row = ws.addRow(cells);
    row.eachCell({ includeEmpty: true }, (c) => (c.border = border));
    wrap(row);
    return row;
  };
  const bullets = (items?: string[]) => (items ?? []).map((i) => `・${i}`).join("\n");
  const section = (label: string, body: string) => (body ? `【${label}】\n${body}` : "");

  // ヘッダ
  const title = ws.addRow([L.shokumuTitle]);
  title.font = { bold: true, size: 16 };
  title.alignment = { horizontal: "center" };
  ws.mergeCells(1, 1, 1, 4);
  const date = ws.addRow(["", "", "", formatToday(lang)]);
  date.alignment = { horizontal: "right" };
  const name = ws.addRow(["", "", "", `${L.name}：${r.profile.name}`]);
  name.alignment = { horizontal: "right" };

  if (r.summary) {
    heading(L.summary);
    para(r.summary);
  }

  heading(L.career);
  for (const row of r.workHistory.flatMap((c) => companyRows(c, lang))) {
    ws.addRow([formatMonth(row.raw ?? "", lang), row.text]);
  }
  if (r.workHistory.some((c) => !c.period.to)) ws.addRow(["", L.toPresent]);

  if (r.strengths?.length) {
    heading(L.strengths);
    for (const s of r.strengths) para(`・${s}`);
  }

  heading(L.skills);
  tableHeader([L.skillType, "", L.skillYears, L.skillLevel]);
  for (const cat of r.skills) {
    const start = ws.rowCount + 1;
    for (const it of cat.items) {
      tableRow([cat.category, `・${it.name}`, it.years !== undefined ? `${it.years}${L.years}` : "", it.level ?? ""]);
    }
    if (cat.items.length > 1) ws.mergeCells(start, 1, ws.rowCount, 1);
    ws.getCell(start, 1).alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  }

  // 開発経歴・個人開発で共通のプロジェクト行
  const projectRow = (p: LocalizedProject) => {
    const env = p.environment ?? {};
    const period = p.period
      ? `${formatMonth(p.period.from, lang)}\n｜\n${p.period.to ? formatMonth(p.period.to, lang) : L.present}${formatDuration(p.period, lang) ? `\n（${formatDuration(p.period, lang)}）` : ""}`
      : "";
    const body = [
      `■${p.title}`,
      p.url ? `${L.link}: ${p.url}` : "",
      section(L.overview, p.overview ?? ""),
      section(L.phases, bullets(p.phases)),
      section(L.tasks, bullets(p.tasks)),
      section(L.achievements, bullets(p.achievements)),
    ]
      .filter(Boolean)
      .join("\n");
    const envText = [
      section(L.envOs, (env.os ?? []).join(", ")),
      section(L.envLanguages, (env.languages ?? []).join(", ")),
      section(L.envFrameworks, (env.frameworks ?? []).join(", ")),
      section(L.envDb, (env.db ?? []).join(", ")),
      section(L.envOther, (env.other ?? []).join(", ")),
    ]
      .filter(Boolean)
      .join("\n");
    const scale = [
      p.teamSize ? `${L.team}：${p.teamSize}${L.people}` : "",
      p.totalSize ? `${L.total}：${p.totalSize}${L.people}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    const roleText = [section(L.role, p.role ?? ""), section(L.scale, scale)].filter(Boolean).join("\n");
    const row = tableRow([period, body, envText, roleText]);
    row.getCell(1).alignment = { horizontal: "center", vertical: "top", wrapText: true };
  };

  heading(L.workHistory);
  for (const c of r.workHistory) {
    const head = ws.addRow([`${c.name}　（${L.employmentPeriod}：${formatPeriod(c.period, lang)}）`]);
    head.font = { bold: true, underline: true };
    ws.mergeCells(head.number, 1, head.number, 4);
    const meta = [
      c.business ? `${L.business}：${c.business}` : "",
      c.capital ? `${L.capital}：${c.capital}` : "",
      c.employees ? `${L.employees}：${c.employees}` : "",
    ].filter(Boolean);
    if (meta.length) {
      const m = ws.addRow([`　${meta.join("　")}`]);
      ws.mergeCells(m.number, 1, m.number, 4);
    }
    tableHeader([L.period, L.projectAndTasks, L.environment, L.roleScale]);
    for (const p of c.projects) projectRow(p);
    blank();
  }
  para(L.excerptNote);

  if (r.sideProjects?.length) {
    heading(L.sideProjects);
    tableHeader([L.period, L.projectAndTasks, L.environment, L.roleScale]);
    for (const p of r.sideProjects) projectRow(p);
  }

  if (r.certifications?.length) {
    heading(L.certifications);
    for (const c of r.certifications) ws.addRow([formatMonth(c.date, lang), c.name]);
  }

  if (r.selfPr?.length) {
    heading(L.selfPr);
    for (const s of r.selfPr) {
      const t = ws.addRow([`＜${s.title}＞`]);
      t.font = { bold: true };
      ws.mergeCells(t.number, 1, t.number, 4);
      para(s.body);
    }
  }

  blank();
  if (L.end) {
    const end = ws.addRow(["", "", "", L.end]);
    end.alignment = { horizontal: "right" };
  }
  para(L.closing);

  await wb.xlsx.writeFile(outPath);
}
