const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class LikesAlbumService {
  constructor(AlbumService, CacheService) {
    this._pool = new Pool();
    this._cacheService = CacheService;
    this._albumService = AlbumService;
  }

  async likeUnlikeAlbum(albumId, userId) {
    // Cek album apakah tersedia
    await this._albumService.getAlbumById(albumId);

    // Cek dulu apakah user sudah pernah like album
    const exist = await this.getLikeAlbum(albumId, userId);

    let status = '';
    if (exist) {
      status = 'unliked';
      await this.deleteLikeAlbum(albumId, userId);
    } else {
      status = 'liked';
      await this.addLikeAlbum(albumId, userId);
    }

    await this._cacheService.delete(`count-likes:${albumId}`);
    return status;
  }

  async getLikeAlbum(albumId, userId) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, userId],
    };

    const result = await this._pool.query(query);
    return result.rowCount;
  }

  async deleteLikeAlbum(albumId, userId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2 RETURNING *',
      values: [albumId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Like album gagal dihapus. Id tidak ditemukan');
    }

    return result.rowCount;
  }

  async addLikeAlbum(albumId, userId) {
    const query = {
      text: 'INSERT INTO user_album_likes(user_id, album_id) VALUES($1, $2) RETURNING *',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Like album gagal ditambahkan');
    }

    return result.rowCount;
  }

  async countLikeAlbum(albumId) {
    try {
      const result = await this._cacheService.get(`count-likes:${albumId}`);
      return { likes: JSON.parse(result), cached: true };
    } catch {
      // Cek album apakah tersedia
      await this._albumService.getAlbumById(albumId);

      const query = {
        text: 'SELECT id FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const result = await this._pool.query(query);
      await this._cacheService.set(`count-likes:${albumId}`, JSON.stringify(result.rowCount));
      return { likes: result.rowCount, cached: false };
    }
  }
}

module.exports = LikesAlbumService;
