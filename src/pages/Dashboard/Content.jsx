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

  const draftsQuery = useMemo(() => {
    if (!userId) return null;
    return query(
      collection(db, "users", userId, "drafts"),
      orderBy("createdAt", "desc"),
    );
  }, [userId]);

  const { documents: drafts, isPending, error } = useCollection(draftsQuery);

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted">Loading drafts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-500">Error loading drafts</div>
      </div>
    );
  }

  if (!drafts || drafts.length === 0) {
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
          <h2 className="text-2xl font-grotesk font-semibold text-textLight dark:text-textDark">
            Drafts
          </h2>
          <p className="text-sm text-muted mt-1">
            {drafts.length} {drafts.length === 1 ? "draft" : "drafts"} delivered
          </p>
        </div>

        <div className="space-y-3">
          {drafts.map((draft) => (
            <DraftListItem
              key={draft.id}
              draft={draft}
              onClick={() => {
                markOpened({
                  uid: userId,
                  draftId: draft.id,
                });
                setSelectedDraft(draft);
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
