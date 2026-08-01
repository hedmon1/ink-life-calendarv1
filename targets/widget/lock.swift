import WidgetKit
import SwiftUI

// Lock-screen widgets (iOS 16+). The rectangular one shows the SAME 52×80 life
// grid as the home-screen widget, just scaled into the accessory slot (~160×72pt)
// and drawn in the system's monochrome/vibrant mode, so contrast comes from
// opacity rather than hue. Reuses GridProvider / GridEntry from grid.swift.

struct InkLockView: View {
  @Environment(\.widgetFamily) var family
  var entry: GridEntry

  var body: some View {
    let lived = Ink.lived(entry.birthYear, now: entry.date)
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
      HStack(spacing: 8) {
        LockGridCanvas(lived: lived)
          .aspectRatio(CGFloat(Ink.weeksPerYear) / CGFloat(Ink.lifeYears), contentMode: .fit)
        VStack(alignment: .leading, spacing: 1) {
          Text("LIFE IN WEEKS")
            .font(.system(size: 8.5, weight: .semibold, design: .monospaced))
            .widgetAccentable()
          Text("WK \((lived + 1).formatted())")
            .font(.system(size: 13, weight: .medium, design: .monospaced))
          Text("OF \(Ink.totalWeeks.formatted())")
            .font(.system(size: 8.5, weight: .regular, design: .monospaced))
            .foregroundColor(.secondary)
        }
        Spacer(minLength: 0)
      }

    default:
      Text("WK \((lived + 1).formatted())/\(Ink.totalWeeks.formatted())")
        .font(.system(.body, design: .monospaced))
    }
  }
}

/// The full 4,160-week lattice, drawn as crisply as the lock screen allows.
///
/// 80 rows have to fit in ~72pt, so a row is only ~1pt tall. The gap is pinned to
/// exactly one device pixel — the smallest separation that still renders as a line
/// instead of blurring away — and the cells take whatever is left. Cells are drawn
/// as two batched paths rather than 4,160 separate fills.
struct LockGridCanvas: View {
  let lived: Int
  @Environment(\.displayScale) private var scale

  var body: some View {
    Canvas { ctx, size in
      let cols = Ink.weeksPerYear
      let rows = Ink.lifeYears
      let gap = 1.0 / max(scale, 1)
      let cell = min(
        (size.width - CGFloat(cols - 1) * gap) / CGFloat(cols),
        (size.height - CGFloat(rows - 1) * gap) / CGFloat(rows)
      )
      guard cell > 0 else { return }

      let gridW = CGFloat(cols) * cell + CGFloat(cols - 1) * gap
      let gridH = CGFloat(rows) * cell + CGFloat(rows - 1) * gap
      let x0 = (size.width - gridW) / 2
      let y0 = (size.height - gridH) / 2

      var inked = Path()
      var pencil = Path()
      var current: CGRect?

      for i in 0..<(cols * rows) {
        let c = i % cols
        let r = i / cols
        let rect = CGRect(
          x: x0 + CGFloat(c) * (cell + gap),
          y: y0 + CGFloat(r) * (cell + gap),
          width: cell,
          height: cell
        )
        if i < lived {
          inked.addRect(rect)
        } else if i == lived {
          current = rect
        } else {
          pencil.addRect(rect)
        }
      }

      ctx.fill(pencil, with: .color(.white.opacity(0.25)))
      ctx.fill(inked, with: .color(.white.opacity(0.9)))
      if let r = current {
        // this week: the brightest mark, widened so it stays visible at 1pt
        ctx.fill(Path(r.insetBy(dx: -gap, dy: -gap)), with: .color(.white))
      }
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
    .description("Your whole life as a grid, on your lock screen.")
    .supportedFamilies([.accessoryRectangular, .accessoryCircular])
  }
}
