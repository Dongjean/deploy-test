const express = require("express");
const router = express.Router();

const Servicer = require('../../Services/LikeServices.js');

router.get('/getlikescount/:PostID', (req, res) => {
    const Data = req.params;
    Servicer.GetLikesCountServicer(Data).then(response => res.json(response)) //pass all the received data into the Service layer to be processed and then respond with the returned response
})

router.get('/getlikestate/:PostID/:CurrUser', (req, res) => {
    const Data = req.params;
    Servicer.GetLikedStateServicer(Data).then(response => res.json(response)) //pass all the received data into the Service layer to be processed and then respond with the returned response
})

router.post('/addlike', (req, res) => {
    const Data = req.body;
    Servicer.AddLikeServicer(Data).then(response => res.json(response)) //pass all the received data into the Service layer to be processed and then respond with the returned response
})

router.post('/removelike', (req, res) => {
    const Data = req.body;
    Servicer.RemoveLikeServicer(Data).then(response => res.json(response)) //pass all the received data into the Service layer to be processed and then respond with the returned response
})

module.exports = router;