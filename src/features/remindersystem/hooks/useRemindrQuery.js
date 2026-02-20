import { useMemo } from "react";
import { collection, query, orderBy } from "firebase/firestore";
import { db } from "../../../../services/firebase";
import useCollection from "../../../hooks/useCollection";

export default function useRemindrQuery(userId) {
  const q = useMemo(() => {
    if (!userId) return null;
    return query(
      collection(db, "users", userId, "reminders"),
      orderBy("nextRunAtUTC", "asc"),
      orderBy("createdAt", "desc"),
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
