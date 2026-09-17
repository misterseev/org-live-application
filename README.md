# Org Live Web

Friends-first real-time messenger mock built with Next.js App Router.

## Stack

- Next.js 16 + TypeScript + Tailwind CSS v4
- HeroUI, Zustand, TanStack Query, React Hook Form, Zod
- Lucide + Framer Motion
- Package manager: bun

## Run

```bash
bun install
bun dev
```

Open [http://localhost:3000/app](http://localhost:3000/app) after login.

## Demo accounts

- Email login: `alex@orglive.com` / `Password1`
- Google login: real OAuth via Auth.js

## Routes

- `/` landing + support chat widget
- `/register` `/login` `/forgot-password` `/reset-password`
- `/app` Discord-like workspace (servers/channels) + Home DMs
- `/messenger` redirects to `/app`