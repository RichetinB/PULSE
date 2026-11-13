use chrono::{DateTime, Utc};
use liblzma::read::XzDecoder;
use md5::{Digest, Md5};
use serde::Serialize;
use std::{
    fs,
    io::{Cursor, Read},
    path::Path,
};
use thiserror::Error;

pub const MAX_FILE_BYTES: u64 = 32 * 1024 * 1024;
const MAX_COMPRESSED_BYTES: usize = 16 * 1024 * 1024;
const MAX_DECOMPRESSED_BYTES: u64 = 32 * 1024 * 1024;
const MAX_STRING_BYTES: u64 = 1024 * 1024;
const MAX_EVENTS: usize = 2_000_000;
const FIRST_LAZER_VERSION: u32 = 30_000_000;
const MAX_BEATMAP_LINES: usize = 2_000_000;

#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct ReplaySummary {
    pub game_mode: GameMode,
    pub game_version: u32,
    pub beatmap_hash: Option<String>,
    pub player_name: Option<String>,
    pub replay_hash: Option<String>,
    pub score: u32,
    pub max_combo: u16,
    pub perfect: bool,
    pub hit_counts: HitCounts,
    pub accuracy: Option<f64>,
    pub mods: Vec<String>,
    pub unknown_mod_bits: u32,
    pub timestamp: String,
    pub event_count: usize,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct BeatmapSummary {
    pub md5: String,
    pub format_version: u32,
    pub title: Option<String>,
    pub artist: Option<String>,
    pub version: Option<String>,
    pub game_mode: GameMode,
    pub hit_object_count: usize,
}

impl BeatmapSummary {
    pub fn matches_replay(&self, replay: &ReplaySummary) -> bool {
        replay
            .beatmap_hash
            .as_deref()
            .is_some_and(|hash| hash.eq_ignore_ascii_case(&self.md5))
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
pub enum GameMode {
    #[serde(rename = "osu!standard")]
    Standard,
}

impl GameMode {
    pub fn as_str(self) -> &'static str {
        "osu!standard"
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
pub struct HitCounts {
    pub count_300: u16,
    pub count_100: u16,
    pub count_50: u16,
    pub count_geki: u16,
    pub count_katu: u16,
    pub count_miss: u16,
}

#[derive(Debug, Error)]
pub enum ReplayError {
    #[error("replay file is too large; maximum supported size is {MAX_FILE_BYTES} bytes")]
    FileTooLarge,
    #[error("could not read replay file: {0}")]
    Io(#[from] std::io::Error),
    #[error("unsupported game mode: {0}")]
    UnsupportedGameMode(u8),
    #[error("osu!lazer replay version {0} is not supported; import a classic osu!standard replay")]
    UnsupportedLazerVersion(u32),
    #[error("unsupported or invalid replay format: {0}")]
    InvalidFormat(String),
    #[error("replay decompressed data exceeds the {MAX_DECOMPRESSED_BYTES} byte limit")]
    DecompressionLimitExceeded,
    #[error("replay data contains invalid UTF-8")]
    InvalidUtf8(#[from] std::string::FromUtf8Error),
    #[error("beatmap file contains invalid UTF-8")]
    InvalidBeatmapUtf8,
}

pub fn parse_file(path: impl AsRef<Path>) -> Result<ReplaySummary, ReplayError> {
    let metadata = fs::metadata(path.as_ref())?;
    if metadata.len() > MAX_FILE_BYTES {
        return Err(ReplayError::FileTooLarge);
    }

    parse_bytes(&fs::read(path)?)
}

pub fn parse_beatmap_file(path: impl AsRef<Path>) -> Result<BeatmapSummary, ReplayError> {
    let metadata = fs::metadata(path.as_ref())?;
    if metadata.len() > MAX_FILE_BYTES {
        return Err(ReplayError::FileTooLarge);
    }

    parse_beatmap_bytes(&fs::read(path)?)
}

pub fn parse_beatmap_bytes(data: &[u8]) -> Result<BeatmapSummary, ReplayError> {
    if data.len() as u64 > MAX_FILE_BYTES {
        return Err(ReplayError::FileTooLarge);
    }

    let text = std::str::from_utf8(data).map_err(|_| ReplayError::InvalidBeatmapUtf8)?;
    let mut format_version = None;
    let mut section = "";
    let mut title = None;
    let mut artist = None;
    let mut version = None;
    let mut game_mode = None;
    let mut hit_object_count = 0;
    let mut line_count = 0;

    for raw_line in text.lines() {
        line_count += 1;
        if line_count > MAX_BEATMAP_LINES {
            return Err(ReplayError::InvalidFormat(
                "beatmap contains too many lines".to_string(),
            ));
        }

        let line = raw_line.trim();
        if line.is_empty() || line.starts_with("//") {
            continue;
        }
        if let Some(header) = line.strip_prefix("osu file format v") {
            format_version = Some(header.parse::<u32>().map_err(|_| {
                ReplayError::InvalidFormat("invalid beatmap format version".to_string())
            })?);
            continue;
        }
        if line.starts_with('[') && line.ends_with(']') {
            section = &line[1..line.len() - 1];
            continue;
        }

        match section {
            "General" => {
                if let Some((key, value)) = line.split_once(':') {
                    if key.trim() == "Mode" {
                        let mode = value.trim().parse::<u8>().map_err(|_| {
                            ReplayError::InvalidFormat("invalid beatmap game mode".to_string())
                        })?;
                        if mode != 0 {
                            return Err(ReplayError::UnsupportedGameMode(mode));
                        }
                        game_mode = Some(GameMode::Standard);
                    }
                }
            }
            "Metadata" => {
                if let Some((key, value)) = line.split_once(':') {
                    let value = value.trim().to_string();
                    match key.trim() {
                        "Title" => title = Some(value),
                        "Artist" => artist = Some(value),
                        "Version" => version = Some(value),
                        _ => {}
                    }
                }
            }
            "HitObjects" => hit_object_count += 1,
            _ => {}
        }
    }

    let format_version = format_version.ok_or_else(|| {
        ReplayError::InvalidFormat("beatmap is missing its format version".to_string())
    })?;
    if game_mode.is_none() {
        return Err(ReplayError::InvalidFormat(
            "beatmap is missing osu!standard mode metadata".to_string(),
        ));
    }

    let mut digest = Md5::new();
    digest.update(data);
    let md5 = digest
        .finalize()
        .iter()
        .map(|byte| format!("{byte:02x}"))
        .collect();

    Ok(BeatmapSummary {
        md5,
        format_version,
        title,
        artist,
        version,
        game_mode: GameMode::Standard,
        hit_object_count,
    })
}

pub fn parse_bytes(data: &[u8]) -> Result<ReplaySummary, ReplayError> {
    if data.len() as u64 > MAX_FILE_BYTES {
        return Err(ReplayError::FileTooLarge);
    }

    let mut reader = Reader::new(data);
    let mode = reader.read_u8()?;
    if mode != 0 {
        return Err(ReplayError::UnsupportedGameMode(mode));
    }

    let game_version = reader.read_u32()?;
    if game_version >= FIRST_LAZER_VERSION {
        return Err(ReplayError::UnsupportedLazerVersion(game_version));
    }

    let beatmap_hash = reader.read_string()?;
    let player_name = reader.read_string()?;
    let replay_hash = reader.read_string()?;
    let hit_counts = HitCounts {
        count_300: reader.read_u16()?,
        count_100: reader.read_u16()?,
        count_50: reader.read_u16()?,
        count_geki: reader.read_u16()?,
        count_katu: reader.read_u16()?,
        count_miss: reader.read_u16()?,
    };
    let score = reader.read_u32()?;
    let max_combo = reader.read_u16()?;
    let perfect = match reader.read_u8()? {
        0 => false,
        1 => true,
        value => {
            return Err(ReplayError::InvalidFormat(format!(
                "invalid perfect flag {value}"
            )))
        }
    };
    let mods_value = reader.read_u32()?;
    let _life_bar_graph = reader.read_string()?;
    let timestamp = ticks_to_timestamp(reader.read_i64()?)?;
    let compressed_len = reader.read_u32()? as usize;

    if compressed_len > MAX_COMPRESSED_BYTES {
        return Err(ReplayError::InvalidFormat(
            "compressed replay data exceeds the size limit".to_string(),
        ));
    }

    let compressed = reader.read_exact(compressed_len)?;
    let decompressed = decompress(compressed)?;
    let event_count = parse_events(&decompressed)?;
    let _online_score_id = reader.read_i64()?;

    if reader.remaining() != 0 {
        return Err(ReplayError::InvalidFormat(
            "unexpected trailing bytes after replay".to_string(),
        ));
    }

    let accuracy = calculate_accuracy(hit_counts);
    let (mods, unknown_mod_bits) = decode_mods(mods_value);

    Ok(ReplaySummary {
        game_mode: GameMode::Standard,
        game_version,
        beatmap_hash,
        player_name,
        replay_hash,
        score,
        max_combo,
        perfect,
        hit_counts,
        accuracy,
        mods,
        unknown_mod_bits,
        timestamp,
        event_count,
    })
}

fn decompress(data: &[u8]) -> Result<Vec<u8>, ReplayError> {
    let mut decoder = XzDecoder::new_multi_decoder(data).take(MAX_DECOMPRESSED_BYTES + 1);
    let mut output = Vec::new();
    let read = decoder.read_to_end(&mut output)?;
    if read as u64 > MAX_DECOMPRESSED_BYTES {
        return Err(ReplayError::DecompressionLimitExceeded);
    }
    Ok(output)
}

fn parse_events(data: &[u8]) -> Result<usize, ReplayError> {
    let text = String::from_utf8(data.to_vec())?;
    let trimmed = text.trim_end_matches(',');
    if trimmed.is_empty() {
        return Ok(0);
    }

    let total_events = trimmed.split(',').count();
    let mut count = 0;
    for (index, event) in trimmed.split(',').enumerate() {
        let fields: Vec<&str> = event.split('|').collect();
        if fields.len() != 4 {
            return Err(ReplayError::InvalidFormat(format!(
                "replay event {index} does not contain four fields"
            )));
        }

        fields[0].parse::<i32>().map_err(|_| {
            ReplayError::InvalidFormat(format!("replay event {index} has an invalid time delta"))
        })?;
        let x = fields[1].parse::<f32>().map_err(|_| {
            ReplayError::InvalidFormat(format!("replay event {index} has an invalid x coordinate"))
        })?;
        let y = fields[2].parse::<f32>().map_err(|_| {
            ReplayError::InvalidFormat(format!("replay event {index} has an invalid y coordinate"))
        })?;
        if !x.is_finite() || !y.is_finite() {
            return Err(ReplayError::InvalidFormat(format!(
                "replay event {index} has a non-finite coordinate"
            )));
        }
        fields[3].parse::<u32>().map_err(|_| {
            ReplayError::InvalidFormat(format!("replay event {index} has invalid key data"))
        })?;

        if fields[0] == "-12345" && index + 1 == total_events {
            continue;
        }

        count += 1;
        if count > MAX_EVENTS {
            return Err(ReplayError::InvalidFormat(
                "replay contains too many events".to_string(),
            ));
        }
    }

    Ok(count)
}

fn ticks_to_timestamp(ticks: i64) -> Result<String, ReplayError> {
    const TICKS_TO_UNIX_EPOCH: i64 = 621_355_968_000_000_000;
    const TICKS_PER_SECOND: i64 = 10_000_000;
    let since_epoch = ticks
        .checked_sub(TICKS_TO_UNIX_EPOCH)
        .ok_or_else(|| ReplayError::InvalidFormat("timestamp is out of range".to_string()))?;
    let seconds = since_epoch.div_euclid(TICKS_PER_SECOND);
    let nanos = (since_epoch.rem_euclid(TICKS_PER_SECOND) * 100) as u32;
    DateTime::<Utc>::from_timestamp(seconds, nanos)
        .map(|timestamp| timestamp.to_rfc3339())
        .ok_or_else(|| ReplayError::InvalidFormat("timestamp is out of range".to_string()))
}

fn calculate_accuracy(counts: HitCounts) -> Option<f64> {
    let total = u64::from(counts.count_300)
        + u64::from(counts.count_100)
        + u64::from(counts.count_50)
        + u64::from(counts.count_miss);
    if total == 0 {
        return None;
    }

    let weighted = 300 * u64::from(counts.count_300)
        + 100 * u64::from(counts.count_100)
        + 50 * u64::from(counts.count_50);
    Some(weighted as f64 / (300 * total) as f64)
}

fn decode_mods(value: u32) -> (Vec<String>, u32) {
    const MODS: &[(u32, &str)] = &[
        (1 << 0, "NoFail"),
        (1 << 1, "Easy"),
        (1 << 2, "TouchDevice"),
        (1 << 3, "Hidden"),
        (1 << 4, "HardRock"),
        (1 << 5, "SuddenDeath"),
        (1 << 6, "DoubleTime"),
        (1 << 7, "Relax"),
        (1 << 8, "HalfTime"),
        (1 << 9, "Nightcore"),
        (1 << 10, "Flashlight"),
        (1 << 11, "Autoplay"),
        (1 << 12, "SpunOut"),
        (1 << 13, "Autopilot"),
        (1 << 14, "Perfect"),
        (1 << 20, "FadeIn"),
        (1 << 21, "Random"),
        (1 << 22, "Cinema"),
        (1 << 23, "Target"),
        (1 << 29, "ScoreV2"),
        (1 << 30, "Mirror"),
    ];
    let mut names = Vec::new();
    let mut known = 0;
    for (bit, name) in MODS {
        if value & bit != 0 {
            names.push((*name).to_string());
            known |= bit;
        }
    }
    (names, value & !known)
}

struct Reader<'a> {
    cursor: Cursor<&'a [u8]>,
}

impl<'a> Reader<'a> {
    fn new(data: &'a [u8]) -> Self {
        Self {
            cursor: Cursor::new(data),
        }
    }

    fn remaining(&self) -> usize {
        self.cursor.get_ref().len() - self.cursor.position() as usize
    }

    fn read_exact(&mut self, length: usize) -> Result<&'a [u8], ReplayError> {
        if self.remaining() < length {
            return Err(ReplayError::InvalidFormat(
                "replay is truncated".to_string(),
            ));
        }
        let start = self.cursor.position() as usize;
        self.cursor.set_position((start + length) as u64);
        Ok(&self.cursor.get_ref()[start..start + length])
    }

    fn read_u8(&mut self) -> Result<u8, ReplayError> {
        Ok(self.read_exact(1)?[0])
    }

    fn read_u16(&mut self) -> Result<u16, ReplayError> {
        let bytes = self.read_exact(2)?;
        Ok(u16::from_le_bytes([bytes[0], bytes[1]]))
    }

    fn read_u32(&mut self) -> Result<u32, ReplayError> {
        let bytes = self.read_exact(4)?;
        Ok(u32::from_le_bytes([bytes[0], bytes[1], bytes[2], bytes[3]]))
    }

    fn read_i64(&mut self) -> Result<i64, ReplayError> {
        let bytes = self.read_exact(8)?;
        Ok(i64::from_le_bytes([
            bytes[0], bytes[1], bytes[2], bytes[3], bytes[4], bytes[5], bytes[6], bytes[7],
        ]))
    }

    fn read_string(&mut self) -> Result<Option<String>, ReplayError> {
        match self.read_u8()? {
            0 => Ok(None),
            0x0b => {
                let length = self.read_uleb128()?;
                if length > MAX_STRING_BYTES {
                    return Err(ReplayError::InvalidFormat(
                        "replay string exceeds the size limit".to_string(),
                    ));
                }
                Ok(Some(String::from_utf8(
                    self.read_exact(length as usize)?.to_vec(),
                )?))
            }
            indicator => Err(ReplayError::InvalidFormat(format!(
                "invalid osu! string marker 0x{indicator:02x}"
            ))),
        }
    }

    fn read_uleb128(&mut self) -> Result<u64, ReplayError> {
        let mut value = 0u64;
        let mut shift = 0;
        loop {
            let byte = self.read_u8()?;
            if shift == 63 && byte & 0x7f > 1 {
                return Err(ReplayError::InvalidFormat(
                    "invalid ULEB128 string length".to_string(),
                ));
            }
            value |= u64::from(byte & 0x7f) << shift;
            if byte & 0x80 == 0 {
                return Ok(value);
            }
            shift += 7;
            if shift >= 64 {
                return Err(ReplayError::InvalidFormat(
                    "invalid ULEB128 string length".to_string(),
                ));
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use liblzma::write::XzEncoder;
    use std::io::Write;

    fn osu_string(value: Option<&str>) -> Vec<u8> {
        let Some(value) = value else {
            return vec![0];
        };
        let bytes = value.as_bytes();
        let mut result = vec![0x0b];
        let mut length = bytes.len() as u64;
        while length >= 0x80 {
            result.push((length as u8 & 0x7f) | 0x80);
            length >>= 7;
        }
        result.push(length as u8);
        result.extend_from_slice(bytes);
        result
    }

    fn fixture(mode: u8, compressed: &[u8]) -> Vec<u8> {
        let mut result = vec![mode];
        result.extend_from_slice(&20_241_101u32.to_le_bytes());
        result.extend(osu_string(Some("beatmap-hash")));
        result.extend(osu_string(Some("player")));
        result.extend(osu_string(Some("replay-hash")));
        for count in [300u16, 10, 2, 1, 3, 4] {
            result.extend_from_slice(&count.to_le_bytes());
        }
        result.extend_from_slice(&123_456u32.to_le_bytes());
        result.extend_from_slice(&987u16.to_le_bytes());
        result.push(0);
        result.extend_from_slice(&(1u32 << 3).to_le_bytes());
        result.extend(osu_string(None));
        result.extend_from_slice(
            &(621_355_968_000_000_000i64 + 1_700_000_000 * 10_000_000).to_le_bytes(),
        );
        result.extend_from_slice(&(compressed.len() as u32).to_le_bytes());
        result.extend_from_slice(compressed);
        result.extend_from_slice(&42i64.to_le_bytes());
        result
    }

    fn compressed_events() -> Vec<u8> {
        let mut encoder = XzEncoder::new(Vec::new(), 6);
        encoder
            .write_all(b"0|256|192|1,16|260|190|5,-12345|0|0|123,")
            .unwrap();
        encoder.finish().unwrap()
    }

    #[test]
    fn parses_classic_standard_replay_metadata_and_events() {
        let replay = parse_bytes(&fixture(0, &compressed_events())).unwrap();
        assert_eq!(replay.game_mode, GameMode::Standard);
        assert_eq!(replay.player_name.as_deref(), Some("player"));
        assert_eq!(replay.event_count, 2);
        assert_eq!(replay.mods, vec!["Hidden"]);
        assert_eq!(replay.accuracy, Some(911.0 / 948.0));
    }

    #[test]
    fn rejects_non_standard_mode() {
        let error = parse_bytes(&fixture(1, &compressed_events())).unwrap_err();
        assert!(matches!(error, ReplayError::UnsupportedGameMode(1)));
    }

    #[test]
    fn rejects_truncated_replay() {
        let mut data = fixture(0, &compressed_events());
        data.truncate(data.len() - 3);
        assert!(matches!(
            parse_bytes(&data),
            Err(ReplayError::InvalidFormat(_))
        ));
    }

    #[test]
    fn rejects_invalid_compressed_data() {
        let error = parse_bytes(&fixture(0, b"not-lzma")).unwrap_err();
        assert!(matches!(
            error,
            ReplayError::Io(_) | ReplayError::InvalidFormat(_)
        ));
    }

    #[test]
    fn rejects_lazer_versions_explicitly() {
        let mut data = fixture(0, &compressed_events());
        data[1..5].copy_from_slice(&30_000_000u32.to_le_bytes());
        assert!(matches!(
            parse_bytes(&data),
            Err(ReplayError::UnsupportedLazerVersion(30_000_000))
        ));
    }

    #[test]
    fn rejects_files_above_the_input_limit() {
        let data = vec![0; MAX_FILE_BYTES as usize + 1];
        assert!(matches!(parse_bytes(&data), Err(ReplayError::FileTooLarge)));
    }

    #[test]
    fn rejects_decompressed_replay_data_above_the_limit() {
        let mut encoder = XzEncoder::new(Vec::new(), 6);
        encoder
            .write_all(&vec![b'0'; MAX_DECOMPRESSED_BYTES as usize + 1])
            .unwrap();
        let compressed = encoder.finish().unwrap();
        let error = parse_bytes(&fixture(0, &compressed)).unwrap_err();
        assert!(matches!(error, ReplayError::DecompressionLimitExceeded));
    }

    #[test]
    fn serializes_the_versioned_game_mode_contract() {
        let replay = parse_bytes(include_bytes!("../tests/fixtures/classic-standard.osr")).unwrap();
        let json = serde_json::to_value(replay).unwrap();
        assert_eq!(json["game_mode"], "osu!standard");
    }

    #[test]
    fn parses_classic_beatmap_metadata_and_hashes_exact_input_bytes() {
        let data = b"osu file format v14\r\n\r\n[General]\r\nMode: 0\r\n\r\n[Metadata]\r\nTitle:Test Map\r\nArtist:Test Artist\r\nVersion:Insane\r\n\r\n[HitObjects]\r\n256,192,1000,1,0,0:0:0:0:\r\n";
        let beatmap = parse_beatmap_bytes(data).unwrap();

        assert_eq!(beatmap.format_version, 14);
        assert_eq!(beatmap.title.as_deref(), Some("Test Map"));
        assert_eq!(beatmap.artist.as_deref(), Some("Test Artist"));
        assert_eq!(beatmap.version.as_deref(), Some("Insane"));
        assert_eq!(beatmap.hit_object_count, 1);
        assert_eq!(
            beatmap.md5,
            "78176277b0e28a20b6394fbc20bdad1f"
        );
    }

    #[test]
    fn matches_replay_by_exact_beatmap_md5_case_insensitively() {
        let beatmap = parse_beatmap_bytes(
            b"osu file format v14\n[General]\nMode: 0\n[Metadata]\nTitle:Map\n",
        )
        .unwrap();
        let mut replay = parse_bytes(&fixture(0, &compressed_events())).unwrap();
        replay.beatmap_hash = Some(beatmap.md5.to_uppercase());

        assert!(beatmap.matches_replay(&replay));
        replay.beatmap_hash = Some("different".to_string());
        assert!(!beatmap.matches_replay(&replay));
    }

    #[test]
    fn rejects_non_standard_beatmaps() {
        let error = parse_beatmap_bytes(
            b"osu file format v14\n[General]\nMode: 1\n[Metadata]\nTitle:Taiko\n",
        )
        .unwrap_err();
        assert!(matches!(error, ReplayError::UnsupportedGameMode(1)));
    }
}
