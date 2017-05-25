const process = require('process');

const nconf = require('nconf');

// load file config, then argv
nconf
  .file({
    file: 'config.json'
  })
  .argv({
    'url': {
      describe: 'URL of the Web Annotation Protocol endpoint'
    }
  });

try {
  nconf.required(['url']);
} catch(e) {
  console.error(e.message);
  process.exit();
}

module.exports = nconf;
