class Rules extends require("./Model")
		init: ->
				@on "change", -> DatomicIsm.bus.emit "rulesChanged"

class RulesView extends require("./Widget")
		title: "Rules"
		className: "rules"

		@instances = {}
		init: ->
				RulesView.instances[@id] = @
				DatomicIsm.bus.emit "rulesChanged"

		close: ->
				@model.remove()
				delete RulesView.instances[@id]
				DatomicIsm.bus.emit "rulesChanged"

				super()

		sizeRows: ->
				height = @$el.outerHeight() - @$handleBar.outerHeight()
				@$wrapper.css height: height
				$(".CodeMirror-scroll", @$wrapper).css height: height

		refresh: ->
				cur = @editor.getCursor()
				@editor.setValue @editor.getValue()
				@editor.setCursor cur

		render: ->
				self = this
				super()
				@$widget.bappend ".main textarea", ->
						self.editor = CodeMirror.fromTextArea @textarea.get(0),
								matchBrackets: true
								mode: 
										name: "datomic"
										hooks:
												":": (keyword) =>
														return " keyword" if keyword is ":db/id"
														return " keyword" if DatomicIsm.schema.getAttribute keyword
														return " keyword missing"

								onChange: =>
										self.model.set "input", self.editor.getValue()

						self.$wrapper = $(self.editor.getWrapperElement())
				
						self.$wrapper.on({
								mousedown: (e) ->
										el = $ @
										if not el.hasClass "cm-missing"
												e.stopPropagation()
												if existingAttr = DatomicIsm.schema.getAttribute el.text()
														DatomicIsm.fetchBrowser existingAttr.paths, e
						}, ".cm-atom")

				@sizeRows()

				@$el.resizable stop: => @sizeRows()

		postAppend: ->
				@editor.setValue @model.get "input", ""
				DatomicIsm.schema.on "refreshed", => @refresh()
				@sizeRows()
				
module.exports = {Rules, RulesView}