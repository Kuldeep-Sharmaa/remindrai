# RemindrAI

---

> A tool to help you actually show up for your content.

RemindrAI is being built for creators and professionals who struggle with consistency—not because they lack ideas, but because remembering _when_ to post and _what_ to write adds up to real friction over time.

This repo is intentionally public and unfinished. It's here to show how a real product gets built, messy bits and all.

<br>

## Why this exists

Most content tools solve scheduling. That's useful, but it's not where people get stuck.

The real problem hits when it's time to sit down and _create_—and you're staring at a blank screen, trying to remember what you wanted to say or whether today was even the day you planned to post.

**RemindrAI is being built to help at that exact moment:**

- Remind you when it's time to create
- Cut through decision fatigue
- Eventually, offer AI-assisted drafts that actually feel useful (not generic)

Right now, the focus is on building something reliable and maintainable. Polish comes later.

<br>

## Current Status

![Status](https://img.shields.io/badge/status-in%20development-orange?style=for-the-badge)
![Target](https://img.shields.io/badge/v1%20target-feb%2016%2C%202025-blue?style=for-the-badge)

### What's working

- Core frontend structure
- Firebase Auth
- Firestore integration
- Feature-based architecture

### In progress

- AI draft generation
- Background jobs
- Edge case handling

<br>

## Tech Stack

```
Frontend          React + Vite, Tailwind CSS
Auth & Database   Firebase Auth, Firestore
Backend           Firebase Functions
```

**Why these choices:**  
The focus is on reliability and maintainability over novelty. Each piece was chosen because it solves a specific problem well and has proven itself in production environments.

<br>

## Design Principles

- Build for consistency before automation
- Prefer clarity over cleverness
- Separate concerns early to avoid rewrites later

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
