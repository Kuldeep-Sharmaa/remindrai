# RemindrAI

---

> A personal AI content assistant that helps you stay consistent.

RemindrAI is being built for creators, founders, and busy professionals who struggle with consistency—not because they lack ideas, but because creation gets pushed aside by daily work.

Instead of asking you to remember what to write or when to start, RemindrAI is designed to **show up with content when it matters**.

This repository is intentionally public and unfinished. It reflects how a real product is built—incrementally, imperfectly, and with long-term thinking.

<br>

## Why this exists

Most content tools focus on scheduling. That solves distribution, but not the hardest part.

The real friction happens earlier—when it’s time to create and you’re staring at a blank screen, unsure what to say, or whether now is even the right moment.

RemindrAI is being built to help at that point.

The goal is simple:

- Reduce the mental load around consistency
- Remove the need to repeatedly prompt or plan from scratch
- Deliver fresh, relevant starting points instead of empty editors

Over time, this becomes less about reminders and more about having an AI assistant that remembers your intent and acts on it.

<br>

## Current Status

![Status](https://img.shields.io/badge/status-in%20development-orange?style=for-the-badge)
![Target](https://img.shields.io/badge/v1%20target-feb%2016%2C%202025-blue?style=for-the-badge)

### What’s working

- Core frontend architecture
- Authentication with Firebase
- Firestore-based data model
- Feature-oriented project structure

### In progress

- AI draft generation and delivery flow
- Background execution and scheduling logic
- Cost controls and edge-case handling

The focus right now is reliability and correctness. Polish comes later.

<br>

## Tech Stack

```
Frontend          React + Vite, Tailwind CSS
Auth & Database   Firebase Auth, Firestore
Backend           Firebase Functions
```

**Why these choices:**  
Each tool was selected for stability, clarity, and long-term maintainability. There’s no experimentation for novelty’s sake—only what’s needed to support a real product.

<br>

## Design Principles

- Consistency before automation
- Clear flows over clever abstractions
- Separate concerns early to avoid rewrites later
- Prefer systems that fail safely

<br>

## Project Structure

```
src/
├── features/       Business logic by domain
├── components/     Reusable UI components
├── services/       Firebase integrations
├── hooks/          Shared React logic
├── context/        Global state
├── pages/          Screen-level components
└── routes/         Routing configuration

functions/          Backend logic and scheduled tasks
```

Organized to scale without becoming unwieldy.

<br>

## Development Setup

**Note:** End users interact with RemindrAI through the web application. This section exists only for development and code review.

```bash
# Clone and install
git clone [repo-url]
npm install

# Configure environment
cp .env.example .env
# Add your Firebase credentials

# Run locally
npm run dev
```

You'll need your own Firebase project—production credentials aren't included.

<br>

## What This Is

This is an **in-progress SaaS build** being developed in public. It's a real-world example of how applications evolve from concept to production.

**This is not:**

- A polished demo
- A tutorial project
- Production-ready (yet)

The code reflects actual development practices—including the messy middle stages where things work but aren't pretty yet.

<br>

## License

```
Shared for portfolio and educational purposes.
Not licensed for commercial use without explicit permission.
```

<br>

---

**Questions or feedback?** Open an issue. This is a learning process.
