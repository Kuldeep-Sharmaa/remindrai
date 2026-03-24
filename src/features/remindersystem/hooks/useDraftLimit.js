import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { DateTime } from "luxon";
import { db } from "../../../services/firebase";
import { useAppTimezone } from "../../../context/TimezoneProvider";

const DRAFT_LIMIT = 3;

// real-time listener — updates instantly when scheduler records a new execution
// mirrors backend checkDraftLimit logic exactly, source of truth is still backend
export default function useDraftLimit(uid) {
  const { timezone } = useAppTimezone();
  const [limited, setLimited] = useState(false);
  const [count, setCount] = useState(0);
  const [resetsAt, setResetsAt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    const userTimezone = timezone || "UTC";

    // start of today in user's timezone — same calculation as backend
    const startOfToday = DateTime.now()
      .setZone(userTimezone)
      .startOf("day")
      .toUTC()
      .toJSDate();

    const windowStart = Timestamp.fromDate(startOfToday);

    // resets at midnight tonight — static for the day, no need to recalculate
    const tomorrowMidnight = DateTime.now()
      .setZone(userTimezone)
      .plus({ days: 1 })
      .startOf("day")
      .toJSDate();

    setResetsAt(tomorrowMidnight);

    const q = query(
      collection(db, "users", uid, "executions"),
      where("status", "==", "executed"),
      where("createdAt", ">=", windowStart),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        // filter aiUsed in code — avoids needing a 3-field composite index
        const draftCount = snapshot.docs.filter(
          (doc) => doc.data().aiUsed === true,
        ).length;

        setCount(draftCount);
        setLimited(draftCount >= DRAFT_LIMIT);
        setLoading(false);
      },
      (error) => {
        console.error("[useDraftLimit] Listener failed", error);
        // fail open — don't block the user if listener fails
        setLimited(false);
        setLoading(false);
      },
    );

    // clean up listener when component unmounts or uid/timezone changes
    return () => unsubscribe();
  }, [uid, timezone]);

  return { limited, count, resetsAt, loading };
}
