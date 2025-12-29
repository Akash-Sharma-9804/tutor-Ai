import { useState, useMemo } from "react";
import { Flame } from "lucide-react";

/* ================= CONFIG ================= */

const YEARS = [2025, 2024, 2023, 2022];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", ""];

// Cell sizing (single source of truth)
const CELL_SIZE = 14;
const CELL_GAP = 4;
const WEEKS = 52;

/* ================= HELPERS ================= */

const generateYearData = () =>
  Array.from({ length: WEEKS }, () =>
    Array.from({ length: 7 }, () => Math.floor(Math.random() * 5))
  );

const getColor = (level) => [
  "bg-green-200",     // no activity
  "bg-green-900",
  "bg-green-700",
  "bg-green-500",
  "bg-green-400",
][level];

/* ================= COMPONENT ================= */

export default function StudyActivityHeatmap() {
  const [year, setYear] = useState(2025);

  const dataByYear = useMemo(
    () => Object.fromEntries(YEARS.map(y => [y, generateYearData()])),
    []
  );

  return (
    <section
      className="
        w-full rounded-2xl p-4 sm:p-6
        dark:bg-gray-800 bg-white
        border border-white/10
      "
    >
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white">
            Study Activity
          </h2>
          <p className="text-sm text-gray-400">
            {year} study sessions overview
          </p>
        </div>

        {/* Current Streak */}
        <div
          className="
            flex items-center gap-2 px-4 py-2 rounded-xl
            bg-orange-500/10 border border-orange-500/30
          "
        >
          <Flame className="h-5 w-5 text-orange-400" />
          <span className="text-sm text-gray-300">
            Current Streak:
          </span>
          <span className="text-sm font-bold text-orange-400">
            14 days
          </span>
        </div>
      </div>

      {/* ================= YEAR SELECTOR ================= */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {YEARS.map(y => (
          <button
            key={y}
            onClick={() => setYear(y)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition border
              ${
                year === y
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-transparent text-gray-300 border-white/20 hover:bg-white/10"
              }`}
          >
            {y}
          </button>
        ))}
      </div>

      {/* ================= MONTH LABELS ================= */}
      <div
        className="hidden sm:grid ml-12 mb-3 text-xs text-gray-400"
        style={{ gridTemplateColumns: "repeat(12, 1fr)" }}
      >
        {MONTHS.map(m => (
          <div key={m}>{m}</div>
        ))}
      </div>

      {/* ================= HEATMAP ================= */}
      <div className="flex w-full overflow-x-auto">
        {/* Day labels */}
        <div className="flex flex-col justify-between mr-3 text-xs text-gray-400">
          {DAY_LABELS.map((d, i) => (
            <div
              key={i}
              style={{ height: CELL_SIZE }}
              className="flex items-center"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div
          className="grid w-full"
          style={{
            gridTemplateColumns: `repeat(${WEEKS}, minmax(0, 1fr))`,
            columnGap: CELL_GAP,
          }}
        >
          {dataByYear[year].map((week, w) => (
            <div key={w} className="grid" style={{ rowGap: CELL_GAP }}>
              {week.map((level, d) => (
                <div
                  key={d}
                  style={{
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                  }}
                  className={`
                    rounded-[3px]
                    ${getColor(level)}
                    transition
                    hover:ring-2 hover:ring-white/40
                  `}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6">
        <span className="text-xs text-gray-400 hover:underline cursor-pointer">
          Learn how we count study sessions
        </span>

        {/* Legend */}
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <span>Less</span>
          {[0,1,2,3,4].map(l => (
            <div
              key={l}
              style={{ width: CELL_SIZE, height: CELL_SIZE }}
              className={`rounded-[3px] ${getColor(l)}`}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </section>
  );
}
