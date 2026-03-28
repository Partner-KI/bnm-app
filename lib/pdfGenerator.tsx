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
};

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

    // Navy-Header
    p1.drawRectangle({ x: 0, y: H - 70, width: W, height: 70, color: rgb(...C.navy) });
    p1.drawText("BNM", { x: 40, y: H - 42, size: 26, font: bold, color: rgb(...C.gold) });
    p1.drawText("BETREUUNG NEUER MUSLIME", { x: 40, y: H - 58, size: 7, font, color: rgb(...C.white) });
    p1.drawText("Monatsbericht", { x: W / 2 - bold.widthOfTextAtSize("Monatsbericht", 16) / 2, y: H - 38, size: 16, font: bold, color: rgb(...C.white) });
    p1.drawText(data.periodLabel, { x: W - 40 - font.widthOfTextAtSize(data.periodLabel, 10), y: H - 38, size: 10, font, color: rgb(...C.gold) });
    p1.drawText("Erstellt am: " + today, { x: W - 40 - font.widthOfTextAtSize("Erstellt am: " + today, 7), y: H - 56, size: 7, font, color: rgb(200 / 255, 210 / 255, 220 / 255) });

    // Goldene Linie
    p1.drawRectangle({ x: 40, y: H - 80, width: W - 80, height: 2, color: rgb(...C.gold) });

    // KPI-Titel
    p1.drawText("Kennzahlen", { x: 40, y: H - 100, size: 13, font: bold, color: rgb(...C.navy) });
    p1.drawRectangle({ x: 40, y: H - 107, width: 35, height: 2, color: rgb(...C.gold) });

    // 3x3 KPI-Grid (9 KPIs, je 140px breit, 40px hoch)
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
    const KPI_W = 165; const KPI_H = 40; const KPI_GAP = 5;
    kpis.forEach(([v, l], i) => {
      const col = i % 3; const row = Math.floor(i / 3);
      const bx = 40 + col * (KPI_W + KPI_GAP);
      const by = H - 120 - row * (KPI_H + KPI_GAP);
      p1.drawRectangle({ x: bx, y: by - KPI_H, width: KPI_W, height: KPI_H, borderColor: rgb(...C.border), borderWidth: 1 });
      p1.drawText(v, { x: bx + 8, y: by - 22, size: 18, font: bold, color: rgb(...C.navy) });
      p1.drawText(l, { x: bx + 8, y: by - 34, size: 7, font, color: rgb(...C.gray) });
    });

    // Abbrüche als eigene Zeile
    const abbY = H - 120 - 3 * (KPI_H + KPI_GAP) - 8;
    p1.drawRectangle({ x: 40, y: abbY - 20, width: W - 80, height: 20, color: rgb(0.97, 0.97, 0.98), borderColor: rgb(...C.border), borderWidth: 1 });
    p1.drawText("Abbrüche / Nachbetreuung:", { x: 48, y: abbY - 14, size: 7, font: bold, color: rgb(...C.gray) });
    p1.drawText(String(data.kpis.nachbetreuung), { x: 200, y: abbY - 14, size: 7, font: bold, color: rgb(...C.navy) });

    // Mentor des Monats Box
    const momY = abbY - 32;
    if (data.mentorOfMonth) {
      p1.drawRectangle({ x: 40, y: momY - 44, width: W - 80, height: 44, color: rgb(254 / 255, 243 / 255, 199 / 255), borderColor: rgb(...C.gold), borderWidth: 1 });
      p1.drawText("MENTOR DES MONATS", { x: 52, y: momY - 14, size: 7, font: bold, color: rgb(146 / 255, 64 / 255, 14 / 255) });
      p1.drawText(data.mentorOfMonth.name, { x: 52, y: momY - 27, size: 13, font: bold, color: rgb(...C.navy) });
      p1.drawText(
        data.mentorOfMonth.score + " Pkt — " + data.mentorOfMonth.completed + " Abschl. — " + data.mentorOfMonth.sessions + " Sessions",
        { x: 52, y: momY - 39, size: 7, font, color: rgb(...C.gray) }
      );
    }

    // Footer Seite 1
    p1.drawText("BNM - Vertraulich", { x: 40, y: 30, size: 7, font, color: rgb(...C.lgray) });
    p1.drawText("Seite 1 / 2", { x: W - 70, y: 30, size: 7, font, color: rgb(...C.lgray) });

    // ── Seite 2: Rangliste + Zusammenfassung ───────────────────────────────
    const p2 = doc.addPage([W, H]);

    // Navy-Header
    p2.drawRectangle({ x: 0, y: H - 50, width: W, height: 50, color: rgb(...C.navy) });
    p2.drawText("Monatsbericht", { x: 40, y: H - 32, size: 13, font: bold, color: rgb(...C.white) });
    p2.drawText(data.periodLabel, { x: W - 40 - font.widthOfTextAtSize(data.periodLabel, 10), y: H - 32, size: 10, font, color: rgb(...C.gold) });

    // Rangliste-Titel
    p2.drawText("Rangliste", { x: 40, y: H - 68, size: 13, font: bold, color: rgb(...C.navy) });
    p2.drawRectangle({ x: 40, y: H - 74, width: 32, height: 2, color: rgb(...C.gold) });

    // Tabellenkopf
    let ty = H - 88;
    p2.drawRectangle({ x: 40, y: ty - 12, width: W - 80, height: 12, color: rgb(...C.bg) });
    const rankCols = [45, 70, 250, 320, 395, 465];
    ["#", "Name", "Score", "Sessions", "Abschl.", "Bewertung"].forEach((h, i) => {
      p2.drawText(h, { x: rankCols[i], y: ty - 9, size: 7, font: bold, color: rgb(...C.gray) });
    });
    ty -= 12;

    // Zeilen (max 15, fontSize 7, Zeilenhöhe 12)
    data.rankings.slice(0, 15).forEach((m, i) => {
      if (i % 2 === 1) p2.drawRectangle({ x: 40, y: ty - 12, width: W - 80, height: 12, color: rgb(...C.bg) });
      const isTop = m.rank <= 3;
      const f = isTop ? bold : font;
      const c = isTop ? rgb(...C.gold) : rgb(...C.navy);
      p2.drawText(String(m.rank), { x: rankCols[0], y: ty - 9, size: 7, font: f, color: c });
      p2.drawText(m.name, { x: rankCols[1], y: ty - 9, size: 7, font: f, color: c });
      p2.drawText(String(m.score), { x: rankCols[2], y: ty - 9, size: 7, font, color: rgb(...C.navy) });
      p2.drawText(String(m.sessions), { x: rankCols[3], y: ty - 9, size: 7, font, color: rgb(...C.navy) });
      p2.drawText(String(m.completed), { x: rankCols[4], y: ty - 9, size: 7, font, color: rgb(...C.navy) });
      p2.drawText(m.rating !== null ? m.rating.toFixed(1) + " *" : "-", { x: rankCols[5], y: ty - 9, size: 7, font, color: rgb(...C.navy) });
      ty -= 12;
    });

    // Zusammenfassung
    const sumTitleY = ty - 14;
    p2.drawText("Zusammenfassung", { x: 40, y: sumTitleY, size: 13, font: bold, color: rgb(...C.navy) });
    p2.drawRectangle({ x: 40, y: sumTitleY - 6, width: 50, height: 2, color: rgb(...C.gold) });

    const words = data.summaryText.split(" ");
    let line = ""; let sy = sumTitleY - 20;
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (font.widthOfTextAtSize(test, 9) > W - 100) {
        if (sy > 50) {
          p2.drawText(line, { x: 50, y: sy, size: 9, font, color: rgb(...C.navy) });
          sy -= 14;
        }
        line = w;
      } else { line = test; }
    }
    if (line && sy > 50) p2.drawText(line, { x: 50, y: sy, size: 9, font, color: rgb(...C.navy) });

    // Footer Seite 2
    p2.drawText("Automatisch generiert. BNM - iman.ngo", { x: 40, y: 44, size: 7, font, color: rgb(...C.lgray) });
    p2.drawText("BNM - Vertraulich", { x: 40, y: 30, size: 7, font, color: rgb(...C.lgray) });
    p2.drawText("Seite 2 / 2", { x: W - 70, y: 30, size: 7, font, color: rgb(...C.lgray) });

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

    // Navy-Header
    p1.drawRectangle({ x: 0, y: H - 70, width: W, height: 70, color: rgb(...C.navy) });
    p1.drawText("BNM", { x: 40, y: H - 42, size: 26, font: bold, color: rgb(...C.gold) });
    p1.drawText("BETREUUNG NEUER MUSLIME", { x: 40, y: H - 58, size: 7, font, color: rgb(...C.white) });
    p1.drawText("Spenderbericht", { x: W / 2 - bold.widthOfTextAtSize("Spenderbericht", 16) / 2, y: H - 38, size: 16, font: bold, color: rgb(...C.white) });
    p1.drawText(data.periodLabel, { x: W - 40 - font.widthOfTextAtSize(data.periodLabel, 10), y: H - 38, size: 10, font, color: rgb(...C.gold) });
    p1.drawText("Erstellt am: " + today, { x: W - 40 - font.widthOfTextAtSize("Erstellt am: " + today, 7), y: H - 56, size: 7, font, color: rgb(200 / 255, 210 / 255, 220 / 255) });

    // Goldene Linie
    p1.drawRectangle({ x: 40, y: H - 80, width: W - 80, height: 2, color: rgb(...C.gold) });

    // KPI-Titel
    p1.drawText("Kennzahlen", { x: 40, y: H - 100, size: 13, font: bold, color: rgb(...C.navy) });
    p1.drawRectangle({ x: 40, y: H - 107, width: 35, height: 2, color: rgb(...C.gold) });

    // 2x3 KPI-Grid (6 KPIs, je 165px breit, 40px hoch)
    const dk = [
      [String(data.kpis.activeMentorships), "Aktive Betreuungen"],
      [String(data.kpis.newRegistrations), "Neue Registrierungen"],
      [String(data.kpis.completedInPeriod), "Abgeschlossen"],
      [String(data.kpis.bnmBoxes), "BNM-Boxen"],
      [String(data.kpis.activeMentors), "Aktive Mentoren"],
      [String(data.kpis.wuduSessions + data.kpis.salahSessions + data.kpis.koranSessions), "Religioese Sessions"],
    ];
    const DK_W = 165; const DK_H = 40; const DK_GAP = 5;
    dk.forEach(([v, l], i) => {
      const col = i % 3; const row = Math.floor(i / 3);
      const bx = 40 + col * (DK_W + DK_GAP);
      const by = H - 120 - row * (DK_H + DK_GAP);
      p1.drawRectangle({ x: bx, y: by - DK_H, width: DK_W, height: DK_H, borderColor: rgb(...C.border), borderWidth: 1 });
      p1.drawText(v, { x: bx + 8, y: by - 22, size: 18, font: bold, color: rgb(...C.navy) });
      p1.drawText(l, { x: bx + 8, y: by - 34, size: 7, font, color: rgb(...C.gray) });
    });

    // Session-Verteilung als kompakte Tabelle
    const sessTitleY = H - 120 - 2 * (DK_H + DK_GAP) - 18;
    p1.drawText("Session-Verteilung", { x: 40, y: sessTitleY, size: 11, font: bold, color: rgb(...C.navy) });
    p1.drawRectangle({ x: 40, y: sessTitleY - 5, width: 42, height: 2, color: rgb(...C.gold) });

    // Tabellenkopf
    let sessY = sessTitleY - 18;
    p1.drawRectangle({ x: 40, y: sessY - 12, width: W - 80, height: 12, color: rgb(...C.bg) });
    p1.drawText("Typ", { x: 48, y: sessY - 9, size: 7, font: bold, color: rgb(...C.gray) });
    p1.drawText("Anzahl", { x: 220, y: sessY - 9, size: 7, font: bold, color: rgb(...C.gray) });
    sessY -= 12;

    // Session-Einträge
    const sessItems = data.sessionDistribution?.items ?? [];
    // Immer Wudu/Salah/Koran als Fallback anzeigen wenn keine items
    const displayItems = sessItems.length > 0 ? sessItems : [
      { label: "Wudu Sessions", value: data.kpis.wuduSessions },
      { label: "Salah Sessions", value: data.kpis.salahSessions },
      { label: "Koran Sessions", value: data.kpis.koranSessions },
    ];
    displayItems.forEach((item: { label: string; value: number }, i: number) => {
      if (i % 2 === 1) p1.drawRectangle({ x: 40, y: sessY - 12, width: W - 80, height: 12, color: rgb(...C.bg) });
      p1.drawText(item.label, { x: 48, y: sessY - 9, size: 7, font, color: rgb(...C.navy) });
      p1.drawText(String(item.value), { x: 220, y: sessY - 9, size: 7, font: bold, color: rgb(...C.navy) });
      sessY -= 12;
    });

    // Zusammenfassung
    const sumTitleY = sessY - 16;
    p1.drawText("Zusammenfassung", { x: 40, y: sumTitleY, size: 11, font: bold, color: rgb(...C.navy) });
    p1.drawRectangle({ x: 40, y: sumTitleY - 5, width: 50, height: 2, color: rgb(...C.gold) });

    const w2 = data.summaryText.split(" ");
    let l2 = ""; let sy2 = sumTitleY - 18;
    for (const w of w2) {
      const test = l2 ? l2 + " " + w : w;
      if (font.widthOfTextAtSize(test, 9) > W - 100) {
        if (sy2 > 50) {
          p1.drawText(l2, { x: 50, y: sy2, size: 9, font, color: rgb(...C.navy) });
          sy2 -= 13;
        }
        l2 = w;
      } else { l2 = test; }
    }
    if (l2 && sy2 > 50) p1.drawText(l2, { x: 50, y: sy2, size: 9, font, color: rgb(...C.navy) });

    // Footer
    p1.drawText("Automatisch generiert. BNM - iman.ngo", { x: 40, y: 44, size: 7, font, color: rgb(...C.lgray) });
    p1.drawText("BNM - Vertraulich", { x: 40, y: 30, size: 7, font, color: rgb(...C.lgray) });
    p1.drawText("Seite 1", { x: W - 70, y: 30, size: 7, font, color: rgb(...C.lgray) });

    const bytes = await doc.save();
    triggerDownload(bytes, "BNM-Spenderbericht-" + data.periodLabel + ".pdf");
    return true;
  } catch (err) {
    if (typeof window !== "undefined") window.alert("PDF-Fehler: " + String(err));
    return false;
  }
}
