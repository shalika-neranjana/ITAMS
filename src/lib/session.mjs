export async function readSession(account) {
  try {
    return await account.get();
  } catch (error) {
    if (error?.code === 401) return null;
    throw error;
  }
}

export async function signIn(account, email, password) {
  await account.createEmailPasswordSession({ email: email.trim(), password });
  return account.get();
}

export async function signOut(account) {
  try {
    await account.deleteSession({ sessionId: "current" });
  } catch (error) {
    if (error?.code !== 401) throw error;
  }
}
