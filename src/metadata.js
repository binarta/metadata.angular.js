'use strict';

(function() {
    angular.module('metadata', ['angularx', 'rest.client'])
        .factory('metadata', ['restServiceHandler', '$q', MetadataServiceFactory]);

    function MetadataServiceFactory(restServiceHandler, $q) {
        return new MetadataService(restServiceHandler, $q);
    }
    function MetadataService(rest, $q) {
        var self = this;

        var promises = [
            get('metadata-system.json'),
            get('metadata-app.json')
        ];

        self.promise = $q.all(promises).then(function(data) {
            return data.reduce(function(p,c) {
                return angular.merge({}, p, c)
            }, {});
        });

        function get(url) {
            return rest({
                params: {
                    method:'GET',
                    url:url
                }
            }).then(undefined, function() {
                return $q.when({});
            })
        }
    }
    MetadataService.prototype.getMessages = function() {
        return this.promise.then(function(metadata) {
            return metadata.msgs;
        })
    }
})();