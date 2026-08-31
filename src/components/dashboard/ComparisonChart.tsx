import * as React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { aggregateByField, formatCompactNumber, type BudgetRow } from "@/services/sheetData";
import { cn } from "@/lib/utils";

interface ComparisonChartProps {
  data: BudgetRow[];
}

const DIMENSIONS = [
  { key: "missionGroup" as const, label: "กลุ่มภารกิจ" },
  { key: "workGroup" as const, label: "กลุ่มงาน" },
  { key: "department" as const, label: "หน่วยงาน" },
  { key: "category" as const, label: "หมวด" },
  { key: "type" as const, label: "ประเภท" },
  { key: "item" as const, label: "รายการ" },
];

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

const CustomBarLabel = ({ x, y, width, value }: { x: number; y: number; width: number; value: number }) => {
  if (value < 1000) return null;
  return (
    <text
      x={x + width / 2}
      y={y - 6}
      fill="#374151"
      textAnchor="middle"
      fontSize={10}
      fontFamily="Prompt"
    >
      {formatCompactNumber(value)}
    </text>
  );
};

export function ComparisonChart({ data }: ComparisonChartProps) {
  const [activeDimension, setActiveDimension] = React.useState(0);

  const dimension = DIMENSIONS[activeDimension];
  const chartData = React.useMemo(
    () => aggregateByField(data, dimension.key, 12),
    [data, dimension.key]
  );

  return (
    <div className="rounded-2xl border border-white/40 bg-white/50 p-6 shadow-lg backdrop-blur-xl">
      <h3 className="mb-4 text-base font-semibold text-gray-800">
        แผน vs ใช้ไป — จำแนกตาม {dimension.label}
      </h3>
      {/* Dimension selector */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {DIMENSIONS.map((dim, i) => (
          <button
            key={dim.key}
            onClick={() => setActiveDimension(i)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-all duration-200",
              i === activeDimension
                ? "bg-cyan-500 text-white shadow-md shadow-cyan-200"
                : "bg-white/70 text-gray-600 hover:bg-white/90 border border-white/40"
            )}
          >
            {dim.label}
          </button>
        ))}
      </div>
      <div className="h-[320px]">
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
            <Legend
              wrapperStyle={{ fontSize: 12, fontFamily: "Prompt" }}
            />
            <Bar
              dataKey="totalPlan"
              name="ยอดรวมแผน"
              fill="#06b6d4"
              radius={[4, 4, 0, 0]}
              label={<CustomBarLabel x={0} y={0} width={0} value={0} />}
            />
            <Bar
              dataKey="used"
              name="ใช้ไป"
              fill="#f59e0b"
              radius={[4, 4, 0, 0]}
              label={<CustomBarLabel x={0} y={0} width={0} value={0} />}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
