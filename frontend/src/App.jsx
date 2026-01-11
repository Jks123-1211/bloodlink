import { useEffect, useState } from "react";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DonorDashboard from "./pages/DonorDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔐 Auto-login if token exists
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    fetch("http://127.0.0.1:5000/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setUser(data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // ⏳ Loading screen
  if (loading) {
    return <p style={{ textAlign: "center" }}>Loading...</p>;
  }

  // 🌍 Not logged in → Landing + Auth
  if (!user) {
    return (
      <>
        <Landing />

        <div id="login" className="container">
          <Login setUser={setUser} />
          <hr />
          <div id="register">
            <Register />
          </div>
        </div>
      </>
    );
  }

  // 🎯 Role-based dashboards
  if (user.role === "donor") return <DonorDashboard user={user} />;
  if (user.role === "patient") return <PatientDashboard user={user} />;
  if (user.role === "admin") return <AdminDashboard user={user} />;

  return <p>Invalid role</p>;
}

export default App;
