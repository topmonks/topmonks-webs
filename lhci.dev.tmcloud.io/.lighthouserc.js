const {
  DB_USER: user,
  DB_PASSWORD: password,
  DB_SERVER: dbserver,
  DB_NAME: dbname
} = process.env;

module.exports = {
  ci: {
    server: {
      port: "9001",
      storage: {
        storageMethod: "sql",
        sqlDialect: "postgres",
        sqlConnectionUrl: `postgres://${user}:${password}@${dbserver}/${dbname}`
      }
    }
  }
};
