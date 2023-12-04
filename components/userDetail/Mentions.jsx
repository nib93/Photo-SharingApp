import React from 'react';
import { List, ListItem, Typography } from '@material-ui/core';
import { Link as RouterLink } from 'react-router-dom';
import Link from '@material-ui/core/Link';
import { HashLink } from 'react-router-hash-link';
//import fetchModel from "../../lib/fetchModelData";
// import axios from "axios";

// props = {
//   mentions: []
// }

export default function Mentions(props) {
  const { mentions } = props;

  return (
    <List>
      {mentions.length
        ? mentions.map(currMention => (
            <ListItem key={currMention.file_name}>
              <Link
                variant='subtitle1'
                component={RouterLink}
                to={'/users/' + currMention.user_id}
              >
                <Typography variant='h6' style={{ fontFamily: 'Trebuchet MS' }}>
                  {' '}
                  {currMention.first_name + ' ' + currMention.last_name}
                </Typography>
              </Link>
              <HashLink
                to={
                  '/photos/' + currMention.user_id + '#' + currMention.file_name
                }
              >
                <img
                  src={'/images/' + currMention.file_name}
                  alt={currMention.file_name}
                  style={{
                    height: 'auto',
                    width: '100px',
                    display: 'block',
                    margin: '10px'
                  }}
                />
              </HashLink>
            </ListItem>
          ))
        : 'No mentions'}
    </List>
  );
}
