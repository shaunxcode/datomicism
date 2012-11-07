class exports.Server
	constructor: ->
		@datomic = require("datomic").Datomic
		@express = require "express"
		@edn = require "jsedn"
		@edn.setTokenAction "keyword", (token) -> token

		args = require("optimist")
			.usage("Pass port as -p (to use port 80 you need to sudo)")
			.default("p", "6655")
			.alias("d", "debug")
			.alias("p", "port")
			.argv

		@debug = args.d
		@port = args.p
	
	start: (port  = false) ->
		app = @express()
		server = app.listen port or= @port
		datomicSession = false
		datomicHandle = false
		checkHandle = (req, res, next) -> 
			if not datomicHandle
				res.send 400
			else
				next()

		ednResponse = (res) => (err, result) => 
			if err
				res.send 401
			else
				if result 
					res.send @edn.toJS @edn.parse result
				else
					res.send 200

		app.configure =>
			app.use @express.static "#{__dirname}/../public"
			app.use @express.bodyParser()

			app.post "/api/session", (req, res) =>
				datomicSession = req.body
				datomicHandle = new @datomic datomicSession.host, datomicSession.port, datomicSession.alias, datomicSession.db 
				res.send 201

			app.get "/api/session", (req, res) ->
				res.send datomicSession

			app.get "/api/events", checkHandle, (req, res) ->
				id = (new Date()).toLocaleTimeString()
				res.header 'Content-Type', 'text/event-stream'
				res.header 'Cache-Control', 'no-cache'
				res.header 'Connection', 'keep-alive' 

				es = datomicHandle.events()
				es.onmessage = (msg) ->
					buffer = new Buffer "stuff"
					res.write "id: #{id}\n"
					res.write "event: data\n"
					res.write "data: #{buffer.toString "utf8"}\n\n"

			app.get "/api/storages", checkHandle, (req, res) ->
				datomicHandle.storages ednResponse res

			app.get "/api/databases/:name?", checkHandle, (req, res) ->
				datomicHandle.databases req.param("name"), ednResponse res

			app.get "/api/query", checkHandle, (req, res) ->
				datomicHandle.q req.query.query, {args: req.query.args or ""}, ednResponse res

			app.get "/api/datoms", checkHandle, (req, res) ->
				datomicHandle.datoms req.query.index, req.query, ednResponse res

			app.get /^\/api\/entity\/(\d+)$/, checkHandle, (req, res) ->
				datomicHandle.entity req.params[0], {}, ednResponse res

			app.post /^\/api\/db/, checkHandle, (req, res) ->
				datomicHandle.createDatabase req.body.alias, req.body.name, (err, created) ->
					res.send if created then 201 else 200
					
			app.post "/api/transact", checkHandle, (req, res) ->
				datomicHandle.transact req.body.transaction, ednResponse res


		console.log "Server running. Go to http://localhost:#{port}"
