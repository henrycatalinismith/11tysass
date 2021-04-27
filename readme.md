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

11tysass is a Sass plugin for Eleventy that doesn't do very much. If you're
looking for an Eleventy Sass plugin that does lots for you, you should probably
try [`eleventy-plugin-sass`](https://github.com/Sonaryr/eleventy-plugin-sass)
instead.

This plugin passes its options directly to Sass. It only adds a very small
amount of extra glue on top of that to integrate Eleventy and Sass.

One extra thing this plugin does is that it writes your rendered CSS to disk
for you. Sass on its own won't do this, but if you provide an `outFile` value
for your Sass file, the plugin will combine that with your Eleventy output
directory name and put your CSS into your built site.

The other extra thing it does is in the Eleventy dev server. When Sass builds
a file, one of the details it returns in the [result object](https://sass-lang.com/documentation/js-api#result-object)
is a [list of all files imported](https://sass-lang.com/documentation/js-api#result-object)
by the source file. When you run the Eleventy dev server, after this plugin's
first run on startup, it watches all those files. When they change, it
rebuilds the CSS file and reloads the Eleventy server.

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
in the array should be an object of [Sass render options](https://sass-lang.com/documentation/js-api#options).
If an [`outFile`](https://sass-lang.com/documentation/js-api#outfile) value is
given, the plugin will write the rendered CSS to that filename inside the
Eleventy output directory (e.g. `_site/style.css`).

### `verbose`

Pass `verbose: true` to the plugin and it'll output a whole bunch of
information about what it's doing. This is mostly useful for debugging. Please
enable this this option if you're reporting a bug in `11tysass`.

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

## Contributing

<p>
  <a href="https://www.contributor-covenant.org/version/2/0/code_of_conduct/">
    Contributor Covenant v2.0
 </a>
</p>

## License

MIT
