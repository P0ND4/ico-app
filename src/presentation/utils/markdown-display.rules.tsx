import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import type { ImageStyle, StyleProp, TextStyle, ViewStyle } from "react-native";
import type { RenderImageFunction, RenderRules } from "react-native-markdown-display";
import { buildImageUriCandidates } from "./markdown-image.utils";

const DEFAULT_ALLOWED_IMAGE_HANDLERS = [
  "data:image/png;base64",
  "data:image/gif;base64",
  "data:image/jpeg;base64",
  "https://",
  "http://",
];

const IMAGE_LOAD_TIMEOUT_MS = 18_000;

const IMAGE_REQUEST_HEADERS = {
  "User-Agent": "IcoApp/1.0 (ico-learning-app)",
  Accept: "image/*",
};

const blockStyles = StyleSheet.create({
  wrapper: {
    width: "100%",
    alignSelf: "stretch",
    marginVertical: 8,
    minHeight: 48,
    justifyContent: "center",
  },
  image: {
    width: "100%",
    flexGrow: 0,
    flexShrink: 0,
  },
  loading: {
    position: "absolute",
    alignSelf: "center",
  },
});

function resolveImageUri(
  src: string,
  allowedImageHandlers: string[],
  defaultImageHandler: string | null,
): string | null {
  const show =
    allowedImageHandlers.filter((value) => src.toLowerCase().startsWith(value.toLowerCase())).length > 0;

  if (!show && defaultImageHandler === null) {
    return null;
  }

  return show ? src : `${defaultImageHandler}${src}`;
}

interface MarkdownImageBlockProps {
  uri: string;
  alt?: string;
  style?: StyleProp<ImageStyle>;
  wrapperStyle?: StyleProp<ViewStyle>;
  fallbackStyle?: StyleProp<TextStyle>;
  indicatorColor?: string;
}

const MarkdownImageBlock: React.FC<MarkdownImageBlockProps> = ({
  uri,
  alt,
  style,
  wrapperStyle,
  fallbackStyle,
  indicatorColor,
}) => {
  const candidates = useMemo(() => buildImageUriCandidates(uri, alt), [uri, alt]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(4 / 3);
  const loadedRef = useRef(false);

  const currentUri = candidates[candidateIndex] ?? uri;

  useEffect(() => {
    setCandidateIndex(0);
    setFailed(false);
    setLoaded(false);
    setAspectRatio(4 / 3);
    loadedRef.current = false;
  }, [uri, alt]);

  useEffect(() => {
    setLoaded(false);
    loadedRef.current = false;

    let cancelled = false;
    const timeout = setTimeout(() => {
      if (!cancelled && !loadedRef.current) {
        if (candidateIndex < candidates.length - 1) {
          setCandidateIndex((i) => i + 1);
        } else {
          setFailed(true);
        }
      }
    }, IMAGE_LOAD_TIMEOUT_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [currentUri, candidateIndex, candidates.length]);

  const handleError = () => {
    if (candidateIndex < candidates.length - 1) {
      setCandidateIndex((i) => i + 1);
      setLoaded(false);
      loadedRef.current = false;
      return;
    }
    setFailed(true);
  };

  if (failed) {
    return (
      <View style={[blockStyles.wrapper, wrapperStyle]}>
        <Text style={fallbackStyle} accessibilityLabel={alt}>
          Imagen no disponible{alt ? `: ${alt}` : ""}
        </Text>
      </View>
    );
  }

  return (
    <View style={[blockStyles.wrapper, wrapperStyle]}>
      {!loaded ? <ActivityIndicator style={blockStyles.loading} color={indicatorColor} /> : null}
      <Image
        key={currentUri}
        source={{ uri: currentUri, headers: IMAGE_REQUEST_HEADERS }}
        style={[blockStyles.image, style, { aspectRatio, opacity: loaded ? 1 : 0 }]}
        resizeMode="contain"
        accessible={!!alt}
        accessibilityLabel={alt}
        onLoad={(e) => {
          loadedRef.current = true;
          setLoaded(true);
          const { width, height } = e.nativeEvent.source;
          if (width > 0 && height > 0) {
            setAspectRatio(width / height);
          }
        }}
        onError={handleError}
      />
    </View>
  );
};

export function createMarkdownImageRule(indicatorColor?: string): RenderImageFunction {
  return (node, _children, _parent, styles, allowedImageHandlers, defaultImageHandler) => {
    const { src, alt } = node.attributes;
    const uri = resolveImageUri(
      src,
      allowedImageHandlers ?? DEFAULT_ALLOWED_IMAGE_HANDLERS,
      defaultImageHandler ?? "https://",
    );

    if (!uri) {
      return null;
    }

    return (
      <MarkdownImageBlock
        key={node.key}
        uri={uri}
        alt={alt}
        style={styles._VIEW_SAFE_image}
        wrapperStyle={styles.image as StyleProp<ViewStyle>}
        fallbackStyle={[styles.text, { opacity: 0.7, fontStyle: "italic" }]}
        indicatorColor={indicatorColor}
      />
    );
  };
}

const fenceScrollStyle = StyleSheet.create({
  scroll: {
    maxWidth: "100%",
    marginVertical: 4,
  },
  line: {
    flexShrink: 0,
  },
});

function CodeFenceBlock({
  nodeKey,
  content,
  fenceStyle,
}: {
  nodeKey: string;
  content: string;
  fenceStyle: object;
}) {
  const lines = content.split("\n");

  return (
    <ScrollView
      key={nodeKey}
      horizontal
      nestedScrollEnabled
      style={fenceScrollStyle.scroll}
      showsHorizontalScrollIndicator
    >
      <View>
        {lines.map((line, lineIndex) => (
          <Text
            key={`${nodeKey}-${lineIndex}`}
            style={[fenceStyle, fenceScrollStyle.line]}
          >
            {line || " "}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
}

export function createMarkdownFenceRule() {
  return (node: { key: string; content: string }, _c: unknown, _p: unknown, mdStyles: { fence: object }) => (
    <CodeFenceBlock nodeKey={node.key} content={node.content} fenceStyle={mdStyles.fence} />
  );
}

export function createMarkdownCodeBlockRule() {
  return (node: { key: string; content: string }, _c: unknown, _p: unknown, mdStyles: { code_block: object }) => (
    <CodeFenceBlock nodeKey={node.key} content={node.content} fenceStyle={mdStyles.code_block} />
  );
}

export function createAiMarkdownRules(
  overrides?: Partial<RenderRules>,
  options?: { indicatorColor?: string },
): RenderRules {
  return {
    fence: createMarkdownFenceRule(),
    code_block: createMarkdownCodeBlockRule(),
    image: createMarkdownImageRule(options?.indicatorColor),
    ...overrides,
  };
}
