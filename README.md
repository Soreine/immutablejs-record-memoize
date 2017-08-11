# immutablejs-record-memoize

Memoize methods or properties of any `ImmutableJS.Record`. Also works on any immutable object prototype.

## Install

```
yarn add immutablejs-record-memoize
```

## Usage

With `ImmutableJS.Record`:

```js
import memoize from 'immutablejs-record-memoize';

class ExampleRecord extends Record({}) {
    noArguments() {
        // ...
    },

    withArguments(a, b, c) {
        // ...
    }
}

// Memoize methods with no arguments
memoize(ExampleRecord.prototype, ['noArguments'], { takesArguments: false });

// Memoize methods that have arguments
memoize(ExampleObject.prototype, ['withArguments'], { takesArguments: true });

// Use ExampleRecord as usual
```

For other object's prototypes:

```js
import memoize from 'immutablejs-record-memoize';

function ExampleObject() {
    constructor() {
        // ...
    }
}

ExampleObject.prototype = {
    noArguments() {
        // ...
    },

    withArguments(a, b, c) {
        // ...
    }
};

// Memoize methods with no arguments
memoize(ExampleObject.prototype, ['noArguments'], { takesArguments: false });

// Memoize methods that have arguments
memoize(ExampleObject.prototype, ['withArguments'], { takesArguments: true });

// Use ExampleObject as usual
```

## Reference

### `memoize`

Memoize the given properties of the given prototype object. The prototype is mutated.

Arguments:

- `prototype: Object`
  The object prototype that should have its properties memoized.
- `properties: string[]`
  The list of properties names that should be memoized
- `options.takesArguments?: boolean`
  True if the methods in `properties` take arguments. This result in slower memoization for them.

Returns: `void`


## Credits

Implementation is taken from Slate.
https://github.com/ianstormtaylor/slate/blob/master/src/utils/memoize.js
