const express = require('express');
const Tag = require('../models/tag');

const router = express.Router();
const mongoose = require('mongoose');

router.get('/',(req, res, next) => {

    Tag.find().sort({name:'asc'})
    .then(results => res.json(results))
    .catch(err => next(err));

});

// Get tag by id

router.get('/:id',(req,res,next)=>{
    const id = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error('The `id` is not valid');
      err.status = 400;
      return next(err);
    }
    Tag.findById(id)
    .then(results=> res.json(results))
    .catch(err=>next(err));
});

// Post tag

router.post('/',(req,res,next)=>{
    const {name} = req.body;
    const newItem = {name};

    if (!newItem.name) {
        const err = new Error('Missing `name` in request body');
        err.status = 400;
        return next(err);
      }

      Tag.create(newItem)
      .then(results=> res.location(`${req.originalUrl}/${results.id}`).status(201).json(results))
      .catch(err => {
        if (err.code === 11000) {
          err = new Error('The tag name already exists');
          err.status = 400;
        }
        next(err);
      });
});

// PUT tag

router.put('/:id', (req, res, next) => {

const {id} = req.params;
const { name } = req.body;

if (!mongoose.Types.ObjectId.isValid(id)) {
  const err = new Error('The `id` is not valid');
  err.status = 400;
  return next(err);
}
const updateObj = {};
const updateableField = ['name'];

updateableField.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });

  if (!updateObj.name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  Tag.findByIdAndUpdate(id, updateObj, {new:true})
  .then(results=> res.json(results))
  .catch(err => {
    if (err.code === 11000) {
      err = new Error('The tag name already exists');
      err.status = 400;
    }
    next(err);
  });

});

//   Delete tag

router.delete('/:id', (req,res,next) => {
  const { id } = req.params;

  /***** Never trust users - validate input *****/
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }
 

  Tag.findByIdAndRemove(id)
    .then(() => {
      res.sendStatus(204);
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;