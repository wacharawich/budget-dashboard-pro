import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import * as React from "react";
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Hash, Percent } from "lucide-react";
import { formatNumber } from "@/services/sheetData";
import type { BudgetRow } from "@/services/sheetData";

interface OverviewCardsProps {
  data: BudgetRow[];
}

function AnimatedNumber({ value, suffix = "", decimals = 1 }: { value: number; suffix?: string; decimals?: number }) {
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => {
    if (suffix === "%") return v.toFixed(decimals) + suffix;
    return formatNumber(v);
  });
  const [display, setDisplay] = React.useState(suffix === "%" ? `0${suffix}` : formatNumber(0));

  React.useEffect(() => {
    const controls = animate(motionVal, value, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (v) => {
        if (suffix === "%") {
          setDisplay(v.toFixed(decimals) + suffix);
        } else {
          setDisplay(formatNumber(v));
        }
      },
    });
    return () => controls.stop();
  }, [value, suffix, decimals, motionVal]);

  return <>{display}</>;
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const color =
    pct > 100
      ? "from-rose-400 to-red-500"
      : pct > 80
      ? "from-amber-400 to-orange-500"
      : "from-emerald-400 to-teal-500";

  return (
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
      <motion.div
        className={`h-full rounded-full bg-gradient-to-r ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(pct, 100)}%` }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
      />
    </div>
  );
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
      value: totalPlan,
      displayValue: formatNumber(totalPlan),
      suffix: "",
      icon: BarChart3,
      color: "from-cyan-500 to-sky-500",
      bgLight: "bg-cyan-50",
      textColor: "text-cyan-600",
      showBar: true,
      barValue: totalPlan,
      barMax: totalPlan,
    },
    {
      label: "ใช้ไปทั้งหมด",
      value: totalUsed,
      displayValue: formatNumber(totalUsed),
      suffix: "",
      icon: TrendingDown,
      color: "from-amber-400 to-orange-400",
      bgLight: "bg-amber-50",
      textColor: "text-amber-600",
      showBar: true,
      barValue: totalUsed,
      barMax: totalPlan,
    },
    {
      label: "คงเหลือทั้งหมด",
      value: totalRemaining,
      displayValue: formatNumber(totalRemaining),
      suffix: "",
      icon: TrendingUp,
      color: "from-teal-400 to-emerald-400",
      bgLight: "bg-teal-50",
      textColor: "text-teal-600",
      showBar: true,
      barValue: totalRemaining,
      barMax: totalPlan,
    },
    {
      label: "อัตราการใช้งบประมาณ",
      value: utilizationRate,
      displayValue: `${utilizationRate.toFixed(1)}%`,
      suffix: "%",
      icon: Percent,
      color:
        utilizationRate > 100
          ? "from-rose-400 to-red-400"
          : utilizationRate > 80
          ? "from-amber-400 to-orange-400"
          : "from-emerald-400 to-teal-400",
      bgLight:
        utilizationRate > 100
          ? "bg-rose-50"
          : utilizationRate > 80
          ? "bg-amber-50"
          : "bg-emerald-50",
      textColor:
        utilizationRate > 100
          ? "text-rose-600"
          : utilizationRate > 80
          ? "text-amber-600"
          : "text-emerald-600",
      showBar: true,
      barValue: utilizationRate,
      barMax: 100,
    },
    {
      label: "จำนวนรายการ",
      value: totalCount,
      displayValue: formatNumber(totalCount),
      suffix: "",
      icon: Hash,
      color: "from-violet-400 to-purple-400",
      bgLight: "bg-violet-50",
      textColor: "text-violet-600",
      showBar: false,
      barValue: 0,
      barMax: 0,
    },
    {
      label: "รายการที่เกินงบ",
      value: overBudgetCount,
      displayValue: formatNumber(overBudgetCount),
      suffix: "",
      icon: DollarSign,
      color:
        overBudgetCount > 0
          ? "from-rose-400 to-pink-400"
          : "from-gray-300 to-gray-400",
      bgLight: overBudgetCount > 0 ? "bg-rose-50" : "bg-gray-50",
      textColor: overBudgetCount > 0 ? "text-rose-600" : "text-gray-400",
      showBar: false,
      barValue: 0,
      barMax: 0,
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
          <div className="relative flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-gray-500 mb-1 leading-tight">{card.label}</p>
              <p className={`text-lg font-bold ${card.textColor} tracking-tight`}>
                {card.suffix === "%" ? (
                  <AnimatedNumber value={card.value} suffix="%" decimals={1} />
                ) : (
                  <AnimatedNumber value={card.value} />
                )}
              </p>
            </div>
            <div className={`rounded-xl p-2 ${card.bgLight} transition-transform group-hover:scale-110`}>
              <card.icon className={`size-4 ${card.textColor}`} />
            </div>
          </div>
          {card.showBar && (
            <ProgressBar value={card.barValue} max={card.barMax} />
          )}
          <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${card.color} opacity-30`} />
        </motion.div>
      ))}
    </div>
  );
}
