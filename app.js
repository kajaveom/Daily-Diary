const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/diaryDB");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// Schema

const contentSchema = new mongoose.Schema({
    date : String,
    content : String
});

const Page = mongoose.model('page', contentSchema);

app.get("/", function(req, res){
    //res.sendFile(__dirname + "/views/portfolio.html");

    Page.findOne({ date : getTodayDate() }, function(err, foundPage){

          if(foundPage == null){
            res.render("index" , {date : getTodayDate() , todayContent : "You have not written today's diary"} );
          }
          else if(err){
            console.log(err);
          }
          else{
            res.render("index" , {date : getTodayDate() , todayContent : foundPage.content} );
          }
    });


});

app.post("/create", function(req, res){

    res.redirect("/create");




});


app.get("/create", function(req, res){

      Page.findOne({date : getTodayDate()}, function(err, foundPage){
          if(err){
            console.log(err);
          }
          else if(foundPage == null){
              res.render("create", {date : getTodayDate(), content : ""});
          }else {
              res.render("create", {date : getTodayDate(), content : foundPage.content});
          }
      });


});

app.post("/post", function(req, res){

      if (req.body.action == 'post') {

        const options = {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true
          };

        Page.findOneAndUpdate({date : getTodayDate()}, {content : req.body.content },options, function(err, result){
          if(err){
            console.log(err);
          }

        });

        setTimeout( function(){
            res.redirect("/");
        } , 1500);





    } else if (req.body.action == 'clear') {

          console.log("clear");
          Page.findOneAndUpdate({date : getTodayDate()}, {content : ""}, function(err){
            if(err){
              console.log(err);
            }
          });

          res.render("create", {date : getTodayDate(), content : ""});

      } else {
        console.log("Error");
      }




});

app.get("/mydiary", function(req, res){

      Page.findOne({ date : getTodayDate()}, function(err, foundPage){
            if(foundPage == null){
              res.render("mydiary", {date : getTodayDate(), content : "You have not written today's diary"});
            }
            else if(!err){
              res.render("mydiary", {date : foundPage.date , content : foundPage.content});
            }
            else{
              console.log(err);
            }
      });

});

app.post("/mydiary", function(req, res){

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const year = req.body.searchDate.substring(0,4);
  const month = months[parseInt(req.body.searchDate.substring(5,7)) - 1];
  const day = req.body.searchDate.substring(8,10);

  const formattedDate = day + " " + month + " " + year;


  Page.findOne({ date : formattedDate }, function(err, foundPage){
        if(foundPage == null){
          res.render("mydiary", {date : formattedDate, content : "You have not written diary on this day"});
        }
        else if(!err){
          res.render("mydiary", {date : foundPage.date , content : foundPage.content});
        }
        else{
          console.log(err);
        }
  });

});



function getTodayDate(){
  const date = new Date().toUTCString().slice(5, 16);
  return date;
}


app.listen(3000, function(){
  console.log("Server started on port 3000");
});
