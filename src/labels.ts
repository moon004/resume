import type { Lang, LocalizedCompany, LocalizedResume, Period } from "./types.js";

// 各ドキュメント共通の見出し・定型文
const labels = {
  ja: {
    // 共通
    asOf: "現在",
    present: "現在",
    years: "年",
    people: "名",
    months: "ヶ月",
    // 職務経歴書
    shokumuTitle: "職　務　経　歴　書",
    name: "氏名",
    summary: "職務要約",
    career: "職務経歴",
    strengths: "得意な分野・知識・技術",
    skills: "テクニカルスキル",
    skillType: "種類",
    skillYears: "使用期間",
    skillLevel: "レベル",
    workHistory: "開発経歴",
    employmentPeriod: "勤務期間",
    business: "事業内容",
    capital: "資本金",
    employees: "従業員数",
    period: "期間",
    projectAndTasks: "プロジェクト名および業務内容",
    environment: "開発環境",
    roleScale: "役割／規模",
    overview: "プロジェクト概要",
    phases: "担当フェーズ",
    tasks: "業務内容",
    achievements: "実績・取り組み等",
    role: "役割",
    scale: "プロジェクト規模",
    team: "チーム",
    total: "全体",
    envOs: "OS",
    envLanguages: "言語",
    envFrameworks: "フレームワーク",
    envDb: "DB",
    envOther: "その他ミドルウェア、サーバー等",
    excerptNote: "※主要な案件を抜粋して記載しております。",
    sideProjects: "個人開発・その他活動",
    link: "URL",
    certifications: "取得資格等",
    selfPr: "自己PR",
    end: "以上",
    closing: "是非、面接の機会をいただけると幸いです。何卒よろしくお願いいたします。",
    joined: "入社",
    left: "退社",
    toPresent: "現在に至る",
    // 履歴書
    rirekishoTitle: "履　歴　書",
    kana: "ふりがな",
    fullName: "氏　　名",
    gender: "性別",
    birthDate: "生年月日",
    address: "現住所",
    phone: "電話",
    mobile: "携帯電話",
    email: "E-mail",
    spouse: "配偶者",
    dependents: "扶養家族",
    spouseYes: "有",
    spouseNo: "無",
    year: "年",
    month: "月",
    eduAndWork: "学歴・職歴",
    education: "学歴",
    workRecord: "職歴",
    licenses: "免許・資格",
    remarks: "備考",
    // web
    expertise: "スキル",
    skillsNote: "太字 = 得意なスタック",
    softSkillsHeading: "リーダーシップ・マネジメント",
    experience: "職務経歴",
    tech: "技術",
  },
  en: {
    asOf: "as of",
    present: "Present",
    years: "yrs",
    people: "",
    months: "mo",
    shokumuTitle: "CURRICULUM VITAE",
    name: "Name",
    summary: "Summary",
    career: "Career History",
    strengths: "Strengths & Expertise",
    skills: "Technical Skills",
    skillType: "Category",
    skillYears: "Experience",
    skillLevel: "Level",
    workHistory: "Work Experience",
    employmentPeriod: "Period",
    business: "Business",
    capital: "Capital",
    employees: "Employees",
    period: "Period",
    projectAndTasks: "Project / Responsibilities",
    environment: "Environment",
    roleScale: "Role / Scale",
    overview: "Overview",
    phases: "Phases",
    tasks: "Responsibilities",
    achievements: "Achievements",
    role: "Role",
    scale: "Project size",
    team: "Team",
    total: "Total",
    envOs: "OS",
    envLanguages: "Languages",
    envFrameworks: "Frameworks",
    envDb: "DB",
    envOther: "Other (middleware, servers)",
    excerptNote: "* Only major projects are listed.",
    sideProjects: "Side Projects",
    link: "URL",
    certifications: "Certifications",
    selfPr: "Self PR",
    end: "",
    closing: "I would welcome the opportunity to discuss my experience further. Thank you for your consideration.",
    joined: "Joined",
    left: "Left",
    toPresent: "to present",
    rirekishoTitle: "RESUME",
    kana: "Reading",
    fullName: "Name",
    gender: "Gender",
    birthDate: "Date of birth",
    address: "Address",
    phone: "Phone",
    mobile: "Mobile",
    email: "E-mail",
    spouse: "Spouse",
    dependents: "Dependents",
    spouseYes: "Yes",
    spouseNo: "No",
    year: "Year",
    month: "Month",
    eduAndWork: "Education / Work history",
    education: "Education",
    workRecord: "Work history",
    licenses: "Licenses / Certifications",
    remarks: "Remarks",
    expertise: "Skills",
    skillsNote: "Bold — familiar stack",
    softSkillsHeading: "Leadership & Soft Skills",
    experience: "Work Experience",
    tech: "Tech",
  },
} as const;

export type Labels = (typeof labels)[Lang];

export function getLabels(lang: Lang): Labels {
  return labels[lang];
}

const EN_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "YYYY-MM" → {y, m}。"YYYY" → {y}。数値でなければ両方 undefined（TODO 等のプレースホルダー対策）
export function splitYm(ym: string): { y?: number; m?: number } {
  const [y, m] = ym.split("-").map(Number);
  return { y: Number.isFinite(y) ? y : undefined, m: Number.isFinite(m) && m ? m : undefined };
}

// 2023-04 → 2023年4月 / Apr 2023
export function formatMonth(ym: string, lang: Lang): string {
  const { y, m } = splitYm(ym);
  if (y === undefined) return ym;
  if (!m) return String(y);
  return lang === "ja" ? `${y}年${m}月` : `${EN_MONTHS[m - 1]} ${y}`;
}

export function formatPeriod(p: Period, lang: Lang): string {
  const to = p.to ? formatMonth(p.to, lang) : getLabels(lang).present;
  return `${formatMonth(p.from, lang)}${lang === "ja" ? "～" : " – "}${to}`;
}

// 今日の日付 "YYYY年M月D日現在" / "as of Month D, YYYY"
export function formatToday(lang: Lang, today = new Date()): string {
  const L = getLabels(lang);
  if (lang === "ja") return `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日${L.asOf}`;
  return `${L.asOf} ${today.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`;
}

// 期間の月数（両端含む）→ "1年3ヶ月" / "1 yr 3 mo"。年のみの指定なら空文字
export function formatDuration(p: Period, lang: Lang, today = new Date()): string {
  const a = splitYm(p.from);
  const b = p.to ? splitYm(p.to) : { y: today.getFullYear(), m: today.getMonth() + 1 };
  if (a.y === undefined || b.y === undefined || !a.m || !b.m) return "";
  const months = (b.y - a.y) * 12 + (b.m - a.m) + 1;
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (lang === "ja") return `${y ? `${y}年` : ""}${m ? `${m}ヶ月` : ""}` || "0ヶ月";
  return [y ? `${y} yr${y > 1 ? "s" : ""}` : "", m ? `${m} mo` : ""].filter(Boolean).join(" ") || "0 mo";
}

export function calcAge(birthDate: string, today = new Date()): number {
  const [y, m, d] = birthDate.split("-").map(Number);
  let age = today.getFullYear() - y;
  if (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d)) age--;
  return age;
}

// 1995-04-01 → "1995年4月1日生（満30歳）" / "April 1, 1995 (age 30)"
export function formatBirthDate(birthDate: string, lang: Lang, today = new Date()): string {
  const [y, m, d] = birthDate.split("-").map(Number);
  const age = calcAge(birthDate, today);
  if (lang === "ja") return `${y}年${m}月${d}日生（満${age}歳）`;
  return `${new Date(y, m - 1, d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} (age ${age})`;
}

// プロジェクトを期間の新しい順に並べる（期間なしは末尾）
export function sortByPeriodDesc<T extends { period?: Period }>(items: T[]): T[] {
  return [...items].sort((a, b) => (b.period?.from ?? "").localeCompare(a.period?.from ?? ""));
}

export interface TimelineRow {
  year?: number;
  month?: number;
  raw?: string; // 元の日付文字列（YYYY-MM など）
  text: string;
  kind: "heading" | "entry" | "present" | "end" | "blank";
}

// 履歴書「学歴・職歴」欄と職務経歴書「職務経歴」欄に使う時系列行を組み立てる
export function buildTimeline(r: LocalizedResume, lang: Lang): TimelineRow[] {
  const L = getLabels(lang);
  const rows: TimelineRow[] = [];
  if (r.education?.length) {
    rows.push({ text: L.education, kind: "heading" });
    for (const e of r.education) {
      const { y, m } = splitYm(e.date);
      rows.push({ year: y, month: m, raw: e.date, text: e.name, kind: "entry" });
    }
    rows.push({ text: "", kind: "blank" });
  }
  rows.push({ text: L.workRecord, kind: "heading" });
  for (const c of r.workHistory) rows.push(...companyRows(c, lang));
  if (r.workHistory.some((c) => !c.period.to)) rows.push({ text: L.toPresent, kind: "present" });
  rows.push({ text: L.end, kind: "end" });
  return rows;
}

// 会社ごとの「入社」「退社」行（日付順に並ぶよう from/to をそれぞれ返す）
export function companyRows(c: LocalizedCompany, lang: Lang): TimelineRow[] {
  const L = getLabels(lang);
  const join = c.joinLabel ?? L.joined;
  const leave = c.leaveLabel ?? L.left;
  const line = (verb: string) => (lang === "ja" ? `${c.name}　${verb}` : `${verb} ${c.name}`);
  const f = splitYm(c.period.from);
  const rows: TimelineRow[] = [{ year: f.y, month: f.m, raw: c.period.from, text: line(join), kind: "entry" }];
  if (c.period.to) {
    const t = splitYm(c.period.to);
    rows.push({ year: t.y, month: t.m, raw: c.period.to, text: line(leave), kind: "entry" });
  }
  return rows;
}
