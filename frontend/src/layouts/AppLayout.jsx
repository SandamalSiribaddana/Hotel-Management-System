import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import { clearAuth, getAuth } from "../utils/authStorage";

export default function AppLayout({ children }) {
  const navigate = useNavigate();
  const auth = getAuth();

  return (
    <div className="container">
      <div className="card">
        <div className="topbar">
          <Link to="/" className="brand">
            Hotel Starter Template
          </Link>
          <div className="navLinks">
            <Link className="pill" to="/auth/login">
              Login
            </Link>
            <Link className="pill" to="/auth/register">
              Register
            </Link>
            <Link className="pill" to="/me">
              Profile
            </Link>
            <Button
              variant="danger"
              onClick={() => {
                clearAuth();
                navigate("/auth/login");
              }}
              type="button"
              disabled={!auth?.token}
              title={!auth?.token ? "Not logged in" : "Logout"}
            >
              Logout
            </Button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

