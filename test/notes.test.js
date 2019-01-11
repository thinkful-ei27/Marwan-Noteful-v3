const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const app = require('../server');
const {
    TEST_MONGODB_URI
} = require('../config');
const Note = require('../models/note');
const {
    notes
} = require('../db/data');
const {
    folders
} = require('../db/data');

const { tags } = require('../db/data');

const Folder = require('../models/folder');
const Tag = require('../models/tag');
const expect = chai.expect;
chai.use(chaiHttp);



describe('Notes test', function () {
    before(function () {
        return mongoose.connect(TEST_MONGODB_URI, {
                useNewUrlParser: true
            })
            .then(() => mongoose.connection.db.dropDatabase());
    });

    beforeEach(function () {
        return Promise.all([
                Note.insertMany(notes),
                Folder.insertMany(folders),
                Folder.createIndexes(),
                Tag.insertMany(tags),
                Tag.createIndexes()
            ]);
    });

    afterEach(function () {
        return mongoose.connection.db.dropDatabase();
    });

    after(function () {
        return mongoose.disconnect();
    });


    describe('GET /api/notes', function () {

        it('should return the correct number of Notes', function () {
            return Promise.all([
                    Note.find(),
                    chai.request(app).get('/api/notes')
                ])
                .then(([data, res]) => {
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body).to.be.a('array');
                    expect(res.body).to.have.length(data.length);
                });
        });

        it('should return a list with the correct right fields', function () {
            return Promise.all([
                    Note.find().sort({
                        updatedAt: 'desc'
                    }),
                    chai.request(app).get('/api/notes')
                ])
                .then(([data, res]) => {
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body).to.be.a('array');
                    expect(res.body).to.have.length(data.length);
                    res.body.forEach(function (item, i) {
                        expect(item).to.be.a('object');
                        expect(item).to.include.all.keys('id', 'title', 'createdAt', 'updatedAt');
                        expect(item.id).to.equal(data[i].id);
                        expect(item.title).to.equal(data[i].title);
                        expect(item.content).to.equal(data[i].content);
                        expect(new Date(item.createdAt)).to.deep.equal(data[i].createdAt);
                        expect(new Date(item.updatedAt)).to.deep.equal(data[i].updatedAt);
                    });
                });
        });

        it('should return correct search results for a searchTerm query', function () {
            const searchTerm = 'gaga';

            const dbPromise = Note.find({
                title: {
                    $regex: searchTerm,
                    $options: 'i'
                }
            });
            const apiPromise = chai.request(app)
                .get(`/api/notes?searchTerm=${searchTerm}`);

            return Promise.all([dbPromise, apiPromise])
                .then(([data, res]) => {
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body).to.be.a('array');
                    expect(res.body).to.have.length(data.length);
                    res.body.forEach(function (item, i) {
                        expect(item).to.be.a('object');
                        expect(item).to.include.all.keys('id', 'title', 'createdAt', 'updatedAt');
                        expect(item.id).to.equal(data[i].id);
                        expect(item.title).to.equal(data[i].title);
                        expect(item.content).to.equal(data[i].content);
                        expect(new Date(item.createdAt)).to.deep.equal(data[i].createdAt);
                        expect(new Date(item.updatedAt)).to.deep.equal(data[i].updatedAt);
                    });
                });
        });

        it('should return correct search results for a folderId query', function () {
            let data;
            return Folder.findOne()
                .then((_data) => {
                    data = _data;
                    return Promise.all([
                        Note.find({
                            folderId: data.id
                        }),
                        chai.request(app).get(`/api/notes?folderId=${data.id}`)
                    ]);
                })
                .then(([data, res]) => {
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body).to.be.a('array');
                    expect(res.body).to.have.length(data.length);
                });
        });

        it('should return correct search results for a tagId query', function () {
            let data;
            return Folder.findOne()
                .then((_data) => {
                    data = _data;
                    return Promise.all([
                        Note.find({
                            tagId: data.id
                        }),
                        chai.request(app).get(`/api/notes?tagId=${data.id}`)
                    ]);
                })
                .then(([data, res]) => {
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body).to.be.a('array');
                    expect(res.body).to.have.length(data.length);
                });
        });

        it('should return an empty array for an incorrect query', function () {
            const searchTerm = 'NotValid';
            // const re = new RegExp(searchTerm, 'i');
            const dbPromise = Note.find({
                title: {
                    $regex: searchTerm,
                    $options: 'i'
                }
                // $or: [{ 'title': re }, { 'content': re }]
            });
            const apiPromise = chai.request(app).get(`/api/notes?searchTerm=${searchTerm}`);
            return Promise.all([dbPromise, apiPromise])
                .then(([data, res]) => {
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body).to.be.a('array');
                    expect(res.body).to.have.length(data.length);
                });
        });
    });

    describe('GET /api/notes/:id', function () {

        it('should return correct notes', function () {
            let data;
            return Note.findOne()
                .then(_data => {
                    data = _data;
                    return chai.request(app).get(`/api/notes/${data.id}`);
                })
                .then((res) => {
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt', 'folderId','tags');

                    expect(res.body.id).to.equal(data.id);
                    expect(res.body.title).to.equal(data.title);
                    expect(res.body.content).to.equal(data.content);
                    expect(new Date(res.body.createdAt)).to.deep.equal(data.createdAt);
                    expect(new Date(res.body.updatedAt)).to.deep.equal(data.updatedAt);
                });
        });

    });


    describe('POST endpoint', function () {

        it('should add a new note', function () {
            const newNote = {
                title: "new title",
                content: "new content",
            }
            let res;
            return chai.request(app)
              .post('/api/notes')
              .send(newNote)
              .then(function (_res) {
                res = _res;
                expect(res).to.have.status(201);
                expect(res).to.have.header('location');
                expect(res).to.be.json;
                expect(res.body).to.be.a('object');
                expect(res.body).to.have.all.keys('id', 'title', 'content', 'createdAt', 'updatedAt', 'tags');
                return Note.findById(res.body.id);
              })
              .then(data => {
                expect(res.body.id).to.equal(data.id);
                expect(res.body.title).to.equal(data.title);
                expect(res.body.content).to.equal(data.content);
                expect(new Date(res.body.createdAt)).to.deep.equal(data.createdAt);
                expect(new Date(res.body.updatedAt)).to.deep.equal(data.updatedAt);
              });
          });
    });

    describe('PUT endpoint', function () {
        it('should update a note by id', function () {
            const updateItem = {
                'title': 'titleupdated',
                'content': 'content updated'
              };
              let data;
              return Note.findOne()
                .then(_data => {
                  data = _data;
                  return chai.request(app)
                    .put(`/api/notes/${data.id}`)
                    .send(updateItem);
                })
                .then(function (res) {
                  expect(res).to.have.status(200);
                  expect(res).to.be.json;
                  expect(res.body).to.be.a('object');
                  expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt', 'folderId','tags');
        
                  expect(res.body.id).to.equal(data.id);
                  expect(res.body.title).to.equal(updateItem.title);
                  expect(res.body.content).to.equal(updateItem.content);
                  expect(new Date(res.body.createdAt)).to.deep.equal(data.createdAt);
                  // expect note to have been updated
                  expect(new Date(res.body.updatedAt)).to.greaterThan(data.updatedAt);
                });
            });
        });

    describe('DELETE /api/notes/:id', function () {

        it('should delete an existing document and respond with 204', function () {
          let data;
          return Note.findOne()
            .then(_data => {
              data = _data;
              return chai.request(app).delete(`/api/notes/${data.id}`);
            })
            .then(function (res) {
              expect(res).to.have.status(204);
              return Note.countDocuments({ _id: data.id });
            })
            .then(count => {
              expect(count).to.equal(0);
            });
        });
    
      });

});