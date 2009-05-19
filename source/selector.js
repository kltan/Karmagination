
if (window.Sizzle) {
	Karma.selector = Sizzle;
	Karma.filter = Sizzle.filter;
	Karma.selector.pseudo = Sizzle.selectors.filters;
}
else if (window.Sly) {
	Karma.selector = Sly.search;
	Karma.filter = Sly.filter;
}
})();// end self-executing anon