const { Query } = require("mongoose");
const Subscriber = require("../models/subscriber");
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
        zipCode: req.body.zipCode
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
// LAB 7
exports.delete = async (req, res) => {
    try {
        await Subscriber.findByIdAndDelete(req.params.id);
        res.redirect("/subscribers");
    }
    catch (error) {
        console.error("Erreur lors de la suppression de l'abonné:", error);
        res.status(500).send("Erreur lors de la suppression de l'abonné.");
    }
};

// Afficher le formulaire de modification
exports.edit = async (req, res) => {
    try {
        const subscriber = await Subscriber.findById(req.params.id);
        if (!subscriber) return res.status(404).send('Abonné non trouvé');
        res.render('subscribers/edit', { subscriber });
    } catch (err) {
        res.status(500).send('Erreur serveur');
    }
};
// Mettre à jour les données 
exports.update = async (req, res) => {
    try {
        const { name, email, zipcode } = req.body;
        await Subscriber.findByIdAndUpdate(req.params.id, { name, email, zipcode });
        res.redirect(`/subscribers/${req.params.id}`);
    } catch (err) {
        res.status(500).send('Erreur lors de la mise à jour');
    }
};

exports.search = async (req, res) => {
    const query = req.query.query;

    try {
        const results = await Subscriber.find({
            $or: [
                { name: new RegExp(query, 'i') },
                { zipCode: new RegExp(query, 'i') }
            ]
        });
        res.render('subscribers/index', {
            subscribers: results,
            message: `Résultats de la recherche pour "${query}"`
        });
    }
    catch (error) {
        res.status(500).send("Erreur lors de la recherche d'abonnés.");
    }
};