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
seq([func4, func5, func6]).repeat(4);

```



