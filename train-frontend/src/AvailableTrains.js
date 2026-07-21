import { useEffect, useMemo, useState } from "react";
import { FaTrain, FaUser } from "react-icons/fa";
import { FiClock, FiMapPin, FiZap } from "react-icons/fi";
import { IoArrowForward } from "react-icons/io5";

function AvailableTrains({ isLoggedIn, onRequireLogin, searchFilters }) {
  const [trains, setTrains] = useState([]);
  const [selectedTrainId, setSelectedTrainId] = useState(null);
  const [numberOfSeats, setNumberOfSeats] = useState("");
  const [message, setMessage] = useState("");

  const fetchTrains = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/trains");
      const data = await response.json();
      setTrains(data);
    } catch (error) {
      console.error("Erreur de chargement des trains :", error);
    }
  };

useEffect(() => {
  fetchTrains();
}, []);

 const filteredTrains = useMemo(() => {
   const now = new Date();

   return trains.filter((train) => {
     const futureOk =
       train.departureTime && new Date(train.departureTime) > now;

     const departureOk =
       !searchFilters.departureStation ||
       train.departureStation
         ?.toLowerCase()
         .includes(searchFilters.departureStation.toLowerCase());

     const arrivalOk =
       !searchFilters.arrivalStation ||
       train.arrivalStation
         ?.toLowerCase()
         .includes(searchFilters.arrivalStation.toLowerCase());

     const seatsOk =
       !searchFilters.voyageurs ||
       train.availableSeats >= parseInt(searchFilters.voyageurs);

     const dateOk =
       !searchFilters.departureDate ||
       train.departureTime?.startsWith(searchFilters.departureDate);

     return futureOk && departureOk && arrivalOk && seatsOk && dateOk;
   });
 }, [trains, searchFilters]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleReserveClick = (trainId) => {
    setMessage("");

    if (!isLoggedIn) {
      onRequireLogin();
      return;
    }

    setSelectedTrainId(selectedTrainId === trainId ? null : trainId);
  };

  const handleReserve = async (trainId) => {
    setMessage("");

    try {
      const user = JSON.parse(localStorage.getItem("user"));

      const response = await fetch("http://localhost:8080/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          trainId: trainId,
          numberOfSeats: parseInt(numberOfSeats),
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la réservation");
      }

      const data = await response.json();

      if (data.status === "WAITING") {
        setMessage("Votre demande a été enregistrée en liste d’attente.");
      } else {
        setMessage("Votre réservation a été confirmée avec succès.");
      }

      setSelectedTrainId(null);
      setNumberOfSeats("");
      fetchTrains();
    } catch (error) {
      setMessage("Erreur lors de la réservation.");
    }
  };

  return (
    <section className="trains-section" id="trains-section">
      <div className="trains-header">
        <h2>Trains disponibles</h2>
        <p>Consultez les trajets disponibles et réservez votre place.</p>
      </div>

      {message && <p className="reservation-message">{message}</p>}

      <div className="trains-grid">
        {filteredTrains.length === 0 ? (
          <p>Aucun train trouvé selon votre recherche.</p>
        ) : (
          filteredTrains.map((train, index) => (
            <div
              key={train.id}
              className={`train-card ${selectedTrainId === train.id ? "is-booking" : ""}`}
              style={{ "--train-delay": `${index * 85}ms` }}
            >
              <div className="train-card-glow" aria-hidden="true"></div>
              <div className="train-number">{index + 1}</div>

              <div className="train-icon-box">
                <FaTrain />
              </div>

              <div className="train-main-info">
                <div className="train-card-kicker">
                  <FiZap />
                  Trajet express
                </div>
                <div className="train-route">
                  <span className="station-name">{train.departureStation}</span>
                  <span className="route-connector">
                    <i></i>
                    <IoArrowForward />
                    <i></i>
                  </span>
                  <span className="station-name">{train.arrivalStation}</span>
                </div>

                <div className="train-date">
                  <FiClock />
                  {formatDate(train.departureTime)} - {formatTime(train.departureTime)}
                </div>
              </div>

              <div className="train-price">
                {train.price !== null && train.price !== undefined
                  ? train.price
                  : "—"}
                <small>DH</small>
              </div>

              <div className="train-footer">
                <span>
                  <FaUser /> {train.availableSeats} places
                </span>
                <span>
                  <FiMapPin /> Direct
                </span>

                <span
                  className={
                    train.status === "DELAYED"
                      ? "train-status delayed"
                      : "train-status on-time"
                  }
                >
                  {train.status === "DELAYED" ? "Retardé" : "À l'heure"}
                </span>
              </div>

              <button
                className="reserve-btn"
                onClick={() => handleReserveClick(train.id)}
              >
                Réserver
              </button>

              {selectedTrainId === train.id && isLoggedIn && (
                <div className="reservation-box">
                  <span className="reservation-box-title">Finaliser votre billet</span>
                  <input
                    type="number"
                    placeholder="Nombre de places"
                    value={numberOfSeats}
                    onChange={(e) => setNumberOfSeats(e.target.value)}
                  />

                  <button onClick={() => handleReserve(train.id)}>
                    Confirmer
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default AvailableTrains;
