const autoBind = require('auto-bind');

class LikesAlbumHandler {
  constructor(service) {
    this._service = service;
    autoBind(this);
  }

  async postLikeAlbumByIdHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: albumId } = request.params;

    const liked = await this._service.likeUnlikeAlbum(albumId, credentialId);
    const message = liked === 'liked' ? 'Album berhasil disukai' : 'Rasa suka pada album berhasil dibatalkan';

    const response = h.response({
      status: 'success',
      message,
    });
    response.code(201);
    return response;
  }

  async getLikeAlbumByIdHandler(request, h) {
    const { id: albumId } = request.params;
    const { likes, cached } = await this._service.countLikeAlbum(albumId);
    const response = h.response({
      status: 'success',
      data: { likes },
    });
    if (cached) {
      response.header('X-Data-Source', 'cache');
    }
    response.code(200);
    return response;
  }
}

module.exports = LikesAlbumHandler;
