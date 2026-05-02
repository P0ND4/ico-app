import appJson from "./src/config/app.json";

export default function AppConfig({ config: currentConfig }: any) {
  return {
    ...currentConfig,
    ...appJson.expo,
  };
}
