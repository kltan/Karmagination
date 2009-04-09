$hort.extend($hort.fn, {

	on: function(str, fn) {
		str = str.split(' ');
		
		for(var j=0; j< str.length; j++) {
			var ns = str[j].split('.');
			for(var i=0; i< this.length; i++) {
				var $ = this[i];
				$['$hortEvent'] = $['$hortEvent'] || [];
				$['$hortEvent'][ns[0]] = $['$hortEvent'][ns[0]] || [];
				
				if (ns.length == 1) {
					$['$hortEvent'][ns[0]].push(fn);
				}
				else if (ns.length == 2) {
					$['$hortEvent'][ns[0]][ns[1]] = fn;
				}
				if($.addEventListener)
					$.addEventListener(ns[0], fn, false);
				else if($.attachEvent)
					$.attachEvent('on'+ns[0], function(e){
						fn.call($, e);
					});
			}
		}

		return this;
	},
	
	un: function(str, fn) {
		str = str.split(' ');
		
		for(var j=0; j< str.length; j++) {
			var ns = str[j].split('.');
			for(var i=0; i< this.length; i++) {
				var $ = this[i];
				
				$['$hortEvent'] = $['$hortEvent'] || {};
				$['$hortEvent'][ns[0]] = $['$hortEvent'][ns[0]] || {};
				
				var cur = $['$hortEvent'][ns[0]];
				var detach = $.removeEventListener ? 'removeEventListener' : 'detachEvent';
				
				if(ns.length>1) {
					$[detach](ns[0], cur[ns[1]], false);
					delete $['$hortEvent'][ns[0]][ns[1]];
				}
				else {
					for(var prop in cur)
						$[detach](ns[0], cur[prop], false);
					$['$hortEvent'][ns[0]] = [];
				}

			}
		}

		return this;
	},
	
	// document.createEvent, lazy work for now
	trigger: function(str) {
		for(var i=0; i< this.length; i++) {
			if(this[0]['$hortEvent'] && this[0]['$hortEvent'][str]) {
				var fn = this[0]['$hortEvent'][str];
				for(var prop in fn) {
					fn[prop].call(this[0]);
				}
			}
		}
		return this;
	}
});

$hort.extend($hort.fn, {
	bind: $hort.fn.on,
	unbind: $hort.fn.un
});