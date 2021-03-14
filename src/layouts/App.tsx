import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import LogIn from '../pages/Login'
import SignIn from '../pages/SignUp'

const App = () => {
  return (
    <Switch>
      <Redirect exact path='/' to='/login' />
      <Route path='/login' component={LogIn} />
      <Route path='/signup' component={SignIn} />
    </Switch>
  )
}

export default App
