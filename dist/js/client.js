var indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

define(['jquery'], function($) {
  var assocDefChildTypes, associationEndpoint, associationInfo, childTypeUri, clarifyParents, createChildTypes, dataTypeUri, defaultIcon, detachComposite, detachDataType, detachTopic, detachType, fetchComposite, iconUri, topicEndpoint, topicInfo, topicsByType, typesEndpoint;
  dataTypeUri = 'dm4.core.data_type';
  childTypeUri = 'dm4.core.child_type';
  iconUri = 'dm4.webclient.icon';
  assocDefChildTypes = ['dm4.core.aggregation_def', 'dm4.core.composition_def'];
  associationEndpoint = 'core/association';
  associationInfo = associationEndpoint + '/';
  topicEndpoint = 'core/topic';
  topicInfo = topicEndpoint + '/';
  topicsByType = topicEndpoint + '/by_type/';
  fetchComposite = '?include_childs=true';
  typesEndpoint = 'core/topictype/all';
  defaultIcon = '/de.deepamehta.webclient/images/ball-gray.png';
  detachDataType = function(t) {
    return {
      name: t.value,
      uri: t.uri
    };
  };
  createChildTypes = function(assoc_defs) {
    var assoc_def, i, len, ref, results;
    results = [];
    for (i = 0, len = assoc_defs.length; i < len; i++) {
      assoc_def = assoc_defs[i];
      if (ref = assoc_def.type_uri, indexOf.call(assocDefChildTypes, ref) >= 0) {
        if (assoc_def.role_1.role_type_uri === childTypeUri) {
          results.push(assoc_def.role_1.topic_uri);
        } else {
          results.push(assoc_def.role_2.topic_uri);
        }
      } else {
        results.push(void 0);
      }
    }
    return results;
  };
  detachComposite = function(composite) {
    var part, results, typeUri;
    results = [];
    for (typeUri in composite) {
      part = composite[typeUri];
      results.push(detachTopic(part));
    }
    return results;
  };
  detachTopic = function(topic) {
    var t;
    if ($.isArray(topic)) {
      t = topic.pop();
    } else {
      t = topic;
    }
    return {
      id: t.id,
      type: t.type_uri,
      uri: t.uri,
      value: t.value,
      composite: detachComposite(t.childs)
    };
  };
  detachType = function(type) {
    var i, len, ref, ref1, ref2, ref3, vc;
    ref = type.view_config_topics;
    for (i = 0, len = ref.length; i < len; i++) {
      vc = ref[i];
      type.icon = (ref1 = vc.childs) != null ? (ref2 = ref1[iconUri]) != null ? ref2.value : void 0 : void 0;
    }
    return {
      id: type.id,
      name: type.value,
      uri: type.uri,
      dataType: type.data_type_uri,
      childTypes: createChildTypes(type.assoc_defs),
      icon: (ref3 = type.icon) != null ? ref3 : defaultIcon
    };
  };
  clarifyParents = function(types) {
    var child, i, j, k, l, len, len1, len2, len3, parentsByChild, ref, type;
    parentsByChild = {};
    for (i = 0, len = types.length; i < len; i++) {
      type = types[i];
      parentsByChild[type.uri] = [];
    }
    for (j = 0, len1 = types.length; j < len1; j++) {
      type = types[j];
      ref = type.childTypes;
      for (k = 0, len2 = ref.length; k < len2; k++) {
        child = ref[k];
        parentsByChild[child].push(type.uri);
      }
    }
    for (l = 0, len3 = types.length; l < len3; l++) {
      type = types[l];
      type.parentTypes = parentsByChild[type.uri];
    }
    return types;
  };
  return function(serverUrl) {
    var topicsUrl, typesUrl;
    if (serverUrl == null) {
      serverUrl = '/';
    }
    console.log('create client with ctx ' + serverUrl);
    typesUrl = serverUrl + typesEndpoint;
    topicsUrl = function(uri) {
      return serverUrl + topicsByType + uri + fetchComposite;
    };
    return {
      getDataTypes: function(done) {
        var req, url;
        url = topicsUrl(dataTypeUri);
        console.log('query data types ' + url);
        req = $.ajax({
          url: url,
          dataType: 'json'
        });
        req.fail(function(jqXHR, textStatus, errorThrown) {
          console.log('AJAX Error: ' + textStatus);
          return done(errorThrown);
        });
        return req.done(function(data) {
          var e, t;
          try {
            return done(null, (function() {
              var i, len, ref, results;
              ref = data.items;
              results = [];
              for (i = 0, len = ref.length; i < len; i++) {
                t = ref[i];
                results.push(detachDataType(t));
              }
              return results;
            })());
          } catch (_error) {
            e = _error;
            console.log('Error: detach failed');
            return done(e);
          }
        });
      },
      getTopics: function(uri, done) {
        var req, url;
        url = topicsUrl(uri);
        req = $.ajax({
          url: url,
          dataType: 'json'
        });
        console.log('query topics ' + url);
        req.fail(function(jqXHR, textStatus, errorThrown) {
          console.log('AJAX Error: ' + textStatus);
          return done(errorThrown);
        });
        return req.done(function(data) {
          var e, t;
          try {
            return done(null, (function() {
              var i, len, ref, results;
              ref = data.items;
              results = [];
              for (i = 0, len = ref.length; i < len; i++) {
                t = ref[i];
                results.push(detachTopic(t));
              }
              return results;
            })());
          } catch (_error) {
            e = _error;
            console.log('Error: detach failed');
            return done(e);
          }
        });
      },
      getTypes: function(done) {
        var req;
        req = $.ajax({
          url: typesUrl,
          dataType: 'json'
        });
        console.log('query topic types ' + typesUrl);
        req.fail(function(jqXHR, textStatus, errorThrown) {
          console.log('AJAX Error: ' + textStatus);
          return done(errorThrown);
        });
        return req.done(function(data) {
          var ctypes, e, t, types;
          try {
            types = (function() {
              var i, len, results;
              results = [];
              for (i = 0, len = data.length; i < len; i++) {
                t = data[i];
                results.push(detachType(t));
              }
              return results;
            })();
            ctypes = clarifyParents(types);
            return done(null, ctypes);
          } catch (_error) {
            e = _error;
            console.log('Error: detach failed');
            return done(e);
          }
        });
      }
    };
  };
});
