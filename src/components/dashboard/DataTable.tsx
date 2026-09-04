import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { formatNumber, type BudgetRow } from "@/services/sheetData";
import {
  Search, ArrowUpDown, ArrowUp, ArrowDown, FileText, FileDown, RefreshCw, ChevronLeft, ChevronRight, Columns3, AlertTriangle, SearchX,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { exportToPdf, exportToCsv } from "./ExportUtils";

interface DataTableProps {
  data: BudgetRow[];
  loading: boolean;
  onSync: () => void;
  syncStatus: "idle" | "syncing" | "success" | "error";
}

type SortField = keyof BudgetRow | null;
type SortDir = "asc" | "desc";

const ROWS_PER_PAGE = 20;

const COLUMNS: { key: keyof BudgetRow; label: string; width: string }[] = [
  { key: "missionGroup", label: "กลุ่มภารกิจ", width: "140px" },
  { key: "workGroup", label: "กลุ่มงาน", width: "130px" },
  { key: "department", label: "หน่วยงาน", width: "120px" },
  { key: "category", label: "หมวด", width: "100px" },
  { key: "type", label: "ประเภท", width: "100px" },
  { key: "item", label: "รายการ", width: "170px" },
  { key: "totalPlan", label: "ยอดรวมแผน", width: "110px" },
  { key: "used", label: "ใช้ไป", width: "100px" },
  { key: "remaining", label: "คงเหลือ", width: "100px" },
];

export function DataTable({ data, loading, onSync, syncStatus }: DataTableProps) {
  const [search, setSearch] = React.useState("");
  const [sortField, setSortField] = React.useState<SortField>(null);
  const [sortDir, setSortDir] = React.useState<SortDir>("asc");
  const [page, setPage] = React.useState(0);
  const searchRef = React.useRef<HTMLInputElement>(null);
  const [visibleColumns, setVisibleColumns] = React.useState<Set<string>>(
    new Set(COLUMNS.map((c) => c.key))
  );
  const [showColumnToggle, setShowColumnToggle] = React.useState(false);

  const visibleCols = React.useMemo(
    () => COLUMNS.filter((c) => visibleColumns.has(c.key)),
    [visibleColumns]
  );

  // Ctrl+F keyboard shortcut
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside to close column toggle
  React.useEffect(() => {
    if (!showColumnToggle) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-col-toggle]")) {
        setShowColumnToggle(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showColumnToggle]);

  const toggleColumn = (key: string) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 1) next.delete(key); // keep at least 1
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const filtered = React.useMemo(() => {
    let result = data;
    if (search) {
      const lower = search.toLowerCase();
      result = result.filter((row) =>
        COLUMNS.some((col) => String(row[col.key]).toLowerCase().includes(lower))
      );
    }
    if (sortField) {
      result = [...result].sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortDir === "asc" ? aVal - bVal : bVal - aVal;
        }
        return sortDir === "asc"
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      });
    }
    return result;
  }, [data, search, sortField, sortDir]);

  // Summary totals
  const summary = React.useMemo(() => ({
    totalPlan: filtered.reduce((s, r) => s + r.totalPlan, 0),
    used: filtered.reduce((s, r) => s + r.used, 0),
    remaining: filtered.reduce((s, r) => s + r.remaining, 0),
  }), [filtered]);

  const handleSort = (field: keyof BudgetRow) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ field }: { field: keyof BudgetRow }) => {
    if (sortField !== field) return <ArrowUpDown className="size-3 text-gray-300" />;
    return sortDir === "asc" ? (
      <ArrowUp className="size-3 text-cyan-500" />
    ) : (
      <ArrowDown className="size-3 text-cyan-500" />
    );
  };

  // Reset page when search/sort changes
  React.useEffect(() => {
    setPage(0);
  }, [search, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const pagedData = filtered.slice(page * ROWS_PER_PAGE, (page + 1) * ROWS_PER_PAGE);

  return (
    <div className="rounded-2xl border border-white/40 bg-white/50 shadow-lg backdrop-blur-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-white/30">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              ref={searchRef}
              placeholder="ค้นหาข้อมูล... (Ctrl+F)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-64 pl-8 bg-white/70 backdrop-blur-sm border-white/40 focus:border-cyan-400 focus:ring-cyan-200"
            />
          </div>
          <span className="text-xs text-gray-400">
            {filtered.length} รายการ
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Column visibility toggle */}
          <div className="relative" data-col-toggle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowColumnToggle(!showColumnToggle)}
              className="gap-1.5 bg-white/70 border-white/40 hover:bg-white/90"
              title="เลือกคอลัมน์"
            >
              <Columns3 className="size-3.5" />
            </Button>
            {showColumnToggle && (
              <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-white/40 bg-white/90 p-2 shadow-xl backdrop-blur-xl">
                <p className="mb-1.5 px-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">คอลัมน์</p>
                {COLUMNS.map((col) => (
                  <label
                    key={col.key}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-gray-600 hover:bg-white/60 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={visibleColumns.has(col.key)}
                      onChange={() => toggleColumn(col.key)}
                      className="size-3.5 rounded border-gray-300 text-cyan-500 focus:ring-cyan-400"
                    />
                    {col.label}
                  </label>
                ))}
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onSync}
            disabled={syncStatus === "syncing"}
            className="gap-1.5 bg-white/70 border-white/40 hover:bg-white/90"
          >
            <RefreshCw className={`size-3.5 ${syncStatus === "syncing" ? "animate-spin" : ""}`} />
            ซิงก์ข้อมูลใหม่
          </Button>
          {syncStatus === "success" && (
            <span className="flex items-center gap-1 text-xs text-emerald-500">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE
            </span>
          )}
          <div className="flex gap-1.5 ml-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportToPdf(filtered)}
              className="gap-1.5 bg-white/70 border-white/40 hover:bg-white/90"
            >
              <FileText className="size-3.5" />
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportToCsv(filtered)}
              className="gap-1.5 bg-white/70 border-white/40 hover:bg-white/90"
            >
              <FileDown className="size-3.5" />
              CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <TooltipProvider>
        <div className="overflow-x-auto">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow className="border-b border-white/30">
                {visibleCols.map((col) => (
                  <TableHead
                    key={col.key}
                    style={{ width: col.width, minWidth: col.width, maxWidth: col.width }}
                    className="cursor-pointer select-none hover:bg-white/50 transition-colors text-xs font-semibold text-gray-600 overflow-hidden"
                    onClick={() => handleSort(col.key)}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      <SortIcon field={col.key} />
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={visibleCols.length} className="h-24 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                      <RefreshCw className="size-4 animate-spin" />
                      กำลังโหลดข้อมูล...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={visibleCols.length} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <div className="flex size-12 items-center justify-center rounded-full bg-gray-100">
                        <SearchX className="size-6 text-gray-300" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">ไม่พบข้อมูลที่ค้นหา</p>
                        <p className="mt-1 text-xs text-gray-400">
                          {search
                            ? `ไม่พบคำว่า "${search}" — ลองค้นหาด้วยคำอื่น หรือล้างตัวกรอง`
                            : "ลองล้างตัวกรองทั้งหมด หรือซิงก์ข้อมูลใหม่"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {pagedData.map((row) => {
                    const isOverBudget = row.used > row.totalPlan;
                    return (
                      <TableRow
                        key={row.id}
                        className={`border-b border-white/20 transition-colors ${
                          isOverBudget
                            ? "bg-rose-50/40 hover:bg-rose-50/60"
                            : "hover:bg-white/30"
                        }`}
                      >
                        {visibleCols.map((col) => {
                          const val = row[col.key];
                          const display =
                            typeof val === "number"
                              ? formatNumber(val)
                              : String(val);
                          const isText = typeof val === "string";
                          return (
                            <TableCell
                              key={col.key}
                              style={{ width: col.width, minWidth: col.width, maxWidth: col.width }}
                              className="text-xs text-gray-700 overflow-hidden whitespace-nowrap"
                            >
                              {col.key === "used" && isOverBudget ? (
                                <span className="inline-flex items-center gap-1 text-rose-600 font-medium">
                                  {display}
                                  <AlertTriangle className="size-3 text-rose-400" />
                                </span>
                              ) : isText ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="block truncate cursor-default">
                                      {display}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-xs text-xs">
                                    {display}
                                  </TooltipContent>
                                </Tooltip>
                              ) : (
                                <span className="text-right block truncate">{display}</span>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                </>
              )}
            </TableBody>

            {/* Summary Row */}
            {!loading && filtered.length > 0 && (
              <TableBody>
                <TableRow className="border-t-2 border-cyan-200 bg-cyan-50/50 font-semibold">
                  <TableCell
                    colSpan={Math.max(0, visibleCols.findIndex((c) => c.key === "totalPlan"))}
                    className="text-xs text-gray-600 overflow-hidden"
                  >
                    รวม {filtered.length} รายการ
                  </TableCell>
                  {visibleCols.some((c) => c.key === "totalPlan") && (
                    <TableCell
                      style={{ width: "110px", minWidth: "110px", maxWidth: "110px" }}
                      className="text-xs text-cyan-700 font-bold text-right"
                    >
                      {formatNumber(summary.totalPlan)}
                    </TableCell>
                  )}
                  {visibleCols.some((c) => c.key === "used") && (
                    <TableCell
                      style={{ width: "100px", minWidth: "100px", maxWidth: "100px" }}
                      className="text-xs text-cyan-700 font-bold text-right"
                    >
                      {formatNumber(summary.used)}
                    </TableCell>
                  )}
                  {visibleCols.some((c) => c.key === "remaining") && (
                    <TableCell
                      style={{ width: "100px", minWidth: "100px", maxWidth: "100px" }}
                      className="text-xs text-cyan-700 font-bold text-right"
                    >
                      {formatNumber(summary.remaining)}
                    </TableCell>
                  )}
                </TableRow>
              </TableBody>
            )}
          </Table>
        </div>
      </TooltipProvider>

      {/* Pagination */}
      {filtered.length > ROWS_PER_PAGE && (
        <div className="flex items-center justify-between border-t border-white/30 px-4 py-3">
          <span className="text-xs text-gray-400">
            หน้า {page + 1} จาก {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="inline-flex size-8 items-center justify-center rounded-lg border border-white/40 bg-white/60 text-gray-600 backdrop-blur-sm transition-all hover:bg-white/80 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="size-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i)
              .filter((i) => i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 2)
              .reduce<(number | "ellipsis")[]>((acc, i, idx, arr) => {
                if (idx > 0 && i - (arr[idx - 1] as number) > 1) acc.push("ellipsis");
                acc.push(i);
                return acc;
              }, [])
              .map((item, idx) =>
                item === "ellipsis" ? (
                  <span key={`e${idx}`} className="size-8 inline-flex items-center justify-center text-xs text-gray-400">...</span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setPage(item)}
                    className={`inline-flex size-8 items-center justify-center rounded-lg text-xs font-medium backdrop-blur-sm transition-all ${
                      page === item
                        ? "bg-cyan-500 text-white shadow-md shadow-cyan-200"
                        : "border border-white/40 bg-white/60 text-gray-600 hover:bg-white/80"
                    }`}
                  >
                    {item + 1}
                  </button>
                )
              )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="inline-flex size-8 items-center justify-center rounded-lg border border-white/40 bg-white/60 text-gray-600 backdrop-blur-sm transition-all hover:bg-white/80 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
