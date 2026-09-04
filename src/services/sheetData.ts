export interface BudgetRow {
  id: number;
  missionGroup: string; // กลุ่มภารกิจ
  workGroup: string; // กลุ่มงาน
  department: string; // หน่วยงาน
  category: string; // หมวด
  type: string; // ประเภท
  item: string; // รายการ
  totalPlan: number; // ยอดรวมแผน
  used: number; // ใช้ไป
  remaining: number; // คงเหลือ
}

const SHEET_ID = "1UtSyrAUOXdtRiztXbN4ntobPeS0fMErUrAIeK4NRxcw";
const SHEET_NAME = "Activeplan";

function csvToArray(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < text.length && text[i + 1] === '"') {
          currentField += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        currentField += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        currentRow.push(currentField.trim());
        currentField = "";
      } else if (ch === "\n" || ch === "\r") {
        if (ch === "\r" && i + 1 < text.length && text[i + 1] === "\n") {
          i++;
        }
        currentRow.push(currentField.trim());
        if (currentRow.some((f) => f !== "")) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = "";
      } else {
        currentField += ch;
      }
    }
  }
  currentRow.push(currentField.trim());
  if (currentRow.some((f) => f !== "")) {
    rows.push(currentRow);
  }
  return rows;
}

function parseNumber(value: string): number {
  const cleaned = value.replace(/[,\s]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function ceToBuddhistYear(ceYear: number): number {
  return ceYear + 543;
}

export function toBuddhistDate(dateStr: string): string {
  if (!dateStr) return "";
  // Try to parse various date formats
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const year = date.getFullYear();
  const buddhistYear = ceToBuddhistYear(year);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${day}/${month}/${buddhistYear}`;
}

export function formatDateBuddhist(date: Date): string {
  const year = ceToBuddhistYear(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${day}/${month}/${year}`;
}

/**
 * Fetch fiscal year (ปีงบประมาณ) from sheet "sheet99", Column Z.
 * Returns null if the sheet/column is unavailable so callers can fall back.
 */
export async function fetchFiscalYear(): Promise<string | null> {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent("sheet99")}`;
    const response = await fetch(url);
    if (!response.ok) return null;

    const text = await response.text();
    const rows = csvToArray(text);

    // Column Z = index 25. Skip the header ("ปีงบประมาณ") by requiring digits.
    for (const row of rows) {
      const raw = row[25];
      if (!raw) continue;
      const digits = raw.replace(/[^0-9]/g, "");
      if (digits) return digits;
    }
    return null;
  } catch {
    return null;
  }
}

export async function fetchSheetData(): Promise<BudgetRow[]> {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch sheet data: ${response.status}`);
  }

  const text = await response.text();
  const rows = csvToArray(text);

  // Skip header row
  if (rows.length < 2) return [];

  const data: BudgetRow[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 9) continue;

    data.push({
      id: i,
      missionGroup: row[0] || "",
      workGroup: row[1] || "",
      department: row[2] || "",
      category: row[3] || "",
      type: row[4] || "",
      item: row[5] || "",
      totalPlan: parseNumber(row[6]),
      used: parseNumber(row[7]),
      remaining: parseNumber(row[8]),
    });
  }

  return data;
}

export function aggregateByField(
  data: BudgetRow[],
  field: keyof BudgetRow,
  maxItems = 12
): { name: string; totalPlan: number; used: number }[] {
  const map = new Map<string, { totalPlan: number; used: number }>();

  for (const row of data) {
    const key = String(row[field]);
    const existing = map.get(key) || { totalPlan: 0, used: 0 };
    existing.totalPlan += row.totalPlan;
    existing.used += row.used;
    map.set(key, existing);
  }

  const result = Array.from(map.entries())
    .map(([name, values]) => ({ name, ...values }))
    .sort((a, b) => b.totalPlan - a.totalPlan);

  return maxItems > 0 ? result.slice(0, maxItems) : result;
}

export function topNByPlan(
  data: BudgetRow[],
  field: keyof BudgetRow,
  n = 10
): { name: string; totalPlan: number; used: number }[] {
  return aggregateByField(data, field, n);
}

export function formatCompactNumber(value: number): string {
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(2) + "M";
  }
  if (value >= 1_000) {
    return (value / 1_000).toFixed(1) + "K";
  }
  return value.toFixed(2);
}

export function formatNumber(value: number): string {
  return value.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
