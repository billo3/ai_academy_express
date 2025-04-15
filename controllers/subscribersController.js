const Subscriber = require("../models/subscriber");

// Récupérer tous les abonnés
exports.getAllSubscribers = async (req, res) => {
  try {
    const subscribers = await Subscriber.find();
    res.render("subscribers", { subscribers });
  } catch (err) {
    console.error("Erreur lors de l'affichage des abonnés:", err);
    res.status(500).send("Erreur interne");
  }
};

// Afficher la page d'abonnement
exports.getSubscriptionPage = (req, res) => {
  res.render("subscribers/new");
};

// Enregistrer un nouvel abonné
exports.saveSubscriber = async (req, res) => {
  const { name, email, zipCode } = req.body;

  if (!name || !email || !zipCode) {
    return res.render("subscribers/new", {
      message: "Tous les champs sont requis.",
      subscriber: req.body
    });
  }

  const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  if (!emailRegex.test(email)) {
    return res.render("subscribers/new", {
      message: "L'email doit être valide.",
      subscriber: req.body
    });
  }

  const postalCodeRegex = /^[0-9]{5}$/;
  if (!postalCodeRegex.test(zipCode)) {
    return res.render("subscribers/new", {
      message: "Le code postal doit comporter 5 chiffres.",
      subscriber: req.body
    });
  }

  try {
    const newSubscriber = new Subscriber({
      name,
      email,
      postalCode: zipCode
    });

    await newSubscriber.save();
    res.render("thanks", { subscriber: newSubscriber });
  } catch (error) {
    console.error("Erreur lors de la sauvegarde :", error);
    res.status(500).send("Erreur lors de l'enregistrement de l'abonné");
  }
};

// Afficher un abonné spécifique par ID
exports.show = (req, res, next) => {
  const subscriberId = req.params.id;
  Subscriber.findById(subscriberId)
    .then(subscriber => {
      res.render("subscribers/show", {
        subscriber: subscriber
      });
    })
    .catch(error => {
      console.log(`Erreur lors de la récupération d'un abonné par ID: ${error.message}`);
      next(error);
    });
};

// Supprimer un abonné
exports.delete = async (req, res) => {
  try {
    await Subscriber.findByIdAndDelete(req.params.id);
    res.redirect("/subscribers");
  } catch (error) {
    console.error("Erreur lors de la suppression de l'abonné:", error);
    res.status(500).send("Erreur lors de la suppression de l'abonné");
  }
};

// Afficher le formulaire d'édition
exports.edit = async (req, res) => {
  try {
    const subscriber = await Subscriber.findById(req.params.id);
    if (!subscriber) {
      return res.status(404).send("Abonné non trouvé");
    }
    res.render("subscribers/edit", { subscriber });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'abonné:", error);
    res.status(500).send("Erreur lors de la récupération de l'abonné");
  }
};

// Mettre à jour les informations d'un abonné
exports.update = async (req, res) => {
  const { name, email, postalCode } = req.body;

  try {
    const subscriber = await Subscriber.findByIdAndUpdate(
      req.params.id,
      { name, email, postalCode },
      { new: true }
    );
    res.redirect(`/subscribers/${subscriber._id}`);
  } catch (err) {
    console.error("Erreur lors de la mise à jour de l'abonné:", err);
    res.status(500).send("Erreur lors de la mise à jour de l'abonné");
  }
};

// Recherche d'abonnés par nom ou code postal
exports.search = async (req, res) => {
  const query = req.query.query;

  try {
    const results = await Subscriber.find({
      $or: [
        { name: new RegExp(query, "i") },
        { postalCode: new RegExp(query, "i") }
      ]
    });

    res.render("subscribers/index", {
      subscribers: results,
      message: `Résultats pour : "${query}"`
    });
  } catch (err) {
    console.error("Erreur lors de la recherche des abonnés:", err);
    res.status(500).send("Erreur de recherche");
  }
};
