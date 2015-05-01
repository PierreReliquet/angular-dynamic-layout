(function(window, document, undefined) {
  'use strict';

  angular.module('pierrereliquet.angular-dynamic-layout', [])
  .service('prUtils', Utils)
  .constant('prDraggableElement', 'pr-draggable-element')
  .directive('prGrid', GridContainer);

  function Utils() {
    this.cancelEvent = function(e) {
      if(e.stopPropagation) {
        e.stopPropagation();
      }
      if(e.preventDefault) {
        e.preventDefault();
      }
      e.cancelBubble=true;
      e.returnValue=false;
      return false;
    };

    this.toArray = function(input) {
      if(input && typeof input.length !== 'undefined') {
        return Array.prototype.slice.call(input);
      } else {
        throw new Error('The provided value cannot be converted to array', input);
      }
    };
  }

  GridContainer.$inject = ['$document', 'prUtils', 'prDraggableElement'];
  function GridContainer(document, Utils, GridElementAttr) {
    return {
      restrict: 'A',
      link: linkingFunction,
      scope: {
        configuration: '='
      }
    };

    function linkingFunction(scope, container) {
      var rawElm = container[0];
      var lastMouseLocation;
      var movingItem;
      var items = {};

      // The mouseup has to be detected on the document to avoid having
      // trouble with a mouseup fired outside of the container which would leave
      // the grid in moving state.
      document.on('mouseup', stopDrag);

      Utils.toArray(rawElm.querySelectorAll('[' + GridElementAttr + ']'))
      .forEach(function(item) {
        // If no id or if the id is not unique
        if (!item.id || items[item.id]) {
          throw new Error('The ' + GridElementAttr + ' should have a unique id');
        }
        items[item.id] = item;

        // The startDrag function is bound to be able to provide easily
        // the item associated with the mousedown since it is not necessarily
        // the target of the mousedown event.
        angular.element(item).on('mousedown', startDrag.bind(null, item));
      });

      function startDrag(item, e) {
        movingItem = item;
        lastMouseLocation = {
          x: e.pageX,
          y: e.pageY
        };
        // The mousemove is registered on the container to listen to all mousemove
        // and not only the one triggered on the pr-draggable-element.
        container.on('mousemove', onDrag);
      }

      function stopDrag() {
        movingItem = undefined;
        // Unregister the mousemove listener to stop moving the pr-draggable-element
        container.off('mousemove', onDrag);
      }

      function onDrag(e) {
        // Let's compute the delta with last known mouse position to be able
        // to relocate properly the element on the page
        var deltaX = e.pageX - lastMouseLocation.x;
        var deltaY = e.pageY - lastMouseLocation.y;
        lastMouseLocation = {
          x: e.pageX,
          y: e.pageY
        };

        movingItem.style.left = parseInt(movingItem.style.left, 10) + deltaX + 'px';
        movingItem.style.top = parseInt(movingItem.style.top, 10) + deltaY + 'px';
        return Utils.cancelEvent(e);
      }
    }
  }
})(window, document);
