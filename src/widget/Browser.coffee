bling = require "bling"
_ = require "underscore"
kosherName = require "../kosherName"
{NamespaceView} = require "./Namespace"

class Browser extends require("./Model")
	
class BrowserView extends require("./Widget")
		title: "Browser"
		className: "browser"

		constructor: (@model, @id) ->
				super @model, @id
				@schema = DatomicIsm.schema 
				@drawAll()
				@schema.on "refreshed", => @drawAll()

		render: ->
				super()
				self = this
				@$el.bappend ".cols .col.resources, .col.members, .col.@details", {self}, ->
						self.$col = @col
						@resources.append self.$resources = bling "ul"
						@members.append self.$members = bling "ul"

				@$widget.resizable 
						resize: => self.sizeCols()
						
		sizeCols: ->
				@$col.css 
						height: @$widget.outerHeight() - @$handle.outerHeight() - 18

				@$details.css 
						top: 0
						left: width = (@$resources.outerWidth() + @$members.outerWidth() + 3)
						width: @$widget.outerWidth() - width

		postAppend: ->
				@sizeCols()

		drawResource: (resource, parent, indent = 0) ->
				self = this

				kname = "resource-#{kosherName resource.get "path"}"

				right = "&#x25BA;"
				down = "&#x25BC;"

				els = {}
				
				parent.bappend "li .@entry, ul.@children", {self: els}, ->
						@entry.text resource.get "name"
						@entry.css paddingLeft: "#{indent}em"
						@entry.addClass kname
						if resource.type
								@entry.addClass "type-#{resource.type}"
						@entry.draggable
								helper: "clone"
								appendTo: "body"
								delay: 200
								start: (evt, ui) ->
										ui.helper.css paddingLeft: 5, zIndex: 300

								stop: (evt, ui) ->
										model = self.schema.getNamespace resource.get "path"

										if resource.type	is "enum"
												view = new EnumView model
										else
												view = new NamespaceView model
												model.fetchRecords()

										view.$el.appendTo "body"
										view.$el.css 
												position: "absolute"
												left: ui.position.left
												top: ui.position.top

										view.saveState?()
										view.raiseToTop()
										DatomicIsm.map.drawNodes()

						@entry.on click: => 
								self.model.set "attribute", false
								self.model.set "resource", kname

								$(".entry", self.$resources).removeClass "active"
								@entry.addClass "active"
								self.drawMembers kname, resource.get "attributes"

				hasKids = false
				for name, child of resource.get "children"
						hasKids = true
						@drawResource child, els.$children, indent + 1

				if (parent isnt @$resources) and (not @selected kname)
						fullheight = els.$children.height()
						els.$children.css height: 0

				if hasKids 
						expanded = false
						els.$entry.prepend bling "span.@arrow", self: els, html: right, on: click: (e) ->
								e.stopPropagation()
								if expanded
										els.$arrow.html right 
										expanded = false
										fullheight = els.$children.height()
										els.$children.css height: 0
								else		
										els.$arrow.html down
										expanded = true 
										els.$children.css height: "auto" 
				else 
						els.$entry.prepend bling "span", html: "&nbsp;"

		drawMembers: (kname, members) ->
				self = this
				@$details.html ""
				@$members.html ""
				for name, val of members
						do (name, val) ->
								self.$members.bappend "li .entry", ->
										@entry.text name
										akname = kname + "-attr-#{kosherName name}"
										@entry.addClass akname

										@entry.draggable
												helper: "clone"
												appendTo: "body"
												delay: 200
												start: (evt, ui) ->
														ui.helper.css paddingLeft: 5, zIndex: 300

												stop: (evt, ui) ->
														DatomicIsm.fetchEntity val[":db/id"], evt

										@entry.on click: =>
												self.model.set "attribute", akname
												$(".entry", self.$members).removeClass "active"
												@entry.addClass "active"
												self.drawDetails val
										if akname is self.selectedAttribute
												@entry.click()
				self.sizeCols()
				this

		drawDetails: (detail) ->
				self = this
				self.$details.html ""
				self.sizeCols()
				for dn, dv of detail when dn isnt ":db/doc"
						self.$details.bappend ".detail label, span.val", -> 
								@label.text _.last dn.split "/"
								@val.text dv

				if detail[":db/doc"]?
						self.$details.bappend ".detail.doc label, .val", -> 
								@label.text "doc"
								@val.text detail[":db/doc"]

		selected: (name) ->
				@selectedPath? and @selectedPath.indexOf(name) isnt -1

		drawAll: ->
				path = @model.data

				@$resources.html ""
				@$members.html ""
				@$details.html ""
				@selectedPath = path.resource
				@selectedAttribute = path.attribute 
				@drawResource @schema.get("root"), @$resources
				@sizeCols()
				
				if path.resource
						$(".#{path.resource}", @$el).click()

module.exports = {Browser, BrowserView}