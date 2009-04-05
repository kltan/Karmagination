$hort.selector = Sly || Sizzle || function(query) {
	// basic selector, supports #id, element.class, .class, element
	// when ie 7, FF 3, safari 3, opera 9.5 and below are phased out, this method will support full CSS3 selector
		
	// use native css selector if available
	if (document.querySelectorAll)
		return document.querySelectorAll(query);

	var $id = query.split('#'),
		$class = query.split('.'),
		type = ($class.length > $id.length)? ".": "#",
		selector = ($class.length > $id.length)? $class : $id,
		result = [],
		els;
	
	if (selector.length === 1)
		return document.getElementsByTagName(selector[0]);

	if (selector.length === 2) {

		// supports #id
		if (type === '#'){
			els = document.getElementById(selector[1]);
			if(els)
				result.push(document.getElementById(selector[1]));
			
			return result;
		}
		// supports .class
		if (type === '.') {
			if (document.getElementsByClassName) {
				els = document.getElementsByClassName(selector[1])
				// supports element.class
				if (selector[0] != '')
					for(var i=0; i<els.length; i++)
						if(els[i].nodeName===selector[0].toUpperCase())
							result.push(els[i]);
			
				return result.length ? result: els;
			}
			
			// supports element.class, for older browsers
			var tag = (selector[0] != '') ? selector[0] : '*';
			els = document.getElementsByTagName(tag);
			
			for(var i=0; i<els.length; i++) {
				if(els[i].className.match(selector[1]))
					result.push(els[i]);
			}
			
			return result;
		}
		
	}
};