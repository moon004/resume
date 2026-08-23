// テンプレート共通の小さなヘルパー
export function esc(s: string | number | undefined | null): string {
  if (s === undefined || s === null) return "";
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

// 改行を <br> に変換しつつエスケープ
export function escMultiline(s: string | undefined): string {
  return esc(s).replaceAll("\n", "<br>");
}

export function ul(items: string[] | undefined, cls = ""): string {
  if (!items?.length) return "";
  return `<ul${cls ? ` class="${cls}"` : ""}>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
}

// 日本語 PDF 向けのフォントスタック
export const FONT_STACK =
  '"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Yu Gothic", "Meiryo", sans-serif';
