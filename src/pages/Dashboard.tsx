import * as React from "react";
import { OverviewCards } from "@/components/dashboard/OverviewCards";
import { ComparisonChart } from "@/components/dashboard/ComparisonChart";
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { InsightsSection } from "@/components/dashboard/InsightsSection";
import { Top10Section } from "@/components/dashboard/Top10Section";
import { DataTable } from "@/components/dashboard/DataTable";
import { MultiSelectFilter } from "@/components/dashboard/MultiSelectFilter";
import { fetchSheetData, type BudgetRow, formatDateBuddhist } from "@/services/sheetData";
import { motion } from "framer-motion";
import { RefreshCw, BarChart3, AlertTriangle, Calendar, Clock, Filter, Lightbulb, BarChart, ListOrdered, Table2, ChevronUp } from "lucide-react";

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
  const [showOverBudgetOnly, setShowOverBudgetOnly] = React.useState(false);

  const [lastSync, setLastSync] = React.useState<Date | null>(null);

  const loadData = React.useCallback(async () => {
    setSyncStatus("syncing");
    try {
      const rows = await fetchSheetData();
      setData(rows);
      setLastSync(new Date());
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
      if (showOverBudgetOnly && row.used <= row.totalPlan) return false;
      return true;
    });
  }, [data, filterMissionGroup, filterWorkGroup, filterDepartment, filterCategory, filterType, filterItem, showOverBudgetOnly]);

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

  // Fiscal year helper (Thai fiscal year: Oct–Sep)
  const getFiscalYear = () => {
    const now = new Date();
    const year = now.getMonth() >= 9 ? now.getFullYear() + 543 : now.getFullYear() + 542;
    return year;
  };
  const fiscalYear = getFiscalYear();

  // Section navigation
  const sectionRefs = React.useRef<Record<string, HTMLDivElement | null>>({
    overview: null,
    filters: null,
    insights: null,
    charts: null,
    top10: null,
    table: null,
  });
  const [activeSection, setActiveSection] = React.useState("overview");
  const [showScrollTop, setShowScrollTop] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
      const sections = Object.entries(sectionRefs.current);
      for (let i = sections.length - 1; i >= 0; i--) {
        const [key, el] = sections[i];
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveSection(key);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (key: string) => {
    sectionRefs.current[key]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const NAV_ITEMS = [
    { key: "overview", label: "ภาพรวม", icon: BarChart3 },
    { key: "filters", label: "ตัวกรอง", icon: Filter },
    { key: "insights", label: "ข้อค้นพบ", icon: Lightbulb },
    { key: "charts", label: "กราฟ", icon: BarChart },
    { key: "top10", label: "TOP 10", icon: ListOrdered },
    { key: "table", label: "ตาราง", icon: Table2 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-teal-50">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-sky-200/25 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-teal-200/25 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-amber-100/20 blur-3xl" />
      </div>

      {/* Floating Section Navigation */}
      <nav className="fixed left-4 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-1 rounded-2xl border border-white/40 bg-white/70 p-1.5 shadow-lg backdrop-blur-xl">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            onClick={() => scrollTo(item.key)}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-[11px] font-medium transition-all duration-200 ${
              activeSection === item.key
                ? "bg-cyan-500 text-white shadow-md shadow-cyan-200"
                : "text-gray-500 hover:bg-white/80 hover:text-gray-700"
            }`}
            title={item.label}
          >
            <item.icon className="size-3.5" />
            <span className="whitespace-nowrap">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Scroll to top */}
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 flex size-10 items-center justify-center rounded-full border border-white/40 bg-white/80 shadow-lg backdrop-blur-xl transition-all hover:bg-white hover:shadow-xl"
        >
          <ChevronUp className="size-5 text-gray-600" />
        </motion.button>
      )}

      <div className="relative z-10 mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:pl-28">
        {/* Header */}
        <header className="mb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/f/f9/%E0%B8%95%E0%B8%A3%E0%B8%B2%E0%B8%81%E0%B8%A3%E0%B8%B0%E0%B8%97%E0%B8%A3%E0%B8%A7%E0%B8%87%E0%B8%AA%E0%B8%B2%E0%B8%98%E0%B8%B2%E0%B8%A3%E0%B8%93%E0%B8%AA%E0%B8%B8%E0%B8%82%E0%B9%83%E0%B8%AB%E0%B8%A1%E0%B9%88.png?utm_source=th.wikipedia.org&utm_campaign=index&utm_content=original"
                alt="ตรากระทรวงสาธารณสุข"
                className="size-11 rounded-xl border border-white/40 shadow-sm"
              />
              <div>
                <h1 className="text-lg font-bold text-gray-800 tracking-tight">
                  จัดซื้อจัดจ้างใช้ไป
                </h1>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" /> ปีงบประมาณ {fiscalYear}
                  </span>
                  <span>·</span>
                  <span>โรงพยาบาลนางรอง</span>
                  {lastSync && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" /> อัปเดต {lastSync.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </>
                  )}
                </div>
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
        <div ref={(el) => { sectionRefs.current.overview = el; }} id="section-overview">
          <OverviewCards data={filteredData} />
        </div>

        {/* Filters Section */}
        <div ref={(el) => { sectionRefs.current.filters = el; }} id="section-filters" className="relative z-20 mt-6 rounded-2xl border border-white/40 bg-white/50 p-4 shadow-lg backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">ตัวกรองข้อมูล</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowOverBudgetOnly(!showOverBudgetOnly)}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                  showOverBudgetOnly
                    ? "border-rose-300 bg-rose-50 text-rose-600 shadow-sm"
                    : "border-white/40 bg-white/60 text-gray-500 hover:bg-white/80"
                }`}
              >
                <AlertTriangle className="size-3.5" />
                เกินงบเท่านั้น
              </button>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-cyan-600 hover:text-cyan-800 transition-colors"
                >
                  ล้างตัวกรองทั้งหมด
                </button>
              )}
            </div>
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

        {/* Insights */}
        <div ref={(el) => { sectionRefs.current.insights = el; }} id="section-insights" className="mt-6">
          <InsightsSection data={filteredData} />
        </div>

        {/* Charts Grid */}
        <div ref={(el) => { sectionRefs.current.charts = el; }} id="section-charts" className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ComparisonChart data={filteredData} />
          <CategoryChart data={filteredData} />
        </div>

        {/* Top 10 */}
        <div ref={(el) => { sectionRefs.current.top10 = el; }} id="section-top10" className="mt-6">
          <Top10Section data={filteredData} />
        </div>



        {/* Data Table */}
        <div ref={(el) => { sectionRefs.current.table = el; }} id="section-table" className="mt-6">
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
