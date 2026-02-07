/**
 * Content.jsx
 *
 * Drafts list view with filtering and sorting.
 * Shows unread drafts first, supports tab and reminder filtering.
 */

import React, { useMemo, useState } from "react";
import { collection, query, orderBy } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useCollection } from "../../hooks/useCollection";
import { useAuthContext } from "../../context/AuthContext";
import DraftListItem from "./ContentDraftUI/DraftListItem";
import DraftModal from "./ContentDraftUI/DraftModal";
import { markOpened } from "../../services/draftInteractionsService";
import ReminderDropdown from "./ContentDraftUI/DeliveryDropdown";

export default function Content() {
  const { currentUser } = useAuthContext();
  const userId = currentUser?.uid;

  const [selectedDraft, setSelectedDraft] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedReminderId, setSelectedReminderId] = useState("all");

  // Drafts query
  const draftsQuery = useMemo(() => {
    if (!userId) return null;
    return query(
      collection(db, "users", userId, "drafts"),
      orderBy("createdAt", "desc"),
    );
  }, [userId]);

  const {
    documents: drafts = [],
    isPending,
    error,
  } = useCollection(draftsQuery);

  // Reminders query
  const remindersQuery = useMemo(() => {
    if (!userId) return null;
    return collection(db, "users", userId, "reminders");
  }, [userId]);

  const { documents: reminders = [] } = useCollection(remindersQuery);

  // Interactions query
  const interactionsQuery = useMemo(() => {
    if (!userId) return null;
    return collection(db, "users", userId, "draftInteractions");
  }, [userId]);

  const { documents: interactions = [] } = useCollection(interactionsQuery);

  // Build lookup maps
  const reminderMap = useMemo(() => {
    const map = new Map();
    reminders.forEach((r) => map.set(r.id, r));
    return map;
  }, [reminders]);

  const interactionMap = useMemo(() => {
    const map = new Map();
    interactions.forEach((i) => map.set(i.id, i));
    return map;
  }, [interactions]);

  const truncate = (text = "", max = 40) =>
    text.length > max ? text.slice(0, max) + "…" : text;

  // Build delivery items
  const deliveryItems = useMemo(() => {
    return drafts.map((draft) => {
      const reminder = reminderMap.get(draft.reminderId);
      const interaction = interactionMap.get(draft.id);

      const baseLabel =
        reminder?.content?.aiPrompt || reminder?.content?.message || "Unknown";

      return {
        id: draft.id,
        createdAt: draft.createdAt,
        reminderId: draft.reminderId,
        reminderTitle: truncate(baseLabel),
        isUnread: !interaction?.openedAt,
        originalDraft: draft,
      };
    });
  }, [drafts, reminderMap, interactionMap]);

  // Sort: unread first, then by creation time
  const sortedItems = useMemo(() => {
    return [...deliveryItems].sort((a, b) => {
      if (a.isUnread !== b.isUnread) return a.isUnread ? -1 : 1;
      return b.createdAt?.seconds - a.createdAt?.seconds;
    });
  }, [deliveryItems]);

  // Apply filters
  const filteredItems = useMemo(() => {
    let list = sortedItems;

    if (activeTab === "unread") {
      list = list.filter((i) => i.isUnread);
    }

    if (activeTab === "today") {
      const now = new Date();
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      ).getTime();
      list = list.filter(
        (i) => i.createdAt?.toDate?.().getTime() >= todayStart,
      );
    }

    if (selectedReminderId !== "all") {
      list = list.filter((i) => i.reminderId === selectedReminderId);
    }

    return list;
  }, [sortedItems, activeTab, selectedReminderId]);

  // Only show reminders that have executed at least once
  const executedReminders = useMemo(() => {
    const executedIds = new Set(deliveryItems.map((d) => d.reminderId));
    return reminders.filter((r) => executedIds.has(r.id));
  }, [deliveryItems, reminders]);

  const unreadCount = useMemo(
    () => deliveryItems.filter((d) => d.isUnread).length,
    [deliveryItems],
  );

  // Loading state
  if (isPending) {
    return <div className="p-8 text-muted">Loading drafts...</div>;
  }

  // Error state
  if (error) {
    return <div className="p-8 text-red-500">Error loading drafts</div>;
  }

  return (
    <>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-grotesk font-semibold">Drafts</h2>
          <p className="text-sm text-muted mt-1">
            {deliveryItems.length} delivered
          </p>
        </div>

        {/* Tabs and reminder filter */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            {[
              { key: "all", label: "All" },
              { key: "unread", label: `Unread (${unreadCount})` },
              { key: "today", label: "Today" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 text-sm rounded-md ${
                  activeTab === tab.key
                    ? "bg-brand/10 text-brand"
                    : "text-muted hover:text-textLight dark:hover:text-textDark"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <ReminderDropdown
            reminders={executedReminders}
            selectedId={selectedReminderId}
            onChange={setSelectedReminderId}
          />
        </div>

        {/* Empty states */}
        {deliveryItems.length === 0 ? (
          <div className="text-muted text-center py-20">No drafts yet</div>
        ) : filteredItems.length === 0 ? (
          activeTab === "unread" ? (
            <div className="text-muted text-center py-20">
              You're all caught up.
            </div>
          ) : (
            <div className="text-muted text-center py-20">No drafts found.</div>
          )
        ) : (
          <div>
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
        )}
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
