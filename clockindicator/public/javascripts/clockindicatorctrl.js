var app = angular.module('ClockIndicator', ['chart.js', 'ngResource']);
app.factory('clockIndicatorResourceService', function ($resource) {
    return $resource('/clockindicator/:id'); // Note the full endpoint address
});
app.controller("ClockIndicatorInputCtrl", ['$scope', 'clockIndicatorResourceService', function ($scope, cirs) {
    //nothing select to be edit
    $scope.selectedkey = -1;
    $scope.config = {};
    $scope.charts = [];
    $scope.load = function () {
        var oldvalue = "";
        var max = 10;
        for (i = 0; i < 10; i++) {
            cirs.get({ id: i }, function (variable) {
                $scope.config[variable.id] = variable;
                if (($scope.config).length == max) {
                    $scope.$broadcast('variables_loaded');
                }
            });
        }
    }
    $scope.clicked = function(i) {
        $scope.selectedkey = i;
        oldvalue = JSON.stringify($scope.config[i]);
        $("#modalconfig").modal();
    }
    $('#modalconfig').on('hidden.bs.modal', function (e) {
        //now update resource if need
        if (JSON.stringify($scope.config[$scope.selectedkey]) !== oldvalue) {
            cirs.save({ id: $scope.config[$scope.selectedkey].id }, $scope.config[$scope.selectedkey]);
        }
        $scope.selectedkey = -1;
    });
    $scope.$watch('config', function (newValue, oldValue, scope) {
        if (($scope.selectedkey >= 0) && oldValue[$scope.selectedkey] != null) {
            if (JSON.stringify(oldValue[$scope.selectedkey]) !== JSON.stringify(newValue[$scope.selectedkey])) {
                //chart exists need update
                if ($scope.charts[$scope.selectedkey]) {
                    $scope.charts[$scope.selectedkey].update();
                    console.log('update called', $scope.selectedkey);
                }
            }
        }
    }, true);
    $scope.$on('variables_loaded', function () {
        for (var i = 0; i < $scope.charts.length; i++) {
            $scope.charts[i].update();
        }
    });
}]);
app.controller("ClockIndicatorCtrl", ['$scope', 'clockIndicatorResourceService', function ($scope) {
    var getConf = function (canvasId) {
        //config have changed, try redraw
        var conf = $scope.config[canvasId];
        if(!conf)
          return -1;
        var max = conf.max;
        var min = conf.min;
        var actual = conf.actual;
        var howtoshow = conf.howtoshow;
        var pi_name = conf.pi_name;
        var pi_unit = conf.pi_unit;
        var lastyear = conf.lastyear;
        var target = conf.target;
        var drawlastyear = conf.drawlastyear;
        var drawtarget = conf.drawtarget;
        var style = "decimal";
        if (howtoshow === 'absolute') {
        } else if (howtoshow === 'relativetotarget') {
            actual /= target;
            style = "percent";
            pi_unit = "درصد تحقق";
        } else if (howtoshow === 'relativetolastyear') {
            actual /= lastyear;
            style = "percent";
            pi_unit = "درصد پیشرفت";
        } else if (howtoshow === 'deviation') {
            actual = (actual - target) / target;
            style = "percent";
            pi_unit = "درصد انحراف";
        }
        if (drawlastyear) {

        }
        //target niddle
        if (drawtarget) {

        }
        return { max: max, min: min, actual: actual, style: style, howtoshow: howtoshow, pi_name: pi_name, pi_unit: pi_unit, drawlastyear: drawlastyear, drawtarget: drawtarget, target: target, lastyear: lastyear};
    }
    var originalDraw = Chart.controllers.doughnut.prototype.draw;
    var calc = function (chart) {
        var ctx = chart.ctx;
        var left = chart.chartArea.left;
        var right = chart.chartArea.right;
        var top = chart.chartArea.top;
        var bottom = chart.chartArea.bottom;
        var centerx = (left + right) / 2 + chart.offsetX;
        var centery = (top + bottom) / 2 + chart.offsetY;
        var radius = chart.outerRadius;
        var width = chart.outerRadius - chart.innerRadius;
        var size = [7 + Math.floor(0.75 * width), Math.floor(1.6 * width), 9 + Math.floor(0.5 * width)]; //calc text size
        size[3]=2 + size[2]*0.6;
        return [ctx, left, right, top, bottom, centerx, centery, radius, width, size];
    }
    var addtext = function (chart, conf) {
        [ctx, left, right, top, bottom, centerx, centery, radius, width, size] = calc(chart);
        ctx.fillStyle = "#cfd2da";
        ctx.textAlign = "center";
        ctx.font = size[2] + "px Yekan";
        ctx.fillText(conf.pi_name , centerx, centery + size[2] * 0.8);
        ctx.font = size[3] + "px Yekan";
        ctx.fillText(conf.pi_unit, centerx, centery + size[3] + size[2] * 0.8);
        ctx.font = size[1] + "px WWDigital";
        ctx.fillText(conf.actual.toLocaleString('en-US', { maximumSignificantDigits: 5, useGrouping: true, style: conf.style}), centerx, centery - size[1] * 0.8);
        ctx.font = size[2] + "px WWDigital";
        ctx.textAlign = "left";
        ctx.fillText(conf.min.toLocaleString('en-US', {maximumSignificantDigits: 5, useGrouping: true}), left, centery + size[2]);
        ctx.textAlign = "right";
        ctx.fillText(conf.max.toLocaleString('en-US', {maximumSignificantDigits: 5, useGrouping: true}), right, centery + size[2]);
    }
    var addniddle = function (chart, conf) {
        if (!isValid(conf))
            return;
        [ctx, left, right, top, bottom, centerx, centery, radius, width, size] = calc(chart);
        //niddles
        var drawaniddle = function (teta, strokeStyle) {
            var cop = $scope.options.cutoutPercentage / 100;
            ctx.beginPath();
            if (size[0]>30) {
                    ctx.lineWidth = 2.5;
            } else if (size[0] > 20) {
                    ctx.lineWidth = 1.5;
            } else {
                    ctx.lineWidth = 1;
            } 
            ctx.moveTo(centerx, centery);
            ctx.lineTo(centerx - (radius * cop) * Math.cos(teta + 0.02), centery - (radius * cop) * Math.sin(teta + 0.02));
            ctx.lineTo(centerx - radius * Math.cos(teta), centery - radius * Math.sin(teta));
            ctx.moveTo(centerx, centery);
            ctx.lineTo(centerx - (radius * cop) * Math.cos(teta - 0.02), centery - (radius * cop) * Math.sin(teta - 0.02));
            ctx.lineTo(centerx - radius * Math.cos(teta), centery - radius * Math.sin(teta));
            ctx.strokeStyle = strokeStyle;
            ctx.stroke();
        }
        //semi niddles
        var drawasmniddle = function (value, strokeStyle, number_of_lines) {
            var delta = 0.004 * (number_of_lines -1 );
            teta = Math.PI / (conf.max - conf.min) * (value - conf.min);
            ctx.beginPath();
            if (size[0]>30) {
                    ctx.lineWidth = 1.5;
            } else if (size[0] > 20) {
                    ctx.lineWidth = 1;
            } else {
                    ctx.lineWidth = 0.5;
            } 
            var delta_ = -1 * delta;
            while (delta_ <= delta) {
                ctx.moveTo(centerx - (radius * $scope.options.cutoutPercentage/100) * Math.cos(teta + delta_), centery - (radius * $scope.options.cutoutPercentage/100) * Math.sin(teta + delta_));
                ctx.lineTo(centerx - radius * Math.cos(teta + delta_), centery - radius * Math.sin(teta + delta_));
                delta_ += 0.008;
            }
            ctx.strokeStyle = strokeStyle;
            ctx.stroke();
            ctx.font = size[2] + "px WWDigital";
            ctx.fillText(value.toLocaleString('en-US', {minimumSignificantDigits: 3, maximumSignificantDigits: 6, useGrouping: true}), centerx - radius * Math.cos(teta) + size[2], centery - radius * Math.sin(teta) - size[2] * 0.3);
        }
        //last year niddle
        if (conf.howtoshow === 'absolute' && conf.drawlastyear) {
            drawasmniddle(conf.lastyear, "GreenYellow", 1);
        }
        //target niddle
        if (conf.howtoshow === 'absolute' && conf.drawtarget) {
            drawasmniddle(conf.target, "GreenYellow", 2);
        }
        //actual niddle
        teta = Math.PI / (conf.max - conf.min) * (conf.actual - conf.min);
        drawaniddle(teta, "GreenYellow");
        //niddle hole
        ctx.beginPath();
        ctx.arc(centerx, centery, ctx.lineWidth*2, 0, 2 * Math.PI);
        ctx.stroke();
    };
    var firstload = {};
    var isValid = function(conf) {
        if (conf.actual >= conf.min && conf.actual <= conf.max) {
            return true;
        } else {
            return false;
        }
    }
    Chart.controllers.doughnut.prototype.draw = function (ease) {
        canvasId = this.chart.canvas.id;
        key = this.chart.canvas.attributes['key'].value;
        if (firstload[canvasId] !== 0) {
            $scope.charts[canvasId] = this.chart;
            var _canvasId = canvasId;
            var _key = key;
            var _this = this
            setTimeout(function () {
                var conf = getConf(_key);
                if (conf == -1) {
                    console.log('error, cant load conf');
                    return;
                }
                originalDraw.call(_this, ease);
                if (_this.chart.options.customize) {
                        addtext(_this.chart, conf);
                        //niddle on front
                        addniddle(_this.chart, conf);
                        firstload[_canvasId] = 0;
                };
            }, 500)
        } else {
            var conf = getConf(key);
            if (conf === -1) {
                console.log('error, cant load conf');
                return;
            }
            originalDraw.call(this, ease);
            if (this.chart.options.customize) {
                addtext(this.chart, conf);
                //niddle on front
                addniddle(this.chart, conf);
            };
        }
    };
    $scope.data = [[30, 30, 30]];
    $scope.datasetOverride = [
        {
            backgroundColor: [
                "#0077b3",
                "#006699",
                "#005580"
            ],
            borderWidth: 2,
            borderColor: "Black",
            hoverBackgroundColor: [
                "#0077b3",
                "#006699",
                "#005580"
            ],
            hoverBorderWidth: 2,
        }
    ];
    $scope.options = {
        cutoutPercentage: 80,
        rotation: -3.1415926535898,
        circumference: 3.1415926535898,
        legend: {
            display: false
        },
        tooltips: {
            enabled: false
        },
        layout: {
            padding: 10
        },
        title: {
            display: true,
            position: 'bottom'
        },
        customize: true,
        aspectRatio: 4/3, //in version 2.7.0 default aspect ration is 2
        //responsive: false, //uncomment if you dont want responsivity
        animation: false, //uncomment if you dont like animation, when i turn off anim hard referesh makes text to disappear

    };
}]);