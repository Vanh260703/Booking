const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../app/models/User');

// Google Auth 
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_REDIRECT_URL
},
async (accessToken, refreshToken, profile, cb) => {
    try {
      // Tìm user theo google id
      console.log(profile);
      let user = await User.findOne({
        "federated_credentials.provider": "google",
        "federated_credentials.subject": profile.id
      });

      if (!user) {
        // Nếu chưa có thì tạo mới
        user = new User({
          name: profile.displayName,
          email: profile.emails?.[0]?.value,
          isVerify: profile.emails?.[0]?.verified || false,
          avatar: {
            url: profile.photos[0].value,
            publicId: profile.photos[0].value,
          },
          federated_credentials: [{
            provider: "google",
            subject: profile.id
          }]
        });
        await user.save();
      }
      return cb(null, user);
    } catch (err) {
      return cb(err);
    }
} 
));

// Facebook Auth
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: process.env.FACEBOOK_REDIRECT_URL,
  profileFields: ['id', 'displayName', 'emails', 'photos'],
}, 
async (accessToken, refreshToken, profile, cb) => {
  try {
    console.log(profile);
    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : profile.id;
    let user = await User.findOne({
      "federated_credentials.provider": "facebook",
      "federated_credentials.subject": profile.id
    });


    if (!user) {
      user = new User({
        name: profile.displayName,
        email,
        avatar: {
          url: profile.photos[0].value,
          publicId: profile.photos[0].value,
        },
        federated_credentials: [{
            provider: "facebook",
            subject: profile.id
          }]
      })
      await user.save();
    }
    return cb(null, user);
  } catch (err) {
    return cb(err);
  }
}
));


module.exports = passport; 