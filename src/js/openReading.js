import React from "react";
import '../css/common.css';
import '../css/openReading.css';
import LibraryView from './libraryView';
import {BASE_URL, makeRequest} from './common';
import Modal from 'react-modal';
import cookie from 'react-cookies';
import back_btn from '../images/back-button.png';
import { Link, Redirect } from 'react-router-dom';
import filter_button from '../images/btn_hamburger_menu.png';
import folder_button from '../images/addtomylibrary.png';
import { ProgressBar } from "react-bootstrap";

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
		let headerName;
		switch(this.props.location.pathname){
			case "/openreading":
				headerName = "Open Reading";
				break;
			case "/progressreading":
				headerName = "Progress Reading";
				break;
			case "/mylibrary":
				headerName="My Library";
				break;
			case "/assignment":
				headerName="Assignment";
				break;
		}
		
		this.state={
			userInfo: info,
			header: headerName,
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
			targetPage: 1,
			selectedBooks: [],
			showFolders: false,
			folders: [],
			selectedFolders: [],
			profileInfo: null,
			currentFolder: 0,
			showCreateFolder: false,
			createFolderName: "",
			showEditFolder: false,
			editFolderName: "",
			assignments: [],
			currentAssignment: 0,
			currentClass: 0,
		};
		this.retrieveProfileInfo();
		this.retrieveTextTypes();
		this.retrieveSeries();
		this.retrieveTopics();
		this.retrieveInterestLevels();
		this.retrieveProgramTypes();
		
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
		this.retrieveBooks(20, 0);
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
			}, function () {
				if (this.props.location.pathname == "/assignment"){
					this.retrieveAssignments();
				} else {
					this.retrieveFolders();
				}
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
		request.onload = function () {
			var parsed = JSON.parse(request.responseText);
			if (request.status != 200){
				alert("Retrieve assignments failed: " + request.responseText);
				this.setState({userInfo: undefined});
				return;
			}
			console.log(request.responseText);
			
			this.setState({
				assignments: parsed,
			}, function () {
				this.retrieveFolders();
			});
		}.bind(this)
		let url = BASE_URL + "/schoolmanager/liveassignments/" + this.state.profileInfo.classResps[this.state.currentClass].classId; 
		request.open("GET", url, asy);
		request.setRequestHeader("AuthToken", auth);
		request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		request.send(null);
	};
	

	
	retrieveBooks(numBooks, pageNum){
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
			if (this.props.location.pathname == "/mylibrary"){
				this.setState({
					books: parsed.books,
				});
			} else if (this.props.location.pathname == "/assignment") {
				this.setState({
					books: parsed.bookProgress,
				});
			} else {
				this.setState({
					books: parsed,
				});
			}
		}.bind(this)
		let currentPath = this.props.location.pathname;
		let url;
		if (currentPath == "/openreading" || currentPath == "/progressreading"){
			url = BASE_URL + "/superadmin" + currentPath + "?limit=" + numBooks + "&page=" + pageNum; 
		} else if (currentPath == "/mylibrary"){
			url = BASE_URL + "/studentmanager/folder/filter/" + this.state.folders[this.state.currentFolder].id;
		} else if (currentPath == "/assignment"){
			if (this.state.assignments.length == 0){
				this.setState({books: []});
				return;
			}
			url = BASE_URL + "/schoolmanager/myassignments/" 
				+ this.state.profileInfo.classResps[this.state.currentClass].classId + "/"
				+ this.state.assignments[this.state.currentAssignment].assignment.id;
		}
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
		let currentPath = this.props.location.pathname;
		let url;
		if (currentPath == "/openreading" || currentPath == "/progressreading"){
			url = BASE_URL + "/superadmin" + currentPath + "count"; 
		} else if (currentPath == "/mylibrary"){
			this.setState({
				totalBooks: this.state.folders[this.state.currentFolder].bookCount,
			});
			return;
		}
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
	
	retrieveFolders(){
		let auth = this.getUserInfo().authToken;
		var asy = true;
		var request = new XMLHttpRequest();
		request.onload = function () {
			var parsed = JSON.parse(request.responseText);
			if (request.status != 200){
				alert("OpenReading retrieveFolders error: " + request.responseText);
				this.setState({userInfo: undefined});
				return;
			}
			console.log(request.responseText);
			this.setState({
				folders: parsed.allFolder,
			}, () => {
				this.retrieveBooks(20, this.state.currentPage);
				this.retrieveTotalBooks();
			});
		}.bind(this)
		let url = BASE_URL + "/studentmanager/folderlist"; 
		request.open("GET", url, asy);
		request.setRequestHeader("AuthToken", auth);
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
			this.retrieveBooks(20, 0);
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
	
	onPageSelect (targetInput) {
		let targetPage = parseInt(targetInput);
		if (Number.isNaN(targetPage) || targetPage > Math.ceil(this.state.totalBooks/20)-1 || targetPage < 0){
			alert("Invalid input");
			return;
		}
		this.setState({currentPage: targetPage,}, function(){
			this.retrieveBooks(20, targetPage);
			this.retrieveTotalBooks();
		});
	};
	
	onPageInputChange = (event) => {
		this.setState({targetPage: event.target.value,});
	};
	
	renderPageSelect(){
		let totalPages = Math.ceil((this.state.totalBooks*1.0)/20.0);
		var output = [];
		if (this.props.location.pathname == '/assignment'){
			return output;
		}
		if (totalPages == 0){
			output.push(<span>No books found!</span>);
			return output;
		}
		if (this.state.currentPage > 0){
			output.push(<span className="unchosenPage" onClick={() => this.onPageSelect(0)}>{"«"} &nbsp; </span>);
			output.push(<span className="unchosenPage" onClick={() => this.onPageSelect(this.state.currentPage-1)}>{"<"} &nbsp; </span>);
		}
		for (let i = this.state.currentPage-2; i <= this.state.currentPage+2; i++){
			if (i < 0 || i >= totalPages){
				continue;
			}
			if (i==this.state.currentPage){
				output.push(<span className="chosenPage" onClick={() => this.onPageSelect(i)}>{i+1} &nbsp; </span>);
			} else {
				output.push(<span className="unchosenPage" onClick={() => this.onPageSelect(i)}>{i+1} &nbsp; </span>);
			}
		}
		if (this.state.currentPage < totalPages-1){
			output.push(<span className="unchosenPage" onClick={() => this.onPageSelect(this.state.currentPage+1)}>{">"} &nbsp; </span>);
			output.push(<span className="unchosenPage" onClick={() => this.onPageSelect(totalPages-1)}>{"»"} &nbsp; </span>);
		}
		output.push(<span>Total: {totalPages} &nbsp; </span>);
		output.push(<input placeholder="Enter page" onChange={this.onPageInputChange}/>);
		output.push(<button onClick={() => this.onPageSelect(this.state.targetPage-1)}>Go!</button>);
		return output;
	};
	
	folderButtonClicked = () => {
		if (this.state.selectedBooks.length == 0){
			alert("No books selected");
			return;
		}
		this.setState({showFolders: true,});
	};
	
	hideFolders = () => {
		this.setState({showFolders: false, selectedFolders: [],});
	};
	
	renderFolders(){
		let output = [];
		for (const folder of this.state.folders){
			output.push(<div>
				<input type="checkbox" value={folder.id} onChange={this.folderChecked}/>{folder.folderName + " (" + folder.bookCount + ")"}
			</div>);
		}
		return(output);
	};
	
	folderChecked = (e) => {
		let newFolders = this.state.selectedFolders.slice();
		if (e.target.checked){
			newFolders.push(e.target.value);
		} else {
			newFolders.splice(newFolders.indexOf(e.target.value), 1);
		}
		this.setState({selectedFolders: newFolders,})
	};
	
	submitToFolders = () => {
		let auth = this.getUserInfo().authToken;
		var asy = true;
		var postData = JSON.stringify({
			bookId: this.state.selectedBooks,
		});
		for (let i = 0; i < this.state.selectedFolders.length; i++){
			let request = new XMLHttpRequest();
			request.onload = function () {
				var parsed = JSON.parse(request.responseText);
				if (request.status != 200){
					alert("Postfolder error: " + request.responseText);
					this.setState({userInfo: undefined});
					return;
				}
				this.retrieveFolders();

			}.bind(this)
			let url = BASE_URL + "/studentmanager/folder/" + this.state.selectedFolders[i] + "/book"; 
			request.open("POST", url, asy);
			request.setRequestHeader("AuthToken", auth);
			request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
			request.send(postData);
		}
		this.hideFolders();
		
		
		
	};
	
	renderProgressInfo(){
		let output = [];
		if (this.props.location.pathname != "/progressreading"){
			return output;
		}
		output.push(
			<div className="progressContainer">
				{this.state.profileInfo.playerLevel.displayName} &nbsp; &nbsp; {this.state.profileInfo.levelPercentage}%
				<ProgressBar now={60}/>
			</div>
		);
		return output;
	};
	
	renderLibraryStuff(){
		let output = [];
		if (this.props.location.pathname != "/mylibrary"){
			return output;
		}
		output.push(
			<div className="myLibraryStuff">
				<span className="folderSelect">
				Folder:
				<select id="folderDropdown" onChange={this.onSelectFolder}>{this.renderFolderOptions()}</select>
				</span>
				<button className="createFolderButton" onClick={this.showCreateFolderWindow}>Create Folder</button>
				<button className="removeFromFolderButton" onClick={this.deleteFromFolder}>Remove from folder</button>
				<button className="editFolderButton" onClick={this.onShowEditFolder}>Edit folder</button>
			</div>
		);
		return output;
	};
	
	renderFolderOptions(){
		let output = [];
		return this.state.folders.map( (targetFolder, index) => {
			if (index == this.state.currentFolder){
				return (<option selected value={index} >{targetFolder.folderName + " (" + targetFolder.bookCount + ")"}</option>);
			} else {
				return (<option value={index}>{targetFolder.folderName + " (" + targetFolder.bookCount + ")"}</option>);
			}
		});
	};
	
	onSelectFolder = (event) => {
		this.setState({
			currentFolder: event.target.value,
		}, () => {
			this.retrieveBooks(20, 0);
			this.retrieveTotalBooks();
		});
	};
	
	deleteFromFolder = () => {
		let auth = this.getUserInfo().authToken;
		let request = new XMLHttpRequest();
		var postData = JSON.stringify({
			bookId: this.state.selectedBooks,
		});
		request.onload = function () {
			var parsed = JSON.parse(request.responseText);
			if (request.status != 200){
				alert("Delete from folder error: " + request.responseText);
				this.setState({userInfo: undefined});
				return;
			}
			this.setState({selectedBooks: [],});
			this.retrieveFolders();

		}.bind(this)
		let url = BASE_URL + "/studentmanager/folder/" + this.state.folders[this.state.currentFolder].id + "/book"; 
		request.open("DELETE", url, true);
		request.setRequestHeader("AuthToken", auth);
		request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		request.send(postData);
	};
	
	hideCreateFolder = () => {
		this.setState({showCreateFolder: false, createFolderName: "",});
	};
	
	showCreateFolderWindow = () =>{
		this.setState({showCreateFolder: true,});
	};
	
	createFolderNameChange = (event) => {
		this.setState({createFolderName: event.target.value});
	};
	
	createFolder = () => {
		let auth = this.getUserInfo().authToken;
		let request = new XMLHttpRequest();
		var postData = JSON.stringify({
			folderName: this.state.createFolderName
		});
		request.onload = function () {
			var parsed = JSON.parse(request.responseText);
			if (request.status != 200){
				alert("Create folder error: " + request.responseText);
				this.setState({userInfo: undefined});
				return;
			}
			this.retrieveFolders();

		}.bind(this)
		let url = BASE_URL + "/studentmanager/folder"; 
		request.open("POST", url, true);
		request.setRequestHeader("AuthToken", auth);
		request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		request.send(postData);
		this.hideCreateFolder();
	};
	
	onShowEditFolder = () => {
		this.setState({
			showEditFolder: true, 
			editFolderName: this.state.folders[this.state.currentFolder].folderName,
		});
	};
	
	hideEditFolder = () => {
		this.setState({showEditFolder: false, editFolderName: ""});
	};
	
	editFolderNameChange = (event) => {
		this.setState({editFolderName: event.target.value});
	};
	
	updateFolderName = () => {
		let auth = this.getUserInfo().authToken;
		let request = new XMLHttpRequest();
		var postData = JSON.stringify({
			folderName: this.state.editFolderName,
			type: "EDIT",
		});
		request.onload = function () {
			var parsed = JSON.parse(request.responseText);
			if (request.status != 200){
				alert("Update folder error: " + request.responseText);
				this.setState({userInfo: undefined});
				return;
			}
			this.retrieveFolders();

		}.bind(this)
		let url = BASE_URL + "/studentmanager/folder/" + this.state.folders[this.state.currentFolder].id; 
		request.open("PUT", url, true);
		request.setRequestHeader("AuthToken", auth);
		request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		request.send(postData);
		this.hideEditFolder();
	};
	
	deleteFolder = () => {
		let auth = this.getUserInfo().authToken;
		let request = new XMLHttpRequest();
		var postData = JSON.stringify({
			folderName: this.state.editFolderName,
			type: "DELETE",
		});
		request.onload = function () {
			var parsed = JSON.parse(request.responseText);
			if (request.status != 200){
				alert("Update folder error: " + request.responseText);
				this.setState({userInfo: undefined});
				return;
			}
			this.setState({currentFolder: 0});
			this.retrieveFolders();

		}.bind(this)
		let url = BASE_URL + "/studentmanager/folder/" + this.state.folders[this.state.currentFolder].id; 
		request.open("DELETE", url, true);
		request.setRequestHeader("AuthToken", auth);
		request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		request.send(postData);
		this.hideEditFolder();
	};
	
	renderAssignmentSelections(){
		let output = [];
		if (this.props.location.pathname != "/assignment" || this.state.profileInfo == undefined){

			return output;
		}

		let classOptions = this.state.profileInfo.classResps.map((targetClass, index) => {
			if (index == this.state.currentClass){
				return (<option selected value={index} >{targetClass.className}</option>);
			} else {
				return (<option value={index}>{targetClass.className}</option>);
			}
		});
		let assignmentOptions = this.state.assignments.map((targetAssign, index) => {
			if (index == this.state.currentAssignment){
				return (<option selected value={index} >{targetAssign.assignment.name + "  " + targetAssign.overallProgress}%</option>);
			} else {
				return (<option value={index}>{targetAssign.assignment.name + "  " + targetAssign.overallProgress}%</option>);
			}
		});
		output.push(
			<div className="assignmentSelection">
				<select onChange={this.onSelectClass}>{classOptions}</select>
				<select onChange={this.onSelectAssignment}>{assignmentOptions}</select>
			</div>
		);
		return output;
	};
	
	onSelectClass = (event) => {
		this.setState({
			currentClass: event.target.value,
			currentAssignment: 0,
		}, () => {
			this.retrieveProfileInfo();
		});
	};
	
	onSelectAssignment = (event) => {
		this.setState({currentAssignment: event.target.value}, () => {
			this.retrieveBooks();
		});
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
					<div className="topBarText">{this.state.header}</div>
				</div>
				<div className="filterBar">
					<img className="filterButton" src={filter_button} onClick={this.showFilters}/>
					<div className="filterHeadText">Filter</div>
					<div className="searchInput">
					<input onChange={this.searchFieldChanged}/>
					<button onClick={this.searchButtonClicked}>Search</button>
					<img className="folderButton" onClick={this.folderButtonClicked} src={folder_button}/>
					</div>
					{this.renderLibraryStuff()}
					{this.renderAssignmentSelections()}
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
				
				<Modal
					className="standardModal"
					isOpen={this.state.showCreateFolder}
					onRequestClose={this.hideCreateFolder}
				>
				Enter folder name: &nbsp;
				<input onChange={this.createFolderNameChange}/>
				<button onClick={this.createFolder}>Create folder</button>
				</Modal>
				
				<Modal
					className="standardModal"
					isOpen={this.state.showEditFolder}
					onRequestClose={this.hideEditFolder}
				>
				Folder name:
				<input value={this.state.editFolderName} onChange={this.editFolderNameChange}/>
				<button onClick={this.updateFolderName}>Update</button>
				<button onClick={this.deleteFolder}>Delete</button>
				<button onClick={this.hideEditFolder}>Cancel</button>
				</Modal>
				
				
				<Modal
					className="standardModal"
					isOpen={this.state.showFolders}
					onRequestClose={this.hideFolders}
					contentLabel={"addToLibrary"}
				>
				{this.renderFolders()}
				<button onClick={this.submitToFolders}>Submit</button>
				<button onClick={this.hideFolders}>Cancel</button>
				
				</Modal>
				{this.renderProgressInfo()}
				<LibraryView bookList={this.state.books} selectedBooks={this.state.selectedBooks}/>
				<div className="pageSelect">{this.renderPageSelect()}</div>
			</body>
		);
	};
};