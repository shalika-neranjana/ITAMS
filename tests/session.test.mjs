import test from "node:test";
import assert from "node:assert/strict";
import { readSession, signIn, signOut } from "../src/lib/session.mjs";

test("restores an existing account", async () => {
  const user = { $id: "test-user" };
  assert.deepEqual(await readSession({ get: async () => user }), user);
});
test("treats a missing session as signed out", async () => {
  assert.equal(await readSession({ get: async () => { throw { code: 401 }; } }), null);
});
test("does not mistake service failure for signed out", async () => {
  await assert.rejects(readSession({ get: async () => { throw new Error("network"); } }), /network/);
});
test("sign-in creates a session and reads the account", async () => {
  const calls = [];
  const user = { $id: "test-user" };
  const result = await signIn({
    createEmailPasswordSession: async (args) => calls.push(args),
    get: async () => user,
  }, " test@example.invalid ", " test-password ");
  assert.deepEqual(calls, [{ email: "test@example.invalid", password: " test-password " }]);
  assert.equal(result, user);
});
test("sign-in rejects failed authentication", async () => {
  await assert.rejects(signIn({
    createEmailPasswordSession: async () => { throw new Error("denied"); },
    get: async () => assert.fail("must not read account"),
  }, "test@example.invalid", "example"), /denied/);
});
test("sign-out deletes only the current session", async () => {
  let args;
  await signOut({ deleteSession: async (input) => { args = input; } });
  assert.deepEqual(args, { sessionId: "current" });
});
test("sign-out tolerates an already expired session", async () => {
  await signOut({ deleteSession: async () => { throw { code: 401 }; } });
});
test("sign-out propagates service failure", async () => {
  await assert.rejects(signOut({ deleteSession: async () => { throw new Error("network"); } }), /network/);
});
