import React from 'react'
import { Route, Switch } from 'react-router-dom'
import Login from './login'
import Home from './home'
import Profile from './profile'
import Report from './report'
import OpenReading from './openReading'
import BookContainer from './bookContainer'
import AssignmentSelection from './assignmentSelection'
import QuizController from './quizController'



export default function App() {
  return (
    <Switch>
      <Route exact path="/" component={Login} />
      <Route path="/home" component={Home} />
	  <Route path="/profile" component={Profile} />
	  <Route path="/report" component={Report} />
	  <Route path="/openreading" component={OpenReading} />
	  <Route path="/progressreading" component={OpenReading} />
	  <Route path="/mylibrary" component={OpenReading} />
	  <Route exact path="/assignment" component={AssignmentSelection} />
	  <Route path="/assignment/:id" component={OpenReading} />
	  <Route exact path="/quiz/:id" component={QuizController}/>
	  <Route exact path="/quiz/:assignid/:id" component={QuizController}/>
	  <Route exact path="/book/:id" component={BookContainer}/>
	  <Route exact path="/book/:assignid/:id" component={BookContainer}/>
    </Switch>
  )
}