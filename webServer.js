

/* jshint node: true */

/*
 * This builds on the webServer of previous projects in that it exports the current
 * directory via webserver listing on a hard code (see portno below) port. It also
 * establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 *
 * This webServer exports the following URLs:
 * /              -  Returns a text status message.  Good for testing web server running.
 * /test          - (Same as /test/info)
 * /test/info     -  Returns the SchemaInfo object from the database (JSON format).  Good
 *                   for testing database connectivity.
 * /test/counts   -  Returns the population counts of the cs142 collections in the database.
 *                   Format is a JSON object with properties being the collection name and
 *                   the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the database.
 * /user/list     -  Returns an array containing all the User objects from the database.
 *                   (JSON format)
 * /user/:id      -  Returns the User object with the _id of id. (JSON format).
 * /photosOfUser/:id' - Returns an array with all the photos of the User (id). Each photo
 *                      should have all the Comments on the Photo (JSON format)
 *
 */

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
mongoose.set('strictQuery', true);
var async = require('async');

// Load the Mongoose schema for User, Photo, and SchemaInfo

var express = require('express');
var app = express();

var session = require('express-session');
var bodyParser = require('body-parser');
var multer = require('multer');
var processFormBody = multer({ storage: multer.memoryStorage() }).single(
  'uploadedphoto'
);
var fs = require('fs');
var SchemaInfo = require('./schema/schemaInfo.js');
var Photo = require('./schema/photo.js');
var User = require('./schema/user.js');
var Activity = require('./schema/activity.js');
app.use(
  session({ secret: 'secretKey', resave: false, saveUninitialized: false })
);
app.use(bodyParser.json());

// XXX - Your submission should work without this line. Comment out or delete this line for tests and before submission!
// var cs142models = require('./modelData/photoApp.js').cs142models;

mongoose.connect('mongodb://127.0.0.1/cs142project6', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));

app.get('/', function(request, response) {
  response.send('Simple web server of files from ' + __dirname);
});

/*
 * Use express to handle argument passing in the URL.  This .get will cause express
 * To accept URLs with /test/<something> and return the something in request.params.p1
 * If implement the get as follows:
 * /test or /test/info - Return the SchemaInfo object of the database in JSON format. This
 *                       is good for testing connectivity with  MongoDB.
 * /test/counts - Return an object with the counts of the different collections in JSON format
 */
app.get('/test/:p1', function(request, response) {
  // Express parses the ":p1" from the URL and returns it in the request.params objects.
  console.log('/test called with param1 = ', request.params.p1);

  var param = request.params.p1 || 'info';

  if (param === 'info') {
    // Fetch the SchemaInfo. There should only one of them. The query of {} will match it.
    SchemaInfo.find({}, function(err, info) {
      if (err) {
        // Query returned an error.  We pass it back to the browser with an Internal Service
        // Error (500) error code.
        console.error('Doing /user/info error:', err);
        response.status(500).send(JSON.stringify(err));
        return;
      }
      if (info.length === 0) {
        // Query didn't return an error but didn't find the SchemaInfo object - This
        // is also an internal error return.
        response.status(500).send('Missing SchemaInfo');
        return;
      }

      // We got the object - return it in JSON format.
      console.log('SchemaInfo', info[0]);
      response.end(JSON.stringify(info[0]));
    });
  } else if (param === 'counts') {
    // In order to return the counts of all the collections we need to do an async
    // call to each collections. That is tricky to do so we use the async package
    // do the work.  We put the collections into array and use async.each to
    // do each .count() query.
    var collections = [
      { name: 'user', collection: User },
      { name: 'photo', collection: Photo },
      { name: 'schemaInfo', collection: SchemaInfo }
    ];
    async.each(
      collections,
      function(col, done_callback) {
        col.collection.countDocuments({}, function(err, count) {
          col.count = count;
          done_callback(err);
        });
      },
      function(err) {
        if (err) {
          response.status(500).send(JSON.stringify(err));
        } else {
          var obj = {};
          for (var i = 0; i < collections.length; i++) {
            obj[collections[i].name] = collections[i].count;
          }
          response.end(JSON.stringify(obj));
        }
      }
    );
  } else {
    // If we know understand the parameter we return a (Bad Parameter) (400) status.
    response.status(400).send('Bad param ' + param);
  }
});

/*
 * URL /user/list - Return all the User object.
 */
// app.get('/user/list', function(request, response) {
//   User.find({}, function(err, users) {
//     if (err) {
//       console.log('Doing /user/list error:', err);
//       response.status(400).send(JSON.stringify(err));
//       return;
//     }
//     if (users.length === 0) {
//       console.log('User is Missing');
//       response.status(400).send('User is Missing');
//     }
//     users = users.map(function(user) {
//       user = JSON.parse(JSON.stringify(user));
//       // handel test cases.
//       delete user.location;
//       delete user.description;
//       delete user.occupation;
//       delete user.__v;
//       return user;
//     });
//     response.status(200).send(users);
//   });
// });
app.get('/user/list', function(request, response) {
  if (request.session.login_name && request.session.user_id) {
    User.find({}, 'first_name last_name id lastAction', function(err, users) {
      if (err) {
        response.status(500).send(JSON.stringify(err));

      } else {
        response.status(200).send(JSON.parse(JSON.stringify(users)));
      }
    });
  } else {
    response.status(401).send('You are not logged in');
  }
});
/*
 * URL /user/:id - Return the information for User (id)
 */
 /*app.get('/user/:id', function(request, response) {
   var id = request.params.id;
   User.findById(id, function(err, user) {
     if (err) {
       console.log('/user/:id error:', err);
       response.status(400).send(JSON.stringify(err));
       return;
     }
     if (user === null) {
       console.log('User with _id:' + id + ' not found.');
       response.status(400).send('Not found');
       return;
     }
     user = JSON.parse(JSON.stringify(user));
     //delete user.__v;
     delete user.mentions;
     delete user.password;
     delete user.login_name;
     delete user.favorites;
   response.status(200).send(user);
   });
 });
 */
 app.get('/user/:id', function(request, response) {
  if (request.session.login_name && request.session.user_id) {
    var id = request.params.id;
      User.findById(
      id,
      'first_name last_name id location description occupation mentions'
    )
      .then(result => {
        //console.log ("USERRRRRR ====" + result);
        //response.status(200).send(JSON.parse(JSON.stringify(result)));

        // var result_try = JSON.parse(JSON.stringify(resultcopy));
         //delete resultcopy.mentions;
        //response.status(200).send(JSON.stringify(resultcopy));
      // result.save();

      //  delete result.mentions;
       //response.status(200).send(result);
        //response.status(200).send(JSON.stringify(result));
         response.status(200).send(JSON.parse(JSON.stringify(result)));
        //delete resultcopy.mentions;
        //User.push(mentions);
        //response.status(200).send(JSON.stringify(resultcopy));

      })
      .then(null, err => {
        response.status(400).send(JSON.stringify(err));
      });
  } else {
    response.status(401).send('You are not logged in');
  }

});
/*
 * URL /photosOfUser/:id - Return the Photos for User (id)
 */

// app.get('/photosOfUser/:id', function(request, response) {
//   var id = request.params.id;
//   Photo.find({ user_id: id }, async function(err, photos) {
//     if (err) {
//       console.log('/photosOfUser/:id error:', err);
//       response.status(400).send(JSON.stringify(err));
//       return;
//     }
//     if (photos.length === 0) {
//       console.log('Photos for user with _id:' + id + ' not found.');
//       response.status(400).send('Not found');
//       return;
//     }

//     const photosHolder = photos.map(async function(photo) {
//       photo = JSON.parse(JSON.stringify(photo));
//       const commentsHolder = photo.comments.map(async function(comment) {
//         comment = JSON.parse(JSON.stringify(comment));
//         await User.findById(comment.user_id, function(err, user) {
//           if (err) {
//             console.log('/photosOfUser/:id search comments error:', err);
//             response.status(400).send(JSON.stringify(err));
//           }
//           if (user === null) {
//             console.log('User with _id:' + comment.user_id + ' not found.');
//             response.status(400).send('Not found');
//           }
//           user = JSON.parse(JSON.stringify());
//           // handel test cases
//           delete user.location;
//           delete user.description;
//           delete user.occupation;
//           delete user.__v;
//           comment.user = user;
//         });

//         delete comment.user_id;
//         return comment;
//       });

//       photo.comments = await Promise.all(commentsHolder);
//       // handel test case.
//       delete photo.__v;
//       return photo;
//     });

//     photos = await Promise.all(photosHolder);
//     response.status(200).send(photos);
//   });
// });
app.get('/photosOfUser/:id', function(request, response) {
  if (request.session.login_name && request.session.user_id) {
    var id = request.params.id;
    try {
      id = mongoose.Types.ObjectId(id);
    } catch (err) {
      response.status(400).send(JSON.stringify(err));
      return;
    }
    Photo.find({ user_id: id }, '_id user_id comments file_name date_time')
      .then(photos => {
        photos = JSON.parse(JSON.stringify(photos));
        async.each(
          photos,
          function(photo, callbackPhoto) {
            async.each(
              photo.comments,
              function(comment, callbackComment) {
                let comment_id = comment.user_id;
                delete comment.user_id;
                User.findById(comment_id, 'first_name last_name _id')
                  .then(user => {
                    comment.user = user;
                    callbackComment();
                  })
                  .catch(err => {
                    callbackComment(err);
                    console.log('commentcallback: ', err);
                  });
              },
              // after all the comments are finished being processed
              err => {
                if (err) {
                  callbackPhoto(err);
                } else {
                  callbackPhoto();
                }
              }
            );
          },
          err => {
            if (err) {
              response.status(400).send(JSON.stringify(err));
            } else {
              response.status(200).send(JSON.parse(JSON.stringify(photos)));
            }
          }
        );
      })
      .catch(err => {
        response.status(400).send(JSON.stringify(err));
      });
  } else {
    response.status(401).send('You are not logged in');
  }
});
app.get('/activities', function (request, response) {
    //Check if user is logged in, if not, respond with status 401 unauthorized
    if (!request.session.user_id) {
        response.status(401).send(JSON.stringify("Please log in."));
        return;
    }
/*eslint-disable no-shadow*/
    Activity.find({})
            .limit(5)
            .sort({ date_time: -1 })
            .exec(function (err, activities) {
                if (err) {
                    console.log('Error getting activities.');
                    response.status(400).send(JSON.stringify(err));
                    return;
                }
                if (!activities) {
                    console.log('Could not find any activities.');
                    response.status(400).send('Could not find any activities.');
                    return;
                }

                let activitiesCopy = JSON.parse(JSON.stringify(activities));

                //Asynchronously loop through the photos
                async.each(activitiesCopy, function (activity, done_callback1) {
                    User.findOne({_id: activity.user_id}, function (err, user) {
                        if (err) {
                            console.log('Error getting user of the activity.', err);
                            response.status(400).send(JSON.stringify(err));
                            return;
                        }
                        if (!user) {
                            console.log('Could not find a user with id ' + activity.user_id);
                            response.status(400).send('Could not find a user with id ' + activity.user_id);
                            return;
                        }

                        activity.user = {};
                        activity.user._id = user._id;
                        activity.user.first_name = user.first_name;
                        activity.user.last_name = user.last_name;

                        if (activity.additional_id) {
                            Photo.findOne({_id: activity.additional_id}, function (err, photo) {
                                if (err) {
                                    console.log('Error getting photo.', err);
                                    response.status(400).send(JSON.stringify(err));
                                    return;
                                }
                                if (!photo) {
                                    console.log('Could not find a photo with id ' + activity.additional_id);
                                    response.status(400).send('Could not find a photo with id ' + activity.additional_id);
                                    return;
                                }

                                activity.photo = {};
                                activity.photo.photo_id = photo._id;
                                activity.photo.file_name = photo.file_name;

                                done_callback1(err);
                            });
                        } else {
                            done_callback1(err);
                        }
                    });
                }, function (err) {
                    if (err) {
                        console.log('Error processing activities.', err);
                        response.status(500).send(JSON.stringify(err));

                    } else {
                        console.log('Successfully retrieved activities:', activitiesCopy);
                        response.status(200).end(JSON.stringify(activitiesCopy));
                    }
                });
    });
});

/**____________________________________________________________________________________________Project 7____________________________________________________________________________________________**/
// log in
app.post('/admin/login', function(request, response) {
  var id = request.body.login_name;
  User.findOne(
    { login_name: id },
    'first_name last_name id location description occupation login_name password lastAction'
  )
    .then(result => {
      if (result.password === request.body.password) {
        request.session.user_id = result.id;
        console.log(result.id);
        request.session.login_name = result.login_name;
        console.log(result.login_name);
        result.lastAction = 'Logged in';
        result.save();
        let activity = {
            type: 'User login',
            user_id: result.id
        };

        Activity.create(activity, function (err, activity) {
            if (err) {
                console.log('Error creating new activity object.');
                response.status(400).send(JSON.stringify(err));
                return;
            }
            console.log('Successfully added new user login activity.', activity);
            response.status(200).end('Successfully added new user login activity.');
        });
        response.status(200).send(JSON.parse(JSON.stringify(result)));
      } else response.status(400).send('wrong password');
    })
    .catch(err => {
      //console.log("error");
      response.status(400).send(JSON.stringify(err));
    });
});
// log out
app.post('/admin/logout', function(request, response) {
  if (request.session.login_name && request.session.user_id) {
    let activity = {
    type: 'User logout',
    user_id: request.session.user_id
};

Activity.create(activity, function (err, activity) {
    if (err) {
        console.log('Error creating new activity object.');
        response.status(400).send(JSON.stringify(err));
        return;
    }
    console.log('Successfully added new user logout activity.', activity);
    response.status(200).end('Successfully added new user logout activity.');
});
    User.findOne(
      { login_name: request.session.login_name },
      'first_name last_name id lastAction'
    )
      .then(result => {
        //console.log("logout", result);
        result.lastAction = 'Logged out';
        result.save();


      })
      .catch(err => response.status(400).send(JSON.stringify(err)));
    delete request.session.login_name;
    delete request.session.user_id;
    request.session.destroy(function(err) {
      response.status(400).send(JSON.stringify(err));
    });
    response.status(200).send(JSON.stringify(''));
  } else {
    response.status(400).send('Cannot logout if not logged in');
  }
});

// register a new user
app.post('/user', function(req, res) {
  if (req.body.login_name) {
    console.log('in the first if statement');
    User.findOne({ login_name: req.body.login_name })
      .then(result => {
        console.log(result);
        if (result === null) {
          throw new Error("can't find user");
        }
        console.log('found a user');
        res.status(400).send('user already exists');
      })
      .catch(() => {
        console.log("couldn't find user");
        if (
          req.body.first_name !== '' &&
          req.body.last_name !== '' &&
          req.body.password !== ''
        ) {
          console.log('got into if statement');
          User.create({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            location: req.body.location,
            description: req.body.description,
            occupation: req.body.occupation,
            login_name: req.body.login_name,
            password: req.body.password,
            lastAction: 'Registered as a user'
          })
            .then(result => {
              console.log('created user', result._id);
              result.save();
              let activity = {
              type: 'User registration',
              user_id: result._id
          };

          Activity.create(activity, function (err, activity) {
              if (err) {
                  console.log('Error creating new activity object.');
                  res.status(400).send(JSON.stringify(err));
                  return;
              }
              console.log('Successfully added new user registration activity.', activity);
              res.status(200).end('Successfully added new user registration activity.');
          });
              res.status(200).send('user saved');
            })
            .catch(() => {
              console.log('in catch statement');
              res.status(400).send('cannot create user');
            });
        } else {
          console.log('empty something');
          res.status(400).send('empty string');
        }
      });
  }
});


// add a new photo
app.post('/photos/new', function(req, res) {
  if (req.session.login_name && req.session.user_id) {
    processFormBody(req, res, function(err) {
      if (err || !req.file) {
        res.status(400).send(JSON.stringify(err));
        return;
      }


      var timestamp = new Date().valueOf();
      var filename = 'U' + String(timestamp) + req.file.originalname;
      var user_id = req.session.user_id;
      //var photo_id = req.params.photo_id;
      //var photo_id=req.session.photo_id;
    //  console.log ("HERE" + photo_id);
      User.findOne(
        { login_name: req.session.login_name },
        'first_name last_name id lastAction'
      )
        .then(result => {
          //console.log("logout", result);
          result.lastAction = filename;
          result.save();
          let activity = {
                    type: 'Photo upload',
                    user_id: user_id,
                    //additional_id: photo_id
                };

                Activity.create(activity, function (err, activity) {
                    if (err) {
                        console.log('Error creating new activity object.');
                        res.status(400).send(JSON.stringify(err));
                        return;
                    }
                    console.log('Successfully added new photo upload activity.', activity);
                    res.status(200).end('Successfully added new photo upload activity.');
                });

        })
        .catch(err => res.status(400).send(JSON.stringify(err)));
       console.log("neeti");
      fs.writeFile('./images/' + filename, req.file.buffer, function() {
        // XXX - Once you have the file written into your images directory under the name
        // filename you can create the Photo object in the database
        Photo.create(
          {
            file_name: filename,
            date_time: timestamp,
            user_id: req.session.user_id,
            comments: []
          },
          err => {
            if (err) {
              res.status(400).send(JSON.stringify(err));
            } else {
              res.status(200).end('photo saved');
            }
          }
        );
      });
    });
  }
});
//add new comment on a photo
app.post('/commentsOfPhoto/:photo_id', function(req, res) {
  if (req.session.login_name && req.session.user_id) {
    if (req.body.comment === '') {
      res.status(400).send('cannot send an empty comment');
      return;
    }
    User.findOne(
      { login_name: req.session.login_name },
      'first_name last_name id lastAction'
    )
      .then(result => {
        //console.log("logout", result);
        result.lastAction = 'Added a comment';
        result.save();

      }
    )
      .catch(err => res.status(400).send(JSON.stringify(err)));
    var photo_id = req.params.photo_id;
    Photo.findOne({ _id: photo_id }, 'comments')
      .then(photo => {
        let comment = {
          comment: req.body.comment, // The text of the comment.
          date_time: Date.now(), // The date and time when the comment was created.
          user_id: req.session.user_id
        };

        if (photo.comments.length) {
          photo.comments = photo.comments.concat([comment]);
        } else {
          photo.comments = [comment];
        }
        photo.save();

        let activity = {
                    type: 'New comment',
                    user_id: req.session.user_id,
                    additional_id: photo_id,
                };

                Activity.create(activity, function (err, activity) {
                    if (err) {
                        console.log('Error creating new activity object.');
                        res.status(400).send(JSON.stringify(err));
                        return;
                    }
                    console.log('Successfully added new comment activity.', activity);
                    res.status(200).end('Successfully added new comment activity.');
                });

        res.status(200).end('comment saved');

         //res.status(200).send('comment saved');
      })
      .catch(err => res.status(400).send(JSON.stringify(err)));

}
});
/**____________________________________________________________________________________________Project 8____________________________________________________________________________________________**/
app.post('/mentionsOfPhoto/:photo_id', function(request, response) {
  if (request.session.login_name && request.session.user_id) {
    let user = request.body.mentionUser;
    let photo = request.params.photo_id;

    User.findById(user, 'mentions')
      .then(user => {
        console.log(user);
        if (user.mentions.length) {
          user.mentions = user.mentions.concat([photo]);
        } else {
          user.mentions = [photo];
        }
        user
          .save()
          .then(() => {
            console.log('user saved', user);
            response.status(200).send('mention saved');
          })
          .catch(err => response.status(400).send(JSON.stringify(err)));
      })
      .catch(err => response.status(400).send(JSON.stringify(err)));
  }
});
// Used to store @mentions into the photo object
app.post('/photosOfUser/mentions', function(request, response) {
  if (!request.session.user_id) {
    response.status(401).send('User is not logged in');
    return;
  }
  var mentionedUsersIdArr = request.body.user_id_arr;
  var photoId = request.body.photoId;
  Photo.findOne({ _id: photoId }, function(err, photoInfo) {
    if (err) {
      console.error('Doing /photosOfUser/mentions error: ', err);
      response.status(400).send(JSON.stringify(err));
      return;
    }
    if (photoInfo === null || photoInfo === undefined) {
      console.log('Photos not found.');
      response.status(400).send('Not found');
      return;
    }

    for (var i = 0; i < mentionedUsersIdArr.length; i++) {
      if (!photoInfo.mentions.includes(mentionedUsersIdArr[i])) {
        photoInfo.mentions.push(mentionedUsersIdArr[i]);
      }
    }
    Photo.findOneAndUpdate(
      { _id: photoId },
      { mentions: photoInfo.mentions },
      { new: true },
      function(error) {
        if (error) {
          console.error('Adding mentions error: ', error);
          response.status(400).send(JSON.stringify(error));
          return;
        }
        response.status(200).send('Mention successfully registered.');
      }
    );
  });
});

// Used to return all the photo objects that @mentions a user
app.get('/userMentions/:id', function(request, response) {
  if (!request.session.user_id) {
    response.status(401).send('User is not logged in');
    return;
  }
  var user_id = request.params.id;
  Photo.find({}, function(err, photoInfo) {
    if (err) {
      console.error('Doing /userMentions/:id error: ', err);
      response.status(400).send(JSON.stringify(err));
      return;
    }
    if (photoInfo === null || photoInfo === undefined) {
      console.log('Photos not found.');
      response.status(400).send('Not found');
      return;
    }
    let mentionedPhotos = [];
    for (var i = 0; i < photoInfo.length; i++) {
      if (photoInfo[i].mentions.includes(user_id)) {
        mentionedPhotos.push({
          file_name: photoInfo[i].file_name,
          owner_id: photoInfo[i].user_id
        });
      }
    }


    function addOwnersName(mentionedPhotosFile, callback) {
      var ownerId = mentionedPhotosFile.owner_id;
      User.findOne({ _id: ownerId }, function(error, ownerInfo) {
        if (!error) {
          var ownerFirstName = ownerInfo.first_name;
          var ownerLastName = ownerInfo.last_name;
          mentionedPhotosFile.owner_name = ownerFirstName + ' ' + ownerLastName;
        }
        callback(error);
      });
    }

    function allDone(error) {
      if (error) {
        response.status(500).send(error);
      } else {
        response.status(200).send(mentionedPhotos);
      }
    }

    async.each(mentionedPhotos, addOwnersName, allDone);
  });
});

app.get('/getPhoto/:photo_id', function(request, response) {
  if (request.session.login_name && request.session.user_id) {
    let photo_id = request.params.photo_id;
    console.log('in mentions backend photo', photo_id);

    Photo.findById(photo_id, 'file_name user_id')
      .then(photo => {
        photo = JSON.parse(JSON.stringify(photo));
        User.findById(photo.user_id, 'first_name last_name')
          .then(user => {
            photo.first_name = user.first_name;
            photo.last_name = user.last_name;
            console.log('PHOTO', photo);
            response.status(200).send(JSON.stringify(photo));
          })
          .catch(err => console.error(err));
      })
      .catch(err => response.status(400).send(JSON.stringify(err)));
  }
});

/*
 *  check photo_id to logged in user's favorite array
 */
app.get('/favorites', function(request, response) {
  if (!request.session.user_id) {
    response.status(401).send('Current user is not logged in');
    return;
  }
  let user_id = request.session.user_id;
  User.findOne({ _id: user_id })
    .exec()
    .then(user => {
      if (user === null) {
        console.log('User with _id:' + user_id + ' not found.');
        response.status(400).send('Not found');
        return;
      }
      if (!user.favorites || user.favorites.length === 0) {
        response.status(200).send(user.favorites);
        return;
      }
      let favoriteList = [];
      async.each(
        user.favorites,
        function(photoId, done_callback) {
          Photo.findOne({ _id: photoId })
            .exec()
            .then(photo => {
              if (photo === null) {
                console.log('Photo with _id:' + photoId + ' not found.');
                response.status(400).send('Not found');
                return;
              }
              let newPhoto = JSON.parse(JSON.stringify(photo));
              delete newPhoto.comments;
              delete newPhoto.mentions;
              favoriteList.push(newPhoto);

              done_callback();
            })
            .catch(err => {
              console.error('find photo with _id ' + photoId + 'error:', err);
              response.status(500).send(JSON.stringify(err));
              done_callback(err);
            });
        },
        function(err) {
          if (err) {
            response.status(400).send(JSON.stringify(err));
            return;
          }
          response.status(200).send(favoriteList);
        }
      );

    })
    .catch(err => {
      console.error('Doing /favorites error:', err);
      response.status(500).send(err);
    });
});

/*
 *  add new photo_id to logged in user's favorite array
 */
app.post('/favorite/:photo_id', function(request, response) {
  if (!request.session.user_id) {
    response.status(401).send(' User is not logged in');
    return;
  }
  let photo_id = request.params.photo_id;
  let user_id = request.session.user_id;
  User.findOne({ _id: user_id })
    .exec()
    .then(user => {
      if (user === null) {
        console.log('User with _id:' + user_id + ' not found.');
        response.status(400).send('Not found');
        return;
      }
      if (user.favorites.indexOf(photo_id) !== -1) {
        response.status(400).send(`Add photo with _id: ${photo_id} twice`);
        return;
      }
      user.favorites.push(photo_id);
      user.save();

            let activity = {
                type: 'New like',
                user_id: user_id,
                additional_id: photo_id
            };

            Activity.create(activity, function (err, activity) {
                if (err) {
                    console.log('Error creating new activity object.');
                    response.status(400).send(JSON.stringify(err));
                    return;
                }
                console.log('Successfully added new like activity.', activity);
                response.status(200).end('Successfully added new like activity.');
            });

            //console.log('Successfully added like', newLike);
      response
        .status(200)
        .send('Add favorite photo to the logged in user successfully');
    })
    .catch(err => {
      console.error('Doing post /favorite/:photo_id error:', err);
      response.status(500).send(err);
    });
});

/*
 * delete current photo_id which is stored in logged in user's favorite array
 */
app.delete('/favorite/:photo_id', function(request, response) {
  if (!request.session.user_id) {
    response.status(401).send(' User is not logged in');
    return;
  }
  let photo_id = request.params.photo_id;
  let user_id = request.session.user_id;
  User.findOne({ _id: user_id })
    .exec()
    .then(user => {
      if (user === null) {
        console.log('User with _id:' + user_id + ' not found.');
        response.status(400).send('Not found');
        return;
      }
      let index = user.favorites.indexOf(photo_id);
      if (index === -1) {
        response.status(400).send(`No photo with _id: ${photo_id}`);
        return;
      }
      user.favorites.splice(index, 1);
      user.save();
      let activity = {
                      type: 'New unlike',
                      user_id: user_id,
                      additional_id: photo_id
                  };

                  Activity.create(activity, function (err, activity) {
                      if (err) {
                          console.log('Error creating new activity object.');
                          response.status(400).send(JSON.stringify(err));
                          return;
                      }
                      console.log('Successfully added new unlike activity.', activity);
                      response.status(200).end('Successfully added new unlike activity.');
                  });

                  console.log('Successfully unliked photo.');
      response
        .status(200)
        .send('Delete liked photo of logged in user successfully');
    })
    .catch(err => {
      console.error('Doing delete /favorite/:photo_id error:', err);
      response.status(500).send(err);
    });
});

// like and unlike end point
app.get(`/likeUnlike/:photo_id`, function(request, response) {
  if (!request.session.user_id) {
    response.status(401).send('User is not logged in');
    return;
  }
  let photo_id = request.params.photo_id;
  let curr_user_id = request.session.user_id;
  Photo.findOne({ _id: photo_id }, function(err, photo) {
    if (err) {
      response.status(400).send('invalid photo id');
      return;
    }

    let index_of_user = photo.liked_by.indexOf(curr_user_id);
    if (request.body.like) {
      //they are trying to like it.
      if (index_of_user >= 0) {
        //they already liked it.
        response.status(400).send('you already liked this photo');
        return;
      }
      photo.liked_by.push(curr_user_id);
    } else {
      //they are removing a like.
      if (index_of_user === -1) {
        response.status(400).send('You have not like this photo');
        return;
      }
      photo.liked_by.splice(index_of_user, 1);
    }
    photo.save();
    response.status(200).send();
  });
});

// Get Top User Photo
app.get('/TopUserPhoto/:id', function(request, response) {
  if (request.session.login_name && request.session.user_id) {
    let id = request.params.id;
    //console.log("in mentions backend photo", photo_id);

    Photo.find(
      { user_id: id },
      '_id user_id comments file_name date_time'
    ).then(
      photos => {
        let lastPhoto = photos[Object.keys(photos).length - 1];
        //last photo is an object
        response.status(200).send(JSON.stringify(lastPhoto));
        //console.log(typeof lastPhoto);
      },
      err => {
        if (err) {
          response.status(400).send(JSON.stringify(err));
        }
      }
    );
  } else {
    response.status(401).send('You are not logged in');
  }
});

// Get Top Comment

app.get('/TopComment/:id', function(request, response) {
  if (request.session.login_name && request.session.user_id) {
    let id = request.params.id;
    Photo.find(
      { user_id: id },
      '_id user_id comments file_name date_time'
    ).then(
      photos => {
        let topPhoto = photos[Object.keys(photos)[0]];
        let numComments = 0;
        Object.keys(photos).forEach(function(currKey) {
          let currPhoto = photos[currKey];
          if (currPhoto.comments.length > numComments) {
            topPhoto = currPhoto;
            numComments = currPhoto.comments.length;
            console.log('top photo', currPhoto.file_name);
          }
        });
        if (numComments === 0) {
          response.status(200).send(JSON.stringify({}));
        } else {
          response.status(200).send(JSON.stringify(topPhoto));
        }
      },
      err => {
        if (err) {
          response.status(400).send(JSON.stringify(err));
        }
      }
    );
  } else {
    response.status(401).send('You are not logged in');
  }
});
/*eslint-enable no-shadow*/
var server = app.listen(3000, function() {
  var port = server.address().port;
  console.log(
    'Listening at http://localhost:' +
      port +
      ' exporting the directory ' +
      __dirname
  );
});
