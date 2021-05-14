const { sassPlugin } = require("../../")

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(sassPlugin, {
    files: [{
      file: "style.scss",
    }],
    verbose: true,
  })
}
