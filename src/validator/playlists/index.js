const InvariantError = require('../../exceptions/InvariantError');
const { PlaylistPayloadSchema, validateSongToPlaylistPayload, validatePlaylistSongActionPayload } = require('./schema');

const playlistsValidatior = {
  validatePlaylistPayload: (payload) => {
    const validationResult = PlaylistPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateSongToPlaylistPayload: (payload) => {
    const validationResult = validateSongToPlaylistPayload.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validatePlaylistSongActionPayload: (payload) => {
    const validationResult = validatePlaylistSongActionPayload.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = playlistsValidatior;
