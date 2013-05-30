require "./String"
require "./datomic-codemirror"
_ = require "underscore"
window.edn = require "jsedn"
Emitter = require "emitter"
window.Storage = require "./Storage"
bling = require "bling"
guid = require "./guid"
kosherName = require "./kosherName"
dbCombo = require "./dbCombo"
Connection = require "./Connection"
Explorer = require "./Explorer"
CartographicSurface = require "CartographicSurface"
Comment = require "./Comment"
{Schema} = require "./Schema"
{Namespace, NamespaceView, Entity, EntityView, Browser, BrowserView, Datom, DatomView, Tips: WidgetTips, Order: WidgetOrder} = WidgetClasses = require "./widgets"
{labelPair, textInput} = require "./Input"

window.DatomicIsm =
		fetchEntity: (entityId, e) ->
				DatomicIsm.addWidget Entity, EntityView, {left: e.pageX, top: e.pageY}, undefined, {searchBy: "byId", byId: entityId}

		fetchBrowser: (paths, e) ->
				DatomicIsm.addWidget Browser, BrowserView, {left: e.pageX, top: e.pageY}, undefined, paths

		fetchDatom: (entityId, attribute, e) ->
				DatomicIsm.addWidget Datom, DatomView, {left: e.pageX, top: e.pageY}, undefined, {entityId, attribute}

		addAttribute: (kw, data = {type: ":db.type/string"}) ->
				[namespaceName, attributeName] = kw[1..-1].split("/")
				useNamespace = false
				for namespace in DatomicIsm.namespaces when namespace.get("name") is namespaceName
						useNamespace = namespace
												
				if not useNamespace
						useNamespace = new Namespace name: namespaceName
						DatomicIsm.namespaces.push useNamespace
						DatomicIsm.views[useNamespace.id] = view = new NamespaceView useNamespace
						view.$el.appendTo "body"
				else 
						view = DatomicIsm.views[useNamespace.id]
												
						for attribute in useNamespace.attributes when attribute.get("name") is attributeName
								return
								
				data.name = attributeName	
				view.addAttribute data
				DatomicIsm.refreshQueries()
				if view 
						view.$el.css position: "absolute"
				view
						
		drawToolbar: ->
			self = this
			@toolbar = (bling "ul", class: "toolbar").appendTo("body")
			bling ".Logo img, .LogoText", appendTo: @toolbar, onCreate: -> 
				@img.prop src: "/img/logo.png"
				@LogoText.text "Datomicism"
				@Logo.on
					mouseenter: -> $(this).find(".LogoText").animate bottom: 0, "fast"
					mouseleave: -> $(this).find(".LogoText").animate bottom: -14, "fast"
					click: -> window.open "http://github.com/shaunxcode/datomicism"
					
			$win = $(window)
			
			stopHandler = (modelClass, viewClass) => (e, ui) =>
						pos = 
								left: ui.position.left + $win.scrollLeft()
								top: ui.position.top + $win.scrollTop()

						added = self.addWidget modelClass, viewClass, pos
						added.view.postDrop?()
						
			for widget in WidgetOrder
				do (widget) -> 
					bling("li a, img", ->
							self.toolbar.append @li
							@img.prop src: "/img/draggable.png"
							@a.text widget 
							@a.prop title: WidgetTips[widget]
						).draggable
							helper: "clone"
							stop: stopHandler WidgetClasses[widget], WidgetClasses["#{widget}View"]
						
			connectButton = bling("button.connect", text: "connect").appendTo(@toolbar).on click: =>
						return if $(".connectModal").length

						drawDbOptions = ->
								if (host = self.connection.get("host"))?.length and (port = self.connection.get("port"))?.length
										self.connection.connect ->
												comboPlaceholder.html labelPair "db", combo = dbCombo self.connection, "db-alias"
												combo.on "changedValue", (evt, val) ->
														[alias, db] = (edn.parse val).at(":db/alias").split "/"
														self.connection.set "db", db
														self.connection.set "alias", alias
														buttons.$ok.prop "disabled",false

						modal = bling ".connectModal.modal", ->
								for field in ["host", "port"]
										@modal.append labelPair field, input = textInput self.connection, field
										input.on "changedValue", drawDbOptions

						modal.append comboPlaceholder = bling "div"
						modal.bappend "button.@ok, button.@cancel", {self: buttons = {}}, ->
								@cancel.text("close").on click: ->
										modal.remove()

								@ok.prop("disabled", true).text("OK").on click: ->
										Storage.set "connection", self.connection.data
										self.connection.connect ->
												modal.remove()

						console.log buttons
						drawDbOptions()
						modal.addClass "connection"
						modal.appendTo "body"

			self.connection.on "connected", -> connectButton.text "connection [connected]"
			self.connection.on "disconnected", -> connectButton.text "connect [disconnected]"

		addWidget: (modelClass, viewClass, pos, id, data = {}) ->
				id or= "widget#{guid()}"
				model = new modelClass data
				view = new viewClass model, id

				view.$el.appendTo "body"
				pos.position = "absolute"
				view.$el.css pos
				view.saveState?()
				view.postAppend?()
				view.raiseToTop()
				view.$name?.focus()
				view.sizeTitleBar?()
				@map.drawNodes()
				@explorer.drawNodes()
				{model, view}

		schemaHint: ->
				console.log arguments

		init: ->
			oldAppend = $.fn.append
			$.fn.append = -> oldAppend.apply(@, arguments).trigger("append")
			$.fn.cloak = -> $(@).css visibility: "hidden"
			$.fn.uncloak = -> $(@).css visibility: "visible"
			$.fn.toCenter = -> 
					el = $ @
					el.css
							left: ($(window).width() / 2) - (el.outerWidth() / 2)
							top: ($(window).height() / 2) - (el.outerHeight() / 2)

			for m in ["before", "after", "append", "prepend"]
					do (m) -> $.fn["b#{m}"] = -> @[m] bling.apply {}, arguments

			window.markdown = new Showdown.converter

			edn.setTokenAction "keyword", (token) -> token

			edn.setEncodeHandler "comment", ((obj) -> obj instanceof Comment), (obj) -> obj.ednEncode()

			#hack for simple pretty printing
			edn.setEncodeAction "object", (obj) ->
					result = []
					max = _.size(obj) - 1
					i = 0
					for k, v of obj
							result.push edn.encode ":#{k}"
							result.push "#{edn.encode v}#{if i is max then "" else "\n"}"
							i++
					lines = "\n{#{result.join " "}}".split "\n"
					(" #{line}" for line in lines).join("\n") + "\n"

			CodeMirror.commands.autocomplete = (cm) ->
					CodeMirror.simpleHint cm, DatomicIsm.schemaHint 

			@bus = new Emitter

			@map = new CartographicSurface surface: "body", selector: ".widget", scale: 0.08
			@map.render().$el.appendTo "body"

			@explorer = new Explorer surface: "body", selector: ".widget"
			@explorer.render().$el.appendTo "body"

			connectionData = Storage.get "connection", {}
			@connection = new Connection connectionData
			@schema = new Schema
			@connection.on "connected", => @schema.refresh()
			if _.size connectionData 
				@connection.connect() 
			else
				Storage.set "widgets",
					defaultNote:
						width: 370
						height: 175
						left: 42
						top: 66
						class: "Note"
						data:
							widgetName: null
							":db/id": null
							note: "#Welcome to datomicism!\nTo get started: click connect at the top right and enter your host/port and choose your database. Once you have a connection try dragging down a Browser or any other widget and start exploring! If you need help submit an [issue on github](http://github.com/shaunxcode/datomicism/issues) or email me directly [shaunxcode@gmail.com](mailto://shaunxcode@gmail.com)"
	
			@views = {}
			@drawToolbar()

			for wid, widget of Storage.get "widgets", {}
					modelClass = WidgetClasses[widget.class]
					viewClass = WidgetClasses[widget.class + "View"]
					pos = 
							left: widget.left
							top: widget.top
							width: widget.width
							height: widget.height

					added = @addWidget modelClass, viewClass, pos, wid, widget.data
					added.view.$el.trigger "mouseleave"

			@map.drawNodes()
			@explorer.drawNodes()
			$(window).scrollTop(100).scrollTop(0)
			
			$("body").on {
					mouseenter: ->
							$(".entity-#{kosherName $(@).text()}").addClass "lit"
					mouseleave: ->
							$(".entity").removeClass "lit"
			}, ".idlink"

			$(document).on keydown: (e) ->
					if e.keyCode in [$.ui.keyCode.LEFT, $.ui.keyCode.RIGHT, $.ui.keyCode.UP, $.ui.keyCode.DOWN]
							e.preventDefault()
							
module.exports =  DatomicIsm