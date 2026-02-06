/**
 * Content.jsx
 *
 * Drafts list view with unread-first sorting and filtering.
 * Fetches drafts, reminders, and interaction data to build delivery items.
 */

import React, { useMemo, useState } from "react";
import { collection, query, orderBy } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useCollection } from "../../hooks/useCollection";
import { useAuthContext } from "../../context/AuthContext";
import DraftListItem from "./ContentDraftUI/DraftListItem";
import DraftModal from "./ContentDraftUI/DraftModal";
import { markOpened } from "../../services/draftInteractionsService";

export default function Content() {
  const { currentUser } = useAuthContext();
  const userId = currentUser?.uid;

  const [selectedDraft, setSelectedDraft] = useState(null);

  // Filter state (logic implemented, UI not yet wired)
  const [activeTab] = useState("all"); // "all" | "unread" | "today"
  const [selectedReminderId] = useState("all");

  // Drafts query
  const draftsQuery = useMemo(() => {
    if (!userId) return null;
    return query(
      collection(db, "users", userId, "drafts"),
      orderBy("createdAt", "desc"),
    );
  }, [userId]);

  const {
    documents: drafts,
    isPending: draftsPending,
    error: draftsError,
  } = useCollection(draftsQuery);

  // Reminders query
  const remindersQuery = useMemo(() => {
    if (!userId) return null;
    return collection(db, "users", userId, "reminders");
  }, [userId]);

  const { documents: reminders } = useCollection(remindersQuery);

  // Interactions query
  const interactionsQuery = useMemo(() => {
    if (!userId) return null;
    return collection(db, "users", userId, "draftInteractions");
  }, [userId]);

  const { documents: interactions } = useCollection(interactionsQuery);

  // Build lookup maps
  const reminderMap = useMemo(() => {
    const map = new Map();
    reminders?.forEach((r) => map.set(r.id, r));
    return map;
  }, [reminders]);

  const interactionMap = useMemo(() => {
    const map = new Map();
    interactions?.forEach((i) => map.set(i.id, i));
    return map;
  }, [interactions]);

  // Truncate helper
  const truncate = (text = "", max = 40) =>
    text.length > max ? text.slice(0, max) + "…" : text;

  // Build delivery items
  const deliveryItems = useMemo(() => {
    if (!drafts) return [];

    return drafts.map((draft) => {
      const reminder = reminderMap.get(draft.reminderId);
      const interaction = interactionMap.get(draft.id);

      const reminderTitle = truncate(reminder?.content?.aiPrompt || "Unknown");
      const isUnread = !interaction?.openedAt;

      return {
        id: draft.id,
        createdAt: draft.createdAt,
        preview: draft.content || "",
        reminderTitle,
        isUnread,
        reminderId: draft.reminderId,
        originalDraft: draft,
      };
    });
  }, [drafts, reminderMap, interactionMap]);

  // Sort: unread first, newest within groups
  const sortedItems = useMemo(() => {
    return [...deliveryItems].sort((a, b) => {
      if (a.isUnread !== b.isUnread) return a.isUnread ? -1 : 1;
      return b.createdAt?.seconds - a.createdAt?.seconds;
    });
  }, [deliveryItems]);

  // Apply filters
  const filteredItems = useMemo(() => {
    let list = sortedItems;

    // Tab filter
    if (activeTab === "unread") {
      list = list.filter((i) => i.isUnread);
    }

    if (activeTab === "today") {
      const now = Date.now();
      const last24h = now - 24 * 60 * 60 * 1000;
      list = list.filter((i) => i.createdAt?.toDate?.().getTime() >= last24h);
    }

    // Reminder filter
    if (selectedReminderId !== "all") {
      list = list.filter((i) => i.reminderId === selectedReminderId);
    }

    return list;
  }, [sortedItems, activeTab, selectedReminderId]);

  // Loading state
  if (draftsPending) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted">Loading drafts...</div>
      </div>
    );
  }

  // Error state
  if (draftsError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-500">Error loading drafts</div>
      </div>
    );
  }

  // Empty state
  if (!filteredItems.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="text-muted mb-2">No drafts yet</div>
        <div className="text-sm text-muted/60">
          Your generated drafts will appear here
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-grotesk font-semibold">Drafts</h2>
          <p className="text-sm text-muted mt-1">
            {filteredItems.length}{" "}
            {filteredItems.length === 1 ? "draft" : "drafts"} delivered
          </p>
        </div>

        <div className="space-y-3">
          {filteredItems.map((item) => (
            <DraftListItem
              key={item.id}
              draft={item.originalDraft}
              reminderTitle={item.reminderTitle}
              isUnread={item.isUnread}
              onClick={() => {
                markOpened({ uid: userId, draftId: item.id });
                setSelectedDraft(item.originalDraft);
              }}
            />
          ))}
        </div>
      </div>

      {selectedDraft && (
        <DraftModal
          draft={selectedDraft}
          onClose={() => setSelectedDraft(null)}
        />
      )}
    </>
  );
}
