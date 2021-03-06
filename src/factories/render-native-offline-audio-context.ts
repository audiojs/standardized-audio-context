import { cacheTestResult } from '../helpers/cache-test-result';
import { IOfflineAudioCompletionEvent } from '../interfaces';
import { testPromiseSupport } from '../support-testers/promise';
import { TNativeAudioBuffer, TRenderNativeOfflineAudioContextFactory } from '../types';

export const createRenderNativeOfflineAudioContext: TRenderNativeOfflineAudioContextFactory = (createNativeGainNode) => {
    return (nativeOfflineAudioContext) => {
        // Bug #21: Safari does not support promises yet.
        if (cacheTestResult(testPromiseSupport, () => testPromiseSupport(nativeOfflineAudioContext))) {
            return nativeOfflineAudioContext.startRendering();
        }

        return new Promise<TNativeAudioBuffer>((resolve) => {
            // Bug #48: Safari does not render an OfflineAudioContext without any connected node.
            const gainNode = createNativeGainNode(nativeOfflineAudioContext, {
                channelCount: 1,
                channelCountMode: 'explicit',
                channelInterpretation: 'discrete',
                gain: 0
            });

            nativeOfflineAudioContext.oncomplete = (event: IOfflineAudioCompletionEvent) => {
                gainNode.disconnect();

                resolve(event.renderedBuffer);
            };

            gainNode.connect(nativeOfflineAudioContext.destination);

            nativeOfflineAudioContext.startRendering();
        });
    };
};
