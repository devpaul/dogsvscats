(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("catsvsdogs", [], factory);
	else if(typeof exports === 'object')
		exports["catsvsdogs"] = factory();
	else
		root["catsvsdogs"] = factory();
})(this, function() {
return dojoWebpackJsonpcatsvsdogs(["main"],{

/***/ "./node_modules/@dojo/framework/core/Destroyable.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__shim_Promise__ = __webpack_require__("./node_modules/@dojo/framework/shim/Promise.mjs");

/**
 * No op function used to replace a Destroyable instance's `destroy` method, once the instance has been destroyed
 */
function noop() {
    return __WEBPACK_IMPORTED_MODULE_0__shim_Promise__["a" /* default */].resolve(false);
}
/**
 * No op function used to replace a Destroyable instance's `own` method, once the instance has been destroyed
 */
function destroyed() {
    throw new Error('Call made to destroyed method');
}
class Destroyable {
    /**
     * @constructor
     */
    constructor() {
        this.handles = [];
    }
    /**
     * Register handles for the instance that will be destroyed when `this.destroy` is called
     *
     * @param {Handle} handle The handle to add for the instance
     * @returns {Handle} A wrapper Handle. When the wrapper Handle's `destroy` method is invoked, the original handle is
     *                   removed from the instance, and its `destroy` method is invoked.
     */
    own(handle) {
        const { handles: _handles } = this;
        _handles.push(handle);
        return {
            destroy() {
                _handles.splice(_handles.indexOf(handle));
                handle.destroy();
            }
        };
    }
    /**
     * Destroys all handlers registered for the instance
     *
     * @returns {Promise<any} A Promise that resolves once all handles have been destroyed
     */
    destroy() {
        return new __WEBPACK_IMPORTED_MODULE_0__shim_Promise__["a" /* default */]((resolve) => {
            this.handles.forEach((handle) => {
                handle && handle.destroy && handle.destroy();
            });
            this.destroy = noop;
            this.own = destroyed;
            resolve(true);
        });
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Destroyable;

/* unused harmony default export */ var _unused_webpack_default_export = (Destroyable);


/***/ }),

/***/ "./node_modules/@dojo/framework/core/Evented.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export isGlobMatch */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__shim_Map__ = __webpack_require__("./node_modules/@dojo/framework/shim/Map.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Destroyable__ = __webpack_require__("./node_modules/@dojo/framework/core/Destroyable.mjs");


/**
 * Map of computed regular expressions, keyed by string
 */
const regexMap = new __WEBPACK_IMPORTED_MODULE_0__shim_Map__["b" /* default */]();
/**
 * Determines if the event type glob has been matched
 *
 * @returns boolean that indicates if the glob is matched
 */
function isGlobMatch(globString, targetString) {
    if (typeof targetString === 'string' && typeof globString === 'string' && globString.indexOf('*') !== -1) {
        let regex;
        if (regexMap.has(globString)) {
            regex = regexMap.get(globString);
        }
        else {
            regex = new RegExp(`^${globString.replace(/\*/g, '.*')}$`);
            regexMap.set(globString, regex);
        }
        return regex.test(targetString);
    }
    else {
        return globString === targetString;
    }
}
/**
 * Event Class
 */
class Evented extends __WEBPACK_IMPORTED_MODULE_1__Destroyable__["a" /* Destroyable */] {
    constructor() {
        super(...arguments);
        /**
         * map of listeners keyed by event type
         */
        this.listenersMap = new __WEBPACK_IMPORTED_MODULE_0__shim_Map__["b" /* default */]();
    }
    emit(event) {
        this.listenersMap.forEach((methods, type) => {
            if (isGlobMatch(type, event.type)) {
                [...methods].forEach((method) => {
                    method.call(this, event);
                });
            }
        });
    }
    on(type, listener) {
        if (Array.isArray(listener)) {
            const handles = listener.map((listener) => this._addListener(type, listener));
            return {
                destroy() {
                    handles.forEach((handle) => handle.destroy());
                }
            };
        }
        return this._addListener(type, listener);
    }
    _addListener(type, listener) {
        const listeners = this.listenersMap.get(type) || [];
        listeners.push(listener);
        this.listenersMap.set(type, listeners);
        return {
            destroy: () => {
                const listeners = this.listenersMap.get(type) || [];
                listeners.splice(listeners.indexOf(listener), 1);
            }
        };
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Evented;

/* unused harmony default export */ var _unused_webpack_default_export = (Evented);


/***/ }),

/***/ "./node_modules/@dojo/framework/core/util.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export deepAssign */
/* unused harmony export deepMixin */
/* unused harmony export mixin */
/* unused harmony export partial */
/* unused harmony export guaranteeMinimumTimeout */
/* unused harmony export debounce */
/* unused harmony export throttle */
/* harmony export (immutable) */ __webpack_exports__["a"] = uuid;
const slice = Array.prototype.slice;
const hasOwnProperty = Object.prototype.hasOwnProperty;
/**
 * Type guard that ensures that the value can be coerced to Object
 * to weed out host objects that do not derive from Object.
 * This function is used to check if we want to deep copy an object or not.
 * Note: In ES6 it is possible to modify an object's Symbol.toStringTag property, which will
 * change the value returned by `toString`. This is a rare edge case that is difficult to handle,
 * so it is not handled here.
 * @param  value The value to check
 * @return       If the value is coercible into an Object
 */
function shouldDeepCopyObject(value) {
    return Object.prototype.toString.call(value) === '[object Object]';
}
function copyArray(array, inherited) {
    return array.map(function (item) {
        if (Array.isArray(item)) {
            return copyArray(item, inherited);
        }
        return !shouldDeepCopyObject(item)
            ? item
            : _mixin({
                deep: true,
                inherited: inherited,
                sources: [item],
                target: {}
            });
    });
}
function _mixin(kwArgs) {
    const deep = kwArgs.deep;
    const inherited = kwArgs.inherited;
    const target = kwArgs.target;
    const copied = kwArgs.copied || [];
    const copiedClone = [...copied];
    for (let i = 0; i < kwArgs.sources.length; i++) {
        const source = kwArgs.sources[i];
        if (source === null || source === undefined) {
            continue;
        }
        for (let key in source) {
            if (inherited || hasOwnProperty.call(source, key)) {
                let value = source[key];
                if (copiedClone.indexOf(value) !== -1) {
                    continue;
                }
                if (deep) {
                    if (Array.isArray(value)) {
                        value = copyArray(value, inherited);
                    }
                    else if (shouldDeepCopyObject(value)) {
                        const targetValue = target[key] || {};
                        copied.push(source);
                        value = _mixin({
                            deep: true,
                            inherited: inherited,
                            sources: [value],
                            target: targetValue,
                            copied
                        });
                    }
                }
                target[key] = value;
            }
        }
    }
    return target;
}
function deepAssign(target, ...sources) {
    return _mixin({
        deep: true,
        inherited: false,
        sources: sources,
        target: target
    });
}
function deepMixin(target, ...sources) {
    return _mixin({
        deep: true,
        inherited: true,
        sources: sources,
        target: target
    });
}
function mixin(target, ...sources) {
    return _mixin({
        deep: false,
        inherited: true,
        sources: sources,
        target: target
    });
}
/**
 * Returns a function which invokes the given function with the given arguments prepended to its argument list.
 * Like `Function.prototype.bind`, but does not alter execution context.
 *
 * @param targetFunction The function that needs to be bound
 * @param suppliedArgs An optional array of arguments to prepend to the `targetFunction` arguments list
 * @return The bound function
 */
function partial(targetFunction, ...suppliedArgs) {
    return function () {
        const args = arguments.length ? suppliedArgs.concat(slice.call(arguments)) : suppliedArgs;
        return targetFunction.apply(this, args);
    };
}
function guaranteeMinimumTimeout(callback, delay) {
    const startTime = Date.now();
    let timerId;
    function timeoutHandler() {
        const delta = Date.now() - startTime;
        if (delay == null || delta >= delay) {
            callback();
        }
        else {
            timerId = setTimeout(timeoutHandler, delay - delta);
        }
    }
    timerId = setTimeout(timeoutHandler, delay);
    return {
        destroy: () => {
            if (timerId != null) {
                clearTimeout(timerId);
                timerId = null;
            }
        }
    };
}
function debounce(callback, delay) {
    let timer;
    return function () {
        timer && timer.destroy();
        let context = this;
        let args = arguments;
        timer = guaranteeMinimumTimeout(function () {
            callback.apply(context, args);
            args = context = timer = null;
        }, delay);
    };
}
function throttle(callback, delay) {
    let ran;
    return function () {
        if (ran) {
            return;
        }
        ran = true;
        callback.apply(this, arguments);
        guaranteeMinimumTimeout(function () {
            ran = null;
        }, delay);
    };
}
function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0, v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}


/***/ }),

/***/ "./node_modules/@dojo/framework/has/has.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* WEBPACK VAR INJECTION */(function(global, process) {/* harmony export (immutable) */ __webpack_exports__["load"] = load;
/* harmony export (immutable) */ __webpack_exports__["normalize"] = normalize;
/* harmony export (immutable) */ __webpack_exports__["exists"] = exists;
/* harmony export (immutable) */ __webpack_exports__["add"] = add;
/* harmony export (immutable) */ __webpack_exports__["default"] = has;
function isFeatureTestThenable(value) {
    return value && value.then;
}
/**
 * A cache of results of feature tests
 */
const testCache = {};
/* harmony export (immutable) */ __webpack_exports__["testCache"] = testCache;

/**
 * A cache of the un-resolved feature tests
 */
const testFunctions = {};
/* harmony export (immutable) */ __webpack_exports__["testFunctions"] = testFunctions;

/**
 * A cache of unresolved thenables (probably promises)
 * @type {{}}
 */
const testThenables = {};
/**
 * A reference to the global scope (`window` in a browser, `global` in NodeJS)
 */
const globalScope = (function () {
    /* istanbul ignore else */
    if (typeof window !== 'undefined') {
        // Browsers
        return window;
    }
    else if (typeof global !== 'undefined') {
        // Node
        return global;
    }
    else if (typeof self !== 'undefined') {
        // Web workers
        return self;
    }
    /* istanbul ignore next */
    return {};
})();
/* Grab the staticFeatures if there are available */
const { staticFeatures } = globalScope.DojoHasEnvironment || {};
/* Cleaning up the DojoHasEnviornment */
if ('DojoHasEnvironment' in globalScope) {
    delete globalScope.DojoHasEnvironment;
}
/**
 * Custom type guard to narrow the `staticFeatures` to either a map or a function that
 * returns a map.
 *
 * @param value The value to guard for
 */
function isStaticFeatureFunction(value) {
    return typeof value === 'function';
}
/**
 * The cache of asserted features that were available in the global scope when the
 * module loaded
 */
const staticCache = staticFeatures
    ? isStaticFeatureFunction(staticFeatures)
        ? staticFeatures.apply(globalScope)
        : staticFeatures
    : {}; /* Providing an empty cache, if none was in the environment

/**
* AMD plugin function.
*
* Conditional loads modules based on a has feature test value.
*
* @param resourceId Gives the resolved module id to load.
* @param require The loader require function with respect to the module that contained the plugin resource in its
*                dependency list.
* @param load Callback to loader that consumes result of plugin demand.
*/
function load(resourceId, require, load, config) {
    resourceId ? require([resourceId], load) : load();
}
/**
 * AMD plugin function.
 *
 * Resolves resourceId into a module id based on possibly-nested tenary expression that branches on has feature test
 * value(s).
 *
 * @param resourceId The id of the module
 * @param normalize Resolves a relative module id into an absolute module id
 */
function normalize(resourceId, normalize) {
    const tokens = resourceId.match(/[\?:]|[^:\?]*/g) || [];
    let i = 0;
    function get(skip) {
        const term = tokens[i++];
        if (term === ':') {
            // empty string module name, resolves to null
            return null;
        }
        else {
            // postfixed with a ? means it is a feature to branch on, the term is the name of the feature
            if (tokens[i++] === '?') {
                if (!skip && has(term)) {
                    // matched the feature, get the first value from the options
                    return get();
                }
                else {
                    // did not match, get the second value, passing over the first
                    get(true);
                    return get(skip);
                }
            }
            // a module
            return term;
        }
    }
    const id = get();
    return id && normalize(id);
}
/**
 * Check if a feature has already been registered
 *
 * @param feature the name of the feature
 */
function exists(feature) {
    const normalizedFeature = feature.toLowerCase();
    return Boolean(normalizedFeature in staticCache || normalizedFeature in testCache || testFunctions[normalizedFeature]);
}
/**
 * Register a new test for a named feature.
 *
 * @example
 * has.add('dom-addeventlistener', !!document.addEventListener);
 *
 * @example
 * has.add('touch-events', function () {
 *    return 'ontouchstart' in document
 * });
 *
 * @param feature the name of the feature
 * @param value the value reported of the feature, or a function that will be executed once on first test
 * @param overwrite if an existing value should be overwritten. Defaults to false.
 */
function add(feature, value, overwrite = false) {
    const normalizedFeature = feature.toLowerCase();
    if (exists(normalizedFeature) && !overwrite && !(normalizedFeature in staticCache)) {
        throw new TypeError(`Feature "${feature}" exists and overwrite not true.`);
    }
    if (typeof value === 'function') {
        testFunctions[normalizedFeature] = value;
    }
    else if (isFeatureTestThenable(value)) {
        testThenables[feature] = value.then((resolvedValue) => {
            testCache[feature] = resolvedValue;
            delete testThenables[feature];
        }, () => {
            delete testThenables[feature];
        });
    }
    else {
        testCache[normalizedFeature] = value;
        delete testFunctions[normalizedFeature];
    }
}
/**
 * Return the current value of a named feature.
 *
 * @param feature The name of the feature to test.
 */
function has(feature) {
    let result;
    const normalizedFeature = feature.toLowerCase();
    if (normalizedFeature in staticCache) {
        result = staticCache[normalizedFeature];
    }
    else if (testFunctions[normalizedFeature]) {
        result = testCache[normalizedFeature] = testFunctions[normalizedFeature].call(null);
        delete testFunctions[normalizedFeature];
    }
    else if (normalizedFeature in testCache) {
        result = testCache[normalizedFeature];
    }
    else if (feature in testThenables) {
        return false;
    }
    else {
        throw new TypeError(`Attempt to detect unregistered has feature "${feature}"`);
    }
    return result;
}
/*
 * Out of the box feature tests
 */
/* Environments */
/* Used as a value to provide a debug only code path */
add('debug', true);
/* flag for dojo debug, default to false */
add('dojo-debug', false);
/* Detects if the environment is "browser like" */
add('host-browser', typeof document !== 'undefined' && typeof location !== 'undefined');
/* Detects if the environment appears to be NodeJS */
add('host-node', function () {
    if (typeof process === 'object' && process.versions && process.versions.node) {
        return process.versions.node;
    }
});

/* WEBPACK VAR INJECTION */}.call(__webpack_exports__, __webpack_require__("./node_modules/webpack/buildin/global.js"), __webpack_require__("./node_modules/process/browser.js")))

/***/ }),

/***/ "./node_modules/@dojo/framework/shim/Map.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Map; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__iterator__ = __webpack_require__("./node_modules/@dojo/framework/shim/iterator.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__global__ = __webpack_require__("./node_modules/@dojo/framework/shim/global.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__object__ = __webpack_require__("./node_modules/@dojo/framework/shim/object.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__support_has__ = __webpack_require__("./node_modules/@dojo/framework/shim/support/has.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__Symbol__ = __webpack_require__("./node_modules/@dojo/framework/shim/Symbol.mjs");





let Map = __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Map;
if (false) {
    Map = (_a = class Map {
            constructor(iterable) {
                this._keys = [];
                this._values = [];
                this[Symbol.toStringTag] = 'Map';
                if (iterable) {
                    if (isArrayLike(iterable)) {
                        for (let i = 0; i < iterable.length; i++) {
                            const value = iterable[i];
                            this.set(value[0], value[1]);
                        }
                    }
                    else {
                        for (const value of iterable) {
                            this.set(value[0], value[1]);
                        }
                    }
                }
            }
            /**
             * An alternative to Array.prototype.indexOf using Object.is
             * to check for equality. See http://mzl.la/1zuKO2V
             */
            _indexOfKey(keys, key) {
                for (let i = 0, length = keys.length; i < length; i++) {
                    if (objectIs(keys[i], key)) {
                        return i;
                    }
                }
                return -1;
            }
            get size() {
                return this._keys.length;
            }
            clear() {
                this._keys.length = this._values.length = 0;
            }
            delete(key) {
                const index = this._indexOfKey(this._keys, key);
                if (index < 0) {
                    return false;
                }
                this._keys.splice(index, 1);
                this._values.splice(index, 1);
                return true;
            }
            entries() {
                const values = this._keys.map((key, i) => {
                    return [key, this._values[i]];
                });
                return new ShimIterator(values);
            }
            forEach(callback, context) {
                const keys = this._keys;
                const values = this._values;
                for (let i = 0, length = keys.length; i < length; i++) {
                    callback.call(context, values[i], keys[i], this);
                }
            }
            get(key) {
                const index = this._indexOfKey(this._keys, key);
                return index < 0 ? undefined : this._values[index];
            }
            has(key) {
                return this._indexOfKey(this._keys, key) > -1;
            }
            keys() {
                return new ShimIterator(this._keys);
            }
            set(key, value) {
                let index = this._indexOfKey(this._keys, key);
                index = index < 0 ? this._keys.length : index;
                this._keys[index] = key;
                this._values[index] = value;
                return this;
            }
            values() {
                return new ShimIterator(this._values);
            }
            [Symbol.iterator]() {
                return this.entries();
            }
        },
        _a[Symbol.species] = _a,
        _a);
}
/* harmony default export */ __webpack_exports__["b"] = (Map);
var _a;


/***/ }),

/***/ "./node_modules/@dojo/framework/shim/Promise.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export ShimPromise */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__global__ = __webpack_require__("./node_modules/@dojo/framework/shim/global.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__support_queue__ = __webpack_require__("./node_modules/@dojo/framework/shim/support/queue.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Symbol__ = __webpack_require__("./node_modules/@dojo/framework/shim/Symbol.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__support_has__ = __webpack_require__("./node_modules/@dojo/framework/shim/support/has.mjs");




let ShimPromise = __WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].Promise;
const isThenable = function isThenable(value) {
    return value && typeof value.then === 'function';
};
/* unused harmony export isThenable */

if (false) {
    global.Promise = ShimPromise = (_a = class Promise {
            /**
             * Creates a new Promise.
             *
             * @constructor
             *
             * @param executor
             * The executor function is called immediately when the Promise is instantiated. It is responsible for
             * starting the asynchronous operation when it is invoked.
             *
             * The executor must call either the passed `resolve` function when the asynchronous operation has completed
             * successfully, or the `reject` function when the operation fails.
             */
            constructor(executor) {
                /**
                 * The current state of this promise.
                 */
                this.state = 1 /* Pending */;
                this[Symbol.toStringTag] = 'Promise';
                /**
                 * If true, the resolution of this promise is chained ("locked in") to another promise.
                 */
                let isChained = false;
                /**
                 * Whether or not this promise is in a resolved state.
                 */
                const isResolved = () => {
                    return this.state !== 1 /* Pending */ || isChained;
                };
                /**
                 * Callbacks that should be invoked once the asynchronous operation has completed.
                 */
                let callbacks = [];
                /**
                 * Initially pushes callbacks onto a queue for execution once this promise settles. After the promise settles,
                 * enqueues callbacks for execution on the next event loop turn.
                 */
                let whenFinished = function (callback) {
                    if (callbacks) {
                        callbacks.push(callback);
                    }
                };
                /**
                 * Settles this promise.
                 *
                 * @param newState The resolved state for this promise.
                 * @param {T|any} value The resolved value for this promise.
                 */
                const settle = (newState, value) => {
                    // A promise can only be settled once.
                    if (this.state !== 1 /* Pending */) {
                        return;
                    }
                    this.state = newState;
                    this.resolvedValue = value;
                    whenFinished = queueMicroTask;
                    // Only enqueue a callback runner if there are callbacks so that initially fulfilled Promises don't have to
                    // wait an extra turn.
                    if (callbacks && callbacks.length > 0) {
                        queueMicroTask(function () {
                            if (callbacks) {
                                let count = callbacks.length;
                                for (let i = 0; i < count; ++i) {
                                    callbacks[i].call(null);
                                }
                                callbacks = null;
                            }
                        });
                    }
                };
                /**
                 * Resolves this promise.
                 *
                 * @param newState The resolved state for this promise.
                 * @param {T|any} value The resolved value for this promise.
                 */
                const resolve = (newState, value) => {
                    if (isResolved()) {
                        return;
                    }
                    if (isThenable(value)) {
                        value.then(settle.bind(null, 0 /* Fulfilled */), settle.bind(null, 2 /* Rejected */));
                        isChained = true;
                    }
                    else {
                        settle(newState, value);
                    }
                };
                this.then = (onFulfilled, onRejected) => {
                    return new Promise((resolve, reject) => {
                        // whenFinished initially queues up callbacks for execution after the promise has settled. Once the
                        // promise has settled, whenFinished will schedule callbacks for execution on the next turn through the
                        // event loop.
                        whenFinished(() => {
                            const callback = this.state === 2 /* Rejected */ ? onRejected : onFulfilled;
                            if (typeof callback === 'function') {
                                try {
                                    resolve(callback(this.resolvedValue));
                                }
                                catch (error) {
                                    reject(error);
                                }
                            }
                            else if (this.state === 2 /* Rejected */) {
                                reject(this.resolvedValue);
                            }
                            else {
                                resolve(this.resolvedValue);
                            }
                        });
                    });
                };
                try {
                    executor(resolve.bind(null, 0 /* Fulfilled */), resolve.bind(null, 2 /* Rejected */));
                }
                catch (error) {
                    settle(2 /* Rejected */, error);
                }
            }
            static all(iterable) {
                return new this(function (resolve, reject) {
                    const values = [];
                    let complete = 0;
                    let total = 0;
                    let populating = true;
                    function fulfill(index, value) {
                        values[index] = value;
                        ++complete;
                        finish();
                    }
                    function finish() {
                        if (populating || complete < total) {
                            return;
                        }
                        resolve(values);
                    }
                    function processItem(index, item) {
                        ++total;
                        if (isThenable(item)) {
                            // If an item Promise rejects, this Promise is immediately rejected with the item
                            // Promise's rejection error.
                            item.then(fulfill.bind(null, index), reject);
                        }
                        else {
                            Promise.resolve(item).then(fulfill.bind(null, index));
                        }
                    }
                    let i = 0;
                    for (const value of iterable) {
                        processItem(i, value);
                        i++;
                    }
                    populating = false;
                    finish();
                });
            }
            static race(iterable) {
                return new this(function (resolve, reject) {
                    for (const item of iterable) {
                        if (item instanceof Promise) {
                            // If a Promise item rejects, this Promise is immediately rejected with the item
                            // Promise's rejection error.
                            item.then(resolve, reject);
                        }
                        else {
                            Promise.resolve(item).then(resolve);
                        }
                    }
                });
            }
            static reject(reason) {
                return new this(function (resolve, reject) {
                    reject(reason);
                });
            }
            static resolve(value) {
                return new this(function (resolve) {
                    resolve(value);
                });
            }
            catch(onRejected) {
                return this.then(undefined, onRejected);
            }
        },
        _a[Symbol.species] = ShimPromise,
        _a);
}
/* harmony default export */ __webpack_exports__["a"] = (ShimPromise);
var _a;


/***/ }),

/***/ "./node_modules/@dojo/framework/shim/Set.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export Set */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__global__ = __webpack_require__("./node_modules/@dojo/framework/shim/global.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__iterator__ = __webpack_require__("./node_modules/@dojo/framework/shim/iterator.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__support_has__ = __webpack_require__("./node_modules/@dojo/framework/shim/support/has.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__Symbol__ = __webpack_require__("./node_modules/@dojo/framework/shim/Symbol.mjs");




let Set = __WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].Set;
if (false) {
    Set = (_a = class Set {
            constructor(iterable) {
                this._setData = [];
                this[Symbol.toStringTag] = 'Set';
                if (iterable) {
                    if (isArrayLike(iterable)) {
                        for (let i = 0; i < iterable.length; i++) {
                            this.add(iterable[i]);
                        }
                    }
                    else {
                        for (const value of iterable) {
                            this.add(value);
                        }
                    }
                }
            }
            add(value) {
                if (this.has(value)) {
                    return this;
                }
                this._setData.push(value);
                return this;
            }
            clear() {
                this._setData.length = 0;
            }
            delete(value) {
                const idx = this._setData.indexOf(value);
                if (idx === -1) {
                    return false;
                }
                this._setData.splice(idx, 1);
                return true;
            }
            entries() {
                return new ShimIterator(this._setData.map((value) => [value, value]));
            }
            forEach(callbackfn, thisArg) {
                const iterator = this.values();
                let result = iterator.next();
                while (!result.done) {
                    callbackfn.call(thisArg, result.value, result.value, this);
                    result = iterator.next();
                }
            }
            has(value) {
                return this._setData.indexOf(value) > -1;
            }
            keys() {
                return new ShimIterator(this._setData);
            }
            get size() {
                return this._setData.length;
            }
            values() {
                return new ShimIterator(this._setData);
            }
            [Symbol.iterator]() {
                return new ShimIterator(this._setData);
            }
        },
        _a[Symbol.species] = _a,
        _a);
}
/* harmony default export */ __webpack_exports__["a"] = (Set);
var _a;


/***/ }),

/***/ "./node_modules/@dojo/framework/shim/Symbol.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export Symbol */
/* unused harmony export isSymbol */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__support_has__ = __webpack_require__("./node_modules/@dojo/framework/shim/support/has.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__global__ = __webpack_require__("./node_modules/@dojo/framework/shim/global.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__support_util__ = __webpack_require__("./node_modules/@dojo/framework/shim/support/util.mjs");



let Symbol = __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Symbol;
if (false) {
    /**
     * Throws if the value is not a symbol, used internally within the Shim
     * @param  {any}    value The value to check
     * @return {symbol}       Returns the symbol or throws
     */
    const validateSymbol = function validateSymbol(value) {
        if (!isSymbol(value)) {
            throw new TypeError(value + ' is not a symbol');
        }
        return value;
    };
    const defineProperties = Object.defineProperties;
    const defineProperty = Object.defineProperty;
    const create = Object.create;
    const objPrototype = Object.prototype;
    const globalSymbols = {};
    const getSymbolName = (function () {
        const created = create(null);
        return function (desc) {
            let postfix = 0;
            let name;
            while (created[String(desc) + (postfix || '')]) {
                ++postfix;
            }
            desc += String(postfix || '');
            created[desc] = true;
            name = '@@' + desc;
            // FIXME: Temporary guard until the duplicate execution when testing can be
            // pinned down.
            if (!Object.getOwnPropertyDescriptor(objPrototype, name)) {
                defineProperty(objPrototype, name, {
                    set: function (value) {
                        defineProperty(this, name, getValueDescriptor(value));
                    }
                });
            }
            return name;
        };
    })();
    const InternalSymbol = function Symbol(description) {
        if (this instanceof InternalSymbol) {
            throw new TypeError('TypeError: Symbol is not a constructor');
        }
        return Symbol(description);
    };
    Symbol = global.Symbol = function Symbol(description) {
        if (this instanceof Symbol) {
            throw new TypeError('TypeError: Symbol is not a constructor');
        }
        const sym = Object.create(InternalSymbol.prototype);
        description = description === undefined ? '' : String(description);
        return defineProperties(sym, {
            __description__: getValueDescriptor(description),
            __name__: getValueDescriptor(getSymbolName(description))
        });
    };
    /* Decorate the Symbol function with the appropriate properties */
    defineProperty(Symbol, 'for', getValueDescriptor(function (key) {
        if (globalSymbols[key]) {
            return globalSymbols[key];
        }
        return (globalSymbols[key] = Symbol(String(key)));
    }));
    defineProperties(Symbol, {
        keyFor: getValueDescriptor(function (sym) {
            let key;
            validateSymbol(sym);
            for (key in globalSymbols) {
                if (globalSymbols[key] === sym) {
                    return key;
                }
            }
        }),
        hasInstance: getValueDescriptor(Symbol.for('hasInstance'), false, false),
        isConcatSpreadable: getValueDescriptor(Symbol.for('isConcatSpreadable'), false, false),
        iterator: getValueDescriptor(Symbol.for('iterator'), false, false),
        match: getValueDescriptor(Symbol.for('match'), false, false),
        observable: getValueDescriptor(Symbol.for('observable'), false, false),
        replace: getValueDescriptor(Symbol.for('replace'), false, false),
        search: getValueDescriptor(Symbol.for('search'), false, false),
        species: getValueDescriptor(Symbol.for('species'), false, false),
        split: getValueDescriptor(Symbol.for('split'), false, false),
        toPrimitive: getValueDescriptor(Symbol.for('toPrimitive'), false, false),
        toStringTag: getValueDescriptor(Symbol.for('toStringTag'), false, false),
        unscopables: getValueDescriptor(Symbol.for('unscopables'), false, false)
    });
    /* Decorate the InternalSymbol object */
    defineProperties(InternalSymbol.prototype, {
        constructor: getValueDescriptor(Symbol),
        toString: getValueDescriptor(function () {
            return this.__name__;
        }, false, false)
    });
    /* Decorate the Symbol.prototype */
    defineProperties(Symbol.prototype, {
        toString: getValueDescriptor(function () {
            return 'Symbol (' + validateSymbol(this).__description__ + ')';
        }),
        valueOf: getValueDescriptor(function () {
            return validateSymbol(this);
        })
    });
    defineProperty(Symbol.prototype, Symbol.toPrimitive, getValueDescriptor(function () {
        return validateSymbol(this);
    }));
    defineProperty(Symbol.prototype, Symbol.toStringTag, getValueDescriptor('Symbol', false, false, true));
    defineProperty(InternalSymbol.prototype, Symbol.toPrimitive, getValueDescriptor(Symbol.prototype[Symbol.toPrimitive], false, false, true));
    defineProperty(InternalSymbol.prototype, Symbol.toStringTag, getValueDescriptor(Symbol.prototype[Symbol.toStringTag], false, false, true));
}
/**
 * A custom guard function that determines if an object is a symbol or not
 * @param  {any}       value The value to check to see if it is a symbol or not
 * @return {is symbol}       Returns true if a symbol or not (and narrows the type guard)
 */
function isSymbol(value) {
    return (value && (typeof value === 'symbol' || value['@@toStringTag'] === 'Symbol')) || false;
}
/**
 * Fill any missing well known symbols if the native Symbol is missing them
 */
[
    'hasInstance',
    'isConcatSpreadable',
    'iterator',
    'species',
    'replace',
    'search',
    'split',
    'match',
    'toPrimitive',
    'toStringTag',
    'unscopables',
    'observable'
].forEach((wellKnown) => {
    if (!Symbol[wellKnown]) {
        Object.defineProperty(Symbol, wellKnown, Object(__WEBPACK_IMPORTED_MODULE_2__support_util__["a" /* getValueDescriptor */])(Symbol.for(wellKnown), false, false));
    }
});
/* unused harmony default export */ var _unused_webpack_default_export = (Symbol);


/***/ }),

/***/ "./node_modules/@dojo/framework/shim/WeakMap.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return WeakMap; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__global__ = __webpack_require__("./node_modules/@dojo/framework/shim/global.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__iterator__ = __webpack_require__("./node_modules/@dojo/framework/shim/iterator.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__support_has__ = __webpack_require__("./node_modules/@dojo/framework/shim/support/has.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__Symbol__ = __webpack_require__("./node_modules/@dojo/framework/shim/Symbol.mjs");




let WeakMap = __WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].WeakMap;
if (false) {
    const DELETED = {};
    const getUID = function getUID() {
        return Math.floor(Math.random() * 100000000);
    };
    const generateName = (function () {
        let startId = Math.floor(Date.now() % 100000000);
        return function generateName() {
            return '__wm' + getUID() + (startId++ + '__');
        };
    })();
    WeakMap = class WeakMap {
        constructor(iterable) {
            this[Symbol.toStringTag] = 'WeakMap';
            this._name = generateName();
            this._frozenEntries = [];
            if (iterable) {
                if (isArrayLike(iterable)) {
                    for (let i = 0; i < iterable.length; i++) {
                        const item = iterable[i];
                        this.set(item[0], item[1]);
                    }
                }
                else {
                    for (const [key, value] of iterable) {
                        this.set(key, value);
                    }
                }
            }
        }
        _getFrozenEntryIndex(key) {
            for (let i = 0; i < this._frozenEntries.length; i++) {
                if (this._frozenEntries[i].key === key) {
                    return i;
                }
            }
            return -1;
        }
        delete(key) {
            if (key === undefined || key === null) {
                return false;
            }
            const entry = key[this._name];
            if (entry && entry.key === key && entry.value !== DELETED) {
                entry.value = DELETED;
                return true;
            }
            const frozenIndex = this._getFrozenEntryIndex(key);
            if (frozenIndex >= 0) {
                this._frozenEntries.splice(frozenIndex, 1);
                return true;
            }
            return false;
        }
        get(key) {
            if (key === undefined || key === null) {
                return undefined;
            }
            const entry = key[this._name];
            if (entry && entry.key === key && entry.value !== DELETED) {
                return entry.value;
            }
            const frozenIndex = this._getFrozenEntryIndex(key);
            if (frozenIndex >= 0) {
                return this._frozenEntries[frozenIndex].value;
            }
        }
        has(key) {
            if (key === undefined || key === null) {
                return false;
            }
            const entry = key[this._name];
            if (Boolean(entry && entry.key === key && entry.value !== DELETED)) {
                return true;
            }
            const frozenIndex = this._getFrozenEntryIndex(key);
            if (frozenIndex >= 0) {
                return true;
            }
            return false;
        }
        set(key, value) {
            if (!key || (typeof key !== 'object' && typeof key !== 'function')) {
                throw new TypeError('Invalid value used as weak map key');
            }
            let entry = key[this._name];
            if (!entry || entry.key !== key) {
                entry = Object.create(null, {
                    key: { value: key }
                });
                if (Object.isFrozen(key)) {
                    this._frozenEntries.push(entry);
                }
                else {
                    Object.defineProperty(key, this._name, {
                        value: entry
                    });
                }
            }
            entry.value = value;
            return this;
        }
    };
}
/* harmony default export */ __webpack_exports__["b"] = (WeakMap);


/***/ }),

/***/ "./node_modules/@dojo/framework/shim/array.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return from; });
/* unused harmony export of */
/* unused harmony export copyWithin */
/* unused harmony export fill */
/* unused harmony export find */
/* unused harmony export findIndex */
/* unused harmony export includes */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__global__ = __webpack_require__("./node_modules/@dojo/framework/shim/global.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__iterator__ = __webpack_require__("./node_modules/@dojo/framework/shim/iterator.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__number__ = __webpack_require__("./node_modules/@dojo/framework/shim/number.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__support_has__ = __webpack_require__("./node_modules/@dojo/framework/shim/support/has.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__support_util__ = __webpack_require__("./node_modules/@dojo/framework/shim/support/util.mjs");





let from;
/**
 * Creates a new array from the function parameters.
 *
 * @param arguments Any number of arguments for the array
 * @return An array from the given arguments
 */
let of;
/* ES6 Array instance methods */
/**
 * Copies data internally within an array or array-like object.
 *
 * @param target The target array-like object
 * @param offset The index to start copying values to; if negative, it counts backwards from length
 * @param start The first (inclusive) index to copy; if negative, it counts backwards from length
 * @param end The last (exclusive) index to copy; if negative, it counts backwards from length
 * @return The target
 */
let copyWithin;
/**
 * Fills elements of an array-like object with the specified value.
 *
 * @param target The target to fill
 * @param value The value to fill each element of the target with
 * @param start The first index to fill
 * @param end The (exclusive) index at which to stop filling
 * @return The filled target
 */
let fill;
/**
 * Finds and returns the first instance matching the callback or undefined if one is not found.
 *
 * @param target An array-like object
 * @param callback A function returning if the current value matches a criteria
 * @param thisArg The execution context for the find function
 * @return The first element matching the callback, or undefined if one does not exist
 */
let find;
/**
 * Performs a linear search and returns the first index whose value satisfies the passed callback,
 * or -1 if no values satisfy it.
 *
 * @param target An array-like object
 * @param callback A function returning true if the current value satisfies its criteria
 * @param thisArg The execution context for the find function
 * @return The first index whose value satisfies the passed callback, or -1 if no values satisfy it
 */
let findIndex;
/* ES7 Array instance methods */
/**
 * Determines whether an array includes a given value
 *
 * @param target the target array-like object
 * @param searchElement the item to search for
 * @param fromIndex the starting index to search from
 * @return `true` if the array includes the element, otherwise `false`
 */
let includes;
if (true) {
    from = __WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].Array.from;
    of = __WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].Array.of;
    copyWithin = Object(__WEBPACK_IMPORTED_MODULE_4__support_util__["b" /* wrapNative */])(__WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].Array.prototype.copyWithin);
    fill = Object(__WEBPACK_IMPORTED_MODULE_4__support_util__["b" /* wrapNative */])(__WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].Array.prototype.fill);
    find = Object(__WEBPACK_IMPORTED_MODULE_4__support_util__["b" /* wrapNative */])(__WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].Array.prototype.find);
    findIndex = Object(__WEBPACK_IMPORTED_MODULE_4__support_util__["b" /* wrapNative */])(__WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].Array.prototype.findIndex);
}
else {
    // It is only older versions of Safari/iOS that have a bad fill implementation and so aren't in the wild
    // To make things easier, if there is a bad fill implementation, the whole set of functions will be filled
    /**
     * Ensures a non-negative, non-infinite, safe integer.
     *
     * @param length The number to validate
     * @return A proper length
     */
    const toLength = function toLength(length) {
        if (isNaN(length)) {
            return 0;
        }
        length = Number(length);
        if (isFinite(length)) {
            length = Math.floor(length);
        }
        // Ensure a non-negative, real, safe integer
        return Math.min(Math.max(length, 0), MAX_SAFE_INTEGER);
    };
    /**
     * From ES6 7.1.4 ToInteger()
     *
     * @param value A value to convert
     * @return An integer
     */
    const toInteger = function toInteger(value) {
        value = Number(value);
        if (isNaN(value)) {
            return 0;
        }
        if (value === 0 || !isFinite(value)) {
            return value;
        }
        return (value > 0 ? 1 : -1) * Math.floor(Math.abs(value));
    };
    /**
     * Normalizes an offset against a given length, wrapping it if negative.
     *
     * @param value The original offset
     * @param length The total length to normalize against
     * @return If negative, provide a distance from the end (length); otherwise provide a distance from 0
     */
    const normalizeOffset = function normalizeOffset(value, length) {
        return value < 0 ? Math.max(length + value, 0) : Math.min(value, length);
    };
    from = function from(arrayLike, mapFunction, thisArg) {
        if (arrayLike == null) {
            throw new TypeError('from: requires an array-like object');
        }
        if (mapFunction && thisArg) {
            mapFunction = mapFunction.bind(thisArg);
        }
        /* tslint:disable-next-line:variable-name */
        const Constructor = this;
        const length = toLength(arrayLike.length);
        // Support extension
        const array = typeof Constructor === 'function' ? Object(new Constructor(length)) : new Array(length);
        if (!isArrayLike(arrayLike) && !isIterable(arrayLike)) {
            return array;
        }
        // if this is an array and the normalized length is 0, just return an empty array. this prevents a problem
        // with the iteration on IE when using a NaN array length.
        if (isArrayLike(arrayLike)) {
            if (length === 0) {
                return [];
            }
            for (let i = 0; i < arrayLike.length; i++) {
                array[i] = mapFunction ? mapFunction(arrayLike[i], i) : arrayLike[i];
            }
        }
        else {
            let i = 0;
            for (const value of arrayLike) {
                array[i] = mapFunction ? mapFunction(value, i) : value;
                i++;
            }
        }
        if (arrayLike.length !== undefined) {
            array.length = length;
        }
        return array;
    };
    of = function of(...items) {
        return Array.prototype.slice.call(items);
    };
    copyWithin = function copyWithin(target, offset, start, end) {
        if (target == null) {
            throw new TypeError('copyWithin: target must be an array-like object');
        }
        const length = toLength(target.length);
        offset = normalizeOffset(toInteger(offset), length);
        start = normalizeOffset(toInteger(start), length);
        end = normalizeOffset(end === undefined ? length : toInteger(end), length);
        let count = Math.min(end - start, length - offset);
        let direction = 1;
        if (offset > start && offset < start + count) {
            direction = -1;
            start += count - 1;
            offset += count - 1;
        }
        while (count > 0) {
            if (start in target) {
                target[offset] = target[start];
            }
            else {
                delete target[offset];
            }
            offset += direction;
            start += direction;
            count--;
        }
        return target;
    };
    fill = function fill(target, value, start, end) {
        const length = toLength(target.length);
        let i = normalizeOffset(toInteger(start), length);
        end = normalizeOffset(end === undefined ? length : toInteger(end), length);
        while (i < end) {
            target[i++] = value;
        }
        return target;
    };
    find = function find(target, callback, thisArg) {
        const index = findIndex(target, callback, thisArg);
        return index !== -1 ? target[index] : undefined;
    };
    findIndex = function findIndex(target, callback, thisArg) {
        const length = toLength(target.length);
        if (!callback) {
            throw new TypeError('find: second argument must be a function');
        }
        if (thisArg) {
            callback = callback.bind(thisArg);
        }
        for (let i = 0; i < length; i++) {
            if (callback(target[i], i, target)) {
                return i;
            }
        }
        return -1;
    };
}
if (true) {
    includes = Object(__WEBPACK_IMPORTED_MODULE_4__support_util__["b" /* wrapNative */])(__WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].Array.prototype.includes);
}
else {
    /**
     * Ensures a non-negative, non-infinite, safe integer.
     *
     * @param length The number to validate
     * @return A proper length
     */
    const toLength = function toLength(length) {
        length = Number(length);
        if (isNaN(length)) {
            return 0;
        }
        if (isFinite(length)) {
            length = Math.floor(length);
        }
        // Ensure a non-negative, real, safe integer
        return Math.min(Math.max(length, 0), MAX_SAFE_INTEGER);
    };
    includes = function includes(target, searchElement, fromIndex = 0) {
        let len = toLength(target.length);
        for (let i = fromIndex; i < len; ++i) {
            const currentElement = target[i];
            if (searchElement === currentElement ||
                (searchElement !== searchElement && currentElement !== currentElement)) {
                return true;
            }
        }
        return false;
    };
}


/***/ }),

/***/ "./node_modules/@dojo/framework/shim/global.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {const globalObject = (function () {
    // the only reliable means to get the global object is
    // `Function('return this')()`
    // However, this causes CSP violations in Chrome apps.
    if (typeof self !== 'undefined') {
        return self;
    }
    if (typeof window !== 'undefined') {
        return window;
    }
    if (typeof global !== 'undefined') {
        return global;
    }
})();
/* harmony default export */ __webpack_exports__["a"] = (globalObject);

/* WEBPACK VAR INJECTION */}.call(__webpack_exports__, __webpack_require__("./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/@dojo/framework/shim/iterator.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export isIterable */
/* unused harmony export isArrayLike */
/* unused harmony export get */
/* unused harmony export forOf */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Symbol__ = __webpack_require__("./node_modules/@dojo/framework/shim/Symbol.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__string__ = __webpack_require__("./node_modules/@dojo/framework/shim/string.mjs");


const staticDone = { done: true, value: undefined };
/**
 * A class that _shims_ an iterator interface on array like objects.
 */
class ShimIterator {
    constructor(list) {
        this._nextIndex = -1;
        if (isIterable(list)) {
            this._nativeIterator = list[Symbol.iterator]();
        }
        else {
            this._list = list;
        }
    }
    /**
     * Return the next iteration result for the Iterator
     */
    next() {
        if (this._nativeIterator) {
            return this._nativeIterator.next();
        }
        if (!this._list) {
            return staticDone;
        }
        if (++this._nextIndex < this._list.length) {
            return {
                done: false,
                value: this._list[this._nextIndex]
            };
        }
        return staticDone;
    }
    [Symbol.iterator]() {
        return this;
    }
}
/* unused harmony export ShimIterator */

/**
 * A type guard for checking if something has an Iterable interface
 *
 * @param value The value to type guard against
 */
function isIterable(value) {
    return value && typeof value[Symbol.iterator] === 'function';
}
/**
 * A type guard for checking if something is ArrayLike
 *
 * @param value The value to type guard against
 */
function isArrayLike(value) {
    return value && typeof value.length === 'number';
}
/**
 * Returns the iterator for an object
 *
 * @param iterable The iterable object to return the iterator for
 */
function get(iterable) {
    if (isIterable(iterable)) {
        return iterable[Symbol.iterator]();
    }
    else if (isArrayLike(iterable)) {
        return new ShimIterator(iterable);
    }
}
/**
 * Shims the functionality of `for ... of` blocks
 *
 * @param iterable The object the provides an interator interface
 * @param callback The callback which will be called for each item of the iterable
 * @param thisArg Optional scope to pass the callback
 */
function forOf(iterable, callback, thisArg) {
    let broken = false;
    function doBreak() {
        broken = true;
    }
    /* We need to handle iteration of double byte strings properly */
    if (isArrayLike(iterable) && typeof iterable === 'string') {
        const l = iterable.length;
        for (let i = 0; i < l; ++i) {
            let char = iterable[i];
            if (i + 1 < l) {
                const code = char.charCodeAt(0);
                if (code >= __WEBPACK_IMPORTED_MODULE_1__string__["b" /* HIGH_SURROGATE_MIN */] && code <= __WEBPACK_IMPORTED_MODULE_1__string__["a" /* HIGH_SURROGATE_MAX */]) {
                    char += iterable[++i];
                }
            }
            callback.call(thisArg, char, iterable, doBreak);
            if (broken) {
                return;
            }
        }
    }
    else {
        const iterator = get(iterable);
        if (iterator) {
            let result = iterator.next();
            while (!result.done) {
                callback.call(thisArg, result.value, iterable, doBreak);
                if (broken) {
                    return;
                }
                result = iterator.next();
            }
        }
    }
}


/***/ }),

/***/ "./node_modules/@dojo/framework/shim/number.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export isNaN */
/* unused harmony export isFinite */
/* unused harmony export isInteger */
/* unused harmony export isSafeInteger */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__global__ = __webpack_require__("./node_modules/@dojo/framework/shim/global.mjs");

/**
 * The smallest interval between two representable numbers.
 */
const EPSILON = 1;
/* unused harmony export EPSILON */

/**
 * The maximum safe integer in JavaScript
 */
const MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;
/* unused harmony export MAX_SAFE_INTEGER */

/**
 * The minimum safe integer in JavaScript
 */
const MIN_SAFE_INTEGER = -MAX_SAFE_INTEGER;
/* unused harmony export MIN_SAFE_INTEGER */

/**
 * Determines whether the passed value is NaN without coersion.
 *
 * @param value The value to test
 * @return true if the value is NaN, false if it is not
 */
function isNaN(value) {
    return typeof value === 'number' && __WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].isNaN(value);
}
/**
 * Determines whether the passed value is a finite number without coersion.
 *
 * @param value The value to test
 * @return true if the value is finite, false if it is not
 */
function isFinite(value) {
    return typeof value === 'number' && __WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].isFinite(value);
}
/**
 * Determines whether the passed value is an integer.
 *
 * @param value The value to test
 * @return true if the value is an integer, false if it is not
 */
function isInteger(value) {
    return isFinite(value) && Math.floor(value) === value;
}
/**
 * Determines whether the passed value is an integer that is 'safe,' meaning:
 *   1. it can be expressed as an IEEE-754 double precision number
 *   2. it has a one-to-one mapping to a mathematical integer, meaning its
 *      IEEE-754 representation cannot be the result of rounding any other
 *      integer to fit the IEEE-754 representation
 *
 * @param value The value to test
 * @return true if the value is an integer, false if it is not
 */
function isSafeInteger(value) {
    return isInteger(value) && Math.abs(value) <= MAX_SAFE_INTEGER;
}


/***/ }),

/***/ "./node_modules/@dojo/framework/shim/object.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export assign */
/* unused harmony export getOwnPropertyDescriptor */
/* unused harmony export getOwnPropertyNames */
/* unused harmony export getOwnPropertySymbols */
/* unused harmony export is */
/* unused harmony export keys */
/* unused harmony export getOwnPropertyDescriptors */
/* unused harmony export entries */
/* unused harmony export values */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__global__ = __webpack_require__("./node_modules/@dojo/framework/shim/global.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__support_has__ = __webpack_require__("./node_modules/@dojo/framework/shim/support/has.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Symbol__ = __webpack_require__("./node_modules/@dojo/framework/shim/Symbol.mjs");



let assign;
/**
 * Gets the own property descriptor of the specified object.
 * An own property descriptor is one that is defined directly on the object and is not
 * inherited from the object's prototype.
 * @param o Object that contains the property.
 * @param p Name of the property.
 */
let getOwnPropertyDescriptor;
/**
 * Returns the names of the own properties of an object. The own properties of an object are those that are defined directly
 * on that object, and are not inherited from the object's prototype. The properties of an object include both fields (objects) and functions.
 * @param o Object that contains the own properties.
 */
let getOwnPropertyNames;
/**
 * Returns an array of all symbol properties found directly on object o.
 * @param o Object to retrieve the symbols from.
 */
let getOwnPropertySymbols;
/**
 * Returns true if the values are the same value, false otherwise.
 * @param value1 The first value.
 * @param value2 The second value.
 */
let is;
/**
 * Returns the names of the enumerable properties and methods of an object.
 * @param o Object that contains the properties and methods. This can be an object that you created or an existing Document Object Model (DOM) object.
 */
let keys;
/* ES7 Object static methods */
let getOwnPropertyDescriptors;
let entries;
let values;
if (true) {
    const globalObject = __WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].Object;
    assign = globalObject.assign;
    getOwnPropertyDescriptor = globalObject.getOwnPropertyDescriptor;
    getOwnPropertyNames = globalObject.getOwnPropertyNames;
    getOwnPropertySymbols = globalObject.getOwnPropertySymbols;
    is = globalObject.is;
    keys = globalObject.keys;
}
else {
    keys = function symbolAwareKeys(o) {
        return Object.keys(o).filter((key) => !Boolean(key.match(/^@@.+/)));
    };
    assign = function assign(target, ...sources) {
        if (target == null) {
            // TypeError if undefined or null
            throw new TypeError('Cannot convert undefined or null to object');
        }
        const to = Object(target);
        sources.forEach((nextSource) => {
            if (nextSource) {
                // Skip over if undefined or null
                keys(nextSource).forEach((nextKey) => {
                    to[nextKey] = nextSource[nextKey];
                });
            }
        });
        return to;
    };
    getOwnPropertyDescriptor = function (o, prop) {
        if (isSymbol(prop)) {
            return Object.getOwnPropertyDescriptor(o, prop);
        }
        else {
            return Object.getOwnPropertyDescriptor(o, prop);
        }
    };
    getOwnPropertyNames = function getOwnPropertyNames(o) {
        return Object.getOwnPropertyNames(o).filter((key) => !Boolean(key.match(/^@@.+/)));
    };
    getOwnPropertySymbols = function getOwnPropertySymbols(o) {
        return Object.getOwnPropertyNames(o)
            .filter((key) => Boolean(key.match(/^@@.+/)))
            .map((key) => Symbol.for(key.substring(2)));
    };
    is = function is(value1, value2) {
        if (value1 === value2) {
            return value1 !== 0 || 1 / value1 === 1 / value2; // -0
        }
        return value1 !== value1 && value2 !== value2; // NaN
    };
}
if (true) {
    const globalObject = __WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].Object;
    getOwnPropertyDescriptors = globalObject.getOwnPropertyDescriptors;
    entries = globalObject.entries;
    values = globalObject.values;
}
else {
    getOwnPropertyDescriptors = function getOwnPropertyDescriptors(o) {
        return getOwnPropertyNames(o).reduce((previous, key) => {
            previous[key] = getOwnPropertyDescriptor(o, key);
            return previous;
        }, {});
    };
    entries = function entries(o) {
        return keys(o).map((key) => [key, o[key]]);
    };
    values = function values(o) {
        return keys(o).map((key) => o[key]);
    };
}


/***/ }),

/***/ "./node_modules/@dojo/framework/shim/string.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export fromCodePoint */
/* unused harmony export raw */
/* unused harmony export codePointAt */
/* unused harmony export endsWith */
/* unused harmony export includes */
/* unused harmony export normalize */
/* unused harmony export repeat */
/* unused harmony export startsWith */
/* unused harmony export padEnd */
/* unused harmony export padStart */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__global__ = __webpack_require__("./node_modules/@dojo/framework/shim/global.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__support_has__ = __webpack_require__("./node_modules/@dojo/framework/shim/support/has.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__support_util__ = __webpack_require__("./node_modules/@dojo/framework/shim/support/util.mjs");



/**
 * The minimum location of high surrogates
 */
const HIGH_SURROGATE_MIN = 0xd800;
/* harmony export (immutable) */ __webpack_exports__["b"] = HIGH_SURROGATE_MIN;

/**
 * The maximum location of high surrogates
 */
const HIGH_SURROGATE_MAX = 0xdbff;
/* harmony export (immutable) */ __webpack_exports__["a"] = HIGH_SURROGATE_MAX;

/**
 * The minimum location of low surrogates
 */
const LOW_SURROGATE_MIN = 0xdc00;
/* unused harmony export LOW_SURROGATE_MIN */

/**
 * The maximum location of low surrogates
 */
const LOW_SURROGATE_MAX = 0xdfff;
/* unused harmony export LOW_SURROGATE_MAX */

/* ES6 static methods */
/**
 * Return the String value whose elements are, in order, the elements in the List elements.
 * If length is 0, the empty string is returned.
 * @param codePoints The code points to generate the string
 */
let fromCodePoint;
/**
 * `raw` is intended for use as a tag function of a Tagged Template String. When called
 * as such the first argument will be a well formed template call site object and the rest
 * parameter will contain the substitution values.
 * @param template A well-formed template string call site representation.
 * @param substitutions A set of substitution values.
 */
let raw;
/* ES6 instance methods */
/**
 * Returns a nonnegative integer Number less than 1114112 (0x110000) that is the code point
 * value of the UTF-16 encoded code point starting at the string element at position pos in
 * the String resulting from converting this object to a String.
 * If there is no element at that position, the result is undefined.
 * If a valid UTF-16 surrogate pair does not begin at pos, the result is the code unit at pos.
 */
let codePointAt;
/**
 * Returns true if the sequence of elements of searchString converted to a String is the
 * same as the corresponding elements of this object (converted to a String) starting at
 * endPosition – length(this). Otherwise returns false.
 */
let endsWith;
/**
 * Returns true if searchString appears as a substring of the result of converting this
 * object to a String, at one or more positions that are
 * greater than or equal to position; otherwise, returns false.
 * @param target The target string
 * @param searchString search string
 * @param position If position is undefined, 0 is assumed, so as to search all of the String.
 */
let includes;
/**
 * Returns the String value result of normalizing the string into the normalization form
 * named by form as specified in Unicode Standard Annex #15, Unicode Normalization Forms.
 * @param target The target string
 * @param form Applicable values: "NFC", "NFD", "NFKC", or "NFKD", If not specified default
 * is "NFC"
 */
let normalize;
/**
 * Returns a String value that is made from count copies appended together. If count is 0,
 * T is the empty String is returned.
 * @param count number of copies to append
 */
let repeat;
/**
 * Returns true if the sequence of elements of searchString converted to a String is the
 * same as the corresponding elements of this object (converted to a String) starting at
 * position. Otherwise returns false.
 */
let startsWith;
/* ES7 instance methods */
/**
 * Pads the current string with a given string (possibly repeated) so that the resulting string reaches a given length.
 * The padding is applied from the end (right) of the current string.
 *
 * @param target The target string
 * @param maxLength The length of the resulting string once the current string has been padded.
 *        If this parameter is smaller than the current string's length, the current string will be returned as it is.
 *
 * @param fillString The string to pad the current string with.
 *        If this string is too long, it will be truncated and the left-most part will be applied.
 *        The default value for this parameter is " " (U+0020).
 */
let padEnd;
/**
 * Pads the current string with a given string (possibly repeated) so that the resulting string reaches a given length.
 * The padding is applied from the start (left) of the current string.
 *
 * @param target The target string
 * @param maxLength The length of the resulting string once the current string has been padded.
 *        If this parameter is smaller than the current string's length, the current string will be returned as it is.
 *
 * @param fillString The string to pad the current string with.
 *        If this string is too long, it will be truncated and the left-most part will be applied.
 *        The default value for this parameter is " " (U+0020).
 */
let padStart;
if (true) {
    fromCodePoint = __WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].String.fromCodePoint;
    raw = __WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].String.raw;
    codePointAt = Object(__WEBPACK_IMPORTED_MODULE_2__support_util__["b" /* wrapNative */])(__WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].String.prototype.codePointAt);
    endsWith = Object(__WEBPACK_IMPORTED_MODULE_2__support_util__["b" /* wrapNative */])(__WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].String.prototype.endsWith);
    includes = Object(__WEBPACK_IMPORTED_MODULE_2__support_util__["b" /* wrapNative */])(__WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].String.prototype.includes);
    normalize = Object(__WEBPACK_IMPORTED_MODULE_2__support_util__["b" /* wrapNative */])(__WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].String.prototype.normalize);
    repeat = Object(__WEBPACK_IMPORTED_MODULE_2__support_util__["b" /* wrapNative */])(__WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].String.prototype.repeat);
    startsWith = Object(__WEBPACK_IMPORTED_MODULE_2__support_util__["b" /* wrapNative */])(__WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].String.prototype.startsWith);
}
else {
    /**
     * Validates that text is defined, and normalizes position (based on the given default if the input is NaN).
     * Used by startsWith, includes, and endsWith.
     *
     * @return Normalized position.
     */
    const normalizeSubstringArgs = function (name, text, search, position, isEnd = false) {
        if (text == null) {
            throw new TypeError('string.' + name + ' requires a valid string to search against.');
        }
        const length = text.length;
        position = position !== position ? (isEnd ? length : 0) : position;
        return [text, String(search), Math.min(Math.max(position, 0), length)];
    };
    fromCodePoint = function fromCodePoint(...codePoints) {
        // Adapted from https://github.com/mathiasbynens/String.fromCodePoint
        const length = arguments.length;
        if (!length) {
            return '';
        }
        const fromCharCode = String.fromCharCode;
        const MAX_SIZE = 0x4000;
        let codeUnits = [];
        let index = -1;
        let result = '';
        while (++index < length) {
            let codePoint = Number(arguments[index]);
            // Code points must be finite integers within the valid range
            let isValid = isFinite(codePoint) && Math.floor(codePoint) === codePoint && codePoint >= 0 && codePoint <= 0x10ffff;
            if (!isValid) {
                throw RangeError('string.fromCodePoint: Invalid code point ' + codePoint);
            }
            if (codePoint <= 0xffff) {
                // BMP code point
                codeUnits.push(codePoint);
            }
            else {
                // Astral code point; split in surrogate halves
                // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
                codePoint -= 0x10000;
                let highSurrogate = (codePoint >> 10) + HIGH_SURROGATE_MIN;
                let lowSurrogate = (codePoint % 0x400) + LOW_SURROGATE_MIN;
                codeUnits.push(highSurrogate, lowSurrogate);
            }
            if (index + 1 === length || codeUnits.length > MAX_SIZE) {
                result += fromCharCode.apply(null, codeUnits);
                codeUnits.length = 0;
            }
        }
        return result;
    };
    raw = function raw(callSite, ...substitutions) {
        let rawStrings = callSite.raw;
        let result = '';
        let numSubstitutions = substitutions.length;
        if (callSite == null || callSite.raw == null) {
            throw new TypeError('string.raw requires a valid callSite object with a raw value');
        }
        for (let i = 0, length = rawStrings.length; i < length; i++) {
            result += rawStrings[i] + (i < numSubstitutions && i < length - 1 ? substitutions[i] : '');
        }
        return result;
    };
    codePointAt = function codePointAt(text, position = 0) {
        // Adapted from https://github.com/mathiasbynens/String.prototype.codePointAt
        if (text == null) {
            throw new TypeError('string.codePointAt requries a valid string.');
        }
        const length = text.length;
        if (position !== position) {
            position = 0;
        }
        if (position < 0 || position >= length) {
            return undefined;
        }
        // Get the first code unit
        const first = text.charCodeAt(position);
        if (first >= HIGH_SURROGATE_MIN && first <= HIGH_SURROGATE_MAX && length > position + 1) {
            // Start of a surrogate pair (high surrogate and there is a next code unit); check for low surrogate
            // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
            const second = text.charCodeAt(position + 1);
            if (second >= LOW_SURROGATE_MIN && second <= LOW_SURROGATE_MAX) {
                return (first - HIGH_SURROGATE_MIN) * 0x400 + second - LOW_SURROGATE_MIN + 0x10000;
            }
        }
        return first;
    };
    endsWith = function endsWith(text, search, endPosition) {
        if (search === '') {
            return true;
        }
        if (typeof endPosition === 'undefined') {
            endPosition = text.length;
        }
        else if (endPosition === null || isNaN(endPosition)) {
            return false;
        }
        [text, search, endPosition] = normalizeSubstringArgs('endsWith', text, search, endPosition, true);
        const start = endPosition - search.length;
        if (start < 0) {
            return false;
        }
        return text.slice(start, endPosition) === search;
    };
    includes = function includes(text, search, position = 0) {
        [text, search, position] = normalizeSubstringArgs('includes', text, search, position);
        return text.indexOf(search, position) !== -1;
    };
    repeat = function repeat(text, count = 0) {
        // Adapted from https://github.com/mathiasbynens/String.prototype.repeat
        if (text == null) {
            throw new TypeError('string.repeat requires a valid string.');
        }
        if (count !== count) {
            count = 0;
        }
        if (count < 0 || count === Infinity) {
            throw new RangeError('string.repeat requires a non-negative finite count.');
        }
        let result = '';
        while (count) {
            if (count % 2) {
                result += text;
            }
            if (count > 1) {
                text += text;
            }
            count >>= 1;
        }
        return result;
    };
    startsWith = function startsWith(text, search, position = 0) {
        search = String(search);
        [text, search, position] = normalizeSubstringArgs('startsWith', text, search, position);
        const end = position + search.length;
        if (end > text.length) {
            return false;
        }
        return text.slice(position, end) === search;
    };
}
if (true) {
    padEnd = Object(__WEBPACK_IMPORTED_MODULE_2__support_util__["b" /* wrapNative */])(__WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].String.prototype.padEnd);
    padStart = Object(__WEBPACK_IMPORTED_MODULE_2__support_util__["b" /* wrapNative */])(__WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].String.prototype.padStart);
}
else {
    padEnd = function padEnd(text, maxLength, fillString = ' ') {
        if (text === null || text === undefined) {
            throw new TypeError('string.repeat requires a valid string.');
        }
        if (maxLength === Infinity) {
            throw new RangeError('string.padEnd requires a non-negative finite count.');
        }
        if (maxLength === null || maxLength === undefined || maxLength < 0) {
            maxLength = 0;
        }
        let strText = String(text);
        const padding = maxLength - strText.length;
        if (padding > 0) {
            strText +=
                repeat(fillString, Math.floor(padding / fillString.length)) +
                    fillString.slice(0, padding % fillString.length);
        }
        return strText;
    };
    padStart = function padStart(text, maxLength, fillString = ' ') {
        if (text === null || text === undefined) {
            throw new TypeError('string.repeat requires a valid string.');
        }
        if (maxLength === Infinity) {
            throw new RangeError('string.padStart requires a non-negative finite count.');
        }
        if (maxLength === null || maxLength === undefined || maxLength < 0) {
            maxLength = 0;
        }
        let strText = String(text);
        const padding = maxLength - strText.length;
        if (padding > 0) {
            strText =
                repeat(fillString, Math.floor(padding / fillString.length)) +
                    fillString.slice(0, padding % fillString.length) +
                    strText;
        }
        return strText;
    };
}


/***/ }),

/***/ "./node_modules/@dojo/framework/shim/support/has.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__has_has__ = __webpack_require__("./node_modules/@dojo/framework/has/has.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__global__ = __webpack_require__("./node_modules/@dojo/framework/shim/global.mjs");
/* unused harmony reexport namespace */


/* unused harmony default export */ var _unused_webpack_default_export = (__WEBPACK_IMPORTED_MODULE_0__has_has__["default"]);

/* ECMAScript 6 and 7 Features */
/* Array */
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('es6-array', () => {
    return (['from', 'of'].every((key) => key in __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Array) &&
        ['findIndex', 'find', 'copyWithin'].every((key) => key in __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Array.prototype));
}, true);
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('es6-array-fill', () => {
    if ('fill' in __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Array.prototype) {
        /* Some versions of Safari do not properly implement this */
        return [1].fill(9, Number.POSITIVE_INFINITY)[0] === 1;
    }
    return false;
}, true);
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('es7-array', () => 'includes' in __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Array.prototype, true);
/* Map */
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('es6-map', () => {
    if (typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Map === 'function') {
        /*
    IE11 and older versions of Safari are missing critical ES6 Map functionality
    We wrap this in a try/catch because sometimes the Map constructor exists, but does not
    take arguments (iOS 8.4)
     */
        try {
            const map = new __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Map([[0, 1]]);
            return map.has(0) &&
                typeof map.keys === 'function' &&
                true &&
                typeof map.values === 'function' &&
                typeof map.entries === 'function';
        }
        catch (e) {
            /* istanbul ignore next: not testing on iOS at the moment */
            return false;
        }
    }
    return false;
}, true);
/* Math */
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('es6-math', () => {
    return [
        'clz32',
        'sign',
        'log10',
        'log2',
        'log1p',
        'expm1',
        'cosh',
        'sinh',
        'tanh',
        'acosh',
        'asinh',
        'atanh',
        'trunc',
        'fround',
        'cbrt',
        'hypot'
    ].every((name) => typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Math[name] === 'function');
}, true);
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('es6-math-imul', () => {
    if ('imul' in __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Math) {
        /* Some versions of Safari on ios do not properly implement this */
        return Math.imul(0xffffffff, 5) === -5;
    }
    return false;
}, true);
/* Object */
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('es6-object', () => {
    return true &&
        ['assign', 'is', 'getOwnPropertySymbols', 'setPrototypeOf'].every((name) => typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Object[name] === 'function');
}, true);
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('es2017-object', () => {
    return ['values', 'entries', 'getOwnPropertyDescriptors'].every((name) => typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Object[name] === 'function');
}, true);
/* Observable */
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('es-observable', () => typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Observable !== 'undefined', true);
/* Promise */
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('es6-promise', () => typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Promise !== 'undefined' && true, true);
/* Set */
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('es6-set', () => {
    if (typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Set === 'function') {
        /* IE11 and older versions of Safari are missing critical ES6 Set functionality */
        const set = new __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Set([1]);
        return set.has(1) && 'keys' in set && typeof set.keys === 'function' && true;
    }
    return false;
}, true);
/* String */
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('es6-string', () => {
    return ([
        /* static methods */
        'fromCodePoint'
    ].every((key) => typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].String[key] === 'function') &&
        [
            /* instance methods */
            'codePointAt',
            'normalize',
            'repeat',
            'startsWith',
            'endsWith',
            'includes'
        ].every((key) => typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].String.prototype[key] === 'function'));
}, true);
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('es6-string-raw', () => {
    function getCallSite(callSite, ...substitutions) {
        const result = [...callSite];
        result.raw = callSite.raw;
        return result;
    }
    if ('raw' in __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].String) {
        let b = 1;
        let callSite = getCallSite `a\n${b}`;
        callSite.raw = ['a\\n'];
        const supportsTrunc = __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].String.raw(callSite, 42) === 'a\\n';
        return supportsTrunc;
    }
    return false;
}, true);
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('es2017-string', () => {
    return ['padStart', 'padEnd'].every((key) => typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].String.prototype[key] === 'function');
}, true);
/* Symbol */
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('es6-symbol', () => typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Symbol !== 'undefined' && typeof Symbol() === 'symbol', true);
/* WeakMap */
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('es6-weakmap', () => {
    if (typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].WeakMap !== 'undefined') {
        /* IE11 and older versions of Safari are missing critical ES6 Map functionality */
        const key1 = {};
        const key2 = {};
        const map = new __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].WeakMap([[key1, 1]]);
        Object.freeze(key1);
        return map.get(key1) === 1 && map.set(key2, 2) === map && true;
    }
    return false;
}, true);
/* Miscellaneous features */
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('microtasks', () => true || false || true, true);
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('postmessage', () => {
    // If window is undefined, and we have postMessage, it probably means we're in a web worker. Web workers have
    // post message but it doesn't work how we expect it to, so it's best just to pretend it doesn't exist.
    return typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].window !== 'undefined' && typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].postMessage === 'function';
}, true);
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('raf', () => typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].requestAnimationFrame === 'function', true);
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('setimmediate', () => typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].setImmediate !== 'undefined', true);
/* DOM Features */
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('dom-mutationobserver', () => {
    if (true && Boolean(__WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].MutationObserver || __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].WebKitMutationObserver)) {
        // IE11 has an unreliable MutationObserver implementation where setProperty() does not
        // generate a mutation event, observers can crash, and the queue does not drain
        // reliably. The following feature test was adapted from
        // https://gist.github.com/t10ko/4aceb8c71681fdb275e33efe5e576b14
        const example = document.createElement('div');
        /* tslint:disable-next-line:variable-name */
        const HostMutationObserver = __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].MutationObserver || __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].WebKitMutationObserver;
        const observer = new HostMutationObserver(function () { });
        observer.observe(example, { attributes: true });
        example.style.setProperty('display', 'block');
        return Boolean(observer.takeRecords().length);
    }
    return false;
}, true);
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('dom-webanimation', () => true && __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Animation !== undefined && __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].KeyframeEffect !== undefined, true);
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('abort-controller', () => typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].AbortController !== 'undefined');
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('abort-signal', () => typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].AbortSignal !== 'undefined');


/***/ }),

/***/ "./node_modules/@dojo/framework/shim/support/queue.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export queueMicroTask */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__global__ = __webpack_require__("./node_modules/@dojo/framework/shim/global.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__has__ = __webpack_require__("./node_modules/@dojo/framework/shim/support/has.mjs");


function executeTask(item) {
    if (item && item.isActive && item.callback) {
        item.callback();
    }
}
function getQueueHandle(item, destructor) {
    return {
        destroy: function () {
            this.destroy = function () { };
            item.isActive = false;
            item.callback = null;
            if (destructor) {
                destructor();
            }
        }
    };
}
let checkMicroTaskQueue;
let microTasks;
/**
 * Schedules a callback to the macrotask queue.
 *
 * @param callback the function to be queued and later executed.
 * @returns An object with a `destroy` method that, when called, prevents the registered callback from executing.
 */
const queueTask = (function () {
    let destructor;
    let enqueue;
    // Since the IE implementation of `setImmediate` is not flawless, we will test for `postMessage` first.
    if (true) {
        const queue = [];
        __WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].addEventListener('message', function (event) {
            // Confirm that the event was triggered by the current window and by this particular implementation.
            if (event.source === __WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */] && event.data === 'dojo-queue-message') {
                event.stopPropagation();
                if (queue.length) {
                    executeTask(queue.shift());
                }
            }
        });
        enqueue = function (item) {
            queue.push(item);
            __WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].postMessage('dojo-queue-message', '*');
        };
    }
    else if (false) {
        destructor = global.clearImmediate;
        enqueue = function (item) {
            return setImmediate(executeTask.bind(null, item));
        };
    }
    else {
        destructor = global.clearTimeout;
        enqueue = function (item) {
            return setTimeout(executeTask.bind(null, item), 0);
        };
    }
    function queueTask(callback) {
        const item = {
            isActive: true,
            callback: callback
        };
        const id = enqueue(item);
        return getQueueHandle(item, destructor &&
            function () {
                destructor(id);
            });
    }
    // TODO: Use aspect.before when it is available.
    return true
        ? queueTask
        : function (callback) {
            checkMicroTaskQueue();
            return queueTask(callback);
        };
})();
/* unused harmony export queueTask */

// When no mechanism for registering microtasks is exposed by the environment, microtasks will
// be queued and then executed in a single macrotask before the other macrotasks are executed.
if (false) {
    let isMicroTaskQueued = false;
    microTasks = [];
    checkMicroTaskQueue = function () {
        if (!isMicroTaskQueued) {
            isMicroTaskQueued = true;
            queueTask(function () {
                isMicroTaskQueued = false;
                if (microTasks.length) {
                    let item;
                    while ((item = microTasks.shift())) {
                        executeTask(item);
                    }
                }
            });
        }
    };
}
/**
 * Schedules an animation task with `window.requestAnimationFrame` if it exists, or with `queueTask` otherwise.
 *
 * Since requestAnimationFrame's behavior does not match that expected from `queueTask`, it is not used there.
 * However, at times it makes more sense to delegate to requestAnimationFrame; hence the following method.
 *
 * @param callback the function to be queued and later executed.
 * @returns An object with a `destroy` method that, when called, prevents the registered callback from executing.
 */
const queueAnimationTask = (function () {
    if (false) {
        return queueTask;
    }
    function queueAnimationTask(callback) {
        const item = {
            isActive: true,
            callback: callback
        };
        const rafId = requestAnimationFrame(executeTask.bind(null, item));
        return getQueueHandle(item, function () {
            cancelAnimationFrame(rafId);
        });
    }
    // TODO: Use aspect.before when it is available.
    return true
        ? queueAnimationTask
        : function (callback) {
            checkMicroTaskQueue();
            return queueAnimationTask(callback);
        };
})();
/* unused harmony export queueAnimationTask */

/**
 * Schedules a callback to the microtask queue.
 *
 * Any callbacks registered with `queueMicroTask` will be executed before the next macrotask. If no native
 * mechanism for scheduling macrotasks is exposed, then any callbacks will be fired before any macrotask
 * registered with `queueTask` or `queueAnimationTask`.
 *
 * @param callback the function to be queued and later executed.
 * @returns An object with a `destroy` method that, when called, prevents the registered callback from executing.
 */
let queueMicroTask = (function () {
    let enqueue;
    if (false) {
        enqueue = function (item) {
            global.process.nextTick(executeTask.bind(null, item));
        };
    }
    else if (true) {
        enqueue = function (item) {
            __WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].Promise.resolve(item).then(executeTask);
        };
    }
    else if (true) {
        /* tslint:disable-next-line:variable-name */
        const HostMutationObserver = global.MutationObserver || global.WebKitMutationObserver;
        const node = document.createElement('div');
        const queue = [];
        const observer = new HostMutationObserver(function () {
            while (queue.length > 0) {
                const item = queue.shift();
                if (item && item.isActive && item.callback) {
                    item.callback();
                }
            }
        });
        observer.observe(node, { attributes: true });
        enqueue = function (item) {
            queue.push(item);
            node.setAttribute('queueStatus', '1');
        };
    }
    else {
        enqueue = function (item) {
            checkMicroTaskQueue();
            microTasks.push(item);
        };
    }
    return function (callback) {
        const item = {
            isActive: true,
            callback: callback
        };
        enqueue(item);
        return getQueueHandle(item);
    };
})();


/***/ }),

/***/ "./node_modules/@dojo/framework/shim/support/util.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = getValueDescriptor;
/* harmony export (immutable) */ __webpack_exports__["b"] = wrapNative;
/**
 * Helper function to generate a value property descriptor
 *
 * @param value        The value the property descriptor should be set to
 * @param enumerable   If the property should be enumberable, defaults to false
 * @param writable     If the property should be writable, defaults to true
 * @param configurable If the property should be configurable, defaults to true
 * @return             The property descriptor object
 */
function getValueDescriptor(value, enumerable = false, writable = true, configurable = true) {
    return {
        value: value,
        enumerable: enumerable,
        writable: writable,
        configurable: configurable
    };
}
function wrapNative(nativeFunction) {
    return function (target, ...args) {
        return nativeFunction.apply(target, args);
    };
}


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/Injector.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__core_Evented__ = __webpack_require__("./node_modules/@dojo/framework/core/Evented.mjs");

class Injector extends __WEBPACK_IMPORTED_MODULE_0__core_Evented__["a" /* Evented */] {
    constructor(payload) {
        super();
        this._payload = payload;
    }
    setInvalidator(invalidator) {
        this._invalidator = invalidator;
    }
    get() {
        return this._payload;
    }
    set(payload) {
        this._payload = payload;
        if (this._invalidator) {
            this._invalidator();
        }
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Injector;

/* unused harmony default export */ var _unused_webpack_default_export = (Injector);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/NodeHandler.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export NodeEventType */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__core_Evented__ = __webpack_require__("./node_modules/@dojo/framework/core/Evented.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__shim_Map__ = __webpack_require__("./node_modules/@dojo/framework/shim/Map.mjs");


/**
 * Enum to identify the type of event.
 * Listening to 'Projector' will notify when projector is created or updated
 * Listening to 'Widget' will notify when widget root is created or updated
 */
var NodeEventType;
(function (NodeEventType) {
    NodeEventType["Projector"] = "Projector";
    NodeEventType["Widget"] = "Widget";
})(NodeEventType || (NodeEventType = {}));
class NodeHandler extends __WEBPACK_IMPORTED_MODULE_0__core_Evented__["a" /* Evented */] {
    constructor() {
        super(...arguments);
        this._nodeMap = new __WEBPACK_IMPORTED_MODULE_1__shim_Map__["b" /* default */]();
    }
    get(key) {
        return this._nodeMap.get(key);
    }
    has(key) {
        return this._nodeMap.has(key);
    }
    add(element, key) {
        this._nodeMap.set(key, element);
        this.emit({ type: key });
    }
    addRoot() {
        this.emit({ type: NodeEventType.Widget });
    }
    addProjector() {
        this.emit({ type: NodeEventType.Projector });
    }
    clear() {
        this._nodeMap.clear();
    }
}
/* unused harmony export NodeHandler */

/* harmony default export */ __webpack_exports__["a"] = (NodeHandler);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/Registry.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["d"] = isWidgetBaseConstructor;
/* unused harmony export isWidgetConstructorDefaultExport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__shim_Promise__ = __webpack_require__("./node_modules/@dojo/framework/shim/Promise.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__shim_Map__ = __webpack_require__("./node_modules/@dojo/framework/shim/Map.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__core_Evented__ = __webpack_require__("./node_modules/@dojo/framework/core/Evented.mjs");



/**
 * Widget base type
 */
const WIDGET_BASE_TYPE = '__widget_base_type';
/* harmony export (immutable) */ __webpack_exports__["b"] = WIDGET_BASE_TYPE;

/**
 * Checks is the item is a subclass of WidgetBase (or a WidgetBase)
 *
 * @param item the item to check
 * @returns true/false indicating if the item is a WidgetBaseConstructor
 */
function isWidgetBaseConstructor(item) {
    return Boolean(item && item._type === WIDGET_BASE_TYPE);
}
function isWidgetConstructorDefaultExport(item) {
    return Boolean(item &&
        item.hasOwnProperty('__esModule') &&
        item.hasOwnProperty('default') &&
        isWidgetBaseConstructor(item.default));
}
/**
 * The Registry implementation
 */
class Registry extends __WEBPACK_IMPORTED_MODULE_2__core_Evented__["a" /* Evented */] {
    /**
     * Emit loaded event for registry label
     */
    emitLoadedEvent(widgetLabel, item) {
        this.emit({
            type: widgetLabel,
            action: 'loaded',
            item
        });
    }
    define(label, item) {
        if (this._widgetRegistry === undefined) {
            this._widgetRegistry = new __WEBPACK_IMPORTED_MODULE_1__shim_Map__["b" /* default */]();
        }
        if (this._widgetRegistry.has(label)) {
            throw new Error(`widget has already been registered for '${label.toString()}'`);
        }
        this._widgetRegistry.set(label, item);
        if (item instanceof __WEBPACK_IMPORTED_MODULE_0__shim_Promise__["a" /* default */]) {
            item.then((widgetCtor) => {
                this._widgetRegistry.set(label, widgetCtor);
                this.emitLoadedEvent(label, widgetCtor);
                return widgetCtor;
            }, (error) => {
                throw error;
            });
        }
        else if (isWidgetBaseConstructor(item)) {
            this.emitLoadedEvent(label, item);
        }
    }
    defineInjector(label, injectorFactory) {
        if (this._injectorRegistry === undefined) {
            this._injectorRegistry = new __WEBPACK_IMPORTED_MODULE_1__shim_Map__["b" /* default */]();
        }
        if (this._injectorRegistry.has(label)) {
            throw new Error(`injector has already been registered for '${label.toString()}'`);
        }
        const invalidator = new __WEBPACK_IMPORTED_MODULE_2__core_Evented__["a" /* Evented */]();
        const injectorItem = {
            injector: injectorFactory(() => invalidator.emit({ type: 'invalidate' })),
            invalidator
        };
        this._injectorRegistry.set(label, injectorItem);
        this.emitLoadedEvent(label, injectorItem);
    }
    get(label) {
        if (!this._widgetRegistry || !this.has(label)) {
            return null;
        }
        const item = this._widgetRegistry.get(label);
        if (isWidgetBaseConstructor(item)) {
            return item;
        }
        if (item instanceof __WEBPACK_IMPORTED_MODULE_0__shim_Promise__["a" /* default */]) {
            return null;
        }
        const promise = item();
        this._widgetRegistry.set(label, promise);
        promise.then((widgetCtor) => {
            if (isWidgetConstructorDefaultExport(widgetCtor)) {
                widgetCtor = widgetCtor.default;
            }
            this._widgetRegistry.set(label, widgetCtor);
            this.emitLoadedEvent(label, widgetCtor);
            return widgetCtor;
        }, (error) => {
            throw error;
        });
        return null;
    }
    getInjector(label) {
        if (!this._injectorRegistry || !this.hasInjector(label)) {
            return null;
        }
        return this._injectorRegistry.get(label);
    }
    has(label) {
        return Boolean(this._widgetRegistry && this._widgetRegistry.has(label));
    }
    hasInjector(label) {
        return Boolean(this._injectorRegistry && this._injectorRegistry.has(label));
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Registry;

/* harmony default export */ __webpack_exports__["c"] = (Registry);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/RegistryHandler.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__shim_Map__ = __webpack_require__("./node_modules/@dojo/framework/shim/Map.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__core_Evented__ = __webpack_require__("./node_modules/@dojo/framework/core/Evented.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Registry__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/Registry.mjs");



class RegistryHandler extends __WEBPACK_IMPORTED_MODULE_1__core_Evented__["a" /* Evented */] {
    constructor() {
        super();
        this._registry = new __WEBPACK_IMPORTED_MODULE_2__Registry__["a" /* Registry */]();
        this._registryWidgetLabelMap = new __WEBPACK_IMPORTED_MODULE_0__shim_Map__["a" /* Map */]();
        this._registryInjectorLabelMap = new __WEBPACK_IMPORTED_MODULE_0__shim_Map__["a" /* Map */]();
        this.own(this._registry);
        const destroy = () => {
            if (this.baseRegistry) {
                this._registryWidgetLabelMap.delete(this.baseRegistry);
                this._registryInjectorLabelMap.delete(this.baseRegistry);
                this.baseRegistry = undefined;
            }
        };
        this.own({ destroy });
    }
    set base(baseRegistry) {
        if (this.baseRegistry) {
            this._registryWidgetLabelMap.delete(this.baseRegistry);
            this._registryInjectorLabelMap.delete(this.baseRegistry);
        }
        this.baseRegistry = baseRegistry;
    }
    define(label, widget) {
        this._registry.define(label, widget);
    }
    defineInjector(label, injector) {
        this._registry.defineInjector(label, injector);
    }
    has(label) {
        return this._registry.has(label) || Boolean(this.baseRegistry && this.baseRegistry.has(label));
    }
    hasInjector(label) {
        return this._registry.hasInjector(label) || Boolean(this.baseRegistry && this.baseRegistry.hasInjector(label));
    }
    get(label, globalPrecedence = false) {
        return this._get(label, globalPrecedence, 'get', this._registryWidgetLabelMap);
    }
    getInjector(label, globalPrecedence = false) {
        return this._get(label, globalPrecedence, 'getInjector', this._registryInjectorLabelMap);
    }
    _get(label, globalPrecedence, getFunctionName, labelMap) {
        const registries = globalPrecedence ? [this.baseRegistry, this._registry] : [this._registry, this.baseRegistry];
        for (let i = 0; i < registries.length; i++) {
            const registry = registries[i];
            if (!registry) {
                continue;
            }
            const item = registry[getFunctionName](label);
            const registeredLabels = labelMap.get(registry) || [];
            if (item) {
                return item;
            }
            else if (registeredLabels.indexOf(label) === -1) {
                const handle = registry.on(label, (event) => {
                    if (event.action === 'loaded' &&
                        this[getFunctionName](label, globalPrecedence) === event.item) {
                        this.emit({ type: 'invalidate' });
                    }
                });
                this.own(handle);
                labelMap.set(registry, [...registeredLabels, label]);
            }
        }
        return null;
    }
}
/* unused harmony export RegistryHandler */

/* harmony default export */ __webpack_exports__["a"] = (RegistryHandler);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/WidgetBase.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__shim_Map__ = __webpack_require__("./node_modules/@dojo/framework/shim/Map.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__shim_WeakMap__ = __webpack_require__("./node_modules/@dojo/framework/shim/WeakMap.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__d__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/d.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__diff__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/diff.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__RegistryHandler__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/RegistryHandler.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__NodeHandler__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/NodeHandler.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__Registry__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/Registry.mjs");







let lazyWidgetId = 0;
const lazyWidgetIdMap = new __WEBPACK_IMPORTED_MODULE_1__shim_WeakMap__["b" /* default */]();
const decoratorMap = new __WEBPACK_IMPORTED_MODULE_0__shim_Map__["b" /* default */]();
const widgetInstanceMap = new __WEBPACK_IMPORTED_MODULE_1__shim_WeakMap__["b" /* default */]();
/* harmony export (immutable) */ __webpack_exports__["d"] = widgetInstanceMap;

const boundAuto = __WEBPACK_IMPORTED_MODULE_3__diff__["a" /* auto */].bind(null);
const noBind = '__dojo_no_bind';
/* harmony export (immutable) */ __webpack_exports__["c"] = noBind;

function toTextVNode(data) {
    return {
        tag: '',
        properties: {},
        children: undefined,
        text: `${data}`,
        type: __WEBPACK_IMPORTED_MODULE_2__d__["a" /* VNODE */]
    };
}
function isLazyDefine(item) {
    return Boolean(item && item.label);
}
/**
 * Main widget base for all widgets to extend
 */
class WidgetBase {
    /**
     * @constructor
     */
    constructor() {
        /**
         * Indicates if it is the initial set properties cycle
         */
        this._initialProperties = true;
        /**
         * Array of property keys considered changed from the previous set properties
         */
        this._changedPropertyKeys = [];
        this._nodeHandler = new __WEBPACK_IMPORTED_MODULE_5__NodeHandler__["a" /* default */]();
        this._handles = [];
        this._children = [];
        this._decoratorCache = new __WEBPACK_IMPORTED_MODULE_0__shim_Map__["b" /* default */]();
        this._properties = {};
        this._boundRenderFunc = this.render.bind(this);
        this._boundInvalidate = this.invalidate.bind(this);
        widgetInstanceMap.set(this, {
            dirty: true,
            onAttach: () => {
                this.onAttach();
            },
            onDetach: () => {
                this.onDetach();
                this.destroy();
            },
            nodeHandler: this._nodeHandler,
            rendering: false,
            inputProperties: {}
        });
        this.own({
            destroy: () => {
                widgetInstanceMap.delete(this);
                this._nodeHandler.clear();
                this._nodeHandler.destroy();
            }
        });
        this._runAfterConstructors();
    }
    meta(MetaType) {
        if (this._metaMap === undefined) {
            this._metaMap = new __WEBPACK_IMPORTED_MODULE_0__shim_Map__["b" /* default */]();
        }
        let cached = this._metaMap.get(MetaType);
        if (!cached) {
            cached = new MetaType({
                invalidate: this._boundInvalidate,
                nodeHandler: this._nodeHandler,
                bind: this
            });
            this.own(cached);
            this._metaMap.set(MetaType, cached);
        }
        return cached;
    }
    onAttach() {
        // Do nothing by default.
    }
    onDetach() {
        // Do nothing by default.
    }
    get properties() {
        return this._properties;
    }
    get changedPropertyKeys() {
        return [...this._changedPropertyKeys];
    }
    __setProperties__(originalProperties, bind) {
        const instanceData = widgetInstanceMap.get(this);
        if (instanceData) {
            instanceData.inputProperties = originalProperties;
        }
        const properties = this._runBeforeProperties(originalProperties);
        const registeredDiffPropertyNames = this.getDecorator('registeredDiffProperty');
        const changedPropertyKeys = [];
        const propertyNames = Object.keys(properties);
        if (this._initialProperties === false || registeredDiffPropertyNames.length !== 0) {
            const allProperties = [...propertyNames, ...Object.keys(this._properties)];
            const checkedProperties = [];
            const diffPropertyResults = {};
            let runReactions = false;
            for (let i = 0; i < allProperties.length; i++) {
                const propertyName = allProperties[i];
                if (checkedProperties.indexOf(propertyName) !== -1) {
                    continue;
                }
                checkedProperties.push(propertyName);
                const previousProperty = this._properties[propertyName];
                const newProperty = this._bindFunctionProperty(properties[propertyName], bind);
                if (registeredDiffPropertyNames.indexOf(propertyName) !== -1) {
                    runReactions = true;
                    const diffFunctions = this.getDecorator(`diffProperty:${propertyName}`);
                    for (let i = 0; i < diffFunctions.length; i++) {
                        const result = diffFunctions[i](previousProperty, newProperty);
                        if (result.changed && changedPropertyKeys.indexOf(propertyName) === -1) {
                            changedPropertyKeys.push(propertyName);
                        }
                        if (propertyName in properties) {
                            diffPropertyResults[propertyName] = result.value;
                        }
                    }
                }
                else {
                    const result = boundAuto(previousProperty, newProperty);
                    if (result.changed && changedPropertyKeys.indexOf(propertyName) === -1) {
                        changedPropertyKeys.push(propertyName);
                    }
                    if (propertyName in properties) {
                        diffPropertyResults[propertyName] = result.value;
                    }
                }
            }
            if (runReactions) {
                const reactionFunctions = this.getDecorator('diffReaction');
                const executedReactions = [];
                reactionFunctions.forEach(({ reaction, propertyName }) => {
                    const propertyChanged = changedPropertyKeys.indexOf(propertyName) !== -1;
                    const reactionRun = executedReactions.indexOf(reaction) !== -1;
                    if (propertyChanged && !reactionRun) {
                        reaction.call(this, this._properties, diffPropertyResults);
                        executedReactions.push(reaction);
                    }
                });
            }
            this._properties = diffPropertyResults;
            this._changedPropertyKeys = changedPropertyKeys;
        }
        else {
            this._initialProperties = false;
            for (let i = 0; i < propertyNames.length; i++) {
                const propertyName = propertyNames[i];
                if (typeof properties[propertyName] === 'function') {
                    properties[propertyName] = this._bindFunctionProperty(properties[propertyName], bind);
                }
                else {
                    changedPropertyKeys.push(propertyName);
                }
            }
            this._changedPropertyKeys = changedPropertyKeys;
            this._properties = Object.assign({}, properties);
        }
        if (this._changedPropertyKeys.length > 0) {
            this.invalidate();
        }
    }
    get children() {
        return this._children;
    }
    __setChildren__(children) {
        if (this._children.length > 0 || children.length > 0) {
            this._children = children;
            this.invalidate();
        }
    }
    _filterAndConvert(nodes) {
        const isArray = Array.isArray(nodes);
        const filteredNodes = Array.isArray(nodes) ? nodes : [nodes];
        const convertedNodes = [];
        for (let i = 0; i < filteredNodes.length; i++) {
            const node = filteredNodes[i];
            if (!node) {
                continue;
            }
            if (typeof node === 'string') {
                convertedNodes.push(toTextVNode(node));
                continue;
            }
            if (Object(__WEBPACK_IMPORTED_MODULE_2__d__["e" /* isVNode */])(node) && node.deferredPropertiesCallback) {
                const properties = node.deferredPropertiesCallback(false);
                node.originalProperties = node.properties;
                node.properties = Object.assign({}, properties, node.properties);
            }
            if (Object(__WEBPACK_IMPORTED_MODULE_2__d__["f" /* isWNode */])(node) && !Object(__WEBPACK_IMPORTED_MODULE_6__Registry__["d" /* isWidgetBaseConstructor */])(node.widgetConstructor)) {
                if (typeof node.widgetConstructor === 'function') {
                    let id = lazyWidgetIdMap.get(node.widgetConstructor);
                    if (!id) {
                        id = `__lazy_widget_${lazyWidgetId++}`;
                        lazyWidgetIdMap.set(node.widgetConstructor, id);
                        this.registry.define(id, node.widgetConstructor);
                    }
                    node.widgetConstructor = id;
                }
                else if (isLazyDefine(node.widgetConstructor)) {
                    const { label, registryItem } = node.widgetConstructor;
                    if (!this.registry.has(label)) {
                        this.registry.define(label, registryItem);
                    }
                    node.widgetConstructor = label;
                }
                node.widgetConstructor =
                    this.registry.get(node.widgetConstructor) || node.widgetConstructor;
            }
            if (!node.bind) {
                node.bind = this;
            }
            convertedNodes.push(node);
            if (node.children && node.children.length) {
                node.children = this._filterAndConvert(node.children);
            }
        }
        return isArray ? convertedNodes : convertedNodes[0];
    }
    __render__() {
        const instanceData = widgetInstanceMap.get(this);
        if (instanceData) {
            instanceData.dirty = false;
        }
        const render = this._runBeforeRenders();
        const dNode = this._filterAndConvert(this._runAfterRenders(render()));
        this._nodeHandler.clear();
        return dNode;
    }
    invalidate() {
        const instanceData = widgetInstanceMap.get(this);
        if (instanceData && instanceData.invalidate) {
            instanceData.invalidate();
        }
    }
    render() {
        return Object(__WEBPACK_IMPORTED_MODULE_2__d__["g" /* v */])('div', {}, this.children);
    }
    /**
     * Function to add decorators to WidgetBase
     *
     * @param decoratorKey The key of the decorator
     * @param value The value of the decorator
     */
    addDecorator(decoratorKey, value) {
        value = Array.isArray(value) ? value : [value];
        if (this.hasOwnProperty('constructor')) {
            let decoratorList = decoratorMap.get(this.constructor);
            if (!decoratorList) {
                decoratorList = new __WEBPACK_IMPORTED_MODULE_0__shim_Map__["b" /* default */]();
                decoratorMap.set(this.constructor, decoratorList);
            }
            let specificDecoratorList = decoratorList.get(decoratorKey);
            if (!specificDecoratorList) {
                specificDecoratorList = [];
                decoratorList.set(decoratorKey, specificDecoratorList);
            }
            specificDecoratorList.push(...value);
        }
        else {
            const decorators = this.getDecorator(decoratorKey);
            this._decoratorCache.set(decoratorKey, [...decorators, ...value]);
        }
    }
    /**
     * Function to build the list of decorators from the global decorator map.
     *
     * @param decoratorKey  The key of the decorator
     * @return An array of decorator values
     * @private
     */
    _buildDecoratorList(decoratorKey) {
        const allDecorators = [];
        let constructor = this.constructor;
        while (constructor) {
            const instanceMap = decoratorMap.get(constructor);
            if (instanceMap) {
                const decorators = instanceMap.get(decoratorKey);
                if (decorators) {
                    allDecorators.unshift(...decorators);
                }
            }
            constructor = Object.getPrototypeOf(constructor);
        }
        return allDecorators;
    }
    /**
     * Function to retrieve decorator values
     *
     * @param decoratorKey The key of the decorator
     * @returns An array of decorator values
     */
    getDecorator(decoratorKey) {
        let allDecorators = this._decoratorCache.get(decoratorKey);
        if (allDecorators !== undefined) {
            return allDecorators;
        }
        allDecorators = this._buildDecoratorList(decoratorKey);
        this._decoratorCache.set(decoratorKey, allDecorators);
        return allDecorators;
    }
    /**
     * Binds unbound property functions to the specified `bind` property
     *
     * @param properties properties to check for functions
     */
    _bindFunctionProperty(property, bind) {
        if (typeof property === 'function' && !property[noBind] && Object(__WEBPACK_IMPORTED_MODULE_6__Registry__["d" /* isWidgetBaseConstructor */])(property) === false) {
            if (this._bindFunctionPropertyMap === undefined) {
                this._bindFunctionPropertyMap = new __WEBPACK_IMPORTED_MODULE_1__shim_WeakMap__["b" /* default */]();
            }
            const bindInfo = this._bindFunctionPropertyMap.get(property) || {};
            let { boundFunc, scope } = bindInfo;
            if (boundFunc === undefined || scope !== bind) {
                boundFunc = property.bind(bind);
                this._bindFunctionPropertyMap.set(property, { boundFunc, scope: bind });
            }
            return boundFunc;
        }
        return property;
    }
    get registry() {
        if (this._registry === undefined) {
            this._registry = new __WEBPACK_IMPORTED_MODULE_4__RegistryHandler__["a" /* default */]();
            this.own(this._registry);
            this.own(this._registry.on('invalidate', this._boundInvalidate));
        }
        return this._registry;
    }
    _runBeforeProperties(properties) {
        const beforeProperties = this.getDecorator('beforeProperties');
        if (beforeProperties.length > 0) {
            return beforeProperties.reduce((properties, beforePropertiesFunction) => {
                return Object.assign({}, properties, beforePropertiesFunction.call(this, properties));
            }, Object.assign({}, properties));
        }
        return properties;
    }
    /**
     * Run all registered before renders and return the updated render method
     */
    _runBeforeRenders() {
        const beforeRenders = this.getDecorator('beforeRender');
        if (beforeRenders.length > 0) {
            return beforeRenders.reduce((render, beforeRenderFunction) => {
                const updatedRender = beforeRenderFunction.call(this, render, this._properties, this._children);
                if (!updatedRender) {
                    console.warn('Render function not returned from beforeRender, using previous render');
                    return render;
                }
                return updatedRender;
            }, this._boundRenderFunc);
        }
        return this._boundRenderFunc;
    }
    /**
     * Run all registered after renders and return the decorated DNodes
     *
     * @param dNode The DNodes to run through the after renders
     */
    _runAfterRenders(dNode) {
        const afterRenders = this.getDecorator('afterRender');
        if (afterRenders.length > 0) {
            dNode = afterRenders.reduce((dNode, afterRenderFunction) => {
                return afterRenderFunction.call(this, dNode);
            }, dNode);
        }
        if (this._metaMap !== undefined) {
            this._metaMap.forEach((meta) => {
                meta.afterRender();
            });
        }
        return dNode;
    }
    _runAfterConstructors() {
        const afterConstructors = this.getDecorator('afterConstructor');
        if (afterConstructors.length > 0) {
            afterConstructors.forEach((afterConstructor) => afterConstructor.call(this));
        }
    }
    own(handle) {
        this._handles.push(handle);
    }
    destroy() {
        while (this._handles.length > 0) {
            const handle = this._handles.pop();
            if (handle) {
                handle.destroy();
            }
        }
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = WidgetBase;

/**
 * static identifier
 */
WidgetBase._type = __WEBPACK_IMPORTED_MODULE_6__Registry__["b" /* WIDGET_BASE_TYPE */];
/* harmony default export */ __webpack_exports__["b"] = (WidgetBase);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/animations/cssTransitions.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
let browserSpecificTransitionEndEventName = '';
let browserSpecificAnimationEndEventName = '';
function determineBrowserStyleNames(element) {
    if ('WebkitTransition' in element.style) {
        browserSpecificTransitionEndEventName = 'webkitTransitionEnd';
        browserSpecificAnimationEndEventName = 'webkitAnimationEnd';
    }
    else if ('transition' in element.style || 'MozTransition' in element.style) {
        browserSpecificTransitionEndEventName = 'transitionend';
        browserSpecificAnimationEndEventName = 'animationend';
    }
    else {
        throw new Error('Your browser is not supported');
    }
}
function initialize(element) {
    if (browserSpecificAnimationEndEventName === '') {
        determineBrowserStyleNames(element);
    }
}
function runAndCleanUp(element, startAnimation, finishAnimation) {
    initialize(element);
    let finished = false;
    let transitionEnd = function () {
        if (!finished) {
            finished = true;
            element.removeEventListener(browserSpecificTransitionEndEventName, transitionEnd);
            element.removeEventListener(browserSpecificAnimationEndEventName, transitionEnd);
            finishAnimation();
        }
    };
    startAnimation();
    element.addEventListener(browserSpecificAnimationEndEventName, transitionEnd);
    element.addEventListener(browserSpecificTransitionEndEventName, transitionEnd);
}
function exit(node, properties, exitAnimation, removeNode) {
    const activeClass = properties.exitAnimationActive || `${exitAnimation}-active`;
    runAndCleanUp(node, () => {
        node.classList.add(exitAnimation);
        requestAnimationFrame(function () {
            node.classList.add(activeClass);
        });
    }, () => {
        removeNode();
    });
}
function enter(node, properties, enterAnimation) {
    const activeClass = properties.enterAnimationActive || `${enterAnimation}-active`;
    runAndCleanUp(node, () => {
        node.classList.add(enterAnimation);
        requestAnimationFrame(function () {
            node.classList.add(activeClass);
        });
    }, () => {
        node.classList.remove(enterAnimation);
        node.classList.remove(activeClass);
    });
}
/* harmony default export */ __webpack_exports__["a"] = ({
    enter,
    exit
});


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/d.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["f"] = isWNode;
/* harmony export (immutable) */ __webpack_exports__["e"] = isVNode;
/* harmony export (immutable) */ __webpack_exports__["d"] = isDomVNode;
/* unused harmony export isElementNode */
/* unused harmony export decorate */
/* harmony export (immutable) */ __webpack_exports__["h"] = w;
/* harmony export (immutable) */ __webpack_exports__["g"] = v;
/* harmony export (immutable) */ __webpack_exports__["c"] = dom;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__("./node_modules/tslib/tslib.es6.js");

/**
 * The identifier for a WNode type
 */
const WNODE = '__WNODE_TYPE';
/* harmony export (immutable) */ __webpack_exports__["b"] = WNODE;

/**
 * The identifier for a VNode type
 */
const VNODE = '__VNODE_TYPE';
/* harmony export (immutable) */ __webpack_exports__["a"] = VNODE;

/**
 * The identifier for a VNode type created using dom()
 */
const DOMVNODE = '__DOMVNODE_TYPE';
/* unused harmony export DOMVNODE */

/**
 * Helper function that returns true if the `DNode` is a `WNode` using the `type` property
 */
function isWNode(child) {
    return Boolean(child && typeof child !== 'string' && child.type === WNODE);
}
/**
 * Helper function that returns true if the `DNode` is a `VNode` using the `type` property
 */
function isVNode(child) {
    return Boolean(child && typeof child !== 'string' && (child.type === VNODE || child.type === DOMVNODE));
}
/**
 * Helper function that returns true if the `DNode` is a `VNode` created with `dom()` using the `type` property
 */
function isDomVNode(child) {
    return Boolean(child && typeof child !== 'string' && child.type === DOMVNODE);
}
function isElementNode(value) {
    return !!value.tagName;
}
function decorate(dNodes, optionsOrModifier, predicate) {
    let shallow = false;
    let modifier;
    if (typeof optionsOrModifier === 'function') {
        modifier = optionsOrModifier;
    }
    else {
        modifier = optionsOrModifier.modifier;
        predicate = optionsOrModifier.predicate;
        shallow = optionsOrModifier.shallow || false;
    }
    let nodes = Array.isArray(dNodes) ? [...dNodes] : [dNodes];
    function breaker() {
        nodes = [];
    }
    while (nodes.length) {
        const node = nodes.shift();
        if (node) {
            if (!shallow && (isWNode(node) || isVNode(node)) && node.children) {
                nodes = [...nodes, ...node.children];
            }
            if (!predicate || predicate(node)) {
                modifier(node, breaker);
            }
        }
    }
    return dNodes;
}
function w(widgetConstructorOrNode, properties, children) {
    if (isWNode(widgetConstructorOrNode)) {
        properties = Object.assign({}, widgetConstructorOrNode.properties, properties);
        children = children ? children : widgetConstructorOrNode.children;
        widgetConstructorOrNode = widgetConstructorOrNode.widgetConstructor;
    }
    return {
        children: children || [],
        widgetConstructor: widgetConstructorOrNode,
        properties,
        type: WNODE
    };
}
function v(tag, propertiesOrChildren = {}, children = undefined) {
    let properties = propertiesOrChildren;
    let deferredPropertiesCallback;
    if (Array.isArray(propertiesOrChildren)) {
        children = propertiesOrChildren;
        properties = {};
    }
    if (typeof properties === 'function') {
        deferredPropertiesCallback = properties;
        properties = {};
    }
    if (isVNode(tag)) {
        let { classes = [], styles = {} } = properties, newProperties = __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __rest */](properties, ["classes", "styles"]);
        let _a = tag.properties, { classes: nodeClasses = [], styles: nodeStyles = {} } = _a, nodeProperties = __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __rest */](_a, ["classes", "styles"]);
        nodeClasses = Array.isArray(nodeClasses) ? nodeClasses : [nodeClasses];
        classes = Array.isArray(classes) ? classes : [classes];
        styles = Object.assign({}, nodeStyles, styles);
        properties = Object.assign({}, nodeProperties, newProperties, { classes: [...nodeClasses, ...classes], styles });
        children = children ? children : tag.children;
        tag = tag.tag;
    }
    return {
        tag,
        deferredPropertiesCallback,
        originalProperties: {},
        children,
        properties,
        type: VNODE
    };
}
/**
 * Create a VNode for an existing DOM Node.
 */
function dom({ node, attrs = {}, props = {}, on = {}, diffType = 'none', onAttach }, children) {
    return {
        tag: isElementNode(node) ? node.tagName.toLowerCase() : '',
        properties: props,
        attributes: attrs,
        events: on,
        children,
        type: DOMVNODE,
        domNode: node,
        text: isElementNode(node) ? undefined : node.data,
        diffType,
        onAttach
    };
}


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/decorators/alwaysRender.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = alwaysRender;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__handleDecorator__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/decorators/handleDecorator.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__beforeProperties__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/decorators/beforeProperties.mjs");


function alwaysRender() {
    return Object(__WEBPACK_IMPORTED_MODULE_0__handleDecorator__["a" /* handleDecorator */])((target, propertyKey) => {
        Object(__WEBPACK_IMPORTED_MODULE_1__beforeProperties__["a" /* beforeProperties */])(function () {
            this.invalidate();
        })(target);
    });
}
/* unused harmony default export */ var _unused_webpack_default_export = (alwaysRender);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/decorators/beforeProperties.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = beforeProperties;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__handleDecorator__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/decorators/handleDecorator.mjs");

function beforeProperties(method) {
    return Object(__WEBPACK_IMPORTED_MODULE_0__handleDecorator__["a" /* handleDecorator */])((target, propertyKey) => {
        target.addDecorator('beforeProperties', propertyKey ? target[propertyKey] : method);
    });
}
/* unused harmony default export */ var _unused_webpack_default_export = (beforeProperties);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/decorators/customElement.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = customElement;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__registerCustomElement__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/registerCustomElement.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Registry__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/Registry.mjs");


/**
 * This Decorator is provided properties that define the behavior of a custom element, and
 * registers that custom element.
 */
function customElement({ tag, properties = [], attributes = [], events = [], childType = __WEBPACK_IMPORTED_MODULE_0__registerCustomElement__["a" /* CustomElementChildType */].DOJO, registryFactory = () => new __WEBPACK_IMPORTED_MODULE_1__Registry__["c" /* default */]() }) {
    return function (target) {
        target.prototype.__customElementDescriptor = {
            tagName: tag,
            attributes,
            properties,
            events,
            childType,
            registryFactory
        };
    };
}
/* unused harmony default export */ var _unused_webpack_default_export = (customElement);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/decorators/diffProperty.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = diffProperty;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__handleDecorator__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/decorators/handleDecorator.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__diff__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/diff.mjs");


/**
 * Decorator that can be used to register a function as a specific property diff
 *
 * @param propertyName  The name of the property of which the diff function is applied
 * @param diffType      The diff type, default is DiffType.AUTO.
 * @param diffFunction  A diff function to run if diffType if DiffType.CUSTOM
 */
function diffProperty(propertyName, diffFunction = __WEBPACK_IMPORTED_MODULE_1__diff__["a" /* auto */], reactionFunction) {
    return Object(__WEBPACK_IMPORTED_MODULE_0__handleDecorator__["a" /* handleDecorator */])((target, propertyKey) => {
        target.addDecorator(`diffProperty:${propertyName}`, diffFunction.bind(null));
        target.addDecorator('registeredDiffProperty', propertyName);
        if (reactionFunction || propertyKey) {
            target.addDecorator('diffReaction', {
                propertyName,
                reaction: propertyKey ? target[propertyKey] : reactionFunction
            });
        }
    });
}
/* unused harmony default export */ var _unused_webpack_default_export = (diffProperty);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/decorators/handleDecorator.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = handleDecorator;
/**
 * Generic decorator handler to take care of whether or not the decorator was called at the class level
 * or the method level.
 *
 * @param handler
 */
function handleDecorator(handler) {
    return function (target, propertyKey, descriptor) {
        if (typeof target === 'function') {
            handler(target.prototype, undefined);
        }
        else {
            handler(target, propertyKey);
        }
    };
}
/* unused harmony default export */ var _unused_webpack_default_export = (handleDecorator);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/decorators/inject.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = inject;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__shim_WeakMap__ = __webpack_require__("./node_modules/@dojo/framework/shim/WeakMap.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__handleDecorator__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/decorators/handleDecorator.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__beforeProperties__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/decorators/beforeProperties.mjs");



/**
 * Map of instances against registered injectors.
 */
const registeredInjectorsMap = new __WEBPACK_IMPORTED_MODULE_0__shim_WeakMap__["b" /* default */]();
/**
 * Decorator retrieves an injector from an available registry using the name and
 * calls the `getProperties` function with the payload from the injector
 * and current properties with the the injected properties returned.
 *
 * @param InjectConfig the inject configuration
 */
function inject({ name, getProperties }) {
    return Object(__WEBPACK_IMPORTED_MODULE_1__handleDecorator__["a" /* handleDecorator */])((target, propertyKey) => {
        Object(__WEBPACK_IMPORTED_MODULE_2__beforeProperties__["a" /* beforeProperties */])(function (properties) {
            const injectorItem = this.registry.getInjector(name);
            if (injectorItem) {
                const { injector, invalidator } = injectorItem;
                const registeredInjectors = registeredInjectorsMap.get(this) || [];
                if (registeredInjectors.length === 0) {
                    registeredInjectorsMap.set(this, registeredInjectors);
                }
                if (registeredInjectors.indexOf(injectorItem) === -1) {
                    this.own(invalidator.on('invalidate', () => {
                        this.invalidate();
                    }));
                    registeredInjectors.push(injectorItem);
                }
                return getProperties(injector(), properties);
            }
        })(target);
    });
}
/* unused harmony default export */ var _unused_webpack_default_export = (inject);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/diff.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export always */
/* unused harmony export ignore */
/* unused harmony export reference */
/* harmony export (immutable) */ __webpack_exports__["b"] = shallow;
/* harmony export (immutable) */ __webpack_exports__["a"] = auto;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Registry__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/Registry.mjs");

function isObjectOrArray(value) {
    return Object.prototype.toString.call(value) === '[object Object]' || Array.isArray(value);
}
function always(previousProperty, newProperty) {
    return {
        changed: true,
        value: newProperty
    };
}
function ignore(previousProperty, newProperty) {
    return {
        changed: false,
        value: newProperty
    };
}
function reference(previousProperty, newProperty) {
    return {
        changed: previousProperty !== newProperty,
        value: newProperty
    };
}
function shallow(previousProperty, newProperty) {
    let changed = false;
    const validOldProperty = previousProperty && isObjectOrArray(previousProperty);
    const validNewProperty = newProperty && isObjectOrArray(newProperty);
    if (!validOldProperty || !validNewProperty) {
        return {
            changed: true,
            value: newProperty
        };
    }
    const previousKeys = Object.keys(previousProperty);
    const newKeys = Object.keys(newProperty);
    if (previousKeys.length !== newKeys.length) {
        changed = true;
    }
    else {
        changed = newKeys.some((key) => {
            return newProperty[key] !== previousProperty[key];
        });
    }
    return {
        changed,
        value: newProperty
    };
}
function auto(previousProperty, newProperty) {
    let result;
    if (typeof newProperty === 'function') {
        if (newProperty._type === __WEBPACK_IMPORTED_MODULE_0__Registry__["b" /* WIDGET_BASE_TYPE */]) {
            result = reference(previousProperty, newProperty);
        }
        else {
            result = ignore(previousProperty, newProperty);
        }
    }
    else if (isObjectOrArray(newProperty)) {
        result = shallow(previousProperty, newProperty);
    }
    else {
        result = reference(previousProperty, newProperty);
    }
    return result;
}


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/meta/Base.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__core_Destroyable__ = __webpack_require__("./node_modules/@dojo/framework/core/Destroyable.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__shim_Set__ = __webpack_require__("./node_modules/@dojo/framework/shim/Set.mjs");


class Base extends __WEBPACK_IMPORTED_MODULE_0__core_Destroyable__["a" /* Destroyable */] {
    constructor(properties) {
        super();
        this._requestedNodeKeys = new __WEBPACK_IMPORTED_MODULE_1__shim_Set__["a" /* default */]();
        this._invalidate = properties.invalidate;
        this.nodeHandler = properties.nodeHandler;
        if (properties.bind) {
            this._bind = properties.bind;
        }
    }
    has(key) {
        return this.nodeHandler.has(key);
    }
    getNode(key) {
        const stringKey = `${key}`;
        const node = this.nodeHandler.get(stringKey);
        if (!node && !this._requestedNodeKeys.has(stringKey)) {
            const handle = this.nodeHandler.on(stringKey, () => {
                handle.destroy();
                this._requestedNodeKeys.delete(stringKey);
                this.invalidate();
            });
            this.own(handle);
            this._requestedNodeKeys.add(stringKey);
        }
        return node;
    }
    invalidate() {
        this._invalidate();
    }
    afterRender() {
        // Do nothing by default.
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Base;

/* unused harmony default export */ var _unused_webpack_default_export = (Base);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/meta/Focus.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Base__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/meta/Base.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__shim_global__ = __webpack_require__("./node_modules/@dojo/framework/shim/global.mjs");


const defaultResults = {
    active: false,
    containsFocus: false
};
class Focus extends __WEBPACK_IMPORTED_MODULE_0__Base__["a" /* Base */] {
    constructor() {
        super(...arguments);
        this._onFocusChange = () => {
            this._activeElement = __WEBPACK_IMPORTED_MODULE_1__shim_global__["a" /* default */].document.activeElement;
            this.invalidate();
        };
    }
    get(key) {
        const node = this.getNode(key);
        if (!node) {
            return Object.assign({}, defaultResults);
        }
        if (!this._activeElement) {
            this._activeElement = __WEBPACK_IMPORTED_MODULE_1__shim_global__["a" /* default */].document.activeElement;
            this._createListener();
        }
        return {
            active: node === this._activeElement,
            containsFocus: !!this._activeElement && node.contains(this._activeElement)
        };
    }
    set(key) {
        const node = this.getNode(key);
        node && node.focus();
    }
    _createListener() {
        __WEBPACK_IMPORTED_MODULE_1__shim_global__["a" /* default */].document.addEventListener('focusin', this._onFocusChange);
        __WEBPACK_IMPORTED_MODULE_1__shim_global__["a" /* default */].document.addEventListener('focusout', this._onFocusChange);
        this.own({
            destroy: () => {
                this._removeListener();
            }
        });
    }
    _removeListener() {
        __WEBPACK_IMPORTED_MODULE_1__shim_global__["a" /* default */].document.removeEventListener('focusin', this._onFocusChange);
        __WEBPACK_IMPORTED_MODULE_1__shim_global__["a" /* default */].document.removeEventListener('focusout', this._onFocusChange);
    }
}
/* unused harmony export Focus */

/* harmony default export */ __webpack_exports__["a"] = (Focus);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/meta/WebAnimation.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Base__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/meta/Base.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__shim_Map__ = __webpack_require__("./node_modules/@dojo/framework/shim/Map.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__shim_global__ = __webpack_require__("./node_modules/@dojo/framework/shim/global.mjs");



class WebAnimations extends __WEBPACK_IMPORTED_MODULE_0__Base__["a" /* Base */] {
    constructor() {
        super(...arguments);
        this._animationMap = new __WEBPACK_IMPORTED_MODULE_1__shim_Map__["b" /* default */]();
    }
    _createPlayer(node, properties) {
        const { effects, timing = {} } = properties;
        const fx = typeof effects === 'function' ? effects() : effects;
        const keyframeEffect = new __WEBPACK_IMPORTED_MODULE_2__shim_global__["a" /* default */].KeyframeEffect(node, fx, timing);
        return new __WEBPACK_IMPORTED_MODULE_2__shim_global__["a" /* default */].Animation(keyframeEffect, __WEBPACK_IMPORTED_MODULE_2__shim_global__["a" /* default */].document.timeline);
    }
    _updatePlayer(player, controls) {
        const { play, reverse, cancel, finish, onFinish, onCancel, playbackRate, startTime, currentTime } = controls;
        if (playbackRate !== undefined) {
            player.playbackRate = playbackRate;
        }
        if (reverse) {
            player.reverse();
        }
        if (cancel) {
            player.cancel();
        }
        if (finish) {
            player.finish();
        }
        if (startTime !== undefined) {
            player.startTime = startTime;
        }
        if (currentTime !== undefined) {
            player.currentTime = currentTime;
        }
        if (play) {
            player.play();
        }
        else {
            player.pause();
        }
        if (onFinish) {
            player.onfinish = onFinish.bind(this._bind);
        }
        if (onCancel) {
            player.oncancel = onCancel.bind(this._bind);
        }
    }
    animate(key, animateProperties) {
        const node = this.getNode(key);
        if (node) {
            if (!Array.isArray(animateProperties)) {
                animateProperties = [animateProperties];
            }
            animateProperties.forEach((properties) => {
                properties = typeof properties === 'function' ? properties() : properties;
                if (properties) {
                    const { id } = properties;
                    if (!this._animationMap.has(id)) {
                        this._animationMap.set(id, {
                            player: this._createPlayer(node, properties),
                            used: true
                        });
                    }
                    const animation = this._animationMap.get(id);
                    const { controls = {} } = properties;
                    if (animation) {
                        this._updatePlayer(animation.player, controls);
                        this._animationMap.set(id, {
                            player: animation.player,
                            used: true
                        });
                    }
                }
            });
        }
    }
    get(id) {
        const animation = this._animationMap.get(id);
        if (animation) {
            const { currentTime, playState, playbackRate, startTime } = animation.player;
            return {
                currentTime: currentTime || 0,
                playState,
                playbackRate,
                startTime: startTime || 0
            };
        }
    }
    afterRender() {
        this._animationMap.forEach((animation, key) => {
            if (!animation.used) {
                animation.player.cancel();
                this._animationMap.delete(key);
            }
            animation.used = false;
        });
    }
}
/* unused harmony export WebAnimations */

/* harmony default export */ __webpack_exports__["a"] = (WebAnimations);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/mixins/Focus.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = FocusMixin;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__("./node_modules/tslib/tslib.es6.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__decorators_diffProperty__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/decorators/diffProperty.mjs");


function diffFocus(previousProperty, newProperty) {
    const result = newProperty && newProperty();
    return {
        changed: result,
        value: newProperty
    };
}
function FocusMixin(Base) {
    class Focus extends Base {
        constructor() {
            super(...arguments);
            this._currentToken = 0;
            this._previousToken = 0;
            this.shouldFocus = () => {
                const result = this._currentToken !== this._previousToken;
                this._previousToken = this._currentToken;
                return result;
            };
        }
        isFocusedReaction() {
            this._currentToken++;
        }
        focus() {
            this._currentToken++;
            this.invalidate();
        }
    }
    __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __decorate */]([
        Object(__WEBPACK_IMPORTED_MODULE_1__decorators_diffProperty__["a" /* diffProperty */])('focus', diffFocus)
    ], Focus.prototype, "isFocusedReaction", null);
    return Focus;
}
/* unused harmony default export */ var _unused_webpack_default_export = (FocusMixin);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/mixins/Themed.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["d"] = theme;
/* harmony export (immutable) */ __webpack_exports__["c"] = registerThemeInjector;
/* harmony export (immutable) */ __webpack_exports__["a"] = ThemedMixin;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__("./node_modules/tslib/tslib.es6.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Injector__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/Injector.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__decorators_inject__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/decorators/inject.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__decorators_handleDecorator__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/decorators/handleDecorator.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__decorators_diffProperty__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/decorators/diffProperty.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__diff__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/diff.mjs");






const THEME_KEY = ' _key';
const INJECTED_THEME_KEY = '__theme_injector';
/* unused harmony export INJECTED_THEME_KEY */

/**
 * Decorator for base css classes
 */
function theme(theme) {
    return Object(__WEBPACK_IMPORTED_MODULE_3__decorators_handleDecorator__["a" /* handleDecorator */])((target) => {
        target.addDecorator('baseThemeClasses', theme);
    });
}
/**
 * Creates a reverse lookup for the classes passed in via the `theme` function.
 *
 * @param classes The baseClasses object
 * @requires
 */
function createThemeClassesLookup(classes) {
    return classes.reduce((currentClassNames, baseClass) => {
        Object.keys(baseClass).forEach((key) => {
            currentClassNames[baseClass[key]] = key;
        });
        return currentClassNames;
    }, {});
}
/**
 * Convenience function that is given a theme and an optional registry, the theme
 * injector is defined against the registry, returning the theme.
 *
 * @param theme the theme to set
 * @param themeRegistry registry to define the theme injector against. Defaults
 * to the global registry
 *
 * @returns the theme injector used to set the theme
 */
function registerThemeInjector(theme, themeRegistry) {
    const themeInjector = new __WEBPACK_IMPORTED_MODULE_1__Injector__["a" /* Injector */](theme);
    themeRegistry.defineInjector(INJECTED_THEME_KEY, (invalidator) => {
        themeInjector.setInvalidator(invalidator);
        return () => themeInjector.get();
    });
    return themeInjector;
}
/**
 * Function that returns a class decorated with with Themed functionality
 */
function ThemedMixin(Base) {
    let Themed = class Themed extends Base {
        constructor() {
            super(...arguments);
            /**
             * Registered base theme keys
             */
            this._registeredBaseThemeKeys = [];
            /**
             * Indicates if classes meta data need to be calculated.
             */
            this._recalculateClasses = true;
            /**
             * Loaded theme
             */
            this._theme = {};
        }
        theme(classes) {
            if (this._recalculateClasses) {
                this._recalculateThemeClasses();
            }
            if (Array.isArray(classes)) {
                return classes.map((className) => this._getThemeClass(className));
            }
            return this._getThemeClass(classes);
        }
        /**
         * Function fired when `theme` or `extraClasses` are changed.
         */
        onPropertiesChanged() {
            this._recalculateClasses = true;
        }
        _getThemeClass(className) {
            if (className === undefined || className === null) {
                return className;
            }
            const extraClasses = this.properties.extraClasses || {};
            const themeClassName = this._baseThemeClassesReverseLookup[className];
            let resultClassNames = [];
            if (!themeClassName) {
                console.warn(`Class name: '${className}' not found in theme`);
                return null;
            }
            if (extraClasses[themeClassName]) {
                resultClassNames.push(extraClasses[themeClassName]);
            }
            if (this._theme[themeClassName]) {
                resultClassNames.push(this._theme[themeClassName]);
            }
            else {
                resultClassNames.push(this._registeredBaseTheme[themeClassName]);
            }
            return resultClassNames.join(' ');
        }
        _recalculateThemeClasses() {
            const { theme = {} } = this.properties;
            if (!this._registeredBaseTheme) {
                const baseThemes = this.getDecorator('baseThemeClasses');
                if (baseThemes.length === 0) {
                    console.warn('A base theme has not been provided to this widget. Please use the @theme decorator to add a theme.');
                }
                this._registeredBaseTheme = baseThemes.reduce((finalBaseTheme, baseTheme) => {
                    const _a = THEME_KEY, key = baseTheme[_a], classes = __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __rest */](baseTheme, [typeof _a === "symbol" ? _a : _a + ""]);
                    this._registeredBaseThemeKeys.push(key);
                    return Object.assign({}, finalBaseTheme, classes);
                }, {});
                this._baseThemeClassesReverseLookup = createThemeClassesLookup(baseThemes);
            }
            this._theme = this._registeredBaseThemeKeys.reduce((baseTheme, themeKey) => {
                return Object.assign({}, baseTheme, theme[themeKey]);
            }, {});
            this._recalculateClasses = false;
        }
    };
    __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __decorate */]([
        Object(__WEBPACK_IMPORTED_MODULE_4__decorators_diffProperty__["a" /* diffProperty */])('theme', __WEBPACK_IMPORTED_MODULE_5__diff__["b" /* shallow */]),
        Object(__WEBPACK_IMPORTED_MODULE_4__decorators_diffProperty__["a" /* diffProperty */])('extraClasses', __WEBPACK_IMPORTED_MODULE_5__diff__["b" /* shallow */])
    ], Themed.prototype, "onPropertiesChanged", null);
    Themed = __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __decorate */]([
        Object(__WEBPACK_IMPORTED_MODULE_2__decorators_inject__["a" /* inject */])({
            name: INJECTED_THEME_KEY,
            getProperties: (theme, properties) => {
                if (!properties.theme) {
                    return { theme };
                }
                return {};
            }
        })
    ], Themed);
    return Themed;
}
/* harmony default export */ __webpack_exports__["b"] = (ThemedMixin);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/registerCustomElement.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return CustomElementChildType; });
/* unused harmony export DomToWidgetWrapper */
/* unused harmony export create */
/* unused harmony export register */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__("./node_modules/tslib/tslib.es6.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__WidgetBase__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/WidgetBase.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__vdom__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/vdom.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__shim_array__ = __webpack_require__("./node_modules/@dojo/framework/shim/array.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__d__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/d.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__shim_global__ = __webpack_require__("./node_modules/@dojo/framework/shim/global.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__mixins_Themed__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/mixins/Themed.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__decorators_alwaysRender__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/decorators/alwaysRender.mjs");








var CustomElementChildType;
(function (CustomElementChildType) {
    CustomElementChildType["DOJO"] = "DOJO";
    CustomElementChildType["NODE"] = "NODE";
    CustomElementChildType["TEXT"] = "TEXT";
})(CustomElementChildType || (CustomElementChildType = {}));
function DomToWidgetWrapper(domNode) {
    let DomToWidgetWrapper = class DomToWidgetWrapper extends __WEBPACK_IMPORTED_MODULE_1__WidgetBase__["a" /* WidgetBase */] {
        render() {
            const properties = Object.keys(this.properties).reduce((props, key) => {
                const value = this.properties[key];
                if (key.indexOf('on') === 0) {
                    key = `__${key}`;
                }
                props[key] = value;
                return props;
            }, {});
            return Object(__WEBPACK_IMPORTED_MODULE_4__d__["c" /* dom */])({ node: domNode, props: properties, diffType: 'dom' });
        }
        static get domNode() {
            return domNode;
        }
    };
    DomToWidgetWrapper = __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __decorate */]([
        Object(__WEBPACK_IMPORTED_MODULE_7__decorators_alwaysRender__["a" /* alwaysRender */])()
    ], DomToWidgetWrapper);
    return DomToWidgetWrapper;
}
function create(descriptor, WidgetConstructor) {
    const { attributes, childType, registryFactory } = descriptor;
    const attributeMap = {};
    attributes.forEach((propertyName) => {
        const attributeName = propertyName.toLowerCase();
        attributeMap[attributeName] = propertyName;
    });
    return class extends HTMLElement {
        constructor() {
            super(...arguments);
            this._properties = {};
            this._children = [];
            this._eventProperties = {};
            this._initialised = false;
        }
        connectedCallback() {
            if (this._initialised) {
                return;
            }
            const domProperties = {};
            const { attributes, properties, events } = descriptor;
            this._properties = Object.assign({}, this._properties, this._attributesToProperties(attributes));
            [...attributes, ...properties].forEach((propertyName) => {
                const value = this[propertyName];
                const filteredPropertyName = propertyName.replace(/^on/, '__');
                if (value !== undefined) {
                    this._properties[propertyName] = value;
                }
                if (filteredPropertyName !== propertyName) {
                    domProperties[filteredPropertyName] = {
                        get: () => this._getProperty(propertyName),
                        set: (value) => this._setProperty(propertyName, value)
                    };
                }
                domProperties[propertyName] = {
                    get: () => this._getProperty(propertyName),
                    set: (value) => this._setProperty(propertyName, value)
                };
            });
            events.forEach((propertyName) => {
                const eventName = propertyName.replace(/^on/, '').toLowerCase();
                const filteredPropertyName = propertyName.replace(/^on/, '__on');
                domProperties[filteredPropertyName] = {
                    get: () => this._getEventProperty(propertyName),
                    set: (value) => this._setEventProperty(propertyName, value)
                };
                this._eventProperties[propertyName] = undefined;
                this._properties[propertyName] = (...args) => {
                    const eventCallback = this._getEventProperty(propertyName);
                    if (typeof eventCallback === 'function') {
                        eventCallback(...args);
                    }
                    this.dispatchEvent(new CustomEvent(eventName, {
                        bubbles: false,
                        detail: args
                    }));
                };
            });
            Object.defineProperties(this, domProperties);
            const children = childType === CustomElementChildType.TEXT ? this.childNodes : this.children;
            Object(__WEBPACK_IMPORTED_MODULE_3__shim_array__["a" /* from */])(children).forEach((childNode) => {
                if (childType === CustomElementChildType.DOJO) {
                    childNode.addEventListener('dojo-ce-render', () => this._render());
                    childNode.addEventListener('dojo-ce-connected', () => this._render());
                    this._children.push(DomToWidgetWrapper(childNode));
                }
                else {
                    this._children.push(Object(__WEBPACK_IMPORTED_MODULE_4__d__["c" /* dom */])({ node: childNode, diffType: 'dom' }));
                }
            });
            this.addEventListener('dojo-ce-connected', (e) => this._childConnected(e));
            const widgetProperties = this._properties;
            const renderChildren = () => this.__children__();
            const Wrapper = class extends __WEBPACK_IMPORTED_MODULE_1__WidgetBase__["a" /* WidgetBase */] {
                render() {
                    return Object(__WEBPACK_IMPORTED_MODULE_4__d__["h" /* w */])(WidgetConstructor, widgetProperties, renderChildren());
                }
            };
            const registry = registryFactory();
            const themeContext = Object(__WEBPACK_IMPORTED_MODULE_6__mixins_Themed__["c" /* registerThemeInjector */])(this._getTheme(), registry);
            __WEBPACK_IMPORTED_MODULE_5__shim_global__["a" /* default */].addEventListener('dojo-theme-set', () => themeContext.set(this._getTheme()));
            const r = Object(__WEBPACK_IMPORTED_MODULE_2__vdom__["b" /* renderer */])(() => Object(__WEBPACK_IMPORTED_MODULE_4__d__["h" /* w */])(Wrapper, {}));
            this._renderer = r;
            r.mount({ domNode: this, merge: false, registry });
            this._initialised = true;
            this.dispatchEvent(new CustomEvent('dojo-ce-connected', {
                bubbles: true,
                detail: this
            }));
        }
        _getTheme() {
            if (__WEBPACK_IMPORTED_MODULE_5__shim_global__["a" /* default */] && __WEBPACK_IMPORTED_MODULE_5__shim_global__["a" /* default */].dojoce && __WEBPACK_IMPORTED_MODULE_5__shim_global__["a" /* default */].dojoce.theme) {
                return __WEBPACK_IMPORTED_MODULE_5__shim_global__["a" /* default */].dojoce.themes[__WEBPACK_IMPORTED_MODULE_5__shim_global__["a" /* default */].dojoce.theme];
            }
        }
        _childConnected(e) {
            const node = e.detail;
            if (node.parentNode === this) {
                const exists = this._children.some((child) => child.domNode === node);
                if (!exists) {
                    node.addEventListener('dojo-ce-render', () => this._render());
                    this._children.push(DomToWidgetWrapper(node));
                    this._render();
                }
            }
        }
        _render() {
            if (this._renderer) {
                this._renderer.invalidate();
                this.dispatchEvent(new CustomEvent('dojo-ce-render', {
                    bubbles: false,
                    detail: this
                }));
            }
        }
        __properties__() {
            return Object.assign({}, this._properties, this._eventProperties);
        }
        __children__() {
            if (childType === CustomElementChildType.DOJO) {
                return this._children.filter((Child) => Child.domNode.isWidget).map((Child) => {
                    const { domNode } = Child;
                    return Object(__WEBPACK_IMPORTED_MODULE_4__d__["h" /* w */])(Child, Object.assign({}, domNode.__properties__()), [...domNode.__children__()]);
                });
            }
            else {
                return this._children;
            }
        }
        attributeChangedCallback(name, oldValue, value) {
            const propertyName = attributeMap[name];
            this._setProperty(propertyName, value);
        }
        _setEventProperty(propertyName, value) {
            this._eventProperties[propertyName] = value;
        }
        _getEventProperty(propertyName) {
            return this._eventProperties[propertyName];
        }
        _setProperty(propertyName, value) {
            if (typeof value === 'function') {
                value[__WEBPACK_IMPORTED_MODULE_1__WidgetBase__["c" /* noBind */]] = true;
            }
            this._properties[propertyName] = value;
            this._render();
        }
        _getProperty(propertyName) {
            return this._properties[propertyName];
        }
        _attributesToProperties(attributes) {
            return attributes.reduce((properties, propertyName) => {
                const attributeName = propertyName.toLowerCase();
                const value = this.getAttribute(attributeName);
                if (value !== null) {
                    properties[propertyName] = value;
                }
                return properties;
            }, {});
        }
        static get observedAttributes() {
            return Object.keys(attributeMap);
        }
        get isWidget() {
            return true;
        }
    };
}
function register(WidgetConstructor) {
    const descriptor = WidgetConstructor.prototype && WidgetConstructor.prototype.__customElementDescriptor;
    if (!descriptor) {
        throw new Error('Cannot get descriptor for Custom Element, have you added the @customElement decorator to your Widget?');
    }
    __WEBPACK_IMPORTED_MODULE_5__shim_global__["a" /* default */].customElements.define(descriptor.tagName, create(descriptor, WidgetConstructor));
}
/* unused harmony default export */ var _unused_webpack_default_export = (register);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/vdom.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["b"] = renderer;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__shim_global__ = __webpack_require__("./node_modules/@dojo/framework/shim/global.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__has_has__ = __webpack_require__("./node_modules/@dojo/framework/has/has.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__shim_WeakMap__ = __webpack_require__("./node_modules/@dojo/framework/shim/WeakMap.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__animations_cssTransitions__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/animations/cssTransitions.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__d__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/d.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__Registry__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/Registry.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__WidgetBase__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/WidgetBase.mjs");







const EMPTY_ARRAY = [];
const nodeOperations = ['focus', 'blur', 'scrollIntoView', 'click'];
const NAMESPACE_W3 = 'http://www.w3.org/';
const NAMESPACE_SVG = NAMESPACE_W3 + '2000/svg';
const NAMESPACE_XLINK = NAMESPACE_W3 + '1999/xlink';
function isWNodeWrapper(child) {
    return child && Object(__WEBPACK_IMPORTED_MODULE_4__d__["f" /* isWNode */])(child.node);
}
function isVNodeWrapper(child) {
    return !!child && Object(__WEBPACK_IMPORTED_MODULE_4__d__["e" /* isVNode */])(child.node);
}
function isAttachApplication(value) {
    return !!value.type;
}
function updateAttributes(domNode, previousAttributes, attributes, namespace) {
    const attrNames = Object.keys(attributes);
    const attrCount = attrNames.length;
    for (let i = 0; i < attrCount; i++) {
        const attrName = attrNames[i];
        const attrValue = attributes[attrName];
        const previousAttrValue = previousAttributes[attrName];
        if (attrValue !== previousAttrValue) {
            updateAttribute(domNode, attrName, attrValue, namespace);
        }
    }
}
function buildPreviousProperties(domNode, current, next) {
    const { node: { diffType, properties, attributes } } = current;
    if (!diffType || diffType === 'vdom') {
        return {
            properties: current.node.properties,
            attributes: current.node.attributes,
            events: current.node.events
        };
    }
    else if (diffType === 'none') {
        return { properties: {}, attributes: current.node.attributes ? {} : undefined, events: current.node.events };
    }
    let newProperties = {
        properties: {}
    };
    if (attributes) {
        newProperties.attributes = {};
        newProperties.events = current.node.events;
        Object.keys(properties).forEach((propName) => {
            newProperties.properties[propName] = domNode[propName];
        });
        Object.keys(attributes).forEach((attrName) => {
            newProperties.attributes[attrName] = domNode.getAttribute(attrName);
        });
        return newProperties;
    }
    newProperties.properties = Object.keys(properties).reduce((props, property) => {
        props[property] = domNode.getAttribute(property) || domNode[property];
        return props;
    }, {});
    return newProperties;
}
function checkDistinguishable(wrappers, index, parentWNodeWrapper) {
    const wrapperToCheck = wrappers[index];
    if (isVNodeWrapper(wrapperToCheck) && !wrapperToCheck.node.tag) {
        return;
    }
    const { key } = wrapperToCheck.node.properties;
    let parentName = 'unknown';
    if (parentWNodeWrapper) {
        const { node: { widgetConstructor } } = parentWNodeWrapper;
        parentName = widgetConstructor.name || 'unknown';
    }
    if (key === undefined || key === null) {
        for (let i = 0; i < wrappers.length; i++) {
            if (i !== index) {
                const wrapper = wrappers[i];
                if (same(wrapper, wrapperToCheck)) {
                    let nodeIdentifier;
                    if (isWNodeWrapper(wrapper)) {
                        nodeIdentifier = wrapper.node.widgetConstructor.name || 'unknown';
                    }
                    else {
                        nodeIdentifier = wrapper.node.tag;
                    }
                    console.warn(`A widget (${parentName}) has had a child added or removed, but they were not able to uniquely identified. It is recommended to provide a unique 'key' property when using the same widget or element (${nodeIdentifier}) multiple times as siblings`);
                    break;
                }
            }
        }
    }
}
function same(dnode1, dnode2) {
    if (isVNodeWrapper(dnode1) && isVNodeWrapper(dnode2)) {
        if (Object(__WEBPACK_IMPORTED_MODULE_4__d__["d" /* isDomVNode */])(dnode1.node) && Object(__WEBPACK_IMPORTED_MODULE_4__d__["d" /* isDomVNode */])(dnode2.node)) {
            if (dnode1.node.domNode !== dnode2.node.domNode) {
                return false;
            }
        }
        if (dnode1.node.tag !== dnode2.node.tag) {
            return false;
        }
        if (dnode1.node.properties.key !== dnode2.node.properties.key) {
            return false;
        }
        return true;
    }
    else if (isWNodeWrapper(dnode1) && isWNodeWrapper(dnode2)) {
        if (dnode1.instance === undefined && typeof dnode2.node.widgetConstructor === 'string') {
            return false;
        }
        if (dnode1.node.widgetConstructor !== dnode2.node.widgetConstructor) {
            return false;
        }
        if (dnode1.node.properties.key !== dnode2.node.properties.key) {
            return false;
        }
        return true;
    }
    return false;
}
function findIndexOfChild(children, sameAs, start) {
    for (let i = start; i < children.length; i++) {
        if (same(children[i], sameAs)) {
            return i;
        }
    }
    return -1;
}
function createClassPropValue(classes = []) {
    classes = Array.isArray(classes) ? classes : [classes];
    return classes.join(' ').trim();
}
function updateAttribute(domNode, attrName, attrValue, namespace) {
    if (namespace === NAMESPACE_SVG && attrName === 'href' && attrValue) {
        domNode.setAttributeNS(NAMESPACE_XLINK, attrName, attrValue);
    }
    else if ((attrName === 'role' && attrValue === '') || attrValue === undefined) {
        domNode.removeAttribute(attrName);
    }
    else {
        domNode.setAttribute(attrName, attrValue);
    }
}
function runEnterAnimation(next, transitions) {
    const { domNode, node: { properties }, node: { properties: { enterAnimation } } } = next;
    if (enterAnimation) {
        if (typeof enterAnimation === 'function') {
            return enterAnimation(domNode, properties);
        }
        transitions.enter(domNode, properties, enterAnimation);
    }
}
function runExitAnimation(current, transitions) {
    const { domNode, node: { properties }, node: { properties: { exitAnimation } } } = current;
    const removeDomNode = () => {
        domNode && domNode.parentNode && domNode.parentNode.removeChild(domNode);
        current.domNode = undefined;
    };
    if (typeof exitAnimation === 'function') {
        return exitAnimation(domNode, removeDomNode, properties);
    }
    transitions.exit(domNode, properties, exitAnimation, removeDomNode);
}
function arrayFrom(arr) {
    return Array.prototype.slice.call(arr);
}
function wrapVNodes(nodes) {
    return class extends __WEBPACK_IMPORTED_MODULE_6__WidgetBase__["a" /* WidgetBase */] {
        render() {
            return nodes;
        }
    };
}
function renderer(renderer) {
    let _mountOptions = {
        sync: false,
        merge: true,
        transition: __WEBPACK_IMPORTED_MODULE_3__animations_cssTransitions__["a" /* default */],
        domNode: __WEBPACK_IMPORTED_MODULE_0__shim_global__["a" /* default */].document.body,
        registry: null
    };
    let _invalidationQueue = [];
    let _processQueue = [];
    let _applicationQueue = [];
    let _eventMap = new __WEBPACK_IMPORTED_MODULE_2__shim_WeakMap__["a" /* WeakMap */]();
    let _instanceToWrapperMap = new __WEBPACK_IMPORTED_MODULE_2__shim_WeakMap__["a" /* WeakMap */]();
    let _parentWrapperMap = new __WEBPACK_IMPORTED_MODULE_2__shim_WeakMap__["a" /* WeakMap */]();
    let _wrapperSiblingMap = new __WEBPACK_IMPORTED_MODULE_2__shim_WeakMap__["a" /* WeakMap */]();
    let _renderScheduled;
    let _afterRenderCallbacks = [];
    let _deferredRenderCallbacks = [];
    let parentInvalidate;
    function nodeOperation(propName, propValue, previousValue, domNode) {
        let result = propValue && !previousValue;
        if (typeof propValue === 'function') {
            result = propValue();
        }
        if (result === true) {
            _afterRenderCallbacks.push(() => {
                domNode[propName]();
            });
        }
    }
    function updateEvent(domNode, eventName, currentValue, bind, previousValue) {
        if (previousValue) {
            const previousEvent = _eventMap.get(previousValue);
            domNode.removeEventListener(eventName, previousEvent);
        }
        let callback = currentValue.bind(bind);
        if (eventName === 'input') {
            callback = function (evt) {
                currentValue.call(this, evt);
                evt.target['oninput-value'] = evt.target.value;
            }.bind(bind);
        }
        domNode.addEventListener(eventName, callback);
        _eventMap.set(currentValue, callback);
    }
    function removeOrphanedEvents(domNode, previousProperties, properties, onlyEvents = false) {
        Object.keys(previousProperties).forEach((propName) => {
            const isEvent = propName.substr(0, 2) === 'on' || onlyEvents;
            const eventName = onlyEvents ? propName : propName.substr(2);
            if (isEvent && !properties[propName]) {
                const eventCallback = _eventMap.get(previousProperties[propName]);
                if (eventCallback) {
                    domNode.removeEventListener(eventName, eventCallback);
                }
            }
        });
    }
    function renderedToWrapper(rendered, parent, currentParent) {
        const wrappedRendered = [];
        const hasParentWNode = isWNodeWrapper(parent);
        const currentParentLength = isVNodeWrapper(currentParent) && (currentParent.childrenWrappers || []).length > 1;
        const requiresInsertBefore = ((parent.requiresInsertBefore || parent.hasPreviousSiblings !== false) && hasParentWNode) ||
            currentParentLength;
        let previousItem;
        for (let i = 0; i < rendered.length; i++) {
            const renderedItem = rendered[i];
            const wrapper = {
                node: renderedItem,
                depth: parent.depth + 1,
                requiresInsertBefore,
                hasParentWNode,
                namespace: parent.namespace
            };
            if (Object(__WEBPACK_IMPORTED_MODULE_4__d__["e" /* isVNode */])(renderedItem) && renderedItem.properties.exitAnimation) {
                parent.hasAnimations = true;
                let nextParent = _parentWrapperMap.get(parent);
                while (nextParent) {
                    if (nextParent.hasAnimations) {
                        break;
                    }
                    nextParent.hasAnimations = true;
                    nextParent = _parentWrapperMap.get(nextParent);
                }
            }
            _parentWrapperMap.set(wrapper, parent);
            if (previousItem) {
                _wrapperSiblingMap.set(previousItem, wrapper);
            }
            wrappedRendered.push(wrapper);
            previousItem = wrapper;
        }
        return wrappedRendered;
    }
    function findParentWNodeWrapper(currentNode) {
        let parentWNodeWrapper;
        let parentWrapper = _parentWrapperMap.get(currentNode);
        while (!parentWNodeWrapper && parentWrapper) {
            if (!parentWNodeWrapper && isWNodeWrapper(parentWrapper)) {
                parentWNodeWrapper = parentWrapper;
            }
            parentWrapper = _parentWrapperMap.get(parentWrapper);
        }
        return parentWNodeWrapper;
    }
    function findParentDomNode(currentNode) {
        let parentDomNode;
        let parentWrapper = _parentWrapperMap.get(currentNode);
        while (!parentDomNode && parentWrapper) {
            if (!parentDomNode && isVNodeWrapper(parentWrapper) && parentWrapper.domNode) {
                parentDomNode = parentWrapper.domNode;
            }
            parentWrapper = _parentWrapperMap.get(parentWrapper);
        }
        return parentDomNode;
    }
    function runDeferredProperties(next) {
        if (next.node.deferredPropertiesCallback) {
            const properties = next.node.properties;
            next.node.properties = Object.assign({}, next.node.deferredPropertiesCallback(true), next.node.originalProperties);
            _afterRenderCallbacks.push(() => {
                processProperties(next, { properties });
            });
        }
    }
    function findInsertBefore(next) {
        let insertBefore = null;
        let searchNode = next;
        while (!insertBefore) {
            const nextSibling = _wrapperSiblingMap.get(searchNode);
            if (nextSibling) {
                if (isVNodeWrapper(nextSibling)) {
                    if (nextSibling.domNode && nextSibling.domNode.parentNode) {
                        insertBefore = nextSibling.domNode;
                        break;
                    }
                    searchNode = nextSibling;
                    continue;
                }
                if (nextSibling.domNode && nextSibling.domNode.parentNode) {
                    insertBefore = nextSibling.domNode;
                    break;
                }
                searchNode = nextSibling;
                continue;
            }
            searchNode = _parentWrapperMap.get(searchNode);
            if (!searchNode || isVNodeWrapper(searchNode)) {
                break;
            }
        }
        return insertBefore;
    }
    function setProperties(domNode, currentProperties = {}, nextWrapper, includesEventsAndAttributes = true) {
        const propNames = Object.keys(nextWrapper.node.properties);
        const propCount = propNames.length;
        if (propNames.indexOf('classes') === -1 && currentProperties.classes) {
            domNode.removeAttribute('class');
        }
        includesEventsAndAttributes && removeOrphanedEvents(domNode, currentProperties, nextWrapper.node.properties);
        for (let i = 0; i < propCount; i++) {
            const propName = propNames[i];
            let propValue = nextWrapper.node.properties[propName];
            const previousValue = currentProperties[propName];
            if (propName === 'classes') {
                const previousClassString = createClassPropValue(previousValue);
                let currentClassString = createClassPropValue(propValue);
                if (previousClassString !== currentClassString) {
                    if (currentClassString) {
                        if (nextWrapper.merged) {
                            const domClasses = (domNode.getAttribute('class') || '').split(' ');
                            for (let i = 0; i < domClasses.length; i++) {
                                if (currentClassString.indexOf(domClasses[i]) === -1) {
                                    currentClassString = `${domClasses[i]} ${currentClassString}`;
                                }
                            }
                        }
                        domNode.setAttribute('class', currentClassString);
                    }
                    else {
                        domNode.removeAttribute('class');
                    }
                }
            }
            else if (nodeOperations.indexOf(propName) !== -1) {
                nodeOperation(propName, propValue, previousValue, domNode);
            }
            else if (propName === 'styles') {
                const styleNames = Object.keys(propValue);
                const styleCount = styleNames.length;
                for (let j = 0; j < styleCount; j++) {
                    const styleName = styleNames[j];
                    const newStyleValue = propValue[styleName];
                    const oldStyleValue = previousValue && previousValue[styleName];
                    if (newStyleValue === oldStyleValue) {
                        continue;
                    }
                    domNode.style[styleName] = newStyleValue || '';
                }
            }
            else {
                if (!propValue && typeof previousValue === 'string') {
                    propValue = '';
                }
                if (propName === 'value') {
                    const domValue = domNode[propName];
                    if (domValue !== propValue &&
                        (domNode['oninput-value']
                            ? domValue === domNode['oninput-value']
                            : propValue !== previousValue)) {
                        domNode[propName] = propValue;
                        domNode['oninput-value'] = undefined;
                    }
                }
                else if (propName !== 'key' && propValue !== previousValue) {
                    const type = typeof propValue;
                    if (type === 'function' && propName.lastIndexOf('on', 0) === 0 && includesEventsAndAttributes) {
                        updateEvent(domNode, propName.substr(2), propValue, nextWrapper.node.bind, previousValue);
                    }
                    else if (type === 'string' && propName !== 'innerHTML' && includesEventsAndAttributes) {
                        updateAttribute(domNode, propName, propValue, nextWrapper.namespace);
                    }
                    else if (propName === 'scrollLeft' || propName === 'scrollTop') {
                        if (domNode[propName] !== propValue) {
                            domNode[propName] = propValue;
                        }
                    }
                    else {
                        domNode[propName] = propValue;
                    }
                }
            }
        }
    }
    function runDeferredRenderCallbacks() {
        const { sync } = _mountOptions;
        const callbacks = _deferredRenderCallbacks;
        _deferredRenderCallbacks = [];
        if (callbacks.length) {
            const run = () => {
                let callback;
                while ((callback = callbacks.shift())) {
                    callback();
                }
            };
            if (sync) {
                run();
            }
            else {
                __WEBPACK_IMPORTED_MODULE_0__shim_global__["a" /* default */].requestAnimationFrame(run);
            }
        }
    }
    function runAfterRenderCallbacks() {
        const { sync } = _mountOptions;
        const callbacks = _afterRenderCallbacks;
        _afterRenderCallbacks = [];
        if (callbacks.length) {
            const run = () => {
                let callback;
                while ((callback = callbacks.shift())) {
                    callback();
                }
            };
            if (sync) {
                run();
            }
            else {
                if (__WEBPACK_IMPORTED_MODULE_0__shim_global__["a" /* default */].requestIdleCallback) {
                    __WEBPACK_IMPORTED_MODULE_0__shim_global__["a" /* default */].requestIdleCallback(run);
                }
                else {
                    setTimeout(run);
                }
            }
        }
    }
    function processProperties(next, previousProperties) {
        if (next.node.attributes && next.node.events) {
            updateAttributes(next.domNode, previousProperties.attributes || {}, next.node.attributes, next.namespace);
            setProperties(next.domNode, previousProperties.properties, next, false);
            const events = next.node.events || {};
            if (previousProperties.events) {
                removeOrphanedEvents(next.domNode, previousProperties.events || {}, next.node.events, true);
            }
            previousProperties.events = previousProperties.events || {};
            Object.keys(events).forEach((event) => {
                updateEvent(next.domNode, event, events[event], next.node.bind, previousProperties.events[event]);
            });
        }
        else {
            setProperties(next.domNode, previousProperties.properties, next);
        }
    }
    function mount(mountOptions = {}) {
        _mountOptions = Object.assign({}, _mountOptions, mountOptions);
        const { domNode } = _mountOptions;
        let renderResult = renderer();
        if (Object(__WEBPACK_IMPORTED_MODULE_4__d__["e" /* isVNode */])(renderResult)) {
            renderResult = Object(__WEBPACK_IMPORTED_MODULE_4__d__["h" /* w */])(wrapVNodes(renderResult), {});
        }
        const nextWrapper = {
            node: renderResult,
            depth: 1
        };
        _parentWrapperMap.set(nextWrapper, { depth: 0, domNode, node: Object(__WEBPACK_IMPORTED_MODULE_4__d__["g" /* v */])('fake') });
        _processQueue.push({
            current: [],
            next: [nextWrapper],
            meta: { mergeNodes: arrayFrom(domNode.childNodes) }
        });
        _runProcessQueue();
        _mountOptions.merge = false;
        _runDomInstructionQueue();
        _runCallbacks();
    }
    function invalidate() {
        parentInvalidate && parentInvalidate();
    }
    function _schedule() {
        const { sync } = _mountOptions;
        if (sync) {
            _runInvalidationQueue();
        }
        else if (!_renderScheduled) {
            _renderScheduled = __WEBPACK_IMPORTED_MODULE_0__shim_global__["a" /* default */].requestAnimationFrame(() => {
                _runInvalidationQueue();
            });
        }
    }
    function _runInvalidationQueue() {
        _renderScheduled = undefined;
        const invalidationQueue = [..._invalidationQueue];
        const previouslyRendered = [];
        _invalidationQueue = [];
        invalidationQueue.sort((a, b) => b.depth - a.depth);
        let item;
        while ((item = invalidationQueue.pop())) {
            let { instance } = item;
            if (previouslyRendered.indexOf(instance) === -1 && _instanceToWrapperMap.has(instance)) {
                previouslyRendered.push(instance);
                const current = _instanceToWrapperMap.get(instance);
                const instanceData = __WEBPACK_IMPORTED_MODULE_6__WidgetBase__["d" /* widgetInstanceMap */].get(instance);
                const parent = _parentWrapperMap.get(current);
                const sibling = _wrapperSiblingMap.get(current);
                const { constructor, children } = instance;
                const next = {
                    node: {
                        type: __WEBPACK_IMPORTED_MODULE_4__d__["b" /* WNODE */],
                        widgetConstructor: constructor,
                        properties: instanceData.inputProperties,
                        children: children,
                        bind: current.node.bind
                    },
                    instance,
                    depth: current.depth
                };
                parent && _parentWrapperMap.set(next, parent);
                sibling && _wrapperSiblingMap.set(next, sibling);
                const { item } = _updateWidget({ current, next });
                if (item) {
                    _processQueue.push(item);
                    instance && _instanceToWrapperMap.set(instance, next);
                    _runProcessQueue();
                }
            }
        }
        _runDomInstructionQueue();
        _runCallbacks();
    }
    function _runProcessQueue() {
        let item;
        while ((item = _processQueue.pop())) {
            if (isAttachApplication(item)) {
                _applicationQueue.push(item);
            }
            else {
                const { current, next, meta } = item;
                _process(current || EMPTY_ARRAY, next || EMPTY_ARRAY, meta);
            }
        }
    }
    function _runDomInstructionQueue() {
        _applicationQueue.reverse();
        let item;
        while ((item = _applicationQueue.pop())) {
            if (item.type === 'create') {
                const { parentDomNode, next, next: { domNode, merged, requiresInsertBefore, node: { properties } } } = item;
                processProperties(next, { properties: {} });
                runDeferredProperties(next);
                if (!merged) {
                    let insertBefore;
                    if (requiresInsertBefore) {
                        insertBefore = findInsertBefore(next);
                    }
                    parentDomNode.insertBefore(domNode, insertBefore);
                    if (Object(__WEBPACK_IMPORTED_MODULE_4__d__["d" /* isDomVNode */])(next.node) && next.node.onAttach) {
                        next.node.onAttach();
                    }
                }
                runEnterAnimation(next, _mountOptions.transition);
                const instanceData = __WEBPACK_IMPORTED_MODULE_6__WidgetBase__["d" /* widgetInstanceMap */].get(next.node.bind);
                if (properties.key != null && instanceData) {
                    instanceData.nodeHandler.add(domNode, `${properties.key}`);
                }
                item.next.inserted = true;
            }
            else if (item.type === 'update') {
                const { next, next: { domNode, node }, current } = item;
                const parent = _parentWrapperMap.get(next);
                if (parent && isWNodeWrapper(parent) && parent.instance) {
                    const instanceData = __WEBPACK_IMPORTED_MODULE_6__WidgetBase__["d" /* widgetInstanceMap */].get(parent.instance);
                    instanceData && instanceData.nodeHandler.addRoot();
                }
                const previousProperties = buildPreviousProperties(domNode, current, next);
                const instanceData = __WEBPACK_IMPORTED_MODULE_6__WidgetBase__["d" /* widgetInstanceMap */].get(next.node.bind);
                processProperties(next, previousProperties);
                runDeferredProperties(next);
                if (instanceData && node.properties.key != null) {
                    instanceData.nodeHandler.add(next.domNode, `${node.properties.key}`);
                }
            }
            else if (item.type === 'delete') {
                const { current } = item;
                if (current.node.properties.exitAnimation) {
                    runExitAnimation(current, _mountOptions.transition);
                }
                else {
                    current.domNode.parentNode.removeChild(current.domNode);
                    current.domNode = undefined;
                }
            }
            else if (item.type === 'attach') {
                const { instance, attached } = item;
                const instanceData = __WEBPACK_IMPORTED_MODULE_6__WidgetBase__["d" /* widgetInstanceMap */].get(instance);
                instanceData.nodeHandler.addRoot();
                attached && instanceData.onAttach();
            }
            else if (item.type === 'detach') {
                if (item.current.instance) {
                    const instanceData = __WEBPACK_IMPORTED_MODULE_6__WidgetBase__["d" /* widgetInstanceMap */].get(item.current.instance);
                    instanceData && instanceData.onDetach();
                }
                item.current.domNode = undefined;
                item.current.node.bind = undefined;
                item.current.instance = undefined;
            }
        }
    }
    function _runCallbacks() {
        runAfterRenderCallbacks();
        runDeferredRenderCallbacks();
    }
    function _processMergeNodes(next, mergeNodes) {
        const { merge } = _mountOptions;
        if (merge && mergeNodes.length) {
            if (isVNodeWrapper(next)) {
                let { node: { tag } } = next;
                for (let i = 0; i < mergeNodes.length; i++) {
                    const domElement = mergeNodes[i];
                    if (tag.toUpperCase() === (domElement.tagName || '')) {
                        mergeNodes.splice(i, 1);
                        next.domNode = domElement;
                        break;
                    }
                }
            }
            else {
                next.mergeNodes = mergeNodes;
            }
        }
    }
    function registerDistinguishableCallback(childNodes, index) {
        _afterRenderCallbacks.push(() => {
            const parentWNodeWrapper = findParentWNodeWrapper(childNodes[index]);
            checkDistinguishable(childNodes, index, parentWNodeWrapper);
        });
    }
    function _process(current, next, meta = {}) {
        let { mergeNodes = [], oldIndex = 0, newIndex = 0 } = meta;
        const currentLength = current.length;
        const nextLength = next.length;
        const hasPreviousSiblings = currentLength > 1 || (currentLength > 0 && currentLength < nextLength);
        const instructions = [];
        if (newIndex < nextLength) {
            let currentWrapper = oldIndex < currentLength ? current[oldIndex] : undefined;
            const nextWrapper = next[newIndex];
            nextWrapper.hasPreviousSiblings = hasPreviousSiblings;
            _processMergeNodes(nextWrapper, mergeNodes);
            if (currentWrapper && same(currentWrapper, nextWrapper)) {
                oldIndex++;
                newIndex++;
                if (isVNodeWrapper(currentWrapper) && isVNodeWrapper(nextWrapper)) {
                    nextWrapper.inserted = currentWrapper.inserted;
                }
                instructions.push({ current: currentWrapper, next: nextWrapper });
            }
            else if (!currentWrapper || findIndexOfChild(current, nextWrapper, oldIndex + 1) === -1) {
                true && current.length && registerDistinguishableCallback(next, newIndex);
                instructions.push({ current: undefined, next: nextWrapper });
                newIndex++;
            }
            else if (findIndexOfChild(next, currentWrapper, newIndex + 1) === -1) {
                true && registerDistinguishableCallback(current, oldIndex);
                instructions.push({ current: currentWrapper, next: undefined });
                oldIndex++;
            }
            else {
                true && registerDistinguishableCallback(next, newIndex);
                true && registerDistinguishableCallback(current, oldIndex);
                instructions.push({ current: currentWrapper, next: undefined });
                instructions.push({ current: undefined, next: nextWrapper });
                oldIndex++;
                newIndex++;
            }
        }
        if (newIndex < nextLength) {
            _processQueue.push({ current, next, meta: { mergeNodes, oldIndex, newIndex } });
        }
        if (currentLength > oldIndex && newIndex >= nextLength) {
            for (let i = oldIndex; i < currentLength; i++) {
                true && registerDistinguishableCallback(current, i);
                instructions.push({ current: current[i], next: undefined });
            }
        }
        for (let i = 0; i < instructions.length; i++) {
            const { item, dom, widget } = _processOne(instructions[i]);
            widget && _processQueue.push(widget);
            item && _processQueue.push(item);
            dom && _applicationQueue.push(dom);
        }
    }
    function _processOne({ current, next }) {
        if (current !== next) {
            if (!current && next) {
                if (isVNodeWrapper(next)) {
                    return _createDom({ next });
                }
                else {
                    return _createWidget({ next });
                }
            }
            else if (current && next) {
                if (isVNodeWrapper(current) && isVNodeWrapper(next)) {
                    return _updateDom({ current, next });
                }
                else if (isWNodeWrapper(current) && isWNodeWrapper(next)) {
                    return _updateWidget({ current, next });
                }
            }
            else if (current && !next) {
                if (isVNodeWrapper(current)) {
                    return _removeDom({ current });
                }
                else if (isWNodeWrapper(current)) {
                    return _removeWidget({ current });
                }
            }
        }
        return {};
    }
    function _createWidget({ next }) {
        let { node: { widgetConstructor } } = next;
        let { registry } = _mountOptions;
        if (!Object(__WEBPACK_IMPORTED_MODULE_5__Registry__["d" /* isWidgetBaseConstructor */])(widgetConstructor)) {
            return {};
        }
        const instance = new widgetConstructor();
        if (registry) {
            instance.registry.base = registry;
        }
        const instanceData = __WEBPACK_IMPORTED_MODULE_6__WidgetBase__["d" /* widgetInstanceMap */].get(instance);
        instanceData.invalidate = () => {
            instanceData.dirty = true;
            if (!instanceData.rendering && _instanceToWrapperMap.has(instance)) {
                _invalidationQueue.push({ instance, depth: next.depth });
                _schedule();
            }
        };
        instanceData.rendering = true;
        instance.__setProperties__(next.node.properties, next.node.bind);
        instance.__setChildren__(next.node.children);
        next.instance = instance;
        let rendered = instance.__render__();
        instanceData.rendering = false;
        if (rendered) {
            rendered = Array.isArray(rendered) ? rendered : [rendered];
            next.childrenWrappers = renderedToWrapper(rendered, next, null);
        }
        if (next.instance) {
            _instanceToWrapperMap.set(next.instance, next);
            if (!parentInvalidate) {
                parentInvalidate = next.instance.invalidate.bind(next.instance);
            }
        }
        return {
            item: { next: next.childrenWrappers, meta: { mergeNodes: next.mergeNodes } },
            widget: { type: 'attach', instance, attached: true }
        };
    }
    function _updateWidget({ current, next }) {
        current = (current.instance && _instanceToWrapperMap.get(current.instance)) || current;
        const { instance, domNode, hasAnimations } = current;
        if (!instance) {
            return [];
        }
        const instanceData = __WEBPACK_IMPORTED_MODULE_6__WidgetBase__["d" /* widgetInstanceMap */].get(instance);
        next.instance = instance;
        next.domNode = domNode;
        next.hasAnimations = hasAnimations;
        instanceData.rendering = true;
        instance.__setProperties__(next.node.properties, next.node.bind);
        instance.__setChildren__(next.node.children);
        _instanceToWrapperMap.set(next.instance, next);
        if (instanceData.dirty) {
            let rendered = instance.__render__();
            instanceData.rendering = false;
            if (rendered) {
                rendered = Array.isArray(rendered) ? rendered : [rendered];
                next.childrenWrappers = renderedToWrapper(rendered, next, current);
            }
            return {
                item: { current: current.childrenWrappers, next: next.childrenWrappers, meta: {} },
                widget: { type: 'attach', instance, attached: false }
            };
        }
        instanceData.rendering = false;
        next.childrenWrappers = current.childrenWrappers;
        return {
            widget: { type: 'attach', instance, attached: false }
        };
    }
    function _removeWidget({ current }) {
        current = current.instance ? _instanceToWrapperMap.get(current.instance) : current;
        _wrapperSiblingMap.delete(current);
        _parentWrapperMap.delete(current);
        _instanceToWrapperMap.delete(current.instance);
        return {
            item: { current: current.childrenWrappers, meta: {} },
            widget: { type: 'detach', current }
        };
    }
    function _createDom({ next }) {
        let mergeNodes = [];
        if (!next.domNode) {
            if (next.node.domNode) {
                next.domNode = next.node.domNode;
            }
            else {
                if (next.node.tag === 'svg') {
                    next.namespace = NAMESPACE_SVG;
                }
                if (next.node.tag) {
                    if (next.namespace) {
                        next.domNode = __WEBPACK_IMPORTED_MODULE_0__shim_global__["a" /* default */].document.createElementNS(next.namespace, next.node.tag);
                    }
                    else {
                        next.domNode = __WEBPACK_IMPORTED_MODULE_0__shim_global__["a" /* default */].document.createElement(next.node.tag);
                    }
                }
                else if (next.node.text != null) {
                    next.domNode = __WEBPACK_IMPORTED_MODULE_0__shim_global__["a" /* default */].document.createTextNode(next.node.text);
                }
            }
        }
        else {
            next.merged = true;
        }
        if (next.domNode) {
            if (_mountOptions.merge) {
                mergeNodes = arrayFrom(next.domNode.childNodes);
            }
            if (next.node.children) {
                next.childrenWrappers = renderedToWrapper(next.node.children, next, null);
            }
        }
        const parentWNodeWrapper = findParentWNodeWrapper(next);
        if (parentWNodeWrapper && !parentWNodeWrapper.domNode) {
            parentWNodeWrapper.domNode = next.domNode;
        }
        const dom = {
            next: next,
            parentDomNode: findParentDomNode(next),
            type: 'create'
        };
        if (next.childrenWrappers) {
            return {
                item: { current: [], next: next.childrenWrappers, meta: { mergeNodes } },
                dom
            };
        }
        return { dom };
    }
    function _updateDom({ current, next }) {
        const parentDomNode = findParentDomNode(current);
        next.domNode = current.domNode;
        next.namespace = current.namespace;
        if (next.node.text && next.node.text !== current.node.text) {
            const updatedTextNode = parentDomNode.ownerDocument.createTextNode(next.node.text);
            parentDomNode.replaceChild(updatedTextNode, next.domNode);
            next.domNode = updatedTextNode;
        }
        else if (next.node.children) {
            const children = renderedToWrapper(next.node.children, next, current);
            next.childrenWrappers = children;
        }
        return {
            item: { current: current.childrenWrappers, next: next.childrenWrappers, meta: {} },
            dom: { type: 'update', next, current }
        };
    }
    function _removeDom({ current }) {
        _wrapperSiblingMap.delete(current);
        _parentWrapperMap.delete(current);
        current.node.bind = undefined;
        if (current.hasAnimations) {
            return {
                item: { current: current.childrenWrappers, meta: {} },
                dom: { type: 'delete', current }
            };
        }
        if (current.childrenWrappers) {
            _afterRenderCallbacks.push(() => {
                let wrappers = current.childrenWrappers || [];
                let wrapper;
                while ((wrapper = wrappers.pop())) {
                    if (wrapper.childrenWrappers) {
                        wrappers.push(...wrapper.childrenWrappers);
                        wrapper.childrenWrappers = undefined;
                    }
                    if (isWNodeWrapper(wrapper)) {
                        if (wrapper.instance) {
                            _instanceToWrapperMap.delete(wrapper.instance);
                            const instanceData = __WEBPACK_IMPORTED_MODULE_6__WidgetBase__["d" /* widgetInstanceMap */].get(wrapper.instance);
                            instanceData && instanceData.onDetach();
                        }
                        wrapper.instance = undefined;
                    }
                    _wrapperSiblingMap.delete(wrapper);
                    _parentWrapperMap.delete(wrapper);
                    wrapper.domNode = undefined;
                    wrapper.node.bind = undefined;
                }
            });
        }
        return {
            dom: { type: 'delete', current }
        };
    }
    return {
        mount,
        invalidate
    };
}
/* harmony default export */ __webpack_exports__["a"] = (renderer);


/***/ }),

/***/ "./node_modules/@dojo/themes/dojo/index.css":
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ "./node_modules/@dojo/webpack-contrib/build-time-render/hasBuildTimeRender.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// tslint:disable-next-line
var has = __webpack_require__("./node_modules/@dojo/framework/has/has.mjs");
if (!has.exists('build-time-render')) {
    has.add('build-time-render', false, false);
}


/***/ }),

/***/ "./node_modules/@dojo/widgets/common/styles/base.m.css":
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin
module.exports = {" _key":"catsvsdogs/base","_1AeWeApr":"base-m___1AeWeApr__X16v2","_1_qANqXi":"base-m___1_qANqXi__1vxZm","_3QddUiBU":"base-m___3QddUiBU__Io4f-"};

/***/ }),

/***/ "./node_modules/@dojo/widgets/common/styles/base.m.css.js":
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;__webpack_require__("./node_modules/@dojo/widgets/common/styles/base.m.css");
(function (root, factory) {
if (true) {
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () { return (factory()); }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
} else if (typeof module === 'object' && module.exports) {
	module.exports = factory();
}
}(this, function () {
	return {"visuallyHidden":"_1AeWeApr","focusable":"_1_qANqXi","hidden":"_3QddUiBU"," _key":"@dojo/widgets/base"};
}));;

/***/ }),

/***/ "./node_modules/@dojo/widgets/common/util.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export Keys */
/* harmony export (immutable) */ __webpack_exports__["a"] = formatAriaProperties;
var Keys;
(function (Keys) {
    Keys[Keys["Down"] = 40] = "Down";
    Keys[Keys["End"] = 35] = "End";
    Keys[Keys["Enter"] = 13] = "Enter";
    Keys[Keys["Escape"] = 27] = "Escape";
    Keys[Keys["Home"] = 36] = "Home";
    Keys[Keys["Left"] = 37] = "Left";
    Keys[Keys["PageDown"] = 34] = "PageDown";
    Keys[Keys["PageUp"] = 33] = "PageUp";
    Keys[Keys["Right"] = 39] = "Right";
    Keys[Keys["Space"] = 32] = "Space";
    Keys[Keys["Tab"] = 9] = "Tab";
    Keys[Keys["Up"] = 38] = "Up";
})(Keys || (Keys = {}));
function formatAriaProperties(aria) {
    const formattedAria = Object.keys(aria).reduce((a, key) => {
        a[`aria-${key.toLowerCase()}`] = aria[key];
        return a;
    }, {});
    return formattedAria;
}


/***/ }),

/***/ "./node_modules/@dojo/widgets/label/index.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export LabelBase */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__("./node_modules/tslib/tslib.es6.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__dojo_framework_widget_core_WidgetBase__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/WidgetBase.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__dojo_framework_widget_core_mixins_Themed__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/mixins/Themed.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__dojo_framework_widget_core_d__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/d.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__common_util__ = __webpack_require__("./node_modules/@dojo/widgets/common/util.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__theme_label_m_css__ = __webpack_require__("./node_modules/@dojo/widgets/theme/label.m.css.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__theme_label_m_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5__theme_label_m_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__common_styles_base_m_css__ = __webpack_require__("./node_modules/@dojo/widgets/common/styles/base.m.css.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__common_styles_base_m_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6__common_styles_base_m_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__dojo_framework_widget_core_decorators_customElement__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/decorators/customElement.mjs");








const ThemedBase = Object(__WEBPACK_IMPORTED_MODULE_2__dojo_framework_widget_core_mixins_Themed__["a" /* ThemedMixin */])(__WEBPACK_IMPORTED_MODULE_1__dojo_framework_widget_core_WidgetBase__["a" /* WidgetBase */]);
/* unused harmony export ThemedBase */

let LabelBase = class LabelBase extends ThemedBase {
    getRootClasses() {
        const { disabled, focused, invalid, readOnly, required, secondary } = this.properties;
        return [
            __WEBPACK_IMPORTED_MODULE_5__theme_label_m_css__["root"],
            disabled ? __WEBPACK_IMPORTED_MODULE_5__theme_label_m_css__["disabled"] : null,
            focused ? __WEBPACK_IMPORTED_MODULE_5__theme_label_m_css__["focused"] : null,
            invalid === true ? __WEBPACK_IMPORTED_MODULE_5__theme_label_m_css__["invalid"] : null,
            invalid === false ? __WEBPACK_IMPORTED_MODULE_5__theme_label_m_css__["valid"] : null,
            readOnly ? __WEBPACK_IMPORTED_MODULE_5__theme_label_m_css__["readonly"] : null,
            required ? __WEBPACK_IMPORTED_MODULE_5__theme_label_m_css__["required"] : null,
            secondary ? __WEBPACK_IMPORTED_MODULE_5__theme_label_m_css__["secondary"] : null
        ];
    }
    render() {
        const { aria = {}, forId, hidden } = this.properties;
        return Object(__WEBPACK_IMPORTED_MODULE_3__dojo_framework_widget_core_d__["g" /* v */])('label', Object.assign({}, Object(__WEBPACK_IMPORTED_MODULE_4__common_util__["a" /* formatAriaProperties */])(aria), { classes: [
                ...this.theme(this.getRootClasses()),
                hidden ? __WEBPACK_IMPORTED_MODULE_6__common_styles_base_m_css__["visuallyHidden"] : null
            ], for: forId }), this.children);
    }
};
LabelBase = __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __decorate */]([
    Object(__WEBPACK_IMPORTED_MODULE_2__dojo_framework_widget_core_mixins_Themed__["d" /* theme */])(__WEBPACK_IMPORTED_MODULE_5__theme_label_m_css__),
    Object(__WEBPACK_IMPORTED_MODULE_7__dojo_framework_widget_core_decorators_customElement__["a" /* customElement */])({
        tag: 'dojo-label',
        properties: ['theme', 'aria', 'extraClasses', 'disabled', 'focused', 'readOnly', 'required', 'invalid', 'hidden', 'secondary'],
        attributes: [],
        events: []
    })
], LabelBase);

class Label extends LabelBase {
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Label;



/***/ }),

/***/ "./node_modules/@dojo/widgets/slider/index.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export SliderBase */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__("./node_modules/tslib/tslib.es6.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__dojo_framework_widget_core_WidgetBase__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/WidgetBase.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__dojo_framework_widget_core_mixins_Themed__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/mixins/Themed.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__dojo_framework_widget_core_mixins_Focus__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/mixins/Focus.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__label_index__ = __webpack_require__("./node_modules/@dojo/widgets/label/index.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__dojo_framework_widget_core_d__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/d.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__dojo_framework_widget_core_meta_Focus__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/meta/Focus.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__dojo_framework_core_util__ = __webpack_require__("./node_modules/@dojo/framework/core/util.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__common_util__ = __webpack_require__("./node_modules/@dojo/widgets/common/util.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__styles_slider_m_css__ = __webpack_require__("./node_modules/@dojo/widgets/slider/styles/slider.m.css.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__styles_slider_m_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_9__styles_slider_m_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__theme_slider_m_css__ = __webpack_require__("./node_modules/@dojo/widgets/theme/slider.m.css.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__theme_slider_m_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_10__theme_slider_m_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__dojo_framework_widget_core_decorators_customElement__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/decorators/customElement.mjs");












const ThemedBase = Object(__WEBPACK_IMPORTED_MODULE_2__dojo_framework_widget_core_mixins_Themed__["a" /* ThemedMixin */])(Object(__WEBPACK_IMPORTED_MODULE_3__dojo_framework_widget_core_mixins_Focus__["a" /* FocusMixin */])(__WEBPACK_IMPORTED_MODULE_1__dojo_framework_widget_core_WidgetBase__["a" /* WidgetBase */]));
/* unused harmony export ThemedBase */

function extractValue(event) {
    const value = event.target.value;
    return parseFloat(value);
}
let SliderBase = class SliderBase extends ThemedBase {
    constructor() {
        super(...arguments);
        // id used to associate input with output
        this._widgetId = Object(__WEBPACK_IMPORTED_MODULE_7__dojo_framework_core_util__["a" /* uuid */])();
    }
    _onBlur(event) {
        this.properties.onBlur && this.properties.onBlur(extractValue(event));
    }
    _onChange(event) {
        event.stopPropagation();
        this.properties.onChange && this.properties.onChange(extractValue(event));
    }
    _onClick(event) {
        event.stopPropagation();
        this.properties.onClick && this.properties.onClick(extractValue(event));
    }
    _onFocus(event) {
        this.properties.onFocus && this.properties.onFocus(extractValue(event));
    }
    _onInput(event) {
        event.stopPropagation();
        this.properties.onInput && this.properties.onInput(extractValue(event));
    }
    _onKeyDown(event) {
        event.stopPropagation();
        this.properties.onKeyDown && this.properties.onKeyDown(event.which, () => { event.preventDefault(); });
    }
    _onKeyPress(event) {
        event.stopPropagation();
        this.properties.onKeyPress && this.properties.onKeyPress(event.which, () => { event.preventDefault(); });
    }
    _onKeyUp(event) {
        event.stopPropagation();
        this.properties.onKeyUp && this.properties.onKeyUp(event.which, () => { event.preventDefault(); });
    }
    _onMouseDown(event) {
        event.stopPropagation();
        this.properties.onMouseDown && this.properties.onMouseDown();
    }
    _onMouseUp(event) {
        event.stopPropagation();
        this.properties.onMouseUp && this.properties.onMouseUp();
    }
    _onTouchStart(event) {
        event.stopPropagation();
        this.properties.onTouchStart && this.properties.onTouchStart();
    }
    _onTouchEnd(event) {
        event.stopPropagation();
        this.properties.onTouchEnd && this.properties.onTouchEnd();
    }
    _onTouchCancel(event) {
        event.stopPropagation();
        this.properties.onTouchCancel && this.properties.onTouchCancel();
    }
    getRootClasses() {
        const { disabled, invalid, readOnly, required, vertical = false } = this.properties;
        const focus = this.meta(__WEBPACK_IMPORTED_MODULE_6__dojo_framework_widget_core_meta_Focus__["a" /* default */]).get('root');
        return [
            __WEBPACK_IMPORTED_MODULE_10__theme_slider_m_css__["root"],
            disabled ? __WEBPACK_IMPORTED_MODULE_10__theme_slider_m_css__["disabled"] : null,
            focus.containsFocus ? __WEBPACK_IMPORTED_MODULE_10__theme_slider_m_css__["focused"] : null,
            invalid === true ? __WEBPACK_IMPORTED_MODULE_10__theme_slider_m_css__["invalid"] : null,
            invalid === false ? __WEBPACK_IMPORTED_MODULE_10__theme_slider_m_css__["valid"] : null,
            readOnly ? __WEBPACK_IMPORTED_MODULE_10__theme_slider_m_css__["readonly"] : null,
            required ? __WEBPACK_IMPORTED_MODULE_10__theme_slider_m_css__["required"] : null,
            vertical ? __WEBPACK_IMPORTED_MODULE_10__theme_slider_m_css__["vertical"] : null
        ];
    }
    renderControls(percentValue) {
        const { vertical = false, verticalHeight = '200px' } = this.properties;
        return Object(__WEBPACK_IMPORTED_MODULE_5__dojo_framework_widget_core_d__["g" /* v */])('div', {
            classes: [this.theme(__WEBPACK_IMPORTED_MODULE_10__theme_slider_m_css__["track"]), __WEBPACK_IMPORTED_MODULE_9__styles_slider_m_css__["trackFixed"]],
            'aria-hidden': 'true',
            styles: vertical ? { width: verticalHeight } : {}
        }, [
            Object(__WEBPACK_IMPORTED_MODULE_5__dojo_framework_widget_core_d__["g" /* v */])('span', {
                classes: [this.theme(__WEBPACK_IMPORTED_MODULE_10__theme_slider_m_css__["fill"]), __WEBPACK_IMPORTED_MODULE_9__styles_slider_m_css__["fillFixed"]],
                styles: { width: `${percentValue}%` }
            }),
            Object(__WEBPACK_IMPORTED_MODULE_5__dojo_framework_widget_core_d__["g" /* v */])('span', {
                classes: [this.theme(__WEBPACK_IMPORTED_MODULE_10__theme_slider_m_css__["thumb"]), __WEBPACK_IMPORTED_MODULE_9__styles_slider_m_css__["thumbFixed"]],
                styles: { left: `${percentValue}%` }
            })
        ]);
    }
    renderOutput(value, percentValue) {
        const { output, outputIsTooltip = false, vertical = false } = this.properties;
        const outputNode = output ? output(value) : `${value}`;
        // output styles
        let outputStyles = {};
        if (outputIsTooltip) {
            outputStyles = vertical ? { top: `${100 - percentValue}%` } : { left: `${percentValue}%` };
        }
        return Object(__WEBPACK_IMPORTED_MODULE_5__dojo_framework_widget_core_d__["g" /* v */])('output', {
            classes: this.theme([__WEBPACK_IMPORTED_MODULE_10__theme_slider_m_css__["output"], outputIsTooltip ? __WEBPACK_IMPORTED_MODULE_10__theme_slider_m_css__["outputTooltip"] : null]),
            for: this._widgetId,
            styles: outputStyles,
            tabIndex: -1 /* needed so Edge doesn't select the element while tabbing through */
        }, [outputNode]);
    }
    render() {
        const { aria = {}, disabled, widgetId = this._widgetId, invalid, label, labelAfter, labelHidden, max = 100, min = 0, name, readOnly, required, showOutput = true, step = 1, vertical = false, verticalHeight = '200px', theme } = this.properties;
        const focus = this.meta(__WEBPACK_IMPORTED_MODULE_6__dojo_framework_widget_core_meta_Focus__["a" /* default */]).get('root');
        let { value = min } = this.properties;
        value = value > max ? max : value;
        value = value < min ? min : value;
        const percentValue = (value - min) / (max - min) * 100;
        const slider = Object(__WEBPACK_IMPORTED_MODULE_5__dojo_framework_widget_core_d__["g" /* v */])('div', {
            classes: [this.theme(__WEBPACK_IMPORTED_MODULE_10__theme_slider_m_css__["inputWrapper"]), __WEBPACK_IMPORTED_MODULE_9__styles_slider_m_css__["inputWrapperFixed"]],
            styles: vertical ? { height: verticalHeight } : {}
        }, [
            Object(__WEBPACK_IMPORTED_MODULE_5__dojo_framework_widget_core_d__["g" /* v */])('input', Object.assign({ key: 'input' }, Object(__WEBPACK_IMPORTED_MODULE_8__common_util__["a" /* formatAriaProperties */])(aria), { classes: [this.theme(__WEBPACK_IMPORTED_MODULE_10__theme_slider_m_css__["input"]), __WEBPACK_IMPORTED_MODULE_9__styles_slider_m_css__["nativeInput"]], disabled, id: widgetId, focus: this.shouldFocus, 'aria-invalid': invalid === true ? 'true' : null, max: `${max}`, min: `${min}`, name,
                readOnly, 'aria-readonly': readOnly === true ? 'true' : null, required, step: `${step}`, styles: vertical ? { width: verticalHeight } : {}, type: 'range', value: `${value}`, onblur: this._onBlur, onchange: this._onChange, onclick: this._onClick, onfocus: this._onFocus, oninput: this._onInput, onkeydown: this._onKeyDown, onkeypress: this._onKeyPress, onkeyup: this._onKeyUp, onmousedown: this._onMouseDown, onmouseup: this._onMouseUp, ontouchstart: this._onTouchStart, ontouchend: this._onTouchEnd, ontouchcancel: this._onTouchCancel })),
            this.renderControls(percentValue),
            showOutput ? this.renderOutput(value, percentValue) : null
        ]);
        const children = [
            label ? Object(__WEBPACK_IMPORTED_MODULE_5__dojo_framework_widget_core_d__["h" /* w */])(__WEBPACK_IMPORTED_MODULE_4__label_index__["a" /* default */], {
                theme,
                disabled,
                focused: focus.containsFocus,
                invalid,
                readOnly,
                required,
                hidden: labelHidden,
                forId: widgetId
            }, [label]) : null,
            slider
        ];
        return Object(__WEBPACK_IMPORTED_MODULE_5__dojo_framework_widget_core_d__["g" /* v */])('div', {
            key: 'root',
            classes: [...this.theme(this.getRootClasses()), __WEBPACK_IMPORTED_MODULE_9__styles_slider_m_css__["rootFixed"]]
        }, labelAfter ? children.reverse() : children);
    }
};
SliderBase = __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __decorate */]([
    Object(__WEBPACK_IMPORTED_MODULE_2__dojo_framework_widget_core_mixins_Themed__["d" /* theme */])(__WEBPACK_IMPORTED_MODULE_10__theme_slider_m_css__),
    Object(__WEBPACK_IMPORTED_MODULE_11__dojo_framework_widget_core_decorators_customElement__["a" /* customElement */])({
        tag: 'dojo-slider',
        properties: [
            'theme',
            'aria',
            'extraClasses',
            'disabled',
            'invalid',
            'required',
            'readOnly',
            'labelAfter',
            'labelHidden',
            'max',
            'min',
            'output',
            'outputIsTooltip',
            'showOutput',
            'step',
            'vertical',
            'value'
        ],
        attributes: ['widgetId', 'label', 'name', 'verticalHeight'],
        events: [
            'onBlur',
            'onChange',
            'onClick',
            'onFocus',
            'onInput',
            'onKeyDown',
            'onKeyPress',
            'onKeyUp',
            'onMouseDown',
            'onMouseUp',
            'onTouchCancel',
            'onTouchEnd',
            'onTouchStart'
        ]
    })
], SliderBase);

class Slider extends SliderBase {
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Slider;



/***/ }),

/***/ "./node_modules/@dojo/widgets/slider/styles/slider.m.css":
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin
module.exports = {" _key":"catsvsdogs/slider","_2Il2tPLe":"slider-m___2Il2tPLe__2WJra","_1jutPfif":"slider-m___1jutPfif__2X68k","_1MyjV5_F":"slider-m___1MyjV5_F__2748x","_3pPQuSpx":"slider-m___3pPQuSpx__2QHEp","_2s0Axahi":"slider-m___2s0Axahi__b1Z2p","k3G_rSOO":"slider-m__k3G_rSOO__2_jBL"};

/***/ }),

/***/ "./node_modules/@dojo/widgets/slider/styles/slider.m.css.js":
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;__webpack_require__("./node_modules/@dojo/widgets/slider/styles/slider.m.css");
(function (root, factory) {
if (true) {
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () { return (factory()); }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
} else if (typeof module === 'object' && module.exports) {
	module.exports = factory();
}
}(this, function () {
	return {"rootFixed":"_2Il2tPLe","inputWrapperFixed":"_1jutPfif","fillFixed":"_1MyjV5_F","trackFixed":"_3pPQuSpx","thumbFixed":"k3G_rSOO","nativeInput":"_2s0Axahi"," _key":"@dojo/widgets/slider"};
}));;

/***/ }),

/***/ "./node_modules/@dojo/widgets/theme/label.m.css":
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin
module.exports = {" _key":"catsvsdogs/label","_2a_lwZi8":"label-m___2a_lwZi8__3Xy9q"};

/***/ }),

/***/ "./node_modules/@dojo/widgets/theme/label.m.css.js":
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;__webpack_require__("./node_modules/@dojo/widgets/theme/label.m.css");
(function (root, factory) {
if (true) {
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () { return (factory()); }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
} else if (typeof module === 'object' && module.exports) {
	module.exports = factory();
}
}(this, function () {
	return {"root":"_1Xn7GZjl","readonly":"_79gMw0vX","invalid":"_1HXQXand","valid":"_3TeO85nD","required":"_2a_lwZi8","disabled":"_3gv9ptxH","focused":"_2Qy2nYta","secondary":"_29UpR7Gd"," _key":"@dojo/widgets/label"};
}));;

/***/ }),

/***/ "./node_modules/@dojo/widgets/theme/slider.m.css":
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin
module.exports = {" _key":"catsvsdogs/slider","TcETX5TS":"slider-m__TcETX5TS__388rQ","_31JV4nx0":"slider-m___31JV4nx0__1w_SY","_1c4XRwH0":"slider-m___1c4XRwH0__9yt2A","_3b4yxB7A":"slider-m___3b4yxB7A__35UK4","_3tZxVK0T":"slider-m___3tZxVK0T__C-HdP","_23uNmbH1":"slider-m___23uNmbH1__1m3xi","_18XXqTIh":"slider-m___18XXqTIh__3jYua","_2Dd1H-Q1":"slider-m___2Dd1H-Q1__2CAaf","_3puiWsuE":"slider-m___3puiWsuE__1Qj_e","_3jKYxXAd":"slider-m___3jKYxXAd__1Vmgt","_2XyZkg_I":"slider-m___2XyZkg_I__2eVD1","_3mu14dHS":"slider-m___3mu14dHS__QED2q","juyYC47L":"slider-m__juyYC47L__3zAyu"};

/***/ }),

/***/ "./node_modules/@dojo/widgets/theme/slider.m.css.js":
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;__webpack_require__("./node_modules/@dojo/widgets/theme/slider.m.css");
(function (root, factory) {
if (true) {
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () { return (factory()); }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
} else if (typeof module === 'object' && module.exports) {
	module.exports = factory();
}
}(this, function () {
	return {"root":"N46gqrk0","outputTooltip":"TcETX5TS","vertical":"_31JV4nx0","input":"_3b4yxB7A","track":"_1c4XRwH0","disabled":"_23uNmbH1","readonly":"_3tZxVK0T","required":"_18XXqTIh","invalid":"_2Dd1H-Q1","thumb":"_3puiWsuE","valid":"_3jKYxXAd","inputWrapper":"_2XyZkg_I","focused":"_3mu14dHS","fill":"juyYC47L","output":"_2EoIZn7U"," _key":"@dojo/widgets/slider"};
}));;

/***/ }),

/***/ "./node_modules/process/browser.js":
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),

/***/ "./node_modules/tslib/tslib.es6.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export __extends */
/* unused harmony export __assign */
/* harmony export (immutable) */ __webpack_exports__["c"] = __rest;
/* harmony export (immutable) */ __webpack_exports__["b"] = __decorate;
/* unused harmony export __param */
/* unused harmony export __metadata */
/* harmony export (immutable) */ __webpack_exports__["a"] = __awaiter;
/* unused harmony export __generator */
/* unused harmony export __exportStar */
/* unused harmony export __values */
/* unused harmony export __read */
/* unused harmony export __spread */
/* unused harmony export __await */
/* unused harmony export __asyncGenerator */
/* unused harmony export __asyncDelegator */
/* unused harmony export __asyncValues */
/* unused harmony export __makeTemplateObject */
/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = Object.setPrototypeOf ||
    ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
    function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = Object.assign || function __assign(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }
    return t;
}

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
}

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __param(paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
}

function __metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function __exportStar(m, exports) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}

function __values(o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
}

function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}

function __spread() {
    for (var ar = [], i = 0; i < arguments.length; i++)
        ar = ar.concat(__read(arguments[i]));
    return ar;
}

function __await(v) {
    return this instanceof __await ? (this.v = v, this) : new __await(v);
}

function __asyncGenerator(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);  }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
}

function __asyncDelegator(o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { if (o[n]) i[n] = function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; }; }
}

function __asyncValues(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator];
    return m ? m.call(o) : typeof __values === "function" ? __values(o) : o[Symbol.iterator]();
}

function __makeTemplateObject(cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};


/***/ }),

/***/ "./node_modules/web-animations-js/web-animations-next-lite.min.js":
/***/ (function(module, exports) {

// Copyright 2014 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
//     You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//     See the License for the specific language governing permissions and
// limitations under the License.

!function(a,b){var c={},d={},e={};!function(a,b){function c(a){if("number"==typeof a)return a;var b={};for(var c in a)b[c]=a[c];return b}function d(){this._delay=0,this._endDelay=0,this._fill="none",this._iterationStart=0,this._iterations=1,this._duration=0,this._playbackRate=1,this._direction="normal",this._easing="linear",this._easingFunction=x}function e(){return a.isDeprecated("Invalid timing inputs","2016-03-02","TypeError exceptions will be thrown instead.",!0)}function f(b,c,e){var f=new d;return c&&(f.fill="both",f.duration="auto"),"number"!=typeof b||isNaN(b)?void 0!==b&&Object.getOwnPropertyNames(b).forEach(function(c){if("auto"!=b[c]){if(("number"==typeof f[c]||"duration"==c)&&("number"!=typeof b[c]||isNaN(b[c])))return;if("fill"==c&&-1==v.indexOf(b[c]))return;if("direction"==c&&-1==w.indexOf(b[c]))return;if("playbackRate"==c&&1!==b[c]&&a.isDeprecated("AnimationEffectTiming.playbackRate","2014-11-28","Use Animation.playbackRate instead."))return;f[c]=b[c]}}):f.duration=b,f}function g(a){return"number"==typeof a&&(a=isNaN(a)?{duration:0}:{duration:a}),a}function h(b,c){return b=a.numericTimingToObject(b),f(b,c)}function i(a,b,c,d){return a<0||a>1||c<0||c>1?x:function(e){function f(a,b,c){return 3*a*(1-c)*(1-c)*c+3*b*(1-c)*c*c+c*c*c}if(e<=0){var g=0;return a>0?g=b/a:!b&&c>0&&(g=d/c),g*e}if(e>=1){var h=0;return c<1?h=(d-1)/(c-1):1==c&&a<1&&(h=(b-1)/(a-1)),1+h*(e-1)}for(var i=0,j=1;i<j;){var k=(i+j)/2,l=f(a,c,k);if(Math.abs(e-l)<1e-5)return f(b,d,k);l<e?i=k:j=k}return f(b,d,k)}}function j(a,b){return function(c){if(c>=1)return 1;var d=1/a;return(c+=b*d)-c%d}}function k(a){C||(C=document.createElement("div").style),C.animationTimingFunction="",C.animationTimingFunction=a;var b=C.animationTimingFunction;if(""==b&&e())throw new TypeError(a+" is not a valid value for easing");return b}function l(a){if("linear"==a)return x;var b=E.exec(a);if(b)return i.apply(this,b.slice(1).map(Number));var c=F.exec(a);return c?j(Number(c[1]),{start:y,middle:z,end:A}[c[2]]):B[a]||x}function m(a){return Math.abs(n(a)/a.playbackRate)}function n(a){return 0===a.duration||0===a.iterations?0:a.duration*a.iterations}function o(a,b,c){if(null==b)return G;var d=c.delay+a+c.endDelay;return b<Math.min(c.delay,d)?H:b>=Math.min(c.delay+a,d)?I:J}function p(a,b,c,d,e){switch(d){case H:return"backwards"==b||"both"==b?0:null;case J:return c-e;case I:return"forwards"==b||"both"==b?a:null;case G:return null}}function q(a,b,c,d,e){var f=e;return 0===a?b!==H&&(f+=c):f+=d/a,f}function r(a,b,c,d,e,f){var g=a===1/0?b%1:a%1;return 0!==g||c!==I||0===d||0===e&&0!==f||(g=1),g}function s(a,b,c,d){return a===I&&b===1/0?1/0:1===c?Math.floor(d)-1:Math.floor(d)}function t(a,b,c){var d=a;if("normal"!==a&&"reverse"!==a){var e=b;"alternate-reverse"===a&&(e+=1),d="normal",e!==1/0&&e%2!=0&&(d="reverse")}return"normal"===d?c:1-c}function u(a,b,c){var d=o(a,b,c),e=p(a,c.fill,b,d,c.delay);if(null===e)return null;var f=q(c.duration,d,c.iterations,e,c.iterationStart),g=r(f,c.iterationStart,d,c.iterations,e,c.duration),h=s(d,c.iterations,g,f),i=t(c.direction,h,g);return c._easingFunction(i)}var v="backwards|forwards|both|none".split("|"),w="reverse|alternate|alternate-reverse".split("|"),x=function(a){return a};d.prototype={_setMember:function(b,c){this["_"+b]=c,this._effect&&(this._effect._timingInput[b]=c,this._effect._timing=a.normalizeTimingInput(this._effect._timingInput),this._effect.activeDuration=a.calculateActiveDuration(this._effect._timing),this._effect._animation&&this._effect._animation._rebuildUnderlyingAnimation())},get playbackRate(){return this._playbackRate},set delay(a){this._setMember("delay",a)},get delay(){return this._delay},set endDelay(a){this._setMember("endDelay",a)},get endDelay(){return this._endDelay},set fill(a){this._setMember("fill",a)},get fill(){return this._fill},set iterationStart(a){if((isNaN(a)||a<0)&&e())throw new TypeError("iterationStart must be a non-negative number, received: "+timing.iterationStart);this._setMember("iterationStart",a)},get iterationStart(){return this._iterationStart},set duration(a){if("auto"!=a&&(isNaN(a)||a<0)&&e())throw new TypeError("duration must be non-negative or auto, received: "+a);this._setMember("duration",a)},get duration(){return this._duration},set direction(a){this._setMember("direction",a)},get direction(){return this._direction},set easing(a){this._easingFunction=l(k(a)),this._setMember("easing",a)},get easing(){return this._easing},set iterations(a){if((isNaN(a)||a<0)&&e())throw new TypeError("iterations must be non-negative, received: "+a);this._setMember("iterations",a)},get iterations(){return this._iterations}};var y=1,z=.5,A=0,B={ease:i(.25,.1,.25,1),"ease-in":i(.42,0,1,1),"ease-out":i(0,0,.58,1),"ease-in-out":i(.42,0,.58,1),"step-start":j(1,y),"step-middle":j(1,z),"step-end":j(1,A)},C=null,D="\\s*(-?\\d+\\.?\\d*|-?\\.\\d+)\\s*",E=new RegExp("cubic-bezier\\("+D+","+D+","+D+","+D+"\\)"),F=/steps\(\s*(\d+)\s*,\s*(start|middle|end)\s*\)/,G=0,H=1,I=2,J=3;a.cloneTimingInput=c,a.makeTiming=f,a.numericTimingToObject=g,a.normalizeTimingInput=h,a.calculateActiveDuration=m,a.calculateIterationProgress=u,a.calculatePhase=o,a.normalizeEasing=k,a.parseEasingFunction=l}(c),function(a,b){function c(a,b){return a in k?k[a][b]||b:b}function d(a){return"display"===a||0===a.lastIndexOf("animation",0)||0===a.lastIndexOf("transition",0)}function e(a,b,e){if(!d(a)){var f=h[a];if(f){i.style[a]=b;for(var g in f){var j=f[g],k=i.style[j];e[j]=c(j,k)}}else e[a]=c(a,b)}}function f(a){var b=[];for(var c in a)if(!(c in["easing","offset","composite"])){var d=a[c];Array.isArray(d)||(d=[d]);for(var e,f=d.length,g=0;g<f;g++)e={},e.offset="offset"in a?a.offset:1==f?1:g/(f-1),"easing"in a&&(e.easing=a.easing),"composite"in a&&(e.composite=a.composite),e[c]=d[g],b.push(e)}return b.sort(function(a,b){return a.offset-b.offset}),b}function g(b){function c(){var a=d.length;null==d[a-1].offset&&(d[a-1].offset=1),a>1&&null==d[0].offset&&(d[0].offset=0);for(var b=0,c=d[0].offset,e=1;e<a;e++){var f=d[e].offset;if(null!=f){for(var g=1;g<e-b;g++)d[b+g].offset=c+(f-c)*g/(e-b);b=e,c=f}}}if(null==b)return[];window.Symbol&&Symbol.iterator&&Array.prototype.from&&b[Symbol.iterator]&&(b=Array.from(b)),Array.isArray(b)||(b=f(b));for(var d=b.map(function(b){var c={};for(var d in b){var f=b[d];if("offset"==d){if(null!=f){if(f=Number(f),!isFinite(f))throw new TypeError("Keyframe offsets must be numbers.");if(f<0||f>1)throw new TypeError("Keyframe offsets must be between 0 and 1.")}}else if("composite"==d){if("add"==f||"accumulate"==f)throw{type:DOMException.NOT_SUPPORTED_ERR,name:"NotSupportedError",message:"add compositing is not supported"};if("replace"!=f)throw new TypeError("Invalid composite mode "+f+".")}else f="easing"==d?a.normalizeEasing(f):""+f;e(d,f,c)}return void 0==c.offset&&(c.offset=null),void 0==c.easing&&(c.easing="linear"),c}),g=!0,h=-1/0,i=0;i<d.length;i++){var j=d[i].offset;if(null!=j){if(j<h)throw new TypeError("Keyframes are not loosely sorted by offset. Sort or specify offsets.");h=j}else g=!1}return d=d.filter(function(a){return a.offset>=0&&a.offset<=1}),g||c(),d}var h={background:["backgroundImage","backgroundPosition","backgroundSize","backgroundRepeat","backgroundAttachment","backgroundOrigin","backgroundClip","backgroundColor"],border:["borderTopColor","borderTopStyle","borderTopWidth","borderRightColor","borderRightStyle","borderRightWidth","borderBottomColor","borderBottomStyle","borderBottomWidth","borderLeftColor","borderLeftStyle","borderLeftWidth"],borderBottom:["borderBottomWidth","borderBottomStyle","borderBottomColor"],borderColor:["borderTopColor","borderRightColor","borderBottomColor","borderLeftColor"],borderLeft:["borderLeftWidth","borderLeftStyle","borderLeftColor"],borderRadius:["borderTopLeftRadius","borderTopRightRadius","borderBottomRightRadius","borderBottomLeftRadius"],borderRight:["borderRightWidth","borderRightStyle","borderRightColor"],borderTop:["borderTopWidth","borderTopStyle","borderTopColor"],borderWidth:["borderTopWidth","borderRightWidth","borderBottomWidth","borderLeftWidth"],flex:["flexGrow","flexShrink","flexBasis"],font:["fontFamily","fontSize","fontStyle","fontVariant","fontWeight","lineHeight"],margin:["marginTop","marginRight","marginBottom","marginLeft"],outline:["outlineColor","outlineStyle","outlineWidth"],padding:["paddingTop","paddingRight","paddingBottom","paddingLeft"]},i=document.createElementNS("http://www.w3.org/1999/xhtml","div"),j={thin:"1px",medium:"3px",thick:"5px"},k={borderBottomWidth:j,borderLeftWidth:j,borderRightWidth:j,borderTopWidth:j,fontSize:{"xx-small":"60%","x-small":"75%",small:"89%",medium:"100%",large:"120%","x-large":"150%","xx-large":"200%"},fontWeight:{normal:"400",bold:"700"},outlineWidth:j,textShadow:{none:"0px 0px 0px transparent"},boxShadow:{none:"0px 0px 0px 0px transparent"}};a.convertToArrayForm=f,a.normalizeKeyframes=g}(c),function(a){var b={};a.isDeprecated=function(a,c,d,e){var f=e?"are":"is",g=new Date,h=new Date(c);return h.setMonth(h.getMonth()+3),!(g<h&&(a in b||console.warn("Web Animations: "+a+" "+f+" deprecated and will stop working on "+h.toDateString()+". "+d),b[a]=!0,1))},a.deprecated=function(b,c,d,e){var f=e?"are":"is";if(a.isDeprecated(b,c,d,e))throw new Error(b+" "+f+" no longer supported. "+d)}}(c),function(){if(document.documentElement.animate){var a=document.documentElement.animate([],0),b=!0;if(a&&(b=!1,"play|currentTime|pause|reverse|playbackRate|cancel|finish|startTime|playState".split("|").forEach(function(c){void 0===a[c]&&(b=!0)})),!b)return}!function(a,b,c){function d(a){for(var b={},c=0;c<a.length;c++)for(var d in a[c])if("offset"!=d&&"easing"!=d&&"composite"!=d){var e={offset:a[c].offset,easing:a[c].easing,value:a[c][d]};b[d]=b[d]||[],b[d].push(e)}for(var f in b){var g=b[f];if(0!=g[0].offset||1!=g[g.length-1].offset)throw{type:DOMException.NOT_SUPPORTED_ERR,name:"NotSupportedError",message:"Partial keyframes are not supported"}}return b}function e(c){var d=[];for(var e in c)for(var f=c[e],g=0;g<f.length-1;g++){var h=g,i=g+1,j=f[h].offset,k=f[i].offset,l=j,m=k;0==g&&(l=-1/0,0==k&&(i=h)),g==f.length-2&&(m=1/0,1==j&&(h=i)),d.push({applyFrom:l,applyTo:m,startOffset:f[h].offset,endOffset:f[i].offset,easingFunction:a.parseEasingFunction(f[h].easing),property:e,interpolation:b.propertyInterpolation(e,f[h].value,f[i].value)})}return d.sort(function(a,b){return a.startOffset-b.startOffset}),d}b.convertEffectInput=function(c){var f=a.normalizeKeyframes(c),g=d(f),h=e(g);return function(a,c){if(null!=c)h.filter(function(a){return c>=a.applyFrom&&c<a.applyTo}).forEach(function(d){var e=c-d.startOffset,f=d.endOffset-d.startOffset,g=0==f?0:d.easingFunction(e/f);b.apply(a,d.property,d.interpolation(g))});else for(var d in g)"offset"!=d&&"easing"!=d&&"composite"!=d&&b.clear(a,d)}}}(c,d),function(a,b,c){function d(a){return a.replace(/-(.)/g,function(a,b){return b.toUpperCase()})}function e(a,b,c){h[c]=h[c]||[],h[c].push([a,b])}function f(a,b,c){for(var f=0;f<c.length;f++){e(a,b,d(c[f]))}}function g(c,e,f){var g=c;/-/.test(c)&&!a.isDeprecated("Hyphenated property names","2016-03-22","Use camelCase instead.",!0)&&(g=d(c)),"initial"!=e&&"initial"!=f||("initial"==e&&(e=i[g]),"initial"==f&&(f=i[g]));for(var j=e==f?[]:h[g],k=0;j&&k<j.length;k++){var l=j[k][0](e),m=j[k][0](f);if(void 0!==l&&void 0!==m){var n=j[k][1](l,m);if(n){var o=b.Interpolation.apply(null,n);return function(a){return 0==a?e:1==a?f:o(a)}}}}return b.Interpolation(!1,!0,function(a){return a?f:e})}var h={};b.addPropertiesHandler=f;var i={backgroundColor:"transparent",backgroundPosition:"0% 0%",borderBottomColor:"currentColor",borderBottomLeftRadius:"0px",borderBottomRightRadius:"0px",borderBottomWidth:"3px",borderLeftColor:"currentColor",borderLeftWidth:"3px",borderRightColor:"currentColor",borderRightWidth:"3px",borderSpacing:"2px",borderTopColor:"currentColor",borderTopLeftRadius:"0px",borderTopRightRadius:"0px",borderTopWidth:"3px",bottom:"auto",clip:"rect(0px, 0px, 0px, 0px)",color:"black",fontSize:"100%",fontWeight:"400",height:"auto",left:"auto",letterSpacing:"normal",lineHeight:"120%",marginBottom:"0px",marginLeft:"0px",marginRight:"0px",marginTop:"0px",maxHeight:"none",maxWidth:"none",minHeight:"0px",minWidth:"0px",opacity:"1.0",outlineColor:"invert",outlineOffset:"0px",outlineWidth:"3px",paddingBottom:"0px",paddingLeft:"0px",paddingRight:"0px",paddingTop:"0px",right:"auto",strokeDasharray:"none",strokeDashoffset:"0px",textIndent:"0px",textShadow:"0px 0px 0px transparent",top:"auto",transform:"",verticalAlign:"0px",visibility:"visible",width:"auto",wordSpacing:"normal",zIndex:"auto"};b.propertyInterpolation=g}(c,d),function(a,b,c){function d(b){var c=a.calculateActiveDuration(b),d=function(d){return a.calculateIterationProgress(c,d,b)};return d._totalDuration=b.delay+c+b.endDelay,d}b.KeyframeEffect=function(c,e,f,g){var h,i=d(a.normalizeTimingInput(f)),j=b.convertEffectInput(e),k=function(){j(c,h)};return k._update=function(a){return null!==(h=i(a))},k._clear=function(){j(c,null)},k._hasSameTarget=function(a){return c===a},k._target=c,k._totalDuration=i._totalDuration,k._id=g,k}}(c,d),function(a,b){a.apply=function(b,c,d){b.style[a.propertyName(c)]=d},a.clear=function(b,c){b.style[a.propertyName(c)]=""}}(d),function(a){window.Element.prototype.animate=function(b,c){var d="";return c&&c.id&&(d=c.id),a.timeline._play(a.KeyframeEffect(this,b,c,d))}}(d),function(a,b){function c(a,b,d){if("number"==typeof a&&"number"==typeof b)return a*(1-d)+b*d;if("boolean"==typeof a&&"boolean"==typeof b)return d<.5?a:b;if(a.length==b.length){for(var e=[],f=0;f<a.length;f++)e.push(c(a[f],b[f],d));return e}throw"Mismatched interpolation arguments "+a+":"+b}a.Interpolation=function(a,b,d){return function(e){return d(c(a,b,e))}}}(d),function(a,b,c){a.sequenceNumber=0;var d=function(a,b,c){this.target=a,this.currentTime=b,this.timelineTime=c,this.type="finish",this.bubbles=!1,this.cancelable=!1,this.currentTarget=a,this.defaultPrevented=!1,this.eventPhase=Event.AT_TARGET,this.timeStamp=Date.now()};b.Animation=function(b){this.id="",b&&b._id&&(this.id=b._id),this._sequenceNumber=a.sequenceNumber++,this._currentTime=0,this._startTime=null,this._paused=!1,this._playbackRate=1,this._inTimeline=!0,this._finishedFlag=!0,this.onfinish=null,this._finishHandlers=[],this._effect=b,this._inEffect=this._effect._update(0),this._idle=!0,this._currentTimePending=!1},b.Animation.prototype={_ensureAlive:function(){this.playbackRate<0&&0===this.currentTime?this._inEffect=this._effect._update(-1):this._inEffect=this._effect._update(this.currentTime),this._inTimeline||!this._inEffect&&this._finishedFlag||(this._inTimeline=!0,b.timeline._animations.push(this))},_tickCurrentTime:function(a,b){a!=this._currentTime&&(this._currentTime=a,this._isFinished&&!b&&(this._currentTime=this._playbackRate>0?this._totalDuration:0),this._ensureAlive())},get currentTime(){return this._idle||this._currentTimePending?null:this._currentTime},set currentTime(a){a=+a,isNaN(a)||(b.restart(),this._paused||null==this._startTime||(this._startTime=this._timeline.currentTime-a/this._playbackRate),this._currentTimePending=!1,this._currentTime!=a&&(this._idle&&(this._idle=!1,this._paused=!0),this._tickCurrentTime(a,!0),b.applyDirtiedAnimation(this)))},get startTime(){return this._startTime},set startTime(a){a=+a,isNaN(a)||this._paused||this._idle||(this._startTime=a,this._tickCurrentTime((this._timeline.currentTime-this._startTime)*this.playbackRate),b.applyDirtiedAnimation(this))},get playbackRate(){return this._playbackRate},set playbackRate(a){if(a!=this._playbackRate){var c=this.currentTime;this._playbackRate=a,this._startTime=null,"paused"!=this.playState&&"idle"!=this.playState&&(this._finishedFlag=!1,this._idle=!1,this._ensureAlive(),b.applyDirtiedAnimation(this)),null!=c&&(this.currentTime=c)}},get _isFinished(){return!this._idle&&(this._playbackRate>0&&this._currentTime>=this._totalDuration||this._playbackRate<0&&this._currentTime<=0)},get _totalDuration(){return this._effect._totalDuration},get playState(){return this._idle?"idle":null==this._startTime&&!this._paused&&0!=this.playbackRate||this._currentTimePending?"pending":this._paused?"paused":this._isFinished?"finished":"running"},_rewind:function(){if(this._playbackRate>=0)this._currentTime=0;else{if(!(this._totalDuration<1/0))throw new DOMException("Unable to rewind negative playback rate animation with infinite duration","InvalidStateError");this._currentTime=this._totalDuration}},play:function(){this._paused=!1,(this._isFinished||this._idle)&&(this._rewind(),this._startTime=null),this._finishedFlag=!1,this._idle=!1,this._ensureAlive(),b.applyDirtiedAnimation(this)},pause:function(){this._isFinished||this._paused||this._idle?this._idle&&(this._rewind(),this._idle=!1):this._currentTimePending=!0,this._startTime=null,this._paused=!0},finish:function(){this._idle||(this.currentTime=this._playbackRate>0?this._totalDuration:0,this._startTime=this._totalDuration-this.currentTime,this._currentTimePending=!1,b.applyDirtiedAnimation(this))},cancel:function(){this._inEffect&&(this._inEffect=!1,this._idle=!0,this._paused=!1,this._isFinished=!0,this._finishedFlag=!0,this._currentTime=0,this._startTime=null,this._effect._update(null),b.applyDirtiedAnimation(this))},reverse:function(){this.playbackRate*=-1,this.play()},addEventListener:function(a,b){"function"==typeof b&&"finish"==a&&this._finishHandlers.push(b)},removeEventListener:function(a,b){if("finish"==a){var c=this._finishHandlers.indexOf(b);c>=0&&this._finishHandlers.splice(c,1)}},_fireEvents:function(a){if(this._isFinished){if(!this._finishedFlag){var b=new d(this,this._currentTime,a),c=this._finishHandlers.concat(this.onfinish?[this.onfinish]:[]);setTimeout(function(){c.forEach(function(a){a.call(b.target,b)})},0),this._finishedFlag=!0}}else this._finishedFlag=!1},_tick:function(a,b){this._idle||this._paused||(null==this._startTime?b&&(this.startTime=a-this._currentTime/this.playbackRate):this._isFinished||this._tickCurrentTime((a-this._startTime)*this.playbackRate)),b&&(this._currentTimePending=!1,this._fireEvents(a))},get _needsTick(){return this.playState in{pending:1,running:1}||!this._finishedFlag},_targetAnimations:function(){var a=this._effect._target;return a._activeAnimations||(a._activeAnimations=[]),a._activeAnimations},_markTarget:function(){var a=this._targetAnimations();-1===a.indexOf(this)&&a.push(this)},_unmarkTarget:function(){var a=this._targetAnimations(),b=a.indexOf(this);-1!==b&&a.splice(b,1)}}}(c,d),function(a,b,c){function d(a){var b=j;j=[],a<q.currentTime&&(a=q.currentTime),q._animations.sort(e),q._animations=h(a,!0,q._animations)[0],b.forEach(function(b){b[1](a)}),g(),l=void 0}function e(a,b){return a._sequenceNumber-b._sequenceNumber}function f(){this._animations=[],this.currentTime=window.performance&&performance.now?performance.now():0}function g(){o.forEach(function(a){a()}),o.length=0}function h(a,c,d){p=!0,n=!1,b.timeline.currentTime=a,m=!1;var e=[],f=[],g=[],h=[];return d.forEach(function(b){b._tick(a,c),b._inEffect?(f.push(b._effect),b._markTarget()):(e.push(b._effect),b._unmarkTarget()),b._needsTick&&(m=!0);var d=b._inEffect||b._needsTick;b._inTimeline=d,d?g.push(b):h.push(b)}),o.push.apply(o,e),o.push.apply(o,f),m&&requestAnimationFrame(function(){}),p=!1,[g,h]}var i=window.requestAnimationFrame,j=[],k=0;window.requestAnimationFrame=function(a){var b=k++;return 0==j.length&&i(d),j.push([b,a]),b},window.cancelAnimationFrame=function(a){j.forEach(function(b){b[0]==a&&(b[1]=function(){})})},f.prototype={_play:function(c){c._timing=a.normalizeTimingInput(c.timing);var d=new b.Animation(c);return d._idle=!1,d._timeline=this,this._animations.push(d),b.restart(),b.applyDirtiedAnimation(d),d}};var l=void 0,m=!1,n=!1;b.restart=function(){return m||(m=!0,requestAnimationFrame(function(){}),n=!0),n},b.applyDirtiedAnimation=function(a){if(!p){a._markTarget();var c=a._targetAnimations();c.sort(e),h(b.timeline.currentTime,!1,c.slice())[1].forEach(function(a){var b=q._animations.indexOf(a);-1!==b&&q._animations.splice(b,1)}),g()}};var o=[],p=!1,q=new f;b.timeline=q}(c,d),function(a){function b(a,b){var c=a.exec(b);if(c)return c=a.ignoreCase?c[0].toLowerCase():c[0],[c,b.substr(c.length)]}function c(a,b){b=b.replace(/^\s*/,"");var c=a(b);if(c)return[c[0],c[1].replace(/^\s*/,"")]}function d(a,d,e){a=c.bind(null,a);for(var f=[];;){var g=a(e);if(!g)return[f,e];if(f.push(g[0]),e=g[1],!(g=b(d,e))||""==g[1])return[f,e];e=g[1]}}function e(a,b){for(var c=0,d=0;d<b.length&&(!/\s|,/.test(b[d])||0!=c);d++)if("("==b[d])c++;else if(")"==b[d]&&(c--,0==c&&d++,c<=0))break;var e=a(b.substr(0,d));return void 0==e?void 0:[e,b.substr(d)]}function f(a,b){for(var c=a,d=b;c&&d;)c>d?c%=d:d%=c;return c=a*b/(c+d)}function g(a){return function(b){var c=a(b);return c&&(c[0]=void 0),c}}function h(a,b){return function(c){return a(c)||[b,c]}}function i(b,c){for(var d=[],e=0;e<b.length;e++){var f=a.consumeTrimmed(b[e],c);if(!f||""==f[0])return;void 0!==f[0]&&d.push(f[0]),c=f[1]}if(""==c)return d}function j(a,b,c,d,e){for(var g=[],h=[],i=[],j=f(d.length,e.length),k=0;k<j;k++){var l=b(d[k%d.length],e[k%e.length]);if(!l)return;g.push(l[0]),h.push(l[1]),i.push(l[2])}return[g,h,function(b){var d=b.map(function(a,b){return i[b](a)}).join(c);return a?a(d):d}]}function k(a,b,c){for(var d=[],e=[],f=[],g=0,h=0;h<c.length;h++)if("function"==typeof c[h]){var i=c[h](a[g],b[g++]);d.push(i[0]),e.push(i[1]),f.push(i[2])}else!function(a){d.push(!1),e.push(!1),f.push(function(){return c[a]})}(h);return[d,e,function(a){for(var b="",c=0;c<a.length;c++)b+=f[c](a[c]);return b}]}a.consumeToken=b,a.consumeTrimmed=c,a.consumeRepeated=d,a.consumeParenthesised=e,a.ignore=g,a.optional=h,a.consumeList=i,a.mergeNestedRepeated=j.bind(null,null),a.mergeWrappedNestedRepeated=j,a.mergeList=k}(d),function(a){function b(b){function c(b){var c=a.consumeToken(/^inset/i,b);if(c)return d.inset=!0,c;var c=a.consumeLengthOrPercent(b);if(c)return d.lengths.push(c[0]),c;var c=a.consumeColor(b);return c?(d.color=c[0],c):void 0}var d={inset:!1,lengths:[],color:null},e=a.consumeRepeated(c,/^/,b);if(e&&e[0].length)return[d,e[1]]}function c(c){var d=a.consumeRepeated(b,/^,/,c);if(d&&""==d[1])return d[0]}function d(b,c){for(;b.lengths.length<Math.max(b.lengths.length,c.lengths.length);)b.lengths.push({px:0});for(;c.lengths.length<Math.max(b.lengths.length,c.lengths.length);)c.lengths.push({px:0});if(b.inset==c.inset&&!!b.color==!!c.color){for(var d,e=[],f=[[],0],g=[[],0],h=0;h<b.lengths.length;h++){var i=a.mergeDimensions(b.lengths[h],c.lengths[h],2==h);f[0].push(i[0]),g[0].push(i[1]),e.push(i[2])}if(b.color&&c.color){var j=a.mergeColors(b.color,c.color);f[1]=j[0],g[1]=j[1],d=j[2]}return[f,g,function(a){for(var c=b.inset?"inset ":" ",f=0;f<e.length;f++)c+=e[f](a[0][f])+" ";return d&&(c+=d(a[1])),c}]}}function e(b,c,d,e){function f(a){return{inset:a,color:[0,0,0,0],lengths:[{px:0},{px:0},{px:0},{px:0}]}}for(var g=[],h=[],i=0;i<d.length||i<e.length;i++){var j=d[i]||f(e[i].inset),k=e[i]||f(d[i].inset);g.push(j),h.push(k)}return a.mergeNestedRepeated(b,c,g,h)}var f=e.bind(null,d,", ");a.addPropertiesHandler(c,f,["box-shadow","text-shadow"])}(d),function(a,b){function c(a){return a.toFixed(3).replace(/0+$/,"").replace(/\.$/,"")}function d(a,b,c){return Math.min(b,Math.max(a,c))}function e(a){if(/^\s*[-+]?(\d*\.)?\d+\s*$/.test(a))return Number(a)}function f(a,b){return[a,b,c]}function g(a,b){if(0!=a)return i(0,1/0)(a,b)}function h(a,b){return[a,b,function(a){return Math.round(d(1,1/0,a))}]}function i(a,b){return function(e,f){return[e,f,function(e){return c(d(a,b,e))}]}}function j(a){var b=a.trim().split(/\s*[\s,]\s*/);if(0!==b.length){for(var c=[],d=0;d<b.length;d++){var f=e(b[d]);if(void 0===f)return;c.push(f)}return c}}function k(a,b){if(a.length==b.length)return[a,b,function(a){return a.map(c).join(" ")}]}function l(a,b){return[a,b,Math.round]}a.clamp=d,a.addPropertiesHandler(j,k,["stroke-dasharray"]),a.addPropertiesHandler(e,i(0,1/0),["border-image-width","line-height"]),a.addPropertiesHandler(e,i(0,1),["opacity","shape-image-threshold"]),a.addPropertiesHandler(e,g,["flex-grow","flex-shrink"]),a.addPropertiesHandler(e,h,["orphans","widows"]),a.addPropertiesHandler(e,l,["z-index"]),a.parseNumber=e,a.parseNumberList=j,a.mergeNumbers=f,a.numberToString=c}(d),function(a,b){function c(a,b){if("visible"==a||"visible"==b)return[0,1,function(c){return c<=0?a:c>=1?b:"visible"}]}a.addPropertiesHandler(String,c,["visibility"])}(d),function(a,b){function c(a){a=a.trim(),f.fillStyle="#000",f.fillStyle=a;var b=f.fillStyle;if(f.fillStyle="#fff",f.fillStyle=a,b==f.fillStyle){f.fillRect(0,0,1,1);var c=f.getImageData(0,0,1,1).data;f.clearRect(0,0,1,1);var d=c[3]/255;return[c[0]*d,c[1]*d,c[2]*d,d]}}function d(b,c){return[b,c,function(b){function c(a){return Math.max(0,Math.min(255,a))}if(b[3])for(var d=0;d<3;d++)b[d]=Math.round(c(b[d]/b[3]));return b[3]=a.numberToString(a.clamp(0,1,b[3])),"rgba("+b.join(",")+")"}]}var e=document.createElementNS("http://www.w3.org/1999/xhtml","canvas");e.width=e.height=1;var f=e.getContext("2d");a.addPropertiesHandler(c,d,["background-color","border-bottom-color","border-left-color","border-right-color","border-top-color","color","fill","flood-color","lighting-color","outline-color","stop-color","stroke","text-decoration-color"]),a.consumeColor=a.consumeParenthesised.bind(null,c),a.mergeColors=d}(d),function(a,b){function c(a){function b(){var b=h.exec(a);g=b?b[0]:void 0}function c(){var a=Number(g);return b(),a}function d(){if("("!==g)return c();b();var a=f();return")"!==g?NaN:(b(),a)}function e(){for(var a=d();"*"===g||"/"===g;){var c=g;b();var e=d();"*"===c?a*=e:a/=e}return a}function f(){for(var a=e();"+"===g||"-"===g;){var c=g;b();var d=e();"+"===c?a+=d:a-=d}return a}var g,h=/([\+\-\w\.]+|[\(\)\*\/])/g;return b(),f()}function d(a,b){if("0"==(b=b.trim().toLowerCase())&&"px".search(a)>=0)return{px:0};if(/^[^(]*$|^calc/.test(b)){b=b.replace(/calc\(/g,"(");var d={};b=b.replace(a,function(a){return d[a]=null,"U"+a});for(var e="U("+a.source+")",f=b.replace(/[-+]?(\d*\.)?\d+([Ee][-+]?\d+)?/g,"N").replace(new RegExp("N"+e,"g"),"D").replace(/\s[+-]\s/g,"O").replace(/\s/g,""),g=[/N\*(D)/g,/(N|D)[*\/]N/g,/(N|D)O\1/g,/\((N|D)\)/g],h=0;h<g.length;)g[h].test(f)?(f=f.replace(g[h],"$1"),h=0):h++;if("D"==f){for(var i in d){var j=c(b.replace(new RegExp("U"+i,"g"),"").replace(new RegExp(e,"g"),"*0"));if(!isFinite(j))return;d[i]=j}return d}}}function e(a,b){return f(a,b,!0)}function f(b,c,d){var e,f=[];for(e in b)f.push(e);for(e in c)f.indexOf(e)<0&&f.push(e);return b=f.map(function(a){return b[a]||0}),c=f.map(function(a){return c[a]||0}),[b,c,function(b){var c=b.map(function(c,e){return 1==b.length&&d&&(c=Math.max(c,0)),a.numberToString(c)+f[e]}).join(" + ");return b.length>1?"calc("+c+")":c}]}var g="px|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc",h=d.bind(null,new RegExp(g,"g")),i=d.bind(null,new RegExp(g+"|%","g")),j=d.bind(null,/deg|rad|grad|turn/g);a.parseLength=h,a.parseLengthOrPercent=i,a.consumeLengthOrPercent=a.consumeParenthesised.bind(null,i),a.parseAngle=j,a.mergeDimensions=f;var k=a.consumeParenthesised.bind(null,h),l=a.consumeRepeated.bind(void 0,k,/^/),m=a.consumeRepeated.bind(void 0,l,/^,/);a.consumeSizePairList=m;var n=function(a){var b=m(a);if(b&&""==b[1])return b[0]},o=a.mergeNestedRepeated.bind(void 0,e," "),p=a.mergeNestedRepeated.bind(void 0,o,",");a.mergeNonNegativeSizePair=o,a.addPropertiesHandler(n,p,["background-size"]),a.addPropertiesHandler(i,e,["border-bottom-width","border-image-width","border-left-width","border-right-width","border-top-width","flex-basis","font-size","height","line-height","max-height","max-width","outline-width","width"]),a.addPropertiesHandler(i,f,["border-bottom-left-radius","border-bottom-right-radius","border-top-left-radius","border-top-right-radius","bottom","left","letter-spacing","margin-bottom","margin-left","margin-right","margin-top","min-height","min-width","outline-offset","padding-bottom","padding-left","padding-right","padding-top","perspective","right","shape-margin","stroke-dashoffset","text-indent","top","vertical-align","word-spacing"])}(d),function(a,b){function c(b){return a.consumeLengthOrPercent(b)||a.consumeToken(/^auto/,b)}function d(b){var d=a.consumeList([a.ignore(a.consumeToken.bind(null,/^rect/)),a.ignore(a.consumeToken.bind(null,/^\(/)),a.consumeRepeated.bind(null,c,/^,/),a.ignore(a.consumeToken.bind(null,/^\)/))],b);if(d&&4==d[0].length)return d[0]}function e(b,c){return"auto"==b||"auto"==c?[!0,!1,function(d){var e=d?b:c;if("auto"==e)return"auto";var f=a.mergeDimensions(e,e);return f[2](f[0])}]:a.mergeDimensions(b,c)}function f(a){return"rect("+a+")"}var g=a.mergeWrappedNestedRepeated.bind(null,f,e,", ");a.parseBox=d,a.mergeBoxes=g,a.addPropertiesHandler(d,g,["clip"])}(d),function(a,b){function c(a){return function(b){var c=0;return a.map(function(a){return a===k?b[c++]:a})}}function d(a){return a}function e(b){if("none"==(b=b.toLowerCase().trim()))return[];for(var c,d=/\s*(\w+)\(([^)]*)\)/g,e=[],f=0;c=d.exec(b);){if(c.index!=f)return;f=c.index+c[0].length;var g=c[1],h=n[g];if(!h)return;var i=c[2].split(","),j=h[0];if(j.length<i.length)return;for(var k=[],o=0;o<j.length;o++){var p,q=i[o],r=j[o];if(void 0===(p=q?{A:function(b){return"0"==b.trim()?m:a.parseAngle(b)},N:a.parseNumber,T:a.parseLengthOrPercent,L:a.parseLength}[r.toUpperCase()](q):{a:m,n:k[0],t:l}[r]))return;k.push(p)}if(e.push({t:g,d:k}),d.lastIndex==b.length)return e}}function f(a){return a.toFixed(6).replace(".000000","")}function g(b,c){if(b.decompositionPair!==c){b.decompositionPair=c;var d=a.makeMatrixDecomposition(b)}if(c.decompositionPair!==b){c.decompositionPair=b;var e=a.makeMatrixDecomposition(c)}return null==d[0]||null==e[0]?[[!1],[!0],function(a){return a?c[0].d:b[0].d}]:(d[0].push(0),e[0].push(1),[d,e,function(b){var c=a.quat(d[0][3],e[0][3],b[5]);return a.composeMatrix(b[0],b[1],b[2],c,b[4]).map(f).join(",")}])}function h(a){return a.replace(/[xy]/,"")}function i(a){return a.replace(/(x|y|z|3d)?$/,"3d")}function j(b,c){var d=a.makeMatrixDecomposition&&!0,e=!1;if(!b.length||!c.length){b.length||(e=!0,b=c,c=[]);for(var f=0;f<b.length;f++){var j=b[f].t,k=b[f].d,l="scale"==j.substr(0,5)?1:0;c.push({t:j,d:k.map(function(a){if("number"==typeof a)return l;var b={};for(var c in a)b[c]=l;return b})})}}var m=function(a,b){return"perspective"==a&&"perspective"==b||("matrix"==a||"matrix3d"==a)&&("matrix"==b||"matrix3d"==b)},o=[],p=[],q=[];if(b.length!=c.length){if(!d)return;var r=g(b,c);o=[r[0]],p=[r[1]],q=[["matrix",[r[2]]]]}else for(var f=0;f<b.length;f++){var j,s=b[f].t,t=c[f].t,u=b[f].d,v=c[f].d,w=n[s],x=n[t];if(m(s,t)){if(!d)return;var r=g([b[f]],[c[f]]);o.push(r[0]),p.push(r[1]),q.push(["matrix",[r[2]]])}else{if(s==t)j=s;else if(w[2]&&x[2]&&h(s)==h(t))j=h(s),u=w[2](u),v=x[2](v);else{if(!w[1]||!x[1]||i(s)!=i(t)){if(!d)return;var r=g(b,c);o=[r[0]],p=[r[1]],q=[["matrix",[r[2]]]];break}j=i(s),u=w[1](u),v=x[1](v)}for(var y=[],z=[],A=[],B=0;B<u.length;B++){var C="number"==typeof u[B]?a.mergeNumbers:a.mergeDimensions,r=C(u[B],v[B]);y[B]=r[0],z[B]=r[1],A.push(r[2])}o.push(y),p.push(z),q.push([j,A])}}if(e){var D=o;o=p,p=D}return[o,p,function(a){return a.map(function(a,b){var c=a.map(function(a,c){return q[b][1][c](a)}).join(",");return"matrix"==q[b][0]&&16==c.split(",").length&&(q[b][0]="matrix3d"),q[b][0]+"("+c+")"}).join(" ")}]}var k=null,l={px:0},m={deg:0},n={matrix:["NNNNNN",[k,k,0,0,k,k,0,0,0,0,1,0,k,k,0,1],d],matrix3d:["NNNNNNNNNNNNNNNN",d],rotate:["A"],rotatex:["A"],rotatey:["A"],rotatez:["A"],rotate3d:["NNNA"],perspective:["L"],scale:["Nn",c([k,k,1]),d],scalex:["N",c([k,1,1]),c([k,1])],scaley:["N",c([1,k,1]),c([1,k])],scalez:["N",c([1,1,k])],scale3d:["NNN",d],skew:["Aa",null,d],skewx:["A",null,c([k,m])],skewy:["A",null,c([m,k])],translate:["Tt",c([k,k,l]),d],translatex:["T",c([k,l,l]),c([k,l])],translatey:["T",c([l,k,l]),c([l,k])],translatez:["L",c([l,l,k])],translate3d:["TTL",d]};a.addPropertiesHandler(e,j,["transform"]),a.transformToSvgMatrix=function(b){var c=a.transformListToMatrix(e(b));return"matrix("+f(c[0])+" "+f(c[1])+" "+f(c[4])+" "+f(c[5])+" "+f(c[12])+" "+f(c[13])+")"}}(d),function(a,b){function c(a,b){b.concat([a]).forEach(function(b){b in document.documentElement.style&&(d[a]=b),e[b]=a})}var d={},e={};c("transform",["webkitTransform","msTransform"]),c("transformOrigin",["webkitTransformOrigin"]),c("perspective",["webkitPerspective"]),c("perspectiveOrigin",["webkitPerspectiveOrigin"]),a.propertyName=function(a){return d[a]||a},a.unprefixedPropertyName=function(a){return e[a]||a}}(d)}(),function(){if(void 0===document.createElement("div").animate([]).oncancel){var a;if(window.performance&&performance.now)var a=function(){return performance.now()};else var a=function(){return Date.now()};var b=function(a,b,c){this.target=a,this.currentTime=b,this.timelineTime=c,this.type="cancel",this.bubbles=!1,this.cancelable=!1,this.currentTarget=a,this.defaultPrevented=!1,this.eventPhase=Event.AT_TARGET,this.timeStamp=Date.now()},c=window.Element.prototype.animate;window.Element.prototype.animate=function(d,e){var f=c.call(this,d,e);f._cancelHandlers=[],f.oncancel=null;var g=f.cancel;f.cancel=function(){g.call(this);var c=new b(this,null,a()),d=this._cancelHandlers.concat(this.oncancel?[this.oncancel]:[]);setTimeout(function(){d.forEach(function(a){a.call(c.target,c)})},0)};var h=f.addEventListener;f.addEventListener=function(a,b){"function"==typeof b&&"cancel"==a?this._cancelHandlers.push(b):h.call(this,a,b)};var i=f.removeEventListener;return f.removeEventListener=function(a,b){if("cancel"==a){var c=this._cancelHandlers.indexOf(b);c>=0&&this._cancelHandlers.splice(c,1)}else i.call(this,a,b)},f}}}(),function(a){var b=document.documentElement,c=null,d=!1;try{var e=getComputedStyle(b).getPropertyValue("opacity"),f="0"==e?"1":"0";c=b.animate({opacity:[f,f]},{duration:1}),c.currentTime=0,d=getComputedStyle(b).getPropertyValue("opacity")==f}catch(a){}finally{c&&c.cancel()}if(!d){var g=window.Element.prototype.animate;window.Element.prototype.animate=function(b,c){return window.Symbol&&Symbol.iterator&&Array.prototype.from&&b[Symbol.iterator]&&(b=Array.from(b)),Array.isArray(b)||null===b||(b=a.convertToArrayForm(b)),g.call(this,b,c)}}}(c),function(a,b,c){function d(a){var c=b.timeline;c.currentTime=a,c._discardAnimations(),0==c._animations.length?f=!1:requestAnimationFrame(d)}var e=window.requestAnimationFrame;window.requestAnimationFrame=function(a){return e(function(c){b.timeline._updateAnimationsPromises(),a(c),b.timeline._updateAnimationsPromises()})},b.AnimationTimeline=function(){this._animations=[],this.currentTime=void 0},b.AnimationTimeline.prototype={getAnimations:function(){return this._discardAnimations(),this._animations.slice()},_updateAnimationsPromises:function(){b.animationsWithPromises=b.animationsWithPromises.filter(function(a){return a._updatePromises()})},_discardAnimations:function(){this._updateAnimationsPromises(),this._animations=this._animations.filter(function(a){return"finished"!=a.playState&&"idle"!=a.playState})},_play:function(a){var c=new b.Animation(a,this);return this._animations.push(c),b.restartWebAnimationsNextTick(),c._updatePromises(),c._animation.play(),c._updatePromises(),c},play:function(a){return a&&a.remove(),this._play(a)}};var f=!1;b.restartWebAnimationsNextTick=function(){f||(f=!0,requestAnimationFrame(d))};var g=new b.AnimationTimeline;b.timeline=g;try{Object.defineProperty(window.document,"timeline",{configurable:!0,get:function(){return g}})}catch(a){}try{window.document.timeline=g}catch(a){}}(0,e),function(a,b,c){b.animationsWithPromises=[],b.Animation=function(b,c){if(this.id="",b&&b._id&&(this.id=b._id),this.effect=b,b&&(b._animation=this),!c)throw new Error("Animation with null timeline is not supported");this._timeline=c,this._sequenceNumber=a.sequenceNumber++,this._holdTime=0,this._paused=!1,this._isGroup=!1,this._animation=null,this._childAnimations=[],this._callback=null,this._oldPlayState="idle",this._rebuildUnderlyingAnimation(),this._animation.cancel(),this._updatePromises()},b.Animation.prototype={_updatePromises:function(){var a=this._oldPlayState,b=this.playState;return this._readyPromise&&b!==a&&("idle"==b?(this._rejectReadyPromise(),this._readyPromise=void 0):"pending"==a?this._resolveReadyPromise():"pending"==b&&(this._readyPromise=void 0)),this._finishedPromise&&b!==a&&("idle"==b?(this._rejectFinishedPromise(),this._finishedPromise=void 0):"finished"==b?this._resolveFinishedPromise():"finished"==a&&(this._finishedPromise=void 0)),this._oldPlayState=this.playState,this._readyPromise||this._finishedPromise},_rebuildUnderlyingAnimation:function(){this._updatePromises();var a,c,d,e,f=!!this._animation;f&&(a=this.playbackRate,c=this._paused,d=this.startTime,e=this.currentTime,this._animation.cancel(),this._animation._wrapper=null,this._animation=null),(!this.effect||this.effect instanceof window.KeyframeEffect)&&(this._animation=b.newUnderlyingAnimationForKeyframeEffect(this.effect),b.bindAnimationForKeyframeEffect(this)),(this.effect instanceof window.SequenceEffect||this.effect instanceof window.GroupEffect)&&(this._animation=b.newUnderlyingAnimationForGroup(this.effect),b.bindAnimationForGroup(this)),this.effect&&this.effect._onsample&&b.bindAnimationForCustomEffect(this),f&&(1!=a&&(this.playbackRate=a),null!==d?this.startTime=d:null!==e?this.currentTime=e:null!==this._holdTime&&(this.currentTime=this._holdTime),c&&this.pause()),this._updatePromises()},_updateChildren:function(){if(this.effect&&"idle"!=this.playState){var a=this.effect._timing.delay;this._childAnimations.forEach(function(c){this._arrangeChildren(c,a),this.effect instanceof window.SequenceEffect&&(a+=b.groupChildDuration(c.effect))}.bind(this))}},_setExternalAnimation:function(a){if(this.effect&&this._isGroup)for(var b=0;b<this.effect.children.length;b++)this.effect.children[b]._animation=a,this._childAnimations[b]._setExternalAnimation(a)},_constructChildAnimations:function(){if(this.effect&&this._isGroup){var a=this.effect._timing.delay;this._removeChildAnimations(),this.effect.children.forEach(function(c){var d=b.timeline._play(c);this._childAnimations.push(d),d.playbackRate=this.playbackRate,this._paused&&d.pause(),c._animation=this.effect._animation,this._arrangeChildren(d,a),this.effect instanceof window.SequenceEffect&&(a+=b.groupChildDuration(c))}.bind(this))}},_arrangeChildren:function(a,b){null===this.startTime?a.currentTime=this.currentTime-b/this.playbackRate:a.startTime!==this.startTime+b/this.playbackRate&&(a.startTime=this.startTime+b/this.playbackRate)},get timeline(){return this._timeline},get playState(){return this._animation?this._animation.playState:"idle"},get finished(){return window.Promise?(this._finishedPromise||(-1==b.animationsWithPromises.indexOf(this)&&b.animationsWithPromises.push(this),this._finishedPromise=new Promise(function(a,b){this._resolveFinishedPromise=function(){a(this)},this._rejectFinishedPromise=function(){b({type:DOMException.ABORT_ERR,name:"AbortError"})}}.bind(this)),"finished"==this.playState&&this._resolveFinishedPromise()),this._finishedPromise):(console.warn("Animation Promises require JavaScript Promise constructor"),null)},get ready(){return window.Promise?(this._readyPromise||(-1==b.animationsWithPromises.indexOf(this)&&b.animationsWithPromises.push(this),this._readyPromise=new Promise(function(a,b){this._resolveReadyPromise=function(){a(this)},this._rejectReadyPromise=function(){b({type:DOMException.ABORT_ERR,name:"AbortError"})}}.bind(this)),"pending"!==this.playState&&this._resolveReadyPromise()),this._readyPromise):(console.warn("Animation Promises require JavaScript Promise constructor"),null)},get onfinish(){return this._animation.onfinish},set onfinish(a){this._animation.onfinish="function"==typeof a?function(b){b.target=this,a.call(this,b)}.bind(this):a},get oncancel(){return this._animation.oncancel},set oncancel(a){this._animation.oncancel="function"==typeof a?function(b){b.target=this,a.call(this,b)}.bind(this):a},get currentTime(){this._updatePromises();var a=this._animation.currentTime;return this._updatePromises(),a},set currentTime(a){this._updatePromises(),this._animation.currentTime=isFinite(a)?a:Math.sign(a)*Number.MAX_VALUE,this._register(),this._forEachChild(function(b,c){b.currentTime=a-c}),this._updatePromises()},get startTime(){return this._animation.startTime},set startTime(a){this._updatePromises(),this._animation.startTime=isFinite(a)?a:Math.sign(a)*Number.MAX_VALUE,this._register(),this._forEachChild(function(b,c){b.startTime=a+c}),this._updatePromises()},get playbackRate(){return this._animation.playbackRate},set playbackRate(a){this._updatePromises();var b=this.currentTime;this._animation.playbackRate=a,this._forEachChild(function(b){b.playbackRate=a}),null!==b&&(this.currentTime=b),this._updatePromises()},play:function(){this._updatePromises(),this._paused=!1,this._animation.play(),-1==this._timeline._animations.indexOf(this)&&this._timeline._animations.push(this),this._register(),b.awaitStartTime(this),this._forEachChild(function(a){var b=a.currentTime;a.play(),a.currentTime=b}),this._updatePromises()},pause:function(){this._updatePromises(),this.currentTime&&(this._holdTime=this.currentTime),this._animation.pause(),this._register(),this._forEachChild(function(a){a.pause()}),this._paused=!0,this._updatePromises()},finish:function(){this._updatePromises(),this._animation.finish(),this._register(),this._updatePromises()},cancel:function(){this._updatePromises(),this._animation.cancel(),this._register(),this._removeChildAnimations(),this._updatePromises()},reverse:function(){this._updatePromises();var a=this.currentTime;this._animation.reverse(),this._forEachChild(function(a){a.reverse()}),null!==a&&(this.currentTime=a),this._updatePromises()},addEventListener:function(a,b){var c=b;"function"==typeof b&&(c=function(a){a.target=this,b.call(this,a)}.bind(this),b._wrapper=c),this._animation.addEventListener(a,c)},removeEventListener:function(a,b){this._animation.removeEventListener(a,b&&b._wrapper||b)},_removeChildAnimations:function(){for(;this._childAnimations.length;)this._childAnimations.pop().cancel()},_forEachChild:function(b){var c=0;if(this.effect.children&&this._childAnimations.length<this.effect.children.length&&this._constructChildAnimations(),this._childAnimations.forEach(function(a){b.call(this,a,c),this.effect instanceof window.SequenceEffect&&(c+=a.effect.activeDuration)}.bind(this)),"pending"!=this.playState){var d=this.effect._timing,e=this.currentTime;null!==e&&(e=a.calculateIterationProgress(a.calculateActiveDuration(d),e,d)),(null==e||isNaN(e))&&this._removeChildAnimations()}}},window.Animation=b.Animation}(c,e),function(a,b,c){function d(b){this._frames=a.normalizeKeyframes(b)}function e(){for(var a=!1;i.length;)i.shift()._updateChildren(),a=!0;return a}var f=function(a){if(a._animation=void 0,a instanceof window.SequenceEffect||a instanceof window.GroupEffect)for(var b=0;b<a.children.length;b++)f(a.children[b])};b.removeMulti=function(a){for(var b=[],c=0;c<a.length;c++){var d=a[c];d._parent?(-1==b.indexOf(d._parent)&&b.push(d._parent),d._parent.children.splice(d._parent.children.indexOf(d),1),d._parent=null,f(d)):d._animation&&d._animation.effect==d&&(d._animation.cancel(),d._animation.effect=new KeyframeEffect(null,[]),d._animation._callback&&(d._animation._callback._animation=null),d._animation._rebuildUnderlyingAnimation(),f(d))}for(c=0;c<b.length;c++)b[c]._rebuild()},b.KeyframeEffect=function(b,c,e,f){return this.target=b,this._parent=null,e=a.numericTimingToObject(e),this._timingInput=a.cloneTimingInput(e),this._timing=a.normalizeTimingInput(e),this.timing=a.makeTiming(e,!1,this),this.timing._effect=this,"function"==typeof c?(a.deprecated("Custom KeyframeEffect","2015-06-22","Use KeyframeEffect.onsample instead."),this._normalizedKeyframes=c):this._normalizedKeyframes=new d(c),this._keyframes=c,this.activeDuration=a.calculateActiveDuration(this._timing),this._id=f,this},b.KeyframeEffect.prototype={getFrames:function(){return"function"==typeof this._normalizedKeyframes?this._normalizedKeyframes:this._normalizedKeyframes._frames},set onsample(a){if("function"==typeof this.getFrames())throw new Error("Setting onsample on custom effect KeyframeEffect is not supported.");this._onsample=a,this._animation&&this._animation._rebuildUnderlyingAnimation()},get parent(){return this._parent},clone:function(){if("function"==typeof this.getFrames())throw new Error("Cloning custom effects is not supported.");var b=new KeyframeEffect(this.target,[],a.cloneTimingInput(this._timingInput),this._id);return b._normalizedKeyframes=this._normalizedKeyframes,b._keyframes=this._keyframes,b},remove:function(){b.removeMulti([this])}};var g=Element.prototype.animate;Element.prototype.animate=function(a,c){var d="";return c&&c.id&&(d=c.id),b.timeline._play(new b.KeyframeEffect(this,a,c,d))};var h=document.createElementNS("http://www.w3.org/1999/xhtml","div");b.newUnderlyingAnimationForKeyframeEffect=function(a){if(a){var b=a.target||h,c=a._keyframes;"function"==typeof c&&(c=[]);var d=a._timingInput;d.id=a._id}else var b=h,c=[],d=0;return g.apply(b,[c,d])},b.bindAnimationForKeyframeEffect=function(a){a.effect&&"function"==typeof a.effect._normalizedKeyframes&&b.bindAnimationForCustomEffect(a)};var i=[];b.awaitStartTime=function(a){null===a.startTime&&a._isGroup&&(0==i.length&&requestAnimationFrame(e),i.push(a))};var j=window.getComputedStyle;Object.defineProperty(window,"getComputedStyle",{configurable:!0,enumerable:!0,value:function(){b.timeline._updateAnimationsPromises();var a=j.apply(this,arguments);return e()&&(a=j.apply(this,arguments)),b.timeline._updateAnimationsPromises(),a}}),window.KeyframeEffect=b.KeyframeEffect,window.Element.prototype.getAnimations=function(){return document.timeline.getAnimations().filter(function(a){return null!==a.effect&&a.effect.target==this}.bind(this))}}(c,e),function(a,b,c){function d(a){a._registered||(a._registered=!0,g.push(a),h||(h=!0,requestAnimationFrame(e)))}function e(a){var b=g;g=[],b.sort(function(a,b){return a._sequenceNumber-b._sequenceNumber}),b=b.filter(function(a){a();var b=a._animation?a._animation.playState:"idle";return"running"!=b&&"pending"!=b&&(a._registered=!1),a._registered}),g.push.apply(g,b),g.length?(h=!0,requestAnimationFrame(e)):h=!1}var f=(document.createElementNS("http://www.w3.org/1999/xhtml","div"),0);b.bindAnimationForCustomEffect=function(b){var c,e=b.effect.target,g="function"==typeof b.effect.getFrames();c=g?b.effect.getFrames():b.effect._onsample;var h=b.effect.timing,i=null;h=a.normalizeTimingInput(h);var j=function(){var d=j._animation?j._animation.currentTime:null;null!==d&&(d=a.calculateIterationProgress(a.calculateActiveDuration(h),d,h),isNaN(d)&&(d=null)),d!==i&&(g?c(d,e,b.effect):c(d,b.effect,b.effect._animation)),i=d};j._animation=b,j._registered=!1,j._sequenceNumber=f++,b._callback=j,d(j)};var g=[],h=!1;b.Animation.prototype._register=function(){this._callback&&d(this._callback)}}(c,e),function(a,b,c){function d(a){return a._timing.delay+a.activeDuration+a._timing.endDelay}function e(b,c,d){this._id=d,this._parent=null,this.children=b||[],this._reparent(this.children),c=a.numericTimingToObject(c),this._timingInput=a.cloneTimingInput(c),this._timing=a.normalizeTimingInput(c,!0),this.timing=a.makeTiming(c,!0,this),this.timing._effect=this,"auto"===this._timing.duration&&(this._timing.duration=this.activeDuration)}window.SequenceEffect=function(){e.apply(this,arguments)},window.GroupEffect=function(){e.apply(this,arguments)},e.prototype={_isAncestor:function(a){for(var b=this;null!==b;){if(b==a)return!0;b=b._parent}return!1},_rebuild:function(){for(var a=this;a;)"auto"===a.timing.duration&&(a._timing.duration=a.activeDuration),a=a._parent;this._animation&&this._animation._rebuildUnderlyingAnimation()},_reparent:function(a){b.removeMulti(a);for(var c=0;c<a.length;c++)a[c]._parent=this},_putChild:function(a,b){for(var c=b?"Cannot append an ancestor or self":"Cannot prepend an ancestor or self",d=0;d<a.length;d++)if(this._isAncestor(a[d]))throw{type:DOMException.HIERARCHY_REQUEST_ERR,name:"HierarchyRequestError",message:c};for(var d=0;d<a.length;d++)b?this.children.push(a[d]):this.children.unshift(a[d]);this._reparent(a),this._rebuild()},append:function(){this._putChild(arguments,!0)},prepend:function(){this._putChild(arguments,!1)},get parent(){return this._parent},get firstChild(){return this.children.length?this.children[0]:null},get lastChild(){return this.children.length?this.children[this.children.length-1]:null},clone:function(){for(var b=a.cloneTimingInput(this._timingInput),c=[],d=0;d<this.children.length;d++)c.push(this.children[d].clone());return this instanceof GroupEffect?new GroupEffect(c,b):new SequenceEffect(c,b)},remove:function(){b.removeMulti([this])}},window.SequenceEffect.prototype=Object.create(e.prototype),Object.defineProperty(window.SequenceEffect.prototype,"activeDuration",{get:function(){var a=0;return this.children.forEach(function(b){a+=d(b)}),Math.max(a,0)}}),window.GroupEffect.prototype=Object.create(e.prototype),Object.defineProperty(window.GroupEffect.prototype,"activeDuration",{get:function(){var a=0;return this.children.forEach(function(b){a=Math.max(a,d(b))}),a}}),b.newUnderlyingAnimationForGroup=function(c){var d,e=null,f=function(b){var c=d._wrapper;if(c&&"pending"!=c.playState&&c.effect)return null==b?void c._removeChildAnimations():0==b&&c.playbackRate<0&&(e||(e=a.normalizeTimingInput(c.effect.timing)),b=a.calculateIterationProgress(a.calculateActiveDuration(e),-1,e),isNaN(b)||null==b)?(c._forEachChild(function(a){a.currentTime=-1}),void c._removeChildAnimations()):void 0},g=new KeyframeEffect(null,[],c._timing,c._id);return g.onsample=f,d=b.timeline._play(g)},b.bindAnimationForGroup=function(a){a._animation._wrapper=a,a._isGroup=!0,b.awaitStartTime(a),a._constructChildAnimations(),a._setExternalAnimation(a)},b.groupChildDuration=d}(c,e),b.true=a}({},function(){return this}());
//# sourceMappingURL=web-animations-next-lite.min.js.map

/***/ }),

/***/ "./node_modules/webpack/buildin/global.js":
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),

/***/ "./src/main.css":
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ "./src/main.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_web_animations_js_web_animations_next_lite_min__ = __webpack_require__("./node_modules/web-animations-js/web-animations-next-lite.min.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_web_animations_js_web_animations_next_lite_min___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_web_animations_js_web_animations_next_lite_min__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__dojo_framework_widget_core_vdom__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/vdom.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__dojo_framework_widget_core_d__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/d.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__dojo_themes_dojo_index_css__ = __webpack_require__("./node_modules/@dojo/themes/dojo/index.css");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__dojo_themes_dojo_index_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__dojo_themes_dojo_index_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__widgets_App__ = __webpack_require__("./src/widgets/App.ts");





const r = Object(__WEBPACK_IMPORTED_MODULE_1__dojo_framework_widget_core_vdom__["a" /* default */])(() => Object(__WEBPACK_IMPORTED_MODULE_2__dojo_framework_widget_core_d__["h" /* w */])(__WEBPACK_IMPORTED_MODULE_4__widgets_App__["a" /* default */], {}));
r.mount();


/***/ }),

/***/ "./src/widgets/App.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__dojo_framework_widget_core_d__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/d.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__dojo_framework_widget_core_WidgetBase__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/WidgetBase.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Cat__ = __webpack_require__("./src/widgets/Cat.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__Dog__ = __webpack_require__("./src/widgets/Dog.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__styles_app_m_css__ = __webpack_require__("./src/widgets/styles/app.m.css");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__styles_app_m_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4__styles_app_m_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__CoreAudio__ = __webpack_require__("./src/widgets/CoreAudio.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__dojo_widgets_slider__ = __webpack_require__("./node_modules/@dojo/widgets/slider/index.mjs");







class App extends __WEBPACK_IMPORTED_MODULE_1__dojo_framework_widget_core_WidgetBase__["b" /* default */] {
    constructor() {
        super(...arguments);
        this.coreAudio = new __WEBPACK_IMPORTED_MODULE_5__CoreAudio__["a" /* CoreAudio */]();
        this.choice = '';
        this.excitedValue = 1;
        this.playing = false;
    }
    _onChoiceClick(choice) {
        this.choice = choice;
        this.invalidate();
    }
    _onSpeakClick() {
        this.playing = true;
        this.coreAudio.play(this.choice, this.excitedValue, () => {
            this.playing = false;
            this.invalidate();
        });
        this.invalidate();
    }
    _excitedChange(value) {
        this.excitedValue = value;
        this.invalidate();
    }
    render() {
        const { excitedValue, choice, playing } = this;
        return Object(__WEBPACK_IMPORTED_MODULE_0__dojo_framework_widget_core_d__["g" /* v */])('div', { classes: __WEBPACK_IMPORTED_MODULE_4__styles_app_m_css__["root"] }, [
            Object(__WEBPACK_IMPORTED_MODULE_0__dojo_framework_widget_core_d__["g" /* v */])('header', { classes: __WEBPACK_IMPORTED_MODULE_4__styles_app_m_css__["header"] }, [
                Object(__WEBPACK_IMPORTED_MODULE_0__dojo_framework_widget_core_d__["g" /* v */])('button', { classes: __WEBPACK_IMPORTED_MODULE_4__styles_app_m_css__["button"], onclick: () => {
                        this._onChoiceClick('cat');
                    } }, ['Cats']),
                Object(__WEBPACK_IMPORTED_MODULE_0__dojo_framework_widget_core_d__["g" /* v */])('p', {}, ['vs']),
                Object(__WEBPACK_IMPORTED_MODULE_0__dojo_framework_widget_core_d__["g" /* v */])('button', { classes: __WEBPACK_IMPORTED_MODULE_4__styles_app_m_css__["button"], onclick: () => {
                        this._onChoiceClick('dog');
                    } }, ['Dogs'])
            ]),
            this.choice ? Object(__WEBPACK_IMPORTED_MODULE_0__dojo_framework_widget_core_d__["g" /* v */])('div', { classes: __WEBPACK_IMPORTED_MODULE_4__styles_app_m_css__["controls"] }, [
                Object(__WEBPACK_IMPORTED_MODULE_0__dojo_framework_widget_core_d__["h" /* w */])(__WEBPACK_IMPORTED_MODULE_6__dojo_widgets_slider__["a" /* default */], {
                    extraClasses: { root: __WEBPACK_IMPORTED_MODULE_4__styles_app_m_css__["slider"] },
                    label: `How Excited is the ${choice}`,
                    value: excitedValue,
                    min: 0.1,
                    max: 3,
                    step: 0.1,
                    onChange: this._excitedChange
                }),
                Object(__WEBPACK_IMPORTED_MODULE_0__dojo_framework_widget_core_d__["g" /* v */])('button', {
                    classes: __WEBPACK_IMPORTED_MODULE_4__styles_app_m_css__["button"],
                    onclick: this._onSpeakClick,
                    disabled: playing
                }, ['Speak'])
            ]) : undefined,
            this.choice === 'cat' ? Object(__WEBPACK_IMPORTED_MODULE_0__dojo_framework_widget_core_d__["h" /* w */])(__WEBPACK_IMPORTED_MODULE_2__Cat__["a" /* Cat */], { animationSpeed: excitedValue }) : undefined,
            this.choice === 'dog' ? Object(__WEBPACK_IMPORTED_MODULE_0__dojo_framework_widget_core_d__["h" /* w */])(__WEBPACK_IMPORTED_MODULE_3__Dog__["a" /* Dog */], { animationSpeed: excitedValue }) : undefined
        ]);
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = App;



/***/ }),

/***/ "./src/widgets/Cat.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__dojo_framework_widget_core_WidgetBase__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/WidgetBase.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__styles_cat_m_css__ = __webpack_require__("./src/widgets/styles/cat.m.css");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__styles_cat_m_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__styles_cat_m_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__dojo_framework_widget_core_d__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/d.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__dojo_framework_widget_core_meta_WebAnimation__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/meta/WebAnimation.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__dojo_framework_widget_core_mixins_Themed__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/mixins/Themed.mjs");





const head = __webpack_require__("./src/widgets/assets/cat-head.png");
const body = __webpack_require__("./src/widgets/assets/cat-body.png");
const tail = __webpack_require__("./src/widgets/assets/cat-tail.png");
class Cat extends Object(__WEBPACK_IMPORTED_MODULE_4__dojo_framework_widget_core_mixins_Themed__["b" /* default */])(__WEBPACK_IMPORTED_MODULE_0__dojo_framework_widget_core_WidgetBase__["a" /* WidgetBase */]) {
    _getHeadAnimation(animationSpeed) {
        return {
            id: 'cat-head',
            effects: [
                { marginBottom: '0px' },
                { marginBottom: '5px' },
                { marginBottom: '0px' }
            ],
            timing: {
                duration: 800,
                iterations: Infinity
            },
            controls: {
                play: true,
                playbackRate: animationSpeed
            }
        };
    }
    _getTailAnimation(animationSpeed) {
        return {
            id: 'cat-tail',
            effects: [
                { transform: 'rotate(0deg)' },
                { transform: 'rotate(-10deg)' },
                { transform: 'rotate(0deg)' }
            ],
            timing: {
                duration: 1000,
                iterations: Infinity
            },
            controls: {
                play: true,
                playbackRate: animationSpeed
            }
        };
    }
    render() {
        const { animationSpeed } = this.properties;
        this.meta(__WEBPACK_IMPORTED_MODULE_3__dojo_framework_widget_core_meta_WebAnimation__["a" /* default */]).animate('cat-head', this._getHeadAnimation(animationSpeed));
        this.meta(__WEBPACK_IMPORTED_MODULE_3__dojo_framework_widget_core_meta_WebAnimation__["a" /* default */]).animate('cat-tail', this._getTailAnimation(animationSpeed));
        return Object(__WEBPACK_IMPORTED_MODULE_2__dojo_framework_widget_core_d__["g" /* v */])('div', { classes: __WEBPACK_IMPORTED_MODULE_1__styles_cat_m_css__["root"] }, [
            Object(__WEBPACK_IMPORTED_MODULE_2__dojo_framework_widget_core_d__["g" /* v */])('img', { key: 'cat-head', src: head, classes: __WEBPACK_IMPORTED_MODULE_1__styles_cat_m_css__["head"] }),
            Object(__WEBPACK_IMPORTED_MODULE_2__dojo_framework_widget_core_d__["g" /* v */])('img', { key: 'cat-body', src: body, classes: __WEBPACK_IMPORTED_MODULE_1__styles_cat_m_css__["body"] }),
            Object(__WEBPACK_IMPORTED_MODULE_2__dojo_framework_widget_core_d__["g" /* v */])('img', { key: 'cat-tail', src: tail, classes: __WEBPACK_IMPORTED_MODULE_1__styles_cat_m_css__["tail"] })
        ]);
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Cat;



/***/ }),

/***/ "./src/widgets/CoreAudio.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__("./node_modules/tslib/tslib.es6.js");

const AudioContext = window.AudioContext || window.webkitAudioContext; // safari :\
class CoreAudio {
    constructor() {
        this.audioMap = new Map();
    }
    play(sound, speed, onStop) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function* () {
            if (!this.context) {
                this.context = new AudioContext();
            }
            // Chrome and Safari are both awful
            if (this.context.state === 'suspended') {
                this.context.resume();
            }
            const source = this.context.createBufferSource();
            source.buffer = yield this.loadCached(sound);
            source.connect(this.context.destination);
            source.playbackRate.value = speed;
            source.loop = true;
            source.start(this.context.currentTime);
            setTimeout(() => {
                source.stop();
                onStop();
            }, 5000);
            console.log(sound);
        });
    }
    loadCached(sound) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function* () {
            if (this.audioMap.has(sound)) {
                return this.audioMap.get(sound);
            }
            const buffer = yield this.loadAudio(sound);
            this.audioMap.set(sound, buffer);
            return buffer;
        });
    }
    loadAudio(sound) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function* () {
            const result = yield fetch(`assets/sounds/${sound}.mp3`);
            const audioData = yield result.arrayBuffer();
            return yield this.context.decodeAudioData(audioData);
        });
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = CoreAudio;



/***/ }),

/***/ "./src/widgets/Dog.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Dog; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__("./node_modules/tslib/tslib.es6.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__dojo_framework_widget_core_mixins_Themed__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/mixins/Themed.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__dojo_framework_widget_core_WidgetBase__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/WidgetBase.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__styles_dog_m_css__ = __webpack_require__("./src/widgets/styles/dog.m.css");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__styles_dog_m_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__styles_dog_m_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__dojo_framework_widget_core_d__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/d.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__dojo_framework_widget_core_meta_WebAnimation__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/meta/WebAnimation.mjs");






const head = __webpack_require__("./src/widgets/assets/dog-head.png");
const body = __webpack_require__("./src/widgets/assets/dog-body.png");
const tail = __webpack_require__("./src/widgets/assets/dog-tail.png");
let Dog = class Dog extends Object(__WEBPACK_IMPORTED_MODULE_1__dojo_framework_widget_core_mixins_Themed__["a" /* ThemedMixin */])(__WEBPACK_IMPORTED_MODULE_2__dojo_framework_widget_core_WidgetBase__["a" /* WidgetBase */]) {
    _getHeadAnimation(animationSpeed) {
        return {
            id: 'dog-head',
            effects: [
                { marginBottom: '0px' },
                { marginBottom: '5px' },
                { marginBottom: '0px' }
            ],
            timing: {
                duration: 800,
                iterations: Infinity
            },
            controls: {
                play: true,
                playbackRate: animationSpeed
            }
        };
    }
    _getTailAnimation(animationSpeed) {
        return {
            id: 'dog-tail',
            effects: [
                { transform: 'rotate(10deg)' },
                { transform: 'rotate(-10deg)' },
                { transform: 'rotate(10deg)' }
            ],
            timing: {
                duration: 1000,
                iterations: Infinity
            },
            controls: {
                play: true,
                playbackRate: animationSpeed
            }
        };
    }
    render() {
        const { animationSpeed } = this.properties;
        this.meta(__WEBPACK_IMPORTED_MODULE_5__dojo_framework_widget_core_meta_WebAnimation__["a" /* default */]).animate('dog-head', this._getHeadAnimation(animationSpeed));
        this.meta(__WEBPACK_IMPORTED_MODULE_5__dojo_framework_widget_core_meta_WebAnimation__["a" /* default */]).animate('dog-tail', this._getTailAnimation(animationSpeed));
        return Object(__WEBPACK_IMPORTED_MODULE_4__dojo_framework_widget_core_d__["g" /* v */])('div', { classes: __WEBPACK_IMPORTED_MODULE_3__styles_dog_m_css__["root"] }, [
            Object(__WEBPACK_IMPORTED_MODULE_4__dojo_framework_widget_core_d__["g" /* v */])('img', { key: 'dog-head', src: head, classes: __WEBPACK_IMPORTED_MODULE_3__styles_dog_m_css__["head"] }),
            Object(__WEBPACK_IMPORTED_MODULE_4__dojo_framework_widget_core_d__["g" /* v */])('img', { key: 'dog-body', src: body, classes: __WEBPACK_IMPORTED_MODULE_3__styles_dog_m_css__["body"] }),
            Object(__WEBPACK_IMPORTED_MODULE_4__dojo_framework_widget_core_d__["g" /* v */])('img', { key: 'dog-tail', src: tail, classes: __WEBPACK_IMPORTED_MODULE_3__styles_dog_m_css__["tail"] })
        ]);
    }
};
Dog = __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __decorate */]([
    Object(__WEBPACK_IMPORTED_MODULE_1__dojo_framework_widget_core_mixins_Themed__["d" /* theme */])(__WEBPACK_IMPORTED_MODULE_3__styles_dog_m_css__)
], Dog);



/***/ }),

/***/ "./src/widgets/assets/cat-body.png":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "cat-body.4mNxJ_Nx.png";

/***/ }),

/***/ "./src/widgets/assets/cat-head.png":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "cat-head.1LN0FxJJ.png";

/***/ }),

/***/ "./src/widgets/assets/cat-tail.png":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "cat-tail.2gwMshNt.png";

/***/ }),

/***/ "./src/widgets/assets/dog-body.png":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "dog-body.1iM2hRU8.png";

/***/ }),

/***/ "./src/widgets/assets/dog-head.png":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "dog-head.35KrvViJ.png";

/***/ }),

/***/ "./src/widgets/assets/dog-tail.png":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "dog-tail.1v6Adw00.png";

/***/ }),

/***/ "./src/widgets/styles/app.m.css":
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin
module.exports = {" _key":"catsvsdogs/app","root":"app-m__root__2lj42","button":"app-m__button__1hmKn","header":"app-m__header__3_gtv","controls":"app-m__controls__2hkAr","slider":"app-m__slider__oogtW"};

/***/ }),

/***/ "./src/widgets/styles/cat.m.css":
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin
module.exports = {" _key":"catsvsdogs/cat","root":"cat-m__root__2IOrd","head":"cat-m__head__1iCbR","body":"cat-m__body__VBY2Y","tail":"cat-m__tail__16R-e"};

/***/ }),

/***/ "./src/widgets/styles/dog.m.css":
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin
module.exports = {" _key":"catsvsdogs/dog","root":"dog-m__root__1zqdj","head":"dog-m__head__h5Y7i","body":"dog-m__body__1Pbg-","tail":"dog-m__tail__1K71t"};

/***/ }),

/***/ 0:
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__("./node_modules/@dojo/webpack-contrib/build-time-render/hasBuildTimeRender.js");
__webpack_require__("./src/main.css");
module.exports = __webpack_require__("./src/main.ts");


/***/ })

},[0]);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovLy9EZXN0cm95YWJsZS50cyIsIndlYnBhY2s6Ly8vRXZlbnRlZC50cyIsIndlYnBhY2s6Ly8vdXRpbC50cyIsIndlYnBhY2s6Ly8vaGFzLnRzIiwid2VicGFjazovLy9NYXAudHMiLCJ3ZWJwYWNrOi8vL1Byb21pc2UudHMiLCJ3ZWJwYWNrOi8vL1NldC50cyIsIndlYnBhY2s6Ly8vU3ltYm9sLnRzIiwid2VicGFjazovLy9XZWFrTWFwLnRzIiwid2VicGFjazovLy9hcnJheS50cyIsIndlYnBhY2s6Ly8vZ2xvYmFsLnRzIiwid2VicGFjazovLy9pdGVyYXRvci50cyIsIndlYnBhY2s6Ly8vbnVtYmVyLnRzIiwid2VicGFjazovLy9vYmplY3QudHMiLCJ3ZWJwYWNrOi8vL3N0cmluZy50cyIsIndlYnBhY2s6Ly8vcXVldWUudHMiLCJ3ZWJwYWNrOi8vL0luamVjdG9yLnRzIiwid2VicGFjazovLy9Ob2RlSGFuZGxlci50cyIsIndlYnBhY2s6Ly8vUmVnaXN0cnkudHMiLCJ3ZWJwYWNrOi8vL1JlZ2lzdHJ5SGFuZGxlci50cyIsIndlYnBhY2s6Ly8vV2lkZ2V0QmFzZS50cyIsIndlYnBhY2s6Ly8vY3NzVHJhbnNpdGlvbnMudHMiLCJ3ZWJwYWNrOi8vL2QudHMiLCJ3ZWJwYWNrOi8vL2Fsd2F5c1JlbmRlci50cyIsIndlYnBhY2s6Ly8vYmVmb3JlUHJvcGVydGllcy50cyIsIndlYnBhY2s6Ly8vY3VzdG9tRWxlbWVudC50cyIsIndlYnBhY2s6Ly8vZGlmZlByb3BlcnR5LnRzIiwid2VicGFjazovLy9oYW5kbGVEZWNvcmF0b3IudHMiLCJ3ZWJwYWNrOi8vL2luamVjdC50cyIsIndlYnBhY2s6Ly8vZGlmZi50cyIsIndlYnBhY2s6Ly8vQmFzZS50cyIsIndlYnBhY2s6Ly8vRm9jdXMudHMiLCJ3ZWJwYWNrOi8vL1dlYkFuaW1hdGlvbi50cyIsIndlYnBhY2s6Ly8vVGhlbWVkLnRzIiwid2VicGFjazovLy9yZWdpc3RlckN1c3RvbUVsZW1lbnQudHMiLCJ3ZWJwYWNrOi8vL3Zkb20udHMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0Bkb2pvL3RoZW1lcy9kb2pvL2luZGV4LmNzcz83NzQxIiwid2VicGFjazovLy9oYXNCdWlsZFRpbWVSZW5kZXIudHMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0Bkb2pvL3dpZGdldHMvY29tbW9uL3N0eWxlcy9iYXNlLm0uY3NzPzU1NmYiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0Bkb2pvL3dpZGdldHMvY29tbW9uL3N0eWxlcy9iYXNlLm0uY3NzLmpzIiwid2VicGFjazovLy8uLi8uLi8uLi9zcmMvY29tbW9uL3V0aWwudHMiLCJ3ZWJwYWNrOi8vLy4uLy4uLy4uL3NyYy9sYWJlbC9pbmRleC50cyIsIndlYnBhY2s6Ly8vLi4vLi4vLi4vc3JjL3NsaWRlci9pbmRleC50cyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvQGRvam8vd2lkZ2V0cy9zbGlkZXIvc3R5bGVzL3NsaWRlci5tLmNzcz8wMTJkIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9AZG9qby93aWRnZXRzL3NsaWRlci9zdHlsZXMvc2xpZGVyLm0uY3NzLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9AZG9qby93aWRnZXRzL3RoZW1lL2xhYmVsLm0uY3NzP2FkMTMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0Bkb2pvL3dpZGdldHMvdGhlbWUvbGFiZWwubS5jc3MuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0Bkb2pvL3dpZGdldHMvdGhlbWUvc2xpZGVyLm0uY3NzPzY0YjUiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0Bkb2pvL3dpZGdldHMvdGhlbWUvc2xpZGVyLm0uY3NzLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3RzbGliL3RzbGliLmVzNi5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvd2ViLWFuaW1hdGlvbnMtanMvd2ViLWFuaW1hdGlvbnMtbmV4dC1saXRlLm1pbi5qcyIsIndlYnBhY2s6Ly8vKHdlYnBhY2spL2J1aWxkaW4vZ2xvYmFsLmpzIiwid2VicGFjazovLy8uL3NyYy9tYWluLmNzcz8zOGRiIiwid2VicGFjazovLy8uL3NyYy9tYWluLnRzIiwid2VicGFjazovLy8uL3NyYy93aWRnZXRzL0FwcC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvd2lkZ2V0cy9DYXQudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3dpZGdldHMvQ29yZUF1ZGlvLnRzIiwid2VicGFjazovLy8uL3NyYy93aWRnZXRzL0RvZy50cyIsIndlYnBhY2s6Ly8vLi9zcmMvd2lkZ2V0cy9hc3NldHMvY2F0LWJvZHkucG5nIiwid2VicGFjazovLy8uL3NyYy93aWRnZXRzL2Fzc2V0cy9jYXQtaGVhZC5wbmciLCJ3ZWJwYWNrOi8vLy4vc3JjL3dpZGdldHMvYXNzZXRzL2NhdC10YWlsLnBuZyIsIndlYnBhY2s6Ly8vLi9zcmMvd2lkZ2V0cy9hc3NldHMvZG9nLWJvZHkucG5nIiwid2VicGFjazovLy8uL3NyYy93aWRnZXRzL2Fzc2V0cy9kb2ctaGVhZC5wbmciLCJ3ZWJwYWNrOi8vLy4vc3JjL3dpZGdldHMvYXNzZXRzL2RvZy10YWlsLnBuZyIsIndlYnBhY2s6Ly8vLi9zcmMvd2lkZ2V0cy9zdHlsZXMvYXBwLm0uY3NzPzM0MjAiLCJ3ZWJwYWNrOi8vLy4vc3JjL3dpZGdldHMvc3R5bGVzL2NhdC5tLmNzcz9jMTg3Iiwid2VicGFjazovLy8uL3NyYy93aWRnZXRzL3N0eWxlcy9kb2cubS5jc3M/NDY5NyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0QsTzs7Ozs7O0FDVkE7QUFBc0M7QUFhdEM7O0dBRUc7QUFD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RUFBRSxHQUFHLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLHVEQUFRLEVBQUUsQ0FBQztTQUMzRCxDQUFDLENBQUM7SUFDSixDQUFDO0NBQ0Q7QUFwRFksR0FBRztJQURmLGdHQUFLLENBQUMsK0NBQUcsQ0FBQztHQUNFLEdBQUcsQ0FvRGY7QUFwRGU7Ozs7Ozs7O0FDZmhCLGlCQUFpQixxQkFBdUIsMkI7Ozs7Ozs7QUNBeEMsaUJBQWlCLHFCQUF1QiwyQjs7Ozs7OztBQ0F4QyxpQkFBaUIscUJBQXVCLDJCOzs7Ozs7O0FDQXhDLGlCQUFpQixxQkFBdUIsMkI7Ozs7Ozs7QUNBeEMsaUJBQWlCLHFCQUF1QiwyQjs7Ozs7OztBQ0F4QyxpQkFBaUIscUJBQXVCLDJCOzs7Ozs7O0FDQXhDO0FBQ0Esa0JBQWtCLDBMOzs7Ozs7O0FDRGxCO0FBQ0Esa0JBQWtCLDBJOzs7Ozs7O0FDRGxCO0FBQ0Esa0JBQWtCLDBJIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG5cdGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKVxuXHRcdGRlZmluZShcImNhdHN2c2RvZ3NcIiwgW10sIGZhY3RvcnkpO1xuXHRlbHNlIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jylcblx0XHRleHBvcnRzW1wiY2F0c3ZzZG9nc1wiXSA9IGZhY3RvcnkoKTtcblx0ZWxzZVxuXHRcdHJvb3RbXCJjYXRzdnNkb2dzXCJdID0gZmFjdG9yeSgpO1xufSkodGhpcywgZnVuY3Rpb24oKSB7XG5yZXR1cm4gXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svdW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbiIsImltcG9ydCBQcm9taXNlIGZyb20gJy4uL3NoaW0vUHJvbWlzZSc7XG5cbi8qKlxuICogVXNlZCB0aHJvdWdoIHRoZSB0b29sa2l0IGFzIGEgY29uc2lzdGVudCBBUEkgdG8gbWFuYWdlIGhvdyBjYWxsZXJzIGNhbiBcImNsZWFudXBcIlxuICogd2hlbiBkb2luZyBhIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEhhbmRsZSB7XG5cdC8qKlxuXHQgKiBQZXJmb3JtIHRoZSBkZXN0cnVjdGlvbi9jbGVhbnVwIGxvZ2ljIGFzc29jaWF0ZWQgd2l0aCB0aGlzIEhhbmRsZVxuXHQgKi9cblx0ZGVzdHJveSgpOiB2b2lkO1xufVxuXG4vKipcbiAqIE5vIG9wIGZ1bmN0aW9uIHVzZWQgdG8gcmVwbGFjZSBhIERlc3Ryb3lhYmxlIGluc3RhbmNlJ3MgYGRlc3Ryb3lgIG1ldGhvZCwgb25jZSB0aGUgaW5zdGFuY2UgaGFzIGJlZW4gZGVzdHJveWVkXG4gKi9cbmZ1bmN0aW9uIG5vb3AoKTogUHJvbWlzZTxib29sZWFuPiB7XG5cdHJldHVybiBQcm9taXNlLnJlc29sdmUoZmFsc2UpO1xufVxuXG4vKipcbiAqIE5vIG9wIGZ1bmN0aW9uIHVzZWQgdG8gcmVwbGFjZSBhIERlc3Ryb3lhYmxlIGluc3RhbmNlJ3MgYG93bmAgbWV0aG9kLCBvbmNlIHRoZSBpbnN0YW5jZSBoYXMgYmVlbiBkZXN0cm95ZWRcbiAqL1xuZnVuY3Rpb24gZGVzdHJveWVkKCk6IG5ldmVyIHtcblx0dGhyb3cgbmV3IEVycm9yKCdDYWxsIG1hZGUgdG8gZGVzdHJveWVkIG1ldGhvZCcpO1xufVxuXG5leHBvcnQgY2xhc3MgRGVzdHJveWFibGUge1xuXHQvKipcblx0ICogVGhlIGluc3RhbmNlJ3MgaGFuZGxlc1xuXHQgKi9cblx0cHJpdmF0ZSBoYW5kbGVzOiBIYW5kbGVbXTtcblxuXHQvKipcblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHR0aGlzLmhhbmRsZXMgPSBbXTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWdpc3RlciBoYW5kbGVzIGZvciB0aGUgaW5zdGFuY2UgdGhhdCB3aWxsIGJlIGRlc3Ryb3llZCB3aGVuIGB0aGlzLmRlc3Ryb3lgIGlzIGNhbGxlZFxuXHQgKlxuXHQgKiBAcGFyYW0ge0hhbmRsZX0gaGFuZGxlIFRoZSBoYW5kbGUgdG8gYWRkIGZvciB0aGUgaW5zdGFuY2Vcblx0ICogQHJldHVybnMge0hhbmRsZX0gQSB3cmFwcGVyIEhhbmRsZS4gV2hlbiB0aGUgd3JhcHBlciBIYW5kbGUncyBgZGVzdHJveWAgbWV0aG9kIGlzIGludm9rZWQsIHRoZSBvcmlnaW5hbCBoYW5kbGUgaXNcblx0ICogICAgICAgICAgICAgICAgICAgcmVtb3ZlZCBmcm9tIHRoZSBpbnN0YW5jZSwgYW5kIGl0cyBgZGVzdHJveWAgbWV0aG9kIGlzIGludm9rZWQuXG5cdCAqL1xuXHRvd24oaGFuZGxlOiBIYW5kbGUpOiBIYW5kbGUge1xuXHRcdGNvbnN0IHsgaGFuZGxlczogX2hhbmRsZXMgfSA9IHRoaXM7XG5cdFx0X2hhbmRsZXMucHVzaChoYW5kbGUpO1xuXHRcdHJldHVybiB7XG5cdFx0XHRkZXN0cm95KCkge1xuXHRcdFx0XHRfaGFuZGxlcy5zcGxpY2UoX2hhbmRsZXMuaW5kZXhPZihoYW5kbGUpKTtcblx0XHRcdFx0aGFuZGxlLmRlc3Ryb3koKTtcblx0XHRcdH1cblx0XHR9O1xuXHR9XG5cblx0LyoqXG5cdCAqIERlc3Ryb3lzIGFsbCBoYW5kbGVycyByZWdpc3RlcmVkIGZvciB0aGUgaW5zdGFuY2Vcblx0ICpcblx0ICogQHJldHVybnMge1Byb21pc2U8YW55fSBBIFByb21pc2UgdGhhdCByZXNvbHZlcyBvbmNlIGFsbCBoYW5kbGVzIGhhdmUgYmVlbiBkZXN0cm95ZWRcblx0ICovXG5cdGRlc3Ryb3koKTogUHJvbWlzZTxhbnk+IHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcblx0XHRcdHRoaXMuaGFuZGxlcy5mb3JFYWNoKChoYW5kbGUpID0+IHtcblx0XHRcdFx0aGFuZGxlICYmIGhhbmRsZS5kZXN0cm95ICYmIGhhbmRsZS5kZXN0cm95KCk7XG5cdFx0XHR9KTtcblx0XHRcdHRoaXMuZGVzdHJveSA9IG5vb3A7XG5cdFx0XHR0aGlzLm93biA9IGRlc3Ryb3llZDtcblx0XHRcdHJlc29sdmUodHJ1ZSk7XG5cdFx0fSk7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgRGVzdHJveWFibGU7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gRGVzdHJveWFibGUudHMiLCJpbXBvcnQgTWFwIGZyb20gJy4uL3NoaW0vTWFwJztcbmltcG9ydCB7IERlc3Ryb3lhYmxlLCBIYW5kbGUgfSBmcm9tICcuL0Rlc3Ryb3lhYmxlJztcblxuLyoqXG4gKiBNYXAgb2YgY29tcHV0ZWQgcmVndWxhciBleHByZXNzaW9ucywga2V5ZWQgYnkgc3RyaW5nXG4gKi9cbmNvbnN0IHJlZ2V4TWFwID0gbmV3IE1hcDxzdHJpbmcsIFJlZ0V4cD4oKTtcblxuZXhwb3J0IHR5cGUgRXZlbnRUeXBlID0gc3RyaW5nIHwgc3ltYm9sO1xuXG4vKipcbiAqIFRoZSBiYXNlIGV2ZW50IG9iamVjdCwgd2hpY2ggcHJvdmlkZXMgYSBgdHlwZWAgcHJvcGVydHlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBFdmVudE9iamVjdDxUID0gRXZlbnRUeXBlPiB7XG5cdC8qKlxuXHQgKiBUaGUgdHlwZSBvZiB0aGUgZXZlbnRcblx0ICovXG5cdHJlYWRvbmx5IHR5cGU6IFQ7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lcyBpZiB0aGUgZXZlbnQgdHlwZSBnbG9iIGhhcyBiZWVuIG1hdGNoZWRcbiAqXG4gKiBAcmV0dXJucyBib29sZWFuIHRoYXQgaW5kaWNhdGVzIGlmIHRoZSBnbG9iIGlzIG1hdGNoZWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzR2xvYk1hdGNoKGdsb2JTdHJpbmc6IHN0cmluZyB8IHN5bWJvbCwgdGFyZ2V0U3RyaW5nOiBzdHJpbmcgfCBzeW1ib2wpOiBib29sZWFuIHtcblx0aWYgKHR5cGVvZiB0YXJnZXRTdHJpbmcgPT09ICdzdHJpbmcnICYmIHR5cGVvZiBnbG9iU3RyaW5nID09PSAnc3RyaW5nJyAmJiBnbG9iU3RyaW5nLmluZGV4T2YoJyonKSAhPT0gLTEpIHtcblx0XHRsZXQgcmVnZXg6IFJlZ0V4cDtcblx0XHRpZiAocmVnZXhNYXAuaGFzKGdsb2JTdHJpbmcpKSB7XG5cdFx0XHRyZWdleCA9IHJlZ2V4TWFwLmdldChnbG9iU3RyaW5nKSE7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJlZ2V4ID0gbmV3IFJlZ0V4cChgXiR7Z2xvYlN0cmluZy5yZXBsYWNlKC9cXCovZywgJy4qJyl9JGApO1xuXHRcdFx0cmVnZXhNYXAuc2V0KGdsb2JTdHJpbmcsIHJlZ2V4KTtcblx0XHR9XG5cdFx0cmV0dXJuIHJlZ2V4LnRlc3QodGFyZ2V0U3RyaW5nKTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gZ2xvYlN0cmluZyA9PT0gdGFyZ2V0U3RyaW5nO1xuXHR9XG59XG5cbmV4cG9ydCB0eXBlIEV2ZW50ZWRDYWxsYmFjazxUID0gRXZlbnRUeXBlLCBFIGV4dGVuZHMgRXZlbnRPYmplY3Q8VD4gPSBFdmVudE9iamVjdDxUPj4gPSB7XG5cdC8qKlxuXHQgKiBBIGNhbGxiYWNrIHRoYXQgdGFrZXMgYW4gYGV2ZW50YCBhcmd1bWVudFxuXHQgKlxuXHQgKiBAcGFyYW0gZXZlbnQgVGhlIGV2ZW50IG9iamVjdFxuXHQgKi9cblxuXHQoZXZlbnQ6IEUpOiBib29sZWFuIHwgdm9pZDtcbn07XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ3VzdG9tRXZlbnRUeXBlczxUIGV4dGVuZHMgRXZlbnRPYmplY3Q8YW55PiA9IEV2ZW50T2JqZWN0PGFueT4+IHtcblx0W2luZGV4OiBzdHJpbmddOiBUO1xufVxuXG4vKipcbiAqIEEgdHlwZSB3aGljaCBpcyBlaXRoZXIgYSB0YXJnZXRlZCBldmVudCBsaXN0ZW5lciBvciBhbiBhcnJheSBvZiBsaXN0ZW5lcnNcbiAqIEB0ZW1wbGF0ZSBUIFRoZSB0eXBlIG9mIHRhcmdldCBmb3IgdGhlIGV2ZW50c1xuICogQHRlbXBsYXRlIEUgVGhlIGV2ZW50IHR5cGUgZm9yIHRoZSBldmVudHNcbiAqL1xuZXhwb3J0IHR5cGUgRXZlbnRlZENhbGxiYWNrT3JBcnJheTxUID0gRXZlbnRUeXBlLCBFIGV4dGVuZHMgRXZlbnRPYmplY3Q8VD4gPSBFdmVudE9iamVjdDxUPj4gPVxuXHR8IEV2ZW50ZWRDYWxsYmFjazxULCBFPlxuXHR8IEV2ZW50ZWRDYWxsYmFjazxULCBFPltdO1xuXG4vKipcbiAqIEV2ZW50IENsYXNzXG4gKi9cbmV4cG9ydCBjbGFzcyBFdmVudGVkPFxuXHRNIGV4dGVuZHMgQ3VzdG9tRXZlbnRUeXBlcyA9IHt9LFxuXHRUID0gRXZlbnRUeXBlLFxuXHRPIGV4dGVuZHMgRXZlbnRPYmplY3Q8VD4gPSBFdmVudE9iamVjdDxUPlxuPiBleHRlbmRzIERlc3Ryb3lhYmxlIHtcblx0Ly8gVGhlIGZvbGxvd2luZyBtZW1iZXIgaXMgcHVyZWx5IHNvIFR5cGVTY3JpcHQgcmVtZW1iZXJzIHRoZSB0eXBlIG9mIGBNYCB3aGVuIGV4dGVuZGluZyBzb1xuXHQvLyB0aGF0IHRoZSB1dGlsaXRpZXMgaW4gYG9uLnRzYCB3aWxsIHdvcmsgaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy8yMDM0OFxuXHQvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmVcblx0cHJvdGVjdGVkIF9fdHlwZU1hcF9fPzogTTtcblx0LyoqXG5cdCAqIG1hcCBvZiBsaXN0ZW5lcnMga2V5ZWQgYnkgZXZlbnQgdHlwZVxuXHQgKi9cblx0cHJvdGVjdGVkIGxpc3RlbmVyc01hcDogTWFwPFQgfCBrZXlvZiBNLCBFdmVudGVkQ2FsbGJhY2s8VCwgTz5bXT4gPSBuZXcgTWFwKCk7XG5cblx0LyoqXG5cdCAqIEVtaXRzIHRoZSBldmVudCBvYmplY3QgZm9yIHRoZSBzcGVjaWZpZWQgdHlwZVxuXHQgKlxuXHQgKiBAcGFyYW0gZXZlbnQgdGhlIGV2ZW50IHRvIGVtaXRcblx0ICovXG5cdGVtaXQ8SyBleHRlbmRzIGtleW9mIE0+KGV2ZW50OiBNW0tdKTogdm9pZDtcblx0ZW1pdChldmVudDogTyk6IHZvaWQ7XG5cdGVtaXQoZXZlbnQ6IGFueSk6IHZvaWQge1xuXHRcdHRoaXMubGlzdGVuZXJzTWFwLmZvckVhY2goKG1ldGhvZHMsIHR5cGUpID0+IHtcblx0XHRcdGlmIChpc0dsb2JNYXRjaCh0eXBlIGFzIGFueSwgZXZlbnQudHlwZSkpIHtcblx0XHRcdFx0Wy4uLm1ldGhvZHNdLmZvckVhY2goKG1ldGhvZCkgPT4ge1xuXHRcdFx0XHRcdG1ldGhvZC5jYWxsKHRoaXMsIGV2ZW50KTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogQ2F0Y2ggYWxsIGhhbmRsZXIgZm9yIHZhcmlvdXMgY2FsbCBzaWduYXR1cmVzLiBUaGUgc2lnbmF0dXJlcyBhcmUgZGVmaW5lZCBpblxuXHQgKiBgQmFzZUV2ZW50ZWRFdmVudHNgLiAgWW91IGNhbiBhZGQgeW91ciBvd24gZXZlbnQgdHlwZSAtPiBoYW5kbGVyIHR5cGVzIGJ5IGV4dGVuZGluZ1xuXHQgKiBgQmFzZUV2ZW50ZWRFdmVudHNgLiAgU2VlIGV4YW1wbGUgZm9yIGRldGFpbHMuXG5cdCAqXG5cdCAqIEBwYXJhbSBhcmdzXG5cdCAqXG5cdCAqIEBleGFtcGxlXG5cdCAqXG5cdCAqIGludGVyZmFjZSBXaWRnZXRCYXNlRXZlbnRzIGV4dGVuZHMgQmFzZUV2ZW50ZWRFdmVudHMge1xuXHQgKiAgICAgKHR5cGU6ICdwcm9wZXJ0aWVzOmNoYW5nZWQnLCBoYW5kbGVyOiBQcm9wZXJ0aWVzQ2hhbmdlZEhhbmRsZXIpOiBIYW5kbGU7XG5cdCAqIH1cblx0ICogY2xhc3MgV2lkZ2V0QmFzZSBleHRlbmRzIEV2ZW50ZWQge1xuXHQgKiAgICBvbjogV2lkZ2V0QmFzZUV2ZW50cztcblx0ICogfVxuXHQgKlxuXHQgKiBAcmV0dXJuIHthbnl9XG5cdCAqL1xuXHRvbjxLIGV4dGVuZHMga2V5b2YgTT4odHlwZTogSywgbGlzdGVuZXI6IEV2ZW50ZWRDYWxsYmFja09yQXJyYXk8SywgTVtLXT4pOiBIYW5kbGU7XG5cdG9uKHR5cGU6IFQsIGxpc3RlbmVyOiBFdmVudGVkQ2FsbGJhY2tPckFycmF5PFQsIE8+KTogSGFuZGxlO1xuXHRvbih0eXBlOiBhbnksIGxpc3RlbmVyOiBFdmVudGVkQ2FsbGJhY2tPckFycmF5PGFueSwgYW55Pik6IEhhbmRsZSB7XG5cdFx0aWYgKEFycmF5LmlzQXJyYXkobGlzdGVuZXIpKSB7XG5cdFx0XHRjb25zdCBoYW5kbGVzID0gbGlzdGVuZXIubWFwKChsaXN0ZW5lcikgPT4gdGhpcy5fYWRkTGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpKTtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGRlc3Ryb3koKSB7XG5cdFx0XHRcdFx0aGFuZGxlcy5mb3JFYWNoKChoYW5kbGUpID0+IGhhbmRsZS5kZXN0cm95KCkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5fYWRkTGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpO1xuXHR9XG5cblx0cHJpdmF0ZSBfYWRkTGlzdGVuZXIodHlwZTogVCB8IGtleW9mIE0sIGxpc3RlbmVyOiBFdmVudGVkQ2FsbGJhY2s8VCwgTz4pIHtcblx0XHRjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLmxpc3RlbmVyc01hcC5nZXQodHlwZSkgfHwgW107XG5cdFx0bGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpO1xuXHRcdHRoaXMubGlzdGVuZXJzTWFwLnNldCh0eXBlLCBsaXN0ZW5lcnMpO1xuXHRcdHJldHVybiB7XG5cdFx0XHRkZXN0cm95OiAoKSA9PiB7XG5cdFx0XHRcdGNvbnN0IGxpc3RlbmVycyA9IHRoaXMubGlzdGVuZXJzTWFwLmdldCh0eXBlKSB8fCBbXTtcblx0XHRcdFx0bGlzdGVuZXJzLnNwbGljZShsaXN0ZW5lcnMuaW5kZXhPZihsaXN0ZW5lciksIDEpO1xuXHRcdFx0fVxuXHRcdH07XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgRXZlbnRlZDtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyBFdmVudGVkLnRzIiwiLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdG8gZ2VuZXJhdGUgYSB2YWx1ZSBwcm9wZXJ0eSBkZXNjcmlwdG9yXG4gKlxuICogQHBhcmFtIHZhbHVlICAgICAgICBUaGUgdmFsdWUgdGhlIHByb3BlcnR5IGRlc2NyaXB0b3Igc2hvdWxkIGJlIHNldCB0b1xuICogQHBhcmFtIGVudW1lcmFibGUgICBJZiB0aGUgcHJvcGVydHkgc2hvdWxkIGJlIGVudW1iZXJhYmxlLCBkZWZhdWx0cyB0byBmYWxzZVxuICogQHBhcmFtIHdyaXRhYmxlICAgICBJZiB0aGUgcHJvcGVydHkgc2hvdWxkIGJlIHdyaXRhYmxlLCBkZWZhdWx0cyB0byB0cnVlXG4gKiBAcGFyYW0gY29uZmlndXJhYmxlIElmIHRoZSBwcm9wZXJ0eSBzaG91bGQgYmUgY29uZmlndXJhYmxlLCBkZWZhdWx0cyB0byB0cnVlXG4gKiBAcmV0dXJuICAgICAgICAgICAgIFRoZSBwcm9wZXJ0eSBkZXNjcmlwdG9yIG9iamVjdFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VmFsdWVEZXNjcmlwdG9yPFQ+KFxuXHR2YWx1ZTogVCxcblx0ZW51bWVyYWJsZTogYm9vbGVhbiA9IGZhbHNlLFxuXHR3cml0YWJsZTogYm9vbGVhbiA9IHRydWUsXG5cdGNvbmZpZ3VyYWJsZTogYm9vbGVhbiA9IHRydWVcbik6IFR5cGVkUHJvcGVydHlEZXNjcmlwdG9yPFQ+IHtcblx0cmV0dXJuIHtcblx0XHR2YWx1ZTogdmFsdWUsXG5cdFx0ZW51bWVyYWJsZTogZW51bWVyYWJsZSxcblx0XHR3cml0YWJsZTogd3JpdGFibGUsXG5cdFx0Y29uZmlndXJhYmxlOiBjb25maWd1cmFibGVcblx0fTtcbn1cblxuLyoqXG4gKiBBIGhlbHBlciBmdW5jdGlvbiB3aGljaCB3cmFwcyBhIGZ1bmN0aW9uIHdoZXJlIHRoZSBmaXJzdCBhcmd1bWVudCBiZWNvbWVzIHRoZSBzY29wZVxuICogb2YgdGhlIGNhbGxcbiAqXG4gKiBAcGFyYW0gbmF0aXZlRnVuY3Rpb24gVGhlIHNvdXJjZSBmdW5jdGlvbiB0byBiZSB3cmFwcGVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3cmFwTmF0aXZlPFQsIFUsIFI+KG5hdGl2ZUZ1bmN0aW9uOiAoYXJnMTogVSkgPT4gUik6ICh0YXJnZXQ6IFQsIGFyZzE6IFUpID0+IFI7XG5leHBvcnQgZnVuY3Rpb24gd3JhcE5hdGl2ZTxULCBVLCBWLCBSPihuYXRpdmVGdW5jdGlvbjogKGFyZzE6IFUsIGFyZzI6IFYpID0+IFIpOiAodGFyZ2V0OiBULCBhcmcxOiBVLCBhcmcyOiBWKSA9PiBSO1xuZXhwb3J0IGZ1bmN0aW9uIHdyYXBOYXRpdmU8VCwgVSwgViwgVywgUj4oXG5cdG5hdGl2ZUZ1bmN0aW9uOiAoYXJnMTogVSwgYXJnMjogViwgYXJnMzogVykgPT4gUlxuKTogKHRhcmdldDogVCwgYXJnMTogVSwgYXJnMjogViwgYXJnMzogVykgPT4gUjtcbmV4cG9ydCBmdW5jdGlvbiB3cmFwTmF0aXZlPFQsIFUsIFYsIFcsIFgsIFI+KFxuXHRuYXRpdmVGdW5jdGlvbjogKGFyZzE6IFUsIGFyZzI6IFYsIGFyZzM6IFcpID0+IFJcbik6ICh0YXJnZXQ6IFQsIGFyZzE6IFUsIGFyZzI6IFYsIGFyZzM6IFcpID0+IFI7XG5leHBvcnQgZnVuY3Rpb24gd3JhcE5hdGl2ZTxULCBVLCBWLCBXLCBYLCBZLCBSPihcblx0bmF0aXZlRnVuY3Rpb246IChhcmcxOiBVLCBhcmcyOiBWLCBhcmczOiBXLCBhcmc0OiBZKSA9PiBSXG4pOiAodGFyZ2V0OiBULCBhcmcxOiBVLCBhcmcyOiBWLCBhcmczOiBXLCBhcmc0OiBZKSA9PiBSO1xuZXhwb3J0IGZ1bmN0aW9uIHdyYXBOYXRpdmUobmF0aXZlRnVuY3Rpb246ICguLi5hcmdzOiBhbnlbXSkgPT4gYW55KTogKHRhcmdldDogYW55LCAuLi5hcmdzOiBhbnlbXSkgPT4gYW55IHtcblx0cmV0dXJuIGZ1bmN0aW9uKHRhcmdldDogYW55LCAuLi5hcmdzOiBhbnlbXSk6IGFueSB7XG5cdFx0cmV0dXJuIG5hdGl2ZUZ1bmN0aW9uLmFwcGx5KHRhcmdldCwgYXJncyk7XG5cdH07XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gdXRpbC50cyIsImltcG9ydCBoYXMsIHsgYWRkIH0gZnJvbSAnLi4vLi4vaGFzL2hhcyc7XG5pbXBvcnQgZ2xvYmFsIGZyb20gJy4uL2dsb2JhbCc7XG5cbmV4cG9ydCBkZWZhdWx0IGhhcztcbmV4cG9ydCAqIGZyb20gJy4uLy4uL2hhcy9oYXMnO1xuXG4vKiBFQ01BU2NyaXB0IDYgYW5kIDcgRmVhdHVyZXMgKi9cblxuLyogQXJyYXkgKi9cbmFkZChcblx0J2VzNi1hcnJheScsXG5cdCgpID0+IHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0Wydmcm9tJywgJ29mJ10uZXZlcnkoKGtleSkgPT4ga2V5IGluIGdsb2JhbC5BcnJheSkgJiZcblx0XHRcdFsnZmluZEluZGV4JywgJ2ZpbmQnLCAnY29weVdpdGhpbiddLmV2ZXJ5KChrZXkpID0+IGtleSBpbiBnbG9iYWwuQXJyYXkucHJvdG90eXBlKVxuXHRcdCk7XG5cdH0sXG5cdHRydWVcbik7XG5cbmFkZChcblx0J2VzNi1hcnJheS1maWxsJyxcblx0KCkgPT4ge1xuXHRcdGlmICgnZmlsbCcgaW4gZ2xvYmFsLkFycmF5LnByb3RvdHlwZSkge1xuXHRcdFx0LyogU29tZSB2ZXJzaW9ucyBvZiBTYWZhcmkgZG8gbm90IHByb3Blcmx5IGltcGxlbWVudCB0aGlzICovXG5cdFx0XHRyZXR1cm4gKFsxXSBhcyBhbnkpLmZpbGwoOSwgTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZKVswXSA9PT0gMTtcblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9LFxuXHR0cnVlXG4pO1xuXG5hZGQoJ2VzNy1hcnJheScsICgpID0+ICdpbmNsdWRlcycgaW4gZ2xvYmFsLkFycmF5LnByb3RvdHlwZSwgdHJ1ZSk7XG5cbi8qIE1hcCAqL1xuYWRkKFxuXHQnZXM2LW1hcCcsXG5cdCgpID0+IHtcblx0XHRpZiAodHlwZW9mIGdsb2JhbC5NYXAgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdC8qXG5cdFx0SUUxMSBhbmQgb2xkZXIgdmVyc2lvbnMgb2YgU2FmYXJpIGFyZSBtaXNzaW5nIGNyaXRpY2FsIEVTNiBNYXAgZnVuY3Rpb25hbGl0eVxuXHRcdFdlIHdyYXAgdGhpcyBpbiBhIHRyeS9jYXRjaCBiZWNhdXNlIHNvbWV0aW1lcyB0aGUgTWFwIGNvbnN0cnVjdG9yIGV4aXN0cywgYnV0IGRvZXMgbm90XG5cdFx0dGFrZSBhcmd1bWVudHMgKGlPUyA4LjQpXG5cdFx0ICovXG5cdFx0XHR0cnkge1xuXHRcdFx0XHRjb25zdCBtYXAgPSBuZXcgZ2xvYmFsLk1hcChbWzAsIDFdXSk7XG5cblx0XHRcdFx0cmV0dXJuIChcblx0XHRcdFx0XHRtYXAuaGFzKDApICYmXG5cdFx0XHRcdFx0dHlwZW9mIG1hcC5rZXlzID09PSAnZnVuY3Rpb24nICYmXG5cdFx0XHRcdFx0aGFzKCdlczYtc3ltYm9sJykgJiZcblx0XHRcdFx0XHR0eXBlb2YgbWFwLnZhbHVlcyA9PT0gJ2Z1bmN0aW9uJyAmJlxuXHRcdFx0XHRcdHR5cGVvZiBtYXAuZW50cmllcyA9PT0gJ2Z1bmN0aW9uJ1xuXHRcdFx0XHQpO1xuXHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dDogbm90IHRlc3Rpbmcgb24gaU9TIGF0IHRoZSBtb21lbnQgKi9cblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0sXG5cdHRydWVcbik7XG5cbi8qIE1hdGggKi9cbmFkZChcblx0J2VzNi1tYXRoJyxcblx0KCkgPT4ge1xuXHRcdHJldHVybiBbXG5cdFx0XHQnY2x6MzInLFxuXHRcdFx0J3NpZ24nLFxuXHRcdFx0J2xvZzEwJyxcblx0XHRcdCdsb2cyJyxcblx0XHRcdCdsb2cxcCcsXG5cdFx0XHQnZXhwbTEnLFxuXHRcdFx0J2Nvc2gnLFxuXHRcdFx0J3NpbmgnLFxuXHRcdFx0J3RhbmgnLFxuXHRcdFx0J2Fjb3NoJyxcblx0XHRcdCdhc2luaCcsXG5cdFx0XHQnYXRhbmgnLFxuXHRcdFx0J3RydW5jJyxcblx0XHRcdCdmcm91bmQnLFxuXHRcdFx0J2NicnQnLFxuXHRcdFx0J2h5cG90J1xuXHRcdF0uZXZlcnkoKG5hbWUpID0+IHR5cGVvZiBnbG9iYWwuTWF0aFtuYW1lXSA9PT0gJ2Z1bmN0aW9uJyk7XG5cdH0sXG5cdHRydWVcbik7XG5cbmFkZChcblx0J2VzNi1tYXRoLWltdWwnLFxuXHQoKSA9PiB7XG5cdFx0aWYgKCdpbXVsJyBpbiBnbG9iYWwuTWF0aCkge1xuXHRcdFx0LyogU29tZSB2ZXJzaW9ucyBvZiBTYWZhcmkgb24gaW9zIGRvIG5vdCBwcm9wZXJseSBpbXBsZW1lbnQgdGhpcyAqL1xuXHRcdFx0cmV0dXJuIChNYXRoIGFzIGFueSkuaW11bCgweGZmZmZmZmZmLCA1KSA9PT0gLTU7XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fSxcblx0dHJ1ZVxuKTtcblxuLyogT2JqZWN0ICovXG5hZGQoXG5cdCdlczYtb2JqZWN0Jyxcblx0KCkgPT4ge1xuXHRcdHJldHVybiAoXG5cdFx0XHRoYXMoJ2VzNi1zeW1ib2wnKSAmJlxuXHRcdFx0Wydhc3NpZ24nLCAnaXMnLCAnZ2V0T3duUHJvcGVydHlTeW1ib2xzJywgJ3NldFByb3RvdHlwZU9mJ10uZXZlcnkoXG5cdFx0XHRcdChuYW1lKSA9PiB0eXBlb2YgZ2xvYmFsLk9iamVjdFtuYW1lXSA9PT0gJ2Z1bmN0aW9uJ1xuXHRcdFx0KVxuXHRcdCk7XG5cdH0sXG5cdHRydWVcbik7XG5cbmFkZChcblx0J2VzMjAxNy1vYmplY3QnLFxuXHQoKSA9PiB7XG5cdFx0cmV0dXJuIFsndmFsdWVzJywgJ2VudHJpZXMnLCAnZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyddLmV2ZXJ5KFxuXHRcdFx0KG5hbWUpID0+IHR5cGVvZiBnbG9iYWwuT2JqZWN0W25hbWVdID09PSAnZnVuY3Rpb24nXG5cdFx0KTtcblx0fSxcblx0dHJ1ZVxuKTtcblxuLyogT2JzZXJ2YWJsZSAqL1xuYWRkKCdlcy1vYnNlcnZhYmxlJywgKCkgPT4gdHlwZW9mIGdsb2JhbC5PYnNlcnZhYmxlICE9PSAndW5kZWZpbmVkJywgdHJ1ZSk7XG5cbi8qIFByb21pc2UgKi9cbmFkZCgnZXM2LXByb21pc2UnLCAoKSA9PiB0eXBlb2YgZ2xvYmFsLlByb21pc2UgIT09ICd1bmRlZmluZWQnICYmIGhhcygnZXM2LXN5bWJvbCcpLCB0cnVlKTtcblxuLyogU2V0ICovXG5hZGQoXG5cdCdlczYtc2V0Jyxcblx0KCkgPT4ge1xuXHRcdGlmICh0eXBlb2YgZ2xvYmFsLlNldCA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0LyogSUUxMSBhbmQgb2xkZXIgdmVyc2lvbnMgb2YgU2FmYXJpIGFyZSBtaXNzaW5nIGNyaXRpY2FsIEVTNiBTZXQgZnVuY3Rpb25hbGl0eSAqL1xuXHRcdFx0Y29uc3Qgc2V0ID0gbmV3IGdsb2JhbC5TZXQoWzFdKTtcblx0XHRcdHJldHVybiBzZXQuaGFzKDEpICYmICdrZXlzJyBpbiBzZXQgJiYgdHlwZW9mIHNldC5rZXlzID09PSAnZnVuY3Rpb24nICYmIGhhcygnZXM2LXN5bWJvbCcpO1xuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0sXG5cdHRydWVcbik7XG5cbi8qIFN0cmluZyAqL1xuYWRkKFxuXHQnZXM2LXN0cmluZycsXG5cdCgpID0+IHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0W1xuXHRcdFx0XHQvKiBzdGF0aWMgbWV0aG9kcyAqL1xuXHRcdFx0XHQnZnJvbUNvZGVQb2ludCdcblx0XHRcdF0uZXZlcnkoKGtleSkgPT4gdHlwZW9mIGdsb2JhbC5TdHJpbmdba2V5XSA9PT0gJ2Z1bmN0aW9uJykgJiZcblx0XHRcdFtcblx0XHRcdFx0LyogaW5zdGFuY2UgbWV0aG9kcyAqL1xuXHRcdFx0XHQnY29kZVBvaW50QXQnLFxuXHRcdFx0XHQnbm9ybWFsaXplJyxcblx0XHRcdFx0J3JlcGVhdCcsXG5cdFx0XHRcdCdzdGFydHNXaXRoJyxcblx0XHRcdFx0J2VuZHNXaXRoJyxcblx0XHRcdFx0J2luY2x1ZGVzJ1xuXHRcdFx0XS5ldmVyeSgoa2V5KSA9PiB0eXBlb2YgZ2xvYmFsLlN0cmluZy5wcm90b3R5cGVba2V5XSA9PT0gJ2Z1bmN0aW9uJylcblx0XHQpO1xuXHR9LFxuXHR0cnVlXG4pO1xuXG5hZGQoXG5cdCdlczYtc3RyaW5nLXJhdycsXG5cdCgpID0+IHtcblx0XHRmdW5jdGlvbiBnZXRDYWxsU2l0ZShjYWxsU2l0ZTogVGVtcGxhdGVTdHJpbmdzQXJyYXksIC4uLnN1YnN0aXR1dGlvbnM6IGFueVtdKSB7XG5cdFx0XHRjb25zdCByZXN1bHQgPSBbLi4uY2FsbFNpdGVdO1xuXHRcdFx0KHJlc3VsdCBhcyBhbnkpLnJhdyA9IGNhbGxTaXRlLnJhdztcblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fVxuXG5cdFx0aWYgKCdyYXcnIGluIGdsb2JhbC5TdHJpbmcpIHtcblx0XHRcdGxldCBiID0gMTtcblx0XHRcdGxldCBjYWxsU2l0ZSA9IGdldENhbGxTaXRlYGFcXG4ke2J9YDtcblxuXHRcdFx0KGNhbGxTaXRlIGFzIGFueSkucmF3ID0gWydhXFxcXG4nXTtcblx0XHRcdGNvbnN0IHN1cHBvcnRzVHJ1bmMgPSBnbG9iYWwuU3RyaW5nLnJhdyhjYWxsU2l0ZSwgNDIpID09PSAnYVxcXFxuJztcblxuXHRcdFx0cmV0dXJuIHN1cHBvcnRzVHJ1bmM7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9LFxuXHR0cnVlXG4pO1xuXG5hZGQoXG5cdCdlczIwMTctc3RyaW5nJyxcblx0KCkgPT4ge1xuXHRcdHJldHVybiBbJ3BhZFN0YXJ0JywgJ3BhZEVuZCddLmV2ZXJ5KChrZXkpID0+IHR5cGVvZiBnbG9iYWwuU3RyaW5nLnByb3RvdHlwZVtrZXldID09PSAnZnVuY3Rpb24nKTtcblx0fSxcblx0dHJ1ZVxuKTtcblxuLyogU3ltYm9sICovXG5hZGQoJ2VzNi1zeW1ib2wnLCAoKSA9PiB0eXBlb2YgZ2xvYmFsLlN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIFN5bWJvbCgpID09PSAnc3ltYm9sJywgdHJ1ZSk7XG5cbi8qIFdlYWtNYXAgKi9cbmFkZChcblx0J2VzNi13ZWFrbWFwJyxcblx0KCkgPT4ge1xuXHRcdGlmICh0eXBlb2YgZ2xvYmFsLldlYWtNYXAgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHQvKiBJRTExIGFuZCBvbGRlciB2ZXJzaW9ucyBvZiBTYWZhcmkgYXJlIG1pc3NpbmcgY3JpdGljYWwgRVM2IE1hcCBmdW5jdGlvbmFsaXR5ICovXG5cdFx0XHRjb25zdCBrZXkxID0ge307XG5cdFx0XHRjb25zdCBrZXkyID0ge307XG5cdFx0XHRjb25zdCBtYXAgPSBuZXcgZ2xvYmFsLldlYWtNYXAoW1trZXkxLCAxXV0pO1xuXHRcdFx0T2JqZWN0LmZyZWV6ZShrZXkxKTtcblx0XHRcdHJldHVybiBtYXAuZ2V0KGtleTEpID09PSAxICYmIG1hcC5zZXQoa2V5MiwgMikgPT09IG1hcCAmJiBoYXMoJ2VzNi1zeW1ib2wnKTtcblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9LFxuXHR0cnVlXG4pO1xuXG4vKiBNaXNjZWxsYW5lb3VzIGZlYXR1cmVzICovXG5hZGQoJ21pY3JvdGFza3MnLCAoKSA9PiBoYXMoJ2VzNi1wcm9taXNlJykgfHwgaGFzKCdob3N0LW5vZGUnKSB8fCBoYXMoJ2RvbS1tdXRhdGlvbm9ic2VydmVyJyksIHRydWUpO1xuYWRkKFxuXHQncG9zdG1lc3NhZ2UnLFxuXHQoKSA9PiB7XG5cdFx0Ly8gSWYgd2luZG93IGlzIHVuZGVmaW5lZCwgYW5kIHdlIGhhdmUgcG9zdE1lc3NhZ2UsIGl0IHByb2JhYmx5IG1lYW5zIHdlJ3JlIGluIGEgd2ViIHdvcmtlci4gV2ViIHdvcmtlcnMgaGF2ZVxuXHRcdC8vIHBvc3QgbWVzc2FnZSBidXQgaXQgZG9lc24ndCB3b3JrIGhvdyB3ZSBleHBlY3QgaXQgdG8sIHNvIGl0J3MgYmVzdCBqdXN0IHRvIHByZXRlbmQgaXQgZG9lc24ndCBleGlzdC5cblx0XHRyZXR1cm4gdHlwZW9mIGdsb2JhbC53aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBnbG9iYWwucG9zdE1lc3NhZ2UgPT09ICdmdW5jdGlvbic7XG5cdH0sXG5cdHRydWVcbik7XG5hZGQoJ3JhZicsICgpID0+IHR5cGVvZiBnbG9iYWwucmVxdWVzdEFuaW1hdGlvbkZyYW1lID09PSAnZnVuY3Rpb24nLCB0cnVlKTtcbmFkZCgnc2V0aW1tZWRpYXRlJywgKCkgPT4gdHlwZW9mIGdsb2JhbC5zZXRJbW1lZGlhdGUgIT09ICd1bmRlZmluZWQnLCB0cnVlKTtcblxuLyogRE9NIEZlYXR1cmVzICovXG5cbmFkZChcblx0J2RvbS1tdXRhdGlvbm9ic2VydmVyJyxcblx0KCkgPT4ge1xuXHRcdGlmIChoYXMoJ2hvc3QtYnJvd3NlcicpICYmIEJvb2xlYW4oZ2xvYmFsLk11dGF0aW9uT2JzZXJ2ZXIgfHwgZ2xvYmFsLldlYktpdE11dGF0aW9uT2JzZXJ2ZXIpKSB7XG5cdFx0XHQvLyBJRTExIGhhcyBhbiB1bnJlbGlhYmxlIE11dGF0aW9uT2JzZXJ2ZXIgaW1wbGVtZW50YXRpb24gd2hlcmUgc2V0UHJvcGVydHkoKSBkb2VzIG5vdFxuXHRcdFx0Ly8gZ2VuZXJhdGUgYSBtdXRhdGlvbiBldmVudCwgb2JzZXJ2ZXJzIGNhbiBjcmFzaCwgYW5kIHRoZSBxdWV1ZSBkb2VzIG5vdCBkcmFpblxuXHRcdFx0Ly8gcmVsaWFibHkuIFRoZSBmb2xsb3dpbmcgZmVhdHVyZSB0ZXN0IHdhcyBhZGFwdGVkIGZyb21cblx0XHRcdC8vIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL3QxMGtvLzRhY2ViOGM3MTY4MWZkYjI3NWUzM2VmZTVlNTc2YjE0XG5cdFx0XHRjb25zdCBleGFtcGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0XHQvKiB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6dmFyaWFibGUtbmFtZSAqL1xuXHRcdFx0Y29uc3QgSG9zdE11dGF0aW9uT2JzZXJ2ZXIgPSBnbG9iYWwuTXV0YXRpb25PYnNlcnZlciB8fCBnbG9iYWwuV2ViS2l0TXV0YXRpb25PYnNlcnZlcjtcblx0XHRcdGNvbnN0IG9ic2VydmVyID0gbmV3IEhvc3RNdXRhdGlvbk9ic2VydmVyKGZ1bmN0aW9uKCkge30pO1xuXHRcdFx0b2JzZXJ2ZXIub2JzZXJ2ZShleGFtcGxlLCB7IGF0dHJpYnV0ZXM6IHRydWUgfSk7XG5cblx0XHRcdGV4YW1wbGUuc3R5bGUuc2V0UHJvcGVydHkoJ2Rpc3BsYXknLCAnYmxvY2snKTtcblxuXHRcdFx0cmV0dXJuIEJvb2xlYW4ob2JzZXJ2ZXIudGFrZVJlY29yZHMoKS5sZW5ndGgpO1xuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0sXG5cdHRydWVcbik7XG5cbmFkZChcblx0J2RvbS13ZWJhbmltYXRpb24nLFxuXHQoKSA9PiBoYXMoJ2hvc3QtYnJvd3NlcicpICYmIGdsb2JhbC5BbmltYXRpb24gIT09IHVuZGVmaW5lZCAmJiBnbG9iYWwuS2V5ZnJhbWVFZmZlY3QgIT09IHVuZGVmaW5lZCxcblx0dHJ1ZVxuKTtcblxuYWRkKCdhYm9ydC1jb250cm9sbGVyJywgKCkgPT4gdHlwZW9mIGdsb2JhbC5BYm9ydENvbnRyb2xsZXIgIT09ICd1bmRlZmluZWQnKTtcblxuYWRkKCdhYm9ydC1zaWduYWwnLCAoKSA9PiB0eXBlb2YgZ2xvYmFsLkFib3J0U2lnbmFsICE9PSAndW5kZWZpbmVkJyk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gaGFzLnRzIiwiaW1wb3J0IHsgaXNBcnJheUxpa2UsIEl0ZXJhYmxlLCBJdGVyYWJsZUl0ZXJhdG9yLCBTaGltSXRlcmF0b3IgfSBmcm9tICcuL2l0ZXJhdG9yJztcbmltcG9ydCBnbG9iYWwgZnJvbSAnLi9nbG9iYWwnO1xuaW1wb3J0IHsgaXMgYXMgb2JqZWN0SXMgfSBmcm9tICcuL29iamVjdCc7XG5pbXBvcnQgaGFzIGZyb20gJy4vc3VwcG9ydC9oYXMnO1xuaW1wb3J0ICcuL1N5bWJvbCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgTWFwPEssIFY+IHtcblx0LyoqXG5cdCAqIERlbGV0ZXMgYWxsIGtleXMgYW5kIHRoZWlyIGFzc29jaWF0ZWQgdmFsdWVzLlxuXHQgKi9cblx0Y2xlYXIoKTogdm9pZDtcblxuXHQvKipcblx0ICogRGVsZXRlcyBhIGdpdmVuIGtleSBhbmQgaXRzIGFzc29jaWF0ZWQgdmFsdWUuXG5cdCAqXG5cdCAqIEBwYXJhbSBrZXkgVGhlIGtleSB0byBkZWxldGVcblx0ICogQHJldHVybiB0cnVlIGlmIHRoZSBrZXkgZXhpc3RzLCBmYWxzZSBpZiBpdCBkb2VzIG5vdFxuXHQgKi9cblx0ZGVsZXRlKGtleTogSyk6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFJldHVybnMgYW4gaXRlcmF0b3IgdGhhdCB5aWVsZHMgZWFjaCBrZXkvdmFsdWUgcGFpciBhcyBhbiBhcnJheS5cblx0ICpcblx0ICogQHJldHVybiBBbiBpdGVyYXRvciBmb3IgZWFjaCBrZXkvdmFsdWUgcGFpciBpbiB0aGUgaW5zdGFuY2UuXG5cdCAqL1xuXHRlbnRyaWVzKCk6IEl0ZXJhYmxlSXRlcmF0b3I8W0ssIFZdPjtcblxuXHQvKipcblx0ICogRXhlY3V0ZXMgYSBnaXZlbiBmdW5jdGlvbiBmb3IgZWFjaCBtYXAgZW50cnkuIFRoZSBmdW5jdGlvblxuXHQgKiBpcyBpbnZva2VkIHdpdGggdGhyZWUgYXJndW1lbnRzOiB0aGUgZWxlbWVudCB2YWx1ZSwgdGhlXG5cdCAqIGVsZW1lbnQga2V5LCBhbmQgdGhlIGFzc29jaWF0ZWQgTWFwIGluc3RhbmNlLlxuXHQgKlxuXHQgKiBAcGFyYW0gY2FsbGJhY2tmbiBUaGUgZnVuY3Rpb24gdG8gZXhlY3V0ZSBmb3IgZWFjaCBtYXAgZW50cnksXG5cdCAqIEBwYXJhbSB0aGlzQXJnIFRoZSB2YWx1ZSB0byB1c2UgZm9yIGB0aGlzYCBmb3IgZWFjaCBleGVjdXRpb24gb2YgdGhlIGNhbGJhY2tcblx0ICovXG5cdGZvckVhY2goY2FsbGJhY2tmbjogKHZhbHVlOiBWLCBrZXk6IEssIG1hcDogTWFwPEssIFY+KSA9PiB2b2lkLCB0aGlzQXJnPzogYW55KTogdm9pZDtcblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgdmFsdWUgYXNzb2NpYXRlZCB3aXRoIGEgZ2l2ZW4ga2V5LlxuXHQgKlxuXHQgKiBAcGFyYW0ga2V5IFRoZSBrZXkgdG8gbG9vayB1cFxuXHQgKiBAcmV0dXJuIFRoZSB2YWx1ZSBpZiBvbmUgZXhpc3RzIG9yIHVuZGVmaW5lZFxuXHQgKi9cblx0Z2V0KGtleTogSyk6IFYgfCB1bmRlZmluZWQ7XG5cblx0LyoqXG5cdCAqIFJldHVybnMgYW4gaXRlcmF0b3IgdGhhdCB5aWVsZHMgZWFjaCBrZXkgaW4gdGhlIG1hcC5cblx0ICpcblx0ICogQHJldHVybiBBbiBpdGVyYXRvciBjb250YWluaW5nIHRoZSBpbnN0YW5jZSdzIGtleXMuXG5cdCAqL1xuXHRrZXlzKCk6IEl0ZXJhYmxlSXRlcmF0b3I8Sz47XG5cblx0LyoqXG5cdCAqIENoZWNrcyBmb3IgdGhlIHByZXNlbmNlIG9mIGEgZ2l2ZW4ga2V5LlxuXHQgKlxuXHQgKiBAcGFyYW0ga2V5IFRoZSBrZXkgdG8gY2hlY2sgZm9yXG5cdCAqIEByZXR1cm4gdHJ1ZSBpZiB0aGUga2V5IGV4aXN0cywgZmFsc2UgaWYgaXQgZG9lcyBub3Rcblx0ICovXG5cdGhhcyhrZXk6IEspOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBTZXRzIHRoZSB2YWx1ZSBhc3NvY2lhdGVkIHdpdGggYSBnaXZlbiBrZXkuXG5cdCAqXG5cdCAqIEBwYXJhbSBrZXkgVGhlIGtleSB0byBkZWZpbmUgYSB2YWx1ZSB0b1xuXHQgKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIHRvIGFzc2lnblxuXHQgKiBAcmV0dXJuIFRoZSBNYXAgaW5zdGFuY2Vcblx0ICovXG5cdHNldChrZXk6IEssIHZhbHVlOiBWKTogdGhpcztcblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIGtleSAvIHZhbHVlIHBhaXJzIGluIHRoZSBNYXAuXG5cdCAqL1xuXHRyZWFkb25seSBzaXplOiBudW1iZXI7XG5cblx0LyoqXG5cdCAqIFJldHVybnMgYW4gaXRlcmF0b3IgdGhhdCB5aWVsZHMgZWFjaCB2YWx1ZSBpbiB0aGUgbWFwLlxuXHQgKlxuXHQgKiBAcmV0dXJuIEFuIGl0ZXJhdG9yIGNvbnRhaW5pbmcgdGhlIGluc3RhbmNlJ3MgdmFsdWVzLlxuXHQgKi9cblx0dmFsdWVzKCk6IEl0ZXJhYmxlSXRlcmF0b3I8Vj47XG5cblx0LyoqIFJldHVybnMgYW4gaXRlcmFibGUgb2YgZW50cmllcyBpbiB0aGUgbWFwLiAqL1xuXHRbU3ltYm9sLml0ZXJhdG9yXSgpOiBJdGVyYWJsZUl0ZXJhdG9yPFtLLCBWXT47XG5cblx0cmVhZG9ubHkgW1N5bWJvbC50b1N0cmluZ1RhZ106IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBNYXBDb25zdHJ1Y3RvciB7XG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgbmV3IE1hcFxuXHQgKlxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICovXG5cdG5ldyAoKTogTWFwPGFueSwgYW55PjtcblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIG5ldyBNYXBcblx0ICpcblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqXG5cdCAqIEBwYXJhbSBpdGVyYXRvclxuXHQgKiBBcnJheSBvciBpdGVyYXRvciBjb250YWluaW5nIHR3by1pdGVtIHR1cGxlcyB1c2VkIHRvIGluaXRpYWxseSBwb3B1bGF0ZSB0aGUgbWFwLlxuXHQgKiBUaGUgZmlyc3QgaXRlbSBpbiBlYWNoIHR1cGxlIGNvcnJlc3BvbmRzIHRvIHRoZSBrZXkgb2YgdGhlIG1hcCBlbnRyeS5cblx0ICogVGhlIHNlY29uZCBpdGVtIGNvcnJlc3BvbmRzIHRvIHRoZSB2YWx1ZSBvZiB0aGUgbWFwIGVudHJ5LlxuXHQgKi9cblx0bmV3IDxLLCBWPihpdGVyYXRvcj86IFtLLCBWXVtdKTogTWFwPEssIFY+O1xuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgbmV3IE1hcFxuXHQgKlxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICpcblx0ICogQHBhcmFtIGl0ZXJhdG9yXG5cdCAqIEFycmF5IG9yIGl0ZXJhdG9yIGNvbnRhaW5pbmcgdHdvLWl0ZW0gdHVwbGVzIHVzZWQgdG8gaW5pdGlhbGx5IHBvcHVsYXRlIHRoZSBtYXAuXG5cdCAqIFRoZSBmaXJzdCBpdGVtIGluIGVhY2ggdHVwbGUgY29ycmVzcG9uZHMgdG8gdGhlIGtleSBvZiB0aGUgbWFwIGVudHJ5LlxuXHQgKiBUaGUgc2Vjb25kIGl0ZW0gY29ycmVzcG9uZHMgdG8gdGhlIHZhbHVlIG9mIHRoZSBtYXAgZW50cnkuXG5cdCAqL1xuXHRuZXcgPEssIFY+KGl0ZXJhdG9yOiBJdGVyYWJsZTxbSywgVl0+KTogTWFwPEssIFY+O1xuXG5cdHJlYWRvbmx5IHByb3RvdHlwZTogTWFwPGFueSwgYW55PjtcblxuXHRyZWFkb25seSBbU3ltYm9sLnNwZWNpZXNdOiBNYXBDb25zdHJ1Y3Rvcjtcbn1cblxuZXhwb3J0IGxldCBNYXA6IE1hcENvbnN0cnVjdG9yID0gZ2xvYmFsLk1hcDtcblxuaWYgKCFoYXMoJ2VzNi1tYXAnKSkge1xuXHRNYXAgPSBjbGFzcyBNYXA8SywgVj4ge1xuXHRcdHByb3RlY3RlZCByZWFkb25seSBfa2V5czogS1tdID0gW107XG5cdFx0cHJvdGVjdGVkIHJlYWRvbmx5IF92YWx1ZXM6IFZbXSA9IFtdO1xuXG5cdFx0LyoqXG5cdFx0ICogQW4gYWx0ZXJuYXRpdmUgdG8gQXJyYXkucHJvdG90eXBlLmluZGV4T2YgdXNpbmcgT2JqZWN0LmlzXG5cdFx0ICogdG8gY2hlY2sgZm9yIGVxdWFsaXR5LiBTZWUgaHR0cDovL216bC5sYS8xenVLTzJWXG5cdFx0ICovXG5cdFx0cHJvdGVjdGVkIF9pbmRleE9mS2V5KGtleXM6IEtbXSwga2V5OiBLKTogbnVtYmVyIHtcblx0XHRcdGZvciAobGV0IGkgPSAwLCBsZW5ndGggPSBrZXlzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmIChvYmplY3RJcyhrZXlzW2ldLCBrZXkpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiAtMTtcblx0XHR9XG5cblx0XHRzdGF0aWMgW1N5bWJvbC5zcGVjaWVzXSA9IE1hcDtcblxuXHRcdGNvbnN0cnVjdG9yKGl0ZXJhYmxlPzogQXJyYXlMaWtlPFtLLCBWXT4gfCBJdGVyYWJsZTxbSywgVl0+KSB7XG5cdFx0XHRpZiAoaXRlcmFibGUpIHtcblx0XHRcdFx0aWYgKGlzQXJyYXlMaWtlKGl0ZXJhYmxlKSkge1xuXHRcdFx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgaXRlcmFibGUubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdGNvbnN0IHZhbHVlID0gaXRlcmFibGVbaV07XG5cdFx0XHRcdFx0XHR0aGlzLnNldCh2YWx1ZVswXSwgdmFsdWVbMV0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRmb3IgKGNvbnN0IHZhbHVlIG9mIGl0ZXJhYmxlKSB7XG5cdFx0XHRcdFx0XHR0aGlzLnNldCh2YWx1ZVswXSwgdmFsdWVbMV0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGdldCBzaXplKCk6IG51bWJlciB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fa2V5cy5sZW5ndGg7XG5cdFx0fVxuXG5cdFx0Y2xlYXIoKTogdm9pZCB7XG5cdFx0XHR0aGlzLl9rZXlzLmxlbmd0aCA9IHRoaXMuX3ZhbHVlcy5sZW5ndGggPSAwO1xuXHRcdH1cblxuXHRcdGRlbGV0ZShrZXk6IEspOiBib29sZWFuIHtcblx0XHRcdGNvbnN0IGluZGV4ID0gdGhpcy5faW5kZXhPZktleSh0aGlzLl9rZXlzLCBrZXkpO1xuXHRcdFx0aWYgKGluZGV4IDwgMCkge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLl9rZXlzLnNwbGljZShpbmRleCwgMSk7XG5cdFx0XHR0aGlzLl92YWx1ZXMuc3BsaWNlKGluZGV4LCAxKTtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdGVudHJpZXMoKTogSXRlcmFibGVJdGVyYXRvcjxbSywgVl0+IHtcblx0XHRcdGNvbnN0IHZhbHVlcyA9IHRoaXMuX2tleXMubWFwKFxuXHRcdFx0XHQoa2V5OiBLLCBpOiBudW1iZXIpOiBbSywgVl0gPT4ge1xuXHRcdFx0XHRcdHJldHVybiBba2V5LCB0aGlzLl92YWx1ZXNbaV1dO1xuXHRcdFx0XHR9XG5cdFx0XHQpO1xuXG5cdFx0XHRyZXR1cm4gbmV3IFNoaW1JdGVyYXRvcih2YWx1ZXMpO1xuXHRcdH1cblxuXHRcdGZvckVhY2goY2FsbGJhY2s6ICh2YWx1ZTogViwga2V5OiBLLCBtYXBJbnN0YW5jZTogTWFwPEssIFY+KSA9PiBhbnksIGNvbnRleHQ/OiB7fSkge1xuXHRcdFx0Y29uc3Qga2V5cyA9IHRoaXMuX2tleXM7XG5cdFx0XHRjb25zdCB2YWx1ZXMgPSB0aGlzLl92YWx1ZXM7XG5cdFx0XHRmb3IgKGxldCBpID0gMCwgbGVuZ3RoID0ga2V5cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuXHRcdFx0XHRjYWxsYmFjay5jYWxsKGNvbnRleHQsIHZhbHVlc1tpXSwga2V5c1tpXSwgdGhpcyk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Z2V0KGtleTogSyk6IFYgfCB1bmRlZmluZWQge1xuXHRcdFx0Y29uc3QgaW5kZXggPSB0aGlzLl9pbmRleE9mS2V5KHRoaXMuX2tleXMsIGtleSk7XG5cdFx0XHRyZXR1cm4gaW5kZXggPCAwID8gdW5kZWZpbmVkIDogdGhpcy5fdmFsdWVzW2luZGV4XTtcblx0XHR9XG5cblx0XHRoYXMoa2V5OiBLKTogYm9vbGVhbiB7XG5cdFx0XHRyZXR1cm4gdGhpcy5faW5kZXhPZktleSh0aGlzLl9rZXlzLCBrZXkpID4gLTE7XG5cdFx0fVxuXG5cdFx0a2V5cygpOiBJdGVyYWJsZUl0ZXJhdG9yPEs+IHtcblx0XHRcdHJldHVybiBuZXcgU2hpbUl0ZXJhdG9yKHRoaXMuX2tleXMpO1xuXHRcdH1cblxuXHRcdHNldChrZXk6IEssIHZhbHVlOiBWKTogTWFwPEssIFY+IHtcblx0XHRcdGxldCBpbmRleCA9IHRoaXMuX2luZGV4T2ZLZXkodGhpcy5fa2V5cywga2V5KTtcblx0XHRcdGluZGV4ID0gaW5kZXggPCAwID8gdGhpcy5fa2V5cy5sZW5ndGggOiBpbmRleDtcblx0XHRcdHRoaXMuX2tleXNbaW5kZXhdID0ga2V5O1xuXHRcdFx0dGhpcy5fdmFsdWVzW2luZGV4XSA9IHZhbHVlO1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0dmFsdWVzKCk6IEl0ZXJhYmxlSXRlcmF0b3I8Vj4ge1xuXHRcdFx0cmV0dXJuIG5ldyBTaGltSXRlcmF0b3IodGhpcy5fdmFsdWVzKTtcblx0XHR9XG5cblx0XHRbU3ltYm9sLml0ZXJhdG9yXSgpOiBJdGVyYWJsZUl0ZXJhdG9yPFtLLCBWXT4ge1xuXHRcdFx0cmV0dXJuIHRoaXMuZW50cmllcygpO1xuXHRcdH1cblxuXHRcdFtTeW1ib2wudG9TdHJpbmdUYWddOiAnTWFwJyA9ICdNYXAnO1xuXHR9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBNYXA7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gTWFwLnRzIiwiaW1wb3J0IHsgVGhlbmFibGUgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0IGdsb2JhbCBmcm9tICcuL2dsb2JhbCc7XG5pbXBvcnQgeyBxdWV1ZU1pY3JvVGFzayB9IGZyb20gJy4vc3VwcG9ydC9xdWV1ZSc7XG5pbXBvcnQgeyBJdGVyYWJsZSB9IGZyb20gJy4vaXRlcmF0b3InO1xuaW1wb3J0ICcuL1N5bWJvbCc7XG5pbXBvcnQgaGFzIGZyb20gJy4vc3VwcG9ydC9oYXMnO1xuXG4vKipcbiAqIEV4ZWN1dG9yIGlzIHRoZSBpbnRlcmZhY2UgZm9yIGZ1bmN0aW9ucyB1c2VkIHRvIGluaXRpYWxpemUgYSBQcm9taXNlLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEV4ZWN1dG9yPFQ+IHtcblx0LyoqXG5cdCAqIFRoZSBleGVjdXRvciBmb3IgdGhlIHByb21pc2Vcblx0ICpcblx0ICogQHBhcmFtIHJlc29sdmUgVGhlIHJlc29sdmVyIGNhbGxiYWNrIG9mIHRoZSBwcm9taXNlXG5cdCAqIEBwYXJhbSByZWplY3QgVGhlIHJlamVjdG9yIGNhbGxiYWNrIG9mIHRoZSBwcm9taXNlXG5cdCAqL1xuXHQocmVzb2x2ZTogKHZhbHVlPzogVCB8IFByb21pc2VMaWtlPFQ+KSA9PiB2b2lkLCByZWplY3Q6IChyZWFzb24/OiBhbnkpID0+IHZvaWQpOiB2b2lkO1xufVxuXG5leHBvcnQgbGV0IFNoaW1Qcm9taXNlOiB0eXBlb2YgUHJvbWlzZSA9IGdsb2JhbC5Qcm9taXNlO1xuXG5leHBvcnQgY29uc3QgaXNUaGVuYWJsZSA9IGZ1bmN0aW9uIGlzVGhlbmFibGU8VD4odmFsdWU6IGFueSk6IHZhbHVlIGlzIFByb21pc2VMaWtlPFQ+IHtcblx0cmV0dXJuIHZhbHVlICYmIHR5cGVvZiB2YWx1ZS50aGVuID09PSAnZnVuY3Rpb24nO1xufTtcblxuaWYgKCFoYXMoJ2VzNi1wcm9taXNlJykpIHtcblx0Y29uc3QgZW51bSBTdGF0ZSB7XG5cdFx0RnVsZmlsbGVkLFxuXHRcdFBlbmRpbmcsXG5cdFx0UmVqZWN0ZWRcblx0fVxuXG5cdGdsb2JhbC5Qcm9taXNlID0gU2hpbVByb21pc2UgPSBjbGFzcyBQcm9taXNlPFQ+IGltcGxlbWVudHMgVGhlbmFibGU8VD4ge1xuXHRcdHN0YXRpYyBhbGwoaXRlcmFibGU6IEl0ZXJhYmxlPGFueSB8IFByb21pc2VMaWtlPGFueT4+IHwgKGFueSB8IFByb21pc2VMaWtlPGFueT4pW10pOiBQcm9taXNlPGFueT4ge1xuXHRcdFx0cmV0dXJuIG5ldyB0aGlzKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuXHRcdFx0XHRjb25zdCB2YWx1ZXM6IGFueVtdID0gW107XG5cdFx0XHRcdGxldCBjb21wbGV0ZSA9IDA7XG5cdFx0XHRcdGxldCB0b3RhbCA9IDA7XG5cdFx0XHRcdGxldCBwb3B1bGF0aW5nID0gdHJ1ZTtcblxuXHRcdFx0XHRmdW5jdGlvbiBmdWxmaWxsKGluZGV4OiBudW1iZXIsIHZhbHVlOiBhbnkpOiB2b2lkIHtcblx0XHRcdFx0XHR2YWx1ZXNbaW5kZXhdID0gdmFsdWU7XG5cdFx0XHRcdFx0Kytjb21wbGV0ZTtcblx0XHRcdFx0XHRmaW5pc2goKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGZ1bmN0aW9uIGZpbmlzaCgpOiB2b2lkIHtcblx0XHRcdFx0XHRpZiAocG9wdWxhdGluZyB8fCBjb21wbGV0ZSA8IHRvdGFsKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJlc29sdmUodmFsdWVzKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGZ1bmN0aW9uIHByb2Nlc3NJdGVtKGluZGV4OiBudW1iZXIsIGl0ZW06IGFueSk6IHZvaWQge1xuXHRcdFx0XHRcdCsrdG90YWw7XG5cdFx0XHRcdFx0aWYgKGlzVGhlbmFibGUoaXRlbSkpIHtcblx0XHRcdFx0XHRcdC8vIElmIGFuIGl0ZW0gUHJvbWlzZSByZWplY3RzLCB0aGlzIFByb21pc2UgaXMgaW1tZWRpYXRlbHkgcmVqZWN0ZWQgd2l0aCB0aGUgaXRlbVxuXHRcdFx0XHRcdFx0Ly8gUHJvbWlzZSdzIHJlamVjdGlvbiBlcnJvci5cblx0XHRcdFx0XHRcdGl0ZW0udGhlbihmdWxmaWxsLmJpbmQobnVsbCwgaW5kZXgpLCByZWplY3QpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRQcm9taXNlLnJlc29sdmUoaXRlbSkudGhlbihmdWxmaWxsLmJpbmQobnVsbCwgaW5kZXgpKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRsZXQgaSA9IDA7XG5cdFx0XHRcdGZvciAoY29uc3QgdmFsdWUgb2YgaXRlcmFibGUpIHtcblx0XHRcdFx0XHRwcm9jZXNzSXRlbShpLCB2YWx1ZSk7XG5cdFx0XHRcdFx0aSsrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHBvcHVsYXRpbmcgPSBmYWxzZTtcblxuXHRcdFx0XHRmaW5pc2goKTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHN0YXRpYyByYWNlPFQ+KGl0ZXJhYmxlOiBJdGVyYWJsZTxUIHwgUHJvbWlzZUxpa2U8VD4+IHwgKFQgfCBQcm9taXNlTGlrZTxUPilbXSk6IFByb21pc2U8VFtdPiB7XG5cdFx0XHRyZXR1cm4gbmV3IHRoaXMoZnVuY3Rpb24ocmVzb2x2ZTogKHZhbHVlPzogYW55KSA9PiB2b2lkLCByZWplY3QpIHtcblx0XHRcdFx0Zm9yIChjb25zdCBpdGVtIG9mIGl0ZXJhYmxlKSB7XG5cdFx0XHRcdFx0aWYgKGl0ZW0gaW5zdGFuY2VvZiBQcm9taXNlKSB7XG5cdFx0XHRcdFx0XHQvLyBJZiBhIFByb21pc2UgaXRlbSByZWplY3RzLCB0aGlzIFByb21pc2UgaXMgaW1tZWRpYXRlbHkgcmVqZWN0ZWQgd2l0aCB0aGUgaXRlbVxuXHRcdFx0XHRcdFx0Ly8gUHJvbWlzZSdzIHJlamVjdGlvbiBlcnJvci5cblx0XHRcdFx0XHRcdGl0ZW0udGhlbihyZXNvbHZlLCByZWplY3QpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRQcm9taXNlLnJlc29sdmUoaXRlbSkudGhlbihyZXNvbHZlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHN0YXRpYyByZWplY3QocmVhc29uPzogYW55KTogUHJvbWlzZTxuZXZlcj4ge1xuXHRcdFx0cmV0dXJuIG5ldyB0aGlzKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuXHRcdFx0XHRyZWplY3QocmVhc29uKTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHN0YXRpYyByZXNvbHZlKCk6IFByb21pc2U8dm9pZD47XG5cdFx0c3RhdGljIHJlc29sdmU8VD4odmFsdWU6IFQgfCBQcm9taXNlTGlrZTxUPik6IFByb21pc2U8VD47XG5cdFx0c3RhdGljIHJlc29sdmU8VD4odmFsdWU/OiBhbnkpOiBQcm9taXNlPFQ+IHtcblx0XHRcdHJldHVybiBuZXcgdGhpcyhmdW5jdGlvbihyZXNvbHZlKSB7XG5cdFx0XHRcdHJlc29sdmUoPFQ+dmFsdWUpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0c3RhdGljIFtTeW1ib2wuc3BlY2llc106IFByb21pc2VDb25zdHJ1Y3RvciA9IFNoaW1Qcm9taXNlIGFzIFByb21pc2VDb25zdHJ1Y3RvcjtcblxuXHRcdC8qKlxuXHRcdCAqIENyZWF0ZXMgYSBuZXcgUHJvbWlzZS5cblx0XHQgKlxuXHRcdCAqIEBjb25zdHJ1Y3RvclxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGV4ZWN1dG9yXG5cdFx0ICogVGhlIGV4ZWN1dG9yIGZ1bmN0aW9uIGlzIGNhbGxlZCBpbW1lZGlhdGVseSB3aGVuIHRoZSBQcm9taXNlIGlzIGluc3RhbnRpYXRlZC4gSXQgaXMgcmVzcG9uc2libGUgZm9yXG5cdFx0ICogc3RhcnRpbmcgdGhlIGFzeW5jaHJvbm91cyBvcGVyYXRpb24gd2hlbiBpdCBpcyBpbnZva2VkLlxuXHRcdCAqXG5cdFx0ICogVGhlIGV4ZWN1dG9yIG11c3QgY2FsbCBlaXRoZXIgdGhlIHBhc3NlZCBgcmVzb2x2ZWAgZnVuY3Rpb24gd2hlbiB0aGUgYXN5bmNocm9ub3VzIG9wZXJhdGlvbiBoYXMgY29tcGxldGVkXG5cdFx0ICogc3VjY2Vzc2Z1bGx5LCBvciB0aGUgYHJlamVjdGAgZnVuY3Rpb24gd2hlbiB0aGUgb3BlcmF0aW9uIGZhaWxzLlxuXHRcdCAqL1xuXHRcdGNvbnN0cnVjdG9yKGV4ZWN1dG9yOiBFeGVjdXRvcjxUPikge1xuXHRcdFx0LyoqXG5cdFx0XHQgKiBJZiB0cnVlLCB0aGUgcmVzb2x1dGlvbiBvZiB0aGlzIHByb21pc2UgaXMgY2hhaW5lZCAoXCJsb2NrZWQgaW5cIikgdG8gYW5vdGhlciBwcm9taXNlLlxuXHRcdFx0ICovXG5cdFx0XHRsZXQgaXNDaGFpbmVkID0gZmFsc2U7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogV2hldGhlciBvciBub3QgdGhpcyBwcm9taXNlIGlzIGluIGEgcmVzb2x2ZWQgc3RhdGUuXG5cdFx0XHQgKi9cblx0XHRcdGNvbnN0IGlzUmVzb2x2ZWQgPSAoKTogYm9vbGVhbiA9PiB7XG5cdFx0XHRcdHJldHVybiB0aGlzLnN0YXRlICE9PSBTdGF0ZS5QZW5kaW5nIHx8IGlzQ2hhaW5lZDtcblx0XHRcdH07XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogQ2FsbGJhY2tzIHRoYXQgc2hvdWxkIGJlIGludm9rZWQgb25jZSB0aGUgYXN5bmNocm9ub3VzIG9wZXJhdGlvbiBoYXMgY29tcGxldGVkLlxuXHRcdFx0ICovXG5cdFx0XHRsZXQgY2FsbGJhY2tzOiBudWxsIHwgKEFycmF5PCgpID0+IHZvaWQ+KSA9IFtdO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIEluaXRpYWxseSBwdXNoZXMgY2FsbGJhY2tzIG9udG8gYSBxdWV1ZSBmb3IgZXhlY3V0aW9uIG9uY2UgdGhpcyBwcm9taXNlIHNldHRsZXMuIEFmdGVyIHRoZSBwcm9taXNlIHNldHRsZXMsXG5cdFx0XHQgKiBlbnF1ZXVlcyBjYWxsYmFja3MgZm9yIGV4ZWN1dGlvbiBvbiB0aGUgbmV4dCBldmVudCBsb29wIHR1cm4uXG5cdFx0XHQgKi9cblx0XHRcdGxldCB3aGVuRmluaXNoZWQgPSBmdW5jdGlvbihjYWxsYmFjazogKCkgPT4gdm9pZCk6IHZvaWQge1xuXHRcdFx0XHRpZiAoY2FsbGJhY2tzKSB7XG5cdFx0XHRcdFx0Y2FsbGJhY2tzLnB1c2goY2FsbGJhY2spO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIFNldHRsZXMgdGhpcyBwcm9taXNlLlxuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSBuZXdTdGF0ZSBUaGUgcmVzb2x2ZWQgc3RhdGUgZm9yIHRoaXMgcHJvbWlzZS5cblx0XHRcdCAqIEBwYXJhbSB7VHxhbnl9IHZhbHVlIFRoZSByZXNvbHZlZCB2YWx1ZSBmb3IgdGhpcyBwcm9taXNlLlxuXHRcdFx0ICovXG5cdFx0XHRjb25zdCBzZXR0bGUgPSAobmV3U3RhdGU6IFN0YXRlLCB2YWx1ZTogYW55KTogdm9pZCA9PiB7XG5cdFx0XHRcdC8vIEEgcHJvbWlzZSBjYW4gb25seSBiZSBzZXR0bGVkIG9uY2UuXG5cdFx0XHRcdGlmICh0aGlzLnN0YXRlICE9PSBTdGF0ZS5QZW5kaW5nKSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dGhpcy5zdGF0ZSA9IG5ld1N0YXRlO1xuXHRcdFx0XHR0aGlzLnJlc29sdmVkVmFsdWUgPSB2YWx1ZTtcblx0XHRcdFx0d2hlbkZpbmlzaGVkID0gcXVldWVNaWNyb1Rhc2s7XG5cblx0XHRcdFx0Ly8gT25seSBlbnF1ZXVlIGEgY2FsbGJhY2sgcnVubmVyIGlmIHRoZXJlIGFyZSBjYWxsYmFja3Mgc28gdGhhdCBpbml0aWFsbHkgZnVsZmlsbGVkIFByb21pc2VzIGRvbid0IGhhdmUgdG9cblx0XHRcdFx0Ly8gd2FpdCBhbiBleHRyYSB0dXJuLlxuXHRcdFx0XHRpZiAoY2FsbGJhY2tzICYmIGNhbGxiYWNrcy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0cXVldWVNaWNyb1Rhc2soZnVuY3Rpb24oKTogdm9pZCB7XG5cdFx0XHRcdFx0XHRpZiAoY2FsbGJhY2tzKSB7XG5cdFx0XHRcdFx0XHRcdGxldCBjb3VudCA9IGNhbGxiYWNrcy5sZW5ndGg7XG5cdFx0XHRcdFx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7ICsraSkge1xuXHRcdFx0XHRcdFx0XHRcdGNhbGxiYWNrc1tpXS5jYWxsKG51bGwpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGNhbGxiYWNrcyA9IG51bGw7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogUmVzb2x2ZXMgdGhpcyBwcm9taXNlLlxuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSBuZXdTdGF0ZSBUaGUgcmVzb2x2ZWQgc3RhdGUgZm9yIHRoaXMgcHJvbWlzZS5cblx0XHRcdCAqIEBwYXJhbSB7VHxhbnl9IHZhbHVlIFRoZSByZXNvbHZlZCB2YWx1ZSBmb3IgdGhpcyBwcm9taXNlLlxuXHRcdFx0ICovXG5cdFx0XHRjb25zdCByZXNvbHZlID0gKG5ld1N0YXRlOiBTdGF0ZSwgdmFsdWU6IGFueSk6IHZvaWQgPT4ge1xuXHRcdFx0XHRpZiAoaXNSZXNvbHZlZCgpKSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGlzVGhlbmFibGUodmFsdWUpKSB7XG5cdFx0XHRcdFx0dmFsdWUudGhlbihzZXR0bGUuYmluZChudWxsLCBTdGF0ZS5GdWxmaWxsZWQpLCBzZXR0bGUuYmluZChudWxsLCBTdGF0ZS5SZWplY3RlZCkpO1xuXHRcdFx0XHRcdGlzQ2hhaW5lZCA9IHRydWU7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0c2V0dGxlKG5ld1N0YXRlLCB2YWx1ZSk7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cblx0XHRcdHRoaXMudGhlbiA9IDxUUmVzdWx0MSA9IFQsIFRSZXN1bHQyID0gbmV2ZXI+KFxuXHRcdFx0XHRvbkZ1bGZpbGxlZD86ICgodmFsdWU6IFQpID0+IFRSZXN1bHQxIHwgUHJvbWlzZUxpa2U8VFJlc3VsdDE+KSB8IHVuZGVmaW5lZCB8IG51bGwsXG5cdFx0XHRcdG9uUmVqZWN0ZWQ/OiAoKHJlYXNvbjogYW55KSA9PiBUUmVzdWx0MiB8IFByb21pc2VMaWtlPFRSZXN1bHQyPikgfCB1bmRlZmluZWQgfCBudWxsXG5cdFx0XHQpOiBQcm9taXNlPFRSZXN1bHQxIHwgVFJlc3VsdDI+ID0+IHtcblx0XHRcdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRcdFx0XHQvLyB3aGVuRmluaXNoZWQgaW5pdGlhbGx5IHF1ZXVlcyB1cCBjYWxsYmFja3MgZm9yIGV4ZWN1dGlvbiBhZnRlciB0aGUgcHJvbWlzZSBoYXMgc2V0dGxlZC4gT25jZSB0aGVcblx0XHRcdFx0XHQvLyBwcm9taXNlIGhhcyBzZXR0bGVkLCB3aGVuRmluaXNoZWQgd2lsbCBzY2hlZHVsZSBjYWxsYmFja3MgZm9yIGV4ZWN1dGlvbiBvbiB0aGUgbmV4dCB0dXJuIHRocm91Z2ggdGhlXG5cdFx0XHRcdFx0Ly8gZXZlbnQgbG9vcC5cblx0XHRcdFx0XHR3aGVuRmluaXNoZWQoKCkgPT4ge1xuXHRcdFx0XHRcdFx0Y29uc3QgY2FsbGJhY2s6ICgodmFsdWU/OiBhbnkpID0+IGFueSkgfCB1bmRlZmluZWQgfCBudWxsID1cblx0XHRcdFx0XHRcdFx0dGhpcy5zdGF0ZSA9PT0gU3RhdGUuUmVqZWN0ZWQgPyBvblJlamVjdGVkIDogb25GdWxmaWxsZWQ7XG5cblx0XHRcdFx0XHRcdGlmICh0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0XHRyZXNvbHZlKGNhbGxiYWNrKHRoaXMucmVzb2x2ZWRWYWx1ZSkpO1xuXHRcdFx0XHRcdFx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0XHRcdFx0XHRcdHJlamVjdChlcnJvcik7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0gZWxzZSBpZiAodGhpcy5zdGF0ZSA9PT0gU3RhdGUuUmVqZWN0ZWQpIHtcblx0XHRcdFx0XHRcdFx0cmVqZWN0KHRoaXMucmVzb2x2ZWRWYWx1ZSk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRyZXNvbHZlKHRoaXMucmVzb2x2ZWRWYWx1ZSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fTtcblxuXHRcdFx0dHJ5IHtcblx0XHRcdFx0ZXhlY3V0b3IocmVzb2x2ZS5iaW5kKG51bGwsIFN0YXRlLkZ1bGZpbGxlZCksIHJlc29sdmUuYmluZChudWxsLCBTdGF0ZS5SZWplY3RlZCkpO1xuXHRcdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdFx0c2V0dGxlKFN0YXRlLlJlamVjdGVkLCBlcnJvcik7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Y2F0Y2g8VFJlc3VsdCA9IG5ldmVyPihcblx0XHRcdG9uUmVqZWN0ZWQ/OiAoKHJlYXNvbjogYW55KSA9PiBUUmVzdWx0IHwgUHJvbWlzZUxpa2U8VFJlc3VsdD4pIHwgdW5kZWZpbmVkIHwgbnVsbFxuXHRcdCk6IFByb21pc2U8VCB8IFRSZXN1bHQ+IHtcblx0XHRcdHJldHVybiB0aGlzLnRoZW4odW5kZWZpbmVkLCBvblJlamVjdGVkKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBUaGUgY3VycmVudCBzdGF0ZSBvZiB0aGlzIHByb21pc2UuXG5cdFx0ICovXG5cdFx0cHJpdmF0ZSBzdGF0ZSA9IFN0YXRlLlBlbmRpbmc7XG5cblx0XHQvKipcblx0XHQgKiBUaGUgcmVzb2x2ZWQgdmFsdWUgZm9yIHRoaXMgcHJvbWlzZS5cblx0XHQgKlxuXHRcdCAqIEB0eXBlIHtUfGFueX1cblx0XHQgKi9cblx0XHRwcml2YXRlIHJlc29sdmVkVmFsdWU6IGFueTtcblxuXHRcdHRoZW46IDxUUmVzdWx0MSA9IFQsIFRSZXN1bHQyID0gbmV2ZXI+KFxuXHRcdFx0b25mdWxmaWxsZWQ/OiAoKHZhbHVlOiBUKSA9PiBUUmVzdWx0MSB8IFByb21pc2VMaWtlPFRSZXN1bHQxPikgfCB1bmRlZmluZWQgfCBudWxsLFxuXHRcdFx0b25yZWplY3RlZD86ICgocmVhc29uOiBhbnkpID0+IFRSZXN1bHQyIHwgUHJvbWlzZUxpa2U8VFJlc3VsdDI+KSB8IHVuZGVmaW5lZCB8IG51bGxcblx0XHQpID0+IFByb21pc2U8VFJlc3VsdDEgfCBUUmVzdWx0Mj47XG5cblx0XHRbU3ltYm9sLnRvU3RyaW5nVGFnXTogJ1Byb21pc2UnID0gJ1Byb21pc2UnO1xuXHR9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBTaGltUHJvbWlzZTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyBQcm9taXNlLnRzIiwiaW1wb3J0IGdsb2JhbCBmcm9tICcuL2dsb2JhbCc7XG5pbXBvcnQgeyBpc0FycmF5TGlrZSwgSXRlcmFibGUsIEl0ZXJhYmxlSXRlcmF0b3IsIFNoaW1JdGVyYXRvciB9IGZyb20gJy4vaXRlcmF0b3InO1xuaW1wb3J0IGhhcyBmcm9tICcuL3N1cHBvcnQvaGFzJztcbmltcG9ydCAnLi9TeW1ib2wnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNldDxUPiB7XG5cdC8qKlxuXHQgKiBBZGRzIGEgYHZhbHVlYCB0byB0aGUgYFNldGBcblx0ICpcblx0ICogQHBhcmFtIHZhbHVlIFRoZSB2YWx1ZSB0byBhZGQgdG8gdGhlIHNldFxuXHQgKiBAcmV0dXJucyBUaGUgaW5zdGFuY2Ugb2YgdGhlIGBTZXRgXG5cdCAqL1xuXHRhZGQodmFsdWU6IFQpOiB0aGlzO1xuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGFsbCB0aGUgdmFsdWVzIGZyb20gdGhlIGBTZXRgLlxuXHQgKi9cblx0Y2xlYXIoKTogdm9pZDtcblxuXHQvKipcblx0ICogUmVtb3ZlcyBhIGB2YWx1ZWAgZnJvbSB0aGUgc2V0XG5cdCAqXG5cdCAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgdG8gYmUgcmVtb3ZlZFxuXHQgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHZhbHVlIHdhcyByZW1vdmVkXG5cdCAqL1xuXHRkZWxldGUodmFsdWU6IFQpOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGFuIGl0ZXJhdG9yIHRoYXQgeWllbGRzIGVhY2ggZW50cnkuXG5cdCAqXG5cdCAqIEByZXR1cm4gQW4gaXRlcmF0b3IgZm9yIGVhY2gga2V5L3ZhbHVlIHBhaXIgaW4gdGhlIGluc3RhbmNlLlxuXHQgKi9cblx0ZW50cmllcygpOiBJdGVyYWJsZUl0ZXJhdG9yPFtULCBUXT47XG5cblx0LyoqXG5cdCAqIEV4ZWN1dGVzIGEgZ2l2ZW4gZnVuY3Rpb24gZm9yIGVhY2ggc2V0IGVudHJ5LiBUaGUgZnVuY3Rpb25cblx0ICogaXMgaW52b2tlZCB3aXRoIHRocmVlIGFyZ3VtZW50czogdGhlIGVsZW1lbnQgdmFsdWUsIHRoZVxuXHQgKiBlbGVtZW50IGtleSwgYW5kIHRoZSBhc3NvY2lhdGVkIGBTZXRgIGluc3RhbmNlLlxuXHQgKlxuXHQgKiBAcGFyYW0gY2FsbGJhY2tmbiBUaGUgZnVuY3Rpb24gdG8gZXhlY3V0ZSBmb3IgZWFjaCBtYXAgZW50cnksXG5cdCAqIEBwYXJhbSB0aGlzQXJnIFRoZSB2YWx1ZSB0byB1c2UgZm9yIGB0aGlzYCBmb3IgZWFjaCBleGVjdXRpb24gb2YgdGhlIGNhbGJhY2tcblx0ICovXG5cdGZvckVhY2goY2FsbGJhY2tmbjogKHZhbHVlOiBULCB2YWx1ZTI6IFQsIHNldDogU2V0PFQ+KSA9PiB2b2lkLCB0aGlzQXJnPzogYW55KTogdm9pZDtcblxuXHQvKipcblx0ICogSWRlbnRpZmllcyBpZiBhIHZhbHVlIGlzIHBhcnQgb2YgdGhlIHNldC5cblx0ICpcblx0ICogQHBhcmFtIHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVja1xuXHQgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHZhbHVlIGlzIHBhcnQgb2YgdGhlIHNldCBvdGhlcndpc2UgYGZhbHNlYFxuXHQgKi9cblx0aGFzKHZhbHVlOiBUKTogYm9vbGVhbjtcblxuXHQvKipcblx0ICogRGVzcGl0ZSBpdHMgbmFtZSwgcmV0dXJucyBhbiBpdGVyYWJsZSBvZiB0aGUgdmFsdWVzIGluIHRoZSBzZXQsXG5cdCAqL1xuXHRrZXlzKCk6IEl0ZXJhYmxlSXRlcmF0b3I8VD47XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIG51bWJlciBvZiB2YWx1ZXMgaW4gdGhlIGBTZXRgLlxuXHQgKi9cblx0cmVhZG9ubHkgc2l6ZTogbnVtYmVyO1xuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGFuIGl0ZXJhYmxlIG9mIHZhbHVlcyBpbiB0aGUgc2V0LlxuXHQgKi9cblx0dmFsdWVzKCk6IEl0ZXJhYmxlSXRlcmF0b3I8VD47XG5cblx0LyoqIEl0ZXJhdGVzIG92ZXIgdmFsdWVzIGluIHRoZSBzZXQuICovXG5cdFtTeW1ib2wuaXRlcmF0b3JdKCk6IEl0ZXJhYmxlSXRlcmF0b3I8VD47XG5cblx0cmVhZG9ubHkgW1N5bWJvbC50b1N0cmluZ1RhZ106ICdTZXQnO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFNldENvbnN0cnVjdG9yIHtcblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBuZXcgU2V0XG5cdCAqXG5cdCAqIEBjb25zdHJ1Y3RvclxuXHQgKi9cblx0bmV3ICgpOiBTZXQ8YW55PjtcblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIG5ldyBTZXRcblx0ICpcblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqXG5cdCAqIEBwYXJhbSBpdGVyYXRvciBUaGUgaXRlcmFibGUgc3RydWN0dXJlIHRvIGluaXRpYWxpemUgdGhlIHNldCB3aXRoXG5cdCAqL1xuXHRuZXcgPFQ+KGl0ZXJhdG9yPzogVFtdKTogU2V0PFQ+O1xuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgbmV3IFNldFxuXHQgKlxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICpcblx0ICogQHBhcmFtIGl0ZXJhdG9yIFRoZSBpdGVyYWJsZSBzdHJ1Y3R1cmUgdG8gaW5pdGlhbGl6ZSB0aGUgc2V0IHdpdGhcblx0ICovXG5cdG5ldyA8VD4oaXRlcmF0b3I6IEl0ZXJhYmxlPFQ+KTogU2V0PFQ+O1xuXG5cdHJlYWRvbmx5IHByb3RvdHlwZTogU2V0PGFueT47XG59XG5cbmV4cG9ydCBsZXQgU2V0OiBTZXRDb25zdHJ1Y3RvciA9IGdsb2JhbC5TZXQ7XG5cbmlmICghaGFzKCdlczYtc2V0JykpIHtcblx0U2V0ID0gY2xhc3MgU2V0PFQ+IHtcblx0XHRwcml2YXRlIHJlYWRvbmx5IF9zZXREYXRhOiBUW10gPSBbXTtcblxuXHRcdHN0YXRpYyBbU3ltYm9sLnNwZWNpZXNdID0gU2V0O1xuXG5cdFx0Y29uc3RydWN0b3IoaXRlcmFibGU/OiBBcnJheUxpa2U8VD4gfCBJdGVyYWJsZTxUPikge1xuXHRcdFx0aWYgKGl0ZXJhYmxlKSB7XG5cdFx0XHRcdGlmIChpc0FycmF5TGlrZShpdGVyYWJsZSkpIHtcblx0XHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGl0ZXJhYmxlLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmFkZChpdGVyYWJsZVtpXSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGZvciAoY29uc3QgdmFsdWUgb2YgaXRlcmFibGUpIHtcblx0XHRcdFx0XHRcdHRoaXMuYWRkKHZhbHVlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRhZGQodmFsdWU6IFQpOiB0aGlzIHtcblx0XHRcdGlmICh0aGlzLmhhcyh2YWx1ZSkpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLl9zZXREYXRhLnB1c2godmFsdWUpO1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0Y2xlYXIoKTogdm9pZCB7XG5cdFx0XHR0aGlzLl9zZXREYXRhLmxlbmd0aCA9IDA7XG5cdFx0fVxuXG5cdFx0ZGVsZXRlKHZhbHVlOiBUKTogYm9vbGVhbiB7XG5cdFx0XHRjb25zdCBpZHggPSB0aGlzLl9zZXREYXRhLmluZGV4T2YodmFsdWUpO1xuXHRcdFx0aWYgKGlkeCA9PT0gLTEpIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5fc2V0RGF0YS5zcGxpY2UoaWR4LCAxKTtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdGVudHJpZXMoKTogSXRlcmFibGVJdGVyYXRvcjxbVCwgVF0+IHtcblx0XHRcdHJldHVybiBuZXcgU2hpbUl0ZXJhdG9yPFthbnksIGFueV0+KHRoaXMuX3NldERhdGEubWFwPFthbnksIGFueV0+KCh2YWx1ZSkgPT4gW3ZhbHVlLCB2YWx1ZV0pKTtcblx0XHR9XG5cblx0XHRmb3JFYWNoKGNhbGxiYWNrZm46ICh2YWx1ZTogVCwgaW5kZXg6IFQsIHNldDogU2V0PFQ+KSA9PiB2b2lkLCB0aGlzQXJnPzogYW55KTogdm9pZCB7XG5cdFx0XHRjb25zdCBpdGVyYXRvciA9IHRoaXMudmFsdWVzKCk7XG5cdFx0XHRsZXQgcmVzdWx0ID0gaXRlcmF0b3IubmV4dCgpO1xuXHRcdFx0d2hpbGUgKCFyZXN1bHQuZG9uZSkge1xuXHRcdFx0XHRjYWxsYmFja2ZuLmNhbGwodGhpc0FyZywgcmVzdWx0LnZhbHVlLCByZXN1bHQudmFsdWUsIHRoaXMpO1xuXHRcdFx0XHRyZXN1bHQgPSBpdGVyYXRvci5uZXh0KCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aGFzKHZhbHVlOiBUKTogYm9vbGVhbiB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fc2V0RGF0YS5pbmRleE9mKHZhbHVlKSA+IC0xO1xuXHRcdH1cblxuXHRcdGtleXMoKTogSXRlcmFibGVJdGVyYXRvcjxUPiB7XG5cdFx0XHRyZXR1cm4gbmV3IFNoaW1JdGVyYXRvcih0aGlzLl9zZXREYXRhKTtcblx0XHR9XG5cblx0XHRnZXQgc2l6ZSgpOiBudW1iZXIge1xuXHRcdFx0cmV0dXJuIHRoaXMuX3NldERhdGEubGVuZ3RoO1xuXHRcdH1cblxuXHRcdHZhbHVlcygpOiBJdGVyYWJsZUl0ZXJhdG9yPFQ+IHtcblx0XHRcdHJldHVybiBuZXcgU2hpbUl0ZXJhdG9yKHRoaXMuX3NldERhdGEpO1xuXHRcdH1cblxuXHRcdFtTeW1ib2wuaXRlcmF0b3JdKCk6IEl0ZXJhYmxlSXRlcmF0b3I8VD4ge1xuXHRcdFx0cmV0dXJuIG5ldyBTaGltSXRlcmF0b3IodGhpcy5fc2V0RGF0YSk7XG5cdFx0fVxuXG5cdFx0W1N5bWJvbC50b1N0cmluZ1RhZ106ICdTZXQnID0gJ1NldCc7XG5cdH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNldDtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyBTZXQudHMiLCJpbXBvcnQgaGFzIGZyb20gJy4vc3VwcG9ydC9oYXMnO1xuaW1wb3J0IGdsb2JhbCBmcm9tICcuL2dsb2JhbCc7XG5pbXBvcnQgeyBnZXRWYWx1ZURlc2NyaXB0b3IgfSBmcm9tICcuL3N1cHBvcnQvdXRpbCc7XG5cbmRlY2xhcmUgZ2xvYmFsIHtcblx0aW50ZXJmYWNlIFN5bWJvbENvbnN0cnVjdG9yIHtcblx0XHRvYnNlcnZhYmxlOiBzeW1ib2w7XG5cdH1cbn1cblxuZXhwb3J0IGxldCBTeW1ib2w6IFN5bWJvbENvbnN0cnVjdG9yID0gZ2xvYmFsLlN5bWJvbDtcblxuaWYgKCFoYXMoJ2VzNi1zeW1ib2wnKSkge1xuXHQvKipcblx0ICogVGhyb3dzIGlmIHRoZSB2YWx1ZSBpcyBub3QgYSBzeW1ib2wsIHVzZWQgaW50ZXJuYWxseSB3aXRoaW4gdGhlIFNoaW1cblx0ICogQHBhcmFtICB7YW55fSAgICB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2tcblx0ICogQHJldHVybiB7c3ltYm9sfSAgICAgICBSZXR1cm5zIHRoZSBzeW1ib2wgb3IgdGhyb3dzXG5cdCAqL1xuXHRjb25zdCB2YWxpZGF0ZVN5bWJvbCA9IGZ1bmN0aW9uIHZhbGlkYXRlU3ltYm9sKHZhbHVlOiBhbnkpOiBzeW1ib2wge1xuXHRcdGlmICghaXNTeW1ib2wodmFsdWUpKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKHZhbHVlICsgJyBpcyBub3QgYSBzeW1ib2wnKTtcblx0XHR9XG5cdFx0cmV0dXJuIHZhbHVlO1xuXHR9O1xuXG5cdGNvbnN0IGRlZmluZVByb3BlcnRpZXMgPSBPYmplY3QuZGVmaW5lUHJvcGVydGllcztcblx0Y29uc3QgZGVmaW5lUHJvcGVydHk6IChcblx0XHRvOiBhbnksXG5cdFx0cDogc3RyaW5nIHwgc3ltYm9sLFxuXHRcdGF0dHJpYnV0ZXM6IFByb3BlcnR5RGVzY3JpcHRvciAmIFRoaXNUeXBlPGFueT5cblx0KSA9PiBhbnkgPSBPYmplY3QuZGVmaW5lUHJvcGVydHkgYXMgYW55O1xuXHRjb25zdCBjcmVhdGUgPSBPYmplY3QuY3JlYXRlO1xuXG5cdGNvbnN0IG9ialByb3RvdHlwZSA9IE9iamVjdC5wcm90b3R5cGU7XG5cblx0Y29uc3QgZ2xvYmFsU3ltYm9sczogeyBba2V5OiBzdHJpbmddOiBzeW1ib2wgfSA9IHt9O1xuXG5cdGNvbnN0IGdldFN5bWJvbE5hbWUgPSAoZnVuY3Rpb24oKSB7XG5cdFx0Y29uc3QgY3JlYXRlZCA9IGNyZWF0ZShudWxsKTtcblx0XHRyZXR1cm4gZnVuY3Rpb24oZGVzYzogc3RyaW5nIHwgbnVtYmVyKTogc3RyaW5nIHtcblx0XHRcdGxldCBwb3N0Zml4ID0gMDtcblx0XHRcdGxldCBuYW1lOiBzdHJpbmc7XG5cdFx0XHR3aGlsZSAoY3JlYXRlZFtTdHJpbmcoZGVzYykgKyAocG9zdGZpeCB8fCAnJyldKSB7XG5cdFx0XHRcdCsrcG9zdGZpeDtcblx0XHRcdH1cblx0XHRcdGRlc2MgKz0gU3RyaW5nKHBvc3RmaXggfHwgJycpO1xuXHRcdFx0Y3JlYXRlZFtkZXNjXSA9IHRydWU7XG5cdFx0XHRuYW1lID0gJ0BAJyArIGRlc2M7XG5cblx0XHRcdC8vIEZJWE1FOiBUZW1wb3JhcnkgZ3VhcmQgdW50aWwgdGhlIGR1cGxpY2F0ZSBleGVjdXRpb24gd2hlbiB0ZXN0aW5nIGNhbiBiZVxuXHRcdFx0Ly8gcGlubmVkIGRvd24uXG5cdFx0XHRpZiAoIU9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqUHJvdG90eXBlLCBuYW1lKSkge1xuXHRcdFx0XHRkZWZpbmVQcm9wZXJ0eShvYmpQcm90b3R5cGUsIG5hbWUsIHtcblx0XHRcdFx0XHRzZXQ6IGZ1bmN0aW9uKHRoaXM6IFN5bWJvbCwgdmFsdWU6IGFueSkge1xuXHRcdFx0XHRcdFx0ZGVmaW5lUHJvcGVydHkodGhpcywgbmFtZSwgZ2V0VmFsdWVEZXNjcmlwdG9yKHZhbHVlKSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIG5hbWU7XG5cdFx0fTtcblx0fSkoKTtcblxuXHRjb25zdCBJbnRlcm5hbFN5bWJvbCA9IGZ1bmN0aW9uIFN5bWJvbCh0aGlzOiBhbnksIGRlc2NyaXB0aW9uPzogc3RyaW5nIHwgbnVtYmVyKTogc3ltYm9sIHtcblx0XHRpZiAodGhpcyBpbnN0YW5jZW9mIEludGVybmFsU3ltYm9sKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdUeXBlRXJyb3I6IFN5bWJvbCBpcyBub3QgYSBjb25zdHJ1Y3RvcicpO1xuXHRcdH1cblx0XHRyZXR1cm4gU3ltYm9sKGRlc2NyaXB0aW9uKTtcblx0fTtcblxuXHRTeW1ib2wgPSBnbG9iYWwuU3ltYm9sID0gZnVuY3Rpb24gU3ltYm9sKHRoaXM6IFN5bWJvbCwgZGVzY3JpcHRpb24/OiBzdHJpbmcgfCBudW1iZXIpOiBzeW1ib2wge1xuXHRcdGlmICh0aGlzIGluc3RhbmNlb2YgU3ltYm9sKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdUeXBlRXJyb3I6IFN5bWJvbCBpcyBub3QgYSBjb25zdHJ1Y3RvcicpO1xuXHRcdH1cblx0XHRjb25zdCBzeW0gPSBPYmplY3QuY3JlYXRlKEludGVybmFsU3ltYm9sLnByb3RvdHlwZSk7XG5cdFx0ZGVzY3JpcHRpb24gPSBkZXNjcmlwdGlvbiA9PT0gdW5kZWZpbmVkID8gJycgOiBTdHJpbmcoZGVzY3JpcHRpb24pO1xuXHRcdHJldHVybiBkZWZpbmVQcm9wZXJ0aWVzKHN5bSwge1xuXHRcdFx0X19kZXNjcmlwdGlvbl9fOiBnZXRWYWx1ZURlc2NyaXB0b3IoZGVzY3JpcHRpb24pLFxuXHRcdFx0X19uYW1lX186IGdldFZhbHVlRGVzY3JpcHRvcihnZXRTeW1ib2xOYW1lKGRlc2NyaXB0aW9uKSlcblx0XHR9KTtcblx0fSBhcyBTeW1ib2xDb25zdHJ1Y3RvcjtcblxuXHQvKiBEZWNvcmF0ZSB0aGUgU3ltYm9sIGZ1bmN0aW9uIHdpdGggdGhlIGFwcHJvcHJpYXRlIHByb3BlcnRpZXMgKi9cblx0ZGVmaW5lUHJvcGVydHkoXG5cdFx0U3ltYm9sLFxuXHRcdCdmb3InLFxuXHRcdGdldFZhbHVlRGVzY3JpcHRvcihmdW5jdGlvbihrZXk6IHN0cmluZyk6IHN5bWJvbCB7XG5cdFx0XHRpZiAoZ2xvYmFsU3ltYm9sc1trZXldKSB7XG5cdFx0XHRcdHJldHVybiBnbG9iYWxTeW1ib2xzW2tleV07XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gKGdsb2JhbFN5bWJvbHNba2V5XSA9IFN5bWJvbChTdHJpbmcoa2V5KSkpO1xuXHRcdH0pXG5cdCk7XG5cdGRlZmluZVByb3BlcnRpZXMoU3ltYm9sLCB7XG5cdFx0a2V5Rm9yOiBnZXRWYWx1ZURlc2NyaXB0b3IoZnVuY3Rpb24oc3ltOiBzeW1ib2wpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRcdFx0bGV0IGtleTogc3RyaW5nO1xuXHRcdFx0dmFsaWRhdGVTeW1ib2woc3ltKTtcblx0XHRcdGZvciAoa2V5IGluIGdsb2JhbFN5bWJvbHMpIHtcblx0XHRcdFx0aWYgKGdsb2JhbFN5bWJvbHNba2V5XSA9PT0gc3ltKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGtleTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pLFxuXHRcdGhhc0luc3RhbmNlOiBnZXRWYWx1ZURlc2NyaXB0b3IoU3ltYm9sLmZvcignaGFzSW5zdGFuY2UnKSwgZmFsc2UsIGZhbHNlKSxcblx0XHRpc0NvbmNhdFNwcmVhZGFibGU6IGdldFZhbHVlRGVzY3JpcHRvcihTeW1ib2wuZm9yKCdpc0NvbmNhdFNwcmVhZGFibGUnKSwgZmFsc2UsIGZhbHNlKSxcblx0XHRpdGVyYXRvcjogZ2V0VmFsdWVEZXNjcmlwdG9yKFN5bWJvbC5mb3IoJ2l0ZXJhdG9yJyksIGZhbHNlLCBmYWxzZSksXG5cdFx0bWF0Y2g6IGdldFZhbHVlRGVzY3JpcHRvcihTeW1ib2wuZm9yKCdtYXRjaCcpLCBmYWxzZSwgZmFsc2UpLFxuXHRcdG9ic2VydmFibGU6IGdldFZhbHVlRGVzY3JpcHRvcihTeW1ib2wuZm9yKCdvYnNlcnZhYmxlJyksIGZhbHNlLCBmYWxzZSksXG5cdFx0cmVwbGFjZTogZ2V0VmFsdWVEZXNjcmlwdG9yKFN5bWJvbC5mb3IoJ3JlcGxhY2UnKSwgZmFsc2UsIGZhbHNlKSxcblx0XHRzZWFyY2g6IGdldFZhbHVlRGVzY3JpcHRvcihTeW1ib2wuZm9yKCdzZWFyY2gnKSwgZmFsc2UsIGZhbHNlKSxcblx0XHRzcGVjaWVzOiBnZXRWYWx1ZURlc2NyaXB0b3IoU3ltYm9sLmZvcignc3BlY2llcycpLCBmYWxzZSwgZmFsc2UpLFxuXHRcdHNwbGl0OiBnZXRWYWx1ZURlc2NyaXB0b3IoU3ltYm9sLmZvcignc3BsaXQnKSwgZmFsc2UsIGZhbHNlKSxcblx0XHR0b1ByaW1pdGl2ZTogZ2V0VmFsdWVEZXNjcmlwdG9yKFN5bWJvbC5mb3IoJ3RvUHJpbWl0aXZlJyksIGZhbHNlLCBmYWxzZSksXG5cdFx0dG9TdHJpbmdUYWc6IGdldFZhbHVlRGVzY3JpcHRvcihTeW1ib2wuZm9yKCd0b1N0cmluZ1RhZycpLCBmYWxzZSwgZmFsc2UpLFxuXHRcdHVuc2NvcGFibGVzOiBnZXRWYWx1ZURlc2NyaXB0b3IoU3ltYm9sLmZvcigndW5zY29wYWJsZXMnKSwgZmFsc2UsIGZhbHNlKVxuXHR9KTtcblxuXHQvKiBEZWNvcmF0ZSB0aGUgSW50ZXJuYWxTeW1ib2wgb2JqZWN0ICovXG5cdGRlZmluZVByb3BlcnRpZXMoSW50ZXJuYWxTeW1ib2wucHJvdG90eXBlLCB7XG5cdFx0Y29uc3RydWN0b3I6IGdldFZhbHVlRGVzY3JpcHRvcihTeW1ib2wpLFxuXHRcdHRvU3RyaW5nOiBnZXRWYWx1ZURlc2NyaXB0b3IoXG5cdFx0XHRmdW5jdGlvbih0aGlzOiB7IF9fbmFtZV9fOiBzdHJpbmcgfSkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5fX25hbWVfXztcblx0XHRcdH0sXG5cdFx0XHRmYWxzZSxcblx0XHRcdGZhbHNlXG5cdFx0KVxuXHR9KTtcblxuXHQvKiBEZWNvcmF0ZSB0aGUgU3ltYm9sLnByb3RvdHlwZSAqL1xuXHRkZWZpbmVQcm9wZXJ0aWVzKFN5bWJvbC5wcm90b3R5cGUsIHtcblx0XHR0b1N0cmluZzogZ2V0VmFsdWVEZXNjcmlwdG9yKGZ1bmN0aW9uKHRoaXM6IFN5bWJvbCkge1xuXHRcdFx0cmV0dXJuICdTeW1ib2wgKCcgKyAodmFsaWRhdGVTeW1ib2wodGhpcykgYXMgYW55KS5fX2Rlc2NyaXB0aW9uX18gKyAnKSc7XG5cdFx0fSksXG5cdFx0dmFsdWVPZjogZ2V0VmFsdWVEZXNjcmlwdG9yKGZ1bmN0aW9uKHRoaXM6IFN5bWJvbCkge1xuXHRcdFx0cmV0dXJuIHZhbGlkYXRlU3ltYm9sKHRoaXMpO1xuXHRcdH0pXG5cdH0pO1xuXG5cdGRlZmluZVByb3BlcnR5KFxuXHRcdFN5bWJvbC5wcm90b3R5cGUsXG5cdFx0U3ltYm9sLnRvUHJpbWl0aXZlLFxuXHRcdGdldFZhbHVlRGVzY3JpcHRvcihmdW5jdGlvbih0aGlzOiBTeW1ib2wpIHtcblx0XHRcdHJldHVybiB2YWxpZGF0ZVN5bWJvbCh0aGlzKTtcblx0XHR9KVxuXHQpO1xuXHRkZWZpbmVQcm9wZXJ0eShTeW1ib2wucHJvdG90eXBlLCBTeW1ib2wudG9TdHJpbmdUYWcsIGdldFZhbHVlRGVzY3JpcHRvcignU3ltYm9sJywgZmFsc2UsIGZhbHNlLCB0cnVlKSk7XG5cblx0ZGVmaW5lUHJvcGVydHkoXG5cdFx0SW50ZXJuYWxTeW1ib2wucHJvdG90eXBlLFxuXHRcdFN5bWJvbC50b1ByaW1pdGl2ZSxcblx0XHRnZXRWYWx1ZURlc2NyaXB0b3IoKFN5bWJvbCBhcyBhbnkpLnByb3RvdHlwZVtTeW1ib2wudG9QcmltaXRpdmVdLCBmYWxzZSwgZmFsc2UsIHRydWUpXG5cdCk7XG5cdGRlZmluZVByb3BlcnR5KFxuXHRcdEludGVybmFsU3ltYm9sLnByb3RvdHlwZSxcblx0XHRTeW1ib2wudG9TdHJpbmdUYWcsXG5cdFx0Z2V0VmFsdWVEZXNjcmlwdG9yKChTeW1ib2wgYXMgYW55KS5wcm90b3R5cGVbU3ltYm9sLnRvU3RyaW5nVGFnXSwgZmFsc2UsIGZhbHNlLCB0cnVlKVxuXHQpO1xufVxuXG4vKipcbiAqIEEgY3VzdG9tIGd1YXJkIGZ1bmN0aW9uIHRoYXQgZGV0ZXJtaW5lcyBpZiBhbiBvYmplY3QgaXMgYSBzeW1ib2wgb3Igbm90XG4gKiBAcGFyYW0gIHthbnl9ICAgICAgIHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjayB0byBzZWUgaWYgaXQgaXMgYSBzeW1ib2wgb3Igbm90XG4gKiBAcmV0dXJuIHtpcyBzeW1ib2x9ICAgICAgIFJldHVybnMgdHJ1ZSBpZiBhIHN5bWJvbCBvciBub3QgKGFuZCBuYXJyb3dzIHRoZSB0eXBlIGd1YXJkKVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNTeW1ib2wodmFsdWU6IGFueSk6IHZhbHVlIGlzIHN5bWJvbCB7XG5cdHJldHVybiAodmFsdWUgJiYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N5bWJvbCcgfHwgdmFsdWVbJ0BAdG9TdHJpbmdUYWcnXSA9PT0gJ1N5bWJvbCcpKSB8fCBmYWxzZTtcbn1cblxuLyoqXG4gKiBGaWxsIGFueSBtaXNzaW5nIHdlbGwga25vd24gc3ltYm9scyBpZiB0aGUgbmF0aXZlIFN5bWJvbCBpcyBtaXNzaW5nIHRoZW1cbiAqL1xuW1xuXHQnaGFzSW5zdGFuY2UnLFxuXHQnaXNDb25jYXRTcHJlYWRhYmxlJyxcblx0J2l0ZXJhdG9yJyxcblx0J3NwZWNpZXMnLFxuXHQncmVwbGFjZScsXG5cdCdzZWFyY2gnLFxuXHQnc3BsaXQnLFxuXHQnbWF0Y2gnLFxuXHQndG9QcmltaXRpdmUnLFxuXHQndG9TdHJpbmdUYWcnLFxuXHQndW5zY29wYWJsZXMnLFxuXHQnb2JzZXJ2YWJsZSdcbl0uZm9yRWFjaCgod2VsbEtub3duKSA9PiB7XG5cdGlmICghKFN5bWJvbCBhcyBhbnkpW3dlbGxLbm93bl0pIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoU3ltYm9sLCB3ZWxsS25vd24sIGdldFZhbHVlRGVzY3JpcHRvcihTeW1ib2wuZm9yKHdlbGxLbm93biksIGZhbHNlLCBmYWxzZSkpO1xuXHR9XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgU3ltYm9sO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIFN5bWJvbC50cyIsImltcG9ydCBnbG9iYWwgZnJvbSAnLi9nbG9iYWwnO1xuaW1wb3J0IHsgaXNBcnJheUxpa2UsIEl0ZXJhYmxlIH0gZnJvbSAnLi9pdGVyYXRvcic7XG5pbXBvcnQgaGFzIGZyb20gJy4vc3VwcG9ydC9oYXMnO1xuaW1wb3J0ICcuL1N5bWJvbCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgV2Vha01hcDxLIGV4dGVuZHMgb2JqZWN0LCBWPiB7XG5cdC8qKlxuXHQgKiBSZW1vdmUgYSBga2V5YCBmcm9tIHRoZSBtYXBcblx0ICpcblx0ICogQHBhcmFtIGtleSBUaGUga2V5IHRvIHJlbW92ZVxuXHQgKiBAcmV0dXJuIGB0cnVlYCBpZiB0aGUgdmFsdWUgd2FzIHJlbW92ZWQsIG90aGVyd2lzZSBgZmFsc2VgXG5cdCAqL1xuXHRkZWxldGUoa2V5OiBLKTogYm9vbGVhbjtcblxuXHQvKipcblx0ICogUmV0cmlldmUgdGhlIHZhbHVlLCBiYXNlZCBvbiB0aGUgc3VwcGxpZWQgYGtleWBcblx0ICpcblx0ICogQHBhcmFtIGtleSBUaGUga2V5IHRvIHJldHJpZXZlIHRoZSBgdmFsdWVgIGZvclxuXHQgKiBAcmV0dXJuIHRoZSBgdmFsdWVgIGJhc2VkIG9uIHRoZSBga2V5YCBpZiBmb3VuZCwgb3RoZXJ3aXNlIGBmYWxzZWBcblx0ICovXG5cdGdldChrZXk6IEspOiBWIHwgdW5kZWZpbmVkO1xuXG5cdC8qKlxuXHQgKiBEZXRlcm1pbmVzIGlmIGEgYGtleWAgaXMgcHJlc2VudCBpbiB0aGUgbWFwXG5cdCAqXG5cdCAqIEBwYXJhbSBrZXkgVGhlIGBrZXlgIHRvIGNoZWNrXG5cdCAqIEByZXR1cm4gYHRydWVgIGlmIHRoZSBrZXkgaXMgcGFydCBvZiB0aGUgbWFwLCBvdGhlcndpc2UgYGZhbHNlYC5cblx0ICovXG5cdGhhcyhrZXk6IEspOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBTZXQgYSBgdmFsdWVgIGZvciBhIHBhcnRpY3VsYXIgYGtleWAuXG5cdCAqXG5cdCAqIEBwYXJhbSBrZXkgVGhlIGBrZXlgIHRvIHNldCB0aGUgYHZhbHVlYCBmb3Jcblx0ICogQHBhcmFtIHZhbHVlIFRoZSBgdmFsdWVgIHRvIHNldFxuXHQgKiBAcmV0dXJuIHRoZSBpbnN0YW5jZXNcblx0ICovXG5cdHNldChrZXk6IEssIHZhbHVlOiBWKTogdGhpcztcblxuXHRyZWFkb25seSBbU3ltYm9sLnRvU3RyaW5nVGFnXTogJ1dlYWtNYXAnO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFdlYWtNYXBDb25zdHJ1Y3RvciB7XG5cdC8qKlxuXHQgKiBDcmVhdGUgYSBuZXcgaW5zdGFuY2Ugb2YgYSBgV2Vha01hcGBcblx0ICpcblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqL1xuXHRuZXcgKCk6IFdlYWtNYXA8b2JqZWN0LCBhbnk+O1xuXG5cdC8qKlxuXHQgKiBDcmVhdGUgYSBuZXcgaW5zdGFuY2Ugb2YgYSBgV2Vha01hcGBcblx0ICpcblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqXG5cdCAqIEBwYXJhbSBpdGVyYWJsZSBBbiBpdGVyYWJsZSB0aGF0IGNvbnRhaW5zIHlpZWxkcyB1cCBrZXkvdmFsdWUgcGFpciBlbnRyaWVzXG5cdCAqL1xuXHRuZXcgPEsgZXh0ZW5kcyBvYmplY3QsIFY+KGl0ZXJhYmxlPzogW0ssIFZdW10pOiBXZWFrTWFwPEssIFY+O1xuXG5cdC8qKlxuXHQgKiBDcmVhdGUgYSBuZXcgaW5zdGFuY2Ugb2YgYSBgV2Vha01hcGBcblx0ICpcblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqXG5cdCAqIEBwYXJhbSBpdGVyYWJsZSBBbiBpdGVyYWJsZSB0aGF0IGNvbnRhaW5zIHlpZWxkcyB1cCBrZXkvdmFsdWUgcGFpciBlbnRyaWVzXG5cdCAqL1xuXHRuZXcgPEsgZXh0ZW5kcyBvYmplY3QsIFY+KGl0ZXJhYmxlOiBJdGVyYWJsZTxbSywgVl0+KTogV2Vha01hcDxLLCBWPjtcblxuXHRyZWFkb25seSBwcm90b3R5cGU6IFdlYWtNYXA8b2JqZWN0LCBhbnk+O1xufVxuXG5leHBvcnQgbGV0IFdlYWtNYXA6IFdlYWtNYXBDb25zdHJ1Y3RvciA9IGdsb2JhbC5XZWFrTWFwO1xuXG5pbnRlcmZhY2UgRW50cnk8SywgVj4ge1xuXHRrZXk6IEs7XG5cdHZhbHVlOiBWO1xufVxuXG5pZiAoIWhhcygnZXM2LXdlYWttYXAnKSkge1xuXHRjb25zdCBERUxFVEVEOiBhbnkgPSB7fTtcblxuXHRjb25zdCBnZXRVSUQgPSBmdW5jdGlvbiBnZXRVSUQoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwMDAwMDAwKTtcblx0fTtcblxuXHRjb25zdCBnZW5lcmF0ZU5hbWUgPSAoZnVuY3Rpb24oKSB7XG5cdFx0bGV0IHN0YXJ0SWQgPSBNYXRoLmZsb29yKERhdGUubm93KCkgJSAxMDAwMDAwMDApO1xuXG5cdFx0cmV0dXJuIGZ1bmN0aW9uIGdlbmVyYXRlTmFtZSgpOiBzdHJpbmcge1xuXHRcdFx0cmV0dXJuICdfX3dtJyArIGdldFVJRCgpICsgKHN0YXJ0SWQrKyArICdfXycpO1xuXHRcdH07XG5cdH0pKCk7XG5cblx0V2Vha01hcCA9IGNsYXNzIFdlYWtNYXA8SywgVj4ge1xuXHRcdHByaXZhdGUgcmVhZG9ubHkgX25hbWU6IHN0cmluZztcblx0XHRwcml2YXRlIHJlYWRvbmx5IF9mcm96ZW5FbnRyaWVzOiBFbnRyeTxLLCBWPltdO1xuXG5cdFx0Y29uc3RydWN0b3IoaXRlcmFibGU/OiBBcnJheUxpa2U8W0ssIFZdPiB8IEl0ZXJhYmxlPFtLLCBWXT4pIHtcblx0XHRcdHRoaXMuX25hbWUgPSBnZW5lcmF0ZU5hbWUoKTtcblxuXHRcdFx0dGhpcy5fZnJvemVuRW50cmllcyA9IFtdO1xuXG5cdFx0XHRpZiAoaXRlcmFibGUpIHtcblx0XHRcdFx0aWYgKGlzQXJyYXlMaWtlKGl0ZXJhYmxlKSkge1xuXHRcdFx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgaXRlcmFibGUubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdGNvbnN0IGl0ZW0gPSBpdGVyYWJsZVtpXTtcblx0XHRcdFx0XHRcdHRoaXMuc2V0KGl0ZW1bMF0sIGl0ZW1bMV0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBpdGVyYWJsZSkge1xuXHRcdFx0XHRcdFx0dGhpcy5zZXQoa2V5LCB2YWx1ZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cHJpdmF0ZSBfZ2V0RnJvemVuRW50cnlJbmRleChrZXk6IGFueSk6IG51bWJlciB7XG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX2Zyb3plbkVudHJpZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYgKHRoaXMuX2Zyb3plbkVudHJpZXNbaV0ua2V5ID09PSBrZXkpIHtcblx0XHRcdFx0XHRyZXR1cm4gaTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gLTE7XG5cdFx0fVxuXG5cdFx0ZGVsZXRlKGtleTogYW55KTogYm9vbGVhbiB7XG5cdFx0XHRpZiAoa2V5ID09PSB1bmRlZmluZWQgfHwga2V5ID09PSBudWxsKSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgZW50cnk6IEVudHJ5PEssIFY+ID0ga2V5W3RoaXMuX25hbWVdO1xuXHRcdFx0aWYgKGVudHJ5ICYmIGVudHJ5LmtleSA9PT0ga2V5ICYmIGVudHJ5LnZhbHVlICE9PSBERUxFVEVEKSB7XG5cdFx0XHRcdGVudHJ5LnZhbHVlID0gREVMRVRFRDtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IGZyb3plbkluZGV4ID0gdGhpcy5fZ2V0RnJvemVuRW50cnlJbmRleChrZXkpO1xuXHRcdFx0aWYgKGZyb3plbkluZGV4ID49IDApIHtcblx0XHRcdFx0dGhpcy5fZnJvemVuRW50cmllcy5zcGxpY2UoZnJvemVuSW5kZXgsIDEpO1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdGdldChrZXk6IGFueSk6IFYgfCB1bmRlZmluZWQge1xuXHRcdFx0aWYgKGtleSA9PT0gdW5kZWZpbmVkIHx8IGtleSA9PT0gbnVsbCkge1xuXHRcdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBlbnRyeTogRW50cnk8SywgVj4gPSBrZXlbdGhpcy5fbmFtZV07XG5cdFx0XHRpZiAoZW50cnkgJiYgZW50cnkua2V5ID09PSBrZXkgJiYgZW50cnkudmFsdWUgIT09IERFTEVURUQpIHtcblx0XHRcdFx0cmV0dXJuIGVudHJ5LnZhbHVlO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBmcm96ZW5JbmRleCA9IHRoaXMuX2dldEZyb3plbkVudHJ5SW5kZXgoa2V5KTtcblx0XHRcdGlmIChmcm96ZW5JbmRleCA+PSAwKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLl9mcm96ZW5FbnRyaWVzW2Zyb3plbkluZGV4XS52YWx1ZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRoYXMoa2V5OiBhbnkpOiBib29sZWFuIHtcblx0XHRcdGlmIChrZXkgPT09IHVuZGVmaW5lZCB8fCBrZXkgPT09IG51bGwpIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBlbnRyeTogRW50cnk8SywgVj4gPSBrZXlbdGhpcy5fbmFtZV07XG5cdFx0XHRpZiAoQm9vbGVhbihlbnRyeSAmJiBlbnRyeS5rZXkgPT09IGtleSAmJiBlbnRyeS52YWx1ZSAhPT0gREVMRVRFRCkpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IGZyb3plbkluZGV4ID0gdGhpcy5fZ2V0RnJvemVuRW50cnlJbmRleChrZXkpO1xuXHRcdFx0aWYgKGZyb3plbkluZGV4ID49IDApIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRzZXQoa2V5OiBhbnksIHZhbHVlPzogYW55KTogdGhpcyB7XG5cdFx0XHRpZiAoIWtleSB8fCAodHlwZW9mIGtleSAhPT0gJ29iamVjdCcgJiYgdHlwZW9mIGtleSAhPT0gJ2Z1bmN0aW9uJykpIHtcblx0XHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCB2YWx1ZSB1c2VkIGFzIHdlYWsgbWFwIGtleScpO1xuXHRcdFx0fVxuXHRcdFx0bGV0IGVudHJ5OiBFbnRyeTxLLCBWPiA9IGtleVt0aGlzLl9uYW1lXTtcblx0XHRcdGlmICghZW50cnkgfHwgZW50cnkua2V5ICE9PSBrZXkpIHtcblx0XHRcdFx0ZW50cnkgPSBPYmplY3QuY3JlYXRlKG51bGwsIHtcblx0XHRcdFx0XHRrZXk6IHsgdmFsdWU6IGtleSB9XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGlmIChPYmplY3QuaXNGcm96ZW4oa2V5KSkge1xuXHRcdFx0XHRcdHRoaXMuX2Zyb3plbkVudHJpZXMucHVzaChlbnRyeSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGtleSwgdGhpcy5fbmFtZSwge1xuXHRcdFx0XHRcdFx0dmFsdWU6IGVudHJ5XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGVudHJ5LnZhbHVlID0gdmFsdWU7XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHRbU3ltYm9sLnRvU3RyaW5nVGFnXTogJ1dlYWtNYXAnID0gJ1dlYWtNYXAnO1xuXHR9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBXZWFrTWFwO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIFdlYWtNYXAudHMiLCJpbXBvcnQgZ2xvYmFsIGZyb20gJy4vZ2xvYmFsJztcbmltcG9ydCB7IGlzQXJyYXlMaWtlLCBpc0l0ZXJhYmxlLCBJdGVyYWJsZSB9IGZyb20gJy4vaXRlcmF0b3InO1xuaW1wb3J0IHsgTUFYX1NBRkVfSU5URUdFUiB9IGZyb20gJy4vbnVtYmVyJztcbmltcG9ydCBoYXMgZnJvbSAnLi9zdXBwb3J0L2hhcyc7XG5pbXBvcnQgeyB3cmFwTmF0aXZlIH0gZnJvbSAnLi9zdXBwb3J0L3V0aWwnO1xuXG5leHBvcnQgaW50ZXJmYWNlIE1hcENhbGxiYWNrPFQsIFU+IHtcblx0LyoqXG5cdCAqIEEgY2FsbGJhY2sgZnVuY3Rpb24gd2hlbiBtYXBwaW5nXG5cdCAqXG5cdCAqIEBwYXJhbSBlbGVtZW50IFRoZSBlbGVtZW50IHRoYXQgaXMgY3VycmVudGx5IGJlaW5nIG1hcHBlZFxuXHQgKiBAcGFyYW0gaW5kZXggVGhlIGN1cnJlbnQgaW5kZXggb2YgdGhlIGVsZW1lbnRcblx0ICovXG5cdChlbGVtZW50OiBULCBpbmRleDogbnVtYmVyKTogVTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBGaW5kQ2FsbGJhY2s8VD4ge1xuXHQvKipcblx0ICogQSBjYWxsYmFjayBmdW5jdGlvbiB3aGVuIHVzaW5nIGZpbmRcblx0ICpcblx0ICogQHBhcmFtIGVsZW1lbnQgVGhlIGVsZW1lbnQgdGhhdCBpcyBjdXJyZW50eSBiZWluZyBhbmFseXNlZFxuXHQgKiBAcGFyYW0gaW5kZXggVGhlIGN1cnJlbnQgaW5kZXggb2YgdGhlIGVsZW1lbnQgdGhhdCBpcyBiZWluZyBhbmFseXNlZFxuXHQgKiBAcGFyYW0gYXJyYXkgVGhlIHNvdXJjZSBhcnJheVxuXHQgKi9cblx0KGVsZW1lbnQ6IFQsIGluZGV4OiBudW1iZXIsIGFycmF5OiBBcnJheUxpa2U8VD4pOiBib29sZWFuO1xufVxuXG5pbnRlcmZhY2UgV3JpdGFibGVBcnJheUxpa2U8VD4ge1xuXHRyZWFkb25seSBsZW5ndGg6IG51bWJlcjtcblx0W246IG51bWJlcl06IFQ7XG59XG5cbi8qIEVTNiBBcnJheSBzdGF0aWMgbWV0aG9kcyAqL1xuXG5leHBvcnQgaW50ZXJmYWNlIEZyb20ge1xuXHQvKipcblx0ICogVGhlIEFycmF5LmZyb20oKSBtZXRob2QgY3JlYXRlcyBhIG5ldyBBcnJheSBpbnN0YW5jZSBmcm9tIGFuIGFycmF5LWxpa2Ugb3IgaXRlcmFibGUgb2JqZWN0LlxuXHQgKlxuXHQgKiBAcGFyYW0gc291cmNlIEFuIGFycmF5LWxpa2Ugb3IgaXRlcmFibGUgb2JqZWN0IHRvIGNvbnZlcnQgdG8gYW4gYXJyYXlcblx0ICogQHBhcmFtIG1hcEZ1bmN0aW9uIEEgbWFwIGZ1bmN0aW9uIHRvIGNhbGwgb24gZWFjaCBlbGVtZW50IGluIHRoZSBhcnJheVxuXHQgKiBAcGFyYW0gdGhpc0FyZyBUaGUgZXhlY3V0aW9uIGNvbnRleHQgZm9yIHRoZSBtYXAgZnVuY3Rpb25cblx0ICogQHJldHVybiBUaGUgbmV3IEFycmF5XG5cdCAqL1xuXHQ8VCwgVT4oc291cmNlOiBBcnJheUxpa2U8VD4gfCBJdGVyYWJsZTxUPiwgbWFwRnVuY3Rpb246IE1hcENhbGxiYWNrPFQsIFU+LCB0aGlzQXJnPzogYW55KTogQXJyYXk8VT47XG5cblx0LyoqXG5cdCAqIFRoZSBBcnJheS5mcm9tKCkgbWV0aG9kIGNyZWF0ZXMgYSBuZXcgQXJyYXkgaW5zdGFuY2UgZnJvbSBhbiBhcnJheS1saWtlIG9yIGl0ZXJhYmxlIG9iamVjdC5cblx0ICpcblx0ICogQHBhcmFtIHNvdXJjZSBBbiBhcnJheS1saWtlIG9yIGl0ZXJhYmxlIG9iamVjdCB0byBjb252ZXJ0IHRvIGFuIGFycmF5XG5cdCAqIEByZXR1cm4gVGhlIG5ldyBBcnJheVxuXHQgKi9cblx0PFQ+KHNvdXJjZTogQXJyYXlMaWtlPFQ+IHwgSXRlcmFibGU8VD4pOiBBcnJheTxUPjtcbn1cblxuZXhwb3J0IGxldCBmcm9tOiBGcm9tO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgYXJyYXkgZnJvbSB0aGUgZnVuY3Rpb24gcGFyYW1ldGVycy5cbiAqXG4gKiBAcGFyYW0gYXJndW1lbnRzIEFueSBudW1iZXIgb2YgYXJndW1lbnRzIGZvciB0aGUgYXJyYXlcbiAqIEByZXR1cm4gQW4gYXJyYXkgZnJvbSB0aGUgZ2l2ZW4gYXJndW1lbnRzXG4gKi9cbmV4cG9ydCBsZXQgb2Y6IDxUPiguLi5pdGVtczogVFtdKSA9PiBBcnJheTxUPjtcblxuLyogRVM2IEFycmF5IGluc3RhbmNlIG1ldGhvZHMgKi9cblxuLyoqXG4gKiBDb3BpZXMgZGF0YSBpbnRlcm5hbGx5IHdpdGhpbiBhbiBhcnJheSBvciBhcnJheS1saWtlIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0gdGFyZ2V0IFRoZSB0YXJnZXQgYXJyYXktbGlrZSBvYmplY3RcbiAqIEBwYXJhbSBvZmZzZXQgVGhlIGluZGV4IHRvIHN0YXJ0IGNvcHlpbmcgdmFsdWVzIHRvOyBpZiBuZWdhdGl2ZSwgaXQgY291bnRzIGJhY2t3YXJkcyBmcm9tIGxlbmd0aFxuICogQHBhcmFtIHN0YXJ0IFRoZSBmaXJzdCAoaW5jbHVzaXZlKSBpbmRleCB0byBjb3B5OyBpZiBuZWdhdGl2ZSwgaXQgY291bnRzIGJhY2t3YXJkcyBmcm9tIGxlbmd0aFxuICogQHBhcmFtIGVuZCBUaGUgbGFzdCAoZXhjbHVzaXZlKSBpbmRleCB0byBjb3B5OyBpZiBuZWdhdGl2ZSwgaXQgY291bnRzIGJhY2t3YXJkcyBmcm9tIGxlbmd0aFxuICogQHJldHVybiBUaGUgdGFyZ2V0XG4gKi9cbmV4cG9ydCBsZXQgY29weVdpdGhpbjogPFQ+KHRhcmdldDogQXJyYXlMaWtlPFQ+LCBvZmZzZXQ6IG51bWJlciwgc3RhcnQ6IG51bWJlciwgZW5kPzogbnVtYmVyKSA9PiBBcnJheUxpa2U8VD47XG5cbi8qKlxuICogRmlsbHMgZWxlbWVudHMgb2YgYW4gYXJyYXktbGlrZSBvYmplY3Qgd2l0aCB0aGUgc3BlY2lmaWVkIHZhbHVlLlxuICpcbiAqIEBwYXJhbSB0YXJnZXQgVGhlIHRhcmdldCB0byBmaWxsXG4gKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIHRvIGZpbGwgZWFjaCBlbGVtZW50IG9mIHRoZSB0YXJnZXQgd2l0aFxuICogQHBhcmFtIHN0YXJ0IFRoZSBmaXJzdCBpbmRleCB0byBmaWxsXG4gKiBAcGFyYW0gZW5kIFRoZSAoZXhjbHVzaXZlKSBpbmRleCBhdCB3aGljaCB0byBzdG9wIGZpbGxpbmdcbiAqIEByZXR1cm4gVGhlIGZpbGxlZCB0YXJnZXRcbiAqL1xuZXhwb3J0IGxldCBmaWxsOiA8VD4odGFyZ2V0OiBBcnJheUxpa2U8VD4sIHZhbHVlOiBULCBzdGFydD86IG51bWJlciwgZW5kPzogbnVtYmVyKSA9PiBBcnJheUxpa2U8VD47XG5cbi8qKlxuICogRmluZHMgYW5kIHJldHVybnMgdGhlIGZpcnN0IGluc3RhbmNlIG1hdGNoaW5nIHRoZSBjYWxsYmFjayBvciB1bmRlZmluZWQgaWYgb25lIGlzIG5vdCBmb3VuZC5cbiAqXG4gKiBAcGFyYW0gdGFyZ2V0IEFuIGFycmF5LWxpa2Ugb2JqZWN0XG4gKiBAcGFyYW0gY2FsbGJhY2sgQSBmdW5jdGlvbiByZXR1cm5pbmcgaWYgdGhlIGN1cnJlbnQgdmFsdWUgbWF0Y2hlcyBhIGNyaXRlcmlhXG4gKiBAcGFyYW0gdGhpc0FyZyBUaGUgZXhlY3V0aW9uIGNvbnRleHQgZm9yIHRoZSBmaW5kIGZ1bmN0aW9uXG4gKiBAcmV0dXJuIFRoZSBmaXJzdCBlbGVtZW50IG1hdGNoaW5nIHRoZSBjYWxsYmFjaywgb3IgdW5kZWZpbmVkIGlmIG9uZSBkb2VzIG5vdCBleGlzdFxuICovXG5leHBvcnQgbGV0IGZpbmQ6IDxUPih0YXJnZXQ6IEFycmF5TGlrZTxUPiwgY2FsbGJhY2s6IEZpbmRDYWxsYmFjazxUPiwgdGhpc0FyZz86IHt9KSA9PiBUIHwgdW5kZWZpbmVkO1xuXG4vKipcbiAqIFBlcmZvcm1zIGEgbGluZWFyIHNlYXJjaCBhbmQgcmV0dXJucyB0aGUgZmlyc3QgaW5kZXggd2hvc2UgdmFsdWUgc2F0aXNmaWVzIHRoZSBwYXNzZWQgY2FsbGJhY2ssXG4gKiBvciAtMSBpZiBubyB2YWx1ZXMgc2F0aXNmeSBpdC5cbiAqXG4gKiBAcGFyYW0gdGFyZ2V0IEFuIGFycmF5LWxpa2Ugb2JqZWN0XG4gKiBAcGFyYW0gY2FsbGJhY2sgQSBmdW5jdGlvbiByZXR1cm5pbmcgdHJ1ZSBpZiB0aGUgY3VycmVudCB2YWx1ZSBzYXRpc2ZpZXMgaXRzIGNyaXRlcmlhXG4gKiBAcGFyYW0gdGhpc0FyZyBUaGUgZXhlY3V0aW9uIGNvbnRleHQgZm9yIHRoZSBmaW5kIGZ1bmN0aW9uXG4gKiBAcmV0dXJuIFRoZSBmaXJzdCBpbmRleCB3aG9zZSB2YWx1ZSBzYXRpc2ZpZXMgdGhlIHBhc3NlZCBjYWxsYmFjaywgb3IgLTEgaWYgbm8gdmFsdWVzIHNhdGlzZnkgaXRcbiAqL1xuZXhwb3J0IGxldCBmaW5kSW5kZXg6IDxUPih0YXJnZXQ6IEFycmF5TGlrZTxUPiwgY2FsbGJhY2s6IEZpbmRDYWxsYmFjazxUPiwgdGhpc0FyZz86IHt9KSA9PiBudW1iZXI7XG5cbi8qIEVTNyBBcnJheSBpbnN0YW5jZSBtZXRob2RzICovXG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIGFuIGFycmF5IGluY2x1ZGVzIGEgZ2l2ZW4gdmFsdWVcbiAqXG4gKiBAcGFyYW0gdGFyZ2V0IHRoZSB0YXJnZXQgYXJyYXktbGlrZSBvYmplY3RcbiAqIEBwYXJhbSBzZWFyY2hFbGVtZW50IHRoZSBpdGVtIHRvIHNlYXJjaCBmb3JcbiAqIEBwYXJhbSBmcm9tSW5kZXggdGhlIHN0YXJ0aW5nIGluZGV4IHRvIHNlYXJjaCBmcm9tXG4gKiBAcmV0dXJuIGB0cnVlYCBpZiB0aGUgYXJyYXkgaW5jbHVkZXMgdGhlIGVsZW1lbnQsIG90aGVyd2lzZSBgZmFsc2VgXG4gKi9cbmV4cG9ydCBsZXQgaW5jbHVkZXM6IDxUPih0YXJnZXQ6IEFycmF5TGlrZTxUPiwgc2VhcmNoRWxlbWVudDogVCwgZnJvbUluZGV4PzogbnVtYmVyKSA9PiBib29sZWFuO1xuXG5pZiAoaGFzKCdlczYtYXJyYXknKSAmJiBoYXMoJ2VzNi1hcnJheS1maWxsJykpIHtcblx0ZnJvbSA9IGdsb2JhbC5BcnJheS5mcm9tO1xuXHRvZiA9IGdsb2JhbC5BcnJheS5vZjtcblx0Y29weVdpdGhpbiA9IHdyYXBOYXRpdmUoZ2xvYmFsLkFycmF5LnByb3RvdHlwZS5jb3B5V2l0aGluKTtcblx0ZmlsbCA9IHdyYXBOYXRpdmUoZ2xvYmFsLkFycmF5LnByb3RvdHlwZS5maWxsKTtcblx0ZmluZCA9IHdyYXBOYXRpdmUoZ2xvYmFsLkFycmF5LnByb3RvdHlwZS5maW5kKTtcblx0ZmluZEluZGV4ID0gd3JhcE5hdGl2ZShnbG9iYWwuQXJyYXkucHJvdG90eXBlLmZpbmRJbmRleCk7XG59IGVsc2Uge1xuXHQvLyBJdCBpcyBvbmx5IG9sZGVyIHZlcnNpb25zIG9mIFNhZmFyaS9pT1MgdGhhdCBoYXZlIGEgYmFkIGZpbGwgaW1wbGVtZW50YXRpb24gYW5kIHNvIGFyZW4ndCBpbiB0aGUgd2lsZFxuXHQvLyBUbyBtYWtlIHRoaW5ncyBlYXNpZXIsIGlmIHRoZXJlIGlzIGEgYmFkIGZpbGwgaW1wbGVtZW50YXRpb24sIHRoZSB3aG9sZSBzZXQgb2YgZnVuY3Rpb25zIHdpbGwgYmUgZmlsbGVkXG5cblx0LyoqXG5cdCAqIEVuc3VyZXMgYSBub24tbmVnYXRpdmUsIG5vbi1pbmZpbml0ZSwgc2FmZSBpbnRlZ2VyLlxuXHQgKlxuXHQgKiBAcGFyYW0gbGVuZ3RoIFRoZSBudW1iZXIgdG8gdmFsaWRhdGVcblx0ICogQHJldHVybiBBIHByb3BlciBsZW5ndGhcblx0ICovXG5cdGNvbnN0IHRvTGVuZ3RoID0gZnVuY3Rpb24gdG9MZW5ndGgobGVuZ3RoOiBudW1iZXIpOiBudW1iZXIge1xuXHRcdGlmIChpc05hTihsZW5ndGgpKSB7XG5cdFx0XHRyZXR1cm4gMDtcblx0XHR9XG5cblx0XHRsZW5ndGggPSBOdW1iZXIobGVuZ3RoKTtcblx0XHRpZiAoaXNGaW5pdGUobGVuZ3RoKSkge1xuXHRcdFx0bGVuZ3RoID0gTWF0aC5mbG9vcihsZW5ndGgpO1xuXHRcdH1cblx0XHQvLyBFbnN1cmUgYSBub24tbmVnYXRpdmUsIHJlYWwsIHNhZmUgaW50ZWdlclxuXHRcdHJldHVybiBNYXRoLm1pbihNYXRoLm1heChsZW5ndGgsIDApLCBNQVhfU0FGRV9JTlRFR0VSKTtcblx0fTtcblxuXHQvKipcblx0ICogRnJvbSBFUzYgNy4xLjQgVG9JbnRlZ2VyKClcblx0ICpcblx0ICogQHBhcmFtIHZhbHVlIEEgdmFsdWUgdG8gY29udmVydFxuXHQgKiBAcmV0dXJuIEFuIGludGVnZXJcblx0ICovXG5cdGNvbnN0IHRvSW50ZWdlciA9IGZ1bmN0aW9uIHRvSW50ZWdlcih2YWx1ZTogYW55KTogbnVtYmVyIHtcblx0XHR2YWx1ZSA9IE51bWJlcih2YWx1ZSk7XG5cdFx0aWYgKGlzTmFOKHZhbHVlKSkge1xuXHRcdFx0cmV0dXJuIDA7XG5cdFx0fVxuXHRcdGlmICh2YWx1ZSA9PT0gMCB8fCAhaXNGaW5pdGUodmFsdWUpKSB7XG5cdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuICh2YWx1ZSA+IDAgPyAxIDogLTEpICogTWF0aC5mbG9vcihNYXRoLmFicyh2YWx1ZSkpO1xuXHR9O1xuXG5cdC8qKlxuXHQgKiBOb3JtYWxpemVzIGFuIG9mZnNldCBhZ2FpbnN0IGEgZ2l2ZW4gbGVuZ3RoLCB3cmFwcGluZyBpdCBpZiBuZWdhdGl2ZS5cblx0ICpcblx0ICogQHBhcmFtIHZhbHVlIFRoZSBvcmlnaW5hbCBvZmZzZXRcblx0ICogQHBhcmFtIGxlbmd0aCBUaGUgdG90YWwgbGVuZ3RoIHRvIG5vcm1hbGl6ZSBhZ2FpbnN0XG5cdCAqIEByZXR1cm4gSWYgbmVnYXRpdmUsIHByb3ZpZGUgYSBkaXN0YW5jZSBmcm9tIHRoZSBlbmQgKGxlbmd0aCk7IG90aGVyd2lzZSBwcm92aWRlIGEgZGlzdGFuY2UgZnJvbSAwXG5cdCAqL1xuXHRjb25zdCBub3JtYWxpemVPZmZzZXQgPSBmdW5jdGlvbiBub3JtYWxpemVPZmZzZXQodmFsdWU6IG51bWJlciwgbGVuZ3RoOiBudW1iZXIpOiBudW1iZXIge1xuXHRcdHJldHVybiB2YWx1ZSA8IDAgPyBNYXRoLm1heChsZW5ndGggKyB2YWx1ZSwgMCkgOiBNYXRoLm1pbih2YWx1ZSwgbGVuZ3RoKTtcblx0fTtcblxuXHRmcm9tID0gZnVuY3Rpb24gZnJvbShcblx0XHR0aGlzOiBBcnJheUNvbnN0cnVjdG9yLFxuXHRcdGFycmF5TGlrZTogSXRlcmFibGU8YW55PiB8IEFycmF5TGlrZTxhbnk+LFxuXHRcdG1hcEZ1bmN0aW9uPzogTWFwQ2FsbGJhY2s8YW55LCBhbnk+LFxuXHRcdHRoaXNBcmc/OiBhbnlcblx0KTogQXJyYXk8YW55PiB7XG5cdFx0aWYgKGFycmF5TGlrZSA9PSBudWxsKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdmcm9tOiByZXF1aXJlcyBhbiBhcnJheS1saWtlIG9iamVjdCcpO1xuXHRcdH1cblxuXHRcdGlmIChtYXBGdW5jdGlvbiAmJiB0aGlzQXJnKSB7XG5cdFx0XHRtYXBGdW5jdGlvbiA9IG1hcEZ1bmN0aW9uLmJpbmQodGhpc0FyZyk7XG5cdFx0fVxuXG5cdFx0LyogdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOnZhcmlhYmxlLW5hbWUgKi9cblx0XHRjb25zdCBDb25zdHJ1Y3RvciA9IHRoaXM7XG5cdFx0Y29uc3QgbGVuZ3RoOiBudW1iZXIgPSB0b0xlbmd0aCgoYXJyYXlMaWtlIGFzIGFueSkubGVuZ3RoKTtcblxuXHRcdC8vIFN1cHBvcnQgZXh0ZW5zaW9uXG5cdFx0Y29uc3QgYXJyYXk6IGFueVtdID1cblx0XHRcdHR5cGVvZiBDb25zdHJ1Y3RvciA9PT0gJ2Z1bmN0aW9uJyA/IDxhbnlbXT5PYmplY3QobmV3IENvbnN0cnVjdG9yKGxlbmd0aCkpIDogbmV3IEFycmF5KGxlbmd0aCk7XG5cblx0XHRpZiAoIWlzQXJyYXlMaWtlKGFycmF5TGlrZSkgJiYgIWlzSXRlcmFibGUoYXJyYXlMaWtlKSkge1xuXHRcdFx0cmV0dXJuIGFycmF5O1xuXHRcdH1cblxuXHRcdC8vIGlmIHRoaXMgaXMgYW4gYXJyYXkgYW5kIHRoZSBub3JtYWxpemVkIGxlbmd0aCBpcyAwLCBqdXN0IHJldHVybiBhbiBlbXB0eSBhcnJheS4gdGhpcyBwcmV2ZW50cyBhIHByb2JsZW1cblx0XHQvLyB3aXRoIHRoZSBpdGVyYXRpb24gb24gSUUgd2hlbiB1c2luZyBhIE5hTiBhcnJheSBsZW5ndGguXG5cdFx0aWYgKGlzQXJyYXlMaWtlKGFycmF5TGlrZSkpIHtcblx0XHRcdGlmIChsZW5ndGggPT09IDApIHtcblx0XHRcdFx0cmV0dXJuIFtdO1xuXHRcdFx0fVxuXG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFycmF5TGlrZS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRhcnJheVtpXSA9IG1hcEZ1bmN0aW9uID8gbWFwRnVuY3Rpb24oYXJyYXlMaWtlW2ldLCBpKSA6IGFycmF5TGlrZVtpXTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0bGV0IGkgPSAwO1xuXHRcdFx0Zm9yIChjb25zdCB2YWx1ZSBvZiBhcnJheUxpa2UpIHtcblx0XHRcdFx0YXJyYXlbaV0gPSBtYXBGdW5jdGlvbiA/IG1hcEZ1bmN0aW9uKHZhbHVlLCBpKSA6IHZhbHVlO1xuXHRcdFx0XHRpKys7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKChhcnJheUxpa2UgYXMgYW55KS5sZW5ndGggIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0YXJyYXkubGVuZ3RoID0gbGVuZ3RoO1xuXHRcdH1cblxuXHRcdHJldHVybiBhcnJheTtcblx0fTtcblxuXHRvZiA9IGZ1bmN0aW9uIG9mPFQ+KC4uLml0ZW1zOiBUW10pOiBBcnJheTxUPiB7XG5cdFx0cmV0dXJuIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGl0ZW1zKTtcblx0fTtcblxuXHRjb3B5V2l0aGluID0gZnVuY3Rpb24gY29weVdpdGhpbjxUPihcblx0XHR0YXJnZXQ6IEFycmF5TGlrZTxUPixcblx0XHRvZmZzZXQ6IG51bWJlcixcblx0XHRzdGFydDogbnVtYmVyLFxuXHRcdGVuZD86IG51bWJlclxuXHQpOiBBcnJheUxpa2U8VD4ge1xuXHRcdGlmICh0YXJnZXQgPT0gbnVsbCkge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignY29weVdpdGhpbjogdGFyZ2V0IG11c3QgYmUgYW4gYXJyYXktbGlrZSBvYmplY3QnKTtcblx0XHR9XG5cblx0XHRjb25zdCBsZW5ndGggPSB0b0xlbmd0aCh0YXJnZXQubGVuZ3RoKTtcblx0XHRvZmZzZXQgPSBub3JtYWxpemVPZmZzZXQodG9JbnRlZ2VyKG9mZnNldCksIGxlbmd0aCk7XG5cdFx0c3RhcnQgPSBub3JtYWxpemVPZmZzZXQodG9JbnRlZ2VyKHN0YXJ0KSwgbGVuZ3RoKTtcblx0XHRlbmQgPSBub3JtYWxpemVPZmZzZXQoZW5kID09PSB1bmRlZmluZWQgPyBsZW5ndGggOiB0b0ludGVnZXIoZW5kKSwgbGVuZ3RoKTtcblx0XHRsZXQgY291bnQgPSBNYXRoLm1pbihlbmQgLSBzdGFydCwgbGVuZ3RoIC0gb2Zmc2V0KTtcblxuXHRcdGxldCBkaXJlY3Rpb24gPSAxO1xuXHRcdGlmIChvZmZzZXQgPiBzdGFydCAmJiBvZmZzZXQgPCBzdGFydCArIGNvdW50KSB7XG5cdFx0XHRkaXJlY3Rpb24gPSAtMTtcblx0XHRcdHN0YXJ0ICs9IGNvdW50IC0gMTtcblx0XHRcdG9mZnNldCArPSBjb3VudCAtIDE7XG5cdFx0fVxuXG5cdFx0d2hpbGUgKGNvdW50ID4gMCkge1xuXHRcdFx0aWYgKHN0YXJ0IGluIHRhcmdldCkge1xuXHRcdFx0XHQodGFyZ2V0IGFzIFdyaXRhYmxlQXJyYXlMaWtlPFQ+KVtvZmZzZXRdID0gdGFyZ2V0W3N0YXJ0XTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGRlbGV0ZSAodGFyZ2V0IGFzIFdyaXRhYmxlQXJyYXlMaWtlPFQ+KVtvZmZzZXRdO1xuXHRcdFx0fVxuXG5cdFx0XHRvZmZzZXQgKz0gZGlyZWN0aW9uO1xuXHRcdFx0c3RhcnQgKz0gZGlyZWN0aW9uO1xuXHRcdFx0Y291bnQtLTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGFyZ2V0O1xuXHR9O1xuXG5cdGZpbGwgPSBmdW5jdGlvbiBmaWxsPFQ+KHRhcmdldDogQXJyYXlMaWtlPFQ+LCB2YWx1ZTogYW55LCBzdGFydD86IG51bWJlciwgZW5kPzogbnVtYmVyKTogQXJyYXlMaWtlPFQ+IHtcblx0XHRjb25zdCBsZW5ndGggPSB0b0xlbmd0aCh0YXJnZXQubGVuZ3RoKTtcblx0XHRsZXQgaSA9IG5vcm1hbGl6ZU9mZnNldCh0b0ludGVnZXIoc3RhcnQpLCBsZW5ndGgpO1xuXHRcdGVuZCA9IG5vcm1hbGl6ZU9mZnNldChlbmQgPT09IHVuZGVmaW5lZCA/IGxlbmd0aCA6IHRvSW50ZWdlcihlbmQpLCBsZW5ndGgpO1xuXG5cdFx0d2hpbGUgKGkgPCBlbmQpIHtcblx0XHRcdCh0YXJnZXQgYXMgV3JpdGFibGVBcnJheUxpa2U8VD4pW2krK10gPSB2YWx1ZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGFyZ2V0O1xuXHR9O1xuXG5cdGZpbmQgPSBmdW5jdGlvbiBmaW5kPFQ+KHRhcmdldDogQXJyYXlMaWtlPFQ+LCBjYWxsYmFjazogRmluZENhbGxiYWNrPFQ+LCB0aGlzQXJnPzoge30pOiBUIHwgdW5kZWZpbmVkIHtcblx0XHRjb25zdCBpbmRleCA9IGZpbmRJbmRleDxUPih0YXJnZXQsIGNhbGxiYWNrLCB0aGlzQXJnKTtcblx0XHRyZXR1cm4gaW5kZXggIT09IC0xID8gdGFyZ2V0W2luZGV4XSA6IHVuZGVmaW5lZDtcblx0fTtcblxuXHRmaW5kSW5kZXggPSBmdW5jdGlvbiBmaW5kSW5kZXg8VD4odGFyZ2V0OiBBcnJheUxpa2U8VD4sIGNhbGxiYWNrOiBGaW5kQ2FsbGJhY2s8VD4sIHRoaXNBcmc/OiB7fSk6IG51bWJlciB7XG5cdFx0Y29uc3QgbGVuZ3RoID0gdG9MZW5ndGgodGFyZ2V0Lmxlbmd0aCk7XG5cblx0XHRpZiAoIWNhbGxiYWNrKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdmaW5kOiBzZWNvbmQgYXJndW1lbnQgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXNBcmcpIHtcblx0XHRcdGNhbGxiYWNrID0gY2FsbGJhY2suYmluZCh0aGlzQXJnKTtcblx0XHR9XG5cblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG5cdFx0XHRpZiAoY2FsbGJhY2sodGFyZ2V0W2ldLCBpLCB0YXJnZXQpKSB7XG5cdFx0XHRcdHJldHVybiBpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiAtMTtcblx0fTtcbn1cblxuaWYgKGhhcygnZXM3LWFycmF5JykpIHtcblx0aW5jbHVkZXMgPSB3cmFwTmF0aXZlKGdsb2JhbC5BcnJheS5wcm90b3R5cGUuaW5jbHVkZXMpO1xufSBlbHNlIHtcblx0LyoqXG5cdCAqIEVuc3VyZXMgYSBub24tbmVnYXRpdmUsIG5vbi1pbmZpbml0ZSwgc2FmZSBpbnRlZ2VyLlxuXHQgKlxuXHQgKiBAcGFyYW0gbGVuZ3RoIFRoZSBudW1iZXIgdG8gdmFsaWRhdGVcblx0ICogQHJldHVybiBBIHByb3BlciBsZW5ndGhcblx0ICovXG5cdGNvbnN0IHRvTGVuZ3RoID0gZnVuY3Rpb24gdG9MZW5ndGgobGVuZ3RoOiBudW1iZXIpOiBudW1iZXIge1xuXHRcdGxlbmd0aCA9IE51bWJlcihsZW5ndGgpO1xuXHRcdGlmIChpc05hTihsZW5ndGgpKSB7XG5cdFx0XHRyZXR1cm4gMDtcblx0XHR9XG5cdFx0aWYgKGlzRmluaXRlKGxlbmd0aCkpIHtcblx0XHRcdGxlbmd0aCA9IE1hdGguZmxvb3IobGVuZ3RoKTtcblx0XHR9XG5cdFx0Ly8gRW5zdXJlIGEgbm9uLW5lZ2F0aXZlLCByZWFsLCBzYWZlIGludGVnZXJcblx0XHRyZXR1cm4gTWF0aC5taW4oTWF0aC5tYXgobGVuZ3RoLCAwKSwgTUFYX1NBRkVfSU5URUdFUik7XG5cdH07XG5cblx0aW5jbHVkZXMgPSBmdW5jdGlvbiBpbmNsdWRlczxUPih0YXJnZXQ6IEFycmF5TGlrZTxUPiwgc2VhcmNoRWxlbWVudDogVCwgZnJvbUluZGV4OiBudW1iZXIgPSAwKTogYm9vbGVhbiB7XG5cdFx0bGV0IGxlbiA9IHRvTGVuZ3RoKHRhcmdldC5sZW5ndGgpO1xuXG5cdFx0Zm9yIChsZXQgaSA9IGZyb21JbmRleDsgaSA8IGxlbjsgKytpKSB7XG5cdFx0XHRjb25zdCBjdXJyZW50RWxlbWVudCA9IHRhcmdldFtpXTtcblx0XHRcdGlmIChcblx0XHRcdFx0c2VhcmNoRWxlbWVudCA9PT0gY3VycmVudEVsZW1lbnQgfHxcblx0XHRcdFx0KHNlYXJjaEVsZW1lbnQgIT09IHNlYXJjaEVsZW1lbnQgJiYgY3VycmVudEVsZW1lbnQgIT09IGN1cnJlbnRFbGVtZW50KVxuXHRcdFx0KSB7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZTtcblx0fTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyBhcnJheS50cyIsImNvbnN0IGdsb2JhbE9iamVjdDogYW55ID0gKGZ1bmN0aW9uKCk6IGFueSB7XG5cdC8vIHRoZSBvbmx5IHJlbGlhYmxlIG1lYW5zIHRvIGdldCB0aGUgZ2xvYmFsIG9iamVjdCBpc1xuXHQvLyBgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKWBcblx0Ly8gSG93ZXZlciwgdGhpcyBjYXVzZXMgQ1NQIHZpb2xhdGlvbnMgaW4gQ2hyb21lIGFwcHMuXG5cdGlmICh0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRyZXR1cm4gc2VsZjtcblx0fVxuXHRpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRyZXR1cm4gd2luZG93O1xuXHR9XG5cdGlmICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJykge1xuXHRcdHJldHVybiBnbG9iYWw7XG5cdH1cbn0pKCk7XG5cbmV4cG9ydCBkZWZhdWx0IGdsb2JhbE9iamVjdDtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyBnbG9iYWwudHMiLCJpbXBvcnQgJy4vU3ltYm9sJztcbmltcG9ydCB7IEhJR0hfU1VSUk9HQVRFX01BWCwgSElHSF9TVVJST0dBVEVfTUlOIH0gZnJvbSAnLi9zdHJpbmcnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEl0ZXJhdG9yUmVzdWx0PFQ+IHtcblx0cmVhZG9ubHkgZG9uZTogYm9vbGVhbjtcblx0cmVhZG9ubHkgdmFsdWU6IFQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSXRlcmF0b3I8VD4ge1xuXHRuZXh0KHZhbHVlPzogYW55KTogSXRlcmF0b3JSZXN1bHQ8VD47XG5cblx0cmV0dXJuPyh2YWx1ZT86IGFueSk6IEl0ZXJhdG9yUmVzdWx0PFQ+O1xuXG5cdHRocm93PyhlPzogYW55KTogSXRlcmF0b3JSZXN1bHQ8VD47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSXRlcmFibGU8VD4ge1xuXHRbU3ltYm9sLml0ZXJhdG9yXSgpOiBJdGVyYXRvcjxUPjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJdGVyYWJsZUl0ZXJhdG9yPFQ+IGV4dGVuZHMgSXRlcmF0b3I8VD4ge1xuXHRbU3ltYm9sLml0ZXJhdG9yXSgpOiBJdGVyYWJsZUl0ZXJhdG9yPFQ+O1xufVxuXG5jb25zdCBzdGF0aWNEb25lOiBJdGVyYXRvclJlc3VsdDxhbnk+ID0geyBkb25lOiB0cnVlLCB2YWx1ZTogdW5kZWZpbmVkIH07XG5cbi8qKlxuICogQSBjbGFzcyB0aGF0IF9zaGltc18gYW4gaXRlcmF0b3IgaW50ZXJmYWNlIG9uIGFycmF5IGxpa2Ugb2JqZWN0cy5cbiAqL1xuZXhwb3J0IGNsYXNzIFNoaW1JdGVyYXRvcjxUPiB7XG5cdHByaXZhdGUgX2xpc3Q6IEFycmF5TGlrZTxUPiB8IHVuZGVmaW5lZDtcblx0cHJpdmF0ZSBfbmV4dEluZGV4ID0gLTE7XG5cdHByaXZhdGUgX25hdGl2ZUl0ZXJhdG9yOiBJdGVyYXRvcjxUPiB8IHVuZGVmaW5lZDtcblxuXHRjb25zdHJ1Y3RvcihsaXN0OiBBcnJheUxpa2U8VD4gfCBJdGVyYWJsZTxUPikge1xuXHRcdGlmIChpc0l0ZXJhYmxlKGxpc3QpKSB7XG5cdFx0XHR0aGlzLl9uYXRpdmVJdGVyYXRvciA9IGxpc3RbU3ltYm9sLml0ZXJhdG9yXSgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLl9saXN0ID0gbGlzdDtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJuIHRoZSBuZXh0IGl0ZXJhdGlvbiByZXN1bHQgZm9yIHRoZSBJdGVyYXRvclxuXHQgKi9cblx0bmV4dCgpOiBJdGVyYXRvclJlc3VsdDxUPiB7XG5cdFx0aWYgKHRoaXMuX25hdGl2ZUl0ZXJhdG9yKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fbmF0aXZlSXRlcmF0b3IubmV4dCgpO1xuXHRcdH1cblx0XHRpZiAoIXRoaXMuX2xpc3QpIHtcblx0XHRcdHJldHVybiBzdGF0aWNEb25lO1xuXHRcdH1cblx0XHRpZiAoKyt0aGlzLl9uZXh0SW5kZXggPCB0aGlzLl9saXN0Lmxlbmd0aCkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0ZG9uZTogZmFsc2UsXG5cdFx0XHRcdHZhbHVlOiB0aGlzLl9saXN0W3RoaXMuX25leHRJbmRleF1cblx0XHRcdH07XG5cdFx0fVxuXHRcdHJldHVybiBzdGF0aWNEb25lO1xuXHR9XG5cblx0W1N5bWJvbC5pdGVyYXRvcl0oKTogSXRlcmFibGVJdGVyYXRvcjxUPiB7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cbn1cblxuLyoqXG4gKiBBIHR5cGUgZ3VhcmQgZm9yIGNoZWNraW5nIGlmIHNvbWV0aGluZyBoYXMgYW4gSXRlcmFibGUgaW50ZXJmYWNlXG4gKlxuICogQHBhcmFtIHZhbHVlIFRoZSB2YWx1ZSB0byB0eXBlIGd1YXJkIGFnYWluc3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzSXRlcmFibGUodmFsdWU6IGFueSk6IHZhbHVlIGlzIEl0ZXJhYmxlPGFueT4ge1xuXHRyZXR1cm4gdmFsdWUgJiYgdHlwZW9mIHZhbHVlW1N5bWJvbC5pdGVyYXRvcl0gPT09ICdmdW5jdGlvbic7XG59XG5cbi8qKlxuICogQSB0eXBlIGd1YXJkIGZvciBjaGVja2luZyBpZiBzb21ldGhpbmcgaXMgQXJyYXlMaWtlXG4gKlxuICogQHBhcmFtIHZhbHVlIFRoZSB2YWx1ZSB0byB0eXBlIGd1YXJkIGFnYWluc3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQXJyYXlMaWtlKHZhbHVlOiBhbnkpOiB2YWx1ZSBpcyBBcnJheUxpa2U8YW55PiB7XG5cdHJldHVybiB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUubGVuZ3RoID09PSAnbnVtYmVyJztcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBpdGVyYXRvciBmb3IgYW4gb2JqZWN0XG4gKlxuICogQHBhcmFtIGl0ZXJhYmxlIFRoZSBpdGVyYWJsZSBvYmplY3QgdG8gcmV0dXJuIHRoZSBpdGVyYXRvciBmb3JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldDxUPihpdGVyYWJsZTogSXRlcmFibGU8VD4gfCBBcnJheUxpa2U8VD4pOiBJdGVyYXRvcjxUPiB8IHVuZGVmaW5lZCB7XG5cdGlmIChpc0l0ZXJhYmxlKGl0ZXJhYmxlKSkge1xuXHRcdHJldHVybiBpdGVyYWJsZVtTeW1ib2wuaXRlcmF0b3JdKCk7XG5cdH0gZWxzZSBpZiAoaXNBcnJheUxpa2UoaXRlcmFibGUpKSB7XG5cdFx0cmV0dXJuIG5ldyBTaGltSXRlcmF0b3IoaXRlcmFibGUpO1xuXHR9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRm9yT2ZDYWxsYmFjazxUPiB7XG5cdC8qKlxuXHQgKiBBIGNhbGxiYWNrIGZ1bmN0aW9uIGZvciBhIGZvck9mKCkgaXRlcmF0aW9uXG5cdCAqXG5cdCAqIEBwYXJhbSB2YWx1ZSBUaGUgY3VycmVudCB2YWx1ZVxuXHQgKiBAcGFyYW0gb2JqZWN0IFRoZSBvYmplY3QgYmVpbmcgaXRlcmF0ZWQgb3ZlclxuXHQgKiBAcGFyYW0gZG9CcmVhayBBIGZ1bmN0aW9uLCBpZiBjYWxsZWQsIHdpbGwgc3RvcCB0aGUgaXRlcmF0aW9uXG5cdCAqL1xuXHQodmFsdWU6IFQsIG9iamVjdDogSXRlcmFibGU8VD4gfCBBcnJheUxpa2U8VD4gfCBzdHJpbmcsIGRvQnJlYWs6ICgpID0+IHZvaWQpOiB2b2lkO1xufVxuXG4vKipcbiAqIFNoaW1zIHRoZSBmdW5jdGlvbmFsaXR5IG9mIGBmb3IgLi4uIG9mYCBibG9ja3NcbiAqXG4gKiBAcGFyYW0gaXRlcmFibGUgVGhlIG9iamVjdCB0aGUgcHJvdmlkZXMgYW4gaW50ZXJhdG9yIGludGVyZmFjZVxuICogQHBhcmFtIGNhbGxiYWNrIFRoZSBjYWxsYmFjayB3aGljaCB3aWxsIGJlIGNhbGxlZCBmb3IgZWFjaCBpdGVtIG9mIHRoZSBpdGVyYWJsZVxuICogQHBhcmFtIHRoaXNBcmcgT3B0aW9uYWwgc2NvcGUgdG8gcGFzcyB0aGUgY2FsbGJhY2tcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZvck9mPFQ+KFxuXHRpdGVyYWJsZTogSXRlcmFibGU8VD4gfCBBcnJheUxpa2U8VD4gfCBzdHJpbmcsXG5cdGNhbGxiYWNrOiBGb3JPZkNhbGxiYWNrPFQ+LFxuXHR0aGlzQXJnPzogYW55XG4pOiB2b2lkIHtcblx0bGV0IGJyb2tlbiA9IGZhbHNlO1xuXG5cdGZ1bmN0aW9uIGRvQnJlYWsoKSB7XG5cdFx0YnJva2VuID0gdHJ1ZTtcblx0fVxuXG5cdC8qIFdlIG5lZWQgdG8gaGFuZGxlIGl0ZXJhdGlvbiBvZiBkb3VibGUgYnl0ZSBzdHJpbmdzIHByb3Blcmx5ICovXG5cdGlmIChpc0FycmF5TGlrZShpdGVyYWJsZSkgJiYgdHlwZW9mIGl0ZXJhYmxlID09PSAnc3RyaW5nJykge1xuXHRcdGNvbnN0IGwgPSBpdGVyYWJsZS5sZW5ndGg7XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBsOyArK2kpIHtcblx0XHRcdGxldCBjaGFyID0gaXRlcmFibGVbaV07XG5cdFx0XHRpZiAoaSArIDEgPCBsKSB7XG5cdFx0XHRcdGNvbnN0IGNvZGUgPSBjaGFyLmNoYXJDb2RlQXQoMCk7XG5cdFx0XHRcdGlmIChjb2RlID49IEhJR0hfU1VSUk9HQVRFX01JTiAmJiBjb2RlIDw9IEhJR0hfU1VSUk9HQVRFX01BWCkge1xuXHRcdFx0XHRcdGNoYXIgKz0gaXRlcmFibGVbKytpXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Y2FsbGJhY2suY2FsbCh0aGlzQXJnLCBjaGFyLCBpdGVyYWJsZSwgZG9CcmVhayk7XG5cdFx0XHRpZiAoYnJva2VuKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0Y29uc3QgaXRlcmF0b3IgPSBnZXQoaXRlcmFibGUpO1xuXHRcdGlmIChpdGVyYXRvcikge1xuXHRcdFx0bGV0IHJlc3VsdCA9IGl0ZXJhdG9yLm5leHQoKTtcblxuXHRcdFx0d2hpbGUgKCFyZXN1bHQuZG9uZSkge1xuXHRcdFx0XHRjYWxsYmFjay5jYWxsKHRoaXNBcmcsIHJlc3VsdC52YWx1ZSwgaXRlcmFibGUsIGRvQnJlYWspO1xuXHRcdFx0XHRpZiAoYnJva2VuKSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJlc3VsdCA9IGl0ZXJhdG9yLm5leHQoKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyBpdGVyYXRvci50cyIsImltcG9ydCBnbG9iYWwgZnJvbSAnLi9nbG9iYWwnO1xuXG4vKipcbiAqIFRoZSBzbWFsbGVzdCBpbnRlcnZhbCBiZXR3ZWVuIHR3byByZXByZXNlbnRhYmxlIG51bWJlcnMuXG4gKi9cbmV4cG9ydCBjb25zdCBFUFNJTE9OID0gMTtcblxuLyoqXG4gKiBUaGUgbWF4aW11bSBzYWZlIGludGVnZXIgaW4gSmF2YVNjcmlwdFxuICovXG5leHBvcnQgY29uc3QgTUFYX1NBRkVfSU5URUdFUiA9IE1hdGgucG93KDIsIDUzKSAtIDE7XG5cbi8qKlxuICogVGhlIG1pbmltdW0gc2FmZSBpbnRlZ2VyIGluIEphdmFTY3JpcHRcbiAqL1xuZXhwb3J0IGNvbnN0IE1JTl9TQUZFX0lOVEVHRVIgPSAtTUFYX1NBRkVfSU5URUdFUjtcblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHBhc3NlZCB2YWx1ZSBpcyBOYU4gd2l0aG91dCBjb2Vyc2lvbi5cbiAqXG4gKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgaXMgTmFOLCBmYWxzZSBpZiBpdCBpcyBub3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzTmFOKHZhbHVlOiBhbnkpOiBib29sZWFuIHtcblx0cmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgZ2xvYmFsLmlzTmFOKHZhbHVlKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHBhc3NlZCB2YWx1ZSBpcyBhIGZpbml0ZSBudW1iZXIgd2l0aG91dCBjb2Vyc2lvbi5cbiAqXG4gKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgaXMgZmluaXRlLCBmYWxzZSBpZiBpdCBpcyBub3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRmluaXRlKHZhbHVlOiBhbnkpOiB2YWx1ZSBpcyBudW1iZXIge1xuXHRyZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJiBnbG9iYWwuaXNGaW5pdGUodmFsdWUpO1xufVxuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgcGFzc2VkIHZhbHVlIGlzIGFuIGludGVnZXIuXG4gKlxuICogQHBhcmFtIHZhbHVlIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIGlzIGFuIGludGVnZXIsIGZhbHNlIGlmIGl0IGlzIG5vdFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNJbnRlZ2VyKHZhbHVlOiBhbnkpOiB2YWx1ZSBpcyBudW1iZXIge1xuXHRyZXR1cm4gaXNGaW5pdGUodmFsdWUpICYmIE1hdGguZmxvb3IodmFsdWUpID09PSB2YWx1ZTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHBhc3NlZCB2YWx1ZSBpcyBhbiBpbnRlZ2VyIHRoYXQgaXMgJ3NhZmUsJyBtZWFuaW5nOlxuICogICAxLiBpdCBjYW4gYmUgZXhwcmVzc2VkIGFzIGFuIElFRUUtNzU0IGRvdWJsZSBwcmVjaXNpb24gbnVtYmVyXG4gKiAgIDIuIGl0IGhhcyBhIG9uZS10by1vbmUgbWFwcGluZyB0byBhIG1hdGhlbWF0aWNhbCBpbnRlZ2VyLCBtZWFuaW5nIGl0c1xuICogICAgICBJRUVFLTc1NCByZXByZXNlbnRhdGlvbiBjYW5ub3QgYmUgdGhlIHJlc3VsdCBvZiByb3VuZGluZyBhbnkgb3RoZXJcbiAqICAgICAgaW50ZWdlciB0byBmaXQgdGhlIElFRUUtNzU0IHJlcHJlc2VudGF0aW9uXG4gKlxuICogQHBhcmFtIHZhbHVlIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIGlzIGFuIGludGVnZXIsIGZhbHNlIGlmIGl0IGlzIG5vdFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNTYWZlSW50ZWdlcih2YWx1ZTogYW55KTogdmFsdWUgaXMgbnVtYmVyIHtcblx0cmV0dXJuIGlzSW50ZWdlcih2YWx1ZSkgJiYgTWF0aC5hYnModmFsdWUpIDw9IE1BWF9TQUZFX0lOVEVHRVI7XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gbnVtYmVyLnRzIiwiaW1wb3J0IGdsb2JhbCBmcm9tICcuL2dsb2JhbCc7XG5pbXBvcnQgaGFzIGZyb20gJy4vc3VwcG9ydC9oYXMnO1xuaW1wb3J0IHsgaXNTeW1ib2wgfSBmcm9tICcuL1N5bWJvbCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgT2JqZWN0QXNzaWduIHtcblx0LyoqXG5cdCAqIENvcHkgdGhlIHZhbHVlcyBvZiBhbGwgb2YgdGhlIGVudW1lcmFibGUgb3duIHByb3BlcnRpZXMgZnJvbSBvbmUgb3IgbW9yZSBzb3VyY2Ugb2JqZWN0cyB0byBhXG5cdCAqIHRhcmdldCBvYmplY3QuIFJldHVybnMgdGhlIHRhcmdldCBvYmplY3QuXG5cdCAqIEBwYXJhbSB0YXJnZXQgVGhlIHRhcmdldCBvYmplY3QgdG8gY29weSB0by5cblx0ICogQHBhcmFtIHNvdXJjZSBUaGUgc291cmNlIG9iamVjdCBmcm9tIHdoaWNoIHRvIGNvcHkgcHJvcGVydGllcy5cblx0ICovXG5cdDxULCBVPih0YXJnZXQ6IFQsIHNvdXJjZTogVSk6IFQgJiBVO1xuXG5cdC8qKlxuXHQgKiBDb3B5IHRoZSB2YWx1ZXMgb2YgYWxsIG9mIHRoZSBlbnVtZXJhYmxlIG93biBwcm9wZXJ0aWVzIGZyb20gb25lIG9yIG1vcmUgc291cmNlIG9iamVjdHMgdG8gYVxuXHQgKiB0YXJnZXQgb2JqZWN0LiBSZXR1cm5zIHRoZSB0YXJnZXQgb2JqZWN0LlxuXHQgKiBAcGFyYW0gdGFyZ2V0IFRoZSB0YXJnZXQgb2JqZWN0IHRvIGNvcHkgdG8uXG5cdCAqIEBwYXJhbSBzb3VyY2UxIFRoZSBmaXJzdCBzb3VyY2Ugb2JqZWN0IGZyb20gd2hpY2ggdG8gY29weSBwcm9wZXJ0aWVzLlxuXHQgKiBAcGFyYW0gc291cmNlMiBUaGUgc2Vjb25kIHNvdXJjZSBvYmplY3QgZnJvbSB3aGljaCB0byBjb3B5IHByb3BlcnRpZXMuXG5cdCAqL1xuXHQ8VCwgVSwgVj4odGFyZ2V0OiBULCBzb3VyY2UxOiBVLCBzb3VyY2UyOiBWKTogVCAmIFUgJiBWO1xuXG5cdC8qKlxuXHQgKiBDb3B5IHRoZSB2YWx1ZXMgb2YgYWxsIG9mIHRoZSBlbnVtZXJhYmxlIG93biBwcm9wZXJ0aWVzIGZyb20gb25lIG9yIG1vcmUgc291cmNlIG9iamVjdHMgdG8gYVxuXHQgKiB0YXJnZXQgb2JqZWN0LiBSZXR1cm5zIHRoZSB0YXJnZXQgb2JqZWN0LlxuXHQgKiBAcGFyYW0gdGFyZ2V0IFRoZSB0YXJnZXQgb2JqZWN0IHRvIGNvcHkgdG8uXG5cdCAqIEBwYXJhbSBzb3VyY2UxIFRoZSBmaXJzdCBzb3VyY2Ugb2JqZWN0IGZyb20gd2hpY2ggdG8gY29weSBwcm9wZXJ0aWVzLlxuXHQgKiBAcGFyYW0gc291cmNlMiBUaGUgc2Vjb25kIHNvdXJjZSBvYmplY3QgZnJvbSB3aGljaCB0byBjb3B5IHByb3BlcnRpZXMuXG5cdCAqIEBwYXJhbSBzb3VyY2UzIFRoZSB0aGlyZCBzb3VyY2Ugb2JqZWN0IGZyb20gd2hpY2ggdG8gY29weSBwcm9wZXJ0aWVzLlxuXHQgKi9cblx0PFQsIFUsIFYsIFc+KHRhcmdldDogVCwgc291cmNlMTogVSwgc291cmNlMjogViwgc291cmNlMzogVyk6IFQgJiBVICYgViAmIFc7XG5cblx0LyoqXG5cdCAqIENvcHkgdGhlIHZhbHVlcyBvZiBhbGwgb2YgdGhlIGVudW1lcmFibGUgb3duIHByb3BlcnRpZXMgZnJvbSBvbmUgb3IgbW9yZSBzb3VyY2Ugb2JqZWN0cyB0byBhXG5cdCAqIHRhcmdldCBvYmplY3QuIFJldHVybnMgdGhlIHRhcmdldCBvYmplY3QuXG5cdCAqIEBwYXJhbSB0YXJnZXQgVGhlIHRhcmdldCBvYmplY3QgdG8gY29weSB0by5cblx0ICogQHBhcmFtIHNvdXJjZXMgT25lIG9yIG1vcmUgc291cmNlIG9iamVjdHMgZnJvbSB3aGljaCB0byBjb3B5IHByb3BlcnRpZXNcblx0ICovXG5cdCh0YXJnZXQ6IG9iamVjdCwgLi4uc291cmNlczogYW55W10pOiBhbnk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgT2JqZWN0RW50ZXJpZXMge1xuXHQvKipcblx0ICogUmV0dXJucyBhbiBhcnJheSBvZiBrZXkvdmFsdWVzIG9mIHRoZSBlbnVtZXJhYmxlIHByb3BlcnRpZXMgb2YgYW4gb2JqZWN0XG5cdCAqIEBwYXJhbSBvIE9iamVjdCB0aGF0IGNvbnRhaW5zIHRoZSBwcm9wZXJ0aWVzIGFuZCBtZXRob2RzLiBUaGlzIGNhbiBiZSBhbiBvYmplY3QgdGhhdCB5b3UgY3JlYXRlZCBvciBhbiBleGlzdGluZyBEb2N1bWVudCBPYmplY3QgTW9kZWwgKERPTSkgb2JqZWN0LlxuXHQgKi9cblx0PFQgZXh0ZW5kcyB7IFtrZXk6IHN0cmluZ106IGFueSB9LCBLIGV4dGVuZHMga2V5b2YgVD4obzogVCk6IFtrZXlvZiBULCBUW0tdXVtdO1xuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGFuIGFycmF5IG9mIGtleS92YWx1ZXMgb2YgdGhlIGVudW1lcmFibGUgcHJvcGVydGllcyBvZiBhbiBvYmplY3Rcblx0ICogQHBhcmFtIG8gT2JqZWN0IHRoYXQgY29udGFpbnMgdGhlIHByb3BlcnRpZXMgYW5kIG1ldGhvZHMuIFRoaXMgY2FuIGJlIGFuIG9iamVjdCB0aGF0IHlvdSBjcmVhdGVkIG9yIGFuIGV4aXN0aW5nIERvY3VtZW50IE9iamVjdCBNb2RlbCAoRE9NKSBvYmplY3QuXG5cdCAqL1xuXHQobzogb2JqZWN0KTogW3N0cmluZywgYW55XVtdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE9iamVjdEdldE93blByb3BlcnR5RGVzY3JpcHRvcnMge1xuXHQ8VD4obzogVCk6IHsgW0sgaW4ga2V5b2YgVF06IFByb3BlcnR5RGVzY3JpcHRvciB9O1xuXHQobzogYW55KTogeyBba2V5OiBzdHJpbmddOiBQcm9wZXJ0eURlc2NyaXB0b3IgfTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBPYmplY3RWYWx1ZXMge1xuXHQvKipcblx0ICogUmV0dXJucyBhbiBhcnJheSBvZiB2YWx1ZXMgb2YgdGhlIGVudW1lcmFibGUgcHJvcGVydGllcyBvZiBhbiBvYmplY3Rcblx0ICogQHBhcmFtIG8gT2JqZWN0IHRoYXQgY29udGFpbnMgdGhlIHByb3BlcnRpZXMgYW5kIG1ldGhvZHMuIFRoaXMgY2FuIGJlIGFuIG9iamVjdCB0aGF0IHlvdSBjcmVhdGVkIG9yIGFuIGV4aXN0aW5nIERvY3VtZW50IE9iamVjdCBNb2RlbCAoRE9NKSBvYmplY3QuXG5cdCAqL1xuXHQ8VD4obzogeyBbczogc3RyaW5nXTogVCB9KTogVFtdO1xuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGFuIGFycmF5IG9mIHZhbHVlcyBvZiB0aGUgZW51bWVyYWJsZSBwcm9wZXJ0aWVzIG9mIGFuIG9iamVjdFxuXHQgKiBAcGFyYW0gbyBPYmplY3QgdGhhdCBjb250YWlucyB0aGUgcHJvcGVydGllcyBhbmQgbWV0aG9kcy4gVGhpcyBjYW4gYmUgYW4gb2JqZWN0IHRoYXQgeW91IGNyZWF0ZWQgb3IgYW4gZXhpc3RpbmcgRG9jdW1lbnQgT2JqZWN0IE1vZGVsIChET00pIG9iamVjdC5cblx0ICovXG5cdChvOiBvYmplY3QpOiBhbnlbXTtcbn1cblxuZXhwb3J0IGxldCBhc3NpZ246IE9iamVjdEFzc2lnbjtcblxuLyoqXG4gKiBHZXRzIHRoZSBvd24gcHJvcGVydHkgZGVzY3JpcHRvciBvZiB0aGUgc3BlY2lmaWVkIG9iamVjdC5cbiAqIEFuIG93biBwcm9wZXJ0eSBkZXNjcmlwdG9yIGlzIG9uZSB0aGF0IGlzIGRlZmluZWQgZGlyZWN0bHkgb24gdGhlIG9iamVjdCBhbmQgaXMgbm90XG4gKiBpbmhlcml0ZWQgZnJvbSB0aGUgb2JqZWN0J3MgcHJvdG90eXBlLlxuICogQHBhcmFtIG8gT2JqZWN0IHRoYXQgY29udGFpbnMgdGhlIHByb3BlcnR5LlxuICogQHBhcmFtIHAgTmFtZSBvZiB0aGUgcHJvcGVydHkuXG4gKi9cbmV4cG9ydCBsZXQgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yOiA8VCwgSyBleHRlbmRzIGtleW9mIFQ+KG86IFQsIHByb3BlcnR5S2V5OiBLKSA9PiBQcm9wZXJ0eURlc2NyaXB0b3IgfCB1bmRlZmluZWQ7XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbmFtZXMgb2YgdGhlIG93biBwcm9wZXJ0aWVzIG9mIGFuIG9iamVjdC4gVGhlIG93biBwcm9wZXJ0aWVzIG9mIGFuIG9iamVjdCBhcmUgdGhvc2UgdGhhdCBhcmUgZGVmaW5lZCBkaXJlY3RseVxuICogb24gdGhhdCBvYmplY3QsIGFuZCBhcmUgbm90IGluaGVyaXRlZCBmcm9tIHRoZSBvYmplY3QncyBwcm90b3R5cGUuIFRoZSBwcm9wZXJ0aWVzIG9mIGFuIG9iamVjdCBpbmNsdWRlIGJvdGggZmllbGRzIChvYmplY3RzKSBhbmQgZnVuY3Rpb25zLlxuICogQHBhcmFtIG8gT2JqZWN0IHRoYXQgY29udGFpbnMgdGhlIG93biBwcm9wZXJ0aWVzLlxuICovXG5leHBvcnQgbGV0IGdldE93blByb3BlcnR5TmFtZXM6IChvOiBhbnkpID0+IHN0cmluZ1tdO1xuXG4vKipcbiAqIFJldHVybnMgYW4gYXJyYXkgb2YgYWxsIHN5bWJvbCBwcm9wZXJ0aWVzIGZvdW5kIGRpcmVjdGx5IG9uIG9iamVjdCBvLlxuICogQHBhcmFtIG8gT2JqZWN0IHRvIHJldHJpZXZlIHRoZSBzeW1ib2xzIGZyb20uXG4gKi9cbmV4cG9ydCBsZXQgZ2V0T3duUHJvcGVydHlTeW1ib2xzOiAobzogYW55KSA9PiBzeW1ib2xbXTtcblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIHZhbHVlcyBhcmUgdGhlIHNhbWUgdmFsdWUsIGZhbHNlIG90aGVyd2lzZS5cbiAqIEBwYXJhbSB2YWx1ZTEgVGhlIGZpcnN0IHZhbHVlLlxuICogQHBhcmFtIHZhbHVlMiBUaGUgc2Vjb25kIHZhbHVlLlxuICovXG5leHBvcnQgbGV0IGlzOiAodmFsdWUxOiBhbnksIHZhbHVlMjogYW55KSA9PiBib29sZWFuO1xuXG4vKipcbiAqIFJldHVybnMgdGhlIG5hbWVzIG9mIHRoZSBlbnVtZXJhYmxlIHByb3BlcnRpZXMgYW5kIG1ldGhvZHMgb2YgYW4gb2JqZWN0LlxuICogQHBhcmFtIG8gT2JqZWN0IHRoYXQgY29udGFpbnMgdGhlIHByb3BlcnRpZXMgYW5kIG1ldGhvZHMuIFRoaXMgY2FuIGJlIGFuIG9iamVjdCB0aGF0IHlvdSBjcmVhdGVkIG9yIGFuIGV4aXN0aW5nIERvY3VtZW50IE9iamVjdCBNb2RlbCAoRE9NKSBvYmplY3QuXG4gKi9cbmV4cG9ydCBsZXQga2V5czogKG86IG9iamVjdCkgPT4gc3RyaW5nW107XG5cbi8qIEVTNyBPYmplY3Qgc3RhdGljIG1ldGhvZHMgKi9cblxuZXhwb3J0IGxldCBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzOiBPYmplY3RHZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzO1xuXG5leHBvcnQgbGV0IGVudHJpZXM6IE9iamVjdEVudGVyaWVzO1xuXG5leHBvcnQgbGV0IHZhbHVlczogT2JqZWN0VmFsdWVzO1xuXG5pZiAoaGFzKCdlczYtb2JqZWN0JykpIHtcblx0Y29uc3QgZ2xvYmFsT2JqZWN0ID0gZ2xvYmFsLk9iamVjdDtcblx0YXNzaWduID0gZ2xvYmFsT2JqZWN0LmFzc2lnbjtcblx0Z2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gZ2xvYmFsT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcjtcblx0Z2V0T3duUHJvcGVydHlOYW1lcyA9IGdsb2JhbE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzO1xuXHRnZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPSBnbG9iYWxPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzO1xuXHRpcyA9IGdsb2JhbE9iamVjdC5pcztcblx0a2V5cyA9IGdsb2JhbE9iamVjdC5rZXlzO1xufSBlbHNlIHtcblx0a2V5cyA9IGZ1bmN0aW9uIHN5bWJvbEF3YXJlS2V5cyhvOiBvYmplY3QpOiBzdHJpbmdbXSB7XG5cdFx0cmV0dXJuIE9iamVjdC5rZXlzKG8pLmZpbHRlcigoa2V5KSA9PiAhQm9vbGVhbihrZXkubWF0Y2goL15AQC4rLykpKTtcblx0fTtcblxuXHRhc3NpZ24gPSBmdW5jdGlvbiBhc3NpZ24odGFyZ2V0OiBhbnksIC4uLnNvdXJjZXM6IGFueVtdKSB7XG5cdFx0aWYgKHRhcmdldCA9PSBudWxsKSB7XG5cdFx0XHQvLyBUeXBlRXJyb3IgaWYgdW5kZWZpbmVkIG9yIG51bGxcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjb252ZXJ0IHVuZGVmaW5lZCBvciBudWxsIHRvIG9iamVjdCcpO1xuXHRcdH1cblxuXHRcdGNvbnN0IHRvID0gT2JqZWN0KHRhcmdldCk7XG5cdFx0c291cmNlcy5mb3JFYWNoKChuZXh0U291cmNlKSA9PiB7XG5cdFx0XHRpZiAobmV4dFNvdXJjZSkge1xuXHRcdFx0XHQvLyBTa2lwIG92ZXIgaWYgdW5kZWZpbmVkIG9yIG51bGxcblx0XHRcdFx0a2V5cyhuZXh0U291cmNlKS5mb3JFYWNoKChuZXh0S2V5KSA9PiB7XG5cdFx0XHRcdFx0dG9bbmV4dEtleV0gPSBuZXh0U291cmNlW25leHRLZXldO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHJldHVybiB0bztcblx0fTtcblxuXHRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgPSBmdW5jdGlvbjxULCBLIGV4dGVuZHMga2V5b2YgVD4obzogVCwgcHJvcDogSyk6IFByb3BlcnR5RGVzY3JpcHRvciB8IHVuZGVmaW5lZCB7XG5cdFx0aWYgKGlzU3ltYm9sKHByb3ApKSB7XG5cdFx0XHRyZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvLCBwcm9wKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IobywgcHJvcCk7XG5cdFx0fVxuXHR9O1xuXG5cdGdldE93blByb3BlcnR5TmFtZXMgPSBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eU5hbWVzKG86IGFueSk6IHN0cmluZ1tdIHtcblx0XHRyZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMobykuZmlsdGVyKChrZXkpID0+ICFCb29sZWFuKGtleS5tYXRjaCgvXkBALisvKSkpO1xuXHR9O1xuXG5cdGdldE93blByb3BlcnR5U3ltYm9scyA9IGZ1bmN0aW9uIGdldE93blByb3BlcnR5U3ltYm9scyhvOiBhbnkpOiBzeW1ib2xbXSB7XG5cdFx0cmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKG8pXG5cdFx0XHQuZmlsdGVyKChrZXkpID0+IEJvb2xlYW4oa2V5Lm1hdGNoKC9eQEAuKy8pKSlcblx0XHRcdC5tYXAoKGtleSkgPT4gU3ltYm9sLmZvcihrZXkuc3Vic3RyaW5nKDIpKSk7XG5cdH07XG5cblx0aXMgPSBmdW5jdGlvbiBpcyh2YWx1ZTE6IGFueSwgdmFsdWUyOiBhbnkpOiBib29sZWFuIHtcblx0XHRpZiAodmFsdWUxID09PSB2YWx1ZTIpIHtcblx0XHRcdHJldHVybiB2YWx1ZTEgIT09IDAgfHwgMSAvIHZhbHVlMSA9PT0gMSAvIHZhbHVlMjsgLy8gLTBcblx0XHR9XG5cdFx0cmV0dXJuIHZhbHVlMSAhPT0gdmFsdWUxICYmIHZhbHVlMiAhPT0gdmFsdWUyOyAvLyBOYU5cblx0fTtcbn1cblxuaWYgKGhhcygnZXMyMDE3LW9iamVjdCcpKSB7XG5cdGNvbnN0IGdsb2JhbE9iamVjdCA9IGdsb2JhbC5PYmplY3Q7XG5cdGdldE93blByb3BlcnR5RGVzY3JpcHRvcnMgPSBnbG9iYWxPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycztcblx0ZW50cmllcyA9IGdsb2JhbE9iamVjdC5lbnRyaWVzO1xuXHR2YWx1ZXMgPSBnbG9iYWxPYmplY3QudmFsdWVzO1xufSBlbHNlIHtcblx0Z2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyA9IGZ1bmN0aW9uIGdldE93blByb3BlcnR5RGVzY3JpcHRvcnMobzogYW55KSB7XG5cdFx0cmV0dXJuIGdldE93blByb3BlcnR5TmFtZXMobykucmVkdWNlKFxuXHRcdFx0KHByZXZpb3VzLCBrZXkpID0+IHtcblx0XHRcdFx0cHJldmlvdXNba2V5XSA9IGdldE93blByb3BlcnR5RGVzY3JpcHRvcihvLCBrZXkpITtcblx0XHRcdFx0cmV0dXJuIHByZXZpb3VzO1xuXHRcdFx0fSxcblx0XHRcdHt9IGFzIHsgW2tleTogc3RyaW5nXTogUHJvcGVydHlEZXNjcmlwdG9yIH1cblx0XHQpO1xuXHR9O1xuXG5cdGVudHJpZXMgPSBmdW5jdGlvbiBlbnRyaWVzKG86IGFueSk6IFtzdHJpbmcsIGFueV1bXSB7XG5cdFx0cmV0dXJuIGtleXMobykubWFwKChrZXkpID0+IFtrZXksIG9ba2V5XV0gYXMgW3N0cmluZywgYW55XSk7XG5cdH07XG5cblx0dmFsdWVzID0gZnVuY3Rpb24gdmFsdWVzKG86IGFueSk6IGFueVtdIHtcblx0XHRyZXR1cm4ga2V5cyhvKS5tYXAoKGtleSkgPT4gb1trZXldKTtcblx0fTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyBvYmplY3QudHMiLCJpbXBvcnQgZ2xvYmFsIGZyb20gJy4vZ2xvYmFsJztcbmltcG9ydCBoYXMgZnJvbSAnLi9zdXBwb3J0L2hhcyc7XG5pbXBvcnQgeyB3cmFwTmF0aXZlIH0gZnJvbSAnLi9zdXBwb3J0L3V0aWwnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFN0cmluZ05vcm1hbGl6ZSB7XG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBTdHJpbmcgdmFsdWUgcmVzdWx0IG9mIG5vcm1hbGl6aW5nIHRoZSBzdHJpbmcgaW50byB0aGUgbm9ybWFsaXphdGlvbiBmb3JtXG5cdCAqIG5hbWVkIGJ5IGZvcm0gYXMgc3BlY2lmaWVkIGluIFVuaWNvZGUgU3RhbmRhcmQgQW5uZXggIzE1LCBVbmljb2RlIE5vcm1hbGl6YXRpb24gRm9ybXMuXG5cdCAqIEBwYXJhbSB0YXJnZXQgVGhlIHRhcmdldCBzdHJpbmdcblx0ICogQHBhcmFtIGZvcm0gQXBwbGljYWJsZSB2YWx1ZXM6IFwiTkZDXCIsIFwiTkZEXCIsIFwiTkZLQ1wiLCBvciBcIk5GS0RcIiwgSWYgbm90IHNwZWNpZmllZCBkZWZhdWx0XG5cdCAqIGlzIFwiTkZDXCJcblx0ICovXG5cdCh0YXJnZXQ6IHN0cmluZywgZm9ybTogJ05GQycgfCAnTkZEJyB8ICdORktDJyB8ICdORktEJyk6IHN0cmluZztcblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgU3RyaW5nIHZhbHVlIHJlc3VsdCBvZiBub3JtYWxpemluZyB0aGUgc3RyaW5nIGludG8gdGhlIG5vcm1hbGl6YXRpb24gZm9ybVxuXHQgKiBuYW1lZCBieSBmb3JtIGFzIHNwZWNpZmllZCBpbiBVbmljb2RlIFN0YW5kYXJkIEFubmV4ICMxNSwgVW5pY29kZSBOb3JtYWxpemF0aW9uIEZvcm1zLlxuXHQgKiBAcGFyYW0gdGFyZ2V0IFRoZSB0YXJnZXQgc3RyaW5nXG5cdCAqIEBwYXJhbSBmb3JtIEFwcGxpY2FibGUgdmFsdWVzOiBcIk5GQ1wiLCBcIk5GRFwiLCBcIk5GS0NcIiwgb3IgXCJORktEXCIsIElmIG5vdCBzcGVjaWZpZWQgZGVmYXVsdFxuXHQgKiBpcyBcIk5GQ1wiXG5cdCAqL1xuXHQodGFyZ2V0OiBzdHJpbmcsIGZvcm0/OiBzdHJpbmcpOiBzdHJpbmc7XG59XG5cbi8qKlxuICogVGhlIG1pbmltdW0gbG9jYXRpb24gb2YgaGlnaCBzdXJyb2dhdGVzXG4gKi9cbmV4cG9ydCBjb25zdCBISUdIX1NVUlJPR0FURV9NSU4gPSAweGQ4MDA7XG5cbi8qKlxuICogVGhlIG1heGltdW0gbG9jYXRpb24gb2YgaGlnaCBzdXJyb2dhdGVzXG4gKi9cbmV4cG9ydCBjb25zdCBISUdIX1NVUlJPR0FURV9NQVggPSAweGRiZmY7XG5cbi8qKlxuICogVGhlIG1pbmltdW0gbG9jYXRpb24gb2YgbG93IHN1cnJvZ2F0ZXNcbiAqL1xuZXhwb3J0IGNvbnN0IExPV19TVVJST0dBVEVfTUlOID0gMHhkYzAwO1xuXG4vKipcbiAqIFRoZSBtYXhpbXVtIGxvY2F0aW9uIG9mIGxvdyBzdXJyb2dhdGVzXG4gKi9cbmV4cG9ydCBjb25zdCBMT1dfU1VSUk9HQVRFX01BWCA9IDB4ZGZmZjtcblxuLyogRVM2IHN0YXRpYyBtZXRob2RzICovXG5cbi8qKlxuICogUmV0dXJuIHRoZSBTdHJpbmcgdmFsdWUgd2hvc2UgZWxlbWVudHMgYXJlLCBpbiBvcmRlciwgdGhlIGVsZW1lbnRzIGluIHRoZSBMaXN0IGVsZW1lbnRzLlxuICogSWYgbGVuZ3RoIGlzIDAsIHRoZSBlbXB0eSBzdHJpbmcgaXMgcmV0dXJuZWQuXG4gKiBAcGFyYW0gY29kZVBvaW50cyBUaGUgY29kZSBwb2ludHMgdG8gZ2VuZXJhdGUgdGhlIHN0cmluZ1xuICovXG5leHBvcnQgbGV0IGZyb21Db2RlUG9pbnQ6ICguLi5jb2RlUG9pbnRzOiBudW1iZXJbXSkgPT4gc3RyaW5nO1xuXG4vKipcbiAqIGByYXdgIGlzIGludGVuZGVkIGZvciB1c2UgYXMgYSB0YWcgZnVuY3Rpb24gb2YgYSBUYWdnZWQgVGVtcGxhdGUgU3RyaW5nLiBXaGVuIGNhbGxlZFxuICogYXMgc3VjaCB0aGUgZmlyc3QgYXJndW1lbnQgd2lsbCBiZSBhIHdlbGwgZm9ybWVkIHRlbXBsYXRlIGNhbGwgc2l0ZSBvYmplY3QgYW5kIHRoZSByZXN0XG4gKiBwYXJhbWV0ZXIgd2lsbCBjb250YWluIHRoZSBzdWJzdGl0dXRpb24gdmFsdWVzLlxuICogQHBhcmFtIHRlbXBsYXRlIEEgd2VsbC1mb3JtZWQgdGVtcGxhdGUgc3RyaW5nIGNhbGwgc2l0ZSByZXByZXNlbnRhdGlvbi5cbiAqIEBwYXJhbSBzdWJzdGl0dXRpb25zIEEgc2V0IG9mIHN1YnN0aXR1dGlvbiB2YWx1ZXMuXG4gKi9cbmV4cG9ydCBsZXQgcmF3OiAodGVtcGxhdGU6IFRlbXBsYXRlU3RyaW5nc0FycmF5LCAuLi5zdWJzdGl0dXRpb25zOiBhbnlbXSkgPT4gc3RyaW5nO1xuXG4vKiBFUzYgaW5zdGFuY2UgbWV0aG9kcyAqL1xuXG4vKipcbiAqIFJldHVybnMgYSBub25uZWdhdGl2ZSBpbnRlZ2VyIE51bWJlciBsZXNzIHRoYW4gMTExNDExMiAoMHgxMTAwMDApIHRoYXQgaXMgdGhlIGNvZGUgcG9pbnRcbiAqIHZhbHVlIG9mIHRoZSBVVEYtMTYgZW5jb2RlZCBjb2RlIHBvaW50IHN0YXJ0aW5nIGF0IHRoZSBzdHJpbmcgZWxlbWVudCBhdCBwb3NpdGlvbiBwb3MgaW5cbiAqIHRoZSBTdHJpbmcgcmVzdWx0aW5nIGZyb20gY29udmVydGluZyB0aGlzIG9iamVjdCB0byBhIFN0cmluZy5cbiAqIElmIHRoZXJlIGlzIG5vIGVsZW1lbnQgYXQgdGhhdCBwb3NpdGlvbiwgdGhlIHJlc3VsdCBpcyB1bmRlZmluZWQuXG4gKiBJZiBhIHZhbGlkIFVURi0xNiBzdXJyb2dhdGUgcGFpciBkb2VzIG5vdCBiZWdpbiBhdCBwb3MsIHRoZSByZXN1bHQgaXMgdGhlIGNvZGUgdW5pdCBhdCBwb3MuXG4gKi9cbmV4cG9ydCBsZXQgY29kZVBvaW50QXQ6ICh0YXJnZXQ6IHN0cmluZywgcG9zPzogbnVtYmVyKSA9PiBudW1iZXIgfCB1bmRlZmluZWQ7XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBzZXF1ZW5jZSBvZiBlbGVtZW50cyBvZiBzZWFyY2hTdHJpbmcgY29udmVydGVkIHRvIGEgU3RyaW5nIGlzIHRoZVxuICogc2FtZSBhcyB0aGUgY29ycmVzcG9uZGluZyBlbGVtZW50cyBvZiB0aGlzIG9iamVjdCAoY29udmVydGVkIHRvIGEgU3RyaW5nKSBzdGFydGluZyBhdFxuICogZW5kUG9zaXRpb24g4oCTIGxlbmd0aCh0aGlzKS4gT3RoZXJ3aXNlIHJldHVybnMgZmFsc2UuXG4gKi9cbmV4cG9ydCBsZXQgZW5kc1dpdGg6ICh0YXJnZXQ6IHN0cmluZywgc2VhcmNoU3RyaW5nOiBzdHJpbmcsIGVuZFBvc2l0aW9uPzogbnVtYmVyKSA9PiBib29sZWFuO1xuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiBzZWFyY2hTdHJpbmcgYXBwZWFycyBhcyBhIHN1YnN0cmluZyBvZiB0aGUgcmVzdWx0IG9mIGNvbnZlcnRpbmcgdGhpc1xuICogb2JqZWN0IHRvIGEgU3RyaW5nLCBhdCBvbmUgb3IgbW9yZSBwb3NpdGlvbnMgdGhhdCBhcmVcbiAqIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0byBwb3NpdGlvbjsgb3RoZXJ3aXNlLCByZXR1cm5zIGZhbHNlLlxuICogQHBhcmFtIHRhcmdldCBUaGUgdGFyZ2V0IHN0cmluZ1xuICogQHBhcmFtIHNlYXJjaFN0cmluZyBzZWFyY2ggc3RyaW5nXG4gKiBAcGFyYW0gcG9zaXRpb24gSWYgcG9zaXRpb24gaXMgdW5kZWZpbmVkLCAwIGlzIGFzc3VtZWQsIHNvIGFzIHRvIHNlYXJjaCBhbGwgb2YgdGhlIFN0cmluZy5cbiAqL1xuZXhwb3J0IGxldCBpbmNsdWRlczogKHRhcmdldDogc3RyaW5nLCBzZWFyY2hTdHJpbmc6IHN0cmluZywgcG9zaXRpb24/OiBudW1iZXIpID0+IGJvb2xlYW47XG5cbi8qKlxuICogUmV0dXJucyB0aGUgU3RyaW5nIHZhbHVlIHJlc3VsdCBvZiBub3JtYWxpemluZyB0aGUgc3RyaW5nIGludG8gdGhlIG5vcm1hbGl6YXRpb24gZm9ybVxuICogbmFtZWQgYnkgZm9ybSBhcyBzcGVjaWZpZWQgaW4gVW5pY29kZSBTdGFuZGFyZCBBbm5leCAjMTUsIFVuaWNvZGUgTm9ybWFsaXphdGlvbiBGb3Jtcy5cbiAqIEBwYXJhbSB0YXJnZXQgVGhlIHRhcmdldCBzdHJpbmdcbiAqIEBwYXJhbSBmb3JtIEFwcGxpY2FibGUgdmFsdWVzOiBcIk5GQ1wiLCBcIk5GRFwiLCBcIk5GS0NcIiwgb3IgXCJORktEXCIsIElmIG5vdCBzcGVjaWZpZWQgZGVmYXVsdFxuICogaXMgXCJORkNcIlxuICovXG5leHBvcnQgbGV0IG5vcm1hbGl6ZTogU3RyaW5nTm9ybWFsaXplO1xuXG4vKipcbiAqIFJldHVybnMgYSBTdHJpbmcgdmFsdWUgdGhhdCBpcyBtYWRlIGZyb20gY291bnQgY29waWVzIGFwcGVuZGVkIHRvZ2V0aGVyLiBJZiBjb3VudCBpcyAwLFxuICogVCBpcyB0aGUgZW1wdHkgU3RyaW5nIGlzIHJldHVybmVkLlxuICogQHBhcmFtIGNvdW50IG51bWJlciBvZiBjb3BpZXMgdG8gYXBwZW5kXG4gKi9cbmV4cG9ydCBsZXQgcmVwZWF0OiAodGFyZ2V0OiBzdHJpbmcsIGNvdW50PzogbnVtYmVyKSA9PiBzdHJpbmc7XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBzZXF1ZW5jZSBvZiBlbGVtZW50cyBvZiBzZWFyY2hTdHJpbmcgY29udmVydGVkIHRvIGEgU3RyaW5nIGlzIHRoZVxuICogc2FtZSBhcyB0aGUgY29ycmVzcG9uZGluZyBlbGVtZW50cyBvZiB0aGlzIG9iamVjdCAoY29udmVydGVkIHRvIGEgU3RyaW5nKSBzdGFydGluZyBhdFxuICogcG9zaXRpb24uIE90aGVyd2lzZSByZXR1cm5zIGZhbHNlLlxuICovXG5leHBvcnQgbGV0IHN0YXJ0c1dpdGg6ICh0YXJnZXQ6IHN0cmluZywgc2VhcmNoU3RyaW5nOiBzdHJpbmcsIHBvc2l0aW9uPzogbnVtYmVyKSA9PiBib29sZWFuO1xuXG4vKiBFUzcgaW5zdGFuY2UgbWV0aG9kcyAqL1xuXG4vKipcbiAqIFBhZHMgdGhlIGN1cnJlbnQgc3RyaW5nIHdpdGggYSBnaXZlbiBzdHJpbmcgKHBvc3NpYmx5IHJlcGVhdGVkKSBzbyB0aGF0IHRoZSByZXN1bHRpbmcgc3RyaW5nIHJlYWNoZXMgYSBnaXZlbiBsZW5ndGguXG4gKiBUaGUgcGFkZGluZyBpcyBhcHBsaWVkIGZyb20gdGhlIGVuZCAocmlnaHQpIG9mIHRoZSBjdXJyZW50IHN0cmluZy5cbiAqXG4gKiBAcGFyYW0gdGFyZ2V0IFRoZSB0YXJnZXQgc3RyaW5nXG4gKiBAcGFyYW0gbWF4TGVuZ3RoIFRoZSBsZW5ndGggb2YgdGhlIHJlc3VsdGluZyBzdHJpbmcgb25jZSB0aGUgY3VycmVudCBzdHJpbmcgaGFzIGJlZW4gcGFkZGVkLlxuICogICAgICAgIElmIHRoaXMgcGFyYW1ldGVyIGlzIHNtYWxsZXIgdGhhbiB0aGUgY3VycmVudCBzdHJpbmcncyBsZW5ndGgsIHRoZSBjdXJyZW50IHN0cmluZyB3aWxsIGJlIHJldHVybmVkIGFzIGl0IGlzLlxuICpcbiAqIEBwYXJhbSBmaWxsU3RyaW5nIFRoZSBzdHJpbmcgdG8gcGFkIHRoZSBjdXJyZW50IHN0cmluZyB3aXRoLlxuICogICAgICAgIElmIHRoaXMgc3RyaW5nIGlzIHRvbyBsb25nLCBpdCB3aWxsIGJlIHRydW5jYXRlZCBhbmQgdGhlIGxlZnQtbW9zdCBwYXJ0IHdpbGwgYmUgYXBwbGllZC5cbiAqICAgICAgICBUaGUgZGVmYXVsdCB2YWx1ZSBmb3IgdGhpcyBwYXJhbWV0ZXIgaXMgXCIgXCIgKFUrMDAyMCkuXG4gKi9cbmV4cG9ydCBsZXQgcGFkRW5kOiAodGFyZ2V0OiBzdHJpbmcsIG1heExlbmd0aDogbnVtYmVyLCBmaWxsU3RyaW5nPzogc3RyaW5nKSA9PiBzdHJpbmc7XG5cbi8qKlxuICogUGFkcyB0aGUgY3VycmVudCBzdHJpbmcgd2l0aCBhIGdpdmVuIHN0cmluZyAocG9zc2libHkgcmVwZWF0ZWQpIHNvIHRoYXQgdGhlIHJlc3VsdGluZyBzdHJpbmcgcmVhY2hlcyBhIGdpdmVuIGxlbmd0aC5cbiAqIFRoZSBwYWRkaW5nIGlzIGFwcGxpZWQgZnJvbSB0aGUgc3RhcnQgKGxlZnQpIG9mIHRoZSBjdXJyZW50IHN0cmluZy5cbiAqXG4gKiBAcGFyYW0gdGFyZ2V0IFRoZSB0YXJnZXQgc3RyaW5nXG4gKiBAcGFyYW0gbWF4TGVuZ3RoIFRoZSBsZW5ndGggb2YgdGhlIHJlc3VsdGluZyBzdHJpbmcgb25jZSB0aGUgY3VycmVudCBzdHJpbmcgaGFzIGJlZW4gcGFkZGVkLlxuICogICAgICAgIElmIHRoaXMgcGFyYW1ldGVyIGlzIHNtYWxsZXIgdGhhbiB0aGUgY3VycmVudCBzdHJpbmcncyBsZW5ndGgsIHRoZSBjdXJyZW50IHN0cmluZyB3aWxsIGJlIHJldHVybmVkIGFzIGl0IGlzLlxuICpcbiAqIEBwYXJhbSBmaWxsU3RyaW5nIFRoZSBzdHJpbmcgdG8gcGFkIHRoZSBjdXJyZW50IHN0cmluZyB3aXRoLlxuICogICAgICAgIElmIHRoaXMgc3RyaW5nIGlzIHRvbyBsb25nLCBpdCB3aWxsIGJlIHRydW5jYXRlZCBhbmQgdGhlIGxlZnQtbW9zdCBwYXJ0IHdpbGwgYmUgYXBwbGllZC5cbiAqICAgICAgICBUaGUgZGVmYXVsdCB2YWx1ZSBmb3IgdGhpcyBwYXJhbWV0ZXIgaXMgXCIgXCIgKFUrMDAyMCkuXG4gKi9cbmV4cG9ydCBsZXQgcGFkU3RhcnQ6ICh0YXJnZXQ6IHN0cmluZywgbWF4TGVuZ3RoOiBudW1iZXIsIGZpbGxTdHJpbmc/OiBzdHJpbmcpID0+IHN0cmluZztcblxuaWYgKGhhcygnZXM2LXN0cmluZycpICYmIGhhcygnZXM2LXN0cmluZy1yYXcnKSkge1xuXHRmcm9tQ29kZVBvaW50ID0gZ2xvYmFsLlN0cmluZy5mcm9tQ29kZVBvaW50O1xuXHRyYXcgPSBnbG9iYWwuU3RyaW5nLnJhdztcblxuXHRjb2RlUG9pbnRBdCA9IHdyYXBOYXRpdmUoZ2xvYmFsLlN0cmluZy5wcm90b3R5cGUuY29kZVBvaW50QXQpO1xuXHRlbmRzV2l0aCA9IHdyYXBOYXRpdmUoZ2xvYmFsLlN0cmluZy5wcm90b3R5cGUuZW5kc1dpdGgpO1xuXHRpbmNsdWRlcyA9IHdyYXBOYXRpdmUoZ2xvYmFsLlN0cmluZy5wcm90b3R5cGUuaW5jbHVkZXMpO1xuXHRub3JtYWxpemUgPSB3cmFwTmF0aXZlKGdsb2JhbC5TdHJpbmcucHJvdG90eXBlLm5vcm1hbGl6ZSk7XG5cdHJlcGVhdCA9IHdyYXBOYXRpdmUoZ2xvYmFsLlN0cmluZy5wcm90b3R5cGUucmVwZWF0KTtcblx0c3RhcnRzV2l0aCA9IHdyYXBOYXRpdmUoZ2xvYmFsLlN0cmluZy5wcm90b3R5cGUuc3RhcnRzV2l0aCk7XG59IGVsc2Uge1xuXHQvKipcblx0ICogVmFsaWRhdGVzIHRoYXQgdGV4dCBpcyBkZWZpbmVkLCBhbmQgbm9ybWFsaXplcyBwb3NpdGlvbiAoYmFzZWQgb24gdGhlIGdpdmVuIGRlZmF1bHQgaWYgdGhlIGlucHV0IGlzIE5hTikuXG5cdCAqIFVzZWQgYnkgc3RhcnRzV2l0aCwgaW5jbHVkZXMsIGFuZCBlbmRzV2l0aC5cblx0ICpcblx0ICogQHJldHVybiBOb3JtYWxpemVkIHBvc2l0aW9uLlxuXHQgKi9cblx0Y29uc3Qgbm9ybWFsaXplU3Vic3RyaW5nQXJncyA9IGZ1bmN0aW9uKFxuXHRcdG5hbWU6IHN0cmluZyxcblx0XHR0ZXh0OiBzdHJpbmcsXG5cdFx0c2VhcmNoOiBzdHJpbmcsXG5cdFx0cG9zaXRpb246IG51bWJlcixcblx0XHRpc0VuZDogYm9vbGVhbiA9IGZhbHNlXG5cdCk6IFtzdHJpbmcsIHN0cmluZywgbnVtYmVyXSB7XG5cdFx0aWYgKHRleHQgPT0gbnVsbCkge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignc3RyaW5nLicgKyBuYW1lICsgJyByZXF1aXJlcyBhIHZhbGlkIHN0cmluZyB0byBzZWFyY2ggYWdhaW5zdC4nKTtcblx0XHR9XG5cblx0XHRjb25zdCBsZW5ndGggPSB0ZXh0Lmxlbmd0aDtcblx0XHRwb3NpdGlvbiA9IHBvc2l0aW9uICE9PSBwb3NpdGlvbiA/IChpc0VuZCA/IGxlbmd0aCA6IDApIDogcG9zaXRpb247XG5cdFx0cmV0dXJuIFt0ZXh0LCBTdHJpbmcoc2VhcmNoKSwgTWF0aC5taW4oTWF0aC5tYXgocG9zaXRpb24sIDApLCBsZW5ndGgpXTtcblx0fTtcblxuXHRmcm9tQ29kZVBvaW50ID0gZnVuY3Rpb24gZnJvbUNvZGVQb2ludCguLi5jb2RlUG9pbnRzOiBudW1iZXJbXSk6IHN0cmluZyB7XG5cdFx0Ly8gQWRhcHRlZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXRoaWFzYnluZW5zL1N0cmluZy5mcm9tQ29kZVBvaW50XG5cdFx0Y29uc3QgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aDtcblx0XHRpZiAoIWxlbmd0aCkge1xuXHRcdFx0cmV0dXJuICcnO1xuXHRcdH1cblxuXHRcdGNvbnN0IGZyb21DaGFyQ29kZSA9IFN0cmluZy5mcm9tQ2hhckNvZGU7XG5cdFx0Y29uc3QgTUFYX1NJWkUgPSAweDQwMDA7XG5cdFx0bGV0IGNvZGVVbml0czogbnVtYmVyW10gPSBbXTtcblx0XHRsZXQgaW5kZXggPSAtMTtcblx0XHRsZXQgcmVzdWx0ID0gJyc7XG5cblx0XHR3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuXHRcdFx0bGV0IGNvZGVQb2ludCA9IE51bWJlcihhcmd1bWVudHNbaW5kZXhdKTtcblxuXHRcdFx0Ly8gQ29kZSBwb2ludHMgbXVzdCBiZSBmaW5pdGUgaW50ZWdlcnMgd2l0aGluIHRoZSB2YWxpZCByYW5nZVxuXHRcdFx0bGV0IGlzVmFsaWQgPVxuXHRcdFx0XHRpc0Zpbml0ZShjb2RlUG9pbnQpICYmIE1hdGguZmxvb3IoY29kZVBvaW50KSA9PT0gY29kZVBvaW50ICYmIGNvZGVQb2ludCA+PSAwICYmIGNvZGVQb2ludCA8PSAweDEwZmZmZjtcblx0XHRcdGlmICghaXNWYWxpZCkge1xuXHRcdFx0XHR0aHJvdyBSYW5nZUVycm9yKCdzdHJpbmcuZnJvbUNvZGVQb2ludDogSW52YWxpZCBjb2RlIHBvaW50ICcgKyBjb2RlUG9pbnQpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoY29kZVBvaW50IDw9IDB4ZmZmZikge1xuXHRcdFx0XHQvLyBCTVAgY29kZSBwb2ludFxuXHRcdFx0XHRjb2RlVW5pdHMucHVzaChjb2RlUG9pbnQpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gQXN0cmFsIGNvZGUgcG9pbnQ7IHNwbGl0IGluIHN1cnJvZ2F0ZSBoYWx2ZXNcblx0XHRcdFx0Ly8gaHR0cHM6Ly9tYXRoaWFzYnluZW5zLmJlL25vdGVzL2phdmFzY3JpcHQtZW5jb2Rpbmcjc3Vycm9nYXRlLWZvcm11bGFlXG5cdFx0XHRcdGNvZGVQb2ludCAtPSAweDEwMDAwO1xuXHRcdFx0XHRsZXQgaGlnaFN1cnJvZ2F0ZSA9IChjb2RlUG9pbnQgPj4gMTApICsgSElHSF9TVVJST0dBVEVfTUlOO1xuXHRcdFx0XHRsZXQgbG93U3Vycm9nYXRlID0gKGNvZGVQb2ludCAlIDB4NDAwKSArIExPV19TVVJST0dBVEVfTUlOO1xuXHRcdFx0XHRjb2RlVW5pdHMucHVzaChoaWdoU3Vycm9nYXRlLCBsb3dTdXJyb2dhdGUpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoaW5kZXggKyAxID09PSBsZW5ndGggfHwgY29kZVVuaXRzLmxlbmd0aCA+IE1BWF9TSVpFKSB7XG5cdFx0XHRcdHJlc3VsdCArPSBmcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgY29kZVVuaXRzKTtcblx0XHRcdFx0Y29kZVVuaXRzLmxlbmd0aCA9IDA7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH07XG5cblx0cmF3ID0gZnVuY3Rpb24gcmF3KGNhbGxTaXRlOiBUZW1wbGF0ZVN0cmluZ3NBcnJheSwgLi4uc3Vic3RpdHV0aW9uczogYW55W10pOiBzdHJpbmcge1xuXHRcdGxldCByYXdTdHJpbmdzID0gY2FsbFNpdGUucmF3O1xuXHRcdGxldCByZXN1bHQgPSAnJztcblx0XHRsZXQgbnVtU3Vic3RpdHV0aW9ucyA9IHN1YnN0aXR1dGlvbnMubGVuZ3RoO1xuXG5cdFx0aWYgKGNhbGxTaXRlID09IG51bGwgfHwgY2FsbFNpdGUucmF3ID09IG51bGwpIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ3N0cmluZy5yYXcgcmVxdWlyZXMgYSB2YWxpZCBjYWxsU2l0ZSBvYmplY3Qgd2l0aCBhIHJhdyB2YWx1ZScpO1xuXHRcdH1cblxuXHRcdGZvciAobGV0IGkgPSAwLCBsZW5ndGggPSByYXdTdHJpbmdzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG5cdFx0XHRyZXN1bHQgKz0gcmF3U3RyaW5nc1tpXSArIChpIDwgbnVtU3Vic3RpdHV0aW9ucyAmJiBpIDwgbGVuZ3RoIC0gMSA/IHN1YnN0aXR1dGlvbnNbaV0gOiAnJyk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fTtcblxuXHRjb2RlUG9pbnRBdCA9IGZ1bmN0aW9uIGNvZGVQb2ludEF0KHRleHQ6IHN0cmluZywgcG9zaXRpb246IG51bWJlciA9IDApOiBudW1iZXIgfCB1bmRlZmluZWQge1xuXHRcdC8vIEFkYXB0ZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vbWF0aGlhc2J5bmVucy9TdHJpbmcucHJvdG90eXBlLmNvZGVQb2ludEF0XG5cdFx0aWYgKHRleHQgPT0gbnVsbCkge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignc3RyaW5nLmNvZGVQb2ludEF0IHJlcXVyaWVzIGEgdmFsaWQgc3RyaW5nLicpO1xuXHRcdH1cblx0XHRjb25zdCBsZW5ndGggPSB0ZXh0Lmxlbmd0aDtcblxuXHRcdGlmIChwb3NpdGlvbiAhPT0gcG9zaXRpb24pIHtcblx0XHRcdHBvc2l0aW9uID0gMDtcblx0XHR9XG5cdFx0aWYgKHBvc2l0aW9uIDwgMCB8fCBwb3NpdGlvbiA+PSBsZW5ndGgpIHtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXG5cdFx0Ly8gR2V0IHRoZSBmaXJzdCBjb2RlIHVuaXRcblx0XHRjb25zdCBmaXJzdCA9IHRleHQuY2hhckNvZGVBdChwb3NpdGlvbik7XG5cdFx0aWYgKGZpcnN0ID49IEhJR0hfU1VSUk9HQVRFX01JTiAmJiBmaXJzdCA8PSBISUdIX1NVUlJPR0FURV9NQVggJiYgbGVuZ3RoID4gcG9zaXRpb24gKyAxKSB7XG5cdFx0XHQvLyBTdGFydCBvZiBhIHN1cnJvZ2F0ZSBwYWlyIChoaWdoIHN1cnJvZ2F0ZSBhbmQgdGhlcmUgaXMgYSBuZXh0IGNvZGUgdW5pdCk7IGNoZWNrIGZvciBsb3cgc3Vycm9nYXRlXG5cdFx0XHQvLyBodHRwczovL21hdGhpYXNieW5lbnMuYmUvbm90ZXMvamF2YXNjcmlwdC1lbmNvZGluZyNzdXJyb2dhdGUtZm9ybXVsYWVcblx0XHRcdGNvbnN0IHNlY29uZCA9IHRleHQuY2hhckNvZGVBdChwb3NpdGlvbiArIDEpO1xuXHRcdFx0aWYgKHNlY29uZCA+PSBMT1dfU1VSUk9HQVRFX01JTiAmJiBzZWNvbmQgPD0gTE9XX1NVUlJPR0FURV9NQVgpIHtcblx0XHRcdFx0cmV0dXJuIChmaXJzdCAtIEhJR0hfU1VSUk9HQVRFX01JTikgKiAweDQwMCArIHNlY29uZCAtIExPV19TVVJST0dBVEVfTUlOICsgMHgxMDAwMDtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGZpcnN0O1xuXHR9O1xuXG5cdGVuZHNXaXRoID0gZnVuY3Rpb24gZW5kc1dpdGgodGV4dDogc3RyaW5nLCBzZWFyY2g6IHN0cmluZywgZW5kUG9zaXRpb24/OiBudW1iZXIpOiBib29sZWFuIHtcblx0XHRpZiAoc2VhcmNoID09PSAnJykge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0aWYgKHR5cGVvZiBlbmRQb3NpdGlvbiA9PT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdGVuZFBvc2l0aW9uID0gdGV4dC5sZW5ndGg7XG5cdFx0fSBlbHNlIGlmIChlbmRQb3NpdGlvbiA9PT0gbnVsbCB8fCBpc05hTihlbmRQb3NpdGlvbikpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRbdGV4dCwgc2VhcmNoLCBlbmRQb3NpdGlvbl0gPSBub3JtYWxpemVTdWJzdHJpbmdBcmdzKCdlbmRzV2l0aCcsIHRleHQsIHNlYXJjaCwgZW5kUG9zaXRpb24sIHRydWUpO1xuXG5cdFx0Y29uc3Qgc3RhcnQgPSBlbmRQb3NpdGlvbiAtIHNlYXJjaC5sZW5ndGg7XG5cdFx0aWYgKHN0YXJ0IDwgMCkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdHJldHVybiB0ZXh0LnNsaWNlKHN0YXJ0LCBlbmRQb3NpdGlvbikgPT09IHNlYXJjaDtcblx0fTtcblxuXHRpbmNsdWRlcyA9IGZ1bmN0aW9uIGluY2x1ZGVzKHRleHQ6IHN0cmluZywgc2VhcmNoOiBzdHJpbmcsIHBvc2l0aW9uOiBudW1iZXIgPSAwKTogYm9vbGVhbiB7XG5cdFx0W3RleHQsIHNlYXJjaCwgcG9zaXRpb25dID0gbm9ybWFsaXplU3Vic3RyaW5nQXJncygnaW5jbHVkZXMnLCB0ZXh0LCBzZWFyY2gsIHBvc2l0aW9uKTtcblx0XHRyZXR1cm4gdGV4dC5pbmRleE9mKHNlYXJjaCwgcG9zaXRpb24pICE9PSAtMTtcblx0fTtcblxuXHRyZXBlYXQgPSBmdW5jdGlvbiByZXBlYXQodGV4dDogc3RyaW5nLCBjb3VudDogbnVtYmVyID0gMCk6IHN0cmluZyB7XG5cdFx0Ly8gQWRhcHRlZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXRoaWFzYnluZW5zL1N0cmluZy5wcm90b3R5cGUucmVwZWF0XG5cdFx0aWYgKHRleHQgPT0gbnVsbCkge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignc3RyaW5nLnJlcGVhdCByZXF1aXJlcyBhIHZhbGlkIHN0cmluZy4nKTtcblx0XHR9XG5cdFx0aWYgKGNvdW50ICE9PSBjb3VudCkge1xuXHRcdFx0Y291bnQgPSAwO1xuXHRcdH1cblx0XHRpZiAoY291bnQgPCAwIHx8IGNvdW50ID09PSBJbmZpbml0eSkge1xuXHRcdFx0dGhyb3cgbmV3IFJhbmdlRXJyb3IoJ3N0cmluZy5yZXBlYXQgcmVxdWlyZXMgYSBub24tbmVnYXRpdmUgZmluaXRlIGNvdW50LicpO1xuXHRcdH1cblxuXHRcdGxldCByZXN1bHQgPSAnJztcblx0XHR3aGlsZSAoY291bnQpIHtcblx0XHRcdGlmIChjb3VudCAlIDIpIHtcblx0XHRcdFx0cmVzdWx0ICs9IHRleHQ7XG5cdFx0XHR9XG5cdFx0XHRpZiAoY291bnQgPiAxKSB7XG5cdFx0XHRcdHRleHQgKz0gdGV4dDtcblx0XHRcdH1cblx0XHRcdGNvdW50ID4+PSAxO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9O1xuXG5cdHN0YXJ0c1dpdGggPSBmdW5jdGlvbiBzdGFydHNXaXRoKHRleHQ6IHN0cmluZywgc2VhcmNoOiBzdHJpbmcsIHBvc2l0aW9uOiBudW1iZXIgPSAwKTogYm9vbGVhbiB7XG5cdFx0c2VhcmNoID0gU3RyaW5nKHNlYXJjaCk7XG5cdFx0W3RleHQsIHNlYXJjaCwgcG9zaXRpb25dID0gbm9ybWFsaXplU3Vic3RyaW5nQXJncygnc3RhcnRzV2l0aCcsIHRleHQsIHNlYXJjaCwgcG9zaXRpb24pO1xuXG5cdFx0Y29uc3QgZW5kID0gcG9zaXRpb24gKyBzZWFyY2gubGVuZ3RoO1xuXHRcdGlmIChlbmQgPiB0ZXh0Lmxlbmd0aCkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdHJldHVybiB0ZXh0LnNsaWNlKHBvc2l0aW9uLCBlbmQpID09PSBzZWFyY2g7XG5cdH07XG59XG5cbmlmIChoYXMoJ2VzMjAxNy1zdHJpbmcnKSkge1xuXHRwYWRFbmQgPSB3cmFwTmF0aXZlKGdsb2JhbC5TdHJpbmcucHJvdG90eXBlLnBhZEVuZCk7XG5cdHBhZFN0YXJ0ID0gd3JhcE5hdGl2ZShnbG9iYWwuU3RyaW5nLnByb3RvdHlwZS5wYWRTdGFydCk7XG59IGVsc2Uge1xuXHRwYWRFbmQgPSBmdW5jdGlvbiBwYWRFbmQodGV4dDogc3RyaW5nLCBtYXhMZW5ndGg6IG51bWJlciwgZmlsbFN0cmluZzogc3RyaW5nID0gJyAnKTogc3RyaW5nIHtcblx0XHRpZiAodGV4dCA9PT0gbnVsbCB8fCB0ZXh0ID09PSB1bmRlZmluZWQpIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ3N0cmluZy5yZXBlYXQgcmVxdWlyZXMgYSB2YWxpZCBzdHJpbmcuJyk7XG5cdFx0fVxuXG5cdFx0aWYgKG1heExlbmd0aCA9PT0gSW5maW5pdHkpIHtcblx0XHRcdHRocm93IG5ldyBSYW5nZUVycm9yKCdzdHJpbmcucGFkRW5kIHJlcXVpcmVzIGEgbm9uLW5lZ2F0aXZlIGZpbml0ZSBjb3VudC4nKTtcblx0XHR9XG5cblx0XHRpZiAobWF4TGVuZ3RoID09PSBudWxsIHx8IG1heExlbmd0aCA9PT0gdW5kZWZpbmVkIHx8IG1heExlbmd0aCA8IDApIHtcblx0XHRcdG1heExlbmd0aCA9IDA7XG5cdFx0fVxuXG5cdFx0bGV0IHN0clRleHQgPSBTdHJpbmcodGV4dCk7XG5cdFx0Y29uc3QgcGFkZGluZyA9IG1heExlbmd0aCAtIHN0clRleHQubGVuZ3RoO1xuXG5cdFx0aWYgKHBhZGRpbmcgPiAwKSB7XG5cdFx0XHRzdHJUZXh0ICs9XG5cdFx0XHRcdHJlcGVhdChmaWxsU3RyaW5nLCBNYXRoLmZsb29yKHBhZGRpbmcgLyBmaWxsU3RyaW5nLmxlbmd0aCkpICtcblx0XHRcdFx0ZmlsbFN0cmluZy5zbGljZSgwLCBwYWRkaW5nICUgZmlsbFN0cmluZy5sZW5ndGgpO1xuXHRcdH1cblxuXHRcdHJldHVybiBzdHJUZXh0O1xuXHR9O1xuXG5cdHBhZFN0YXJ0ID0gZnVuY3Rpb24gcGFkU3RhcnQodGV4dDogc3RyaW5nLCBtYXhMZW5ndGg6IG51bWJlciwgZmlsbFN0cmluZzogc3RyaW5nID0gJyAnKTogc3RyaW5nIHtcblx0XHRpZiAodGV4dCA9PT0gbnVsbCB8fCB0ZXh0ID09PSB1bmRlZmluZWQpIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ3N0cmluZy5yZXBlYXQgcmVxdWlyZXMgYSB2YWxpZCBzdHJpbmcuJyk7XG5cdFx0fVxuXG5cdFx0aWYgKG1heExlbmd0aCA9PT0gSW5maW5pdHkpIHtcblx0XHRcdHRocm93IG5ldyBSYW5nZUVycm9yKCdzdHJpbmcucGFkU3RhcnQgcmVxdWlyZXMgYSBub24tbmVnYXRpdmUgZmluaXRlIGNvdW50LicpO1xuXHRcdH1cblxuXHRcdGlmIChtYXhMZW5ndGggPT09IG51bGwgfHwgbWF4TGVuZ3RoID09PSB1bmRlZmluZWQgfHwgbWF4TGVuZ3RoIDwgMCkge1xuXHRcdFx0bWF4TGVuZ3RoID0gMDtcblx0XHR9XG5cblx0XHRsZXQgc3RyVGV4dCA9IFN0cmluZyh0ZXh0KTtcblx0XHRjb25zdCBwYWRkaW5nID0gbWF4TGVuZ3RoIC0gc3RyVGV4dC5sZW5ndGg7XG5cblx0XHRpZiAocGFkZGluZyA+IDApIHtcblx0XHRcdHN0clRleHQgPVxuXHRcdFx0XHRyZXBlYXQoZmlsbFN0cmluZywgTWF0aC5mbG9vcihwYWRkaW5nIC8gZmlsbFN0cmluZy5sZW5ndGgpKSArXG5cdFx0XHRcdGZpbGxTdHJpbmcuc2xpY2UoMCwgcGFkZGluZyAlIGZpbGxTdHJpbmcubGVuZ3RoKSArXG5cdFx0XHRcdHN0clRleHQ7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHN0clRleHQ7XG5cdH07XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gc3RyaW5nLnRzIiwiaW1wb3J0IGdsb2JhbCBmcm9tICcuLi9nbG9iYWwnO1xuaW1wb3J0IGhhcyBmcm9tICcuL2hhcyc7XG5pbXBvcnQgeyBIYW5kbGUgfSBmcm9tICcuLi9pbnRlcmZhY2VzJztcblxuZnVuY3Rpb24gZXhlY3V0ZVRhc2soaXRlbTogUXVldWVJdGVtIHwgdW5kZWZpbmVkKTogdm9pZCB7XG5cdGlmIChpdGVtICYmIGl0ZW0uaXNBY3RpdmUgJiYgaXRlbS5jYWxsYmFjaykge1xuXHRcdGl0ZW0uY2FsbGJhY2soKTtcblx0fVxufVxuXG5mdW5jdGlvbiBnZXRRdWV1ZUhhbmRsZShpdGVtOiBRdWV1ZUl0ZW0sIGRlc3RydWN0b3I/OiAoLi4uYXJnczogYW55W10pID0+IGFueSk6IEhhbmRsZSB7XG5cdHJldHVybiB7XG5cdFx0ZGVzdHJveTogZnVuY3Rpb24odGhpczogSGFuZGxlKSB7XG5cdFx0XHR0aGlzLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHt9O1xuXHRcdFx0aXRlbS5pc0FjdGl2ZSA9IGZhbHNlO1xuXHRcdFx0aXRlbS5jYWxsYmFjayA9IG51bGw7XG5cblx0XHRcdGlmIChkZXN0cnVjdG9yKSB7XG5cdFx0XHRcdGRlc3RydWN0b3IoKTtcblx0XHRcdH1cblx0XHR9XG5cdH07XG59XG5cbmludGVyZmFjZSBQb3N0TWVzc2FnZUV2ZW50IGV4dGVuZHMgRXZlbnQge1xuXHRzb3VyY2U6IGFueTtcblx0ZGF0YTogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFF1ZXVlSXRlbSB7XG5cdGlzQWN0aXZlOiBib29sZWFuO1xuXHRjYWxsYmFjazogbnVsbCB8ICgoLi4uYXJnczogYW55W10pID0+IGFueSk7XG59XG5cbmxldCBjaGVja01pY3JvVGFza1F1ZXVlOiAoKSA9PiB2b2lkO1xubGV0IG1pY3JvVGFza3M6IFF1ZXVlSXRlbVtdO1xuXG4vKipcbiAqIFNjaGVkdWxlcyBhIGNhbGxiYWNrIHRvIHRoZSBtYWNyb3Rhc2sgcXVldWUuXG4gKlxuICogQHBhcmFtIGNhbGxiYWNrIHRoZSBmdW5jdGlvbiB0byBiZSBxdWV1ZWQgYW5kIGxhdGVyIGV4ZWN1dGVkLlxuICogQHJldHVybnMgQW4gb2JqZWN0IHdpdGggYSBgZGVzdHJveWAgbWV0aG9kIHRoYXQsIHdoZW4gY2FsbGVkLCBwcmV2ZW50cyB0aGUgcmVnaXN0ZXJlZCBjYWxsYmFjayBmcm9tIGV4ZWN1dGluZy5cbiAqL1xuZXhwb3J0IGNvbnN0IHF1ZXVlVGFzayA9IChmdW5jdGlvbigpIHtcblx0bGV0IGRlc3RydWN0b3I6ICguLi5hcmdzOiBhbnlbXSkgPT4gYW55O1xuXHRsZXQgZW5xdWV1ZTogKGl0ZW06IFF1ZXVlSXRlbSkgPT4gdm9pZDtcblxuXHQvLyBTaW5jZSB0aGUgSUUgaW1wbGVtZW50YXRpb24gb2YgYHNldEltbWVkaWF0ZWAgaXMgbm90IGZsYXdsZXNzLCB3ZSB3aWxsIHRlc3QgZm9yIGBwb3N0TWVzc2FnZWAgZmlyc3QuXG5cdGlmIChoYXMoJ3Bvc3RtZXNzYWdlJykpIHtcblx0XHRjb25zdCBxdWV1ZTogUXVldWVJdGVtW10gPSBbXTtcblxuXHRcdGdsb2JhbC5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24oZXZlbnQ6IFBvc3RNZXNzYWdlRXZlbnQpOiB2b2lkIHtcblx0XHRcdC8vIENvbmZpcm0gdGhhdCB0aGUgZXZlbnQgd2FzIHRyaWdnZXJlZCBieSB0aGUgY3VycmVudCB3aW5kb3cgYW5kIGJ5IHRoaXMgcGFydGljdWxhciBpbXBsZW1lbnRhdGlvbi5cblx0XHRcdGlmIChldmVudC5zb3VyY2UgPT09IGdsb2JhbCAmJiBldmVudC5kYXRhID09PSAnZG9qby1xdWV1ZS1tZXNzYWdlJykge1xuXHRcdFx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuXHRcdFx0XHRpZiAocXVldWUubGVuZ3RoKSB7XG5cdFx0XHRcdFx0ZXhlY3V0ZVRhc2socXVldWUuc2hpZnQoKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdGVucXVldWUgPSBmdW5jdGlvbihpdGVtOiBRdWV1ZUl0ZW0pOiB2b2lkIHtcblx0XHRcdHF1ZXVlLnB1c2goaXRlbSk7XG5cdFx0XHRnbG9iYWwucG9zdE1lc3NhZ2UoJ2Rvam8tcXVldWUtbWVzc2FnZScsICcqJyk7XG5cdFx0fTtcblx0fSBlbHNlIGlmIChoYXMoJ3NldGltbWVkaWF0ZScpKSB7XG5cdFx0ZGVzdHJ1Y3RvciA9IGdsb2JhbC5jbGVhckltbWVkaWF0ZTtcblx0XHRlbnF1ZXVlID0gZnVuY3Rpb24oaXRlbTogUXVldWVJdGVtKTogYW55IHtcblx0XHRcdHJldHVybiBzZXRJbW1lZGlhdGUoZXhlY3V0ZVRhc2suYmluZChudWxsLCBpdGVtKSk7XG5cdFx0fTtcblx0fSBlbHNlIHtcblx0XHRkZXN0cnVjdG9yID0gZ2xvYmFsLmNsZWFyVGltZW91dDtcblx0XHRlbnF1ZXVlID0gZnVuY3Rpb24oaXRlbTogUXVldWVJdGVtKTogYW55IHtcblx0XHRcdHJldHVybiBzZXRUaW1lb3V0KGV4ZWN1dGVUYXNrLmJpbmQobnVsbCwgaXRlbSksIDApO1xuXHRcdH07XG5cdH1cblxuXHRmdW5jdGlvbiBxdWV1ZVRhc2soY2FsbGJhY2s6ICguLi5hcmdzOiBhbnlbXSkgPT4gYW55KTogSGFuZGxlIHtcblx0XHRjb25zdCBpdGVtOiBRdWV1ZUl0ZW0gPSB7XG5cdFx0XHRpc0FjdGl2ZTogdHJ1ZSxcblx0XHRcdGNhbGxiYWNrOiBjYWxsYmFja1xuXHRcdH07XG5cdFx0Y29uc3QgaWQ6IGFueSA9IGVucXVldWUoaXRlbSk7XG5cblx0XHRyZXR1cm4gZ2V0UXVldWVIYW5kbGUoXG5cdFx0XHRpdGVtLFxuXHRcdFx0ZGVzdHJ1Y3RvciAmJlxuXHRcdFx0XHRmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRkZXN0cnVjdG9yKGlkKTtcblx0XHRcdFx0fVxuXHRcdCk7XG5cdH1cblxuXHQvLyBUT0RPOiBVc2UgYXNwZWN0LmJlZm9yZSB3aGVuIGl0IGlzIGF2YWlsYWJsZS5cblx0cmV0dXJuIGhhcygnbWljcm90YXNrcycpXG5cdFx0PyBxdWV1ZVRhc2tcblx0XHQ6IGZ1bmN0aW9uKGNhbGxiYWNrOiAoLi4uYXJnczogYW55W10pID0+IGFueSk6IEhhbmRsZSB7XG5cdFx0XHRcdGNoZWNrTWljcm9UYXNrUXVldWUoKTtcblx0XHRcdFx0cmV0dXJuIHF1ZXVlVGFzayhjYWxsYmFjayk7XG5cdFx0ICB9O1xufSkoKTtcblxuLy8gV2hlbiBubyBtZWNoYW5pc20gZm9yIHJlZ2lzdGVyaW5nIG1pY3JvdGFza3MgaXMgZXhwb3NlZCBieSB0aGUgZW52aXJvbm1lbnQsIG1pY3JvdGFza3Mgd2lsbFxuLy8gYmUgcXVldWVkIGFuZCB0aGVuIGV4ZWN1dGVkIGluIGEgc2luZ2xlIG1hY3JvdGFzayBiZWZvcmUgdGhlIG90aGVyIG1hY3JvdGFza3MgYXJlIGV4ZWN1dGVkLlxuaWYgKCFoYXMoJ21pY3JvdGFza3MnKSkge1xuXHRsZXQgaXNNaWNyb1Rhc2tRdWV1ZWQgPSBmYWxzZTtcblxuXHRtaWNyb1Rhc2tzID0gW107XG5cdGNoZWNrTWljcm9UYXNrUXVldWUgPSBmdW5jdGlvbigpOiB2b2lkIHtcblx0XHRpZiAoIWlzTWljcm9UYXNrUXVldWVkKSB7XG5cdFx0XHRpc01pY3JvVGFza1F1ZXVlZCA9IHRydWU7XG5cdFx0XHRxdWV1ZVRhc2soZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGlzTWljcm9UYXNrUXVldWVkID0gZmFsc2U7XG5cblx0XHRcdFx0aWYgKG1pY3JvVGFza3MubGVuZ3RoKSB7XG5cdFx0XHRcdFx0bGV0IGl0ZW06IFF1ZXVlSXRlbSB8IHVuZGVmaW5lZDtcblx0XHRcdFx0XHR3aGlsZSAoKGl0ZW0gPSBtaWNyb1Rhc2tzLnNoaWZ0KCkpKSB7XG5cdFx0XHRcdFx0XHRleGVjdXRlVGFzayhpdGVtKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0fTtcbn1cblxuLyoqXG4gKiBTY2hlZHVsZXMgYW4gYW5pbWF0aW9uIHRhc2sgd2l0aCBgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZWAgaWYgaXQgZXhpc3RzLCBvciB3aXRoIGBxdWV1ZVRhc2tgIG90aGVyd2lzZS5cbiAqXG4gKiBTaW5jZSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUncyBiZWhhdmlvciBkb2VzIG5vdCBtYXRjaCB0aGF0IGV4cGVjdGVkIGZyb20gYHF1ZXVlVGFza2AsIGl0IGlzIG5vdCB1c2VkIHRoZXJlLlxuICogSG93ZXZlciwgYXQgdGltZXMgaXQgbWFrZXMgbW9yZSBzZW5zZSB0byBkZWxlZ2F0ZSB0byByZXF1ZXN0QW5pbWF0aW9uRnJhbWU7IGhlbmNlIHRoZSBmb2xsb3dpbmcgbWV0aG9kLlxuICpcbiAqIEBwYXJhbSBjYWxsYmFjayB0aGUgZnVuY3Rpb24gdG8gYmUgcXVldWVkIGFuZCBsYXRlciBleGVjdXRlZC5cbiAqIEByZXR1cm5zIEFuIG9iamVjdCB3aXRoIGEgYGRlc3Ryb3lgIG1ldGhvZCB0aGF0LCB3aGVuIGNhbGxlZCwgcHJldmVudHMgdGhlIHJlZ2lzdGVyZWQgY2FsbGJhY2sgZnJvbSBleGVjdXRpbmcuXG4gKi9cbmV4cG9ydCBjb25zdCBxdWV1ZUFuaW1hdGlvblRhc2sgPSAoZnVuY3Rpb24oKSB7XG5cdGlmICghaGFzKCdyYWYnKSkge1xuXHRcdHJldHVybiBxdWV1ZVRhc2s7XG5cdH1cblxuXHRmdW5jdGlvbiBxdWV1ZUFuaW1hdGlvblRhc2soY2FsbGJhY2s6ICguLi5hcmdzOiBhbnlbXSkgPT4gYW55KTogSGFuZGxlIHtcblx0XHRjb25zdCBpdGVtOiBRdWV1ZUl0ZW0gPSB7XG5cdFx0XHRpc0FjdGl2ZTogdHJ1ZSxcblx0XHRcdGNhbGxiYWNrOiBjYWxsYmFja1xuXHRcdH07XG5cdFx0Y29uc3QgcmFmSWQ6IG51bWJlciA9IHJlcXVlc3RBbmltYXRpb25GcmFtZShleGVjdXRlVGFzay5iaW5kKG51bGwsIGl0ZW0pKTtcblxuXHRcdHJldHVybiBnZXRRdWV1ZUhhbmRsZShpdGVtLCBmdW5jdGlvbigpIHtcblx0XHRcdGNhbmNlbEFuaW1hdGlvbkZyYW1lKHJhZklkKTtcblx0XHR9KTtcblx0fVxuXG5cdC8vIFRPRE86IFVzZSBhc3BlY3QuYmVmb3JlIHdoZW4gaXQgaXMgYXZhaWxhYmxlLlxuXHRyZXR1cm4gaGFzKCdtaWNyb3Rhc2tzJylcblx0XHQ/IHF1ZXVlQW5pbWF0aW9uVGFza1xuXHRcdDogZnVuY3Rpb24oY2FsbGJhY2s6ICguLi5hcmdzOiBhbnlbXSkgPT4gYW55KTogSGFuZGxlIHtcblx0XHRcdFx0Y2hlY2tNaWNyb1Rhc2tRdWV1ZSgpO1xuXHRcdFx0XHRyZXR1cm4gcXVldWVBbmltYXRpb25UYXNrKGNhbGxiYWNrKTtcblx0XHQgIH07XG59KSgpO1xuXG4vKipcbiAqIFNjaGVkdWxlcyBhIGNhbGxiYWNrIHRvIHRoZSBtaWNyb3Rhc2sgcXVldWUuXG4gKlxuICogQW55IGNhbGxiYWNrcyByZWdpc3RlcmVkIHdpdGggYHF1ZXVlTWljcm9UYXNrYCB3aWxsIGJlIGV4ZWN1dGVkIGJlZm9yZSB0aGUgbmV4dCBtYWNyb3Rhc2suIElmIG5vIG5hdGl2ZVxuICogbWVjaGFuaXNtIGZvciBzY2hlZHVsaW5nIG1hY3JvdGFza3MgaXMgZXhwb3NlZCwgdGhlbiBhbnkgY2FsbGJhY2tzIHdpbGwgYmUgZmlyZWQgYmVmb3JlIGFueSBtYWNyb3Rhc2tcbiAqIHJlZ2lzdGVyZWQgd2l0aCBgcXVldWVUYXNrYCBvciBgcXVldWVBbmltYXRpb25UYXNrYC5cbiAqXG4gKiBAcGFyYW0gY2FsbGJhY2sgdGhlIGZ1bmN0aW9uIHRvIGJlIHF1ZXVlZCBhbmQgbGF0ZXIgZXhlY3V0ZWQuXG4gKiBAcmV0dXJucyBBbiBvYmplY3Qgd2l0aCBhIGBkZXN0cm95YCBtZXRob2QgdGhhdCwgd2hlbiBjYWxsZWQsIHByZXZlbnRzIHRoZSByZWdpc3RlcmVkIGNhbGxiYWNrIGZyb20gZXhlY3V0aW5nLlxuICovXG5leHBvcnQgbGV0IHF1ZXVlTWljcm9UYXNrID0gKGZ1bmN0aW9uKCkge1xuXHRsZXQgZW5xdWV1ZTogKGl0ZW06IFF1ZXVlSXRlbSkgPT4gdm9pZDtcblxuXHRpZiAoaGFzKCdob3N0LW5vZGUnKSkge1xuXHRcdGVucXVldWUgPSBmdW5jdGlvbihpdGVtOiBRdWV1ZUl0ZW0pOiB2b2lkIHtcblx0XHRcdGdsb2JhbC5wcm9jZXNzLm5leHRUaWNrKGV4ZWN1dGVUYXNrLmJpbmQobnVsbCwgaXRlbSkpO1xuXHRcdH07XG5cdH0gZWxzZSBpZiAoaGFzKCdlczYtcHJvbWlzZScpKSB7XG5cdFx0ZW5xdWV1ZSA9IGZ1bmN0aW9uKGl0ZW06IFF1ZXVlSXRlbSk6IHZvaWQge1xuXHRcdFx0Z2xvYmFsLlByb21pc2UucmVzb2x2ZShpdGVtKS50aGVuKGV4ZWN1dGVUYXNrKTtcblx0XHR9O1xuXHR9IGVsc2UgaWYgKGhhcygnZG9tLW11dGF0aW9ub2JzZXJ2ZXInKSkge1xuXHRcdC8qIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTp2YXJpYWJsZS1uYW1lICovXG5cdFx0Y29uc3QgSG9zdE11dGF0aW9uT2JzZXJ2ZXIgPSBnbG9iYWwuTXV0YXRpb25PYnNlcnZlciB8fCBnbG9iYWwuV2ViS2l0TXV0YXRpb25PYnNlcnZlcjtcblx0XHRjb25zdCBub2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0Y29uc3QgcXVldWU6IFF1ZXVlSXRlbVtdID0gW107XG5cdFx0Y29uc3Qgb2JzZXJ2ZXIgPSBuZXcgSG9zdE11dGF0aW9uT2JzZXJ2ZXIoZnVuY3Rpb24oKTogdm9pZCB7XG5cdFx0XHR3aGlsZSAocXVldWUubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRjb25zdCBpdGVtID0gcXVldWUuc2hpZnQoKTtcblx0XHRcdFx0aWYgKGl0ZW0gJiYgaXRlbS5pc0FjdGl2ZSAmJiBpdGVtLmNhbGxiYWNrKSB7XG5cdFx0XHRcdFx0aXRlbS5jYWxsYmFjaygpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRvYnNlcnZlci5vYnNlcnZlKG5vZGUsIHsgYXR0cmlidXRlczogdHJ1ZSB9KTtcblxuXHRcdGVucXVldWUgPSBmdW5jdGlvbihpdGVtOiBRdWV1ZUl0ZW0pOiB2b2lkIHtcblx0XHRcdHF1ZXVlLnB1c2goaXRlbSk7XG5cdFx0XHRub2RlLnNldEF0dHJpYnV0ZSgncXVldWVTdGF0dXMnLCAnMScpO1xuXHRcdH07XG5cdH0gZWxzZSB7XG5cdFx0ZW5xdWV1ZSA9IGZ1bmN0aW9uKGl0ZW06IFF1ZXVlSXRlbSk6IHZvaWQge1xuXHRcdFx0Y2hlY2tNaWNyb1Rhc2tRdWV1ZSgpO1xuXHRcdFx0bWljcm9UYXNrcy5wdXNoKGl0ZW0pO1xuXHRcdH07XG5cdH1cblxuXHRyZXR1cm4gZnVuY3Rpb24oY2FsbGJhY2s6ICguLi5hcmdzOiBhbnlbXSkgPT4gYW55KTogSGFuZGxlIHtcblx0XHRjb25zdCBpdGVtOiBRdWV1ZUl0ZW0gPSB7XG5cdFx0XHRpc0FjdGl2ZTogdHJ1ZSxcblx0XHRcdGNhbGxiYWNrOiBjYWxsYmFja1xuXHRcdH07XG5cblx0XHRlbnF1ZXVlKGl0ZW0pO1xuXG5cdFx0cmV0dXJuIGdldFF1ZXVlSGFuZGxlKGl0ZW0pO1xuXHR9O1xufSkoKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyBxdWV1ZS50cyIsImltcG9ydCB7IEV2ZW50ZWQsIEV2ZW50T2JqZWN0IH0gZnJvbSAnLi4vY29yZS9FdmVudGVkJztcblxuZXhwb3J0IHR5cGUgSW5qZWN0b3JFdmVudE1hcCA9IHtcblx0aW52YWxpZGF0ZTogRXZlbnRPYmplY3Q8J2ludmFsaWRhdGUnPjtcbn07XG5cbmV4cG9ydCBjbGFzcyBJbmplY3RvcjxUID0gYW55PiBleHRlbmRzIEV2ZW50ZWQ8SW5qZWN0b3JFdmVudE1hcD4ge1xuXHRwcml2YXRlIF9wYXlsb2FkOiBUO1xuXHRwcml2YXRlIF9pbnZhbGlkYXRvcjogdW5kZWZpbmVkIHwgKCgpID0+IHZvaWQpO1xuXG5cdGNvbnN0cnVjdG9yKHBheWxvYWQ6IFQpIHtcblx0XHRzdXBlcigpO1xuXHRcdHRoaXMuX3BheWxvYWQgPSBwYXlsb2FkO1xuXHR9XG5cblx0cHVibGljIHNldEludmFsaWRhdG9yKGludmFsaWRhdG9yOiAoKSA9PiB2b2lkKSB7XG5cdFx0dGhpcy5faW52YWxpZGF0b3IgPSBpbnZhbGlkYXRvcjtcblx0fVxuXG5cdHB1YmxpYyBnZXQoKTogVCB7XG5cdFx0cmV0dXJuIHRoaXMuX3BheWxvYWQ7XG5cdH1cblxuXHRwdWJsaWMgc2V0KHBheWxvYWQ6IFQpOiB2b2lkIHtcblx0XHR0aGlzLl9wYXlsb2FkID0gcGF5bG9hZDtcblx0XHRpZiAodGhpcy5faW52YWxpZGF0b3IpIHtcblx0XHRcdHRoaXMuX2ludmFsaWRhdG9yKCk7XG5cdFx0fVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEluamVjdG9yO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIEluamVjdG9yLnRzIiwiaW1wb3J0IHsgRXZlbnRlZCwgRXZlbnRPYmplY3QgfSBmcm9tICcuLi9jb3JlL0V2ZW50ZWQnO1xuaW1wb3J0IE1hcCBmcm9tICcuLi9zaGltL01hcCc7XG5pbXBvcnQgeyBOb2RlSGFuZGxlckludGVyZmFjZSB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5cbi8qKlxuICogRW51bSB0byBpZGVudGlmeSB0aGUgdHlwZSBvZiBldmVudC5cbiAqIExpc3RlbmluZyB0byAnUHJvamVjdG9yJyB3aWxsIG5vdGlmeSB3aGVuIHByb2plY3RvciBpcyBjcmVhdGVkIG9yIHVwZGF0ZWRcbiAqIExpc3RlbmluZyB0byAnV2lkZ2V0JyB3aWxsIG5vdGlmeSB3aGVuIHdpZGdldCByb290IGlzIGNyZWF0ZWQgb3IgdXBkYXRlZFxuICovXG5leHBvcnQgZW51bSBOb2RlRXZlbnRUeXBlIHtcblx0UHJvamVjdG9yID0gJ1Byb2plY3RvcicsXG5cdFdpZGdldCA9ICdXaWRnZXQnXG59XG5cbmV4cG9ydCB0eXBlIE5vZGVIYW5kbGVyRXZlbnRNYXAgPSB7XG5cdFByb2plY3RvcjogRXZlbnRPYmplY3Q8Tm9kZUV2ZW50VHlwZS5Qcm9qZWN0b3I+O1xuXHRXaWRnZXQ6IEV2ZW50T2JqZWN0PE5vZGVFdmVudFR5cGUuV2lkZ2V0Pjtcbn07XG5cbmV4cG9ydCBjbGFzcyBOb2RlSGFuZGxlciBleHRlbmRzIEV2ZW50ZWQ8Tm9kZUhhbmRsZXJFdmVudE1hcD4gaW1wbGVtZW50cyBOb2RlSGFuZGxlckludGVyZmFjZSB7XG5cdHByaXZhdGUgX25vZGVNYXAgPSBuZXcgTWFwPHN0cmluZywgRWxlbWVudD4oKTtcblxuXHRwdWJsaWMgZ2V0KGtleTogc3RyaW5nKTogRWxlbWVudCB8IHVuZGVmaW5lZCB7XG5cdFx0cmV0dXJuIHRoaXMuX25vZGVNYXAuZ2V0KGtleSk7XG5cdH1cblxuXHRwdWJsaWMgaGFzKGtleTogc3RyaW5nKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMuX25vZGVNYXAuaGFzKGtleSk7XG5cdH1cblxuXHRwdWJsaWMgYWRkKGVsZW1lbnQ6IEVsZW1lbnQsIGtleTogc3RyaW5nKTogdm9pZCB7XG5cdFx0dGhpcy5fbm9kZU1hcC5zZXQoa2V5LCBlbGVtZW50KTtcblx0XHR0aGlzLmVtaXQoeyB0eXBlOiBrZXkgfSk7XG5cdH1cblxuXHRwdWJsaWMgYWRkUm9vdCgpOiB2b2lkIHtcblx0XHR0aGlzLmVtaXQoeyB0eXBlOiBOb2RlRXZlbnRUeXBlLldpZGdldCB9KTtcblx0fVxuXG5cdHB1YmxpYyBhZGRQcm9qZWN0b3IoKTogdm9pZCB7XG5cdFx0dGhpcy5lbWl0KHsgdHlwZTogTm9kZUV2ZW50VHlwZS5Qcm9qZWN0b3IgfSk7XG5cdH1cblxuXHRwdWJsaWMgY2xlYXIoKTogdm9pZCB7XG5cdFx0dGhpcy5fbm9kZU1hcC5jbGVhcigpO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE5vZGVIYW5kbGVyO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIE5vZGVIYW5kbGVyLnRzIiwiaW1wb3J0IFByb21pc2UgZnJvbSAnLi4vc2hpbS9Qcm9taXNlJztcbmltcG9ydCBNYXAgZnJvbSAnLi4vc2hpbS9NYXAnO1xuaW1wb3J0IHsgRXZlbnRlZCwgRXZlbnRPYmplY3QgfSBmcm9tICcuLi9jb3JlL0V2ZW50ZWQnO1xuaW1wb3J0IHtcblx0Q29uc3RydWN0b3IsXG5cdEluamVjdG9yRmFjdG9yeSxcblx0SW5qZWN0b3JJdGVtLFxuXHRSZWdpc3RyeUxhYmVsLFxuXHRXaWRnZXRCYXNlQ29uc3RydWN0b3IsXG5cdFdpZGdldEJhc2VJbnRlcmZhY2UsXG5cdEVTTURlZmF1bHRXaWRnZXRCYXNlLFxuXHRXaWRnZXRCYXNlQ29uc3RydWN0b3JGdW5jdGlvbixcblx0RVNNRGVmYXVsdFdpZGdldEJhc2VGdW5jdGlvblxufSBmcm9tICcuL2ludGVyZmFjZXMnO1xuXG5leHBvcnQgdHlwZSBSZWdpc3RyeUl0ZW0gPVxuXHR8IFdpZGdldEJhc2VDb25zdHJ1Y3RvclxuXHR8IFByb21pc2U8V2lkZ2V0QmFzZUNvbnN0cnVjdG9yPlxuXHR8IFdpZGdldEJhc2VDb25zdHJ1Y3RvckZ1bmN0aW9uXG5cdHwgRVNNRGVmYXVsdFdpZGdldEJhc2VGdW5jdGlvbjtcblxuLyoqXG4gKiBXaWRnZXQgYmFzZSB0eXBlXG4gKi9cbmV4cG9ydCBjb25zdCBXSURHRVRfQkFTRV9UWVBFID0gJ19fd2lkZ2V0X2Jhc2VfdHlwZSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVnaXN0cnlFdmVudE9iamVjdCBleHRlbmRzIEV2ZW50T2JqZWN0PFJlZ2lzdHJ5TGFiZWw+IHtcblx0YWN0aW9uOiBzdHJpbmc7XG5cdGl0ZW06IFdpZGdldEJhc2VDb25zdHJ1Y3RvciB8IEluamVjdG9ySXRlbTtcbn1cbi8qKlxuICogV2lkZ2V0IFJlZ2lzdHJ5IEludGVyZmFjZVxuICovXG5leHBvcnQgaW50ZXJmYWNlIFJlZ2lzdHJ5SW50ZXJmYWNlIHtcblx0LyoqXG5cdCAqIERlZmluZSBhIFdpZGdldFJlZ2lzdHJ5SXRlbSBhZ2FpbnN0IGEgbGFiZWxcblx0ICpcblx0ICogQHBhcmFtIGxhYmVsIFRoZSBsYWJlbCBvZiB0aGUgd2lkZ2V0IHRvIHJlZ2lzdGVyXG5cdCAqIEBwYXJhbSByZWdpc3RyeUl0ZW0gVGhlIHJlZ2lzdHJ5IGl0ZW0gdG8gZGVmaW5lXG5cdCAqL1xuXHRkZWZpbmUobGFiZWw6IFJlZ2lzdHJ5TGFiZWwsIHJlZ2lzdHJ5SXRlbTogUmVnaXN0cnlJdGVtKTogdm9pZDtcblxuXHQvKipcblx0ICogUmV0dXJuIGEgUmVnaXN0cnlJdGVtIGZvciB0aGUgZ2l2ZW4gbGFiZWwsIG51bGwgaWYgYW4gZW50cnkgZG9lc24ndCBleGlzdFxuXHQgKlxuXHQgKiBAcGFyYW0gd2lkZ2V0TGFiZWwgVGhlIGxhYmVsIG9mIHRoZSB3aWRnZXQgdG8gcmV0dXJuXG5cdCAqIEByZXR1cm5zIFRoZSBSZWdpc3RyeUl0ZW0gZm9yIHRoZSB3aWRnZXRMYWJlbCwgYG51bGxgIGlmIG5vIGVudHJ5IGV4aXN0c1xuXHQgKi9cblx0Z2V0PFQgZXh0ZW5kcyBXaWRnZXRCYXNlSW50ZXJmYWNlID0gV2lkZ2V0QmFzZUludGVyZmFjZT4obGFiZWw6IFJlZ2lzdHJ5TGFiZWwpOiBDb25zdHJ1Y3RvcjxUPiB8IG51bGw7XG5cblx0LyoqXG5cdCAqIFJldHVybnMgYSBib29sZWFuIGlmIGFuIGVudHJ5IGZvciB0aGUgbGFiZWwgZXhpc3RzXG5cdCAqXG5cdCAqIEBwYXJhbSB3aWRnZXRMYWJlbCBUaGUgbGFiZWwgdG8gc2VhcmNoIGZvclxuXHQgKiBAcmV0dXJucyBib29sZWFuIGluZGljYXRpbmcgaWYgYSB3aWRnZXQgcmVnaXN0cnkgaXRlbSBleGlzdHNcblx0ICovXG5cdGhhcyhsYWJlbDogUmVnaXN0cnlMYWJlbCk6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIERlZmluZSBhbiBJbmplY3RvciBhZ2FpbnN0IGEgbGFiZWxcblx0ICpcblx0ICogQHBhcmFtIGxhYmVsIFRoZSBsYWJlbCBvZiB0aGUgaW5qZWN0b3IgdG8gcmVnaXN0ZXJcblx0ICogQHBhcmFtIHJlZ2lzdHJ5SXRlbSBUaGUgaW5qZWN0b3IgZmFjdG9yeVxuXHQgKi9cblx0ZGVmaW5lSW5qZWN0b3IobGFiZWw6IFJlZ2lzdHJ5TGFiZWwsIGluamVjdG9yRmFjdG9yeTogSW5qZWN0b3JGYWN0b3J5KTogdm9pZDtcblxuXHQvKipcblx0ICogUmV0dXJuIGFuIEluamVjdG9yIHJlZ2lzdHJ5IGl0ZW0gZm9yIHRoZSBnaXZlbiBsYWJlbCwgbnVsbCBpZiBhbiBlbnRyeSBkb2Vzbid0IGV4aXN0XG5cdCAqXG5cdCAqIEBwYXJhbSBsYWJlbCBUaGUgbGFiZWwgb2YgdGhlIGluamVjdG9yIHRvIHJldHVyblxuXHQgKiBAcmV0dXJucyBUaGUgUmVnaXN0cnlJdGVtIGZvciB0aGUgd2lkZ2V0TGFiZWwsIGBudWxsYCBpZiBubyBlbnRyeSBleGlzdHNcblx0ICovXG5cdGdldEluamVjdG9yPFQ+KGxhYmVsOiBSZWdpc3RyeUxhYmVsKTogSW5qZWN0b3JJdGVtPFQ+IHwgbnVsbDtcblxuXHQvKipcblx0ICogUmV0dXJucyBhIGJvb2xlYW4gaWYgYW4gaW5qZWN0b3IgZm9yIHRoZSBsYWJlbCBleGlzdHNcblx0ICpcblx0ICogQHBhcmFtIHdpZGdldExhYmVsIFRoZSBsYWJlbCB0byBzZWFyY2ggZm9yXG5cdCAqIEByZXR1cm5zIGJvb2xlYW4gaW5kaWNhdGluZyBpZiBhIGluamVjdG9yIHJlZ2lzdHJ5IGl0ZW0gZXhpc3RzXG5cdCAqL1xuXHRoYXNJbmplY3RvcihsYWJlbDogUmVnaXN0cnlMYWJlbCk6IGJvb2xlYW47XG59XG5cbi8qKlxuICogQ2hlY2tzIGlzIHRoZSBpdGVtIGlzIGEgc3ViY2xhc3Mgb2YgV2lkZ2V0QmFzZSAob3IgYSBXaWRnZXRCYXNlKVxuICpcbiAqIEBwYXJhbSBpdGVtIHRoZSBpdGVtIHRvIGNoZWNrXG4gKiBAcmV0dXJucyB0cnVlL2ZhbHNlIGluZGljYXRpbmcgaWYgdGhlIGl0ZW0gaXMgYSBXaWRnZXRCYXNlQ29uc3RydWN0b3JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzV2lkZ2V0QmFzZUNvbnN0cnVjdG9yPFQgZXh0ZW5kcyBXaWRnZXRCYXNlSW50ZXJmYWNlPihpdGVtOiBhbnkpOiBpdGVtIGlzIENvbnN0cnVjdG9yPFQ+IHtcblx0cmV0dXJuIEJvb2xlYW4oaXRlbSAmJiBpdGVtLl90eXBlID09PSBXSURHRVRfQkFTRV9UWVBFKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzV2lkZ2V0Q29uc3RydWN0b3JEZWZhdWx0RXhwb3J0PFQ+KGl0ZW06IGFueSk6IGl0ZW0gaXMgRVNNRGVmYXVsdFdpZGdldEJhc2U8VD4ge1xuXHRyZXR1cm4gQm9vbGVhbihcblx0XHRpdGVtICYmXG5cdFx0XHRpdGVtLmhhc093blByb3BlcnR5KCdfX2VzTW9kdWxlJykgJiZcblx0XHRcdGl0ZW0uaGFzT3duUHJvcGVydHkoJ2RlZmF1bHQnKSAmJlxuXHRcdFx0aXNXaWRnZXRCYXNlQ29uc3RydWN0b3IoaXRlbS5kZWZhdWx0KVxuXHQpO1xufVxuXG4vKipcbiAqIFRoZSBSZWdpc3RyeSBpbXBsZW1lbnRhdGlvblxuICovXG5leHBvcnQgY2xhc3MgUmVnaXN0cnkgZXh0ZW5kcyBFdmVudGVkPHt9LCBSZWdpc3RyeUxhYmVsLCBSZWdpc3RyeUV2ZW50T2JqZWN0PiBpbXBsZW1lbnRzIFJlZ2lzdHJ5SW50ZXJmYWNlIHtcblx0LyoqXG5cdCAqIGludGVybmFsIG1hcCBvZiBsYWJlbHMgYW5kIFJlZ2lzdHJ5SXRlbVxuXHQgKi9cblx0cHJpdmF0ZSBfd2lkZ2V0UmVnaXN0cnk6IE1hcDxSZWdpc3RyeUxhYmVsLCBSZWdpc3RyeUl0ZW0+IHwgdW5kZWZpbmVkO1xuXG5cdHByaXZhdGUgX2luamVjdG9yUmVnaXN0cnk6IE1hcDxSZWdpc3RyeUxhYmVsLCBJbmplY3Rvckl0ZW0+IHwgdW5kZWZpbmVkO1xuXG5cdC8qKlxuXHQgKiBFbWl0IGxvYWRlZCBldmVudCBmb3IgcmVnaXN0cnkgbGFiZWxcblx0ICovXG5cdHByaXZhdGUgZW1pdExvYWRlZEV2ZW50KHdpZGdldExhYmVsOiBSZWdpc3RyeUxhYmVsLCBpdGVtOiBXaWRnZXRCYXNlQ29uc3RydWN0b3IgfCBJbmplY3Rvckl0ZW0pOiB2b2lkIHtcblx0XHR0aGlzLmVtaXQoe1xuXHRcdFx0dHlwZTogd2lkZ2V0TGFiZWwsXG5cdFx0XHRhY3Rpb246ICdsb2FkZWQnLFxuXHRcdFx0aXRlbVxuXHRcdH0pO1xuXHR9XG5cblx0cHVibGljIGRlZmluZShsYWJlbDogUmVnaXN0cnlMYWJlbCwgaXRlbTogUmVnaXN0cnlJdGVtKTogdm9pZCB7XG5cdFx0aWYgKHRoaXMuX3dpZGdldFJlZ2lzdHJ5ID09PSB1bmRlZmluZWQpIHtcblx0XHRcdHRoaXMuX3dpZGdldFJlZ2lzdHJ5ID0gbmV3IE1hcCgpO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLl93aWRnZXRSZWdpc3RyeS5oYXMobGFiZWwpKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoYHdpZGdldCBoYXMgYWxyZWFkeSBiZWVuIHJlZ2lzdGVyZWQgZm9yICcke2xhYmVsLnRvU3RyaW5nKCl9J2ApO1xuXHRcdH1cblxuXHRcdHRoaXMuX3dpZGdldFJlZ2lzdHJ5LnNldChsYWJlbCwgaXRlbSk7XG5cblx0XHRpZiAoaXRlbSBpbnN0YW5jZW9mIFByb21pc2UpIHtcblx0XHRcdGl0ZW0udGhlbihcblx0XHRcdFx0KHdpZGdldEN0b3IpID0+IHtcblx0XHRcdFx0XHR0aGlzLl93aWRnZXRSZWdpc3RyeSEuc2V0KGxhYmVsLCB3aWRnZXRDdG9yKTtcblx0XHRcdFx0XHR0aGlzLmVtaXRMb2FkZWRFdmVudChsYWJlbCwgd2lkZ2V0Q3Rvcik7XG5cdFx0XHRcdFx0cmV0dXJuIHdpZGdldEN0b3I7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdChlcnJvcikgPT4ge1xuXHRcdFx0XHRcdHRocm93IGVycm9yO1xuXHRcdFx0XHR9XG5cdFx0XHQpO1xuXHRcdH0gZWxzZSBpZiAoaXNXaWRnZXRCYXNlQ29uc3RydWN0b3IoaXRlbSkpIHtcblx0XHRcdHRoaXMuZW1pdExvYWRlZEV2ZW50KGxhYmVsLCBpdGVtKTtcblx0XHR9XG5cdH1cblxuXHRwdWJsaWMgZGVmaW5lSW5qZWN0b3IobGFiZWw6IFJlZ2lzdHJ5TGFiZWwsIGluamVjdG9yRmFjdG9yeTogSW5qZWN0b3JGYWN0b3J5KTogdm9pZCB7XG5cdFx0aWYgKHRoaXMuX2luamVjdG9yUmVnaXN0cnkgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0dGhpcy5faW5qZWN0b3JSZWdpc3RyeSA9IG5ldyBNYXAoKTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5faW5qZWN0b3JSZWdpc3RyeS5oYXMobGFiZWwpKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoYGluamVjdG9yIGhhcyBhbHJlYWR5IGJlZW4gcmVnaXN0ZXJlZCBmb3IgJyR7bGFiZWwudG9TdHJpbmcoKX0nYCk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgaW52YWxpZGF0b3IgPSBuZXcgRXZlbnRlZCgpO1xuXG5cdFx0Y29uc3QgaW5qZWN0b3JJdGVtOiBJbmplY3Rvckl0ZW0gPSB7XG5cdFx0XHRpbmplY3RvcjogaW5qZWN0b3JGYWN0b3J5KCgpID0+IGludmFsaWRhdG9yLmVtaXQoeyB0eXBlOiAnaW52YWxpZGF0ZScgfSkpLFxuXHRcdFx0aW52YWxpZGF0b3Jcblx0XHR9O1xuXG5cdFx0dGhpcy5faW5qZWN0b3JSZWdpc3RyeS5zZXQobGFiZWwsIGluamVjdG9ySXRlbSk7XG5cdFx0dGhpcy5lbWl0TG9hZGVkRXZlbnQobGFiZWwsIGluamVjdG9ySXRlbSk7XG5cdH1cblxuXHRwdWJsaWMgZ2V0PFQgZXh0ZW5kcyBXaWRnZXRCYXNlSW50ZXJmYWNlID0gV2lkZ2V0QmFzZUludGVyZmFjZT4obGFiZWw6IFJlZ2lzdHJ5TGFiZWwpOiBDb25zdHJ1Y3RvcjxUPiB8IG51bGwge1xuXHRcdGlmICghdGhpcy5fd2lkZ2V0UmVnaXN0cnkgfHwgIXRoaXMuaGFzKGxhYmVsKSkge1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXG5cdFx0Y29uc3QgaXRlbSA9IHRoaXMuX3dpZGdldFJlZ2lzdHJ5LmdldChsYWJlbCk7XG5cblx0XHRpZiAoaXNXaWRnZXRCYXNlQ29uc3RydWN0b3I8VD4oaXRlbSkpIHtcblx0XHRcdHJldHVybiBpdGVtO1xuXHRcdH1cblxuXHRcdGlmIChpdGVtIGluc3RhbmNlb2YgUHJvbWlzZSkge1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXG5cdFx0Y29uc3QgcHJvbWlzZSA9ICg8V2lkZ2V0QmFzZUNvbnN0cnVjdG9yRnVuY3Rpb24+aXRlbSkoKTtcblx0XHR0aGlzLl93aWRnZXRSZWdpc3RyeS5zZXQobGFiZWwsIHByb21pc2UpO1xuXG5cdFx0cHJvbWlzZS50aGVuKFxuXHRcdFx0KHdpZGdldEN0b3IpID0+IHtcblx0XHRcdFx0aWYgKGlzV2lkZ2V0Q29uc3RydWN0b3JEZWZhdWx0RXhwb3J0PFQ+KHdpZGdldEN0b3IpKSB7XG5cdFx0XHRcdFx0d2lkZ2V0Q3RvciA9IHdpZGdldEN0b3IuZGVmYXVsdDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHRoaXMuX3dpZGdldFJlZ2lzdHJ5IS5zZXQobGFiZWwsIHdpZGdldEN0b3IpO1xuXHRcdFx0XHR0aGlzLmVtaXRMb2FkZWRFdmVudChsYWJlbCwgd2lkZ2V0Q3Rvcik7XG5cdFx0XHRcdHJldHVybiB3aWRnZXRDdG9yO1xuXHRcdFx0fSxcblx0XHRcdChlcnJvcikgPT4ge1xuXHRcdFx0XHR0aHJvdyBlcnJvcjtcblx0XHRcdH1cblx0XHQpO1xuXG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHRwdWJsaWMgZ2V0SW5qZWN0b3I8VD4obGFiZWw6IFJlZ2lzdHJ5TGFiZWwpOiBJbmplY3Rvckl0ZW08VD4gfCBudWxsIHtcblx0XHRpZiAoIXRoaXMuX2luamVjdG9yUmVnaXN0cnkgfHwgIXRoaXMuaGFzSW5qZWN0b3IobGFiZWwpKSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5faW5qZWN0b3JSZWdpc3RyeS5nZXQobGFiZWwpITtcblx0fVxuXG5cdHB1YmxpYyBoYXMobGFiZWw6IFJlZ2lzdHJ5TGFiZWwpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gQm9vbGVhbih0aGlzLl93aWRnZXRSZWdpc3RyeSAmJiB0aGlzLl93aWRnZXRSZWdpc3RyeS5oYXMobGFiZWwpKTtcblx0fVxuXG5cdHB1YmxpYyBoYXNJbmplY3RvcihsYWJlbDogUmVnaXN0cnlMYWJlbCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiBCb29sZWFuKHRoaXMuX2luamVjdG9yUmVnaXN0cnkgJiYgdGhpcy5faW5qZWN0b3JSZWdpc3RyeS5oYXMobGFiZWwpKTtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBSZWdpc3RyeTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyBSZWdpc3RyeS50cyIsImltcG9ydCB7IE1hcCB9IGZyb20gJy4uL3NoaW0vTWFwJztcbmltcG9ydCB7IEV2ZW50ZWQsIEV2ZW50T2JqZWN0IH0gZnJvbSAnLi4vY29yZS9FdmVudGVkJztcbmltcG9ydCB7IENvbnN0cnVjdG9yLCBJbmplY3RvckZhY3RvcnksIEluamVjdG9ySXRlbSwgUmVnaXN0cnlMYWJlbCwgV2lkZ2V0QmFzZUludGVyZmFjZSB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBSZWdpc3RyeSwgUmVnaXN0cnlFdmVudE9iamVjdCwgUmVnaXN0cnlJdGVtIH0gZnJvbSAnLi9SZWdpc3RyeSc7XG5cbmV4cG9ydCB0eXBlIFJlZ2lzdHJ5SGFuZGxlckV2ZW50TWFwID0ge1xuXHRpbnZhbGlkYXRlOiBFdmVudE9iamVjdDwnaW52YWxpZGF0ZSc+O1xufTtcblxuZXhwb3J0IGNsYXNzIFJlZ2lzdHJ5SGFuZGxlciBleHRlbmRzIEV2ZW50ZWQ8UmVnaXN0cnlIYW5kbGVyRXZlbnRNYXA+IHtcblx0cHJpdmF0ZSBfcmVnaXN0cnkgPSBuZXcgUmVnaXN0cnkoKTtcblx0cHJpdmF0ZSBfcmVnaXN0cnlXaWRnZXRMYWJlbE1hcDogTWFwPFJlZ2lzdHJ5LCBSZWdpc3RyeUxhYmVsW10+ID0gbmV3IE1hcCgpO1xuXHRwcml2YXRlIF9yZWdpc3RyeUluamVjdG9yTGFiZWxNYXA6IE1hcDxSZWdpc3RyeSwgUmVnaXN0cnlMYWJlbFtdPiA9IG5ldyBNYXAoKTtcblx0cHJvdGVjdGVkIGJhc2VSZWdpc3RyeT86IFJlZ2lzdHJ5O1xuXG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKCk7XG5cdFx0dGhpcy5vd24odGhpcy5fcmVnaXN0cnkpO1xuXHRcdGNvbnN0IGRlc3Ryb3kgPSAoKSA9PiB7XG5cdFx0XHRpZiAodGhpcy5iYXNlUmVnaXN0cnkpIHtcblx0XHRcdFx0dGhpcy5fcmVnaXN0cnlXaWRnZXRMYWJlbE1hcC5kZWxldGUodGhpcy5iYXNlUmVnaXN0cnkpO1xuXHRcdFx0XHR0aGlzLl9yZWdpc3RyeUluamVjdG9yTGFiZWxNYXAuZGVsZXRlKHRoaXMuYmFzZVJlZ2lzdHJ5KTtcblx0XHRcdFx0dGhpcy5iYXNlUmVnaXN0cnkgPSB1bmRlZmluZWQ7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHR0aGlzLm93bih7IGRlc3Ryb3kgfSk7XG5cdH1cblxuXHRwdWJsaWMgc2V0IGJhc2UoYmFzZVJlZ2lzdHJ5OiBSZWdpc3RyeSkge1xuXHRcdGlmICh0aGlzLmJhc2VSZWdpc3RyeSkge1xuXHRcdFx0dGhpcy5fcmVnaXN0cnlXaWRnZXRMYWJlbE1hcC5kZWxldGUodGhpcy5iYXNlUmVnaXN0cnkpO1xuXHRcdFx0dGhpcy5fcmVnaXN0cnlJbmplY3RvckxhYmVsTWFwLmRlbGV0ZSh0aGlzLmJhc2VSZWdpc3RyeSk7XG5cdFx0fVxuXHRcdHRoaXMuYmFzZVJlZ2lzdHJ5ID0gYmFzZVJlZ2lzdHJ5O1xuXHR9XG5cblx0cHVibGljIGRlZmluZShsYWJlbDogUmVnaXN0cnlMYWJlbCwgd2lkZ2V0OiBSZWdpc3RyeUl0ZW0pOiB2b2lkIHtcblx0XHR0aGlzLl9yZWdpc3RyeS5kZWZpbmUobGFiZWwsIHdpZGdldCk7XG5cdH1cblxuXHRwdWJsaWMgZGVmaW5lSW5qZWN0b3IobGFiZWw6IFJlZ2lzdHJ5TGFiZWwsIGluamVjdG9yOiBJbmplY3RvckZhY3RvcnkpOiB2b2lkIHtcblx0XHR0aGlzLl9yZWdpc3RyeS5kZWZpbmVJbmplY3RvcihsYWJlbCwgaW5qZWN0b3IpO1xuXHR9XG5cblx0cHVibGljIGhhcyhsYWJlbDogUmVnaXN0cnlMYWJlbCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLl9yZWdpc3RyeS5oYXMobGFiZWwpIHx8IEJvb2xlYW4odGhpcy5iYXNlUmVnaXN0cnkgJiYgdGhpcy5iYXNlUmVnaXN0cnkuaGFzKGxhYmVsKSk7XG5cdH1cblxuXHRwdWJsaWMgaGFzSW5qZWN0b3IobGFiZWw6IFJlZ2lzdHJ5TGFiZWwpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy5fcmVnaXN0cnkuaGFzSW5qZWN0b3IobGFiZWwpIHx8IEJvb2xlYW4odGhpcy5iYXNlUmVnaXN0cnkgJiYgdGhpcy5iYXNlUmVnaXN0cnkuaGFzSW5qZWN0b3IobGFiZWwpKTtcblx0fVxuXG5cdHB1YmxpYyBnZXQ8VCBleHRlbmRzIFdpZGdldEJhc2VJbnRlcmZhY2UgPSBXaWRnZXRCYXNlSW50ZXJmYWNlPihcblx0XHRsYWJlbDogUmVnaXN0cnlMYWJlbCxcblx0XHRnbG9iYWxQcmVjZWRlbmNlOiBib29sZWFuID0gZmFsc2Vcblx0KTogQ29uc3RydWN0b3I8VD4gfCBudWxsIHtcblx0XHRyZXR1cm4gdGhpcy5fZ2V0KGxhYmVsLCBnbG9iYWxQcmVjZWRlbmNlLCAnZ2V0JywgdGhpcy5fcmVnaXN0cnlXaWRnZXRMYWJlbE1hcCk7XG5cdH1cblxuXHRwdWJsaWMgZ2V0SW5qZWN0b3I8VD4obGFiZWw6IFJlZ2lzdHJ5TGFiZWwsIGdsb2JhbFByZWNlZGVuY2U6IGJvb2xlYW4gPSBmYWxzZSk6IEluamVjdG9ySXRlbTxUPiB8IG51bGwge1xuXHRcdHJldHVybiB0aGlzLl9nZXQobGFiZWwsIGdsb2JhbFByZWNlZGVuY2UsICdnZXRJbmplY3RvcicsIHRoaXMuX3JlZ2lzdHJ5SW5qZWN0b3JMYWJlbE1hcCk7XG5cdH1cblxuXHRwcml2YXRlIF9nZXQoXG5cdFx0bGFiZWw6IFJlZ2lzdHJ5TGFiZWwsXG5cdFx0Z2xvYmFsUHJlY2VkZW5jZTogYm9vbGVhbixcblx0XHRnZXRGdW5jdGlvbk5hbWU6ICdnZXRJbmplY3RvcicgfCAnZ2V0Jyxcblx0XHRsYWJlbE1hcDogTWFwPFJlZ2lzdHJ5LCBSZWdpc3RyeUxhYmVsW10+XG5cdCk6IGFueSB7XG5cdFx0Y29uc3QgcmVnaXN0cmllcyA9IGdsb2JhbFByZWNlZGVuY2UgPyBbdGhpcy5iYXNlUmVnaXN0cnksIHRoaXMuX3JlZ2lzdHJ5XSA6IFt0aGlzLl9yZWdpc3RyeSwgdGhpcy5iYXNlUmVnaXN0cnldO1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgcmVnaXN0cmllcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0Y29uc3QgcmVnaXN0cnk6IGFueSA9IHJlZ2lzdHJpZXNbaV07XG5cdFx0XHRpZiAoIXJlZ2lzdHJ5KSB7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXHRcdFx0Y29uc3QgaXRlbSA9IHJlZ2lzdHJ5W2dldEZ1bmN0aW9uTmFtZV0obGFiZWwpO1xuXHRcdFx0Y29uc3QgcmVnaXN0ZXJlZExhYmVscyA9IGxhYmVsTWFwLmdldChyZWdpc3RyeSkgfHwgW107XG5cdFx0XHRpZiAoaXRlbSkge1xuXHRcdFx0XHRyZXR1cm4gaXRlbTtcblx0XHRcdH0gZWxzZSBpZiAocmVnaXN0ZXJlZExhYmVscy5pbmRleE9mKGxhYmVsKSA9PT0gLTEpIHtcblx0XHRcdFx0Y29uc3QgaGFuZGxlID0gcmVnaXN0cnkub24obGFiZWwsIChldmVudDogUmVnaXN0cnlFdmVudE9iamVjdCkgPT4ge1xuXHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdGV2ZW50LmFjdGlvbiA9PT0gJ2xvYWRlZCcgJiZcblx0XHRcdFx0XHRcdCh0aGlzIGFzIGFueSlbZ2V0RnVuY3Rpb25OYW1lXShsYWJlbCwgZ2xvYmFsUHJlY2VkZW5jZSkgPT09IGV2ZW50Lml0ZW1cblx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdHRoaXMuZW1pdCh7IHR5cGU6ICdpbnZhbGlkYXRlJyB9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHR0aGlzLm93bihoYW5kbGUpO1xuXHRcdFx0XHRsYWJlbE1hcC5zZXQocmVnaXN0cnksIFsuLi5yZWdpc3RlcmVkTGFiZWxzLCBsYWJlbF0pO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gbnVsbDtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBSZWdpc3RyeUhhbmRsZXI7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gUmVnaXN0cnlIYW5kbGVyLnRzIiwiaW1wb3J0IE1hcCBmcm9tICcuLi9zaGltL01hcCc7XG5pbXBvcnQgV2Vha01hcCBmcm9tICcuLi9zaGltL1dlYWtNYXAnO1xuaW1wb3J0IHsgdiwgVk5PREUsIGlzVk5vZGUsIGlzV05vZGUgfSBmcm9tICcuL2QnO1xuaW1wb3J0IHsgYXV0byB9IGZyb20gJy4vZGlmZic7XG5pbXBvcnQge1xuXHRBZnRlclJlbmRlcixcblx0QmVmb3JlUHJvcGVydGllcyxcblx0QmVmb3JlUmVuZGVyLFxuXHREaWZmUHJvcGVydHlSZWFjdGlvbixcblx0RE5vZGUsXG5cdERlZmF1bHRXaWRnZXRCYXNlSW50ZXJmYWNlLFxuXHRMYXp5V2lkZ2V0LFxuXHRSZW5kZXIsXG5cdFdpZGdldE1ldGFCYXNlLFxuXHRXaWRnZXRNZXRhQ29uc3RydWN0b3IsXG5cdFdpZGdldEJhc2VJbnRlcmZhY2UsXG5cdFdpZGdldFByb3BlcnRpZXMsXG5cdFdOb2RlLFxuXHRWTm9kZSxcblx0TGF6eURlZmluZVxufSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0IFJlZ2lzdHJ5SGFuZGxlciBmcm9tICcuL1JlZ2lzdHJ5SGFuZGxlcic7XG5pbXBvcnQgTm9kZUhhbmRsZXIgZnJvbSAnLi9Ob2RlSGFuZGxlcic7XG5pbXBvcnQgeyBpc1dpZGdldEJhc2VDb25zdHJ1Y3RvciwgV0lER0VUX0JBU0VfVFlQRSB9IGZyb20gJy4vUmVnaXN0cnknO1xuaW1wb3J0IHsgSGFuZGxlIH0gZnJvbSAnLi4vY29yZS9EZXN0cm95YWJsZSc7XG5cbmludGVyZmFjZSBSZWFjdGlvbkZ1bmN0aW9uQ29uZmlnIHtcblx0cHJvcGVydHlOYW1lOiBzdHJpbmc7XG5cdHJlYWN0aW9uOiBEaWZmUHJvcGVydHlSZWFjdGlvbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBXaWRnZXREYXRhIHtcblx0b25EZXRhY2g6ICgpID0+IHZvaWQ7XG5cdG9uQXR0YWNoOiAoKSA9PiB2b2lkO1xuXHRkaXJ0eTogYm9vbGVhbjtcblx0bm9kZUhhbmRsZXI6IE5vZGVIYW5kbGVyO1xuXHRpbnZhbGlkYXRlPzogRnVuY3Rpb247XG5cdHJlbmRlcmluZzogYm9vbGVhbjtcblx0aW5wdXRQcm9wZXJ0aWVzOiBhbnk7XG59XG5cbmV4cG9ydCB0eXBlIEJvdW5kRnVuY3Rpb25EYXRhID0geyBib3VuZEZ1bmM6ICguLi5hcmdzOiBhbnlbXSkgPT4gYW55OyBzY29wZTogYW55IH07XG5cbmxldCBsYXp5V2lkZ2V0SWQgPSAwO1xuY29uc3QgbGF6eVdpZGdldElkTWFwID0gbmV3IFdlYWtNYXA8TGF6eVdpZGdldCwgc3RyaW5nPigpO1xuY29uc3QgZGVjb3JhdG9yTWFwID0gbmV3IE1hcDxGdW5jdGlvbiwgTWFwPHN0cmluZywgYW55W10+PigpO1xuZXhwb3J0IGNvbnN0IHdpZGdldEluc3RhbmNlTWFwID0gbmV3IFdlYWtNYXA8XG5cdFdpZGdldEJhc2U8V2lkZ2V0UHJvcGVydGllcywgRE5vZGU8RGVmYXVsdFdpZGdldEJhc2VJbnRlcmZhY2U+Pixcblx0V2lkZ2V0RGF0YVxuPigpO1xuY29uc3QgYm91bmRBdXRvID0gYXV0by5iaW5kKG51bGwpO1xuXG5leHBvcnQgY29uc3Qgbm9CaW5kID0gJ19fZG9qb19ub19iaW5kJztcblxuZnVuY3Rpb24gdG9UZXh0Vk5vZGUoZGF0YTogYW55KTogVk5vZGUge1xuXHRyZXR1cm4ge1xuXHRcdHRhZzogJycsXG5cdFx0cHJvcGVydGllczoge30sXG5cdFx0Y2hpbGRyZW46IHVuZGVmaW5lZCxcblx0XHR0ZXh0OiBgJHtkYXRhfWAsXG5cdFx0dHlwZTogVk5PREVcblx0fTtcbn1cblxuZnVuY3Rpb24gaXNMYXp5RGVmaW5lKGl0ZW06IGFueSk6IGl0ZW0gaXMgTGF6eURlZmluZSB7XG5cdHJldHVybiBCb29sZWFuKGl0ZW0gJiYgaXRlbS5sYWJlbCk7XG59XG5cbi8qKlxuICogTWFpbiB3aWRnZXQgYmFzZSBmb3IgYWxsIHdpZGdldHMgdG8gZXh0ZW5kXG4gKi9cbmV4cG9ydCBjbGFzcyBXaWRnZXRCYXNlPFAgPSBXaWRnZXRQcm9wZXJ0aWVzLCBDIGV4dGVuZHMgRE5vZGUgPSBETm9kZT4gaW1wbGVtZW50cyBXaWRnZXRCYXNlSW50ZXJmYWNlPFAsIEM+IHtcblx0LyoqXG5cdCAqIHN0YXRpYyBpZGVudGlmaWVyXG5cdCAqL1xuXHRzdGF0aWMgX3R5cGUgPSBXSURHRVRfQkFTRV9UWVBFO1xuXG5cdC8qKlxuXHQgKiBjaGlsZHJlbiBhcnJheVxuXHQgKi9cblx0cHJpdmF0ZSBfY2hpbGRyZW46IChDIHwgbnVsbClbXTtcblxuXHQvKipcblx0ICogSW5kaWNhdGVzIGlmIGl0IGlzIHRoZSBpbml0aWFsIHNldCBwcm9wZXJ0aWVzIGN5Y2xlXG5cdCAqL1xuXHRwcml2YXRlIF9pbml0aWFsUHJvcGVydGllcyA9IHRydWU7XG5cblx0LyoqXG5cdCAqIGludGVybmFsIHdpZGdldCBwcm9wZXJ0aWVzXG5cdCAqL1xuXHRwcml2YXRlIF9wcm9wZXJ0aWVzOiBQICYgV2lkZ2V0UHJvcGVydGllcyAmIHsgW2luZGV4OiBzdHJpbmddOiBhbnkgfTtcblxuXHQvKipcblx0ICogQXJyYXkgb2YgcHJvcGVydHkga2V5cyBjb25zaWRlcmVkIGNoYW5nZWQgZnJvbSB0aGUgcHJldmlvdXMgc2V0IHByb3BlcnRpZXNcblx0ICovXG5cdHByaXZhdGUgX2NoYW5nZWRQcm9wZXJ0eUtleXM6IHN0cmluZ1tdID0gW107XG5cblx0LyoqXG5cdCAqIG1hcCBvZiBkZWNvcmF0b3JzIHRoYXQgYXJlIGFwcGxpZWQgdG8gdGhpcyB3aWRnZXRcblx0ICovXG5cdHByaXZhdGUgX2RlY29yYXRvckNhY2hlOiBNYXA8c3RyaW5nLCBhbnlbXT47XG5cblx0cHJpdmF0ZSBfcmVnaXN0cnk6IFJlZ2lzdHJ5SGFuZGxlciB8IHVuZGVmaW5lZDtcblxuXHQvKipcblx0ICogTWFwIG9mIGZ1bmN0aW9ucyBwcm9wZXJ0aWVzIGZvciB0aGUgYm91bmQgZnVuY3Rpb25cblx0ICovXG5cdHByaXZhdGUgX2JpbmRGdW5jdGlvblByb3BlcnR5TWFwOiBXZWFrTWFwPCguLi5hcmdzOiBhbnlbXSkgPT4gYW55LCBCb3VuZEZ1bmN0aW9uRGF0YT4gfCB1bmRlZmluZWQ7XG5cblx0cHJpdmF0ZSBfbWV0YU1hcDogTWFwPFdpZGdldE1ldGFDb25zdHJ1Y3Rvcjxhbnk+LCBXaWRnZXRNZXRhQmFzZT4gfCB1bmRlZmluZWQ7XG5cblx0cHJpdmF0ZSBfYm91bmRSZW5kZXJGdW5jOiBSZW5kZXI7XG5cblx0cHJpdmF0ZSBfYm91bmRJbnZhbGlkYXRlOiAoKSA9PiB2b2lkO1xuXG5cdHByaXZhdGUgX25vZGVIYW5kbGVyOiBOb2RlSGFuZGxlciA9IG5ldyBOb2RlSGFuZGxlcigpO1xuXG5cdHByaXZhdGUgX2hhbmRsZXM6IEhhbmRsZVtdID0gW107XG5cblx0LyoqXG5cdCAqIEBjb25zdHJ1Y3RvclxuXHQgKi9cblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5fY2hpbGRyZW4gPSBbXTtcblx0XHR0aGlzLl9kZWNvcmF0b3JDYWNoZSA9IG5ldyBNYXA8c3RyaW5nLCBhbnlbXT4oKTtcblx0XHR0aGlzLl9wcm9wZXJ0aWVzID0gPFA+e307XG5cdFx0dGhpcy5fYm91bmRSZW5kZXJGdW5jID0gdGhpcy5yZW5kZXIuYmluZCh0aGlzKTtcblx0XHR0aGlzLl9ib3VuZEludmFsaWRhdGUgPSB0aGlzLmludmFsaWRhdGUuYmluZCh0aGlzKTtcblxuXHRcdHdpZGdldEluc3RhbmNlTWFwLnNldCh0aGlzLCB7XG5cdFx0XHRkaXJ0eTogdHJ1ZSxcblx0XHRcdG9uQXR0YWNoOiAoKTogdm9pZCA9PiB7XG5cdFx0XHRcdHRoaXMub25BdHRhY2goKTtcblx0XHRcdH0sXG5cdFx0XHRvbkRldGFjaDogKCk6IHZvaWQgPT4ge1xuXHRcdFx0XHR0aGlzLm9uRGV0YWNoKCk7XG5cdFx0XHRcdHRoaXMuZGVzdHJveSgpO1xuXHRcdFx0fSxcblx0XHRcdG5vZGVIYW5kbGVyOiB0aGlzLl9ub2RlSGFuZGxlcixcblx0XHRcdHJlbmRlcmluZzogZmFsc2UsXG5cdFx0XHRpbnB1dFByb3BlcnRpZXM6IHt9XG5cdFx0fSk7XG5cblx0XHR0aGlzLm93bih7XG5cdFx0XHRkZXN0cm95OiAoKSA9PiB7XG5cdFx0XHRcdHdpZGdldEluc3RhbmNlTWFwLmRlbGV0ZSh0aGlzKTtcblx0XHRcdFx0dGhpcy5fbm9kZUhhbmRsZXIuY2xlYXIoKTtcblx0XHRcdFx0dGhpcy5fbm9kZUhhbmRsZXIuZGVzdHJveSgpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0dGhpcy5fcnVuQWZ0ZXJDb25zdHJ1Y3RvcnMoKTtcblx0fVxuXG5cdHByb3RlY3RlZCBtZXRhPFQgZXh0ZW5kcyBXaWRnZXRNZXRhQmFzZT4oTWV0YVR5cGU6IFdpZGdldE1ldGFDb25zdHJ1Y3RvcjxUPik6IFQge1xuXHRcdGlmICh0aGlzLl9tZXRhTWFwID09PSB1bmRlZmluZWQpIHtcblx0XHRcdHRoaXMuX21ldGFNYXAgPSBuZXcgTWFwPFdpZGdldE1ldGFDb25zdHJ1Y3Rvcjxhbnk+LCBXaWRnZXRNZXRhQmFzZT4oKTtcblx0XHR9XG5cdFx0bGV0IGNhY2hlZCA9IHRoaXMuX21ldGFNYXAuZ2V0KE1ldGFUeXBlKTtcblx0XHRpZiAoIWNhY2hlZCkge1xuXHRcdFx0Y2FjaGVkID0gbmV3IE1ldGFUeXBlKHtcblx0XHRcdFx0aW52YWxpZGF0ZTogdGhpcy5fYm91bmRJbnZhbGlkYXRlLFxuXHRcdFx0XHRub2RlSGFuZGxlcjogdGhpcy5fbm9kZUhhbmRsZXIsXG5cdFx0XHRcdGJpbmQ6IHRoaXNcblx0XHRcdH0pO1xuXHRcdFx0dGhpcy5vd24oY2FjaGVkKTtcblx0XHRcdHRoaXMuX21ldGFNYXAuc2V0KE1ldGFUeXBlLCBjYWNoZWQpO1xuXHRcdH1cblxuXHRcdHJldHVybiBjYWNoZWQgYXMgVDtcblx0fVxuXG5cdHByb3RlY3RlZCBvbkF0dGFjaCgpOiB2b2lkIHtcblx0XHQvLyBEbyBub3RoaW5nIGJ5IGRlZmF1bHQuXG5cdH1cblxuXHRwcm90ZWN0ZWQgb25EZXRhY2goKTogdm9pZCB7XG5cdFx0Ly8gRG8gbm90aGluZyBieSBkZWZhdWx0LlxuXHR9XG5cblx0cHVibGljIGdldCBwcm9wZXJ0aWVzKCk6IFJlYWRvbmx5PFA+ICYgUmVhZG9ubHk8V2lkZ2V0UHJvcGVydGllcz4ge1xuXHRcdHJldHVybiB0aGlzLl9wcm9wZXJ0aWVzO1xuXHR9XG5cblx0cHVibGljIGdldCBjaGFuZ2VkUHJvcGVydHlLZXlzKCk6IHN0cmluZ1tdIHtcblx0XHRyZXR1cm4gWy4uLnRoaXMuX2NoYW5nZWRQcm9wZXJ0eUtleXNdO1xuXHR9XG5cblx0cHVibGljIF9fc2V0UHJvcGVydGllc19fKG9yaWdpbmFsUHJvcGVydGllczogdGhpc1sncHJvcGVydGllcyddLCBiaW5kPzogV2lkZ2V0QmFzZUludGVyZmFjZSk6IHZvaWQge1xuXHRcdGNvbnN0IGluc3RhbmNlRGF0YSA9IHdpZGdldEluc3RhbmNlTWFwLmdldCh0aGlzKTtcblx0XHRpZiAoaW5zdGFuY2VEYXRhKSB7XG5cdFx0XHRpbnN0YW5jZURhdGEuaW5wdXRQcm9wZXJ0aWVzID0gb3JpZ2luYWxQcm9wZXJ0aWVzO1xuXHRcdH1cblx0XHRjb25zdCBwcm9wZXJ0aWVzID0gdGhpcy5fcnVuQmVmb3JlUHJvcGVydGllcyhvcmlnaW5hbFByb3BlcnRpZXMpO1xuXHRcdGNvbnN0IHJlZ2lzdGVyZWREaWZmUHJvcGVydHlOYW1lcyA9IHRoaXMuZ2V0RGVjb3JhdG9yKCdyZWdpc3RlcmVkRGlmZlByb3BlcnR5Jyk7XG5cdFx0Y29uc3QgY2hhbmdlZFByb3BlcnR5S2V5czogc3RyaW5nW10gPSBbXTtcblx0XHRjb25zdCBwcm9wZXJ0eU5hbWVzID0gT2JqZWN0LmtleXMocHJvcGVydGllcyk7XG5cblx0XHRpZiAodGhpcy5faW5pdGlhbFByb3BlcnRpZXMgPT09IGZhbHNlIHx8IHJlZ2lzdGVyZWREaWZmUHJvcGVydHlOYW1lcy5sZW5ndGggIT09IDApIHtcblx0XHRcdGNvbnN0IGFsbFByb3BlcnRpZXMgPSBbLi4ucHJvcGVydHlOYW1lcywgLi4uT2JqZWN0LmtleXModGhpcy5fcHJvcGVydGllcyldO1xuXHRcdFx0Y29uc3QgY2hlY2tlZFByb3BlcnRpZXM6IChzdHJpbmcgfCBudW1iZXIpW10gPSBbXTtcblx0XHRcdGNvbnN0IGRpZmZQcm9wZXJ0eVJlc3VsdHM6IGFueSA9IHt9O1xuXHRcdFx0bGV0IHJ1blJlYWN0aW9ucyA9IGZhbHNlO1xuXG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFsbFByb3BlcnRpZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0Y29uc3QgcHJvcGVydHlOYW1lID0gYWxsUHJvcGVydGllc1tpXTtcblx0XHRcdFx0aWYgKGNoZWNrZWRQcm9wZXJ0aWVzLmluZGV4T2YocHJvcGVydHlOYW1lKSAhPT0gLTEpIHtcblx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjaGVja2VkUHJvcGVydGllcy5wdXNoKHByb3BlcnR5TmFtZSk7XG5cdFx0XHRcdGNvbnN0IHByZXZpb3VzUHJvcGVydHkgPSB0aGlzLl9wcm9wZXJ0aWVzW3Byb3BlcnR5TmFtZV07XG5cdFx0XHRcdGNvbnN0IG5ld1Byb3BlcnR5ID0gdGhpcy5fYmluZEZ1bmN0aW9uUHJvcGVydHkocHJvcGVydGllc1twcm9wZXJ0eU5hbWVdLCBiaW5kKTtcblx0XHRcdFx0aWYgKHJlZ2lzdGVyZWREaWZmUHJvcGVydHlOYW1lcy5pbmRleE9mKHByb3BlcnR5TmFtZSkgIT09IC0xKSB7XG5cdFx0XHRcdFx0cnVuUmVhY3Rpb25zID0gdHJ1ZTtcblx0XHRcdFx0XHRjb25zdCBkaWZmRnVuY3Rpb25zID0gdGhpcy5nZXREZWNvcmF0b3IoYGRpZmZQcm9wZXJ0eToke3Byb3BlcnR5TmFtZX1gKTtcblx0XHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGRpZmZGdW5jdGlvbnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdGNvbnN0IHJlc3VsdCA9IGRpZmZGdW5jdGlvbnNbaV0ocHJldmlvdXNQcm9wZXJ0eSwgbmV3UHJvcGVydHkpO1xuXHRcdFx0XHRcdFx0aWYgKHJlc3VsdC5jaGFuZ2VkICYmIGNoYW5nZWRQcm9wZXJ0eUtleXMuaW5kZXhPZihwcm9wZXJ0eU5hbWUpID09PSAtMSkge1xuXHRcdFx0XHRcdFx0XHRjaGFuZ2VkUHJvcGVydHlLZXlzLnB1c2gocHJvcGVydHlOYW1lKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGlmIChwcm9wZXJ0eU5hbWUgaW4gcHJvcGVydGllcykge1xuXHRcdFx0XHRcdFx0XHRkaWZmUHJvcGVydHlSZXN1bHRzW3Byb3BlcnR5TmFtZV0gPSByZXN1bHQudmFsdWU7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNvbnN0IHJlc3VsdCA9IGJvdW5kQXV0byhwcmV2aW91c1Byb3BlcnR5LCBuZXdQcm9wZXJ0eSk7XG5cdFx0XHRcdFx0aWYgKHJlc3VsdC5jaGFuZ2VkICYmIGNoYW5nZWRQcm9wZXJ0eUtleXMuaW5kZXhPZihwcm9wZXJ0eU5hbWUpID09PSAtMSkge1xuXHRcdFx0XHRcdFx0Y2hhbmdlZFByb3BlcnR5S2V5cy5wdXNoKHByb3BlcnR5TmFtZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmIChwcm9wZXJ0eU5hbWUgaW4gcHJvcGVydGllcykge1xuXHRcdFx0XHRcdFx0ZGlmZlByb3BlcnR5UmVzdWx0c1twcm9wZXJ0eU5hbWVdID0gcmVzdWx0LnZhbHVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAocnVuUmVhY3Rpb25zKSB7XG5cdFx0XHRcdGNvbnN0IHJlYWN0aW9uRnVuY3Rpb25zOiBSZWFjdGlvbkZ1bmN0aW9uQ29uZmlnW10gPSB0aGlzLmdldERlY29yYXRvcignZGlmZlJlYWN0aW9uJyk7XG5cdFx0XHRcdGNvbnN0IGV4ZWN1dGVkUmVhY3Rpb25zOiBGdW5jdGlvbltdID0gW107XG5cdFx0XHRcdHJlYWN0aW9uRnVuY3Rpb25zLmZvckVhY2goKHsgcmVhY3Rpb24sIHByb3BlcnR5TmFtZSB9KSA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgcHJvcGVydHlDaGFuZ2VkID0gY2hhbmdlZFByb3BlcnR5S2V5cy5pbmRleE9mKHByb3BlcnR5TmFtZSkgIT09IC0xO1xuXHRcdFx0XHRcdGNvbnN0IHJlYWN0aW9uUnVuID0gZXhlY3V0ZWRSZWFjdGlvbnMuaW5kZXhPZihyZWFjdGlvbikgIT09IC0xO1xuXHRcdFx0XHRcdGlmIChwcm9wZXJ0eUNoYW5nZWQgJiYgIXJlYWN0aW9uUnVuKSB7XG5cdFx0XHRcdFx0XHRyZWFjdGlvbi5jYWxsKHRoaXMsIHRoaXMuX3Byb3BlcnRpZXMsIGRpZmZQcm9wZXJ0eVJlc3VsdHMpO1xuXHRcdFx0XHRcdFx0ZXhlY3V0ZWRSZWFjdGlvbnMucHVzaChyZWFjdGlvbik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdHRoaXMuX3Byb3BlcnRpZXMgPSBkaWZmUHJvcGVydHlSZXN1bHRzO1xuXHRcdFx0dGhpcy5fY2hhbmdlZFByb3BlcnR5S2V5cyA9IGNoYW5nZWRQcm9wZXJ0eUtleXM7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuX2luaXRpYWxQcm9wZXJ0aWVzID0gZmFsc2U7XG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHByb3BlcnR5TmFtZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0Y29uc3QgcHJvcGVydHlOYW1lID0gcHJvcGVydHlOYW1lc1tpXTtcblx0XHRcdFx0aWYgKHR5cGVvZiBwcm9wZXJ0aWVzW3Byb3BlcnR5TmFtZV0gPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRwcm9wZXJ0aWVzW3Byb3BlcnR5TmFtZV0gPSB0aGlzLl9iaW5kRnVuY3Rpb25Qcm9wZXJ0eShwcm9wZXJ0aWVzW3Byb3BlcnR5TmFtZV0sIGJpbmQpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNoYW5nZWRQcm9wZXJ0eUtleXMucHVzaChwcm9wZXJ0eU5hbWUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHR0aGlzLl9jaGFuZ2VkUHJvcGVydHlLZXlzID0gY2hhbmdlZFByb3BlcnR5S2V5cztcblx0XHRcdHRoaXMuX3Byb3BlcnRpZXMgPSB7IC4uLnByb3BlcnRpZXMgfTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5fY2hhbmdlZFByb3BlcnR5S2V5cy5sZW5ndGggPiAwKSB7XG5cdFx0XHR0aGlzLmludmFsaWRhdGUoKTtcblx0XHR9XG5cdH1cblxuXHRwdWJsaWMgZ2V0IGNoaWxkcmVuKCk6IChDIHwgbnVsbClbXSB7XG5cdFx0cmV0dXJuIHRoaXMuX2NoaWxkcmVuO1xuXHR9XG5cblx0cHVibGljIF9fc2V0Q2hpbGRyZW5fXyhjaGlsZHJlbjogKEMgfCBudWxsKVtdKTogdm9pZCB7XG5cdFx0aWYgKHRoaXMuX2NoaWxkcmVuLmxlbmd0aCA+IDAgfHwgY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuXHRcdFx0dGhpcy5fY2hpbGRyZW4gPSBjaGlsZHJlbjtcblx0XHRcdHRoaXMuaW52YWxpZGF0ZSgpO1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgX2ZpbHRlckFuZENvbnZlcnQobm9kZXM6IEROb2RlW10pOiAoV05vZGUgfCBWTm9kZSlbXTtcblx0cHJpdmF0ZSBfZmlsdGVyQW5kQ29udmVydChub2RlczogRE5vZGUpOiBXTm9kZSB8IFZOb2RlO1xuXHRwcml2YXRlIF9maWx0ZXJBbmRDb252ZXJ0KG5vZGVzOiBETm9kZSB8IEROb2RlW10pOiAoV05vZGUgfCBWTm9kZSkgfCAoV05vZGUgfCBWTm9kZSlbXTtcblx0cHJpdmF0ZSBfZmlsdGVyQW5kQ29udmVydChub2RlczogRE5vZGUgfCBETm9kZVtdKTogKFdOb2RlIHwgVk5vZGUpIHwgKFdOb2RlIHwgVk5vZGUpW10ge1xuXHRcdGNvbnN0IGlzQXJyYXkgPSBBcnJheS5pc0FycmF5KG5vZGVzKTtcblx0XHRjb25zdCBmaWx0ZXJlZE5vZGVzID0gQXJyYXkuaXNBcnJheShub2RlcykgPyBub2RlcyA6IFtub2Rlc107XG5cdFx0Y29uc3QgY29udmVydGVkTm9kZXM6IChXTm9kZSB8IFZOb2RlKVtdID0gW107XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBmaWx0ZXJlZE5vZGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRjb25zdCBub2RlID0gZmlsdGVyZWROb2Rlc1tpXTtcblx0XHRcdGlmICghbm9kZSkge1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblx0XHRcdGlmICh0eXBlb2Ygbm9kZSA9PT0gJ3N0cmluZycpIHtcblx0XHRcdFx0Y29udmVydGVkTm9kZXMucHVzaCh0b1RleHRWTm9kZShub2RlKSk7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGlzVk5vZGUobm9kZSkgJiYgbm9kZS5kZWZlcnJlZFByb3BlcnRpZXNDYWxsYmFjaykge1xuXHRcdFx0XHRjb25zdCBwcm9wZXJ0aWVzID0gbm9kZS5kZWZlcnJlZFByb3BlcnRpZXNDYWxsYmFjayhmYWxzZSk7XG5cdFx0XHRcdG5vZGUub3JpZ2luYWxQcm9wZXJ0aWVzID0gbm9kZS5wcm9wZXJ0aWVzO1xuXHRcdFx0XHRub2RlLnByb3BlcnRpZXMgPSB7IC4uLnByb3BlcnRpZXMsIC4uLm5vZGUucHJvcGVydGllcyB9O1xuXHRcdFx0fVxuXHRcdFx0aWYgKGlzV05vZGUobm9kZSkgJiYgIWlzV2lkZ2V0QmFzZUNvbnN0cnVjdG9yKG5vZGUud2lkZ2V0Q29uc3RydWN0b3IpKSB7XG5cdFx0XHRcdGlmICh0eXBlb2Ygbm9kZS53aWRnZXRDb25zdHJ1Y3RvciA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdGxldCBpZCA9IGxhenlXaWRnZXRJZE1hcC5nZXQobm9kZS53aWRnZXRDb25zdHJ1Y3Rvcik7XG5cdFx0XHRcdFx0aWYgKCFpZCkge1xuXHRcdFx0XHRcdFx0aWQgPSBgX19sYXp5X3dpZGdldF8ke2xhenlXaWRnZXRJZCsrfWA7XG5cdFx0XHRcdFx0XHRsYXp5V2lkZ2V0SWRNYXAuc2V0KG5vZGUud2lkZ2V0Q29uc3RydWN0b3IsIGlkKTtcblx0XHRcdFx0XHRcdHRoaXMucmVnaXN0cnkuZGVmaW5lKGlkLCBub2RlLndpZGdldENvbnN0cnVjdG9yKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0bm9kZS53aWRnZXRDb25zdHJ1Y3RvciA9IGlkO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGlzTGF6eURlZmluZShub2RlLndpZGdldENvbnN0cnVjdG9yKSkge1xuXHRcdFx0XHRcdGNvbnN0IHsgbGFiZWwsIHJlZ2lzdHJ5SXRlbSB9ID0gbm9kZS53aWRnZXRDb25zdHJ1Y3Rvcjtcblx0XHRcdFx0XHRpZiAoIXRoaXMucmVnaXN0cnkuaGFzKGxhYmVsKSkge1xuXHRcdFx0XHRcdFx0dGhpcy5yZWdpc3RyeS5kZWZpbmUobGFiZWwsIHJlZ2lzdHJ5SXRlbSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdG5vZGUud2lkZ2V0Q29uc3RydWN0b3IgPSBsYWJlbDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdG5vZGUud2lkZ2V0Q29uc3RydWN0b3IgPVxuXHRcdFx0XHRcdHRoaXMucmVnaXN0cnkuZ2V0PFdpZGdldEJhc2U+KG5vZGUud2lkZ2V0Q29uc3RydWN0b3IpIHx8IG5vZGUud2lkZ2V0Q29uc3RydWN0b3I7XG5cdFx0XHR9XG5cdFx0XHRpZiAoIW5vZGUuYmluZCkge1xuXHRcdFx0XHRub2RlLmJpbmQgPSB0aGlzO1xuXHRcdFx0fVxuXHRcdFx0Y29udmVydGVkTm9kZXMucHVzaChub2RlKTtcblx0XHRcdGlmIChub2RlLmNoaWxkcmVuICYmIG5vZGUuY2hpbGRyZW4ubGVuZ3RoKSB7XG5cdFx0XHRcdG5vZGUuY2hpbGRyZW4gPSB0aGlzLl9maWx0ZXJBbmRDb252ZXJ0KG5vZGUuY2hpbGRyZW4pO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gaXNBcnJheSA/IGNvbnZlcnRlZE5vZGVzIDogY29udmVydGVkTm9kZXNbMF07XG5cdH1cblxuXHRwdWJsaWMgX19yZW5kZXJfXygpOiAoV05vZGUgfCBWTm9kZSkgfCAoV05vZGUgfCBWTm9kZSlbXSB7XG5cdFx0Y29uc3QgaW5zdGFuY2VEYXRhID0gd2lkZ2V0SW5zdGFuY2VNYXAuZ2V0KHRoaXMpO1xuXHRcdGlmIChpbnN0YW5jZURhdGEpIHtcblx0XHRcdGluc3RhbmNlRGF0YS5kaXJ0eSA9IGZhbHNlO1xuXHRcdH1cblx0XHRjb25zdCByZW5kZXIgPSB0aGlzLl9ydW5CZWZvcmVSZW5kZXJzKCk7XG5cdFx0Y29uc3QgZE5vZGUgPSB0aGlzLl9maWx0ZXJBbmRDb252ZXJ0KHRoaXMuX3J1bkFmdGVyUmVuZGVycyhyZW5kZXIoKSkpO1xuXHRcdHRoaXMuX25vZGVIYW5kbGVyLmNsZWFyKCk7XG5cdFx0cmV0dXJuIGROb2RlO1xuXHR9XG5cblx0cHVibGljIGludmFsaWRhdGUoKTogdm9pZCB7XG5cdFx0Y29uc3QgaW5zdGFuY2VEYXRhID0gd2lkZ2V0SW5zdGFuY2VNYXAuZ2V0KHRoaXMpO1xuXHRcdGlmIChpbnN0YW5jZURhdGEgJiYgaW5zdGFuY2VEYXRhLmludmFsaWRhdGUpIHtcblx0XHRcdGluc3RhbmNlRGF0YS5pbnZhbGlkYXRlKCk7XG5cdFx0fVxuXHR9XG5cblx0cHJvdGVjdGVkIHJlbmRlcigpOiBETm9kZSB8IEROb2RlW10ge1xuXHRcdHJldHVybiB2KCdkaXYnLCB7fSwgdGhpcy5jaGlsZHJlbik7XG5cdH1cblxuXHQvKipcblx0ICogRnVuY3Rpb24gdG8gYWRkIGRlY29yYXRvcnMgdG8gV2lkZ2V0QmFzZVxuXHQgKlxuXHQgKiBAcGFyYW0gZGVjb3JhdG9yS2V5IFRoZSBrZXkgb2YgdGhlIGRlY29yYXRvclxuXHQgKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIG9mIHRoZSBkZWNvcmF0b3Jcblx0ICovXG5cdHByb3RlY3RlZCBhZGREZWNvcmF0b3IoZGVjb3JhdG9yS2V5OiBzdHJpbmcsIHZhbHVlOiBhbnkpOiB2b2lkIHtcblx0XHR2YWx1ZSA9IEFycmF5LmlzQXJyYXkodmFsdWUpID8gdmFsdWUgOiBbdmFsdWVdO1xuXHRcdGlmICh0aGlzLmhhc093blByb3BlcnR5KCdjb25zdHJ1Y3RvcicpKSB7XG5cdFx0XHRsZXQgZGVjb3JhdG9yTGlzdCA9IGRlY29yYXRvck1hcC5nZXQodGhpcy5jb25zdHJ1Y3Rvcik7XG5cdFx0XHRpZiAoIWRlY29yYXRvckxpc3QpIHtcblx0XHRcdFx0ZGVjb3JhdG9yTGlzdCA9IG5ldyBNYXA8c3RyaW5nLCBhbnlbXT4oKTtcblx0XHRcdFx0ZGVjb3JhdG9yTWFwLnNldCh0aGlzLmNvbnN0cnVjdG9yLCBkZWNvcmF0b3JMaXN0KTtcblx0XHRcdH1cblxuXHRcdFx0bGV0IHNwZWNpZmljRGVjb3JhdG9yTGlzdCA9IGRlY29yYXRvckxpc3QuZ2V0KGRlY29yYXRvcktleSk7XG5cdFx0XHRpZiAoIXNwZWNpZmljRGVjb3JhdG9yTGlzdCkge1xuXHRcdFx0XHRzcGVjaWZpY0RlY29yYXRvckxpc3QgPSBbXTtcblx0XHRcdFx0ZGVjb3JhdG9yTGlzdC5zZXQoZGVjb3JhdG9yS2V5LCBzcGVjaWZpY0RlY29yYXRvckxpc3QpO1xuXHRcdFx0fVxuXHRcdFx0c3BlY2lmaWNEZWNvcmF0b3JMaXN0LnB1c2goLi4udmFsdWUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBkZWNvcmF0b3JzID0gdGhpcy5nZXREZWNvcmF0b3IoZGVjb3JhdG9yS2V5KTtcblx0XHRcdHRoaXMuX2RlY29yYXRvckNhY2hlLnNldChkZWNvcmF0b3JLZXksIFsuLi5kZWNvcmF0b3JzLCAuLi52YWx1ZV0pO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBGdW5jdGlvbiB0byBidWlsZCB0aGUgbGlzdCBvZiBkZWNvcmF0b3JzIGZyb20gdGhlIGdsb2JhbCBkZWNvcmF0b3IgbWFwLlxuXHQgKlxuXHQgKiBAcGFyYW0gZGVjb3JhdG9yS2V5ICBUaGUga2V5IG9mIHRoZSBkZWNvcmF0b3Jcblx0ICogQHJldHVybiBBbiBhcnJheSBvZiBkZWNvcmF0b3IgdmFsdWVzXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRwcml2YXRlIF9idWlsZERlY29yYXRvckxpc3QoZGVjb3JhdG9yS2V5OiBzdHJpbmcpOiBhbnlbXSB7XG5cdFx0Y29uc3QgYWxsRGVjb3JhdG9ycyA9IFtdO1xuXG5cdFx0bGV0IGNvbnN0cnVjdG9yID0gdGhpcy5jb25zdHJ1Y3RvcjtcblxuXHRcdHdoaWxlIChjb25zdHJ1Y3Rvcikge1xuXHRcdFx0Y29uc3QgaW5zdGFuY2VNYXAgPSBkZWNvcmF0b3JNYXAuZ2V0KGNvbnN0cnVjdG9yKTtcblx0XHRcdGlmIChpbnN0YW5jZU1hcCkge1xuXHRcdFx0XHRjb25zdCBkZWNvcmF0b3JzID0gaW5zdGFuY2VNYXAuZ2V0KGRlY29yYXRvcktleSk7XG5cblx0XHRcdFx0aWYgKGRlY29yYXRvcnMpIHtcblx0XHRcdFx0XHRhbGxEZWNvcmF0b3JzLnVuc2hpZnQoLi4uZGVjb3JhdG9ycyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Y29uc3RydWN0b3IgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoY29uc3RydWN0b3IpO1xuXHRcdH1cblxuXHRcdHJldHVybiBhbGxEZWNvcmF0b3JzO1xuXHR9XG5cblx0LyoqXG5cdCAqIEZ1bmN0aW9uIHRvIHJldHJpZXZlIGRlY29yYXRvciB2YWx1ZXNcblx0ICpcblx0ICogQHBhcmFtIGRlY29yYXRvcktleSBUaGUga2V5IG9mIHRoZSBkZWNvcmF0b3Jcblx0ICogQHJldHVybnMgQW4gYXJyYXkgb2YgZGVjb3JhdG9yIHZhbHVlc1xuXHQgKi9cblx0cHJvdGVjdGVkIGdldERlY29yYXRvcihkZWNvcmF0b3JLZXk6IHN0cmluZyk6IGFueVtdIHtcblx0XHRsZXQgYWxsRGVjb3JhdG9ycyA9IHRoaXMuX2RlY29yYXRvckNhY2hlLmdldChkZWNvcmF0b3JLZXkpO1xuXG5cdFx0aWYgKGFsbERlY29yYXRvcnMgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cmV0dXJuIGFsbERlY29yYXRvcnM7XG5cdFx0fVxuXG5cdFx0YWxsRGVjb3JhdG9ycyA9IHRoaXMuX2J1aWxkRGVjb3JhdG9yTGlzdChkZWNvcmF0b3JLZXkpO1xuXG5cdFx0dGhpcy5fZGVjb3JhdG9yQ2FjaGUuc2V0KGRlY29yYXRvcktleSwgYWxsRGVjb3JhdG9ycyk7XG5cdFx0cmV0dXJuIGFsbERlY29yYXRvcnM7XG5cdH1cblxuXHQvKipcblx0ICogQmluZHMgdW5ib3VuZCBwcm9wZXJ0eSBmdW5jdGlvbnMgdG8gdGhlIHNwZWNpZmllZCBgYmluZGAgcHJvcGVydHlcblx0ICpcblx0ICogQHBhcmFtIHByb3BlcnRpZXMgcHJvcGVydGllcyB0byBjaGVjayBmb3IgZnVuY3Rpb25zXG5cdCAqL1xuXHRwcml2YXRlIF9iaW5kRnVuY3Rpb25Qcm9wZXJ0eShwcm9wZXJ0eTogYW55LCBiaW5kOiBhbnkpOiBhbnkge1xuXHRcdGlmICh0eXBlb2YgcHJvcGVydHkgPT09ICdmdW5jdGlvbicgJiYgIXByb3BlcnR5W25vQmluZF0gJiYgaXNXaWRnZXRCYXNlQ29uc3RydWN0b3IocHJvcGVydHkpID09PSBmYWxzZSkge1xuXHRcdFx0aWYgKHRoaXMuX2JpbmRGdW5jdGlvblByb3BlcnR5TWFwID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0dGhpcy5fYmluZEZ1bmN0aW9uUHJvcGVydHlNYXAgPSBuZXcgV2Vha01hcDxcblx0XHRcdFx0XHQoLi4uYXJnczogYW55W10pID0+IGFueSxcblx0XHRcdFx0XHR7IGJvdW5kRnVuYzogKC4uLmFyZ3M6IGFueVtdKSA9PiBhbnk7IHNjb3BlOiBhbnkgfVxuXHRcdFx0XHQ+KCk7XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBiaW5kSW5mbzogUGFydGlhbDxCb3VuZEZ1bmN0aW9uRGF0YT4gPSB0aGlzLl9iaW5kRnVuY3Rpb25Qcm9wZXJ0eU1hcC5nZXQocHJvcGVydHkpIHx8IHt9O1xuXHRcdFx0bGV0IHsgYm91bmRGdW5jLCBzY29wZSB9ID0gYmluZEluZm87XG5cblx0XHRcdGlmIChib3VuZEZ1bmMgPT09IHVuZGVmaW5lZCB8fCBzY29wZSAhPT0gYmluZCkge1xuXHRcdFx0XHRib3VuZEZ1bmMgPSBwcm9wZXJ0eS5iaW5kKGJpbmQpIGFzICguLi5hcmdzOiBhbnlbXSkgPT4gYW55O1xuXHRcdFx0XHR0aGlzLl9iaW5kRnVuY3Rpb25Qcm9wZXJ0eU1hcC5zZXQocHJvcGVydHksIHsgYm91bmRGdW5jLCBzY29wZTogYmluZCB9KTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBib3VuZEZ1bmM7XG5cdFx0fVxuXHRcdHJldHVybiBwcm9wZXJ0eTtcblx0fVxuXG5cdHB1YmxpYyBnZXQgcmVnaXN0cnkoKTogUmVnaXN0cnlIYW5kbGVyIHtcblx0XHRpZiAodGhpcy5fcmVnaXN0cnkgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0dGhpcy5fcmVnaXN0cnkgPSBuZXcgUmVnaXN0cnlIYW5kbGVyKCk7XG5cdFx0XHR0aGlzLm93bih0aGlzLl9yZWdpc3RyeSk7XG5cdFx0XHR0aGlzLm93bih0aGlzLl9yZWdpc3RyeS5vbignaW52YWxpZGF0ZScsIHRoaXMuX2JvdW5kSW52YWxpZGF0ZSkpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5fcmVnaXN0cnk7XG5cdH1cblxuXHRwcml2YXRlIF9ydW5CZWZvcmVQcm9wZXJ0aWVzKHByb3BlcnRpZXM6IGFueSkge1xuXHRcdGNvbnN0IGJlZm9yZVByb3BlcnRpZXM6IEJlZm9yZVByb3BlcnRpZXNbXSA9IHRoaXMuZ2V0RGVjb3JhdG9yKCdiZWZvcmVQcm9wZXJ0aWVzJyk7XG5cdFx0aWYgKGJlZm9yZVByb3BlcnRpZXMubGVuZ3RoID4gMCkge1xuXHRcdFx0cmV0dXJuIGJlZm9yZVByb3BlcnRpZXMucmVkdWNlKFxuXHRcdFx0XHQocHJvcGVydGllcywgYmVmb3JlUHJvcGVydGllc0Z1bmN0aW9uKSA9PiB7XG5cdFx0XHRcdFx0cmV0dXJuIHsgLi4ucHJvcGVydGllcywgLi4uYmVmb3JlUHJvcGVydGllc0Z1bmN0aW9uLmNhbGwodGhpcywgcHJvcGVydGllcykgfTtcblx0XHRcdFx0fSxcblx0XHRcdFx0eyAuLi5wcm9wZXJ0aWVzIH1cblx0XHRcdCk7XG5cdFx0fVxuXHRcdHJldHVybiBwcm9wZXJ0aWVzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJ1biBhbGwgcmVnaXN0ZXJlZCBiZWZvcmUgcmVuZGVycyBhbmQgcmV0dXJuIHRoZSB1cGRhdGVkIHJlbmRlciBtZXRob2Rcblx0ICovXG5cdHByaXZhdGUgX3J1bkJlZm9yZVJlbmRlcnMoKTogUmVuZGVyIHtcblx0XHRjb25zdCBiZWZvcmVSZW5kZXJzID0gdGhpcy5nZXREZWNvcmF0b3IoJ2JlZm9yZVJlbmRlcicpO1xuXG5cdFx0aWYgKGJlZm9yZVJlbmRlcnMubGVuZ3RoID4gMCkge1xuXHRcdFx0cmV0dXJuIGJlZm9yZVJlbmRlcnMucmVkdWNlKChyZW5kZXI6IFJlbmRlciwgYmVmb3JlUmVuZGVyRnVuY3Rpb246IEJlZm9yZVJlbmRlcikgPT4ge1xuXHRcdFx0XHRjb25zdCB1cGRhdGVkUmVuZGVyID0gYmVmb3JlUmVuZGVyRnVuY3Rpb24uY2FsbCh0aGlzLCByZW5kZXIsIHRoaXMuX3Byb3BlcnRpZXMsIHRoaXMuX2NoaWxkcmVuKTtcblx0XHRcdFx0aWYgKCF1cGRhdGVkUmVuZGVyKSB7XG5cdFx0XHRcdFx0Y29uc29sZS53YXJuKCdSZW5kZXIgZnVuY3Rpb24gbm90IHJldHVybmVkIGZyb20gYmVmb3JlUmVuZGVyLCB1c2luZyBwcmV2aW91cyByZW5kZXInKTtcblx0XHRcdFx0XHRyZXR1cm4gcmVuZGVyO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiB1cGRhdGVkUmVuZGVyO1xuXHRcdFx0fSwgdGhpcy5fYm91bmRSZW5kZXJGdW5jKTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuX2JvdW5kUmVuZGVyRnVuYztcblx0fVxuXG5cdC8qKlxuXHQgKiBSdW4gYWxsIHJlZ2lzdGVyZWQgYWZ0ZXIgcmVuZGVycyBhbmQgcmV0dXJuIHRoZSBkZWNvcmF0ZWQgRE5vZGVzXG5cdCAqXG5cdCAqIEBwYXJhbSBkTm9kZSBUaGUgRE5vZGVzIHRvIHJ1biB0aHJvdWdoIHRoZSBhZnRlciByZW5kZXJzXG5cdCAqL1xuXHRwcml2YXRlIF9ydW5BZnRlclJlbmRlcnMoZE5vZGU6IEROb2RlIHwgRE5vZGVbXSk6IEROb2RlIHwgRE5vZGVbXSB7XG5cdFx0Y29uc3QgYWZ0ZXJSZW5kZXJzID0gdGhpcy5nZXREZWNvcmF0b3IoJ2FmdGVyUmVuZGVyJyk7XG5cblx0XHRpZiAoYWZ0ZXJSZW5kZXJzLmxlbmd0aCA+IDApIHtcblx0XHRcdGROb2RlID0gYWZ0ZXJSZW5kZXJzLnJlZHVjZSgoZE5vZGU6IEROb2RlIHwgRE5vZGVbXSwgYWZ0ZXJSZW5kZXJGdW5jdGlvbjogQWZ0ZXJSZW5kZXIpID0+IHtcblx0XHRcdFx0cmV0dXJuIGFmdGVyUmVuZGVyRnVuY3Rpb24uY2FsbCh0aGlzLCBkTm9kZSk7XG5cdFx0XHR9LCBkTm9kZSk7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuX21ldGFNYXAgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0dGhpcy5fbWV0YU1hcC5mb3JFYWNoKChtZXRhKSA9PiB7XG5cdFx0XHRcdG1ldGEuYWZ0ZXJSZW5kZXIoKTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHJldHVybiBkTm9kZTtcblx0fVxuXG5cdHByaXZhdGUgX3J1bkFmdGVyQ29uc3RydWN0b3JzKCk6IHZvaWQge1xuXHRcdGNvbnN0IGFmdGVyQ29uc3RydWN0b3JzID0gdGhpcy5nZXREZWNvcmF0b3IoJ2FmdGVyQ29uc3RydWN0b3InKTtcblxuXHRcdGlmIChhZnRlckNvbnN0cnVjdG9ycy5sZW5ndGggPiAwKSB7XG5cdFx0XHRhZnRlckNvbnN0cnVjdG9ycy5mb3JFYWNoKChhZnRlckNvbnN0cnVjdG9yKSA9PiBhZnRlckNvbnN0cnVjdG9yLmNhbGwodGhpcykpO1xuXHRcdH1cblx0fVxuXG5cdHByb3RlY3RlZCBvd24oaGFuZGxlOiBIYW5kbGUpOiB2b2lkIHtcblx0XHR0aGlzLl9oYW5kbGVzLnB1c2goaGFuZGxlKTtcblx0fVxuXG5cdHByb3RlY3RlZCBkZXN0cm95KCkge1xuXHRcdHdoaWxlICh0aGlzLl9oYW5kbGVzLmxlbmd0aCA+IDApIHtcblx0XHRcdGNvbnN0IGhhbmRsZSA9IHRoaXMuX2hhbmRsZXMucG9wKCk7XG5cdFx0XHRpZiAoaGFuZGxlKSB7XG5cdFx0XHRcdGhhbmRsZS5kZXN0cm95KCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFdpZGdldEJhc2U7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gV2lkZ2V0QmFzZS50cyIsImltcG9ydCB7IFZOb2RlUHJvcGVydGllcyB9IGZyb20gJy4vLi4vaW50ZXJmYWNlcyc7XG5cbmxldCBicm93c2VyU3BlY2lmaWNUcmFuc2l0aW9uRW5kRXZlbnROYW1lID0gJyc7XG5sZXQgYnJvd3NlclNwZWNpZmljQW5pbWF0aW9uRW5kRXZlbnROYW1lID0gJyc7XG5cbmZ1bmN0aW9uIGRldGVybWluZUJyb3dzZXJTdHlsZU5hbWVzKGVsZW1lbnQ6IEhUTUxFbGVtZW50KSB7XG5cdGlmICgnV2Via2l0VHJhbnNpdGlvbicgaW4gZWxlbWVudC5zdHlsZSkge1xuXHRcdGJyb3dzZXJTcGVjaWZpY1RyYW5zaXRpb25FbmRFdmVudE5hbWUgPSAnd2Via2l0VHJhbnNpdGlvbkVuZCc7XG5cdFx0YnJvd3NlclNwZWNpZmljQW5pbWF0aW9uRW5kRXZlbnROYW1lID0gJ3dlYmtpdEFuaW1hdGlvbkVuZCc7XG5cdH0gZWxzZSBpZiAoJ3RyYW5zaXRpb24nIGluIGVsZW1lbnQuc3R5bGUgfHwgJ01velRyYW5zaXRpb24nIGluIGVsZW1lbnQuc3R5bGUpIHtcblx0XHRicm93c2VyU3BlY2lmaWNUcmFuc2l0aW9uRW5kRXZlbnROYW1lID0gJ3RyYW5zaXRpb25lbmQnO1xuXHRcdGJyb3dzZXJTcGVjaWZpY0FuaW1hdGlvbkVuZEV2ZW50TmFtZSA9ICdhbmltYXRpb25lbmQnO1xuXHR9IGVsc2Uge1xuXHRcdHRocm93IG5ldyBFcnJvcignWW91ciBicm93c2VyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcblx0fVxufVxuXG5mdW5jdGlvbiBpbml0aWFsaXplKGVsZW1lbnQ6IEhUTUxFbGVtZW50KSB7XG5cdGlmIChicm93c2VyU3BlY2lmaWNBbmltYXRpb25FbmRFdmVudE5hbWUgPT09ICcnKSB7XG5cdFx0ZGV0ZXJtaW5lQnJvd3NlclN0eWxlTmFtZXMoZWxlbWVudCk7XG5cdH1cbn1cblxuZnVuY3Rpb24gcnVuQW5kQ2xlYW5VcChlbGVtZW50OiBIVE1MRWxlbWVudCwgc3RhcnRBbmltYXRpb246ICgpID0+IHZvaWQsIGZpbmlzaEFuaW1hdGlvbjogKCkgPT4gdm9pZCkge1xuXHRpbml0aWFsaXplKGVsZW1lbnQpO1xuXG5cdGxldCBmaW5pc2hlZCA9IGZhbHNlO1xuXG5cdGxldCB0cmFuc2l0aW9uRW5kID0gZnVuY3Rpb24oKSB7XG5cdFx0aWYgKCFmaW5pc2hlZCkge1xuXHRcdFx0ZmluaXNoZWQgPSB0cnVlO1xuXHRcdFx0ZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGJyb3dzZXJTcGVjaWZpY1RyYW5zaXRpb25FbmRFdmVudE5hbWUsIHRyYW5zaXRpb25FbmQpO1xuXHRcdFx0ZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGJyb3dzZXJTcGVjaWZpY0FuaW1hdGlvbkVuZEV2ZW50TmFtZSwgdHJhbnNpdGlvbkVuZCk7XG5cblx0XHRcdGZpbmlzaEFuaW1hdGlvbigpO1xuXHRcdH1cblx0fTtcblxuXHRzdGFydEFuaW1hdGlvbigpO1xuXG5cdGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihicm93c2VyU3BlY2lmaWNBbmltYXRpb25FbmRFdmVudE5hbWUsIHRyYW5zaXRpb25FbmQpO1xuXHRlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoYnJvd3NlclNwZWNpZmljVHJhbnNpdGlvbkVuZEV2ZW50TmFtZSwgdHJhbnNpdGlvbkVuZCk7XG59XG5cbmZ1bmN0aW9uIGV4aXQobm9kZTogSFRNTEVsZW1lbnQsIHByb3BlcnRpZXM6IFZOb2RlUHJvcGVydGllcywgZXhpdEFuaW1hdGlvbjogc3RyaW5nLCByZW1vdmVOb2RlOiAoKSA9PiB2b2lkKSB7XG5cdGNvbnN0IGFjdGl2ZUNsYXNzID0gcHJvcGVydGllcy5leGl0QW5pbWF0aW9uQWN0aXZlIHx8IGAke2V4aXRBbmltYXRpb259LWFjdGl2ZWA7XG5cblx0cnVuQW5kQ2xlYW5VcChcblx0XHRub2RlLFxuXHRcdCgpID0+IHtcblx0XHRcdG5vZGUuY2xhc3NMaXN0LmFkZChleGl0QW5pbWF0aW9uKTtcblxuXHRcdFx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRub2RlLmNsYXNzTGlzdC5hZGQoYWN0aXZlQ2xhc3MpO1xuXHRcdFx0fSk7XG5cdFx0fSxcblx0XHQoKSA9PiB7XG5cdFx0XHRyZW1vdmVOb2RlKCk7XG5cdFx0fVxuXHQpO1xufVxuXG5mdW5jdGlvbiBlbnRlcihub2RlOiBIVE1MRWxlbWVudCwgcHJvcGVydGllczogVk5vZGVQcm9wZXJ0aWVzLCBlbnRlckFuaW1hdGlvbjogc3RyaW5nKSB7XG5cdGNvbnN0IGFjdGl2ZUNsYXNzID0gcHJvcGVydGllcy5lbnRlckFuaW1hdGlvbkFjdGl2ZSB8fCBgJHtlbnRlckFuaW1hdGlvbn0tYWN0aXZlYDtcblxuXHRydW5BbmRDbGVhblVwKFxuXHRcdG5vZGUsXG5cdFx0KCkgPT4ge1xuXHRcdFx0bm9kZS5jbGFzc0xpc3QuYWRkKGVudGVyQW5pbWF0aW9uKTtcblxuXHRcdFx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRub2RlLmNsYXNzTGlzdC5hZGQoYWN0aXZlQ2xhc3MpO1xuXHRcdFx0fSk7XG5cdFx0fSxcblx0XHQoKSA9PiB7XG5cdFx0XHRub2RlLmNsYXNzTGlzdC5yZW1vdmUoZW50ZXJBbmltYXRpb24pO1xuXHRcdFx0bm9kZS5jbGFzc0xpc3QucmVtb3ZlKGFjdGl2ZUNsYXNzKTtcblx0XHR9XG5cdCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcblx0ZW50ZXIsXG5cdGV4aXRcbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gY3NzVHJhbnNpdGlvbnMudHMiLCJpbXBvcnQge1xuXHRDb25zdHJ1Y3Rvcixcblx0RGVmYXVsdFdpZGdldEJhc2VJbnRlcmZhY2UsXG5cdERlZmVycmVkVmlydHVhbFByb3BlcnRpZXMsXG5cdEROb2RlLFxuXHRWTm9kZSxcblx0UmVnaXN0cnlMYWJlbCxcblx0Vk5vZGVQcm9wZXJ0aWVzLFxuXHRXaWRnZXRCYXNlSW50ZXJmYWNlLFxuXHRXTm9kZSxcblx0RG9tT3B0aW9ucyxcblx0UmVuZGVyUmVzdWx0LFxuXHREb21WTm9kZSxcblx0TGF6eVdpZGdldCxcblx0TGF6eURlZmluZVxufSBmcm9tICcuL2ludGVyZmFjZXMnO1xuXG4vKipcbiAqIFRoZSBpZGVudGlmaWVyIGZvciBhIFdOb2RlIHR5cGVcbiAqL1xuZXhwb3J0IGNvbnN0IFdOT0RFID0gJ19fV05PREVfVFlQRSc7XG5cbi8qKlxuICogVGhlIGlkZW50aWZpZXIgZm9yIGEgVk5vZGUgdHlwZVxuICovXG5leHBvcnQgY29uc3QgVk5PREUgPSAnX19WTk9ERV9UWVBFJztcblxuLyoqXG4gKiBUaGUgaWRlbnRpZmllciBmb3IgYSBWTm9kZSB0eXBlIGNyZWF0ZWQgdXNpbmcgZG9tKClcbiAqL1xuZXhwb3J0IGNvbnN0IERPTVZOT0RFID0gJ19fRE9NVk5PREVfVFlQRSc7XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0cnVlIGlmIHRoZSBgRE5vZGVgIGlzIGEgYFdOb2RlYCB1c2luZyB0aGUgYHR5cGVgIHByb3BlcnR5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1dOb2RlPFcgZXh0ZW5kcyBXaWRnZXRCYXNlSW50ZXJmYWNlID0gRGVmYXVsdFdpZGdldEJhc2VJbnRlcmZhY2U+KFxuXHRjaGlsZDogRE5vZGU8Vz4gfCBhbnlcbik6IGNoaWxkIGlzIFdOb2RlPFc+IHtcblx0cmV0dXJuIEJvb2xlYW4oY2hpbGQgJiYgdHlwZW9mIGNoaWxkICE9PSAnc3RyaW5nJyAmJiBjaGlsZC50eXBlID09PSBXTk9ERSk7XG59XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0cnVlIGlmIHRoZSBgRE5vZGVgIGlzIGEgYFZOb2RlYCB1c2luZyB0aGUgYHR5cGVgIHByb3BlcnR5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1ZOb2RlKGNoaWxkOiBETm9kZSk6IGNoaWxkIGlzIFZOb2RlIHtcblx0cmV0dXJuIEJvb2xlYW4oY2hpbGQgJiYgdHlwZW9mIGNoaWxkICE9PSAnc3RyaW5nJyAmJiAoY2hpbGQudHlwZSA9PT0gVk5PREUgfHwgY2hpbGQudHlwZSA9PT0gRE9NVk5PREUpKTtcbn1cblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRydWUgaWYgdGhlIGBETm9kZWAgaXMgYSBgVk5vZGVgIGNyZWF0ZWQgd2l0aCBgZG9tKClgIHVzaW5nIHRoZSBgdHlwZWAgcHJvcGVydHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRG9tVk5vZGUoY2hpbGQ6IEROb2RlKTogY2hpbGQgaXMgRG9tVk5vZGUge1xuXHRyZXR1cm4gQm9vbGVhbihjaGlsZCAmJiB0eXBlb2YgY2hpbGQgIT09ICdzdHJpbmcnICYmIGNoaWxkLnR5cGUgPT09IERPTVZOT0RFKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRWxlbWVudE5vZGUodmFsdWU6IGFueSk6IHZhbHVlIGlzIEVsZW1lbnQge1xuXHRyZXR1cm4gISF2YWx1ZS50YWdOYW1lO1xufVxuXG4vKipcbiAqIEludGVyZmFjZSBmb3IgdGhlIGRlY29yYXRlIG1vZGlmaWVyXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTW9kaWZpZXI8VCBleHRlbmRzIEROb2RlPiB7XG5cdChkTm9kZTogVCwgYnJlYWtlcjogKCkgPT4gdm9pZCk6IHZvaWQ7XG59XG5cbi8qKlxuICogVGhlIHByZWRpY2F0ZSBmdW5jdGlvbiBmb3IgZGVjb3JhdGVcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBQcmVkaWNhdGU8VCBleHRlbmRzIEROb2RlPiB7XG5cdChkTm9kZTogRE5vZGUpOiBkTm9kZSBpcyBUO1xufVxuXG4vKipcbiAqIERlY29yYXRvciBvcHRpb25zXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRGVjb3JhdGVPcHRpb25zPFQgZXh0ZW5kcyBETm9kZT4ge1xuXHRtb2RpZmllcjogTW9kaWZpZXI8VD47XG5cdHByZWRpY2F0ZT86IFByZWRpY2F0ZTxUPjtcblx0c2hhbGxvdz86IGJvb2xlYW47XG59XG5cbi8qKlxuICogR2VuZXJpYyBkZWNvcmF0ZSBmdW5jdGlvbiBmb3IgRE5vZGVzLiBUaGUgbm9kZXMgYXJlIG1vZGlmaWVkIGluIHBsYWNlIGJhc2VkIG9uIHRoZSBwcm92aWRlZCBwcmVkaWNhdGVcbiAqIGFuZCBtb2RpZmllciBmdW5jdGlvbnMuXG4gKlxuICogVGhlIGNoaWxkcmVuIG9mIGVhY2ggbm9kZSBhcmUgZmxhdHRlbmVkIGFuZCBhZGRlZCB0byB0aGUgYXJyYXkgZm9yIGRlY29yYXRpb24uXG4gKlxuICogSWYgbm8gcHJlZGljYXRlIGlzIHN1cHBsaWVkIHRoZW4gdGhlIG1vZGlmaWVyIHdpbGwgYmUgZXhlY3V0ZWQgb24gYWxsIG5vZGVzLiBBIGBicmVha2VyYCBmdW5jdGlvbiBpcyBwYXNzZWQgdG8gdGhlXG4gKiBtb2RpZmllciB3aGljaCB3aWxsIGRyYWluIHRoZSBub2RlcyBhcnJheSBhbmQgZXhpdCB0aGUgZGVjb3JhdGlvbi5cbiAqXG4gKiBXaGVuIHRoZSBgc2hhbGxvd2Agb3B0aW9ucyBpcyBzZXQgdG8gYHRydWVgIHRoZSBvbmx5IHRoZSB0b3Agbm9kZSBvciBub2RlcyB3aWxsIGJlIGRlY29yYXRlZCAob25seSBzdXBwb3J0ZWQgdXNpbmdcbiAqIGBEZWNvcmF0ZU9wdGlvbnNgKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlY29yYXRlPFQgZXh0ZW5kcyBETm9kZT4oZE5vZGVzOiBETm9kZSwgb3B0aW9uczogRGVjb3JhdGVPcHRpb25zPFQ+KTogRE5vZGU7XG5leHBvcnQgZnVuY3Rpb24gZGVjb3JhdGU8VCBleHRlbmRzIEROb2RlPihkTm9kZXM6IEROb2RlW10sIG9wdGlvbnM6IERlY29yYXRlT3B0aW9uczxUPik6IEROb2RlW107XG5leHBvcnQgZnVuY3Rpb24gZGVjb3JhdGU8VCBleHRlbmRzIEROb2RlPihkTm9kZXM6IEROb2RlIHwgRE5vZGVbXSwgb3B0aW9uczogRGVjb3JhdGVPcHRpb25zPFQ+KTogRE5vZGUgfCBETm9kZVtdO1xuZXhwb3J0IGZ1bmN0aW9uIGRlY29yYXRlPFQgZXh0ZW5kcyBETm9kZT4oZE5vZGVzOiBETm9kZSwgbW9kaWZpZXI6IE1vZGlmaWVyPFQ+LCBwcmVkaWNhdGU6IFByZWRpY2F0ZTxUPik6IEROb2RlO1xuZXhwb3J0IGZ1bmN0aW9uIGRlY29yYXRlPFQgZXh0ZW5kcyBETm9kZT4oZE5vZGVzOiBETm9kZVtdLCBtb2RpZmllcjogTW9kaWZpZXI8VD4sIHByZWRpY2F0ZTogUHJlZGljYXRlPFQ+KTogRE5vZGVbXTtcbmV4cG9ydCBmdW5jdGlvbiBkZWNvcmF0ZTxUIGV4dGVuZHMgRE5vZGU+KFxuXHRkTm9kZXM6IFJlbmRlclJlc3VsdCxcblx0bW9kaWZpZXI6IE1vZGlmaWVyPFQ+LFxuXHRwcmVkaWNhdGU6IFByZWRpY2F0ZTxUPlxuKTogUmVuZGVyUmVzdWx0O1xuZXhwb3J0IGZ1bmN0aW9uIGRlY29yYXRlKGROb2RlczogRE5vZGUsIG1vZGlmaWVyOiBNb2RpZmllcjxETm9kZT4pOiBETm9kZTtcbmV4cG9ydCBmdW5jdGlvbiBkZWNvcmF0ZShkTm9kZXM6IEROb2RlW10sIG1vZGlmaWVyOiBNb2RpZmllcjxETm9kZT4pOiBETm9kZVtdO1xuZXhwb3J0IGZ1bmN0aW9uIGRlY29yYXRlKGROb2RlczogUmVuZGVyUmVzdWx0LCBtb2RpZmllcjogTW9kaWZpZXI8RE5vZGU+KTogUmVuZGVyUmVzdWx0O1xuZXhwb3J0IGZ1bmN0aW9uIGRlY29yYXRlKFxuXHRkTm9kZXM6IEROb2RlIHwgRE5vZGVbXSxcblx0b3B0aW9uc09yTW9kaWZpZXI6IE1vZGlmaWVyPEROb2RlPiB8IERlY29yYXRlT3B0aW9uczxETm9kZT4sXG5cdHByZWRpY2F0ZT86IFByZWRpY2F0ZTxETm9kZT5cbik6IEROb2RlIHwgRE5vZGVbXSB7XG5cdGxldCBzaGFsbG93ID0gZmFsc2U7XG5cdGxldCBtb2RpZmllcjtcblx0aWYgKHR5cGVvZiBvcHRpb25zT3JNb2RpZmllciA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdG1vZGlmaWVyID0gb3B0aW9uc09yTW9kaWZpZXI7XG5cdH0gZWxzZSB7XG5cdFx0bW9kaWZpZXIgPSBvcHRpb25zT3JNb2RpZmllci5tb2RpZmllcjtcblx0XHRwcmVkaWNhdGUgPSBvcHRpb25zT3JNb2RpZmllci5wcmVkaWNhdGU7XG5cdFx0c2hhbGxvdyA9IG9wdGlvbnNPck1vZGlmaWVyLnNoYWxsb3cgfHwgZmFsc2U7XG5cdH1cblxuXHRsZXQgbm9kZXMgPSBBcnJheS5pc0FycmF5KGROb2RlcykgPyBbLi4uZE5vZGVzXSA6IFtkTm9kZXNdO1xuXHRmdW5jdGlvbiBicmVha2VyKCkge1xuXHRcdG5vZGVzID0gW107XG5cdH1cblx0d2hpbGUgKG5vZGVzLmxlbmd0aCkge1xuXHRcdGNvbnN0IG5vZGUgPSBub2Rlcy5zaGlmdCgpO1xuXHRcdGlmIChub2RlKSB7XG5cdFx0XHRpZiAoIXNoYWxsb3cgJiYgKGlzV05vZGUobm9kZSkgfHwgaXNWTm9kZShub2RlKSkgJiYgbm9kZS5jaGlsZHJlbikge1xuXHRcdFx0XHRub2RlcyA9IFsuLi5ub2RlcywgLi4ubm9kZS5jaGlsZHJlbl07XG5cdFx0XHR9XG5cdFx0XHRpZiAoIXByZWRpY2F0ZSB8fCBwcmVkaWNhdGUobm9kZSkpIHtcblx0XHRcdFx0bW9kaWZpZXIobm9kZSwgYnJlYWtlcik7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiBkTm9kZXM7XG59XG5cbi8qKlxuICogV3JhcHBlciBmdW5jdGlvbiBmb3IgY2FsbHMgdG8gY3JlYXRlIGEgd2lkZ2V0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gdzxXIGV4dGVuZHMgV2lkZ2V0QmFzZUludGVyZmFjZT4oXG5cdG5vZGU6IFdOb2RlPFc+LFxuXHRwcm9wZXJ0aWVzOiBQYXJ0aWFsPFdbJ3Byb3BlcnRpZXMnXT4sXG5cdGNoaWxkcmVuPzogV1snY2hpbGRyZW4nXVxuKTogV05vZGU8Vz47XG5leHBvcnQgZnVuY3Rpb24gdzxXIGV4dGVuZHMgV2lkZ2V0QmFzZUludGVyZmFjZT4oXG5cdHdpZGdldENvbnN0cnVjdG9yOiBDb25zdHJ1Y3RvcjxXPiB8IFJlZ2lzdHJ5TGFiZWwgfCBMYXp5V2lkZ2V0PFc+IHwgTGF6eURlZmluZTxXPixcblx0cHJvcGVydGllczogV1sncHJvcGVydGllcyddLFxuXHRjaGlsZHJlbj86IFdbJ2NoaWxkcmVuJ11cbik6IFdOb2RlPFc+O1xuZXhwb3J0IGZ1bmN0aW9uIHc8VyBleHRlbmRzIFdpZGdldEJhc2VJbnRlcmZhY2U+KFxuXHR3aWRnZXRDb25zdHJ1Y3Rvck9yTm9kZTogQ29uc3RydWN0b3I8Vz4gfCBSZWdpc3RyeUxhYmVsIHwgV05vZGU8Vz4gfCBMYXp5V2lkZ2V0PFc+IHwgTGF6eURlZmluZTxXPixcblx0cHJvcGVydGllczogV1sncHJvcGVydGllcyddLFxuXHRjaGlsZHJlbj86IFdbJ2NoaWxkcmVuJ11cbik6IFdOb2RlPFc+IHtcblx0aWYgKGlzV05vZGUod2lkZ2V0Q29uc3RydWN0b3JPck5vZGUpKSB7XG5cdFx0cHJvcGVydGllcyA9IHsgLi4uKHdpZGdldENvbnN0cnVjdG9yT3JOb2RlLnByb3BlcnRpZXMgYXMgYW55KSwgLi4uKHByb3BlcnRpZXMgYXMgYW55KSB9O1xuXHRcdGNoaWxkcmVuID0gY2hpbGRyZW4gPyBjaGlsZHJlbiA6IHdpZGdldENvbnN0cnVjdG9yT3JOb2RlLmNoaWxkcmVuO1xuXHRcdHdpZGdldENvbnN0cnVjdG9yT3JOb2RlID0gd2lkZ2V0Q29uc3RydWN0b3JPck5vZGUud2lkZ2V0Q29uc3RydWN0b3I7XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdGNoaWxkcmVuOiBjaGlsZHJlbiB8fCBbXSxcblx0XHR3aWRnZXRDb25zdHJ1Y3Rvcjogd2lkZ2V0Q29uc3RydWN0b3JPck5vZGUsXG5cdFx0cHJvcGVydGllcyxcblx0XHR0eXBlOiBXTk9ERVxuXHR9O1xufVxuXG4vKipcbiAqIFdyYXBwZXIgZnVuY3Rpb24gZm9yIGNhbGxzIHRvIGNyZWF0ZSBWTm9kZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2KG5vZGU6IFZOb2RlLCBwcm9wZXJ0aWVzOiBWTm9kZVByb3BlcnRpZXMsIGNoaWxkcmVuOiB1bmRlZmluZWQgfCBETm9kZVtdKTogVk5vZGU7XG5leHBvcnQgZnVuY3Rpb24gdihub2RlOiBWTm9kZSwgcHJvcGVydGllczogVk5vZGVQcm9wZXJ0aWVzKTogVk5vZGU7XG5leHBvcnQgZnVuY3Rpb24gdih0YWc6IHN0cmluZywgY2hpbGRyZW46IHVuZGVmaW5lZCB8IEROb2RlW10pOiBWTm9kZTtcbmV4cG9ydCBmdW5jdGlvbiB2KHRhZzogc3RyaW5nLCBwcm9wZXJ0aWVzOiBEZWZlcnJlZFZpcnR1YWxQcm9wZXJ0aWVzIHwgVk5vZGVQcm9wZXJ0aWVzLCBjaGlsZHJlbj86IEROb2RlW10pOiBWTm9kZTtcbmV4cG9ydCBmdW5jdGlvbiB2KHRhZzogc3RyaW5nKTogVk5vZGU7XG5leHBvcnQgZnVuY3Rpb24gdihcblx0dGFnOiBzdHJpbmcgfCBWTm9kZSxcblx0cHJvcGVydGllc09yQ2hpbGRyZW46IFZOb2RlUHJvcGVydGllcyB8IERlZmVycmVkVmlydHVhbFByb3BlcnRpZXMgfCBETm9kZVtdID0ge30sXG5cdGNoaWxkcmVuOiB1bmRlZmluZWQgfCBETm9kZVtdID0gdW5kZWZpbmVkXG4pOiBWTm9kZSB7XG5cdGxldCBwcm9wZXJ0aWVzOiBWTm9kZVByb3BlcnRpZXMgfCBEZWZlcnJlZFZpcnR1YWxQcm9wZXJ0aWVzID0gcHJvcGVydGllc09yQ2hpbGRyZW47XG5cdGxldCBkZWZlcnJlZFByb3BlcnRpZXNDYWxsYmFjaztcblxuXHRpZiAoQXJyYXkuaXNBcnJheShwcm9wZXJ0aWVzT3JDaGlsZHJlbikpIHtcblx0XHRjaGlsZHJlbiA9IHByb3BlcnRpZXNPckNoaWxkcmVuO1xuXHRcdHByb3BlcnRpZXMgPSB7fTtcblx0fVxuXG5cdGlmICh0eXBlb2YgcHJvcGVydGllcyA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdGRlZmVycmVkUHJvcGVydGllc0NhbGxiYWNrID0gcHJvcGVydGllcztcblx0XHRwcm9wZXJ0aWVzID0ge307XG5cdH1cblxuXHRpZiAoaXNWTm9kZSh0YWcpKSB7XG5cdFx0bGV0IHsgY2xhc3NlcyA9IFtdLCBzdHlsZXMgPSB7fSwgLi4ubmV3UHJvcGVydGllcyB9ID0gcHJvcGVydGllcztcblx0XHRsZXQgeyBjbGFzc2VzOiBub2RlQ2xhc3NlcyA9IFtdLCBzdHlsZXM6IG5vZGVTdHlsZXMgPSB7fSwgLi4ubm9kZVByb3BlcnRpZXMgfSA9IHRhZy5wcm9wZXJ0aWVzO1xuXHRcdG5vZGVDbGFzc2VzID0gQXJyYXkuaXNBcnJheShub2RlQ2xhc3NlcykgPyBub2RlQ2xhc3NlcyA6IFtub2RlQ2xhc3Nlc107XG5cdFx0Y2xhc3NlcyA9IEFycmF5LmlzQXJyYXkoY2xhc3NlcykgPyBjbGFzc2VzIDogW2NsYXNzZXNdO1xuXHRcdHN0eWxlcyA9IHsgLi4ubm9kZVN0eWxlcywgLi4uc3R5bGVzIH07XG5cdFx0cHJvcGVydGllcyA9IHsgLi4ubm9kZVByb3BlcnRpZXMsIC4uLm5ld1Byb3BlcnRpZXMsIGNsYXNzZXM6IFsuLi5ub2RlQ2xhc3NlcywgLi4uY2xhc3Nlc10sIHN0eWxlcyB9O1xuXHRcdGNoaWxkcmVuID0gY2hpbGRyZW4gPyBjaGlsZHJlbiA6IHRhZy5jaGlsZHJlbjtcblx0XHR0YWcgPSB0YWcudGFnO1xuXHR9XG5cblx0cmV0dXJuIHtcblx0XHR0YWcsXG5cdFx0ZGVmZXJyZWRQcm9wZXJ0aWVzQ2FsbGJhY2ssXG5cdFx0b3JpZ2luYWxQcm9wZXJ0aWVzOiB7fSxcblx0XHRjaGlsZHJlbixcblx0XHRwcm9wZXJ0aWVzLFxuXHRcdHR5cGU6IFZOT0RFXG5cdH07XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgVk5vZGUgZm9yIGFuIGV4aXN0aW5nIERPTSBOb2RlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZG9tKFxuXHR7IG5vZGUsIGF0dHJzID0ge30sIHByb3BzID0ge30sIG9uID0ge30sIGRpZmZUeXBlID0gJ25vbmUnLCBvbkF0dGFjaCB9OiBEb21PcHRpb25zLFxuXHRjaGlsZHJlbj86IEROb2RlW11cbik6IERvbVZOb2RlIHtcblx0cmV0dXJuIHtcblx0XHR0YWc6IGlzRWxlbWVudE5vZGUobm9kZSkgPyBub2RlLnRhZ05hbWUudG9Mb3dlckNhc2UoKSA6ICcnLFxuXHRcdHByb3BlcnRpZXM6IHByb3BzLFxuXHRcdGF0dHJpYnV0ZXM6IGF0dHJzLFxuXHRcdGV2ZW50czogb24sXG5cdFx0Y2hpbGRyZW4sXG5cdFx0dHlwZTogRE9NVk5PREUsXG5cdFx0ZG9tTm9kZTogbm9kZSxcblx0XHR0ZXh0OiBpc0VsZW1lbnROb2RlKG5vZGUpID8gdW5kZWZpbmVkIDogbm9kZS5kYXRhLFxuXHRcdGRpZmZUeXBlLFxuXHRcdG9uQXR0YWNoXG5cdH07XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gZC50cyIsImltcG9ydCB7IFdpZGdldEJhc2UgfSBmcm9tICcuLy4uL1dpZGdldEJhc2UnO1xuaW1wb3J0IHsgaGFuZGxlRGVjb3JhdG9yIH0gZnJvbSAnLi9oYW5kbGVEZWNvcmF0b3InO1xuaW1wb3J0IHsgYmVmb3JlUHJvcGVydGllcyB9IGZyb20gJy4vYmVmb3JlUHJvcGVydGllcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBhbHdheXNSZW5kZXIoKSB7XG5cdHJldHVybiBoYW5kbGVEZWNvcmF0b3IoKHRhcmdldCwgcHJvcGVydHlLZXkpID0+IHtcblx0XHRiZWZvcmVQcm9wZXJ0aWVzKGZ1bmN0aW9uKHRoaXM6IFdpZGdldEJhc2UpIHtcblx0XHRcdHRoaXMuaW52YWxpZGF0ZSgpO1xuXHRcdH0pKHRhcmdldCk7XG5cdH0pO1xufVxuXG5leHBvcnQgZGVmYXVsdCBhbHdheXNSZW5kZXI7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gYWx3YXlzUmVuZGVyLnRzIiwiaW1wb3J0IHsgaGFuZGxlRGVjb3JhdG9yIH0gZnJvbSAnLi9oYW5kbGVEZWNvcmF0b3InO1xuaW1wb3J0IHsgQmVmb3JlUHJvcGVydGllcyB9IGZyb20gJy4vLi4vaW50ZXJmYWNlcyc7XG5cbi8qKlxuICogRGVjb3JhdG9yIHRoYXQgYWRkcyB0aGUgZnVuY3Rpb24gcGFzc2VkIG9mIHRhcmdldCBtZXRob2QgdG8gYmUgcnVuXG4gKiBpbiB0aGUgYGJlZm9yZVByb3BlcnRpZXNgIGxpZmVjeWNsZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJlZm9yZVByb3BlcnRpZXMobWV0aG9kOiBCZWZvcmVQcm9wZXJ0aWVzKTogKHRhcmdldDogYW55KSA9PiB2b2lkO1xuZXhwb3J0IGZ1bmN0aW9uIGJlZm9yZVByb3BlcnRpZXMoKTogKHRhcmdldDogYW55LCBwcm9wZXJ0eUtleTogc3RyaW5nKSA9PiB2b2lkO1xuZXhwb3J0IGZ1bmN0aW9uIGJlZm9yZVByb3BlcnRpZXMobWV0aG9kPzogQmVmb3JlUHJvcGVydGllcykge1xuXHRyZXR1cm4gaGFuZGxlRGVjb3JhdG9yKCh0YXJnZXQsIHByb3BlcnR5S2V5KSA9PiB7XG5cdFx0dGFyZ2V0LmFkZERlY29yYXRvcignYmVmb3JlUHJvcGVydGllcycsIHByb3BlcnR5S2V5ID8gdGFyZ2V0W3Byb3BlcnR5S2V5XSA6IG1ldGhvZCk7XG5cdH0pO1xufVxuXG5leHBvcnQgZGVmYXVsdCBiZWZvcmVQcm9wZXJ0aWVzO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIGJlZm9yZVByb3BlcnRpZXMudHMiLCJpbXBvcnQgeyBDb25zdHJ1Y3RvciwgV2lkZ2V0UHJvcGVydGllcyB9IGZyb20gJy4uL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgQ3VzdG9tRWxlbWVudENoaWxkVHlwZSB9IGZyb20gJy4uL3JlZ2lzdGVyQ3VzdG9tRWxlbWVudCc7XG5pbXBvcnQgUmVnaXN0cnkgZnJvbSAnLi4vUmVnaXN0cnknO1xuXG5leHBvcnQgdHlwZSBDdXN0b21FbGVtZW50UHJvcGVydHlOYW1lczxQIGV4dGVuZHMgb2JqZWN0PiA9ICgoa2V5b2YgUCkgfCAoa2V5b2YgV2lkZ2V0UHJvcGVydGllcykpW107XG5cbi8qKlxuICogRGVmaW5lcyB0aGUgY3VzdG9tIGVsZW1lbnQgY29uZmlndXJhdGlvbiB1c2VkIGJ5IHRoZSBjdXN0b21FbGVtZW50IGRlY29yYXRvclxuICovXG5leHBvcnQgaW50ZXJmYWNlIEN1c3RvbUVsZW1lbnRDb25maWc8UCBleHRlbmRzIG9iamVjdCA9IHsgW2luZGV4OiBzdHJpbmddOiBhbnkgfT4ge1xuXHQvKipcblx0ICogVGhlIHRhZyBvZiB0aGUgY3VzdG9tIGVsZW1lbnRcblx0ICovXG5cdHRhZzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBMaXN0IG9mIHdpZGdldCBwcm9wZXJ0aWVzIHRvIGV4cG9zZSBhcyBwcm9wZXJ0aWVzIG9uIHRoZSBjdXN0b20gZWxlbWVudFxuXHQgKi9cblx0cHJvcGVydGllcz86IEN1c3RvbUVsZW1lbnRQcm9wZXJ0eU5hbWVzPFA+O1xuXG5cdC8qKlxuXHQgKiBMaXN0IG9mIGF0dHJpYnV0ZXMgb24gdGhlIGN1c3RvbSBlbGVtZW50IHRvIG1hcCB0byB3aWRnZXQgcHJvcGVydGllc1xuXHQgKi9cblx0YXR0cmlidXRlcz86IEN1c3RvbUVsZW1lbnRQcm9wZXJ0eU5hbWVzPFA+O1xuXG5cdC8qKlxuXHQgKiBMaXN0IG9mIGV2ZW50cyB0byBleHBvc2Vcblx0ICovXG5cdGV2ZW50cz86IEN1c3RvbUVsZW1lbnRQcm9wZXJ0eU5hbWVzPFA+O1xuXG5cdGNoaWxkVHlwZT86IEN1c3RvbUVsZW1lbnRDaGlsZFR5cGU7XG5cblx0cmVnaXN0cnlGYWN0b3J5PzogKCkgPT4gUmVnaXN0cnk7XG59XG5cbi8qKlxuICogVGhpcyBEZWNvcmF0b3IgaXMgcHJvdmlkZWQgcHJvcGVydGllcyB0aGF0IGRlZmluZSB0aGUgYmVoYXZpb3Igb2YgYSBjdXN0b20gZWxlbWVudCwgYW5kXG4gKiByZWdpc3RlcnMgdGhhdCBjdXN0b20gZWxlbWVudC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGN1c3RvbUVsZW1lbnQ8UCBleHRlbmRzIG9iamVjdCA9IHsgW2luZGV4OiBzdHJpbmddOiBhbnkgfT4oe1xuXHR0YWcsXG5cdHByb3BlcnRpZXMgPSBbXSxcblx0YXR0cmlidXRlcyA9IFtdLFxuXHRldmVudHMgPSBbXSxcblx0Y2hpbGRUeXBlID0gQ3VzdG9tRWxlbWVudENoaWxkVHlwZS5ET0pPLFxuXHRyZWdpc3RyeUZhY3RvcnkgPSAoKSA9PiBuZXcgUmVnaXN0cnkoKVxufTogQ3VzdG9tRWxlbWVudENvbmZpZzxQPikge1xuXHRyZXR1cm4gZnVuY3Rpb248VCBleHRlbmRzIENvbnN0cnVjdG9yPGFueT4+KHRhcmdldDogVCkge1xuXHRcdHRhcmdldC5wcm90b3R5cGUuX19jdXN0b21FbGVtZW50RGVzY3JpcHRvciA9IHtcblx0XHRcdHRhZ05hbWU6IHRhZyxcblx0XHRcdGF0dHJpYnV0ZXMsXG5cdFx0XHRwcm9wZXJ0aWVzLFxuXHRcdFx0ZXZlbnRzLFxuXHRcdFx0Y2hpbGRUeXBlLFxuXHRcdFx0cmVnaXN0cnlGYWN0b3J5XG5cdFx0fTtcblx0fTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY3VzdG9tRWxlbWVudDtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyBjdXN0b21FbGVtZW50LnRzIiwiaW1wb3J0IHsgaGFuZGxlRGVjb3JhdG9yIH0gZnJvbSAnLi9oYW5kbGVEZWNvcmF0b3InO1xuaW1wb3J0IHsgRGlmZlByb3BlcnR5RnVuY3Rpb24gfSBmcm9tICcuLy4uL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgYXV0byB9IGZyb20gJy4vLi4vZGlmZic7XG5cbi8qKlxuICogRGVjb3JhdG9yIHRoYXQgY2FuIGJlIHVzZWQgdG8gcmVnaXN0ZXIgYSBmdW5jdGlvbiBhcyBhIHNwZWNpZmljIHByb3BlcnR5IGRpZmZcbiAqXG4gKiBAcGFyYW0gcHJvcGVydHlOYW1lICBUaGUgbmFtZSBvZiB0aGUgcHJvcGVydHkgb2Ygd2hpY2ggdGhlIGRpZmYgZnVuY3Rpb24gaXMgYXBwbGllZFxuICogQHBhcmFtIGRpZmZUeXBlICAgICAgVGhlIGRpZmYgdHlwZSwgZGVmYXVsdCBpcyBEaWZmVHlwZS5BVVRPLlxuICogQHBhcmFtIGRpZmZGdW5jdGlvbiAgQSBkaWZmIGZ1bmN0aW9uIHRvIHJ1biBpZiBkaWZmVHlwZSBpZiBEaWZmVHlwZS5DVVNUT01cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpZmZQcm9wZXJ0eShcblx0cHJvcGVydHlOYW1lOiBzdHJpbmcsXG5cdGRpZmZGdW5jdGlvbjogRGlmZlByb3BlcnR5RnVuY3Rpb24gPSBhdXRvLFxuXHRyZWFjdGlvbkZ1bmN0aW9uPzogRnVuY3Rpb25cbikge1xuXHRyZXR1cm4gaGFuZGxlRGVjb3JhdG9yKCh0YXJnZXQsIHByb3BlcnR5S2V5KSA9PiB7XG5cdFx0dGFyZ2V0LmFkZERlY29yYXRvcihgZGlmZlByb3BlcnR5OiR7cHJvcGVydHlOYW1lfWAsIGRpZmZGdW5jdGlvbi5iaW5kKG51bGwpKTtcblx0XHR0YXJnZXQuYWRkRGVjb3JhdG9yKCdyZWdpc3RlcmVkRGlmZlByb3BlcnR5JywgcHJvcGVydHlOYW1lKTtcblx0XHRpZiAocmVhY3Rpb25GdW5jdGlvbiB8fCBwcm9wZXJ0eUtleSkge1xuXHRcdFx0dGFyZ2V0LmFkZERlY29yYXRvcignZGlmZlJlYWN0aW9uJywge1xuXHRcdFx0XHRwcm9wZXJ0eU5hbWUsXG5cdFx0XHRcdHJlYWN0aW9uOiBwcm9wZXJ0eUtleSA/IHRhcmdldFtwcm9wZXJ0eUtleV0gOiByZWFjdGlvbkZ1bmN0aW9uXG5cdFx0XHR9KTtcblx0XHR9XG5cdH0pO1xufVxuXG5leHBvcnQgZGVmYXVsdCBkaWZmUHJvcGVydHk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gZGlmZlByb3BlcnR5LnRzIiwiZXhwb3J0IHR5cGUgRGVjb3JhdG9ySGFuZGxlciA9ICh0YXJnZXQ6IGFueSwgcHJvcGVydHlLZXk/OiBzdHJpbmcpID0+IHZvaWQ7XG5cbi8qKlxuICogR2VuZXJpYyBkZWNvcmF0b3IgaGFuZGxlciB0byB0YWtlIGNhcmUgb2Ygd2hldGhlciBvciBub3QgdGhlIGRlY29yYXRvciB3YXMgY2FsbGVkIGF0IHRoZSBjbGFzcyBsZXZlbFxuICogb3IgdGhlIG1ldGhvZCBsZXZlbC5cbiAqXG4gKiBAcGFyYW0gaGFuZGxlclxuICovXG5leHBvcnQgZnVuY3Rpb24gaGFuZGxlRGVjb3JhdG9yKGhhbmRsZXI6IERlY29yYXRvckhhbmRsZXIpIHtcblx0cmV0dXJuIGZ1bmN0aW9uKHRhcmdldDogYW55LCBwcm9wZXJ0eUtleT86IHN0cmluZywgZGVzY3JpcHRvcj86IFByb3BlcnR5RGVzY3JpcHRvcikge1xuXHRcdGlmICh0eXBlb2YgdGFyZ2V0ID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRoYW5kbGVyKHRhcmdldC5wcm90b3R5cGUsIHVuZGVmaW5lZCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGhhbmRsZXIodGFyZ2V0LCBwcm9wZXJ0eUtleSk7XG5cdFx0fVxuXHR9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBoYW5kbGVEZWNvcmF0b3I7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gaGFuZGxlRGVjb3JhdG9yLnRzIiwiaW1wb3J0IFdlYWtNYXAgZnJvbSAnLi4vLi4vc2hpbS9XZWFrTWFwJztcbmltcG9ydCB7IFdpZGdldEJhc2UgfSBmcm9tICcuLy4uL1dpZGdldEJhc2UnO1xuaW1wb3J0IHsgaGFuZGxlRGVjb3JhdG9yIH0gZnJvbSAnLi9oYW5kbGVEZWNvcmF0b3InO1xuaW1wb3J0IHsgYmVmb3JlUHJvcGVydGllcyB9IGZyb20gJy4vYmVmb3JlUHJvcGVydGllcyc7XG5pbXBvcnQgeyBJbmplY3Rvckl0ZW0sIFJlZ2lzdHJ5TGFiZWwgfSBmcm9tICcuLy4uL2ludGVyZmFjZXMnO1xuXG4vKipcbiAqIE1hcCBvZiBpbnN0YW5jZXMgYWdhaW5zdCByZWdpc3RlcmVkIGluamVjdG9ycy5cbiAqL1xuY29uc3QgcmVnaXN0ZXJlZEluamVjdG9yc01hcDogV2Vha01hcDxXaWRnZXRCYXNlLCBJbmplY3Rvckl0ZW1bXT4gPSBuZXcgV2Vha01hcCgpO1xuXG4vKipcbiAqIERlZmluZXMgdGhlIGNvbnRyYWN0IHJlcXVpcmVzIGZvciB0aGUgZ2V0IHByb3BlcnRpZXMgZnVuY3Rpb25cbiAqIHVzZWQgdG8gbWFwIHRoZSBpbmplY3RlZCBwcm9wZXJ0aWVzLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEdldFByb3BlcnRpZXM8VCA9IGFueT4ge1xuXHQocGF5bG9hZDogYW55LCBwcm9wZXJ0aWVzOiBUKTogVDtcbn1cblxuLyoqXG4gKiBEZWZpbmVzIHRoZSBpbmplY3QgY29uZmlndXJhdGlvbiByZXF1aXJlZCBmb3IgdXNlIG9mIHRoZSBgaW5qZWN0YCBkZWNvcmF0b3JcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBJbmplY3RDb25maWcge1xuXHQvKipcblx0ICogVGhlIGxhYmVsIG9mIHRoZSByZWdpc3RyeSBpbmplY3RvclxuXHQgKi9cblx0bmFtZTogUmVnaXN0cnlMYWJlbDtcblxuXHQvKipcblx0ICogRnVuY3Rpb24gdGhhdCByZXR1cm5zIHByb3BlcnR1ZXMgdG8gaW5qZWN0IHVzaW5nIHRoZSBwYXNzZWQgcHJvcGVydGllc1xuXHQgKiBhbmQgdGhlIGluamVjdGVkIHBheWxvYWQuXG5cdCAqL1xuXHRnZXRQcm9wZXJ0aWVzOiBHZXRQcm9wZXJ0aWVzO1xufVxuXG4vKipcbiAqIERlY29yYXRvciByZXRyaWV2ZXMgYW4gaW5qZWN0b3IgZnJvbSBhbiBhdmFpbGFibGUgcmVnaXN0cnkgdXNpbmcgdGhlIG5hbWUgYW5kXG4gKiBjYWxscyB0aGUgYGdldFByb3BlcnRpZXNgIGZ1bmN0aW9uIHdpdGggdGhlIHBheWxvYWQgZnJvbSB0aGUgaW5qZWN0b3JcbiAqIGFuZCBjdXJyZW50IHByb3BlcnRpZXMgd2l0aCB0aGUgdGhlIGluamVjdGVkIHByb3BlcnRpZXMgcmV0dXJuZWQuXG4gKlxuICogQHBhcmFtIEluamVjdENvbmZpZyB0aGUgaW5qZWN0IGNvbmZpZ3VyYXRpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluamVjdCh7IG5hbWUsIGdldFByb3BlcnRpZXMgfTogSW5qZWN0Q29uZmlnKSB7XG5cdHJldHVybiBoYW5kbGVEZWNvcmF0b3IoKHRhcmdldCwgcHJvcGVydHlLZXkpID0+IHtcblx0XHRiZWZvcmVQcm9wZXJ0aWVzKGZ1bmN0aW9uKHRoaXM6IFdpZGdldEJhc2UgJiB7IG93bjogRnVuY3Rpb24gfSwgcHJvcGVydGllczogYW55KSB7XG5cdFx0XHRjb25zdCBpbmplY3Rvckl0ZW0gPSB0aGlzLnJlZ2lzdHJ5LmdldEluamVjdG9yKG5hbWUpO1xuXHRcdFx0aWYgKGluamVjdG9ySXRlbSkge1xuXHRcdFx0XHRjb25zdCB7IGluamVjdG9yLCBpbnZhbGlkYXRvciB9ID0gaW5qZWN0b3JJdGVtO1xuXHRcdFx0XHRjb25zdCByZWdpc3RlcmVkSW5qZWN0b3JzID0gcmVnaXN0ZXJlZEluamVjdG9yc01hcC5nZXQodGhpcykgfHwgW107XG5cdFx0XHRcdGlmIChyZWdpc3RlcmVkSW5qZWN0b3JzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHRcdHJlZ2lzdGVyZWRJbmplY3RvcnNNYXAuc2V0KHRoaXMsIHJlZ2lzdGVyZWRJbmplY3RvcnMpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChyZWdpc3RlcmVkSW5qZWN0b3JzLmluZGV4T2YoaW5qZWN0b3JJdGVtKSA9PT0gLTEpIHtcblx0XHRcdFx0XHR0aGlzLm93bihcblx0XHRcdFx0XHRcdGludmFsaWRhdG9yLm9uKCdpbnZhbGlkYXRlJywgKCkgPT4ge1xuXHRcdFx0XHRcdFx0XHR0aGlzLmludmFsaWRhdGUoKTtcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRyZWdpc3RlcmVkSW5qZWN0b3JzLnB1c2goaW5qZWN0b3JJdGVtKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gZ2V0UHJvcGVydGllcyhpbmplY3RvcigpLCBwcm9wZXJ0aWVzKTtcblx0XHRcdH1cblx0XHR9KSh0YXJnZXQpO1xuXHR9KTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgaW5qZWN0O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIGluamVjdC50cyIsImltcG9ydCB7IFByb3BlcnR5Q2hhbmdlUmVjb3JkIH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7IFdJREdFVF9CQVNFX1RZUEUgfSBmcm9tICcuL1JlZ2lzdHJ5JztcblxuZnVuY3Rpb24gaXNPYmplY3RPckFycmF5KHZhbHVlOiBhbnkpOiBib29sZWFuIHtcblx0cmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT09ICdbb2JqZWN0IE9iamVjdF0nIHx8IEFycmF5LmlzQXJyYXkodmFsdWUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYWx3YXlzKHByZXZpb3VzUHJvcGVydHk6IGFueSwgbmV3UHJvcGVydHk6IGFueSk6IFByb3BlcnR5Q2hhbmdlUmVjb3JkIHtcblx0cmV0dXJuIHtcblx0XHRjaGFuZ2VkOiB0cnVlLFxuXHRcdHZhbHVlOiBuZXdQcm9wZXJ0eVxuXHR9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaWdub3JlKHByZXZpb3VzUHJvcGVydHk6IGFueSwgbmV3UHJvcGVydHk6IGFueSk6IFByb3BlcnR5Q2hhbmdlUmVjb3JkIHtcblx0cmV0dXJuIHtcblx0XHRjaGFuZ2VkOiBmYWxzZSxcblx0XHR2YWx1ZTogbmV3UHJvcGVydHlcblx0fTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZmVyZW5jZShwcmV2aW91c1Byb3BlcnR5OiBhbnksIG5ld1Byb3BlcnR5OiBhbnkpOiBQcm9wZXJ0eUNoYW5nZVJlY29yZCB7XG5cdHJldHVybiB7XG5cdFx0Y2hhbmdlZDogcHJldmlvdXNQcm9wZXJ0eSAhPT0gbmV3UHJvcGVydHksXG5cdFx0dmFsdWU6IG5ld1Byb3BlcnR5XG5cdH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaGFsbG93KHByZXZpb3VzUHJvcGVydHk6IGFueSwgbmV3UHJvcGVydHk6IGFueSk6IFByb3BlcnR5Q2hhbmdlUmVjb3JkIHtcblx0bGV0IGNoYW5nZWQgPSBmYWxzZTtcblxuXHRjb25zdCB2YWxpZE9sZFByb3BlcnR5ID0gcHJldmlvdXNQcm9wZXJ0eSAmJiBpc09iamVjdE9yQXJyYXkocHJldmlvdXNQcm9wZXJ0eSk7XG5cdGNvbnN0IHZhbGlkTmV3UHJvcGVydHkgPSBuZXdQcm9wZXJ0eSAmJiBpc09iamVjdE9yQXJyYXkobmV3UHJvcGVydHkpO1xuXG5cdGlmICghdmFsaWRPbGRQcm9wZXJ0eSB8fCAhdmFsaWROZXdQcm9wZXJ0eSkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRjaGFuZ2VkOiB0cnVlLFxuXHRcdFx0dmFsdWU6IG5ld1Byb3BlcnR5XG5cdFx0fTtcblx0fVxuXG5cdGNvbnN0IHByZXZpb3VzS2V5cyA9IE9iamVjdC5rZXlzKHByZXZpb3VzUHJvcGVydHkpO1xuXHRjb25zdCBuZXdLZXlzID0gT2JqZWN0LmtleXMobmV3UHJvcGVydHkpO1xuXG5cdGlmIChwcmV2aW91c0tleXMubGVuZ3RoICE9PSBuZXdLZXlzLmxlbmd0aCkge1xuXHRcdGNoYW5nZWQgPSB0cnVlO1xuXHR9IGVsc2Uge1xuXHRcdGNoYW5nZWQgPSBuZXdLZXlzLnNvbWUoKGtleSkgPT4ge1xuXHRcdFx0cmV0dXJuIG5ld1Byb3BlcnR5W2tleV0gIT09IHByZXZpb3VzUHJvcGVydHlba2V5XTtcblx0XHR9KTtcblx0fVxuXHRyZXR1cm4ge1xuXHRcdGNoYW5nZWQsXG5cdFx0dmFsdWU6IG5ld1Byb3BlcnR5XG5cdH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhdXRvKHByZXZpb3VzUHJvcGVydHk6IGFueSwgbmV3UHJvcGVydHk6IGFueSk6IFByb3BlcnR5Q2hhbmdlUmVjb3JkIHtcblx0bGV0IHJlc3VsdDtcblx0aWYgKHR5cGVvZiBuZXdQcm9wZXJ0eSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdGlmIChuZXdQcm9wZXJ0eS5fdHlwZSA9PT0gV0lER0VUX0JBU0VfVFlQRSkge1xuXHRcdFx0cmVzdWx0ID0gcmVmZXJlbmNlKHByZXZpb3VzUHJvcGVydHksIG5ld1Byb3BlcnR5KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmVzdWx0ID0gaWdub3JlKHByZXZpb3VzUHJvcGVydHksIG5ld1Byb3BlcnR5KTtcblx0XHR9XG5cdH0gZWxzZSBpZiAoaXNPYmplY3RPckFycmF5KG5ld1Byb3BlcnR5KSkge1xuXHRcdHJlc3VsdCA9IHNoYWxsb3cocHJldmlvdXNQcm9wZXJ0eSwgbmV3UHJvcGVydHkpO1xuXHR9IGVsc2Uge1xuXHRcdHJlc3VsdCA9IHJlZmVyZW5jZShwcmV2aW91c1Byb3BlcnR5LCBuZXdQcm9wZXJ0eSk7XG5cdH1cblx0cmV0dXJuIHJlc3VsdDtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyBkaWZmLnRzIiwiaW1wb3J0IHsgRGVzdHJveWFibGUgfSBmcm9tICcuLi8uLi9jb3JlL0Rlc3Ryb3lhYmxlJztcbmltcG9ydCBTZXQgZnJvbSAnLi4vLi4vc2hpbS9TZXQnO1xuaW1wb3J0IHsgV2lkZ2V0TWV0YUJhc2UsIFdpZGdldE1ldGFQcm9wZXJ0aWVzLCBOb2RlSGFuZGxlckludGVyZmFjZSwgV2lkZ2V0QmFzZUludGVyZmFjZSB9IGZyb20gJy4uL2ludGVyZmFjZXMnO1xuXG5leHBvcnQgY2xhc3MgQmFzZSBleHRlbmRzIERlc3Ryb3lhYmxlIGltcGxlbWVudHMgV2lkZ2V0TWV0YUJhc2Uge1xuXHRwcml2YXRlIF9pbnZhbGlkYXRlOiAoKSA9PiB2b2lkO1xuXHRwcm90ZWN0ZWQgbm9kZUhhbmRsZXI6IE5vZGVIYW5kbGVySW50ZXJmYWNlO1xuXG5cdHByaXZhdGUgX3JlcXVlc3RlZE5vZGVLZXlzID0gbmV3IFNldDxzdHJpbmcgfCBudW1iZXI+KCk7XG5cblx0cHJvdGVjdGVkIF9iaW5kOiBXaWRnZXRCYXNlSW50ZXJmYWNlIHwgdW5kZWZpbmVkO1xuXG5cdGNvbnN0cnVjdG9yKHByb3BlcnRpZXM6IFdpZGdldE1ldGFQcm9wZXJ0aWVzKSB7XG5cdFx0c3VwZXIoKTtcblxuXHRcdHRoaXMuX2ludmFsaWRhdGUgPSBwcm9wZXJ0aWVzLmludmFsaWRhdGU7XG5cdFx0dGhpcy5ub2RlSGFuZGxlciA9IHByb3BlcnRpZXMubm9kZUhhbmRsZXI7XG5cdFx0aWYgKHByb3BlcnRpZXMuYmluZCkge1xuXHRcdFx0dGhpcy5fYmluZCA9IHByb3BlcnRpZXMuYmluZDtcblx0XHR9XG5cdH1cblxuXHRwdWJsaWMgaGFzKGtleTogc3RyaW5nIHwgbnVtYmVyKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMubm9kZUhhbmRsZXIuaGFzKGtleSk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgZ2V0Tm9kZShrZXk6IHN0cmluZyB8IG51bWJlcik6IEVsZW1lbnQgfCB1bmRlZmluZWQge1xuXHRcdGNvbnN0IHN0cmluZ0tleSA9IGAke2tleX1gO1xuXHRcdGNvbnN0IG5vZGUgPSB0aGlzLm5vZGVIYW5kbGVyLmdldChzdHJpbmdLZXkpO1xuXG5cdFx0aWYgKCFub2RlICYmICF0aGlzLl9yZXF1ZXN0ZWROb2RlS2V5cy5oYXMoc3RyaW5nS2V5KSkge1xuXHRcdFx0Y29uc3QgaGFuZGxlID0gdGhpcy5ub2RlSGFuZGxlci5vbihzdHJpbmdLZXksICgpID0+IHtcblx0XHRcdFx0aGFuZGxlLmRlc3Ryb3koKTtcblx0XHRcdFx0dGhpcy5fcmVxdWVzdGVkTm9kZUtleXMuZGVsZXRlKHN0cmluZ0tleSk7XG5cdFx0XHRcdHRoaXMuaW52YWxpZGF0ZSgpO1xuXHRcdFx0fSk7XG5cblx0XHRcdHRoaXMub3duKGhhbmRsZSk7XG5cdFx0XHR0aGlzLl9yZXF1ZXN0ZWROb2RlS2V5cy5hZGQoc3RyaW5nS2V5KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gbm9kZTtcblx0fVxuXG5cdHByb3RlY3RlZCBpbnZhbGlkYXRlKCk6IHZvaWQge1xuXHRcdHRoaXMuX2ludmFsaWRhdGUoKTtcblx0fVxuXG5cdHB1YmxpYyBhZnRlclJlbmRlcigpOiB2b2lkIHtcblx0XHQvLyBEbyBub3RoaW5nIGJ5IGRlZmF1bHQuXG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQmFzZTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyBCYXNlLnRzIiwiaW1wb3J0IHsgQ29uc3RydWN0b3IgfSBmcm9tICcuLy4uL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgV2lkZ2V0QmFzZSB9IGZyb20gJy4vLi4vV2lkZ2V0QmFzZSc7XG5pbXBvcnQgeyBkaWZmUHJvcGVydHkgfSBmcm9tICcuLy4uL2RlY29yYXRvcnMvZGlmZlByb3BlcnR5JztcblxuZXhwb3J0IGludGVyZmFjZSBGb2N1c1Byb3BlcnRpZXMge1xuXHRmb2N1cz86ICgoKSA9PiBib29sZWFuKTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBGb2N1c01peGluIHtcblx0Zm9jdXM6ICgpID0+IHZvaWQ7XG5cdHNob3VsZEZvY3VzOiAoKSA9PiBib29sZWFuO1xuXHRwcm9wZXJ0aWVzOiBGb2N1c1Byb3BlcnRpZXM7XG59XG5cbmZ1bmN0aW9uIGRpZmZGb2N1cyhwcmV2aW91c1Byb3BlcnR5OiBGdW5jdGlvbiwgbmV3UHJvcGVydHk6IEZ1bmN0aW9uKSB7XG5cdGNvbnN0IHJlc3VsdCA9IG5ld1Byb3BlcnR5ICYmIG5ld1Byb3BlcnR5KCk7XG5cdHJldHVybiB7XG5cdFx0Y2hhbmdlZDogcmVzdWx0LFxuXHRcdHZhbHVlOiBuZXdQcm9wZXJ0eVxuXHR9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gRm9jdXNNaXhpbjxUIGV4dGVuZHMgQ29uc3RydWN0b3I8V2lkZ2V0QmFzZTxGb2N1c1Byb3BlcnRpZXM+Pj4oQmFzZTogVCk6IFQgJiBDb25zdHJ1Y3RvcjxGb2N1c01peGluPiB7XG5cdGFic3RyYWN0IGNsYXNzIEZvY3VzIGV4dGVuZHMgQmFzZSB7XG5cdFx0cHVibGljIGFic3RyYWN0IHByb3BlcnRpZXM6IEZvY3VzUHJvcGVydGllcztcblxuXHRcdHByaXZhdGUgX2N1cnJlbnRUb2tlbiA9IDA7XG5cblx0XHRwcml2YXRlIF9wcmV2aW91c1Rva2VuID0gMDtcblxuXHRcdEBkaWZmUHJvcGVydHkoJ2ZvY3VzJywgZGlmZkZvY3VzKVxuXHRcdHByb3RlY3RlZCBpc0ZvY3VzZWRSZWFjdGlvbigpIHtcblx0XHRcdHRoaXMuX2N1cnJlbnRUb2tlbisrO1xuXHRcdH1cblxuXHRcdHB1YmxpYyBzaG91bGRGb2N1cyA9ICgpID0+IHtcblx0XHRcdGNvbnN0IHJlc3VsdCA9IHRoaXMuX2N1cnJlbnRUb2tlbiAhPT0gdGhpcy5fcHJldmlvdXNUb2tlbjtcblx0XHRcdHRoaXMuX3ByZXZpb3VzVG9rZW4gPSB0aGlzLl9jdXJyZW50VG9rZW47XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH07XG5cblx0XHRwdWJsaWMgZm9jdXMoKSB7XG5cdFx0XHR0aGlzLl9jdXJyZW50VG9rZW4rKztcblx0XHRcdHRoaXMuaW52YWxpZGF0ZSgpO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gRm9jdXM7XG59XG5cbmV4cG9ydCBkZWZhdWx0IEZvY3VzTWl4aW47XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gRm9jdXMudHMiLCJpbXBvcnQgeyBCYXNlIH0gZnJvbSAnLi9CYXNlJztcbmltcG9ydCBNYXAgZnJvbSAnLi4vLi4vc2hpbS9NYXAnO1xuaW1wb3J0IGdsb2JhbCBmcm9tICcuLi8uLi9zaGltL2dsb2JhbCc7XG5cbi8qKlxuICogQW5pbWF0aW9uIGNvbnRyb2xzIGFyZSB1c2VkIHRvIGNvbnRyb2wgdGhlIHdlYiBhbmltYXRpb24gdGhhdCBoYXMgYmVlbiBhcHBsaWVkXG4gKiB0byBhIHZkb20gbm9kZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25Db250cm9scyB7XG5cdHBsYXk/OiBib29sZWFuO1xuXHRvbkZpbmlzaD86ICgpID0+IHZvaWQ7XG5cdG9uQ2FuY2VsPzogKCkgPT4gdm9pZDtcblx0cmV2ZXJzZT86IGJvb2xlYW47XG5cdGNhbmNlbD86IGJvb2xlYW47XG5cdGZpbmlzaD86IGJvb2xlYW47XG5cdHBsYXliYWNrUmF0ZT86IG51bWJlcjtcblx0c3RhcnRUaW1lPzogbnVtYmVyO1xuXHRjdXJyZW50VGltZT86IG51bWJlcjtcbn1cblxuLyoqXG4gKiBBbmltYXRpb24gdGltaW5nIHByb3BlcnRpZXMgcGFzc2VkIHRvIGEgbmV3IEtleWZyYW1lRWZmZWN0LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvblRpbWluZ1Byb3BlcnRpZXMge1xuXHRkdXJhdGlvbj86IG51bWJlcjtcblx0ZGVsYXk/OiBudW1iZXI7XG5cdGRpcmVjdGlvbj86ICdub3JtYWwnIHwgJ3JldmVyc2UnIHwgJ2FsdGVybmF0ZScgfCAnYWx0ZXJuYXRlLXJldmVyc2UnO1xuXHRlYXNpbmc/OiBzdHJpbmc7XG5cdGVuZERlbGF5PzogbnVtYmVyO1xuXHRmaWxsPzogJ25vbmUnIHwgJ2ZvcndhcmRzJyB8ICdiYWNrd2FyZHMnIHwgJ2JvdGgnIHwgJ2F1dG8nO1xuXHRpdGVyYXRpb25zPzogbnVtYmVyO1xuXHRpdGVyYXRpb25TdGFydD86IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25LZXlGcmFtZSB7XG5cdGVhc2luZz86IHN0cmluZyB8IHN0cmluZ1tdO1xuXHRvZmZzZXQ/OiBudW1iZXIgfCBBcnJheTxudW1iZXIgfCBudWxsPiB8IG51bGw7XG5cdG9wYWNpdHk/OiBudW1iZXIgfCBudW1iZXJbXTtcblx0dHJhbnNmb3JtPzogc3RyaW5nIHwgc3RyaW5nW107XG59XG5cbi8qKlxuICogQW5pbWF0aW9uIHByb3BlcnRpdWVzIHRoYXQgY2FuIGJlIHBhc3NlZCBhcyB2ZG9tIHByb3BlcnR5IGBhbmltYXRlYFxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvblByb3BlcnRpZXMge1xuXHRpZDogc3RyaW5nO1xuXHRlZmZlY3RzOiAoKCkgPT4gQW5pbWF0aW9uS2V5RnJhbWUgfCBBbmltYXRpb25LZXlGcmFtZVtdKSB8IEFuaW1hdGlvbktleUZyYW1lIHwgQW5pbWF0aW9uS2V5RnJhbWVbXTtcblx0Y29udHJvbHM/OiBBbmltYXRpb25Db250cm9scztcblx0dGltaW5nPzogQW5pbWF0aW9uVGltaW5nUHJvcGVydGllcztcbn1cblxuZXhwb3J0IHR5cGUgQW5pbWF0aW9uUHJvcGVydGllc0Z1bmN0aW9uID0gKCkgPT4gQW5pbWF0aW9uUHJvcGVydGllcztcblxuLyoqXG4gKiBJbmZvIHJldHVybmVkIGJ5IHRoZSBgZ2V0YCBmdW5jdGlvbiBvbiBXZWJBbmltYXRpb24gbWV0YVxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvbkluZm8ge1xuXHRjdXJyZW50VGltZTogbnVtYmVyO1xuXHRwbGF5U3RhdGU6ICdpZGxlJyB8ICdwZW5kaW5nJyB8ICdydW5uaW5nJyB8ICdwYXVzZWQnIHwgJ2ZpbmlzaGVkJztcblx0cGxheWJhY2tSYXRlOiBudW1iZXI7XG5cdHN0YXJ0VGltZTogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvblBsYXllciB7XG5cdHBsYXllcjogYW55O1xuXHR1c2VkOiBib29sZWFuO1xufVxuXG5leHBvcnQgY2xhc3MgV2ViQW5pbWF0aW9ucyBleHRlbmRzIEJhc2Uge1xuXHRwcml2YXRlIF9hbmltYXRpb25NYXAgPSBuZXcgTWFwPHN0cmluZywgQW5pbWF0aW9uUGxheWVyPigpO1xuXG5cdHByaXZhdGUgX2NyZWF0ZVBsYXllcihub2RlOiBIVE1MRWxlbWVudCwgcHJvcGVydGllczogQW5pbWF0aW9uUHJvcGVydGllcyk6IGFueSB7XG5cdFx0Y29uc3QgeyBlZmZlY3RzLCB0aW1pbmcgPSB7fSB9ID0gcHJvcGVydGllcztcblxuXHRcdGNvbnN0IGZ4ID0gdHlwZW9mIGVmZmVjdHMgPT09ICdmdW5jdGlvbicgPyBlZmZlY3RzKCkgOiBlZmZlY3RzO1xuXG5cdFx0Y29uc3Qga2V5ZnJhbWVFZmZlY3QgPSBuZXcgZ2xvYmFsLktleWZyYW1lRWZmZWN0KG5vZGUsIGZ4LCB0aW1pbmcpO1xuXG5cdFx0cmV0dXJuIG5ldyBnbG9iYWwuQW5pbWF0aW9uKGtleWZyYW1lRWZmZWN0LCBnbG9iYWwuZG9jdW1lbnQudGltZWxpbmUpO1xuXHR9XG5cblx0cHJpdmF0ZSBfdXBkYXRlUGxheWVyKHBsYXllcjogYW55LCBjb250cm9sczogQW5pbWF0aW9uQ29udHJvbHMpIHtcblx0XHRjb25zdCB7IHBsYXksIHJldmVyc2UsIGNhbmNlbCwgZmluaXNoLCBvbkZpbmlzaCwgb25DYW5jZWwsIHBsYXliYWNrUmF0ZSwgc3RhcnRUaW1lLCBjdXJyZW50VGltZSB9ID0gY29udHJvbHM7XG5cblx0XHRpZiAocGxheWJhY2tSYXRlICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHBsYXllci5wbGF5YmFja1JhdGUgPSBwbGF5YmFja1JhdGU7XG5cdFx0fVxuXG5cdFx0aWYgKHJldmVyc2UpIHtcblx0XHRcdHBsYXllci5yZXZlcnNlKCk7XG5cdFx0fVxuXG5cdFx0aWYgKGNhbmNlbCkge1xuXHRcdFx0cGxheWVyLmNhbmNlbCgpO1xuXHRcdH1cblxuXHRcdGlmIChmaW5pc2gpIHtcblx0XHRcdHBsYXllci5maW5pc2goKTtcblx0XHR9XG5cblx0XHRpZiAoc3RhcnRUaW1lICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHBsYXllci5zdGFydFRpbWUgPSBzdGFydFRpbWU7XG5cdFx0fVxuXG5cdFx0aWYgKGN1cnJlbnRUaW1lICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHBsYXllci5jdXJyZW50VGltZSA9IGN1cnJlbnRUaW1lO1xuXHRcdH1cblxuXHRcdGlmIChwbGF5KSB7XG5cdFx0XHRwbGF5ZXIucGxheSgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRwbGF5ZXIucGF1c2UoKTtcblx0XHR9XG5cblx0XHRpZiAob25GaW5pc2gpIHtcblx0XHRcdHBsYXllci5vbmZpbmlzaCA9IG9uRmluaXNoLmJpbmQodGhpcy5fYmluZCk7XG5cdFx0fVxuXG5cdFx0aWYgKG9uQ2FuY2VsKSB7XG5cdFx0XHRwbGF5ZXIub25jYW5jZWwgPSBvbkNhbmNlbC5iaW5kKHRoaXMuX2JpbmQpO1xuXHRcdH1cblx0fVxuXG5cdGFuaW1hdGUoXG5cdFx0a2V5OiBzdHJpbmcsXG5cdFx0YW5pbWF0ZVByb3BlcnRpZXM6XG5cdFx0XHR8IEFuaW1hdGlvblByb3BlcnRpZXNcblx0XHRcdHwgQW5pbWF0aW9uUHJvcGVydGllc0Z1bmN0aW9uXG5cdFx0XHR8IChBbmltYXRpb25Qcm9wZXJ0aWVzIHwgQW5pbWF0aW9uUHJvcGVydGllc0Z1bmN0aW9uKVtdXG5cdCkge1xuXHRcdGNvbnN0IG5vZGUgPSB0aGlzLmdldE5vZGUoa2V5KSBhcyBIVE1MRWxlbWVudDtcblxuXHRcdGlmIChub2RlKSB7XG5cdFx0XHRpZiAoIUFycmF5LmlzQXJyYXkoYW5pbWF0ZVByb3BlcnRpZXMpKSB7XG5cdFx0XHRcdGFuaW1hdGVQcm9wZXJ0aWVzID0gW2FuaW1hdGVQcm9wZXJ0aWVzXTtcblx0XHRcdH1cblx0XHRcdGFuaW1hdGVQcm9wZXJ0aWVzLmZvckVhY2goKHByb3BlcnRpZXMpID0+IHtcblx0XHRcdFx0cHJvcGVydGllcyA9IHR5cGVvZiBwcm9wZXJ0aWVzID09PSAnZnVuY3Rpb24nID8gcHJvcGVydGllcygpIDogcHJvcGVydGllcztcblxuXHRcdFx0XHRpZiAocHJvcGVydGllcykge1xuXHRcdFx0XHRcdGNvbnN0IHsgaWQgfSA9IHByb3BlcnRpZXM7XG5cdFx0XHRcdFx0aWYgKCF0aGlzLl9hbmltYXRpb25NYXAuaGFzKGlkKSkge1xuXHRcdFx0XHRcdFx0dGhpcy5fYW5pbWF0aW9uTWFwLnNldChpZCwge1xuXHRcdFx0XHRcdFx0XHRwbGF5ZXI6IHRoaXMuX2NyZWF0ZVBsYXllcihub2RlLCBwcm9wZXJ0aWVzKSxcblx0XHRcdFx0XHRcdFx0dXNlZDogdHJ1ZVxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Y29uc3QgYW5pbWF0aW9uID0gdGhpcy5fYW5pbWF0aW9uTWFwLmdldChpZCk7XG5cdFx0XHRcdFx0Y29uc3QgeyBjb250cm9scyA9IHt9IH0gPSBwcm9wZXJ0aWVzO1xuXG5cdFx0XHRcdFx0aWYgKGFuaW1hdGlvbikge1xuXHRcdFx0XHRcdFx0dGhpcy5fdXBkYXRlUGxheWVyKGFuaW1hdGlvbi5wbGF5ZXIsIGNvbnRyb2xzKTtcblxuXHRcdFx0XHRcdFx0dGhpcy5fYW5pbWF0aW9uTWFwLnNldChpZCwge1xuXHRcdFx0XHRcdFx0XHRwbGF5ZXI6IGFuaW1hdGlvbi5wbGF5ZXIsXG5cdFx0XHRcdFx0XHRcdHVzZWQ6IHRydWVcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0Z2V0KGlkOiBzdHJpbmcpOiBSZWFkb25seTxBbmltYXRpb25JbmZvPiB8IHVuZGVmaW5lZCB7XG5cdFx0Y29uc3QgYW5pbWF0aW9uID0gdGhpcy5fYW5pbWF0aW9uTWFwLmdldChpZCk7XG5cdFx0aWYgKGFuaW1hdGlvbikge1xuXHRcdFx0Y29uc3QgeyBjdXJyZW50VGltZSwgcGxheVN0YXRlLCBwbGF5YmFja1JhdGUsIHN0YXJ0VGltZSB9ID0gYW5pbWF0aW9uLnBsYXllcjtcblxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0Y3VycmVudFRpbWU6IGN1cnJlbnRUaW1lIHx8IDAsXG5cdFx0XHRcdHBsYXlTdGF0ZSxcblx0XHRcdFx0cGxheWJhY2tSYXRlLFxuXHRcdFx0XHRzdGFydFRpbWU6IHN0YXJ0VGltZSB8fCAwXG5cdFx0XHR9O1xuXHRcdH1cblx0fVxuXG5cdGFmdGVyUmVuZGVyKCkge1xuXHRcdHRoaXMuX2FuaW1hdGlvbk1hcC5mb3JFYWNoKChhbmltYXRpb24sIGtleSkgPT4ge1xuXHRcdFx0aWYgKCFhbmltYXRpb24udXNlZCkge1xuXHRcdFx0XHRhbmltYXRpb24ucGxheWVyLmNhbmNlbCgpO1xuXHRcdFx0XHR0aGlzLl9hbmltYXRpb25NYXAuZGVsZXRlKGtleSk7XG5cdFx0XHR9XG5cdFx0XHRhbmltYXRpb24udXNlZCA9IGZhbHNlO1xuXHRcdH0pO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFdlYkFuaW1hdGlvbnM7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gV2ViQW5pbWF0aW9uLnRzIiwiaW1wb3J0IHsgQ29uc3RydWN0b3IsIFdpZGdldFByb3BlcnRpZXMsIFN1cHBvcnRlZENsYXNzTmFtZSB9IGZyb20gJy4vLi4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBSZWdpc3RyeSB9IGZyb20gJy4vLi4vUmVnaXN0cnknO1xuaW1wb3J0IHsgSW5qZWN0b3IgfSBmcm9tICcuLy4uL0luamVjdG9yJztcbmltcG9ydCB7IGluamVjdCB9IGZyb20gJy4vLi4vZGVjb3JhdG9ycy9pbmplY3QnO1xuaW1wb3J0IHsgV2lkZ2V0QmFzZSB9IGZyb20gJy4vLi4vV2lkZ2V0QmFzZSc7XG5pbXBvcnQgeyBoYW5kbGVEZWNvcmF0b3IgfSBmcm9tICcuLy4uL2RlY29yYXRvcnMvaGFuZGxlRGVjb3JhdG9yJztcbmltcG9ydCB7IGRpZmZQcm9wZXJ0eSB9IGZyb20gJy4vLi4vZGVjb3JhdG9ycy9kaWZmUHJvcGVydHknO1xuaW1wb3J0IHsgc2hhbGxvdyB9IGZyb20gJy4vLi4vZGlmZic7XG5cbi8qKlxuICogQSBsb29rdXAgb2JqZWN0IGZvciBhdmFpbGFibGUgY2xhc3MgbmFtZXNcbiAqL1xuZXhwb3J0IHR5cGUgQ2xhc3NOYW1lcyA9IHtcblx0W2tleTogc3RyaW5nXTogc3RyaW5nO1xufTtcblxuLyoqXG4gKiBBIGxvb2t1cCBvYmplY3QgZm9yIGF2YWlsYWJsZSB3aWRnZXQgY2xhc3NlcyBuYW1lc1xuICovXG5leHBvcnQgaW50ZXJmYWNlIFRoZW1lIHtcblx0W2tleTogc3RyaW5nXTogb2JqZWN0O1xufVxuXG4vKipcbiAqIFByb3BlcnRpZXMgcmVxdWlyZWQgZm9yIHRoZSBUaGVtZWQgbWl4aW5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBUaGVtZWRQcm9wZXJ0aWVzPFQgPSBDbGFzc05hbWVzPiBleHRlbmRzIFdpZGdldFByb3BlcnRpZXMge1xuXHR0aGVtZT86IFRoZW1lO1xuXHRleHRyYUNsYXNzZXM/OiB7IFtQIGluIGtleW9mIFRdPzogc3RyaW5nIH07XG59XG5cbmNvbnN0IFRIRU1FX0tFWSA9ICcgX2tleSc7XG5cbmV4cG9ydCBjb25zdCBJTkpFQ1RFRF9USEVNRV9LRVkgPSAnX190aGVtZV9pbmplY3Rvcic7XG5cbi8qKlxuICogSW50ZXJmYWNlIGZvciB0aGUgVGhlbWVkTWl4aW5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBUaGVtZWRNaXhpbjxUID0gQ2xhc3NOYW1lcz4ge1xuXHR0aGVtZShjbGFzc2VzOiBTdXBwb3J0ZWRDbGFzc05hbWUpOiBTdXBwb3J0ZWRDbGFzc05hbWU7XG5cdHRoZW1lKGNsYXNzZXM6IFN1cHBvcnRlZENsYXNzTmFtZVtdKTogU3VwcG9ydGVkQ2xhc3NOYW1lW107XG5cdHByb3BlcnRpZXM6IFRoZW1lZFByb3BlcnRpZXM8VD47XG59XG5cbi8qKlxuICogRGVjb3JhdG9yIGZvciBiYXNlIGNzcyBjbGFzc2VzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0aGVtZSh0aGVtZToge30pIHtcblx0cmV0dXJuIGhhbmRsZURlY29yYXRvcigodGFyZ2V0KSA9PiB7XG5cdFx0dGFyZ2V0LmFkZERlY29yYXRvcignYmFzZVRoZW1lQ2xhc3NlcycsIHRoZW1lKTtcblx0fSk7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIHJldmVyc2UgbG9va3VwIGZvciB0aGUgY2xhc3NlcyBwYXNzZWQgaW4gdmlhIHRoZSBgdGhlbWVgIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSBjbGFzc2VzIFRoZSBiYXNlQ2xhc3NlcyBvYmplY3RcbiAqIEByZXF1aXJlc1xuICovXG5mdW5jdGlvbiBjcmVhdGVUaGVtZUNsYXNzZXNMb29rdXAoY2xhc3NlczogQ2xhc3NOYW1lc1tdKTogQ2xhc3NOYW1lcyB7XG5cdHJldHVybiBjbGFzc2VzLnJlZHVjZShcblx0XHQoY3VycmVudENsYXNzTmFtZXMsIGJhc2VDbGFzcykgPT4ge1xuXHRcdFx0T2JqZWN0LmtleXMoYmFzZUNsYXNzKS5mb3JFYWNoKChrZXk6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRjdXJyZW50Q2xhc3NOYW1lc1tiYXNlQ2xhc3Nba2V5XV0gPSBrZXk7XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBjdXJyZW50Q2xhc3NOYW1lcztcblx0XHR9LFxuXHRcdDxDbGFzc05hbWVzPnt9XG5cdCk7XG59XG5cbi8qKlxuICogQ29udmVuaWVuY2UgZnVuY3Rpb24gdGhhdCBpcyBnaXZlbiBhIHRoZW1lIGFuZCBhbiBvcHRpb25hbCByZWdpc3RyeSwgdGhlIHRoZW1lXG4gKiBpbmplY3RvciBpcyBkZWZpbmVkIGFnYWluc3QgdGhlIHJlZ2lzdHJ5LCByZXR1cm5pbmcgdGhlIHRoZW1lLlxuICpcbiAqIEBwYXJhbSB0aGVtZSB0aGUgdGhlbWUgdG8gc2V0XG4gKiBAcGFyYW0gdGhlbWVSZWdpc3RyeSByZWdpc3RyeSB0byBkZWZpbmUgdGhlIHRoZW1lIGluamVjdG9yIGFnYWluc3QuIERlZmF1bHRzXG4gKiB0byB0aGUgZ2xvYmFsIHJlZ2lzdHJ5XG4gKlxuICogQHJldHVybnMgdGhlIHRoZW1lIGluamVjdG9yIHVzZWQgdG8gc2V0IHRoZSB0aGVtZVxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJUaGVtZUluamVjdG9yKHRoZW1lOiBhbnksIHRoZW1lUmVnaXN0cnk6IFJlZ2lzdHJ5KTogSW5qZWN0b3Ige1xuXHRjb25zdCB0aGVtZUluamVjdG9yID0gbmV3IEluamVjdG9yKHRoZW1lKTtcblx0dGhlbWVSZWdpc3RyeS5kZWZpbmVJbmplY3RvcihJTkpFQ1RFRF9USEVNRV9LRVksIChpbnZhbGlkYXRvcikgPT4ge1xuXHRcdHRoZW1lSW5qZWN0b3Iuc2V0SW52YWxpZGF0b3IoaW52YWxpZGF0b3IpO1xuXHRcdHJldHVybiAoKSA9PiB0aGVtZUluamVjdG9yLmdldCgpO1xuXHR9KTtcblx0cmV0dXJuIHRoZW1lSW5qZWN0b3I7XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdGhhdCByZXR1cm5zIGEgY2xhc3MgZGVjb3JhdGVkIHdpdGggd2l0aCBUaGVtZWQgZnVuY3Rpb25hbGl0eVxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBUaGVtZWRNaXhpbjxFLCBUIGV4dGVuZHMgQ29uc3RydWN0b3I8V2lkZ2V0QmFzZTxUaGVtZWRQcm9wZXJ0aWVzPEU+Pj4+KFxuXHRCYXNlOiBUXG4pOiBDb25zdHJ1Y3RvcjxUaGVtZWRNaXhpbjxFPj4gJiBUIHtcblx0QGluamVjdCh7XG5cdFx0bmFtZTogSU5KRUNURURfVEhFTUVfS0VZLFxuXHRcdGdldFByb3BlcnRpZXM6ICh0aGVtZTogVGhlbWUsIHByb3BlcnRpZXM6IFRoZW1lZFByb3BlcnRpZXMpOiBUaGVtZWRQcm9wZXJ0aWVzID0+IHtcblx0XHRcdGlmICghcHJvcGVydGllcy50aGVtZSkge1xuXHRcdFx0XHRyZXR1cm4geyB0aGVtZSB9O1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHt9O1xuXHRcdH1cblx0fSlcblx0YWJzdHJhY3QgY2xhc3MgVGhlbWVkIGV4dGVuZHMgQmFzZSB7XG5cdFx0cHVibGljIGFic3RyYWN0IHByb3BlcnRpZXM6IFRoZW1lZFByb3BlcnRpZXM8RT47XG5cblx0XHQvKipcblx0XHQgKiBUaGUgVGhlbWVkIGJhc2VDbGFzc2VzXG5cdFx0ICovXG5cdFx0cHJpdmF0ZSBfcmVnaXN0ZXJlZEJhc2VUaGVtZTogQ2xhc3NOYW1lcyB8IHVuZGVmaW5lZDtcblxuXHRcdC8qKlxuXHRcdCAqIFJlZ2lzdGVyZWQgYmFzZSB0aGVtZSBrZXlzXG5cdFx0ICovXG5cdFx0cHJpdmF0ZSBfcmVnaXN0ZXJlZEJhc2VUaGVtZUtleXM6IHN0cmluZ1tdID0gW107XG5cblx0XHQvKipcblx0XHQgKiBSZXZlcnNlIGxvb2t1cCBvZiB0aGUgdGhlbWUgY2xhc3Nlc1xuXHRcdCAqL1xuXHRcdHByaXZhdGUgX2Jhc2VUaGVtZUNsYXNzZXNSZXZlcnNlTG9va3VwOiBDbGFzc05hbWVzIHwgdW5kZWZpbmVkO1xuXG5cdFx0LyoqXG5cdFx0ICogSW5kaWNhdGVzIGlmIGNsYXNzZXMgbWV0YSBkYXRhIG5lZWQgdG8gYmUgY2FsY3VsYXRlZC5cblx0XHQgKi9cblx0XHRwcml2YXRlIF9yZWNhbGN1bGF0ZUNsYXNzZXMgPSB0cnVlO1xuXG5cdFx0LyoqXG5cdFx0ICogTG9hZGVkIHRoZW1lXG5cdFx0ICovXG5cdFx0cHJpdmF0ZSBfdGhlbWU6IENsYXNzTmFtZXMgPSB7fTtcblxuXHRcdHB1YmxpYyB0aGVtZShjbGFzc2VzOiBTdXBwb3J0ZWRDbGFzc05hbWUpOiBTdXBwb3J0ZWRDbGFzc05hbWU7XG5cdFx0cHVibGljIHRoZW1lKGNsYXNzZXM6IFN1cHBvcnRlZENsYXNzTmFtZVtdKTogU3VwcG9ydGVkQ2xhc3NOYW1lW107XG5cdFx0cHVibGljIHRoZW1lKGNsYXNzZXM6IFN1cHBvcnRlZENsYXNzTmFtZSB8IFN1cHBvcnRlZENsYXNzTmFtZVtdKTogU3VwcG9ydGVkQ2xhc3NOYW1lIHwgU3VwcG9ydGVkQ2xhc3NOYW1lW10ge1xuXHRcdFx0aWYgKHRoaXMuX3JlY2FsY3VsYXRlQ2xhc3Nlcykge1xuXHRcdFx0XHR0aGlzLl9yZWNhbGN1bGF0ZVRoZW1lQ2xhc3NlcygpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKEFycmF5LmlzQXJyYXkoY2xhc3NlcykpIHtcblx0XHRcdFx0cmV0dXJuIGNsYXNzZXMubWFwKChjbGFzc05hbWUpID0+IHRoaXMuX2dldFRoZW1lQ2xhc3MoY2xhc3NOYW1lKSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdGhpcy5fZ2V0VGhlbWVDbGFzcyhjbGFzc2VzKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBGdW5jdGlvbiBmaXJlZCB3aGVuIGB0aGVtZWAgb3IgYGV4dHJhQ2xhc3Nlc2AgYXJlIGNoYW5nZWQuXG5cdFx0ICovXG5cdFx0QGRpZmZQcm9wZXJ0eSgndGhlbWUnLCBzaGFsbG93KVxuXHRcdEBkaWZmUHJvcGVydHkoJ2V4dHJhQ2xhc3NlcycsIHNoYWxsb3cpXG5cdFx0cHJvdGVjdGVkIG9uUHJvcGVydGllc0NoYW5nZWQoKSB7XG5cdFx0XHR0aGlzLl9yZWNhbGN1bGF0ZUNsYXNzZXMgPSB0cnVlO1xuXHRcdH1cblxuXHRcdHByaXZhdGUgX2dldFRoZW1lQ2xhc3MoY2xhc3NOYW1lOiBTdXBwb3J0ZWRDbGFzc05hbWUpOiBTdXBwb3J0ZWRDbGFzc05hbWUge1xuXHRcdFx0aWYgKGNsYXNzTmFtZSA9PT0gdW5kZWZpbmVkIHx8IGNsYXNzTmFtZSA9PT0gbnVsbCkge1xuXHRcdFx0XHRyZXR1cm4gY2xhc3NOYW1lO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBleHRyYUNsYXNzZXMgPSB0aGlzLnByb3BlcnRpZXMuZXh0cmFDbGFzc2VzIHx8ICh7fSBhcyBhbnkpO1xuXHRcdFx0Y29uc3QgdGhlbWVDbGFzc05hbWUgPSB0aGlzLl9iYXNlVGhlbWVDbGFzc2VzUmV2ZXJzZUxvb2t1cCFbY2xhc3NOYW1lXTtcblx0XHRcdGxldCByZXN1bHRDbGFzc05hbWVzOiBzdHJpbmdbXSA9IFtdO1xuXHRcdFx0aWYgKCF0aGVtZUNsYXNzTmFtZSkge1xuXHRcdFx0XHRjb25zb2xlLndhcm4oYENsYXNzIG5hbWU6ICcke2NsYXNzTmFtZX0nIG5vdCBmb3VuZCBpbiB0aGVtZWApO1xuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGV4dHJhQ2xhc3Nlc1t0aGVtZUNsYXNzTmFtZV0pIHtcblx0XHRcdFx0cmVzdWx0Q2xhc3NOYW1lcy5wdXNoKGV4dHJhQ2xhc3Nlc1t0aGVtZUNsYXNzTmFtZV0pO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAodGhpcy5fdGhlbWVbdGhlbWVDbGFzc05hbWVdKSB7XG5cdFx0XHRcdHJlc3VsdENsYXNzTmFtZXMucHVzaCh0aGlzLl90aGVtZVt0aGVtZUNsYXNzTmFtZV0pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmVzdWx0Q2xhc3NOYW1lcy5wdXNoKHRoaXMuX3JlZ2lzdGVyZWRCYXNlVGhlbWUhW3RoZW1lQ2xhc3NOYW1lXSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcmVzdWx0Q2xhc3NOYW1lcy5qb2luKCcgJyk7XG5cdFx0fVxuXG5cdFx0cHJpdmF0ZSBfcmVjYWxjdWxhdGVUaGVtZUNsYXNzZXMoKSB7XG5cdFx0XHRjb25zdCB7IHRoZW1lID0ge30gfSA9IHRoaXMucHJvcGVydGllcztcblx0XHRcdGlmICghdGhpcy5fcmVnaXN0ZXJlZEJhc2VUaGVtZSkge1xuXHRcdFx0XHRjb25zdCBiYXNlVGhlbWVzID0gdGhpcy5nZXREZWNvcmF0b3IoJ2Jhc2VUaGVtZUNsYXNzZXMnKTtcblx0XHRcdFx0aWYgKGJhc2VUaGVtZXMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdFx0Y29uc29sZS53YXJuKFxuXHRcdFx0XHRcdFx0J0EgYmFzZSB0aGVtZSBoYXMgbm90IGJlZW4gcHJvdmlkZWQgdG8gdGhpcyB3aWRnZXQuIFBsZWFzZSB1c2UgdGhlIEB0aGVtZSBkZWNvcmF0b3IgdG8gYWRkIGEgdGhlbWUuJ1xuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5fcmVnaXN0ZXJlZEJhc2VUaGVtZSA9IGJhc2VUaGVtZXMucmVkdWNlKChmaW5hbEJhc2VUaGVtZSwgYmFzZVRoZW1lKSA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgeyBbVEhFTUVfS0VZXToga2V5LCAuLi5jbGFzc2VzIH0gPSBiYXNlVGhlbWU7XG5cdFx0XHRcdFx0dGhpcy5fcmVnaXN0ZXJlZEJhc2VUaGVtZUtleXMucHVzaChrZXkpO1xuXHRcdFx0XHRcdHJldHVybiB7IC4uLmZpbmFsQmFzZVRoZW1lLCAuLi5jbGFzc2VzIH07XG5cdFx0XHRcdH0sIHt9KTtcblx0XHRcdFx0dGhpcy5fYmFzZVRoZW1lQ2xhc3Nlc1JldmVyc2VMb29rdXAgPSBjcmVhdGVUaGVtZUNsYXNzZXNMb29rdXAoYmFzZVRoZW1lcyk7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuX3RoZW1lID0gdGhpcy5fcmVnaXN0ZXJlZEJhc2VUaGVtZUtleXMucmVkdWNlKChiYXNlVGhlbWUsIHRoZW1lS2V5KSA9PiB7XG5cdFx0XHRcdHJldHVybiB7IC4uLmJhc2VUaGVtZSwgLi4udGhlbWVbdGhlbWVLZXldIH07XG5cdFx0XHR9LCB7fSk7XG5cblx0XHRcdHRoaXMuX3JlY2FsY3VsYXRlQ2xhc3NlcyA9IGZhbHNlO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBUaGVtZWQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRoZW1lZE1peGluO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIFRoZW1lZC50cyIsImltcG9ydCB7IFdpZGdldEJhc2UsIG5vQmluZCB9IGZyb20gJy4vV2lkZ2V0QmFzZSc7XG5pbXBvcnQgeyByZW5kZXJlciB9IGZyb20gJy4vdmRvbSc7XG5pbXBvcnQgeyBmcm9tIH0gZnJvbSAnLi4vc2hpbS9hcnJheSc7XG5pbXBvcnQgeyB3LCBkb20gfSBmcm9tICcuL2QnO1xuaW1wb3J0IGdsb2JhbCBmcm9tICcuLi9zaGltL2dsb2JhbCc7XG5pbXBvcnQgeyByZWdpc3RlclRoZW1lSW5qZWN0b3IgfSBmcm9tICcuL21peGlucy9UaGVtZWQnO1xuaW1wb3J0IHsgYWx3YXlzUmVuZGVyIH0gZnJvbSAnLi9kZWNvcmF0b3JzL2Fsd2F5c1JlbmRlcic7XG5cbmV4cG9ydCBlbnVtIEN1c3RvbUVsZW1lbnRDaGlsZFR5cGUge1xuXHRET0pPID0gJ0RPSk8nLFxuXHROT0RFID0gJ05PREUnLFxuXHRURVhUID0gJ1RFWFQnXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBEb21Ub1dpZGdldFdyYXBwZXIoZG9tTm9kZTogSFRNTEVsZW1lbnQpOiBhbnkge1xuXHRAYWx3YXlzUmVuZGVyKClcblx0Y2xhc3MgRG9tVG9XaWRnZXRXcmFwcGVyIGV4dGVuZHMgV2lkZ2V0QmFzZTxhbnk+IHtcblx0XHRwcm90ZWN0ZWQgcmVuZGVyKCkge1xuXHRcdFx0Y29uc3QgcHJvcGVydGllcyA9IE9iamVjdC5rZXlzKHRoaXMucHJvcGVydGllcykucmVkdWNlKFxuXHRcdFx0XHQocHJvcHMsIGtleTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgdmFsdWUgPSB0aGlzLnByb3BlcnRpZXNba2V5XTtcblx0XHRcdFx0XHRpZiAoa2V5LmluZGV4T2YoJ29uJykgPT09IDApIHtcblx0XHRcdFx0XHRcdGtleSA9IGBfXyR7a2V5fWA7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHByb3BzW2tleV0gPSB2YWx1ZTtcblx0XHRcdFx0XHRyZXR1cm4gcHJvcHM7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHt9IGFzIGFueVxuXHRcdFx0KTtcblx0XHRcdHJldHVybiBkb20oeyBub2RlOiBkb21Ob2RlLCBwcm9wczogcHJvcGVydGllcywgZGlmZlR5cGU6ICdkb20nIH0pO1xuXHRcdH1cblxuXHRcdHN0YXRpYyBnZXQgZG9tTm9kZSgpIHtcblx0XHRcdHJldHVybiBkb21Ob2RlO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBEb21Ub1dpZGdldFdyYXBwZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGUoZGVzY3JpcHRvcjogYW55LCBXaWRnZXRDb25zdHJ1Y3RvcjogYW55KTogYW55IHtcblx0Y29uc3QgeyBhdHRyaWJ1dGVzLCBjaGlsZFR5cGUsIHJlZ2lzdHJ5RmFjdG9yeSB9ID0gZGVzY3JpcHRvcjtcblx0Y29uc3QgYXR0cmlidXRlTWFwOiBhbnkgPSB7fTtcblxuXHRhdHRyaWJ1dGVzLmZvckVhY2goKHByb3BlcnR5TmFtZTogc3RyaW5nKSA9PiB7XG5cdFx0Y29uc3QgYXR0cmlidXRlTmFtZSA9IHByb3BlcnR5TmFtZS50b0xvd2VyQ2FzZSgpO1xuXHRcdGF0dHJpYnV0ZU1hcFthdHRyaWJ1dGVOYW1lXSA9IHByb3BlcnR5TmFtZTtcblx0fSk7XG5cblx0cmV0dXJuIGNsYXNzIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuXHRcdHByaXZhdGUgX3JlbmRlcmVyOiBhbnk7XG5cdFx0cHJpdmF0ZSBfcHJvcGVydGllczogYW55ID0ge307XG5cdFx0cHJpdmF0ZSBfY2hpbGRyZW46IGFueVtdID0gW107XG5cdFx0cHJpdmF0ZSBfZXZlbnRQcm9wZXJ0aWVzOiBhbnkgPSB7fTtcblx0XHRwcml2YXRlIF9pbml0aWFsaXNlZCA9IGZhbHNlO1xuXG5cdFx0cHVibGljIGNvbm5lY3RlZENhbGxiYWNrKCkge1xuXHRcdFx0aWYgKHRoaXMuX2luaXRpYWxpc2VkKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgZG9tUHJvcGVydGllczogYW55ID0ge307XG5cdFx0XHRjb25zdCB7IGF0dHJpYnV0ZXMsIHByb3BlcnRpZXMsIGV2ZW50cyB9ID0gZGVzY3JpcHRvcjtcblxuXHRcdFx0dGhpcy5fcHJvcGVydGllcyA9IHsgLi4udGhpcy5fcHJvcGVydGllcywgLi4udGhpcy5fYXR0cmlidXRlc1RvUHJvcGVydGllcyhhdHRyaWJ1dGVzKSB9O1xuXG5cdFx0XHRbLi4uYXR0cmlidXRlcywgLi4ucHJvcGVydGllc10uZm9yRWFjaCgocHJvcGVydHlOYW1lOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0Y29uc3QgdmFsdWUgPSAodGhpcyBhcyBhbnkpW3Byb3BlcnR5TmFtZV07XG5cdFx0XHRcdGNvbnN0IGZpbHRlcmVkUHJvcGVydHlOYW1lID0gcHJvcGVydHlOYW1lLnJlcGxhY2UoL15vbi8sICdfXycpO1xuXHRcdFx0XHRpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdHRoaXMuX3Byb3BlcnRpZXNbcHJvcGVydHlOYW1lXSA9IHZhbHVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGZpbHRlcmVkUHJvcGVydHlOYW1lICE9PSBwcm9wZXJ0eU5hbWUpIHtcblx0XHRcdFx0XHRkb21Qcm9wZXJ0aWVzW2ZpbHRlcmVkUHJvcGVydHlOYW1lXSA9IHtcblx0XHRcdFx0XHRcdGdldDogKCkgPT4gdGhpcy5fZ2V0UHJvcGVydHkocHJvcGVydHlOYW1lKSxcblx0XHRcdFx0XHRcdHNldDogKHZhbHVlOiBhbnkpID0+IHRoaXMuX3NldFByb3BlcnR5KHByb3BlcnR5TmFtZSwgdmFsdWUpXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGRvbVByb3BlcnRpZXNbcHJvcGVydHlOYW1lXSA9IHtcblx0XHRcdFx0XHRnZXQ6ICgpID0+IHRoaXMuX2dldFByb3BlcnR5KHByb3BlcnR5TmFtZSksXG5cdFx0XHRcdFx0c2V0OiAodmFsdWU6IGFueSkgPT4gdGhpcy5fc2V0UHJvcGVydHkocHJvcGVydHlOYW1lLCB2YWx1ZSlcblx0XHRcdFx0fTtcblx0XHRcdH0pO1xuXG5cdFx0XHRldmVudHMuZm9yRWFjaCgocHJvcGVydHlOYW1lOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0Y29uc3QgZXZlbnROYW1lID0gcHJvcGVydHlOYW1lLnJlcGxhY2UoL15vbi8sICcnKS50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0XHRjb25zdCBmaWx0ZXJlZFByb3BlcnR5TmFtZSA9IHByb3BlcnR5TmFtZS5yZXBsYWNlKC9eb24vLCAnX19vbicpO1xuXG5cdFx0XHRcdGRvbVByb3BlcnRpZXNbZmlsdGVyZWRQcm9wZXJ0eU5hbWVdID0ge1xuXHRcdFx0XHRcdGdldDogKCkgPT4gdGhpcy5fZ2V0RXZlbnRQcm9wZXJ0eShwcm9wZXJ0eU5hbWUpLFxuXHRcdFx0XHRcdHNldDogKHZhbHVlOiBhbnkpID0+IHRoaXMuX3NldEV2ZW50UHJvcGVydHkocHJvcGVydHlOYW1lLCB2YWx1ZSlcblx0XHRcdFx0fTtcblxuXHRcdFx0XHR0aGlzLl9ldmVudFByb3BlcnRpZXNbcHJvcGVydHlOYW1lXSA9IHVuZGVmaW5lZDtcblx0XHRcdFx0dGhpcy5fcHJvcGVydGllc1twcm9wZXJ0eU5hbWVdID0gKC4uLmFyZ3M6IGFueVtdKSA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgZXZlbnRDYWxsYmFjayA9IHRoaXMuX2dldEV2ZW50UHJvcGVydHkocHJvcGVydHlOYW1lKTtcblx0XHRcdFx0XHRpZiAodHlwZW9mIGV2ZW50Q2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRcdGV2ZW50Q2FsbGJhY2soLi4uYXJncyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHRoaXMuZGlzcGF0Y2hFdmVudChcblx0XHRcdFx0XHRcdG5ldyBDdXN0b21FdmVudChldmVudE5hbWUsIHtcblx0XHRcdFx0XHRcdFx0YnViYmxlczogZmFsc2UsXG5cdFx0XHRcdFx0XHRcdGRldGFpbDogYXJnc1xuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9O1xuXHRcdFx0fSk7XG5cblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIGRvbVByb3BlcnRpZXMpO1xuXG5cdFx0XHRjb25zdCBjaGlsZHJlbiA9IGNoaWxkVHlwZSA9PT0gQ3VzdG9tRWxlbWVudENoaWxkVHlwZS5URVhUID8gdGhpcy5jaGlsZE5vZGVzIDogdGhpcy5jaGlsZHJlbjtcblxuXHRcdFx0ZnJvbShjaGlsZHJlbikuZm9yRWFjaCgoY2hpbGROb2RlOiBOb2RlKSA9PiB7XG5cdFx0XHRcdGlmIChjaGlsZFR5cGUgPT09IEN1c3RvbUVsZW1lbnRDaGlsZFR5cGUuRE9KTykge1xuXHRcdFx0XHRcdGNoaWxkTm9kZS5hZGRFdmVudExpc3RlbmVyKCdkb2pvLWNlLXJlbmRlcicsICgpID0+IHRoaXMuX3JlbmRlcigpKTtcblx0XHRcdFx0XHRjaGlsZE5vZGUuYWRkRXZlbnRMaXN0ZW5lcignZG9qby1jZS1jb25uZWN0ZWQnLCAoKSA9PiB0aGlzLl9yZW5kZXIoKSk7XG5cdFx0XHRcdFx0dGhpcy5fY2hpbGRyZW4ucHVzaChEb21Ub1dpZGdldFdyYXBwZXIoY2hpbGROb2RlIGFzIEhUTUxFbGVtZW50KSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhpcy5fY2hpbGRyZW4ucHVzaChkb20oeyBub2RlOiBjaGlsZE5vZGUgYXMgSFRNTEVsZW1lbnQsIGRpZmZUeXBlOiAnZG9tJyB9KSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHR0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ2Rvam8tY2UtY29ubmVjdGVkJywgKGU6IGFueSkgPT4gdGhpcy5fY2hpbGRDb25uZWN0ZWQoZSkpO1xuXG5cdFx0XHRjb25zdCB3aWRnZXRQcm9wZXJ0aWVzID0gdGhpcy5fcHJvcGVydGllcztcblx0XHRcdGNvbnN0IHJlbmRlckNoaWxkcmVuID0gKCkgPT4gdGhpcy5fX2NoaWxkcmVuX18oKTtcblx0XHRcdGNvbnN0IFdyYXBwZXIgPSBjbGFzcyBleHRlbmRzIFdpZGdldEJhc2Uge1xuXHRcdFx0XHRyZW5kZXIoKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHcoV2lkZ2V0Q29uc3RydWN0b3IsIHdpZGdldFByb3BlcnRpZXMsIHJlbmRlckNoaWxkcmVuKCkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdFx0Y29uc3QgcmVnaXN0cnkgPSByZWdpc3RyeUZhY3RvcnkoKTtcblx0XHRcdGNvbnN0IHRoZW1lQ29udGV4dCA9IHJlZ2lzdGVyVGhlbWVJbmplY3Rvcih0aGlzLl9nZXRUaGVtZSgpLCByZWdpc3RyeSk7XG5cdFx0XHRnbG9iYWwuYWRkRXZlbnRMaXN0ZW5lcignZG9qby10aGVtZS1zZXQnLCAoKSA9PiB0aGVtZUNvbnRleHQuc2V0KHRoaXMuX2dldFRoZW1lKCkpKTtcblx0XHRcdGNvbnN0IHIgPSByZW5kZXJlcigoKSA9PiB3KFdyYXBwZXIsIHt9KSk7XG5cdFx0XHR0aGlzLl9yZW5kZXJlciA9IHI7XG5cdFx0XHRyLm1vdW50KHsgZG9tTm9kZTogdGhpcywgbWVyZ2U6IGZhbHNlLCByZWdpc3RyeSB9KTtcblxuXHRcdFx0dGhpcy5faW5pdGlhbGlzZWQgPSB0cnVlO1xuXHRcdFx0dGhpcy5kaXNwYXRjaEV2ZW50KFxuXHRcdFx0XHRuZXcgQ3VzdG9tRXZlbnQoJ2Rvam8tY2UtY29ubmVjdGVkJywge1xuXHRcdFx0XHRcdGJ1YmJsZXM6IHRydWUsXG5cdFx0XHRcdFx0ZGV0YWlsOiB0aGlzXG5cdFx0XHRcdH0pXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHByaXZhdGUgX2dldFRoZW1lKCkge1xuXHRcdFx0aWYgKGdsb2JhbCAmJiBnbG9iYWwuZG9qb2NlICYmIGdsb2JhbC5kb2pvY2UudGhlbWUpIHtcblx0XHRcdFx0cmV0dXJuIGdsb2JhbC5kb2pvY2UudGhlbWVzW2dsb2JhbC5kb2pvY2UudGhlbWVdO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHByaXZhdGUgX2NoaWxkQ29ubmVjdGVkKGU6IGFueSkge1xuXHRcdFx0Y29uc3Qgbm9kZSA9IGUuZGV0YWlsO1xuXHRcdFx0aWYgKG5vZGUucGFyZW50Tm9kZSA9PT0gdGhpcykge1xuXHRcdFx0XHRjb25zdCBleGlzdHMgPSB0aGlzLl9jaGlsZHJlbi5zb21lKChjaGlsZCkgPT4gY2hpbGQuZG9tTm9kZSA9PT0gbm9kZSk7XG5cdFx0XHRcdGlmICghZXhpc3RzKSB7XG5cdFx0XHRcdFx0bm9kZS5hZGRFdmVudExpc3RlbmVyKCdkb2pvLWNlLXJlbmRlcicsICgpID0+IHRoaXMuX3JlbmRlcigpKTtcblx0XHRcdFx0XHR0aGlzLl9jaGlsZHJlbi5wdXNoKERvbVRvV2lkZ2V0V3JhcHBlcihub2RlKSk7XG5cdFx0XHRcdFx0dGhpcy5fcmVuZGVyKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRwcml2YXRlIF9yZW5kZXIoKSB7XG5cdFx0XHRpZiAodGhpcy5fcmVuZGVyZXIpIHtcblx0XHRcdFx0dGhpcy5fcmVuZGVyZXIuaW52YWxpZGF0ZSgpO1xuXHRcdFx0XHR0aGlzLmRpc3BhdGNoRXZlbnQoXG5cdFx0XHRcdFx0bmV3IEN1c3RvbUV2ZW50KCdkb2pvLWNlLXJlbmRlcicsIHtcblx0XHRcdFx0XHRcdGJ1YmJsZXM6IGZhbHNlLFxuXHRcdFx0XHRcdFx0ZGV0YWlsOiB0aGlzXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRwdWJsaWMgX19wcm9wZXJ0aWVzX18oKSB7XG5cdFx0XHRyZXR1cm4geyAuLi50aGlzLl9wcm9wZXJ0aWVzLCAuLi50aGlzLl9ldmVudFByb3BlcnRpZXMgfTtcblx0XHR9XG5cblx0XHRwdWJsaWMgX19jaGlsZHJlbl9fKCkge1xuXHRcdFx0aWYgKGNoaWxkVHlwZSA9PT0gQ3VzdG9tRWxlbWVudENoaWxkVHlwZS5ET0pPKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLl9jaGlsZHJlbi5maWx0ZXIoKENoaWxkKSA9PiBDaGlsZC5kb21Ob2RlLmlzV2lkZ2V0KS5tYXAoKENoaWxkOiBhbnkpID0+IHtcblx0XHRcdFx0XHRjb25zdCB7IGRvbU5vZGUgfSA9IENoaWxkO1xuXHRcdFx0XHRcdHJldHVybiB3KENoaWxkLCB7IC4uLmRvbU5vZGUuX19wcm9wZXJ0aWVzX18oKSB9LCBbLi4uZG9tTm9kZS5fX2NoaWxkcmVuX18oKV0pO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLl9jaGlsZHJlbjtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRwdWJsaWMgYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrKG5hbWU6IHN0cmluZywgb2xkVmFsdWU6IHN0cmluZyB8IG51bGwsIHZhbHVlOiBzdHJpbmcgfCBudWxsKSB7XG5cdFx0XHRjb25zdCBwcm9wZXJ0eU5hbWUgPSBhdHRyaWJ1dGVNYXBbbmFtZV07XG5cdFx0XHR0aGlzLl9zZXRQcm9wZXJ0eShwcm9wZXJ0eU5hbWUsIHZhbHVlKTtcblx0XHR9XG5cblx0XHRwcml2YXRlIF9zZXRFdmVudFByb3BlcnR5KHByb3BlcnR5TmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KSB7XG5cdFx0XHR0aGlzLl9ldmVudFByb3BlcnRpZXNbcHJvcGVydHlOYW1lXSA9IHZhbHVlO1xuXHRcdH1cblxuXHRcdHByaXZhdGUgX2dldEV2ZW50UHJvcGVydHkocHJvcGVydHlOYW1lOiBzdHJpbmcpIHtcblx0XHRcdHJldHVybiB0aGlzLl9ldmVudFByb3BlcnRpZXNbcHJvcGVydHlOYW1lXTtcblx0XHR9XG5cblx0XHRwcml2YXRlIF9zZXRQcm9wZXJ0eShwcm9wZXJ0eU5hbWU6IHN0cmluZywgdmFsdWU6IGFueSkge1xuXHRcdFx0aWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHR2YWx1ZVtub0JpbmRdID0gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdHRoaXMuX3Byb3BlcnRpZXNbcHJvcGVydHlOYW1lXSA9IHZhbHVlO1xuXHRcdFx0dGhpcy5fcmVuZGVyKCk7XG5cdFx0fVxuXG5cdFx0cHJpdmF0ZSBfZ2V0UHJvcGVydHkocHJvcGVydHlOYW1lOiBzdHJpbmcpIHtcblx0XHRcdHJldHVybiB0aGlzLl9wcm9wZXJ0aWVzW3Byb3BlcnR5TmFtZV07XG5cdFx0fVxuXG5cdFx0cHJpdmF0ZSBfYXR0cmlidXRlc1RvUHJvcGVydGllcyhhdHRyaWJ1dGVzOiBzdHJpbmdbXSkge1xuXHRcdFx0cmV0dXJuIGF0dHJpYnV0ZXMucmVkdWNlKChwcm9wZXJ0aWVzOiBhbnksIHByb3BlcnR5TmFtZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGNvbnN0IGF0dHJpYnV0ZU5hbWUgPSBwcm9wZXJ0eU5hbWUudG9Mb3dlckNhc2UoKTtcblx0XHRcdFx0Y29uc3QgdmFsdWUgPSB0aGlzLmdldEF0dHJpYnV0ZShhdHRyaWJ1dGVOYW1lKTtcblx0XHRcdFx0aWYgKHZhbHVlICE9PSBudWxsKSB7XG5cdFx0XHRcdFx0cHJvcGVydGllc1twcm9wZXJ0eU5hbWVdID0gdmFsdWU7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIHByb3BlcnRpZXM7XG5cdFx0XHR9LCB7fSk7XG5cdFx0fVxuXG5cdFx0c3RhdGljIGdldCBvYnNlcnZlZEF0dHJpYnV0ZXMoKSB7XG5cdFx0XHRyZXR1cm4gT2JqZWN0LmtleXMoYXR0cmlidXRlTWFwKTtcblx0XHR9XG5cblx0XHRwdWJsaWMgZ2V0IGlzV2lkZ2V0KCkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHR9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXIoV2lkZ2V0Q29uc3RydWN0b3I6IGFueSk6IHZvaWQge1xuXHRjb25zdCBkZXNjcmlwdG9yID0gV2lkZ2V0Q29uc3RydWN0b3IucHJvdG90eXBlICYmIFdpZGdldENvbnN0cnVjdG9yLnByb3RvdHlwZS5fX2N1c3RvbUVsZW1lbnREZXNjcmlwdG9yO1xuXG5cdGlmICghZGVzY3JpcHRvcikge1xuXHRcdHRocm93IG5ldyBFcnJvcihcblx0XHRcdCdDYW5ub3QgZ2V0IGRlc2NyaXB0b3IgZm9yIEN1c3RvbSBFbGVtZW50LCBoYXZlIHlvdSBhZGRlZCB0aGUgQGN1c3RvbUVsZW1lbnQgZGVjb3JhdG9yIHRvIHlvdXIgV2lkZ2V0Pydcblx0XHQpO1xuXHR9XG5cblx0Z2xvYmFsLmN1c3RvbUVsZW1lbnRzLmRlZmluZShkZXNjcmlwdG9yLnRhZ05hbWUsIGNyZWF0ZShkZXNjcmlwdG9yLCBXaWRnZXRDb25zdHJ1Y3RvcikpO1xufVxuXG5leHBvcnQgZGVmYXVsdCByZWdpc3RlcjtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyByZWdpc3RlckN1c3RvbUVsZW1lbnQudHMiLCJpbXBvcnQgZ2xvYmFsIGZyb20gJy4uL3NoaW0vZ2xvYmFsJztcbmltcG9ydCBoYXMgZnJvbSAnLi4vaGFzL2hhcyc7XG5pbXBvcnQgeyBXZWFrTWFwIH0gZnJvbSAnLi4vc2hpbS9XZWFrTWFwJztcbmltcG9ydCB7XG5cdFdOb2RlLFxuXHRWTm9kZSxcblx0RE5vZGUsXG5cdFZOb2RlUHJvcGVydGllcyxcblx0V2lkZ2V0QmFzZUNvbnN0cnVjdG9yLFxuXHRUcmFuc2l0aW9uU3RyYXRlZ3ksXG5cdERvbVZOb2RlXG59IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgdHJhbnNpdGlvblN0cmF0ZWd5IGZyb20gJy4vYW5pbWF0aW9ucy9jc3NUcmFuc2l0aW9ucyc7XG5pbXBvcnQgeyBpc1ZOb2RlLCBpc1dOb2RlLCBXTk9ERSwgdiwgaXNEb21WTm9kZSwgdyB9IGZyb20gJy4vZCc7XG5pbXBvcnQgeyBSZWdpc3RyeSwgaXNXaWRnZXRCYXNlQ29uc3RydWN0b3IgfSBmcm9tICcuL1JlZ2lzdHJ5JztcbmltcG9ydCB7IFdpZGdldEJhc2UsIHdpZGdldEluc3RhbmNlTWFwIH0gZnJvbSAnLi9XaWRnZXRCYXNlJztcblxuZXhwb3J0IGludGVyZmFjZSBCYXNlTm9kZVdyYXBwZXIge1xuXHRub2RlOiBXTm9kZSB8IFZOb2RlO1xuXHRkb21Ob2RlPzogTm9kZTtcblx0Y2hpbGRyZW5XcmFwcGVycz86IEROb2RlV3JhcHBlcltdO1xuXHRkZXB0aDogbnVtYmVyO1xuXHRyZXF1aXJlc0luc2VydEJlZm9yZT86IGJvb2xlYW47XG5cdGhhc1ByZXZpb3VzU2libGluZ3M/OiBib29sZWFuO1xuXHRoYXNQYXJlbnRXTm9kZT86IGJvb2xlYW47XG5cdG5hbWVzcGFjZT86IHN0cmluZztcblx0aGFzQW5pbWF0aW9ucz86IGJvb2xlYW47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgV05vZGVXcmFwcGVyIGV4dGVuZHMgQmFzZU5vZGVXcmFwcGVyIHtcblx0bm9kZTogV05vZGU7XG5cdGluc3RhbmNlPzogV2lkZ2V0QmFzZTtcblx0bWVyZ2VOb2Rlcz86IE5vZGVbXTtcblx0bm9kZUhhbmRsZXJDYWxsZWQ/OiBib29sZWFuO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFZOb2RlV3JhcHBlciBleHRlbmRzIEJhc2VOb2RlV3JhcHBlciB7XG5cdG5vZGU6IFZOb2RlIHwgRG9tVk5vZGU7XG5cdG1lcmdlZD86IGJvb2xlYW47XG5cdGRlY29yYXRlZERlZmVycmVkUHJvcGVydGllcz86IFZOb2RlUHJvcGVydGllcztcblx0aW5zZXJ0ZWQ/OiBib29sZWFuO1xufVxuXG5leHBvcnQgdHlwZSBETm9kZVdyYXBwZXIgPSBWTm9kZVdyYXBwZXIgfCBXTm9kZVdyYXBwZXI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgTW91bnRPcHRpb25zIHtcblx0c3luYzogYm9vbGVhbjtcblx0bWVyZ2U6IGJvb2xlYW47XG5cdHRyYW5zaXRpb246IFRyYW5zaXRpb25TdHJhdGVneTtcblx0ZG9tTm9kZTogSFRNTEVsZW1lbnQ7XG5cdHJlZ2lzdHJ5OiBSZWdpc3RyeSB8IG51bGw7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVuZGVyZXIge1xuXHRpbnZhbGlkYXRlKCk6IHZvaWQ7XG5cdG1vdW50KG1vdW50T3B0aW9ucz86IFBhcnRpYWw8TW91bnRPcHRpb25zPik6IHZvaWQ7XG59XG5cbmludGVyZmFjZSBQcm9jZXNzSXRlbSB7XG5cdGN1cnJlbnQ/OiAoV05vZGVXcmFwcGVyIHwgVk5vZGVXcmFwcGVyKVtdO1xuXHRuZXh0PzogKFdOb2RlV3JhcHBlciB8IFZOb2RlV3JhcHBlcilbXTtcblx0bWV0YTogUHJvY2Vzc01ldGE7XG59XG5cbmludGVyZmFjZSBQcm9jZXNzUmVzdWx0IHtcblx0aXRlbT86IFByb2Nlc3NJdGVtO1xuXHR3aWRnZXQ/OiBBdHRhY2hBcHBsaWNhdGlvbiB8IERldGFjaEFwcGxpY2F0aW9uO1xuXHRkb20/OiBBcHBsaWNhdGlvbkluc3RydWN0aW9uO1xufVxuXG5pbnRlcmZhY2UgUHJvY2Vzc01ldGEge1xuXHRtZXJnZU5vZGVzPzogTm9kZVtdO1xuXHRvbGRJbmRleD86IG51bWJlcjtcblx0bmV3SW5kZXg/OiBudW1iZXI7XG59XG5cbmludGVyZmFjZSBJbnZhbGlkYXRpb25RdWV1ZUl0ZW0ge1xuXHRpbnN0YW5jZTogV2lkZ2V0QmFzZTtcblx0ZGVwdGg6IG51bWJlcjtcbn1cblxuaW50ZXJmYWNlIEluc3RydWN0aW9uIHtcblx0Y3VycmVudDogdW5kZWZpbmVkIHwgRE5vZGVXcmFwcGVyO1xuXHRuZXh0OiB1bmRlZmluZWQgfCBETm9kZVdyYXBwZXI7XG59XG5cbmludGVyZmFjZSBDcmVhdGVXaWRnZXRJbnN0cnVjdGlvbiB7XG5cdG5leHQ6IFdOb2RlV3JhcHBlcjtcbn1cblxuaW50ZXJmYWNlIFVwZGF0ZVdpZGdldEluc3RydWN0aW9uIHtcblx0Y3VycmVudDogV05vZGVXcmFwcGVyO1xuXHRuZXh0OiBXTm9kZVdyYXBwZXI7XG59XG5cbmludGVyZmFjZSBSZW1vdmVXaWRnZXRJbnN0cnVjdGlvbiB7XG5cdGN1cnJlbnQ6IFdOb2RlV3JhcHBlcjtcbn1cblxuaW50ZXJmYWNlIENyZWF0ZURvbUluc3RydWN0aW9uIHtcblx0bmV4dDogVk5vZGVXcmFwcGVyO1xufVxuXG5pbnRlcmZhY2UgVXBkYXRlRG9tSW5zdHJ1Y3Rpb24ge1xuXHRjdXJyZW50OiBWTm9kZVdyYXBwZXI7XG5cdG5leHQ6IFZOb2RlV3JhcHBlcjtcbn1cblxuaW50ZXJmYWNlIFJlbW92ZURvbUluc3RydWN0aW9uIHtcblx0Y3VycmVudDogVk5vZGVXcmFwcGVyO1xufVxuXG5pbnRlcmZhY2UgQXR0YWNoQXBwbGljYXRpb24ge1xuXHR0eXBlOiAnYXR0YWNoJztcblx0aW5zdGFuY2U6IFdpZGdldEJhc2U7XG5cdGF0dGFjaGVkOiBib29sZWFuO1xufVxuXG5pbnRlcmZhY2UgRGV0YWNoQXBwbGljYXRpb24ge1xuXHR0eXBlOiAnZGV0YWNoJztcblx0Y3VycmVudDogV05vZGVXcmFwcGVyO1xufVxuXG5pbnRlcmZhY2UgQ3JlYXRlRG9tQXBwbGljYXRpb24ge1xuXHR0eXBlOiAnY3JlYXRlJztcblx0Y3VycmVudD86IFZOb2RlV3JhcHBlcjtcblx0bmV4dDogVk5vZGVXcmFwcGVyO1xuXHRwYXJlbnREb21Ob2RlOiBOb2RlO1xufVxuXG5pbnRlcmZhY2UgRGVsZXRlRG9tQXBwbGljYXRpb24ge1xuXHR0eXBlOiAnZGVsZXRlJztcblx0Y3VycmVudDogVk5vZGVXcmFwcGVyO1xufVxuXG5pbnRlcmZhY2UgVXBkYXRlRG9tQXBwbGljYXRpb24ge1xuXHR0eXBlOiAndXBkYXRlJztcblx0Y3VycmVudDogVk5vZGVXcmFwcGVyO1xuXHRuZXh0OiBWTm9kZVdyYXBwZXI7XG59XG5cbmludGVyZmFjZSBQcmV2aW91c1Byb3BlcnRpZXMge1xuXHRwcm9wZXJ0aWVzOiBhbnk7XG5cdGF0dHJpYnV0ZXM/OiBhbnk7XG5cdGV2ZW50cz86IGFueTtcbn1cblxudHlwZSBBcHBsaWNhdGlvbkluc3RydWN0aW9uID1cblx0fCBDcmVhdGVEb21BcHBsaWNhdGlvblxuXHR8IFVwZGF0ZURvbUFwcGxpY2F0aW9uXG5cdHwgRGVsZXRlRG9tQXBwbGljYXRpb25cblx0fCBBdHRhY2hBcHBsaWNhdGlvblxuXHR8IERldGFjaEFwcGxpY2F0aW9uO1xuXG5jb25zdCBFTVBUWV9BUlJBWTogRE5vZGVXcmFwcGVyW10gPSBbXTtcbmNvbnN0IG5vZGVPcGVyYXRpb25zID0gWydmb2N1cycsICdibHVyJywgJ3Njcm9sbEludG9WaWV3JywgJ2NsaWNrJ107XG5jb25zdCBOQU1FU1BBQ0VfVzMgPSAnaHR0cDovL3d3dy53My5vcmcvJztcbmNvbnN0IE5BTUVTUEFDRV9TVkcgPSBOQU1FU1BBQ0VfVzMgKyAnMjAwMC9zdmcnO1xuY29uc3QgTkFNRVNQQUNFX1hMSU5LID0gTkFNRVNQQUNFX1czICsgJzE5OTkveGxpbmsnO1xuXG5mdW5jdGlvbiBpc1dOb2RlV3JhcHBlcihjaGlsZDogRE5vZGVXcmFwcGVyKTogY2hpbGQgaXMgV05vZGVXcmFwcGVyIHtcblx0cmV0dXJuIGNoaWxkICYmIGlzV05vZGUoY2hpbGQubm9kZSk7XG59XG5cbmZ1bmN0aW9uIGlzVk5vZGVXcmFwcGVyKGNoaWxkPzogRE5vZGVXcmFwcGVyIHwgbnVsbCk6IGNoaWxkIGlzIFZOb2RlV3JhcHBlciB7XG5cdHJldHVybiAhIWNoaWxkICYmIGlzVk5vZGUoY2hpbGQubm9kZSk7XG59XG5cbmZ1bmN0aW9uIGlzQXR0YWNoQXBwbGljYXRpb24odmFsdWU6IGFueSk6IHZhbHVlIGlzIEF0dGFjaEFwcGxpY2F0aW9uIHwgRGV0YWNoQXBwbGljYXRpb24ge1xuXHRyZXR1cm4gISF2YWx1ZS50eXBlO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVBdHRyaWJ1dGVzKFxuXHRkb21Ob2RlOiBFbGVtZW50LFxuXHRwcmV2aW91c0F0dHJpYnV0ZXM6IHsgW2luZGV4OiBzdHJpbmddOiBzdHJpbmcgfCB1bmRlZmluZWQgfSxcblx0YXR0cmlidXRlczogeyBbaW5kZXg6IHN0cmluZ106IHN0cmluZyB8IHVuZGVmaW5lZCB9LFxuXHRuYW1lc3BhY2U/OiBzdHJpbmdcbikge1xuXHRjb25zdCBhdHRyTmFtZXMgPSBPYmplY3Qua2V5cyhhdHRyaWJ1dGVzKTtcblx0Y29uc3QgYXR0ckNvdW50ID0gYXR0ck5hbWVzLmxlbmd0aDtcblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhdHRyQ291bnQ7IGkrKykge1xuXHRcdGNvbnN0IGF0dHJOYW1lID0gYXR0ck5hbWVzW2ldO1xuXHRcdGNvbnN0IGF0dHJWYWx1ZSA9IGF0dHJpYnV0ZXNbYXR0ck5hbWVdO1xuXHRcdGNvbnN0IHByZXZpb3VzQXR0clZhbHVlID0gcHJldmlvdXNBdHRyaWJ1dGVzW2F0dHJOYW1lXTtcblx0XHRpZiAoYXR0clZhbHVlICE9PSBwcmV2aW91c0F0dHJWYWx1ZSkge1xuXHRcdFx0dXBkYXRlQXR0cmlidXRlKGRvbU5vZGUsIGF0dHJOYW1lLCBhdHRyVmFsdWUsIG5hbWVzcGFjZSk7XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGJ1aWxkUHJldmlvdXNQcm9wZXJ0aWVzKGRvbU5vZGU6IGFueSwgY3VycmVudDogVk5vZGVXcmFwcGVyLCBuZXh0OiBWTm9kZVdyYXBwZXIpIHtcblx0Y29uc3Qge1xuXHRcdG5vZGU6IHsgZGlmZlR5cGUsIHByb3BlcnRpZXMsIGF0dHJpYnV0ZXMgfVxuXHR9ID0gY3VycmVudDtcblx0aWYgKCFkaWZmVHlwZSB8fCBkaWZmVHlwZSA9PT0gJ3Zkb20nKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHByb3BlcnRpZXM6IGN1cnJlbnQubm9kZS5wcm9wZXJ0aWVzLFxuXHRcdFx0YXR0cmlidXRlczogY3VycmVudC5ub2RlLmF0dHJpYnV0ZXMsXG5cdFx0XHRldmVudHM6IGN1cnJlbnQubm9kZS5ldmVudHNcblx0XHR9O1xuXHR9IGVsc2UgaWYgKGRpZmZUeXBlID09PSAnbm9uZScpIHtcblx0XHRyZXR1cm4geyBwcm9wZXJ0aWVzOiB7fSwgYXR0cmlidXRlczogY3VycmVudC5ub2RlLmF0dHJpYnV0ZXMgPyB7fSA6IHVuZGVmaW5lZCwgZXZlbnRzOiBjdXJyZW50Lm5vZGUuZXZlbnRzIH07XG5cdH1cblx0bGV0IG5ld1Byb3BlcnRpZXM6IGFueSA9IHtcblx0XHRwcm9wZXJ0aWVzOiB7fVxuXHR9O1xuXHRpZiAoYXR0cmlidXRlcykge1xuXHRcdG5ld1Byb3BlcnRpZXMuYXR0cmlidXRlcyA9IHt9O1xuXHRcdG5ld1Byb3BlcnRpZXMuZXZlbnRzID0gY3VycmVudC5ub2RlLmV2ZW50cztcblx0XHRPYmplY3Qua2V5cyhwcm9wZXJ0aWVzKS5mb3JFYWNoKChwcm9wTmFtZSkgPT4ge1xuXHRcdFx0bmV3UHJvcGVydGllcy5wcm9wZXJ0aWVzW3Byb3BOYW1lXSA9IGRvbU5vZGVbcHJvcE5hbWVdO1xuXHRcdH0pO1xuXHRcdE9iamVjdC5rZXlzKGF0dHJpYnV0ZXMpLmZvckVhY2goKGF0dHJOYW1lKSA9PiB7XG5cdFx0XHRuZXdQcm9wZXJ0aWVzLmF0dHJpYnV0ZXNbYXR0ck5hbWVdID0gZG9tTm9kZS5nZXRBdHRyaWJ1dGUoYXR0ck5hbWUpO1xuXHRcdH0pO1xuXHRcdHJldHVybiBuZXdQcm9wZXJ0aWVzO1xuXHR9XG5cdG5ld1Byb3BlcnRpZXMucHJvcGVydGllcyA9IE9iamVjdC5rZXlzKHByb3BlcnRpZXMpLnJlZHVjZShcblx0XHQocHJvcHMsIHByb3BlcnR5KSA9PiB7XG5cdFx0XHRwcm9wc1twcm9wZXJ0eV0gPSBkb21Ob2RlLmdldEF0dHJpYnV0ZShwcm9wZXJ0eSkgfHwgZG9tTm9kZVtwcm9wZXJ0eV07XG5cdFx0XHRyZXR1cm4gcHJvcHM7XG5cdFx0fSxcblx0XHR7fSBhcyBhbnlcblx0KTtcblx0cmV0dXJuIG5ld1Byb3BlcnRpZXM7XG59XG5cbmZ1bmN0aW9uIGNoZWNrRGlzdGluZ3Vpc2hhYmxlKHdyYXBwZXJzOiBETm9kZVdyYXBwZXJbXSwgaW5kZXg6IG51bWJlciwgcGFyZW50V05vZGVXcmFwcGVyPzogV05vZGVXcmFwcGVyKSB7XG5cdGNvbnN0IHdyYXBwZXJUb0NoZWNrID0gd3JhcHBlcnNbaW5kZXhdO1xuXHRpZiAoaXNWTm9kZVdyYXBwZXIod3JhcHBlclRvQ2hlY2spICYmICF3cmFwcGVyVG9DaGVjay5ub2RlLnRhZykge1xuXHRcdHJldHVybjtcblx0fVxuXHRjb25zdCB7IGtleSB9ID0gd3JhcHBlclRvQ2hlY2subm9kZS5wcm9wZXJ0aWVzO1xuXHRsZXQgcGFyZW50TmFtZSA9ICd1bmtub3duJztcblx0aWYgKHBhcmVudFdOb2RlV3JhcHBlcikge1xuXHRcdGNvbnN0IHtcblx0XHRcdG5vZGU6IHsgd2lkZ2V0Q29uc3RydWN0b3IgfVxuXHRcdH0gPSBwYXJlbnRXTm9kZVdyYXBwZXI7XG5cdFx0cGFyZW50TmFtZSA9ICh3aWRnZXRDb25zdHJ1Y3RvciBhcyBhbnkpLm5hbWUgfHwgJ3Vua25vd24nO1xuXHR9XG5cblx0aWYgKGtleSA9PT0gdW5kZWZpbmVkIHx8IGtleSA9PT0gbnVsbCkge1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgd3JhcHBlcnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGlmIChpICE9PSBpbmRleCkge1xuXHRcdFx0XHRjb25zdCB3cmFwcGVyID0gd3JhcHBlcnNbaV07XG5cdFx0XHRcdGlmIChzYW1lKHdyYXBwZXIsIHdyYXBwZXJUb0NoZWNrKSkge1xuXHRcdFx0XHRcdGxldCBub2RlSWRlbnRpZmllcjogc3RyaW5nO1xuXHRcdFx0XHRcdGlmIChpc1dOb2RlV3JhcHBlcih3cmFwcGVyKSkge1xuXHRcdFx0XHRcdFx0bm9kZUlkZW50aWZpZXIgPSAod3JhcHBlci5ub2RlLndpZGdldENvbnN0cnVjdG9yIGFzIGFueSkubmFtZSB8fCAndW5rbm93bic7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdG5vZGVJZGVudGlmaWVyID0gd3JhcHBlci5ub2RlLnRhZztcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRjb25zb2xlLndhcm4oXG5cdFx0XHRcdFx0XHRgQSB3aWRnZXQgKCR7cGFyZW50TmFtZX0pIGhhcyBoYWQgYSBjaGlsZCBhZGRlZCBvciByZW1vdmVkLCBidXQgdGhleSB3ZXJlIG5vdCBhYmxlIHRvIHVuaXF1ZWx5IGlkZW50aWZpZWQuIEl0IGlzIHJlY29tbWVuZGVkIHRvIHByb3ZpZGUgYSB1bmlxdWUgJ2tleScgcHJvcGVydHkgd2hlbiB1c2luZyB0aGUgc2FtZSB3aWRnZXQgb3IgZWxlbWVudCAoJHtub2RlSWRlbnRpZmllcn0pIG11bHRpcGxlIHRpbWVzIGFzIHNpYmxpbmdzYFxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gc2FtZShkbm9kZTE6IEROb2RlV3JhcHBlciwgZG5vZGUyOiBETm9kZVdyYXBwZXIpOiBib29sZWFuIHtcblx0aWYgKGlzVk5vZGVXcmFwcGVyKGRub2RlMSkgJiYgaXNWTm9kZVdyYXBwZXIoZG5vZGUyKSkge1xuXHRcdGlmIChpc0RvbVZOb2RlKGRub2RlMS5ub2RlKSAmJiBpc0RvbVZOb2RlKGRub2RlMi5ub2RlKSkge1xuXHRcdFx0aWYgKGRub2RlMS5ub2RlLmRvbU5vZGUgIT09IGRub2RlMi5ub2RlLmRvbU5vZGUpIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoZG5vZGUxLm5vZGUudGFnICE9PSBkbm9kZTIubm9kZS50YWcpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0aWYgKGRub2RlMS5ub2RlLnByb3BlcnRpZXMua2V5ICE9PSBkbm9kZTIubm9kZS5wcm9wZXJ0aWVzLmtleSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSBlbHNlIGlmIChpc1dOb2RlV3JhcHBlcihkbm9kZTEpICYmIGlzV05vZGVXcmFwcGVyKGRub2RlMikpIHtcblx0XHRpZiAoZG5vZGUxLmluc3RhbmNlID09PSB1bmRlZmluZWQgJiYgdHlwZW9mIGRub2RlMi5ub2RlLndpZGdldENvbnN0cnVjdG9yID09PSAnc3RyaW5nJykge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRpZiAoZG5vZGUxLm5vZGUud2lkZ2V0Q29uc3RydWN0b3IgIT09IGRub2RlMi5ub2RlLndpZGdldENvbnN0cnVjdG9yKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdGlmIChkbm9kZTEubm9kZS5wcm9wZXJ0aWVzLmtleSAhPT0gZG5vZGUyLm5vZGUucHJvcGVydGllcy5rZXkpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblx0cmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBmaW5kSW5kZXhPZkNoaWxkKGNoaWxkcmVuOiBETm9kZVdyYXBwZXJbXSwgc2FtZUFzOiBETm9kZVdyYXBwZXIsIHN0YXJ0OiBudW1iZXIpIHtcblx0Zm9yIChsZXQgaSA9IHN0YXJ0OyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcblx0XHRpZiAoc2FtZShjaGlsZHJlbltpXSwgc2FtZUFzKSkge1xuXHRcdFx0cmV0dXJuIGk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiAtMTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlQ2xhc3NQcm9wVmFsdWUoY2xhc3Nlczogc3RyaW5nIHwgc3RyaW5nW10gPSBbXSkge1xuXHRjbGFzc2VzID0gQXJyYXkuaXNBcnJheShjbGFzc2VzKSA/IGNsYXNzZXMgOiBbY2xhc3Nlc107XG5cdHJldHVybiBjbGFzc2VzLmpvaW4oJyAnKS50cmltKCk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUF0dHJpYnV0ZShkb21Ob2RlOiBFbGVtZW50LCBhdHRyTmFtZTogc3RyaW5nLCBhdHRyVmFsdWU6IHN0cmluZyB8IHVuZGVmaW5lZCwgbmFtZXNwYWNlPzogc3RyaW5nKSB7XG5cdGlmIChuYW1lc3BhY2UgPT09IE5BTUVTUEFDRV9TVkcgJiYgYXR0ck5hbWUgPT09ICdocmVmJyAmJiBhdHRyVmFsdWUpIHtcblx0XHRkb21Ob2RlLnNldEF0dHJpYnV0ZU5TKE5BTUVTUEFDRV9YTElOSywgYXR0ck5hbWUsIGF0dHJWYWx1ZSk7XG5cdH0gZWxzZSBpZiAoKGF0dHJOYW1lID09PSAncm9sZScgJiYgYXR0clZhbHVlID09PSAnJykgfHwgYXR0clZhbHVlID09PSB1bmRlZmluZWQpIHtcblx0XHRkb21Ob2RlLnJlbW92ZUF0dHJpYnV0ZShhdHRyTmFtZSk7XG5cdH0gZWxzZSB7XG5cdFx0ZG9tTm9kZS5zZXRBdHRyaWJ1dGUoYXR0ck5hbWUsIGF0dHJWYWx1ZSk7XG5cdH1cbn1cblxuZnVuY3Rpb24gcnVuRW50ZXJBbmltYXRpb24obmV4dDogVk5vZGVXcmFwcGVyLCB0cmFuc2l0aW9uczogVHJhbnNpdGlvblN0cmF0ZWd5KSB7XG5cdGNvbnN0IHtcblx0XHRkb21Ob2RlLFxuXHRcdG5vZGU6IHsgcHJvcGVydGllcyB9LFxuXHRcdG5vZGU6IHtcblx0XHRcdHByb3BlcnRpZXM6IHsgZW50ZXJBbmltYXRpb24gfVxuXHRcdH1cblx0fSA9IG5leHQ7XG5cdGlmIChlbnRlckFuaW1hdGlvbikge1xuXHRcdGlmICh0eXBlb2YgZW50ZXJBbmltYXRpb24gPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdHJldHVybiBlbnRlckFuaW1hdGlvbihkb21Ob2RlIGFzIEVsZW1lbnQsIHByb3BlcnRpZXMpO1xuXHRcdH1cblx0XHR0cmFuc2l0aW9ucy5lbnRlcihkb21Ob2RlIGFzIEVsZW1lbnQsIHByb3BlcnRpZXMsIGVudGVyQW5pbWF0aW9uKTtcblx0fVxufVxuXG5mdW5jdGlvbiBydW5FeGl0QW5pbWF0aW9uKGN1cnJlbnQ6IFZOb2RlV3JhcHBlciwgdHJhbnNpdGlvbnM6IFRyYW5zaXRpb25TdHJhdGVneSkge1xuXHRjb25zdCB7XG5cdFx0ZG9tTm9kZSxcblx0XHRub2RlOiB7IHByb3BlcnRpZXMgfSxcblx0XHRub2RlOiB7XG5cdFx0XHRwcm9wZXJ0aWVzOiB7IGV4aXRBbmltYXRpb24gfVxuXHRcdH1cblx0fSA9IGN1cnJlbnQ7XG5cdGNvbnN0IHJlbW92ZURvbU5vZGUgPSAoKSA9PiB7XG5cdFx0ZG9tTm9kZSAmJiBkb21Ob2RlLnBhcmVudE5vZGUgJiYgZG9tTm9kZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGRvbU5vZGUpO1xuXHRcdGN1cnJlbnQuZG9tTm9kZSA9IHVuZGVmaW5lZDtcblx0fTtcblx0aWYgKHR5cGVvZiBleGl0QW5pbWF0aW9uID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0cmV0dXJuIGV4aXRBbmltYXRpb24oZG9tTm9kZSBhcyBFbGVtZW50LCByZW1vdmVEb21Ob2RlLCBwcm9wZXJ0aWVzKTtcblx0fVxuXHR0cmFuc2l0aW9ucy5leGl0KGRvbU5vZGUgYXMgRWxlbWVudCwgcHJvcGVydGllcywgZXhpdEFuaW1hdGlvbiBhcyBzdHJpbmcsIHJlbW92ZURvbU5vZGUpO1xufVxuXG5mdW5jdGlvbiBhcnJheUZyb20oYXJyOiBhbnkpIHtcblx0cmV0dXJuIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFycik7XG59XG5cbmZ1bmN0aW9uIHdyYXBWTm9kZXMobm9kZXM6IFZOb2RlKSB7XG5cdHJldHVybiBjbGFzcyBleHRlbmRzIFdpZGdldEJhc2Uge1xuXHRcdHByb3RlY3RlZCByZW5kZXIoKSB7XG5cdFx0XHRyZXR1cm4gbm9kZXM7XG5cdFx0fVxuXHR9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyZXIocmVuZGVyZXI6ICgpID0+IFdOb2RlIHwgVk5vZGUpOiBSZW5kZXJlciB7XG5cdGxldCBfbW91bnRPcHRpb25zOiBNb3VudE9wdGlvbnMgPSB7XG5cdFx0c3luYzogZmFsc2UsXG5cdFx0bWVyZ2U6IHRydWUsXG5cdFx0dHJhbnNpdGlvbjogdHJhbnNpdGlvblN0cmF0ZWd5LFxuXHRcdGRvbU5vZGU6IGdsb2JhbC5kb2N1bWVudC5ib2R5LFxuXHRcdHJlZ2lzdHJ5OiBudWxsXG5cdH07XG5cdGxldCBfaW52YWxpZGF0aW9uUXVldWU6IEludmFsaWRhdGlvblF1ZXVlSXRlbVtdID0gW107XG5cdGxldCBfcHJvY2Vzc1F1ZXVlOiAoUHJvY2Vzc0l0ZW0gfCBEZXRhY2hBcHBsaWNhdGlvbiB8IEF0dGFjaEFwcGxpY2F0aW9uKVtdID0gW107XG5cdGxldCBfYXBwbGljYXRpb25RdWV1ZTogQXBwbGljYXRpb25JbnN0cnVjdGlvbltdID0gW107XG5cdGxldCBfZXZlbnRNYXAgPSBuZXcgV2Vha01hcDxGdW5jdGlvbiwgRXZlbnRMaXN0ZW5lcj4oKTtcblx0bGV0IF9pbnN0YW5jZVRvV3JhcHBlck1hcCA9IG5ldyBXZWFrTWFwPFdpZGdldEJhc2UsIFdOb2RlV3JhcHBlcj4oKTtcblx0bGV0IF9wYXJlbnRXcmFwcGVyTWFwID0gbmV3IFdlYWtNYXA8RE5vZGVXcmFwcGVyLCBETm9kZVdyYXBwZXI+KCk7XG5cdGxldCBfd3JhcHBlclNpYmxpbmdNYXAgPSBuZXcgV2Vha01hcDxETm9kZVdyYXBwZXIsIEROb2RlV3JhcHBlcj4oKTtcblx0bGV0IF9yZW5kZXJTY2hlZHVsZWQ6IG51bWJlciB8IHVuZGVmaW5lZDtcblx0bGV0IF9hZnRlclJlbmRlckNhbGxiYWNrczogRnVuY3Rpb25bXSA9IFtdO1xuXHRsZXQgX2RlZmVycmVkUmVuZGVyQ2FsbGJhY2tzOiBGdW5jdGlvbltdID0gW107XG5cdGxldCBwYXJlbnRJbnZhbGlkYXRlOiAoKSA9PiB2b2lkO1xuXG5cdGZ1bmN0aW9uIG5vZGVPcGVyYXRpb24oXG5cdFx0cHJvcE5hbWU6IHN0cmluZyxcblx0XHRwcm9wVmFsdWU6ICgoKSA9PiBib29sZWFuKSB8IGJvb2xlYW4sXG5cdFx0cHJldmlvdXNWYWx1ZTogYm9vbGVhbixcblx0XHRkb21Ob2RlOiBIVE1MRWxlbWVudCAmIHsgW2luZGV4OiBzdHJpbmddOiBhbnkgfVxuXHQpOiB2b2lkIHtcblx0XHRsZXQgcmVzdWx0ID0gcHJvcFZhbHVlICYmICFwcmV2aW91c1ZhbHVlO1xuXHRcdGlmICh0eXBlb2YgcHJvcFZhbHVlID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRyZXN1bHQgPSBwcm9wVmFsdWUoKTtcblx0XHR9XG5cdFx0aWYgKHJlc3VsdCA9PT0gdHJ1ZSkge1xuXHRcdFx0X2FmdGVyUmVuZGVyQ2FsbGJhY2tzLnB1c2goKCkgPT4ge1xuXHRcdFx0XHRkb21Ob2RlW3Byb3BOYW1lXSgpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gdXBkYXRlRXZlbnQoXG5cdFx0ZG9tTm9kZTogTm9kZSxcblx0XHRldmVudE5hbWU6IHN0cmluZyxcblx0XHRjdXJyZW50VmFsdWU6IEZ1bmN0aW9uLFxuXHRcdGJpbmQ6IGFueSxcblx0XHRwcmV2aW91c1ZhbHVlPzogRnVuY3Rpb25cblx0KSB7XG5cdFx0aWYgKHByZXZpb3VzVmFsdWUpIHtcblx0XHRcdGNvbnN0IHByZXZpb3VzRXZlbnQgPSBfZXZlbnRNYXAuZ2V0KHByZXZpb3VzVmFsdWUpO1xuXHRcdFx0ZG9tTm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgcHJldmlvdXNFdmVudCk7XG5cdFx0fVxuXG5cdFx0bGV0IGNhbGxiYWNrID0gY3VycmVudFZhbHVlLmJpbmQoYmluZCk7XG5cblx0XHRpZiAoZXZlbnROYW1lID09PSAnaW5wdXQnKSB7XG5cdFx0XHRjYWxsYmFjayA9IGZ1bmN0aW9uKHRoaXM6IGFueSwgZXZ0OiBFdmVudCkge1xuXHRcdFx0XHRjdXJyZW50VmFsdWUuY2FsbCh0aGlzLCBldnQpO1xuXHRcdFx0XHQoZXZ0LnRhcmdldCBhcyBhbnkpWydvbmlucHV0LXZhbHVlJ10gPSAoZXZ0LnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZTtcblx0XHRcdH0uYmluZChiaW5kKTtcblx0XHR9XG5cblx0XHRkb21Ob2RlLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBjYWxsYmFjayk7XG5cdFx0X2V2ZW50TWFwLnNldChjdXJyZW50VmFsdWUsIGNhbGxiYWNrKTtcblx0fVxuXG5cdGZ1bmN0aW9uIHJlbW92ZU9ycGhhbmVkRXZlbnRzKFxuXHRcdGRvbU5vZGU6IEVsZW1lbnQsXG5cdFx0cHJldmlvdXNQcm9wZXJ0aWVzOiBWTm9kZVByb3BlcnRpZXMsXG5cdFx0cHJvcGVydGllczogVk5vZGVQcm9wZXJ0aWVzLFxuXHRcdG9ubHlFdmVudHM6IGJvb2xlYW4gPSBmYWxzZVxuXHQpIHtcblx0XHRPYmplY3Qua2V5cyhwcmV2aW91c1Byb3BlcnRpZXMpLmZvckVhY2goKHByb3BOYW1lKSA9PiB7XG5cdFx0XHRjb25zdCBpc0V2ZW50ID0gcHJvcE5hbWUuc3Vic3RyKDAsIDIpID09PSAnb24nIHx8IG9ubHlFdmVudHM7XG5cdFx0XHRjb25zdCBldmVudE5hbWUgPSBvbmx5RXZlbnRzID8gcHJvcE5hbWUgOiBwcm9wTmFtZS5zdWJzdHIoMik7XG5cdFx0XHRpZiAoaXNFdmVudCAmJiAhcHJvcGVydGllc1twcm9wTmFtZV0pIHtcblx0XHRcdFx0Y29uc3QgZXZlbnRDYWxsYmFjayA9IF9ldmVudE1hcC5nZXQocHJldmlvdXNQcm9wZXJ0aWVzW3Byb3BOYW1lXSk7XG5cdFx0XHRcdGlmIChldmVudENhbGxiYWNrKSB7XG5cdFx0XHRcdFx0ZG9tTm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgZXZlbnRDYWxsYmFjayk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdGZ1bmN0aW9uIHJlbmRlcmVkVG9XcmFwcGVyKFxuXHRcdHJlbmRlcmVkOiBETm9kZVtdLFxuXHRcdHBhcmVudDogRE5vZGVXcmFwcGVyLFxuXHRcdGN1cnJlbnRQYXJlbnQ6IEROb2RlV3JhcHBlciB8IG51bGxcblx0KTogRE5vZGVXcmFwcGVyW10ge1xuXHRcdGNvbnN0IHdyYXBwZWRSZW5kZXJlZDogRE5vZGVXcmFwcGVyW10gPSBbXTtcblx0XHRjb25zdCBoYXNQYXJlbnRXTm9kZSA9IGlzV05vZGVXcmFwcGVyKHBhcmVudCk7XG5cdFx0Y29uc3QgY3VycmVudFBhcmVudExlbmd0aCA9IGlzVk5vZGVXcmFwcGVyKGN1cnJlbnRQYXJlbnQpICYmIChjdXJyZW50UGFyZW50LmNoaWxkcmVuV3JhcHBlcnMgfHwgW10pLmxlbmd0aCA+IDE7XG5cdFx0Y29uc3QgcmVxdWlyZXNJbnNlcnRCZWZvcmUgPVxuXHRcdFx0KChwYXJlbnQucmVxdWlyZXNJbnNlcnRCZWZvcmUgfHwgcGFyZW50Lmhhc1ByZXZpb3VzU2libGluZ3MgIT09IGZhbHNlKSAmJiBoYXNQYXJlbnRXTm9kZSkgfHxcblx0XHRcdGN1cnJlbnRQYXJlbnRMZW5ndGg7XG5cdFx0bGV0IHByZXZpb3VzSXRlbTogRE5vZGVXcmFwcGVyIHwgdW5kZWZpbmVkO1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgcmVuZGVyZWQubGVuZ3RoOyBpKyspIHtcblx0XHRcdGNvbnN0IHJlbmRlcmVkSXRlbSA9IHJlbmRlcmVkW2ldO1xuXHRcdFx0Y29uc3Qgd3JhcHBlciA9IHtcblx0XHRcdFx0bm9kZTogcmVuZGVyZWRJdGVtLFxuXHRcdFx0XHRkZXB0aDogcGFyZW50LmRlcHRoICsgMSxcblx0XHRcdFx0cmVxdWlyZXNJbnNlcnRCZWZvcmUsXG5cdFx0XHRcdGhhc1BhcmVudFdOb2RlLFxuXHRcdFx0XHRuYW1lc3BhY2U6IHBhcmVudC5uYW1lc3BhY2Vcblx0XHRcdH0gYXMgRE5vZGVXcmFwcGVyO1xuXHRcdFx0aWYgKGlzVk5vZGUocmVuZGVyZWRJdGVtKSAmJiByZW5kZXJlZEl0ZW0ucHJvcGVydGllcy5leGl0QW5pbWF0aW9uKSB7XG5cdFx0XHRcdHBhcmVudC5oYXNBbmltYXRpb25zID0gdHJ1ZTtcblx0XHRcdFx0bGV0IG5leHRQYXJlbnQgPSBfcGFyZW50V3JhcHBlck1hcC5nZXQocGFyZW50KTtcblx0XHRcdFx0d2hpbGUgKG5leHRQYXJlbnQpIHtcblx0XHRcdFx0XHRpZiAobmV4dFBhcmVudC5oYXNBbmltYXRpb25zKSB7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0bmV4dFBhcmVudC5oYXNBbmltYXRpb25zID0gdHJ1ZTtcblx0XHRcdFx0XHRuZXh0UGFyZW50ID0gX3BhcmVudFdyYXBwZXJNYXAuZ2V0KG5leHRQYXJlbnQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRfcGFyZW50V3JhcHBlck1hcC5zZXQod3JhcHBlciwgcGFyZW50KTtcblx0XHRcdGlmIChwcmV2aW91c0l0ZW0pIHtcblx0XHRcdFx0X3dyYXBwZXJTaWJsaW5nTWFwLnNldChwcmV2aW91c0l0ZW0sIHdyYXBwZXIpO1xuXHRcdFx0fVxuXHRcdFx0d3JhcHBlZFJlbmRlcmVkLnB1c2god3JhcHBlcik7XG5cdFx0XHRwcmV2aW91c0l0ZW0gPSB3cmFwcGVyO1xuXHRcdH1cblx0XHRyZXR1cm4gd3JhcHBlZFJlbmRlcmVkO1xuXHR9XG5cblx0ZnVuY3Rpb24gZmluZFBhcmVudFdOb2RlV3JhcHBlcihjdXJyZW50Tm9kZTogRE5vZGVXcmFwcGVyKTogV05vZGVXcmFwcGVyIHwgdW5kZWZpbmVkIHtcblx0XHRsZXQgcGFyZW50V05vZGVXcmFwcGVyOiBXTm9kZVdyYXBwZXIgfCB1bmRlZmluZWQ7XG5cdFx0bGV0IHBhcmVudFdyYXBwZXIgPSBfcGFyZW50V3JhcHBlck1hcC5nZXQoY3VycmVudE5vZGUpO1xuXG5cdFx0d2hpbGUgKCFwYXJlbnRXTm9kZVdyYXBwZXIgJiYgcGFyZW50V3JhcHBlcikge1xuXHRcdFx0aWYgKCFwYXJlbnRXTm9kZVdyYXBwZXIgJiYgaXNXTm9kZVdyYXBwZXIocGFyZW50V3JhcHBlcikpIHtcblx0XHRcdFx0cGFyZW50V05vZGVXcmFwcGVyID0gcGFyZW50V3JhcHBlcjtcblx0XHRcdH1cblx0XHRcdHBhcmVudFdyYXBwZXIgPSBfcGFyZW50V3JhcHBlck1hcC5nZXQocGFyZW50V3JhcHBlcik7XG5cdFx0fVxuXHRcdHJldHVybiBwYXJlbnRXTm9kZVdyYXBwZXI7XG5cdH1cblxuXHRmdW5jdGlvbiBmaW5kUGFyZW50RG9tTm9kZShjdXJyZW50Tm9kZTogRE5vZGVXcmFwcGVyKTogTm9kZSB8IHVuZGVmaW5lZCB7XG5cdFx0bGV0IHBhcmVudERvbU5vZGU6IE5vZGUgfCB1bmRlZmluZWQ7XG5cdFx0bGV0IHBhcmVudFdyYXBwZXIgPSBfcGFyZW50V3JhcHBlck1hcC5nZXQoY3VycmVudE5vZGUpO1xuXG5cdFx0d2hpbGUgKCFwYXJlbnREb21Ob2RlICYmIHBhcmVudFdyYXBwZXIpIHtcblx0XHRcdGlmICghcGFyZW50RG9tTm9kZSAmJiBpc1ZOb2RlV3JhcHBlcihwYXJlbnRXcmFwcGVyKSAmJiBwYXJlbnRXcmFwcGVyLmRvbU5vZGUpIHtcblx0XHRcdFx0cGFyZW50RG9tTm9kZSA9IHBhcmVudFdyYXBwZXIuZG9tTm9kZTtcblx0XHRcdH1cblx0XHRcdHBhcmVudFdyYXBwZXIgPSBfcGFyZW50V3JhcHBlck1hcC5nZXQocGFyZW50V3JhcHBlcik7XG5cdFx0fVxuXHRcdHJldHVybiBwYXJlbnREb21Ob2RlO1xuXHR9XG5cblx0ZnVuY3Rpb24gcnVuRGVmZXJyZWRQcm9wZXJ0aWVzKG5leHQ6IFZOb2RlV3JhcHBlcikge1xuXHRcdGlmIChuZXh0Lm5vZGUuZGVmZXJyZWRQcm9wZXJ0aWVzQ2FsbGJhY2spIHtcblx0XHRcdGNvbnN0IHByb3BlcnRpZXMgPSBuZXh0Lm5vZGUucHJvcGVydGllcztcblx0XHRcdG5leHQubm9kZS5wcm9wZXJ0aWVzID0geyAuLi5uZXh0Lm5vZGUuZGVmZXJyZWRQcm9wZXJ0aWVzQ2FsbGJhY2sodHJ1ZSksIC4uLm5leHQubm9kZS5vcmlnaW5hbFByb3BlcnRpZXMgfTtcblx0XHRcdF9hZnRlclJlbmRlckNhbGxiYWNrcy5wdXNoKCgpID0+IHtcblx0XHRcdFx0cHJvY2Vzc1Byb3BlcnRpZXMobmV4dCwgeyBwcm9wZXJ0aWVzIH0pO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gZmluZEluc2VydEJlZm9yZShuZXh0OiBETm9kZVdyYXBwZXIpIHtcblx0XHRsZXQgaW5zZXJ0QmVmb3JlOiBOb2RlIHwgbnVsbCA9IG51bGw7XG5cdFx0bGV0IHNlYXJjaE5vZGU6IEROb2RlV3JhcHBlciB8IHVuZGVmaW5lZCA9IG5leHQ7XG5cdFx0d2hpbGUgKCFpbnNlcnRCZWZvcmUpIHtcblx0XHRcdGNvbnN0IG5leHRTaWJsaW5nID0gX3dyYXBwZXJTaWJsaW5nTWFwLmdldChzZWFyY2hOb2RlKTtcblx0XHRcdGlmIChuZXh0U2libGluZykge1xuXHRcdFx0XHRpZiAoaXNWTm9kZVdyYXBwZXIobmV4dFNpYmxpbmcpKSB7XG5cdFx0XHRcdFx0aWYgKG5leHRTaWJsaW5nLmRvbU5vZGUgJiYgbmV4dFNpYmxpbmcuZG9tTm9kZS5wYXJlbnROb2RlKSB7XG5cdFx0XHRcdFx0XHRpbnNlcnRCZWZvcmUgPSBuZXh0U2libGluZy5kb21Ob2RlO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHNlYXJjaE5vZGUgPSBuZXh0U2libGluZztcblx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAobmV4dFNpYmxpbmcuZG9tTm9kZSAmJiBuZXh0U2libGluZy5kb21Ob2RlLnBhcmVudE5vZGUpIHtcblx0XHRcdFx0XHRpbnNlcnRCZWZvcmUgPSBuZXh0U2libGluZy5kb21Ob2RlO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHNlYXJjaE5vZGUgPSBuZXh0U2libGluZztcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cdFx0XHRzZWFyY2hOb2RlID0gX3BhcmVudFdyYXBwZXJNYXAuZ2V0KHNlYXJjaE5vZGUpO1xuXHRcdFx0aWYgKCFzZWFyY2hOb2RlIHx8IGlzVk5vZGVXcmFwcGVyKHNlYXJjaE5vZGUpKSB7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gaW5zZXJ0QmVmb3JlO1xuXHR9XG5cblx0ZnVuY3Rpb24gc2V0UHJvcGVydGllcyhcblx0XHRkb21Ob2RlOiBIVE1MRWxlbWVudCxcblx0XHRjdXJyZW50UHJvcGVydGllczogVk5vZGVQcm9wZXJ0aWVzID0ge30sXG5cdFx0bmV4dFdyYXBwZXI6IFZOb2RlV3JhcHBlcixcblx0XHRpbmNsdWRlc0V2ZW50c0FuZEF0dHJpYnV0ZXMgPSB0cnVlXG5cdCk6IHZvaWQge1xuXHRcdGNvbnN0IHByb3BOYW1lcyA9IE9iamVjdC5rZXlzKG5leHRXcmFwcGVyLm5vZGUucHJvcGVydGllcyk7XG5cdFx0Y29uc3QgcHJvcENvdW50ID0gcHJvcE5hbWVzLmxlbmd0aDtcblx0XHRpZiAocHJvcE5hbWVzLmluZGV4T2YoJ2NsYXNzZXMnKSA9PT0gLTEgJiYgY3VycmVudFByb3BlcnRpZXMuY2xhc3Nlcykge1xuXHRcdFx0ZG9tTm9kZS5yZW1vdmVBdHRyaWJ1dGUoJ2NsYXNzJyk7XG5cdFx0fVxuXG5cdFx0aW5jbHVkZXNFdmVudHNBbmRBdHRyaWJ1dGVzICYmIHJlbW92ZU9ycGhhbmVkRXZlbnRzKGRvbU5vZGUsIGN1cnJlbnRQcm9wZXJ0aWVzLCBuZXh0V3JhcHBlci5ub2RlLnByb3BlcnRpZXMpO1xuXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBwcm9wQ291bnQ7IGkrKykge1xuXHRcdFx0Y29uc3QgcHJvcE5hbWUgPSBwcm9wTmFtZXNbaV07XG5cdFx0XHRsZXQgcHJvcFZhbHVlID0gbmV4dFdyYXBwZXIubm9kZS5wcm9wZXJ0aWVzW3Byb3BOYW1lXTtcblx0XHRcdGNvbnN0IHByZXZpb3VzVmFsdWUgPSBjdXJyZW50UHJvcGVydGllc1twcm9wTmFtZV07XG5cdFx0XHRpZiAocHJvcE5hbWUgPT09ICdjbGFzc2VzJykge1xuXHRcdFx0XHRjb25zdCBwcmV2aW91c0NsYXNzU3RyaW5nID0gY3JlYXRlQ2xhc3NQcm9wVmFsdWUocHJldmlvdXNWYWx1ZSk7XG5cdFx0XHRcdGxldCBjdXJyZW50Q2xhc3NTdHJpbmcgPSBjcmVhdGVDbGFzc1Byb3BWYWx1ZShwcm9wVmFsdWUpO1xuXHRcdFx0XHRpZiAocHJldmlvdXNDbGFzc1N0cmluZyAhPT0gY3VycmVudENsYXNzU3RyaW5nKSB7XG5cdFx0XHRcdFx0aWYgKGN1cnJlbnRDbGFzc1N0cmluZykge1xuXHRcdFx0XHRcdFx0aWYgKG5leHRXcmFwcGVyLm1lcmdlZCkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBkb21DbGFzc2VzID0gKGRvbU5vZGUuZ2V0QXR0cmlidXRlKCdjbGFzcycpIHx8ICcnKS5zcGxpdCgnICcpO1xuXHRcdFx0XHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGRvbUNsYXNzZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdFx0XHRpZiAoY3VycmVudENsYXNzU3RyaW5nLmluZGV4T2YoZG9tQ2xhc3Nlc1tpXSkgPT09IC0xKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRjdXJyZW50Q2xhc3NTdHJpbmcgPSBgJHtkb21DbGFzc2VzW2ldfSAke2N1cnJlbnRDbGFzc1N0cmluZ31gO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZG9tTm9kZS5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgY3VycmVudENsYXNzU3RyaW5nKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0ZG9tTm9kZS5yZW1vdmVBdHRyaWJ1dGUoJ2NsYXNzJyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKG5vZGVPcGVyYXRpb25zLmluZGV4T2YocHJvcE5hbWUpICE9PSAtMSkge1xuXHRcdFx0XHRub2RlT3BlcmF0aW9uKHByb3BOYW1lLCBwcm9wVmFsdWUsIHByZXZpb3VzVmFsdWUsIGRvbU5vZGUpO1xuXHRcdFx0fSBlbHNlIGlmIChwcm9wTmFtZSA9PT0gJ3N0eWxlcycpIHtcblx0XHRcdFx0Y29uc3Qgc3R5bGVOYW1lcyA9IE9iamVjdC5rZXlzKHByb3BWYWx1ZSk7XG5cdFx0XHRcdGNvbnN0IHN0eWxlQ291bnQgPSBzdHlsZU5hbWVzLmxlbmd0aDtcblx0XHRcdFx0Zm9yIChsZXQgaiA9IDA7IGogPCBzdHlsZUNvdW50OyBqKyspIHtcblx0XHRcdFx0XHRjb25zdCBzdHlsZU5hbWUgPSBzdHlsZU5hbWVzW2pdO1xuXHRcdFx0XHRcdGNvbnN0IG5ld1N0eWxlVmFsdWUgPSBwcm9wVmFsdWVbc3R5bGVOYW1lXTtcblx0XHRcdFx0XHRjb25zdCBvbGRTdHlsZVZhbHVlID0gcHJldmlvdXNWYWx1ZSAmJiBwcmV2aW91c1ZhbHVlW3N0eWxlTmFtZV07XG5cdFx0XHRcdFx0aWYgKG5ld1N0eWxlVmFsdWUgPT09IG9sZFN0eWxlVmFsdWUpIHtcblx0XHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQoZG9tTm9kZS5zdHlsZSBhcyBhbnkpW3N0eWxlTmFtZV0gPSBuZXdTdHlsZVZhbHVlIHx8ICcnO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpZiAoIXByb3BWYWx1ZSAmJiB0eXBlb2YgcHJldmlvdXNWYWx1ZSA9PT0gJ3N0cmluZycpIHtcblx0XHRcdFx0XHRwcm9wVmFsdWUgPSAnJztcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAocHJvcE5hbWUgPT09ICd2YWx1ZScpIHtcblx0XHRcdFx0XHRjb25zdCBkb21WYWx1ZSA9IChkb21Ob2RlIGFzIGFueSlbcHJvcE5hbWVdO1xuXHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdGRvbVZhbHVlICE9PSBwcm9wVmFsdWUgJiZcblx0XHRcdFx0XHRcdCgoZG9tTm9kZSBhcyBhbnkpWydvbmlucHV0LXZhbHVlJ11cblx0XHRcdFx0XHRcdFx0PyBkb21WYWx1ZSA9PT0gKGRvbU5vZGUgYXMgYW55KVsnb25pbnB1dC12YWx1ZSddXG5cdFx0XHRcdFx0XHRcdDogcHJvcFZhbHVlICE9PSBwcmV2aW91c1ZhbHVlKVxuXHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0KGRvbU5vZGUgYXMgYW55KVtwcm9wTmFtZV0gPSBwcm9wVmFsdWU7XG5cdFx0XHRcdFx0XHQoZG9tTm9kZSBhcyBhbnkpWydvbmlucHV0LXZhbHVlJ10gPSB1bmRlZmluZWQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2UgaWYgKHByb3BOYW1lICE9PSAna2V5JyAmJiBwcm9wVmFsdWUgIT09IHByZXZpb3VzVmFsdWUpIHtcblx0XHRcdFx0XHRjb25zdCB0eXBlID0gdHlwZW9mIHByb3BWYWx1ZTtcblx0XHRcdFx0XHRpZiAodHlwZSA9PT0gJ2Z1bmN0aW9uJyAmJiBwcm9wTmFtZS5sYXN0SW5kZXhPZignb24nLCAwKSA9PT0gMCAmJiBpbmNsdWRlc0V2ZW50c0FuZEF0dHJpYnV0ZXMpIHtcblx0XHRcdFx0XHRcdHVwZGF0ZUV2ZW50KGRvbU5vZGUsIHByb3BOYW1lLnN1YnN0cigyKSwgcHJvcFZhbHVlLCBuZXh0V3JhcHBlci5ub2RlLmJpbmQsIHByZXZpb3VzVmFsdWUpO1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAodHlwZSA9PT0gJ3N0cmluZycgJiYgcHJvcE5hbWUgIT09ICdpbm5lckhUTUwnICYmIGluY2x1ZGVzRXZlbnRzQW5kQXR0cmlidXRlcykge1xuXHRcdFx0XHRcdFx0dXBkYXRlQXR0cmlidXRlKGRvbU5vZGUsIHByb3BOYW1lLCBwcm9wVmFsdWUsIG5leHRXcmFwcGVyLm5hbWVzcGFjZSk7XG5cdFx0XHRcdFx0fSBlbHNlIGlmIChwcm9wTmFtZSA9PT0gJ3Njcm9sbExlZnQnIHx8IHByb3BOYW1lID09PSAnc2Nyb2xsVG9wJykge1xuXHRcdFx0XHRcdFx0aWYgKChkb21Ob2RlIGFzIGFueSlbcHJvcE5hbWVdICE9PSBwcm9wVmFsdWUpIHtcblx0XHRcdFx0XHRcdFx0KGRvbU5vZGUgYXMgYW55KVtwcm9wTmFtZV0gPSBwcm9wVmFsdWU7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdChkb21Ob2RlIGFzIGFueSlbcHJvcE5hbWVdID0gcHJvcFZhbHVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIHJ1bkRlZmVycmVkUmVuZGVyQ2FsbGJhY2tzKCkge1xuXHRcdGNvbnN0IHsgc3luYyB9ID0gX21vdW50T3B0aW9ucztcblx0XHRjb25zdCBjYWxsYmFja3MgPSBfZGVmZXJyZWRSZW5kZXJDYWxsYmFja3M7XG5cdFx0X2RlZmVycmVkUmVuZGVyQ2FsbGJhY2tzID0gW107XG5cdFx0aWYgKGNhbGxiYWNrcy5sZW5ndGgpIHtcblx0XHRcdGNvbnN0IHJ1biA9ICgpID0+IHtcblx0XHRcdFx0bGV0IGNhbGxiYWNrOiBGdW5jdGlvbiB8IHVuZGVmaW5lZDtcblx0XHRcdFx0d2hpbGUgKChjYWxsYmFjayA9IGNhbGxiYWNrcy5zaGlmdCgpKSkge1xuXHRcdFx0XHRcdGNhbGxiYWNrKCk7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0XHRpZiAoc3luYykge1xuXHRcdFx0XHRydW4oKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGdsb2JhbC5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUocnVuKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiBydW5BZnRlclJlbmRlckNhbGxiYWNrcygpIHtcblx0XHRjb25zdCB7IHN5bmMgfSA9IF9tb3VudE9wdGlvbnM7XG5cdFx0Y29uc3QgY2FsbGJhY2tzID0gX2FmdGVyUmVuZGVyQ2FsbGJhY2tzO1xuXHRcdF9hZnRlclJlbmRlckNhbGxiYWNrcyA9IFtdO1xuXHRcdGlmIChjYWxsYmFja3MubGVuZ3RoKSB7XG5cdFx0XHRjb25zdCBydW4gPSAoKSA9PiB7XG5cdFx0XHRcdGxldCBjYWxsYmFjazogRnVuY3Rpb24gfCB1bmRlZmluZWQ7XG5cdFx0XHRcdHdoaWxlICgoY2FsbGJhY2sgPSBjYWxsYmFja3Muc2hpZnQoKSkpIHtcblx0XHRcdFx0XHRjYWxsYmFjaygpO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdFx0aWYgKHN5bmMpIHtcblx0XHRcdFx0cnVuKCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpZiAoZ2xvYmFsLnJlcXVlc3RJZGxlQ2FsbGJhY2spIHtcblx0XHRcdFx0XHRnbG9iYWwucmVxdWVzdElkbGVDYWxsYmFjayhydW4pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHNldFRpbWVvdXQocnVuKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIHByb2Nlc3NQcm9wZXJ0aWVzKG5leHQ6IFZOb2RlV3JhcHBlciwgcHJldmlvdXNQcm9wZXJ0aWVzOiBQcmV2aW91c1Byb3BlcnRpZXMpIHtcblx0XHRpZiAobmV4dC5ub2RlLmF0dHJpYnV0ZXMgJiYgbmV4dC5ub2RlLmV2ZW50cykge1xuXHRcdFx0dXBkYXRlQXR0cmlidXRlcyhcblx0XHRcdFx0bmV4dC5kb21Ob2RlIGFzIEhUTUxFbGVtZW50LFxuXHRcdFx0XHRwcmV2aW91c1Byb3BlcnRpZXMuYXR0cmlidXRlcyB8fCB7fSxcblx0XHRcdFx0bmV4dC5ub2RlLmF0dHJpYnV0ZXMsXG5cdFx0XHRcdG5leHQubmFtZXNwYWNlXG5cdFx0XHQpO1xuXHRcdFx0c2V0UHJvcGVydGllcyhuZXh0LmRvbU5vZGUgYXMgSFRNTEVsZW1lbnQsIHByZXZpb3VzUHJvcGVydGllcy5wcm9wZXJ0aWVzLCBuZXh0LCBmYWxzZSk7XG5cdFx0XHRjb25zdCBldmVudHMgPSBuZXh0Lm5vZGUuZXZlbnRzIHx8IHt9O1xuXHRcdFx0aWYgKHByZXZpb3VzUHJvcGVydGllcy5ldmVudHMpIHtcblx0XHRcdFx0cmVtb3ZlT3JwaGFuZWRFdmVudHMoXG5cdFx0XHRcdFx0bmV4dC5kb21Ob2RlIGFzIEhUTUxFbGVtZW50LFxuXHRcdFx0XHRcdHByZXZpb3VzUHJvcGVydGllcy5ldmVudHMgfHwge30sXG5cdFx0XHRcdFx0bmV4dC5ub2RlLmV2ZW50cyxcblx0XHRcdFx0XHR0cnVlXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0XHRwcmV2aW91c1Byb3BlcnRpZXMuZXZlbnRzID0gcHJldmlvdXNQcm9wZXJ0aWVzLmV2ZW50cyB8fCB7fTtcblx0XHRcdE9iamVjdC5rZXlzKGV2ZW50cykuZm9yRWFjaCgoZXZlbnQpID0+IHtcblx0XHRcdFx0dXBkYXRlRXZlbnQoXG5cdFx0XHRcdFx0bmV4dC5kb21Ob2RlIGFzIEhUTUxFbGVtZW50LFxuXHRcdFx0XHRcdGV2ZW50LFxuXHRcdFx0XHRcdGV2ZW50c1tldmVudF0sXG5cdFx0XHRcdFx0bmV4dC5ub2RlLmJpbmQsXG5cdFx0XHRcdFx0cHJldmlvdXNQcm9wZXJ0aWVzLmV2ZW50c1tldmVudF1cblx0XHRcdFx0KTtcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzZXRQcm9wZXJ0aWVzKG5leHQuZG9tTm9kZSBhcyBIVE1MRWxlbWVudCwgcHJldmlvdXNQcm9wZXJ0aWVzLnByb3BlcnRpZXMsIG5leHQpO1xuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIG1vdW50KG1vdW50T3B0aW9uczogUGFydGlhbDxNb3VudE9wdGlvbnM+ID0ge30pIHtcblx0XHRfbW91bnRPcHRpb25zID0geyAuLi5fbW91bnRPcHRpb25zLCAuLi5tb3VudE9wdGlvbnMgfTtcblx0XHRjb25zdCB7IGRvbU5vZGUgfSA9IF9tb3VudE9wdGlvbnM7XG5cdFx0bGV0IHJlbmRlclJlc3VsdCA9IHJlbmRlcmVyKCk7XG5cdFx0aWYgKGlzVk5vZGUocmVuZGVyUmVzdWx0KSkge1xuXHRcdFx0cmVuZGVyUmVzdWx0ID0gdyh3cmFwVk5vZGVzKHJlbmRlclJlc3VsdCksIHt9KTtcblx0XHR9XG5cdFx0Y29uc3QgbmV4dFdyYXBwZXIgPSB7XG5cdFx0XHRub2RlOiByZW5kZXJSZXN1bHQsXG5cdFx0XHRkZXB0aDogMVxuXHRcdH07XG5cdFx0X3BhcmVudFdyYXBwZXJNYXAuc2V0KG5leHRXcmFwcGVyLCB7IGRlcHRoOiAwLCBkb21Ob2RlLCBub2RlOiB2KCdmYWtlJykgfSk7XG5cdFx0X3Byb2Nlc3NRdWV1ZS5wdXNoKHtcblx0XHRcdGN1cnJlbnQ6IFtdLFxuXHRcdFx0bmV4dDogW25leHRXcmFwcGVyXSxcblx0XHRcdG1ldGE6IHsgbWVyZ2VOb2RlczogYXJyYXlGcm9tKGRvbU5vZGUuY2hpbGROb2RlcykgfVxuXHRcdH0pO1xuXHRcdF9ydW5Qcm9jZXNzUXVldWUoKTtcblx0XHRfbW91bnRPcHRpb25zLm1lcmdlID0gZmFsc2U7XG5cdFx0X3J1bkRvbUluc3RydWN0aW9uUXVldWUoKTtcblx0XHRfcnVuQ2FsbGJhY2tzKCk7XG5cdH1cblxuXHRmdW5jdGlvbiBpbnZhbGlkYXRlKCkge1xuXHRcdHBhcmVudEludmFsaWRhdGUgJiYgcGFyZW50SW52YWxpZGF0ZSgpO1xuXHR9XG5cblx0ZnVuY3Rpb24gX3NjaGVkdWxlKCk6IHZvaWQge1xuXHRcdGNvbnN0IHsgc3luYyB9ID0gX21vdW50T3B0aW9ucztcblx0XHRpZiAoc3luYykge1xuXHRcdFx0X3J1bkludmFsaWRhdGlvblF1ZXVlKCk7XG5cdFx0fSBlbHNlIGlmICghX3JlbmRlclNjaGVkdWxlZCkge1xuXHRcdFx0X3JlbmRlclNjaGVkdWxlZCA9IGdsb2JhbC5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuXHRcdFx0XHRfcnVuSW52YWxpZGF0aW9uUXVldWUoKTtcblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIF9ydW5JbnZhbGlkYXRpb25RdWV1ZSgpIHtcblx0XHRfcmVuZGVyU2NoZWR1bGVkID0gdW5kZWZpbmVkO1xuXHRcdGNvbnN0IGludmFsaWRhdGlvblF1ZXVlID0gWy4uLl9pbnZhbGlkYXRpb25RdWV1ZV07XG5cdFx0Y29uc3QgcHJldmlvdXNseVJlbmRlcmVkID0gW107XG5cdFx0X2ludmFsaWRhdGlvblF1ZXVlID0gW107XG5cdFx0aW52YWxpZGF0aW9uUXVldWUuc29ydCgoYSwgYikgPT4gYi5kZXB0aCAtIGEuZGVwdGgpO1xuXHRcdGxldCBpdGVtOiBJbnZhbGlkYXRpb25RdWV1ZUl0ZW0gfCB1bmRlZmluZWQ7XG5cdFx0d2hpbGUgKChpdGVtID0gaW52YWxpZGF0aW9uUXVldWUucG9wKCkpKSB7XG5cdFx0XHRsZXQgeyBpbnN0YW5jZSB9ID0gaXRlbTtcblx0XHRcdGlmIChwcmV2aW91c2x5UmVuZGVyZWQuaW5kZXhPZihpbnN0YW5jZSkgPT09IC0xICYmIF9pbnN0YW5jZVRvV3JhcHBlck1hcC5oYXMoaW5zdGFuY2UhKSkge1xuXHRcdFx0XHRwcmV2aW91c2x5UmVuZGVyZWQucHVzaChpbnN0YW5jZSk7XG5cdFx0XHRcdGNvbnN0IGN1cnJlbnQgPSBfaW5zdGFuY2VUb1dyYXBwZXJNYXAuZ2V0KGluc3RhbmNlKSE7XG5cdFx0XHRcdGNvbnN0IGluc3RhbmNlRGF0YSA9IHdpZGdldEluc3RhbmNlTWFwLmdldChpbnN0YW5jZSkhO1xuXHRcdFx0XHRjb25zdCBwYXJlbnQgPSBfcGFyZW50V3JhcHBlck1hcC5nZXQoY3VycmVudCk7XG5cdFx0XHRcdGNvbnN0IHNpYmxpbmcgPSBfd3JhcHBlclNpYmxpbmdNYXAuZ2V0KGN1cnJlbnQpO1xuXHRcdFx0XHRjb25zdCB7IGNvbnN0cnVjdG9yLCBjaGlsZHJlbiB9ID0gaW5zdGFuY2U7XG5cdFx0XHRcdGNvbnN0IG5leHQgPSB7XG5cdFx0XHRcdFx0bm9kZToge1xuXHRcdFx0XHRcdFx0dHlwZTogV05PREUsXG5cdFx0XHRcdFx0XHR3aWRnZXRDb25zdHJ1Y3RvcjogY29uc3RydWN0b3IgYXMgV2lkZ2V0QmFzZUNvbnN0cnVjdG9yLFxuXHRcdFx0XHRcdFx0cHJvcGVydGllczogaW5zdGFuY2VEYXRhLmlucHV0UHJvcGVydGllcyxcblx0XHRcdFx0XHRcdGNoaWxkcmVuOiBjaGlsZHJlbixcblx0XHRcdFx0XHRcdGJpbmQ6IGN1cnJlbnQubm9kZS5iaW5kXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRpbnN0YW5jZSxcblx0XHRcdFx0XHRkZXB0aDogY3VycmVudC5kZXB0aFxuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdHBhcmVudCAmJiBfcGFyZW50V3JhcHBlck1hcC5zZXQobmV4dCwgcGFyZW50KTtcblx0XHRcdFx0c2libGluZyAmJiBfd3JhcHBlclNpYmxpbmdNYXAuc2V0KG5leHQsIHNpYmxpbmcpO1xuXHRcdFx0XHRjb25zdCB7IGl0ZW0gfSA9IF91cGRhdGVXaWRnZXQoeyBjdXJyZW50LCBuZXh0IH0pO1xuXHRcdFx0XHRpZiAoaXRlbSkge1xuXHRcdFx0XHRcdF9wcm9jZXNzUXVldWUucHVzaChpdGVtKTtcblx0XHRcdFx0XHRpbnN0YW5jZSAmJiBfaW5zdGFuY2VUb1dyYXBwZXJNYXAuc2V0KGluc3RhbmNlLCBuZXh0KTtcblx0XHRcdFx0XHRfcnVuUHJvY2Vzc1F1ZXVlKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0X3J1bkRvbUluc3RydWN0aW9uUXVldWUoKTtcblx0XHRfcnVuQ2FsbGJhY2tzKCk7XG5cdH1cblxuXHRmdW5jdGlvbiBfcnVuUHJvY2Vzc1F1ZXVlKCkge1xuXHRcdGxldCBpdGVtOiBEZXRhY2hBcHBsaWNhdGlvbiB8IEF0dGFjaEFwcGxpY2F0aW9uIHwgUHJvY2Vzc0l0ZW0gfCB1bmRlZmluZWQ7XG5cdFx0d2hpbGUgKChpdGVtID0gX3Byb2Nlc3NRdWV1ZS5wb3AoKSkpIHtcblx0XHRcdGlmIChpc0F0dGFjaEFwcGxpY2F0aW9uKGl0ZW0pKSB7XG5cdFx0XHRcdF9hcHBsaWNhdGlvblF1ZXVlLnB1c2goaXRlbSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCB7IGN1cnJlbnQsIG5leHQsIG1ldGEgfSA9IGl0ZW07XG5cdFx0XHRcdF9wcm9jZXNzKGN1cnJlbnQgfHwgRU1QVFlfQVJSQVksIG5leHQgfHwgRU1QVFlfQVJSQVksIG1ldGEpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIF9ydW5Eb21JbnN0cnVjdGlvblF1ZXVlKCk6IHZvaWQge1xuXHRcdF9hcHBsaWNhdGlvblF1ZXVlLnJldmVyc2UoKTtcblx0XHRsZXQgaXRlbTogQXBwbGljYXRpb25JbnN0cnVjdGlvbiB8IHVuZGVmaW5lZDtcblx0XHR3aGlsZSAoKGl0ZW0gPSBfYXBwbGljYXRpb25RdWV1ZS5wb3AoKSkpIHtcblx0XHRcdGlmIChpdGVtLnR5cGUgPT09ICdjcmVhdGUnKSB7XG5cdFx0XHRcdGNvbnN0IHtcblx0XHRcdFx0XHRwYXJlbnREb21Ob2RlLFxuXHRcdFx0XHRcdG5leHQsXG5cdFx0XHRcdFx0bmV4dDoge1xuXHRcdFx0XHRcdFx0ZG9tTm9kZSxcblx0XHRcdFx0XHRcdG1lcmdlZCxcblx0XHRcdFx0XHRcdHJlcXVpcmVzSW5zZXJ0QmVmb3JlLFxuXHRcdFx0XHRcdFx0bm9kZTogeyBwcm9wZXJ0aWVzIH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gPSBpdGVtO1xuXG5cdFx0XHRcdHByb2Nlc3NQcm9wZXJ0aWVzKG5leHQsIHsgcHJvcGVydGllczoge30gfSk7XG5cdFx0XHRcdHJ1bkRlZmVycmVkUHJvcGVydGllcyhuZXh0KTtcblx0XHRcdFx0aWYgKCFtZXJnZWQpIHtcblx0XHRcdFx0XHRsZXQgaW5zZXJ0QmVmb3JlOiBhbnk7XG5cdFx0XHRcdFx0aWYgKHJlcXVpcmVzSW5zZXJ0QmVmb3JlKSB7XG5cdFx0XHRcdFx0XHRpbnNlcnRCZWZvcmUgPSBmaW5kSW5zZXJ0QmVmb3JlKG5leHQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRwYXJlbnREb21Ob2RlLmluc2VydEJlZm9yZShkb21Ob2RlISwgaW5zZXJ0QmVmb3JlKTtcblx0XHRcdFx0XHRpZiAoaXNEb21WTm9kZShuZXh0Lm5vZGUpICYmIG5leHQubm9kZS5vbkF0dGFjaCkge1xuXHRcdFx0XHRcdFx0bmV4dC5ub2RlLm9uQXR0YWNoKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdHJ1bkVudGVyQW5pbWF0aW9uKG5leHQsIF9tb3VudE9wdGlvbnMudHJhbnNpdGlvbik7XG5cdFx0XHRcdGNvbnN0IGluc3RhbmNlRGF0YSA9IHdpZGdldEluc3RhbmNlTWFwLmdldChuZXh0Lm5vZGUuYmluZCBhcyBXaWRnZXRCYXNlKTtcblx0XHRcdFx0aWYgKHByb3BlcnRpZXMua2V5ICE9IG51bGwgJiYgaW5zdGFuY2VEYXRhKSB7XG5cdFx0XHRcdFx0aW5zdGFuY2VEYXRhLm5vZGVIYW5kbGVyLmFkZChkb21Ob2RlIGFzIEhUTUxFbGVtZW50LCBgJHtwcm9wZXJ0aWVzLmtleX1gKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpdGVtLm5leHQuaW5zZXJ0ZWQgPSB0cnVlO1xuXHRcdFx0fSBlbHNlIGlmIChpdGVtLnR5cGUgPT09ICd1cGRhdGUnKSB7XG5cdFx0XHRcdGNvbnN0IHtcblx0XHRcdFx0XHRuZXh0LFxuXHRcdFx0XHRcdG5leHQ6IHsgZG9tTm9kZSwgbm9kZSB9LFxuXHRcdFx0XHRcdGN1cnJlbnRcblx0XHRcdFx0fSA9IGl0ZW07XG5cdFx0XHRcdGNvbnN0IHBhcmVudCA9IF9wYXJlbnRXcmFwcGVyTWFwLmdldChuZXh0KTtcblx0XHRcdFx0aWYgKHBhcmVudCAmJiBpc1dOb2RlV3JhcHBlcihwYXJlbnQpICYmIHBhcmVudC5pbnN0YW5jZSkge1xuXHRcdFx0XHRcdGNvbnN0IGluc3RhbmNlRGF0YSA9IHdpZGdldEluc3RhbmNlTWFwLmdldChwYXJlbnQuaW5zdGFuY2UpO1xuXHRcdFx0XHRcdGluc3RhbmNlRGF0YSAmJiBpbnN0YW5jZURhdGEubm9kZUhhbmRsZXIuYWRkUm9vdCgpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y29uc3QgcHJldmlvdXNQcm9wZXJ0aWVzID0gYnVpbGRQcmV2aW91c1Byb3BlcnRpZXMoZG9tTm9kZSwgY3VycmVudCwgbmV4dCk7XG5cdFx0XHRcdGNvbnN0IGluc3RhbmNlRGF0YSA9IHdpZGdldEluc3RhbmNlTWFwLmdldChuZXh0Lm5vZGUuYmluZCBhcyBXaWRnZXRCYXNlKTtcblxuXHRcdFx0XHRwcm9jZXNzUHJvcGVydGllcyhuZXh0LCBwcmV2aW91c1Byb3BlcnRpZXMpO1xuXHRcdFx0XHRydW5EZWZlcnJlZFByb3BlcnRpZXMobmV4dCk7XG5cblx0XHRcdFx0aWYgKGluc3RhbmNlRGF0YSAmJiBub2RlLnByb3BlcnRpZXMua2V5ICE9IG51bGwpIHtcblx0XHRcdFx0XHRpbnN0YW5jZURhdGEubm9kZUhhbmRsZXIuYWRkKG5leHQuZG9tTm9kZSBhcyBIVE1MRWxlbWVudCwgYCR7bm9kZS5wcm9wZXJ0aWVzLmtleX1gKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmIChpdGVtLnR5cGUgPT09ICdkZWxldGUnKSB7XG5cdFx0XHRcdGNvbnN0IHsgY3VycmVudCB9ID0gaXRlbTtcblx0XHRcdFx0aWYgKGN1cnJlbnQubm9kZS5wcm9wZXJ0aWVzLmV4aXRBbmltYXRpb24pIHtcblx0XHRcdFx0XHRydW5FeGl0QW5pbWF0aW9uKGN1cnJlbnQsIF9tb3VudE9wdGlvbnMudHJhbnNpdGlvbik7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y3VycmVudC5kb21Ob2RlIS5wYXJlbnROb2RlIS5yZW1vdmVDaGlsZChjdXJyZW50LmRvbU5vZGUhKTtcblx0XHRcdFx0XHRjdXJyZW50LmRvbU5vZGUgPSB1bmRlZmluZWQ7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAoaXRlbS50eXBlID09PSAnYXR0YWNoJykge1xuXHRcdFx0XHRjb25zdCB7IGluc3RhbmNlLCBhdHRhY2hlZCB9ID0gaXRlbTtcblx0XHRcdFx0Y29uc3QgaW5zdGFuY2VEYXRhID0gd2lkZ2V0SW5zdGFuY2VNYXAuZ2V0KGluc3RhbmNlKSE7XG5cdFx0XHRcdGluc3RhbmNlRGF0YS5ub2RlSGFuZGxlci5hZGRSb290KCk7XG5cdFx0XHRcdGF0dGFjaGVkICYmIGluc3RhbmNlRGF0YS5vbkF0dGFjaCgpO1xuXHRcdFx0fSBlbHNlIGlmIChpdGVtLnR5cGUgPT09ICdkZXRhY2gnKSB7XG5cdFx0XHRcdGlmIChpdGVtLmN1cnJlbnQuaW5zdGFuY2UpIHtcblx0XHRcdFx0XHRjb25zdCBpbnN0YW5jZURhdGEgPSB3aWRnZXRJbnN0YW5jZU1hcC5nZXQoaXRlbS5jdXJyZW50Lmluc3RhbmNlKTtcblx0XHRcdFx0XHRpbnN0YW5jZURhdGEgJiYgaW5zdGFuY2VEYXRhLm9uRGV0YWNoKCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aXRlbS5jdXJyZW50LmRvbU5vZGUgPSB1bmRlZmluZWQ7XG5cdFx0XHRcdGl0ZW0uY3VycmVudC5ub2RlLmJpbmQgPSB1bmRlZmluZWQ7XG5cdFx0XHRcdGl0ZW0uY3VycmVudC5pbnN0YW5jZSA9IHVuZGVmaW5lZDtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiBfcnVuQ2FsbGJhY2tzKCkge1xuXHRcdHJ1bkFmdGVyUmVuZGVyQ2FsbGJhY2tzKCk7XG5cdFx0cnVuRGVmZXJyZWRSZW5kZXJDYWxsYmFja3MoKTtcblx0fVxuXG5cdGZ1bmN0aW9uIF9wcm9jZXNzTWVyZ2VOb2RlcyhuZXh0OiBETm9kZVdyYXBwZXIsIG1lcmdlTm9kZXM6IE5vZGVbXSkge1xuXHRcdGNvbnN0IHsgbWVyZ2UgfSA9IF9tb3VudE9wdGlvbnM7XG5cdFx0aWYgKG1lcmdlICYmIG1lcmdlTm9kZXMubGVuZ3RoKSB7XG5cdFx0XHRpZiAoaXNWTm9kZVdyYXBwZXIobmV4dCkpIHtcblx0XHRcdFx0bGV0IHtcblx0XHRcdFx0XHRub2RlOiB7IHRhZyB9XG5cdFx0XHRcdH0gPSBuZXh0O1xuXHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IG1lcmdlTm9kZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRjb25zdCBkb21FbGVtZW50ID0gbWVyZ2VOb2Rlc1tpXSBhcyBFbGVtZW50O1xuXHRcdFx0XHRcdGlmICh0YWcudG9VcHBlckNhc2UoKSA9PT0gKGRvbUVsZW1lbnQudGFnTmFtZSB8fCAnJykpIHtcblx0XHRcdFx0XHRcdG1lcmdlTm9kZXMuc3BsaWNlKGksIDEpO1xuXHRcdFx0XHRcdFx0bmV4dC5kb21Ob2RlID0gZG9tRWxlbWVudDtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0bmV4dC5tZXJnZU5vZGVzID0gbWVyZ2VOb2Rlcztcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiByZWdpc3RlckRpc3Rpbmd1aXNoYWJsZUNhbGxiYWNrKGNoaWxkTm9kZXM6IEROb2RlV3JhcHBlcltdLCBpbmRleDogbnVtYmVyKSB7XG5cdFx0X2FmdGVyUmVuZGVyQ2FsbGJhY2tzLnB1c2goKCkgPT4ge1xuXHRcdFx0Y29uc3QgcGFyZW50V05vZGVXcmFwcGVyID0gZmluZFBhcmVudFdOb2RlV3JhcHBlcihjaGlsZE5vZGVzW2luZGV4XSk7XG5cdFx0XHRjaGVja0Rpc3Rpbmd1aXNoYWJsZShjaGlsZE5vZGVzLCBpbmRleCwgcGFyZW50V05vZGVXcmFwcGVyKTtcblx0XHR9KTtcblx0fVxuXG5cdGZ1bmN0aW9uIF9wcm9jZXNzKGN1cnJlbnQ6IEROb2RlV3JhcHBlcltdLCBuZXh0OiBETm9kZVdyYXBwZXJbXSwgbWV0YTogUHJvY2Vzc01ldGEgPSB7fSk6IHZvaWQge1xuXHRcdGxldCB7IG1lcmdlTm9kZXMgPSBbXSwgb2xkSW5kZXggPSAwLCBuZXdJbmRleCA9IDAgfSA9IG1ldGE7XG5cdFx0Y29uc3QgY3VycmVudExlbmd0aCA9IGN1cnJlbnQubGVuZ3RoO1xuXHRcdGNvbnN0IG5leHRMZW5ndGggPSBuZXh0Lmxlbmd0aDtcblx0XHRjb25zdCBoYXNQcmV2aW91c1NpYmxpbmdzID0gY3VycmVudExlbmd0aCA+IDEgfHwgKGN1cnJlbnRMZW5ndGggPiAwICYmIGN1cnJlbnRMZW5ndGggPCBuZXh0TGVuZ3RoKTtcblx0XHRjb25zdCBpbnN0cnVjdGlvbnM6IEluc3RydWN0aW9uW10gPSBbXTtcblx0XHRpZiAobmV3SW5kZXggPCBuZXh0TGVuZ3RoKSB7XG5cdFx0XHRsZXQgY3VycmVudFdyYXBwZXIgPSBvbGRJbmRleCA8IGN1cnJlbnRMZW5ndGggPyBjdXJyZW50W29sZEluZGV4XSA6IHVuZGVmaW5lZDtcblx0XHRcdGNvbnN0IG5leHRXcmFwcGVyID0gbmV4dFtuZXdJbmRleF07XG5cdFx0XHRuZXh0V3JhcHBlci5oYXNQcmV2aW91c1NpYmxpbmdzID0gaGFzUHJldmlvdXNTaWJsaW5ncztcblxuXHRcdFx0X3Byb2Nlc3NNZXJnZU5vZGVzKG5leHRXcmFwcGVyLCBtZXJnZU5vZGVzKTtcblxuXHRcdFx0aWYgKGN1cnJlbnRXcmFwcGVyICYmIHNhbWUoY3VycmVudFdyYXBwZXIsIG5leHRXcmFwcGVyKSkge1xuXHRcdFx0XHRvbGRJbmRleCsrO1xuXHRcdFx0XHRuZXdJbmRleCsrO1xuXHRcdFx0XHRpZiAoaXNWTm9kZVdyYXBwZXIoY3VycmVudFdyYXBwZXIpICYmIGlzVk5vZGVXcmFwcGVyKG5leHRXcmFwcGVyKSkge1xuXHRcdFx0XHRcdG5leHRXcmFwcGVyLmluc2VydGVkID0gY3VycmVudFdyYXBwZXIuaW5zZXJ0ZWQ7XG5cdFx0XHRcdH1cblx0XHRcdFx0aW5zdHJ1Y3Rpb25zLnB1c2goeyBjdXJyZW50OiBjdXJyZW50V3JhcHBlciwgbmV4dDogbmV4dFdyYXBwZXIgfSk7XG5cdFx0XHR9IGVsc2UgaWYgKCFjdXJyZW50V3JhcHBlciB8fCBmaW5kSW5kZXhPZkNoaWxkKGN1cnJlbnQsIG5leHRXcmFwcGVyLCBvbGRJbmRleCArIDEpID09PSAtMSkge1xuXHRcdFx0XHRoYXMoJ2Rvam8tZGVidWcnKSAmJiBjdXJyZW50Lmxlbmd0aCAmJiByZWdpc3RlckRpc3Rpbmd1aXNoYWJsZUNhbGxiYWNrKG5leHQsIG5ld0luZGV4KTtcblx0XHRcdFx0aW5zdHJ1Y3Rpb25zLnB1c2goeyBjdXJyZW50OiB1bmRlZmluZWQsIG5leHQ6IG5leHRXcmFwcGVyIH0pO1xuXHRcdFx0XHRuZXdJbmRleCsrO1xuXHRcdFx0fSBlbHNlIGlmIChmaW5kSW5kZXhPZkNoaWxkKG5leHQsIGN1cnJlbnRXcmFwcGVyLCBuZXdJbmRleCArIDEpID09PSAtMSkge1xuXHRcdFx0XHRoYXMoJ2Rvam8tZGVidWcnKSAmJiByZWdpc3RlckRpc3Rpbmd1aXNoYWJsZUNhbGxiYWNrKGN1cnJlbnQsIG9sZEluZGV4KTtcblx0XHRcdFx0aW5zdHJ1Y3Rpb25zLnB1c2goeyBjdXJyZW50OiBjdXJyZW50V3JhcHBlciwgbmV4dDogdW5kZWZpbmVkIH0pO1xuXHRcdFx0XHRvbGRJbmRleCsrO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aGFzKCdkb2pvLWRlYnVnJykgJiYgcmVnaXN0ZXJEaXN0aW5ndWlzaGFibGVDYWxsYmFjayhuZXh0LCBuZXdJbmRleCk7XG5cdFx0XHRcdGhhcygnZG9qby1kZWJ1ZycpICYmIHJlZ2lzdGVyRGlzdGluZ3Vpc2hhYmxlQ2FsbGJhY2soY3VycmVudCwgb2xkSW5kZXgpO1xuXHRcdFx0XHRpbnN0cnVjdGlvbnMucHVzaCh7IGN1cnJlbnQ6IGN1cnJlbnRXcmFwcGVyLCBuZXh0OiB1bmRlZmluZWQgfSk7XG5cdFx0XHRcdGluc3RydWN0aW9ucy5wdXNoKHsgY3VycmVudDogdW5kZWZpbmVkLCBuZXh0OiBuZXh0V3JhcHBlciB9KTtcblx0XHRcdFx0b2xkSW5kZXgrKztcblx0XHRcdFx0bmV3SW5kZXgrKztcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAobmV3SW5kZXggPCBuZXh0TGVuZ3RoKSB7XG5cdFx0XHRfcHJvY2Vzc1F1ZXVlLnB1c2goeyBjdXJyZW50LCBuZXh0LCBtZXRhOiB7IG1lcmdlTm9kZXMsIG9sZEluZGV4LCBuZXdJbmRleCB9IH0pO1xuXHRcdH1cblxuXHRcdGlmIChjdXJyZW50TGVuZ3RoID4gb2xkSW5kZXggJiYgbmV3SW5kZXggPj0gbmV4dExlbmd0aCkge1xuXHRcdFx0Zm9yIChsZXQgaSA9IG9sZEluZGV4OyBpIDwgY3VycmVudExlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGhhcygnZG9qby1kZWJ1ZycpICYmIHJlZ2lzdGVyRGlzdGluZ3Vpc2hhYmxlQ2FsbGJhY2soY3VycmVudCwgaSk7XG5cdFx0XHRcdGluc3RydWN0aW9ucy5wdXNoKHsgY3VycmVudDogY3VycmVudFtpXSwgbmV4dDogdW5kZWZpbmVkIH0pO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgaW5zdHJ1Y3Rpb25zLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRjb25zdCB7IGl0ZW0sIGRvbSwgd2lkZ2V0IH0gPSBfcHJvY2Vzc09uZShpbnN0cnVjdGlvbnNbaV0pO1xuXHRcdFx0d2lkZ2V0ICYmIF9wcm9jZXNzUXVldWUucHVzaCh3aWRnZXQpO1xuXHRcdFx0aXRlbSAmJiBfcHJvY2Vzc1F1ZXVlLnB1c2goaXRlbSk7XG5cdFx0XHRkb20gJiYgX2FwcGxpY2F0aW9uUXVldWUucHVzaChkb20pO1xuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIF9wcm9jZXNzT25lKHsgY3VycmVudCwgbmV4dCB9OiBJbnN0cnVjdGlvbik6IFByb2Nlc3NSZXN1bHQge1xuXHRcdGlmIChjdXJyZW50ICE9PSBuZXh0KSB7XG5cdFx0XHRpZiAoIWN1cnJlbnQgJiYgbmV4dCkge1xuXHRcdFx0XHRpZiAoaXNWTm9kZVdyYXBwZXIobmV4dCkpIHtcblx0XHRcdFx0XHRyZXR1cm4gX2NyZWF0ZURvbSh7IG5leHQgfSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuIF9jcmVhdGVXaWRnZXQoeyBuZXh0IH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKGN1cnJlbnQgJiYgbmV4dCkge1xuXHRcdFx0XHRpZiAoaXNWTm9kZVdyYXBwZXIoY3VycmVudCkgJiYgaXNWTm9kZVdyYXBwZXIobmV4dCkpIHtcblx0XHRcdFx0XHRyZXR1cm4gX3VwZGF0ZURvbSh7IGN1cnJlbnQsIG5leHQgfSk7XG5cdFx0XHRcdH0gZWxzZSBpZiAoaXNXTm9kZVdyYXBwZXIoY3VycmVudCkgJiYgaXNXTm9kZVdyYXBwZXIobmV4dCkpIHtcblx0XHRcdFx0XHRyZXR1cm4gX3VwZGF0ZVdpZGdldCh7IGN1cnJlbnQsIG5leHQgfSk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAoY3VycmVudCAmJiAhbmV4dCkge1xuXHRcdFx0XHRpZiAoaXNWTm9kZVdyYXBwZXIoY3VycmVudCkpIHtcblx0XHRcdFx0XHRyZXR1cm4gX3JlbW92ZURvbSh7IGN1cnJlbnQgfSk7XG5cdFx0XHRcdH0gZWxzZSBpZiAoaXNXTm9kZVdyYXBwZXIoY3VycmVudCkpIHtcblx0XHRcdFx0XHRyZXR1cm4gX3JlbW92ZVdpZGdldCh7IGN1cnJlbnQgfSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHt9O1xuXHR9XG5cblx0ZnVuY3Rpb24gX2NyZWF0ZVdpZGdldCh7IG5leHQgfTogQ3JlYXRlV2lkZ2V0SW5zdHJ1Y3Rpb24pOiBQcm9jZXNzUmVzdWx0IHtcblx0XHRsZXQge1xuXHRcdFx0bm9kZTogeyB3aWRnZXRDb25zdHJ1Y3RvciB9XG5cdFx0fSA9IG5leHQ7XG5cdFx0bGV0IHsgcmVnaXN0cnkgfSA9IF9tb3VudE9wdGlvbnM7XG5cdFx0aWYgKCFpc1dpZGdldEJhc2VDb25zdHJ1Y3Rvcih3aWRnZXRDb25zdHJ1Y3RvcikpIHtcblx0XHRcdHJldHVybiB7fTtcblx0XHR9XG5cdFx0Y29uc3QgaW5zdGFuY2UgPSBuZXcgd2lkZ2V0Q29uc3RydWN0b3IoKSBhcyBXaWRnZXRCYXNlO1xuXHRcdGlmIChyZWdpc3RyeSkge1xuXHRcdFx0aW5zdGFuY2UucmVnaXN0cnkuYmFzZSA9IHJlZ2lzdHJ5O1xuXHRcdH1cblx0XHRjb25zdCBpbnN0YW5jZURhdGEgPSB3aWRnZXRJbnN0YW5jZU1hcC5nZXQoaW5zdGFuY2UpITtcblx0XHRpbnN0YW5jZURhdGEuaW52YWxpZGF0ZSA9ICgpID0+IHtcblx0XHRcdGluc3RhbmNlRGF0YS5kaXJ0eSA9IHRydWU7XG5cdFx0XHRpZiAoIWluc3RhbmNlRGF0YS5yZW5kZXJpbmcgJiYgX2luc3RhbmNlVG9XcmFwcGVyTWFwLmhhcyhpbnN0YW5jZSkpIHtcblx0XHRcdFx0X2ludmFsaWRhdGlvblF1ZXVlLnB1c2goeyBpbnN0YW5jZSwgZGVwdGg6IG5leHQuZGVwdGggfSk7XG5cdFx0XHRcdF9zY2hlZHVsZSgpO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0aW5zdGFuY2VEYXRhLnJlbmRlcmluZyA9IHRydWU7XG5cdFx0aW5zdGFuY2UuX19zZXRQcm9wZXJ0aWVzX18obmV4dC5ub2RlLnByb3BlcnRpZXMsIG5leHQubm9kZS5iaW5kKTtcblx0XHRpbnN0YW5jZS5fX3NldENoaWxkcmVuX18obmV4dC5ub2RlLmNoaWxkcmVuKTtcblx0XHRuZXh0Lmluc3RhbmNlID0gaW5zdGFuY2U7XG5cdFx0bGV0IHJlbmRlcmVkID0gaW5zdGFuY2UuX19yZW5kZXJfXygpO1xuXHRcdGluc3RhbmNlRGF0YS5yZW5kZXJpbmcgPSBmYWxzZTtcblx0XHRpZiAocmVuZGVyZWQpIHtcblx0XHRcdHJlbmRlcmVkID0gQXJyYXkuaXNBcnJheShyZW5kZXJlZCkgPyByZW5kZXJlZCA6IFtyZW5kZXJlZF07XG5cdFx0XHRuZXh0LmNoaWxkcmVuV3JhcHBlcnMgPSByZW5kZXJlZFRvV3JhcHBlcihyZW5kZXJlZCwgbmV4dCwgbnVsbCk7XG5cdFx0fVxuXHRcdGlmIChuZXh0Lmluc3RhbmNlKSB7XG5cdFx0XHRfaW5zdGFuY2VUb1dyYXBwZXJNYXAuc2V0KG5leHQuaW5zdGFuY2UsIG5leHQpO1xuXHRcdFx0aWYgKCFwYXJlbnRJbnZhbGlkYXRlKSB7XG5cdFx0XHRcdHBhcmVudEludmFsaWRhdGUgPSBuZXh0Lmluc3RhbmNlLmludmFsaWRhdGUuYmluZChuZXh0Lmluc3RhbmNlKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHtcblx0XHRcdGl0ZW06IHsgbmV4dDogbmV4dC5jaGlsZHJlbldyYXBwZXJzLCBtZXRhOiB7IG1lcmdlTm9kZXM6IG5leHQubWVyZ2VOb2RlcyB9IH0sXG5cdFx0XHR3aWRnZXQ6IHsgdHlwZTogJ2F0dGFjaCcsIGluc3RhbmNlLCBhdHRhY2hlZDogdHJ1ZSB9XG5cdFx0fTtcblx0fVxuXG5cdGZ1bmN0aW9uIF91cGRhdGVXaWRnZXQoeyBjdXJyZW50LCBuZXh0IH06IFVwZGF0ZVdpZGdldEluc3RydWN0aW9uKTogUHJvY2Vzc1Jlc3VsdCB7XG5cdFx0Y3VycmVudCA9IChjdXJyZW50Lmluc3RhbmNlICYmIF9pbnN0YW5jZVRvV3JhcHBlck1hcC5nZXQoY3VycmVudC5pbnN0YW5jZSkpIHx8IGN1cnJlbnQ7XG5cdFx0Y29uc3QgeyBpbnN0YW5jZSwgZG9tTm9kZSwgaGFzQW5pbWF0aW9ucyB9ID0gY3VycmVudDtcblx0XHRpZiAoIWluc3RhbmNlKSB7XG5cdFx0XHRyZXR1cm4gW10gYXMgUHJvY2Vzc1Jlc3VsdDtcblx0XHR9XG5cdFx0Y29uc3QgaW5zdGFuY2VEYXRhID0gd2lkZ2V0SW5zdGFuY2VNYXAuZ2V0KGluc3RhbmNlKSE7XG5cdFx0bmV4dC5pbnN0YW5jZSA9IGluc3RhbmNlO1xuXHRcdG5leHQuZG9tTm9kZSA9IGRvbU5vZGU7XG5cdFx0bmV4dC5oYXNBbmltYXRpb25zID0gaGFzQW5pbWF0aW9ucztcblx0XHRpbnN0YW5jZURhdGEucmVuZGVyaW5nID0gdHJ1ZTtcblx0XHRpbnN0YW5jZSEuX19zZXRQcm9wZXJ0aWVzX18obmV4dC5ub2RlLnByb3BlcnRpZXMsIG5leHQubm9kZS5iaW5kKTtcblx0XHRpbnN0YW5jZSEuX19zZXRDaGlsZHJlbl9fKG5leHQubm9kZS5jaGlsZHJlbik7XG5cdFx0X2luc3RhbmNlVG9XcmFwcGVyTWFwLnNldChuZXh0Lmluc3RhbmNlISwgbmV4dCk7XG5cdFx0aWYgKGluc3RhbmNlRGF0YS5kaXJ0eSkge1xuXHRcdFx0bGV0IHJlbmRlcmVkID0gaW5zdGFuY2UhLl9fcmVuZGVyX18oKTtcblx0XHRcdGluc3RhbmNlRGF0YS5yZW5kZXJpbmcgPSBmYWxzZTtcblx0XHRcdGlmIChyZW5kZXJlZCkge1xuXHRcdFx0XHRyZW5kZXJlZCA9IEFycmF5LmlzQXJyYXkocmVuZGVyZWQpID8gcmVuZGVyZWQgOiBbcmVuZGVyZWRdO1xuXHRcdFx0XHRuZXh0LmNoaWxkcmVuV3JhcHBlcnMgPSByZW5kZXJlZFRvV3JhcHBlcihyZW5kZXJlZCwgbmV4dCwgY3VycmVudCk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRpdGVtOiB7IGN1cnJlbnQ6IGN1cnJlbnQuY2hpbGRyZW5XcmFwcGVycywgbmV4dDogbmV4dC5jaGlsZHJlbldyYXBwZXJzLCBtZXRhOiB7fSB9LFxuXHRcdFx0XHR3aWRnZXQ6IHsgdHlwZTogJ2F0dGFjaCcsIGluc3RhbmNlLCBhdHRhY2hlZDogZmFsc2UgfVxuXHRcdFx0fTtcblx0XHR9XG5cdFx0aW5zdGFuY2VEYXRhLnJlbmRlcmluZyA9IGZhbHNlO1xuXHRcdG5leHQuY2hpbGRyZW5XcmFwcGVycyA9IGN1cnJlbnQuY2hpbGRyZW5XcmFwcGVycztcblx0XHRyZXR1cm4ge1xuXHRcdFx0d2lkZ2V0OiB7IHR5cGU6ICdhdHRhY2gnLCBpbnN0YW5jZSwgYXR0YWNoZWQ6IGZhbHNlIH1cblx0XHR9O1xuXHR9XG5cblx0ZnVuY3Rpb24gX3JlbW92ZVdpZGdldCh7IGN1cnJlbnQgfTogUmVtb3ZlV2lkZ2V0SW5zdHJ1Y3Rpb24pOiBQcm9jZXNzUmVzdWx0IHtcblx0XHRjdXJyZW50ID0gY3VycmVudC5pbnN0YW5jZSA/IF9pbnN0YW5jZVRvV3JhcHBlck1hcC5nZXQoY3VycmVudC5pbnN0YW5jZSkhIDogY3VycmVudDtcblx0XHRfd3JhcHBlclNpYmxpbmdNYXAuZGVsZXRlKGN1cnJlbnQpO1xuXHRcdF9wYXJlbnRXcmFwcGVyTWFwLmRlbGV0ZShjdXJyZW50KTtcblx0XHRfaW5zdGFuY2VUb1dyYXBwZXJNYXAuZGVsZXRlKGN1cnJlbnQuaW5zdGFuY2UhKTtcblxuXHRcdHJldHVybiB7XG5cdFx0XHRpdGVtOiB7IGN1cnJlbnQ6IGN1cnJlbnQuY2hpbGRyZW5XcmFwcGVycywgbWV0YToge30gfSxcblx0XHRcdHdpZGdldDogeyB0eXBlOiAnZGV0YWNoJywgY3VycmVudCB9XG5cdFx0fTtcblx0fVxuXG5cdGZ1bmN0aW9uIF9jcmVhdGVEb20oeyBuZXh0IH06IENyZWF0ZURvbUluc3RydWN0aW9uKTogUHJvY2Vzc1Jlc3VsdCB7XG5cdFx0bGV0IG1lcmdlTm9kZXM6IE5vZGVbXSA9IFtdO1xuXHRcdGlmICghbmV4dC5kb21Ob2RlKSB7XG5cdFx0XHRpZiAoKG5leHQubm9kZSBhcyBhbnkpLmRvbU5vZGUpIHtcblx0XHRcdFx0bmV4dC5kb21Ob2RlID0gKG5leHQubm9kZSBhcyBhbnkpLmRvbU5vZGU7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpZiAobmV4dC5ub2RlLnRhZyA9PT0gJ3N2ZycpIHtcblx0XHRcdFx0XHRuZXh0Lm5hbWVzcGFjZSA9IE5BTUVTUEFDRV9TVkc7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKG5leHQubm9kZS50YWcpIHtcblx0XHRcdFx0XHRpZiAobmV4dC5uYW1lc3BhY2UpIHtcblx0XHRcdFx0XHRcdG5leHQuZG9tTm9kZSA9IGdsb2JhbC5kb2N1bWVudC5jcmVhdGVFbGVtZW50TlMobmV4dC5uYW1lc3BhY2UsIG5leHQubm9kZS50YWcpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRuZXh0LmRvbU5vZGUgPSBnbG9iYWwuZG9jdW1lbnQuY3JlYXRlRWxlbWVudChuZXh0Lm5vZGUudGFnKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSBpZiAobmV4dC5ub2RlLnRleHQgIT0gbnVsbCkge1xuXHRcdFx0XHRcdG5leHQuZG9tTm9kZSA9IGdsb2JhbC5kb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShuZXh0Lm5vZGUudGV4dCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0bmV4dC5tZXJnZWQgPSB0cnVlO1xuXHRcdH1cblx0XHRpZiAobmV4dC5kb21Ob2RlKSB7XG5cdFx0XHRpZiAoX21vdW50T3B0aW9ucy5tZXJnZSkge1xuXHRcdFx0XHRtZXJnZU5vZGVzID0gYXJyYXlGcm9tKG5leHQuZG9tTm9kZS5jaGlsZE5vZGVzKTtcblx0XHRcdH1cblx0XHRcdGlmIChuZXh0Lm5vZGUuY2hpbGRyZW4pIHtcblx0XHRcdFx0bmV4dC5jaGlsZHJlbldyYXBwZXJzID0gcmVuZGVyZWRUb1dyYXBwZXIobmV4dC5ub2RlLmNoaWxkcmVuLCBuZXh0LCBudWxsKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0Y29uc3QgcGFyZW50V05vZGVXcmFwcGVyID0gZmluZFBhcmVudFdOb2RlV3JhcHBlcihuZXh0KTtcblx0XHRpZiAocGFyZW50V05vZGVXcmFwcGVyICYmICFwYXJlbnRXTm9kZVdyYXBwZXIuZG9tTm9kZSkge1xuXHRcdFx0cGFyZW50V05vZGVXcmFwcGVyLmRvbU5vZGUgPSBuZXh0LmRvbU5vZGU7XG5cdFx0fVxuXHRcdGNvbnN0IGRvbTogQXBwbGljYXRpb25JbnN0cnVjdGlvbiA9IHtcblx0XHRcdG5leHQ6IG5leHQhLFxuXHRcdFx0cGFyZW50RG9tTm9kZTogZmluZFBhcmVudERvbU5vZGUobmV4dCkhLFxuXHRcdFx0dHlwZTogJ2NyZWF0ZSdcblx0XHR9O1xuXHRcdGlmIChuZXh0LmNoaWxkcmVuV3JhcHBlcnMpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGl0ZW06IHsgY3VycmVudDogW10sIG5leHQ6IG5leHQuY2hpbGRyZW5XcmFwcGVycywgbWV0YTogeyBtZXJnZU5vZGVzIH0gfSxcblx0XHRcdFx0ZG9tXG5cdFx0XHR9O1xuXHRcdH1cblx0XHRyZXR1cm4geyBkb20gfTtcblx0fVxuXG5cdGZ1bmN0aW9uIF91cGRhdGVEb20oeyBjdXJyZW50LCBuZXh0IH06IFVwZGF0ZURvbUluc3RydWN0aW9uKTogUHJvY2Vzc1Jlc3VsdCB7XG5cdFx0Y29uc3QgcGFyZW50RG9tTm9kZSA9IGZpbmRQYXJlbnREb21Ob2RlKGN1cnJlbnQpO1xuXHRcdG5leHQuZG9tTm9kZSA9IGN1cnJlbnQuZG9tTm9kZTtcblx0XHRuZXh0Lm5hbWVzcGFjZSA9IGN1cnJlbnQubmFtZXNwYWNlO1xuXHRcdGlmIChuZXh0Lm5vZGUudGV4dCAmJiBuZXh0Lm5vZGUudGV4dCAhPT0gY3VycmVudC5ub2RlLnRleHQpIHtcblx0XHRcdGNvbnN0IHVwZGF0ZWRUZXh0Tm9kZSA9IHBhcmVudERvbU5vZGUhLm93bmVyRG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobmV4dC5ub2RlLnRleHQhKTtcblx0XHRcdHBhcmVudERvbU5vZGUhLnJlcGxhY2VDaGlsZCh1cGRhdGVkVGV4dE5vZGUsIG5leHQuZG9tTm9kZSEpO1xuXHRcdFx0bmV4dC5kb21Ob2RlID0gdXBkYXRlZFRleHROb2RlO1xuXHRcdH0gZWxzZSBpZiAobmV4dC5ub2RlLmNoaWxkcmVuKSB7XG5cdFx0XHRjb25zdCBjaGlsZHJlbiA9IHJlbmRlcmVkVG9XcmFwcGVyKG5leHQubm9kZS5jaGlsZHJlbiwgbmV4dCwgY3VycmVudCk7XG5cdFx0XHRuZXh0LmNoaWxkcmVuV3JhcHBlcnMgPSBjaGlsZHJlbjtcblx0XHR9XG5cdFx0cmV0dXJuIHtcblx0XHRcdGl0ZW06IHsgY3VycmVudDogY3VycmVudC5jaGlsZHJlbldyYXBwZXJzLCBuZXh0OiBuZXh0LmNoaWxkcmVuV3JhcHBlcnMsIG1ldGE6IHt9IH0sXG5cdFx0XHRkb206IHsgdHlwZTogJ3VwZGF0ZScsIG5leHQsIGN1cnJlbnQgfVxuXHRcdH07XG5cdH1cblxuXHRmdW5jdGlvbiBfcmVtb3ZlRG9tKHsgY3VycmVudCB9OiBSZW1vdmVEb21JbnN0cnVjdGlvbik6IFByb2Nlc3NSZXN1bHQge1xuXHRcdF93cmFwcGVyU2libGluZ01hcC5kZWxldGUoY3VycmVudCk7XG5cdFx0X3BhcmVudFdyYXBwZXJNYXAuZGVsZXRlKGN1cnJlbnQpO1xuXHRcdGN1cnJlbnQubm9kZS5iaW5kID0gdW5kZWZpbmVkO1xuXHRcdGlmIChjdXJyZW50Lmhhc0FuaW1hdGlvbnMpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGl0ZW06IHsgY3VycmVudDogY3VycmVudC5jaGlsZHJlbldyYXBwZXJzLCBtZXRhOiB7fSB9LFxuXHRcdFx0XHRkb206IHsgdHlwZTogJ2RlbGV0ZScsIGN1cnJlbnQgfVxuXHRcdFx0fTtcblx0XHR9XG5cblx0XHRpZiAoY3VycmVudC5jaGlsZHJlbldyYXBwZXJzKSB7XG5cdFx0XHRfYWZ0ZXJSZW5kZXJDYWxsYmFja3MucHVzaCgoKSA9PiB7XG5cdFx0XHRcdGxldCB3cmFwcGVycyA9IGN1cnJlbnQuY2hpbGRyZW5XcmFwcGVycyB8fCBbXTtcblx0XHRcdFx0bGV0IHdyYXBwZXI6IEROb2RlV3JhcHBlciB8IHVuZGVmaW5lZDtcblx0XHRcdFx0d2hpbGUgKCh3cmFwcGVyID0gd3JhcHBlcnMucG9wKCkpKSB7XG5cdFx0XHRcdFx0aWYgKHdyYXBwZXIuY2hpbGRyZW5XcmFwcGVycykge1xuXHRcdFx0XHRcdFx0d3JhcHBlcnMucHVzaCguLi53cmFwcGVyLmNoaWxkcmVuV3JhcHBlcnMpO1xuXHRcdFx0XHRcdFx0d3JhcHBlci5jaGlsZHJlbldyYXBwZXJzID0gdW5kZWZpbmVkO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAoaXNXTm9kZVdyYXBwZXIod3JhcHBlcikpIHtcblx0XHRcdFx0XHRcdGlmICh3cmFwcGVyLmluc3RhbmNlKSB7XG5cdFx0XHRcdFx0XHRcdF9pbnN0YW5jZVRvV3JhcHBlck1hcC5kZWxldGUod3JhcHBlci5pbnN0YW5jZSk7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IGluc3RhbmNlRGF0YSA9IHdpZGdldEluc3RhbmNlTWFwLmdldCh3cmFwcGVyLmluc3RhbmNlKTtcblx0XHRcdFx0XHRcdFx0aW5zdGFuY2VEYXRhICYmIGluc3RhbmNlRGF0YS5vbkRldGFjaCgpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0d3JhcHBlci5pbnN0YW5jZSA9IHVuZGVmaW5lZDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0X3dyYXBwZXJTaWJsaW5nTWFwLmRlbGV0ZSh3cmFwcGVyKTtcblx0XHRcdFx0XHRfcGFyZW50V3JhcHBlck1hcC5kZWxldGUod3JhcHBlcik7XG5cdFx0XHRcdFx0d3JhcHBlci5kb21Ob2RlID0gdW5kZWZpbmVkO1xuXHRcdFx0XHRcdHdyYXBwZXIubm9kZS5iaW5kID0gdW5kZWZpbmVkO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0ZG9tOiB7IHR5cGU6ICdkZWxldGUnLCBjdXJyZW50IH1cblx0XHR9O1xuXHR9XG5cblx0cmV0dXJuIHtcblx0XHRtb3VudCxcblx0XHRpbnZhbGlkYXRlXG5cdH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IHJlbmRlcmVyO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHZkb20udHMiLCIvLyByZW1vdmVkIGJ5IGV4dHJhY3QtdGV4dC13ZWJwYWNrLXBsdWdpblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL0Bkb2pvL3RoZW1lcy9kb2pvL2luZGV4LmNzc1xuLy8gbW9kdWxlIGlkID0gLi9ub2RlX21vZHVsZXMvQGRvam8vdGhlbWVzL2Rvam8vaW5kZXguY3NzXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsIi8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZVxudmFyIGhhcyA9IHJlcXVpcmUoJ0Bkb2pvL2ZyYW1ld29yay9oYXMvaGFzJyk7XG5cbmlmICghaGFzLmV4aXN0cygnYnVpbGQtdGltZS1yZW5kZXInKSkge1xuXHRoYXMuYWRkKCdidWlsZC10aW1lLXJlbmRlcicsIGZhbHNlLCBmYWxzZSk7XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gaGFzQnVpbGRUaW1lUmVuZGVyLnRzIiwiLy8gcmVtb3ZlZCBieSBleHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW5cbm1vZHVsZS5leHBvcnRzID0ge1wiIF9rZXlcIjpcImNhdHN2c2RvZ3MvYmFzZVwiLFwiXzFBZVdlQXByXCI6XCJiYXNlLW1fX18xQWVXZUFwcl9fWDE2djJcIixcIl8xX3FBTnFYaVwiOlwiYmFzZS1tX19fMV9xQU5xWGlfXzF2eFptXCIsXCJfM1FkZFVpQlVcIjpcImJhc2UtbV9fXzNRZGRVaUJVX19JbzRmLVwifTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9AZG9qby93aWRnZXRzL2NvbW1vbi9zdHlsZXMvYmFzZS5tLmNzc1xuLy8gbW9kdWxlIGlkID0gLi9ub2RlX21vZHVsZXMvQGRvam8vd2lkZ2V0cy9jb21tb24vc3R5bGVzL2Jhc2UubS5jc3Ncbi8vIG1vZHVsZSBjaHVua3MgPSBtYWluIiwicmVxdWlyZSgnQzovVXNlcnMvYS9zcmMvY2F0c3ZzZG9ncy9jbGllbnQvbm9kZV9tb2R1bGVzL0Bkb2pvL3dpZGdldHMvY29tbW9uL3N0eWxlcy9iYXNlLm0uY3NzJyk7XG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbmlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcblx0ZGVmaW5lKFtdLCBmdW5jdGlvbiAoKSB7IHJldHVybiAoZmFjdG9yeSgpKTsgfSk7XG59IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzKSB7XG5cdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xufVxufSh0aGlzLCBmdW5jdGlvbiAoKSB7XG5cdHJldHVybiB7XCJ2aXN1YWxseUhpZGRlblwiOlwiXzFBZVdlQXByXCIsXCJmb2N1c2FibGVcIjpcIl8xX3FBTnFYaVwiLFwiaGlkZGVuXCI6XCJfM1FkZFVpQlVcIixcIiBfa2V5XCI6XCJAZG9qby93aWRnZXRzL2Jhc2VcIn07XG59KSk7O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL0Bkb2pvL3dpZGdldHMvY29tbW9uL3N0eWxlcy9iYXNlLm0uY3NzLmpzXG4vLyBtb2R1bGUgaWQgPSAuL25vZGVfbW9kdWxlcy9AZG9qby93aWRnZXRzL2NvbW1vbi9zdHlsZXMvYmFzZS5tLmNzcy5qc1xuLy8gbW9kdWxlIGNodW5rcyA9IG1haW4iLCJpbXBvcnQgeyBBcmlhUHJvcGVydHlPYmplY3QgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuXG5leHBvcnQgZW51bSBLZXlzIHtcblx0RG93biA9IDQwLFxuXHRFbmQgPSAzNSxcblx0RW50ZXIgPSAxMyxcblx0RXNjYXBlID0gMjcsXG5cdEhvbWUgPSAzNixcblx0TGVmdCA9IDM3LFxuXHRQYWdlRG93biA9IDM0LFxuXHRQYWdlVXAgPSAzMyxcblx0UmlnaHQgPSAzOSxcblx0U3BhY2UgPSAzMixcblx0VGFiID0gOSxcblx0VXAgPSAzOFxufVxuXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0QXJpYVByb3BlcnRpZXMoYXJpYTogQXJpYVByb3BlcnR5T2JqZWN0KTogQXJpYVByb3BlcnR5T2JqZWN0IHtcblx0Y29uc3QgZm9ybWF0dGVkQXJpYSA9IE9iamVjdC5rZXlzKGFyaWEpLnJlZHVjZSgoYTogQXJpYVByb3BlcnR5T2JqZWN0LCBrZXk6IHN0cmluZykgPT4ge1xuXHRcdGFbYGFyaWEtJHtrZXkudG9Mb3dlckNhc2UoKX1gXSA9IGFyaWFba2V5XTtcblx0XHRyZXR1cm4gYTtcblx0fSwge30pO1xuXHRyZXR1cm4gZm9ybWF0dGVkQXJpYTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuLi8uLi8uLi9zcmMvY29tbW9uL3V0aWwudHMiLCJpbXBvcnQgeyBXaWRnZXRCYXNlIH0gZnJvbSAnQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL1dpZGdldEJhc2UnO1xuaW1wb3J0IHsgRE5vZGUgfSBmcm9tICdAZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBUaGVtZWRNaXhpbiwgVGhlbWVkUHJvcGVydGllcywgdGhlbWUgfSBmcm9tICdAZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvbWl4aW5zL1RoZW1lZCc7XG5pbXBvcnQgeyB2IH0gZnJvbSAnQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL2QnO1xuaW1wb3J0IHsgQ3VzdG9tQXJpYVByb3BlcnRpZXMgfSBmcm9tICcuLi9jb21tb24vaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBmb3JtYXRBcmlhUHJvcGVydGllcyB9IGZyb20gJy4uL2NvbW1vbi91dGlsJztcbmltcG9ydCAqIGFzIGNzcyBmcm9tICcuLi90aGVtZS9sYWJlbC5tLmNzcyc7XG5pbXBvcnQgKiBhcyBiYXNlQ3NzIGZyb20gJy4uL2NvbW1vbi9zdHlsZXMvYmFzZS5tLmNzcyc7XG5pbXBvcnQgeyBjdXN0b21FbGVtZW50IH0gZnJvbSAnQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL2RlY29yYXRvcnMvY3VzdG9tRWxlbWVudCc7XG5cbi8qKlxuICogQHR5cGUgTGFiZWxQcm9wZXJ0aWVzXG4gKlxuICogUHJvcGVydGllcyB0aGF0IGNhbiBiZSBzZXQgb24gYSBMYWJlbCBjb21wb25lbnRcbiAqXG4gKiBAcHJvcGVydHkgZm9ySWQgICAgIElEIHRvIGV4cGxpY2l0bHkgYXNzb2NpYXRlIHRoZSBsYWJlbCB3aXRoIGFuIGlucHV0IGVsZW1lbnRcbiAqIEBwcm9wZXJ0eSBkaXNhYmxlZFxuICogQHByb3BlcnR5IGZvY3VzZWRcbiAqIEBwcm9wZXJ0eSByZWFkT25seVxuICogQHByb3BlcnR5IHJlcXVpcmVkXG4gKiBAcHJvcGVydHkgaW52YWxpZFxuICogQHByb3BlcnR5IGhpZGRlblxuICogQHByb3BlcnR5IHNlY29uZGFyeVxuICovXG5leHBvcnQgaW50ZXJmYWNlIExhYmVsUHJvcGVydGllcyBleHRlbmRzIFRoZW1lZFByb3BlcnRpZXMsIEN1c3RvbUFyaWFQcm9wZXJ0aWVzIHtcblx0Zm9ySWQ/OiBzdHJpbmc7XG5cdGRpc2FibGVkPzogYm9vbGVhbjtcblx0Zm9jdXNlZD86IGJvb2xlYW47XG5cdHJlYWRPbmx5PzogYm9vbGVhbjtcblx0cmVxdWlyZWQ/OiBib29sZWFuO1xuXHRpbnZhbGlkPzogYm9vbGVhbjtcblx0aGlkZGVuPzogYm9vbGVhbjtcblx0c2Vjb25kYXJ5PzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNvbnN0IFRoZW1lZEJhc2UgPSBUaGVtZWRNaXhpbihXaWRnZXRCYXNlKTtcblxuQHRoZW1lKGNzcylcbkBjdXN0b21FbGVtZW50PExhYmVsUHJvcGVydGllcz4oe1xuXHR0YWc6ICdkb2pvLWxhYmVsJyxcblx0cHJvcGVydGllczogWyAndGhlbWUnLCAnYXJpYScsICdleHRyYUNsYXNzZXMnLCAnZGlzYWJsZWQnLCAnZm9jdXNlZCcsICdyZWFkT25seScsICdyZXF1aXJlZCcsICdpbnZhbGlkJywgJ2hpZGRlbicsICdzZWNvbmRhcnknIF0sXG5cdGF0dHJpYnV0ZXM6IFtdLFxuXHRldmVudHM6IFtdXG59KVxuZXhwb3J0IGNsYXNzIExhYmVsQmFzZTxQIGV4dGVuZHMgTGFiZWxQcm9wZXJ0aWVzID0gTGFiZWxQcm9wZXJ0aWVzPiBleHRlbmRzIFRoZW1lZEJhc2U8UD4ge1xuXHRwcm90ZWN0ZWQgZ2V0Um9vdENsYXNzZXMoKTogKHN0cmluZyB8IG51bGwpW10ge1xuXHRcdGNvbnN0IHtcblx0XHRcdGRpc2FibGVkLFxuXHRcdFx0Zm9jdXNlZCxcblx0XHRcdGludmFsaWQsXG5cdFx0XHRyZWFkT25seSxcblx0XHRcdHJlcXVpcmVkLFxuXHRcdFx0c2Vjb25kYXJ5XG5cdFx0fSA9IHRoaXMucHJvcGVydGllcztcblx0XHRyZXR1cm4gW1xuXHRcdFx0Y3NzLnJvb3QsXG5cdFx0XHRkaXNhYmxlZCA/IGNzcy5kaXNhYmxlZCA6IG51bGwsXG5cdFx0XHRmb2N1c2VkID8gY3NzLmZvY3VzZWQgOiBudWxsLFxuXHRcdFx0aW52YWxpZCA9PT0gdHJ1ZSA/IGNzcy5pbnZhbGlkIDogbnVsbCxcblx0XHRcdGludmFsaWQgPT09IGZhbHNlID8gY3NzLnZhbGlkIDogbnVsbCxcblx0XHRcdHJlYWRPbmx5ID8gY3NzLnJlYWRvbmx5IDogbnVsbCxcblx0XHRcdHJlcXVpcmVkID8gY3NzLnJlcXVpcmVkIDogbnVsbCxcblx0XHRcdHNlY29uZGFyeSA/IGNzcy5zZWNvbmRhcnkgOiBudWxsXG5cdFx0XTtcblx0fVxuXG5cdHJlbmRlcigpOiBETm9kZSB7XG5cdFx0Y29uc3QgeyBhcmlhID0ge30sIGZvcklkLCBoaWRkZW4gfSA9IHRoaXMucHJvcGVydGllcztcblxuXHRcdHJldHVybiB2KCdsYWJlbCcsIHtcblx0XHRcdC4uLmZvcm1hdEFyaWFQcm9wZXJ0aWVzKGFyaWEpLFxuXHRcdFx0Y2xhc3NlczogW1xuXHRcdFx0XHQuLi50aGlzLnRoZW1lKHRoaXMuZ2V0Um9vdENsYXNzZXMoKSksXG5cdFx0XHRcdGhpZGRlbiA/IGJhc2VDc3MudmlzdWFsbHlIaWRkZW4gOiBudWxsXG5cdFx0XHRdLFxuXHRcdFx0Zm9yOiBmb3JJZFxuXHRcdH0sIHRoaXMuY2hpbGRyZW4pO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExhYmVsIGV4dGVuZHMgTGFiZWxCYXNlPExhYmVsUHJvcGVydGllcz4ge31cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuLi8uLi8uLi9zcmMvbGFiZWwvaW5kZXgudHMiLCJpbXBvcnQgeyBXaWRnZXRCYXNlIH0gZnJvbSAnQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL1dpZGdldEJhc2UnO1xuaW1wb3J0IHsgVGhlbWVkTWl4aW4sIFRoZW1lZFByb3BlcnRpZXMsIHRoZW1lIH0gZnJvbSAnQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL21peGlucy9UaGVtZWQnO1xuaW1wb3J0IHsgRm9jdXNNaXhpbiwgRm9jdXNQcm9wZXJ0aWVzIH0gZnJvbSAnQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL21peGlucy9Gb2N1cyc7XG5pbXBvcnQgTGFiZWwgZnJvbSAnLi4vbGFiZWwvaW5kZXgnO1xuaW1wb3J0IHsgdiwgdyB9IGZyb20gJ0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9kJztcbmltcG9ydCB7IEROb2RlIH0gZnJvbSAnQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL2ludGVyZmFjZXMnO1xuaW1wb3J0IEZvY3VzIGZyb20gJ0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9tZXRhL0ZvY3VzJztcbmltcG9ydCB7IHV1aWQgfSBmcm9tICdAZG9qby9mcmFtZXdvcmsvY29yZS91dGlsJztcbmltcG9ydCB7IEN1c3RvbUFyaWFQcm9wZXJ0aWVzLCBMYWJlbGVkUHJvcGVydGllcywgSW5wdXRFdmVudFByb3BlcnRpZXMsIElucHV0UHJvcGVydGllcywgUG9pbnRlckV2ZW50UHJvcGVydGllcywgS2V5RXZlbnRQcm9wZXJ0aWVzIH0gZnJvbSAnLi4vY29tbW9uL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgZm9ybWF0QXJpYVByb3BlcnRpZXMgfSBmcm9tICcuLi9jb21tb24vdXRpbCc7XG5pbXBvcnQgKiBhcyBmaXhlZENzcyBmcm9tICcuL3N0eWxlcy9zbGlkZXIubS5jc3MnO1xuaW1wb3J0ICogYXMgY3NzIGZyb20gJy4uL3RoZW1lL3NsaWRlci5tLmNzcyc7XG5pbXBvcnQgeyBjdXN0b21FbGVtZW50IH0gZnJvbSAnQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL2RlY29yYXRvcnMvY3VzdG9tRWxlbWVudCc7XG5cbi8qKlxuICogQHR5cGUgU2xpZGVyUHJvcGVydGllc1xuICpcbiAqIFByb3BlcnRpZXMgdGhhdCBjYW4gYmUgc2V0IG9uIGEgU2xpZGVyIGNvbXBvbmVudFxuICpcbiAqIEBwcm9wZXJ0eSBtYXggICAgICAgICAgICAgICBUaGUgbWF4aW11bSB2YWx1ZSBmb3IgdGhlIHNsaWRlclxuICogQHByb3BlcnR5IG1pbiAgICAgICAgICAgICAgIFRoZSBtaW5pbXVtIHZhbHVlIGZvciB0aGUgc2xpZGVyXG4gKiBAcHJvcGVydHkgb3V0cHV0ICAgICAgICAgICAgQW4gb3B0aW9uYWwgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGEgc3RyaW5nIG9yIEROb2RlIGZvciBjdXN0b20gb3V0cHV0IGZvcm1hdFxuICogQHByb3BlcnR5IHNob3dPdXRwdXQgICAgICAgIFRvZ2dsZXMgdmlzaWJpbGl0eSBvZiBzbGlkZXIgb3V0cHV0XG4gKiBAcHJvcGVydHkgc3RlcCAgICAgICAgICAgICAgU2l6ZSBvZiB0aGUgc2xpZGVyIGluY3JlbWVudFxuICogQHByb3BlcnR5IHZlcnRpY2FsICAgICAgICAgIE9yaWVudHMgdGhlIHNsaWRlciB2ZXJ0aWNhbGx5LCBmYWxzZSBieSBkZWZhdWx0LlxuICogQHByb3BlcnR5IHZlcnRpY2FsSGVpZ2h0ICAgIExlbmd0aCBvZiB0aGUgdmVydGljYWwgc2xpZGVyIChvbmx5IHVzZWQgaWYgdmVydGljYWwgaXMgdHJ1ZSlcbiAqIEBwcm9wZXJ0eSB2YWx1ZSAgICAgICAgICAgVGhlIGN1cnJlbnQgdmFsdWVcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTbGlkZXJQcm9wZXJ0aWVzIGV4dGVuZHMgVGhlbWVkUHJvcGVydGllcywgTGFiZWxlZFByb3BlcnRpZXMsIElucHV0UHJvcGVydGllcywgRm9jdXNQcm9wZXJ0aWVzLCBJbnB1dEV2ZW50UHJvcGVydGllcywgUG9pbnRlckV2ZW50UHJvcGVydGllcywgS2V5RXZlbnRQcm9wZXJ0aWVzLCBDdXN0b21BcmlhUHJvcGVydGllcyB7XG5cdG1heD86IG51bWJlcjtcblx0bWluPzogbnVtYmVyO1xuXHRvdXRwdXQ/KHZhbHVlOiBudW1iZXIpOiBETm9kZTtcblx0b3V0cHV0SXNUb29sdGlwPzogYm9vbGVhbjtcblx0c2hvd091dHB1dD86IGJvb2xlYW47XG5cdHN0ZXA/OiBudW1iZXI7XG5cdHZlcnRpY2FsPzogYm9vbGVhbjtcblx0dmVydGljYWxIZWlnaHQ/OiBzdHJpbmc7XG5cdHZhbHVlPzogbnVtYmVyO1xuXHRvbkNsaWNrPyh2YWx1ZTogbnVtYmVyKTogdm9pZDtcbn1cblxuZXhwb3J0IGNvbnN0IFRoZW1lZEJhc2UgPSBUaGVtZWRNaXhpbihGb2N1c01peGluKFdpZGdldEJhc2UpKTtcblxuZnVuY3Rpb24gZXh0cmFjdFZhbHVlKGV2ZW50OiBFdmVudCk6IG51bWJlciB7XG5cdGNvbnN0IHZhbHVlID0gKGV2ZW50LnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZTtcblx0cmV0dXJuIHBhcnNlRmxvYXQodmFsdWUpO1xufVxuXG5AdGhlbWUoY3NzKVxuQGN1c3RvbUVsZW1lbnQ8U2xpZGVyUHJvcGVydGllcz4oe1xuXHR0YWc6ICdkb2pvLXNsaWRlcicsXG5cdHByb3BlcnRpZXM6IFtcblx0XHQndGhlbWUnLFxuXHRcdCdhcmlhJyxcblx0XHQnZXh0cmFDbGFzc2VzJyxcblx0XHQnZGlzYWJsZWQnLFxuXHRcdCdpbnZhbGlkJyxcblx0XHQncmVxdWlyZWQnLFxuXHRcdCdyZWFkT25seScsXG5cdFx0J2xhYmVsQWZ0ZXInLFxuXHRcdCdsYWJlbEhpZGRlbicsXG5cdFx0J21heCcsXG5cdFx0J21pbicsXG5cdFx0J291dHB1dCcsXG5cdFx0J291dHB1dElzVG9vbHRpcCcsXG5cdFx0J3Nob3dPdXRwdXQnLFxuXHRcdCdzdGVwJyxcblx0XHQndmVydGljYWwnLFxuXHRcdCd2YWx1ZSdcblx0XSxcblx0YXR0cmlidXRlczogWyAnd2lkZ2V0SWQnLCAnbGFiZWwnLCAnbmFtZScsICd2ZXJ0aWNhbEhlaWdodCcgXSxcblx0ZXZlbnRzOiBbXG5cdFx0J29uQmx1cicsXG5cdFx0J29uQ2hhbmdlJyxcblx0XHQnb25DbGljaycsXG5cdFx0J29uRm9jdXMnLFxuXHRcdCdvbklucHV0Jyxcblx0XHQnb25LZXlEb3duJyxcblx0XHQnb25LZXlQcmVzcycsXG5cdFx0J29uS2V5VXAnLFxuXHRcdCdvbk1vdXNlRG93bicsXG5cdFx0J29uTW91c2VVcCcsXG5cdFx0J29uVG91Y2hDYW5jZWwnLFxuXHRcdCdvblRvdWNoRW5kJyxcblx0XHQnb25Ub3VjaFN0YXJ0J1xuXHRdXG59KVxuZXhwb3J0IGNsYXNzIFNsaWRlckJhc2U8UCBleHRlbmRzIFNsaWRlclByb3BlcnRpZXMgPSBTbGlkZXJQcm9wZXJ0aWVzPiBleHRlbmRzIFRoZW1lZEJhc2U8UCwgbnVsbD4ge1xuXHQvLyBpZCB1c2VkIHRvIGFzc29jaWF0ZSBpbnB1dCB3aXRoIG91dHB1dFxuXHRwcml2YXRlIF93aWRnZXRJZCA9IHV1aWQoKTtcblxuXHRwcml2YXRlIF9vbkJsdXIgKGV2ZW50OiBGb2N1c0V2ZW50KSB7XG5cdFx0dGhpcy5wcm9wZXJ0aWVzLm9uQmx1ciAmJiB0aGlzLnByb3BlcnRpZXMub25CbHVyKGV4dHJhY3RWYWx1ZShldmVudCkpO1xuXHR9XG5cdHByaXZhdGUgX29uQ2hhbmdlIChldmVudDogRXZlbnQpIHtcblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblx0XHR0aGlzLnByb3BlcnRpZXMub25DaGFuZ2UgJiYgdGhpcy5wcm9wZXJ0aWVzLm9uQ2hhbmdlKGV4dHJhY3RWYWx1ZShldmVudCkpO1xuXHR9XG5cdHByaXZhdGUgX29uQ2xpY2sgKGV2ZW50OiBNb3VzZUV2ZW50KSB7XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdFx0dGhpcy5wcm9wZXJ0aWVzLm9uQ2xpY2sgJiYgdGhpcy5wcm9wZXJ0aWVzLm9uQ2xpY2soZXh0cmFjdFZhbHVlKGV2ZW50KSk7XG5cdH1cblx0cHJpdmF0ZSBfb25Gb2N1cyAoZXZlbnQ6IEZvY3VzRXZlbnQpIHtcblx0XHR0aGlzLnByb3BlcnRpZXMub25Gb2N1cyAmJiB0aGlzLnByb3BlcnRpZXMub25Gb2N1cyhleHRyYWN0VmFsdWUoZXZlbnQpKTtcblx0fVxuXHRwcml2YXRlIF9vbklucHV0IChldmVudDogRXZlbnQpIHtcblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblx0XHR0aGlzLnByb3BlcnRpZXMub25JbnB1dCAmJiB0aGlzLnByb3BlcnRpZXMub25JbnB1dChleHRyYWN0VmFsdWUoZXZlbnQpKTtcblx0fVxuXHRwcml2YXRlIF9vbktleURvd24gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdFx0dGhpcy5wcm9wZXJ0aWVzLm9uS2V5RG93biAmJiB0aGlzLnByb3BlcnRpZXMub25LZXlEb3duKGV2ZW50LndoaWNoLCAoKSA9PiB7IGV2ZW50LnByZXZlbnREZWZhdWx0KCk7IH0pO1xuXHR9XG5cdHByaXZhdGUgX29uS2V5UHJlc3MgKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdFx0dGhpcy5wcm9wZXJ0aWVzLm9uS2V5UHJlc3MgJiYgdGhpcy5wcm9wZXJ0aWVzLm9uS2V5UHJlc3MoZXZlbnQud2hpY2gsICgpID0+IHsgZXZlbnQucHJldmVudERlZmF1bHQoKTsgfSk7XG5cdH1cblx0cHJpdmF0ZSBfb25LZXlVcCAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblx0XHR0aGlzLnByb3BlcnRpZXMub25LZXlVcCAmJiB0aGlzLnByb3BlcnRpZXMub25LZXlVcChldmVudC53aGljaCwgKCkgPT4geyBldmVudC5wcmV2ZW50RGVmYXVsdCgpOyB9KTtcblx0fVxuXHRwcml2YXRlIF9vbk1vdXNlRG93biAoZXZlbnQ6IE1vdXNlRXZlbnQpIHtcblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblx0XHR0aGlzLnByb3BlcnRpZXMub25Nb3VzZURvd24gJiYgdGhpcy5wcm9wZXJ0aWVzLm9uTW91c2VEb3duKCk7XG5cdH1cblx0cHJpdmF0ZSBfb25Nb3VzZVVwIChldmVudDogTW91c2VFdmVudCkge1xuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdHRoaXMucHJvcGVydGllcy5vbk1vdXNlVXAgJiYgdGhpcy5wcm9wZXJ0aWVzLm9uTW91c2VVcCgpO1xuXHR9XG5cdHByaXZhdGUgX29uVG91Y2hTdGFydCAoZXZlbnQ6IFRvdWNoRXZlbnQpIHtcblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblx0XHR0aGlzLnByb3BlcnRpZXMub25Ub3VjaFN0YXJ0ICYmIHRoaXMucHJvcGVydGllcy5vblRvdWNoU3RhcnQoKTtcblx0fVxuXHRwcml2YXRlIF9vblRvdWNoRW5kIChldmVudDogVG91Y2hFdmVudCkge1xuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdHRoaXMucHJvcGVydGllcy5vblRvdWNoRW5kICYmIHRoaXMucHJvcGVydGllcy5vblRvdWNoRW5kKCk7XG5cdH1cblx0cHJpdmF0ZSBfb25Ub3VjaENhbmNlbCAoZXZlbnQ6IFRvdWNoRXZlbnQpIHtcblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblx0XHR0aGlzLnByb3BlcnRpZXMub25Ub3VjaENhbmNlbCAmJiB0aGlzLnByb3BlcnRpZXMub25Ub3VjaENhbmNlbCgpO1xuXHR9XG5cblx0cHJvdGVjdGVkIGdldFJvb3RDbGFzc2VzKCk6IChzdHJpbmcgfCBudWxsKVtdIHtcblx0XHRjb25zdCB7XG5cdFx0XHRkaXNhYmxlZCxcblx0XHRcdGludmFsaWQsXG5cdFx0XHRyZWFkT25seSxcblx0XHRcdHJlcXVpcmVkLFxuXHRcdFx0dmVydGljYWwgPSBmYWxzZVxuXHRcdH0gPSB0aGlzLnByb3BlcnRpZXM7XG5cdFx0Y29uc3QgZm9jdXMgPSB0aGlzLm1ldGEoRm9jdXMpLmdldCgncm9vdCcpO1xuXG5cdFx0cmV0dXJuIFtcblx0XHRcdGNzcy5yb290LFxuXHRcdFx0ZGlzYWJsZWQgPyBjc3MuZGlzYWJsZWQgOiBudWxsLFxuXHRcdFx0Zm9jdXMuY29udGFpbnNGb2N1cyA/IGNzcy5mb2N1c2VkIDogbnVsbCxcblx0XHRcdGludmFsaWQgPT09IHRydWUgPyBjc3MuaW52YWxpZCA6IG51bGwsXG5cdFx0XHRpbnZhbGlkID09PSBmYWxzZSA/IGNzcy52YWxpZCA6IG51bGwsXG5cdFx0XHRyZWFkT25seSA/IGNzcy5yZWFkb25seSA6IG51bGwsXG5cdFx0XHRyZXF1aXJlZCA/IGNzcy5yZXF1aXJlZCA6IG51bGwsXG5cdFx0XHR2ZXJ0aWNhbCA/IGNzcy52ZXJ0aWNhbCA6IG51bGxcblx0XHRdO1xuXHR9XG5cblx0cHJvdGVjdGVkIHJlbmRlckNvbnRyb2xzKHBlcmNlbnRWYWx1ZTogbnVtYmVyKTogRE5vZGUge1xuXHRcdGNvbnN0IHtcblx0XHRcdHZlcnRpY2FsID0gZmFsc2UsXG5cdFx0XHR2ZXJ0aWNhbEhlaWdodCA9ICcyMDBweCdcblx0XHR9ID0gdGhpcy5wcm9wZXJ0aWVzO1xuXG5cdFx0cmV0dXJuIHYoJ2RpdicsIHtcblx0XHRcdGNsYXNzZXM6IFsgdGhpcy50aGVtZShjc3MudHJhY2spLCBmaXhlZENzcy50cmFja0ZpeGVkIF0sXG5cdFx0XHQnYXJpYS1oaWRkZW4nOiAndHJ1ZScsXG5cdFx0XHRzdHlsZXM6IHZlcnRpY2FsID8geyB3aWR0aDogdmVydGljYWxIZWlnaHQgfSA6IHt9XG5cdFx0fSwgW1xuXHRcdFx0dignc3BhbicsIHtcblx0XHRcdFx0Y2xhc3NlczogWyB0aGlzLnRoZW1lKGNzcy5maWxsKSwgZml4ZWRDc3MuZmlsbEZpeGVkIF0sXG5cdFx0XHRcdHN0eWxlczogeyB3aWR0aDogYCR7cGVyY2VudFZhbHVlfSVgIH1cblx0XHRcdH0pLFxuXHRcdFx0dignc3BhbicsIHtcblx0XHRcdFx0Y2xhc3NlczogWyB0aGlzLnRoZW1lKGNzcy50aHVtYiksIGZpeGVkQ3NzLnRodW1iRml4ZWQgXSxcblx0XHRcdFx0c3R5bGVzOiB7IGxlZnQ6IGAke3BlcmNlbnRWYWx1ZX0lYCB9XG5cdFx0XHR9KVxuXHRcdF0pO1xuXHR9XG5cblx0cHJvdGVjdGVkIHJlbmRlck91dHB1dCh2YWx1ZTogbnVtYmVyLCBwZXJjZW50VmFsdWU6IG51bWJlcik6IEROb2RlIHtcblx0XHRjb25zdCB7XG5cdFx0XHRvdXRwdXQsXG5cdFx0XHRvdXRwdXRJc1Rvb2x0aXAgPSBmYWxzZSxcblx0XHRcdHZlcnRpY2FsID0gZmFsc2Vcblx0XHR9ID0gdGhpcy5wcm9wZXJ0aWVzO1xuXG5cdFx0Y29uc3Qgb3V0cHV0Tm9kZSA9IG91dHB1dCA/IG91dHB1dCh2YWx1ZSkgOiBgJHt2YWx1ZX1gO1xuXG5cdFx0Ly8gb3V0cHV0IHN0eWxlc1xuXHRcdGxldCBvdXRwdXRTdHlsZXM6IHsgbGVmdD86IHN0cmluZzsgdG9wPzogc3RyaW5nIH0gPSB7fTtcblx0XHRpZiAob3V0cHV0SXNUb29sdGlwKSB7XG5cdFx0XHRvdXRwdXRTdHlsZXMgPSB2ZXJ0aWNhbCA/IHsgdG9wOiBgJHsxMDAgLSBwZXJjZW50VmFsdWV9JWAgfSA6IHsgbGVmdDogYCR7cGVyY2VudFZhbHVlfSVgIH07XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHYoJ291dHB1dCcsIHtcblx0XHRcdGNsYXNzZXM6IHRoaXMudGhlbWUoW2Nzcy5vdXRwdXQsIG91dHB1dElzVG9vbHRpcCA/IGNzcy5vdXRwdXRUb29sdGlwIDogbnVsbF0pLFxuXHRcdFx0Zm9yOiB0aGlzLl93aWRnZXRJZCxcblx0XHRcdHN0eWxlczogb3V0cHV0U3R5bGVzLFxuXHRcdFx0dGFiSW5kZXg6IC0xIC8qIG5lZWRlZCBzbyBFZGdlIGRvZXNuJ3Qgc2VsZWN0IHRoZSBlbGVtZW50IHdoaWxlIHRhYmJpbmcgdGhyb3VnaCAqL1xuXHRcdH0sIFsgb3V0cHV0Tm9kZSBdKTtcblx0fVxuXG5cdHJlbmRlcigpOiBETm9kZSB7XG5cdFx0Y29uc3Qge1xuXHRcdFx0YXJpYSA9IHt9LFxuXHRcdFx0ZGlzYWJsZWQsXG5cdFx0XHR3aWRnZXRJZCA9IHRoaXMuX3dpZGdldElkLFxuXHRcdFx0aW52YWxpZCxcblx0XHRcdGxhYmVsLFxuXHRcdFx0bGFiZWxBZnRlcixcblx0XHRcdGxhYmVsSGlkZGVuLFxuXHRcdFx0bWF4ID0gMTAwLFxuXHRcdFx0bWluID0gMCxcblx0XHRcdG5hbWUsXG5cdFx0XHRyZWFkT25seSxcblx0XHRcdHJlcXVpcmVkLFxuXHRcdFx0c2hvd091dHB1dCA9IHRydWUsXG5cdFx0XHRzdGVwID0gMSxcblx0XHRcdHZlcnRpY2FsID0gZmFsc2UsXG5cdFx0XHR2ZXJ0aWNhbEhlaWdodCA9ICcyMDBweCcsXG5cdFx0XHR0aGVtZVxuXHRcdH0gPSB0aGlzLnByb3BlcnRpZXM7XG5cdFx0Y29uc3QgZm9jdXMgPSB0aGlzLm1ldGEoRm9jdXMpLmdldCgncm9vdCcpO1xuXG5cdFx0bGV0IHtcblx0XHRcdHZhbHVlID0gbWluXG5cdFx0fSA9IHRoaXMucHJvcGVydGllcztcblxuXHRcdHZhbHVlID0gdmFsdWUgPiBtYXggPyBtYXggOiB2YWx1ZTtcblx0XHR2YWx1ZSA9IHZhbHVlIDwgbWluID8gbWluIDogdmFsdWU7XG5cblx0XHRjb25zdCBwZXJjZW50VmFsdWUgPSAodmFsdWUgLSBtaW4pIC8gKG1heCAtIG1pbikgKiAxMDA7XG5cblx0XHRjb25zdCBzbGlkZXIgPSB2KCdkaXYnLCB7XG5cdFx0XHRjbGFzc2VzOiBbIHRoaXMudGhlbWUoY3NzLmlucHV0V3JhcHBlciksIGZpeGVkQ3NzLmlucHV0V3JhcHBlckZpeGVkIF0sXG5cdFx0XHRzdHlsZXM6IHZlcnRpY2FsID8geyBoZWlnaHQ6IHZlcnRpY2FsSGVpZ2h0IH0gOiB7fVxuXHRcdH0sIFtcblx0XHRcdHYoJ2lucHV0Jywge1xuXHRcdFx0XHRrZXk6ICdpbnB1dCcsXG5cdFx0XHRcdC4uLmZvcm1hdEFyaWFQcm9wZXJ0aWVzKGFyaWEpLFxuXHRcdFx0XHRjbGFzc2VzOiBbIHRoaXMudGhlbWUoY3NzLmlucHV0KSwgZml4ZWRDc3MubmF0aXZlSW5wdXQgXSxcblx0XHRcdFx0ZGlzYWJsZWQsXG5cdFx0XHRcdGlkOiB3aWRnZXRJZCxcblx0XHRcdFx0Zm9jdXM6IHRoaXMuc2hvdWxkRm9jdXMsXG5cdFx0XHRcdCdhcmlhLWludmFsaWQnOiBpbnZhbGlkID09PSB0cnVlID8gJ3RydWUnIDogbnVsbCxcblx0XHRcdFx0bWF4OiBgJHttYXh9YCxcblx0XHRcdFx0bWluOiBgJHttaW59YCxcblx0XHRcdFx0bmFtZSxcblx0XHRcdFx0cmVhZE9ubHksXG5cdFx0XHRcdCdhcmlhLXJlYWRvbmx5JzogcmVhZE9ubHkgPT09IHRydWUgPyAndHJ1ZScgOiBudWxsLFxuXHRcdFx0XHRyZXF1aXJlZCxcblx0XHRcdFx0c3RlcDogYCR7c3RlcH1gLFxuXHRcdFx0XHRzdHlsZXM6IHZlcnRpY2FsID8geyB3aWR0aDogdmVydGljYWxIZWlnaHQgfSA6IHt9LFxuXHRcdFx0XHR0eXBlOiAncmFuZ2UnLFxuXHRcdFx0XHR2YWx1ZTogYCR7dmFsdWV9YCxcblx0XHRcdFx0b25ibHVyOiB0aGlzLl9vbkJsdXIsXG5cdFx0XHRcdG9uY2hhbmdlOiB0aGlzLl9vbkNoYW5nZSxcblx0XHRcdFx0b25jbGljazogdGhpcy5fb25DbGljayxcblx0XHRcdFx0b25mb2N1czogdGhpcy5fb25Gb2N1cyxcblx0XHRcdFx0b25pbnB1dDogdGhpcy5fb25JbnB1dCxcblx0XHRcdFx0b25rZXlkb3duOiB0aGlzLl9vbktleURvd24sXG5cdFx0XHRcdG9ua2V5cHJlc3M6IHRoaXMuX29uS2V5UHJlc3MsXG5cdFx0XHRcdG9ua2V5dXA6IHRoaXMuX29uS2V5VXAsXG5cdFx0XHRcdG9ubW91c2Vkb3duOiB0aGlzLl9vbk1vdXNlRG93bixcblx0XHRcdFx0b25tb3VzZXVwOiB0aGlzLl9vbk1vdXNlVXAsXG5cdFx0XHRcdG9udG91Y2hzdGFydDogdGhpcy5fb25Ub3VjaFN0YXJ0LFxuXHRcdFx0XHRvbnRvdWNoZW5kOiB0aGlzLl9vblRvdWNoRW5kLFxuXHRcdFx0XHRvbnRvdWNoY2FuY2VsOiB0aGlzLl9vblRvdWNoQ2FuY2VsXG5cdFx0XHR9KSxcblx0XHRcdHRoaXMucmVuZGVyQ29udHJvbHMocGVyY2VudFZhbHVlKSxcblx0XHRcdHNob3dPdXRwdXQgPyB0aGlzLnJlbmRlck91dHB1dCh2YWx1ZSwgcGVyY2VudFZhbHVlKSA6IG51bGxcblx0XHRdKTtcblxuXHRcdGNvbnN0IGNoaWxkcmVuID0gW1xuXHRcdFx0bGFiZWwgPyB3KExhYmVsLCB7XG5cdFx0XHRcdHRoZW1lLFxuXHRcdFx0XHRkaXNhYmxlZCxcblx0XHRcdFx0Zm9jdXNlZDogZm9jdXMuY29udGFpbnNGb2N1cyxcblx0XHRcdFx0aW52YWxpZCxcblx0XHRcdFx0cmVhZE9ubHksXG5cdFx0XHRcdHJlcXVpcmVkLFxuXHRcdFx0XHRoaWRkZW46IGxhYmVsSGlkZGVuLFxuXHRcdFx0XHRmb3JJZDogd2lkZ2V0SWRcblx0XHRcdH0sIFsgbGFiZWwgXSkgOiBudWxsLFxuXHRcdFx0c2xpZGVyXG5cdFx0XTtcblxuXHRcdHJldHVybiB2KCdkaXYnLCB7XG5cdFx0XHRrZXk6ICdyb290Jyxcblx0XHRcdGNsYXNzZXM6IFsuLi50aGlzLnRoZW1lKHRoaXMuZ2V0Um9vdENsYXNzZXMoKSksIGZpeGVkQ3NzLnJvb3RGaXhlZF1cblx0XHR9LCBsYWJlbEFmdGVyID8gY2hpbGRyZW4ucmV2ZXJzZSgpIDogY2hpbGRyZW4pO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNsaWRlciBleHRlbmRzIFNsaWRlckJhc2U8U2xpZGVyUHJvcGVydGllcz4ge31cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuLi8uLi8uLi9zcmMvc2xpZGVyL2luZGV4LnRzIiwiLy8gcmVtb3ZlZCBieSBleHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW5cbm1vZHVsZS5leHBvcnRzID0ge1wiIF9rZXlcIjpcImNhdHN2c2RvZ3Mvc2xpZGVyXCIsXCJfMklsMnRQTGVcIjpcInNsaWRlci1tX19fMklsMnRQTGVfXzJXSnJhXCIsXCJfMWp1dFBmaWZcIjpcInNsaWRlci1tX19fMWp1dFBmaWZfXzJYNjhrXCIsXCJfMU15alY1X0ZcIjpcInNsaWRlci1tX19fMU15alY1X0ZfXzI3NDh4XCIsXCJfM3BQUXVTcHhcIjpcInNsaWRlci1tX19fM3BQUXVTcHhfXzJRSEVwXCIsXCJfMnMwQXhhaGlcIjpcInNsaWRlci1tX19fMnMwQXhhaGlfX2IxWjJwXCIsXCJrM0dfclNPT1wiOlwic2xpZGVyLW1fX2szR19yU09PX18yX2pCTFwifTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9AZG9qby93aWRnZXRzL3NsaWRlci9zdHlsZXMvc2xpZGVyLm0uY3NzXG4vLyBtb2R1bGUgaWQgPSAuL25vZGVfbW9kdWxlcy9AZG9qby93aWRnZXRzL3NsaWRlci9zdHlsZXMvc2xpZGVyLm0uY3NzXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsInJlcXVpcmUoJ0M6L1VzZXJzL2Evc3JjL2NhdHN2c2RvZ3MvY2xpZW50L25vZGVfbW9kdWxlcy9AZG9qby93aWRnZXRzL3NsaWRlci9zdHlsZXMvc2xpZGVyLm0uY3NzJyk7XG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbmlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcblx0ZGVmaW5lKFtdLCBmdW5jdGlvbiAoKSB7IHJldHVybiAoZmFjdG9yeSgpKTsgfSk7XG59IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzKSB7XG5cdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xufVxufSh0aGlzLCBmdW5jdGlvbiAoKSB7XG5cdHJldHVybiB7XCJyb290Rml4ZWRcIjpcIl8ySWwydFBMZVwiLFwiaW5wdXRXcmFwcGVyRml4ZWRcIjpcIl8xanV0UGZpZlwiLFwiZmlsbEZpeGVkXCI6XCJfMU15alY1X0ZcIixcInRyYWNrRml4ZWRcIjpcIl8zcFBRdVNweFwiLFwidGh1bWJGaXhlZFwiOlwiazNHX3JTT09cIixcIm5hdGl2ZUlucHV0XCI6XCJfMnMwQXhhaGlcIixcIiBfa2V5XCI6XCJAZG9qby93aWRnZXRzL3NsaWRlclwifTtcbn0pKTs7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvQGRvam8vd2lkZ2V0cy9zbGlkZXIvc3R5bGVzL3NsaWRlci5tLmNzcy5qc1xuLy8gbW9kdWxlIGlkID0gLi9ub2RlX21vZHVsZXMvQGRvam8vd2lkZ2V0cy9zbGlkZXIvc3R5bGVzL3NsaWRlci5tLmNzcy5qc1xuLy8gbW9kdWxlIGNodW5rcyA9IG1haW4iLCIvLyByZW1vdmVkIGJ5IGV4dHJhY3QtdGV4dC13ZWJwYWNrLXBsdWdpblxubW9kdWxlLmV4cG9ydHMgPSB7XCIgX2tleVwiOlwiY2F0c3ZzZG9ncy9sYWJlbFwiLFwiXzJhX2x3Wmk4XCI6XCJsYWJlbC1tX19fMmFfbHdaaThfXzNYeTlxXCJ9O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL0Bkb2pvL3dpZGdldHMvdGhlbWUvbGFiZWwubS5jc3Ncbi8vIG1vZHVsZSBpZCA9IC4vbm9kZV9tb2R1bGVzL0Bkb2pvL3dpZGdldHMvdGhlbWUvbGFiZWwubS5jc3Ncbi8vIG1vZHVsZSBjaHVua3MgPSBtYWluIiwicmVxdWlyZSgnQzovVXNlcnMvYS9zcmMvY2F0c3ZzZG9ncy9jbGllbnQvbm9kZV9tb2R1bGVzL0Bkb2pvL3dpZGdldHMvdGhlbWUvbGFiZWwubS5jc3MnKTtcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuXHRkZWZpbmUoW10sIGZ1bmN0aW9uICgpIHsgcmV0dXJuIChmYWN0b3J5KCkpOyB9KTtcbn0gZWxzZSBpZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcblx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG59XG59KHRoaXMsIGZ1bmN0aW9uICgpIHtcblx0cmV0dXJuIHtcInJvb3RcIjpcIl8xWG43R1pqbFwiLFwicmVhZG9ubHlcIjpcIl83OWdNdzB2WFwiLFwiaW52YWxpZFwiOlwiXzFIWFFYYW5kXCIsXCJ2YWxpZFwiOlwiXzNUZU84NW5EXCIsXCJyZXF1aXJlZFwiOlwiXzJhX2x3Wmk4XCIsXCJkaXNhYmxlZFwiOlwiXzNndjlwdHhIXCIsXCJmb2N1c2VkXCI6XCJfMlF5Mm5ZdGFcIixcInNlY29uZGFyeVwiOlwiXzI5VXBSN0dkXCIsXCIgX2tleVwiOlwiQGRvam8vd2lkZ2V0cy9sYWJlbFwifTtcbn0pKTs7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvQGRvam8vd2lkZ2V0cy90aGVtZS9sYWJlbC5tLmNzcy5qc1xuLy8gbW9kdWxlIGlkID0gLi9ub2RlX21vZHVsZXMvQGRvam8vd2lkZ2V0cy90aGVtZS9sYWJlbC5tLmNzcy5qc1xuLy8gbW9kdWxlIGNodW5rcyA9IG1haW4iLCIvLyByZW1vdmVkIGJ5IGV4dHJhY3QtdGV4dC13ZWJwYWNrLXBsdWdpblxubW9kdWxlLmV4cG9ydHMgPSB7XCIgX2tleVwiOlwiY2F0c3ZzZG9ncy9zbGlkZXJcIixcIlRjRVRYNVRTXCI6XCJzbGlkZXItbV9fVGNFVFg1VFNfXzM4OHJRXCIsXCJfMzFKVjRueDBcIjpcInNsaWRlci1tX19fMzFKVjRueDBfXzF3X1NZXCIsXCJfMWM0WFJ3SDBcIjpcInNsaWRlci1tX19fMWM0WFJ3SDBfXzl5dDJBXCIsXCJfM2I0eXhCN0FcIjpcInNsaWRlci1tX19fM2I0eXhCN0FfXzM1VUs0XCIsXCJfM3RaeFZLMFRcIjpcInNsaWRlci1tX19fM3RaeFZLMFRfX0MtSGRQXCIsXCJfMjN1Tm1iSDFcIjpcInNsaWRlci1tX19fMjN1Tm1iSDFfXzFtM3hpXCIsXCJfMThYWHFUSWhcIjpcInNsaWRlci1tX19fMThYWHFUSWhfXzNqWXVhXCIsXCJfMkRkMUgtUTFcIjpcInNsaWRlci1tX19fMkRkMUgtUTFfXzJDQWFmXCIsXCJfM3B1aVdzdUVcIjpcInNsaWRlci1tX19fM3B1aVdzdUVfXzFRal9lXCIsXCJfM2pLWXhYQWRcIjpcInNsaWRlci1tX19fM2pLWXhYQWRfXzFWbWd0XCIsXCJfMlh5WmtnX0lcIjpcInNsaWRlci1tX19fMlh5WmtnX0lfXzJlVkQxXCIsXCJfM211MTRkSFNcIjpcInNsaWRlci1tX19fM211MTRkSFNfX1FFRDJxXCIsXCJqdXlZQzQ3TFwiOlwic2xpZGVyLW1fX2p1eVlDNDdMX18zekF5dVwifTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9AZG9qby93aWRnZXRzL3RoZW1lL3NsaWRlci5tLmNzc1xuLy8gbW9kdWxlIGlkID0gLi9ub2RlX21vZHVsZXMvQGRvam8vd2lkZ2V0cy90aGVtZS9zbGlkZXIubS5jc3Ncbi8vIG1vZHVsZSBjaHVua3MgPSBtYWluIiwicmVxdWlyZSgnQzovVXNlcnMvYS9zcmMvY2F0c3ZzZG9ncy9jbGllbnQvbm9kZV9tb2R1bGVzL0Bkb2pvL3dpZGdldHMvdGhlbWUvc2xpZGVyLm0uY3NzJyk7XG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbmlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcblx0ZGVmaW5lKFtdLCBmdW5jdGlvbiAoKSB7IHJldHVybiAoZmFjdG9yeSgpKTsgfSk7XG59IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzKSB7XG5cdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xufVxufSh0aGlzLCBmdW5jdGlvbiAoKSB7XG5cdHJldHVybiB7XCJyb290XCI6XCJONDZncXJrMFwiLFwib3V0cHV0VG9vbHRpcFwiOlwiVGNFVFg1VFNcIixcInZlcnRpY2FsXCI6XCJfMzFKVjRueDBcIixcImlucHV0XCI6XCJfM2I0eXhCN0FcIixcInRyYWNrXCI6XCJfMWM0WFJ3SDBcIixcImRpc2FibGVkXCI6XCJfMjN1Tm1iSDFcIixcInJlYWRvbmx5XCI6XCJfM3RaeFZLMFRcIixcInJlcXVpcmVkXCI6XCJfMThYWHFUSWhcIixcImludmFsaWRcIjpcIl8yRGQxSC1RMVwiLFwidGh1bWJcIjpcIl8zcHVpV3N1RVwiLFwidmFsaWRcIjpcIl8zaktZeFhBZFwiLFwiaW5wdXRXcmFwcGVyXCI6XCJfMlh5WmtnX0lcIixcImZvY3VzZWRcIjpcIl8zbXUxNGRIU1wiLFwiZmlsbFwiOlwianV5WUM0N0xcIixcIm91dHB1dFwiOlwiXzJFb0labjdVXCIsXCIgX2tleVwiOlwiQGRvam8vd2lkZ2V0cy9zbGlkZXJcIn07XG59KSk7O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL0Bkb2pvL3dpZGdldHMvdGhlbWUvc2xpZGVyLm0uY3NzLmpzXG4vLyBtb2R1bGUgaWQgPSAuL25vZGVfbW9kdWxlcy9AZG9qby93aWRnZXRzL3RoZW1lL3NsaWRlci5tLmNzcy5qc1xuLy8gbW9kdWxlIGNodW5rcyA9IG1haW4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG4oZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRPbmNlTGlzdGVuZXIgPSBub29wO1xuXG5wcm9jZXNzLmxpc3RlbmVycyA9IGZ1bmN0aW9uIChuYW1lKSB7IHJldHVybiBbXSB9XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzXG4vLyBtb2R1bGUgaWQgPSAuL25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanNcbi8vIG1vZHVsZSBjaHVua3MgPSBtYWluIiwiLyohICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbkNvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpOyB5b3UgbWF5IG5vdCB1c2VcclxudGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGVcclxuTGljZW5zZSBhdCBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcclxuXHJcblRISVMgQ09ERSBJUyBQUk9WSURFRCBPTiBBTiAqQVMgSVMqIEJBU0lTLCBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTllcclxuS0lORCwgRUlUSEVSIEVYUFJFU1MgT1IgSU1QTElFRCwgSU5DTFVESU5HIFdJVEhPVVQgTElNSVRBVElPTiBBTlkgSU1QTElFRFxyXG5XQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgVElUTEUsIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLFxyXG5NRVJDSEFOVEFCTElUWSBPUiBOT04tSU5GUklOR0VNRU5ULlxyXG5cclxuU2VlIHRoZSBBcGFjaGUgVmVyc2lvbiAyLjAgTGljZW5zZSBmb3Igc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zXHJcbmFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cclxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cclxuLyogZ2xvYmFsIFJlZmxlY3QsIFByb21pc2UgKi9cclxuXHJcbnZhciBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XHJcbiAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XHJcbiAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChiLmhhc093blByb3BlcnR5KHApKSBkW3BdID0gYltwXTsgfTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2V4dGVuZHMoZCwgYikge1xyXG4gICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxuICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxyXG4gICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xyXG59XHJcblxyXG5leHBvcnQgdmFyIF9fYXNzaWduID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiBfX2Fzc2lnbih0KSB7XHJcbiAgICBmb3IgKHZhciBzLCBpID0gMSwgbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcclxuICAgICAgICBzID0gYXJndW1lbnRzW2ldO1xyXG4gICAgICAgIGZvciAodmFyIHAgaW4gcykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzLCBwKSkgdFtwXSA9IHNbcF07XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcmVzdChzLCBlKSB7XHJcbiAgICB2YXIgdCA9IHt9O1xyXG4gICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApICYmIGUuaW5kZXhPZihwKSA8IDApXHJcbiAgICAgICAgdFtwXSA9IHNbcF07XHJcbiAgICBpZiAocyAhPSBudWxsICYmIHR5cGVvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzID09PSBcImZ1bmN0aW9uXCIpXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIHAgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKHMpOyBpIDwgcC5sZW5ndGg7IGkrKykgaWYgKGUuaW5kZXhPZihwW2ldKSA8IDApXHJcbiAgICAgICAgICAgIHRbcFtpXV0gPSBzW3BbaV1dO1xyXG4gICAgcmV0dXJuIHQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2RlY29yYXRlKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKSB7XHJcbiAgICB2YXIgYyA9IGFyZ3VtZW50cy5sZW5ndGgsIHIgPSBjIDwgMyA/IHRhcmdldCA6IGRlc2MgPT09IG51bGwgPyBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGtleSkgOiBkZXNjLCBkO1xyXG4gICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBSZWZsZWN0LmRlY29yYXRlID09PSBcImZ1bmN0aW9uXCIpIHIgPSBSZWZsZWN0LmRlY29yYXRlKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKTtcclxuICAgIGVsc2UgZm9yICh2YXIgaSA9IGRlY29yYXRvcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIGlmIChkID0gZGVjb3JhdG9yc1tpXSkgciA9IChjIDwgMyA/IGQocikgOiBjID4gMyA/IGQodGFyZ2V0LCBrZXksIHIpIDogZCh0YXJnZXQsIGtleSkpIHx8IHI7XHJcbiAgICByZXR1cm4gYyA+IDMgJiYgciAmJiBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHIpLCByO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19wYXJhbShwYXJhbUluZGV4LCBkZWNvcmF0b3IpIHtcclxuICAgIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0LCBrZXkpIHsgZGVjb3JhdG9yKHRhcmdldCwga2V5LCBwYXJhbUluZGV4KTsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19tZXRhZGF0YShtZXRhZGF0YUtleSwgbWV0YWRhdGFWYWx1ZSkge1xyXG4gICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBSZWZsZWN0Lm1ldGFkYXRhID09PSBcImZ1bmN0aW9uXCIpIHJldHVybiBSZWZsZWN0Lm1ldGFkYXRhKG1ldGFkYXRhS2V5LCBtZXRhZGF0YVZhbHVlKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXdhaXRlcih0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcclxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUocmVzdWx0LnZhbHVlKTsgfSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxyXG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19nZW5lcmF0b3IodGhpc0FyZywgYm9keSkge1xyXG4gICAgdmFyIF8gPSB7IGxhYmVsOiAwLCBzZW50OiBmdW5jdGlvbigpIHsgaWYgKHRbMF0gJiAxKSB0aHJvdyB0WzFdOyByZXR1cm4gdFsxXTsgfSwgdHJ5czogW10sIG9wczogW10gfSwgZiwgeSwgdCwgZztcclxuICAgIHJldHVybiBnID0geyBuZXh0OiB2ZXJiKDApLCBcInRocm93XCI6IHZlcmIoMSksIFwicmV0dXJuXCI6IHZlcmIoMikgfSwgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIChnW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXM7IH0pLCBnO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IHJldHVybiBmdW5jdGlvbiAodikgeyByZXR1cm4gc3RlcChbbiwgdl0pOyB9OyB9XHJcbiAgICBmdW5jdGlvbiBzdGVwKG9wKSB7XHJcbiAgICAgICAgaWYgKGYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJHZW5lcmF0b3IgaXMgYWxyZWFkeSBleGVjdXRpbmcuXCIpO1xyXG4gICAgICAgIHdoaWxlIChfKSB0cnkge1xyXG4gICAgICAgICAgICBpZiAoZiA9IDEsIHkgJiYgKHQgPSB5W29wWzBdICYgMiA/IFwicmV0dXJuXCIgOiBvcFswXSA/IFwidGhyb3dcIiA6IFwibmV4dFwiXSkgJiYgISh0ID0gdC5jYWxsKHksIG9wWzFdKSkuZG9uZSkgcmV0dXJuIHQ7XHJcbiAgICAgICAgICAgIGlmICh5ID0gMCwgdCkgb3AgPSBbMCwgdC52YWx1ZV07XHJcbiAgICAgICAgICAgIHN3aXRjaCAob3BbMF0pIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgMDogY2FzZSAxOiB0ID0gb3A7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0OiBfLmxhYmVsKys7IHJldHVybiB7IHZhbHVlOiBvcFsxXSwgZG9uZTogZmFsc2UgfTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNTogXy5sYWJlbCsrOyB5ID0gb3BbMV07IG9wID0gWzBdOyBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNzogb3AgPSBfLm9wcy5wb3AoKTsgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEodCA9IF8udHJ5cywgdCA9IHQubGVuZ3RoID4gMCAmJiB0W3QubGVuZ3RoIC0gMV0pICYmIChvcFswXSA9PT0gNiB8fCBvcFswXSA9PT0gMikpIHsgXyA9IDA7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSAzICYmICghdCB8fCAob3BbMV0gPiB0WzBdICYmIG9wWzFdIDwgdFszXSkpKSB7IF8ubGFiZWwgPSBvcFsxXTsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDYgJiYgXy5sYWJlbCA8IHRbMV0pIHsgXy5sYWJlbCA9IHRbMV07IHQgPSBvcDsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodCAmJiBfLmxhYmVsIDwgdFsyXSkgeyBfLmxhYmVsID0gdFsyXTsgXy5vcHMucHVzaChvcCk7IGJyZWFrOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRbMl0pIF8ub3BzLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIF8udHJ5cy5wb3AoKTsgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb3AgPSBib2R5LmNhbGwodGhpc0FyZywgXyk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkgeyBvcCA9IFs2LCBlXTsgeSA9IDA7IH0gZmluYWxseSB7IGYgPSB0ID0gMDsgfVxyXG4gICAgICAgIGlmIChvcFswXSAmIDUpIHRocm93IG9wWzFdOyByZXR1cm4geyB2YWx1ZTogb3BbMF0gPyBvcFsxXSA6IHZvaWQgMCwgZG9uZTogdHJ1ZSB9O1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19leHBvcnRTdGFyKG0sIGV4cG9ydHMpIHtcclxuICAgIGZvciAodmFyIHAgaW4gbSkgaWYgKCFleHBvcnRzLmhhc093blByb3BlcnR5KHApKSBleHBvcnRzW3BdID0gbVtwXTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fdmFsdWVzKG8pIHtcclxuICAgIHZhciBtID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9bU3ltYm9sLml0ZXJhdG9yXSwgaSA9IDA7XHJcbiAgICBpZiAobSkgcmV0dXJuIG0uY2FsbChvKTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgbmV4dDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAobyAmJiBpID49IG8ubGVuZ3RoKSBvID0gdm9pZCAwO1xyXG4gICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogbyAmJiBvW2krK10sIGRvbmU6ICFvIH07XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcmVhZChvLCBuKSB7XHJcbiAgICB2YXIgbSA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvW1N5bWJvbC5pdGVyYXRvcl07XHJcbiAgICBpZiAoIW0pIHJldHVybiBvO1xyXG4gICAgdmFyIGkgPSBtLmNhbGwobyksIHIsIGFyID0gW10sIGU7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIHdoaWxlICgobiA9PT0gdm9pZCAwIHx8IG4tLSA+IDApICYmICEociA9IGkubmV4dCgpKS5kb25lKSBhci5wdXNoKHIudmFsdWUpO1xyXG4gICAgfVxyXG4gICAgY2F0Y2ggKGVycm9yKSB7IGUgPSB7IGVycm9yOiBlcnJvciB9OyB9XHJcbiAgICBmaW5hbGx5IHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBpZiAociAmJiAhci5kb25lICYmIChtID0gaVtcInJldHVyblwiXSkpIG0uY2FsbChpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZmluYWxseSB7IGlmIChlKSB0aHJvdyBlLmVycm9yOyB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYXI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3NwcmVhZCgpIHtcclxuICAgIGZvciAodmFyIGFyID0gW10sIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKVxyXG4gICAgICAgIGFyID0gYXIuY29uY2F0KF9fcmVhZChhcmd1bWVudHNbaV0pKTtcclxuICAgIHJldHVybiBhcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXdhaXQodikge1xyXG4gICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBfX2F3YWl0ID8gKHRoaXMudiA9IHYsIHRoaXMpIDogbmV3IF9fYXdhaXQodik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jR2VuZXJhdG9yKHRoaXNBcmcsIF9hcmd1bWVudHMsIGdlbmVyYXRvcikge1xyXG4gICAgaWYgKCFTeW1ib2wuYXN5bmNJdGVyYXRvcikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5hc3luY0l0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxuICAgIHZhciBnID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pLCBpLCBxID0gW107XHJcbiAgICByZXR1cm4gaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIpLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGk7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgaWYgKGdbbl0pIGlbbl0gPSBmdW5jdGlvbiAodikgeyByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKGEsIGIpIHsgcS5wdXNoKFtuLCB2LCBhLCBiXSkgPiAxIHx8IHJlc3VtZShuLCB2KTsgfSk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHJlc3VtZShuLCB2KSB7IHRyeSB7IHN0ZXAoZ1tuXSh2KSk7IH0gY2F0Y2ggKGUpIHsgc2V0dGxlKHFbMF1bM10sIGUpOyB9IH1cclxuICAgIGZ1bmN0aW9uIHN0ZXAocikgeyByLnZhbHVlIGluc3RhbmNlb2YgX19hd2FpdCA/IFByb21pc2UucmVzb2x2ZShyLnZhbHVlLnYpLnRoZW4oZnVsZmlsbCwgcmVqZWN0KSA6IHNldHRsZShxWzBdWzJdLCByKTsgIH1cclxuICAgIGZ1bmN0aW9uIGZ1bGZpbGwodmFsdWUpIHsgcmVzdW1lKFwibmV4dFwiLCB2YWx1ZSk7IH1cclxuICAgIGZ1bmN0aW9uIHJlamVjdCh2YWx1ZSkgeyByZXN1bWUoXCJ0aHJvd1wiLCB2YWx1ZSk7IH1cclxuICAgIGZ1bmN0aW9uIHNldHRsZShmLCB2KSB7IGlmIChmKHYpLCBxLnNoaWZ0KCksIHEubGVuZ3RoKSByZXN1bWUocVswXVswXSwgcVswXVsxXSk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNEZWxlZ2F0b3Iobykge1xyXG4gICAgdmFyIGksIHA7XHJcbiAgICByZXR1cm4gaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIsIGZ1bmN0aW9uIChlKSB7IHRocm93IGU7IH0pLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuLCBmKSB7IGlmIChvW25dKSBpW25dID0gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIChwID0gIXApID8geyB2YWx1ZTogX19hd2FpdChvW25dKHYpKSwgZG9uZTogbiA9PT0gXCJyZXR1cm5cIiB9IDogZiA/IGYodikgOiB2OyB9OyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jVmFsdWVzKG8pIHtcclxuICAgIGlmICghU3ltYm9sLmFzeW5jSXRlcmF0b3IpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTeW1ib2wuYXN5bmNJdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XHJcbiAgICB2YXIgbSA9IG9bU3ltYm9sLmFzeW5jSXRlcmF0b3JdO1xyXG4gICAgcmV0dXJuIG0gPyBtLmNhbGwobykgOiB0eXBlb2YgX192YWx1ZXMgPT09IFwiZnVuY3Rpb25cIiA/IF9fdmFsdWVzKG8pIDogb1tTeW1ib2wuaXRlcmF0b3JdKCk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX21ha2VUZW1wbGF0ZU9iamVjdChjb29rZWQsIHJhdykge1xyXG4gICAgaWYgKE9iamVjdC5kZWZpbmVQcm9wZXJ0eSkgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkoY29va2VkLCBcInJhd1wiLCB7IHZhbHVlOiByYXcgfSk7IH0gZWxzZSB7IGNvb2tlZC5yYXcgPSByYXc7IH1cclxuICAgIHJldHVybiBjb29rZWQ7XHJcbn07XHJcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL3RzbGliL3RzbGliLmVzNi5qc1xuLy8gbW9kdWxlIGlkID0gLi9ub2RlX21vZHVsZXMvdHNsaWIvdHNsaWIuZXM2LmpzXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsIi8vIENvcHlyaWdodCAyMDE0IEdvb2dsZSBJbmMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vL1xuLy8gTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbi8vIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbi8vICAgICBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbi8vXG4vLyBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbi8vXG4vLyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4vLyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4vLyBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbi8vICAgICBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4vLyBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cblxuIWZ1bmN0aW9uKGEsYil7dmFyIGM9e30sZD17fSxlPXt9OyFmdW5jdGlvbihhLGIpe2Z1bmN0aW9uIGMoYSl7aWYoXCJudW1iZXJcIj09dHlwZW9mIGEpcmV0dXJuIGE7dmFyIGI9e307Zm9yKHZhciBjIGluIGEpYltjXT1hW2NdO3JldHVybiBifWZ1bmN0aW9uIGQoKXt0aGlzLl9kZWxheT0wLHRoaXMuX2VuZERlbGF5PTAsdGhpcy5fZmlsbD1cIm5vbmVcIix0aGlzLl9pdGVyYXRpb25TdGFydD0wLHRoaXMuX2l0ZXJhdGlvbnM9MSx0aGlzLl9kdXJhdGlvbj0wLHRoaXMuX3BsYXliYWNrUmF0ZT0xLHRoaXMuX2RpcmVjdGlvbj1cIm5vcm1hbFwiLHRoaXMuX2Vhc2luZz1cImxpbmVhclwiLHRoaXMuX2Vhc2luZ0Z1bmN0aW9uPXh9ZnVuY3Rpb24gZSgpe3JldHVybiBhLmlzRGVwcmVjYXRlZChcIkludmFsaWQgdGltaW5nIGlucHV0c1wiLFwiMjAxNi0wMy0wMlwiLFwiVHlwZUVycm9yIGV4Y2VwdGlvbnMgd2lsbCBiZSB0aHJvd24gaW5zdGVhZC5cIiwhMCl9ZnVuY3Rpb24gZihiLGMsZSl7dmFyIGY9bmV3IGQ7cmV0dXJuIGMmJihmLmZpbGw9XCJib3RoXCIsZi5kdXJhdGlvbj1cImF1dG9cIiksXCJudW1iZXJcIiE9dHlwZW9mIGJ8fGlzTmFOKGIpP3ZvaWQgMCE9PWImJk9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGIpLmZvckVhY2goZnVuY3Rpb24oYyl7aWYoXCJhdXRvXCIhPWJbY10pe2lmKChcIm51bWJlclwiPT10eXBlb2YgZltjXXx8XCJkdXJhdGlvblwiPT1jKSYmKFwibnVtYmVyXCIhPXR5cGVvZiBiW2NdfHxpc05hTihiW2NdKSkpcmV0dXJuO2lmKFwiZmlsbFwiPT1jJiYtMT09di5pbmRleE9mKGJbY10pKXJldHVybjtpZihcImRpcmVjdGlvblwiPT1jJiYtMT09dy5pbmRleE9mKGJbY10pKXJldHVybjtpZihcInBsYXliYWNrUmF0ZVwiPT1jJiYxIT09YltjXSYmYS5pc0RlcHJlY2F0ZWQoXCJBbmltYXRpb25FZmZlY3RUaW1pbmcucGxheWJhY2tSYXRlXCIsXCIyMDE0LTExLTI4XCIsXCJVc2UgQW5pbWF0aW9uLnBsYXliYWNrUmF0ZSBpbnN0ZWFkLlwiKSlyZXR1cm47ZltjXT1iW2NdfX0pOmYuZHVyYXRpb249YixmfWZ1bmN0aW9uIGcoYSl7cmV0dXJuXCJudW1iZXJcIj09dHlwZW9mIGEmJihhPWlzTmFOKGEpP3tkdXJhdGlvbjowfTp7ZHVyYXRpb246YX0pLGF9ZnVuY3Rpb24gaChiLGMpe3JldHVybiBiPWEubnVtZXJpY1RpbWluZ1RvT2JqZWN0KGIpLGYoYixjKX1mdW5jdGlvbiBpKGEsYixjLGQpe3JldHVybiBhPDB8fGE+MXx8YzwwfHxjPjE/eDpmdW5jdGlvbihlKXtmdW5jdGlvbiBmKGEsYixjKXtyZXR1cm4gMyphKigxLWMpKigxLWMpKmMrMypiKigxLWMpKmMqYytjKmMqY31pZihlPD0wKXt2YXIgZz0wO3JldHVybiBhPjA/Zz1iL2E6IWImJmM+MCYmKGc9ZC9jKSxnKmV9aWYoZT49MSl7dmFyIGg9MDtyZXR1cm4gYzwxP2g9KGQtMSkvKGMtMSk6MT09YyYmYTwxJiYoaD0oYi0xKS8oYS0xKSksMStoKihlLTEpfWZvcih2YXIgaT0wLGo9MTtpPGo7KXt2YXIgaz0oaStqKS8yLGw9ZihhLGMsayk7aWYoTWF0aC5hYnMoZS1sKTwxZS01KXJldHVybiBmKGIsZCxrKTtsPGU/aT1rOmo9a31yZXR1cm4gZihiLGQsayl9fWZ1bmN0aW9uIGooYSxiKXtyZXR1cm4gZnVuY3Rpb24oYyl7aWYoYz49MSlyZXR1cm4gMTt2YXIgZD0xL2E7cmV0dXJuKGMrPWIqZCktYyVkfX1mdW5jdGlvbiBrKGEpe0N8fChDPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIikuc3R5bGUpLEMuYW5pbWF0aW9uVGltaW5nRnVuY3Rpb249XCJcIixDLmFuaW1hdGlvblRpbWluZ0Z1bmN0aW9uPWE7dmFyIGI9Qy5hbmltYXRpb25UaW1pbmdGdW5jdGlvbjtpZihcIlwiPT1iJiZlKCkpdGhyb3cgbmV3IFR5cGVFcnJvcihhK1wiIGlzIG5vdCBhIHZhbGlkIHZhbHVlIGZvciBlYXNpbmdcIik7cmV0dXJuIGJ9ZnVuY3Rpb24gbChhKXtpZihcImxpbmVhclwiPT1hKXJldHVybiB4O3ZhciBiPUUuZXhlYyhhKTtpZihiKXJldHVybiBpLmFwcGx5KHRoaXMsYi5zbGljZSgxKS5tYXAoTnVtYmVyKSk7dmFyIGM9Ri5leGVjKGEpO3JldHVybiBjP2ooTnVtYmVyKGNbMV0pLHtzdGFydDp5LG1pZGRsZTp6LGVuZDpBfVtjWzJdXSk6QlthXXx8eH1mdW5jdGlvbiBtKGEpe3JldHVybiBNYXRoLmFicyhuKGEpL2EucGxheWJhY2tSYXRlKX1mdW5jdGlvbiBuKGEpe3JldHVybiAwPT09YS5kdXJhdGlvbnx8MD09PWEuaXRlcmF0aW9ucz8wOmEuZHVyYXRpb24qYS5pdGVyYXRpb25zfWZ1bmN0aW9uIG8oYSxiLGMpe2lmKG51bGw9PWIpcmV0dXJuIEc7dmFyIGQ9Yy5kZWxheSthK2MuZW5kRGVsYXk7cmV0dXJuIGI8TWF0aC5taW4oYy5kZWxheSxkKT9IOmI+PU1hdGgubWluKGMuZGVsYXkrYSxkKT9JOkp9ZnVuY3Rpb24gcChhLGIsYyxkLGUpe3N3aXRjaChkKXtjYXNlIEg6cmV0dXJuXCJiYWNrd2FyZHNcIj09Ynx8XCJib3RoXCI9PWI/MDpudWxsO2Nhc2UgSjpyZXR1cm4gYy1lO2Nhc2UgSTpyZXR1cm5cImZvcndhcmRzXCI9PWJ8fFwiYm90aFwiPT1iP2E6bnVsbDtjYXNlIEc6cmV0dXJuIG51bGx9fWZ1bmN0aW9uIHEoYSxiLGMsZCxlKXt2YXIgZj1lO3JldHVybiAwPT09YT9iIT09SCYmKGYrPWMpOmYrPWQvYSxmfWZ1bmN0aW9uIHIoYSxiLGMsZCxlLGYpe3ZhciBnPWE9PT0xLzA/YiUxOmElMTtyZXR1cm4gMCE9PWd8fGMhPT1JfHwwPT09ZHx8MD09PWUmJjAhPT1mfHwoZz0xKSxnfWZ1bmN0aW9uIHMoYSxiLGMsZCl7cmV0dXJuIGE9PT1JJiZiPT09MS8wPzEvMDoxPT09Yz9NYXRoLmZsb29yKGQpLTE6TWF0aC5mbG9vcihkKX1mdW5jdGlvbiB0KGEsYixjKXt2YXIgZD1hO2lmKFwibm9ybWFsXCIhPT1hJiZcInJldmVyc2VcIiE9PWEpe3ZhciBlPWI7XCJhbHRlcm5hdGUtcmV2ZXJzZVwiPT09YSYmKGUrPTEpLGQ9XCJub3JtYWxcIixlIT09MS8wJiZlJTIhPTAmJihkPVwicmV2ZXJzZVwiKX1yZXR1cm5cIm5vcm1hbFwiPT09ZD9jOjEtY31mdW5jdGlvbiB1KGEsYixjKXt2YXIgZD1vKGEsYixjKSxlPXAoYSxjLmZpbGwsYixkLGMuZGVsYXkpO2lmKG51bGw9PT1lKXJldHVybiBudWxsO3ZhciBmPXEoYy5kdXJhdGlvbixkLGMuaXRlcmF0aW9ucyxlLGMuaXRlcmF0aW9uU3RhcnQpLGc9cihmLGMuaXRlcmF0aW9uU3RhcnQsZCxjLml0ZXJhdGlvbnMsZSxjLmR1cmF0aW9uKSxoPXMoZCxjLml0ZXJhdGlvbnMsZyxmKSxpPXQoYy5kaXJlY3Rpb24saCxnKTtyZXR1cm4gYy5fZWFzaW5nRnVuY3Rpb24oaSl9dmFyIHY9XCJiYWNrd2FyZHN8Zm9yd2FyZHN8Ym90aHxub25lXCIuc3BsaXQoXCJ8XCIpLHc9XCJyZXZlcnNlfGFsdGVybmF0ZXxhbHRlcm5hdGUtcmV2ZXJzZVwiLnNwbGl0KFwifFwiKSx4PWZ1bmN0aW9uKGEpe3JldHVybiBhfTtkLnByb3RvdHlwZT17X3NldE1lbWJlcjpmdW5jdGlvbihiLGMpe3RoaXNbXCJfXCIrYl09Yyx0aGlzLl9lZmZlY3QmJih0aGlzLl9lZmZlY3QuX3RpbWluZ0lucHV0W2JdPWMsdGhpcy5fZWZmZWN0Ll90aW1pbmc9YS5ub3JtYWxpemVUaW1pbmdJbnB1dCh0aGlzLl9lZmZlY3QuX3RpbWluZ0lucHV0KSx0aGlzLl9lZmZlY3QuYWN0aXZlRHVyYXRpb249YS5jYWxjdWxhdGVBY3RpdmVEdXJhdGlvbih0aGlzLl9lZmZlY3QuX3RpbWluZyksdGhpcy5fZWZmZWN0Ll9hbmltYXRpb24mJnRoaXMuX2VmZmVjdC5fYW5pbWF0aW9uLl9yZWJ1aWxkVW5kZXJseWluZ0FuaW1hdGlvbigpKX0sZ2V0IHBsYXliYWNrUmF0ZSgpe3JldHVybiB0aGlzLl9wbGF5YmFja1JhdGV9LHNldCBkZWxheShhKXt0aGlzLl9zZXRNZW1iZXIoXCJkZWxheVwiLGEpfSxnZXQgZGVsYXkoKXtyZXR1cm4gdGhpcy5fZGVsYXl9LHNldCBlbmREZWxheShhKXt0aGlzLl9zZXRNZW1iZXIoXCJlbmREZWxheVwiLGEpfSxnZXQgZW5kRGVsYXkoKXtyZXR1cm4gdGhpcy5fZW5kRGVsYXl9LHNldCBmaWxsKGEpe3RoaXMuX3NldE1lbWJlcihcImZpbGxcIixhKX0sZ2V0IGZpbGwoKXtyZXR1cm4gdGhpcy5fZmlsbH0sc2V0IGl0ZXJhdGlvblN0YXJ0KGEpe2lmKChpc05hTihhKXx8YTwwKSYmZSgpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJpdGVyYXRpb25TdGFydCBtdXN0IGJlIGEgbm9uLW5lZ2F0aXZlIG51bWJlciwgcmVjZWl2ZWQ6IFwiK3RpbWluZy5pdGVyYXRpb25TdGFydCk7dGhpcy5fc2V0TWVtYmVyKFwiaXRlcmF0aW9uU3RhcnRcIixhKX0sZ2V0IGl0ZXJhdGlvblN0YXJ0KCl7cmV0dXJuIHRoaXMuX2l0ZXJhdGlvblN0YXJ0fSxzZXQgZHVyYXRpb24oYSl7aWYoXCJhdXRvXCIhPWEmJihpc05hTihhKXx8YTwwKSYmZSgpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJkdXJhdGlvbiBtdXN0IGJlIG5vbi1uZWdhdGl2ZSBvciBhdXRvLCByZWNlaXZlZDogXCIrYSk7dGhpcy5fc2V0TWVtYmVyKFwiZHVyYXRpb25cIixhKX0sZ2V0IGR1cmF0aW9uKCl7cmV0dXJuIHRoaXMuX2R1cmF0aW9ufSxzZXQgZGlyZWN0aW9uKGEpe3RoaXMuX3NldE1lbWJlcihcImRpcmVjdGlvblwiLGEpfSxnZXQgZGlyZWN0aW9uKCl7cmV0dXJuIHRoaXMuX2RpcmVjdGlvbn0sc2V0IGVhc2luZyhhKXt0aGlzLl9lYXNpbmdGdW5jdGlvbj1sKGsoYSkpLHRoaXMuX3NldE1lbWJlcihcImVhc2luZ1wiLGEpfSxnZXQgZWFzaW5nKCl7cmV0dXJuIHRoaXMuX2Vhc2luZ30sc2V0IGl0ZXJhdGlvbnMoYSl7aWYoKGlzTmFOKGEpfHxhPDApJiZlKCkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIml0ZXJhdGlvbnMgbXVzdCBiZSBub24tbmVnYXRpdmUsIHJlY2VpdmVkOiBcIithKTt0aGlzLl9zZXRNZW1iZXIoXCJpdGVyYXRpb25zXCIsYSl9LGdldCBpdGVyYXRpb25zKCl7cmV0dXJuIHRoaXMuX2l0ZXJhdGlvbnN9fTt2YXIgeT0xLHo9LjUsQT0wLEI9e2Vhc2U6aSguMjUsLjEsLjI1LDEpLFwiZWFzZS1pblwiOmkoLjQyLDAsMSwxKSxcImVhc2Utb3V0XCI6aSgwLDAsLjU4LDEpLFwiZWFzZS1pbi1vdXRcIjppKC40MiwwLC41OCwxKSxcInN0ZXAtc3RhcnRcIjpqKDEseSksXCJzdGVwLW1pZGRsZVwiOmooMSx6KSxcInN0ZXAtZW5kXCI6aigxLEEpfSxDPW51bGwsRD1cIlxcXFxzKigtP1xcXFxkK1xcXFwuP1xcXFxkKnwtP1xcXFwuXFxcXGQrKVxcXFxzKlwiLEU9bmV3IFJlZ0V4cChcImN1YmljLWJlemllclxcXFwoXCIrRCtcIixcIitEK1wiLFwiK0QrXCIsXCIrRCtcIlxcXFwpXCIpLEY9L3N0ZXBzXFwoXFxzKihcXGQrKVxccyosXFxzKihzdGFydHxtaWRkbGV8ZW5kKVxccypcXCkvLEc9MCxIPTEsST0yLEo9MzthLmNsb25lVGltaW5nSW5wdXQ9YyxhLm1ha2VUaW1pbmc9ZixhLm51bWVyaWNUaW1pbmdUb09iamVjdD1nLGEubm9ybWFsaXplVGltaW5nSW5wdXQ9aCxhLmNhbGN1bGF0ZUFjdGl2ZUR1cmF0aW9uPW0sYS5jYWxjdWxhdGVJdGVyYXRpb25Qcm9ncmVzcz11LGEuY2FsY3VsYXRlUGhhc2U9byxhLm5vcm1hbGl6ZUVhc2luZz1rLGEucGFyc2VFYXNpbmdGdW5jdGlvbj1sfShjKSxmdW5jdGlvbihhLGIpe2Z1bmN0aW9uIGMoYSxiKXtyZXR1cm4gYSBpbiBrP2tbYV1bYl18fGI6Yn1mdW5jdGlvbiBkKGEpe3JldHVyblwiZGlzcGxheVwiPT09YXx8MD09PWEubGFzdEluZGV4T2YoXCJhbmltYXRpb25cIiwwKXx8MD09PWEubGFzdEluZGV4T2YoXCJ0cmFuc2l0aW9uXCIsMCl9ZnVuY3Rpb24gZShhLGIsZSl7aWYoIWQoYSkpe3ZhciBmPWhbYV07aWYoZil7aS5zdHlsZVthXT1iO2Zvcih2YXIgZyBpbiBmKXt2YXIgaj1mW2ddLGs9aS5zdHlsZVtqXTtlW2pdPWMoaixrKX19ZWxzZSBlW2FdPWMoYSxiKX19ZnVuY3Rpb24gZihhKXt2YXIgYj1bXTtmb3IodmFyIGMgaW4gYSlpZighKGMgaW5bXCJlYXNpbmdcIixcIm9mZnNldFwiLFwiY29tcG9zaXRlXCJdKSl7dmFyIGQ9YVtjXTtBcnJheS5pc0FycmF5KGQpfHwoZD1bZF0pO2Zvcih2YXIgZSxmPWQubGVuZ3RoLGc9MDtnPGY7ZysrKWU9e30sZS5vZmZzZXQ9XCJvZmZzZXRcImluIGE/YS5vZmZzZXQ6MT09Zj8xOmcvKGYtMSksXCJlYXNpbmdcImluIGEmJihlLmVhc2luZz1hLmVhc2luZyksXCJjb21wb3NpdGVcImluIGEmJihlLmNvbXBvc2l0ZT1hLmNvbXBvc2l0ZSksZVtjXT1kW2ddLGIucHVzaChlKX1yZXR1cm4gYi5zb3J0KGZ1bmN0aW9uKGEsYil7cmV0dXJuIGEub2Zmc2V0LWIub2Zmc2V0fSksYn1mdW5jdGlvbiBnKGIpe2Z1bmN0aW9uIGMoKXt2YXIgYT1kLmxlbmd0aDtudWxsPT1kW2EtMV0ub2Zmc2V0JiYoZFthLTFdLm9mZnNldD0xKSxhPjEmJm51bGw9PWRbMF0ub2Zmc2V0JiYoZFswXS5vZmZzZXQ9MCk7Zm9yKHZhciBiPTAsYz1kWzBdLm9mZnNldCxlPTE7ZTxhO2UrKyl7dmFyIGY9ZFtlXS5vZmZzZXQ7aWYobnVsbCE9Zil7Zm9yKHZhciBnPTE7ZzxlLWI7ZysrKWRbYitnXS5vZmZzZXQ9YysoZi1jKSpnLyhlLWIpO2I9ZSxjPWZ9fX1pZihudWxsPT1iKXJldHVybltdO3dpbmRvdy5TeW1ib2wmJlN5bWJvbC5pdGVyYXRvciYmQXJyYXkucHJvdG90eXBlLmZyb20mJmJbU3ltYm9sLml0ZXJhdG9yXSYmKGI9QXJyYXkuZnJvbShiKSksQXJyYXkuaXNBcnJheShiKXx8KGI9ZihiKSk7Zm9yKHZhciBkPWIubWFwKGZ1bmN0aW9uKGIpe3ZhciBjPXt9O2Zvcih2YXIgZCBpbiBiKXt2YXIgZj1iW2RdO2lmKFwib2Zmc2V0XCI9PWQpe2lmKG51bGwhPWYpe2lmKGY9TnVtYmVyKGYpLCFpc0Zpbml0ZShmKSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiS2V5ZnJhbWUgb2Zmc2V0cyBtdXN0IGJlIG51bWJlcnMuXCIpO2lmKGY8MHx8Zj4xKXRocm93IG5ldyBUeXBlRXJyb3IoXCJLZXlmcmFtZSBvZmZzZXRzIG11c3QgYmUgYmV0d2VlbiAwIGFuZCAxLlwiKX19ZWxzZSBpZihcImNvbXBvc2l0ZVwiPT1kKXtpZihcImFkZFwiPT1mfHxcImFjY3VtdWxhdGVcIj09Zil0aHJvd3t0eXBlOkRPTUV4Y2VwdGlvbi5OT1RfU1VQUE9SVEVEX0VSUixuYW1lOlwiTm90U3VwcG9ydGVkRXJyb3JcIixtZXNzYWdlOlwiYWRkIGNvbXBvc2l0aW5nIGlzIG5vdCBzdXBwb3J0ZWRcIn07aWYoXCJyZXBsYWNlXCIhPWYpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgY29tcG9zaXRlIG1vZGUgXCIrZitcIi5cIil9ZWxzZSBmPVwiZWFzaW5nXCI9PWQ/YS5ub3JtYWxpemVFYXNpbmcoZik6XCJcIitmO2UoZCxmLGMpfXJldHVybiB2b2lkIDA9PWMub2Zmc2V0JiYoYy5vZmZzZXQ9bnVsbCksdm9pZCAwPT1jLmVhc2luZyYmKGMuZWFzaW5nPVwibGluZWFyXCIpLGN9KSxnPSEwLGg9LTEvMCxpPTA7aTxkLmxlbmd0aDtpKyspe3ZhciBqPWRbaV0ub2Zmc2V0O2lmKG51bGwhPWope2lmKGo8aCl0aHJvdyBuZXcgVHlwZUVycm9yKFwiS2V5ZnJhbWVzIGFyZSBub3QgbG9vc2VseSBzb3J0ZWQgYnkgb2Zmc2V0LiBTb3J0IG9yIHNwZWNpZnkgb2Zmc2V0cy5cIik7aD1qfWVsc2UgZz0hMX1yZXR1cm4gZD1kLmZpbHRlcihmdW5jdGlvbihhKXtyZXR1cm4gYS5vZmZzZXQ+PTAmJmEub2Zmc2V0PD0xfSksZ3x8YygpLGR9dmFyIGg9e2JhY2tncm91bmQ6W1wiYmFja2dyb3VuZEltYWdlXCIsXCJiYWNrZ3JvdW5kUG9zaXRpb25cIixcImJhY2tncm91bmRTaXplXCIsXCJiYWNrZ3JvdW5kUmVwZWF0XCIsXCJiYWNrZ3JvdW5kQXR0YWNobWVudFwiLFwiYmFja2dyb3VuZE9yaWdpblwiLFwiYmFja2dyb3VuZENsaXBcIixcImJhY2tncm91bmRDb2xvclwiXSxib3JkZXI6W1wiYm9yZGVyVG9wQ29sb3JcIixcImJvcmRlclRvcFN0eWxlXCIsXCJib3JkZXJUb3BXaWR0aFwiLFwiYm9yZGVyUmlnaHRDb2xvclwiLFwiYm9yZGVyUmlnaHRTdHlsZVwiLFwiYm9yZGVyUmlnaHRXaWR0aFwiLFwiYm9yZGVyQm90dG9tQ29sb3JcIixcImJvcmRlckJvdHRvbVN0eWxlXCIsXCJib3JkZXJCb3R0b21XaWR0aFwiLFwiYm9yZGVyTGVmdENvbG9yXCIsXCJib3JkZXJMZWZ0U3R5bGVcIixcImJvcmRlckxlZnRXaWR0aFwiXSxib3JkZXJCb3R0b206W1wiYm9yZGVyQm90dG9tV2lkdGhcIixcImJvcmRlckJvdHRvbVN0eWxlXCIsXCJib3JkZXJCb3R0b21Db2xvclwiXSxib3JkZXJDb2xvcjpbXCJib3JkZXJUb3BDb2xvclwiLFwiYm9yZGVyUmlnaHRDb2xvclwiLFwiYm9yZGVyQm90dG9tQ29sb3JcIixcImJvcmRlckxlZnRDb2xvclwiXSxib3JkZXJMZWZ0OltcImJvcmRlckxlZnRXaWR0aFwiLFwiYm9yZGVyTGVmdFN0eWxlXCIsXCJib3JkZXJMZWZ0Q29sb3JcIl0sYm9yZGVyUmFkaXVzOltcImJvcmRlclRvcExlZnRSYWRpdXNcIixcImJvcmRlclRvcFJpZ2h0UmFkaXVzXCIsXCJib3JkZXJCb3R0b21SaWdodFJhZGl1c1wiLFwiYm9yZGVyQm90dG9tTGVmdFJhZGl1c1wiXSxib3JkZXJSaWdodDpbXCJib3JkZXJSaWdodFdpZHRoXCIsXCJib3JkZXJSaWdodFN0eWxlXCIsXCJib3JkZXJSaWdodENvbG9yXCJdLGJvcmRlclRvcDpbXCJib3JkZXJUb3BXaWR0aFwiLFwiYm9yZGVyVG9wU3R5bGVcIixcImJvcmRlclRvcENvbG9yXCJdLGJvcmRlcldpZHRoOltcImJvcmRlclRvcFdpZHRoXCIsXCJib3JkZXJSaWdodFdpZHRoXCIsXCJib3JkZXJCb3R0b21XaWR0aFwiLFwiYm9yZGVyTGVmdFdpZHRoXCJdLGZsZXg6W1wiZmxleEdyb3dcIixcImZsZXhTaHJpbmtcIixcImZsZXhCYXNpc1wiXSxmb250OltcImZvbnRGYW1pbHlcIixcImZvbnRTaXplXCIsXCJmb250U3R5bGVcIixcImZvbnRWYXJpYW50XCIsXCJmb250V2VpZ2h0XCIsXCJsaW5lSGVpZ2h0XCJdLG1hcmdpbjpbXCJtYXJnaW5Ub3BcIixcIm1hcmdpblJpZ2h0XCIsXCJtYXJnaW5Cb3R0b21cIixcIm1hcmdpbkxlZnRcIl0sb3V0bGluZTpbXCJvdXRsaW5lQ29sb3JcIixcIm91dGxpbmVTdHlsZVwiLFwib3V0bGluZVdpZHRoXCJdLHBhZGRpbmc6W1wicGFkZGluZ1RvcFwiLFwicGFkZGluZ1JpZ2h0XCIsXCJwYWRkaW5nQm90dG9tXCIsXCJwYWRkaW5nTGVmdFwiXX0saT1kb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sXCIsXCJkaXZcIiksaj17dGhpbjpcIjFweFwiLG1lZGl1bTpcIjNweFwiLHRoaWNrOlwiNXB4XCJ9LGs9e2JvcmRlckJvdHRvbVdpZHRoOmosYm9yZGVyTGVmdFdpZHRoOmosYm9yZGVyUmlnaHRXaWR0aDpqLGJvcmRlclRvcFdpZHRoOmosZm9udFNpemU6e1wieHgtc21hbGxcIjpcIjYwJVwiLFwieC1zbWFsbFwiOlwiNzUlXCIsc21hbGw6XCI4OSVcIixtZWRpdW06XCIxMDAlXCIsbGFyZ2U6XCIxMjAlXCIsXCJ4LWxhcmdlXCI6XCIxNTAlXCIsXCJ4eC1sYXJnZVwiOlwiMjAwJVwifSxmb250V2VpZ2h0Ontub3JtYWw6XCI0MDBcIixib2xkOlwiNzAwXCJ9LG91dGxpbmVXaWR0aDpqLHRleHRTaGFkb3c6e25vbmU6XCIwcHggMHB4IDBweCB0cmFuc3BhcmVudFwifSxib3hTaGFkb3c6e25vbmU6XCIwcHggMHB4IDBweCAwcHggdHJhbnNwYXJlbnRcIn19O2EuY29udmVydFRvQXJyYXlGb3JtPWYsYS5ub3JtYWxpemVLZXlmcmFtZXM9Z30oYyksZnVuY3Rpb24oYSl7dmFyIGI9e307YS5pc0RlcHJlY2F0ZWQ9ZnVuY3Rpb24oYSxjLGQsZSl7dmFyIGY9ZT9cImFyZVwiOlwiaXNcIixnPW5ldyBEYXRlLGg9bmV3IERhdGUoYyk7cmV0dXJuIGguc2V0TW9udGgoaC5nZXRNb250aCgpKzMpLCEoZzxoJiYoYSBpbiBifHxjb25zb2xlLndhcm4oXCJXZWIgQW5pbWF0aW9uczogXCIrYStcIiBcIitmK1wiIGRlcHJlY2F0ZWQgYW5kIHdpbGwgc3RvcCB3b3JraW5nIG9uIFwiK2gudG9EYXRlU3RyaW5nKCkrXCIuIFwiK2QpLGJbYV09ITAsMSkpfSxhLmRlcHJlY2F0ZWQ9ZnVuY3Rpb24oYixjLGQsZSl7dmFyIGY9ZT9cImFyZVwiOlwiaXNcIjtpZihhLmlzRGVwcmVjYXRlZChiLGMsZCxlKSl0aHJvdyBuZXcgRXJyb3IoYitcIiBcIitmK1wiIG5vIGxvbmdlciBzdXBwb3J0ZWQuIFwiK2QpfX0oYyksZnVuY3Rpb24oKXtpZihkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuYW5pbWF0ZSl7dmFyIGE9ZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmFuaW1hdGUoW10sMCksYj0hMDtpZihhJiYoYj0hMSxcInBsYXl8Y3VycmVudFRpbWV8cGF1c2V8cmV2ZXJzZXxwbGF5YmFja1JhdGV8Y2FuY2VsfGZpbmlzaHxzdGFydFRpbWV8cGxheVN0YXRlXCIuc3BsaXQoXCJ8XCIpLmZvckVhY2goZnVuY3Rpb24oYyl7dm9pZCAwPT09YVtjXSYmKGI9ITApfSkpLCFiKXJldHVybn0hZnVuY3Rpb24oYSxiLGMpe2Z1bmN0aW9uIGQoYSl7Zm9yKHZhciBiPXt9LGM9MDtjPGEubGVuZ3RoO2MrKylmb3IodmFyIGQgaW4gYVtjXSlpZihcIm9mZnNldFwiIT1kJiZcImVhc2luZ1wiIT1kJiZcImNvbXBvc2l0ZVwiIT1kKXt2YXIgZT17b2Zmc2V0OmFbY10ub2Zmc2V0LGVhc2luZzphW2NdLmVhc2luZyx2YWx1ZTphW2NdW2RdfTtiW2RdPWJbZF18fFtdLGJbZF0ucHVzaChlKX1mb3IodmFyIGYgaW4gYil7dmFyIGc9YltmXTtpZigwIT1nWzBdLm9mZnNldHx8MSE9Z1tnLmxlbmd0aC0xXS5vZmZzZXQpdGhyb3d7dHlwZTpET01FeGNlcHRpb24uTk9UX1NVUFBPUlRFRF9FUlIsbmFtZTpcIk5vdFN1cHBvcnRlZEVycm9yXCIsbWVzc2FnZTpcIlBhcnRpYWwga2V5ZnJhbWVzIGFyZSBub3Qgc3VwcG9ydGVkXCJ9fXJldHVybiBifWZ1bmN0aW9uIGUoYyl7dmFyIGQ9W107Zm9yKHZhciBlIGluIGMpZm9yKHZhciBmPWNbZV0sZz0wO2c8Zi5sZW5ndGgtMTtnKyspe3ZhciBoPWcsaT1nKzEsaj1mW2hdLm9mZnNldCxrPWZbaV0ub2Zmc2V0LGw9aixtPWs7MD09ZyYmKGw9LTEvMCwwPT1rJiYoaT1oKSksZz09Zi5sZW5ndGgtMiYmKG09MS8wLDE9PWomJihoPWkpKSxkLnB1c2goe2FwcGx5RnJvbTpsLGFwcGx5VG86bSxzdGFydE9mZnNldDpmW2hdLm9mZnNldCxlbmRPZmZzZXQ6ZltpXS5vZmZzZXQsZWFzaW5nRnVuY3Rpb246YS5wYXJzZUVhc2luZ0Z1bmN0aW9uKGZbaF0uZWFzaW5nKSxwcm9wZXJ0eTplLGludGVycG9sYXRpb246Yi5wcm9wZXJ0eUludGVycG9sYXRpb24oZSxmW2hdLnZhbHVlLGZbaV0udmFsdWUpfSl9cmV0dXJuIGQuc29ydChmdW5jdGlvbihhLGIpe3JldHVybiBhLnN0YXJ0T2Zmc2V0LWIuc3RhcnRPZmZzZXR9KSxkfWIuY29udmVydEVmZmVjdElucHV0PWZ1bmN0aW9uKGMpe3ZhciBmPWEubm9ybWFsaXplS2V5ZnJhbWVzKGMpLGc9ZChmKSxoPWUoZyk7cmV0dXJuIGZ1bmN0aW9uKGEsYyl7aWYobnVsbCE9YyloLmZpbHRlcihmdW5jdGlvbihhKXtyZXR1cm4gYz49YS5hcHBseUZyb20mJmM8YS5hcHBseVRvfSkuZm9yRWFjaChmdW5jdGlvbihkKXt2YXIgZT1jLWQuc3RhcnRPZmZzZXQsZj1kLmVuZE9mZnNldC1kLnN0YXJ0T2Zmc2V0LGc9MD09Zj8wOmQuZWFzaW5nRnVuY3Rpb24oZS9mKTtiLmFwcGx5KGEsZC5wcm9wZXJ0eSxkLmludGVycG9sYXRpb24oZykpfSk7ZWxzZSBmb3IodmFyIGQgaW4gZylcIm9mZnNldFwiIT1kJiZcImVhc2luZ1wiIT1kJiZcImNvbXBvc2l0ZVwiIT1kJiZiLmNsZWFyKGEsZCl9fX0oYyxkKSxmdW5jdGlvbihhLGIsYyl7ZnVuY3Rpb24gZChhKXtyZXR1cm4gYS5yZXBsYWNlKC8tKC4pL2csZnVuY3Rpb24oYSxiKXtyZXR1cm4gYi50b1VwcGVyQ2FzZSgpfSl9ZnVuY3Rpb24gZShhLGIsYyl7aFtjXT1oW2NdfHxbXSxoW2NdLnB1c2goW2EsYl0pfWZ1bmN0aW9uIGYoYSxiLGMpe2Zvcih2YXIgZj0wO2Y8Yy5sZW5ndGg7ZisrKXtlKGEsYixkKGNbZl0pKX19ZnVuY3Rpb24gZyhjLGUsZil7dmFyIGc9YzsvLS8udGVzdChjKSYmIWEuaXNEZXByZWNhdGVkKFwiSHlwaGVuYXRlZCBwcm9wZXJ0eSBuYW1lc1wiLFwiMjAxNi0wMy0yMlwiLFwiVXNlIGNhbWVsQ2FzZSBpbnN0ZWFkLlwiLCEwKSYmKGc9ZChjKSksXCJpbml0aWFsXCIhPWUmJlwiaW5pdGlhbFwiIT1mfHwoXCJpbml0aWFsXCI9PWUmJihlPWlbZ10pLFwiaW5pdGlhbFwiPT1mJiYoZj1pW2ddKSk7Zm9yKHZhciBqPWU9PWY/W106aFtnXSxrPTA7aiYmazxqLmxlbmd0aDtrKyspe3ZhciBsPWpba11bMF0oZSksbT1qW2tdWzBdKGYpO2lmKHZvaWQgMCE9PWwmJnZvaWQgMCE9PW0pe3ZhciBuPWpba11bMV0obCxtKTtpZihuKXt2YXIgbz1iLkludGVycG9sYXRpb24uYXBwbHkobnVsbCxuKTtyZXR1cm4gZnVuY3Rpb24oYSl7cmV0dXJuIDA9PWE/ZToxPT1hP2Y6byhhKX19fX1yZXR1cm4gYi5JbnRlcnBvbGF0aW9uKCExLCEwLGZ1bmN0aW9uKGEpe3JldHVybiBhP2Y6ZX0pfXZhciBoPXt9O2IuYWRkUHJvcGVydGllc0hhbmRsZXI9Zjt2YXIgaT17YmFja2dyb3VuZENvbG9yOlwidHJhbnNwYXJlbnRcIixiYWNrZ3JvdW5kUG9zaXRpb246XCIwJSAwJVwiLGJvcmRlckJvdHRvbUNvbG9yOlwiY3VycmVudENvbG9yXCIsYm9yZGVyQm90dG9tTGVmdFJhZGl1czpcIjBweFwiLGJvcmRlckJvdHRvbVJpZ2h0UmFkaXVzOlwiMHB4XCIsYm9yZGVyQm90dG9tV2lkdGg6XCIzcHhcIixib3JkZXJMZWZ0Q29sb3I6XCJjdXJyZW50Q29sb3JcIixib3JkZXJMZWZ0V2lkdGg6XCIzcHhcIixib3JkZXJSaWdodENvbG9yOlwiY3VycmVudENvbG9yXCIsYm9yZGVyUmlnaHRXaWR0aDpcIjNweFwiLGJvcmRlclNwYWNpbmc6XCIycHhcIixib3JkZXJUb3BDb2xvcjpcImN1cnJlbnRDb2xvclwiLGJvcmRlclRvcExlZnRSYWRpdXM6XCIwcHhcIixib3JkZXJUb3BSaWdodFJhZGl1czpcIjBweFwiLGJvcmRlclRvcFdpZHRoOlwiM3B4XCIsYm90dG9tOlwiYXV0b1wiLGNsaXA6XCJyZWN0KDBweCwgMHB4LCAwcHgsIDBweClcIixjb2xvcjpcImJsYWNrXCIsZm9udFNpemU6XCIxMDAlXCIsZm9udFdlaWdodDpcIjQwMFwiLGhlaWdodDpcImF1dG9cIixsZWZ0OlwiYXV0b1wiLGxldHRlclNwYWNpbmc6XCJub3JtYWxcIixsaW5lSGVpZ2h0OlwiMTIwJVwiLG1hcmdpbkJvdHRvbTpcIjBweFwiLG1hcmdpbkxlZnQ6XCIwcHhcIixtYXJnaW5SaWdodDpcIjBweFwiLG1hcmdpblRvcDpcIjBweFwiLG1heEhlaWdodDpcIm5vbmVcIixtYXhXaWR0aDpcIm5vbmVcIixtaW5IZWlnaHQ6XCIwcHhcIixtaW5XaWR0aDpcIjBweFwiLG9wYWNpdHk6XCIxLjBcIixvdXRsaW5lQ29sb3I6XCJpbnZlcnRcIixvdXRsaW5lT2Zmc2V0OlwiMHB4XCIsb3V0bGluZVdpZHRoOlwiM3B4XCIscGFkZGluZ0JvdHRvbTpcIjBweFwiLHBhZGRpbmdMZWZ0OlwiMHB4XCIscGFkZGluZ1JpZ2h0OlwiMHB4XCIscGFkZGluZ1RvcDpcIjBweFwiLHJpZ2h0OlwiYXV0b1wiLHN0cm9rZURhc2hhcnJheTpcIm5vbmVcIixzdHJva2VEYXNob2Zmc2V0OlwiMHB4XCIsdGV4dEluZGVudDpcIjBweFwiLHRleHRTaGFkb3c6XCIwcHggMHB4IDBweCB0cmFuc3BhcmVudFwiLHRvcDpcImF1dG9cIix0cmFuc2Zvcm06XCJcIix2ZXJ0aWNhbEFsaWduOlwiMHB4XCIsdmlzaWJpbGl0eTpcInZpc2libGVcIix3aWR0aDpcImF1dG9cIix3b3JkU3BhY2luZzpcIm5vcm1hbFwiLHpJbmRleDpcImF1dG9cIn07Yi5wcm9wZXJ0eUludGVycG9sYXRpb249Z30oYyxkKSxmdW5jdGlvbihhLGIsYyl7ZnVuY3Rpb24gZChiKXt2YXIgYz1hLmNhbGN1bGF0ZUFjdGl2ZUR1cmF0aW9uKGIpLGQ9ZnVuY3Rpb24oZCl7cmV0dXJuIGEuY2FsY3VsYXRlSXRlcmF0aW9uUHJvZ3Jlc3MoYyxkLGIpfTtyZXR1cm4gZC5fdG90YWxEdXJhdGlvbj1iLmRlbGF5K2MrYi5lbmREZWxheSxkfWIuS2V5ZnJhbWVFZmZlY3Q9ZnVuY3Rpb24oYyxlLGYsZyl7dmFyIGgsaT1kKGEubm9ybWFsaXplVGltaW5nSW5wdXQoZikpLGo9Yi5jb252ZXJ0RWZmZWN0SW5wdXQoZSksaz1mdW5jdGlvbigpe2ooYyxoKX07cmV0dXJuIGsuX3VwZGF0ZT1mdW5jdGlvbihhKXtyZXR1cm4gbnVsbCE9PShoPWkoYSkpfSxrLl9jbGVhcj1mdW5jdGlvbigpe2ooYyxudWxsKX0say5faGFzU2FtZVRhcmdldD1mdW5jdGlvbihhKXtyZXR1cm4gYz09PWF9LGsuX3RhcmdldD1jLGsuX3RvdGFsRHVyYXRpb249aS5fdG90YWxEdXJhdGlvbixrLl9pZD1nLGt9fShjLGQpLGZ1bmN0aW9uKGEsYil7YS5hcHBseT1mdW5jdGlvbihiLGMsZCl7Yi5zdHlsZVthLnByb3BlcnR5TmFtZShjKV09ZH0sYS5jbGVhcj1mdW5jdGlvbihiLGMpe2Iuc3R5bGVbYS5wcm9wZXJ0eU5hbWUoYyldPVwiXCJ9fShkKSxmdW5jdGlvbihhKXt3aW5kb3cuRWxlbWVudC5wcm90b3R5cGUuYW5pbWF0ZT1mdW5jdGlvbihiLGMpe3ZhciBkPVwiXCI7cmV0dXJuIGMmJmMuaWQmJihkPWMuaWQpLGEudGltZWxpbmUuX3BsYXkoYS5LZXlmcmFtZUVmZmVjdCh0aGlzLGIsYyxkKSl9fShkKSxmdW5jdGlvbihhLGIpe2Z1bmN0aW9uIGMoYSxiLGQpe2lmKFwibnVtYmVyXCI9PXR5cGVvZiBhJiZcIm51bWJlclwiPT10eXBlb2YgYilyZXR1cm4gYSooMS1kKStiKmQ7aWYoXCJib29sZWFuXCI9PXR5cGVvZiBhJiZcImJvb2xlYW5cIj09dHlwZW9mIGIpcmV0dXJuIGQ8LjU/YTpiO2lmKGEubGVuZ3RoPT1iLmxlbmd0aCl7Zm9yKHZhciBlPVtdLGY9MDtmPGEubGVuZ3RoO2YrKyllLnB1c2goYyhhW2ZdLGJbZl0sZCkpO3JldHVybiBlfXRocm93XCJNaXNtYXRjaGVkIGludGVycG9sYXRpb24gYXJndW1lbnRzIFwiK2ErXCI6XCIrYn1hLkludGVycG9sYXRpb249ZnVuY3Rpb24oYSxiLGQpe3JldHVybiBmdW5jdGlvbihlKXtyZXR1cm4gZChjKGEsYixlKSl9fX0oZCksZnVuY3Rpb24oYSxiLGMpe2Euc2VxdWVuY2VOdW1iZXI9MDt2YXIgZD1mdW5jdGlvbihhLGIsYyl7dGhpcy50YXJnZXQ9YSx0aGlzLmN1cnJlbnRUaW1lPWIsdGhpcy50aW1lbGluZVRpbWU9Yyx0aGlzLnR5cGU9XCJmaW5pc2hcIix0aGlzLmJ1YmJsZXM9ITEsdGhpcy5jYW5jZWxhYmxlPSExLHRoaXMuY3VycmVudFRhcmdldD1hLHRoaXMuZGVmYXVsdFByZXZlbnRlZD0hMSx0aGlzLmV2ZW50UGhhc2U9RXZlbnQuQVRfVEFSR0VULHRoaXMudGltZVN0YW1wPURhdGUubm93KCl9O2IuQW5pbWF0aW9uPWZ1bmN0aW9uKGIpe3RoaXMuaWQ9XCJcIixiJiZiLl9pZCYmKHRoaXMuaWQ9Yi5faWQpLHRoaXMuX3NlcXVlbmNlTnVtYmVyPWEuc2VxdWVuY2VOdW1iZXIrKyx0aGlzLl9jdXJyZW50VGltZT0wLHRoaXMuX3N0YXJ0VGltZT1udWxsLHRoaXMuX3BhdXNlZD0hMSx0aGlzLl9wbGF5YmFja1JhdGU9MSx0aGlzLl9pblRpbWVsaW5lPSEwLHRoaXMuX2ZpbmlzaGVkRmxhZz0hMCx0aGlzLm9uZmluaXNoPW51bGwsdGhpcy5fZmluaXNoSGFuZGxlcnM9W10sdGhpcy5fZWZmZWN0PWIsdGhpcy5faW5FZmZlY3Q9dGhpcy5fZWZmZWN0Ll91cGRhdGUoMCksdGhpcy5faWRsZT0hMCx0aGlzLl9jdXJyZW50VGltZVBlbmRpbmc9ITF9LGIuQW5pbWF0aW9uLnByb3RvdHlwZT17X2Vuc3VyZUFsaXZlOmZ1bmN0aW9uKCl7dGhpcy5wbGF5YmFja1JhdGU8MCYmMD09PXRoaXMuY3VycmVudFRpbWU/dGhpcy5faW5FZmZlY3Q9dGhpcy5fZWZmZWN0Ll91cGRhdGUoLTEpOnRoaXMuX2luRWZmZWN0PXRoaXMuX2VmZmVjdC5fdXBkYXRlKHRoaXMuY3VycmVudFRpbWUpLHRoaXMuX2luVGltZWxpbmV8fCF0aGlzLl9pbkVmZmVjdCYmdGhpcy5fZmluaXNoZWRGbGFnfHwodGhpcy5faW5UaW1lbGluZT0hMCxiLnRpbWVsaW5lLl9hbmltYXRpb25zLnB1c2godGhpcykpfSxfdGlja0N1cnJlbnRUaW1lOmZ1bmN0aW9uKGEsYil7YSE9dGhpcy5fY3VycmVudFRpbWUmJih0aGlzLl9jdXJyZW50VGltZT1hLHRoaXMuX2lzRmluaXNoZWQmJiFiJiYodGhpcy5fY3VycmVudFRpbWU9dGhpcy5fcGxheWJhY2tSYXRlPjA/dGhpcy5fdG90YWxEdXJhdGlvbjowKSx0aGlzLl9lbnN1cmVBbGl2ZSgpKX0sZ2V0IGN1cnJlbnRUaW1lKCl7cmV0dXJuIHRoaXMuX2lkbGV8fHRoaXMuX2N1cnJlbnRUaW1lUGVuZGluZz9udWxsOnRoaXMuX2N1cnJlbnRUaW1lfSxzZXQgY3VycmVudFRpbWUoYSl7YT0rYSxpc05hTihhKXx8KGIucmVzdGFydCgpLHRoaXMuX3BhdXNlZHx8bnVsbD09dGhpcy5fc3RhcnRUaW1lfHwodGhpcy5fc3RhcnRUaW1lPXRoaXMuX3RpbWVsaW5lLmN1cnJlbnRUaW1lLWEvdGhpcy5fcGxheWJhY2tSYXRlKSx0aGlzLl9jdXJyZW50VGltZVBlbmRpbmc9ITEsdGhpcy5fY3VycmVudFRpbWUhPWEmJih0aGlzLl9pZGxlJiYodGhpcy5faWRsZT0hMSx0aGlzLl9wYXVzZWQ9ITApLHRoaXMuX3RpY2tDdXJyZW50VGltZShhLCEwKSxiLmFwcGx5RGlydGllZEFuaW1hdGlvbih0aGlzKSkpfSxnZXQgc3RhcnRUaW1lKCl7cmV0dXJuIHRoaXMuX3N0YXJ0VGltZX0sc2V0IHN0YXJ0VGltZShhKXthPSthLGlzTmFOKGEpfHx0aGlzLl9wYXVzZWR8fHRoaXMuX2lkbGV8fCh0aGlzLl9zdGFydFRpbWU9YSx0aGlzLl90aWNrQ3VycmVudFRpbWUoKHRoaXMuX3RpbWVsaW5lLmN1cnJlbnRUaW1lLXRoaXMuX3N0YXJ0VGltZSkqdGhpcy5wbGF5YmFja1JhdGUpLGIuYXBwbHlEaXJ0aWVkQW5pbWF0aW9uKHRoaXMpKX0sZ2V0IHBsYXliYWNrUmF0ZSgpe3JldHVybiB0aGlzLl9wbGF5YmFja1JhdGV9LHNldCBwbGF5YmFja1JhdGUoYSl7aWYoYSE9dGhpcy5fcGxheWJhY2tSYXRlKXt2YXIgYz10aGlzLmN1cnJlbnRUaW1lO3RoaXMuX3BsYXliYWNrUmF0ZT1hLHRoaXMuX3N0YXJ0VGltZT1udWxsLFwicGF1c2VkXCIhPXRoaXMucGxheVN0YXRlJiZcImlkbGVcIiE9dGhpcy5wbGF5U3RhdGUmJih0aGlzLl9maW5pc2hlZEZsYWc9ITEsdGhpcy5faWRsZT0hMSx0aGlzLl9lbnN1cmVBbGl2ZSgpLGIuYXBwbHlEaXJ0aWVkQW5pbWF0aW9uKHRoaXMpKSxudWxsIT1jJiYodGhpcy5jdXJyZW50VGltZT1jKX19LGdldCBfaXNGaW5pc2hlZCgpe3JldHVybiF0aGlzLl9pZGxlJiYodGhpcy5fcGxheWJhY2tSYXRlPjAmJnRoaXMuX2N1cnJlbnRUaW1lPj10aGlzLl90b3RhbER1cmF0aW9ufHx0aGlzLl9wbGF5YmFja1JhdGU8MCYmdGhpcy5fY3VycmVudFRpbWU8PTApfSxnZXQgX3RvdGFsRHVyYXRpb24oKXtyZXR1cm4gdGhpcy5fZWZmZWN0Ll90b3RhbER1cmF0aW9ufSxnZXQgcGxheVN0YXRlKCl7cmV0dXJuIHRoaXMuX2lkbGU/XCJpZGxlXCI6bnVsbD09dGhpcy5fc3RhcnRUaW1lJiYhdGhpcy5fcGF1c2VkJiYwIT10aGlzLnBsYXliYWNrUmF0ZXx8dGhpcy5fY3VycmVudFRpbWVQZW5kaW5nP1wicGVuZGluZ1wiOnRoaXMuX3BhdXNlZD9cInBhdXNlZFwiOnRoaXMuX2lzRmluaXNoZWQ/XCJmaW5pc2hlZFwiOlwicnVubmluZ1wifSxfcmV3aW5kOmZ1bmN0aW9uKCl7aWYodGhpcy5fcGxheWJhY2tSYXRlPj0wKXRoaXMuX2N1cnJlbnRUaW1lPTA7ZWxzZXtpZighKHRoaXMuX3RvdGFsRHVyYXRpb248MS8wKSl0aHJvdyBuZXcgRE9NRXhjZXB0aW9uKFwiVW5hYmxlIHRvIHJld2luZCBuZWdhdGl2ZSBwbGF5YmFjayByYXRlIGFuaW1hdGlvbiB3aXRoIGluZmluaXRlIGR1cmF0aW9uXCIsXCJJbnZhbGlkU3RhdGVFcnJvclwiKTt0aGlzLl9jdXJyZW50VGltZT10aGlzLl90b3RhbER1cmF0aW9ufX0scGxheTpmdW5jdGlvbigpe3RoaXMuX3BhdXNlZD0hMSwodGhpcy5faXNGaW5pc2hlZHx8dGhpcy5faWRsZSkmJih0aGlzLl9yZXdpbmQoKSx0aGlzLl9zdGFydFRpbWU9bnVsbCksdGhpcy5fZmluaXNoZWRGbGFnPSExLHRoaXMuX2lkbGU9ITEsdGhpcy5fZW5zdXJlQWxpdmUoKSxiLmFwcGx5RGlydGllZEFuaW1hdGlvbih0aGlzKX0scGF1c2U6ZnVuY3Rpb24oKXt0aGlzLl9pc0ZpbmlzaGVkfHx0aGlzLl9wYXVzZWR8fHRoaXMuX2lkbGU/dGhpcy5faWRsZSYmKHRoaXMuX3Jld2luZCgpLHRoaXMuX2lkbGU9ITEpOnRoaXMuX2N1cnJlbnRUaW1lUGVuZGluZz0hMCx0aGlzLl9zdGFydFRpbWU9bnVsbCx0aGlzLl9wYXVzZWQ9ITB9LGZpbmlzaDpmdW5jdGlvbigpe3RoaXMuX2lkbGV8fCh0aGlzLmN1cnJlbnRUaW1lPXRoaXMuX3BsYXliYWNrUmF0ZT4wP3RoaXMuX3RvdGFsRHVyYXRpb246MCx0aGlzLl9zdGFydFRpbWU9dGhpcy5fdG90YWxEdXJhdGlvbi10aGlzLmN1cnJlbnRUaW1lLHRoaXMuX2N1cnJlbnRUaW1lUGVuZGluZz0hMSxiLmFwcGx5RGlydGllZEFuaW1hdGlvbih0aGlzKSl9LGNhbmNlbDpmdW5jdGlvbigpe3RoaXMuX2luRWZmZWN0JiYodGhpcy5faW5FZmZlY3Q9ITEsdGhpcy5faWRsZT0hMCx0aGlzLl9wYXVzZWQ9ITEsdGhpcy5faXNGaW5pc2hlZD0hMCx0aGlzLl9maW5pc2hlZEZsYWc9ITAsdGhpcy5fY3VycmVudFRpbWU9MCx0aGlzLl9zdGFydFRpbWU9bnVsbCx0aGlzLl9lZmZlY3QuX3VwZGF0ZShudWxsKSxiLmFwcGx5RGlydGllZEFuaW1hdGlvbih0aGlzKSl9LHJldmVyc2U6ZnVuY3Rpb24oKXt0aGlzLnBsYXliYWNrUmF0ZSo9LTEsdGhpcy5wbGF5KCl9LGFkZEV2ZW50TGlzdGVuZXI6ZnVuY3Rpb24oYSxiKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBiJiZcImZpbmlzaFwiPT1hJiZ0aGlzLl9maW5pc2hIYW5kbGVycy5wdXNoKGIpfSxyZW1vdmVFdmVudExpc3RlbmVyOmZ1bmN0aW9uKGEsYil7aWYoXCJmaW5pc2hcIj09YSl7dmFyIGM9dGhpcy5fZmluaXNoSGFuZGxlcnMuaW5kZXhPZihiKTtjPj0wJiZ0aGlzLl9maW5pc2hIYW5kbGVycy5zcGxpY2UoYywxKX19LF9maXJlRXZlbnRzOmZ1bmN0aW9uKGEpe2lmKHRoaXMuX2lzRmluaXNoZWQpe2lmKCF0aGlzLl9maW5pc2hlZEZsYWcpe3ZhciBiPW5ldyBkKHRoaXMsdGhpcy5fY3VycmVudFRpbWUsYSksYz10aGlzLl9maW5pc2hIYW5kbGVycy5jb25jYXQodGhpcy5vbmZpbmlzaD9bdGhpcy5vbmZpbmlzaF06W10pO3NldFRpbWVvdXQoZnVuY3Rpb24oKXtjLmZvckVhY2goZnVuY3Rpb24oYSl7YS5jYWxsKGIudGFyZ2V0LGIpfSl9LDApLHRoaXMuX2ZpbmlzaGVkRmxhZz0hMH19ZWxzZSB0aGlzLl9maW5pc2hlZEZsYWc9ITF9LF90aWNrOmZ1bmN0aW9uKGEsYil7dGhpcy5faWRsZXx8dGhpcy5fcGF1c2VkfHwobnVsbD09dGhpcy5fc3RhcnRUaW1lP2ImJih0aGlzLnN0YXJ0VGltZT1hLXRoaXMuX2N1cnJlbnRUaW1lL3RoaXMucGxheWJhY2tSYXRlKTp0aGlzLl9pc0ZpbmlzaGVkfHx0aGlzLl90aWNrQ3VycmVudFRpbWUoKGEtdGhpcy5fc3RhcnRUaW1lKSp0aGlzLnBsYXliYWNrUmF0ZSkpLGImJih0aGlzLl9jdXJyZW50VGltZVBlbmRpbmc9ITEsdGhpcy5fZmlyZUV2ZW50cyhhKSl9LGdldCBfbmVlZHNUaWNrKCl7cmV0dXJuIHRoaXMucGxheVN0YXRlIGlue3BlbmRpbmc6MSxydW5uaW5nOjF9fHwhdGhpcy5fZmluaXNoZWRGbGFnfSxfdGFyZ2V0QW5pbWF0aW9uczpmdW5jdGlvbigpe3ZhciBhPXRoaXMuX2VmZmVjdC5fdGFyZ2V0O3JldHVybiBhLl9hY3RpdmVBbmltYXRpb25zfHwoYS5fYWN0aXZlQW5pbWF0aW9ucz1bXSksYS5fYWN0aXZlQW5pbWF0aW9uc30sX21hcmtUYXJnZXQ6ZnVuY3Rpb24oKXt2YXIgYT10aGlzLl90YXJnZXRBbmltYXRpb25zKCk7LTE9PT1hLmluZGV4T2YodGhpcykmJmEucHVzaCh0aGlzKX0sX3VubWFya1RhcmdldDpmdW5jdGlvbigpe3ZhciBhPXRoaXMuX3RhcmdldEFuaW1hdGlvbnMoKSxiPWEuaW5kZXhPZih0aGlzKTstMSE9PWImJmEuc3BsaWNlKGIsMSl9fX0oYyxkKSxmdW5jdGlvbihhLGIsYyl7ZnVuY3Rpb24gZChhKXt2YXIgYj1qO2o9W10sYTxxLmN1cnJlbnRUaW1lJiYoYT1xLmN1cnJlbnRUaW1lKSxxLl9hbmltYXRpb25zLnNvcnQoZSkscS5fYW5pbWF0aW9ucz1oKGEsITAscS5fYW5pbWF0aW9ucylbMF0sYi5mb3JFYWNoKGZ1bmN0aW9uKGIpe2JbMV0oYSl9KSxnKCksbD12b2lkIDB9ZnVuY3Rpb24gZShhLGIpe3JldHVybiBhLl9zZXF1ZW5jZU51bWJlci1iLl9zZXF1ZW5jZU51bWJlcn1mdW5jdGlvbiBmKCl7dGhpcy5fYW5pbWF0aW9ucz1bXSx0aGlzLmN1cnJlbnRUaW1lPXdpbmRvdy5wZXJmb3JtYW5jZSYmcGVyZm9ybWFuY2Uubm93P3BlcmZvcm1hbmNlLm5vdygpOjB9ZnVuY3Rpb24gZygpe28uZm9yRWFjaChmdW5jdGlvbihhKXthKCl9KSxvLmxlbmd0aD0wfWZ1bmN0aW9uIGgoYSxjLGQpe3A9ITAsbj0hMSxiLnRpbWVsaW5lLmN1cnJlbnRUaW1lPWEsbT0hMTt2YXIgZT1bXSxmPVtdLGc9W10saD1bXTtyZXR1cm4gZC5mb3JFYWNoKGZ1bmN0aW9uKGIpe2IuX3RpY2soYSxjKSxiLl9pbkVmZmVjdD8oZi5wdXNoKGIuX2VmZmVjdCksYi5fbWFya1RhcmdldCgpKTooZS5wdXNoKGIuX2VmZmVjdCksYi5fdW5tYXJrVGFyZ2V0KCkpLGIuX25lZWRzVGljayYmKG09ITApO3ZhciBkPWIuX2luRWZmZWN0fHxiLl9uZWVkc1RpY2s7Yi5faW5UaW1lbGluZT1kLGQ/Zy5wdXNoKGIpOmgucHVzaChiKX0pLG8ucHVzaC5hcHBseShvLGUpLG8ucHVzaC5hcHBseShvLGYpLG0mJnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpe30pLHA9ITEsW2csaF19dmFyIGk9d2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSxqPVtdLGs9MDt3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lPWZ1bmN0aW9uKGEpe3ZhciBiPWsrKztyZXR1cm4gMD09ai5sZW5ndGgmJmkoZCksai5wdXNoKFtiLGFdKSxifSx3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWU9ZnVuY3Rpb24oYSl7ai5mb3JFYWNoKGZ1bmN0aW9uKGIpe2JbMF09PWEmJihiWzFdPWZ1bmN0aW9uKCl7fSl9KX0sZi5wcm90b3R5cGU9e19wbGF5OmZ1bmN0aW9uKGMpe2MuX3RpbWluZz1hLm5vcm1hbGl6ZVRpbWluZ0lucHV0KGMudGltaW5nKTt2YXIgZD1uZXcgYi5BbmltYXRpb24oYyk7cmV0dXJuIGQuX2lkbGU9ITEsZC5fdGltZWxpbmU9dGhpcyx0aGlzLl9hbmltYXRpb25zLnB1c2goZCksYi5yZXN0YXJ0KCksYi5hcHBseURpcnRpZWRBbmltYXRpb24oZCksZH19O3ZhciBsPXZvaWQgMCxtPSExLG49ITE7Yi5yZXN0YXJ0PWZ1bmN0aW9uKCl7cmV0dXJuIG18fChtPSEwLHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpe30pLG49ITApLG59LGIuYXBwbHlEaXJ0aWVkQW5pbWF0aW9uPWZ1bmN0aW9uKGEpe2lmKCFwKXthLl9tYXJrVGFyZ2V0KCk7dmFyIGM9YS5fdGFyZ2V0QW5pbWF0aW9ucygpO2Muc29ydChlKSxoKGIudGltZWxpbmUuY3VycmVudFRpbWUsITEsYy5zbGljZSgpKVsxXS5mb3JFYWNoKGZ1bmN0aW9uKGEpe3ZhciBiPXEuX2FuaW1hdGlvbnMuaW5kZXhPZihhKTstMSE9PWImJnEuX2FuaW1hdGlvbnMuc3BsaWNlKGIsMSl9KSxnKCl9fTt2YXIgbz1bXSxwPSExLHE9bmV3IGY7Yi50aW1lbGluZT1xfShjLGQpLGZ1bmN0aW9uKGEpe2Z1bmN0aW9uIGIoYSxiKXt2YXIgYz1hLmV4ZWMoYik7aWYoYylyZXR1cm4gYz1hLmlnbm9yZUNhc2U/Y1swXS50b0xvd2VyQ2FzZSgpOmNbMF0sW2MsYi5zdWJzdHIoYy5sZW5ndGgpXX1mdW5jdGlvbiBjKGEsYil7Yj1iLnJlcGxhY2UoL15cXHMqLyxcIlwiKTt2YXIgYz1hKGIpO2lmKGMpcmV0dXJuW2NbMF0sY1sxXS5yZXBsYWNlKC9eXFxzKi8sXCJcIildfWZ1bmN0aW9uIGQoYSxkLGUpe2E9Yy5iaW5kKG51bGwsYSk7Zm9yKHZhciBmPVtdOzspe3ZhciBnPWEoZSk7aWYoIWcpcmV0dXJuW2YsZV07aWYoZi5wdXNoKGdbMF0pLGU9Z1sxXSwhKGc9YihkLGUpKXx8XCJcIj09Z1sxXSlyZXR1cm5bZixlXTtlPWdbMV19fWZ1bmN0aW9uIGUoYSxiKXtmb3IodmFyIGM9MCxkPTA7ZDxiLmxlbmd0aCYmKCEvXFxzfCwvLnRlc3QoYltkXSl8fDAhPWMpO2QrKylpZihcIihcIj09YltkXSljKys7ZWxzZSBpZihcIilcIj09YltkXSYmKGMtLSwwPT1jJiZkKyssYzw9MCkpYnJlYWs7dmFyIGU9YShiLnN1YnN0cigwLGQpKTtyZXR1cm4gdm9pZCAwPT1lP3ZvaWQgMDpbZSxiLnN1YnN0cihkKV19ZnVuY3Rpb24gZihhLGIpe2Zvcih2YXIgYz1hLGQ9YjtjJiZkOyljPmQ/YyU9ZDpkJT1jO3JldHVybiBjPWEqYi8oYytkKX1mdW5jdGlvbiBnKGEpe3JldHVybiBmdW5jdGlvbihiKXt2YXIgYz1hKGIpO3JldHVybiBjJiYoY1swXT12b2lkIDApLGN9fWZ1bmN0aW9uIGgoYSxiKXtyZXR1cm4gZnVuY3Rpb24oYyl7cmV0dXJuIGEoYyl8fFtiLGNdfX1mdW5jdGlvbiBpKGIsYyl7Zm9yKHZhciBkPVtdLGU9MDtlPGIubGVuZ3RoO2UrKyl7dmFyIGY9YS5jb25zdW1lVHJpbW1lZChiW2VdLGMpO2lmKCFmfHxcIlwiPT1mWzBdKXJldHVybjt2b2lkIDAhPT1mWzBdJiZkLnB1c2goZlswXSksYz1mWzFdfWlmKFwiXCI9PWMpcmV0dXJuIGR9ZnVuY3Rpb24gaihhLGIsYyxkLGUpe2Zvcih2YXIgZz1bXSxoPVtdLGk9W10saj1mKGQubGVuZ3RoLGUubGVuZ3RoKSxrPTA7azxqO2srKyl7dmFyIGw9YihkW2slZC5sZW5ndGhdLGVbayVlLmxlbmd0aF0pO2lmKCFsKXJldHVybjtnLnB1c2gobFswXSksaC5wdXNoKGxbMV0pLGkucHVzaChsWzJdKX1yZXR1cm5bZyxoLGZ1bmN0aW9uKGIpe3ZhciBkPWIubWFwKGZ1bmN0aW9uKGEsYil7cmV0dXJuIGlbYl0oYSl9KS5qb2luKGMpO3JldHVybiBhP2EoZCk6ZH1dfWZ1bmN0aW9uIGsoYSxiLGMpe2Zvcih2YXIgZD1bXSxlPVtdLGY9W10sZz0wLGg9MDtoPGMubGVuZ3RoO2grKylpZihcImZ1bmN0aW9uXCI9PXR5cGVvZiBjW2hdKXt2YXIgaT1jW2hdKGFbZ10sYltnKytdKTtkLnB1c2goaVswXSksZS5wdXNoKGlbMV0pLGYucHVzaChpWzJdKX1lbHNlIWZ1bmN0aW9uKGEpe2QucHVzaCghMSksZS5wdXNoKCExKSxmLnB1c2goZnVuY3Rpb24oKXtyZXR1cm4gY1thXX0pfShoKTtyZXR1cm5bZCxlLGZ1bmN0aW9uKGEpe2Zvcih2YXIgYj1cIlwiLGM9MDtjPGEubGVuZ3RoO2MrKyliKz1mW2NdKGFbY10pO3JldHVybiBifV19YS5jb25zdW1lVG9rZW49YixhLmNvbnN1bWVUcmltbWVkPWMsYS5jb25zdW1lUmVwZWF0ZWQ9ZCxhLmNvbnN1bWVQYXJlbnRoZXNpc2VkPWUsYS5pZ25vcmU9ZyxhLm9wdGlvbmFsPWgsYS5jb25zdW1lTGlzdD1pLGEubWVyZ2VOZXN0ZWRSZXBlYXRlZD1qLmJpbmQobnVsbCxudWxsKSxhLm1lcmdlV3JhcHBlZE5lc3RlZFJlcGVhdGVkPWosYS5tZXJnZUxpc3Q9a30oZCksZnVuY3Rpb24oYSl7ZnVuY3Rpb24gYihiKXtmdW5jdGlvbiBjKGIpe3ZhciBjPWEuY29uc3VtZVRva2VuKC9eaW5zZXQvaSxiKTtpZihjKXJldHVybiBkLmluc2V0PSEwLGM7dmFyIGM9YS5jb25zdW1lTGVuZ3RoT3JQZXJjZW50KGIpO2lmKGMpcmV0dXJuIGQubGVuZ3Rocy5wdXNoKGNbMF0pLGM7dmFyIGM9YS5jb25zdW1lQ29sb3IoYik7cmV0dXJuIGM/KGQuY29sb3I9Y1swXSxjKTp2b2lkIDB9dmFyIGQ9e2luc2V0OiExLGxlbmd0aHM6W10sY29sb3I6bnVsbH0sZT1hLmNvbnN1bWVSZXBlYXRlZChjLC9eLyxiKTtpZihlJiZlWzBdLmxlbmd0aClyZXR1cm5bZCxlWzFdXX1mdW5jdGlvbiBjKGMpe3ZhciBkPWEuY29uc3VtZVJlcGVhdGVkKGIsL14sLyxjKTtpZihkJiZcIlwiPT1kWzFdKXJldHVybiBkWzBdfWZ1bmN0aW9uIGQoYixjKXtmb3IoO2IubGVuZ3Rocy5sZW5ndGg8TWF0aC5tYXgoYi5sZW5ndGhzLmxlbmd0aCxjLmxlbmd0aHMubGVuZ3RoKTspYi5sZW5ndGhzLnB1c2goe3B4OjB9KTtmb3IoO2MubGVuZ3Rocy5sZW5ndGg8TWF0aC5tYXgoYi5sZW5ndGhzLmxlbmd0aCxjLmxlbmd0aHMubGVuZ3RoKTspYy5sZW5ndGhzLnB1c2goe3B4OjB9KTtpZihiLmluc2V0PT1jLmluc2V0JiYhIWIuY29sb3I9PSEhYy5jb2xvcil7Zm9yKHZhciBkLGU9W10sZj1bW10sMF0sZz1bW10sMF0saD0wO2g8Yi5sZW5ndGhzLmxlbmd0aDtoKyspe3ZhciBpPWEubWVyZ2VEaW1lbnNpb25zKGIubGVuZ3Roc1toXSxjLmxlbmd0aHNbaF0sMj09aCk7ZlswXS5wdXNoKGlbMF0pLGdbMF0ucHVzaChpWzFdKSxlLnB1c2goaVsyXSl9aWYoYi5jb2xvciYmYy5jb2xvcil7dmFyIGo9YS5tZXJnZUNvbG9ycyhiLmNvbG9yLGMuY29sb3IpO2ZbMV09alswXSxnWzFdPWpbMV0sZD1qWzJdfXJldHVybltmLGcsZnVuY3Rpb24oYSl7Zm9yKHZhciBjPWIuaW5zZXQ/XCJpbnNldCBcIjpcIiBcIixmPTA7ZjxlLmxlbmd0aDtmKyspYys9ZVtmXShhWzBdW2ZdKStcIiBcIjtyZXR1cm4gZCYmKGMrPWQoYVsxXSkpLGN9XX19ZnVuY3Rpb24gZShiLGMsZCxlKXtmdW5jdGlvbiBmKGEpe3JldHVybntpbnNldDphLGNvbG9yOlswLDAsMCwwXSxsZW5ndGhzOlt7cHg6MH0se3B4OjB9LHtweDowfSx7cHg6MH1dfX1mb3IodmFyIGc9W10saD1bXSxpPTA7aTxkLmxlbmd0aHx8aTxlLmxlbmd0aDtpKyspe3ZhciBqPWRbaV18fGYoZVtpXS5pbnNldCksaz1lW2ldfHxmKGRbaV0uaW5zZXQpO2cucHVzaChqKSxoLnB1c2goayl9cmV0dXJuIGEubWVyZ2VOZXN0ZWRSZXBlYXRlZChiLGMsZyxoKX12YXIgZj1lLmJpbmQobnVsbCxkLFwiLCBcIik7YS5hZGRQcm9wZXJ0aWVzSGFuZGxlcihjLGYsW1wiYm94LXNoYWRvd1wiLFwidGV4dC1zaGFkb3dcIl0pfShkKSxmdW5jdGlvbihhLGIpe2Z1bmN0aW9uIGMoYSl7cmV0dXJuIGEudG9GaXhlZCgzKS5yZXBsYWNlKC8wKyQvLFwiXCIpLnJlcGxhY2UoL1xcLiQvLFwiXCIpfWZ1bmN0aW9uIGQoYSxiLGMpe3JldHVybiBNYXRoLm1pbihiLE1hdGgubWF4KGEsYykpfWZ1bmN0aW9uIGUoYSl7aWYoL15cXHMqWy0rXT8oXFxkKlxcLik/XFxkK1xccyokLy50ZXN0KGEpKXJldHVybiBOdW1iZXIoYSl9ZnVuY3Rpb24gZihhLGIpe3JldHVyblthLGIsY119ZnVuY3Rpb24gZyhhLGIpe2lmKDAhPWEpcmV0dXJuIGkoMCwxLzApKGEsYil9ZnVuY3Rpb24gaChhLGIpe3JldHVyblthLGIsZnVuY3Rpb24oYSl7cmV0dXJuIE1hdGgucm91bmQoZCgxLDEvMCxhKSl9XX1mdW5jdGlvbiBpKGEsYil7cmV0dXJuIGZ1bmN0aW9uKGUsZil7cmV0dXJuW2UsZixmdW5jdGlvbihlKXtyZXR1cm4gYyhkKGEsYixlKSl9XX19ZnVuY3Rpb24gaihhKXt2YXIgYj1hLnRyaW0oKS5zcGxpdCgvXFxzKltcXHMsXVxccyovKTtpZigwIT09Yi5sZW5ndGgpe2Zvcih2YXIgYz1bXSxkPTA7ZDxiLmxlbmd0aDtkKyspe3ZhciBmPWUoYltkXSk7aWYodm9pZCAwPT09ZilyZXR1cm47Yy5wdXNoKGYpfXJldHVybiBjfX1mdW5jdGlvbiBrKGEsYil7aWYoYS5sZW5ndGg9PWIubGVuZ3RoKXJldHVyblthLGIsZnVuY3Rpb24oYSl7cmV0dXJuIGEubWFwKGMpLmpvaW4oXCIgXCIpfV19ZnVuY3Rpb24gbChhLGIpe3JldHVyblthLGIsTWF0aC5yb3VuZF19YS5jbGFtcD1kLGEuYWRkUHJvcGVydGllc0hhbmRsZXIoaixrLFtcInN0cm9rZS1kYXNoYXJyYXlcIl0pLGEuYWRkUHJvcGVydGllc0hhbmRsZXIoZSxpKDAsMS8wKSxbXCJib3JkZXItaW1hZ2Utd2lkdGhcIixcImxpbmUtaGVpZ2h0XCJdKSxhLmFkZFByb3BlcnRpZXNIYW5kbGVyKGUsaSgwLDEpLFtcIm9wYWNpdHlcIixcInNoYXBlLWltYWdlLXRocmVzaG9sZFwiXSksYS5hZGRQcm9wZXJ0aWVzSGFuZGxlcihlLGcsW1wiZmxleC1ncm93XCIsXCJmbGV4LXNocmlua1wiXSksYS5hZGRQcm9wZXJ0aWVzSGFuZGxlcihlLGgsW1wib3JwaGFuc1wiLFwid2lkb3dzXCJdKSxhLmFkZFByb3BlcnRpZXNIYW5kbGVyKGUsbCxbXCJ6LWluZGV4XCJdKSxhLnBhcnNlTnVtYmVyPWUsYS5wYXJzZU51bWJlckxpc3Q9aixhLm1lcmdlTnVtYmVycz1mLGEubnVtYmVyVG9TdHJpbmc9Y30oZCksZnVuY3Rpb24oYSxiKXtmdW5jdGlvbiBjKGEsYil7aWYoXCJ2aXNpYmxlXCI9PWF8fFwidmlzaWJsZVwiPT1iKXJldHVyblswLDEsZnVuY3Rpb24oYyl7cmV0dXJuIGM8PTA/YTpjPj0xP2I6XCJ2aXNpYmxlXCJ9XX1hLmFkZFByb3BlcnRpZXNIYW5kbGVyKFN0cmluZyxjLFtcInZpc2liaWxpdHlcIl0pfShkKSxmdW5jdGlvbihhLGIpe2Z1bmN0aW9uIGMoYSl7YT1hLnRyaW0oKSxmLmZpbGxTdHlsZT1cIiMwMDBcIixmLmZpbGxTdHlsZT1hO3ZhciBiPWYuZmlsbFN0eWxlO2lmKGYuZmlsbFN0eWxlPVwiI2ZmZlwiLGYuZmlsbFN0eWxlPWEsYj09Zi5maWxsU3R5bGUpe2YuZmlsbFJlY3QoMCwwLDEsMSk7dmFyIGM9Zi5nZXRJbWFnZURhdGEoMCwwLDEsMSkuZGF0YTtmLmNsZWFyUmVjdCgwLDAsMSwxKTt2YXIgZD1jWzNdLzI1NTtyZXR1cm5bY1swXSpkLGNbMV0qZCxjWzJdKmQsZF19fWZ1bmN0aW9uIGQoYixjKXtyZXR1cm5bYixjLGZ1bmN0aW9uKGIpe2Z1bmN0aW9uIGMoYSl7cmV0dXJuIE1hdGgubWF4KDAsTWF0aC5taW4oMjU1LGEpKX1pZihiWzNdKWZvcih2YXIgZD0wO2Q8MztkKyspYltkXT1NYXRoLnJvdW5kKGMoYltkXS9iWzNdKSk7cmV0dXJuIGJbM109YS5udW1iZXJUb1N0cmluZyhhLmNsYW1wKDAsMSxiWzNdKSksXCJyZ2JhKFwiK2Iuam9pbihcIixcIikrXCIpXCJ9XX12YXIgZT1kb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sXCIsXCJjYW52YXNcIik7ZS53aWR0aD1lLmhlaWdodD0xO3ZhciBmPWUuZ2V0Q29udGV4dChcIjJkXCIpO2EuYWRkUHJvcGVydGllc0hhbmRsZXIoYyxkLFtcImJhY2tncm91bmQtY29sb3JcIixcImJvcmRlci1ib3R0b20tY29sb3JcIixcImJvcmRlci1sZWZ0LWNvbG9yXCIsXCJib3JkZXItcmlnaHQtY29sb3JcIixcImJvcmRlci10b3AtY29sb3JcIixcImNvbG9yXCIsXCJmaWxsXCIsXCJmbG9vZC1jb2xvclwiLFwibGlnaHRpbmctY29sb3JcIixcIm91dGxpbmUtY29sb3JcIixcInN0b3AtY29sb3JcIixcInN0cm9rZVwiLFwidGV4dC1kZWNvcmF0aW9uLWNvbG9yXCJdKSxhLmNvbnN1bWVDb2xvcj1hLmNvbnN1bWVQYXJlbnRoZXNpc2VkLmJpbmQobnVsbCxjKSxhLm1lcmdlQ29sb3JzPWR9KGQpLGZ1bmN0aW9uKGEsYil7ZnVuY3Rpb24gYyhhKXtmdW5jdGlvbiBiKCl7dmFyIGI9aC5leGVjKGEpO2c9Yj9iWzBdOnZvaWQgMH1mdW5jdGlvbiBjKCl7dmFyIGE9TnVtYmVyKGcpO3JldHVybiBiKCksYX1mdW5jdGlvbiBkKCl7aWYoXCIoXCIhPT1nKXJldHVybiBjKCk7YigpO3ZhciBhPWYoKTtyZXR1cm5cIilcIiE9PWc/TmFOOihiKCksYSl9ZnVuY3Rpb24gZSgpe2Zvcih2YXIgYT1kKCk7XCIqXCI9PT1nfHxcIi9cIj09PWc7KXt2YXIgYz1nO2IoKTt2YXIgZT1kKCk7XCIqXCI9PT1jP2EqPWU6YS89ZX1yZXR1cm4gYX1mdW5jdGlvbiBmKCl7Zm9yKHZhciBhPWUoKTtcIitcIj09PWd8fFwiLVwiPT09Zzspe3ZhciBjPWc7YigpO3ZhciBkPWUoKTtcIitcIj09PWM/YSs9ZDphLT1kfXJldHVybiBhfXZhciBnLGg9LyhbXFwrXFwtXFx3XFwuXSt8W1xcKFxcKVxcKlxcL10pL2c7cmV0dXJuIGIoKSxmKCl9ZnVuY3Rpb24gZChhLGIpe2lmKFwiMFwiPT0oYj1iLnRyaW0oKS50b0xvd2VyQ2FzZSgpKSYmXCJweFwiLnNlYXJjaChhKT49MClyZXR1cm57cHg6MH07aWYoL15bXihdKiR8XmNhbGMvLnRlc3QoYikpe2I9Yi5yZXBsYWNlKC9jYWxjXFwoL2csXCIoXCIpO3ZhciBkPXt9O2I9Yi5yZXBsYWNlKGEsZnVuY3Rpb24oYSl7cmV0dXJuIGRbYV09bnVsbCxcIlVcIithfSk7Zm9yKHZhciBlPVwiVShcIithLnNvdXJjZStcIilcIixmPWIucmVwbGFjZSgvWy0rXT8oXFxkKlxcLik/XFxkKyhbRWVdWy0rXT9cXGQrKT8vZyxcIk5cIikucmVwbGFjZShuZXcgUmVnRXhwKFwiTlwiK2UsXCJnXCIpLFwiRFwiKS5yZXBsYWNlKC9cXHNbKy1dXFxzL2csXCJPXCIpLnJlcGxhY2UoL1xccy9nLFwiXCIpLGc9Wy9OXFwqKEQpL2csLyhOfEQpWypcXC9dTi9nLC8oTnxEKU9cXDEvZywvXFwoKE58RClcXCkvZ10saD0wO2g8Zy5sZW5ndGg7KWdbaF0udGVzdChmKT8oZj1mLnJlcGxhY2UoZ1toXSxcIiQxXCIpLGg9MCk6aCsrO2lmKFwiRFwiPT1mKXtmb3IodmFyIGkgaW4gZCl7dmFyIGo9YyhiLnJlcGxhY2UobmV3IFJlZ0V4cChcIlVcIitpLFwiZ1wiKSxcIlwiKS5yZXBsYWNlKG5ldyBSZWdFeHAoZSxcImdcIiksXCIqMFwiKSk7aWYoIWlzRmluaXRlKGopKXJldHVybjtkW2ldPWp9cmV0dXJuIGR9fX1mdW5jdGlvbiBlKGEsYil7cmV0dXJuIGYoYSxiLCEwKX1mdW5jdGlvbiBmKGIsYyxkKXt2YXIgZSxmPVtdO2ZvcihlIGluIGIpZi5wdXNoKGUpO2ZvcihlIGluIGMpZi5pbmRleE9mKGUpPDAmJmYucHVzaChlKTtyZXR1cm4gYj1mLm1hcChmdW5jdGlvbihhKXtyZXR1cm4gYlthXXx8MH0pLGM9Zi5tYXAoZnVuY3Rpb24oYSl7cmV0dXJuIGNbYV18fDB9KSxbYixjLGZ1bmN0aW9uKGIpe3ZhciBjPWIubWFwKGZ1bmN0aW9uKGMsZSl7cmV0dXJuIDE9PWIubGVuZ3RoJiZkJiYoYz1NYXRoLm1heChjLDApKSxhLm51bWJlclRvU3RyaW5nKGMpK2ZbZV19KS5qb2luKFwiICsgXCIpO3JldHVybiBiLmxlbmd0aD4xP1wiY2FsYyhcIitjK1wiKVwiOmN9XX12YXIgZz1cInB4fGVtfGV4fGNofHJlbXx2d3x2aHx2bWlufHZtYXh8Y218bW18aW58cHR8cGNcIixoPWQuYmluZChudWxsLG5ldyBSZWdFeHAoZyxcImdcIikpLGk9ZC5iaW5kKG51bGwsbmV3IFJlZ0V4cChnK1wifCVcIixcImdcIikpLGo9ZC5iaW5kKG51bGwsL2RlZ3xyYWR8Z3JhZHx0dXJuL2cpO2EucGFyc2VMZW5ndGg9aCxhLnBhcnNlTGVuZ3RoT3JQZXJjZW50PWksYS5jb25zdW1lTGVuZ3RoT3JQZXJjZW50PWEuY29uc3VtZVBhcmVudGhlc2lzZWQuYmluZChudWxsLGkpLGEucGFyc2VBbmdsZT1qLGEubWVyZ2VEaW1lbnNpb25zPWY7dmFyIGs9YS5jb25zdW1lUGFyZW50aGVzaXNlZC5iaW5kKG51bGwsaCksbD1hLmNvbnN1bWVSZXBlYXRlZC5iaW5kKHZvaWQgMCxrLC9eLyksbT1hLmNvbnN1bWVSZXBlYXRlZC5iaW5kKHZvaWQgMCxsLC9eLC8pO2EuY29uc3VtZVNpemVQYWlyTGlzdD1tO3ZhciBuPWZ1bmN0aW9uKGEpe3ZhciBiPW0oYSk7aWYoYiYmXCJcIj09YlsxXSlyZXR1cm4gYlswXX0sbz1hLm1lcmdlTmVzdGVkUmVwZWF0ZWQuYmluZCh2b2lkIDAsZSxcIiBcIikscD1hLm1lcmdlTmVzdGVkUmVwZWF0ZWQuYmluZCh2b2lkIDAsbyxcIixcIik7YS5tZXJnZU5vbk5lZ2F0aXZlU2l6ZVBhaXI9byxhLmFkZFByb3BlcnRpZXNIYW5kbGVyKG4scCxbXCJiYWNrZ3JvdW5kLXNpemVcIl0pLGEuYWRkUHJvcGVydGllc0hhbmRsZXIoaSxlLFtcImJvcmRlci1ib3R0b20td2lkdGhcIixcImJvcmRlci1pbWFnZS13aWR0aFwiLFwiYm9yZGVyLWxlZnQtd2lkdGhcIixcImJvcmRlci1yaWdodC13aWR0aFwiLFwiYm9yZGVyLXRvcC13aWR0aFwiLFwiZmxleC1iYXNpc1wiLFwiZm9udC1zaXplXCIsXCJoZWlnaHRcIixcImxpbmUtaGVpZ2h0XCIsXCJtYXgtaGVpZ2h0XCIsXCJtYXgtd2lkdGhcIixcIm91dGxpbmUtd2lkdGhcIixcIndpZHRoXCJdKSxhLmFkZFByb3BlcnRpZXNIYW5kbGVyKGksZixbXCJib3JkZXItYm90dG9tLWxlZnQtcmFkaXVzXCIsXCJib3JkZXItYm90dG9tLXJpZ2h0LXJhZGl1c1wiLFwiYm9yZGVyLXRvcC1sZWZ0LXJhZGl1c1wiLFwiYm9yZGVyLXRvcC1yaWdodC1yYWRpdXNcIixcImJvdHRvbVwiLFwibGVmdFwiLFwibGV0dGVyLXNwYWNpbmdcIixcIm1hcmdpbi1ib3R0b21cIixcIm1hcmdpbi1sZWZ0XCIsXCJtYXJnaW4tcmlnaHRcIixcIm1hcmdpbi10b3BcIixcIm1pbi1oZWlnaHRcIixcIm1pbi13aWR0aFwiLFwib3V0bGluZS1vZmZzZXRcIixcInBhZGRpbmctYm90dG9tXCIsXCJwYWRkaW5nLWxlZnRcIixcInBhZGRpbmctcmlnaHRcIixcInBhZGRpbmctdG9wXCIsXCJwZXJzcGVjdGl2ZVwiLFwicmlnaHRcIixcInNoYXBlLW1hcmdpblwiLFwic3Ryb2tlLWRhc2hvZmZzZXRcIixcInRleHQtaW5kZW50XCIsXCJ0b3BcIixcInZlcnRpY2FsLWFsaWduXCIsXCJ3b3JkLXNwYWNpbmdcIl0pfShkKSxmdW5jdGlvbihhLGIpe2Z1bmN0aW9uIGMoYil7cmV0dXJuIGEuY29uc3VtZUxlbmd0aE9yUGVyY2VudChiKXx8YS5jb25zdW1lVG9rZW4oL15hdXRvLyxiKX1mdW5jdGlvbiBkKGIpe3ZhciBkPWEuY29uc3VtZUxpc3QoW2EuaWdub3JlKGEuY29uc3VtZVRva2VuLmJpbmQobnVsbCwvXnJlY3QvKSksYS5pZ25vcmUoYS5jb25zdW1lVG9rZW4uYmluZChudWxsLC9eXFwoLykpLGEuY29uc3VtZVJlcGVhdGVkLmJpbmQobnVsbCxjLC9eLC8pLGEuaWdub3JlKGEuY29uc3VtZVRva2VuLmJpbmQobnVsbCwvXlxcKS8pKV0sYik7aWYoZCYmND09ZFswXS5sZW5ndGgpcmV0dXJuIGRbMF19ZnVuY3Rpb24gZShiLGMpe3JldHVyblwiYXV0b1wiPT1ifHxcImF1dG9cIj09Yz9bITAsITEsZnVuY3Rpb24oZCl7dmFyIGU9ZD9iOmM7aWYoXCJhdXRvXCI9PWUpcmV0dXJuXCJhdXRvXCI7dmFyIGY9YS5tZXJnZURpbWVuc2lvbnMoZSxlKTtyZXR1cm4gZlsyXShmWzBdKX1dOmEubWVyZ2VEaW1lbnNpb25zKGIsYyl9ZnVuY3Rpb24gZihhKXtyZXR1cm5cInJlY3QoXCIrYStcIilcIn12YXIgZz1hLm1lcmdlV3JhcHBlZE5lc3RlZFJlcGVhdGVkLmJpbmQobnVsbCxmLGUsXCIsIFwiKTthLnBhcnNlQm94PWQsYS5tZXJnZUJveGVzPWcsYS5hZGRQcm9wZXJ0aWVzSGFuZGxlcihkLGcsW1wiY2xpcFwiXSl9KGQpLGZ1bmN0aW9uKGEsYil7ZnVuY3Rpb24gYyhhKXtyZXR1cm4gZnVuY3Rpb24oYil7dmFyIGM9MDtyZXR1cm4gYS5tYXAoZnVuY3Rpb24oYSl7cmV0dXJuIGE9PT1rP2JbYysrXTphfSl9fWZ1bmN0aW9uIGQoYSl7cmV0dXJuIGF9ZnVuY3Rpb24gZShiKXtpZihcIm5vbmVcIj09KGI9Yi50b0xvd2VyQ2FzZSgpLnRyaW0oKSkpcmV0dXJuW107Zm9yKHZhciBjLGQ9L1xccyooXFx3KylcXCgoW14pXSopXFwpL2csZT1bXSxmPTA7Yz1kLmV4ZWMoYik7KXtpZihjLmluZGV4IT1mKXJldHVybjtmPWMuaW5kZXgrY1swXS5sZW5ndGg7dmFyIGc9Y1sxXSxoPW5bZ107aWYoIWgpcmV0dXJuO3ZhciBpPWNbMl0uc3BsaXQoXCIsXCIpLGo9aFswXTtpZihqLmxlbmd0aDxpLmxlbmd0aClyZXR1cm47Zm9yKHZhciBrPVtdLG89MDtvPGoubGVuZ3RoO28rKyl7dmFyIHAscT1pW29dLHI9altvXTtpZih2b2lkIDA9PT0ocD1xP3tBOmZ1bmN0aW9uKGIpe3JldHVyblwiMFwiPT1iLnRyaW0oKT9tOmEucGFyc2VBbmdsZShiKX0sTjphLnBhcnNlTnVtYmVyLFQ6YS5wYXJzZUxlbmd0aE9yUGVyY2VudCxMOmEucGFyc2VMZW5ndGh9W3IudG9VcHBlckNhc2UoKV0ocSk6e2E6bSxuOmtbMF0sdDpsfVtyXSkpcmV0dXJuO2sucHVzaChwKX1pZihlLnB1c2goe3Q6ZyxkOmt9KSxkLmxhc3RJbmRleD09Yi5sZW5ndGgpcmV0dXJuIGV9fWZ1bmN0aW9uIGYoYSl7cmV0dXJuIGEudG9GaXhlZCg2KS5yZXBsYWNlKFwiLjAwMDAwMFwiLFwiXCIpfWZ1bmN0aW9uIGcoYixjKXtpZihiLmRlY29tcG9zaXRpb25QYWlyIT09Yyl7Yi5kZWNvbXBvc2l0aW9uUGFpcj1jO3ZhciBkPWEubWFrZU1hdHJpeERlY29tcG9zaXRpb24oYil9aWYoYy5kZWNvbXBvc2l0aW9uUGFpciE9PWIpe2MuZGVjb21wb3NpdGlvblBhaXI9Yjt2YXIgZT1hLm1ha2VNYXRyaXhEZWNvbXBvc2l0aW9uKGMpfXJldHVybiBudWxsPT1kWzBdfHxudWxsPT1lWzBdP1tbITFdLFshMF0sZnVuY3Rpb24oYSl7cmV0dXJuIGE/Y1swXS5kOmJbMF0uZH1dOihkWzBdLnB1c2goMCksZVswXS5wdXNoKDEpLFtkLGUsZnVuY3Rpb24oYil7dmFyIGM9YS5xdWF0KGRbMF1bM10sZVswXVszXSxiWzVdKTtyZXR1cm4gYS5jb21wb3NlTWF0cml4KGJbMF0sYlsxXSxiWzJdLGMsYls0XSkubWFwKGYpLmpvaW4oXCIsXCIpfV0pfWZ1bmN0aW9uIGgoYSl7cmV0dXJuIGEucmVwbGFjZSgvW3h5XS8sXCJcIil9ZnVuY3Rpb24gaShhKXtyZXR1cm4gYS5yZXBsYWNlKC8oeHx5fHp8M2QpPyQvLFwiM2RcIil9ZnVuY3Rpb24gaihiLGMpe3ZhciBkPWEubWFrZU1hdHJpeERlY29tcG9zaXRpb24mJiEwLGU9ITE7aWYoIWIubGVuZ3RofHwhYy5sZW5ndGgpe2IubGVuZ3RofHwoZT0hMCxiPWMsYz1bXSk7Zm9yKHZhciBmPTA7ZjxiLmxlbmd0aDtmKyspe3ZhciBqPWJbZl0udCxrPWJbZl0uZCxsPVwic2NhbGVcIj09ai5zdWJzdHIoMCw1KT8xOjA7Yy5wdXNoKHt0OmosZDprLm1hcChmdW5jdGlvbihhKXtpZihcIm51bWJlclwiPT10eXBlb2YgYSlyZXR1cm4gbDt2YXIgYj17fTtmb3IodmFyIGMgaW4gYSliW2NdPWw7cmV0dXJuIGJ9KX0pfX12YXIgbT1mdW5jdGlvbihhLGIpe3JldHVyblwicGVyc3BlY3RpdmVcIj09YSYmXCJwZXJzcGVjdGl2ZVwiPT1ifHwoXCJtYXRyaXhcIj09YXx8XCJtYXRyaXgzZFwiPT1hKSYmKFwibWF0cml4XCI9PWJ8fFwibWF0cml4M2RcIj09Yil9LG89W10scD1bXSxxPVtdO2lmKGIubGVuZ3RoIT1jLmxlbmd0aCl7aWYoIWQpcmV0dXJuO3ZhciByPWcoYixjKTtvPVtyWzBdXSxwPVtyWzFdXSxxPVtbXCJtYXRyaXhcIixbclsyXV1dXX1lbHNlIGZvcih2YXIgZj0wO2Y8Yi5sZW5ndGg7ZisrKXt2YXIgaixzPWJbZl0udCx0PWNbZl0udCx1PWJbZl0uZCx2PWNbZl0uZCx3PW5bc10seD1uW3RdO2lmKG0ocyx0KSl7aWYoIWQpcmV0dXJuO3ZhciByPWcoW2JbZl1dLFtjW2ZdXSk7by5wdXNoKHJbMF0pLHAucHVzaChyWzFdKSxxLnB1c2goW1wibWF0cml4XCIsW3JbMl1dXSl9ZWxzZXtpZihzPT10KWo9cztlbHNlIGlmKHdbMl0mJnhbMl0mJmgocyk9PWgodCkpaj1oKHMpLHU9d1syXSh1KSx2PXhbMl0odik7ZWxzZXtpZighd1sxXXx8IXhbMV18fGkocykhPWkodCkpe2lmKCFkKXJldHVybjt2YXIgcj1nKGIsYyk7bz1bclswXV0scD1bclsxXV0scT1bW1wibWF0cml4XCIsW3JbMl1dXV07YnJlYWt9aj1pKHMpLHU9d1sxXSh1KSx2PXhbMV0odil9Zm9yKHZhciB5PVtdLHo9W10sQT1bXSxCPTA7Qjx1Lmxlbmd0aDtCKyspe3ZhciBDPVwibnVtYmVyXCI9PXR5cGVvZiB1W0JdP2EubWVyZ2VOdW1iZXJzOmEubWVyZ2VEaW1lbnNpb25zLHI9Qyh1W0JdLHZbQl0pO3lbQl09clswXSx6W0JdPXJbMV0sQS5wdXNoKHJbMl0pfW8ucHVzaCh5KSxwLnB1c2goeikscS5wdXNoKFtqLEFdKX19aWYoZSl7dmFyIEQ9bztvPXAscD1EfXJldHVybltvLHAsZnVuY3Rpb24oYSl7cmV0dXJuIGEubWFwKGZ1bmN0aW9uKGEsYil7dmFyIGM9YS5tYXAoZnVuY3Rpb24oYSxjKXtyZXR1cm4gcVtiXVsxXVtjXShhKX0pLmpvaW4oXCIsXCIpO3JldHVyblwibWF0cml4XCI9PXFbYl1bMF0mJjE2PT1jLnNwbGl0KFwiLFwiKS5sZW5ndGgmJihxW2JdWzBdPVwibWF0cml4M2RcIikscVtiXVswXStcIihcIitjK1wiKVwifSkuam9pbihcIiBcIil9XX12YXIgaz1udWxsLGw9e3B4OjB9LG09e2RlZzowfSxuPXttYXRyaXg6W1wiTk5OTk5OXCIsW2ssaywwLDAsayxrLDAsMCwwLDAsMSwwLGssaywwLDFdLGRdLG1hdHJpeDNkOltcIk5OTk5OTk5OTk5OTk5OTk5cIixkXSxyb3RhdGU6W1wiQVwiXSxyb3RhdGV4OltcIkFcIl0scm90YXRleTpbXCJBXCJdLHJvdGF0ZXo6W1wiQVwiXSxyb3RhdGUzZDpbXCJOTk5BXCJdLHBlcnNwZWN0aXZlOltcIkxcIl0sc2NhbGU6W1wiTm5cIixjKFtrLGssMV0pLGRdLHNjYWxleDpbXCJOXCIsYyhbaywxLDFdKSxjKFtrLDFdKV0sc2NhbGV5OltcIk5cIixjKFsxLGssMV0pLGMoWzEsa10pXSxzY2FsZXo6W1wiTlwiLGMoWzEsMSxrXSldLHNjYWxlM2Q6W1wiTk5OXCIsZF0sc2tldzpbXCJBYVwiLG51bGwsZF0sc2tld3g6W1wiQVwiLG51bGwsYyhbayxtXSldLHNrZXd5OltcIkFcIixudWxsLGMoW20sa10pXSx0cmFuc2xhdGU6W1wiVHRcIixjKFtrLGssbF0pLGRdLHRyYW5zbGF0ZXg6W1wiVFwiLGMoW2ssbCxsXSksYyhbayxsXSldLHRyYW5zbGF0ZXk6W1wiVFwiLGMoW2wsayxsXSksYyhbbCxrXSldLHRyYW5zbGF0ZXo6W1wiTFwiLGMoW2wsbCxrXSldLHRyYW5zbGF0ZTNkOltcIlRUTFwiLGRdfTthLmFkZFByb3BlcnRpZXNIYW5kbGVyKGUsaixbXCJ0cmFuc2Zvcm1cIl0pLGEudHJhbnNmb3JtVG9TdmdNYXRyaXg9ZnVuY3Rpb24oYil7dmFyIGM9YS50cmFuc2Zvcm1MaXN0VG9NYXRyaXgoZShiKSk7cmV0dXJuXCJtYXRyaXgoXCIrZihjWzBdKStcIiBcIitmKGNbMV0pK1wiIFwiK2YoY1s0XSkrXCIgXCIrZihjWzVdKStcIiBcIitmKGNbMTJdKStcIiBcIitmKGNbMTNdKStcIilcIn19KGQpLGZ1bmN0aW9uKGEsYil7ZnVuY3Rpb24gYyhhLGIpe2IuY29uY2F0KFthXSkuZm9yRWFjaChmdW5jdGlvbihiKXtiIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZSYmKGRbYV09YiksZVtiXT1hfSl9dmFyIGQ9e30sZT17fTtjKFwidHJhbnNmb3JtXCIsW1wid2Via2l0VHJhbnNmb3JtXCIsXCJtc1RyYW5zZm9ybVwiXSksYyhcInRyYW5zZm9ybU9yaWdpblwiLFtcIndlYmtpdFRyYW5zZm9ybU9yaWdpblwiXSksYyhcInBlcnNwZWN0aXZlXCIsW1wid2Via2l0UGVyc3BlY3RpdmVcIl0pLGMoXCJwZXJzcGVjdGl2ZU9yaWdpblwiLFtcIndlYmtpdFBlcnNwZWN0aXZlT3JpZ2luXCJdKSxhLnByb3BlcnR5TmFtZT1mdW5jdGlvbihhKXtyZXR1cm4gZFthXXx8YX0sYS51bnByZWZpeGVkUHJvcGVydHlOYW1lPWZ1bmN0aW9uKGEpe3JldHVybiBlW2FdfHxhfX0oZCl9KCksZnVuY3Rpb24oKXtpZih2b2lkIDA9PT1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpLmFuaW1hdGUoW10pLm9uY2FuY2VsKXt2YXIgYTtpZih3aW5kb3cucGVyZm9ybWFuY2UmJnBlcmZvcm1hbmNlLm5vdyl2YXIgYT1mdW5jdGlvbigpe3JldHVybiBwZXJmb3JtYW5jZS5ub3coKX07ZWxzZSB2YXIgYT1mdW5jdGlvbigpe3JldHVybiBEYXRlLm5vdygpfTt2YXIgYj1mdW5jdGlvbihhLGIsYyl7dGhpcy50YXJnZXQ9YSx0aGlzLmN1cnJlbnRUaW1lPWIsdGhpcy50aW1lbGluZVRpbWU9Yyx0aGlzLnR5cGU9XCJjYW5jZWxcIix0aGlzLmJ1YmJsZXM9ITEsdGhpcy5jYW5jZWxhYmxlPSExLHRoaXMuY3VycmVudFRhcmdldD1hLHRoaXMuZGVmYXVsdFByZXZlbnRlZD0hMSx0aGlzLmV2ZW50UGhhc2U9RXZlbnQuQVRfVEFSR0VULHRoaXMudGltZVN0YW1wPURhdGUubm93KCl9LGM9d2luZG93LkVsZW1lbnQucHJvdG90eXBlLmFuaW1hdGU7d2luZG93LkVsZW1lbnQucHJvdG90eXBlLmFuaW1hdGU9ZnVuY3Rpb24oZCxlKXt2YXIgZj1jLmNhbGwodGhpcyxkLGUpO2YuX2NhbmNlbEhhbmRsZXJzPVtdLGYub25jYW5jZWw9bnVsbDt2YXIgZz1mLmNhbmNlbDtmLmNhbmNlbD1mdW5jdGlvbigpe2cuY2FsbCh0aGlzKTt2YXIgYz1uZXcgYih0aGlzLG51bGwsYSgpKSxkPXRoaXMuX2NhbmNlbEhhbmRsZXJzLmNvbmNhdCh0aGlzLm9uY2FuY2VsP1t0aGlzLm9uY2FuY2VsXTpbXSk7c2V0VGltZW91dChmdW5jdGlvbigpe2QuZm9yRWFjaChmdW5jdGlvbihhKXthLmNhbGwoYy50YXJnZXQsYyl9KX0sMCl9O3ZhciBoPWYuYWRkRXZlbnRMaXN0ZW5lcjtmLmFkZEV2ZW50TGlzdGVuZXI9ZnVuY3Rpb24oYSxiKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBiJiZcImNhbmNlbFwiPT1hP3RoaXMuX2NhbmNlbEhhbmRsZXJzLnB1c2goYik6aC5jYWxsKHRoaXMsYSxiKX07dmFyIGk9Zi5yZW1vdmVFdmVudExpc3RlbmVyO3JldHVybiBmLnJlbW92ZUV2ZW50TGlzdGVuZXI9ZnVuY3Rpb24oYSxiKXtpZihcImNhbmNlbFwiPT1hKXt2YXIgYz10aGlzLl9jYW5jZWxIYW5kbGVycy5pbmRleE9mKGIpO2M+PTAmJnRoaXMuX2NhbmNlbEhhbmRsZXJzLnNwbGljZShjLDEpfWVsc2UgaS5jYWxsKHRoaXMsYSxiKX0sZn19fSgpLGZ1bmN0aW9uKGEpe3ZhciBiPWRvY3VtZW50LmRvY3VtZW50RWxlbWVudCxjPW51bGwsZD0hMTt0cnl7dmFyIGU9Z2V0Q29tcHV0ZWRTdHlsZShiKS5nZXRQcm9wZXJ0eVZhbHVlKFwib3BhY2l0eVwiKSxmPVwiMFwiPT1lP1wiMVwiOlwiMFwiO2M9Yi5hbmltYXRlKHtvcGFjaXR5OltmLGZdfSx7ZHVyYXRpb246MX0pLGMuY3VycmVudFRpbWU9MCxkPWdldENvbXB1dGVkU3R5bGUoYikuZ2V0UHJvcGVydHlWYWx1ZShcIm9wYWNpdHlcIik9PWZ9Y2F0Y2goYSl7fWZpbmFsbHl7YyYmYy5jYW5jZWwoKX1pZighZCl7dmFyIGc9d2luZG93LkVsZW1lbnQucHJvdG90eXBlLmFuaW1hdGU7d2luZG93LkVsZW1lbnQucHJvdG90eXBlLmFuaW1hdGU9ZnVuY3Rpb24oYixjKXtyZXR1cm4gd2luZG93LlN5bWJvbCYmU3ltYm9sLml0ZXJhdG9yJiZBcnJheS5wcm90b3R5cGUuZnJvbSYmYltTeW1ib2wuaXRlcmF0b3JdJiYoYj1BcnJheS5mcm9tKGIpKSxBcnJheS5pc0FycmF5KGIpfHxudWxsPT09Ynx8KGI9YS5jb252ZXJ0VG9BcnJheUZvcm0oYikpLGcuY2FsbCh0aGlzLGIsYyl9fX0oYyksZnVuY3Rpb24oYSxiLGMpe2Z1bmN0aW9uIGQoYSl7dmFyIGM9Yi50aW1lbGluZTtjLmN1cnJlbnRUaW1lPWEsYy5fZGlzY2FyZEFuaW1hdGlvbnMoKSwwPT1jLl9hbmltYXRpb25zLmxlbmd0aD9mPSExOnJlcXVlc3RBbmltYXRpb25GcmFtZShkKX12YXIgZT13aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lO3dpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWU9ZnVuY3Rpb24oYSl7cmV0dXJuIGUoZnVuY3Rpb24oYyl7Yi50aW1lbGluZS5fdXBkYXRlQW5pbWF0aW9uc1Byb21pc2VzKCksYShjKSxiLnRpbWVsaW5lLl91cGRhdGVBbmltYXRpb25zUHJvbWlzZXMoKX0pfSxiLkFuaW1hdGlvblRpbWVsaW5lPWZ1bmN0aW9uKCl7dGhpcy5fYW5pbWF0aW9ucz1bXSx0aGlzLmN1cnJlbnRUaW1lPXZvaWQgMH0sYi5BbmltYXRpb25UaW1lbGluZS5wcm90b3R5cGU9e2dldEFuaW1hdGlvbnM6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fZGlzY2FyZEFuaW1hdGlvbnMoKSx0aGlzLl9hbmltYXRpb25zLnNsaWNlKCl9LF91cGRhdGVBbmltYXRpb25zUHJvbWlzZXM6ZnVuY3Rpb24oKXtiLmFuaW1hdGlvbnNXaXRoUHJvbWlzZXM9Yi5hbmltYXRpb25zV2l0aFByb21pc2VzLmZpbHRlcihmdW5jdGlvbihhKXtyZXR1cm4gYS5fdXBkYXRlUHJvbWlzZXMoKX0pfSxfZGlzY2FyZEFuaW1hdGlvbnM6ZnVuY3Rpb24oKXt0aGlzLl91cGRhdGVBbmltYXRpb25zUHJvbWlzZXMoKSx0aGlzLl9hbmltYXRpb25zPXRoaXMuX2FuaW1hdGlvbnMuZmlsdGVyKGZ1bmN0aW9uKGEpe3JldHVyblwiZmluaXNoZWRcIiE9YS5wbGF5U3RhdGUmJlwiaWRsZVwiIT1hLnBsYXlTdGF0ZX0pfSxfcGxheTpmdW5jdGlvbihhKXt2YXIgYz1uZXcgYi5BbmltYXRpb24oYSx0aGlzKTtyZXR1cm4gdGhpcy5fYW5pbWF0aW9ucy5wdXNoKGMpLGIucmVzdGFydFdlYkFuaW1hdGlvbnNOZXh0VGljaygpLGMuX3VwZGF0ZVByb21pc2VzKCksYy5fYW5pbWF0aW9uLnBsYXkoKSxjLl91cGRhdGVQcm9taXNlcygpLGN9LHBsYXk6ZnVuY3Rpb24oYSl7cmV0dXJuIGEmJmEucmVtb3ZlKCksdGhpcy5fcGxheShhKX19O3ZhciBmPSExO2IucmVzdGFydFdlYkFuaW1hdGlvbnNOZXh0VGljaz1mdW5jdGlvbigpe2Z8fChmPSEwLHJlcXVlc3RBbmltYXRpb25GcmFtZShkKSl9O3ZhciBnPW5ldyBiLkFuaW1hdGlvblRpbWVsaW5lO2IudGltZWxpbmU9Zzt0cnl7T2JqZWN0LmRlZmluZVByb3BlcnR5KHdpbmRvdy5kb2N1bWVudCxcInRpbWVsaW5lXCIse2NvbmZpZ3VyYWJsZTohMCxnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gZ319KX1jYXRjaChhKXt9dHJ5e3dpbmRvdy5kb2N1bWVudC50aW1lbGluZT1nfWNhdGNoKGEpe319KDAsZSksZnVuY3Rpb24oYSxiLGMpe2IuYW5pbWF0aW9uc1dpdGhQcm9taXNlcz1bXSxiLkFuaW1hdGlvbj1mdW5jdGlvbihiLGMpe2lmKHRoaXMuaWQ9XCJcIixiJiZiLl9pZCYmKHRoaXMuaWQ9Yi5faWQpLHRoaXMuZWZmZWN0PWIsYiYmKGIuX2FuaW1hdGlvbj10aGlzKSwhYyl0aHJvdyBuZXcgRXJyb3IoXCJBbmltYXRpb24gd2l0aCBudWxsIHRpbWVsaW5lIGlzIG5vdCBzdXBwb3J0ZWRcIik7dGhpcy5fdGltZWxpbmU9Yyx0aGlzLl9zZXF1ZW5jZU51bWJlcj1hLnNlcXVlbmNlTnVtYmVyKyssdGhpcy5faG9sZFRpbWU9MCx0aGlzLl9wYXVzZWQ9ITEsdGhpcy5faXNHcm91cD0hMSx0aGlzLl9hbmltYXRpb249bnVsbCx0aGlzLl9jaGlsZEFuaW1hdGlvbnM9W10sdGhpcy5fY2FsbGJhY2s9bnVsbCx0aGlzLl9vbGRQbGF5U3RhdGU9XCJpZGxlXCIsdGhpcy5fcmVidWlsZFVuZGVybHlpbmdBbmltYXRpb24oKSx0aGlzLl9hbmltYXRpb24uY2FuY2VsKCksdGhpcy5fdXBkYXRlUHJvbWlzZXMoKX0sYi5BbmltYXRpb24ucHJvdG90eXBlPXtfdXBkYXRlUHJvbWlzZXM6ZnVuY3Rpb24oKXt2YXIgYT10aGlzLl9vbGRQbGF5U3RhdGUsYj10aGlzLnBsYXlTdGF0ZTtyZXR1cm4gdGhpcy5fcmVhZHlQcm9taXNlJiZiIT09YSYmKFwiaWRsZVwiPT1iPyh0aGlzLl9yZWplY3RSZWFkeVByb21pc2UoKSx0aGlzLl9yZWFkeVByb21pc2U9dm9pZCAwKTpcInBlbmRpbmdcIj09YT90aGlzLl9yZXNvbHZlUmVhZHlQcm9taXNlKCk6XCJwZW5kaW5nXCI9PWImJih0aGlzLl9yZWFkeVByb21pc2U9dm9pZCAwKSksdGhpcy5fZmluaXNoZWRQcm9taXNlJiZiIT09YSYmKFwiaWRsZVwiPT1iPyh0aGlzLl9yZWplY3RGaW5pc2hlZFByb21pc2UoKSx0aGlzLl9maW5pc2hlZFByb21pc2U9dm9pZCAwKTpcImZpbmlzaGVkXCI9PWI/dGhpcy5fcmVzb2x2ZUZpbmlzaGVkUHJvbWlzZSgpOlwiZmluaXNoZWRcIj09YSYmKHRoaXMuX2ZpbmlzaGVkUHJvbWlzZT12b2lkIDApKSx0aGlzLl9vbGRQbGF5U3RhdGU9dGhpcy5wbGF5U3RhdGUsdGhpcy5fcmVhZHlQcm9taXNlfHx0aGlzLl9maW5pc2hlZFByb21pc2V9LF9yZWJ1aWxkVW5kZXJseWluZ0FuaW1hdGlvbjpmdW5jdGlvbigpe3RoaXMuX3VwZGF0ZVByb21pc2VzKCk7dmFyIGEsYyxkLGUsZj0hIXRoaXMuX2FuaW1hdGlvbjtmJiYoYT10aGlzLnBsYXliYWNrUmF0ZSxjPXRoaXMuX3BhdXNlZCxkPXRoaXMuc3RhcnRUaW1lLGU9dGhpcy5jdXJyZW50VGltZSx0aGlzLl9hbmltYXRpb24uY2FuY2VsKCksdGhpcy5fYW5pbWF0aW9uLl93cmFwcGVyPW51bGwsdGhpcy5fYW5pbWF0aW9uPW51bGwpLCghdGhpcy5lZmZlY3R8fHRoaXMuZWZmZWN0IGluc3RhbmNlb2Ygd2luZG93LktleWZyYW1lRWZmZWN0KSYmKHRoaXMuX2FuaW1hdGlvbj1iLm5ld1VuZGVybHlpbmdBbmltYXRpb25Gb3JLZXlmcmFtZUVmZmVjdCh0aGlzLmVmZmVjdCksYi5iaW5kQW5pbWF0aW9uRm9yS2V5ZnJhbWVFZmZlY3QodGhpcykpLCh0aGlzLmVmZmVjdCBpbnN0YW5jZW9mIHdpbmRvdy5TZXF1ZW5jZUVmZmVjdHx8dGhpcy5lZmZlY3QgaW5zdGFuY2VvZiB3aW5kb3cuR3JvdXBFZmZlY3QpJiYodGhpcy5fYW5pbWF0aW9uPWIubmV3VW5kZXJseWluZ0FuaW1hdGlvbkZvckdyb3VwKHRoaXMuZWZmZWN0KSxiLmJpbmRBbmltYXRpb25Gb3JHcm91cCh0aGlzKSksdGhpcy5lZmZlY3QmJnRoaXMuZWZmZWN0Ll9vbnNhbXBsZSYmYi5iaW5kQW5pbWF0aW9uRm9yQ3VzdG9tRWZmZWN0KHRoaXMpLGYmJigxIT1hJiYodGhpcy5wbGF5YmFja1JhdGU9YSksbnVsbCE9PWQ/dGhpcy5zdGFydFRpbWU9ZDpudWxsIT09ZT90aGlzLmN1cnJlbnRUaW1lPWU6bnVsbCE9PXRoaXMuX2hvbGRUaW1lJiYodGhpcy5jdXJyZW50VGltZT10aGlzLl9ob2xkVGltZSksYyYmdGhpcy5wYXVzZSgpKSx0aGlzLl91cGRhdGVQcm9taXNlcygpfSxfdXBkYXRlQ2hpbGRyZW46ZnVuY3Rpb24oKXtpZih0aGlzLmVmZmVjdCYmXCJpZGxlXCIhPXRoaXMucGxheVN0YXRlKXt2YXIgYT10aGlzLmVmZmVjdC5fdGltaW5nLmRlbGF5O3RoaXMuX2NoaWxkQW5pbWF0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKGMpe3RoaXMuX2FycmFuZ2VDaGlsZHJlbihjLGEpLHRoaXMuZWZmZWN0IGluc3RhbmNlb2Ygd2luZG93LlNlcXVlbmNlRWZmZWN0JiYoYSs9Yi5ncm91cENoaWxkRHVyYXRpb24oYy5lZmZlY3QpKX0uYmluZCh0aGlzKSl9fSxfc2V0RXh0ZXJuYWxBbmltYXRpb246ZnVuY3Rpb24oYSl7aWYodGhpcy5lZmZlY3QmJnRoaXMuX2lzR3JvdXApZm9yKHZhciBiPTA7Yjx0aGlzLmVmZmVjdC5jaGlsZHJlbi5sZW5ndGg7YisrKXRoaXMuZWZmZWN0LmNoaWxkcmVuW2JdLl9hbmltYXRpb249YSx0aGlzLl9jaGlsZEFuaW1hdGlvbnNbYl0uX3NldEV4dGVybmFsQW5pbWF0aW9uKGEpfSxfY29uc3RydWN0Q2hpbGRBbmltYXRpb25zOmZ1bmN0aW9uKCl7aWYodGhpcy5lZmZlY3QmJnRoaXMuX2lzR3JvdXApe3ZhciBhPXRoaXMuZWZmZWN0Ll90aW1pbmcuZGVsYXk7dGhpcy5fcmVtb3ZlQ2hpbGRBbmltYXRpb25zKCksdGhpcy5lZmZlY3QuY2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbihjKXt2YXIgZD1iLnRpbWVsaW5lLl9wbGF5KGMpO3RoaXMuX2NoaWxkQW5pbWF0aW9ucy5wdXNoKGQpLGQucGxheWJhY2tSYXRlPXRoaXMucGxheWJhY2tSYXRlLHRoaXMuX3BhdXNlZCYmZC5wYXVzZSgpLGMuX2FuaW1hdGlvbj10aGlzLmVmZmVjdC5fYW5pbWF0aW9uLHRoaXMuX2FycmFuZ2VDaGlsZHJlbihkLGEpLHRoaXMuZWZmZWN0IGluc3RhbmNlb2Ygd2luZG93LlNlcXVlbmNlRWZmZWN0JiYoYSs9Yi5ncm91cENoaWxkRHVyYXRpb24oYykpfS5iaW5kKHRoaXMpKX19LF9hcnJhbmdlQ2hpbGRyZW46ZnVuY3Rpb24oYSxiKXtudWxsPT09dGhpcy5zdGFydFRpbWU/YS5jdXJyZW50VGltZT10aGlzLmN1cnJlbnRUaW1lLWIvdGhpcy5wbGF5YmFja1JhdGU6YS5zdGFydFRpbWUhPT10aGlzLnN0YXJ0VGltZStiL3RoaXMucGxheWJhY2tSYXRlJiYoYS5zdGFydFRpbWU9dGhpcy5zdGFydFRpbWUrYi90aGlzLnBsYXliYWNrUmF0ZSl9LGdldCB0aW1lbGluZSgpe3JldHVybiB0aGlzLl90aW1lbGluZX0sZ2V0IHBsYXlTdGF0ZSgpe3JldHVybiB0aGlzLl9hbmltYXRpb24/dGhpcy5fYW5pbWF0aW9uLnBsYXlTdGF0ZTpcImlkbGVcIn0sZ2V0IGZpbmlzaGVkKCl7cmV0dXJuIHdpbmRvdy5Qcm9taXNlPyh0aGlzLl9maW5pc2hlZFByb21pc2V8fCgtMT09Yi5hbmltYXRpb25zV2l0aFByb21pc2VzLmluZGV4T2YodGhpcykmJmIuYW5pbWF0aW9uc1dpdGhQcm9taXNlcy5wdXNoKHRoaXMpLHRoaXMuX2ZpbmlzaGVkUHJvbWlzZT1uZXcgUHJvbWlzZShmdW5jdGlvbihhLGIpe3RoaXMuX3Jlc29sdmVGaW5pc2hlZFByb21pc2U9ZnVuY3Rpb24oKXthKHRoaXMpfSx0aGlzLl9yZWplY3RGaW5pc2hlZFByb21pc2U9ZnVuY3Rpb24oKXtiKHt0eXBlOkRPTUV4Y2VwdGlvbi5BQk9SVF9FUlIsbmFtZTpcIkFib3J0RXJyb3JcIn0pfX0uYmluZCh0aGlzKSksXCJmaW5pc2hlZFwiPT10aGlzLnBsYXlTdGF0ZSYmdGhpcy5fcmVzb2x2ZUZpbmlzaGVkUHJvbWlzZSgpKSx0aGlzLl9maW5pc2hlZFByb21pc2UpOihjb25zb2xlLndhcm4oXCJBbmltYXRpb24gUHJvbWlzZXMgcmVxdWlyZSBKYXZhU2NyaXB0IFByb21pc2UgY29uc3RydWN0b3JcIiksbnVsbCl9LGdldCByZWFkeSgpe3JldHVybiB3aW5kb3cuUHJvbWlzZT8odGhpcy5fcmVhZHlQcm9taXNlfHwoLTE9PWIuYW5pbWF0aW9uc1dpdGhQcm9taXNlcy5pbmRleE9mKHRoaXMpJiZiLmFuaW1hdGlvbnNXaXRoUHJvbWlzZXMucHVzaCh0aGlzKSx0aGlzLl9yZWFkeVByb21pc2U9bmV3IFByb21pc2UoZnVuY3Rpb24oYSxiKXt0aGlzLl9yZXNvbHZlUmVhZHlQcm9taXNlPWZ1bmN0aW9uKCl7YSh0aGlzKX0sdGhpcy5fcmVqZWN0UmVhZHlQcm9taXNlPWZ1bmN0aW9uKCl7Yih7dHlwZTpET01FeGNlcHRpb24uQUJPUlRfRVJSLG5hbWU6XCJBYm9ydEVycm9yXCJ9KX19LmJpbmQodGhpcykpLFwicGVuZGluZ1wiIT09dGhpcy5wbGF5U3RhdGUmJnRoaXMuX3Jlc29sdmVSZWFkeVByb21pc2UoKSksdGhpcy5fcmVhZHlQcm9taXNlKTooY29uc29sZS53YXJuKFwiQW5pbWF0aW9uIFByb21pc2VzIHJlcXVpcmUgSmF2YVNjcmlwdCBQcm9taXNlIGNvbnN0cnVjdG9yXCIpLG51bGwpfSxnZXQgb25maW5pc2goKXtyZXR1cm4gdGhpcy5fYW5pbWF0aW9uLm9uZmluaXNofSxzZXQgb25maW5pc2goYSl7dGhpcy5fYW5pbWF0aW9uLm9uZmluaXNoPVwiZnVuY3Rpb25cIj09dHlwZW9mIGE/ZnVuY3Rpb24oYil7Yi50YXJnZXQ9dGhpcyxhLmNhbGwodGhpcyxiKX0uYmluZCh0aGlzKTphfSxnZXQgb25jYW5jZWwoKXtyZXR1cm4gdGhpcy5fYW5pbWF0aW9uLm9uY2FuY2VsfSxzZXQgb25jYW5jZWwoYSl7dGhpcy5fYW5pbWF0aW9uLm9uY2FuY2VsPVwiZnVuY3Rpb25cIj09dHlwZW9mIGE/ZnVuY3Rpb24oYil7Yi50YXJnZXQ9dGhpcyxhLmNhbGwodGhpcyxiKX0uYmluZCh0aGlzKTphfSxnZXQgY3VycmVudFRpbWUoKXt0aGlzLl91cGRhdGVQcm9taXNlcygpO3ZhciBhPXRoaXMuX2FuaW1hdGlvbi5jdXJyZW50VGltZTtyZXR1cm4gdGhpcy5fdXBkYXRlUHJvbWlzZXMoKSxhfSxzZXQgY3VycmVudFRpbWUoYSl7dGhpcy5fdXBkYXRlUHJvbWlzZXMoKSx0aGlzLl9hbmltYXRpb24uY3VycmVudFRpbWU9aXNGaW5pdGUoYSk/YTpNYXRoLnNpZ24oYSkqTnVtYmVyLk1BWF9WQUxVRSx0aGlzLl9yZWdpc3RlcigpLHRoaXMuX2ZvckVhY2hDaGlsZChmdW5jdGlvbihiLGMpe2IuY3VycmVudFRpbWU9YS1jfSksdGhpcy5fdXBkYXRlUHJvbWlzZXMoKX0sZ2V0IHN0YXJ0VGltZSgpe3JldHVybiB0aGlzLl9hbmltYXRpb24uc3RhcnRUaW1lfSxzZXQgc3RhcnRUaW1lKGEpe3RoaXMuX3VwZGF0ZVByb21pc2VzKCksdGhpcy5fYW5pbWF0aW9uLnN0YXJ0VGltZT1pc0Zpbml0ZShhKT9hOk1hdGguc2lnbihhKSpOdW1iZXIuTUFYX1ZBTFVFLHRoaXMuX3JlZ2lzdGVyKCksdGhpcy5fZm9yRWFjaENoaWxkKGZ1bmN0aW9uKGIsYyl7Yi5zdGFydFRpbWU9YStjfSksdGhpcy5fdXBkYXRlUHJvbWlzZXMoKX0sZ2V0IHBsYXliYWNrUmF0ZSgpe3JldHVybiB0aGlzLl9hbmltYXRpb24ucGxheWJhY2tSYXRlfSxzZXQgcGxheWJhY2tSYXRlKGEpe3RoaXMuX3VwZGF0ZVByb21pc2VzKCk7dmFyIGI9dGhpcy5jdXJyZW50VGltZTt0aGlzLl9hbmltYXRpb24ucGxheWJhY2tSYXRlPWEsdGhpcy5fZm9yRWFjaENoaWxkKGZ1bmN0aW9uKGIpe2IucGxheWJhY2tSYXRlPWF9KSxudWxsIT09YiYmKHRoaXMuY3VycmVudFRpbWU9YiksdGhpcy5fdXBkYXRlUHJvbWlzZXMoKX0scGxheTpmdW5jdGlvbigpe3RoaXMuX3VwZGF0ZVByb21pc2VzKCksdGhpcy5fcGF1c2VkPSExLHRoaXMuX2FuaW1hdGlvbi5wbGF5KCksLTE9PXRoaXMuX3RpbWVsaW5lLl9hbmltYXRpb25zLmluZGV4T2YodGhpcykmJnRoaXMuX3RpbWVsaW5lLl9hbmltYXRpb25zLnB1c2godGhpcyksdGhpcy5fcmVnaXN0ZXIoKSxiLmF3YWl0U3RhcnRUaW1lKHRoaXMpLHRoaXMuX2ZvckVhY2hDaGlsZChmdW5jdGlvbihhKXt2YXIgYj1hLmN1cnJlbnRUaW1lO2EucGxheSgpLGEuY3VycmVudFRpbWU9Yn0pLHRoaXMuX3VwZGF0ZVByb21pc2VzKCl9LHBhdXNlOmZ1bmN0aW9uKCl7dGhpcy5fdXBkYXRlUHJvbWlzZXMoKSx0aGlzLmN1cnJlbnRUaW1lJiYodGhpcy5faG9sZFRpbWU9dGhpcy5jdXJyZW50VGltZSksdGhpcy5fYW5pbWF0aW9uLnBhdXNlKCksdGhpcy5fcmVnaXN0ZXIoKSx0aGlzLl9mb3JFYWNoQ2hpbGQoZnVuY3Rpb24oYSl7YS5wYXVzZSgpfSksdGhpcy5fcGF1c2VkPSEwLHRoaXMuX3VwZGF0ZVByb21pc2VzKCl9LGZpbmlzaDpmdW5jdGlvbigpe3RoaXMuX3VwZGF0ZVByb21pc2VzKCksdGhpcy5fYW5pbWF0aW9uLmZpbmlzaCgpLHRoaXMuX3JlZ2lzdGVyKCksdGhpcy5fdXBkYXRlUHJvbWlzZXMoKX0sY2FuY2VsOmZ1bmN0aW9uKCl7dGhpcy5fdXBkYXRlUHJvbWlzZXMoKSx0aGlzLl9hbmltYXRpb24uY2FuY2VsKCksdGhpcy5fcmVnaXN0ZXIoKSx0aGlzLl9yZW1vdmVDaGlsZEFuaW1hdGlvbnMoKSx0aGlzLl91cGRhdGVQcm9taXNlcygpfSxyZXZlcnNlOmZ1bmN0aW9uKCl7dGhpcy5fdXBkYXRlUHJvbWlzZXMoKTt2YXIgYT10aGlzLmN1cnJlbnRUaW1lO3RoaXMuX2FuaW1hdGlvbi5yZXZlcnNlKCksdGhpcy5fZm9yRWFjaENoaWxkKGZ1bmN0aW9uKGEpe2EucmV2ZXJzZSgpfSksbnVsbCE9PWEmJih0aGlzLmN1cnJlbnRUaW1lPWEpLHRoaXMuX3VwZGF0ZVByb21pc2VzKCl9LGFkZEV2ZW50TGlzdGVuZXI6ZnVuY3Rpb24oYSxiKXt2YXIgYz1iO1wiZnVuY3Rpb25cIj09dHlwZW9mIGImJihjPWZ1bmN0aW9uKGEpe2EudGFyZ2V0PXRoaXMsYi5jYWxsKHRoaXMsYSl9LmJpbmQodGhpcyksYi5fd3JhcHBlcj1jKSx0aGlzLl9hbmltYXRpb24uYWRkRXZlbnRMaXN0ZW5lcihhLGMpfSxyZW1vdmVFdmVudExpc3RlbmVyOmZ1bmN0aW9uKGEsYil7dGhpcy5fYW5pbWF0aW9uLnJlbW92ZUV2ZW50TGlzdGVuZXIoYSxiJiZiLl93cmFwcGVyfHxiKX0sX3JlbW92ZUNoaWxkQW5pbWF0aW9uczpmdW5jdGlvbigpe2Zvcig7dGhpcy5fY2hpbGRBbmltYXRpb25zLmxlbmd0aDspdGhpcy5fY2hpbGRBbmltYXRpb25zLnBvcCgpLmNhbmNlbCgpfSxfZm9yRWFjaENoaWxkOmZ1bmN0aW9uKGIpe3ZhciBjPTA7aWYodGhpcy5lZmZlY3QuY2hpbGRyZW4mJnRoaXMuX2NoaWxkQW5pbWF0aW9ucy5sZW5ndGg8dGhpcy5lZmZlY3QuY2hpbGRyZW4ubGVuZ3RoJiZ0aGlzLl9jb25zdHJ1Y3RDaGlsZEFuaW1hdGlvbnMoKSx0aGlzLl9jaGlsZEFuaW1hdGlvbnMuZm9yRWFjaChmdW5jdGlvbihhKXtiLmNhbGwodGhpcyxhLGMpLHRoaXMuZWZmZWN0IGluc3RhbmNlb2Ygd2luZG93LlNlcXVlbmNlRWZmZWN0JiYoYys9YS5lZmZlY3QuYWN0aXZlRHVyYXRpb24pfS5iaW5kKHRoaXMpKSxcInBlbmRpbmdcIiE9dGhpcy5wbGF5U3RhdGUpe3ZhciBkPXRoaXMuZWZmZWN0Ll90aW1pbmcsZT10aGlzLmN1cnJlbnRUaW1lO251bGwhPT1lJiYoZT1hLmNhbGN1bGF0ZUl0ZXJhdGlvblByb2dyZXNzKGEuY2FsY3VsYXRlQWN0aXZlRHVyYXRpb24oZCksZSxkKSksKG51bGw9PWV8fGlzTmFOKGUpKSYmdGhpcy5fcmVtb3ZlQ2hpbGRBbmltYXRpb25zKCl9fX0sd2luZG93LkFuaW1hdGlvbj1iLkFuaW1hdGlvbn0oYyxlKSxmdW5jdGlvbihhLGIsYyl7ZnVuY3Rpb24gZChiKXt0aGlzLl9mcmFtZXM9YS5ub3JtYWxpemVLZXlmcmFtZXMoYil9ZnVuY3Rpb24gZSgpe2Zvcih2YXIgYT0hMTtpLmxlbmd0aDspaS5zaGlmdCgpLl91cGRhdGVDaGlsZHJlbigpLGE9ITA7cmV0dXJuIGF9dmFyIGY9ZnVuY3Rpb24oYSl7aWYoYS5fYW5pbWF0aW9uPXZvaWQgMCxhIGluc3RhbmNlb2Ygd2luZG93LlNlcXVlbmNlRWZmZWN0fHxhIGluc3RhbmNlb2Ygd2luZG93Lkdyb3VwRWZmZWN0KWZvcih2YXIgYj0wO2I8YS5jaGlsZHJlbi5sZW5ndGg7YisrKWYoYS5jaGlsZHJlbltiXSl9O2IucmVtb3ZlTXVsdGk9ZnVuY3Rpb24oYSl7Zm9yKHZhciBiPVtdLGM9MDtjPGEubGVuZ3RoO2MrKyl7dmFyIGQ9YVtjXTtkLl9wYXJlbnQ/KC0xPT1iLmluZGV4T2YoZC5fcGFyZW50KSYmYi5wdXNoKGQuX3BhcmVudCksZC5fcGFyZW50LmNoaWxkcmVuLnNwbGljZShkLl9wYXJlbnQuY2hpbGRyZW4uaW5kZXhPZihkKSwxKSxkLl9wYXJlbnQ9bnVsbCxmKGQpKTpkLl9hbmltYXRpb24mJmQuX2FuaW1hdGlvbi5lZmZlY3Q9PWQmJihkLl9hbmltYXRpb24uY2FuY2VsKCksZC5fYW5pbWF0aW9uLmVmZmVjdD1uZXcgS2V5ZnJhbWVFZmZlY3QobnVsbCxbXSksZC5fYW5pbWF0aW9uLl9jYWxsYmFjayYmKGQuX2FuaW1hdGlvbi5fY2FsbGJhY2suX2FuaW1hdGlvbj1udWxsKSxkLl9hbmltYXRpb24uX3JlYnVpbGRVbmRlcmx5aW5nQW5pbWF0aW9uKCksZihkKSl9Zm9yKGM9MDtjPGIubGVuZ3RoO2MrKyliW2NdLl9yZWJ1aWxkKCl9LGIuS2V5ZnJhbWVFZmZlY3Q9ZnVuY3Rpb24oYixjLGUsZil7cmV0dXJuIHRoaXMudGFyZ2V0PWIsdGhpcy5fcGFyZW50PW51bGwsZT1hLm51bWVyaWNUaW1pbmdUb09iamVjdChlKSx0aGlzLl90aW1pbmdJbnB1dD1hLmNsb25lVGltaW5nSW5wdXQoZSksdGhpcy5fdGltaW5nPWEubm9ybWFsaXplVGltaW5nSW5wdXQoZSksdGhpcy50aW1pbmc9YS5tYWtlVGltaW5nKGUsITEsdGhpcyksdGhpcy50aW1pbmcuX2VmZmVjdD10aGlzLFwiZnVuY3Rpb25cIj09dHlwZW9mIGM/KGEuZGVwcmVjYXRlZChcIkN1c3RvbSBLZXlmcmFtZUVmZmVjdFwiLFwiMjAxNS0wNi0yMlwiLFwiVXNlIEtleWZyYW1lRWZmZWN0Lm9uc2FtcGxlIGluc3RlYWQuXCIpLHRoaXMuX25vcm1hbGl6ZWRLZXlmcmFtZXM9Yyk6dGhpcy5fbm9ybWFsaXplZEtleWZyYW1lcz1uZXcgZChjKSx0aGlzLl9rZXlmcmFtZXM9Yyx0aGlzLmFjdGl2ZUR1cmF0aW9uPWEuY2FsY3VsYXRlQWN0aXZlRHVyYXRpb24odGhpcy5fdGltaW5nKSx0aGlzLl9pZD1mLHRoaXN9LGIuS2V5ZnJhbWVFZmZlY3QucHJvdG90eXBlPXtnZXRGcmFtZXM6ZnVuY3Rpb24oKXtyZXR1cm5cImZ1bmN0aW9uXCI9PXR5cGVvZiB0aGlzLl9ub3JtYWxpemVkS2V5ZnJhbWVzP3RoaXMuX25vcm1hbGl6ZWRLZXlmcmFtZXM6dGhpcy5fbm9ybWFsaXplZEtleWZyYW1lcy5fZnJhbWVzfSxzZXQgb25zYW1wbGUoYSl7aWYoXCJmdW5jdGlvblwiPT10eXBlb2YgdGhpcy5nZXRGcmFtZXMoKSl0aHJvdyBuZXcgRXJyb3IoXCJTZXR0aW5nIG9uc2FtcGxlIG9uIGN1c3RvbSBlZmZlY3QgS2V5ZnJhbWVFZmZlY3QgaXMgbm90IHN1cHBvcnRlZC5cIik7dGhpcy5fb25zYW1wbGU9YSx0aGlzLl9hbmltYXRpb24mJnRoaXMuX2FuaW1hdGlvbi5fcmVidWlsZFVuZGVybHlpbmdBbmltYXRpb24oKX0sZ2V0IHBhcmVudCgpe3JldHVybiB0aGlzLl9wYXJlbnR9LGNsb25lOmZ1bmN0aW9uKCl7aWYoXCJmdW5jdGlvblwiPT10eXBlb2YgdGhpcy5nZXRGcmFtZXMoKSl0aHJvdyBuZXcgRXJyb3IoXCJDbG9uaW5nIGN1c3RvbSBlZmZlY3RzIGlzIG5vdCBzdXBwb3J0ZWQuXCIpO3ZhciBiPW5ldyBLZXlmcmFtZUVmZmVjdCh0aGlzLnRhcmdldCxbXSxhLmNsb25lVGltaW5nSW5wdXQodGhpcy5fdGltaW5nSW5wdXQpLHRoaXMuX2lkKTtyZXR1cm4gYi5fbm9ybWFsaXplZEtleWZyYW1lcz10aGlzLl9ub3JtYWxpemVkS2V5ZnJhbWVzLGIuX2tleWZyYW1lcz10aGlzLl9rZXlmcmFtZXMsYn0scmVtb3ZlOmZ1bmN0aW9uKCl7Yi5yZW1vdmVNdWx0aShbdGhpc10pfX07dmFyIGc9RWxlbWVudC5wcm90b3R5cGUuYW5pbWF0ZTtFbGVtZW50LnByb3RvdHlwZS5hbmltYXRlPWZ1bmN0aW9uKGEsYyl7dmFyIGQ9XCJcIjtyZXR1cm4gYyYmYy5pZCYmKGQ9Yy5pZCksYi50aW1lbGluZS5fcGxheShuZXcgYi5LZXlmcmFtZUVmZmVjdCh0aGlzLGEsYyxkKSl9O3ZhciBoPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWxcIixcImRpdlwiKTtiLm5ld1VuZGVybHlpbmdBbmltYXRpb25Gb3JLZXlmcmFtZUVmZmVjdD1mdW5jdGlvbihhKXtpZihhKXt2YXIgYj1hLnRhcmdldHx8aCxjPWEuX2tleWZyYW1lcztcImZ1bmN0aW9uXCI9PXR5cGVvZiBjJiYoYz1bXSk7dmFyIGQ9YS5fdGltaW5nSW5wdXQ7ZC5pZD1hLl9pZH1lbHNlIHZhciBiPWgsYz1bXSxkPTA7cmV0dXJuIGcuYXBwbHkoYixbYyxkXSl9LGIuYmluZEFuaW1hdGlvbkZvcktleWZyYW1lRWZmZWN0PWZ1bmN0aW9uKGEpe2EuZWZmZWN0JiZcImZ1bmN0aW9uXCI9PXR5cGVvZiBhLmVmZmVjdC5fbm9ybWFsaXplZEtleWZyYW1lcyYmYi5iaW5kQW5pbWF0aW9uRm9yQ3VzdG9tRWZmZWN0KGEpfTt2YXIgaT1bXTtiLmF3YWl0U3RhcnRUaW1lPWZ1bmN0aW9uKGEpe251bGw9PT1hLnN0YXJ0VGltZSYmYS5faXNHcm91cCYmKDA9PWkubGVuZ3RoJiZyZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZSksaS5wdXNoKGEpKX07dmFyIGo9d2luZG93LmdldENvbXB1dGVkU3R5bGU7T2JqZWN0LmRlZmluZVByb3BlcnR5KHdpbmRvdyxcImdldENvbXB1dGVkU3R5bGVcIix7Y29uZmlndXJhYmxlOiEwLGVudW1lcmFibGU6ITAsdmFsdWU6ZnVuY3Rpb24oKXtiLnRpbWVsaW5lLl91cGRhdGVBbmltYXRpb25zUHJvbWlzZXMoKTt2YXIgYT1qLmFwcGx5KHRoaXMsYXJndW1lbnRzKTtyZXR1cm4gZSgpJiYoYT1qLmFwcGx5KHRoaXMsYXJndW1lbnRzKSksYi50aW1lbGluZS5fdXBkYXRlQW5pbWF0aW9uc1Byb21pc2VzKCksYX19KSx3aW5kb3cuS2V5ZnJhbWVFZmZlY3Q9Yi5LZXlmcmFtZUVmZmVjdCx3aW5kb3cuRWxlbWVudC5wcm90b3R5cGUuZ2V0QW5pbWF0aW9ucz1mdW5jdGlvbigpe3JldHVybiBkb2N1bWVudC50aW1lbGluZS5nZXRBbmltYXRpb25zKCkuZmlsdGVyKGZ1bmN0aW9uKGEpe3JldHVybiBudWxsIT09YS5lZmZlY3QmJmEuZWZmZWN0LnRhcmdldD09dGhpc30uYmluZCh0aGlzKSl9fShjLGUpLGZ1bmN0aW9uKGEsYixjKXtmdW5jdGlvbiBkKGEpe2EuX3JlZ2lzdGVyZWR8fChhLl9yZWdpc3RlcmVkPSEwLGcucHVzaChhKSxofHwoaD0hMCxyZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZSkpKX1mdW5jdGlvbiBlKGEpe3ZhciBiPWc7Zz1bXSxiLnNvcnQoZnVuY3Rpb24oYSxiKXtyZXR1cm4gYS5fc2VxdWVuY2VOdW1iZXItYi5fc2VxdWVuY2VOdW1iZXJ9KSxiPWIuZmlsdGVyKGZ1bmN0aW9uKGEpe2EoKTt2YXIgYj1hLl9hbmltYXRpb24/YS5fYW5pbWF0aW9uLnBsYXlTdGF0ZTpcImlkbGVcIjtyZXR1cm5cInJ1bm5pbmdcIiE9YiYmXCJwZW5kaW5nXCIhPWImJihhLl9yZWdpc3RlcmVkPSExKSxhLl9yZWdpc3RlcmVkfSksZy5wdXNoLmFwcGx5KGcsYiksZy5sZW5ndGg/KGg9ITAscmVxdWVzdEFuaW1hdGlvbkZyYW1lKGUpKTpoPSExfXZhciBmPShkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sXCIsXCJkaXZcIiksMCk7Yi5iaW5kQW5pbWF0aW9uRm9yQ3VzdG9tRWZmZWN0PWZ1bmN0aW9uKGIpe3ZhciBjLGU9Yi5lZmZlY3QudGFyZ2V0LGc9XCJmdW5jdGlvblwiPT10eXBlb2YgYi5lZmZlY3QuZ2V0RnJhbWVzKCk7Yz1nP2IuZWZmZWN0LmdldEZyYW1lcygpOmIuZWZmZWN0Ll9vbnNhbXBsZTt2YXIgaD1iLmVmZmVjdC50aW1pbmcsaT1udWxsO2g9YS5ub3JtYWxpemVUaW1pbmdJbnB1dChoKTt2YXIgaj1mdW5jdGlvbigpe3ZhciBkPWouX2FuaW1hdGlvbj9qLl9hbmltYXRpb24uY3VycmVudFRpbWU6bnVsbDtudWxsIT09ZCYmKGQ9YS5jYWxjdWxhdGVJdGVyYXRpb25Qcm9ncmVzcyhhLmNhbGN1bGF0ZUFjdGl2ZUR1cmF0aW9uKGgpLGQsaCksaXNOYU4oZCkmJihkPW51bGwpKSxkIT09aSYmKGc/YyhkLGUsYi5lZmZlY3QpOmMoZCxiLmVmZmVjdCxiLmVmZmVjdC5fYW5pbWF0aW9uKSksaT1kfTtqLl9hbmltYXRpb249YixqLl9yZWdpc3RlcmVkPSExLGouX3NlcXVlbmNlTnVtYmVyPWYrKyxiLl9jYWxsYmFjaz1qLGQoail9O3ZhciBnPVtdLGg9ITE7Yi5BbmltYXRpb24ucHJvdG90eXBlLl9yZWdpc3Rlcj1mdW5jdGlvbigpe3RoaXMuX2NhbGxiYWNrJiZkKHRoaXMuX2NhbGxiYWNrKX19KGMsZSksZnVuY3Rpb24oYSxiLGMpe2Z1bmN0aW9uIGQoYSl7cmV0dXJuIGEuX3RpbWluZy5kZWxheSthLmFjdGl2ZUR1cmF0aW9uK2EuX3RpbWluZy5lbmREZWxheX1mdW5jdGlvbiBlKGIsYyxkKXt0aGlzLl9pZD1kLHRoaXMuX3BhcmVudD1udWxsLHRoaXMuY2hpbGRyZW49Ynx8W10sdGhpcy5fcmVwYXJlbnQodGhpcy5jaGlsZHJlbiksYz1hLm51bWVyaWNUaW1pbmdUb09iamVjdChjKSx0aGlzLl90aW1pbmdJbnB1dD1hLmNsb25lVGltaW5nSW5wdXQoYyksdGhpcy5fdGltaW5nPWEubm9ybWFsaXplVGltaW5nSW5wdXQoYywhMCksdGhpcy50aW1pbmc9YS5tYWtlVGltaW5nKGMsITAsdGhpcyksdGhpcy50aW1pbmcuX2VmZmVjdD10aGlzLFwiYXV0b1wiPT09dGhpcy5fdGltaW5nLmR1cmF0aW9uJiYodGhpcy5fdGltaW5nLmR1cmF0aW9uPXRoaXMuYWN0aXZlRHVyYXRpb24pfXdpbmRvdy5TZXF1ZW5jZUVmZmVjdD1mdW5jdGlvbigpe2UuYXBwbHkodGhpcyxhcmd1bWVudHMpfSx3aW5kb3cuR3JvdXBFZmZlY3Q9ZnVuY3Rpb24oKXtlLmFwcGx5KHRoaXMsYXJndW1lbnRzKX0sZS5wcm90b3R5cGU9e19pc0FuY2VzdG9yOmZ1bmN0aW9uKGEpe2Zvcih2YXIgYj10aGlzO251bGwhPT1iOyl7aWYoYj09YSlyZXR1cm4hMDtiPWIuX3BhcmVudH1yZXR1cm4hMX0sX3JlYnVpbGQ6ZnVuY3Rpb24oKXtmb3IodmFyIGE9dGhpczthOylcImF1dG9cIj09PWEudGltaW5nLmR1cmF0aW9uJiYoYS5fdGltaW5nLmR1cmF0aW9uPWEuYWN0aXZlRHVyYXRpb24pLGE9YS5fcGFyZW50O3RoaXMuX2FuaW1hdGlvbiYmdGhpcy5fYW5pbWF0aW9uLl9yZWJ1aWxkVW5kZXJseWluZ0FuaW1hdGlvbigpfSxfcmVwYXJlbnQ6ZnVuY3Rpb24oYSl7Yi5yZW1vdmVNdWx0aShhKTtmb3IodmFyIGM9MDtjPGEubGVuZ3RoO2MrKylhW2NdLl9wYXJlbnQ9dGhpc30sX3B1dENoaWxkOmZ1bmN0aW9uKGEsYil7Zm9yKHZhciBjPWI/XCJDYW5ub3QgYXBwZW5kIGFuIGFuY2VzdG9yIG9yIHNlbGZcIjpcIkNhbm5vdCBwcmVwZW5kIGFuIGFuY2VzdG9yIG9yIHNlbGZcIixkPTA7ZDxhLmxlbmd0aDtkKyspaWYodGhpcy5faXNBbmNlc3RvcihhW2RdKSl0aHJvd3t0eXBlOkRPTUV4Y2VwdGlvbi5ISUVSQVJDSFlfUkVRVUVTVF9FUlIsbmFtZTpcIkhpZXJhcmNoeVJlcXVlc3RFcnJvclwiLG1lc3NhZ2U6Y307Zm9yKHZhciBkPTA7ZDxhLmxlbmd0aDtkKyspYj90aGlzLmNoaWxkcmVuLnB1c2goYVtkXSk6dGhpcy5jaGlsZHJlbi51bnNoaWZ0KGFbZF0pO3RoaXMuX3JlcGFyZW50KGEpLHRoaXMuX3JlYnVpbGQoKX0sYXBwZW5kOmZ1bmN0aW9uKCl7dGhpcy5fcHV0Q2hpbGQoYXJndW1lbnRzLCEwKX0scHJlcGVuZDpmdW5jdGlvbigpe3RoaXMuX3B1dENoaWxkKGFyZ3VtZW50cywhMSl9LGdldCBwYXJlbnQoKXtyZXR1cm4gdGhpcy5fcGFyZW50fSxnZXQgZmlyc3RDaGlsZCgpe3JldHVybiB0aGlzLmNoaWxkcmVuLmxlbmd0aD90aGlzLmNoaWxkcmVuWzBdOm51bGx9LGdldCBsYXN0Q2hpbGQoKXtyZXR1cm4gdGhpcy5jaGlsZHJlbi5sZW5ndGg/dGhpcy5jaGlsZHJlblt0aGlzLmNoaWxkcmVuLmxlbmd0aC0xXTpudWxsfSxjbG9uZTpmdW5jdGlvbigpe2Zvcih2YXIgYj1hLmNsb25lVGltaW5nSW5wdXQodGhpcy5fdGltaW5nSW5wdXQpLGM9W10sZD0wO2Q8dGhpcy5jaGlsZHJlbi5sZW5ndGg7ZCsrKWMucHVzaCh0aGlzLmNoaWxkcmVuW2RdLmNsb25lKCkpO3JldHVybiB0aGlzIGluc3RhbmNlb2YgR3JvdXBFZmZlY3Q/bmV3IEdyb3VwRWZmZWN0KGMsYik6bmV3IFNlcXVlbmNlRWZmZWN0KGMsYil9LHJlbW92ZTpmdW5jdGlvbigpe2IucmVtb3ZlTXVsdGkoW3RoaXNdKX19LHdpbmRvdy5TZXF1ZW5jZUVmZmVjdC5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShlLnByb3RvdHlwZSksT2JqZWN0LmRlZmluZVByb3BlcnR5KHdpbmRvdy5TZXF1ZW5jZUVmZmVjdC5wcm90b3R5cGUsXCJhY3RpdmVEdXJhdGlvblwiLHtnZXQ6ZnVuY3Rpb24oKXt2YXIgYT0wO3JldHVybiB0aGlzLmNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24oYil7YSs9ZChiKX0pLE1hdGgubWF4KGEsMCl9fSksd2luZG93Lkdyb3VwRWZmZWN0LnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGUucHJvdG90eXBlKSxPYmplY3QuZGVmaW5lUHJvcGVydHkod2luZG93Lkdyb3VwRWZmZWN0LnByb3RvdHlwZSxcImFjdGl2ZUR1cmF0aW9uXCIse2dldDpmdW5jdGlvbigpe3ZhciBhPTA7cmV0dXJuIHRoaXMuY2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbihiKXthPU1hdGgubWF4KGEsZChiKSl9KSxhfX0pLGIubmV3VW5kZXJseWluZ0FuaW1hdGlvbkZvckdyb3VwPWZ1bmN0aW9uKGMpe3ZhciBkLGU9bnVsbCxmPWZ1bmN0aW9uKGIpe3ZhciBjPWQuX3dyYXBwZXI7aWYoYyYmXCJwZW5kaW5nXCIhPWMucGxheVN0YXRlJiZjLmVmZmVjdClyZXR1cm4gbnVsbD09Yj92b2lkIGMuX3JlbW92ZUNoaWxkQW5pbWF0aW9ucygpOjA9PWImJmMucGxheWJhY2tSYXRlPDAmJihlfHwoZT1hLm5vcm1hbGl6ZVRpbWluZ0lucHV0KGMuZWZmZWN0LnRpbWluZykpLGI9YS5jYWxjdWxhdGVJdGVyYXRpb25Qcm9ncmVzcyhhLmNhbGN1bGF0ZUFjdGl2ZUR1cmF0aW9uKGUpLC0xLGUpLGlzTmFOKGIpfHxudWxsPT1iKT8oYy5fZm9yRWFjaENoaWxkKGZ1bmN0aW9uKGEpe2EuY3VycmVudFRpbWU9LTF9KSx2b2lkIGMuX3JlbW92ZUNoaWxkQW5pbWF0aW9ucygpKTp2b2lkIDB9LGc9bmV3IEtleWZyYW1lRWZmZWN0KG51bGwsW10sYy5fdGltaW5nLGMuX2lkKTtyZXR1cm4gZy5vbnNhbXBsZT1mLGQ9Yi50aW1lbGluZS5fcGxheShnKX0sYi5iaW5kQW5pbWF0aW9uRm9yR3JvdXA9ZnVuY3Rpb24oYSl7YS5fYW5pbWF0aW9uLl93cmFwcGVyPWEsYS5faXNHcm91cD0hMCxiLmF3YWl0U3RhcnRUaW1lKGEpLGEuX2NvbnN0cnVjdENoaWxkQW5pbWF0aW9ucygpLGEuX3NldEV4dGVybmFsQW5pbWF0aW9uKGEpfSxiLmdyb3VwQ2hpbGREdXJhdGlvbj1kfShjLGUpLGIudHJ1ZT1hfSh7fSxmdW5jdGlvbigpe3JldHVybiB0aGlzfSgpKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXdlYi1hbmltYXRpb25zLW5leHQtbGl0ZS5taW4uanMubWFwXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvd2ViLWFuaW1hdGlvbnMtanMvd2ViLWFuaW1hdGlvbnMtbmV4dC1saXRlLm1pbi5qc1xuLy8gbW9kdWxlIGlkID0gLi9ub2RlX21vZHVsZXMvd2ViLWFuaW1hdGlvbnMtanMvd2ViLWFuaW1hdGlvbnMtbmV4dC1saXRlLm1pbi5qc1xuLy8gbW9kdWxlIGNodW5rcyA9IG1haW4iLCJ2YXIgZztcblxuLy8gVGhpcyB3b3JrcyBpbiBub24tc3RyaWN0IG1vZGVcbmcgPSAoZnVuY3Rpb24oKSB7XG5cdHJldHVybiB0aGlzO1xufSkoKTtcblxudHJ5IHtcblx0Ly8gVGhpcyB3b3JrcyBpZiBldmFsIGlzIGFsbG93ZWQgKHNlZSBDU1ApXG5cdGcgPSBnIHx8IEZ1bmN0aW9uKFwicmV0dXJuIHRoaXNcIikoKSB8fCAoMSxldmFsKShcInRoaXNcIik7XG59IGNhdGNoKGUpIHtcblx0Ly8gVGhpcyB3b3JrcyBpZiB0aGUgd2luZG93IHJlZmVyZW5jZSBpcyBhdmFpbGFibGVcblx0aWYodHlwZW9mIHdpbmRvdyA9PT0gXCJvYmplY3RcIilcblx0XHRnID0gd2luZG93O1xufVxuXG4vLyBnIGNhbiBzdGlsbCBiZSB1bmRlZmluZWQsIGJ1dCBub3RoaW5nIHRvIGRvIGFib3V0IGl0Li4uXG4vLyBXZSByZXR1cm4gdW5kZWZpbmVkLCBpbnN0ZWFkIG9mIG5vdGhpbmcgaGVyZSwgc28gaXQnc1xuLy8gZWFzaWVyIHRvIGhhbmRsZSB0aGlzIGNhc2UuIGlmKCFnbG9iYWwpIHsgLi4ufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGc7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAod2VicGFjaykvYnVpbGRpbi9nbG9iYWwuanNcbi8vIG1vZHVsZSBpZCA9IC4vbm9kZV9tb2R1bGVzL3dlYnBhY2svYnVpbGRpbi9nbG9iYWwuanNcbi8vIG1vZHVsZSBjaHVua3MgPSBtYWluIiwiLy8gcmVtb3ZlZCBieSBleHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9tYWluLmNzc1xuLy8gbW9kdWxlIGlkID0gLi9zcmMvbWFpbi5jc3Ncbi8vIG1vZHVsZSBjaHVua3MgPSBtYWluIiwiaW1wb3J0ICd3ZWItYW5pbWF0aW9ucy1qcy93ZWItYW5pbWF0aW9ucy1uZXh0LWxpdGUubWluJztcclxuaW1wb3J0IHJlbmRlcmVyIGZyb20gJ0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS92ZG9tJztcclxuaW1wb3J0IHsgdyB9IGZyb20gJ0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9kJztcclxuaW1wb3J0ICdAZG9qby90aGVtZXMvZG9qby9pbmRleC5jc3MnO1xyXG5cclxuaW1wb3J0IEFwcCBmcm9tICcuL3dpZGdldHMvQXBwJztcclxuXHJcbmNvbnN0IHIgPSByZW5kZXJlcigoKSA9PiB3KEFwcCwge30pKTtcclxuci5tb3VudCgpO1xyXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9ub2RlX21vZHVsZXMvQGRvam8vd2VicGFjay1jb250cmliL2Nzcy1tb2R1bGUtZHRzLWxvYWRlcj90eXBlPXRzJmluc3RhbmNlTmFtZT0wX2Rvam8hLi9zcmMvbWFpbi50cyIsImltcG9ydCB7IHYsIHcgfSBmcm9tICdAZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvZCc7XHJcbmltcG9ydCBXaWRnZXRCYXNlIGZyb20gJ0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9XaWRnZXRCYXNlJztcclxuXHJcbmltcG9ydCB7IENhdCB9IGZyb20gJy4vQ2F0JztcclxuaW1wb3J0IHsgRG9nIH0gZnJvbSAnLi9Eb2cnO1xyXG5pbXBvcnQgKiBhcyBjc3MgZnJvbSAnLi9zdHlsZXMvYXBwLm0uY3NzJztcclxuaW1wb3J0IHsgQ29yZUF1ZGlvIH0gZnJvbSAnLi9Db3JlQXVkaW8nO1xyXG5pbXBvcnQgU2xpZGVyIGZyb20gJ0Bkb2pvL3dpZGdldHMvc2xpZGVyJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFwcCBleHRlbmRzIFdpZGdldEJhc2Uge1xyXG5cdHByaXZhdGUgY29yZUF1ZGlvID0gbmV3IENvcmVBdWRpbygpO1xyXG5cdHByaXZhdGUgY2hvaWNlOiBzdHJpbmcgPSAnJztcclxuXHRwcml2YXRlIGV4Y2l0ZWRWYWx1ZSA9IDE7XHJcblx0cHJpdmF0ZSBwbGF5aW5nID0gZmFsc2U7XHJcblxyXG5cdHByaXZhdGUgX29uQ2hvaWNlQ2xpY2soY2hvaWNlOiBzdHJpbmcpIHtcclxuXHRcdHRoaXMuY2hvaWNlID0gY2hvaWNlO1xyXG5cdFx0dGhpcy5pbnZhbGlkYXRlKCk7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIF9vblNwZWFrQ2xpY2soKSB7XHJcblx0XHR0aGlzLnBsYXlpbmcgPSB0cnVlO1xyXG5cdFx0dGhpcy5jb3JlQXVkaW8ucGxheSh0aGlzLmNob2ljZSwgdGhpcy5leGNpdGVkVmFsdWUsICgpID0+IHtcclxuXHRcdFx0dGhpcy5wbGF5aW5nID0gZmFsc2U7XHJcblx0XHRcdHRoaXMuaW52YWxpZGF0ZSgpO1xyXG5cdFx0fSk7XHJcblx0XHR0aGlzLmludmFsaWRhdGUoKTtcclxuXHR9XHJcblxyXG5cdHByaXZhdGUgX2V4Y2l0ZWRDaGFuZ2UodmFsdWU6IG51bWJlcikge1xyXG5cdFx0dGhpcy5leGNpdGVkVmFsdWUgPSB2YWx1ZTtcclxuXHRcdHRoaXMuaW52YWxpZGF0ZSgpO1xyXG5cdH1cclxuXHJcblx0cHJvdGVjdGVkIHJlbmRlcigpIHtcclxuXHJcblx0XHRjb25zdCB7IGV4Y2l0ZWRWYWx1ZSwgY2hvaWNlLCBwbGF5aW5nIH0gPSB0aGlzO1xyXG5cclxuXHRcdHJldHVybiB2KCdkaXYnLCB7IGNsYXNzZXM6IGNzcy5yb290IH0sIFtcclxuXHRcdFx0dignaGVhZGVyJywgeyBjbGFzc2VzOiBjc3MuaGVhZGVyIH0sIFtcclxuXHRcdFx0XHR2KCdidXR0b24nLCB7IGNsYXNzZXM6IGNzcy5idXR0b24sIG9uY2xpY2s6ICgpID0+IHtcclxuXHRcdFx0XHRcdHRoaXMuX29uQ2hvaWNlQ2xpY2soJ2NhdCcpO1xyXG5cdFx0XHRcdH19LCBbICdDYXRzJyBdKSxcclxuXHRcdFx0XHR2KCdwJywge30sIFsndnMnXSksXHJcblx0XHRcdFx0dignYnV0dG9uJywgeyBjbGFzc2VzOiBjc3MuYnV0dG9uLCBvbmNsaWNrOiAoKSA9PiB7XHJcblx0XHRcdFx0XHR0aGlzLl9vbkNob2ljZUNsaWNrKCdkb2cnKTtcclxuXHRcdFx0XHR9fSwgWyAnRG9ncycgXSlcclxuXHRcdFx0XSksXHJcblx0XHRcdHRoaXMuY2hvaWNlID8gdignZGl2JywgeyBjbGFzc2VzOiBjc3MuY29udHJvbHMgfSwgW1xyXG5cdFx0XHRcdHcoU2xpZGVyLCB7XHJcblx0XHRcdFx0XHRleHRyYUNsYXNzZXM6IHsgcm9vdDogY3NzLnNsaWRlciB9LFxyXG5cdFx0XHRcdFx0bGFiZWw6IGBIb3cgRXhjaXRlZCBpcyB0aGUgJHtjaG9pY2V9YCxcclxuXHRcdFx0XHRcdHZhbHVlOiBleGNpdGVkVmFsdWUsXHJcblx0XHRcdFx0XHRtaW46IDAuMSxcclxuXHRcdFx0XHRcdG1heDogMyxcclxuXHRcdFx0XHRcdHN0ZXA6IDAuMSxcclxuXHRcdFx0XHRcdG9uQ2hhbmdlOiB0aGlzLl9leGNpdGVkQ2hhbmdlXHJcblx0XHRcdFx0fSksXHJcblx0XHRcdFx0dignYnV0dG9uJywge1xyXG5cdFx0XHRcdFx0Y2xhc3NlczogY3NzLmJ1dHRvbixcclxuXHRcdFx0XHRcdG9uY2xpY2s6IHRoaXMuX29uU3BlYWtDbGljayxcclxuXHRcdFx0XHRcdGRpc2FibGVkOiBwbGF5aW5nXHJcblx0XHRcdFx0fSwgWyAnU3BlYWsnIF0pXHJcblx0XHRcdF0pIDogdW5kZWZpbmVkLFxyXG5cdFx0XHR0aGlzLmNob2ljZSA9PT0gJ2NhdCcgPyB3KENhdCwgeyBhbmltYXRpb25TcGVlZDogZXhjaXRlZFZhbHVlIH0pIDogdW5kZWZpbmVkLFxyXG5cdFx0XHR0aGlzLmNob2ljZSA9PT0gJ2RvZycgPyB3KERvZywgeyBhbmltYXRpb25TcGVlZDogZXhjaXRlZFZhbHVlIH0pIDogdW5kZWZpbmVkXHJcblx0XHRdKTtcclxuXHR9XHJcbn1cclxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vbm9kZV9tb2R1bGVzL0Bkb2pvL3dlYnBhY2stY29udHJpYi9jc3MtbW9kdWxlLWR0cy1sb2FkZXI/dHlwZT10cyZpbnN0YW5jZU5hbWU9MF9kb2pvIS4vc3JjL3dpZGdldHMvQXBwLnRzIiwiaW1wb3J0IHsgV2lkZ2V0QmFzZSB9IGZyb20gJ0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9XaWRnZXRCYXNlJztcclxuaW1wb3J0ICogYXMgY3NzIGZyb20gJy4vc3R5bGVzL2NhdC5tLmNzcyc7XHJcbmltcG9ydCB7IHYgfSBmcm9tICdAZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvZCc7XHJcbmltcG9ydCBXZWJBbmltYXRpb24gZnJvbSAnQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL21ldGEvV2ViQW5pbWF0aW9uJztcclxuaW1wb3J0IFRoZW1lZE1peGluIGZyb20gJ0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9taXhpbnMvVGhlbWVkJztcclxuXHJcbmNvbnN0IGhlYWQgPSByZXF1aXJlKCcuL2Fzc2V0cy9jYXQtaGVhZC5wbmcnKTtcclxuY29uc3QgYm9keSA9IHJlcXVpcmUoJy4vYXNzZXRzL2NhdC1ib2R5LnBuZycpO1xyXG5jb25zdCB0YWlsID0gcmVxdWlyZSgnLi9hc3NldHMvY2F0LXRhaWwucG5nJyk7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIENhdFByb3BlcnRpZXMge1xyXG5cdGFuaW1hdGlvblNwZWVkOiBudW1iZXI7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBDYXQgZXh0ZW5kcyBUaGVtZWRNaXhpbihXaWRnZXRCYXNlKTxDYXRQcm9wZXJ0aWVzPiB7XHJcblxyXG5cdHByaXZhdGUgX2dldEhlYWRBbmltYXRpb24oYW5pbWF0aW9uU3BlZWQ6IG51bWJlcikge1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0aWQ6ICdjYXQtaGVhZCcsXHJcblx0XHRcdGVmZmVjdHM6IFtcclxuXHRcdFx0XHR7IG1hcmdpbkJvdHRvbTogJzBweCcgfSxcclxuXHRcdFx0XHR7IG1hcmdpbkJvdHRvbTogJzVweCcgfSxcclxuXHRcdFx0XHR7IG1hcmdpbkJvdHRvbTogJzBweCcgfVxyXG5cdFx0XHRdIGFzIGFueSxcclxuXHRcdFx0dGltaW5nOiB7XHJcblx0XHRcdFx0ZHVyYXRpb246IDgwMCxcclxuXHRcdFx0XHRpdGVyYXRpb25zOiBJbmZpbml0eVxyXG5cdFx0XHR9LFxyXG5cdFx0XHRjb250cm9sczoge1xyXG5cdFx0XHRcdHBsYXk6IHRydWUsXHJcblx0XHRcdFx0cGxheWJhY2tSYXRlOiBhbmltYXRpb25TcGVlZFxyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBfZ2V0VGFpbEFuaW1hdGlvbihhbmltYXRpb25TcGVlZDogbnVtYmVyKSB7XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRpZDogJ2NhdC10YWlsJyxcclxuXHRcdFx0ZWZmZWN0czogW1xyXG5cdFx0XHRcdHsgdHJhbnNmb3JtOiAncm90YXRlKDBkZWcpJyB9LFxyXG5cdFx0XHRcdHsgdHJhbnNmb3JtOiAncm90YXRlKC0xMGRlZyknIH0sXHJcblx0XHRcdFx0eyB0cmFuc2Zvcm06ICdyb3RhdGUoMGRlZyknIH1cclxuXHRcdFx0XSxcclxuXHRcdFx0dGltaW5nOiB7XHJcblx0XHRcdFx0ZHVyYXRpb246IDEwMDAsXHJcblx0XHRcdFx0aXRlcmF0aW9uczogSW5maW5pdHlcclxuXHRcdFx0fSxcclxuXHRcdFx0Y29udHJvbHM6IHtcclxuXHRcdFx0XHRwbGF5OiB0cnVlLFxyXG5cdFx0XHRcdHBsYXliYWNrUmF0ZTogYW5pbWF0aW9uU3BlZWRcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHR9XHJcblxyXG5cdHByb3RlY3RlZCByZW5kZXIoKSB7XHJcblx0XHRjb25zdCB7IGFuaW1hdGlvblNwZWVkIH0gPSB0aGlzLnByb3BlcnRpZXM7XHJcblxyXG5cdFx0dGhpcy5tZXRhKFdlYkFuaW1hdGlvbikuYW5pbWF0ZSgnY2F0LWhlYWQnLCB0aGlzLl9nZXRIZWFkQW5pbWF0aW9uKGFuaW1hdGlvblNwZWVkKSk7XHJcblx0XHR0aGlzLm1ldGEoV2ViQW5pbWF0aW9uKS5hbmltYXRlKCdjYXQtdGFpbCcsIHRoaXMuX2dldFRhaWxBbmltYXRpb24oYW5pbWF0aW9uU3BlZWQpKTtcclxuXHJcblx0XHRyZXR1cm4gdignZGl2JywgeyBjbGFzc2VzOiBjc3Mucm9vdCB9LCBbXHJcblx0XHRcdHYoJ2ltZycsIHsga2V5OiAnY2F0LWhlYWQnLCBzcmM6IGhlYWQsIGNsYXNzZXM6IGNzcy5oZWFkIH0pLFxyXG5cdFx0XHR2KCdpbWcnLCB7IGtleTogJ2NhdC1ib2R5Jywgc3JjOiBib2R5LCBjbGFzc2VzOiBjc3MuYm9keSB9KSxcclxuXHRcdFx0dignaW1nJywgeyBrZXk6ICdjYXQtdGFpbCcsIHNyYzogdGFpbCwgY2xhc3NlczogY3NzLnRhaWwgfSlcclxuXHRcdF0pO1xyXG5cdH1cclxufVxyXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9ub2RlX21vZHVsZXMvQGRvam8vd2VicGFjay1jb250cmliL2Nzcy1tb2R1bGUtZHRzLWxvYWRlcj90eXBlPXRzJmluc3RhbmNlTmFtZT0wX2Rvam8hLi9zcmMvd2lkZ2V0cy9DYXQudHMiLCJjb25zdCBBdWRpb0NvbnRleHQgPSAoPGFueT4gd2luZG93KS5BdWRpb0NvbnRleHQgfHwgKDxhbnk+IHdpbmRvdykud2Via2l0QXVkaW9Db250ZXh0OyAvLyBzYWZhcmkgOlxcXG5cbmV4cG9ydCBjbGFzcyBDb3JlQXVkaW8ge1xuXHRwcml2YXRlIGNvbnRleHQhOiBBdWRpb0NvbnRleHQ7XG5cblx0cHJpdmF0ZSBhdWRpb01hcCA9IG5ldyBNYXA8c3RyaW5nLCBBdWRpb0J1ZmZlcj4oKTtcblxuXHRhc3luYyBwbGF5KHNvdW5kOiBzdHJpbmcsIHNwZWVkOiBudW1iZXIsIG9uU3RvcDogKCkgPT4gdm9pZCkge1xuXHRcdGlmICghdGhpcy5jb250ZXh0KSB7XG5cdFx0XHR0aGlzLmNvbnRleHQgPSBuZXcgQXVkaW9Db250ZXh0KCk7XG5cdFx0fVxuXG5cdFx0Ly8gQ2hyb21lIGFuZCBTYWZhcmkgYXJlIGJvdGggYXdmdWxcblx0XHRpZiAodGhpcy5jb250ZXh0LnN0YXRlID09PSAnc3VzcGVuZGVkJykge1xuXHRcdFx0dGhpcy5jb250ZXh0LnJlc3VtZSgpO1xuXHRcdH1cblxuXHRcdGNvbnN0IHNvdXJjZSA9IHRoaXMuY29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcblx0XHRzb3VyY2UuYnVmZmVyID0gYXdhaXQgdGhpcy5sb2FkQ2FjaGVkKHNvdW5kKTtcblx0XHRzb3VyY2UuY29ubmVjdCh0aGlzLmNvbnRleHQuZGVzdGluYXRpb24pO1xuXHRcdHNvdXJjZS5wbGF5YmFja1JhdGUudmFsdWUgPSBzcGVlZDtcblx0XHRzb3VyY2UubG9vcCA9IHRydWU7XG5cdFx0c291cmNlLnN0YXJ0KHRoaXMuY29udGV4dC5jdXJyZW50VGltZSk7XG5cblx0XHRzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdHNvdXJjZS5zdG9wKCk7XG5cdFx0XHRvblN0b3AoKTtcblx0XHR9LCA1MDAwKTtcblxuXHRcdGNvbnNvbGUubG9nKHNvdW5kKTtcblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgbG9hZENhY2hlZChzb3VuZDogc3RyaW5nKSB7XG5cdFx0aWYgKHRoaXMuYXVkaW9NYXAuaGFzKHNvdW5kKSkge1xuXHRcdFx0cmV0dXJuIHRoaXMuYXVkaW9NYXAuZ2V0KHNvdW5kKSE7XG5cdFx0fVxuXG5cdFx0Y29uc3QgYnVmZmVyID0gYXdhaXQgdGhpcy5sb2FkQXVkaW8oc291bmQpO1xuXHRcdHRoaXMuYXVkaW9NYXAuc2V0KHNvdW5kLCBidWZmZXIpO1xuXHRcdHJldHVybiBidWZmZXI7XG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIGxvYWRBdWRpbyhzb3VuZDogc3RyaW5nKSB7XG5cdFx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgZmV0Y2goYGFzc2V0cy9zb3VuZHMvJHtzb3VuZH0ubXAzYCk7XG5cdFx0Y29uc3QgYXVkaW9EYXRhID0gYXdhaXQgcmVzdWx0LmFycmF5QnVmZmVyKCk7XG5cdFx0cmV0dXJuIGF3YWl0IHRoaXMuY29udGV4dC5kZWNvZGVBdWRpb0RhdGEoYXVkaW9EYXRhKTtcblx0fVxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vbm9kZV9tb2R1bGVzL0Bkb2pvL3dlYnBhY2stY29udHJpYi9jc3MtbW9kdWxlLWR0cy1sb2FkZXI/dHlwZT10cyZpbnN0YW5jZU5hbWU9MF9kb2pvIS4vc3JjL3dpZGdldHMvQ29yZUF1ZGlvLnRzIiwiaW1wb3J0IHsgVGhlbWVkTWl4aW4sIHRoZW1lIH0gZnJvbSAnQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL21peGlucy9UaGVtZWQnO1xyXG5pbXBvcnQgeyBXaWRnZXRCYXNlIH0gZnJvbSAnQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL1dpZGdldEJhc2UnO1xyXG5pbXBvcnQgKiBhcyBjc3MgZnJvbSAnLi9zdHlsZXMvZG9nLm0uY3NzJztcclxuaW1wb3J0IHsgdiB9IGZyb20gJ0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9kJztcclxuaW1wb3J0IFdlYkFuaW1hdGlvbiBmcm9tICdAZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvbWV0YS9XZWJBbmltYXRpb24nO1xyXG5cclxuY29uc3QgaGVhZCA9IHJlcXVpcmUoJy4vYXNzZXRzL2RvZy1oZWFkLnBuZycpO1xyXG5jb25zdCBib2R5ID0gcmVxdWlyZSgnLi9hc3NldHMvZG9nLWJvZHkucG5nJyk7XHJcbmNvbnN0IHRhaWwgPSByZXF1aXJlKCcuL2Fzc2V0cy9kb2ctdGFpbC5wbmcnKTtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRG9nUHJvcGVydGllcyB7XHJcblx0YW5pbWF0aW9uU3BlZWQ6IG51bWJlcjtcclxufVxyXG5cclxuQHRoZW1lKGNzcylcclxuZXhwb3J0IGNsYXNzIERvZyBleHRlbmRzIFRoZW1lZE1peGluKFdpZGdldEJhc2UpPERvZ1Byb3BlcnRpZXM+IHtcclxuXHJcblx0cHJpdmF0ZSBfZ2V0SGVhZEFuaW1hdGlvbihhbmltYXRpb25TcGVlZDogbnVtYmVyKSB7XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRpZDogJ2RvZy1oZWFkJyxcclxuXHRcdFx0ZWZmZWN0czogW1xyXG5cdFx0XHRcdHsgbWFyZ2luQm90dG9tOiAnMHB4JyB9LFxyXG5cdFx0XHRcdHsgbWFyZ2luQm90dG9tOiAnNXB4JyB9LFxyXG5cdFx0XHRcdHsgbWFyZ2luQm90dG9tOiAnMHB4JyB9XHJcblx0XHRcdF0gYXMgYW55LFxyXG5cdFx0XHR0aW1pbmc6IHtcclxuXHRcdFx0XHRkdXJhdGlvbjogODAwLFxyXG5cdFx0XHRcdGl0ZXJhdGlvbnM6IEluZmluaXR5XHJcblx0XHRcdH0sXHJcblx0XHRcdGNvbnRyb2xzOiB7XHJcblx0XHRcdFx0cGxheTogdHJ1ZSxcclxuXHRcdFx0XHRwbGF5YmFja1JhdGU6IGFuaW1hdGlvblNwZWVkXHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIF9nZXRUYWlsQW5pbWF0aW9uKGFuaW1hdGlvblNwZWVkOiBudW1iZXIpIHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdGlkOiAnZG9nLXRhaWwnLFxyXG5cdFx0XHRlZmZlY3RzOiBbXHJcblx0XHRcdFx0eyB0cmFuc2Zvcm06ICdyb3RhdGUoMTBkZWcpJyB9LFxyXG5cdFx0XHRcdHsgdHJhbnNmb3JtOiAncm90YXRlKC0xMGRlZyknIH0sXHJcblx0XHRcdFx0eyB0cmFuc2Zvcm06ICdyb3RhdGUoMTBkZWcpJyB9XHJcblx0XHRcdF0sXHJcblx0XHRcdHRpbWluZzoge1xyXG5cdFx0XHRcdGR1cmF0aW9uOiAxMDAwLFxyXG5cdFx0XHRcdGl0ZXJhdGlvbnM6IEluZmluaXR5XHJcblx0XHRcdH0sXHJcblx0XHRcdGNvbnRyb2xzOiB7XHJcblx0XHRcdFx0cGxheTogdHJ1ZSxcclxuXHRcdFx0XHRwbGF5YmFja1JhdGU6IGFuaW1hdGlvblNwZWVkXHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0fVxyXG5cclxuXHRwcm90ZWN0ZWQgcmVuZGVyKCkge1xyXG5cdFx0Y29uc3QgeyBhbmltYXRpb25TcGVlZCB9ID0gdGhpcy5wcm9wZXJ0aWVzO1xyXG5cclxuXHRcdHRoaXMubWV0YShXZWJBbmltYXRpb24pLmFuaW1hdGUoJ2RvZy1oZWFkJywgdGhpcy5fZ2V0SGVhZEFuaW1hdGlvbihhbmltYXRpb25TcGVlZCkpO1xyXG5cdFx0dGhpcy5tZXRhKFdlYkFuaW1hdGlvbikuYW5pbWF0ZSgnZG9nLXRhaWwnLCB0aGlzLl9nZXRUYWlsQW5pbWF0aW9uKGFuaW1hdGlvblNwZWVkKSk7XHJcblxyXG5cdFx0cmV0dXJuIHYoJ2RpdicsIHsgY2xhc3NlczogY3NzLnJvb3QgfSwgW1xyXG5cdFx0XHR2KCdpbWcnLCB7IGtleTogJ2RvZy1oZWFkJywgc3JjOiBoZWFkLCBjbGFzc2VzOiBjc3MuaGVhZCB9KSxcclxuXHRcdFx0dignaW1nJywgeyBrZXk6ICdkb2ctYm9keScsIHNyYzogYm9keSwgY2xhc3NlczogY3NzLmJvZHkgfSksXHJcblx0XHRcdHYoJ2ltZycsIHsga2V5OiAnZG9nLXRhaWwnLCBzcmM6IHRhaWwsIGNsYXNzZXM6IGNzcy50YWlsIH0pXHJcblx0XHRdKTtcclxuXHR9XHJcbn1cclxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vbm9kZV9tb2R1bGVzL0Bkb2pvL3dlYnBhY2stY29udHJpYi9jc3MtbW9kdWxlLWR0cy1sb2FkZXI/dHlwZT10cyZpbnN0YW5jZU5hbWU9MF9kb2pvIS4vc3JjL3dpZGdldHMvRG9nLnRzIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiY2F0LWJvZHkuNG1OeEpfTngucG5nXCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvd2lkZ2V0cy9hc3NldHMvY2F0LWJvZHkucG5nXG4vLyBtb2R1bGUgaWQgPSAuL3NyYy93aWRnZXRzL2Fzc2V0cy9jYXQtYm9keS5wbmdcbi8vIG1vZHVsZSBjaHVua3MgPSBtYWluIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiY2F0LWhlYWQuMUxOMEZ4SkoucG5nXCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvd2lkZ2V0cy9hc3NldHMvY2F0LWhlYWQucG5nXG4vLyBtb2R1bGUgaWQgPSAuL3NyYy93aWRnZXRzL2Fzc2V0cy9jYXQtaGVhZC5wbmdcbi8vIG1vZHVsZSBjaHVua3MgPSBtYWluIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiY2F0LXRhaWwuMmd3TXNoTnQucG5nXCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvd2lkZ2V0cy9hc3NldHMvY2F0LXRhaWwucG5nXG4vLyBtb2R1bGUgaWQgPSAuL3NyYy93aWRnZXRzL2Fzc2V0cy9jYXQtdGFpbC5wbmdcbi8vIG1vZHVsZSBjaHVua3MgPSBtYWluIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiZG9nLWJvZHkuMWlNMmhSVTgucG5nXCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvd2lkZ2V0cy9hc3NldHMvZG9nLWJvZHkucG5nXG4vLyBtb2R1bGUgaWQgPSAuL3NyYy93aWRnZXRzL2Fzc2V0cy9kb2ctYm9keS5wbmdcbi8vIG1vZHVsZSBjaHVua3MgPSBtYWluIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiZG9nLWhlYWQuMzVLcnZWaUoucG5nXCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvd2lkZ2V0cy9hc3NldHMvZG9nLWhlYWQucG5nXG4vLyBtb2R1bGUgaWQgPSAuL3NyYy93aWRnZXRzL2Fzc2V0cy9kb2ctaGVhZC5wbmdcbi8vIG1vZHVsZSBjaHVua3MgPSBtYWluIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiZG9nLXRhaWwuMXY2QWR3MDAucG5nXCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvd2lkZ2V0cy9hc3NldHMvZG9nLXRhaWwucG5nXG4vLyBtb2R1bGUgaWQgPSAuL3NyYy93aWRnZXRzL2Fzc2V0cy9kb2ctdGFpbC5wbmdcbi8vIG1vZHVsZSBjaHVua3MgPSBtYWluIiwiLy8gcmVtb3ZlZCBieSBleHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW5cbm1vZHVsZS5leHBvcnRzID0ge1wiIF9rZXlcIjpcImNhdHN2c2RvZ3MvYXBwXCIsXCJyb290XCI6XCJhcHAtbV9fcm9vdF9fMmxqNDJcIixcImJ1dHRvblwiOlwiYXBwLW1fX2J1dHRvbl9fMWhtS25cIixcImhlYWRlclwiOlwiYXBwLW1fX2hlYWRlcl9fM19ndHZcIixcImNvbnRyb2xzXCI6XCJhcHAtbV9fY29udHJvbHNfXzJoa0FyXCIsXCJzbGlkZXJcIjpcImFwcC1tX19zbGlkZXJfX29vZ3RXXCJ9O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL3dpZGdldHMvc3R5bGVzL2FwcC5tLmNzc1xuLy8gbW9kdWxlIGlkID0gLi9zcmMvd2lkZ2V0cy9zdHlsZXMvYXBwLm0uY3NzXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsIi8vIHJlbW92ZWQgYnkgZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luXG5tb2R1bGUuZXhwb3J0cyA9IHtcIiBfa2V5XCI6XCJjYXRzdnNkb2dzL2NhdFwiLFwicm9vdFwiOlwiY2F0LW1fX3Jvb3RfXzJJT3JkXCIsXCJoZWFkXCI6XCJjYXQtbV9faGVhZF9fMWlDYlJcIixcImJvZHlcIjpcImNhdC1tX19ib2R5X19WQlkyWVwiLFwidGFpbFwiOlwiY2F0LW1fX3RhaWxfXzE2Ui1lXCJ9O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL3dpZGdldHMvc3R5bGVzL2NhdC5tLmNzc1xuLy8gbW9kdWxlIGlkID0gLi9zcmMvd2lkZ2V0cy9zdHlsZXMvY2F0Lm0uY3NzXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsIi8vIHJlbW92ZWQgYnkgZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luXG5tb2R1bGUuZXhwb3J0cyA9IHtcIiBfa2V5XCI6XCJjYXRzdnNkb2dzL2RvZ1wiLFwicm9vdFwiOlwiZG9nLW1fX3Jvb3RfXzF6cWRqXCIsXCJoZWFkXCI6XCJkb2ctbV9faGVhZF9faDVZN2lcIixcImJvZHlcIjpcImRvZy1tX19ib2R5X18xUGJnLVwiLFwidGFpbFwiOlwiZG9nLW1fX3RhaWxfXzFLNzF0XCJ9O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL3dpZGdldHMvc3R5bGVzL2RvZy5tLmNzc1xuLy8gbW9kdWxlIGlkID0gLi9zcmMvd2lkZ2V0cy9zdHlsZXMvZG9nLm0uY3NzXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiJdLCJzb3VyY2VSb290IjoiIn0=