const sgMail = require(`@sendgrid/mail`);

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: `muneebali500@gmail.com`,
        subject: `Welcome OnBoard`,
        text: `Welcome to the app ${name}. Tell us about your experience with us so far`
    });
};

const sendCancelEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: `muneebali500@gmail.com`,
        subject: `Why Cancelation Bro`,
        html: `<h2>Are you serious? What has made you do that ${name}? You broke my Heart 💔. Please let us know so we can be extra careful next time</h2>`
    });
}

module.exports = {
    sendWelcomeEmail,
    sendCancelEmail
}