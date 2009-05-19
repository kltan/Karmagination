
if (this.Sizzle) {
	Karma.selector = Sizzle;
	Karma.filter = Sizzle.filter;
	Karma.selector.pseudo = Sizzle.selectors.filters;
}
else if (this.Sly) {
	Karma.selector = Sly.search;
	Karma.filter = Sly.filter;
}
})();// end self-executing anon