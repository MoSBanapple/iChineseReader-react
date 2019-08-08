import React from "react";
import './common.css';
import './openReading.css';
import LibraryView from './libraryView';
import {BASE_URL, makeRequest} from './common';
import Modal from 'react-modal';
import cookie from 'react-cookies';
import back_btn from './images/back-button.png';
import { Link, Redirect } from 'react-router-dom';
import filter_button from './images/btn_hamburger_menu.png';

export default class OpenReading extends React.Component{
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
			currentPage: 0,
			books: null,
			totalBooks: null,
			filters: {
				proficiencyLevel: [],
				interestLevel: [],
				programType: [],
				query: "",
				seriesId: [],
				textType: [],
				topics: [],
			},
			showFilters: false,
			textType: null,
			series: null,
			topics: [],
			interest: [],
			programTypes: [],
		};
		this.retrievePages(20, 0, "");
		this.retrieveTextTypes();
		this.retrieveSeries();
		this.retrieveTopics();
		this.retrieveInterestLevels();
		this.retrieveProgramTypes();
		this.retrieveTotalBooks();
	};
	
	getUserInfo(){
	    return JSON.parse(this.state.userInfo);
	};
	
	searchFieldChanged = (event) => {
		let tempFilter = new Object(this.state.filters);
		tempFilter.query = event.target.value;
		this.setState({filters: tempFilter,});
	};
	
	searchButtonClicked = () => {
		this.setState({currentPage: 0,});
		this.retrievePages(20, 0);
	};
	
	retrievePages(numBooks, pageNum, inputQuery){
		let auth = this.getUserInfo().authToken;
		var asy = true;
		var request = new XMLHttpRequest();
		var postData = JSON.stringify(this.state.filters);
		request.onload = function () {
			var parsed = JSON.parse(request.responseText);
			if (request.status != 200){
				alert("OpenReading error: " + request.responseText);
				this.setState({userInfo: undefined});
				return;
			}
			console.log(request.responseText);
			this.setState({
				books: parsed,
			});
		}.bind(this)
		let url = BASE_URL + "/superadmin/openreading?limit=" + numBooks + "&page=" + pageNum; 
		request.open("POST", url, asy);
		request.setRequestHeader("AuthToken", auth);
		request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		request.send(postData);
	};
	
	retrieveTotalBooks(){
		let auth = this.getUserInfo().authToken;
		var asy = true;
		var request = new XMLHttpRequest();
		var postData = JSON.stringify(this.state.filters);
		request.onload = function () {
			var parsed = JSON.parse(request.responseText);
			if (request.status != 200){
				alert("OpenReading retrieveTotalBooks error: " + request.responseText);
				this.setState({userInfo: undefined});
				return;
			}
			console.log(request.responseText);
			this.setState({
				totalBooks: parsed.count,
			});
		}.bind(this)
		let url = BASE_URL + "/superadmin/openreadingcount"; 
		request.open("POST", url, asy);
		request.setRequestHeader("AuthToken", auth);
		request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		request.send(postData);
	};
	
	retrieveTextTypes(){
		var request = new XMLHttpRequest();
		request.onload = function () {
			var parsed = JSON.parse(request.responseText);
			if (request.status != 200){
				alert("OpenReading texttypes error: " + request.responseText);
				this.setState({userInfo: undefined});
				return;
			}
			console.log(request.responseText);
			this.setState({
				textType: parsed,
			});
		}.bind(this)
		let url = BASE_URL + "/superadmin/getAllCategoryAndSubCategoryForTextType";
		request.open("GET", url, true);
		request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		request.send(null);
	};
	
	retrieveSeries(){
		var request = new XMLHttpRequest();
		request.onload = function () {
			var parsed = JSON.parse(request.responseText);
			if (request.status != 200){
				alert("OpenReading series error: " + request.responseText);
				this.setState({userInfo: undefined});
				return;
			}
			console.log(request.responseText);
			this.setState({
				series: parsed,
			});
		}.bind(this)
		let url = BASE_URL + "/superadmin/viewAllCategoryForSeries";
		request.open("GET", url, true);
		request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		request.send(null);
	};
	
	retrieveTopics(){
		var request = new XMLHttpRequest();
		request.onload = function () {
			var parsed = JSON.parse(request.responseText);
			if (request.status != 200){
				alert("OpenReading topic error: " + request.responseText);
				this.setState({userInfo: undefined});
				return;
			}
			console.log("Topics: " + request.responseText);
			this.setState({
				topics: parsed,
			});
		}.bind(this)
		let url = BASE_URL + "/superadmin/topic";
		request.open("GET", url, true);
		request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		request.send(null);
	}
	
	retrieveInterestLevels(){
		var request = new XMLHttpRequest();
		request.onload = function () {
			var parsed = JSON.parse(request.responseText);
			if (request.status != 200){
				alert("OpenReading topic error: " + request.responseText);
				this.setState({userInfo: undefined});
				return;
			}
			console.log("Interest: " + request.responseText);
			this.setState({
				interest: parsed,
			});
		}.bind(this)
		let url = BASE_URL + "/superadmin/viewAllInterestLevel";
		request.open("GET", url, true);
		request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		request.send(null);
	};
	
	retrieveProgramTypes(){
		var request = new XMLHttpRequest();
		request.onload = function () {
			var parsed = JSON.parse(request.responseText);
			if (request.status != 200){
				alert("OpenReading topic error: " + request.responseText);
				this.setState({userInfo: undefined});
				return;
			}
			console.log("Interest: " + request.responseText);
			this.setState({
				programTypes: parsed,
			});
		}.bind(this)
		let url = BASE_URL + "/superadmin/viewAllProgramType";
		request.open("GET", url, true);
		request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		request.send(null);
	};
	
	showFilters = () => {
		this.setState({showFilters: true,});
	};
	
	hideFilters = () => {
		this.setState({showFilters: false});
	};
	
	filterChanged = (e) => {
		let field = e.target.value.split(" ")[0];
		let targetVal = e.target.value.substring(e.target.value.indexOf(" ") + 1);
		let newFilter = new Object(this.state.filters);
		let targetArray = [];
		switch (field){
			case "proficiency":
				targetArray = newFilter.proficiencyLevel;
				break;
			case "textType":
				targetArray = newFilter.textType;
				break;
			case "topic":
				targetArray = newFilter.topics;
				break;
			case "series":
				targetArray = newFilter.seriesId;
				break;
			case "interestLevel":
				targetArray = newFilter.interestLevel;
				break;
			case "programType":
				targetArray = newFilter.programType;
				break;
			default:
				alert("Filterchange error");
				break;
		};
		if (e.target.checked){
			targetArray.push(targetVal);
		} else {
			targetArray.splice(targetArray.indexOf(targetVal), 1);
		}
		this.setState({filters: newFilter, currentPage: 0,}, function(){
			this.retrievePages(20, 0);
			this.retrieveTotalBooks();
		});
	};
	
	isChecked(field, targetVal){
		let newFilter = new Object(this.state.filters);
		let targetArray = [];
		switch (field){
			case "proficiency":
				targetArray = newFilter.proficiencyLevel;
				break;
			case "textType":
				targetArray = newFilter.textType;
				break;
			case "topic":
				targetArray = newFilter.topics;
				break;
			case "series":
				targetArray = newFilter.seriesId;
				break;
			case "interestLevel":
				targetArray = newFilter.interestLevel;
				break;
			case "programType":
				targetArray = newFilter.programType;
				break;
			default:
				alert("isChecked error");
				break;
		};
		return (targetArray.indexOf(targetVal) >= 0);
	};
	
	renderCheckboxes(){
		var output = [];
		output.push(<h2>Proficiency</h2>);
		for (let i = 1; i <= 20; i++){
			output.push(
			<span><input type="checkbox" value={"proficiency level"+i} onChange={this.filterChanged} defaultChecked={this.isChecked("proficiency", "level"+i)}/>Level {i} &nbsp; &nbsp;</span>
			);
		}
		

		for (const mainType of this.state.textType){
			output.push(<h2>{mainType.filterName}</h2>);
			for (const subType of mainType.subFilter){
				output.push(
					<span><input type="checkbox" value={"textType "+subType} onChange={this.filterChanged} defaultChecked={this.isChecked("textType", subType)}/>{subType} &nbsp; &nbsp;</span>
				);
			}
		}
		console.log(this.state.topics);
		output.push(<h2>Topics</h2>);
		for (const topic of this.state.topics){
			output.push(
				<span><input type="checkbox" value={"topic "+topic} onChange={this.filterChanged} defaultChecked={this.isChecked("topic", topic)}/>{topic} &nbsp; &nbsp;</span>
			);
		}
		
		output.push(<h2>Series</h2>);
		for (const entry of this.state.series){
			output.push(
				<span><input type="checkbox" value={"series "+entry.id} onChange={this.filterChanged} defaultChecked={this.isChecked("series", entry.id)}/>{entry.mainCategory} &nbsp; &nbsp;</span>
			);
		}
		
		output.push(<h2>Interest Level</h2>);
		for (const entry of this.state.interest){
			output.push(
				<span><input type="checkbox" value={"interestLevel " + entry.displayName} onChange={this.filterChanged} defaultChecked={this.isChecked("interestLevel", entry.displayName)}/>{entry.displayName} &nbsp; &nbsp;</span>
			);
		}
		
		output.push(<h2>Program Type</h2>);
		for (const entry of this.state.programTypes){
			output.push(
				<span><input type="checkbox" value={"programType " + entry.displayName} onChange={this.filterChanged} defaultChecked={this.isChecked("programType", entry.displayName)}/>{entry.displayName} &nbsp; &nbsp;</span>
			);
		}
		
		
		return output;
	};
	
	render() {
		if (this.state.userInfo == undefined){
			return <Redirect push to = {{
			pathname:"/",
			}}/>
		}
		if (this.state.books == null){
			return null;
		}
		return (
			<body className="profileReportBody">
				<div className="topBar">
					<a href="/home">
						<img className="backButton" src={back_btn}/>
					</a>
					<div className="topBarText">Open Reading</div>
				</div>
				<div className="filterBar">
					<img className="filterButton" src={filter_button} onClick={this.showFilters}/>
					<div className="filterHeadText">Filter</div>
					<div className="searchInput">
					<input onChange={this.searchFieldChanged}/>
					<button onClick={this.searchButtonClicked}>Search</button>
					</div>
				</div>
				
				<Modal 
					className="standardModal" 
					isOpen={this.state.showFilters} 
					onRequestClose={this.hideFilters} 
					contentLabel={"ablong"}
				>

				{this.renderCheckboxes()}
				<button onClick={this.hideFilters}>closeThis</button>
				</Modal>
				
				<LibraryView bookList={this.state.books}/>
				<div>Total = {this.state.totalBooks}</div>
			</body>
		);
	};
};