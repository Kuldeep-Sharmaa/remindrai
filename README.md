# RemindrAI

**A tool to help you actually show up for your content.**

RemindrAI is being built for creators and professionals who struggle with consistency—not because they lack ideas, but because remembering _when_ to post and _what_ to write adds up to real friction over time.

This repo is intentionally public and unfinished. It's here to show how a real product gets built, messy bits and all.

---

## Why this exists

Most content tools solve scheduling. That's useful, but it's not where people get stuck.

The real problem hits when it's time to sit down and _create_—and you're staring at a blank screen, trying to remember what you wanted to say or whether today was even the day you planned to post.

**RemindrAI is being built to help at that exact moment:**

- Remind you when it's time to create
- Cut through decision fatigue
- Eventually, offer AI-assisted drafts that actually feel useful (not generic)

Right now, the focus is on building something reliable and maintainable. Polish comes later.

---

## Where things stand

This is a work in progress, and it's being built in public on purpose.

**What's working:**

- Core frontend structure
- Firebase Auth for login/signup
- Firestore for user data
- Feature-based architecture (not a giant `components/` folder)

**What's being worked on:**

- AI draft generation
- Scheduled background jobs with Firebase Functions
- Edge cases, error handling, and general polish

**Target for initial v1:** February 16, 2026

---

## Tech stack

The tools were chosen to be practical, not trendy:

- **React (Vite)** — fast dev experience, modern tooling
- **Tailwind CSS** — predictable styling without fighting CSS
- **Firebase Auth** — handles authentication so I don't have to
- **Firestore** — real-time database that scales
- **Firebase Functions** — backend logic and cron jobs

The focus is on reliability and maintainability over novelty.

## How it's organized

The codebase is structured to stay maintainable as it grows:

src/
features/ # Business logic organized by domain
components/ # Reusable UI pieces
services/ # Firebase integrations and data access
hooks/ # Shared React logic
context/ # Global state management
pages/ # Top-level screens
routes/ # Routing setup

functions/ # Backend logic (Firebase Functions)
.env.example # Template for environment variables

```

The goal is to avoid the "one massive folder" problem that happens when projects grow.



## Running it locally

End users interact with RemindrAI through the web application; this setup exists purely for development and code review.

This repo is mostly here for review and learning, but if you want to spin it up:

1. Clone the repo
2. Copy `.env.example` to `.env` and fill in your own Firebase credentials
3. Run `npm install`
4. Run `npm run dev`

Production keys and services aren't included—you'll need to set up your own Firebase project.



## What this project is (and isn't)

**This is:**

- An in-progress SaaS build
- A real-world example of how apps evolve
- Being built in public as a learning process

**This isn't:**

- A polished demo
- A finished product
- A tutorial (though you might learn something from reading the code)



## License

Shared for portfolio and educational purposes. Not licensed for commercial use without explicit permission.


**Questions? Thoughts? Feedback?**
Feel free to open an issue or reach out. This is a learning process, and I'm here for it.
```
