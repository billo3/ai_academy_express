// controllers/ContactController.js

exports.getcontact = (req, res) => {
    const messages = req.flash("success");
    res.render("contact", {
        pageTitle: "Contact",
        FormData: {},
        messages: req.flash(),
    });
};

exports.processContact = (req, res) => {
    console.log("Formulaire de contact soumis :", req.body);

    // Ici, tu peux ajouter une logique de validation ou d'enregistrement si besoin

    // Message flash pour confirmation
    req.flash("success", "Votre message a été envoyé avec succès !");

    // Redirection vers la page contact avec message flash
    res.redirect("/contact");
};

exports.faq = (req, res) => {
    res.render("faq", { pageTitle: "FAQ" });
};

exports.thanks = (req, res) => {
    res.render("thanks", { pageTitle: "Merci" });
};
res.render("contact", {
    pageTitle: "Contact",
    messages: req.flash("success"),
    errors: req.flash("error")
});
