import React from 'react';
import {
  MenuList,
  MenuItem,
  Typography,
  ListItemAvatar,
  Avatar
} from '@material-ui/core';
import './userList.css';
import FaceTwoToneIcon from '@material-ui/icons/FaceTwoTone';
import { Link } from 'react-router-dom';

import axios from 'axios';

class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: []
    };
    let holder = axios.get(`http://localhost:3000/user/list`);
    holder.then(response => {
      this.setState({ users: response.data });
    });
  }

  render() {
    return (
      <React.Fragment>
        <Typography
          variant='h5'
          style={{ color: 'black', fontFamily: 'Trebuchet MS' }}
        >
          Users List
        </Typography>
        <MenuList component='nav'>
          {this.state.users.map(user => {
            return (
              <Link
                key={user._id}
                to={`/users/${user._id}`}
                style={{ textDecoration: 'none' }}
              >
                <MenuItem>
                  <ListItemAvatar>
                    <Avatar
                      style={{
                        background:
                          'linear-gradient(147deg, #fe8a39 0%, #fd3838 74%)'
                      }}
                    >
                      <FaceTwoToneIcon fontSize='large' />
                    </Avatar>
                  </ListItemAvatar>
                  <Typography
                    variant='h6'
                    style={{ color: 'black', fontFamily: 'Trebuchet MS' }}
                  >
                    {user.first_name + ' ' + user.last_name}
                  </Typography>
                </MenuItem>
              </Link>
            );
          })}
        </MenuList>
      </React.Fragment>
    );
  }
}

export default UserList;
