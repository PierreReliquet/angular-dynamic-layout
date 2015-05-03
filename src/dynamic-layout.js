(function(window, document, undefined) {
  'use strict';

  if (!window.prDynamicLayout) {
    window.prDynamicLayout = {};
  } else {
    throw new Error('Conflicting library with window.prDynamicLayout variable');
  }

  var prDynamicLayout = window.prDynamicLayout;
  prDynamicLayout.draggableElmAttr = 'pr-draggable-element';
  prDynamicLayout.dragHandleAttr = 'pr-drag-handle';
  prDynamicLayout.dynamicLayout = DynamicLayout;

  var Utils = prDynamicLayout.Utils = {
    /**
     * Cancels the provided event.
     * Optionally it may cancel the event immediately which indicates that
     * it would not even be fired to the next listener on the same element.
     * @param {Object} e the event to cancel
     * @param {Boolean} stopImmediately indicates whether or not the handlers
     *                  should be cancelled immediately
     */
    cancelEvent: function(e, stopImmediately) {
      if(e.stopPropagation) {
        e.stopPropagation();
      }
      if(e.preventDefault) {
        e.preventDefault();
      }
      if (stopImmediately && e.stopImmediatePropagation) {
        e.stopImmediatePropagation();
      }
      e.cancelBubble=true;
      e.returnValue=false;
      return false;
    },

    /**
     * Converts the input to an array if it is array-like.
     * The object is considered an array if it as a length property.
     * @param {Object} input an array like object
     */
    toArray: function(input) {
      if(input && typeof input.length !== 'undefined') {
        return Array.prototype.slice.call(input);
      } else {
        throw new Error('The provided value cannot be converted to array', input);
      }
    },

    dispatchEvent: function(elm, eventName, dataField, data) {
      var event = document.createEvent('Event');

      // Define that the event name is 'build'.
      event.initEvent(eventName, true, true);
      event[dataField] = data;

      // target can be any Element or other EventTarget.
      elm.dispatchEvent(event);
    },

    getDimension: function(elm) {
      if (typeof elm === 'string') {
        elm = document.querySelector(elm);
      }
      var styles = window.getComputedStyle(elm);
      return {
        width: parseInt(styles.width, 10),
        height: parseInt(styles.height, 10)
      };
    },

    setStyle: function(elm, style) {
      Object.keys(style).forEach(function(key) {
        elm.style[key] = style[key];
      });
    }
  };

  function DynamicLayout(container, configuration) {
    // I am not a huge fan of using self = this however I had trouble with
    // the bind function because it does not allow to removeEventListener
    // since the browser is not capable of detecting that the function bound to the
    // event listener is a proxy made through bind.
    var self = this;

    // Private variables
    self.$$movingItem = undefined;
    self.$$items = {};

    /**
     * Initializes the items by checking the existence of an ID and its unicity.
     * Also adds an event listener for the mousedown to be able to drag elements.
     */
    this.initializeItem = function(item) {
      // If no id or if the id is not unique
      if (!item.id || self.$$items[item.id]) {
        throw new Error('The ' + prDynamicLayout.draggableElmAttr + ' should have a unique id');
      }
      self.$$items[item.id] = item;

      // /!\ Inside the startDrag function the this is not bound and is going
      // to refer the element 'item' to which the event listener is attached.
      item.addEventListener('mousedown', self.startDrag);
    };

    this.startDrag = function(e) {
      // If the clicked element does not have the handle it means that it is not draggable.
      if (!e.target.hasAttribute(prDynamicLayout.dragHandleAttr)) {
        return;
      }
      // Here we just check that the this is as expected which means an HTMLElement
      if (!(this instanceof window.HTMLElement)) {
        throw new Error('The startDrag function should be only called through callback');
      }
      self.$$movingItem = this;

      // The mousemove is registered on the container to listen to all mousemove
      // and not only the one triggered on the pr-draggable-element.
      container.addEventListener('mousemove', self.onDrag);
    };

    this.stopDrag = function() {
      self.$$movingItem = undefined;
      // Unregister the mousemove listener to stop moving the pr-draggable-element
      container.removeEventListener('mousemove', self.onDrag);

      // Here we need to be able to dispatch an event to forward the new layout configuration
      Utils.dispatchEvent(container, 'pr-dynamic-layout', 'foo', {foo: 'bar'});
    };

    this.onDrag = function(e) {
      // Let's compute the delta with last known mouse position to be able
      // to relocate properly the element on the page
      Utils.setStyle(self.$$movingItem, {
        left: parseInt(self.$$movingItem.style.left, 10) + e.movementX + 'px',
        top: parseInt(self.$$movingItem.style.top, 10) + e.movementY + 'px'
      });
      return Utils.cancelEvent(e);
    };

    // Proper initialisation

    // The mouseup has to be detected on the document to avoid having
    // trouble with a mouseup fired outside of the container which would leave
    // the grid in moving state.
    document.addEventListener('mouseup', self.stopDrag);

    Utils.toArray(container.querySelectorAll('[' + prDynamicLayout.draggableElmAttr + ']'))
    .forEach(self.initializeItem);

  }
})(window, document);
