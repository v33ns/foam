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

  requires: ['foam.ui.md.ChoiceMenuView', 'foam.ui.md.TextFieldView'],

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
    }
  ],

  listeners: [
    {
      name: 'launch',
      code: function() {
        if ( this.opened ) return;

        var self = this;
        // Setting the popup's view id causes it to collide with the DOM element
        // created by the previous iteration, which may still be amnimating out.
        // So don't set the id here:
        var view = this.ChoiceMenuView.create({
          data: this.data,
          choices: this.choices,
          autoSetData: this.autoSetData
        });

        self.opened = true;

        var pos = this.$.getBoundingClientRect();
        view.open(this.index, this.$);
        var s = this.X.window.getComputedStyle(view.$);

        function mouseMove(evt) {
          // Containment is not sufficient.
          // It makes the popup too eager to close since the mouse can start
          // slightly outside the box. We need to check the coordinates, and
          // only close it when it's not upwards and leftwards of the box edges,
          // ie. to pretend the popup reaches the top and right of the window.
          if ( ! view.$ ) {
            remove();
            return;
          }

          if ( view.$.contains(evt.target) ) return;

          var popPos = view.$.getBoundingClientRect();
          var margin = 50;
          var left = popPos.left - margin;
          var right = popPos.right + margin;
          var top = popPos.top - margin;
          var bottom = popPos.bottom + margin;

          if ( (left < evt.clientX && evt.clientX < right) &&
              (top < evt.clientY && evt.clientY < bottom) )
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

      var textView = this.createTemplateView('text', { mode:'read-only' });
      this.addChild(textView);
      out += '<div class="value">'+textView.toHTML()+'</div>';
      out += '<svg class="downArrow" viewBox="0 0 48 48"><g><path d="M15 20 l10 10 10 -10 z"></path></g></svg>';

      this.on('click', this.launch, this.id);

      return out;
    }
  },

  templates: [
    function CSS() {/*
      .popupChoiceView {
        display: flex;
        flex-direction: row;
        align-items: center;
        align-content: flex-start;
        justify-content: space-between;
        padding: 8px;
        margin: 12px;
        cursor: pointer;
        position: relative;
        border-bottom: 1px solid #999;
      }

      .popupChoiceView .downArrow {
        width: 24px;
        height: 24px;
        fill: #999
      }


    */}
  ]
});
