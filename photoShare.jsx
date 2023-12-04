import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Route, Switch, Redirect } from 'react-router-dom';
import { Grid, Typography, Paper } from '@material-ui/core';
import './styles/main.css';
import axios from 'axios';

// import necessary components
import TopBar from './components/topBar/TopBar';
import UserDetail from './components/userDetail/userDetail';
import UserList from './components/userList/userList';
import UserPhotos from './components/userPhotos/userPhotos';
import LoginRegister from './components/loginRegister/LoginRegister';
import Favorites from './components/favorite/Favorites';
import Activities from './components/activities/activities';
class PhotoShare extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      view: 'Home Page',
      userIsLoggedIn: false,

      user: {},
      users: []
    };
    this.changeTopView = this.changeTopView.bind(this);
    this.changeLogIn = this.changeLogIn.bind(this);
    this.changeUser = this.changeUser.bind(this);
    this.getUserList = this.getUserList.bind(this);
  }
  componentDidMount() {
    this.getUserList();
  }
  getUserList() {
    if (this.state.userIsLoggedIn) {
      axios.get('/user/list').then(
        users => {
          this.setState({ users: users.data, userIsLoggedIn: true });
        },
        err => {
          this.setState({ userIsLoggedIn: false });
          console.error('fetchModel error: ', err);
        }
      );
    }
  }

  //name is optional
  changeTopView = (newView, userName) => {
    this.setState({ view: newView + (userName && userName) });
  };
  changeLogIn(loggedIn) {
    this.setState({ userIsLoggedIn: loggedIn });
  }

  changeUser(user) {
    this.setState({ user: user });
  }

  render() {
    return (
      <HashRouter>
        <div className='main'>
          <Grid container spacing={8}>
            <Grid item xs={12}>
              <TopBar
                view={this.state.view}
                userIsLoggedIn={this.state.userIsLoggedIn}
                getUsers={this.getUserList}
                changeLogIn={this.changeLogIn}
                user={this.state.user}
              />
            </Grid>
            <div className='cs142-main-topbar-buffer' />

            {this.state.userIsLoggedIn ? (
              <Grid item sm={3}>
                <Paper className='cs142-main-grid-item'>
                  <UserList />
                </Paper>
              </Grid>
            ) : null}
            {this.state.userIsLoggedIn ? (
              <Grid item sm={9}>
                <Paper className='cs142-main-grid-item2'>
                  <Switch>
                    <Route
                      exact
                      path='/'
                      render={() => (
                        <Typography variant='body1'>
                          Welcome to my photo app let&apos;s start by clicking
                          on one of our users to view their information. This
                          app will show you the full size of the pictures that
                          the users uplodes along with the comments form outher
                          users. Please enjoy your time here ^_^.
                        </Typography>
                      )}
                    />

                    <Route
                      path='/users/:userId'
                      render={props => (
                        <UserDetail
                          {...props}
                          changeTopView={this.changeTopView}
                        />
                      )}
                    />

                    <Route
                      path='/photos/:userId'
                      render={props => (
                        <UserPhotos
                          getUser={this.getUserList}
                          users={this.state.users}
                          changeTopView={this.changeTopView}
                          {...props}
                        />
                      )}
                    />

                    <Route
                      path='/favorites'
                      render={props => (
                        <Favorites
                          user={this.state.user}
                          changeTopView={this.changeTopView}
                          {...props}
                        />
                      )}
                    />
                    <Route
                    path="/activities" render ={ props => <Activities {...props} handler={this.handler} /> }  />
                                    :
                                      <Redirect path="/activities" to="/login-register" />
                    <Route path='/users' component={UserList} />
                  </Switch>
                </Paper>
              </Grid>
            ) : (
              <Redirect to='/login-register' />
            )}

            {!this.state.userIsLoggedIn ? (
              <Route
                path='/login-register'
                render={props => (
                  <Grid item sm={12}>
                    <Paper className='cs142-main-grid-item2'>
                      <LoginRegister
                        changeUser={this.changeUser}
                        changeLogIn={this.changeLogIn}
                        {...props}
                      />
                    </Paper>
                  </Grid>
                )}
              />
            ) : (
              <Redirect path='/login' to='/' />
            )}
            {!this.state.userIsLoggedIn && <Redirect to='/login-register' />}
          </Grid>
        </div>
      </HashRouter>
    );
  }
}

ReactDOM.render(<PhotoShare />, document.getElementById('photoshareapp'));
