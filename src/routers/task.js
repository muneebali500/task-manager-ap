const express = require(`express`);
const Task = require(`../models/task`);
const auth = require(`../middleware/auth`);
const router = new express.Router();

router.post(`/tasks`, auth, async (req, res) => {
   // const task = new Task(req.body);

    const task = new Task({
        ...req.body,
        owner: req.user._id
    });

    try {
        await task.save();
        res.status(201).send(task);
    } catch(err) {
        res.status(400).send(err);
    }
});


// GET /tasks?completed=true
// GET /tasks?limit=10&skip=20
// GET /tasks?sortBy=createdAt:desc
router.get(`/tasks`, auth, async (req, res) => {
    const match = {}
    const sort = {}

    // check if completed query was provided and take action accordingly
    if(req.query.completed) {
        match.completed = req.query.completed === `true`; // provide a boolan value to match
    }

    // check if sortBy query was provided and take action accordingly
    if(req.query.sortBy) {
         const parts = req.query.sortBy.split(`:`);
         sort[parts[0]] = parts[1] === `desc` ? -1 : 1; 
    }

    try {
        //const tasks = await Task.find({ owner: req.user._id });
        await req.user.populate({
            path: `tasks`,
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();

        res.send(req.user.tasks);
    } catch (err) {
        res.status(500).send(err);
    }
});

router.get(`/task/:id`, auth, async (req, res) => {
    const _id = req.params.id; 

    try {
        //const task = await Task.findById(_id); 
        const task = await Task.findOne({ _id, owner: req.user._id });

        if(!task) {
            return res.status(404).send();
        }

        res.send(task);
    } catch(err) {
        res.status(500).send(err);
    }
});

router.patch(`/tasks/:id`, auth, async (req, res) => {

    const updates = Object.keys(req.body); //will return an array of boject properties 
    const allowedUpdates = [`description`, `completed`];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update)); 
    // every() is an array method which will return us true or false

    if(!isValidOperation) {
        return res.status(400).send({ error: `Invalid request` });
    }

    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
        
        if(!task) {
            return res.status(404).send();
        }
        
        updates.forEach((update) => task[update] = req.body[update]);
        await task.save();
        res.send(task);
    } catch (err) {
        res.status(400).send(err);
    }
});

router.delete(`/tasks/:id`, auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id});

        if(!task) {
            return res.status(404).send();
        }

        res.send(task);
    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router;