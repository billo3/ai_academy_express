module.exports = {
  // L'utilisateur doit être connecté pour accéder à la page
  isTeacherOrAdmin: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash("error", "Vous devez être connecté pour accéder à cette page");
    res.redirect("/login");
  }

};