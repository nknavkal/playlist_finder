# playlist_finder_current

Trying to create a tool that will let a user login and search for a song (or multiple?) and get a list of all their playlists which contain that song. 
- Immediately useful for spotify power users who have many playlists and forget which playlists contain which songs
- eventually would like to use this to help people discover public playlists that have songs they like

Roadmap: 
- debug mapping function s.t. all of a user's playlists are mapped with a single click (currently: nondeterministic null responses from API, likely issues with async)
- make publicly available
- enable search for multiple songs, return result playlists in order based on how many of the requested songs are in them
- access a user's friends list, create/access corresponding mappings --> becomes pretty data intensive, going to have to start storing this data, nonrelational DB? A user's playlist-song map is updated on read, whenever that user or anyone who follows them logs in (? is this too expensive?), only looking at recently updated playlists
- 
