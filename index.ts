/// <reference types="sass" />

import chokidar from "chokidar"
import crypto from "crypto"
import { Logger } from "eazy-logger"
import fs from "fs-extra"
import debounce from "lodash.debounce"
import path from "path"
import sass from "sass"
import { selectAll } from "hast-util-select"
import { shimPlugin } from "@hendotcat/11tyshim"
import { rehypePlugin } from "@hendotcat/11tyhype"
import { name, version, homepage } from "./package.json"

interface EleventyConfig {
  addCollection: (name: string, fn: () => any) => void
  addPlugin: (plugin: any, options: any) => void
}

interface PluginOptions {
  files?: sass.Options[]
  plugins?: ((css: string) => string)[]
  verbose?: boolean
}

export const sassPlugin = {
  initArguments: {},
  configFunction: function(
    eleventyConfig: EleventyConfig,
    options: PluginOptions,
  ) {
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
      process.exit(-1)
    }

    for (const file of options.files) {
      if (!file.file) {
        logger.error("{red:error: missing-file}")
        logger.error("{red:missing `file` property on these Sass options}")
        logger.error("{red:for more details, see:}")
        logger.error(`{red:${homepage}/#missing-file}`)
        process.exit(-1)
      }

      if (file.sourceMap === true && file.outFile) {
        // Sass accepts a boolean true value for this parameter but that's not
        // very useful here. So we convert these to a sensible string value.
        file.sourceMap = `${file.outFile}.map`
      }
    }

    const results: {
      [name: string]: sass.Result
    } = {}

    options.files.forEach(file => {
      results[file.file] = {
        css: Buffer.from(""),
        map: Buffer.from(""),
        stats: {
          entry: "",
          includedFiles: [],
          start: 0,
          end: 0,
          duration: 0,
        }
      }
    })

    function render(
      file: sass.Options,
      eleventyInstance: any
    ): sass.Result | void {
      let result: sass.Result

      try {
        result = sass.renderSync(file)
      } catch (e) {
        logger.error("{red:error sass-error}")
        e.formatted.split(/\n/).forEach((line: string) => {
          logger.error(`{red:${line}}`)
        })
        logger.error("{red:for more details, see:}")
        logger.error(`{red:${homepage}/#sass-error}`)
        return
      }

      results[file.file] = result
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

      results[file.file].css = Buffer.from(css)

      logger.info([
        `rendered {green:${result.stats.entry}}`,
        `[{magenta:${result.stats.duration}ms}]`
      ].join(" "))

      if (file.outFile) {
        const outFileName = file.outFile.replace(
          /\[hash\]/g,
          crypto
            .createHash("md5")
            .update(css)
            .digest("hex")
            .slice(0, 8)
        )
        results[file.file].stats.entry = `/${outFileName}`
        const outFilePath = path.join(
          eleventyInstance.outputDir,
          outFileName,
        )
        fs.ensureDirSync(path.dirname(outFilePath))
        fs.writeFileSync(
          outFilePath,
          css,
        )
        logger.info(`wrote {green:${outFileName}}`)
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

    let writeCount = 0

    eleventyConfig.addPlugin(shimPlugin, {
      write: (eleventyInstance: any) => {
        options.files.forEach(function(file) {
          const result = render(file, eleventyInstance)
          if (!result && writeCount === 0) {
            // The very first Sass render attempt has failed. For one-off
            // builds this is fatal: the site isn't buildable. For dev server
            // builds it's also unrecoverable as it stops us retrieving a list
            // of included files to watch. So for both cases killing the
            // process immediately is the only thing we can do to help the
            // user. Doing so puts the Sass error message right at the end of
            // the Eleventy output where it's most visible.
            process.exit(-1)
          }
          writeCount += 1
        })
      },

      serve: (eleventyInstance: any) => {
        options.files.forEach(function(file) {
          const chokidarPaths = results[file.file].stats.includedFiles
          logger.info(`watching {magenta:${chokidarPaths.length}} files`)
          const watcher = chokidar.watch(
            chokidarPaths,
          )
          watcher.on(
            "change",
            debounce(
              function() {
                eleventyInstance.write()
                eleventyInstance.eleventyServe.reload()
              },
              128,
            )
          )
        })
      },

      verbose: options.verbose,
    })

    eleventyConfig.addPlugin(rehypePlugin, {
      plugins: [
        [() => {
          return function(tree: any) {

            Object.entries(results).forEach(([name, result]) => {
              const selector = [
                "link",
                "[rel='stylesheet']",
                `[href='${name}']`,
              ].join("")
              const matches = selectAll(selector, tree)
              matches.forEach((link: any) => {
                link.properties.href = result.stats.entry
              })
            })

            Object.entries(results).forEach(([name, result]) => {
              const selector = [
                "style",
                `[data-src='${name}']`,
              ].join("")
              const matches = selectAll(selector, tree)
              matches.forEach((style: any) => {
                delete style.properties.dataSrc
                style.children = [{
                  type: "text",
                  value: result.css,
                }]
              })
            })

          }
        }],
      ],

      verbose: options.verbose,
    })
  }
}

