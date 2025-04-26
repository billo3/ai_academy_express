class Validator {
    constructor() {
      this.errors = [];
    }
    
    validate(req) {
      this.errors = [];
      
      // Validation du nom
      if (!req.body.name || req.body.name.trim() === '') {
        this.errors.push('Le nom est requis');
      } else if (req.body.name.length < 3) {
        this.errors.push('Le nom doit contenir au moins 3 caractères');
      }
      
      // Validation de l'email
      if (!req.body.email || req.body.email.trim() === '') {
        this.errors.push('L\'email est requis');
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(req.body.email)) {
          this.errors.push('Veuillez fournir une adresse email valide');
        }
      }
      
      // Validation du message
      if (req.body.message && req.body.message.length > 500) {
        this.errors.push('Le message ne doit pas dépasser 500 caractères');
      }
      
      return this.errors.length === 0;
    }
    
    getErrors() {
      return this.errors;
    }
  }
  
  module.exports = new Validator();