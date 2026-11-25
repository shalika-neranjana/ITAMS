# Provisional server-side workspace access

The workspace endpoint validates the user's short-lived Appwrite JWT through the Account API, then queries employee_profiles using that same token. It uses neither an admin key nor a browser-supplied user ID. No employee details are returned.

- GET /api/workspace: 200 with workspace:view only for an enabled account and exactly one matching active profile.
- 401 for absent or invalid authentication; 403 for restricted employee access; 503 for missing configuration or upstream failure.
- All responses are private and non-cacheable. JWTs remain in memory and must never be logged or persisted.
- A workspace:view capability is a provisional UI capability, not a business role. Every business permission is denied; no role names or administrative assignments have been inferred.

The dashboard lists planned modules but has no enabled business operations or invented statistics. The server route must be live-tested against an isolated Appwrite project before deployment. Verify direct API denial, expired/revoked JWT denial, cross-user isolation, row ACLs, and non-cacheable responses. Keep test credentials and production data out of Git.

The authoritative role matrix and OpenAPI contract are still required. The endpoint is provisional and must be reconciled with that contract before merging. Development infrastructure has not been created because the existing project has no isolated environment and a new cloud resource may incur cost.

References: https://appwrite.io/docs/products/auth/jwt and https://appwrite.io/docs/apis/rest
