// useRemindrQuery.js

import { useMemo } from "react";
import { collection, query, orderBy } from "firebase/firestore";
import { db } from "../../../../services/firebase"; // adapt path to your repo
import useCollection from "../../../hooks/useCollection";

export default function useRemindrQuery(userId) {
  const q = useMemo(() => {
    if (!userId) return null;
    return query(
      collection(db, "users", userId, "reminders"), // 💡 CORRECTED ORDERING: Show the soonest action date first
      orderBy("nextRunAtUTC", "asc"),
      orderBy("createdAt", "desc")
    );
  }, [userId]);

  const { documents, isPending, error } = useCollection(q);
  return {
    reminders: documents || [],
    isPending,
    error,
    count: (documents || []).length,
  };
}
