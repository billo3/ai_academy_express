module.exports = {
    // Vérifie si l'utilisateur a un rôle spécifique
    hasRole: (role) => {
      return (req, res, next) => {
        if (req.isAuthenticated() && req.user.role === role) {
          return next();
        }
        req.flash("error", "Vous n'avez pas les autorisations nécessaires pour accéder à cette page");
        res.redirect("/");
      };
    },
    
    // Vérifie si l'utilisateur est admin
    isAdmin: (req, res, next) => {
      if (req.isAuthenticated() && req.user.role === 'admin') {
        return next();
      }
      req.flash("error", "Accès réservé aux administrateurs");
      res.redirect("/");
    },
    
    // Vérifie si l'utilisateur est enseignant ou admin
    isTeacherOrAdmin: (req, res, next) => {
      if (req.isAuthenticated() && (req.user.role === 'enseignant' || req.user.role === 'admin')) {
        return next();
      }
      req.flash("error", "Accès réservé aux enseignants et administrateurs");
      res.redirect("/");
    }
  };