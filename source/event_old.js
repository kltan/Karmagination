Karma.extend(Karma.fn, {

	on: function(str, fn) {
		str = str.split(/\s+/);
		
		for(var j=0; j< str.length; j++) {
			var ns = str[j].split('.');
			
			for(var i=0; i< this.length; i++) {
				var $ = this[i];
				var first = false;
				
				$['KarmaEvent'] = $['KarmaEvent'] || {};
				
				if(!$['KarmaEvent'][ns[0]]) {
					$['KarmaEvent'][ns[0]] = [];
					first = true;
				}
				
				var caller = function(e){
					alert('fire');
					e = window.event || e;
					Karma.support.srcElement ? e.target = e.srcElement : e.srcElement = e.target;
					
					console.log($['KarmaEvent']);
					console.log(ns[0]);
					console.log($['KarmaEvent'][ns[0]]);
					
					for (var fnStack in $['KarmaEvent'][ns[0]])
						if (parseInt(fnStack) !== 0)
							if($['KarmaEvent'][ns[0]][fnStack].call(e.target, e) === false) {
								if (window.event) {
									window.event.cancelBubble = true;
									window.event.returnValue = false;
								}
								
								if (e.stopPropagation)
									e.stopPropagation();

								if (Karma.support.preventDefault)
									e.preventDefault();	
							}
				};
				
				if(first)
					$['KarmaEvent'][ns[0]].push(caller);
				
				if (ns.length == 1)
					$['KarmaEvent'][ns[0]].push(fn);

				else if (ns.length == 2)
					$['KarmaEvent'][ns[0]][ns[1]] = fn;

				
				if (first) {
					if(Karma.support.addEventListener)
						$.addEventListener(ns[0], caller, false);
						
					else if(Karma.support.attachEvent)
						$.attachEvent('on'+ns[0], caller);
				}
			}
		}
		Karma.eventFunctions.push(fn);
		return this;
	},
	
	un: function(str, fn) {
		str = str.split(' ');
		
		for(var j=0; j< str.length; j++) {
			var ns = str[j].split('.');
			for(var i=0; i< this.length; i++) {
				var $ = this[i];
				
				$['KarmaEvent'] = $['KarmaEvent'] || {};
				$['KarmaEvent'][ns[0]] = $['KarmaEvent'][ns[0]] || [];

				if (Karma.isFunction(fn)) {
					alert('use1');
					for (var prop in $['KarmaEvent'][ns[0]])
						if ($['KarmaEvent'][ns[0]][prop] == fn)
							delete $['KarmaEvent'][ns[0]][prop];
				}
				else if (ns.length>1) {
					delete $['KarmaEvent'][ns[0]][ns[1]];
				}
				else {
					alert('use3');
					//Karma.support.addEventListener ? $['removeEventListener'](ns[0], $['KarmaEvent'][ns[0]][0], false):	$['detachEvent']('on'+ns[0], $['KarmaEvent'][ns[0]][0]);
					//delete $['KarmaEvent'][ns[0]];
				}
			}
		}
		Karma.eventFunctions.push(fn);
		return this;
	},
	
	fire: function(eventName) {
		
		try {
			for(var i=0; i<this.length; i++)
				var element = this[i];

			// W3C compatible browsers
			if(Karma.support.createEvent){
				
				// Safari3 doesn't have window.dispatchEvent()
				if(!element.dispatchEvent)
					element=document; 
				
				var curEvent= Karma.event[eventName];
				
				if(curEvent){
					var event = document.createEvent(curEvent.type);
					curEvent.init(event, {});
					element.dispatchEvent(event);
					return true;
				}
			}
			// m$, wow easier! one of the odd moments in javascript
			else if(Karma.support.createEventObject){
				element = (element === document || element === window ) ? document.documentElement : element;
			
				var event = document.createEventObject();
				
				for(var property in properties)
					event[property]=properties[property];
	
				element.fireEvent("on"+eventName, event);
				
				return true;
			}

		}
		catch (e){ return false; }
		return this;
	}
});

// events for w3c browser

if(Karma.support.createEvent){
	Karma.event = {
		load:{type:"HTMLEvents",init:function(e,p){e.initEvent("load",false,false);}},
		unload:{type:"HTMLEvents",init:function(e,p){e.initEvent("unload",false,false);}},
		select:{type:"HTMLEvents",init:function(e,p){e.initEvent("select",true,false);}},
		change:{type:"HTMLEvents",init:function(e,p){e.initEvent("change",true,false);}},
		submit:{type:"HTMLEvents",init:function(e,p){e.initEvent("submit",true,true);}},
		reset:{type:"HTMLEvents",init:function(e,p){e.initEvent("reset",true,false);}},
		resize:{type:"HTMLEvents",init:function(e,p){e.initEvent("resize",true,false);}},
		scroll:{type:"HTMLEvents",init:function(e,p){e.initEvent("scroll",true,false);}},
		click:{type:"MouseEvents",init:function(e,p){e.initMouseEvent("click",true,true,window,1,p.screenX||0,p.screenY||0,p.clientX||0,p.clientY||0,p.ctrlKey||false,p.altKey||false,p.shiftKey||false,p.metaKey||false,p.button||0,p.relatedTarget||null);}},
		dblclick:{type:"MouseEvents",init:function(e,p){e.initMouseEvent("click",true,true,window,2,p.screenX||0,p.screenY||0,p.clientX||0,p.clientY||0,p.ctrlKey||false,p.altKey||false,p.shiftKey||false,p.metaKey||false,p.button||0,p.relatedTarget||null);}},
		mousedown:{type:"MouseEvents",init:function(e,p){e.initMouseEvent("mousedown",true,true,window,1,p.screenX||0,p.screenY||0,p.clientX||0,p.clientY||0,p.ctrlKey||false,p.altKey||false,p.shiftKey||false,p.metaKey||false,p.button||0,p.relatedTarget||null);}},
		mouseup:{type:"MouseEvents",init:function(e,p){e.initMouseEvent("mouseup",true,true,window,1,p.screenX||0,p.screenY||0,p.clientX||0,p.clientY||0,p.ctrlKey||false,p.altKey||false,p.shiftKey||false,p.metaKey||false,p.button||0,p.relatedTarget||null);}},
		mouseover:{type:"MouseEvents",init:function(e,p){e.initMouseEvent("mouseover",true,true,window,1,p.screenX||0,p.screenY||0,p.clientX||0,p.clientY||0,p.ctrlKey||false,p.altKey||false,p.shiftKey||false,p.metaKey||false,p.button||0,p.relatedTarget||null);}},
		mousemove:{type:"MouseEvents",init:function(e,p){e.initMouseEvent("mousemove",true,true,window,1,p.screenX||0,p.screenY||0,p.clientX||0,p.clientY||0,p.ctrlKey||false,p.altKey||false,p.shiftKey||false,p.metaKey||false,p.button||0,p.relatedTarget||null);}},
		mouseout:{type:"MouseEvents",init:function(e,p){e.initMouseEvent("mouseout",true,true,window,1,p.screenX||0,p.screenY||0,p.clientX||0,p.clientY||0,p.ctrlKey||false,p.altKey||false,p.shiftKey||false,p.metaKey||false,p.button||0,p.relatedTarget||null);}},
		focusin:{type:"UIEvents",init:function(e,p){e.initUIEvent("focusin",true,false,window,1);}},
		focusout:{type:"UIEvents",init:function(e,p){e.initUIEvent("focusout",true,false,window,1);}},
		activate:{type:"UIEvents",init:function(e,p){e.initUIEvent("activate",true,true,window,1);}},
		focus:{type:"UIEvents",init:function(e,p){e.initUIEvent("focus",false,false,window,1);}},
		blur:{type:"UIEvents",init:function(e,p){e.initUIEvent("blur",false,false,window,1);}}
	};
}

Karma.event = Karma.event || {};
Karma.event.caller = function(e) {
	e = window.event || e;
	Karma.support.srcElement ? e.target = e.srcElement : e.srcElement = e.target;
	
	var curEl = e.target;
	
	for (var events in curEl['KarmaEvent']) {
		for(var functions in curEl['KarmaEvent'][events]) {
			if(curEl['KarmaEvent'][events][functions].call(e.target, e) === false) {
				if (window.event) {
					window.event.cancelBubble = true;
					window.event.returnValue = false;
				}
							
				if (e.stopPropagation)
					e.stopPropagation();

				if (Karma.support.preventDefault)
					e.preventDefault();	
				
			}
		}
	}
}

Karma(window).on('unload', function(){
	for (var i =0; i <Karma.eventFunctions.length; i++) {
		Karma.eventFunctions[i] = null;
		delete Karma.eventFunctions[i];
	}
});