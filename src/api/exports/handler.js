const autoBind = require('auto-bind');

class ExportsHandler {
  constructor(service, validator, playlistsService) {
    this._service = service;
    this._validator = validator;
    this._playlistsService = playlistsService;

    autoBind(this);
  }

  async postExportPlaylistsByPlaylistIdHandler(request, h) {
    this._validator.validateExportPlaylistPayload(request.payload);
    const { playlistId } = request.params;
    const { id: ownerId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(playlistId, ownerId);

    const message = {
      targetEmail: request.payload.targetEmail,
      playlistId,
    };

    await this._service.sendMessage('export:playlists', message);

    const response = h.response(
      {
        status: 'success',
        message: 'Permintaan Anda sedang kami proses',
      },
    );
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
