#datomicism
An interface for visualizing datomic schemas and queries. It may be easiest to watch the [video](http://www.screenr.com/J087) to get a quick overview. 

#Getting started
`npm install datomicism -g`

start the server (defaults to port 6655) 

`datomicism` 

download latest version of datomic 

start the transactor (defaults to port 4334)

`./bin/transactor config/samples/free-transactor-template.properties `

start the rest server (here we are starting it on port 9999)

`./bin/rest -p 9999 -o http://localhost:6655 datomicrest datomic:free://localhost:4334/`

navigate to `http://localhost:6655` in your browser

click connect, enter `localhost` for the host and `9999` for the port. If you have a db you are working with select it - otherwise create one by selecting `--new db--`. 

#NOTE
this is an experimental prototype e.g. please do not look at the code as being anything beside a prototype. In minecraft terms this is my dirt/cobble structure I laid out to see if building the real thing would be worth it. Now I'm busy smelting the stone to start laying down the foundation in brick. However, I feel it does represent my intention fairly well so I welcome feedback re bugs/ux/features. 

##What is this?
I guess you could say it is a smalltalk environment for datomic? The parallels between the two seem apparent to me but perhaps the most important is "turtles all the way down" - in smalltalk this means everything is an object - in datomic everything is an entity which yields a very similar experience/potential. 

##Installation
```sudo npm install datomicism -g```

```datomicism``` - the port defaults to 6655 but you can pass it in via -p {port}

You should now be able to navigate http://localhost:6655 and see an empty workspace. If you click on connection and enter a valid ip adddress/port of a running datomic rest server you should then see a list of databases to connect to. 

#Workspace
This is the "desktop" (though I am attempting to avoid that metaphor) where you drag and drop various widgets. It is persistent (currently local storage but the potential to have shared workspaces is there) - meaning you can refresh and everything should be where you left it. 

##Toolbar
Contains the various widgets you can drag and drop onto the workspace. On the far right is the connection button which should indicate if you are currently connected or not.

###Connection
This is where you set your basic datomic connection details e.g. host (ip address e.g. 127.0.0.1), port, and then select the alias/db you would like to work with. You can create a new database for a given alias from this control as well. 

###Minimap
Helps you visualize your viewport location in relation to the rest of the widgets you may have in the workspace. Updates in real time in relation to the widgets themselves. You can click on it to scroll to a different location.

###Explorer
A list of all the widgets in the workspace. highlighting one should highlight it in the minimap and workspace. You can click the x to the right of any item in the explorer to remove it. 

##Widgets
Most widgets are available from the toolbar or can be accessed via the browser/other entities.

###Browser
The main navigational tool. It is grouped hierarchically by namespace. A node in this list will either represent attributes for an entity or an enum. You can drag and drop any namespace or attribute to the workspace to inspect it as an entity.

###Namespace
The collection of attributes for a given entity. You may not alter existing attributes but you can add new ones. Clicking the arrow to the left of an attribute reveals further details.

###Enum
The enum widget is similar to namespace but only allows for adding the names of the enum members.

###Entity
After the browser this is the most common way to navigate through the system. You can either type an entity id in or browse via namespace. Once you are viewing an entity (or list of entities) clicking any of the links will reveal another entity widget navigated to the relevant location.

###Datom 
A datom may be dragged out of any entity - the plan is to allow historical interrogation for a given "eav" tuple. Currently it just shows the details.

###Transact
Allows for issuing of transactions directly. Useful for importing an entire schema/dataset.

###Query
The query widget is very useful for sanity checking your queries as it will do real time schema checking to make sure the attributes you are referring to exist. It will also indicate if terms in your find clause are actually bound either in the in or where clauses. You can click any attribute in to see it in a browser. If you are utilizing input there is an experimental interface which provides inputs that correspond to the in clause. You can toggle to manual if you would like to just pass in 

###Rules
Useful when you want to share where clauses in many queries.

###Note
Markdown based snippets - good for annotating/fluent programming style descriptions.

###Sketch
Simple canvas based paint tool for when words will not suffice.

##Todo
check the issues page, I should be adding known bugs and features as I find them but PLEASE contribute any bugs/features you find as well. 
