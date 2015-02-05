#Sequence
Sequence provides a simple syntax for chaining asynchronous function calls

##Try it
You can try out Sequence here: _coming soon_

##Usage
###Create and run a sequence
Here is how to create and run a sequence.
```js
var seq = require('sequence.js');

// create and run a sequence
seq([func1, func2, func3]).run();

// create and repeat a sequence 3 times
seq([func4, func5, func6]).repeat(3);

```

###Callbacks
Pass in callbacks for when a sequence completes, or for when a sequence ends without completing.

```js
var success = function () {
  console.log('Sequence complete. Last step passed along these arguments:', arguments);
};

var fail = function () {
  console.error('Sequence did not complete.');
};

// run once with callbacks
seq([step1, step2, step3]).run( success, fail );

// repeat with callbacks
seq([step1, step2, step3]).repeat( 3, success, fail );
```

###Functions for a sequence a.k.a. "Steps"
All functions or "steps" in a sequence will be called with the first argument, a "done" function, which is to be called when an asynchronous call is finished.  The "done" function may be called with any number of arguments you wish to pass to the next step.  If a step fails, call the "done" function with *false* as the first argument, and any error details as subsequent arguments.  The arguments received by the first step in a sequence will be a "done" function, and any parameters added in the sequence settings (See: Settings).

```js

// CREATE STEPS FOR SEQUENCE

// Step 1. Get a list of new messages from API

var step1 = function (done) {
  // do a jQuery AJAX call to some endpoint
  $.ajax('http://example.com/api/messages.json')
    .done( function (messages) {
      done(messages);
    })
    .fail( function (error) {
      done(false, "HTTP Error", error);
    });
};

// Step 2. Get details for the first new message.
// Quit sequence if there are no new messages

var step2 = function (done, messages) {
  if (messages.length === 0) {
    done(false, "No new messages");
    return;
  }
  
  // get message details for first new message
  
  var firstMessage = messages[0];
  
  $.ajax('http://example.com/api/message-details/' + firstMessage.id)
    .done( function (msg) {
      done(messages, msg);
    })
    .fail( function (error) {
      done(false, error);
    });
};

// Handle any new messages received by API

var success = function (messages, firstMessage) {
  console.log('%s new messages', messages.length);
  console.log('First new message:\n', firstMessage.body);
};

// Handle sequence if it ended without completing to last step

var fail = function (error, detail) {
  if (error === "No new messages")
    console.warn('No new messages to display');
  else
    console.error('ERROR RETRIEVING NEW MESSAGES!', error, detail);
};

// Create and run the sequence

seq([step1, step2, step3]).run( success, fail );
```

###Settings
Settings are passed as a parameter when calling ```.run``` or ```.repeat```.  There are a couple of settings you can use when running a sequence: The "params" setting is an array of arguments to be passed along with the "done" function to the first step of a sequence, and the "context" setting allows you to force the context in which each step is called.  Forcing the context of steps allows you to run a single sequence against multiple targets, accessed within each step with ```this``` (See: Reusing sequences).
```js
var settings = {
  params: [
    'http://example.com/api/',
    SOME_KEY,
    SOME_TOKEN
  ],
  context: messageView
};

// run once with settings
seq([step1, step2, step3]).run( success, fail, settings );

// repeat with settings
seq([step1, step2, step3]).repeat( 3, success, fail, settings );

// run once with settings, but no callbacks
seq([step1, step2, step3]).run( null, null, settings );
```

###Reusing Sequences
Calling ```seq()``` in the above examples returns a *Sequencer* object, not a *Sequence* object.  To create a reusable Sequence object, call ```seq.create()```.
```js
// create a reusable sequence
// this example create a sequence of steps to change the color property of some LED lights
var lightShowSequence = seq.create([turnBlue, turnRed, turnGreen]);

// run this sequence on a set of LED lights
seq(lightShowSequence).run( null, null, { context: LEDs.set1 });

// wait a second, and run the same sequence on another set
seq(lightShowSequence).run( null, null, { context: LEDs.set2 });
```

###Composition
Sometimes you may want to use an existing sequence as a step in another sequence.  This is a very simple thing to do.
```js
// create a light sequence
var sequence1 = seq.create([turnBlue, turnRed, turnGreen]);

// use sequence 1 as step 3 in another sequence
var sequence2 = seq.create([turnOrange, turnMagenta, sequence1, turnTeal]);

// feel free to compose sequences as steps in any way you like
var sequence3 = seq.create([sequence1, sequence1, sequence2, sequence1, turnRed]);
```

###Abort a running sequencer
You can abort a running sequencer at any time by calling ```Sequencer.abort(callback)```.  If a callback is provided, any arguments for the last run step will be passed to that callback.
```js
var sequencer = seq([turnRed, waitTenSeconds, turnBlue, waitTenSeconds]).run(); // police lights!

// wait 4 seconds, then abort the sequencer
setTimeout( function () {

  sequencer.abort( function () {
    console.warn('Sequence Aborted!', arguments);
  });
  
}, 4000);
```
