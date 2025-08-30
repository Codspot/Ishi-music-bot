# YouTube-First Configuration Guide

## 🎵 Overview

Your bot is now configured to prioritize **YouTube** as the primary music source, giving you access to the largest music library available. This provides more song variety compared to SoundCloud-first configurations.

## ⚙️ Current Configuration

### Plugin Priority Order:

1. **YouTube Plugin** (Primary) - Largest music catalog
2. **SoundCloud Plugin** (Fallback) - Alternative source
3. **Spotify Plugin** (Metadata only) - Resolves to YouTube/SoundCloud
4. **YtDlp Plugin** (Last resort) - Universal extractor

### Search Strategy (Enhanced Bot Detection Avoidance):

For **Render/Production**:

```javascript
[
  query, // Original query (YouTube first)
  `ytsearch:${query}`, // Explicit YouTube search
  `ytsearch:${query} official`, // YouTube + "official"
  `ytsearch:${query} music video`, // YouTube + "music video"
  `ytsearch:${query} lyrics`, // YouTube + "lyrics"
  `ytsearch:${query} audio`, // YouTube + "audio"
  `ytsearch:${query} song`, // YouTube + "song"
  `scsearch:${query}`, // SoundCloud fallback
];
```

### Bot Detection Countermeasures:

- **Progressive Delays**: 500ms → 1000ms → 1500ms → 2000ms between attempts
- **Multiple Search Variations**: 7 different YouTube search formats
- **Realistic User-Agent**: Chrome 120 browser headers
- **Rate Limit Awareness**: Automatic delays on cloud platforms

## 🚀 Benefits of YouTube-First

### ✅ Advantages:

- **Massive Music Library**: Millions of songs, covers, remixes
- **Latest Releases**: New music appears on YouTube first
- **Variety**: Official tracks, covers, live performances, remixes
- **Global Content**: Music from all regions and languages
- **Quality Options**: Multiple quality streams available

### ⚠️ Potential Challenges:

- **Bot Detection**: YouTube actively detects automated requests
- **Rate Limiting**: More aggressive on cloud platforms like Render
- **Region Blocks**: Some content may be geo-restricted
- **Age Restrictions**: Some videos require age verification

## 🛠️ Troubleshooting

### If Songs Frequently Fail:

1. **Check Bot Status**:

   ```
   /audiotest
   ```

2. **Try Different Search Terms**:

   - Add "official" to search
   - Try artist name + song name
   - Use quotes for exact matches

3. **Monitor Console Logs**:
   ```
   [DEBUG] Attempt 1: Trying search strategy: your song
   [DEBUG] Attempt 2: Trying search strategy: ytsearch:your song
   ```

### Common Error Solutions:

| Error                    | Solution                                      |
| ------------------------ | --------------------------------------------- |
| "Video unavailable"      | Try different search terms                    |
| "Sign in to confirm age" | Use family-friendly searches                  |
| "Private video"          | Search for official/public versions           |
| "No result found"        | Add fallback keywords (official, audio, etc.) |

## 🔧 Environment Variables

```env
# YouTube Priority Configuration
PREFER_SOUNDCLOUD=false    # Prioritizes YouTube over SoundCloud
YOUTUBE_PREMIUM=false      # No cookies needed for Render
YTSR_NO_UPDATE=true       # Prevents update checks
YTDL_NO_UPDATE=true       # Prevents update checks
```

## 📊 Performance Optimization

### For Better YouTube Success Rate:

1. **Search Strategy**: Bot tries 7 different YouTube formats before falling back to SoundCloud
2. **Progressive Delays**: Prevents rate limiting with smart delays
3. **Error Handling**: Graceful fallback to alternative sources
4. **Quality Settings**: Optimized for best audio quality

### Monitoring Success:

Watch console logs for search attempt patterns:

```
✅ Success on attempt 1 (Direct YouTube)
⚠️ Fallback to attempt 3 (YouTube + "official")
🔄 Using SoundCloud fallback (attempt 8)
```

## 🚨 Important Notes

### For Render Deployment:

- YouTube works but may have higher failure rates than SoundCloud
- Multiple fallback strategies minimize failed requests
- Progressive delays prevent IP blocking
- No YouTube Premium cookies needed (but would help if available)

### Recommendation:

- This configuration maximizes music availability
- Expect ~80-90% success rate with YouTube
- SoundCloud provides reliable fallback for remaining ~10-20%

## 🔄 Switching Back to SoundCloud-First

If you experience too many YouTube failures, switch back with:

```env
PREFER_SOUNDCLOUD=true
```

Then update `index.js` to put SoundCloud first in the plugins array.

---

**Status**: ✅ **YouTube-First Configuration Active**  
**Fallbacks**: SoundCloud → Spotify → YtDlp  
**Bot Detection**: Enhanced countermeasures enabled  
**Platform**: Optimized for Render deployment
