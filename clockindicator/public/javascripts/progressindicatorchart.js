Chart.controllers.progressIndicator = Chart.DatasetController.extend({
    // Create elements for each piece of data in the dataset. Store elements in an array on the dataset as dataset.metaData
    addElements: function() {},

    // Create a single element for the data at the given index and reset its state
    addElementAndReset: function(index) {},

    // Draw the representation of the dataset
    // @param ease : if specified, this number represents how far to transition elements. See the implementation of draw() in any of the provided controllers to see how this should be used
    draw: function(ease) {console.log("draw")},  

    // Remove hover styling from the given element
    removeHoverStyle: function(element) {},

    // Add hover styling to the given element
    setHoverStyle: function(element) {},

    // Update the elements in response to new data
    // @param reset : if true, put the elements into a reset state so they can animate to their final values
    update: function(reset) {},
    
                //*** The following methods may optionally be overridden by derived dataset controllers ***\\

    // Initializes the controller
    initialize: function(chart, datasetIndex) {console.log("initialize")},

    // Ensures that the dataset represented by this controller is linked to a scale. Overridden to helpers.noop in the polar area and doughnut controllers as these
    // chart types using a single scale
    linkScales: function() {},

    // Called by the main chart controller when an update is triggered. The default implementation handles the number of data points changing and creating elements appropriately.
    buildOrUpdateElements: function() {}

});
console.log("loadedd");