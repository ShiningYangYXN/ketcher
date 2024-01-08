/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import { useDispatch } from 'react-redux';
import { indigoVerification } from '../script/ui/state/request';
import { Ketcher, KetcherAsyncEvents } from 'ketcher-core';
import { useEffect } from 'react';
import { useAppContext } from './useAppContext';
import { KETCHER_INIT_EVENT_NAME } from '../constants';

export const useSubscriptionOnEvents = (events) => {
  const dispatch = useDispatch();

  const { getKetcherInstance } = useAppContext();

  const loadingHandler = () => {
    dispatch(indigoVerification(true));
  };
  const actionResultHandler = () => {
    dispatch(indigoVerification(false));
  };

  const subscribe = (ketcher: Ketcher) => {
    ketcher.eventBus.addListener(KetcherAsyncEvents.LOADING, loadingHandler);
    ketcher.eventBus.addListener(
      KetcherAsyncEvents.SUCCESS,
      actionResultHandler,
    );
    ketcher.eventBus.addListener(
      KetcherAsyncEvents.FAILURE,
      actionResultHandler,
    );
    events.forEach(({ type, handler }) => {
      ketcher.eventBus.addListener(type, handler);
    });
  };

  const unsubscribe = (ketcher: Ketcher) => {
    ketcher.eventBus.removeListener(KetcherAsyncEvents.LOADING, loadingHandler);
    ketcher.eventBus.removeListener(
      KetcherAsyncEvents.SUCCESS,
      actionResultHandler,
    );
    ketcher.eventBus.removeListener(
      KetcherAsyncEvents.FAILURE,
      actionResultHandler,
    );
    events.forEach(({ type, handler }) => {
      ketcher.eventBus.removeListener(type, handler);
    });
  };

  useEffect(() => {
    const subscribeOnInit = () => {
      subscribe(getKetcherInstance());
    };

    const unsubscribeOnUnMount = () => {
      unsubscribe(getKetcherInstance());
    };

    const globalErrorHandler = (errorEvent) => {
      const error = errorEvent.error;
      const message =
        error && error.message
          ? 'An error occurred: ' + error.message
          : 'Something went wrong. The error is on our side. Please try again later.';
      return message;
    };

    window.addEventListener(KETCHER_INIT_EVENT_NAME, subscribeOnInit);
    window.addEventListener('error', globalErrorHandler);

    return () => {
      unsubscribeOnUnMount();
      window.removeEventListener(KETCHER_INIT_EVENT_NAME, subscribeOnInit);
      window.removeEventListener('error', globalErrorHandler);
    };
  }, [events]);
};
