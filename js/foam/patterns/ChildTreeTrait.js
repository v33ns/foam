/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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
  name: 'ChildTreeTrait',
  package: 'foam.patterns',

  properties: [
    {
      name: 'parent',
      type: 'foam.patterns.ChildTreeTrait',
      hidden: true
    },
    {
      name: 'children',
      type: 'Array[foam.patterns.ChildTreeTrait]',
      factory: function() { return []; },
      documentation: function() {/*
        $$DOC{ref:'ChildTreeTrait',usePlural:true} children are arranged in a tree.
      */}
    }
  ],

  methods: {

    onAncestryChange_: function() {
      /* Called when our parent or an ancestor's parent changes. Override to
        react to ancestry changes. Remember to call <code>this.SUPER()</code>. */

      Array.prototype.forEach.call(this.children, function(c) { c.onAncestryChange_ && c.onAncestryChange_() } );
    },

    addChild: function(child) {
      /*
        Maintains the tree structure of $$DOC{ref:'View',usePlural:true}. When
        a sub-$$DOC{ref:'View'} is created, add it to the tree with this method.
      */
      //if (arguments.callee.caller.super_) this.SUPER(child);

      // Check prevents duplicate addChild() calls,
      // which can happen when you use creatView() to create a sub-view (and it calls addChild)
      // and then you write the View using TemplateOutput (which also calls addChild).
      // That should all be cleaned up and all outputHTML() methods should use TemplateOutput.
      if ( this.children.indexOf(child) != -1 ) return;

      try {
        child.parent = this;
      } catch (x) { console.log(x); }
      child.onAncestryChange_ && child.onAncestryChange_();

      var children = this.children;
      children.push(child);
      this.children = children;

      return this;
    },

    removeChild: function(child) {
      /*
        Maintains the tree structure of $$DOC{ref:'View',usePlural:true}. When
        a sub-$$DOC{ref:'View'} is destroyed, remove it from the tree with this method.
      */
      //if (arguments.callee.caller.super_) this.SUPER(child);

      child.destroy();
      this.children.deleteI(child);
      child.parent = undefined;
      child.onAncestryChange_();

      return this;
    },

    removeAllChildren: function() {
      var list = this.children.slice();
      Array.prototype.forEach.call(list, this.removeChild.bind(this));
    },

    addChildren: function() {
      /* Adds multiple children at once. */
      if ( Array.isArray(arguments) ) {
        Array.prototype.forEach.call(arguments, this.addChild.bind(this));
      } else {
        for ( var key in arguments ) this.addChild(arguments[key]);
      }
      return this;
    },

    destroy: function() {
      /* Destroys children and removes them from this. Override to include your own
       cleanup code, but always call this.SUPER() after you are done. */
      //if (arguments.callee.caller.super_) this.SUPER();

      this.removeAllChildren();

      return this;
    },

    construct: function() {
      /* After a destroy(), construct() is called to fill in the object again. If
         any special children need to be re-created, do it here. */

      return this;
    },

    deepPublish: function(topic) {
      /*
       Publish an event and cause all children to publish as well.
       */
      var count = this.publish.apply(this, arguments);

      if ( this.children ) {
        for ( var i = 0 ; i < this.children.length ; i++ ) {
          var child = this.children[i];
          count += child.deepPublish.apply(child, arguments);
        }
      }

      return count;
    }
  }
});
