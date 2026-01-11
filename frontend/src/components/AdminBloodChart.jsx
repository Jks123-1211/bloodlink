import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#b11226", "#f87171", "#fbbf24", "#60a5fa"];
const CRITICAL_THRESHOLD = 10;

function AdminBloodChart({
  data = [],
  selectedBloodGroup,
  onSliceClick,
}) {
  const chartData = data
    .filter((item) => Number(item.total_units) > 0)
    .map((item) => ({
      name: item.blood_group,
      value: Number(item.total_units),
      critical: Number(item.total_units) <= CRITICAL_THRESHOLD,
    }));

  const hasCritical = chartData.some((i) => i.critical);

  if (chartData.length === 0) {
    return (
      <p className="muted" style={{ textAlign: "center", marginTop: 60 }}>
        No inventory data available
      </p>
    );
  }

  return (
    <div style={{ width: "100%", height: 320, position: "relative" }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={110}
            paddingAngle={4}
            onClick={(data) => onSliceClick?.(data.name)}
          >
            {chartData.map((entry, index) => {
              const isSelected =
                selectedBloodGroup === entry.name;

              return (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                  stroke={
                    entry.critical
                      ? "#b11226"
                      : isSelected
                      ? "#111"
                      : "none"
                  }
                  strokeWidth={
                    entry.critical ? 4 : isSelected ? 3 : 1
                  }
                  style={{
                    cursor: "pointer",
                    filter: isSelected
                      ? "brightness(1.1)"
                      : "none",
                  }}
                />
              );
            })}
          </Pie>

          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      {/* 🔴 CENTER CRITICAL LABEL */}
      {hasCritical && (
        <div
          className="critical-center"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "#b11226",
            fontWeight: "700",
            textAlign: "center",
            animation: "pulseRed 1.5s infinite",
            pointerEvents: "none",
          }}
        >
          ⚠ Critical
        </div>
      )}
    </div>
  );
}

export default AdminBloodChart;
