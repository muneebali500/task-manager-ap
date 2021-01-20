const mongoose = require(`mongoose`);

const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false 
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: `User`     // this will create a relationship b/w user and task; now we can fetch the entire individual profile, whenever we have an access to an individual task 
    }
}, {
    timestamps: true
});

const Task = mongoose.model(`Task`, taskSchema);


module.exports = Task;