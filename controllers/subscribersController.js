const Subscriber = require("../models/subscriber");
const mongoose = require("mongoose");

exports.getAllSubscribers = (req, res, next) => {
  Subscriber.find({})
    .exec()
    .then(subscribers => {
      res.render("subscribers/index", {
        subscribers: subscribers
      });
    })
    .catch(error => {
      console.log(`Erreur lors de la récupération des abonnés: ${error.message}`);
      next(error);
    });
};

exports.getSubscriptionPage = (req, res) => {
  res.render("subscribers/new");
};

exports.saveSubscriber = (req, res) => {
  let newSubscriber = new Subscriber({
    name: req.body.name,
    email: req.body.email,
    zipCode: req.body.zipCode // Assurez-vous que le champ zipCode existe dans votre formulaire
  });
  newSubscriber.save()
    .then(result => {
      res.render("subscribers/thanks");
    })
    .catch(error => {
      if (error) res.send(error);
    });
};

exports.show = (req, res, next) => {
  let subscriberId = req.params.id;
  
  // Vérification si l'ID est un ObjectId valide
  if (!mongoose.Types.ObjectId.isValid(subscriberId)) {
    console.log(`ID invalide : ${subscriberId}`);
    return res.status(400).send('ID invalide');
  }

  Subscriber.findById(subscriberId)
    .then(subscriber => {
      if (!subscriber) {
        return res.status(404).send('Abonné non trouvé');
      }
      res.render("subscribers/show", {
        subscriber: subscriber
      });
    })
    .catch(error => {
      console.log(`Erreur lors de la récupération d'un abonné par ID: ${error.message}`);
      next(error);
    });
};


exports.search = (req, res, next) => {
  const { name, zipCode } = req.query;
  console.log('Recherche avec paramètres:', { name, zipCode });

  let query = {};

  if (name) {
    query.name = { $regex: name, $options: "i" };
  }
  if (zipCode) {
    query.zipCode = zipCode;
  }

  Subscriber.find(query)
    .then(subscribers => {
      console.log('Abonnés trouvés:', subscribers);
      res.render("subscribers/index", { subscribers });
    })
    .catch(error => {
      console.log(`Erreur lors de la recherche : ${error.message}`);
      next(error);
    });
};
