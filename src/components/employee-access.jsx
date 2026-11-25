"use client";

import { useEffect, useState } from "react";
import { findOwnProfiles, getAccountClient } from "../lib/appwrite";
import { checkEmployeeAccess } from "../lib/employee-access.mjs";

const messages = {
  loading: "Checking employee profile…",
  active: "Active employee profile verified. Business modules are not enabled yet.",
  pending: "Your employee profile is awaiting activation.",
  restricted: "Employee access is restricted. Contact the IT division.",
  "not-linked": "No accessible employee profile is linked to this account. Contact the IT division.",
  unavailable: "Employee access could not be verified. Retry or contact the IT division.",
};

export default function EmployeeAccess({ accountId }) {
  const [state, setState] = useState("loading");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let current = true;
    setState("loading");
    Promise.resolve()
      .then(() => checkEmployeeAccess(getAccountClient(), findOwnProfiles))
      .then(value => { if (current) setState(value); })
      .catch(() => { if (current) setState("unavailable"); });
    return () => { current = false; };
  }, [accountId, retry]);

  return (
    <section className="notice" aria-label="Employee access status">
      <h3>Employee access</h3>
      <p role="status">{messages[state]}</p>
      {state !== "loading" && (
        <button type="button" onClick={() => setRetry(value => value + 1)}>
          Recheck employee access
        </button>
      )}
    </section>
  );
}
