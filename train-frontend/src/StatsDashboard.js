import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import "./StatsDashboard.css";

function StatsDashboard({ trains, reservations, users }) {
  const confirmed = reservations.filter((r) => r.status === "CONFIRMED").length;
  const waiting = reservations.filter((r) => r.status === "WAITING").length;

  const cityCounts = {};
  reservations.forEach((reservation) => {
    const train = trains.find((t) => t.id === reservation.trainId);
    if (train?.arrivalStation) {
      cityCounts[train.arrivalStation] =
        (cityCounts[train.arrivalStation] || 0) + 1;
    }
  });

  const cityData = Object.entries(cityCounts)
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const trainData = trains.map((train) => ({
    name: train.trainNumber || `Train ${train.id}`,
    reservations: reservations.filter((r) => r.trainId === train.id).length,
  }));

  const statusData = [
    { name: "Confirmées", value: confirmed },
    { name: "En attente", value: waiting },
  ];

  const COLORS = ["#22c55e", "#f59e0b"];

  return (
    <div className="pro-stats">
      <div className="pro-header">
        <div>
          <h1>Statistiques </h1>
          <p>Vue globale des performances de réservation</p>
        </div>
      </div>

      <div className="pro-cards">
        <div className="pro-card">
          <span>🚆</span>
          <p>Trains</p>
          <h2>{trains.length}</h2>
        </div>

        <div className="pro-card">
          <span>🎟️</span>
          <p>Réservations</p>
          <h2>{reservations.length}</h2>
        </div>

        <div className="pro-card">
          <span>👥</span>
          <p>Utilisateurs</p>
          <h2>{users.length}</h2>
        </div>

        <div className="pro-card">
          <span>⏳</span>
          <p>En attente</p>
          <h2>{waiting}</h2>
        </div>
      </div>

      <div className="pro-grid">
        <div className="pro-panel large">
          <h3>Villes les plus réservées</h3>

          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={cityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2f46" />
              <XAxis dataKey="city" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="count" fill="#7c3aed" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="pro-panel">
          <h3>État des réservations</h3>

          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={5}
              >
                {statusData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <div className="status-legend">
            <p><span className="green-dot"></span> Confirmées : {confirmed}</p>
            <p><span className="orange-dot"></span> En attente : {waiting}</p>
          </div>
        </div>

        <div className="pro-panel full">
          <h3>Réservations par train</h3>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trainData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2f46" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="reservations"
                stroke="#38bdf8"
                strokeWidth={4}
                dot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default StatsDashboard;