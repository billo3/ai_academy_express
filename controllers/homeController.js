const validator = require("../utils/validator");

const courses = [
    {
        title: "Introduction à l'IA",
        description: "Découvrez les fondamentaux de l'intelligence artificielle.",
        price: 199,
        level: "Débutant"
    },
    {
        title: "Machine Learning Fondamental",
        description: "Apprenez les principes du machine learning et les algorithmes de base.",
        price: 299,
        level: "Intermédiaire"
    },
    {
        title: "Deep Learning Avancé",
        description: "Maîtrisez les réseaux de neurones profonds et leurs applications.",
        price: 399,
        level: "Avancé"
    }
];
exports.index = (req, res) => {
    res.render("index", { pageTitle: "Accueil" });
};
exports.about = (req, res) => {
    res.render("about", { pageTitle: "À propos" });
};
exports.courses = (req, res) => {
    res.render("courses", {
        pageTitle: "Nos Cours",
        courses: courses
    });
};
exports.contact = (req, res) => {
    res.render("contact", { pageTitle: "Contact" });
}
exports.contact = (req, res) => {
  res.render('contact', {
    title: 'Contact',
    formData: {} // Add this line to provide an empty formData object
  });
};

exports.processContact = (req, res) => {
    console.log("Données du formulaire reçues:");
    console.log(req.body);
    
  // Validation du formulaire
  if (!validator.validate(req)) {
    const errors = validator.getErrors();
    req.flash("error", errors.join('. '));
    return res.redirect("/contact");
  }

    
    // Message de succès
    req.flash("success", "Votre message a été envoyé avec succès !");
    
    res.render("thanks", {
      pageTitle: "Merci",
      formData: req.body
    });
  };
exports.faq = (req, res) => {
    res.render("faq", { pageTitle: "FAQ" });
  };
