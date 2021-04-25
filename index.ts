/// <reference types="chokidar" />
/// <reference types="sass" />

import chokidar from "chokidar"
import { Logger } from "eazy-logger"
import sass from "sass"
import { name, version } from "./package.json"

interface EleventyConfig {
  addCollection: (name: string, fn: () => any) => void
  addGlobalData: (name: string, fn: () => void) => void
  addWatchTarget: (name: string) => void
}

interface PluginOptions {
  files?: sass.Options[]
}

export const sassPlugin = {
  initArguments: {},
  configFunction: function(eleventyConfig: EleventyConfig, options: PluginOptions) {
    const logger = Logger({
      prefix: `[{blue:${name}}@{blue:${version}}] `,
    })

    const collection: { [name: string]: sass.Result } = {}

    eleventyConfig.addCollection("sass", function() {
      return collection
    })

    setImmediate(function() {
      ;(options.files || []).forEach(file => {
        function render(): sass.Result {
          const result = sass.renderSync(file)
          logger.info(`rendered {green:${result.stats.entry}} [{magenta:${result.stats.duration}ms}]`)
          collection[result.stats.entry] = result
          return result
        }

        const result = render()

        if (process.argv.includes("--serve")) {
          eleventyConfig.addWatchTarget(file.file)
          const chokidarPaths = [
            file.file,
            ...result.stats.includedFiles,
          ]
          const chokidarOptions: chokidar.WatchOptions = {
            awaitWriteFinish: {
              stabilityThreshold: 128,
              pollInterval: 128,
            },
            persistent: true,
          }
          logger.info(`watching {magenta:${chokidarPaths.length}} files`)
          const watcher = chokidar.watch(
            chokidarPaths,
            chokidarOptions,
          )
          watcher.on("change", function() {
            render()
          })
        }
      })
    })
  }
}

