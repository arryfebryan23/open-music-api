const Joi = require('joi');

const PlaylistPayloadSchema = Joi.object({
  name: Joi.string().required(),
});

const validateSongToPlaylistPayload = Joi.object({
  songId: Joi.string().required(),
});

const validatePlaylistSongActionPayload = Joi.object({
  songId: Joi.string().required(),
  action: Joi.string().required(),
});

module.exports = {
  PlaylistPayloadSchema,
  validateSongToPlaylistPayload,
  validatePlaylistSongActionPayload,
};
