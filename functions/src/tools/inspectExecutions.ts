/**
 * Debug script for viewing execution logs in local emulator.
 * Run with: node inspectExecutions.js
 */

import * as admin from "firebase-admin";

admin.initializeApp({
  projectId: "demo-remindrai",
});

const db = admin.firestore();

db.settings({
  host: "localhost:8080",
  ssl: false,
});

const USER_ID = "TEST_USER_ID";

async function inspectExecutions() {
  const executionsRef = db
    .collection("users")
    .doc(USER_ID)
    .collection("executions");

  const snapshot = await executionsRef.orderBy("createdAt", "desc").get();

  if (snapshot.empty) {
    console.log("No executions found for", USER_ID);
    return;
  }

  console.log(`Found ${snapshot.size} executions for ${USER_ID}:\n`);

  snapshot.forEach((doc) => {
    const data = doc.data();
    console.log(`${doc.id}`);
    console.log(`  reminder: ${data.reminderId}`);
    console.log(`  scheduled: ${data.scheduledForUTC}`);
    console.log(`  state: ${data.state}`);
    if (data.errorMessage) {
      console.log(`  error: ${data.errorMessage}`);
    }
    console.log("");
  });
}

inspectExecutions()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error:", err.message);
    process.exit(1);
  });
