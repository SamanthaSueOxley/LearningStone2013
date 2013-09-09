/*
	Script for the user's home page. Learning Stone LLC. All rights reserved.
	Samantha Oxley
	Yumeng Sun
*/
var currentFolderID = 0;
var decks = new Array();
var folders = new Array();
var urlParams;
var ifnewname = "";
var fireFox = (document.getBoxObjectFor != null || window.mozInnerScreenX != null);

$(document).ready(function() {
	handleParameters();
	
	displayFolderContents();

	$('#newFolder').click(function(){
		showLightBox();
		showFolderCreationWindow();
	});
	$('#studyDeck').click(function(){
		var currentDeckID = $('#selectFolderDeckList').val();
		// Cookie name/value pair
		// Value will be comma separated list if more than one deck selected to study
		setCookie('currentDeckID', currentDeckID);
		window.location = 'study.html';
	});
	$('#newDeck').click(function(){
		showLightBox();
		showDeckCreationWindow();
	});
	$('#studyNinja').click(function(){
		showLightBox();
		showCurrentFolderDeckListWindow();
	});
	//center the new folder creation window
	$('#newF').css('top', ($(window).height() / 2) - ($('#newF').height() / 2));
	$('#newF').css('left', ($(window).width() / 2) - ($('#newF').width() / 2));
	// center the new deck creation window
	$('#newD').css('top', ($(window).height() / 2) - ($('#newF').height() / 2));
	$('#newD').css('left', ($(window).width() / 2) - ($('#newF').width() / 2));
	//center the new current folder deck select window
	$('#currentFolderDeckList').css('top', ($(window).height() / 2) - ($('#currentFolderDeckList').height() / 2));
	$('#currentFolderDeckList').css('left', ($(window).width() / 2) - ($('#currentFolderDeckList').width() / 2));
	
	$('#lightboxBackground').click(function(){
		hideLightBox();
		hideFolderCreation();
		hideCurrentFolderDeckListWindow();
		hideDeckCreation();
	});
	$('#cancelStudyDeck').click(function(){
		hideLightBox();
		hideCurrentFolderDeckListWindow();
	});
	$('#folderName').keyup(function(){
		var value = $(this).val();
		if ( value.length > 0){
			enableCreateNewFolderButton();
		}		
		else{
			disableCreateNewFolderButton();
		}		
	});
	$('#deckName').keyup(function(){
		var value = $(this).val();
		if ( value.length > 0){
			enableCreateNewDeckButton();
		}		
		else{
			disableCreateNewDeckButton();
		}		
	});
	$('#cancelCreateNewFolder').click(function(){
		hideLightBox();
		hideFolderCreation();
	});
	$('#cancelCreateNewDeck').click(function(){
		hideLightBox();
		hideDeckCreation();
	});
	$('#createNewFolder').click(function(){
		hideLightBox();
		hideFolderCreation();
		var fname = $('#folderName').val();
		$.ajax({//call server to create folder
			type: 'POST', url: 'ajax/NewFolder.php', async: false, 
			data: {
				folderName:fname,
				parentFolderID: currentFolderID,
				folderColor:$('#newFolderColor').val() 
			}, success: function (result,status,xhr) {
				var jsonObj = JSON.parse(result);
				var element = buildFolderElement(jsonObj.ID,fname.toString());
			}
		});
		$('#folderName').val('');
	});
	$('#createNewDeck').click(function(){
		hideLightBox();
		hideDeckCreation();
		var dname = $('#deckName').val();
		$('#deckName').val('');	
		//entering deck creation page, after storing currentFolderID and deck name into cookie
		setCookie('currentDeckID', '');
		setCookie('deckName',dname);
		window.location = 'newDeck.html';
		
	
	});
	//Enable/Disable buttons
	$('#selectFolderDeckList').change(function(){
		enableCancelStudyDeckButton();
		enableStudyDeckButton();
	});

});
function handleParameters() {
	var match, 
	pl = /\+/g,  // Regex for replacing addition symbol with a space
    search = /([^&=]+)=?([^&]*)/g,
    decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
    query  = window.location.search.substring(1);
    urlParams = {};
    while (match = search.exec(query))
    	urlParams[decode(match[1])] = decode(match[2]);
	if ('folderID' in urlParams) {
		currentFolderID = urlParams['folderID'];
	} else {
		currentFolderID = getCookie('currentFolderID') != null ?  parseInt(getCookie('currentFolderID')) : 0;
	}
}
function enableCancelStudyDeckButton() {
		  $("#cancelStudyDeck").attr("disabled", false);
}
function disableCancelStudyDeckButton() {
		  $("#cancelStudyDeck").attr("disabled", true);
}
function enableStudyDeckButton() {
		  $("#studyDeck").attr("disabled", false);
}
function disableStudyDeckButton() {
		  $("#studyDeck").attr("disabled", true);
}
function enableCreateNewFolderButton() {
		  $("#createNewFolder").attr("disabled", false);
}
function disableCreateNewFolderButton() {
		  $("#createNewFolder").attr("disabled", true);
}
function enableCancelCreateNewFolderButton() {
		  $("#cancelCreateNewFolder").attr("disabled", false);
}
function disableCancelCreateNewFolderButton() {
		  $("#cancelCreateNewFolder").attr("disabled", true);
}
function enableCreateNewDeckButton() {
		  $("#createNewDeck").attr("disabled", false);
}
function disableCreateNewDeckButton() {
		  $("#createNewDeck").attr("disabled", true);
}
function enableCancelCreateNewDeckButton() {
		  $("#cancelCreateNewDeck").attr("disabled", false);
}
function disableCancelCreateNewDeckButton() {
		  $("#cancelCreateNewDeck").attr("disabled", true);
}
function goDeckEdit(event){
	id = event.data.param1;
	deckName = event.data.param2;
	setCookie('currentDeckID',id); 
	setCookie('deckName',deckName);
	//setCookie('currentFolderID','');
	window.location = 'newDeck.html';
} 
function navigateToFolder(event){
	id = event.data.param1;
	ifnewname = ""; // reset ifnewname since a drill has occured
	currentFolderID = id; // reset the currentFolderId
	setCookie('currentFolderID', currentFolderID); // set the cookie
	displayFolderContents();
} 
function displayFolderContents()
{
	$('#content').empty(); // empty the content
	showBreadCrumbs();
	showFolders(); // display user's folders
	showDecks();
}
function showDecks() 
{
	$.ajax({
		type: 'POST',
		url: 'ajax/GetDecks.php',
		async: false,
		data: { folderID: currentFolderID },
		success: function (returned) 
		{
			delete decks;
			decks = new Array();
			var jsonObj = JSON.parse(returned);
			jsonObj.sort(sortJSONDecksDesc);
			for(var i=0; i<jsonObj.length; i++)
			{
				var deck = new Deck(jsonObj[i].DeckID, jsonObj[i].DeckName, jsonObj[i].ResearchGroup, [], [], 0);
				decks.push(deck);
				buildDeckElement(deck.id, deck.name);
			}
		}
	});
} 
function showFolders() 
{
	$.ajax({
		type: 'POST',
		url: 'ajax/GetFolders.php',
		async: false,
		data: { folderID: currentFolderID },
		success: function (returned) 
		{
			delete folders;
			folders = new Array();
			folders = JSON.parse(returned);
			folders.sort(sortFoldersDesc);
			for(var i=0; i<folders.length; i++){
				buildFolderElement(folders[i].FolderID, folders[i].DisplayName);
			}
		}
	});
} 
//function changeFolderName(id, name) 
function changeFolderName(event)
{ 
	id = event.data.param1;
	name = event.data.param2;
	var textF = document.createElement('input');
	textF.setAttribute('type', 'text');
	textF.setAttribute('id', 'textf');
	textF.setAttribute('size', '25');
	textF.style.fontSize="small";
	textF.style.height="10px";
	if(ifnewname.length == 0){
		textF.setAttribute('placeholder', name);
		var par = document.getElementById("f_"+id);
		par.removeChild(par.lastChild);
		par.appendChild(textF);
		textF.focus();
		textF.onchange = function() { setFolderName(); };
	}else{
		textF.setAttribute('placeholder', ifnewname);
		var par = document.getElementById("f_"+id);
		par.removeChild(par.lastChild);
		par.appendChild(textF);
		textF.focus();
		textF.onchange = function(){ setFolderName(); };
	}
} 
function setFolderName() {
	var thisname = document.getElementById("textf").value; // get value of text field
	document.getElementById("textf").blur(); // set focus off text field
	if(thisname.length < 2){
		window.alert("Please rename with at least two characters");
		showBreadCrumbs();
	}else{
		$.ajax({
			type: 'POST',
			url: 'ajax/ChangeFolderName.php',
			async: false,
			data: {
				folderID: currentFolderID,
				newName: thisname },
			error: function(request, status, error){ alert(request.responseText); },
			success: function(result){
				var node = document.createTextNode(thisname);
				var par = document.getElementById("f_"+currentFolderID);
				par.removeChild(par.lastChild);
				par.appendChild(node);
				ifnewname = thisname;
			}
		});
	}
} 
function showBreadCrumbs() {
	$('#breadcrumb').empty();
	//We neeed to change the following breadcrumb to use an icon because we shouldn't hardcode any displayable text in javascript
	document.getElementById('breadcrumb').innerHTML += '<li id=f_0 b_id=0><a name="0" >Desktop</li>';
	$('#f_0').click({param1: 0},navigateToFolder);
	$("#f_0").droppable({
		 greedy: "true",
		 scope: "yes",
		 tolerance: "pointer",
		 drop: breadcrumbDrop ,
		 hoverClass: "ui-state-active"		 
	});
	$.ajax({
		type: 'POST',
		url: 'ajax/GetParentFolders.php',
		async: false,
		data: { folderID: currentFolderID },
		success: function (returned) {
			if (returned.length > 1 ) {
				folders = JSON.parse(returned);
				for(var i = folders.length-2; i >=0; i--) {
					// create variables for id and name
					var fid = folders[i].FolderID;
					var fname = folders[i].DisplayName;
					// create the new elements to append to html
					var li = document.createElement("li");
					var a = document.createElement("a");
					var theid = "f_"+fid;
					a.setAttribute("b_id", fid);
					a.setAttribute("id", theid);
					a.setAttribute("name", fid);
					var node = document.createTextNode(fname);
					a.appendChild(node);
					li.appendChild(a);
					document.getElementById('breadcrumb').appendChild(li);
					if(i == 0) {
						$('#'+theid).click( {param1: fid, param2: fname},changeFolderName);
					} else {
						$('#'+theid).click({param1: fid},navigateToFolder);
					}
					$("#"+theid).droppable(
						{ greedy: "true" ,
						 scope: "yes" ,
						 tolerance: "pointer" ,
						 drop: breadcrumbDrop, 
						 hoverClass: "ui-state-active"}
					);
				}
			}
		}
	});
} function buildDeckElement(id, name) { // BUILD DECKS
	// create the first div & set it's attributes
	var div1 = document.createElement("div");
	div1.setAttribute("class", "flashcard");
	div1.setAttribute("deckID", id);
	div1.setAttribute("draggable", "true");
	var elementID = "d_"+id;
	div1.setAttribute("id",elementID);
	// create the second div & set it's attribute & onclick method
	var div2 = document.createElement("div");
	div2.setAttribute("class", "flashcard_icon");
	// create p element & it's text node
	var p1 = document.createElement("p");
	p1.setAttribute("class", "flashcard_name");
	var node = document.createTextNode(name);
	//now add all childs to their parent
	p1.appendChild(node);
	div2.appendChild(p1);
	div1.appendChild(div2);
	document.getElementById('content').appendChild(div1);
	// drag & drop via jquery
	$('#'+elementID).draggable(
		{ containment: $('body') },
		{ distance: 10 },
		{ opacity: 0.5 },
		{ revert: "invalid" },
		{ revertDuration: 100 },
		{ scope: "yes" },
		//{ scrollSpeed: 10 },
		//{ stack: ".breadcrumb" }
		{ helper: function(){
				$copy = $(this).clone();
				return $copy;
			}
		},
		{ scroll: false },
		{ appendTo: 'body' }
	);
	$('#'+elementID).click({param1:id, param2:name},goDeckEdit);
} 
function buildFolderElement(id, name) { //BUILD FOLDERS
	var elementID = "folder_"+id;
	var divf = document.createElement("div");
	divf.setAttribute("class", "folder");
	divf.setAttribute("folderID", id);
	divf.setAttribute("draggable", "true");	
	divf.setAttribute("id", elementID);
	var divf2 = document.createElement("div");
	divf2.setAttribute("class", "folder_icon");
	var pf = document.createElement("p");
	pf.setAttribute("class", "folder_name");
	var nodef = document.createTextNode(name);
	pf.appendChild(nodef);
	divf2.appendChild(pf);
	divf.appendChild(divf2);
	document.getElementById('content').appendChild(divf);
	setFolderEvents(id);
} 
function setFolderEvents(id) {
	var elementID = "folder_"+id;
	$("#"+elementID).draggable(
		{ containment: $('body') },
		{ distance: 10 },
		{ opacity: 0.5 },
		{ revert: "invalid" },
		{ revertDuration: 100 },
		{ scope: "yes" },
		//{ scrollSpeed: 10 },
		//{ stack: ".breadcrumb" }
		{ helper: function(){
				$copy = $(this).clone();
				return $copy;
			}
		},
		{ scroll: false },
		{ appendTo: 'body' }
	);
	$("#"+elementID).droppable(
		{ greedy: "true" },
		{ scope: "yes" },
		{ tolerance: "intersect" },
		{ drop: activateDrop }
	);
	$("#"+elementID).click({param1:id},navigateToFolder);
}
function activateDrop(event, ui) { 
	doDrop("folderID", event, ui);
} 
function breadcrumbDrop(event, ui) { 
	doDrop("b_id",event,ui);
}
function doDrop(theID, event, ui) { // function to activateDrop & call to ajax
	var whatdrag = ui.draggable.attr("folderID");
	if(typeof whatdrag == 'string'){
		var dragged = ui.draggable.attr("folderID");
		var dropped = event.target.getAttribute(theID);
		$.ajax({
			type: 'POST',
			url: 'ajax/MoveFolder.php',
			async: false,
			data: { folderID: dragged, 
					newParentFolderID: dropped 
			}, success: function (result){
				// if the drop is successful, hide the dragged folder 
				ui.draggable.remove();
			}
		});
	}else if(typeof whatdrag == 'undefined'){
		var dragged = ui.draggable.attr("deckID");
		var dropped = event.target.getAttribute(theID);
		$.ajax({
			type: 'POST',
			url: 'ajax/MoveDeck.php',
			async: false,
			data: { deckID: dragged, 
					currentFolderID: currentFolderID,
					newParentFolderID: dropped 
			}, success: function (result){
				// if the drop is successful, hide the dragged folder 
				//dragged.remove();
				ui.draggable.remove();
			}
		});
	}
}
function showLightBox(){ 
	$('#lightboxBackground').css('display', 'block');
	$('#lightboxBackground').animate({opacity: 0.6}, 500);
} 
function hideLightBox() {
	$('#lightboxBackground').animate({opacity: 0}, 500, function() { 
		$('#lightboxBackground').css('display', 'none'); 
	});
} 
function showFolderCreationWindow(){
	$('#newF').css('display','block');
	$('#newF').animate({opacity:1},500);
	disableCreateNewFolderButton();
} 
function showDeckCreationWindow(){
	$('#newD').css('display','block');
	$('#newD').animate({opacity:1},500);
	disableCreateNewDeckButton();
}  
function hideFolderCreation(){
	$('#newF').css('display','none');
	$('#newF').animate({opacity:0},500);
}
function hideDeckCreation(){
	$('#newD').css('display','none');
	$('#newD').animate({opacity:0},500);
} 
function sortFoldersDesc(a,b) {
  if (a.DisplayName.toLowerCase() > b.DisplayName.toLowerCase())
     return 1;
  if (a.DisplayName.toLowerCase() < b.DisplayName.toLowerCase())
    return -1;
  return 0;
} 
function sortJSONDecksDesc(a,b) { // sort this on initial display
  if (a.DeckName.toLowerCase() > b.DeckName.toLowerCase())
     return 1;
  if (a.DeckName.toLowerCase() < b.DeckName.toLowerCase())
    return -1;
  return 0;
}  
function showCurrentFolderDeckListWindow(){
	$('#currentFolderDeckList').css('display','block');
	$('#currentFolderDeckList').animate({opacity:1},500);
	createDeckSelectListBox();
	disableStudyDeckButton();	
} 
function hideCurrentFolderDeckListWindow(){
	$('#currentFolderDeckList').css('display','none');
	$('#currentFolderDeckList').animate({opacity:0},500);
} 
function createDeckSelectListBox() {
	$('#selectFolderDeckList').empty();
	$('#currentFolderDeckList .mselect-list').remove();
	$('#selectFolderDeckList').removeClass('mselect-hidden');
	$.each( decks, function( i,Deck ) 
	{
		$('#selectFolderDeckList').append('<option value='+ Deck.id +'>' + Deck.name + '</option>');
	});

	$('#selectFolderDeckList').multiselect({toggleAddButton : false});
	$('.mselect-list-item :checkbox').click(function(){
		if ($('#selectFolderDeckList').val())
			enableStudyDeckButton();
		else
			disableStudyDeckButton()
			
	});
	$('.mselect-button-add').hide();
} 

