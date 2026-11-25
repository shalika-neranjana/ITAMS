# NIPO ITAMS

IT Asset Management System for the National Intellectual Property Office of Sri Lanka.

## Development foundation (provisional)

This branch starts a clean Next.js App Router application with Appwrite account sessions. It is not a production release. The authoritative master specification, OpenAPI contract and AGENTS.md files must be imported and reviewed before implementing domain modules. No legacy Spring Boot/Vite/MySQL code has been copied.

## Local setup

1. Install Node.js 22 or a newer supported LTS release.
2. Run `npm install` and review the generated lockfile and dependency audit before committing the lockfile.
3. Copy `.env.example` to `.env.local`.
4. Set the public Appwrite project ID, database ID and employee table ID from the appropriate development project's console. Register localhost as a Web platform in that project. Use a designated test account and development environment, not production employee credentials.
5. Run `npm test`, then `npm run dev` and open http://localhost:3000.
6. Run `npm run build` before proposing a merge.

## Current scope

- Email/password sign-in to an existing Appwrite account; no self-registration.
- Session restoration, account identity display, and current-session sign-out.
- Explicit loading, unavailable-configuration and error states.
- Unit tests for the session operations using a mocked account adapter.
- Provisional server-side workspace access check with Appwrite JWT and a disabled-module workspace preview. See [workspace access notes](docs/development/workspace-access.md).
- Read-only employee profile status check with fail-closed handling. See [employee access development notes](docs/development/employee-access.md).

## Security boundary

The server verifies the Appwrite account and active employee profile before granting the provisional workspace:view capability. This is not a complete business authorization layer. Do not expose inventory, other employees' profiles, or administrative operations until the authoritative access-control and data-visibility rules are implemented and tested in the backend. Never use account preferences as proof of an administrative role. Appwrite API keys must remain server-side. No real employee records, credentials or production changes belong in this public repository.

## Before the next milestone

Import the approved specification bundle and compare its required repository structure with this provisional scaffold. Then implement employee activation and role authorization using the approved policy, provision isolated development resources, and run integration and browser tests.
