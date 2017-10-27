var app = angular.module('ClockIndicator', ['chart.js']);
angular.module('ClockIndicator').controller("ClockIndicatorInputCtrl", ['$scope', function ($scope) {
    //initial values
    $scope.config = [];
    $scope.selectedkey = 0;
    for (i=0;i<10; i++) {
      $scope.config[i] = {
          min : 2000,
          max : 8000,
          pi_name : "مدت توقف",
          pi_unit : "روز",
      };
      conf = $scope.config[i];
      conf.actual = (conf.min + conf.max) / 2;
      conf.target = (conf.actual + conf.max) / 2;
      conf.lastyear = (conf.actual + conf.min) / 2;
      conf.howtoshow = 'absolute';//relativetotarget relativetolastyear deviation
      conf.drawlastyear = true;
      conf.drawtarget = true;
    }
    $scope.clicked = function(i) {
        $scope.selectedkey = i;
        $("#modalconfig").modal();
    }
}]);
angular.module('ClockIndicator').controller("ClockIndicatorCtrl", ['$scope', function ($scope) {
    var max;
    var min;
    var actual;
    var style;
    var howtoshow;
    var pi_name;
    var pi_unit;
    var drawlastyear;
    var drawtarget;
    var thischart = [];
    var getConf = function() {
        //config have changed, try redraw
        if(canvasId == null)
          return;
        var conf = $scope.config[canvasId];
        max = conf.max;
        min = conf.min;
        actual = conf.actual;
        howtoshow = conf.howtoshow;
        pi_name = conf.pi_name;
        pi_unit = conf.pi_unit;
        lastyear = conf.lastyear;
        target = conf.target;
        drawlastyear = conf.drawlastyear;
        drawtarget = conf.drawtarget;
        style = "decimal";
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
    }
    $scope.$watch('config', function (newValue, oldValue, scope) {
        if(oldValue.length>0) {
          for(var i = 0; i<oldValue.length; i++) {
            if(JSON.stringify(oldValue[i])!==JSON.stringify(newValue[i])) {
              //chart exists need update
              if(thischart[i]) {
                  thischart[i].update();
              }    
            }
          }
        }
        getConf();
    }, true);
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
        //          [ , Huge, ,SSmale]
        
        var size = [7 + Math.floor(0.75 * width), Math.floor(1.6 * width), 9 + Math.floor(0.5 * width)]; //calc text size
        size[3]=2 + size[2]*0.6;
        return [ctx, left, right, top, bottom, centerx, centery, radius, width, size];
    }
    var addtext = function (chart) {
        [ctx, left, right, top, bottom, centerx, centery, radius, width, size] = calc(chart);
        ctx.fillStyle = "#cfd2da";
        ctx.textAlign = "center";
        ctx.font = size[2] + "px Yekan";
        ctx.fillText(pi_name , centerx, centery + size[2] * 0.8);
        ctx.font = size[3] + "px Yekan";
        ctx.fillText(pi_unit, centerx, centery + size[3] + size[2] * 0.8);
        ctx.font = size[1] + "px WWDigital";
        ctx.fillText(actual.toLocaleString('en-US', { maximumSignificantDigits: 5, useGrouping: true, style: style}), centerx, centery - size[1] * 0.8);
        ctx.font = size[2] + "px WWDigital";
        ctx.textAlign = "left";
        ctx.fillText(min.toLocaleString('en-US', {maximumSignificantDigits: 5, useGrouping: true}), left, centery + size[2]);
        ctx.textAlign = "right";
        ctx.fillText(max.toLocaleString('en-US', {maximumSignificantDigits: 5, useGrouping: true}), right, centery + size[2]);
    }
    var addniddle = function (chart) {
        if (! isValid())
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
            teta = Math.PI / (max - min) * (value - min);
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
        if (howtoshow === 'absolute' && drawlastyear) {
            drawasmniddle(lastyear, "GreenYellow", 1);
        }
        //target niddle
        if (howtoshow === 'absolute' && drawtarget) {
            drawasmniddle(target, "GreenYellow", 2);
        }
        //actual niddle
        teta = Math.PI / (max - min) * (actual - min);
        drawaniddle(teta, "GreenYellow");
        //niddle hole
        ctx.beginPath();
        ctx.arc(centerx, centery, ctx.lineWidth*2, 0, 2 * Math.PI);
        ctx.stroke();
    };
    var firstload = 0;
    var canvasId = null;
    var isValid = function() {
        if (actual>=min && actual<=max) {
            return true;
        } else {
            return false;
        }
    }
    Chart.controllers.doughnut.prototype.draw = function (ease) {
        canvasId = this.chart.canvas.id;
        getConf();
        originalDraw.call(this, ease);
        if (this.chart.options.customize) {
            var _this = this
            if (firstload == 0) {
                thischart[canvasId] = this.chart;
                setTimeout(function () {
                    addtext(_this.chart);
                    //niddle on front
                    addniddle(_this.chart);
                    firstload++;
                }, 200)
            } else {
                addtext(this.chart);
                //niddle on front
                addniddle(this.chart);
            }
            
        };
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