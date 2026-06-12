import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { View, useColorScheme } from 'react-native';
import { WebView } from 'react-native-webview';
import type { WebViewMessageEvent } from 'react-native-webview';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { preprocessMarkdownImageUrls } from '../../../utils/markdown-image.utils';

export interface AiMarkdownViewProps {
  content: string;
  fontSize?: number;
  /** Smaller padding/margins for chat bubbles */
  compact?: boolean;
  /** Override text color (e.g. bubble on primaryLight) */
  textColor?: string;
  /** Transparent by default — bubble/surface shows through */
  backgroundColor?: string;
  /**
   * WebView scrolls inside a flex container (lesson reading).
   * Default: auto-height for chat bubbles.
   */
  scrollable?: boolean;
  /**
   * Let a parent ScrollView handle vertical scroll (e.g. Summary screen).
   * Ignored when scrollable is true.
   */
  passThroughScroll?: boolean;
}

interface HtmlOptions {
  content: string;
  textColor: string;
  primaryColor: string;
  borderColor: string;
  codeBg: string;
  fontSize: number;
  compact: boolean;
  isDark: boolean;
  includeMermaid: boolean;
  scrollable: boolean;
}

function estimateMarkdownHeight(content: string, fontSize: number, compact: boolean): number {
  const lineHeight = compact ? 20 : Math.round(fontSize * 1.55);
  const lines = content.split('\n').length;
  const mermaidBlocks = (content.match(/```mermaid/gi) ?? []).length;
  const tables = (content.match(/^\|.+\|$/gm) ?? []).length;
  const images = (content.match(/!\[/g) ?? []).length;
  const extra = mermaidBlocks * 180 + tables * 36 + images * 120;
  return Math.min(6000, Math.max(120, lines * lineHeight + extra + 24));
}

function buildHtml(opts: HtmlOptions): string {
  const { content, textColor, primaryColor, borderColor, codeBg, fontSize, compact, isDark, includeMermaid, scrollable } = opts;
  const escaped = JSON.stringify(content);
  const mermaidTheme = isDark ? 'dark' : 'default';
  const pad = compact ? 0 : 2;
  const pageOverflow = scrollable
    ? 'height:auto;min-height:100%;overflow-y:auto;-webkit-overflow-scrolling:touch'
    : 'height:auto;min-height:0;overflow:hidden';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
<style>
*{box-sizing:border-box}
html,body{margin:0;padding:0;background:transparent;${pageOverflow}}
body{color:${textColor};font-size:${fontSize}px;line-height:1.6;font-family:-apple-system,BlinkMacSystemFont,sans-serif;word-break:break-word;padding:${pad}px}
#r{width:100%;display:inline-block;vertical-align:top}
p{margin:0 0 ${compact ? 6 : 8}px}p:last-child{margin-bottom:0}
h1{font-size:${fontSize + 6}px;font-weight:700;margin:0 0 6px;color:${textColor}}
h2{font-size:${fontSize + 4}px;font-weight:700;margin:0 0 4px;color:${textColor}}
h3{font-size:${fontSize + 2}px;font-weight:700;margin:0 0 4px;color:${textColor}}
ul,ol{padding-left:20px;margin:0 0 8px}li{margin-bottom:2px;color:${textColor}}
strong{font-weight:700;color:${textColor}}
em{font-style:italic;color:${textColor}}
code{font-family:Menlo,Monaco,Consolas,monospace;background:${codeBg};padding:1px 4px;border-radius:3px;font-size:${fontSize - 1}px;color:${textColor}}
pre{background:${codeBg};padding:10px 12px;border-radius:8px;margin:8px 0;overflow-x:auto;-webkit-overflow-scrolling:touch;max-width:100%}
pre code{background:none;padding:0;white-space:pre;font-size:${Math.max(fontSize - 2, 11)}px}
blockquote{margin:8px 0;padding:4px 0 4px 12px;border-left:3px solid ${primaryColor};opacity:.9;color:${textColor}}
table{border-collapse:collapse;width:100%;margin:10px 0;font-size:${fontSize - 1}px;display:block;overflow-x:auto;-webkit-overflow-scrolling:touch;max-width:100%}
th,td{border:1px solid ${borderColor};padding:6px 10px;text-align:left;vertical-align:top;color:${textColor}}
th{background:${codeBg};font-weight:700}
.mermaid-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;max-width:100%;margin:10px 0}
.mermaid{display:inline-block;min-width:min-content}
.katex-display{overflow-x:auto;margin:8px 0;-webkit-overflow-scrolling:touch}
.katex{font-size:1.05em}
a{color:${primaryColor}}
img{max-width:100%;height:auto;border-radius:8px;margin:8px 0;display:block}
.img-fallback{display:block;margin:8px 0;font-style:italic;opacity:.7;color:${textColor}}
hr{border:none;border-top:1px solid ${borderColor};margin:12px 0}
</style>
</head>
<body>
<div id="r"></div>
<script src="https://cdn.jsdelivr.net/npm/marked@15/marked.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"></script>
${includeMermaid ? '<script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>' : ''}
<script>
(function(){
  var root=document.getElementById('r');
  var raw=${escaped};

  marked.setOptions({gfm:true,breaks:true});

  function transformMermaid(container){
    container.querySelectorAll('pre code.language-mermaid').forEach(function(code){
      var pre=code.parentElement;
      var wrap=document.createElement('div');
      wrap.className='mermaid-wrap';
      var div=document.createElement('div');
      div.className='mermaid';
      div.textContent=code.textContent||'';
      wrap.appendChild(div);
      if(pre) pre.replaceWith(wrap);
    });
  }

  function setupImageFallbacks(container){
    container.querySelectorAll('img').forEach(function(img){
      img.onerror=function(){
        var fallback=document.createElement('span');
        fallback.className='img-fallback';
        fallback.textContent=img.alt||'Imagen no disponible';
        img.replaceWith(fallback);
        scheduleReports();
      };
      img.onload=function(){
        scheduleReports();
      };
    });
  }

  function measureHeight(){
    return Math.ceil(root.offsetHeight);
  }

  function reportHeight(){
    var h=measureHeight();
    if(!h||h===reportHeight.last) return;
    reportHeight.last=h;
    if(window.ReactNativeWebView) window.ReactNativeWebView.postMessage(String(h));
  }
  reportHeight.last=0;

  function scheduleReports(){
    reportHeight();
    setTimeout(reportHeight,150);
    setTimeout(reportHeight,500);
    setTimeout(reportHeight,1200);
  }

  async function render(){
    try{
      root.innerHTML=marked.parse(raw);
      transformMermaid(root);
      setupImageFallbacks(root);
      renderMathInElement(root,{
        delimiters:[
          {left:'$$',right:'$$',display:true},
          {left:'$',right:'$',display:false},
          {left:'\\\\[',right:'\\\\]',display:true},
          {left:'\\\\(',right:'\\\\)',display:false}
        ],
        throwOnError:false
      });
      scheduleReports();
      var nodes=root.querySelectorAll('.mermaid');
      if(${includeMermaid}&&nodes.length&&typeof mermaid!=='undefined'){
        mermaid.initialize({startOnLoad:false,theme:'${mermaidTheme}',securityLevel:'loose',fontFamily:'-apple-system,BlinkMacSystemFont,sans-serif'});
        await mermaid.run({nodes:nodes});
        scheduleReports();
      }
    }catch(e){
      root.textContent=raw;
      scheduleReports();
    }
  }

  render();
})();
</script>
</body>
</html>`;
}

const AiMarkdownView: React.FC<AiMarkdownViewProps> = ({
  content,
  fontSize = 14,
  compact = false,
  textColor: textColorProp,
  backgroundColor = 'transparent',
  scrollable = false,
  passThroughScroll = false,
}) => {
  const theme = useThemeColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const initialHeight = useMemo(
    () => estimateMarkdownHeight(content, fontSize, compact),
    [content, fontSize, compact],
  );
  const [height, setHeight] = useState(initialHeight);
  const heightRef = useRef(initialHeight);
  const heightUpdatesRef = useRef(0);
  const MAX_HEIGHT = 6000;

  const textColor = textColorProp ?? theme.textPrimary;
  const codeBg = isDark ? 'rgba(255,255,255,0.08)' : `${theme.primary}18`;
  const includeMermaid = content.includes('```mermaid');

  useEffect(() => {
    heightRef.current = initialHeight;
    heightUpdatesRef.current = 0;
    setHeight(initialHeight);
  }, [content, initialHeight]);

  const html = useMemo(
    () =>
      buildHtml({
        content: preprocessMarkdownImageUrls(content),
        textColor,
        primaryColor: theme.primary,
        borderColor: theme.border,
        codeBg,
        fontSize,
        compact,
        isDark,
        includeMermaid,
        scrollable,
      }),
    [content, textColor, theme.primary, theme.border, codeBg, fontSize, compact, isDark, includeMermaid, scrollable],
  );

  const onMessage = useCallback((e: WebViewMessageEvent) => {
    if (scrollable) return;
    if (heightUpdatesRef.current >= 8) return;
    const h = parseInt(e.nativeEvent.data, 10);
    if (isNaN(h) || h <= 0 || h > MAX_HEIGHT) return;
    if (Math.abs(heightRef.current - h) < 2) return;
    heightRef.current = h;
    heightUpdatesRef.current += 1;
    setHeight(h);
  }, [scrollable]);

  if (!content?.trim()) return null;

  if (scrollable) {
    return (
      <View style={{ flex: 1, minHeight: 0, width: '100%' }}>
        <WebView
          source={{ html }}
          scrollEnabled
          showsVerticalScrollIndicator
          showsHorizontalScrollIndicator={false}
          style={{ flex: 1, backgroundColor }}
          originWhitelist={['*']}
          nestedScrollEnabled
        />
      </View>
    );
  }

  const webViewPointerEvents = passThroughScroll ? 'none' : 'auto';

  return (
    <View style={{ height, width: '100%', overflow: 'hidden' }} pointerEvents="box-none">
      <WebView
        source={{ html }}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        onMessage={onMessage}
        pointerEvents={webViewPointerEvents}
        nestedScrollEnabled={!passThroughScroll}
        overScrollMode={passThroughScroll ? 'never' : 'auto'}
        bounces={false}
        javaScriptEnabled
        domStorageEnabled
        style={{ backgroundColor, height, width: '100%' }}
        originWhitelist={['*']}
      />
    </View>
  );
};

export default React.memo(AiMarkdownView);
