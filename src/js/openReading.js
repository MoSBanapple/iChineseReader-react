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
import help_btn from '../images/help-btn.png';
import AvatarModule from './avatarModule';
import close_button from "../images/icn_incorrectanswer.png";

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
		cookie.save('prevPage', this.props.location.pathname, { path: '/'});
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
		if (this.props.location.pathname.split("/")[1] == "assignment"){
			headerName = "Assignment";
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
			assignmentInfo: null,
			assignmentId: this.props.match.params.id,
			classId: cookie.load('classId', {doNotParse: true}),
			showAssignmentInstructions: false,
			selectedTabs: [],
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

			
			this.setState({
				profileInfo: parsed,
			}, function () {

					this.retrieveFolders();

			});
		}.bind(this)
		let url = BASE_URL + "/usermanager/profile"; 
		request.open("GET", url, asy);
		request.setRequestHeader("AuthToken", auth);
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
				//this.setState({userInfo: undefined});
				return;
			}
			if (this.props.location.pathname == "/mylibrary"){
				this.setState({
					books: parsed.books,
				});
			} else if (this.props.location.pathname.split("/")[1] == "assignment") {
				this.setState({
					assignmentInfo: parsed,
					books: parsed.bookProgress,
				});
			} else {
				this.setState({
					books: parsed,
				});
			}
			this.retrieveTotalBooks();
		}.bind(this)
		let currentPath = this.props.location.pathname;
		let url;
		if (currentPath == "/openreading" || currentPath == "/progressreading"){
			url = BASE_URL + "/superadmin" + currentPath + "?limit=" + numBooks + "&page=" + pageNum; 
		} else if (currentPath == "/mylibrary"){
			url = BASE_URL + "/studentmanager/folder/filter/" + this.state.folders[this.state.currentFolder].id;
		} else if (this.state.assignmentId != undefined) {
			url = BASE_URL + "/schoolmanager/myassignments/" 
				+ this.state.classId + "/"
				+ this.state.assignmentId;
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
				//this.setState({userInfo: undefined});
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
		} else if (this.state.assignmentId != undefined){
			this.setState({
				totalBooks: this.state.assignmentInfo.assignment.numBooks,
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
				//this.setState({userInfo: undefined});
				return;
			}

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
				//this.setState({userInfo: undefined});
				return;
			}
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
				//this.setState({userInfo: undefined});
				return;
			}

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
				//this.setState({userInfo: undefined});
				return;
			}
			this.setState({
				folders: parsed.allFolder,
			}, () => {
				this.retrieveBooks(20, this.state.currentPage);
				
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
		if (targetArray.includes(targetVal) && !e.target.checked){
			targetArray.splice(targetArray.indexOf(targetVal), 1);
		} else if (!targetArray.includes(targetVal) && e.target.checked) {
			targetArray.push(targetVal);
		} else {
			return;
		}
		console.log(newFilter);
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
		return (targetArray.includes(targetVal));
	};
	
	onFilterTabClicked(input){
		let newSelected = this.state.selectedTabs.slice();
		if (this.state.selectedTabs.includes(input)){
			newSelected.splice(newSelected.indexOf(input, 1));
		} else {
			newSelected.push(input);
		}
		this.setState({selectedTabs: newSelected,});
	};
	
	renderCheckboxes(){

		var output = [];
		output.push(<h2 className="filterTab" onClick={() => {this.onFilterTabClicked("Proficiency")}}>Proficiency</h2>);
		if (this.state.selectedTabs.includes("Proficiency")){
			for (let i = 1; i <= 20; i++){
				output.push(
				<span><input type="checkbox" value={"proficiency level"+i} onChange={this.filterChanged} defaultChecked={this.isChecked("proficiency", "level"+i)}/>Level {i} &nbsp; &nbsp;</span>
				);
			}
		}
		

		for (const mainType of this.state.textType){
			output.push(<h2 className="filterTab" onClick={() => {this.onFilterTabClicked(mainType.filterName)}}>{mainType.filterName}</h2>);
			if (this.state.selectedTabs.includes(mainType.filterName)){
				for (const subType of mainType.subFilter){
					output.push(
						<span><input type="checkbox" value={"textType "+subType} onChange={this.filterChanged} defaultChecked={this.isChecked("textType", subType)}/>{subType} &nbsp; &nbsp;</span>
					);
				}
			}
		}
		output.push(<h2 className="filterTab" onClick={() => {this.onFilterTabClicked("Topics")}}>Topics</h2>);
		if (this.state.selectedTabs.includes("Topics")){
			for (const topic of this.state.topics){
				output.push(
					<span><input type="checkbox" value={"topic "+topic} onChange={this.filterChanged} defaultChecked={this.isChecked("topic", topic)}/>{topic} &nbsp; &nbsp;</span>
				);
			}
		}
		
		output.push(<h2 className="filterTab" onClick={() => {this.onFilterTabClicked("Series")}}>Series</h2>);
		if (this.state.selectedTabs.includes("Series")){
			for (const entry of this.state.series){
				output.push(
					<span><input type="checkbox" value={"series "+entry.id} onChange={this.filterChanged} defaultChecked={this.isChecked("series", entry.id)}/>{entry.mainCategory} &nbsp; &nbsp;</span>
				);
			}
		}
		
		output.push(<h2 className="filterTab" onClick={() => {this.onFilterTabClicked("Interest Level")}}>Interest Level</h2>);
		if (this.state.selectedTabs.includes("Interest Level")){
			for (const entry of this.state.interest){
				output.push(
					<span><input type="checkbox" value={"interestLevel " + entry.displayName} onChange={this.filterChanged} defaultChecked={this.isChecked("interestLevel", entry.displayName)}/>{entry.displayName} &nbsp; &nbsp;</span>
				);
			}
		}
		
		output.push(<h2 className="filterTab" onClick={() => {this.onFilterTabClicked("Program Type")}}>Program Type</h2>);
		if (this.state.selectedTabs.includes("Program Type")){
			for (const entry of this.state.programTypes){
				output.push(
					<span><input type="checkbox" value={"programType " + entry.displayName} onChange={this.filterChanged} defaultChecked={this.isChecked("programType", entry.displayName)}/>{entry.displayName} &nbsp; &nbsp;</span>
				);
			}
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
		if (this.props.location.pathname.split("/")[1] == "assignment" || this.props.location.pathname == "/mylibrary"){
			return output;
		}
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
		let start = this.state.currentPage-2;
		if (start < 0){
			start = 0;
		}
		let end = this.state.currentPage+2;
		if (end >= totalPages){
			end = totalPages-1;
			start = end - 4;
		}
		for (let i = start; i <= end || i < start+5; i++){
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
		output.push(<span>&nbsp; Total: {totalPages} &nbsp; </span>);
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
				{this.state.profileInfo.playerLevel.displayName} &nbsp; &nbsp; 
				<progress className="assignmentProgress" value={this.state.profileInfo.levelPercentage} max={100}/> &nbsp;
				{this.state.profileInfo.levelPercentage}%
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
				<button id="createFolderButton" className="orangeButton" onClick={this.showCreateFolderWindow}>Create Folder</button>
				<button id="removeFromFolderButton" className="orangeButton" onClick={this.deleteFromFolder}>Remove from folder</button>
				<button id="editFolderButton" className="orangeButton" onClick={this.onShowEditFolder}>Edit folder</button>
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
	
	getBackLink() {
		if (this.props.location.pathname.split("/")[1] == "assignment"){
			return "/assignment";
		} else {
			return "/home";
		}
	};
	
	showAssignmentInstructionWindow = () => {
		this.setState({showAssignmentInstructions: true,});
	};
	
	hideAssignmentInstructions = () => {
		this.setState({showAssignmentInstructions: false,});
	};
	
	renderAssignmentInfo(){
		let output = [];
		if (this.props.location.pathname.split("/")[1] != "assignment"){
			return output;
		}
		let dueDate = new Date(this.state.assignmentInfo.assignment.endDate);
		output.push(
			<div className="progressContainer">
				{this.state.assignmentInfo.assignment.name} &nbsp;
				<img className="assignmentInfoButton" onClick={this.showAssignmentInstructionWindow} src={help_btn}/>
				<br/>
				Due by {dueDate.toLocaleDateString("en-US")} &nbsp; &nbsp;
					<progress className="assignmentProgress" value={this.state.assignmentInfo.overallProgress} max={100}/> &nbsp;
					{this.state.assignmentInfo.overallProgress}% &nbsp; &nbsp;
					Required books: {this.state.assignmentInfo.assignment.noOfBookToBeRead}
				<Modal 
					className="standardModal" 
					isOpen={this.state.showAssignmentInstructions} 
					onRequestClose={this.hideAssignmentInstructions}
					shouldCloseOnOverlayClick={true}
					contentLabel={"ablong"}
				>
				<div className="topBar">
				<span className="topBarText">{this.state.assignmentInfo.assignment.name}</span>
				<img src={close_button} className="closeModalButton" onClick={this.hideAssignmentInstructions}/>
				</div>
				{this.state.assignmentInfo.assignment.instruction}<br/>
				</Modal>
			</div>
		);
		return output;
	};
	
	onSelectAll = (e) => {
		let selected = [];
		if (e.target.checked){
			selected = this.state.books.map(thisBook => {
				return thisBook.book.bookId;
			});
		}
		this.setState({
			selectedBooks: selected,
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
			<body className="openReadingBody">
				<div className="topBar">
					<a href={this.getBackLink()}>
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
					<span className="selectAll">
						<input type="checkbox" onChange={this.onSelectAll}/>Select all
					</span>
					<img className="folderButton" onClick={this.folderButtonClicked} src={folder_button}/>
					</div>
					{this.renderLibraryStuff()}
					<AvatarModule authToken={this.getUserInfo().authToken} profileInfo = {this.state.profileInfo}/>
				</div>
				
				
				<Modal 
					className="standardModal" 
					isOpen={this.state.showFilters} 
					onRequestClose={this.hideFilters} 
					contentLabel={"ablong"}
				>
				<div className="topBar">
				<span className="topBarText">Filters</span>
				<img src={close_button} className="closeModalButton" onClick={this.hideFilters}/>
				</div>
				{this.renderCheckboxes()}
				
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
				{this.renderAssignmentInfo()}
				<LibraryView 
				bookList={this.state.books} 
				selectedBooks={this.state.selectedBooks} 
				assignment={this.state.assignmentId}
				/>
				<div className="pageSelect">{this.renderPageSelect()}</div>
			</body>
		);
	};
};