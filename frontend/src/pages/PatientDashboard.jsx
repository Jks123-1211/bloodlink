import CreateBloodRequest from "./CreateBloodRequest";
import MyBloodRequests from "./MyBloodRequests";
import Navbar from "../components/Navbar";

function PatientDashboard({ user }) {
  const logout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  return (
    <>
      <Navbar user={user} onLogout={logout} />
      
      <div className="container">
        <h2>Patient Dashboard</h2>
        <p>Welcome, {user.full_name}</p>

        <hr />

        <h3>Create Blood Request</h3>
        <CreateBloodRequest />

        <hr />

        <h3>My Blood Requests</h3>
        <MyBloodRequests />

        <br />

        <button onClick={logout}>Logout</button>
      </div>
    </>
  );
}

export default PatientDashboard;
