# 3D Portfolio — Drop-in for github.com/gokulKumbakkara/portfolio

## What's in here
- `index.html` — replaces your current index.html
- `styles.css`
- `scene.js` — three.js scene
- `nexus.js` — RAG terminal, **already wired to your existing `/api/chat`** (Groq + RESUME_TEXT)

## Deploy
1. Copy these 4 files to your repo root (overwrite `index.html`).
2. Keep your existing `api/chat.js`, `vercel.json`, `resume.pdf`, and the `GROQ_API_KEY` / `RESUME_TEXT` env vars on Vercel.
3. Commit + push. Vercel auto-deploys. Done.

## What works out of the box
- All 7 nodes (Hero → About → Experience → Skills → Projects → Nexus → Contact).
- Nexus chat hits `/api/chat` — uses your real resume via Groq.
- Three.js loads from unpkg via importmap — **no build step**.

## Things you'll likely want to edit
The panel content is in `<template>` tags inside `index.html`. Search for `t-hero`, `t-about`, `t-experience`, `t-skills`, `t-projects`, `t-contact`. Update the copy to match your real experience/projects/links.

Specifically:
- `t-hero` — your name is fine; tweak the metric strip (YRS.OPS, SHIPPED).
- `t-experience` — replace the 3 placeholder jobs with your real ones.
- `t-skills` — adjust the proficiency percentages and skill names.
- `t-projects` — swap the 4 cards for your real repos.
- `t-contact` — update email / linkedin / cv link.

## Mobile note
The camera tween + scroll-snap UX is desktop-first. On phones you'll want bigger panels and touch-swipe between nodes. If you want me to add that, ping me.
