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
var sbookTitle;;
var tbookTitle;
var bgmToggle;
var readToggle;
var autoplayToggle;
var textToggle;
var textDisplay;
var textPinyin;
var dictToggle;
var dict;
var playRate = 1;

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
				au.attr('src', auPath + '/' + thisPage + '.mp3');
			} else {
				au.attr('src', auPath + '/' + thisPage + '.ogg');
			}
		}
		fAudioControl(au, 'play', (parseFloat(time+0.01)), playRate);
	} else {
		readToggle = false;
		fAudioControl(au, 'pause', au.prop('currentTime'), playRate);
	}
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
		au.prop('currentTime', (parseFloat($(this).data("start")+0.01)));
		fReadToggle(true, './assets', currentSlide, au.prop('currentTime'));
	});
};
	
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
			
	fBGMToggle(bgmToggle);
//	fReadToggle(readToggle, './assets', currentSlide, 0.01);
	fAutoplayToggle(autoplayToggle, currentSlide, au.prop('duration'), au.prop('currentTime'));
	fTextDisplay(textToggle, textDisplay);

	fTextPinyin(textPinyin);
	fDictToggle(dictToggle);
		
	currentSlide = 0;
	currentPage = currentSlide + 1;
	console.log("icurrent-"+currentPage+"==ibook-"+book_page);
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
	currentSlide = book_page -1;
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
console.log("Enter+ID-" + sCls);
		$("." + sCls).addClass("selected");
	})
	.on('mouseleave', '.words', function() {
		sCls = $(this).attr('id');
console.log("Leave+ID-" + sCls);
		$("." + sCls).removeClass("selected");
	});
	
	$('#play-start').css('background-image', 'url("../css/images/play-button.png")');

	$('#play-start').on('click', function() {
		document.getElementById('read').play();
		$('#play-overlay').hide();
		fHookTime(0);
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
	console.log("fcurrent-"+currentPage+"==fbook-"+book_page);
				window.parent.updatePage(currentPage, book_page);
		};
	});
	$('#play-normal').on('click', function() {
		playRate = 1;
		au.prop('playbackRate', playRate);
		fReadToggle(readToggle, null, null, null);
	});
	$('#play-fast').on('click', function() {
		playRate = 1.5;
		au.prop('playbackRate', playRate);
		fReadToggle(readToggle, null, null, null);
	});
	$('#play-slow').on('click', function() {
		playRate = .75;
		au.prop('playbackRate', playRate);
		fReadToggle(readToggle, null, null, null);
	});
});
