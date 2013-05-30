lessc src/datomicism.less > lib/datomicism.css
coffee -o lib src
./node_modules/.bin/component-install
./node_modules/.bin/component-build

cp build/build.js public/js/datomicism.js
cp build/build.css public/css/datomicism.css
