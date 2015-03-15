define(['knockout', 'knockmap'], function(ko) {
  var getUniqDataTypes, sortComposite, sortTopicsByType, sortTopicsByValue, sortTypesByName, sortTypesByUri;
  sortTypesByName = function(l, r) {
    return l.name.localeCompare(r.name);
  };
  sortTypesByUri = function(l, r) {
    return l.uri.localeCompare(r.uri);
  };
  sortTopicsByValue = function(l, r) {
    return String(l.value()).localeCompare(String(r.value()));
  };
  sortTopicsByType = function(l, r) {
    var ref;
    return (ref = l.type) != null ? ref.localeCompare(r.type) : void 0;
  };
  sortComposite = function(composite) {
    var c, i, len, ref, results;
    if ((composite != null ? composite.length : void 0) > 0) {
      ref = composite.sort(sortTopicsByType);
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        c = ref[i];
        results.push(sortComposite(c.composite));
      }
      return results;
    }
  };
  getUniqDataTypes = function(types) {
    var count, dataType, dataTypes, detach, i, len, ref, results, type;
    dataTypes = {};
    for (i = 0, len = types.length; i < len; i++) {
      type = types[i];
      count = (ref = dataTypes[type.dataType]) != null ? ref : 0;
      dataTypes[type.dataType] = count + 1;
    }
    detach = function(dataType, count) {
      return {
        count: count,
        uri: dataType
      };
    };
    results = [];
    for (dataType in dataTypes) {
      count = dataTypes[dataType];
      results.push(detach(dataType, count));
    }
    return results;
  };
  return function() {
    var activateAll, addType, checkIsChildVisible, dataType, dataTypes, explodeHeaders, getActiveChildDepths, headers, linkReleatedTypes, mapTopic, topics, type, types, typesByUri, updateActivation, updateDepth, updateRowSpan;
    type = ko.observable();
    types = ko.observableArray([]);
    typesByUri = {};
    dataType = ko.observable();
    dataTypes = ko.observableArray([]);
    topics = ko.observableArray([]);
    headers = ko.observableArray([]);
    mapTopic = function(values) {
      console.log('add topic: ' + values.id);
      sortComposite(values.composite);
      return ko.mapping.fromJS(values);
    };
    getActiveChildDepths = function(childTypes) {
      var child, depths, i, len;
      depths = [];
      for (i = 0, len = childTypes.length; i < len; i++) {
        child = childTypes[i];
        if (child.isActive()) {
          depths.push(child.depth());
        }
      }
      return depths;
    };
    updateDepth = function(child) {
      var d, ds, ref;
      ds = getActiveChildDepths(child.childTypes);
      console.log('update active child depths');
      console.log(ds);
      d = (ref = ds.sort().pop()) != null ? ref : -1;
      return child.depth(d + 1);
    };
    updateActivation = function(child, count, activate) {
      var i, len, parent, ref, results;
      console.log('update parents of type: ' + child.name);
      updateDepth(child);
      ref = child.parentTypes;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        parent = ref[i];
        if (activate) {
          parent.cols(parent.cols() + count);
        } else {
          parent.cols(parent.cols() - count);
        }
        if (parent.isActive()) {
          results.push(updateActivation(parent, count, activate));
        } else {
          results.push(updateDepth(parent));
        }
      }
      return results;
    };
    updateRowSpan = function(parent, depth) {
      var child, i, len, ref, results;
      console.log('update row span count of ' + parent.uri + ' with depth = ' + depth);
      ref = parent.childTypes;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        child = ref[i];
        if (child.childTypes.length === 0) {
          console.log('update last leaf: ' + child.uri + ' > ' + depth);
          results.push(child.rows(depth));
        } else {
          results.push(updateRowSpan(child, depth - 1));
        }
      }
      return results;
    };
    addType = function(values) {
      values.isInMenu = ko.observable(true);
      values.rows = ko.observable(1);
      values.cols = ko.observable(0);
      values.depth = ko.observable(0);
      values.isActive = ko.observable(false);
      values.isActive.subscribe(function(active) {
        console.log('initial update type parents of ' + values.name);
        if (values.childTypes.length === 0) {
          updateActivation(values, 1, values.isActive());
        } else {
          updateActivation(values, values.cols(), values.isActive());
        }
        return updateRowSpan(type(), type().depth());
      });
      typesByUri[values.uri] = values;
      return types.push(values);
    };
    linkReleatedTypes = function(values) {
      var c, p;
      values.childTypes = ((function() {
        var i, len, ref, results;
        ref = values.childTypes;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          c = ref[i];
          results.push(typesByUri[c]);
        }
        return results;
      })()).sort(sortTypesByUri);
      return values.parentTypes = ((function() {
        var i, len, ref, results;
        ref = values.parentTypes;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          p = ref[i];
          results.push(typesByUri[p]);
        }
        return results;
      })()).sort(sortTypesByName);
    };
    checkIsChildVisible = function(child, parent, isParentVisible) {
      return ko.computed(function() {
        var active;
        active = isParentVisible() && child.isActive();
        console.log('check header activation ' + child.uri + ' is ' + active);
        console.log('parent ' + parent.uri + ' isVisible = ' + isParentVisible());
        console.log('child ' + child.uri + ' isActive = ' + child.isActive());
        return active;
      });
    };
    explodeHeaders = function(parent, depth, isParentVisible) {
      var child, i, isChildVisible, len, ref, results;
      if (depth == null) {
        depth = 0;
      }
      if (isParentVisible == null) {
        isParentVisible = function() {
          return true;
        };
      }
      console.log('explode header of ' + parent.uri);
      if (!headers()[depth]) {
        headers.push(ko.observableArray([]));
      }
      ref = parent.childTypes;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        child = ref[i];
        console.log('explode header, child ' + child.uri);
        isChildVisible = checkIsChildVisible(child, parent, isParentVisible);
        headers()[depth].push(ko.observable({
          type: child,
          rows: child.rows,
          cols: child.cols,
          isVisible: isChildVisible
        }));
        results.push(explodeHeaders(child, depth + 1, isChildVisible));
      }
      return results;
    };
    activateAll = function(parent) {
      var child, i, len, ref, results;
      ref = parent.childTypes;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        child = ref[i];
        child.isActive(true);
        results.push(activateAll(child));
      }
      return results;
    };
    return {
      getDataType: dataType,
      getDataTypes: dataTypes,
      getHeaderRows: headers,
      getTopics: topics,
      getType: type,
      getTypes: types,
      isTypeActiveValue: function(typeUri) {
        var t;
        console.log('is type active value ' + typeUri());
        t = typesByUri[typeUri()];
        return t && t.isActive() && t.childTypes.length === 0;
      },
      setDataType: function(dt) {
        return dataType(dt);
      },
      setDataTypes: function(list) {
        var d, i, len;
        console.log('update data types');
        dataTypes.removeAll();
        for (i = 0, len = list.length; i < len; i++) {
          d = list[i];
          dataTypes.push(d);
        }
        return dataTypes.sort(sortTypesByName);
      },
      setTopics: function(list) {
        var i, len, t;
        console.log('update topics');
        topics.removeAll();
        for (i = 0, len = list.length; i < len; i++) {
          t = list[i];
          topics.push(mapTopic(t));
        }
        return topics.sort(sortTopicsByValue);
      },
      setType: function(t) {
        var typeHeader;
        headers.removeAll();
        typeHeader = {
          type: t,
          cols: 1,
          rows: t.depth,
          isVisible: function() {
            return true;
          }
        };
        console.log('typeHeader');
        console.log(typeHeader);
        headers.push(ko.observableArray([typeHeader]));
        type(t);
        return explodeHeaders(t);
      },
      setTypes: function(list) {
        var i, j, len, len1, t;
        console.log('update types');
        types.removeAll();
        typesByUri = {};
        for (i = 0, len = list.length; i < len; i++) {
          t = list[i];
          addType(t);
        }
        for (j = 0, len1 = list.length; j < len1; j++) {
          t = list[j];
          linkReleatedTypes(t);
        }
        return types.sort(sortTypesByName);
      }
    };
  };
});
