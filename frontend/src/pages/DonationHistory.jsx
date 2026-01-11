import { useEffect, useState } from "react";

function DonationHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem("token");

      const res = await fetch("http://127.0.0.1:5000/donations/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) setHistory(data);
      setLoading(false);
    };

    fetchHistory();
  }, []);

  // 🔢 Simple reward logic (frontend)
  const calculatePoints = (units) => units * 50;

  return (
    <div className="card">
      <h3>Donation History</h3>

      {loading && <p>Loading donation history...</p>}

      {!loading && history.length === 0 && (
        <p className="muted">You haven’t donated blood yet.</p>
      )}

      {!loading && history.length > 0 && (
        <>
          {/* 🏆 Summary */}
          <div style={{ marginBottom: 12 }}>
            <b>Total Donations:</b> {history.length} <br />
            <b>Total Points:</b>{" "}
            {history.reduce(
              (sum, d) => sum + calculatePoints(d.quantity_units),
              0
            )}
          </div>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Blood Bank</th>
                <th>City</th>
                <th>Units</th>
                <th>Points</th>
              </tr>
            </thead>

            <tbody>
              {history.map((d, index) => {
                const points = calculatePoints(d.quantity_units);

                return (
                  <tr key={index}>
                    <td>
                      {new Date(d.donation_date).toLocaleString()}
                    </td>

                    <td>{d.blood_bank_name || "—"}</td>

                    <td>{d.city}</td>

                    <td>{d.quantity_units}</td>

                    <td>
                      <span className="status approved">
                        +{points} pts
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* 🎖️ Badge hint */}
          <p className="muted" style={{ marginTop: 10 }}>
            🎖️ Keep donating to unlock badges like <b>First Drop</b>,{" "}
            <b>Lifesaver</b>, and <b>Elite Donor</b>
          </p>
        </>
      )}
    </div>
  );
}

export default DonationHistory;
