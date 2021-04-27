/// <reference types="chokidar" />
/// <reference types="sass" />

import chokidar from "chokidar"
import { Logger } from "eazy-logger"
import fs from "fs"
import sass from "sass"
import { shimPlugin } from "@hendotcat/11tyshim"
import { name, version, homepage } from "./package.json"

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

    if (!options || !options.files) {
      logger.error("{red:error: nothing-to-render}")
      logger.error("{red:missing a list of Sass files to render}")
      logger.error("{red:for more details, see:}")
      logger.error(`{red:${homepage}/#nothing-to-render}`)
      return
    }

    for (const file of options.files) {
      if (!file.file) {
        logger.error("{red:error: missing-file}")
        logger.error("{red:missing `file` property on these Sass options}")
        logger.error("{red:for more details, see:}")
        logger.error(`{red:${homepage}/#missing-file}`)
        return
      }

      if (!file.outFile) {
        logger.error("{red:error: missing-out-file}")
        logger.error("{red:missing `outFile` property on these Sass options}")
        logger.error("{red:for more details, see:}")
        logger.error(`{red:${homepage}/#missing-out-file}`)
        return
      }
    }

    let chokidarPaths = []

    function render(
      file: sass.Options,
      eleventyInstance: any
    ): sass.Result {
      const result = sass.renderSync(file)

      logger.info([
        `rendered {green:${result.stats.entry}}`,
        `[{magenta:${result.stats.duration}ms}]`
      ].join())

      if (file.outFile) {
        logger.info(`wrote {green:${file.outFile}}`)
        fs.writeFileSync(
          `${eleventyInstance.outputDir}/${file.outFile}`,
          result.css,
        )
      }

      if (file.sourceMap) {
        logger.info(`wrote {green:${file.sourceMap}}`)
        fs.writeFileSync(
          `${eleventyInstance.outputDir}/${file.sourceMap}`,
          result.map.toString(),
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

