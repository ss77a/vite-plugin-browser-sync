"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  default: () => VitePluginBrowserSync
});
module.exports = __toCommonJS(src_exports);
var import_browser_sync = __toESM(require("browser-sync"));
var import_kolorist = require("kolorist");
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
      bs = import_browser_sync.default.create(name);
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
        const colorUrl = (url) => (0, import_kolorist.lightYellow)(url.replace(/:(\d+)$/, (_, port) => `:${(0, import_kolorist.bold)(port)}/`));
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
                  `  ${(0, import_kolorist.lightYellow)("\u279C")}  ${(0, import_kolorist.bold)(
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
