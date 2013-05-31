
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);
  var index = path + '/index.js';

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
  }

  if (require.aliases.hasOwnProperty(index)) {
    return require.aliases[index];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-underscore/index.js", function(exports, require, module){
//     Underscore.js 1.3.3
//     (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore is freely distributable under the MIT license.
//     Portions of Underscore are inspired or borrowed from Prototype,
//     Oliver Steele's Functional, and John Resig's Micro-Templating.
//     For all details and documentation:
//     http://documentcloud.github.com/underscore

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var push             = ArrayProto.push,
      slice            = ArrayProto.slice,
      unshift          = ArrayProto.unshift,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) { return new wrapper(obj); };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root['_'] = _;
  }

  // Current version.
  _.VERSION = '1.3.3';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (_.has(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    return results;
  };

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError('Reduce of empty array with no initial value');
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var reversed = _.toArray(obj).reverse();
    if (context && !initial) iterator = _.bind(iterator, context);
    return initial ? _.reduce(reversed, iterator, memo, context) : _.reduce(reversed, iterator);
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    each(obj, function(value, index, list) {
      if (!iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if a given value is included in the array or object using `===`.
  // Aliased as `contains`.
  _.include = _.contains = function(obj, target) {
    var found = false;
    if (obj == null) return found;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    found = any(obj, function(value) {
      return value === target;
    });
    return found;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    return _.map(obj, function(value) {
      return (_.isFunction(method) ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See: https://bugs.webkit.org/show_bug.cgi?id=80797
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array.
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = Math.floor(Math.random() * ++index);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, val, context) {
    var iterator = lookupIterator(obj, val);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      if (a === void 0) return 1;
      if (b === void 0) return -1;
      return a < b ? -1 : a > b ? 1 : 0;
    }), 'value');
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(obj, val) {
    return _.isFunction(val) ? val : function(obj) { return obj[val]; };
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(obj, val, behavior) {
    var result = {};
    var iterator = lookupIterator(obj, val);
    each(obj, function(value, index) {
      var key = iterator(value, index);
      behavior(result, key, value);
    });
    return result;
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = function(obj, val) {
    return group(obj, val, function(result, key, value) {
      (result[key] || (result[key] = [])).push(value);
    });
  };

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = function(obj, val) {
    return group(obj, val, function(result, key, value) {
      result[key] || (result[key] = 0);
      result[key]++;
    });
  };

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator) {
    iterator || (iterator = _.identity);
    var value = iterator(obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >> 1;
      iterator(array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely convert anything iterable into a real, live array.
  _.toArray = function(obj) {
    if (!obj)                                     return [];
    if (_.isArray(obj))                           return slice.call(obj);
    if (_.isArguments(obj))                       return slice.call(obj);
    if (obj.toArray && _.isFunction(obj.toArray)) return obj.toArray();
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    return _.isArray(obj) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if ((n != null) && !guard) {
      return slice.call(array, Math.max(array.length - n, 0));
    } else {
      return array[array.length - 1];
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail`.
  // Especially useful on the arguments object. Passing an **index** will return
  // the rest of the values in the array from that index onward. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = function(array, index, guard) {
    return slice.call(array, (index == null) || guard ? 1 : index);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, function(value){ return !!value; });
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    each(input, function(value) {
      if (_.isArray(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator) {
    var initial = iterator ? _.map(array, iterator) : array;
    var results = [];
    _.reduce(initial, function(memo, value, index) {
      if (isSorted ? (_.last(memo) !== value || !memo.length) : !_.include(memo, value)) {
        memo.push(value);
        results.push(array[index]);
      }
      return memo;
    }, []);
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, []));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(slice.call(arguments, 1), true, []);
    return _.filter(array, function(value){ return !_.include(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var args = slice.call(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(args, "" + i);
    }
    return results;
  };

  // Zip together two arrays -- an array of keys and an array of values -- into
  // a single object.
  _.zipObject = function(keys, values) {
    var result = {};
    for (var i = 0, l = keys.length; i < l; i++) {
      result[keys[i]] = values[i];
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i, l;
    if (isSorted) {
      i = _.sortedIndex(array, item);
      return array[i] === item ? i : -1;
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
    for (i = 0, l = array.length; i < l; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item) {
    if (array == null) return -1;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) return array.lastIndexOf(item);
    var i = array.length;
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Binding with arguments is also known as `curry`.
  // Delegates to **ECMAScript 5**'s native `Function.bind` if available.
  // We check for `func.bind` first, to fail fast when `func` is undefined.
  _.bind = function bind(func, context) {
    var bound, args;
    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length == 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time.
  _.throttle = function(func, wait) {
    var context, args, timeout, throttling, more, result;
    var whenDone = _.debounce(function(){ more = throttling = false; }, wait);
    return function() {
      context = this; args = arguments;
      var later = function() {
        timeout = null;
        if (more) func.apply(context, args);
        whenDone();
      };
      if (!timeout) timeout = setTimeout(later, wait);
      if (throttling) {
        more = true;
      } else {
        throttling = true;
        result = func.apply(context, args);
      }
      whenDone();
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      return memo = func.apply(this, arguments);
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func].concat(slice.call(arguments, 0));
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    if (times <= 0) return func();
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    return _.map(obj, _.identity);
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var result = {};
    each(flatten(slice.call(arguments, 1), true, []), function(key) {
      if (key in obj) result[key] = obj[key];
    });
    return result;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        if (obj[prop] == null) obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, stack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a._chain) a = a._wrapped;
    if (b._chain) b = b._wrapped;
    // Invoke a custom `isEqual` method if one is provided.
    if (a.isEqual && _.isFunction(a.isEqual)) return a.isEqual(b);
    if (b.isEqual && _.isFunction(b.isEqual)) return b.isEqual(a);
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = stack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (stack[length] == a) return true;
    }
    // Add the first object to the stack of traversed objects.
    stack.push(a);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          // Ensure commutative equality for sparse arrays.
          if (!(result = size in a == size in b && eq(a[size], b[size], stack))) break;
        }
      }
    } else {
      // Objects with different constructors are not equivalent.
      if ('constructor' in a != 'constructor' in b || a.constructor != b.constructor) return false;
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], stack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    stack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType == 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return _.isNumber(obj) && isFinite(obj);
  };

  // Is the given value `NaN`?
  _.isNaN = function(obj) {
    // `NaN` is the only value for which `===` is not reflexive.
    return obj !== obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    for (var i = 0; i < n; i++) iterator.call(context, i);
  };

  // List of HTML entities for escaping.
  var htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };

  // Regex containing the keys listed immediately above.
  var htmlEscaper = /[&<>"'\/]/g;

  // Escape a string for HTML interpolation.
  _.escape = function(string) {
    return ('' + string).replace(htmlEscaper, function(match) {
      return htmlEscapes[match];
    });
  };

  // If the value of the named property is a function then invoke it;
  // otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return null;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object, ensuring that
  // they're correctly added to the OOP wrapper as well.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      addToWrapper(name, _[name] = obj[name]);
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = idCounter++;
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /.^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    '\\':   '\\',
    "'":    "'",
    r:      '\r',
    n:      '\n',
    t:      '\t',
    u2028:  '\u2028',
    u2029:  '\u2029'
  };

  for (var key in escapes) escapes[escapes[key]] = key;
  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
  var unescaper = /\\(\\|'|r|n|t|u2028|u2029)/g;

  // Within an interpolation, evaluation, or escaping, remove HTML escaping
  // that had been previously added.
  var unescape = function(code) {
    return code.replace(unescaper, function(match, escape) {
      return escapes[escape];
    });
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    settings = _.defaults(settings || {}, _.templateSettings);

    // Compile the template source, taking care to escape characters that
    // cannot be included in a string literal and then unescape them in code
    // blocks.
    var source = "__p+='" + text
      .replace(escaper, function(match) {
        return '\\' + escapes[match];
      })
      .replace(settings.escape || noMatch, function(match, code) {
        return "'+\n((__t=(" + unescape(code) + "))==null?'':_.escape(__t))+\n'";
      })
      .replace(settings.interpolate || noMatch, function(match, code) {
        return "'+\n((__t=(" + unescape(code) + "))==null?'':__t)+\n'";
      })
      .replace(settings.evaluate || noMatch, function(match, code) {
        return "';\n" + unescape(code) + "\n__p+='";
      }) + "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'')};\n" +
      source + "return __p;\n";

    var render = new Function(settings.variable || 'obj', '_', source);
    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // The OOP Wrapper
  // ---------------

  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.
  var wrapper = function(obj) { this._wrapped = obj; };

  // Expose `wrapper.prototype` as `_.prototype`
  _.prototype = wrapper.prototype;

  // Helper function to continue chaining intermediate results.
  var result = function(obj, chain) {
    return chain ? _(obj).chain() : obj;
  };

  // A method to easily add functions to the OOP wrapper.
  var addToWrapper = function(name, func) {
    wrapper.prototype[name] = function() {
      var args = slice.call(arguments);
      unshift.call(args, this._wrapped);
      return result(func.apply(_, args), this._chain);
    };
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result(obj, this._chain);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      return result(method.apply(this._wrapped, arguments), this._chain);
    };
  });

  // Start chaining a wrapped Underscore object.
  wrapper.prototype.chain = function() {
    this._chain = true;
    return this;
  };

  // Extracts the result from a wrapped and chained object.
  wrapper.prototype.value = function() {
    return this._wrapped;
  };

}).call(this);

});
require.register("component-indexof/index.js", function(exports, require, module){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
});
require.register("component-emitter/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var index = require('indexof');

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  fn._off = on;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var i = index(callbacks, fn._off || fn);
  if (~i) callbacks.splice(i, 1);
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

});
require.register("shaunxcode-jsedn/index.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.2
(function() {
  var Discard, Iterable, Keyword, List, Map, Prim, Set, StringObj, Symbol, Tag, Tagged, Vector, atPath, encode, encodeHandlers, encodeJson, escapeChar, fs, handle, keywords, kw, lex, parenTypes, parens, read, specialChars, sym, symbols, tagActions, tokenHandlers, us, _ref, _ref1, _ref2, _ref3,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  us = require("underscore");

  Prim = (function() {
    function Prim(val) {
      if (us.isArray(val)) {
        this.val = us.filter(val, function(x) {
          return !(x instanceof Discard);
        });
      } else {
        this.val = val;
      }
    }

    Prim.prototype.value = function() {
      return this.val;
    };

    Prim.prototype.toString = function() {
      return JSON.stringify(this.val);
    };

    return Prim;

  })();

  Symbol = (function(_super) {
    __extends(Symbol, _super);

    function Symbol() {
      var args, parts;

      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      switch (args.length) {
        case 1:
          if (args[0] === "/") {
            this.ns = null;
            this.name = "/";
          } else {
            parts = args[0].split("/");
            if (parts.length === 1) {
              this.ns = null;
              this.name = parts[0];
            } else if (parts.length === 2) {
              this.ns = parts[0];
              this.name = parts[1];
            } else {
              throw "Can not have more than 1 forward slash in a symbol";
            }
          }
          break;
        case 2:
          this.ns = args[0];
          this.name = args[1];
      }
      if (this.name.length === 0) {
        throw "Length of Symbol name can not be empty";
      }
      this.val = "" + (this.ns ? "" + this.ns + "/" : "") + this.name;
    }

    Symbol.prototype.toString = function() {
      return this.val;
    };

    Symbol.prototype.ednEncode = function() {
      return this.val;
    };

    Symbol.prototype.jsEncode = function() {
      return this.val;
    };

    Symbol.prototype.jsonEncode = function() {
      return {
        Symbol: this.val
      };
    };

    return Symbol;

  })(Prim);

  Keyword = (function(_super) {
    __extends(Keyword, _super);

    function Keyword() {
      Keyword.__super__.constructor.apply(this, arguments);
      if (this.val[0] !== ":") {
        throw "keyword must start with a :";
      }
    }

    Keyword.prototype.jsonEncode = function() {
      return {
        Keyword: this.val
      };
    };

    return Keyword;

  })(Symbol);

  StringObj = (function(_super) {
    __extends(StringObj, _super);

    function StringObj() {
      _ref = StringObj.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    StringObj.prototype.toString = function() {
      return this.val;
    };

    StringObj.prototype.is = function(test) {
      return this.val === test;
    };

    return StringObj;

  })(Prim);

  Tag = (function() {
    function Tag() {
      var name, namespace, _ref1;

      namespace = arguments[0], name = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      this.namespace = namespace;
      this.name = name;
      if (arguments.length === 1) {
        _ref1 = arguments[0].split('/'), this.namespace = _ref1[0], this.name = 2 <= _ref1.length ? __slice.call(_ref1, 1) : [];
      }
    }

    Tag.prototype.ns = function() {
      return this.namespace;
    };

    Tag.prototype.dn = function() {
      return [this.namespace].concat(this.name).join('/');
    };

    return Tag;

  })();

  Tagged = (function(_super) {
    __extends(Tagged, _super);

    function Tagged(_tag, _obj) {
      this._tag = _tag;
      this._obj = _obj;
    }

    Tagged.prototype.ednEncode = function() {
      return "\#" + (this.tag().dn()) + " " + (encode(this.obj()));
    };

    Tagged.prototype.jsonEncode = function() {
      return {
        Tagged: [this.tag().dn(), this.obj().jsonEncode != null ? this.obj().jsonEncode() : this.obj()]
      };
    };

    Tagged.prototype.tag = function() {
      return this._tag;
    };

    Tagged.prototype.obj = function() {
      return this._obj;
    };

    return Tagged;

  })(Prim);

  Discard = (function() {
    function Discard() {}

    return Discard;

  })();

  Iterable = (function(_super) {
    __extends(Iterable, _super);

    function Iterable() {
      _ref1 = Iterable.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    Iterable.prototype.ednEncode = function() {
      return (this.map(function(i) {
        return encode(i);
      })).join(" ");
    };

    Iterable.prototype.jsonEncode = function() {
      return this.map(function(i) {
        if (i.jsonEncode != null) {
          return i.jsonEncode();
        } else {
          return i;
        }
      });
    };

    Iterable.prototype.jsEncode = function() {
      return this.map(function(i) {
        if (i.jsEncode != null) {
          return i.jsEncode();
        } else {
          return i;
        }
      });
    };

    Iterable.prototype.exists = function(index) {
      return this.val[index] != null;
    };

    Iterable.prototype.map = function(iter) {
      var i, _i, _len, _ref2, _results;

      _ref2 = this.val;
      _results = [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        i = _ref2[_i];
        _results.push(iter(i));
      }
      return _results;
    };

    Iterable.prototype.at = function(index) {
      if (this.exists(index)) {
        return this.val[index];
      }
    };

    Iterable.prototype.set = function(index, val) {
      this.val[index] = val;
      return this;
    };

    return Iterable;

  })(Prim);

  List = (function(_super) {
    __extends(List, _super);

    function List() {
      _ref2 = List.__super__.constructor.apply(this, arguments);
      return _ref2;
    }

    List.prototype.ednEncode = function() {
      return "(" + (List.__super__.ednEncode.call(this)) + ")";
    };

    List.prototype.jsonEncode = function() {
      return {
        List: List.__super__.jsonEncode.call(this)
      };
    };

    return List;

  })(Iterable);

  Vector = (function(_super) {
    __extends(Vector, _super);

    function Vector() {
      _ref3 = Vector.__super__.constructor.apply(this, arguments);
      return _ref3;
    }

    Vector.prototype.ednEncode = function() {
      return "[" + (Vector.__super__.ednEncode.call(this)) + "]";
    };

    Vector.prototype.jsonEncode = function() {
      return {
        Vector: Vector.__super__.jsonEncode.call(this)
      };
    };

    return Vector;

  })(Iterable);

  Set = (function(_super) {
    __extends(Set, _super);

    Set.prototype.ednEncode = function() {
      return "\#{" + (Set.__super__.ednEncode.call(this)) + "}";
    };

    Set.prototype.jsonEncode = function() {
      return {
        Set: Set.__super__.jsonEncode.call(this)
      };
    };

    function Set(val) {
      Set.__super__.constructor.call(this);
      this.val = us.uniq(val);
      if (!us.isEqual(val, this.val)) {
        throw "set not distinct";
      }
    }

    return Set;

  })(Iterable);

  Map = (function() {
    Map.prototype.ednEncode = function() {
      var i;

      return "{" + (((function() {
        var _i, _len, _ref4, _results;

        _ref4 = this.value();
        _results = [];
        for (_i = 0, _len = _ref4.length; _i < _len; _i++) {
          i = _ref4[_i];
          _results.push(encode(i));
        }
        return _results;
      }).call(this)).join(" ")) + "}";
    };

    Map.prototype.jsonEncode = function() {
      var i;

      return {
        Map: (function() {
          var _i, _len, _ref4, _results;

          _ref4 = this.value();
          _results = [];
          for (_i = 0, _len = _ref4.length; _i < _len; _i++) {
            i = _ref4[_i];
            _results.push(i.jsonEncode != null ? i.jsonEncode() : i);
          }
          return _results;
        }).call(this)
      };
    };

    Map.prototype.jsEncode = function() {
      var hashId, i, k, result, _i, _len, _ref4;

      result = {};
      _ref4 = this.keys;
      for (i = _i = 0, _len = _ref4.length; _i < _len; i = ++_i) {
        k = _ref4[i];
        hashId = k.hashId != null ? k.hashId() : k;
        result[hashId] = this.vals[i].jsEncode != null ? this.vals[i].jsEncode() : this.vals[i];
      }
      return result;
    };

    function Map(val) {
      var i, v, _i, _len, _ref4;

      this.val = val;
      this.keys = [];
      this.vals = [];
      _ref4 = this.val;
      for (i = _i = 0, _len = _ref4.length; _i < _len; i = ++_i) {
        v = _ref4[i];
        if (i % 2 === 0) {
          this.keys.push(v);
        } else {
          this.vals.push(v);
        }
      }
      this.val = false;
    }

    Map.prototype.value = function() {
      var i, result, v, _i, _len, _ref4;

      result = [];
      _ref4 = this.keys;
      for (i = _i = 0, _len = _ref4.length; _i < _len; i = ++_i) {
        v = _ref4[i];
        result.push(v);
        if (this.vals[i] != null) {
          result.push(this.vals[i]);
        }
      }
      return result;
    };

    Map.prototype.exists = function(key) {
      var i, k, _i, _len, _ref4;

      _ref4 = this.keys;
      for (i = _i = 0, _len = _ref4.length; _i < _len; i = ++_i) {
        k = _ref4[i];
        if (us.isEqual(k, key)) {
          return i;
        }
      }
      return void 0;
    };

    Map.prototype.at = function(key) {
      var id;

      if ((id = this.exists(key)) != null) {
        return this.vals[id];
      } else {
        throw "key does not exist";
      }
    };

    Map.prototype.set = function(key, val) {
      var id;

      if ((id = this.exists(key)) != null) {
        this.vals[id] = val;
      } else {
        this.keys.push(key);
        this.vals.push(val);
      }
      return this;
    };

    return Map;

  })();

  parens = '()[]{}';

  specialChars = parens + ' \t\n\r,';

  escapeChar = '\\';

  parenTypes = {
    '(': {
      closing: ')',
      "class": List
    },
    '[': {
      closing: ']',
      "class": Vector
    },
    '{': {
      closing: '}',
      "class": Map
    }
  };

  lex = function(string) {
    var c, escaping, in_comment, in_string, list, token, _i, _len;

    list = [];
    token = '';
    for (_i = 0, _len = string.length; _i < _len; _i++) {
      c = string[_i];
      if ((typeof in_string === "undefined" || in_string === null) && c === ";") {
        in_comment = true;
      }
      if (in_comment) {
        if (c === "\n") {
          in_comment = void 0;
          if (token) {
            list.push(token);
            token = '';
          }
        }
        continue;
      }
      if (c === '"' && (typeof escaping === "undefined" || escaping === null)) {
        if (typeof in_string !== "undefined" && in_string !== null) {
          list.push(new StringObj(in_string));
          in_string = void 0;
        } else {
          in_string = '';
        }
        continue;
      }
      if (in_string != null) {
        if (c === escapeChar && (typeof escaping === "undefined" || escaping === null)) {
          escaping = true;
          continue;
        }
        if (escaping != null) {
          escaping = void 0;
        }
        in_string += c;
      } else if (__indexOf.call(specialChars, c) >= 0) {
        if (token) {
          list.push(token);
          token = '';
        }
        if (__indexOf.call(parens, c) >= 0) {
          list.push(c);
        }
      } else {
        if (token === "#_") {
          list.push(token);
          token = '';
        }
        token += c;
      }
    }
    if (token) {
      list.push(token);
    }
    return list;
  };

  read = function(tokens) {
    var read_ahead, result, token1;

    read_ahead = function(token) {
      var L, closeParen, handledToken, paren, tagged;

      if (token === void 0) {
        return;
      }
      if (paren = parenTypes[token]) {
        closeParen = paren.closing;
        L = [];
        while (true) {
          token = tokens.shift();
          if (token === void 0) {
            throw 'unexpected end of list';
          }
          if (token === paren.closing) {
            return new paren["class"](L);
          } else {
            L.push(read_ahead(token));
          }
        }
      } else if (__indexOf.call(")]}", token) >= 0) {
        throw "unexpected " + token;
      } else {
        handledToken = handle(token);
        if (handledToken instanceof Tag) {
          token = tokens.shift();
          if (token === void 0) {
            throw 'was expecting something to follow a tag';
          }
          tagged = new Tagged(handledToken, read_ahead(token));
          if (tagged.tag().dn() === "") {
            if (tagged.obj() instanceof Map) {
              return new Set(tagged.obj().value());
            }
          }
          if (tagged.tag().dn() === "_") {
            return new Discard;
          }
          if (tagActions[tagged.tag().dn()] != null) {
            return tagActions[tagged.tag().dn()].action(tagged.obj());
          }
          return tagged;
        } else {
          return handledToken;
        }
      }
    };
    token1 = tokens.shift();
    if (token1 === void 0) {
      return void 0;
    } else {
      result = read_ahead(token1);
      if (result instanceof Discard) {
        return "";
      }
      return result;
    }
  };

  handle = function(token) {
    var handler, name;

    if (token instanceof StringObj) {
      return token.toString();
    }
    for (name in tokenHandlers) {
      handler = tokenHandlers[name];
      if (handler.pattern.test(token)) {
        return handler.action(token);
      }
    }
    return sym(token);
  };

  tokenHandlers = {
    nil: {
      pattern: /^nil$/,
      action: function(token) {
        return null;
      }
    },
    boolean: {
      pattern: /^true$|^false$/,
      action: function(token) {
        return token === "true";
      }
    },
    character: {
      pattern: /^\\[A-z0-9]$/,
      action: function(token) {
        return token.slice(-1);
      }
    },
    tab: {
      pattern: /^\\tab$/,
      action: function(token) {
        return "\t";
      }
    },
    newLine: {
      pattern: /^\\newline$/,
      action: function(token) {
        return "\n";
      }
    },
    space: {
      pattern: /^\\space$/,
      action: function(token) {
        return " ";
      }
    },
    keyword: {
      pattern: /^[\:\?].*$/,
      action: function(token) {
        return kw(token);
      }
    },
    integer: {
      pattern: /^\-?[0-9]*$/,
      action: function(token) {
        return parseInt(token);
      }
    },
    float: {
      pattern: /^\-?[0-9]*\.[0-9]*$/,
      action: function(token) {
        return parseFloat(token);
      }
    },
    tagged: {
      pattern: /^#.*$/,
      action: function(token) {
        return new Tag(token.slice(1));
      }
    }
  };

  tagActions = {
    uuid: {
      tag: new Tag("uuid"),
      action: function(obj) {
        return obj;
      }
    },
    inst: {
      tag: new Tag("inst"),
      action: function(obj) {
        return obj;
      }
    }
  };

  encodeHandlers = {
    array: {
      test: function(obj) {
        return us.isArray(obj);
      },
      action: function(obj) {
        var v;

        return "[" + (((function() {
          var _i, _len, _results;

          _results = [];
          for (_i = 0, _len = obj.length; _i < _len; _i++) {
            v = obj[_i];
            _results.push(encode(v));
          }
          return _results;
        })()).join(" ")) + "]";
      }
    },
    integer: {
      test: function(obj) {
        return us.isNumber(obj) && tokenHandlers.integer.pattern.test(obj);
      },
      action: function(obj) {
        return parseInt(obj);
      }
    },
    float: {
      test: function(obj) {
        return us.isNumber(obj) && tokenHandlers.float.pattern.test(obj);
      },
      action: function(obj) {
        return parseFloat(obj);
      }
    },
    string: {
      test: function(obj) {
        return us.isString(obj);
      },
      action: function(obj) {
        return "\"" + (obj.toString().replace(/"/g, '\\"')) + "\"";
      }
    },
    boolean: {
      test: function(obj) {
        return us.isBoolean(obj);
      },
      action: function(obj) {
        if (obj) {
          return "true";
        } else {
          return "false";
        }
      }
    },
    "null": {
      test: function(obj) {
        return us.isNull(obj);
      },
      action: function(obj) {
        return "nil";
      }
    },
    object: {
      test: function(obj) {
        return us.isObject(obj);
      },
      action: function(obj) {
        var k, result, v;

        result = [];
        for (k in obj) {
          v = obj[k];
          result.push(encode(k));
          result.push(encode(v));
        }
        return "{" + (result.join(" ")) + "}";
      }
    }
  };

  encode = function(obj) {
    var handler, name;

    if ((obj != null ? obj.ednEncode : void 0) != null) {
      return obj.ednEncode();
    }
    for (name in encodeHandlers) {
      handler = encodeHandlers[name];
      if (handler.test(obj)) {
        return handler.action(obj);
      }
    }
    throw "unhandled encoding for " + (JSON.stringify(obj));
  };

  encodeJson = function(obj, prettyPrint) {
    if (obj.jsonEncode != null) {
      return encodeJson(obj.jsonEncode(), prettyPrint);
    }
    if (prettyPrint) {
      return JSON.stringify(obj, null, 4);
    } else {
      return JSON.stringify(obj);
    }
  };

  atPath = function(obj, path) {
    var part, value, _i, _len;

    path = path.trim().replace(/[ ]{2,}/g, ' ').split(' ');
    value = obj;
    for (_i = 0, _len = path.length; _i < _len; _i++) {
      part = path[_i];
      if (part[0] === ":") {
        part = kw(part);
      }
      if (value.exists) {
        if (value.exists(part) != null) {
          value = value.at(part);
        } else {
          throw "Could not find " + part;
        }
      } else {
        throw "Not a composite object";
      }
    }
    return value;
  };

  symbols = {};

  sym = function(val) {
    if (symbols[val] == null) {
      symbols[val] = new Symbol(val);
    }
    return symbols[val];
  };

  keywords = {};

  kw = function(word) {
    if (keywords[word] == null) {
      keywords[word] = new Keyword(word);
    }
    return keywords[word];
  };

  exports.Symbol = Symbol;

  exports.sym = sym;

  exports.Keyword = Keyword;

  exports.kw = kw;

  exports.List = List;

  exports.Vector = Vector;

  exports.Map = Map;

  exports.Set = Set;

  exports.Tag = Tag;

  exports.Tagged = Tagged;

  exports.setTagAction = function(tag, action) {
    return tagActions[tag.dn()] = {
      tag: tag,
      action: action
    };
  };

  exports.setTokenHandler = function(handler, pattern, action) {
    return tokenHandlers[handler] = {
      pattern: pattern,
      action: action
    };
  };

  exports.setTokenPattern = function(handler, pattern) {
    return tokenHandlers[handler].pattern = pattern;
  };

  exports.setTokenAction = function(handler, action) {
    return tokenHandlers[handler].action = action;
  };

  exports.setEncodeHandler = function(handler, test, action) {
    return encodeHandlers[handler] = {
      test: test,
      action: action
    };
  };

  exports.setEncodeTest = function(type, test) {
    return encodeHandlers[type].test = test;
  };

  exports.setEncodeAction = function(type, action) {
    return encodeHandlers[type].action = action;
  };

  exports.parse = function(string) {
    return read(lex(string));
  };

  exports.encode = encode;

  exports.encodeJson = encodeJson;

  exports.atPath = atPath;

  exports.toJS = function(obj) {
    if (obj.jsEncode != null) {
      return obj.jsEncode();
    } else {
      return obj;
    }
  };

  if (typeof window === "undefined") {
    fs = require("fs");
    exports.readFile = function(file, cb) {
      return fs.readFile(file, "utf-8", function(err, data) {
        if (err) {
          throw err;
        }
        return cb(exports.parse(data));
      });
    };
    exports.readFileSync = function(file) {
      return exports.parse(fs.readFileSync(file, "utf-8"));
    };
  }

  exports.compile = function(string) {
    return "return require('jsedn').parse(\"" + (string.replace(/"/g, '\\"').replace(/\n/g, " ").trim()) + "\")";
  };

}).call(this);

});
require.register("shaunxcode-bling/index.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.2
(function() {
  var addToEnv, bling, parseTag, _,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __slice = [].slice;

  _ = require("underscore");

  parseTag = function(str, defaultTag) {
    var bindTo, i, id, k, klass, rest, tag, _i, _len, _ref, _ref1, _ref2;

    bindTo = {
      id: false,
      "class": [],
      tag: false
    };
    if (__indexOf.call(str, "#") >= 0) {
      _ref = str.split("#"), tag = _ref[0], rest = _ref[1];
      if (!tag.length) {
        tag = defaultTag;
      }
      _ref1 = rest.split("."), id = _ref1[0], klass = 2 <= _ref1.length ? __slice.call(_ref1, 1) : [];
    } else if (__indexOf.call(str, ".") >= 0) {
      id = false;
      _ref2 = str.split("."), tag = _ref2[0], klass = 2 <= _ref2.length ? __slice.call(_ref2, 1) : [];
      if (!tag.length) {
        tag = defaultTag;
      }
    } else {
      tag = str;
      id = false;
      klass = false;
    }
    if (id[0] === "@") {
      bindTo.id = true;
      id = id.slice(1);
    }
    if (tag[0] === "@") {
      bindTo.tag = true;
      tag = tag.slice(1);
    }
    for (i = _i = 0, _len = klass.length; _i < _len; i = ++_i) {
      k = klass[i];
      if (k[0] === "@") {
        klass[i] = k.slice(1);
        bindTo["class"].push(klass[i]);
      }
    }
    return {
      tagName: tag,
      "class": klass,
      id: id,
      bindTo: bindTo
    };
  };

  addToEnv = function(env, key, val) {
    if (env[key] == null) {
      env[key] = $();
    }
    return env[key] = env[key].add(val);
  };

  bling = function(str, options, onCreate) {
    var $tag, appendTo, depth, elAttrs, env, i, k, klass, part, parts, rootTag, tag, tags, v, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;

    if (options == null) {
      options = {};
    }
    if (_.isFunction(options)) {
      options = {
        onCreate: options
      };
    }
    if (_.isFunction(onCreate)) {
      options.onCreate = onCreate;
    }
    options.onCreate || (options.onCreate = function() {});
    options.appendTo || (options.appendTo = false);
    options.defaultTag || (options.defaultTag = "div");
    options.self || (options.self = {});
    elAttrs = {};
    for (k in options) {
      v = options[k];
      if (k !== "appendTo" && k !== "onCreate" && k !== "defaultTag" && k !== "self") {
        elAttrs[k] = v;
      }
    }
    env = {};
    tags = [];
    appendTo = options.appendTo;
    rootTag = false;
    depth = 0;
    if (_.isString(appendTo)) {
      appendTo = $(appendTo);
    }
    parts = str.replace(/\,/g, ' , ').replace(/\s+/g, ' ').split(' ');
    for (i = _i = 0, _len = parts.length; _i < _len; i = ++_i) {
      part = parts[i];
      if (!(part !== ",")) {
        continue;
      }
      tag = parseTag(part.trim(), options.defaultTag);
      tags.push($tag = $("<" + tag.tagName + "/>", elAttrs));
      if (appendTo) {
        $tag.appendTo(appendTo);
      } else if (depth === 0) {
        if (!rootTag) {
          rootTag = $tag;
        } else {
          rootTag = rootTag.add($tag);
        }
      }
      addToEnv(env, tag.tagName, $tag);
      if (tag["class"]) {
        $tag.addClass(tag["class"].join(" "));
        _ref = tag["class"];
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          klass = _ref[_j];
          addToEnv(env, klass, $tag);
        }
      }
      if (tag.id) {
        $tag.attr({
          id: tag.id
        });
        addToEnv(env, tag.id, $tag);
      }
      if (tag.bindTo.id) {
        options.self["$" + tag.id] = $tag;
      }
      _ref1 = tag.bindTo["class"];
      for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
        k = _ref1[_k];
        options.self["$" + k] = $tag;
      }
      if (tag.bindTo.tag) {
        options.self["$" + tag.tagName] = $tag;
      }
      if ((parts[i + 1] != null) && parts[i + 1] === ",") {
        continue;
      }
      appendTo = $tag;
      depth++;
    }
    env._ = options.self;
    if ((_ref2 = options.onCreate) != null) {
      _ref2.apply(env, tags);
    }
    return rootTag;
  };

  bling.version = "0.0.6";

  module.exports = bling;

}).call(this);

});
require.register("shaunxcode-CartographicSurface/index.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.1
(function() {
  var CartographicSurface, bling;

  bling = require("bling");

  CartographicSurface = (function() {

    function CartographicSurface(options) {
      this.surface = options.surface;
      this.selector = options.selector;
      this.scale = options.scale;
      this.nodes = {};
    }

    CartographicSurface.prototype.render = function() {
      var self,
        _this = this;
      self = this;
      this.$win = $(window);
      this.$el = bling(".CartographicSurface .nodes, .ViewPort", function() {
        var _this = this;
        self.nodesEl = this.nodes;
        self.viewPortEl = this.ViewPort;
        return this.ViewPort.draggable({
          containment: "parent",
          stop: function(event, data) {
            return $(window).scrollLeft(data.position.left * self.scaleUp).scrollTop(data.position.top * self.scaleUp);
          }
        });
      });
      $(window).on("scroll.CartographicSurface resize.CartographicSurface", function() {
        return _this.drawViewPort();
      });
      this.surfaceEl = $(this.surface);
      this.drawViewPort();
      this.drawNodes();
      this.$el.css({
        width: this.surfaceEl.width() * this.scale,
        height: this.surfaceEl.height() * this.scale
      });
      this.$el.click(function(e) {
        return _this.$win.scrollLeft((e.clientX - (_this.$el.offset().left - _this.$win.scrollLeft()) - (_this.viewPortWidth / 2)) * _this.scaleUp).scrollTop((e.clientY - (_this.$el.offset().top - _this.$win.scrollTop()) - (_this.viewPortHeight / 2)) * _this.scaleUp);
      });
      $(window).resize();
      return this;
    };

    CartographicSurface.prototype.drawViewPort = function() {
      this.viewPortEl.css({
        width: this.viewPortWidth = this.$win.width() * this.scale,
        height: this.viewPortHeight = this.$win.height() * this.scale,
        left: this.$win.scrollLeft() * this.scale,
        top: this.$win.scrollTop() * this.scale
      });
      this.scaleUp = this.surfaceEl.width() / this.$el.width();
      return this;
    };

    CartographicSurface.prototype.drawNodes = function() {
      var self,
        _this = this;
      self = this;
      $("" + this.surface + " " + this.selector).each(function(i, el) {
        var id, positionNode, _$el;
        _$el = $(el).uniqueId();
        id = _$el.attr("id");
        if (_this.nodes[id] == null) {
          _this.nodes[id] = (bling(".node")).appendTo(_this.nodesEl);
          _$el.on("remove.CartographicSurface", function() {
            self.nodes[id].remove();
            return delete self.nodes[id];
          });
          _$el.on("resize.CartographicSurface", function() {
            return positionNode();
          });
          _$el.on("drag.CartographicSurface", function() {
            return positionNode();
          });
          _$el.on({
            append: function() {
              return positionNode();
            }
          });
          _$el.data("CartographicSurfaceNode", _this.nodes[id]);
        }
        positionNode = function() {
          var pos;
          pos = _$el.offset();
          return self.nodes[id].css({
            left: pos.left * self.scale,
            top: pos.top * self.scale,
            width: _$el.width() * self.scale,
            height: _$el.height() * self.scale
          });
        };
        return positionNode();
      });
      return this;
    };

    return CartographicSurface;

  })();

  module.exports = CartographicSurface;

}).call(this);

});
require.register("component-classes/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var index = require('indexof');

/**
 * Whitespace regexp.
 */

var re = /\s+/;

/**
 * toString reference.
 */

var toString = Object.prototype.toString;

/**
 * Wrap `el` in a `ClassList`.
 *
 * @param {Element} el
 * @return {ClassList}
 * @api public
 */

module.exports = function(el){
  return new ClassList(el);
};

/**
 * Initialize a new ClassList for `el`.
 *
 * @param {Element} el
 * @api private
 */

function ClassList(el) {
  this.el = el;
  this.list = el.classList;
}

/**
 * Add class `name` if not already present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.add = function(name){
  // classList
  if (this.list) {
    this.list.add(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = index(arr, name);
  if (!~i) arr.push(name);
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Remove class `name` when present, or
 * pass a regular expression to remove
 * any which match.
 *
 * @param {String|RegExp} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.remove = function(name){
  if ('[object RegExp]' == toString.call(name)) {
    return this.removeMatching(name);
  }

  // classList
  if (this.list) {
    this.list.remove(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = index(arr, name);
  if (~i) arr.splice(i, 1);
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Remove all classes matching `re`.
 *
 * @param {RegExp} re
 * @return {ClassList}
 * @api private
 */

ClassList.prototype.removeMatching = function(re){
  var arr = this.array();
  for (var i = 0; i < arr.length; i++) {
    if (re.test(arr[i])) {
      this.remove(arr[i]);
    }
  }
  return this;
};

/**
 * Toggle class `name`.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.toggle = function(name){
  // classList
  if (this.list) {
    this.list.toggle(name);
    return this;
  }

  // fallback
  if (this.has(name)) {
    this.remove(name);
  } else {
    this.add(name);
  }
  return this;
};

/**
 * Return an array of classes.
 *
 * @return {Array}
 * @api public
 */

ClassList.prototype.array = function(){
  var arr = this.el.className.split(re);
  if ('' === arr[0]) arr.pop();
  return arr;
};

/**
 * Check if class `name` is present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.has =
ClassList.prototype.contains = function(name){
  return this.list
    ? this.list.contains(name)
    : !! ~index(this.array(), name);
};

});
require.register("shaunxcode-sketch/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var Path = require('./path')
  , classes = require('classes');

/**
 * Create a new `Sketch` for the given `canvas`.
 *
 * @param {Canvas} canvas
 * @return {Sketch}
 * @api public
 */

module.exports = function(canvas){
  return new Sketch(canvas);
};

/**
 * Initialize a new `Sketch` with the given `canvas`.
 *
 * @param {Canvas} canvas
 * @api public
 */

function Sketch(canvas) {
  this.canvas = canvas;
  this.ctx = canvas.getContext('2d');
  this.bind();
  this.objs = [];
  this.size(1.5);
  this.color('black');
  this.backgroundColor('white');
  classes(canvas).add('sketch');
  this.draw();
}

/**
 * export data for serialization
 *
 * @return [Path]
 * @api public
 */

Sketch.prototype.export = function() {
  return this.objs;
};

/**
 * import paths for drawing
 *
 * @param [{points: [{x, y}], size: Number, opacity: Number, color: {Color}}] 
 * @return {Sketch}
 * @api public
 */

Sketch.prototype.import = function(objs) {
  for (var i = 0; i < objs.length; ++i) {
    var obj = objs[i]
    var path = new Path;
    path.points = obj.points;
    path.size = obj.size;
    path.color = obj.color;
    this.objs.push(path);
  }
  return this;
};

/**
 * Add drawable `obj`, which must
 * provide a `.draw(ctx)` method.
 *
 * @param {Object} obj
 * @return {Sketch}
 * @api public
 */

Sketch.prototype.add = function(obj){
  this.objs.push(obj);
  return this;
};

/**
 * Reset the sketch defaults and clear the canvas.
 *
 * @api public
 */

Sketch.prototype.reset = function(){
  this.clear();
  this.size(1.5);
  this.color('black');
};

/**
 * Clear the objects and re-draw.
 *
 * @api public
 */

Sketch.prototype.clear = function(){
  this.objs = [];
  this.draw();
};

/**
 * Set pen `size`.
 *
 * @param {Number} size
 * @return {Sketch}
 * @api public
 */

Sketch.prototype.size = function(size){
  this._size = size;
  return this;
};

/**
 * Set background `color`.
 *
 * @param {String} color
 * @return {Sketch}
 * @api public
 */

Sketch.prototype.backgroundColor = function(color){
  this._backgroundColor = color;
  return this;
};


/**
 * Set pen `color`.
 *
 * @param {String} color
 * @return {Sketch}
 * @api public
 */

Sketch.prototype.color = function(color){
  this._color = color;
  return this;
};

/**
 * Set pen `opacity`.
 *
 * @param {String} opacity
 * @return {Sketch}
 * @api public
 */

Sketch.prototype.opacity = function(opacity){
  this._opacity = opacity;
  return this;
};

/**
 * Bind event handlers.
 *
 * @api private
 */

Sketch.prototype.bind = function(){
  this.canvas.addEventListener('mousedown', this.onmousedown.bind(this), false);
  this.canvas.addEventListener('mousemove', this.onmousemove.bind(this), false);
  this.canvas.addEventListener('mouseup', this.onmouseup.bind(this), false);
};

/**
 * Handle mousedown:
 *
 *   - add a new path
 *   - add initial point
 *   - redraw
 *
 * @api private
 */

Sketch.prototype.onmousedown = function(e){
  e.preventDefault();
  this.down = e;
  var x = e.offsetX;
  var y = e.offsetY;
  var path = this.path = new Path;
  path.opacity = 0.8;
  path.color = this._color;
  path.size = this._size;
  path.addPoint(x, y);
  path.addPoint(x + .1, y + .1);
  this.objs.push(path);
  this.draw();
};

/**
 * Handle mousemove:
 *
 *   - add new point
 *   - redraw
 *
 * @api private
 */

Sketch.prototype.onmousemove = function(e){
  if (!this.down) return;
  this.path.addPoint(e.offsetX, e.offsetY);
  this.draw();
};

/**
 * Handle mouseup:
 *
 *   - reset state
 *
 * @api private
 */

Sketch.prototype.onmouseup = function(e){
  this.down = null;
};

/**
 * Re-draw the sketch.
 *
 * @api private
 */

Sketch.prototype.draw = function(){
  var ctx = this.ctx;
  ctx.fillStyle = this._backgroundColor;
  ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  for (var i = 0; i < this.objs.length; ++i) {
    this.objs[i].draw(this.ctx);
  }
};


});
require.register("shaunxcode-sketch/point.js", function(exports, require, module){

/**
 * Expose `Point`.
 */

module.exports = Point;

/**
 * Initialize a new point.
 *
 * @param {Number} x
 * @param {Number} y
 * @api public
 */

function Point(x, y) {
  this.x = x;
  this.y = y;
}
});
require.register("shaunxcode-sketch/path.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var Point = require('./point');

/**
 * Expose `Path`.
 */

module.exports = Path;

/**
 * Initialize a new `Path`.
 *
 * @api private
 */

function Path() {
  this.points = [];
  this.size = 5;
}

/**
 * Path opacity.
 */

Path.prototype.opacity = 1;

/**
 * Add the given point.
 *
 * @param {Number} x
 * @param {Number} y
 * @api private
 */

Path.prototype.addPoint = function(x, y){
  this.points.push(new Point(x, y));
};

/**
 * Draw the object.
 *
 * @param {CanvasRenderingContext2d} ctx
 * @api private
 */

Path.prototype.draw = function(ctx){
  var points = this.points
    , len = points.length
    , a, b
    , call;

  ctx.save();

  ctx.beginPath();
  ctx.globalAlpha = this.opacity;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.lineWidth = this.size;
  ctx.strokeStyle = this.color;

  a = points[0];
  ctx.moveTo(a.x, a.y);

  for (var i = 0; i < len - 1; ++i) {
    a = points[i];
    b = points[i + 1];
    ctx.quadraticCurveTo(
        a.x
      , a.y
      , a.x + (b.x - a.x) / 2
      , a.y + (b.y - a.y) / 2)
  }

  ctx.lineTo(b.x, b.y);
  ctx.stroke();

  ctx.restore();
};
});
require.register("component-jquery/index.js", function(exports, require, module){
/*!
 * jQuery JavaScript Library v1.9.1
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright 2005, 2012 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2013-2-4
 */
(function( window, undefined ) {

// Can't do this because several apps including ASP.NET trace
// the stack via arguments.caller.callee and Firefox dies if
// you try to trace through "use strict" call chains. (#13335)
// Support: Firefox 18+
//"use strict";
var
	// The deferred used on DOM ready
	readyList,

	// A central reference to the root jQuery(document)
	rootjQuery,

	// Support: IE<9
	// For `typeof node.method` instead of `node.method !== undefined`
	core_strundefined = typeof undefined,

	// Use the correct document accordingly with window argument (sandbox)
	document = window.document,
	location = window.location,

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$,

	// [[Class]] -> type pairs
	class2type = {},

	// List of deleted data cache ids, so we can reuse them
	core_deletedIds = [],

	core_version = "1.9.1",

	// Save a reference to some core methods
	core_concat = core_deletedIds.concat,
	core_push = core_deletedIds.push,
	core_slice = core_deletedIds.slice,
	core_indexOf = core_deletedIds.indexOf,
	core_toString = class2type.toString,
	core_hasOwn = class2type.hasOwnProperty,
	core_trim = core_version.trim,

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {
		// The jQuery object is actually just the init constructor 'enhanced'
		return new jQuery.fn.init( selector, context, rootjQuery );
	},

	// Used for matching numbers
	core_pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,

	// Used for splitting on whitespace
	core_rnotwhite = /\S+/g,

	// Make sure we trim BOM and NBSP (here's looking at you, Safari 5.0 and IE)
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// Strict HTML recognition (#11290: must start with <)
	rquickExpr = /^(?:(<[\w\W]+>)[^>]*|#([\w-]*))$/,

	// Match a standalone tag
	rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,

	// JSON RegExp
	rvalidchars = /^[\],:{}\s]*$/,
	rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,
	rvalidescape = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
	rvalidtokens = /"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g,

	// Matches dashed string for camelizing
	rmsPrefix = /^-ms-/,
	rdashAlpha = /-([\da-z])/gi,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return letter.toUpperCase();
	},

	// The ready event handler
	completed = function( event ) {

		// readyState === "complete" is good enough for us to call the dom ready in oldIE
		if ( document.addEventListener || event.type === "load" || document.readyState === "complete" ) {
			detach();
			jQuery.ready();
		}
	},
	// Clean-up method for dom ready events
	detach = function() {
		if ( document.addEventListener ) {
			document.removeEventListener( "DOMContentLoaded", completed, false );
			window.removeEventListener( "load", completed, false );

		} else {
			document.detachEvent( "onreadystatechange", completed );
			window.detachEvent( "onload", completed );
		}
	};

jQuery.fn = jQuery.prototype = {
	// The current version of jQuery being used
	jquery: core_version,

	constructor: jQuery,
	init: function( selector, context, rootjQuery ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && (match[1] || !context) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[1] ) {
					context = context instanceof jQuery ? context[0] : context;

					// scripts is true for back-compat
					jQuery.merge( this, jQuery.parseHTML(
						match[1],
						context && context.nodeType ? context.ownerDocument || context : document,
						true
					) );

					// HANDLE: $(html, props)
					if ( rsingleTag.test( match[1] ) && jQuery.isPlainObject( context ) ) {
						for ( match in context ) {
							// Properties of context are called as methods if possible
							if ( jQuery.isFunction( this[ match ] ) ) {
								this[ match ]( context[ match ] );

							// ...and otherwise set as attributes
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

					return this;

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[2] );

					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Handle the case where IE and Opera return items
						// by name instead of ID
						if ( elem.id !== match[2] ) {
							return rootjQuery.find( selector );
						}

						// Otherwise, we inject the element directly into the jQuery object
						this.length = 1;
						this[0] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || rootjQuery ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(DOMElement)
		} else if ( selector.nodeType ) {
			this.context = this[0] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return rootjQuery.ready( selector );
		}

		if ( selector.selector !== undefined ) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	},

	// Start with an empty selector
	selector: "",

	// The default length of a jQuery object is 0
	length: 0,

	// The number of elements contained in the matched element set
	size: function() {
		return this.length;
	},

	toArray: function() {
		return core_slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num == null ?

			// Return a 'clean' array
			this.toArray() :

			// Return just the object
			( num < 0 ? this[ this.length + num ] : this[ num ] );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;
		ret.context = this.context;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	// (You can seed the arguments with an array of args, but this is
	// only used internally.)
	each: function( callback, args ) {
		return jQuery.each( this, callback, args );
	},

	ready: function( fn ) {
		// Add the callback
		jQuery.ready.promise().done( fn );

		return this;
	},

	slice: function() {
		return this.pushStack( core_slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[j] ] : [] );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map(this, function( elem, i ) {
			return callback.call( elem, i, elem );
		}));
	},

	end: function() {
		return this.prevObject || this.constructor(null);
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: core_push,
	sort: [].sort,
	splice: [].splice
};

// Give the init function the jQuery prototype for later instantiation
jQuery.fn.init.prototype = jQuery.fn;

jQuery.extend = jQuery.fn.extend = function() {
	var src, copyIsArray, copy, name, options, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	if ( length === i ) {
		target = this;
		--i;
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray(src) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend({
	noConflict: function( deep ) {
		if ( window.$ === jQuery ) {
			window.$ = _$;
		}

		if ( deep && window.jQuery === jQuery ) {
			window.jQuery = _jQuery;
		}

		return jQuery;
	},

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
		if ( !document.body ) {
			return setTimeout( jQuery.ready );
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );

		// Trigger any bound ready events
		if ( jQuery.fn.trigger ) {
			jQuery( document ).trigger("ready").off("ready");
		}
	},

	// See test/unit/core.js for details concerning isFunction.
	// Since version 1.3, DOM methods and functions like alert
	// aren't supported. They return false on IE (#2968).
	isFunction: function( obj ) {
		return jQuery.type(obj) === "function";
	},

	isArray: Array.isArray || function( obj ) {
		return jQuery.type(obj) === "array";
	},

	isWindow: function( obj ) {
		return obj != null && obj == obj.window;
	},

	isNumeric: function( obj ) {
		return !isNaN( parseFloat(obj) ) && isFinite( obj );
	},

	type: function( obj ) {
		if ( obj == null ) {
			return String( obj );
		}
		return typeof obj === "object" || typeof obj === "function" ?
			class2type[ core_toString.call(obj) ] || "object" :
			typeof obj;
	},

	isPlainObject: function( obj ) {
		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well
		if ( !obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		try {
			// Not own constructor property must be Object
			if ( obj.constructor &&
				!core_hasOwn.call(obj, "constructor") &&
				!core_hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
				return false;
			}
		} catch ( e ) {
			// IE8,9 Will throw exceptions on certain host objects #9897
			return false;
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.

		var key;
		for ( key in obj ) {}

		return key === undefined || core_hasOwn.call( obj, key );
	},

	isEmptyObject: function( obj ) {
		var name;
		for ( name in obj ) {
			return false;
		}
		return true;
	},

	error: function( msg ) {
		throw new Error( msg );
	},

	// data: string of html
	// context (optional): If specified, the fragment will be created in this context, defaults to document
	// keepScripts (optional): If true, will include scripts passed in the html string
	parseHTML: function( data, context, keepScripts ) {
		if ( !data || typeof data !== "string" ) {
			return null;
		}
		if ( typeof context === "boolean" ) {
			keepScripts = context;
			context = false;
		}
		context = context || document;

		var parsed = rsingleTag.exec( data ),
			scripts = !keepScripts && [];

		// Single tag
		if ( parsed ) {
			return [ context.createElement( parsed[1] ) ];
		}

		parsed = jQuery.buildFragment( [ data ], context, scripts );
		if ( scripts ) {
			jQuery( scripts ).remove();
		}
		return jQuery.merge( [], parsed.childNodes );
	},

	parseJSON: function( data ) {
		// Attempt to parse using the native JSON parser first
		if ( window.JSON && window.JSON.parse ) {
			return window.JSON.parse( data );
		}

		if ( data === null ) {
			return data;
		}

		if ( typeof data === "string" ) {

			// Make sure leading/trailing whitespace is removed (IE can't handle it)
			data = jQuery.trim( data );

			if ( data ) {
				// Make sure the incoming data is actual JSON
				// Logic borrowed from http://json.org/json2.js
				if ( rvalidchars.test( data.replace( rvalidescape, "@" )
					.replace( rvalidtokens, "]" )
					.replace( rvalidbraces, "")) ) {

					return ( new Function( "return " + data ) )();
				}
			}
		}

		jQuery.error( "Invalid JSON: " + data );
	},

	// Cross-browser xml parsing
	parseXML: function( data ) {
		var xml, tmp;
		if ( !data || typeof data !== "string" ) {
			return null;
		}
		try {
			if ( window.DOMParser ) { // Standard
				tmp = new DOMParser();
				xml = tmp.parseFromString( data , "text/xml" );
			} else { // IE
				xml = new ActiveXObject( "Microsoft.XMLDOM" );
				xml.async = "false";
				xml.loadXML( data );
			}
		} catch( e ) {
			xml = undefined;
		}
		if ( !xml || !xml.documentElement || xml.getElementsByTagName( "parsererror" ).length ) {
			jQuery.error( "Invalid XML: " + data );
		}
		return xml;
	},

	noop: function() {},

	// Evaluates a script in a global context
	// Workarounds based on findings by Jim Driscoll
	// http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
	globalEval: function( data ) {
		if ( data && jQuery.trim( data ) ) {
			// We use execScript on Internet Explorer
			// We use an anonymous function so that context is window
			// rather than jQuery in Firefox
			( window.execScript || function( data ) {
				window[ "eval" ].call( window, data );
			} )( data );
		}
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
	},

	// args is for internal usage only
	each: function( obj, callback, args ) {
		var value,
			i = 0,
			length = obj.length,
			isArray = isArraylike( obj );

		if ( args ) {
			if ( isArray ) {
				for ( ; i < length; i++ ) {
					value = callback.apply( obj[ i ], args );

					if ( value === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					value = callback.apply( obj[ i ], args );

					if ( value === false ) {
						break;
					}
				}
			}

		// A special, fast, case for the most common use of each
		} else {
			if ( isArray ) {
				for ( ; i < length; i++ ) {
					value = callback.call( obj[ i ], i, obj[ i ] );

					if ( value === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					value = callback.call( obj[ i ], i, obj[ i ] );

					if ( value === false ) {
						break;
					}
				}
			}
		}

		return obj;
	},

	// Use native String.trim function wherever possible
	trim: core_trim && !core_trim.call("\uFEFF\xA0") ?
		function( text ) {
			return text == null ?
				"" :
				core_trim.call( text );
		} :

		// Otherwise use our own trimming functionality
		function( text ) {
			return text == null ?
				"" :
				( text + "" ).replace( rtrim, "" );
		},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( isArraylike( Object(arr) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
					[ arr ] : arr
				);
			} else {
				core_push.call( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		var len;

		if ( arr ) {
			if ( core_indexOf ) {
				return core_indexOf.call( arr, elem, i );
			}

			len = arr.length;
			i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

			for ( ; i < len; i++ ) {
				// Skip accessing in sparse arrays
				if ( i in arr && arr[ i ] === elem ) {
					return i;
				}
			}
		}

		return -1;
	},

	merge: function( first, second ) {
		var l = second.length,
			i = first.length,
			j = 0;

		if ( typeof l === "number" ) {
			for ( ; j < l; j++ ) {
				first[ i++ ] = second[ j ];
			}
		} else {
			while ( second[j] !== undefined ) {
				first[ i++ ] = second[ j++ ];
			}
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, inv ) {
		var retVal,
			ret = [],
			i = 0,
			length = elems.length;
		inv = !!inv;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			retVal = !!callback( elems[ i ], i );
			if ( inv !== retVal ) {
				ret.push( elems[ i ] );
			}
		}

		return ret;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var value,
			i = 0,
			length = elems.length,
			isArray = isArraylike( elems ),
			ret = [];

		// Go through the array, translating each of the items to their
		if ( isArray ) {
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}

		// Go through every key on the object,
		} else {
			for ( i in elems ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}
		}

		// Flatten any nested arrays
		return core_concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	proxy: function( fn, context ) {
		var args, proxy, tmp;

		if ( typeof context === "string" ) {
			tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		args = core_slice.call( arguments, 2 );
		proxy = function() {
			return fn.apply( context || this, args.concat( core_slice.call( arguments ) ) );
		};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || jQuery.guid++;

		return proxy;
	},

	// Multifunctional method to get and set values of a collection
	// The value/s can optionally be executed if it's a function
	access: function( elems, fn, key, value, chainable, emptyGet, raw ) {
		var i = 0,
			length = elems.length,
			bulk = key == null;

		// Sets many values
		if ( jQuery.type( key ) === "object" ) {
			chainable = true;
			for ( i in key ) {
				jQuery.access( elems, fn, i, key[i], true, emptyGet, raw );
			}

		// Sets one value
		} else if ( value !== undefined ) {
			chainable = true;

			if ( !jQuery.isFunction( value ) ) {
				raw = true;
			}

			if ( bulk ) {
				// Bulk operations run against the entire set
				if ( raw ) {
					fn.call( elems, value );
					fn = null;

				// ...except when executing function values
				} else {
					bulk = fn;
					fn = function( elem, key, value ) {
						return bulk.call( jQuery( elem ), value );
					};
				}
			}

			if ( fn ) {
				for ( ; i < length; i++ ) {
					fn( elems[i], key, raw ? value : value.call( elems[i], i, fn( elems[i], key ) ) );
				}
			}
		}

		return chainable ?
			elems :

			// Gets
			bulk ?
				fn.call( elems ) :
				length ? fn( elems[0], key ) : emptyGet;
	},

	now: function() {
		return ( new Date() ).getTime();
	}
});

jQuery.ready.promise = function( obj ) {
	if ( !readyList ) {

		readyList = jQuery.Deferred();

		// Catch cases where $(document).ready() is called after the browser event has already occurred.
		// we once tried to use readyState "interactive" here, but it caused issues like the one
		// discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
		if ( document.readyState === "complete" ) {
			// Handle it asynchronously to allow scripts the opportunity to delay ready
			setTimeout( jQuery.ready );

		// Standards-based browsers support DOMContentLoaded
		} else if ( document.addEventListener ) {
			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", completed, false );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", completed, false );

		// If IE event model is used
		} else {
			// Ensure firing before onload, maybe late but safe also for iframes
			document.attachEvent( "onreadystatechange", completed );

			// A fallback to window.onload, that will always work
			window.attachEvent( "onload", completed );

			// If IE and not a frame
			// continually check to see if the document is ready
			var top = false;

			try {
				top = window.frameElement == null && document.documentElement;
			} catch(e) {}

			if ( top && top.doScroll ) {
				(function doScrollCheck() {
					if ( !jQuery.isReady ) {

						try {
							// Use the trick by Diego Perini
							// http://javascript.nwbox.com/IEContentLoaded/
							top.doScroll("left");
						} catch(e) {
							return setTimeout( doScrollCheck, 50 );
						}

						// detach all dom ready events
						detach();

						// and execute any waiting functions
						jQuery.ready();
					}
				})();
			}
		}
	}
	return readyList.promise( obj );
};

// Populate the class2type map
jQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

function isArraylike( obj ) {
	var length = obj.length,
		type = jQuery.type( obj );

	if ( jQuery.isWindow( obj ) ) {
		return false;
	}

	if ( obj.nodeType === 1 && length ) {
		return true;
	}

	return type === "array" || type !== "function" &&
		( length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj );
}

// All jQuery objects should point back to these
rootjQuery = jQuery(document);
// String to Object options format cache
var optionsCache = {};

// Convert String-formatted options into Object-formatted ones and store in cache
function createOptions( options ) {
	var object = optionsCache[ options ] = {};
	jQuery.each( options.match( core_rnotwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	});
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		( optionsCache[ options ] || createOptions( options ) ) :
		jQuery.extend( {}, options );

	var // Flag to know if list is currently firing
		firing,
		// Last fire value (for non-forgettable lists)
		memory,
		// Flag to know if list was already fired
		fired,
		// End of the loop when firing
		firingLength,
		// Index of currently firing callback (modified by remove if needed)
		firingIndex,
		// First callback to fire (used internally by add and fireWith)
		firingStart,
		// Actual callback list
		list = [],
		// Stack of fire calls for repeatable lists
		stack = !options.once && [],
		// Fire callbacks
		fire = function( data ) {
			memory = options.memory && data;
			fired = true;
			firingIndex = firingStart || 0;
			firingStart = 0;
			firingLength = list.length;
			firing = true;
			for ( ; list && firingIndex < firingLength; firingIndex++ ) {
				if ( list[ firingIndex ].apply( data[ 0 ], data[ 1 ] ) === false && options.stopOnFalse ) {
					memory = false; // To prevent further calls using add
					break;
				}
			}
			firing = false;
			if ( list ) {
				if ( stack ) {
					if ( stack.length ) {
						fire( stack.shift() );
					}
				} else if ( memory ) {
					list = [];
				} else {
					self.disable();
				}
			}
		},
		// Actual Callbacks object
		self = {
			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {
					// First, we save the current length
					var start = list.length;
					(function add( args ) {
						jQuery.each( args, function( _, arg ) {
							var type = jQuery.type( arg );
							if ( type === "function" ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && type !== "string" ) {
								// Inspect recursively
								add( arg );
							}
						});
					})( arguments );
					// Do we need to add the callbacks to the
					// current firing batch?
					if ( firing ) {
						firingLength = list.length;
					// With memory, if we're not firing then
					// we should call right away
					} else if ( memory ) {
						firingStart = start;
						fire( memory );
					}
				}
				return this;
			},
			// Remove a callback from the list
			remove: function() {
				if ( list ) {
					jQuery.each( arguments, function( _, arg ) {
						var index;
						while( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
							list.splice( index, 1 );
							// Handle firing indexes
							if ( firing ) {
								if ( index <= firingLength ) {
									firingLength--;
								}
								if ( index <= firingIndex ) {
									firingIndex--;
								}
							}
						}
					});
				}
				return this;
			},
			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function( fn ) {
				return fn ? jQuery.inArray( fn, list ) > -1 : !!( list && list.length );
			},
			// Remove all callbacks from the list
			empty: function() {
				list = [];
				return this;
			},
			// Have the list do nothing anymore
			disable: function() {
				list = stack = memory = undefined;
				return this;
			},
			// Is it disabled?
			disabled: function() {
				return !list;
			},
			// Lock the list in its current state
			lock: function() {
				stack = undefined;
				if ( !memory ) {
					self.disable();
				}
				return this;
			},
			// Is it locked?
			locked: function() {
				return !stack;
			},
			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				args = args || [];
				args = [ context, args.slice ? args.slice() : args ];
				if ( list && ( !fired || stack ) ) {
					if ( firing ) {
						stack.push( args );
					} else {
						fire( args );
					}
				}
				return this;
			},
			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},
			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};
jQuery.extend({

	Deferred: function( func ) {
		var tuples = [
				// action, add listener, listener list, final state
				[ "resolve", "done", jQuery.Callbacks("once memory"), "resolved" ],
				[ "reject", "fail", jQuery.Callbacks("once memory"), "rejected" ],
				[ "notify", "progress", jQuery.Callbacks("memory") ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				then: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;
					return jQuery.Deferred(function( newDefer ) {
						jQuery.each( tuples, function( i, tuple ) {
							var action = tuple[ 0 ],
								fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];
							// deferred[ done | fail | progress ] for forwarding actions to newDefer
							deferred[ tuple[1] ](function() {
								var returned = fn && fn.apply( this, arguments );
								if ( returned && jQuery.isFunction( returned.promise ) ) {
									returned.promise()
										.done( newDefer.resolve )
										.fail( newDefer.reject )
										.progress( newDefer.notify );
								} else {
									newDefer[ action + "With" ]( this === promise ? newDefer.promise() : this, fn ? [ returned ] : arguments );
								}
							});
						});
						fns = null;
					}).promise();
				},
				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Keep pipe for back-compat
		promise.pipe = promise.then;

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 3 ];

			// promise[ done | fail | progress ] = list.add
			promise[ tuple[1] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add(function() {
					// state = [ resolved | rejected ]
					state = stateString;

				// [ reject_list | resolve_list ].disable; progress_list.lock
				}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
			}

			// deferred[ resolve | reject | notify ]
			deferred[ tuple[0] ] = function() {
				deferred[ tuple[0] + "With" ]( this === deferred ? promise : this, arguments );
				return this;
			};
			deferred[ tuple[0] + "With" ] = list.fireWith;
		});

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( subordinate /* , ..., subordinateN */ ) {
		var i = 0,
			resolveValues = core_slice.call( arguments ),
			length = resolveValues.length,

			// the count of uncompleted subordinates
			remaining = length !== 1 || ( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

			// the master Deferred. If resolveValues consist of only a single Deferred, just use that.
			deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

			// Update function for both resolve and progress values
			updateFunc = function( i, contexts, values ) {
				return function( value ) {
					contexts[ i ] = this;
					values[ i ] = arguments.length > 1 ? core_slice.call( arguments ) : value;
					if( values === progressValues ) {
						deferred.notifyWith( contexts, values );
					} else if ( !( --remaining ) ) {
						deferred.resolveWith( contexts, values );
					}
				};
			},

			progressValues, progressContexts, resolveContexts;

		// add listeners to Deferred subordinates; treat others as resolved
		if ( length > 1 ) {
			progressValues = new Array( length );
			progressContexts = new Array( length );
			resolveContexts = new Array( length );
			for ( ; i < length; i++ ) {
				if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
					resolveValues[ i ].promise()
						.done( updateFunc( i, resolveContexts, resolveValues ) )
						.fail( deferred.reject )
						.progress( updateFunc( i, progressContexts, progressValues ) );
				} else {
					--remaining;
				}
			}
		}

		// if we're not waiting on anything, resolve the master
		if ( !remaining ) {
			deferred.resolveWith( resolveContexts, resolveValues );
		}

		return deferred.promise();
	}
});
jQuery.support = (function() {

	var support, all, a,
		input, select, fragment,
		opt, eventName, isSupported, i,
		div = document.createElement("div");

	// Setup
	div.setAttribute( "className", "t" );
	div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";

	// Support tests won't run in some limited or non-browser environments
	all = div.getElementsByTagName("*");
	a = div.getElementsByTagName("a")[ 0 ];
	if ( !all || !a || !all.length ) {
		return {};
	}

	// First batch of tests
	select = document.createElement("select");
	opt = select.appendChild( document.createElement("option") );
	input = div.getElementsByTagName("input")[ 0 ];

	a.style.cssText = "top:1px;float:left;opacity:.5";
	support = {
		// Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)
		getSetAttribute: div.className !== "t",

		// IE strips leading whitespace when .innerHTML is used
		leadingWhitespace: div.firstChild.nodeType === 3,

		// Make sure that tbody elements aren't automatically inserted
		// IE will insert them into empty tables
		tbody: !div.getElementsByTagName("tbody").length,

		// Make sure that link elements get serialized correctly by innerHTML
		// This requires a wrapper element in IE
		htmlSerialize: !!div.getElementsByTagName("link").length,

		// Get the style information from getAttribute
		// (IE uses .cssText instead)
		style: /top/.test( a.getAttribute("style") ),

		// Make sure that URLs aren't manipulated
		// (IE normalizes it by default)
		hrefNormalized: a.getAttribute("href") === "/a",

		// Make sure that element opacity exists
		// (IE uses filter instead)
		// Use a regex to work around a WebKit issue. See #5145
		opacity: /^0.5/.test( a.style.opacity ),

		// Verify style float existence
		// (IE uses styleFloat instead of cssFloat)
		cssFloat: !!a.style.cssFloat,

		// Check the default checkbox/radio value ("" on WebKit; "on" elsewhere)
		checkOn: !!input.value,

		// Make sure that a selected-by-default option has a working selected property.
		// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
		optSelected: opt.selected,

		// Tests for enctype support on a form (#6743)
		enctype: !!document.createElement("form").enctype,

		// Makes sure cloning an html5 element does not cause problems
		// Where outerHTML is undefined, this still works
		html5Clone: document.createElement("nav").cloneNode( true ).outerHTML !== "<:nav></:nav>",

		// jQuery.support.boxModel DEPRECATED in 1.8 since we don't support Quirks Mode
		boxModel: document.compatMode === "CSS1Compat",

		// Will be defined later
		deleteExpando: true,
		noCloneEvent: true,
		inlineBlockNeedsLayout: false,
		shrinkWrapBlocks: false,
		reliableMarginRight: true,
		boxSizingReliable: true,
		pixelPosition: false
	};

	// Make sure checked status is properly cloned
	input.checked = true;
	support.noCloneChecked = input.cloneNode( true ).checked;

	// Make sure that the options inside disabled selects aren't marked as disabled
	// (WebKit marks them as disabled)
	select.disabled = true;
	support.optDisabled = !opt.disabled;

	// Support: IE<9
	try {
		delete div.test;
	} catch( e ) {
		support.deleteExpando = false;
	}

	// Check if we can trust getAttribute("value")
	input = document.createElement("input");
	input.setAttribute( "value", "" );
	support.input = input.getAttribute( "value" ) === "";

	// Check if an input maintains its value after becoming a radio
	input.value = "t";
	input.setAttribute( "type", "radio" );
	support.radioValue = input.value === "t";

	// #11217 - WebKit loses check when the name is after the checked attribute
	input.setAttribute( "checked", "t" );
	input.setAttribute( "name", "t" );

	fragment = document.createDocumentFragment();
	fragment.appendChild( input );

	// Check if a disconnected checkbox will retain its checked
	// value of true after appended to the DOM (IE6/7)
	support.appendChecked = input.checked;

	// WebKit doesn't clone checked state correctly in fragments
	support.checkClone = fragment.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Support: IE<9
	// Opera does not clone events (and typeof div.attachEvent === undefined).
	// IE9-10 clones events bound via attachEvent, but they don't trigger with .click()
	if ( div.attachEvent ) {
		div.attachEvent( "onclick", function() {
			support.noCloneEvent = false;
		});

		div.cloneNode( true ).click();
	}

	// Support: IE<9 (lack submit/change bubble), Firefox 17+ (lack focusin event)
	// Beware of CSP restrictions (https://developer.mozilla.org/en/Security/CSP), test/csp.php
	for ( i in { submit: true, change: true, focusin: true }) {
		div.setAttribute( eventName = "on" + i, "t" );

		support[ i + "Bubbles" ] = eventName in window || div.attributes[ eventName ].expando === false;
	}

	div.style.backgroundClip = "content-box";
	div.cloneNode( true ).style.backgroundClip = "";
	support.clearCloneStyle = div.style.backgroundClip === "content-box";

	// Run tests that need a body at doc ready
	jQuery(function() {
		var container, marginDiv, tds,
			divReset = "padding:0;margin:0;border:0;display:block;box-sizing:content-box;-moz-box-sizing:content-box;-webkit-box-sizing:content-box;",
			body = document.getElementsByTagName("body")[0];

		if ( !body ) {
			// Return for frameset docs that don't have a body
			return;
		}

		container = document.createElement("div");
		container.style.cssText = "border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px";

		body.appendChild( container ).appendChild( div );

		// Support: IE8
		// Check if table cells still have offsetWidth/Height when they are set
		// to display:none and there are still other visible table cells in a
		// table row; if so, offsetWidth/Height are not reliable for use when
		// determining if an element has been hidden directly using
		// display:none (it is still safe to use offsets if a parent element is
		// hidden; don safety goggles and see bug #4512 for more information).
		div.innerHTML = "<table><tr><td></td><td>t</td></tr></table>";
		tds = div.getElementsByTagName("td");
		tds[ 0 ].style.cssText = "padding:0;margin:0;border:0;display:none";
		isSupported = ( tds[ 0 ].offsetHeight === 0 );

		tds[ 0 ].style.display = "";
		tds[ 1 ].style.display = "none";

		// Support: IE8
		// Check if empty table cells still have offsetWidth/Height
		support.reliableHiddenOffsets = isSupported && ( tds[ 0 ].offsetHeight === 0 );

		// Check box-sizing and margin behavior
		div.innerHTML = "";
		div.style.cssText = "box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;";
		support.boxSizing = ( div.offsetWidth === 4 );
		support.doesNotIncludeMarginInBodyOffset = ( body.offsetTop !== 1 );

		// Use window.getComputedStyle because jsdom on node.js will break without it.
		if ( window.getComputedStyle ) {
			support.pixelPosition = ( window.getComputedStyle( div, null ) || {} ).top !== "1%";
			support.boxSizingReliable = ( window.getComputedStyle( div, null ) || { width: "4px" } ).width === "4px";

			// Check if div with explicit width and no margin-right incorrectly
			// gets computed margin-right based on width of container. (#3333)
			// Fails in WebKit before Feb 2011 nightlies
			// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
			marginDiv = div.appendChild( document.createElement("div") );
			marginDiv.style.cssText = div.style.cssText = divReset;
			marginDiv.style.marginRight = marginDiv.style.width = "0";
			div.style.width = "1px";

			support.reliableMarginRight =
				!parseFloat( ( window.getComputedStyle( marginDiv, null ) || {} ).marginRight );
		}

		if ( typeof div.style.zoom !== core_strundefined ) {
			// Support: IE<8
			// Check if natively block-level elements act like inline-block
			// elements when setting their display to 'inline' and giving
			// them layout
			div.innerHTML = "";
			div.style.cssText = divReset + "width:1px;padding:1px;display:inline;zoom:1";
			support.inlineBlockNeedsLayout = ( div.offsetWidth === 3 );

			// Support: IE6
			// Check if elements with layout shrink-wrap their children
			div.style.display = "block";
			div.innerHTML = "<div></div>";
			div.firstChild.style.width = "5px";
			support.shrinkWrapBlocks = ( div.offsetWidth !== 3 );

			if ( support.inlineBlockNeedsLayout ) {
				// Prevent IE 6 from affecting layout for positioned elements #11048
				// Prevent IE from shrinking the body in IE 7 mode #12869
				// Support: IE<8
				body.style.zoom = 1;
			}
		}

		body.removeChild( container );

		// Null elements to avoid leaks in IE
		container = div = tds = marginDiv = null;
	});

	// Null elements to avoid leaks in IE
	all = select = fragment = opt = a = input = null;

	return support;
})();

var rbrace = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/,
	rmultiDash = /([A-Z])/g;

function internalData( elem, name, data, pvt /* Internal Use Only */ ){
	if ( !jQuery.acceptData( elem ) ) {
		return;
	}

	var thisCache, ret,
		internalKey = jQuery.expando,
		getByName = typeof name === "string",

		// We have to handle DOM nodes and JS objects differently because IE6-7
		// can't GC object references properly across the DOM-JS boundary
		isNode = elem.nodeType,

		// Only DOM nodes need the global jQuery cache; JS object data is
		// attached directly to the object so GC can occur automatically
		cache = isNode ? jQuery.cache : elem,

		// Only defining an ID for JS objects if its cache already exists allows
		// the code to shortcut on the same path as a DOM node with no cache
		id = isNode ? elem[ internalKey ] : elem[ internalKey ] && internalKey;

	// Avoid doing any more work than we need to when trying to get data on an
	// object that has no data at all
	if ( (!id || !cache[id] || (!pvt && !cache[id].data)) && getByName && data === undefined ) {
		return;
	}

	if ( !id ) {
		// Only DOM nodes need a new unique ID for each element since their data
		// ends up in the global cache
		if ( isNode ) {
			elem[ internalKey ] = id = core_deletedIds.pop() || jQuery.guid++;
		} else {
			id = internalKey;
		}
	}

	if ( !cache[ id ] ) {
		cache[ id ] = {};

		// Avoids exposing jQuery metadata on plain JS objects when the object
		// is serialized using JSON.stringify
		if ( !isNode ) {
			cache[ id ].toJSON = jQuery.noop;
		}
	}

	// An object can be passed to jQuery.data instead of a key/value pair; this gets
	// shallow copied over onto the existing cache
	if ( typeof name === "object" || typeof name === "function" ) {
		if ( pvt ) {
			cache[ id ] = jQuery.extend( cache[ id ], name );
		} else {
			cache[ id ].data = jQuery.extend( cache[ id ].data, name );
		}
	}

	thisCache = cache[ id ];

	// jQuery data() is stored in a separate object inside the object's internal data
	// cache in order to avoid key collisions between internal data and user-defined
	// data.
	if ( !pvt ) {
		if ( !thisCache.data ) {
			thisCache.data = {};
		}

		thisCache = thisCache.data;
	}

	if ( data !== undefined ) {
		thisCache[ jQuery.camelCase( name ) ] = data;
	}

	// Check for both converted-to-camel and non-converted data property names
	// If a data property was specified
	if ( getByName ) {

		// First Try to find as-is property data
		ret = thisCache[ name ];

		// Test for null|undefined property data
		if ( ret == null ) {

			// Try to find the camelCased property
			ret = thisCache[ jQuery.camelCase( name ) ];
		}
	} else {
		ret = thisCache;
	}

	return ret;
}

function internalRemoveData( elem, name, pvt ) {
	if ( !jQuery.acceptData( elem ) ) {
		return;
	}

	var i, l, thisCache,
		isNode = elem.nodeType,

		// See jQuery.data for more information
		cache = isNode ? jQuery.cache : elem,
		id = isNode ? elem[ jQuery.expando ] : jQuery.expando;

	// If there is already no cache entry for this object, there is no
	// purpose in continuing
	if ( !cache[ id ] ) {
		return;
	}

	if ( name ) {

		thisCache = pvt ? cache[ id ] : cache[ id ].data;

		if ( thisCache ) {

			// Support array or space separated string names for data keys
			if ( !jQuery.isArray( name ) ) {

				// try the string as a key before any manipulation
				if ( name in thisCache ) {
					name = [ name ];
				} else {

					// split the camel cased version by spaces unless a key with the spaces exists
					name = jQuery.camelCase( name );
					if ( name in thisCache ) {
						name = [ name ];
					} else {
						name = name.split(" ");
					}
				}
			} else {
				// If "name" is an array of keys...
				// When data is initially created, via ("key", "val") signature,
				// keys will be converted to camelCase.
				// Since there is no way to tell _how_ a key was added, remove
				// both plain key and camelCase key. #12786
				// This will only penalize the array argument path.
				name = name.concat( jQuery.map( name, jQuery.camelCase ) );
			}

			for ( i = 0, l = name.length; i < l; i++ ) {
				delete thisCache[ name[i] ];
			}

			// If there is no data left in the cache, we want to continue
			// and let the cache object itself get destroyed
			if ( !( pvt ? isEmptyDataObject : jQuery.isEmptyObject )( thisCache ) ) {
				return;
			}
		}
	}

	// See jQuery.data for more information
	if ( !pvt ) {
		delete cache[ id ].data;

		// Don't destroy the parent cache unless the internal data object
		// had been the only thing left in it
		if ( !isEmptyDataObject( cache[ id ] ) ) {
			return;
		}
	}

	// Destroy the cache
	if ( isNode ) {
		jQuery.cleanData( [ elem ], true );

	// Use delete when supported for expandos or `cache` is not a window per isWindow (#10080)
	} else if ( jQuery.support.deleteExpando || cache != cache.window ) {
		delete cache[ id ];

	// When all else fails, null
	} else {
		cache[ id ] = null;
	}
}

jQuery.extend({
	cache: {},

	// Unique for each copy of jQuery on the page
	// Non-digits removed to match rinlinejQuery
	expando: "jQuery" + ( core_version + Math.random() ).replace( /\D/g, "" ),

	// The following elements throw uncatchable exceptions if you
	// attempt to add expando properties to them.
	noData: {
		"embed": true,
		// Ban all objects except for Flash (which handle expandos)
		"object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
		"applet": true
	},

	hasData: function( elem ) {
		elem = elem.nodeType ? jQuery.cache[ elem[jQuery.expando] ] : elem[ jQuery.expando ];
		return !!elem && !isEmptyDataObject( elem );
	},

	data: function( elem, name, data ) {
		return internalData( elem, name, data );
	},

	removeData: function( elem, name ) {
		return internalRemoveData( elem, name );
	},

	// For internal use only.
	_data: function( elem, name, data ) {
		return internalData( elem, name, data, true );
	},

	_removeData: function( elem, name ) {
		return internalRemoveData( elem, name, true );
	},

	// A method for determining if a DOM node can handle the data expando
	acceptData: function( elem ) {
		// Do not set data on non-element because it will not be cleared (#8335).
		if ( elem.nodeType && elem.nodeType !== 1 && elem.nodeType !== 9 ) {
			return false;
		}

		var noData = elem.nodeName && jQuery.noData[ elem.nodeName.toLowerCase() ];

		// nodes accept data unless otherwise specified; rejection can be conditional
		return !noData || noData !== true && elem.getAttribute("classid") === noData;
	}
});

jQuery.fn.extend({
	data: function( key, value ) {
		var attrs, name,
			elem = this[0],
			i = 0,
			data = null;

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = jQuery.data( elem );

				if ( elem.nodeType === 1 && !jQuery._data( elem, "parsedAttrs" ) ) {
					attrs = elem.attributes;
					for ( ; i < attrs.length; i++ ) {
						name = attrs[i].name;

						if ( !name.indexOf( "data-" ) ) {
							name = jQuery.camelCase( name.slice(5) );

							dataAttr( elem, name, data[ name ] );
						}
					}
					jQuery._data( elem, "parsedAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each(function() {
				jQuery.data( this, key );
			});
		}

		return jQuery.access( this, function( value ) {

			if ( value === undefined ) {
				// Try to fetch any internally stored data first
				return elem ? dataAttr( elem, key, jQuery.data( elem, key ) ) : null;
			}

			this.each(function() {
				jQuery.data( this, key, value );
			});
		}, null, value, arguments.length > 1, null, true );
	},

	removeData: function( key ) {
		return this.each(function() {
			jQuery.removeData( this, key );
		});
	}
});

function dataAttr( elem, key, data ) {
	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {

		var name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();

		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = data === "true" ? true :
					data === "false" ? false :
					data === "null" ? null :
					// Only convert to a number if it doesn't change the string
					+data + "" === data ? +data :
					rbrace.test( data ) ? jQuery.parseJSON( data ) :
						data;
			} catch( e ) {}

			// Make sure we set the data so it isn't changed later
			jQuery.data( elem, key, data );

		} else {
			data = undefined;
		}
	}

	return data;
}

// checks a cache object for emptiness
function isEmptyDataObject( obj ) {
	var name;
	for ( name in obj ) {

		// if the public data object is empty, the private is still empty
		if ( name === "data" && jQuery.isEmptyObject( obj[name] ) ) {
			continue;
		}
		if ( name !== "toJSON" ) {
			return false;
		}
	}

	return true;
}
jQuery.extend({
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = jQuery._data( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || jQuery.isArray(data) ) {
					queue = jQuery._data( elem, type, jQuery.makeArray(data) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		hooks.cur = fn;
		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// not intended for public consumption - generates a queueHooks object, or returns the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return jQuery._data( elem, key ) || jQuery._data( elem, key, {
			empty: jQuery.Callbacks("once memory").add(function() {
				jQuery._removeData( elem, type + "queue" );
				jQuery._removeData( elem, key );
			})
		});
	}
});

jQuery.fn.extend({
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[0], type );
		}

		return data === undefined ?
			this :
			this.each(function() {
				var queue = jQuery.queue( this, type, data );

				// ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[0] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			});
	},
	dequeue: function( type ) {
		return this.each(function() {
			jQuery.dequeue( this, type );
		});
	},
	// Based off of the plugin by Clint Helfers, with permission.
	// http://blindsignals.com/index.php/2009/07/jquery-delay/
	delay: function( time, type ) {
		time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
		type = type || "fx";

		return this.queue( type, function( next, hooks ) {
			var timeout = setTimeout( next, time );
			hooks.stop = function() {
				clearTimeout( timeout );
			};
		});
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},
	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while( i-- ) {
			tmp = jQuery._data( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
});
var nodeHook, boolHook,
	rclass = /[\t\r\n]/g,
	rreturn = /\r/g,
	rfocusable = /^(?:input|select|textarea|button|object)$/i,
	rclickable = /^(?:a|area)$/i,
	rboolean = /^(?:checked|selected|autofocus|autoplay|async|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped)$/i,
	ruseDefault = /^(?:checked|selected)$/i,
	getSetAttribute = jQuery.support.getSetAttribute,
	getSetInput = jQuery.support.input;

jQuery.fn.extend({
	attr: function( name, value ) {
		return jQuery.access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each(function() {
			jQuery.removeAttr( this, name );
		});
	},

	prop: function( name, value ) {
		return jQuery.access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		name = jQuery.propFix[ name ] || name;
		return this.each(function() {
			// try/catch handles cases where IE balks (such as removing a property on window)
			try {
				this[ name ] = undefined;
				delete this[ name ];
			} catch( e ) {}
		});
	},

	addClass: function( value ) {
		var classes, elem, cur, clazz, j,
			i = 0,
			len = this.length,
			proceed = typeof value === "string" && value;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).addClass( value.call( this, j, this.className ) );
			});
		}

		if ( proceed ) {
			// The disjunction here is for better compressibility (see removeClass)
			classes = ( value || "" ).match( core_rnotwhite ) || [];

			for ( ; i < len; i++ ) {
				elem = this[ i ];
				cur = elem.nodeType === 1 && ( elem.className ?
					( " " + elem.className + " " ).replace( rclass, " " ) :
					" "
				);

				if ( cur ) {
					j = 0;
					while ( (clazz = classes[j++]) ) {
						if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
							cur += clazz + " ";
						}
					}
					elem.className = jQuery.trim( cur );

				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classes, elem, cur, clazz, j,
			i = 0,
			len = this.length,
			proceed = arguments.length === 0 || typeof value === "string" && value;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).removeClass( value.call( this, j, this.className ) );
			});
		}
		if ( proceed ) {
			classes = ( value || "" ).match( core_rnotwhite ) || [];

			for ( ; i < len; i++ ) {
				elem = this[ i ];
				// This expression is here for better compressibility (see addClass)
				cur = elem.nodeType === 1 && ( elem.className ?
					( " " + elem.className + " " ).replace( rclass, " " ) :
					""
				);

				if ( cur ) {
					j = 0;
					while ( (clazz = classes[j++]) ) {
						// Remove *all* instances
						while ( cur.indexOf( " " + clazz + " " ) >= 0 ) {
							cur = cur.replace( " " + clazz + " ", " " );
						}
					}
					elem.className = value ? jQuery.trim( cur ) : "";
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value,
			isBool = typeof stateVal === "boolean";

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( i ) {
				jQuery( this ).toggleClass( value.call(this, i, this.className, stateVal), stateVal );
			});
		}

		return this.each(function() {
			if ( type === "string" ) {
				// toggle individual class names
				var className,
					i = 0,
					self = jQuery( this ),
					state = stateVal,
					classNames = value.match( core_rnotwhite ) || [];

				while ( (className = classNames[ i++ ]) ) {
					// check each className given, space separated list
					state = isBool ? state : !self.hasClass( className );
					self[ state ? "addClass" : "removeClass" ]( className );
				}

			// Toggle whole class name
			} else if ( type === core_strundefined || type === "boolean" ) {
				if ( this.className ) {
					// store className if set
					jQuery._data( this, "__className__", this.className );
				}

				// If the element has a class name or if we're passed "false",
				// then remove the whole classname (if there was one, the above saved it).
				// Otherwise bring back whatever was previously saved (if anything),
				// falling back to the empty string if nothing was stored.
				this.className = this.className || value === false ? "" : jQuery._data( this, "__className__" ) || "";
			}
		});
	},

	hasClass: function( selector ) {
		var className = " " + selector + " ",
			i = 0,
			l = this.length;
		for ( ; i < l; i++ ) {
			if ( this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) >= 0 ) {
				return true;
			}
		}

		return false;
	},

	val: function( value ) {
		var ret, hooks, isFunction,
			elem = this[0];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] || jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
					return ret;
				}

				ret = elem.value;

				return typeof ret === "string" ?
					// handle most common string cases
					ret.replace(rreturn, "") :
					// handle cases where value is null/undef or number
					ret == null ? "" : ret;
			}

			return;
		}

		isFunction = jQuery.isFunction( value );

		return this.each(function( i ) {
			var val,
				self = jQuery(this);

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call( this, i, self.val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";
			} else if ( typeof val === "number" ) {
				val += "";
			} else if ( jQuery.isArray( val ) ) {
				val = jQuery.map(val, function ( value ) {
					return value == null ? "" : value + "";
				});
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !("set" in hooks) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		});
	}
});

jQuery.extend({
	valHooks: {
		option: {
			get: function( elem ) {
				// attributes.value is undefined in Blackberry 4.7 but
				// uses .value. See #6932
				var val = elem.attributes.value;
				return !val || val.specified ? elem.value : elem.text;
			}
		},
		select: {
			get: function( elem ) {
				var value, option,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === "select-one" || index < 0,
					values = one ? null : [],
					max = one ? index + 1 : options.length,
					i = index < 0 ?
						max :
						one ? index : 0;

				// Loop through all the selected options
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// oldIE doesn't update selected after form reset (#2551)
					if ( ( option.selected || i === index ) &&
							// Don't return options that are disabled or in a disabled optgroup
							( jQuery.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null ) &&
							( !option.parentNode.disabled || !jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				return values;
			},

			set: function( elem, value ) {
				var values = jQuery.makeArray( value );

				jQuery(elem).find("option").each(function() {
					this.selected = jQuery.inArray( jQuery(this).val(), values ) >= 0;
				});

				if ( !values.length ) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	},

	attr: function( elem, name, value ) {
		var hooks, notxml, ret,
			nType = elem.nodeType;

		// don't get/set attributes on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === core_strundefined ) {
			return jQuery.prop( elem, name, value );
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		// All attributes are lowercase
		// Grab necessary hook if one is defined
		if ( notxml ) {
			name = name.toLowerCase();
			hooks = jQuery.attrHooks[ name ] || ( rboolean.test( name ) ? boolHook : nodeHook );
		}

		if ( value !== undefined ) {

			if ( value === null ) {
				jQuery.removeAttr( elem, name );

			} else if ( hooks && notxml && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				elem.setAttribute( name, value + "" );
				return value;
			}

		} else if ( hooks && notxml && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
			return ret;

		} else {

			// In IE9+, Flash objects don't have .getAttribute (#12945)
			// Support: IE9+
			if ( typeof elem.getAttribute !== core_strundefined ) {
				ret =  elem.getAttribute( name );
			}

			// Non-existent attributes return null, we normalize to undefined
			return ret == null ?
				undefined :
				ret;
		}
	},

	removeAttr: function( elem, value ) {
		var name, propName,
			i = 0,
			attrNames = value && value.match( core_rnotwhite );

		if ( attrNames && elem.nodeType === 1 ) {
			while ( (name = attrNames[i++]) ) {
				propName = jQuery.propFix[ name ] || name;

				// Boolean attributes get special treatment (#10870)
				if ( rboolean.test( name ) ) {
					// Set corresponding property to false for boolean attributes
					// Also clear defaultChecked/defaultSelected (if appropriate) for IE<8
					if ( !getSetAttribute && ruseDefault.test( name ) ) {
						elem[ jQuery.camelCase( "default-" + name ) ] =
							elem[ propName ] = false;
					} else {
						elem[ propName ] = false;
					}

				// See #9699 for explanation of this approach (setting first, then removal)
				} else {
					jQuery.attr( elem, name, "" );
				}

				elem.removeAttribute( getSetAttribute ? name : propName );
			}
		}
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				if ( !jQuery.support.radioValue && value === "radio" && jQuery.nodeName(elem, "input") ) {
					// Setting the type on a radio button after the value resets the value in IE6-9
					// Reset value to default in case type is set after value during creation
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		}
	},

	propFix: {
		tabindex: "tabIndex",
		readonly: "readOnly",
		"for": "htmlFor",
		"class": "className",
		maxlength: "maxLength",
		cellspacing: "cellSpacing",
		cellpadding: "cellPadding",
		rowspan: "rowSpan",
		colspan: "colSpan",
		usemap: "useMap",
		frameborder: "frameBorder",
		contenteditable: "contentEditable"
	},

	prop: function( elem, name, value ) {
		var ret, hooks, notxml,
			nType = elem.nodeType;

		// don't get/set properties on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		if ( notxml ) {
			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			if ( hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				return ( elem[ name ] = value );
			}

		} else {
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
				return ret;

			} else {
				return elem[ name ];
			}
		}
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {
				// elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
				// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
				var attributeNode = elem.getAttributeNode("tabindex");

				return attributeNode && attributeNode.specified ?
					parseInt( attributeNode.value, 10 ) :
					rfocusable.test( elem.nodeName ) || rclickable.test( elem.nodeName ) && elem.href ?
						0 :
						undefined;
			}
		}
	}
});

// Hook for boolean attributes
boolHook = {
	get: function( elem, name ) {
		var
			// Use .prop to determine if this attribute is understood as boolean
			prop = jQuery.prop( elem, name ),

			// Fetch it accordingly
			attr = typeof prop === "boolean" && elem.getAttribute( name ),
			detail = typeof prop === "boolean" ?

				getSetInput && getSetAttribute ?
					attr != null :
					// oldIE fabricates an empty string for missing boolean attributes
					// and conflates checked/selected into attroperties
					ruseDefault.test( name ) ?
						elem[ jQuery.camelCase( "default-" + name ) ] :
						!!attr :

				// fetch an attribute node for properties not recognized as boolean
				elem.getAttributeNode( name );

		return detail && detail.value !== false ?
			name.toLowerCase() :
			undefined;
	},
	set: function( elem, value, name ) {
		if ( value === false ) {
			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else if ( getSetInput && getSetAttribute || !ruseDefault.test( name ) ) {
			// IE<8 needs the *property* name
			elem.setAttribute( !getSetAttribute && jQuery.propFix[ name ] || name, name );

		// Use defaultChecked and defaultSelected for oldIE
		} else {
			elem[ jQuery.camelCase( "default-" + name ) ] = elem[ name ] = true;
		}

		return name;
	}
};

// fix oldIE value attroperty
if ( !getSetInput || !getSetAttribute ) {
	jQuery.attrHooks.value = {
		get: function( elem, name ) {
			var ret = elem.getAttributeNode( name );
			return jQuery.nodeName( elem, "input" ) ?

				// Ignore the value *property* by using defaultValue
				elem.defaultValue :

				ret && ret.specified ? ret.value : undefined;
		},
		set: function( elem, value, name ) {
			if ( jQuery.nodeName( elem, "input" ) ) {
				// Does not return so that setAttribute is also used
				elem.defaultValue = value;
			} else {
				// Use nodeHook if defined (#1954); otherwise setAttribute is fine
				return nodeHook && nodeHook.set( elem, value, name );
			}
		}
	};
}

// IE6/7 do not support getting/setting some attributes with get/setAttribute
if ( !getSetAttribute ) {

	// Use this for any attribute in IE6/7
	// This fixes almost every IE6/7 issue
	nodeHook = jQuery.valHooks.button = {
		get: function( elem, name ) {
			var ret = elem.getAttributeNode( name );
			return ret && ( name === "id" || name === "name" || name === "coords" ? ret.value !== "" : ret.specified ) ?
				ret.value :
				undefined;
		},
		set: function( elem, value, name ) {
			// Set the existing or create a new attribute node
			var ret = elem.getAttributeNode( name );
			if ( !ret ) {
				elem.setAttributeNode(
					(ret = elem.ownerDocument.createAttribute( name ))
				);
			}

			ret.value = value += "";

			// Break association with cloned elements by also using setAttribute (#9646)
			return name === "value" || value === elem.getAttribute( name ) ?
				value :
				undefined;
		}
	};

	// Set contenteditable to false on removals(#10429)
	// Setting to empty string throws an error as an invalid value
	jQuery.attrHooks.contenteditable = {
		get: nodeHook.get,
		set: function( elem, value, name ) {
			nodeHook.set( elem, value === "" ? false : value, name );
		}
	};

	// Set width and height to auto instead of 0 on empty string( Bug #8150 )
	// This is for removals
	jQuery.each([ "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
			set: function( elem, value ) {
				if ( value === "" ) {
					elem.setAttribute( name, "auto" );
					return value;
				}
			}
		});
	});
}


// Some attributes require a special call on IE
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !jQuery.support.hrefNormalized ) {
	jQuery.each([ "href", "src", "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
			get: function( elem ) {
				var ret = elem.getAttribute( name, 2 );
				return ret == null ? undefined : ret;
			}
		});
	});

	// href/src property should get the full normalized URL (#10299/#12915)
	jQuery.each([ "href", "src" ], function( i, name ) {
		jQuery.propHooks[ name ] = {
			get: function( elem ) {
				return elem.getAttribute( name, 4 );
			}
		};
	});
}

if ( !jQuery.support.style ) {
	jQuery.attrHooks.style = {
		get: function( elem ) {
			// Return undefined in the case of empty string
			// Note: IE uppercases css property names, but if we were to .toLowerCase()
			// .cssText, that would destroy case senstitivity in URL's, like in "background"
			return elem.style.cssText || undefined;
		},
		set: function( elem, value ) {
			return ( elem.style.cssText = value + "" );
		}
	};
}

// Safari mis-reports the default selected property of an option
// Accessing the parent's selectedIndex property fixes it
if ( !jQuery.support.optSelected ) {
	jQuery.propHooks.selected = jQuery.extend( jQuery.propHooks.selected, {
		get: function( elem ) {
			var parent = elem.parentNode;

			if ( parent ) {
				parent.selectedIndex;

				// Make sure that it also works with optgroups, see #5701
				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
			return null;
		}
	});
}

// IE6/7 call enctype encoding
if ( !jQuery.support.enctype ) {
	jQuery.propFix.enctype = "encoding";
}

// Radios and checkboxes getter/setter
if ( !jQuery.support.checkOn ) {
	jQuery.each([ "radio", "checkbox" ], function() {
		jQuery.valHooks[ this ] = {
			get: function( elem ) {
				// Handle the case where in Webkit "" is returned instead of "on" if a value isn't specified
				return elem.getAttribute("value") === null ? "on" : elem.value;
			}
		};
	});
}
jQuery.each([ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = jQuery.extend( jQuery.valHooks[ this ], {
		set: function( elem, value ) {
			if ( jQuery.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0 );
			}
		}
	});
});
var rformElems = /^(?:input|select|textarea)$/i,
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|contextmenu)|click/,
	rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	rtypenamespace = /^([^.]*)(?:\.(.+)|)$/;

function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	global: {},

	add: function( elem, types, handler, data, selector ) {
		var tmp, events, t, handleObjIn,
			special, eventHandle, handleObj,
			handlers, type, namespaces, origType,
			elemData = jQuery._data( elem );

		// Don't attach events to noData or text/comment nodes (but allow plain objects)
		if ( !elemData ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		if ( !(events = elemData.events) ) {
			events = elemData.events = {};
		}
		if ( !(eventHandle = elemData.handle) ) {
			eventHandle = elemData.handle = function( e ) {
				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== core_strundefined && (!e || jQuery.event.triggered !== e.type) ?
					jQuery.event.dispatch.apply( eventHandle.elem, arguments ) :
					undefined;
			};
			// Add elem as a property of the handle fn to prevent a memory leak with IE non-native events
			eventHandle.elem = elem;
		}

		// Handle multiple events separated by a space
		// jQuery(...).bind("mouseover mouseout", fn);
		types = ( types || "" ).match( core_rnotwhite ) || [""];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[t] ) || [];
			type = origType = tmp[1];
			namespaces = ( tmp[2] || "" ).split( "." ).sort();

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend({
				type: type,
				origType: origType,
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join(".")
			}, handleObjIn );

			// Init the event handler queue if we're the first
			if ( !(handlers = events[ type ]) ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener/attachEvent if the special events handler returns false
				if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
					// Bind the global event handler to the element
					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle, false );

					} else if ( elem.attachEvent ) {
						elem.attachEvent( "on" + type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

		// Nullify elem to prevent memory leaks in IE
		elem = null;
	},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {
		var j, handleObj, tmp,
			origCount, t, events,
			special, handlers, type,
			namespaces, origType,
			elemData = jQuery.hasData( elem ) && jQuery._data( elem );

		if ( !elemData || !(events = elemData.events) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = ( types || "" ).match( core_rnotwhite ) || [""];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[t] ) || [];
			type = origType = tmp[1];
			namespaces = ( tmp[2] || "" ).split( "." ).sort();

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector ? special.delegateType : special.bindType ) || type;
			handlers = events[ type ] || [];
			tmp = tmp[2] && new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" );

			// Remove matching events
			origCount = j = handlers.length;
			while ( j-- ) {
				handleObj = handlers[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					( !handler || handler.guid === handleObj.guid ) &&
					( !tmp || tmp.test( handleObj.namespace ) ) &&
					( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector ) ) {
					handlers.splice( j, 1 );

					if ( handleObj.selector ) {
						handlers.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( origCount && !handlers.length ) {
				if ( !special.teardown || special.teardown.call( elem, namespaces, elemData.handle ) === false ) {
					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			delete elemData.handle;

			// removeData also checks for emptiness and clears the expando if empty
			// so use it instead of delete
			jQuery._removeData( elem, "events" );
		}
	},

	trigger: function( event, data, elem, onlyHandlers ) {
		var handle, ontype, cur,
			bubbleType, special, tmp, i,
			eventPath = [ elem || document ],
			type = core_hasOwn.call( event, "type" ) ? event.type : event,
			namespaces = core_hasOwn.call( event, "namespace" ) ? event.namespace.split(".") : [];

		cur = tmp = elem = elem || document;

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf(".") >= 0 ) {
			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split(".");
			type = namespaces.shift();
			namespaces.sort();
		}
		ontype = type.indexOf(":") < 0 && "on" + type;

		// Caller can pass in a jQuery.Event object, Object, or just an event type string
		event = event[ jQuery.expando ] ?
			event :
			new jQuery.Event( type, typeof event === "object" && event );

		event.isTrigger = true;
		event.namespace = namespaces.join(".");
		event.namespace_re = event.namespace ?
			new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" ) :
			null;

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data == null ?
			[ event ] :
			jQuery.makeArray( data, [ event ] );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			if ( !rfocusMorph.test( bubbleType + type ) ) {
				cur = cur.parentNode;
			}
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push( cur );
				tmp = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( tmp === (elem.ownerDocument || document) ) {
				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
			}
		}

		// Fire handlers on the event path
		i = 0;
		while ( (cur = eventPath[i++]) && !event.isPropagationStopped() ) {

			event.type = i > 1 ?
				bubbleType :
				special.bindType || type;

			// jQuery handler
			handle = ( jQuery._data( cur, "events" ) || {} )[ event.type ] && jQuery._data( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}

			// Native handler
			handle = ontype && cur[ ontype ];
			if ( handle && jQuery.acceptData( cur ) && handle.apply && handle.apply( cur, data ) === false ) {
				event.preventDefault();
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( (!special._default || special._default.apply( elem.ownerDocument, data ) === false) &&
				!(type === "click" && jQuery.nodeName( elem, "a" )) && jQuery.acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name name as the event.
				// Can't use an .isFunction() check here because IE6/7 fails that test.
				// Don't do default actions on window, that's where global variables be (#6170)
				if ( ontype && elem[ type ] && !jQuery.isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					tmp = elem[ ontype ];

					if ( tmp ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;
					try {
						elem[ type ]();
					} catch ( e ) {
						// IE<9 dies on focus/blur to hidden element (#1486,#12518)
						// only reproducible on winXP IE8 native, not IE9 in IE8 mode
					}
					jQuery.event.triggered = undefined;

					if ( tmp ) {
						elem[ ontype ] = tmp;
					}
				}
			}
		}

		return event.result;
	},

	dispatch: function( event ) {

		// Make a writable jQuery.Event from the native event object
		event = jQuery.event.fix( event );

		var i, ret, handleObj, matched, j,
			handlerQueue = [],
			args = core_slice.call( arguments ),
			handlers = ( jQuery._data( this, "events" ) || {} )[ event.type ] || [],
			special = jQuery.event.special[ event.type ] || {};

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[0] = event;
		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers
		handlerQueue = jQuery.event.handlers.call( this, event, handlers );

		// Run delegates first; they may want to stop propagation beneath us
		i = 0;
		while ( (matched = handlerQueue[ i++ ]) && !event.isPropagationStopped() ) {
			event.currentTarget = matched.elem;

			j = 0;
			while ( (handleObj = matched.handlers[ j++ ]) && !event.isImmediatePropagationStopped() ) {

				// Triggered event must either 1) have no namespace, or
				// 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
				if ( !event.namespace_re || event.namespace_re.test( handleObj.namespace ) ) {

					event.handleObj = handleObj;
					event.data = handleObj.data;

					ret = ( (jQuery.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )
							.apply( matched.elem, args );

					if ( ret !== undefined ) {
						if ( (event.result = ret) === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	handlers: function( event, handlers ) {
		var sel, handleObj, matches, i,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;

		// Find delegate handlers
		// Black-hole SVG <use> instance trees (#13180)
		// Avoid non-left-click bubbling in Firefox (#3861)
		if ( delegateCount && cur.nodeType && (!event.button || event.type !== "click") ) {

			for ( ; cur != this; cur = cur.parentNode || this ) {

				// Don't check non-elements (#13208)
				// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.nodeType === 1 && (cur.disabled !== true || event.type !== "click") ) {
					matches = [];
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];

						// Don't conflict with Object.prototype properties (#13203)
						sel = handleObj.selector + " ";

						if ( matches[ sel ] === undefined ) {
							matches[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) >= 0 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( matches[ sel ] ) {
							matches.push( handleObj );
						}
					}
					if ( matches.length ) {
						handlerQueue.push({ elem: cur, handlers: matches });
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		if ( delegateCount < handlers.length ) {
			handlerQueue.push({ elem: this, handlers: handlers.slice( delegateCount ) });
		}

		return handlerQueue;
	},

	fix: function( event ) {
		if ( event[ jQuery.expando ] ) {
			return event;
		}

		// Create a writable copy of the event object and normalize some properties
		var i, prop, copy,
			type = event.type,
			originalEvent = event,
			fixHook = this.fixHooks[ type ];

		if ( !fixHook ) {
			this.fixHooks[ type ] = fixHook =
				rmouseEvent.test( type ) ? this.mouseHooks :
				rkeyEvent.test( type ) ? this.keyHooks :
				{};
		}
		copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

		event = new jQuery.Event( originalEvent );

		i = copy.length;
		while ( i-- ) {
			prop = copy[ i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Support: IE<9
		// Fix target property (#1925)
		if ( !event.target ) {
			event.target = originalEvent.srcElement || document;
		}

		// Support: Chrome 23+, Safari?
		// Target should not be a text node (#504, #13143)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		// Support: IE<9
		// For mouse/key events, metaKey==false if it's undefined (#3368, #11328)
		event.metaKey = !!event.metaKey;

		return fixHook.filter ? fixHook.filter( event, originalEvent ) : event;
	},

	// Includes some event props shared by KeyEvent and MouseEvent
	props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),

	fixHooks: {},

	keyHooks: {
		props: "char charCode key keyCode".split(" "),
		filter: function( event, original ) {

			// Add which for key events
			if ( event.which == null ) {
				event.which = original.charCode != null ? original.charCode : original.keyCode;
			}

			return event;
		}
	},

	mouseHooks: {
		props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
		filter: function( event, original ) {
			var body, eventDoc, doc,
				button = original.button,
				fromElement = original.fromElement;

			// Calculate pageX/Y if missing and clientX/Y available
			if ( event.pageX == null && original.clientX != null ) {
				eventDoc = event.target.ownerDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
				event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
			}

			// Add relatedTarget, if necessary
			if ( !event.relatedTarget && fromElement ) {
				event.relatedTarget = fromElement === event.target ? original.toElement : fromElement;
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			// Note: button is not normalized, so don't use it
			if ( !event.which && button !== undefined ) {
				event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
			}

			return event;
		}
	},

	special: {
		load: {
			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},
		click: {
			// For checkbox, fire native event so checked state will be right
			trigger: function() {
				if ( jQuery.nodeName( this, "input" ) && this.type === "checkbox" && this.click ) {
					this.click();
					return false;
				}
			}
		},
		focus: {
			// Fire native event if possible so blur/focus sequence is correct
			trigger: function() {
				if ( this !== document.activeElement && this.focus ) {
					try {
						this.focus();
						return false;
					} catch ( e ) {
						// Support: IE<9
						// If we error on focus to hidden element (#1486, #12518),
						// let .trigger() run the handlers
					}
				}
			},
			delegateType: "focusin"
		},
		blur: {
			trigger: function() {
				if ( this === document.activeElement && this.blur ) {
					this.blur();
					return false;
				}
			},
			delegateType: "focusout"
		},

		beforeunload: {
			postDispatch: function( event ) {

				// Even when returnValue equals to undefined Firefox will still show alert
				if ( event.result !== undefined ) {
					event.originalEvent.returnValue = event.result;
				}
			}
		}
	},

	simulate: function( type, elem, event, bubble ) {
		// Piggyback on a donor event to simulate a different one.
		// Fake originalEvent to avoid donor's stopPropagation, but if the
		// simulated event prevents default then we do the same on the donor.
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{ type: type,
				isSimulated: true,
				originalEvent: {}
			}
		);
		if ( bubble ) {
			jQuery.event.trigger( e, null, elem );
		} else {
			jQuery.event.dispatch.call( elem, e );
		}
		if ( e.isDefaultPrevented() ) {
			event.preventDefault();
		}
	}
};

jQuery.removeEvent = document.removeEventListener ?
	function( elem, type, handle ) {
		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, handle, false );
		}
	} :
	function( elem, type, handle ) {
		var name = "on" + type;

		if ( elem.detachEvent ) {

			// #8545, #7054, preventing memory leaks for custom events in IE6-8
			// detachEvent needed property on element, by name of that event, to properly expose it to GC
			if ( typeof elem[ name ] === core_strundefined ) {
				elem[ name ] = null;
			}

			elem.detachEvent( name, handle );
		}
	};

jQuery.Event = function( src, props ) {
	// Allow instantiation without the 'new' keyword
	if ( !(this instanceof jQuery.Event) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = ( src.defaultPrevented || src.returnValue === false ||
			src.getPreventDefault && src.getPreventDefault() ) ? returnTrue : returnFalse;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || jQuery.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse,

	preventDefault: function() {
		var e = this.originalEvent;

		this.isDefaultPrevented = returnTrue;
		if ( !e ) {
			return;
		}

		// If preventDefault exists, run it on the original event
		if ( e.preventDefault ) {
			e.preventDefault();

		// Support: IE
		// Otherwise set the returnValue property of the original event to false
		} else {
			e.returnValue = false;
		}
	},
	stopPropagation: function() {
		var e = this.originalEvent;

		this.isPropagationStopped = returnTrue;
		if ( !e ) {
			return;
		}
		// If stopPropagation exists, run it on the original event
		if ( e.stopPropagation ) {
			e.stopPropagation();
		}

		// Support: IE
		// Set the cancelBubble property of the original event to true
		e.cancelBubble = true;
	},
	stopImmediatePropagation: function() {
		this.isImmediatePropagationStopped = returnTrue;
		this.stopPropagation();
	}
};

// Create mouseenter/leave events using mouseover/out and event-time checks
jQuery.each({
	mouseenter: "mouseover",
	mouseleave: "mouseout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj;

			// For mousenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || (related !== target && !jQuery.contains( target, related )) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
});

// IE submit delegation
if ( !jQuery.support.submitBubbles ) {

	jQuery.event.special.submit = {
		setup: function() {
			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Lazy-add a submit handler when a descendant form may potentially be submitted
			jQuery.event.add( this, "click._submit keypress._submit", function( e ) {
				// Node name check avoids a VML-related crash in IE (#9807)
				var elem = e.target,
					form = jQuery.nodeName( elem, "input" ) || jQuery.nodeName( elem, "button" ) ? elem.form : undefined;
				if ( form && !jQuery._data( form, "submitBubbles" ) ) {
					jQuery.event.add( form, "submit._submit", function( event ) {
						event._submit_bubble = true;
					});
					jQuery._data( form, "submitBubbles", true );
				}
			});
			// return undefined since we don't need an event listener
		},

		postDispatch: function( event ) {
			// If form was submitted by the user, bubble the event up the tree
			if ( event._submit_bubble ) {
				delete event._submit_bubble;
				if ( this.parentNode && !event.isTrigger ) {
					jQuery.event.simulate( "submit", this.parentNode, event, true );
				}
			}
		},

		teardown: function() {
			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Remove delegated handlers; cleanData eventually reaps submit handlers attached above
			jQuery.event.remove( this, "._submit" );
		}
	};
}

// IE change delegation and checkbox/radio fix
if ( !jQuery.support.changeBubbles ) {

	jQuery.event.special.change = {

		setup: function() {

			if ( rformElems.test( this.nodeName ) ) {
				// IE doesn't fire change on a check/radio until blur; trigger it on click
				// after a propertychange. Eat the blur-change in special.change.handle.
				// This still fires onchange a second time for check/radio after blur.
				if ( this.type === "checkbox" || this.type === "radio" ) {
					jQuery.event.add( this, "propertychange._change", function( event ) {
						if ( event.originalEvent.propertyName === "checked" ) {
							this._just_changed = true;
						}
					});
					jQuery.event.add( this, "click._change", function( event ) {
						if ( this._just_changed && !event.isTrigger ) {
							this._just_changed = false;
						}
						// Allow triggered, simulated change events (#11500)
						jQuery.event.simulate( "change", this, event, true );
					});
				}
				return false;
			}
			// Delegated event; lazy-add a change handler on descendant inputs
			jQuery.event.add( this, "beforeactivate._change", function( e ) {
				var elem = e.target;

				if ( rformElems.test( elem.nodeName ) && !jQuery._data( elem, "changeBubbles" ) ) {
					jQuery.event.add( elem, "change._change", function( event ) {
						if ( this.parentNode && !event.isSimulated && !event.isTrigger ) {
							jQuery.event.simulate( "change", this.parentNode, event, true );
						}
					});
					jQuery._data( elem, "changeBubbles", true );
				}
			});
		},

		handle: function( event ) {
			var elem = event.target;

			// Swallow native change events from checkbox/radio, we already triggered them above
			if ( this !== elem || event.isSimulated || event.isTrigger || (elem.type !== "radio" && elem.type !== "checkbox") ) {
				return event.handleObj.handler.apply( this, arguments );
			}
		},

		teardown: function() {
			jQuery.event.remove( this, "._change" );

			return !rformElems.test( this.nodeName );
		}
	};
}

// Create "bubbling" focus and blur events
if ( !jQuery.support.focusinBubbles ) {
	jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler while someone wants focusin/focusout
		var attaches = 0,
			handler = function( event ) {
				jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ), true );
			};

		jQuery.event.special[ fix ] = {
			setup: function() {
				if ( attaches++ === 0 ) {
					document.addEventListener( orig, handler, true );
				}
			},
			teardown: function() {
				if ( --attaches === 0 ) {
					document.removeEventListener( orig, handler, true );
				}
			}
		};
	});
}

jQuery.fn.extend({

	on: function( types, selector, data, fn, /*INTERNAL*/ one ) {
		var type, origFn;

		// Types can be a map of types/handlers
		if ( typeof types === "object" ) {
			// ( types-Object, selector, data )
			if ( typeof selector !== "string" ) {
				// ( types-Object, data )
				data = data || selector;
				selector = undefined;
			}
			for ( type in types ) {
				this.on( type, selector, data, types[ type ], one );
			}
			return this;
		}

		if ( data == null && fn == null ) {
			// ( types, fn )
			fn = selector;
			data = selector = undefined;
		} else if ( fn == null ) {
			if ( typeof selector === "string" ) {
				// ( types, selector, fn )
				fn = data;
				data = undefined;
			} else {
				// ( types, data, fn )
				fn = data;
				data = selector;
				selector = undefined;
			}
		}
		if ( fn === false ) {
			fn = returnFalse;
		} else if ( !fn ) {
			return this;
		}

		if ( one === 1 ) {
			origFn = fn;
			fn = function( event ) {
				// Can use an empty set, since event contains the info
				jQuery().off( event );
				return origFn.apply( this, arguments );
			};
			// Use same guid so caller can remove using origFn
			fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
		}
		return this.each( function() {
			jQuery.event.add( this, types, fn, data, selector );
		});
	},
	one: function( types, selector, data, fn ) {
		return this.on( types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {
			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {
			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {
			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each(function() {
			jQuery.event.remove( this, types, fn, selector );
		});
	},

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {
		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ? this.off( selector, "**" ) : this.off( types, selector || "**", fn );
	},

	trigger: function( type, data ) {
		return this.each(function() {
			jQuery.event.trigger( type, data, this );
		});
	},
	triggerHandler: function( type, data ) {
		var elem = this[0];
		if ( elem ) {
			return jQuery.event.trigger( type, data, elem, true );
		}
	}
});
/*!
 * Sizzle CSS Selector Engine
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license
 * http://sizzlejs.com/
 */
(function( window, undefined ) {

var i,
	cachedruns,
	Expr,
	getText,
	isXML,
	compile,
	hasDuplicate,
	outermostContext,

	// Local document vars
	setDocument,
	document,
	docElem,
	documentIsXML,
	rbuggyQSA,
	rbuggyMatches,
	matches,
	contains,
	sortOrder,

	// Instance-specific data
	expando = "sizzle" + -(new Date()),
	preferredDoc = window.document,
	support = {},
	dirruns = 0,
	done = 0,
	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),

	// General-purpose constants
	strundefined = typeof undefined,
	MAX_NEGATIVE = 1 << 31,

	// Array methods
	arr = [],
	pop = arr.pop,
	push = arr.push,
	slice = arr.slice,
	// Use a stripped-down indexOf if we can't use a native one
	indexOf = arr.indexOf || function( elem ) {
		var i = 0,
			len = this.length;
		for ( ; i < len; i++ ) {
			if ( this[i] === elem ) {
				return i;
			}
		}
		return -1;
	},


	// Regular expressions

	// Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",
	// http://www.w3.org/TR/css3-syntax/#characters
	characterEncoding = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

	// Loosely modeled on CSS identifier characters
	// An unquoted value should be a CSS identifier http://www.w3.org/TR/css3-selectors/#attribute-selectors
	// Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier = characterEncoding.replace( "w", "w#" ),

	// Acceptable operators http://www.w3.org/TR/selectors/#attribute-selectors
	operators = "([*^$|!~]?=)",
	attributes = "\\[" + whitespace + "*(" + characterEncoding + ")" + whitespace +
		"*(?:" + operators + whitespace + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + identifier + ")|)|)" + whitespace + "*\\]",

	// Prefer arguments quoted,
	//   then not containing pseudos/brackets,
	//   then attribute selectors/non-parenthetical expressions,
	//   then anything else
	// These preferences are here to reduce the number of selectors
	//   needing tokenize in the PSEUDO preFilter
	pseudos = ":(" + characterEncoding + ")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|" + attributes.replace( 3, 8 ) + ")*)|.*)\\)|)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([\\x20\\t\\r\\n\\f>+~])" + whitespace + "*" ),
	rpseudo = new RegExp( pseudos ),
	ridentifier = new RegExp( "^" + identifier + "$" ),

	matchExpr = {
		"ID": new RegExp( "^#(" + characterEncoding + ")" ),
		"CLASS": new RegExp( "^\\.(" + characterEncoding + ")" ),
		"NAME": new RegExp( "^\\[name=['\"]?(" + characterEncoding + ")['\"]?\\]" ),
		"TAG": new RegExp( "^(" + characterEncoding.replace( "w", "w*" ) + ")" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
			whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
	},

	rsibling = /[\x20\t\r\n\f]*[+~]/,

	rnative = /^[^{]+\{\s*\[native code/,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	rinputs = /^(?:input|select|textarea|button)$/i,
	rheader = /^h\d$/i,

	rescape = /'|\\/g,
	rattributeQuotes = /\=[\x20\t\r\n\f]*([^'"\]]*)[\x20\t\r\n\f]*\]/g,

	// CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
	runescape = /\\([\da-fA-F]{1,6}[\x20\t\r\n\f]?|.)/g,
	funescape = function( _, escaped ) {
		var high = "0x" + escaped - 0x10000;
		// NaN means non-codepoint
		return high !== high ?
			escaped :
			// BMP codepoint
			high < 0 ?
				String.fromCharCode( high + 0x10000 ) :
				// Supplemental Plane codepoint (surrogate pair)
				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	};

// Use a stripped-down slice if we can't use a native one
try {
	slice.call( preferredDoc.documentElement.childNodes, 0 )[0].nodeType;
} catch ( e ) {
	slice = function( i ) {
		var elem,
			results = [];
		while ( (elem = this[i++]) ) {
			results.push( elem );
		}
		return results;
	};
}

/**
 * For feature detection
 * @param {Function} fn The function to test for native support
 */
function isNative( fn ) {
	return rnative.test( fn + "" );
}

/**
 * Create key-value caches of limited size
 * @returns {Function(string, Object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
function createCache() {
	var cache,
		keys = [];

	return (cache = function( key, value ) {
		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
		if ( keys.push( key += " " ) > Expr.cacheLength ) {
			// Only keep the most recent entries
			delete cache[ keys.shift() ];
		}
		return (cache[ key ] = value);
	});
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
	fn[ expando ] = true;
	return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created div and expects a boolean result
 */
function assert( fn ) {
	var div = document.createElement("div");

	try {
		return fn( div );
	} catch (e) {
		return false;
	} finally {
		// release memory in IE
		div = null;
	}
}

function Sizzle( selector, context, results, seed ) {
	var match, elem, m, nodeType,
		// QSA vars
		i, groups, old, nid, newContext, newSelector;

	if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
		setDocument( context );
	}

	context = context || document;
	results = results || [];

	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	if ( (nodeType = context.nodeType) !== 1 && nodeType !== 9 ) {
		return [];
	}

	if ( !documentIsXML && !seed ) {

		// Shortcuts
		if ( (match = rquickExpr.exec( selector )) ) {
			// Speed-up: Sizzle("#ID")
			if ( (m = match[1]) ) {
				if ( nodeType === 9 ) {
					elem = context.getElementById( m );
					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Handle the case where IE, Opera, and Webkit return items
						// by name instead of ID
						if ( elem.id === m ) {
							results.push( elem );
							return results;
						}
					} else {
						return results;
					}
				} else {
					// Context is not a document
					if ( context.ownerDocument && (elem = context.ownerDocument.getElementById( m )) &&
						contains( context, elem ) && elem.id === m ) {
						results.push( elem );
						return results;
					}
				}

			// Speed-up: Sizzle("TAG")
			} else if ( match[2] ) {
				push.apply( results, slice.call(context.getElementsByTagName( selector ), 0) );
				return results;

			// Speed-up: Sizzle(".CLASS")
			} else if ( (m = match[3]) && support.getByClassName && context.getElementsByClassName ) {
				push.apply( results, slice.call(context.getElementsByClassName( m ), 0) );
				return results;
			}
		}

		// QSA path
		if ( support.qsa && !rbuggyQSA.test(selector) ) {
			old = true;
			nid = expando;
			newContext = context;
			newSelector = nodeType === 9 && selector;

			// qSA works strangely on Element-rooted queries
			// We can work around this by specifying an extra ID on the root
			// and working up from there (Thanks to Andrew Dupont for the technique)
			// IE 8 doesn't work on object elements
			if ( nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
				groups = tokenize( selector );

				if ( (old = context.getAttribute("id")) ) {
					nid = old.replace( rescape, "\\$&" );
				} else {
					context.setAttribute( "id", nid );
				}
				nid = "[id='" + nid + "'] ";

				i = groups.length;
				while ( i-- ) {
					groups[i] = nid + toSelector( groups[i] );
				}
				newContext = rsibling.test( selector ) && context.parentNode || context;
				newSelector = groups.join(",");
			}

			if ( newSelector ) {
				try {
					push.apply( results, slice.call( newContext.querySelectorAll(
						newSelector
					), 0 ) );
					return results;
				} catch(qsaError) {
				} finally {
					if ( !old ) {
						context.removeAttribute("id");
					}
				}
			}
		}
	}

	// All others
	return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * Detect xml
 * @param {Element|Object} elem An element or a document
 */
isXML = Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement = elem && (elem.ownerDocument || elem).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
	var doc = node ? node.ownerDocument || node : preferredDoc;

	// If no document and documentElement is available, return
	if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
		return document;
	}

	// Set our document
	document = doc;
	docElem = doc.documentElement;

	// Support tests
	documentIsXML = isXML( doc );

	// Check if getElementsByTagName("*") returns only elements
	support.tagNameNoComments = assert(function( div ) {
		div.appendChild( doc.createComment("") );
		return !div.getElementsByTagName("*").length;
	});

	// Check if attributes should be retrieved by attribute nodes
	support.attributes = assert(function( div ) {
		div.innerHTML = "<select></select>";
		var type = typeof div.lastChild.getAttribute("multiple");
		// IE8 returns a string for some attributes even when not present
		return type !== "boolean" && type !== "string";
	});

	// Check if getElementsByClassName can be trusted
	support.getByClassName = assert(function( div ) {
		// Opera can't find a second classname (in 9.6)
		div.innerHTML = "<div class='hidden e'></div><div class='hidden'></div>";
		if ( !div.getElementsByClassName || !div.getElementsByClassName("e").length ) {
			return false;
		}

		// Safari 3.2 caches class attributes and doesn't catch changes
		div.lastChild.className = "e";
		return div.getElementsByClassName("e").length === 2;
	});

	// Check if getElementById returns elements by name
	// Check if getElementsByName privileges form controls or returns elements by ID
	support.getByName = assert(function( div ) {
		// Inject content
		div.id = expando + 0;
		div.innerHTML = "<a name='" + expando + "'></a><div name='" + expando + "'></div>";
		docElem.insertBefore( div, docElem.firstChild );

		// Test
		var pass = doc.getElementsByName &&
			// buggy browsers will return fewer than the correct 2
			doc.getElementsByName( expando ).length === 2 +
			// buggy browsers will return more than the correct 0
			doc.getElementsByName( expando + 0 ).length;
		support.getIdNotName = !doc.getElementById( expando );

		// Cleanup
		docElem.removeChild( div );

		return pass;
	});

	// IE6/7 return modified attributes
	Expr.attrHandle = assert(function( div ) {
		div.innerHTML = "<a href='#'></a>";
		return div.firstChild && typeof div.firstChild.getAttribute !== strundefined &&
			div.firstChild.getAttribute("href") === "#";
	}) ?
		{} :
		{
			"href": function( elem ) {
				return elem.getAttribute( "href", 2 );
			},
			"type": function( elem ) {
				return elem.getAttribute("type");
			}
		};

	// ID find and filter
	if ( support.getIdNotName ) {
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== strundefined && !documentIsXML ) {
				var m = context.getElementById( id );
				// Check parentNode to catch when Blackberry 4.6 returns
				// nodes that are no longer in the document #6963
				return m && m.parentNode ? [m] : [];
			}
		};
		Expr.filter["ID"] = function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				return elem.getAttribute("id") === attrId;
			};
		};
	} else {
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== strundefined && !documentIsXML ) {
				var m = context.getElementById( id );

				return m ?
					m.id === id || typeof m.getAttributeNode !== strundefined && m.getAttributeNode("id").value === id ?
						[m] :
						undefined :
					[];
			}
		};
		Expr.filter["ID"] =  function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
				return node && node.value === attrId;
			};
		};
	}

	// Tag
	Expr.find["TAG"] = support.tagNameNoComments ?
		function( tag, context ) {
			if ( typeof context.getElementsByTagName !== strundefined ) {
				return context.getElementsByTagName( tag );
			}
		} :
		function( tag, context ) {
			var elem,
				tmp = [],
				i = 0,
				results = context.getElementsByTagName( tag );

			// Filter out possible comments
			if ( tag === "*" ) {
				while ( (elem = results[i++]) ) {
					if ( elem.nodeType === 1 ) {
						tmp.push( elem );
					}
				}

				return tmp;
			}
			return results;
		};

	// Name
	Expr.find["NAME"] = support.getByName && function( tag, context ) {
		if ( typeof context.getElementsByName !== strundefined ) {
			return context.getElementsByName( name );
		}
	};

	// Class
	Expr.find["CLASS"] = support.getByClassName && function( className, context ) {
		if ( typeof context.getElementsByClassName !== strundefined && !documentIsXML ) {
			return context.getElementsByClassName( className );
		}
	};

	// QSA and matchesSelector support

	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
	rbuggyMatches = [];

	// qSa(:focus) reports false when true (Chrome 21),
	// no need to also add to buggyMatches since matches checks buggyQSA
	// A support test would require too much code (would include document ready)
	rbuggyQSA = [ ":focus" ];

	if ( (support.qsa = isNative(doc.querySelectorAll)) ) {
		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( div ) {
			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explictly
			// setting a boolean content attribute,
			// since its presence should be enough
			// http://bugs.jquery.com/ticket/12359
			div.innerHTML = "<select><option selected=''></option></select>";

			// IE8 - Some boolean attributes are not treated correctly
			if ( !div.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:checked|disabled|ismap|multiple|readonly|selected|value)" );
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}
		});

		assert(function( div ) {

			// Opera 10-12/IE8 - ^= $= *= and empty values
			// Should not select anything
			div.innerHTML = "<input type='hidden' i=''/>";
			if ( div.querySelectorAll("[i^='']").length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:\"\"|'')" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":enabled").length ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Opera 10-11 does not throw on post-comma invalid pseudos
			div.querySelectorAll("*,:x");
			rbuggyQSA.push(",.*:");
		});
	}

	if ( (support.matchesSelector = isNative( (matches = docElem.matchesSelector ||
		docElem.mozMatchesSelector ||
		docElem.webkitMatchesSelector ||
		docElem.oMatchesSelector ||
		docElem.msMatchesSelector) )) ) {

		assert(function( div ) {
			// Check to see if it's possible to do matchesSelector
			// on a disconnected node (IE 9)
			support.disconnectedMatch = matches.call( div, "div" );

			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( div, "[s!='']:x" );
			rbuggyMatches.push( "!=", pseudos );
		});
	}

	rbuggyQSA = new RegExp( rbuggyQSA.join("|") );
	rbuggyMatches = new RegExp( rbuggyMatches.join("|") );

	// Element contains another
	// Purposefully does not implement inclusive descendent
	// As in, an element does not contain itself
	contains = isNative(docElem.contains) || docElem.compareDocumentPosition ?
		function( a, b ) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;
			return a === bup || !!( bup && bup.nodeType === 1 && (
				adown.contains ?
					adown.contains( bup ) :
					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
			));
		} :
		function( a, b ) {
			if ( b ) {
				while ( (b = b.parentNode) ) {
					if ( b === a ) {
						return true;
					}
				}
			}
			return false;
		};

	// Document order sorting
	sortOrder = docElem.compareDocumentPosition ?
	function( a, b ) {
		var compare;

		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		if ( (compare = b.compareDocumentPosition && a.compareDocumentPosition && a.compareDocumentPosition( b )) ) {
			if ( compare & 1 || a.parentNode && a.parentNode.nodeType === 11 ) {
				if ( a === doc || contains( preferredDoc, a ) ) {
					return -1;
				}
				if ( b === doc || contains( preferredDoc, b ) ) {
					return 1;
				}
				return 0;
			}
			return compare & 4 ? -1 : 1;
		}

		return a.compareDocumentPosition ? -1 : 1;
	} :
	function( a, b ) {
		var cur,
			i = 0,
			aup = a.parentNode,
			bup = b.parentNode,
			ap = [ a ],
			bp = [ b ];

		// Exit early if the nodes are identical
		if ( a === b ) {
			hasDuplicate = true;
			return 0;

		// Parentless nodes are either documents or disconnected
		} else if ( !aup || !bup ) {
			return a === doc ? -1 :
				b === doc ? 1 :
				aup ? -1 :
				bup ? 1 :
				0;

		// If the nodes are siblings, we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );
		}

		// Otherwise we need full lists of their ancestors for comparison
		cur = a;
		while ( (cur = cur.parentNode) ) {
			ap.unshift( cur );
		}
		cur = b;
		while ( (cur = cur.parentNode) ) {
			bp.unshift( cur );
		}

		// Walk down the tree looking for a discrepancy
		while ( ap[i] === bp[i] ) {
			i++;
		}

		return i ?
			// Do a sibling check if the nodes have a common ancestor
			siblingCheck( ap[i], bp[i] ) :

			// Otherwise nodes in our document sort first
			ap[i] === preferredDoc ? -1 :
			bp[i] === preferredDoc ? 1 :
			0;
	};

	// Always assume the presence of duplicates if sort doesn't
	// pass them to our comparison function (as in Google Chrome).
	hasDuplicate = false;
	[0, 0].sort( sortOrder );
	support.detectDuplicates = hasDuplicate;

	return document;
};

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	// Make sure that attribute selectors are quoted
	expr = expr.replace( rattributeQuotes, "='$1']" );

	// rbuggyQSA always contains :focus, so no need for an existence check
	if ( support.matchesSelector && !documentIsXML && (!rbuggyMatches || !rbuggyMatches.test(expr)) && !rbuggyQSA.test(expr) ) {
		try {
			var ret = matches.call( elem, expr );

			// IE 9's matchesSelector returns false on disconnected nodes
			if ( ret || support.disconnectedMatch ||
					// As well, disconnected nodes are said to be in a document
					// fragment in IE 9
					elem.document && elem.document.nodeType !== 11 ) {
				return ret;
			}
		} catch(e) {}
	}

	return Sizzle( expr, document, null, [elem] ).length > 0;
};

Sizzle.contains = function( context, elem ) {
	// Set document vars if needed
	if ( ( context.ownerDocument || context ) !== document ) {
		setDocument( context );
	}
	return contains( context, elem );
};

Sizzle.attr = function( elem, name ) {
	var val;

	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	if ( !documentIsXML ) {
		name = name.toLowerCase();
	}
	if ( (val = Expr.attrHandle[ name ]) ) {
		return val( elem );
	}
	if ( documentIsXML || support.attributes ) {
		return elem.getAttribute( name );
	}
	return ( (val = elem.getAttributeNode( name )) || elem.getAttribute( name ) ) && elem[ name ] === true ?
		name :
		val && val.specified ? val.value : null;
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

// Document sorting and removing duplicates
Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		i = 1,
		j = 0;

	// Unless we *know* we can detect duplicates, assume their presence
	hasDuplicate = !support.detectDuplicates;
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		for ( ; (elem = results[i]); i++ ) {
			if ( elem === results[ i - 1 ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	return results;
};

function siblingCheck( a, b ) {
	var cur = b && a,
		diff = cur && ( ~b.sourceIndex || MAX_NEGATIVE ) - ( ~a.sourceIndex || MAX_NEGATIVE );

	// Use IE sourceIndex if available on both nodes
	if ( diff ) {
		return diff;
	}

	// Check if b follows a
	if ( cur ) {
		while ( (cur = cur.nextSibling) ) {
			if ( cur === b ) {
				return -1;
			}
		}
	}

	return a ? 1 : -1;
}

// Returns a function to use in pseudos for input types
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

// Returns a function to use in pseudos for buttons
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return (name === "input" || name === "button") && elem.type === type;
	};
}

// Returns a function to use in pseudos for positionals
function createPositionalPseudo( fn ) {
	return markFunction(function( argument ) {
		argument = +argument;
		return markFunction(function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ (j = matchIndexes[i]) ] ) {
					seed[j] = !(matches[j] = seed[j]);
				}
			}
		});
	});
}

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( !nodeType ) {
		// If no nodeType, this is expected to be an array
		for ( ; (node = elem[i]); i++ ) {
			// Do not traverse comment nodes
			ret += getText( node );
		}
	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
		// Use textContent for elements
		// innerText usage removed for consistency of new lines (see #11153)
		if ( typeof elem.textContent === "string" ) {
			return elem.textContent;
		} else {
			// Traverse its children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				ret += getText( elem );
			}
		}
	} else if ( nodeType === 3 || nodeType === 4 ) {
		return elem.nodeValue;
	}
	// Do not include comment or processing instruction nodes

	return ret;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	find: {},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[1] = match[1].replace( runescape, funescape );

			// Move the given value to match[3] whether quoted or unquoted
			match[3] = ( match[4] || match[5] || "" ).replace( runescape, funescape );

			if ( match[2] === "~=" ) {
				match[3] = " " + match[3] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {
			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
			match[1] = match[1].toLowerCase();

			if ( match[1].slice( 0, 3 ) === "nth" ) {
				// nth-* requires argument
				if ( !match[3] ) {
					Sizzle.error( match[0] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
				match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

			// other types prohibit arguments
			} else if ( match[3] ) {
				Sizzle.error( match[0] );
			}

			return match;
		},

		"PSEUDO": function( match ) {
			var excess,
				unquoted = !match[5] && match[2];

			if ( matchExpr["CHILD"].test( match[0] ) ) {
				return null;
			}

			// Accept quoted arguments as-is
			if ( match[4] ) {
				match[2] = match[4];

			// Strip excess characters from unquoted arguments
			} else if ( unquoted && rpseudo.test( unquoted ) &&
				// Get excess from tokenize (recursively)
				(excess = tokenize( unquoted, true )) &&
				// advance to the next closing parenthesis
				(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

				// excess is a negative index
				match[0] = match[0].slice( 0, excess );
				match[2] = unquoted.slice( 0, excess );
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {

		"TAG": function( nodeName ) {
			if ( nodeName === "*" ) {
				return function() { return true; };
			}

			nodeName = nodeName.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
			};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ className + " " ];

			return pattern ||
				(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
				classCache( className, function( elem ) {
					return pattern.test( elem.className || (typeof elem.getAttribute !== strundefined && elem.getAttribute("class")) || "" );
				});
		},

		"ATTR": function( name, operator, check ) {
			return function( elem ) {
				var result = Sizzle.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				return operator === "=" ? result === check :
					operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					operator === "$=" ? check && result.slice( -check.length ) === check :
					operator === "~=" ? ( " " + result + " " ).indexOf( check ) > -1 :
					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
					false;
			};
		},

		"CHILD": function( type, what, argument, first, last ) {
			var simple = type.slice( 0, 3 ) !== "nth",
				forward = type.slice( -4 ) !== "last",
				ofType = what === "of-type";

			return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)
				function( elem ) {
					return !!elem.parentNode;
				} :

				function( elem, context, xml ) {
					var cache, outerCache, node, diff, nodeIndex, start,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
						name = ofType && elem.nodeName.toLowerCase(),
						useCache = !xml && !ofType;

					if ( parent ) {

						// :(first|last|only)-(child|of-type)
						if ( simple ) {
							while ( dir ) {
								node = elem;
								while ( (node = node[ dir ]) ) {
									if ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) {
										return false;
									}
								}
								// Reverse direction for :only-* (if we haven't yet done so)
								start = dir = type === "only" && !start && "nextSibling";
							}
							return true;
						}

						start = [ forward ? parent.firstChild : parent.lastChild ];

						// non-xml :nth-child(...) stores cache data on `parent`
						if ( forward && useCache ) {
							// Seek `elem` from a previously-cached index
							outerCache = parent[ expando ] || (parent[ expando ] = {});
							cache = outerCache[ type ] || [];
							nodeIndex = cache[0] === dirruns && cache[1];
							diff = cache[0] === dirruns && cache[2];
							node = nodeIndex && parent.childNodes[ nodeIndex ];

							while ( (node = ++nodeIndex && node && node[ dir ] ||

								// Fallback to seeking `elem` from the start
								(diff = nodeIndex = 0) || start.pop()) ) {

								// When found, cache indexes on `parent` and break
								if ( node.nodeType === 1 && ++diff && node === elem ) {
									outerCache[ type ] = [ dirruns, nodeIndex, diff ];
									break;
								}
							}

						// Use previously-cached element index if available
						} else if ( useCache && (cache = (elem[ expando ] || (elem[ expando ] = {}))[ type ]) && cache[0] === dirruns ) {
							diff = cache[1];

						// xml :nth-child(...) or :nth-last-child(...) or :nth(-last)?-of-type(...)
						} else {
							// Use the same loop as above to seek `elem` from the start
							while ( (node = ++nodeIndex && node && node[ dir ] ||
								(diff = nodeIndex = 0) || start.pop()) ) {

								if ( ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) && ++diff ) {
									// Cache the index of each encountered element
									if ( useCache ) {
										(node[ expando ] || (node[ expando ] = {}))[ type ] = [ dirruns, diff ];
									}

									if ( node === elem ) {
										break;
									}
								}
							}
						}

						// Incorporate the offset, then check against cycle size
						diff -= last;
						return diff === first || ( diff % first === 0 && diff / first >= 0 );
					}
				};
		},

		"PSEUDO": function( pseudo, argument ) {
			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					Sizzle.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction(function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf.call( seed, matched[i] );
							seed[ idx ] = !( matches[ idx ] = matched[i] );
						}
					}) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {
		// Potentially complex pseudos
		"not": markFunction(function( selector ) {
			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrim, "$1" ) );

			return matcher[ expando ] ?
				markFunction(function( seed, matches, context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( (elem = unmatched[i]) ) {
							seed[i] = !(matches[i] = elem);
						}
					}
				}) :
				function( elem, context, xml ) {
					input[0] = elem;
					matcher( input, null, xml, results );
					return !results.pop();
				};
		}),

		"has": markFunction(function( selector ) {
			return function( elem ) {
				return Sizzle( selector, elem ).length > 0;
			};
		}),

		"contains": markFunction(function( text ) {
			return function( elem ) {
				return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
			};
		}),

		// "Whether an element is represented by a :lang() selector
		// is based solely on the element's language value
		// being equal to the identifier C,
		// or beginning with the identifier C immediately followed by "-".
		// The matching of C against the element's language value is performed case-insensitively.
		// The identifier C does not have to be a valid language name."
		// http://www.w3.org/TR/selectors/#lang-pseudo
		"lang": markFunction( function( lang ) {
			// lang value must be a valid identifider
			if ( !ridentifier.test(lang || "") ) {
				Sizzle.error( "unsupported lang: " + lang );
			}
			lang = lang.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				var elemLang;
				do {
					if ( (elemLang = documentIsXML ?
						elem.getAttribute("xml:lang") || elem.getAttribute("lang") :
						elem.lang) ) {

						elemLang = elemLang.toLowerCase();
						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
					}
				} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
				return false;
			};
		}),

		// Miscellaneous
		"target": function( elem ) {
			var hash = window.location && window.location.hash;
			return hash && hash.slice( 1 ) === elem.id;
		},

		"root": function( elem ) {
			return elem === docElem;
		},

		"focus": function( elem ) {
			return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
		},

		// Boolean properties
		"enabled": function( elem ) {
			return elem.disabled === false;
		},

		"disabled": function( elem ) {
			return elem.disabled === true;
		},

		"checked": function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		"selected": function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		// Contents
		"empty": function( elem ) {
			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is only affected by element nodes and content nodes(including text(3), cdata(4)),
			//   not comment, processing instructions, or others
			// Thanks to Diego Perini for the nodeName shortcut
			//   Greater than "@" means alpha characters (specifically not starting with "#" or "?")
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				if ( elem.nodeName > "@" || elem.nodeType === 3 || elem.nodeType === 4 ) {
					return false;
				}
			}
			return true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos["empty"]( elem );
		},

		// Element/input types
		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"text": function( elem ) {
			var attr;
			// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)
			// use getAttribute instead to test this case
			return elem.nodeName.toLowerCase() === "input" &&
				elem.type === "text" &&
				( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === elem.type );
		},

		// Position-in-collection
		"first": createPositionalPseudo(function() {
			return [ 0 ];
		}),

		"last": createPositionalPseudo(function( matchIndexes, length ) {
			return [ length - 1 ];
		}),

		"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		}),

		"even": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 0;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"odd": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 1;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		})
	}
};

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
	Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
	Expr.pseudos[ i ] = createButtonPseudo( i );
}

function tokenize( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || (match = rcomma.exec( soFar )) ) {
			if ( match ) {
				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[0].length ) || soFar;
			}
			groups.push( tokens = [] );
		}

		matched = false;

		// Combinators
		if ( (match = rcombinators.exec( soFar )) ) {
			matched = match.shift();
			tokens.push( {
				value: matched,
				// Cast descendant combinators to space
				type: match[0].replace( rtrim, " " )
			} );
			soFar = soFar.slice( matched.length );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
				(match = preFilters[ type ]( match ))) ) {
				matched = match.shift();
				tokens.push( {
					value: matched,
					type: type,
					matches: match
				} );
				soFar = soFar.slice( matched.length );
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :
			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
}

function toSelector( tokens ) {
	var i = 0,
		len = tokens.length,
		selector = "";
	for ( ; i < len; i++ ) {
		selector += tokens[i].value;
	}
	return selector;
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		checkNonElements = base && dir === "parentNode",
		doneName = done++;

	return combinator.first ?
		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( (elem = elem[ dir ]) ) {
				if ( elem.nodeType === 1 || checkNonElements ) {
					return matcher( elem, context, xml );
				}
			}
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			var data, cache, outerCache,
				dirkey = dirruns + " " + doneName;

			// We can't set arbitrary data on XML nodes, so they don't benefit from dir caching
			if ( xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						if ( matcher( elem, context, xml ) ) {
							return true;
						}
					}
				}
			} else {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						outerCache = elem[ expando ] || (elem[ expando ] = {});
						if ( (cache = outerCache[ dir ]) && cache[0] === dirkey ) {
							if ( (data = cache[1]) === true || data === cachedruns ) {
								return data === true;
							}
						} else {
							cache = outerCache[ dir ] = [ dirkey ];
							cache[1] = matcher( elem, context, xml ) || cachedruns;
							if ( cache[1] === true ) {
								return true;
							}
						}
					}
				}
			}
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[i]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[0];
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( (elem = unmatched[i]) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction(function( seed, results, context, xml ) {
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?
				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		if ( matcher ) {
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( (elem = temp[i]) ) {
					matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {
					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) ) {
							// Restore matcherIn since elem is not yet a final match
							temp.push( (matcherIn[i] = elem) );
						}
					}
					postFinder( null, (matcherOut = []), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( (elem = matcherOut[i]) &&
						(temp = postFinder ? indexOf.call( seed, elem ) : preMap[i]) > -1 ) {

						seed[temp] = !(results[temp] = elem);
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	});
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[0].type ],
		implicitRelative = leadingRelative || Expr.relative[" "],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf.call( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {
			return ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				(checkContext = context).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );
		} ];

	for ( ; i < len; i++ ) {
		if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
			matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
		} else {
			matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {
				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[j].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && toSelector( tokens.slice( 0, i - 1 ) ).replace( rtrim, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
					j < len && toSelector( tokens )
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	// A counter to specify which element is currently being matched
	var matcherCachedRuns = 0,
		bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, expandContext ) {
			var elem, j, matcher,
				setMatched = [],
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				outermost = expandContext != null,
				contextBackup = outermostContext,
				// We must always have either seed elements or context
				elems = seed || byElement && Expr.find["TAG"]( "*", expandContext && context.parentNode || context ),
				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1);

			if ( outermost ) {
				outermostContext = context !== document && context;
				cachedruns = matcherCachedRuns;
			}

			// Add elements passing elementMatchers directly to results
			// Keep `i` a string if there are no elements so `matchedCount` will be "00" below
			for ( ; (elem = elems[i]) != null; i++ ) {
				if ( byElement && elem ) {
					j = 0;
					while ( (matcher = elementMatchers[j++]) ) {
						if ( matcher( elem, context, xml ) ) {
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
						cachedruns = ++matcherCachedRuns;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {
					// They will have gone through all possible matchers
					if ( (elem = !matcher && elem) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// Apply set filters to unmatched elements
			matchedCount += i;
			if ( bySet && i !== matchedCount ) {
				j = 0;
				while ( (matcher = setMatchers[j++]) ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {
					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !(unmatched[i] || setMatched[i]) ) {
								setMatched[i] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

compile = Sizzle.compile = function( selector, group /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ selector + " " ];

	if ( !cached ) {
		// Generate a function of recursive functions that can be used to check each element
		if ( !group ) {
			group = tokenize( selector );
		}
		i = group.length;
		while ( i-- ) {
			cached = matcherFromTokens( group[i] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );
	}
	return cached;
};

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[i], results );
	}
	return results;
}

function select( selector, context, results, seed ) {
	var i, tokens, token, type, find,
		match = tokenize( selector );

	if ( !seed ) {
		// Try to minimize operations if there is only one group
		if ( match.length === 1 ) {

			// Take a shortcut and set the context if the root selector is an ID
			tokens = match[0] = match[0].slice( 0 );
			if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
					context.nodeType === 9 && !documentIsXML &&
					Expr.relative[ tokens[1].type ] ) {

				context = Expr.find["ID"]( token.matches[0].replace( runescape, funescape ), context )[0];
				if ( !context ) {
					return results;
				}

				selector = selector.slice( tokens.shift().value.length );
			}

			// Fetch a seed set for right-to-left matching
			i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
			while ( i-- ) {
				token = tokens[i];

				// Abort if we hit a combinator
				if ( Expr.relative[ (type = token.type) ] ) {
					break;
				}
				if ( (find = Expr.find[ type ]) ) {
					// Search, expanding context for leading sibling combinators
					if ( (seed = find(
						token.matches[0].replace( runescape, funescape ),
						rsibling.test( tokens[0].type ) && context.parentNode || context
					)) ) {

						// If seed is empty or no tokens remain, we can return early
						tokens.splice( i, 1 );
						selector = seed.length && toSelector( tokens );
						if ( !selector ) {
							push.apply( results, slice.call( seed, 0 ) );
							return results;
						}

						break;
					}
				}
			}
		}
	}

	// Compile and execute a filtering function
	// Provide `match` to avoid retokenization if we modified the selector above
	compile( selector, match )(
		seed,
		context,
		documentIsXML,
		results,
		rsibling.test( selector )
	);
	return results;
}

// Deprecated
Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Easy API for creating new setFilters
function setFilters() {}
Expr.filters = setFilters.prototype = Expr.pseudos;
Expr.setFilters = new setFilters();

// Initialize with the default document
setDocument();

// Override sizzle attribute retrieval
Sizzle.attr = jQuery.attr;
jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[":"] = jQuery.expr.pseudos;
jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;


})( window );
var runtil = /Until$/,
	rparentsprev = /^(?:parents|prev(?:Until|All))/,
	isSimple = /^.[^:#\[\.,]*$/,
	rneedsContext = jQuery.expr.match.needsContext,
	// methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend({
	find: function( selector ) {
		var i, ret, self,
			len = this.length;

		if ( typeof selector !== "string" ) {
			self = this;
			return this.pushStack( jQuery( selector ).filter(function() {
				for ( i = 0; i < len; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			}) );
		}

		ret = [];
		for ( i = 0; i < len; i++ ) {
			jQuery.find( selector, this[ i ], ret );
		}

		// Needed because $( selector, context ) becomes $( context ).find( selector )
		ret = this.pushStack( len > 1 ? jQuery.unique( ret ) : ret );
		ret.selector = ( this.selector ? this.selector + " " : "" ) + selector;
		return ret;
	},

	has: function( target ) {
		var i,
			targets = jQuery( target, this ),
			len = targets.length;

		return this.filter(function() {
			for ( i = 0; i < len; i++ ) {
				if ( jQuery.contains( this, targets[i] ) ) {
					return true;
				}
			}
		});
	},

	not: function( selector ) {
		return this.pushStack( winnow(this, selector, false) );
	},

	filter: function( selector ) {
		return this.pushStack( winnow(this, selector, true) );
	},

	is: function( selector ) {
		return !!selector && (
			typeof selector === "string" ?
				// If this is a positional/relative selector, check membership in the returned set
				// so $("p:first").is("p:last") won't return true for a doc with two "p".
				rneedsContext.test( selector ) ?
					jQuery( selector, this.context ).index( this[0] ) >= 0 :
					jQuery.filter( selector, this ).length > 0 :
				this.filter( selector ).length > 0 );
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			ret = [],
			pos = rneedsContext.test( selectors ) || typeof selectors !== "string" ?
				jQuery( selectors, context || this.context ) :
				0;

		for ( ; i < l; i++ ) {
			cur = this[i];

			while ( cur && cur.ownerDocument && cur !== context && cur.nodeType !== 11 ) {
				if ( pos ? pos.index(cur) > -1 : jQuery.find.matchesSelector(cur, selectors) ) {
					ret.push( cur );
					break;
				}
				cur = cur.parentNode;
			}
		}

		return this.pushStack( ret.length > 1 ? jQuery.unique( ret ) : ret );
	},

	// Determine the position of an element within
	// the matched set of elements
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[0] && this[0].parentNode ) ? this.first().prevAll().length : -1;
		}

		// index in selector
		if ( typeof elem === "string" ) {
			return jQuery.inArray( this[0], jQuery( elem ) );
		}

		// Locate the position of the desired element
		return jQuery.inArray(
			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[0] : elem, this );
	},

	add: function( selector, context ) {
		var set = typeof selector === "string" ?
				jQuery( selector, context ) :
				jQuery.makeArray( selector && selector.nodeType ? [ selector ] : selector ),
			all = jQuery.merge( this.get(), set );

		return this.pushStack( jQuery.unique(all) );
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter(selector)
		);
	}
});

jQuery.fn.andSelf = jQuery.fn.addBack;

function sibling( cur, dir ) {
	do {
		cur = cur[ dir ];
	} while ( cur && cur.nodeType !== 1 );

	return cur;
}

jQuery.each({
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return jQuery.dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return jQuery.dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return jQuery.dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return jQuery.sibling( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return jQuery.sibling( elem.firstChild );
	},
	contents: function( elem ) {
		return jQuery.nodeName( elem, "iframe" ) ?
			elem.contentDocument || elem.contentWindow.document :
			jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var ret = jQuery.map( this, fn, until );

		if ( !runtil.test( name ) ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			ret = jQuery.filter( selector, ret );
		}

		ret = this.length > 1 && !guaranteedUnique[ name ] ? jQuery.unique( ret ) : ret;

		if ( this.length > 1 && rparentsprev.test( name ) ) {
			ret = ret.reverse();
		}

		return this.pushStack( ret );
	};
});

jQuery.extend({
	filter: function( expr, elems, not ) {
		if ( not ) {
			expr = ":not(" + expr + ")";
		}

		return elems.length === 1 ?
			jQuery.find.matchesSelector(elems[0], expr) ? [ elems[0] ] : [] :
			jQuery.find.matches(expr, elems);
	},

	dir: function( elem, dir, until ) {
		var matched = [],
			cur = elem[ dir ];

		while ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery( cur ).is( until )) ) {
			if ( cur.nodeType === 1 ) {
				matched.push( cur );
			}
			cur = cur[dir];
		}
		return matched;
	},

	sibling: function( n, elem ) {
		var r = [];

		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				r.push( n );
			}
		}

		return r;
	}
});

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, keep ) {

	// Can't pass null or undefined to indexOf in Firefox 4
	// Set to 0 to skip string check
	qualifier = qualifier || 0;

	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep(elements, function( elem, i ) {
			var retVal = !!qualifier.call( elem, i, elem );
			return retVal === keep;
		});

	} else if ( qualifier.nodeType ) {
		return jQuery.grep(elements, function( elem ) {
			return ( elem === qualifier ) === keep;
		});

	} else if ( typeof qualifier === "string" ) {
		var filtered = jQuery.grep(elements, function( elem ) {
			return elem.nodeType === 1;
		});

		if ( isSimple.test( qualifier ) ) {
			return jQuery.filter(qualifier, filtered, !keep);
		} else {
			qualifier = jQuery.filter( qualifier, filtered );
		}
	}

	return jQuery.grep(elements, function( elem ) {
		return ( jQuery.inArray( elem, qualifier ) >= 0 ) === keep;
	});
}
function createSafeFragment( document ) {
	var list = nodeNames.split( "|" ),
		safeFrag = document.createDocumentFragment();

	if ( safeFrag.createElement ) {
		while ( list.length ) {
			safeFrag.createElement(
				list.pop()
			);
		}
	}
	return safeFrag;
}

var nodeNames = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|" +
		"header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",
	rinlinejQuery = / jQuery\d+="(?:null|\d+)"/g,
	rnoshimcache = new RegExp("<(?:" + nodeNames + ")[\\s/>]", "i"),
	rleadingWhitespace = /^\s+/,
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
	rtagName = /<([\w:]+)/,
	rtbody = /<tbody/i,
	rhtml = /<|&#?\w+;/,
	rnoInnerhtml = /<(?:script|style|link)/i,
	manipulation_rcheckableType = /^(?:checkbox|radio)$/i,
	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rscriptType = /^$|\/(?:java|ecma)script/i,
	rscriptTypeMasked = /^true\/(.*)/,
	rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,

	// We have to close these tags to support XHTML (#13200)
	wrapMap = {
		option: [ 1, "<select multiple='multiple'>", "</select>" ],
		legend: [ 1, "<fieldset>", "</fieldset>" ],
		area: [ 1, "<map>", "</map>" ],
		param: [ 1, "<object>", "</object>" ],
		thead: [ 1, "<table>", "</table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

		// IE6-8 can't serialize link, script, style, or any html5 (NoScope) tags,
		// unless wrapped in a div with non-breaking characters in front of it.
		_default: jQuery.support.htmlSerialize ? [ 0, "", "" ] : [ 1, "X<div>", "</div>"  ]
	},
	safeFragment = createSafeFragment( document ),
	fragmentDiv = safeFragment.appendChild( document.createElement("div") );

wrapMap.optgroup = wrapMap.option;
wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

jQuery.fn.extend({
	text: function( value ) {
		return jQuery.access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().append( ( this[0] && this[0].ownerDocument || document ).createTextNode( value ) );
		}, null, value, arguments.length );
	},

	wrapAll: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapAll( html.call(this, i) );
			});
		}

		if ( this[0] ) {
			// The elements to wrap the target around
			var wrap = jQuery( html, this[0].ownerDocument ).eq(0).clone(true);

			if ( this[0].parentNode ) {
				wrap.insertBefore( this[0] );
			}

			wrap.map(function() {
				var elem = this;

				while ( elem.firstChild && elem.firstChild.nodeType === 1 ) {
					elem = elem.firstChild;
				}

				return elem;
			}).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapInner( html.call(this, i) );
			});
		}

		return this.each(function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		});
	},

	wrap: function( html ) {
		var isFunction = jQuery.isFunction( html );

		return this.each(function(i) {
			jQuery( this ).wrapAll( isFunction ? html.call(this, i) : html );
		});
	},

	unwrap: function() {
		return this.parent().each(function() {
			if ( !jQuery.nodeName( this, "body" ) ) {
				jQuery( this ).replaceWith( this.childNodes );
			}
		}).end();
	},

	append: function() {
		return this.domManip(arguments, true, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				this.appendChild( elem );
			}
		});
	},

	prepend: function() {
		return this.domManip(arguments, true, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				this.insertBefore( elem, this.firstChild );
			}
		});
	},

	before: function() {
		return this.domManip( arguments, false, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this );
			}
		});
	},

	after: function() {
		return this.domManip( arguments, false, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			}
		});
	},

	// keepData is for internal use only--do not document
	remove: function( selector, keepData ) {
		var elem,
			i = 0;

		for ( ; (elem = this[i]) != null; i++ ) {
			if ( !selector || jQuery.filter( selector, [ elem ] ).length > 0 ) {
				if ( !keepData && elem.nodeType === 1 ) {
					jQuery.cleanData( getAll( elem ) );
				}

				if ( elem.parentNode ) {
					if ( keepData && jQuery.contains( elem.ownerDocument, elem ) ) {
						setGlobalEval( getAll( elem, "script" ) );
					}
					elem.parentNode.removeChild( elem );
				}
			}
		}

		return this;
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; (elem = this[i]) != null; i++ ) {
			// Remove element nodes and prevent memory leaks
			if ( elem.nodeType === 1 ) {
				jQuery.cleanData( getAll( elem, false ) );
			}

			// Remove any remaining nodes
			while ( elem.firstChild ) {
				elem.removeChild( elem.firstChild );
			}

			// If this is a select, ensure that it displays empty (#12336)
			// Support: IE<9
			if ( elem.options && jQuery.nodeName( elem, "select" ) ) {
				elem.options.length = 0;
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function () {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		});
	},

	html: function( value ) {
		return jQuery.access( this, function( value ) {
			var elem = this[0] || {},
				i = 0,
				l = this.length;

			if ( value === undefined ) {
				return elem.nodeType === 1 ?
					elem.innerHTML.replace( rinlinejQuery, "" ) :
					undefined;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				( jQuery.support.htmlSerialize || !rnoshimcache.test( value )  ) &&
				( jQuery.support.leadingWhitespace || !rleadingWhitespace.test( value ) ) &&
				!wrapMap[ ( rtagName.exec( value ) || ["", ""] )[1].toLowerCase() ] ) {

				value = value.replace( rxhtmlTag, "<$1></$2>" );

				try {
					for (; i < l; i++ ) {
						// Remove element nodes and prevent memory leaks
						elem = this[i] || {};
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( getAll( elem, false ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch(e) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function( value ) {
		var isFunc = jQuery.isFunction( value );

		// Make sure that the elements are removed from the DOM before they are inserted
		// this can help fix replacing a parent with child elements
		if ( !isFunc && typeof value !== "string" ) {
			value = jQuery( value ).not( this ).detach();
		}

		return this.domManip( [ value ], true, function( elem ) {
			var next = this.nextSibling,
				parent = this.parentNode;

			if ( parent ) {
				jQuery( this ).remove();
				parent.insertBefore( elem, next );
			}
		});
	},

	detach: function( selector ) {
		return this.remove( selector, true );
	},

	domManip: function( args, table, callback ) {

		// Flatten any nested arrays
		args = core_concat.apply( [], args );

		var first, node, hasScripts,
			scripts, doc, fragment,
			i = 0,
			l = this.length,
			set = this,
			iNoClone = l - 1,
			value = args[0],
			isFunction = jQuery.isFunction( value );

		// We can't cloneNode fragments that contain checked, in WebKit
		if ( isFunction || !( l <= 1 || typeof value !== "string" || jQuery.support.checkClone || !rchecked.test( value ) ) ) {
			return this.each(function( index ) {
				var self = set.eq( index );
				if ( isFunction ) {
					args[0] = value.call( this, index, table ? self.html() : undefined );
				}
				self.domManip( args, table, callback );
			});
		}

		if ( l ) {
			fragment = jQuery.buildFragment( args, this[ 0 ].ownerDocument, false, this );
			first = fragment.firstChild;

			if ( fragment.childNodes.length === 1 ) {
				fragment = first;
			}

			if ( first ) {
				table = table && jQuery.nodeName( first, "tr" );
				scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
				hasScripts = scripts.length;

				// Use the original fragment for the last item instead of the first because it can end up
				// being emptied incorrectly in certain situations (#8070).
				for ( ; i < l; i++ ) {
					node = fragment;

					if ( i !== iNoClone ) {
						node = jQuery.clone( node, true, true );

						// Keep references to cloned scripts for later restoration
						if ( hasScripts ) {
							jQuery.merge( scripts, getAll( node, "script" ) );
						}
					}

					callback.call(
						table && jQuery.nodeName( this[i], "table" ) ?
							findOrAppend( this[i], "tbody" ) :
							this[i],
						node,
						i
					);
				}

				if ( hasScripts ) {
					doc = scripts[ scripts.length - 1 ].ownerDocument;

					// Reenable scripts
					jQuery.map( scripts, restoreScript );

					// Evaluate executable scripts on first document insertion
					for ( i = 0; i < hasScripts; i++ ) {
						node = scripts[ i ];
						if ( rscriptType.test( node.type || "" ) &&
							!jQuery._data( node, "globalEval" ) && jQuery.contains( doc, node ) ) {

							if ( node.src ) {
								// Hope ajax is available...
								jQuery.ajax({
									url: node.src,
									type: "GET",
									dataType: "script",
									async: false,
									global: false,
									"throws": true
								});
							} else {
								jQuery.globalEval( ( node.text || node.textContent || node.innerHTML || "" ).replace( rcleanScript, "" ) );
							}
						}
					}
				}

				// Fix #11809: Avoid leaking memory
				fragment = first = null;
			}
		}

		return this;
	}
});

function findOrAppend( elem, tag ) {
	return elem.getElementsByTagName( tag )[0] || elem.appendChild( elem.ownerDocument.createElement( tag ) );
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript( elem ) {
	var attr = elem.getAttributeNode("type");
	elem.type = ( attr && attr.specified ) + "/" + elem.type;
	return elem;
}
function restoreScript( elem ) {
	var match = rscriptTypeMasked.exec( elem.type );
	if ( match ) {
		elem.type = match[1];
	} else {
		elem.removeAttribute("type");
	}
	return elem;
}

// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
	var elem,
		i = 0;
	for ( ; (elem = elems[i]) != null; i++ ) {
		jQuery._data( elem, "globalEval", !refElements || jQuery._data( refElements[i], "globalEval" ) );
	}
}

function cloneCopyEvent( src, dest ) {

	if ( dest.nodeType !== 1 || !jQuery.hasData( src ) ) {
		return;
	}

	var type, i, l,
		oldData = jQuery._data( src ),
		curData = jQuery._data( dest, oldData ),
		events = oldData.events;

	if ( events ) {
		delete curData.handle;
		curData.events = {};

		for ( type in events ) {
			for ( i = 0, l = events[ type ].length; i < l; i++ ) {
				jQuery.event.add( dest, type, events[ type ][ i ] );
			}
		}
	}

	// make the cloned public data object a copy from the original
	if ( curData.data ) {
		curData.data = jQuery.extend( {}, curData.data );
	}
}

function fixCloneNodeIssues( src, dest ) {
	var nodeName, e, data;

	// We do not need to do anything for non-Elements
	if ( dest.nodeType !== 1 ) {
		return;
	}

	nodeName = dest.nodeName.toLowerCase();

	// IE6-8 copies events bound via attachEvent when using cloneNode.
	if ( !jQuery.support.noCloneEvent && dest[ jQuery.expando ] ) {
		data = jQuery._data( dest );

		for ( e in data.events ) {
			jQuery.removeEvent( dest, e, data.handle );
		}

		// Event data gets referenced instead of copied if the expando gets copied too
		dest.removeAttribute( jQuery.expando );
	}

	// IE blanks contents when cloning scripts, and tries to evaluate newly-set text
	if ( nodeName === "script" && dest.text !== src.text ) {
		disableScript( dest ).text = src.text;
		restoreScript( dest );

	// IE6-10 improperly clones children of object elements using classid.
	// IE10 throws NoModificationAllowedError if parent is null, #12132.
	} else if ( nodeName === "object" ) {
		if ( dest.parentNode ) {
			dest.outerHTML = src.outerHTML;
		}

		// This path appears unavoidable for IE9. When cloning an object
		// element in IE9, the outerHTML strategy above is not sufficient.
		// If the src has innerHTML and the destination does not,
		// copy the src.innerHTML into the dest.innerHTML. #10324
		if ( jQuery.support.html5Clone && ( src.innerHTML && !jQuery.trim(dest.innerHTML) ) ) {
			dest.innerHTML = src.innerHTML;
		}

	} else if ( nodeName === "input" && manipulation_rcheckableType.test( src.type ) ) {
		// IE6-8 fails to persist the checked state of a cloned checkbox
		// or radio button. Worse, IE6-7 fail to give the cloned element
		// a checked appearance if the defaultChecked value isn't also set

		dest.defaultChecked = dest.checked = src.checked;

		// IE6-7 get confused and end up setting the value of a cloned
		// checkbox/radio button to an empty string instead of "on"
		if ( dest.value !== src.value ) {
			dest.value = src.value;
		}

	// IE6-8 fails to return the selected option to the default selected
	// state when cloning options
	} else if ( nodeName === "option" ) {
		dest.defaultSelected = dest.selected = src.defaultSelected;

	// IE6-8 fails to set the defaultValue to the correct value when
	// cloning other types of input fields
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}
}

jQuery.each({
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			i = 0,
			ret = [],
			insert = jQuery( selector ),
			last = insert.length - 1;

		for ( ; i <= last; i++ ) {
			elems = i === last ? this : this.clone(true);
			jQuery( insert[i] )[ original ]( elems );

			// Modern browsers can apply jQuery collections as arrays, but oldIE needs a .get()
			core_push.apply( ret, elems.get() );
		}

		return this.pushStack( ret );
	};
});

function getAll( context, tag ) {
	var elems, elem,
		i = 0,
		found = typeof context.getElementsByTagName !== core_strundefined ? context.getElementsByTagName( tag || "*" ) :
			typeof context.querySelectorAll !== core_strundefined ? context.querySelectorAll( tag || "*" ) :
			undefined;

	if ( !found ) {
		for ( found = [], elems = context.childNodes || context; (elem = elems[i]) != null; i++ ) {
			if ( !tag || jQuery.nodeName( elem, tag ) ) {
				found.push( elem );
			} else {
				jQuery.merge( found, getAll( elem, tag ) );
			}
		}
	}

	return tag === undefined || tag && jQuery.nodeName( context, tag ) ?
		jQuery.merge( [ context ], found ) :
		found;
}

// Used in buildFragment, fixes the defaultChecked property
function fixDefaultChecked( elem ) {
	if ( manipulation_rcheckableType.test( elem.type ) ) {
		elem.defaultChecked = elem.checked;
	}
}

jQuery.extend({
	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var destElements, node, clone, i, srcElements,
			inPage = jQuery.contains( elem.ownerDocument, elem );

		if ( jQuery.support.html5Clone || jQuery.isXMLDoc(elem) || !rnoshimcache.test( "<" + elem.nodeName + ">" ) ) {
			clone = elem.cloneNode( true );

		// IE<=8 does not properly clone detached, unknown element nodes
		} else {
			fragmentDiv.innerHTML = elem.outerHTML;
			fragmentDiv.removeChild( clone = fragmentDiv.firstChild );
		}

		if ( (!jQuery.support.noCloneEvent || !jQuery.support.noCloneChecked) &&
				(elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem) ) {

			// We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
			destElements = getAll( clone );
			srcElements = getAll( elem );

			// Fix all IE cloning issues
			for ( i = 0; (node = srcElements[i]) != null; ++i ) {
				// Ensure that the destination node is not null; Fixes #9587
				if ( destElements[i] ) {
					fixCloneNodeIssues( node, destElements[i] );
				}
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			if ( deepDataAndEvents ) {
				srcElements = srcElements || getAll( elem );
				destElements = destElements || getAll( clone );

				for ( i = 0; (node = srcElements[i]) != null; i++ ) {
					cloneCopyEvent( node, destElements[i] );
				}
			} else {
				cloneCopyEvent( elem, clone );
			}
		}

		// Preserve script evaluation history
		destElements = getAll( clone, "script" );
		if ( destElements.length > 0 ) {
			setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
		}

		destElements = srcElements = node = null;

		// Return the cloned set
		return clone;
	},

	buildFragment: function( elems, context, scripts, selection ) {
		var j, elem, contains,
			tmp, tag, tbody, wrap,
			l = elems.length,

			// Ensure a safe fragment
			safe = createSafeFragment( context ),

			nodes = [],
			i = 0;

		for ( ; i < l; i++ ) {
			elem = elems[ i ];

			if ( elem || elem === 0 ) {

				// Add nodes directly
				if ( jQuery.type( elem ) === "object" ) {
					jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

				// Convert non-html into a text node
				} else if ( !rhtml.test( elem ) ) {
					nodes.push( context.createTextNode( elem ) );

				// Convert html into DOM nodes
				} else {
					tmp = tmp || safe.appendChild( context.createElement("div") );

					// Deserialize a standard representation
					tag = ( rtagName.exec( elem ) || ["", ""] )[1].toLowerCase();
					wrap = wrapMap[ tag ] || wrapMap._default;

					tmp.innerHTML = wrap[1] + elem.replace( rxhtmlTag, "<$1></$2>" ) + wrap[2];

					// Descend through wrappers to the right content
					j = wrap[0];
					while ( j-- ) {
						tmp = tmp.lastChild;
					}

					// Manually add leading whitespace removed by IE
					if ( !jQuery.support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {
						nodes.push( context.createTextNode( rleadingWhitespace.exec( elem )[0] ) );
					}

					// Remove IE's autoinserted <tbody> from table fragments
					if ( !jQuery.support.tbody ) {

						// String was a <table>, *may* have spurious <tbody>
						elem = tag === "table" && !rtbody.test( elem ) ?
							tmp.firstChild :

							// String was a bare <thead> or <tfoot>
							wrap[1] === "<table>" && !rtbody.test( elem ) ?
								tmp :
								0;

						j = elem && elem.childNodes.length;
						while ( j-- ) {
							if ( jQuery.nodeName( (tbody = elem.childNodes[j]), "tbody" ) && !tbody.childNodes.length ) {
								elem.removeChild( tbody );
							}
						}
					}

					jQuery.merge( nodes, tmp.childNodes );

					// Fix #12392 for WebKit and IE > 9
					tmp.textContent = "";

					// Fix #12392 for oldIE
					while ( tmp.firstChild ) {
						tmp.removeChild( tmp.firstChild );
					}

					// Remember the top-level container for proper cleanup
					tmp = safe.lastChild;
				}
			}
		}

		// Fix #11356: Clear elements from fragment
		if ( tmp ) {
			safe.removeChild( tmp );
		}

		// Reset defaultChecked for any radios and checkboxes
		// about to be appended to the DOM in IE 6/7 (#8060)
		if ( !jQuery.support.appendChecked ) {
			jQuery.grep( getAll( nodes, "input" ), fixDefaultChecked );
		}

		i = 0;
		while ( (elem = nodes[ i++ ]) ) {

			// #4087 - If origin and destination elements are the same, and this is
			// that element, do not do anything
			if ( selection && jQuery.inArray( elem, selection ) !== -1 ) {
				continue;
			}

			contains = jQuery.contains( elem.ownerDocument, elem );

			// Append to fragment
			tmp = getAll( safe.appendChild( elem ), "script" );

			// Preserve script evaluation history
			if ( contains ) {
				setGlobalEval( tmp );
			}

			// Capture executables
			if ( scripts ) {
				j = 0;
				while ( (elem = tmp[ j++ ]) ) {
					if ( rscriptType.test( elem.type || "" ) ) {
						scripts.push( elem );
					}
				}
			}
		}

		tmp = null;

		return safe;
	},

	cleanData: function( elems, /* internal */ acceptData ) {
		var elem, type, id, data,
			i = 0,
			internalKey = jQuery.expando,
			cache = jQuery.cache,
			deleteExpando = jQuery.support.deleteExpando,
			special = jQuery.event.special;

		for ( ; (elem = elems[i]) != null; i++ ) {

			if ( acceptData || jQuery.acceptData( elem ) ) {

				id = elem[ internalKey ];
				data = id && cache[ id ];

				if ( data ) {
					if ( data.events ) {
						for ( type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
					}

					// Remove cache only if it was not already removed by jQuery.event.remove
					if ( cache[ id ] ) {

						delete cache[ id ];

						// IE does not allow us to delete expando properties from nodes,
						// nor does it have a removeAttribute function on Document nodes;
						// we must handle all of these cases
						if ( deleteExpando ) {
							delete elem[ internalKey ];

						} else if ( typeof elem.removeAttribute !== core_strundefined ) {
							elem.removeAttribute( internalKey );

						} else {
							elem[ internalKey ] = null;
						}

						core_deletedIds.push( id );
					}
				}
			}
		}
	}
});
var iframe, getStyles, curCSS,
	ralpha = /alpha\([^)]*\)/i,
	ropacity = /opacity\s*=\s*([^)]*)/,
	rposition = /^(top|right|bottom|left)$/,
	// swappable if display is none or starts with table except "table", "table-cell", or "table-caption"
	// see here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	rmargin = /^margin/,
	rnumsplit = new RegExp( "^(" + core_pnum + ")(.*)$", "i" ),
	rnumnonpx = new RegExp( "^(" + core_pnum + ")(?!px)[a-z%]+$", "i" ),
	rrelNum = new RegExp( "^([+-])=(" + core_pnum + ")", "i" ),
	elemdisplay = { BODY: "block" },

	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: 0,
		fontWeight: 400
	},

	cssExpand = [ "Top", "Right", "Bottom", "Left" ],
	cssPrefixes = [ "Webkit", "O", "Moz", "ms" ];

// return a css property mapped to a potentially vendor prefixed property
function vendorPropName( style, name ) {

	// shortcut for names that are not vendor prefixed
	if ( name in style ) {
		return name;
	}

	// check for vendor prefixed names
	var capName = name.charAt(0).toUpperCase() + name.slice(1),
		origName = name,
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in style ) {
			return name;
		}
	}

	return origName;
}

function isHidden( elem, el ) {
	// isHidden might be called from jQuery#filter function;
	// in that case, element will be second argument
	elem = el || elem;
	return jQuery.css( elem, "display" ) === "none" || !jQuery.contains( elem.ownerDocument, elem );
}

function showHide( elements, show ) {
	var display, elem, hidden,
		values = [],
		index = 0,
		length = elements.length;

	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}

		values[ index ] = jQuery._data( elem, "olddisplay" );
		display = elem.style.display;
		if ( show ) {
			// Reset the inline display of this element to learn if it is
			// being hidden by cascaded rules or not
			if ( !values[ index ] && display === "none" ) {
				elem.style.display = "";
			}

			// Set elements which have been overridden with display: none
			// in a stylesheet to whatever the default browser style is
			// for such an element
			if ( elem.style.display === "" && isHidden( elem ) ) {
				values[ index ] = jQuery._data( elem, "olddisplay", css_defaultDisplay(elem.nodeName) );
			}
		} else {

			if ( !values[ index ] ) {
				hidden = isHidden( elem );

				if ( display && display !== "none" || !hidden ) {
					jQuery._data( elem, "olddisplay", hidden ? display : jQuery.css( elem, "display" ) );
				}
			}
		}
	}

	// Set the display of most of the elements in a second loop
	// to avoid the constant reflow
	for ( index = 0; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}
		if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
			elem.style.display = show ? values[ index ] || "" : "none";
		}
	}

	return elements;
}

jQuery.fn.extend({
	css: function( name, value ) {
		return jQuery.access( this, function( elem, name, value ) {
			var len, styles,
				map = {},
				i = 0;

			if ( jQuery.isArray( name ) ) {
				styles = getStyles( elem );
				len = name.length;

				for ( ; i < len; i++ ) {
					map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
				}

				return map;
			}

			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	},
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state ) {
		var bool = typeof state === "boolean";

		return this.each(function() {
			if ( bool ? state : isHidden( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		});
	}
});

jQuery.extend({
	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {
					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;
				}
			}
		}
	},

	// Exclude the following css properties to add px
	cssNumber: {
		"columnCount": true,
		"fillOpacity": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {
		// normalize float css property
		"float": jQuery.support.cssFloat ? "cssFloat" : "styleFloat"
	},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {
		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = jQuery.camelCase( name ),
			style = elem.style;

		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( style, origName ) );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// convert relative number strings (+= or -=) to relative numbers. #7345
			if ( type === "string" && (ret = rrelNum.exec( value )) ) {
				value = ( ret[1] + 1 ) * ret[2] + parseFloat( jQuery.css( elem, name ) );
				// Fixes bug #9237
				type = "number";
			}

			// Make sure that NaN and null values aren't set. See: #7116
			if ( value == null || type === "number" && isNaN( value ) ) {
				return;
			}

			// If a number was passed in, add 'px' to the (except for certain CSS properties)
			if ( type === "number" && !jQuery.cssNumber[ origName ] ) {
				value += "px";
			}

			// Fixes #8908, it can be done more correctly by specifing setters in cssHooks,
			// but it would mean to define eight (for every problematic property) identical functions
			if ( !jQuery.support.clearCloneStyle && value === "" && name.indexOf("background") === 0 ) {
				style[ name ] = "inherit";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !("set" in hooks) || (value = hooks.set( elem, value, extra )) !== undefined ) {

				// Wrapped to prevent IE from throwing errors when 'invalid' values are provided
				// Fixes bug #5509
				try {
					style[ name ] = value;
				} catch(e) {}
			}

		} else {
			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {
				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra, styles ) {
		var num, val, hooks,
			origName = jQuery.camelCase( name );

		// Make sure that we're working with the right name
		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( elem.style, origName ) );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name, styles );
		}

		//convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Return, converting to number if forced or a qualifier was provided and val looks numeric
		if ( extra === "" || extra ) {
			num = parseFloat( val );
			return extra === true || jQuery.isNumeric( num ) ? num || 0 : val;
		}
		return val;
	},

	// A method for quickly swapping in/out CSS properties to get correct calculations
	swap: function( elem, options, callback, args ) {
		var ret, name,
			old = {};

		// Remember the old values, and insert the new ones
		for ( name in options ) {
			old[ name ] = elem.style[ name ];
			elem.style[ name ] = options[ name ];
		}

		ret = callback.apply( elem, args || [] );

		// Revert the old values
		for ( name in options ) {
			elem.style[ name ] = old[ name ];
		}

		return ret;
	}
});

// NOTE: we've included the "window" in window.getComputedStyle
// because jsdom on node.js will break without it.
if ( window.getComputedStyle ) {
	getStyles = function( elem ) {
		return window.getComputedStyle( elem, null );
	};

	curCSS = function( elem, name, _computed ) {
		var width, minWidth, maxWidth,
			computed = _computed || getStyles( elem ),

			// getPropertyValue is only needed for .css('filter') in IE9, see #12537
			ret = computed ? computed.getPropertyValue( name ) || computed[ name ] : undefined,
			style = elem.style;

		if ( computed ) {

			if ( ret === "" && !jQuery.contains( elem.ownerDocument, elem ) ) {
				ret = jQuery.style( elem, name );
			}

			// A tribute to the "awesome hack by Dean Edwards"
			// Chrome < 17 and Safari 5.0 uses "computed value" instead of "used value" for margin-right
			// Safari 5.1.7 (at least) returns percentage for a larger set of values, but width seems to be reliably pixels
			// this is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values
			if ( rnumnonpx.test( ret ) && rmargin.test( name ) ) {

				// Remember the original values
				width = style.width;
				minWidth = style.minWidth;
				maxWidth = style.maxWidth;

				// Put in the new values to get a computed value out
				style.minWidth = style.maxWidth = style.width = ret;
				ret = computed.width;

				// Revert the changed values
				style.width = width;
				style.minWidth = minWidth;
				style.maxWidth = maxWidth;
			}
		}

		return ret;
	};
} else if ( document.documentElement.currentStyle ) {
	getStyles = function( elem ) {
		return elem.currentStyle;
	};

	curCSS = function( elem, name, _computed ) {
		var left, rs, rsLeft,
			computed = _computed || getStyles( elem ),
			ret = computed ? computed[ name ] : undefined,
			style = elem.style;

		// Avoid setting ret to empty string here
		// so we don't default to auto
		if ( ret == null && style && style[ name ] ) {
			ret = style[ name ];
		}

		// From the awesome hack by Dean Edwards
		// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

		// If we're not dealing with a regular pixel number
		// but a number that has a weird ending, we need to convert it to pixels
		// but not position css attributes, as those are proportional to the parent element instead
		// and we can't measure the parent instead because it might trigger a "stacking dolls" problem
		if ( rnumnonpx.test( ret ) && !rposition.test( name ) ) {

			// Remember the original values
			left = style.left;
			rs = elem.runtimeStyle;
			rsLeft = rs && rs.left;

			// Put in the new values to get a computed value out
			if ( rsLeft ) {
				rs.left = elem.currentStyle.left;
			}
			style.left = name === "fontSize" ? "1em" : ret;
			ret = style.pixelLeft + "px";

			// Revert the changed values
			style.left = left;
			if ( rsLeft ) {
				rs.left = rsLeft;
			}
		}

		return ret === "" ? "auto" : ret;
	};
}

function setPositiveNumber( elem, value, subtract ) {
	var matches = rnumsplit.exec( value );
	return matches ?
		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, matches[ 1 ] - ( subtract || 0 ) ) + ( matches[ 2 ] || "px" ) :
		value;
}

function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
	var i = extra === ( isBorderBox ? "border" : "content" ) ?
		// If we already have the right measurement, avoid augmentation
		4 :
		// Otherwise initialize for horizontal or vertical properties
		name === "width" ? 1 : 0,

		val = 0;

	for ( ; i < 4; i += 2 ) {
		// both box models exclude margin, so add it if we want it
		if ( extra === "margin" ) {
			val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
		}

		if ( isBorderBox ) {
			// border-box includes padding, so remove it if we want content
			if ( extra === "content" ) {
				val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
			}

			// at this point, extra isn't border nor margin, so remove border
			if ( extra !== "margin" ) {
				val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		} else {
			// at this point, extra isn't content, so add padding
			val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

			// at this point, extra isn't content nor padding, so add border
			if ( extra !== "padding" ) {
				val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		}
	}

	return val;
}

function getWidthOrHeight( elem, name, extra ) {

	// Start with offset property, which is equivalent to the border-box value
	var valueIsBorderBox = true,
		val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
		styles = getStyles( elem ),
		isBorderBox = jQuery.support.boxSizing && jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

	// some non-html elements return undefined for offsetWidth, so check for null/undefined
	// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
	// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
	if ( val <= 0 || val == null ) {
		// Fall back to computed then uncomputed css if necessary
		val = curCSS( elem, name, styles );
		if ( val < 0 || val == null ) {
			val = elem.style[ name ];
		}

		// Computed unit is not pixels. Stop here and return.
		if ( rnumnonpx.test(val) ) {
			return val;
		}

		// we need the check for style in case a browser which returns unreliable values
		// for getComputedStyle silently falls back to the reliable elem.style
		valueIsBorderBox = isBorderBox && ( jQuery.support.boxSizingReliable || val === elem.style[ name ] );

		// Normalize "", auto, and prepare for extra
		val = parseFloat( val ) || 0;
	}

	// use the active box-sizing model to add/subtract irrelevant styles
	return ( val +
		augmentWidthOrHeight(
			elem,
			name,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox,
			styles
		)
	) + "px";
}

// Try to determine the default display value of an element
function css_defaultDisplay( nodeName ) {
	var doc = document,
		display = elemdisplay[ nodeName ];

	if ( !display ) {
		display = actualDisplay( nodeName, doc );

		// If the simple way fails, read from inside an iframe
		if ( display === "none" || !display ) {
			// Use the already-created iframe if possible
			iframe = ( iframe ||
				jQuery("<iframe frameborder='0' width='0' height='0'/>")
				.css( "cssText", "display:block !important" )
			).appendTo( doc.documentElement );

			// Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
			doc = ( iframe[0].contentWindow || iframe[0].contentDocument ).document;
			doc.write("<!doctype html><html><body>");
			doc.close();

			display = actualDisplay( nodeName, doc );
			iframe.detach();
		}

		// Store the correct default display
		elemdisplay[ nodeName ] = display;
	}

	return display;
}

// Called ONLY from within css_defaultDisplay
function actualDisplay( name, doc ) {
	var elem = jQuery( doc.createElement( name ) ).appendTo( doc.body ),
		display = jQuery.css( elem[0], "display" );
	elem.remove();
	return display;
}

jQuery.each([ "height", "width" ], function( i, name ) {
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {
				// certain elements can have dimension info if we invisibly show them
				// however, it must have a current display style that would benefit from this
				return elem.offsetWidth === 0 && rdisplayswap.test( jQuery.css( elem, "display" ) ) ?
					jQuery.swap( elem, cssShow, function() {
						return getWidthOrHeight( elem, name, extra );
					}) :
					getWidthOrHeight( elem, name, extra );
			}
		},

		set: function( elem, value, extra ) {
			var styles = extra && getStyles( elem );
			return setPositiveNumber( elem, value, extra ?
				augmentWidthOrHeight(
					elem,
					name,
					extra,
					jQuery.support.boxSizing && jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
					styles
				) : 0
			);
		}
	};
});

if ( !jQuery.support.opacity ) {
	jQuery.cssHooks.opacity = {
		get: function( elem, computed ) {
			// IE uses filters for opacity
			return ropacity.test( (computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || "" ) ?
				( 0.01 * parseFloat( RegExp.$1 ) ) + "" :
				computed ? "1" : "";
		},

		set: function( elem, value ) {
			var style = elem.style,
				currentStyle = elem.currentStyle,
				opacity = jQuery.isNumeric( value ) ? "alpha(opacity=" + value * 100 + ")" : "",
				filter = currentStyle && currentStyle.filter || style.filter || "";

			// IE has trouble with opacity if it does not have layout
			// Force it by setting the zoom level
			style.zoom = 1;

			// if setting opacity to 1, and no other filters exist - attempt to remove filter attribute #6652
			// if value === "", then remove inline opacity #12685
			if ( ( value >= 1 || value === "" ) &&
					jQuery.trim( filter.replace( ralpha, "" ) ) === "" &&
					style.removeAttribute ) {

				// Setting style.filter to null, "" & " " still leave "filter:" in the cssText
				// if "filter:" is present at all, clearType is disabled, we want to avoid this
				// style.removeAttribute is IE Only, but so apparently is this code path...
				style.removeAttribute( "filter" );

				// if there is no filter style applied in a css rule or unset inline opacity, we are done
				if ( value === "" || currentStyle && !currentStyle.filter ) {
					return;
				}
			}

			// otherwise, set new filter values
			style.filter = ralpha.test( filter ) ?
				filter.replace( ralpha, opacity ) :
				filter + " " + opacity;
		}
	};
}

// These hooks cannot be added until DOM ready because the support test
// for it is not run until after DOM ready
jQuery(function() {
	if ( !jQuery.support.reliableMarginRight ) {
		jQuery.cssHooks.marginRight = {
			get: function( elem, computed ) {
				if ( computed ) {
					// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
					// Work around by temporarily setting element display to inline-block
					return jQuery.swap( elem, { "display": "inline-block" },
						curCSS, [ elem, "marginRight" ] );
				}
			}
		};
	}

	// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
	// getComputedStyle returns percent when specified for top/left/bottom/right
	// rather than make the css module depend on the offset module, we just check for it here
	if ( !jQuery.support.pixelPosition && jQuery.fn.position ) {
		jQuery.each( [ "top", "left" ], function( i, prop ) {
			jQuery.cssHooks[ prop ] = {
				get: function( elem, computed ) {
					if ( computed ) {
						computed = curCSS( elem, prop );
						// if curCSS returns percentage, fallback to offset
						return rnumnonpx.test( computed ) ?
							jQuery( elem ).position()[ prop ] + "px" :
							computed;
					}
				}
			};
		});
	}

});

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.hidden = function( elem ) {
		// Support: Opera <= 12.12
		// Opera reports offsetWidths and offsetHeights less than zero on some elements
		return elem.offsetWidth <= 0 && elem.offsetHeight <= 0 ||
			(!jQuery.support.reliableHiddenOffsets && ((elem.style && elem.style.display) || jQuery.css( elem, "display" )) === "none");
	};

	jQuery.expr.filters.visible = function( elem ) {
		return !jQuery.expr.filters.hidden( elem );
	};
}

// These hooks are used by animate to expand properties
jQuery.each({
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i = 0,
				expanded = {},

				// assumes a single number if not a string
				parts = typeof value === "string" ? value.split(" ") : [ value ];

			for ( ; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( !rmargin.test( prefix ) ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
});
var r20 = /%20/g,
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	rsubmittable = /^(?:input|select|textarea|keygen)/i;

jQuery.fn.extend({
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map(function(){
			// Can add propHook for "elements" to filter or add form elements
			var elements = jQuery.prop( this, "elements" );
			return elements ? jQuery.makeArray( elements ) : this;
		})
		.filter(function(){
			var type = this.type;
			// Use .is(":disabled") so that fieldset[disabled] works
			return this.name && !jQuery( this ).is( ":disabled" ) &&
				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
				( this.checked || !manipulation_rcheckableType.test( type ) );
		})
		.map(function( i, elem ){
			var val = jQuery( this ).val();

			return val == null ?
				null :
				jQuery.isArray( val ) ?
					jQuery.map( val, function( val ){
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					}) :
					{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		}).get();
	}
});

//Serialize an array of form elements or a set of
//key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, value ) {
			// If value is a function, invoke it and return its value
			value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
			s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
		};

	// Set traditional to true for jQuery <= 1.3.2 behavior.
	if ( traditional === undefined ) {
		traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
	}

	// If an array was passed in, assume that it is an array of form elements.
	if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		});

	} else {
		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" ).replace( r20, "+" );
};

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( jQuery.isArray( obj ) ) {
		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {
				// Treat each array item as a scalar.
				add( prefix, v );

			} else {
				// Item is non-scalar (array or object), encode its numeric index.
				buildParams( prefix + "[" + ( typeof v === "object" ? i : "" ) + "]", v, traditional, add );
			}
		});

	} else if ( !traditional && jQuery.type( obj ) === "object" ) {
		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {
		// Serialize scalar item.
		add( prefix, obj );
	}
}
jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error contextmenu").split(" "), function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};
});

jQuery.fn.hover = function( fnOver, fnOut ) {
	return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
};
var
	// Document location
	ajaxLocParts,
	ajaxLocation,
	ajax_nonce = jQuery.now(),

	ajax_rquery = /\?/,
	rhash = /#.*$/,
	rts = /([?&])_=[^&]*/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg, // IE leaves an \r character at EOL
	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,
	rurl = /^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,

	// Keep a copy of the old load method
	_load = jQuery.fn.load,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = "*/".concat("*");

// #8138, IE may throw an exception when accessing
// a field from window.location if document.domain has been set
try {
	ajaxLocation = location.href;
} catch( e ) {
	// Use the href attribute of an A element
	// since IE will modify it given document.location
	ajaxLocation = document.createElement( "a" );
	ajaxLocation.href = "";
	ajaxLocation = ajaxLocation.href;
}

// Segment location into parts
ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType,
			i = 0,
			dataTypes = dataTypeExpression.toLowerCase().match( core_rnotwhite ) || [];

		if ( jQuery.isFunction( func ) ) {
			// For each dataType in the dataTypeExpression
			while ( (dataType = dataTypes[i++]) ) {
				// Prepend if requested
				if ( dataType[0] === "+" ) {
					dataType = dataType.slice( 1 ) || "*";
					(structure[ dataType ] = structure[ dataType ] || []).unshift( func );

				// Otherwise append
				} else {
					(structure[ dataType ] = structure[ dataType ] || []).push( func );
				}
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

	var inspected = {},
		seekingTransport = ( structure === transports );

	function inspect( dataType ) {
		var selected;
		inspected[ dataType ] = true;
		jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
			var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
			if( typeof dataTypeOrTransport === "string" && !seekingTransport && !inspected[ dataTypeOrTransport ] ) {
				options.dataTypes.unshift( dataTypeOrTransport );
				inspect( dataTypeOrTransport );
				return false;
			} else if ( seekingTransport ) {
				return !( selected = dataTypeOrTransport );
			}
		});
		return selected;
	}

	return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var deep, key,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};

	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || (deep = {}) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}

	return target;
}

jQuery.fn.load = function( url, params, callback ) {
	if ( typeof url !== "string" && _load ) {
		return _load.apply( this, arguments );
	}

	var selector, response, type,
		self = this,
		off = url.indexOf(" ");

	if ( off >= 0 ) {
		selector = url.slice( off, url.length );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( jQuery.isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// If we have elements to modify, make the request
	if ( self.length > 0 ) {
		jQuery.ajax({
			url: url,

			// if "type" variable is undefined, then "GET" method will be used
			type: type,
			dataType: "html",
			data: params
		}).done(function( responseText ) {

			// Save response for use in complete callback
			response = arguments;

			self.html( selector ?

				// If a selector was specified, locate the right elements in a dummy div
				// Exclude scripts to avoid IE 'Permission Denied' errors
				jQuery("<div>").append( jQuery.parseHTML( responseText ) ).find( selector ) :

				// Otherwise use the full result
				responseText );

		}).complete( callback && function( jqXHR, status ) {
			self.each( callback, response || [ jqXHR.responseText, status, jqXHR ] );
		});
	}

	return this;
};

// Attach a bunch of functions for handling common AJAX events
jQuery.each( [ "ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend" ], function( i, type ){
	jQuery.fn[ type ] = function( fn ){
		return this.on( type, fn );
	};
});

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {
		// shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		return jQuery.ajax({
			url: url,
			type: method,
			dataType: type,
			data: data,
			success: callback
		});
	};
});

jQuery.extend({

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {},

	ajaxSettings: {
		url: ajaxLocation,
		type: "GET",
		isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
		global: true,
		processData: true,
		async: true,
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			"*": allTypes,
			text: "text/plain",
			html: "text/html",
			xml: "application/xml, text/xml",
			json: "application/json, text/javascript"
		},

		contents: {
			xml: /xml/,
			html: /html/,
			json: /json/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText"
		},

		// Data converters
		// Keys separate source (or catchall "*") and destination types with a single space
		converters: {

			// Convert anything to text
			"* text": window.String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": jQuery.parseJSON,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			url: true,
			context: true
		}
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		return settings ?

			// Building a settings object
			ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

			// Extending ajaxSettings
			ajaxExtend( jQuery.ajaxSettings, target );
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var // Cross-domain detection vars
			parts,
			// Loop variable
			i,
			// URL without anti-cache param
			cacheURL,
			// Response headers as string
			responseHeadersString,
			// timeout handle
			timeoutTimer,

			// To know if global events are to be dispatched
			fireGlobals,

			transport,
			// Response headers
			responseHeaders,
			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),
			// Callbacks context
			callbackContext = s.context || s,
			// Context for global events is callbackContext if it is a DOM node or jQuery collection
			globalEventContext = s.context && ( callbackContext.nodeType || callbackContext.jquery ) ?
				jQuery( callbackContext ) :
				jQuery.event,
			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks("once memory"),
			// Status-dependent callbacks
			statusCode = s.statusCode || {},
			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},
			// The jqXHR state
			state = 0,
			// Default abort message
			strAbort = "canceled",
			// Fake xhr
			jqXHR = {
				readyState: 0,

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( state === 2 ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while ( (match = rheaders.exec( responseHeadersString )) ) {
								responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match == null ? null : match;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return state === 2 ? responseHeadersString : null;
				},

				// Caches the header
				setRequestHeader: function( name, value ) {
					var lname = name.toLowerCase();
					if ( !state ) {
						name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( !state ) {
						s.mimeType = type;
					}
					return this;
				},

				// Status-dependent callbacks
				statusCode: function( map ) {
					var code;
					if ( map ) {
						if ( state < 2 ) {
							for ( code in map ) {
								// Lazy-add the new callback in a way that preserves old ones
								statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
							}
						} else {
							// Execute the appropriate callbacks
							jqXHR.always( map[ jqXHR.status ] );
						}
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					var finalText = statusText || strAbort;
					if ( transport ) {
						transport.abort( finalText );
					}
					done( 0, finalText );
					return this;
				}
			};

		// Attach deferreds
		deferred.promise( jqXHR ).complete = completeDeferred.add;
		jqXHR.success = jqXHR.done;
		jqXHR.error = jqXHR.fail;

		// Remove hash character (#7531: and string promotion)
		// Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
		// Handle falsy url in the settings object (#10093: consistency with old signature)
		// We also use the url parameter if available
		s.url = ( ( url || s.url || ajaxLocation ) + "" ).replace( rhash, "" ).replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

		// Alias method option to type as per ticket #12004
		s.type = options.method || options.type || s.method || s.type;

		// Extract dataTypes list
		s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().match( core_rnotwhite ) || [""];

		// A cross-domain request is in order when we have a protocol:host:port mismatch
		if ( s.crossDomain == null ) {
			parts = rurl.exec( s.url.toLowerCase() );
			s.crossDomain = !!( parts &&
				( parts[ 1 ] !== ajaxLocParts[ 1 ] || parts[ 2 ] !== ajaxLocParts[ 2 ] ||
					( parts[ 3 ] || ( parts[ 1 ] === "http:" ? 80 : 443 ) ) !=
						( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? 80 : 443 ) ) )
			);
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( state === 2 ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		fireGlobals = s.global;

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger("ajaxStart");
		}

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Save the URL in case we're toying with the If-Modified-Since
		// and/or If-None-Match header later on
		cacheURL = s.url;

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// If data is available, append data to url
			if ( s.data ) {
				cacheURL = ( s.url += ( ajax_rquery.test( cacheURL ) ? "&" : "?" ) + s.data );
				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Add anti-cache in url if needed
			if ( s.cache === false ) {
				s.url = rts.test( cacheURL ) ?

					// If there is already a '_' parameter, set its value
					cacheURL.replace( rts, "$1_=" + ajax_nonce++ ) :

					// Otherwise add one to the end
					cacheURL + ( ajax_rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + ajax_nonce++;
			}
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			if ( jQuery.lastModified[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
			}
			if ( jQuery.etag[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
				s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
			// Abort if not done already and return
			return jqXHR.abort();
		}

		// aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		for ( i in { success: 1, error: 1, complete: 1 } ) {
			jqXHR[ i ]( s[ i ] );
		}

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;

			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}
			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = setTimeout(function() {
					jqXHR.abort("timeout");
				}, s.timeout );
			}

			try {
				state = 1;
				transport.send( requestHeaders, done );
			} catch ( e ) {
				// Propagate exception as error if not done
				if ( state < 2 ) {
					done( -1, e );
				// Simply rethrow otherwise
				} else {
					throw e;
				}
			}
		}

		// Callback for when everything is done
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Called once
			if ( state === 2 ) {
				return;
			}

			// State is "done" now
			state = 2;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// If successful, handle type chaining
			if ( status >= 200 && status < 300 || status === 304 ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {
					modified = jqXHR.getResponseHeader("Last-Modified");
					if ( modified ) {
						jQuery.lastModified[ cacheURL ] = modified;
					}
					modified = jqXHR.getResponseHeader("etag");
					if ( modified ) {
						jQuery.etag[ cacheURL ] = modified;
					}
				}

				// if no content
				if ( status === 204 ) {
					isSuccess = true;
					statusText = "nocontent";

				// if not modified
				} else if ( status === 304 ) {
					isSuccess = true;
					statusText = "notmodified";

				// If we have data, let's convert it
				} else {
					isSuccess = ajaxConvert( s, response );
					statusText = isSuccess.state;
					success = isSuccess.data;
					error = isSuccess.error;
					isSuccess = !error;
				}
			} else {
				// We extract error from statusText
				// then normalize statusText and status for non-aborts
				error = statusText;
				if ( status || !statusText ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
					[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );
				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger("ajaxStop");
				}
			}
		}

		return jqXHR;
	},

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	}
});

/* Handles responses to an ajax request:
 * - sets all responseXXX fields accordingly
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {
	var firstDataType, ct, finalDataType, type,
		contents = s.contents,
		dataTypes = s.dataTypes,
		responseFields = s.responseFields;

	// Fill responseXXX fields
	for ( type in responseFields ) {
		if ( type in responses ) {
			jqXHR[ responseFields[type] ] = responses[ type ];
		}
	}

	// Remove auto dataType and get content-type in the process
	while( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {
		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[0] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}
		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

// Chain conversions given the request and the original response
function ajaxConvert( s, response ) {
	var conv2, current, conv, tmp,
		converters = {},
		i = 0,
		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice(),
		prev = dataTypes[ 0 ];

	// Apply the dataFilter if provided
	if ( s.dataFilter ) {
		response = s.dataFilter( response, s.dataType );
	}

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	// Convert to each sequential dataType, tolerating list modification
	for ( ; (current = dataTypes[++i]); ) {

		// There's only work to do if current dataType is non-auto
		if ( current !== "*" ) {

			// Convert response if prev dataType is non-auto and differs from current
			if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split(" ");
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {
								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.splice( i--, 0, current );
								}

								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s["throws"] ) {
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return { state: "parsererror", error: conv ? e : "No conversion from " + prev + " to " + current };
						}
					}
				}
			}

			// Update prev for next iteration
			prev = current;
		}
	}

	return { state: "success", data: response };
}
// Install script dataType
jQuery.ajaxSetup({
	accepts: {
		script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /(?:java|ecma)script/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
});

// Handle cache's special case and global
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
		s.global = false;
	}
});

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function(s) {

	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {

		var script,
			head = document.head || jQuery("head")[0] || document.documentElement;

		return {

			send: function( _, callback ) {

				script = document.createElement("script");

				script.async = true;

				if ( s.scriptCharset ) {
					script.charset = s.scriptCharset;
				}

				script.src = s.url;

				// Attach handlers for all browsers
				script.onload = script.onreadystatechange = function( _, isAbort ) {

					if ( isAbort || !script.readyState || /loaded|complete/.test( script.readyState ) ) {

						// Handle memory leak in IE
						script.onload = script.onreadystatechange = null;

						// Remove the script
						if ( script.parentNode ) {
							script.parentNode.removeChild( script );
						}

						// Dereference the script
						script = null;

						// Callback if not abort
						if ( !isAbort ) {
							callback( 200, "success" );
						}
					}
				};

				// Circumvent IE6 bugs with base elements (#2709 and #4378) by prepending
				// Use native DOM manipulation to avoid our domManip AJAX trickery
				head.insertBefore( script, head.firstChild );
			},

			abort: function() {
				if ( script ) {
					script.onload( undefined, true );
				}
			}
		};
	}
});
var oldCallbacks = [],
	rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup({
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( ajax_nonce++ ) );
		this[ callback ] = true;
		return callback;
	}
});

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
			"url" :
			typeof s.data === "string" && !( s.contentType || "" ).indexOf("application/x-www-form-urlencoded") && rjsonp.test( s.data ) && "data"
		);

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;

		// Insert callback into url or form data
		if ( jsonProp ) {
			s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
		} else if ( s.jsonp !== false ) {
			s.url += ( ajax_rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters["script json"] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		overwritten = window[ callbackName ];
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always(function() {
			// Restore preexisting value
			window[ callbackName ] = overwritten;

			// Save back as free
			if ( s[ callbackName ] ) {
				// make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && jQuery.isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		});

		// Delegate to script
		return "script";
	}
});
var xhrCallbacks, xhrSupported,
	xhrId = 0,
	// #5280: Internet Explorer will keep connections alive if we don't abort on unload
	xhrOnUnloadAbort = window.ActiveXObject && function() {
		// Abort all pending requests
		var key;
		for ( key in xhrCallbacks ) {
			xhrCallbacks[ key ]( undefined, true );
		}
	};

// Functions to create xhrs
function createStandardXHR() {
	try {
		return new window.XMLHttpRequest();
	} catch( e ) {}
}

function createActiveXHR() {
	try {
		return new window.ActiveXObject("Microsoft.XMLHTTP");
	} catch( e ) {}
}

// Create the request object
// (This is still attached to ajaxSettings for backward compatibility)
jQuery.ajaxSettings.xhr = window.ActiveXObject ?
	/* Microsoft failed to properly
	 * implement the XMLHttpRequest in IE7 (can't request local files),
	 * so we use the ActiveXObject when it is available
	 * Additionally XMLHttpRequest can be disabled in IE7/IE8 so
	 * we need a fallback.
	 */
	function() {
		return !this.isLocal && createStandardXHR() || createActiveXHR();
	} :
	// For all other browsers, use the standard XMLHttpRequest object
	createStandardXHR;

// Determine support properties
xhrSupported = jQuery.ajaxSettings.xhr();
jQuery.support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
xhrSupported = jQuery.support.ajax = !!xhrSupported;

// Create transport if the browser can provide an xhr
if ( xhrSupported ) {

	jQuery.ajaxTransport(function( s ) {
		// Cross domain only allowed if supported through XMLHttpRequest
		if ( !s.crossDomain || jQuery.support.cors ) {

			var callback;

			return {
				send: function( headers, complete ) {

					// Get a new xhr
					var handle, i,
						xhr = s.xhr();

					// Open the socket
					// Passing null username, generates a login popup on Opera (#2865)
					if ( s.username ) {
						xhr.open( s.type, s.url, s.async, s.username, s.password );
					} else {
						xhr.open( s.type, s.url, s.async );
					}

					// Apply custom fields if provided
					if ( s.xhrFields ) {
						for ( i in s.xhrFields ) {
							xhr[ i ] = s.xhrFields[ i ];
						}
					}

					// Override mime type if needed
					if ( s.mimeType && xhr.overrideMimeType ) {
						xhr.overrideMimeType( s.mimeType );
					}

					// X-Requested-With header
					// For cross-domain requests, seeing as conditions for a preflight are
					// akin to a jigsaw puzzle, we simply never set it to be sure.
					// (it can always be set on a per-request basis or even using ajaxSetup)
					// For same-domain requests, won't change header if already provided.
					if ( !s.crossDomain && !headers["X-Requested-With"] ) {
						headers["X-Requested-With"] = "XMLHttpRequest";
					}

					// Need an extra try/catch for cross domain requests in Firefox 3
					try {
						for ( i in headers ) {
							xhr.setRequestHeader( i, headers[ i ] );
						}
					} catch( err ) {}

					// Do send the request
					// This may raise an exception which is actually
					// handled in jQuery.ajax (so no try/catch here)
					xhr.send( ( s.hasContent && s.data ) || null );

					// Listener
					callback = function( _, isAbort ) {
						var status, responseHeaders, statusText, responses;

						// Firefox throws exceptions when accessing properties
						// of an xhr when a network error occurred
						// http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)
						try {

							// Was never called and is aborted or complete
							if ( callback && ( isAbort || xhr.readyState === 4 ) ) {

								// Only called once
								callback = undefined;

								// Do not keep as active anymore
								if ( handle ) {
									xhr.onreadystatechange = jQuery.noop;
									if ( xhrOnUnloadAbort ) {
										delete xhrCallbacks[ handle ];
									}
								}

								// If it's an abort
								if ( isAbort ) {
									// Abort it manually if needed
									if ( xhr.readyState !== 4 ) {
										xhr.abort();
									}
								} else {
									responses = {};
									status = xhr.status;
									responseHeaders = xhr.getAllResponseHeaders();

									// When requesting binary data, IE6-9 will throw an exception
									// on any attempt to access responseText (#11426)
									if ( typeof xhr.responseText === "string" ) {
										responses.text = xhr.responseText;
									}

									// Firefox throws an exception when accessing
									// statusText for faulty cross-domain requests
									try {
										statusText = xhr.statusText;
									} catch( e ) {
										// We normalize with Webkit giving an empty statusText
										statusText = "";
									}

									// Filter status for non standard behaviors

									// If the request is local and we have data: assume a success
									// (success with no data won't get notified, that's the best we
									// can do given current implementations)
									if ( !status && s.isLocal && !s.crossDomain ) {
										status = responses.text ? 200 : 404;
									// IE - #1450: sometimes returns 1223 when it should be 204
									} else if ( status === 1223 ) {
										status = 204;
									}
								}
							}
						} catch( firefoxAccessException ) {
							if ( !isAbort ) {
								complete( -1, firefoxAccessException );
							}
						}

						// Call complete if needed
						if ( responses ) {
							complete( status, statusText, responses, responseHeaders );
						}
					};

					if ( !s.async ) {
						// if we're in sync mode we fire the callback
						callback();
					} else if ( xhr.readyState === 4 ) {
						// (IE6 & IE7) if it's in cache and has been
						// retrieved directly we need to fire the callback
						setTimeout( callback );
					} else {
						handle = ++xhrId;
						if ( xhrOnUnloadAbort ) {
							// Create the active xhrs callbacks list if needed
							// and attach the unload handler
							if ( !xhrCallbacks ) {
								xhrCallbacks = {};
								jQuery( window ).unload( xhrOnUnloadAbort );
							}
							// Add to list of active xhrs callbacks
							xhrCallbacks[ handle ] = callback;
						}
						xhr.onreadystatechange = callback;
					}
				},

				abort: function() {
					if ( callback ) {
						callback( undefined, true );
					}
				}
			};
		}
	});
}
var fxNow, timerId,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rfxnum = new RegExp( "^(?:([+-])=|)(" + core_pnum + ")([a-z%]*)$", "i" ),
	rrun = /queueHooks$/,
	animationPrefilters = [ defaultPrefilter ],
	tweeners = {
		"*": [function( prop, value ) {
			var end, unit,
				tween = this.createTween( prop, value ),
				parts = rfxnum.exec( value ),
				target = tween.cur(),
				start = +target || 0,
				scale = 1,
				maxIterations = 20;

			if ( parts ) {
				end = +parts[2];
				unit = parts[3] || ( jQuery.cssNumber[ prop ] ? "" : "px" );

				// We need to compute starting value
				if ( unit !== "px" && start ) {
					// Iteratively approximate from a nonzero starting point
					// Prefer the current property, because this process will be trivial if it uses the same units
					// Fallback to end or a simple constant
					start = jQuery.css( tween.elem, prop, true ) || end || 1;

					do {
						// If previous iteration zeroed out, double until we get *something*
						// Use a string for doubling factor so we don't accidentally see scale as unchanged below
						scale = scale || ".5";

						// Adjust and apply
						start = start / scale;
						jQuery.style( tween.elem, prop, start + unit );

					// Update scale, tolerating zero or NaN from tween.cur()
					// And breaking the loop if scale is unchanged or perfect, or if we've just had enough
					} while ( scale !== (scale = tween.cur() / target) && scale !== 1 && --maxIterations );
				}

				tween.unit = unit;
				tween.start = start;
				// If a +=/-= token was provided, we're doing a relative animation
				tween.end = parts[1] ? start + ( parts[1] + 1 ) * end : end;
			}
			return tween;
		}]
	};

// Animations created synchronously will run synchronously
function createFxNow() {
	setTimeout(function() {
		fxNow = undefined;
	});
	return ( fxNow = jQuery.now() );
}

function createTweens( animation, props ) {
	jQuery.each( props, function( prop, value ) {
		var collection = ( tweeners[ prop ] || [] ).concat( tweeners[ "*" ] ),
			index = 0,
			length = collection.length;
		for ( ; index < length; index++ ) {
			if ( collection[ index ].call( animation, prop, value ) ) {

				// we're done with this property
				return;
			}
		}
	});
}

function Animation( elem, properties, options ) {
	var result,
		stopped,
		index = 0,
		length = animationPrefilters.length,
		deferred = jQuery.Deferred().always( function() {
			// don't match elem in the :animated selector
			delete tick.elem;
		}),
		tick = function() {
			if ( stopped ) {
				return false;
			}
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),
				// archaic crash bug won't allow us to use 1 - ( 0.5 || 0 ) (#12497)
				temp = remaining / animation.duration || 0,
				percent = 1 - temp,
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length ; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ]);

			if ( percent < 1 && length ) {
				return remaining;
			} else {
				deferred.resolveWith( elem, [ animation ] );
				return false;
			}
		},
		animation = deferred.promise({
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, { specialEasing: {} }, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
						animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,
					// if we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;
				if ( stopped ) {
					return this;
				}
				stopped = true;
				for ( ; index < length ; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// resolve when we played the last frame
				// otherwise, reject
				if ( gotoEnd ) {
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		}),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length ; index++ ) {
		result = animationPrefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			return result;
		}
	}

	createTweens( animation, props );

	if ( jQuery.isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	jQuery.fx.timer(
		jQuery.extend( tick, {
			elem: elem,
			anim: animation,
			queue: animation.opts.queue
		})
	);

	// attach callbacks from options
	return animation.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );
}

function propFilter( props, specialEasing ) {
	var value, name, index, easing, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = jQuery.camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( jQuery.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// not quite $.extend, this wont overwrite keys already present.
			// also - reusing 'index' from above because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

jQuery.Animation = jQuery.extend( Animation, {

	tweener: function( props, callback ) {
		if ( jQuery.isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.split(" ");
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length ; index++ ) {
			prop = props[ index ];
			tweeners[ prop ] = tweeners[ prop ] || [];
			tweeners[ prop ].unshift( callback );
		}
	},

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			animationPrefilters.unshift( callback );
		} else {
			animationPrefilters.push( callback );
		}
	}
});

function defaultPrefilter( elem, props, opts ) {
	/*jshint validthis:true */
	var prop, index, length,
		value, dataShow, toggle,
		tween, hooks, oldfire,
		anim = this,
		style = elem.style,
		orig = {},
		handled = [],
		hidden = elem.nodeType && isHidden( elem );

	// handle queue: false promises
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always(function() {
			// doing this makes sure that the complete handler will be called
			// before this completes
			anim.always(function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			});
		});
	}

	// height/width overflow pass
	if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {
		// Make sure that nothing sneaks out
		// Record all 3 overflow attributes because IE does not
		// change the overflow attribute when overflowX and
		// overflowY are set to the same value
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Set display property to inline-block for height/width
		// animations on inline elements that are having width/height animated
		if ( jQuery.css( elem, "display" ) === "inline" &&
				jQuery.css( elem, "float" ) === "none" ) {

			// inline-level elements accept inline-block;
			// block-level elements need to be inline with layout
			if ( !jQuery.support.inlineBlockNeedsLayout || css_defaultDisplay( elem.nodeName ) === "inline" ) {
				style.display = "inline-block";

			} else {
				style.zoom = 1;
			}
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		if ( !jQuery.support.shrinkWrapBlocks ) {
			anim.always(function() {
				style.overflow = opts.overflow[ 0 ];
				style.overflowX = opts.overflow[ 1 ];
				style.overflowY = opts.overflow[ 2 ];
			});
		}
	}


	// show/hide pass
	for ( index in props ) {
		value = props[ index ];
		if ( rfxtypes.exec( value ) ) {
			delete props[ index ];
			toggle = toggle || value === "toggle";
			if ( value === ( hidden ? "hide" : "show" ) ) {
				continue;
			}
			handled.push( index );
		}
	}

	length = handled.length;
	if ( length ) {
		dataShow = jQuery._data( elem, "fxshow" ) || jQuery._data( elem, "fxshow", {} );
		if ( "hidden" in dataShow ) {
			hidden = dataShow.hidden;
		}

		// store state if its toggle - enables .stop().toggle() to "reverse"
		if ( toggle ) {
			dataShow.hidden = !hidden;
		}
		if ( hidden ) {
			jQuery( elem ).show();
		} else {
			anim.done(function() {
				jQuery( elem ).hide();
			});
		}
		anim.done(function() {
			var prop;
			jQuery._removeData( elem, "fxshow" );
			for ( prop in orig ) {
				jQuery.style( elem, prop, orig[ prop ] );
			}
		});
		for ( index = 0 ; index < length ; index++ ) {
			prop = handled[ index ];
			tween = anim.createTween( prop, hidden ? dataShow[ prop ] : 0 );
			orig[ prop ] = dataShow[ prop ] || jQuery.style( elem, prop );

			if ( !( prop in dataShow ) ) {
				dataShow[ prop ] = tween.start;
				if ( hidden ) {
					tween.end = tween.start;
					tween.start = prop === "width" || prop === "height" ? 1 : 0;
				}
			}
		}
	}
}

function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || "swing";
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			if ( tween.elem[ tween.prop ] != null &&
				(!tween.elem.style || tween.elem.style[ tween.prop ] == null) ) {
				return tween.elem[ tween.prop ];
			}

			// passing an empty string as a 3rd parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails
			// so, simple values such as "10px" are parsed to Float.
			// complex values such as "rotate(1rad)" are returned as is.
			result = jQuery.css( tween.elem, tween.prop, "" );
			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {
			// use step hook for back compat - use cssHook if its there - use .style if its
			// available and use plain properties where available
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.style && ( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null || jQuery.cssHooks[ tween.prop ] ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Remove in 2.0 - this supports IE8's panic based approach
// to setting things on disconnected nodes

Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.each([ "toggle", "show", "hide" ], function( i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
});

jQuery.fn.extend({
	fadeTo: function( speed, to, easing, callback ) {

		// show any hidden elements after setting opacity to 0
		return this.filter( isHidden ).css( "opacity", 0 ).show()

			// animate to the value specified
			.end().animate({ opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {
				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );
				doAnimation.finish = function() {
					anim.stop( true );
				};
				// Empty animations, or finishing resolves immediately
				if ( empty || jQuery._data( this, "finish" ) ) {
					anim.stop( true );
				}
			};
			doAnimation.finish = doAnimation;

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each(function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = jQuery._data( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && (type == null || timers[ index ].queue === type) ) {
					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// start the next in the queue if the last step wasn't forced
			// timers currently will call their complete callbacks, which will dequeue
			// but only if they were gotoEnd
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		});
	},
	finish: function( type ) {
		if ( type !== false ) {
			type = type || "fx";
		}
		return this.each(function() {
			var index,
				data = jQuery._data( this ),
				queue = data[ type + "queue" ],
				hooks = data[ type + "queueHooks" ],
				timers = jQuery.timers,
				length = queue ? queue.length : 0;

			// enable finishing flag on private data
			data.finish = true;

			// empty the queue first
			jQuery.queue( this, type, [] );

			if ( hooks && hooks.cur && hooks.cur.finish ) {
				hooks.cur.finish.call( this );
			}

			// look for any active animations, and finish them
			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
					timers[ index ].anim.stop( true );
					timers.splice( index, 1 );
				}
			}

			// look for any animations in the old queue and finish them
			for ( index = 0; index < length; index++ ) {
				if ( queue[ index ] && queue[ index ].finish ) {
					queue[ index ].finish.call( this );
				}
			}

			// turn off finishing flag
			delete data.finish;
		});
	}
});

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		attrs = { height: type },
		i = 0;

	// if we include width, step value is 1 to do all cssExpand values,
	// if we don't include width, step value is 2 to skip over Left and Right
	includeWidth = includeWidth? 1 : 0;
	for( ; i < 4 ; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

// Generate shortcuts for custom animations
jQuery.each({
	slideDown: genFx("show"),
	slideUp: genFx("hide"),
	slideToggle: genFx("toggle"),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
});

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			jQuery.isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
	};

	opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
		opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

	// normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( jQuery.isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p*Math.PI ) / 2;
	}
};

jQuery.timers = [];
jQuery.fx = Tween.prototype.init;
jQuery.fx.tick = function() {
	var timer,
		timers = jQuery.timers,
		i = 0;

	fxNow = jQuery.now();

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];
		// Checks the timer has not already been removed
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
	fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
	if ( timer() && jQuery.timers.push( timer ) ) {
		jQuery.fx.start();
	}
};

jQuery.fx.interval = 13;

jQuery.fx.start = function() {
	if ( !timerId ) {
		timerId = setInterval( jQuery.fx.tick, jQuery.fx.interval );
	}
};

jQuery.fx.stop = function() {
	clearInterval( timerId );
	timerId = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,
	// Default speed
	_default: 400
};

// Back Compat <1.8 extension point
jQuery.fx.step = {};

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.animated = function( elem ) {
		return jQuery.grep(jQuery.timers, function( fn ) {
			return elem === fn.elem;
		}).length;
	};
}
jQuery.fn.offset = function( options ) {
	if ( arguments.length ) {
		return options === undefined ?
			this :
			this.each(function( i ) {
				jQuery.offset.setOffset( this, options, i );
			});
	}

	var docElem, win,
		box = { top: 0, left: 0 },
		elem = this[ 0 ],
		doc = elem && elem.ownerDocument;

	if ( !doc ) {
		return;
	}

	docElem = doc.documentElement;

	// Make sure it's not a disconnected DOM node
	if ( !jQuery.contains( docElem, elem ) ) {
		return box;
	}

	// If we don't have gBCR, just use 0,0 rather than error
	// BlackBerry 5, iOS 3 (original iPhone)
	if ( typeof elem.getBoundingClientRect !== core_strundefined ) {
		box = elem.getBoundingClientRect();
	}
	win = getWindow( doc );
	return {
		top: box.top  + ( win.pageYOffset || docElem.scrollTop )  - ( docElem.clientTop  || 0 ),
		left: box.left + ( win.pageXOffset || docElem.scrollLeft ) - ( docElem.clientLeft || 0 )
	};
};

jQuery.offset = {

	setOffset: function( elem, options, i ) {
		var position = jQuery.css( elem, "position" );

		// set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		var curElem = jQuery( elem ),
			curOffset = curElem.offset(),
			curCSSTop = jQuery.css( elem, "top" ),
			curCSSLeft = jQuery.css( elem, "left" ),
			calculatePosition = ( position === "absolute" || position === "fixed" ) && jQuery.inArray("auto", [curCSSTop, curCSSLeft]) > -1,
			props = {}, curPosition = {}, curTop, curLeft;

		// need to be able to calculate position if either top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;
		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( jQuery.isFunction( options ) ) {
			options = options.call( elem, i, curOffset );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );
		} else {
			curElem.css( props );
		}
	}
};


jQuery.fn.extend({

	position: function() {
		if ( !this[ 0 ] ) {
			return;
		}

		var offsetParent, offset,
			parentOffset = { top: 0, left: 0 },
			elem = this[ 0 ];

		// fixed elements are offset from window (parentOffset = {top:0, left: 0}, because it is it's only offset parent
		if ( jQuery.css( elem, "position" ) === "fixed" ) {
			// we assume that getBoundingClientRect is available when computed position is fixed
			offset = elem.getBoundingClientRect();
		} else {
			// Get *real* offsetParent
			offsetParent = this.offsetParent();

			// Get correct offsets
			offset = this.offset();
			if ( !jQuery.nodeName( offsetParent[ 0 ], "html" ) ) {
				parentOffset = offsetParent.offset();
			}

			// Add offsetParent borders
			parentOffset.top  += jQuery.css( offsetParent[ 0 ], "borderTopWidth", true );
			parentOffset.left += jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true );
		}

		// Subtract parent offsets and element margins
		// note: when an element has margin: auto the offsetLeft and marginLeft
		// are the same in Safari causing offset.left to incorrectly be 0
		return {
			top:  offset.top  - parentOffset.top - jQuery.css( elem, "marginTop", true ),
			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true)
		};
	},

	offsetParent: function() {
		return this.map(function() {
			var offsetParent = this.offsetParent || document.documentElement;
			while ( offsetParent && ( !jQuery.nodeName( offsetParent, "html" ) && jQuery.css( offsetParent, "position") === "static" ) ) {
				offsetParent = offsetParent.offsetParent;
			}
			return offsetParent || document.documentElement;
		});
	}
});


// Create scrollLeft and scrollTop methods
jQuery.each( {scrollLeft: "pageXOffset", scrollTop: "pageYOffset"}, function( method, prop ) {
	var top = /Y/.test( prop );

	jQuery.fn[ method ] = function( val ) {
		return jQuery.access( this, function( elem, method, val ) {
			var win = getWindow( elem );

			if ( val === undefined ) {
				return win ? (prop in win) ? win[ prop ] :
					win.document.documentElement[ method ] :
					elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : jQuery( win ).scrollLeft(),
					top ? val : jQuery( win ).scrollTop()
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length, null );
	};
});

function getWindow( elem ) {
	return jQuery.isWindow( elem ) ?
		elem :
		elem.nodeType === 9 ?
			elem.defaultView || elem.parentWindow :
			false;
}
// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name }, function( defaultExtra, funcName ) {
		// margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return jQuery.access( this, function( elem, type, value ) {
				var doc;

				if ( jQuery.isWindow( elem ) ) {
					// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
					// isn't a whole lot we can do. See pull request at this URL for discussion:
					// https://github.com/jquery/jquery/pull/764
					return elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height], whichever is greatest
					// unfortunately, this causes bug #3838 in IE6/8 only, but there is currently no good, small way to fix it.
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?
					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable, null );
		};
	});
});
// Limit scope pollution from any deprecated API
// (function() {

// })();

// Expose for component
module.exports = jQuery;

// Expose jQuery to the global object
//window.jQuery = window.$ = jQuery;

// Expose jQuery as an AMD module, but only for AMD loaders that
// understand the issues with loading multiple versions of jQuery
// in a page that all might call define(). The loader will indicate
// they have special allowances for multiple jQuery versions by
// specifying define.amd.jQuery = true. Register as a named module,
// since jQuery can be concatenated with other files that may use define,
// but not use a proper concatenation script that understands anonymous
// AMD modules. A named AMD is safest and most robust way to register.
// Lowercase jquery is used because AMD module names are derived from
// file names, and jQuery is normally delivered in a lowercase file name.
// Do this after creating the global so that if an AMD module wants to call
// noConflict to hide this version of jQuery, it will work.
if ( typeof define === "function" && define.amd && define.amd.jQuery ) {
	define( "jquery", [], function () { return jQuery; } );
}

})( window );

});
require.register("component-autoscale-canvas/index.js", function(exports, require, module){

/**
 * Retina-enable the given `canvas`.
 *
 * @param {Canvas} canvas
 * @return {Canvas}
 * @api public
 */

module.exports = function(canvas){
  var ctx = canvas.getContext('2d');
  var ratio = window.devicePixelRatio || 1;
  if (1 != ratio) {
    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';
    canvas.width *= ratio;
    canvas.height *= ratio;
    ctx.scale(ratio, ratio);
  }
  return canvas;
};
});
require.register("component-color-picker/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var o = require('jquery')
  , Emitter = require('emitter')
  , autoscale = require('autoscale-canvas');

/**
 * Expose `ColorPicker`.
 */

module.exports = ColorPicker;

/**
 * RGB util.
 */

function rgb(r,g,b) {
  return 'rgb(' + r + ', ' + g + ', ' + b + ')';
}

/**
 * RGBA util.
 */

function rgba(r,g,b,a) {
  return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
}

/**
 * Mouse position util.
 */

function localPos(e) {
  var offset = o(e.target).offset();
  return {
    x: e.pageX - offset.left,
    y: e.pageY - offset.top
  };
}

/**
 * Initialize a new `ColorPicker`.
 *
 * Emits:
 *
 *    - `change` with the given color object
 *
 * @api public
 */

function ColorPicker() {
  this._colorPos = {};
  this.el = o(require('./template'));
  this.main = this.el.find('.main').get(0);
  this.spectrum = this.el.find('.spectrum').get(0);
  this.hue(rgb(255, 0, 0));
  this.spectrumEvents();
  this.mainEvents();
  this.w = 180;
  this.h = 180;
  this.render();
}

/**
 * Mixin Emitter.
 */

Emitter(ColorPicker.prototype);

/**
 * Set width / height to `n`.
 *
 * @param {Number} n
 * @return {ColorPicker} for chaining
 * @api public
 */

ColorPicker.prototype.size = function(n){
  return this
    .width(n)
    .height(n);
};

/**
 * Set width to `n`.
 *
 * @param {Number} n
 * @return {ColorPicker} for chaining
 * @api public
 */

ColorPicker.prototype.width = function(n){
  this.w = n;
  this.render();
  return this;
};

/**
 * Set height to `n`.
 *
 * @param {Number} n
 * @return {ColorPicker} for chaining
 * @api public
 */

ColorPicker.prototype.height = function(n){
  this.h = n;
  this.render();
  return this;
};

/**
 * Spectrum related events.
 *
 * @api private
 */

ColorPicker.prototype.spectrumEvents = function(){
  var self = this
    , canvas = o(this.spectrum)
    , down;

  function update(e) {
    var offsetY = localPos(e).y;
    var color = self.hueAt(offsetY - 4);
    self.hue(color.toString());
    self.emit('change', color);
    self._huePos = offsetY;
    self.render();
  }

  canvas.mousedown(function(e){
    e.preventDefault();
    down = true;
    update(e);
  });

  canvas.mousemove(function(e){
    if (down) update(e);
  });

  canvas.mouseup(function(){
    down = false;
  });
};

/**
 * Hue / lightness events.
 *
 * @api private
 */

ColorPicker.prototype.mainEvents = function(){
  var self = this
    , canvas = o(this.main)
    , down;

  function update(e) {
    var color;
    self._colorPos = localPos(e);
    color = self.colorAt(self._colorPos.x, self._colorPos.y);
    self.color(color.toString());
    self.emit('change', color);

    self.render();
  }

  canvas.mousedown(function(e){
    e.preventDefault();
    down = true;
    update(e);
  });

  canvas.mousemove(function(e){
    if (down) update(e);
  });

  canvas.mouseup(function(){
    down = false;
  });
};

/**
 * Get the RGB color at `(x, y)`.
 *
 * @param {Number} x
 * @param {Number} y
 * @return {Object}
 * @api private
 */

ColorPicker.prototype.colorAt = function(x, y){
  var data = this.main.getContext('2d').getImageData(x, y, 1, 1).data;
  return {
    r: data[0],
    g: data[1],
    b: data[2],
    toString: function(){
      return rgb(this.r, this.g, this.b);
    }
  };
};

/**
 * Get the RGB value at `y`.
 *
 * @param {Type} name
 * @return {Type}
 * @api private
 */

ColorPicker.prototype.hueAt = function(y){
  var data = this.spectrum.getContext('2d').getImageData(0, y, 1, 1).data;
  return {
    r: data[0],
    g: data[1],
    b: data[2],
    toString: function(){
      return rgb(this.r, this.g, this.b);
    }
  };
};

/**
 * Get or set `color`.
 *
 * @param {String} color
 * @return {String|ColorPicker}
 * @api public
 */

ColorPicker.prototype.color = function(color){
  // TODO: update pos
  // TODO: should update .hue() automatically...
  if (0 == arguments.length) return this._color;
  this._color = color;
  return this;
};

/**
 * Get or set hue `color`.
 *
 * @param {String} color
 * @return {String|ColorPicker}
 * @api public
 */

ColorPicker.prototype.hue = function(color){
  // TODO: update pos
  if (0 == arguments.length) return this._hue;
  this._hue = color;
  return this;
};

/**
 * Render with the given `options`.
 *
 * @param {Object} options
 * @api public
 */

ColorPicker.prototype.render = function(options){
  options = options || {};
  this.renderMain(options);
  this.renderSpectrum(options);
};

/**
 * Render spectrum.
 *
 * @api private
 */

ColorPicker.prototype.renderSpectrum = function(options){
  var el = this.el
    , canvas = this.spectrum
    , ctx = canvas.getContext('2d')
    , pos = this._huePos
    , w = this.w * .12
    , h = this.h;

  canvas.width = w;
  canvas.height = h;
  autoscale(canvas);

  var grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, rgb(255, 0, 0));
  grad.addColorStop(.15, rgb(255, 0, 255));
  grad.addColorStop(.33, rgb(0, 0, 255));
  grad.addColorStop(.49, rgb(0, 255, 255));
  grad.addColorStop(.67, rgb(0, 255, 0));
  grad.addColorStop(.84, rgb(255, 255, 0));
  grad.addColorStop(1, rgb(255, 0, 0));

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // pos
  if (!pos) return;
  ctx.fillStyle = rgba(0,0,0, .5);
  ctx.fillRect(0, pos, w, 1);
  ctx.fillStyle = rgba(255,255,255, .7);
  ctx.fillRect(0, pos + 1, w, 1);
};

/**
 * Render hue/luminosity canvas.
 *
 * @api private
 */

ColorPicker.prototype.renderMain = function(options){
  var el = this.el
    , canvas = this.main
    , ctx = canvas.getContext('2d')
    , w = this.w
    , h = this.h
    , x = (this._colorPos.x || w) + .5
    , y = (this._colorPos.y || 0) + .5;

  canvas.width = w;
  canvas.height = h;
  autoscale(canvas);

  var grad = ctx.createLinearGradient(0, 0, w, 0);
  grad.addColorStop(0, rgb(255, 255, 255));
  grad.addColorStop(1, this._hue);

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, rgba(255, 255, 255, 0));
  grad.addColorStop(1, rgba(0, 0, 0, 1));

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // pos
  var rad = 10;
  ctx.save();
  ctx.beginPath();
  ctx.lineWidth = 1;

  // outer dark
  ctx.strokeStyle = rgba(0,0,0,.5);
  ctx.arc(x, y, rad / 2, 0, Math.PI * 2, false);
  ctx.stroke();

  // outer light
  ctx.strokeStyle = rgba(255,255,255,.5);
  ctx.arc(x, y, rad / 2 - 1, 0, Math.PI * 2, false);
  ctx.stroke();

  ctx.beginPath();
  ctx.restore();
};
});
require.register("component-color-picker/template.js", function(exports, require, module){
module.exports = '<div class="color-picker">\n  <canvas class="main"></canvas>\n  <canvas class="spectrum"></canvas>\n</div>';
});
require.register("datomicism/index.js", function(exports, require, module){
module.exports = require("./lib/datomicism.js");
});
require.register("datomicism/lib/datomic-codemirror.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.1

/*
Author: Shaun Gilchrist
Branched from Hans Engel's Clojure mode
*/


(function() {

  CodeMirror.defineMode("datomic", function(config, mode) {
    var ATOM, BRACKET, BUILTIN, COMMENT, INDENT_WORD_SKIP, KEYWORD, KEYWORDS_SKIP, NUMBER, STRING, SYMBOL, TAG, atoms, builtins, hooks, indentKeys, isNumber, keywords, makeKeywords, popStack, pushStack, stateStack, tests;
    hooks = config.mode.hooks || {};
    makeKeywords = function(str) {
      var i, obj, words;
      obj = {};
      words = str.split(" ");
      i = 0;
      while (i < words.length) {
        obj[words[i]] = true;
        ++i;
      }
      return obj;
    };
    stateStack = function(indent, type, prev) {
      this.indent = indent;
      this.type = type;
      return this.prev = prev;
    };
    pushStack = function(state, indent, type) {
      return state.indentStack = new stateStack(indent, type, state.indentStack);
    };
    popStack = function(state) {
      return state.indentStack = state.indentStack.prev;
    };
    isNumber = function(ch, stream) {
      if (ch === "0" && stream.eat(/x/i)) {
        stream.eatWhile(tests.hex);
        return true;
      }
      if ((ch === "+" || ch === "-") && (tests.digit.test(stream.peek()))) {
        stream.eat(tests.sign);
        ch = stream.next();
      }
      if (tests.digit.test(ch)) {
        stream.eat(ch);
        stream.eatWhile(tests.digit);
        if ("." === stream.peek()) {
          stream.eat(".");
          stream.eatWhile(tests.digit);
        }
        if (stream.eat(tests.exponent)) {
          stream.eat(tests.sign);
          stream.eatWhile(tests.digit);
        }
        return true;
      }
      return false;
    };
    BUILTIN = "builtin";
    COMMENT = "comment";
    STRING = "string";
    TAG = "tag";
    ATOM = "atom";
    NUMBER = "number";
    BRACKET = "bracket";
    KEYWORD = "keyword";
    SYMBOL = "symbol";
    INDENT_WORD_SKIP = 2;
    KEYWORDS_SKIP = 1;
    atoms = makeKeywords("true false nil");
    keywords = makeKeywords("defn defn- def def- defonce defmulti defmethod defmacro defstruct deftype defprotocol defrecord defproject deftest slice defalias defhinted defmacro- defn-memo defnk defnk defonce- defunbound defunbound- defvar defvar- let letfn do case cond condp for loop recur when when-not when-let when-first if if-let if-not . .. -> ->> doto and or dosync doseq dotimes dorun doall load import unimport ns in-ns refer try catch finally throw with-open with-local-vars binding gen-class gen-and-load-class gen-and-save-class handler-case handle");
    builtins = makeKeywords("* *1 *2 *3 *agent* *allow-unresolved-vars* *assert *clojure-version* *command-line-args* *compile-files* *compile-path* *e *err* *file* *flush-on-newline* *in* *macro-meta* *math-context* *ns* *out* *print-dup* *print-length* *print-level* *print-meta* *print-readably* *read-eval* *source-path* *use-context-classloader* *warn-on-reflection* + - / < <= = == > >= accessor aclone agent agent-errors aget alength alias all-ns alter alter-meta! alter-var-root amap ancestors and apply areduce array-map aset aset-boolean aset-byte aset-char aset-double aset-float aset-int aset-long aset-short assert assoc assoc! assoc-in associative? atom await await-for await1 bases bean bigdec bigint binding bit-and bit-and-not bit-clear bit-flip bit-not bit-or bit-set bit-shift-left bit-shift-right bit-test bit-xor boolean boolean-array booleans bound-fn bound-fn* butlast byte byte-array bytes case cast char char-array char-escape-string char-name-string char? chars chunk chunk-append chunk-buffer chunk-cons chunk-first chunk-next chunk-rest chunked-seq? class class? clear-agent-errors clojure-version coll? comment commute comp comparator compare compare-and-set! compile complement concat cond condp conj conj! cons constantly construct-proxy contains? count counted? create-ns create-struct cycle dec decimal? declare definline defmacro defmethod defmulti defn defn- defonce defstruct delay delay? deliver deref derive descendants destructure disj disj! dissoc dissoc! distinct distinct? doall doc dorun doseq dosync dotimes doto double double-array doubles drop drop-last drop-while empty empty? ensure enumeration-seq eval even? every? extend extend-protocol extend-type extends? extenders false? ffirst file-seq filter find find-doc find-ns find-var first float float-array float? floats flush fn fn? fnext for force format future future-call future-cancel future-cancelled? future-done? future? gen-class gen-interface gensym get get-in get-method get-proxy-class get-thread-bindings get-validator hash hash-map hash-set identical? identity if-let if-not ifn? import in-ns inc init-proxy instance? int int-array integer? interleave intern interpose into into-array ints io! isa? iterate iterator-seq juxt key keys keyword keyword? last lazy-cat lazy-seq let letfn line-seq list list* list? load load-file load-reader load-string loaded-libs locking long long-array longs loop macroexpand macroexpand-1 make-array make-hierarchy map map? mapcat max max-key memfn memoize merge merge-with meta method-sig methods min min-key mod name namespace neg? newline next nfirst nil? nnext not not-any? not-empty not-every? not= ns ns-aliases ns-imports ns-interns ns-map ns-name ns-publics ns-refers ns-resolve ns-unalias ns-unmap nth nthnext num number? odd? or parents partial partition pcalls peek persistent! pmap pop pop! pop-thread-bindings pos? pr pr-str prefer-method prefers primitives-classnames print print-ctor print-doc print-dup print-method print-namespace-doc print-simple print-special-doc print-str printf println println-str prn prn-str promise proxy proxy-call-with-super proxy-mappings proxy-name proxy-super push-thread-bindings pvalues quot rand rand-int range ratio? rational? rationalize re-find re-groups re-matcher re-matches re-pattern re-seq read read-line read-string reify reduce ref ref-history-count ref-max-history ref-min-history ref-set refer refer-clojure release-pending-sends rem remove remove-method remove-ns repeat repeatedly replace replicate require reset! reset-meta! resolve rest resultset-seq reverse reversible? rseq rsubseq satisfies? second select-keys send send-off seq seq? seque sequence sequential? set set-validator! set? short short-array shorts shutdown-agents slurp some sort sort-by sorted-map sorted-map-by sorted-set sorted-set-by sorted? special-form-anchor special-symbol? split-at split-with str stream? string? struct struct-map subs subseq subvec supers swap! symbol symbol? sync syntax-symbol-anchor take take-last take-nth take-while test the-ns time to-array to-array-2d trampoline transient tree-seq true? type unchecked-add unchecked-dec unchecked-divide unchecked-inc unchecked-multiply unchecked-negate unchecked-remainder unchecked-subtract underive unquote unquote-splicing update-in update-proxy use val vals var-get var-set var? vary-meta vec vector vector? when when-first when-let when-not while with-bindings with-bindings* with-in-str with-loading-context with-local-vars with-meta with-open with-out-str with-precision xml-seq");
    indentKeys = makeKeywords("ns fn def defn defmethod bound-fn if if-not case condp when while when-not when-first do future comment doto locking proxy with-open with-precision reify deftype defrecord defprotocol extend extend-protocol extend-type try catch " + "let letfn binding loop for doseq dotimes when-let if-let " + "defstruct struct-map assoc " + "testing deftest " + "handler-case handle dotrace deftrace");
    tests = {
      digit: /\d/,
      digit_or_colon: /[\d:]/,
      hex: /[0-9a-f]/i,
      sign: /[+-]/,
      exponent: /e/i,
      keyword_char: /[^\s\(\[\;\)\]]/,
      basic: /[\w\$_\-]/,
      lang_keyword: /[\w*+!\-_?:\/\.]/
    };
    return {
      startState: function() {
        return {
          indentStack: null,
          indentation: 0,
          mode: false
        };
      },
      token: function(stream, state) {
        var ch, escaped, indentTemp, keyWord, letter, next, returnType;
        if ((state.indentStack == null) && stream.sol()) {
          state.indentation = stream.indentation();
        }
        if (stream.eatSpace()) {
          return null;
        }
        returnType = null;
        switch (state.mode) {
          case "string":
            next = void 0;
            escaped = false;
            while ((next = stream.next()) != null) {
              if (next === "\"" && !escaped) {
                state.mode = false;
                break;
              }
              escaped = !escaped && next === "\\";
            }
            returnType = STRING;
            break;
          default:
            ch = stream.next();
            if (ch === "\"") {
              state.mode = "string";
              returnType = STRING;
            } else if (ch === "'" && !(tests.digit_or_colon.test(stream.peek()))) {
              returnType = ATOM;
            } else if (ch === ";") {
              stream.skipToEnd();
              returnType = COMMENT;
            } else if (isNumber(ch, stream)) {
              returnType = NUMBER;
            } else if (ch === "(" || ch === "[") {
              keyWord = "";
              indentTemp = stream.column();
              letter = void 0;
              /*
              Either
              (indent-word ..
              (non-indent-word ..
              (;something else, bracket, etc.
              */

              if (ch === "(") {
                while ((letter = stream.eat(tests.keyword_char)) != null) {
                  keyWord += letter;
                }
              }
              if (keyWord.length > 0 && (indentKeys.propertyIsEnumerable(keyWord) || /^(?:def|with)/.test(keyWord))) {
                pushStack(state, indentTemp + INDENT_WORD_SKIP, ch);
              } else {
                stream.eatSpace();
                if (stream.eol() || stream.peek() === ";") {
                  pushStack(state, indentTemp + 1, ch);
                } else {
                  pushStack(state, indentTemp + stream.current().length, ch);
                }
              }
              stream.backUp(stream.current().length - 1);
              returnType = BRACKET;
            } else if (ch === ")" || ch === "]") {
              returnType = BRACKET;
              if ((state.indentStack != null) && state.indentStack.type === (ch === ")" ? "(" : "[")) {
                popStack(state);
              }
            } else if (ch === ":") {
              stream.eatWhile(tests.lang_keyword);
              return ATOM + ((typeof hooks[":"] === "function" ? hooks[":"](stream.current()) : void 0) || "");
            } else if (ch === "?") {
              stream.eatWhile(tests.basic);
              return SYMBOL + ((typeof hooks["?"] === "function" ? hooks["?"](stream.current()) : void 0) || "");
            } else {
              stream.eatWhile(tests.basic);
              if (keywords && keywords.propertyIsEnumerable(stream.current())) {
                returnType = KEYWORD;
              } else if (builtins && builtins.propertyIsEnumerable(stream.current())) {
                returnType = BUILTIN;
              } else if (atoms && atoms.propertyIsEnumerable(stream.current())) {
                returnType = ATOM;
              } else {
                returnType = null;
              }
            }
        }
        return returnType;
      },
      indent: function(state, textAfter) {
        if (state.indentStack == null) {
          return state.indentation;
        }
        return state.indentStack.indent;
      }
    };
  });

  CodeMirror.defineMIME("text/x-clojure", "datomic");

}).call(this);

});
require.register("datomicism/lib/datomicism.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.1
(function() {
  var Browser, BrowserView, CartographicSurface, Comment, Connection, Datom, DatomView, Emitter, Entity, EntityView, Explorer, Namespace, NamespaceView, Schema, WidgetClasses, WidgetOrder, WidgetTips, bling, comboInput, dbCombo, guid, kosherName, labelPair, textInput, _, _ref, _ref1;

  require("./String");

  require("./datomic-codemirror");

  _ = require("underscore");

  window.edn = require("jsedn");

  Emitter = require("emitter");

  window.Storage = require("./Storage");

  bling = require("bling");

  guid = require("./guid");

  kosherName = require("./kosherName");

  dbCombo = require("./dbCombo");

  Connection = require("./Connection");

  Explorer = require("./Explorer");

  CartographicSurface = require("CartographicSurface");

  Comment = require("./Comment");

  Schema = require("./Schema").Schema;

  _ref = WidgetClasses = require("./widgets"), Namespace = _ref.Namespace, NamespaceView = _ref.NamespaceView, Entity = _ref.Entity, EntityView = _ref.EntityView, Browser = _ref.Browser, BrowserView = _ref.BrowserView, Datom = _ref.Datom, DatomView = _ref.DatomView, WidgetTips = _ref.Tips, WidgetOrder = _ref.Order;

  _ref1 = require("./Input"), labelPair = _ref1.labelPair, comboInput = _ref1.comboInput, textInput = _ref1.textInput;

  window.DatomicIsm = {
    fetchEntity: function(entityId, e) {
      return DatomicIsm.addWidget(Entity, EntityView, {
        left: e.pageX,
        top: e.pageY
      }, void 0, {
        searchBy: "byId",
        byId: entityId
      });
    },
    fetchBrowser: function(paths, e) {
      return DatomicIsm.addWidget(Browser, BrowserView, {
        left: e.pageX,
        top: e.pageY
      }, void 0, paths);
    },
    fetchDatom: function(entityId, attribute, e) {
      return DatomicIsm.addWidget(Datom, DatomView, {
        left: e.pageX,
        top: e.pageY
      }, void 0, {
        entityId: entityId,
        attribute: attribute
      });
    },
    addAttribute: function(kw, data) {
      var attribute, attributeName, namespace, namespaceName, useNamespace, view, _i, _j, _len, _len1, _ref2, _ref3, _ref4;
      if (data == null) {
        data = {
          type: ":db.type/string"
        };
      }
      _ref2 = kw.slice(1).split("/"), namespaceName = _ref2[0], attributeName = _ref2[1];
      useNamespace = false;
      _ref3 = DatomicIsm.namespaces;
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        namespace = _ref3[_i];
        if (namespace.get("name") === namespaceName) {
          useNamespace = namespace;
        }
      }
      if (!useNamespace) {
        useNamespace = new Namespace({
          name: namespaceName
        });
        DatomicIsm.namespaces.push(useNamespace);
        DatomicIsm.views[useNamespace.id] = view = new NamespaceView(useNamespace);
        view.$el.appendTo("body");
      } else {
        view = DatomicIsm.views[useNamespace.id];
        _ref4 = useNamespace.attributes;
        for (_j = 0, _len1 = _ref4.length; _j < _len1; _j++) {
          attribute = _ref4[_j];
          if (attribute.get("name") === attributeName) {
            return;
          }
        }
      }
      data.name = attributeName;
      view.addAttribute(data);
      DatomicIsm.refreshQueries();
      if (view) {
        view.$el.css({
          position: "absolute"
        });
      }
      return view;
    },
    drawToolbar: function() {
      var $win, connectButton, self, stopHandler, widget, _fn, _i, _len,
        _this = this;
      self = this;
      this.toolbar = (bling("ul", {
        "class": "toolbar"
      })).appendTo("body");
      bling(".Logo img, .LogoText", {
        appendTo: this.toolbar,
        onCreate: function() {
          this.img.prop({
            src: "/img/logo.png"
          });
          this.LogoText.text("Datomicism");
          return this.Logo.on({
            mouseenter: function() {
              return $(this).find(".LogoText").animate({
                bottom: 0
              }, "fast");
            },
            mouseleave: function() {
              return $(this).find(".LogoText").animate({
                bottom: -14
              }, "fast");
            },
            click: function() {
              return window.open("http://github.com/shaunxcode/datomicism");
            }
          });
        }
      });
      $win = $(window);
      stopHandler = function(modelClass, viewClass) {
        return function(e, ui) {
          var added, pos, _base;
          pos = {
            left: ui.position.left + $win.scrollLeft(),
            top: ui.position.top + $win.scrollTop()
          };
          added = self.addWidget(modelClass, viewClass, pos);
          return typeof (_base = added.view).postDrop === "function" ? _base.postDrop() : void 0;
        };
      };
      _fn = function(widget) {
        return bling("li a, img", function() {
          self.toolbar.append(this.li);
          this.img.prop({
            src: "/img/draggable.png"
          });
          this.a.text(widget);
          return this.a.prop({
            title: WidgetTips[widget]
          });
        }).draggable({
          helper: "clone",
          stop: stopHandler(WidgetClasses[widget], WidgetClasses["" + widget + "View"])
        });
      };
      for (_i = 0, _len = WidgetOrder.length; _i < _len; _i++) {
        widget = WidgetOrder[_i];
        _fn(widget);
      }
      connectButton = bling("button.connect", {
        text: "connect"
      }).appendTo(this.toolbar).on({
        click: function() {
          var buttons, comboPlaceholder, drawDbOptions, modal;
          if ($(".connectModal").length) {
            return;
          }
          drawDbOptions = function() {
            var host, port, proto, _ref2, _ref3, _ref4;
            if (((_ref2 = (proto = self.connection.get("protocol"))) != null ? _ref2.length : void 0) && ((_ref3 = (host = self.connection.get("host"))) != null ? _ref3.length : void 0) && ((_ref4 = (port = self.connection.get("port"))) != null ? _ref4.length : void 0)) {
              return self.connection.connect(function() {
                var combo;
                comboPlaceholder.html(combo = dbCombo(self.connection, "db-alias"));
                return combo.on("changedValue", function(evt, val) {
                  var alias, db, _ref5;
                  _ref5 = (edn.parse(val)).at(":db/alias").split("/"), alias = _ref5[0], db = _ref5[1];
                  self.connection.set("db", db);
                  self.connection.set("alias", alias);
                  return buttons.$ok.prop("disabled", false);
                });
              });
            }
          };
          modal = bling(".connectModal.modal", function() {
            var field, input, _j, _len1, _ref2, _results;
            this.modal.append(input = comboInput({
              http: "http",
              https: "https"
            }, self.connection, "protocol"));
            input.on("change", drawDbOptions);
            this.modal.bappend("span", {
              text: "://"
            });
            _ref2 = ["host", "port"];
            _results = [];
            for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
              field = _ref2[_j];
              this.modal.append(input = textInput(self.connection, field));
              input.addClass("Input-" + field);
              input.on("changedValue", drawDbOptions);
              _results.push(this.modal.bappend("span", {
                text: field === "host" ? ":" : "/"
              }));
            }
            return _results;
          });
          modal.append(comboPlaceholder = bling(".dbComboHolder"));
          modal.bappend("button.@ok", {
            self: buttons = {}
          }, function() {
            return this.ok.prop("disabled", true).text("OK").on({
              click: function() {
                Storage.set("connection", self.connection.data);
                return self.connection.connect(function() {
                  return modal.remove();
                });
              }
            });
          });
          drawDbOptions();
          modal.addClass("connection");
          return modal.appendTo("body");
        }
      });
      self.connection.on("connected", function() {
        return connectButton.text("connection [connected]");
      });
      return self.connection.on("disconnected", function() {
        return connectButton.text("connect [disconnected]");
      });
    },
    addWidget: function(modelClass, viewClass, pos, id, data) {
      var model, view, _ref2;
      if (data == null) {
        data = {};
      }
      id || (id = "widget" + (guid()));
      model = new modelClass(data);
      view = new viewClass(model, id);
      view.$el.appendTo("body");
      pos.position = "absolute";
      view.$el.css(pos);
      if (typeof view.saveState === "function") {
        view.saveState();
      }
      if (typeof view.postAppend === "function") {
        view.postAppend();
      }
      view.raiseToTop();
      if ((_ref2 = view.$name) != null) {
        _ref2.focus();
      }
      if (typeof view.sizeTitleBar === "function") {
        view.sizeTitleBar();
      }
      this.map.drawNodes();
      this.explorer.drawNodes();
      return {
        model: model,
        view: view
      };
    },
    schemaHint: function() {
      return console.log(arguments);
    },
    init: function() {
      var added, connectionData, m, modelClass, oldAppend, pos, viewClass, wid, widget, _fn, _i, _len, _ref2, _ref3,
        _this = this;
      oldAppend = $.fn.append;
      $.fn.append = function() {
        return oldAppend.apply(this, arguments).trigger("append");
      };
      $.fn.cloak = function() {
        return $(this).css({
          visibility: "hidden"
        });
      };
      $.fn.uncloak = function() {
        return $(this).css({
          visibility: "visible"
        });
      };
      $.fn.toCenter = function() {
        var el;
        el = $(this);
        return el.css({
          left: ($(window).width() / 2) - (el.outerWidth() / 2),
          top: ($(window).height() / 2) - (el.outerHeight() / 2)
        });
      };
      _ref2 = ["before", "after", "append", "prepend"];
      _fn = function(m) {
        return $.fn["b" + m] = function() {
          return this[m](bling.apply({}, arguments));
        };
      };
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        m = _ref2[_i];
        _fn(m);
      }
      window.markdown = new Showdown.converter;
      edn.setTokenAction("keyword", function(token) {
        return token;
      });
      edn.setEncodeHandler("comment", (function(obj) {
        return obj instanceof Comment;
      }), function(obj) {
        return obj.ednEncode();
      });
      edn.setEncodeAction("object", function(obj) {
        var i, k, line, lines, max, result, v;
        result = [];
        max = _.size(obj) - 1;
        i = 0;
        for (k in obj) {
          v = obj[k];
          result.push(edn.encode(":" + k));
          result.push("" + (edn.encode(v)) + (i === max ? "" : "\n"));
          i++;
        }
        lines = ("\n{" + (result.join(" ")) + "}").split("\n");
        return ((function() {
          var _j, _len1, _results;
          _results = [];
          for (_j = 0, _len1 = lines.length; _j < _len1; _j++) {
            line = lines[_j];
            _results.push(" " + line);
          }
          return _results;
        })()).join("\n") + "\n";
      });
      CodeMirror.commands.autocomplete = function(cm) {
        return CodeMirror.simpleHint(cm, DatomicIsm.schemaHint);
      };
      this.bus = new Emitter;
      this.map = new CartographicSurface({
        surface: "body",
        selector: ".widget",
        scale: 0.08
      });
      this.map.render().$el.appendTo("body");
      this.explorer = new Explorer({
        surface: "body",
        selector: ".widget"
      });
      this.explorer.render().$el.appendTo("body");
      connectionData = Storage.get("connection", {});
      this.connection = new Connection(connectionData);
      this.schema = new Schema;
      this.connection.on("connected", function() {
        return _this.schema.refresh();
      });
      if (_.size(connectionData)) {
        this.connection.connect();
      } else {
        Storage.set("widgets", {
          defaultNote: {
            width: 380,
            height: 250,
            left: 42,
            top: 66,
            "class": "Note",
            data: {
              widgetName: null,
              ":db/id": null,
              note: "#Welcome to datomicism!\nTo get started: click connect at the top right and enter your protocol/host/port and choose your database. Once you have a connection try dragging down a Browser or any other widget and start exploring! If you need help submit an [issue on github](http://github.com/shaunxcode/datomicism/issues) or email me directly [shaunxcode@gmail.com](mailto://shaunxcode@gmail.com)\n\n Also: make sure you have started your rest service with -o set to the host you are attempting to use datomicism from."
            }
          }
        });
      }
      this.views = {};
      this.drawToolbar();
      _ref3 = Storage.get("widgets", {});
      for (wid in _ref3) {
        widget = _ref3[wid];
        modelClass = WidgetClasses[widget["class"]];
        viewClass = WidgetClasses[widget["class"] + "View"];
        pos = {
          left: widget.left,
          top: widget.top,
          width: widget.width,
          height: widget.height
        };
        added = this.addWidget(modelClass, viewClass, pos, wid, widget.data);
        added.view.$el.trigger("mouseleave");
      }
      this.map.drawNodes();
      this.explorer.drawNodes();
      $(window).scrollTop(100).scrollTop(0);
      $("body").on({
        mouseenter: function() {
          return $(".entity-" + (kosherName($(this).text()))).addClass("lit");
        },
        mouseleave: function() {
          return $(".entity").removeClass("lit");
        }
      }, ".idlink");
      return $(document).on({
        keydown: function(e) {
          var _ref4;
          if ((_ref4 = e.keyCode) === $.ui.keyCode.LEFT || _ref4 === $.ui.keyCode.RIGHT || _ref4 === $.ui.keyCode.UP || _ref4 === $.ui.keyCode.DOWN) {
            return e.preventDefault();
          }
        }
      });
    }
  };

  module.exports = DatomicIsm;

}).call(this);

});
require.register("datomicism/lib/datomicTypes.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.1
(function() {

  module.exports = {
    types: {
      ":db.type/keyword": "keyword",
      ":db.type/string": "string",
      ":db.type/boolean": "boolean",
      ":db.type/long": "long",
      ":db.type/bigint": "bigint",
      ":db.type/float": "float",
      ":db.type/double": "double",
      ":db.type/bigdec": "bigdec",
      ":db.type/ref": "ref",
      ":db.type/instant": "instant",
      ":db.type/uuid": "uuid",
      ":db.type/uri": "uri",
      ":db.type/bytes": "bytes"
    },
    uniqueTypes: {
      "nil": "no",
      ":db.unique/value": "value",
      ":db.unique/identity": "identity"
    },
    cardinalityTypes: {
      ":db.cardinality/one": 1,
      ":db.cardinality/many": "n"
    }
  };

}).call(this);

});
require.register("datomicism/lib/ednRegex.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.1
(function() {

  module.exports = {
    floatStart: /^[\+\-]?[0-9]*[.]?$/,
    float: /^[\+\-]?[0-9]*[.][0-9]+$/,
    keyword: /^[\:][A-Za-z\-\_\+\#\!\.\=\|\>\<\?\*\&\/]*$/
  };

}).call(this);

});
require.register("datomicism/lib/guid.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.1
(function() {
  var S4;

  S4 = function() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };

  module.exports = function() {
    return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
  };

}).call(this);

});
require.register("datomicism/lib/Input.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.1
(function() {
  var bling, cardinalityTypes, checkbox, comboInput, keyHandler, labelPair, nameInput, oneOrManyToggle, textAreaInput, textInput, textarea, typeCombo, types, uniqueCombo, uniqueTypes, _ref;

  bling = require("bling");

  _ref = require("./datomicTypes"), types = _ref.types, uniqueTypes = _ref.uniqueTypes, cardinalityTypes = _ref.cardinalityTypes;

  keyHandler = function(keyMap) {
    return function(e) {
      var handler, key, _results;
      _results = [];
      for (key in keyMap) {
        handler = keyMap[key];
        if (e.keyCode === $.ui.keyCode[key]) {
          handler(e);
          break;
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };
  };

  textInput = function(model, field, validator, tag) {
    var curVal, self;
    if (tag == null) {
      tag = "input";
    }
    curVal = model.get(field);
    self = tag.$tag({
      "class": "textInput",
      value: curVal || "",
      placeholder: field
    }).on({
      blur: function(e) {
        var val;
        val = self.val().trim();
        model.set(field, val);
        return self.trigger("changedValue", self.val());
      },
      keyup: function(e) {
        return typeof validator === "function" ? validator(e, self) : void 0;
      }
    });
    if (model.get(":db/id")) {
      self.attr("disabled", true);
    }
    return self;
  };

  textAreaInput = function(model, field, validator) {
    return textInput(model, field, validator, "textarea");
  };

  nameInput = function(model, field) {
    var validator;
    validator = function(e, input) {
      if (e.keyCode === $.ui.keyCode.SPACE) {
        return input.val(input.val().replace(/\s/g, "_"));
      }
    };
    return textInput(model, field, validator).addClass("nameInput");
  };

  comboInput = function(options, model, field) {
    var optionTags, self, val, vis;
    optionTags = (function() {
      var _results;
      _results = [];
      for (val in options) {
        vis = options[val];
        _results.push("option".$tag({
          value: val,
          text: vis
        }));
      }
      return _results;
    })();
    self = "select".$tag({
      "class": "comboInput",
      html: optionTags
    }).on({
      change: function() {
        return model.set(field, $(this).val());
      }
    });
    if (model.get(field)) {
      self.val(model.get(field));
    } else {
      self.trigger("change");
    }
    return self;
  };

  typeCombo = function(model, field) {
    return (comboInput(types, model, field)).addClass("typeCombo");
  };

  uniqueCombo = function(model, field) {
    var options, self, val, vis;
    options = (function() {
      var _results;
      _results = [];
      for (val in uniqueTypes) {
        vis = uniqueTypes[val];
        _results.push("option".$tag({
          value: val,
          text: vis
        }));
      }
      return _results;
    })();
    self = "select".$tag({
      "class": "uniqueCombo",
      html: options
    }).on({
      change: function() {
        return model.set(field, self.val());
      }
    });
    if (model.get(field)) {
      self.val(model.get(field));
    }
    if (model.get(":db/id")) {
      self.attr("disabled", true);
    }
    return self;
  };

  checkbox = function(model, field) {
    var self;
    self = ("input".$tag({
      type: "checkbox"
    })).on({
      change: function() {
        return model.set(field, self.is(":checked"));
      }
    });
    if (model.get(field, false)) {
      self.attr("checked", true);
    }
    if (model.get(":db/id")) {
      self.attr("disabled", true);
    }
    return self;
  };

  textarea = function(model, field) {
    return bling("textarea", {
      value: model.get(field, "")
    });
  };

  labelPair = function(label, control) {
    return bling("div label." + label, function() {
      this.label.text("" + label + ":");
      return this.div.append(control);
    });
  };

  oneOrManyToggle = function(model, field) {
    var many, one, self, state;
    one = ":db.cardinality/one";
    many = ":db.cardinality/many";
    state = model.get(field, one);
    return self = "div".$tag({
      "class": "oneOrManyToggle",
      html: cardinalityTypes[state]
    }).on({
      click: function() {
        state = state === one ? many : one;
        self.text(cardinalityTypes[state]);
        return model.set(field, state);
      }
    });
  };

  module.exports = {
    keyHandler: keyHandler,
    textInput: textInput,
    textAreaInput: textAreaInput,
    nameInput: nameInput,
    comboInput: comboInput,
    typeCombo: typeCombo,
    uniqueCombo: uniqueCombo,
    checkbox: checkbox,
    textarea: textarea,
    labelPair: labelPair,
    oneOrManyToggle: oneOrManyToggle
  };

}).call(this);

});
require.register("datomicism/lib/kosherName.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.1
(function() {

  module.exports = function(name) {
    if (name == null) {
      name = "";
    }
    return name.replace(/[\?\-\:\/\.]/g, "_");
  };

}).call(this);

});
require.register("datomicism/lib/Connection.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.1
(function() {
  var Connection,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Connection = (function(_super) {

    __extends(Connection, _super);

    function Connection() {
      return Connection.__super__.constructor.apply(this, arguments);
    }

    Connection.prototype.url = function(path) {
      return "" + this.data.protocol + "://" + this.data.host + ":" + this.data.port + "/" + path;
    };

    Connection.prototype.apiUrl = function(path) {
      return this.url("api/" + path);
    };

    Connection.prototype.request = function(type, url, data, cb, failCb) {
      var _this = this;
      return $.ajax({
        type: type,
        url: url,
        data: data,
        headers: {
          Accept: "application/edn"
        }
      }).done(function(result) {
        return typeof cb === "function" ? cb(edn.toJS(edn.parse(result))) : void 0;
      }).fail(function() {
        if (typeof failCb === "function") {
          failCb();
        }
        return _this.emit("disconnected");
      });
    };

    Connection.prototype.connect = function(cb) {
      var _this = this;
      return this.getStorages(function(result) {
        _this.emit("connected");
        return typeof cb === "function" ? cb() : void 0;
      });
    };

    Connection.prototype.getStorages = function(cb) {
      return this.request("get", this.url("data/"), {}, cb);
    };

    Connection.prototype.createDatabase = function(alias, name, cb) {
      return this.request("post", this.url("data/" + alias + "/"), {
        "db-name": name
      }, cb);
    };

    Connection.prototype.getDatabases = function(alias, cb) {
      return this.request("get", this.url("data/" + alias + "/"), {}, cb);
    };

    Connection.prototype.getEntity = function(id, cb) {
      return this.request("get", this.url("data/" + this.data.alias + "/" + this.data.db + "/-/entity"), {
        e: id
      }, cb);
    };

    Connection.prototype.transact = function(transaction, cb) {
      return this.request("post", this.apiUrl("transact"), {
        transaction: transaction
      }, function(result) {
        if (typeof cb === "function") {
          cb(result);
        }
        return DatomicIsm.schema.refresh();
      });
    };

    Connection.prototype.query = function(q, args, cb) {
      return this.request("get", this.apiUrl("query"), {
        q: q,
        args: "[{:db/alias \"" + this.data.alias + "/" + this.data.db + "\"}]"
      }, cb);
    };

    return Connection;

  })(require("./widget/Model"));

  module.exports = Connection;

}).call(this);

});
require.register("datomicism/lib/Explorer.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.1
(function() {
  var Explorer, bling;

  bling = require("bling");

  Explorer = (function() {

    function Explorer(options) {
      this.surface = options.surface;
      this.selector = options.selector;
      this.nodes = {};
      this.leaves = {};
      this.leavesCount = {};
    }

    Explorer.prototype.render = function() {
      var self;
      self = this;
      this.$el = bling(".explorer .title, ul.tree", function() {
        var oldheight, shrunk,
          _this = this;
        self.$tree = this.tree;
        this.title.text("explorer");
        shrunk = false;
        oldheight = 200;
        return this.title.on({
          mousedown: function() {
            if (shrunk) {
              _this.tree.animate({
                height: oldheight
              });
              return shrunk = false;
            } else {
              oldheight = _this.tree.height();
              _this.tree.animate({
                height: 0
              });
              return shrunk = true;
            }
          }
        });
      });
      this.drawNodes();
      return this;
    };

    Explorer.prototype.drawNodes = function() {
      var self,
        _this = this;
      self = this;
      return $("" + this.surface + " " + this.selector).each(function(i, el) {
        var defaultDesc, desc, id, mapNode, model, type, view, _$el;
        _$el = $(el);
        id = _$el.attr("id");
        if (_this.nodes[id] == null) {
          model = _$el.data("model");
          view = _$el.data("view");
          type = view.__proto__.title;
          if (_this.leaves[type] == null) {
            _this.leavesCount[type] = 0;
            _this.$tree.bappend("li span, ul", function() {
              this.span.text(type);
              return self.leaves[type] = this.ul;
            });
          }
          mapNode = _$el.data("CartographicSurfaceNode");
          _this.leavesCount[type]++;
          defaultDesc = "" + type + " " + _this.leavesCount[type];
          desc = function() {
            var d;
            d = typeof model.description === "function" ? model.description() : void 0;
            if (d) {
              if (d.length > 25) {
                return d.slice(0, 22) + "...";
              } else {
                return d;
              }
            } else {
              return defaultDesc;
            }
          };
          _this.leaves[type].append(_this.nodes[id] = bling("li .desc, button.remove", function() {
            var _this = this;
            this.desc.text(desc());
            this.li.on({
              mousedown: function() {
                return $("html, body").animate({
                  scrollTop: _$el.offset().top - 100,
                  scrollLeft: _$el.offset().left - 100
                });
              },
              mouseenter: function() {
                _this.remove.uncloak();
                _$el.addClass("lit");
                return mapNode.addClass("lit");
              },
              mouseleave: function() {
                _this.remove.cloak();
                _$el.removeClass("lit");
                return mapNode.removeClass("lit");
              }
            });
            this.remove.text("x").cloak().on({
              mousedown: function(e) {
                e.stopPropagation();
                return view.close();
              }
            });
            return model.on("change", function() {
              return _this.desc.text(desc());
            });
          }));
          return _$el.on("remove.Explorer", function() {
            _this.nodes[id].remove();
            _this.leavesCount[type]--;
            if (_this.leavesCount[type] === 0) {
              _this.leaves[type].parent().remove();
              delete _this.leaves[type];
              return delete _this.leavesCount[type];
            }
          });
        }
      });
    };

    return Explorer;

  })();

  module.exports = Explorer;

}).call(this);

});
require.register("datomicism/lib/Schema.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.1
(function() {
  var Attribute, Enum, Namespace, Resource, Schema, kosherName, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  kosherName = require("./kosherName");

  Enum = require("./widget/Enum").Enum;

  _ref = require("./widget/Namespace"), Namespace = _ref.Namespace, Attribute = _ref.Attribute;

  Resource = (function(_super) {

    __extends(Resource, _super);

    function Resource() {
      return Resource.__super__.constructor.apply(this, arguments);
    }

    Resource.prototype.init = function() {
      this.set("attributes", {});
      return this.set("children", {});
    };

    Resource.prototype.addAttribute = function(name, attr) {
      var attributes;
      attributes = this.get("attributes");
      attributes[name] = attr;
      this.set("attributes", attributes);
      return this;
    };

    Resource.prototype.getChild = function(name) {
      var children;
      children = this.get("children");
      if (children[name] == null) {
        return false;
      }
      return children[name];
    };

    Resource.prototype.addChild = function(name, val) {
      var children;
      children = this.get("children");
      children[name] = val;
      this.set("children", children);
      return this;
    };

    return Resource;

  })(require("./widget/Model"));

  Schema = (function(_super) {

    __extends(Schema, _super);

    function Schema() {
      return Schema.__super__.constructor.apply(this, arguments);
    }

    Schema.prototype.loaded = false;

    Schema.prototype.init = function() {
      this.set("root", new Resource({
        name: "root",
        path: "root"
      }));
      this.attrById = {};
      return this.nsByName = {};
    };

    Schema.prototype.whenLoaded = function(cb) {
      if (this.loaded) {
        return cb(this);
      }
      return this.once("refreshed", cb);
    };

    Schema.prototype.getAttribute = function(keyword) {
      var att, ns, r, resource, _ref1;
      if (!keyword || (keyword.split == null)) {
        return;
      }
      _ref1 = keyword.slice(1).split("/"), ns = _ref1[0], att = _ref1[1];
      if (resource = this.nsByName[ns]) {
        if (resource.data.attributes[att] != null) {
          return {
            type: resource.type,
            value: resource.data.attributes[att],
            paths: {
              resource: r = "resource-" + (kosherName(ns)),
              attribute: "" + r + "-attr-" + (kosherName(att))
            }
          };
        }
      }
      return false;
    };

    Schema.prototype.getAttributeById = function(id) {
      var attr;
      if (attr = this.attrById[id]) {
        return this.getAttribute(attr[":db/ident"]);
      } else {
        return false;
      }
    };

    Schema.prototype.getResource = function(name) {
      var child, part, parts, path, resource, _i, _len, _ref1;
      parts = name.split(".");
      resource = this.get("root");
      path = [];
      _ref1 = name.split(".");
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        part = _ref1[_i];
        path.push(part);
        if (!(child = resource.getChild(part))) {
          resource.addChild(part, resource = new Resource({
            name: part,
            path: path.join(".")
          }));
          this.nsByName[path.join(".")] = resource;
        } else {
          resource = child;
        }
      }
      return resource;
    };

    Schema.prototype.getNamespace = function(name) {
      var attr, details, ns, resource, _ref1;
      if (resource = this.nsByName[name]) {
        if (resource.type === "enum") {
          ns = new Enum({
            name: name
          }, false);
        } else {
          ns = new Namespace({
            name: name
          }, false);
        }
        ns.data[":db/id"] = resource.data[":db/id"];
        _ref1 = resource.get("attributes");
        for (name in _ref1) {
          details = _ref1[name];
          attr = new Attribute(details);
          attr.set("name", name);
          ns.attributes.push(attr);
        }
        return ns;
      } else {
        throw "unknown namespace " + name;
      }
    };

    Schema.prototype.add = function(attr, type) {
      var attName, ns, resource, _ref1;
      this.attrById[attr[":db/id"]] = attr;
      _ref1 = attr[":db/ident"].slice(1).split("/"), ns = _ref1[0], attName = _ref1[1];
      resource = this.getResource(ns).addAttribute(attName, attr);
      resource.type = type;
      resource.data[":db/id"] = attr[":db/id"];
      return this;
    };

    Schema.prototype.refresh = function() {
      var self;
      self = this;
      this.init();
      return DatomicIsm.connection.query("[:find ?e :where [:db.part/db :db.install/attribute ?e]]", {}, function(packed) {
        var attributes, e, _i, _len;
        attributes = {};
        for (_i = 0, _len = packed.length; _i < _len; _i++) {
          e = packed[_i];
          attributes[e[0]] = true;
        }
        return DatomicIsm.connection.query("[:find ?e :where [?e :db/ident]]", {}, function(items) {
          var checkDone, count, item, _j, _len1, _results;
          count = items.length;
          checkDone = function() {
            count--;
            self.loaded = true;
            if (!count) {
              return self.emit("refreshed");
            }
          };
          _results = [];
          for (_j = 0, _len1 = items.length; _j < _len1; _j++) {
            item = items[_j];
            _results.push((function(item) {
              return DatomicIsm.connection.getEntity(item[0], function(attr) {
                self.add(attr, attributes[item] ? "attribute" : "enum");
                return checkDone();
              });
            })(item));
          }
          return _results;
        });
      });
    };

    return Schema;

  })(require("./widget/Model"));

  module.exports = {
    Schema: Schema,
    Resource: Resource
  };

}).call(this);

});
require.register("datomicism/lib/dbCombo.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.1
(function() {
  var bling;

  bling = require("bling");

  module.exports = function(model, field) {
    var cur, drawDbs, select;
    select = bling("select.dbCombo.loading");
    cur = model.get(field);
    drawDbs = function(cb) {
      select.html("");
      return DatomicIsm.connection.getStorages(function(storages) {
        var checkDone, count, storage, _i, _len, _results;
        count = storages.length;
        checkDone = function() {
          count--;
          if (count === 0) {
            return cb();
          }
        };
        _results = [];
        for (_i = 0, _len = storages.length; _i < _len; _i++) {
          storage = storages[_i];
          _results.push((function(storage) {
            var optGroup;
            optGroup = (bling("optgroup", {
              label: storage
            })).appendTo(select);
            return DatomicIsm.connection.getDatabases(storage, function(databases) {
              var database, _j, _len1;
              for (_j = 0, _len1 = databases.length; _j < _len1; _j++) {
                database = databases[_j];
                optGroup.bappend("option", {
                  value: "{:db/alias \"" + storage + "/" + database + "\"}",
                  text: database
                });
              }
              optGroup.bappend("option", {
                value: "new " + storage,
                text: "--new db--"
              });
              return checkDone();
            });
          })(storage));
        }
        return _results;
      });
    };
    select.on({
      change: function() {
        var $el, alias, isNew, name, _ref;
        $el = $(this);
        _ref = $el.val().split(" "), isNew = _ref[0], alias = _ref[1];
        if (isNew === "new") {
          if (name = prompt("DB Name")) {
            return DatomicIsm.connection.createDatabase(alias, name, function() {
              return drawDbs(function() {
                return select.val("{:db/alias \"" + alias + "/" + name + "\"}");
              });
            });
          }
        } else {
          model.set(field, $el.val());
          return select.trigger("changedValue", $el.val());
        }
      }
    });
    drawDbs(function() {
      if (cur) {
        select.val(cur);
      }
      return select.trigger("change");
    });
    return select;
  };

}).call(this);

});
require.register("datomicism/lib/String.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.1
(function() {

  String.prototype.$tag = function(args) {
    return $("<" + this + "/>", args);
  };

  String.prototype.upperCaseFirst = function() {
    return this[0].toUpperCase() + this.slice(1);
  };

}).call(this);

});
require.register("datomicism/lib/Comment.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.1
(function() {
  var Comment;

  Comment = (function() {

    function Comment(val) {
      this.val = val;
    }

    Comment.prototype.ednEncode = function() {
      return "\n ;; " + this.val;
    };

    return Comment;

  })();

  module.exports = Comment;

}).call(this);

});
require.register("datomicism/lib/Storage.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.1
(function() {

  module.exports = {
    get: function(key, defVal) {
      var parsed, val;
      val = localStorage.getItem(key);
      if (!val) {
        val = defVal;
      }
      try {
        parsed = JSON.parse(val);
        return parsed;
      } catch (e) {
        return val;
      }
    },
    set: function(key, val) {
      return localStorage.setItem(key, JSON.stringify(val));
    }
  };

}).call(this);

});
require.register("datomicism/lib/widgets.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.1
(function() {
  var Browser, BrowserView, Datom, DatomView, Entity, EntityView, Enum, EnumView, Namespace, NamespaceView, Note, NoteView, Query, QueryView, Rules, RulesView, Sketch, SketchView, Transact, TransactView, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;

  _ref = require("./widget/Entity"), Entity = _ref.Entity, EntityView = _ref.EntityView;

  _ref1 = require("./widget/Enum"), Enum = _ref1.Enum, EnumView = _ref1.EnumView;

  _ref2 = require("./widget/Namespace"), Namespace = _ref2.Namespace, NamespaceView = _ref2.NamespaceView;

  _ref3 = require("./widget/Query"), Query = _ref3.Query, QueryView = _ref3.QueryView;

  _ref4 = require("./widget/Datom"), Datom = _ref4.Datom, DatomView = _ref4.DatomView;

  _ref5 = require("./widget/Rules"), Rules = _ref5.Rules, RulesView = _ref5.RulesView;

  _ref6 = require("./widget/Sketch"), Sketch = _ref6.Sketch, SketchView = _ref6.SketchView;

  _ref7 = require("./widget/Note"), Note = _ref7.Note, NoteView = _ref7.NoteView;

  _ref8 = require("./widget/Browser"), Browser = _ref8.Browser, BrowserView = _ref8.BrowserView;

  _ref9 = require("./widget/Transact"), Transact = _ref9.Transact, TransactView = _ref9.TransactView;

  module.exports = {
    Entity: Entity,
    EntityView: EntityView,
    Enum: Enum,
    EnumView: EnumView,
    Namespace: Namespace,
    NamespaceView: NamespaceView,
    Query: Query,
    QueryView: QueryView,
    Datom: Datom,
    DatomView: DatomView,
    Rules: Rules,
    RulesView: RulesView,
    Sketch: Sketch,
    SketchView: SketchView,
    Note: Note,
    NoteView: NoteView,
    Browser: Browser,
    BrowserView: BrowserView,
    Transact: Transact,
    TransactView: TransactView,
    Order: ["Browser", "Namespace", "Enum", "Query", "Rules", "Transact", "Entity", "Note", "Sketch"],
    Tips: {
      Entity: "After the browser this is the most common way to navigate through the system. You can either type an entity id in or browse via namespace. Once you are viewing an entity (or list of entities) clicking any of the links will reveal another entity widget navigated to the relevant location.",
      Enum: "The enum widget is similar to namespace but only allows for adding the names of the enum members.",
      Namespace: "The collection of attributes for a given entity. You may not alter existing attributes but you can add new ones. Clicking the arrow to the left of an attribute reveals further details.",
      Query: "The query widget is very useful for sanity checking your queries as it will do real time schema checking to make sure the attributes you are referring to exist. It will also indicate if terms in your find clause are actually bound either in the in or where clauses. You can click any attribute in to see it in a browser. If you are utilizing input there is an experimental interface which provides inputs that correspond to the in clause. You can toggle to manual if you would like to just pass in.",
      Datom: "A datom may be dragged out of any entity - the plan is to allow historical interrogation for a given EAV tuple. Currently it just shows the details.",
      Rules: "Useful when you want to share where clauses in many queries.",
      Sketch: "Simple canvas based paint tool for when words will not suffice.",
      Note: "Markdown based snippets - good for annotating/fluent programming style descriptions.",
      Browser: "The main navigational tool. It is grouped hierarchically by namespace. A node in this list will either represent attributes for an entity or an enum. You can drag and drop any namespace or attribute to the workspace to inspect it as an entity.",
      Transact: "Allows for issuing of transactions directly. Useful for importing an entire schema/dataset."
    }
  };

}).call(this);

});
require.register("datomicism/lib/widget/Entity.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.1
(function() {
  var Entity, EntityView, Enum, bling, textInput, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require("underscore");

  bling = require("bling");

  textInput = require("../Input").textInput;

  Enum = require("./Enum").Enum;

  Entity = (function(_super) {

    __extends(Entity, _super);

    function Entity() {
      return Entity.__super__.constructor.apply(this, arguments);
    }

    return Entity;

  })(require("./Model"));

  EntityView = (function(_super) {

    __extends(EntityView, _super);

    function EntityView() {
      return EntityView.__super__.constructor.apply(this, arguments);
    }

    EntityView.prototype.title = "Entity";

    EntityView.prototype.className = "entity";

    EntityView.prototype.sizeRows = function() {
      return this.$results.css({
        height: this.$el.outerHeight() - this.$searchBy.outerHeight() - this.$handle.outerHeight() - 43 - this.$moreRow.outerHeight() - this.$message.outerHeight(),
        width: this.$el.outerWidth()
      });
    };

    EntityView.prototype.drawControls = function() {
      this._nsCombo(this.$byNS);
      return this.$searchBy.trigger("change");
    };

    EntityView.prototype.growToContent = function() {
      this.$results.css({
        height: this.$results[0].scrollHeight,
        width: this.$results[0].scrollWidth
      });
      this.$el.css({
        height: this.$results[0].scrollHeight + 22 + this.$searchBy.outerHeight() + this.$moreRow.outerHeight() + this.$handleBar.outerHeight()
      });
      return this.sizeRows();
    };

    EntityView.prototype._nsCombo = function(control) {
      var combo, handleNode;
      combo = control || bling("select");
      combo.html("").bappend("option", {
        value: "--",
        text: "Namespace"
      });
      handleNode = function(node, indent) {
        var n, r, _ref, _results;
        if (indent == null) {
          indent = 0;
        }
        combo.append(bling("option", {
          value: node.get("path"),
          html: Array(indent + 1).join("&nbsp;&nbsp;") + node.get("name")
        }));
        _ref = node.get("children");
        _results = [];
        for (n in _ref) {
          r = _ref[n];
          _results.push(handleNode(r, indent + 1));
        }
        return _results;
      };
      handleNode(DatomicIsm.schema.get("root"));
      return combo;
    };

    EntityView.prototype._refBrowser = function(entity, dn, dv) {
      var self;
      self = this;
      return bling(".refinput input, button.browse", function() {
        var _this = this;
        this.input.prop({
          name: dn
        }).val(dv[":db/id"]);
        this.input.numeric({
          negative: false
        });
        this.button.after(self._removeButton(this.refinput, this.input));
        return this.browse.text("...").on({
          click: function(e) {
            var widget;
            widget = DatomicIsm.fetchEntity(_this.input.val(), e);
            widget.view.$message.text("The next entity you select will be used as ref for " + entity[":db/id"] + "/" + dn);
            return widget.view.onSelect = function(ns, ent) {
              _this.input.val(ent[":db/id"]);
              return widget.view.close();
            };
          }
        });
      });
    };

    EntityView.prototype._removeButton = function(holder, control) {
      return bling("button.remove", function() {
        var _this = this;
        return this.remove.text("x").on({
          click: function() {
            if (holder.hasClass("newValue")) {
              holder.remove();
              return DatomicIsm.bus.emit("newAttribute.removed");
            } else {
              if (control.hasClass("removed")) {
                control.removeClass("removed").attr({
                  disabled: null
                });
                return _this.remove.text("x");
              } else {
                control.addClass("removed").attr({
                  disabled: true
                });
                return _this.remove.html("&#8624;");
              }
            }
          }
        });
      });
    };

    EntityView.prototype._attrValue = function(entity, dn, dv, type) {
      var self;
      self = this;
      return bling(".inputHolder input", function() {
        if (type === ":db.type/boolean") {
          this.input.prop({
            type: "checkbox"
          });
          if (dv) {
            this.input.prop({
              checked: true
            });
          }
        }
        if (type === ":db.type/long") {
          this.input.numeric();
        }
        if (type === ":db.type/double") {
          this.input.numeric({
            decimal: "."
          });
        }
        return this.input.attr({
          value: dv,
          name: dn
        }).after(self._removeButton(this.inputHolder, this.input));
      });
    };

    EntityView.prototype.drawEntity = function(entity, appendTo, subcnt) {
      var buttons, dn, dv, editing, newAttrs, newEntity, ns, nslis, nsul, result, self, vals, _fn,
        _this = this;
      if (subcnt == null) {
        subcnt = 1;
      }
      self = this;
      appendTo || (appendTo = self.$results);
      if (_.isObject(entity)) {
        appendTo.append(result = bling(".result"));
        if (entity[":db/id"] != null) {
          result.addClass("entity entity-" + entity[":db/id"]);
          result.bappend(".detail label, span.val", function() {
            var _this = this;
            this.label.text("id");
            this.val.text(entity[":db/id"]);
            return this.val.addClass("idlink").on({
              click: function(e) {
                return DatomicIsm.fetchEntity(entity[":db/id"], e);
              }
            });
          });
        }
        ns = false;
        if (entity.newEntity) {
          ns = ":" + entity.newEntity;
          newEntity = true;
          delete entity.newEntity;
        }
        nslis = {};
        vals = {};
        newAttrs = {};
        result.append(nsul = bling("ul.namespaces"));
        _fn = function(dn, dv) {
          var attName, _ref;
          _ref = dn.split("/"), ns = _ref[0], attName = _ref[1];
          if (nslis[ns] == null) {
            nsul.append(bling("li span.nsname, ul", function() {
              this.span.text(ns.slice(1));
              this.span.addClass("link").on({
                click: function(e) {
                  return DatomicIsm.fetchBrowser({
                    resource: "resource-" + ns.slice(1)
                  }, e);
                }
              });
              return nslis[ns] = this.ul;
            }));
          }
          return nslis[ns].bappend("li.detail label, span.val, .valWrite", function() {
            var addButton, attr, attrType, ref, v, _fn1, _i, _j, _len, _len1,
              _this = this;
            this.detail.draggable({
              handle: "label",
              helper: "clone",
              appendTo: "body",
              start: function(e, ui) {
                ui.helper.prepend(bling(".entityId", {
                  html: "entity&nbsp;" + entity[":db/id"]
                }));
                return ui.helper.css({
                  zIndex: 6000
                });
              },
              stop: function(e) {
                return DatomicIsm.fetchDatom(entity[":db/id"], dn, e);
              }
            });
            vals[dn] = {
              read: this.val,
              write: this.valWrite.hide()
            };
            this.label.text(attName);
            attrType = false;
            if (attr = DatomicIsm.schema.getAttribute(dn)) {
              (function(attr) {
                attrType = attr.value[':db/valueType'];
                return _this.label.addClass("idlink").on({
                  click: function(e) {
                    return DatomicIsm.fetchEntity(attr.value[':db/id'], e);
                  }
                });
              })(attr);
            }
            if (_.isArray(dv)) {
              if (attrType === ":db.type/ref") {
                _fn1 = function(v) {
                  if (!_.isObject(v)) {
                    v = DatomicIsm.schema.getAttribute(v).value;
                  }
                  _this.val.bappend("span.idlink, span.spacer", function() {
                    this.spacer.text(" ");
                    return this.idlink.text(v[":db/ident"] || v[":db/id"]).on({
                      click: function(e) {
                        return DatomicIsm.fetchEntity(v[":db/id"], e);
                      }
                    });
                  });
                  return _this.valWrite.append(self._refBrowser(entity, dn, v));
                };
                for (_i = 0, _len = dv.length; _i < _len; _i++) {
                  v = dv[_i];
                  _fn1(v);
                }
                this.valWrite.append(addButton = bling("button.add"));
                return addButton.text("+").on({
                  click: function() {
                    return addButton.before((self._refBrowser(entity, dn, {})).addClass("newValue"));
                  }
                });
              } else {
                this.val.text(dv.join(", "));
                for (_j = 0, _len1 = dv.length; _j < _len1; _j++) {
                  v = dv[_j];
                  this.valWrite.append(self._attrValue(entity, dn, v, attrType));
                }
                this.valWrite.append(addButton = bling("button.add"));
                return addButton.text("+").on({
                  click: function() {
                    return addButton.before((self._attrValue(entity, dn, "", attrType)).addClass("newValue"));
                  }
                });
              }
            } else if (_.isObject(dv)) {
              if (dv[":db/id"] != null) {
                this.val.text(dv[":db/id"]).addClass("entityLink").on({
                  click: function(e) {
                    return DatomicIsm.fetchEntity(dv[":db/id"], e);
                  }
                });
                this.valWrite.append(self._refBrowser(entity, dn, dv));
                return DatomicIsm.connection.getEntity(dv[":db/id"], function(ent) {
                  var k, _results;
                  _results = [];
                  for (k in ent) {
                    v = ent[k];
                    if (!(_.last(k.split("/")) === "name")) {
                      continue;
                    }
                    _this.val.text("" + dv[":db/id"] + " (" + v + ")");
                    break;
                  }
                  return _results;
                });
              } else {
                return this.val.text(JSON.stringify(dv));
              }
            } else {
              this.val.text(dv);
              if ((attrType === ":db.type/ref") && (ref = DatomicIsm.schema.getAttribute(dv))) {
                return (function(ref) {
                  var enumAttrs, enumNS;
                  _this.val.addClass("idlink").on({
                    click: function(e) {
                      return DatomicIsm.fetchEntity(ref.value[":db/id"], e);
                    }
                  });
                  if (ref.type === "enum" && (enumNS = _.first(dv.slice(1).split("/"))) && (enumAttrs = DatomicIsm.schema.getNamespace(enumNS))) {
                    return _this.valWrite.bappend(".inputHolder select optgroup", function() {
                      var _k, _len2, _ref1;
                      this.select.prop({
                        name: dn
                      });
                      this.optgroup.attr({
                        label: enumNS
                      });
                      _ref1 = enumAttrs.attributes;
                      for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
                        attr = _ref1[_k];
                        this.optgroup.bappend("option", {
                          value: attr.get(":db/id"),
                          text: attr.get("name")
                        });
                      }
                      return this.select.val(ref.value[":db/id"]).after(self._removeButton(this.inputHolder, this.select));
                    });
                  } else {
                    return _this.valWrite.append(self._refBrowser(entity, dn, dv));
                  }
                })(ref);
              } else {
                return this.valWrite.append(self._attrValue(entity, dn, dv, attrType));
              }
            }
          });
        };
        for (dn in entity) {
          dv = entity[dn];
          if (!(dn !== ":db/id")) {
            continue;
          }
          if (dn[0] !== ":") {
            continue;
          }
          _fn(dn, dv);
        }
        result.bappend(".@buttons button.@edit, button.@addAttribute, button.@cancel, button.@transact, button.@retract", {
          self: buttons = {}
        });
        editing = false;
        buttons.$edit.text("edit").cloak().on({
          click: function() {
            var val;
            editing = true;
            for (dn in vals) {
              val = vals[dn];
              val.read.hide();
              val.write.show();
            }
            buttons.$edit.hide();
            buttons.$addAttribute.show();
            buttons.$cancel.show();
            buttons.$transact.show();
            return buttons.$retract.show();
          }
        });
        if (!entity[":db/id"]) {
          buttons.$retract.remove();
        }
        buttons.$retract.text("retract entity").css({
          float: "right",
          marginRight: 20
        }).hide().on({
          click: function() {
            return DatomicIsm.connection.transact(edn.encode([[":db.fn/retractEntity", entity[":db/id"]]]));
          }
        });
        buttons.$addAttribute.text("add attribute").hide().on({
          click: function() {
            return buttons.$buttons.before(bling(".inputHolder.newAttribute.newValue", function() {
              var attrs, input, newAttributeLabel, select, valInputs,
                _this = this;
              this.inputHolder.append(newAttributeLabel = bling("span", {
                text: "New Attribute"
              }), select = self._nsCombo(), attrs = bling("select"), input = bling(".newAttrWrapper"), self._removeButton(this.inputHolder).on("click.rowItem", function() {
                return delete newAttrs[attrs.val()];
              }), valInputs = bling(".valInputs"));
              attrs.hide().on({
                change: function() {
                  var addButton, attrDetails, ctrl, val;
                  if (attrs.val() === "---") {
                    return valInputs.html("");
                  }
                  attrDetails = DatomicIsm.schema.getAttribute(attrs.val());
                  if (attrDetails.value[":db/valueType"] === ":db.type/ref") {
                    ctrl = "_refBrowser";
                    val = {};
                  } else {
                    ctrl = "_attrValue";
                    val = "";
                  }
                  newAttrs[attrs.val()] = _this.inputHolder;
                  DatomicIsm.bus.on("newAttribute.removed", function() {
                    if ($(".inputHolder, .refinput", valInputs).length === 0) {
                      return attrs.val("---").trigger("change");
                    }
                  });
                  valInputs.html((self[ctrl]({}, attrDetails.value[":db/ident"], val, attrDetails.value[":db/valueType"])).addClass("newValue"));
                  if (attrDetails.value[":db/cardinality"] === ":db.cardinality/many") {
                    valInputs.append(addButton = bling("button"));
                    addButton.text("+").on({
                      click: function() {
                        return addButton.before((self[ctrl]({}, attrDetails.value[":db/ident"], val, attrDetails.value[":db/valueType"])).addClass("newValue"));
                      }
                    });
                  } else {
                    $("button.remove", valInputs).remove();
                  }
                  newAttributeLabel.text("" + (attrs.val()) + "  (" + attrDetails.value[":db/valueType"] + ")");
                  select.remove();
                  attrs.remove();
                  return $('option[value="' + attrs.val() + '"]', result).remove();
                }
              });
              select.on({
                change: function() {
                  if (select.val() === "--") {
                    return;
                  }
                  ns = ":" + (select.val());
                  return (function(ns) {
                    var attr, _i, _len, _ref, _results;
                    attrs.html(bling("option", {
                      text: "---",
                      value: "---"
                    }));
                    attrs.hide();
                    if (!ns.isEnum) {
                      _ref = ns.attributes;
                      _results = [];
                      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        attr = _ref[_i];
                        if (!((entity[attr.data[":db/ident"]] == null) && !newAttrs[attr.data[":db/ident"]])) {
                          continue;
                        }
                        attrs.show();
                        _results.push(attrs.append(bling("option", {
                          value: attr.data[":db/ident"],
                          text: attr.data[":db/ident"].replace(":" + (select.val()) + "/", "")
                        })));
                      }
                      return _results;
                    }
                  })(DatomicIsm.schema.getNamespace(select.val()));
                }
              });
              if (ns) {
                return select.val(ns.slice(1)).trigger("change");
              }
            }));
          }
        });
        buttons.$cancel.text("cancel").hide().on({
          click: function() {
            var attr, val;
            editing = false;
            for (dn in vals) {
              val = vals[dn];
              val.write.hide();
              val.read.show();
            }
            for (dn in newAttrs) {
              attr = newAttrs[dn];
              attr.remove();
              delete newAttrs[dn];
            }
            $(".newAttribute", result).remove();
            buttons.$cancel.hide();
            buttons.$addAttribute.hide();
            buttons.$transact.hide();
            buttons.$retract.hide();
            return buttons.$edit.show();
          }
        });
        buttons.$transact.text("transact").hide().on({
          click: function() {
            var $input, eid, input, transaction, value, _i, _len, _ref;
            if (!entity[":db/id"]) {
              eid = new edn.Tagged(new edn.Tag("db/id"), new edn.Vector([":db.part/user", -1]));
            } else {
              eid = entity[":db/id"];
            }
            transaction = [];
            _ref = $("input[name], select[name]", result);
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              input = _ref[_i];
              $input = $(input);
              value = $input.is("[type=checkbox]") ? $input.is(":checked") : $input.val();
              transaction.push([$input.hasClass("removed") ? ":db/retract" : ":db/add", eid, $input.prop("name"), value]);
            }
            return DatomicIsm.connection.transact(edn.encode(transaction), function() {
              return console.log(arguments);
            });
          }
        });
        result.on({
          mouseenter: function() {
            if (!editing) {
              return buttons.$edit.uncloak();
            }
          },
          mouseleave: function() {
            return buttons.$edit.cloak();
          }
        });
        if (newEntity) {
          buttons.$edit.click();
        }
        if (self.onSelect != null) {
          return result.bappend("button", {
            text: "Use Entity",
            on: {
              mouseup: function() {
                return self.onSelect(dn.split("/")[0], entity);
              }
            }
          });
        }
      }
    };

    EntityView.prototype.render = function() {
      var self;
      EntityView.__super__.render.call(this);
      self = this;
      this.$el.resizable().bappend(".searchForm .@message, select.searchBy, input.byId, select.byNS, button.newEntity, .results, .moreRow button.more", {
        self: self
      }, function() {
        var n, ns, offset, searchBy, size, total, v, _ref,
          _this = this;
        self.$searchForm = this.searchForm;
        self.$results = this.results;
        self.$moreRow = this.moreRow;
        self.$searchBy = this.searchBy;
        self.$newEntity = this.newEntity;
        this.newEntity.text("new entity").on({
          click: function() {
            self.$results.html(bling("h1", {
              text: "New Entity"
            }));
            console.log(_this.byNS.val());
            return self.drawEntity({
              newEntity: _this.byNS.val()
            });
          }
        });
        this.searchBy.bappend("option", {
          value: "--",
          text: "Search By"
        });
        _ref = {
          byId: "entity id",
          namespace: "namespace"
        };
        for (v in _ref) {
          n = _ref[v];
          this.searchBy.bappend("option", {
            value: v,
            html: "&nbsp;&nbsp;" + n
          });
        }
        offset = 0;
        total = 0;
        size = 4;
        ns = false;
        this.more.text("more").on({
          click: function() {
            _this.more.text("loading").attr({
              disabled: true
            });
            offset++;
            return ns.fetchRecords((function(records) {
              var count, entity, _i, _len, _results;
              count = (size + 1) * (offset + 1);
              if (count >= total) {
                _this.more.cloak();
              } else {
                _this.more.text("more (" + count + "/" + total + ")").attr({
                  disabled: false
                });
              }
              _results = [];
              for (_i = 0, _len = records.length; _i < _len; _i++) {
                entity = records[_i];
                _results.push(self.drawEntity(entity.data));
              }
              return _results;
            }), offset, size);
          }
        });
        this.byNS.on({
          change: function() {
            var att, _i, _len, _ref1, _results;
            if (!DatomicIsm.schema.loaded) {
              return;
            }
            if (_this.byNS.val() === "--") {
              return;
            }
            self.model.set("byNS", _this.byNS.val());
            ns = DatomicIsm.schema.getNamespace(_this.byNS.val());
            if (ns instanceof Enum) {
              self.$results.html("");
              _this.more.cloak();
              _ref1 = ns.attributes;
              _results = [];
              for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                att = _ref1[_i];
                _results.push(self.drawEntity(att.data));
              }
              return _results;
            } else {
              self.$results.html("fetching");
              return ns.fetchRecords(function(records) {
                var entity, _j, _len1;
                self.$results.html("");
                offset = 0;
                total = ns.entities.length;
                _this.more.attr({
                  disabled: false
                });
                if (total === 1) {
                  _this.more.cloak();
                }
                for (_j = 0, _len1 = records.length; _j < _len1; _j++) {
                  entity = records[_j];
                  self.drawEntity(entity.data);
                }
                if ((size + 1) < total) {
                  return _this.more.text("more (" + (size + 1) + "/" + total + ")").uncloak();
                }
              });
            }
          }
        });
        this.byId.numeric({
          negative: false
        });
        this.byId.on({
          keyup: function() {
            if (!DatomicIsm.schema.loaded) {
              return;
            }
            self.model.set("byId", _this.byId.val().trim());
            if (_this.byId.val().trim().length === 0) {
              return;
            }
            self.$results.html("fetching");
            return DatomicIsm.connection.getEntity(_this.byId.val(), function(entity) {
              self.$results.html("");
              self.drawEntity(entity);
              return self.growToContent();
            });
          }
        });
        this.byNS.hide();
        this.byId.hide();
        self.$searchBy = this.searchBy.on({
          change: function() {
            self.model.set("searchBy", _this.searchBy.val());
            self.$results.html("");
            _this.more.cloak();
            switch (_this.searchBy.val()) {
              case "--":
                _this.byNS.hide();
                return _this.byId.hide();
              case "byId":
                _this.byNS.hide();
                _this.byId.show().val("");
                _this.byId.val(self.model.get("byId"));
                return _this.byId.trigger("keyup");
              case "namespace":
                _this.byId.hide();
                _this.byNS.show();
                _this.byNS.val(self.model.get("byNS", "--"));
                return _this.byNS.trigger("change");
            }
          }
        });
        self.$byNS = this.byNS;
        if (searchBy = self.model.get("searchBy")) {
          this.searchBy.val(searchBy);
        }
        self.drawControls();
        DatomicIsm.schema.on("refreshed", function() {
          self.drawControls();
          if (searchBy) {
            return _this.searchBy.val(searchBy);
          }
        });
        return this.searchBy.trigger("change");
      });
      return this.$el.on("resize.Entity", function() {
        return self.sizeRows();
      });
    };

    EntityView.prototype.postAppend = function() {
      return this.sizeRows();
    };

    return EntityView;

  })(require("./Widget"));

  module.exports = {
    Entity: Entity,
    EntityView: EntityView
  };

}).call(this);

});
require.register("datomicism/lib/widget/Enum.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.1
(function() {
  var Enum, EnumView, Namespace, NamespaceView, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require("./Namespace"), Namespace = _ref.Namespace, NamespaceView = _ref.NamespaceView;

  Enum = (function(_super) {

    __extends(Enum, _super);

    function Enum() {
      return Enum.__super__.constructor.apply(this, arguments);
    }

    Enum.prototype.isEnum = true;

    Enum.prototype.ednPrep = function() {
      var attribute, item, ns, out, _i, _len, _ref1;
      ns = this.get("name");
      out = [];
      _ref1 = this.attributes;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        attribute = _ref1[_i];
        item = {
          "db/id": new edn.Tagged(new edn.Tag("db", "id"), [":db.part/db"]),
          "db/ident": ":" + ns + "/" + (attribute.get("name"))
        };
        out.push(item);
        attribute.set(":db/ident", item["db/ident"]);
      }
      return out;
    };

    return Enum;

  })(Namespace);

  EnumView = (function(_super) {

    __extends(EnumView, _super);

    function EnumView() {
      return EnumView.__super__.constructor.apply(this, arguments);
    }

    EnumView.prototype.title = "Enum";

    EnumView.prototype.className = "enum";

    EnumView.prototype.attributeOptions = function() {};

    EnumView.prototype.render = function() {
      EnumView.__super__.render.call(this);
      return this.$el.addClass("enumNamespace namespace");
    };

    return EnumView;

  })(NamespaceView);

  module.exports = {
    Enum: Enum,
    EnumView: EnumView
  };

}).call(this);

});
require.register("datomicism/lib/widget/Namespace.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.1
(function() {
  var Attribute, Model, Namespace, NamespaceView, Record, bling, cardinalityTypes, checkbox, keyHandler, kosherName, labelPair, nameInput, oneOrManyToggle, textAreaInput, typeCombo, types, uniqueCombo, uniqueTypes, _, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = require("underscore");

  bling = require("bling");

  Model = require("./Model");

  _ref = require("../datomicTypes"), types = _ref.types, uniqueTypes = _ref.uniqueTypes, cardinalityTypes = _ref.cardinalityTypes;

  _ref1 = require("../Input"), keyHandler = _ref1.keyHandler, nameInput = _ref1.nameInput, textAreaInput = _ref1.textAreaInput, labelPair = _ref1.labelPair, uniqueCombo = _ref1.uniqueCombo, checkbox = _ref1.checkbox, oneOrManyToggle = _ref1.oneOrManyToggle, typeCombo = _ref1.typeCombo;

  kosherName = require("../kosherName");

  Attribute = (function(_super) {

    __extends(Attribute, _super);

    function Attribute() {
      return Attribute.__super__.constructor.apply(this, arguments);
    }

    return Attribute;

  })(Model);

  Record = (function(_super) {

    __extends(Record, _super);

    function Record() {
      return Record.__super__.constructor.apply(this, arguments);
    }

    Record.prototype.dataForTransaction = function() {
      var k, result, tid, v, _ref2;
      result = {};
      tid = 0;
      if (this.isNew()) {
        result["db/id"] = new edn.Tagged(new edn.Tag("db/id"), new edn.Vector([":db.part/user", -(++tid)]));
      }
      _ref2 = this.data;
      for (k in _ref2) {
        v = _ref2[k];
        if (v != null) {
          result[k === "db/id" ? k : "" + this.ns + "/" + k] = v;
        }
      }
      return result;
    };

    return Record;

  })(Model);

  Namespace = (function(_super) {

    __extends(Namespace, _super);

    function Namespace() {
      return Namespace.__super__.constructor.apply(this, arguments);
    }

    Namespace.prototype.init = function() {
      this.attributes = [];
      this.recordMap = {};
      return this.records = [];
    };

    Namespace.prototype.ednPrep = function() {
      var attribute, i, item, ns, option, out, val, _i, _j, _len, _len1, _ref2, _ref3;
      ns = this.get("name");
      out = [];
      _ref2 = this.attributes;
      for (i = _i = 0, _len = _ref2.length; _i < _len; i = ++_i) {
        attribute = _ref2[i];
        if (!attribute.get("name")) {
          continue;
        }
        item = {
          "db/id": new edn.Tagged(new edn.Tag("db", "id"), [":db.part/db"]),
          "db/ident": ":" + ns + "/" + (attribute.get("name")),
          "db/valueType": attribute.get(":db/valueType"),
          "db/cardinality": attribute.get(":db/cardinality")
        };
        attribute.set(":db/ident", item["db/ident"]);
        attribute.set(":db/id", true);
        attribute._isNew = false;
        _ref3 = ["doc", "unique", "index", "fulltext", "isComponent", "noHistory"];
        for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
          option = _ref3[_j];
          if ((val = attribute.get(":db/" + option)) && !_.isNull(val)) {
            item["db/" + option] = val;
          }
        }
        item["db.install/_attribute"] = ":db.part/db";
        out.push(item);
      }
      return out;
    };

    Namespace.prototype._fetchEntities = function(cb) {
      var attr, checkCount, checkDone, self, _i, _len, _ref2, _results;
      self = this;
      this.entities = [];
      checkCount = this.attributes.length;
      checkDone = function() {
        checkCount--;
        if (!checkCount) {
          return cb();
        }
      };
      _ref2 = this.attributes;
      _results = [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        attr = _ref2[_i];
        _results.push(DatomicIsm.connection.query("[:find ?id :where [?id :" + (this.get("name")) + "/" + (attr.get("name")) + "]]", {}, function(ids) {
          var id, _j, _len1, _ref3;
          for (_j = 0, _len1 = ids.length; _j < _len1; _j++) {
            id = ids[_j];
            if (_ref3 = _.first(id), __indexOf.call(self.entities, _ref3) < 0) {
              self.entities.push(_.first(id));
            }
          }
          return checkDone();
        }));
      }
      return _results;
    };

    Namespace.prototype.fetchRecords = function(cb, offset, size) {
      var self, _fetch;
      if (offset == null) {
        offset = 0;
      }
      if (size == null) {
        size = 4;
      }
      self = this;
      _fetch = function() {
        var checkCount, checkDone, k, start, subset, subsetRecs, _i, _len, _results;
        start = offset ? (offset * size) + 1 : 0;
        subset = self.entities.slice(start, +(start + size) + 1 || 9e9);
        subsetRecs = [];
        checkCount = subset.length;
        if (checkCount === 0) {
          return typeof cb === "function" ? cb([]) : void 0;
        }
        checkDone = function() {
          checkCount--;
          if (!checkCount) {
            self.emit("recordsFetched", self.records);
            return typeof cb === "function" ? cb(subsetRecs) : void 0;
          }
        };
        _results = [];
        for (_i = 0, _len = subset.length; _i < _len; _i++) {
          k = subset[_i];
          _results.push(DatomicIsm.connection.getEntity(k, function(rec) {
            if (self.recordMap[rec[":db/id"]] != null) {
              self.records[self.recordMap[rec[":db/id"]]].update(rec);
            } else {
              self.recordMap[rec[":db/id"]] = self.records.push(new Record(rec, false)) - 1;
            }
            subsetRecs.push(self.records[self.recordMap[rec[":db/id"]]]);
            return checkDone();
          }));
        }
        return _results;
      };
      if (offset === 0) {
        return this._fetchEntities(_fetch);
      } else {
        return _fetch();
      }
    };

    return Namespace;

  })(Model);

  NamespaceView = (function(_super) {

    __extends(NamespaceView, _super);

    NamespaceView.prototype.title = "Namespace";

    NamespaceView.prototype.className = "namespace";

    NamespaceView.prototype.attributeDefaults = function() {
      return {
        type: ":db.type/string",
        cardinality: ":db.cardinality/one"
      };
    };

    function NamespaceView(model, id) {
      var _this = this;
      this.model = model;
      this.id = id;
      NamespaceView.__super__.constructor.call(this, this.model, this.id);
      this.attributes = [];
      this.records = [];
      this._state = "attributes";
      if (this.model.isNew()) {
        this.$el.addClass("pendingChanges");
      } else {
        this.$el.addClass("noChanges");
      }
      DatomicIsm.schema.whenLoaded(function() {
        if (_this.model.get("name")) {
          _this.model = DatomicIsm.schema.getNamespace(_this.model.get("name"));
          _this.$el.removeClass("pendingChanges");
          _this.$el.addClass("noChanges");
          _this.drawAttributes();
        }
        return _this.model.on("recordsFetched", function(records) {
          var record, _i, _len, _results;
          _results = [];
          for (_i = 0, _len = records.length; _i < _len; _i++) {
            record = records[_i];
            _results.push(_this.addRecord(record));
          }
          return _results;
        });
      });
    }

    NamespaceView.prototype.drawAttributes = function() {
      var attr, _i, _len, _ref2, _results;
      this.$attributes.html("");
      _ref2 = this.model.attributes;
      _results = [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        attr = _ref2[_i];
        _results.push(this.addAttribute(attr, false));
      }
      return _results;
    };

    NamespaceView.prototype.attributeOptions = function(model, main, options, isNew) {
      var card, down, optionsToggle, right, type;
      if (isNew == null) {
        isNew = false;
      }
      options.bappend(".optionHolder", function() {
        return this.optionHolder.append(labelPair("doc", textAreaInput(model, ":db/doc")), labelPair("unique", uniqueCombo(model, ":db/unique")), labelPair("index", checkbox(model, ":db/index")), labelPair("fulltext", checkbox(model, ":db/fulltext")), labelPair("component", checkbox(model, ":db/isComponent")), labelPair("no history", checkbox(model, ":db/noHistory")));
      });
      right = "&#x25BA;";
      down = "&#x25BC;";
      main.prepend(optionsToggle = bling("div.optionsToggle", {
        html: right
      }));
      if (!model.get(":db/ident")) {
        main.append(card = oneOrManyToggle(model, ":db/cardinality"), type = typeCombo(model, ":db/valueType"));
        type.trigger("change");
      } else {
        main.append(bling("span.cardinality", {
          text: cardinalityTypes[model.get(":db/cardinality")]
        }), bling("div.valueType span", function() {
          return this.span.text(_.last(model.get(":db/valueType", "/n/a").split("/")));
        }));
      }
      return optionsToggle.on({
        click: function() {
          if (options.is(":visible")) {
            options.slideUp("fast");
            return optionsToggle.html(right);
          } else {
            optionsToggle.html(down);
            return options.slideDown("fast");
          }
        }
      });
    };

    NamespaceView.prototype.addAttribute = function(data, isNew) {
      var column, kosherClass, model, self;
      if (isNew == null) {
        isNew = true;
      }
      self = this;
      if (data instanceof Attribute) {
        model = data;
        isNew = false;
      } else {
        model = new Attribute(data, isNew);
        this.model.attributes.push(model);
        this._showTransactButton = true;
        this.$el.removeClass("noChanges");
        this.$el.addClass("pendingChanges");
        this.showTransactButton();
      }
      if (isNew) {
        kosherClass = kosherName(":" + (this.model.get("name")) + "/" + (model.get("name")));
      } else {
        kosherClass = kosherName(model.get(":db/ident"));
        model.set("name", _.last(model.get(":db/ident").split("/")));
      }
      this.$actionCol.before(column = bling("th.header.cell", {
        text: model.get("name")
      }));
      return this.$attributes.bappend(".attribute." + kosherClass + " .main, .options", function() {
        var name, removeButton,
          _this = this;
        this.main.append(name = nameInput(model, "name"), removeButton = bling("button.removeButton", {
          text: "x",
          css: {
            visibility: "hidden"
          }
        }));
        self.attributeOptions(model, this.main, this.options, isNew);
        this.options.hide();
        removeButton.on({
          click: function() {
            var attribute, pos, row, _i, _len, _ref2;
            self.model.attributes = (function() {
              var _i, _len, _ref2, _results;
              _ref2 = self.model.attributes;
              _results = [];
              for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
                attribute = _ref2[_i];
                if (attribute !== model) {
                  _results.push(attribute);
                }
              }
              return _results;
            })();
            _this.attribute.remove();
            pos = column.parent().children().index(column[0]);
            _ref2 = $("tr", self.$rows);
            for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
              row = _ref2[_i];
              $(row).children().eq(pos).remove();
            }
            return column.remove();
          }
        });
        if (isNew) {
          this.attribute.on({
            mouseenter: function() {
              return removeButton.css({
                visibility: "visible"
              });
            },
            mouseleave: function() {
              return removeButton.css({
                visibility: "hidden"
              });
            }
          });
        }
        if (!isNew) {
          return name.replaceWith(bling("span.name", {
            text: _.last(model.get(":db/ident").split("/"))
          }));
        } else {
          return name.on({
            keyup: keyHandler({
              ENTER: function() {
                self.addAttribute(self.attributeDefaults());
                return self.focusLastAttribute();
              },
              UP: function() {
                if (!$(".nameInput", name.parent().parent().prev(".attribute")).focus().length) {
                  return self.$name.focus();
                }
              },
              DOWN: function() {
                if (!$(".nameInput", name.parent().parent().next(".attribute")).focus().length) {
                  return self.$name.focus();
                }
              }
            }),
            changedValue: function() {
              var newKosherClass;
              newKosherClass = kosherName(":" + (self.model.get("name")) + "/" + (model.get("name")));
              _this.attribute.attr({
                "class": "attribute " + newKosherClass
              });
              column.text(model.get("name"));
              return kosherClass = newKosherClass;
            }
          });
        }
      });
    };

    NamespaceView.prototype.showCellHalo = function(cell, attr) {
      var self;
      self = this;
      this.hideCellHalo();
      return this.cellHalo = bling(".cellHalo button.retract, button.history, button.idToggle", function() {
        var hideTimeout, ignoreBlur,
          _this = this;
        hideTimeout = false;
        ignoreBlur = false;
        this.retract.text("x").on({
          mousedown: function(e) {
            e.stopPropagation;
            return console.log("retract");
          }
        });
        this.history.text("h").on({
          mousedown: function(e) {
            e.stopPropagation();
            return console.log("show history");
          }
        });
        this.idToggle.text("id").on({
          mousedown: function(e) {
            e.stopPropagation();
            return console.log("show id");
          }
        });
        this.cellHalo.appendTo($("body")).css({
          left: cell.offset().left,
          top: cell.offset().top + cell.outerHeight() + 1,
          width: cell.outerWidth() - 11
        }).on({
          mouseenter: function() {
            ignoreBlur = true;
            return clearTimeout(hideTimeout);
          },
          mousedown: function(e) {
            ignoreBlur = false;
            clearTimeout(hideTimeout);
            return e.stopPropagation();
          }
        });
        return cell.on({
          blur: (function() {
            if (ignoreBlur) {
              return;
            }
            return hideTimeout = setTimeout((function() {
              return _this.cellHalo.remove();
            }), 300);
          })
        }, "input");
      });
    };

    NamespaceView.prototype.hideCellHalo = function() {
      var _ref2;
      return (_ref2 = this.cellHalo) != null ? _ref2.remove() : void 0;
    };

    NamespaceView.prototype.getAttributeInput = function(attribute, recordModel, hideables) {
      var enums, n, select, type, v, _ref2, _ref3;
      switch (type = attribute.get(":db/valueType")) {
        case ":db.type/string":
          return nameInput(recordModel, attribute.get("name"));
        case ":db.type/boolean":
          return checkbox(recordModel, attribute.get("name"));
        case ":db.type/long":
        case ":db.type/bigint":
        case ":db.type/ref":
          if (type === ":db.type/ref") {
            if (enums = (_ref2 = DatomicIsm.schema.data[this.model.get("name")]) != null ? (_ref3 = _ref2.data.enums) != null ? _ref3[attribute.get("name")] : void 0 : void 0) {
              select = bling("select");
              for (n in enums) {
                v = enums[n];
                select.bappend("option", {
                  value: v[":db/id"],
                  text: n
                });
              }
              return select;
            } else {
              return bling(".entityVal, .entityNS, .entityField, .entityBrowse", function() {
                var entityVal,
                  _this = this;
                entityVal = this.entityVal;
                hideables.push(this.entityBrowse);
                hideables.push(this.entityNS);
                this.entityBrowse.html("&#8230;").on({
                  mousedown: function() {
                    var ev;
                    ev = new EntityView(new Entity);
                    ev.onSelect = function(field, entity) {
                      ev.$el.remove();
                      _this.entityNS.text(field);
                      return _this.entityField.html(bling("select", function() {
                        var f,
                          _this = this;
                        for (f in entity) {
                          v = entity[f];
                          this.select.bappend("option", {
                            text: _.last(f.split("/")),
                            value: v
                          });
                        }
                        hideables.push(this.select);
                        this.select.on({
                          change: function() {
                            return entityVal.text(_this.select.val());
                          }
                        });
                        this.select.cloak();
                        return this.select.trigger("change");
                      }));
                    };
                    ev.$searchForm.prepend(bling(".message", {
                      text: "The next entity you select will be used as the ref"
                    }));
                    ev.$el.appendTo("body");
                    return ev.$el.css({
                      position: "absolute"
                    }).toCenter();
                  }
                });
                this.entityNS.text("--");
                return this.entityVal.text('');
              });
            }
          }
          return textInput(recordModel, attribute.get("name"), function(e, input) {
            var num;
            num = parseInt(input.val());
            if (_.isNumber(num) && !_.isNaN(num)) {
              return input.val(num);
            } else {
              return input.val("");
            }
          });
        case ":db.type/double":
        case ":db.type/float":
        case ":db.type/bigdec":
          return textInput(recordModel, attribute.get("name"), function(e, input, inblur) {
            var num, val;
            if (inblur) {
              val = input.val();
              if (__indexOf.call(String(val), ".") >= 0) {
                return val;
              } else {
                input.val("" + val + ".0");
                return input.val();
              }
            }
            if (regex.floatStart.test(input.val())) {
              return;
            }
            if (regex.float.test(input.val())) {
              return;
            }
            num = parseFloat(input.val());
            if (_.isNumber(num) && !_.isNaN(num)) {
              return input.val(num);
            } else {
              return input.val("");
            }
          });
        case ":db.type/keyword":
          return textInput(recordModel, attribute.get("name"), function(e, input) {
            if (regex.keyword.test(input.val())) {
              return;
            }
            return input.val("");
          });
      }
    };

    NamespaceView.prototype.addRecord = function(data) {
      var model, self;
      self = this;
      if (data instanceof Record) {
        model = data;
      } else {
        model = new Record(data);
      }
      model.ns = this.model.get("name");
      this.records.push(model);
      this.$rows.bappend("tr.row", function(row) {
        var attribute, hideable, hidebuttons, removeButton, unhidebuttons, _fn, _i, _len, _ref2,
          _this = this;
        hideable = [];
        hidebuttons = function() {
          var el, _i, _len, _results;
          _results = [];
          for (_i = 0, _len = hideable.length; _i < _len; _i++) {
            el = hideable[_i];
            _results.push(el.cloak());
          }
          return _results;
        };
        unhidebuttons = function() {
          var el, _i, _len, _results;
          _results = [];
          for (_i = 0, _len = hideable.length; _i < _len; _i++) {
            el = hideable[_i];
            _results.push(el.uncloak());
          }
          return _results;
        };
        _ref2 = self.model.attributes;
        _fn = function(attribute) {
          var cell, input;
          row.append(cell = bling("td", {
            html: input = self.getAttributeInput(attribute, model, hideable)
          }));
          input.on({
            focus: function() {
              self.showCellHalo(cell, attribute);
              $(".remove", self.$rows).cloak();
              return removeButton.uncloak();
            }
          });
          return model.on("change:" + (attribute.get("name")), function() {
            return cell.addClass("pendingChanges");
          });
        };
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          attribute = _ref2[_i];
          _fn(attribute);
        }
        removeButton = false;
        model.on("change", function() {
          self._showTransactButton = true;
          return self.$transactButton.uncloak();
        });
        return row.append(bling("td button.remove", function() {
          removeButton = this.remove.text("x").cloak().on({
            click: function() {
              return row.remove();
            }
          });
          hideable.push(removeButton);
          return row.on({
            mouseenter: unhidebuttons,
            mouseleave: hidebuttons
          });
        }));
      });
      return $("tr:last td:first input", this.$records).focus();
    };

    NamespaceView.prototype.focusFirstAttribute = function() {
      return $(".attribute .nameInput", this.$el).first().focus();
    };

    NamespaceView.prototype.focusLastAttribute = function() {
      return $(".attribute .nameInput", this.$el).last().focus();
    };

    NamespaceView.prototype.activeFocus = function() {
      return $(window.document.activeElement);
    };

    NamespaceView.prototype.focusInputLeft = function() {
      if (!$("input", this.activeFocus().parent().prev()).focus().length) {
        return console.log("no left");
      }
    };

    NamespaceView.prototype.focusInputRight = function() {
      if (!$("input", this.activeFocus().parent().next()).focus().length) {
        return console.log("no right");
      }
    };

    NamespaceView.prototype.focusInputUp = function() {
      var cell, pos;
      cell = this.activeFocus().parent();
      pos = cell.parent().children().index(cell);
      if (!$("input", cell.parent().prev()).eq(pos).focus().length) {
        return console.log("no up");
      }
    };

    NamespaceView.prototype.focusInputDown = function() {
      var cell, pos;
      cell = this.activeFocus().parent();
      pos = cell.parent().children().index(cell);
      if (!$("input", cell.parent().next()).eq(pos).focus().length) {
        return console.log("no down");
      }
    };

    NamespaceView.prototype.setupRecords = function() {
      var self,
        _this = this;
      self = this;
      this.$records.bappend("table thead.columns, tbody.rows", function() {
        self.$rows = this.rows;
        return this.columns.append(bling("tr th.actionCol.cell", function() {
          return self.$actionCol = this.actionCol.html("&nbsp;");
        }));
      });
      return this.$records.on({
        keydown: keyHandler({
          ENTER: function() {
            return _this.addRecord();
          },
          LEFT: function() {
            return _this.focusInputLeft();
          },
          RIGHT: function() {
            return _this.focusInputRight();
          },
          UP: function() {
            return _this.focusInputUp();
          },
          DOWN: function() {
            return _this.focusInputDown();
          }
        })
      }, "td input");
    };

    NamespaceView.prototype.showTransactButton = function() {
      if (this.model.hasPendingChanges() || this._showTransactButton) {
        return this.$transactButton.uncloak();
      }
    };

    NamespaceView.prototype.sizeRows = function() {
      return this.$attributes.css({
        height: this.$el.outerHeight() - (this.$nameHeader.outerHeight() + this.$buttons.outerHeight() + this.$handleBar.outerHeight() + 30)
      });
    };

    NamespaceView.prototype.postAppend = function() {
      return this.sizeRows();
    };

    NamespaceView.prototype.render = function() {
      var self,
        _this = this;
      NamespaceView.__super__.render.call(this);
      self = this;
      this.$el.resizable({
        resize: function() {
          return _this.sizeRows();
        }
      });
      return this.$el.bappend(".@nameHeader, .@attributes, .@records, .@buttons button.addAttribute, button.addRecord", {
        self: self
      }, function() {
        var transactButton,
          _this = this;
        this.records.hide();
        self.setupRecords();
        this.nameHeader.html(self.$name = (nameInput(self.model, "name")).on({
          keyup: keyHandler({
            ENTER: function() {
              self.addAttribute(self.attributeDefaults());
              return self.focusLastAttribute();
            },
            UP: function() {
              return self.focusLastAttribute();
            },
            DOWN: function() {
              return self.focusFirstAttribute();
            }
          })
        }));
        if (self.model.get(":db/id")) {
          self.$name.replaceWith(bling("span", {
            text: self.model.get("name")
          }));
        }
        this.nameHeader.append(transactButton = bling("button.@transactButton", {
          self: self
        }, function() {
          var _this = this;
          return this.button.text("Transact").on({
            click: function() {
              var record, recordIds, transaction, _i, _len, _ref2;
              _this.button.cloak();
              if (self._state === "records") {
                transaction = [];
                recordIds = [];
                _ref2 = self.records;
                for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
                  record = _ref2[_i];
                  if (record.hasPendingChanges()) {
                    transaction.push(record.dataForTransaction());
                    recordIds.push(record.id);
                  }
                }
                console.log(edn.encode(transaction));
                return DatomicIsm.connection.transact(edn.encode(transaction), function(result) {
                  $("td.pendingChanges", self.$el).removeClass("pendingChanges");
                  return self._showTransactButton = false;
                });
              } else {
                return DatomicIsm.connection.transact(edn.encode(self.model.ednPrep()), function() {
                  self.$el.removeClass("pendingChanges");
                  self.$el.addClass("noChanges");
                  self.drawAttributes();
                  return self._showTransactButton = false;
                });
              }
            }
          });
        }));
        transactButton.cloak();
        self.model.on("change", function() {
          return transactButton.uncloak();
        });
        this.addAttribute.text("+").on({
          click: function() {
            self.addAttribute(self.attributeDefaults());
            return self.focusLastAttribute();
          }
        });
        this.addRecord.hide().text("+").on({
          click: function() {
            return self.addRecord();
          }
        });
        this.buttons = this.buttons.add(self.$closeButton);
        this.buttons.cloak();
        return self.$el.on({
          dragstart: function() {
            return self.hideCellHalo();
          },
          mouseenter: function() {
            _this.buttons.uncloak();
            return self.showTransactButton();
          },
          mouseleave: function() {
            if (!self.$el.hasClass("ui-draggable-dragging")) {
              self.hideCellHalo();
              transactButton.cloak();
              return _this.buttons.cloak();
            }
          }
        });
      });
    };

    return NamespaceView;

  })(require("./Widget"));

  module.exports = {
    Attribute: Attribute,
    Record: Record,
    Namespace: Namespace,
    NamespaceView: NamespaceView
  };

}).call(this);

});
require.register("datomicism/lib/widget/Datom.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.1
(function() {
  var Datom, DatomView,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Datom = (function(_super) {

    __extends(Datom, _super);

    function Datom() {
      return Datom.__super__.constructor.apply(this, arguments);
    }

    return Datom;

  })(require("./Model"));

  DatomView = (function(_super) {

    __extends(DatomView, _super);

    function DatomView() {
      return DatomView.__super__.constructor.apply(this, arguments);
    }

    DatomView.prototype.title = "Datom";

    DatomView.prototype.className = "datom";

    DatomView.prototype.render = function() {
      var self,
        _this = this;
      self = this;
      DatomView.__super__.render.call(this);
      DatomicIsm.connection.getEntity(self.model.get("entityId"), function(entity) {
        var details;
        _this.$el.append(details = bling(".details"));
        return details.append(labelPair("Entity", _this.model.get("entityId")), labelPair("Attribute", _this.model.get("attribute")), labelPair("Value", entity[_this.model.get("attribute")]));
      });
      return this.$el.resizable();
    };

    return DatomView;

  })(require("./Widget"));

  module.exports = {
    Datom: Datom,
    DatomView: DatomView
  };

}).call(this);

});
require.register("datomicism/lib/widget/Rules.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.1
(function() {
  var Rules, RulesView,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Rules = (function(_super) {

    __extends(Rules, _super);

    function Rules() {
      return Rules.__super__.constructor.apply(this, arguments);
    }

    Rules.prototype.init = function() {
      return this.on("change", function() {
        return DatomicIsm.bus.emit("rulesChanged");
      });
    };

    return Rules;

  })(require("./Model"));

  RulesView = (function(_super) {

    __extends(RulesView, _super);

    function RulesView() {
      return RulesView.__super__.constructor.apply(this, arguments);
    }

    RulesView.prototype.title = "Rules";

    RulesView.prototype.className = "rules";

    RulesView.instances = {};

    RulesView.prototype.init = function() {
      RulesView.instances[this.id] = this;
      return DatomicIsm.bus.emit("rulesChanged");
    };

    RulesView.prototype.close = function() {
      this.model.remove();
      delete RulesView.instances[this.id];
      DatomicIsm.bus.emit("rulesChanged");
      return RulesView.__super__.close.call(this);
    };

    RulesView.prototype.sizeRows = function() {
      var height;
      height = this.$el.outerHeight() - this.$handleBar.outerHeight();
      this.$wrapper.css({
        height: height
      });
      return $(".CodeMirror-scroll", this.$wrapper).css({
        height: height
      });
    };

    RulesView.prototype.refresh = function() {
      var cur;
      cur = this.editor.getCursor();
      this.editor.setValue(this.editor.getValue());
      return this.editor.setCursor(cur);
    };

    RulesView.prototype.render = function() {
      var self,
        _this = this;
      self = this;
      RulesView.__super__.render.call(this);
      this.$widget.bappend(".main textarea", function() {
        var _this = this;
        self.editor = CodeMirror.fromTextArea(this.textarea.get(0), {
          matchBrackets: true,
          mode: {
            name: "datomic",
            hooks: {
              ":": function(keyword) {
                if (keyword === ":db/id") {
                  return " keyword";
                }
                if (DatomicIsm.schema.getAttribute(keyword)) {
                  return " keyword";
                }
                return " keyword missing";
              }
            }
          },
          onChange: function() {
            return self.model.set("input", self.editor.getValue());
          }
        });
        self.$wrapper = $(self.editor.getWrapperElement());
        return self.$wrapper.on({
          mousedown: function(e) {
            var el, existingAttr;
            el = $(this);
            if (!el.hasClass("cm-missing")) {
              e.stopPropagation();
              if (existingAttr = DatomicIsm.schema.getAttribute(el.text())) {
                return DatomicIsm.fetchBrowser(existingAttr.paths, e);
              }
            }
          }
        }, ".cm-atom");
      });
      this.sizeRows();
      return this.$el.resizable({
        stop: function() {
          return _this.sizeRows();
        }
      });
    };

    RulesView.prototype.postAppend = function() {
      var _this = this;
      this.editor.setValue(this.model.get("input", ""));
      DatomicIsm.schema.on("refreshed", function() {
        return _this.refresh();
      });
      return this.sizeRows();
    };

    return RulesView;

  })(require("./Widget"));

  module.exports = {
    Rules: Rules,
    RulesView: RulesView
  };

}).call(this);

});
require.register("datomicism/lib/widget/Sketch.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.1
(function() {
  var ColorPicker, Sketch, SketchView, bling, comboInput, labelPair, sketch, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  bling = require("bling");

  sketch = require("sketch");

  ColorPicker = require("color-picker");

  _ref = require("../Input"), labelPair = _ref.labelPair, comboInput = _ref.comboInput;

  Sketch = (function(_super) {

    __extends(Sketch, _super);

    function Sketch() {
      return Sketch.__super__.constructor.apply(this, arguments);
    }

    return Sketch;

  })(require("./Model"));

  SketchView = (function(_super) {

    __extends(SketchView, _super);

    function SketchView() {
      return SketchView.__super__.constructor.apply(this, arguments);
    }

    SketchView.prototype.title = "Sketch";

    SketchView.prototype.className = "sketch";

    SketchView.prototype.sizeRows = function() {
      this.$canvas.prop({
        width: this.$el.outerWidth(),
        height: this.$el.outerHeight() - (this.$handleBar.outerHeight() + this.$tools.outerHeight())
      });
      this.sketch.clear();
      this.sketch["import"](this.model.get("objs", [])).draw();
      this.$activeColor.css({
        background: this.model.get("color", "rgb(0,0,0)")
      });
      return this.$sizeInput.trigger("change");
    };

    SketchView.prototype.render = function() {
      var keepOnTop, noBg, self,
        _this = this;
      self = this;
      SketchView.__super__.render.call(this);
      this.$el.resizable({
        stop: function() {
          return _this.sizeRows();
        }
      });
      this.$el.append(bling(".main .@tools, @canvas", {
        self: self
      }));
      this.$tools.append(labelPair("size", (this.$sizeInput = comboInput({
        0.5: "small",
        1: "normal",
        4: "medium",
        8: "large",
        10: "huge"
      }, this.model, "size"))), bling("button", {
        text: "clear",
        on: {
          click: function() {
            _this.model.set("objs", [], true);
            return _this.sketch.clear();
          }
        }
      }), keepOnTop = bling("button", {
        html: "[" + (this.model.get("keepOnTop") ? "x" : "&nbsp;") + "] keep on top",
        on: {
          click: function() {
            if (_this.model.get("keepOnTop")) {
              _this.model.set("keepOnTop", false);
              keepOnTop.html("[&nbsp;] keep on top");
              return _this.$el.removeClass("keepOnTop");
            } else {
              _this.model.set("keepOnTop", true);
              keepOnTop.html("[x] keep on top");
              return _this.$el.addClass("keepOnTop");
            }
          }
        }
      }), bling("button", {
        text: "hide chrome",
        on: {
          click: function() {
            _this.$el.addClass("nochrome");
            _this.model.set("hidechrome", true);
            _this.sizeRows();
            return _this.$showChrome.uncloak();
          }
        }
      }), noBg = bling("button", {
        html: "[" + (this.model.get("nobackground") ? "x" : "&nbsp;") + "] no background",
        on: {
          click: function() {
            if (_this.model.get("nobackground")) {
              _this.model.set("nobackground", false);
              return noBg.html("[&nbsp;] no background");
            } else {
              _this.model.set("nobackground", true);
              return noBg.html("[x] no background");
            }
          }
        }
      }));
      bling("span.@activeColor", {
        self: self,
        appendTo: this.$tools
      });
      this.$el.append(bling("button.@showChrome", {
        self: self
      }));
      this.$activeColor.on({
        click: function(e) {
          return bling(".pickerHolder button.@ok", {
            appendTo: "body"
          }, function() {
            var picker,
              _this = this;
            this.ok.text("ok").on({
              click: function() {
                return _this.pickerHolder.remove();
              }
            });
            picker = new ColorPicker;
            this.pickerHolder.prepend(picker.el).css({
              position: "absolute",
              left: e.pageX,
              top: e.pageY,
              zIndex: 6000
            });
            picker.color(self.model.get("color", "rgb(0,0,0)"));
            return picker.on("change", function(color) {
              self.$activeColor.css({
                background: color
              });
              return self.model.set("color", color.toString());
            });
          });
        }
      });
      this.sketch = sketch(this.$canvas.get(0));
      this.model.on("change", function() {
        _this.sketch.size(_this.model.get("size", 1.5));
        _this.sketch.color(_this.model.get("color", "rgb(0,0,0)"));
        _this.sketch.opacity(1);
        if (_this.model.get("nobackground")) {
          _this.sketch.backgroundColor("rgba(255,255,255,0)");
        } else {
          _this.sketch.backgroundColor("rgba(255,255,255,1)");
        }
        return _this.sketch.draw();
      });
      this.model.emit("change");
      if (this.model.get("keepOnTop")) {
        this.$el.addClass("keepOnTop");
      }
      if (this.model.get("hidechrome")) {
        this.$el.addClass("nochrome");
      }
      this.$sizeInput.val(this.model.get("size", 1.5));
      this.$el.on("drag.start", function() {
        $(".pickerHolder").remove();
        return _this.$canvas.hide();
      });
      this.$el.on("drag.stop", function() {
        return _this.$canvas.hide().show();
      });
      this.$showChrome.cloak().text("show chrome").on({
        click: function() {
          _this.model.set("hidechrome", false);
          _this.$el.removeClass("nochrome");
          _this.$el.trigger("resize");
          return _this.sizeRows();
        }
      });
      this.$el.on({
        mouseenter: function() {
          if (_this.model.get("hidechrome")) {
            return _this.$showChrome.uncloak();
          }
        },
        mouseleave: function() {
          if (_this.model.get("hidechrome")) {
            return _this.$showChrome.cloak();
          }
        }
      });
      this.$canvas.on({
        mouseup: function() {
          return _this.model.set("objs", _this.sketch["export"](), true);
        }
      });
      return this;
    };

    SketchView.prototype.postAppend = function() {
      return this.sizeRows();
    };

    return SketchView;

  })(require("./Widget"));

  module.exports = {
    Sketch: Sketch,
    SketchView: SketchView
  };

}).call(this);

});
require.register("datomicism/lib/widget/Note.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.1
(function() {
  var Note, NoteView, bling,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  bling = require("bling");

  Note = (function(_super) {

    __extends(Note, _super);

    function Note() {
      return Note.__super__.constructor.apply(this, arguments);
    }

    Note.prototype.description = function() {
      return this.get("note", "");
    };

    return Note;

  })(require("./Model"));

  NoteView = (function(_super) {

    __extends(NoteView, _super);

    function NoteView() {
      return NoteView.__super__.constructor.apply(this, arguments);
    }

    NoteView.prototype.title = "Note";

    NoteView.prototype.className = "note";

    NoteView.prototype.sizeInput = function() {
      var size;
      size = {
        height: this.$el.height() - 10,
        width: this.$el.width() - 10
      };
      this.$wrapper.css(size);
      $(".CodeMirror-scroll", this.$wrapper).css(size);
      return this.$parsed.css(size);
    };

    NoteView.prototype.render = function() {
      var self,
        _this = this;
      NoteView.__super__.render.call(this);
      self = this;
      this.$handle.replaceWith(bling("textarea.@note, .@parsed", {
        self: self
      }));
      this.editor = CodeMirror.fromTextArea(this.$note.get(0), {
        mode: {
          name: "markdown"
        },
        lineWrapping: true,
        onChange: function() {
          return _this.model.set("note", _this.editor.getValue());
        },
        onBlur: function() {
          _this.$wrapper.hide();
          _this.parseMedia();
          return _this.$parsed.show();
        }
      });
      this.$wrapper = $(this.editor.getWrapperElement());
      this.$wrapper.hide();
      this.$widgetNameInput.remove();
      this.$el.resizable();
      this.$el.on("resize.Note", function() {
        return _this.sizeInput();
      });
      this.$el.on({
        dblclick: function() {
          _this.$parsed.hide();
          _this.$wrapper.show();
          _this.editor.focus();
          return _this.editor.setValue(_this.model.get("note", ""));
        }
      });
      return this;
    };

    NoteView.prototype.parseMedia = function() {
      return this.$parsed.html(markdown.makeHtml(this.model.get("note", "")));
    };

    NoteView.prototype.postAppend = function() {
      this.sizeInput();
      this.editor.setValue(this.model.get("note", ""));
      return this.parseMedia();
    };

    NoteView.prototype.postDrop = function() {
      return this.$el.trigger("dblclick");
    };

    return NoteView;

  })(require("./Widget"));

  module.exports = {
    Note: Note,
    NoteView: NoteView
  };

}).call(this);

});
require.register("datomicism/lib/widget/Transact.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.1
(function() {
  var Transact, TransactView, bling,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  bling = require("bling");

  Transact = (function(_super) {

    __extends(Transact, _super);

    function Transact() {
      return Transact.__super__.constructor.apply(this, arguments);
    }

    return Transact;

  })(require("./Model"));

  TransactView = (function(_super) {

    __extends(TransactView, _super);

    function TransactView() {
      return TransactView.__super__.constructor.apply(this, arguments);
    }

    TransactView.prototype.title = "Transact";

    TransactView.prototype.className = "transact";

    TransactView.prototype.txcols = [":e", ":a", ":v", ":tx", ":added"];

    TransactView.prototype.sizeRows = function() {
      var avail, bpos, tbarHeight;
      tbarHeight = this.$handleBar.outerHeight();
      bpos = this.$buttons.position().top - tbarHeight;
      avail = this.$el.outerHeight() - tbarHeight;
      this.$wrapper.css({
        height: bpos
      });
      $(".CodeMirror-scroll", this.$wrapper).css({
        height: bpos
      });
      return this.$results.css({
        height: avail - (bpos + this.$buttons.height() + 19)
      });
    };

    TransactView.prototype.refresh = function() {
      var cur;
      cur = this.editor.getCursor();
      this.editor.setValue(this.editor.getValue());
      return this.editor.setCursor(cur);
    };

    TransactView.prototype.render = function() {
      var self,
        _this = this;
      TransactView.__super__.render.call(this);
      self = this;
      this.$el.bappend(".main textarea, .buttons button.transact", function() {
        var _this = this;
        self.editor = CodeMirror.fromTextArea(this.textarea.get(0), {
          matchBrackets: true,
          mode: {
            name: "datomic",
            hooks: {
              ":": function(keyword) {
                if (keyword === ":db/id") {
                  return " keyword";
                }
                if (DatomicIsm.schema.getAttribute(keyword)) {
                  return " keyword";
                }
                return " keyword missing";
              }
            }
          },
          onChange: function() {
            return self.model.set("input", self.editor.getValue());
          }
        });
        self.$wrapper = $(self.editor.getWrapperElement());
        self.$buttons = this.buttons.draggable({
          axis: "y",
          containment: "parent",
          drag: function() {
            return self.sizeRows();
          },
          stop: function() {
            self.sizeRows();
            return self.model.set("midPaneTop", self.$buttons.position().top);
          }
        });
        self.$buttons.css({
          position: "absolute",
          top: self.model.get("midPaneTop", 150)
        });
        this.buttons.after(self.$results = bling("pre.results"));
        return this.transact.text("Transact").on({
          click: function() {
            self.$results.text("transacting");
            return DatomicIsm.connection.transact(self.editor.getValue(), function(result) {
              return self.$results.html(bling("table thead, tbody", function() {
                var attr, f, htr, tx, _i, _j, _len, _len1, _ref, _ref1, _results;
                this.thead.append(htr = bling("tr"));
                _ref = self.txcols;
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                  f = _ref[_i];
                  htr.bappend("td", {
                    text: f
                  });
                }
                _ref1 = result[":tx-data"];
                _results = [];
                for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                  tx = _ref1[_j];
                  attr = false;
                  _results.push(this.tbody.append(bling("tr", function() {
                    var _k, _len2, _ref2, _results1,
                      _this = this;
                    _ref2 = self.txcols;
                    _results1 = [];
                    for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
                      f = _ref2[_k];
                      _results1.push((function(f, tx) {
                        var cell, vattr;
                        _this.tr.append(cell = bling("td", {
                          text: tx[f]
                        }));
                        if (f === ":a") {
                          attr = DatomicIsm.schema.getAttributeById(tx[f]);
                          cell.text(attr.value[":db/ident"]);
                        }
                        if (f === ":v") {
                          vattr = DatomicIsm.schema.getAttributeById(tx[f]);
                          if (vattr) {
                            cell.text(vattr.value[":db/ident"]);
                          }
                        }
                        if ((f === ":e" || f === ":a" || f === ":tx") || (f === ":v" && attr && (attr.value[":db/valueType"] === ":db.type/ref"))) {
                          return cell.addClass("idlink").on({
                            click: function(e) {
                              return DatomicIsm.fetchEntity(tx[f], e);
                            }
                          });
                        }
                      })(f, tx));
                    }
                    return _results1;
                  })));
                }
                return _results;
              }));
            });
          }
        });
      });
      this.$el.resizable({
        resize: function() {
          return _this.sizeRows();
        }
      });
      self.$wrapper.on({
        mousedown: function(e) {
          var el, existingAttr;
          el = $(this);
          if (!el.hasClass("cm-missing")) {
            e.stopPropagation();
            if (existingAttr = DatomicIsm.schema.getAttribute(el.text())) {
              return DatomicIsm.fetchBrowser(existingAttr.paths, e);
            }
          }
        }
      }, ".cm-atom");
      return this;
    };

    TransactView.prototype.postAppend = function() {
      var _this = this;
      this.sizeRows();
      this.editor.setValue(this.model.get("input", ""));
      return DatomicIsm.schema.on("refreshed", function() {
        return _this.refresh();
      });
    };

    return TransactView;

  })(require("./Widget"));

  module.exports = {
    Transact: Transact,
    TransactView: TransactView
  };

}).call(this);

});
require.register("datomicism/lib/widget/Browser.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.1
(function() {
  var Browser, BrowserView, EnumView, NamespaceView, bling, kosherName, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  bling = require("bling");

  _ = require("underscore");

  kosherName = require("../kosherName");

  NamespaceView = require("./Namespace").NamespaceView;

  EnumView = require("./Enum").EnumView;

  Browser = (function(_super) {

    __extends(Browser, _super);

    function Browser() {
      return Browser.__super__.constructor.apply(this, arguments);
    }

    return Browser;

  })(require("./Model"));

  BrowserView = (function(_super) {

    __extends(BrowserView, _super);

    BrowserView.prototype.title = "Browser";

    BrowserView.prototype.className = "browser";

    function BrowserView(model, id) {
      var _this = this;
      this.model = model;
      this.id = id;
      BrowserView.__super__.constructor.call(this, this.model, this.id);
      this.schema = DatomicIsm.schema;
      this.drawAll();
      this.schema.on("refreshed", function() {
        return _this.drawAll();
      });
    }

    BrowserView.prototype.render = function() {
      var self,
        _this = this;
      BrowserView.__super__.render.call(this);
      self = this;
      this.$el.bappend(".cols .col.resources, .col.members, .col.@details", {
        self: self
      }, function() {
        self.$col = this.col;
        this.resources.append(self.$resources = bling("ul"));
        return this.members.append(self.$members = bling("ul"));
      });
      return this.$widget.resizable({
        resize: function() {
          return self.sizeCols();
        }
      });
    };

    BrowserView.prototype.sizeCols = function() {
      var width;
      this.$col.css({
        height: this.$widget.outerHeight() - this.$handle.outerHeight() - 18
      });
      return this.$details.css({
        top: 0,
        left: width = this.$resources.outerWidth() + this.$members.outerWidth() + 3,
        width: this.$widget.outerWidth() - width
      });
    };

    BrowserView.prototype.postAppend = function() {
      return this.sizeCols();
    };

    BrowserView.prototype.drawResource = function(resource, parent, indent) {
      var child, down, els, expanded, fullheight, hasKids, kname, name, right, self, _ref;
      if (indent == null) {
        indent = 0;
      }
      self = this;
      kname = "resource-" + (kosherName(resource.get("path")));
      right = "&#x25BA;";
      down = "&#x25BC;";
      els = {};
      parent.bappend("li .@entry, ul.@children", {
        self: els
      }, function() {
        var _this = this;
        this.entry.text(resource.get("name"));
        this.entry.css({
          paddingLeft: "" + indent + "em"
        });
        this.entry.addClass(kname);
        if (resource.type) {
          this.entry.addClass("type-" + resource.type);
        }
        this.entry.draggable({
          helper: "clone",
          appendTo: "body",
          delay: 200,
          start: function(evt, ui) {
            return ui.helper.css({
              paddingLeft: 5,
              zIndex: 300
            });
          },
          stop: function(evt, ui) {
            var model, view;
            model = self.schema.getNamespace(resource.get("path"));
            if (resource.type === "enum") {
              view = new EnumView(model);
            } else {
              view = new NamespaceView(model);
              model.fetchRecords();
            }
            view.$el.appendTo("body");
            view.$el.css({
              position: "absolute",
              left: ui.position.left,
              top: ui.position.top
            });
            if (typeof view.saveState === "function") {
              view.saveState();
            }
            view.raiseToTop();
            return DatomicIsm.map.drawNodes();
          }
        });
        return this.entry.on({
          click: function() {
            self.model.set("attribute", false);
            self.model.set("resource", kname);
            $(".entry", self.$resources).removeClass("active");
            _this.entry.addClass("active");
            return self.drawMembers(kname, resource.get("attributes"));
          }
        });
      });
      hasKids = false;
      _ref = resource.get("children");
      for (name in _ref) {
        child = _ref[name];
        hasKids = true;
        this.drawResource(child, els.$children, indent + 1);
      }
      if ((parent !== this.$resources) && (!this.selected(kname))) {
        fullheight = els.$children.height();
        els.$children.css({
          height: 0
        });
      }
      if (hasKids) {
        expanded = false;
        return els.$entry.prepend(bling("span.@arrow", {
          self: els,
          html: right,
          on: {
            click: function(e) {
              e.stopPropagation();
              if (expanded) {
                els.$arrow.html(right);
                expanded = false;
                fullheight = els.$children.height();
                return els.$children.css({
                  height: 0
                });
              } else {
                els.$arrow.html(down);
                expanded = true;
                return els.$children.css({
                  height: "auto"
                });
              }
            }
          }
        }));
      } else {
        return els.$entry.prepend(bling("span", {
          html: "&nbsp;"
        }));
      }
    };

    BrowserView.prototype.drawMembers = function(kname, members) {
      var name, self, val, _fn;
      self = this;
      this.$details.html("");
      this.$members.html("");
      _fn = function(name, val) {
        return self.$members.bappend("li .entry", function() {
          var akname,
            _this = this;
          this.entry.text(name);
          akname = kname + ("-attr-" + (kosherName(name)));
          this.entry.addClass(akname);
          this.entry.draggable({
            helper: "clone",
            appendTo: "body",
            delay: 200,
            start: function(evt, ui) {
              return ui.helper.css({
                paddingLeft: 5,
                zIndex: 300
              });
            },
            stop: function(evt, ui) {
              return DatomicIsm.fetchEntity(val[":db/id"], evt);
            }
          });
          this.entry.on({
            click: function() {
              self.model.set("attribute", akname);
              $(".entry", self.$members).removeClass("active");
              _this.entry.addClass("active");
              return self.drawDetails(val);
            }
          });
          if (akname === self.selectedAttribute) {
            return this.entry.click();
          }
        });
      };
      for (name in members) {
        val = members[name];
        _fn(name, val);
      }
      self.sizeCols();
      return this;
    };

    BrowserView.prototype.drawDetails = function(detail) {
      var dn, dv, self;
      self = this;
      self.$details.html("");
      self.sizeCols();
      for (dn in detail) {
        dv = detail[dn];
        if (dn !== ":db/doc") {
          self.$details.bappend(".detail label, span.val", function() {
            this.label.text(_.last(dn.split("/")));
            return this.val.text(dv);
          });
        }
      }
      if (detail[":db/doc"] != null) {
        return self.$details.bappend(".detail.doc label, .val", function() {
          this.label.text("doc");
          return this.val.text(detail[":db/doc"]);
        });
      }
    };

    BrowserView.prototype.selected = function(name) {
      return (this.selectedPath != null) && this.selectedPath.indexOf(name) !== -1;
    };

    BrowserView.prototype.drawAll = function() {
      var path;
      path = this.model.data;
      this.$resources.html("");
      this.$members.html("");
      this.$details.html("");
      this.selectedPath = path.resource;
      this.selectedAttribute = path.attribute;
      this.drawResource(this.schema.get("root"), this.$resources);
      this.sizeCols();
      if (path.resource) {
        return $("." + path.resource, this.$el).click();
      }
    };

    return BrowserView;

  })(require("./Widget"));

  module.exports = {
    Browser: Browser,
    BrowserView: BrowserView
  };

}).call(this);

});
require.register("datomicism/lib/widget/Transact.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.1
(function() {
  var Transact, TransactView, bling,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  bling = require("bling");

  Transact = (function(_super) {

    __extends(Transact, _super);

    function Transact() {
      return Transact.__super__.constructor.apply(this, arguments);
    }

    return Transact;

  })(require("./Model"));

  TransactView = (function(_super) {

    __extends(TransactView, _super);

    function TransactView() {
      return TransactView.__super__.constructor.apply(this, arguments);
    }

    TransactView.prototype.title = "Transact";

    TransactView.prototype.className = "transact";

    TransactView.prototype.txcols = [":e", ":a", ":v", ":tx", ":added"];

    TransactView.prototype.sizeRows = function() {
      var avail, bpos, tbarHeight;
      tbarHeight = this.$handleBar.outerHeight();
      bpos = this.$buttons.position().top - tbarHeight;
      avail = this.$el.outerHeight() - tbarHeight;
      this.$wrapper.css({
        height: bpos
      });
      $(".CodeMirror-scroll", this.$wrapper).css({
        height: bpos
      });
      return this.$results.css({
        height: avail - (bpos + this.$buttons.height() + 19)
      });
    };

    TransactView.prototype.refresh = function() {
      var cur;
      cur = this.editor.getCursor();
      this.editor.setValue(this.editor.getValue());
      return this.editor.setCursor(cur);
    };

    TransactView.prototype.render = function() {
      var self,
        _this = this;
      TransactView.__super__.render.call(this);
      self = this;
      this.$el.bappend(".main textarea, .buttons button.transact", function() {
        var _this = this;
        self.editor = CodeMirror.fromTextArea(this.textarea.get(0), {
          matchBrackets: true,
          mode: {
            name: "datomic",
            hooks: {
              ":": function(keyword) {
                if (keyword === ":db/id") {
                  return " keyword";
                }
                if (DatomicIsm.schema.getAttribute(keyword)) {
                  return " keyword";
                }
                return " keyword missing";
              }
            }
          },
          onChange: function() {
            return self.model.set("input", self.editor.getValue());
          }
        });
        self.$wrapper = $(self.editor.getWrapperElement());
        self.$buttons = this.buttons.draggable({
          axis: "y",
          containment: "parent",
          drag: function() {
            return self.sizeRows();
          },
          stop: function() {
            self.sizeRows();
            return self.model.set("midPaneTop", self.$buttons.position().top);
          }
        });
        self.$buttons.css({
          position: "absolute",
          top: self.model.get("midPaneTop", 150)
        });
        this.buttons.after(self.$results = bling("pre.results"));
        return this.transact.text("Transact").on({
          click: function() {
            self.$results.text("transacting");
            return DatomicIsm.connection.transact(self.editor.getValue(), function(result) {
              return self.$results.html(bling("table thead, tbody", function() {
                var attr, f, htr, tx, _i, _j, _len, _len1, _ref, _ref1, _results;
                this.thead.append(htr = bling("tr"));
                _ref = self.txcols;
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                  f = _ref[_i];
                  htr.bappend("td", {
                    text: f
                  });
                }
                _ref1 = result[":tx-data"];
                _results = [];
                for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                  tx = _ref1[_j];
                  attr = false;
                  _results.push(this.tbody.append(bling("tr", function() {
                    var _k, _len2, _ref2, _results1,
                      _this = this;
                    _ref2 = self.txcols;
                    _results1 = [];
                    for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
                      f = _ref2[_k];
                      _results1.push((function(f, tx) {
                        var cell, vattr;
                        _this.tr.append(cell = bling("td", {
                          text: tx[f]
                        }));
                        if (f === ":a") {
                          attr = DatomicIsm.schema.getAttributeById(tx[f]);
                          cell.text(attr.value[":db/ident"]);
                        }
                        if (f === ":v") {
                          vattr = DatomicIsm.schema.getAttributeById(tx[f]);
                          if (vattr) {
                            cell.text(vattr.value[":db/ident"]);
                          }
                        }
                        if ((f === ":e" || f === ":a" || f === ":tx") || (f === ":v" && attr && (attr.value[":db/valueType"] === ":db.type/ref"))) {
                          return cell.addClass("idlink").on({
                            click: function(e) {
                              return DatomicIsm.fetchEntity(tx[f], e);
                            }
                          });
                        }
                      })(f, tx));
                    }
                    return _results1;
                  })));
                }
                return _results;
              }));
            });
          }
        });
      });
      this.$el.resizable({
        resize: function() {
          return _this.sizeRows();
        }
      });
      self.$wrapper.on({
        mousedown: function(e) {
          var el, existingAttr;
          el = $(this);
          if (!el.hasClass("cm-missing")) {
            e.stopPropagation();
            if (existingAttr = DatomicIsm.schema.getAttribute(el.text())) {
              return DatomicIsm.fetchBrowser(existingAttr.paths, e);
            }
          }
        }
      }, ".cm-atom");
      return this;
    };

    TransactView.prototype.postAppend = function() {
      var _this = this;
      this.sizeRows();
      this.editor.setValue(this.model.get("input", ""));
      return DatomicIsm.schema.on("refreshed", function() {
        return _this.refresh();
      });
    };

    return TransactView;

  })(require("./Widget"));

  module.exports = {
    Transact: Transact,
    TransactView: TransactView
  };

}).call(this);

});
require.register("datomicism/lib/widget/Widget.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.1
(function() {
  var Widget, bling, guid, textInput;

  bling = require("bling");

  guid = require("../guid");

  textInput = require("../Input").textInput;

  Widget = (function() {

    Widget.prototype["class"] = "Widget";

    function Widget(model, id) {
      this.model = model;
      this.id = id;
      if (typeof this.init === "function") {
        this.init();
      }
      this.render();
      if (!this.id) {
        this.id = "widget" + (guid());
      }
    }

    Widget.prototype.sizeTitleBar = function() {
      return this.$widgetNameInput.css({
        width: this.$el.width() - (this.$handle.width() + this.$widgetButtons.width() + 40)
      });
    };

    Widget.prototype.render = function() {
      var pane, prct, self, _fn, _ref,
        _this = this;
      this.model.on("change", function() {
        return _this.saveState();
      });
      self = this;
      this.$el = bling(".widget." + this.className + " .handle .title, .widgetButtons", function() {
        self.$widget = this.widget.attr({
          id: self.id
        });
        self.$handleBar = this.handle;
        self.$handle = this.title.text(self.title);
        this.title.after(self.$widgetNameInput = textInput(self.model, "widgetName"));
        this.widget.draggable({
          handle: ".handle",
          containment: "parent"
        });
        this.widget.on("dragstop.Widget", function() {
          return self.saveState();
        });
        this.widget.on("resizestop.Widget", function() {
          return self.saveState();
        });
        return self.$widgetButtons = this.widgetButtons.bappend("button.close", function() {
          return self.$closeButton = this.close.text("x").on({
            click: function() {
              return self.close();
            }
          });
        });
      });
      this.$el.data("model", this.model);
      this.$el.data("view", this);
      this.$el.on("resize.Widget", function() {
        return _this.sizeTitleBar();
      });
      if (this.panes != null) {
        _ref = this.panes;
        _fn = function(pane, prct) {
          return _this.$el.append(_this["$" + pane] = bling("div"));
        };
        for (pane in _ref) {
          prct = _ref[pane];
          _fn(pane, prct);
        }
      }
      return this.$el.on({
        mousedown: function() {
          return _this.raiseToTop();
        },
        mouseenter: function() {
          _this.$closeButton.uncloak();
          return $(".ui-resizable-handle", _this.$el).uncloak();
        },
        mouseleave: function() {
          _this.$closeButton.cloak();
          return $(".ui-resizable-handle", _this.$el).cloak();
        }
      });
    };

    Widget.prototype.raiseToTop = function() {
      $(".widget").not("#" + this.id).not(".keepOnTop").css({
        zIndex: 1
      });
      return this.$el.css({
        zIndex: 2
      });
    };

    Widget.prototype.saveState = function() {
      var pos, widgets;
      pos = this.$el.position();
      widgets = Storage.get("widgets", {});
      widgets[this.id] = {
        width: this.$el.width(),
        height: this.$el.height(),
        left: pos.left,
        top: pos.top,
        "class": this.className.upperCaseFirst(),
        data: this.data()
      };
      return Storage.set("widgets", widgets);
    };

    Widget.prototype.data = function() {
      if (this.model != null) {
        return this.model.data;
      } else {
        return false;
      }
    };

    Widget.prototype.close = function() {
      var widgets;
      this.$el.remove();
      widgets = Storage.get("widgets", {});
      if (widgets[this.id] != null) {
        delete widgets[this.id];
      }
      return Storage.set("widgets", widgets);
    };

    Widget.prototype.growToContent = function() {
      return this.$widget.css({
        height: this.$widget[0].scrollHeight
      });
    };

    return Widget;

  })();

  module.exports = Widget;

}).call(this);

});
require.register("datomicism/lib/widget/Model.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.1
(function() {
  var Emitter, Model, guid, _;

  _ = require("underscore");

  Emitter = require("emitter");

  guid = require("../guid");

  Model = (function() {

    function Model(data, _isNew) {
      this.data = data != null ? data : {};
      this._isNew = _isNew != null ? _isNew : true;
      this.id = guid();
      this.pendingChanges = {};
      if (typeof this.init === "function") {
        this.init();
      }
      Emitter.call(this);
    }

    Model.prototype.get = function(key, def) {
      var _base;
      if (def == null) {
        def = null;
      }
      return (_base = this.data)[key] || (_base[key] = def);
    };

    Model.prototype.set = function(key, val, force) {
      var cur, event;
      if (force == null) {
        force = false;
      }
      cur = this.data[key];
      if (_.isNumber(cur)) {
        val = Number(val);
      }
      if (cur !== val || force) {
        this.pendingChanges[key] = val;
        this.data[key] = val;
        event = {
          model: this,
          key: key,
          from: cur,
          to: val
        };
        this.emit("change", event);
        return this.emit("change:" + key, event);
      }
    };

    Model.prototype.update = function(newData) {
      var k, v;
      for (k in newData) {
        v = newData[k];
        this.set(k, v);
      }
      return this;
    };

    Model.prototype.isNew = function() {
      return this._isNew;
    };

    Model.prototype.hasPendingChanges = function() {
      return _.size(this.pendingChanges) > 0;
    };

    Model.prototype.description = function() {
      return this.get("widgetName", false);
    };

    Model.prototype.remove = function() {};

    return Model;

  })();

  Emitter(Model.prototype);

  module.exports = Model;

}).call(this);

});
require.register("datomicism/lib/widget/Query.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.1
(function() {
  var Query, QueryView, bling, kosherName, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  bling = require("bling");

  _ = require("underscore");

  kosherName = require("../kosherName");

  Query = (function(_super) {

    __extends(Query, _super);

    function Query() {
      return Query.__super__.constructor.apply(this, arguments);
    }

    return Query;

  })(require("./Model"));

  QueryView = (function(_super) {
    var _parseClause;

    __extends(QueryView, _super);

    function QueryView() {
      return QueryView.__super__.constructor.apply(this, arguments);
    }

    QueryView.prototype.title = "Query";

    QueryView.prototype.className = "query";

    _parseClause = function(clause) {};

    QueryView.prototype.parseQuery = function() {
      var atom, attr, clause, first, last, newValue, parsed, pushOnto, sublast, sym, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _results;
      try {
        newValue = this.editor.getValue();
        parsed = edn.toJS(edn.parse(newValue.trim()[0] === "[" ? newValue : "[" + newValue + "]"));
        this.query = {};
        pushOnto = false;
        for (_i = 0, _len = parsed.length; _i < _len; _i++) {
          atom = parsed[_i];
          if (atom[0] === ":") {
            this.query[atom] = pushOnto = [];
          } else {
            pushOnto.push(atom);
          }
        }
        this.findSymbols = {};
        if (this.query[':find'] != null) {
          this.findSymbols = this.query[':find'];
        }
        this.knownSymbols = {};
        if (this.query[':in'] != null) {
          _ref = _.flatten(this.query[':in']);
          for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
            sym = _ref[_j];
            this.knownSymbols[sym] = true;
          }
        }
        if (!_.isEqual(this.inputs, this.query[':in'])) {
          this.inputs = this.query[':in'];
          this.drawInputs();
        }
        if (this.query[':where'] != null) {
          _ref1 = this.query[':where'];
          _results = [];
          for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
            clause = _ref1[_k];
            if (!(_.isArray(clause))) {
              continue;
            }
            first = _.first(clause);
            if (_.isArray(first)) {
              false;
            } else if (first[0] === "?") {
              if (attr = DatomicIsm.schema.getAttribute(clause[1])) {
                this.knownSymbols[first] = ":db/id";
              } else {
                this.knownSymbols[first] = true;
              }
            }
            last = _.last(clause);
            if (_.isArray(last)) {
              _results.push((function() {
                var _l, _len3, _ref2, _results1;
                _ref2 = _.flatten(last);
                _results1 = [];
                for (_l = 0, _len3 = _ref2.length; _l < _len3; _l++) {
                  sublast = _ref2[_l];
                  _results1.push(this.knownSymbols[sublast] = true);
                }
                return _results1;
              }).call(this));
            } else if (last[0] === "?") {
              if (clause[clause.length - 2][0] === ":") {
                if (attr = DatomicIsm.schema.getAttribute(clause[clause.length - 2])) {
                  _results.push(this.knownSymbols[last] = attr.value[':db/valueType']);
                } else {
                  _results.push(this.knownSymbols[last] = true);
                }
              } else {
                _results.push(void 0);
              }
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        }
      } catch (e) {
        console.log(e);
        return false;
      }
    };

    QueryView.prototype._vector = function(inputs) {
      var self;
      self = this;
      return bling(".vector", function() {
        var item, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = inputs.length; _i < _len; _i++) {
          item = inputs[_i];
          if (_.isArray(item)) {
            _results.push(this.vector.append(self._vector(item)));
          } else {
            _results.push(this.vector.append(bling(".inputWrapper .placeholder, .control", function() {
              var drawCombo,
                _this = this;
              if (item[0] === "$") {
                this.inputWrapper.append(dbCombo(self.model, item));
              } else if (item[0] === "%") {
                drawCombo = function() {
                  var n, name, rules, v, _ref;
                  rules = {};
                  _ref = RulesView.instances;
                  for (n in _ref) {
                    v = _ref[n];
                    if (name = v.model.get("widgetName")) {
                      rules[n] = name;
                    }
                  }
                  return _this.control.html(comboInput(rules, self.model, item));
                };
                drawCombo();
                DatomicIsm.bus.on("rulesChanged", drawCombo);
              } else {
                this.inputWrapper.append(textInput(self.model, item));
              }
              return this.placeholder.text(item);
            })));
          }
        }
        return _results;
      });
    };

    QueryView.prototype._populateVector = function(inputs) {
      var item, self, vec, _fn, _i, _len;
      self = this;
      vec = [];
      _fn = function(item) {
        var itemVal, rules;
        if (_.isArray(item)) {
          return vec.push(self._populateVector(item));
        } else {
          itemVal = self.model.get(item);
          if (item[0] === "$") {
            itemVal = edn.parse(itemVal);
          }
          if (item[0] === "%") {
            rules = RulesView.instances[itemVal].model.get("input");
            itemVal = {
              ednEncode: function() {
                return rules;
              }
            };
          }
          return vec.push(itemVal);
        }
      };
      for (_i = 0, _len = inputs.length; _i < _len; _i++) {
        item = inputs[_i];
        _fn(item);
      }
      return vec;
    };

    QueryView.prototype.drawInputs = function() {
      if ((!_.isArray(this.inputs)) || this.inputs.length === 0) {
        this.$inputs.hide();
        this.$manualInputWrapper.hide();
        this.$inputToggle.cloak();
        this.$details.css({
          height: this.$buttons.outerHeight()
        });
        this.sizeCols();
      } else {
        this.$inputToggle.uncloak();
        if (this.model.get("inputState") === "auto") {
          this.$inputToggle.text("manual input");
          this.$manualInputWrapper.hide();
          this.$inputs.show();
          this.$inputs.html("");
          if (_.isArray(this.inputs)) {
            this.$inputs.html(this._vector(this.inputs));
          }
          this.$details.css({
            height: this.$buttons.outerHeight() + $(".vector", this.$inputes).outerHeight() + 10
          });
          this.sizeCols();
        } else {
          this.$inputToggle.text("auto input");
          this.$manualInputWrapper.show();
          this.$manualInput.setValue(this.$manualInput.getValue());
          this.$inputs.hide();
        }
      }
      return this.sizeCols();
    };

    QueryView.prototype.refresh = function() {
      var cur;
      cur = this.editor.getCursor();
      this.editor.setValue(this.editor.getValue());
      return this.editor.setCursor(cur);
    };

    QueryView.prototype.sizeCols = function() {
      var dheight, dtop, fcols, frow, handleHeight, inputEditorHeight, total;
      handleHeight = this.$handleBar.outerHeight();
      total = this.$el.outerHeight() - handleHeight;
      dheight = this.$details.outerHeight();
      dtop = this.$details.position().top - handleHeight;
      this.$wrapper.css({
        height: dtop
      });
      $(".CodeMirror-scroll", this.$wrapper).css({
        height: dtop
      });
      inputEditorHeight = dheight - this.$buttons.outerHeight() - 12;
      this.$manualInputWrapper.css({
        height: inputEditorHeight
      });
      $(".CodeMirror-scroll", this.$manualInputWrapper).css({
        height: inputEditorHeight
      });
      this.$inputs.css({
        height: inputEditorHeight
      });
      this.$results.css({
        marginTop: dheight,
        height: total - (dtop + dheight)
      });
      this.$details.css({
        width: "100%"
      });
      this.$rowsWrapper.css({
        height: total - (dtop + dheight + this.$cols.outerHeight())
      });
      frow = $("tr", this.$rows).first();
      fcols = $("td", $("tr", this.$cols).first());
      $("td", frow).each(function(i, td) {
        var makeWidth;
        makeWidth = $(td).width();
        return fcols.eq(i).css({
          width: makeWidth
        });
      });
      return this.model.set("midPaneHeight", this.$details.height());
    };

    QueryView.prototype.postAppend = function() {
      var query,
        _this = this;
      DatomicIsm.schema.on("refreshed", function() {
        return _this.refresh();
      });
      query = this.model.get("query");
      if (query) {
        this.editor.setValue(query);
        this.parseQuery();
        this.refresh();
        if (_.size(this.query)) {
          this.runQuery();
        }
      }
      return this.sizeCols();
    };

    QueryView.prototype.runQuery = function() {
      var args, query, self;
      if (!DatomicIsm.schema.loaded) {
        return;
      }
      self = this;
      query = this.editor.getValue().trim();
      if (query[0] !== "[") {
        query = "[" + query + "]";
      }
      args = {};
      if (this.model.get("inputState") === "auto") {
        if (_.isArray(this.inputs)) {
          try {
            args = edn.encode(this._populateVector(this.inputs));
          } catch (e) {
            console.log(e);
          }
        }
      } else {
        args = this.model.get("input", "");
      }
      self.$cols.html("");
      self.$rows.html("");
      self.$queryMsg.text("Querying");
      return DatomicIsm.connection.query(query, args, function(result) {
        var cell, col, dataTypes, i, row, sym, tr, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
        if ((_.isArray(result)) && (_.size(result) > 0)) {
          self.$queryMsg.html("");
          if (self.findSymbols.length === ((_ref = result[0]) != null ? _ref.length : void 0)) {
            self.$cols.append(tr = bling("tr"));
            dataTypes = [];
            _ref1 = self.findSymbols;
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              sym = _ref1[_i];
              dataTypes.push(self.knownSymbols[sym]);
              tr.bappend("td", {
                text: sym
              });
            }
          }
          for (_j = 0, _len1 = result.length; _j < _len1; _j++) {
            row = result[_j];
            self.$rows.append(tr = bling("tr"));
            for (i = _k = 0, _len2 = row.length; _k < _len2; i = ++_k) {
              col = row[i];
              tr.append(cell = bling("td", {
                text: col
              }));
              if ((_ref2 = dataTypes[i]) === ":db/id" || _ref2 === ":db.type/ref") {
                (function(col) {
                  var _this = this;
                  return cell.addClass("idlink").on({
                    click: function(e) {
                      return DatomicIsm.fetchEntity(col, e);
                    }
                  });
                })(col);
              }
            }
          }
        } else {
          self.$queryMsg.text("No Results");
        }
        self.$results.show();
        return self.sizeCols();
      });
    };

    QueryView.prototype.render = function() {
      var editor, oldValue, self, wrapper,
        _this = this;
      QueryView.__super__.render.call(this);
      DatomicIsm.schema.on("refreshed", function() {
        _this.parseQuery();
        return _this.runQuery();
      });
      self = this;
      this.inputs = false;
      this.model.get("inputState", "auto");
      this.$el.bappend(".@main textarea.@editorTextarea, .@details textarea.manualInput, .@inputs, .@buttons button.@inputToggle, button.query", {
        self: this
      }, function() {
        var _this = this;
        this.manualInput.val(self.model.get("input", ""));
        self.$manualInput = CodeMirror.fromTextArea(this.manualInput.get(0), {
          matchBrackets: true,
          extraKeys: {
            "Ctrl-Space": "autocomplete",
            "<": function() {
              return console.log("called");
            }
          },
          mode: "datomic",
          onChange: function() {
            return self.model.set("input", self.$manualInput.getValue());
          }
        });
        self.$manualInputWrapper = $(self.$manualInput.getWrapperElement());
        this.query.text("Query").on({
          click: function() {
            return self.runQuery();
          }
        });
        return this.inputToggle.text("manual input").on({
          click: function() {
            if (self.model.get("inputState") === "auto") {
              self.model.set("inputState", "manual");
            } else {
              self.model.set("inputState", "auto");
            }
            return self.drawInputs();
          }
        });
      });
      this.$details.resizable({
        containment: "parent",
        handles: "n,s",
        resize: function() {
          return self.sizeCols();
        },
        stop: function() {
          self.sizeCols();
          return self.model.set("midPaneHeight", self.$details.height());
        }
      });
      this.$details.draggable({
        containment: "parent",
        axis: "y",
        drag: function() {
          return self.sizeCols();
        },
        stop: function() {
          self.sizeCols();
          return self.model.set("midPaneTop", self.$details.position().top);
        }
      });
      this.$details.css({
        position: "absolute",
        top: this.model.get("midPaneTop", 150),
        height: this.model.get("midPaneHeight", 33)
      }).after(bling(".@results table.@cols, .@rowsWrapper .@queryMsg, table.@rows", {
        self: self
      }));
      this.$el.resizable({
        resize: function() {
          return _this.drawInputs();
        }
      });
      oldValue = "";
      this.knownKeywords = {
        ":find": true,
        ":in": true,
        ":where": true
      };
      this.knownSymbols = {};
      this.findSymbols = [];
      editor = this.editor = CodeMirror.fromTextArea(this.$editorTextarea.get(0), {
        matchBrackets: true,
        mode: {
          name: "datomic",
          hooks: {
            "?": function(symbol) {
              if (_this.knownSymbols[symbol] != null) {
                return " symbol" + (kosherName(symbol));
              }
              return " symbol" + (kosherName(symbol)) + " missing";
            },
            ":": function(keyword) {
              if (_this.knownKeywords[keyword] != null) {
                return " keyword";
              }
              if ($("." + (kosherName(keyword))).length) {
                return " keyword";
              }
              if (DatomicIsm.schema.getAttribute(keyword)) {
                return " keyword";
              }
              return " keyword missing";
            }
          }
        },
        onChange: function() {
          var newValue;
          newValue = editor.getValue();
          if (oldValue === newValue) {
            return;
          }
          _this.model.set("query", newValue);
          _this.parseQuery();
          oldValue = newValue;
          return _this.refresh();
        }
      });
      wrapper = editor.getWrapperElement();
      self.$wrapper = $(wrapper).on({
        mouseenter: function() {
          return $("." + (kosherName($(this).text()))).addClass("tokenActive");
        },
        mouseleave: function() {
          return $("." + (kosherName($(this).text()))).removeClass("tokenActive");
        },
        mousedown: function(e) {
          var el, existingAttr;
          el = $(this);
          if (el.hasClass("cm-missing")) {
            return DatomicIsm.addAttribute(el.text()).$el.css({
              position: "absolute",
              left: self.$el.offset().left + me.width() + 10,
              top: self.$el.offset().top + 10
            });
          } else {
            e.stopPropagation();
            if (existingAttr = DatomicIsm.schema.getAttribute(el.text())) {
              return DatomicIsm.addWidget(Browser, BrowserView, {
                left: e.pageX,
                top: e.pageY
              }, void 0, existingAttr.paths);
            }
          }
        }
      }, ".cm-atom");
      $(wrapper).on({
        mouseenter: function() {
          return $(".cm-symbol" + (kosherName($(this).text())), self.$wrapper).addClass("tokenActive");
        },
        mouseleave: function() {
          return $(".cm-symbol" + (kosherName($(this).text())), self.$wrapper).removeClass("tokenActive");
        }
      }, ".cm-symbol");
      this.drawInputs();
      return this.sizeCols();
    };

    return QueryView;

  })(require("./Widget"));

  module.exports = {
    Query: Query,
    QueryView: QueryView
  };

}).call(this);

});
require.register("datomicism/lib/widget/Entity.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.1
(function() {
  var Entity, EntityView, Enum, bling, textInput, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require("underscore");

  bling = require("bling");

  textInput = require("../Input").textInput;

  Enum = require("./Enum").Enum;

  Entity = (function(_super) {

    __extends(Entity, _super);

    function Entity() {
      return Entity.__super__.constructor.apply(this, arguments);
    }

    return Entity;

  })(require("./Model"));

  EntityView = (function(_super) {

    __extends(EntityView, _super);

    function EntityView() {
      return EntityView.__super__.constructor.apply(this, arguments);
    }

    EntityView.prototype.title = "Entity";

    EntityView.prototype.className = "entity";

    EntityView.prototype.sizeRows = function() {
      return this.$results.css({
        height: this.$el.outerHeight() - this.$searchBy.outerHeight() - this.$handle.outerHeight() - 43 - this.$moreRow.outerHeight() - this.$message.outerHeight(),
        width: this.$el.outerWidth()
      });
    };

    EntityView.prototype.drawControls = function() {
      this._nsCombo(this.$byNS);
      return this.$searchBy.trigger("change");
    };

    EntityView.prototype.growToContent = function() {
      this.$results.css({
        height: this.$results[0].scrollHeight,
        width: this.$results[0].scrollWidth
      });
      this.$el.css({
        height: this.$results[0].scrollHeight + 22 + this.$searchBy.outerHeight() + this.$moreRow.outerHeight() + this.$handleBar.outerHeight()
      });
      return this.sizeRows();
    };

    EntityView.prototype._nsCombo = function(control) {
      var combo, handleNode;
      combo = control || bling("select");
      combo.html("").bappend("option", {
        value: "--",
        text: "Namespace"
      });
      handleNode = function(node, indent) {
        var n, r, _ref, _results;
        if (indent == null) {
          indent = 0;
        }
        combo.append(bling("option", {
          value: node.get("path"),
          html: Array(indent + 1).join("&nbsp;&nbsp;") + node.get("name")
        }));
        _ref = node.get("children");
        _results = [];
        for (n in _ref) {
          r = _ref[n];
          _results.push(handleNode(r, indent + 1));
        }
        return _results;
      };
      handleNode(DatomicIsm.schema.get("root"));
      return combo;
    };

    EntityView.prototype._refBrowser = function(entity, dn, dv) {
      var self;
      self = this;
      return bling(".refinput input, button.browse", function() {
        var _this = this;
        this.input.prop({
          name: dn
        }).val(dv[":db/id"]);
        this.input.numeric({
          negative: false
        });
        this.button.after(self._removeButton(this.refinput, this.input));
        return this.browse.text("...").on({
          click: function(e) {
            var widget;
            widget = DatomicIsm.fetchEntity(_this.input.val(), e);
            widget.view.$message.text("The next entity you select will be used as ref for " + entity[":db/id"] + "/" + dn);
            return widget.view.onSelect = function(ns, ent) {
              _this.input.val(ent[":db/id"]);
              return widget.view.close();
            };
          }
        });
      });
    };

    EntityView.prototype._removeButton = function(holder, control) {
      return bling("button.remove", function() {
        var _this = this;
        return this.remove.text("x").on({
          click: function() {
            if (holder.hasClass("newValue")) {
              holder.remove();
              return DatomicIsm.bus.emit("newAttribute.removed");
            } else {
              if (control.hasClass("removed")) {
                control.removeClass("removed").attr({
                  disabled: null
                });
                return _this.remove.text("x");
              } else {
                control.addClass("removed").attr({
                  disabled: true
                });
                return _this.remove.html("&#8624;");
              }
            }
          }
        });
      });
    };

    EntityView.prototype._attrValue = function(entity, dn, dv, type) {
      var self;
      self = this;
      return bling(".inputHolder input", function() {
        if (type === ":db.type/boolean") {
          this.input.prop({
            type: "checkbox"
          });
          if (dv) {
            this.input.prop({
              checked: true
            });
          }
        }
        if (type === ":db.type/long") {
          this.input.numeric();
        }
        if (type === ":db.type/double") {
          this.input.numeric({
            decimal: "."
          });
        }
        return this.input.attr({
          value: dv,
          name: dn
        }).after(self._removeButton(this.inputHolder, this.input));
      });
    };

    EntityView.prototype.drawEntity = function(entity, appendTo, subcnt) {
      var buttons, dn, dv, editing, newAttrs, newEntity, ns, nslis, nsul, result, self, vals, _fn,
        _this = this;
      if (subcnt == null) {
        subcnt = 1;
      }
      self = this;
      appendTo || (appendTo = self.$results);
      if (_.isObject(entity)) {
        appendTo.append(result = bling(".result"));
        if (entity[":db/id"] != null) {
          result.addClass("entity entity-" + entity[":db/id"]);
          result.bappend(".detail label, span.val", function() {
            var _this = this;
            this.label.text("id");
            this.val.text(entity[":db/id"]);
            return this.val.addClass("idlink").on({
              click: function(e) {
                return DatomicIsm.fetchEntity(entity[":db/id"], e);
              }
            });
          });
        }
        ns = false;
        if (entity.newEntity) {
          ns = ":" + entity.newEntity;
          newEntity = true;
          delete entity.newEntity;
        }
        nslis = {};
        vals = {};
        newAttrs = {};
        result.append(nsul = bling("ul.namespaces"));
        _fn = function(dn, dv) {
          var attName, _ref;
          _ref = dn.split("/"), ns = _ref[0], attName = _ref[1];
          if (nslis[ns] == null) {
            nsul.append(bling("li span.nsname, ul", function() {
              this.span.text(ns.slice(1));
              this.span.addClass("link").on({
                click: function(e) {
                  return DatomicIsm.fetchBrowser({
                    resource: "resource-" + ns.slice(1)
                  }, e);
                }
              });
              return nslis[ns] = this.ul;
            }));
          }
          return nslis[ns].bappend("li.detail label, span.val, .valWrite", function() {
            var addButton, attr, attrType, ref, v, _fn1, _i, _j, _len, _len1,
              _this = this;
            this.detail.draggable({
              handle: "label",
              helper: "clone",
              appendTo: "body",
              start: function(e, ui) {
                ui.helper.prepend(bling(".entityId", {
                  html: "entity&nbsp;" + entity[":db/id"]
                }));
                return ui.helper.css({
                  zIndex: 6000
                });
              },
              stop: function(e) {
                return DatomicIsm.fetchDatom(entity[":db/id"], dn, e);
              }
            });
            vals[dn] = {
              read: this.val,
              write: this.valWrite.hide()
            };
            this.label.text(attName);
            attrType = false;
            if (attr = DatomicIsm.schema.getAttribute(dn)) {
              (function(attr) {
                attrType = attr.value[':db/valueType'];
                return _this.label.addClass("idlink").on({
                  click: function(e) {
                    return DatomicIsm.fetchEntity(attr.value[':db/id'], e);
                  }
                });
              })(attr);
            }
            if (_.isArray(dv)) {
              if (attrType === ":db.type/ref") {
                _fn1 = function(v) {
                  if (!_.isObject(v)) {
                    v = DatomicIsm.schema.getAttribute(v).value;
                  }
                  _this.val.bappend("span.idlink, span.spacer", function() {
                    this.spacer.text(" ");
                    return this.idlink.text(v[":db/ident"] || v[":db/id"]).on({
                      click: function(e) {
                        return DatomicIsm.fetchEntity(v[":db/id"], e);
                      }
                    });
                  });
                  return _this.valWrite.append(self._refBrowser(entity, dn, v));
                };
                for (_i = 0, _len = dv.length; _i < _len; _i++) {
                  v = dv[_i];
                  _fn1(v);
                }
                this.valWrite.append(addButton = bling("button.add"));
                return addButton.text("+").on({
                  click: function() {
                    return addButton.before((self._refBrowser(entity, dn, {})).addClass("newValue"));
                  }
                });
              } else {
                this.val.text(dv.join(", "));
                for (_j = 0, _len1 = dv.length; _j < _len1; _j++) {
                  v = dv[_j];
                  this.valWrite.append(self._attrValue(entity, dn, v, attrType));
                }
                this.valWrite.append(addButton = bling("button.add"));
                return addButton.text("+").on({
                  click: function() {
                    return addButton.before((self._attrValue(entity, dn, "", attrType)).addClass("newValue"));
                  }
                });
              }
            } else if (_.isObject(dv)) {
              if (dv[":db/id"] != null) {
                this.val.text(dv[":db/id"]).addClass("entityLink").on({
                  click: function(e) {
                    return DatomicIsm.fetchEntity(dv[":db/id"], e);
                  }
                });
                this.valWrite.append(self._refBrowser(entity, dn, dv));
                return DatomicIsm.connection.getEntity(dv[":db/id"], function(ent) {
                  var k, _results;
                  _results = [];
                  for (k in ent) {
                    v = ent[k];
                    if (!(_.last(k.split("/")) === "name")) {
                      continue;
                    }
                    _this.val.text("" + dv[":db/id"] + " (" + v + ")");
                    break;
                  }
                  return _results;
                });
              } else {
                return this.val.text(JSON.stringify(dv));
              }
            } else {
              this.val.text(dv);
              if ((attrType === ":db.type/ref") && (ref = DatomicIsm.schema.getAttribute(dv))) {
                return (function(ref) {
                  var enumAttrs, enumNS;
                  _this.val.addClass("idlink").on({
                    click: function(e) {
                      return DatomicIsm.fetchEntity(ref.value[":db/id"], e);
                    }
                  });
                  if (ref.type === "enum" && (enumNS = _.first(dv.slice(1).split("/"))) && (enumAttrs = DatomicIsm.schema.getNamespace(enumNS))) {
                    return _this.valWrite.bappend(".inputHolder select optgroup", function() {
                      var _k, _len2, _ref1;
                      this.select.prop({
                        name: dn
                      });
                      this.optgroup.attr({
                        label: enumNS
                      });
                      _ref1 = enumAttrs.attributes;
                      for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
                        attr = _ref1[_k];
                        this.optgroup.bappend("option", {
                          value: attr.get(":db/id"),
                          text: attr.get("name")
                        });
                      }
                      return this.select.val(ref.value[":db/id"]).after(self._removeButton(this.inputHolder, this.select));
                    });
                  } else {
                    return _this.valWrite.append(self._refBrowser(entity, dn, dv));
                  }
                })(ref);
              } else {
                return this.valWrite.append(self._attrValue(entity, dn, dv, attrType));
              }
            }
          });
        };
        for (dn in entity) {
          dv = entity[dn];
          if (!(dn !== ":db/id")) {
            continue;
          }
          if (dn[0] !== ":") {
            continue;
          }
          _fn(dn, dv);
        }
        result.bappend(".@buttons button.@edit, button.@addAttribute, button.@cancel, button.@transact, button.@retract", {
          self: buttons = {}
        });
        editing = false;
        buttons.$edit.text("edit").cloak().on({
          click: function() {
            var val;
            editing = true;
            for (dn in vals) {
              val = vals[dn];
              val.read.hide();
              val.write.show();
            }
            buttons.$edit.hide();
            buttons.$addAttribute.show();
            buttons.$cancel.show();
            buttons.$transact.show();
            return buttons.$retract.show();
          }
        });
        if (!entity[":db/id"]) {
          buttons.$retract.remove();
        }
        buttons.$retract.text("retract entity").css({
          float: "right",
          marginRight: 20
        }).hide().on({
          click: function() {
            return DatomicIsm.connection.transact(edn.encode([[":db.fn/retractEntity", entity[":db/id"]]]));
          }
        });
        buttons.$addAttribute.text("add attribute").hide().on({
          click: function() {
            return buttons.$buttons.before(bling(".inputHolder.newAttribute.newValue", function() {
              var attrs, input, newAttributeLabel, select, valInputs,
                _this = this;
              this.inputHolder.append(newAttributeLabel = bling("span", {
                text: "New Attribute"
              }), select = self._nsCombo(), attrs = bling("select"), input = bling(".newAttrWrapper"), self._removeButton(this.inputHolder).on("click.rowItem", function() {
                return delete newAttrs[attrs.val()];
              }), valInputs = bling(".valInputs"));
              attrs.hide().on({
                change: function() {
                  var addButton, attrDetails, ctrl, val;
                  if (attrs.val() === "---") {
                    return valInputs.html("");
                  }
                  attrDetails = DatomicIsm.schema.getAttribute(attrs.val());
                  if (attrDetails.value[":db/valueType"] === ":db.type/ref") {
                    ctrl = "_refBrowser";
                    val = {};
                  } else {
                    ctrl = "_attrValue";
                    val = "";
                  }
                  newAttrs[attrs.val()] = _this.inputHolder;
                  DatomicIsm.bus.on("newAttribute.removed", function() {
                    if ($(".inputHolder, .refinput", valInputs).length === 0) {
                      return attrs.val("---").trigger("change");
                    }
                  });
                  valInputs.html((self[ctrl]({}, attrDetails.value[":db/ident"], val, attrDetails.value[":db/valueType"])).addClass("newValue"));
                  if (attrDetails.value[":db/cardinality"] === ":db.cardinality/many") {
                    valInputs.append(addButton = bling("button"));
                    addButton.text("+").on({
                      click: function() {
                        return addButton.before((self[ctrl]({}, attrDetails.value[":db/ident"], val, attrDetails.value[":db/valueType"])).addClass("newValue"));
                      }
                    });
                  } else {
                    $("button.remove", valInputs).remove();
                  }
                  newAttributeLabel.text("" + (attrs.val()) + "  (" + attrDetails.value[":db/valueType"] + ")");
                  select.remove();
                  attrs.remove();
                  return $('option[value="' + attrs.val() + '"]', result).remove();
                }
              });
              select.on({
                change: function() {
                  if (select.val() === "--") {
                    return;
                  }
                  ns = ":" + (select.val());
                  return (function(ns) {
                    var attr, _i, _len, _ref, _results;
                    attrs.html(bling("option", {
                      text: "---",
                      value: "---"
                    }));
                    attrs.hide();
                    if (!ns.isEnum) {
                      _ref = ns.attributes;
                      _results = [];
                      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        attr = _ref[_i];
                        if (!((entity[attr.data[":db/ident"]] == null) && !newAttrs[attr.data[":db/ident"]])) {
                          continue;
                        }
                        attrs.show();
                        _results.push(attrs.append(bling("option", {
                          value: attr.data[":db/ident"],
                          text: attr.data[":db/ident"].replace(":" + (select.val()) + "/", "")
                        })));
                      }
                      return _results;
                    }
                  })(DatomicIsm.schema.getNamespace(select.val()));
                }
              });
              if (ns) {
                return select.val(ns.slice(1)).trigger("change");
              }
            }));
          }
        });
        buttons.$cancel.text("cancel").hide().on({
          click: function() {
            var attr, val;
            editing = false;
            for (dn in vals) {
              val = vals[dn];
              val.write.hide();
              val.read.show();
            }
            for (dn in newAttrs) {
              attr = newAttrs[dn];
              attr.remove();
              delete newAttrs[dn];
            }
            $(".newAttribute", result).remove();
            buttons.$cancel.hide();
            buttons.$addAttribute.hide();
            buttons.$transact.hide();
            buttons.$retract.hide();
            return buttons.$edit.show();
          }
        });
        buttons.$transact.text("transact").hide().on({
          click: function() {
            var $input, eid, input, transaction, value, _i, _len, _ref;
            if (!entity[":db/id"]) {
              eid = new edn.Tagged(new edn.Tag("db/id"), new edn.Vector([":db.part/user", -1]));
            } else {
              eid = entity[":db/id"];
            }
            transaction = [];
            _ref = $("input[name], select[name]", result);
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              input = _ref[_i];
              $input = $(input);
              value = $input.is("[type=checkbox]") ? $input.is(":checked") : $input.val();
              transaction.push([$input.hasClass("removed") ? ":db/retract" : ":db/add", eid, $input.prop("name"), value]);
            }
            return DatomicIsm.connection.transact(edn.encode(transaction), function() {
              return console.log(arguments);
            });
          }
        });
        result.on({
          mouseenter: function() {
            if (!editing) {
              return buttons.$edit.uncloak();
            }
          },
          mouseleave: function() {
            return buttons.$edit.cloak();
          }
        });
        if (newEntity) {
          buttons.$edit.click();
        }
        if (self.onSelect != null) {
          return result.bappend("button", {
            text: "Use Entity",
            on: {
              mouseup: function() {
                return self.onSelect(dn.split("/")[0], entity);
              }
            }
          });
        }
      }
    };

    EntityView.prototype.render = function() {
      var self;
      EntityView.__super__.render.call(this);
      self = this;
      this.$el.resizable().bappend(".searchForm .@message, select.searchBy, input.byId, select.byNS, button.newEntity, .results, .moreRow button.more", {
        self: self
      }, function() {
        var n, ns, offset, searchBy, size, total, v, _ref,
          _this = this;
        self.$searchForm = this.searchForm;
        self.$results = this.results;
        self.$moreRow = this.moreRow;
        self.$searchBy = this.searchBy;
        self.$newEntity = this.newEntity;
        this.newEntity.text("new entity").on({
          click: function() {
            self.$results.html(bling("h1", {
              text: "New Entity"
            }));
            console.log(_this.byNS.val());
            return self.drawEntity({
              newEntity: _this.byNS.val()
            });
          }
        });
        this.searchBy.bappend("option", {
          value: "--",
          text: "Search By"
        });
        _ref = {
          byId: "entity id",
          namespace: "namespace"
        };
        for (v in _ref) {
          n = _ref[v];
          this.searchBy.bappend("option", {
            value: v,
            html: "&nbsp;&nbsp;" + n
          });
        }
        offset = 0;
        total = 0;
        size = 4;
        ns = false;
        this.more.text("more").on({
          click: function() {
            _this.more.text("loading").attr({
              disabled: true
            });
            offset++;
            return ns.fetchRecords((function(records) {
              var count, entity, _i, _len, _results;
              count = (size + 1) * (offset + 1);
              if (count >= total) {
                _this.more.cloak();
              } else {
                _this.more.text("more (" + count + "/" + total + ")").attr({
                  disabled: false
                });
              }
              _results = [];
              for (_i = 0, _len = records.length; _i < _len; _i++) {
                entity = records[_i];
                _results.push(self.drawEntity(entity.data));
              }
              return _results;
            }), offset, size);
          }
        });
        this.byNS.on({
          change: function() {
            var att, _i, _len, _ref1, _results;
            if (!DatomicIsm.schema.loaded) {
              return;
            }
            if (_this.byNS.val() === "--") {
              return;
            }
            self.model.set("byNS", _this.byNS.val());
            ns = DatomicIsm.schema.getNamespace(_this.byNS.val());
            if (ns instanceof Enum) {
              self.$results.html("");
              _this.more.cloak();
              _ref1 = ns.attributes;
              _results = [];
              for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                att = _ref1[_i];
                _results.push(self.drawEntity(att.data));
              }
              return _results;
            } else {
              self.$results.html("fetching");
              return ns.fetchRecords(function(records) {
                var entity, _j, _len1;
                self.$results.html("");
                offset = 0;
                total = ns.entities.length;
                _this.more.attr({
                  disabled: false
                });
                if (total === 1) {
                  _this.more.cloak();
                }
                for (_j = 0, _len1 = records.length; _j < _len1; _j++) {
                  entity = records[_j];
                  self.drawEntity(entity.data);
                }
                if ((size + 1) < total) {
                  return _this.more.text("more (" + (size + 1) + "/" + total + ")").uncloak();
                }
              });
            }
          }
        });
        this.byId.numeric({
          negative: false
        });
        this.byId.on({
          keyup: function() {
            if (!DatomicIsm.schema.loaded) {
              return;
            }
            self.model.set("byId", _this.byId.val().trim());
            if (_this.byId.val().trim().length === 0) {
              return;
            }
            self.$results.html("fetching");
            return DatomicIsm.connection.getEntity(_this.byId.val(), function(entity) {
              self.$results.html("");
              self.drawEntity(entity);
              return self.growToContent();
            });
          }
        });
        this.byNS.hide();
        this.byId.hide();
        self.$searchBy = this.searchBy.on({
          change: function() {
            self.model.set("searchBy", _this.searchBy.val());
            self.$results.html("");
            _this.more.cloak();
            switch (_this.searchBy.val()) {
              case "--":
                _this.byNS.hide();
                return _this.byId.hide();
              case "byId":
                _this.byNS.hide();
                _this.byId.show().val("");
                _this.byId.val(self.model.get("byId"));
                return _this.byId.trigger("keyup");
              case "namespace":
                _this.byId.hide();
                _this.byNS.show();
                _this.byNS.val(self.model.get("byNS", "--"));
                return _this.byNS.trigger("change");
            }
          }
        });
        self.$byNS = this.byNS;
        if (searchBy = self.model.get("searchBy")) {
          this.searchBy.val(searchBy);
        }
        self.drawControls();
        DatomicIsm.schema.on("refreshed", function() {
          self.drawControls();
          if (searchBy) {
            return _this.searchBy.val(searchBy);
          }
        });
        return this.searchBy.trigger("change");
      });
      return this.$el.on("resize.Entity", function() {
        return self.sizeRows();
      });
    };

    EntityView.prototype.postAppend = function() {
      return this.sizeRows();
    };

    return EntityView;

  })(require("./Widget"));

  module.exports = {
    Entity: Entity,
    EntityView: EntityView
  };

}).call(this);

});
require.alias("component-underscore/index.js", "datomicism/deps/underscore/index.js");
require.alias("component-underscore/index.js", "underscore/index.js");

require.alias("component-emitter/index.js", "datomicism/deps/emitter/index.js");
require.alias("component-emitter/index.js", "emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("shaunxcode-jsedn/index.js", "datomicism/deps/jsedn/index.js");
require.alias("shaunxcode-jsedn/index.js", "jsedn/index.js");
require.alias("component-underscore/index.js", "shaunxcode-jsedn/deps/underscore/index.js");

require.alias("shaunxcode-bling/index.js", "datomicism/deps/bling/index.js");
require.alias("shaunxcode-bling/index.js", "bling/index.js");
require.alias("component-underscore/index.js", "shaunxcode-bling/deps/underscore/index.js");

require.alias("shaunxcode-CartographicSurface/index.js", "datomicism/deps/CartographicSurface/index.js");
require.alias("shaunxcode-CartographicSurface/index.js", "CartographicSurface/index.js");
require.alias("shaunxcode-bling/index.js", "shaunxcode-CartographicSurface/deps/bling/index.js");
require.alias("component-underscore/index.js", "shaunxcode-bling/deps/underscore/index.js");

require.alias("shaunxcode-sketch/index.js", "datomicism/deps/sketch/index.js");
require.alias("shaunxcode-sketch/point.js", "datomicism/deps/sketch/point.js");
require.alias("shaunxcode-sketch/path.js", "datomicism/deps/sketch/path.js");
require.alias("shaunxcode-sketch/index.js", "sketch/index.js");
require.alias("component-classes/index.js", "shaunxcode-sketch/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-color-picker/index.js", "datomicism/deps/color-picker/index.js");
require.alias("component-color-picker/template.js", "datomicism/deps/color-picker/template.js");
require.alias("component-color-picker/index.js", "color-picker/index.js");
require.alias("component-jquery/index.js", "component-color-picker/deps/jquery/index.js");

require.alias("component-autoscale-canvas/index.js", "component-color-picker/deps/autoscale-canvas/index.js");

require.alias("component-emitter/index.js", "component-color-picker/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

