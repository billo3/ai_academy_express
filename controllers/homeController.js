// Données des cours (seront remplacées par une base de données plus tard)

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
};
exports.faq = (req, res) => {
    res.render("faq", { pageTitle: "FAQ" });
};

exports.processContact = (req, res) => {
    console.log("Données du formulaire reçues:");
    console.log(req.body);
    res.render("thanks", {
        pageTitle: "Merci",
        formData: req.body
    });

    // Redirection vers la page de remerciement pour l'exercice supplémentaire
    res.writeHead(302, { Location: '/thanks?success=true' });
    res.end();

};
