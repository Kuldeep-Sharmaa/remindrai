# RemindrAI

> Your content assistant. Set the direction once. It prepares and delivers drafts at the right time..

RemindrAI keeps your content moving.

It’s built for creators, founders, and professionals who don’t struggle with ideas — they struggle with consistency. Not because they lack intent, but because daily work pulls attention elsewhere.

Instead of asking you to remember what to write or when to begin, RemindrAI prepares drafts in advance and delivers them at the right time. You define your voice and topics once. The system continues from there.

No blank screens. No repeated prompting. No mental overhead.

---

## Why it exists

Most tools focus on distribution. They schedule posts you’ve already written.

AI editors focus on generation. They wait for you to open them.

Both approaches still depend on you showing up first.

RemindrAI is built around a different model: you set the direction once, and the system continues preparing drafts on your behalf.

The goal is simple:

- Reduce the cognitive load of staying consistent
- Remove the need to repeatedly plan or prompt
- Deliver usable starting points instead of empty editors

Consistency becomes less about discipline and more about having a system that keeps moving.

---

## How it works

**1. Set your Content Identity**  
Define your role, tone, and platform. This determines how drafts are written in your voice.

**2. Create a delivery**  
Choose what should be prepared and the rhythm you prefer — one time, daily, or weekly.

**3. Receive your draft**  
At the chosen time, a ready draft appears in your Deliveries inbox.

That’s the loop. You set it once. The system continues.

---

## Current Status

![Status](https://img.shields.io/badge/status-in%20development-orange?style=for-the-badge)
![Target](https://img.shields.io/badge/v1%20target-mar%2011,%202026-blue?style=for-the-badge)

### What’s working

- Core dashboard and Studio flow
- Firebase authentication
- Firestore data model
- Backend execution system
- Delivery inbox and draft history

### In progress

- Final UI refinements

The execution system is active. Drafts currently use placeholder content while AI integration is completed.

---

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

The structure is organized for clarity and scalability.

---

## Development Setup

> End users interact with RemindrAI through the web application. The following steps are for development and code review.

```bash
# Clone the repository
git clone [repo-url]

# Install dependencies
npm install

# Configure environment variables
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

## Build By - Kuldeep Sharma

**Questions or feedback?** Open an issue. This is a learning process.
