class Connection extends require("./widget/Model")
		url: (path) -> 
			"#{@data.protocol}://#{@data.host}:#{@data.port}/#{path}"
		
		apiUrl: (path) -> 
			@url "api/#{path}"
			
		request: (type, url, data, cb, failCb) ->
			$.ajax({type, url, data, headers: Accept: "application/edn"})
				.done((result) -> cb? edn.toJS edn.parse result)
				.fail => 
					failCb?()
					@emit "disconnected"
				
		connect: (cb) ->
			@getStorages (result) =>
				@emit "connected"
				cb?()

		getStorages: (cb) ->
			@request "get", @url("data/"), {}, cb 
		
		createDatabase: (alias, name, cb) ->
			@request "post", @url("data/#{alias}/"), {"db-name": name}, cb
	
		getDatabases: (alias, cb) ->
			@request "get", @url("data/#{alias}/"), {}, cb

		getEntity: (id, cb) ->
			@request "get", @url("data/#{@data.alias}/#{@data.db}/-/entity"), {e: id}, cb 

		transact: (transaction, cb) ->
			@request "post", @apiUrl("transact"), {transaction}, (result) ->
				cb?(result)
				DatomicIsm.schema.refresh()

		query: (q, args, cb) ->
				@request "get", @apiUrl("query"), {q, args: "[{:db/alias \"#{@data.alias}/#{@data.db}\"}"+ args +"]"}, cb 

module.exports = Connection
