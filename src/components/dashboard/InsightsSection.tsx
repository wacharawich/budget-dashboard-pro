import * as React from "react";
import { AlertTriangle, TrendingUp, TrendingDown, Lightbulb, ArrowRight } from "lucide-react";
import { formatNumber, type BudgetRow } from "@/services/sheetData";

interface InsightsSectionProps {
  data: BudgetRow[];
}

interface Insight {
  type: "warning" | "success" | "info" | "danger";
  icon: React.ReactNode;
  title: string;
  detail: string;
}

function generateInsights(data: BudgetRow[]): Insight[] {
  if (data.length === 0) return [];

  const insights: Insight[] = [];
  const totalPlan = data.reduce((s, r) => s + r.totalPlan, 0);
  const totalUsed = data.reduce((s, r) => s + r.used, 0);
  const totalRemaining = data.reduce((s, r) => s + r.remaining, 0);
  const utilizationRate = totalPlan > 0 ? (totalUsed / totalPlan) * 100 : 0;

  // 1. Over-budget items
  const overBudget = data.filter((r) => r.used > r.totalPlan);
  if (overBudget.length > 0) {
    const topOver = [...overBudget].sort((a, b) => (b.used - b.totalPlan) - (a.used - a.totalPlan))[0];
    const overAmount = overBudget.reduce((s, r) => s + (r.used - r.totalPlan), 0);
    insights.push({
      type: "danger",
      icon: <AlertTriangle className="size-5" />,
      title: `${overBudget.length} รายการเกินงบประมาณ`,
      detail: `เกินงบรวม ${formatNumber(overAmount)} บาท — รายการที่เกินมากที่สุดคือ "${topOver.item}" เกิน ${formatNumber(topOver.used - topOver.totalPlan)} บาท`,
    });
  }

  // 2. Utilization rate insight
  if (utilizationRate > 90) {
    insights.push({
      type: "warning",
      icon: <TrendingUp className="size-5" />,
      title: `อัตราการใช้งบประมาณสูง (${utilizationRate.toFixed(1)}%)`,
      detail: `ใช้ไปแล้ว ${formatNumber(totalUsed)} บาท จากงบรวม ${formatNumber(totalPlan)} บาท เหลือเพียง ${formatNumber(totalRemaining)} บาท`,
    });
  } else if (utilizationRate < 50) {
    insights.push({
      type: "info",
      icon: <Lightbulb className="size-5" />,
      title: `อัตราการใช้งบประมาณต่ำ (${utilizationRate.toFixed(1)}%)`,
      detail: `ยังมีงบประมาณคงเหลืออีก ${formatNumber(totalRemaining)} บาท ควรพิจารณาการใช้งบให้เหมาะสม`,
    });
  } else {
    insights.push({
      type: "success",
      icon: <TrendingDown className="size-5" />,
      title: `อัตราการใช้งบประมาณอยู่ในเกณฑ์ดี (${utilizationRate.toFixed(1)}%)`,
      detail: `ใช้ไปแล้ว ${formatNumber(totalUsed)} บาท จากงบรวม ${formatNumber(totalPlan)} บาท`,
    });
  }

  // 3. Top spending category
  const categoryMap = new Map<string, number>();
  for (const row of data) {
    categoryMap.set(row.category, (categoryMap.get(row.category) || 0) + row.used);
  }
  const topCategory = Array.from(categoryMap.entries()).sort((a, b) => b[1] - a[1])[0];
  if (topCategory) {
    const pct = totalUsed > 0 ? ((topCategory[1] / totalUsed) * 100).toFixed(1) : "0";
    insights.push({
      type: "info",
      icon: <ArrowRight className="size-5" />,
      title: `หมวดที่ใช้จ่ายมากที่สุด: ${topCategory[0]}`,
      detail: `ใช้ไป ${formatNumber(topCategory[1])} บาท คิดเป็น ${pct}% ของงบที่ใช้ไปทั้งหมด`,
    });
  }

  // 4. Top spending mission group
  const missionMap = new Map<string, number>();
  for (const row of data) {
    missionMap.set(row.missionGroup, (missionMap.get(row.missionGroup) || 0) + row.used);
  }
  const topMission = Array.from(missionMap.entries()).sort((a, b) => b[1] - a[1])[0];
  if (topMission) {
    insights.push({
      type: "info",
      icon: <ArrowRight className="size-5" />,
      title: `กลุ่มภารกิจที่ใช้จ่ายมากที่สุด: ${topMission[0]}`,
      detail: `ใช้ไป ${formatNumber(topMission[1])} บาท`,
    });
  }

  return insights;
}

const typeStyles: Record<string, { border: string; bg: string; iconColor: string }> = {
  danger: { border: "border-l-rose-400", bg: "bg-rose-50/60", iconColor: "text-rose-500" },
  warning: { border: "border-l-amber-400", bg: "bg-amber-50/60", iconColor: "text-amber-500" },
  success: { border: "border-l-emerald-400", bg: "bg-emerald-50/60", iconColor: "text-emerald-500" },
  info: { border: "border-l-cyan-400", bg: "bg-cyan-50/60", iconColor: "text-cyan-500" },
};

export function InsightsSection({ data }: InsightsSectionProps) {
  const insights = React.useMemo(() => generateInsights(data), [data]);

  if (insights.length === 0) return null;

  return (
    <div>
      <h3 className="mb-4 text-base font-semibold text-gray-800">ข้อค้นพบสำคัญ</h3>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {insights.map((insight, i) => {
          const style = typeStyles[insight.type] || typeStyles.info;
          return (
            <div
              key={i}
              className={`rounded-2xl border border-white/40 border-l-4 ${style.border} ${style.bg} p-4 shadow-md backdrop-blur-xl transition-all duration-200 hover:shadow-lg`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 ${style.iconColor}`}>
                  {insight.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-800">{insight.title}</h4>
                  <p className="mt-1 text-xs leading-relaxed text-gray-500">{insight.detail}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
