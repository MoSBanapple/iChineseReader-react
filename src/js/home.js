    import React from "react";
	import '../css/common.css';
	import '../css/home.css';
	import scoreboard from "../images/icn_landingpage_scoreboard.png";
	import Modal from 'react-modal';
	import cookie from 'react-cookies';
	import { Link, Redirect } from 'react-router-dom';
	import faqImg from "../images/btn_landingpage_faq.png";
	import {BASE_URL, makeRequest} from './common';
	import diver_points from "../images/minigame_l2_divercoin_forweb_web.png";
	import close_button from "../images/icn_incorrectanswer.png";
	
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
			let pointsDisplay = null;
			if (this.props.points > 0 && this.state.showMessage){
				pointsDisplay = (
				<div>
				<img className="diverImage" src={diver_points}/><br/>
					{this.props.points} points earned<br/>
					</div>
				);
			}
			return (
			<div >
				<button className="orangeButton" onClick={this.buttonClicked}>
					{this.state.buttonText}
				</button> &nbsp; {this.props.date}
				<div>
				<p >{this.state.messageText}</p>
					{pointsDisplay}
					</div>
				</div>
			);
		}
		
	}

    export default class Home extends React.Component {
      constructor(props) {
		  super(props);
        let info = cookie.load('userInfo', {doNotParse: true});
		if (info == undefined){
			let newAuth = cookie.load('nanhaiIndividualSession', {doNotParse: true});
			if (newAuth){
				info = {
					authToken: newAuth,
				};
			}
		}
		cookie.save('prevPage', this.props.location.pathname, { path: '/'});
		if (info == undefined){
			this.state = {
				userInfo: undefined,
			}
			return;
		}
		this.state = {
			userInfo: info,
			profileInfo: null,
			nickName: null,
			points: null,
			booksRead: null,
			level: null,
			messages: [],
			messageDates: [],
			messagePoints: [],
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
				  alert(parsed.message[0].message);
				  this.setState({userInfo: undefined});
				  return;
			  }
			  
			  this.setState({
				  profileInfo: parsed,
				  nickName: parsed.nickName,
				  points: parsed.pointsCollected,
				  booksRead: parsed.numBooks,
				  level: 2,
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
			  var pointsList = [];
			  for (let i = 0; i < parsed.length; i++){
				  let inserted = false;
				  for (let j = 0; j < dateList.length; j++){
					  if (dateList[j] < parsed[i].when){
						  dateList.splice(j, 0, parsed[i].when);
						  messageList.splice(j, 0, parsed[i].message);
						  pointsList.splice(j, 0, parsed[i].point);
						  inserted = true;
						  break;
					  }
				  }
				  if (!inserted){
					  dateList.push(parsed[i].when);
					  messageList.push(parsed[i].message);
					  pointsList.push(parsed[i].point);
				  }
			  }
			  this.setState({
				  messages: messageList,
				  messageDates: dateList,
				  messagePoints: pointsList,
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
				<MessageDisplay message={this.state.messages[i]} points={this.state.messagePoints[i]} date={announceDate.toLocaleString()}/>
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
				id="messageModal"
				isOpen={this.state.showMessages} 
				onRequestClose={this.hideModal} 
				contentLabel={"ablong"}
			>
			<div className="topBar">
			<span className="topBarText">Announcements</span>
			<img src={close_button} className="closeModalButton" onClick={this.hideModal}/>
			</div>
			{messageList}
			</Modal>
			
			<a href="/assignment">
			<div className="assignment"/>
			</a>
			
			<a href="/mylibrary">
			<div className="myLibrary"/>
			</a>
			
			<a href="/openreading">
			<div className="openReading"/>
			</a>
			
			<a href="/progressreading">
			<div className="progressReading"/>
			</a>
			
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
				<a href="http://cms.ichinesereader.com/resource/">
					<img id="faqImage" src={faqImg}/>
				</a>
			</div>
			</body>
        );
      }
    }