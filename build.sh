lessc src/datomicism.less > public/css/datomicism.css
component install
component build
coffee -o build src
cp build/Server.js lib/Server.js
cp build/build.js public/js/libs.js
cp build/build.css public/css/libs.css
cp build/datomicism.js public/js/datomicism.js
cp build/datomic-codemirror.js public/js/datomic-codemirror.js
