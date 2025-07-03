To build a full-featured Quran app using free APIs for reading, listening, and accessing Surahs, Ayahs, Juz, and other related data, the **Al Quran Cloud API** (https://alquran.cloud/api) is an excellent choice. It provides a RESTful interface to retrieve the Quran in various formats, including text and audio, with support for translations and recitations. Below, I’ll outline the key endpoints of the Al Quran Cloud API that you can use to achieve your goals, along with other relevant free APIs that complement it for a comprehensive Quran app. All APIs listed are free to use, similar to Tanzil, and I’ll ensure they cover viewing Surahs, the entire Quran, audio recitations, and additional features.

### 1. Al Quran Cloud API (https://alquran.cloud/api)
The Al Quran Cloud API is a robust, free API that provides access to the Quran’s text, translations, audio recitations, and metadata. It supports various editions (e.g., Arabic text, translations like Muhammad Asad’s English translation, and audio recitations like Mishary Alafasy’s). It has no rate limits, making it suitable for continuous use in apps, though caching responses locally is recommended for performance.[](https://github.com/gadingnst/quran-api)

#### Key Endpoints for Your Needs
Here are the main endpoints you’ll need to view Surahs, the entire Quran, audio, and more:

- **List All Editions**  
  To get available text and audio editions (e.g., translations, recitations, or tafsir):  
  `GET http://api.alquran.cloud/v1/edition`  
  - Filters:  
    - `?format=audio` (for audio editions)  
    - `?language=en` (for English translations)  
    - `?type=translation` (for translations) or `?type=versebyverse` (for audio recitations)  
  - Example: `http://api.alquran.cloud/v1/edition?format=audio&language=fr&type=versebyverse`  
    Returns all French verse-by-verse audio editions.  [](https://alquran.cloud/api)
  - Use this to display available translations or reciters in your app.

- **Get the Entire Quran**  
  To retrieve the complete Quran in a specific edition:  
  `GET http://api.alquran.cloud/v1/quran/{{edition}}`  
  - Examples:  
    - `http://api.alquran.cloud/v1/quran/en.asad` (Muhammad Asad’s English translation)  
    - `http://api.alquran.cloud/v1/quran/quran-uthmani` (Arabic text)  
    - `http://api.alquran.cloud/v1/quran/ar.alafasy` (Mishary Alafasy’s audio recitation).  [](https://alquran.cloud/api)
  - Use this to display the full Quran text or stream audio for the entire Quran.

- **Get a Specific Surah**  
  To retrieve a specific Surah (the Quran has 114 Surahs):  
  `GET http://api.alquran.cloud/v1/surah/{{surah_number}}/{{edition}}`  
  - Examples:  
    - `http://api.alquran.cloud/v1/surah/114/en.asad` (Surat An-Naas, Muhammad Asad’s translation)  
    - `http://api.alquran.cloud/v1/surah/114/ar.alafasy` (Surat An-Naas, Mishary Alafasy’s recitation)  
    - `http://api.alquran.cloud/v1/surah/114` (Surat An-Naas in Arabic).  [](https://alquran.cloud/api)
  - Optional Parameters:  
    - `?offset=1&limit=3` (e.g., `http://api.alquran.cloud/v1/surah/1?offset=1&limit=3` for verses 2–4 of Surah Al-Fatiha).  [](https://alquran.cloud/api)
  - Use this to display a single Surah with its verses or play its audio.

- **Get a Specific Ayah**  
  To retrieve a specific Ayah (verse):  
  `GET http://api.alquran.cloud/v1/ayah/{{reference}}/{{edition}}`  
  - `{{reference}}` can be the Ayah number (1 to 6236) or `surah:ayah` format (e.g., `2:255` for Ayat Al-Kursi).  
  - Examples:  
    - `http://api.alquran.cloud/v1/ayah/262/en.asad` (Ayat Al-Kursi, Muhammad Asad’s translation)  
    - `http://api.alquran.cloud/v1/ayah/2:255/ar.alafasy` (Ayat Al-Kursi, Mishary Alafasy’s audio)  
    - `http://api.alquran.cloud/v1/ayah/262` (Ayat Al-Kursi in Arabic).  [](https://alquran.cloud/api)
  - Use this to display or play a specific verse.

- **Get Multiple Editions for a Surah or Ayah**  
  To retrieve a Surah or Ayah in multiple editions (e.g., Arabic + translations):  
  `GET http://api.alquran.cloud/v1/surah/{{surah}}/editions/{{edition1}},{{edition2}}`  
  `GET http://api.alquran.cloud/v1/ayah/{{reference}}/editions/{{edition1}},{{edition2}}`  
  - Example:  
    - `http://api.alquran.cloud/v1/surah/114/editions/quran-uthmani,en.asad,en.pickthall` (Surat An-Naas in Arabic, Asad’s, and Pickthall’s translations)  
    - `http://api.alquran.cloud/v1/ayah/262/editions/quran-uthmani,en.asad,en.pickthall` (Ayat Al-Kursi in three editions).  [](https://alquran.cloud/api)
  - Use this to show side-by-side translations or combine text and audio.

- **Get a Juz**  
  To retrieve a specific Juz (the Quran has 30 Juz):  
  `GET http://api.alquran.cloud/v1/juz/{{juz_number}}/{{edition}}`  
  - Examples:  
    - `http://api.alquran.cloud/v1/juz/30/en.asad` (Juz 30, Muhammad Asad’s translation)  
    - `http://api.alquran.cloud/v1/juz/30/quran-uthmani` (Juz 30, Arabic text)  
    - `http://api.alquran.cloud/v1/juz/1/quran-uthmani?offset=3&limit=10` (Ayahs 4–13 of Juz 1).  [](https://alquran.cloud/api)
  - Use this to display or stream a Juz.

- **Get Metadata**  
  To get metadata about Surahs (e.g., name, number of Ayahs, revelation type):  
  `GET http://api.alquran.cloud/v1/meta`  
  - Example: `http://api.alquran.cloud/v1/meta`  
    Returns details like Surah names, meanings, and revelation types (Meccan/Medinan).  [](https://medium.com/%40SyedMuhammadArsalanShah/a-comprehensive-guide-fetching-and-displaying-quran-api-data-in-laravel-using-http-client-793d38053970)
  - Use this to build a Surah selection menu or display Surah information.

- **Access Audio Files via CDN**  
  To stream or download audio for Ayahs or Surahs:  
  - Ayah Audio: `https://cdn.islamic.network/quran/audio/{{bitrate}}/{{edition}}/{{ayah_number}}.mp3`  
    - Example: `https://cdn.islamic.network/quran/audio/128/ar.alafasy/262.mp3` (Ayat Al-Kursi by Mishary Alafasy).  [](https://alquran.cloud/cdn)
  - Surah Audio: `https://cdn.islamic.network/quran/audio-surah/{{bitrate}}/{{edition}}/{{surah_number}}.mp3`  
    - Example: `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/114.mp3` (Surat An-Naas by Mishary Alafasy).  [](https://alquran.cloud/cdn)
  - Bitrate: Typically 128 or 64 (check available bitrates at `https://raw.githubusercontent.com/islamic-network/cdn/master/info/cdn_surah_audio.json`).  [](https://alquran.cloud/cdn)
  - Use this to integrate audio playback in your app.

- **Access Ayah Images**  
  To display images of Ayahs (e.g., for Arabic text rendering):  
  - Normal: `https://cdn.islamic.network/quran/images/{{surah}}_{{ayah}}.png`  
  - High Resolution: `https://cdn.islamic.network/quran/images/high-resolution/{{surah}}_{{ayah}}.png`  
    - Example: `https://  cdn.islamic.network/quran/images/2_255.png` (Ayat Al-Kursi image).  [](https://alquran.cloud/cdn)
  - Use this to display visually formatted Quranic text.

- **Tajweed Parsing**  
  To parse and display Tajweed rules for Arabic text:  
  - Use the Al Quran Cloud API’s text responses (e.g., `quran-uthmani`) and the Tajweed parsing library: `https://github.com/meezaan/alquran-tools`.  [](https://alquran.cloud/tajweed-guide)
  - Example: The API returns Tajweed data like `[h:9421[ٱ]` for Hamzat ul-Wasl, which can be parsed to display colored Tajweed rules.  
  - Use this for advanced apps that highlight pronunciation rules.

#### Usage Notes
- **No Rate Limits**: The API is free with no rate limits, but caching responses locally is recommended to reduce server load and improve performance.[](https://quranapi.pages.dev/)
- **Open Source**: The API and related tools are open source, with code available at `https://github.com/islamic-network/api.alquran.cloud`.[](https://github.com/islamic-network/api.alquran.cloud)
- **Documentation**: Full documentation is available at `https://alquran.cloud/api` and `https://alquran.cloud/docs`.[](https://publicapi.dev/quran-cloud-api)
- **Client Libraries**: Use PHP (`https://github.com/meezaan/alquran-api-client-php`) or Java (`https://github.com/anas-elgarhy/alquran-cloud-api`) wrappers for easier integration.[](https://alquran.cloud/api-clients)[](https://github.com/0x61nas/alquran-cloud-api)

#### Example: Fetching and Displaying a Surah
Here’s a simple example in JavaScript to fetch and display Surah Al-Fatiha with Muhammad Asad’s translation:
```javascript
fetch('http://api.alquran.cloud/v1/surah/1/en.asad')
  .then(response => response.json())
  .then(data => {
    const surah = data.data;
    console.log(`Surah: ${surah.englishName}`);
    surah.ayahs.forEach(ayah => {
      console.log(`Ayah ${ayah.numberInSurah}: ${ayah.text}`);
    });
  });
```
This can be adapted to display in your app’s UI or to play audio by fetching `ar.alafasy` instead.

### Recommendations for Building Your App
- **Core API**: Use **Al Quran Cloud API** as your primary API for its comprehensive coverage of text, translations, audio, and images, with no rate limits and robust documentation.[](https://alquran.cloud/)
- **Supplementary APIs**:
  - Use **EQuran.id** or **gadingnst’s Quran API** for Indonesian translations and tafsir if targeting Indonesian users.[](https://equran.id/apidev/v2)[](https://github.com/gadingnst/quran-api)
  - Use **Quran.com API** for additional translations or a different API structure.[](https://quran.com/developers)
  - Use **MP3Quran.net API** for extra reciters or tafsir.[](https://mp3quran.net/ar/api)
  - Use **Fawaz Ahmed’s Quran API** for translations in niche languages.[](https://github.com/fawazahmed0/quran-api)
- **Caching**: Cache API responses locally to reduce server load and handle potential rate limits (e.g., for gadingnst’s API).[](https://github.com/gadingnst/quran-api)
- **Audio Playback**: Use Al Quran Cloud’s CDN for audio files, ensuring you check available bitrates and editions.[](https://alquran.cloud/cdn)
- **Tajweed Support**: Integrate the Tajweed parsing library from Al Quran Cloud for advanced apps.[](https://alquran.cloud/tajweed-guide)
- **UI Example**: For displaying Surahs, use a table or list with metadata (e.g., Surah name, number of Ayahs) fetched from `/meta`, and allow users to select editions for text or audio. See the Laravel example for inspiration.[](https://medium.com/%40SyedMuhammadArsalanShah/a-comprehensive-guide-fetching-and-displaying-quran-api-data-in-laravel-using-http-client-793d38053970)

### Sample Workflow for Your App
1. **Fetch Surah List**: Use `http://api.alquran.cloud/v1/meta` to display all Surahs with names and metadata.
2. **Display Surah**: On user selection, fetch `http://api.alquran.cloud/v1/surah/{{surah_number}}/editions/quran-uthmani,en.asad` for Arabic and English text.
3. **Play Audio**: Fetch `http://api.alquran.cloud/v1/surah/{{surah_number}}/ar.alafasy` for audio, or use CDN URLs like `https://cdn.islamic.network/quran/audio/128/ar.alafasy/{{ayah_number}}.mp3`.
4. **Show Images**: Display Ayah images using `https://cdn.islamic.network/quran/images/{{surah}}_{{ayah}}.png`.
5. **Add Tafsir (Optional)**: Use EQuran.id or MP3Quran.net for tafsir in specific languages.