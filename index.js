const http = require("node:http");
const { getDevices, getAvailableDevices, createReservation, cancelReservation } = require("./db.js");

const server = http.createServer((req, res) => {
  console.log(req.method, req.url);
  if (req.method === "GET" && req.url === "/health") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "https://editor.swagger.io");
    res.end(JSON.stringify({ status: "ok" }));
  } else if (req.method === "GET" && req.url === "/devices") {
    // Call the getDevices function from db.js
    getDevices()
      .then((devices) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(devices));
      })
      .catch((error) => {
        console.error("Błąd: " + error);
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Database error" }));
      });
  } else if (req.method === "GET" && req.url === "/devices/available") {
    getAvailableDevices()
      .then((availableDevices) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(availableDevices));
      })
      .catch((error) => {
        console.error("Błąd: " + error);
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Database error" }));
      });
  } else if (req.method === "POST" && req.url === "/reservations") {
    //komentarz: tutaj będzie logika do obsługi rezerwacji
    let body = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
        try {
            const obiektBody = JSON.parse(body);
            if (Number.isInteger(obiektBody.device_id) && obiektBody.device_id > 0 && Number.isInteger(obiektBody.tester_id) && obiektBody.tester_id > 0){
                console.log(obiektBody.device_id + " " + obiektBody.tester_id)
                createReservation(obiektBody.device_id, obiektBody.tester_id)
                    .then((result) => {
                        const reservationId = Number(result.recordset[0].reservation_id);
                        console.log("Reservation created with ID: " + reservationId);
                        console.log("Type of id: " + typeof reservationId);
                        res.statusCode = 201;
                        res.setHeader("Content-Type", "application/json");
                        res.end(JSON.stringify({ "status" : "created", reservation_id: reservationId }));
                    })
                    .catch((error) => {
                        console.dir(error, { depth: null });
                        if(error.number === 2601)
                        {
                            res.statusCode = 409;
                            res.setHeader("Content-Type", "application/json");
                            res.end(JSON.stringify({ error: "Device is already reserved" }));
                        }
                        else if(error.number === 547)
                        {
                            if(error.message.includes("fk_devices_id"))
                            {
                                res.statusCode = 404;
                                res.setHeader("Content-Type", "application/json");
                                res.end(JSON.stringify({ error: "Device does not exist" }));
                            }
                            else if(error.message.includes("fk_testers_id")){
                                res.statusCode = 404;
                                res.setHeader("Content-Type", "application/json");
                                res.end(JSON.stringify({ error: "Tester does not exist" }));
                            }
                            else {
                                res.statusCode = 500;
                                res.setHeader("Content-Type", "application/json");
                                res.end(JSON.stringify({ error: "Database error" }));
                            }
                        }
                        else {
                            res.statusCode = 500;
                            res.setHeader("Content-Type", "application/json");
                            res.end(JSON.stringify({ error: "Database error" }));
                        }
                    })
            }
            else {
                res.statusCode = 400;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ error: "Invalid identifiers" }));
            }  
        } catch (error) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Invalid JSON" }));
        }
    });
  } 
  else if (req.method === "PATCH" && req.url === ("/reservations/cancel")) {
    //anulowanie rezerwacji
    let body = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
        try {
            const obiektBody = JSON.parse(body);
            if (Number.isInteger(obiektBody.reservation_id) && obiektBody.reservation_id > 0){
                cancelReservation(obiektBody.reservation_id)
                    .then((result) => {
                        if (result.rowsAffected[0] === 0) {
                            res.statusCode = 200;
                            res.setHeader("Content-Type", "application/json");
                            res.end(JSON.stringify({ "status":"unchanged"}));
                        }
                        else if (result.rowsAffected[0] === 1) {
                            res.statusCode = 200;
                            res.setHeader("Content-Type", "application/json");
                            res.end(JSON.stringify({ "status":"cancelled"}));
                        }
                    })
                    .catch((error) => {
                        res.statusCode = 500;
                        res.setHeader("Content-Type", "application/json");
                        res.end(JSON.stringify({ error: "Database error" }));
                    }
                )
            }
            else {
                res.statusCode = 400;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ error: "Invalid identifiers" }));
            }
        }
        catch (error) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Invalid JSON" }));
        }
    });
  }
  else {
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Not found" }));
  }
});
server.listen(3000, "127.0.0.1");
