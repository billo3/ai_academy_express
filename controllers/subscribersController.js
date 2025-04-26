const Subscriber = require("../models/subscriber"); 
 
exports.getAllSubscribers = (req, res, next) => { 
  Subscriber.find({}) 
    .exec() 
    .then(subscribers => {       res.render("subscribers/index", { 
        subscribers: subscribers 
      }); 
    }) 
    .catch(error => { 
      console.log(`Erreur lors de la récupération des abonnés: ${error.message}`);       next(error); 
    }); 
}; 
 
exports.getSubscriptionPage = (req, res) => {   res.render("subscribers/new"); 
}; 
 
exports.saveSubscriber = (req, res) => {
    let newSubscriber = new Subscriber({
      name: req.body.name,
      email: req.body.email,
      zipCode: req.body.zipCode
    });
    
    newSubscriber.save()
      .then(result => {
        req.flash("success", "Inscription réussie!");
        res.redirect("/subscribers/thanks");
      })
      .catch(error => {
        if (error.name === 'ValidationError') {
          res.render("subscribers/new", {
            errors: Object.values(error.errors).map(e => ({ msg: e.message })),
            subscriber: req.body
          });
        } else if (error.code === 11000) {
          res.render("subscribers/new", {
            errors: [{ msg: "Cet email est déjà utilisé" }],
            subscriber: req.body
          });
        } else {
          next(error);
        }
      });
  };
 
exports.show = (req, res, next) => {let subscriberId = req.params.id;   
    Subscriber.findById(subscriberId) 
    .then(subscriber => {       res.render("subscribers/show", {subscriber: subscriber 
      }); 
    }) 
    .catch(error => { 
      console.log(`Erreur lors de la récupération d'un abonné par ID: ${error.message}`);      
       next(error); 
    }); 
};

exports.deleteSubscriber = (req, res, next) => {
    let subscriberId = req.params.id;
    Subscriber.findByIdAndDelete(subscriberId)
      .then(() => {
        req.flash("success", "Abonné supprimé avec succès");
        res.redirect("/subscribers");
      })
      .catch(error => {
        console.log(`Erreur lors de la suppression: ${error.message}`);
        next(error);
      });
  };

  exports.edit = (req, res, next) => {
    let subscriberId = req.params.id;
    Subscriber.findById(subscriberId)
      .then(subscriber => {
        res.render("subscribers/edit", { subscriber: subscriber });
      })
      .catch(error => {
        console.log(`Erreur: ${error.message}`);
        next(error);
      });
  };
  
  exports.update = (req, res, next) => {
    let subscriberId = req.params.id;
    let subscriberParams = {
      name: req.body.name,
      email: req.body.email,
      zipCode: req.body.zipCode
    };
    
    Subscriber.findByIdAndUpdate(subscriberId, { $set: subscriberParams })
      .then(subscriber => {
        req.flash("success", "Abonné mis à jour avec succès");
        res.redirect(`/subscribers/${subscriberId}`);
      })
      .catch(error => {
        console.log(`Erreur lors de la mise à jour: ${error.message}`);
        next(error);
      });
  };

  exports.search = (req, res, next) => {
    let searchTerm = req.query.q;
    
    // Si searchTerm est vide, redirigez vers la liste complète
    if (!searchTerm) {
      return res.redirect("/subscribers");
    }
    
    // Préparez votre recherche pour les noms (insensible à la casse)
    let searchRegex = new RegExp(searchTerm, 'i');
    
    // Préparez la condition de recherche
    let searchCondition = { 
      $or: [
        { name: searchRegex }
      ] 
    };
    
    // Si searchTerm est un nombre, ajoutez-le à la recherche de zipCode
    if (!isNaN(searchTerm)) {
      searchCondition.$or.push({ zipCode: searchTerm });
    }
    
    Subscriber.find(searchCondition)
      .exec()
      .then(subscribers => {
        res.render("subscribers/index", { 
          subscribers: subscribers,
          searchTerm: searchTerm,
          pageTitle: "Résultats de recherche"
        });
      })
      .catch(error => {
        console.log(`Erreur lors de la recherche: ${error.message}`);
        next(error);
      });
  };