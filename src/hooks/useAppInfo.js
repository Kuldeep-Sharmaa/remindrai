// src/hooks/useAppInfo.js
import { appConfig } from "../constants/appConfig";

export function useAppInfo() {
  return {
    ...appConfig,
    fullVersion: `${appConfig.version} • built on ${appConfig.buildDate}`,
  };
}
