define(['jquery', 'knockout'], function($, ko) {
  return function() {
    var $dialog, _active, _message, _title;
    $dialog = $('#dialog');
    _active = ko.observable(false);
    _title = ko.observable('Loading');
    _message = ko.observable('Something ...');
    return {
      getMessage: _message,
      getTitle: _title,
      hide: function() {
        _active(false);
        console.log('hide dialog: ' + _title());
        return $dialog.modal('hide');
      },
      show: function(title, message) {
        _title(title);
        _message(message);
        console.log('show dialog: ' + title + ', ' + message);
        if (_active() === false) {
          _active(true);
          return $dialog.modal('show');
        }
      }
    };
  };
});
