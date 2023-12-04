import React from 'react';
import { Typography, Container, Avatar } from '@material-ui/core';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import FaceTwoToneIcon from '@material-ui/icons/FaceTwoTone';

import axios from 'axios';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import './LoginRegister.css';

class LoginRegister extends React.Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      login_name: '',
      password: '',
      //user: {},
      error_login: '',
      error: ''
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleNewUser = this.handleNewUser.bind(this);
  }

  handleNewUser(event) {
    event.preventDefault();
    if (this.state.new_password === this.state.new_password2) {
      if (
        this.state.first_name &&
        this.state.last_name &&
        this.state.location &&
        this.state.description &&
        this.state.occupation &&
        this.state.new_login_name &&
        this.state.new_password &&
        this.state.new_password2
      ) {
        axios
          .post('/user', {
            login_name: this.state.new_login_name,
            first_name: this.state.first_name,
            last_name: this.state.last_name,
            location: this.state.location,
            description: this.state.description,
            occupation: this.state.occupation,
            password: this.state.new_password
          })
          .then(
            () => {
              this.setState({
                error: 'User successfully created!',
                first_name: '',
                last_name: '',
                location: '',
                description: '',
                occupation: '',
                new_login_name: '',
                new_password: '',
                new_password2: ''
              });
              // console.log('testing', this.state);
            },
            err => {
              this.setState({
                error: err.response.data
              });
            }
          );
      } else {
        this.setState({ error: 'Please fill in all of the input fields' });
      }
    } else {
      this.setState({
        error: 'Please make sure both of the password fields match'
      });
    }
  }
  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }
  handleSubmit(event) {
    event.preventDefault();
    axios
      .post('/admin/login', {
        login_name: this.state.login_name,
        password: this.state.password
      })
      .then(val => {
        this.props.changeUser(val.data);
        this.props.changeLogIn(true);
        this.setState({ error_login: '' });
      })
      .catch(err => {
        this.setState({
          error_login: 'Incorrect login name or password. Please try again'
        });
        console.error('fetchModel error: ', err);
      });
  }

  componentDidMount() {this._isMounted = true;}
  //componentWillMount(){this._isMounted = false;}
  render() {
    return (
      <Container component='main' maxWidth='xs'>
          <div className='paper'>
            <Avatar
              style={{
                background: 'linear-gradient(147deg, #fe8a39 0%, #fd3838 74%)',
                marginBottom: '5px'
              }}
            >
              <LockOutlinedIcon />
            </Avatar>
            <Typography component='h1' variant='h5'>
              Log In:
            </Typography>
            <form className='form' onSubmit={this.handleSubmit}>
              <TextField
                type='login name'
                name='login_name'
                value={this.state.login_name}
                onChange={this.handleChange}
                margin='normal'
                variant='outlined'
                label='Login Name'
                autoFocus
                fullWidth
              />
              <TextField
                type='password'
                className='text'
                name='password'
                value={this.state.password}
                onChange={this.handleChange}
                margin='normal'
                variant='outlined'
                label='Password'
                fullWidth
              />
              <Button
                variant='contained'
                color='secondary'
                label='Submit'
                type='submit'
                style={{ marginTop: '10px' }}
              >
                Submit
              </Button>
              {this.state.error_login && (
                <Typography variant='subtitle2' color='inherit'>
                  {this.state.error_login}
                </Typography>
              )}
            </form>

            <Avatar
              style={{
                background: 'linear-gradient(147deg, #fe8a39 0%, #fd3838 74%)',
                marginTop: '25px',
                marginBottom: '5px'
              }}
            >
              <FaceTwoToneIcon fontSize='large' />
            </Avatar>
            <Typography component='h1' variant='h5'>
              Register new user:
            </Typography>
            <form onSubmit={this.handleNewUser}>
              <TextField
                type='text'
                name='new_login_name'
                value={this.state.new_login_name || ''}
                onChange={this.handleChange}
                margin='normal'
                variant='outlined'
                label='Login Name'
                fullWidth
              />
              <TextField
                type='password'
                name='new_password'
                value={this.state.new_password || ''}
                onChange={this.handleChange}
                margin='normal'
                variant='outlined'
                label='Password'
                fullWidth
              />
              <TextField
                type='password'
                name='new_password2'
                value={this.state.new_password2 || ''}
                onChange={this.handleChange}
                margin='normal'
                variant='outlined'
                label='Retype Password'
                fullWidth
              />
              <TextField
                type='text'
                name='first_name'
                value={this.state.first_name || ''}
                onChange={this.handleChange}
                margin='normal'
                variant='outlined'
                label='First Name'
                fullWidth
              />
              <TextField
                type='text'
                name='last_name'
                value={this.state.last_name || ''}
                onChange={this.handleChange}
                margin='normal'
                variant='outlined'
                label='Last Name'
                fullWidth
              />
              <TextField
                type='text'
                name='location'
                value={this.state.location || ''}
                onChange={this.handleChange}
                margin='normal'
                variant='outlined'
                label='Location'
                fullWidth
              />
              <TextField
                type='text'
                name='description'
                value={this.state.description || ''}
                onChange={this.handleChange}
                margin='normal'
                variant='outlined'
                label='Description'
                fullWidth
              />
              <TextField
                type='text'
                name='occupation'
                value={this.state.occupation || ''}
                onChange={this.handleChange}
                margin='normal'
                variant='outlined'
                label='Occupation'
                fullWidth
              />

              <Button
                variant='contained'
                color='secondary'
                label='Submit'
                type='submit'
              >
                Register Me
              </Button>

              {this.state.error && (
                <Typography variant='subtitle2' color='inherit'>
                  {this.state.error}
                </Typography>
              )}
            </form>
          </div>
      </Container>
    );
  }
}

export default LoginRegister;
