import React from "react";
import '../css/common.css';
import '../css/assignmentSelection.css';
import {BASE_URL, makeRequest} from './common';
import Modal from 'react-modal';
import cookie from 'react-cookies';
import back_btn from '../images/back-button.png';
import { Link, Redirect } from 'react-router-dom';
import filter_button from '../images/btn_hamburger_menu.png';
import folder_button from '../images/addtomylibrary.png';
import { ProgressBar } from "react-bootstrap";
import assignment_incomplete from '../images/assignment_folder.png';
import assignment_complete from '../images/completedAssignmentFolder.png';
import AvatarModule from './avatarModule';

export default class AssignmentSelection extends React.Component{
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
			currentClass: 0,
			assignments: [],
			searchText: "",
			chosenAssignment: null,
		};
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
				alert("Getting profile error: " + request.responseText);
				this.setState({userInfo: undefined});
				return;
			}
			
			this.setState({
				profileInfo: parsed,
			}, function () {
				this.retrieveAssignments();
			});
		}.bind(this)
		let url = BASE_URL + "/usermanager/profile"; 
		request.open("GET", url, asy);
		request.setRequestHeader("AuthToken", auth);
		request.send(null);
	};
	
	retrieveAssignments(){
		let auth = this.getUserInfo().authToken;
		var asy = true;
		var request = new XMLHttpRequest();
		var postData = JSON.stringify({
			query: this.state.searchText,
		});
		request.onload = function () {
			var parsed = JSON.parse(request.responseText);
			if (request.status != 200){
				alert("Getting assignments error: " + request.responseText);
				this.setState({userInfo: undefined});
				return;
			}
			this.setState({
				assignments: parsed,
			}, function () {
			});
		}.bind(this)
		let url = BASE_URL + "/schoolmanager/liveassignments/filter/" + this.state.profileInfo.classResps[this.state.currentClass].classId;
		request.open("POST", url, asy);
		request.setRequestHeader("AuthToken", auth);
		request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		request.send(postData);
	};
	
	searchFieldChanged = (event) => {
		this.setState({searchText: event.target.value});
	};
	
	searchButtonClicked = () => {
		this.retrieveAssignments();
	};
	
	renderClassDropDown(){
		let output = [];
		if (this.state.profileInfo == null){
			return output;
		}
		let classOptions = this.state.profileInfo.classResps.map((targetClass, index) => {
			if (index == this.state.currentClass){
				return (<option selected value={index} >{targetClass.className}</option>);
			} else {
				return (<option value={index}>{targetClass.className}</option>);
			}
		});
		output.push(<select className="classSelect" onChange={this.onSelectClass}>{classOptions}</select>);
		return output;
	};
	
	onSelectClass = (event) => {
		this.setState({currentClass: event.target.value}, () => {this.retrieveAssignments();});
	};
	
	getFolderImage(input){
		if (input){
			return assignment_complete;
		} else {
			return assignment_incomplete;
		}
	};
	
	renderAssignments(){
		let output = [];
		let assignmentIcons = this.state.assignments.map((targetAssignment, index) => {
			let dueDate = new Date(targetAssignment.assignment.endDate);
			return(
			<div className="assignmentContainer" value={index} onClick={() => {this.assignmentClick(index)}}>
				<img src={this.getFolderImage(targetAssignment.overallProgress==100)}/>
				<span className="percentText">{targetAssignment.overallProgress}%</span>
				<div className="infoText">{targetAssignment.assignment.name}<br/>Due by {dueDate.toLocaleString()}</div>
			</div>
			);
		});
		if (assignmentIcons.length > 0){
			output.push(
				<div className="assignmentView">{assignmentIcons}</div>
			);
		} else {
			output.push(
				<div className="assignmentView">No assignments found</div>
			);
		}
		return output;
	};
	
	assignmentClick(input){
		cookie.save('classId', this.state.profileInfo.classResps[this.state.currentClass].classId, { path: '/'});
		this.setState({
			chosenAssignment: this.state.assignments[input],
		});
	};
	
	render(){
		if (this.state.userInfo == undefined){
			return <Redirect push to = {{
			pathname:"/",
			}}/>
		}
		if (this.state.chosenAssignment != null){
			return <Redirect push to = {{
			pathname:"/assignment/" + this.state.chosenAssignment.assignment.id,
			classId: this.state.profileInfo.classResps[this.state.currentClass].classId,
			}}/>
		}
		if(this.state.profileInfo == null){
			return null;
		}
		return(
			<body className="profileReportBody">
				<div className="topBar">
					<a  href="/home">
						<img className="backButton" src={back_btn}/>
					</a>
					<div className="topBarText">Assignment</div>
				</div>
				<div className="filterBar">
					{this.renderClassDropDown()}
					<div className="searchInput">
					<input onChange={this.searchFieldChanged}/>
					<button onClick={this.searchButtonClicked}>Search</button>
					</div>
					<AvatarModule authToken={this.getUserInfo().authToken} profileInfo = {this.state.profileInfo}/>
				</div>
				{this.renderAssignments()}
			</body>
		);
	};
	
};