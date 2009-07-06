Karma.fn.extend({

	// adding elements
	add: function(query) {
		return query? Karma(this).populate(Karma(query), this.length).stack(this) : this;
	},
	
		// adding self to chain
	andSelf: function() {
		return this.KarmaStack.length ? Karma(this).populate(this.KarmaStack[0], this.length).stack(this): this;
	}
});

