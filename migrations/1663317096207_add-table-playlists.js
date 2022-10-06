/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('playlists', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    name: {
      type: 'TEXT',
      notNull: true,
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });

  pgm.addConstraint('playlists', 'fk_playlists.users.owner', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE');

  pgm.createTable('playlist_songs', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    song_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });

  pgm.addConstraint('playlist_songs', 'unique_playlist_id_and_song_id', 'UNIQUE(playlist_id, song_id)');
  pgm.addConstraint('playlist_songs', 'fk_playlist_songs.playlist_songs.playlist_id', 'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE');
  pgm.addConstraint('playlist_songs', 'fk_playlist_songs.songs.song_id', 'FOREIGN KEY(song_id) REFERENCES songs(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  // pgm.dropConstraint('playlist_songs', 'fk_playlist_songs.songs.song_id');
  // pgm.dropConstraint('playlist_songs', 'fk_playlist_songs.playlist_songs.playlist_id');
  // pgm.dropConstraint('playlists', 'fk_playlists.users.owner');

  pgm.dropTable('playlist_songs');
  pgm.dropTable('playlists');
};
