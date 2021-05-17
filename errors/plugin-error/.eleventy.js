const postcss = require("postcss")
const { sassPlugin } = require("../../")

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(sassPlugin, {
    files: [{
      file: "style.scss",
    }],
    plugins: [
      css => postcss(["⛔️ This should be a PostCSS plugin"]).process(css).css,
    ],
    verbose: true,
  })
}
