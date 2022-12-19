const express = require("express");
const router = express.Router();

const Servicer = require('../../Services/CommentServices.js');

router.get('/getcomments/:PostID', (req, res) => {
    const Data = req.params
    Servicer.GetCommentsServicer(Data).then(response => res.json(response)) //pass all the received data into the Service layer to be processed and then respond with the returned response
})

router.post('/addcomment', (req, res) => {
    const Data = req.body;
    Servicer.AddCommentServicer(Data).then(response => res.json(response)) //pass all the received data into the Service layer to be processed and then respond with the returned response
})

router.post('/deletecomment', (req, res) => {
    const Data = req.body;
    Servicer.DeleteCommentServicer(Data).then(response => res.json(response)) //pass all the received data into the Service layer to be processed and then respond with the returned response
})

module.exports = router;