const express = require('express');
const router = express.Router();
const User = require('../models/user');
const mongoose = require('mongoose');

router.post('/',(req,res,next)=>{
    const {username} = req.body;
    const newItem = {username};

    if (!newItem.name) {
        const err = new Error('Missing `username` in request body');
        err.status = 400;
        return next(err);
      }

      User.create(newItem)
      .then(results=> res.location(`${req.originalUrl}/${results.id}`).status(201).json(results))
      .catch(err => {
          err = new Error('The username already exists');
          err.status = 400;
          next(err);
        })
    });

    module.exports = router;
