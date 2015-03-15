define(['jquery', 'knockout', 'client', 'dialog', 'store'], function($, ko, Client, Dialog, Store) {
  return function() {
    var client, dialog, store;
    dialog = new Dialog();
    store = new Store();
    client = new Client();
    console.log('init view');
    dialog.show('Loading ...', 'Data type list');
    client.getDataTypes(function(err, dataTypes) {
      if (err != null) {
        console.log(err);
        return dialog.show('Error', err);
      } else {
        store.setDataTypes(dataTypes);
        dialog.show('Loading ...', 'Topic type list');
        return client.getTypes(function(err, types) {
          if (err != null) {
            console.log(err);
            return dialog.show('Error', err);
          } else {
            store.setTypes(types);
            return dialog.hide();
          }
        });
      }
    });
    return {
      chooseDataType: function(dataType) {
        var i, len, ref, results, t;
        console.log('choose data type ' + dataType.uri);
        store.setDataType(dataType);
        ref = store.getTypes();
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          t = ref[i];
          if (t.dataType === dataType.uri) {
            results.push(t.isInMenu(true));
          } else {
            results.push(t.isInMenu(false));
          }
        }
        return results;
      },
      chooseType: function(type) {
        console.log('choose type ' + type.uri);
        dialog.show('Loading ...', 'Topic list');
        return client.getTopics(type.uri, function(err, topics) {
          if (err != null) {
            return dialog.show('Error', err);
          } else {
            store.setType(type);
            store.setTopics(topics);
            return dialog.hide();
          }
        });
      },
      getActualDataTypeName: ko.computed(function() {
        if (store.getDataType()) {
          return store.getDataType().name;
        } else {
          return 'Data types';
        }
      }),
      getActualTypeName: ko.computed(function() {
        if (store.getType()) {
          return store.getType().name;
        } else {
          return 'Types';
        }
      }),
      getDialog: function() {
        return dialog;
      },
      getStore: function() {
        return store;
      }
    };
  };
});
