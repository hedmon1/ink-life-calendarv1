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
      // same shape as the home-screen widget: header row on top, grid filling the rest
      VStack(alignment: .leading, spacing: 3) {
        HStack(spacing: 5) {
          Text("LIFE IN WEEKS")
            .font(.system(size: 7.5, weight: .semibold, design: .monospaced))
            .widgetAccentable()
          Spacer(minLength: 4)
          Text("WK \((lived + 1).formatted()) / \(Ink.totalWeeks.formatted())")
            .font(.system(size: 7.5, weight: .medium, design: .monospaced))
        }
        .lineLimit(1)
        .minimumScaleFactor(0.7)

        LockGridCanvas(lived: lived)
          .frame(maxWidth: .infinity, maxHeight: .infinity)
      }

    default:
      Text("WK \((lived + 1).formatted())/\(Ink.totalWeeks.formatted())")
        .font(.system(.body, design: .monospaced))
    }
  }
}

/// The same 4,160 weeks as the home-screen widget, reflowed for the lock slot.
///
/// The accessory slot is ~160×72pt — wide and short — while the home grid is tall
/// (52 × 80). Kept at 52 across, each week would be under a point and the lattice
/// would smear into a grey bar. Two years per row (104 × 40) fills the slot's
/// shape instead, roughly doubling the cell size so it still reads as a grid of
/// squares. Gaps are pinned to one device pixel, the finest that renders as a line.
/// Cells are drawn as two batched paths rather than 4,160 separate fills.
struct LockGridCanvas: View {
  let lived: Int
  @Environment(\.displayScale) private var scale

  static let cols = Ink.weeksPerYear * 2 // 104 — two years per row
  static let rows = Ink.lifeYears / 2 // 40

  var body: some View {
    Canvas { ctx, size in
      let cols = Self.cols
      let rows = Self.rows
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
        // this week: the brightest mark, widened so it stays visible at this size
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
