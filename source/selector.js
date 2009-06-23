Karma.selector = Sizzle;
Karma.filter = Sizzle.filter;
Karma.pseudo = Sizzle.selectors.filters;

// 2 filters below from the jQuery project
Sizzle.selectors.filters.visible = function(el){
	return el.offsetWidth > 0 || el.offsetHeight > 0;
};

Sizzle.selectors.filters.hidden = function(el){
	return el.offsetWidth === 0 && el.offsetHeight === 0;
};

})();