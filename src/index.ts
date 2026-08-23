import { mkdirSync, writeFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { loadResume } from "./load.js";
import { htmlToPdf } from "./render/pdf.js";
import { renderRirekishoXlsx } from "./render/xlsx-rirekisho.js";
import { renderShokumuXlsx } from "./render/xlsx-shokumu.js";
import { renderRirekisho } from "./templates/rirekisho.js";
import { renderShokumu } from "./templates/shokumu.js";
import { renderWeb } from "./templates/web.js";
import type { Doc, Lang, LocalizedResume } from "./types.js";

// 使い方:
//   npm run build -- [--doc shokumu,rirekisho,web] [--format html,pdf,xlsx] [--lang ja,en] [--data data/resume.yml] [--out out]
const { values } = parseArgs({
  options: {
    doc: { type: "string", default: "shokumu,rirekisho,web" },
    format: { type: "string", default: "html,pdf,xlsx" },
    lang: { type: "string", default: "ja,en" },
    data: { type: "string", default: "data/resume.yml" },
    out: { type: "string", default: "out" },
  },
});

const DOCS: Doc[] = ["shokumu", "rirekisho", "web"];
const FORMATS = ["html", "pdf", "xlsx"] as const;
const LANGS: Lang[] = ["ja", "en"];

const pick = <T extends string>(input: string, allowed: readonly T[], label: string): T[] =>
  input.split(",").map((s) => {
    const v = s.trim() as T;
    if (!allowed.includes(v)) throw new Error(`unknown ${label}: ${v} (allowed: ${allowed.join(", ")})`);
    return v;
  });

const docs = pick(values.doc, DOCS, "doc");
const formats = pick(values.format, FORMATS, "format");
const langs = pick(values.lang, LANGS, "lang");

// ドキュメントごとの HTML / xlsx 出力関数
const html: Record<Doc, (r: LocalizedResume, lang: Lang) => string> = {
  shokumu: renderShokumu,
  rirekisho: renderRirekisho,
  web: renderWeb,
};
const xlsx: Partial<Record<Doc, (r: LocalizedResume, lang: Lang, out: string) => Promise<void>>> = {
  shokumu: renderShokumuXlsx,
  rirekisho: renderRirekishoXlsx,
};

mkdirSync(values.out, { recursive: true });

for (const lang of langs) {
  const resume = loadResume(values.data, lang);
  for (const doc of docs) {
    const base = `${values.out}/${doc}-${lang}`;
    if (formats.includes("html") || formats.includes("pdf")) {
      const page = html[doc](resume, lang);
      if (formats.includes("html")) {
        writeFileSync(`${base}.html`, page);
        console.log(`wrote ${base}.html`);
      }
      if (formats.includes("pdf")) {
        await htmlToPdf(page, `${base}.pdf`);
        console.log(`wrote ${base}.pdf`);
      }
    }
    if (formats.includes("xlsx") && xlsx[doc]) {
      await xlsx[doc]!(resume, lang, `${base}.xlsx`);
      console.log(`wrote ${base}.xlsx`);
    }
  }
}
