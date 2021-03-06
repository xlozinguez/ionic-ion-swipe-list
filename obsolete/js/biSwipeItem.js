/**
 * @ngdoc directive
 * @name ionBiSwipeItem
 * @parent ionic.directive:ionBiSwipeList
 * @module ionic
 * @restrict E
 * Creates a list-item that can easily be swiped,
 * deleted, reordered, edited, and more.
 *
 * @usage
 *
 * ```html
 * <ion-biswipe-list>
 *   <ion-biswipe-item>Hello!</ion-biswipe-item>
 *   <ion-biswipe-item href="#/detail">
 *     Link to detail page
 *   </ion-biswipe-item>
 * </ion-biswipe-list>
 * ```
 */
IonicModule
    .directive('ionBiSwipeItem', ['$$rAF',
        function($$rAF) {
            return {
                restrict: 'E',
                controller: ['$scope', '$element',
                    function($scope, $element) {
                        this.$scope = $scope;
                        this.$element = $element;
                    }
                ],
                scope: true,
                compile: function($element, $attrs) {
                    var isAnchor = isDefined($attrs.href) ||
                        isDefined($attrs.ngHref) ||
                        isDefined($attrs.uiSref);
                    var isComplexItem = isAnchor ||
                        //Lame way of testing, but we have to know at compile what to do with the element
                        /ion-(delete|option|reorder)-button/i.test($element.html());

                    if (isComplexItem) {
                        var innerElement = jqLite(isAnchor ? '<a></a>' : '<div></div>');
                        innerElement.addClass('item-content');

                        if (isDefined($attrs.href) || isDefined($attrs.ngHref)) {
                            innerElement.attr('ng-href', '{{$href()}}');
                            if (isDefined($attrs.target)) {
                                innerElement.attr('target', '{{$target()}}');
                            }
                        }

                        innerElement.append($element.contents());

                        $element.addClass('item item-complex')
                            .append(innerElement);
                    } else {
                        $element.addClass('item');
                    }

                    return function link($scope, $element, $attrs) {
                        $scope.$href = function() {
                            return $attrs.href || $attrs.ngHref;
                        };
                        $scope.$target = function() {
                            return $attrs.target;
                        };

                        var content = $element[0].querySelector('.item-content');
                        if (content) {
                            $scope.$on('$collectionRepeatLeave', function() {
                                if (content && content.$$ionicOptionsOpen) {
                                    content.style[ionic.CSS.TRANSFORM] = '';
                                    content.style[ionic.CSS.TRANSITION] = 'none';
                                    $$rAF(function() {
                                        content.style[ionic.CSS.TRANSITION] = '';
                                    });
                                    content.$$ionicOptionsOpen = false;
                                }
                            });

                            // Prevents the click event to propagate if the option button is opened
                            $element.on('click', function(event) {
                                if (content && content.$$ionicOptionsOpen) {
                                    var self = this;
                                    event.preventDefault();

                                    content.style[ionic.CSS.TRANSFORM] = '';
                                    content.$$ionicOptionsOpen = false;

                                    setTimeout(function() {
                                        var optionButtons = self.querySelectorAll('div[class*="item-options"]');
                                        for (var i = 0; i < optionButtons.length; i++) {
                                            optionButtons[i].classList.add('invisible');
                                        }
                                    }, 250);
                                }
                            });
                        }
                    };

                }
            };
        }
    ]);