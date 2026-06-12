import React, { useState, useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import type { WebViewMessageEvent } from 'react-native-webview';

interface Props {
  content: string;
  textColor: string;
  fontSize?: number;
}

const buildHtml = (content: string, textColor: string, fontSize: number): string => {
  const escaped = JSON.stringify(content);
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
<style>
*{box-sizing:border-box}
html,body{margin:0;padding:0;background:transparent}
body{color:${textColor};font-size:${fontSize}px;line-height:1.6;font-family:-apple-system,BlinkMacSystemFont,sans-serif;word-break:break-word}
p{margin:0 0 8px}p:last-child{margin-bottom:0}
h1{font-size:${fontSize + 6}px;font-weight:700;margin:0 0 6px}
h2{font-size:${fontSize + 4}px;font-weight:700;margin:0 0 4px}
h3{font-size:${fontSize + 2}px;font-weight:700;margin:0 0 4px}
ul,ol{padding-left:20px;margin:0 0 8px}li{margin-bottom:2px}
code{font-family:monospace;background:rgba(128,128,128,.18);padding:1px 4px;border-radius:3px;font-size:${fontSize - 1}px}
pre{background:rgba(128,128,128,.18);padding:10px;border-radius:6px;overflow-x:auto;margin:0 0 8px}
pre code{background:none;padding:0}
blockquote{margin:0 0 8px;padding-left:12px;border-left:3px solid rgba(128,128,128,.5);opacity:.8}
.katex-display{overflow-x:auto;margin:8px 0}.katex{font-size:1.05em}
</style>
</head>
<body>
<div id="r"></div>
<script src="https://cdn.jsdelivr.net/npm/marked@15/marked.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"></script>
<script>
var el=document.getElementById('r');
el.innerHTML=marked.parse(${escaped});
renderMathInElement(el,{
  delimiters:[
    {left:'$$',right:'$$',display:true},
    {left:'$',right:'$',display:false},
    {left:'\\\\[',right:'\\\\]',display:true},
    {left:'\\\\(',right:'\\\\)',display:false}
  ],
  throwOnError:false
});
window.ReactNativeWebView.postMessage(String(document.getElementById('r').scrollHeight));
</script>
</body>
</html>`;
};

const MarkdownMathView: React.FC<Props> = ({ content, textColor, fontSize = 14 }) => {
  const [height, setHeight] = useState(40);

  const html = useMemo(
    () => buildHtml(content, textColor, fontSize),
    [content, textColor, fontSize],
  );

  const onMessage = useCallback((e: WebViewMessageEvent) => {
    const h = parseInt(e.nativeEvent.data, 10);
    if (!isNaN(h) && h > 0) setHeight(h);
  }, []);

  return (
    <View style={{ height }}>
      <WebView
        source={{ html }}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        onMessage={onMessage}
        style={{ backgroundColor: 'transparent', height }}
        originWhitelist={['*']}
      />
    </View>
  );
};

export default React.memo(MarkdownMathView);
