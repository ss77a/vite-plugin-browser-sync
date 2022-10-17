// src/index.ts
import browserSync from "browser-sync";
import { bold, lightYellow } from "kolorist";
function VitePluginBrowserSync(options) {
  const name = "vite-plugin-browser-sync";
  const bsClientVersion = "2.27.10";
  let bs;
  let config;
  let mode = (options == null ? void 0 : options.mode) || "proxy";
  const bsOptions = (options == null ? void 0 : options.bs) || {};
  return {
    name,
    apply: "serve",
    configResolved(_config) {
      config = _config;
    },
    configureServer(server) {
      let viteJSLog = false;
      bs = browserSync.create(name);
      if (typeof bsOptions.logLevel === "undefined") {
        bsOptions.logLevel = "silent";
        viteJSLog = true;
      }
      if (typeof bsOptions.open === "undefined") {
        bsOptions.open = typeof config.server.open !== "undefined";
      }
      if (typeof bsOptions.codeSync === "undefined") {
        bsOptions.codeSync = false;
      }
      if (mode === "snippet") {
        bsOptions.logSnippet = false;
        bsOptions.snippet = false;
      }
      if (bsOptions.proxy) {
        mode = "proxy";
      }
      bsOptions.online = bsOptions.online === true || typeof config.server.host !== "undefined" || false;
      const _listen = server.listen;
      server.listen = async () => {
        var _a;
        const out = await _listen();
        if (mode === "proxy") {
          const target = ((_a = server.resolvedUrls) == null ? void 0 : _a.local[0]) || `${config.server.https ? "https" : "http"}://localhost:${config.server.port || 5173}/`;
          if (!bsOptions.proxy) {
            bsOptions.proxy = {
              target,
              ws: true
            };
          } else if (typeof bsOptions.proxy === "string") {
            bsOptions.proxy = {
              target: bsOptions.proxy,
              ws: true
            };
          } else if (typeof bsOptions.proxy === "object" && !bsOptions.proxy.ws) {
            bsOptions.proxy.ws = true;
          }
        }
        await new Promise((resolve) => {
          bs.init(bsOptions, () => {
            resolve(true);
          });
        });
        return out;
      };
      if (viteJSLog) {
        const _print = server.printUrls;
        const colorUrl = (url) => lightYellow(url.replace(/:(\d+)$/, (_, port) => `:${bold(port)}/`));
        server.printUrls = () => {
          const urls = bs.getOption("urls").toJS();
          _print();
          const consoleTexts = mode === "snippet" ? { ui: "UI" } : {
            local: "Local",
            external: "External",
            ui: "UI",
            "ui-external": "UI External"
          };
          for (const key in consoleTexts) {
            if (Object.prototype.hasOwnProperty.call(consoleTexts, key)) {
              const text = consoleTexts[key];
              if (Object.prototype.hasOwnProperty.call(urls, key)) {
                console.log(
                  `  ${lightYellow("\u279C")}  ${bold(
                    "BrowserSync - " + text
                  )}: ${colorUrl(urls[key])}`
                );
              }
            }
          }
        };
      }
      const _close = server.close;
      server.close = async () => {
        bs.exit();
        await _close();
      };
    },
    transformIndexHtml: {
      enforce: "post",
      transform: (html, ctx) => {
        const server = ctx.server;
        if (mode !== "snippet" || !bs.active || !server)
          return html;
        const urls = bs.getOption("urls").toJS();
        const bsScript = {
          tag: "script",
          attrs: {
            async: "",
            src: `${urls.local}/browser-sync/browser-sync-client.js?v=${bsClientVersion}`
          },
          injectTo: "body"
        };
        return [bsScript];
      }
    }
  };
}
export {
  VitePluginBrowserSync as default
};
