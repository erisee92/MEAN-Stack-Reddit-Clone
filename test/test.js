var should = require('should');
var assert = require('assert');
var request = require('supertest');

describe('API Test', function() {
    var url = 'http://localhost:3000';
    var username = 'bob99';
    var password = 'top_secret';
    var post_id ='';
    var comment_id ='';
    var token='';

    describe('Users', function(){
        it('should register user and get token', function(done) {
            var credentials = {
                username: username,
                password: password
            };

            request(url)
                .post('/register')
                .send(credentials)
                .expect('Content-Type', /json/)
                .expect(200) //Status code
                // end handles the response
                .end(function(err, res) {
                    if (err) {
                        throw err;
                    }
                    res.body.should.have.property('token');
                    token = res.body.token;
                    console.log(token);
                    done();
                });
        });

        it('should not register user because of same username', function(done) {
            var credentials = {
                username: username,
                password: password
            };

            request(url)
                .post('/register')
                .send(credentials)
                .expect('Content-Type', /json/)
                .expect(400) //Status code
                // end handles the response
                .end(function(err, res) {
                    if (err) {
                        throw err;
                    }
                    res.body.message.should.equal('This Username is probably already taken');
                    done();
                });
        });

        it('should login user and get token', function(done) {
            var credentials = {
                username: username,
                password: password
            };

            request(url)
                .post('/login')
                .send(credentials)
                .expect('Content-Type', /json/)
                .expect(200) //Status code
                // end handles the response
                .end(function(err, res) {
                    if (err) {
                        throw err;
                    }
                    res.body.should.have.property('token');
                    token = res.body.token;
                    console.log(token);
                    done();
                });
        });
    });


    describe('Posts', function() {

        it('should insert post', function(done) {
            var auth = "Bearer "+token;

            var post = {
                title: 'test',
                link: 'http://test.com'
            };

            request(url)
                .post('/posts')
                .set('Authorization', auth)
                .send(post)
                .expect('Content-Type', /json/)
                .expect(200) //Status code
                // end handles the response
                .end(function(err, res) {
                    if (err) {
                        throw err;
                    }
                    // Should.js fluent syntax applied
                    res.body.should.have.property('_id');
                    res.body.should.have.property('comments');
                    res.body.title.should.equal('test');
                    res.body.link.should.equal('http://test.com');
                    post_id = res.body._id;
                    done();
                });
        });

        it('should get posts', function(done) {
            request(url)
                .get('/posts')
                .expect('Content-Type', /json/)
                .expect(200) //Status code
                // end handles the response
                .end(function(err, res) {
                    if (err) {
                        throw err;
                    }
                    // Should.js fluent syntax applied
                    res.body[0].should.have.property('_id');
                    res.body[0].should.have.property('comments');
                    res.body[0].title.should.equal('test');
                    res.body[0].link.should.equal('http://test.com');
                    done();
                });
        });

        it('should get single post', function(done) {
            request(url)
                .get('/posts/'+post_id)
                .expect('Content-Type', /json/)
                .expect(200) //Status code
                // end handles the response
                .end(function(err, res) {
                    if (err) {
                        throw err;
                    }
                    // Should.js fluent syntax applied
                    res.body._id.should.equal(post_id);
                    res.body.should.have.property('comments');
                    res.body.title.should.equal('test');
                    res.body.link.should.equal('http://test.com');
                    done();
                });
        });

        it('should upvote post', function(done) {
            var auth = "Bearer "+token;
            request(url)
                .put('/posts/'+post_id+'/upvote')
                .set('Authorization', auth)
                .expect('Content-Type', /json/)
                .expect(200) //Status code
                // end handles the response
                .end(function(err, res) {
                    if (err) {
                        throw err;
                    }
                    // Should.js fluent syntax applied
                    res.body._id.should.equal(post_id);
                    res.body.should.have.property('comments');
                    res.body.title.should.equal('test');
                    res.body.link.should.equal('http://test.com');
                    res.body.upvotes.should.equal(1);
                    done();
                });
        });

    });

    describe('Comments', function() {
        it('should insert comment', function(done) {
            var auth = "Bearer "+token;
            var comment = {
                body: 'test',
                author: 'user'
            };

            request(url)
            .post('/posts/'+post_id+'/comments')
            .set('Authorization', auth)
            .send(comment)
            .expect('Content-Type', /json/)
            .expect(200) //Status code
            // end handles the response
            .end(function(err, res) {
            if (err) {
            throw err;
            }
            res.body.should.have.property('_id');
            res.body.author.should.equal(username);
            res.body.body.should.equal('test');
            comment_id = res.body._id;
            done();
            });
        });

        it('should upvote comment', function(done) {
            var auth = "Bearer "+token;
            request(url)
                .put('/posts/'+post_id+'/comments/'+comment_id+'/upvote')
                .set('Authorization', auth)
                .expect('Content-Type', /json/)
                .expect(200) //Status code
                // end handles the response
                .end(function(err, res) {
                    if (err) {
                        throw err;
                    }
                    // Should.js fluent syntax applied
                    res.body._id.should.equal(comment_id);
                    res.body.author.should.equal(username);
                    res.body.body.should.equal('test');
                    res.body.upvotes.should.equal(1);
                    done();
                });
        });

    });



});