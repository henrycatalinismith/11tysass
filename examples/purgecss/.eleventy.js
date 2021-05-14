const { PurgeCSS } = require("purgecss")
const { sassPlugin } = require("../../")

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(sassPlugin, {
    files: [{
      file: "global.scss",
      outFile: "global.[hash].css",
    }, {
      file: "page-one.scss",
    }, {
      file: "page-two.scss",
    }],
    onInjectInline: async (css, html) => {
      const result = await new PurgeCSS().purge({
        content: [{
          extension: "html",
          raw: html,
        }],
        css: [{
          raw: css,
        }],
      })
      return result[0].css
    },
    verbose: true,
  })
}
