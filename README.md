# Underclient Comms

A custom Discord Embedded App SDK communication platform focused on persistent conversations, temporary/private messaging spaces, and streamlined community interaction directly inside Discord voice activities.

## Overview

Underclient Comms is a Discord Embedded App built using the Discord Embedded App SDK, React, TypeScript, and a custom backend architecture.

The project is designed around:

* Fast communication inside Discord Activities
* Persistent server/channel messaging
* Temporary and private communication spaces
* Lightweight and responsive UI
* Backend-controlled session management
* Real-time updates using WebSockets
* Future marketplace and monetization expansion

The application runs inside Discord voice channels through Discord Activities while communicating with an external backend service for authentication, messaging, synchronization, and storage.

---

## Features

### Current Features

* Discord Embedded App SDK integration
* OAuth2 authentication flow
* Real-time messaging
* Server and channel support
* Private code-access chats
* Message persistence
* React frontend
* TypeScript backend
* Firebase/Firestore storage
* WebSocket synchronization
* Dynamic routing
* Custom UI components
* Activity-aware session handling

---

### Planned Features

* Voice-channel-wide synchronization
* Rich media support
* Image uploads
* Video uploads
* Temporary disappearing messages
* User profiles
* Channel moderation systems
* Role-based permissions
* In-app economy systems
* Marketplace integration
* Custom themes
* Mobile companion application
* AI-assisted moderation tools
* Livestreaming support

---

## Technology Stack

### Frontend

* React
* TypeScript
* Styled Components
* React Router DOM
* Discord Embedded App SDK

### Backend

* Node.js
* Express
* TypeScript
* WebSocket (`ws`)
* Firebase Admin SDK
* Firestore

### Infrastructure

* Ngrok (development tunneling)
* HTTPS local development
* Linux deployment support
* systemd service support

---

## Project Structure

```text
project-root/
├── src/
|   ├── assets/
|   |
│   ├── client/
|   |   ├── api/
│   │   ├── components/
│   │   ├── helpers/
│   │   ├── hooks/
│   │   ├── public/
│   │   ├── styles/
│   │   ├── app.tsx
│   │   └── index.tsx
|   |
│   ├── server/
│   │   ├── bot/
│   │   ├── controllers/
│   │   ├── helpers/
│   │   ├── firebase/
│   │   └── server.ts
│   │
│   └── types/
│
├── dist/
├── package.json
└── tsconfig.json
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/your-username/underclient-comms.git
cd underclient-comms
```

---

### Install Dependencies

```bash
npm install
```

---

## Environment Variables

Create a `.env` file in the project root.

```env
# Discord
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=

# Firebase
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=

# Server
PORT=3001
NODE_ENV=development
```

---

## Running The Project

### Development Mode

```bash
npm run dev
```

---

### Production Build

```bash
npm run build
```

---

### Run Production Server

```bash
node dist/server/server.cjs
```

---

## Discord Embedded App Setup

### Create Application

Create a Discord application through:

[Discord Developer Portal](https://discord.com/developers/applications)

---

### Enable Activities

Inside your Discord application:

* Enable Activities
* Configure Activity URLs
* Configure OAuth2 settings
* Add redirect URLs
* Configure embedded application permissions

---

### Local Development

Discord Activities require HTTPS. You can run it locally with http

Example using ngrok:

```bash
ngrok http https://localhost:3001
```

Use the generated HTTPS URL inside the Discord Developer Portal.

---

## Authentication Flow

Underclient Comms uses the Discord Embedded App SDK authorization flow.

### Client Flow

1. User launches activity
2. SDK initializes
3. Client requests authorization code
4. Code is sent to backend
5. Backend exchanges code for access token
6. Session information is returned to client

---

### Example SDK Initialization

```typescript
import { DiscordSDK } from "@discord/embedded-app-sdk";

const discordSdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID);

await discordSdk.ready();
```

---

## WebSocket Communication

The application uses WebSockets for:

* Real-time messages
* Presence updates
* Session synchronization
* Channel updates
* Typing indicators
* Activity state synchronization

---

## Database Design

Firestore is used for:

* Users
* Servers
* Channels
* Messages
* Private sessions
* Session metadata

The architecture prioritizes:

* scalable collections
* minimal client trust
* server-side validation
* flexible document structures

---

## Security Goals

Underclient Comms is designed around:

* backend validation
* authenticated requests
* Discord-based identity
* controlled session access
* isolated private channels
* minimized exposed user metadata

---

## Licensing

Copyright (c) 2026 Matthew Rackley / Marack.dev

All rights reserved.

This repository is source-available but not open-source.

You may:

* View the source code
* Use the project privately for educational purposes
* Fork privately for personal experimentation

You may NOT:

* Redistribute the project
* Sell the project
* Rebrand the project
* Host public modified versions
* Use the project commercially
* Remove attribution

Third-party libraries remain under their respective licenses.

---

## Third-Party Software

This project depends on third-party open-source packages licensed under:

* MIT
* Apache-2.0
* BSD
* ISC

Their licenses remain the property of their respective authors.

---

## Development Notes

The project is currently under active development.

Architecture, APIs, database schemas, and UI systems may change frequently.

---

## Contributing

Contributions are currently closed.

Public issues and feedback may be opened later.

---

## Contact

Team: Marack.dev

Support: [support@pornova18.com](mailto:support@pornova18.com)

---

## Disclaimer

Underclient Comms is an independent project and is not affiliated with or endorsed by Discord.
