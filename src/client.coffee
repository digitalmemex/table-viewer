define ['jquery'], ($) ->
#
  dataTypeUri = 'dm4.core.data_type'
  childTypeUri = 'dm4.core.child_type'
  iconUri = 'dm4.webclient.icon'
  assocDefChildTypes = ['dm4.core.aggregation_def', 'dm4.core.composition_def']

  associationEndpoint = 'core/association'
  associationInfo = associationEndpoint + '/'

  topicEndpoint = 'core/topic'
  topicInfo = topicEndpoint + '/'
  topicsByType = topicEndpoint + '/by_type/'
  fetchComposite = '?include_childs=true'

  typesEndpoint = 'core/topictype/all'

  defaultIcon = '/de.deepamehta.webclient/images/ball-gray.png'

  detachDataType = (t) ->
    name: t.value
    uri: t.uri

  createChildTypes = (assoc_defs) ->
    for assoc_def in assoc_defs
      if assoc_def.type_uri in assocDefChildTypes
        if assoc_def.role_1.role_type_uri is childTypeUri
          assoc_def.role_1.topic_uri
        else
          assoc_def.role_2.topic_uri

  detachComposite = (composite) ->
    detachTopic part for typeUri, part of composite

  detachTopic = (topic) ->
    id: topic.id
    type: topic.type_uri
    uri: topic.uri
    value: topic.value
    composite: detachComposite topic.childs

  detachType = (type) ->
    for vc in type.view_config_topics
      type.icon = vc.childs?[iconUri]?.value
    id: type.id
    name: type.value
    uri: type.uri
    dataType: type.data_type_uri
    childTypes: createChildTypes type.assoc_defs
    icon: type.icon ? defaultIcon

  clarifyParents = (types) ->
    parentsByChild = {}
    parentsByChild[type.uri] = [] for type in types
    for type in types
      for child in type.childTypes
        parentsByChild[child].push type.uri
    for type in types
      type.parentTypes = parentsByChild[type.uri]
    types

  (serverUrl = '/') ->
    console.log 'create client with ctx ' + serverUrl

    typesUrl = serverUrl + typesEndpoint

    topicsUrl = (uri) ->
      serverUrl + topicsByType + uri + fetchComposite

    # API
    getDataTypes: (done) ->
      url = topicsUrl(dataTypeUri)
      console.log 'query data types ' + url
      req = $.ajax url: url, dataType: 'json'
      req.fail (jqXHR, textStatus, errorThrown) ->
        console.log 'AJAX Error: ' + textStatus
        done errorThrown
      req.done (data) ->
        try
          done null, (detachDataType t for t in data.items)
        catch e
          console.log 'Error: detach failed'
          done e

    getTopics: (uri, done) ->
      url = topicsUrl(uri)
      req = $.ajax url: url, dataType: 'json'
      console.log 'query topics ' + url
      req.fail (jqXHR, textStatus, errorThrown) ->
        console.log 'AJAX Error: ' + textStatus
        done errorThrown
      req.done (data) ->
        try
          done null, (detachTopic t for t in data.items)
        catch e
          console.log 'Error: detach failed'
          done e

    getTypes: (done) ->
      req = $.ajax url: typesUrl, dataType: 'json'
      console.log 'query topic types ' + typesUrl
      req.fail (jqXHR, textStatus, errorThrown) ->
        console.log 'AJAX Error: ' + textStatus
        done errorThrown
      req.done (data) ->
        try
          types = (detachType t for t in data)
          ctypes = clarifyParents types
          done null, ctypes
        catch e
          console.log 'Error: detach failed'
          done e
