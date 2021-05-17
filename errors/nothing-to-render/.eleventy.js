const { sassPlugin } = require("../../")

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(sassPlugin, {
    // ⛔️ There should be an array of files here but it's missing.
    verbose: true,
  })
}
