# 🚀 RemindrAI Core Feature: Reminder Creation Workflow (CRUD: CREATE)

This document provides a high-level map of how user input is transformed into a persistent database record in Firebase. This workflow ensures all reminders are scheduled reliably across global timezones.

---

## 🗺️ The Core Workflow Map: Form to Firebase

The entire process involves three primary code files, ensuring a strict **Separation of Concerns (SOC)**.

| Step                    | Component / Role                  | Responsibility                                                                                                                                            | Key Function/Data Flow                                                               |
| :---------------------- | :-------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------- |
| **1. UI & State**       | **`components/ReminderForm.jsx`** | Collects user input and hands it off to the submission handler.                                                                                           | `useReminderForm().save()` is called on submit.                                      |
| **2. Logic & Payload**  | **`hooks/useReminderForm.js`**    | Manages form state, performs validation, and builds the final data object (the payload). **Crucially, it calculates the next run time.**                  | Calls `buildPayload()` which uses `scheduleUtils` to compute the **`nextRunAtUTC`**. |
| **3. Data Persistence** | **`services/remindrClient.js`**   | Acts as the dedicated, simple interface for talking to Firebase. This is the **only place** that uses the `firebase/firestore` SDK methods like `addDoc`. | Exports `addReminder(payload)` which writes to the database.                         |

---

## ⏰ The Timezone Strategy (Production Strength)

The most important concept in this workflow is ensuring global reliability by handling timezones correctly.

| Field                   | Storage                                                                    | Purpose                                                                                                                        |
| :---------------------- | :------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------- |
| **`schedule`** (object) | Stored as is.                                                              | Used for **editing** the reminder and showing the time to the user in their **local zone** (e.g., `09:00 AM in Asia/Kolkata`). |
| **`nextRunAtUTC`**      | Stored as a **Firestore Timestamp** (based on a JavaScript `Date` object). | This is the definitive, **server-ready time** for the reminder to fire. **All server logic must rely on this field.**          |

**Why is this strong?** The front-end deals with the user's perception of time, but the backend only cares about the unchangeable, absolute moment in time (`nextRunAtUTC`).

---

## 💾 Firebase Structure & Integrity

### Database Path

Reminders are stored in a secure, scalable subcollection:
