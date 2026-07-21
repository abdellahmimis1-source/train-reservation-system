import { useEffect, useState } from "react";

function MyReservations({ isLoggedIn, onRequireLogin }) {
  const [reservations, setReservations] = useState([]);
  const [message, setMessage] = useState("");

  const fetchReservations = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) return;

      const response = await fetch(
        `http://localhost:8080/api/reservations/user/${user.id}`
      );

      const data = await response.json();
      setReservations(data);
    } catch (error) {
      console.error("Erreur de chargement des réservations :", error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchReservations();
    }
  }, [isLoggedIn]);

  const handleCancel = async (reservationId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/reservations/${reservationId}`,
        { method: "DELETE" }
      );

      const data = await response.text();

      if (!response.ok) {
        throw new Error();
      }

      setMessage(data);
      fetchReservations();
    } catch {
      setMessage("Erreur lors de l'annulation de la réservation.");
    }
  };

  const handleConfirmWaiting = async (reservationId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/reservations/${reservationId}/confirm-waiting`,
        { method: "PUT" }
      );

      const data = await response.text();

      if (!response.ok) {
        throw new Error();
      }

      setMessage(data);
      fetchReservations();
    } catch {
      setMessage("Erreur lors de la confirmation.");
    }
  };

  const handleRejectWaiting = async (reservationId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/reservations/${reservationId}/reject-waiting`,
        { method: "PUT" }
      );

      const data = await response.text();

      if (!response.ok) {
        throw new Error();
      }

      setMessage(data);
      fetchReservations();
    } catch {
      setMessage("Erreur lors du refus.");
    }
  };

  const getStatusLabel = (status) => {
    if (status === "CONFIRMED") return "CONFIRMÉE";
    if (status === "WAITING") return "EN ATTENTE";
    if (status === "PENDING_CONFIRMATION") return "À CONFIRMER";
    return status;
  };

  const getStatusClass = (status) => {
    if (status === "CONFIRMED") return "status-badge confirmed-badge";
    if (status === "PENDING_CONFIRMATION")
      return "status-badge pending-confirmation-badge";
    return "status-badge waiting-badge";
  };

  const getStatusMeta = (status) => {
    if (status === "CONFIRMED") {
      return {
        icon: "✓",
        title: "Voyage valide",
        text: "Votre billet est pret. Gardez votre reference a portee de main.",
        progress: "100%",
      };
    }

    if (status === "PENDING_CONFIRMATION") {
      return {
        icon: "!",
        title: "Action requise",
        text: "Une place vient de se liberer. Confirmez vite pour la garder.",
        progress: "72%",
      };
    }

    return {
      icon: "...",
      title: "En liste d'attente",
      text: "Nous surveillons les disponibilites et vous previendrons des qu'une place arrive.",
      progress: "42%",
    };
  };

  if (!isLoggedIn) {
    return (
      <section className="my-reservations-section">
        <div className="my-reservations-header">
          <h2>Mes réservations</h2>
          <p>Vous devez vous connecter pour consulter vos réservations.</p>
        </div>

        <div className="my-reservations-login-box">
          <button onClick={onRequireLogin}>Se connecter</button>
        </div>
      </section>
    );
  }

  return (
    <section className="my-reservations-section">
      <div className="my-reservations-header">
        <h2>Mes réservations</h2>
        <p>Consultez vos réservations et répondez aux confirmations.</p>
      </div>

      <div className="my-reservations-actions">
        <button className="refresh-btn" onClick={fetchReservations}>
          Actualiser
        </button>
      </div>

      {message && <p className="reservation-message">{message}</p>}

      <div className="my-reservations-list">
        {reservations.length === 0 ? (
          <div className="empty-reservations-box">
            <h3>Aucune réservation pour le moment</h3>
            <p>Vos réservations apparaîtront ici après confirmation.</p>
          </div>
        ) : (
          reservations.map((reservation, index) => {
            const statusMeta = getStatusMeta(reservation.status);

            return (
            <div
              key={reservation.id}
              className={`my-reservation-card clean-card reservation-${reservation.status.toLowerCase()}`}
              style={{ "--card-delay": `${index * 90}ms` }}
            >
              <div className="reservation-glow" aria-hidden="true"></div>
              <div className="reservation-top-row">
                <div className="reservation-title-block">
                  <div className="reservation-icon-orb">{statusMeta.icon}</div>
                  <div>
                  <h3>Réservation #{reservation.id}</h3>
                  <p className="reservation-subtitle">
                    Suivi de votre réservation
                  </p>
                  </div>
                </div>

                <span className={getStatusClass(reservation.status)}>
                  {getStatusLabel(reservation.status)}
                </span>
              </div>

              <div className="reservation-progress">
                <div className="reservation-progress-top">
                  <span>Progression</span>
                  <strong>{statusMeta.progress}</strong>
                </div>
                <div className="reservation-progress-track">
                  <span style={{ width: statusMeta.progress }}></span>
                </div>
              </div>

              <div className="reservation-details-grid">
                <div className="reservation-detail-box">
                  <span>Identifiant du train</span>
                  <strong>{reservation.trainId}</strong>
                </div>

                <div className="reservation-detail-box">
                  <span>Nombre de places</span>
                  <strong>{reservation.numberOfSeats}</strong>
                </div>

                <div className="reservation-detail-box">
                  <span>Référence</span>
                  <strong>#{reservation.id}</strong>
                </div>
              </div>

              {reservation.status === "PENDING_CONFIRMATION" && (
                <div className="pending-alert simple-alert">
                  Une place est disponible pour vous. Voulez-vous confirmer cette réservation ?
                </div>
              )}

              {reservation.status === "WAITING" && (
                <div className="waiting-alert simple-alert">
                  Votre réservation est actuellement en <strong>liste d’attente</strong>.
                </div>
              )}

              {reservation.status === "CONFIRMED" && (
                <div className="confirmed-alert simple-alert">
                  Votre réservation est <strong>confirmée</strong>.
                </div>
              )}

              <div className="reservation-card-actions">
                {reservation.status === "PENDING_CONFIRMATION" ? (
                  <>
                    <button
                      className="confirm-reservation-btn"
                      onClick={() => handleConfirmWaiting(reservation.id)}
                    >
                      Confirmer
                    </button>

                    <button
                      className="reject-reservation-btn"
                      onClick={() => handleRejectWaiting(reservation.id)}
                    >
                      Refuser
                    </button>
                  </>
                ) : (
                  <button
                    className="cancel-reservation-btn"
                    onClick={() => handleCancel(reservation.id)}
                  >
                    Annuler
                  </button>
                )}
              </div>
            </div>
          );
          })
        )}
      </div>
    </section>
  );
}

export default MyReservations;
