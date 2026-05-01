import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../layouts/AppLayout.jsx";
import Button from "../../components/Button.jsx";
import { login } from "../../services/auth";
import { setAuth } from "../../utils/authStorage";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState({ kind: "idle", message: "" });

  const canSubmit = useMemo(() => email.trim() && password.trim(), [email, password]);

  return (
    <AppLayout>
      <div className="cardHeader">
        <h1 className="title">Login</h1>
        <p className="subtitle">Use an existing account to get a JWT token.</p>
      </div>
      <div className="cardBody">
        <form
          className="stack"
          onSubmit={async (e) => {
            e.preventDefault();
            setStatus({ kind: "idle", message: "" });
            try {
              const res = await login({ email, password });
              setAuth({ token: res.token, user: res.user });
              setStatus({ kind: "ok", message: "Login successful" });
              navigate("/me");
            } catch (err) {
              setStatus({ kind: "error", message: err.message || "Login failed" });
            }
          }}
        >
          <div>
            <div className="label">Email</div>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </div>
          <div>
            <div className="label">Password</div>
            <input
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
            />
          </div>

          {status.kind === "error" ? <div className="error">{status.message}</div> : null}
          {status.kind === "ok" ? <div className="ok">{status.message}</div> : null}

          <Button variant="primary" disabled={!canSubmit} type="submit">
            Login
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}

