using supmusic.Models;

namespace supmusic.Data;

public class PlaylistDetails
{
    public Playlist Playlist { get; set; }
    public List<PlaylistSong> Songs { get; set; }
}