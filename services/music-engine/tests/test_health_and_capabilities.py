from __future__ import annotations

from app.schemas.jobs import JobType


def test_health_endpoint_reports_ok_and_runtime_dependencies(client):
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["service"] == "sonora-music-engine"
    assert body["storage_backend"] == "local"
    assert body["job_repository_backend"] == "memory"
    assert body["dependencies"]["ffmpeg_available"] is True
    assert body["dependencies"]["ffprobe_available"] is True
    assert body["dependencies"]["fluidsynth_available"] is True
    assert body["dependencies"]["soundfont_available"] is True
    assert body["dependencies"]["soundfont_name"] is not None
    assert body["dependencies"]["supabase_auth_configured"] is True
    assert "X-Request-ID" in response.headers


def test_capabilities_endpoint_lists_all_job_types_and_honest_readiness(client):
    response = client.get("/api/v1/capabilities")
    assert response.status_code == 200
    body = response.json()

    assert body["phase"] == "Phase 5.2 Run 3 - Full AI Accompaniment, Vocal Mixing, Mastering & Export"
    assert body["limits"]["realistic_sample_playback_required"] is True
    assert body["limits"]["target_internal_sample_rate_hz"] == 44100

    supported_formats = {fmt["format"] for fmt in body["supported_formats"]}
    assert supported_formats == {"wav", "mp3", "flac", "m4a", "aac", "ogg", "webm"}

    job_types_by_name = {item["job_type"]: item for item in body["job_types"]}
    expected_job_types = {jt.value for jt in JobType}
    assert set(job_types_by_name.keys()) == expected_job_types

    # Run 3 integrates audio_analysis, pitch_extraction, accompaniment_generation, and audio_rendering;
    # source_separation, music_transcription, and instrument_detection remain honestly unintegrated.
    ready_in_run_3 = {
        "audio_analysis",
        "pitch_extraction",
        "accompaniment_generation",
        "audio_rendering",
    }
    for jt in expected_job_types:
        if jt in ready_in_run_3:
            assert job_types_by_name[jt]["status"] == "ready"
            assert job_types_by_name[jt]["model_integrated"] is True
            assert job_types_by_name[jt]["active_provider"] is not None
        else:
            assert job_types_by_name[jt]["status"] == "awaiting_model_integration"
            assert job_types_by_name[jt]["model_integrated"] is False

    interfaces = {item["interface_name"]: item for item in body["processing_interfaces"]}
    assert len(interfaces) == 10
    assert interfaces["AudioIngestionInterface"]["readiness"] == "implemented"
    assert interfaces["AudioDecodingInterface"]["readiness"] == "implemented"
    assert interfaces["AudioAnalysisInterface"]["readiness"] == "implemented"
    assert interfaces["PitchExtractionInterface"]["readiness"] == "implemented"
    assert interfaces["MIDIProcessingInterface"]["readiness"] == "implemented"
    assert interfaces["InstrumentPlaybackInterface"]["readiness"] == "implemented"
    assert interfaces["MixingAndRenderingInterface"]["readiness"] == "implemented"
    assert interfaces["SourceSeparationInterface"]["readiness"] == "interface_only"
    assert interfaces["TranscriptionInterface"]["readiness"] == "interface_only"
    assert interfaces["MusicXMLGenerationInterface"]["readiness"] == "interface_only"


def test_instruments_endpoint_reports_six_families_and_verified_soundfont(client):
    response = client.get("/api/v1/instruments")
    assert response.status_code == 200
    body = response.json()
    assert body["fluidsynth_available"] is True
    assert body["sound_library"]["available"] is True
    assert body["sound_library"]["format"] in {"sf2", "sf3"}
    assert set(body["supported_families"]) == {
        "piano",
        "strings",
        "bass",
        "brass",
        "woodwinds",
        "drums",
    }
    instrument_ids = {item["instrument_id"] for item in body["instruments"]}
    assert {"piano", "strings", "bass", "brass", "woodwinds", "drums"}.issubset(instrument_ids)
