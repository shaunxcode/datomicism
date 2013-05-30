module.exports = 
	types:
		":db.type/keyword": "keyword"
		":db.type/string":	"string"
		":db.type/boolean": "boolean"
		":db.type/long":		"long"
		":db.type/bigint":	"bigint"
		":db.type/float":		"float"
		":db.type/double":	"double"
		":db.type/bigdec":	"bigdec"
		":db.type/ref":			"ref"
		":db.type/instant": "instant"
		":db.type/uuid":		"uuid"
		":db.type/uri":			"uri"
		":db.type/bytes":		"bytes"

	uniqueTypes:
		"nil":								 "no"
		":db.unique/value":		 "value"
		":db.unique/identity": "identity"

	cardinalityTypes:
		":db.cardinality/one": 1
		":db.cardinality/many": "n"