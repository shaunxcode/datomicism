bling = require "bling"

module.exports  = (model, field) ->
		select = bling "select.dbCombo.loading"
		cur = model.get field
		
		drawDbs = (cb) ->
				select.html ""
				DatomicIsm.connection.getStorages (storages) ->
						count = storages.length
						checkDone = ->
								count--
								if count is 0 then cb()

						for storage in storages
								do (storage) ->
										optGroup = (bling "optgroup", label: storage).appendTo select
										DatomicIsm.connection.getDatabases storage, (databases) ->
												for database in databases
														optGroup.bappend "option", value: "{:db/alias \"#{storage}/#{database}\"}", text: database

												optGroup.bappend "option", value: "new #{storage}", text: "--new db--"
												checkDone()

		select.on change: ->
				$el = $(this)
				[isNew, alias] = $el.val().split " "
				if isNew is "new"
						if name = prompt "DB Name"
								DatomicIsm.connection.createDatabase alias, name, ->
										drawDbs -> select.val "{:db/alias \"#{alias}/#{name}\"}"
				else
						model.set field, $el.val()
						select.trigger "changedValue", $el.val()

		drawDbs ->
				if cur
						select.val cur
				
				select.trigger "change"

		select