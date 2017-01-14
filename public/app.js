//Collect the articles as JSON objects

function reloadArticles(){
	
	$.getJSON("/articles", function(data){
		//Remove previously placed articles		
		$("#articles").empty();
		
		//For each one
		for(var i = 0; i < data.length; i++){
			var commentsCount;
			
			if(data[i].note.length > 0){
				commentsCount = data[i].note.length;	
			}
		
		
		//Displaying the apropos
		$("#articles").append("<p class='title' data-id='" + data[i]._id + "'>" + data[i].title + "  -  <a href='" + data[i].link + "'>Link</a></p>" + "<a data-id='"+ 
        data[i]._id + "' href='#notes' data-target='notes' class='showNotes modal-trigger waves-effect waves-light btn  blue darken-1'>Comments ("+ data[i].note.length + ")</button>");
      	
      }
	
	});

}


reloadArticles();   
