(function(window, document, undefined) {
  'use strict';

  angular.module('pierrereliquet.angular-dynamic-layout', [])
  .service('prUtils', window.prDynamicLayout.Utils)
  .constant('prDraggableElement', window.prDynamicLayout.draggableElmAttr)
  .constant('prDragHandle', window.prDynamicLayout.dragHandleAttr)
  .directive('prGrid', GridContainer);

  function GridContainer() {
    return {
      restrict: 'A',
      scope: {
        configuration: '='
      },
      link: function($scope, $elm) {
        $scope.$watch('configuration', function(newValue) {
          if (newValue !== undefined) {
            window.prDynamicLayout.dynamicLayout($elm[0], newValue);
          }
        });
        window.prDynamicLayout.dynamicLayout($elm[0]);
      }
    };
  }
})(window, document);
