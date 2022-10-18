import { Plugin } from 'vite'
import browserSync from 'browser-sync'

declare type OptionsType = 'snippet' | 'proxy'
interface Options {
  mode?: OptionsType
  bs?: browserSync.Options
}
declare function VitePluginBrowserSync(options?: Options): Plugin

export { Options, VitePluginBrowserSync as default }
