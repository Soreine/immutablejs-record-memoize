/* @flow */

/*
 * GLOBAL: True if memoization should is enabled.	 * GLOBAL: True if memoization should is enabled.
 */
let ENABLED = true;

/*
 * The node of a cache tree for a WeakMap to store cache visited by objects
 */
const STORE_KEY: any = Symbol('STORE_KEY');

/*
 * The leaf node of a cache tree. Used to support variable argument length. A
 * unique object, so that native Maps will key it by reference.
 */
const LEAF: any = Symbol('LEAF');

/*
 * A value to represent a memoized undefined value. Allows efficient value
 * retrieval using Map.get only.
 */
const UNDEFINED: any = Symbol('undefined');
const NULL: any = Symbol('null');

/*
 * Default value for unset keys in native Maps
 */
const UNSET = undefined;

/*
 * Global Store for all cached values
 */
let memoizeStore = new WeakMap();

/*
 * Memoize all of the `properties` on an `object`.
 */
function memoize(
    // The object prototype that should have its properties memoized.
    object: Object,
    // The list of properties names that should be memoized
    properties: string[]
) {
    for (const property of properties) {
        const original = object[property];

        if (!original) {
            throw new Error(`Object does not have a property named "${property}".`);
        }

        object[property] = function(...args) {
            // If memoization is disabled, call into the original method.
            if (!ENABLED) {
                return original.apply(this, args);
            }

            if (!memoizeStore.has(this)) {
                memoizeStore.set(this, {
                    noArgs: {},
                    hasArgs: {}
                });
            }

            // $FlowFixMe `this` was just set
            const { noArgs, hasArgs } = memoizeStore.get(this);
            const takesArguments = args.length !== 0;

            let cachedValue;
            let keys = [];

            if (takesArguments) {
                keys = [property, ...args];
                cachedValue = getIn(hasArgs, keys);
            } else {
                cachedValue = noArgs[property];
            }

            // If we've got a result already, return it.
            if (cachedValue !== UNSET) {
                return cachedValue === UNDEFINED ? undefined : cachedValue;
            }

            // Otherwise calculate what it should be once and cache it.
            const value = original.apply(this, args);
            const v = value === undefined ? UNDEFINED : value;

            if (takesArguments) {
                setIn(hasArgs, keys, v);
            } else {
                noArgs[property] = v;
            }

            return value;
        };
    }
}

/*
 * Get a value at a key path in a tree of Map.
 *
 * If not set, returns UNSET.
 * If the set value is undefined, returns UNDEFINED.
 */
function getIn(
    map: {},
    keys: string[]
): (any | typeof UNSET | typeof UNDEFINED | typeof NULL) {
    for (let key of keys) {
        if (key === undefined) {
            key = UNDEFINED;
        } else if (key === null) {
            key = NULL;
        }

        if (typeof key === 'object') {
            map = map[STORE_KEY] && map[STORE_KEY].get(key);
        } else {
            map = map[key];
        }

        if (map === UNSET) return UNSET;
    }

    return map[LEAF];
}

/*
 * Set a value at a key path in a tree of Map, creating Maps on the go.
 */
function setIn(
    map: {},
    keys: string[],
    value: any
): {} {
    let child = map;

    for (let key of keys) {
        if (key === undefined) {
            key = UNDEFINED;
        } else if (key === null) {
            key = NULL;
        }

        if (typeof key !== 'object') {
            if (!child[key]) {
                child[key] = {};
            }

            child = child[key];
            continue;
        }

        if (!child[STORE_KEY]) {
            child[STORE_KEY] = new WeakMap();
        }

        if (!child[STORE_KEY].has(key)) {
            const newChild = {};
            child[STORE_KEY].set(key, newChild);
            child = newChild;
            continue;
        }

        child = child[STORE_KEY].get(key);
    }

  // The whole path has been created, so set the value to the bottom most map.
    child[LEAF] = value;
    return map;
}

/*
 * Clears the previously memoized values, globally.
 */

function resetMemoization() {
    memoizeStore = new WeakMap();
}

/*
 * In DEV mode, enable or disable the use of memoize values, globally.
 */

function useMemoization(enabled: boolean) {
    ENABLED = enabled;
}

export default memoize;
export { resetMemoization, useMemoization };
