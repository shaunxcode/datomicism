class exports.Server
	constructor: ->
		@express = require "express"

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
		app.use @express.static "#{__dirname}/../public"
		app.listen port or= @port

		console.log "Server running. Go to http://localhost:#{port}"
