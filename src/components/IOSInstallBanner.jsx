import { useEffect, useState } from "react";

const IOSInstallBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    const isSafari =
      /safari/i.test(window.navigator.userAgent) &&
      !/chrome/i.test(window.navigator.userAgent);
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)",
    ).matches;

    const dismissed = localStorage.getItem("ios-install-dismissed");

    if (isIOS && isSafari && !isStandalone && !dismissed) {
      setVisible(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("ios-install-dismissed", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-3 left-3 right-3 z-50 sm:left-auto sm:right-4 sm:max-w-sm">
      <div className="bg-zinc-900 text-textLight dark:text-white/80 rounded-2xl p-4 shadow-xl border border-zinc-800 backdrop-blur">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1">
            <p className="text-sm font-semibold leading-snug">
              Install RemindrAI to receive notifications and quick access
            </p>

            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Tap{" "}
              <span className="inline-flex items-center gap-1 font-medium text-textLight dark:text-white/80e">
                <span className="text-sm">📤</span> Share
              </span>{" "}
              →{" "}
              <span className="font-medium text-textLight dark:text-white/80">
                Add to Home Screen
              </span>
            </p>
          </div>

          <button
            onClick={handleClose}
            className="text-zinc-500 hover:text-white text-sm mt-0.5"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default IOSInstallBanner;
