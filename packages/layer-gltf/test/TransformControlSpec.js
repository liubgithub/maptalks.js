describe('transform-control', () => {
    let map, eventContainer;
    beforeEach(function() {
        map = createMap();
        eventContainer = map._panels.canvasContainer;
    });

    afterEach(function() {
        removeMap(map);
    });

    it('transform on gltfmarker', (done) => {
        const gltflayer = new maptalks.GLTFLayer('gltf');
        const gltfmarker = new maptalks.GLTFGeometry(center,
            {
                id:'gltfmarker1',
                symbol: {
                    scaleX: 2 / 3,
                    scaleY: 2 / 3,
                    scaleZ: 2 / 3
                }
            }
        ).addTo(gltflayer);
        new maptalks.GroupGLLayer('group', [gltflayer],  { sceneConfig }).addTo(map);
        const transformControl = new maptalks.TransformControl();
        transformControl.addTo(map);
        setTimeout(function () {
            transformControl.transform(gltfmarker);
            const transformTarget = transformControl.getTransformTarget();
            expect(transformTarget).to.be.ok();
            expect(transformTarget.getTargets()[0].getId()).to.be.eql('gltfmarker1');
            transformControl.remove();
            done();
        }, 100);
    });

    it('disable and enable', () => {
        const transformControl = new maptalks.TransformControl();
        transformControl.addTo(map);
        expect(transformControl.isEnable()).to.be.ok();
        transformControl.disable();
        expect(transformControl.isEnable()).not.to.be.ok();
        transformControl.enable();
        expect(transformControl.isEnable()).to.be.ok();
    });

    it('picked', (done) => {
        const gltflayer = new maptalks.GLTFLayer('picked').addTo(map);
        const gltfmarker = new maptalks.GLTFGeometry(center, {
            symbol: {
                scaleX: 2 / 3,
                scaleY: 2 / 3,
                scaleZ: 2 / 3
            }
        }).addTo(gltflayer);
        const transformControl = new maptalks.TransformControl();
        transformControl.addTo(map);
        setTimeout(function () {
            transformControl.transform(gltfmarker);
            const picked = transformControl.picked(center);
            expect(picked).not.to.be.ok();
            transformControl.remove();
            done();
        }, 100);
    });

    it('transform event', (done) => {
        const gltflayer = new maptalks.GLTFLayer('transform').addTo(map);
        new maptalks.GLTFGeometry(center, {
            symbol: {
                scaleX: 2 / 3,
                scaleY: 2 / 3,
                scaleZ: 2 / 3
            }
        }).addTo(gltflayer);
        const transformControl = new maptalks.TransformControl();
        transformControl.addTo(map);
        map.on('click', e => {
            const identifyData = gltflayer.identify(e.coordinate);
            if (identifyData.length) {
                transformControl.enable();
                transformControl.transform(identifyData[0].data);
            } else {
                transformControl.disable();
            }
            expect(transformControl.isEnable()).to.be.ok();
            const transformTarget = transformControl.getTransformTarget();
            expect(transformTarget).to.be.ok();
            transformControl.remove();
            done();
        });
        gltflayer.on('modelload', () => {
            setTimeout(function() {
                map.fire('click', {
                    coordinate: clickPoint
                });
            }, 100);
        });
    });

    // TODO, 测试四种鼠标交互的逻辑
    it('show transform control', (done) => {
        const gltflayer = new maptalks.GLTFLayer('transform');
        const groupgllayer = new maptalks.GroupGLLayer('gl', [gltflayer], {sceneConfig}).addTo(map);
        new maptalks.GLTFGeometry(center, {
            symbol: {
                scaleX: 2 / 3,
                scaleY: 2 / 3,
                scaleZ: 2 / 3
            }
        }).addTo(gltflayer);
        const transformControl = new maptalks.TransformControl();
        transformControl.addTo(map);

        map.on('mousedown', e => {
            const identifyData = groupgllayer.identify(e.coordinate);
            if (identifyData.length) {
                transformControl.enable();
                transformControl.transform(identifyData[0].data);
            } else if (!transformControl.picked(e.coordinate)) {
                transformControl.disable();
            }
            setTimeout(function() {
                const pixel1 = pickPixel(map, map.width / 2 - 157, map.height / 2, 1, 1);
                const pixel2 = pickPixel(map, map.width / 2, 2, 1, 1);
                const pixel3 = pickPixel(map, map.width / 2 + 157, map.height / 2, 1, 1);
                const pixel4 = pickPixel(map, map.width / 2, 299, 1, 1);
                expect(hasColor(pixel1)).to.be.ok();
                expect(hasColor(pixel2)).to.be.ok();
                expect(hasColor(pixel3)).to.be.ok();
                expect(hasColor(pixel4)).to.be.ok();
                done();
            }, 100);
        });
        setTimeout(function() {
            const point = map.coordinateToContainerPoint(center);
            happen.mousedown(eventContainer, {
                'clientX':point.x,
                'clientY':point.y
            });
        }, 100);
    });

    it('rotation change', (done) => {
        const gltflayer = new maptalks.GLTFLayer('transform');
        const groupgllayer = new maptalks.GroupGLLayer('gl', [gltflayer], {sceneConfig}).addTo(map);
        const marker = new maptalks.GLTFGeometry(center, {
            symbol: {
                scaleX: 2 / 3,
                scaleY: 2 / 3,
                scaleZ: 2 / 3
            }
        }).addTo(gltflayer);
        const transformControl = new maptalks.TransformControl();
        transformControl.addTo(map);
        transformControl.on('transforming', e => {
            const target = transformControl.getTransformTarget();
            const marker = target.getTargets()[0];
            marker.setTRS(e.translate, e.rotation, e.scale);
        });

        map.on('mousedown', e => {
            const identifyData = groupgllayer.identify(e.coordinate);
            if (identifyData.length) {
                transformControl.enable();
                transformControl.transform(identifyData[0].data);
            } else if (!transformControl.picked(e.coordinate)) {
                transformControl.disable();
            }
        });
        function moveTransformControl() {
            const point = map.coordinateToContainerPoint(center).add(132, -86);
            happen.mousemove(eventContainer, {
                'clientX':point.x,
                'clientY':point.y
            });
            happen.mousedown(eventContainer, {
                'clientX':point.x,
                'clientY':point.y
            });
            for (let i = 0; i < 10; i++) {
                happen.mousemove(eventContainer, {
                    'clientX':point.x - i,
                    'clientY':point.y - i
                });
            }
            happen.mouseup(eventContainer);
            setTimeout(function() {
                const newCoord = marker.getCoordinates();
                expect(newCoord.x).to.be.eql(0);
                expect(newCoord.y).to.be.eql(0);
                const rotation = marker.getRotation();
                expect(rotation).to.be.eql([0, 0, 4.684808692706349]);
                done();
            }, 100);
        }
        setTimeout(function() {
            const point = map.coordinateToContainerPoint(center);
            happen.mousedown(eventContainer, {
                'clientX': point.x,
                'clientY': point.y
            });
            happen.mouseup(eventContainer);
            moveTransformControl();
        }, 100);
    });

    it('scale change', (done) => {
        const gltflayer = new maptalks.GLTFLayer('transform');
        const groupgllayer = new maptalks.GroupGLLayer('gl', [gltflayer], {sceneConfig}).addTo(map);
        const marker = new maptalks.GLTFGeometry(center, {
            symbol: {
                scaleX: 2 / 3,
                scaleY: 2 / 3,
                scaleZ: 2 / 3
            }
        }).addTo(gltflayer);
        const transformControl = new maptalks.TransformControl();
        transformControl.addTo(map);
        transformControl.on('transforming', e => {
            marker.setTRS(e.translate, e.rotation, e.scale);
        });

        map.on('mousedown', e => {
            const identifyData = groupgllayer.identify(e.coordinate);
            if (identifyData.length) {
                transformControl.enable();
                transformControl.transform(identifyData[0].data);
            } else if (!transformControl.picked(e.coordinate)) {
                transformControl.disable();
            }
        });
        function moveTransformControl() {
            const point = map.coordinateToContainerPoint(center).add(120, 100);
            happen.mousemove(eventContainer, {
                'clientX':point.x,
                'clientY':point.y
            });
            happen.mousedown(eventContainer, {
                'clientX':point.x,
                'clientY':point.y
            });
            for (let i = 0; i < 10; i++) {
                happen.mousemove(eventContainer, {
                    'clientX':point.x + i,
                    'clientY':point.y + i
                });
            }
            happen.mouseup(eventContainer);
            setTimeout(function() {
                const newCoord = marker.getCoordinates();
                expect(newCoord.x).to.be.eql(0);
                expect(newCoord.y).to.be.eql(0);
                const scale = marker.getScale();
                expect(scale).to.be.eql([0.7508746173013956, 0.7508746173013956, 0.7508746173013956]);
                done();
            }, 100);
        }
        setTimeout(function() {
            const point = map.coordinateToContainerPoint(center);
            happen.mousedown(eventContainer, {
                'clientX': point.x,
                'clientY': point.y
            });
            happen.mouseup(eventContainer);
            moveTransformControl();
        }, 100);
    });

    it('position change', (done) => {
        const gltflayer = new maptalks.GLTFLayer('transform');
        const groupgllayer = new maptalks.GroupGLLayer('gl', [gltflayer], {sceneConfig}).addTo(map);
        const marker = new maptalks.GLTFGeometry(center,
            {
                id:'gltfmarker',
                symbol: {
                    scaleX: 2 / 3,
                    scaleY: 2 / 3,
                    scaleZ: 2 / 3
                }
            }
        ).addTo(gltflayer);
        const transformControl = new maptalks.TransformControl();
        transformControl.addTo(map);
        transformControl.on('positionchange', e => {
            marker.setCoordinates(e.coordinate);
        });

        map.on('mousedown', e => {
            const identifyData = groupgllayer.identify(e.coordinate);
            if (identifyData.length) {
                transformControl.enable();
                transformControl.transform(identifyData[0].data);
            } else if (!transformControl.picked(e.coordinate)) {
                transformControl.disable();
            }
        });

        function moveTransformControl() {
            const point = map.coordinateToContainerPoint(center).add(50, 0);
            happen.mousedown(eventContainer, {
                'clientX':point.x,
                'clientY':point.y
            });
            for (let i = 0; i < 20; i++) {
                happen.mousemove(eventContainer, {
                    'clientX':point.x + i,
                    'clientY':point.y + i
                });
            }
            happen.mouseup(eventContainer);
            setTimeout(function() {
                const newCoord = marker.getCoordinates();
                expect(newCoord.x).to.be.eql(0.00020384788513183594);
                expect(newCoord.y).to.be.eql(-0.0002038478850465708);
                done();
            }, 100);
        }
        setTimeout(function() {
            const point = map.coordinateToContainerPoint(center);
            happen.mousedown(eventContainer, {
                'clientX':point.x,
                'clientY':point.y
            });
            happen.mouseup(eventContainer);
            setTimeout(function() {
                moveTransformControl();
            }, 100);
        }, 100);
    });

    it('xyz scale', (done) => {
        const gltflayer = new maptalks.GLTFLayer('transform');
        const groupgllayer = new maptalks.GroupGLLayer('gl', [gltflayer], {sceneConfig}).addTo(map);
        const marker = new maptalks.GLTFGeometry(center, {
            symbol: {
                scaleX: 2 / 3,
                scaleY: 2 / 3,
                scaleZ: 2 / 3
            }
        }).addTo(gltflayer);
        const transformControl = new maptalks.TransformControl({ mode: 'xyzScale' });
        transformControl.addTo(map);
        transformControl.on('transforming', e => {
            marker.setTRS(e.translate, e.rotation, e.scale);
        });

        map.on('mousedown', e => {
            const identifyData = groupgllayer.identify(e.coordinate);
            if (identifyData.length) {
                transformControl.enable();
                transformControl.transform(identifyData[0].data);
            } else if (!transformControl.picked(e.coordinate)) {
                transformControl.disable();
            }
        });
        function moveTransformControl() {
            const point = map.coordinateToContainerPoint(center).add(100, 0);
            happen.mousemove(eventContainer, {
                'clientX':point.x,
                'clientY':point.y
            });
            happen.mousedown(eventContainer, {
                'clientX':point.x,
                'clientY':point.y
            });
            for (let i = 0; i < 10; i++) {
                happen.mousemove(eventContainer, {
                    'clientX':point.x + i,
                    'clientY':point.y
                });
            }
            happen.mouseup(eventContainer);
            setTimeout(function() {
                const newCoord = marker.getCoordinates();
                expect(newCoord.x).to.be.eql(0);
                expect(newCoord.y).to.be.eql(0);
                const scale = marker.getScale();
                expect(scale).to.be.eql([0.7598385662453444, 0.6666666666666666, 0.6666666666666666]);
                done();
            }, 100);
        }
        setTimeout(function() {
            const point = map.coordinateToContainerPoint(center);
            happen.mousedown(eventContainer, {
                'clientX': point.x,
                'clientY': point.y
            });
            happen.mouseup(eventContainer);
            moveTransformControl();
        }, 100);
    });

    it('transform several targets', (done) => {
        const gltflayer = new maptalks.GLTFLayer('transform');
        const groupgllayer = new maptalks.GroupGLLayer('gl', [gltflayer], {sceneConfig}).addTo(map);
        const symbol = {
            scaleX: 2 / 3,
            scaleY: 2 / 3,
            scaleZ: 2 / 3
        }
        const marker1 = new maptalks.GLTFGeometry(center.add(-0.001, 0), {
            symbol
        }).addTo(gltflayer);
        const marker2 = new maptalks.GLTFGeometry(center, {
            symbol
        }).addTo(gltflayer);
        const marker3 = new maptalks.GLTFGeometry(center.add(0.001, 0), {
            symbol
        }).addTo(gltflayer);
        const transformControl = new maptalks.TransformControl();
        transformControl.addTo(map);
        transformControl.on('transforming', e => {
            marker.setTRS(e.translate, e.rotation, e.scale);
        });

        map.on('mousedown', e => {
            const identifyData = groupgllayer.identify(e.coordinate);
            if (identifyData.length) {
                transformControl.enable();
                transformControl.transform([marker1, marker2, marker3]);
            } else if (!transformControl.picked(e.coordinate)) {
                transformControl.disable();
            }
        });
        function moveTransformControl() {
            const point = map.coordinateToContainerPoint(center).add(50, 0);
            happen.mousedown(eventContainer, {
                'clientX':point.x,
                'clientY':point.y
            });
            for (let i = 0; i < 20; i++) {
                happen.mousemove(eventContainer, {
                    'clientX':point.x + i,
                    'clientY':point.y
                });
            }
            happen.mouseup(eventContainer);
            setTimeout(function() {
                const newCoord = marker1.getCoordinates();
                expect(newCoord.x).to.be.eql(-0.0007961521148445172);
                expect(newCoord.y).to.be.eql(0);

                const newCoord2 = marker2.getCoordinates();
                expect(newCoord2.x).to.be.eql(0.00020384788513183594);
                expect(newCoord2.y).to.be.eql(0);

                const newCoord3 = marker3.getCoordinates();
                expect(newCoord3.x).to.be.eql(0.001203847885108189);
                expect(newCoord3.y).to.be.eql(0);
                done();
            }, 100);
        }
        setTimeout(function() {
            const point = map.coordinateToContainerPoint(center);
            happen.mousedown(eventContainer, {
                'clientX': point.x,
                'clientY': point.y
            });
            happen.mouseup(eventContainer);
            moveTransformControl();
        }, 100);
    });
});