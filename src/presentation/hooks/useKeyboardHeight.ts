import { useEffect, useState } from "react";
import { Keyboard, Platform } from "react-native";

/**
 * How much of the screen the keyboard is currently covering, in points. `0` when closed.
 *
 * This exists because `KeyboardAvoidingView` does not work inside a `pageSheet` modal on
 * iOS. It decides how far to lift by comparing its OWN frame against the keyboard's, both
 * in window coordinates — and a page sheet does not start at the top of the window, so the
 * frame it measures is offset and the padding it computes falls short by exactly that
 * offset. The input ends up behind the keyboard, which is the bug this replaces.
 *
 * Asking the keyboard directly sidesteps the measurement entirely: the height is the same
 * number whether the view is in a sheet, a full-screen modal or a plain screen.
 *
 * `keyboardWillChangeFrame` rather than `keyboardDidShow` on iOS: `will` fires at the start
 * of the system animation, so the layout moves WITH the keyboard instead of snapping after
 * it lands. It also covers the cases `didShow` misses — the height changing when a
 * predictive-text bar appears, or an external keyboard being attached. Android has no
 * `will` events, so it takes `didShow`/`didHide`.
 */
export const useKeyboardHeight = (): number => {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const isIos = Platform.OS === "ios";

    const onShow = Keyboard.addListener(
      isIos ? "keyboardWillChangeFrame" : "keyboardDidShow",
      (event) => setHeight(event.endCoordinates?.height ?? 0),
    );

    const onHide = Keyboard.addListener(isIos ? "keyboardWillHide" : "keyboardDidHide", () =>
      setHeight(0),
    );

    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, []);

  return height;
};

export default useKeyboardHeight;
