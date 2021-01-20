require(`../src/db/mongoose`);
const { findByIdAndUpdate, findByIdAndDelete } = require("../src/models/task");
const Task = require(`../src/models/task`);

/* Task.findByIdAndDelete(`5ff3e07316c62133bce0591f`).then((task) => {
    console.log(task);

    return Task.countDocuments({ completed: true });
}).then((result) => {
    console.log(result);
}).catch((err) => {
    console.log(err);
}); */


const deleteTaskAndCount = async (id) => {
    const task = await Task.findByIdAndDelete(id);
    const count = await Task.countDocuments({completed: false});
    return count;
}

deleteTaskAndCount(`5ff3df77863c3b2cd0b915a4`).then((count) => {
    console.log(count);
}).catch((err) => {
    console.log(err);
});