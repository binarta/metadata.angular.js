describe('metadata', function() {
    var rest, $rootScope, deferreds;

    angular.module('checkpoint', []);

    beforeEach(module('metadata'));
    beforeEach(module('angularx'));
    beforeEach(module('rest.client'));

    beforeEach(inject(function(restServiceHandler, _$rootScope_, $q) {
        deferreds = [];
        rest = restServiceHandler;
        rest.andCallFake(function() {
            var def = $q.defer();
            deferreds.push(def);
            return def.promise;
        });
        $rootScope = _$rootScope_
    }));

    describe('MetadataService', function() {
        var service, appPromise, systemPromise;

        beforeEach(inject(function(metadata, $q) {
            service = metadata;
            systemPromise = deferreds[0];
            appPromise = deferreds[1];
        }));

        it('system metadata is retrieved', function() {
            expect(rest.calls[0].args[0].params).toEqual({
                method:'GET',
                url:'metadata-system.json'
            })
        });

        it('app metadata is retrieved', function() {
            expect(rest.calls[1].args[0].params).toEqual({
                method:'GET',
                url:'metadata-app.json'
            })
        });

        describe('when installing on the promise', function() {
            var data;

            beforeEach(function() {
                data = undefined;
                service.promise.then(function(d) {
                    data = d;
                })
            });

            describe('and system promise is resolved', function() {
                beforeEach(function() {
                    systemPromise.resolve({a:'a'});
                    $rootScope.$digest();
                });

                it('data is still empty', function() {
                    expect(data).toBeUndefined();
                });

                describe('and app promise is resolved', function() {
                   beforeEach(function() {
                       appPromise.resolve({b:'b'});
                       $rootScope.$digest();
                   });

                    it('the promises are merged into a single payload', function() {
                        expect(data).toEqual({a:'a', b:'b'});
                    })
                });
            });
        });

        describe('when retrieving messages', function() {
            var messages;

            beforeEach(function() {
                service.getMessages().then(function(m) {
                    messages = m;
                });
                appPromise.resolve({msgs:{a:'a'}});
                systemPromise.resolve({msgs:{b:'b'}});
                $rootScope.$digest();
            });

            it('messages from metadata are returned', function() {
                expect(messages).toEqual({a:'a', b:'b'});
            })
        });

        describe('when one of the files is not available', function() {
            var messages;

            beforeEach(function() {
                service.getMessages().then(function(m) {
                    messages = m;
                });
                appPromise.reject('notFound');
                systemPromise.resolve({msgs:{b:'b'}});
                $rootScope.$digest();
            });

            it('messages from single metadata file are returned', function() {
                expect(messages).toEqual({b:'b'});
            });
        });
    });
});