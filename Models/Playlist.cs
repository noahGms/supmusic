using Microsoft.AspNetCore.Identity;

namespace supmusic.Models;

public class Playlist
{
    public int ID { get; set; }
    public string Name { get; set; }
    public IdentityUser User { get; set; }
}