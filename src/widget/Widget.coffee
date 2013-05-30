bling = require "bling"
guid = require "../guid"
{textInput} = require "../Input"

class Widget
		class: "Widget"

		constructor: (@model, @id) ->
				@init?()
				@render()
				if not @id then @id = "widget#{guid()}"

		sizeTitleBar: ->
				@$widgetNameInput.css width: @$el.width() - (@$handle.width() + @$widgetButtons.width() + 40)

		render: ->
				@model.on "change", => @saveState()

				self = this
				@$el = bling ".widget.#{@className} .handle .title, .widgetButtons", ->
						self.$widget = @widget.attr id: self.id
						self.$handleBar = @handle
						self.$handle = @title.text self.title
						@title.after self.$widgetNameInput = textInput self.model, "widgetName"
						@widget.draggable handle: ".handle", containment: "parent"
						@widget.on "dragstop.Widget", -> self.saveState()
						@widget.on "resizestop.Widget", -> self.saveState()
						self.$widgetButtons = @widgetButtons.bappend "button.close", ->
								self.$closeButton = @close.text("x").on click: -> self.close()

				@$el.data "model", @model
				@$el.data "view", @

				@$el.on "resize.Widget", => @sizeTitleBar()
						

				if @panes?
						for pane, prct of @panes
								do (pane, prct) =>
										@$el.append @["$#{pane}"] = bling "div"
				@$el.on 
						mousedown: =>
								@raiseToTop()

						mouseenter: => 
								@$closeButton.uncloak()
								$(".ui-resizable-handle", @$el).uncloak()

						mouseleave: => 
								@$closeButton.cloak()
								$(".ui-resizable-handle", @$el).cloak()

		raiseToTop: ->
				$(".widget").not("##{@id}").not(".keepOnTop").css zIndex: 1
				@$el.css zIndex: 2

		saveState: ->
				pos = @$el.position()				 
				widgets = Storage.get "widgets", {}
				widgets[@id] =
						width: @$el.width()
						height: @$el.height()
						left: pos.left
						top: pos.top
						class: @className.upperCaseFirst()
						data: @data()

				Storage.set "widgets", widgets

		data: -> 
				if @model?
						@model.data
				else
						false

		close: ->
				@$el.remove()

				widgets = Storage.get "widgets", {}
				if widgets[@id]? then delete widgets[@id]

				Storage.set "widgets", widgets
				

		growToContent: ->
				@$widget.css height: @$widget[0].scrollHeight
				
module.exports = Widget