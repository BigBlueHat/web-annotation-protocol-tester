var assert = require('chai').assert;
var request = require('supertest');

var container_url = 'http://localhost:8080/annotations/';

const MEDIA_TYPE = 'application/ld+json; profile="http://www.w3.org/ns/anno.jsonld"';

describe('SHOULDs', function() {
  // Annotation Container Tests
  describe('4. Annotation Containers', function() {
    it('SHOULD use HTTPS rather than HTTP', function(done) {
      var first_five = container_url.substr(0,5);
      assert.equal(first_five, 'https');
      done();
    });
  });
});
