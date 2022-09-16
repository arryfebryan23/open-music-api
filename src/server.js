require('dotenv').config();

const Hapi = require('@hapi/hapi');
const albums = require('./api/albums');
const songs = require('./api/songs');
const ClientError = require('./exceptions/ClientError');

const AlbumsService = require('./services/postgres/AlbumsService');
const AlbumsValidator = require('./validator/albums');
const SongsService = require('./services/postgres/SongsService');
const SongsValidator = require('./validator/songs');

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([
    {
      plugin: albums,
      options: {
        service: new AlbumsService(),
        validator: AlbumsValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: new SongsService(),
        validator: SongsValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    // mendapatkan konteks response dari request
    const { response } = request;
    if (response instanceof Error) {
      if (response instanceof ClientError) {
      // membuat response baru dari response toolkit sesuai kebutuhan error handling
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      // server ERROR!
      const newResponse = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      newResponse.code(500);
      console.error(response);
      return newResponse;
    }
    // jika bukan ClientError, lanjutkan dengan response sebelumnya (tanpa terintervensi)
    return response.continue || response;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
