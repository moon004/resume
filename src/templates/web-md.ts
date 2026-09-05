import { getLabels } from "../labels.js";
import type { Lang, LocalizedResume } from "../types.js";
import { companyView } from "./web.js";

// web レジュメの Markdown 版。HTML / PDF と同じ内容・同じ取捨選択（companyView）を出力するミラー。
// 手直しは data/resume.yml に対して行い、このファイルは再生成する。

export function renderWebMd(r: LocalizedResume, lang: Lang): string {
  const L = getLabels(lang);
  const p = r.profile;
  const out: string[] = [];

  out.push(`# ${p.name}`);
  if (p.title) out.push(`**${p.title}**`);
  const contacts = [
    p.address,
    p.mobile || p.phone,
    p.email,
    p.linkedin?.replace(/\/$/, ""),
    p.github?.replace(/\/$/, ""),
    p.blog?.replace(/\/$/, ""),
  ].filter(Boolean);
  if (contacts.length) out.push(contacts.join(" · "));

  if (r.summary) {
    out.push(`## ${L.summary}`);
    out.push(r.summary.trim().replaceAll("\n", " "));
  }

  out.push(`## ${L.experience}`);
  for (const c of [...r.workHistory].reverse()) {
    const v = companyView(c, lang);
    out.push(`### ${v.name} — ${v.periodText}`);
    out.push([`*${v.roles}*`, v.business].filter(Boolean).join(" · "));
    for (const pj of v.projects) {
      const paren = (t: string) => (lang === "ja" ? `（${t}）` : ` (${t})`);
      if (v.multi) out.push(`**${pj.title}**${pj.periodText ? paren(pj.periodText) : ""}`);
      if (pj.overview) out.push(pj.overview);
      if (pj.bullets.length) out.push(pj.bullets.map((b) => `- ${b}`).join("\n"));
    }
    if (v.tech.length) out.push(`**${L.tech}:** ${v.tech.join(", ")}`);
  }

  out.push(`## ${L.expertise}`);
  out.push(r.skills.map((cat) => `- **${cat.category}**: ${cat.items.map((i) => (i.emphasis === "bold" ? `**${i.name}**` : i.name)).join(", ")}`).join("\n"));

  if (r.softSkills?.length) {
    out.push(`## ${L.softSkillsHeading}`);
    out.push(r.softSkills.map((x) => `- ${x}`).join("\n"));
  }

  return out.join("\n\n") + "\n";
}
