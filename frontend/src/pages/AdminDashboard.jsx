import Navbar from "../components/Navbar";
import AllBloodRequests from "./AllBloodRequests";
import AdminBloodChart from "../components/AdminBloodChart";
import { useEffect, useState } from "react";

const CRITICAL_THRESHOLD = 10;
const LOW_THRESHOLD = 20;

function AdminDashboard({ user }) {
  const [inventory, setInventory] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState(null);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          "http://127.0.0.1:5000/inventory/summary",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();

        const enhanced = data.map((item) => {
          const units = Number(item.total_units);
          return {
            ...item,
            total_units: units,
            critical: units <= CRITICAL_THRESHOLD,
          };
        });

        setInventory(enhanced);
      } catch (err) {
        console.error("Inventory fetch failed", err);
      } finally {
        setLoadingInventory(false);
      }
    };

    fetchInventory();
  }, []);

  const hasCritical = inventory.some((i) => i.critical);

  // 🔹 Pie slice toggle handler
  const handleSliceClick = (bloodGroup) => {
    setSelectedBloodGroup((prev) =>
      prev === bloodGroup ? null : bloodGroup
    );
  };

  const clearFilter = () => setSelectedBloodGroup(null);

  return (
    <>
      <Navbar user={user} onLogout={logout} />

      <div className="admin-container">
        <h2>Admin Dashboard</h2>
        <p>Welcome, {user.full_name}</p>
        <p className="muted">
          Logged in as <b>{user.role.toUpperCase()}</b>
        </p>

        <hr />

        {/* ================= TOP SECTION ================= */}
        <div className={`card ${hasCritical ? "critical-pulse" : ""}`}>
          <h3>Blood Availability</h3>

          {loadingInventory ? (
            <p className="muted">Loading inventory...</p>
          ) : inventory.length === 0 ? (
            <p className="muted">No inventory data available</p>
          ) : (
            <>
              {/* PIE CHART */}
              <AdminBloodChart
                data={inventory}
                selectedBloodGroup={selectedBloodGroup}
                onSliceClick={handleSliceClick}
              />

              {/* CENTER CRITICAL LABEL */}
              {hasCritical && (
                <div className="critical-center">
                  ⚠ Critical Blood Shortage
                </div>
              )}

              {/* ACTIVE FILTER INFO */}
              {selectedBloodGroup && (
                <p
                  className="muted"
                  style={{ textAlign: "center", marginTop: 10 }}
                >
                  Filtering requests for{" "}
                  <b>{selectedBloodGroup}</b>{" "}
                  <button
                    className="small secondary"
                    onClick={clearFilter}
                    style={{ marginLeft: 8 }}
                  >
                    Clear
                  </button>
                </p>
              )}

              {/* INVENTORY TABLE */}
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>Blood Group</th>
                    <th>Units Available</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => {
                    let status = "Healthy";
                    let cls = "approved";

                    if (item.total_units <= CRITICAL_THRESHOLD) {
                      status = "Critical";
                      cls = "emergency";
                    } else if (item.total_units <= LOW_THRESHOLD) {
                      status = "Low";
                      cls = "pending";
                    }

                    return (
                      <tr
                        key={item.blood_group}
                        className={item.critical ? "row-critical" : ""}
                      >
                        <td>{item.blood_group}</td>
                        <td>{item.total_units}</td>
                        <td>
                          <span className={`status ${cls}`}>
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}
        </div>

        <hr />

        {/* ================= BOTTOM SECTION (70 / 30) ================= */}
        <div className="admin-bottom-grid">
          {/* LEFT – 70% */}
          <div className="card">
            <h3>All Blood Requests</h3>
            <AllBloodRequests
              selectedBloodGroup={selectedBloodGroup}
              onClearFilter={clearFilter}
            />
          </div>

          {/* RIGHT – 30% */}
          <div className="card">
            <h3>Quick Insights</h3>
            <ul className="insights">
              <li>🩸 Live blood inventory</li>
              <li>🚨 Emergency requests highlighted</li>
              <li>📍 City-based demand tracking</li>
              <li>👥 Active donor pool</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;
