import React from 'react';
import { AppBar, Toolbar, Typography, Grid, Button } from '@material-ui/core';
import './TopBar.css';
import { Link } from 'react-router-dom';

import axios from 'axios';

/**
 * Define TopBar, a React componment of CS142 project #5
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      //view: this.props.view,
      //version: ''
    };
    this.buttonClicked = this.buttonClicked.bind(this);
    this.handleUploadButtonClicked = this.handleUploadButtonClicked.bind(this);
    // console.log(this.props.user);
  }

  // componentDidUpdate(prevProps) {
  //   if (prevProps.view !== this.props.view) {
  //     this.setState({ view: this.props.view });
  //     let prom = axios.get('http://localhost:3000/test/info');
  //     prom.then(response => {
  //       this.setState({ version: response.data.__v });
  //     });
  //   }
  // }
  componentDidMount() {
    axios.get('test/info').then(
      val => {
        this.setState({ versionNumber: val.data.__v });
        //this.setState({ view: this.props.view });
      },
      err => {
        console.error('fetchModel error: ', err);
      }
    );
  }

  buttonClicked() {
    axios.post('/admin/logout', {}).then(
      () => {
        this.props.changeLogIn(false);
        //this.setState({ user: val });
      },
      err => {
        console.error('button clicked error:', err);
      }
    );
  }
  handleUploadButtonClicked = e => {
    e.preventDefault();
    if (this.uploadInput.files.length > 0) {
      // Create a DOM form and add the file to it under the name uploadedphoto
      const domForm = new FormData();
      domForm.append('uploadedphoto', this.uploadInput.files[0]);
      axios
        .post('/photos/new', domForm)
        .then(res => {
          this.props.getUsers();
          console.log(res);
        })
        .catch(err => console.log(`POST ERR: ${err}`));
    }
  };

  render() {
    return (
      <AppBar position='absolute'>
        <Toolbar>
          <Grid
            container
            direction='row'
            justifyContent='space-between'
            alignItems='center'
          >
            <Typography variant='h5' style={{ fontFamily: 'Trebuchet MS' }}>
              {this.props.userIsLoggedIn
                ? 'Hi ' + this.props.user.first_name
                : 'Neeti Bhatt CS142 Final Project'}
            </Typography>
            {this.props.userIsLoggedIn ? (
              <Button
                variant='contained'
                color='secondary'
                component={Link}
                to='/favorites'
              >
                favorites
              </Button>
            ) : null}
            <Typography variant='body1' style={{ fontFamily: 'Trebuchet MS' }}>
              version: {this.state.versionNumber}
            </Typography>
            <Typography variant='h5' style={{ fontFamily: 'Trebuchet MS' }}>
              {this.props.userIsLoggedIn ? this.props.view : 'Please log in'}
            </Typography>

            {this.props.userIsLoggedIn && (
              <input
                type='file'
                accept='image/*'
                ref={domFileRef => {
                  this.uploadInput = domFileRef;
                }}
              />
            )}
            {this.props.userIsLoggedIn && (
              <Button
                variant='contained'
                color='secondary'
                onClick={this.handleUploadButtonClicked}
              >
                Submit photo
              </Button>
            )}
            {this.props.userIsLoggedIn && (
              <Button variant='contained' color='default' href="#/activities" >
                    Activities
              </Button>
            )}
            {this.props.userIsLoggedIn && (
              <Button
                variant='contained'
                color='secondary'
                onClick={this.buttonClicked}
              >
                Log out
              </Button>
            )}
          </Grid>
        </Toolbar>
      </AppBar>
    );
  }
}

export default TopBar;
