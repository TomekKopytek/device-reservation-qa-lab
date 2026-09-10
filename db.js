const sql = require("mssql/msnodesqlv8");
const driver = "ODBC Driver 18 for SQL Server";
const server = "localhost\\SQLEXPRESS";
const Database = "device_lab_verify";
const Trusted_Connection = "Yes";
const Encrypt = "Yes";
const TrustServerCertificate = "Yes";

const connectionString = `Driver={${driver}};Server=${server};Database=${Database};Trusted_Connection=${Trusted_Connection};Encrypt=${Encrypt};TrustServerCertificate=${TrustServerCertificate}`;

function getDevices() {
  return sql
    .connect({ connectionString: connectionString })
    .then((pool) => {
      return pool
        .request()
        .query(
          "SELECT id as identyfikator, name as nazwa_urządzenia from devices",
        );
    })
    .then((result) => {
      return result.recordset;
    });
}

function getAvailableDevices() {
  return sql
    .connect({ connectionString: connectionString })
    .then((pool) => {
      return pool
        .request()
        .query(
          "SELECT devices.id as identyfikator, devices.name as nazwa_urządzenia from devices LEFT JOIN reservations ON devices.id = reservations.device_id AND reservations.is_active=1 WHERE reservations.id IS NULL;",
        );
    })
    .then((result) => {
      return result.recordset;
    });
}

function createReservation(deviceId, testerId) {
  return sql.connect({ connectionString: connectionString }).then((pool) => {
    return pool
      .request()
      .input("deviceId", sql.Int, deviceId)
      .input("testerId", sql.Int, testerId)
      .query(
        "INSERT INTO reservations(device_id,tester_id,is_active) VALUES (@deviceId,@testerId,1)",
      );
  });
}

function cancelReservation(reservationId) {
    return sql.connect({ connectionString: connectionString }).then((pool) => {
    return pool
      .request()
      .input("reservationId", sql.Int, reservationId)
      .query(
        "UPDATE reservations SET is_active=0 where id=@reservationId AND is_active=1",
      );
  });
}


module.exports = {
  getDevices,
  getAvailableDevices,
  createReservation,
  cancelReservation,
};
