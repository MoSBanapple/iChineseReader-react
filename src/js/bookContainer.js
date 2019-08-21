import React from "react";
import '../css/common.css';
import '../css/bookContainer.css';
import {BASE_URL, makeRequest} from './common';
import Modal from 'react-modal';
import cookie from 'react-cookies';
import { Link, Redirect } from 'react-router-dom';
import back_btn from '../images/back-button.png';



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
			profileInfo: null,
			bookId: this.props.match.params.id,
			bookInfo: null,
			assignmentId: this.props.match.params.assignid,
			assignmentInfo: null,
		};
		this.retrieveProfileInfo();
		var log = console.log;
		this.sendStartSession();
		
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
			}, function () {
				
			});
		}.bind(this)
		let url = BASE_URL + "/superadmin/book/" + this.state.bookId;
		
		request.open("GET", url, asy);
		request.setRequestHeader("AuthToken", auth);
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
	
	testClick = () => {
		var check = document.getElementById("currentBook").contentWindow;
		console.log(JSON.stringify(check));
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
			alert(request.responseText);
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
	
	render() {
		if (this.state.userInfo == undefined){
			return <Redirect push to = {{
			pathname:"/",
			}}/>
		}
		if (this.state.bookInfo == null){
			return null;
		}
		let indexUrl = "https://resources.ichinesereader.com/books/" + this.state.bookInfo.book.bookCode + "/index.html";
		return (
			<body>
				<div className="topBar">
					<img className="backButton" src={back_btn} onClick={this.props.history.goBack}/>
					<div className="topBarText">{this.state.bookInfo.book.bookTitle}</div>
					<button onClick={this.testClick}>ablong</button>
					<button onClick={this.finishedReading}>finished</button>
				</div>
				<iframe id="currentBook" className="bookFrame" src={indexUrl}/>
			</body>
		);
	};
};