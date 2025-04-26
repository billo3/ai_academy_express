const { body, validationResult } = require('express-validator');

const userValidationRules = () => {
  return [
    // Validation du prénom
    body('first')
      .notEmpty().withMessage('Le prénom est requis')
      .isLength({ min: 2 }).withMessage('Le prénom doit contenir au moins 2 caractères'),
    
    // Validation du nom
    body('last')
      .notEmpty().withMessage('Le nom est requis')
      .isLength({ min: 2 }).withMessage('Le nom doit contenir au moins 2 caractères'),
    
    // Validation de l'email
    body('email')
      .notEmpty().withMessage('L\'email est requis')
      .isEmail().withMessage('Veuillez entrer un email valide')
      .normalizeEmail(),
    
    // Validation du code postal
    body('zipCode')
      .notEmpty().withMessage('Le code postal est requis')
      .isNumeric().withMessage('Le code postal doit contenir uniquement des chiffres')
      .isLength({ min: 5, max: 5 }).withMessage('Le code postal doit contenir exactement 5 chiffres'),
    
    // Validation du mot de passe
    body('password')
      .notEmpty().withMessage('Le mot de passe est requis')
      .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères')
      .matches(/[a-z]/).withMessage('Le mot de passe doit contenir au moins une lettre minuscule')
      .matches(/[A-Z]/).withMessage('Le mot de passe doit contenir au moins une lettre majuscule')
      .matches(/[0-9]/).withMessage('Le mot de passe doit contenir au moins un chiffre')
  ];
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  
  const extractedErrors = [];
  errors.array().map(err => extractedErrors.push(err.msg));
  
  req.flash('error', extractedErrors.join(' | '));
  return res.redirect('/signup');
};

module.exports = {
  userValidationRules,
  validate
};