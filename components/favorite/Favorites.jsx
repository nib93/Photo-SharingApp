import React from 'react';
import axios from 'axios';
import {
  List,
  IconButton,
  ListItem,
  Avatar,
  Button,
  Divider,
  Typography
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import Modal from 'react-modal';
import { Link } from 'react-router-dom';

const modalStyle = {
  content: {
    top: '60%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)'
  }
};

class Favorites extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      favorites: null,
      modalIsOpen: false,
      file_name: '',
      dateTime: '',
      userId: ''
    };
  }

  componentDidMount() {
    Modal.setAppElement('body');
    if (this.props.user !== null) {
      this.props.changeTopView(
        `Favorites of `,
        this.props.user.first_name + ' ' + this.props.user.last_name
      );
    } else {
      this.props.changeTopView(`Favorite List`);
    }
    this.getFavorites();
  }

  getFavorites = () => {
    axios
      .get(`/favorites`)
      .then(response => {
        this.setState({
          favorites: response.data
        });
      })
      .catch(error => {
        console.log(error.response.data);
      });
  };

  handelDelet = photo => {
    let url = `/favorite/${photo._id}`;
    axios
      .delete(url)
      .then(response => {
        console.log(response.data);
        this.getFavorites();
      })
      .catch(error => {
        //alert('delete favorite photo failed');
        console.log(error.response.data);
      });
  };

  openModal = (file_name, date_time, user_id) => {
    this.setState({
      modalIsOpen: true,
      file_name: file_name,
      dateTime: date_time,
      userId: user_id
    });
  };

  closeModal = () => {
    this.setState({
      modalIsOpen: false
    });
  };
/*eslint-disable class-methods-use-this*/
  displayTime(time) {
    let pos = time.indexOf('.');
    let replaced = time.replace(/[A-Z]/g, function() {
      return ' ';
    });
    return replaced.slice(0, pos);
  }
  /*eslint-enable class-methods-use-this*/

  displayFavoriteList() {
    const { favorites } = this.state;
    if (favorites === null) {
      return null;
    } else if (favorites.length === 0) {
      return (
        <Typography variant='body2' color='textPrimary'>
          no favorites yet
        </Typography>
      );
    }
    return favorites.map((photo, index) => {
      return (
        <div key={index}>
          <ListItem>
            <Avatar
              alt={photo.file_name}
              src={'../../images/' + photo.file_name}
              onClick={() => {
                this.openModal(photo.file_name, photo.date_time, photo.user_id);
              }}
              style={{
                width: 100,
                height: 100,
                marginRight: '25px'
              }}
            />
            <Typography
              variant='h5'
              color='inherit'
              style={{ marginRight: '10px', fontFamily: 'Trebuchet MS' }}
            >
              {photo.file_name}
            </Typography>
            <IconButton
              aria-label='Delete favorites'
              onClick={() => {
                this.handelDelet(photo);
              }}
            >
              <DeleteIcon fontSize='large' />
            </IconButton>
          </ListItem>
          <Divider />
        </div>
      );
    });
  }
  /*eslint-disable no-useless-concat*/
  render() {
    const { modalIsOpen, file_name, dateTime, userId } = this.state;
    return (
      <div>
        <Typography variant='h5' color='inherit'>
          Favorite List
        </Typography>
        <List component='nav'>{this.displayFavoriteList()}</List>
        <Modal
          isOpen={modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={modalStyle}
          contentLabel='Example Modal'
        >
          <Typography
            variant='h4'
            color='secondary'
            style={{ margin: '5px', fontFamily: 'Trebuchet MS' }}
          >
            {file_name}
          </Typography>
          <img
            alt={file_name}
            src={'../../images/' + file_name}
            style={{ maxHeight: '300px' }}
          />

          <Typography
            variant='body2'
            color='textPrimary'
            className='cs142-modal-time'
            style={{ marginBottom: '10px' }}
          >
            {`Created: ${this.displayTime(dateTime)}`}
          </Typography>

          <div className='cs142-modal-container'>
            <Button
              variant='contained'
              color='primary'
              component={Link}
              to={`/photos/${userId}` + '#' + file_name}
              style={{ marginRight: '10px' }}
            >
              Photo Detail
            </Button>
            <Button
              variant='outlined'
              color='primary'
              onClick={this.closeModal}
            >
              close
            </Button>
          </div>
        </Modal>
      </div>
    );

  }
}
/*eslint-enable no-useless-concat*/
export default Favorites;
