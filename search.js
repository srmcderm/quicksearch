// this is basically all jQuery - using selectors, animations, ajax -sm
// pretty straightforward in some aspects - anything with $(#id) is calling an element by ID -sm
// anything with $(.class) is calling an element by class -sm
// the benefit to sticking with jQuery instead of something newer is that it will work in IE -sm
// so...we may as well for now, it needs to be cleaned up though and some quirks addressed -sm
var date_object = new Date();
// getting the date to use I think to access local storage object when applying a search term? look @ doSearchArticle() for clarification -sm
date_full = date_object.getFullYear() + date_object.getMonth() + date_object.getDate();
var searchQuery;
var searchSuggestionsRequest;
skipFirstSearch = true;

// function that performs the search
// define the host for pageIsSearchPHP
function doSearch(option) {
	if (typeof host == "undefined") {
		host = "https://library.wayne.edu";
	}
	// grabbing the search query
	function get_search_query() {
		// returning the value of what was put into the search input box
		return $('#header-mobile-searcharea-search-nest-input').val();
	}
	// still need to figure out the significance of the string "fromload" for option param
	if (option != "fromload") {
		dontAnimateBentoBoxes = false;
	}
	// if the search query field is blank, jQuery animates the background color to white again
	if (get_search_query() == '') {
		$('.search-field').css('background-color', '#ccc');
		$('.search-field').stop().animate({ 'background-color': '#fff' }, 750);
		$('.search-field').focus();
		return;
	}

	if (typeof searchSuggestionsRequest == 'object') {
		window.searchSuggestionsRequest.abort();
	}

	if (typeof window['pageIsSearchPHP'] == 'undefined') {
		window.location = host + "/search.php?search=" + get_search_query();
		return;
	} else {
		// empty else statement!
	}
	// .hide method to hide() .search-suggestions class
	$(".search-suggestions").hide();
	// add .css method for z-index
	$(".masthead-search-menu").css("z-index", 9);
	// .hide method to hide #searchresults-didyou mean
	$("#searchresults-didyoumean").hide();
	// set searchQuery var to get_search_query function to return what is put in input
	searchQuery = get_search_query();

	$('.masthead-search-menu > .masthead-search-menu-content').hide();

	if (page == 'searchresults') {

		$('.bentobox').clearQueue();
		$('.bentobox').stop();
		$('.bentobox .bentobox-content').clearQueue();
		$('.bentobox .bentobox-content').stop();

		$('.bentobox > .bentobox-loading').show();

		// easeOutCubic is applied to .bentobox .bentobox-content classes which is the "drop-down" effect
		// see https://jqueryui.com/easing/
		// why is the else statement is exactly the same as the if statement
		if (option == "fromload") {
			$('.bentobox .bentobox-content').animate({ 'opacity': '0' }, 500, 'easeOutCubic');
			$('.bentobox').animate({ 'height': '120px' }, 500, 'easeOutCubic');
		} else {
			$('.bentobox .bentobox-content').animate({ 'opacity': '0' }, 500, 'easeOutCubic');
			$('.bentobox').animate({ 'height': '120px' }, 500, 'easeOutCubic');
		}

	} else if (page == 'homepage') {
		// animating the masthead
		if (option == "fromload") {
			$('#masthead').animate({ height: mastheadHeightSearchBar }, 0, 'easeOutExpo', function () {
				$('#masthead').addClass("justheader");
			});
			$('#masthead-search').animate({ backgroundColor: '#226359' }, 0, 'easeOutExpo');
			$('.masthead-search-logo').fadeIn(0);
			$('#masthead-search .masthead-search-menu').fadeIn(0);
			$('#masthead-search .masthead-search-help').fadeIn(0);

			$('#searchresults').fadeIn(0);
			// once again, same code in if/else statement
		} else {
			$('#masthead').animate({ height: mastheadHeightSearchBar }, 500, 'easeOutExpo', function () {
				$('#masthead').addClass("justheader");
			});
			$('#masthead-search').animate({ backgroundColor: '#226359' }, 500, 'easeOutExpo');
			$('.masthead-search-logo').fadeIn();
			$('#masthead-search .masthead-search-menu').fadeIn();
			$('#masthead-search .masthead-search-help').fadeIn();
			// fadeIn animation applied to #searchResult ID
			$('#searchresults').fadeIn();
		}


		$('#homepage').hide();
		$('#mobilemasthead-bgimg').hide();
		$('.bentobox').clearQueue();
		$('.bentobox').stop();
		$('.bentobox .bentobox-content').clearQueue();
		$('.bentobox .bentobox-content').stop();
		$('.bentobox .bentobox-content').html('');
		$('.bentobox > .bentobox-loading').show();
		$('.bentobox .bentobox-content').css('opacity', '0');
		$('.bentobox').css('height', '120px');
	}

	page = 'searchresults';

	search_query = get_search_query();

	doSearchBestBet();
	doSearchArticles();
	doSearchDatabases();
	doSearchDigitalCommons();
	doSearchBooksAndMedia();
	doSearchReuther();
	doSearchArchiveSpace();
	doSearchJournals();
	doSearchDigitalCollections();
	doSearchWayneEdu();
	doSearchResearchGuides();

	if (skipFirstSearch) {
		skipFirstSearch = false;
	} else {
		History.pushState({ query: $(".search-field").val() }, "Search | Wayne State University Libraries", "?search=" + $(".search-field").val());
	}
	$('#page').hide();
}

function undoSearch() {
	$(".masthead-search-menu").css("z-index", "999");
	// this is going to revert you back to the library homepage...which makes sense
	History.pushState({ query: '', page: 'home' }, "Wayne State University Libraries", "/");

	page = 'homepage';

	// abort all requests if type of 'object' is passed thru - does passing an object type break code? -sm
	// my guess is yes
	if (typeof requestArticles == 'object') {
		requestBestBet.abort();
		requestArticles.abort();
		requestDatabases.abort();
		requestDigitalCommons.abort();
		requestBooksAndMedia.abort();
		requestReuther.abort();
		requestArchiveSpace.abort();
		requestJournals.abort();
		requestDigitalCollections.abort();
		requestWayneEdu.abort();
		requestResearchGuides.abort();
	}

	// these are all animations and UI manipulation with jQuery -sm
	$('#masthead').animate({ height: getMastheadIdealHeight() }, 500, 'easeOutExpo', function () {
		$('#masthead').removeClass("justheader");
	});
	$('#masthead-search').animate({ backgroundColor: 'rgba(0,0,0,0.6)' }, 500, 'easeOutExpo');
	$('#masthead-search > .masthead-search-logo').fadeOut();
	$('#masthead-search .masthead-search-menu').fadeOut();
	$('#masthead-search .masthead-search-help').fadeOut();
	$('.search-field').focus();
	$('#searchresults').hide();
	$('#homepage').fadeIn();
	$('#mobilemasthead-bgimg').fadeIn();
	$('#page').hide();
}

// function to animate the bento box -sm
function animateBentoBox(bentoboxId, callduring) {
	$('.bentobox').promise().done(function () {
		// will be called when all the animations on the queue finish
		$(bentoboxId + ' .bentobox-content').html('');
		callduring();

		if (isPrivateBrowsingSupportedEvenIfThisIsSafari()) {
			localStorage.setItem(searchQuery + bentoboxId + date_full, $(bentoboxId + ' .bentobox-content').html());
		}
		// console.log( "localStorage.getItem(" + searchQuery + bentoboxId + ")" );
		// console.log( localStorage.getItem(searchQuery + bentoboxId) );

		$(bentoboxId).imagesLoaded(function () {


			if (isPrivateBrowsingSupportedEvenIfThisIsSafari()) {
				localStorage.setItem(searchQuery + bentoboxId + date_full, $(bentoboxId + ' .bentobox-content').html());
			}


			$(bentoboxId + ' > .bentobox-loading').hide();
			// images have loaded
			if (dontAnimateBentoBoxes) {
				$(bentoboxId + ' .bentobox-content').animate({ 'opacity': '1' }, 0, 'easeOutCubic');
				$(bentoboxId).animate({ 'height': $(bentoboxId + ' .bentobox-content').height() + 70 }, 0, 'easeOutCubic');
			} else {
				$(bentoboxId + ' .bentobox-content').animate({ 'opacity': '1' }, 500, 'easeOutCubic');
				$(bentoboxId).animate({ 'height': $(bentoboxId + ' .bentobox-content').height() + 70 }, 500, 'easeOutCubic');
			}

		});
	});
}


function animateBentoBoxOnWindowResize() {
	$('.bentobox').each(function (i, v) {
		newHeight = $(this).find('.bentobox-content').height() + 70;
		newHeight = newHeight > 120 ? newHeight : 120;
		$(this).css('height', newHeight);
	});

	// header input box
	// adjusting quicksearch box to accomodate window resizing -sm
	if ($(window).width() < 1440) {
		searchNewHeight = ($(window).width() * 0.10) + 150 + 150 + 40;
		$('#masthead-search-nest').css('width', $(window).width() - searchNewHeight);
		$('#masthead-search-nest-input').css('width', $(window).width() - searchNewHeight - 90 + 10);
	} else {
		$('#masthead-search-nest').css('width', '');
		$('#masthead-search-nest-input').css('width', '');
	}
	return;

	// Photo slideshow should be its own js file? - SM
	// FOR PHOTO SLIDESHOW
	photoDimensions = 1396 / 4272;
	calculatedPhotoWidth = $(window).width();
	calculatedPhotoHeight = $(window).width() * photoDimensions;

	if (calculatedPhotoHeight < 600) {
		increaseFactor = 600 / calculatedPhotoHeight; // can be 2
		newPhotoHeight = calculatedPhotoHeight * increaseFactor;
		newPhotoWidth = calculatedPhotoWidth * increaseFactor;

		newPhotoLeftRightCutoff = (newPhotoWidth - $(window).width()) / 2;

		$('#masthead-bgimg').css('height', Math.ceil(newPhotoHeight));
		$('#masthead-bgimg').css('width', Math.ceil(newPhotoWidth));
		$('#masthead-bgimg').css('margin-top', 0);
		$('#masthead-bgimg').css('margin-left', -newPhotoLeftRightCutoff);

	} else if (calculatedPhotoHeight > 600) {


		calculatedPhotoWidth = 600 / photoDimensions;
		calculatedPhotoHeight = calculatedPhotoWidth * photoDimensions;


		// console.log(increaseFactor);


		increaseFactor = $(window).width() / calculatedPhotoWidth; // can be 2

		// console.log(increaseFactor);


		newPhotoHeight = calculatedPhotoHeight * increaseFactor;
		newPhotoWidth = calculatedPhotoWidth * increaseFactor;

		// console.log("NNNNWWWW" + newPhotoWidth);

		newPhotoLeftRightCutoff = (newPhotoHeight - 600) / 2;


		$('#masthead-bgimg').css('height', Math.ceil(newPhotoHeight));
		$('#masthead-bgimg').css('width', Math.ceil(newPhotoWidth));
		$('#masthead-bgimg').css('margin-top', -newPhotoLeftRightCutoff);
		$('#masthead-bgimg').css('margin-left', 0);

	}
}

// video stuff? -sm
function getMastheadIdealHeight() {
	if ($(window).width() < 1070) {
		videoDimensions = 720 / 1280;
		videoNewHeight = Math.ceil($(window).width() * videoDimensions);
	} else {
		videoNewHeight = 600;
	}
	return videoNewHeight;
}

// testing if local storage works? -sm
function isLocalStorageNameSupported() {
	var testKey = 'test',
		storage = window.localStorage;
	try {
		storage.setItem(testKey, '1');
		storage.removeItem(testKey);
		return true;
	} catch (error) {
		return false;
	}
}

function isPrivateBrowsingSupportedEvenIfThisIsSafari() {
	if (window.localStorage) {
		var test = "__localstoragetest__";

		try {
			window.localStorage.setItem(test, test);
			window.localStorage.removeItem(test);
		} catch (ex) {
			// console.log("No storage for you!");
			return false;
		}

		return true;
	}

	return false;
}

// this function checks whether response retrieved from API is valid and not undefined/a robot -sm
function validResponse(response) {
	if (typeof response != 'undefined' && response != null) {
		if (typeof response['results'] != 'undefined' && response['results'] != null) {
			return true;
		}
	}
	return false;
}

// BEST BET SEARCH -sm
function doSearchBestBet() {
	$('#bentobox-bestbet').hide();
	// ??? to do below?
	return false; // TODO remove later 

	// using .ajax method to access .bestbet.php code -sm
	if (typeof requestBestBet == Object) {
		requestBestBet.abort();
	}
	// assign requestBestBet to jquery .ajax call to retrieve data with search term query applied -sm
	// query must interact with bestbet.php somehow -sm
	requestBestBet = $.ajax({
		url: host + "/api/bestbet.php",
		method: "GET",
		data: {
			query: search_query
		},
		dataType: "json",
		success: function (response) {
			// if statements to check for undefined response and whether the response is a robot -sm
			// run areyouhuman.php if true -sm
			if (typeof response != 'undefined' && response != null) {
				if (typeof response.possibleRobot !== undefined) {
					if (response.possibleRobot == true) {
						window.location = host + "/areyouhuman.php?searchattempt=" + $.trim($('.search-field').val());
						return;
					}
				}
			}
			// call the animateBentoBox function to start even cascade of results in best bet bentobox 
			animateBentoBox('#bentobox-bestbet', function () {
				if (validResponse(response)) {
					$('#bentobox-bestbet').show();
					$.each(response['results'], function (i, result) {
						$('#bentobox-bestbet > .bentobox-title').html('' + response['title']);
						bentoBoxBestBet = $('#bentobox-bestbet .bentobox-content');
						bentoBoxBestBet.append('<div class="bestresult-result" style="clear:both;overflow:auto;"></div>');
						bestresultResult = $('#bentobox-bestbet .bentobox-content > .bestresult-result');
						bestresultResultLast = $('#bentobox-bestbet .bentobox-content > .bestresult-result').eq(i);
						if (result.beyondCollection) {
							bestresultResultLast.append('<div class="bestresult-beyondcollection">Sorry, this item is not immediately available.</div>');
							if (result.data.Type != 'Book' && result.data.Type != 'eBook') {
								bestresultResultLast.find('.bestresult-beyondcollection').append('<br>First, check <a href="https://proxy.lib.wayne.edu/login?url=https://scholar.google.com/scholar?q=' + $(result.title).text() + '&btnG=&hl=en&as_sdt=0%2C23" target="_blank">Google Scholar</a> for immediate access.');
								bestresultResultLast.find('.bestresult-beyondcollection').append('<br>Then, <a href="' + result.url + '">See Options</a> to obtain a copy.');
							} else {
								bestresultResultLast.find('.bestresult-beyondcollection').append('<br><a href="' + result.url + '">See Options</a> to obtain a copy.');
							}
						}
						if (response['results'].length > 1) {
							identifierType = result.identifierType ? '<div class="bestresult-identifierType"><div><span>' + result.identifierType + '</span> of ' + result.identifier + '</div></div>' : '';
							bestresultResultLast.append(identifierType);
						}
						if (result.data && result.data['Media Type']) {
							bestresultResultLast.find('.bestresult-identifierType').append('<div class="bestresult-mediatype">' + result.data['Media Type'] + '</div>');
						}
						resultType = result.type ? '<span class="bestresult-type">' + result.type + '</span>' : '';
						bestresultResultLast.append('<div class="bestresult-result-content" style="word-wrap: break-word;">' + resultType + '<a style="display:inline;" href="' + result.url + '">' + result.title + '</a></div>');

						if (result.image) {
							var img = new Image();
							img.src = result.image;
							// uses jQuery .eq method see https://api.jquery.com/eq/
							bestresultResult.eq(i).find('.bestresult-result-content').before('<a class="bestresult-result-content-img-a" style="display:none;border:0;" href="' + result.url + '"><img style="width:100px;max-width:100px;float:left;margin-right:10px;margin-top:3px;" src="' + result.image + '" /></a>');
							bestresultResult.eq(i).find('.bestresult-result-content').css('margin-left', '120px');
							img.onload = function () {
								if (this.width > 1 && this.height > 1) {
									bestresultResult.eq(i).find('a.bestresult-result-content-img-a').css('display', 'block');
								} else {
									bestresultResult.eq(i).find('.bestresult-result-content').css('margin-left', '0');
								}
							}
						} else {

						}
						// the decision to use v was a choice... -sm
						if (result.data) {
							bestresultResultLast.find('.bestresult-result-content').append('<table class="bestresult-result-content-data"></table>');
							$.each(result.data, function (i, v) {
								if (v) {
									if (v.length > 200) {
										bestresultResultLast.find('.bestresult-result-content-data').append('<tr><td style="width:1%;white-space:nowrap;padding-right:10px;vertical-align: text-top;color:#888;">' + i + ':</td><td style="" class="search-phraseNOOO bestresult-result-content-data-abstract" data-abstract-full="' + v + '">' + v.substring(0, 200) + '...' + '</td></tr>');
									} else {
										bestresultResultLast.find('.bestresult-result-content-data').append('<tr><td style="width:1%;white-space:nowrap;padding-right:10px;vertical-align: text-top;color:#888;">' + i + ':</td><td style="" class="search-phraseNOOO">' + v + '</td></tr>');
									}
								}
							});
						}
					});
					// easy enough, if no results add a div that says "No Results" -sm
				} else {
					$('#bentobox-bestbet .bentobox-content').html('<div class="noresults">No Results</div>');
				}
			});
		}
	});
}






// function for 
function doSearchArticles() {
	if (localStorage.getItem(searchQuery + "#bentobox-articles" + date_full)) {
		animateBentoBox('#bentobox-articles', function () {
			$('#bentobox-articles .bentobox-content').html(localStorage.getItem(searchQuery + "#bentobox-articles" + date_full));
		});
		// console.log("took from cache");
		return;
	}
	if (typeof requestArticles == 'object') {
		requestArticles.abort();
	}
	requestArticles = $.ajax({
		url: host + "/api/articles.php",
		method: "POST",
		data: {
			search_string: search_query
		},
		dataType: "json",
		success: function (response) {

			if (response['didYouMean']['spelledWrong']) {
				$("#searchresults-didyoumean").html('<div class="didyoumeantext">Did you mean: </div><span class="corrected">' + response['didYouMean']['corrected'] + '</span>');
				$("#searchresults-didyoumean").show();
			}

			animateBentoBox('#bentobox-articles', function () {
				// console.log(response);
				if (validResponse(response)) {
					$.each(response['results'], function (i, v) {
						$('#bentobox-articles .bentobox-content').append(
							'<div>' +
							'<div class="bentobox-content-title"><a href="' + v.Link + '">' + v.Title + '</a></div>' +
							'<div class="bentobox-content-data"><div class="label">Authors: </div>' + v.Author + '</div>' +
							'<div class="bentobox-content-data"><div class="label">Journal: </div>' + v.PublicationTitle + '</div>' +
							'<div class="bentobox-content-data"><div class="label">Published: </div>' + v.PublicationDate + '</div>' +
							'</div>'
						);
						// will only load 4 of results -sm
						if (i == 5 - 1) {
							return false;
						}
					});
					$('#bentobox-articles .bentobox-content').append(
						'<div>' +
						'<div class="bentobox-content-viewmore"><a href="' + response['viewMoreUrl'] + '">' + 'View More Results ' + (response['viewMoreCount'] ? '(' + response['viewMoreCount'] + ')' : '') + '</a></div>' +
						'</div>'
					);
				} else {
					$('#bentobox-articles .bentobox-content').html(
						'<div class="noresults">' +
						'<div>No Results</div>' +
						'<div>Try another search in <a href="https://wayne.summon.serialssolutions.com?q=' + searchQuery + '">Summon</a></div>' +
						'</div>'
					);
				}
			});


		}
	});
}






function doSearchDatabases() {
	if (localStorage.getItem(searchQuery + "#bentobox-databases" + date_full)) {
		animateBentoBox('#bentobox-databases', function () {
			$('#bentobox-databases .bentobox-content').html(localStorage.getItem(searchQuery + "#bentobox-databases" + date_full));
		});
		//console.log("took from cache");
		return;
	}
	if (typeof requestDatabases == 'object') {
		requestDatabases.abort();
	}
	requestDatabases = $.ajax({
		url: host + "/api/databases.php",
		method: "GET",
		data: {
			search_string: search_query
		},
		dataType: "json",
		success: function (response) {


			animateBentoBox('#bentobox-databases', function () {
				// console.log(response);
				if (validResponse(response)) {
					$.each(response['results'], function (i, v) {
						// console.log(response);
						$('#bentobox-databases .bentobox-content').append(
							'<div>' +
							'<div class="bentobox-content-title"><a href="' + v.url + '">' + v.title + '</a></div>' +
							'<div class="bentobox-content-description">' + v.description + '</div>' +
							'</div>'
						);

						if (i >= 5 - 1) {
							return false;
						}
					});
					$('#bentobox-databases .bentobox-content').append(
						'<div>' +
						'<div class="bentobox-content-viewmore"><a href="' + response['viewMoreUrl'] + '">' + 'View More Results ' + (response['viewMoreCount'] ? '(' + response['viewMoreCount'] + ')' : '') + '</a></div>' +
						'</div>'
					);
				} else {
					$('#bentobox-databases .bentobox-content').html(
						'<div class="noresults">' +
						'<div>No Results</div>' +
						'<div>Try another search in <a href="https://guides.lib.wayne.edu/az.php?filter=' + searchQuery + '">Databases</a></div>' +
						'</div>'
					);
				}
			});


		}
	});
}


function doSearchDigitalCommons() {
	if (localStorage.getItem(searchQuery + "#bentobox-digitalcommons" + date_full)) {
		animateBentoBox('#bentobox-digitalcommons', function () {
			$('#bentobox-digitalcommons .bentobox-content').html(localStorage.getItem(searchQuery + "#bentobox-digitalcommons" + date_full));
		});
		//console.log("took from cache");
		return;
	}
	if (typeof requestDigitalCommons == 'object') {
		requestDigitalCommons.abort();
	}
	requestDigitalCommons = $.ajax({
		// url: "https://digital.library.wayne.edu/WSUAPI",
		url: host + "/api/digitalcommons.php",
		method: "POST",
		// data: {
		//   q: 'dc_subject:' + search_query + '%5E2+' + search_query,
		//   start: 0,
		//   rows: 5,
		//   wt: 'json',
		//   solrCore: 'DCOAI',
		//   'functions[]': 'solrCoreGeneric'
		// },
		data: {
			query: search_query + '%5E2+' + search_query,
		},
		dataType: "json",
		success: function (response) {


			animateBentoBox('#bentobox-digitalcommons', function () {
				// console.log(response);
				if (validResponse(response)) {
					// $.each(response['solrCoreGeneric']['response']['docs'], function(i, v){
					$.each(response['results'], function (i, v) {
						// title = v['dc_title_sans_HTML'];
						// url = v['dc_identifier'][0];
						// author = v['dc_creator'];
						// // console.log(response);
						// $('#bentobox-digitalcommons .bentobox-content').append(
						//   '<div>' + 
						//     '<div class="bentobox-content-title"><a href="' + url + '">' + title + '</a></div>' +
						//     '<div class="bentobox-content-description"><div class="label">Author:</div> ' + author + '</div>' +
						//   '</div>'
						// );
						$('#bentobox-digitalcommons .bentobox-content').append(
							'<div>' +
							'<div class="bentobox-content-title"><a href="' + v.url + '">' + v.title + '</a></div>' +
							'<div class="bentobox-content-description"><div class="label">Author:</div> ' + v.author + '</div>' +
							'</div>'
						);

						if (i >= 5 - 1) {
							return false;
						}
					});
					$('#bentobox-digitalcommons .bentobox-content').append(
						'<div>' +
						'<div class="bentobox-content-viewmore"><a href="' + response['viewMoreUrl'] + '">' + 'View More Results ' + (response['viewMoreCount'] ? '(' + response['viewMoreCount'] + ')' : '') + '</a></div>' +
						'</div>'
					);
				} else {
					$('#bentobox-digitalcommons .bentobox-content').html(
						'<div class="noresults">' +
						'<div>No Results</div>' +
						'<div>Try another search in <a href="http://digitalcommons.wayne.edu/do/search/?q=' + searchQuery + '&start=0&context=87433">Digital Commons</a></div>' +
						'</div>'
					);
				}
			});


		}
	});
}


function doSearchBooksAndMedia() {


	if (localStorage.getItem(searchQuery + "#bentobox-booksandmedia" + date_full)) {
		animateBentoBox('#bentobox-booksandmedia', function () {
			$('#bentobox-booksandmedia .bentobox-content').html(localStorage.getItem(searchQuery + "#bentobox-booksandmedia" + date_full));
		});
		//console.log("took from cache");

		// console.log(localStorage.getItem(searchQuery + "#bentobox-booksandmedia"));
		if (localStorage.getItem(searchQuery + "#bentobox-booksandmedia" + date_full).search('<div class="noresults">') >= 0) {
			// console.log(88888);
			$("#bentobox-askalibrarian").insertBefore("#bentobox-wayneedu");
			doCantFindWhatYourLookingFor();
		} else {
			// console.log(8888899999);
			$("#bentobox-askalibrarian").insertAfter("#bentobox-researchguides");
			doCantFindWhatYourLookingFor();
		}

		return;
	}

	if (typeof requestBooksAndMedia == 'object') {
		requestBooksAndMedia.abort();
	}
	requestBooksAndMedia = $.ajax({
		url: host + "/api/booksandmedia.php",
		method: "POST",
		data: {
			searchTerm: search_query,
			// searchTerm: 'john',
			// data_type: 'xml2json',
			// encodedURL: 'http://elibrary.wayne.edu/xmlopac/X'
		},
		dataType: "json",
		success: function (response) {


			animateBentoBox('#bentobox-booksandmedia', function () {
				// console.log(response);
				if (validResponse(response)) {
					// alert(234);
					$.each(response['results'], function (i, v) {
						console.log(v);
						$('#bentobox-booksandmedia .bentobox-content').append(
							'<div style="overflow:auto;">' +

							'<div style="float:left;margin-right: 10px;">' +
							(v.thumbnail ?
								'<img class="bentobox-booksandmedia-thumb" src="' + v.thumbnail + '" style="width: 80px;" />'
								:
								'<img src="https://elibrary.wayne.edu/screens/socialicons/catalogdefaultthumbnail.png" style="width: 80px;" />'
							) +
							'</div>' +

							'<div style="margin-left: 90px;">' +
							'<div class="bentobox-content-title"><a href="' + v.url + '">' + v.title + '</a></div>' +

							(v.requestButton ? '<div class="bentobox-content-requestbutton ' + (v.requestButtonText == 'Connect to online resource' ? 'bentobox-content-requestbutton-yellow' : '') + '"><a href="' + v.requestButton + '">' + v.requestButtonText + '</a></div>' : '') +

							// '<div class="bentobox-content-description">' +
							(v.author ? '<div class="bentobox-content-data"><div class="label">Authors: </div>' + v.author + '</div>' : '') +
							(v.year ? '<div class="bentobox-content-data"><div class="label">Published: </div>' + v.year + '</div>' : '') +
							(v.type ? '<div class="bentobox-content-data"><div class="label">Type: </div>' + v.type + '</div>' : '') +
							(v.location ? '<div class="bentobox-content-data"><div class="label">Location: </div>' + v.location + '</div>' : '') +
							(v.callno ? '<div class="bentobox-content-data"><div class="label">Call No.: </div>' + v.callno + '</div>' : '') +
							(v.status ? '<div class="bentobox-content-data"><div class="label">Status: </div>' + v.status + '</div>' : '') +
							// '<div class="bentobox-content-data">' +
							// 	(v.location ? '<div><div class="label">Location:</div> ' + v.location + '</div>' : '') +
							// 	(v.callNumber ? '<div><div class="label">Call No.:</div> ' + v.callNumber + '</div>' : '') +
							// 	(v.status ? '<div><div class="label">Status:</div> ' + v.status + '</div>' : '') +
							// 	(v.type ? '<div><div class="label">Type:</div> ' + v.type + '</div>' : '') +
							// '</div>' +

							// added by Minhao on 22nd July, 2019
							(v.description ? '<div class="bentobox-content-data"><div class="label">Description: </div>' + v.description + '</div>' : '') +
							'</div>' +

							'</div>'
						);

						if (i >= 5 - 1) {
							return false;
						}
					});
					$('#bentobox-booksandmedia .bentobox-content').append(
						'<div>' +
						'<div class="bentobox-content-viewmore"><a href="' + response['viewMoreUrl'] + '">' + 'View More Results ' + (response['viewMoreCount'] ? '(' + response['viewMoreCount'] + ')' : '') + '</a></div>' +
						'</div>'
					);

					// console.log(7788);
					$("#bentobox-askalibrarian").insertAfter("#bentobox-researchguides");
					doCantFindWhatYourLookingFor();






					$('.bentobox-booksandmedia-thumb').imagesLoaded().always(function (instance) {

						console.log('all images loaded');
						img_scraped_from_detail_catalog = (this).length == 1 ? true : false;

						console.log('=====' + $('.bentobox-booksandmedia-thumb').length);


						$('.bentobox-booksandmedia-thumb').each(function () {
							img_height = $(this).height();
							console.log('height: ' + img_height);
							// that.prop("src", "/screens/socialicons/catalogdefaultthumbnail.png");

							if ((img_scraped_from_detail_catalog && img_height <= 257) || (!img_scraped_from_detail_catalog && img_height <= 120)) {
								$(this).prop('src', 'https://elibrary.wayne.edu/screens/socialicons/catalogdefaultthumbnail.png');
							}
						});

					});









				} else {
					$('#bentobox-booksandmedia .bentobox-content').html(
						'<div class="noresults">' +
						'<div>No Results</div>' +
						'<div>Try another search in <a href="http://elibrary.wayne.edu/search~/?searchtype=X&searcharg=' + searchQuery + '&SORT=D&searchscope=47">Catalog</a>, <a href="http://wild.on.worldcat.org/search?queryString=' + searchQuery + '&qt=results_page&dblist=638">WorldCat</a> or <a href="http://search.mel.org/iii/encore/search/C__S' + searchQuery + '__Orightresult?lang=eng&suite=gold">MeLCat</a></div>' +
						// '<div>Try another search in <a href="http://elibrary.wayne.edu/search~/?searchtype=X&searcharg=' + searchQuery + '&SORT=D&searchscope=47">Catalog</a> or <a href="http://wild.on.worldcat.org/search?queryString=' + searchQuery + '&qt=results_page&dblist=638">WorldCat</a>' +
						'</div>'
					);

					// console.log(777777777799999);
					$("#bentobox-askalibrarian").insertBefore("#bentobox-wayneedu");
					doCantFindWhatYourLookingFor();

				}
			});


		}
	});
}



function doSearchReuther() {

	if (localStorage.getItem(searchQuery + "#bentobox-reuther" + date_full)) {
		animateBentoBox('#bentobox-reuther', function () {
			$('#bentobox-reuther .bentobox-content').html(localStorage.getItem(searchQuery + "#bentobox-reuther" + date_full));
		});
		//console.log("took from cache");

		return;
	}

	if (typeof requestReuther == 'object') {
		requestReuther.abort();
	}
	console.log("The search_query to be issued to reuther search ajax request is:" + search_query);
	requestReuther = $.ajax({
		url: host + "/api/reuther.php",
		method: "POST",
		data: {
			searchTerm: search_query,
			// searchTerm: 'john',
			// data_type: 'xml2json',
			// encodedURL: 'http://elibrary.wayne.edu/xmlopac/X'
		},
		dataType: "json",
		success: function (response) {


			animateBentoBox('#bentobox-reuther', function () {
				// console.log(response);
				if (response.length) {
					// alert(234);
					$.each(response, function (i, v) {
						// console.log(v);
						$('#bentobox-reuther .bentobox-content').append(
							'<div>' +
								'<div class="bentobox-content-title"><a href="' + v['url'] + '">' + v['title'] + '</a></div>' +
								'<div class="bentobox-content-url"><a href="' + v['url'] + '">' + v['url'] + '</a></div>' +
								'<div class="bentobox-content-description">' + v.hasOwnProperty('description') ? v['description'] : '' + '</div>' +
							'</div>'
						);

						if (i >= 5 - 1) {
							return false;
						}
					});
					$('#bentobox-reuther .bentobox-content').append(
						'<div>' +
						'<div class="bentobox-content-viewmore"><a href="http://reuther.wayne.edu/search/node/' + encodeURIComponent(searchQuery) + '">' + 'View More Results ' + '</a></div>' +
						'</div>'
					);

					// console.log(7788);
					$("#bentobox-askalibrarian").insertAfter("#bentobox-researchguides");
					doCantFindWhatYourLookingFor();









				} else {
					$('#bentobox-reuther .bentobox-content').html(
						'<div class="noresults">' +
						'<div>No Results</div>' +
						'<div>Try another search in <a href="http://reuther.wayne.edu/search/node/' + encodeURIComponent(searchQuery) + '">the Reuther Library site</a></div>' +
						'</div>'
					);

				}
			});


		}
	});
}



function doSearchArchiveSpace() {
	var archivespace_url = 'http://as.reuther.wayne.edu';

	if (localStorage.getItem(searchQuery + "#bentobox-archivespace" + date_full)) {
		animateBentoBox('#bentobox-archivespace', function () {
			$('#bentobox-archivespace .bentobox-content').html(localStorage.getItem(searchQuery + "#bentobox-archivespace" + date_full));
		});
		//console.log("took from cache");

		return;
	}

	if (typeof requestArchiveSpace == 'object') {
		requestArchiveSpace.abort();
	}
	console.log("The search_query to be issued to archivespace search ajax request is:" + search_query);
	requestArchiveSpace = $.ajax({
		url: host + "/api/archivespace.php",
		method: "POST",
		data: {
			searchTerm: search_query,
			// searchTerm: 'john',
			// data_type: 'xml2json',
			// encodedURL: 'http://elibrary.wayne.edu/xmlopac/X'
		},
		dataType: "json",
		success: function (response) {


			animateBentoBox('#bentobox-archivespace', function () {
				// console.log(response);
				if (validResponse(response)) {
					// alert(234);
					$.each(response, function (i, v) {
						// console.log(v);
						$('#bentobox-archivespace .bentobox-content').append(
							'<div>' +
								'<div class="bentobox-content-title"><a href="' + archivespace_url + v['results']['url'] + '">' + v['results']['title'] + '</a></div>' +
								'<div class="bentobox-content-url"><a href="' + archivespace_url + v['results']['url'] + '">' + archivespace_url + v['results']['url'] + '</a></div>' +
								'<div class="bentobox-content-description">' + v['results'].hasOwnProperty('description') ? v['results']['description'] : '' + '</div>' +
							'</div>'
						);

						if (i >= 5 - 1) {
							return false;
						}
					});
					$('#bentobox-archivespace .bentobox-content').append(
						'<div>' +
						'<div class="bentobox-content-viewmore"><a href="' + archivespace_url + encodeURIComponent(searchQuery) + '">' + 'View More Results (' + response['viewMoreCount'] + ')</a></div>' +
						'</div>'
					);

					// console.log(7788);
					$("#bentobox-askalibrarian").insertAfter("#bentobox-researchguides");
					doCantFindWhatYourLookingFor();









				} else {
					$('#bentobox-archivespace .bentobox-content').html(
						'<div class="noresults">' +
						'<div>No Results</div>' +
						'<div>Try another search in <a href="' + archivespace_url + '">the ArchivesSpace site</a></div>' +
						'</div>'
					);

				}
			});


		}
	});
}

function doCantFindWhatYourLookingFor() {
	animateBentoBox('#bentobox-askalibrarian', function () {
		$("#bentobox-askalibrarian").show();
		$("#bentobox-askalibrarian .bentobox-content").html(

			'<div class="bentobox-askalibrarian-askalibrarian">' +
			'<div><a href="' + host + '/services/ask-a-librarian">Ask a Librarian</a> <br>We can help you find it.</div>' +
			'</div>' +

			'<div class="bentobox-askalibrarian-interlibraryborrowing">' +
			'<div><a href="https://wayne.illiad.oclc.org/illiad/illiad.dll">Interlibrary Loan</a> <br>Access resources at other university libraries.</div>' +
			'</div>' +

			'<div class="bentobox-askalibrarian-researchguides">' +
			'<div><a href="http://guides.lib.wayne.edu/">Research Guides</a> <br>Browse subject and course guides compiled by librarians.</div>' +
			'</div>'
		);
	});
}



function doSearchJournals() {
	if (localStorage.getItem(searchQuery + "#bentobox-journals" + date_full)) {
		animateBentoBox('#bentobox-journals', function () {
			$('#bentobox-journals .bentobox-content').html(localStorage.getItem(searchQuery + "#bentobox-journals" + date_full));
		});
		//console.log("took from cache");
		return;
	}
	if (typeof requestJournals == 'object') {
		requestJournals.abort();
	}
	requestJournals = $.ajax({
		url: host + "/api/journals.php",
		method: "POST",
		data: {
			searchTerm: search_query,
			data_type: 'xml2json',
			encodedURL: 'http://elibrary.wayne.edu/xmlopac/X'
		},
		dataType: "json",
		success: function (response) {


			animateBentoBox('#bentobox-journals', function () {
				// console.log(response);
				if (validResponse(response)) {
					$.each(response['results'], function (i, v) {
						// console.log(response);
						$('#bentobox-journals .bentobox-content').append(
							'<div>' +
							'<div class="bentobox-content-title"><a href="' + v.url + '">' + v.title + '</a></div>' +
							// '<div class="bentobox-content-description">' + v.description + '</div>' +
							'</div>'
						);

						if (i >= 5 - 1) {
							return false;
						}
					});
					$('#bentobox-journals .bentobox-content').append(
						'<div>' +
						'<div class="bentobox-content-viewmore"><a href="' + response['viewMoreUrl'] + '">' + 'View More Results ' + (response['viewMoreCount'] ? '(' + response['viewMoreCount'] + ')' : '') + '</a></div>' +
						'</div>'
					);
				} else {
					$('#bentobox-journals .bentobox-content').html(
						'<div class="noresults">' +
						'<div>No Results</div>' +
						'<div>Try another search in <a href="http://elibrary.wayne.edu/search~/?searchtype=t&searcharg=' + searchQuery + '&searchscope=17&SORT=D&submit=Search">Catalog</a></div>' +
						'</div>'
					);
				}
			});


		}
	});
}


// function doSearchDigitalCollections() {
//   if (typeof requestDigitalCollections == Object) {
//     requestDigitalCollections.abort();
//   }
//   requestDigitalCollections = $.ajax({
//     url: "https://digital.library.wayne.edu/WSUAPI?",
//     method: "POST",
//     data: {
//       q: search_query,
//       start: 0,
//       rows: 5,
//       wt: 'json',
//       'functions[]': 'solrSearch'
//     },
//     dataType: "json",
//     success: function(response) {


//       animateBentoBox('#bentobox-digitalcollections', function(){
//         // console.log(response);
//         if (typeof response['solrSearch'] == "object") {
//           $.each(response['solrSearch']['response']['docs'], function(i, v){
//             // console.log(response);
//             title = v['dc_title'][0];
//             url = "http://digital.library.wayne.edu/digitalcollections/item?id=" + v['id'];
//             if (typeof v['dc_description'] !== 'undefined') {
//               description = v['dc_description'][0];              
//             }

//             $('#bentobox-digitalcollections .bentobox-content').append(
//               '<div>' + 
//                 '<div class="dc-right">' + 
//                   '<div class="bentobox-content-image"><img src="http://digital.library.wayne.edu/imageServer?obj=' + v['id'] + '&ds=THUMBNAIL" /></div>' +
//                 '</div>' +
//                 '<div class="dc-left">' + 
//                   '<div class="bentobox-content-title"><a href="' + url + '">' + title + '</a></div>' +
//                   '<div class="bentobox-content-description">' + description + '</div>' +
//                 '</div>' +
//                 '<div style="clear:both;"></div>' +
//               '</div>'
//             );

//             if (i >= 5-1) {
//               return false;
//             }
//           });
//         } else {
//           $('#bentobox-digitalcollections .bentobox-content').html('<div class="noresults">No Results</div>');
//         }
//       });


//     }
//   });
// }



function doSearchDigitalCollections() {
	if (localStorage.getItem(searchQuery + "#bentobox-digitalcollections" + date_full)) {
		animateBentoBox('#bentobox-digitalcollections', function () {
			$('#bentobox-digitalcollections .bentobox-content').html(localStorage.getItem(searchQuery + "#bentobox-digitalcollections" + date_full));
		});
		//console.log("took from cache");
		return;
	}
	if (typeof requestDigitalCollections == 'object') {
		requestDigitalCollections.abort();
	}
	requestDigitalCollections = $.ajax({
		url: host + "/api/digitalcollections.php",
		method: "POST",
		data: {
			query: search_query,
		},
		dataType: "json",
		success: function (response) {


			animateBentoBox('#bentobox-digitalcollections', function () {
				// console.log(response);
				if (validResponse(response)) {
					$.each(response['results'], function (i, v) {
						// // console.log(response);
						// title = v['dc_title'][0];
						// url = "http://digital.library.wayne.edu/digitalcollections/item?id=" + v['id'];
						// if (typeof v['dc_description'] !== 'undefined') {
						//   description = v['dc_description'][0];              
						// }

						// $('#bentobox-digitalcollections .bentobox-content').append(
						//   '<div>' + 
						//     '<div class="dc-right">' + 
						//       '<div class="bentobox-content-image"><img src="http://digital.library.wayne.edu/imageServer?obj=' + v['id'] + '&ds=THUMBNAIL" /></div>' +
						//     '</div>' +
						//     '<div class="dc-left">' + 
						//       '<div class="bentobox-content-title"><a href="' + url + '">' + title + '</a></div>' +
						//       '<div class="bentobox-content-description">' + description + '</div>' +
						//     '</div>' +
						//     '<div style="clear:both;"></div>' +
						//   '</div>'
						// );

						$('#bentobox-digitalcollections .bentobox-content').append(
							'<div>' +
							'<div class="dc-right">' +
							// '<div class="bentobox-content-image"><img src="https://digital.library.wayne.edu/imageServer?obj=' + v.id + '&ds=THUMBNAIL" /></div>' +
							(v.isSensitive ? '<a class="bentobox-content-imagesensitive" href="' + v.url + '">SENSITIVE CONTENT<br>Click link to proceed</a>' :
								'<a class="bentobox-content-image" href="' + v.url + '"><img src="https://digital.library.wayne.edu/loris/fedora:' + v.id + '%7CTHUMBNAIL/full/full/0/default.jpg" /></a>'
							) +

							'</div>' +
							'<div class="dc-left">' +
							'<div class="bentobox-content-title"><a href="' + v.url + '">' + v.title + '</a></div>' +
							'<div class="bentobox-content-description">' + v.description + '</div>' +
							'</div>' +
							'<div style="clear:both;"></div>' +
							'</div>'
						);

						if (i >= 5 - 1) {
							return false;
						}
					});
					$('#bentobox-digitalcollections .bentobox-content').append(
						'<div>' +
						'<div class="bentobox-content-viewmore"><a href="' + response['viewMoreUrl'] + '">' + 'View More Results ' + (response['viewMoreCount'] ? '(' + response['viewMoreCount'] + ')' : '') + '</a></div>' +
						'</div>'
					);
				} else {
					$('#bentobox-digitalcollections .bentobox-content').html(
						'<div class="noresults">' +
						'<div>No Results</div>' +
						'<div>Try another search in <a href="https://digital.library.wayne.edu/digitalcollections/search.php?q=' + searchQuery + '">Digital Collections</a></div>' +
						'</div>'
					);
				}
			});


		}
	});
}



function doSearchYewno() {

	// $("#bentobox-yewno .bentobox-content2").html(
	//   '<div id="yewnoWidget"></div>'
	// );

	// yewno = yewnoWidget('#yewnoWidget', {
	//   height: 400,
	//   width: 400,
	//   query: search_query
	//   // insert your options here
	// });

	// console.log("yewnoyewnoyewnoyewno");
	// console.log(yewno);






	// $("#bentobox-yewno").show();





	// console.log("YEWNOOOOOOOOOOO");
	// $("#bentobox-yewno").css("height", "500px !important");
	// // $("#bentobox-yewno"+ ' .bentobox-content').css("height", "500px");
	// $("#bentobox-yewno"+ ' .bentobox-content').animate({'opacity': '1'}, 0, 'easeOutCubic');
	// $("#bentobox-yewno"+ ' .bentobox-loading').hide();


	// $("#bentobox-yewno .bentobox-content").html("");

	// yewnoWidget('#bentobox-yewno .bentobox-content', {
	//   height: 400,
	//   // width: "100%",
	//   // width: 400,
	//   width: $("#bentobox-yewno.bentobox .bentobox-content").width(),
	//   edges: 3,
	//   // qsp:'search'
	//   query: search_query
	// });





	requestYewno = $.ajax({
		url: "http://edge-api.yewno.com/suggest?q=" + search_query,
		method: "GET",
		// data: {
		//   search_string: search_query
		//   // data_type: 'html'
		// },
		dataType: "json",
		success: function (response) {
			// console.log("requestYewno response");
			// console.log(response);
			// console.log(response.data.length);
			if (response.data.length == 0) {
				// alert("YEWNO NO RESULTS");
				$("#bentobox-yewno").hide();
			} else {

				$("#bentobox-yewno").show();




				$("#bentobox-yewno").css("height", "500px !important");
				// $("#bentobox-yewno"+ ' .bentobox-content').css("height", "500px");
				$("#bentobox-yewno" + ' .bentobox-content').animate({ 'opacity': '1' }, 0, 'easeOutCubic');
				$("#bentobox-yewno" + ' .bentobox-loading').hide();


				$("#bentobox-yewno .bentobox-content").html("");

				yewnoWidget('#bentobox-yewno .bentobox-content', {
					height: 400,
					// width: "100%",
					// width: 400,
					width: $("#bentobox-yewno.bentobox .bentobox-content").width(),
					edges: 3,
					// qsp:'search'
					query: search_query
				});


			}
		}
	});





	function doSearchWayneEdu() {
		if (localStorage.getItem(searchQuery + "#bentobox-wayneedu" + date_full)) {
			animateBentoBox('#bentobox-wayneedu', function () {
				$('#bentobox-wayneedu .bentobox-content').html(localStorage.getItem(searchQuery + "#bentobox-wayneedu" + date_full));
			});
			//console.log("took from cache");
			return;
		}
		if (typeof requestWayneEdu == 'object') {
			requestWayneEdu.abort();
		}
		requestWayneEdu = $.ajax({
			url: host + "/api/wayneedusearch.php",
			method: "POST",
			data: {
				search_string: search_query
				// data_type: 'html'
			},
			dataType: "json",
			success: function (response) {

				animateBentoBox('#bentobox-wayneedu', function () {
					// console.log( response);
					if (validResponse(response)) {
						$.each(response['results'], function (i, v) {
							// console.log(v['titleNoFormatting']);
							$('#bentobox-wayneedu .bentobox-content').append(
								'<div>' +
								'<div class="bentobox-content-title"><a href="' + v['url'] + '">' + v['title'] + '</a></div>' +
								'<div class="bentobox-content-url">' + v['visibleUrl'] + '</div>' +
								'<div class="bentobox-content-description">' + v['description'] + '</div>' +
								'</div>'
							);

							if (i >= 5 - 1) {
								return false;
							}
						});
						$('#bentobox-wayneedu .bentobox-content').append(
							'<div>' +
							'<div class="bentobox-content-viewmore"><a href="' + response['viewMoreUrl'] + '">' + 'View More Results ' + (response['viewMoreCount'] ? '(' + response['viewMoreCount'] + ')' : '') + '</a></div>' +
							'</div>'
						);
					} else {
						$('#bentobox-wayneedu .bentobox-content').html(
							'<div class="noresults">' +
							'<div>No Results</div>' +
							'</div>'
						);
					}
				});


			}
		});
	}






	function doSearchResearchGuides() {
		if (localStorage.getItem(searchQuery + "#bentobox-researchguides" + date_full)) {
			// if () {
			//   // if localsorage is not expired
			// }
			animateBentoBox('#bentobox-researchguides', function () {
				$('#bentobox-researchguides .bentobox-content').html(localStorage.getItem(searchQuery + "#bentobox-researchguides" + date_full));
			});
			//console.log("took from cache");
			return;
		}
		if (typeof requestResearchGuides == 'object') {
			requestResearchGuides.abort();
		}
		requestResearchGuides = $.ajax({
			url: host + "/api/researchguides.php",
			method: "GET",
			data: {
				search: search_query
			},
			dataType: "json",
			success: function (response) {

				// console.log(response);
				animateBentoBox('#bentobox-researchguides', function () {
					// console.log(typeof response['results']);

					if (response.results) {
						piwikLibguidesLength = response.results.length + (response.viewMoreCount ? parseInt(response.viewMoreCount) : 0);
					} else {
						piwikLibguidesLength = 0;
					}
					// _paq.push(['setCustomVariable', 3, 'Libguides Count', piwikLibguidesLength, 'page']);


					if (validResponse(response)) {




						$.each(response['results'], function (i, v) {
							// console.log(v['titleNoFormatting']);
							$('#bentobox-researchguides .bentobox-content').append(
								'<div>' +
								'<div class="bentobox-content-title"><a href="' + v['url'] + '">' + v['title'] + '</a></div>' +
								'<div class="bentobox-content-description" style="margin-bottom:8px;">' + v['description'] + '</div>' +
								// '<div class="bentobox-content-separator" style="height:8px;width:10px;"></div>' +
								'<div class="bentobox-content-data"><div class="label">Author:</div> ' + v['author'] + '</div>' +
								'<div class="bentobox-content-data"><div class="label">Subject:</div> ' + v['subject'] + '</div>' +
								'<div class="bentobox-content-data"><div class="label">Updated:</div> ' + v['last_updated'] + '</div>' +
								'</div>'
							);

							if (i >= 5 - 1) {
								return false;
							}
						});
						$('#bentobox-researchguides .bentobox-content').append(
							'<div>' +
							'<div class="bentobox-content-viewmore"><a href="' + response['viewMoreUrl'] + '">' + 'View More Results ' + (response['viewMoreCount'] ? '(' + response['viewMoreCount'] + ')' : '') + '</a></div>' +
							'</div>'
						);
					} else {
						$('#bentobox-researchguides .bentobox-content').html(
							'<div class="noresults">' +
							'<div>No Results</div>' +
							'<div>Try another search in <a href="http://guides.lib.wayne.edu/srch.php?q=' + searchQuery + '">Guides</a></div>' +
							'</div>'
						);
					}
				});


			}
		});
	}

	$(document).on('ready', function () {



		// HISTORY.JS and related stuff

		var History = window.History;
		History.Adapter.bind(window, 'statechange', function () {
			var State = History.getState();

			// returns { data: { params: params }, title: "Search": url: "?search" }
			//console.log(State); 

			// or you could recall search() because that's where this state was saved
			// if (State.url == "?search") {
			//   search(data.params);
			// }

			// console.log("State Change:");
			// console.log(State);

			var query = State.data.query;
			// console.log("Query:" + query);

			var stateTitle = State.title;
			// console.log("stateTitle:" + stateTitle);

			// if (query == undefined || query == '') {
			// if (State.cleanUrl != 'http://localhost/') {
			//   window.location = State.url;
			// }
			// if (query == undefined || query == '') {
			// if (query === undefined) {
			//   window.location = host + State.hash;
			// } else {
			//   // $('.search-field').val(query);
			//   // doSearch();
			// }





			// if (query === undefined) {
			//   window.location = host + State.hash;
			// } else {
			//   // $('.search-field').val(query);
			//   // doSearch();
			// }




			if (State.data.page == 'home') {
				// console.log("CASE 1");
				// go home
				$('.search-field').val('');
				undoSearch();
			} else if (typeof State.data.query == 'string' && State.data.query.length >= 1) {
				// query is saved in state
				// console.log("SEARCHING TRIGGERED BY HISTORY.JS");
				if ($('.search-field').val() != query) {
					$('.search-field').val(query);
					doSearch('fromhistoryjs');
				}
				alreadySearchedOnce = true;
			}
			// console.log(State);
			else if (State.title == '') {
				// console.log("CASE 3");
				window.location = State.url;
			} else if (alreadySearchedOnce == true && typeof State.data.query == "undefined") {
				// console.log("CASE 4");
				// for when you hit back button and the next page is basic and doesnt have a ?search= in the url
				// state data has nothing in it so just go to the url
				window.location = State.url;
			}

		});


		dontAnimateBentoBoxes = false;
		//console.log(searchQuery);
		if (searchQuery) {
			// if ( !alreadySearchedOnce ) {
			// console.log("SEARCHING TRIGGERED BY ?search= PARAMETER"); // doesnt seem to happer when back and forward button are clicked
			$('.search-field').val(searchQuery);
			doSearch('fromload');
			// }
			dontAnimateBentoBoxes = true;
		}
	});










	alreadySearchedOnce = false;

	window.page = 'homepage';

	mastheadHeightOriginal = '600px';
	mastheadHeightSearchBar = '104px';

	$(document).on('ready', function () {
		if (typeof dontFocusSearchBox !== 'undefined' && dontFocusSearchBox) {
		} else {
			$('#masthead-search-nest-input').focus();
		}
		$('.search-field').keypress(function (e) {
			if (e.which == 13) {
				//console.log(45);
				doSearch();
				return false; //<---- Add this line
			}
		});

		// $('#masthead-search-nest-button').on('click', doSearch);
		$('.search-button').on('click', doSearch);
		$('.headernew-searchboxbutton').on('click', doSearch);
		$('.headernewhome-searchboxbutton').on('click', doSearch);








		animateBentoBoxOnWindowResize();
		$(window).on('resize', animateBentoBoxOnWindowResize);

		// make sure both regular and mobile have the same input values when one is changed
		$('.search-field#header-mobile-searcharea-search-nest-input').on('input propertychange paste keyup', function () {
			console.log('VAL1: ' + $(this).val());
			$('.search-field#masthead-search-nest-input').val($(this).val());
		});
		$('.search-field#masthead-search-nest-input').on('input propertychange paste keyup', function () {
			console.log('VAL2: ' + $(this).val());
			$('.search-field#header-mobile-searcharea-search-nest-input').val($(this).val());
		});

		$('.headernew-searchbox .search-field').on('input propertychange paste keyup', function () {
			console.log('VAL3: ' + $(this).val());
			$('.headernewhome-searchbox .search-field').val($(this).val());
		});
		$('.headernewhome-searchbox .search-field').on('input propertychange paste keyup', function () {

			console.log('VAL4: ' + $(this).val());

			if ($(this).val()) {
				$('.headernew-searchbox .search-field').val($(this).val());
				$('.search-field#masthead-search-nest-input').val($(this).val());
				$('.search-field#header-mobile-searcharea-search-nest-input').val($(this).val());

				console.log('zzz:' + $('#header-mobile-searcharea-search-nest-input').val());
			}
		});


	});



// });
