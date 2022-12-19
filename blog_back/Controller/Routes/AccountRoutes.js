const express = require("express");
const router = express.Router();

const Services = require('../../Services/AccountServices.js');

router.get('/login/:Username/:Password', (req, res) => {
    const Data = req.params; //get the data in the parameters
    Services.LoginServicer(Data).then(response => res.json(response)) //pass all the received data into the Service layer to be processed and then respond with the returned response
})

router.post('/signup', (req, res) => {
    const Data = req.body; //get the data in the body of the post request
    Services.SignupServicer(Data).then(response => res.json(response)) //pass all the received data into the Service layer to be processed and then respond with the returned response
})

module.exports = router;