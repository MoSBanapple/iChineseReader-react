// V. 20161027-01
/* Typekit */
jQuery.cachedScript = function(url, options) {
	options = $.extend( options || {}, {
		dataType: "script",
		cache: true,
		url: url
	});
	return jQuery.ajax(options);
};
$.cachedScript("https://use.typekit.net/ekn3zkm.js").done(function(script, textStatus) {
	console.log(textStatus);
	try{Typekit.load({ async: true });}catch(e){};
});

function launchFullScreen(element) {
	if(element.requestFullscreen) {
		element.requestFullscreen();
	} else if(element.mozRequestFullScreen) {
		element.mozRequestFullScreen();
	} else if(element.webkitRequestFullscreen) {
		element.webkitRequestFullscreen();
	} else if(element.msRequestFullscreen) {
		element.msRequestFullscreen();
	}
}
function exitFullScreen() {
  if(document.exitFullscreen) {
    document.exitFullscreen();
  } else if(document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if(document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if(document.msExitFullscreen) {
    document.msExitFullscreen();
  }
}

var book_page = $('.book-slide>div').length;
var au = $('#read');
var bgm = $('#bgm');
var oldPage = 0;
var currentPage = 1;
var currentSlide = 0;
var duration = 0;
var oldPage = 0;
var currentPage = 0;
var sbookTitle;
var tbookTitle;
var bgmToggle;
var readToggle = true;
var readDefault;
var autoplayToggle;
var textToggle;
var textDisplay;
var textPinyin;
var dictToggle;
var dict;
var playRate = 1;
var auLang = "";
var cTime = new Array();
var mTime = new Array();

/*
$.ajax({
	dataType: "json",
	url: "./dict.json",
	success: function(data) {
		console.log("load");
		dict = data;
		console.log(dict);
	}
});
*/

var fTextDisplay = function(toggle, type) {
	switch(type) {
		case 't':
			textDisplay = 't';
			$('.text.simp-p').hide();
			$('.text.trad-p').show();
			$('#book-title').html(tbookTitle);
			break;
		default:
			textDisplay = 's';
			$('.text.trad-p').hide();
			$('.text.simp-p').show();
			$('#book-title').html(sbookTitle);
	}
	if (toggle) {
		textToggle = true;
		$('.text-block').removeClass('text-block-fo');
		$('.text-block').addClass('text-block-fi');
	} else {
		textToggle = false;
		$('.text-block').removeClass('text-block-fi');
		$('.text-block').addClass('text-block-fo');
	}
};
var fTextPinyin = function(toggle) {
	if (toggle) {
		textPinyin = true;
		$('.text-block rt').css('visibility', 'visible');
	} else {
		textPinyin = false;
		$('.text-block rt').css('visibility', 'hidden');
	}
};
var fAutoplayToggle = function(toggle, current, duration, time) {
	if (toggle) {
		autoplayToggle = true;
console.log("au-time:" + time + "-- au-dur:" + duration);
		if (time >= duration) {
			if (current < (book_page - 1)) {
				window.setTimeout(function() {
					$('.book-slide').slick('slickNext');
				}, 500);
			} else {
				autoplayToggle = false;
			}
		}
	} else {
		autoplayToggle = false;
	}
};
var fDictToggle = function(toggle) {
	if (toggle) {
		dictToggle = true;
		$('.tt-hook').show();
		$('.dict-text').css('color', '#f0f');
	} else {
		dictToggle = false;
		$('.tt-hook').hide();
		$('.dict-text').css('color', '#222');
	}
};
var fAudioControl = function(acau, acfunc, actime, rate) {
	var load = 0;
	acau.on('loadedmetadata', function() {
		if (load === 0) {
			acau.prop('currentTime', actime);
			if (acfunc === 'play') {
				acau.prop('playbackRate', rate);
				acau.prop('muted', false);
				acau.trigger('play');
			} else if (acfunc === 'pause') {
				acau.prop('playbackRate', rate);
				acau.prop('muted', true);
				acau.trigger('pause');
			}
			load = 1;
		}
	});
};
var fReadToggle = function(toggle, auPath, current, time) {
	var auSource;
	if (((auPath === null) || (!auPath)) && ((current === null) || (!current)))
		auSource = false;
	else
		auSource = true;
	if ((time === null) || (!time)) time = au.prop('currentTime');
	if (toggle) {
		readToggle = true;
		var thisPage = current;
		if (auSource) {
			if (document.getElementById('read').canPlayType('audio/mpeg')) {
				au.attr('src', auPath + '/' + thisPage + auLang + '.mp3');
			} else {
				au.attr('src', auPath + '/' + thisPage + auLang + '.ogg');
			}
		}
//console.log('PLAY?');
		fAudioControl(au, 'play', (parseFloat(time+0.01)), playRate);
	} else {
		readToggle = false;
//console.log('PAUSE?');
		fAudioControl(au, 'pause', au.prop('currentTime'), playRate);
	}
};
var fLangToggle = function(type) {
	if (type === 'c') {
		console.log("Cantonese");
		console.log(currentPage);
		auLang = "c";
	} else {
		console.log("Mandarin");
		console.log(currentPage);
		auLang = "";
	}
	fAssignTime(auLang);
	fReadToggle(readToggle, './assets', currentSlide, 0.01);
};

var fBGMToggle = function(toggle) {
	if (toggle) {
		bgmToggle = true;
		bgm.trigger("play");
//		fAudioControl(bgm, 'play', parseFloat(0.01), 1);
	} else {
		bgmToggle = false;
		bgm.trigger("pause");
		fAudioControl(bgm, 'pause', bgm.prop('currentTime'), 1);
	}
};

var fHookTime = function(current) {
	$('#read').on('timeupdate', function() {
		fAutoplayToggle(autoplayToggle, current, au.prop('duration'), au.prop('currentTime'));

		$.each(eval('words'+current), function(id, time) {
			if(((au.prop('currentTime') - time.start) > 0) && ((time.end - au.prop('currentTime')) > 0)) {
				$(".words").removeClass("selected");
				$("." + id).addClass("selected");
			} else {
				$("." + id).removeClass("selected");
			}
		});
	});
	$(".words")
	.hover(function() {
		sCls = $(this).attr('id');
		$("." + sCls).addClass("selected");
	}, function() {
		sCls = $(this).attr('id');
		$("." + sCls).removeClass("selected");
	})
	.unbind()
	.click(function() {
		if (readToggle === true) {
			au.prop('currentTime', (parseFloat($(this).data("start")+0.01)));
			fReadToggle(true, './assets', currentSlide, au.prop('currentTime'));
		}
	});
};

var fLoadCTime = function(current) {
	$.ajax({
		dataType: 'text',
		url: './assets/' + current + 'c.txt',
		success: function(data) {
			console.log('C time sheet loaded');
			dict = data;
			var lines = dict.split("\n");
			var i = 0;
			var start = 0;
			while (lines[i] !== "") {
				end = lines[i].split("\t");
				line = i + 1;
//console.log("current-"+current+"==line-"+line);
				cTime['w'+current+'-'+line] = {'start': parseFloat(start), 'end': parseFloat(end[1])};
				start = parseFloat(end[1]) + 0.001;
				i++;
			}
			return true;
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log(jqXHR);
			console.log(errorThrown);
			return false;
		}
	});
};

var fLoadMTime = function(current) {
	$.ajax({
		dataType: 'text',
		url: './assets/' + current + 'm.txt',
		success: function(data) {
			console.log('M time sheet loaded');
			dict = data;
			var lines = dict.split("\n");
			var i = 0;
			var start = 0;
			while (lines[i] !== "") {
				end = lines[i].split("\t");
				line = i + 1;
//console.log("current-"+current+"==line-"+line);
				mTime['w'+current+'-'+line] = {'start': parseFloat(start), 'end': parseFloat(end[1])};
				start = parseFloat(end[1]) + 0.001;
				i++;
			}
			return true;
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log(jqXHR);
			console.log(errorThrown);

			if (eval('words'+current)['w'+current+'-1'] !== undefined) {
				for (var i = 0; i < $('#p'+current+' .simp-p .words').length; i++) {
					line = i + 1;

					// Read Mandarin Data
	//console.log("current-"+page+"==line-"+line);
					if (eval('words'+current)['w'+current+'-'+line] !== undefined) {
						mstart = eval('words'+current)['w'+current+'-'+line]['start'];
					} else {
						mstart = '';
					}
					if (eval('words'+current)['w'+current+'-'+line] !== undefined) {
						mend = eval('words'+current)['w'+current+'-'+line]['end'];
					} else {
						mend = '';
					}
	//console.log("start-"+mstart+"==end-"+mend);
				// Save Mandarin Variable
					mTime['w'+current+'-'+line] = {'start': parseFloat(mstart), 'end': parseFloat(mend)};
				}
				return true;
			} else {
				return false;
			}
		}
	});
};

var fLoadTimeVar = function() {
	var mstart;
	var cstart;
	var mend;
	var cend;
	for (var k = 0; k < $('.book-content').length; k++) {
		page = k;
//		console.log("ftest-m:" + fLoadMTime(page));
		if (!fLoadMTime(page)) {
			console.log("M-sheet loaded failed!" + page);
		} else {
			console.log("M-sheet loaded!" + page);
		}
		// Read Cantonese Data
//		console.log("ftest-c:" + fLoadCTime(page));
		if (!fLoadCTime(page)) {
			console.log("C-sheet loaded failed!" + page);
		} else {
			console.log("C-sheet loaded!" + page);
		}

//		console.log("mTime");
//		console.log(mTime);
//		console.log("cTime");
//		console.log(cTime);
	}
};

var fAssignTime = function(type) {
//console.log("fAssignTime"+type);
	for (var k = 0; k < $('.book-content').length; k++) {
		page = k;
		for (var i = 0; i < $('#p'+page+' .simp-p .words').length; i++) {
			line = i + 1;

			if (type === 'c') {
//console.log("c-type:"+page+"="+line);
				if (cTime['w'+page+'-'+line] !== undefined) {
//console.log("cTime:"+cTime['w'+page+'-'+line]['start']+"=="+cTime['w'+page+'-'+line]['end']);
					eval('words'+page)['w'+page+'-'+line] = {'start': parseFloat(cTime['w'+page+'-'+line]['start']), 'end': parseFloat(cTime['w'+page+'-'+line]['end'])};

					$('.simp-p #w'+page+'-'+line).data('start', cTime['w'+page+'-'+line]['start']);
					$('.trad-p #w'+page+'-'+line).data('start', cTime['w'+page+'-'+line]['start']);
					$('.simp-p #w'+page+'-'+line).data('end', cTime['w'+page+'-'+line]['end']);
					$('.trad-p #w'+page+'-'+line).data('end', cTime['w'+page+'-'+line]['end']);
				}
			} else if (type === '') {
//console.log("m-type:"+page+"="+line);
				if (mTime['w'+page+'-'+line] !== undefined) {
//console.log("mTime:"+mTime['w'+page+'-'+line]['start']+"=="+mTime['w'+page+'-'+line]['end']);
					eval('words'+page)['w'+page+'-'+line] = {'start': parseFloat(mTime['w'+page+'-'+line]['start']), 'end': parseFloat(mTime['w'+page+'-'+line]['end'])};

					$('.simp-p #w'+page+'-'+line).data('start', mTime['w'+page+'-'+line]['start']);
					$('.trad-p #w'+page+'-'+line).data('start', mTime['w'+page+'-'+line]['start']);
					$('.simp-p #w'+page+'-'+line).data('end', mTime['w'+page+'-'+line]['end']);
					$('.trad-p #w'+page+'-'+line).data('end', mTime['w'+page+'-'+line]['end']);
				}
			}
		}
	}
}

var init = function(skt, tkt, bmt, rdt, ayt, ttt, ttd, ttp, dtt) {
//console.log("SBK:"+skt+"-TBT:"+tkt+"-BGM:"+bmt+"-RDT:"+rdt+"-APT:"+ayt+"-TXT:"+ttt+"-TXD:"+ttd+"-TXP:"+ttp+"-DTT:"+dtt+"-ISF:"+isf);
	sbookTitle = skt;
	tbookTitle = tkt;
	bgmToggle = bmt;
	readToggle = rdt;
	autoplayToggle = ayt;
	textToggle = ttt;
	textDisplay = ttd;
	textPinyin = ttp;
	dictToggle = dtt;
	readDefault = rdt;

	fBGMToggle(bgmToggle);
//	fReadToggle(readToggle, './assets', currentSlide, 0.01);
	fAutoplayToggle(autoplayToggle, currentSlide, au.prop('duration'), au.prop('currentTime'));
	fTextDisplay(textToggle, textDisplay);

	fTextPinyin(textPinyin);
	fDictToggle(dictToggle);

	currentSlide = 0;
	currentPage = currentSlide + 1;
	window.parent.updatePage(currentPage, book_page);

};
var getPage = function() {
	currentPage = currentSlide + 1;
	return currentPage;
};
var getTotalPage = function() {
	return book_page;
};
var gotoPage = function(page) {
	$('.book-slide').slick('slickGoTo', page-1);
	currentSlide = page;
	currentPage = currentSlide + 1;
	return currentPage;
};
var goFirstPage = function() {
	$('.book-slide').slick('slickGoTo', 0);
	currentSlide = 0;
	currentPage = currentSlide + 1;
	return currentPage;
};
var goLastPage = function() {
	$('.book-slide').slick('slickGoTo', book_page-1);
	currentSlide = book_page - 1;
	currentPage = currentSlide + 1;
	return currentPage;
};
var bgmOn = function() {
	fBGMToggle(true);
};
var bgmOff = function() {
	fBGMToggle(false);
};
var readOn = function() {
	fReadToggle(true, './assets', currentSlide, 0.01);
};
var readOff = function() {
	fReadToggle(false, './assets', currentSlide, 0.01);
};

var pauseRead = function() {
	readDefault = readToggle;
	readToggle = false;
	console.log('pauseRead');
	fReadToggle(readToggle, './assets', currentSlide, au.prop('currentTime'));
};
var resumeRead = function() {
	readToggle = readDefault;
	console.log('resumeRead');
	fReadToggle(readToggle, './assets', currentSlide, au.prop('currentTime'));
};

var autoplayOn = function() {
	fAutoplayToggle(true, currentSlide, au.prop('duration'), au.prop('currentTime'));
};
var autoplayOff = function() {
	fAutoplayToggle(false, currentSlide, au.prop('duration'), au.prop('currentTime'));
};
var showDict = function() {
	fDictToggle(true);
};
var hideDict = function() {
	fDictToggle(false);
};
var showPinyin = function() {
	fTextPinyin(true);
};
var hidePinyin = function() {
	fTextPinyin(false);
};
var showText = function(type) {
	fTextDisplay(true, type);
};
var hideText = function() {
	fTextDisplay(false, textDisplay);
};
var changeText = function(type) {
	fTextDisplay(textToggle, type);
	return {display: textDisplay, toggle: textToggle};
};

$(window).load(function() {
	fLoadTimeVar();
	fAssignTime(auLang);
	$('#play-normal').addClass('play-normal-on');
	$(document).on('touchstart', function() {
		$('html').removeClass('no-touch');
	});
	FastClick.attach(document.body);
	if(/Android/i.test(navigator.userAgent)) {
		$('#speed-control').hide();
	} else {
		$('#speed-control').show();
	}

	$(document)
	.on('mouseenter', '.words', function() {
		sCls = $(this).attr('id');
//console.log("Enter+ID-" + sCls);
		$("." + sCls).addClass("selected");
	})
	.on('mouseleave', '.words', function() {
		sCls = $(this).attr('id');
//console.log("Leave+ID-" + sCls);
		$("." + sCls).removeClass("selected");
	});

	setTimeout(function() { $('#play-start').css('background-image', 'url("../css/images/play-button.png")'); }, 3000);

	$('#play-start').on('click', function() {
/* Typekit */
		$.cachedScript("https://use.typekit.net/ekn3zkm.js").done(function(script, textStatus) {
			console.log(textStatus);
			

			try{Typekit.load({ async: true });}catch(e){};
		});
console.log("typekit-load");
		if (document.getElementById('read') !== null)
			document.getElementById('read').src = './assets/0.mp3';
			document.getElementById('read').play();
		$('#play-overlay').hide();
		fHookTime(0);
//		console.log("au-"+au+" ");
//		console.log("readToggle-"+readToggle);
		if (au !== null) fReadToggle(readToggle, './assets', 0, 0.01);
		if (bgm !== null) fBGMToggle(bgmToggle);
	});

	$(document).foundation();

	$('.book-slide').slick({
		infinite: false,
		arrows: true,
		respondTo: 'window',
		autoplay: false,
		autoplaySpeed: 3000,
		fade: false,
		prevArrow: '<div class="slick-prev"></div>',
		nextArrow: '<div class="slick-next"></div>'
	});

	$('.book-slide').on('beforeChange', function(event, slick, current) {
		oldPage = current;
/* Typekit */
		$.cachedScript("https://use.typekit.net/ekn3zkm.js").done(function(script, textStatus) {
			console.log(textStatus);
			try{Typekit.load({ async: true });}catch(e){};
		});
	});
	$('.book-slide').on('afterChange', function(event, slick, current) {
		if (current !== oldPage){
			oldPage = current;
			$(".words").removeClass("selected");
			currentSlide = current;
			currentPage = currentSlide + 1;
			fHookTime(currentSlide);
			fReadToggle(readToggle, './assets', currentSlide, 0.01);

			var d = new Date();
			$('#p'+currentSlide+' .reload').attr('src', $('#p'+currentSlide+' .reload').attr('src') + '?' + d.getTime());
//			if (currentSlide < (book_page - 1)) {
//					fAutoplayToggle(autoplayToggle, currentSlide, au.prop('duration'), au.prop('currentTime'));
//			} else
//					fAutoplayToggle(false);
				window.parent.updatePage(currentPage, book_page);
		};
	});
	$(document).on('open.fndtn.reveal', '[data-reveal]', function () {
//		console.log("modal-open");
		if (readToggle === true)
			au.trigger('pause');
	});
	$(document).on('closed.fndtn.reveal', '[data-reveal]', function () {
//		console.log("modal-closed");
		if (readToggle === true)
			au.trigger('play');
	});
	$('#play-normal').on('click', function() {
		$('#play-slow').removeClass('play-slow-on');
		$('#play-fast').removeClass('play-fast-on');
		$('#play-normal').addClass('play-normal-on');
		playRate = 1;
		au.prop('playbackRate', playRate);
		fReadToggle(readToggle, null, null, null);
	});
	$('#play-fast').on('click', function() {
		$('#play-slow').removeClass('play-slow-on');
		$('#play-fast').addClass('play-fast-on');
		$('#play-normal').removeClass('play-normal-on');
		playRate = 1.5;
		au.prop('playbackRate', playRate);
		fReadToggle(readToggle, null, null, null);
	});
	$('#play-slow').on('click', function() {
		$('#play-slow').addClass('play-slow-on');
		$('#play-fast').removeClass('play-fast-on');
		$('#play-normal').removeClass('play-normal-on');
		playRate = .75;
		au.prop('playbackRate', playRate);
		fReadToggle(readToggle, null, null, null);
	});
});
