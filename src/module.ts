import 'core-js/es7/reflect'; // tslint:disable-line:ordered-imports
import { EncodingErrorFactory } from './factories/encoding-error';
import { InvalidStateErrorFactory } from './factories/invalid-state-error';
import { NotSupportedErrorFactory } from './factories/not-supported-error';
import { OfflineAudioBufferSourceNodeFakerFactory } from './factories/offline-audio-buffer-source-node';
import { OfflineAudioDestinationNodeFakerFactory } from './factories/offline-audio-destination-node';
import { OfflineBiquadFilterNodeFakerFactory } from './factories/offline-biquad-filter-node';
import { OfflineGainNodeFakerFactory } from './factories/offline-gain-node';
import { OfflineIIRFilterNodeFakerFactory } from './factories/offline-iir-filter-node';
import { IIRFilterNodeFaker } from './fakers/iir-filter-node';
import { IAudioContextConstructor } from './interfaces/audio-context';
import { IOfflineAudioContextConstructor } from './interfaces/offline-audio-context';
import { OfflineAudioNodeProxy } from './offline-audio-node';
import { AUDIO_CONTEXT_CONSTRUCTOR_PROVIDER, audioContextConstructor } from './providers/audio-context-constructor';
import { IS_SUPPORTED_PROMISE_PROVIDER, IsSupportedPromise } from './providers/is-supported-promise';
import { MODERNIZR_PROVIDER } from './providers/modernizr';
import { OFFLINE_AUDIO_CONTEXT_CONSTRUCTOR_PROVIDER, offlineAudioContextConstructor } from './providers/offline-audio-context-constructor';
import { UNPATCHED_AUDIO_CONTEXT_CONSTRUCTOR_PROVIDER } from './providers/unpatched-audio-context-constructor';
import { UNPATCHED_OFFLINE_AUDIO_CONTEXT_CONSTRUCTOR_PROVIDER } from './providers/unpatched-offline-audio-context-constructor';
import { WINDOW_PROVIDER } from './providers/window';
import { ChainingSupportTester } from './testers/chaining-support';
import { DecodeAudioDataTypeErrorSupportTester } from './testers/decode-audio-data-type-error-support';
import { DisconnectingSupportTester } from './testers/disconnecting-support';
import { MergingSupportTester } from './testers/merging-support';
import { PromiseSupportTester } from './testers/promise-support';
import { StopStoppedSupportTester } from './testers/stop-stopped-support';
import { AudioBufferWrapper } from './wrappers/audio-buffer';
import { AudioBufferSourceNodeStopMethodWrapper } from './wrappers/audio-buffer-source-node-stop-method';
import { AudioNodeConnectMethodWrapper } from './wrappers/audio-node-connect-method';
import { AudioNodeDisconnectMethodWrapper } from './wrappers/audio-node-disconnect-method';
import { ChannelMergerNodeWrapper } from './wrappers/channel-merger-node';
import { ChannelSplitterNodeWrapper } from './wrappers/channel-splitter-node';
import { IIRFilterNodeGetFrequencyResponseMethodWrapper } from './wrappers/iir-filter-node-get-frequency-response-method';
import { ReflectiveInjector } from '@angular/core';

const injector = ReflectiveInjector.resolveAndCreate([
    AudioBufferSourceNodeStopMethodWrapper,
    AudioBufferWrapper,
    AudioNodeConnectMethodWrapper,
    AudioNodeDisconnectMethodWrapper,
    AUDIO_CONTEXT_CONSTRUCTOR_PROVIDER,
    ChainingSupportTester,
    ChannelMergerNodeWrapper,
    ChannelSplitterNodeWrapper,
    DecodeAudioDataTypeErrorSupportTester,
    DisconnectingSupportTester,
    EncodingErrorFactory,
    IIRFilterNodeFaker,
    IIRFilterNodeGetFrequencyResponseMethodWrapper,
    InvalidStateErrorFactory,
    IS_SUPPORTED_PROMISE_PROVIDER,
    MergingSupportTester,
    MODERNIZR_PROVIDER,
    NotSupportedErrorFactory,
    OfflineAudioBufferSourceNodeFakerFactory,
    OfflineAudioDestinationNodeFakerFactory,
    OfflineAudioNodeProxy,
    OfflineBiquadFilterNodeFakerFactory,
    OfflineGainNodeFakerFactory,
    OfflineIIRFilterNodeFakerFactory,
    OFFLINE_AUDIO_CONTEXT_CONSTRUCTOR_PROVIDER,
    PromiseSupportTester,
    StopStoppedSupportTester,
    UNPATCHED_AUDIO_CONTEXT_CONSTRUCTOR_PROVIDER,
    UNPATCHED_OFFLINE_AUDIO_CONTEXT_CONSTRUCTOR_PROVIDER,
    WINDOW_PROVIDER
]);

// tslint:disable-next-line:variable-name
export const AudioContext: IAudioContextConstructor = injector.get(audioContextConstructor);

export const isSupported: Promise<boolean> = injector.get(IsSupportedPromise);

// tslint:disable-next-line:variable-name
export const OfflineAudioContext: IOfflineAudioContextConstructor = injector.get(offlineAudioContextConstructor);