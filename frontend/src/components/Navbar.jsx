function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="logo">🩸 BloodLink</span>
        <span className="tagline">Connecting lives, one drop at a time</span>
      </div>

      <div className="navbar-right">
        <span className="user-name">
          {user?.full_name} ({user?.role})
        </span>
        <button onClick={onLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
