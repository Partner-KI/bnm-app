import { Platform } from "react-native";

// ============================================================
// PDF-Generator für BNM-Berichte
// Nutzt pdf-lib — reines JS, keine nativen Dependencies,
// kompatibel mit Metro Bundler + Expo Web.
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

// ─── Farben ──────────────────────────────────────────────────────────────────

const NAVY = { r: 10 / 255, g: 58 / 255, b: 90 / 255 };
const GOLD = { r: 238 / 255, g: 167 / 255, b: 27 / 255 };
const GREEN = { r: 21 / 255, g: 128 / 255, b: 61 / 255 };
const GRAY = { r: 71 / 255, g: 84 / 255, b: 103 / 255 };
const LGRAY = { r: 152 / 255, g: 162 / 255, b: 179 / 255 };
const WHITE = { r: 1, g: 1, b: 1 };
const BG = { r: 249 / 255, g: 250 / 255, b: 251 / 255 };

// ─── Helpers ─────────────────────────────────────────────────────────────────

function triggerDownload(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes as any], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Monatsbericht PDF ───────────────────────────────────────────────────────

export async function downloadMonthlyReportPDF(data: ReportData): Promise<boolean> {
  if (Platform.OS !== "web") return false;
  try {
    const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");

    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
    const W = 595; // A4
    const H = 842;
    const today = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" });

    // ── Seite 1: Deckblatt ──
    const p1 = doc.addPage([W, H]);
    p1.drawRectangle({ x: 0, y: H - 120, width: W, height: 120, color: rgb(NAVY.r, NAVY.g, NAVY.b) });
    p1.drawText("BNM", { x: W / 2 - fontBold.widthOfTextAtSize("BNM", 42) / 2, y: H - 70, size: 42, font: fontBold, color: rgb(GOLD.r, GOLD.g, GOLD.b) });
    p1.drawText("BETREUUNG NEUER MUSLIME", { x: W / 2 - font.widthOfTextAtSize("BETREUUNG NEUER MUSLIME", 8) / 2, y: H - 90, size: 8, font, color: rgb(WHITE.r, WHITE.g, WHITE.b) });
    // Goldene Linie
    p1.drawRectangle({ x: W / 2 - 30, y: H / 2 + 40, width: 60, height: 3, color: rgb(GOLD.r, GOLD.g, GOLD.b) });
    p1.drawText("Monatsbericht", { x: W / 2 - fontBold.widthOfTextAtSize("Monatsbericht", 28) / 2, y: H / 2, size: 28, font: fontBold, color: rgb(NAVY.r, NAVY.g, NAVY.b) });
    p1.drawText(data.periodLabel, { x: W / 2 - font.widthOfTextAtSize(data.periodLabel, 14) / 2, y: H / 2 - 24, size: 14, font, color: rgb(GRAY.r, GRAY.g, GRAY.b) });
    p1.drawRectangle({ x: W / 2 - 30, y: H / 2 - 50, width: 60, height: 3, color: rgb(GOLD.r, GOLD.g, GOLD.b) });
    p1.drawText(`Erstellt am: ${today}`, { x: W / 2 - font.widthOfTextAtSize(`Erstellt am: ${today}`, 9) / 2, y: H / 2 - 80, size: 9, font, color: rgb(LGRAY.r, LGRAY.g, LGRAY.b) });
    p1.drawText("BNM – Ein iERA Projekt in Kooperation mit IMAN", { x: W / 2 - font.widthOfTextAtSize("BNM – Ein iERA Projekt in Kooperation mit IMAN", 8) / 2, y: H / 2 - 100, size: 8, font, color: rgb(LGRAY.r, LGRAY.g, LGRAY.b) });
    // Footer
    p1.drawText("BNM · Vertraulich", { x: 40, y: 30, size: 7, font, color: rgb(LGRAY.r, LGRAY.g, LGRAY.b) });
    p1.drawText("iman.ngo", { x: W / 2 - font.widthOfTextAtSize("iman.ngo", 7) / 2, y: 30, size: 7, font, color: rgb(LGRAY.r, LGRAY.g, LGRAY.b) });
    p1.drawText("Seite 1", { x: W - 40 - font.widthOfTextAtSize("Seite 1", 7), y: 30, size: 7, font, color: rgb(LGRAY.r, LGRAY.g, LGRAY.b) });

    // ── Seite 2: KPIs ──
    const p2 = doc.addPage([W, H]);
    p2.drawRectangle({ x: 0, y: H - 50, width: W, height: 50, color: rgb(NAVY.r, NAVY.g, NAVY.b) });
    p2.drawText("Monatsbericht", { x: 40, y: H - 35, size: 14, font: fontBold, color: rgb(WHITE.r, WHITE.g, WHITE.b) });
    p2.drawText(data.periodLabel, { x: W - 40 - font.widthOfTextAtSize(data.periodLabel, 10), y: H - 35, size: 10, font, color: rgb(GOLD.r, GOLD.g, GOLD.b) });

    p2.drawText("Kennzahlen-Uebersicht", { x: 40, y: H - 80, size: 16, font: fontBold, color: rgb(NAVY.r, NAVY.g, NAVY.b) });
    p2.drawRectangle({ x: 40, y: H - 88, width: 40, height: 2, color: rgb(GOLD.r, GOLD.g, GOLD.b) });

    const kpis = [
      { v: String(data.kpis.activeBetreuungen), l: "Aktive Betreuungen" },
      { v: String(data.kpis.abgeschlossen), l: "Abgeschlossen" },
      { v: String(data.kpis.mentoren), l: "Mentoren" },
      { v: String(data.kpis.mentees), l: "Mentees gesamt" },
      { v: String(data.kpis.sessions), l: "Sessions gesamt" },
      { v: String(data.kpis.neueBetreuungen), l: "Neue Betreuungen" },
    ];
    const bw = 160; const bh = 50; const gap = 10;
    kpis.forEach((k, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const bx = 40 + col * (bw + gap);
      const by = H - 110 - row * (bh + gap);
      p2.drawRectangle({ x: bx, y: by - bh, width: bw, height: bh, borderColor: rgb(0.9, 0.91, 0.92), borderWidth: 1, color: rgb(WHITE.r, WHITE.g, WHITE.b) });
      p2.drawText(k.v, { x: bx + 10, y: by - 25, size: 22, font: fontBold, color: rgb(NAVY.r, NAVY.g, NAVY.b) });
      p2.drawText(k.l, { x: bx + 10, y: by - 42, size: 8, font, color: rgb(GRAY.r, GRAY.g, GRAY.b) });
    });

    // Mentor des Monats
    if (data.mentorOfMonth) {
      const my = H - 250;
      p2.drawRectangle({ x: 40, y: my - 60, width: W - 80, height: 60, color: rgb(254 / 255, 243 / 255, 199 / 255), borderColor: rgb(GOLD.r, GOLD.g, GOLD.b), borderWidth: 1 });
      p2.drawText("MENTOR DES MONATS", { x: 55, y: my - 18, size: 8, font: fontBold, color: rgb(146 / 255, 64 / 255, 14 / 255) });
      p2.drawText(data.mentorOfMonth.name, { x: 55, y: my - 35, size: 16, font: fontBold, color: rgb(NAVY.r, NAVY.g, NAVY.b) });
      p2.drawText(`${data.mentorOfMonth.score} Punkte · ${data.mentorOfMonth.completed} Abschluesse · ${data.mentorOfMonth.sessions} Sessions`, { x: 55, y: my - 50, size: 8, font, color: rgb(GRAY.r, GRAY.g, GRAY.b) });
    }

    p2.drawText("BNM · Vertraulich", { x: 40, y: 30, size: 7, font, color: rgb(LGRAY.r, LGRAY.g, LGRAY.b) });
    p2.drawText("Seite 2", { x: W - 40 - font.widthOfTextAtSize("Seite 2", 7), y: 30, size: 7, font, color: rgb(LGRAY.r, LGRAY.g, LGRAY.b) });

    // ── Seite 3: Rangliste ──
    const p3 = doc.addPage([W, H]);
    p3.drawRectangle({ x: 0, y: H - 50, width: W, height: 50, color: rgb(NAVY.r, NAVY.g, NAVY.b) });
    p3.drawText("Monatsbericht", { x: 40, y: H - 35, size: 14, font: fontBold, color: rgb(WHITE.r, WHITE.g, WHITE.b) });
    p3.drawText(data.periodLabel, { x: W - 40 - font.widthOfTextAtSize(data.periodLabel, 10), y: H - 35, size: 10, font, color: rgb(GOLD.r, GOLD.g, GOLD.b) });

    p3.drawText("Mentor-Rangliste", { x: 40, y: H - 80, size: 16, font: fontBold, color: rgb(NAVY.r, NAVY.g, NAVY.b) });
    p3.drawRectangle({ x: 40, y: H - 88, width: 40, height: 2, color: rgb(GOLD.r, GOLD.g, GOLD.b) });

    // Tabelle Header
    let ty = H - 105;
    p3.drawRectangle({ x: 40, y: ty - 16, width: W - 80, height: 16, color: rgb(BG.r, BG.g, BG.b) });
    p3.drawText("#", { x: 45, y: ty - 12, size: 7, font: fontBold, color: rgb(GRAY.r, GRAY.g, GRAY.b) });
    p3.drawText("NAME", { x: 70, y: ty - 12, size: 7, font: fontBold, color: rgb(GRAY.r, GRAY.g, GRAY.b) });
    p3.drawText("SCORE", { x: 250, y: ty - 12, size: 7, font: fontBold, color: rgb(GRAY.r, GRAY.g, GRAY.b) });
    p3.drawText("SESSIONS", { x: 330, y: ty - 12, size: 7, font: fontBold, color: rgb(GRAY.r, GRAY.g, GRAY.b) });
    p3.drawText("ABSCHL.", { x: 410, y: ty - 12, size: 7, font: fontBold, color: rgb(GRAY.r, GRAY.g, GRAY.b) });
    p3.drawText("BEWERTUNG", { x: 480, y: ty - 12, size: 7, font: fontBold, color: rgb(GRAY.r, GRAY.g, GRAY.b) });
    ty -= 18;

    data.rankings.slice(0, 20).forEach((m, i) => {
      if (i % 2 === 1) p3.drawRectangle({ x: 40, y: ty - 14, width: W - 80, height: 14, color: rgb(0.98, 0.98, 0.98) });
      const isTop3 = m.rank <= 3;
      const c = isTop3 ? rgb(GOLD.r, GOLD.g, GOLD.b) : rgb(NAVY.r, NAVY.g, NAVY.b);
      const f = isTop3 ? fontBold : font;
      p3.drawText(String(m.rank), { x: 45, y: ty - 10, size: 8, font: f, color: c });
      p3.drawText(m.name, { x: 70, y: ty - 10, size: 8, font: f, color: c });
      p3.drawText(String(m.score), { x: 250, y: ty - 10, size: 8, font, color: rgb(NAVY.r, NAVY.g, NAVY.b) });
      p3.drawText(String(m.sessions), { x: 330, y: ty - 10, size: 8, font, color: rgb(NAVY.r, NAVY.g, NAVY.b) });
      p3.drawText(String(m.completed), { x: 410, y: ty - 10, size: 8, font, color: rgb(NAVY.r, NAVY.g, NAVY.b) });
      p3.drawText(m.rating !== null ? `${m.rating.toFixed(1)} ★` : "–", { x: 480, y: ty - 10, size: 8, font, color: rgb(NAVY.r, NAVY.g, NAVY.b) });
      ty -= 16;
    });

    p3.drawText("BNM · Vertraulich", { x: 40, y: 30, size: 7, font, color: rgb(LGRAY.r, LGRAY.g, LGRAY.b) });
    p3.drawText("Seite 3", { x: W - 40 - font.widthOfTextAtSize("Seite 3", 7), y: 30, size: 7, font, color: rgb(LGRAY.r, LGRAY.g, LGRAY.b) });

    // ── Seite 4: Zusammenfassung ──
    const p4 = doc.addPage([W, H]);
    p4.drawRectangle({ x: 0, y: H - 50, width: W, height: 50, color: rgb(NAVY.r, NAVY.g, NAVY.b) });
    p4.drawText("Monatsbericht", { x: 40, y: H - 35, size: 14, font: fontBold, color: rgb(WHITE.r, WHITE.g, WHITE.b) });

    p4.drawText("Zusammenfassung", { x: 40, y: H - 80, size: 16, font: fontBold, color: rgb(NAVY.r, NAVY.g, NAVY.b) });
    p4.drawRectangle({ x: 40, y: H - 88, width: 40, height: 2, color: rgb(GOLD.r, GOLD.g, GOLD.b) });

    // Text umbrechen
    const maxLineW = W - 100;
    const words = data.summaryText.split(" ");
    let line = "";
    let sy = H - 110;
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(test, 10) > maxLineW) {
        p4.drawText(line, { x: 50, y: sy, size: 10, font, color: rgb(NAVY.r, NAVY.g, NAVY.b) });
        sy -= 16;
        line = word;
      } else {
        line = test;
      }
    }
    if (line) p4.drawText(line, { x: 50, y: sy, size: 10, font, color: rgb(NAVY.r, NAVY.g, NAVY.b) });

    p4.drawText("Automatisch generiert. BNM – Ein iERA Projekt in Kooperation mit IMAN (iman.ngo).", { x: 40, y: 60, size: 7, font, color: rgb(LGRAY.r, LGRAY.g, LGRAY.b) });
    p4.drawText("BNM · Vertraulich", { x: 40, y: 30, size: 7, font, color: rgb(LGRAY.r, LGRAY.g, LGRAY.b) });
    p4.drawText("Seite 4", { x: W - 40 - font.widthOfTextAtSize("Seite 4", 7), y: 30, size: 7, font, color: rgb(LGRAY.r, LGRAY.g, LGRAY.b) });

    const bytes = await doc.save();
    triggerDownload(bytes, `BNM-Monatsbericht-${data.period}.pdf`);
    return true;
  } catch {
    return false;
  }
}

// ─── Mentor Award PDF ────────────────────────────────────────────────────────

export async function downloadMentorAwardPDF(data: AwardData): Promise<boolean> {
  if (Platform.OS !== "web") return false;
  try {
    const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
    const W = 595; const H = 842;

    const p = doc.addPage([W, H]);

    // Goldener Rahmen
    p.drawRectangle({ x: 30, y: 30, width: W - 60, height: H - 60, borderColor: rgb(GOLD.r, GOLD.g, GOLD.b), borderWidth: 3, color: rgb(WHITE.r, WHITE.g, WHITE.b) });

    const cx = W / 2;
    p.drawText("BNM", { x: cx - fontBold.widthOfTextAtSize("BNM", 36) / 2, y: H - 120, size: 36, font: fontBold, color: rgb(GOLD.r, GOLD.g, GOLD.b) });
    p.drawText("BETREUUNG NEUER MUSLIME", { x: cx - font.widthOfTextAtSize("BETREUUNG NEUER MUSLIME", 8) / 2, y: H - 140, size: 8, font, color: rgb(GRAY.r, GRAY.g, GRAY.b) });
    p.drawRectangle({ x: cx - 30, y: H - 170, width: 60, height: 3, color: rgb(GOLD.r, GOLD.g, GOLD.b) });
    p.drawText("AUSZEICHNUNG", { x: cx - font.widthOfTextAtSize("AUSZEICHNUNG", 10) / 2, y: H - 200, size: 10, font, color: rgb(GRAY.r, GRAY.g, GRAY.b) });
    p.drawText("Mentor des Monats", { x: cx - fontBold.widthOfTextAtSize("Mentor des Monats", 24) / 2, y: H - 240, size: 24, font: fontBold, color: rgb(NAVY.r, NAVY.g, NAVY.b) });
    p.drawText(data.period, { x: cx - font.widthOfTextAtSize(data.period, 12) / 2, y: H - 265, size: 12, font, color: rgb(GRAY.r, GRAY.g, GRAY.b) });
    p.drawRectangle({ x: cx - 30, y: H - 290, width: 60, height: 3, color: rgb(GOLD.r, GOLD.g, GOLD.b) });
    p.drawText(data.mentorName, { x: cx - fontBold.widthOfTextAtSize(data.mentorName, 28) / 2, y: H - 340, size: 28, font: fontBold, color: rgb(GOLD.r, GOLD.g, GOLD.b) });

    // Stats
    const stats = [
      { v: String(data.score), l: "Punkte" },
      { v: String(data.completed), l: "Abschluesse" },
      { v: String(data.sessions), l: "Sessions" },
    ];
    stats.forEach((s, i) => {
      const sx = 120 + i * 140;
      p.drawRectangle({ x: sx, y: H - 430, width: 110, height: 50, borderColor: rgb(0.9, 0.91, 0.92), borderWidth: 1, color: rgb(WHITE.r, WHITE.g, WHITE.b) });
      p.drawText(s.v, { x: sx + 55 - fontBold.widthOfTextAtSize(s.v, 20) / 2, y: H - 410, size: 20, font: fontBold, color: rgb(NAVY.r, NAVY.g, NAVY.b) });
      p.drawText(s.l, { x: sx + 55 - font.widthOfTextAtSize(s.l, 8) / 2, y: H - 425, size: 8, font, color: rgb(GRAY.r, GRAY.g, GRAY.b) });
    });

    p.drawRectangle({ x: cx - 30, y: H - 470, width: 60, height: 3, color: rgb(GOLD.r, GOLD.g, GOLD.b) });
    p.drawText("BNM – Betreuung neuer Muslime · iman.ngo", { x: cx - font.widthOfTextAtSize("BNM – Betreuung neuer Muslime · iman.ngo", 8) / 2, y: H - 500, size: 8, font, color: rgb(LGRAY.r, LGRAY.g, LGRAY.b) });

    const bytes = await doc.save();
    triggerDownload(bytes, `BNM-Mentor-des-Monats-${data.period}.pdf`);
    return true;
  } catch {
    return false;
  }
}

// ─── Spenderbericht PDF ──────────────────────────────────────────────────────

export async function downloadDonorReportPDF(data: DonorReportData): Promise<boolean> {
  if (Platform.OS !== "web") return false;
  try {
    const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
    const W = 595; const H = 842;
    const today = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" });

    // Seite 1: Deckblatt
    const p1 = doc.addPage([W, H]);
    p1.drawRectangle({ x: 0, y: H - 120, width: W, height: 120, color: rgb(NAVY.r, NAVY.g, NAVY.b) });
    p1.drawText("BNM", { x: W / 2 - fontBold.widthOfTextAtSize("BNM", 42) / 2, y: H - 70, size: 42, font: fontBold, color: rgb(GOLD.r, GOLD.g, GOLD.b) });
    p1.drawText("BETREUUNG NEUER MUSLIME", { x: W / 2 - font.widthOfTextAtSize("BETREUUNG NEUER MUSLIME", 8) / 2, y: H - 90, size: 8, font, color: rgb(WHITE.r, WHITE.g, WHITE.b) });
    p1.drawRectangle({ x: W / 2 - 30, y: H / 2 + 40, width: 60, height: 3, color: rgb(GOLD.r, GOLD.g, GOLD.b) });
    p1.drawText("Spenderbericht", { x: W / 2 - fontBold.widthOfTextAtSize("Spenderbericht", 28) / 2, y: H / 2, size: 28, font: fontBold, color: rgb(NAVY.r, NAVY.g, NAVY.b) });
    p1.drawText(data.periodLabel, { x: W / 2 - font.widthOfTextAtSize(data.periodLabel, 14) / 2, y: H / 2 - 24, size: 14, font, color: rgb(GRAY.r, GRAY.g, GRAY.b) });
    p1.drawRectangle({ x: W / 2 - 30, y: H / 2 - 50, width: 60, height: 3, color: rgb(GOLD.r, GOLD.g, GOLD.b) });
    p1.drawText(`Erstellt am: ${today}`, { x: W / 2 - font.widthOfTextAtSize(`Erstellt am: ${today}`, 9) / 2, y: H / 2 - 80, size: 9, font, color: rgb(LGRAY.r, LGRAY.g, LGRAY.b) });
    p1.drawText("BNM · Vertraulich", { x: 40, y: 30, size: 7, font, color: rgb(LGRAY.r, LGRAY.g, LGRAY.b) });

    // Seite 2: KPIs
    const p2 = doc.addPage([W, H]);
    p2.drawRectangle({ x: 0, y: H - 50, width: W, height: 50, color: rgb(NAVY.r, NAVY.g, NAVY.b) });
    p2.drawText("Spenderbericht", { x: 40, y: H - 35, size: 14, font: fontBold, color: rgb(WHITE.r, WHITE.g, WHITE.b) });
    p2.drawText(data.periodLabel, { x: W - 40 - font.widthOfTextAtSize(data.periodLabel, 10), y: H - 35, size: 10, font, color: rgb(GOLD.r, GOLD.g, GOLD.b) });

    p2.drawText("Kennzahlen-Uebersicht", { x: 40, y: H - 80, size: 16, font: fontBold, color: rgb(NAVY.r, NAVY.g, NAVY.b) });
    p2.drawRectangle({ x: 40, y: H - 88, width: 40, height: 2, color: rgb(GOLD.r, GOLD.g, GOLD.b) });

    const dkpis = [
      { v: String(data.kpis.activeMentorships), l: "Aktive Betreuungen" },
      { v: String(data.kpis.newRegistrations), l: "Neue Registrierungen" },
      { v: String(data.kpis.completedInPeriod), l: "Abgeschlossen" },
      { v: String(data.kpis.bnmBoxes), l: "BNM-Boxen" },
      { v: String(data.kpis.activeMentors), l: "Aktive Mentoren" },
      { v: String(data.kpis.wuduSessions + data.kpis.salahSessions + data.kpis.koranSessions), l: "Religioese Sessions" },
    ];
    dkpis.forEach((k, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const bx = 40 + col * 170;
      const by = H - 110 - row * 55;
      p2.drawRectangle({ x: bx, y: by - 50, width: 160, height: 50, borderColor: rgb(0.9, 0.91, 0.92), borderWidth: 1, color: rgb(WHITE.r, WHITE.g, WHITE.b) });
      p2.drawText(k.v, { x: bx + 10, y: by - 25, size: 22, font: fontBold, color: rgb(NAVY.r, NAVY.g, NAVY.b) });
      p2.drawText(k.l, { x: bx + 10, y: by - 42, size: 8, font, color: rgb(GRAY.r, GRAY.g, GRAY.b) });
    });

    p2.drawText("Zusammenfassung", { x: 40, y: H - 260, size: 14, font: fontBold, color: rgb(NAVY.r, NAVY.g, NAVY.b) });
    // Text umbrechen
    const maxW2 = W - 100;
    const w2 = data.summaryText.split(" ");
    let l2 = ""; let sy2 = H - 285;
    for (const word of w2) {
      const test = l2 ? `${l2} ${word}` : word;
      if (font.widthOfTextAtSize(test, 9) > maxW2) {
        p2.drawText(l2, { x: 50, y: sy2, size: 9, font, color: rgb(NAVY.r, NAVY.g, NAVY.b) });
        sy2 -= 14;
        l2 = word;
      } else { l2 = test; }
    }
    if (l2) p2.drawText(l2, { x: 50, y: sy2, size: 9, font, color: rgb(NAVY.r, NAVY.g, NAVY.b) });

    p2.drawText("BNM · Vertraulich", { x: 40, y: 30, size: 7, font, color: rgb(LGRAY.r, LGRAY.g, LGRAY.b) });
    p2.drawText("Seite 2", { x: W - 40 - font.widthOfTextAtSize("Seite 2", 7), y: 30, size: 7, font, color: rgb(LGRAY.r, LGRAY.g, LGRAY.b) });

    const bytes = await doc.save();
    triggerDownload(bytes, `BNM-Spenderbericht-${data.periodLabel}.pdf`);
    return true;
  } catch {
    return false;
  }
}
