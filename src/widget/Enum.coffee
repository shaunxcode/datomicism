{Namespace, NamespaceView} = require "./Namespace"

class Enum extends Namespace
		isEnum: true
		ednPrep: ->
				ns = @get "name"
				out = []
				for attribute in @attributes
						item = 
								"db/id": new edn.Tagged(new edn.Tag("db", "id"), [":db.part/db"])
								"db/ident": ":#{ns}/#{attribute.get "name"}"

						out.push item
						attribute.set ":db/ident", item["db/ident"]
				out

class EnumView extends NamespaceView
		title: "Enum"
		className: "enum"

		attributeOptions: ->

		render: -> 
				super()
				@$el.addClass "enumNamespace namespace"
				
module.exports = {Enum, EnumView}