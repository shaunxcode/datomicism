{Entity, EntityView} = require "./widget/Entity"
{Enum, EnumView} = require "./widget/Enum"
{Namespace, NamespaceView} = require "./widget/Namespace"
{Query, QueryView} = require "./widget/Query"
{Datom, DatomView} = require "./widget/Datom"
{Rules, RulesView} = require "./widget/Rules"
{Sketch, SketchView} = require "./widget/Sketch"
{Note, NoteView} = require "./widget/Note"
{Browser, BrowserView} = require "./widget/Browser"
{Transact, TransactView} = require "./widget/Transact"

module.exports = {
	Entity, EntityView
	Enum, EnumView
	Namespace, NamespaceView
	Query, QueryView
	Datom, DatomView
	Rules, RulesView
	Sketch, SketchView
	Note, NoteView
	Browser, BrowserView
	Transact, TransactView
	Order: ["Browser", "Namespace", "Enum", "Query", "Rules", "Transact", "Entity", "Note", "Sketch"]
	Tips:
		Entity: "After the browser this is the most common way to navigate through the system. You can either type an entity id in or browse via namespace. Once you are viewing an entity (or list of entities) clicking any of the links will reveal another entity widget navigated to the relevant location." 
		Enum: "The enum widget is similar to namespace but only allows for adding the names of the enum members."
		Namespace: "The collection of attributes for a given entity. You may not alter existing attributes but you can add new ones. Clicking the arrow to the left of an attribute reveals further details."
		Query: "The query widget is very useful for sanity checking your queries as it will do real time schema checking to make sure the attributes you are referring to exist. It will also indicate if terms in your find clause are actually bound either in the in or where clauses. You can click any attribute in to see it in a browser. If you are utilizing input there is an experimental interface which provides inputs that correspond to the in clause. You can toggle to manual if you would like to just pass in."
		Datom: "A datom may be dragged out of any entity - the plan is to allow historical interrogation for a given EAV tuple. Currently it just shows the details."
		Rules: "Useful when you want to share where clauses in many queries."
		Sketch: "Simple canvas based paint tool for when words will not suffice."
		Note: "Markdown based snippets - good for annotating/fluent programming style descriptions."
		Browser: "The main navigational tool. It is grouped hierarchically by namespace. A node in this list will either represent attributes for an entity or an enum. You can drag and drop any namespace or attribute to the workspace to inspect it as an entity."
		Transact: "Allows for issuing of transactions directly. Useful for importing an entire schema/dataset."
}
