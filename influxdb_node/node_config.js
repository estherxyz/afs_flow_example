module.exports = function(RED) {
    
    var request = require("request");
    var http = require("http");
    var https = require("https");



    function Firehose_influx(config) {
        RED.nodes.createNode(this,config);
        var node = this;

    }
    

    
    RED.nodes.registerType("firehose_influx",Firehose_influx);
}

