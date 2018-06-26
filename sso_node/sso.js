module.exports = function(RED) {
    var request = require("request");
    var http = require("http");
    var https = require("https");



    function Sso_setting(config) {
        RED.nodes.createNode(this,config);
        var node = this;


        // run Node-RED flow
        node.on('input', function(msg) {
            // set msg.payload
            msg.payload = {
            };

            node.send(msg);

        });

    }
    
    
    RED.nodes.registerType("sso_setting",Sso_setting);



    // --- endpoint for get sso token ---
    RED.httpAdmin.post("/sso/token", function(req, res){
        console.log("--- endpoint get sso token ---");

        var sso_host = "";  // ***required

        // get request headers
        var sso_user = req.get("sso_user");
        var sso_password = req.get("sso_password");
        
        // sso request body
        var req_param = {
            "username": sso_user,
            "password": sso_password
        };


        try {
            request(
                {
                    method: "POST",
                    url: sso_host + "/v1.5/auth/native",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    timeout: 4000,

                    body: JSON.stringify(req_param)
                },
                function(error, response, body) {
                    if ( (response!=null) && (body!=null) ) {
                        var result = JSON.parse(body); // trans to json

                        // set response
                        res.setHeader("Content-Type", "application/json");
                        res.status(response.statusCode);
                        res.send(result);
                    }
                    else {
                        console.log("Request sso api to get sso token error.");

                        // set response
                        res.setHeader("Content-Type", "application/json");
                        res.status(404);
                        res.send( JSON.stringify({message: "Request sso api to get sso token error."}) );
                    }

            });
        } catch (err) {
            console.error(err);

            res.setHeader("Content-Type", "application/json");
            res.status(500);
            res.send( JSON.stringify({message: "Internal Error."}) );
        }

    });

    // --- --- ---



    // --- endpoint for get space credentials ---
    RED.httpAdmin.post("/afs/credentials", function(req, res){
        console.log("--- endpoint get space credentials ---");

        var afs_host = "";  // ***required

        // get request headers
        // var afs_instance_id = req.get("afs_instance_id");
        var afs_instance_id = "";   // ***required
        var sso_token = req.get("sso_token");

        
        try {
            request(
                {
                    method: "GET",
                    url: afs_host + "/v1/" + afs_instance_id + "/services",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + sso_token
                    },
                    timeout: 4000
                },
                function(error, response, body) {
                    if ( (response!=null) && (body!=null) ) {
                        var result = JSON.parse(body); // trans to json

                        // set response
                        res.setHeader("Content-Type", "application/json");
                        res.status(response.statusCode);
                        res.send(result);
                    }
                    else {
                        console.log("Request AFS api to get credentials error.");

                        // set response
                        res.setHeader("Content-Type", "application/json");
                        res.status(404);
                        res.send( JSON.stringify({message: "Request AFS api to get credentials error."}) );
                    }

            });
        } catch (err) {
            console.error(err);

            res.setHeader("Content-Type", "application/json");
            res.status(500);
            res.send( JSON.stringify({message: "Internal Error."}) );
        }

    });

    // --- --- ---

}

