var assert = require('chai').assert;
var request = require('supertest');

var container_url = 'http://localhost:8080/annotations/';

const MEDIA_TYPE = 'application/ld+json; profile="http://www.w3.org/ns/anno.jsonld"';

describe('MUSTs', function() {
  // Annotation Container Tests
  describe('4. Annotation Containers', function() {
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

  describe('4.1. Container Retrieval', function() {
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
});
