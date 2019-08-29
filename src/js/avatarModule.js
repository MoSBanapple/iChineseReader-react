import React from "react";
import '../css/common.css';
import '../css/avatarModule.css';
import {BASE_URL, makeRequest} from './common';
import Modal from 'react-modal';
import cookie from 'react-cookies';
import { Link, Redirect } from 'react-router-dom';
import axios from 'axios';

export default class AvatarModule extends React.Component{
	constructor(props){
		super(props);
		
		this.state = {
			avatarInfo: null,
		};
		
		this.retrieveAvatarInfo();
	};
	
	retrieveAvatarInfo(){
		let auth = this.props.authToken;
		auth = "TkhzMGE0fDE1NjY1MTE4NDk5NzR8W1NUVURFTlRdfDU3MTdkNDk0ZTRiMDZhMjBiMTVkYTMwNC43NDZkOTE4OWY0NjkyM2UwNjAxMThkZTVkMTg2ZDlkYWQ0NWZkMDYzNDY4MTJkNDQ5NjkxNjk2NjViZmZhNmFl";
		var asy = true;
		var request = new XMLHttpRequest();
		request.onload = function () {
			var parsed = JSON.parse(request.responseText);
			if (request.status != 200){
				alert("Getting avatar error: " + request.responseText);
				return;
			}
			console.log(request.responseText);
			this.setState({
				avatarInfo: parsed,
			}, function () {
				
			});
		}.bind(this)
		let url = "https://ichinesereader.com/storage/avatar";
		request.open("GET", url, asy);
		request.setRequestHeader("AuthToken", auth);
		request.setRequestHeader("Access-Control-Allow-Origin", "*");
		request.send(null);
		//axios.get('https://ichinesereader.com/storage/avatar').then(response => console.log(response))
	};
	
	testClick = () => {
		alert(JSON.stringify(this.state.avatarInfo));
	}
	
	
	render(){
		return(
		<div className="avatarModule">
		<div className="avatarHolder">
		</div>
		<div className="avatarText">
			<div className="avatarHeader">{this.props.profileInfo.firstName + " " + this.props.profileInfo.lastName}</div>
			Points: {this.props.profileInfo.points}<br/>
			Level: {this.props.profileInfo.playerLevel.levelCode} &nbsp; &nbsp;
			<progress className="avatarProgress" value={this.props.profileInfo.levelPercentage} max={100}/>
		</div>
		</div>
		);
	};
};