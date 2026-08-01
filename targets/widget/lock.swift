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

/// The life grid at the coarsest useful resolution: one square per quarter.
///
/// The accessory slot gives the grid roughly 162×53pt. One square per *week*
/// (4,160 of them) works out to 0.9pt each — under three device pixels — and the
/// lock screen's vibrancy pass blurs that into a solid haze, which is what it did
/// on device. One square per quarter (13 weeks) is 320 squares at ~4.7pt, which
/// survives the blur and still reads as the same lattice: Ink already groups the
/// main grid into 13-week quarters, so a square here is exactly one of those
/// blocks, and a row is 8 years. Gaps are one device pixel; cells are batched into
/// two paths rather than drawn individually.
struct LockGridCanvas: View {
  let lived: Int
  @Environment(\.displayScale) private var scale

  static let cols = 32
  static let rows = 10 // 320 squares
  static let weeksPerCell = Ink.totalWeeks / (cols * rows) // 13 — one quarter

  var body: some View {
    Canvas { ctx, size in
      let cols = Self.cols
      let rows = Self.rows
      let livedCell = lived / Self.weeksPerCell
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

      let radius = cell * 0.22
      for i in 0..<(cols * rows) {
        let c = i % cols
        let r = i / cols
        let rect = CGRect(
          x: x0 + CGFloat(c) * (cell + gap),
          y: y0 + CGFloat(r) * (cell + gap),
          width: cell,
          height: cell
        )
        let corner = CGSize(width: radius, height: radius)
        if i < livedCell {
          inked.addRoundedRect(in: rect, cornerSize: corner)
        } else if i == livedCell {
          current = rect
        } else {
          pencil.addRoundedRect(in: rect, cornerSize: corner)
        }
      }

      // opacity carries the contrast — the lock screen strips colour
      ctx.fill(pencil, with: .color(.white.opacity(0.3)))
      ctx.fill(inked, with: .color(.white.opacity(0.95)))
      if let r = current {
        // the quarter you're living in — outlined, exactly as the app draws this week
        ctx.stroke(
          Path(roundedRect: r, cornerRadius: radius),
          with: .color(.white),
          lineWidth: max(0.5, cell * 0.2)
        )
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
