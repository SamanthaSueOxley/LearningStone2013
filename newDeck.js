/**
	Script for edit Deck page. The Learning Stone LLC. All rights reserved.
	@author Yumeng Sun & Samantha Oxley
*/
var currentFolderID;
var currentDeckID;
var currentCardID;

var dname;
var scroll;
var currentDeck;
var currentString = "<em><i>Current Card</i></em>";
var oldCardNum = 1;
var layoutNum = 0;
var colorMenu = false;

$(document).ready(function()
{
	showBreadCrumbs();
	
	getCards();
	loadFontChangeListeners();
	tinymceLoad("#content1");
	tinymceLoad("#content2");
	editTools(1);
	editTools(2);
	loadEditTools(1);
	loadEditTools(2);

	$('#colorSelector').click(function(){
		if(!colorMenu){
			$('#colors').animate({left:'0px'},200,null,function(){$('#colorMenu').toggle('slow');});
		}else{
			$('#colorMenu').toggle('slow',function(){$('#colors').animate({left:'100px'},200);});
		}
		colorMenu = colorMenu ? false : true;
	});
	$('#blueCard').click(function(){
		setCardColor('blueCard');
	});
	$('#greenCard').click(function(){
		setCardColor('greenCard');
	});
	$('#whiteCard').click(function(){
		setCardColor('whiteCard');
	});
	$('#orangeCard').click(function(){
		setCardColor('orangeCard');
	});
	$('#pinkCard').click(function(){
		setCardColor('pinkCard');
	});
	$('#purpleCard').click(function(){
		setCardColor('purpleCard');
	});
	$('#study').click(function(){
		window.location='study.html';
	});
	$('.editBar').css('visibility','hidden');
	$('#side1').click(function(){
		$('#editBar1').css('visibility','visible');
		$('#editBar2').css('visibility','hidden');
	});
	$('#side2').click(function(){
		$('#editBar1').css('visibility','hidden');
		$('#editBar2').css('visibility','visible');
	});
	$('#starCard').click(function(){
		starCard();
	});
	$('#deckName').change(function(){
		changeDeckName();
	});
	$('#content1').blur(function(){
		saveCard();
	});
	$('#content2').blur(function(){
		saveCard();
	});
	$('#addBefore').click(function(){
		saveCard();
		var cardNum = parseInt($('#cardNum').val());
		$('#cardNum').val(cardNum);
		createCard(false,currentCard.sortIndex);
		scrollGalleryToCurrentCard();
	});
	$('#addAfter').click(function(){
		saveCard();
		var cardNum = parseInt($('#cardNum').val())+1;
		$('#cardNum').val(cardNum);
		createCard(true,currentCard.sortIndex);
		scrollGalleryToCurrentCard();
	});
	$('#previousCard').click(function(){
		saveCard();
		currentCard = currentDeck.MoveToPreviousCard();
		currentCardID = currentCard.id;
		displayCurrentCard();
		scrollGalleryToCurrentCard();
	});
	$('#nextCard').click(function(){
		saveCard();
		currentCard = currentDeck.MoveToNextCard();
		currentCardID = currentCard.id;
		displayCurrentCard();
		scrollGalleryToCurrentCard();
	});
	$('#cardNum').change(function(){
		var cardNum = parseInt($('#cardNum').val());
		var oldCardID = currentCard.id;
		//MoveToCard will pin the value at the max or minimum array index
		currentCard = currentDeck.MoveToCard(cardNum);
		currentCardID = currentCard.id;
		$('#cardNum').val(currentCard.sortIndex);

		if(oldCardID != currentCardID){
			displayCurrentCard();
			scrollGalleryToCurrentCard();
		}
	});
	$('#saveChangesBtn').click(function(){
		saveChanges();
	});
	$('#trash').click(function(){
		var del = confirm("Delete this card? Delete is permanent.");
		if(del){
			deleteCurrentCard();
		}
	});
	$('#imgConfirm1').click(function(){
		saveCard();
	});
	$('#imgConfirm2').click(function(){
		saveCard();	
	});
	$('#spreadCards').click(function(){
		openExtendedGallery();
	});
	//enter key during input image URL
	$('#img1').keydown(function(e){
		if(e.keyCode == 13) {//enter key pressed
			$('#imgConfirm1').click();
		}
	});$('#img2').keydown(function(e){
		if(e.keyCode == 13) {//enter key pressed
			$('#imgConfirm2').click();
		}
	});
	shrinkFont('#content1');
	shrinkFont('#content2');
	$('#side1').bind({
		dragenter: function(e) {
			//e.effectAllowed= 'copy';
			$(this).addClass('highlighted');
			return false;
		},
		dragover: function(e) {
			//e.effectAllowed= 'copy';
			e.stopPropagation();
			e.preventDefault();
			return false;
		},
		dragleave: function(e) {
			$(this).removeClass('highlighted');
			return false;
		},
		drop: function(e) {
			var file = e.originalEvent.dataTransfer.files[0];
			console.log(file);
			var reader = new FileReader();
			console.log(reader.readAsDataURL(file));
			return false;
		}
	});
	$(document).bind({
		dragenter: function(e) {
			e.stopPropagation();
			e.preventDefault();
			var dt = e.originalEvent.dataTransfer;
			dt.effectAllowed = dt.dropEffect = 'none';
		},
		dragover: function(e) {
			e.stopPropagation();
			e.preventDefault();
			var dt = e.originalEvent.dataTransfer;
			dt.effectAllowed = dt.dropEffect = 'none';
		}
	});
});
/*	Check for unsaved changes before leaving the page */
window.onbeforeunload = function() { saveChanges(); saveCard(); };
/* Gets the cards of the deck, or creates a deck */
function getCards() {
	currentFolderID = getCookie('currentFolderID');
	if(getCookie('currentDeckID') != ''){
		currentDeckID = getCookie('currentDeckID'); // if the deck exists, set the global variable
		dname = getCookie('deckName'); // get the dname from cookie
		$('#deckName').val(dname);
		currentDeck = new Deck(currentDeckID, dname,[0,1,2,3], [true,false], 1);
		currentDeck.GetAllCards();
		currentCard = currentDeck.currentCard;
		currentCardID = currentCard.id;
		displayCurrentCard();
	}else {
		//if no deckID, create deck
		createDeck();
		createCard(false,1);
	}	

	setupPreviousNextButtons();
	showGallery();
}
function setupPreviousNextButtons(){
	// if there is less than 2 cards in the deck, remove the next and previous buttons
	if(currentDeck.cards.length < 2){
		$('#nextCard').addClass('disable');
		$('#previousCard').addClass('disable');
		document.getElementById('nextCard').disabled = true;
		document.getElementById('previousCard').disabled = true;
	}else{		
		$('#nextCard').removeClass('disable');
		$('#previousCard').removeClass('disable');
		document.getElementById('nextCard').disabled = false;
		document.getElementById('previousCard').disabled = false;
	}
}
function openExtendedGallery(){ /* This function is triggered on click of #spreadcards icon, it opens the lightbox sort gallery */
	$('#galleryPane').css('display', 'block');
	$('#galleryPane').css('z-index', '101');
	$('#closeGalleryButton').css('display', 'block');
	$('#closeGalleryButton').click(function(){
		closeGallery();
	});
	//future coders: this can be optimized to use insertPreviewElem() to save some ~20 lines :)
	for( var i = 0; i < currentDeck.cards.length; i++ ){
		// get the font side of every card text & layout and id
		var content = currentDeck.cards[i].sides[0].text;
		var layout = currentDeck.cards[i].sides[0].imageLayout;
		var cardId = currentDeck.cards[i].id;
		var image = currentDeck.cards[i].sides[0].image;
		// create DOM element 
		var ulItem = document.createElement("li");
		
		// We can attach any kind of data we want to the DOM. Here I'm associating the card object directly with 
		//the list item. Then we retrieve that later when the user drags and drops
		//the card (see the update() function just below. When the user clicks on
		//any DOM object, we can simply get the folder, deck or card associated with it!!
		//See: http://api.jquery.com/data/
		$(ulItem).data('card', currentDeck.cards[i]);
		
		var text = document.createElement("div");
		text.setAttribute("id", "text_"+cardId);
		var div = document.createElement("div");
		div.setAttribute("class", "sortElement");
		div.setAttribute("id", "card_"+cardId);
		// append Children
		div.appendChild(text);
		ulItem.appendChild(div);
		document.getElementById('galleryList').appendChild(ulItem);
		document.getElementById("text_"+cardId).innerHTML = content;
		$('#card_'+cardId).addClass(currentDeck.cards[i].style); // show the color of the card
		layoutPreviewImg("text_", "card_", "imagePreview", layout, cardId, image); // show the layout
		shrinkFont("#text_"+cardId);
	}
	$( "#galleryList" ).sortable({
		update: function( event, ui ) {
			var theCard = $(ui.item).data('card');
			var oldIndex = theCard.sortIndex;
			var newIndex = ui.item.index();

			currentDeck.moveCard(oldIndex-1, true, newIndex);
			currentDeck.sortCards();
			// update gallery without reload
		}
	});
    $( "#galleryList" ).disableSelection();
}
function closeGallery(){ /* This function is triggered by the small 'close' button in the lightbox sort gallery */
	$('#galleryList').empty(); //MADE CHANGE HERE, IF BREAKS CHANGE BACK TO #galleryPane
	$('#galleryPane').animate({opacity: 0}, 500, function(){
		$('#galleryPane').css('display', 'none');
	});
	$('#closeGalleryButton').css('display', 'none');
}

function showGallery(){ /* this gallery creates the scrolling gallery at the bottom of newDeck.html */
	$('#cardScroll').empty();
	for( var i = 0; i < currentDeck.cards.length; i++ ){
		// somewhere we need to reset the indices, currentDeck.cards[i].sortIndex = i+1;
		insertPreviewElem(currentDeck.cards[i],0,false);
	}
	$('#scrollEle'+currentDeck.currentCard.id).addClass('selectedThumbnail');
	//This needs to be done for the first time after thumbnails have been
	//added to the DOM. Otherwise smoothDivScroll doesn't work correctly.(i.e. it won't initialize)
	$('#cardScroll').smoothDivScroll({ 
		hotSpotScrolling: true, touchScrolling: false 
	});
}
function insertPreviewElem(_card, _locationCardID, _bAfter){
	// get the front side of every card text & layout and id
	var content = _card.sides[0].text;
	var layout = _card.sides[0].imageLayout;
	var cardId = _card.id;
	var image = _card.sides[0].image;
	// create DOM element 
	var text = document.createElement("div");
	text.setAttribute("id", "preview_"+cardId);
	var div = document.createElement("div");
	div.setAttribute("class", "scrollElement");
	div.setAttribute("id", "scrollEle"+cardId);
	// append Children
	div.appendChild(text);
	if (_locationCardID == 0)
		$('#cardScroll').append(div);
	else{
		locationDiv = "#scrollEle"+_locationCardID;
		if (_bAfter)
			$(div).insertAfter(locationDiv);
		else
			$(div).insertBefore(locationDiv);
	}
	$("#preview_"+cardId).html(content);
	layoutPreviewImg("preview_", "scrollEle", "imagePrev", layout, cardId, image);
	// handle event for clicking on cards
	$('#scrollEle'+cardId).addClass(_card.style);
	$('#scrollEle'+cardId).click({param1: cardId}, moveToCard);
	shrinkFont("#preview_"+cardId);
}
/* On click of preview card in scroll gallery, navigates to that card */
function moveToCard(event){
	var cardId = event.data.param1;
	$('#scrollEle'+currentDeck.currentCard.id).removeClass('selectedThumbnail');
	currentCard = currentDeck.MoveToCard($('#cardScroll .scrollElement').index(event.currentTarget)+1);
	$('#scrollEle'+currentDeck.currentCard.id).addClass('selectedThumbnail');
	currentCardID = currentCard.id; // set global before calling displayCurrentCard
	displayCurrentCard();
}
function scrollGalleryToCurrentCard(){
	//sync the scroll gallery with the currently displayed card
	//the currently displayed card should be in the center of the gallery
	var offset = Math.round($('#cardScroll').width()/$('.scrollElement').width()/2);
	var scrollTo = currentCard.sortIndex - offset+1;
	scrollTo = Math.max(1, scrollTo);
	$("#cardScroll").smoothDivScroll("jumpToElement", "number", scrollTo);
	$('.scrollElement').removeClass('selectedThumbnail');
	$('#scrollEle'+currentDeck.currentCard.id).addClass('selectedThumbnail');
}
/* Updates the SCROLL gallery for the card currently being edited, updates text, layout, image and style */
function updateGallery(){
	var currentCard = currentDeck.currentCard;
	var content = currentCard.sides[0].text;
	var layout = currentCard.sides[0].imageLayout;
	var cardId = currentCard.id;
	var image = currentCard.sides[0].image;
	$('#scrollEle'+cardId).addClass(currentCard.style);
	document.getElementById("preview_"+cardId).innerHTML = content;
	layoutPreviewImg("preview_", "scrollEle", "imagePrev", layout, cardId, image);
	shrinkFont("#preview_"+cardId);
}
/* This function is similar to layoutImgDiv, but is used for BOTH the scroll gallery and the extended sort gallery.
it takes 6 parameters, the first three were added to allow this function to be used to layout images for both scroll and sort
galleries. 
	_content : the beginning of the id for gallery's text content. see _preview in showGallery & _text in openExtendedGallery
	_element : the beginning of the id for gallery's scroll/sort elements. scrollEle in showGallery, _card in openExtendedGallery
	_imgDivName : the name of the imgDiv for the elements.. 
	_layout: an integer 1-6
	_cardId: the integer of the card's id
	_image: the url of the image for the card
*/
function layoutPreviewImg(_content, _element, _imgDivName, _layout, _cardId, _image){
	var content = _content;
	var element = _element;
	var imgDivName = _imgDivName;
	var cardId = _cardId;
	var layout = _layout;
	var image = _image;
	if(layout != 1){
		var imgDiv = document.createElement("div");
		imgDiv.setAttribute("id", imgDivName+cardId);
		document.getElementById(element+cardId).appendChild(imgDiv);
		switch(layout){
			case 2: // image only
				document.getElementById(imgDivName+cardId).style.backgroundImage = "url('"+image+"')";
				$("#"+content+cardId).removeClass('scrollImgNone scrollImgLeft scrollImgBottom scrollImgRight');
				$("#"+content+cardId).addClass('scrollImgOnly');
				$('#'+imgDivName+cardId).removeClass('imageShowNone imageShowLeft imageShowBottom imageShowRight');
				$('#'+imgDivName+cardId).addClass('imageShowOnly');
				break;
			case 3: // image left
				document.getElementById(imgDivName+cardId).style.backgroundImage = "url('"+image+"')";
				$("#"+content+cardId).removeClass('scrollImgNone scrollImgOnly scrollImgBottom scrollImgRight');
				$("#"+content+cardId).addClass('scrollImgLeft');
				$('#'+imgDivName+cardId).removeClass('imageShowNone imageShowOnly imageShowBottom imageShowRight');
				$('#'+imgDivName+cardId).addClass('imageShowLeft');
				break;	
			case 5: // image bottom
				document.getElementById(imgDivName+cardId).style.backgroundImage = "url('"+image+"')";
				$("#"+content+cardId).removeClass('scrollImgNone scrollImgLeft scrollImgOnly scrollImgRight');
				$("#"+content+cardId).addClass('scrollImgBottom');
				$('#'+imgDivName+cardId).removeClass('imageShowNone imageShowLeft imageShowOnly imageShowRight');
				$('#'+imgDivName+cardId).addClass('imageShowBottom');
				break;
			case 6: // image right
				document.getElementById(imgDivName+cardId).style.backgroundImage = "url('"+image+"')";
				$("#"+content+cardId).removeClass('scrollImgNone scrollImgLeft scrollImgBottom scrollImgOnly');
				$("#"+content+cardId).addClass('scrollImgRight');
				$('#'+imgDivName+cardId).removeClass('imageShowNone imageShowLeft imageShowBottom imageShowOnly');
				$('#'+imgDivName+cardId).addClass('imageShowRight');
				break;
		}
	}else{
		$("#"+content+cardId).removeClass('scrollImgOnly scrollImgLeft scrollImgBottom scrollImgRight');
		$("#"+content+cardId).addClass('scrollImgNone');
		$('#'+imgDivName+cardId).removeClass('imageShowOnly imageShowLeft imageShowBottom imageShowRight');
		$('#'+imgDivName+cardId).addClass('imageShowNone');
	}
}
//creat a new deck, only fires when entering this page through creating deck button
function createDeck(){
	if(	$('#deckName').val() == '' || $('#deckName').val() == null || $('#deckName').val() == undefined ){
		dname = 'newdeck';
	}else{
		dname = $('#deckName').val();
	}
	$.ajax({//call server to create deck
		type: 'POST',
		url: 'ajax/NewDeck.php',
		async: false, 
		data: {
			folderID: currentFolderID,
			deckName:dname
		},
		success: function (result,status,xhr){
			var jsonObj = JSON.parse(result);
			setCookie('currentDeckID',jsonObj.ID);
			currentDeckID = jsonObj.ID;
			currentDeck = new Deck(currentDeckID,dname,[],[],1);
		}
	});
}
/* Generates the navigable "bradcrumbs" of folder drills,  */
function showBreadCrumbs(){
	currentFolderID = getCookie('currentFolderID');
	$('#breadcrumb').empty();
	document.getElementById('breadcrumb').innerHTML += '<li id=f_0 b_id=0><a name="0" >Desktop</li>';
	$('#f_0').click({param1: 0}, navigateToFolder);
	$.ajax({
		type: 'POST',
		url: 'ajax/GetParentFolders.php',
		async: false,
		data: { folderID: currentFolderID },
		success: function (returned) {
			if (returned.length > 1 ) {
				folders = JSON.parse(returned);
				for( var i = folders.length-2; i >=0; i-- ) {
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
					$('#'+theid).click({param1: fid},navigateToFolder); // on click navigate
				}
			}
		}
	});
	var li = document.createElement("li");
	var a = document.createElement("a");
	var textField = document.createElement('input');
	textField.setAttribute('type', 'text');
	textField.setAttribute('id', 'deckName');
	textField.style.fontSize='small';
	textField.style.height='10px';
	if(getCookie('currentDeckID') != ''){
		textField.setAttribute('placeholder', dname);
		a.appendChild(textField);
		li.appendChild(a);
		document.getElementById('breadcrumb').appendChild(li);
		$('#deckName').change(changeDeckName);
	}else{
		textField.setAttribute('placeholder', 'Enter Deck Name');
		a.appendChild(textField);
		li.appendChild(a);
		document.getElementById('breadcrumb').appendChild(li);
		$('#deckName').change(changeDeckName);
	}
}
/* Switches the starring of current card on click. */
function starCard(){
	if(currentDeck.currentCard.starred == 0 || currentDeck.currentCard.starred == null){
		currentDeck.currentCard.updateCardFlag(1);
	}else{
		currentDeck.currentCard.updateCardFlag(0);
	}
} 
/* Checks on load of a card if it is starred, if it is, updates the image. */
function checkStar(){
	if(currentDeck.currentCard.starred == 0 || currentDeck.currentCard.starred == null){
		$('#starCard').removeClass('starOn');
		$('#starCard').addClass('starOff');
	}else{
		$('#starCard').removeClass('starOff');
		$('#starCard').addClass('starOn');
	}
}
function navigateToFolder(event){
	var toNavId = event.data.param1;
	setCookie("currentFolderID", toNavId);
	window.location="userhome.html";
}
//change deck name
function changeDeckName(){
	if ($('#deckName').val() != currentDeck.name){
		doneChanging(false);
		currentDeck.ChangeDeckName($('#deckName').val());
		doneChanging(true);
		setCookie('deckName',currentDeck.name);
	}
}
/* calls all necessary functions to display the current card */
function displayCurrentCard(){
	currentCard = currentDeck.currentCard;
	document.getElementById('content1').innerHTML = currentCard.sides[0].text;
	document.getElementById('content2').innerHTML = currentCard.sides[1].text;
	getDiffCardImg(1);
	getDiffCardImg(2);
	removeCardBackground();
	checkStar();
	$('.cardSides').addClass(currentCard.style);
	$('#cardNum').val(currentCard.sortIndex);
	saveCard();
	shrinkFont('#content1');
	shrinkFont('#content2');
}
function removeCardBackground(){
		$('.cardSides').removeClass('blueCard greenCard whiteCard pinkCard orangeCard purpleCard');
}
/* Sets the background color of the card. */
function setCardColor(_color){
	currentCard = currentDeck.currentCard;
	$('.cardSides').removeClass(_color);
	$('.cardSides').removeClass(currentCard.style);
	$('#scrollEle'+currentCard.id).removeClass(currentCard.style);
	currentCard.updateCardStyle(_color);
	$('.cardSides').addClass(_color);
	$('#scrollEle'+currentCard.id).addClass(currentCard.style);
}
/*	show images from currentCard's sides, and load listeners for remove images.
	@whichSide	Indication of the side to load image. front side is 1, back side is 2
*/
function imgShow(whichSide){
	// place image 
	$('#imgContent'+whichSide).css('background-image', 'url('+currentCard.sides[whichSide-1].image+')');
	$('#imgContent'+whichSide).css('background-color','transparent');
	//add listener for deleting image
	$('#imgContent'+whichSide).append(addRemoveButt(whichSide));
	$('#imgContent'+whichSide).mouseover(function(){
		$('#removeThisImg'+whichSide).css('opacity','0.7');
	});
	$('#imgContent'+whichSide).mouseout(function(){
		$('#removeThisImg'+whichSide).css('opacity','0');
	});
	$('#removeThisImg'+whichSide).click(function(){
		removeThisImg(whichSide);
	});
}
/*	when an image is been removed, change DOM and update on DB */
function removeThisImg(whichSide){
	currentCard = currentDeck.currentCard;
	currentCard.sides[whichSide-1].image = '';
	currentCard.sides[whichSide-1].imageLayout = 1;
	layoutImgDiv(whichSide, currentCard.sides[whichSide-1].imageLayout);
	saveCard();
	shrinkFont('#content1');
	shrinkFont('#content2');
	$('#removeThisImg'+whichSide).removeClass('removeImgOn');
	$('#removeThisImg'+whichSide).addClass('removeImgOff');
}
function addRemoveButt(whichSide){
	return '<div><p id=\'removeThisImg'+whichSide+'\' class=\'hoverEle\'>Remove this image</p></div>';
} 
//display prompt for user for a different image and add remove image button
function showImgChoice(whichSide){
	$('#imgContent'+whichSide).css('background-image', '');
	$('#imgContent'+whichSide).css('background-color','#fff');
	$('#removeThisImg'+whichSide).removeClass('removeImgOff');
	$('#removeThisImg'+whichSide).addClass('removeImgOn');
}
//creating a card and two sides with no content.
function createCard(_after,_num){
	//_num is the sort order in this context
	currColor = currentDeck.currentCard.style;
	currentDeck.CreateCard(_after, _num);
	setCardColor(currColor);
	currentCard = currentDeck.currentCard;
	
	//change to the new added card front and back
	$('#content1').html('');
	$('#content2').html('');
	setupPreviousNextButtons();
	currentCard.sides[0].imageLayout = 1;
	currentCard.sides[1].imageLayout = 1;
	layoutImgDiv(1, currentCard.sides[0].imageLayout);
	layoutImgDiv(2, currentCard.sides[1].imageLayout);
	
	//update scrolling gallery
	var theID = 0;
	if (_after && _num > 0){
		theID = currentDeck.cards[_num-1].id;
	} else if (!_after && _num >= 0){
		theID = currentDeck.cards[_num].id;
	}
	insertPreviewElem(currentCard, theID, _after);
	$("#cardScroll").smoothDivScroll("recalculateScrollableArea");
}
/*	Delete a card, changing other cards sortIndex  PS: not updating other cards' sortIndex in DB */
function deleteCurrentCard(){
	$('#scrollEle'+currentDeck.currentCard.id).remove(); // remove this 
	currentDeck.DeleteCurrentCard();
	if(currentDeck.cards.length == 0){		
		createCard(0,1);
	} 
	setupPreviousNextButtons();
	//update cardNum and content1, content2
	displayCurrentCard();
	$('#cardNum').val(currentDeck.currentCard.sortIndex);
	scrollGalleryToCurrentCard();
	$("#cardScroll").smoothDivScroll("recalculateScrollableArea");

}
/*	add the div for upload image
	@front  1=front, 2=back
	@left	1=left, 2=right
*/
function layoutImgDiv(side,layout){
	if(layout == 1){ //no image
		$('#content'+side).removeClass('contentTop contentNone contentLeft contentRight');
		$('#imgContent'+side).removeClass('imgBottom imgRight imgFull imgLeft');
		$('#content'+side).addClass('contentFull');
		$('#imgContent'+side).addClass('imgNone');
		
	}else if(layout == 3){// image left
		$('#imgContent'+side).insertBefore($('#content'+side));
		$('#content'+side).removeClass('contentTop contentNone contentFull contentLeft');
		$('#imgContent'+side).removeClass('imgBottom imgRight imgFull imgNone');
		$('#content'+side).addClass('contentRight');
		$('#imgContent'+side).addClass('imgLeft');
		showImgChoice(side);
		
	}else if(layout == 6){// image right
		$('#imgContent'+side).insertAfter($('#content'+side));
		$('#content'+side).removeClass('contentTop contentNone contentFull contentRight');
		$('#content'+side).addClass('contentLeft');
		$('#imgContent'+side).removeClass('imgBottom imgLeft imgFull imgNone');
		$('#imgContent'+side).addClass('imgRight');
		showImgChoice(side);
		
	}else if(layout == 5){// center bottom
		$('#imgContent'+side).insertAfter($('#content'+side));
		$('#content'+side).removeClass('contentNone contentFull contentRight contentLeft');
		$('#content'+side).addClass('contentTop');
		$('#imgContent'+side).removeClass('imgRight imgLeft imgFull imgNone');
		$('#imgContent'+side).addClass('imgBottom');
		showImgChoice(side);
		
	}else if(layout == 2){//image only
		$('#imgContent'+side).insertAfter($('#content'+side));
		$('#content'+side).removeClass('contentTop contentFull contentRight contentLeft');
		$('#content'+side).addClass('contentNone');
		$('#imgContent'+side).removeClass('imgRight imgLeft imgBottom imgNone');
		$('#imgContent'+side).addClass('imgFull');
		showImgChoice(side);
		
	}
}
/* Save changes in deckName, front side content, back side content */
function saveChanges(){
	if($('#deckName').val()!=currentDeck.name){//deckname
		changeDeckName();
	}
	saveCard();
	window.location = 'userhome.html';
}
/* Get the font size string and return its integer
	@string  Font size string
*/
function getSize(string){
	return parseInt(string.substr(0,string.indexOf('p')));
}
/* displays the card's image and lays it out*/
function getDiffCardImg(whichSide){
	currentCard = currentDeck.currentCard;
	if((currentCard.sides[whichSide-1].image == '')||(currentCard.sides[whichSide-1].image == null)){//no image
		layoutImgDiv(whichSide, currentCard.sides[whichSide-1].imageLayout);
	}else{//there is image
		layoutImgDiv(whichSide,currentCard.sides[whichSide-1].imageLayout);
		imgShow(whichSide);
	}
}
/*	Indicating if change is being updated or update complete.
	@bool  true is update complete, false is being updated
*/
function doneChanging(bool){
	if(bool){
		$('#saving').text('Saved');
		setTimeout(function (){$('#saving').text('');}, 4000);
	}else if(!bool){
		$('#saving').text('Saving...');
	}
}

/* load tinymec plugin
	@id  identifier. Class use . notation, id use # notation
*/
function tinymceLoad(id){
	tinymce.init({
		selector: id,
		plugins:["advlist lists charmap",
                "directionality textcolor paste"],
        toolbar1: "undo bold italic underline bullist numlist outdent indent forecolor backcolor",
       // toolbar2: "undo  subscript superscript  charmap",
 		menubar:false,
        toolbar_items_size: 'small',
        skin : 'light',
        inline:true
	});
}
/*	Hide editing tools sub_menu
	@whichSide  1 is front side, 2 is back side
*/
function hideSubTools(whichSide){
	var isBack;
	if(whichSide == 2){ isBack = 'B'; }else{ isBack = ''; }
	$('#content'+whichSide).focusout();
	$('#subPaintTool'+isBack).hide();
	$('#subDrawTool'+isBack).hide();
	$('#subEraseTool'+isBack).hide();
	$('#subImageTool'+isBack).hide();
}
/*	Change editing tools icon when clicked, indicate which tool is being used.
	@whichSide  1 is front side, 2 is back side
*/
function changeToDefaultIcon(whichSide){
	var isBack;
	if(whichSide == 2){ isBack = 'B'; }else{ isBack = ''; }
	$('#textEdit'+isBack).removeClass('textActivate');
	$('#paintTool'+isBack).removeClass('paintActivate');
	$('#drawTool'+isBack).removeClass('drawActivate');
	$('#eraseTool'+isBack).removeClass('eraseActivate');
	$('#eTool'+isBack).removeClass('eActivate');
	$('#imageTool'+isBack).removeClass('imageActivate');
	// reset 
	editTools(whichSide);
} 
function editTools(side){
	var isBack;
	if(side == 2){ isBack = 'B'; }else{ isBack = ''; }
	$('#textEdit'+isBack).addClass('textInactive');
	$('#paintTool'+isBack).addClass('paintInactive');
	$('#drawTool'+isBack).addClass('drawInactive');
	$('#eraseTool'+isBack).addClass('eraseInactive');
	$('#eTool'+isBack).addClass('eInactive');
	$('#imageTool'+isBack).addClass('imageInactive');
}
function loadEditTools(side){
//load menu icon behavior
	var isBack;
	if(side == 2){ isBack = 'B'; }else{ isBack = ''; }
	$('#textEdit'+isBack).click(function(){
		hideSubTools(side);
		changeToDefaultIcon(1);
		changeToDefaultIcon(2);
		$('#textEdit'+isBack).removeClass('textInactive');
		$('#textEdit'+isBack).addClass('textActivate');
		setTimeout(function(){$('#content'+side).focus();},500);
	});
	$('#paintTool'+isBack).click(function(){
		hideSubTools(side);
		changeToDefaultIcon(1);
		changeToDefaultIcon(2);
		$('#paintTool'+isBack).removeClass('paintInactivate');
		$('#paintTool'+isBack).addClass('paintActivate');
		setTimeout(function(){$('subPaintTool'+isBack).show();},500);
	});
	$('#drawTool'+isBack).click(function(){
		hideSubTools(side);
		changeToDefaultIcon(1);
		changeToDefaultIcon(2);
		$('#drawTool'+isBack).removeClass('drawInactivate');
		$('#drawTool'+isBack).addClass('drawActivate');
		setTimeout(function(){$('#subDrawTool'+isBack).show();},500);
	});
	$('#eraseTool'+isBack).click(function(){
		hideSubTools(side);
		changeToDefaultIcon(1);
		changeToDefaultIcon(2);
		$('#eraseTool'+isBack).removeClass('eraseInactivate');
		$('#eraseTool'+isBack).addClass('eraseActivate');
		setTimeout(function(){$('#subEraseTool'+isBack).show();},500);
	});
	$('#eTool'+isBack).click(function(){
		hideSubTools(side);
		changeToDefaultIcon(1);
		changeToDefaultIcon(2);
		$('#eTool'+isBack).removeClass('eInactive');
		$('#eTool'+isBack).addClass('eActivate');
	});
	$('#imageTool'+isBack).click(function(){
		hideSubTools(side);
		changeToDefaultIcon(1);
		changeToDefaultIcon(2);
		$('#imageTool'+isBack).removeClass('imageInactive');
		$('#imageTool'+isBack).addClass('imageActivate');
		setTimeout(function(){$('#subImageTool'+isBack).show();},500);
	});
	//load sub_menu behavior
	$('#noImage'+isBack).click(function() {
		currentCard = currentDeck.currentCard;
		currentCard.sides[side-1].image = '';
		currentCard.sides[side-1].imageLayout = 1;
		layoutImgDiv(side, currentCard.sides[side-1].imageLayout);
		saveCard();
	});
	$('#leftImage'+isBack).click(function() {
			currentCard = currentDeck.currentCard;
			currentCard.sides[side-1].imageLayout = 3;
			layoutImgDiv(side,currentCard.sides[side-1].imageLayout);
			saveCard();
	});
	$('#rightImage'+isBack).click(function() {
			currentCard = currentDeck.currentCard;
			currentCard.sides[side-1].imageLayout = 6;
			layoutImgDiv(side,currentCard.sides[side-1].imageLayout);
			saveCard();
	});
	$('#botImage'+isBack).click(function(){
			currentCard = currentDeck.currentCard;
			currentCard.sides[side-1].imageLayout = 5;
			layoutImgDiv(side,currentCard.sides[side-1].imageLayout);
			saveCard();
	});
	$('#fullImage'+isBack).click(function(){
			currentCard = currentDeck.currentCard;
			currentCard.sides[side-1].imageLayout = 2;
			layoutImgDiv(side,currentCard.sides[side-1].imageLayout);
			saveCard();
	});
}
/* 
 * check to see if the changes have been made to a card and save if needed
 */
function saveCard(){
	var side1_dirty = false;
	var side2_dirty = false;
	currentCard = currentDeck.currentCard;
	/* SIDE 1 SECTION - first check side one to see if it needs to be saved */
	if(document.getElementById('content1').innerHTML != currentCard.sides[0].text) { 
		currentCard.sides[0].text = document.getElementById('content1').innerHTML;
		side1_dirty = true;
	}
	if($('#img1').val()!='') { //need to consider layout
		currentCard.sides[0].image = $('#img1').val();
		imgShow(1);
		side1_dirty = true;
	}	
	if (side1_dirty) {
		doneChanging(false);
		currentCard.sides[0].UpdateDatabase();
		updateGallery();
		doneChanging(true);
	}
	/* SIDE 2 SECTION - check side 2 to see if needs to be saved */
	if(document.getElementById('content2').innerHTML != currentCard.sides[1].text) { 
		currentCard.sides[1].text = document.getElementById('content2').innerHTML;
		side2_dirty = true;
	}
	if($('#img2').val()!='') { //need to consider layout
		currentCard.sides[1].image = $('#img2').val();
		imgShow(2);
		side2_dirty = true;
	}
	if (side2_dirty) {
		doneChanging(false);
		currentCard.sides[1].UpdateDatabase();
		updateGallery();
		doneChanging(true);
	}
}	
//load card side content in different font size
//This function is 100% home made, organic.
function shrinkFont(identifier){
	var maxFont = 64;
	var minFont = 8;
	var thisContent = $(identifier)[0];
	$(identifier).css('font-size',maxFont+'px');
	//auto change font size
	var fontSize = getSize($(identifier).css('font-size'));
	if(fontSize > minFont){
		while (thisContent.clientHeight < thisContent.scrollHeight) {
			if(fontSize > minFont){
				fontSize = fontSize-2;
				$(identifier).first().css('font-size',fontSize+'px');
			}else{
				break;
			}
		}
		while (thisContent.clientWidth < thisContent.scrollWidth) {
			if(fontSize > minFont){
				fontSize = fontSize-2;
				$(identifier).first().css('font-size',fontSize+'px');
			}else{
				break;
			}
		}
	}
}
//load fontChanger on entering page.
//This function is 100% home made, organic.
function loadFontChangeListeners(){
	$('#content1').bind('scroll',function(){shrinkFont('#content1');});
	$('#content2').bind('scroll',function(){shrinkFont('#content2');});
	$('#content1').keyup(function(event){
		if(event.keyCode == 13){
			shrinkFont('#content1');
		}
	});
	$('#content2').keyup(function(event){
		if(event.keyCode == 13){
			shrinkFont('#content2');
		}
	});
	$('#content1').bind('input',function(){
		shrinkFont('#content1');
	});
	$('#content2').bind('input',function(){
		shrinkFont('#content2');
	});
}