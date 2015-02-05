
;var Sequence = ( function ( undefined ) {
	"use strict";
	
	// Util
	
	function prepend(item, collection) {
		collection = collection || [];
		Array.prototype.unshift.call(collection, item);
		return collection;
	}
	
	function allButFirst(collection) {
		return Array.prototype.splice.call(collection, 1);
	};
	
	
	// Sequence
	
	function Sequence(steps, id) {
		this.id = id || null;
		this._abort = undefined;
		this.steps = [];
		
		// initialize steps, flattening nested sequences
		
		var n = steps.length,
			x = 0;
		
		for (; x < n; x++) {

			if (steps[x] instanceof Sequence) {
				var y = 0, l = steps[x].steps.length;
				
				for (; y < l; y++)
					this.steps.push(steps[x].steps[y]);

			} else {
				this.steps.push(steps[x]);
			}
		}
	}
	
	
	// Sequencer
	
	function Sequencer(sequence) {
		this.sequence = sequence;
		this._abort = undefined;
		this.pos = 0;
	};
	
	Sequencer.prototype.abort = function (done) {
		if (this._abort)
			throw 'Sequence abort already requested';
		
		this._abort = done;
		return this;
	};
	
	Sequencer.prototype.run = function (success, fail, opts) {
		opts = opts || {};
		
		var context = opts.context || null,
			count = this.sequence.steps.length,
			self = this;
		
		function next() {

			if (self._abort) {
				
				// sequencer operation aborted
				
				self._abort.apply(context, arguments);
				self._abort = undefined;
				return;
			}
			
			if (arguments[0] === false) {
				
				// step failed
				
				if (fail)
					fail.apply(context, allButFirst(arguments));
				else
					throw 'Sequence failed silently';
				
			} else {
				
				// step succeeded
				
				if (self.pos < count) {
					
					// next sequence step
					
					var step = self.sequence.steps[ self.pos++ ];
					
					step.apply( context, prepend( next, arguments ));
					
				} else {
				
					// sequence finished
					
					if (success)
						success.apply(context, arguments);
				}
			}
		}
		
		// first step
		
		next.apply(context, opts.params || []);
		
		return this;
	};
	
	Sequencer.prototype.repeat = function (n, success, fail, opts) {
		
		opts = opts || {};
		
		var iter = 0,
			self = this,
			context = opts.context || null;
		
		function iterate() {
			
			self.reset().run(
				function iterSuccess() {
					if (iter < n) {
						iter++;
						iterate();
					} else {
						if (success)
							success.apply(context, arguments);
					}
				},
				function iterFail() {
					if (fail)
						fail.apply(context, arguments);
					else
						throw 'Repeating sequencer failed silently';
				},
				opts
			);
		}
		
		iterate();
		
		return this;		
	};
	
	Sequencer.prototype.reset = function () {
		this.pos = 0;
		this._abort = undefined;
		return this;
	};
	
	// API
	
	function sequence(steps, id) {
		return new Sequencer(steps instanceof Sequence ? steps : new Sequence(steps, id));
	}
	
	sequence.create = function (steps, id) {
		return new Sequence(steps, id);
	};
	
	return sequence;
})();