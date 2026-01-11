import { useEffect, useState } from "react";

function EmergencyDonorMatch({ requestId }) {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `http://127.0.0.1:5000/blood-requests/${requestId}/match-donors`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (data.matched_donors) {
          setDonors(data.matched_donors);
        }
      } catch (err) {
        console.error("Match fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();

    // 🔁 Live refresh every 15 seconds
    const interval = setInterval(fetchMatches, 15000);
    return () => clearInterval(interval);
  }, [requestId]);

  if (loading) return <p className="muted">Matching donors...</p>;

  if (donors.length === 0) {
    return (
      <p className="text-danger">
        ⚠ No eligible donors found nearby yet
      </p>
    );
  }

  return (
    <div className="card emergency-match">
      <h4>🚨 Emergency Donor Matches</h4>

      <table>
        <thead>
          <tr>
            <th>Donor Name</th>
            <th>Contact</th>
          </tr>
        </thead>
        <tbody>
          {donors.map((d) => (
            <tr key={d.donor_id}>
              <td>{d.full_name}</td>
              <td>
                <a href={`tel:${d.phone}`} className="btn small">
                  📞 Call
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="muted" style={{ marginTop: 8 }}>
        Updated every 15 seconds
      </p>
    </div>
  );
}

export default EmergencyDonorMatch;
