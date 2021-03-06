import { spy, stub } from 'sinon';
import { loadFixture } from '../../helper/load-fixture';

describe('offlineAudioContextConstructor', () => {

    let offlineAudioContext;

    beforeEach(() => {
        offlineAudioContext = new webkitOfflineAudioContext(1, 25600, 44100); // eslint-disable-line new-cap, no-undef
    });

    it('should not provide an unprefixed constructor', () => {
        expect(window.OfflineAudioContext).to.be.undefined;
    });

    describe('constructor()', () => {

        // bug #46

        it('should throw a TypeError', () => {
            expect(() => {
                new webkitOfflineAudioContext({ length: 1, numberOfChannels: 1, sampleRate: 44100 }); // eslint-disable-line new-cap, no-undef
            }).to.throw(TypeError);
        });

    });

    describe('audioWorklet', () => {

        // bug #59

        it('should not be implemented', () => {
            expect(offlineAudioContext.audioWorklet).to.be.undefined;
        });

    });

    describe('destination', () => {

        // bug #52

        it('should allow to change the value of the channelCount property', () => {
            offlineAudioContext.destination.channelCount = 2;
        });

        // bug #53

        it('should allow to change the value of the channelCountMode property', () => {
            offlineAudioContext.destination.channelCountMode = 'explicit';
        });

        // bug #83

        it('should have a channelCountMode of max', () => {
            expect(offlineAudioContext.destination.channelCountMode).to.equal('max');
        });

        // bug #47

        it('should not have a maxChannelCount property', () => {
            expect(offlineAudioContext.destination.maxChannelCount).to.equal(0);
        });

    });

    describe('length', () => {

        // bug #17

        it('should not expose its length', () => {
            expect(offlineAudioContext.length).to.be.undefined;
        });

    });

    describe('oncomplete', () => {

        // bug #48

        it('should not fire without any connected node', (done) => {
            offlineAudioContext.oncomplete = spy();

            offlineAudioContext.startRendering();

            // Wait a second to be sure oncomplete was not called.
            setTimeout(() => {
                expect(offlineAudioContext.oncomplete).to.have.not.been.called;

                done();
            }, 1000);
        });

    });

    describe('onstatechange', () => {

        // bug #49

        it('should transition directly from suspended to closed', (done) => {
            const runTest = (callback) => {
                offlineAudioContext = new webkitOfflineAudioContext(1, 1, 44100); // eslint-disable-line new-cap, no-undef

                let previousState = offlineAudioContext.state;

                offlineAudioContext.onstatechange = () => {
                    const currentState = offlineAudioContext.state;

                    if (currentState === 'closed') {
                        offlineAudioContext.onstatechange = null;

                        callback(previousState === 'suspended');
                    }

                    previousState = currentState;
                };

                // Bug #48: Connect a GainNode to make sure the rendering succeeds.
                offlineAudioContext
                    .createGain()
                    .connect(offlineAudioContext.destination);

                offlineAudioContext.startRendering();
            };
            const callback = (hasTransitionedDirectlyFromSuspendedToClosed) => {
                if (hasTransitionedDirectlyFromSuspendedToClosed) {
                    done();
                } else {
                    runTest(callback);
                }
            };

            runTest(callback);
        });

    });

    describe('createAnalyser()', () => {

        // bug #11

        it('should not be chainable', () => {
            const analyserNode = offlineAudioContext.createAnalyser(),
                gainNode = offlineAudioContext.createGain();

            expect(analyserNode.connect(gainNode)).to.be.undefined;
        });

    });

    describe('createBiquadFilter()', () => {

        let biquadFilterNode;

        beforeEach(() => {
            biquadFilterNode = offlineAudioContext.createBiquadFilter();
        });

        // bug #11

        it('should not be chainable', () => {
            const gainNode = offlineAudioContext.createGain();

            expect(biquadFilterNode.connect(gainNode)).to.be.undefined;
        });

        describe('detune', () => {

            describe('automationRate', () => {

                // bug #84

                it('should not be implemented', () => {
                    expect(biquadFilterNode.detune.automationRate).to.be.undefined;
                });

            });

        });

        describe('getFrequencyResponse()', () => {

            // bug #22

            it('should fill the magResponse and phaseResponse arrays with the deprecated algorithm', () => {
                const magResponse = new Float32Array(5);
                const phaseResponse = new Float32Array(5);

                biquadFilterNode.getFrequencyResponse(new Float32Array([ 200, 400, 800, 1600, 3200 ]), magResponse, phaseResponse);

                expect(Array.from(magResponse)).to.deep.equal([ 1.1107852458953857, 0.8106917142868042, 0.20565471053123474, 0.04845593497157097, 0.011615658178925514 ]);
                expect(Array.from(phaseResponse)).to.deep.equal([ -0.7254799008369446, -1.8217267990112305, -2.6273605823516846, -2.906902313232422, -3.0283825397491455 ]);
            });

            // bug #68

            it('should throw no error', () => {
                biquadFilterNode.getFrequencyResponse(new Float32Array(), new Float32Array(1), new Float32Array(1));
            });

        });

    });

    describe('createBufferSource()', () => {

        // bug #11

        it('should not be chainable', () => {
            const audioBufferSourceNode = offlineAudioContext.createBufferSource();
            const gainNode = offlineAudioContext.createGain();

            expect(audioBufferSourceNode.connect(gainNode)).to.be.undefined;
        });

        // bug #14

        it('should not resample an oversampled AudioBuffer', (done) => {
            const audioBuffer = offlineAudioContext.createBuffer(1, 8, 88200);
            const audioBufferSourceNode = offlineAudioContext.createBufferSource();
            const eightRandomValues = [];

            for (let i = 0; i < 8; i += 1) {
                eightRandomValues[i] = (Math.random() * 2) - 1;

                // Bug #5: Safari does not support copyFromChannel().
                audioBuffer.getChannelData(0)[i] = eightRandomValues[i];
            }

            audioBufferSourceNode.buffer = audioBuffer;
            audioBufferSourceNode.start(0);
            audioBufferSourceNode.connect(offlineAudioContext.destination);

            offlineAudioContext.oncomplete = (event) => {
                // Bug #5: Safari does not support copyFromChannel().
                const channelData = event.renderedBuffer.getChannelData(0);

                expect(channelData[0]).to.closeTo(eightRandomValues[0], 0.0000001);
                expect(channelData[1]).to.closeTo(eightRandomValues[2], 0.0000001);
                expect(channelData[2]).to.closeTo(eightRandomValues[4], 0.0000001);
                expect(channelData[3]).to.closeTo(eightRandomValues[6], 0.0000001);

                done();
            };
            offlineAudioContext.startRendering();
        });

        // bug #18

        it('should not allow calls to stop() of an AudioBufferSourceNode scheduled for stopping', () => {
            const audioBuffer = offlineAudioContext.createBuffer(1, 100, 44100);
            const audioBufferSourceNode = offlineAudioContext.createBufferSource();

            audioBufferSourceNode.buffer = audioBuffer;
            audioBufferSourceNode.connect(offlineAudioContext.destination);
            audioBufferSourceNode.start();
            audioBufferSourceNode.stop(1);
            expect(() => {
                audioBufferSourceNode.stop();
            }).to.throw(Error);
        });

        // bug #19

        it('should not ignore calls to stop() of an already stopped AudioBufferSourceNode', (done) => {
            const audioBuffer = offlineAudioContext.createBuffer(1, 100, 44100);
            const audioBufferSourceNode = offlineAudioContext.createBufferSource();

            audioBufferSourceNode.onended = () => {
                expect(() => {
                    audioBufferSourceNode.stop();
                }).to.throw(Error);

                done();
            };

            audioBufferSourceNode.buffer = audioBuffer;
            audioBufferSourceNode.connect(offlineAudioContext.destination);
            audioBufferSourceNode.start();
            audioBufferSourceNode.stop();

            offlineAudioContext.startRendering();
        });

        describe('buffer', () => {

            // bug #72

            it('should allow to assign the buffer multiple times', () => {
                const audioBufferSourceNode = offlineAudioContext.createBufferSource();

                audioBufferSourceNode.buffer = offlineAudioContext.createBuffer(2, 100, 44100);
                audioBufferSourceNode.buffer = offlineAudioContext.createBuffer(2, 100, 44100);
            });

            // bug #95

            it('should not play a buffer with only one sample', (done) => {
                const audioBuffer = offlineAudioContext.createBuffer(1, 1, 44100);
                const audioBufferSourceNode = offlineAudioContext.createBufferSource();

                audioBuffer.getChannelData(0)[0] = 1;

                audioBufferSourceNode.buffer = audioBuffer;

                audioBufferSourceNode.connect(offlineAudioContext.destination);
                audioBufferSourceNode.start();

                offlineAudioContext.oncomplete = (event) => {
                    const channelData = event.renderedBuffer.getChannelData(0);

                    expect(channelData[0]).to.equal(0);

                    audioBufferSourceNode.disconnect(offlineAudioContext.destination);

                    done();
                };
                offlineAudioContext.startRendering();
            });

        });

        describe('start()', () => {

            // bug #44

            it('should throw a DOMException', () => {
                const audioBufferSourceNode = offlineAudioContext.createBufferSource();

                expect(() => audioBufferSourceNode.start(-1)).to.throw(DOMException);
                expect(() => audioBufferSourceNode.start(0, -1)).to.throw(DOMException);
                expect(() => audioBufferSourceNode.start(0, 0, -1)).to.throw(DOMException);
            });

        });

        describe('stop()', () => {

            // bug #44

            it('should throw a DOMException', () => {
                const audioBufferSourceNode = offlineAudioContext.createBufferSource();

                expect(() => audioBufferSourceNode.stop(-1)).to.throw(DOMException);
            });

            // bug #69

            it('should not ignore calls repeated calls to stop()', () => {
                const audioBufferSourceNode = offlineAudioContext.createBufferSource();

                audioBufferSourceNode.start();
                audioBufferSourceNode.start();
            });

        });

    });

    describe('createChannelMerger()', () => {

        // bug #11

        it('should not be chainable', () => {
            const channelMergerNode = offlineAudioContext.createChannelMerger();
            const gainNode = offlineAudioContext.createGain();

            expect(channelMergerNode.connect(gainNode)).to.be.undefined;
        });

        // bug #15

        it('should have a wrong channelCount', () => {
            const channelMergerNode = offlineAudioContext.createChannelMerger();

            expect(channelMergerNode.channelCount).to.not.equal(1);
        });

        it('should have a wrong channelCountMode', () => {
            const channelMergerNode = offlineAudioContext.createChannelMerger();

            expect(channelMergerNode.channelCountMode).to.not.equal('explicit');
        });

    });

    describe('createChannelSplitter()', () => {

        // bug #11

        it('should not be chainable', () => {
            const channelSplitterNode = offlineAudioContext.createChannelSplitter(),
                gainNode = offlineAudioContext.createGain();

            expect(channelSplitterNode.connect(gainNode)).to.be.undefined;
        });

        // bug #96

        it('should have a wrong channelCount', () => {
            const channelSplitterNode = offlineAudioContext.createChannelSplitter(6);

            expect(channelSplitterNode.channelCount).to.equal(2);
        });

        // bug #97

        it('should allow to set the channelCount', () => {
            const channelSplitterNode = offlineAudioContext.createChannelSplitter();

            channelSplitterNode.channelCount = 6;
            channelSplitterNode.channelCount = 2;
        });

        // bug #29

        it('should have a channelCountMode of max', () => {
            const channelSplitterNode = offlineAudioContext.createChannelSplitter();

            expect(channelSplitterNode.channelCountMode).to.equal('max');
        });

        // bug #30

        it('should allow to set the channelCountMode', () => {
            const channelSplitterNode = offlineAudioContext.createChannelSplitter();

            channelSplitterNode.channelCountMode = 'explicit';
            channelSplitterNode.channelCountMode = 'max';
        });

        // bug #31

        it('should have a channelInterpretation of speakers', () => {
            const channelSplitterNode = offlineAudioContext.createChannelSplitter();

            expect(channelSplitterNode.channelInterpretation).to.equal('speakers');
        });

        // bug #32

        it('should allow to set the channelInterpretation', () => {
            const channelSplitterNode = offlineAudioContext.createChannelSplitter();

            channelSplitterNode.channelInterpretation = 'discrete';
            channelSplitterNode.channelInterpretation = 'speakers';
        });

    });

    describe('createConstantSource()', () => {

        // bug #62

        it('should not be implemented', () => {
            expect(offlineAudioContext.createConstantSource).to.be.undefined;
        });

    });

    describe('createDynamicsCompressor()', () => {

        // bug #112

        it('should not have a tail-time', (done) => {
            const audioBuffer = offlineAudioContext.createBuffer(1, 3, 44100);
            const audioBufferSourceNode = offlineAudioContext.createBufferSource();
            const dynamicsCompressorNode = offlineAudioContext.createDynamicsCompressor();

            audioBuffer.getChannelData(0)[0] = 1;
            audioBuffer.getChannelData(0)[1] = 1;
            audioBuffer.getChannelData(0)[2] = 1;

            audioBufferSourceNode.buffer = audioBuffer;

            audioBufferSourceNode.connect(dynamicsCompressorNode);
            dynamicsCompressorNode.connect(offlineAudioContext.destination);

            audioBufferSourceNode.start(0);

            offlineAudioContext.oncomplete = ({ renderedBuffer }) => {
                // Bug #5: Safari does not support copyFromChannel().
                const channelData = renderedBuffer.getChannelData(0);

                for (let i = 0; i < channelData.length; i += 1) {
                    expect(channelData[i]).to.equal(0);
                }

                done();
            };
            offlineAudioContext.startRendering();
        });

    });

    describe('createGain()', () => {

        // bug #11

        it('should not be chainable', () => {
            const gainNodeA = offlineAudioContext.createGain();
            const gainNodeB = offlineAudioContext.createGain();

            expect(gainNodeA.connect(gainNodeB)).to.be.undefined;
        });

        // bug #12

        it('should not allow to disconnect a specific destination', (done) => {
            const candidate = offlineAudioContext.createGain();
            const dummy = offlineAudioContext.createGain();
            // Bug #95: Safari does not play/loop one sample buffers.
            const ones = offlineAudioContext.createBuffer(1, 2, 44100);

            ones.getChannelData(0)[0] = 1;
            ones.getChannelData(0)[1] = 1;

            const source = offlineAudioContext.createBufferSource();

            source.buffer = ones;

            source.connect(candidate);
            candidate.connect(offlineAudioContext.destination);
            candidate.connect(dummy);
            candidate.disconnect(dummy);

            source.start();

            offlineAudioContext.oncomplete = (event) => {
                const channelData = event.renderedBuffer.getChannelData(0);

                expect(channelData[0]).to.equal(0);

                source.disconnect(candidate);
                candidate.disconnect(offlineAudioContext.destination);

                done();
            };
            offlineAudioContext.startRendering();
        });

        describe('gain', () => {

            describe('value', () => {

                // bug #98

                it('should ignore the value setter while an automation is running', function (done) {
                    this.timeout(10000);

                    const audioBuffer = offlineAudioContext.createBuffer(1, 0.5 * offlineAudioContext.sampleRate, offlineAudioContext.sampleRate);
                    const audioBufferSourceNode = offlineAudioContext.createBufferSource();
                    const gainNode = offlineAudioContext.createGain();

                    // Bug #5: Safari does not support copyToChannel().
                    for (let i = 0; i < 0.5 * offlineAudioContext.sampleRate; i += 1) {
                        audioBuffer.getChannelData(0)[i] = 1;
                    }

                    audioBufferSourceNode.buffer = audioBuffer;

                    gainNode.gain.setValueAtTime(-1, 0);
                    gainNode.gain.linearRampToValueAtTime(1, 0.5);

                    gainNode.gain.value = 100;

                    audioBufferSourceNode.connect(gainNode);
                    gainNode.connect(offlineAudioContext.destination);

                    audioBufferSourceNode.start();

                    offlineAudioContext.oncomplete = ({ renderedBuffer }) => {
                        // Bug #5: Safari does not support copyFromChannel().
                        const channelData = renderedBuffer.getChannelData(0);

                        for (let i = 0; i < channelData.length; i += 1) {
                            expect(channelData[i]).to.be.at.least(-1);
                            expect(channelData[i]).to.be.at.most(1);
                        }

                        done();
                    };
                    offlineAudioContext.startRendering();
                });

            });

        });

        describe('cancelAndHoldAtTime()', () => {

            let gainNode;

            beforeEach(() => {
                gainNode = offlineAudioContext.createGain();
            });

            // bug #28

            it('should not be implemented', () => {
                expect(gainNode.gain.cancelAndHoldAtTime).to.be.undefined;
            });

        });

    });

    describe('createIIRFilter()', () => {

        // bug #9

        it('should not be implemented', () => {
            expect(offlineAudioContext.createIIRFilter).to.be.undefined;
        });

    });

    describe('createOscillator()', () => {

        // bug #11

        it('should not be chainable', () => {
            const gainNode = offlineAudioContext.createGain();
            const oscillatorNode = offlineAudioContext.createOscillator();

            expect(oscillatorNode.connect(gainNode)).to.be.undefined;
        });

    });

    describe('createScriptProcessor()', () => {

        // bug #8

        it('should not fire onaudioprocess for every buffer', (done) => {
            const scriptProcessorNode = offlineAudioContext.createScriptProcessor(256, 1, 1);

            scriptProcessorNode.connect(offlineAudioContext.destination);
            scriptProcessorNode.onaudioprocess = stub();

            offlineAudioContext.oncomplete = () => {
                expect(scriptProcessorNode.onaudioprocess.callCount).to.be.below(1000);

                done();
            };
            offlineAudioContext.startRendering();
        });

        // bug #13

        it('should not have any output', (done) => {
            const scriptProcessorNode = offlineAudioContext.createScriptProcessor(256, 1, 1);

            scriptProcessorNode.connect(offlineAudioContext.destination);
            scriptProcessorNode.onaudioprocess = (event) => {
                // Bug #5: Safari does not support copyFromChannel().
                const channelData = event.outputBuffer.getChannelData(0);

                channelData.fill(1);
            };

            offlineAudioContext.oncomplete = (event) => {
                // Bug #5: Safari does not support copyFromChannel().
                const channelData = event.renderedBuffer.getChannelData(0);

                expect(Array.from(channelData)).to.not.contain(1);

                done();
            };
            offlineAudioContext.startRendering();
        });

        describe('without any output channels', () => {

            // bug #87

            it('should not fire any AudioProcessingEvent', (done) => {
                const listener = spy();
                const oscillatorNode = offlineAudioContext.createOscillator();
                const scriptProcessorNode = offlineAudioContext.createScriptProcessor(256, 1, 0);

                scriptProcessorNode.onaudioprocess = listener;

                oscillatorNode.connect(scriptProcessorNode);
                oscillatorNode.start();

                offlineAudioContext.oncomplete = () => {
                    expect(listener).to.have.not.been.called;

                    done();
                };
                offlineAudioContext.startRendering();
            });

        });

    });

    describe('decodeAudioData()', () => {

        // bug #1

        it('should require the success callback function as a parameter', (done) => {
            loadFixture('1000-frames-of-noise.wav', (err, arrayBuffer) => {
                expect(err).to.be.null;

                expect(() => {
                    offlineAudioContext.decodeAudioData(arrayBuffer);
                }).to.throw(TypeError, 'Not enough arguments');

                done();
            });
        });

        // bug #4

        it('should throw null when asked to decode an unsupported file', function (done) {
            this.timeout(10000);

            // PNG files are not supported by any browser :-)
            loadFixture('one-pixel-of-transparency.png', (err, arrayBuffer) => {
                expect(err).to.be.null;

                offlineAudioContext.decodeAudioData(arrayBuffer, () => {}, (rr) => {
                    expect(rr).to.be.null;

                    done();
                });
            });
        });

        // bug #5

        it('should return an AudioBuffer without copyFromChannel() and copyToChannel() methods', (done) => {
            loadFixture('1000-frames-of-noise.wav', (err, arrayBuffer) => {
                expect(err).to.be.null;

                offlineAudioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
                    expect(audioBuffer.copyFromChannel).to.be.undefined;
                    expect(audioBuffer.copyToChannel).to.be.undefined;

                    done();
                });
            });
        });

        // bug #21

        it('should not return a promise', (done) => {
            loadFixture('1000-frames-of-noise.wav', (err, arrayBuffer) => {
                expect(err).to.be.null;

                expect(offlineAudioContext.decodeAudioData(arrayBuffer, () => {})).to.be.undefined;

                done();
            });
        });

        // bug #26

        it('should throw a synchronous error', (done) => {
            try {
                offlineAudioContext.decodeAudioData(null, () => {});
            } catch (err) {
                done();
            }
        });

        // bug #43

        it('should not throw a DataCloneError', (done) => {
            loadFixture('1000-frames-of-noise.wav', (err, arrayBuffer) => {
                expect(err).to.be.null;

                offlineAudioContext
                    .decodeAudioData(arrayBuffer, () => {
                        offlineAudioContext
                            .decodeAudioData(arrayBuffer, () => done());
                    });
            });
        });

    });

    describe('startRendering()', () => {

        // bug #21

        it('should not return a promise', () => {
            expect(offlineAudioContext.startRendering()).to.be.undefined;
        });

    });

});
