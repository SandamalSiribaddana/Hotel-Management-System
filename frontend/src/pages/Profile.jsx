import { useEffect, useState } from "react";
import AppLayout from "../layouts/AppLayout.jsx";
import { fetchProfile } from "../services/auth";
import { getAuth } from "../utils/authStorage";

export default function Profile() {
  const auth = getAuth();
  const [state, setState] = useState({ kind: "idle", data: null, error: "" });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!auth?.token) {
        setState({ kind: "error", data: null, error: "Not logged in. Login first." });
        return;
      }

      setState({ kind: "loading", data: null, error: "" });
      try {
        const res = await fetchProfile(auth.token);
        if (!cancelled) setState({ kind: "ok", data: res, error: "" });
      } catch (e) {
        if (!cancelled) setState({ kind: "error", data: null, error: e.message || "Failed to fetch profile" });
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [auth?.token]);

  return (
    <AppLayout>
      <div className="cardHeader">
        <h1 className="title">Profile</h1>
        <p className="subtitle">Protected route using the JWT token.</p>
      </div>
      <div className="cardBody">
        {state.kind === "loading" ? <div className="pill">Loading…</div> : null}
        {state.kind === "error" ? <div className="error">{state.error}</div> : null}
        {state.kind === "ok" ? (
          <pre
            className="pill"
            style={{
              whiteSpace: "pre-wrap",
              lineHeight: 1.35,
              overflow: "auto",
              maxHeight: 420,
            }}
          >
            {JSON.stringify(state.data, null, 2)}
          </pre>
        ) : null}
      </div>
    </AppLayout>
  );
}

