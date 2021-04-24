const { Logger } = require("eazy-logger")
const fs = require("fs")
const sass = require("sass")

const pkg = JSON.parse(fs.readFileSync(`${__dirname}/package.json`, "utf-8"))

module.exports = {
  initArguments: {},
  configFunction: function(eleventyConfig, options) {
    const logger = Logger({
      prefix: `[{blue:${pkg.name}}] `,
    })

    ;(options.files || []).forEach(file => {
      eleventyConfig.addGlobalData(
        file.alias,
        function() {
          let css
          const start = process.hrtime()

          css = sass.renderSync({ file: file.file }).css

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

