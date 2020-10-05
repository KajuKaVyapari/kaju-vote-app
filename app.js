const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Database Setup
require('dotenv').config()
const mongoose = require('mongoose')
mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true})

// Database
const pollSchema = new mongoose.Schema({
  question: String,
  votes: Number
})

const Poll = mongoose.model('Poll', pollSchema)

// Routes
const indexRouter = (req, res) => {
  res.render('index', {title: 'Kaju Voting App'})
}

const votesRouter = (req, res) => {
  Poll.find({}, (err, doc) => {
    if (err) {
      console.error(err)
    }

    res.render('votes', {votes: doc})
  })
}

const voteRouter = (req, res) => {
  Poll.findById(req.params.id, (err, voteObject) => {
    if (err) {
      console.error(err)
    }
    res.render('vote', {voteObject: voteObject})
  })
}

const newVoteRouter = (req, res) => {
  res.render('newVote', {})
}

// Handlers
const votesHandler = (req, res) => {
  Poll.create({
    question: req.query.question,
    votes: 0
  })
  res.render('status', {status: {message: "Success"}})
}

const voteHandler = (req, res) => {
  Poll.findByIdAndUpdate(req.query.id, {$inc: {'votes': 1}}, {new: true}, (err, doc) => {
    res.render('status', {status: {message: "Success"}})
  })
}
const downVoteHandler = (req, res) => {
  Poll.findByIdAndUpdate(req.query.id, {$inc: {'votes': -1}}, {new: true}, (err, doc) => {
    res.render('status', {status: {message: "Success"}})
  })
}

// App

  // GET
app.get('/votes/add', votesHandler)
app.get('/vote/add', voteHandler)
app.get('/vote/subtract', downVoteHandler)


app.get('/', indexRouter)
app.get('/votes', votesRouter)
app.get('/vote/:id', voteRouter)
app.get('/votes/new', newVoteRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404)
  res.render('status', {status: {message: "Failed", error: "Page does not exist"}});
});

module.exports = app;
// app.listen(3000)
