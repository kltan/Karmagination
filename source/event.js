Karma.fn.extend({

	bind: function(str, fn, livequery) {
		if (!this.length || !Karma.isString(str) || !Karma.isFunction(fn)) return this;
	
		str = str.split(/\s+/);
		
		// http://thinkweb2.com/projects/prototype/detecting-event-support-without-browser-sniffing/
		var TAGNAMES = {
			'select':'input',
			'change':'input',
			'submit':'form',
			'reset':'form',
			'error':'img',
			'load':'img',
			'abort':'img',
			'unload': 'window',
			'resize': 'window'
		}
		
		var isEventSupported = function(eventName) {
			var el = TAGNAMES[eventName] ? document.createElement(TAGNAMES[eventName]) : Karma.temp.div;
			var test = el;
			
			if (TAGNAMES[eventName] == 'window')
				test = window;
			
			var onEventName = 'on' + eventName,
				isSupported = !!(onEventName in test);
			
			if (!isSupported) {
				if (test === window)
					test = el;

				test.setAttribute(onEventName, 'return;');
				isSupported = typeof test[onEventName] == 'function';
			}
			
			el = null;
			Karma.event.support = Karma.event.support || {};
			Karma.event.support[eventName] = isSupported;
			return isSupported;
		}

		o:for(var j=0; j< str.length; j++) {
			var ns = str[j].split('.');
			if (Karma.event.special[ns[0]]) {
				var args = [];
				for(var i = 0; i < arguments.length; i++)
					if(Karma.isFunction(arguments[i]))
						args.push(arguments[i]);
						
				Karma.event.special[ns[0]].setup.apply(this, args);
				continue o;
			}
			
			for(var i=0; i< this.length; i++) {
				if (!(this[i].nodeType == 3 || this[i].nodeType == 8)) {
					var map = 0;
					if (this[i] !== window)
						map = this[i].KarmaMap = this[i].KarmaMap || ++Karma.uniqueId;
						
					Karma.storage[map] = Karma.storage[map] || {};
					
					var $ = Karma.storage[map].KarmaEvent = Karma.storage[map].KarmaEvent || {};
					
					$[ns[0]] = $[ns[0]] || [];
					
					if(livequery) {
						var data = Karma.data(this.context, 'KarmaLive') || {};
						data[ns[0]] = data[ns[0]] || {};
						data[ns[0]][livequery] = data[ns[0]][livequery] || [];
						
						if(ns.length == 1)
							data[ns[0]][livequery].push(fn);
						
						else if(ns.length == 2)
							data[ns[0]][livequery][ns[1]] = fn;
							
						Karma.data(this.context, 'KarmaLive', data);
					}
					
					else if (ns.length == 1)
						$[ns[0]].push(fn);
	
					else if (ns.length == 2)
						$[ns[0]][ns[1]] = fn;
						
					if(Karma.event.support[ns[0]] || (Karma.event.support[ns[0]] !== false && isEventSupported(ns[0]))) {
						if(!Karma.isFunction(this[i]['on'+ns[0]]))
							this[i]['on'+ns[0]] = Karma.event.caller;
					}
					// custom event
					else if(document.addEventListener) {
						var total = 0;
						for(var event in $[ns[0]]) {
							total++;
						}
	
						if(!total)
							this[i].addEventListener(ns[0], Karma.event.caller, false);
					}
					// custom/proprietary event for M$
					else {
						this[i].customEvents = 0;
						if(!Karma.isFunction(this[i].onpropertychange))
							this[i].onpropertychange = Karma.event.caller;
					}
				}
			}
		}
		return this;
	},
		
	unbind: function(str, fn, livequery) {
		if (!str || !this.length) return this;
		var token = str.split(/\s+/);
		
		for(var j=0; j< token.length; j++) {
			var ns = token[j].split('.');
			for(var i=0; i< this.length; i++) {
				var map = this === window ? 0 : this[i].KarmaMap;
				var data = Karma.data(this[i], 'KarmaLive');
				if (livequery) {
					if(data && data[ns[0]] && data[ns[0]][livequery]) {
						if (Karma.isFunction(fn)) {
							for (var fn in data[ns[0]][livequery])
								if (data[ns[0]][livequery][fn] == fn)
									delete data[ns[0]][livequery][fn];
						}
						else if (ns.length > 1) {
							delete data[ns[0]][livequery][ns[1]];
						}
						else if(ns.length == 1) {
							delete data[ns[0]][livequery];
						}
					}
				}

				else if (Karma.storage[map] && Karma.storage[map].KarmaEvent) {
					var $ = Karma.storage[map].KarmaEvent;
					if (Karma.isFunction(fn)) {
						for (var prop in $[ns[0]])
							if ($[ns[0]][prop] == fn)
								delete $[ns[0]][prop];
					}
					else if (ns.length > 1 && $[ns[0]]) {
						delete $[ns[0]][ns[1]];
					}
					else if($[ns[0]]) {
						this[i]['on'+ns[0]] = null;
						delete $[ns[0]];
					}
				}
			}
		}
		return this;
	},
	
	one: function(str, fn) {
		this.on(str, fn);
					
		if (this.data('triggerOnce') === null);
			this.data('triggerOnce', []);
		
		this.data('triggerOnce').push(fn);
		
		return this;
		
	},
	
	triggerHandler: function(eventName) {
		this.trigger(eventName, true);
	},
	
	trigger: function(eventName, prevent) {
		try {
			for(var i=0; i<this.length; i++)
				var element = this[i];

			// W3C compatible browsers
			if(Karma.support.createEvent){
				
				// Safari 3 doesn't have window.dispatchEvent()
				if(!element.dispatchEvent)
					element=document; 
				
				var curEvent= Karma.event[eventName];
				
				if(curEvent){
					var event = document.createEvent(curEvent.type);
					curEvent.init(event, {});
					
					if(prevent) {
						event.stopPropagation();
						event.preventDefault();
					}
					
					element.dispatchEvent(event);
				}
				else {
					var fakeEvent = document.createEvent("UIEvents");
					fakeEvent.initEvent(eventName, false, false);
					
					if(prevent) {
						fakeEvent.stopPropagation();
						fakeEvent.preventDefault();
					}
					
					element.dispatchEvent(fakeEvent);
				}
			}
			// m$ methods
			else if(Karma.support.createEventObject){
				if(Karma.event.support[eventName]) {
					element = (element === document || element === window ) ? document.documentElement : element;
				
					var event = document.createEventObject();
					if(prevent) {
						event.cancelBubble = true;
						event.returnValue = false;
					}
					
					/*for(var property in properties)
						event[property]=properties[property];*/
		
					element.fireEvent("on"+eventName, event);
				}
				else {
					var current = Karma(element).data('fireEvent') || [];
					current.push(eventName);
					
					Karma(element).data('fireEvent', current);
					element.customEvents++;
				}
			}

		} catch(e){};
		
		return this;
	},
	
	// preventDefault and stopPropagation might not be 100% complete for live yet
	live: function(str, fn){
		return Karma(this.context).bind(str, fn, this.query);
	},
	
	die: function(str, fn) {
		return Karma(this.context).unbind(str, fn, this.query);
	}

});

// create events for w3c browser
if(Karma.support.createEvent)
Karma.event = {
	load:{
		type:"HTMLEvents",
		init: function(e){
			e.initEvent("load",false,false);
		}
	},
	
	unload:{
		type:"HTMLEvents",
		init:function(e){
			e.initEvent("unload",false,false);
		}
	},
	
	select:{
		type:"HTMLEvents",
		init:function(e){
			e.initEvent("select",true,false);
		}
	},
	
	change:{
		type:"HTMLEvents",
		init:function(e){
			e.initEvent("change",true,false);
		}
	},
	
	submit:{
		type:"HTMLEvents",
		init:function(e,p){
			e.initEvent("submit",true,true);
		}
	},
	
	reset:{
		type:"HTMLEvents",
		init:function(e){
			e.initEvent("reset",true,false);
		}
	},
	
	resize:{
		type:"HTMLEvents",
		init:function(e){
			e.initEvent("resize",true,false);
		}
	},
	
	scroll:{
		type:"HTMLEvents",
		init:function(e){
			e.initEvent("scroll",true,false);
		}
	},
	
	click:{
		type:"MouseEvents",
		init:function(e,p){
			e.initMouseEvent("click",true,true,window,1,p.screenX||0,p.screenY||0,p.clientX||0,p.clientY||0,p.ctrlKey||false,p.altKey||false,p.shiftKey||false,p.metaKey||false,p.button||0,p.relatedTarget||null);
		}
	},
	
	dblclick:{
		type:"MouseEvents",
		init:function(e,p){
			e.initMouseEvent("click",true,true,window,2,p.screenX||0,p.screenY||0,p.clientX||0,p.clientY||0,p.ctrlKey||false,p.altKey||false,p.shiftKey||false,p.metaKey||false,p.button||0,p.relatedTarget||null);
		}
	},
	
	mousedown:{
		type:"MouseEvents",
		init:function(e,p){
			e.initMouseEvent("mousedown",true,true,window,1,p.screenX||0,p.screenY||0,p.clientX||0,p.clientY||0,p.ctrlKey||false,p.altKey||false,p.shiftKey||false,p.metaKey||false,p.button||0,p.relatedTarget||null);
		}
	},
	
	mouseup:{
		type:"MouseEvents",
		init:function(e,p){
			e.initMouseEvent("mouseup",true,true,window,1,p.screenX||0,p.screenY||0,p.clientX||0,p.clientY||0,p.ctrlKey||false,p.altKey||false,p.shiftKey||false,p.metaKey||false,p.button||0,p.relatedTarget||null);
		}
	},
	
	mouseover:{
		type:"MouseEvents",
		init:function(e,p){
			e.initMouseEvent("mouseover",true,true,window,1,p.screenX||0,p.screenY||0,p.clientX||0,p.clientY||0,p.ctrlKey||false,p.altKey||false,p.shiftKey||false,p.metaKey||false,p.button||0,p.relatedTarget||null);
		}
	},
	
	mousemove:{
		type:"MouseEvents",
		init:function(e,p){
			e.initMouseEvent("mousemove",true,true,window,1,p.screenX||0,p.screenY||0,p.clientX||0,p.clientY||0,p.ctrlKey||false,p.altKey||false,p.shiftKey||false,p.metaKey||false,p.button||0,p.relatedTarget||null);
		}
	},
	
	mouseout:{
		type:"MouseEvents",
		init:function(e,p){
			e.initMouseEvent("mouseout",true,true,window,1,p.screenX||0,p.screenY||0,p.clientX||0,p.clientY||0,p.ctrlKey||false,p.altKey||false,p.shiftKey||false,p.metaKey||false,p.button||0,p.relatedTarget||null);
		}
	},
	
	focusin:{
		type:"UIEvents",
		init:function(e){
			e.initUIEvent("focusin",true,false,window,1);
		}
	},
	
	focusout:{
		type:"UIEvents",
		init:function(e){
			e.initUIEvent("focusout",true,false,window,1);
		}
	},
	
	activate:{
		type:"UIEvents",
		init:function(e){
			e.initUIEvent("activate",true,true,window,1);
		}
	},
	
	focus:{
		type:"UIEvents",
		init:function(e){
			e.initUIEvent("focus",false,false,window,1);
		}
	},
	
	blur:{
		type:"UIEvents",
		init:function(e){
			e.initUIEvent("blur",false,false,window,1);
		}
	}
}

else Karma.event = {};

Karma.event.support = {};
Karma.event.special = {
	hover: {
		setup: function(){
			var args = arguments;
			this.bind('mouseover', function(e){ 
				e.stopPropagation();
				return args[0].call(this, e); 
			}).bind('mouseout', function(e){ 
				e.stopPropagation();
				return args[1].call(this, e); 
			});
		},
		teardown: function(){
			this.unbind('mouseover').unbind('mouseout');
		}
	}
}

// caller the determines how events are fired, also normalizes events
// hardest freakin bitch function to code in Karmagination
Karma.event.caller = function(e) {
	var cur_map = this === window ? 0 : this.KarmaMap;
	e = window.event || e;
	
	// some basic normalization of event
	if(!e.stopPropagation && window.event) 
		e.stopPropagation = function(){ window.event.cancelBubble = true; };
	
	if(!e.preventDefault && window.event)
		e.preventDefault = function(){ window.event.returnValue = false; };
		
	if(!e.target && e.srcElement)
		e.target = e.srcElement || document;
	
	try {
		if(e.type == 'mouseover' && !('relatedTarget' in e))
			 e.relatedTarget = e.fromElement;
	
		else if(e.type == 'mouseout' && !('relatedTarget' in e))
			e.relatedTarget = e.toElement;
			
		if(e.wheelDelta) {
			e.wheelDiff = e.wheelDelta/120;
			if(Karma.isOpera)
				e.wheelDiff = -e.wheelDiff;
		}
		else if (e.detail)
			e.wheelDiff = -e.detail/3;
			
		// fix for safari textnode
		if (e.target.nodeType == 3)
			e.target = e.target.parentNode;

		// Calculate pageX/Y if missing and clientX/Y available
		if ( e.pageX == null && e.clientX != null ) {
			var doc = document.documentElement, body = document.body;
			e.pageX = e.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc.clientLeft || 0);
			e.pageY = e.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc.clientTop || 0);
		}
	
		// Add which for key events
		if ( !e.which && ((e.charCode || e.charCode === 0) ? e.charCode : e.keyCode) )
			e.which = e.charCode || e.keyCode;
	
		// Add metaKey to non-Mac browsers (use ctrl for PC's and Meta for Macs)
		if ( !e.metaKey && e.ctrlKey )
			e.metaKey = e.ctrlKey;
	
		// Add which for click: 1 == left; 2 == middle; 3 == right
		// Note: button is not normalized, so don't use it
		if ( !e.which && e.button )
			e.which = (e.button & 1 ? 1 : ( e.button & 2 ? 3 : ( e.button & 4 ? 2 : 0 ) ));
		
	} catch(e){}
	
	var live = Karma.data(this.ownerDocument || document, 'KarmaLive');
	if (live && live[e.type]) {
		var passed = [],
			node = [],
			ancestors = [],
			cur = e.target;
		
		// get a list of ancestors e.target including e.target
		while(cur) {
			ancestors.push(cur);
			cur = cur.parentNode;
		}

		// see which live query is more specific to the e.target
		for(var query in live[e.type]) {
			var result = Karma.Sizzle.filter(query, ancestors);
			if (result.length) {
				for(var i = 0; i < ancestors.length; i++) {
					if (ancestors[i] === result[0]) {
						passed[i] = query;
						node[i] = result[0];
					}
				}
			}
		}
		
		// stop event done 99% right, WOOT
		for(var i=0; i < passed.length; i++) {
			if (passed[i] && live[e.type][passed[i]]) {
				var stopped = 0;
				for(var stacked in live[e.type][passed[i]]) {
					if(live[e.type][passed[i]][stacked].call(node[i], e) === false) {
						e.preventDefault();
						e.stopPropagation();
						stopped++;
					}
				}
				if (stopped) break;
			}
		}
	}
		
	if(e.propertyName == "customEvents") {
		var events = $(this).data('fireEvent');
		
		for(var index in events) {
			try {
				for(var functions in Karma.storage[cur_map].KarmaEvent[events[index]]) {
					if(Karma.storage[cur_map].KarmaEvent[events[index]][functions].call(this, e) === false) {
						e.stopPropagation();
						e.preventDefault();	
					}	
				}
				events[index] = null;
			} 
			catch(e){};
		}
		$(this).data('fireEvent', events);
	}
	
	else if(Karma.storage[cur_map] && Karma.storage[cur_map].KarmaEvent && Karma.storage[cur_map].KarmaEvent[e.type]) {
		for(var functions in Karma.storage[cur_map].KarmaEvent[e.type]) {
			if(Karma.storage[cur_map].KarmaEvent[e.type][functions].call(this, e) === false) {
				e.stopPropagation();
				e.preventDefault();	
			}
			
			var once = Karma(this).data('triggerOnce');
			if(once) {
				for (var i = 0; i < once.length; i++) {
					if(once[i] === Karma.storage[cur_map].KarmaEvent[e.type][functions]) {
						Karma.storage[cur_map].KarmaEvent[e.type][functions] = null;
						delete Karma.storage[cur_map].KarmaEvent[e.type][functions];
					}
				}
			}
			
		}
	}
}

