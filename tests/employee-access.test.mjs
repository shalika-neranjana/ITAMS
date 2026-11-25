import test from "node:test";
import assert from "node:assert/strict";
import { checkEmployeeAccess } from "../src/lib/employee-access.mjs";

const user = { $id: "employee-1", status: true };
const account = { get: async () => user };
const rows = (...items) => async () => ({ rows: items });
const own = status => ({ authUserId: user.$id, status });

test("looks up the current authenticated identity", async () => {
  let requested;
  const state = await checkEmployeeAccess(account, async id => {
    requested = id;
    return { rows: [own("active")] };
  });
  assert.equal(requested, user.$id);
  assert.equal(state, "active");
});
test("missing accessible profile is not linked", async () => {
  assert.equal(await checkEmployeeAccess(account, rows()), "not-linked");
});
test("pending profile is not active", async () => {
  assert.equal(await checkEmployeeAccess(account, rows(own("pending"))), "pending");
});
test("suspended profile is restricted", async () => {
  assert.equal(await checkEmployeeAccess(account, rows(own("suspended"))), "restricted");
});
test("departed profile is restricted", async () => {
  assert.equal(await checkEmployeeAccess(account, rows(own("departed"))), "restricted");
});
test("unknown profile status fails closed", async () => {
  assert.equal(await checkEmployeeAccess(account, rows(own("administrator"))), "unavailable");
});
test("duplicate profiles fail closed", async () => {
  assert.equal(await checkEmployeeAccess(account, rows(own("active"), own("active"))), "unavailable");
});
test("profile identity mismatch fails closed", async () => {
  assert.equal(await checkEmployeeAccess(account, rows({ authUserId: "other", status: "active" })), "unavailable");
});
test("malformed result fails closed", async () => {
  assert.equal(await checkEmployeeAccess(account, async () => ({ documents: [] })), "unavailable");
});
test("disabled account never queries profiles", async () => {
  assert.equal(await checkEmployeeAccess({ get: async () => ({ ...user, status: false }) }, async () => assert.fail("unexpected lookup")), "restricted");
});
test("missing account id never queries profiles", async () => {
  assert.equal(await checkEmployeeAccess({ get: async () => ({ status: true }) }, async () => assert.fail("unexpected lookup")), "unavailable");
});
test("session failure propagates before lookup", async () => {
  await assert.rejects(checkEmployeeAccess({ get: async () => { throw new Error("session expired"); } }, async () => assert.fail("unexpected lookup")), /session expired/);
});
test("database failure propagates for the UI to handle", async () => {
  await assert.rejects(checkEmployeeAccess(account, async () => { throw new Error("database unavailable"); }), /database unavailable/);
});
