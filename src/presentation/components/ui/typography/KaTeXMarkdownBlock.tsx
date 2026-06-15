import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import type { WebViewMessageEvent } from 'react-native-webview';
import { renderMarkdownToHtml } from '../../../utils/markdown-html.utils';

interface Props {
  content: string;
  textColor: string;
  primaryColor: string;
  borderColor: string;
  codeBg: string;
  fontSize?: number;
}

function buildHtml(opts: Props): string {
  const { textColor, primaryColor, borderColor, codeBg, fontSize = 14 } = opts;
  const bodyHtml = JSON.stringify(renderMarkdownToHtml(opts.content));

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
<style>
*{box-sizing:border-box}
html,body{margin:0;padding:0;background:transparent;overflow:visible}
body{color:${textColor};font-size:${fontSize}px;line-height:1.6;font-family:-apple-system,BlinkMacSystemFont,sans-serif;word-break:break-word}
#r{width:100%;overflow:visible}
p{margin:0 0 6px}h1,h2,h3,h4{font-weight:700;margin:8px 0 4px;color:${textColor}}
ul,ol{padding-left:20px;margin:0 0 8px}
code{font-family:Menlo,monospace;background:${codeBg};padding:1px 4px;border-radius:3px}
pre{background:${codeBg};padding:10px;border-radius:8px;overflow-x:auto;margin:8px 0}
pre code{background:none;padding:0;white-space:pre}
table{border-collapse:collapse;margin:8px 0;font-size:${fontSize - 1}px;display:block;overflow-x:auto;max-width:100%}
th,td{border:1px solid ${borderColor};padding:6px 8px}
th{background:${codeBg};font-weight:700}
.katex-display{overflow-x:auto;margin:8px 0}
.katex{font-size:1.05em}
a{color:${primaryColor}}
</style>
</head>
<body><div id="r"></div>
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"></script>
<script>
(function(){
  var root=document.getElementById('r');
  root.innerHTML=${bodyHtml};
  function report(){
    var h=Math.ceil(document.body.scrollHeight||root.offsetHeight||0);
    if(h&&window.ReactNativeWebView) window.ReactNativeWebView.postMessage(String(h));
  }
  if(typeof renderMathInElement==='function'){
    renderMathInElement(root,{
      delimiters:[
        {left:'$$',right:'$$',display:true},
        {left:'$',right:'$',display:false},
        {left:'\\\\[',right:'\\\\]',display:true},
        {left:'\\\\(',right:'\\\\)',display:false}
      ],
      throwOnError:false
    });
  }
  report();
  setTimeout(report,120);
  setTimeout(report,400);
  if(typeof ResizeObserver!=='undefined') new ResizeObserver(report).observe(root);
})();
</script>
</body>
</html>`;
}

const KaTeXMarkdownBlock: React.FC<Props> = (props) => {
  const { content, fontSize = 14 } = props;
  const [height, setHeight] = useState(Math.max(80, content.split('\n').length * 22));
  const heightRef = useRef(height);

  const html = useMemo(() => buildHtml({ ...props, fontSize }), [props, fontSize]);

  const onMessage = useCallback((e: WebViewMessageEvent) => {
    const h = parseInt(e.nativeEvent.data, 10);
    if (isNaN(h) || h <= 0 || h > 8000) return;
    if (h < heightRef.current - 2) return;
    if (Math.abs(heightRef.current - h) < 2) return;
    heightRef.current = h;
    setHeight(h);
  }, []);

  return (
    <View style={{ height, width: '100%', alignSelf: 'stretch', overflow: 'hidden' }}>
      <WebView
        source={{ html }}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        onMessage={onMessage}
        javaScriptEnabled
        originWhitelist={['*']}
        nestedScrollEnabled={false}
        setBuiltInZoomControls={false}
        style={{ backgroundColor: 'transparent', height, width: '100%', opacity: 0.99 }}
      />
    </View>
  );
};

export default React.memo(KaTeXMarkdownBlock);
