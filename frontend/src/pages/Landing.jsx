import Navbar from "../components/Navbar";

function Landing() {
  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>BloodLink</h1>
          <p className="tagline">
            Connecting donors, hospitals & patients — when every second matters.
          </p>

          <div className="hero-buttons">
            <a href="#login" className="btn primary">Login</a>
            <a href="#register" className="btn outline">Register</a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features container">
        <h2>Why BloodLink?</h2>

        <div className="feature-grid">
          <div className="card">
            <h3>🩸 Real-time Blood Availability</h3>
            <p>Live blood inventory across blood banks.</p>
          </div>

          <div className="card">
            <h3>🚑 Emergency Matching</h3>
            <p>Instant donor matching during emergencies.</p>
          </div>

          <div className="card">
            <h3>📍 Location-based Search</h3>
            <p>Find nearby blood banks & donors easily.</p>
          </div>

          <div className="card">
            <h3>⏱ Smart Eligibility Tracking</h3>
            <p>Automatic 90-day donation cooldown tracking.</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta">
        <h2>Every Drop Saves a Life</h2>
        <p>Join BloodLink and be part of a life-saving network.</p>
        <a href="#register" className="btn primary">Become a Donor</a>
      </section>
    </>
  );
}

export default Landing;
