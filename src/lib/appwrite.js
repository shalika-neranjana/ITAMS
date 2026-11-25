import { Account, Client } from "appwrite";

let account;

export function getAccountClient() {
  if (account) return account;
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  if (!endpoint || !projectId || !/^https:\/\//.test(endpoint)) {
    throw new Error("Appwrite client configuration is incomplete.");
  }
  account = new Account(new Client().setEndpoint(endpoint).setProject(projectId));
  return account;
}
