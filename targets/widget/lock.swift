import WidgetKit
import SwiftUI

// Lock-screen widgets (iOS 16+). Small by Apple's design, so instead of the full
// 52×80 grid we show a compact life-in-years grid + week count. Rendered in the
// system's monochrome/vibrant mode, so contrast comes from opacity, not hue.
// Reuses GridProvider / GridEntry from grid.swift.

struct InkLockView: View {
  @Environment(\.widgetFamily) var family
  var entry: GridEntry

  var body: some View {
    let lived = Ink.lived(entry.birthYear, now: entry.date)
    let livedYears = lived / Ink.weeksPerYear
    let frac = Double(lived) / Double(Ink.totalWeeks)

    switch family {
    case .accessoryCircular:
      Gauge(value: frac) {
        Text("LIFE")
      } currentValueLabel: {
        Text("\(Int((frac * 100).rounded()))")
      }
      .gaugeStyle(.accessoryCircularCapacity)

    case .accessoryRectangular:
      VStack(alignment: .leading, spacing: 3) {
        Text("LIFE IN WEEKS")
          .font(.system(size: 9, weight: .semibold, design: .monospaced))
          .widgetAccentable()
        Canvas { ctx, size in
          let cols = 40, rows = 2   // 80 years
          let gap: CGFloat = 1
          let cw = (size.width - CGFloat(cols - 1) * gap) / CGFloat(cols)
          let ch = (size.height - CGFloat(rows - 1) * gap) / CGFloat(rows)
          for r in 0..<rows {
            for c in 0..<cols {
              let yearIndex = r * cols + c
              let x = CGFloat(c) * (cw + gap)
              let y = CGFloat(r) * (ch + gap)
              let rect = CGRect(x: x, y: y, width: cw, height: ch)
              let path = Path(roundedRect: rect, cornerRadius: min(cw, ch) * 0.25)
              ctx.fill(path, with: .color(.white.opacity(yearIndex < livedYears ? 0.95 : 0.22)))
            }
          }
        }
        .frame(height: 16)
        Text("WK \(lived + 1) / \(Ink.totalWeeks)")
          .font(.system(size: 9, weight: .regular, design: .monospaced))
          .foregroundColor(.secondary)
      }

    default:
      Text("WK \(lived + 1)/\(Ink.totalWeeks)")
        .font(.system(.body, design: .monospaced))
    }
  }
}

struct InkLockWidget: Widget {
  let kind = "InkLockWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: GridProvider()) { entry in
      InkLockView(entry: entry)
    }
    .configurationDisplayName("Life in Weeks")
    .description("Weeks lived, on your lock screen.")
    .supportedFamilies([.accessoryRectangular, .accessoryCircular])
  }
}
