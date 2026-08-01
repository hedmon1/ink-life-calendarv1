import WidgetKit
import SwiftUI

// Lock-screen widgets (iOS 16+): the current year in weeks, mirroring the Year
// widget on the home screen (see index.swift). 52 boxes fit the ~162×53pt
// accessory slot at a legible ~4.8pt each — the full 4,160-week life grid does
// not, which is why that lives on the home screen instead.
//
// Rendered in the system's monochrome/vibrant mode, so contrast comes from
// opacity, not hue. Driven by YearProvider (date only), so it needs nothing from
// the app and ticks a new box every week on its own.

struct InkLockView: View {
  @Environment(\.widgetFamily) var family
  var entry: YearEntry

  var body: some View {
    let s = yearStats(entry.date)

    switch family {
    case .accessoryCircular:
      Gauge(value: s.fraction) {
        Text(String(s.year))
      } currentValueLabel: {
        Text("\(Int((s.fraction * 100).rounded()))")
      }
      .gaugeStyle(.accessoryCircularCapacity)

    case .accessoryRectangular:
      VStack(alignment: .leading, spacing: 4) {
        HStack(spacing: 5) {
          Text(String(s.year))
            .font(.system(size: 14, weight: .bold))
            .widgetAccentable()
          Spacer(minLength: 4)
          Text("\(s.inkedWeeks) / 52 WEEKS")
            .font(.system(size: 8.5, weight: .medium, design: .monospaced))
        }
        .lineLimit(1)
        .minimumScaleFactor(0.7)

        LockYearStrip(inked: s.inkedWeeks)
          .frame(maxWidth: .infinity, maxHeight: .infinity)
      }

    default:
      Text("\(s.inkedWeeks)/52 WEEKS")
        .font(.system(.body, design: .monospaced))
    }
  }
}

/// The 52 weeks of the year as a 26×2 strip — the same shape the Year widget
/// draws, in lock-screen monochrome: filled for weeks done, outlined for the week
/// you're in, faint for the rest.
struct LockYearStrip: View {
  let inked: Int

  var body: some View {
    Canvas { ctx, size in
      let cols = 26
      let rows = 2
      let gapR: CGFloat = 0.3
      let cell = min(
        size.width / (CGFloat(cols) + CGFloat(cols - 1) * gapR),
        size.height / (CGFloat(rows) + CGFloat(rows - 1) * gapR)
      )
      guard cell > 0 else { return }
      let gap = cell * gapR

      let gridW = CGFloat(cols) * cell + CGFloat(cols - 1) * gap
      let gridH = CGFloat(rows) * cell + CGFloat(rows - 1) * gap
      let x0 = (size.width - gridW) / 2
      let y0 = (size.height - gridH) / 2

      let current = min(cols * rows - 1, inked)
      let radius = cell * 0.25

      for i in 0..<(cols * rows) {
        let rect = CGRect(
          x: x0 + CGFloat(i % cols) * (cell + gap),
          y: y0 + CGFloat(i / cols) * (cell + gap),
          width: cell,
          height: cell
        )
        let path = Path(roundedRect: rect, cornerRadius: radius)
        if i == current {
          ctx.stroke(path, with: .color(.white), lineWidth: max(1, cell * 0.18))
        } else if i < inked {
          ctx.fill(path, with: .color(.white.opacity(0.95)))
        } else {
          ctx.fill(path, with: .color(.white.opacity(0.28)))
        }
      }
    }
  }
}

struct InkLockWidget: Widget {
  let kind = "InkLockWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: YearProvider()) { entry in
      InkLockView(entry: entry)
    }
    .configurationDisplayName("Year in Weeks")
    .description("This year as 52 boxes — one inks every week.")
    .supportedFamilies([.accessoryRectangular, .accessoryCircular])
  }
}
