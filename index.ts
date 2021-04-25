import { Logger } from "eazy-logger"
import fs from "fs"
import sass from "sass"

const pkg = JSON.parse(fs.readFileSync(`${__dirname}/package.json`, "utf-8"))

interface EleventyConfig {
  addGlobalData: (name: string, fn: () => void) => void
  addWatchTarget: (name: string) => void
}

interface Options {
  files?: {
    file: string
    alias?: string
    outFile?: string
    outputStyle?: "compressed" | "expanded"
  }[]
}

export const sassPlugin = {
  initArguments: {},
  configFunction: function(eleventyConfig: EleventyConfig, options: Options) {
    const logger = Logger({
      prefix: `[{blue:${pkg.name}}] `,
    })

    ;(options.files || []).forEach(file => {
      eleventyConfig.addGlobalData(
        file.alias,
        function() {
          let css: any
          const start = process.hrtime()

          css = sass.renderSync({
            file: file.file,
            outFile: file.outFile,
            outputStyle: file.outputStyle,
          }).css

          const end = process.hrtime(start)
          const nanoseconds = end[0] * 1e9 + end[1]
          const milliseconds = Math.ceil(nanoseconds / 1e6)

          logger.info(`rendered {green:${file.file}} [{magenta:${milliseconds}ms}]`)

          if (file.outFile) {
            fs.writeFileSync(`./_site/${file.outFile}`, css, "utf-8")
            logger.info(`wrote {green:${file.outFile}}`)
          }

          return css
        }
      )

      eleventyConfig.addWatchTarget("style.scss")
    })
  }
}

