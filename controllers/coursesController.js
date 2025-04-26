const Course = require("../models/course"); 
const User = require("../models/user");
// Fonction utilitaire pour extraire les paramètres du cours du corps de la requête 
const getCourseParams = body => { 
  return {     title: body.title,     description: body.description, 
    maxStudents: body.maxStudents, 
    cost: body.cost 
  }; 
}; 
 
module.exports = {   index: (req, res, next) => { 
    Course.find({})       .then(courses => {         res.locals.courses = courses;         next(); 
      }) 
      .catch(error => { 
        console.log(`Erreur lors de la récupération des cours: ${error.message}`);         next(error); 
      }); 
  }, 
   
  indexView: (req, res) => { 
    res.render("courses/index"); 
  }, 
   
  new: (req, res) => {     res.render("courses/new"); 
  }, 
   
  create: (req, res, next) => { 
    let courseParams = getCourseParams(req.body); 
    Course.create(courseParams) 
      .then(course => { 
        res.locals.redirect = "/courses"; 
        res.locals.course = course;         next(); 
      }) 
      .catch(error => { 
        console.log(`Erreur lors de la création du cours: ${error.message}`);         res.locals.redirect = "/courses/new";         next(); 
      }); 
  }, 
   
  redirectView: (req, res, next) => {     let redirectPath = res.locals.redirect;     if (redirectPath) res.redirect(redirectPath);     else next(); 
  }, 
   
  show: (req, res, next) => {
    let courseId = req.params.id;
    Course.findById(courseId)
      .populate("students")
      .then(course => {
        // Récupérer tous les utilisateurs pour le formulaire d'inscription
        User.find({})
          .then(users => {
            res.locals.course = course;
            res.locals.users = users;
            next();
          })
          .catch(error => {
            console.log(`Erreur lors de la récupération des utilisateurs: ${error.message}`);
            next(error);
          });
      })
      .catch(error => {
        console.log(`Erreur lors de la récupération du cours par ID: ${error.message}`);
        next(error);
      });
  }, 
   
  showView: (req, res) => { 
    res.render("courses/show"); 
  }, 
   
  edit: (req, res, next) => {     let courseId = req.params.id; 
    Course.findById(courseId)       .then(course => {         res.render("courses/edit", { 
          course: course 
        }); 
      }) 
      .catch(error => { 
        console.log(`Erreur lors de la récupération du cours par ID: ${error.message}`);         next(error); 
      }); 
  }, 
   
  update: (req, res, next) => {     let courseId = req.params.id, 
      courseParams = getCourseParams(req.body); 
     
    Course.findByIdAndUpdate(courseId, { 
      $set: courseParams 
    }) 
      .then(course => { 
        res.locals.redirect = `/courses/${courseId}`;         res.locals.course = course;         next(); 
      }) 
      .catch(error => { 
        console.log(`Erreur lors de la mise à jour du cours par ID: ${error.message}`);         next(error); 
      }); 
  }, 
   
  delete: (req, res, next) => {     let courseId = req.params.id; 
    Course.findByIdAndDelete(courseId) 
      .then(() => { 
        res.locals.redirect = "/courses";         next(); 
      }) 
      .catch(error => { 
        console.log(`Erreur lors de la suppression du cours par ID: ${error.message}`);         next(); 
      }); 
  }, 

  enroll: (req, res, next) => {
    let courseId = req.params.id;
    let userId = req.body.userId; // L'ID de l'utilisateur qui s'inscrit
    
    if (!userId) {
      req.flash("error", "Veuillez spécifier un utilisateur pour l'inscription");
      res.locals.redirect = `/courses/${courseId}`;
      next();
      return;
    }
  
    Course.findById(courseId)
      .then(course => {
        if (course.students.includes(userId)) {
          req.flash("error", "L'utilisateur est déjà inscrit à ce cours");
        } else {
          course.students.push(userId);
          course.save();
          
          // Ajouter également ce cours à la liste des cours de l'utilisateur
          User.findById(userId)     
            .then(user => {
              user.courses.push(courseId);
              user.save();
            })
            .catch(error => {
              console.log(`Erreur lors de la mise à jour de l'utilisateur: ${error.message}`);
            });
          
          req.flash("success", "Inscription au cours réussie!");
        }
        res.locals.redirect = `/courses/${courseId}`;
        next();
      })
      .catch(error => {
        console.log(`Erreur lors de l'inscription au cours: ${error.message}`);
        next(error);
      });
  },
  search: (req, res, next) => {
    let searchTerm = req.query.q || "";
    let minCost = req.query.minCost !== undefined ? parseFloat(req.query.minCost) : 0;
    let maxCost = req.query.maxCost !== undefined ? parseFloat(req.query.maxCost) : Infinity;
    
    // Créer l'objet de requête pour la recherche
    let searchQuery = {};
    
    // Rechercher dans le titre ou la description si un terme de recherche est fourni
    if (searchTerm) {
      searchQuery["$or"] = [
        { title: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } }
      ];
    }
    
    // Filtrer par coût
    searchQuery.cost = { $gte: minCost };
    if (maxCost !== Infinity) {
      searchQuery.cost.$lte = maxCost;
    }
    
    Course.find(searchQuery)
      .then(courses => {
        res.locals.courses = courses;
        res.locals.searchTerm = searchTerm;
        res.locals.minCost = minCost;
        res.locals.maxCost = maxCost === Infinity ? "" : maxCost;
        next();
      })
      .catch(error => {
        console.log(`Erreur lors de la recherche de cours: ${error.message}`);
        next(error);
      });
  },
  
  searchView: (req, res) => {
    res.render("courses/search");
  }
}; 
 
