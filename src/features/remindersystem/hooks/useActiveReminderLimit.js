import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../../services/firebase";

const ACTIVE_LIMIT = 3;

// real-time listener — updates instantly when user deletes or adds a reminder
// no page refresh needed, onSnapshot fires on every Firestore change
export default function useActiveReminderLimit(uid) {
  const [atActiveLimit, setAtActiveLimit] = useState(false);
  const [activeCount, setActiveCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "users", uid, "reminders"),
      where("reminderType", "==", "ai"),
      where("enabled", "==", true),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        // exclude soft-deleted reminders
        const active = snapshot.docs.filter(
          (doc) => !doc.data().deletedAt,
        ).length;

        setActiveCount(active);
        setAtActiveLimit(active >= ACTIVE_LIMIT);
        setLoading(false);
      },
      (error) => {
        console.error("[useActiveReminderLimit] Listener failed", error);
        // fail open — don't block the user if listener fails
        setAtActiveLimit(false);
        setLoading(false);
      },
    );

    // clean up listener when component unmounts or uid changes
    return () => unsubscribe();
  }, [uid]);

  return { atActiveLimit, activeCount, loading };
}
