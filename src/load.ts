import { readFileSync } from "node:fs";
import { parse } from "yaml";
import type { Lang, LocalizedResume, Resume } from "./types.js";

// {ja, en} オブジェクトを指定言語の文字列に再帰的に解決する
function localize(value: unknown, lang: Lang): unknown {
  if (Array.isArray(value)) {
    return value.map((v) => localize(v, lang));
  }
  if (value !== null && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj);
    if (keys.length > 0 && keys.every((k) => k === "ja" || k === "en")) {
      return obj[lang] ?? obj.ja ?? obj.en;
    }
    return Object.fromEntries(keys.map((k) => [k, localize(obj[k], lang)]));
  }
  return value;
}

export function loadResume(path: string, lang: Lang): LocalizedResume {
  const raw = parse(readFileSync(path, "utf8")) as Resume;
  return localize(raw, lang) as LocalizedResume;
}
