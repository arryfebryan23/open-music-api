const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

const { mapDBToModel } = require('../../utils');

class PlaylistsService {
  constructor(songsService, collaborationService) {
    this._pool = new Pool();
    this._songsService = songsService;
    this._collaborationService = collaborationService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Playlist gagal ditambahkan!');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `SELECT p.*,
                    (SELECT username FROM users WHERE id = p.owner) AS owner
              FROM playlists p 
              LEFT JOIN collaborations c ON p.id = c.playlist_id 
              WHERE owner = $1 
                OR c.user_id = $1 
              GROUP BY p.id`,
      values: [owner],
    };

    const result = await this._pool.query(query);
    return result.rows.map(mapDBToModel);
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan!');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan!');
    }

    const playlist = result.rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini!');
    }
  }

  async addSongToPlaylist(playlistId, songId, userId) {
    const id = `playlistsong-${nanoid(16)}`;

    await this._songsService.getSongById(songId);

    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist!');
    }

    await this.createLogPlaylist(playlistId, songId, userId, 'add');
  }

  async getSongsFromPlaylist(playlistId) {
    const query = {
      text: `SELECT 
                  p.name AS playlist_name,
                  (SELECT username FROM users WHERE id = p.owner) AS playlist_owner,
                  s.id,
                  s.title,
                  s.performer
              FROM playlists p 
                LEFT JOIN playlist_songs ps ON p.id = ps.playlist_id 
                LEFT JOIN songs s ON ps.song_id = s.id
              WHERE p.id = $1`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan!');
    }

    return result.rows;
  }

  async deleteSongFromPlaylist(playlistId, songId, userId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Lagu gagal dihapus dari playlist!');
    }

    await this.createLogPlaylist(playlistId, songId, userId, 'delete');
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new NotFoundError('Playlist tidak ditemukan');
      }
      await this._collaborationService.verifyCollaborator(playlistId, userId);
    }
  }

  async createLogPlaylist(playlistId, songId, userId, action) {
    const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO playlist_song_activities (playlist_id, song_id, user_id, "action", created_at) VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [playlistId, songId, userId, action, createdAt],
    };

    await this._pool.query(query);
  }

  async getLogPlaylistSongs(playlistId) {
    const query = {
      text: `SELECT
                u.username,
                s.title,
                psa.action,
                psa.created_at as time 
              FROM playlist_song_activities psa 
                LEFT JOIN songs s ON psa.song_id = s.id
                LEFT JOIN users u ON psa.user_id = u.id
              WHERE psa.playlist_id = $1
              ORDER BY psa.created_at ASC`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }
}

module.exports = PlaylistsService;
