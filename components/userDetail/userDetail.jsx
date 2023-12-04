import React from 'react';
import {
  Typography,
  Button,
  List,
  ListItem,
  ListItemAvatar
} from '@material-ui/core';
import './userDetail.css';
import { Link } from 'react-router-dom';

import axios from 'axios';

import AssignmentIndTwoToneIcon from '@material-ui/icons/AssignmentIndTwoTone';
import AccountCircleTwoToneIcon from '@material-ui/icons/AccountCircleTwoTone';
import PersonPinCircleTwoToneIcon from '@material-ui/icons/PersonPinCircleTwoTone';
import FingerprintIcon from '@material-ui/icons/Fingerprint';
import WorkTwoToneIcon from '@material-ui/icons/WorkTwoTone';
import Mentions from './Mentions';
const userDetailsViwe = 'Information about ';
//import UserPhotos from './components/userPhotos/UserPhotos';
/**
 * Define UserDetail, a React componment of CS142 project #5
 */
class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    let newUser;
    this.state = {
      user: newUser,
      mentions: []
    };
    this.getMentions = this.getMentions.bind(this);


  }

  componentDidUpdate() {
    let newUserID = this.props.match.params.userId;
    if (this.state.user._id !== newUserID) {
      let check = this;
      axios.get(`http://localhost:3000/user/${newUserID}`).then(response => {
        let newUser = response.data;
        check.setState({ user: newUser });
        this.getMentions();
        check.props.changeTopView(
          userDetailsViwe,
          `${newUser.first_name} ${newUser.last_name}`
        );
      });
    }
  }
  getMentions() {
    let newUserID = this.props.match.params.userId;
    let holder = axios.get(`http://localhost:3000/user/${newUserID}`);
    holder.then(response => {
      let newUser = response.data;

      this.setState({ user: response.data });
      this.setState({
        mentions: []
      });
      if (this.state.user.mentions.length) {
        this.state.user.mentions.forEach(mention => {
          axios.get('/getPhoto/' + mention).then(
            val => {
              this.setState({
                mentions: this.state.mentions.concat(val.data)
              });
            },
            err => {
              console.error('fetchModel error: ', err);
            }
          );
        });
      }
    //  delete user.mentions;
      this.props.changeTopView(
        userDetailsViwe,
        `${newUser.first_name} ${newUser.last_name}`
      );
    });
  }
  componentDidMount() {
    this.getMentions();
  }

  render() {
    return this.state.user && this.state ? (
      <List>
        <ListItem>
          <ListItemAvatar>
            <AssignmentIndTwoToneIcon fontSize='large' />
          </ListItemAvatar>
          <Typography variant='h5' style={{ fontFamily: 'Trebuchet MS' }}>
            Users information:
          </Typography>
        </ListItem>
        <ListItem>
          <ListItemAvatar>
            <AccountCircleTwoToneIcon fontSize='large' />
          </ListItemAvatar>
          <Typography variant='h6' style={{ fontFamily: 'Trebuchet MS' }}>
            User name:{' '}
            {this.state.user.first_name + ' ' + this.state.user.last_name}
          </Typography>
        </ListItem>
        <ListItem>
          <ListItemAvatar>
            <PersonPinCircleTwoToneIcon fontSize='large' />
          </ListItemAvatar>
          <Typography variant='h6' style={{ fontFamily: 'Trebuchet MS' }}>
            {this.state.user.first_name + "'s"} location:{' '}
            {this.state.user.location}
          </Typography>
        </ListItem>
        <ListItem>
          <ListItemAvatar>
            <FingerprintIcon fontSize='large' />
          </ListItemAvatar>
          <Typography variant='h6' style={{ fontFamily: 'Trebuchet MS' }}>
            {this.state.user.first_name + "'s"} Bio:{' '}
            {this.state.user.description}
          </Typography>
        </ListItem>
        <ListItem>
          <ListItemAvatar>
            <WorkTwoToneIcon fontSize='large' />
          </ListItemAvatar>
          <Typography variant='h6' style={{ fontFamily: 'Trebuchet MS' }}>
            {this.state.user.first_name + "'s"} Occupation:{' '}
            {this.state.user.occupation}
          </Typography>
        </ListItem>
        <ListItem>
          <Link
            to={`/photos/${this.props.match.params.userId}`}
            style={{ textDecoration: 'none' }}
          >
            <Button variant='contained' color='primary' disableElevation>
              View Photos
            </Button>
          </Link>
        </ListItem>

        <ListItem>
          <Typography variant='h6' style={{ fontFamily: 'Trebuchet MS' }}>
            Mentions:{' '}
          </Typography>
        </ListItem>
        <ListItem>
          <Mentions mentions={this.state.mentions} />
        </ListItem>
      </List>
    ) : (
      <div />
    );
  }
}

export default UserDetail;
