import React, { Component } from 'react';
import { Typography, CardContent, Button } from '@material-ui/core';
import { MentionsInput, Mention } from 'react-mentions';

import './commentsCard.css';
const axios = require('axios').default;
class AddComment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      comment: '',
      mentions: [],
      displayUsers: []
    };

    this.mentionChange = this.mentionChange.bind(this);
    this.getDisplayUsers();
  }
  /*eslint-disable array-callback-return*/
  getDisplayUsers() {
    axios.get('/user/list').then(
      users => {
        let currUsers = [];
        users.data.map(function(user) {
          let id = user._id;
          let display = user.first_name + ' ' + user.last_name;
          let currUser = { id: id, display: display };
          currUsers.push(currUser);
        });
        this.setState({ displayUsers: currUsers });
      },
      err => {
        console.error('fetchModel error: ', err);
      }
    );
  }
  /*eslint-enable array-callback-return*/
  handleAddComment = (event, photo_id) => {
    event.preventDefault();
    axios
      .post(`/commentsOfPhoto/${photo_id}`, { comment: this.state.comment })
      .then(() => {
        this.setState({ comment: '' });

        this.props.refreshCards();
        this.props.getUser();
      })
      .catch(err => {
        console.log(err.response);
      });
    if (this.state.mentions.length) {
      this.state.mentions.forEach(function(mention) {
        axios
          .post('/mentionsOfPhoto/' + photo_id, {
            mentionUser: mention.id
          })
          .then(result => console.log(result))
          .catch(err => console.log(err));
      });
    }
  };

  handleChangeInput = event => {
    this.setState({ comment: event.target.value });
  };

  mentionChange(event, newValue, newPlainText, mentions) {
    this.setState({ comment: event.target.value });
    this.setState({ mentions: mentions });
  }

  render() {
    return (
      <CardContent>
        <Typography variant='caption' style={{ fontFamily: 'Trebuchet MS' }}>
          {Comment.date_time}
        </Typography>
        <Typography variant='body2' style={{ fontFamily: 'Trebuchet MS' }}>
          {Comment.comment}
        </Typography>
        <form
          className='add-comment'
          onSubmit={event => this.handleAddComment(event, this.props.Photo_id)}
        >
          {/* <TextField
            type='Add comment'
            name='add-comment'
            value={this.state.comment}
            onChange={this.handleChangeInput}
            margin='normal'
            variant='outlined'
            label='Add comment'
            autoFocus
            fullWidth
          />
          <Button
            variant='contained'
            color='secondary'
            label='Submit'
            type='submit'
          >
            Submit
          </Button> */}
        </form>
        <MentionsInput
          value={this.state.comment}
          onChange={this.mentionChange}
          markup={'@__display__'}
          placeholder={"Mention users using '@'"}
          style={{
            width: '96%',
            padding: '12px 20px',
            margin: '8px 0'
          }}
        >
          <Mention trigger='@' data={this.state.displayUsers} />
        </MentionsInput>
        <Button
          variant='contained'
          color='primary'
          label='Submit'
          type='submit'
          onClick={e => {
            e.persist();
            this.handleAddComment(e, this.props.Photo_id);
          }}
        >
          Add Comment
        </Button>
      </CardContent>
    );
  }
}

export default AddComment;
/**
 * optinal styling for the input mention.
    control: {
      backgroundColor: '#fff',

      fontSize: 14,
      fontWeight: 'normal',

    },

    highlighter: {
      overflow: 'hidden',
    },

    input: {
      margin: 0,
    },

    '&singleLine': {
      control: {
        // display: 'inline-block',
        border: '1px solid silver',

      },

      highlighter: {
        padding: 9,
        // border: '2px inset transparent',
      },

      input: {
        padding: 9,
        outline: 0,
        border: 0,

        border: '2px',
      },
    },

    '&multiLine': {
      control: {
        fontFamily: 'monospace',
        border: '1px solid silver',
      },

      highlighter: {
        padding: 9,
      },

      input: {
        padding: 9,
        outline: 0,
        border: 0,
      },
    },

    suggestions: {
      //bottom: 9,
      overflow: 'visible',
      list: {
        backgroundColor: 'white',
        border: '1px solid rgb(0,0,0)',
        fontSize: 14,
        overflow: 'visible',
        margin: 10,
        padding: 5,
        bottom: 9
      },

      item: {
        padding: '10px',
        //borderBottom: '1px solid black',

        '&focused': {
          backgroundColor: '#cee4e5',
        },
      },
    },

 */
