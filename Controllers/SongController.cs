using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using supmusic.Data;
using supmusic.Models;
using IHostingEnvironment = Microsoft.AspNetCore.Hosting.IHostingEnvironment;

namespace supmusic.Controllers;

[Authorize]
public class SongController : Controller
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<IdentityUser> _userManager;
    private readonly ILogger<SongController> _logger;
    private readonly IHostingEnvironment _environment;
    private string _baseDir;

    public SongController(UserManager<IdentityUser> userManager, ILogger<SongController> logger, IHostingEnvironment environment, ApplicationDbContext context)
    {
        _userManager = userManager;
        _logger = logger;
        _environment = environment;
        _context = context;
        _baseDir = _environment.ContentRootPath;
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
    public async Task<IActionResult> Upload(IEnumerable<IFormFile> files)
    {
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
    
    private IdentityUser GetCurrentUser()
    {
        return _userManager.FindByNameAsync(HttpContext.User.Identity.Name).Result;
    }
}