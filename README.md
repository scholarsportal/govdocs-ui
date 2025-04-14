# GovDocs-UI Portal

The main portal to access the GovDocs services. This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app). It includes the React v19 and NextJS v13+ `app` folder configuration.

This UI connects to the `govdocs-api` and `supabase` deployments in the backend.

## Getting Started

Make sure to edit `.env` and set the following variables:

```text
NEXT_PUBLIC_SUPABASE_URL=<supabase-api-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
```

Then, run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Run with Docker

```bash
docker compose up
```
