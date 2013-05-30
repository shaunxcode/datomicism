_ = require "underscore"
bling = require "bling"
{textInput} = require "../Input"
{Enum} = require "./Enum"

class Entity extends require("./Model")

class EntityView extends require("./Widget")
    title: "Entity"
    className: "entity"

    sizeRows: ->
        @$results.css
            height: @$el.outerHeight() - @$searchBy.outerHeight() - @$handle.outerHeight() - 43 - @$moreRow.outerHeight() - @$message.outerHeight()
            width: @$el.outerWidth()            

    drawControls: ->
        @_nsCombo @$byNS
        @$searchBy.trigger "change"

    growToContent: ->
        @$results.css height: @$results[0].scrollHeight, width: @$results[0].scrollWidth
        @$el.css height: @$results[0].scrollHeight + 22 + @$searchBy.outerHeight() + @$moreRow.outerHeight() + @$handleBar.outerHeight()
        @sizeRows()

    _nsCombo: (control) ->
        combo = control or bling "select"
        combo.html("").bappend "option", value: "--", text: "Namespace"

        handleNode = (node, indent = 0) ->
            combo.append bling "option", value: node.get("path"), html: Array(indent+1).join("&nbsp;&nbsp;") + node.get("name")
            for n, r of node.get "children" 
                handleNode r, indent + 1

        handleNode DatomicIsm.schema.get("root")
        
        combo

    _refBrowser: (entity, dn, dv) ->
        self = this
        bling ".refinput input, button.browse", ->
            @input.prop(name: dn).val dv[":db/id"]
            @input.numeric negative: false

            @button.after self._removeButton @refinput, @input
            @browse.text("...").on click: (e) =>
                widget = DatomicIsm.fetchEntity @input.val(), e
                widget.view.$message.text "The next entity you select will be used as ref for #{entity[":db/id"]}/#{dn}"
                widget.view.onSelect = (ns, ent) =>
                    @input.val ent[":db/id"]
                    widget.view.close()

    _removeButton: (holder, control) ->
        bling "button.remove", ->
            @remove.text("x").on click: =>
                if holder.hasClass "newValue"
                    holder.remove() 
                    DatomicIsm.bus.emit "newAttribute.removed"
                else
                    if control.hasClass "removed"
                        control.removeClass("removed").attr disabled: null
                        @remove.text "x"
                    else
                        control.addClass("removed").attr disabled: true
                        @remove.html "&#8624;"

    _attrValue: (entity, dn, dv, type) ->
        self = this
        bling ".inputHolder input", ->
            if type is ":db.type/boolean"
                @input.prop type: "checkbox"
                if dv then @input.prop checked: true

            if type is ":db.type/long"
                @input.numeric()
            if type is ":db.type/double"
                @input.numeric decimal: "."

            @input.attr(value: dv, name: dn).after self._removeButton @inputHolder, @input

    drawEntity: (entity, appendTo, subcnt = 1) ->
        self = this
        appendTo or= self.$results

        if _.isObject entity
            appendTo.append result = bling ".result"

            if entity[":db/id"]?
                result.addClass "entity entity-#{entity[":db/id"]}"
                result.bappend ".detail label, span.val", -> 
                    @label.text "id"
                    @val.text(entity[":db/id"])
                    @val.addClass("idlink").on click: (e) => DatomicIsm.fetchEntity entity[":db/id"], e

            ns = false
            if entity.newEntity 
                ns = ":#{entity.newEntity}"
                newEntity = true
                delete entity.newEntity

            nslis = {}
            vals = {}
            newAttrs = {}
            result.append nsul = bling "ul.namespaces"
            for dn, dv of entity when dn not in [":db/id"]
                continue if dn[0] isnt ":"
                do (dn, dv) ->
                    [ns, attName] = dn.split "/"
                    if not nslis[ns]?
                        nsul.append bling "li span.nsname, ul", ->
                            @span.text ns[1..-1]
                            @span.addClass("link").on click: (e) -> DatomicIsm.fetchBrowser {resource: "resource-#{ns[1..-1]}"}, e
                            nslis[ns] = @ul 

                    nslis[ns].bappend "li.detail label, span.val, .valWrite", -> 
                        @detail.draggable
                            handle: "label"
                            helper: "clone"
                            appendTo: "body"
                            start: (e, ui) ->
                                ui.helper.prepend bling ".entityId", html: "entity&nbsp;#{entity[":db/id"]}"
                                ui.helper.css zIndex: 6000
                            stop: (e) ->
                                DatomicIsm.fetchDatom entity[":db/id"], dn, e

                        vals[dn] = 
                            read: @val
                            write: @valWrite.hide()
                        
                        @label.text attName
                        attrType = false
                        if attr = DatomicIsm.schema.getAttribute dn
                            do (attr) =>
                                attrType = attr.value[':db/valueType']
                                @label.addClass("idlink").on click: (e) -> DatomicIsm.fetchEntity attr.value[':db/id'], e

                        if _.isArray dv
                            if attrType is ":db.type/ref"
                                for v in dv
                                    do (v) =>
                                        if not _.isObject v
                                            v = DatomicIsm.schema.getAttribute(v).value
                                        @val.bappend "span.idlink, span.spacer", -> 
                                            @spacer.text " "
                                            @idlink.text(v[":db/ident"] or v[":db/id"]).on click: (e) -> DatomicIsm.fetchEntity v[":db/id"], e
                                        @valWrite.append self._refBrowser entity, dn, v

                                @valWrite.append addButton = bling "button.add"
                                addButton.text("+").on click: => addButton.before (self._refBrowser entity, dn, {}).addClass "newValue"
                            else
                                @val.text dv.join ", "
                                for v in dv
                                    @valWrite.append self._attrValue entity, dn, v, attrType

                                @valWrite.append addButton = bling "button.add"
                                addButton.text("+").on click: => addButton.before (self._attrValue entity, dn, "", attrType).addClass "newValue"
                        else if _.isObject dv
                            if dv[":db/id"]?
                                @val.text(dv[":db/id"]).addClass("entityLink").on click: (e) -> DatomicIsm.fetchEntity dv[":db/id"], e
                                @valWrite.append self._refBrowser entity, dn, dv

                                DatomicIsm.connection.getEntity dv[":db/id"], (ent) =>
                                    for k, v of ent when _.last(k.split("/")) is "name"
                                        @val.text "#{dv[":db/id"]} (#{v})"
                                        break 
                                    
                            else 
                                @val.text JSON.stringify dv
                        else
                            @val.text dv
                            if (attrType is ":db.type/ref") and ref = DatomicIsm.schema.getAttribute dv
                                do (ref) =>
                                    @val.addClass("idlink").on click: (e) => DatomicIsm.fetchEntity ref.value[":db/id"], e

                                    if ref.type is "enum" and (enumNS = _.first dv[1..-1].split "/") and enumAttrs = DatomicIsm.schema.getNamespace enumNS
                                        @valWrite.bappend ".inputHolder select optgroup", ->
                                            @select.prop name: dn
                                            @optgroup.attr label: enumNS
                                            for attr in enumAttrs.attributes
                                                @optgroup.bappend "option", value: attr.get(":db/id"), text: attr.get("name")
                                            @select.val(ref.value[":db/id"]).after self._removeButton @inputHolder, @select
                                    else
                                        @valWrite.append self._refBrowser entity, dn, dv
                            else
                                @valWrite.append self._attrValue entity, dn, dv, attrType


            result.bappend ".@buttons button.@edit, button.@addAttribute, button.@cancel, button.@transact, button.@retract", self: buttons = {}
            editing = false
            buttons.$edit.text("edit").cloak().on click: ->
                editing = true
                for dn, val of vals 
                    val.read.hide()
                    val.write.show()
                
                buttons.$edit.hide()
                buttons.$addAttribute.show()
                buttons.$cancel.show()
                buttons.$transact.show()
                buttons.$retract.show()

            if not entity[":db/id"] then buttons.$retract.remove()

            buttons.$retract.text("retract entity").css(float: "right", marginRight: 20).hide().on click: ->
                DatomicIsm.connection.transact edn.encode [[":db.fn/retractEntity", entity[":db/id"]]]


            buttons.$addAttribute.text("add attribute").hide().on click: ->
                buttons.$buttons.before bling ".inputHolder.newAttribute.newValue", ->
                    @inputHolder.append(
                        newAttributeLabel = bling "span", text: "New Attribute"
                        select = self._nsCombo()
                        attrs = bling "select"
                        input = bling ".newAttrWrapper"
                        self._removeButton(@inputHolder).on "click.rowItem", ->
                            delete newAttrs[attrs.val()]
                        valInputs = bling ".valInputs")

                    attrs.hide().on change: =>
                        if attrs.val() is "---" 
                            return valInputs.html "" 

                        attrDetails = DatomicIsm.schema.getAttribute attrs.val()

                        if attrDetails.value[":db/valueType"] is ":db.type/ref" 
                            ctrl = "_refBrowser" 
                            val = {}
                        else 
                            ctrl = "_attrValue"
                            val = ""

                        newAttrs[attrs.val()] = @inputHolder

                        DatomicIsm.bus.on "newAttribute.removed", ->
                            if $(".inputHolder, .refinput", valInputs).length is 0 
                                attrs.val("---").trigger "change"
                            
                        valInputs.html (self[ctrl] {}, attrDetails.value[":db/ident"], val, attrDetails.value[":db/valueType"]).addClass "newValue"

                        if attrDetails.value[":db/cardinality"] is ":db.cardinality/many"
                            valInputs.append addButton = bling "button"
                            addButton.text("+").on click: => addButton.before (self[ctrl] {}, attrDetails.value[":db/ident"], val, attrDetails.value[":db/valueType"]).addClass "newValue"
                        else
                            $("button.remove", valInputs).remove()

                        newAttributeLabel.text "#{attrs.val()}  (#{attrDetails.value[":db/valueType"]})"
                        select.remove()
                        attrs.remove()
                        $('option[value="' + attrs.val() + '"]', result).remove()

                    select.on change: ->
                        return if select.val() is "--" 
                        ns = ":#{select.val()}"
                        do (ns = DatomicIsm.schema.getNamespace select.val()) ->
                            attrs.html bling "option", text: "---", value: "---"
                            attrs.hide()
                            if not ns.isEnum
                                for attr in ns.attributes when not entity[attr.data[":db/ident"]]? and not newAttrs[attr.data[":db/ident"]]
                                    attrs.show()
                                    attrs.append bling "option", value: attr.data[":db/ident"], text: (attr.data[":db/ident"].replace ":#{select.val()}/", "")
                    

                    if ns then select.val(ns[1..-1]).trigger "change"

            buttons.$cancel.text("cancel").hide().on click: ->
                editing = false
                for dn, val of vals
                    val.write.hide()
                    val.read.show()

                for dn, attr of newAttrs
                    attr.remove()
                    delete newAttrs[dn]

                $(".newAttribute", result).remove()
                buttons.$cancel.hide()
                buttons.$addAttribute.hide()
                buttons.$transact.hide()    
                buttons.$retract.hide()                
                buttons.$edit.show()

            buttons.$transact.text("transact").hide().on click: ->
                if not entity[":db/id"]
                    eid = new edn.Tagged new edn.Tag("db/id"), new edn.Vector [":db.part/user", -1]
                else
                    eid = entity[":db/id"]

                transaction = []
                for input in $("input[name], select[name]", result)
                    $input = $ input

                    value = if $input.is("[type=checkbox]") then $input.is(":checked") else $input.val()

                    transaction.push [
                        if $input.hasClass "removed" then ":db/retract" else ":db/add"
                        eid
                        $input.prop "name"
                        value]

                DatomicIsm.connection.transact (edn.encode transaction), ->
                    console.log arguments

            result.on
                mouseenter: =>
                    if not editing
                        buttons.$edit.uncloak()
                mouseleave: => 
                    buttons.$edit.cloak()

            if newEntity then buttons.$edit.click()

            if self.onSelect?
                result.bappend "button", text: "Use Entity", on: mouseup: ->
                    self.onSelect dn.split("/")[0], entity

    render: ->
        super()
        self = this

        @$el.resizable().bappend ".searchForm .@message, select.searchBy, input.byId, select.byNS, button.newEntity, .results, .moreRow button.more", {self}, ->
            self.$searchForm = @searchForm
            self.$results = @results
            self.$moreRow = @moreRow
            self.$searchBy = @searchBy 
            self.$newEntity = @newEntity 

            @newEntity.text("new entity").on click: =>
                self.$results.html bling "h1", text: "New Entity"
                console.log @byNS.val() 
                self.drawEntity newEntity: @byNS.val()

            @searchBy.bappend "option", value: "--", text: "Search By"
            for v, n of {byId: "entity id", namespace: "namespace"}
                @searchBy.bappend "option", value: v, html: "&nbsp;&nbsp;#{n}"
            

            offset = 0
            total = 0
            size = 4
            ns = false
            @more.text("more").on click: =>
                @more.text("loading").attr disabled: true
                offset++
                ns.fetchRecords ((records) =>
                    count = (size+1)*(offset+1)
                    if count >= total
                        @more.cloak()
                    else
                        @more.text("more (#{count}/#{total})").attr disabled: false
                     
                    self.drawEntity(entity.data) for entity in records
                ), offset, size

            @byNS.on change: =>
                return if not DatomicIsm.schema.loaded
                return if @byNS.val() is "--"
                self.model.set "byNS", @byNS.val()
                ns = DatomicIsm.schema.getNamespace @byNS.val()
                
                if ns instanceof Enum
                    self.$results.html ""
                    @more.cloak()
                    for att in ns.attributes 
                        self.drawEntity att.data
                else
                    self.$results.html "fetching"
                    ns.fetchRecords (records) =>
                        self.$results.html ""
                        offset = 0
                        total = ns.entities.length 
                        @more.attr disabled: false
                        
                        if total is 1 then @more.cloak()
                        self.drawEntity(entity.data) for entity in records
                        if (size+1) < total
                            @more.text("more (#{size+1}/#{total})").uncloak()

            @byId.numeric negative: false

            @byId.on keyup: =>
                return if not DatomicIsm.schema.loaded
                self.model.set "byId", @byId.val().trim()
                return if @byId.val().trim().length is 0
                
                self.$results.html "fetching"
                DatomicIsm.connection.getEntity @byId.val(), (entity) ->
                    self.$results.html ""
                    self.drawEntity entity
                    self.growToContent()

            @byNS.hide()
            @byId.hide()
            self.$searchBy = @searchBy.on change: =>
                self.model.set "searchBy", @searchBy.val()
                self.$results.html ""
                @more.cloak()
                switch @searchBy.val()
                    when "--"
                        @byNS.hide()
                        @byId.hide()
                    when "byId"
                        @byNS.hide()
                        @byId.show().val ""
                        @byId.val self.model.get "byId"
                        @byId.trigger "keyup"
                    when "namespace"
                        @byId.hide()
                        @byNS.show()
                        @byNS.val self.model.get "byNS", "--"
                        @byNS.trigger "change"

            self.$byNS = @byNS

            if searchBy = self.model.get "searchBy"
                @searchBy.val searchBy

            self.drawControls()

            DatomicIsm.schema.on "refreshed", => 
                self.drawControls()
                if searchBy then @searchBy.val searchBy

            @searchBy.trigger "change"

        @$el.on "resize.Entity", -> self.sizeRows()

    postAppend: ->
        @sizeRows()

module.exports = {Entity, EntityView}