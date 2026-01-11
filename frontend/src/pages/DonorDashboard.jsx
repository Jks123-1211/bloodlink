import DonorRegister from "./DonorRegister";
import DonateBlood from "./DonateBlood";
import DonationHistory from "./DonationHistory";
import Navbar from "../components/Navbar";

function DonorDashboard({ user }) {
  if (!user) {
    return <p>Loading...</p>;
  }

  const logout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  return (
    <>
      <Navbar user={user} onLogout={logout} />

      <div className="container">

        {/* Header Card */}
        <div className="card">
          <h2>Donor Dashboard</h2>
          <p>Welcome, <strong>{user.full_name}</strong></p>
        </div>

        {/* Donor Registration */}
        <div className="card">
          <DonorRegister />
        </div>

        {/* Donate Blood */}
        <div className="card">
          <DonateBlood />
        </div>

        {/* Donation History */}
        <div className="card">
          <DonationHistory />
        </div>

        {/* Logout */}
        <div className="card" style={{ textAlign: "center" }}>
          <button onClick={logout}>Logout</button>
        </div>

      </div>
    </>
  );
}

export default DonorDashboard;
