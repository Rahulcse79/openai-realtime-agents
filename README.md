# Advance AI/ML IVRS (Main)

> **Advance AI/ML Interactive Voice Response System** — a production-ready platform that fuses low-latency speech agents with real-time biometric sensing and ML-powered emotion/stress detection. The system automatically detects language, converses in the caller’s language, analyzes live sensor telemetry (EEG, PPG/ECG, SpO₂, GSR, temperature, motion, camera), and can intelligently escalate the call to a human agent with contextual evidence.

---

## Table of Contents

- [Overview](#overview)
- {ScreenShort}(#screen-short)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Quickstart](#quickstart)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the system](#running-the-system)
- [Sensors & Integrations](#sensors--integrations)
- [Data, Storage & Analytics](#data-storage--analytics)
- [Security & Privacy](#security--privacy)
- [Contributing](#contributing)
- [License](#license)
- [Author & Links](#author--links)

---

## Overview

This project brings emotionally intelligent IVR to production by combining real-time voice agents with continuous physiological telemetry. It is intended for environments where caller emotional state and physiological signals can help route calls, improve outcomes, and provide richer context to human operators.

The platform:

- Automatically detects the caller's language and speaks in the same language.
- Streams and visualizes sensor signals in real time on a secure dashboard.
- Uses ML models to infer stress, fatigue, emotion, and intent from audio and biosignals.
- Decides autonomously whether to resolve the request or escalate to a human agent (including session context and sensor evidence).
- Records structured session data for later review and analytics.

This repository contains a frontend dashboard (React/Next.js), backend services (Node.js), and glue logic for real-time audio and sensors.

---

## ScreenShort

<img width="1440" height="900" alt="AI_ML_BASED_IVRS_SS" src="https://github.com/user-attachments/assets/45810533-1dad-43ba-88cd-066b148bab8e" />

---

## Key Features

- Low-latency speech-to-speech AI agent with configurable provider (OpenAI Realtime or equivalents).
- Automatic language detection and multilingual TTS/STT.
- Live biosignal telemetry: EEG, heart rate (PPG/ECG), SpO₂, respiration, skin conductance (GSR), temperature, accelerometer/motion, camera/vision (face/emotion).
- Multimodal emotion/stress detection that fuses voice and biosignals.
- Hologram visualization space in the frontend showing a user’s virtual body state.
- Smart escalation: auto-transfer to human agents with context and evidence.
- Session recordings, telemetry logging, and exportable analytics.
- Extensible: add new sensors, ML models, or agent hooks.

---

## Architecture

**High-level components**

- **Frontend (Next.js / React)**

  - Real-time dashboard showing audio chat, biosignal widgets, hologram, and agent controls.

- **Backend (Node.js / Express / WebSocket)**

  - WebSocket / WebRTC connection management.
  - Relay between audio streams and the AI Realtime API.
  - Ingests sensor telemetry and exposes operator control APIs.

- **Storage**

  - Time-series DB for sensor telemetry (InfluxDB or equivalent) and relational DB for sessions and audit logs (Postgres, etc.).

---

## Quickstart (development)

1. Clone the repo:

```bash
git clone https://github.com/Rahulcse79/openai-realtime-agents.git
cd openai-realtime-agents
git checkout Advance-AI/ML-IVRS
```

2. Install frontend and backend dependencies:

```bash
# from repository root (adjust paths if mono-repo)
cd frontend
npm install
cd ../backend
npm install
```

3. Configure required environment variables (see [Configuration](#configuration)).
4. Start backend and frontend (example):

```bash
# backend
cd backend
npm run dev

# frontend
cd ../frontend
npm run dev
```

Open the dashboard at `http://localhost:3000` (or configured port).

---

## Prerequisites

- Node.js (LTS recommended)
- npm or yarn
- Access to an AI Realtime provider (API key / URL)
- Optional: InfluxDB / PostgreSQL for telemetry and session storage
- Optional: TLS certificate / reverse proxy for secure deployment

### Local HTTPS (TLS)

This repo includes a custom HTTPS entrypoint (`server.js`). By default it uses `public/wss.pem` as both the TLS key and certificate.

You can override this via `.env`:

- `TLS_PEM_PATH` (single PEM used for both key+cert), or
- `TLS_KEY_PATH` + `TLS_CERT_PATH` (separate PEM files; both required)

---

## Configuration

Create `.env` files for frontend and backend. Example environment variables:

```
# Backend
PORT=4000
AI_REALTIME_API_KEY=your_realtime_api_key
AI_REALTIME_URL=https://api.your-realtime-provider.example
WEBSOCKET_PATH=/ws
DB_URL=postgres://user:pass@host:5432/dbname
INFLUX_URL=http://influx:8086
SENSOR_WS_URL=wss://sensor-gateway.example/ws
AGENT_AUTH_TOKEN=secret

# Frontend (prefix PUBLIC/next variables)
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_AI_PROVIDER_NAME=OpenAI-Realtime
```

> **Security note:** Never commit secrets to the repository. Use a secret manager or environment variables in production.

---

## Running in production

- Build frontend and backend with the appropriate build commands.
- Serve behind a reverse proxy (nginx) and enable TLS.
- Use secure key management for provider and DB credentials.
- Configure process manager (systemd, PM2) or containerize with Docker/Kubernetes for reliability.

---

## Sensors & Integrations

The platform accepts telemetry from a sensor gateway (WebSocket or REST). Supported signals include:

- EEG
- PPG / ECG (heart rate)
- SpO₂
- Respiration
- GSR (skin conductance)
- Temperature
- Accelerometer / motion
- Camera / face analysis

Implementation notes:

- Sensors should stream timestamped samples (ISO 8601 / UNIX epoch) and include device metadata.
- The backend ingests telemetry and writes time-series to InfluxDB (or chosen TS DB) and stores event/session metadata to Postgres.
- A modular sensor adapter layer makes it easy to add new device types.

---

## ML models

- The system includes fusion models that combine audio features and physiological features to estimate stress, emotion, and fatigue.
- Models should expose a minimal inference API (gRPC/HTTP) and be run separately (containerized) for scalability.
- A model registry or versioning scheme is recommended for reproducible experiments and safe rollouts.

---

## Data, Storage & Analytics

- **Time-series DB** (InfluxDB, TimescaleDB) stores raw sensor telemetry.
- **Relational DB** (Postgres) stores session metadata, user/agent info, and audit logs.
- Session recordings (audio, inferred labels, and aggregated metrics) are stored and can be exported for offline analytics.

---

## Security & Privacy

- Obtain informed consent from callers before collecting any biometric or camera data.
- Encrypt telemetry and recordings both in transit (TLS) and at rest.
- Implement role-based access for operator dashboards and redact PII when required.
- Follow applicable laws and regulations for biometric data in your jurisdiction (GDPR, HIPAA, local privacy laws).

---

## Contributing

Contributions are welcome.

- Open an issue to discuss big changes.
- Send a PR with clear tests and a description of changes.
- Follow the existing code style and linting rules.

---

## Screenshot / Demo

Demo video / sample recording:

`https://drive.google.com/file/d/1S-V77THk717BPXJM4sohR4AZz00n9s4V/view?usp=sharing`

---

## Author & Links

**Author:** Rahul Singh (Software Engineer)

- GitHub: `https://github.com/Rahulcse79/openai-realtime-agents/tree/Advance-AI/ML-IVRS`

---

## License

This repository is provided under the **MIT License** by default. Update the license file if you prefer another.

---

_If you want, I can also generate a polished `LICENSE`, CI workflow (GitHub Actions) for automated tests & deployments, or a condensed `README` for the repo homepage._
