import * as React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { aggregateByField, formatCompactNumber, type BudgetRow } from "@/services/sheetData";

interface DonutChartProps {
  data: BudgetRow[];
}

const COLORS = [
  "#06b6d4", "#f59e0b", "#8b5cf6", "#10b981",
  "#f43f5e", "#3b82f6", "#ec4899", "#14b8a6",
  "#f97316", "#6366f1", "#84cc16", "#a855f7",
];

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { totalPlan: number; used: number } }> }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-lg border border-white/50 bg-white/90 px-3 py-2 shadow-xl backdrop-blur-lg">
      <p className="mb-1 text-sm font-medium text-gray-700">{item.name}</p>
      <p className="text-xs text-cyan-600">แผน: {formatCompactNumber(item.payload.totalPlan)}</p>
      <p className="text-xs text-amber-600">ใช้ไป: {formatCompactNumber(item.value)}</p>
    </div>
  );
};

export function DonutChart({ data }: DonutChartProps) {
  const chartData = React.useMemo(() => {
    const aggregated = aggregateByField(data, "category", 0);
    return aggregated.filter((d) => d.used > 0);
  }, [data]);

  const totalUsed = chartData.reduce((s, d) => s + d.used, 0);

  if (chartData.length === 0) {
    return (
      <div className="rounded-2xl border border-white/40 bg-white/50 p-6 shadow-lg backdrop-blur-xl">
        <h3 className="mb-4 text-base font-semibold text-gray-800">สัดส่วนการใช้จ่ายตามหมวด</h3>
        <p className="py-8 text-center text-sm text-gray-400">ไม่มีข้อมูล</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/40 bg-white/50 p-6 shadow-lg backdrop-blur-xl">
      <h3 className="mb-4 text-base font-semibold text-gray-800">สัดส่วนการใช้จ่ายตามหมวด</h3>
      <div className="h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="45%"
              innerRadius={60}
              outerRadius={110}
              dataKey="used"
              nameKey="name"
              paddingAngle={2}
              strokeWidth={2}
              stroke="rgba(255,255,255,0.6)"
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 11, fontFamily: "Prompt" }}
              formatter={(value: string) => {
                const item = chartData.find((d) => d.name === value);
                const pct = totalUsed > 0 && item ? ((item.used / totalUsed) * 100).toFixed(1) : "0";
                return `${value} (${pct}%)`;
              }}
            />
            {/* Center text */}
            <text
              x="50%"
              y="42%"
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-gray-400"
              style={{ fontSize: 11, fontFamily: "Prompt" }}
            >
              ใช้ไปทั้งหมด
            </text>
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-gray-700"
              style={{ fontSize: 16, fontFamily: "Prompt", fontWeight: 700 }}
            >
              {formatCompactNumber(totalUsed)}
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
