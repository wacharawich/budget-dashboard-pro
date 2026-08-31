import * as React from "react";
import { OverviewCards } from "@/components/dashboard/OverviewCards";
import { ComparisonChart } from "@/components/dashboard/ComparisonChart";
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { Top10Section } from "@/components/dashboard/Top10Section";
import { DataTable } from "@/components/dashboard/DataTable";
import { MultiSelectFilter } from "@/components/dashboard/MultiSelectFilter";
import { fetchSheetData, type BudgetRow, formatDateBuddhist } from "@/services/sheetData";
import { RefreshCw, BarChart3 } from "lucide-react";

function uniqueSorted(data: BudgetRow[], field: keyof BudgetRow): string[] {
  const set = new Set(data.map((r) => String(r[field])).filter(Boolean));
  return Array.from(set).sort((a, b) => a.localeCompare(b, "th"));
}

export default function Dashboard() {
  const [data, setData] = React.useState<BudgetRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [syncStatus, setSyncStatus] = React.useState<"idle" | "syncing" | "success" | "error">("idle");

  // Filter state
  const [filterMissionGroup, setFilterMissionGroup] = React.useState<string[]>([]);
  const [filterWorkGroup, setFilterWorkGroup] = React.useState<string[]>([]);
  const [filterDepartment, setFilterDepartment] = React.useState<string[]>([]);
  const [filterCategory, setFilterCategory] = React.useState<string[]>([]);
  const [filterType, setFilterType] = React.useState<string[]>([]);
  const [filterItem, setFilterItem] = React.useState<string[]>([]);

  const loadData = React.useCallback(async () => {
    setSyncStatus("syncing");
    try {
      const rows = await fetchSheetData();
      setData(rows);
      setSyncStatus("success");
    } catch {
      setSyncStatus("error");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter data — exclude rows with empty รายการ
  const filteredData = React.useMemo(() => {
    return data.filter((row) => {
      if (!row.item) return false;
      if (filterMissionGroup.length > 0 && !filterMissionGroup.includes(row.missionGroup)) return false;
      if (filterWorkGroup.length > 0 && !filterWorkGroup.includes(row.workGroup)) return false;
      if (filterDepartment.length > 0 && !filterDepartment.includes(row.department)) return false;
      if (filterCategory.length > 0 && !filterCategory.includes(row.category)) return false;
      if (filterType.length > 0 && !filterType.includes(row.type)) return false;
      if (filterItem.length > 0 && !filterItem.includes(row.item)) return false;
      return true;
    });
  }, [data, filterMissionGroup, filterWorkGroup, filterDepartment, filterCategory, filterType, filterItem]);

  const filterOptions = React.useMemo(() => ({
    missionGroup: uniqueSorted(data, "missionGroup"),
    workGroup: uniqueSorted(data, "workGroup"),
    department: uniqueSorted(data, "department"),
    category: uniqueSorted(data, "category"),
    type: uniqueSorted(data, "type"),
    item: uniqueSorted(data, "item"),
  }), [data]);

  const hasActiveFilters =
    filterMissionGroup.length > 0 ||
    filterWorkGroup.length > 0 ||
    filterDepartment.length > 0 ||
    filterCategory.length > 0 ||
    filterType.length > 0 ||
    filterItem.length > 0;

  const clearAllFilters = () => {
    setFilterMissionGroup([]);
    setFilterWorkGroup([]);
    setFilterDepartment([]);
    setFilterCategory([]);
    setFilterType([]);
    setFilterItem([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-teal-50">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-sky-200/25 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-teal-200/25 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-amber-100/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-500/10 backdrop-blur-sm border border-cyan-200/50">
                <BarChart3 className="size-5 text-cyan-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800 tracking-tight">
                  จัดซื้อจัดจ้างใช้ไป
                </h1>
                <p className="text-xs text-gray-500">
                  โรงพยาบาลนางรอง · ข้อมูล ณ {formatDateBuddhist(new Date())}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadData}
                disabled={syncStatus === "syncing"}
                className="flex items-center gap-2 rounded-xl border border-white/40 bg-white/60 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm backdrop-blur-sm transition-all hover:bg-white/80 hover:shadow-md disabled:opacity-50"
              >
                <RefreshCw className={`size-4 ${syncStatus === "syncing" ? "animate-spin" : ""}`} />
                ซิงก์ข้อมูลใหม่
              </button>
              {syncStatus === "success" && (
                <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1 backdrop-blur-sm">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-medium text-emerald-600">LIVE</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Overview Cards */}
        <OverviewCards data={filteredData} />

        {/* Filters Section */}
        <div className="relative z-20 mt-6 rounded-2xl border border-white/40 bg-white/50 p-4 shadow-lg backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">ตัวกรองข้อมูล</h3>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-cyan-600 hover:text-cyan-800 transition-colors"
              >
                ล้างตัวกรองทั้งหมด
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            <MultiSelectFilter
              label="กลุ่มภารกิจ"
              options={filterOptions.missionGroup}
              selected={filterMissionGroup}
              onChange={setFilterMissionGroup}
              placeholder="ทั้งหมด"
            />
            <MultiSelectFilter
              label="กลุ่มงาน"
              options={filterOptions.workGroup}
              selected={filterWorkGroup}
              onChange={setFilterWorkGroup}
              placeholder="ทั้งหมด"
            />
            <MultiSelectFilter
              label="หน่วยงาน"
              options={filterOptions.department}
              selected={filterDepartment}
              onChange={setFilterDepartment}
              placeholder="ทั้งหมด"
            />
            <MultiSelectFilter
              label="หมวด"
              options={filterOptions.category}
              selected={filterCategory}
              onChange={setFilterCategory}
              placeholder="ทั้งหมด"
            />
            <MultiSelectFilter
              label="ประเภท"
              options={filterOptions.type}
              selected={filterType}
              onChange={setFilterType}
              placeholder="ทั้งหมด"
            />
            <MultiSelectFilter
              label="รายการ"
              options={filterOptions.item}
              selected={filterItem}
              onChange={setFilterItem}
              placeholder="ทั้งหมด"
            />
          </div>
        </div>

        {/* Charts Grid */}
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ComparisonChart data={filteredData} />
          <CategoryChart data={filteredData} />
        </div>

        {/* Top 10 Section */}
        <div className="mt-6">
          <Top10Section data={filteredData} />
        </div>

        {/* Data Table */}
        <div className="mt-6">
          <DataTable data={filteredData} loading={loading} onSync={loadData} syncStatus={syncStatus} />
        </div>

        {/* Footer */}
        <footer className="mt-8 pb-6 text-center text-xs text-gray-400">
          จัดซื้อจัดจ้างใช้ไป · โรงพยาบาลนางรอง
        </footer>
      </div>
    </div>
  );
}
