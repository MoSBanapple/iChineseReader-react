import React from "react";
import '../css/common.css';
import '../css/quizController.css';
import {BASE_URL, makeRequest} from './common';
import Modal from 'react-modal';
import cookie from 'react-cookies';
import back_btn from '../images/back-button.png';
import { Link, Redirect } from 'react-router-dom';
import filter_button from '../images/btn_hamburger_menu.png';
import folder_button from '../images/addtomylibrary.png';
import { ProgressBar } from "react-bootstrap";
import audio_button from '../images/audioIcon.png';
import diver_head from '../images/icn_quiz.png';
import green_checkmark from '../images/icn_correctanswer.png';
import red_x from '../images/icn_incorrectanswer.png';

export default class QuizController extends React.Component {
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
			prevPage: cookie.load('prevPage', {doNotParse: true}),
			toPrevPage: false,
			profileInfo: null,
			quizId: this.props.match.params.id,
			quizInfo: null,
			assignmentId: this.props.match.params.assignid,
			assignmentInfo: null,
			headerName: "",
			currentQuestion: 0,
			questionBody: [],
			answers: [null],
			quizResults: null,
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
				this.retrieveQuizInfo();
			});
		}.bind(this)
		let url = BASE_URL + "/usermanager/profile"; 
		request.open("GET", url, asy);
		request.setRequestHeader("AuthToken", auth);
		request.send(null);
	};
	
	retrieveQuizInfo(){
		let auth = this.getUserInfo().authToken;
		var asy = true;
		var request = new XMLHttpRequest();
		request.onload = function () {
			var parsed = JSON.parse(request.responseText);
			if (request.status == 422){
				alert(parsed.message.message);
				this.props.history.goBack();
				return;
			}
			if (request.status != 200){
				alert("Getting quiz error: " + request.responseText);
				this.setState({userInfo: undefined});
				return;
			}
			
			this.setState({
				quizInfo: parsed,
				headerName: parsed.book.bookTitle,
				answers: new Array(parsed.questions.length).fill(null),
			}, function () {
				this.addQuestions();
			});
		}.bind(this)
		let url;
		if (this.state.assignId != undefined){
			url = BASE_URL + "/superadmin/quiz/" + this.state.assignId + "/" + this.state.quizId;
		} else {
			url = BASE_URL + "/superadmin/quiz/" + this.state.quizId;
		}
		request.open("GET", url, asy);
		request.setRequestHeader("AuthToken", auth);
		request.send(null);
	};
	
	addQuestions(){
		let quizbody = this.state.quizInfo.questions.map((thisQuestion, index) => {
			let questionText;
			if (this.state.profileInfo.settings.language == "Traditional"){
				questionText = thisQuestion.trad_question;
			} else {
				questionText = thisQuestion.simp_question;
			}
			let answers = thisQuestion.answers.map((thisAnswer, answerIndex) => {
				var answerText;
				if (this.state.profileInfo.settings.language == "Traditional"){
					answerText = thisAnswer.trad_answer;
				} else {
					answerText = thisAnswer.simp_answer;
				}
				let answerAudioButton = null;
				if (thisAnswer.answer_audio != null && thisAnswer.answer_audio != ""){
					let answerAudio = new Audio(this.state.quizInfo.baseResourceUrl + thisAnswer.answer_audio);
					answerAudioButton = (
						<img className="audioButton" src={audio_button} onClick={()=>{answerAudio.play()}}/>
					);
				}
				let answerImage = null;
				if (thisAnswer.answer_image != null && thisAnswer.answer_image != ""){
					answerImage = (<div><img className="quizImage" src={this.state.quizInfo.baseResourceUrl + thisAnswer.answer_image}/></div>);
				}
				return (<div>
					<input 
					name={"q"+index} 
					type="radio" 
					value={answerText} 
					onClick={this.onSelectAnswer} 
					checked={this.state.answers[index] == answerText}
					/>
					{answerText} &nbsp; {answerAudioButton}<br/>
						{answerImage}
					</div>);
			});
			let questionImage = null;
			if (thisQuestion.question_image != null && thisQuestion.question_image != ""){
				questionImage = (<div><img className="quizImage" src={this.state.quizInfo.baseResourceUrl + thisQuestion.question_image}/></div>);
			}
			let audioButton = null;
			if (thisQuestion.question_audio != null && thisQuestion.question_audio != ""){
				let thisAudio = new Audio(this.state.quizInfo.baseResourceUrl + thisQuestion.question_audio);
				audioButton = (
					<img className="audioButton" src={audio_button} onClick={()=>{thisAudio.play()}}/>
				);
			}
			return (
				<div>
				{questionText} &nbsp; {audioButton}<br/>
				{questionImage}<br/>
				{answers}<br/>
				</div>
			);
		});
		this.setState({questionBody: quizbody,});
	};
	
	onSelectAnswer = (event) => {
		let newAnswers = this.state.answers.slice();
		newAnswers[this.state.currentQuestion] = event.target.value;
		console.log(JSON.stringify(newAnswers));
		this.setState({answers: newAnswers}, () => {
			this.addQuestions();
		});
	};
	
	renderQuestionBody(){
		if (this.state.quizInfo == null){
			return null;
		}
		
		return this.state.quizInfo.questions.map((thisQuestion, index) => {
			if (index == this.state.currentQuestion){
				return (<span className="questionTabSelected">{index+1}</span>);
			} else if (this.state.answers[index]) {
				return (<span className="questionTabAnswered" onClick={() => {this.changeQuestion(index)}}>{index+1}</span>);
			} else {
				return (<span className="questionTab" onClick={() => {this.changeQuestion(index)}}>{index+1}</span>);
			}
		});
	};
	
	changeQuestion(input){
		this.setState({currentQuestion: input,});
	};
	
	isQuizComplete(){
		for (let target of this.state.answers){
			if (target == null){
				return false;
			}
		}
		return true;
	};
	
	submitQuiz = () => {
		let answersToSubmit = {};
		for (let i = 1; i <= this.state.answers.length; i++){
			answersToSubmit[i] = [this.state.answers[i-1]];
		}
		var postBody = JSON.stringify({
			answers: answersToSubmit,
			simple: (this.state.profileInfo.settings.language == "Simplified"),
		});
		
		let auth = this.getUserInfo().authToken;
		var asy = true;
		var request = new XMLHttpRequest();
		request.onload = function () {
			var parsed = JSON.parse(request.responseText);
			if (request.status != 200){
				alert("Getting quiz results error: " + request.responseText);
				this.setState({userInfo: undefined});
				return;
			}
			
			this.setState({
				quizResults: parsed,
			}, function () {
			});
		}.bind(this)
		let url;
		if (this.state.assignId != undefined){
			url = BASE_URL + "/superadmin/quiz/" + this.state.assignId + "/" + this.state.quizId;
		} else {
			url = BASE_URL + "/superadmin/quiz/" + this.state.quizId;
		}
		request.open("POST", url, asy);
		request.setRequestHeader("AuthToken", auth);
		request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		request.send(postBody);
	};
	
	renderQuizResults(){
		let output = [];
		if (this.state.quizResults == null){
			return output;
		}
		output.push(<div className="diverImage" ><img src={diver_head}/></div>);
		let totalCorrect = 0;
		for (let i = 1; i <= this.state.answers.length; i++){
			if (this.state.quizResults.results[i]){
				output.push(<span>Question #{i}: <img src={green_checkmark}/><br/></span>);
				totalCorrect++;
			} else {
				output.push(<span>Question #{i}: <img src={red_x}/><br/></span>);
			}
		}
		output.push(<div>Correct answers: {totalCorrect} out of {this.state.answers.length}</div>);
		if (this.state.quizResults.pass){
			output.push(<div>You passed!</div>);
		} else {
			output.push(<div>You failed.</div>);
		}
		output.push(<div>Points earned: {this.state.quizResults.points}</div>);
		let bookUrl = "/book/" + this.state.quizId;
		if (this.state.assignmentId){
			bookUrl = "/book/" + this.state.assignmentId + "/" + this.state.quizId;
		}
		output.push(
		<div>
			<a href={bookUrl}><button onClick={this.clickRereadBook}>Reread book</button></a>
			<button onClick={this.clickRetakeQuiz}>Retake quiz</button>
		</div>
		);
		return output;
	};
	
	clickRereadBook = () => {
	};
	
	clickRetakeQuiz = () => {
		window.location.reload();
	};
	
	onClickBackButton = () => {
		if (!this.state.prevPage){
			this.props.history.goBack();
		}
		this.setState({toPrevPage: true});
	};
	
	render(){
		if (this.state.userInfo == undefined){
			return <Redirect push to = {{
			pathname:"/",
			}}/>
		}
		if (this.state.toPrevPage){
			return <Redirect push to = {{
			pathname:this.state.prevPage,
			}}/>
		}
		let submitButton = null;
		if (this.isQuizComplete()){
			submitButton = (<button onClick={this.submitQuiz}>Submit</button>);
		}
		let windowBody;
		if (this.state.quizResults == null){
			windowBody = (<div className="quizWindow">
					{this.state.questionBody[this.state.currentQuestion]}
					{this.renderQuestionBody()}<br/>
					<br/>
					{submitButton}
				</div>);
		} else {
			windowBody = (<div className="quizWindow">
			{this.renderQuizResults()}
			</div>
			);
		}
		return(
			<body className="quizBody">
				<div className="topBar">
					<img className="backButton" src={back_btn} onClick={this.onClickBackButton}/>
					<div className="topBarText">{this.state.headerName}</div>
				</div>
				{windowBody}
			</body>
		);
	};
};