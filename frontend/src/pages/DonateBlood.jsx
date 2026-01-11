import { useEffect, useState } from "react";

function DonateBlood() {
  const [eligible, setEligible] = useState(true);
  const [lastDonationDate, setLastDonationDate] = useState(null);
  const [nextEligibleDate, setNextEligibleDate] = useState(null);
  const [daysRemaining, setDaysRemaining] = useState(null);

  const [bloodBanks, setBloodBanks] = useState([]);
  const [bloodBankId, setBloodBankId] = useState("");
  const [units, setUnits] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    // 1️⃣ Check eligibility
    const checkEligibility = async () => {
      const res = await fetch("http://127.0.0.1:5000/donors/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setEligible(data.eligible);

        if (!data.eligible && data.last_donation_date) {
          const lastDate = new Date(data.last_donation_date);
          const nextDate = new Date(lastDate);
          nextDate.setDate(nextDate.getDate() + 90);

          const today = new Date();
          const diffTime = nextDate - today;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          setLastDonationDate(lastDate.toDateString());
          setNextEligibleDate(nextDate.toDateString());
          setDaysRemaining(diffDays);
        }
      }
    };

    // 2️⃣ Fetch blood banks
    const fetchBloodBanks = async () => {
      const res = await fetch("http://127.0.0.1:5000/blood-banks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        setBloodBanks(data);
      }
    };

    checkEligibility();
    fetchBloodBanks();
  }, []);

  const handleDonate = async () => {
    if (!bloodBankId || !units) {
      alert("Please select blood bank and units");
      return;
    }

    const token = localStorage.getItem("token");

    const res = await fetch("http://127.0.0.1:5000/donations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        blood_bank_id: bloodBankId,
        quantity_units: units,
      }),
    });

    const data = await res.json();
    alert(data.message || data.error);

    setUnits("");
    setBloodBankId("");
  };

  return (
    <div>
      <h3>Donate Blood</h3>

      {!eligible && (
        <div style={{ color: "red", marginBottom: "10px" }}>
          ❌ <strong>You are not eligible to donate currently.</strong>
          <br />
          🩸 Last donation: {lastDonationDate}
          <br />
          ⏳ You can donate again after <strong>{nextEligibleDate}</strong>
          <br />
          📆 Days remaining: <strong>{daysRemaining} days</strong>
        </div>
      )}

      <label>Blood Bank</label>
      <br />
      <select
        value={bloodBankId}
        onChange={(e) => setBloodBankId(e.target.value)}
        disabled={!eligible}
      >
        <option value="">Select Blood Bank</option>
        {bloodBanks.map((bank) => (
          <option key={bank.blood_bank_id} value={bank.blood_bank_id}>
            {bank.name} ({bank.city})
          </option>
        ))}
      </select>

      <br /><br />

      <label>Units</label>
      <br />
      <input
        type="number"
        min="1"
        value={units}
        onChange={(e) => setUnits(e.target.value)}
        disabled={!eligible}
      />

      <br /><br />

      <button onClick={handleDonate} disabled={!eligible}>
        Donate
      </button>
    </div>
  );
}

export default DonateBlood;
