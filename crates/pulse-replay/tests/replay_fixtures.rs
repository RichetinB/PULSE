use pulse_replay::{parse_bytes, GameMode};

#[test]
fn parses_representative_classic_osr_fixture() {
    let replay = parse_bytes(include_bytes!("fixtures/classic-standard.osr"))
        .expect("fixture should be a valid classic .osr replay");

    assert_eq!(replay.game_mode, GameMode::Standard);
    assert_eq!(replay.player_name.as_deref(), Some("fixture-player"));
    assert_eq!(replay.beatmap_hash.as_deref(), Some("beatmap-hash"));
    assert_eq!(replay.event_count, 2);
}
