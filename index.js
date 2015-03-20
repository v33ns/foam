// Read the query parameters and instantiate the model.
(function() {
  var search = /([^&=]+)=?([^&]*)/g;
  var query = window.location.search.substring(1);
  var decode = function(s) {
    return decodeURIComponent(s.replace(/\+/g, ' '));
  };
  var params = {};
  var match;
  while (match = search.exec(query)) {
    params[decode(match[1])] = decode(match[2]);
  }

  var models = [];

  var model = params.model || 'foam.navigator.Controller';

  models.push(arequire(model));
  delete params.model;

  var viewName = params.view;
  if ( viewName ) {
    models.push(arequire(viewName));
    delete params.view;
  }

  models.push(arequire('foam.ui.View'));

  var showActions = params.showActions;
  if ( showActions ) {
    showActions = showActions.equalsIC('y')    ||
                  showActions.equalsIC('yes')  ||
                  showActions.equalsIC('true') ||
                  showActions.equalsIC('t');
  } else {
    showActions = true;
  }
  delete params.showActions;

  for ( var key in params ) {
    if ( key.startsWith('p:') ) {
      params[key.substring(2)] = params[key];
      delete params[key];
    }
  }

  apar.apply(null, models).aseq(
    function() {
      var obj = X.lookup(model).create(params);
      var view;
      if ( viewName ) {
        view = X.lookup(viewName).create({ data: obj });
        // 'CView' refers to old CView
        // TODO(kgr): remove this check when CView's converted to foam.graphics.CView
      } else if (  ( X.lookup('foam.ui.View').isInstance(obj) )
                   || ( 'CView' in GLOBAL && CView.isInstance(obj) ) ) {
        view = obj;
      } else if ( obj.toView_ ) {
        view = obj.toView_();
      } else {
        arequire('foam.ui.DetailView')(function(m) {
          view = m.create({ data: obj, showActions: showActions });
          document.body.insertAdjacentHTML('beforeend', view.toHTML());
          view.initHTML();
        });
        return;
      }
      document.body.insertAdjacentHTML('beforeend', view.toHTML());
      view.initHTML();
    })();
})();