    import React from "react";
	import './login.css';
	import { Link, Redirect } from 'react-router-dom'
	import cookie from 'react-cookies';
	import {BASE_URL} from './common';
	import LibraryView from './libraryView'

    export default class Login extends React.Component {

      constructor(props) {
        super(props);
		this.state={user: '', pass: '', loginSuccess: false, userInfo: null,};
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
			<a className="forgotPass" href="https://www.google.com">
			<a href="https://www.google.com/">Forgot Password</a>
			</a>
			<button className = "loginButton" type="submit" onClick = {this.loginClick}>Login</button>

			</div>
			</body>
        );
      }
    }