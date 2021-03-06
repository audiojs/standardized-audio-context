import { getNativeAudioNode } from '../helpers/get-native-audio-node';
import { isOwnedByContext } from '../helpers/is-owned-by-context';
import { renderInputsOfAudioNode } from '../helpers/render-inputs-of-audio-node';
import { IConvolverNode, IConvolverOptions, INativeConvolverNodeFaker } from '../interfaces';
import { TConvolverNodeRendererFactoryFactory, TNativeConvolverNode, TNativeOfflineAudioContext } from '../types';

export const createConvolverNodeRendererFactory: TConvolverNodeRendererFactoryFactory = (createNativeConvolverNode) => {
    return () => {
        let nativeConvolverNode: null | TNativeConvolverNode = null;

        return {
            render: async (proxy: IConvolverNode, nativeOfflineAudioContext: TNativeOfflineAudioContext): Promise<TNativeConvolverNode> => {
                if (nativeConvolverNode !== null) {
                    return nativeConvolverNode;
                }

                nativeConvolverNode = getNativeAudioNode<TNativeConvolverNode>(proxy);

                /*
                 * If the initially used nativeConvolverNode was not constructed on the same OfflineAudioContext it needs to be created
                 * again.
                 */
                if (!isOwnedByContext(nativeConvolverNode, nativeOfflineAudioContext)) {
                    const options: IConvolverOptions = {
                        buffer: nativeConvolverNode.buffer,
                        channelCount: nativeConvolverNode.channelCount,
                        channelCountMode: nativeConvolverNode.channelCountMode,
                        channelInterpretation: nativeConvolverNode.channelInterpretation,
                        disableNormalization: !nativeConvolverNode.normalize
                    };

                    nativeConvolverNode = createNativeConvolverNode(nativeOfflineAudioContext, options);
                }

                if ((<INativeConvolverNodeFaker> nativeConvolverNode).inputs !== undefined) {
                    await renderInputsOfAudioNode(
                        proxy,
                        nativeOfflineAudioContext,
                        (<INativeConvolverNodeFaker> nativeConvolverNode).inputs[0]
                    );
                } else {
                    await renderInputsOfAudioNode(proxy, nativeOfflineAudioContext, nativeConvolverNode);
                }

                return nativeConvolverNode;
            }
        };
    };
};
