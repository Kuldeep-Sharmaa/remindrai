import React from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import dotsLoader from "../../../assets/Animation/DotsLoader.json";

export default function DeliveriesEmptyState({ title, description }) {
  return (
    <div className="w-full flex flex-col items-center justify-center text-center py-12">
      <div className="w-62 h-auto deliveries-empty-animation">
        <Player
          autoplay
          loop
          src={dotsLoader}
          style={{ width: "100%", height: "100%" }}
          speed={0.75}
        />
      </div>
      <h3 className="text-base font-semibold text-textLight dark:text-textDark mb-2">
        {title}
      </h3>
      <p className="text-sm text-muted max-w-xs">{description}</p>
    </div>
  );
}
