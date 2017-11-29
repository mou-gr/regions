

var app = new Vue({
	el: "#hello-world-app",
	data: {
		msg: 'wait',
		invitation: []
	}
});

axios.get('http://localhost:4000/invitation')
	.then((response) => {
		app.invitation = response.data
		console.log(response);
	})
