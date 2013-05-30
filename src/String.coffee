String.prototype.$tag = (args) -> $ "<#{@}/>", args
String.prototype.upperCaseFirst = -> @[0].toUpperCase() + @[1..-1] 
