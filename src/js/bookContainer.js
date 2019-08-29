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

function createMarkup(input){
	return {__html: input};
};


function stringToStyle(input){
	let cameled = input.toCamelCase();
	cameled = cameled.replace(/:/g, '":"');
	cameled = cameled.replace(/;/g, '","');
	cameled = cameled.replace(/{/g, '{"');
	cameled = cameled.replace(/,"[\s]*}/g, '}');
	cameled = cameled.replace(/https":"/g, "https:");
	cameled = cameled.replace(/\s/g,'')
	console.log(cameled);
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
		};
		this.retrieveProfileInfo();
		var log = console.log;
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
			
			this.setState({
				bookInfo: parsed,
				finishedBook: parsed.readComplete,
			}, function () {
				this.retrieveContentInfo();
				this.retrieveBookmark();
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
				this.setState({currentPage: parsed.page - 1});
			} else{
				console.log("no bookmark");
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
	
	extractContent(){
		var isChinese = require('is-chinese');
		let parsed = this.state.bookContentRaw.replace(/\.\/assets/g, 
		"https://resources.ichinesereader.com/books/" + this.state.bookInfo.book.bookCode + "/assets");
		parsed = parsed.replace(/\r?\n|\r/g, " ");
		let content = parsed.match(/#content-[0-9]*[\s]*{(.*?)}/g);
		let fontStr = parsed.match(/font-size:[0-9]*px/g)[0];
		let fontSize = parseInt(getBetween(fontStr, ":", "px"));
		console.log("Font size = " + fontSize);
		let pages = [];
		for (let i = 0; i < content.length; i++){
			let contentStyle = content[i].match(/{(.*?)}/)[0];
			//let contentStyle = content[i];
			console.log(contentStyle);
			let textBoxReg = new RegExp("#textbox-" + i + "_[0-9]*[ ]*{(.*?)}", "g");
			let textBoxes = parsed.match(textBoxReg);
			console.log("Textboxes: " + textBoxes);
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
			}
			if (isNaN(fontSize) || !textBoxes){
				pages.push(thisPage);
				continue;
			}
			let endLoop = textBoxes.length;
			for (let j = 1; j <= endLoop; j++){
				console.log(i+", " + j);
				let divReg = new RegExp('<div id="textbox-' + i + '_' + j + '.*?<div id="textbox-' + i + '-' + (j+1), "g");
				let divStr = parsed.match(divReg);
				if (!divStr){
					divReg = new RegExp('<div id="textbox-' + i + '_' + j + '.*?End Text Block', "g");
					divStr = parsed.match(divReg);
				}
				console.log(divStr);
				if (!divStr){
					textBoxes[j-1] = {
						simpSentences: null,
						tradSentences: null,
						//pinyins: [],
					};
					continue;
				}
				divStr = divStr[0];
				
				
				let wordBlocks = divStr.match(/<span id=.*?;<\/span>|<div class='para'><\/div>/g);
				let sentences = [];
				sentences = wordBlocks;
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
				let simpChars = null;
				let tradChars = null;
				if (this.state.bookInfo.book.bookFeatures.simplified && this.state.bookInfo.book.bookFeatures.traditional && sentences){
					simpChars = sentences.slice(0, sentences.length/2);
					tradChars = sentences.slice(sentences.length/2, sentences.length);
					/*
					if (pinyins){
						pinyins = pinyins.slice(0, pinyins.length/2);
					}
					*/
				} else if (this.state.bookInfo.book.bookFeatures.simplified && sentences){
					simpChars = sentences;
				} else if (this.state.bookInfo.book.bookFeatures.traditional && sentences){
					tradChars = sentences;
				}
				textBoxes[j-1] = {
					simpSentences: simpChars,
					tradSentences: tradChars,
					//pinyins: pinyins,
				};
				console.log(textBoxes[j-1]);
			}
			thisPage.textBoxes = textBoxes;
			console.log(thisPage);
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
		} else if (this.state.currentText = "Traditional"){
			contentStyle = stringToStyle(targetPage.tradBoxStyles[0]);
			console.log(contentStyle);
		} else {
			contentStyle = stringToStyle(targetPage.simpBoxStyles[0]);
			console.log(contentStyle);
		}
		if (!isNaN(this.state.bookContentParsed.fontSize)){
			contentStyle.fontSize = this.state.bookContentParsed.fontSize + "px";
		}
		console.log(contentStyle);
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
						console.log(renderedSentence);
						return(
						<span dangerouslySetInnerHTML={{__html: renderedSentence}}/>
						);
					});
				}
				targetStyles[boxIndex].position = "relative";
				targetStyles[boxIndex].textAlign = "left";
				targetStyles[boxIndex].background = "rgba(255,255,255,0.5)";
				targetStyles[boxIndex].borderRadius = "25px";
				return (
				<div style={targetStyles[boxIndex]}>
					{renderedSentences}
				</div>
				);
			});
		}
		console.log(renderedTextBoxes);
		contentStyle.display = "inline-block";
		return (
		<div style={contentStyle}>
			{renderedTextBoxes}
		</div>
		);
		
	};
	
	
	
	testClick = () => {
		this.renderCurrentPage();
		return;
		var check = document.getElementById("currentBook").contentWindow;
		check.console.log = function(val){
			alert(val);
		};
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
		if (input >= 0 && input < this.state.bookContentParsed.numPages){
			if (input == this.state.bookContentParsed.numPages - 1 && !this.state.finishedBook){
				this.finishedReading();
				this.setState({finishedBook: true,});
			}
			this.setState({currentPage: input,});
			
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
		this.setState({currentAudio: event.target.value});
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
	
	render() {
		if (this.state.userInfo == undefined){
			return <Redirect push to = {{
			pathname:"/",
			}}/>
		}
		if (this.state.toPrevPage){
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
					<img id="prevPageButton" src={left_arrow} onClick={() => {this.changePage(this.state.currentPage-1);}}/>
					<img id="nextPageButton" src={right_arrow} onClick={() => {this.changePage(this.state.currentPage+1);}}/>
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
				<h2>Pinyin</h2>
				</Modal>
				
				<div className="bookHolder">
				{this.renderCurrentPage()}
				</div>
				<iframe id="currentBook" className="bookFrame" src={indexUrl}/>
			</body>
		);
	};
};