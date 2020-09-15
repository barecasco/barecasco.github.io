/*
	Promise is the proxy for the value not necessarily known
	when a promise is created. Promise allows yout to associate
	the handlers with an asynchronous action's eventual success or failure reason.

	A promise has 3 states. They are:
	1. pending
	2. fulfilled
	3. rejected
*/

// Promise
function square(x) {
	return new Promise( function(resolve) {
		setTimeout(function(){
			resolve(Math.pow(x, 2));
		}, 2000);
	});
}

function summon_square(x) {
	square(x).then(function(value){
		console.log("the value of the square is", value);
	});
}