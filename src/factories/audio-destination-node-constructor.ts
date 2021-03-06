import { AUDIO_GRAPHS } from '../globals';
import { getNativeContext } from '../helpers/get-native-context';
import { IAudioDestinationNode } from '../interfaces';
import { TAudioDestinationNodeConstructorFactory, TChannelCountMode, TContext, TNativeAudioDestinationNode } from '../types';

export const createAudioDestinationNodeConstructor: TAudioDestinationNodeConstructorFactory = (
    audioNodeConstructor,
    createAudioDestinationNodeRenderer,
    createIndexSizeError,
    createInvalidStateError,
    createNativeAudioDestinationNode,
    isNativeOfflineAudioContext
) => {

    return class AudioDestinationNode extends audioNodeConstructor implements IAudioDestinationNode {

        private _isNodeOfNativeOfflineAudioContext: boolean;

        private _nativeAudioDestinationNode: TNativeAudioDestinationNode;

        constructor (context: TContext, channelCount: number) {
            const nativeContext = getNativeContext(context);
            const isOffline = isNativeOfflineAudioContext(nativeContext);
            const nativeAudioDestinationNode = createNativeAudioDestinationNode(nativeContext, channelCount, isOffline);
            const audioDestinationNodeRenderer = (isOffline) ? createAudioDestinationNodeRenderer() : null;

            const audioGraph = { audioWorkletGlobalScope: null, nodes: new WeakMap(), params: new WeakMap() };

            AUDIO_GRAPHS.set(context, audioGraph);
            AUDIO_GRAPHS.set(nativeContext, audioGraph);

            super(context, nativeAudioDestinationNode, audioDestinationNodeRenderer);

            this._isNodeOfNativeOfflineAudioContext = isOffline;
            this._nativeAudioDestinationNode = nativeAudioDestinationNode;
        }

        get channelCount (): number {
            return this._nativeAudioDestinationNode.channelCount;
        }

        set channelCount (value) {
            // Bug #52: Chrome, Edge, Opera & Safari do not throw an exception at all.
            // Bug #54: Firefox does throw an IndexSizeError.
            if (this._isNodeOfNativeOfflineAudioContext) {
                throw createInvalidStateError();
            }

            // Bug #47: The AudioDestinationNode in Edge and Safari do not initialize the maxChannelCount property correctly.
            if (value > this._nativeAudioDestinationNode.maxChannelCount) {
                throw createIndexSizeError();
            }

            this._nativeAudioDestinationNode.channelCount = value;
        }

        get channelCountMode (): TChannelCountMode {
            return this._nativeAudioDestinationNode.channelCountMode;
        }

        set channelCountMode (value) {
            // Bug #53: No browser does throw an exception yet.
            if (this._isNodeOfNativeOfflineAudioContext) {
                throw createInvalidStateError();
            }

            this._nativeAudioDestinationNode.channelCountMode = value;
        }

        get maxChannelCount (): number {
            return this._nativeAudioDestinationNode.maxChannelCount;
        }

    };

};
