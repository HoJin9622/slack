import React from 'react'
import loadable from '@loadable/component'
import { Switch, Route, Redirect } from 'react-router-dom'

const LogIn = loadable(() => import('../../pages/Login'))
const SignUp = loadable(() => import('../../pages/SignUp'))
const Workspace = loadable(() => import('../Workspace'))

const App = () => {
  return (
    <Switch>
      <Redirect exact path='/' to='/signup' />
      <Route path='/login' component={LogIn} />
      <Route path='/signup' component={SignUp} />
      <Route path='/workspace/:workspace' component={Workspace} />
    </Switch>
  )
}

export default App
