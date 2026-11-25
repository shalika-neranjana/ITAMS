// Presentation-only check; actual authorization must be enforced by Appwrite or a trusted server.
export async function checkEmployeeAccess(account, findOwnProfiles) {
  const user = await account.get();
  if (typeof user?.$id !== "string" || !user.$id) return "unavailable";
  if (user.status !== true) return "restricted";
  const result = await findOwnProfiles(user.$id);
  if (!Array.isArray(result?.rows)) return "unavailable";
  if (result.rows.length === 0) return "not-linked";
  if (result.rows.length !== 1) return "unavailable";
  const profile = result.rows[0];
  if (profile?.authUserId !== user.$id) return "unavailable";
  switch (profile.status) {
    case "active": return "active";
    case "pending": return "pending";
    case "suspended":
    case "departed": return "restricted";
    default: return "unavailable";
  }
}
