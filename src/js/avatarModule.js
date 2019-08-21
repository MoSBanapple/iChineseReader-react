import React from "react";
import '../css/common.css';
import '../css/avatarModule.css';
import {BASE_URL, makeRequest} from './common';
import Modal from 'react-modal';
import cookie from 'react-cookies';
import { Link, Redirect } from 'react-router-dom';

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
		var asy = true;
		var request = new XMLHttpRequest();
		request.onload = function () {
			var parsed = JSON.parse(request.responseText);
			if (request.status != 200){
				alert("Getting avatar error: " + request.responseText);
				return;
			}
			
			this.setState({
				avatarInfo: parsed,
			}, function () {
				
			});
		}.bind(this)
		let url = "https://ichinesereader.com/storage/avatar";
		request.open("GET", url, asy);
		request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		request.setRequestHeader("AuthToken", auth);
		for (let j of ["gzip", "deflate", "br"]){
			request.setRequestHeader("Accepting-Encoding", j);
		}
		request.send(null);
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
			<progress value={this.props.profileInfo.levelPercentage} max={100}/>
		</div>
		</div>
		);
	};
};