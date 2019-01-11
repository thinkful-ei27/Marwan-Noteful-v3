const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const app = require('../server');
const {
    TEST_MONGODB_URI
} = require('../config');
const Tag = require('../models/tag');
const {
    tags
} = require('../db/data')
const expect = chai.expect;
chai.use(chaiHttp);


describe('Tags test', function () {
            before(function () {
                return mongoose.connect(TEST_MONGODB_URI, {
                        useNewUrlParser: true
                    })
                    .then(() => mongoose.connection.db.dropDatabase());
            });

            beforeEach(function () {
                return Promise.all([
                    Tag.insertMany(tags),
                    Tag.createIndexes()
                ])
                    
                });

            afterEach(function () {
                return mongoose.connection.db.dropDatabase();
            });

            after(function () {
                return mongoose.disconnect();
            });

            describe('GET /api/tags', function () {

                        it('should return the correct number of tags', function () {

                            return Promise.all([
                                    Tag.find().sort('name'),
                                    chai.request(app).get('/api/tags')
                                ])

                                .then(([data, res]) => {
                                    expect(res).to.have.status(200);
                                    expect(res).to.be.json;
                                    expect(res.body).to.be.a('array');
                                    expect(res.body).to.have.length(data.length);
                                });
                        });

                        it('should return a list with the correct fields and values', function () {
                            return Promise.all([
                                    Tag.find().sort('name'),
                                    chai.request(app).get('/api/tags')
                                ])
                                .then(([data, res]) => {
                                    expect(res).to.have.status(200);
                                    expect(res).to.be.json;
                                    expect(res.body).to.be.a('array');
                                    expect(res.body).to.have.length(data.length);
                                    res.body.forEach((item, i) => {
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

                        describe('GET /api/tags/:id', function () {

                            it('should return correct tag', function () {
                              let data;
                              return Tag.findOne()
                                .then(_data => {
                                  data = _data;
                                  return chai.request(app).get(`/api/tags/${data.id}`);
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
                              it('should add a new tag',function(){

                                const newItem = { 'name': 'newTag' };
                                let body;
                                return chai.request(app)
                                  .post('/api/tags')
                                  .send(newItem)
                                  .then(function (res) {
                                    body = res.body;
                                    expect(res).to.have.status(201);
                                    expect(res).to.have.header('location');
                                    expect(res).to.be.json;
                                    expect(body).to.be.a('object');
                                    expect(body).to.have.all.keys('id', 'name', 'createdAt', 'updatedAt');
                                    return Tag.findById(body.id);
                                  })
                                  .then(data => {
                                    expect(body.id).to.equal(data.id);
                                    expect(body.name).to.equal(data.name);
                                    expect(new Date(body.createdAt)).to.deep.equal(data.createdAt);
                                    expect(new Date(body.updatedAt)).to.deep.equal(data.updatedAt);
                                  });
                              });
                          });

                          describe('PUT endpoint',function(){
                            it('should update a tag by id',function(){
                                const updateObj = {
                                    name: "name updated"
                                }
                          
                                return Tag
                                .findOne()
                                .then(function(tag){
                                    updateObj.id = tag.id
                          
                                    return chai.request(app)
                                    .put(`/api/tags/${updateObj.id}`)
                                    .send(updateObj)
                                })
                                .then(function(res){
                                    expect(res).to.have.status(200);
                                    return Tag.findById(updateObj.id);
                                })
                                .then(function(tag){
                                    expect(tag.name).to.equal(updateObj.name);
                                });
                            });

                          });

                          describe('DELETE /api/tags/:id', function () {

                            it('should delete an existing document and respond with 204', function () {
                              let data;
                              return Tag.findOne()
                                .then(_data => {
                                  data = _data;
                                  return chai.request(app).delete(`/api/tags/${data.id}`);
                                })
                                .then(function (res) {
                                  expect(res).to.have.status(204);
                                  expect(res.body).to.be.empty;
                                  return Tag.countDocuments({ _id: data.id });
                                })
                                .then(count => {
                                  expect(count).to.equal(0);
                                });
                            });
                          
                          });
                          
                    });