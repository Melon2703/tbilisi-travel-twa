# Static Local JSON Schema for MVP Route Data

We decided to store curated routes and stop details in a static local JSON schema (`/lib/data/routes.json`) rather than provisioning a database (e.g. PostgreSQL or Supabase) for the MVP. Since the MVP contains a curated set of routes edited directly by content creators (Olya), static JSON enables sub-millisecond SSR rendering on Vercel edge/serverless functions, zero database latency, easy versioning via Git, and zero deployment overhead. A database can be introduced when user-generated routes or real-time bookmarking are added post-MVP.
