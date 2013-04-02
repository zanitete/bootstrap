/*
 * dropdown - Provides dropdown menu functionality in place of bootstrap js. Accepts attribute of
 * 'drop-from' to specify from which corner the dropdown is displayed. Default value is 'bottom left'.
 * @restrict class or attribute
 * @example:
   <a class="dropdown" drop-from="top right">
     My Dropdown Menu
     <ul>
       <li ng-repeat="choice in dropChoices">
         <a ng-href="{{choice.href}}">{{choice.text}}</a>
       </li>
     </ul>
   </a>
 */

angular.module('ui.bootstrap.dropdownToggle', []).directive('dropdown',
  ['$document', '$location', '$window', function ($document, $location, $window) {
  var activeConfig,
      activeClass = 'is-active',
      menuCss     = {
        display: 'block',
        position: 'absolute',
        left: '-9999px',
        top: '-9999px'
      };

  function processDropFrom(attrs) {
    var from = { x: 'left', y: 'bottom' };
    if (!attrs.dropFrom)
      return from;
    var split = attrs.dropFrom.split(' ');
    while (split.length) {
      var bit = split.pop();
      if (bit === 'top')
        from.y = bit;
      if (bit === 'right')
        from.x = bit;
    }
    return from;
  }

  function getDimensions(element) {
    return {
      width:  element.prop('offsetWidth'),
      height: element.prop('offsetHeight')
    };
  }

  function getOffset(element) {
    var boundingClientRect = element[0].getBoundingClientRect();
    return {
      top:  boundingClientRect.top  + $window.pageYOffset,
      left: boundingClientRect.left + $window.pageXOffset
    };
  }

  function setMenuPosition() {
    if (!activeConfig) { return false; }
    var position             = {};
    var menuDimensions       = getDimensions(activeConfig.menu);
    var relativeToOffset     = getOffset(activeConfig.relativeTo);
    var relativeToDimensions = getDimensions(activeConfig.relativeTo);
    if (activeConfig.dropFrom.y === 'bottom')
      position.top = relativeToOffset.top + relativeToDimensions.height;
    else if (activeConfig.dropFrom.y === 'top')
      position.top = relativeToOffset.top - menuDimensions.height;
    if (activeConfig.dropFrom.x === 'left')
      position.left = relativeToOffset.left;
    else if (activeConfig.dropFrom.x === 'right')
      position.left = relativeToOffset.left + relativeToDimensions.width - menuDimensions.width;
    activeConfig.menu.css(position);
  }

  function clearMenuPosition() {
    if (!activeConfig) { return false; }
    activeConfig.menu.css({ left:'-9999px', top:'-9999px' });
  }

  function openMenu(config) {
    activeConfig = config;
    setMenuPosition();
    config.element.addClass(activeClass);
  }

  function closeMenu(e) {
    if (!activeConfig) { return false; }
    if (event) { event.stopPropagation(); }
    activeConfig.element.removeClass(activeClass);
    clearMenuPosition();

    activeConfig = undefined;
  }

  $document.bind('click', closeMenu);
  angular.element($window).bind('resize', setMenuPosition);

  return {
    restrict: 'CA',
    link: function(scope, element, attrs) {
      var config = {
        element:    element,
        menu:       element.find('ul').css(menuCss),
        relativeTo: element.parent(),
        dropFrom:   processDropFrom(attrs)
      };
      angular.element(document.body).append(config.menu);

      element.bind('click', clickHandler);
      element.parent().bind('click', closeMenu);
      scope.$watch('$location.path', closeMenu);

      function clickHandler(e) {
        e.stopPropagation();
        var activeElement = !!activeConfig ? activeConfig.element : null;
        if (activeElement) { closeMenu(); }
        if (element !== activeElement) { openMenu(config); }
      }
    }
  };
}]);