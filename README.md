# playlist_finder_current

A tool that will let a user login and search for a song and get a list of all their playlists which contain that song. 
- Immediately useful for Spotify power users who have many playlists and forget which playlists contain which songs
- Eventually will be used for improving music discovey process by leveraging follower network

Roadmap: 
- debug mapping function s.t. all of a user's playlists are mapped with a single click (currently: nondeterministic null responses from API, likely issues with async)
- make publicly available
- enable search for multiple songs, return result playlists in order based on how many of the requested songs are in them
- access a user's friends list, create/access corresponding mappings --> becomes pretty data intensive, going to have to start storing this data, nonrelational DB to preserve map structure? Users' playlist-song maps updated on read, whenever that user or anyone who follows them logs in (? is this too expensive?), only looking at recently updated playlists
- enable access to current user's private + collaborative playlists
