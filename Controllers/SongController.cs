using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using supmusic.Data;
using supmusic.Models;
using IHostingEnvironment = Microsoft.AspNetCore.Hosting.IHostingEnvironment;

namespace supmusic.Controllers;

[Authorize]
public class SongController : BaseController<SongController>
{
    private readonly IHostingEnvironment _environment;
    private readonly string _baseDir;

    public SongController(ApplicationDbContext context, UserManager<IdentityUser> userManager, ILogger<SongController> logger, IHostingEnvironment environment) : base(context, userManager, logger)
    {
        _environment = environment;
        _baseDir = environment.ContentRootPath;
    }

    public async Task<IActionResult> Index()
    {
        var user = GetCurrentUser();
        var query = _context.Songs.Where(s => s.User == user);
        
        return View(await query.ToListAsync());
    }

    public IActionResult Add()
    {
        return View();
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Upload(IEnumerable<IFormFile> files, string? songUrlName, string? url)
    {
        if (url != null && songUrlName != null)
        {
            var song = new Song
            {
                Name = songUrlName,
                Path = url,
                User = GetCurrentUser()
            };

            _context.Add(song);
            await _context.SaveChangesAsync();
        } else if (files.Count() != 0) {
            var absolutePath = GetAbsolutePath();

            foreach (var file in files)
            {
                if (!Directory.Exists(absolutePath))
                {
                    Directory.CreateDirectory(absolutePath);
                }

                await using (var fileStream = new FileStream(Path.Combine(absolutePath, file.FileName), FileMode.Create,
                                 FileAccess.Write))
                {
                    await file.CopyToAsync(fileStream);

                    var songName = GetFileName(file.FileName, ".mp3");

                    var song = new Song
                    {
                        Name = songName,
                        Path = file.FileName,
                        User = GetCurrentUser()
                    };

                    _context.Add(song);
                    await _context.SaveChangesAsync();
                }
            }
        }
        
        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Delete(int id)
    {
        var song = await _context.Songs.FindAsync(id);
        if (song == null)
        {
            return RedirectToAction(nameof(Index));
        }

        var absolutePath = GetAbsolutePath();
        System.IO.File.Delete(Path.Combine(absolutePath, song.Path));
        
        _context.Songs.Remove(song);
        await _context.SaveChangesAsync();
        
        return RedirectToAction(nameof(Index));
    }
    
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<RedirectToActionResult> AddSongToPlaylist(int Id, int playlistId)
    {
        var song = await _context.Songs.FindAsync(Id);
        var playlist = await _context.Playlists.FindAsync(playlistId);
        
        if (song == null || playlist == null)
        {
            NotFound();
        }

        var playlistSong = new PlaylistSong
        {
            Playlist = playlist,
            Song = song
        };
        _context.PlaylistSongs.Add(playlistSong);
        await _context.SaveChangesAsync();
        
        return RedirectToAction(nameof(Index));
    }

    private string GetAbsolutePath()
    {
        var user = GetCurrentUser();
        var path = $"wwwroot{Path.DirectorySeparatorChar}musics{Path.DirectorySeparatorChar}{user.Id}";
        var absolutePath = Path.Join(_baseDir, path);

        return absolutePath;
    }

    private string GetFileName(string fileName, string substring)
    {
        var indexOfSubstring = fileName.IndexOf(substring, StringComparison.Ordinal);
        var goodFileName = fileName.Remove(indexOfSubstring, substring.Length);
        
        return goodFileName;
    }
}