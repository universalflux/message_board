var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var path = require('path');


app.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect('mongodb://localhost/message_board');
app.use(express.static(path.join(__dirname + '/static')));
app.set('views', path.join(__dirname + '/views'));
app.set('view engine', 'ejs');


var Schema = mongoose.Schema;

var messageSchema = new mongoose.Schema({
 	name: String,
 	message: String,
 	comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
 });

var commentSchema = new mongoose.Schema({
	_message: {type: Schema.Types.ObjectId, ref: 'Message'},
	name: String,
	comment: String,
	created_at: {type: Date, default: new Date}

});

mongoose.model('Message', messageSchema);
var Message = mongoose.model('Message');
mongoose.model('Comment', commentSchema);
var Comment = mongoose.model('Comment');

app.get('/', function(req, res){
	Message.find({})
	.populate('comments')
	.exec(function(err, messages){
		res.render('index', {users: messages});
		})
	})

app.post('/messages', function(req, res){
	console.log(req.body);
	var message = new Message({name: req.body.name, message: req.body.message});
	message.save(function(err){
		if(err){
			console.log('Whoops, message did not save');
		} else {
			console.log('Your Message has been saved.');
		}
	})
	res.redirect('/');
});

app.post('/comments', function(req, res){
	console.log(req.body._id);
	Message.findOne({_id: req.body}, function (err, message){
		var comment = new Comment({name: req.body.name, comment: req.body.comment});
		comment._message = message._id;
		message.comments.push(comment);
		comment.save(function(err){
			message.save(function(err){
				if(err){
					console.log('Error');
				} else {
					console.log('success!');
					res.redirect('/');
				}
			})
		})
	})
})

app.listen(2020, function(){
	console.log("Listening on 2020");
});
