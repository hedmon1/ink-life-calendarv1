import WidgetKit
import SwiftUI

// MARK: - Timeline

struct GridEntry: TimelineEntry {
  let date: Date
  let birthYear: Int
}

struct GridProvider: TimelineProvider {
  func placeholder(in context: Context) -> GridEntry {
    GridEntry(date: Date(), birthYear: Ink.birthYear())
  }

  func getSnapshot(in context: Context, completion: @escaping (GridEntry) -> Void) {
    completion(GridEntry(date: Date(), birthYear: Ink.birthYear()))
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<GridEntry>) -> Void) {
    let now = Date()
    let entry = GridEntry(date: now, birthYear: Ink.birthYear())
    // recompute daily; a new square inks itself at the weekly boundary
    let cal = Calendar.current
    let next = cal.startOfDay(for: cal.date(byAdding: .day, value: 1, to: now) ?? now)
    completion(Timeline(entries: [entry], policy: .after(next)))
  }
}

// MARK: - View

struct InkGridView: View {
  var entry: GridEntry

  var body: some View {
    let lived = Ink.lived(entry.birthYear, now: entry.date)
    let cols = Ink.weeksPerYear
    let rows = Ink.lifeYears

    VStack(alignment: .leading, spacing: 7) {
      HStack {
        Text("YOUR LIFE IN WEEKS")
          .font(.system(size: 8.5, weight: .medium, design: .monospaced))
          .tracking(1.3)
          .foregroundColor(Ink.dim)
        Spacer()
        Text("WK \(lived + 1) / \(Ink.totalWeeks)")
          .font(.system(size: 8.5, weight: .medium, design: .monospaced))
          .tracking(0.6)
          .foregroundColor(Ink.dim)
      }

      Canvas { ctx, size in
        let gap: CGFloat = 1
        let cell = min(
          (size.width - CGFloat(cols - 1) * gap) / CGFloat(cols),
          (size.height - CGFloat(rows - 1) * gap) / CGFloat(rows)
        )
        let gridW = CGFloat(cols) * cell + CGFloat(cols - 1) * gap
        let gridH = CGFloat(rows) * cell + CGFloat(rows - 1) * gap
        let xOff = (size.width - gridW) / 2
        let yOff = (size.height - gridH) / 2

        for r in 0..<rows {
          for c in 0..<cols {
            let i = r * cols + c
            let x = xOff + CGFloat(c) * (cell + gap)
            let y = yOff + CGFloat(r) * (cell + gap)
            let rect = CGRect(x: x, y: y, width: cell, height: cell)
            let path = Path(roundedRect: rect, cornerRadius: cell * 0.22)
            // no prime band — matches the app’s default grid
            switch inkCell(i, lived: lived, prime: false) {
            case .inked:
              ctx.fill(path, with: .color(Ink.ink))
            case .thisWeek:
              ctx.fill(path, with: .color(Ink.bg))
              ctx.stroke(path, with: .color(Ink.ink), lineWidth: 1)
            case .prime:
              ctx.fill(path, with: .color(Ink.gold))
            case .pencil:
              ctx.fill(path, with: .color(Ink.pencil))
            }
          }
        }
      }
      .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
    .padding(14)
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    .widgetBackground(Ink.bg)
  }
}

// MARK: - Widget

struct InkGridWidget: Widget {
  let kind = "InkGridWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: GridProvider()) { entry in
      InkGridView(entry: entry)
    }
    .configurationDisplayName("Life in Weeks")
    .description("Your whole life as a grid — one square inks every week.")
    .supportedFamilies([.systemLarge])
  }
}
