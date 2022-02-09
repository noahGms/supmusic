using Microsoft.AspNetCore.Identity;

namespace supmusic.Models;

public class Song
{
    public int ID { get; set; }
    public string Name { get; set; }
    public string Path { get; set; }
    public IdentityUser User { get; set; }
}