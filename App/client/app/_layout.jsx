import "../global.css";
import { Slot } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { store } from "../redux/store";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <Slot />
      </SafeAreaProvider>
    </Provider>
  );
}
