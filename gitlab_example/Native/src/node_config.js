module.exports = function(RED) {
    var request = require("request");
    var http = require("http");
    var https = require("https");



    function company_Native(config) {
        RED.nodes.createNode(this,config);
        var node = this;


        // run Node-RED flow
        node.on('input', function(msg) {
            // set msg.payload
            msg.payload = {
            };

            // send message
            node.send(msg);
        });

    }
    

    
    RED.nodes.registerType("company_Native",company_Native);

}