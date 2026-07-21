import StatsDashboard from "./StatsDashboard";
import { useEffect, useMemo, useState } from "react";
import {
  FaTrain,
  FaCalendarCheck,
  FaUsers,
  FaChartPie,
  FaClock,
  FaCog,
  FaSignOutAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaBars,
} from "react-icons/fa";

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
  "Settat",
  "El Jadida",
  "Safi",
  "Khouribga",
  "Benguerir",
  "Mohammedia",
];

function AdminDashboard({ onLogout }) {
  const admin = JSON.parse(localStorage.getItem("admin"));
  const adminEmail = admin?.email || "";

  const [adminSettings, setAdminSettings] = useState({
    id: admin?.id || "",
    fullName: admin?.fullName || "",
    email: admin?.email || "",
    password: "",
  });


  const [users, setUsers] = useState([]);
  const [activePage, setActivePage] = useState("dashboard");
  const [trains, setTrains] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [message, setMessage] = useState("");
  const [editingTrainId, setEditingTrainId] = useState(null);
  const [waitingList, setWaitingList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const handleAdminSettingsChange = (e) => {
    setAdminSettings({
      ...adminSettings,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `http://localhost:8080/api/admin/update/${adminSettings.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(adminSettings),
        }
      );

      if (!response.ok) {
        throw new Error();
      }

      const updatedAdmin = await response.json();

      localStorage.setItem("admin", JSON.stringify(updatedAdmin));

      setAdminSettings({
        id: updatedAdmin.id,
        fullName: updatedAdmin.fullName,
        email: updatedAdmin.email,
        password: "",
      });

      alert("Profil administrateur modifié avec succès !");
    } catch {
      alert("Erreur lors de la modification.");
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Erreur chargement utilisateurs :", error);
    }
  };
  const [trainData, setTrainData] = useState({
    trainNumber: "",
    departureStation: "",
    arrivalStation: "",
    departureTime: "",
    arrivalTime: "",
    availableSeats: "",
    price: "",
    status: "",
  });

  const fetchTrains = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/trains");
      const data = await response.json();
      setTrains(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchReservations = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/reservations");
      const data = await response.json();
      setReservations(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchWaitingList = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/reservations/waiting-list-details"
      );

      const data = await response.json();
      setWaitingList(data);

    } catch (error) {
      console.error(error);
    }
  };

 useEffect(() => {
   fetchUsers();
   fetchTrains();
   fetchReservations();
   fetchWaitingList();
 }, []);

  const refreshAdminData = () => {
    fetchUsers();
    fetchTrains();
    fetchReservations();
    fetchWaitingList();
  };

  const stats = useMemo(() => {
    const totalRevenue = reservations.reduce((sum, reservation) => {
      const train = trains.find((t) => t.id === reservation.trainId);
      return sum + (train?.price || 0) * (reservation.numberOfSeats || 1);
    }, 0);

    const totalSeats = trains.reduce(
      (sum, train) => sum + (train.availableSeats || 0),
      0
    );

    return {
      totalTrains: trains.length,
      totalReservations: reservations.length,
      totalRevenue,
      occupationRate: totalSeats > 0 ? Math.min(100, reservations.length * 12) : 0,
      waitingList: reservations.filter((r) => r.status === "WAITING").length,
    };
  }, [trains, reservations]);

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredTrains = trains.filter((train) =>
    [train.trainNumber, train.departureStation, train.arrivalStation, train.status]
      .join(" ")
      .toLowerCase()
      .includes(normalizedSearch)
  );

  const filteredReservations = reservations.filter((reservation) =>
    [reservation.id, reservation.userId, reservation.trainId, reservation.numberOfSeats, reservation.status]
      .join(" ")
      .toLowerCase()
      .includes(normalizedSearch)
  );

  const filteredUsers = users.filter((user) =>
    [user.id, user.name, user.email]
      .join(" ")
      .toLowerCase()
      .includes(normalizedSearch)
  );

  const filteredWaitingList = waitingList.filter((item) =>
    [item.reservationId, item.userName, item.userEmail, item.trainId, item.trainNumber, item.status]
      .join(" ")
      .toLowerCase()
      .includes(normalizedSearch)
  );

  const handleChange = (e) => {
    setTrainData({
      ...trainData,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setTrainData({
      trainNumber: "",
      departureStation: "",
      arrivalStation: "",
      departureTime: "",
      arrivalTime: "",
      availableSeats: "",
      price: "",
      status: "",
    });
    setEditingTrainId(null);
  };

  const handleAddOrUpdateTrain = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const url = editingTrainId
        ? `http://localhost:8080/api/trains/${editingTrainId}?adminEmail=${adminEmail}`
        : `http://localhost:8080/api/trains?adminEmail=${adminEmail}`;

      const method = editingTrainId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...trainData,
          availableSeats: parseInt(trainData.availableSeats),
          price: parseFloat(trainData.price),
        }),
      });

      if (!response.ok) throw new Error();

      setMessage(editingTrainId ? "Train modifié avec succès" : "Train ajouté avec succès");
      resetForm();
      fetchTrains();
    } catch {
      setMessage("Erreur : opération impossible");
    }
  };

  const handleEditTrain = (train) => {
    setEditingTrainId(train.id);
    setActivePage("trains");

    setTrainData({
      trainNumber: train.trainNumber || "",
      departureStation: train.departureStation || "",
      arrivalStation: train.arrivalStation || "",
      departureTime: train.departureTime ? train.departureTime.slice(0, 16) : "",
      arrivalTime: train.arrivalTime ? train.arrivalTime.slice(0, 16) : "",
      availableSeats: train.availableSeats || "",
      price: train.price || "",
      status: train.status || "",
    });
  };

  const handleDeleteTrain = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/trains/${id}?adminEmail=${adminEmail}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error();

      fetchTrains();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancelReservation = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/api/reservations/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error();

      fetchReservations();
      fetchTrains();
    } catch (error) {
      console.error(error);
    }
  };

  const menuItems = [
    { key: "dashboard", label: "Tableau de bord", icon: <FaChartPie /> },
    { key: "trains", label: "Trains", icon: <FaTrain /> },
    { key: "reservations", label: "Réservations", icon: <FaCalendarCheck /> },
    { key: "users", label: "Utilisateurs", icon: <FaUsers /> },
    { key: "stats", label: "Statistiques", icon: <FaChartPie /> },
    { key: "waiting", label: "Liste d'attente", icon: <FaClock /> },
    { key: "settings", label: "Paramètres", icon: <FaCog /> },
  ];
const topCities = Object.entries(
  reservations.reduce((acc, reservation) => {
    const train = trains.find((t) => t.id === reservation.trainId);

    if (train && train.arrivalStation) {
      acc[train.arrivalStation] = (acc[train.arrivalStation] || 0) + 1;
    }

    return acc;
  }, {})
)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 3);
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <FaTrain />
          <span>TrainAdmin</span>
        </div>

        <div className="admin-menu">
          {menuItems.map((item, index) => (
            <button
              key={item.key}
              className={activePage === item.key ? "active" : ""}
              onClick={() => setActivePage(item.key)}
            >
              <span className="menu-left">
                {item.icon}
                {item.label}
              </span>

            </button>
          ))}

          <button onClick={onLogout}>
            <span className="menu-left">
              <FaSignOutAlt />
              Déconnexion
            </span>

          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <button className="admin-menu-btn">
            <FaBars />
          </button>

          <div className="admin-search">
            <FaSearch />
            <input
              placeholder="Rechercher trains, réservations, utilisateurs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button className="admin-sync-btn" onClick={refreshAdminData}>
            Synchroniser
          </button>

          <div className="admin-profile">
            <span className="admin-avatar">A</span>
            <strong>Admin</strong>
          </div>
        </header>

        <div className="admin-content">
          {activePage === "dashboard" && (
            <>
              <h1>Tableau de bord</h1>

              <div className="admin-stats-grid">
                <button className="admin-stat-card blue" onClick={() => setActivePage("trains")}>
                  <div className="stat-icon"><FaTrain /></div>
                  <div>
                    <h2>{stats.totalTrains}</h2>
                    <p>Trains</p>
                    <small>Voir plus →</small>
                  </div>
                </button>

                <button className="admin-stat-card green" onClick={() => setActivePage("reservations")}>
                  <div className="stat-icon"><FaCalendarCheck /></div>
                  <div>
                    <h2>{stats.totalReservations}</h2>
                    <p>Réservations</p>
                    <small>Voir plus →</small>
                  </div>
                </button>



                <button className="admin-stat-card purple" onClick={() => setActivePage("stats")}>
                  <div className="stat-icon"><FaChartPie /></div>
                  <div>
                    <h2>{stats.occupationRate}%</h2>
                    <p>Taux d’occupation</p>
                    <small>Voir plus →</small>
                  </div>
                </button>
              </div>

              <div className="admin-dashboard-grid">
                <section className="admin-panel">
                  <h2>Réservations récentes</h2>
                  <div className="admin-table">
                    {filteredReservations.slice(0, 5).map((reservation) => (
                      <div className="admin-table-row" key={reservation.id}>
                        <span>#RES-{reservation.id}</span>
                        <span>Train #{reservation.trainId}</span>
                        <span>{reservation.numberOfSeats} place(s)</span>
                        <span
                          className={
                            reservation.status === "CONFIRMED"
                              ? "badge-confirmed"
                              : "badge-waiting"
                          }
                        >
                          {reservation.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="admin-panel">
                 <h2>Villes les plus réservées</h2>

                <div className="city-chart-card">
                  <div className="donut-chart">
                    <span>{reservations.length}</span>
                  </div>

                  <div className="city-legend">
                    {topCities.map(([city, count], index) => (
                      <div className="city-legend-item" key={city}>
                        <span className={`legend-color color-${index}`}></span>
                        <p>{city}</p>
                        <strong>{count}</strong>
                      </div>
                    ))}
                  </div>
                </div>
                </section>
              </div>
            </>
          )}

          {activePage === "trains" && (
            <>
              <h1>Gestion des trains</h1>

              <div className="admin-two-columns">
                <section className="admin-panel">
                  <h2>{editingTrainId ? "Modifier un train" : "Ajouter un train"}</h2>

                  <form className="train-form" onSubmit={handleAddOrUpdateTrain}>
                    <input
                      type="text"
                      name="trainNumber"
                      placeholder="Numéro du train"
                      value={trainData.trainNumber}
                      onChange={handleChange}
                      required
                    />

                    <select
                      name="departureStation"
                      value={trainData.departureStation}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Gare de départ</option>
                      {moroccanStations.map((station) => (
                        <option key={station} value={station}>
                          {station}
                        </option>
                      ))}
                    </select>

                    <select
                      name="arrivalStation"
                      value={trainData.arrivalStation}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Gare d'arrivée</option>
                      {moroccanStations.map((station) => (
                        <option key={station} value={station}>
                          {station}
                        </option>
                      ))}
                    </select>

                    <input
                      type="datetime-local"
                      name="departureTime"
                      value={trainData.departureTime}
                      onChange={handleChange}
                      required
                    />

                    <input
                      type="datetime-local"
                      name="arrivalTime"
                      value={trainData.arrivalTime}
                      onChange={handleChange}
                      required
                    />

                    <input
                      type="number"
                      name="availableSeats"
                      placeholder="Places disponibles"
                      value={trainData.availableSeats}
                      onChange={handleChange}
                      required
                    />

                    <input
                      type="number"
                      name="price"
                      placeholder="Prix (DH)"
                      value={trainData.price}
                      onChange={handleChange}
                      required
                    />

                    <input
                      type="text"
                      name="status"
                      placeholder="ON_TIME / DELAYED"
                      value={trainData.status}
                      onChange={handleChange}
                      required
                    />

                    <button type="submit">
                      <FaPlus /> {editingTrainId ? "Mettre à jour" : "Ajouter"}
                    </button>

                    {editingTrainId && (
                      <button type="button" className="cancel-edit-btn" onClick={resetForm}>
                        Annuler
                      </button>
                    )}
                  </form>

                  {message && <p className="dashboard-message">{message}</p>}
                </section>

                <section className="admin-panel">
                  <h2>Liste des trains</h2>

                  <div className="admin-list">
                    {filteredTrains.map((train) => (
                      <div className="admin-list-item" key={train.id}>
                        <div>
                          <h3>{train.trainNumber}</h3>
                          <p>{train.departureStation} → {train.arrivalStation}</p>
                          <p>{train.departureTime}</p>
                          <p>{train.price} DH | {train.availableSeats} places</p>
                        </div>

                        <div className="admin-actions">
                          <button onClick={() => handleEditTrain(train)}>
                            <FaEdit />
                          </button>
                          <button onClick={() => handleDeleteTrain(train.id)}>
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </>
          )}

          {activePage === "reservations" && (
            <>
              <h1>Gestion des réservations</h1>

              <section className="admin-panel">
                <div className="admin-reservation-grid">
                  {filteredReservations.map((reservation) => (
                    <div className="admin-reservation-card" key={reservation.id}>
                      <h3>Réservation #{reservation.id}</h3>
                      <p>Utilisateur ID : {reservation.userId}</p>
                      <p>Train ID : {reservation.trainId}</p>
                      <p>Places : {reservation.numberOfSeats}</p>

                      <span
                        className={
                          reservation.status === "CONFIRMED"
                            ? "badge-confirmed"
                            : "badge-waiting"
                        }
                      >
                        {reservation.status}
                      </span>

                      <button onClick={() => handleCancelReservation(reservation.id)}>
                        Annuler
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {activePage === "users" && (
            <>
              <h1>Utilisateurs</h1>

              <section className="admin-panel">
                <div className="users-grid">
                  {filteredUsers.length === 0 ? (
                    <p>Aucun utilisateur trouvé.</p>
                  ) : (
                    filteredUsers.map((user) => {
                      const userReservations = reservations.filter(
                        (reservation) => reservation.userId === user.id
                      );

                      return (
                        <div className="user-admin-card" key={user.id}>
                          <h3>{user.name || "Utilisateur"}</h3>

                          <p>
                            <strong>ID :</strong> {user.id}
                          </p>

                          <p>
                            <strong>Email :</strong> {user.email}
                          </p>

                          <p>
                            <strong>Réservations :</strong> {userReservations.length}
                          </p>

                          <div className="user-reservations-box">
                            {userReservations.length === 0 ? (
                              <span>Aucune réservation</span>
                            ) : (
                              userReservations.map((reservation) => (
                                <div
                                  className="user-reservation-line"
                                  key={reservation.id}
                                >
                                  <span>Réservation #{reservation.id}</span>
                                  <span>Train #{reservation.trainId}</span>
                                  <span>{reservation.numberOfSeats} place(s)</span>
                                  <strong>{reservation.status}</strong>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>
            </>
          )}

         {activePage === "stats" && (
           <StatsDashboard
             trains={trains}
             reservations={reservations}
             users={users}
           />
         )}

          {activePage === "waiting" && (
            <section className="admin-panel">
              <h1>Liste d'attente</h1>

              {filteredWaitingList.length === 0 ? (
                <p>Aucune réservation en attente.</p>
              ) : (
                filteredWaitingList.map((item, index) => (
                  <div className="admin-list-item" key={item.reservationId}>
                    <div>
                      <h3>
                        #{index + 1} - {item.userName}
                      </h3>

                      <p>Email : {item.userEmail}</p>
                      <p>Réservation : #{item.reservationId}</p>
                      <p>Train ID : {item.trainId}</p>
                      <p>Places : {item.numberOfSeats}</p>
                    </div>

                    <span className="badge-waiting">EN ATTENTE</span>
                  </div>
                ))
              )}
            </section>
          )}

        {activePage === "settings" && (
          <section className="admin-panel">
            <h1>Paramètres administrateur</h1>

            <form className="settings-form" onSubmit={handleUpdateAdmin}>
              <label>Nom complet</label>
              <input
                type="text"
                name="fullName"
                value={adminSettings.fullName}
                onChange={handleAdminSettingsChange}
                required
              />

              <label>Email</label>
              <input
                type="email"
                name="email"
                value={adminSettings.email}
                onChange={handleAdminSettingsChange}
                required
              />

              <label>Nouveau mot de passe</label>
              <input
                type="password"
                name="password"
                placeholder="Laisser vide pour garder l'ancien"
                value={adminSettings.password}
                onChange={handleAdminSettingsChange}
              />

              <button type="submit">
                Enregistrer les modifications
              </button>
            </form>
          </section>
        )}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
