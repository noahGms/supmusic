namespace supmusic.Models;

public class PlaylistSong
{
    public int Id { get; set; }
    
    public Playlist Playlist { get; set; }
    
    public Song Song { get; set; }
}