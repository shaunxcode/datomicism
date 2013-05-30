bling  = require "bling"
sketch = require "sketch"
ColorPicker = require "color-picker"
{labelPair, comboInput} = require "../Input"

class Sketch extends require("./Model")

class SketchView extends require("./Widget")
		title: "Sketch"
		className: "sketch"

		sizeRows: ->
				@$canvas.prop
						width: @$el.outerWidth()
						height: @$el.outerHeight() - (@$handleBar.outerHeight() + @$tools.outerHeight()) 

				@sketch.clear()
				@sketch.import(@model.get "objs", []).draw()
				@$activeColor.css background: @model.get "color", "rgb(0,0,0)"
				@$sizeInput.trigger "change"

		render: ->
				self = this
				super()

				@$el.resizable stop: => @sizeRows()
				@$el.append bling ".main .@tools, @canvas", {self}

				@$tools.append(
						labelPair "size", (@$sizeInput = comboInput {0.5: "small", 1: "normal", 4: "medium", 8: "large", 10: "huge"}, @model, "size")

						bling "button", text: "clear", on: click: => 
								@model.set "objs", [], true
								@sketch.clear()
						keepOnTop = bling "button", html: "[#{if @model.get "keepOnTop" then "x" else "&nbsp;"}] keep on top", on: click: =>
								if @model.get "keepOnTop"
										@model.set "keepOnTop", false
										keepOnTop.html "[&nbsp;] keep on top"
										@$el.removeClass "keepOnTop"
								else
										@model.set "keepOnTop", true
										keepOnTop.html "[x] keep on top"
										@$el.addClass "keepOnTop"

						bling "button", text: "hide chrome", on: click: =>
								@$el.addClass "nochrome"
								@model.set "hidechrome", true
								@sizeRows()
								@$showChrome.uncloak()
						noBg = bling "button", html: "[#{if @model.get "nobackground" then "x" else "&nbsp;"}] no background", on: click: =>
								if @model.get "nobackground"
										@model.set "nobackground", false
										noBg.html "[&nbsp;] no background"
								else
										@model.set "nobackground", true
										noBg.html "[x] no background")

				bling "span.@activeColor", self: self, appendTo: @$tools

				@$el.append bling "button.@showChrome", {self}

				@$activeColor.on click: (e) ->
					bling ".pickerHolder button.@ok", appendTo: "body", ->
						@ok.text("ok").on click: => @pickerHolder.remove()

						picker = new ColorPicker
						@pickerHolder.prepend(picker.el).css 
								position: "absolute"
								left: e.pageX
								top: e.pageY
								zIndex: 6000
	
						picker.color self.model.get "color", "rgb(0,0,0)"

						picker.on "change", (color) ->
								self.$activeColor.css background: color
								self.model.set "color", color.toString()

				@sketch = sketch @$canvas.get(0)
				@model.on "change", => 
						@sketch.size @model.get "size", 1.5
						@sketch.color @model.get "color", "rgb(0,0,0)"
						@sketch.opacity 1
						if @model.get "nobackground"
								@sketch.backgroundColor "rgba(255,255,255,0)"
						else
								@sketch.backgroundColor "rgba(255,255,255,1)"
						@sketch.draw()

				@model.emit "change"

				if @model.get "keepOnTop"
						@$el.addClass "keepOnTop"

				if @model.get "hidechrome" 
						@$el.addClass "nochrome"

				@$sizeInput.val @model.get "size", 1.5

				@$el.on "drag.start", => 
						$(".pickerHolder").remove()
						@$canvas.hide()

				@$el.on "drag.stop", =>
						@$canvas.hide().show()

				@$showChrome.cloak().text("show chrome").on click: =>
						@model.set "hidechrome", false
						@$el.removeClass "nochrome"
						@$el.trigger "resize"
						@sizeRows()

				@$el.on
						mouseenter: => 
								if @model.get "hidechrome" 
										@$showChrome.uncloak()
						mouseleave: =>
								if @model.get "hidechrome"
										@$showChrome.cloak()

				@$canvas.on mouseup: =>
						@model.set "objs", @sketch.export(), true

				this

		postAppend: ->
				@sizeRows()

module.exports = {Sketch, SketchView}