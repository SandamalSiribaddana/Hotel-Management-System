import { Link } from "react-router-dom";
import AppLayout from "../layouts/AppLayout.jsx";

export default function Home() {
  return (
    <AppLayout>
      <div className="cardHeader">
        <h1 className="title">Clean base template</h1>
        <p className="subtitle">
          Auth + shared infrastructure only. Add your modules later (rooms, bookings, payments, complaints, staff,
          services).
        </p>
      </div>
      <div className="cardBody">
        <div className="stack">
          <div className="pill">
            Next: <Link to="/auth/login">Login</Link> → <Link to="/me">Profile</Link>
          </div>
          <div className="hint">
            Set <code>VITE_API_BASE_URL</code> if your backend isn’t at <code>http://localhost:5000</code>.
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

