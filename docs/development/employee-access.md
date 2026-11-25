# Employee profile status — development milestone

This is a provisional, read-only presentation layer, not RBAC or production authorization.

The existing Appwrite employee_profiles table was inspected on 26 November 2026. It has row security enabled, no table-level grants, a unique authUserId index, and pending, active, suspended and departed status values.

The application re-reads the current Appwrite account and filters by its ID. It selects only authUserId and status and requests at most two rows. It does not accept an arbitrary user ID from a form or route. Missing, mismatched, duplicate, unknown, disabled and failed responses do not unlock any features.

## Development setup

Use an isolated test project and database with an equivalent table. Configure the public endpoint, project ID, database ID and table ID in .env.local. Provision synthetic employee profiles as an administrator and grant only the corresponding authenticated test user read access to their own row. Never grant that user permission to modify identity, status or roles. Keep privileged writes on a trusted server.

## Integration acceptance checks (not yet executed)

- Signed-out user cannot retrieve profiles.
- A test user can read their own row but cannot read another user's row, even with a direct SDK call.
- Test users cannot update their own status or assign themselves privileges.
- Pending, suspended, departed, missing and active records render the appropriate state.
- Session expiry, network errors and missing configuration cannot unlock business modules.
- No private employee data is displayed or logged.

## Scope limits

The production table and permissions were not changed. Actual row permissions, authentication, cross-account isolation, and role enforcement must be verified in a dedicated development environment. Do not enable business operations or deploy until the approved master specification and role policy are available. Browser checks are informational; every protected backend operation must independently verify the session and authorization.
