define ['knockout', 'knockmap'], (ko) ->
#
  sortTypesByName = (l, r) -> l.name.localeCompare r.name
  sortTypesByUri = (l, r) -> l.uri.localeCompare r.uri
  sortTopicsByValue = (l, r) -> String(l.value()).localeCompare String(r.value())
  sortTopicsByType = (l, r) -> l.type?.localeCompare r.type
  sortComposite = (composite) ->
    if composite?.length > 0
      for c in composite.sort sortTopicsByType
        sortComposite c.composite

  getUniqDataTypes = (types) ->
    dataTypes = {}
    for type in types
      count = dataTypes[type.dataType] ? 0
      dataTypes[type.dataType] = count + 1
    detach = (dataType, count) -> count: count, uri: dataType
    detach dataType, count for dataType, count of dataTypes

  ->
  #
    type = ko.observable()
    types = ko.observableArray []
    typesByUri = {}
    dataType = ko.observable()
    dataTypes = ko.observableArray []
    topics = ko.observableArray []
    headers = ko.observableArray []

    mapTopic = (values) ->
      console.log 'add topic: ' + values.id
      sortComposite values.composite
      ko.mapping.fromJS values

    getActiveChildDepths = (childTypes) ->
      depths = []
      for child in childTypes
        if child.isActive()
          depths.push child.depth()
      depths

    updateDepth = (child) ->
      ds = getActiveChildDepths child.childTypes
      console.log 'update active child depths'
      console.log ds
      d = ds.sort().pop() ? -1
      child.depth d + 1

    updateActivation = (child, count, activate) ->
      console.log 'update parents of type: ' + child.name
      updateDepth child
      for parent in child.parentTypes
        if activate
          parent.cols parent.cols() + count
        else
          parent.cols parent.cols() - count
        if parent.isActive()
          updateActivation parent, count, activate
        else
          updateDepth parent

    updateRowSpan = (parent, depth) ->
      console.log 'update row span count of ' + parent.uri + ' with depth = '  + depth
      #console.log parent
      for child in parent.childTypes
        if child.childTypes.length is 0
          console.log 'update last leaf: ' + child.uri + ' > ' + depth
          child.rows depth
        else
          updateRowSpan child, depth - 1

    addType = (values) ->
      #values.icon = '/resource' + values.icon
      values.isInMenu = ko.observable true
      values.rows = ko.observable 1
      values.cols = ko.observable 0
      values.depth = ko.observable 0
      values.isActive = ko.observable false
      values.isActive.subscribe (active) ->
        console.log 'initial update type parents of ' + values.name
        if values.childTypes.length is 0
          updateActivation values, 1, values.isActive()
        else
          updateActivation values, values.cols(), values.isActive()
        updateRowSpan type(), type().depth()

      typesByUri[values.uri] = values
      types.push values

    linkReleatedTypes = (values) ->
      values.childTypes = (typesByUri[c] for c in values.childTypes).sort sortTypesByUri
      values.parentTypes = (typesByUri[p] for p in values.parentTypes).sort sortTypesByName

    checkIsChildVisible = (child, parent, isParentVisible) -> ko.computed ->
      active = isParentVisible() and child.isActive()
      console.log 'check header activation ' + child.uri + ' is ' + active
      console.log 'parent ' + parent.uri + ' isVisible = ' + isParentVisible()
      console.log 'child ' + child.uri + ' isActive = ' + child.isActive()
      active

    explodeHeaders = (parent, depth = 0, isParentVisible = -> true) ->
      console.log 'explode header of ' + parent.uri
      headers.push ko.observableArray [] unless headers()[depth]
      for child in parent.childTypes
        console.log 'explode header, child ' + child.uri
        isChildVisible = checkIsChildVisible child, parent, isParentVisible
        headers()[depth].push ko.observable
          type: child
          rows: child.rows
          cols: child.cols
          isVisible: isChildVisible
        explodeHeaders child, depth + 1, isChildVisible

    activateAll = (parent) ->
      for child in parent.childTypes
        child.isActive true
        activateAll child

    # public API

    getDataType: dataType

    getDataTypes: dataTypes

    getHeaderRows: headers

    getTopics: topics

    getType: type

    getTypes: types

    isTypeActiveValue: (typeUri) ->
      console.log 'is type active value ' + typeUri()
      t = typesByUri[typeUri()]
      t and t.isActive() and t.childTypes.length is 0

    setDataType: (dt) -> dataType dt

    setDataTypes: (list) ->
      console.log 'update data types'
      dataTypes.removeAll()
      dataTypes.push d for d in list
      dataTypes.sort sortTypesByName

    setTopics: (list) ->
      console.log 'update topics'
      topics.removeAll()
      topics.push mapTopic t for t in list
      topics.sort sortTopicsByValue

    setType: (t) ->
      headers.removeAll()
      typeHeader =
        type: t
        cols: 1
        rows: t.depth
        isVisible: -> true
      console.log 'typeHeader'
      console.log typeHeader
      headers.push ko.observableArray [ typeHeader ]
      type t
      #activateAll t
      explodeHeaders t

    setTypes: (list) ->
      console.log 'update types'
      types.removeAll()
      typesByUri = {}
      addType t for t in list
      linkReleatedTypes t for t in list
      types.sort sortTypesByName
