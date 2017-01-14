
// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

// Requiring our Note and Article models
var Note = require("./models/notes.js");
var Article = require("./models/articles.js");

// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");

//Default Mongoose mpromise deprecated 
var Promise = require("bluebird");

mongoose.Promise = Promise;


// Initialize Express
var app = express();



// morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));



// Make public a static dir
app.use(express.static("public"));

// Database configuration with mongoose
mongoose.connect("mongodb://localhost/homeworkScraper");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});


// Routes
// =====================================================================

// Simple index route
app.get("/", function(req, res) {
  res.send(index.html);
});


// A GET request to scrape the nytimes website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  request("http://www.nytimes.com/es/", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // Now, we grab every h2 within an article tag, and do the following:
    $('h2.headline').each(function(i, element) {

      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");

      
       // Using findOneAndUpdate sorts through and ensures unique Articles. 
      Article({"title":result.title},{$set: {"title":result.title, "link":result.link}}, {upsert:true}, function(err, doc) {
        // Log any errors
        if (err) {
        }
      });
      
      // Using our Article model, create a new entry
      // This effectively passes the result object to the entry (and the title and link)
      var entry = new Article(result);

      // Now, save that entry to the db
      entry.save(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        // Or log the doc
        else {
          console.log(doc);
        }
      
      });
    



    });
  });
  // Tell the browser that we finished scraping the text
  res.sendStatus(200);
});


// This will get the articles we scraped from the mongoDB
app.get("/articles", function(req, res) {
  
  // TODO: Finish the route so it grabs all of the articles
  Article.find({}, function(error, article){

    if(error){
      
      res.send(error);
    
    }
    
    else{
      
      res.json(article);
    
    }

  });

});


//Save articles to database
app.post("/save/:id?", function(req, res) {
        Article.findOneAndUpdate({ "_id": req.params.id }, {"saved": true })
        // Execute the above query
        .exec(function(err, doc) {
          // Log any errors
          if (err) {
            console.log(err);
          }
          else {
           
            console.log(doc);
          }
        });
  });



//Link to saved articles 
app.get("/save", function(req, res){
    Article.find({"saved" : true}).populate("note").exec(function(error, doc){
        if(error){
            console.log(error)
        }
        else{
            res.json(doc)
        }
        console.log(doc);
    });
});



app.post("/remove/:id?", function(req, res) {
    
        Article.findOneAndRemove({ "_id": req.params.id }, {"saved": true })
        // Execute the above query
        .exec(function(err, doc) {
          // Log any errors
          if (err) {
            console.log(err);
          }
          else {
           
            console.log(doc);
          }
        });
  });


// Grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({ "_id": req.params.id })
  // ..and populate all of the notes associated with it
  .populate("note")
  // now, execute our query
  .exec(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise, send the doc to the browser as a json object
    else {
      res.json(doc);
      console.log(doc);
    }
  });
});



// Create a new note or replace an existing note
app.post("/articles/:id", function(req, res){
  // Create a new note and pass the req.body to the entry
  var newNote = new Note(req.body);
  console.log(req.body);
  
  // And save the new note the db
  newNote.save(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise
    else {
      // Use the article id to find and update it's note
      Article.findOneAndUpdate({ "_id": req.params.id }, {$push: { "note": doc._id }})
      // Execute the above query
      .exec(function(err, newdoc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        else {
          // Or send the document to the browser
          res.send(newdoc);
        }
      });
    }
  });
});
//=================================================================================================================

  app.get("/notes", function(req, res) {
    Note.find({}, function(error, doc) {
    // Send any errors to the browser
      if (error) {
        res.send(error);
      }
      // Or send the doc to the browser
      else {
        res.send(doc);
      }
    });
  });

//delete a note route
/*
app.post("/articles/:id/delete", function(req,res){
  console.log("the note will delete now");
  console.log(req.params.id);
  console.log(req.body);
  
  Note.remove({"_id":req.params.id}, function(data){
    console.log(data)
  })

  Article.findOneAndUpdate({"_id": req.body.article}, { $pull:{"note": req.params.id}}, function(err){
    if (err) console.log(err);
  })
});
*/




// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});
