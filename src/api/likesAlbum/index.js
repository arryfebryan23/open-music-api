const LikesAlbumHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'likesAlbum',
  version: '1.0.0',
  register: async (server, { service }) => {
    const likesAlbumHandler = new LikesAlbumHandler(service);
    server.route(routes(likesAlbumHandler));
  },
};
