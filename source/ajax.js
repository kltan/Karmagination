Karma.extend({

	ajax: function(o) {

		o = Karma.extend({
			type: 'GET',
			data: null,
			url: '',
			contentType: null,
			cache: false,
			loading: function(){},
			success: function(){},
			error: function(){},
			XHR: window.XMLHttpRequest? new XMLHttpRequest(): new ActiveXObject("Microsoft.XMLHTTP")
		 }, o);

		if (o.XHR === null || typeof o.XHR == "undefined" || !o.url.length) return;
		
		o.XHR.onreadystatechange=function(){
			try {
				if (o.XHR.readyState === 4 && !o.successDone){
					o.success(o.XHR.responseText);
					o.successDone = true;
				}
				
				if (o.XHR.status != 200 && !o.errorDone) {
					o.error(o.XHR.responseText);
					o.successDone = true;
					o.errorDone = true;
				}
			} catch(e) {};
		}
		var _url = o.url;
		if (o.type.toLowerCase() == 'get' && o.data)
			o.cache ? _url += '?karma_ts=' + new Date().getTime() + '&' + o.data : _url += '?' + o.data;
		
		
		o.XHR.open(o.type, _url, true);
		o.loading();
		
		if(o.contentType)
			o.XHR.setRequestHeader("Content-Type", o.contentType);
		
		(o.type.toLowerCase() == 'post' && o.data) ?
			o.XHR.send(o.data) :
			o.XHR.send(null);
	}

});

