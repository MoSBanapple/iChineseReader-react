    import React from "react";
	import '../css/common.css';
	import '../css/login.css';
	import { Link, Redirect } from 'react-router-dom';
	import cookie from 'react-cookies';
	import {BASE_URL} from './common';
	import Modal from 'react-modal';
	
	
	function createMarkup() {
		return {__html: '<button className="orangeButton" onClick={this.loginClick}>Hitme</button>'};
	}

    export default class Login extends React.Component {

      constructor(props) {
        super(props);
		this.state={
			user: '', 
			pass: '', 
			loginSuccess: false, 
			userInfo: null,
			testInfo: null,
			showForgotPassword: false,
			recoverOption: "Email",
			recoverUsername: "",
			securityId: "",
			recoverPass: "",
			};
	  };
	  
	  loginClick = () => {
		  var asy = true;
		  var request = new XMLHttpRequest();
		  var postData = JSON.stringify({
				  password: this.state.pass,
				  sessionType: "WEB",
				  userName: this.state.user,
			  });
		  request.onload = function () {
			  console.log(request.responseText);
			  if (request.status == 200){
				  alert("Login successful");
				  cookie.save('userInfo', request.responseText, { path: '/'});
				  this.setState({loginSuccess: true, userInfo: request.responseText});
			  } else {
				  alert("Login failed: error " + request.status.toString())
			  }
		  }.bind(this)
		  request.open("POST", BASE_URL + "/usermanager/login", asy);
		  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		  request.send(postData);
	  };
	  
	  loginChange = (event) => {
		  this.setState({user: event.target.value});
	  };
	  
	  passChange = (event) => {
		  this.setState({pass: event.target.value});
	  };
	  
	  onClickForgotPassword = () => {
		  this.setState({showForgotPassword: true,});
	  };
	  
	  
	  hideForgotPassword = () => {
		  this.setState({showForgotPassword: false,});
	  };
	  
	  recoverOptionChange = (e) => {
		  this.setState({recoverOption: e.target.value});
	  };
	  
	  recoverUserChange = (e) => {
		  this.setState({recoverUsername: e.target.value});
	  };
	  
	  securityIdChange = (e) => {
		  this.setState({securityId: e.target.value});
	  };
	  
	  recoverPassChange = (e) => {
		  this.setState({recoverPass: e.target.value});
	  };
	  
	  renderRecoverModal(){
		  let output = [];
		  if (this.state.recoverOption == "Email"){
			  output.push(
				<div>
				Username: <input type="text" value={this.state.recoverUsername} onChange={this.recoverUserChange}/>
				<button onClick={this.resetPassEmail}>Submit</button>
				</div>
			  );
		  } else {
			  output.push(
				<div>
				Security Identifier: <input type="text" value={this.state.securityId} onChange={this.securityIdChange}/><br/>
				Username: <input type="text" value={this.state.recoverUsername} onChange={this.recoverUserChange}/><br/>
				New Password: <input type="password" onChange={this.recoverPassChange}/><br/>
				<button onClick={this.resetPassSid}>Submit</button>
				</div>
			  );
		  }
		  return output;
	  };
	  
	  resetPassEmail = () => {
		  var asy = true;
		  var request = new XMLHttpRequest();
		  let url = BASE_URL + "/usermanager/resetpassword/email/" + this.state.recoverUsername; 
		  request.open("GET", url, asy);
		  request.send(null);
		  alert("Please check your email");
	  };
	  
	  resetPassSid = () => {
		  var asy = true;
		  var request = new XMLHttpRequest();
		  var postBody = JSON.stringify({
			  accessCode: this.state.securityId,
			  newPassword: this.state.recoverPass,
			  userName: this.state.recoverUsername,
		  });
		  request.onload = function () {
			  var parsed = JSON.parse(request.responseText);
			  if (request.status != 422){
				  alert(parsed.message);
			  } else {
				alert(parsed.message.message);
			  }
		  }.bind(this)
		  let url = BASE_URL + "/usermanager/resetpassword/accesscode";
		  request.open("POST", url, asy);
		  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		  request.send(postBody);
		  
	  };
 

      render() {
		if (this.state.loginSuccess){
			return <Redirect push to = {{
				pathname:"/home",
				userInfo: this.state.userInfo,
			}}/>
		}
        return (
		<body className="loginBody">
			<div className="container">
				<div className="col-1">
			<input className="loginInput" type="text" placeholder="Username" name="uname" onChange = {this.loginChange} required/>
				</div>
				<div className="col-1">
			<input className="loginInput" type="password" placeholder="Password" name="psw" onChange = {this.passChange} required/>
				</div>
			<button className="forgotPass" onClick={this.onClickForgotPassword}>
			Forgot Password
			</button>
			<button className = "loginButton" type="submit" onClick = {this.loginClick}>Login</button>
			<div style={{backgroundImage: "  url(https://resources.ichinesereader.com/books/BB0009/assets/0.jpg)", height: " 50px",}}>ablong</div>
			</div>
			
			<Modal
				className="standardModal"
				isOpen={this.state.showForgotPassword}
				onRequestClose={this.hideForgotPassword}
			>
				<input type="radio" name="recoverRadio" value="Email" checked={this.state.recoverOption=="Email"} onChange={this.recoverOptionChange}/>Email<br/>
				<input type="radio" name="recoverRadio" value="Security Identifier" checked={this.state.recoverOption=="Security Identifier"} onChange={this.recoverOptionChange}/>Security Identifier<br/>
					<br/>{this.renderRecoverModal()}
				<br/><button onClick={this.hideForgotPassword}>Close</button>
			</Modal>
		</body>
        );
      }
    }