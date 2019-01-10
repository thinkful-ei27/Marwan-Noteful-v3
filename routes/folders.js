const express = require('express');
const Folder = require('../models/folder');
const router = express.Router();

router.get('/',(req, res, next) => {

    Folder.find().sort({name:'asc'})
    .then(results => res.json(results))
    .catch(err => next(err));

});

// Get folder by id

router.get('/:id',(req,res,next)=>{
    const id = req.params.id;
    Folder.findById(id)
    .then(results=> res.json(results))
    .catch(err=>next(err));
});

// Post folder

router.post('/',(req,res,next)=>{
    const {name} = req.body;
    const newItem = {name};

    if (!newItem.name) {
        const err = new Error('Missing `name` in request body');
        err.status = 400;
        return next(err);
      }

      Folder.create(newItem)
      .then(results=> res.json(results))
      .catch(err => {
        if (err.code === 11000) {
          err = new Error('The folder name already exists');
          err.status = 400;
        }
        next(err);
      });
});

// PUT folder

router.put('/:id', (req, res, next) => {

const {id} = req.params;

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

  Folder.findByIdAndUpdate(id, updateObj)
  .then(results=> res.json(results))
  .catch(err => {
    if (err.code === 11000) {
      err = new Error('The folder name already exists');
      err.status = 400;
    }
    next(err);
  });

});

//   Delete folder

router.delete('/:id', (req,res,next) => {
    const id = req.params.id;

    Folder.findByIdAndDelete(id)
    .then(res.sendStatus(204))
    .catch(err=> next(err));
});


module.exports = router;