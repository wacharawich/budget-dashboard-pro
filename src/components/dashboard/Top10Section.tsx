import * as React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { topNByPlan, formatCompactNumber, type BudgetRow } from "@/services/sheetData";

interface Top10SectionProps {
  data: BudgetRow[];
}

const CHART_DIMENSIONS = [
  { key: "missionGroup" as const, label: "กลุ่มภารกิจ", color: "#06b6d4" },
  { key: "workGroup" as const, label: "กลุ่มงาน", color: "#8b5cf6" },
  { key: "department" as const, label: "หน่วยงาน", color: "#0ea5e9" },
  { key: "category" as const, label: "หมวด", color: "#f59e0b" },
  { key: "type" as const, label: "ประเภท", color: "#14b8a6" },
  { key: "item" as const, label: "รายการ", color: "#f43f5e" },
];

function HorizontalBarChart({
  data,
  label,
  color,
}: {
  data: { name: string; totalPlan: number; used: number }[];
  label: string;
  color: string;
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
      <h4 className="mb-3 text-sm font-semibold text-gray-700">TOP 10 {label}</h4>
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
                    <p className="text-xs font-medium text-gray-700">{item?.name}</p>
                    <p className="text-xs text-blue-600">แผน: {formatCompactNumber(item?.totalPlan || 0)}</p>
                  </div>
                );
              }}
            />
            <Bar dataKey="totalPlan" fill={color} radius={[0, 4, 4, 0]} />
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
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
            />
          );
        })}
      </div>
    </div>
  );
}
