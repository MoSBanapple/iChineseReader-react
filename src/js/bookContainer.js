import React from "react";
import '../css/common.css';
import '../css/bookContainer.css';
import {BASE_URL, makeRequest} from './common';
import Modal from 'react-modal';
import cookie from 'react-cookies';
import { Link, Redirect } from 'react-router-dom';
import back_btn from '../images/back-button.png';
import close_button from "../images/icn_incorrectanswer.png";
import writing_button from "../images/icon_student_writing.png";
import left_arrow from "../images/arrow-L.png";
import right_arrow from "../images/arrow-R.png";
import recording_button from "../images/icon_voice_recording.png";
import settings_button from "../images/btn_hamburger_menu.png";
import bookmark_button from "../images/bookmark.png";
import on_switch from "../images/on_switch.png";
import off_switch from "../images/off_switch.png";
import quiz_button from "../images/btn_quiz_uncomplete.png";
import quiz_unavailable from "../images/rsz_btn_quiz_disabled.png";


function getBetween(input, left, right){
	let firstIndex = input.indexOf(left) + left.length;
	let lastIndex = input.indexOf(right);
	return input.toString().substring(firstIndex, lastIndex);
}


String.prototype.toCamelCase = function() {
  return this.replace(/^([A-Z])|[-](\w)/g, function(match, p1, p2, offset) {
    if (p2) return p2.toUpperCase();
    return p1.toLowerCase();
  });
};


function stringToStyle(input){
	let cameled = input.toCamelCase();
	cameled = cameled.replace(/:/g, '":"');
	cameled = cameled.replace(/;/g, '","');
	cameled = cameled.replace(/{/g, '{"');
	cameled = cameled.replace(/,"[\s]*}/g, '}');
	cameled = cameled.replace(/https":"/g, "https:");
	cameled = cameled.replace(/\s/g,'')
	return JSON.parse(cameled);
};

function renderCharacter(character, pinyin){
	return (
	<ruby>
	{character}
	<rt>{pinyin}</rt>
	</ruby>
	);
};


export default class BookContainer extends React.Component {
	constructor(props){
		super(props);
		let info = cookie.load('userInfo', {doNotParse: true});
		if (info == undefined){
			this.state = {
				userInfo: undefined,
			}
			return;
		}
		
		this.state = {
			userInfo: info,
			prevPage: cookie.load('prevPage', {doNotParse: true}),
			toPrevPage: false,
			profileInfo: null,
			bookId: this.props.match.params.id,
			bookInfo: null,
			assignmentId: this.props.match.params.assignid,
			assignmentInfo: null,
			showWriting: false,
			showSettings: false,
			writingText: "",
			writingInfo: null,
			bookContentRaw: "",
			bookContentParsed: null,
			currentPage: 0,
			currentPinyin: false,
			currentText: "No text",
			currentAudio: "No_audio",
			finishedBook: false,
			finishedMessage: "",
			autoplay: false,
			thisPageAudio: null,
			redText: null,
			redStarts: 0,
			
		};
		this.retrieveProfileInfo();
		this.sendStartSession();
		this.retrieveWritingInfo()
		
	};
	
	getUserInfo(){
	    return JSON.parse(this.state.userInfo);
	};
	
	retrieveProfileInfo(){
		let auth = this.getUserInfo().authToken;
		var asy = true;
		var request = new XMLHttpRequest();
		request.onload = function () {
			var parsed = JSON.parse(request.responseText);
			if (request.status != 200){
				alert("Getting profile error: " + request.responseText);
				this.setState({userInfo: undefined});
				return;
			}
			
			this.setState({
				profileInfo: parsed,
				currentPinyin: parsed.settings.pinyin,
				currentText: parsed.settings.language,
				currentAudio: parsed.settings.lang,
			}, function () {
				this.retrieveBookInfo();
			});
		}.bind(this)
		let url = BASE_URL + "/usermanager/profile"; 
		request.open("GET", url, asy);
		request.setRequestHeader("AuthToken", auth);
		request.send(null);
	};
	
	retrieveBookInfo(){
		let auth = this.getUserInfo().authToken;
		var asy = true;
		var request = new XMLHttpRequest();
		request.onload = function () {
			var parsed = JSON.parse(request.responseText);
			if (request.status != 200){
				alert("Getting book error: " + request.responseText);
				this.setState({userInfo: undefined});
				return;
			}
			
			let nextTextState = this.state.currentText;
			if (!parsed.book.bookFeatures.simplified && this.state.currentText == "Simplified"){
				nextTextState = "Traditional";
			} else if (!parsed.book.bookFeatures.traditional && this.state.currentText == "Traditional"){
				nextTextState = "Simplified";
			}
			
			let nextAudioState = this.state.currentAudio;
			if (!(parsed.book.language == "Mandarin" || parsed.book.bilingual) && this.state.currentAudio == "Mandarin"){
				nextAudioState = "Cantonese";
			} else if (!(parsed.book.language == "Cantonese" || parsed.book.bilingual) && this.state.currentAudio == "Cantonese"){
				nextAudioState = "Mandarin";
			}
			
			let nextPinyin = this.state.currentPinyin;
			if (!parsed.book.bookFeatures.pinyin){
				nextPinyin = false;
			}
			
			
			this.setState({
				bookInfo: parsed,
				finishedBook: parsed.readComplete,
				currentText: nextTextState,
				currentAudio: nextAudioState,
				currentPinyin: nextPinyin,
			}, function () {
				this.retrieveContentInfo();
				
			});
		}.bind(this)
		let url = BASE_URL + "/superadmin/book/" + this.state.bookId;
		
		request.open("GET", url, asy);
		request.setRequestHeader("AuthToken", auth);
		request.send(null);
	};
	
	retrieveWritingInfo(){
		let auth = this.getUserInfo().authToken;
		var asy = true;
		var request = new XMLHttpRequest();
		request.onload = function () {
			var parsed = JSON.parse(request.responseText);
			if (request.status != 200){
				console.log("Getting writing error: " + request.responseText);
				return;
			}
			
			this.setState({
				writingInfo: parsed,
				writingText: parsed.text,
			}, function () {
				
			});
		}.bind(this)
		let url = BASE_URL + "/studentmanager/writing/" + this.getUserInfo().user.userName + "/" + this.state.bookId;
		request.open("GET", url, asy);
		request.setRequestHeader("AuthToken", auth);
		request.send(null);
	};
	
	retrieveBookmark(){
		let auth = this.getUserInfo().authToken;
		var asy = true;
		var request = new XMLHttpRequest();
		request.onload = function () {
			if (request.status != 200){
				console.log("Getting bookmark error: " + request.responseText);
				return;
			}
			if (request.responseText != ""){
				console.log("got bookmark");
				let parsed = JSON.parse(request.responseText);
				this.changePage(parsed.page);
			} else{
				console.log("no bookmark");
				this.changePage(0);
			}
		}.bind(this)
		let url = BASE_URL + "/superadmin/bookmark/" + this.state.bookId;
		request.open("GET", url, asy);
		request.setRequestHeader("AuthToken", auth);
		request.send(null);
	};
	
	retrieveContentInfo(){
		var asy = true;
		var request = new XMLHttpRequest();
		request.onload = function () {
			if (request.status != 200 && request.status != 304){
				alert("Getting bookContent error");
				return;
			}
			this.setState({
				bookContentRaw: request.responseText,
			}, function () {
				this.extractContent();
				this.retrieveBookmark();
			});
		}.bind(this)
		let url = this.state.bookInfo.book.bookContentLink;
		request.open("GET", url, asy);
		request.send(null);
	};
	
	sendStartSession(){
		let auth = this.getUserInfo().authToken;
		var asy = true;
		var request = new XMLHttpRequest();
		var postBody = JSON.stringify({
			bookId: this.state.bookId,
			sessionActivity: "BOOK_READ_START",
		});
		request.onload = function () {
			var parsed = JSON.parse(request.responseText);
			if (request.status != 200){
				alert("Start error: " + request.responseText);
				return;
			}
			
		}.bind(this)
		let url = BASE_URL + "/superadmin/track/start";
		request.open("POST", url, asy);
		request.setRequestHeader("AuthToken", auth);
		request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		request.send(postBody);
	}
	
	sendBookmark = () => {
		let auth = this.getUserInfo().authToken;
		var asy = true;
		var request = new XMLHttpRequest();
		request.onload = function () {
			var parsed = JSON.parse(request.responseText);
			if (request.status != 200){
				alert("Bookmark error: " + request.responseText);
				return;
			}
			alert("Bookmark set for page " + this.state.currentPage);
			
		}.bind(this)
		let url = BASE_URL + "/superadmin/bookmark/" + this.state.bookId + "/" + this.state.currentPage;
		request.open("POST", url, asy);
		request.setRequestHeader("AuthToken", auth);
		request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		request.send(null);
	};
	
	extractContent(){
		var isChinese = require('is-chinese');
		let parsed = this.state.bookContentRaw.replace(/\.\/assets/g, 
		"https://resources.ichinesereader.com/books/" + this.state.bookInfo.book.bookCode + "/assets");
		
		parsed = parsed.replace(/\r?\n|\r/g, " ");
		
		let divStyles = parsed.match(/div\..*?{.*?}/g);
		if (divStyles){
			for (let style of divStyles){
				console.log("Style: " + style);
				let targetName = getBetween(style, "div.", "{");
				let styleInsert = getBetween(style, "{", "}");
				let newReg = new RegExp('<div class="' + targetName + '"', "g");
				parsed = parsed.replace(newReg, '<div class="' + targetName + '" style="' + styleInsert + '" ');
			}
		}
		
		divStyles = parsed.match(/div#.*?{.*?}/g);
		if (divStyles){
			for (let style of divStyles){
				//console.log("Style: " + style);
				let targetName = getBetween(style, "div#", "{");
				let styleInsert = getBetween(style, "{", "}");
				let newReg = new RegExp('<div id="' + targetName + '"', "g");
				parsed = parsed.replace(newReg, '<div id="' + targetName + '" style="' + styleInsert + '" ');
			}
		}
		
		let imgStyles = parsed.match(/img#.*?{.*?}/g);
		if (imgStyles){
			for (let style of imgStyles){
				//console.log("Style: " + style);
				let targetName = getBetween(style, "img#", "{");
				let styleInsert = getBetween(style, "{", "}");
				let newReg = new RegExp('<img id="' + targetName + '"', "g");
				parsed = parsed.replace(newReg, '<img id="' + targetName + '" style="' + styleInsert + '" ');
			}
		}
		
		
		
		let content = parsed.match(/#content-[0-9]*[\s]*{(.*?)}/g);
		let fontStr = parsed.match(/font-size:[0-9]*px/g)[0];
		let fontSize = parseInt(getBetween(fontStr, ":", "px"));
		//console.log("Font size = " + fontSize);
		let pages = [];
		for (let i = 0; i < content.length; i++){
			let contentStyle = content[i].match(/{(.*?)}/)[0];
			//let contentStyle = content[i];
			//console.log(contentStyle);
			
			let imageSearchReg = new RegExp('div id="content-' + i + '.*?End Text', "g");
			let imageSearchArea = parsed.match(imageSearchReg);
			let thisPageImages = null;
			if (imageSearchArea){
				thisPageImages = imageSearchArea[0].match(/<img.*?>/g);
			}
			
			let audioTimingReg = new RegExp('"w' + i + '-[0-9]*?": {.*?}', "g");
			let audioTimingStrings = parsed.match(audioTimingReg);
			let audioStarts = null;
			let audioEnds = null;
			if (audioTimingStrings){
				audioStarts = audioTimingStrings.map(thisString => {
					return parseFloat(getBetween(thisString, "start:", ",end"));
				});
				audioEnds = audioTimingStrings.map(thisString => {
					return parseFloat(getBetween(thisString, "end:", "}"));
				});
			}
			
			let textBoxReg = new RegExp("#textbox-" + i + "_[0-9]*[ ]*{(.*?)}", "g");
			let textBoxes = parsed.match(textBoxReg);
			//console.log("Textboxes: " + textBoxes);
			let textBoxStyles = null;
			if (textBoxes){
				textBoxStyles = textBoxes.map(thisBox => {
					return thisBox.match(/{(.*?)}/)[0];
				});
			}
			let simpBoxReg = new RegExp("#textbox-" + i + "_[0-9]*[ ]*\.simp-p[ ]*{(.*?)}", "g");
			let simpBoxes = parsed.match(simpBoxReg);
			let simpBoxStyles = null;
			if (simpBoxes){
				simpBoxStyles = simpBoxes.map(thisBox => {
					return thisBox.match(/{(.*?)}/)[0];
				});
			}
			let tradBoxReg = new RegExp("#textbox-" + i + "_[0-9]*[ ]*\.trad-p[ ]*{(.*?)}", "g");
			let tradBoxes = parsed.match(tradBoxReg);
			let tradBoxStyles = null;
			if (tradBoxes){
				tradBoxStyles = tradBoxes.map(thisBox => {
					return thisBox.match(/{(.*?)}/)[0];
				});
			}
			let thisPage = {
				contentStyle: contentStyle,
				mandarinAudio: "https://resources.ichinesereader.com/books/" + this.state.bookInfo.book.bookCode + "/assets/" + i + ".mp3",
				cantoneseAudio: "https://resources.ichinesereader.com/books/" + this.state.bookInfo.book.bookCode + "/assets/" + i + "c.mp3",
				pageImage: "https://resources.ichinesereader.com/books/" + this.state.bookInfo.book.bookCode + "/assets/" + i + ".jpg",
				textBoxStyles: textBoxStyles,
				simpBoxStyles: simpBoxStyles,
				tradBoxStyles: tradBoxStyles,
				textBoxes: null,
				pictures: thisPageImages,
				audioStarts: audioStarts,
				audioEnds: audioEnds,
			}
			if (isNaN(fontSize) || !textBoxes){
				pages.push(thisPage);
				continue;
			}
			let pageDivSearchReg = new RegExp('<div id="content-' + i + '.*?<div id="textbox-' + i, "g");
			let pageDivSearch = parsed.match(pageDivSearchReg);
			let pageDivStyle = null;
			if (pageDivSearch){
				pageDivStyle = pageDivSearch[0].match(/<div class=.*?>/g);
				if (pageDivStyle){
					pageDivStyle = pageDivStyle[0];
				}
			}
			let endLoop = textBoxes.length;
			for (let j = 1; j <= endLoop; j++){
				//console.log(i+", " + j);
				let divReg = new RegExp('<div id="textbox-' + i + '_' + j + '.*?<div id="textbox-' + i + '-' + (j+1), "g");
				let divStr = parsed.match(divReg);
				if (!divStr){
					divReg = new RegExp('<div id="textbox-' + i + '_' + j + '.*?End Text Block', "g");
					divStr = parsed.match(divReg);
				}
				//console.log(divStr);
				if (!divStr){
					textBoxes[j-1] = {
						simpSentences: null,
						tradSentences: null,
						//pinyins: [],
					};
					continue;
				}
				divStr = divStr[0];
				let simpBlock = divStr.match(/<div class="text simp-p .*?(<div class="text trad-p|End Text)/g);
				
				if (simpBlock){
					for (let k = 0; k < simpBlock.length; k++){
						if (simpBlock[k].includes("End Text")){
							simpBlock[k] = simpBlock[k].replace(/<\/div>.*?<!--\/\/ End Text/g, "");
						} else {
							simpBlock[k] = simpBlock[k].replace(/<div class="text trad-p/g, "");
						}
					}
				}
				let tradBlock = divStr.match(/<div class="text trad-p .*?(<div class="text trad-p|End Text)/g);
				
				if (tradBlock){
					for (let k = 0; k < tradBlock.length; k++){
						if (tradBlock[k].includes("End Text")){
							tradBlock[k] = tradBlock[k].replace(/<\/div>.*?<!--\/\/ End Text/g, "");
						} else {
							tradBlock[k] = tradBlock[k].replace(/<div class="text trad-p/g, "");
						}
					}
				}
				/*
				let wordBlocks = divStr.match(/<span id=.*?;<\/span>|<div class='para'><\/div>/g);
				let sentences = [];
				sentences = wordBlocks;
				*/
				/*
				let pinyins = [];
				for (let block of wordBlocks){
					let sentence = "";
					for (let k = 0; k < block.length; k++){
						if (isChinese(block[k])){
							sentence += block[k];
						}
					}
					let pinMatch = block.match(/<rt>.*?<\/rt>/g)
					let pin = [];
					if (pinMatch){
						pin = pinMatch.map(thisWord => {
							return getBetween(thisWord, "<rt>", "</rt>");
						});
					}
					sentences.push(sentence);
					pinyins.push(pin);
				}
				console.log(sentences);
				console.log(pinyins);
				if (!this.state.bookInfo.book.bookFeatures.pinyin){
					pinyins = null;
				}
				*/
				/*
				let simpChars = null;
				let tradChars = null;
				if (this.state.bookInfo.book.bookFeatures.simplified && this.state.bookInfo.book.bookFeatures.traditional && sentences){
					simpChars = sentences.slice(0, sentences.length/2);
					tradChars = sentences.slice(sentences.length/2, sentences.length);
				} else if (this.state.bookInfo.book.bookFeatures.simplified && sentences){
					simpChars = sentences;
				} else if (this.state.bookInfo.book.bookFeatures.traditional && sentences){
					tradChars = sentences;
				}
				*/
				if (pageDivStyle){
					for (let k = 0; k < simpBlock.length; k++){
						simpBlock[k] = pageDivStyle + simpBlock[k] + "</div>";
					}
					for (let k = 0; k < tradBlock.length; k++){
						tradBlock[k] = pageDivStyle + tradBlock[k] + "</div>";
					}
				}
				textBoxes[j-1] = {
					simpSentences: simpBlock,
					tradSentences: tradBlock,
					//pinyins: pinyins,
				};
				//console.log(textBoxes[j-1]);
			}
			thisPage.textBoxes = textBoxes;
			//console.log(thisPage);
			pages.push(thisPage);
		}
		this.setState({
			bookContentParsed: {
				numPages: content.length,
				pages: pages,
				fontSize: fontSize,
			},
		});
		console.log({
			numPages: content.length,
			pages: pages,
			fontSize: fontSize,
		});
		
	};
	
	renderCurrentPage(){
		if (!this.state.bookContentParsed){
			return null;
		}
		var css = require('css');
		
		let targetPage = this.state.bookContentParsed.pages[this.state.currentPage];
		let contentStyle = {};
		if (targetPage.contentStyle != "{}"){
			contentStyle = stringToStyle(targetPage.contentStyle);
		} else if (this.state.currentText == "Traditional"){
			contentStyle = stringToStyle(targetPage.tradBoxStyles[0]);
			//console.log(contentStyle);
		} else {
			contentStyle = stringToStyle(targetPage.simpBoxStyles[0]);
			//console.log(contentStyle);
		}
		if (!isNaN(this.state.bookContentParsed.fontSize)){
			contentStyle.fontSize = this.state.bookContentParsed.fontSize + "px";
		}
		
		let targetStyles = null;
		if (targetPage.textBoxStyles && this.state.currentText != "No text"){
			targetStyles = targetPage.textBoxStyles.map(thisStyle => {
				let temp = stringToStyle(thisStyle);
				temp.fontSize = targetPage.fontSize + "px";
				return temp;
			});
		}
		if (targetPage.simpBoxStyles && this.state.currentText == "Simplified"){
			targetStyles = targetPage.simpBoxStyles.map(thisStyle => {
				let temp = stringToStyle(thisStyle);
				temp.fontSize = targetPage.fontSize + "px";
				return temp;
			});
		}
		if (targetPage.tradBoxStyles && this.state.currentText == "Traditional"){
			targetStyles = targetPage.tradBoxStyles.map(thisStyle => {
				let temp = stringToStyle(thisStyle);
				temp.fontSize = targetPage.fontSize + "px";
				return temp;
			});
		}
		
		let renderedTextBoxes = [];
		if (targetPage.textBoxes && this.state.currentText != "No text"){
			renderedTextBoxes = targetPage.textBoxes.map((targetBox, boxIndex) => {
				let targetSentences = targetBox.simpSentences;
				if (this.state.currentText == "Traditional"){
					targetSentences = targetBox.tradSentences;
				}
				/*
				let renderedSentences = targetSentences.map((targetSentence, sentenceIndex) => {
					let sentenceOut = [];
					for(let i = 0; i < targetSentence.length - 1; i++){
						sentenceOut.push(<rb>{targetSentence[i]}</rb>);
						if (this.state.currentPinyin){
							sentenceOut.push(<rt>{targetBox.pinyins[sentenceIndex][i]}</rt>);
						}
					}
					
					return (<ruby>{sentenceOut}{targetSentence[targetSentence.length-1]}</ruby>);
				});
				console.log(targetStyles[boxIndex]);
				*/
				let renderedSentences = [];
				if (targetSentences){
					renderedSentences = targetSentences.map(thisSentence => {
						let renderedSentence = thisSentence;
						if (!this.state.currentPinyin){
							renderedSentence = renderedSentence.replace(/<rt>.*?<\/rt>/g, "");
						}
						if (this.state.redText && this.state.currentAudio != "No_audio"){
							let redReg = new RegExp("span id='w" + this.state.redText + "'", "g");
							renderedSentence = renderedSentence.replace(redReg, "span id='w" + this.state.redText + "' style='color: red' ");
						}
						return(
						<span dangerouslySetInnerHTML={{__html: renderedSentence}}/>
						);
					});
				}
				targetStyles[boxIndex].position = "relative";
				targetStyles[boxIndex].textAlign = "left";
				targetStyles[boxIndex].background = "rgba(255,255,255,0.5)";
				targetStyles[boxIndex].margin = "10px";
				targetStyles[boxIndex].borderRadius = "25px";
				return (
				<div style={targetStyles[boxIndex]}>
					{renderedSentences}
				</div>
				);
			});
		}

		contentStyle.display = "inline-block";
		let renderedImages = null;
		if (targetPage.pictures){
			renderedImages = targetPage.pictures.map(thisPicture => {
				return (<span dangerouslySetInnerHTML={{__html: thisPicture}}/>);
			});
		}
		return (
		<div style={contentStyle}>
			{renderedImages}
			{renderedTextBoxes}
		</div>
		);
		
	};
	
	

	
	finishedReading = () => {
		let auth = this.getUserInfo().authToken;
		var asy = true;
		var request = new XMLHttpRequest();
		var postBody = JSON.stringify({
			readNow: 100,
		});
		request.onload = function () {
			var parsed = JSON.parse(request.responseText);
			if (request.status != 200){
				alert("Getting book error: " + request.responseText);
				this.setState({userInfo: undefined});
				return;
			}
			console.log(request.responseText);
			if (parsed.points != 0){
				this.setState({
					finishedMessage: parsed.message,
				});
			}
		}.bind(this)
		let url = BASE_URL + "/superadmin/read/" + this.state.bookId; 
		if (this.state.assignmentId){
			url = BASE_URL + "/superadmin/read/" + this.state.assignmentId + "/" + this.state.bookId;
		}
		request.open("POST", url, asy);
		request.setRequestHeader("AuthToken", auth);
		request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		request.send(postBody);
	};
	
	showWritingButton = () => {
		this.hideSettings();
		this.setState({showWriting: !this.state.showWriting,});
	};
	
	hideWriting = () => {
		this.setState({showWriting: false,});
	};
	
	writingAreaChange = (e) => {
		this.setState({writingText: e.target.value,});
	};
	
	writingSubmit = () => {
		let auth = this.getUserInfo().authToken;
		var asy = true;
		var request = new XMLHttpRequest();
		var postBody = JSON.stringify({
			bookId: this.state.bookId,
			text: this.state.writingText,
			token: auth,
			userId: this.getUserInfo().user.userName,
		});
		let url = BASE_URL + "/studentmanager/writing"; 
		request.open("POST", url, asy);
		request.setRequestHeader("AuthToken", auth);
		request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		request.send(postBody);
		alert("Writing sent");
		this.hideWriting();
	};
	
	changePage(input){
		if (!this.state.bookContentParsed){
			return;
		}
		if (input >= 0 && input < this.state.bookContentParsed.numPages){
			if (input == this.state.bookContentParsed.numPages - 1 && !this.state.finishedBook){
				this.finishedReading();
				this.setState({finishedBook: true,});
			}
			if (this.state.thisPageAudio){
				this.state.thisPageAudio.pause();
			}
			let thisAudio = null;
			if (this.state.currentAudio == "Mandarin"){
				console.log("started mandarin");
				thisAudio = new Audio(this.state.bookContentParsed.pages[input].mandarinAudio);
			} else if (this.state.currentAudio == "Cantonese"){
				console.log("started cantonese");
				thisAudio = new Audio(this.state.bookContentParsed.pages[input].cantoneseAudio);
			}
			if (thisAudio){
				thisAudio.play();
				thisAudio.addEventListener('loadedmetadata', function(){
					setTimeout(() => {
						if (thisAudio.currentTime == thisAudio.duration && this.state.autoplay && this.state.currentAudio != "No_audio"){
							this.changePage(this.state.currentPage+1);
						}
					}, thisAudio.duration*1000 + 200);
				}.bind(this));
			}
			this.setState({currentPage: input, thisPageAudio: thisAudio,}, () => {
				if (thisAudio){
					this.startRedTexts(0);
				}
			});
			
		}
	};
	
	renderPageSelect(){
		let output = [];
		if (!this.state.bookContentParsed){
			return output;
		}
		let selects = [];
		for (let i = 0; i < this.state.bookContentParsed.numPages; i++){
			if (i == this.state.currentPage){
				selects.push(<option selected value={i}>{i+1}</option>);
			} else {
				selects.push(<option value={i}>{i+1}</option>);
			}
		}
		output.push(
		<select id="pageSelector" onChange={this.onSelectPage}>{selects}</select>
		);
		return output;
	};
	
	renderQuizButton(){
		if (this.state.finishedBook){
			return <img id="quizButton" src={quiz_button} onClick={this.onClickQuizButton}/>
		} else {
			return <img id="quizButton" src={quiz_unavailable} onClick={this.onClickQuizButton}/>
		}
	};
	
	onSelectPage = (event) => {
		this.changePage(event.target.value);
	};
	
	onClickBackButton = () => {
		if (this.state.finishedMessage != ""){
			alert(this.state.finishedMessage);
		}
		if (!this.state.prevPage){
			this.props.history.goBack();
		}
		this.setState({toPrevPage: true});
	};
	
	onClickQuizButton = () => {
		if (!this.state.finishedBook){
			alert("Complete book before starting quiz.");
			return;
		}
		if (this.state.finishedMessage != ""){
			alert(this.state.finishedMessage);
		}
		this.setState({
			toPrevPage: true,
			prevPage: this.props.location.pathname.replace("book", "quiz"),
		});
	};
	
	showSettingsButton = () => {
		this.hideWriting();
		this.setState({showSettings: !this.state.showSettings,});
	};
	
	hideSettings = () => {
		this.setState({showSettings: false,});
	};
	
	textOptionChange = (event) => {
		this.setState({currentText: event.target.value});
	};
	
	audioOptionChange = (event) => {
		if (event.target.value == "No_audio"){
			this.setState({redText: null,});
			this.state.thisPageAudio.volume = 0;
		} else {
			this.state.thisPageAudio.volume = 1;
		}
		this.setState({currentAudio: event.target.value});
	};
	
	pinyinChange = () => {
		if (this.state.bookInfo.book.bookFeatures.pinyin){
			this.setState({currentPinyin: !this.state.currentPinyin,});
		}
	};
	
	autoplayChange = () => {
		this.setState({autoplay: !this.state.autoplay,});
	};
	
	startRedTexts(startTime){
		let targetPage = this.state.bookContentParsed.pages[this.state.currentPage];
		if (!targetPage.audioStarts){
			return;
		}
		this.setState({redText: null, redStarts: this.state.redStarts + 1}, () => {
			for (let i = 0; i < targetPage.audioStarts.length; i++){
				if (startTime > targetPage.audioStarts[i]){
					continue;
				}
				let current = this.state.currentPage;
				let thisStart = this.state.redStarts;
				console.log(thisStart);
				setTimeout(() => {
					//console.log("Begin: " + current + "-" + (i+1));
					if (this.state.redText && this.state.redText[0] != current){
						return;
					} else if (thisStart == this.state.redStarts) {
						this.setState({redText: this.state.currentPage + "-" + (i+1),});
					}
				}, targetPage.audioStarts[i]*1000
				);
			
				setTimeout(() => {
					//console.log("End: " + current + "-" + (i+1));
					if (this.state.redText == current + "-" + (i+1) && thisStart == this.state.redStarts){
						//console.log("killed by end of " + current + "-" + (i+1));
						this.setState({redText: null,});
					}
				}, targetPage.audioEnds[i]*1000
				);
			}
		});
	};
	
	
	renderTextOptions(){
		let output = [];
		if (this.state.bookInfo.book.bookFeatures.simplified){
			output.push(<span><input type="radio" name="textRadio" value="Simplified" checked={this.state.currentText == "Simplified"} onChange={this.textOptionChange}/>Simplified</span>);
		}
		if (this.state.bookInfo.book.bookFeatures.traditional){
			output.push(<span><input type="radio" name="textRadio" value="Traditional" checked={this.state.currentText == "Traditional"} onChange={this.textOptionChange}/>Traditional</span>);
		}
		output.push(<span><input type="radio" name="textRadio" value="No text" checked={this.state.currentText == "No text"} onChange={this.textOptionChange} />No Text</span>);
		return output;
	};
	
	renderAudioOptions(){
		let output = [];
		if (this.state.bookInfo.book.language == "Mandarin" || this.state.bookInfo.book.bilingual){
			output.push(<span><input type="radio" name="audioRadio" value="Mandarin" checked={this.state.currentAudio == "Mandarin"} onChange={this.audioOptionChange}/>Mandarin</span>);
		}
		if (this.state.bookInfo.book.language == "Cantonese" || this.state.bookInfo.book.bilingual){
			output.push(<span><input type="radio" name="audioRadio" value="Cantonese" checked={this.state.currentAudio == "Cantonese"} onChange={this.audioOptionChange}/>Cantonese</span>);
		}
		output.push(<span><input type="radio" name="audioRadio" value="No_audio" checked={this.state.currentAudio == "No_audio"} onChange={this.audioOptionChange}/>No Audio</span>);
		return output;
	};
	
	renderPinyinButton(){
		if (this.state.currentPinyin){
			return(<img className="clickableImage" onClick = {this.pinyinChange} src={on_switch}/>);
		} else {
			return(<img className="clickableImage" onClick = {this.pinyinChange} src={off_switch}/>);
		}
	};
	
	renderAutoplayButton(){
		if (this.state.autoplay){
			return(<img className="clickableImage" onClick = {this.autoplayChange} src={on_switch}/>);
		} else {
			return(<img className="clickableImage" onClick = {this.autoplayChange} src={off_switch}/>);
		}
	};
	
	render() {
		if (this.state.userInfo == undefined){
			if (this.state.thisPageAudio){
				this.state.thisPageAudio.pause();
			}
			return <Redirect push to = {{
			pathname:"/",
			}}/>
		}
		if (this.state.toPrevPage){
			if (this.state.thisPageAudio){
				this.state.thisPageAudio.pause();
			}
			return <Redirect push to = {{
			pathname:this.state.prevPage,
			}}/>
		}
		if (this.state.bookInfo == null){
			return null;
		}
		let indexUrl = "https://resources.ichinesereader.com/books/" + this.state.bookInfo.book.bookCode + "/index.html";
		return (
			<body>
				<div className="topBar">
					<img className="backButton" src={back_btn} onClick={this.onClickBackButton}/>
					<img id="writingButton" src={writing_button} onClick={this.showWritingButton}/>
					<img id="recordingButton" src={recording_button}/>
					<img id="bookSettingsButton" src={settings_button} onClick={this.showSettingsButton}/>
					<img id="bookmarkButton" src={bookmark_button} onClick={this.sendBookmark} />
					<img id="prevPageButton" src={left_arrow} onClick={() => {this.changePage(this.state.currentPage-1);}}/>
					<img id="nextPageButton" src={right_arrow} onClick={() => {this.changePage(this.state.currentPage+1);}}/>
						{this.renderQuizButton()}
						{this.renderPageSelect()}
					<div className="topBarText">{this.state.bookInfo.book.bookTitle}</div>
					
				</div>
				
				<Modal 
					className="standardModal" 
					id="writingModal"
					isOpen={this.state.showWriting} 
					onRequestClose={this.hideWriting} 
				>
				<img src={close_button} className="closeModalButton" onClick={this.hideWriting}/>
				<textarea className="writingArea" rows="12" cols="70" onChange={this.writingAreaChange}>{this.state.writingText}</textarea>
				<br/><button className="orangeButton" onClick={this.writingSubmit}>Submit</button>
				</Modal>
				
				<Modal
					className="standardModal"
					id="bookSettingsModal"
					isOpen={this.state.showSettings}
					onRequestClose={this.hideSettings}
				>
				<img src={close_button} className="closeModalButton" onClick={this.hideSettings}/>
				<h2>Text Settings</h2>
				{this.renderTextOptions()}
				<h2>Audio Settings</h2>
				{this.renderAudioOptions()}
				<h2>Autoplay</h2>
				{this.renderAutoplayButton()}
				<h2>Pinyin</h2>
				{this.renderPinyinButton()}
				</Modal>
				
				<div className="bookHolder">
				{this.renderCurrentPage()}
				</div>
				
			</body>
		);
	};
};