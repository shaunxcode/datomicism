bling = require "bling"
_ = require "underscore"
kosherName = require "../kosherName"

class Query extends require("./Model")

class QueryView extends require("./Widget")
		title: "Query"
		className: "query"

		_parseClause = (clause) ->
				#[?e :at ?b]
				#[$ ?e :at ?b]
				#[(fn) [[?e ?n]]]
				#[(fn) ?b]

		parseQuery: ->
				try 
						newValue = @editor.getValue()
						parsed = edn.toJS edn.parse if newValue.trim()[0] is "[" then newValue else "[#{newValue}]"

						@query = {}
						pushOnto = false
						for atom in parsed
								if atom[0] is ":"
										@query[atom] = pushOnto = []
								else
										pushOnto.push atom
						
						@findSymbols = {}
						if @query[':find']?
								@findSymbols = @query[':find']

						@knownSymbols = {}
						if @query[':in']?
								for sym in _.flatten @query[':in']
										@knownSymbols[sym] = true
						
						if not _.isEqual @inputs, @query[':in']
								@inputs = @query[':in']
								@drawInputs()

						if @query[':where']?
								for clause in @query[':where'] when _.isArray clause
										first = _.first clause
										
										if _.isArray first
												#fn call
												false
										else if first[0] is "?"
												if attr = DatomicIsm.schema.getAttribute clause[1]
														@knownSymbols[first] = ":db/id"
												else
														@knownSymbols[first] = true

										last = _.last clause

										if _.isArray last
												for sublast in _.flatten last
														@knownSymbols[sublast] = true
										else if last[0] is "?"
												if clause[clause.length-2][0] is ":"
														if attr = DatomicIsm.schema.getAttribute clause[clause.length-2]
																@knownSymbols[last] = attr.value[':db/valueType']
														else
																@knownSymbols[last] = true

				catch e
						console.log e
						false

		_vector: (inputs) ->
				self = this
				bling ".vector", -> 
						for item in inputs
								if _.isArray item
										@vector.append self._vector item
								else
										@vector.append bling ".inputWrapper .placeholder, .control", ->
												if item[0] is "$"
														@inputWrapper.append dbCombo self.model, item
												else if item[0] is "%"
														drawCombo = =>
																rules = {}
																for n, v of RulesView.instances
																		if name = v.model.get "widgetName"
																				rules[n] = name
																@control.html comboInput rules, self.model, item

														drawCombo()
														DatomicIsm.bus.on "rulesChanged", drawCombo

												else 
														@inputWrapper.append textInput self.model, item
												@placeholder.text item

		_populateVector: (inputs) ->
				self = this
				vec = []
				for item in inputs
						do (item) ->
								if _.isArray item
										vec.push self._populateVector item
								else
										itemVal = self.model.get item
										if item[0] is "$"
												itemVal = edn.parse itemVal
										if item[0] is "%"
												rules = RulesView.instances[itemVal].model.get "input"
												itemVal = ednEncode: -> rules
										vec.push itemVal
				vec

		drawInputs: ->
				if (not _.isArray @inputs) or @inputs.length is 0
						@$inputs.hide()
						@$manualInputWrapper.hide()
						@$inputToggle.cloak()
						@$details.css height: @$buttons.outerHeight()
						@sizeCols()
				else
						@$inputToggle.uncloak()
						if @model.get("inputState") is "auto"
								@$inputToggle.text "manual input"
								@$manualInputWrapper.hide()
								@$inputs.show()
								@$inputs.html ""
								if _.isArray @inputs 
										@$inputs.html @_vector @inputs

								@$details.css height: @$buttons.outerHeight() + $(".vector", @$inputes).outerHeight() + 10
								
								@sizeCols()

						else
								@$inputToggle.text "auto input"
								@$manualInputWrapper.show()
								@$manualInput.setValue @$manualInput.getValue()
								@$inputs.hide()


				@sizeCols()

		refresh: ->
				cur = @editor.getCursor()
				@editor.setValue @editor.getValue()
				@editor.setCursor cur

		sizeCols: ->
				#get height of @$details 
				#size the codemirror in details to max it can be excluding the buttons in there
				
				handleHeight = @$handleBar.outerHeight()
				total = @$el.outerHeight() - handleHeight
				dheight = @$details.outerHeight()
				dtop = @$details.position().top - handleHeight

				@$wrapper.css height: dtop 
				$(".CodeMirror-scroll", @$wrapper).css height: dtop 
				
				inputEditorHeight = dheight - @$buttons.outerHeight() - 12

				@$manualInputWrapper.css height: inputEditorHeight
				$(".CodeMirror-scroll", @$manualInputWrapper).css height: inputEditorHeight
				@$inputs.css height: inputEditorHeight

				@$results.css marginTop: dheight, height: total - (dtop + dheight)
				@$details.css width: "100%"
				@$rowsWrapper.css height: total - (dtop + dheight + @$cols.outerHeight())

				#size columns
				frow = $("tr", @$rows).first()
				fcols = $("td", $("tr", @$cols).first())
				$("td", frow).each (i, td) ->
						makeWidth = $(td).width()

						fcols.eq(i).css width: makeWidth

				@model.set "midPaneHeight", @$details.height()

		postAppend: ->				
				DatomicIsm.schema.on "refreshed", => @refresh()

				query = @model.get "query"
				if query
						@editor.setValue query 
						@parseQuery()
						@refresh()
						if _.size @query
								@runQuery()

				@sizeCols()

		runQuery: ->
				return if not DatomicIsm.schema.loaded

				self = this

				query = @editor.getValue().trim()
				if query[0] isnt "["
						query = "[#{query}]"


				args = {}
				if @model.get("inputState") is "auto"
						if _.isArray @inputs
								try
										args = edn.encode @_populateVector @inputs
								catch e
										console.log e
				else
						args = @model.get "input", ""

				self.$cols.html ""
				self.$rows.html ""
				self.$queryMsg.text "Querying"

				DatomicIsm.connection.query query, args, (result) ->
						if (_.isArray result) and (_.size(result) > 0)
								self.$queryMsg.html ""
								if self.findSymbols.length is result[0]?.length
										self.$cols.append tr = bling "tr"
										dataTypes = []
										for sym in self.findSymbols 
												dataTypes.push self.knownSymbols[sym]
												tr.bappend "td", text: sym

								for row in result
										self.$rows.append tr = bling "tr"
										for col, i in row 
												tr.append cell = bling "td", text: col
												if dataTypes[i] in [":db/id", ":db.type/ref"]
														do (col) ->
																cell.addClass("idlink").on click: (e) => DatomicIsm.fetchEntity col, e
						else
								self.$queryMsg.text "No Results"

						self.$results.show()
						self.sizeCols()

		render: -> 
				super()

				DatomicIsm.schema.on "refreshed", => 
						@parseQuery()
						@runQuery()

				self = this
				@inputs = false

				#default setting
				@model.get "inputState", "auto"

				@$el.bappend ".@main textarea.@editorTextarea, .@details textarea.manualInput, .@inputs, .@buttons button.@inputToggle, button.query", self: @, ->
						@manualInput.val self.model.get "input", ""
						self.$manualInput = CodeMirror.fromTextArea @manualInput.get(0),
								matchBrackets: true
								extraKeys: {"Ctrl-Space": "autocomplete", "<": -> console.log "called"}
								mode: "datomic"
								onChange: ->
										self.model.set "input", self.$manualInput.getValue()
						
						self.$manualInputWrapper = $(self.$manualInput.getWrapperElement())

						@query.text("Query").on click: -> self.runQuery()


						@inputToggle.text("manual input").on click: =>
								if self.model.get("inputState") is "auto"
										self.model.set "inputState", "manual"
								else
										self.model.set "inputState", "auto"
										
								self.drawInputs()

				@$details.resizable
						containment: "parent"
						handles: "n,s"
						resize: -> self.sizeCols()
						stop: -> 
								self.sizeCols()
								self.model.set "midPaneHeight", self.$details.height()

				@$details.draggable
						containment: "parent"
						axis: "y"
						drag: -> self.sizeCols()
						stop: -> 
								self.sizeCols()
								self.model.set "midPaneTop", self.$details.position().top

				@$details
						.css(
								position: "absolute"
								top: @model.get "midPaneTop", 150
								height: @model.get "midPaneHeight", 33)
						.after bling ".@results table.@cols, .@rowsWrapper .@queryMsg, table.@rows", {self}
				

				@$el.resizable resize: => 
						@drawInputs()
						

				oldValue = ""
				@knownKeywords = {":find": true, ":in": true, ":where": true}
				@knownSymbols = {}
				@findSymbols = []

				editor = @editor = CodeMirror.fromTextArea @$editorTextarea.get(0), 
						matchBrackets: true
						mode:
								name: "datomic"
								hooks:
										"?": (symbol) =>
												return " symbol#{kosherName symbol}" if @knownSymbols[symbol]?
												return " symbol#{kosherName symbol} missing"

										":": (keyword) =>
												return " keyword" if @knownKeywords[keyword]?
												return " keyword" if $(".#{kosherName keyword}").length
												return " keyword" if DatomicIsm.schema.getAttribute keyword
												return " keyword missing"

						onChange: =>						
								newValue = editor.getValue()
								return if oldValue is newValue
								
								@model.set "query", newValue

								@parseQuery()
														
								oldValue = newValue
								@refresh()
										
								
				
				wrapper = editor.getWrapperElement()

				self.$wrapper = $(wrapper).on({
						mouseenter: ->
								$(".#{kosherName $(@).text()}").addClass "tokenActive"
						mouseleave: -> 
								$(".#{kosherName $(@).text()}").removeClass "tokenActive"
						mousedown: (e) ->
								el = $ @
								if el.hasClass "cm-missing"
										DatomicIsm.addAttribute(el.text()).$el.css
												position: "absolute"
												left: self.$el.offset().left + me.width() + 10
												top: self.$el.offset().top + 10
								else 
										e.stopPropagation()
										if existingAttr = DatomicIsm.schema.getAttribute el.text()
												DatomicIsm.addWidget Browser, BrowserView, {left: e.pageX, top: e.pageY}, undefined, existingAttr.paths
												

				}, ".cm-atom")

				$(wrapper).on({
						mouseenter: ->
								$(".cm-symbol#{kosherName $(@).text()}", self.$wrapper).addClass "tokenActive"
						mouseleave: -> 
								$(".cm-symbol#{kosherName $(@).text()}", self.$wrapper).removeClass "tokenActive"
				}, ".cm-symbol")

				@drawInputs()
				@sizeCols()
				
module.exports = {Query, QueryView}