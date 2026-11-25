// Only a server route should invoke this module with trusted Appwrite configuration.
const denied = status => ({ status, capabilities: [] });
const allowed = () => ({ status: 200, capabilities: ['workspace:view'] });

export async function authorizeWorkspace(authorization, { endpoint, projectId, databaseId, tableId }, fetcher = fetch) {
  const token = /^Bearer ([A-Za-z0-9_.-]{1,8192})$/.exec(authorization || '')?.[1];
  if (!token) return denied(401);
  let base;
  try {
    base = new URL(endpoint);
    if (base.protocol !== 'https:' || base.username || base.password || base.search || base.hash || !/\/v1\/?$/.test(base.pathname)) return denied(503);
  } catch { return denied(503); }
  if (![projectId, databaseId, tableId].every(value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]{0,35}$/.test(value))) return denied(503);
  const headers = { 'X-Appwrite-Project': projectId, 'X-Appwrite-JWT': token, Accept: 'application/json' };
  const get = path => fetcher(base.href.replace(/\/$/, '') + path, { headers, cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(8000) });
  try {
    const accountResponse = await get('/account');
    if ([401, 403].includes(accountResponse.status)) return denied(401);
    if (!accountResponse.ok) return denied(503);
    const user = await accountResponse.json();
    if (typeof user?.$id !== 'string' || !user.$id) return denied(503);
    if (user.status !== true) return denied(403);
    const query = new URLSearchParams();
    for (const item of [
      { method: 'equal', attribute: 'authUserId', values: [user.$id] },
      { method: 'select', values: ['authUserId', 'status'] },
      { method: 'limit', values: [2] },
    ]) query.append('queries[]', JSON.stringify(item));
    const profileResponse = await get(`/tablesdb/${encodeURIComponent(databaseId)}/tables/${encodeURIComponent(tableId)}/rows?${query}`);
    if (profileResponse.status === 401) return denied(401);
    if (profileResponse.status === 403) return denied(403);
    if (!profileResponse.ok) return denied(503);
    const profile = await profileResponse.json();
    if (!Array.isArray(profile?.rows)) return denied(503);
    if (profile.rows.length !== 1) return denied(403);
    const row = profile.rows[0];
    if (row?.authUserId !== user.$id || row.status !== 'active') return denied(403);
    // No inventory/admin capabilities are granted without the authoritative policy.
    return allowed();
  } catch { return denied(503); }
}
