module.exports = function(RED) {
    
    var request = require("request");
    var http = require("http");
    var https = require("https");



    function Influxdb_query(config) {
        RED.nodes.createNode(this,config);
        var node = this;

    }
    
    RED.nodes.registerType("influxdb_query",Influxdb_query);



    // --- endpoint for HTML get env variable ---
    RED.httpAdmin.post("/firehose/influxdb/get_column", function(req, res){
        console.log("--- endpoint get column name in influxdb query ---");

        // -- get request --
        var req_obj = req.body;  // get request body
        obj_credential = req_obj["credential"]; // get credential
        str_query = req_obj["query"];   // get query string

        // credential is null
        if ( (Object.keys(obj_credential).length==0) || obj_credential=="undefined" ) {
            // set response
            res.setHeader("Content-Type", "application/json");
            res.status(500);
            res.send( JSON.stringify({message: "Query database error occur."}) );

            return console.error("request body(credential) is null.");    // error control
        }

        console.log(obj_credential);
        console.log("query: " + str_query);
        // -- -- --


        // -- request influxdb query api --
        var str_url = String(obj_credential["uri"]) + "/query";

        var options = {
            method: "POST",
            url: str_url,
            headers: {
                "Content-Type": "application/json"
            },
            timeout: 6000,
            qs: {
                db: String(obj_credential["database"]),
                u: String(obj_credential["username"]),
                p: String(obj_credential["password"]),
                q: str_query
            }
        };
        console.log("--- request influxdb options ---");
        console.log(options);


        request(options, function (error, response, body) {
            if (error) {
                // set response
                res.setHeader("Content-Type", "application/json");
                res.status(500);
                res.send( JSON.stringify({message: error}) );

                return console.error(error);    // error control
            }
            
            try {
                var tmp = JSON.parse(body);
                var column_list = tmp['results'][0]['series'][0]['columns'];    // get column name
                console.log(column_list);

                // set response
                res.setHeader("Content-Type", "application/json");
                res.status(response.statusCode);
                res.send( JSON.stringify({message: column_list}) );
            }
            catch (err) {
                console.error(err);

                // set response
                res.setHeader("Content-Type", "application/json");
                res.status(500);
                res.send( JSON.stringify({message: "Query database error occur."}) );
            }
        });
        // -- -- --
        
    });
    // --- --- ---


}

