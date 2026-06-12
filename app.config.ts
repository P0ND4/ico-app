import appJson from "./src/config/app.json";

export default function AppConfig({ config: currentConfig }: any) {
  return {
    ...currentConfig,
    ...appJson.expo,
    owner: "lmacml",
    extra: {
      env: process.env.APP_ENV ?? "development",
      eas: {
        projectId: "3ea9a213-425a-4ea5-851a-6ba9eed9ab58",
      },
    },
    plugins: [
      ...(appJson.expo.plugins ?? []),
      "expo-audio",
      ...(process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME
        ? [
            [
              "@react-native-google-signin/google-signin",
              {
                iosUrlScheme: process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME,
              },
            ] as const,
          ]
        : []),
      [
        "react-native-google-mobile-ads",
        {
          androidAppId: process.env.ADMOB_APP_ID_ANDROID ?? "ca-app-pub-3940256099942544~3347511713",
          iosAppId: process.env.ADMOB_APP_ID_IOS ?? "ca-app-pub-3940256099942544~1458002511",
        },
      ],
    ],
  };
}
