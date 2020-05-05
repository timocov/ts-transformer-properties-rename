# ts-transformer-properties-rename

[![GH Actions][ci-img]][ci-link]
[![npm version][npm-version-img]][npm-link]
[![Downloads][npm-downloads-img]][npm-link]

A TypeScript custom transformer which renames all properties if they aren't exported from entry point (in any way) and imported from external package.

It might help you better minify your bundles with any existing minifier/uglify tool which supports properties mangling.

This is the next generation of [ts-transformer-minify-privates](https://github.com/timocov/ts-transformer-minify-privates) (which allows you rename the only private class' members),
which uses some approaches from [dts-bundle-generator](https://github.com/timocov/dts-bundle-generator) to detect whether some property is accessible via entry points somehow.

## Caution!!!

Before start using this transformer in the production, I strongly recommend you check that your code compiles successfully and all files has correct output.

I would say **check the whole project file-by-file** and compare the input with the (expected) output.

I cannot guarantee you that the transformer covers all possible cases, but it has tests for the most popular ones, and if you catch a bug - please feel free to create an issue.

Also, it might not work as expected with composite projects, because the project should contain an entry points you set in options, but it might be in other sub-project.

## How it works

For every property the tool tries to understand whether a property is accessible from entry points you specified in the [options](#options).

The property is "accessible from entry point" if the type where this property is declared (including all base classes/interfaces) is directly exported or accessible via entry point
(this approach and algorithms are taken from <https://github.com/timocov/dts-bundle-generator>).

If you use duck typing a lot in your project - the tool **WILL NOT work properly**, especially it can't detect if the property is exported (because it uses the only inheritance tree).

## Options

### entrySourceFiles

*Default: `[]`*

An array of entry source files which will used to detect exported and internal fields.

Basically it should be entry point(s) of the library/project.

### privatePrefix

*Default: `'_private_'`*

The prefix of generated name for private fields. Private fields might be only is the classes.

### internalPrefix

*Default: `'_internal_'`*

The prefix of generated name for "internal" fields. Private fields might be only is the classes.

### publicJSDocTag

*Default: `'public'`*

JSDoc/TypeDoc tag which allows you mark class/interface/property/field/etc as "public" so the tool will not rename it and all its children.

If you'll set it to empty string, the detecting will be disabled.

Example. Let's say we have the following code:

```typescript
const colors: Record<string, string> = {
    red: '#ff0000',
    green: '#00ff00',
};

export function getColor(colorName: string): string | undefined {
    return colors[colorName];
}
```

In this case, you'll get `_internal_red` and `_internal_green` properties, but `red` and `green` is common names for properties and might be passed via your API.

So, you can add `/** @public */` (or any custom tag you set in the options) for `colors` constant and the tool leave all properties without any changes:

```typescript
/** @public */
const colors: Record<string, string> = {
    red: '#ff0000',
    green: '#00ff00',
};

// ...
```

## How to use the custom transformer

Unfortunately, TypeScript itself does not currently provide any easy way to use custom transformers (see <https://github.com/Microsoft/TypeScript/issues/14419>).
The followings are the example usage of the custom transformer.

### webpack (with ts-loader or awesome-typescript-loader)

```js
// webpack.config.js
const propertiesRenameTransformer = require('ts-transformer-properties-rename').default;

module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader', // or 'awesome-typescript-loader'
        options: {
          getCustomTransformers: program => ({
              before: [
                  propertiesRenameTransformer(program)
              ]
          })
        }
      }
    ]
  }
};

```

### Rollup (with rollup-plugin-typescript2)

```js
// rollup.config.js
import typescript from 'rollup-plugin-typescript2';
import propertiesRenameTransformer from 'ts-transformer-properties-rename';

export default {
  // ...
  plugins: [
    typescript({ transformers: [service => ({
      before: [ propertiesRenameTransformer(service.getProgram()) ],
      after: []
    })] })
  ]
};
```

### ttypescript

See [ttypescript's README](https://github.com/cevek/ttypescript/blob/master/README.md) for how to use this with module bundlers such as webpack or Rollup.

*tsconfig.json*:

```json
{
  "compilerOptions": {
    // ...
    "plugins": [
      { "transform": "ts-transformer-properties-rename" }
    ]
  },
  // ...
}
```

## How to minify properties

If you'd like to minify the properties after renaming them, you can use any of existing tool like `uglify-es`/`uglify-js`/`terser`.

For instance, if you use `rollup-plugin-terser` for Rollup, you can add `mangle` options to it:

```javascript
terser({
    // ...
    mangle: {
      properties: {
          regex: /^_(private|internal)_/, // the same prefixes like for custom transformer
      },
    },
})
```

I think other tools has the similar configuration and you can easily find out how to set it up in your environment.

[ci-img]: https://github.com/timocov/ts-transformer-properties-rename/workflows/CI%20Test/badge.svg?branch=master
[ci-link]: https://github.com/timocov/ts-transformer-properties-rename/actions?query=branch%3Amaster

[npm-version-img]: https://badge.fury.io/js/ts-transformer-properties-rename.svg
[npm-downloads-img]: https://img.shields.io/npm/dm/ts-transformer-properties-rename.svg
[npm-link]: https://www.npmjs.com/package/ts-transformer-properties-rename
