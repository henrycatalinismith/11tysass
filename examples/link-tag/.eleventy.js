const { sassPlugin } = require("../../")

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(sassPlugin, {
    files: [{
      file: "style.scss",
      outFile: "style.[hash].css",
    }],
    verbose: true,
  })
}
