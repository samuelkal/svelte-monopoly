# Svelte Monopoly (WIP)

Browser Monopoly-like game built with Svelte 5.

This repository is currently a work in progress and is not finished yet.

## What this is

- Frontend game board and UI in Svelte 5.
- Local game engine/state in the client.
- Custom board visuals and game actions (buy, upgrades, trade modal, log, notifications).

## Current state

![CurrentState](https://imgur.com/qdR5205.png)

## Tech stack

- Svelte 5 + SvelteKit
- Vite
- Tailwind CSS (project styling setup)

Planned/expected backend for real-time multiplayer:

- Flask/FastAPI (Python)
- Socket.IO

## Current status

Implemented:

- Main board layout and tiles
- Player panel and action panel
- Event zone / notifications / game log
- Basic turn and property interactions in the frontend engine

Not finished yet:

- Backend server integration (required for proper multiplayer/state sync)
- Networked game rooms / matchmaking
- Full rule validation and edge-case handling
- Production-ready game flow and balancing
- Tests and deployment hardening

## Run locally

```sh
npm install
npm run dev
```

Then open the local URL shown by Vite (usually `http://localhost:5173`).

## Important note

This repo is currently mainly frontend/prototype level.
To become a complete game, it still needs the backend layer (Flask + Socket.IO) and final game-rule completion.

## Why this repo exists

To share progress publicly and make the project easy to understand for anyone landing on GitHub.

