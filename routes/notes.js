'use strict';

const express = require('express');
const Note = require('../models/note');
const router = express.Router();

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
      $or: [{
          title: regex
        },
        {
          content: regex
        }
      ]
    };
  }
  if (folderId) {
    filter = {
      $or: [{
        title: regex
      }, {
        content: regex
      }, {
        folder_id: folderId
      }]
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

  const id = req.params.id;
  
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
    folder_id: folderId ? folderId : null
  };
  /***** Never trust users - validate input *****/
  if (!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  Note
    .create(newItem)
    .then(result => res.location(`${req.originalUrl}/${result}`).status(201).json(result))
    .catch(err => next(err))
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {

  const id = req.params.id;

  /***** Never trust users - validate input *****/
  const updateObj = {};
  const updateableFields = ['title', 'content', 'folder_id'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });

  /***** Never trust users - validate input *****/
  if (!updateObj.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  Note
    .findByIdAndUpdate(id, updateObj)
    .then(results => {
      res.json(results)
    })
    .catch(err => next(err))

});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {

  const {
    id
  } = req.params;
  Note
    .findByIdAndRemove(id)

    .then(res.sendStatus(204))
    .catch(err => next(err))
});

module.exports = router;