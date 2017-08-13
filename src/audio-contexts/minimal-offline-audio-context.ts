import 'core-js/es7/reflect'; // tslint:disable-line:ordered-imports
import { ReflectiveInjector } from '@angular/core';
import { startRendering } from '../helpers/start-rendering';
import { IMinimalOfflineAudioContext, IOfflineAudioContextOptions } from '../interfaces';
import {
    UNPATCHED_OFFLINE_AUDIO_CONTEXT_CONSTRUCTOR_PROVIDER,
    unpatchedOfflineAudioContextConstructor as nptchdFflnDCntxtCnstrctr
} from '../providers/unpatched-offline-audio-context-constructor';
import { WINDOW_PROVIDER } from '../providers/window';
import { TUnpatchedOfflineAudioContext } from '../types';
import { MinimalBaseAudioContext } from './minimal-base-audio-context';

const DEFAULT_OPTIONS = {
    numberOfChannels: 1
};

const injector = ReflectiveInjector.resolveAndCreate([
    UNPATCHED_OFFLINE_AUDIO_CONTEXT_CONSTRUCTOR_PROVIDER,
    WINDOW_PROVIDER
]);

const unpatchedOfflineAudioContextConstructor = injector.get(nptchdFflnDCntxtCnstrctr);

export class MinimalOfflineAudioContext extends MinimalBaseAudioContext implements IMinimalOfflineAudioContext {

    private _length: number;

    private _unpatchedOfflineAudioContext: TUnpatchedOfflineAudioContext;

    constructor (options: IOfflineAudioContextOptions) {
        const { length, numberOfChannels, sampleRate } = <typeof DEFAULT_OPTIONS & IOfflineAudioContextOptions> {
            ...DEFAULT_OPTIONS,
            ...options
        };

        const unpatchedOfflineAudioContext = new unpatchedOfflineAudioContextConstructor(numberOfChannels, length, sampleRate);

        super(unpatchedOfflineAudioContext, numberOfChannels);

        this._length = length;
        this._unpatchedOfflineAudioContext = unpatchedOfflineAudioContext;
    }

    public get length (): number {
        // Bug #17: Safari does not yet expose the length.
        if (this._unpatchedOfflineAudioContext.length === undefined) {
            return this._length;
        }

        return this._unpatchedOfflineAudioContext.length;
    }

    public startRendering () {
        return startRendering(this.destination, this._unpatchedOfflineAudioContext);
    }

}