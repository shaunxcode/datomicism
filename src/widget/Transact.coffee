bling = require "bling"

class Transact extends require("./Model")
	
class TransactView extends require("./Widget")
		title: "Transact"
		className: "transact"
		txcols: [":e", ":a", ":v", ":tx", ":added"]

		sizeRows: ->
				tbarHeight = @$handleBar.outerHeight()
				bpos = @$buttons.position().top - tbarHeight
				avail = (@$el.outerHeight() - tbarHeight)
				@$wrapper.css height: bpos
				$(".CodeMirror-scroll", @$wrapper).css height: bpos
				@$results.css height: avail - (bpos + @$buttons.height() + 19)

		refresh: ->
				cur = @editor.getCursor()
				@editor.setValue @editor.getValue()
				@editor.setCursor cur

		render: ->
				super()

				self = this

				@$el.bappend ".main textarea, .buttons button.transact", ->
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
						
						self.$buttons = @buttons.draggable
								axis: "y"
								containment: "parent"
								drag: -> self.sizeRows()
								stop: ->
										self.sizeRows()
										self.model.set "midPaneTop", self.$buttons.position().top

						self.$buttons.css 
								position: "absolute"
								top: self.model.get "midPaneTop", 150

						@buttons.after self.$results = bling "pre.results"

						@transact.text("Transact").on click: ->
								self.$results.text "transacting"
								DatomicIsm.connection.transact self.editor.getValue(), (result) ->
										self.$results.html bling "table thead, tbody", ->
												@thead.append htr = bling "tr"
												for f in self.txcols 
														htr.bappend "td", text: f

												for tx in result[":tx-data"]
														attr = false
														@tbody.append bling "tr", ->
																for f in self.txcols
																		do (f, tx) =>
																				@tr.append cell = bling "td", text: tx[f]
																				if	f is ":a"
																						attr = DatomicIsm.schema.getAttributeById tx[f]
																						cell.text attr.value[":db/ident"]
																				
																				if f is ":v"
																						vattr =	 DatomicIsm.schema.getAttributeById tx[f]
																						if vattr
																								cell.text vattr.value[":db/ident"]

																				if (f in [":e", ":a", ":tx"]) or (f is ":v" and attr and (attr.value[":db/valueType"] is ":db.type/ref"))
																						cell.addClass("idlink").on click: (e) ->
																								DatomicIsm.fetchEntity tx[f], e


				@$el.resizable resize: => @sizeRows()
		
				self.$wrapper.on({
						mousedown: (e) ->
								el = $ @
								if not el.hasClass "cm-missing"
										e.stopPropagation()
										if existingAttr = DatomicIsm.schema.getAttribute el.text()
												DatomicIsm.fetchBrowser existingAttr.paths, e

				}, ".cm-atom")

				this

		postAppend: ->
				@sizeRows()
				@editor.setValue @model.get "input", ""
				DatomicIsm.schema.on "refreshed", => @refresh()

module.exports = {Transact, TransactView}