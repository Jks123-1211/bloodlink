import { useState } from "react";

function DonorRegister() {
  const [bloodGroup, setBloodGroup] = useState("");

  const registerDonor = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/donors/register", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ blood_group: bloodGroup }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registered as donor successfully!");
      } else {
        alert(data.error || "Failed to register");
      }

    } catch (err) {
      alert("Server error");
    }
  };

  return (
    <div>
      <h3>Register as Donor</h3>

      <select
        value={bloodGroup}
        onChange={(e) => setBloodGroup(e.target.value)}
      >
        <option value="">Select blood group</option>
        <option value="O+">O+</option>
        <option value="O-">O-</option>
        <option value="A+">A+</option>
        <option value="A-">A-</option>
        <option value="B+">B+</option>
        <option value="B-">B-</option>
        <option value="AB+">AB+</option>
        <option value="AB-">AB-</option>
      </select>

      <br /><br />
      <button onClick={registerDonor}>Register</button>
    </div>
  );
}

export default DonorRegister;
