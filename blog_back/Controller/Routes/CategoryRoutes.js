const express = require("express");
const router = express.Router();

const Servicer = require('../../Services/CategoryServices.js');

router.get('/getallcats', (req, res) => {
    Servicer.GetAllCatsServicer().then(response => res.json(response)) //call the Service layer for a reponse, and respond with this response
})

router.post('/addcategory', (req, res) => {
    const Data = req.body;
    Servicer.AddCategoryServicer(Data).then(response => res.json(response)) //pass all the received data into the Service layer to be processed and then respond with the returned response
})

router.get('/getcategories/:PostID', (req, res) => {
    const Data = req.params;
    Servicer.GetCategoriesServicer(Data).then(response => res.json(response)) //pass all the received data into the Service layer to be processed and then respond with the returned response
})

module.exports = router;