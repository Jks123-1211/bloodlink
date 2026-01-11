import { useEffect, useState } from "react";

function AllBloodRequests({ selectedBloodGroup, onClearFilter }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const fetchRequests = async () => {
    setLoading(true);

    const res = await fetch("http://127.0.0.1:5000/blood-requests", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (res.ok) setRequests(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateStatus = async (id, status) => {
    await fetch(`http://127.0.0.1:5000/blood-requests/${id}/status`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    fetchRequests();
  };

  const fulfillRequest = async (id) => {
    await fetch(`http://127.0.0.1:5000/blood-requests/${id}/fulfill`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchRequests();
  };

  /* 🔹 FILTER + EMERGENCY PRIORITY */
  const filteredRequests = [...requests]
    .filter((r) =>
      selectedBloodGroup
        ? r.blood_group === selectedBloodGroup
        : true
    )
    .sort((a, b) => {
      if (a.urgency === "emergency" && b.urgency !== "emergency") return -1;
      if (a.urgency !== "emergency" && b.urgency === "emergency") return 1;
      return 0;
    });

  return (
    <div className="card">
      <h3>All Blood Requests</h3>

      {/* 🔹 ACTIVE FILTER INDICATOR */}
      {selectedBloodGroup && (
        <div style={{ marginBottom: 10 }}>
          <span className="status approved">
            Filter: {selectedBloodGroup}
          </span>{" "}
          <button
            className="small secondary"
            onClick={onClearFilter}
          >
            Clear
          </button>
        </div>
      )}

      {loading && <p>Loading requests...</p>}

      {!loading && filteredRequests.length === 0 && (
        <p style={{ color: "#777" }}>
          No blood requests found.
        </p>
      )}

      {!loading && filteredRequests.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Blood</th>
              <th>Units</th>
              <th>Urgency</th>
              <th>City</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredRequests.map((r) => (
              <tr
                key={r.request_id}
                className={
                  r.urgency === "emergency" ? "row-emergency" : ""
                }
              >
                <td>{r.request_id}</td>
                <td>{r.user_id}</td>
                <td>{r.blood_group}</td>
                <td>{r.quantity_units}</td>

                <td>
                  {r.urgency === "emergency" ? (
                    <span className="status emergency">
                      Emergency
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
                  {r.status === "pending" && (
                    <>
                      <button
                        className="small"
                        onClick={() =>
                          updateStatus(r.request_id, "approved")
                        }
                      >
                        Approve
                      </button>{" "}
                      <button
                        className="small danger"
                        onClick={() =>
                          updateStatus(r.request_id, "rejected")
                        }
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {r.status === "approved" && (
                    <button
                      className="small"
                      onClick={() =>
                        fulfillRequest(r.request_id)
                      }
                    >
                      Fulfill
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AllBloodRequests;
