_ = require "underscore"
Emitter = require "emitter"
guid = require "../guid"

class Model
		constructor: (@data = {}, @_isNew = true) ->
				@id = guid()
				@pendingChanges = {}
				@init?()
				Emitter.call @

		get: (key, def = null) -> 
				@data[key] or= def

		set: (key, val, force = false) ->
				cur = @data[key]
				
				if _.isNumber cur
						val = Number val
				if cur isnt val or force
						@pendingChanges[key] = val
						@data[key] = val
						event = model: @, key: key, from: cur, to: val
						@emit "change", event
						@emit "change:#{key}", event 

		update: (newData) ->
				for k, v of newData
						@set k, v
				this

		isNew: ->
				@_isNew

		hasPendingChanges: ->
				_.size(@pendingChanges) > 0

		description: ->
				@get "widgetName", false

		remove: ->

Emitter Model.prototype

module.exports = Model