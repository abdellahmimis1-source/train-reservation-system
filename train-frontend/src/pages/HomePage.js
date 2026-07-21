import React, { useState } from "react";
import Navbar from "../components/Navbar";
import SearchSection from "../components/SearchSection";

const HomePage = () => {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div>
      <Navbar onLoginClick={() => setShowLogin(true)} />

      <SearchSection />

      {showLogin && (
        <div style={styles.modal}>
          <div style={styles.box}>
            <h3>Login</h3>
            <input placeholder="Email" />
            <input type="password" placeholder="Password" />
            <button>Se connecter</button>
            <p style={{ cursor: "pointer", color: "blue" }}>
              Je ne suis pas encore inscrit
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  box: {
    background: "#fff",
    padding: "30px",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  }
};

export default HomePage;