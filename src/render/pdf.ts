import puppeteer from "puppeteer";

// HTML を A4 PDF に変換する（レイアウトは HTML テンプレート側の @page に従う）
export async function htmlToPdf(html: string, outPath: string): Promise<void> {
  const browser = await puppeteer.launch();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    await page.pdf({ path: outPath, format: "A4", printBackground: true, preferCSSPageSize: true });
  } finally {
    await browser.close();
  }
}
