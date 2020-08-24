const { DB_USER, DB_PASSWORD, DB_SERVER, DB_NAME } = process.env;

let user = encodeURIComponent(DB_USER);
let password = encodeURIComponent(DB_PASSWORD);
let sqlConnectionUrl = `postgres://${user}:${password}@${DB_SERVER}/${DB_NAME}`;

console.log("Connection URL:", sqlConnectionUrl);

module.exports = {
  ci: {
    server: {
      port: "9001",
      storage: {
        storageMethod: "sql",
        sqlDialect: "postgres",
        sqlConnectionUrl
      }
    }
  }
};
