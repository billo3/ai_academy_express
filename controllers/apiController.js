const User = require("../models/user");
const Course = require("../models/course");
const Subscriber = require("../models/subscriber");
const RevokedToken = require("../models/revokedToken"); // Nouveau modèle à créer
const httpStatus = require("http-status-codes");
const jsonWebToken = require("jsonwebtoken");
const passport = require("passport");
const { body, validationResult } = require('express-validator');
require('dotenv').config();

// Clé secrète pour signer les tokens JWT
const token_key = process.env.TOKEN_KEY || "secretTokenKey";

module.exports = {
  // Middleware pour vérifier les tokens JWT
  verifyToken: (req, res, next) => {
    // Ignorer la vérification pour la route login
    if (req.path === "/login" || req.path === "/documentation") return next();
    
    // Vérifier la présence d'un token
    let token = req.query.apiToken || req.headers.authorization;
    if (token) {
      if (token.startsWith("Bearer ")) {
        token = token.slice(7);
      }
      
      // Vérifier si le token a été révoqué
      RevokedToken.findOne({ token: token })
        .then(revoked => {
          if (revoked) {
            return res.status(httpStatus.UNAUTHORIZED).json({
              error: true,
              message: "Ce token a été révoqué"
            });
          }
          
          // Vérifier la validité du token
          jsonWebToken.verify(token, token_key, (errors, payload) => {
            if (payload) {
              User.findById(payload.data).then(user => {
                if (user) {
                  req.user = user; // Ajouter l'utilisateur à la requête
                  next();
                } else {
                  res.status(httpStatus.FORBIDDEN).json({
                    error: true,
                    message: "Aucun compte utilisateur trouvé."
                  });
                }
              });
            } else {
              res.status(httpStatus.UNAUTHORIZED).json({
                error: true,
                message: "Impossible de vérifier le token API."
              });
            }
          });
        })
        .catch(error => {
          res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            error: true,
            message: "Erreur lors de la vérification du token."
          });
        });
    } else {
      res.status(httpStatus.UNAUTHORIZED).json({
        error: true,
        message: "Un token API est requis pour cette route."
      });
    }
  },
  
  // Authentification API
  apiAuthenticate: (req, res, next) => {
    passport.authenticate("local", (errors, user) => {
      if (user) {
        // Générer un token JWT valable pour 24h
        let signedToken = jsonWebToken.sign(
          {
            data: user._id,
            exp: new Date().setDate(new Date().getDate() + 1)
          },
          token_key
        );
        res.json({
          success: true,
          token: signedToken,
          user: {
            id: user._id,
            name: user.fullName,
            email: user.email
          }
        });
      } else {
        res.status(httpStatus.UNAUTHORIZED).json({
          success: false,
          message: "Impossible d'authentifier l'utilisateur."
        });
      }
    })(req, res, next);
  },
  
  // Rafraîchir le token d'un utilisateur
  refreshToken: (req, res) => {
    if (req.user) {
      let signedToken = jsonWebToken.sign(
        {
          data: req.user._id,
          exp: new Date().setDate(new Date().getDate() + 30)
        },
        token_key
      );
      res.redirect("/users/api-token?token=" + signedToken);
    } else {
      res.status(httpStatus.UNAUTHORIZED).json({
        error: true,
        message: "Authentification requise"
      });
    }
  },
  
  // Révoquer un token API
  revokeToken: (req, res) => {
    const token = req.body.token;
    if (!token) {
      return res.status(httpStatus.BAD_REQUEST).json({
        error: true,
        message: "Token requis"
      });
    }
    
    // Décoder le token pour obtenir sa date d'expiration
    try {
      const decoded = jsonWebToken.decode(token);
      const expireAt = new Date(decoded.exp * 1000);
      
      // Ajouter le token à la liste des tokens révoqués
      RevokedToken.create({ token, expireAt })
        .then(() => {
          res.json({
            success: true,
            message: "Token révoqué avec succès"
          });
        })
        .catch(error => {
          res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            error: true,
            message: "Erreur lors de la révocation du token"
          });
        });
    } catch (error) {
      res.status(httpStatus.BAD_REQUEST).json({
        error: true,
        message: "Token invalide"
      });
    }
  },
  
  // Réponses JSON standard
  respondJSON: (req, res) => {
    res.json({
      status: httpStatus.OK,
      data: res.locals
    });
  },
  
  // Gestion des erreurs pour l'API
  errorJSON: (error, req, res, next) => {
    let errorObject;
    if (error) {
      errorObject = {
        status: error.status || httpStatus.INTERNAL_SERVER_ERROR,
        message: error.message
      };
    } else {
      errorObject = {
        status: httpStatus.INTERNAL_SERVER_ERROR,
        message: "Erreur inconnue."
      };
    }
    res.status(errorObject.status).json(errorObject);
  },
  
  // Validation pour les paramètres utilisateur
  validateUserParams: [
    body('email').isEmail().withMessage('Email invalide'),
    body('password').isLength({ min: 8 }).withMessage('Le mot de passe doit avoir au moins 8 caractères'),
    body('zipCode').isPostalCode('any').withMessage('Code postal invalide'),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(httpStatus.BAD_REQUEST).json({ errors: errors.array() });
      }
      next();
    }
  ],
  
  // Validation pour les paramètres de cours
  validateCourseParams: [
    body('title').notEmpty().withMessage('Le titre est requis'),
    body('description').notEmpty().withMessage('La description est requise'),
    body('maxStudents').isInt({ min: 1 }).withMessage('Le nombre maximum d\'étudiants doit être un entier positif'),
    body('cost').isFloat({ min: 0 }).withMessage('Le coût doit être un nombre positif'),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(httpStatus.BAD_REQUEST).json({ errors: errors.array() });
      }
      next();
    }
  ],
  
  // Validation pour les paramètres d'abonné
  validateSubscriberParams: [
    body('name').notEmpty().withMessage('Le nom est requis'),
    body('email').isEmail().withMessage('Email invalide'),
    body('zipCode').isPostalCode('any').withMessage('Code postal invalide'),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(httpStatus.BAD_REQUEST).json({ errors: errors.array() });
      }
      next();
    }
  ],
  
  // Utilisateurs
  getAllUsers: (req, res, next) => {
    User.find({})
      .select("-password") // Ne pas renvoyer les hash de mot de passe
      .then(users => {
        res.locals.users = users;
        next();
      })
      .catch(error => {
        next(error);
      });
  },
  
  getUserById: (req, res, next) => {
    User.findById(req.params.id)
      .select("-password")
      .then(user => {
        if (user) {
          res.locals.user = user;
          next();
        } else {
          res.status(httpStatus.NOT_FOUND).json({
            error: true,
            message: "Utilisateur non trouvé"
          });
        }
      })
      .catch(error => {
        next(error);
      });
  },
  
  createUser: (req, res, next) => {
    let userParams = {
      name: {
        first: req.body.first,
        last: req.body.last
      },
      email: req.body.email,
      password: req.body.password,
      zipCode: req.body.zipCode
    };
    
    User.register(new User(userParams), req.body.password)
      .then(user => {
        res.locals.user = user;
        res.locals.success = true;
        res.status(httpStatus.CREATED);
        next();
      })
      .catch(error => {
        next(error);
      });
  },
  
  updateUser: (req, res, next) => {
    let userId = req.params.id;
    let userParams = {
      name: {
        first: req.body.first,
        last: req.body.last
      },
      email: req.body.email,
      zipCode: req.body.zipCode
    };
    
    User.findByIdAndUpdate(userId, { $set: userParams }, { new: true, runValidators: true })
      .then(user => {
        if (user) {
          res.locals.user = user;
          res.locals.success = true;
          next();
        } else {
          res.status(httpStatus.NOT_FOUND).json({
            error: true,
            message: "Utilisateur non trouvé"
          });
        }
      })
      .catch(error => {
        next(error);
      });
  },
  
  deleteUser: (req, res, next) => {
    let userId = req.params.id;
    User.findByIdAndRemove(userId)
      .then(user => {
        if (user) {
          res.locals.success = true;
          next();
        } else {
          res.status(httpStatus.NOT_FOUND).json({
            error: true,
            message: "Utilisateur non trouvé"
          });
        }
      })
      .catch(error => {
        next(error);
      });
  },
  
  // Cours
  getAllCourses: (req, res, next) => {
    Course.find({})
      .then(courses => {
        res.locals.courses = courses;
        next();
      })
      .catch(error => {
        next(error);
      });
  },
  
  getCourseById: (req, res, next) => {
    Course.findById(req.params.id)
      .then(course => {
        if (course) {
          res.locals.course = course;
          next();
        } else {
          res.status(httpStatus.NOT_FOUND).json({
            error: true,
            message: "Cours non trouvé"
          });
        }
      })
      .catch(error => {
        next(error);
      });
  },
  
  createCourse: (req, res, next) => {
    let courseParams = {
      title: req.body.title,
      description: req.body.description,
      maxStudents: req.body.maxStudents,
      cost: req.body.cost
    };
    
    Course.create(courseParams)
      .then(course => {
        res.locals.course = course;
        res.locals.success = true;
        res.status(httpStatus.CREATED);
        next();
      })
      .catch(error => {
        next(error);
      });
  },
  
  updateCourse: (req, res, next) => {
    let courseId = req.params.id;
    let courseParams = {
      title: req.body.title,
      description: req.body.description,
      maxStudents: req.body.maxStudents,
      cost: req.body.cost
    };
    
    Course.findByIdAndUpdate(courseId, { $set: courseParams }, { new: true, runValidators: true })
      .then(course => {
        if (course) {
          res.locals.course = course;
          res.locals.success = true;
          next();
        } else {
          res.status(httpStatus.NOT_FOUND).json({
            error: true,
            message: "Cours non trouvé"
          });
        }
      })
      .catch(error => {
        next(error);
      });
  },
  
  deleteCourse: (req, res, next) => {
    let courseId = req.params.id;
    Course.findByIdAndRemove(courseId)
      .then(course => {
        if (course) {
          res.locals.success = true;
          next();
        } else {
          res.status(httpStatus.NOT_FOUND).json({
            error: true,
            message: "Cours non trouvé"
          });
        }
      })
      .catch(error => {
        next(error);
      });
  },
  
  // Abonnés
  getAllSubscribers: (req, res, next) => {
    Subscriber.find({})
      .then(subscribers => {
        res.locals.subscribers = subscribers;
        next();
      })
      .catch(error => {
        next(error);
      });
  },
  
  getSubscriberById: (req, res, next) => {
    Subscriber.findById(req.params.id)
      .then(subscriber => {
        if (subscriber) {
          res.locals.subscriber = subscriber;
          next();
        } else {
          res.status(httpStatus.NOT_FOUND).json({
            error: true,
            message: "Abonné non trouvé"
          });
        }
      })
      .catch(error => {
        next(error);
      });
  },
  
  createSubscriber: (req, res, next) => {
    let subscriberParams = {
      name: req.body.name,
      email: req.body.email,
      zipCode: req.body.zipCode
    };
    
    Subscriber.create(subscriberParams)
      .then(subscriber => {
        res.locals.subscriber = subscriber;
        res.locals.success = true;
        res.status(httpStatus.CREATED);
        next();
      })
      .catch(error => {
        next(error);
      });
  },
  
  updateSubscriber: (req, res, next) => {
    let subscriberId = req.params.id;
    let subscriberParams = {
      name: req.body.name,
      email: req.body.email,
      zipCode: req.body.zipCode
    };
    
    Subscriber.findByIdAndUpdate(subscriberId, { $set: subscriberParams }, { new: true, runValidators: true })
      .then(subscriber => {
        if (subscriber) {
          res.locals.subscriber = subscriber;
          res.locals.success = true;
          next();
        } else {
          res.status(httpStatus.NOT_FOUND).json({
            error: true,
            message: "Abonné non trouvé"
          });
        }
      })
      .catch(error => {
        next(error);
      });
  },
  
  deleteSubscriber: (req, res, next) => {
    let subscriberId = req.params.id;
    Subscriber.findByIdAndRemove(subscriberId)
      .then(subscriber => {
        if (subscriber) {
          res.locals.success = true;
          next();
        } else {
          res.status(httpStatus.NOT_FOUND).json({
            error: true,
            message: "Abonné non trouvé"
          });
        }
      })
      .catch(error => {
        next(error);
      });
  }
};