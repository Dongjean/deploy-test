const express = require("express");
const fileUpload = require('express-fileupload');
const router = express.Router();

const Servicer = require('../../Services/BlogPostServices');

router.post('/postblog', fileUpload({createParentPath: true}) /*use the middleware for file upload just for this route*/, (req, res) => {
    const Image = req.files['Image']; //get the information of the Image
    const Data = req.body; //get the rest of the data
    Servicer.PostBlogServicer(Data, Image).then(response => res.json(response)) //pass all the received data into the Service layer to be processed and then respond with the returned response
})

router.get('/getblogs/:Cats', (req, res) => {
    const Data = req.params;
    Servicer.GetBlogs(Data).then(response => res.json(response)) //pass all the received data into the Service layer to be processed and then respond with the returned response
})

router.post('/deleteblog', (req, res) => {
    const Data = req.body;
    Servicer.DeleteBlogServicer(Data).then(response => res.json(response)) //pass all the received data into the Service layer to be processed and then respond with the returned response
})

router.post('/updateblog', fileUpload({createParentPath: true}) /*use the middleware for file upload just for this route*/, (req, res) => {
    const Image = req.files['Image']; //get the information of the Image
    const Data = req.body; //get the rest of the data
    Servicer.UpdateBlogServicer(Data, Image).then(response => res.json(response)) //pass all the received data into the Service layer to be processed and then respond with the returned response
})

module.exports = router;