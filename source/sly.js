/*!
 * Sly v1.0rc1 <http://sly.digitarald.com> 
 * (C) 2009 Harald Kirschner <http://digitarald.de>
 * Open source under MIT License 
*/

var Sly = (function() {

var cache = {};

/**
 * Sly::constructor
 */
var Sly = function(text) {
	return cache[text] || (cache[text] = new Sly.initialize(text));
};

Sly.initialize = function(text) {
	// normalise
	this.text = (typeof(text) == 'string') ? text.replace(/^\s+/, '') : '';
};

var proto = Sly.initialize.prototype = Sly.prototype;


/**
 * Sly.implement
 */
Sly.implement = function(key, properties) {
	for (var prop in properties) Sly[key][prop] = properties[prop];
};


/**
 * Sly.support
 *
 * Filled with experiment results.
 */
var support = Sly.support = {};

// Checks similar to NWMatcher, Sizzle
(function() {
	
	// Our guinea pig
	var testee = document.createElement('div'), id = (new Date()).getTime();
	testee.innerHTML = '<a name="' + id + '" class="Â b"></a>';
	testee.appendChild(document.createComment(''));
	
	// IE returns comment nodes for getElementsByTagName('*')
	support.byTagAddsComments = (testee.getElementsByTagName('*').length > 1);
	
	// Safari can't handle uppercase or unicode characters when in quirks mode.
	support.hasQsa = !!(testee.querySelectorAll && testee.querySelectorAll('.Â').length);
	
	support.hasByClass = (function() {
		if (!testee.getElementsByClassName || !testee.getElementsByClassName('b').length) return false;
		testee.firstChild.className = 'c';
		return (testee.getElementsByClassName('c').length == 1);
	})();
	
	var root = document.documentElement;
	root.insertBefore(testee, root.firstChild);
	
	// IE returns named nodes for getElementById(name)
	support.byIdAddsName = !!(document.getElementById(id));
	
	root.removeChild(testee);
	
})();


var locateFast = function() {
	return true;
};

/**
 * Sly::search
 */
proto.search = function(context, unordered) {
	var iterate;

	if (!context) {
		context = document;
	} else {
		//console.log(this.text, context);
		if (typeof(context) == 'string') {
			context = Sly.search(context);
			iterate = true;
		} else if (typeof(context.length) == 'number' && typeof(context) != 'function') {
			if (context.length == 1) context = context[0];
			else iterate = true;
		}
	}

	var results; // overall result

	if (support.hasQsa && !iterate && context.nodeType == 9) {
		try {
			results = context.querySelectorAll(this.text);
		} catch(e) {}
		if (results) return Sly.toArray(results);
	}

	var parsed = this.parse();
	if (!parsed.length) return [];

	var unsorted, // results need to be sorted, comma
		current = {}, // unique ids for one iteration process
		combined, // found nodes from one iteration process
		nodes, // context nodes from one iteration process
		all = {}, // unique ids for overall result
		state = {}; // matchers temporary state

	// unifiers
	var getUid = Sly.getUid;
	var locateCurrent = function(node) {
		var uid = getUid(node);
		return (current[uid]) ? null : (current[uid] = true);
	};

	for (var i = 0, selector; (selector = parsed[i]); i++) {

		var locate = locateCurrent;

		if (selector.first) {
			if (!results) locate = locateFast;
			else unsorted = true;
			if (iterate) nodes = context;
			else if (selector.combinator) nodes = [context]; // allows combinators before selectors
		}

		if (selector.last && results) {
			current = all;
			combined = results;
		} else {
			// default stack
			current = {};
			combined = [];
		}

		if (!selector.combinator && !iterate) {
			// without prepended combinator
			combined = selector.combine(combined, context, selector, state, locate, !(combined.length));
		} else {
			// with prepended combinators
			for (var k = 0, l = nodes.length; k < l; k++) {
				combined = selector.combine(combined, nodes[k], selector, state, locate);
			}
		}
		if (selector.last) {
			if (!combined) alert(selector.combinator);
			if (combined.length) results = combined;
		} else {
			nodes = combined;
		}
	}

	if (!unordered && unsorted && results) results.sort(Sly.compare);

	return results || [];
};

/**
 * Sly::find
 */
proto.find = function(context) {
	return this.search(context)[0];
};


/**
 * Sly::match
 */
proto.match = function(node, parent) {
	var parsed = this.parse();
	if (parsed.length == 1) return !!(this.parse()[0].match(node, {}));
	if (!parent) {
		parent = node;
		while (parent.parentNode) parent = parent.parentNode
	}
	var found = this.search(parent), i = found.length;
	if (!i--) return false;
	while (i--) {
		if (found[i] == node) return true;
	}
	return false;
};


/**
 * Sly::filter
 */
proto.filter = function(nodes) {
	var results = [], match = this.parse()[0].match;
	for (var i = 0, node; (node = nodes[i]); i++) {
		if (match(node)) results.push(node);
	}
	return results;
};


/**
 * Sly.recompile()
 */
var pattern;

Sly.recompile = function() {

	var key, combList = [','], operList = ['!'];

	for (key in combinators) {
		if (key != ' ') {
			combList[(key.length > 1) ? 'unshift' : 'push'](Sly.escapeRegExp(key));
		}
	}
	for (key in operators) operList.push(key);

	/**
	  The regexp is a group of every possible selector part including combinators.
	  "|" separates the possible selectors.

		Capturing parentheses:
		1 - Combinator (only requires to allow multiple-character combinators)
		2 - Attribute name
		3 - Attribute operator
		4, 5, 6 - The value
		7 - Pseudo name
		8, 9, 10 - The value
	 */

	pattern = new RegExp(
		// A tagname
		'[\\w\\u00a1-\\uFFFF][\\w\\u00a1-\\uFFFF-]*|' +

		// An id or the classname
		'[#.](?:[\\w\\u00a1-\\uFFFF-]|\\\\:|\\\\.)+|' +

		// Whitespace (descendant combinator)
		'[ \\t\\r\\n\\f](?=[\\w\\u00a1-\\uFFFF*#.[:])|' +

		// Other combinators and the comma
		'[ \\t\\r\\n\\f]*(' + combList.join('|') + ')[ \\t\\r\\n\\f]*|' +

		// An attribute, with the various and optional value formats ([name], [name=value], [name="value"], [name='value']
		'\\[([\\w\\u00a1-\\uFFFF-]+)[ \\t\\r\\n\\f]*(?:([' + operList.join('') + ']?=)[ \\t\\r\\n\\f]*(?:"([^"]*)"|\'([^\']*)\'|([^\\]]*)))?]|' +

		// A pseudo-class, with various formats
		':([-\\w\\u00a1-\\uFFFF]+)(?:\\((?:"([^"]*)"|\'([^\']*)\'|([^)]*))\\))?|' +

		// The universial selector, not process
		'\\*|(.+)', 'g'
	);
};


// I prefer it outside, not sure if this is faster
var create = function(combinator) {
	return {
		ident: [],
		classes: [],
		attributes: [],
		pseudos: [],
		combinator: combinator
	};
};

var blank = function($0) {
	return $0;
};

/**
 * Sly::parse
 *
 * Returns an array with one object for every selector:
 *
 * {
 *   tag: (String) Tagname (defaults to null for universal *)
 *   id: (String) Id
 *   classes: (Array) Classnames
 *   attributes: (Array) Attribute objects with "name", "operator" and "value"
 *   pseudos: (Array) Pseudo objects with "name" and "value"
 *   operator: (Char) The prepended operator (not comma)
 *   first: (Boolean) true if it is the first selector or the first after a comma
 *   last: (Boolean) true if it is the last selector or the last before a comma
 *   ident: (Array) All parsed matches, can be used as cache identifier.
 * }
 */
proto.parse = function(plain) {
	var save = (plain) ? 'plain' : 'parsed';
	if (this[save]) return this[save];

	var compute = (plain) ? blank : this.compute;

	var parsed = [], current = create(null);
	current.first = true;

	var refresh = function(combinator) {
		parsed.push(compute(current));
		current = create(combinator);
	};

	var match, $0;

	while ((match = pattern.exec(this.text))) {
		$0 = match[0];

		switch ($0.charAt(0)) {
			case '.':
				current.classes.push($0.slice(1).replace(/\\/g, ''));
				break;
			case '#':
				current.id = $0.slice(1).replace(/\\/g, '');
				break;
			case '[':
				current.attributes.push({
					name: match[2],
					operator: match[3] || null,
					value: match[4] || match[5] || match[6] || null
				});
				break;
			case ':':
				current.pseudos.push({
					name: match[7],
					value: match[8] || match[9] || match[10] || null
				});
				break;
			case ' ': case '\t': case '\r': case '\n': case '\f':
				match[1] = match[1] || ' ';
			default:
				var combinator = match[1];
				if (combinator) {
					if (combinator == ',') {
						current.last = true;
						refresh(null);
						current.first = true;
						continue;
					}
					if (current.first && !current.ident.length) current.combinator = combinator;
					else refresh(combinator);
				} else {
					if (match[11]) {
						if (Sly.verbose) throw Error('Syntax error in "' + this.text + '", unexpected character <' + $0 + '> at #' + pattern.lastIndex + ' ');
						return (this[save] = []);
					}
					if ($0 != '*') current.tag = $0;
				}
		}
		current.ident.push($0);
	}

	current.last = true;
	parsed.push(compute(current));

	return (this[save] = parsed);
};


// chains two given functions

function chain(prepend, append, aux, unshift) {
	var fn = (prepend) ? ((unshift) ? function(node, state) {
		return append(node, aux, state) && prepend(node, state);
	} : function(node, state) {
		return prepend(node, state) && append(node, aux, state);
	}) : function(node, state) {
		return append(node, aux, state);
	};
	fn.$slyIndex = (prepend) ? (prepend.$slyIndex + 1) : 0;
	return fn;
};


// prepared match comperators, probably needs namespacing
var empty = function() {
	return true;
};

var matchId = function(node, id) {
	return (node.id == id);
};

var matchTag = function(node, tag) {
	return (node.nodeName.toUpperCase() == tag);
};

var prepareClass = function(name) {
	return (new RegExp('(?:^|[ \\t\\r\\n\\f])' + name + '(?:$|[ \\t\\r\\n\\f])'));
};

var matchClass = function(node, expr) {
	return node.className && expr.test(node.className);
};

var prepareAttribute = function(attr) {
	if (!attr.operator || !attr.value) return attr;
	var parser = operators[attr.operator];
	if (parser) { // @todo: Allow functions, not only regex
		attr.escaped = Sly.escapeRegExp(attr.value);
		attr.pattern = new RegExp(parser(attr.value, attr.escaped, attr));
	}
	return attr;
};

var matchAttribute = function(node, attr) {
	var read = Sly.getAttribute(node, attr.name);
	switch (attr.operator) {
		case null: return read;
		case '=': return (read == attr.value);
		case '!=': return (read != attr.value);
	}
	if (!read && attr.value) return false;
	return attr.pattern.test(read);
};


/**
 * Sly::compute
 *
 * Attaches the following methods to the selector object:
 *
 * {
 *   search: Uses the most convinient properties (id, tag and/or class) of the selector as search.
 *   matchAux: If search does not contain all selector properties, this method matches an element against the rest.
 *   match: Matches an element against all properties.
 *   simple: Set when matchAux is not needed.
 *   combine: The callback for the combinator
 * }
 */
proto.compute = function(selector) {

	var i, item, match, search, matchSearch, tagged,
		tag = selector.tag,
		id = selector.id,
		classes = selector.classes;

	var nodeName = (tag) ? tag.toUpperCase() : null;

	if (id) {
		tagged = true;

		matchSearch = chain(null, matchId, id);

		search = function(context) {
			if (context.getElementById) {
				var el = context.getElementById(id);
				return (el
					&& (!nodeName || el.nodeName.toUpperCase() == nodeName)
					&& (!support.getIdAdds || el.id == id))
						? [el]
						: [];
			}

			var query = context.getElementsByTagName(tag || '*');
			for (var j = 0, node; (node = query[j]); j++) {
				if (node.id == id) return [node];
			}
			return [];
		};
	}

	if (classes.length > 0) {

		if (!search && support.hasByClass) {

			for (i = 0; (item = classes[i]); i++) {
				matchSearch = chain(matchSearch, matchClass, prepareClass(item));
			}

			var joined = classes.join(' ');
			search = function(context) {
				return context.getElementsByClassName(joined);
			};

		} else if (!search && classes.length == 1) { // optimised for typical .one-class-only

			tagged = true;

			var expr = prepareClass(classes[0]);
			matchSearch = chain(matchSearch, matchClass, expr);

			search = function(context) {
				var query = context.getElementsByTagName(tag || '*');
				var found = [];
				for (var i = 0, node; (node = query[i]); i++) {
					if (node.className && expr.test(node.className)) found.push(node);
				}
				return found;
			};

		} else {

			for (i = 0; (item = classes[i]); i++) {
				match = chain(match, matchClass, prepareClass(item));
			}

		}
	}

	if (tag) {

		if (!search) {
			matchSearch = chain(matchSearch, matchTag, nodeName);

			search = function(context) {
				return context.getElementsByTagName(tag);
			};
		} else if (!tagged) { // search does not filter by tag yet
			match = chain(match, matchTag, nodeName);
		}

	} else if (!search) { // default engine

		search = function(context) {
			var query = context.getElementsByTagName('*');
			if (!support.byTagAddsComments) return query;
			var found = [];
			for (var i = 0, node; (node = query[i]); i++) {
				if (node.nodeType === 1) found.push(node);
			}
			return found;
		};

	}

	for (i = 0; (item = selector.pseudos[i]); i++) {

		if (item.name == 'not') { // optimised :not(), fast as possible
			var not = Sly(item.value);
			match = chain(match, function(node, not) {
				return !not.match(node);
			}, (not.parse().length == 1) ? not.parsed[0] : not);
		} else {
			var parser = pseudos[item.name];
			// chain(match, matchAttribute, prepareAttribute(item))
			if (parser) match = chain(match, parser, item.value);
		}

	}

	for (i = 0; (item = selector.attributes[i]); i++) {
		match = chain(match, matchAttribute, prepareAttribute(item));
	}

	if ((selector.simple = !(match))) {
		selector.matchAux = empty;
	} else {
		selector.matchAux = match;
		matchSearch = chain(matchSearch, match);
	}

	selector.match = matchSearch || empty;

	selector.combine = Sly.combinators[selector.combinator || ' '];

	selector.search = search;

	return selector;
};


/**
 * Combinators
 */
var combinators = Sly.combinators = {

	' ': function(combined, context, selector, state, locate, fast) {
		var nodes = selector.search(context);
		if (fast && selector.simple) return Sly.toArray(nodes);
		for (var i = 0, node, aux = selector.matchAux; (node = nodes[i]); i++) {
			if (locate(node) && aux(node, state)) combined.push(node);
		}
		return combined;
	},

	'>': function(combined, context, selector, state, locate) {
		var nodes = selector.search(context);
		for (var i = 0, node; (node = nodes[i]); i++) {
			if (node.parentNode == context && locate(node) && selector.matchAux(node, state)) combined.push(node);
		}
		return combined;
	},

	'+': function(combined, context, selector, state, locate) {
		while ((context = context.nextSibling)) {
			if (context.nodeType == 1) {
				if (locate(context) && selector.match(context, state)) combined.push(context);
				break;
			}

		}
		return combined;
	},

	'~': function(combined, context, selector, state, locate) {
		while ((context = context.nextSibling)) {
			if (context.nodeType == 1) {
				if (!locate(context)) break;
				if (selector.match(context, state)) combined.push(context);
			}
		}
		return combined;
	}

};


/**
 * Pseudo-Classes
 */
var pseudos = Sly.pseudos = {

	// w3c pseudo classes

	'first-child': function(node) {
		return pseudos.index(node, 0);
	},

	'last-child': function(node) {
		while ((node = node.nextSibling)) {
			if (node.nodeType === 1) return false;
		}
		return true;
	},

	'only-child': function(node) {
		var prev = node;
		while ((prev = prev.previousSibling)) {
			if (prev.nodeType === 1) return false;
		}
		var next = node;
		while ((next = next.nextSibling)) {
			if (next.nodeType === 1) return false;
		}
		return true;
	},

	'nth-child': function(node, value, state) {
		var parsed = Sly.parseNth(value || 'n');
		if (parsed.special != 'n') return pseudos[parsed.special](node, parsed.a, state);
		state = state || {}; // just to be sure
		state.positions = state.positions || {};
		var uid = Sly.getUid(node) ;
		if (!state.positions[uid]) {
			var count = 0;
			while ((node = node.previousSibling)) {
				if (node.nodeType != 1) continue;
				count++;
				var position = state.positions[Sly.getUid(node)];
				if (position != undefined) {
					count = position + count;
					break;
				}
			}
			state.positions[uid] = count;
		}
		return (state.positions[uid] % parsed.a == parsed.b);
	},

	'empty': function(node) {
		return !(node.innerText || node.textContent || '').length;
	},

	'contains': function(node, text) {
		return (node.innerText || node.textContent || '').indexOf(text) != -1;
	},

	'index': function(node, index) {
		var count = 0;
		while ((node = node.previousSibling)) {
			if (node.nodeType == 1 && ++count > index) return false;
		}
		return (count == index);
	},

	'even': function(node, value, state) {
		return pseudos['nth-child'](node, '2n+1', state);
	},

	'odd': function(node, value, state) {
		return pseudos['nth-child'](node, '2n', state);
	}

};

pseudos.first = pseudos['first-child'];
pseudos.last = pseudos['last-child'];
pseudos.nth = pseudos['nth-child'];
pseudos.eq = pseudos.index;


/**
 * Attribute operators
 */
var operators = Sly.operators = {

	'*=': function(value, escaped) {
		return escaped;
	},

	'^=': function(value, escaped) {
		return '^' + escaped;
	},

	'$=': function(value, escaped) {
		return value + '$';
	},

	'~=': function(value, escaped) {
		return '(?:^|[ \\t\\r\\n\\f])' + escaped + '(?:$|[ \\t\\r\\n\\f])';
	},

	'|=': function(value, escaped) {
		return '(?:^|\\|)' + escaped + '(?:$|\\|)';
	}

};


// public, overridable

Sly.getAttribute = function(node, name) {
	if (name == 'class') return node.className;
	return node.getAttribute(name, 2); // 2 for IE, others ignore it
};


var toArray = function(nodes) {
	return Array.prototype.slice.call(nodes);
};

try {
	toArray(document.documentElement.childNodes);
} catch (e) {
	toArray = function(nodes) {
		if (nodes instanceof Array) return nodes;
		var i = nodes.length, results = new Array(i);
		while (i--) results[i] = nodes[i];
		return results;
	};
}

Sly.toArray = toArray;

Sly.compare = (document.compareDocumentPosition) ? function (a, b) {
	return (3 - (a.compareDocumentPosition(b) & 6));
} : function (a, b) {
	return (a.sourceIndex - b.sourceIndex);
};

var nextUid = 1;

Sly.getUid = (window.ActiveXObject) ? function(node) {
	return (node.$slyUid || (node.$slyUid = {id: nextUid++})).id;
} : function(node) {
	return node.$slyUid || (node.$slyUid = nextUid++);
};


var nthCache = {};

Sly.parseNth = function(value) {
	if (nthCache[value]) return nthCache[value];

	var parsed = value.match(/^([+-]?\d*)?([a-z]+)?([+-]?\d*)?$/);
	if (!parsed) return false;

	var a = parseInt(parsed[1], 10), b = (parseInt(parsed[3], 10) || 0) - 1;

	if ((a = (isNaN(a)) ? 1 : a)) {
		while (b < 1) b += a;
		while (b >= a) b -= a;
	}
	switch (parsed[2]) {
		case 'n': parsed = {a: a, b: b, special: 'n'}; break;
		case 'odd': parsed = {a: 2, b: 0, special: 'n'}; break;
		case 'even': parsed = {a: 2, b: 1, special: 'n'}; break;
		case 'first': parsed = {a: 0, special: 'index'}; break;
		case 'last': parsed = {special: 'last-child'}; break;
		case 'only': parsed = {special: 'only-child'}; break;
		default: parsed = {a: (a) ? (a - 1) : b, special: 'index'};
	}

	return (nthCache[value] = parsed);
};


Sly.escapeRegExp = function(text) {
	return text.replace(/[-.*+?^${}()|[\]\/\\]/g, '\\$&');
};


// generic accessors

Sly.generise = function(name) {
	Sly[name] = function(text) {
		var cls = Sly(text);
		return cls[name].apply(cls, Array.prototype.slice.call(arguments, 1));
	}
};

var generics = ['parse', 'search', 'find', 'match', 'filter'];
for (var i = 0; generics[i]; i++) Sly.generise(generics[i]);


// compile pattern for the first time

Sly.recompile();

// FIN

return Sly;

Sly.verbose = false;

})();

$hort.selector = Sly.search;
$hort.filter = Sly.filter;


