import { useEffect, useState } from "react";

function MatchDonors({ requestId }) {
  const [donors, setDonors] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/blood-requests/${requestId}/match-donors`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data.matched_donors) {
          setDonors(data.matched_donors);
        }
      });
  }, [requestId]);

  if (donors.length === 0) {
    return <p>No eligible donors found.</p>;
  }

  return (
    <div>
      <h4>Matching Donors</h4>
      <table border="1" cellPadding="6">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
          </tr>
        </thead>
        <tbody>
          {donors.map(d => (
            <tr key={d.donor_id}>
              <td>{d.full_name}</td>
              <td>{d.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MatchDonors;
