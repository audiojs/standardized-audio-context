import { IAudioWorkletProcessorConstructor } from '../interfaces';

export type TEvaluateAudioWorkletGlobalScopeFunction = (
    AudioWorkletProcessor: Object, // tslint:disable-line:variable-name
    currentFrame: number,
    currentTime: number,
    global: undefined,
    registerProcessor: <T extends IAudioWorkletProcessorConstructor> (name: string, processorCtor: T) => void,
    sampleRate: number,
    self: undefined,
    window: undefined
) => void;
