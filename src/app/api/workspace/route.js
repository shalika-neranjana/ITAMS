import { authorizeWorkspace } from "../../../lib/workspace-access.mjs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  const result = await authorizeWorkspace(request.headers.get("authorization"), {
    endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
    databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
    tableId: process.env.NEXT_PUBLIC_APPWRITE_EMPLOYEE_TABLE_ID,
  });
  return Response.json({ capabilities: result.capabilities }, {
    status: result.status,
    headers: { "Cache-Control": "no-store, private", "Vary": "Authorization" },
  });
}
