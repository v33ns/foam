/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

CLASS({
  name: 'QueueView',
  package: 'foam.ui',
  extendsModel: 'foam.ui.SlidingCollectionView',

  methods: {
    pushView: function(view) { return this.pushView_(view); }
  }
});
