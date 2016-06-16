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
      it.skip('MUST have a link to the previous page in the sequence, using the prev property',
        function(done) {
          // TODO: can the client know if it's the first page?
        }
      );
      // If it is not the last page...
      it.skip('MUST have a link to the next page in the sequence, using the next property',
        function(done) {
          // TODO: can the client know if it's the last page?
        }
      );
    });
  });
});
