    import React from "react";
	import './common.css';
	import './home.css';
	import scoreboard from "./images/icn_landingpage_scoreboard.png";
	import Modal from 'react-modal';
	import cookie from 'react-cookies';
	import { Link, Redirect } from 'react-router-dom';
	import faqImg from "./images/btn_landingpage_faq.png";
	import {BASE_URL, makeRequest} from './common';
	
	Modal.setAppElement('#root');
	
	class MessageDisplay extends React.Component {
		constructor(props) {
			super(props);
			this.state = {
				showMessage: false,
				buttonText: "Show",
				messageText: "",
			}
		};
		
		buttonClicked = () => {
			if (this.state.showMessage){
				this.setState({
					showMessage: false,
					buttonText: "Show",
					messageText: "",
				});
			} else {
				this.setState({
					showMessage: true,
					buttonText: "Hide",
					messageText: this.props.message,
				});
			}
		};
		
		render() {
			return (
			<div>
				<button className="messageDisplayButton" onClick={this.buttonClicked}>
					{this.state.buttonText}
				</button>{this.props.date}
				<p>{this.state.messageText}</p>
				</div>
			);
		}
		
	}

    export default class Home extends React.Component {
      constructor(props) {
        super(props);
		this.state = {
			userInfo: cookie.load('userInfo', {doNotParse: true}),
			profileInfo: null,
			nickName: null,
			points: null,
			booksRead: null,
			level: null,
			messages: [],
			messageDates: [],
			showMessages: false,
		}
		if (this.state.userInfo == undefined){
			return;
		}
		this.retrieveProfileInfo();
		this.retrieveMessagesFromServer();
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
				  alert(request.responseText);
				  this.setState({userInfo: undefined});
				  return;
			  }
			  
			  this.setState({
				  profileInfo: parsed,
				  nickName: parsed.nickName,
				  points: parsed.pointsCollected,
				  booksRead: parsed.numBooks,
				  level: parsed.playerLevel.levelCode,
			  });
		  }.bind(this)
		  let url = BASE_URL + "/usermanager/profile"; 
		  request.open("GET", url, asy);
		  request.setRequestHeader("AuthToken", auth);
		  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		  request.send(null);
	  };
	  
	  retrieveMessagesFromServer(){
		  let auth = this.getUserInfo().authToken;
		  var request = new XMLHttpRequest();
		  request.onload = function () {
			  if (request.status != 200){
				  this.setState({userInfo: undefined});
				  return;
			  }
			  var parsed = JSON.parse(request.responseText);
			  var messageList = [];
			  var dateList = [];
			  for (let i = 0; i < parsed.length; i++){
				  let inserted = false;
				  for (let j = 0; j < dateList.length; j++){
					  if (dateList[j] < parsed[i].when){
						  dateList.splice(j, 0, parsed[i].when);
						  messageList.splice(j, 0, parsed[i].message);
						  inserted = true;
						  break;
					  }
				  }
				  if (!inserted){
					  dateList.push(parsed[i].when);
					  messageList.push(parsed[i].message);
				  }
			  }
			  this.setState({
				  messages: messageList,
				  messageDates: dateList,
			  });
		  }.bind(this)
		  let url = BASE_URL + "/schoolmanager/myclassannouncement"; 
		  request.open("GET", url, true);
		  request.setRequestHeader("AuthToken", auth);
		  request.send(null);
	  };
	  
	  
	  
	  
	  
	  
	  messageClick = () => {
		  console.log(this.state.messages);
		  console.log(this.state.messageDates);
		  this.setState({showMessages: true});
	  };
	  
	  assignmentClick = () => {
		  alert("assignment button clicked");
	  };
	  
	  myLibraryClick = () => {
		  alert("library clicked");
	  };
	  
	  openReadingClick = () => {
		  alert("openreading clicked");
	  };
	  
	  progressReadingClick = () => {
		  alert("progressreading clicked");
	  };
	  
	  startButtonClick = () => {
		  alert("startbutton clicked");
	  };
	  
	  logoutButtonClick = () => {
		  alert("Logging out");
		  let auth = this.getUserInfo().authToken;
		  var asy = true;
		  var request = new XMLHttpRequest();
		  let url = BASE_URL + "/usermanager/logout"; 
		  request.open("DELETE", url, asy);
		  request.setRequestHeader("AuthToken", auth);
		  request.send(null);
		  cookie.remove("userInfo");
		  this.setState({userInfo: undefined});
	  }
	  
	  reportButtonClick = () => {
		  alert("reportbutton clicked");
	  };
	  
	  profileButtonClick = () => {
		  alert("profile clicked");
	  };
	  


	  
	  hideModal = () => {
		  this.setState({showMessages: false});
	  };
	  
 

      render() {

		if (this.state.userInfo == undefined){
			return <Redirect push to = {{
				pathname:"/",
			}}/>
		}
		var messageList = [];
		for (let i = 0; i < this.state.messages.length; i++){
			let announceDate = new Date(this.state.messageDates[i]);
			messageList.push(
				<MessageDisplay message={this.state.messages[i]} date={announceDate.toLocaleString()}/>
				);
		}

        return (
		<body className = "homeBody">
			<div className="topBoard">
				<img id="boardImg" src = {scoreboard} style={{width: "300px"}}/>
				<div id="nameText">Name<br/>{this.state.nickName}</div>
				<div id="currentPointsText">Current Points<br/>{this.state.points}</div>
				<div id="booksReadText">Books Read<br/>{this.state.booksRead}</div>
				<div id="levelText">Level<br/><span id="levelFont">{this.state.level}</span></div>
				<button id="mailButton" onClick = {this.messageClick}></button>
			</div>
			
			<Modal 
				className="standardModal" 
				isOpen={this.state.showMessages} 
				onRequestClose={this.hideModal} 
				contentLabel={"ablong"}
			>
			{messageList}
				<button onClick={this.hideModal}>closeThis</button>
			</Modal>
			
			<div className="assignment" onClick = {this.assignmentClick}/>
			
			<div className="myLibrary" onClick={this.myLibraryClick}/>
			
			<a href="/openreading">
			<div className="openReading"/>
			</a>
			
			<div className="progressReading" onClick={this.progressReadingClick}/>
			
			<a href = "https://ichinesereader.com/game">
			<div className="startButton"/>
			</a>
			
			
			<div className="logoutButton" onClick={this.logoutButtonClick}/>
			
			<a href="/report">
			<div className="reportButton"/>
			</a>
			
			<a href="/profile">
			<div className="profileButton"/>
			</a>
			<div className="faqButton">
				<a href="https://ichinesereader.com//resource/">
					<img id="faqImage" src={faqImg}/>
				</a>
			</div>
			</body>
        );
      }
    }