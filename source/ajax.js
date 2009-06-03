Karma.extend(Karma, {

	ajax: function(o) {
		
		o = Karma.extend({
			type: 'GET',
			data: '',
			url: '',
			contentType: null,
			loading: function(){},
			success: function(){},
			error: function(){}
		 }, o);
	
		var oXHR = window.XMLHttpRequest? new XMLHttpRequest(): new ActiveXObject("Microsoft.XMLHTTP");
		
		if (oXHR === null || oXHR === undefined) return;
		
		oXHR.onreadystatechange=function(){
			try {
				if (oXHR.readyState==4 && !o.successDone){
					o.success(oXHR.responseText);
					o.successDone = true;
				}
				
				if (oXHR.status!=200 && !o.errorDone) {
					o.error(oXHR.responseText);
					o.successDone = true;
					o.errorDone = true;
				}
			}
			catch(e) {};
		}
		
		o.loading();
		oXHR.open(o.type, o.url, true);
		if(o.contentType)
			oXHR.setRequestHeader("Content-Type", o.contentType);
		oXHR.send(null);
	}

});