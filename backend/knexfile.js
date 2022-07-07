// Update with your config settings.

module.exports = {
  development: {
    client: 'mssql',
    connection: {
      "user": 'Coletor',
      "password": 'Col@#2541MRS',
      "server": 'http://mrs-sp.ddns.net:1433',
      "database": 'ColetorMRS',
      "dialect": "mssql",
      "dialectOptions": {
        "instanceName": "SQLEXPRESS"
      },
      "pool": {
        "max": 10,
        "min": 0,
        "idleTimeoutMillis": 30000
      },
      "options": {
        "encrypt": false,
        "enableArithAbort": true
      }
    },
  },

  staging: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user: 'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user: 'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};
