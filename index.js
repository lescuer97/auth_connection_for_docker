const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
 require('dotenv').config();

const { register, login} = require('./controller/userController');
const app = express()

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());


const port = 4001;

// adds new user
app.post('/register', register);

app.get('/login', login);

app.use('*',(req, res) => {
    res.status(200).json({
      Response:  "this route doesn't really do anything"
    });
});


app.listen(port, () => {
    console.log(`server listening on port ${port}`)
})