if(!self.define){let e,s={};const i=(i,n)=>(i=new URL(i+".js",n).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(n,r)=>{const t=e||("document"in self?document.currentScript.src:"")||location.href;if(s[t])return;let l={};const o=e=>i(e,t),u={module:{uri:t},exports:l,require:o};s[t]=Promise.all(n.map((e=>u[e]||o(e)))).then((e=>(r(...e),l)))}}define(["./workbox-1ea6f077"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/browser-DphJ6FDu.js",revision:null},{url:"assets/ClubList-BHo-9fE0.js",revision:null},{url:"assets/CustomerSearch-91yax2Nn.js",revision:null},{url:"assets/GroupList-8IalffFt.js",revision:null},{url:"assets/index-HxzYCIgR.js",revision:null},{url:"assets/index-MRtTkRQp.css",revision:null},{url:"assets/QueryList-CfNXohZy.js",revision:null},{url:"assets/react-vendor-DWJgz7Ui.js",revision:null},{url:"assets/TagList-W2pCEymf.js",revision:null},{url:"assets/ui-vendor-Cpg-DzmZ.js",revision:null},{url:"assets/useDebounce-Q5Dd_TAD.js",revision:null},{url:"index.html",revision:"a2e5863f35b8ccb9c457aa9e3cc106a6"},{url:"registerSW.js",revision:"1872c500de691dce40960bb85481de07"},{url:"manifest.webmanifest",revision:"e30c7ec7cb7349dab4b09ac1ae44ca1e"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html"))),e.registerRoute(/^https:\/\/api\.securecheckout\.com/,new e.NetworkFirst({cacheName:"api-cache",networkTimeoutSeconds:5,plugins:[new e.ExpirationPlugin({maxEntries:50,maxAgeSeconds:3600})]}),"GET")}));
