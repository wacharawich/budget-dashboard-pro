import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Hash, Percent } from "lucide-react";
import { formatNumber } from "@/services/sheetData";
import type { BudgetRow } from "@/services/sheetData";

interface OverviewCardsProps {
  data: BudgetRow[];
}

export function OverviewCards({ data }: OverviewCardsProps) {
  const totalPlan = data.reduce((s, r) => s + r.totalPlan, 0);
  const totalUsed = data.reduce((s, r) => s + r.used, 0);
  const totalRemaining = data.reduce((s, r) => s + r.remaining, 0);
  const totalCount = data.length;
  const utilizationRate = totalPlan > 0 ? (totalUsed / totalPlan) * 100 : 0;
  const overBudgetCount = data.filter((r) => r.used > r.totalPlan).length;

  const cards = [
    {
      label: "ยอดรวมแผนทั้งหมด",
      value: formatNumber(totalPlan),
      icon: BarChart3,
      color: "from-cyan-500 to-sky-500",
      bgLight: "bg-cyan-50",
      textColor: "text-cyan-600",
    },
    {
      label: "ใช้ไปทั้งหมด",
      value: formatNumber(totalUsed),
      icon: TrendingDown,
      color: "from-amber-400 to-orange-400",
      bgLight: "bg-amber-50",
      textColor: "text-amber-600",
    },
    {
      label: "คงเหลือทั้งหมด",
      value: formatNumber(totalRemaining),
      icon: TrendingUp,
      color: "from-teal-400 to-emerald-400",
      bgLight: "bg-teal-50",
      textColor: "text-teal-600",
    },
    {
      label: "อัตราการใช้งบประมาณ",
      value: `${utilizationRate.toFixed(1)}%`,
      icon: Percent,
      color: utilizationRate > 100
        ? "from-rose-400 to-red-400"
        : utilizationRate > 80
        ? "from-amber-400 to-orange-400"
        : "from-emerald-400 to-teal-400",
      bgLight: utilizationRate > 100
        ? "bg-rose-50"
        : utilizationRate > 80
        ? "bg-amber-50"
        : "bg-emerald-50",
      textColor: utilizationRate > 100
        ? "text-rose-600"
        : utilizationRate > 80
        ? "text-amber-600"
        : "text-emerald-600",
    },
    {
      label: "จำนวนรายการ",
      value: formatNumber(totalCount),
      icon: Hash,
      color: "from-violet-400 to-purple-400",
      bgLight: "bg-violet-50",
      textColor: "text-violet-600",
    },
    {
      label: "รายการที่เกินงบ",
      value: formatNumber(overBudgetCount),
      icon: DollarSign,
      color: overBudgetCount > 0
        ? "from-rose-400 to-pink-400"
        : "from-gray-300 to-gray-400",
      bgLight: overBudgetCount > 0 ? "bg-rose-50" : "bg-gray-50",
      textColor: overBudgetCount > 0 ? "text-rose-600" : "text-gray-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.4 }}
          className="group relative overflow-hidden rounded-2xl border border-white/40 bg-white/50 p-4 shadow-lg backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
        >
          <div className="absolute inset-0 bg-gradient-to-br opacity-5" style={{ backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))` }} />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium text-gray-500 mb-1 leading-tight">{card.label}</p>
              <p className={`text-lg font-bold ${card.textColor} tracking-tight`}>
                {card.value}
              </p>
            </div>
            <div className={`rounded-xl p-2 ${card.bgLight} transition-transform group-hover:scale-110`}>
              <card.icon className={`size-4 ${card.textColor}`} />
            </div>
          </div>
          <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${card.color} opacity-30`} />
        </motion.div>
      ))}
    </div>
  );
}
