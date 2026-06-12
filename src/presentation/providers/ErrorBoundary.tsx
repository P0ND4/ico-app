import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary] Uncaught error:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={s.container}>
          <Text style={s.title}>Algo salió mal</Text>
          <Text style={s.subtitle}>Error de renderizado de React</Text>
          <ScrollView style={s.scroll}>
            <Text style={s.message}>{this.state.error.message}</Text>
            <Text style={s.stack}>{this.state.error.stack}</Text>
          </ScrollView>
          <TouchableOpacity
            style={s.btn}
            onPress={() => this.setState({ error: null })}
          >
            <Text style={s.btnText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a1a2e", padding: 24, paddingTop: 60 },
  title: { color: "#ef4444", fontSize: 20, fontWeight: "700", marginBottom: 4 },
  subtitle: { color: "#94a3b8", fontSize: 13, marginBottom: 16 },
  scroll: { flex: 1, marginBottom: 16 },
  message: { color: "#f1f5f9", fontSize: 14, marginBottom: 12 },
  stack: { color: "#64748b", fontSize: 11, fontFamily: "monospace" },
  btn: { backgroundColor: "#059669", borderRadius: 12, padding: 16, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
