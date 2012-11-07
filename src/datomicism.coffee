[bling, CartographicSurface] = false

_ = require "component-underscore"
Emitter = require "component-emitter"
sketch = require "shaunxcode-sketch"
ColorPicker = require "component-color-picker"
window.edn = require "shaunxcode-jsedn"

String.prototype.$tag = (args) -> $ "<#{@}/>", args
String.prototype.upperCaseFirst = -> @[0].toUpperCase() + @[1..-1] 

kosherName = (name = "") ->
    name.replace /[\?\-\:\/\.]/g, "_"

#break into component
S4 = -> (((1+Math.random())*0x10000)|0).toString(16).substring(1)
guid = -> (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4())

window.Storage = 
    get: (key, defVal) ->
        val = localStorage.getItem key
        if (not val) 
            val = defVal

        try 
            parsed = JSON.parse val
            return parsed
        catch e
            return val

    set: (key, val) ->
        localStorage.setItem key, JSON.stringify val


types = 
    ":db.type/keyword": "keyword"
    ":db.type/string":  "string"
    ":db.type/boolean": "boolean"
    ":db.type/long":    "long"
    ":db.type/bigint":  "bigint"
    ":db.type/float":   "float"
    ":db.type/double":  "double"
    ":db.type/bigdec":  "bigdec"
    ":db.type/ref":     "ref"
    ":db.type/instant": "instant"
    ":db.type/uuid":    "uuid"
    ":db.type/uri":     "uri"
    ":db.type/bytes":   "bytes"

uniqueTypes = 
    "nil":                 "no"
    ":db.unique/value":    "value"
    ":db.unique/identity": "identity"

cardinalityTypes = 
    ":db.cardinality/one": 1
    ":db.cardinality/many": "n"

keyHandler = (keyMap) -> (e) ->
    for key, handler of keyMap
        if e.keyCode is $.ui.keyCode[key]
            handler e
            break

textInput = (model, field, validator, tag = "input") ->
    curVal = model.get field
    self = tag.$tag(class: "textInput", value: curVal or "").on 
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

dbCombo = (model, field) ->
    select = bling "select.dbCombo.loading"
    cur = model.get field
    
    drawDbs = (cb) ->
        select.html ""
        DatomicIsm.connection.getStorages (storages) ->
            count = storages.length
            checkDone = ->
                count--
                if count is 0 then cb()

            for storage in storages
                do (storage) ->
                    optGroup = (bling "optgroup", label: storage).appendTo select
                    DatomicIsm.connection.getDatabases storage, (databases) ->
                        for database in databases
                            optGroup.bappend "option", value: "{:db/alias \"#{storage}/#{database}\"}", text: database

                        optGroup.bappend "option", value: "new #{storage}", text: "--new db--"
                        checkDone()

    select.on change: ->
        $el = $(this)
        [isNew, alias] = $el.val().split " "
        if isNew is "new"
            if name = prompt "DB Name"
                DatomicIsm.connection.createDatabase alias, name, ->
                    drawDbs -> select.val "{:db/alias \"#{alias}/#{name}\"}"
        else
            model.set field, $el.val()
            select.trigger "changedValue", $el.val()

    drawDbs ->
        if cur
            select.val cur
        
        select.trigger "change"

    select

class Comment
    constructor: (@val) ->
    ednEncode: ->
        "\n ;; #{@val}"
        
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

class Widget
    class: "Widget"

    constructor: (@model, @id) ->
        @init?()
        @render()
        if not @id then @id = "widget#{guid()}"

    sizeTitleBar: ->
        @$widgetNameInput.css width: @$el.width() - (@$handle.width() + @$widgetButtons.width() + 40)

    render: ->
        @model.on "change", => @saveState()

        self = this
        @$el = bling ".widget.#{@className} .handle .title, .widgetButtons", ->
            self.$widget = @widget.attr id: self.id
            self.$handleBar = @handle
            self.$handle = @title.text self.title
            @title.after self.$widgetNameInput = textInput self.model, "widgetName"
            @widget.draggable handle: ".handle", containment: "parent"
            @widget.on "dragstop.Widget", -> self.saveState()
            @widget.on "resizestop.Widget", -> self.saveState()
            self.$widgetButtons = @widgetButtons.bappend "button.close", ->
                self.$closeButton = @close.text("x").on click: -> self.close()

        @$el.data "model", @model
        @$el.data "view", @

        @$el.on "resize.Widget", => @sizeTitleBar()
            

        if @panes?
            for pane, prct of @panes
                do (pane, prct) =>
                    @$el.append @["$#{pane}"] = bling "div"
        @$el.on 
            mousedown: =>
                @raiseToTop()

            mouseenter: => 
                @$closeButton.uncloak()
                $(".ui-resizable-handle", @$el).uncloak()

            mouseleave: => 
                @$closeButton.cloak()
                $(".ui-resizable-handle", @$el).cloak()

    raiseToTop: ->
        $(".widget").not("##{@id}").not(".keepOnTop").css zIndex: 1
        @$el.css zIndex: 2

    saveState: ->
        pos = @$el.position()        
        widgets = Storage.get "widgets", {}
        widgets[@id] =
            width: @$el.width()
            height: @$el.height()
            left: pos.left
            top: pos.top
            class: @className.upperCaseFirst()
            data: @data()

        Storage.set "widgets", widgets

    data: -> 
        if @model?
            @model.data
        else
            false

    close: ->
        @$el.remove()

        widgets = Storage.get "widgets", {}
        if widgets[@id]? then delete widgets[@id]

        Storage.set "widgets", widgets
        

    growToContent: ->
        @$widget.css height: @$widget[0].scrollHeight

class Connection extends Model
    connect: (cb) ->
        $.post "/api/session", @data, (result) =>
            cb?(result)
            if @data.db? and @data.alias?
                @emit "connected"

    getStorages: (cb) ->
        $.get "/api/storages", cb

    createDatabase: (alias, name, cb) ->
        $.post "/api/db", alias: alias, name: name, cb

    getDatabases: (alias, cb) ->
        $.get "/api/databases/#{alias}", cb

    getEntity: (id, cb) ->
        $.get "/api/entity/#{id}", cb

    transact: (transaction, cb) ->
        $.post "/api/transact", {transaction}, (result) ->
            cb?(result)
            DatomicIsm.schema.refresh()
    query: (q, args, cb) ->
        $.get "/api/query", {query: q}, cb

regex = 
    floatStart: /^[\+\-]?[0-9]*[.]?$/
    float: /^[\+\-]?[0-9]*[.][0-9]+$/
    keyword: /^[\:][A-Za-z\-\_\+\#\!\.\=\|\>\<\?\*\&\/]*$/

class Entity extends Model
class EntityView extends Widget
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

class Attribute extends Model
class Record extends Model
    dataForTransaction: ->
        result = {}
        tid = 0
        if @isNew()
            result["db/id"] = new edn.Tagged new edn.Tag("db/id"), new edn.Vector [":db.part/user", -++tid]
        for k, v of @data when v? 
            result[if k is "db/id" then k else "#{@ns}/#{k}"] = v
        result
class Namespace extends Model
    init: ->
        @attributes = []
        @recordMap = {}
        @records = []

    ednPrep: ->
        ns = @get "name"
        out = []        
        for attribute, i in @attributes
            continue if not attribute.get "name"        

            item = 
                "db/id": new edn.Tagged(new edn.Tag("db", "id"), [":db.part/db"])
                "db/ident": ":#{ns}/#{attribute.get "name"}"
                "db/valueType": attribute.get ":db/valueType"
                "db/cardinality": attribute.get ":db/cardinality"
 
            attribute.set ":db/ident", item["db/ident"]
            attribute.set ":db/id", true 
            attribute._isNew = false
            for option in ["doc","unique","index","fulltext","isComponent","noHistory"]
                if (val = attribute.get ":db/#{option}") and not _.isNull val
                    item["db/#{option}"] = val
            
            item["db.install/_attribute"] = ":db.part/db"
                            
            out.push item 
        out

    _fetchEntities: (cb) ->
        self = this
        @entities = []
        checkCount = @attributes.length
        checkDone = ->
            checkCount--
            cb() if not checkCount

        for attr in @attributes
            DatomicIsm.connection.query "[:find ?id :where [?id :#{@get "name"}/#{attr.get "name"}]]", {}, (ids) ->
                for id in ids when (_.first id) not in self.entities
                    self.entities.push  _.first id
                checkDone()

    fetchRecords: (cb, offset = 0, size = 4) ->
        self = this
        
        _fetch = ->
            start = if offset then (offset*size)+1 else 0
            subset = self.entities[start..start+size]
            subsetRecs = []
            checkCount = subset.length

            if checkCount is 0 
                return cb? []

            checkDone = ->
                checkCount--
                if not checkCount
                    self.emit "recordsFetched", self.records
                    cb? subsetRecs

            for k in subset
                DatomicIsm.connection.getEntity k, (rec) ->
                    if self.recordMap[rec[":db/id"]]?
                        self.records[self.recordMap[rec[":db/id"]]].update rec
                    else
                        self.recordMap[rec[":db/id"]] = self.records.push(new Record rec, false)-1
                    subsetRecs.push self.records[self.recordMap[rec[":db/id"]]]
                    checkDone()

        if offset is 0        
            @_fetchEntities _fetch
        else
            _fetch()
class NamespaceView extends Widget
    title: "Namespace"
    className: "namespace"

    attributeDefaults: ->
        type: ":db.type/string"
        cardinality: ":db.cardinality/one"
            
    constructor: (@model, @id) -> 
        super @model, @id
        @attributes = []
        @records = []
        
        @_state = "attributes"

        if @model.isNew()
            @$el.addClass "pendingChanges"
        else
            @$el.addClass "noChanges"


        DatomicIsm.schema.whenLoaded =>
            if @model.get "name"
                @model = DatomicIsm.schema.getNamespace @model.get "name"
                @$el.removeClass "pendingChanges"
                @$el.addClass "noChanges"
                @drawAttributes()

            @model.on "recordsFetched", (records) =>
                @addRecord(record) for record in records

    drawAttributes: ->
        @$attributes.html ""
        for attr in @model.attributes
            @addAttribute attr, false

    attributeOptions: (model, main, options, isNew = false) ->
        options.bappend ".optionHolder", -> @optionHolder.append(
            labelPair "doc", textAreaInput model, ":db/doc"
            labelPair "unique", uniqueCombo model, ":db/unique"
            labelPair "index", checkbox model, ":db/index"
            labelPair "fulltext", checkbox model, ":db/fulltext"
            labelPair "component", checkbox model, ":db/isComponent"
            labelPair "no history", checkbox model, ":db/noHistory")
                           
        right = "&#x25BA;"
        down = "&#x25BC;"
        
        main.prepend optionsToggle = bling "div.optionsToggle", html: right
        
        if not model.get ":db/ident"
            main.append(
                card = oneOrManyToggle model, ":db/cardinality"
                type = typeCombo model, ":db/valueType") 
            type.trigger "change"
        else
            main.append(
                bling "span.cardinality", text: cardinalityTypes[model.get(":db/cardinality")]
                bling "div.valueType span", ->
                    @span.text _.last model.get(":db/valueType", "/n/a").split("/"))

        optionsToggle.on click: ->
            if options.is ":visible"
                options.slideUp "fast"
                optionsToggle.html right
            else
                optionsToggle.html down
                options.slideDown "fast"

    addAttribute: (data, isNew = true) ->
        self = this
        if data instanceof Attribute
            model = data
            isNew = false
        else
            model = new Attribute data, isNew
            @model.attributes.push model
            @_showTransactButton = true
            @$el.removeClass "noChanges"
            @$el.addClass "pendingChanges"
            @showTransactButton()

        if isNew
            kosherClass = kosherName ":#{@model.get "name"}/#{model.get "name"}"
        else
            kosherClass = kosherName model.get ":db/ident"
            model.set "name", _.last model.get(":db/ident").split("/")

        @$actionCol.before column = bling "th.header.cell", text: model.get "name"

        @$attributes.bappend ".attribute.#{kosherClass} .main, .options", ->
            @main.append(
                name = nameInput model, "name"
                removeButton = bling "button.removeButton", text: "x", css: visibility: "hidden")

            self.attributeOptions model, @main, @options, isNew
            @options.hide()

            removeButton.on click: =>
               self.model.attributes = (attribute for attribute in self.model.attributes when attribute isnt model)
               @attribute.remove()
               
               pos = column.parent().children().index(column[0])
               for row in $("tr", self.$rows)
                    $(row).children().eq(pos).remove()
               column.remove()

            if isNew
                @attribute.on
                    mouseenter: -> removeButton.css visibility: "visible"
                    mouseleave: -> removeButton.css visibility: "hidden"

            if not isNew
                name.replaceWith bling "span.name", text: _.last model.get(":db/ident").split("/")
            else
                name.on 
                    keyup: keyHandler
                        ENTER: ->
                            self.addAttribute self.attributeDefaults()
                            self.focusLastAttribute()

                        UP: ->
                            if not $(".nameInput", name.parent().parent().prev(".attribute")).focus().length
                                self.$name.focus()

                        DOWN: ->
                            if not $(".nameInput", name.parent().parent().next(".attribute")).focus().length
                                self.$name.focus()

                    changedValue: => 
                        newKosherClass = kosherName ":#{self.model.get "name"}/#{model.get "name"}"
                        @attribute.attr class: "attribute #{newKosherClass}"
                        column.text model.get "name"
                        kosherClass = newKosherClass


    showCellHalo: (cell, attr) ->
        self = this
        @hideCellHalo()
        @cellHalo = bling ".cellHalo button.retract, button.history, button.idToggle", ->
            hideTimeout = false
            ignoreBlur = false
            @retract.text("x").on
                mousedown: (e) ->
                    e.stopPropagation
                    console.log "retract"

            @history.text("h").on
                mousedown: (e) ->
                    e.stopPropagation()
                    console.log "show history"

            @idToggle.text("id").on
                mousedown: (e) ->
                    e.stopPropagation()
                    console.log "show id"
            
            @cellHalo.appendTo($("body"))
                .css
                    left: cell.offset().left 
                    top: cell.offset().top + cell.outerHeight() + 1
                    width: cell.outerWidth() - 11
                .on
                    mouseenter: ->
                        ignoreBlur = true
                        clearTimeout hideTimeout
                    mousedown: (e) ->
                        ignoreBlur = false
                        clearTimeout hideTimeout
                        e.stopPropagation()

            cell.on blur: (=> return if ignoreBlur; hideTimeout = setTimeout (=> @cellHalo.remove()), 300), "input"


    hideCellHalo: ->
        @cellHalo?.remove()

    getAttributeInput: (attribute, recordModel, hideables) ->
        switch type = attribute.get ":db/valueType"
            when ":db.type/string"
                nameInput recordModel, attribute.get "name"

            when ":db.type/boolean"
                checkbox recordModel, attribute.get "name"

            when ":db.type/long", ":db.type/bigint", ":db.type/ref"
                if type is ":db.type/ref"
                    #check if there is an enum
                    if enums = DatomicIsm.schema.data[@model.get "name"]?.data.enums?[attribute.get "name"]
                        select = bling "select"
                        for n, v of enums
                            select.bappend "option", value: v[":db/id"], text: n

                        return select

                    else
                        return bling ".entityVal, .entityNS, .entityField, .entityBrowse", ->
                            entityVal = @entityVal
                            hideables.push @entityBrowse
                            hideables.push @entityNS
                            @entityBrowse.html("&#8230;").on mousedown: =>
                                ev = new EntityView new Entity
                                ev.onSelect = (field, entity) =>
                                    ev.$el.remove()
                                    @entityNS.text field
                                    @entityField.html bling "select", ->
                                        for f,v of entity
                                            @select.bappend "option", text: _.last(f.split("/")), value: v
                                        
                                        hideables.push @select

                                        @select.on change: =>
                                            entityVal.text @select.val()

                                        @select.cloak()
                                        @select.trigger "change"

                                ev.$searchForm.prepend bling ".message", text: "The next entity you select will be used as the ref"
                                ev.$el.appendTo "body"
                                ev.$el.css(position: "absolute").toCenter()
                            
                            @entityNS.text "--"
                            @entityVal.text ''

                textInput recordModel, attribute.get("name"), (e, input) ->
                    num = parseInt input.val()
                    if _.isNumber(num) and not _.isNaN(num)
                        input.val num
                    else
                        input.val ""

            when ":db.type/double", ":db.type/float", ":db.type/bigdec"
                textInput recordModel, attribute.get("name"), (e, input, inblur) ->
                    if inblur 
                        val = input.val()
                        
                        if "." in String(val)
                            return val
                        else
                            input.val "#{val}.0"
                            return  input.val()

                    return if regex.floatStart.test input.val()
                    return if regex.float.test input.val()

                    num = parseFloat input.val()
                    if _.isNumber(num) and not _.isNaN(num)
                        input.val num
                    else
                        input.val ""                

            when ":db.type/keyword"
                textInput recordModel, attribute.get("name"), (e, input) ->
                    return if regex.keyword.test input.val()
                    input.val ""

    addRecord: (data) ->
        self = this
        if data instanceof Record
            model = data
        else 
            model = new Record data

        model.ns = @model.get "name"
        @records.push model

        @$rows.bappend "tr.row", (row) ->
            hideable = []
            hidebuttons = -> el.cloak() for el in hideable
            unhidebuttons = -> el.uncloak() for el in hideable

            for attribute in self.model.attributes
                do (attribute) =>
                    row.append cell = bling "td", html: input = self.getAttributeInput attribute, model, hideable
                    input.on 
                        focus: ->
                            self.showCellHalo cell, attribute
                            $(".remove", self.$rows).cloak()
                            removeButton.uncloak()

                    model.on "change:#{attribute.get "name"}", ->
                        cell.addClass "pendingChanges"

            removeButton = false

            model.on "change", ->
                self._showTransactButton = true
                self.$transactButton.uncloak()

            row.append bling "td button.remove", -> 
                removeButton = @remove.text("x").cloak().on click: ->
                    row.remove()
                hideable.push removeButton
                row.on
                    mouseenter: unhidebuttons
                    mouseleave: hidebuttons


        $("tr:last td:first input", @$records).focus()

    focusFirstAttribute: ->
        $(".attribute .nameInput", @$el).first().focus()

    focusLastAttribute: ->
        $(".attribute .nameInput", @$el).last().focus()

    activeFocus: ->
        $(window.document.activeElement)

    focusInputLeft: ->
        if not $("input", @activeFocus().parent().prev()).focus().length
            console.log "no left"

    focusInputRight: ->
        if not $("input", @activeFocus().parent().next()).focus().length
            console.log "no right"

    focusInputUp: ->
        cell = @activeFocus().parent()
        pos = cell.parent().children().index(cell)

        if not $("input", cell.parent().prev()).eq(pos).focus().length
            console.log "no up"

    focusInputDown: ->
        cell = @activeFocus().parent()
        pos = cell.parent().children().index(cell)

        if not $("input", cell.parent().next()).eq(pos).focus().length
            console.log "no down"

    setupRecords: ->
        self = this
        @$records.bappend "table thead.columns, tbody.rows", ->
            self.$rows = @rows
            @columns.append bling "tr th.actionCol.cell", -> 
                self.$actionCol = @actionCol.html("&nbsp;")
            
        @$records.on keydown: (keyHandler 
            ENTER: => @addRecord()
            LEFT:  => @focusInputLeft()
            RIGHT: => @focusInputRight()
            UP:    => @focusInputUp()
            DOWN:  => @focusInputDown()
        ), "td input" 

    showTransactButton: ->
        if @model.hasPendingChanges() or @_showTransactButton
            @$transactButton.uncloak()

    sizeRows: ->
        @$attributes.css height: @$el.outerHeight() - (@$nameHeader.outerHeight() + @$buttons.outerHeight() + @$handleBar.outerHeight() + 30)

    postAppend: ->
        @sizeRows()

    render: ->
        super()

        self = this

        @$el.resizable resize: => @sizeRows()

        @$el.bappend ".@nameHeader, .@attributes, .@records, .@buttons button.addAttribute, button.addRecord", {self}, ->
            @records.hide()
            self.setupRecords()

            @nameHeader.html self.$name = (nameInput self.model, "name").on keyup: keyHandler
                ENTER: ->
                    self.addAttribute self.attributeDefaults()
                    self.focusLastAttribute()

                UP: ->
                    self.focusLastAttribute()

                DOWN: ->
                    self.focusFirstAttribute()

            if self.model.get ":db/id"
                self.$name.replaceWith bling "span", text: self.model.get "name"

            @nameHeader.append transactButton = bling "button.@transactButton", {self}, ->
                @button.text("Transact").on click: =>
                    @button.cloak()
                    if self._state is "records"
                        transaction = []
                        recordIds = []
                        for record in self.records
                            if record.hasPendingChanges()
                                transaction.push record.dataForTransaction()
                                recordIds.push record.id

                        console.log edn.encode transaction

                        DatomicIsm.connection.transact (edn.encode transaction), (result) ->
                            $("td.pendingChanges", self.$el).removeClass "pendingChanges"
                            self._showTransactButton = false
                    else
                        DatomicIsm.connection.transact (edn.encode self.model.ednPrep()), ->
                            self.$el.removeClass "pendingChanges"
                            self.$el.addClass "noChanges"
                            self.drawAttributes()
                            self._showTransactButton = false 


            transactButton.cloak()

            self.model.on "change", -> transactButton.uncloak()

            @addAttribute.text("+")
                .on click: -> 
                    self.addAttribute self.attributeDefaults()
                    self.focusLastAttribute()

            @addRecord.hide().text("+")
                .on click: ->
                    self.addRecord()

            ###
            self.$dataToggle = @dataToggle.text("d")
                .on click: =>
                    if self.$attributes.is(":visible")
                        @addAttribute.hide()
                        @addRecord.show()
                        self.$attributes.hide()
                        self.$records.show()
                        self._state = "records"
                    else
                        @addRecord.hide()
                        @addAttribute.show()
                        self.$records.hide()
                        self.$attributes.show()
                        self._state = "attributes"
            ###

            @buttons = @buttons.add self.$closeButton
            @buttons.cloak()
            
            self.$el.on
                dragstart: => 
                    self.hideCellHalo() 
                mouseenter: => 
                    @buttons.uncloak()
                    self.showTransactButton()
                mouseleave: =>
                    if not self.$el.hasClass "ui-draggable-dragging"
                        self.hideCellHalo()
                        transactButton.cloak()
                        @buttons.cloak()


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


class Query extends Model        
class QueryView extends Widget
    title: "Query"
    className: "query"

    _parseClause = (clause) ->
        #[?e :at ?b]
        #[$ ?e :at ?b]
        #[(fn) [[?e ?n]]]
        #[(fn) ?b]

    parseQuery: ->
        try 

            newValue = @editor.getValue()
            parsed = edn.toJS edn.parse if newValue.trim()[0] is "[" then newValue else "[#{newValue}]"

            @query = {}
            pushOnto = false
            for atom in parsed
                if atom[0] is ":"
                    @query[atom] = pushOnto = []
                else
                    pushOnto.push atom
            
            @findSymbols = {}
            if @query[':find']?
                @findSymbols = @query[':find']

            @knownSymbols = {}
            if @query[':in']?
                for sym in _.flatten @query[':in']
                    @knownSymbols[sym] = true
            
            if not _.isEqual @inputs, @query[':in']
                @inputs = @query[':in']
                @drawInputs()

            if @query[':where']?
                for clause in @query[':where'] when _.isArray clause
                    first = _.first clause
                    
                    if _.isArray first
                        #fn call
                        false
                    else if first[0] is "?"
                        if attr = DatomicIsm.schema.getAttribute clause[1]
                            @knownSymbols[first] = ":db/id"
                        else
                            @knownSymbols[first] = true

                    last = _.last clause

                    if _.isArray last
                        for sublast in _.flatten last
                            @knownSymbols[sublast] = true
                    else if last[0] is "?"
                        if clause[clause.length-2][0] is ":"
                            if attr = DatomicIsm.schema.getAttribute clause[clause.length-2]
                                @knownSymbols[last] = attr.value[':db/valueType']
                            else
                                @knownSymbols[last] = true

        catch e
            console.log e
            false

    _vector: (inputs) ->
        self = this
        bling ".vector", -> 
            for item in inputs
                if _.isArray item
                    @vector.append self._vector item
                else
                    @vector.append bling ".inputWrapper .placeholder, .control", ->
                        if item[0] is "$"
                            @inputWrapper.append dbCombo self.model, item
                        else if item[0] is "%"
                            drawCombo = =>
                                rules = {}
                                for n, v of RulesView.instances
                                    if name = v.model.get "widgetName"
                                        rules[n] = name
                                @control.html comboInput rules, self.model, item

                            drawCombo()
                            DatomicIsm.bus.on "rulesChanged", drawCombo

                        else 
                            @inputWrapper.append textInput self.model, item
                        @placeholder.text item

    _populateVector: (inputs) ->
        self = this
        vec = []
        for item in inputs
            do (item) ->
                if _.isArray item
                    vec.push self._populateVector item
                else
                    itemVal = self.model.get item
                    if item[0] is "$"
                        itemVal = edn.parse itemVal
                    if item[0] is "%"
                        rules = RulesView.instances[itemVal].model.get "input"
                        itemVal = ednEncode: -> rules
                    vec.push itemVal
        vec

    drawInputs: ->
        if (not _.isArray @inputs) or @inputs.length is 0
            @$inputs.hide()
            @$manualInputWrapper.hide()
            @$inputToggle.cloak()
            @$details.css height: @$buttons.outerHeight()
            @sizeCols()
        else
            @$inputToggle.uncloak()
            if @model.get("inputState") is "auto"
                @$inputToggle.text "manual input"
                @$manualInputWrapper.hide()
                @$inputs.show()
                @$inputs.html ""
                if _.isArray @inputs 
                    @$inputs.html @_vector @inputs

                @$details.css height: @$buttons.outerHeight() + $(".vector", @$inputes).outerHeight() + 10
                
                @sizeCols()

            else
                @$inputToggle.text "auto input"
                @$manualInputWrapper.show()
                @$manualInput.setValue @$manualInput.getValue()
                @$inputs.hide()


        @sizeCols()

    refresh: ->
        cur = @editor.getCursor()
        @editor.setValue @editor.getValue()
        @editor.setCursor cur

    sizeCols: ->
        #get height of @$details 
        #size the codemirror in details to max it can be excluding the buttons in there
        
        handleHeight = @$handleBar.outerHeight()
        total = @$el.outerHeight() - handleHeight
        dheight = @$details.outerHeight()
        dtop = @$details.position().top - handleHeight

        @$wrapper.css height: dtop 
        $(".CodeMirror-scroll", @$wrapper).css height: dtop 
        
        inputEditorHeight = dheight - @$buttons.outerHeight() - 12

        @$manualInputWrapper.css height: inputEditorHeight
        $(".CodeMirror-scroll", @$manualInputWrapper).css height: inputEditorHeight
        @$inputs.css height: inputEditorHeight

        @$results.css marginTop: dheight, height: total - (dtop + dheight)
        @$details.css width: "100%"
        @$rowsWrapper.css height: total - (dtop + dheight + @$cols.outerHeight())

        #size columns
        frow = $("tr", @$rows).first()
        fcols = $("td", $("tr", @$cols).first())
        $("td", frow).each (i, td) ->
            makeWidth = $(td).width()

            fcols.eq(i).css width: makeWidth

        @model.set "midPaneHeight", @$details.height()

    postAppend: ->        
        DatomicIsm.schema.on "refreshed", => @refresh()

        query = @model.get "query"
        if query
            @editor.setValue query 
            @parseQuery()
            @refresh()
            if _.size @query
                @runQuery()

        @sizeCols()

    runQuery: ->
        return if not DatomicIsm.schema.loaded

        self = this

        query = @editor.getValue().trim()
        if query[0] isnt "["
            query = "[#{query}]"


        args = {}
        if @model.get("inputState") is "auto"
            if _.isArray @inputs
                try
                    args = edn.encode @_populateVector @inputs
                catch e
                    console.log e
        else
            args = @model.get "input", ""

        self.$cols.html ""
        self.$rows.html ""
        self.$queryMsg.text "Querying"

        $.get "/api/query", {query, args}, (result) ->
            if (_.isArray result) and (_.size(result) > 0)
                self.$queryMsg.html ""
                if self.findSymbols.length is result[0]?.length
                    self.$cols.append tr = bling "tr"
                    dataTypes = []
                    for sym in self.findSymbols 
                        dataTypes.push self.knownSymbols[sym]
                        tr.bappend "td", text: sym

                for row in result
                    self.$rows.append tr = bling "tr"
                    for col, i in row 
                        tr.append cell = bling "td", text: col
                        if dataTypes[i] in [":db/id", ":db.type/ref"]
                            do (col) ->
                                cell.addClass("idlink").on click: (e) => DatomicIsm.fetchEntity col, e
            else
                self.$queryMsg.text "No Results"

            self.$results.show()
            self.sizeCols()

    render: -> 
        super()

        DatomicIsm.schema.on "refreshed", => 
            @parseQuery()
            @runQuery()

        self = this
        @inputs = false

        #default setting
        @model.get "inputState", "auto"

        @$el.bappend ".@main textarea.@editorTextarea, .@details textarea.manualInput, .@inputs, .@buttons button.@inputToggle, button.query", self: @, ->
            @manualInput.val self.model.get "input", ""
            self.$manualInput = CodeMirror.fromTextArea @manualInput.get(0),
                matchBrackets: true
                extraKeys: {"Ctrl-Space": "autocomplete", "<": -> console.log "called"}
                mode: "datomic"
                onChange: ->
                    self.model.set "input", self.$manualInput.getValue()
            
            self.$manualInputWrapper = $(self.$manualInput.getWrapperElement())

            @query.text("Query").on click: -> self.runQuery()


            @inputToggle.text("manual input").on click: =>
                if self.model.get("inputState") is "auto"
                    self.model.set "inputState", "manual"
                else
                    self.model.set "inputState", "auto"
                    
                self.drawInputs()

        @$details.resizable
            containment: "parent"
            handles: "n,s"
            resize: -> self.sizeCols()
            stop: -> 
                self.sizeCols()
                self.model.set "midPaneHeight", self.$details.height()

        @$details.draggable
            containment: "parent"
            axis: "y"
            drag: -> self.sizeCols()
            stop: -> 
                self.sizeCols()
                self.model.set "midPaneTop", self.$details.position().top

        @$details
            .css(
                position: "absolute"
                top: @model.get "midPaneTop", 150
                height: @model.get "midPaneHeight", 33)
            .after bling ".@results table.@cols, .@rowsWrapper .@queryMsg, table.@rows", {self}
        

        @$el.resizable resize: => 
            @drawInputs()
            

        oldValue = ""
        @knownKeywords = {":find": true, ":in": true, ":where": true}
        @knownSymbols = {}
        @findSymbols = []

        editor = @editor = CodeMirror.fromTextArea @$editorTextarea.get(0), 
            matchBrackets: true
            mode:
                name: "datomic"
                hooks:
                    "?": (symbol) =>
                        return " symbol#{kosherName symbol}" if @knownSymbols[symbol]?
                        return " symbol#{kosherName symbol} missing"

                    ":": (keyword) =>
                        return " keyword" if @knownKeywords[keyword]?
                        return " keyword" if $(".#{kosherName keyword}").length
                        return " keyword" if DatomicIsm.schema.getAttribute keyword
                        return " keyword missing"

            onChange: =>            
                newValue = editor.getValue()
                return if oldValue is newValue
                
                @model.set "query", newValue

                @parseQuery()
                            
                oldValue = newValue
                @refresh()
                    
                
        
        wrapper = editor.getWrapperElement()

        self.$wrapper = $(wrapper).on({
            mouseenter: ->
                $(".#{kosherName $(@).text()}").addClass "tokenActive"
            mouseleave: -> 
                $(".#{kosherName $(@).text()}").removeClass "tokenActive"
            mousedown: (e) ->
                el = $ @
                if el.hasClass "cm-missing"
                    DatomicIsm.addAttribute(el.text()).$el.css
                        position: "absolute"
                        left: self.$el.offset().left + me.width() + 10
                        top: self.$el.offset().top + 10
                else 
                    e.stopPropagation()
                    if existingAttr = DatomicIsm.schema.getAttribute el.text()
                        DatomicIsm.addWidget Browser, BrowserView, {left: e.pageX, top: e.pageY}, undefined, existingAttr.paths
                        

        }, ".cm-atom")

        $(wrapper).on({
            mouseenter: ->
                $(".cm-symbol#{kosherName $(@).text()}", self.$wrapper).addClass "tokenActive"
            mouseleave: -> 
                $(".cm-symbol#{kosherName $(@).text()}", self.$wrapper).removeClass "tokenActive"
        }, ".cm-symbol")

        @drawInputs()
        @sizeCols()

class Transact extends Model
class TransactView extends Widget
    title: "Transact"
    className: "transact"
    txcols: [":e", ":a", ":v", ":tx", ":added"]

    sizeRows: ->
        tbarHeight = @$handleBar.outerHeight()
        bpos = @$buttons.position().top - tbarHeight
        avail = (@$el.outerHeight() - tbarHeight)
        @$wrapper.css height: bpos
        $(".CodeMirror-scroll", @$wrapper).css height: bpos
        @$results.css height: avail - (bpos + @$buttons.height() + 19)

    refresh: ->
        cur = @editor.getCursor()
        @editor.setValue @editor.getValue()
        @editor.setCursor cur

    render: ->
        super()

        self = this

        @$el.bappend ".main textarea, .buttons button.transact", ->
            self.editor = CodeMirror.fromTextArea @textarea.get(0),
                matchBrackets: true
                mode: 
                    name: "datomic"
                    hooks:
                        ":": (keyword) =>
                            return " keyword" if keyword is ":db/id"
                            return " keyword" if DatomicIsm.schema.getAttribute keyword
                            return " keyword missing"

                onChange: =>
                    self.model.set "input", self.editor.getValue()

            self.$wrapper = $(self.editor.getWrapperElement())
            
            self.$buttons = @buttons.draggable
                axis: "y"
                containment: "parent"
                drag: -> self.sizeRows()
                stop: ->
                    self.sizeRows()
                    self.model.set "midPaneTop", self.$buttons.position().top

            self.$buttons.css 
                position: "absolute"
                top: self.model.get "midPaneTop", 150

            @buttons.after self.$results = bling "pre.results"

            @transact.text("Transact").on click: ->
                self.$results.text "transacting"
                DatomicIsm.connection.transact self.editor.getValue(), (result) ->
                    self.$results.html bling "table thead, tbody", ->
                        @thead.append htr = bling "tr"
                        for f in self.txcols 
                            htr.bappend "td", text: f

                        for tx in result[":tx-data"]
                            attr = false
                            @tbody.append bling "tr", ->
                                for f in self.txcols
                                    do (f, tx) =>
                                        @tr.append cell = bling "td", text: tx[f]
                                        if  f is ":a"
                                            attr = DatomicIsm.schema.getAttributeById tx[f]
                                            cell.text attr.value[":db/ident"]
                                        
                                        if f is ":v"
                                            vattr =  DatomicIsm.schema.getAttributeById tx[f]
                                            if vattr
                                                cell.text vattr.value[":db/ident"]

                                        if (f in [":e", ":a", ":tx"]) or (f is ":v" and attr and (attr.value[":db/valueType"] is ":db.type/ref"))
                                            cell.addClass("idlink").on click: (e) ->
                                                DatomicIsm.fetchEntity tx[f], e


        @$el.resizable resize: => @sizeRows()
    
        self.$wrapper.on({
            mousedown: (e) ->
                el = $ @
                if not el.hasClass "cm-missing"
                    e.stopPropagation()
                    if existingAttr = DatomicIsm.schema.getAttribute el.text()
                        DatomicIsm.fetchBrowser existingAttr.paths, e

        }, ".cm-atom")

        this

    postAppend: ->
        @sizeRows()
        @editor.setValue @model.get "input", ""
        DatomicIsm.schema.on "refreshed", => @refresh()

class Resource extends Model
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

class Schema extends Model
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

        $.get "/api/query", query: "[:find ?e :where [:db.part/db :db.install/attribute ?e]]", (packed) ->
            attributes = {}
            for e in packed 
                attributes[e[0]] = true

            $.get "/api/query", query: "[:find ?e :where [?e :db/ident]]", (items) ->

                count = items.length
                checkDone = -> 
                    count--
                    self.loaded = true
                    self.emit("refreshed") if not count 

                for item in items
                    do (item) ->
                        $.get "/api/entity/#{item[0]}", (attr) ->
                            self.add attr, if attributes[item] then "attribute" else "enum"
                            checkDone()

class Browser extends Model
class BrowserView extends Widget
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

                    if resource.type  is "enum"
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

class Note extends Model
    description: ->
        @get "note", ""

class NoteView extends Widget
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
        

class Sketch extends Model

class SketchView extends Widget
    title: "Sketch"
    className: "sketch"

    sizeRows: ->
        @$canvas.prop
            width: @$el.outerWidth()
            height: @$el.outerHeight() - (@$handleBar.outerHeight() + @$tools.outerHeight()) 

        @sketch.clear()
        @sketch.import(@model.get "objs", []).draw()
        @$activeColor.css background: @model.get "color", "rgb(0,0,0)"
        @$sizeInput.trigger "change"

    render: ->
        self = this
        super()

        @$el.resizable stop: => @sizeRows()
        @$el.append bling ".main .@tools, @canvas", {self}

        @$tools.append(
            labelPair "size", (@$sizeInput = comboInput {0.5: "small", 1: "normal", 4: "medium", 8: "large", 10: "huge"}, @model, "size")

            bling "button", text: "clear", on: click: => 
                @model.set "objs", [], true
                @sketch.clear()
            keepOnTop = bling "button", html: "[#{if @model.get "keepOnTop" then "x" else "&nbsp;"}] keep on top", on: click: =>
                if @model.get "keepOnTop"
                    @model.set "keepOnTop", false
                    keepOnTop.html "[&nbsp;] keep on top"
                    @$el.removeClass "keepOnTop"
                else
                    @model.set "keepOnTop", true
                    keepOnTop.html "[x] keep on top"
                    @$el.addClass "keepOnTop"

            bling "button", text: "hide chrome", on: click: =>
                @$el.addClass "nochrome"
                @model.set "hidechrome", true
                @sizeRows()
                @$showChrome.uncloak()
            noBg = bling "button", html: "[#{if @model.get "nobackground" then "x" else "&nbsp;"}] no background", on: click: =>
                if @model.get "nobackground"
                    @model.set "nobackground", false
                    noBg.html "[&nbsp;] no background"
                else
                    @model.set "nobackground", true
                    noBg.html "[x] no background")

        bling "span.@activeColor", self: self, appendTo: @$tools

        @$el.append bling "button.@showChrome", {self}

        @$activeColor.on click: (e) ->
            pickerHolder = bling ".pickerHolder button.@ok", appendTo: "body", ->
                @ok.text("ok").on click: => @pickerHolder.remove()

            picker = new ColorPicker
            pickerHolder.prepend(picker.el).css 
                position: "absolute"
                left: e.pageX
                top: e.pageY
                zIndex: 6000
            
            picker.color self.model.get "color", "rgb(0,0,0)"

            picker.on "change", (color) ->
                self.$activeColor.css background: color
                self.model.set "color", color.toString()

        @sketch = sketch @$canvas.get(0)
        @model.on "change", => 
            @sketch.size @model.get "size", 1.5
            @sketch.color @model.get "color", "rgb(0,0,0)"
            @sketch.opacity 1
            if @model.get "nobackground"
                @sketch.backgroundColor "rgba(255,255,255,0)"
            else
                @sketch.backgroundColor "rgba(255,255,255,1)"
            @sketch.draw()

        @model.emit "change"

        if @model.get "keepOnTop"
            @$el.addClass "keepOnTop"

        if @model.get "hidechrome" 
            @$el.addClass "nochrome"

        @$sizeInput.val @model.get "size", 1.5

        @$el.on "drag.start", => 
            $(".pickerHolder").remove()
            @$canvas.hide()

        @$el.on "drag.stop", =>
            @$canvas.hide().show()

        @$showChrome.cloak().text("show chrome").on click: =>
            @model.set "hidechrome", false
            @$el.removeClass "nochrome"
            @$el.trigger "resize"
            @sizeRows()

        @$el.on
            mouseenter: => 
                if @model.get "hidechrome" 
                    @$showChrome.uncloak()
            mouseleave: =>
                if @model.get "hidechrome"
                    @$showChrome.cloak()

        @$canvas.on mouseup: =>
            @model.set "objs", @sketch.export(), true

        this

    postAppend: ->
        @sizeRows()


class Datom extends Model
class DatomView extends Widget
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

class Rules extends Model
    init: ->
        @on "change", -> DatomicIsm.bus.emit "rulesChanged"

class RulesView extends Widget
    title: "Rules"
    className: "rules"

    @instances = {}
    init: ->
        RulesView.instances[@id] = @
        DatomicIsm.bus.emit "rulesChanged"

    close: ->
        @model.remove()
        delete RulesView.instances[@id]
        DatomicIsm.bus.emit "rulesChanged"

        super()

    sizeRows: ->
        height = @$el.outerHeight() - @$handleBar.outerHeight()
        @$wrapper.css height: height
        $(".CodeMirror-scroll", @$wrapper).css height: height

    refresh: ->
        cur = @editor.getCursor()
        @editor.setValue @editor.getValue()
        @editor.setCursor cur

    render: ->
        self = this
        super()
        @$widget.bappend ".main textarea", ->
            self.editor = CodeMirror.fromTextArea @textarea.get(0),
                matchBrackets: true
                mode: 
                    name: "datomic"
                    hooks:
                        ":": (keyword) =>
                            return " keyword" if keyword is ":db/id"
                            return " keyword" if DatomicIsm.schema.getAttribute keyword
                            return " keyword missing"

                onChange: =>
                    self.model.set "input", self.editor.getValue()

            self.$wrapper = $(self.editor.getWrapperElement())
        
            self.$wrapper.on({
                mousedown: (e) ->
                    el = $ @
                    if not el.hasClass "cm-missing"
                        e.stopPropagation()
                        if existingAttr = DatomicIsm.schema.getAttribute el.text()
                            DatomicIsm.fetchBrowser existingAttr.paths, e
            }, ".cm-atom")

        @sizeRows()

        @$el.resizable stop: => @sizeRows()

    postAppend: ->
        @editor.setValue @model.get "input", ""
        DatomicIsm.schema.on "refreshed", => @refresh()
        @sizeRows()

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

window.DatomicIsm =
    fetchEntity: (entityId, e) ->
        DatomicIsm.addWidget Entity, EntityView, {left: e.pageX, top: e.pageY}, undefined, {searchBy: "byId", byId: entityId}

    fetchBrowser: (paths, e) ->
        DatomicIsm.addWidget Browser, BrowserView, {left: e.pageX, top: e.pageY}, undefined, paths

    fetchDatom: (entityId, attribute, e) ->
        DatomicIsm.addWidget Datom, DatomView, {left: e.pageX, top: e.pageY}, undefined, {entityId, attribute}

    addAttribute: (kw, data = {type: ":db.type/string"}) ->
        [namespaceName, attributeName] = kw[1..-1].split("/")
        useNamespace = false
        for namespace in DatomicIsm.namespaces when namespace.get("name") is namespaceName
            useNamespace = namespace
                        
        if not useNamespace
            useNamespace = new Namespace name: namespaceName
            DatomicIsm.namespaces.push useNamespace
            DatomicIsm.views[useNamespace.id] = view = new NamespaceView useNamespace
            view.$el.appendTo "body"
        else 
            view = DatomicIsm.views[useNamespace.id]
                        
            for attribute in useNamespace.attributes when attribute.get("name") is attributeName
                return
                
        data.name = attributeName            
        view.addAttribute data
        DatomicIsm.refreshQueries()
        if view 
            view.$el.css position: "absolute"
        view
            
    drawToolbar: ->
       self = this

       @toolbar = (bling "ul", class: "toolbar").appendTo("body").append(
            browserEl     = bling "li", text: "browser"
            namespace     = bling "li", text: "namespace"
            enumEl        = bling "li", text: "enum"
            queryEl       = bling "li", text: "query"
            rulesEl       = bling "li", text: "rules"
            transactEl    = bling "li", text: "transact"
            entityEl      = bling "li", text: "entity"
            noteEl        = bling "li", text: "note"
            sketchEl      = bling "li", text: "sketch"
            connectButton = bling "button.connect", text: "connect")
       
       connectButton.on click: =>
            return if $(".connectModal").length

            drawDbOptions = ->
                if (host = self.connection.get("host"))?.length and (port = self.connection.get("port"))?.length
                    self.connection.connect ->
                        comboPlaceholder.html labelPair "db", combo = dbCombo self.connection, "db-alias"
                        combo.on "changedValue", (evt, val) ->
                            [alias, db] = (edn.parse val).at(":db/alias").split "/"
                            self.connection.set "db", db
                            self.connection.set "alias", alias
                            buttons.$ok.prop "disabled",false

            modal = bling ".connectModal.modal", ->
                for field in ["host", "port"]
                    @modal.append labelPair field, input = textInput self.connection, field
                    input.on "changedValue", drawDbOptions

            modal.append comboPlaceholder = bling "div"
            modal.bappend "button.@ok, button.@cancel", {self: buttons = {}}, ->
                @cancel.text("close").on click: ->
                    modal.remove()

                @ok.prop("disabled", true).text("OK").on click: ->
                    Storage.set "connection", self.connection.data
                    self.connection.connect ->
                        modal.remove()

            console.log buttons
            drawDbOptions()
            modal.addClass "connection"
            modal.appendTo "body"
            

       self.connection.on "connected", -> connectButton.text "connection [connected]"
       
       $win = $(window)
       stopHandler = (modelClass, viewClass) => (e, ui) =>
            pos = 
                left: ui.position.left + $win.scrollLeft()
                top: ui.position.top + $win.scrollTop()

            added = self.addWidget modelClass, viewClass, pos
            added.view.postDrop?()

       browserEl.draggable
           helper: "clone"
           stop: stopHandler Browser, BrowserView

       enumEl.draggable 
           helper: "clone"
           stop: stopHandler Enum, EnumView
               
       namespace.draggable
           helper: "clone"
           stop: stopHandler Namespace, NamespaceView
       
       queryEl.draggable
           helper: "clone"
           stop: stopHandler Query, QueryView

       transactEl.draggable
           helper: "clone"
           stop: stopHandler Transact, TransactView

       entityEl.draggable
           helper: "clone"
           stop: stopHandler Entity, EntityView

       rulesEl.draggable
           helper: "clone"
           stop: stopHandler Rules, RulesView

        noteEl.draggable
           helper: "clone"
           stop: stopHandler Note, NoteView 

        sketchEl.draggable
            helper: "clone"
            stop: stopHandler Sketch, SketchView

    addWidget: (modelClass, viewClass, pos, id, data = {}) ->
        id or= "widget#{guid()}"
        model = new modelClass data
        view = new viewClass model, id

        view.$el.appendTo "body"
        pos.position = "absolute"
        view.$el.css pos
        view.saveState?()
        view.postAppend?()
        view.raiseToTop()
        view.$name?.focus()
        view.sizeTitleBar?()
        @map.drawNodes()
        @explorer.drawNodes()
        {model, view}

    schemaHint: ->
        console.log arguments

    init: ->
        CodeMirror.commands.autocomplete = (cm) ->
            CodeMirror.simpleHint cm, DatomicIsm.schemaHint 

        @bus = new Emitter

        @map = new CartographicSurface surface: "body", selector: ".widget", scale: 0.08
        @map.render().$el.appendTo "body"

        @explorer = new Explorer surface: "body", selector: ".widget"
        @explorer.render().$el.appendTo "body"
 
        connectionData = Storage.get "connection", {}
        @connection = new Connection connectionData
        @schema = new Schema
        @connection.on "connected", => @schema.refresh()

        @connection.connect() if _.size connectionData 

        @views = {}
        @drawToolbar()

        classes = {BrowserView, DatomView, RulesView, EnumView, EntityView, QueryView, TransactView, NamespaceView, NoteView, SketchView, Browser, Datom, Rules, Enum, Entity, Query, Transact, Namespace, Note, Sketch}
        for wid, widget of Storage.get "widgets", {}
            modelClass = classes[widget.class]
            viewClass = classes[widget.class + "View"]
            pos = 
                left: widget.left
                top: widget.top
                width: widget.width
                height: widget.height

            added = @addWidget modelClass, viewClass, pos, wid, widget.data
            added.view.$el.trigger "mouseleave"

        @map.drawNodes()
        @explorer.drawNodes()
        $(window).scrollTop(100).scrollTop(0)
        $("body").on {
            mouseenter: ->
                $(".entity-#{kosherName $(@).text()}").addClass "lit"
            mouseleave: ->
                $(".entity").removeClass "lit"
        }, ".idlink"

        ###
        $("body").draggable 
            drag: (e, ui) ->
                

            stop: (e, ui) ->
                $(window).scrollTop($(window).scrollTop() + (ui.position.top * -1))
                $(window).scrollLeft($(window).scrollLeft() + (ui.position.left * -1))
                ui.helper.css ui.originalPosition

        ###

        $(document).on keydown: (e) ->
            if e.keyCode in [$.ui.keyCode.LEFT, $.ui.keyCode.RIGHT, $.ui.keyCode.UP, $.ui.keyCode.DOWN]
                e.preventDefault()

$ ->

    require.register "component-jquery/index.js", (module, exports, require) -> module.exports = $    
    
    bling = require "shaunxcode-bling"
    CartographicSurface = require "shaunxcode-CartographicSurface"
    
    oldAppend = $.fn.append
    $.fn.append = -> oldAppend.apply(@, arguments).trigger("append")
    $.fn.cloak = -> $(@).css visibility: "hidden"
    $.fn.uncloak = -> $(@).css visibility: "visible"
    $.fn.toCenter = -> 
        el = $ @
        el.css
            left: ($(window).width() / 2) - (el.outerWidth() / 2)
            top: ($(window).height() / 2) - (el.outerHeight() / 2)

    for m in ["before", "after", "append", "prepend"]
        do (m) -> $.fn["b#{m}"] = -> @[m] bling.apply {}, arguments

    window.markdown = new Showdown.converter

    edn.setTokenAction "keyword", (token) -> token
    
    edn.setEncodeHandler "comment", ((obj) -> obj instanceof Comment), (obj) -> obj.ednEncode()
    
    #hack for simple pretty printing
    edn.setEncodeAction "object", (obj) ->
        result = []
        max = _.size(obj) - 1
        i = 0
        for k, v of obj
            result.push edn.encode ":#{k}"
            result.push "#{edn.encode v}#{if i is max then "" else "\n"}"
            i++
        lines = "\n{#{result.join " "}}".split "\n"
        (" #{line}" for line in lines).join("\n") + "\n"

    DatomicIsm.init()
