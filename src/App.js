import React from 'react'
import { Route, Switch } from 'react-router-dom'
import Login from './login'
import Home from './home'
import Profile from './profile'
import Report from './report'
import OpenReading from './openReading'

export default function App() {
  return (
    <Switch>
      <Route exact path="/" component={Login} />
      <Route path="/home" component={Home} />
	  <Route path="/profile" component={Profile} />
	  <Route path="/report" component={Report} />
	  <Route path="/openreading" component={OpenReading} />
    </Switch>
  )
}