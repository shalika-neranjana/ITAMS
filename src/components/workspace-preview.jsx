"use client";

import { useEffect, useState } from "react";
import { getAccountClient } from "../lib/appwrite";

const modules = [
  ["Assets and inventory", "Asset register and stock records"],
  ["Employees", "Employee and location records"],
  ["Assignments and transfers", "Asset allocation and movement"],
  ["Procurement and maintenance", "Acquisition and service workflows"],
  ["Reports and audit", "Reporting and activity records"],
  ["Administration", "Account and permission management"],
];

export default function WorkspacePreview({ accountId }) {
  const [state, setState] = useState("checking");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let current = true;
    const controller = new AbortController();
    setState("checking");
    (async () => {
      try {
        const { jwt } = await getAccountClient().createJWT();
        if (!current) return;
        const response = await fetch("/api/workspace", {
          headers: { Authorization: `Bearer ${jwt}` },
          cache: "no-store",
          credentials: "same-origin",
          signal: controller.signal,
        });
        if (!current) return;
        if (response.status === 401) { setState("expired"); return; }
        if (response.status === 403) { setState("restricted"); return; }
        if (!response.ok) { setState("unavailable"); return; }
        const result = await response.json();
        if (current) setState(Array.isArray(result.capabilities) && result.capabilities.includes("workspace:view") ? "ready" : "restricted");
      } catch {
        if (current) setState("unavailable");
      }
    })();
    return () => { current = false; controller.abort(); };
  }, [accountId, retry]);

  return (
    <section className="workspace-preview" aria-label="Workspace">
      <h3>Workspace</h3>
      {state === "checking" && <p role="status">Verifying server-side access…</p>}
      {state === "expired" && <p role="status">Your session is no longer valid. Sign out and sign in again.</p>}
      {state === "restricted" && <p role="status">Workspace access is restricted.</p>}
      {state === "unavailable" && <p role="status">Workspace verification is unavailable.</p>}
      {state === "ready" && (
        <>
          <p role="status">Workspace access verified by the server.</p>
          <nav aria-label="Planned modules" className="module-list">
            {modules.map(([title, description]) => (
              <div className="module-item" key={title}>
                <strong>{title}</strong>
                <small>{description}</small>
                <span className="module-status">Not enabled</span>
              </div>
            ))}
          </nav>
          <p className="workspace-note">Business modules remain disabled until permissions and specifications are approved.</p>
        </>
      )}
      {state !== "checking" && <button type="button" onClick={() => { setState("checking"); setRetry(value => value + 1); }}>Verify access again</button>}
    </section>
  );
}
