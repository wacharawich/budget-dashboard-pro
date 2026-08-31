import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface MultiSelectFilterProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

export function MultiSelectFilter({
  label,
  options,
  selected,
  onChange,
  placeholder = "เลือก...",
}: MultiSelectFilterProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const filtered = React.useMemo(() => {
    if (!search) return options;
    const lower = search.toLowerCase();
    return options.filter((o) => o.toLowerCase().includes(lower));
  }, [options, search]);

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((s) => s !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="mb-1 block text-xs font-medium text-gray-600">{label}</label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-9 w-full items-center justify-between gap-1 rounded-lg border px-3 py-1.5 text-sm",
          "bg-white/60 backdrop-blur-sm border-white/40",
          "hover:bg-white/80 transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-cyan-300/50",
          "text-gray-700"
        )}
      >
        <span className="truncate">
          {selected.length === 0
            ? placeholder
            : `เลือกแล้ว ${selected.length} รายการ`}
        </span>
        {selected.length > 0 ? (
          <X className="size-3.5 shrink-0 text-gray-400 hover:text-red-400" onClick={clearAll} />
        ) : (
          <ChevronDown className={cn("size-3.5 shrink-0 text-gray-400 transition-transform", open && "rotate-180")} />
        )}
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[200px] rounded-lg border border-white/50 bg-white/90 backdrop-blur-lg shadow-xl">
          <div className="p-2 border-b border-gray-100">
            <Input
              placeholder="พิมพ์ค้นหา..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-sm bg-white/80"
            />
          </div>
          <div className="max-h-48 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <div className="py-2 text-center text-xs text-gray-400">ไม่พบข้อมูล</div>
            ) : (
              filtered.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggle(option)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                    selected.includes(option)
                      ? "bg-cyan-50 text-cyan-700"
                      : "hover:bg-gray-50 text-gray-700"
                  )}
                >
                  <div
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded border transition-colors",
                      selected.includes(option)
                        ? "bg-cyan-500 border-cyan-500"
                        : "border-gray-300 bg-white"
                    )}
                  >
                    {selected.includes(option) && (
                      <Check className="size-3 text-white" />
                    )}
                  </div>
                  <span className="truncate">{option}</span>
                </button>
              ))
            )}
          </div>
          {selected.length > 0 && (
            <div className="border-t border-gray-100 p-2">
              <button
                type="button"
                onClick={() => {
                  onChange([]);
                  setSearch("");
                }}
                className="w-full rounded-md bg-red-50 px-2 py-1 text-xs text-red-500 hover:bg-red-100 transition-colors"
              >
                ล้างทั้งหมด
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface NumberRangeFilterProps {
  label: string;
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  onChange: (min: number, max: number) => void;
}

export function NumberRangeFilter({
  label,
  min,
  max,
  valueMin,
  valueMax,
  onChange,
}: NumberRangeFilterProps) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-600">{label}</label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={valueMin || ""}
          onChange={(e) => onChange(Number(e.target.value) || min, valueMax)}
          placeholder="ต่ำสุด"
          className="h-8 w-full rounded-md border border-white/40 bg-white/60 px-2 text-xs backdrop-blur-sm focus:outline-none          focus:ring-2 focus:ring-cyan-300/50"
        />
        <span className="text-gray-400 text-xs">-</span>
        <input
          type="number"
          value={valueMax || ""}
          onChange={(e) => onChange(valueMin, Number(e.target.value) || max)}
          placeholder="สูงสุด"
          className="h-8 w-full rounded-md border border-white/40 bg-white/60 px-2 text-xs backdrop-blur-sm focus:outline-none          focus:ring-2 focus:ring-cyan-300/50"
        />
      </div>
    </div>
  );
}
