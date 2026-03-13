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
import Spinner from "../../components/Ui/LoadingSpinner";

export default function Content() {
  const { currentUser } = useAuthContext();
  const userId = currentUser?.uid;

  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedReminderId, setSelectedReminderId] = useState("all");

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

  const remindersQuery = useMemo(() => {
    if (!userId) return null;
    return collection(db, "users", userId, "reminders");
  }, [userId]);

  const { documents: reminders = [] } = useCollection(remindersQuery);

  const interactionsQuery = useMemo(() => {
    if (!userId) return null;
    return collection(db, "users", userId, "draftInteractions");
  }, [userId]);

  const { documents: interactions = [] } = useCollection(interactionsQuery);

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

  const sortedItems = useMemo(() => {
    return [...deliveryItems].sort((a, b) => {
      if (a.isUnread !== b.isUnread) return a.isUnread ? -1 : 1;
      return b.createdAt?.seconds - a.createdAt?.seconds;
    });
  }, [deliveryItems]);

  const filteredItems = useMemo(() => {
    let list = sortedItems;

    if (activeTab === "unread") list = list.filter((i) => i.isUnread);

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

  const executedReminders = useMemo(() => {
    const executedIds = new Set(deliveryItems.map((d) => d.reminderId));
    return reminders.filter((r) => executedIds.has(r.id));
  }, [deliveryItems, reminders]);

  const unreadCount = useMemo(
    () => deliveryItems.filter((d) => d.isUnread).length,
    [deliveryItems],
  );

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-red-500 text-sm">
          Something went wrong. Try refreshing.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 mt-6 sm:mt-10">
          <h1 className="text-3xl sm:text-4xl font-grotesk font-semibold tracking-tight text-textLight dark:text-textDark mb-1">
            Drafts
          </h1>
          <p className="text-sm text-textLight dark:text-textDark ">
            {deliveryItems.length} total
            {unreadCount > 0 && ` · ${unreadCount} unread`}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
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
              className={`px-4 py-2 text-sm rounded-lg whitespace-nowrap font-medium transition-colors duration-150 ${
                activeTab === tab.key
                  ? "bg-brand/10 text-brand"
                  : "text-muted hover:text-textLight dark:hover:text-textDark hover:bg-border/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filter */}
        <div className="mb-5">
          <ReminderDropdown
            reminders={executedReminders}
            selectedId={selectedReminderId}
            onChange={setSelectedReminderId}
          />
        </div>

        {/* List */}
        {deliveryItems.length === 0 ? (
          <DeliveriesEmptyState
            title="No drafts yet"
            description="Your first draft will appear here once a prompt runs."
          />
        ) : filteredItems.length === 0 ? (
          activeTab === "unread" ? (
            <DeliveriesEmptyState
              title="All caught up"
              description="You've reviewed everything that's been prepared."
            />
          ) : (
            <DeliveriesEmptyState
              title="Nothing here"
              description="Try a different filter or switch back to all drafts."
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
