/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql("INSERT INTO albums(id, name, year) VALUES ('old_album', 'old_album', '1999')");

  pgm.sql("UPDATE songs SET \"albumId\" = 'old_album' WHERE \"albumId\" IS NULL");

  pgm.addConstraint('songs', 'fk_songs.album_songs.id', 'FOREIGN KEY("albumId") REFERENCES albums(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropConstraint('songs', 'fk_songs.album_songs.id');

  pgm.sql("UPDATE songs SET \"albumId\" = NULL WHERE\"albumId\" = 'old_album'");

  // menghapus user baru.
  pgm.sql("DELETE FROM albums WHERE id = 'old_album'");
};