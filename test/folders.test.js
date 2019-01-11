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


describe('Folders test',function(){
  before(function(){
    return mongoose.connect(TEST_MONGODB_URI,{useNewUrlParser:true})
    .then(()=>mongoose.connection.db.dropDatabase());
});

beforeEach(function(){
    return Folder.insertMany(folders);
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
        
          });

describe('POST endpoint',function(){

it('should add a new folder',function(){
    const newFolder = {
        name: "new name"
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

describe('DELETE /api/folders/:id', function () {

  it('should delete an existing document and respond with 204', function () {
    let data;
    return Folder.findOne()
      .then(_data => {
        data = _data;
        return chai.request(app).delete(`/api/folders/${data.id}`);
      })
      .then(function (res) {
        expect(res).to.have.status(204);
        expect(res.body).to.be.empty;
        return Folder.countDocuments({ _id: data.id });
      })
      .then(count => {
        expect(count).to.equal(0);
      });
  });

});


});

