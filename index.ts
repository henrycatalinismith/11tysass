/// <reference types="chokidar" />
/// <reference types="sass" />

import chokidar from "chokidar"
import { Logger } from "eazy-logger"
import fs from "fs"
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

function monkeypatch(cls: any, fn: any): any {
  const orig = cls.prototype[fn.name].__original || cls.prototype[fn.name];
  function wrapped() {
    return fn.bind(this, orig).apply(this, arguments);
  }
  wrapped.__original = orig;
  cls.prototype[fn.name] = wrapped;
}

export const sassPlugin = {
  initArguments: {},
  configFunction: function(eleventyConfig: EleventyConfig, options: PluginOptions) {
    const logger = Logger({
      prefix: `[{blue:${name}}@{blue:${version}}] `,
    })

    setImmediate(function() {
      const Eleventy = require(process.cwd() + '/node_modules/@11ty/eleventy/src/Eleventy.js')
      monkeypatch(Eleventy, function serve(original, port) {
        const eleventyInstance = this
        ;(options.files || []).forEach(function(file) {
          function render(): sass.Result {
            const result = sass.renderSync(file)
            logger.info(`rendered {green:${result.stats.entry}} [{magenta:${result.stats.duration}ms}]`)
            if (file.outFile) {
              fs.writeFileSync(
                `${eleventyInstance.outputDir}/${file.outFile}`,
                result.css,
              )
            }
            eleventyInstance.eleventyServe.reload()
            return result
          }

          const result = render()

          if (process.argv.includes("--serve")) {
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
        return original.apply(this, [port])
      })
    })
  }
}

