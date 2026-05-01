import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../layouts/AppLayout.jsx";
import Button from "../../components/Button.jsx";
import { register } from "../../services/auth";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [status, setStatus] = useState({ kind: "idle", message: "" });

  const canSubmit = useMemo(() => name.trim() && email.trim() && password.trim(), [name, email, password]);

  return (
    <AppLayout>
      <div className="cardHeader">
        <h1 className="title">Register</h1>
        <p className="subtitle">Create an account (customer/admin).</p>
      </div>
      <div className="cardBody">
        <form
          className="stack"
          onSubmit={async (e) => {
            e.preventDefault();
            setStatus({ kind: "idle", message: "" });
            try {
              await register({ name, email, password, role });
              setStatus({ kind: "ok", message: "Registration successful. Please login." });
              navigate("/auth/login");
            } catch (err) {
              setStatus({ kind: "error", message: err.message || "Registration failed" });
            }
          }}
        >
          <div>
            <div className="label">Name</div>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </div>
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
              autoComplete="new-password"
            />
          </div>
          <div>
            <div className="label">Role</div>
            <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="customer">customer</option>
              <option value="admin">admin</option>
            </select>
          </div>

          {status.kind === "error" ? <div className="error">{status.message}</div> : null}
          {status.kind === "ok" ? <div className="ok">{status.message}</div> : null}

          <Button variant="primary" disabled={!canSubmit} type="submit">
            Create account
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}

