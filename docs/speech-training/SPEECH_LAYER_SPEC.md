# Speech Layer Specification

## Purpose
Define how speech input is captured, represented, and processed.

## Speech Data Model
Speech is treated as performance data, not just text.

### Example
{
  "inputType": "speech",
  "transcript": "...",
  "timing": {
    "timeToStartSpeaking": 2.3,
    "speechDuration": 18.5
  }
}

## Key Metrics
- Latency
- Duration
- Fluency
- Confidence

## Limitations
- Audio analysis may be partial in MVP
- Transcript quality depends on input engine

## Design Principle
Always preserve metadata about speech origin.
