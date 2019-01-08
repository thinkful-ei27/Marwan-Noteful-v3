const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');

const Note = require('../models/note');

// Find

mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
  .then(() => {
    const searchTerm = 'lady gaga';
    let filter = {};

    if (searchTerm) {
      filter.title = { $regex: searchTerm, $options: 'i' };
    }

    return Note.find(filter).sort({ updatedAt: 'desc' });
  })
  .then(results => {
    console.log(results);
  })
  .then(() => {
    return mongoose.disconnect()
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });

// Find by id

  mongoose.connect(MONGODB_URI, {useNewUrlParser:true})
  .then(()=>{
      return Note.find();
    })
  .then(results=>{
      const id = results[0]._id;
      return Note.findById(id)
  })
  .then(results=>{
      console.log(results);
  })
  .then(()=>{
      return mongoose.disconnect()
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });

// create

mongoose.connect(MONGODB_URI, {useNewUrlParser:true})
.then(()=>{
    const newNote = {
        title: "scratch title",
        content: "contents"
    }

    return Note.create(newNote)
})
.then(results=>{
    console.log(results)
})
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });

// update

mongoose.connect(MONGODB_URI, {useNewUrlParser:true})
.then(()=>{
    return Note.find();
})
.then(results=>{
    const id = results[0]._id;
    const updatedNote = {
        title: "updated",
        content: "updated content"
    };
    return Note.findByIdAndUpdate(id,updatedNote);
})
.then(results=>{
    console.log(results)
})
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });

// Delete

mongoose.connect(MONGODB_URI, {useNewUrlParser:true})
.then(()=>{
    return Note.find();
})
.then(results=>{
    const id = results[0]._id;
    return Note.findByIdAndRemove(id);
})
.then(results=>{
    console.log(results)
})
.catch(err=>{
    console.error(err);
});

