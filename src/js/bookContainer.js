import React from "react";
import '../css/common.css';
import '../css/bookContainer.css';
import {BASE_URL, makeRequest} from './common';
import Modal from 'react-modal';
import cookie from 'react-cookies';
import { Link, Redirect } from 'react-router-dom';


export default class BookContainer extends React.Component {
	constructor(props){
		super(props);
		
	};
	
	render() {
		alert(this.props.match.params.id);
		alert(cookie.load('classId', {doNotParse: true}));
		return (
			<body>
				<iframe src="https://resources.ichinesereader.com/books/BB0004/content.html" height="1000" width="1000"/>
			</body>
		);
	};
};