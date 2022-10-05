const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsService {
  constructor(StoragesService) {
    this._pool = new Pool();
    this._storagesService = StoragesService;
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    let query = {
      text: 'SELECT id, name, year, cover AS "coverUrl" FROM albums WHERE id = $1',
      values: [id],
    };

    const resultAlbum = await this._pool.query(query);

    if (!resultAlbum.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    query = {
      text: 'SELECT id, title, performer FROM songs WHERE "albumId" = $1',
      values: [id],
    };

    const resultSongs = await this._pool.query(query);

    const result = {
      album: resultAlbum.rows[0],
      songs: resultSongs.rows,
    };
    return result;
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }

  async writeAlbumCoverImage(imageCover, albumId) {
    const filename = await this._storagesService.writeFile(imageCover, imageCover.hapi);

    const query = {
      text: 'UPDATE albums SET cover = $1 WHERE id = $2 RETURNING id',
      values: [filename, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }

    return filename;
  }

  async likeUnlikeAlbum(albumId, userId) {
    // Cek album apakah tersedia
    await this.getAlbumById(albumId);

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
    // Cek album apakah tersedia
    await this.getAlbumById(albumId);

    const query = {
      text: 'SELECT id FROM user_album_likes WHERE album_id = $1',
      values: [albumId],
    };
    const result = await this._pool.query(query);

    return result.rowCount;
  }
}

module.exports = AlbumsService;
