const fs = require('fs');
const URL = require('url');

var assert = require('chai').assert;
const nconf = require('nconf');
var request = require('supertest');
var uuid = require('uuid');

// load argv, then env
nconf.argv({
  'url': {
    describe: 'URL of the Web Annotation Protocol endpoint',
    demand: true
  }
});

const container_url = nconf.get('url');
const url = URL.parse(nconf.get('url'));
const host_url = `${url.protocol}://${url.host}`;

// just ld+json here as the full profile'd media type is a SHOULD
const MEDIA_TYPE = 'application/ld+json';
const MEDIA_TYPE_REGEX = /application\/ld\+json/;

describe('MUSTs', function() {
  describe('3. Annotation Retrieval', function() {
    // TODO: get the first annotation from the first page of the container
    // and use that for these tests
    var annotation_url = 'anno1.jsonld';
    it('MUST support GET, HEAD, and OPTIONs methods (check Allow & GET)',
      function(done) {
        container
          .get(annotation_url)
          .expect('Allow', /GET/)
          .expect('Allow', /HEAD/)
          .expect('Allow', /OPTIONS/)
          .expect(200, done);
      }
    );
    it('MUST support GET, HEAD, and OPTIONs methods (check HEAD)',
      function(done) {
        container
          .head(annotation_url)
          .expect(200, done);
      }
    );
    it('MUST support GET, HEAD, and OPTIONs methods (check OPTIONS)',
      function(done) {
        // Test OPTIONS method
        container
          .options(annotation_url)
          .expect(200, done);
      }
    );
    it.skip('MUST support the JSON-LD representation using the Web Annotation profile',
      function(done) {
        // TODO: what's to check here not covered below? the `type` value?
      }
    );
    it('MUST have a Content-Type header with the application/ld+json media type',
      function(done) {
        container
          .get(annotation_url)
          .expect('Content-Type', MEDIA_TYPE_REGEX)
          .expect(200, done);
      }
    );
    it('MUST have a Link header entry where the target IRI is http://www.w3.org/ns/ldp#Resrouce and the rel parameter value is type',
      function(done) {
        // TODO: handle variations of Link headers
        var check = '<http://www.w3.org/ns/ldp#Resource>; rel="type"'
        container
          .get(annotation_url)
          .expect('Link', check)
          .expect(200, done);
      }
    );
    it('MUST have an ETag header',
      function(done) {
        container
          .get(annotation_url)
          // wide open regex to catch anything...on purpose
          .expect('Etag', /(.*)/)
          .expect(200, done);
      }
    );
    it('MUST have an Allow header',
      function(done) {
        container
          .get(annotation_url)
          .expect('Allow', /GET/)
          .expect('Allow', /HEAD/)
          .expect('Allow', /OPTIONS/)
          .expect(200, done);
      }
    );
    it('MUST have a Vary header with Accept in the value',
      function(done) {
        container
          .get(annotation_url)
          .expect('Vary', /Accept/)
          .expect(200, done);
      }
    );
  });

  // Annotation Container Tests
  describe('4. Annotation Containers', function() {
    it.skip('An Annotation Server MUST provide one or more Containers');
    it('MUST end in a "/" character', function(done) {
      assert.isTrue(container_url[container_url.length-1] === '/');
      done();
    });

    describe('4.1 Container Retrieval', function() {
      container = request(container_url);
      it('MUST support GET, HEAD, and OPTIONs methods (check Allow & GET)',
        function(done) {
          container
            .get('')
            .expect('Allow', /GET/)
            .expect('Allow', /HEAD/)
            .expect('Allow', /OPTIONS/)
            .expect(200, done);
        }
      );
      it('MUST support GET, HEAD, and OPTIONs methods (check HEAD)',
        function(done) {
          container
            .head('')
            .expect(200, done);
        }
      );
      it('MUST support GET, HEAD, and OPTIONs methods (check OPTIONS)',
        function(done) {
          // Test OPTIONS method
          container
            .options('')
            .expect(200, done);
        }
      );
      it('MUST return a description of the container',
        function(done) {
          container
            .get('')
            .expect(/BasicContainer/)
            .expect(/AnnotationCollection/)
            .expect(200, done);
        }
      );
      it('MUST be available in JSON-LD',
        function(done) {
          container
            .get('')
            .set('Accept', MEDIA_TYPE)
            .expect('Content-Type', MEDIA_TYPE_REGEX)
            .expect(200, done);
        }
      );
      it('MUST return a Link header [rfc5988] on all responses',
        function(done) {
          container
            .get('')
            .expect('Link', /(.*)/)
            .expect(200, done);
        }
      );
      it('MUST advertise its type by including a link where the rel parameter'
          + ' value is type and the target IRI is the appropriate Container Type',
        function(done) {
          container
            .get('')
            // TODO: probably should be a smarter test for this...
            .expect('Link', /rel\=\"type\"|\/ns\/ldp#|Container/)
            .expect(200, done);
        }
      );
      it('MUST advertise that it imposes Annotation protocol specific'
          + ' constraints by including a link where the target IRI is'
          + ' http://www.w3.org/TR/annotation-protocol/, and the rel parameter'
          + ' value is the IRI http://www.w3.org/ns/ldp#constrainedBy',
        function(done) {
          container
            .get('')
            // TODO: probably should be a smarter test for this...
            .expect('Link', /rel\=\"http:\/\/www.w3.org\/ns\/ldp#constrainedBy\"|\<http:\/\/www.w3.org\/TR\/annotation-protocol\//)
            .expect(200, done);
        }
      );
      it('MUST include an Etag header',
        function(done) {
          container
            .get('')
            // wide open regex to catch anything...on purpose
            .expect('Etag', /(.*)/)
            .expect(200, done);
        }
      );
      it('MUST respond with a JSON-LD representation (by default)',
        function(done) {
          container
            .get('')
            .expect('Content-Type', MEDIA_TYPE_REGEX)
            .expect(200, done);
        }
      );
      it('MUST have a Vary header that includes Accept',
        function(done) {
          container
            .get('')
            .expect('Vary', /Accept/)
            .expect(200, done);
        }
      );
    });
  });

  describe('4.2 Container Representations', function() {
    it.skip('MUST either include a link to the first page of Annotations as'
        + ' the value of the first property, or include the representation of'
        + ' the first page embedded within the response',
      function(done) {
        // TODO: test `first` is an URL or object
      }
    );
    it('MUST include a Content-Location header with the IRI as its value',
      function(done) {
        container
          .get('')
          .expect('Content-Location', /(.*)/)
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
    // Only Client-specific Requirements in 4.2.1
    it.skip('4.2.1 Client Representation Preferences', function(done) {});

    describe('4.2.2 Representations without Annotations', function() {
      it.skip('MUST NOT include either the ldp:contains predicate or the first'
          + ' page of Annotations embedded within the response (if mimimal'
          + ' representation requested)',
        function(done) {
          // TODO: test it
        }
      );
    });

    describe('4.2.3 Representations with Annotation IRIs', function() {
      // TODO: where'd the musts go?
    });

    describe('4.2.4 Representations with Annotation Descriptions', function() {
      // TODO: huh...none here either...
    });

    describe ('4.3 Annotation Pages', function() {
      it('MUST have a link to the container that it is part of, using the'
          + ' partOf property',
        function(done) {
          container
            .get('')
            // TODO: make this less...broad...
            .expect(/first/)
            .end(function(err, res) {
              if (err) throw err;
              request(host_url)
                .get(res.body.first)
                .expect(function(res) {
                  if (!('partOf' in res.body) || !('id' in res.body.partOf)) {
                    throw new Error('Paged responses must be `partOf` a collection');
                  }
                })
                .expect(200, done);
            }
          );
        }
      );
      // If it is not the first page...
      it('MUST have a link to the previous page in the sequence, using the'
          + ' prev property (if not first page)',
        function(done) {
          // test the last page to be sure it has a previous (`prev`) page
          // TODO: containers SHOULD have a link to the last page...but may not
          container
            .get('')
            // TODO: make this less...broad...
            .expect(/last/)
            .end(function(err, res) {
              if (err) throw err;
              request(host_url)
                .get(res.body.last)
                .expect(function(res) {
                  if (!('prev' in res.body)) {
                    throw new Error('Must have a link to the previous page (if not first page)');
                  }
                })
                .expect(200, done);
            }
          );
        }
      );
      it('MUST have a link to the next page in the sequence, using the'
          + ' next property (if not last page)',
        function(done) {
          // test the first page to be sure it has a next page
          container
            .get('')
            // TODO: make this less...broad...
            .expect(/first/)
            .end(function(err, res) {
              if (err) throw err;
              request(host_url)
                .get(res.body.first)
                .expect(function(res) {
                  // TODO: check "last page" scenario. See:
                  // https://github.com/BigBlueHat/web-annotation-protocol-tester/issues/4
                  if (!('next' in res.body)) {
                    throw new Error('Must have a link to the next page (if not last page)');
                  }
                })
                .expect(200, done);
            }
          );
        }
      );
    });
  });

  describe('5. Creation, Updating and Deletion of Annotations', function() {
    var makethis = {
      "@context": "http://www.w3.org/ns/anno.jsonld",
      "type": "Annotation",
      "body": {
        "type": "TextualBody",
        "value": "I like this page!"
      },
      "target": "http://www.example.com/index.html"
    };

    describe('5.1 Create a New Annotation', function() {
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

      it('MUST be the IRI of the Container with an additional component added'
          + ' to the end',
        function(done) {
          request(container_url)
            .post('')
            .set('Content-Type', MEDIA_TYPE)
            .send(makethis)
            .expect(function(res) {
              if (!('id' in res.body)
                  && res.body.id.search(container_url) > -1) {
                throw new Error('The `id` must contain the Container IRI');
              }
            })
            .end(done);
        }
      );

      // "If the Annotation contains a canonical link, then it MUST be maintained without change."
      it('MUST maintain canonical without change',
        function(done) {
          makethis.canonical = 'urn:uuid:' + uuid.v4();

          request(container_url)
            .post('')
            .set('Content-Type', MEDIA_TYPE)
            .send(makethis)
            .expect(function(res) {
              if (!('canonical' in res.body)
                  && res.body.canonical !== makethis.canonical) {
                throw new Error('The canonical IRI must be preserved');
              }
            })
            .end(done);
        }
      );


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

    describe('5.2 Suggesting an IRI for an Annotation', function() {
      // nothing to do here...all MAY and SHOULD
    });

    describe('5.3 Update an Existing Annotation', function() {
      it('MUST be done with the PUT method', function(done) {
        request(container_url)
          .post('')
          .set('Content-Type', MEDIA_TYPE)
          .send(makethis)
          .end(function(err, res) {
            if (err) throw err;
            var new_annotation = res.body;
            new_annotation.target = "http://other.example/";
            request(container_url)
              .put(res.body.id)
              .set('Content-Type', MEDIA_TYPE)
              .send(new_annotation)
              .expect(function(res) {
                if (res.body.target !== new_annotation.target) {
                  throw Error('Target should have been upated');
                }
              })
              .expect(200, done);
          });
      });
      // These are tested above...test them again...?
      it.skip('MUST return a 200 OK status with the Annotation as the body');
      it.skip('MUST return the new state of the Annotation in the response');
    });
    describe('5.4 Delete an Existing Annotation', function() {
      it('MUST use the DELETE HTTP method', function(done) {
        // create annotation
        request(container_url)
          .post('')
          .set('Content-Type', MEDIA_TYPE)
          .send(makethis)
          .end(function(err, res) {
            if (err) throw err;
            // delete annotation
            request(host_url)
              .del(res.body.id)
              // check response code
              .expect(204)
              .end(function(err, res) {
                if (err) throw err;
                done();
              });
          });
      });
      it.skip('MUST return a 204 status response', function(done) {
        // checked above
      });
      // MUST be removed from the Annotation Container it was created in
      it.skip('MUST remove the IRIs of the deleted Annotation from Container',
        function(done) {
          // load annotation page
          // delete first annotation
          // reload annotation page
          // check for annotation
        }
      );
    });
  });
});
