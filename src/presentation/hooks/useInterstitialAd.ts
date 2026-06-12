import { useCallback } from "react";
import { Platform } from "react-native";
import { useFocusEffect } from "expo-router";

let InterstitialAd: any = null;
let AdEventType: any = null;
try {
  const adsModule = require("react-native-google-mobile-ads");
  InterstitialAd = adsModule.InterstitialAd;
  AdEventType = adsModule.AdEventType;
} catch {
  // Google Mobile Ads not available in this configuration
}

const AD_UNIT_ID =
  Platform.OS === "ios"
    ? (process.env.EXPO_PUBLIC_AD_UNIT_INTERSTITIAL_IOS ?? "")
    : (process.env.EXPO_PUBLIC_AD_UNIT_INTERSTITIAL_ANDROID ?? "");

let shownThisSession = false;

export const useInterstitialAd = (isPremium: boolean) => {
  useFocusEffect(
    useCallback(() => {
      if (isPremium || !AD_UNIT_ID || shownThisSession || !InterstitialAd || !AdEventType) return;

      let unsub: (() => void) | undefined;

      const ad = InterstitialAd.createForAdRequest(AD_UNIT_ID);

      unsub = ad.addAdEventListener(AdEventType.LOADED, () => {
        ad.show();
        shownThisSession = true;
      });

      ad.load();

      return () => {
        unsub?.();
      };
    }, [isPremium])
  );
};
