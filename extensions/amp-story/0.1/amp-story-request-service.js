/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Services} from '../../../src/services';
import {once} from '../../../src/utils/function';
import {user, userAssert} from '../../../src/log';

/** @private @const {string} */
export const BOOKEND_CONFIG_ATTRIBUTE_NAME = 'bookend-config-src';


/**
 * Service to send XHRs.
 */
export class AmpStoryRequestService {
  /**
   * @param {!Window} win
   * @param {!Element} storyElement
   */
  constructor(win, storyElement) {
    /** @private @const {!Element} */
    this.storyElement_ = storyElement;

    /** @private @const {!../../../src/service/xhr-impl.Xhr} */
    this.xhr_ = Services.xhrFor(win);

    /** @const @type {function():(!Promise<!JsonObject>|!Promise<null>)} */
    this.loadBookendConfig = once(() => this.loadBookendConfigImpl_());
  }

  /**
   * Retrieves the publisher bookend configuration, including the share
   * providers.
   * Has to be called through `loadBookendConfig`.
   * @return {(!Promise<!JsonObject>|!Promise<null>)}
   * @private
   */
  loadBookendConfigImpl_() {
    return this.loadJsonFromAttribute_(BOOKEND_CONFIG_ATTRIBUTE_NAME);
  }

  /**
   * @param {string} attributeName
   * @return {(!Promise<!JsonObject>|!Promise<null>)}
   * @private
   */
  loadJsonFromAttribute_(attributeName) {
    if (!this.storyElement_.hasAttribute(attributeName)) {
      return Promise.resolve(null);
    }

    const rawUrl = this.storyElement_.getAttribute(attributeName);
    const opts = {};
    opts.requireAmpResponseSourceOrigin = false;

    return Services.urlReplacementsForDoc(this.storyElement_)
        .expandUrlAsync(user().assertString(rawUrl))
        .then(url => this.xhr_.fetchJson(url, opts))
        .then(response => {
          userAssert(response.ok, 'Invalid HTTP response');
          return response.json();
        });
  }
}
