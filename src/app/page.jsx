"use client";

import { useEffect, useState } from "react";
import { getAccountClient } from "../lib/appwrite";
import { readSession, signIn, signOut } from "../lib/session.mjs";

export default function Home() {
  const [state, setState] = useState("loading");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let current = true;
    (async () => {
      try {
        const account = getAccountClient();
        const session = await readSession(account);
        if (current) {
          setUser(session);
          setState(session ? "authenticated" : "signed-out");
        }
      } catch {
        if (current) setState("unavailable");
      }
    })();
    return () => { current = false; };
  }, [retry]);

  async function handleSignIn(event) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const fields = new FormData(form);
    setBusy(true);
    setError("");
    try {
      const account = getAccountClient();
      const session = await signIn(account, String(fields.get("email")), String(fields.get("password")));
      setUser(session);
      setState("authenticated");
    } catch {
      setError("Unable to sign in. Check your credentials or connection.");
    } finally {
      form.reset();
      setBusy(false);
    }
  }

  async function handleSignOut() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await signOut(getAccountClient());
      setUser(null);
      setState("signed-out");
    } catch {
      setError("Unable to end the session. Please retry.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="workspace">
      <header>
        <p className="eyebrow">National Intellectual Property Office · Sri Lanka</p>
        <h1>NIPO <span>ITAMS</span></h1>
        <p>IT Asset Management System</p>
      </header>
      <section className="panel" aria-label="Account access">
        <p className="stage">Development foundation</p>
        {state === "loading" && <p role="status">Checking account session…</p>}
        {state === "unavailable" && (
          <>
            <h2>Service unavailable</h2>
            <p>Check the Appwrite configuration, registered web platform and network connection.</p>
            <button onClick={() => { setState("loading"); setRetry(n => n + 1); }}>Retry</button>
          </>
        )}
        {state === "signed-out" && (
          <>
            <h2>Sign in</h2>
            <p>Use an existing authorized test account.</p>
            <form onSubmit={handleSignIn}>
              <label htmlFor="email">Email address</label>
              <input id="email" name="email" type="email" autoComplete="username" required disabled={busy} />
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" autoComplete="current-password" required disabled={busy} />
              <button type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
            </form>
          </>
        )}
        {state === "authenticated" && (
          <>
            <h2>Account session active</h2>
            <p>Signed in as {user?.name || "an Appwrite account"}.</p>
            <p className="notice">Business modules are disabled until employee authorization and the approved access policy are implemented.</p>
            <button onClick={handleSignOut} disabled={busy}>{busy ? "Signing out…" : "Sign out"}</button>
          </>
        )}
        {error && <p className="error" role="alert">{error}</p>}
      </section>
      <footer>Internal system · Development only</footer>
    </main>
  );
}
