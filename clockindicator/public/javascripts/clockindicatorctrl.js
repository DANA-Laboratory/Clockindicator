﻿var app = angular.module('ClockIndicator', ['chart.js', 'ngResource']);
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
    $scope.clicked = function(event) {
      if(event.currentTarget){
        $scope.selectedkey = event.currentTarget.attributes["data-source"].value;
        oldvalue = JSON.stringify($scope.config[$scope.selectedkey]);
        setTimeout(function () {
          for (let ch of $scope.charts) {
            if (ch.canvas.attributes['data-source'].value == $scope.selectedkey) {
              ch.update();
              $("#modalconfig").modal();
            }
          }
        }, 500);
      } else {
        console.log("error, where is evant?");
      }
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
                for (let ch of $scope.charts) {
                    if (ch.canvas.attributes['data-source'].value == $scope.selectedkey) {
                        ch.update();
                        //console.log('update called', $scope.selectedkey);
                    } else {
                        //console.log(ch.canvas.attributes['data-source'].value, " <> ", $scope.selectedkey);
                    }
                }
                /*
                if ($scope.charts[$scope.selectedkey]) {
                    $scope.charts[$scope.selectedkey].update();
                    console.log('update called', $scope.selectedkey);
                }
                */
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
    var chartId = 1;
    var progressChart = {};
    var isIntersect = function (point, circle) {
      return Math.sqrt((point.x-circle.x) ** 2 + (point.y - circle.y) ** 2) < circle.r;
    }
    var draw = function(c, data, options) {
      var W = canvas.width;
      var H = canvas.height;
      var ctx = c.getContext("2d");
      for (var i of [0,1,2]) {
        var centX = W/5 + W * i * 3/10;
        var r = W/7 * 0.7; 
        ctx.lineWidth = 1;
        ctx.beginPath();
        var teta = Math.asin((100 - data.value)/50-1);
        ctx.arc(centX, H/2, r, teta, Math.PI - teta);
        ctx.fillStyle = options.fillcolor[i];
        ctx.strokeStyle = options.fillcolor[i];
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(centX, H/2, r, Math.PI - teta, teta);
        ctx.fillStyle = options.color[i];
        ctx.strokeStyle = options.color[i];
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = options.textcolor;
        ctx.textAlign = "center";
        var size = r/2;
        var txt = "%" + data.value;
        ctx.font = size + "px Yekan";
        ctx.fillText(txt, centX, H/2 + size/3);        
      }
    }
    var createCircles = function(c, data, options) {
      var W = c.width;
      var H = c.height;
      var ctx = c.getContext("2d");
      //console.log(W, H);
      var circles = [];
      for (var i of [0,1,2]) {
        var centX = W/5 + W * i * 3/10;
        ctx.strokeStyle = options.color[i];
        ctx.lineWidth = 1;
        var r = W/7; 
        circles[i] = {x: centX, y: H/2, r: r, startangle: 0, endangle: 2 * Math.PI, strokeStyle: options.color[i], lineWidth: 2, strokeStyleHover: options.fillcolor[i], hover:false};
      }
      return circles;
    }
    var drawCircle = function(ctx, circle) {
        ctx.lineWidth = circle.lineWidth;
        if(circle.hover) {
          ctx.strokeStyle = circle.strokeStyleHover;
        } else {
          ctx.strokeStyle = circle.strokeStyle;        
        }
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.r, circle.startangle, circle.endangle);
        ctx.stroke();
    }
    while (document.getElementById("job" + chartId) !== null) {
        var key = "job" + chartId;
        var canvas  = document.getElementById(key);
        var options = {
                color: ["rgb(58,59,63)", "rgb(58,59,63)", "rgb(58,59,63)"],
                fillcolor: ["rgb(70,70,140)", "rgb(100,60,80)", "rgb( 40,100,50)"],
                textcolor: "#e6e6ff",
            };
        var data = {value: 50};
        progressChart[key] = {canvas: canvas}; 
        progressChart[key].circles = createCircles(canvas , data, options);
        progressChart[key].circles.forEach(circle => {
          drawCircle(canvas.getContext("2d"), circle);
        });
        draw(canvas , data, options);
        canvas.addEventListener('mousemove', (e) => {
          var canvas = e.currentTarget;
          const pos = {
            x: (e.clientX - canvas.getBoundingClientRect().left) * canvas.width/canvas.clientWidth,
            y: (e.clientY - canvas.getBoundingClientRect().top) * canvas.height/canvas.clientHeight
          };
          //console.log(pos);
          circles = progressChart[e.currentTarget.attributes["id"].value].circles;
          circles.forEach(circle => {
            if (isIntersect(pos, circle)) {
              if(circle.hover != true) {
                circle.hover = true;
                drawCircle(canvas.getContext("2d"), circle);
                console.log("hover on");
              }
            } else {
              if(circle.hover != false) {
                circle.hover = false;
                drawCircle(canvas.getContext("2d"), circle);
                console.log("hover off");
              }
            }
          });   
        });
        chartId++;
    }

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
    var isValid = function(conf) {
        if (conf.actual >= conf.min && conf.actual <= conf.max) {
            return true;
        } else {
            return false;
        }
    }
    Chart.controllers.doughnut.prototype.draw = function (ease) {
        var firstload = true;
        var canvasId = $scope.charts.indexOf(this.chart);
        if (canvasId === -1) {
          canvasId = $scope.charts.length;
        } else {
          firstload= false;
        }
        var dataSource = this.chart.canvas.attributes['data-source'].value;
        if (firstload) {
            $scope.charts[canvasId] = this.chart;
            var _canvasId = canvasId;
            var _key = dataSource;
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
            var conf = getConf(dataSource);
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