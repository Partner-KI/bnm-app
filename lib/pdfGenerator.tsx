import { Platform } from "react-native";

// ============================================================
// PDF-Generator für BNM-Berichte
// jsPDF-basierte Lösung – echter PDF-Download, kein Browser-Dialog.
// NUR auf Web verfügbar.
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

// ─── Farben & Konstanten ──────────────────────────────────────────────────────

const GOLD = "#EEA71B";
const NAVY = "#0A3A5A";
const GREY = "#475467";
const LIGHT_GREY = "#98A2B3";
const BORDER = "#e5e7eb";
const BG_LIGHT = "#F9FAFB";
const GREEN = "#15803d";

// ─── jsPDF-Hilfsfunktionen ────────────────────────────────────────────────────

type JsPDF = import("jspdf").jsPDF;

function setNavyTitle(doc: JsPDF, text: string, x: number, y: number, align: "left" | "center" | "right" = "left") {
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(NAVY);
  doc.text(text, x, y, { align });
}

function setBodyText(doc: JsPDF, text: string, x: number, y: number, maxWidth?: number) {
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor("#101828");
  if (maxWidth) {
    doc.text(text, x, y, { maxWidth });
  } else {
    doc.text(text, x, y);
  }
}

function drawGoldLine(doc: JsPDF, x1: number, y: number, x2: number) {
  doc.setDrawColor(GOLD);
  doc.setLineWidth(0.8);
  doc.line(x1, y, x2, y);
}

function drawSectionDivider(doc: JsPDF, y: number) {
  drawGoldLine(doc, 20, y, 50);
}

function addPageFooter(doc: JsPDF, pageNum: number) {
  const totalPages = doc.getNumberOfPages();
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(LIGHT_GREY);
  doc.text("BNM · Vertraulich", 20, 287);
  doc.text("iman.ngo", 105, 287, { align: "center" });
  doc.text(`Seite ${pageNum}`, 190, 287, { align: "right" });
  doc.setDrawColor(BORDER);
  doc.setLineWidth(0.3);
  doc.line(20, 283, 190, 283);
}

function drawKpiBox(
  doc: JsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  value: string,
  label: string,
  valueColor: string = NAVY
) {
  // Box zeichnen
  doc.setDrawColor(BORDER);
  doc.setLineWidth(0.3);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(x, y, w, h, 2, 2, "FD");
  // Wert
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(valueColor);
  doc.text(value, x + w / 2, y + h / 2 - 1, { align: "center" });
  // Label
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(GREY);
  doc.text(label.toUpperCase(), x + w / 2, y + h / 2 + 6, { align: "center" });
}

// ─── Monatsbericht aufbauen ───────────────────────────────────────────────────

function buildMonthlyReport(doc: JsPDF, data: ReportData) {
  const today = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" });

  // ── Seite 1: Deckblatt ──
  // Hintergrund-Akzent oben
  doc.setFillColor(NAVY);
  doc.rect(0, 0, 210, 60, "F");

  doc.setFontSize(36);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(GOLD);
  doc.text("BNM", 105, 35, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(255, 255, 255);
  doc.text("BETREUUNG NEUER MUSLIME", 105, 46, { align: "center" });

  drawGoldLine(doc, 80, 75, 130);

  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(NAVY);
  doc.text("Monatsbericht", 105, 110, { align: "center" });

  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(GREY);
  doc.text(data.periodLabel, 105, 122, { align: "center" });

  drawGoldLine(doc, 80, 132, 130);

  doc.setFontSize(10);
  doc.setTextColor(LIGHT_GREY);
  doc.text(`Erstellt am: ${today}`, 105, 148, { align: "center" });
  doc.text("BNM – Ein iERA Projekt in Kooperation mit IMAN", 105, 157, { align: "center" });

  addPageFooter(doc, 1);

  // ── Seite 2: KPIs ──
  doc.addPage();

  setNavyTitle(doc, "Kennzahlen-Übersicht", 20, 25);
  drawSectionDivider(doc, 30);

  const kpiBoxW = 52;
  const kpiBoxH = 22;
  const kpiGapX = 5;
  const kpiStartX = 20;
  let kpiY = 38;

  const kpiRow1 = [
    { value: String(data.kpis.activeBetreuungen), label: "Aktive Betreuungen", color: NAVY },
    { value: String(data.kpis.abgeschlossen), label: "Abgeschlossen", color: GREEN },
    { value: String(data.kpis.mentoren), label: "Mentoren", color: NAVY },
  ];
  kpiRow1.forEach((kpi, i) => {
    drawKpiBox(doc, kpiStartX + i * (kpiBoxW + kpiGapX), kpiY, kpiBoxW, kpiBoxH, kpi.value, kpi.label, kpi.color);
  });
  kpiY += kpiBoxH + 5;

  const kpiRow2 = [
    { value: String(data.kpis.mentees), label: "Mentees gesamt", color: GOLD },
    { value: String(data.kpis.sessions), label: "Sessions gesamt", color: NAVY },
    { value: String(data.kpis.neueBetreuungen), label: "Neue Betreuungen", color: NAVY },
  ];
  kpiRow2.forEach((kpi, i) => {
    drawKpiBox(doc, kpiStartX + i * (kpiBoxW + kpiGapX), kpiY, kpiBoxW, kpiBoxH, kpi.value, kpi.label, kpi.color);
  });
  kpiY += kpiBoxH + 5;

  const kpiRow3 = [
    { value: String(data.kpis.wuduSessions), label: "Wudu-Sessions", color: NAVY },
    { value: String(data.kpis.salahSessions), label: "Salah-Sessions", color: NAVY },
    { value: String(data.kpis.koranSessions), label: "Koran-Sessions", color: NAVY },
  ];
  kpiRow3.forEach((kpi, i) => {
    drawKpiBox(doc, kpiStartX + i * (kpiBoxW + kpiGapX), kpiY, kpiBoxW, kpiBoxH, kpi.value, kpi.label, kpi.color);
  });
  kpiY += kpiBoxH + 10;

  // Mentor des Monats
  if (data.mentorOfMonth) {
    const m = data.mentorOfMonth;
    doc.setFillColor("#FEF3C7");
    doc.setDrawColor(GOLD);
    doc.setLineWidth(0.5);
    doc.roundedRect(20, kpiY, 170, 22, 3, 3, "FD");

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor("#92400E");
    doc.text("★  MENTOR DES MONATS", 28, kpiY + 7);

    doc.setFontSize(13);
    doc.setTextColor("#101828");
    doc.text(m.name, 28, kpiY + 15);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(GREY);
    doc.text(`${m.score} Punkte · ${m.completed} Abschlüsse · ${m.sessions} Sessions`, 110, kpiY + 15);
  }

  addPageFooter(doc, 2);

  // ── Seite 3: Rangliste ──
  doc.addPage();

  setNavyTitle(doc, "Mentor-Rangliste", 20, 25);
  drawSectionDivider(doc, 30);

  // Tabellen-Header
  let tableY = 40;
  doc.setFillColor(BG_LIGHT);
  doc.rect(20, tableY, 170, 8, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(GREY);
  doc.text("#", 23, tableY + 5.5);
  doc.text("Name", 35, tableY + 5.5);
  doc.text("Score", 105, tableY + 5.5);
  doc.text("Sessions", 125, tableY + 5.5);
  doc.text("Abschlüsse", 148, tableY + 5.5);
  doc.text("Bewertung", 173, tableY + 5.5);

  doc.setDrawColor(BORDER);
  doc.setLineWidth(0.3);
  doc.line(20, tableY + 8, 190, tableY + 8);

  tableY += 8;

  const rankings = data.rankings.slice(0, 20);
  for (let i = 0; i < rankings.length; i++) {
    const row = rankings[i];
    const rowY = tableY + i * 8;
    if (rowY > 270) break;

    // Zebra-Streifen
    if (i % 2 === 1) {
      doc.setFillColor("#FAFAFA");
      doc.rect(20, rowY, 170, 8, "F");
    }

    const isTop3 = row.rank <= 3;
    doc.setFontSize(9);
    doc.setFont("helvetica", isTop3 ? "bold" : "normal");
    doc.setTextColor(isTop3 ? GOLD : "#101828");
    doc.text(String(row.rank), 23, rowY + 5.5);

    doc.setTextColor(isTop3 ? "#101828" : "#101828");
    doc.setFont("helvetica", isTop3 ? "bold" : "normal");
    // Name ggf. kürzen
    const nameTrunc = row.name.length > 28 ? row.name.slice(0, 27) + "…" : row.name;
    doc.text(nameTrunc, 35, rowY + 5.5);

    doc.setFont("helvetica", "normal");
    doc.setTextColor("#101828");
    doc.text(String(row.score), 105, rowY + 5.5);
    doc.text(String(row.sessions), 125, rowY + 5.5);
    doc.text(String(row.completed), 148, rowY + 5.5);
    doc.text(row.rating !== null ? row.rating.toFixed(1) + " ★" : "–", 173, rowY + 5.5);

    doc.setDrawColor("#f3f4f6");
    doc.setLineWidth(0.2);
    doc.line(20, rowY + 8, 190, rowY + 8);
  }

  addPageFooter(doc, 3);

  // ── Seite 4: Zusammenfassung ──
  doc.addPage();

  setNavyTitle(doc, "Zusammenfassung", 20, 25);
  drawSectionDivider(doc, 30);

  // Zusammenfassungsbox
  doc.setFillColor(BG_LIGHT);
  doc.setDrawColor(BORDER);
  doc.setLineWidth(0.3);
  doc.roundedRect(20, 38, 170, 40, 3, 3, "FD");

  setBodyText(doc, data.summaryText, 26, 48, 158);

  // Footer-Hinweis
  doc.setFillColor(BG_LIGHT);
  doc.setDrawColor(BORDER);
  doc.setLineWidth(0.3);
  doc.roundedRect(20, 90, 170, 18, 3, 3, "FD");

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(LIGHT_GREY);
  doc.text("Dieser Bericht wurde automatisch generiert.", 26, 99);
  doc.text("BNM – Ein iERA Projekt in Kooperation mit IMAN (iman.ngo).", 26, 105);

  addPageFooter(doc, 4);
}

// ─── Spenderbericht aufbauen ──────────────────────────────────────────────────

function buildDonorReport(doc: JsPDF, data: DonorReportData) {
  const today = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" });

  // ── Seite 1: Deckblatt ──
  doc.setFillColor(NAVY);
  doc.rect(0, 0, 210, 60, "F");

  doc.setFontSize(36);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(GOLD);
  doc.text("BNM", 105, 35, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(255, 255, 255);
  doc.text("BETREUUNG NEUER MUSLIME", 105, 46, { align: "center" });

  drawGoldLine(doc, 80, 75, 130);

  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(NAVY);
  doc.text("Spenderbericht", 105, 110, { align: "center" });

  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(GREY);
  doc.text(data.periodLabel, 105, 122, { align: "center" });

  drawGoldLine(doc, 80, 132, 130);

  doc.setFontSize(10);
  doc.setTextColor(LIGHT_GREY);
  doc.text(`Erstellt am: ${today}`, 105, 148, { align: "center" });
  doc.text("BNM – Ein iERA Projekt in Kooperation mit IMAN", 105, 157, { align: "center" });

  addPageFooter(doc, 1);

  // ── Seite 2: KPIs ──
  doc.addPage();

  setNavyTitle(doc, "Kennzahlen-Übersicht", 20, 25);
  drawSectionDivider(doc, 30);

  const kpiBoxW = 52;
  const kpiBoxH = 22;
  const kpiGapX = 5;
  const kpiStartX = 20;
  let kpiY = 38;

  const religSessions = data.kpis.wuduSessions + data.kpis.salahSessions + data.kpis.koranSessions;

  const kpiRow1 = [
    { value: String(data.kpis.activeMentorships), label: "Aktive Betreuungen", color: NAVY },
    { value: String(data.kpis.newRegistrations), label: "Neue Registrierungen", color: NAVY },
    { value: String(data.kpis.completedInPeriod), label: "Abgeschlossen", color: GREEN },
  ];
  kpiRow1.forEach((kpi, i) => {
    drawKpiBox(doc, kpiStartX + i * (kpiBoxW + kpiGapX), kpiY, kpiBoxW, kpiBoxH, kpi.value, kpi.label, kpi.color);
  });
  kpiY += kpiBoxH + 5;

  const kpiRow2 = [
    { value: String(data.kpis.bnmBoxes), label: "BNM-Boxen", color: NAVY },
    { value: String(data.kpis.activeMentors), label: "Aktive Mentoren", color: NAVY },
    { value: String(religSessions), label: "Religiöse Sessions", color: NAVY },
  ];
  kpiRow2.forEach((kpi, i) => {
    drawKpiBox(doc, kpiStartX + i * (kpiBoxW + kpiGapX), kpiY, kpiBoxW, kpiBoxH, kpi.value, kpi.label, kpi.color);
  });

  addPageFooter(doc, 2);

  // ── Seite 3: Regionale Verteilung ──
  doc.addPage();

  setNavyTitle(doc, "Regionale Verteilung", 20, 25);
  drawSectionDivider(doc, 30);

  const totalRegional = data.regionalData.reduce((s, d) => s + d.value, 0);
  const maxRegional = Math.max(...data.regionalData.map((d) => d.value), 1);

  // Tabellen-Header
  let tableY = 40;
  doc.setFillColor(BG_LIGHT);
  doc.rect(20, tableY, 170, 8, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(GREY);
  doc.text("Stadt", 23, tableY + 5.5);
  doc.text("Anteil", 90, tableY + 5.5);
  doc.text("Anzahl", 155, tableY + 5.5);
  doc.text("%", 175, tableY + 5.5);
  doc.setDrawColor(BORDER);
  doc.setLineWidth(0.3);
  doc.line(20, tableY + 8, 190, tableY + 8);

  tableY += 8;

  if (data.regionalData.length === 0) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(LIGHT_GREY);
    doc.text("Keine Daten", 105, tableY + 8, { align: "center" });
  } else {
    data.regionalData.forEach((d, i) => {
      const rowY = tableY + i * 10;
      if (rowY > 270) return;
      const pct = totalRegional > 0 ? Math.round((d.value / totalRegional) * 100) : 0;
      const barWidth = Math.round((d.value / maxRegional) * 50); // max 50mm

      if (i % 2 === 1) {
        doc.setFillColor("#FAFAFA");
        doc.rect(20, rowY, 170, 10, "F");
      }

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor("#101828");
      doc.text(d.label, 23, rowY + 6.5);

      // Balken
      doc.setFillColor("#e5e7eb");
      doc.roundedRect(85, rowY + 3, 50, 4, 1, 1, "F");
      if (barWidth > 0) {
        doc.setFillColor(GOLD);
        doc.roundedRect(85, rowY + 3, barWidth, 4, 1, 1, "F");
      }

      doc.text(String(d.value), 155, rowY + 6.5);
      doc.text(`${pct}%`, 175, rowY + 6.5);

      doc.setDrawColor("#f3f4f6");
      doc.setLineWidth(0.2);
      doc.line(20, rowY + 10, 190, rowY + 10);
    });
  }

  addPageFooter(doc, 3);

  // ── Seite 4: Session-Typen & Zusammenfassung ──
  doc.addPage();

  setNavyTitle(doc, "Session-Typen", 20, 25);
  drawSectionDivider(doc, 30);

  // Tabellen-Header
  tableY = 40;
  doc.setFillColor(BG_LIGHT);
  doc.rect(20, tableY, 170, 8, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(GREY);
  doc.text("Typ", 23, tableY + 5.5);
  doc.text("Anzahl", 175, tableY + 5.5, { align: "right" });
  doc.setDrawColor(BORDER);
  doc.setLineWidth(0.3);
  doc.line(20, tableY + 8, 190, tableY + 8);

  tableY += 8;

  if (data.sessionDistribution.items.length === 0) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(LIGHT_GREY);
    doc.text("Keine Daten", 105, tableY + 8, { align: "center" });
  } else {
    data.sessionDistribution.items.forEach((item, i) => {
      const rowY = tableY + i * 8;
      if (rowY > 150) return;
      if (i % 2 === 1) {
        doc.setFillColor("#FAFAFA");
        doc.rect(20, rowY, 170, 8, "F");
      }
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor("#101828");
      doc.text(item.label, 23, rowY + 5.5);
      doc.setFont("helvetica", "bold");
      doc.text(String(item.value), 185, rowY + 5.5, { align: "right" });
      doc.setDrawColor("#f3f4f6");
      doc.setLineWidth(0.2);
      doc.line(20, rowY + 8, 190, rowY + 8);
    });
  }

  const summaryStartY = Math.min(tableY + data.sessionDistribution.items.length * 8 + 12, 160);

  setNavyTitle(doc, "Zusammenfassung", 20, summaryStartY);
  drawSectionDivider(doc, summaryStartY + 5);

  doc.setFillColor(BG_LIGHT);
  doc.setDrawColor(BORDER);
  doc.setLineWidth(0.3);
  doc.roundedRect(20, summaryStartY + 9, 170, 35, 3, 3, "FD");
  setBodyText(doc, data.summaryText, 26, summaryStartY + 18, 158);

  doc.setFillColor(BG_LIGHT);
  doc.setDrawColor(BORDER);
  doc.setLineWidth(0.3);
  doc.roundedRect(20, summaryStartY + 50, 170, 18, 3, 3, "FD");
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(LIGHT_GREY);
  doc.text("Dieser Bericht wurde automatisch generiert.", 26, summaryStartY + 59);
  doc.text("BNM – Ein iERA Projekt in Kooperation mit IMAN (iman.ngo).", 26, summaryStartY + 65);

  addPageFooter(doc, 4);
}

// ─── Award-Seite aufbauen ─────────────────────────────────────────────────────

function buildAwardPage(doc: JsPDF, data: AwardData) {
  const today = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" });

  // Rahmen
  doc.setDrawColor(GOLD);
  doc.setLineWidth(1.5);
  doc.roundedRect(15, 15, 180, 267, 5, 5, "D");

  // Innerer Rahmen
  doc.setLineWidth(0.3);
  doc.roundedRect(18, 18, 174, 261, 4, 4, "D");

  // BNM-Logo
  doc.setFontSize(36);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(GOLD);
  doc.text("BNM", 105, 55, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(GREY);
  doc.text("BETREUUNG NEUER MUSLIME", 105, 64, { align: "center" });

  drawGoldLine(doc, 80, 72, 130);

  // Label
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(GREY);
  doc.text("AUSZEICHNUNG", 105, 85, { align: "center" });

  // Titel
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(NAVY);
  doc.text("Mentor des Monats", 105, 98, { align: "center" });

  // Zeitraum
  doc.setFontSize(13);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(GREY);
  doc.text(data.period, 105, 109, { align: "center" });

  drawGoldLine(doc, 80, 118, 130);

  // Name
  doc.setFontSize(30);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(GOLD);
  doc.text(data.mentorName, 105, 140, { align: "center" });

  // Stats-Boxes
  const statBoxW = 40;
  const statBoxH = 25;
  const statY = 155;
  const statStartX = 105 - 3 * statBoxW / 2 - 10;

  const stats = [
    { value: String(data.score), label: "Punkte" },
    { value: String(data.completed), label: "Abschlüsse" },
    { value: String(data.sessions), label: "Sessions" },
  ];

  stats.forEach((stat, i) => {
    const sx = statStartX + i * (statBoxW + 10);
    doc.setDrawColor(BORDER);
    doc.setLineWidth(0.3);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(sx, statY, statBoxW, statBoxH, 3, 3, "FD");

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(NAVY);
    doc.text(stat.value, sx + statBoxW / 2, statY + 13, { align: "center" });

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(GREY);
    doc.text(stat.label, sx + statBoxW / 2, statY + 20, { align: "center" });
  });

  drawGoldLine(doc, 80, 192, 130);

  // Footer
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(LIGHT_GREY);
  doc.text("BNM – Betreuung neuer Muslime · iman.ngo", 105, 205, { align: "center" });
  doc.text("Ein iERA Projekt in Kooperation mit IMAN", 105, 212, { align: "center" });

  doc.setFontSize(8);
  doc.text(`Erstellt am: ${today}`, 105, 222, { align: "center" });
}

// ─── Öffentliche Download-Funktionen ─────────────────────────────────────────

export async function downloadMonthlyReportPDF(data: ReportData): Promise<boolean> {
  if (Platform.OS !== "web") return false;
  try {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    buildMonthlyReport(doc, data);
    const filename = `BNM-Monatsbericht-${data.periodLabel.replace(/\s/g, "-")}.pdf`;
    doc.save(filename);
    return true;
  } catch {
    return false;
  }
}

export async function downloadMentorAwardPDF(data: AwardData): Promise<boolean> {
  if (Platform.OS !== "web") return false;
  try {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    buildAwardPage(doc, data);
    const filename = `BNM-Mentor-des-Monats-${data.period.replace(/\s/g, "-")}.pdf`;
    doc.save(filename);
    return true;
  } catch {
    return false;
  }
}

export async function downloadDonorReportPDF(data: DonorReportData): Promise<boolean> {
  if (Platform.OS !== "web") return false;
  try {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    buildDonorReport(doc, data);
    const filename = `BNM-Spenderbericht-${data.periodLabel.replace(/\s/g, "-")}.pdf`;
    doc.save(filename);
    return true;
  } catch {
    return false;
  }
}
