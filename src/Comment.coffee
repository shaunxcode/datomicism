class Comment
		constructor: (@val) ->
		ednEncode: ->
				"\n ;; #{@val}"

module.exports = Comment