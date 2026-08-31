import jsPDF from "jspdf";
import "jspdf-autotable";
import { formatNumber } from "@/services/sheetData";
import type { BudgetRow } from "@/services/sheetData";

const COLUMNS = [
  { key: "missionGroup" as const, label: "กลุ่มภารกิจ" },
  { key: "workGroup" as const, label: "กลุ่มงาน" },
  { key: "department" as const, label: "หน่วยงาน" },
  { key: "category" as const, label: "หมวด" },
  { key: "type" as const, label: "ประเภท" },
  { key: "item" as const, label: "รายการ" },
  { key: "totalPlan" as const, label: "ยอดรวมแผน" },
  { key: "used" as const, label: "ใช้ไป" },
  { key: "remaining" as const, label: "คงเหลือ" },
];

export function exportToPdf(data: BudgetRow[]) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Add Thai font support (using built-in, we'll use available encoding)
  doc.setFont("helvetica", "normal");

  // Header: Logo and title
  // Logo
  const logoUrl = "https://upload.wikimedia.org/wikipedia/commons/f/f9/%E0%B8%95%E0%B8%A3%E0%B8%B2%E0%B8%81%E0%B8%A3%E0%B8%B0%E0%B8%97%E0%B8%A3%E0%B8%A7%E0%B8%87%E0%B8%AA%E0%B8%B2%E0%B8%98%E0%B8%B2%E0%B8%A3%E0%B8%93%E0%B8%AA%E0%B8%B8%E0%B8%82%E0%B9%83%E0%B8%AB%E0%B8%A1%E0%B9%88.png?utm_source=th.wikipedia.org&utm_campaign=index&utm_content=original";

  // Add title
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("จัดซื้อจัดจ้างใช้ไป โรงพยาบาลนางรอง", 14, 12);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("รายงานข้อมูลการจัดซื้อจัดจ้าง", 14, 18);

  // Try to add the logo as an image (may fail due to CORS)
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = logoUrl;
  img.onload = () => {
    try {
      doc.addImage(img, "PNG", pageWidth - 25, 3, 20, 20);
    } catch {
      // Image load failed, continue without logo
    }
    finishPdf(doc, data, pageWidth, pageHeight);
  };
  img.onerror = () => {
    finishPdf(doc, data, pageWidth, pageHeight);
  };

  // Fallback: finish immediately if image doesn't load
  setTimeout(() => finishPdf(doc, data, pageWidth, pageHeight), 2000);
}

function finishPdf(
  doc: jsPDF,
  data: BudgetRow[],
  pageWidth: number,
  pageHeight: number
) {
  // Table data
  const body = data.map((row) =>
    COLUMNS.map((col) => {
      const val = row[col.key];
      return typeof val === "number" ? formatNumber(val) : String(val);
    })
  );

  // Column widths (landscape A4 ~ 297mm)
  const colWidths = [30, 30, 30, 25, 25, 40, 25, 25, 25];

  (doc as jsPDF & { autoTable: (options: Record<string, unknown>) => void }).autoTable({
    startY: 25,
    head: [COLUMNS.map((c) => c.label)],
    body,
    styles: {
      fontSize: 7,
      cellPadding: 2,
      overflow: "linebreak",
      font: "helvetica",
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: colWidths.reduce(
      (acc, w, i) => ({
        ...acc,
        [i]: { cellWidth: w },
      }),
      {} as Record<number, { cellWidth: number }>
    ),
    margin: { top: 25, left: 14, right: 14 },
    didDrawPage: (data: { pageNumber: number }) => {
      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `หน้า ${data.pageNumber}`,
        pageWidth / 2,
        pageHeight - 5,
        { align: "center" }
      );
    },
  });

  doc.save("budget_report.pdf");
}

export function exportToCsv(data: BudgetRow[]) {
  const headers = COLUMNS.map((c) => c.label).join(",");
  const rows = data.map((row) =>
    COLUMNS.map((col) => {
      const val = row[col.key];
      const str = typeof val === "number" ? formatNumber(val) : String(val);
      // Escape quotes and wrap in quotes if contains comma
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(",")
  );

  const csv = [headers, ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "budget_report.csv";
  a.click();
  URL.revokeObjectURL(url);
}
