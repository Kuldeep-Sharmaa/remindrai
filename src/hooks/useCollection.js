// src/hooks/useCollection.js
// - Avoids setState-after-unmount
// - Returns [] for empty documents (easier consumer handling)
// - Accepts an optional transform via options but reads it from a ref
//   so it won't retrigger listeners when its identity changes.

import { useState, useEffect, useRef } from "react";
import { onSnapshot } from "firebase/firestore";

export const useCollection = (q, options = {}) => {
  const { includeMetadataChanges = false, transform = null } = options;

  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(true);

  const mountedRef = useRef(true);
  const unsubscribeRef = useRef(null);
  const transformRef = useRef(transform);

  // keep transformRef up to date but don't include in effect deps
  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (unsubscribeRef.current) {
        try {
          unsubscribeRef.current();
        } catch {
          // noop
        }
        unsubscribeRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // Reset state when query changes
    setIsPending(true);
    setError(null);

    // If no query, set empty results and stop (compatible with previous behaviour)
    if (!q) {
      setDocuments([]);
      setIsPending(false);
      return;
    }

    try {
      const unsubscribe = onSnapshot(
        q,
        { includeMetadataChanges },
        (snapshot) => {
          try {
            const results = snapshot.docs.map((doc) => {
              const raw = { ...doc.data(), id: doc.id };
              if (typeof transformRef.current === "function") {
                try {
                  // allow transform to mutate or return new object
                  return transformRef.current(raw) || raw;
                } catch (txErr) {
                  console.warn(
                    "useCollection: transform function threw:",
                    txErr,
                  );
                  return raw;
                }
              }
              return raw;
            });

            if (mountedRef.current) {
              setDocuments(results);
              setIsPending(false);
              setError(null);
            }
          } catch (processingError) {
            console.error(
              "useCollection: snapshot processing failed:",
              processingError,
            );
            if (mountedRef.current) {
              setError({
                message: "Snapshot processing failed",
                details: processingError.message,
              });
              setIsPending(false);
            }
          }
        },
        (err) => {
          console.error("useCollection: onSnapshot error:", err);
          if (mountedRef.current) {
            setError({
              message: err.message || "Could not fetch the data",
              code: err.code || null,
            });
            setIsPending(false);
          }
        },
      );

      unsubscribeRef.current = unsubscribe;
    } catch (err) {
      console.error(
        "useCollection: failed to attach onSnapshot listener:",
        err,
      );
      if (mountedRef.current) {
        setError({
          message: err.message || "Listener attach failed",
          code: err.code || null,
        });
        setIsPending(false);
      }
      return;
    }

    return () => {
      if (unsubscribeRef.current) {
        try {
          unsubscribeRef.current();
        } catch {
          // ignore
        }
        unsubscribeRef.current = null;
      }
    };
    // Intentionally only depend on 'q' and includeMetadataChanges to avoid reattaching for
  }, [q, includeMetadataChanges]);

  return { documents, isPending, error };
};
