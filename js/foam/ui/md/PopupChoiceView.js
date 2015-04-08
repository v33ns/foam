/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


CLASS({
  name: 'PopupChoiceView',
  package: 'foam.ui.md',

  extendsModel: 'foam.ui.AbstractChoiceView',

  requires: ['foam.ui.ChoiceListView'],

  traits: ['foam.input.touch.VerticalScrollNativeTrait'],

  documentation: function() {/* This is very closely related to
     $$DOC{ref:'foam.ui.PopupChoiceView'}. Refactor them! */},
  properties: [
    {
      name: 'linkLabel'
    },
    {
      name: 'iconUrl'
    },
    {
      name: 'tagName',
      defaultValue: 'span'
    },
    {
      name: 'className',
      defaultValue: 'popupChoiceView'
    },
    {
      model_: 'BooleanProperty',
      name: 'showValue'
    },
    {
      model_: 'BooleanProperty',
      name: 'opened',
      transient: true
    },
    {
      model_: 'FunctionProperty',
      name: 'updateListener'
    },
    {
      name: 'mode',
      defaultValue: 'read-write'
    },
    {
      name: 'scrollerID',
      factory: function() {
        return this.id + '-popup-list-scroller';
      }
    }
  ],

  actions: [
    {
      name: 'open',
      labelFn: function() { return this.linkLabel; },
      action: function() {
        if ( this.opened ) return;

        var self = this;
        var view = this.ChoiceListView.create({
          id: this.scrollerID,
          className: 'popupChoiceList',
          data: this.data,
          choices: this.choices,
          autoSetData: this.autoSetData
        });

        self.opened = true;

        // Positioning notes:
        // we find our page position, which is equivalent to our desired
        // position relative to the document body for our menu. We can then grab
        // the body's client bounding rect to find our final relative position.
        var pos = this.rectOnPage(this.$.querySelector('.action'));
        var menuHeight = Math.min(200, this.choices.length * pos.height);
        var vp = this.viewportOnPage();
        // clamp menu to viewport
        if ( pos.top + menuHeight > vp.bottom ) {
          pos.top -= ((pos.top + menuHeight) - vp.bottom);
        }
        if ( pos.top < vp.top ) {
          pos.top += (vp.top - pos.top);
        }

        var s = this.X.window.getComputedStyle(view.$);

        function mouseMove(evt) {
          // Containment is not sufficient.
          // It makes the popup too eager to close since the mouse can start
          // slightly outside the box. We need to check the coordinates, and
          // only close it when it's not upwards and leftwards of the box edges,
          // ie. to pretend the popup reaches the top and right of the window.
          if ( view.$.contains(evt.target) ) return;

          var margin = 50;
          var left = view.$.offsetLeft - margin;
          var right = view.$.offsetWidth + left + 2*margin;
          var top = view.$.offsetTop - margin;
          var bottom = view.$.offsetHeight + top + 2*margin;

          if ( (left < evt.pageX && evt.pageX < right) &&
              (top < evt.pageY && evt.pageY < bottom) )
            return;

          remove();
        }

        var removeListener;
        function remove() {
          self.opened = false;
          self.X.document.removeEventListener('touchstart', removeListener);
          self.X.document.removeEventListener('mousemove',  mouseMove);
          view.close();
        }
        removeListener = function(evt) {
          if (view && view.$ && view.$.contains(evt.target)) return;
          remove();
        };

        // I don't know why the 'animate' is required, but it sometimes
        // doesn't remove the view without it.
        view.data$.addListener(EventService.framed(function() {
          self.data = view.data;
          remove();
        }, this.X));

        view.$.style.top = (pos.top-2) + 'px';
        var left = Math.max(0, pos.left - toNum(s.width) + 30);
        view.$.style.left = left + 'px';
        view.$.style.maxHeight = (Math.max(200, this.X.window.innerHeight-pos.top-10)) + 'px';
        view.$.style.height = menuHeight;
        view.initHTML();

        this.X.document.addEventListener('touchstart',  removeListener);
        this.X.document.addEventListener('mousemove',   mouseMove);
      }
    }
  ],

  methods: {
    toHTML: function() {
      if ( this.mode === 'read-only' ) {
        return '<span id="' + this.id + '" class="popupChoiceView-readonly">' +
            ((this.choice && this.choice[1]) || '') + '</span>';
      }
      return this.SUPER();
    },
    toInnerHTML: function() {
      if ( this.mode === 'read-only' ) {
        return (this.choice && this.choice[1]) || '';
      }
      var out = '';

      if ( this.showValue ) {
        var id = this.nextID();
        out += '<span id="' + id + '" class="value">' + ((this.choice && this.choice[1]) || '') + '</span>';

        // Remove any previous data$ listener for this popup.
        if ( this.updateListener ) this.data$.removeListener(this.updateListener);
        this.updateListener = function() {
          var e = this.X.$(id);
          if ( e ) e.innerHTML = this.choice[1];
        }.bind(this);
        this.data$.addListener(this.updateListener);
      }

      out += '<span class="action">';
      var action = this.model_.getAction('open');
      action.iconUrl = this.iconUrl;
      var button = this.createActionView(action).toView_();

      this.addSelfDataChild(button);

      out += button.toHTML();
      out += '</span>';

      return out;
    }
  },

  templates: [
    function CSS() {/*
      .popupChoiceList {
        border: 2px solid grey;
        background: white;
        display: table-footer-group;
        overflow-y: auto;
        position: absolute;
        top: 20;
        left: 50;
        margin: 0;
      }

      .popupChoiceList li {
        display: block;
        margin: 15px;
        margin-left: -20px;
      }
    */}
  ]
});