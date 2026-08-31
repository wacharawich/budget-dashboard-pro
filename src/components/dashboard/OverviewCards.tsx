import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Hash } from "lucide-react";
import { formatNumber } from "@/services/sheetData";
import type { BudgetRow } from "@/services/sheetData";

interface OverviewCardsProps {
  data: BudgetRow[];
}

const cards = [
  {
    label: "ยอดรวมแผนทั้งหมด",
    icon: BarChart3,
    getValue: (data: BudgetRow[]) => data.reduce((s, r) => s + r.totalPlan, 0),
    color: "from-cyan-500 to-sky-500",
    bgLight: "bg-cyan-50",
    textColor: "text-cyan-600",
  },
  {
    label: "ใช้ไปทั้งหมด",
    icon: TrendingDown,
    getValue: (data: BudgetRow[]) => data.reduce((s, r) => s + r.used, 0),
    color: "from-amber-400 to-orange-400",
    bgLight: "bg-amber-50",
    textColor: "text-amber-600",
  },
  {
    label: "คงเหลือทั้งหมด",
    icon: TrendingUp,
    getValue: (data: BudgetRow[]) => data.reduce((s, r) => s + r.remaining, 0),
    color: "from-teal-400 to-emerald-400",
    bgLight: "bg-teal-50",
    textColor: "text-teal-600",
  },
  {
    label: "จำนวนรายการ",
    icon: Hash,
    getValue: (data: BudgetRow[]) => data.length,
    color: "from-violet-400 to-purple-400",
    bgLight: "bg-violet-50",
    textColor: "text-violet-600",
  },
];

export function OverviewCards({ data }: OverviewCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
          className="group relative overflow-hidden rounded-2xl border border-white/40 bg-white/50 p-5 shadow-lg backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
        >
          <div className="absolute inset-0 bg-gradient-to-br opacity-5" style={{ backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))` }} />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">{card.label}</p>
              <p className={`text-2xl font-bold ${card.textColor} tracking-tight`}>
                {i === 3
                  ? formatNumber(card.getValue(data))
                  : formatNumber(card.getValue(data))}
              </p>
            </div>
            <div className={`rounded-xl p-2.5 ${card.bgLight} transition-transform group-hover:scale-110`}>
              <card.icon className={`size-5 ${card.textColor}`} />
            </div>
          </div>
          {/* Subtle bottom accent line */}
          <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${card.color} opacity-30`} />
        </motion.div>
      ))}
    </div>
  );
}
