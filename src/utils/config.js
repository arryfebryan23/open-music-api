const config = {
  app: {
    host: process.env.HOST,
    port: process.env.PORT,
  },
  token: {
    access: {
      key: process.env.ACCESS_TOKEN_KEY,
      age: process.env.ACCESS_TOKEN_AGE,
    },
    refresh: {
      key: process.env.REFRESH_TOKEN_KEY,
      age: process.env.ACCESS_TOKEN_AGE,
    },
  },
  s3: {
    bucketName: process.env.AWS_BUCKET_NAME,
  },
  rabbitMq: {
    server: process.env.RABBITMQ_SERVER,
  },
  redis: {
    host: process.env.REDIS_SERVER,
  },
};

module.exports = config;
