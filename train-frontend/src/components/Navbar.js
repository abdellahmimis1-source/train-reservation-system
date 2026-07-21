import React from "react";

const Navbar = ({ onLoginClick }) => {
  return (
    <nav style={styles.nav}>
      <h2 style={styles.logo}>ONCF Connect</h2>

      <div style={styles.links}>
        <span>Accueil</span>
        <span>Horaires</span>
        <span>Billets</span>
        <span>Contact</span>

        <div style={styles.userIcon} onClick={onLoginClick}>
          👤
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: "15px 30px",
    background: "#fff",
    alignItems: "center"
  },
  logo: {
    color: "#1e3a8a"
  },
  links: {
    display: "flex",
    gap: "20px",
    alignItems: "center"
  },
  userIcon: {
    background: "#e11d48",
    color: "#fff",
    padding: "10px",
    borderRadius: "50%",
    cursor: "pointer"
  }
};

export default Navbar;