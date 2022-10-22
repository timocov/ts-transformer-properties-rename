# ts-transformer-properties-rename

[![GH Actions][ci-img]][ci-link]
[![npm version][npm-version-img]][npm-link]
[![Downloads][npm-downloads-img]][npm-link]

A TypeScript custom transformer which reduces bundle size (with a help of other tools in your bundler - [see below](#how-to-minify-properties)) by renaming properties aren't exposed to the public:

```typescript
function showMessage(opts: { message: string }): void {
    alert(opts.message);
}
export function alertMessage(message: string): void {
    showMessage({ message });
}
```

goes to:

```javascript
function showMessage(opts) {
    alert(opts._internal_message); // `_internal_message` will be like just `s` after terser/uglify
}
function alertMessage(message) {
    showMessage({ _internal_message: message }); // `_internal_message` will be like just `s` after terser/uglify
}
exports.alertMessage = alertMessage;
```

You might find the approach pretty similar to how Google Closure Compiler with enabled advanced optimizations works,
but you don't need to refactor your project a lot to make it works for Google Closure Compiler (setting up [tsickle](https://github.com/angular/tsickle) might be hard as well).

All you need to take all advantages from this tool are:

1. [Install it](#installation)
1. [Setup your compiler to use it](#how-to-use-the-custom-transformer)
1. [Setup the tool you use to minify/uglify to mangle properties](#how-to-minify-properties)

_This is the next generation of [ts-transformer-minify-privates](https://github.com/timocov/ts-transformer-minify-privates) (which allows you rename the only private class' members),_
_which uses some approaches from [dts-bundle-generator](https://github.com/timocov/dts-bundle-generator) to detect whether some property is accessible via entry points somehow._

## How safe renames are

As you might know that you have to pay for everything. The tool was tested on several packages and shows really good results (renames was 100% safe for them), but it doesn't mean that it's 100% safe for your project.

If you rely a lot on duck typing (especially around public level/exports) - it _might_ break your code. But in any way to fix almost all issues I think you can just specify the correct type.

I'd suggest everybody who wants to use it in production 1) run all tests you have 2) if it's possible - look at several (or all of them) compiled files in your project and see whether it's good or not.

I cannot guarantee you that the transformer covers all possible cases, but it has tests for the most popular ones, and if you catch a bug - please feel free to create an issue.

Also, it might not work as expected with composite projects, because the project should contain an entry points you set in [options](#entrysourcefiles), but it might be in other sub-project. So I'd suggest to test it in non-composite project.

## How it works

For every property the tool tries to determine whether a property is accessible from entry points you specified in the [options](#entrysourcefiles).

The property is "accessible from entry point" if the type where this property is declared (including all base classes/interfaces) is directly exported or accessible via entry point
(this approach and algorithms are taken from <https://github.com/timocov/dts-bundle-generator>).

If you rely on duck typing a lot in your project - the tool **MIGHT NOT** and quite possible **WILL NOT** work properly, especially it can't detect if the property is exported (because it uses the only explicit "inheritance/usage tree").

## Example

Let's say we have the following source code in entry point:

```typescript
// yeah, it's especially without the `export` keyword here
interface Options {
    fooBar: number;
}

interface InternalInterface {
    fooBar: number;
}

export function getOptions(fooBar: number): Options {
    const result: Options = { fooBar };
    const internalOptions: InternalInterface = { fooBar };
    console.log(internalOptions.fooBar);
    return result;
}
```

After applying this transformer you'll get the next result:

```javascript
function getOptions(fooBar) {
    var result = { fooBar: fooBar };
    var internalOptions = { _internal_fooBar: fooBar };
    console.log(internalOptions._internal_fooBar);
    return result;
}
exports.getOptions = getOptions;
```

Even if both `Options` and `InternalInterface` have the same property `fooBar`, the only `InternalInterface`'s `fooBar` has been renamed into `_internal_fooBar`.
That's done because this interface isn't exported from the entry point (and even isn't used in exports' types), so it isn't used anywhere outside and could be safely renamed (within all it's properties).

## Example 2

Let's see more tricky example with classes and interfaces. Let's say we have the following code:

```typescript
export interface Interface {
    publicMethod(opts: Options, b: number): void;
    publicProperty: number;
}

export interface Options {
    prop: number;
}

class Class implements Interface {
    public publicProperty: number = 123;

    public publicMethod(opts: Partial<Options>): void {
        console.log(opts.prop, this.publicProperty);
        this.anotherPublicMethod();
    }

    public anotherPublicMethod(): void {}
}

export function interfaceFactory(): Interface {
    return new Class();
}
```

Here we can a class `Class` which implements an interface `Interface` and a factory, which creates a class and returns it as `Interface`.

After processing you'll get the next result:

```javascript
var Class = /** @class */ (function () {
    function Class() {
        this.publicProperty = 123;
    }
    Class.prototype.publicMethod = function (opts) {
        console.log(opts.prop, this.publicProperty);
        this._internal_anotherPublicMethod();
    };
    Class.prototype._internal_anotherPublicMethod = function () { };
    return Class;
}());
function interfaceFactory() {
    return new Class();
}
exports.interfaceFactory = interfaceFactory;
```

Here we have some interesting results:

1. `publicProperty`, declared in `Interface` interface and implemented in `Class` class hasn't been renamed,
    because it's accessible from an object, returned from `interfaceFactory` function.

1. `publicMethod` hasn't been renamed as well the same as `publicProperty`.

1. `prop` from `Options` interface also hasn't been renamed as soon it's part of "public API" of the module.

1. `anotherPublicMethod` (and all calls) has been renamed into `_internal_anotherPublicMethod`,
    because it isn't declared in `Interface` and cannot be accessible from an object, returned from `interfaceFactory` publicly (TypeScript didn't even generate types for that!).

More examples you can see [in test-cases folder](https://github.com/timocov/ts-transformer-properties-rename/tree/master/tests/test-cases/).

## Installation

1. Install the package `npm i -D ts-transformer-properties-rename`
1. Add transformer with [one of possible ways](#how-to-use-the-custom-transformer)

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

### ignoreDecorated

*Default: `false`*

Whether fields that were decorated should be renamed.
A field is treated as "decorated" if itself or any its parent (on type level) has a decorator.

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
                  propertiesRenameTransformer(program, { entrySourceFiles: ['./src/index.ts'] })
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
      before: [ propertiesRenameTransformer(service.getProgram(), { entrySourceFiles: ['./src/index.ts'] }) ],
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
      { "transform": "ts-transformer-properties-rename", "entrySourceFiles": ["./src/index.ts"] }
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
