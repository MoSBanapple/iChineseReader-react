import React from "react";
import Modal from 'react-modal';
import cookie from 'react-cookies';
import {BASE_URL} from './constants';
import './libraryView.css';
import quiz_complete from './images/btn_quiz_complete.png';
import book_read from './images/btn_book_read.png';
import quiz_uncomplete from './images/btn_quiz_uncomplete.png';
import book_unread from './images/off-book.png';
import off_star from './images/off-star.png';
import on_star from './images/on_star.png';
import old_book_unread from './images/old_btn_book_unread.png';
import quiz_disabled from './images/rsz_btn_quiz_disabled.png';

class BookView extends React.Component {
	constructor(props) {
		super(props);
		
	};
	
	render () {
		var icons = [];
		for (let i = 0; i < this.props.icons.length; i++){
			icons.push(<img src={this.props.icons[i]}/>);
		}
		return(
			<div className="bookView">
				<div className="iconCol">
					{icons}
				</div>
				<a href="https://www.google.com">
				<img className = "bookCover" src={this.props.cover} alt = {"Cover of " + this.props.title}/>
				</a>
				<p>{this.props.title}</p>
			</div>
		);
	};
};

export default class LibraryView extends React.Component {
	constructor(props){
		super(props);//Takes in a parsed list of books
	};
	
	render () {
		var views = this.props.bookList.map(thisBook => {
			let icons = [];
			if (thisBook.readComplete){
				icons.push(book_read);
			} else {
				icons.push(book_unread);
			}
			if (thisBook.quizAvailable){
				if (thisBook.maxScore != null && thisBook.maxScore.pass){
					icons.push(quiz_complete);
				} else if (thisBook.readComplete){
					icons.push(quiz_uncomplete);
				} else {
					icons.push(quiz_disabled);
				}
			}
			
			if (thisBook.inFolder){
				icons.push(on_star);
			} else {
				icons.push(off_star);
			}
			return(<BookView cover={thisBook.book.bookImageLink} icons={icons} title={thisBook.book.bookTitle}/>);
		});
		return (
			<div className="libraryView">
				{views}
			</div>
		);
	};
};