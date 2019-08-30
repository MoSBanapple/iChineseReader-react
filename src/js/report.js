import React from "react";
import '../css/common.css'
import '../css/report.css'
import Modal from 'react-modal';
import cookie from 'react-cookies';
import back_btn from '../images/back-button.png';
import { Link, Redirect } from 'react-router-dom';
import switch_off from '../images/btn_switch_off.png';
import switch_on from '../images/btn_switch_selected.png';
import tab_on from '../images/btn_tab_selected.png';
import tab_off from '../images/btn_tab_unselected.png';
import {BASE_URL} from './common';
import LibraryView from './libraryView';

export default class Report extends React.Component{
	constructor(props){
		super(props);
		let info = cookie.load('userInfo', {doNotParse: true});
		cookie.save('prevPage', this.props.location.pathname, { path: '/'});
		if (info == undefined){
			this.state = {
				userInfo: undefined,
			}
			return;
		}
		this.state={
			userInfo: info,
			profileInfo: null,
			firstName: null,
			lastName: null,
			nickName: null,
			totalPoints: null,
			worldRank: null,
			currentTab: "Assignment",
			assignmentTab: tab_on,
			badgeTab: tab_off,
			leaderboardTab: tab_off,
			lastReadTab: tab_off,
			worldBoard: null,
			currentClass: null,
			classBoard: null,
			assignments: null,
			lastRead: null,
		}
		this.retrieveProfileInfo();
		this.retrieveWorldboardInfo();
		this.retrieveLastRead();
		
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
				firstName: parsed.firstName,
				lastName: parsed.lastName,
				nickName: parsed.nickName,
				totalPoints: parsed.pointsCollected,
				worldRank: parsed.worldRank,
				currentClass: parsed.classResps[0],
			}, function () {
				this.retrieveClassboardInfo();
				this.retrieveAssignmentInfo();
			});
		}.bind(this)
		let url = BASE_URL + "/usermanager/profile"; 
		request.open("GET", url, asy);
		request.setRequestHeader("AuthToken", auth);
		request.send(null);
	};
	
	retrieveWorldboardInfo(){
		let auth = this.getUserInfo().authToken;
		var asy = true;
		var request = new XMLHttpRequest();
		request.onload = function () {
			var parsed = JSON.parse(request.responseText);
			if (request.status != 200){
				alert("Worldboard error: " + request.responseText);
				return;
			}
			console.log(request.responseText);
			this.setState({
				worldBoard: parsed,
			});
		}.bind(this)
		let url = BASE_URL + "/superadmin/leaderboard"; 
		request.open("GET", url, asy);
		request.setRequestHeader("AuthToken", auth);
		request.send(null);
	};
	
	retrieveClassboardInfo(){
		let auth = this.getUserInfo().authToken;
		var asy = true;
		var request = new XMLHttpRequest();
		request.onload = function () {
			var parsed = JSON.parse(request.responseText);
			if (request.status != 200){
				alert("Classboard error: " + request.responseText);
				return;
			}
			console.log(request.responseText);
			this.setState({
				classBoard: parsed,
			});
		}.bind(this)
		let url = BASE_URL + "/superadmin/leaderboard/" + this.state.currentClass.classId; 
		request.open("GET", url, asy);
		request.setRequestHeader("AuthToken", auth);
		request.send(null);
	};
	
	retrieveAssignmentInfo(){
		let auth = this.getUserInfo().authToken;
		var asy = true;
		var request = new XMLHttpRequest();
		request.onload = function () {
			
			var parsed = JSON.parse(request.responseText);
			if (request.status != 200){
				alert("Assignment error: " + request.responseText);
				return;
			}
			console.log(request.responseText);
			this.setState({
				assignments: parsed,
			});
		}.bind(this)
		let url = BASE_URL + "/schoolmanager/myassignments/" + this.state.currentClass.classId; 
		request.open("GET", url, asy);
		request.setRequestHeader("AuthToken", auth);
		request.send(null);
	};
	
	retrieveLastRead(){
		let auth = this.getUserInfo().authToken;
		var asy = true;
		var request = new XMLHttpRequest();
		request.onload = function () {
			
			var parsed = JSON.parse(request.responseText);
			if (request.status != 200){
				alert("lastRead error: " + request.responseText);
				return;
			}
			
			this.setState({
				lastRead: parsed,
			});
		}.bind(this)
		let url = BASE_URL + "/superadmin/history"; 
		request.open("GET", url, asy);
		request.setRequestHeader("AuthToken", auth);
		request.send(null);
	};
	
	
	setTab(target){
		this.setState({
			currentTab: target,
			assignmentTab: tab_off,
			leaderboardTab: tab_off,
			badgeTab: tab_off,
			lastReadTab: tab_off,
		});
		if (target == "Assignment"){
			this.setState({assignmentTab: tab_on});
		} else if (target == "Badges"){
			this.setState({badgeTab: tab_on});
		} else if (target == "Leaderboard"){
			this.setState({leaderboardTab: tab_on});
		} else if (target == "Last read"){
			this.setState({lastReadTab: tab_on});
		}
	};
	
	renderBadgeTable(){
		return this.state.profileInfo.myAchievements.map(thisElement => {
			let earnDate = new Date(thisElement.when);
			return(
				<tr>
					<td className = "badgeCell"><img src={thisElement.achievement.image}/></td>
					<td>{thisElement.achievement.name}</td>
					<td>{thisElement.achievement.description}</td>
					<td>{earnDate.toLocaleString()}</td>
				</tr>
			);
		});
	};
	
	renderBoardTable(targetBoard){
		if (targetBoard == null || targetBoard.length == 0){
			return null;
		}
		return targetBoard.map(thisElement => {
			return(
				<tr>
					<td>{thisElement.rank}</td>
					<td>{thisElement.member}</td>
					<td>{thisElement.score}</td>
				</tr>
			);
		});
	};
	
	renderAssignmentTable(isLive){
		if (this.state.assignments == null || this.state.assignments.length == 0){
			return null;
		}
		return this.state.assignments.map(thisElement => {
			let targetAssignment = thisElement.assignment;
			if ((targetAssignment.status == "Live") == isLive){
				let startDate = new Date(targetAssignment.startDate);
				let endDate = new Date(targetAssignment.endDate);
				return(
					<tr>
						<td>{targetAssignment.name}</td>
						<td>{startDate.toLocaleDateString("en-US")}</td>
						<td>{endDate.toLocaleDateString("en-US")}</td>
						<td><span className="progressSpan">{thisElement.overallProgress}%</span> &nbsp; <progress value={thisElement.overallProgress} max={100}/></td>
					</tr>
				);
			}
		});
	};
	
	renderClassDropdownOptions(){
		if (this.state.profileInfo == null){
			return null;
		}
		return this.state.profileInfo.classResps.map((thisElement, index) => {
			if (thisElement.classId == this.state.currentClass.classId){
				return(
					<option selected value={index}>{thisElement.className}</option>
				);
			} else {
				return(
					<option value={index}>{thisElement.className}</option>
				);
			}
		});
	};
	
	onSelectClass = (event) => {
		this.setState({currentClass: this.state.profileInfo.classResps[event.target.value],}, function () {
			this.retrieveClassboardInfo();
			this.retrieveAssignmentInfo();
		});
	};
	
	
	render() {
		if (this.state.userInfo == undefined){
			return <Redirect push to = {{
			pathname:"/",
			}}/>
		}
		var tabContents;
		if (this.state.currentTab == "Assignment"){
			tabContents = (
			<div className="tabContents">
				<select id="assignmentDropdown" onChange={this.onSelectClass}>{this.renderClassDropdownOptions()}</select><br/>
				<p className="tableTitleText">Current Assignments</p>
				<table id="liveAssignmentTable" className="reportTable">
					<tr>
						<th>Assignment</th>
						<th>Start date</th>
						<th>End date</th>
						<th>Progress</th>
					</tr>
					{this.renderAssignmentTable(true)}
				</table>
				<p className="tableTitleText">Previous Assignments</p>
				<table id="liveAssignmentTable" className="reportTable">
					<tr>
						<th>Assignment</th>
						<th>Start date</th>
						<th>End date</th>
						<th>Progress</th>
					</tr>
					{this.renderAssignmentTable(false)}
				</table>
			</div>
			);
		} else if (this.state.currentTab == "Badges"){
			tabContents = (
			<div className="tabContents">
				<table className="reportTable">
					<tr>
						<th>Badge</th>
						<th>Name</th>
						<th>Description</th>
						<th>Date earned</th>
					</tr>
					{this.renderBadgeTable()}
				</table>
			</div>
			);
		} else if (this.state.currentTab == "Leaderboard"){
			tabContents = (
			<div className="tabContents">
				<div className="worldBoardView">
					World<br/>
					<table className="reportTable">
						<tr>
							<th>Rank</th>
							<th>Name</th>
							<th>Total Points</th>
						</tr>
						{this.renderBoardTable(this.state.worldBoard)}
					</table>
				</div>
				<div className="classBoardView">
					Class<br/>
					<select onChange={this.onSelectClass}>{this.renderClassDropdownOptions()}</select><br/>
					<table className="reportTable">
						<tr>
							<th>Rank</th>
							<th>Name</th>
							<th>Total Points</th>
						</tr>
						{this.renderBoardTable(this.state.classBoard)}
					</table>
				</div>
			</div>
			);
		} else if (this.state.currentTab == "Last read"){
			if (this.state.lastRead == null){
				tabContents = null;
			}
			tabContents = (
			<div className="tabContents">
				<LibraryView bookList={this.state.lastRead} noCheck={true}/>
			</div>);
		}
		return (
			<body className="profileReportBody">
				<div className="topBar">
					<a href="/home">
						<img className="backButton" src={back_btn}/>
					</a>
					<div className="topBarText">Report</div>
				</div>
				<div className="headName">{this.state.firstName + " " + this.state.lastName + " (" + this.state.nickName + ")"}</div>
				<div className="headPoints">Total Points Earned: {this.state.totalPoints}</div>
				<div className="headRank">World Rank: {this.state.worldRank}</div>
				
				<div className="tabContainer">
					<div className="reportTab">
					<img src={this.state.assignmentTab} onClick={() => this.setTab("Assignment")}/>
					<div className="tabText">Assignment</div>
					</div>
					<div className="reportTab">
					<img src={this.state.badgeTab} onClick={() => this.setTab("Badges")}/>
					<div className="tabText">Badges</div>
					</div>
					<div className="reportTab">
					<img src={this.state.leaderboardTab} onClick={() => this.setTab("Leaderboard")}/>
					<div className="tabText">Leaderboard</div>
					</div>
					<div className="reportTab">
					<img src={this.state.lastReadTab} onClick={() => this.setTab("Last read")}/>
					<div className="tabText">Last Read</div>
					</div>
					<hr className="tabLine"/>
				</div>

					{tabContents}

			</body>
		);
	};
}