const passport = require('passport');
const User = require('../models/user');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Configuration de la stratégie locale (email/mot de passe)
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  User.authenticate()
));

// Configuration de la stratégie Google OAuth
passport.use(new GoogleStrategy(
  {
    clientID: '74314597546-qlhhdtuvgqnjgtbkqo53t6p1ehhb7pnp.apps.googleusercontent.com',  // Remplacez par votre ID client Google
    clientSecret: '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',  // Remplacez par votre secret client Google
    callbackURL: 'http://localhost:3000/auth/google/callback',
    scope: ['profile', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Vérifier si l'utilisateur existe déjà
      let user = await User.findOne({ googleId: profile.id });
      
      if (user) {
        return done(null, user);
      }
      
      // Vérifier si l'email existe déjà
      user = await User.findOne({ email: profile.emails[0].value });
      
      if (user) {
        // Mettre à jour l'utilisateur existant avec l'ID Google
        user.googleId = profile.id;
        await user.save();
        return done(null, user);
      }
      
      // Créer un nouvel utilisateur
      const newUser = new User({
        name: {
          first: profile.name.givenName || '',
          last: profile.name.familyName || ''
        },
        email: profile.emails[0].value,
        googleId: profile.id,
        password: Math.random().toString(36).slice(-8),  // Mot de passe aléatoire
        role: 'etudiant'  // Rôle par défaut
      });
      
      await newUser.save();
      return done(null, newUser);
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

module.exports = passport;