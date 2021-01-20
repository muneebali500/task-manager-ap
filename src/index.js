const express = require(`express`);
require(`./db/mongoose`);
const userRouter = require(`../src/routers/user`);
const taskRouter = require(`../src/routers/task`);

const app = express();
const port = process.env.PORT;      // heroku reads the port "process.env.PORT"

app.use(express.json());    // parse the incoming json data in JS object so we can access it on    request handler i.e: req
app.use(userRouter);    // registering the userRouter on express app
app.use(taskRouter);    // registering the taskRouter on express app


app.listen(port, () => {
    console.log(`Server is up at port ${port}`);
});
