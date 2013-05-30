class Datom extends require("./Model")
class DatomView extends require("./Widget")
		title: "Datom"
		className: "datom"

		render: ->
				self = this
				super()

				DatomicIsm.connection.getEntity (self.model.get "entityId"), (entity) =>
						@$el.append details = bling ".details"
						details.append(
								labelPair "Entity", @model.get "entityId"
								labelPair "Attribute", @model.get "attribute"
								labelPair "Value", entity[@model.get "attribute"])

				@$el.resizable()
				
module.exports = {Datom, DatomView}