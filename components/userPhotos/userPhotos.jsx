import React from 'react';
import { Link } from 'react-router-dom';
import {
  Grid,
  Card,
  CardHeader,
  CardMedia,
  CardContent
} from '@material-ui/core';
import './userPhotos.css';
import Avatar from '@material-ui/core/Avatar';


import PersonOutlineTwoToneIcon from '@material-ui/icons/PersonOutlineTwoTone';
import axios from 'axios';
import CommentsCard from '../Comments/commentsCard';

const photosViwe = 'Photos of ';
/**
 * Define UserPhotos, a React componment of CS142 project #5
 */
class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userPhotos: [],
      //users: [],
      favorite_ids: []
    };
    this.refreshCards = this.refreshCards.bind(this);

    this.userId = props.match.params.userId;
    let Holder = axios.get(`http://localhost:3000/photosOfUser/${this.userId}`);
    Holder.then(response => {
      this.setState({ userPhotos: response.data });
    });
    axios.get(`http://localhost:3000/user/${this.userId}`).then(response => {
      this.user = response.data;
      this.props.changeTopView(
        photosViwe,
        `${this.user.first_name} ${this.user.last_name}`
      );
    });
  }
  refreshCards() {
    let Holder = axios.get(`http://localhost:3000/photosOfUser/${this.userId}`);
    Holder.then(response => {
      this.setState({ userPhotos: response.data });
    });
    this.getFavorites();
  }
  componentDidMount() {
    axios.get('/photosOfUser/' + this.props.match.params.userId).then(
      val => {
        this.setState({ userPhotos: val.data });
      },
      err => {
        console.error('fetchModel error: ', err);
      }
    );
    this.getFavorites();
  }
  getFavorites() {
    axios
      .get(`/favorites`)
      .then(response => {
        let favorite_ids = response.data.map(photo => photo._id);
        this.setState({ favorite_ids });
      })
      .catch(() => this.setState({ favorite_ids: [] }));
  }

  showOriginalVeiw() {
    return (
      <Grid
        container
        spacing={2}
        style={{
          background:
            'linear-gradient(90deg, rgba(236,243,255,1) 0%, rgba(209,220,255,1) 100%)'
        }}
      >
        {this.state.userPhotos.map(tile => (
          <Grid key={tile._id} item xs={12}>
            <Card>
              <Link
                key={this.user._id}
                to={`/users/${this.user._id}`}
                className='link'
              >
                <CardHeader
                  avatar={(
                    <Avatar
                      style={{
                        background:
                          'linear-gradient(147deg, #fe8a39 0%, #fd3838 74%)'
                      }}
                    >
                      <PersonOutlineTwoToneIcon fontSize='medium' />
                    </Avatar>
                  )}
                  title={this.user.first_name}
                  subheader={`Created : ${tile.date_time}`}
                >
                </CardHeader>
              </Link>

              <CardMedia
                component='img'
                height=''
                width=''
                image={`/images/${tile.file_name}`}
                alt={tile._id}
                id={tile.file_name}
              />

              <CardContent>
                <CommentsCard
                  comments={tile.comments}
                  Photo_id={tile._id}
                  userId={this.user._id}
                  refreshCards={this.refreshCards}
                  getUser={this.props.getUser}
                  users={this.state.displayUsers}
                  allFavorites={this.state.favorite_ids}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  render() {
    return this.user ? this.showOriginalVeiw() : <div />;
  }
}

export default UserPhotos;
