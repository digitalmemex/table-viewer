define ['jquery', 'knockout', 'client', 'dialog', 'store'], ($, ko, Client, Dialog, Store) ->
#
  () ->
  #
    dialog = new Dialog()
    store = new Store()
    client = new Client()

    console.log 'init view'
    dialog.show 'Loading ...', 'Data type list'
    client.getDataTypes (err, dataTypes) ->
      if err?
        console.log err
        dialog.show 'Error', err
      else
        store.setDataTypes dataTypes
        dialog.show 'Loading ...', 'Topic type list'
        client.getTypes (err, types) ->
          if err?
            console.log err
            dialog.show 'Error', err
          else
            store.setTypes types
            dialog.hide()

    # public API
    chooseDataType: (dataType) ->
      console.log 'choose data type ' + dataType.uri
      store.setDataType dataType
      for t in store.getTypes()
        if t.dataType is dataType.uri
          t.isInMenu true
        else
          t.isInMenu false

    chooseType: (type) ->
      console.log 'choose type ' + type.uri
      dialog.show 'Loading ...', 'Topic list'
      client.getTopics type.uri, (err, topics) ->
        if err?
          dialog.show 'Error', err
        else
          store.setType type
          store.setTopics topics
          dialog.hide()

    getActualDataTypeName: ko.computed ->
      if store.getDataType() then store.getDataType().name else 'Data types'

    getActualTypeName: ko.computed ->
      if store.getType() then store.getType().name else 'Types'

    getDialog: -> dialog

    getStore: -> store
