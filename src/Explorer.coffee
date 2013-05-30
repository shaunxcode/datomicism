bling = require "bling"

class Explorer
		constructor: (options) ->
				@surface = options.surface
				@selector = options.selector
				@nodes = {}
				@leaves = {}
				@leavesCount = {}
		render: ->
				self = this
				@$el = bling ".explorer .title, ul.tree", ->
						self.$tree = @tree
						@title.text "explorer"
						shrunk = false
						oldheight = 200
						@title.on mousedown: =>
								if shrunk 
										@tree.animate height: oldheight
										shrunk = false
								else
										oldheight = @tree.height()
										@tree.animate height: 0
										shrunk = true

				@drawNodes()
				this

		drawNodes: ->
				self = this
				$("#{@surface} #{@selector}").each (i, el) =>
						_$el = $ el
						id = _$el.attr "id"
						if not @nodes[id]?
								model = _$el.data "model"
								view = _$el.data "view"
								type = view.__proto__.title

								if not @leaves[type]?
										@leavesCount[type] = 0
										@$tree.bappend "li span, ul", ->
												@span.text type
												self.leaves[type] = @ul

								mapNode = _$el.data "CartographicSurfaceNode"
								@leavesCount[type]++

								defaultDesc = "#{type} #{@leavesCount[type]}"
								desc = ->
										d = model.description?()
										if d 
												return if d.length > 25 then (d[0..21] + "...") else d
										else
												return defaultDesc
								
								@leaves[type].append @nodes[id] = bling "li .desc, button.remove", -> 
										@desc.text desc()
										@li.on 
												mousedown: ->
														$("html, body").animate
																scrollTop: _$el.offset().top - 100
																scrollLeft: _$el.offset().left - 100
												mouseenter: =>
														@remove.uncloak()
														_$el.addClass "lit"
														mapNode.addClass "lit"
												mouseleave: =>
														@remove.cloak()
														_$el.removeClass "lit"
														mapNode.removeClass "lit"

										@remove.text("x").cloak().on mousedown: (e) ->
												e.stopPropagation() 
												view.close()

										model.on "change", =>
												@desc.text desc()

								_$el.on "remove.Explorer", => 
										@nodes[id].remove()
										@leavesCount[type]--
										if @leavesCount[type] is 0
												@leaves[type].parent().remove()
												delete @leaves[type]
												delete @leavesCount[type]
												
module.exports = Explorer