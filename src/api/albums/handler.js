const autoBind = require('auto-bind');

class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name = 'untitled', year } = request.payload;

    const albumId = await this._service.addAlbum({ name, year });

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const result = await this._service.getAlbumById(id);
    return {
      status: 'success',
      data: {
        album: { ...result.album, songs: result.songs },
      },
    };
  }

  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;

    await this._service.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);
    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async postAlbumCoverByIdHandler(request, h) {
    const { id: albumId } = request.params;
    const { cover } = request.payload;

    this._validator.validateImageHeaders(cover.hapi.headers);

    const filename = await this._service.writeAlbumCoverImage(cover, albumId);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
      data: {
        filename,
      },
    });
    response.code(201);
    return response;
  }
}

module.exports = AlbumsHandler;
