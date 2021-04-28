/// <reference types="chokidar" />
/// <reference types="sass" />

import chokidar from "chokidar"
import { Logger } from "eazy-logger"
import fs from "fs-extra"
import path from "path"
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
  plugins?: ((css: string) => string)[]
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

      if (file.sourceMap === true) {
        // Sass accepts a boolean true value for this parameter but that's not
        // very useful here. So we convert these to a sensible string value.
        file.sourceMap = `${file.outFile}.map`
      }
    }

    let chokidarPaths = []

    function render(
      file: sass.Options,
      eleventyInstance: any
    ): sass.Result | void {
      let result: sass.Result

      try {
        result = sass.renderSync(file)
      } catch (e) {
        logger.error("{red:Sass error}")
        e.formatted.split(/\n/).forEach((line: string) => {
          logger.error(`{red:${line}}`)
        })
        return
      }

      let css = result.css.toString()

      ;(options.plugins || []).forEach(function(plugin) {
        try {
          css = plugin(css)
        } catch(e) {
          logger.error("{red:error: plugin-error}")
          e.stack.split(/\n/).forEach((line: string) => {
            logger.error(`{red:${line}}`)
          })
          logger.error("{red:for more details, see:}")
          logger.error(`{red:${homepage}/#plugin-error}`)
        }
      })

      logger.info([
        `rendered {green:${result.stats.entry}}`,
        `[{magenta:${result.stats.duration}ms}]`
      ].join())

      if (file.outFile) {
        const outFile = path.join(
          eleventyInstance.outputDir,
          file.outFile,
        )
        fs.ensureDirSync(path.dirname(outFile))
        fs.writeFileSync(
          outFile,
          css,
        )
        logger.info(`wrote {green:${file.outFile}}`)
      }

      if (file.sourceMap) {
        const sourceMap = path.join(
          eleventyInstance.outputDir,
          file.sourceMap as string,
        )
        fs.writeFileSync(
          sourceMap,
          result.map.toString(),
        )
        logger.info(`wrote {green:${file.sourceMap}}`)
      }

      return result
    }

    eleventyConfig.addPlugin(shimPlugin, {
      write: (eleventyInstance: any) => {
        ;(options.files || []).forEach(function(file) {
          const result = render(file, eleventyInstance)
          if (!result) {
            // The very first Sass render attempt has failed. For one-off
            // builds this is fatal: the site isn't buildable. For dev server
            // builds it's also unrecoverable as it stops us retrieving a list
            // of included files to watch. So for both cases killing the
            // process immediately is the only thing we can do to help the
            // user. Doing so puts the Sass error message right at the end of
            // the Eleventy output where it's most visible.
            process.exit(-1)
          }
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

