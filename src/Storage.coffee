module.exports = 
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