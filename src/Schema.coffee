kosherName = require "./kosherName"
{Enum} = require "./widget/Enum"
{Namespace, Attribute} = require "./widget/Namespace"

class Resource extends require("./widget/Model")
		init: ->
				@set "attributes", {}
				@set "children", {}

		addAttribute: (name, attr) ->
				attributes = @get "attributes"
				attributes[name] = attr
				@set "attributes", attributes
				this

		getChild: (name) ->
				children = @get "children"
				return false if not children[name]?
				children[name]

		addChild: (name, val) ->
				children = @get "children"
				children[name] = val
				@set "children", children
				this


class Schema extends require("./widget/Model")
		loaded: false

		init: ->
				@set "root", new Resource name: "root", path: "root"
				@attrById = {}
				@nsByName = {}

		whenLoaded: (cb) ->
				if @loaded then return cb @
				@once "refreshed", cb

		getAttribute: (keyword) ->
				return if not keyword or not keyword.split?

				[ns, att] = keyword[1..-1].split "/"
				if resource = @nsByName[ns]
						if resource.data.attributes[att]?
								return type: resource.type, value: resource.data.attributes[att], paths:
										resource: r = "resource-#{kosherName ns}"
										attribute: "#{r}-attr-#{kosherName att}"
				false

		getAttributeById: (id) ->
				if attr = @attrById[id]
						@getAttribute attr[":db/ident"]
				else
						false

		getResource: (name) ->
				parts = name.split "."
				resource = @get "root"

				path = []
				for part in name.split "."
						path.push part
						if not (child = resource.getChild part)
								resource.addChild part, resource = new Resource {name: part, path: path.join "."}
								@nsByName[path.join "."] = resource
						else
								resource = child

				resource

		getNamespace: (name) ->
				if resource = @nsByName[name]
						if resource.type is "enum"
								ns = new Enum {name}, false
						else
								ns = new Namespace {name}, false
						
						ns.data[":db/id"] = resource.data[":db/id"]
						
						for name, details of resource.get "attributes"
								attr = new Attribute details
								attr.set "name", name
								ns.attributes.push attr
						ns
				else
						throw "unknown namespace #{name}"

		add: (attr, type) ->
				@attrById[attr[":db/id"]] = attr
				[ns, attName] = attr[":db/ident"][1..-1].split("/")
				resource = @getResource(ns).addAttribute attName, attr
				resource.type = type
				resource.data[":db/id"] = attr[":db/id"]
				this

		refresh: ->
				self = this
				@init()

				DatomicIsm.connection.query "[:find ?e :where [:db.part/db :db.install/attribute ?e]]", {}, (packed) ->
						attributes = {}
						for e in packed 
								attributes[e[0]] = true

						DatomicIsm.connection.query "[:find ?e :where [?e :db/ident]]", {}, (items) ->
								count = items.length
								checkDone = -> 
										count--
										self.loaded = true
										self.emit("refreshed") if not count 

								for item in items
										do (item) ->
											DatomicIsm.connection.getEntity item[0], (attr) ->
												self.add attr, if attributes[item] then "attribute" else "enum"
												checkDone()

module.exports = {Schema, Resource}