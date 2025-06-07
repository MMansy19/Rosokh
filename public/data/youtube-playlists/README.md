# YouTube Playlists Dynamic Loading System

This system allows the application to dynamically load all playlist files from the `public/data/youtube-playlists/` directory without hardcoding file names.

## How It Works

### 1. Manifest File

- **Location**: `public/data/youtube-playlists/manifest.json`
- **Purpose**: Contains a list of all available playlist JSON files
- **Structure**:

```json
{
  "files": [
    "huda-lilnas.json",
    "juz-amma-tafsir.json",
    "juz-tabarak.json",
    "qad-samea-tafsir.json",
    "quran-tafsir.json"
  ]
}
```

### 2. Dynamic Loading Hook

- **File**: `hooks/usePlaylistData.ts`
- **Process**:
  1. Fetches the manifest file to get the list of available playlist files
  2. Dynamically fetches all listed playlist files
  3. Combines all playlists into a single array
  4. Provides error handling for failed requests

### 3. Automatic Manifest Updates

#### Using the NPM Script (Recommended)

```bash
npm run update-playlist-manifest
```

#### Manual Script Execution

```bash
node scripts/update-playlist-manifest.js
```

#### What the Script Does

- Scans the `public/data/youtube-playlists/` directory
- Finds all `.json` files (excluding `manifest.json`)
- Updates the manifest file with the current list of files
- Sorts files alphabetically for consistency

## Adding New Playlist Files

### Option 1: Automatic (Recommended)

1. Add your new playlist JSON file to `public/data/youtube-playlists/`
2. Run `npm run update-playlist-manifest`
3. The new file will be automatically included in the next app reload

### Option 2: Manual

1. Add your new playlist JSON file to `public/data/youtube-playlists/`
2. Manually add the filename to `manifest.json` in the `files` array
3. Restart your development server

## Playlist File Structure

Each playlist file should follow this structure:

```json
{
  "playlists": [
    {
      "id": "playlist-id",
      "title": "Playlist Title",
      "titleEnglish": "English Title",
      "titleRussian": "Russian Title",
      "description": "Description in Arabic",
      "descriptionEnglish": "English Description",
      "descriptionRussian": "Russian Description",
      "thumbnailUrl": "https://...",
      "publishedAt": "2020-01-01T00:00:00Z",
      "videoCount": 15,
      "totalDuration": 46800,
      "viewCount": 342900,
      "category": {
        "id": "quran_tafsir",
        "name": "Quran Interpretation",
        "nameArabic": "تفسير القرآن الكريم",
        "nameRussian": "Толкование Корана",
        "icon": "📖"
      },
      "videos": [
        // Array of video objects
      ]
    }
  ]
}
```

## Benefits

1. **Dynamic**: No need to modify code when adding new playlist files
2. **Maintainable**: Single source of truth for available playlists
3. **Scalable**: Can handle any number of playlist files
4. **Type-Safe**: Full TypeScript support with proper interfaces
5. **Error Handling**: Graceful handling of missing or failed files
6. **Performance**: Parallel loading of all playlist files

## Troubleshooting

### Manifest Not Updating

- Ensure the script has proper permissions
- Check that the file path in the script is correct
- Verify that new files are valid JSON

### New Files Not Loading

- Run `npm run update-playlist-manifest` after adding files
- Check browser developer tools for network errors
- Verify file names in manifest match actual files

### TypeScript Errors

- Ensure new playlist files follow the correct interface structure
- Check that all required fields are present in playlist objects
