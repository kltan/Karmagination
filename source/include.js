Karma.extend({

	include: function(opts) {
		
		opts = Karma.extend({
			success: function(){}					
		}, opts);
	
		var counter = 0;
		
		// getting the scripts after onDOMready
		// reason: if you want to insert the script before onDOMready, please use HTML instead because you are not loading it on use
		// another reason: IE bombs if before onDOMready
		Karma(function(){ //onDOMready
			// loop through all the urls
			var $el;
			
			for (var i = 0; i < opts.url.length; i++) {
				$el = document.createElement('SCRIPT');
				$el.type = 'text/javascript';
				$el.src = opts.url[i];
				document.documentElement.appendChild($el);
				$el.onreadystatechange = $el.onload = function(){
					counter++;
					if (counter == opts.url.length)
						setTimeout(function(){ opts.success(); }, 40); // weird hack, opera fails if no timeout 
				};
			}
		});
	}
});
		