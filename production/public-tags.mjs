const measurementId='G-5B0DJHJJZL';
const verification='kE3t7EqALqAxPevhkc9wD9mb7z4QY5Y6y8ojZlZJ8wE';
export function addPublicGoogleTags(html){
 if(!/<\/head>/i.test(html))return html;
 const tags=[];
 if(!html.includes(`content="${verification}"`))tags.push(`<meta name="google-site-verification" content="${verification}" />`);
 if(!html.includes(`gtag('config', '${measurementId}')`))tags.push(`<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${measurementId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${measurementId}');
</script>`);
 if(!html.includes('"z9t3ifab1n"'))tags.push(`<!-- Microsoft Clarity -->
<script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "z9t3ifab1n");
</script>`);
 if(!tags.length)return html;
 return html.replace(/<\/head>/i,tags.join('\n')+'\n</head>');
}
