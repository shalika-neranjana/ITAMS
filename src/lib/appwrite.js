import { Account, Client, Query, TablesDB } from "appwrite";

let client;
let account;
function getClient() {
  if (client) return client;
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  if (!endpoint || !projectId || !/^https:\/\//.test(endpoint)) {
    throw new Error("Appwrite client configuration is incomplete.");
  }
  client = new Client().setEndpoint(endpoint).setProject(projectId);
  return client;
}

export function getAccountClient() {
  if (!account) account = new Account(getClient());
  return account;
}

export async function findOwnProfiles(authUserId) {
  const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
  const tableId = process.env.NEXT_PUBLIC_APPWRITE_EMPLOYEE_TABLE_ID;
  if (!databaseId || !tableId) throw new Error("Employee profile configuration is incomplete.");
  return new TablesDB(getClient()).listRows({
    databaseId,
    tableId,
    queries: [
      Query.equal("authUserId", [authUserId]),
      Query.select(["authUserId", "status"]),
      Query.limit(2),
    ],
  });
}
