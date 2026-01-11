import { useEffect, useState } from "react";
import EmergencyDonorMatch from "../components/EmergencyDonorMatch";

function MyBloodRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      const token = localStorage.getItem("token");

      const res = await fetch("http://127.0.0.1:5000/blood-requests/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) setRequests(data);
      setLoading(false);
    };

    fetchRequests();
  }, []);

  return (
    <div className="card">
      <h3>My Blood Requests</h3>

      {loading && <p>Loading your requests...</p>}

      {!loading && requests.length === 0 && (
        <p style={{ color: "#777" }}>
          You haven’t created any blood requests yet.
        </p>
      )}

      {!loading && requests.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Blood Group</th>
              <th>Units</th>
              <th>Urgency</th>
              <th>City</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {[...requests]
              .sort((a, b) => {
                if (a.urgency === "emergency" && b.urgency !== "emergency")
                  return -1;
                if (a.urgency !== "emergency" && b.urgency === "emergency")
                  return 1;
                return 0;
              })
              .map((r) => (
                <>
                  {/* MAIN REQUEST ROW */}
                  <tr
                    key={r.request_id}
                    className={
                      r.urgency === "emergency" ? "row-emergency" : ""
                    }
                  >
                    <td>{r.blood_group}</td>
                    <td>{r.quantity_units}</td>

                    <td>
                      {r.urgency === "emergency" ? (
                        <span className="status emergency">
                          🚨 Emergency
                        </span>
                      ) : (
                        r.urgency
                      )}
                    </td>

                    <td>{r.city}</td>

                    <td>
                      <span className={`status ${r.status}`}>
                        {r.status}
                      </span>
                    </td>

                    <td>
                      {new Date(r.request_date).toLocaleString()}
                    </td>
                  </tr>

                  {/* 🔴 EMERGENCY LIVE MATCHING ROW */}
                  {r.urgency === "emergency" && (
                    <tr>
                      <td colSpan="6">
                        <EmergencyDonorMatch
                          requestId={r.request_id}
                        />
                      </td>
                    </tr>
                  )}
                </>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MyBloodRequests;
