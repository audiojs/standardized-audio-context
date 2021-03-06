import { getNativeContext } from '../helpers/get-native-context';
import {
    IAudioBuffer,
    IAudioBufferSourceNode,
    IAudioBufferSourceNodeRenderer,
    IAudioBufferSourceOptions,
    IAudioParam
} from '../interfaces';
import { TAudioBufferSourceNodeConstructorFactory, TContext, TEndedEventHandler, TNativeAudioBufferSourceNode } from '../types';

const DEFAULT_OPTIONS: IAudioBufferSourceOptions = {
    buffer: null,
    channelCount: 2,
    channelCountMode: 'max',
    channelInterpretation: 'speakers',
    detune: 0,
    loop: false,
    loopEnd: 0,
    loopStart: 0,
    playbackRate: 1
};

export const createAudioBufferSourceNodeConstructor: TAudioBufferSourceNodeConstructorFactory = (
    createAudioBufferSourceNodeRenderer,
    createAudioParam,
    createInvalidStateError,
    createNativeAudioBufferSourceNode,
    isNativeOfflineAudioContext,
    noneAudioDestinationNodeConstructor
) => {

    return class AudioBufferSourceNode extends noneAudioDestinationNodeConstructor implements IAudioBufferSourceNode {

        private _audioBufferSourceNodeRenderer: null | IAudioBufferSourceNodeRenderer;

        private _detune: IAudioParam;

        private _isBufferNullified: boolean;

        private _isBufferSet: boolean;

        private _nativeAudioBufferSourceNode: TNativeAudioBufferSourceNode;

        private _playbackRate: IAudioParam;

        constructor (context: TContext, options: Partial<IAudioBufferSourceOptions> = DEFAULT_OPTIONS) {
            const nativeContext = getNativeContext(context);
            const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
            const nativeAudioBufferSourceNode = createNativeAudioBufferSourceNode(nativeContext, mergedOptions);
            const isOffline = isNativeOfflineAudioContext(nativeContext);
            const audioBufferSourceNodeRenderer = (isOffline) ? createAudioBufferSourceNodeRenderer() : null;

            super(context, nativeAudioBufferSourceNode, audioBufferSourceNodeRenderer);

            this._audioBufferSourceNodeRenderer = audioBufferSourceNodeRenderer;
            this._detune = createAudioParam(context, isOffline, nativeAudioBufferSourceNode.detune);
            this._isBufferNullified = false;
            this._isBufferSet = false;
            this._nativeAudioBufferSourceNode = nativeAudioBufferSourceNode;
            // Bug #73: Edge & Safari do not export the correct values for maxValue and minValue.
            this._playbackRate = createAudioParam(
                context,
                isOffline,
                nativeAudioBufferSourceNode.playbackRate,
                3.4028234663852886e38,
                -3.4028234663852886e38
            );
        }

        get buffer (): null | IAudioBuffer {
            if (this._isBufferNullified) {
                return null;
            }

            return this._nativeAudioBufferSourceNode.buffer;
        }

        set buffer (value) {
            // Bug #71: Edge does not allow to set the buffer to null.
            try {
                this._nativeAudioBufferSourceNode.buffer = value;
            } catch (err) {
                if (value !== null || err.code !== 17) {
                    throw err; // tslint:disable-line:rxjs-throw-error
                }

                // @todo Create a new internal nativeAudioBufferSourceNode.
                this._isBufferNullified = (this._nativeAudioBufferSourceNode.buffer !== null);
            }

            // Bug #72: Only Chrome, Edge & Opera do not allow to reassign the buffer yet.
            if (value !== null) {
                if (this._isBufferSet) {
                    throw createInvalidStateError();
                }

                this._isBufferSet = true;
            }
        }

        get onended (): null | TEndedEventHandler {
            return <null | TEndedEventHandler> this._nativeAudioBufferSourceNode.onended;
        }

        set onended (value) {
            this._nativeAudioBufferSourceNode.onended = <TNativeAudioBufferSourceNode['onended']> value;
        }

        get detune (): IAudioParam {
            return this._detune;
        }

        get loop (): boolean {
            return this._nativeAudioBufferSourceNode.loop;
        }

        set loop (value) {
            this._nativeAudioBufferSourceNode.loop = value;
        }

        get loopEnd (): number {
            return this._nativeAudioBufferSourceNode.loopEnd;
        }

        set loopEnd (value) {
            this._nativeAudioBufferSourceNode.loopEnd = value;
        }

        get loopStart (): number {
            return this._nativeAudioBufferSourceNode.loopStart;
        }

        set loopStart (value) {
            this._nativeAudioBufferSourceNode.loopStart = value;
        }

        get playbackRate (): IAudioParam {
            return this._playbackRate;
        }

        public start (when = 0, offset = 0, duration?: number): void {
            this._nativeAudioBufferSourceNode.start(when, offset, duration);

            if (this._audioBufferSourceNodeRenderer !== null) {
                this._audioBufferSourceNodeRenderer.start = (duration === undefined) ? [ when, offset ] : [ when, offset, duration ];
            }
        }

        public stop (when = 0): void {
            this._nativeAudioBufferSourceNode.stop(when);

            if (this._audioBufferSourceNodeRenderer !== null) {
                this._audioBufferSourceNodeRenderer.stop = when;
            }
        }

    };

};
