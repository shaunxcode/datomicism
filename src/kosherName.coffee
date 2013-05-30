module.exports = (name = "") ->
		name.replace /[\?\-\:\/\.]/g, "_"