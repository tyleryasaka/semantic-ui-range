# semantic-ui-range
Add-on range slider for Semantic UI

[Demo](http://codepen.io/tyleryasaka/pen/KVqPbo)

I created the range slider for Semantic UI when I found that one currently did not exist.

The range slider is responsive and works for both mouse and touchscreen on all the devices it has been tested on. It uses standard css/javascript (no hacks) so it should render well on just about any remotely modern device. That said I have not thoroughly tested it, so let me know if you encounter any bugs.

To use these ranges, just add the range.js and range.css files in this repo to your project. To create a range instance, you'll need to do 2 things. First, the HTML:

	<div class="ui range" id="my-range"></div>

Then you'll need to instantiate it with jQuery:

	$(document).ready(function() {
		$('#my-range').range({
			min: 0,
			max: 10,
			start: 5
		});
	});

And that's it. Notice the settings object you pass into the jQuery function. There are 5 settings you can pass in:
* min - the lowest value (inclusive) of the range
* max - the highest value (inclusive) of the range
* start (optional) - the initial value of the range (must be between min and max)
* input (optional) - A jQuery identifier string (such as '#my-input') to specify an html input to receive the new range value each time it is changed
* onChange (optional) - function to call each time the value of the range changes; a single parameter with the new value is passed to this function

So you can specify an html input or use your own custom function to receive the range value. Check out the [demo](http://codepen.io/tyleryasaka/pen/KVqPbo) for examples.
