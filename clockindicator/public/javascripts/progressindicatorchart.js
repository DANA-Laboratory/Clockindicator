Chart.controllers.progressIndicator = Chart.DatasetController.extend({
    // Create elements for each piece of data in the dataset. Store elements in an array on the dataset as dataset.metaData
    addElements: function() {
        //console.log("addElements")
    },

    // Create a single element for the data at the given index and reset its state
    addElementAndReset: function(index) {
        //console.log("addElementAndReset")
    },

    // Draw the representation of the dataset
    // @param ease : if specified, this number represents how far to transition elements. See the implementation of draw() in any of the provided controllers to see how this should be used
    draw: function(ease) {
      var ctx = this.chart.ctx;
      var data = this.chart.data;
      var options = this.chart.options;
      var chartArea = this.chart.chartArea;
      var left = chartArea.left;
      var right = chartArea.right;
      var top = chartArea.top;
      var bottom = chartArea.bottom;
      var W = Math.abs((left-right))/4;
      var H = Math.abs((top-bottom));
      for (var i of [0,1,2]) {
        var centX = W*3/4 + W * i * 5/4;
        ctx.strokeStyle = options.color[i];
        ctx.lineWidth = 1;
        ctx.beginPath();
        var r = Math.min(W, H)/2;
        var r1 = r * 0.9;
        var r2 = r * 0.7;
        ctx.arc(centX, H/2, r1, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.lineWidth = 2;
        ctx.beginPath();
        var teta = Math.asin((100 - data.value)/50-1);
        ctx.arc(centX, H/2, r2, teta, Math.PI - teta);
        ctx.fillStyle = options.fillcolor[i];
        ctx.strokeStyle = options.fillcolor[i];
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(centX, H/2, r2, Math.PI - teta, teta);
        ctx.fillStyle = options.color[i];
        ctx.strokeStyle = options.color[i];
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = options.textcolor;
        ctx.textAlign = "center";
        var size = r2/2;
        var txt = "%" + data.value;
        ctx.font = size + "px Yekan";
        ctx.fillText(txt, centX, H/2 + size/3);
      }
    },

    // Remove hover styling from the given element
    removeHoverStyle: function(element) {
        console.log("removeHoverStyle")
    },

    // Add hover styling to the given element
    setHoverStyle: function(element) {
        console.log("setHoverStyle")
    },

    // Update the elements in response to new data
    // @param reset : if true, put the elements into a reset state so they can animate to their final values
    update: function(reset) {
        //console.log("update")
    },
    
        //********************\\
        
    // Initializes the controller
    // initialize: function(chart, datasetIndex) {console.log("initialize");},

    // Ensures that the dataset represented by this controller is linked to a scale. Overridden to helpers.noop in the polar area and doughnut controllers as these
    // chart types using a single scale
    linkScales: function() {},

    // Called by the main chart controller when an update is triggered. The default implementation handles the number of data points changing and creating elements appropriately.
    // buildOrUpdateElements: function() {console.log("buildOrUpdateElements");}
});
/* 
  console.log("loadedd", Chart.controllers);
  var ch = new Chart.controllers.progressIndicator();
  //ch.test() 
*/