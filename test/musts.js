var assert = require('chai').assert;
var request = require('supertest');

var host_url = 'http://localhost:8080'
var container_url = host_url + '/annotations/';

const MEDIA_TYPE = 'application/ld+json; profile="http://www.w3.org/ns/anno.jsonld"';

describe('MUSTs', function() {
  // Annotation Container Tests
  describe('4. Annotation Containers', function() {
    it.skip('An Annotation Server MUST provide one or more Containers');
    it('MUST end in a "/" character', function(done) {
      assert.isTrue(container_url[container_url.length-1] === '/');
      done();
    });

    container = request(container_url);
    it('MUST respond (by default) with an Annotation Container', function(done) {
      container
        .get('')
        .expect('Content-Type', MEDIA_TYPE)
        .expect(200, done);
    });
  });

  describe('4.1 Container Retrieval', function() {
    container = request(container_url);
    it('MUST support GET, HEAD, and OPTIONs methods', function(done) {
      container
        .get('')
        .expect('Allow', /GET/)
        .expect('Allow', /HEAD/)
        .expect('Allow', /OPTIONS/)
        .expect(200, done);
    });
  });

  // 4.1.1 Client Preferences are not tested here...
  // ...this *is* the client and we're testing the server

  describe('4.1.3 Responses with Annotations', function() {
    it('MUST use the paged collection model', function(done) {
      container
        .get('')
        .expect(function(res) {
          if ('items' in res.body) {
            throw new Error('AnnotationCollection MUST NOT contain items'
                + ' directly; only link to pages');
          }
        })
        .expect(200, done)
    });
    it('MUST also have a link to the first page of its contents using first',
      function(done) {
        container
          .get('')
          .expect(function(res) {
            if (!('first' in res.body)) {
              throw new Error('AnnotationCollection MUST reference at least the'
                  + ' first AnnotationPage');
            }
          })
          .expect(200, done)
      }
    );
    it('MUST include a Content-Location header with the IRI as its value',
      function(done) {
        container
          .get('')
          .expect(function(res) {
            var cl = res.headers['content-location'];
            var id = res.body.id;
            if (cl !== id) {
              throw new Error('Content-Location and `id` MUST match');
            }
          })
          .expect(200, done)
      }
    );
    describe('Page Response', function() {
      it('MUST have a link to the container that it is part of, using the partOf property',
        function(done) {
          container
            .get('')
            .end(function(err, res) {
              request(host_url)
                .get(res.body.first)
                .expect(function(res) {
                  if (!('partOf' in res.body) || !('id' in res.body.partOf)) {
                    throw new Error('Paged responses must be `partOf` a collection');
                  }
                })
                .expect(200, done);
            });
        }
      );
      // If it is not the first page...
      it('MUST have a link to the previous page in the sequence, using the prev property (if not first page)',
        function(done) {
          // test the last page to be sure it has a previous (`prev`) page
          // TODO: containers SHOULD have a link to the last page...but may not
          container
            .get('')
            .end(function(err, res) {
              request(host_url)
                .get(res.body.last)
                .expect(function(res) {
                  if (!('prev' in res.body)) {
                    throw new Error('Must have a link to the previous page (if not first page)');
                  }
                })
                .expect(200, done);
            });
        }
      );
      // If it is not the last page...
      it.skip('MUST have a link to the next page in the sequence, using the next property (if not last page)',
        function(done) {
          // test the first page to be sure it has a next page
          container
            .get('')
            .end(function(err, res) {
              request(host_url)
                .get(res.body.first)
                .expect(function(res) {
                  if (!('next' in res.body)) {
                    throw new Error('Must have a link to the next page (if not last page)');
                  }
                })
                .expect(200, done);
            });
        }
      );
    });
  });
  describe('5. Creation, Updating and Deletion of Annotations', function() {
    describe('5.1 Create a New Annotation', function() {
      var makethis ={
        "@context": "http://www.w3.org/ns/anno.jsonld",
        "type": "Annotation",
        "body": {
          "type": "TextualBody",
          "value": "I like this page!"
        },
        "target": "http://www.example.com/index.html"
      };

      it('MUST assign an IRI to the Annotation resource in the id property,'
          + ' even if it already has one provided', function(done) {
        request(container_url)
          .post('')
          .set('Content-Type', MEDIA_TYPE)
          .send(makethis)
          .expect(function(res) {
            if (!('id' in res.body)) {
              throw new Error('The `id` must be set by the server.');
            }
          })
          .end(done);
      });

      it('MUST respond with a 201 Created response if the creation is successful',
        function(done) {
          request(container_url)
            .post('')
            .set('Content-Type', MEDIA_TYPE)
            .send(makethis)
            .expect(201, done);
        }
      );

      it("MUST have a Location header with the Annotation's new IRI",
        function(done) {
          request(container_url)
            .post('')
            .set('Content-Type', MEDIA_TYPE)
            .send(makethis)
            .expect(function(res) {
              if (res.body.id !== res.header['location']) {
                console.log(res.body.id);
                console.log(res.header['location']);
                throw new Error('Location header should match the id');
              }
            })
            .end(done);
        }
      );
    });
  });
});
