const User = require("../models/user");
const mongoose = require("mongoose");
const jsonWebToken = require("jsonwebtoken");

// Clé secrète pour le token, à définir dans ton fichier .env
const token_key = process.env.TOKEN_SECRET || "cléSecrèteParDéfaut";

// Fonction utilitaire pour extraire les paramètres utilisateur du corps de la requête
const getUserParams = body => {
  return {
    name: {
      first: body.first,
      last: body.last
    },
    email: body.email,
    password: body.password,
    zipCode: body.zipCode
  };
};

module.exports = {
  index: (req, res, next) => {
    User.find({})
      .then(users => {
        res.locals.users = users;
        next();
      })
      .catch(error => {
        console.log(`Erreur lors de la récupération des utilisateurs: ${error.message}`);
        next(error);
      });
  },

  indexView: (req, res) => {
    res.render("users/index");
  },

  new: (req, res) => {
    res.render("users/new");
  },

  create: (req, res, next) => {
    let userParams = getUserParams(req.body);
    User.create(userParams)
      .then(user => {
        res.locals.redirect = "/users";
        res.locals.user = user;
        next();
      })
      .catch(error => {
        console.log(`Erreur lors de la création de l'utilisateur: ${error.message}`);
        res.locals.redirect = "/users/new";
        next();
      });
  },

  redirectView: (req, res, next) => {
    let redirectPath = res.locals.redirect;
    if (redirectPath) res.redirect(redirectPath);
    else next();
  },

  show: (req, res, next) => {
    let userId = req.params.id;

    // Vérification de la validité de l'ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log("ID invalide détecté :", userId);
      return res.status(400).send("ID utilisateur invalide.");
    }

    User.findById(userId)
      .populate("courses")
      .populate("subscribedAccount")
      .then(user => {
        if (!user) {
          return res.status(404).send("Utilisateur non trouvé.");
        }
        res.locals.user = user;
        next();
      })
      .catch(error => {
        console.log(`Erreur lors de la récupération de l'utilisateur par ID: ${error.message}`);
        next(error);
      });
  },

  showView: (req, res) => {
    res.render("users/show");
  },

  edit: (req, res, next) => {
    let userId = req.params.id;

    User.findById(userId)
      .then(user => {
        res.render("users/edit", {
          user: user
        });
      })
      .catch(error => {
        console.log(`Erreur lors de la récupération de l'utilisateur par ID: ${error.message}`);
        next(error);
      });
  },

  update: (req, res, next) => {
    let userId = req.params.id,
      userParams = getUserParams(req.body);

    User.findByIdAndUpdate(userId, {
      $set: userParams
    })
      .then(user => {
        res.locals.redirect = `/users/${userId}`;
        res.locals.user = user;
        next();
      })
      .catch(error => {
        console.log(`Erreur lors de la mise à jour de l'utilisateur par ID: ${error.message}`);
        next(error);
      });
  },

  delete: (req, res, next) => {
    let userId = req.params.id;

    User.findByIdAndDelete(userId)
      .then(() => {
        res.locals.redirect = "/users";
        next();
      })
      .catch(error => {
        console.log(`Erreur lors de la suppression de l'utilisateur par ID: ${error.message}`);
        next(error);
      });
  },

  getApiToken: (req, res) => {
    if (req.user) {
      // Vérifier si un token est passé en paramètre de requête
      let token = req.query.token;

      // Si aucun token n'est fourni, en générer un nouveau
      if (!token) {
        token = jsonWebToken.sign(
          {
            data: req.user._id,
            exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 jours en secondes
          },
          token_key
        );
      }

      res.render("users/api-token", {
        token: token,
        currentUser: req.user
      });
    } else {
      req.flash("error", "Vous devez être connecté pour obtenir un token API.");
      res.redirect("/login");
    }
  }
};
