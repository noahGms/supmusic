using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using supmusic.Data;
using supmusic.Models;

namespace supmusic.Controllers;

[Authorize]
public class PlaylistController : Controller
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<IdentityUser> _userManager;
    private readonly ILogger<SongController> _logger;

    public PlaylistController(UserManager<IdentityUser> userManager, ApplicationDbContext context, ILogger<SongController> logger)
    {
        _userManager = userManager;
        _context = context;
        _logger = logger;
    }

    public async Task<IActionResult> Index()
    {
        var query = _context.Playlists.Where(p => p.User == GetCurrentUser());
        return View(await query.ToListAsync());
    }

    public async Task<IActionResult> Details(int Id)
    {
        var playlist = await _context.Playlists.FindAsync(Id);
        if (playlist == null)
        {
            return NotFound();
        }
        
        return View(playlist);
    }

    public IActionResult Create()
    {
        return View();
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Store(Playlist playlist)
    {
        playlist.User = GetCurrentUser();
        _context.Add(playlist);
        await _context.SaveChangesAsync();
        
        return RedirectToAction(nameof(Index));
    }

    [HttpGet]
    public async Task<List<Song>> SearchSong([FromQuery(Name = "name")] string name)
    {
        var request = _context.Songs.Where(s => s.Name.Contains(name));
        return await request.ToListAsync();
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<RedirectToActionResult> AddSong(int Id, int songId)
    {
        var playlist = await _context.Playlists.FindAsync(Id);
        var song = await _context.Songs.FindAsync(songId);
        
        if (playlist == null || song == null)
        {
            NotFound();
        }
        
        return RedirectToAction(nameof(Details), new {@id = Id});
    }

    private IdentityUser GetCurrentUser()
    {
        return _userManager.FindByNameAsync(HttpContext.User.Identity.Name).Result;
    }
}