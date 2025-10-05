const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../app/models/User');

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
          email_verified: profile.emails?.[0]?.verified || false,
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


module.exports = passport; 