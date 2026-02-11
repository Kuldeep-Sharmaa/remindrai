/**
 * Content.jsx
 *
 * Deliveries page - Shows AI-created outputs ready to use.
 * Emphasizes clarity, time relevance, and actionability.
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
import DeliveriesEmptyState from "./ContentDraftUI/DeliveriesEmptyState";

export default function Content() {
  const { currentUser } = useAuthContext();
  const userId = currentUser?.uid;

  const [selectedDelivery, setSelectedDelivery] = useState(null);
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

  // Build lookup maps for quick access
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
    text.length > max ? text.slice(0, max) + "..." : text;

  const firstDefinedString = (...values) => {
    for (const value of values) {
      if (typeof value === "string" && value.trim() !== "") return value;
    }
    return "";
  };

  // Build delivery items with full reminder context
  const deliveryItems = useMemo(() => {
    return drafts.map((draft) => {
      const reminder = reminderMap.get(draft.reminderId);
      const interaction = interactionMap.get(draft.id);
      const reminderContent = reminder?.content || {};
      const draftContext = draft?.context || {};

      const prompt = firstDefinedString(
        reminderContent.aiPrompt,
        reminderContent.message,
        reminder?.aiPrompt,
        reminder?.message,
        draftContext.aiPrompt,
        draftContext.message,
      );
      const role = firstDefinedString(
        reminderContent.role,
        reminder?.role,
        draftContext.role,
      );
      const tone = firstDefinedString(
        reminderContent.tone,
        reminder?.tone,
        draftContext.tone,
      );
      const platform = firstDefinedString(
        reminderContent.platform,
        reminder?.platform,
        draftContext.platform,
      );
      const reminderType =
        reminder?.reminderType || draftContext.reminderType || "simple";
      const frequency =
        reminder?.frequency || draftContext.frequency || "one_time";
      const enabled = reminder?.enabled ?? draftContext.enabled ?? true;
      const createdAt = draft?.createdAt || draftContext?.createdAt;

      return {
        id: draft.id,
        createdAt,
        reminderId: draft.reminderId,
        reminderTitle: truncate(prompt || "Untitled"),
        isUnread: !interaction?.openedAt,
        draft,
        prompt: prompt || "Untitled",
        role,
        tone,
        platform,
        reminderType,
        frequency,
        enabled,
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted">Loading drafts...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error loading drafts</div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
        {/* Header */}
        <div className="mb-5 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl font-grotesk font-semibold text-textLight dark:text-textDark">
            Drafts
          </h2>
          <p className="text-sm text-muted mt-1">
            {deliveryItems.length} total
            {unreadCount > 0 && ` - ${unreadCount} unread`}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {[
            { key: "all", label: "All" },
            {
              key: "unread",
              label: unreadCount > 0 ? `Unread (${unreadCount})` : "Unread",
            },
            { key: "today", label: "Today" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm rounded-lg whitespace-nowrap font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-brand/10 text-brand"
                  : "text-muted hover:text-textLight dark:hover:text-textDark hover:bg-border/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filter - Visible, below tabs */}
        <div className="mb-5">
          <ReminderDropdown
            reminders={executedReminders}
            selectedId={selectedReminderId}
            onChange={setSelectedReminderId}
          />
        </div>

        {/* Draft list or empty states */}
        {deliveryItems.length === 0 ? (
          <DeliveriesEmptyState
            title="No drafts yet"
            description="Your AI assistant will create content here when reminders run."
          />
        ) : filteredItems.length === 0 ? (
          activeTab === "unread" ? (
            <DeliveriesEmptyState
              title="All caught up"
              description="You've reviewed everything your AI created."
            />
          ) : (
            <DeliveriesEmptyState
              title="Nothing here"
              description="Try another reminder or switch back to all deliveries."
            />
          )
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <DraftListItem
                key={item.id}
                draft={item.draft}
                reminderTitle={item.reminderTitle}
                reminderType={item.reminderType}
                isUnread={item.isUnread}
                onClick={() => {
                  markOpened({ uid: userId, draftId: item.id });
                  setSelectedDelivery(item);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {selectedDelivery && (
        <DraftModal
          draft={selectedDelivery}
          onClose={() => setSelectedDelivery(null)}
        />
      )}
    </>
  );
}
