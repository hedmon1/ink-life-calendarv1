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

// fraction of the calendar year elapsed (0…1)
func yearFraction(_ date: Date) -> Double {
  let cal = Calendar.current
  let y = cal.component(.year, from: date)
  guard
    let start = cal.date(from: DateComponents(year: y, month: 1, day: 1)),
    let next = cal.date(from: DateComponents(year: y + 1, month: 1, day: 1))
  else { return 0 }
  let total = next.timeIntervalSince(start)
  let elapsed = date.timeIntervalSince(start)
  return min(1, max(0, elapsed / total))
}

// MARK: - View

struct YearWidgetView: View {
  var entry: YearEntry

  private let bg = Color(red: 0.031, green: 0.035, blue: 0.039)   // #08090a
  private let gold = Color(red: 0.910, green: 0.722, blue: 0.294) // #e8b84b
  private let dim = Color(white: 0.52)
  private let track = Color(white: 0.16)

  var body: some View {
    let f = yearFraction(entry.date)
    let pct = Int((f * 100).rounded())
    let year = Calendar.current.component(.year, from: entry.date)

    VStack(alignment: .leading, spacing: 0) {
      Text(String(year))
        .font(.system(size: 11, weight: .medium, design: .monospaced))
        .tracking(2)
        .foregroundColor(dim)

      Spacer(minLength: 6)

      HStack(alignment: .firstTextBaseline, spacing: 1) {
        Text("\(pct)")
          .font(.system(size: 46, weight: .semibold))
          .foregroundColor(.white)
        Text("%")
          .font(.system(size: 22, weight: .medium))
          .foregroundColor(.white)
      }

      Text("OF THE YEAR GONE")
        .font(.system(size: 8.5, weight: .medium, design: .monospaced))
        .tracking(1.4)
        .foregroundColor(dim)
        .padding(.top, 1)

      Spacer(minLength: 10)

      GeometryReader { geo in
        ZStack(alignment: .leading) {
          Capsule().fill(track)
          Capsule().fill(gold).frame(width: max(4, geo.size.width * f))
        }
      }
      .frame(height: 5)
    }
    .padding(16)
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    .widgetBackground(bg)
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
    .description("How much of the year has passed.")
    .supportedFamilies([.systemSmall, .systemMedium])
  }
}

@main
struct InkWidgetBundle: WidgetBundle {
  var body: some Widget {
    InkYearWidget()
  }
}
