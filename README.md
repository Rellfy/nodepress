# NodePress
Lightweight, dynamic blog engine for Node.

NodePress is an API-styled blog engine for Node software and servers. It will make the backend faster for you when developing a blog. NodePress uses Mongo as its DB and Socketio/Express for server-client communication. NodePress was built to be a fast and light alternative for blog integrations with Node, which should work for any website.

## How to

**1.** install it with `npm install nodepress`

**2.** add it to your server by using `javascript var NodePress = require('nodepress'); var nodePress = new NodePress();`

**3.** Server example

```javascript
// Requires
const http = require('http');
const app = require('express')();
const httpServer = http.createServer(app);
const mongoClient = require('mongodb').MongoClient;

// Internal modules
const Utils = require('./Utils.js');
const NodePress = require('./../');
const nodePress = new NodePress();

const path = __dirname + '/client';

app.use(express.static(path));

console.log('Starting HTTP server on port 80');
httpServer.listen(80);

// Change the following details to match your Mongo DB info
const dbInfo = {
	ip: 'localhost',
	port: '27017',
	name: 'myDatabase',
	requireLogon: false,
	user: 'myUser',
	pass: 'myPassword'
}

const mongoURL = Utils.getMongoURL(dbInfo);

const cfg = {
	mongoClient: mongoClient,
	mongoURL: mongoURL,
	httpServer: httpServer,
	postsPerPage: 15,
	postsCollection: 'posts'
};

nodePress.config(cfg).init(function(err){
	if (err) { throw err }
	console.log('NodePress initializated!');

	// Whenever the user/socket emits 'getPage'
	nodePress.on('getPage', function(user, pg){
		console.log('Requesting page  ' + pg);
		const startTime = new Date().getTime();

		nodePress.getPostsFromPage(pg, function(data){
			// data.last is true if the page the user is requesting
			// is the last page (which cointains the earlier posts)
			var totalTime = new Date().getTime();
			console.log('Request took ' + ((totalTime - startTime)/1000) + 's');

			nodePress.socket.to(user).emit('postsFromPage', {page: pg, posts: data.posts, last: data.last});
		});
	});

	// Whenever the user/socket emits 'post'
	nodePress.on('post', function(user, postData){
		// Check if we have all the information needed
		if (!postData.title || !postData.author || !postData.body)
			return nodePress.socket.to(user).emit('alert', 'You need to fill in all the fields!');

		nodePress.post(postData, function(err){
			if (err) { throw err };
			// Send confirmation to user
			nodePress.socket.to(user).emit('post-added');
		});
	});

});
```

Note that `nodePress.on('something', callback)` works like server-side socket.io, and it will be called everytime the client socket emit's `'something'`, and then you are able to call nodePress functions such as post or getPostsFromPage.

**4.** Client example

This is the index.html file on `/example/`. Check the example folder after install for the post example as well (publish.html).

```html
<html>
	<head>
		<title>NodePress</title>
		<link rel="stylesheet" type="text/css" href="./style.css">
	</head>
	<body>
		<header>
			<div class="inner">
				<div class="topbar">
					<a href="./"><span class="button">Home</span></a>
					<a href="./publish.html"><span class="button">Publish</span></a>
				</div>
				<h1>NodePress</h1>
				<h2>Dynamic, lightweight blog engine for node!</h2>
			</div>
		</header>
		<div class="inner">
			<div class="timeline">
				<!-- 

				########################################
				The following will be inserted by jQuery
				after receiving posts from the server,
				for each post
				########################################

				<div class="post">
					<div class="top">
						<span class="title">Ghost post!</span>
						<span class="info">
							by <span class="author">Harambe</span><br>
							on <span class="date">17 sep 2016</span>
						</span>
					</div>
					<div class="body">
						<p>Post content</p>
					</div>
				</div>

				-->
			</div>
		</div>
		<script src="/socket.io/socket.io.js"></script>
		<script src="https://code.jquery.com/jquery-3.1.0.min.js" integrity="sha256-cCueBR6CsyA4/9szpPfrX3s49M9vUU5BgtiJj06wt/s=" crossorigin="anonymous"></script>
		<script>
			var socket = io();

			var page = 1;
			var postsPerPage = 5;

			socket.emit('getPage', page);

			socket.on('postsFromPage', function(data){
				page++;
				var posts = data.posts.reverse();
				var last = data.last;

				for (var i = 0; i < posts.length; i++){
					// Append a new post box for every post at the current page
					var p = '<div class="post">\
								<div class="top">\
									<span class="title">'+posts[i].title+'</span>\
									<span class="info">\
										by <span class="author">'+posts[i].author+'</span><br>\
										on <span class="date">'+getPostDate(posts[i].date)+'</span>\
									</span>\
								</div>\
								<div class="body">\
									<p>'+posts[i].body+'</p>\
								</div>\
							</div>'
					$('.timeline').append(p);
				}

				if (!last){
					$('.timeline').append('<div class="load-more">Load More</div>');
				}
			});

			$(document).on('click', '.load-more', function(){
				console.log('requesting page  ' + page);
				socket.emit('getPage', page);
				$(this).hide();
			});

			function getPostDate(time){
				time = parseInt(time);
				var y = new Date(time).getFullYear();
				var m = new Date(time).getMonth();
				var d = new Date(time).getDate();

				var month = new Array();
				month[0] = 'jan';
				month[1] = 'feb';
				month[2] = 'mar';
				month[3] = 'apr';
				month[4] = 'may';
				month[5] = 'jun';
				month[6] = 'jul';
				month[7] = 'aug';
				month[8] = 'sep';
				month[9] = 'oct';
				month[10] = 'nov';
				month[11] = 'dec';
				m = month[m];

				return d + ' ' + m + ' ' + y;
			}
		</script>
	</body>
</html>
```

## License

MIT License
