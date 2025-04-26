const nodemailer = require("nodemailer");

// Configuration du transporteur d'emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'julcisse00@gmail.com', 
    pass: 'wismesegrptlvxmi'     
  }
});

module.exports = {
  sendPasswordResetEmail: async (email, token) => {
    const resetUrl = `http://localhost:3000/reset-password/${token}`;
    
    const mailOptions = {
      from: 'AI Academy <votre-email@gmail.com>',
      to: email,
      subject: 'Réinitialisation de votre mot de passe',
      html: `
        <h1>Réinitialisation de mot de passe</h1>
        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
        <p>Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe :</p>
        <a href="${resetUrl}">Réinitialiser mon mot de passe</a>
        <p>Ce lien expirera dans 1 heure.</p>
        <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.</p>
      `
    };
    
    try {
      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error("Erreur d'envoi d'email:", error);
      return false;
    }
  }
};