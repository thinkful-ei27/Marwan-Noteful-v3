'use strict';

const express = require('express');
const Note = require('../models/note');
const router = express.Router();
const mongoose = require('mongoose');

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {

  const {
    searchTerm
  } = req.query;
  const {
    folderId
  } = req.query;
  let filter = {};
  const regex = new RegExp(searchTerm, 'i');
  if (searchTerm) {
    filter = {
          title: regex
    };
  }
  if (folderId) {
    filter = {
        title: regex,
        folderId: folderId
      }
    }
  

  Note.find(filter).sort({
      updatedAt: 'desc'
    })
    .then(notes => res.json(notes))
    .catch(err => console.error(err));

});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
const {id} = req.params;
  
if (!mongoose.Types.ObjectId.isValid(id)) {
  const err = new Error('The `id` is not valid');
  err.status = 400;
  return next(err);
}
  Note
    .findById(id)
    .then(results => {
      res.json(results)
    })
    .catch(err => {
      next(err)
    });

});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {

  const {
    title,
    content,
    folderId
  } = req.body;


  const newItem = {
    title,
    content,
    folderId
  };

  if (folderId && !mongoose.Types.ObjectId.isValid(folderId)) {
    const err = new Error('The `folderId` is not valid');
    err.status = 400;
    return next(err);
  }
  /***** Never trust users - validate input *****/
  if (!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  Note
    .create(newItem)
    .then(result => res.location(`${req.originalUrl}/${result.id}`).status(201).json(result))
    .catch(err => next(err))
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {

  const { id } = req.params;
  const { title, content, folderId } = req.body;

  /***** Never trust users - validate input *****/
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  if (folderId && !mongoose.Types.ObjectId.isValid(folderId)) {
    const err = new Error('The `folderId` is not valid');
    err.status = 400;
    return next(err);
  }

  const updateNote = { title, content, folderId };

  Note.findByIdAndUpdate(id, updateNote, { new: true })
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {

  const {
    id
  } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }
  Note
    .findByIdAndRemove(id)

    .then(res.sendStatus(204))
    .catch(err => next(err))
});

module.exports = router;