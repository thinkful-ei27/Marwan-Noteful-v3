'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const app = require('../server');
const {TEST_MONGODB_URI} = require('../config');
const Folder = require('../models/folder');
const {folders} = require('../db/data')
const expect = chai.expect;
chai.use(chaiHttp);


before(function(){
    return mongoose.connect(TEST_MONGODB_URI,{useNewUrlParser:true})
    .then(()=>mongoose.connection.db.dropDatabase());
});

beforeEach(function(){
    return Promise.all([ Folder.insertMany(folders),
        Folder.createIndexes()])
    
});

afterEach(function(){
    return mongoose.connection.db.dropDatabase();
});

after(function(){
    return mongoose.disconnect();
});

describe('GET /api/folders', function () {
    it('should return the correct number of folders', function () {
    // 1) Call the database **and** the API
    // 2) Wait for both promises to resolve using `Promise.all`
    return Promise.all([
        Folder.find().sort('name'),
        chai.request(app).get('/api/folders')
      ])
      // 3) then compare database results to API response
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
        });
    });


    it('should return a list with the correct fields and values', function () {
        return Promise.all([
              Folder.find().sort('name'),
              chai.request(app).get('/api/folders')
            ])
              .then(([data, res]) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.a('array');
                expect(res.body).to.have.length(data.length);
                res.body.forEach(function (item, i) {
                  expect(item).to.be.a('object');
                  expect(item).to.have.all.keys('id', 'name', 'createdAt', 'updatedAt');
                  expect(item.id).to.equal(data[i].id);
                  expect(item.name).to.equal(data[i].name);
                  expect(new Date(item.createdAt)).to.deep.equal(data[i].createdAt);
                  expect(new Date(item.updatedAt)).to.deep.equal(data[i].updatedAt);
                });
              });
          });
      
        });

        describe('GET /api/folders/:id', function () {

            it('should return correct folder', function () {
              let data;
              return Folder.findOne()
                .then(_data => {
                  data = _data;
                  return chai.request(app).get(`/api/folders/${data.id}`);
                })
                .then((res) => {
                  expect(res).to.have.status(200);
                  expect(res).to.be.json;
                  expect(res.body).to.be.an('object');
                  expect(res.body).to.have.all.keys('id', 'name', 'createdAt', 'updatedAt');
                  expect(res.body.id).to.equal(data.id);
                  expect(res.body.name).to.equal(data.name);
                  expect(new Date(res.body.createdAt)).to.deep.equal(data.createdAt);
                  expect(new Date(res.body.updatedAt)).to.deep.equal(data.updatedAt);
                });
            });
        
            it('should respond with a 400 for an invalid id', function () {
              return chai.request(app)
                .get('/api/folders/NOT-A-VALID-ID')
                .then(res => {
                  expect(res).to.have.status(400);
                  expect(res.body.message).to.eq('The `id` is not valid');
                });
            });
        
            it('should respond with a 404 for an ID that does not exist', function () {
              // The string "DOESNOTEXIST" is 12 bytes which is a valid Mongo ObjectId
              return chai.request(app)
                .get('/api/folders/DOESNOTEXIST')
                .then(res => {
                  expect(res).to.have.status(404);
                });
            });
        
          });

describe('POST endpoint',function(){

it('should add a new folder',function(){
    const newFolder = {
        title: "new name"
    }

    let res;
return chai.request(app)
.post('/api/folders')
.send(newFolder)
.then(function(_res){
res = _res;
expect(res).to.have.status(201);
expect(res).to.have.header('location');
expect(res).to.be.json;
expect(res.body).to.be.a('object');
expect(res.body).to.include.keys('id','name','createdAt', 'updatedAt')

return Folder.findById(res.body.id);
})
.then(function(folder){
expect(res.body.name).to.equal(folder.name);
expect(res.body.id).to.equal(folder.id);
expect(new Date(res.body.createdAt)).to.eql(folder.createdAt);
expect(new Date(res.body.updatedAt)).to.eql(folder.updatedAt);
});
});
it('should return an error when missing "name" field', function () {
    const newItem = { 'foo': 'bar' };
    return chai.request(app)
      .post('/api/folders')
      .send(newItem)
      .then(res => {
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body.message).to.equal('Missing `name` in request body');
      });
  });

  it('should return an error when given a duplicate name', function () {
    return Folder.findOne()
      .then(data => {
        const newItem = { 'name': data.name };
        return chai.request(app).post('/api/folders').send(newItem);
      })
      .then(res => {
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body.message).to.equal('Folder name already exists');
      });
  });
});

describe('PUT endpoint',function(){
  it('should update a folder by id',function(){
      const updateObj = {
          name: "name updated"
      }

      return Folder
      .findOne()
      .then(function(folder){
          updateObj.id = folder.id

          return chai.request(app)
          .put(`/api/folders/${updateObj.id}`)
          .send(updateObj)
      })
      .then(function(res){
          expect(res).to.have.status(200);
          return Folder.findById(updateObj.id);
      })
      .then(function(folder){
          expect(folder.name).to.equal(updateObj.name);
      });
  });
  
  it('should respond with a 400 for an invalid id', function () {
    const updateItem = { 'name': 'Blah' };
    return chai.request(app)
      .put('/api/folders/NOT-A-VALID-ID')
      .send(updateItem)
      .then(res => {
        expect(res).to.have.status(400);
        expect(res.body.message).to.eq('The `id` is not valid');
      });
  });

  it('should respond with a 404 for an id that does not exist', function () {
    const updateItem = { 'name': 'Blah' };
    // The string "DOESNOTEXIST" is 12 bytes which is a valid Mongo ObjectId
    return chai.request(app)
      .put('/api/folders/DOESNOTEXIST')
      .send(updateItem)
      .then(res => {
        expect(res).to.have.status(404);
      });
  });

  it('should return an error when missing "name" field', function () {
    const updateItem = {};
    let data;
    return Folder.findOne()
      .then(_data => {
        data = _data;
        return chai.request(app).put(`/api/folders/${data.id}`).send(updateItem);
      })
      .then(res => {
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body.message).to.equal('Missing `name` in request body');
      });
  });

  it('should return an error when given a duplicate name', function () {
    return Folder.find().limit(2)
      .then(results => {
        const [item1, item2] = results;
        item1.name = item2.name;
        return chai.request(app)
          .put(`/api/folders/${item1.id}`)
          .send(item1);
      })
      .then(res => {
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body.message).to.equal('Folder name already exists');
      });
  });


});

describe('DELETE endpoint',function(){

it('should delete a folder by id',function(){
    let folder;

    return Folder
    .findOne()
    .then(function(_folder){
        folder = _folder;
        return chai.request(app)
        .delete(`/api/folders/${folder.id}`);
    })
    .then(function(res){
        expect(res).to.have.status(204);
        return Folder.findById(folder.id);
    })
    .then(function(_folder){
        expect(_folder).to.be.null;
    });
});
});


