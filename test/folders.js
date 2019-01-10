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
    return Folder.insertMany(folders)
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
        Folder.find(),
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


    it('should return correct folder', function () {
        let data;
        // 1) First, call the database
        return Folder.findOne()
          .then(_data => {
            data = _data;
            // 2) then call the API with the ID
            return chai.request(app).get(`/api/folders/${data.id}`);
          })
          .then((res) => {
            expect(res).to.have.status(200);
            expect(res).to.be.json;
  
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys('id', 'name', 'createdAt', 'updatedAt');
  
            // 3) then compare database results to API response
            expect(res.body.id).to.equal(data.id);
            expect(res.body.name).to.equal(data.name)
            expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
            expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
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


