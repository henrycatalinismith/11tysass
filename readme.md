<p align="center">
  <img
    alt="11tysass"
    src="https://github.com/hendotcat/11tysass/raw/trunk/11tysass.svg"
    height="64"
  />
</p>

<p align="center">
  <strong>
    Eleventy Sass plugin
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
Eleventy dev server, it watches all the [`includePaths`][includePaths] in your
Sass file, re-renders it when they change, and reloads the dev server.

Other Sass plugins for Eleventy such as
[`eleventy-plugin-sass`][eleventy-plugin-sass] and
[`eleventy-plugin-scss`][eleventy-plugin-scss] focus much of their attention on
adding various CSS post-processors to productionize the rendered CSS output of
your Sass files. What's different about 11tysass is that it leaves those
decisions entirely to you: you set up your own post-processing using the
[`plugins`][#plugins] option.

Instead, 11tysass focuses the majority of its attention on being as robust an
integration between Eleventy and Sass as possible. Instead of introducing its
own config schema, it tries to make as careful use as possible of Eleventy's
and Sass's own options and fill in the gaps itself where necessary. Most of the
code in this plugin is concerned with handling different kinds of errors as
gracefully as possible and printing the most useful error messages possible.

## Installation

```
yarn add -D @hendotcat/11tysass
```

## Usage

```javascript
const { sassPlugin } = require("@hendotcat/11tysass")

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(sassPlugin, {
    files: [{
      file: "style.scss",
      outFile: "style.css",
      outputStyle: "compressed",
    }],
  })
}
```

## Options

### `files`

The `files` array is a list of Sass files for the plugin to compile. Each item
in the array should be an object of [Sass render options](https://sass-lang.com/documentation/js-api#options). The following two properties are required for all files.

<table>
  <thead>
    <tr>
      <th>Property</th>
      <th>Purpose</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <a href="https://sass-lang.com/documentation/js-api#file">
          <code>file</code>
        </a>
      </td>
      <td>
        This tells Sass which file to render.
        Yours might be called <code>style.scss</code>.
      </td>
    </tr>
    <tr>
      <td>
        <a href="https://sass-lang.com/documentation/js-api#outFile">
          <code>outFile</code>
        </a>
      </td>
      <td>
        This tells 11tysass where to save the rendered CSS.
        You might want to choose <code>style.css</code>.
      </td>
    </tr>
  </tbody>
</table>

### `plugins`

The `plugins` array is an optional series of transforms to apply to the
rendered CSS. Rather than bundle an opinionated set of CSS post-processing
tools, 11tysass provides this flexible extension point so that you can choose
your own.

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

## Options

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

### `missing-out-file`

This error code is generated when you pass a file to the plugin without an
`outFile` value specified. Without this value, the plugin can still render
your Sass, but doesn't know where to write the rendered CSS.

Double check your code against the example at the top of this readme. Each
entry in the `files` array should have a line like `outFile: "style.css"`.

### `plugin-error`

This error code is generated when one of your [`plugins`][#plugins] throws an
error while processing your rendered CSS. This errors aren't bugs in 11tysass,
but rather some kind of problem with your CSS post-processing code. If you get
stuck, it's okay to open an issue here anyway and ask for help!

## Contributing

[Contributor Covenant v2.0]

## License

[MIT]

[eleventy-plugin-sass]: https://github.com/Sonaryr/eleventy-plugin-sass
[eleventy-plugin-scss]: https://github.com/jamshop/eleventy-plugin-scss
[sass.Result]: https://sass-lang.com/documentation/js-api#result-object
[includePaths]: https://sass-lang.com/documentation/js-api#includepaths
[Sass]: https://sass-lang.com/
[Eleventy]: https://www.11ty.dev/
[PostCSS]: https://postcss.org
[Contributor Covenant v2.0]: https://www.contributor-covenant.org/version/2/0/code_of_conduct/
[MIT]: https://opensource.org/licenses/MIT
