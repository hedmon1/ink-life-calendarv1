import WidgetKit
import SwiftUI

// MARK: - Timeline

struct YearEntry: TimelineEntry {
  let date: Date
}

struct YearProvider: TimelineProvider {
  func placeholder(in context: Context) -> YearEntry { YearEntry(date: Date()) }

  func getSnapshot(in context: Context, completion: @escaping (YearEntry) -> Void) {
    completion(YearEntry(date: Date()))
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<YearEntry>) -> Void) {
    let now = Date()
    let cal = Calendar.current
    // refresh at the start of tomorrow (year progress only moves ~0.27%/day)
    let tomorrow = cal.startOfDay(for: cal.date(byAdding: .day, value: 1, to: now) ?? now)
    completion(Timeline(entries: [YearEntry(date: now)], policy: .after(tomorrow)))
  }
}

// MARK: - Year math

struct YearStats {
  let year: Int
  let fraction: Double // 0…1 of the year elapsed
  let inkedWeeks: Int  // completed weeks this year (0…52)
  let daysLeft: Int
}

func yearStats(_ date: Date) -> YearStats {
  let cal = Calendar.current
  let year = cal.component(.year, from: date)
  let dayOfYear = cal.ordinality(of: .day, in: .year, for: date) ?? 1
  let totalDays = cal.range(of: .day, in: .year, for: date)?.count ?? 365
  return YearStats(
    year: year,
    fraction: min(1, max(0, Double(dayOfYear) / Double(totalDays))),
    inkedWeeks: min(52, (dayOfYear - 1) / 7),
    daysLeft: max(0, totalDays - dayOfYear)
  )
}

// MARK: - Pieces

private let indigo = Color(red: 0.369, green: 0.416, blue: 0.824) // #5e6ad2
private let track = Color(white: 0.16)

struct ProgressRing: View {
  let fraction: Double
  let size: CGFloat
  let lineWidth: CGFloat
  let fontSize: CGFloat

  var body: some View {
    ZStack {
      Circle().stroke(track, lineWidth: lineWidth)
      Circle()
        .trim(from: 0, to: fraction)
        .stroke(indigo, style: StrokeStyle(lineWidth: lineWidth, lineCap: .round))
        .rotationEffect(.degrees(-90))
      Text("\(Int((fraction * 100).rounded()))%")
        .font(.system(size: fontSize, weight: .semibold))
        .foregroundColor(.white)
    }
    .frame(width: size, height: size)
  }
}

/// The 52 weeks of the year as a 26×2 strip — filled, outlined (this week), or faint.
struct YearWeekStrip: View {
  let inked: Int

  var body: some View {
    Canvas { ctx, size in
      let cols = 26
      let rows = 2
      let gap: CGFloat = 3
      let cell = min(
        (size.width - CGFloat(cols - 1) * gap) / CGFloat(cols),
        (size.height - gap) / CGFloat(rows)
      )
      let xOff = (size.width - (CGFloat(cols) * cell + CGFloat(cols - 1) * gap)) / 2
      let current = min(51, inked)
      for i in 0..<(cols * rows) {
        let x = xOff + CGFloat(i % cols) * (cell + gap)
        let y = CGFloat(i / cols) * (cell + gap)
        let rect = CGRect(x: x, y: y, width: cell, height: cell)
        let path = Path(roundedRect: rect, cornerRadius: cell * 0.25)
        if i == current {
          ctx.stroke(path, with: .color(indigo), lineWidth: 1.5)
        } else if i < inked {
          ctx.fill(path, with: .color(Ink.ink))
        } else {
          ctx.fill(path, with: .color(Ink.pencil))
        }
      }
    }
  }
}

// MARK: - Views

struct YearWidgetView: View {
  var entry: YearEntry
  @Environment(\.widgetFamily) var family

  var body: some View {
    let s = yearStats(entry.date)
    if family == .systemMedium {
      VStack(alignment: .leading, spacing: 0) {
        HStack(alignment: .firstTextBaseline) {
          Text(String(s.year))
            .font(.system(size: 24, weight: .bold))
            .foregroundColor(.white)
          Spacer()
          Text("THE YEAR IN INK")
            .font(.system(size: 8.5, weight: .medium, design: .monospaced))
            .tracking(1.6)
            .foregroundColor(Ink.dim)
        }

        Spacer(minLength: 8)

        HStack(spacing: 16) {
          ProgressRing(fraction: s.fraction, size: 54, lineWidth: 7, fontSize: 15)
          VStack(alignment: .leading, spacing: 4) {
            HStack(alignment: .firstTextBaseline, spacing: 5) {
              Text("\(s.inkedWeeks)")
                .font(.system(size: 26, weight: .bold))
                .foregroundColor(.white)
              Text("/ 52 WEEKS")
                .font(.system(size: 10, weight: .medium, design: .monospaced))
                .tracking(1)
                .foregroundColor(Ink.dim)
            }
            Text("\(s.daysLeft) DAYS LEFT")
              .font(.system(size: 8.5, weight: .medium, design: .monospaced))
              .tracking(1.2)
              .foregroundColor(Ink.dim)
          }
          Spacer(minLength: 0)
        }

        Spacer(minLength: 10)

        YearWeekStrip(inked: s.inkedWeeks)
          .frame(height: 21)
      }
      .padding(16)
      .frame(maxWidth: .infinity, maxHeight: .infinity)
      .widgetBackground(Ink.bg)
    } else {
      VStack(spacing: 8) {
        HStack {
          Text(String(s.year))
            .font(.system(size: 15, weight: .bold))
            .foregroundColor(.white)
          Spacer()
        }
        Spacer(minLength: 0)
        ProgressRing(fraction: s.fraction, size: 64, lineWidth: 8, fontSize: 18)
        Spacer(minLength: 0)
        Text("\(s.inkedWeeks) / 52 WEEKS")
          .font(.system(size: 8.5, weight: .medium, design: .monospaced))
          .tracking(1.2)
          .foregroundColor(Ink.dim)
      }
      .padding(14)
      .frame(maxWidth: .infinity, maxHeight: .infinity)
      .widgetBackground(Ink.bg)
    }
  }
}

// containerBackground on iOS 17+, plain background below it
extension View {
  @ViewBuilder
  func widgetBackground(_ color: Color) -> some View {
    if #available(iOS 17.0, *) {
      self.containerBackground(color, for: .widget)
    } else {
      self.background(color)
    }
  }
}

// MARK: - Widget

struct InkYearWidget: Widget {
  let kind = "InkYearWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: YearProvider()) { entry in
      YearWidgetView(entry: entry)
    }
    .configurationDisplayName("Year Progress")
    .description("The year in ink — weeks lived, days left.")
    .supportedFamilies([.systemSmall, .systemMedium])
  }
}

@main
struct InkWidgetBundle: WidgetBundle {
  var body: some Widget {
    InkYearWidget()
    InkGridWidget()
    InkLockWidget()
  }
}
