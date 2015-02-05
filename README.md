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
  console.error('Sequence did not complete.);
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
  if (error === "No new message")
    console.warn('No new messages to display');
  else
    console.error('ERROR RETRIEVING NEW MESSAGES!', error, detail);
};

// Create and run the sequence

seq([step1, step2, step3]).run( success, fail );
