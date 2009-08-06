Karma.extend({

	getScript: function(url, success) {
		var counter = 0,
			script = [],
			isDone = false,
			mylength = url.length || 1;
		
		var callback = function(){
			counter++;
			
			if (!isDone && counter >= mylength) {
				isDone = true;
				success();
			}
		};

		for (var i = 0; i < mylength; i++) {
			script[i] = document.createElement('SCRIPT');
			script[i].type = 'text/javascript';
			script[i].src = url[i] || url;
			
			// prevent KB917927, also document.getElementsByTagName('head') is not always available
			document.documentElement.insertBefore(script[i], document.documentElement.firstChild);
			
			if (script[i].readyState) {
				script[i].onreadystatechange = function() {
					if (script[i].readyState == "loaded" || script[i].readyState == "complete") {
						script[i].onreadystatechange = null;
						callback();
					}
				}
			}
	
			else script[i].onload = callback;
		}
	}
});

Karma.include = Karma.getScript;

