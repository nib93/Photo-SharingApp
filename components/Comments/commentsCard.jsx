import React, { Component } from 'react';
import {
  Card,
  Typography,
  CardHeader,
  CardContent,
  CardActions,
  IconButton
} from '@material-ui/core';
import { Link } from 'react-router-dom';
import Avatar from '@material-ui/core/Avatar';
import PersonOutlineTwoToneIcon from '@material-ui/icons/PersonOutlineTwoTone';
import StarsIcon from '@material-ui/icons/Stars';
import axios from 'axios';
import AddComment from './AddComment';

import './commentsCard.css';

class CommetnsCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //comment: ''
    };
  }

  handleFavoriteClick = () => {
    if (this.props.allFavorites.includes(this.props.Photo_id)) {
      axios
        .delete(`/favorite/${this.props.Photo_id}`, {})
        .then(response => {
          this.props.refreshCards();

          console.log(response.data);
        })
        .catch(error => {
          console.log(error.response.data);
        });
    } else {
      axios
        .post(`/favorite/${this.props.Photo_id}`)
        .then(response => {
          this.props.refreshCards();

          console.log(response.data);
        })
        .catch(error => {
          console.log(error.response.data);
        });
    }
  };
  render() {
    return (
      <div>
        <CardActions>
          <IconButton
            aria-label='add to favorites'
            // disabled={this.props.allFavorites}
            onClick={this.handleFavoriteClick}
          >
            {this.props.allFavorites.includes(this.props.Photo_id) ? (
              <StarsIcon color='secondary' fontSize='large' />
            ) : (
              <StarsIcon fontSize='large' />
            )}
          </IconButton>
        </CardActions>
        {this.props.comments && this.props.comments.length ? (
          <Typography variant='h5' style={{ fontFamily: 'Trebuchet MS' }}>
            Comments:
          </Typography>
        ) : (
          <Typography
            variant='body1'
            style={{ fontFamily: 'Trebuchet MS', textAlign: 'center' }}
          >
            No one comment on this photo yet
          </Typography>
        )}
        {this.props.comments
          ? this.props.comments.map(Comment => (
              <Card key={Comment._id} className='card'>
                <Link
                  key={Comment.user._id}
                  to={`/users/${Comment.user._id}`}
                  className='link'
                >
                  <CardHeader
                    title={
                      Comment.user.first_name + ' ' + Comment.user.last_name
                    }
                    avatar={(
                      <Avatar
                        style={{
                          background:
                            'radial-gradient(circle, rgba(63,94,251,1) 0%, rgba(70,204,252,1) 100%)'
                        }}
                      >
                        <PersonOutlineTwoToneIcon />
                      </Avatar>
                    )}
                  >
                  </CardHeader>
                </Link>
                <CardContent>
                  <Typography
                    variant='caption'
                    style={{ fontFamily: 'Trebuchet MS' }}
                  >
                    {Comment.date_time}
                  </Typography>
                  <Typography
                    variant='body2'
                    style={{ fontFamily: 'Trebuchet MS' }}
                  >
                    {Comment.comment.replace(
                      /@\[(\S+ \S+)( )*\]\(\S+\)/g,
                      (comment, name) => {
                        return `@${name}`;
                      }
                    )}
                  </Typography>
                </CardContent>
              </Card>
            ))
          : null}
        <AddComment
          refreshCards={this.props.refreshCards}
          Photo_id={this.props.Photo_id}
          getUser={this.props.getUser}
        />
      </div>
    );
  }
}

export default CommetnsCard;
