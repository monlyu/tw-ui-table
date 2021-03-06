(function() {
    'use strict';
    angular.module('tw.ui.table', ['ngMaterial'])
        .directive('twUiTable', function() {
            var controller = [
                '$scope', '$filter', '$mdDialog',
                function($scope, $filter, $mdDialog) {
                    $scope.defaultDateFormat = $scope.defaultDateFormat || 'MM/dd/yyyy';
                    $scope.selectedItems = $scope.selectedItems || [];
                    $scope.selectOnClick = $scope.selectOnClick || false;

                    var onSelectionChanged = function() {
                        if ($scope.selectionChanged) {
                            $scope.selectionChanged();
                        }
                    };

                    $scope.$watchCollection('selectedItems', onSelectionChanged);

                    $scope.isItemSelected = function(item) {
                        return $scope.selectedItems.indexOf(item) > -1;
                    };

                    $scope.toggleItemSelected = function(item) {
                        var idx = $scope.selectedItems.indexOf(item);
                        if (idx > -1) {
                            $scope.selectedItems.splice(idx, 1);
                        } else {
                            $scope.selectedItems.push(item);
                        }
                    };

                    $scope.onItemClicked = function(item) {
                        if ($scope.selectOnClick) {
                            $scope.selectedItems = [item];
                        }

                        if ($scope.itemClicked) {
                            $scope.itemClicked(item);
                        }
                    };

                    $scope.showTooltip = function(ev, text) {
                        $mdDialog.show(
                            $mdDialog.alert()
                            .targetEvent(ev)
                            .clickOutsideToClose(true)
                            .textContent(text)
                            .ok('close')
                        );
                    };

                    $scope.toggleAll = function() {
                        if ($scope.allAreSelected()) {
                            $scope.selectedItems = [];
                        } else {
                            angular.forEach($scope.data, function(item) {
                                if ($scope.selectedItems.indexOf(item) < 0) {
                                    $scope.selectedItems.push(item);
                                }
                            });
                        }
                    };

                    $scope.allAreSelected = function() {
                        return $scope.selectedItems.length == $scope.data.length;
                    }

                    $scope.getCellText = function(item, column) {

                        if (!column) {
                            throw 'column definition is not defined.';
                        }

                        if (!column.path) {
                            throw 'path must be set, in: ' + column;
                        }

                        var paths = column.path.split('.');
                        var pathIndex = 0;
                        var columnValue = item;
                        while (pathIndex < paths.length && columnValue) {
                            columnValue = columnValue[paths[pathIndex]];
                            pathIndex++;
                        }

                        if (!columnValue) {
                            return '';
                        }

                        if (column.dataType === 'date') {
                            var format = column.dateFormat || $scope.defaultDateFormat;
                            columnValue = $filter('date')(new Date(columnValue), format);
                        }

                        return columnValue;
                    };
                }
            ];

            return {
                restrict: 'E',
                scope: {
                    data: '=',
                    columns: '=',
                    selectable: '=',
                    selectedItems: '=?',
                    selectionChanged: '=?',
                    itemClicked: '=?',
                    selectOnClick: '=?',
                    defaultDateFormat: '@?',
                    compact: '=?',
                    hideHeader: '='
                },
                controller: controller,
                template: '<table ng-class=\"{\'selectable\':selectable}\"><thead ng-if=\"!hideHeader\"><tr><th ng-if=\"selectable\"><md-checkbox aria-label=\"check all\" ng-checked=\"allAreSelected()\" ng-click=\"toggleAll()\"></th><th ng-if=\"!compact||!column.optional\" ng-class=\"{\'numeric\':column.numeric}\" ng-repeat=\"column in columns\">{{column.title}}</th></tr></thead><tbody><tr ng-class=\"{\'selected\':isItemSelected(item), \'clickable\':itemClicked}\" ng-repeat=\"item in data\"><td ng-if=\"selectable\"><md-checkbox aria-label=\"select\" ng-checked=\"isItemSelected(item)\" ng-click=\"toggleItemSelected(item)\"></td><td ng-if=\"!compact||!column.optional\" ng-repeat=\"column in columns\" ng-class=\"{\'numeric\':column.numeric}\" ng-click=\"onItemClicked(item)\"><span ng-if=\"!column.tooltipPath||!item[column.tooltipPath]\">{{getCellText(item, column)}}</span> <span ng-if=\"column.tooltipPath && item[column.tooltipPath]\" ng-click=\"showTooltip($event, item[column.tooltipPath])\" class=\"has-tooltip\">{{getCellText(item, column)}}</span></td></tr></tbody></table>'
            };
        });
})();
