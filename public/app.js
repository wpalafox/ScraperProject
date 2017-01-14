//Collect the articles as JSON objects
console.log("test");

// Grab the articles as a json 
$.getJSON("/articles", function (data){
//For each article
for(var i = 0; i< data.length; i++){


	$("#contentDisplay").append("<div class= 'panel panel-primary' > <div class='panel-heading'><h4>" + data[i].title + "</h><button data-id='" + data[i]._id + "' class='btn btn-danger' id='save'>Save Article</button></div><div class='panel-body'><a href='"+ data[i].link +"'>"+"Click here for the story"+"</a></div></div>");


	}
});


