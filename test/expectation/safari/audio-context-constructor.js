import { loadFixture } from '../../helper/load-fixture';

describe('audioContextConstructor', () => {

    let audioContext;

    afterEach(() => audioContext.close());

    describe('without a constructed AudioContext', () => {

        // bug #51

        it('should allow to set the latencyHint to an unsupported value', () => {
            audioContext = new webkitAudioContext({ latencyHint: 'negative' }); // eslint-disable-line new-cap, no-undef
        });

    });

    describe('with a constructed AudioContext', () => {

        beforeEach(() => {
            audioContext = new webkitAudioContext(); // eslint-disable-line new-cap, no-undef
        });

        it('should not provide an unprefixed constructor', () => {
            expect(window.AudioContext).to.be.undefined;
        });

        describe('audioWorklet', () => {

            // bug #59

            it('should not be implemented', () => {
                expect(audioContext.audioWorklet).to.be.undefined;
            });

        });

        describe('baseLatency', () => {

            // bug #39

            it('should not be implemented', () => {
                expect(audioContext.baseLatency).to.be.undefined;
            });

        });

        describe('listener', () => {

            // bug #117

            it('should not be implemented', () => {
                expect(audioContext.listener.forwardX).to.be.undefined;
                expect(audioContext.listener.forwardY).to.be.undefined;
                expect(audioContext.listener.forwardZ).to.be.undefined;
                expect(audioContext.listener.positionX).to.be.undefined;
                expect(audioContext.listener.positionY).to.be.undefined;
                expect(audioContext.listener.positionZ).to.be.undefined;
                expect(audioContext.listener.upX).to.be.undefined;
                expect(audioContext.listener.upY).to.be.undefined;
                expect(audioContext.listener.upZ).to.be.undefined;
            });

        });

        describe('outputLatency', () => {

            // bug #40

            it('should not be implemented', () => {
                expect(audioContext.outputLatency).to.be.undefined;
            });

        });

        describe('createAnalyser()', () => {

            // bug #11

            it('should not be chainable', () => {
                const analyserNode = audioContext.createAnalyser();
                const gainNode = audioContext.createGain();

                expect(analyserNode.connect(gainNode)).to.be.undefined;
            });

            // bug #41

            it('should throw a SyntaxError when calling connect() with a node of another AudioContext', (done) => {
                const analyserNode = audioContext.createAnalyser();
                const anotherAudioContext = new webkitAudioContext(); // eslint-disable-line new-cap, no-undef

                try {
                    analyserNode.connect(anotherAudioContext.destination);
                } catch (err) {
                    expect(err.code).to.equal(12);
                    expect(err.name).to.equal('SyntaxError');

                    done();
                } finally {
                    anotherAudioContext.close();
                }
            });

            // bug #58

            it('should throw a SyntaxError when calling connect() with an AudioParam of another AudioContext', (done) => {
                const analyserNode = audioContext.createAnalyser();
                const anotherAudioContext = new webkitAudioContext(); // eslint-disable-line new-cap, no-undef
                const gainNode = anotherAudioContext.createGain();

                try {
                    analyserNode.connect(gainNode.gain);
                } catch (err) {
                    expect(err.code).to.equal(12);
                    expect(err.name).to.equal('SyntaxError');

                    done();
                } finally {
                    anotherAudioContext.close();
                }
            });

            describe('maxDecibels', () => {

                // bug #118

                it('should be assignable to a value equal to minDecibels', () => {
                    const analyserNode = audioContext.createAnalyser();
                    const maxDecibels = analyserNode.minDecibels;

                    analyserNode.maxDecibels = maxDecibels;

                    expect(analyserNode.maxDecibels).to.equal(maxDecibels);
                });

            });

            describe('minDecibels', () => {

                // bug #118

                it('should be assignable to a value equal to maxDecibels', () => {
                    const analyserNode = audioContext.createAnalyser();
                    const minDecibels = analyserNode.maxDecibels;

                    analyserNode.minDecibels = minDecibels;

                    expect(analyserNode.minDecibels).to.equal(minDecibels);
                });

            });

            describe('getFloatTimeDomainData()', () => {

                // bug #36

                it('should not have a getFloatTimeDomainData method', () => {
                    const analyserNode = audioContext.createAnalyser();

                    expect(analyserNode.getFloatTimeDomainData).to.be.undefined;
                });

            });

        });

        describe('createBiquadFilter()', () => {

            let biquadFilterNode;

            beforeEach(() => {
                biquadFilterNode = audioContext.createBiquadFilter();
            });

            // bug #11

            it('should not be chainable', () => {
                const gainNode = audioContext.createGain();

                expect(biquadFilterNode.connect(gainNode)).to.be.undefined;
            });

            describe('detune', () => {

                describe('automationRate', () => {

                    // bug #84

                    it('should not be implemented', () => {
                        expect(biquadFilterNode.detune.automationRate).to.be.undefined;
                    });

                });

                describe('maxValue', () => {

                    // bug #78

                    it('should be 4800', () => {
                        expect(biquadFilterNode.detune.maxValue).to.equal(4800);
                    });

                });

                describe('minValue', () => {

                    // bug #78

                    it('should be -4800', () => {
                        expect(biquadFilterNode.detune.minValue).to.equal(-4800);
                    });

                });

            });

            describe('frequency', () => {

                describe('maxValue', () => {

                    // bug #77

                    it('should be the nyquist frequency', () => {
                        expect(biquadFilterNode.frequency.maxValue).to.equal(audioContext.sampleRate / 2);
                    });

                });

                describe('minValue', () => {

                    // bug #77

                    it('should be 10', () => {
                        expect(biquadFilterNode.frequency.minValue).to.equal(10);
                    });

                });

            });

            describe('gain', () => {

                describe('maxValue', () => {

                    // bug #79

                    it('should be 40', () => {
                        expect(biquadFilterNode.gain.maxValue).to.equal(40);
                    });

                });

                describe('minValue', () => {

                    // bug #79

                    it('should be -40', () => {
                        expect(biquadFilterNode.gain.minValue).to.equal(-40);
                    });

                });

            });

            describe('Q', () => {

                describe('maxValue', () => {

                    // bug #80

                    it('should be 1000', () => {
                        expect(biquadFilterNode.Q.maxValue).to.equal(1000);
                    });

                });

                describe('minValue', () => {

                    // bug #80

                    it('should be 0.00009999999747378752', () => {
                        expect(biquadFilterNode.Q.minValue).to.equal(0.00009999999747378752);
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

        describe('createBuffer()', () => {

            // bug #99

            describe('with zero as the numberOfChannels', () => {

                it('should throw no error', () => {
                    audioContext.createBuffer(0, 10, 44100);
                });

            });

            describe('getChannelData()', () => {

                let audioBuffer;

                beforeEach(() => {
                    audioBuffer = audioContext.createBuffer(2, 10, 44100);
                });

                describe('with an index of an unexisting channel', () => {

                    // bug #100

                    it('should throw a SyntaxError', (done) => {
                        try {
                            audioBuffer.getChannelData(2);
                        } catch (err) {
                            expect(err.code).to.equal(12);
                            expect(err.name).to.equal('SyntaxError');

                            done();
                        }
                    });

                });

            });

        });

        describe('createBufferSource()', () => {

            // bug #11

            it('should not be chainable', () => {
                const audioBufferSourceNode = audioContext.createBufferSource();
                const gainNode = audioContext.createGain();

                expect(audioBufferSourceNode.connect(gainNode)).to.be.undefined;
            });

            // bug #18

            it('should not allow calls to stop() of an AudioBufferSourceNode scheduled for stopping', () => {
                const audioBuffer = audioContext.createBuffer(1, 100, 44100);
                const audioBufferSourceNode = audioContext.createBufferSource();

                audioBufferSourceNode.buffer = audioBuffer;
                audioBufferSourceNode.connect(audioContext.destination);
                audioBufferSourceNode.start();
                audioBufferSourceNode.stop(audioContext.currentTime + 1);
                expect(() => {
                    audioBufferSourceNode.stop();
                }).to.throw(Error);
            });

            // bug #19

            it('should not ignore calls to stop() of an already stopped AudioBufferSourceNode', (done) => {
                const audioBuffer = audioContext.createBuffer(1, 100, 44100);
                const audioBufferSourceNode = audioContext.createBufferSource();

                audioBufferSourceNode.onended = () => {
                    expect(() => {
                        audioBufferSourceNode.stop();
                    }).to.throw(Error);

                    done();
                };

                audioBufferSourceNode.buffer = audioBuffer;
                audioBufferSourceNode.connect(audioContext.destination);
                audioBufferSourceNode.start();
                audioBufferSourceNode.stop();
            });

            describe('buffer', () => {

                // bug #72

                it('should allow to assign the buffer multiple times', () => {
                    const audioBufferSourceNode = audioContext.createBufferSource();

                    audioBufferSourceNode.buffer = audioContext.createBuffer(2, 100, 44100);
                    audioBufferSourceNode.buffer = audioContext.createBuffer(2, 100, 44100);
                });

            });

            describe('playbackRate', () => {

                let audioBufferSourceNode;

                beforeEach(() => {
                    audioBufferSourceNode = audioContext.createBufferSource();
                });

                describe('maxValue', () => {

                    // bug #73

                    it('should be 1024', () => {
                        expect(audioBufferSourceNode.playbackRate.maxValue).to.equal(1024);
                    });

                });

                describe('minValue', () => {

                    // bug #73

                    it('should be -1024', () => {
                        expect(audioBufferSourceNode.playbackRate.minValue).to.equal(-1024);
                    });

                });

                describe('exponentialRampToValueAtTime()', () => {

                    // bug #45

                    it('should not throw any exception', () => {
                        audioBufferSourceNode.playbackRate.exponentialRampToValueAtTime(0, 1);
                    });

                });

            });

            describe('start()', () => {

                // bug #44

                it('should throw a DOMException', () => {
                    const audioBufferSourceNode = audioContext.createBufferSource();

                    expect(() => audioBufferSourceNode.start(-1)).to.throw(DOMException);
                    expect(() => audioBufferSourceNode.start(0, -1)).to.throw(DOMException);
                    expect(() => audioBufferSourceNode.start(0, 0, -1)).to.throw(DOMException);
                });

                // bug #69

                it('should not ignore calls repeated calls to stop()', () => {
                    const audioBufferSourceNode = audioContext.createBufferSource();

                    audioBufferSourceNode.start();
                    audioBufferSourceNode.start();
                });

            });

            describe('stop()', () => {

                // bug #44

                it('should throw a DOMException', () => {
                    const audioBufferSourceNode = audioContext.createBufferSource();

                    expect(() => audioBufferSourceNode.stop(-1)).to.throw(DOMException);
                });

            });

        });

        describe('createChannelMerger()', () => {

            // bug #11

            it('should not be chainable', () => {
                const channelMergerNode = audioContext.createChannelMerger();
                const gainNode = audioContext.createGain();

                expect(channelMergerNode.connect(gainNode)).to.be.undefined;
            });

            // bug #15

            it('should have a wrong channelCount', () => {
                const channelMergerNode = audioContext.createChannelMerger();

                expect(channelMergerNode.channelCount).to.not.equal(1);
            });

            it('should have a wrong channelCountMode', () => {
                const channelMergerNode = audioContext.createChannelMerger();

                expect(channelMergerNode.channelCountMode).to.not.equal('explicit');
            });

            // bug #20

            it('should not handle unconnected channels as silence', (done) => {
                const sampleRate = audioContext.sampleRate;
                // Bug #95: Safari does not play/loop one sample buffers.
                const audioBuffer = audioContext.createBuffer(1, 2, sampleRate);
                const audioBufferSourceNode = audioContext.createBufferSource();
                const channelMergerNode = audioContext.createChannelMerger();
                const scriptProcessorNode = audioContext.createScriptProcessor(256, 2, 2);

                // Bug #5: Safari does not support copyFromChannel().
                audioBuffer.getChannelData(0)[0] = 1;
                audioBuffer.getChannelData(0)[1] = 1;

                audioBufferSourceNode.buffer = audioBuffer;
                audioBufferSourceNode.loop = true;

                const startTime = audioContext.currentTime;

                scriptProcessorNode.onaudioprocess = (event) => {
                    const channelData = event.inputBuffer.getChannelData(1);

                    for (let i = 0, length = channelData.length; i < length; i += 1) {
                        if (channelData[i] === 1) {
                            done();

                            return;
                        }
                    }

                    if (startTime + (1 / sampleRate) < event.playbackTime) {
                        done(new Error('It should process a buffer containing a wrong sample within one second.'));
                    }
                };

                audioBufferSourceNode.connect(channelMergerNode, 0, 0);
                channelMergerNode.connect(scriptProcessorNode);
                scriptProcessorNode.connect(audioContext.destination);

                audioBufferSourceNode.start(startTime);
            });

        });

        describe('createChannelSplitter()', () => {

            // bug #11

            it('should not be chainable', () => {
                const channelSplitterNode = audioContext.createChannelSplitter();
                const gainNode = audioContext.createGain();

                expect(channelSplitterNode.connect(gainNode)).to.be.undefined;
            });

            // bug #96

            it('should have a wrong channelCount', () => {
                const channelSplitterNode = audioContext.createChannelSplitter(6);

                expect(channelSplitterNode.channelCount).to.equal(2);
            });

            // bug #97

            it('should allow to set the channelCount', () => {
                const channelSplitterNode = audioContext.createChannelSplitter();

                channelSplitterNode.channelCount = 6;
                channelSplitterNode.channelCount = 2;
            });

            // bug #29

            it('should have a wrong channelCountMode', () => {
                const channelSplitterNode = audioContext.createChannelSplitter();

                expect(channelSplitterNode.channelCountMode).to.equal('max');
            });

            // bug #30

            it('should allow to set the channelCountMode', () => {
                const channelSplitterNode = audioContext.createChannelSplitter();

                channelSplitterNode.channelCountMode = 'explicit';
                channelSplitterNode.channelCountMode = 'max';
            });

            // bug #31

            it('should have a wrong channelInterpretation', () => {
                const channelSplitterNode = audioContext.createChannelSplitter();

                expect(channelSplitterNode.channelInterpretation).to.equal('speakers');
            });

            // bug #32

            it('should allow to set the channelInterpretation', () => {
                const channelSplitterNode = audioContext.createChannelSplitter();

                channelSplitterNode.channelInterpretation = 'discrete';
                channelSplitterNode.channelInterpretation = 'speakers';
            });

        });

        describe('createConstantSource()', () => {

            // bug #62

            it('should not be implemented', () => {
                expect(audioContext.createConstantSource).to.be.undefined;
            });

        });

        describe('createConvolver()', () => {

            let convolverNode;

            beforeEach(() => {
                convolverNode = audioContext.createConvolver();
            });

            describe('buffer', () => {

                // bug #115

                it('should not allow to assign the buffer to null', () => {
                    const audioBuffer = audioContext.createBuffer(2, 100, 44100);

                    convolverNode.buffer = audioBuffer;
                    convolverNode.buffer = null;

                    expect(convolverNode.buffer).to.equal(audioBuffer);
                });

            });

            describe('channelCount', () => {

                // bug #113

                it('should not throw an error', () => {
                    convolverNode.channelCount = 3;
                });

            });

            describe('channelCountMode', () => {

                // bug #114

                it('should not throw an error', () => {
                    convolverNode.channelCountMode = 'max';
                });

            });

        });

        describe('createDynamicsCompressor()', () => {

            let dynamicsCompressorNode;

            beforeEach(() => {
                dynamicsCompressorNode = audioContext.createDynamicsCompressor();
            });

            describe('channelCount', () => {

                // bug #108

                it('should not throw an error', () => {
                    dynamicsCompressorNode.channelCount = 3;
                });

            });

            describe('channelCountMode', () => {

                // bug #109

                it('should not throw an error', () => {
                    dynamicsCompressorNode.channelCountMode = 'max';
                });

            });

            describe('reduction', () => {

                // bug #111

                it('should return an instance of the AudioParam interface', () => {
                    expect(dynamicsCompressorNode.reduction.cancelScheduledValues).to.be.a('function');
                    expect(dynamicsCompressorNode.reduction.defaultValue).to.be.a('number');
                    expect(dynamicsCompressorNode.reduction.exponentialRampToValueAtTime).to.be.a('function');
                    expect(dynamicsCompressorNode.reduction.linearRampToValueAtTime).to.be.a('function');
                    expect(dynamicsCompressorNode.reduction.maxValue).to.be.a('number');
                    expect(dynamicsCompressorNode.reduction.minValue).to.be.a('number');
                    expect(dynamicsCompressorNode.reduction.setTargetAtTime).to.be.a('function');
                    expect(dynamicsCompressorNode.reduction.setValueAtTime).to.be.a('function');
                    expect(dynamicsCompressorNode.reduction.setValueCurveAtTime).to.be.a('function');
                    expect(dynamicsCompressorNode.reduction.value).to.be.a('number');
                });

            });

        });

        describe('createGain()', () => {

            // bug #11

            it('should not be chainable', () => {
                const gainNodeA = audioContext.createGain();
                const gainNodeB = audioContext.createGain();

                expect(gainNodeA.connect(gainNodeB)).to.be.undefined;
            });

            // bug #12

            it('should not allow to disconnect a specific destination', (done) => {
                const analyzer = audioContext.createScriptProcessor(256, 1, 1);
                const candidate = audioContext.createGain();
                const dummy = audioContext.createGain();
                // Bug #95: Safari does not play/loop one sample buffers.
                const ones = audioContext.createBuffer(1, 2, 44100);
                const channelData = ones.getChannelData(0);

                channelData[0] = 1;
                channelData[1] = 1;

                const source = audioContext.createBufferSource();

                source.buffer = ones;
                source.loop = true;

                source.connect(candidate);
                candidate.connect(analyzer);
                analyzer.connect(audioContext.destination);
                candidate.connect(dummy);
                candidate.disconnect(dummy);

                analyzer.onaudioprocess = (event) => {
                    const chnnlDt = event.inputBuffer.getChannelData(0);

                    if (Array.prototype.some.call(chnnlDt, (sample) => sample === 1)) {
                        done('should never happen');
                    }
                };

                source.start();

                setTimeout(() => {
                    source.stop();

                    analyzer.onaudioprocess = null;

                    source.disconnect(candidate);
                    candidate.disconnect(analyzer);
                    analyzer.disconnect(audioContext.destination);

                    done();
                }, 500);
            });

            describe('gain', () => {

                let gainNode;

                beforeEach(() => {
                    gainNode = audioContext.createGain();
                });

                describe('maxValue', () => {

                    // bug #74

                    it('should be 1', () => {
                        expect(gainNode.gain.maxValue).to.equal(1);
                    });

                });

                describe('minValue', () => {

                    // bug #74

                    it('should be 0', () => {
                        expect(gainNode.gain.minValue).to.equal(0);
                    });

                });

                describe('cancelAndHoldAtTime()', () => {

                    // bug #28

                    it('should not be implemented', () => {
                        expect(gainNode.gain.cancelAndHoldAtTime).to.be.undefined;
                    });

                });

            });

        });

        describe('createIIRFilter()', () => {

            // bug #9

            it('should not be implemented', () => {
                expect(audioContext.createIIRFilter).to.be.undefined;
            });

        });

        describe('createOscillator()', () => {

            // bug #11

            it('should not be chainable', () => {
                const gainNode = audioContext.createGain();
                const oscillatorNode = audioContext.createOscillator();

                expect(oscillatorNode.connect(gainNode)).to.be.undefined;
            });

            describe('detune', () => {

                let oscillatorNode;

                beforeEach(() => {
                    oscillatorNode = audioContext.createOscillator();
                });

                describe('maxValue', () => {

                    // bug #81

                    it('should be 4800', () => {
                        expect(oscillatorNode.detune.maxValue).to.equal(4800);
                    });

                });

                describe('minValue', () => {

                    // bug #81

                    it('should be -4800', () => {
                        expect(oscillatorNode.detune.minValue).to.equal(-4800);
                    });

                });

            });

            describe('frequency', () => {

                let oscillatorNode;

                beforeEach(() => {
                    oscillatorNode = audioContext.createOscillator();
                });

                describe('maxValue', () => {

                    // bug #76

                    it('should be 100000', () => {
                        expect(oscillatorNode.frequency.maxValue).to.equal(100000);
                    });

                });

                describe('minValue', () => {

                    // bug #76

                    it('should be 0', () => {
                        expect(oscillatorNode.frequency.minValue).to.equal(0);
                    });

                });

            });

        });

        describe('createStereoPanner()', () => {

            // bug #105

            it('should not be implemented', () => {
                expect(audioContext.createStereoPanner).to.be.undefined;
            });

        });

        describe('createWaveShaper()', () => {

            describe('curve', () => {

                // bug #102

                it('should allow to assign a curve with less than two samples', () => {
                    const waveShaperNode = audioContext.createWaveShaper();

                    waveShaperNode.curve = new Float32Array([ 1 ]);
                });

                // bug #103

                it('should not allow to assign null', () => {
                    const waveShaperNode = audioContext.createWaveShaper();

                    expect(() => {
                        waveShaperNode.curve = null;
                    }).to.throw(TypeError, 'The WaveShaperNode.curve attribute must be an instance of Float32Array');
                });

            });

        });

        describe('decodeAudioData()', () => {

            // bug #1

            it('should require the success callback function as a parameter', (done) => {
                loadFixture('1000-frames-of-noise.wav', (err, arrayBuffer) => {
                    expect(err).to.be.null;

                    expect(() => {
                        audioContext.decodeAudioData(arrayBuffer);
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

                    audioContext.decodeAudioData(arrayBuffer, () => {}, (rr) => {
                        expect(rr).to.be.null;

                        done();
                    });
                });
            });

            // bug #5

            it('should return an AudioBuffer without copyFromChannel() and copyToChannel() methods', (done) => {
                loadFixture('1000-frames-of-noise.wav', (err, arrayBuffer) => {
                    expect(err).to.be.null;

                    audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
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

                    expect(audioContext.decodeAudioData(arrayBuffer, () => {})).to.be.undefined;

                    done();
                });
            });

            // bug #26

            it('should throw a synchronous error', (done) => {
                try {
                    audioContext.decodeAudioData(null, () => {});
                } catch (err) {
                    done();
                }
            });

            // bug #43

            it('should not throw a DataCloneError', (done) => {
                loadFixture('1000-frames-of-noise.wav', (err, arrayBuffer) => {
                    expect(err).to.be.null;

                    audioContext
                        .decodeAudioData(arrayBuffer, () => {
                            audioContext
                                .decodeAudioData(arrayBuffer, () => done());
                        });
                });
            });

        });

        describe('getOutputTimestamp()', () => {

            // bug #38

            it('should not be implemented', () => {
                expect(audioContext.getOutputTimestamp).to.be.undefined;
            });

        });

        describe('resume()', () => {

            afterEach(() => {
                // Create a closeable AudioContext to align the behaviour with other tests.
                audioContext = new webkitAudioContext(); // eslint-disable-line new-cap, no-undef
            });

            beforeEach(() => audioContext.close());

            // bug #56

            it('should throw undefined with a closed AudioContext', (done) => {
                audioContext
                    .resume()
                    .catch((err) => {
                        expect(err).to.be.undefined;

                        done();
                    });
            });

        });

        describe('suspend()', () => {

            afterEach(() => {
                // Create a closeable AudioContext to align the behaviour with other tests.
                audioContext = new webkitAudioContext(); // eslint-disable-line new-cap, no-undef
            });

            beforeEach(() => audioContext.close());

            // bug #56

            it('should throw undefined with a closed AudioContext', (done) => {
                audioContext
                    .suspend()
                    .catch((err) => {
                        expect(err).to.be.undefined;

                        done();
                    });
            });

        });

    });

});
