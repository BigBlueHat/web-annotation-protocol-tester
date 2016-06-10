var assert = require('chai').assert;
var request = require('supertest');

var container_url = 'http://localhost:8080/annotations/';

const MEDIA_TYPE = 'application/ld+json; profile="http://www.w3.org/ns/anno.jsonld"';

describe('SHOULDs', function() {
  // Annotation Container Tests
  describe('4. Annotation Containers', function() {
    it.skip('SHOULD implement the LDP Basic Container specification');
    it('SHOULD use HTTPS rather than HTTP', function(done) {
      var first_five = container_url.substr(0,5);
      assert.equal(first_five, 'https');
      done();
    });
  });

  describe('4.1.1 Client Preferences', function() {
    // if the client has no preference, the server...
    it('SHOULD return the full annotation descriptions', function(done) {
      request(container_url)
        .get('')
        .expect(function(res) {
          // check for `items`
          if (!('items' in res.body)) {
            throw new Error('Missing `items` array');
          } else {
            // check that the first item (at least) has a @context
            // TODO: use some of the JSON Schemas from
            //   https://github.com/w3c/web-annotation-tests
            res.body.items.forEach(function(item) {
              if (!('@context' in item)) {
                throw new Error('First item is not an Annotation');
              }
            });
          }
        })
        .expect(200, done);
    });
  });

  describe('4.1.2 Responses without Annotations', function() {
    var container = request(container_url);
    it('SHOULD include links to the first and last AnnotationPages in the Collection', function(done) {
      container
        .get('')
        .set('Prefer', 'return=representation;include="http://www.w3.org/ns/ldp#PreferMinimalContainer"')
        .expect(function(res) {
          if (!('first' in res.body)) {
            throw new Error('Missing IRI to `first` page');
          }
          if (!('last' in res.body)) {
            throw new Error('Missing IRI to `last` page');
          }
        })
        .expect(200, done);
    });
    it('...and without either the ldp:contains predicate or the first page of annotations embedded.', function(done) {
      container
        .get('')
        .set('Prefer', 'return=representation;include="http://www.w3.org/ns/ldp#PreferMinimalContainer"')
        .expect(function(res) {
          if ('items' in res.body) {
            throw new Error('Responses without Annotations should not have Annotations');
          }
          if ('ldp:contains' in res.body) {
            throw new Error('Responses without Annotations should not have Annotations');
          }
        })
        .expect(200, done);
    });
  });
});
