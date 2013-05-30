bling = require "bling"

class Note extends require("./Model")
		description: ->
				@get "note", ""

class NoteView extends require("./Widget")
		title: "Note"
		className: "note"

		sizeInput: ->
				size = 
						height: @$el.height()-10
						width: @$el.width()-10

				@$wrapper.css size
				$(".CodeMirror-scroll", @$wrapper).css size
				@$parsed.css size 

		render: ->
				super()
				self = this
				@$handle.replaceWith bling "textarea.@note, .@parsed", {self}
				
				@editor = CodeMirror.fromTextArea @$note.get(0),
						mode:
								name: "markdown"
						lineWrapping: true
						onChange: =>
								@model.set "note", @editor.getValue()
						onBlur: =>
								@$wrapper.hide()
								@parseMedia()
								@$parsed.show()

				@$wrapper = $ @editor.getWrapperElement()
				@$wrapper.hide()

				@$widgetNameInput.remove()
				@$el.resizable()
				@$el.on "resize.Note", => @sizeInput()

				@$el.on dblclick: =>
						@$parsed.hide()
						@$wrapper.show()
						@editor.focus()
						@editor.setValue @model.get "note", ""

				this

		parseMedia: ->
				@$parsed.html markdown.makeHtml @model.get "note", ""

		postAppend: ->
				@sizeInput()
				@editor.setValue @model.get "note", ""
				@parseMedia()

		postDrop: ->
				@$el.trigger "dblclick"

module.exports = {Note, NoteView}