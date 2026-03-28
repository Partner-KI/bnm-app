import { Platform } from "react-native";

// ============================================================
// PDF-Generator für BNM-Berichte
// Lädt pdf-lib über CDN zur Laufzeit (nur wenn PDF gebraucht wird).
// Erzeugt echte .pdf Dateien als direkten Download.
// ============================================================

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface ReportKPIs {
  activeBetreuungen: number;
  abgeschlossen: number;
  mentoren: number;
  mentees: number;
  sessions: number;
  neueBetreuungen: number;
  wuduSessions: number;
  salahSessions: number;
  koranSessions: number;
  nachbetreuung: number;
}

export interface MentorRanking {
  rank: number;
  name: string;
  score: number;
  sessions: number;
  completed: number;
  rating: number | null;
}

export interface ReportData {
  period: string;
  periodLabel: string;
  kpis: ReportKPIs;
  mentorOfMonth: { name: string; score: number; sessions: number; completed: number } | null;
  rankings: MentorRanking[];
  summaryText: string;
}

export interface AwardData {
  mentorName: string;
  period: string;
  score: number;
  sessions: number;
  completed: number;
}

export interface DonorReportKPIs {
  activeMentorships: number;
  newRegistrations: number;
  completedInPeriod: number;
  bnmBoxes: number;
  activeMentors: number;
  wuduSessions: number;
  salahSessions: number;
  koranSessions: number;
  nachbetreuungSessions: number;
}

export interface DonorReportData {
  periodLabel: string;
  kpis: DonorReportKPIs;
  regionalData: { label: string; value: number }[];
  sessionDistribution: { items: { label: string; value: number }[] };
  summaryText: string;
}

// ─── CDN Loader ──────────────────────────────────────────────────────────────

let _pdfLib: any = null;

async function loadPdfLib(): Promise<any> {
  if (_pdfLib) return _pdfLib;
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js";
    script.onload = () => {
      _pdfLib = (window as any).PDFLib;
      resolve(_pdfLib);
    };
    script.onerror = () => reject(new Error("pdf-lib CDN konnte nicht geladen werden"));
    document.head.appendChild(script);
  });
}

function triggerDownload(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Farben ──────────────────────────────────────────────────────────────────

const C = {
  navy: [10 / 255, 58 / 255, 90 / 255] as [number, number, number],
  gold: [238 / 255, 167 / 255, 27 / 255] as [number, number, number],
  green: [21 / 255, 128 / 255, 61 / 255] as [number, number, number],
  gray: [71 / 255, 84 / 255, 103 / 255] as [number, number, number],
  lgray: [152 / 255, 162 / 255, 179 / 255] as [number, number, number],
  white: [1, 1, 1] as [number, number, number],
  border: [0.9, 0.91, 0.92] as [number, number, number],
  bg: [0.98, 0.98, 0.98] as [number, number, number],
  summaryBg: [0.98, 0.97, 0.94] as [number, number, number],
};

// ─── Hilfsfunktionen ─────────────────────────────────────────────────────────

function drawSectionHeader(
  page: any, rgb: any, bold: any, font: any,
  text: string, x: number, y: number, letter: string, circleColor: [number, number, number]
) {
  // Farbiger Kreis mit Buchstabe
  page.drawCircle({ x: x + 7, y: y + 4, size: 7, color: rgb(...circleColor) });
  page.drawText(letter, { x: x + 4, y: y + 1, size: 7, font: bold, color: rgb(1, 1, 1) });
  // Überschrift
  page.drawText(text, { x: x + 20, y, size: 13, font: bold, color: rgb(...C.navy) });
  // Gold-Unterstrich
  const textWidth = bold.widthOfTextAtSize(text, 13);
  page.drawRectangle({ x: x + 20, y: y - 6, width: textWidth * 0.6, height: 2, color: rgb(...C.gold) });
}

function drawKpiCard(
  page: any, rgb: any, bold: any, font: any,
  value: string, label: string, bx: number, by: number, w: number, h: number, dotColor: [number, number, number]
) {
  // Hintergrund mit hellgrauem Fill
  page.drawRectangle({ x: bx, y: by - h, width: w, height: h, color: rgb(0.985, 0.985, 0.99) });
  // Goldener dünner Rand (1px)
  page.drawRectangle({ x: bx, y: by - h, width: w, height: h, borderColor: rgb(...C.gold), borderWidth: 1 });
  // Kleiner farbiger Punkt links oben
  page.drawCircle({ x: bx + 6, y: by - 6, size: 3, color: rgb(...dotColor) });
  // Wert
  page.drawText(value, { x: bx + 8, y: by - 22, size: 18, font: bold, color: rgb(...C.navy) });
  // Label
  page.drawText(label, { x: bx + 8, y: by - 34, size: 7, font, color: rgb(...C.gray) });
}

function drawThreeColFooter(
  page: any, rgb: any, font: any,
  W: number, currentPage: number, totalPages: number
) {
  const leftText = "BNM · Vertraulich";
  const midText = "iman.ngo";
  const rightText = `Seite ${currentPage} von ${totalPages}`;
  page.drawLine({ start: { x: 40, y: 42 }, end: { x: W - 40, y: 42 }, thickness: 0.5, color: rgb(...C.border) });
  page.drawText(leftText, { x: 40, y: 30, size: 7, font, color: rgb(...C.lgray) });
  page.drawText(midText, { x: W / 2 - font.widthOfTextAtSize(midText, 7) / 2, y: 30, size: 7, font, color: rgb(...C.lgray) });
  page.drawText(rightText, { x: W - 40 - font.widthOfTextAtSize(rightText, 7), y: 30, size: 7, font, color: rgb(...C.lgray) });
}

function drawSummaryBox(
  page: any, rgb: any, bold: any, font: any,
  summaryText: string, startY: number, W: number
): number {
  const words = summaryText.split(" ");
  let line = ""; const lines: string[] = [];
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (font.widthOfTextAtSize(test, 9) > W - 120) { lines.push(line); line = w; }
    else { line = test; }
  }
  if (line) lines.push(line);

  const boxH = lines.length * 13 + 20;
  const boxY = startY - 8;
  page.drawRectangle({ x: 40, y: boxY - boxH, width: W - 80, height: boxH, color: rgb(...C.summaryBg), borderColor: rgb(...C.border), borderWidth: 1 });
  let sy = boxY - 14;
  for (const l of lines) {
    if (sy > 50) { page.drawText(l, { x: 50, y: sy, size: 9, font, color: rgb(...C.navy) }); sy -= 13; }
  }
  return sy;
}

// ─── Monatsbericht ───────────────────────────────────────────────────────────

export async function downloadMonthlyReportPDF(data: ReportData): Promise<boolean> {
  if (Platform.OS !== "web") return false;
  try {
    const PDFLib = await loadPdfLib();
    const { PDFDocument, StandardFonts, rgb } = PDFLib;
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    const W = 595; const H = 842;
    const today = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" });

    // ── Seite 1: Deckblatt + KPIs ──────────────────────────────────────────
    const p1 = doc.addPage([W, H]);

    // Navy-Header mit Schatten-Effekt (zweite Rechteck-Schicht leicht versetzt)
    p1.drawRectangle({ x: 0, y: H - 72, width: W, height: 72, color: rgb(0.04, 0.2, 0.32) });
    p1.drawRectangle({ x: 0, y: H - 70, width: W, height: 70, color: rgb(...C.navy) });
    p1.drawText("BNM", { x: 40, y: H - 36, size: 28, font: bold, color: rgb(...C.gold) });
    p1.drawText("Betreuung neuer Muslime", { x: 40, y: H - 52, size: 7, font, color: rgb(0.78, 0.85, 0.9) });
    const titleText = "Monatsbericht";
    p1.drawText(titleText, { x: W / 2 - bold.widthOfTextAtSize(titleText, 16) / 2, y: H - 34, size: 16, font: bold, color: rgb(...C.white) });
    p1.drawText(data.periodLabel, { x: W - 40 - font.widthOfTextAtSize(data.periodLabel, 10), y: H - 34, size: 10, font, color: rgb(...C.gold) });
    p1.drawText("Erstellt am: " + today, { x: W - 40 - font.widthOfTextAtSize("Erstellt am: " + today, 7), y: H - 52, size: 7, font, color: rgb(200 / 255, 210 / 255, 220 / 255) });

    // Goldene Akzent-Linie als Section-Divider
    p1.drawRectangle({ x: 0, y: H - 72, width: W, height: 2, color: rgb(...C.gold) });

    // KPI-Sektion
    drawSectionHeader(p1, rgb, bold, font, "Kennzahlen", 40, H - 94, "K", C.navy);

    // 3x3 KPI-Grid
    const kpis = [
      [String(data.kpis.activeBetreuungen + data.kpis.abgeschlossen + data.kpis.neueBetreuungen), "Betreuungen gesamt"],
      [String(data.kpis.activeBetreuungen), "Aktive Betreuungen"],
      [String(data.kpis.abgeschlossen), "Abgeschlossen"],
      [String(data.kpis.mentoren), "Mentoren"],
      [String(data.kpis.mentees), "Mentees"],
      [String(data.kpis.neueBetreuungen), "Neue Betreuungen"],
      [String(data.kpis.wuduSessions), "Wudu Sessions"],
      [String(data.kpis.salahSessions), "Salah Sessions"],
      [String(data.kpis.koranSessions), "Koran Sessions"],
    ];
    const KPI_W = 165; const KPI_H = 42; const KPI_GAP = 5;
    const kpiDotColors: [number, number, number][] = [C.navy, C.navy, C.green, C.navy, C.navy, C.gold, C.gold, C.gold, C.gold];
    kpis.forEach(([v, l], i) => {
      const col = i % 3; const row = Math.floor(i / 3);
      const bx = 40 + col * (KPI_W + KPI_GAP);
      const by = H - 112 - row * (KPI_H + KPI_GAP);
      drawKpiCard(p1, rgb, bold, font, v, l, bx, by, KPI_W, KPI_H, kpiDotColors[i]);
    });

    // Goldener Divider nach KPIs
    const divY1 = H - 112 - 3 * (KPI_H + KPI_GAP) - 4;
    p1.drawRectangle({ x: 40, y: divY1, width: W - 80, height: 1, color: rgb(...C.gold) });

    // Abbrüche / Nachbetreuung
    const abbY = divY1 - 14;
    p1.drawRectangle({ x: 40, y: abbY - 22, width: W - 80, height: 22, color: rgb(0.97, 0.97, 0.98), borderColor: rgb(...C.border), borderWidth: 1 });
    p1.drawText("Abbrüche / Nachbetreuung:", { x: 48, y: abbY - 15, size: 7, font: bold, color: rgb(...C.gray) });
    p1.drawText(String(data.kpis.nachbetreuung), { x: 200, y: abbY - 15, size: 7, font: bold, color: rgb(...C.navy) });

    // Mentor des Monats Box – goldener Rahmen rundum
    const momY = abbY - 36;
    if (data.mentorOfMonth) {
      // Goldener Hintergrund + rundumlaufender Rahmen
      p1.drawRectangle({ x: 40, y: momY - 50, width: W - 80, height: 50, color: rgb(254 / 255, 243 / 255, 199 / 255) });
      p1.drawRectangle({ x: 40, y: momY - 50, width: W - 80, height: 50, borderColor: rgb(...C.gold), borderWidth: 2 });
      // Goldene linke Akzent-Linie (extra sichtbar)
      p1.drawRectangle({ x: 40, y: momY - 50, width: 4, height: 50, color: rgb(...C.gold) });
      p1.drawText("MENTOR DES MONATS", { x: 54, y: momY - 14, size: 7, font: bold, color: rgb(146 / 255, 64 / 255, 14 / 255) });
      p1.drawText(data.mentorOfMonth.name, { x: 54, y: momY - 28, size: 14, font: bold, color: rgb(...C.navy) });
      p1.drawText(
        data.mentorOfMonth.score + " Pkt — " + data.mentorOfMonth.completed + " Abschl. — " + data.mentorOfMonth.sessions + " Sessions",
        { x: 54, y: momY - 42, size: 7, font, color: rgb(...C.gray) }
      );
    }

    // Footer Seite 1
    drawThreeColFooter(p1, rgb, font, W, 1, 2);

    // ── Seite 2: Rangliste + Zusammenfassung ───────────────────────────────
    const p2 = doc.addPage([W, H]);

    // Navy-Header Seite 2
    p2.drawRectangle({ x: 0, y: H - 52, width: W, height: 52, color: rgb(...C.navy) });
    p2.drawRectangle({ x: 0, y: H - 52, width: W, height: 2, color: rgb(...C.gold) });
    p2.drawText("Monatsbericht", { x: 40, y: H - 32, size: 13, font: bold, color: rgb(...C.white) });
    p2.drawText(data.periodLabel, { x: W - 40 - font.widthOfTextAtSize(data.periodLabel, 10), y: H - 32, size: 10, font, color: rgb(...C.gold) });

    // Rangliste
    drawSectionHeader(p2, rgb, bold, font, "Rangliste", 40, H - 72, "R", C.gold);

    // Tabellenkopf – grau hinterlegt
    let ty = H - 88;
    p2.drawRectangle({ x: 40, y: ty - 14, width: W - 80, height: 14, color: rgb(0.22, 0.28, 0.36) });
    const rankCols = [45, 70, 250, 320, 395, 465];
    ["#", "Name", "Score", "Sessions", "Abschl.", "Bewertung"].forEach((h, i) => {
      p2.drawText(h, { x: rankCols[i], y: ty - 10, size: 7, font: bold, color: rgb(...C.white) });
    });
    ty -= 14;

    // Tabellenzeilen mit abwechselnden Farben
    data.rankings.slice(0, 15).forEach((m, i) => {
      const rowBg = i % 2 === 0 ? rgb(1, 1, 1) : rgb(...C.bg);
      p2.drawRectangle({ x: 40, y: ty - 13, width: W - 80, height: 13, color: rowBg });
      // Trennlinie
      p2.drawLine({ start: { x: 40, y: ty - 13 }, end: { x: W - 40, y: ty - 13 }, thickness: 0.5, color: rgb(...C.border) });
      const isTop = m.rank <= 3;
      const f = isTop ? bold : font;
      const c = isTop ? rgb(...C.gold) : rgb(...C.navy);
      p2.drawText(String(m.rank), { x: rankCols[0], y: ty - 10, size: 7, font: f, color: c });
      p2.drawText(m.name, { x: rankCols[1], y: ty - 10, size: 7, font: f, color: c });
      p2.drawText(String(m.score), { x: rankCols[2], y: ty - 10, size: 7, font, color: rgb(...C.navy) });
      p2.drawText(String(m.sessions), { x: rankCols[3], y: ty - 10, size: 7, font, color: rgb(...C.navy) });
      p2.drawText(String(m.completed), { x: rankCols[4], y: ty - 10, size: 7, font, color: rgb(...C.navy) });
      p2.drawText(m.rating !== null ? m.rating.toFixed(1) + " *" : "-", { x: rankCols[5], y: ty - 10, size: 7, font, color: rgb(...C.navy) });
      ty -= 13;
    });

    // Goldener Divider
    p2.drawRectangle({ x: 40, y: ty - 10, width: W - 80, height: 1, color: rgb(...C.gold) });

    // Zusammenfassung
    const sumTitleY = ty - 24;
    drawSectionHeader(p2, rgb, bold, font, "Zusammenfassung", 40, sumTitleY, "Z", C.green);
    drawSummaryBox(p2, rgb, bold, font, data.summaryText, sumTitleY - 12, W);

    // Footer Seite 2
    drawThreeColFooter(p2, rgb, font, W, 2, 2);

    const bytes = await doc.save();
    triggerDownload(bytes, "BNM-Monatsbericht-" + data.period + ".pdf");
    return true;
  } catch (err) {
    if (typeof window !== "undefined") window.alert("PDF-Fehler: " + String(err));
    return false;
  }
}

// ─── Mentor Award ────────────────────────────────────────────────────────────

export async function downloadMentorAwardPDF(data: AwardData): Promise<boolean> {
  if (Platform.OS !== "web") return false;
  try {
    const PDFLib = await loadPdfLib();
    const { PDFDocument, StandardFonts, rgb } = PDFLib;
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    const W = 595; const H = 842; const cx = W / 2;

    const p = doc.addPage([W, H]);
    p.drawRectangle({ x: 30, y: 30, width: W - 60, height: H - 60, borderColor: rgb(...C.gold), borderWidth: 3 });
    p.drawText("BNM", { x: cx - bold.widthOfTextAtSize("BNM", 36) / 2, y: H - 120, size: 36, font: bold, color: rgb(...C.gold) });
    p.drawText("BETREUUNG NEUER MUSLIME", { x: cx - font.widthOfTextAtSize("BETREUUNG NEUER MUSLIME", 8) / 2, y: H - 140, size: 8, font, color: rgb(...C.gray) });
    p.drawRectangle({ x: cx - 30, y: H - 170, width: 60, height: 3, color: rgb(...C.gold) });
    p.drawText("AUSZEICHNUNG", { x: cx - font.widthOfTextAtSize("AUSZEICHNUNG", 10) / 2, y: H - 200, size: 10, font, color: rgb(...C.gray) });
    p.drawText("Mentor des Monats", { x: cx - bold.widthOfTextAtSize("Mentor des Monats", 24) / 2, y: H - 240, size: 24, font: bold, color: rgb(...C.navy) });
    p.drawText(data.period, { x: cx - font.widthOfTextAtSize(data.period, 12) / 2, y: H - 265, size: 12, font, color: rgb(...C.gray) });
    p.drawRectangle({ x: cx - 30, y: H - 290, width: 60, height: 3, color: rgb(...C.gold) });
    p.drawText(data.mentorName, { x: cx - bold.widthOfTextAtSize(data.mentorName, 28) / 2, y: H - 340, size: 28, font: bold, color: rgb(...C.gold) });

    [[String(data.score), "Punkte"], [String(data.completed), "Abschluesse"], [String(data.sessions), "Sessions"]].forEach(([v, l], i) => {
      const sx = 120 + i * 140;
      p.drawRectangle({ x: sx, y: H - 430, width: 110, height: 50, borderColor: rgb(...C.border), borderWidth: 1 });
      p.drawText(v, { x: sx + 55 - bold.widthOfTextAtSize(v, 20) / 2, y: H - 410, size: 20, font: bold, color: rgb(...C.navy) });
      p.drawText(l, { x: sx + 55 - font.widthOfTextAtSize(l, 8) / 2, y: H - 425, size: 8, font, color: rgb(...C.gray) });
    });

    p.drawRectangle({ x: cx - 30, y: H - 470, width: 60, height: 3, color: rgb(...C.gold) });
    p.drawText("BNM - Betreuung neuer Muslime - iman.ngo", { x: cx - font.widthOfTextAtSize("BNM - Betreuung neuer Muslime - iman.ngo", 8) / 2, y: H - 500, size: 8, font, color: rgb(...C.lgray) });

    const bytes = await doc.save();
    triggerDownload(bytes, "BNM-Mentor-des-Monats-" + data.period + ".pdf");
    return true;
  } catch (err) {
    if (typeof window !== "undefined") window.alert("PDF-Fehler: " + String(err));
    return false;
  }
}

// ─── Spenderbericht ──────────────────────────────────────────────────────────

export async function downloadDonorReportPDF(data: DonorReportData): Promise<boolean> {
  if (Platform.OS !== "web") return false;
  try {
    const PDFLib = await loadPdfLib();
    const { PDFDocument, StandardFonts, rgb } = PDFLib;
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    const W = 595; const H = 842;
    const today = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" });

    // ── Seite 1: Alles auf einer Seite ────────────────────────────────────
    const p1 = doc.addPage([W, H]);

    // Navy-Header mit goldener Akzent-Linie
    p1.drawRectangle({ x: 0, y: H - 72, width: W, height: 72, color: rgb(0.04, 0.2, 0.32) });
    p1.drawRectangle({ x: 0, y: H - 70, width: W, height: 70, color: rgb(...C.navy) });
    p1.drawText("BNM", { x: 40, y: H - 36, size: 28, font: bold, color: rgb(...C.gold) });
    p1.drawText("Betreuung neuer Muslime", { x: 40, y: H - 52, size: 7, font, color: rgb(0.78, 0.85, 0.9) });
    const titleDonor = "Spenderbericht";
    p1.drawText(titleDonor, { x: W / 2 - bold.widthOfTextAtSize(titleDonor, 16) / 2, y: H - 34, size: 16, font: bold, color: rgb(...C.white) });
    p1.drawText(data.periodLabel, { x: W - 40 - font.widthOfTextAtSize(data.periodLabel, 10), y: H - 34, size: 10, font, color: rgb(...C.gold) });
    p1.drawText("Erstellt am: " + today, { x: W - 40 - font.widthOfTextAtSize("Erstellt am: " + today, 7), y: H - 52, size: 7, font, color: rgb(200 / 255, 210 / 255, 220 / 255) });
    p1.drawRectangle({ x: 0, y: H - 72, width: W, height: 2, color: rgb(...C.gold) });

    // KPI-Sektion
    drawSectionHeader(p1, rgb, bold, font, "Kennzahlen", 40, H - 94, "K", C.navy);

    // 2x3 KPI-Grid
    const dk = [
      [String(data.kpis.activeMentorships), "Aktive Betreuungen"],
      [String(data.kpis.newRegistrations), "Neue Registrierungen"],
      [String(data.kpis.completedInPeriod), "Abgeschlossen"],
      [String(data.kpis.bnmBoxes), "BNM-Boxen"],
      [String(data.kpis.activeMentors), "Aktive Mentoren"],
      [String(data.kpis.wuduSessions + data.kpis.salahSessions + data.kpis.koranSessions), "Religioese Sessions"],
    ];
    const DK_W = 165; const DK_H = 42; const DK_GAP = 5;
    const dkDotColors: [number, number, number][] = [C.navy, C.gold, C.green, C.gold, C.navy, C.gold];
    dk.forEach(([v, l], i) => {
      const col = i % 3; const row = Math.floor(i / 3);
      const bx = 40 + col * (DK_W + DK_GAP);
      const by = H - 112 - row * (DK_H + DK_GAP);
      drawKpiCard(p1, rgb, bold, font, v, l, bx, by, DK_W, DK_H, dkDotColors[i]);
    });

    // Goldener Divider
    const divY2 = H - 112 - 2 * (DK_H + DK_GAP) - 4;
    p1.drawRectangle({ x: 40, y: divY2, width: W - 80, height: 1, color: rgb(...C.gold) });

    // Session-Verteilung
    const sessTitleY = divY2 - 18;
    drawSectionHeader(p1, rgb, bold, font, "Session-Verteilung", 40, sessTitleY, "S", C.gold);

    // Tabellenkopf – dunkel hinterlegt
    let sessY = sessTitleY - 16;
    p1.drawRectangle({ x: 40, y: sessY - 14, width: W - 80, height: 14, color: rgb(0.22, 0.28, 0.36) });
    p1.drawText("Typ", { x: 48, y: sessY - 10, size: 7, font: bold, color: rgb(...C.white) });
    p1.drawText("Anzahl", { x: 220, y: sessY - 10, size: 7, font: bold, color: rgb(...C.white) });
    sessY -= 14;

    // Session-Einträge mit abwechselnden Zeilenfarben
    const sessItems = data.sessionDistribution?.items ?? [];
    const displayItems = sessItems.length > 0 ? sessItems : [
      { label: "Wudu Sessions", value: data.kpis.wuduSessions },
      { label: "Salah Sessions", value: data.kpis.salahSessions },
      { label: "Koran Sessions", value: data.kpis.koranSessions },
    ];
    displayItems.forEach((item: { label: string; value: number }, i: number) => {
      const rowBg = i % 2 === 0 ? rgb(1, 1, 1) : rgb(...C.bg);
      p1.drawRectangle({ x: 40, y: sessY - 13, width: W - 80, height: 13, color: rowBg });
      p1.drawLine({ start: { x: 40, y: sessY - 13 }, end: { x: W - 40, y: sessY - 13 }, thickness: 0.5, color: rgb(...C.border) });
      // Farbiger Punkt vor dem Label
      p1.drawCircle({ x: 52, y: sessY - 7, size: 3, color: rgb(...C.gold) });
      p1.drawText(item.label, { x: 60, y: sessY - 10, size: 7, font, color: rgb(...C.navy) });
      p1.drawText(String(item.value), { x: 220, y: sessY - 10, size: 7, font: bold, color: rgb(...C.navy) });
      sessY -= 13;
    });

    // Goldener Divider vor Zusammenfassung
    p1.drawRectangle({ x: 40, y: sessY - 10, width: W - 80, height: 1, color: rgb(...C.gold) });

    // Zusammenfassung in Box
    const sumTitleY = sessY - 24;
    drawSectionHeader(p1, rgb, bold, font, "Zusammenfassung", 40, sumTitleY, "Z", C.green);
    drawSummaryBox(p1, rgb, bold, font, data.summaryText, sumTitleY - 12, W);

    // Footer
    drawThreeColFooter(p1, rgb, font, W, 1, 1);

    const bytes = await doc.save();
    triggerDownload(bytes, "BNM-Spenderbericht-" + data.periodLabel + ".pdf");
    return true;
  } catch (err) {
    if (typeof window !== "undefined") window.alert("PDF-Fehler: " + String(err));
    return false;
  }
}
