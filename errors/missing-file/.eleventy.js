const { sassPlugin } = require("../../")

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(sassPlugin, {
    files: [{
      // ⛔️ The file property is missing here
      outFile: "style.css",
    }],
    verbose: true,
  })
}
