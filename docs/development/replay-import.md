# Replay import

PULSE imports classic osu!standard `.osr` files locally through the Replay
Analyzer screen. The selected file is read by the Rust `pulse-replay` crate;
the parser has no Tauri, UI, network, or storage dependencies.

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

osu!lazer replay versions are detected and rejected explicitly in this slice.
They are not silently interpreted as classic replays. Lazer compatibility can
be added later with versioned score-info handling and dedicated fixtures.

## Verification status

Automated parser, frontend, and CI checks validate the implementation and the
Windows installer build. A manual launch of the packaged Windows executable is
a separate verification step; the release-only Windows subsystem setting is
not claimed as manually verified until that smoke test is performed.
