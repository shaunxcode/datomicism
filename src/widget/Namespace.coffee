_ = require "underscore"
bling = require "bling"
Model = require "./Model"
{types, uniqueTypes, cardinalityTypes} = require "../datomicTypes"
{keyHandler, nameInput, textAreaInput, labelPair, uniqueCombo, checkbox, oneOrManyToggle, typeCombo} = require "../Input"
kosherName = require "../kosherName"

class Attribute extends Model
	
class Record extends Model
		dataForTransaction: ->
				result = {}
				tid = 0
				if @isNew()
						result["db/id"] = new edn.Tagged new edn.Tag("db/id"), new edn.Vector [":db.part/user", -++tid]
				for k, v of @data when v? 
						result[if k is "db/id" then k else "#{@ns}/#{k}"] = v
				result
				
class Namespace extends Model
		init: ->
				@attributes = []
				@recordMap = {}
				@records = []

		ednPrep: ->
				ns = @get "name"
				out = []				
				for attribute, i in @attributes
						continue if not attribute.get "name"				

						item = 
								"db/id": new edn.Tagged(new edn.Tag("db", "id"), [":db.part/db"])
								"db/ident": ":#{ns}/#{attribute.get "name"}"
								"db/valueType": attribute.get ":db/valueType"
								"db/cardinality": attribute.get ":db/cardinality"
 
						attribute.set ":db/ident", item["db/ident"]
						attribute.set ":db/id", true 
						attribute._isNew = false
						for option in ["doc","unique","index","fulltext","isComponent","noHistory"]
								if (val = attribute.get ":db/#{option}") and not _.isNull val
										item["db/#{option}"] = val
						
						item["db.install/_attribute"] = ":db.part/db"
														
						out.push item 
				out

		_fetchEntities: (cb) ->
				self = this
				@entities = []
				checkCount = @attributes.length
				checkDone = ->
						checkCount--
						cb() if not checkCount

				for attr in @attributes
						DatomicIsm.connection.query "[:find ?id :where [?id :#{@get "name"}/#{attr.get "name"}]]", {}, (ids) ->
								for id in ids when (_.first id) not in self.entities
										self.entities.push	_.first id
								checkDone()

		fetchRecords: (cb, offset = 0, size = 4) ->
				self = this
				
				_fetch = ->
						start = if offset then (offset*size)+1 else 0
						subset = self.entities[start..start+size]
						subsetRecs = []
						checkCount = subset.length

						if checkCount is 0 
								return cb? []

						checkDone = ->
								checkCount--
								if not checkCount
										self.emit "recordsFetched", self.records
										cb? subsetRecs

						for k in subset
								DatomicIsm.connection.getEntity k, (rec) ->
										if self.recordMap[rec[":db/id"]]?
												self.records[self.recordMap[rec[":db/id"]]].update rec
										else
												self.recordMap[rec[":db/id"]] = self.records.push(new Record rec, false)-1
										subsetRecs.push self.records[self.recordMap[rec[":db/id"]]]
										checkDone()

				if offset is 0				
						@_fetchEntities _fetch
				else
						_fetch()
class NamespaceView extends require("./Widget")
		title: "Namespace"
		className: "namespace"

		attributeDefaults: ->
				type: ":db.type/string"
				cardinality: ":db.cardinality/one"
						
		constructor: (@model, @id) -> 
				super @model, @id
				@attributes = []
				@records = []

				@_state = "attributes"

				if @model.isNew()
						@$el.addClass "pendingChanges"
				else
						@$el.addClass "noChanges"


				DatomicIsm.schema.whenLoaded =>
						if @model.get "name"
								@model = DatomicIsm.schema.getNamespace @model.get "name"
								@$el.removeClass "pendingChanges"
								@$el.addClass "noChanges"
								@drawAttributes()

						@model.on "recordsFetched", (records) =>
								@addRecord(record) for record in records

		drawAttributes: ->
				@$attributes.html ""
				for attr in @model.attributes
						@addAttribute attr, false

		attributeOptions: (model, main, options, isNew = false) ->
				options.bappend ".optionHolder", -> @optionHolder.append(
						labelPair "doc", textAreaInput model, ":db/doc"
						labelPair "unique", uniqueCombo model, ":db/unique"
						labelPair "index", checkbox model, ":db/index"
						labelPair "fulltext", checkbox model, ":db/fulltext"
						labelPair "component", checkbox model, ":db/isComponent"
						labelPair "no history", checkbox model, ":db/noHistory")
													 
				right = "&#x25BA;"
				down = "&#x25BC;"
				
				main.prepend optionsToggle = bling "div.optionsToggle", html: right
				
				if not model.get ":db/ident"
						main.append(
								card = oneOrManyToggle model, ":db/cardinality"
								type = typeCombo model, ":db/valueType") 
						type.trigger "change"
				else
						main.append(
								bling "span.cardinality", text: cardinalityTypes[model.get(":db/cardinality")]
								bling "div.valueType span", ->
										@span.text _.last model.get(":db/valueType", "/n/a").split("/"))

				optionsToggle.on click: ->
						if options.is ":visible"
								options.slideUp "fast"
								optionsToggle.html right
						else
								optionsToggle.html down
								options.slideDown "fast"

		addAttribute: (data, isNew = true) ->
				self = this
				if data instanceof Attribute
						model = data
						isNew = false
				else
						model = new Attribute data, isNew
						@model.attributes.push model
						@_showTransactButton = true
						@$el.removeClass "noChanges"
						@$el.addClass "pendingChanges"
						@showTransactButton()

				if isNew
						kosherClass = kosherName ":#{@model.get "name"}/#{model.get "name"}"
				else
						kosherClass = kosherName model.get ":db/ident"
						model.set "name", _.last model.get(":db/ident").split("/")

				@$actionCol.before column = bling "th.header.cell", text: model.get "name"

				@$attributes.bappend ".attribute.#{kosherClass} .main, .options", ->
						@main.append(
								name = nameInput model, "name"
								removeButton = bling "button.removeButton", text: "x", css: visibility: "hidden")

						self.attributeOptions model, @main, @options, isNew
						@options.hide()

						removeButton.on click: =>
							 self.model.attributes = (attribute for attribute in self.model.attributes when attribute isnt model)
							 @attribute.remove()
							 
							 pos = column.parent().children().index(column[0])
							 for row in $("tr", self.$rows)
										$(row).children().eq(pos).remove()
							 column.remove()

						if isNew
								@attribute.on
										mouseenter: -> removeButton.css visibility: "visible"
										mouseleave: -> removeButton.css visibility: "hidden"

						if not isNew
								name.replaceWith bling "span.name", text: _.last model.get(":db/ident").split("/")
						else
								name.on 
										keyup: keyHandler
												ENTER: ->
														self.addAttribute self.attributeDefaults()
														self.focusLastAttribute()

												UP: ->
														if not $(".nameInput", name.parent().parent().prev(".attribute")).focus().length
																self.$name.focus()

												DOWN: ->
														if not $(".nameInput", name.parent().parent().next(".attribute")).focus().length
																self.$name.focus()

										changedValue: => 
												newKosherClass = kosherName ":#{self.model.get "name"}/#{model.get "name"}"
												@attribute.attr class: "attribute #{newKosherClass}"
												column.text model.get "name"
												kosherClass = newKosherClass


		showCellHalo: (cell, attr) ->
				self = this
				@hideCellHalo()
				@cellHalo = bling ".cellHalo button.retract, button.history, button.idToggle", ->
						hideTimeout = false
						ignoreBlur = false
						@retract.text("x").on
								mousedown: (e) ->
										e.stopPropagation
										console.log "retract"

						@history.text("h").on
								mousedown: (e) ->
										e.stopPropagation()
										console.log "show history"

						@idToggle.text("id").on
								mousedown: (e) ->
										e.stopPropagation()
										console.log "show id"
						
						@cellHalo.appendTo($("body"))
								.css
										left: cell.offset().left 
										top: cell.offset().top + cell.outerHeight() + 1
										width: cell.outerWidth() - 11
								.on
										mouseenter: ->
												ignoreBlur = true
												clearTimeout hideTimeout
										mousedown: (e) ->
												ignoreBlur = false
												clearTimeout hideTimeout
												e.stopPropagation()

						cell.on blur: (=> return if ignoreBlur; hideTimeout = setTimeout (=> @cellHalo.remove()), 300), "input"


		hideCellHalo: ->
				@cellHalo?.remove()

		getAttributeInput: (attribute, recordModel, hideables) ->
				switch type = attribute.get ":db/valueType"
						when ":db.type/string"
								nameInput recordModel, attribute.get "name"

						when ":db.type/boolean"
								checkbox recordModel, attribute.get "name"

						when ":db.type/long", ":db.type/bigint", ":db.type/ref"
								if type is ":db.type/ref"
										#check if there is an enum
										if enums = DatomicIsm.schema.data[@model.get "name"]?.data.enums?[attribute.get "name"]
												select = bling "select"
												for n, v of enums
														select.bappend "option", value: v[":db/id"], text: n

												return select

										else
												return bling ".entityVal, .entityNS, .entityField, .entityBrowse", ->
														entityVal = @entityVal
														hideables.push @entityBrowse
														hideables.push @entityNS
														@entityBrowse.html("&#8230;").on mousedown: =>
																ev = new EntityView new Entity
																ev.onSelect = (field, entity) =>
																		ev.$el.remove()
																		@entityNS.text field
																		@entityField.html bling "select", ->
																				for f,v of entity
																						@select.bappend "option", text: _.last(f.split("/")), value: v
																				
																				hideables.push @select

																				@select.on change: =>
																						entityVal.text @select.val()

																				@select.cloak()
																				@select.trigger "change"

																ev.$searchForm.prepend bling ".message", text: "The next entity you select will be used as the ref"
																ev.$el.appendTo "body"
																ev.$el.css(position: "absolute").toCenter()
														
														@entityNS.text "--"
														@entityVal.text ''

								textInput recordModel, attribute.get("name"), (e, input) ->
										num = parseInt input.val()
										if _.isNumber(num) and not _.isNaN(num)
												input.val num
										else
												input.val ""

						when ":db.type/double", ":db.type/float", ":db.type/bigdec"
								textInput recordModel, attribute.get("name"), (e, input, inblur) ->
										if inblur 
												val = input.val()
												
												if "." in String(val)
														return val
												else
														input.val "#{val}.0"
														return	input.val()

										return if regex.floatStart.test input.val()
										return if regex.float.test input.val()

										num = parseFloat input.val()
										if _.isNumber(num) and not _.isNaN(num)
												input.val num
										else
												input.val ""								

						when ":db.type/keyword"
								textInput recordModel, attribute.get("name"), (e, input) ->
										return if regex.keyword.test input.val()
										input.val ""

		addRecord: (data) ->
				self = this
				if data instanceof Record
						model = data
				else 
						model = new Record data

				model.ns = @model.get "name"
				@records.push model

				@$rows.bappend "tr.row", (row) ->
						hideable = []
						hidebuttons = -> el.cloak() for el in hideable
						unhidebuttons = -> el.uncloak() for el in hideable

						for attribute in self.model.attributes
								do (attribute) =>
										row.append cell = bling "td", html: input = self.getAttributeInput attribute, model, hideable
										input.on 
												focus: ->
														self.showCellHalo cell, attribute
														$(".remove", self.$rows).cloak()
														removeButton.uncloak()

										model.on "change:#{attribute.get "name"}", ->
												cell.addClass "pendingChanges"

						removeButton = false

						model.on "change", ->
								self._showTransactButton = true
								self.$transactButton.uncloak()

						row.append bling "td button.remove", -> 
								removeButton = @remove.text("x").cloak().on click: ->
										row.remove()
								hideable.push removeButton
								row.on
										mouseenter: unhidebuttons
										mouseleave: hidebuttons


				$("tr:last td:first input", @$records).focus()

		focusFirstAttribute: ->
				$(".attribute .nameInput", @$el).first().focus()

		focusLastAttribute: ->
				$(".attribute .nameInput", @$el).last().focus()

		activeFocus: ->
				$(window.document.activeElement)

		focusInputLeft: ->
				if not $("input", @activeFocus().parent().prev()).focus().length
						console.log "no left"

		focusInputRight: ->
				if not $("input", @activeFocus().parent().next()).focus().length
						console.log "no right"

		focusInputUp: ->
				cell = @activeFocus().parent()
				pos = cell.parent().children().index(cell)

				if not $("input", cell.parent().prev()).eq(pos).focus().length
						console.log "no up"

		focusInputDown: ->
				cell = @activeFocus().parent()
				pos = cell.parent().children().index(cell)

				if not $("input", cell.parent().next()).eq(pos).focus().length
						console.log "no down"

		setupRecords: ->
				self = this
				@$records.bappend "table thead.columns, tbody.rows", ->
						self.$rows = @rows
						@columns.append bling "tr th.actionCol.cell", -> 
								self.$actionCol = @actionCol.html("&nbsp;")
						
				@$records.on keydown: (keyHandler 
						ENTER: => @addRecord()
						LEFT:	 => @focusInputLeft()
						RIGHT: => @focusInputRight()
						UP:		 => @focusInputUp()
						DOWN:	 => @focusInputDown()
				), "td input" 

		showTransactButton: ->
				if @model.hasPendingChanges() or @_showTransactButton
						@$transactButton.uncloak()

		sizeRows: ->
				@$attributes.css height: @$el.outerHeight() - (@$nameHeader.outerHeight() + @$buttons.outerHeight() + @$handleBar.outerHeight() + 30)

		postAppend: ->
				@sizeRows()

		render: ->
				super()

				self = this

				@$el.resizable resize: => @sizeRows()

				@$el.bappend ".@nameHeader, .@attributes, .@records, .@buttons button.addAttribute, button.addRecord", {self}, ->
						@records.hide()
						self.setupRecords()

						@nameHeader.html self.$name = (nameInput self.model, "name").on keyup: keyHandler
								ENTER: ->
										self.addAttribute self.attributeDefaults()
										self.focusLastAttribute()

								UP: ->
										self.focusLastAttribute()

								DOWN: ->
										self.focusFirstAttribute()

						if self.model.get ":db/id"
								self.$name.replaceWith bling "span", text: self.model.get "name"

						@nameHeader.append transactButton = bling "button.@transactButton", {self}, ->
								@button.text("Transact").on click: =>
										@button.cloak()
										if self._state is "records"
												transaction = []
												recordIds = []
												for record in self.records
														if record.hasPendingChanges()
																transaction.push record.dataForTransaction()
																recordIds.push record.id

												console.log edn.encode transaction

												DatomicIsm.connection.transact (edn.encode transaction), (result) ->
														$("td.pendingChanges", self.$el).removeClass "pendingChanges"
														self._showTransactButton = false
										else
												DatomicIsm.connection.transact (edn.encode self.model.ednPrep()), ->
														self.$el.removeClass "pendingChanges"
														self.$el.addClass "noChanges"
														self.drawAttributes()
														self._showTransactButton = false 


						transactButton.cloak()

						self.model.on "change", -> transactButton.uncloak()

						@addAttribute.text("+")
								.on click: -> 
										self.addAttribute self.attributeDefaults()
										self.focusLastAttribute()

						@addRecord.hide().text("+")
								.on click: ->
										self.addRecord()

						@buttons = @buttons.add self.$closeButton
						@buttons.cloak()
						
						self.$el.on
								dragstart: => 
										self.hideCellHalo() 
								mouseenter: => 
										@buttons.uncloak()
										self.showTransactButton()
								mouseleave: =>
										if not self.$el.hasClass "ui-draggable-dragging"
												self.hideCellHalo()
												transactButton.cloak()
												@buttons.cloak()
												
module.exports = {Attribute, Record, Namespace, NamespaceView}