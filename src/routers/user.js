const express = require(`express`);
const multer = require(`multer`);
const sharp = require(`sharp`);
const sgMail = require(`@sendgrid/mail`);
const User = require(`../models/user`);
const auth = require(`../middleware/auth`);
const { sendWelcomeEmail, sendCancelEmail } = require(`../emails/account`);

const router = new express.Router();


router.post(`/users`, async (req, res) => {    // REST API route to create a new user
    const user = new User(req.body);

    try {
        await user.save();
        sendWelcomeEmail(user.email, user.name);
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    } catch(err) {
        res.status(400).send(err)
    }
});

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({ user, token });
    } catch (e) {
        res.status(400).send();
    }
});

// we need token to logout from the current session and we ensure that token with which sign up was allowed is used to logout. Therefore, the follwoing route as functionality
router.post(`/users/logout`, auth, async (req, res) => {
    try {
        // removing given item from tokens array and we will use filter method for that
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });
        await req.user.save();

        res.send();
    } catch (e) {
        res.status(500).send(); 
    }
});

router.post(`/users/logoutAll`, auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send();
    }
});

router.get(`/users/me`, auth, async (req, res) => {
    res.send(req.user);
});

/* router.get(`/user/:id`, async (req, res) => {
    const _id = req.params.id;

    try {
        const user = await User.findById(_id);
        
        if(!user) {
            return res.status(404).send();
        }

        res.send(user);
    } catch (err) {
        res.status(500).send(err);
    }
});
 */
router.patch(`/users/me`, auth, async (req, res) => {

    const updates = Object.keys(req.body);
    const allowedUpdates = [`name`, `email`, `password`, `age`];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if(!isValidOperation) {
        return res.status(400).send({ error: `Invalid request` });
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update]); 
        await req.user.save();
        res.send(req.user);
    } catch (err) {
        res.status(400).send(err);
    }
});

router.delete(`/users/me`, auth, async (req, res) => {
    try {
        await req.user.remove();
        sendCancelEmail(req.user.email, req.user.name);
        res.send(req.user);
    } catch (e) {
        res.status(500).send(e);
    }
});

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error(`file must be a jpg, jpeg or png file`));
        }

        cb(undefined, true);
    }
});

// setting url for uploading/creating and updating/reading files into database
router.post(`/users/me/avatar`, auth, upload.single(`avatar`), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({ err: error.message });
});

// setting url for deleting files from database
router.delete(`/users/me/avatar`, auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
});

// seeting url for getting/reading files from database 
router.get(`/users/:id/avatar`, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if(!user || !user.avatar) {
            throw new Error();
        }

        res.set(`Content-Type`, `image/png`);  // res.set() is used to set the headers; by default it sends (`Content-Type`, `application/json`) which is equal to res.send();
        res.send(user.avatar);

    } catch (e) {
        res.status(400).send();
    }
})

module.exports = router;