    import React from "react";
	import './common.css'
	import './profile.css';
	import Modal from 'react-modal';
	import cookie from 'react-cookies';
	import back_btn from './images/back-button.png';
	import { Link, Redirect } from 'react-router-dom';
	import switch_off from './images/btn_switch_off.png';
	import switch_on from './images/btn_switch_selected.png';
	import {BASE_URL} from './constants';

	export default class Profile extends React.Component {
		constructor(props){
			super(props);
			let info = cookie.load('userInfo', {doNotParse: true});
			if (info == undefined){
				this.state = {
					userInfo: undefined,
				}
				return;
			}
			this.state={
				userInfo: info,
				userName: null,
				sid: null,
				firstName: null,
				lastName: null,
				email: null,
				gender: null,
				birthday: null,
				nickName: null,
				textOption: null,
				audioLang: null,
				pinyin: null,
				dictionary: null,
				totalPoints: null,
				pinyinButton: switch_off,
				dictButton: switch_off,
			}
			this.retrieveProfileInfo();
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
			  console.log(request.responseText);
			  
			  this.setState({
				  profileInfo: parsed,
				  userName: parsed.userName,
				  sid: parsed.accessCode,
				  firstName: parsed.firstName,
				  lastName: parsed.lastName,
				  email: parsed.email,
				  gender: parsed.gender,
				  birthday: parsed.dateOfBirth,
				  nickName: parsed.nickName,
				  textOption: parsed.settings.language,
				  audioLang: parsed.settings.lang,
				  pinyin: parsed.settings.pinyin,
				  dictionary: parsed.settings.dictionary,
				  totalPoints: parsed.pointsCollected,
				  level: parsed.playerLevel.name,
			  });
			  if (this.state.pinyin){
				  this.setState({pinyinButton: switch_on});
			  }
			  if (this.state.dictionary){
				  this.setState({dictButton: switch_on});
			  }
		  }.bind(this)
		  let url = BASE_URL + "/usermanager/profile"; 
		  request.open("GET", url, asy);
		  request.setRequestHeader("AuthToken", auth);
		  request.send(null);
		};
		
		changeText = (input) => {
			this.setState({textOption: input});
		};
		
		nickNameChange = (event) => {
		  this.setState({nickName: event.target.value});
	  };
		
		textOptionChange = (event) =>{
			this.setState({textOption: event.target.value});
		};
		
		audioChange = (event) =>{
			this.setState({audioLang: event.target.value});
		};
		
		pinyinChange = () => {
			if (this.state.pinyin){
				this.setState({pinyin: false, pinyinButton: switch_off,});
			} else {
				this.setState({pinyin: true, pinyinButton: switch_on,});
			}
		};
		
		dictChange = () => {
			if (this.state.dictionary){
				this.setState({dictionary: false, dictButton: switch_off,});
			} else {
				this.setState({dictionary: true, dictButton: switch_on,});
			}
		};
		
		updateClick = () => {
			var request = new XMLHttpRequest();
			var postData = JSON.stringify({
				  nickName: this.state.nickName,
				  settings: {
					  dictionary: this.state.dictionary,
					  lang: this.state.audioLang,
					  language: this.state.textOption,
					  pinyin: this.state.pinyin,
				  },
			  });
			request.onload = function () {
			  if (request.status == 200){
				  alert("Update successful");
				  console.log(request.responseText);
				  this.retrieveProfileInfo();
			  } else {
				  alert("Update failed: error " + request.status.toString())
				  console.log(request.responseText);
			  }
		  }.bind(this)
		  request.open("POST", BASE_URL + "/usermanager/profile", true);
		  request.setRequestHeader("AuthToken", this.getUserInfo().authToken);
		  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		  request.send(postData);
		};
		
		render() {
			
			if (this.state.userInfo == undefined){
				return <Redirect push to = {{
				pathname:"/",
				}}/>
			}
			return (
			<body className="profileReportBody">
				<div className="topBar">
				<a href="/home">
				<img className="backButton" src={back_btn}/>
				</a>
				<div className="topBarText">
				Profile
				</div>
				</div>
				<div className="headName">{this.state.firstName + " " + this.state.lastName + " (" + this.state.nickName + ")"}</div>
				<div className="headPoints">Total Points Earned: {this.state.totalPoints}</div>
				<div className="infoIds">
					User Name<br/>
					Security Identifier<br/>
					First Name<br/>
					Last Name<br/>
					Email<br/>
					Gender<br/>
					Birthday<br/>
					Nick Name<br/>
					Text<br/>
					Audio<br/>
					Pinyin<br/>
					Dictionary<br/>
				</div>
				<div className="infoFields">
					{this.state.userName}<br/>
					{this.state.sid}<br/>
					{this.state.firstName}<br/>
					{this.state.lastName}<br/>
					{this.state.email}<br/>
					{this.state.gender}<br/>
					{this.state.birthday}<br/>
					<input type="text" value={this.state.nickName} onChange={this.nickNameChange}/><br/>
					<input type="radio" name="textRadio" value="Simplified" checked={this.state.textOption == "Simplified"} onChange={this.textOptionChange}/>Simplified
					<input type="radio" name="textRadio" value="Traditional" checked={this.state.textOption == "Traditional"} onChange={this.textOptionChange}/>Traditional
					<input type="radio" name="textRadio" value="No text" checked={this.state.textOption == "No text"} onChange={this.textOptionChange} />No Text<br/>
					<input type="radio" name="audioRadio" value="Mandarin" checked={this.state.audioLang == "Mandarin"} onChange={this.audioChange}/>Mandarin
					<input type="radio" name="audioRadio" value="Cantonese" checked={this.state.audioLang == "Cantonese"} onChange={this.audioChange}/>Cantonese
					<input type="radio" name="audioRadio" value="No_audio" checked={this.state.audioLang == "No_audio"} onChange={this.audioChange} />No Audio<br/>
					<img src={this.state.pinyinButton} onClick = {this.pinyinChange}/><br/>
					<img src={this.state.dictButton} onClick = {this.dictChange}/><br/>
				</div>
				<button className="updateProfileButton" onClick = {this.updateClick}>Update</button>
			</body>
			);
		}
	
	}