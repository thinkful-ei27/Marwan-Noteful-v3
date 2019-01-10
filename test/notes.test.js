const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const app = require('../server');
const {TEST_MONGODB_URI} = require('../config');
const Note = require('../models/note');
const {notes} = require('../db/data');
const expect = chai.expect;
chai.use(chaiHttp);

    before(function(){
        return mongoose.connect(TEST_MONGODB_URI,{useNewUrlParser:true})
        .then(()=>mongoose.connection.db.dropDatabase());
    });
    
    beforeEach(function(){
        return Note.insertMany(notes)
    });
    
    afterEach(function(){
        return mongoose.connection.db.dropDatabase();
    });
    
    after(function(){
        return mongoose.disconnect();
    });

    describe('GET /api/notes', function () {
        it('should return the correct number of Notes', function () {
        // 1) Call the database **and** the API
        // 2) Wait for both promises to resolve using `Promise.all`
        return Promise.all([
            Note.find(),
            chai.request(app).get('/api/notes')
          ])
          // 3) then compare database results to API response
            .then(([data, res]) => {
              expect(res).to.have.status(200);
              expect(res).to.be.json;
              expect(res.body).to.be.a('array');
              expect(res.body).to.have.length(data.length);
            });
        });
 

        it('should return correct note', function () {
            let data;
            // 1) First, call the database
            return Note.findOne()
              .then(_data => {
                data = _data;
                // 2) then call the API with the ID
                return chai.request(app).get(`/api/notes/${data.id}`);
              })
              .then((res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
      
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt');
      
                // 3) then compare database results to API response
                expect(res.body.id).to.equal(data.id);
                expect(res.body.title).to.equal(data.title);
                expect(res.body.content).to.equal(data.content);
                expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
                expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
              });
          });
        });


  describe('POST endpoint',function(){

    it('should add a new note',function(){
        const newNote = {
            title: "new title",
            content:"new content"
        }

        let res;
return chai.request(app)
.post('/api/notes')
.send(newNote)
.then(function(_res){
    res = _res;
    expect(res).to.have.status(201);
    expect(res).to.have.header('location');
    expect(res).to.be.json;
    expect(res.body).to.be.a('object');
    expect(res.body).to.include.keys('id','title','content','createdAt', 'updatedAt')

    return Note.findById(res.body.id);
})
.then(function(note){
    expect(res.body.title).to.equal(note.title);
    expect(res.body.content).to.equal(note.content);
    expect(res.body.id).to.equal(note.id);
    expect(new Date(res.body.createdAt)).to.eql(note.createdAt);
    expect(new Date(res.body.updatedAt)).to.eql(note.updatedAt);
});
    });
  });

  describe('PUT endpoint',function(){
      it('should update a note by id',function(){
          const updateObj = {
              title: "title updated",
              content: "content updated"
          }

          return Note
          .findOne()
          .then(function(note){
              updateObj.id = note.id

              return chai.request(app)
              .put(`/api/notes/${updateObj.id}`)
              .send(updateObj)
          })
          .then(function(res){
              expect(res).to.have.status(200);
              return Note.findById(updateObj.id);
          })
          .then(function(note){
              expect(note.title).to.equal(updateObj.title);
              expect(note.content).to.equal(updateObj.content);
          });
      });
  });

  describe('DELETE endpoint',function(){

    it('should delete a note by id',function(){
        let note;

        return Note
        .findOne()
        .then(function(_note){
            note = _note;
            return chai.request(app)
            .delete(`/api/notes/${note.id}`);
        })
        .then(function(res){
            expect(res).to.have.status(204);
            return Note.findById(note.id);
        })
        .then(function(_note){
            expect(_note).to.be.null;
        });
    });
  });

