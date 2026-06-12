import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { View, useColorScheme } from 'react-native';
import { WebView } from 'react-native-webview';
import type { WebViewMessageEvent } from 'react-native-webview';
import { useThemeColors } from '../../../hooks/useThemeColors';
import AppText from '../typography/AppText';

interface Props {
  code: string;
  textColor: string;
}

function buildMermaidHtml(code: string, textColor: string, primaryColor: string, isDark: boolean): string {
  const escaped = JSON.stringify(code.trim());
  const theme = isDark ? 'dark' : 'default';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
*{box-sizing:border-box}
html,body{margin:0;padding:0;background:transparent;overflow:hidden}
body{padding:4px 0}
#diagram{width:100%;display:inline-block}
.mermaid-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;max-width:100%}
.mermaid{display:inline-block;min-width:min-content;color:${textColor}}
</style>
<script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
</head>
<body>
<div class="mermaid-wrap"><div id="diagram" class="mermaid"></div></div>
<script>
(function(){
  var el=document.getElementById('diagram');
  el.textContent=${escaped};

  function report(h){
    if(h===report.last) return;
    report.last=h;
    if(window.ReactNativeWebView) window.ReactNativeWebView.postMessage(String(h));
  }
  report.last=0;

  async function run(){
    try{
      mermaid.initialize({startOnLoad:false,theme:'${theme}',securityLevel:'loose',fontFamily:'-apple-system,BlinkMacSystemFont,sans-serif',themeVariables:{primaryColor:'${primaryColor}'}});
      await mermaid.run({nodes:[el]});
      var wrap=el.parentElement;
      var h=Math.ceil((wrap||el).offsetHeight);
      if(h>8){ report(h); return; }
      if(window.ReactNativeWebView) window.ReactNativeWebView.postMessage('error');
    }catch(e){
      if(window.ReactNativeWebView) window.ReactNativeWebView.postMessage('error');
    }
  }
  run();
})();
</script>
</body>
</html>`;
}

const INITIAL_HEIGHT = 160;

const MermaidChatBlock: React.FC<Props> = ({ code, textColor }) => {
  const theme = useThemeColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [height, setHeight] = useState(INITIAL_HEIGHT);
  const [failed, setFailed] = useState(false);
  const heightRef = useRef(INITIAL_HEIGHT);

  useEffect(() => {
    heightRef.current = INITIAL_HEIGHT;
    setHeight(INITIAL_HEIGHT);
    setFailed(false);
  }, [code]);

  const html = useMemo(
    () => buildMermaidHtml(code, textColor, theme.primary, isDark),
    [code, textColor, theme.primary, isDark],
  );

  const onMessage = useCallback((e: WebViewMessageEvent) => {
    const data = e.nativeEvent.data;
    if (data === 'error') {
      setFailed(true);
      return;
    }
    const h = parseInt(data, 10);
    if (isNaN(h) || h <= 0 || h > 3000) return;
    if (Math.abs(heightRef.current - h) < 4) return;
    heightRef.current = h;
    setHeight(h);
  }, []);

  if (!code.trim()) return null;

  if (failed) {
    return (
      <AppText variant="paragraph" color={textColor} style={{ opacity: 0.7, fontStyle: 'italic', marginVertical: 6 }}>
        Diagrama no disponible
      </AppText>
    );
  }

  return (
    <View style={{ height, width: '100%', overflow: 'hidden', marginVertical: 6 }}>
      <WebView
        source={{ html }}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        onMessage={onMessage}
        javaScriptEnabled
        domStorageEnabled
        style={{ height, width: '100%', backgroundColor: 'transparent' }}
        originWhitelist={['*']}
        nestedScrollEnabled
      />
    </View>
  );
};

export default React.memo(MermaidChatBlock);
