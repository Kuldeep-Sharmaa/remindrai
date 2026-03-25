import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { DateTime } from "luxon";
import { Timestamp } from "firebase/firestore";
import { db } from "../../../services/firebase";
import { useAppTimezone } from "../../../context/TimezoneProvider";

const ACTIVE_LIMIT = 3;

// counts active AI prompt slots — includes one-time reminders that fired today
// a one-time that executed today still holds its slot until midnight
// this prevents the "free bar" illusion while draft limit is still active
export default function useActiveReminderLimit(uid) {
  const { timezone } = useAppTimezone();
  const [atActiveLimit, setAtActiveLimit] = useState(false);
  const [activeCount, setActiveCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    const userTimezone = timezone || "UTC";

    // start of today in user's timezone — same anchor as draft limit reset
    const startOfToday = DateTime.now()
      .setZone(userTimezone)
      .startOf("day")
      .toUTC()
      .toJSDate();

    const todayTimestamp = Timestamp.fromDate(startOfToday);

    // query 1 — currently active AI reminders
    const activeQuery = query(
      collection(db, "users", uid, "reminders"),
      where("reminderType", "==", "ai"),
      where("enabled", "==", true),
    );

    // query 2 — one-time reminders that fired today but are now disabled
    // they still hold a slot until midnight — same reset as draft limit
    const completedTodayQuery = query(
      collection(db, "users", uid, "reminders"),
      where("reminderType", "==", "ai"),
      where("enabled", "==", false),
      where("frequency", "==", "one_time"),
      where("updatedAt", ">=", todayTimestamp),
    );

    let activeSnap = null;
    let completedSnap = null;

    function recalculate() {
      if (activeSnap === null || completedSnap === null) return;

      // exclude soft-deleted from both
      const activeDocs = activeSnap.docs.filter((doc) => !doc.data().deletedAt);

      const completedTodayDocs = completedSnap.docs.filter(
        (doc) => !doc.data().deletedAt,
      );

      // combined count — both hold slots until midnight
      const total = activeDocs.length + completedTodayDocs.length;

      setActiveCount(total);
      setAtActiveLimit(total >= ACTIVE_LIMIT);
      setLoading(false);
    }

    const unsubActive = onSnapshot(
      activeQuery,
      (snap) => {
        activeSnap = snap;
        recalculate();
      },
      (error) => {
        console.error("[useActiveReminderLimit] Active listener failed", error);
        setAtActiveLimit(false);
        setLoading(false);
      },
    );

    const unsubCompleted = onSnapshot(
      completedTodayQuery,
      (snap) => {
        completedSnap = snap;
        recalculate();
      },
      (error) => {
        console.error(
          "[useActiveReminderLimit] Completed listener failed",
          error,
        );
        // fail open — don't block user if this secondary check fails
        completedSnap = { docs: [] };
        recalculate();
      },
    );

    return () => {
      unsubActive();
      unsubCompleted();
    };
  }, [uid, timezone]);

  return { atActiveLimit, activeCount, loading };
}
