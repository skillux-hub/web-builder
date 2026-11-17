# Local business foundation

This is an industry-neutral starting point: Next.js, TypeScript, Prisma, SQLite and optional protected administrator sessions. It contains no store, cart, order, inventory or payment feature. Business models, frontend pages and admin workflows must be implemented from the recorded requirements. The selected Skillux templates still need visual migration.

Requires Node.js >=22.12. Run npm install, npm run setup, npm run dev, then open http://localhost:3000. If admin is enabled, local credentials are in LOCAL_ACCESS.md (ignored by Git). Setup preserves existing data. For validation run npm run typecheck, npm test, npm run build.

Read .web-builder/project.json to continue: brief, selected template versions, businessImplementation, templateIntegration and checks. Neither pending status may be marked complete until the corresponding implementation has actually been verified. Downloaded packs stay private under .web-builder/templates. Never publish .env or LOCAL_ACCESS.md.

With admin enabled, baseline tests verify administrator authentication, session revocation and persistence; without admin, they verify public settings persistence in a separate temporary database. Add meaningful tests for the actual business workflows as they are implemented. Production builds use secure admin cookies and require HTTPS; use npm run dev for local HTTP.


Admin is generated only when site.config.json adminRequired is true. Without admin, there is no /admin interface, management API, administrator schema, or LOCAL_ACCESS.md. Public settings remain available in configuration/database; implement any requested operational integration separately. Other selected modules in continuation state remain pending until implemented.
