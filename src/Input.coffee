bling = require "bling"
{types, uniqueTypes, cardinalityTypes} = require "./datomicTypes"

keyHandler = (keyMap) -> (e) ->
		for key, handler of keyMap
				if e.keyCode is $.ui.keyCode[key]
						handler e
						break

textInput = (model, field, validator, tag = "input") ->
		curVal = model.get field
		self = tag.$tag(class: "textInput", value: curVal or "", placeholder: field).on 
				blur: (e) ->
						val = self.val().trim()
						model.set field, val
						self.trigger "changedValue", self.val()
				keyup: (e) ->
						validator? e, self

		if model.get(":db/id") then self.attr("disabled", true)

		self

textAreaInput = (model, field, validator) -> textInput model, field, validator, "textarea"

nameInput = (model, field) -> 
		validator = (e, input) -> 
				if e.keyCode is $.ui.keyCode.SPACE
						input.val input.val().replace /\s/g, "_"

		textInput(model, field, validator).addClass "nameInput"

comboInput = (options, model, field) ->
		optionTags = ("option".$tag(value: val, text: vis) for val, vis of options)
		self = "select".$tag(class: "comboInput", html: optionTags).on change: ->
				model.set field, $(this).val()

		if model.get(field)
				self.val model.get(field)
		else
				self.trigger "change"

		self

typeCombo = (model, field) ->
		(comboInput types, model, field).addClass "typeCombo"

uniqueCombo = (model, field) ->
		options = ("option".$tag(value: val, text: vis) for val, vis of uniqueTypes)
		self = "select".$tag(class: "uniqueCombo", html: options).on change: ->
				model.set field, self.val()

		if model.get(field) then self.val model.get(field)
		if model.get(":db/id") then self.attr("disabled", true)
		self

checkbox = (model, field) ->
		self = ("input".$tag type: "checkbox").on change: ->
				model.set field, self.is ":checked"

		if model.get field, false
				self.attr "checked", true

		if model.get(":db/id") then self.attr("disabled", true)
		self

textarea = (model, field) ->
		bling "textarea", value: model.get field, ""

labelPair = (label, control) ->
		bling "div label.#{label}", ->
				@label.text "#{label}:"
				@div.append control

oneOrManyToggle = (model, field) ->
		one = ":db.cardinality/one"
		many = ":db.cardinality/many"
		state = model.get field, one
		self = "div".$tag(class: "oneOrManyToggle", html: cardinalityTypes[state]).on click: ->
				state = if state is one then many else one
				self.text cardinalityTypes[state]
				model.set field, state
				
module.exports = {keyHandler, textInput, textAreaInput, nameInput, comboInput, typeCombo, uniqueCombo, checkbox, textarea, labelPair, oneOrManyToggle}
	