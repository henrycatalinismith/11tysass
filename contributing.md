Contributing to 11tysass
========================

It would be really cool to get some pull requests on this project so here are a
few quick tips to help you contribute.

## Testing

The `publish` workflow runs a couple of automated checks to avoid shipping bugs
so you'll probably want to run these yourself locally before pushing.

### `yarn tsc`

This command runs the TypeScript compiler to check for type errors and build
the JavaScript file for distribution.

### `make test`

This command rebuilds all the [example projects][examples]. It fails if any of
them have any changes to their `_site` directory after building.

This is intended to catch any unintended changes in behavior. If you're doing
something that actually needs to change existing behavior then you can run
`yarn eleventy` in any of the examples that need updating and commit those
changes to avoid these errors.

[examples]: https://github.com/henrycatalinismith/11tysass/tree/trunk/examples
