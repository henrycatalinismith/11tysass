<p align="center">
  <img
    alt="11tysass"
    src="https://github.com/hendotcat/11tysass/raw/trunk/11tysass.svg"
    height="64"
  />
</p>

<p align="center">
  <strong>
    A Sass plugin for Eleventy that's beginner-friendly and production-ready
  </strong>
</p>

<p align="center">
  <img
    src="https://github.com/hendotcat/11tysass/actions/workflows/publish.yml/badge.svg"
    alt="Build status"
  />
</p>

11tysass is a [Sass] plugin for [Eleventy]. At the start of an Eleventy build,
it renders your Sass files and writes the CSS to your `_site` directory. In the
Eleventy dev server, it watches your Sass file and all its
[`includedFiles`][includedFiles], re-renders your CSS when any of them change,
and reloads the dev server.

Other Sass plugins for Eleventy such as
[`eleventy-plugin-sass`][eleventy-plugin-sass] and
[`eleventy-plugin-scss`][eleventy-plugin-scss] focus much of their attention on
adding various CSS post-processors to productionize the rendered CSS output of
your Sass files. What's different about 11tysass is that it leaves those
decisions entirely to you. Post-processing needs vary a lot from project to
project, so 11tysass lets you set up your own post-processing using the
[`plugins`](#plugins) option, or not set up any at all if Sass is all you need.

Instead, 11tysass focuses the majority of its attention on being as robust an
integration between Eleventy and Sass as possible. Instead of introducing its
own config schema, it tries to make as careful use as possible of Eleventy's
and Sass's own data structures and fill in the gaps itself where necessary.
Most of the code in this plugin is concerned with handling different kinds of
errors as gracefully as possible and printing the most useful error messages
possible.

## Installation

```
yarn add -D @hendotcat/11tysass
```

## Usage

### Eleventy Config

```javascript
const { sassPlugin } = require("@hendotcat/11tysass")

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(sassPlugin, {
    files: [{
      file: "style.scss",
      outFile: "style.[hash].css",
      outputStyle: "compressed",
    }],
  })
}
```

### Template Code

```html
<link
  rel="stylesheet"
  href="{{ collections["11tysass"]["style.scss"].stats.entry }}"
/>
```

Or if you prefer your CSS inline:

```html
<style>
  {{ collections["11tysass"]["style.scss"].css | safe }}
</style>
```

## Options

### `files`

The `files` array is a list of Sass files for the plugin to compile. Each item
in the array should be an object of [Sass render options][sass.Options]. The
following two properties are required for all files, but you can pass other
Sass options alongside them as well if you have specific Sass configuration
needs. 

#### `file`

This tells Sass which file to render. It's specific to your project: it's a name you choose, not 11tysass. Yours might be called `style.scss`.

#### `outFile`

This tells 11tysass where to save the rendered CSS.
This is project-specific just like [`file`](#file).
You might want to choose `style.css` if you're not sure.

If you need a content hash in this filename for cache-busting purposes,
11tysass supports that. The usage example at the top of the readme shows an
`outFile` using this feature. A value such as `style.[hash].css` gets the
`[hash]` part replaced with an MD5 checksum of the rendered CSS.

### `plugins`

The `plugins` array is an optional series of transforms to apply to the
rendered CSS. Rather than bundle an opinionated set of CSS post-processing
tools, 11tysass provides this flexible extension point so that you can choose
your own.

Each item in the array should be a function that accepts a CSS string and
returns another CSS string. Here's an example using [PostCSS] and
[Autoprefixer] to post-process the rendered CSS output from Sass.

```javascript
const { sassPlugin } = require("@hendotcat/11tysass")
const autoprefixer = require("autoprefixer")
const postcss = require("postcss")

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(sassPlugin, {
    files: [{
      file: "style.scss",
      outFile: "style.css",
      outputStyle: "compressed",
    }],
    plugins: [
      css => postcss([autoprefixer]).process(css).css,
    ],
  })
}
```

### `verbose`

Pass `verbose: true` to the plugin and it'll output a whole bunch of
information about what it's doing. This is mostly useful for debugging. Please
enable this this option if you're reporting a bug in 11tysass.

## Error Codes

11tysass will try to help you set it up properly. If you make a mistake,
it'll try to help you understand. For some mistakes that it can recognize,
it'll print a link in the build output pointing at one of these error codes to
help you troubleshoot.

### `nothing-to-render`

This error code is generated when you add the plugin to Eleventy without giving
it any Sass files to render.

Double check your code against the example at the top of this readme. The
second argument you pass to `eleventyConfig.addPlugin` should be an object with
a property called `files`.

### `missing-file`

This error code is generated when you pass a file to the plugin without a
`file` value specified. Without this value, the plugin doesn't know which Sass
file you want it to render for you.

Double check your code against the example at the top of this readme. Each
entry in the `files` array should have a line like `file: "style.scss"`.

### `plugin-error`

This error code is generated when one of your [`plugins`](#plugins) throws an
error while processing your rendered CSS. These errors aren't bugs in 11tysass,
but rather some kind of problem with your CSS post-processing code. If you get
stuck, it's okay to open an issue here anyway and ask for help!

### `sass-error`

This error code is generated when Sass throws an error while trying to render
your CSS. These errors aren't bugs in 11tysass: they mean you have a mistake in
your own Sass code. Try to use the error messages from Sass to fix them.

## Contributing

[Contributor Covenant v2.0]

## License

[MIT]

[eleventy-plugin-sass]: https://github.com/Sonaryr/eleventy-plugin-sass
[eleventy-plugin-scss]: https://github.com/jamshop/eleventy-plugin-scss
[sass.Options]: https://sass-lang.com/documentation/js-api#options
[sass.Result]: https://sass-lang.com/documentation/js-api#result-object
[includedFiles]: https://sass-lang.com/documentation/js-api#result-stats-includedfiles
[Sass]: https://sass-lang.com/
[Eleventy]: https://www.11ty.dev/
[PostCSS]: https://postcss.org
[Autoprefixer]: https://autoprefixer.github.io
[Contributor Covenant v2.0]: https://www.contributor-covenant.org/version/2/0/code_of_conduct/
[MIT]: https://opensource.org/licenses/MIT
