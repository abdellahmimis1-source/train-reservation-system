import { useEffect, useState } from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import trainAnimation from "./assets/train.json";

import { FaHome } from "react-icons/fa";
import { LuClock3 } from "react-icons/lu";
import { RiAdminLine } from "react-icons/ri";

import "./App.css";
import AvailableTrains from "./AvailableTrains";
import MyReservations from "./MyReservations";
import AdminDashboard from "./AdminDashboard";
import NotificationsBell from "./NotificationsBell";


import trainVideo from "./assets/train-video.mp4";

const moroccanStations = [
  "Casablanca Voyageurs",
  "Casa Port",
  "Rabat Agdal",
  "Rabat Ville",
  "Salé",
  "Kénitra",
  "Tanger Ville",
  "Marrakech",
  "Fès",
  "Meknès",
  "Oujda",
  "Nador Ville",
  "Agadir",
  "Settat",
  "El Jadida",
  "Safi",
  "Khouribga",
  "Benguerir",
  "Mohammedia"
];

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInEmail, setLoggedInEmail] = useState("");
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("search");

  const [searchData, setSearchData] = useState({
    departureStation: "",
    arrivalStation: "",
    departureDate: "",
    voyageurs: "",
  });

  const [searchFilters, setSearchFilters] = useState({
    departureStation: "",
    arrivalStation: "",
    departureDate: "",
    voyageurs: "",
  });



 const [formData, setFormData] = useState({
   name: "",
   email: "",
   password: "",
   notificationContact: "",
 });

const [showHeroContent, setShowHeroContent] = useState(false);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [adminLoginData, setAdminLoginData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loginMessage, setLoginMessage] = useState("");
  const [loginMessageType, setLoginMessageType] = useState("");
  const [adminLoginMessage, setAdminLoginMessage] = useState("");
  const [adminLoginMessageType, setAdminLoginMessageType] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedAdmin = localStorage.getItem("admin");

    if (savedUser) {
      const user = JSON.parse(savedUser);
      setIsLoggedIn(true);
      setLoggedInEmail(user.email);
    }

    if (savedAdmin) {
      setIsAdminLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHeroContent(true);
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  const handleTabClick = (tab) => {
    if ((tab === "buy" || tab === "manage") && !isLoggedIn) {
      setShowLogin(true);
      return;
    }

    setActiveTab(tab);

    if (tab === "buy" || tab === "search") {
      const section = document.getElementById("trains-section");
      if (section) section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSearchChange = (e) => {
    setSearchData({
      ...searchData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearchSubmit = () => {
    setSearchFilters(searchData);

    const section = document.getElementById("trains-section");
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleAdminLoginChange = (e) => {
    setAdminLoginData({ ...adminLoginData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    try {
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error();

      setMessage("Compte créé avec succès !");
      setMessageType("success");

      setFormData({
        name: "",
        email: "",
        password: "",
        notificationContact: "",
      });
    } catch {
      setMessage("Une erreur est survenue. Vérifiez le backend.");
      setMessageType("error");
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginMessage("");
    setLoginMessageType("");

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (!response.ok) throw new Error();

      setIsLoggedIn(true);
      setLoggedInEmail(data.email);
      localStorage.setItem("user", JSON.stringify(data));

      setLoginMessage("Connexion réussie");
      setLoginMessageType("success");

      setLoginData({
        email: "",
        password: "",
      });

      setTimeout(() => setShowLogin(false), 800);
    } catch {
      setLoginMessage("Adresse e-mail ou mot de passe incorrect.");
      setLoginMessageType("error");
    }
  };

  const handleAdminLoginSubmit = async (e) => {
    e.preventDefault();
    setAdminLoginMessage("");
    setAdminLoginMessageType("");

    try {
      const response = await fetch("http://localhost:8080/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adminLoginData),
      });

      const data = await response.text();

      if (!response.ok) throw new Error();

      const profileResponse = await fetch(
        `http://localhost:8080/api/admin/profile?email=${encodeURIComponent(adminLoginData.email)}`
      );

      const adminObj = profileResponse.ok
        ? await profileResponse.json()
        : {
            email: adminLoginData.email,
            fullName: "Administrateur",
          };

      localStorage.setItem("admin", JSON.stringify(adminObj));
      setIsAdminLoggedIn(true);

      setAdminLoginMessage(data);
      setAdminLoginMessageType("success");

      setAdminLoginData({
        email: "",
        password: "",
      });

      setTimeout(() => setShowAdminLogin(false), 700);
    } catch {
      setAdminLoginMessage(
        "Adresse e-mail administrateur ou mot de passe incorrect."
      );
      setAdminLoginMessageType("error");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoggedInEmail("");
    localStorage.removeItem("user");
    setActiveTab("search");
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem("admin");
  };

  if (isAdminLoggedIn) {
    return <AdminDashboard onLogout={handleAdminLogout} />;
  }

  return (
    <div className="page">
     <header className="navbar">
      <div className="logo">
       <Player
         autoplay
         loop
         src={trainAnimation}
         className="train-animation"
       />
        <span>ATLAS-EXPRESS</span>
         <Player
              autoplay
              loop
              src={trainAnimation}
              className="train-animation"
            />
      </div>

       <nav className="nav-links">
         <a href="/">
           <FaHome />
           Accueil
         </a>



         <button
           className="admin-link-btn"
           onClick={() => setShowAdminLogin(true)}
           type="button"
         >
           <RiAdminLine />
           Administration
         </button>

      {!isLoggedIn ? (
        <>
          <button
            className="user-badge"
            onClick={() => setShowLogin(true)}
            type="button"
          >
            Connexion
          </button>

          <button
            className="logout-btn"
            onClick={() => setShowRegister(true)}
            type="button"
          >
            Créer un compte
          </button>
        </>
      ) : (
           <>
             <NotificationsBell />

             <span className="user-badge">
               Compte connecté : {loggedInEmail}
             </span>

             <button
               className="logout-btn"
               onClick={handleLogout}
               type="button"
             >
               Déconnexion
             </button>
           </>
         )}
       </nav>
     </header>

      {!showRegister && (
        <main className="home-page">
          {activeTab !== "manage" && (
            <>
            <section className="search-banner">

             <video
               className="background-video"
               autoPlay
               muted
               loop
               playsInline
             >
                <source src={trainVideo} type="video/mp4" />
              </video>
               <div className={`hero-content ${showHeroContent ? "show" : ""}`}>
                  <h1>
                    Voyagez facilement <br />
                    avec <span>ATLAS-EXPRESS</span>
                  </h1>
                  <p>
                    Réservez vos billets, consultez les horaires <br />
                    et gérez vos trajets en toute simplicité.
                  </p>
                </div>

                <div className={`search-wrapper ${showHeroContent ? "show" : ""}`}>
                  <div className="search-tabs">
                    <button
                      className={activeTab === "buy" ? "active-tab" : ""}
                      onClick={() => handleTabClick("buy")}
                    >
                      J’achète mon billet
                    </button>

                    <button
                      className={activeTab === "search" ? "active-tab" : ""}
                      onClick={() => handleTabClick("search")}
                    >
                      Je consulte les horaires
                    </button>

                    <button
                      className={activeTab === "manage" ? "active-tab" : ""}
                      onClick={() => handleTabClick("manage")}
                    >
                      Je gère ma réservation
                    </button>
                  </div>

                  <div className="search-card">
                    <div className="search-grid">
                      <div className="search-group">
                        <label>Gare de départ</label>
                        <select
                          name="departureStation"
                          value={searchData.departureStation}
                          onChange={handleSearchChange}
                        >
                          <option value="">Sélectionnez la gare de départ</option>
                          {moroccanStations.map((station) => (
                            <option key={station} value={station}>
                              {station}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="search-group">
                        <label>Gare d'arrivée</label>
                        <select
                          name="arrivalStation"
                          value={searchData.arrivalStation}
                          onChange={handleSearchChange}
                        >
                          <option value="">Sélectionnez la gare d'arrivée</option>
                          {moroccanStations.map((station) => (
                            <option key={station} value={station}>
                              {station}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="search-group">
                        <label>Date de départ</label>
                        <input
                          type="date"
                          name="departureDate"
                          value={searchData.departureDate}
                          onChange={handleSearchChange}
                        />
                      </div>

                      <div className="search-group">
                        <label>Voyageurs</label>
                        <input
                          type="number"
                          name="voyageurs"
                          placeholder="Nombre de voyageurs"
                          value={searchData.voyageurs}
                          onChange={handleSearchChange}
                        />
                      </div>
                    </div>

                    <div className="search-bottom">
                      <button className="search-btn" onClick={handleSearchSubmit}>
                        🔍 Rechercher
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <AvailableTrains
                isLoggedIn={isLoggedIn}
                onRequireLogin={() => setShowLogin(true)}
                searchFilters={searchFilters}
              />
            </>
          )}

          {activeTab === "manage" && (
            <section className="manage-page">
              <div className="manage-page-tabs">
                <button onClick={() => handleTabClick("buy")}>
                  J’achète mon billet
                </button>

                <button onClick={() => handleTabClick("search")}>
                  Je consulte les horaires
                </button>

                <button className="active-tab" onClick={() => handleTabClick("manage")}>
                  Je gère ma réservation
                </button>
              </div>

              <MyReservations
                isLoggedIn={isLoggedIn}
                onRequireLogin={() => setShowLogin(true)}
              />
            </section>
          )}
        </main>
      )}

      {showRegister && (
        <main className="hero-section">
          <div className="hero-overlay">
            <div className="hero-text">
              <span className="badge">Voyagez autrement</span>
              <h1>Créez votre compte voyageur</h1>
              <p>
                Réservez vos billets, consultez vos trajets et profitez d’une
                expérience fluide inspirée des services modernes de transport.
              </p>
            </div>

            <div className="register-card">
              <h2>Création de compte</h2>
              <p className="card-subtitle">
                Remplissez les informations ci-dessous pour commencer.
              </p>

              <form onSubmit={handleSubmit} className="register-form">
                <div className="input-group">
                  <label>Nom complet</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Entrez votre nom complet"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

              <div className="input-group">
                <label>Email ou téléphone pour notifications</label>

                <input
                  type="text"
                  name="notificationContact"
                  placeholder="ex: exemple@gmail.com ou 06XXXXXXXX"
                  value={formData.notificationContact}
                  onChange={handleChange}
                  required
                />
              </div>

                <div className="input-group">
                  <label>Adresse e-mail</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Entrez votre adresse e-mail"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Mot de passe</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Entrez votre mot de passe"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button type="submit" className="register-btn">
                  Créer un compte
                </button>

                <button
                  type="button"
                  className="back-home-btn"
                  onClick={() => setShowRegister(false)}
                >
                  Retour à l'accueil
                </button>

                {message && <p className={`message ${messageType}`}>{message}</p>}
              </form>
            </div>
          </div>
        </main>
      )}

      {showLogin && (
        <div className="modal-overlay" onClick={() => setShowLogin(false)}>
          <div className="login-modal" onClick={(e) => e.stopPropagation()}>
            <div className="login-header">
              <h2>Je m'identifie</h2>
            </div>

            <form onSubmit={handleLoginSubmit} className="login-form">
              <div className="input-group">
                <label>Adresse e-mail</label>
                <input
                  type="email"
                  name="email"
                  placeholder="example@domain.com"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  required
                />
              </div>

              <div className="input-group">
                <label>Mot de passe</label>
                <input
                  type="password"
                  name="password"
                  placeholder="********"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  required
                />
              </div>

              <button type="submit" className="login-btn">
                Se connecter
              </button>

              <p
                className="register-link"
                onClick={() => {
                  setShowLogin(false);
                  setShowRegister(true);
                }}
              >
                Je ne suis pas encore inscrit
              </p>

              {loginMessage && (
                <p className={`message ${loginMessageType}`}>{loginMessage}</p>
              )}
            </form>
          </div>
        </div>
      )}

      {showAdminLogin && (
        <div className="modal-overlay" onClick={() => setShowAdminLogin(false)}>
          <div className="login-modal admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="login-header">
              <h2>Espace administrateur</h2>
            </div>

            <form onSubmit={handleAdminLoginSubmit} className="login-form">
              <div className="input-group">
                <label>Adresse e-mail administrateur</label>
                <input
                  type="email"
                  name="email"
                  placeholder="admin@domain.com"
                  value={adminLoginData.email}
                  onChange={handleAdminLoginChange}
                  required
                />
              </div>

              <div className="input-group">
                <label>Mot de passe</label>
                <input
                  type="password"
                  name="password"
                  placeholder="********"
                  value={adminLoginData.password}
                  onChange={handleAdminLoginChange}
                  required
                />
              </div>

              <button type="submit" className="admin-login-btn">
                Se connecter comme administrateur
              </button>

              {adminLoginMessage && (
                <p className={`message ${adminLoginMessageType}`}>
                  {adminLoginMessage}
                </p>
              )}
            </form>
          </div>
        </div>
      )}

      <footer className="footer">
        <p>© 2026 ONCF Connect - Plateforme de réservation ferroviaire</p>
      </footer>
    </div>
  );
}

export default App;
