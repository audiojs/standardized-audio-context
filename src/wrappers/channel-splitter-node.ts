import { InvalidStateErrorFactory } from '../factories/invalid-state-error';
import { Inject, Injectable } from '@angular/core';

@Injectable()
export class ChannelSplitterNodeWrapper {

    constructor (@Inject(InvalidStateErrorFactory) private _invalidStateErrorFactory) { }

    public wrap (channelSplitterNode) {
        channelSplitterNode.channelCountMode = 'explicit';
        channelSplitterNode.channelInterpretation = 'discrete';

        Object.defineProperty(channelSplitterNode, 'channelCountMode', {
            get: () => 'explicit',
            set: () => {
                throw this._invalidStateErrorFactory.create();
            }
        });

        Object.defineProperty(channelSplitterNode, 'channelInterpretation', {
            get: () => 'discrete',
            set: () => {
                throw this._invalidStateErrorFactory.create();
            }
        });

        return channelSplitterNode;
    }

}