import { useState } from "react";

function CreateBloodRequest() {
  const [bloodGroup, setBloodGroup] = useState("");
  const [units, setUnits] = useState("");
  const [city, setCity] = useState("");
  const [emergency, setEmergency] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    const res = await fetch("http://127.0.0.1:5000/blood-requests", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        blood_group: bloodGroup,
        quantity_units: units,
        city,
        urgency: emergency ? "emergency" : "normal",
      }),
    });

    const data = await res.json();
    alert(data.message || data.error);

    setBloodGroup("");
    setUnits("");
    setCity("");
    setEmergency(false);
  };

  return (
    <div className="card">
      <h3>Request Blood</h3>

      <form onSubmit={handleSubmit} className="form-grid">
        {/* Blood Group */}
        <div>
          <label>Blood Group</label>
          <select
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
            required
          >
            <option value="">Select</option>
            <option>A+</option>
            <option>A-</option>
            <option>B+</option>
            <option>B-</option>
            <option>AB+</option>
            <option>AB-</option>
            <option>O+</option>
            <option>O-</option>
          </select>
        </div>

        {/* Units */}
        <div>
          <label>Units</label>
          <input
            type="number"
            min="1"
            value={units}
            onChange={(e) => setUnits(e.target.value)}
            required
          />
        </div>

        {/* City */}
        <div>
          <label>City</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
        </div>

        {/* Emergency Section */}
        <div className="emergency-box">
          <input
            type="checkbox"
            checked={emergency}
            onChange={(e) => setEmergency(e.target.checked)}
          />
          <div>
            <strong>🚨 Emergency Request</strong>
            <p>
              Immediate blood required. Donors will be notified first.
            </p>
          </div>
        </div>

        <button type="submit">Submit Request</button>
      </form>
    </div>
  );
}

export default CreateBloodRequest;
