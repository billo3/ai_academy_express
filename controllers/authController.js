const User = require("../models/user"); 
const passport = require("passport"); 
const PasswordReset = require("../models/passwordReset");
const crypto = require("crypto");
const { sendPasswordResetEmail } = require("../utils/emailSender");
module.exports = { 
  // Affiche le formulaire de connexion 
  login: (req, res) => { 
    res.render("auth/login"); 
  }, 
   
  // Gère l'authentification des utilisateurs   
   authenticate: passport.authenticate("local", { 
    failureRedirect: "/login", 
    failureFlash: "Votre email ou mot de passe est incorrect.",     successRedirect: "/", 
    successFlash: "Vous êtes maintenant connecté!" 
  }), 
   
  // Déconnecte l'utilisateur  
  logout: (req, res, next) => {
    req.logout(function(err) {
      if (err) {
        return next(err);
      }
      req.flash("success", "Vous avez été déconnecté avec succès!");
      res.redirect("/");
    });
  }, 
   
  // Affiche le formulaire d'inscription  
   signup: (req, res) => { 
    res.render("auth/signup"); 
  }, 
   
  // Crée un nouvel utilisateur et l'authentifie  
   register: (req, res, next) => { 
    if (req.skip) return next(); 
     
    let newUser = new User({      
       name: { 
        first: req.body.first, 
        last: req.body.last 
      }, 
      email: req.body.email, 
      zipCode: req.body.zipCode,
      role: req.body.role || 'etudiant'
      
    }); 
     
    User.register(newUser, req.body.password, (error, user) => {     
        if (user) { 
        req.flash("success", `Le compte de ${user.fullName} a été créé avec succès!`);       
          res.locals.redirect = "/"; 
        next(); 
      } else { 
        req.flash("error", `Échec de la création du compte utilisateur: ${error.message}`);     
            res.locals.redirect = "/signup";     
                next(); 
      } 
    }); 
  }, 
   
  // Middleware pour vérifier si l'utilisateur est connecté   
  ensureLoggedIn: (req, res, next) => {   
      if (req.isAuthenticated()) { 
      next(); 
    } else { 
      req.flash("error", "Vous devez être connecté pour accéder à cette page.");     
        res.redirect("/login"); 
    } 
  },

// Affiche le formulaire de demande de réinitialisation
forgotPassword: (req, res) => {
  res.render("auth/forgot-password");
},

// Traite la demande de réinitialisation
requestPasswordReset: async (req, res) => {
  const { email } = req.body;
  
  // Vérifier si l'utilisateur existe
  const user = await User.findOne({ email });
  if (!user) {
    req.flash("error", "Aucun compte n'est associé à cet email");
    return res.redirect("/forgot-password");
  }
  
  // Supprimer tout token existant
  await PasswordReset.deleteMany({ email });
  
  // Créer un nouveau token
  const token = crypto.randomBytes(32).toString("hex");
  
  // Enregistrer le token dans la base de données
  const passwordReset = new PasswordReset({
    email,
    token
  });
  await passwordReset.save();
  
  // Envoyer l'email
  const emailSent = await sendPasswordResetEmail(email, token);
  
  if (emailSent) {
    req.flash("success", "Un email de réinitialisation a été envoyé à votre adresse");
  } else {
    req.flash("error", "Erreur lors de l'envoi de l'email. Veuillez réessayer");
  }
  
  res.redirect("/login");
},

// Affiche le formulaire de réinitialisation de mot de passe
resetPasswordForm: async (req, res) => {
  const { token } = req.params;
  
  // Vérifier si le token existe
  const passwordReset = await PasswordReset.findOne({ token });
  if (!passwordReset) {
    req.flash("error", "Le lien de réinitialisation est invalide ou a expiré");
    return res.redirect("/forgot-password");
  }
  
  res.render("auth/reset-password", { token });
},

// Traite la réinitialisation du mot de passe
resetPassword: async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;
  
  // Vérifier si les mots de passe correspondent
  if (password !== confirmPassword) {
    req.flash("error", "Les mots de passe ne correspondent pas");
    return res.redirect(`/reset-password/${token}`);
  }
  
  // Vérifier si le token existe
  const passwordReset = await PasswordReset.findOne({ token });
  if (!passwordReset) {
    req.flash("error", "Le lien de réinitialisation est invalide ou a expiré");
    return res.redirect("/forgot-password");
  }
  
  // Trouver l'utilisateur
  const user = await User.findOne({ email: passwordReset.email });
  if (!user) {
    req.flash("error", "Utilisateur non trouvé");
    return res.redirect("/forgot-password");
  }
  
  // Réinitialiser le mot de passe
  await user.setPassword(password);
  await user.save();
  
  // Supprimer le token
  await PasswordReset.deleteMany({ email: user.email });
  
  req.flash("success", "Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter");
  res.redirect("/login");
}

}; 
 
