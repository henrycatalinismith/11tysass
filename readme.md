# 11tysass

A Sass plugin for Eleventy that's beginner-friendly and production-ready

11tysass is a [Sass] plugin for [Eleventy] that's easy to configure but
flexible enough for production. Most of the code in this plugin is dedicated to
quality assurance and error handling: avoiding bugs, doing the right thing when
something goes wrong, and printing as useful an error message as possible to
help you fix it.

## Features

* Loading CSS via `<link rel="stylesheet" />`
* Inline CSS in `<style>` tags
* Hot reload support for either of the above CSS loading techniques
* Simple config using [plain old Sass options][sass.Options]
* Cache-busting with content hashing
* Customizable post-processing (none by default)
* Multiple Sass entrypoints

## Installation

```
yarn add -D @henrycatalinismith/11tysass sass
```

## Usage

### Eleventy Config

This is the smallest possible production-ready example. It enables
cache-busting to guarantee that your visitors will get your updated CSS as soon
as you deploy it, and it uses Sass's own output compression for minification.

```javascript
const { sassPlugin } = require("@henrycatalinismith/11tysass")

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
<link rel="stylesheet" href="style.scss" />
```

Note that the `href` value here references the Sass entrypoint source file
rather than the CSS output. 11tysass injects the cache-bust URL with the
content hash for you.

If you prefer your CSS inline, add a `<style>` tag with a `data-src` attribute
like this. 11tysass will inject the rendered CSS into the tag and remove the
data attribute for you.

```html
<style data-src="style.scss"></style>
```

## Options

### `files`

The `files` array is a list of Sass files for the plugin to compile. Each item
in the array should be an object of [Sass render options][sass.Options]. The
following two properties are the most important, but you can pass other
Sass options alongside them as well if you have specific Sass configuration
needs.

#### `file`

This value is required. It tells Sass which file to render. It's specific to
your project: it's a name you choose, not 11tysass. Yours might be called
`style.scss`.

#### `outFile`

This tells 11tysass where to save the rendered CSS.
This is project-specific just like [`file`](#file).
You might want to choose `style.css` if you're not sure.

If you're going to load your rendered CSS via a `<style>` tag instead of a
`<link>` tag, you can leave this value out. 11tysass doesn't need to write a
CSS file to your `_site` directory if nothing's going to load it. But if you
want to use a `<link>` tag to load your CSS, then you need to provide an
`outFile` value so that there's a file to load.

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
const { sassPlugin } = require("@henrycatalinismith/11tysass")
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

### `onInjectInline`

This is an advanced feature: skip this if you're just getting started. It's an
optional function you can pass to 11tysass to post-process inline `<style>`
tags on a per-page basis. This is useful if you want to run something like
[PurgeCSS] on them. The function receives two string parameters: the CSS being
injected into the page, and the HTML source code of the page. There's an
[example PurgeCSS setup][onInjectInline] you can check out if you're curious.

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

* [Tips][Contributing]
* [Code of Conduct]

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
[PurgeCSS]: https://purgecss.com
[Autoprefixer]: https://autoprefixer.github.io
[Contributing]: https://codeberg.org/henrycatalinismith/11tysass/src/branch/main/contributing.md
[Code of Conduct]: https://codeberg.org/henrycatalinismith/11tysass/src/branch/main/code_of_conduct.md
[MIT]: https://codeberg.org/henrycatalinismith/11tysass/src/branch/main/license
[onInjectInline]: https://codeberg.org/henrycatalinismith/11tysass/src/branch/main/examples/purgecss/.eleventy.js
