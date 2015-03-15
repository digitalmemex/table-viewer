define ['jquery', 'knockout'], ($, ko) ->
#
  () ->
  #
    $dialog = $('#dialog')
    _active = ko.observable false
    _title = ko.observable 'Loading'
    _message = ko.observable 'Something ...'

    getMessage: _message
    getTitle: _title

    hide: ->
      _active false
      console.log 'hide dialog: ' + _title()
      $dialog.modal 'hide'

    show: (title, message) ->
      _title title
      _message message
      console.log 'show dialog: ' + title + ', ' + message
      if _active() is false
        _active true
        $dialog.modal 'show'
