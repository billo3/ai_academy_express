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
  
  // Accueil
  exports.index = (req, res) => {
    res.render("index", { pageTitle: "Accueil" });
  };
  
  // À propos
  exports.about = (req, res) => {
    res.render("about", { pageTitle: "À propos" });
  };
  
  exports.courses = (req, res) => {
    let filteredCourses = [...courses];
  
    // Filtrer par niveau
    if (req.query.level) {
      filteredCourses = filteredCourses.filter(course => course.level === req.query.level);
    }
  
    // Filtrer par prix
    if (req.query.price) {
      filteredCourses = filteredCourses.filter(course => course.price <= parseInt(req.query.price));
    }
  
    res.render("courses", {
      pageTitle: "Nos Cours",
      courses: filteredCourses
    });
  };
  
  // Contact GET
  exports.getContact = (req, res) => {
    res.render("contact", { 
      pageTitle: "Contact",
      formData: {}, 
      messages: req.flash() 
    });
  };
  
  // FAQ
  exports.faq = (req, res) => {
    res.render("faq", { pageTitle: "FAQ" });
  };
  
  // Contact POST
  exports.processContact = (req, res) => {
    const { name, email, course, message } = req.body;

    // Validation des données
    const errors = [];
    if (!name || name.trim() === '') {
        errors.push("Le nom est obligatoire.");
    }
    if (!email || email.trim() === '') {
        errors.push("L'email est obligatoire.");
    } else {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            errors.push("Veuillez entrer une adresse email valide.");
        }
    }
    if (!course || course.trim() === '') {
        errors.push("Le choix du cours est obligatoire.");
    }
    if (!message || message.trim() === '') {
        errors.push("Le message est obligatoire.");
    }
    // Si des erreurs sont trouvées, renvoyer les erreurs et les données dans le formulaire
    if (errors.length > 0) {
        res.render("contact", {
            pageTitle: "Contact",
            errors: errors,
            formData: req.body
        });
    } else {
        // Sinon, afficher la page de remerciement avec les données du formulaire
        res.render("thanks", {
            pageTitle: "Merci",
            formData: req.body
        });
    }
};
