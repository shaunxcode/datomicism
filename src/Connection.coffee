class Connection extends require("./widget/Model")
		connect: (cb) ->
				$.post "/api/session", @data, (result) =>
						cb?(result)
						if @data.db? and @data.alias?
								@emit "connected"

		getStorages: (cb) ->
				$.get "/api/storages", cb

		createDatabase: (alias, name, cb) ->
				$.post "/api/db", alias: alias, name: name, cb

		getDatabases: (alias, cb) ->
				$.get "/api/databases/#{alias}", cb

		getEntity: (id, cb) ->
				$.get "/api/entity/#{id}", cb

		transact: (transaction, cb) ->
				$.post "/api/transact", {transaction}, (result) ->
						cb?(result)
						DatomicIsm.schema.refresh()
		query: (q, args, cb) ->

				$.get("/api/query", {query: q})
					.done(cb)
					.fail => 
						@emit "disconnected"
						alert "Error making request. Are your transactor and rest service correctly running?"

module.exports = Connection