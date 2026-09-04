import * as React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { aggregateByField, formatCompactNumber, type BudgetRow } from "@/services/sheetData";
import { Download } from "lucide-react";

interface CategoryChartProps {
  data: BudgetRow[];
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
  if (!active || !payload) return null;
  return (
    <div className="rounded-lg border border-white/50 bg-white/90 px-3 py-2 shadow-xl backdrop-blur-lg">
      <p className="mb-1 text-sm font-medium text-gray-700">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-xs text-gray-600">
          <span className="inline-block size-2 rounded-full mr-1" style={{ backgroundColor: entry.color }} />
          {entry.name}: {formatCompactNumber(entry.value)}
        </p>
      ))}
    </div>
  );
};

export function CategoryChart({ data }: CategoryChartProps) {
  const chartRef = React.useRef<HTMLDivElement>(null);
  const chartData = React.useMemo(
    () => aggregateByField(data, "category", 0),
    [data]
  );

  const handleExportPng = () => {
    const el = chartRef.current;
    if (!el) return;
    import("html-to-image").then(({ toPng }) => {
      toPng(el, { backgroundColor: "#ffffff", pixelRatio: 2 }).then((dataUrl) => {
        const link = document.createElement("a");
        link.download = "category-chart.png";
        link.href = dataUrl;
        link.click();
      });
    });
  };

  return (
    <div className="rounded-2xl border border-white/40 bg-white/50 p-6 shadow-lg backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-800">
          ติดตามการใช้ตามหมวด — ยอดรวมแผน เทียบกับ ใช้ไป
        </h3>
        <button
          onClick={handleExportPng}
          className="flex items-center gap-1 rounded-lg border border-white/40 bg-white/60 px-2 py-1 text-[10px] font-medium text-gray-500 transition-all hover:bg-white/80 hover:text-gray-700"
          title="บันทึกเป็น PNG"
        >
          <Download className="size-3" />
          PNG
        </button>
      </div>
      <div ref={chartRef} className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fontFamily: "Prompt", fill: "#6b7280" }}
              interval={0}
              angle={-35}
              textAnchor="end"
              height={60}
            />
            <YAxis
              tick={{ fontSize: 11, fontFamily: "Prompt", fill: "#6b7280" }}
              tickFormatter={(v) => formatCompactNumber(v)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, fontFamily: "Prompt" }} />
            <Bar dataKey="totalPlan" name="ยอดรวมแผน" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            <Bar dataKey="used" name="ใช้ไป" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
