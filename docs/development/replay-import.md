# Replay import

PULSE imports classic osu!standard `.osr` files locally through the Replay
Analyzer screen. The selected file is read by the Rust `pulse-replay` crate;
the parser has no Tauri, UI, network, or storage dependencies.

The Replay Analyzer also accepts a manually selected classic `.osu` beatmap.
The parser computes the MD5 from the exact imported bytes and exposes the
metadata needed for display. A replay is an exact match when its embedded
beatmap hash equals that MD5; no title, path, or online lookup is used as a
fallback.

The parser validates the classic replay header, requires game mode `0`
(osu!standard), validates strings and replay events, and bounds input at 32 MiB,
compressed replay data at 16 MiB, decompressed replay data at 32 MiB, strings
at 1 MiB, and decoded events at two million. Invalid, truncated, malformed, or
over-limit input returns an error instead of being treated as a successful
import.

The implementation uses a small custom parser rather than delegating the
boundary to a general replay library. This keeps the domain contract explicit
and allows PULSE to enforce its own compressed and decompressed size limits
before exposing data to the desktop layer.

## Compatibility

Classic osu!standard replay metadata, hit counts, mods, timestamps, and replay
event counts are supported. Beatmap titles, star ratings, aim accuracy, and
timing errors are intentionally not inferred because they require validated
beatmap data or additional analysis.

Classic `.osu` format version, osu!standard mode, title, artist, difficulty
version, hit-object count, and exact MD5 identity are supported. An optional
UTF-8 BOM before the format-version header is accepted, while the MD5 remains
calculated from the original raw file bytes. Other game modes are rejected
explicitly.

osu!lazer replay versions are detected and rejected explicitly in this slice.
They are not silently interpreted as classic replays. Lazer compatibility can
be added later with versioned score-info handling and dedicated fixtures.

## Verification status

Automated parser, frontend, and CI checks validate the implementation and the
Windows installer build. A manual launch of the packaged Windows executable is
a separate verification step; the release-only Windows subsystem setting is
not claimed as manually verified until that smoke test is performed.
