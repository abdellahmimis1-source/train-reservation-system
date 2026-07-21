import React from "react";

const SearchSection = () => {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h3>J’achète mon billet</h3>

        <div style={styles.row}>
          <input placeholder="Ma gare de départ" />
          <input placeholder="Ma gare d'arrivée" />
        </div>

        <div style={styles.row}>
          <input type="date" />
          <input placeholder="Voyageurs" />
        </div>

        <button style={styles.btn}>Rechercher</button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    background: "#ef4444",
    padding: "40px",
    display: "flex",
    justifyContent: "center"
  },
  card: {
    background: "#fff",
    padding: "30px",
    borderRadius: "10px",
    width: "80%"
  },
  row: {
    display: "flex",
    gap: "10px",
    marginBottom: "10px"
  },
  btn: {
    background: "#1e3a8a",
    color: "#fff",
    padding: "10px",
    border: "none",
    borderRadius: "5px"
  }
};

export default SearchSection;