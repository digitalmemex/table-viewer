require.config
  baseUrl: '/filerepo/dmx/table-viewer/dist'
  paths:
    jquery: 'jquery/jquery'
    bootstrap: 'bootstrap/bootstrap'
    knockout: 'knockout/knockout'
    knockmap: 'bower-knockout-mapping/knockout.mapping'
    client: 'js/client'
    dialog: 'js/dialog'
    store: 'js/store'
    view: 'js/view'
  shim:
    bootstrap: deps: ['jquery']
    knockmap: deps: ['knockout']

require ['bootstrap'], ->
  require ['jquery', 'knockout', 'view'], ($, ko, View) ->
    $ ->
      ko.applyBindings new View()
      $('body').show()
