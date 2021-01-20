const mongoose = require(`mongoose`);
const validator = require(`validator`);
const bcrypt = require(`bcryptjs`);
const jwt = require(`jsonwebtoken`);
const Task = require("./task");

const userSchema = new mongoose.Schema( {
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error(`Invalid email`);
            }
        }
    },  
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value) {
            if(value.toLowerCase().includes(`password`)) {
                throw new Error(`the value should not contain "password" `);
            }
        }
    },  
    age: {
        type: Number,
        default: 0,
        validate(value) {       // function provided by mongoose for custom validation
            if (value < 0) {
                throw new Error(`Please provide the positive value`);
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer  // this will alow us to store our buffer with the binary image data right in the database alongside the user whom the image belongs to
    }
}, {
    timestamps: true
});

// Virtual property allows us to set one of the virtual attributes. its virtual because we are not changing what we store for the user document. its just a way for mongoose to figure out how these two things are related. it will take two arguments: name for first argument can be any name we pick
userSchema.virtual(`tasks`, {
    ref: `Task`,
    localField: `_id`, // this is where local data is stored. 
    foreignField: `owner` // this is the name on the other thing i.e task
});

userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject(); // user is in JSON format, toObject() method converts it into an object so, we can manipulate it as below i.e: deleting/hiding the private data

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;
}

userSchema.methods.generateAuthToken = async function() {
    const user = this;
    const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET);

    user.tokens = user.tokens.concat({ token });
    await user.save();

    return token;
}

userSchema.statics.findByCredentials = async (email, password) => { // we are using asyn arrow function because we will not use the "this" binding 
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error('Unable to login');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error('Unable to login');
    }

    return user;
}

// Hash the plain text password before saving
userSchema.pre(`save`, async function(next) { // we are using asyn standard function because we
    const user = this;                         // need to use "this" binding 

    if(user.isModified(`password`)) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
}); 

// Delete user tasks when user is removed
userSchema.pre(`remove`, async function(next) {
    const user = this;
    await Task.deleteMany({ owner: user._id });
    next();
});

const User = mongoose.model(`User`, userSchema);

module.exports = User;