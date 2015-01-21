CircleCoaster
=

An animated spinner in CSS3 that looks like dots riding on a circular roller coaster

This JavaScript library generates CSS3, inserts style tags, and inserts HTML that renders the spinner.

**[Demo](http://sandbox.kendsnyder.com/CircleCoaster/demo.html)**


Usage
-

Include CircleCoaster.js

```html
<script src="path/to/CircleCoaster.min.js"></script>
```

Use JavaScript to insert the spinner.

```
new CircleCoaster({
	size: 128,        // Size of the circle in pixels
	speed: 1,         // Number of seconds for one revolution
	dots: 5,          // Number of dots that revolve
	color: "#666666"  // Color of the dots
}).inject(document.getElementById('preview'));

// or jQuery:
$('#preview').circleCoaster({
	size: 128,
	speed: 1,
	dots: 5,
	color: "#666666"
});
```


API
-

A CircleCoaster instance has 3 main methods:

.inject(intoElement)
--

Set the innerHTML of `intoElement`


.append(toElement)
--

Append the circle coaster as a child of `toElement`


.remove(fromElement)
--

Remove a circle coaster that was injected into or appended to `fromElement`. It also removes the CSS block if it is not being used by another CircleCoaster instance.


- License

Copyright 2015 Ken Snyder

[MIT License](http://www.opensource.org/licenses/mit-license.php)