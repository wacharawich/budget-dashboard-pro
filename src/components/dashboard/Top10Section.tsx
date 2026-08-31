import * as React from "react";
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { topNByPlan, formatCompactNumber, type BudgetRow } from "@/services/sheetData";

interface Top10SectionProps {
  data: BudgetRow[];
}

const PLAN_COLOR = "#10b981";
const USED_COLOR = "#f97316";

const PER_ITEM_PLAN_COLORS = [
  "#10b981", "#34d399", "#059669", "#6ee7b7", "#047857",
  "#a7f3d0", "#0d9488", "#2dd4bf", "#14b8a6", "#5eead4",
];
const PER_ITEM_USED_COLORS = [
  "#f97316", "#fb923c", "#ea580c", "#fdba74", "#c2410c",
  "#fed7aa", "#f59e0b", "#fbbf24", "#d97706", "#fcd34d",
];

const CHART_DIMENSIONS = [
  { key: "missionGroup" as const, label: "กลุ่มภารกิจ", color: "#06b6d4" },
  { key: "workGroup" as const, label: "กลุ่มงาน", color: "#8b5cf6" },
  { key: "department" as const, label: "หน่วยงาน", color: "#0ea5e9" },
  { key: "category" as const, label: "หมวด", color: "#f59e0b", multiColor: true as const },
  { key: "type" as const, label: "ประเภท", color: "#14b8a6" },
  { key: "item" as const, label: "รายการ", color: "#f43f5e" },
];

function HorizontalBarChart({
  data,
  label,
  color,
  multiColor = false,
}: {
  data: { name: string; totalPlan: number; used: number }[];
  label: string;
  color: string;
  multiColor?: boolean;
}) {
  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-white/40 bg-white/50 p-4 shadow-lg backdrop-blur-xl">
        <h4 className="mb-2 text-sm font-semibold text-gray-700">TOP 10 {label}</h4>
        <p className="py-4 text-center text-xs text-gray-400">ไม่มีข้อมูล</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/40 bg-white/50 p-4 shadow-lg backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-700">TOP 10 {label}</h4>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[10px] text-gray-500">
            <span className="inline-block size-2 rounded-sm" style={{ backgroundColor: PLAN_COLOR }} />แผน
          </span>
          <span className="flex items-center gap-1 text-[10px] text-gray-500">
            <span className="inline-block size-2 rounded-sm" style={{ backgroundColor: USED_COLOR }} />ใช้ไป
          </span>
        </div>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 10, fontFamily: "Prompt", fill: "#6b7280" }}
              tickFormatter={(v) => formatCompactNumber(v)}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 10, fontFamily: "Prompt", fill: "#6b7280" }}
              width={120}
              tickFormatter={(v) => v.length > 15 ? v.slice(0, 15) + "..." : v}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const item = payload[0]?.payload;
                return (
                  <div className="rounded-lg border border-white/50 bg-white/90 px-3 py-2 shadow-xl backdrop-blur-lg">
                    <p className="mb-1 text-xs font-medium text-gray-700">{item?.name}</p>
                    <p className="text-xs" style={{ color: PLAN_COLOR }}>แผน: {formatCompactNumber(item?.totalPlan || 0)}</p>
                    <p className="text-xs" style={{ color: USED_COLOR }}>ใช้ไป: {formatCompactNumber(item?.used || 0)}</p>
                  </div>
                );
              }}
            />
            <Bar dataKey="totalPlan" name="แผน" fill={PLAN_COLOR} radius={[0, 4, 4, 0]} barSize={8}>
              {multiColor && data.map((_, i) => (
                <Cell key={i} fill={PER_ITEM_PLAN_COLORS[i % PER_ITEM_PLAN_COLORS.length]} />
              ))}
            </Bar>
            <Bar dataKey="used" name="ใช้ไป" fill={USED_COLOR} radius={[0, 4, 4, 0]} barSize={8}>
              {multiColor && data.map((_, i) => (
                <Cell key={i} fill={PER_ITEM_USED_COLORS[i % PER_ITEM_USED_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function SummaryComparisonChart({ data }: { data: BudgetRow[] }) {
  const summaryData = React.useMemo(() => {
    const totals = CHART_DIMENSIONS.map((dim) => {
      const top = topNByPlan(data, dim.key, 10);
      return {
        name: dim.label,
        totalPlan: top.reduce((s, r) => s + r.totalPlan, 0),
        used: top.reduce((s, r) => s + r.used, 0),
      };
    });
    return totals.filter((d) => d.totalPlan > 0);
  }, [data]);

  if (summaryData.length === 0) return null;

  return (
    <div className="rounded-2xl border border-white/40 bg-white/50 p-6 shadow-lg backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-base font-semibold text-gray-800">แผน vs ใช้ไป — เปรียบเทียบตามมิติ</h4>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[10px] text-gray-500">
            <span className="inline-block size-2 rounded-sm" style={{ backgroundColor: PLAN_COLOR }} />แผน
          </span>
          <span className="flex items-center gap-1 text-[10px] text-gray-500">
            <span className="inline-block size-2 rounded-sm" style={{ backgroundColor: USED_COLOR }} />ใช้ไป
          </span>
        </div>
      </div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={summaryData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fontFamily: "Prompt", fill: "#6b7280" }}
            />
            <YAxis
              tick={{ fontSize: 10, fontFamily: "Prompt", fill: "#6b7280" }}
              tickFormatter={(v) => formatCompactNumber(v)}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="rounded-lg border border-white/50 bg-white/90 px-3 py-2 shadow-xl backdrop-blur-lg">
                    <p className="mb-1 text-xs font-medium text-gray-700">{label}</p>
                    {payload.map((p) => (
                      <p key={p.name} className="text-xs" style={{ color: p.color }}>
                        {p.name === "totalPlan" ? "แผน" : "ใช้ไป"}: {formatCompactNumber(p.value as number)}
                      </p>
                    ))}
                  </div>
                );
              }}
            />
            <Bar dataKey="totalPlan" name="totalPlan" fill={PLAN_COLOR} radius={[4, 4, 0, 0]} />
            <Bar dataKey="used" name="used" fill={USED_COLOR} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function Top10Section({ data }: Top10SectionProps) {
  return (
    <div>
      <h3 className="mb-4 text-base font-semibold text-gray-800">TOP 10 ยอดรวมแผนสูงสุด</h3>
      <SummaryComparisonChart data={data} />
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {CHART_DIMENSIONS.map((dim) => {
          const topData = React.useMemo(
            () => topNByPlan(data, dim.key, 10),
            [data, dim.key]
          );
          return (
            <HorizontalBarChart
              key={dim.key}
              data={topData}
              label={dim.label}
              color={dim.color}
              multiColor={dim.multiColor}
            />
          );
        })}
      </div>
    </div>
  );
}
