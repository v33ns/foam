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
  name: 'FOAMlet',
  package: 'foam.navigator',

  tableProperties: [
    'iconURL',
    'type',
    'name',
    'labels',
    'lastModified'
  ],

  properties: [
    {
      name: 'id',
      mode: 'read-only',
      hidden: true
    },
    {
      name: 'type',
      tableWidth: 80,
    },
    {
      name: 'model',
      type: 'Model',
      hidden: true
    },
    {
      name: 'name',
      model_: 'StringProperty'
    },
    {
      name: 'iconURL',
      model_: 'StringProperty',
      label: 'Icon',
      tableLabel: 'Icon',
      tableWidth: 30,
      todo: multiline(function() {/*
        Add support for (1) rendering icons, and (2) icon import (upload, etc.)
      */})
    },
    {
      name: 'lastModified',
      model_: 'DateTimeProperty',
      tableWidth: 100,
    },
    {
      name: 'labels',
      model_: 'StringArrayProperty',
      factory: function() { return []; }
    }
  ]
});