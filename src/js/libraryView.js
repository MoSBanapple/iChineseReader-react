import React from "react";
import Modal from 'react-modal';
import cookie from 'react-cookies';
import {BASE_URL} from './common';
import '../css/libraryView.css';
import quiz_complete from '../images/btn_quiz_complete.png';
import book_read from '../images/btn_book_read.png';
import quiz_uncomplete from '../images/btn_quiz_uncomplete.png';
import book_unread from '../images/off-book.png';
import off_star from '../images/off-star.png';
import on_star from '../images/on_star.png';
import old_book_unread from '../images/old_btn_book_unread.png';
import quiz_disabled from '../images/rsz_btn_quiz_disabled.png';
import new_banner from '../images/newarrival.png';
import cover_missing from '../images/cover_missing.png';

class BookView extends React.Component {
	constructor(props) {
		super(props);
		
	};
	
	onSelectBook = (e) => {
		if (!this.props.selectedBooks.includes(this.props.bookId)){
			this.props.selectedBooks.push(e.target.value);
		} else {
			this.props.selectedBooks.splice(this.props.selectedBooks.indexOf(e.target.value), 1);
		}
		this.setState({});
	};
	
	render () {
		let check = null;
		if (!this.props.noCheck){
			check = (<input type="checkbox" value={this.props.bookId} onClick={this.onSelectBook} checked={this.props.selectedBooks.includes(this.props.bookId)}/>);
		}
		let newArrival = null;
		if (this.props.bookInfo.book.newArival){
			newArrival = (<img className="newBanner" src={new_banner}/>);
		}
		let bookCover = this.props.cover;
		return(
			<div className="bookView">
				<div className="iconCol">
					{this.props.icons}
					{check}
				</div>
				<a href={this.props.contentLink}>
				<div className="bookCover">
				
				<img className="bookImage" src={this.props.cover} alt = {"Cover of " + this.props.title} 
				onError={(e)=>{ if (e.target.src !== cover_missing){
                    e.target.onError = null;
                     e.target.src=cover_missing;}
                }
           }/>
		   {newArrival}
				</div>
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
	
	clickQuizUnavailable = () => {
		alert("Please complete book before attempting quiz");
	};
	
	render () {
		var views = this.props.bookList.map(thisBook => {
			let quizLink = "/quiz/" + thisBook.book.bookId;
			let contentUrl = "/book/" + thisBook.book.bookId;
			if (this.props.assignment != undefined){
				quizLink = "/quiz/" + this.props.assignment + "/" + thisBook.book.bookId;
				contentUrl = "/book/" + this.props.assignment + "/" + thisBook.book.bookId;
			}
			let icons = [];
			icons.push(<div>Level<br/>{thisBook.book.level.levelCode}</div>);
			if (thisBook.readComplete){
				icons.push(<img src={book_read}/>);
			} else {
				icons.push(<img src={book_unread}/>);
			}
			if (thisBook.quizAvailable){
				if (thisBook.maxScore != null && thisBook.maxScore.pass){
					icons.push(<a href={quizLink}><img src={quiz_complete}/></a>);
				} else if (thisBook.readComplete){
					icons.push(<a href={quizLink}><img src={quiz_uncomplete}/></a>);
				} else {
					icons.push(<img src={quiz_disabled} onClick={this.clickQuizUnavailable}/>);
				}
			}
			
			if (thisBook.inFolder){
				icons.push(<img src={on_star}/>);
			} else {
				icons.push(<img src={off_star}/>);
			}
			
			return(<BookView cover={thisBook.book.bookImageLink} 
				icons={icons} 
				title={thisBook.book.bookTitle} 
				bookId={thisBook.book.bookId} 
				selectedBooks={this.props.selectedBooks}
				contentLink={contentUrl}
				noCheck={this.props.noCheck}
				bookInfo={thisBook}
			/>);
		});
		return (
			<div className="libraryView">
				{views}
			</div>
		);
	};
};