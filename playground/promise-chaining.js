require(`../src/db/mongoose`);
const User = require(`../src/models/user`);

/* User.findByIdAndUpdate(`5ff275a8e7e50223acc97e18`, { age: 26 }).then((user) => {
    console.log(user);

    return User.countDocuments({ name: `Jayawardane` });
}).then((user) => {
    console.log(user);
}).catch((err) => {
    console.log(err);
}); */

const updateAgeAndCount = async (id, age) => {
    const user = User.findByIdAndUpdate(id, { age });
    console.log(user);
    const count = await User.countDocuments({ age });
    return count;
}

updateAgeAndCount(`5ff275a8e7e50223acc97e18`, 36).then((count) => {
    console.log(count);
}).catch((err) => {
    console.log(err);
});