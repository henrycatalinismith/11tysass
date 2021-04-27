/// <reference types="chokidar" />
/// <reference types="sass" />

import chokidar from "chokidar"
import { Logger } from "eazy-logger"
import fs from "fs"
import sass from "sass"
import { shimPlugin } from "@hendotcat/11tyshim"
import { name, version } from "./package.json"

interface EleventyConfig {
  addCollection: (name: string, fn: () => any) => void
  addGlobalData: (name: string, fn: () => void) => void
  addPlugin: (plugin: any, options: any) => void
  addWatchTarget: (name: string) => void
}

interface PluginOptions {
  files?: sass.Options[]
  verbose?: boolean
}

export const sassPlugin = {
  initArguments: {},
  configFunction: function(eleventyConfig: EleventyConfig, options: PluginOptions) {
    const logger = Logger({
      prefix: `[{blue:${name}}@{blue:${version}}] `,
    })

    if (!options.verbose) {
      logger.info = () => {}
    }

    let chokidarPaths = []

    function render(file: sass.Options, eleventyInstance: any): sass.Result {
      const result = sass.renderSync(file)
      logger.info(`rendered {green:${result.stats.entry}} [{magenta:${result.stats.duration}ms}]`)
      if (file.outFile) {
        fs.writeFileSync(
          `${eleventyInstance.outputDir}/${file.outFile}`,
          result.css,
        )
      }

      return result
    }

    eleventyConfig.addPlugin(shimPlugin, {
      write: (eleventyInstance: any) => {
        ;(options.files || []).forEach(function(file) {
          const result = render(file, eleventyInstance)
          chokidarPaths = [
            file.file,
            ...result.stats.includedFiles,
          ]
        })
      },

      serve: (eleventyInstance: any) => {
        ;(options.files || []).forEach(function(file) {
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
            render(file, eleventyInstance)
            eleventyInstance.eleventyServe.reload()
          })
        })
      },

      verbose: options.verbose,
    })
  }
}

